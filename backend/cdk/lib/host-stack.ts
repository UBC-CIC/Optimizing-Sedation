import { Stack, StackProps, aws_elasticloadbalancingv2, aws_certificatemanager,  CfnParameter} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecspatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as secretmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export class HostStack extends Stack {
    constructor(scope: Construct, id: string, repo: ecr.Repository, props?: StackProps) {
        super(scope, id, props);

        // Create a VPC stack
        // For a region, create upto 2 AZ with a public subset each.
        const vpc = new ec2.Vpc(this, `Dev-vpc`, {
            ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
            maxAzs: 2,
            subnetConfiguration:[
                {
                    name: "public-subnet",
                    subnetType: ec2.SubnetType.PUBLIC
                },
                {
                    name: "private-subnet",
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
                }
            ]
        });

        // Retrieve a secrete from Secret Manager
        // Example of passing secret using command,
        //      aws secretsmanager create-secret --name SedationSecrets --secret-string '{"REACT_APP_CLIENT_SECRET":"string", "REACT_APP_CLIENT_ID":"string"}' --profile <your-profile-name>
        const secret = secretmanager.Secret.fromSecretNameV2(this, "ImportedSecrets", "SedationSecrets");
        
        const accessSecretRole = new iam.Role(this, "SecretAccessRole", {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        })

        secret.grantRead(accessSecretRole);


        // Create WAFvs As web ACL
        // This will attach with ALB later on
        const WAFwebACL = new wafv2.CfnWebACL(this, 'Sedation-WebACL', {
            defaultAction: {
                allow: {}
            },
            scope: 'REGIONAL',
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName:'MetricForWebACLCDK',
                sampledRequestsEnabled: true,
            },
            name: 'Sedation-WAF-WebACL',
            description: 'This WAF-WebACL run on default rule: AWSManagedRulesAmazonIpReputationList, AWSManagedRulesCommonRuleSet, and AWSManagedRulesKnownBadInputsRuleSet.',
            rules: [
                {
                    name: 'AWS-AWSManagedRulesAmazonIpReputationList',
                    priority: 0,
                    statement: {
                        managedRuleGroupStatement: {
                        name:'AWSManagedRulesAmazonIpReputationList',
                        vendorName:'AWS'
                        }
                    },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        sampledRequestsEnabled: true,
                        metricName:'AWS-AWSManagedRulesAmazonIpReputationList',
                    },
                    overrideAction: {
                        none: {}
                    },
                },
                {
                    name: 'AWS-AWSManagedRulesCommonRuleSet',
                    priority: 1,
                    statement: {
                        managedRuleGroupStatement: {
                        name:'AWSManagedRulesCommonRuleSet',
                        vendorName:'AWS'
                        }
                    },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        sampledRequestsEnabled: true,
                        metricName:'AWS-AWSManagedRulesCommonRuleSet',
                    },
                    overrideAction: {
                        none: {}
                    },
                },
                {
                    name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
                    priority: 2,
                    statement: {
                        managedRuleGroupStatement: {
                        name:'AWSManagedRulesKnownBadInputsRuleSet',
                        vendorName:'AWS'
                        }
                    },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        sampledRequestsEnabled: true,
                        metricName:'AWS-AWSManagedRulesKnownBadInputsRuleSet',
                    },
                    overrideAction: {
                        none: {}
                    },
                },
            ]
        });

        // Security group for FargateService
        const fargateSecurityGroup = new ec2.SecurityGroup(this, "Fargate-SecurityGroup", {
            allowAllOutbound: true,
            disableInlineRules: true,
            vpc: vpc,
            securityGroupName: "FargateClusterSecurityGroup",
            description: "Security group for FargateCluster; Allow all outbound rule, but only ALBSecurityGroup for inbound."
        });

        // Security group for ALB
        const ALBSecurityGroup = new ec2.SecurityGroup(this, "ALB-SecurityGroup", {
            allowAllOutbound: false,
            disableInlineRules: true,
            vpc: vpc,
            securityGroupName: "ALBSecurityGroup",
            description: "Security group for ALB; Allow only fargateSecurityGroup outbound rule, and only Https:// for inbound."
        });

        // Set fargateSecurityGroup inbound to ALBSecurityGroup as source at port 3000
        fargateSecurityGroup.addIngressRule(
            ec2.Peer.securityGroupId(ALBSecurityGroup.securityGroupId),
            ec2.Port.tcp(3000),
            'Allow traffic only from ALB'
        );

        // Set ALBSecurityGroup outbound to fargateSecurityGroup as source at port 3000
        ALBSecurityGroup.addEgressRule(
            ec2.Peer.securityGroupId(fargateSecurityGroup.securityGroupId),
            ec2.Port.tcp(3000),
            'Allow traffic only to Fargate Service security group'
        );

        // Set ALBSecurityGroup inbound to any IPv4 at HTTPS (443)
        ALBSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443), 
            'Allow traffic from all IPv4');

        // Create a ALB for ECS Cluster Service
        const ALB = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(this, 'ALB-Fargate-Service', {
            vpc: vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            },
            internetFacing: true,
            loadBalancerName: "FargateService-LoadBalancer",
            securityGroup: ALBSecurityGroup,
        });

        // Create ECS Cluster which use to run Task on ECS Farget instance
        const cluster = new ecs.Cluster(this, "fargateCluster", {
            clusterName: "fargateCluster",
            vpc: vpc,
        });

        // Define general IAM Role for AmazonECSTaskExecutionRolePolicy
        const taskRoleECS = new iam.Role(this, "taskRoleECS", {
            assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
            description: "Role for ECS tasks.",
            managedPolicies:[
                iam.ManagedPolicy.fromManagedPolicyArn(this, "executionPolicyECS", "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy")
            ],
        });

        // Define Task definition for all ECS intance.
        // Running on Fargate.
        const ecsTask = new ecs.TaskDefinition(this, "ecsTask", {
            compatibility: ecs.Compatibility.FARGATE,
            cpu: "1024",
            memoryMiB: "2048",
            runtimePlatform: {
                operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
            },
            family: "IntegralsTaskDefinition",
            executionRole: taskRoleECS, 
            taskRole: taskRoleECS,
        });

        // Create Container to run ECR image
        // Get the latest image of 'repo'
        const containerDefinition = ecsTask.addContainer("taskContainer", {
            image: ecs.ContainerImage.fromEcrRepository(repo, "latest"),
            containerName: "executionContainer",
            secrets: {
                "REACT_APP_CLIENT_SECRET": ecs.Secret.fromSecretsManager(secret, "REACT_APP_CLIENT_SECRET"),
                "REACT_APP_CLIENT_ID": ecs.Secret.fromSecretsManager(secret, "REACT_APP_CLIENT_ID"),
            },
            portMappings: [
                {
                  containerPort: 3000,
                  hostPort: 3000,
                  protocol: ecs.Protocol.TCP
                },
            ],
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: "sedation-log",
                logRetention: RetentionDays.ONE_YEAR,
            }),
        });

        // Certificate to attach to ALB for HTTPS
        // Read parameter from user 
        // aws iam upload-server-certificate --server-certificate-name Sedation-Self-Signed-SSL-Certificate --certificate-body file://public.pem --private-key file://private.pem --profile Sedation_Dev_1
        const CERTIFICATE_ARN = new CfnParameter(this, "certificateARN", {
            type: 'String',
            description: 'ARN of the SSL certificate',
            default: `arn:aws:iam::${process.env.CDK_DEFAULT_ACCOUNT}:server-certificate/Sedation-Self-Signed-SSL-Certificate`
        });

        // Run Application Load Balancer in Fargate as an ECS Service
        // ALB in public subnet, ECS Service in private subnet
        const ALBFargateService = new ecspatterns.ApplicationLoadBalancedFargateService(this, "Host-With-LoadBalancer-Dashboard", {
            cluster: cluster,
            taskDefinition: ecsTask,
            securityGroups: [fargateSecurityGroup],
            serviceName: "Dashboard-Service",
            memoryLimitMiB: 2048,
            cpu: 1024,
            desiredCount: 1,
            taskSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
            },
            openListener: false,
            // ALB Configuration
            loadBalancer: ALB,
            certificate: aws_certificatemanager.Certificate.fromCertificateArn(this, 'https-certificate', CERTIFICATE_ARN.valueAsString),
            listenerPort: 443,
        });

        // Attach WAF to ALB
        const WAFALB = new wafv2.CfnWebACLAssociation(this,'Attach-WAF-ALB', {
            resourceArn: ALBFargateService.loadBalancer.loadBalancerArn,
            webAclArn: WAFwebACL.attrArn,
        });
    }
}

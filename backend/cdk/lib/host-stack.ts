import { Stack, StackProps, CfnParameter, aws_elasticloadbalancingv2, CfnOutput} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecspatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as secretmanager from 'aws-cdk-lib/aws-secretsmanager';
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

interface AwsRegions2PrefixListID {
    [key: string]: string;
}

export class HostStack extends Stack {
    // Array of regions and it prefixListId
    // Collected by https://aws.amazon.com/blogs/networking-and-content-delivery/limit-access-to-your-origins-using-the-aws-managed-prefix-list-for-amazon-cloudfront/
    private readonly awsRegions2PrefixListID: AwsRegions2PrefixListID = {
        'ap-northeast-1': 'pl-58a04531',
        'ap-northeast-2': 'pl-22a6434b',
        'ap-south-1': 'pl-9aa247f3',
        'ap-southeast-1': 'pl-31a34658',
        'ap-southeast-2': 'pl-b8a742d1',
        'ca-central-1': 'pl-38a64351',
        'eu-central-1': 'pl-a3a144ca',
        'eu-north-1': 'pl-fab65393',
        'eu-west-1': 'pl-4fa04526',
        'eu-west-2': 'pl-93a247fa',
        'eu-west-3': 'pl-75b1541c',
        'sa-east-1': 'pl-5da64334',
        'us-east-1': 'pl-3b927c52',
        'us-east-2': 'pl-b6a144df',
        'us-west-1': 'pl-4ea04527',
        'us-west-2': 'pl-82a045eb',
    };
    constructor(scope: Construct, id: string, repo: ecr.Repository, WAFInstance: wafv2.CfnWebACL, props?: StackProps) {
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
            description: "Security group for ALB; Allow only fargateSecurityGroup outbound rule, and only CloudFront for inbound."
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
        
        // Read parameter from user 
        const prefixListIdParam = new CfnParameter(this, "prefixListID", {
            type: 'String',
            description: 'Custome prefix list ID for region that are not in the list',
            default: this.awsRegions2PrefixListID['ca-central-1']
        });

        // Get prefixListId of CloudFront
        // cdk deploy ECSHost --profile Sedation_Dev_1 --parameters ECSHost:prefixListID=pl-82a045eb
        let CFPrefixListId = this.awsRegions2PrefixListID[Stack.of(this).region] ? this.awsRegions2PrefixListID[Stack.of(this).region] : prefixListIdParam.valueAsString;

        // Set ALBSecurityGroup inbound to CloudFront
        ALBSecurityGroup.addIngressRule(
            ec2.Peer.prefixList(CFPrefixListId), 
            ec2.Port.tcp(80), 
            'Allow traffic only from CloudFront');

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
            loadBalancer: ALB,
            openListener: false,
        });

        // Create ALB as CloudFront Origin
        const origin_ALB = new origins.LoadBalancerV2Origin(ALBFargateService.loadBalancer,{
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY
        });
        
        // Create a CloudFront distribution with ALB as origin
        const CFDistribution = new cloudfront.Distribution(this, 'CloudFront-Distribution', {
            defaultBehavior: {
                origin: origin_ALB,
            },
            comment: "CloudFront distribution for ALB as origin",
            webAclId: WAFInstance.attrArn,
        });

        // Add behaviour for /smartAuth to forward all request to origin
        CFDistribution.addBehavior('/smartAuth*', origin_ALB, {
            originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER
        });

        // // Output Messages
        new CfnOutput(this, 'Output-Message', {
            value: `
                CloudFront URL: ${CFDistribution.distributionDomainName}
            `,
        })
    }
}

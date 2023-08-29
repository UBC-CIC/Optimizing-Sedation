import { Stack, StackProps, RemovalPolicy, aws_cloudfront_origins} from 'aws-cdk-lib';
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
import * as s3 from 'aws-cdk-lib/aws-s3';

export class HostStack extends Stack {
    constructor(scope: Construct, id: string, repo: ecr.Repository, props?: StackProps) {
        super(scope, id, props);

        // Create a VPC stack
        // For a region, create upto 2 AZ with a public subset each.
        const vpc = new ec2.Vpc(this, `Dev-vpc`, {
            // cidr: props.cidr,
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

        // Simple security group that allows all outbound traffic
        const securityGroup = new ec2.SecurityGroup(this, "securityGroup", {
            allowAllOutbound: true,
            disableInlineRules: true,
            vpc: vpc,
            securityGroupName: "FargateClusterSecurityGroup",
            description: "Security group for ALB; Allow all outbound rule, but only cloudfront for inbound."
        });

        // // Add an inbound rule to allow incoming traffic on a specific port
        // securityGroup.addIngressRule(
        //     ec2.Peer.anyIpv4(), 
        //     ec2.Port.tcp(80), 
        //     'Allow HTTP traffic');

        
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
            securityGroups: [securityGroup],
            serviceName: "Dashboard-Service",
            memoryLimitMiB: 2048,
            cpu: 1024,
            desiredCount: 1,
            taskSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
            },
            loadBalancerName: "Dashboard-LoadBalancer",
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
            // webAclId: // Add WAF configuration
        });

        // Add behaviour for /smartAuth to forward all request to origin
        CFDistribution.addBehavior('/smartAuth*', origin_ALB, {
            originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER
        });

        // Craete a security group for ALB to only accept CloudFront

        // ALBFargateService.loadBalancer.connections.allowFrom(CFDistribution, ec2.Port.tcp(80), 'Allow request from CloudFront on port 80');

        // Create an S3 bucket to store the access logs for debugging purpose
        // const accessLogsBucket = new s3.Bucket(this, 'AccessLogsBucket');
        // ALBFargateService.loadBalancer.logAccessLogs(accessLogsBucket, "ALB-log");
    }
}

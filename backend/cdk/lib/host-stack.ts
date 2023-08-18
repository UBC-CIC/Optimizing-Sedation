import { Stack, StackProps, CfnOutput, RemovalPolicy, aws_s3_deployment} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecspatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as secretmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as S3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";

import { VpcStack } from './vpc-stack';
import { EcrStack } from './cdk-ecr';

const CONFIG_FILE_PATH = "../../frontend/config/";
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

        // Output the value
        new CfnOutput(this, 'SecretValue', {
            value: secret.toString()
        });

        // Simple security group that allows all outbound traffic
        const securityGroup = new ec2.SecurityGroup(this, "securityGroup", {
            allowAllOutbound: true,
            disableInlineRules: true,
            vpc: vpc,
            securityGroupName: "cdkVpcSecurityGroup",
        });

        // Open a port for public to access the hosting
        // securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'Allow access to dashbaord on IPV4');
        // securityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(3000), 'Allow access to dashbaord on IPV6');

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
            // environment: {
            //     REACT_APP_CLIENT_SECRET: 'eLwgkM_bTUXDgwe4_OdGSS8bUy3oMuIX',
            //     REACT_APP_CLIENT_ID: '87897be1-4596-4143-9927-9904df4abcd0',
            // },
            // environment: secret.secretValue.toJSON(),
            // secrets: {SEDATION_SECRET: ecs.Secret.fromSecretsManager(secret)},
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
        });

        // Run Task on ECS Cluster
        // new tasks.EcsRunTask(this, "HostDashboard", {
        //     cluster: cluster,
        //     launchTarget: new tasks.EcsFargateLaunchTarget(),
        //     taskDefinition: ecsTask,
        //     containerOverrides: [
        //         {
        //             containerDefinition: containerDefinition,
        //         }
        //     ],
        //     subnets: {
        //         subnetType: ec2.SubnetType.PUBLIC
                
        //     },


        //     integrationPattern: sfn.IntegrationPattern.RUN_JOB,
        //     securityGroups: [securityGroup]
        // });

        // new ecs.FargateService(this, "HostDashboard", {
        //     cluster: cluster,
        //     taskDefinition: ecsTask,
        //     assignPublicIp: true,
        //     vpcSubnets: {
        //         subnetType: ec2.SubnetType.PUBLIC
        //     },

        //     securityGroups: [securityGroup]
        // });

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
            // healthCheckGracePeriod: Duration.seconds(150)
        });

        // // Change Health Check Path
        // ALBFargateService.targetGroup.configureHealthCheck({
        //     path: "/",
        // });


        // Create an S3 Bucket for Medical Code Configuration
        const bucket = new s3.Bucket(this, 'ConfigBucket', {
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            versioned: false,
            removalPolicy: RemovalPolicy.DESTROY,
            bucketName: "sedation-configuration-storage"
        });

        // Load default configuration file to S3
        const loadConfigFile = new S3Deployment.BucketDeployment(this, "DeployDefaultConfigFile", {
            sources: [S3Deployment.Source.asset(CONFIG_FILE_PATH)],
            destinationBucket: bucket,
        });
    }
}

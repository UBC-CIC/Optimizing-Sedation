import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";

import { VpcStack } from './vpc-stack';
import { EcrStack } from './cdk-ecr';

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
                    name: "public-subnet-1",
                    subnetType: ec2.SubnetType.PUBLIC
                }
            ]
        });

        // Simple security group that allows all outbound traffic
        const securityGroup = new ec2.SecurityGroup(this, "securityGroup", {
            allowAllOutbound: true,
            disableInlineRules: true,
            vpc: vpc,
            securityGroupName: "cdkVpcSecurityGroup",
        });

        // Open a port for public to access the hosting
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'Allow access to dashbaord on IPV4');
        securityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(3000), 'Allow access to dashbaord on IPV6');

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
            cpu: '256',
            memoryMiB: '1024',
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
            environment: {
                REACT_APP_CLIENT_SECRET: 'eLwgkM_bTUXDgwe4_OdGSS8bUy3oMuIX',
                REACT_APP_CLIENT_ID: '87897be1-4596-4143-9927-9904df4abcd0',
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

        new ecs.FargateService(this, "HostDashboard", {
            cluster: cluster,
            taskDefinition: ecsTask,
            assignPublicIp: true,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            },

            securityGroups: [securityGroup]
        });
    }
}

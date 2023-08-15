#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { EcrStack } from '../lib/cdk-ecr';
import { HostStack } from '../lib/host-stack';

const app = new cdk.App();
// new CdkStack(app, 'CdkStack');

// // Run this stack: cdk deploy DevOrg-dev-network --profile <aws-profile-name>
// const VPCprops = {
//     org: "DevOrg",
//     environment: "dev",
//     cidr: "10.0.0.0/16",
//     maxAzs: 2,
//     env: {
//         account: process.env.CDK_DEFAULT_ACCOUNT,
//         region: process.env.CDK_DEFAULT_REGION,
//     },
// }
// const vpc = new VpcStack(app, `${VPCprops.org}-${VPCprops.environment}-network`, VPCprops);

// Run this stack: cdk deploy Create-ECR --profile <aws-profile-name>
const loadDocker = new EcrStack(app, `Create-ECR`);

// Run this stack: cdk deploy DevOrg-dev-Host --profile <aws-profile-name>
const HostDashboard = new HostStack(app, `ECSHost`, loadDocker.repo, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
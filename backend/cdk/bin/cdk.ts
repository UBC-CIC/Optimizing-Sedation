#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { VpcStack } from '../lib/vpc-stack';
import { EcrStack } from '../lib/cdk-ecr';

const app = new cdk.App();
// new CdkStack(app, 'CdkStack');

// Run this stack: cdk deploy DevOrg-dev-network --profile <aws-profile-name>
const VPCprops = {
    org: "DevOrg",
    environment: "dev",
    cidr: "10.0.0.0/16",
    maxAzs: 2,
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
}
const vpc = new VpcStack(app, `${VPCprops.org}-${VPCprops.environment}-network`, VPCprops);

// Run this stack: cdk deploy DevOrg-dev-ECR --profile <aws-profile-name>
const ECRprops = {
    org: "DevOrg",
    environment: "dev",
}
const loadDocker = new EcrStack(app, `${ECRprops.org}-${ECRprops.environment}-ECR`, ECRprops);
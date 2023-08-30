#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/cdk-ecr';
import { HostStack } from '../lib/host-stack';
import { WAFStack } from '../lib/WAF-stack';
const app = new cdk.App();
// Create stack for ECR
// Run this stack: cdk deploy Create-ECR --profile <aws-profile-name>
const loadDocker = new EcrStack(app, `Create-ECR`);

// Create stack for ECR
// Run this stack: cdk deploy Create-WAFWebACL --profile <aws-profile-name>
const WAFInstance = new WAFStack(app, `Create-WAFWebACL`, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'us-east-1',
    },
});

// Create stack for hosting
// Run this stack: cdk deploy DevOrg-dev-Host --profile <aws-profile-name>
const HostDashboard = new HostStack(app, `ECSHost`, loadDocker.repo, WAFInstance.WAFwebACL, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    crossRegionReferences: true,
});
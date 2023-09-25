#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EcrStack } from '../lib/cdk-ecr';
import { HostStack } from '../lib/host-stack';

const app = new cdk.App();

// Create stack for ECR
// Run this stack: cdk deploy Create-ECR --profile <aws-profile-name>
const loadDocker = new EcrStack(app, `Create-ECR`);

// Create stack for hosting
// Run this stack: cdk deploy DevOrg-dev-Host --profile <aws-profile-name>
const HostDashboard = new HostStack(app, `ECSHost`, loadDocker.repo, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
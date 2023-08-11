#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { VpcStack } from '../lib/stacks/vpc-stack';

const app = new cdk.App();
// new CdkStack(app, 'CdkStack');

// Tutorial: https://www.youtube.com/watch?v=84OEf_-70eE
const props = {
    org: "CIC",
    environment: "dev",
    cidr: "10.1.0/16",
    maxAzs: 2,
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
}
const vpc = new VpcStack(app, `${props.org}-${props.environment}-network`, props);
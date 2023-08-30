import { RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

export class WAFStack extends Stack {
    public readonly WAFwebACL: wafv2.CfnWebACL;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create WAFvs As web ACL using AWSManagedRulesCommonRuleSet
        // More info on https://aws.amazon.com/blogs/devops/easily-protect-your-aws-cdk-defined-infrastructure-with-aws-wafv2/
        this.WAFwebACL = new wafv2.CfnWebACL(this, 'Sedation-WebACL', {
            defaultAction: {
                allow: {}
            },
            scope: 'CLOUDFRONT',
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
    }
}


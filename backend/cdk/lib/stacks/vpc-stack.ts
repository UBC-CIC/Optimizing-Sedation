import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

// Create a VPC props interface
export interface VpcProps extends StackProps {
    org: string,
    environment: string,
    cidr: string,
    maxAzs: number
}
export class VpcStack extends Stack {
    public readonly vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props: VpcProps) {
        super(scope, id, props);

        // Create a VPC stack
        this.vpc = new ec2.Vpc(this, `${props.org}-${props.environment}-vpc`, {
            cidr: props.cidr,
            maxAzs: props.maxAzs,
            subnetConfiguration:[
                {
                    name: "public-subnet-1",
                    subnetType: ec2.SubnetType.PUBLIC
                }
            ]
        });
    }
}

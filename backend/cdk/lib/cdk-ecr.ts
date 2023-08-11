import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as assets from 'aws-cdk-lib/aws-ecr-assets';

// Create a ECR props interface
export interface EcrProps extends StackProps {
    org: string,
    environment: string,
}

export class EcrStack extends Stack {
    constructor(scope: Construct, id: string, props: EcrProps) {
        super(scope, id, props);

        // Create an ECR repository
        const repo = new ecr.Repository(this, `${props.org}-${props.environment}-ecr`, {
            repositoryName: `docker-repo`
        });
    }
}


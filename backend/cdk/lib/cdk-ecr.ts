import { RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class EcrStack extends Stack {
    public readonly repo: ecr.Repository;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create an ECR repository
        this.repo = new ecr.Repository(this, `repository`, {
            repositoryName: `docker-repo`,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteImages: true,
        });
    }
}


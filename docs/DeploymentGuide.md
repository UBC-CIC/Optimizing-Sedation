# Requirements

Before you deploy, you must have the following installed on your device:

- [git](https://git-scm.com/downloads)
- [git lfs](https://git-lfs.com/)
- [AWS Account](https://aws.amazon.com/account/)
- [GitHub Account](https://github.com/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/cli.html)

If you are on a Windows device, it is recommended to install the [Windows Subsystem For Linux](https://docs.microsoft.com/en-us/windows/wsl/install), which lets you run a Linux terminal on your Windows computer natively. Some of the steps will require its use. [Windows Terminal](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701) is also recommended for using WSL.

## Deployment walkthrough

### Table of Contents

- [Requirements](#requirements)
  - [Deployment walkthrough](#deployment-walkthrough)
    - [Table of Contents](#table-of-contents)
  - [Step 1: Clone The Repository](#step-1-clone-the-repository)
  - [Step 2: Deployment](#step-2-deployment)
    - [Step 1: Install Dependencies](#step-1-install-dependencies)
    - [Step 2: Upload the Database secret](#step-2-upload-the-database-secret)
    - [Step 3: CDK Deployment](#step-3-cdk-deployment)
    - [Extra: Taking down the deployed stacks](#extra-taking-down-the-deployed-stacks)
    - [Step 4: Uploading the Artifact files for the Deep Learning Pipeline](#step-4-uploading-the-artifact-files-for-the-deep-learning-pipeline)
    - [Step 5: Uploading the syllabus files](#step-5-uploading-the-syllabus-files)
    - [Step 6: Invoking the Deep Learning Pipeline](#step-6-invoking-the-deep-learning-pipeline)
    - [Step 7: Creating a User](#step-7-creating-a-user)
    - [Step 8: Deactivating User Self Sign up](#step-8-deactivating-user-self-sign-up)

## Step 1: Clone The Repository

First, clone the GitHub repository onto your machine. To do this:

1. Create a folder on your computer to contain the project code.
2. For an Apple computer, open Terminal. If on a Windows machine, open Command Prompt or Windows Terminal. Enter into the folder you made using the command `cd path/to/folder`. To find the path to a folder on a Mac, right click on the folder and press `Get Info`, then select the whole text found under `Where:` and copy with ⌘C. On Windows (not WSL), enter into the folder on File Explorer and click on the path box (located to the left of the search bar), then copy the whole text that shows up.
3. Clone the github repository by entering the following:

```bash
git clone https://github.com/UBC-CIC/course-flexibility.git
```

The code should now be in the folder you created. Navigate into the root folder containing the entire codebase by running the command:

```bash
cd course-flexibility
```

## Step 2: Deployment

It's time to set up everything that goes on behind the scenes! For more information on how the backend works, feel free to refer to the Architecture Deep Dive, but an understanding of the backend is not necessary for deployment.

### Step 1: Install Dependencies

The first step is to get into the backend folder. Assuming you are currently still inside the root folder `Optimizing-Sedation/`, this can be done with the following commands:

```bash
cd back_end/cdk
```

Now that you are in the backend directory, install the core dependencies with the following command:

```bash
npm install
```

### Step 2: Upload Secrets

To store application secrets such as client id and client secrets, we are going to use AWS Secret Manager. Run the following command and make sure to change information that are in <>.

```bash
aws secretsmanager create-secret 
    --name SedationSecrets 
    --secret-string '{"REACT_APP_CLIENT_SECRET":"<Your-Sandbox-Client-Secret>", "REACT_APP_CLIENT_ID":"<Your-Sandbox-Client-ID>"}' 
    --profile <Your-profile-name>

```

### Step 3: CDK Deployment

Initialize the CDK stacks (required only if you have not deployed this stack before). Note this CDK deployment was tested in `ca-central-1` region only.

```bash
cdk synth --profile your-profile-name
```

You may choose to run the following command to deploy the stacks all at once. Please replace `your-profile-name` with the appropriate AWS profile used earlier:

For CDK deployment, we are going to do the following:
1. Create Elastic Container Registry (ECR) name 'docker-repo'
2. Create Docker image and push to ECR
3. Create a stack for Web Application Firewall (WAF)
4. Create a stack for hosting

Make sure to fill necessary infomation in the <>. 

Most of the commands assume you are in ```Optimizing-Sedation/backend/cdk/``` directory unless the instruction says to change the directory.

#### 1. Create Elastic Container Registry (ECR)

This will create a repository call 'docker-repo'. It is important to not change this name since the script in step 2 will need that.

First, initialize CDK stacks at based on your region (only require for if you have not deploy any resources yet).

NEED TO CONFIRM 

```bash
cdk bootstrap aws://<YOUR_AWS_ACCOUNT_ID>/<YOUR_AWS_ACCOUNT_REGION> --profile <your-profile-name>
```

Then, run the following command to create an ECR repository.

```bash
cdk deploy Create-ECR --profile <aws-profile-name>
```
#### 2. Push Docker Image to ECR

Once a repository is created, we can create and push Docker images. Luckily, this is done for you. You can check in the ```Optimizing-Sedation/backend/scripts/push_image.sh``` for more detail.

To run a script file, you might need to change file mode to execution mode.

```bash
chmod +x ../scripts/push_image.sh
```

Now, let create Docker image and push to ECR. Make sure to change everything in the <>.

```bash
../scripts/push_image.sh <aws-profile-name> <aws-region> <aws-account-number> 
```

Example, 

```bash
../scripts/push_image.sh Sedation_Dev_1 ca-central-1 0123456789
```
Note: you can reuse this file to push to ECR everytime you make changes on the dashboard and make those changes live.

#### 3. Create a stack for Web Application Firewall (WAF)
This step will create a Web Application Firewall (WAF) to secure the dashboard from attacks.

Due to the limitation of CDK, we create another stack for this because we need to launch this stack from 'us-east-1' region.
More detail on the limite of CDK WAF could be found at https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_wafv2.CfnWebACL.html#scope.

First initialize CDK stacks at 'us-east-1' region (only require for if you have not deploy any resources yet).

NEED TO CONFIRM 

```bash
cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/us-east-1 --profile <your-profile-name>
```

Then deploy Create-WAFWebACL stack, 

```bash 
cdk deploy Create-WAFWebACL --profile <aws-profile-name>
```

You can confirm your deployment in AWS Console: AWS WAF > Web ACLs. Make sure you select 'Global (CloudFront)' on top right corner.


#### 4. Create Host Stack

This step will create a CloudFormation stack to host the dashboard on ECS. Assume you are in ```Optimizing-Sedation/backend/cdk/``` directory. This will take some time.

Based on the network diagram, the ALB's security group has an inbound rule only from CloudFront. To do this, we filter security group source by prefix of CloudFront. Table below shows each region and its corresponding prefix list ID of CloudFront. 

| AWS Region       | Prefix List ID |
|------------------|----------------|
| ap-northeast-1   | pl-58a04531    |
| ap-northeast-2   | pl-22a6434b    |
| ap-south-1       | pl-9aa247f3    |
| ap-southeast-1   | pl-31a34658    |
| ap-southeast-2   | pl-b8a742d1    |
| ca-central-1     | pl-38a64351    |
| eu-central-1     | pl-a3a144ca    |
| eu-north-1       | pl-fab65393    |
| eu-west-1        | pl-4fa04526    |
| eu-west-2        | pl-93a247fa    |
| eu-west-3        | pl-75b1541c    |
| sa-east-1        | pl-5da64334    |
| us-east-1        | pl-3b927c52    |
| us-east-2        | pl-b6a144df    |
| us-west-1        | pl-4ea04527    |
| us-west-2        | pl-82a045eb    |


If your default region is on the table, then use the command below.

```bash
cdk deploy DevOrg-dev-Host --profile <aws-profile-name>
```
Example,

```bash
cdk deploy ECSHost --profile profile1
```

If your default region is not on the table, you first need to find your predix list ID and then run the command below. This page will tell you how find your prefix list ID: https://aws.amazon.com/blogs/networking-and-content-delivery/limit-access-to-your-origins-using-the-aws-managed-prefix-list-for-amazon-cloudfront/

```bash
cdk deploy DevOrg-dev-Host --profile <aws-profile-name> --parameters ECSHost:prefixListID=<your-prefix-list-id>
```

Example,

```bash
cdk deploy ECSHost --profile profile1 --parameters ECSHost:prefixListID=pl-82a045eb
```

### Extra: Taking down the deployed stacks

To take down the deployed stack for a fresh redeployment in the future, navigate to AWS Cloudformation, click on the stack(s) and hit Delete. Please wait for the stacks in each step to be properly deleted before deleting the stack downstream. The deletion order is as followed:

1. `Create-ECR`
2. `ECSHost`

To delete ECR repository, navigate to ECR and select 'docker-repo' to delete.

To delete Secret Manager, navigate to Secret Manager and select 'SedationSecrets' to delete.
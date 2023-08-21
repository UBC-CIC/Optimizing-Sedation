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
3. Create a stack for hosting

#### 1. Create Elastic Container Registry (ECR)

This will create a repository call 'docker-repo'. It is important to not change this name since the script in step 2 will need that.

Make sure to add your profile name in the <aws-profile-name>.

```bash
cdk deploy Create-ECR --profile <aws-profile-name>
```
#### 2. Push Docker Image to ECR

Once a repository is created, we can create and push Docker images. Luckily, this is done for you. You can check in the ```Optimizing-Sedation/backend/scripts/push_image.sh``` for more detail.

Assume you are in ```Optimizing-Sedation/backend/cdk/``` directory. 

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

#### 3. Create Host Stack

This step will create a CloudFormation stack to host the dashboard on ECS. Assume you are in ```Optimizing-Sedation/backend/cdk/``` directory.

Make sure to add your profile name in the <>. This will take some time.

```bash
cdk deploy DevOrg-dev-Host --profile <aws-profile-name>
```

### Extra: Taking down the deployed stacks

To take down the deployed stack for a fresh redeployment in the future, navigate to AWS Cloudformation, click on the stack(s) and hit Delete. Please wait for the stacks in each step to be properly deleted before deleting the stack downstream. The deletion order is as followed:

1. `Create-ECR`
2. `ECSHost`

To delete ECR repository, navigate to ECR and select 'docker-repo' to delete.

To delete Secret Manager, navigate to Secret Manager and select 'SedationSecrets' to delete.
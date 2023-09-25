# Optimizing Sedation

This is a proof of concept that demonstrates the possibility of the specialized clinical nurse’s work to be completed more efficiently to optimize each sedation for patients.
For more information visit the [CIC Website](https://cic.ubc.ca/).

| Index                                               | Description                                             |
| :-------------------------------------------------- | :------------------------------------------------------ |
| [High Level Architecture](#high-level-architecture) | High level overview illustrating component interactions |
| [User Guide](#user-guide)                           | The working solution                                    |
| [Developer Guide](#user-guide)                      | Information for further developers                      |
| [Test Data Deployment Guide](#test-data-deployment-guide)                      | Information for testing the application                 |
| [Directories](#directories)                         | Project general directory structure                     |
| [Changelog](#changelog)                             | Any changes post publish                                |
| [Credits](#credits)                                 | Meet the team behind the solution                       |
| [License](#license)                                 | License details                                         |

## High Level Architecture

The following architecture diagram illustrates the various AWS components utilized to deliver the solution. For an in-depth explanation of the frontend and backend stacks, refer to the [Architecture Design](docs/Network.md).

![Alt text](docs/assets/Architecture-Diagram-Simplify.png)

## User Guide

For instructions on how to navigate the web app interface, refer to the [Web App User Guide](docs/UserGuide.md).

## Developer Guide

For instructions on how to develop the application, refer to the [Deployment Guide](docs/DeploymentGuide.md).

## Test Data Deployment Guide
For instructions on how to test the application, refer to the [Test Data Deployment Guide](docs/TestDataDeployment.md).

## Directories

```
├── backend
│   ├── cdk
│   │   ├── bin
│   │   └── lib
│   └── scripts
├── docs
│   ├── assets
│   │   └── sandbox
│   └── images
├── frontend
│   ├── public
│   └── src
│       ├── DataProcessing
│       ├── components
│       ├── config
│       └── pages
└── testdata
    ├── dataByResource
    └── patient1
```

1. `/backend/cdk`: Contains the deployment code for the app's AWS infrastructure
    - `/bin`: Contains the instantiation of CDK stack
    - `/lib`: Contains the deployment code for all 2 stacks of the infrastructure
2. `/backend/scripts`: Contains script to load Docker image to ECR repository 
3. `/docs`: Contains documentation for the application
4. `/frontend`: Contains the user interface of the application
    - `/src/DataProcessing`: Contains files with functions to filter raw data from the FHIR server
    - `/src/components`: Contains all React components used in the application
    - `/src/config`: Contains configuration files of the application
    - `/src/pages` Contains pages in React 
5. `/testdata`: Contains fake patient data to load into sandbox and test the application
    - `/dataByResource`: Contains test data for individual healthcare code
    - `/patient1`: Contains a patient data from Logica Sandbox

## Changelog
N/A

## Credits

This application was architected and developed by Liam Driscoll and Visal Saosuo, with project assistance by Sophie Mok and Victoria Li. A special thanks to the UBC Cloud Innovation Centre Technical and Project Management teams for their guidance and support.

## License

This project is distributed under the [MIT License](LICENSE).

Licenses of libraries and tools used by the system are listed below:

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Used by the FHIRClient library to handle SMART on FHIR and communication with the FHIR server
- Used by aws-cdk to handle AWS services

[MIT License](LICENSE)
- Used by Material UI library to design user interface

# Networking Specifications

This document explains the networking information for this project.

### Table of Contents:

1. [Smart on FHIR Schema](#1-Smart-on-FHIR-Schedma)
2. [Hosting Network Schema](#2-Hosting-Network-Schema)
3. [Other Info](#3-other-info)

### 1. Smart on FHIR Schema

![Smart on FHIR Schema](assets/Smart-On-FHIR.jpeg)

The diagram above depicts the authorization workflow of Smart on FHIR. There are five major targets of the process: EHR, application authentication, FHIR server, authorization server, and application dashboard. 

The application exposes two paths: 
* **Application Authentication [www.domainName/smartAuth]** - use as an entry point to send the application's secret information (e.g., client id and client secret), redirect URL, and request scope.
* **Application Dashboard [www.domainName/]** - use to display information of a patient.

This application is intended to launch from an EHR not as a standalone app. Therefore, a user would launch the app from an EHR or test sandbox like Cerner, Smart Launcher, and Logica. 

### 2. Hosting Network Schema
![Hosting Network Schema](assets/Architecture-Diagram-Simplify.png)

The diagram above shows the network architecture of the application using AWS. A user would request an Application Load Balancer (ALB) at port 443 (or HTTPS). The ALB then checks the health status of an ECS task and forwards the request to a container that runs on AWS Fargate. 

When a request is received by the application in a container, it then requests authorization and the FHIR server for data.

### 3. Other Info
**Note**: [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) is the official Infrastructure-as-Code toolchain by AWS that provision cloud resources with CloudFormation behind the scene. Feel free to look in the CDK code under ```Optimizing-Sedation/backend/cdk/```

* 1 VPC with 2 Availability Zones, each availability zone consists of 1 public and 1 private subnet (total of 2 public and 2 private subnets for the entire VPC)
* VPC CIDR range is `10.0.0.0/16`
* 1 NAT Gateway for each of the public subnets.
* 1 Internet Gateway.
* Security groups:
    * AWS ALB - security group with inbound rule only from CloudFront via HTTP, and outbound rule only to AWS ECS Service security group at port 3000.
    * AWS ECS Service - security group with the inbound rule only from AWS ALB security group at port 3000, and outbound rule for all traffic. 
* Application Load Balancer for the ECS Service is created in the public subnets
* Global AWS Web Application Firewall with the following rules
    * AWSManagedRulesAmazonIpReputationList
    * AWSManagedRulesCommonRuleSet
    * AWSManagedRulesKnownBadInputsRuleSet
# Development Document

This document will go over a few implementation details of this application.

## Interfacing with SMART on FHIR compliant EMR servers

This application utilizes the [SMART on FHIR framework](https://docs.smarthealthit.org/) which allows it to interface with SMART on FHIR compliant Electronic Medical Record (EMR) systems. We utilized the [SMART Client JS library](http://docs.smarthealthit.org/client-js/) to help us interface and securely launch the application from EMR servers.

- Using the SMART JS Client library, the solution requests authorization from the EMR server. The solution needs to be registered with the EMR server prior to use
 - The following scope permissions (specified in the src/pages/smartAuthRequest.js file) are required for the successful launch of the solution:  

Scope definitions below are referenced from [Cerner's SMART on FHIR tutorial](https://engineering.cerner.com/smart-on-fhir-tutorial/)

|Scope| Description|
|:----------------|:-----------|
|  openid, profile        |     Permission to retrieve information about the current logged-in user.    | 
|  launch        |   Permission to obtain launch context from an EHR.      |
|  online_access        |  Permission to request a refresh token to obtain a new access token to replace an expired on. Remains usable as along as user remains online.    |
|  patient/Patient.read, patient/Observation.read, patient/Procedure.read, patient/Immunization.read, patient/MedicationRequest.read/ patient/Condition.read, patient/DiagnosticRequest.read        | Permission to read the relevant resources for the current patient.    |


- After successful authorization with the EMR, a FHIR client instance is initialized within the context of the current patient. The solution then launches and starts loading.
- The FHIR client is then used to query patient information from the following FHIR Resources on the EMR server: 

|Resource| Information Obtained|
|:----------------|:-----------|
|  Patient        |     patient personal details (name, age, address, etc.)    | 
|  Observation        |   lab data, vitals (blood pressure, heart rate, etc.), imaging, social history, clinical assessment      |
|  Procedure        |  surgical procedures, diagnostic procedures    |
|  Immunization        | vaccinations    |
|  MedicationRequest        |  prescriptions   |
|  DiagnosticReport        |   laboratory, pathology, and imaging reports        |
|  Condition        |     conditions, problems, diagnosises     |

## General Design

- The solution was designed as a web application using the [ReactJS](https://reactjs.org/) framework on NodeJS.
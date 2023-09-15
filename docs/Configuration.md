## Configuration
This document explains how to use the app's configuration file.

The configuration file `config.json` can be found in the folder `Optimizing-Sedation/frontend/src/config/`. 

There are several settings that you can configure within this file. 

### Table of Contents
- [General Configuration](#general-configuration)
    - [Launch Mode](#launch-mode)
    - [Maximum Size](#maximum-size)
    - [Sandbox](#sandbox)

## General Configuration

### Launch Mode
The launch mode of the application can be configured. The launch mode be set to either `PUBLIC` or `PRIVATE`, depending on the type of app that is being launched. Changing this setting will change the way the app is launched. If the launch mode is set to `PRIVATE`, a `CLIENT SECRET` will need to be provided. 

To change the launch mode modify the `generalConfig.launchMode` property within the `config.json` file. 

### Maximum Size 
The maximum size of data that can be used in the API requests can be configured. This can be useful since API requests have a maximum size limit that can be handled. So this property can be configured to avoid any errors related to exceeding the request size limit. The size is in bytes.

To change the maximum request size modify the `generalConfig.maxSizeInByte` property within the `config.json` file. 


### Sandbox
There is a sandbox property that can be modified based on which sandbox the app is using. Sandboxes have different behaviours, so changing the app behaviours accordingly can help avoid errors. The sandbox property can be set to `CERNER`, `LOGICA`, or `SMART_LAUNCHER`.

To change the sandbox modify the `generalConfig.sandbox` property within the `config.json` file.


## Search Codes
To populate the dashboard, the application uses medical codes to search for relevant data. 

Modifying this section of the config file will result in changes to the table on the dashboard. Each object in the `searchCodes` array corresponds to a row in the table. The `searchCodes` property can be used to add, remove, or modify rows in the table. The following are the different properties that can be changed. 

To add a new row to the table on the dashboard, a new object containing all of the below properties must be created. Similarly, to delete a row from the table on the dashboard, the rows corresponding object must be deleted. 

### Name
This property specifies the name of the medical assessment. This name is displayed in the `Type of Assessment` column of the table on the dashboard. 

### Coding
The coding property contains both the code system and the codes themselves. 

#### System
This property specifies the code system that the codes are part of. This is used to only search the corresponding codes within the specified system.

#### Codes
This property is an array of codes that are used to search for data. If a piece of data has a code that matches a code in the array, then the information will be processed and displayed in the corresponding table row on the dashboard.

### Resources
This property is an array of resources that will be searched through. Changing this array will change which resources the codes will search through for data.
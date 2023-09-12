import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';
import config from '../config/config.json';

// Components
import SideBar from '../components/sideBar';
import SearchBar from '../components/searchBar';
import PatientTable from '../components/table';
import LoadMoreDataPopUp from '../components/med_diag_popup';
import ErrorDisplay from '../components/ErrorDisplay';

// Material UI
import {Grid, Typography} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

// Data processing modules
import processPatientData from '../DataProcessing/patientProcessing';
import processImmunizationData from '../DataProcessing/immunizationProcessing';
import processMedicationData from '../DataProcessing/medicationProcessing';
import processConditionData from '../DataProcessing/conditionProcessing';
import {processAllObservationData} from '../DataProcessing/observationProcessing';

import processDiagnosticReportData from '../DataProcessing/diagnosticReportProcessing';

// Data structuring
function createPatientData(fullname, MRN, contactFullname, contactNumber){
    return {
        fullname, 
        MRN,
        contactFullname,
        contactNumber
    };
}

// Selector Options
const statusTypes = [
    'No Data',
    'Data Available',
];

const assessmentTypes = ['Labs', 'Vaccinations'].concat(config.searchCodes
                        .map(i => {
                            return i.name;
                        }));

export default function Dashboard(){
    const [clientReady, setClientReady] = useState(false);
    const [text, setText] = useState(undefined);
    const [client, setClient] = useState(null);

    // Fhir Resources state variables
    const [patientData, setPatientData] = useState(null);
    const [ImmunizationData, setImmunizationData] = useState(null);
    const [MedicationData, setMedicationData] = useState(null);
    const [ConditionData, setConditionData] = useState(null);
    const [ObservationData, setObservationData] = useState(null);
    const [LabData, setLabData] = useState(null);
    const [DiagnosticReportData, setDiagnosticReportData] = useState(null);

    // Popup states variables
    const [loadPopup, setLoadPopup] = useState(false);
    const [medDiagData, setMedDiagData] = useState([]);
    const [statusList, setStatusList] = useState(null);
    const [popupTitle, setPopupTitle] = useState(null);

    // Medical Code
    const [totalLOINC_codesData, settotalLOINC_codesData] = useState(null);
    

    const LOINC_codes = config.searchCodes;
    
    // Data stream line State Variables
    const [dataReady, setDataReady] = useState(false);
    // const [patientData, setPatientData] = useState(null);

    // Search Filter State Variables
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type
    const [selectAssessmentType, setSelectAssessmentType] = useState([]);             // Current selection for assessment type
    const [searchInput, setSearchInput] = useState("");

    // Other UI State Variables
    const [errorMessage, setErrorMsg] = useState(undefined); 
    
    useEffect(() => {
        // Wait for authrization status
        FHIR.oauth2.ready().then(onResolve).catch(onErr);
    }, []);

    // Resolver funcitons
    async function onResolve(client) {
        // Server succefully connected
        setClientReady(true);
        setClient(client);

        // FHIR Request Operations
        await client.request(`Patient/${client.patient.id}`).then((patient) => {
            const parsedData = processPatientData(patient)[0];
            
            parsedData.PatientContactInfo = parsedData.PatientContactInfo.replace(/[-()]/g, '');
            if (parsedData.PatientContactInfo != "N/A"){
                parsedData.PatientContactInfo = `(${parsedData.PatientContactInfo.slice(0, 3)}) ${parsedData.PatientContactInfo.slice(3, 6)}-${parsedData.PatientContactInfo.slice(6)}`;
            }
            const patient_dataCleanUp = createPatientData(parsedData.PatientName, parsedData.PatientMRN, parsedData.PatientContactName, parsedData.PatientContactInfo);
            setPatientData(patient_dataCleanUp);
        }).catch(onErr);

        fetchData(`Immunization/?patient=${client.patient.id}`, processImmunizationData, setImmunizationData);
        fetchData(`MedicationRequest/?patient=${client.patient.id}`, processMedicationData, setMedicationData);
        fetchData(`Condition/?patient=${client.patient.id}`, processConditionData, setConditionData);
        fetchData(`DiagnosticReport/?patient=${client.patient.id}`, processDiagnosticReportData, setDiagnosticReportData);
        //fetchData(`Observation/?patient=${client.patient.id}`, processAllObservationData, setObservationData);
        fetchData(`Observation/?patient=${client.patient.id}`, processAllObservationData, setObservationData);
        fetchCodeData(LOINC_codes)
            .then(LOINC_codesData => {
                settotalLOINC_codesData(LOINC_codesData);
            })
            .catch(onErr);
        
        // Fetch data besed on Resource type
        function fetchData(url, processData, setData, accumulatedResults = []) {
            client.request(url).then((Bundle) => {
                    const results = processData(Bundle);
                    accumulatedResults.push(...results); // Append current results to accumulatedResults
        
                    const nextLink = Bundle.link.find(link => link.relation === 'next');
                    if (nextLink) {
                        fetchData(nextLink.url, processData, setData, accumulatedResults); // Recursive call with accumulatedResults
                    } else {
                        setData(accumulatedResults);
                    }
                })
                .catch(onErr);
        }
        
        // Fetch data besed on Resource types, Medical Code types, and Medical Codes
        function fetchCodeData(LOINC_codes) {
            // Initialize an object to store unique results for each entry
            const uniqueResultsMap = {};
            const sandbox = config.generalConfig.sandbox;
            
            // Promise on all request to FHIR Server
            return Promise.all(LOINC_codes.map(entry => {
                const entryName = entry.name;
                const uniqueResultsSet = [];
        
                return Promise.all(entry.resources.map(resource => {            // Resources could be Observation, MedicalRequest, etc.
                    return Promise.all(entry.coding.map(coding => {             // Code refers to each code system like LOINC, SNOMED CT, etc.

                        // Break coding.codes to smaller chunks
                        const codeChunks = generateSubarray(coding.codes, config.generalConfig.maxSizeInByte);
                        
                        // Search based on each chunks
                        return Promise.all(codeChunks.map(codeChunk =>{
                            let requestString = `${resource}/?patient=${client.patient.id}&`;

                            // Search codes based on specific sandbox
                            if(sandbox === "LOGICA"){
                                if(coding.system === "KEYWORDS"){
                                    requestString += `code:text=${codeChunk}`;  // Any codes that start with or equal the string {codeChunk} (case-insensitive)
                                } else {
                                    requestString += `code=${codeChunk}`;
                                }
                            } else if (sandbox === "CERNER") {
                                if(coding.system === "KEYWORDS"){
                                    return new Promise((resolve, reject) => {
                                        resolve("Cerner doesn't support keyword search.");
                                    });
                                } else {
                                    requestString += `code=${coding.system}|${codeChunk}`;
                                }
                            } else { 
                                // default: "SMART_LAUNCHER"
                                if(coding.system === "KEYWORDS"){
                                    requestString += `code:text=${codeChunk}`;
                                } else {
                                    requestString += `code=${coding.system}|${codeChunk}`;
                                }
                            }

                            return client.request(requestString).then(Bundle => {
                                const results = processAllObservationData(Bundle);
                                // Add unique results to the Set
                                results.forEach(result => {
                                    if(!uniqueResultsSet.find(obj => obj.ObservationID === result.ObservationID)){
                                        uniqueResultsSet.push(result);
                                    }
                                });
                            })
                            .catch(onErr);
                        }));
                    }));
                }))
                .then(() => {
                    // Convert the Set back to an array and store it in the uniqueResultsMap
                    uniqueResultsMap[entryName] = uniqueResultsSet;
                });
            }))
            .then(() => {
                // Return the object containing unique results for each entry
                return uniqueResultsMap;
            });
        }

        setDataReady(true);
    }

    // Error function to handle all errors in the dashbaord
    function onErr(err) {
        if(!err.message.includes("invalid_grant")){
            // Ignore CERNER "invalid_grant" error.
            setClientReady(false);
            setErrorMsg(err.message);
            console.log(err);
        }
    }

    //// Handler Functions////
    async function loadPatientHandler(){
        if(clientReady){
            setText("Loading data...");
            await client.request(`Patient/${client.patient.id}`).then((patient) => {
                setText("Patient name: " + patient.name[0].text + " Patient birthday: " + patient.birthDate);
            }).catch(onErr);
        }
    }

    const statusTypeHandle = (event) => {
        const { target: { value }, } = event;
        setSelectStatusType(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
        );
    };


    const assessmentTypeHandle = (event) => {
        const { target: { value }, } = event;
        setSelectAssessmentType(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
        );
    };

    const searchInputHandle = (event) => {
        setSearchInput(event.target.value);
    };

    //// End of Handler Functions ////

    //// Helper Functions ////
    function getStatusList(tableData){
        if (tableData){
            const uniqueList = new Set(tableData.map(obj => obj.col1));
            return Array.from(uniqueList);
        } else {
            return [];
        }
    }

    // Return an array of subArry where each subArray size <= targetSizeInByte Bytes
    function generateSubarray(arr, targetSizeInByte){
        let subArray = [];
        let startIndex = 0;

        while(startIndex !== arr.length){
            const endIndex = getIndexOfArrayAtCertainSizeInByte(arr, startIndex, targetSizeInByte);
            subArray.push(arr.slice(startIndex, endIndex));
            startIndex = endIndex;
        }

        return subArray;
    }

    // Return an index of the array where size accumulate to <= targetSizeInByte
    //      (i.e., array elements there are targetSizeInByte long is [startIndex, i)) 
    function getIndexOfArrayAtCertainSizeInByte(array, startIndex, targetSizeInByte){
        let currentSize = 0;

        for (let i = startIndex; i < array.length; i++){
            let size_i = (new TextEncoder().encode(JSON.stringify(array[i]))).length;

            if(targetSizeInByte < currentSize + size_i){
                return i;
            }

            currentSize += size_i;
        }

        return array.length;
    }
    //// End of Helper Funtions ////

    //// Global Handlers ////
    const loadMoreMedicationHandler = () => {
        setPopupTitle("Medication Data");
        let counter = 0;
        const dataCleaned = MedicationData.map((row)=>{
            counter++;
            const modified = row.MedicationType.charAt(0).toUpperCase() + row.MedicationType.slice(1);
            return ({id: counter, title: modified, col1: row.MedicationStatus, col2:row.MedicationTime && (row.MedicationTime.split('T'))[0]});
        });

        const statusList_ = getStatusList(dataCleaned);
        setMedDiagData(dataCleaned);
        setStatusList(statusList_);
        setLoadPopup(true);
    }

    const loadMoreDiagnoseHandler = () => {
        setPopupTitle("Diagnostic Data");
        let counter = 0;
        const dataCleaned = ConditionData.map((row)=>{
            counter++;
            const modified = row.ConditionType.charAt(0).toUpperCase() + row.ConditionType.slice(1);
            return ({id: counter, title: modified, col1: row.ConditionStatus, col2:row.ConditionTime && (row.ConditionTime.split('T'))[0] });
        });

        const statusList_ = getStatusList(dataCleaned);
        setMedDiagData(dataCleaned);
        setStatusList(statusList_);
        setLoadPopup(true);
    }

    //// End of Global Handlers ////

    return(
        <div>
            {!clientReady && errorMessage == undefined &&
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'nowrap',
                    height: '100vh',
                    backgroundColor: 'lightcyan',
                    gap: '10px',
                }}>
                    <Typography variant={"h5"}>Welcome to</Typography>
                    <Typography variant={"h4"} fontWeight={100}>Optimizing Sedation Dashboard</Typography>

                    <CircularProgress color="inherit"/>
                    <Typography variant={"subtitle"} color="inherit">Trying to connect to the server.</Typography>

                    <Typography variant={"h6"} color="blue">Make sure to launch the dashboard from an EHR.</Typography>
                </div>
            }

            {clientReady && !dataReady && errorMessage == undefined && 
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'nowrap',
                    height: '100vh',
                    backgroundColor: 'lightcyan',
                    gap: '10px',
                }}>
                    <Typography variant={"h5"}>Welcome to</Typography>
                    <Typography variant={"h4"} fontWeight={100}>Optimizing Sedation Dashboard</Typography>

                    <CircularProgress color="success"/>
                    <Typography variant={"subtitle"} color="green">Fetching data from server.</Typography>

                    <Typography variant={"h6"} color="blue">This might take some time.</Typography>
                </div>
            }

            {clientReady && dataReady && errorMessage == undefined &&
                <Grid container spacing={0}>
                    {/* Left-hand side elements */}
                    <Grid sm={4} xs={12}>
                        <div style={{
                            marginTop: '4vh',
                        }}>
                            <SideBar 
                            patientData = {patientData}
                            MedicationData = {MedicationData}
                            DiagnosticReportData = {ConditionData}
                            ObservationData = {ObservationData}

                            loadMoreMedicationHandler={loadMoreMedicationHandler}
                            loadMoreDiagnoseHandler={loadMoreDiagnoseHandler}
                            />
                        </div>
                    </Grid>

                    {/* Right-hand side elements */}
                    <Grid sm={8} xs={12}>
                        <div style={{
                            marginTop: '4vh',
                        }}>
                            {!loadPopup &&
                            <React.Fragment>
                                <Grid container spacing={0}>
                                    <Grid sm={11} >
                                        <SearchBar 
                                        statusTypeList={statusTypes}
                                        selectStatusType = {selectStatusType}
                                        statusTypeHandle = {statusTypeHandle}

                                        assessmentTypeList={assessmentTypes}
                                        selectAssessmentType = {selectAssessmentType}
                                        assessmentTypeHandle = {assessmentTypeHandle}

                                        searchInput = {searchInput}

                                        searchInputHandle = {searchInputHandle}                                     
                                        />
                                    </Grid>
                                    <Grid sm={1} />

                                    <Grid sm={11} >
                                        <div style={{paddingTop:'2vh'}}>
                                            <div style={{
                                                display: 'flex',
                                                flexFlow: 'row',
                                                alignItems: 'center',
                                                flexWrap: 'nowrap',
                                                justifyContent: 'space-between',
                                                }}>

                                                <h1>Patient Assessment Information</h1>
                                            </div>
                                            
                                            <PatientTable 
                                            fhirData = {[]} 
                                            selectStatusType = {selectStatusType}
                                            selectAssessmentType = {selectAssessmentType}
                                            searchInput = {searchInput}
                                            ImmunizationData = {ImmunizationData}
                                            ObservationData = {ObservationData}
                                            LabData = {DiagnosticReportData}
                                            totalLOINC_codesData = {totalLOINC_codesData}
                                            />
                                        </div>
                                    </Grid>
                                    <Grid sm={1} />

                                    
                                </Grid>
                            </React.Fragment>
                            }
                            {loadPopup && 
                            <LoadMoreDataPopUp
                            parsedTableData = {medDiagData} 
                            loadData = {true}
                            statusList = {statusList}
                            popupTitle = {popupTitle}
                            setLoadPopup = {setLoadPopup}/>
                            }
                        </div>
                    </Grid>
                </Grid>
            }

            {errorMessage != undefined && 
                <ErrorDisplay msg={errorMessage} />
            }
        </div>
    );
}
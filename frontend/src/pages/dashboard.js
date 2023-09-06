import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';
import imported_LOINC_Codes from '../config/codes.json';

// Components
import SideBar from '../components/sideBar';
import SearchBar from '../components/searchBar';
import PatientTable from '../components/table';
import LoadMoreDataPopUp from '../components/med_diag_popup';
import ErrorDisplay from '../components/ErrorDisplay';

// Material UI
import Button from '@mui/material/Button';
import {Grid, Link, Typography} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

// Data processing modules
import processPatientData from '../DataProcessing/patientProcessing';
import processImmunizationData from '../DataProcessing/immunizationProcessing';
import processMedicationData from '../DataProcessing/medicationProcessing';
import processConditionData from '../DataProcessing/conditionProcessing';
import {processObservationData, processAllObservationData} from '../DataProcessing/observationProcessing';

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

const assessmentTypes = ['Labs', 'Vaccinations'].concat(imported_LOINC_Codes
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
    

    const LOINC_codes = imported_LOINC_Codes;
    
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
        // Resolver funcitons
        async function onResolve(client) {
            // Server succefully connected
            setClientReady(true);
            setClient(client);

            // Operations
            await client.request(`Patient/${client.patient.id}`).then((patient) => {
                console.log("Raw Patient Data: ", patient);

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
                .catch(error => {
                    console.error(error);
                });

            function fetchData(url, processData, setData, accumulatedResults = []) {
                client.request(url).then((Bundle) => {
                        const results = processData(Bundle);
                        accumulatedResults.push(...results); // Append current results to accumulatedResults
            
                        const nextLink = Bundle.link.find(link => link.relation === 'next');
                        if (nextLink) {
                            //console.log("Next link: ", nextLink.url);
                            fetchData(nextLink.url, processData, setData, accumulatedResults); // Recursive call with accumulatedResults
                        } else {
                            //console.log("No next link found");
                            //console.log("Total observations: ", accumulatedResults);
                            setData(accumulatedResults);
                        }
                    })
                    .catch(onErr);
            }
            
          
            function fetchCodeData(LOINC_codes) {
                console.log("Codes:  ", LOINC_codes);
                
                // Initialize an object to store unique results for each entry
                const uniqueResultsMap = {};
            
                return Promise.all(LOINC_codes.map(entry => {
                    const entryName = entry.name;
                    const uniqueResultsSet = new Set();
            
                    return Promise.all(entry.resources.map(resource => {            // Resources could be Observation, MedicalRequest, etc.
                        return Promise.all(entry.coding.map(coding => {             // Code refers to each code system like LOINC, SNOMED CT, etc.

                            // Break coding.codes to smaller chunks
                            const codeChunks = generateSubarray(coding.codes, 1000);
                            
                            console.log(entryName, "-codeChunks: ", codeChunks);

                            // Search based on each chunks
                            return Promise.all(codeChunks.map(codeChunk =>{
                                return client.request(`${resource}/?patient=${client.patient.id}&code=${codeChunk}`)
                                .then(Bundle => {
                                    const results = processAllObservationData(Bundle);
            
                                    // Add unique results to the Set
                                    results.forEach(result => {
                                        // if (!uniqueResultsSet.has(result)) {
                                        //     uniqueResultsSet.add(result);
                                        // }
                                        uniqueResultsSet.add(result);
                                    });
                                })
                                .catch(onErr);
                            }));
                        }));
                    }))
                    .then(() => {
                        // Convert the Set back to an array and store it in the uniqueResultsMap
                        uniqueResultsMap[entryName] = Array.from(uniqueResultsSet);
                    });
                }))
                .then(() => {
                    // Return the object containing unique results for each entry
                    return uniqueResultsMap;
                });
            }

            setDataReady(true);
        }

        // Wait for authrization status
        FHIR.oauth2.ready().then(onResolve).catch(onErr);
    }, []);

    function onErr(err) {
        setClientReady(false);
        setErrorMsg(err.message);
        console.log(err);
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
        console.log("statusList_: ", statusList_);
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

/**
 * 
 * Working amount of codes
 * "32864-1", "32865-8", "32866-6", "32867-4", "32868-2", "32869-0", "32871-6", "32874-0", "32875-7", "32876-5", 
            "32877-3", "32878-1", "32879-9", "32880-7", "32881-5", "32882-3", "32883-1", "32888-0", "32889-8", "32890-6", 
            "32891-4", "32892-2", "32894-8", "32895-5", "32898-9", "32899-7", "32900-3", "32901-1", "32902-9", "32904-5", 
            "32906-0", "32907-8", "32908-6", "32910-2", "32911-0", "32913-6", "32914-4", "32915-1", "32916-9", "32917-7", 
            "32918-5", "32919-3", "32920-1", "32921-9", "32922-7", "32923-5", "32924-3", "32925-0", "32926-8", "32927-6", 
            "32928-4", "32929-2", "32930-0", "32931-8", "32932-6", "32933-4", "32934-2", "32935-9", "32936-7", "32937-5", 
            "32938-3", "32939-1", "32940-9", "32941-7", "32942-5", "32945-8", "32946-6", "32947-4", "32948-2", "32949-0", 
            "32950-8", "32951-6", "32952-4", "32953-2", "32954-0", "32955-7", "32956-5", "32957-3", "32958-1", "32959-9", 
            "32960-7", "32961-5", "32962-3", "32963-1", "32964-9", "32965-6", "32966-4", "32967-2", "32968-0", "32969-8", 
            "32970-6", "32971-4", "32972-2", "32973-0", "32975-5", "32976-3", "32977-1", "32978-9", "33992-9", "33993-7", 
            "33994-5", "33995-2", "33996-0", "33997-8", "33998-6", "34000-0", "34001-8", "34002-6", "34003-4", "34004-2", 
            "34005-9", "34006-7", "34007-5", "34009-1", "34010-9", "34011-7", "34012-5", "34013-3", "34014-1", "34015-8", 
            "34016-6", "34017-4", "34021-6", "34024-0", "34025-7", "34026-5", "34028-1", "34029-9", "34030-7", "34031-5", 
            "34032-3", "34033-1", "34034-9", "34035-6", "34036-4", "34037-2", "34038-0", "34039-8", "34040-6", "34041-4", 
            "34042-2", "34043-0", "34044-8", "34045-5", "34047-1", "34048-9", "34049-7", "60601-2", "60602-0", "60603-8", 
            "60604-6", "60605-3", "60606-1", "60607-9"
 */
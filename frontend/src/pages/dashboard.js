import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';
import * as imported_LOINC_Codes from '../DataProcessing/codes/LOINC_codes';

// Components
import SideBar from '../components/sideBar';
import SearchBar from '../components/searchBar';
import PatientTable from '../components/table';
import LoadMoreDataPopUp from '../components/med_diag_popup';
import LoadRawDataDisplay from '../components/loadRawDataDisplay';

// Material UI
import Button from '@mui/material/Button';
import {Grid, Link, Typography} from '@mui/material';

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
    'Not done',
    'Up to date',
    'Done',
    'Seen',
    'Yes',
    'No',
    'Done/Not done',
];

const assessmentTypes = [
    'Labs',
    'Vaccinations',
    'ECG',
    'EEG',
    'ENT',
    'Ophthalmologist',
    'ASD',
    'Previous Sedation',
    'Additional Assessment'
];

// function createPatientMedicalSummaryData(listOfMedications, listOfDiagnoses){
//     if (listOfMedications != null && !Array.isArray(listOfMedications))
//         return null;
    
//     if (listOfDiagnoses != null && !Array.isArray(listOfDiagnoses))
//         return null;
        
//     return {
//         listOfMedications, 
//         listOfDiagnoses
//     };
// }

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

    // View Raw Data states variables
    const [loadRawData, setLoadRawData] = useState(false);

    const [totalLOINC_codesData, settotalLOINC_codesData] = useState(null);
    const LOINC_codesData = {}; // Object to hold state variables

    const LOINC_codes = Object.entries(imported_LOINC_Codes);
    

    

    // Data stream line State Variables
    const [dataReady, setDataReady] = useState(false);
    // const [patientData, setPatientData] = useState(null);


    // Search Filter State Variables
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type
    const [selectAssessmentType, setSelectAssessmentType] = useState([]);             // Current selection for assessment type
    const [searchInput, setSearchInput] = useState("");
    
    useEffect(() => {
        // Resolver funcitons
        async function onResolve(client) {
            // Server succefully connected
            setClientReady(true);
            setClient(client);

            // Operations
            await client.request(`Patient/${client.patient.id}`).then((patient) => {
                //console.log("Raw Patient Data: ", patient);

                const parsedData = processPatientData(patient)[0];
                
                parsedData.PatientContactInfo = `(${parsedData.PatientContactInfo.slice(0, 3)}) ${parsedData.PatientContactInfo.slice(3, 6)}-${parsedData.PatientContactInfo.slice(6)}`;

                const patient_dataCleanUp = createPatientData(parsedData.PatientName, parsedData.PatientMRN, parsedData.PatientContactName, parsedData.PatientContactInfo);
                setPatientData(patient_dataCleanUp);
            }).catch(onErr);

            fetchData(`Immunization/?patient=${client.patient.id}`, processImmunizationData, setImmunizationData);
            fetchData(`MedicationRequest/?patient=${client.patient.id}`, processMedicationData, setMedicationData);
            fetchData(`Condition/?patient=${client.patient.id}`, processConditionData, setConditionData);
            fetchData(`DiagnosticReport/?patient=${client.patient.id}`, processDiagnosticReportData, setDiagnosticReportData);
            //fetchData(`Observation/?patient=${client.patient.id}`, processAllObservationData, setObservationData);
            fetchData(`Observation/?patient=${client.patient.id}`, processAllObservationData, setObservationData);
            settotalLOINC_codesData(fetchCodeData(LOINC_codes));

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

            function fetchCodeData(LOINC_codes){
                LOINC_codes.map(([name, array]) => {
                    client.request(`Observation/?patient=${client.patient.id}&code=${array}`).then((Bundle) => {    
                        LOINC_codesData[`${name}`] = processAllObservationData(Bundle); // Dynamically assign variable
                    }).catch(onErr);
                });
                return LOINC_codesData;
            }

            setDataReady(true);
        }

        // Wait for authrization status
        FHIR.oauth2.ready().then(onResolve).catch(onErr);
    }, []);

    function onErr(err) {
        console.log("Error, ", err);
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
            {clientReady && dataReady &&
            <React.Fragment>
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
                            {!loadPopup && !loadRawData &&
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
                                                <Link onClick={() => {setLoadRawData(true)}}>View Raw Data</Link>
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
                            {!loadPopup && loadRawData && 
                                <LoadRawDataDisplay
                                observationData = {ObservationData}
                                diagnosticData = {DiagnosticReportData}
                                conditionData = {ConditionData}
                                MedicationData = {MedicationData}
                                setLoadRawData = {setLoadRawData}
                                />
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
            </React.Fragment>
            }

            {!clientReady && 
                <h1>Waiting for server to response...</h1>
            }
            
            {!dataReady && 
                <h1>Fetching data from server...</h1>
            }
        </div>
    );
}
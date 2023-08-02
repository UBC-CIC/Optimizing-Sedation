import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';

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
    const [DiagnosticReportData, setDiagnosticReportData] = useState(null);
    const [ObservationData, setObservationData] = useState(null);
    const [ConditionData, setConditionnData] = useState(null);

    // Popup states variables
    const [loadPopup, setLoadPopup] = useState(false);
    const [medDiagData, setMedDiagData] = useState([]);
    const [statusList, setStatusList] = useState(null);
    const [popupTitle, setPopupTitle] = useState(null);

    // View Raw Data states variables
    const [loadRawData, setLoadRawData] = useState(false);
    

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
                console.log("Patient: ", processPatientData(patient));

                const parsedData = processPatientData(patient)[0];
                
                parsedData.PatientContactInfo = `(${parsedData.PatientContactInfo.slice(0, 3)}) ${parsedData.PatientContactInfo.slice(3, 6)}-${parsedData.PatientContactInfo.slice(6)}`;

                const patient_dataCleanUp = createPatientData(parsedData.PatientName, parsedData.PatientMRN, parsedData.PatientContactName, parsedData.PatientContactInfo);
                setPatientData(patient_dataCleanUp);
            }).catch(onErr);

            client.request(`Immunization/?patient=${client.patient.id}`).then((immunization) => {
                const paredData = processImmunizationData(immunization);
                console.log("immunization: ", immunization);
                setImmunizationData(paredData);

            }).catch(onErr);

            client.request(`MedicationRequest/?patient=${client.patient.id}`).then((med) => {
                const paredData = processMedicationData(med);
                console.log("med: ", paredData);
                setMedicationData(paredData);
            }).catch(onErr);

            client.request(`DiagnosticReport/?patient=${client.patient.id}`).then((diagnostic) => {
                const parsedData = processConditionData(diagnostic);
                console.log("diagnostic: ", diagnostic);
                setDiagnosticReportData(parsedData);
            }).catch(onErr);

            client.request(`Observation/?patient=${client.patient.id}`).then((Bundle) => {
                console.log("observation: ", Bundle);
                setObservationData(Bundle);
            }).catch(onErr);

            console.log(patientData, ImmunizationData, MedicationData, DiagnosticReportData, ObservationData);
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
        return tableData.map(obj => obj.col1);
    }

    //// End of Helper Funtions ////

    //// Global Handlers ////
    const loadMoreMedicationHandler = () => {
        setPopupTitle("Medication Data");
        const dataCleaned = MedicationData.map((row)=>{
            const modified = row.MedicationType.charAt(0).toUpperCase() + row.MedicationType.slice(1);
            return ({title: modified, col1: row.MedicationStatus, col2:row.MedicationTime });
        });

        const statusList_ = getStatusList(dataCleaned);
        console.log("statusList_: ", statusList_);
        setMedDiagData(dataCleaned);
        setStatusList(statusList_);
        setLoadPopup(true);
    }

    const loadMoreDiagnoseHandler = () => {
        setPopupTitle("Diagnostic Data");
        const dataCleaned = DiagnosticReportData.map((row)=>{
            const modified = row.MedicationType.charAt(0).toUpperCase() + row.MedicationType.slice(1);
            return ({title: modified, col1: row.MedicationStatus, col2:row.MedicationTime });
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
                            DiagnosticReportData = {DiagnosticReportData}
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
                                            {/* <h1>Hello World, Dashboard!</h1>
                                            <Button variant="outlined" onClick={loadPatientHandler}>Load Patient</Button>
                                            <p>{text}</p> */}
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
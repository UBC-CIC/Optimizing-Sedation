import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';

// Components
import SideBar from '../components/sideBar';
import SearchBar from '../components/searchBar';
import PatientTable from '../components/table';

// Material UI
import Button from '@mui/material/Button';
import {Grid, Typography} from '@mui/material';


// Data structuring
function createPatientData(fullname, MRN, contactFullname, contactNumber){
    return {
        fullname, 
        MRN,
        contactFullname,
        contactNumber
    };
}

export default function Dashboard(){
    const [clientReady, setClientReady] = useState(false);
    const [text, setText] = useState(undefined);
    const [client, setClient] = useState(null);
    
    // Data stream line State Variables
    const [dataReady, setDataReady] = useState(false);
    const [patientData, setPatientData] = useState(null);


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
            console.log(client);
            console.log("Request Patient");
            await client.request(`Patient/${client.patient.id}`).then((patient) => {
                console.log("Patient: ", patient);
                let fullname = "";
                let MRN = "";
                let contactFullname = ""; 
                let contactNumber = "";
                
                for(let i in patient.name){
                    const name = patient.name[i];

                    if(name.use == 'official'){
                        fullname = name.text;
                    }
                }

                if(fullname == ""){
                    fullname = patient.name[0].text;
                }

                for(let i in patient.identifier){
                    const identifier = patient.identifier[i];

                    if(identifier.type.text == 'MRN'){
                        MRN = identifier.value;
                    }
                }
                if(MRN == ""){
                    MRN = patient.identifier[0].value;
                }

                for(let i in patient.contact){
                    const identifier = patient.identifier[i];

                    if(identifier.type.text == 'MRN'){
                        MRN = identifier.value;
                    }
                }
                
                if(patient.contact){
                    contactFullname = patient.contact[0].name.text;
                    contactNumber = patient.contact[0].telecom[0].value;
                    contactNumber = `(${contactNumber.slice(0, 3)}) ${contactNumber.slice(3, 6)}-${contactNumber.slice(6)}`;

                }

                const patient_dataCleanUp = createPatientData(fullname, MRN, contactFullname, contactNumber);
                setPatientData(patient_dataCleanUp);

            }).catch(onErr);

            console.log("Request Observation");
            await client.request(`Observation?patient=${client.patient.id}`).then((mr) => {
                console.log("Observation: ", mr);
            }).catch(onErr);

            console.log("Request Immunizations");
            await client.request(`Immunization?patient=${client.patient.id}`).then((mr) => {
                console.log("Immunizations: ", mr);
            }).catch(onErr);

            console.log("Request DiagnosticReport");
            await client.request(`DiagnosticReport?patient=${client.patient.id}`).then((mr) => {
                console.log("DiagnosticReport: ", mr);
            }).catch(onErr);

            console.log("Request MedicationRequest");
            await client.request(`MedicationRequest?patient=${client.patient.id}`).then((mr) => {
                console.log("MedicationRequest: ", mr);
            }).catch(onErr);

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


    return(
        <div>
            {clientReady && dataReady &&
            <React.Fragment>
                <Grid container spacing={0}>
                    <Grid sm={4} xs={12}>
                        <div style={{
                            marginTop: '4vh',
                        }}>
                            <SideBar 
                            patientData = {patientData}/>
                        </div>
                    </Grid>
                    <Grid sm={8} xs={12}>
                        <div style={{
                            marginTop: '4vh',
                        }}>
                            <Grid container spacing={0}>
                                <Grid sm={11} >
                                    <SearchBar 
                                    selectStatusType = {selectStatusType}
                                    statusTypeHandle = {statusTypeHandle}
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
                                        <h1>Patient Assessment Information</h1>
                                        <PatientTable 
                                        fhirData = {[]} 
                                        selectStatusType = {selectStatusType}
                                        selectAssessmentType = {selectAssessmentType}
                                        searchInput = {searchInput}
                                        />
                                    </div>
                                </Grid>
                                <Grid sm={1} />
                            </Grid>
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
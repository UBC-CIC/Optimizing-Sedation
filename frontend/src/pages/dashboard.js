import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';

// Components
import SideBar from '../components/sideBar';
import SearchBar from '../components/searchBar';

// Material UI
import Button from '@mui/material/Button';
import {Grid} from '@mui/material';

export default function Dashboard(){
    const [clientReady, setClientReady] = useState(false);
    const [text, setText] = useState(undefined);
    const [client, setClient] = useState(null);
    
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
                // console.log("Patient name: ", patient.name[0].text);
                // console.log("Patient birthday: ", patient.birthDate);
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
            
        }

        // Wait for authrization status
        FHIR.oauth2.ready().then(onResolve).catch(onErr);
    }, []);

    function onErr(err) {
        console.log("Error, ", err);
    }

    async function loadPatientHandler(){
        if(clientReady){
            setText("Loading data...");
            await client.request(`Patient/${client.patient.id}`).then((patient) => {
                setText("Patient name: " + patient.name[0].text + " Patient birthday: " + patient.birthDate);
            }).catch(onErr);
        }
    }

    return(
        <div>
            {clientReady && 
            <React.Fragment>
                <Grid container spacing={0}>
                    <Grid sm={4}>
                        <div style={{
                            marginTop: '4vh',
                        }}>
                            <SideBar />
                        </div>
                    </Grid>
                    <Grid sm={8}>
                        <div style={{
                            marginTop: '4vh',
                        }}>
                            <Grid container spacing={0}>
                                {/* <Grid sm={1} /> */}
                                <Grid sm={11} >
                                    <SearchBar />
                                </Grid>
                                <Grid sm={1} />

                                <Grid sm={1} />
                                <Grid sm={10} >
                                    <h1>Hello World, Dashboard!</h1>
                                    <Button variant="outlined" onClick={loadPatientHandler}>Load Patient</Button>
                                    <p>{text}</p>
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
        </div>
    );
}
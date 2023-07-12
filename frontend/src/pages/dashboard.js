import React, { useState } from 'react';
import FHIR from 'fhirclient';

export default function Dashboard(){

    // Resolver funcitons
    async function onResolve(client) {
        console.log("Request Patient");
        await client.request(`Patient/${client.patient.id}`).then((patient) => {
            console.log("Patient name: ", patient.name[0].text);
            console.log("Patient birthday: ", patient.birthDate);
        }).catch(onErr);

        console.log("Request Observation");
        await client.request(`Observation?subject%3APatient=${client.patient.id}`).then((mr) => {
            console.log("Medical Request: ", mr);
        }).catch(onErr);
    }
    
    function onErr(err) {
        console.log("### Error, ", err);
    }

    // Wait for authrization status
    FHIR.oauth2.ready().then(onResolve).catch(onErr);

    return(
        <div>
            <h1>Hello World, Dashboard!</h1>
        </div>
    );
}
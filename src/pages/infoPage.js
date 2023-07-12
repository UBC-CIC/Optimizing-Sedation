import React, { useState } from 'react';
import FHIR from 'fhirclient';

export default function InfoPage(){

    // const [campus, setCampus] = useState("");

    // Resolver funcitons
    function onResolve(client) {
        console.log("Function Resolved!!");

        console.log(client);
        client.request(`Patient/${client.patient.id}`).then((patientBundle) => {
            console.log("patientsBundle: ", patientBundle);
        }).catch(onErr);

        // const patientsBundle = client.request("Patient");
        // console.log("patientsBundle: ", patientsBundle);
    }
    
    function onErr(err) {
        console.log("It's error handler!!");
        console.log("### Error, ", err);
    }

    FHIR.oauth2.ready().then(onResolve).catch(onErr);
   
    return(
        <div>
            <h1>Hello World, Info!</h1>
        </div>
    );
}
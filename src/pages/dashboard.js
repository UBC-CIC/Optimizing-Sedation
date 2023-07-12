import React, { useState } from 'react';
import FHIR from 'fhirclient';

export default function Dashboard(){

    const [campus, setCampus] = useState("");

    FHIR.oauth2.authorize({
        // 'redirectUri': "https://main.d3oba1uo3igtij.amplifyapp.com/info/",
        'redirectUri': "http://localhost:3000/info/", 
        'client_id': '80c9e107-16ca-4806-8a2c-05231c1a8f2f',//'99bfc6f0-4be9-412d-9b7e-71aae429511a',
        'scope':  'patient/Patient.read patient/Observation.read launch online_access openid profile', //'patient/Patient.read patient/Observation.read launch/patient online_access openid profile'
    });

    // FHIR.oauth2.init({
    //     // redirectUri: "/info",
    //     client_id: 'a6b1c3f3-abd2-43d5-8eba-a20cfb16acfe',
    //     scope:  'patient/Patient.read patient/Observation.read launch/patient online_access openid profile',
    //     fhirServiceUrl: 'https://fhir-myrecord.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d'
    // })
    // .then(client => {
    // client.request("Patient").then((res, req) =>{
    //     console.log("FHIR Standalone");
    //     console.log(res);
    // });
    // })

    console.log("FHIR.oauth2.authorize Requested");
   
    return(
        <div>
            <h1>Hello World, Dashboard!</h1>
        </div>
    );
}
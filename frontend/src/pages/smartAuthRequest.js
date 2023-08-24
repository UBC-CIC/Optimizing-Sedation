import React, { useState } from 'react';
import FHIR from 'fhirclient';

export default function SmartAuth(){

    FHIR.oauth2.authorize({
        'redirectUri': '/',
        'clientSecret': process.env.REACT_APP_CLIENT_SECRET,
        'clientId': process.env.REACT_APP_CLIENT_ID,
        'noRedirect': false,
        'scope':  'launch online_access openid profile patient/Patient.read patient/Observation.read patient/DiagnosticReport.read patient/Immunization.read patient/MedicationRequest.read patient/Condition.read',
    });
   
    return(
        <div>
            <h1>SMART Authentication starting point!</h1>
        </div>
    );
}
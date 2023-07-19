import React, { useState } from 'react';
import FHIR from 'fhirclient';

export default function SmartAuth(){

    FHIR.oauth2.authorize({
        'redirectUri': process.env.REACT_APP_REDIRECT_URI, 
        'client_id': process.env.REACT_APP_CLIENT_ID,
        'scope':  'patient/Patient.read patient/Observation.read patient/DiagnosticReport.read patient/Immunization.read patient/MedicationRequest.read patient/Condition.read launch online_access openid profile',
    });
   
    return(
        <div>
            <h1>SMART Authentication starting point!</h1>
        </div>
    );
}
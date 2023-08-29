import React, { useState } from 'react';
import {Typography} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

// FhirClient Library
import FHIR from 'fhirclient';

export default function SmartAuth(){
    const [errorMsg, setErrorMsg] = useState(undefined);

    FHIR.oauth2.authorize({
        'redirectUri': '/',
        // 'clientSecret': process.env.REACT_APP_CLIENT_SECRET,
        'client_id': process.env.REACT_APP_CLIENT_ID,
        'scope':  'patient/Patient.read patient/Observation.read patient/DiagnosticReport.read patient/Immunization.read patient/MedicationRequest.read patient/Condition.read launch online_access openid profile',
    }).catch(err => {
        console.log("/smartAuth error");
        setErrorMsg(err.message);
    });
   
    return(
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

            

            {errorMsg == undefined && 
                <React.Fragment>
                    <CircularProgress color="inherit"/>
                    <Typography variant={"subtitle1"}>Requesting to server for permission.</Typography>
        
                    <Typography variant={"h6"} color="blue">This might take some time.</Typography>
                </React.Fragment>
            }

            {errorMsg != undefined &&
                <React.Fragment>
                    <Typography variant={"h6"}>There is an error,</Typography>
        
                    <Typography variant={"subtitle1"} color="red">{errorMsg}</Typography>
                </React.Fragment>
            }
        </div>
    );
}
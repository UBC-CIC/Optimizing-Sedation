import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import FHIR from 'fhirclient';

// const client = FHIR.client("https://fhir-myrecord.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d");
// client.request("Patient").then((res, req) =>{
//   console.log("FHIR Client");
//   console.log(res);
// });


// FHIR.oauth2.init({
//   // redirectUri: "./",
//   client_id: 'a6b1c3f3-abd2-43d5-8eba-a20cfb16acfe',
//   scope:  'patient/Patient.read patient/Observation.read launch/patient online_access openid profile',
//   // fhirServiceUrl: 'https://fhir-myrecord.cerner.com/dstu2/ec2458f2-1e24-41c8-b71b-0e701af7583d'
// })
// .then(client => {
//   client.request("Patient").then((res, req) =>{
//     console.log("FHIR Standalone");
//     console.log(res);
//   });
// })

// FHIR.oauth2.authorize({
//   'redirectUri': "https://main.d3oba1uo3igtij.amplifyapp.com/info/",// "http://localhost:3000/info/", 
//   'client_id': '80c9e107-16ca-4806-8a2c-05231c1a8f2f',//'99bfc6f0-4be9-412d-9b7e-71aae429511a',
//   'scope':  'patient/Patient.read patient/Observation.read launch online_access openid profile', //'patient/Patient.read patient/Observation.read launch/patient online_access openid profile'
// });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

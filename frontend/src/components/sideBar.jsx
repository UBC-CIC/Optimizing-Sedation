import React, { useState } from 'react';


// Material UI
import {Grid, Typography, Table, TableHead, TableBody, TableRow, TableCell} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

export default function SideBar({patientData, MedicationData, DiagnosticReportData, ObservationData, loadMoreMedicationHandler,loadMoreDiagnoseHandler}){
    const [clientReady, setClientReady] = useState(false);
    const [openMedication, setOpenMedication] = React.useState(false);
    const [openDiagnose, setOpenDiagnose] = React.useState(false);

    const openMedicationHandle = () => {
        setOpenMedication(!openMedication);
    };

    const openDiagnoseHandle = () => {
        setOpenDiagnose(!openDiagnose);
    };

    const style = {
        dropDown: {
            display: 'flex',
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center'
        },

        roundBoxNoHorizontalSpace: {
            padding: '3vh', 
            borderRadius: 10, 
            border: '2px solid #3e92fb', 
            backgroundColor:'#3e92fb', 
            // marginTop: '0.7vh',
            marginBottom: '1vh',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.1)'
        },

        roundBoxDropdownLists: {
            padding: '2vh', 
            borderRadius: 10, 
            border: '2px solid #e7e8eb', 
            backgroundColor:'#e7e8eb', 
            marginTop: '0.7vh',
            marginBottom: '0.7vh',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.1)'
        }
    }

    return(
        <div>
            <Grid container spacing={0}>
                <Grid sm={2} xs={0}/>
                <Grid sm={9} xs={12}>
                    <div style={style.roundBoxNoHorizontalSpace}>
                        <Typography variant={"subtitle1"} component="h6">Patient Name</Typography>
                        <Typography variant={"h5"} component="h6">{patientData.fullname}</Typography>
                    </div>
                </Grid>
                <Grid sm={1} xs={0}/>

                <Grid sm={2} xs={0}/>
                <Grid sm={9} xs={12}>
                    <div style={style.roundBoxNoHorizontalSpace}>
                        <Typography variant={"subtitle1"}>Patient MRN</Typography>
                        <Typography variant={"h5"}>#{patientData.MRN}</Typography>
                    </div>
                </Grid>
                <Grid sm={1} xs={0}/>

                <Grid sm={2} xs={0}/>
                <Grid sm={9} xs={12}>
                    <div style={{
                        marginTop: '10vh'
                    }}>
                        <Typography variant={"subtitle1"}>Contact</Typography>
                        <Typography variant={"h6"}>{patientData.contactFullname}</Typography>
                        <Typography variant={"h6"}>{patientData.contactNumber}</Typography>
                    </div>
                </Grid>
                <Grid sm={1} xs={0}/>

                <Grid sm={2} xs={0}/>
                <Grid sm={9} xs={12}>
                    <div style={{
                        marginTop: '5vh'
                    }}>
                        <Typography variant={"subtitle1"} >Patient Medical Summary</Typography>
                        <div style={style.dropDown} onClick={openMedicationHandle}>
                            <Typography variant={"h6"}>View list of medications</Typography>
                            {openMedication ? <ExpandLess /> : <ExpandMore />}
                        </div>

                        {openMedication && 
                        <div style={style.roundBoxDropdownLists}>
                            {MedicationData && MedicationData.length != 0 &&
                            <ul>
                            {
                                MedicationData
                                .sort((a, b) => a.MedicationStatus.localeCompare(b.MedicationStatus))
                                .map((medication) => {
                                    // const modified = medication.MedicationType.replace(/\s*\(.*?\)/g, '');
                                    const modified = medication.MedicationType.charAt(0).toUpperCase() + medication.MedicationType.slice(1);
                                    return { MedicationType: modified, MedicationStatus: medication.MedicationStatus, MedicationTime: medication.MedicationTime};
                                })
                                .slice(0, 5)
                                .map((med)=>(
                                    <li>{med.MedicationType}
                                        <ul>
                                            <li>Status: {med.MedicationStatus}</li>
                                            <li>Time: {med.MedicationTime && (med.MedicationTime.split('T'))[0]}</li>
                                        </ul>
                                    </li>
                                ))
                            }
                            </ul>
                            }

                            {
                                (MedicationData && MedicationData.length != 0 && MedicationData.length > 5) ? (<Link onClick={loadMoreMedicationHandler}> Load More...</Link>) : (<React.Fragment></React.Fragment>)
                            }

                            {(!MedicationData || MedicationData.length == 0) && (
                                <Typography variant='subtitle1'>No Medication Data From The Last Six Months</Typography>
                            )}
                        </div>}
                    </div>
                </Grid>
                <Grid sm={1} xs={0}/>

                <Grid sm={2} xs={0}/>
                <Grid sm={9} xs={12}>
                    <div style={style.dropDown} onClick={openDiagnoseHandle}>
                        <Typography variant={"h6"}>View list of diagnoses</Typography>
                        {openDiagnose ? <ExpandLess /> : <ExpandMore />}
                    </div>

                    {openDiagnose && 
                    <div style={style.roundBoxDropdownLists}>
                        {DiagnosticReportData && DiagnosticReportData.length != 0 && (<ul>
                        {
                            DiagnosticReportData
                            .sort((a, b) => a.DiagnosticReportTime.localeCompare(b.DiagnosticReportTime))
                            .map((dia) => {
                                console.log("dia.DiagnosticReportTime: ", dia.DiagnosticReportType);
                                // const modified = medication.MedicationType.replace(/\s*\(.*?\)/g, '');
                                const modified = (dia.DiagnosticReportType) ? dia.DiagnosticReportType.charAt(0).toUpperCase() + dia.DiagnosticReportType.slice(1): dia.DiagnosticReportType;
                                return { type: modified, time: dia.DiagnosticReportTime, ref: dia.DiagnosticReportReferences};
                            })
                            .slice(0, 3)
                            .map((dia)=>(
                                <li>{dia.type} 
                                    <ul>
                                        <li>Time: {dia.time && (dia.time.split('T'))[0]}</li>
                                        <li>Observation: 
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Type</TableCell>
                                                        <TableCell>Value</TableCell>
                                                        <TableCell>Date</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                {
                                                    ObservationData && ObservationData.map((obs) => {
                                                        // Diagnostic data format, "Observation/L-206031874" 
                                                        if(dia.ref.includes("Observation/" + obs.ObservationID)){
                                                            return (
                                                                <React.Fragment>
                                                                    <TableRow>
                                                                        <TableCell>{obs.ObservationType}</TableCell>
                                                                        <TableCell>{obs.ObservationValue}</TableCell>
                                                                        <TableCell>{obs.ObservationTime && (obs.ObservationTime.split('T'))[0]}</TableCell>
                                                                    </TableRow>
                                                                </React.Fragment>
                                                            )
                                                        }
                                                    })
                                                }
                                                </TableBody>
                                            </Table>
                                            {/* <ul>
                                                {
                                                    ObservationData && ObservationData.map((obs) => {
                                                        // Diagnostic data format, "Observation/L-206031874" 
                                                        if(dia.ref.includes("Observation/" + obs.ObservationID)){
                                                            return (<li>{obs.ObservationType} &nbsp; {obs.ObservationValue} &nbsp; {obs.ObservationTime && (obs.ObservationTime.split('T'))[0]}</li>);
                                                        }
                                                    })
                                                }
                                            </ul> */}
                                        </li>
                                    </ul>
                                </li>
                            ))
                        }

                        </ul>)}

                        {
                            (DiagnosticReportData && DiagnosticReportData.length != 0 && DiagnosticReportData.length > 3) ? (<Link onClick={loadMoreDiagnoseHandler}> Load More...</Link>) : (<React.Fragment></React.Fragment>)
                        }

                        {(!DiagnosticReportData || DiagnosticReportData.length == 0) && (
                            <Typography variant='subtitle1' >No Diagnostic Data</Typography>
                        )}
                    </div>}
                </Grid>
                <Grid sm={1} xs={0}/>
            </Grid>
        </div>

        
    );
}
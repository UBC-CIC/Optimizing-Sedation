import React, { useState } from 'react';


// Material UI
import {Grid, Typography} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';


export default function SideBar(){
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
        <div style={{
            overflow: 'scroll',
            
        }}>
            <Grid container spacing={0}>
                <Grid sm={2} />
                <Grid sm={8} >
                    <div style={style.roundBoxNoHorizontalSpace}>
                        <Typography variant={"subtitle1"} component="h6">Patient Name</Typography>
                        <Typography variant={"h5"} component="h6">Peter Parker</Typography>
                    </div>
                </Grid>
                <Grid sm={2} />

                <Grid sm={2} />
                <Grid sm={8} >
                    <div style={style.roundBoxNoHorizontalSpace}>
                        <Typography variant={"subtitle1"}>Patient MRN</Typography>
                        <Typography variant={"h5"}>#12345678</Typography>
                    </div>
                </Grid>
                <Grid sm={2} />

                <Grid sm={2} />
                <Grid sm={8} >
                    <div style={{
                        marginTop: '10vh'
                    }}>
                        <Typography variant={"subtitle1"}>Contact</Typography>
                        <Typography variant={"h6"}>Mary Parker</Typography>
                        <Typography variant={"h6"}>604-325-4824</Typography>
                    </div>
                </Grid>
                <Grid sm={2} />

                <Grid sm={2} />
                <Grid sm={8} >
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
                            <Typography variant={"subtitle1"}>Medication A</Typography>
                            <Typography variant={"subtitle1"}>Medication B</Typography>
                            <Typography variant={"subtitle1"}>Medication C</Typography>
                        </div>}
                    </div>
                </Grid>
                <Grid sm={2} />

                <Grid sm={2} />
                <Grid sm={8} >
                    <div style={style.dropDown} onClick={openDiagnoseHandle}>
                        <Typography variant={"h6"}>View list of diagnoses</Typography>
                        {openDiagnose ? <ExpandLess /> : <ExpandMore />}
                    </div>

                    {openDiagnose && 
                    <div style={style.roundBoxDropdownLists}>
                        <Typography variant={"subtitle1"}>Diagnose A</Typography>
                        <Typography variant={"subtitle1"}>Diagnose B</Typography>
                        <Typography variant={"subtitle1"}>Diagnose C</Typography>
                    </div>}
                </Grid>
                <Grid sm={2} />
            </Grid>
        </div>
    );
}
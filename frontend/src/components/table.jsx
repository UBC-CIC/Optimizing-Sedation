import React, { useState, useEffect} from 'react';


// Material UI
import {
    Grid, 
    Paper, 
    TableCell, 
    Collapse, 
    IconButton,
    TableRow,
    TableContainer,
    TableHead,
    TableBody,
    Table,
    tableCellClasses,
    styled,
    Typography,
    Link,
    Container,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// Constant Variables
const LINK = "///LINK";

// Data Structuring
function createData(assessment, status, others, tableHeader){
    // others should be in the form of [{title, col1, col2}, {title, col1, col2}]
    // For col1 and col2 are optional
    if (others != null && !Array.isArray(others))
        return null;

    if (tableHeader != null && !Array.isArray(tableHeader))
        return null;
    
    if(others != null){
        const isValidFormat = others.every(item => {
            let output = typeof item.title === 'string';
            
            if(item.col1 != null)
                output = typeof item.col1 === 'string';

            if(item.col2 != null)
                output = typeof item.col2 === 'string';
            
            return output;
        });
        if(!isValidFormat)
            return null;
    }

    return {
        assessment, 
        status,
        others,
        tableHeader
    };
}

function convertData(ImmunizationData, ObservationData, totalLOINC_codesData){
    let data = [];

    /* const lab = [{title: "Lab_1_file_name", col1: "/Lab_1_file_name", col2: LINK}, {title: "Lab_2_file_name", col1: "/Lab_2_file_name", col2: LINK}];
    data.push(createData("Labs", "Not done", lab)); */

    // Convert lab data
    if(ObservationData != null){
        const observation = ObservationData.map(row =>{
            const modified = row.ObservationType.charAt(0).toUpperCase() + row.ObservationType.slice(1);
            return ({title: modified, col1: row.ObservationValue, col2:row.ObservationTime });
        });
    
        const observationHeader = ["Lab Type", "Value", "Date"];
        data.push(createData("Labs", "Done", observation, observationHeader));
    } else if (ObservationData == null || ObservationData == []) {
        data.push(createData("Labs", "No Data", null, null));
    }

    // Convert ImmunizationData
    if(ImmunizationData != null){
        const vaccination = ImmunizationData.map(row =>{
            const modified = row.ImmunizationType.charAt(0).toUpperCase() + row.ImmunizationType.slice(1);
            return ({title: modified, col1: row.ImmunizationStatus, col2:row.ImmunizationTime });
        });
    
        const vaccinationHeader = ["Vaccine", "Status", "Date"];
        data.push(createData("Vaccinations", "Up to date", vaccination, vaccinationHeader));
    } else if (ImmunizationData == null || ImmunizationData == []) {
        data.push(createData("Vaccinations", "No Data", null, null));
    }

    // Convert ECG data
    if(totalLOINC_codesData.ECG_LOINC != null){
        const ecgObservation = totalLOINC_codesData.ECG_LOINC.map(row =>{
            const modified = row.ObservationType.charAt(0).toUpperCase() + row.ObservationType.slice(1);
            return ({title: modified, col1: row.ObservationValue, col2:row.ObservationTime });
        });
    
        const ecgHeader = ["Result Type", "Value", "Date"];
        data.push(createData("ECG", "Done", ecgObservation, ecgHeader));
    } else if (totalLOINC_codesData.ECG_LOINC == null || totalLOINC_codesData.ECG_LOINC == []) {
        data.push(createData("ECG", "No Data", null, null));
    }

    // Convert EEG data
    if(totalLOINC_codesData.EEG_LOINC != null){
        const eegObservation = totalLOINC_codesData.EEG_LOINC.map(row =>{
            const modified = row.ObservationType.charAt(0).toUpperCase() + row.ObservationType.slice(1);
            return ({title: modified, col1: row.ObservationValue, col2:row.ObservationTime });
        });
    
        const eegHeader = ["Result Type", "Value", "Date"];
        data.push(createData("EEG", "Done", eegObservation, eegHeader));
    } else if (totalLOINC_codesData.EEG_LOINC == null || totalLOINC_codesData.EEG_LOINC == []) {
        data.push(createData("EEG", "No Data", null, null));
    }

    // Convert ENT data
    if(totalLOINC_codesData.ENT_LOINC != null){
        const entObservation = totalLOINC_codesData.ENT_LOINC.map(row =>{
            const modified = row.ObservationType.charAt(0).toUpperCase() + row.ObservationType.slice(1);
            return ({title: modified, col1: row.ObservationValue, col2:row.ObservationTime });
        });
    
        const entHeader = ["Result Type", "Value", "Date"];
        data.push(createData("ENT", "Done", entObservation, entHeader));
    } else if (totalLOINC_codesData.ENT_LOINC == null || totalLOINC_codesData.ENT_LOINC == []) {
        data.push(createData("ENT", "No Data", null, null));
    }

    // Convert ASD data
    if(totalLOINC_codesData.ASD_LOINC != null){
        const asdObservation = totalLOINC_codesData.ASD_LOINC.map(row =>{
            const modified = row.ObservationType.charAt(0).toUpperCase() + row.ObservationType.slice(1);
            return ({title: modified, col1: row.ObservationValue, col2:row.ObservationTime });
        });
    
        const asdHeader = ["Result Type", "Value", "Date"];
        data.push(createData("ASD", "Done", asdObservation, asdHeader));
    } else if (totalLOINC_codesData.ASD_LOINC == null || totalLOINC_codesData.ASD_LOINC == []) {
        data.push(createData("ASD", "No Data", null, null));
    }

    // Convert OPTHALMOLOGY data
    if(totalLOINC_codesData.OPTHALMOLOGY_LOINC != null){
        const opthalmologyObservation = totalLOINC_codesData.OPTHALMOLOGY_LOINC.map(row =>{
            const modified = row.ObservationType.charAt(0).toUpperCase() + row.ObservationType.slice(1);
            return ({title: modified, col1: row.ObservationValue, col2:row.ObservationTime });
        });
    
        const opthalmologyHeader = ["Result Type", "Value", "Date"];
        data.push(createData("Opthalmologist", "Done", opthalmologyObservation, opthalmologyHeader));
    } else if (totalLOINC_codesData.OPTHALMOLOGY_LOINC == null || totalLOINC_codesData.OPTHALMOLOGY_LOINC == []) {
        data.push(createData("Opthalmologist", "No Data", null, null));
    }

    // Convert SEDATION data
    if(totalLOINC_codesData.SEDATION_LOINC != null){
        const sedationObservation = totalLOINC_codesData.SEDATION_LOINC.map(row =>{
            const modified = row.ObservationType.charAt(0).toUpperCase() + row.ObservationType.slice(1);
            return ({title: modified, col1: row.ObservationValue, col2:row.ObservationTime });
        });
    
        const sedationHeader = ["Result Type", "Value", "Date"];
        data.push(createData("Previous Sedation", "Done", sedationObservation, sedationHeader));
    } else if (totalLOINC_codesData.SEDATION_LOINC == null || totalLOINC_codesData.SEDATION_LOINC == []) {
        data.push(createData("Previous Sedation", "No Data", null, null));
    }

    
    //data.push(createData("ECG", "Done", null));
    //data.push(createData("EEG", "Done", null));
    //data.push(createData("ENT", "Seen", null));
    //data.push(createData("Ophthalmologist", "Seen", null));
    //data.push(createData("ASD", "Yes", null));
    //data.push(createData("Previous Sedation", "No", null));
    data.push(createData("Additional Assessment", "Done/Not done", null));


    return data;
}
// Custome Row Design
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: '#164780',
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:nth-of-type(even)': {
        backgroundColor: theme.palette.common.white,
      },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

function Row(props){
    const [open, setOpen] = React.useState(false);
    const data = props.info; 

    if(!data)
        return null;

    return(
        <React.Fragment>
            <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' }}} key={data.assessment}>
                <StyledTableCell component="th" scope="row">{data.assessment}</StyledTableCell>
                <StyledTableCell align="center">
                    <Grid container style={{alignItems: 'center'}}>
                        <Grid sm={11} style={{ textAlign: 'left' }}>
                            {data.status}
                        </Grid>
                        <Grid sm={1}>
                        {data.others != null &&
                            <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={() => setOpen(!open)}
                                >
                                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                        }
                        </Grid>
                    </Grid>
                </StyledTableCell>
            </StyledTableRow>

            <StyledTableRow>
                <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    {data.others != null &&
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Container>

                        <TableContainer style={{marginTop: '2vh', marginBottom: '2vh'}}>
                        <Table size="small">
                            {
                                data.tableHeader != null &&
                                <TableHead>
                                    <TableRow>
                                        { data.tableHeader.map((i)=>(
                                            <TableCell align='left' style={{fontWeight: "bold"}}>{i}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                            }
                            
                            <TableBody>
                                {
                                    data.others.map((i)=>{
                                        if(i.col1 != null && i.col2 != null && i.col2 == LINK){     // Display as link
                                            return (
                                                <Typography variant={"subtitle1"} component="h6">
                                                    <Link href={i.col1} target="_blank" rel="noopener">
                                                        {i.title}
                                                    </Link> 
                                                </Typography>);
                                        } else if (i.col1 != null && i.col2 != null){               // Display as table
                                            return (
                                                <TableRow>
                                                    <TableCell align='left'>{i.title}</TableCell>
                                                    <TableCell align='left'>{i.col1}</TableCell>
                                                    <TableCell align='left'>{i.col2}</TableCell>
                                                </TableRow>
                                            );
                                        } else if (i.col1 != null){
                                            return (
                                                <TableRow>
                                                    <TableCell align='left'>{i.title}</TableCell>
                                                    <TableCell align='left'>{i.col1}</TableCell>
                                                </TableRow>
                                            );
                                        } 
                                        else{        
                                            return (
                                                <TableRow>
                                                    <TableCell align='left'>{i.title}</TableCell>
                                                </TableRow>
                                            );
                                        }
                                    })
                                }
                            </TableBody>
                        </Table>
                        </TableContainer>
                            
                        </Container>
                    </Collapse>
                    }
                </StyledTableCell>
            </StyledTableRow>
        </React.Fragment>
    )
}

export default function PatientTable({fhirData, selectStatusType, selectAssessmentType, searchInput, ImmunizationData, ObservationData, totalLOINC_codesData}){
    // const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type

    // Convert input data into current format of this table
    // if(!Array.isArray(fhirData))
    //     return (
    //         <Typography variant={"subtitle1"} component="h6">Error! Unable to parse data!</Typography>
    //     );
    
    const data = convertData(ImmunizationData, ObservationData, totalLOINC_codesData);
    //console.log("data: ", data);

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
            // borderRadius: 10, 
            // border: '2px solid #3e92fb', 
            // backgroundColor:'#3e92fb', 
            marginTop: '0.7vh',
            marginBottom: '0.7vh',
            // boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.1)'
        },

        roundBoxDropdownLists: {
            padding: '2vh', 
            borderRadius: 5, 
            border: '2px solid #e7e8eb', 
            backgroundColor:'#e7e8eb', 
            margin:'10px',
            boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 1,
            position: 'absolute',
        },
    }


    useEffect(() => {
        //console.log("data: ", data);

        
    }, []);

    return(
        <div>
            <TableContainer component={Paper}>
                <Table stickyHeader aria-label="collapsible table" >
                    <TableHead >
                        <StyledTableRow style={{backgroundColor:"green"}}>
                            <StyledTableCell align="left">Type of Assessment</StyledTableCell>
                            <StyledTableCell align="left">Status</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {
                            // Filter data before displaying in the .map() function
                            data
                            .filter(row => {
                                if(selectAssessmentType.length == 0){
                                    return true;
                                } else {
                                    for(let status_i in selectAssessmentType)
                                        if(row.assessment == selectAssessmentType[status_i])
                                            return true;
                                }

                                return false;
                            })
                            .filter(row => {
                                if(selectStatusType.length == 0){
                                    return true;
                                } else {
                                    for(let status_i in selectStatusType)
                                        if(row.status == selectStatusType[status_i])
                                            return true;
                                }

                                return false;
                            })
                            .filter(row => {
                                if(row.others != null)
                                    for(let i in row.others){
                                        if(row.others[i].title.toLowerCase().includes(searchInput.toLowerCase())){
                                            return true;
                                        }
                                    }

                                return row.assessment.toLowerCase().includes(searchInput.toLowerCase()) || row.status.toLowerCase().includes(searchInput.toLowerCase());
                            })
                            .map((row)=>(
                                <Row info={row}/>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
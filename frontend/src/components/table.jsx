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

// Custome Components
import {DropDownTableRow} from './dropDownTable';

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
        console.log("createData.other: ", others);
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

function convertData(ImmunizationData, LabData, ObservationData){
    let data = [];
    /**
     * 'LabData' Structure
     * [
     *      {
     *          title: String!
     *          time: String!
     *          references: ['String: ObservationID']
     *          value: String
     *      }
     * ]
     */

    /* const lab = [{title: "Lab_1_file_name", col1: "/Lab_1_file_name", col2: LINK}, {title: "Lab_2_file_name", col1: "/Lab_2_file_name", col2: LINK}];
    data.push(createData("Labs", "Not done", lab)); */

    // Convert lab data
    if(LabData != null){
        const labProcessedData = LabData.map(row =>{
            const modifiedTitle = (row.title) && (row.title.charAt(0).toUpperCase() + row.title.slice(1));
            if(row.references){
                // Generate col3 for drop down
                // dia.ref.includes("Observation/" + obs.ObservationID)
                const matchedObservationCode = ObservationData.filter((obs) => (row.references.includes("Observation/" + obs.ObservationID)));
                const col3Data = matchedObservationCode.map((obs)=>{
                    const modified = obs.ObservationType.charAt(0).toUpperCase() + obs.ObservationType.slice(1);
    
                    return {title: modified, col1: obs.ObservationValue, col2: obs.ObservationTime && (obs.ObservationTime.split('T'))[0]}
                });
                
                const subHeaders = ["Observation Type", "Value", "Date"];
                return ({title: modifiedTitle, col1: 'N/A', col2: row.time && (row.time.split('T'))[0], col3: col3Data, headers: subHeaders});
            } else if (row.value){
                return ({title: modifiedTitle, col1: row.value, col2: row.time && (row.time.split('T'))[0]});
            }
            
            return null;
        });
        
        if(labProcessedData != null){
            console.log("labProcessedData: ", labProcessedData);
            const observationHeader = ["Lab Type", "Value", "Date"];
            data.push(createData("Labs", "Done", labProcessedData, observationHeader));
        } else {
            data.push(createData("Labs", "No Data", null, null));
        }
    } else if (LabData == null || LabData == []) {
        data.push(createData("Labs", "No Data", null, null));
    }

    // Convert ImmunizationData
    if(ImmunizationData != null){
        const vaccination = ImmunizationData.map(row =>{
            const modified = row.ImmunizationType.charAt(0).toUpperCase() + row.ImmunizationType.slice(1);
            return ({title: modified, col1: row.ImmunizationStatus, col2:row.ImmunizationTime && (row.ImmunizationTime.split('T'))[0] });
        });
    
        const vaccinationHeader = ["Vaccine", "Status", "Date"];
        data.push(createData("Vaccinations", "Up to date", vaccination, vaccinationHeader));
    } else if (ImmunizationData == null || ImmunizationData == []) {
        data.push(createData("Vaccinations", "No Data", null, null));
    }

    
    data.push(createData("ECG", "No Data", null));
    data.push(createData("EEG", "No Data", null));
    data.push(createData("ENT", "No Data", null));
    data.push(createData("Ophthalmologist", "No Data", null));
    data.push(createData("ASD", "No Data", null));
    data.push(createData("Previous Sedation", "No Data", null));
    data.push(createData("Dentistry", "No Data", null));

    console.log("data: ", data);
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
            {/* Main Row */}
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
            
            {/* Sub Row */}
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
                                    data.others
                                    .sort((a, b) => {       // Sort based on time
                                        if(a.col2 != null)
                                            return b.col2.localeCompare(a.col2)
                                        else
                                            return 0;
                                    })
                                    .map((i)=>{
                                        if(i.col1 != null && i.col2 != null && i.col2 == LINK){     // Display as link
                                            return (
                                                <Typography variant={"subtitle1"} component="h6">
                                                    <Link href={i.col1} target="_blank" rel="noopener">
                                                        {i.title}
                                                    </Link> 
                                                </Typography>);
                                        } else if (i.col1 != null && i.col2 != null){               // Display as table
                                            return (
                                                    <DropDownTableRow rowData = {i}/>
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

export default function PatientTable({fhirData, selectStatusType, selectAssessmentType, searchInput, ImmunizationData, ObservationData, LabData}){
    // const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type

    // Convert input data into current format of this table
    // if(!Array.isArray(fhirData))
    //     return (
    //         <Typography variant={"subtitle1"} component="h6">Error! Unable to parse data!</Typography>
    //     );
    
    const data = convertData(ImmunizationData, LabData, ObservationData);
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
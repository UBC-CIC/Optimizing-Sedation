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
    LinearProgress,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Custome Components
import {DropDownTableRow} from './dropDownTable';

// Constant Variables
const LINK = "///LINK";

// ID Variables holder
var CURRENT_ID = 0;

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
        tableHeader,
        id: String(CURRENT_ID++),
    };
}

function convertData(ImmunizationData, LabData, ObservationData, totalLOINC_codesData){
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
    if(LabData != null && ObservationData != null){
        const labProcessedData = LabData.map(row =>{
            const modifiedTitle = (row.title) && (row.title.charAt(0).toUpperCase() + row.title.slice(1));
            if(row.references){
                // Generate col3 for drop down
                // dia.ref.includes("Observation/" + obs.ObservationID)
                const matchedObservationCode = ObservationData.filter((obs) => (row.references.includes("Observation/" + obs.ObservationID)));
                const col3Data = matchedObservationCode.map((obs)=>{
                    const modified = obs.ObservationType.charAt(0).toUpperCase() + obs.ObservationType.slice(1);
    
                    return {id: String(CURRENT_ID++), title: modified, col1: obs.ObservationValue, col2: obs.ObservationTime}
                });
                
                const subHeaders = ["Observation Type", "Value", "Date"];
                return ({id: String(CURRENT_ID++), title: modifiedTitle, col1: 'N/A', col2: row.time, col3: col3Data, headers: subHeaders});
            } else if (row.value){
                return ({id: String(CURRENT_ID++), title: modifiedTitle, col1: row.value, col2: row.time});
            }
            
            return null;
        });
        
        if(labProcessedData !== null && labProcessedData.length !== 0){
            const observationHeader = ["Lab Type", "Value", "Date"];
            data.push(createData("Labs", "Data Available", labProcessedData, observationHeader));
        } else {
            data.push(createData("Labs", "No Data", null, null));
        }
    } else if (LabData === null || LabData == []) {
        data.push(createData("Labs", "No Data", null, null));
    }

    // Convert ImmunizationData
    if(ImmunizationData !== null && ImmunizationData.length !== 0){
        const vaccination = ImmunizationData.map(row =>{
            const modified = row.ImmunizationType.charAt(0).toUpperCase() + row.ImmunizationType.slice(1);
            return ({id: CURRENT_ID++, title: modified, col1: row.ImmunizationStatus, col2:row.ImmunizationTime});
        });
    
        const vaccinationHeader = ["Vaccine", "Status", "Date"];
        data.push(createData("Vaccinations", "Data Available", vaccination, vaccinationHeader));
    } else if (ImmunizationData === null || ImmunizationData == []) {
        data.push(createData("Vaccinations", "No Data", null, null));
    }

    // Convert Other Data that searched by codes
    for (const property in totalLOINC_codesData) {
        if (totalLOINC_codesData.hasOwnProperty(property)) {
            if (totalLOINC_codesData[property] !== null && totalLOINC_codesData[property].length !== 0) {
                const observationData = totalLOINC_codesData[property].map(row => {
                    const modified = row.ObservationType.charAt(0).toUpperCase() + row.ObservationType.slice(1);
                    return ({id: CURRENT_ID++, title: modified, col1: row.ObservationValue, col2: row.ObservationTime });
                });
    
                const header = ["Result Type", "Value", "Date"];
                data.push(createData(property, "Data Available", observationData, header));
            } else {
                data.push(createData(property, "No Data", null, null));
            }
        }
    }

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

    useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    if(!data)
        return null;

    return(
        <React.Fragment>
            {/* Main Row */}
            <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' }}} key={data.id + 'A'}>
                <StyledTableCell component="th" scope="row">{data.assessment}</StyledTableCell>
                <StyledTableCell align="center">
                    <Grid container style={{alignItems: 'center'}}>
                        <Grid item={true} sm={11} style={{ textAlign: 'left', color: data.status === 'Data Available' ? 'green' : data.status === 'No Data' ? 'red' : 'inherit' }}>
                            {data.status}
                        </Grid>
                        <Grid item={true} sm={1}>
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
            <StyledTableRow key={data.id + 'B'}>
                <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    {data.others != null &&
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Container>
                                <TableContainer style={{ marginTop: '2vh', marginBottom: '2vh' }}>
                                    <Table size="small">
                                        {data.tableHeader != null &&
                                            <TableHead >
                                                <TableRow key={data.id + "0x07"}>
                                                    {data.tableHeader.map((i, index) => (
                                                        <TableCell
                                                            align='left'
                                                            style={{
                                                                fontWeight: "bold",
                                                                width: index === 0 ? '40%' : '40%' // Define column widths here
                                                            }}
                                                            key={data.id + String(index)}
                                                        >
                                                            {i}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                        }

                                        <TableBody>
                                            {data.others
                                                .sort((a, b) => {
                                                    if (a.col2 != null)
                                                        return b.col2.localeCompare(a.col2);
                                                    else
                                                        return 0;
                                                })
                                                .map((i) => {
                                                    if (i.col1 !== null && i.col2 !== null && i.col2 === LINK) {
                                                        return (
                                                            <Typography variant={"subtitle1"} component="h6">
                                                                <Link href={i.col1} target="_blank" rel="noopener">
                                                                    {i.title}
                                                                </Link>
                                                            </Typography>
                                                        );
                                                    } else if (i.col1 !== null && i.col2 !== null) {
                                                        return (
                                                            <DropDownTableRow rowData={i} key={i.id}/>
                                                        );
                                                    } else if (i.col1 != null) {
                                                        return (
                                                            <TableRow key={i.id}>
                                                                <TableCell
                                                                    align='left'
                                                                    style={{ width: '50%' }} 
                                                                >
                                                                    {i.title}
                                                                </TableCell>
                                                                <TableCell
                                                                    align='left'
                                                                    style={{ width: '50%' }}
                                                                >
                                                                    {i.col1}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    } else {
                                                        return (
                                                            <TableRow key={i.id}>
                                                                <TableCell
                                                                    align='left'
                                                                    colSpan={2} 
                                                                    style={{ width: '100%' }} 
                                                                >
                                                                    {i.title}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }
                                                })}
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

export default function PatientTable({fhirData, selectStatusType, selectAssessmentType, searchInput, ImmunizationData, ObservationData, LabData, totalLOINC_codesData, allRowsExpanded}){
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
            marginTop: '0.7vh',
            marginBottom: '0.7vh',
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

    // Convert input data into table readable data
    const [dataAvailable, setDataAvialable] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        // Wait for all to have some data even []
        if (ImmunizationData && LabData && ObservationData && totalLOINC_codesData && !dataAvailable) {
            const data_ = convertData(ImmunizationData, LabData, ObservationData, totalLOINC_codesData);
            setData(data_);
            setDataAvialable(true);
        }
    }, [ImmunizationData, LabData, ObservationData, totalLOINC_codesData]);

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
                                if(selectAssessmentType.length === 0){
                                    return true;
                                } else {
                                    for(let status_i in selectAssessmentType)
                                        if(row.assessment === selectAssessmentType[status_i])
                                            return true;
                                }

                                return false;
                            })
                            .filter(row => {
                                if(selectStatusType.length === 0){
                                    return true;
                                } else {
                                    for(let status_i in selectStatusType)
                                        if(row.status === selectStatusType[status_i])
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
                                <Row info={row} open={allRowsExpanded} key={row.id}/>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            {!dataAvailable &&
                <LinearProgress color="success"/>
            }
        </div>
    );
}
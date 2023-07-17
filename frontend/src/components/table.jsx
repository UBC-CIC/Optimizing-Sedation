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

// Data Structuring
function createData(assessment, status, others){
    // others should be in the form of [{title, url}, {title, url}]
    if (others != null && !Array.isArray(others))
        return null;
    
    if(others != null){
        const isValidFormat = others.every(item => {
            let output = typeof item.title === 'string';
            
            if(item.url != null)
                output = typeof item.url === 'string';
            
            return output;
        });
        if(!isValidFormat)
            return null;
    }

    return {
        assessment, 
        status,
        others
    };
}

function convertData(input){
    let data = [];
    data.push(createData("Labs", "Not done", [{title: "Lab_1_file_name", url: "/Lab_1_file_name"}, {title: "Lab_2_file_name", url: "/Lab_2_file_name"}]));
    data.push(createData("Vaccinations", "Up to date", [{title: "Covid", url: null}, {title: "Flu", url: null}, {title: "HPV", url: null}]));
    data.push(createData("ECG", "Done", null));
    data.push(createData("EEG", "Done", null));
    data.push(createData("ENT", "Seen", null));
    data.push(createData("Ophthalmologist", "Seen", null));
    data.push(createData("ASD", "Yes", null));
    data.push(createData("Previous Sedation", "No", null));
    data.push(createData("Additional Assessment", "Done/Not done", null));
    
    // for(let i = 0; i < 20; i++){
    //     createData(assessment, status, others)
    // }

    return data;
}
// Custome Row Design
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
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
                            {
                                data.others.map((i)=>{
                                    if(i.url != null){
                                        return (<Typography variant={"subtitle1"} component="h6">
                                                    <Link href={i.url} target="_blank" rel="noopener">
                                                        {i.title}
                                                    </Link> 
                                                </Typography>);
                                    } else {
                                        return (<Typography variant={"subtitle1"} component="h6">
                                                    {i.title}
                                                </Typography>);
                                    }
                                })
                            }
                        </Container>
                    </Collapse>
                    }
                </StyledTableCell>
            </StyledTableRow>
        </React.Fragment>
    )
}

export default function PatientTable(props){
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type

    // Convert input data into current format of this table
    if(!Array.isArray(props.fhirData))
        return (
            <Typography variant={"subtitle1"} component="h6">Error! Unable to parse data!</Typography>
        );
    
    const data = convertData(props.data);
    console.log("data: ", data);

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


    // useEffect(() => {
    //     console.log("data: ", data);
    // }, []);

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
                            data.map((row)=>(
                                <Row info={row}/>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
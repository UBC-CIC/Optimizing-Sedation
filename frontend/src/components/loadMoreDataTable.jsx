import React, { useState, useEffect} from 'react';


// Material UI
import {
    Grid, 
    Paper, 
    TableCell, 
    TableRow,
    TableContainer,
    TableHead,
    TableBody,
    Table,
    tableCellClasses,
    styled,
    LinearProgress,
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

function convertData(ImmunizationData){
    let data = [];

    const lab = [{title: "Lab_1_file_name", col1: "/Lab_1_file_name", col2: LINK}, {title: "Lab_2_file_name", col1: "/Lab_2_file_name", col2: LINK}];
    data.push(createData("Labs", "Not done", lab));

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


    
    data.push(createData("ECG", "Done", null));
    data.push(createData("EEG", "Done", null));
    data.push(createData("ENT", "Seen", null));
    data.push(createData("Ophthalmologist", "Seen", null));
    data.push(createData("ASD", "Yes", null));
    data.push(createData("Previous Sedation", "No", null));
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
    const data = props.info; 

    if(!data)
        return null;

    return(
        <React.Fragment>
            <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' }}} key={data.title}>
                <StyledTableCell component="th" scope="row">{data.title}</StyledTableCell>
                <StyledTableCell component="th" scope="row">{data.col1}</StyledTableCell>
                <StyledTableCell component="th" scope="row">{data.col2}</StyledTableCell>
            </StyledTableRow>
        </React.Fragment>
    )
}

export default function LoadMoreDataTable({selectStatusType, searchInput, data}){
    // const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type


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

        
    }, []);

    return(
        <div>
            <TableContainer component={Paper}>
                <Table stickyHeader aria-label="collapsible table" >
                    <TableHead >
                        <StyledTableRow style={{backgroundColor:"green"}}>
                            <StyledTableCell align="left">Type</StyledTableCell>
                            <StyledTableCell align="left">Status</StyledTableCell>
                            <StyledTableCell align="left">Date</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {data && 
                            // Filter data before displaying in the .map() function
                            data
                            .sort((a, b) => b.col2.localeCompare(a.col2))
                            .filter(row => {
                                if(selectStatusType.length == 0){
                                    return true;
                                } else {
                                    for(let status_i in selectStatusType)
                                        if(row.col1 == selectStatusType[status_i])
                                            return true;
                                }

                                return false;
                            })
                            .filter(row => {
                                return row.title.toLowerCase().includes(searchInput.toLowerCase()) || row.col1.toLowerCase().includes(searchInput.toLowerCase()) || row.col2.toLowerCase().includes(searchInput.toLowerCase());
                            })

                            // {title: modified, col1: row.ImmunizationStatus, col2:row.ImmunizationTime }
                            .map((row)=>(
                                <Row info={row}/>
                            ))
                        }
                        
                    </TableBody>
                </Table>
            </TableContainer>
            {data == null && 
                <LinearProgress color="success" />
            }
        </div>
    );
}
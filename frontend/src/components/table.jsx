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
    styled
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


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

    return(
        <React.Fragment>
            <StyledTableRow sx={{ '& > *': { borderBottom: 'unset' }}} key="1">
                <StyledTableCell component="th" scope="row">Labs</StyledTableCell>
                <StyledTableCell align="center">
                    <Grid container style={{alignItems: 'center'}}>
                        <Grid sm={11} style={{ textAlign: 'left' }}>
                            Not Done
                        </Grid>
                        <Grid sm={1}>
                            <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={() => setOpen(!open)}
                                >
                                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                        </Grid>
                    </Grid>
                </StyledTableCell>
            </StyledTableRow>

            <StyledTableRow size="small">
                <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <h1>Hello World, Table Collapse</h1>
                    </Collapse>
                </StyledTableCell>
            </StyledTableRow>
        </React.Fragment>
    )
}

export default function PatientTable(){
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type

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
                <Table stickyHeader size="small" aria-label="collapsible table" >
                    <TableHead >
                        <StyledTableRow style={{backgroundColor:"green"}}>
                            <StyledTableCell align="left">Type of Assessment</StyledTableCell>
                            <StyledTableCell align="left">Status</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        <Row />
                        <Row />
                        <Row />
                        <Row />
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
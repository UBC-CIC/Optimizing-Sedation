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

function DropDownTableRow({rowData}){
    const [open, setOpen] = React.useState(false);
    const data = rowData;

    /**
     * 
     * 'data' Structure
     * {
     *      title: String
     *      col1: String
     *      col2: String
     *      col3: [
     *              {
     *                  title: String,
     *                  col1: String,
     *                  col2: String
     *              }, ...
     *            ]
     *      headers: [String, ...]
     * }
    */

    if(!data)
        return null;

    return(
        <React.Fragment>
            {/* Main Row */}
            <TableRow sx={{ '& > *': { borderBottom: '0px solid black' }}} key={data.id + "C"}>
                <TableCell component="th" scope="row">{data.title}</TableCell>
                <TableCell component="th" scope="row">{data.col1}</TableCell>
                <TableCell align="center">
                    <Grid container style={{alignItems: 'center'}}>
                        <Grid item={true} sm={11} style={{ textAlign: 'left' }}>
                            {data.col2}
                        </Grid>
                        <Grid item={true} sm={1}>
                        {data.col3 != null &&
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
                </TableCell>
            </TableRow>
            
            {/* Sub Row */}
            <TableRow style={{ '& > *': { borderBottom: '0px solid black' }, backgroundColor: "#f5f5f5"}} key={data.id + "D"}>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    {data.col3 != null &&
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Container>
                            {/* Sub Row Body */}
                            {/* Design 1: display as table form */}
                            <Table size="small" style={{borderBottom: '0px solid black', marginBottom: 10, marginTop: 10}}>
                                <TableHead>
                                    <TableRow key={data.id + "0x1"}>
                                        {data.headers && data.headers.map((i, index)=>{
                                            if(data.headers.indexOf(i) === 0)
                                                return(<TableCell align="left" style={{fontWeight: "bold"}} key={data.id + String(index)}>{i}</TableCell>);
                                            
                                            return(<TableCell align="center" style={{fontWeight: "bold"}} key={data.id + String(index)}>{i}</TableCell>);
                                        })}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        data.col3.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell>{r.title}</TableCell>
                                                <TableCell align="center">{r.col1}</TableCell>
                                                <TableCell align="center">{r.col2}</TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </Container>
                    </Collapse>
                    }
                </TableCell>
            </TableRow>
        </React.Fragment>
    )
}

function DropDownTable({headers, data}){

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
                <Table size="small" stickyHeader aria-label="collapsible table" >
                    <TableHead >
                        <TableRow key={data.id + "0x123"}>
                            {
                                headers.map((header_i, index) =>{
                                    <TableCell align="left" key={data.id + "|" + String(index)}>{header_i}</TableCell>
                                })
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data && data.map((row, index) => (
                            <DropDownTableRow rowData={row} key={data.id + "*" + String(index)}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export {DropDownTable, DropDownTableRow};

import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';

// Components
import CustomedDataGrid from './CustomeDataGrid';

// Material UI
import Button from '@mui/material/Button';
import {Grid, IconButton, Paper, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function LoadMoreDataPopUp({parsedTableData, loadData, popupTitle, setLoadPopup}){
    
    useEffect(() => {
    }, []);

    //// Handler Functions////

    const closeHandler = () =>{
        setLoadPopup(false);
    }

    //// End of Handler Functions ////

    return(
        <div>
            {loadData != null &&
            <React.Fragment>
                <Grid container spacing={0}>
                        <Grid sm={11} >
                        <Paper elevation={3} style={{
                            padding: '2vh 3vw 3vh 3vw',
                            backgroundColor: '#f3f6f9',
                            margin: 0
                            }}>
                            {/* Popup Header */}
                            <div style={{
                                display: 'flex',
                                flexFlow: 'row',
                                alignItems: 'center',
                                flexWrap: 'nowrap',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid black',
                                marginBottom: '0vh'
                                }}>

                                <h2>{popupTitle}</h2>
                                <IconButton onClick={closeHandler}>
                                    <CloseIcon />
                                </IconButton>
                            </div>

                            {/* Table */}
                            <div style={{paddingTop:'2vh'}}>
                                <center>
                                    <h1>{loadData.title}</h1>
                                </center>
                                <CustomedDataGrid medDiagData={parsedTableData}/>
                                {/* <LoadMoreDataTable 
                                selectStatusType = {selectStatusType}
                                searchInput = {searchInput}
                                data = {parsedTableData}
                                /> */}
                            </div>
                        </Paper>
                        </Grid>
                        <Grid sm={1} />
                </Grid>
            </React.Fragment>
            }

            {loadData == null && 
                <h1>Error 404</h1>
            }
        </div>
    );
}
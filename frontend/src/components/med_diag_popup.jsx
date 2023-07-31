import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';

// Components
import LoadMoreDataTable from '../components/loadMoreDataTable';
import LoadMoreDataSearchBar from '../components/loadMoreDataSearchBar';

// Material UI
import Button from '@mui/material/Button';
import {Grid, IconButton, Paper, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Data processing modules
import processMedicationData from '../DataProcessing/medicationProcessing';
import processConditionData from '../DataProcessing/conditionProcessing';

export default function LoadMoreDataPopUp({parsedTableData, loadData, statusList, popupTitle, setLoadPopup}){
    // Search Filter State Variables
    const [searchInput, setSearchInput] = useState("");
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type
    useEffect(() => {
    }, []);

    //// Handler Functions////
    const statusTypeHandle = (event) => {
        const { target: { value }, } = event;
        setSelectStatusType(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
        );
    };

    const searchInputHandle = (event) => {
        setSearchInput(event.target.value);
    };

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
                            backgroundColor: '#049DBF',
                            margin: 0
                            }}>
                            {/* Popup Header */}
                            <div style={{
                                display: 'flex',
                                flexFlow: 'row',
                                alignItems: 'center',
                                flexWrap: 'nowrap',
                                justifyContent: 'space-between',
                                borderBottom: '2px solid black',
                                marginBottom: '3vh'
                                }}>

                                <h2>{popupTitle}</h2>
                                <IconButton onClick={closeHandler}>
                                    <CloseIcon />
                                </IconButton>
                            </div>

                            {/* Search bar */}
                            <LoadMoreDataSearchBar 
                            selectStatusType = {selectStatusType}
                            statusTypeHandle = {statusTypeHandle}
                            searchInput = {searchInput}
                            searchInputHandle = {searchInputHandle}
                            statusList = {statusList}
                            />

                            {/* Table */}
                            <div style={{paddingTop:'2vh'}}>
                                <center>
                                    <h1>{loadData.title}</h1>
                                </center>
                                <LoadMoreDataTable 
                                selectStatusType = {selectStatusType}
                                searchInput = {searchInput}
                                data = {parsedTableData}
                                />
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
import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';

// Components
import LoadMoreDataTable from './loadMoreDataTable';
import SearchBar from './searchBar';

// Material UI
import {Grid, Link, Typography} from '@mui/material';



export default function LoadRawDataDisplay({MedicationData, setLoadRawData}){
    // Search Filter State Variables
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type
    const [selectAssessmentType, setSelectAssessmentType] = useState([]);             // Current selection for assessment type
    const [searchInput, setSearchInput] = useState("");

    //// Handler Functions ////
    const statusTypeHandle = (event) => {
        const { target: { value }, } = event;
        setSelectStatusType(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
        );
    };

    const assessmentTypeHandle = (event) => {
        const { target: { value }, } = event;
        setSelectAssessmentType(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
        );
    };

    const searchInputHandle = (event) => {
        setSearchInput(event.target.value);
    };

    //// End of Handler Functions ////

    //// Helper Functions ////
    function getStatusList(tableData){
        return tableData.map(obj => obj.col1);
    }

    //// End of Helper Funtions ////

    return(
        <React.Fragment>
            <Grid container spacing={0}>
                <Grid sm={11} >
                    <SearchBar 
                    selectStatusType = {selectStatusType}
                    statusTypeHandle = {statusTypeHandle}
                    selectAssessmentType = {selectAssessmentType}
                    assessmentTypeHandle = {assessmentTypeHandle}
                    searchInput = {searchInput}
                    searchInputHandle = {searchInputHandle}
                    />
                </Grid>
                <Grid sm={1} />

                <Grid sm={11} >
                    <div style={{paddingTop:'2vh', paddingBottom:'4vh'}}>
                        <div style={{
                            display: 'flex',
                            flexFlow: 'row',
                            alignItems: 'center',
                            flexWrap: 'nowrap',
                            justifyContent: 'space-between',
                            }}>

                            <h1>Patient Raw Data</h1>
                            <Link onClick={() => {setLoadRawData(false)}}>View Data Summary</Link>
                        </div>
                        
                        <h2>Observation Data</h2>
                        <LoadMoreDataTable 
                        selectStatusType = {[]}
                        searchInput = {""}
                        data = {MedicationData}
                        />

                        <h2>Diagnostic Data</h2>
                        <LoadMoreDataTable 
                        selectStatusType = {[]}
                        searchInput = {""}
                        data = {MedicationData}
                        />
                                                
                        <h2>Condition Data</h2>
                        <LoadMoreDataTable 
                        selectStatusType = {[]}
                        searchInput = {""}
                        data = {MedicationData}
                        />
                        
                    </div>
                </Grid>
                <Grid sm={1} />
            </Grid>
        </React.Fragment>
    );
}
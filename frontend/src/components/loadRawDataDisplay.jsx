import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';

// Components
import LoadMoreDataTable from './loadMoreDataTable';
import SearchBar from './searchBar';

// Material UI
import {Grid, Link, Typography} from '@mui/material';

export default function LoadRawDataDisplay({observationData, diagnosticData, conditionData, MedicationData, setLoadRawData}){
    // Search Filter State Variables
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type
    const [selectDataType, setSelectDataType] = useState([]);             // Current selection for assessment type
    const [searchInput, setSearchInput] = useState("");

    // Cleaned Fhir Data for table
    const [ConditionData_, setConditionnData] = useState([]);
    const [DiagnosticReportData_, setDiagnosticReportData] = useState([]);
    const [ObservationData_, setObservationData] = useState([]);
    const [MedicationData_, setMedicationnData] = useState([]);

    //// Handler Functions ////
    const statusTypeHandle = (event) => {
        const { target: { value }, } = event;
        setSelectStatusType(
        // On autofill we get a stringified value.
        typeof value === 'string' ? value.split(',') : value,
        );
    };

    // Selector Options
    const [statusTypesList, setStatusTypesList] = useState([]);
    const assessmentTypes = [
        'Condition Data',
        'Diagnostic Data',
        'Observation Data',
    ];

    const dataTypeHandle = (event) => {
        const { target: { value }, } = event;
        setSelectDataType(
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
        if (tableData)
            return tableData.map(obj => obj.col1);
        else
            return [];
    }

    //// End of Helper Funtions ////

    useEffect(()=>{
        // Clean up condition data
        const dataCleaned = MedicationData.map((row)=>{
            const modified = row.MedicationType.charAt(0).toUpperCase() + row.MedicationType.slice(1);
            return ({title: modified, col1: row.MedicationStatus, col2:row.MedicationTime });
        });

        setMedicationnData(dataCleaned);

        // let dataCleaned = observationData.map((row)=>{
        //     const modified = row.ObservationType.charAt(0).toUpperCase() + row.ObservationType.slice(1);
        //     return ({title: modified, col1: row.ObservationStatus, col2:row.ObservationTime });
        // });
        // setConditionnData(dataCleaned);

        // // Clean up diagnostic data
        // dataCleaned = diagnosticData.map((row)=>{
        //     const modified = row.DiagnosticReportType.charAt(0).toUpperCase() + row.DiagnosticReportType.slice(1);
        //     return ({title: modified, col1: row.DiagnosticReportStatus, col2:row.DiagnosticReportTime });
        // });
        // setDiagnosticReportData(dataCleaned);

        // // Clean up observation data
        // dataCleaned = conditionData != null && conditionData.map((row)=>{
        //     const modified = row.ConditionType.charAt(0).toUpperCase() + row.ConditionType.slice(1);
        //     return ({title: modified, col1: row.ConditionStatus, col2:row.ConditionTime });
        // });
        // setObservationData(dataCleaned);

        // Get a list of status
        // let uniqueStatus = new Set([...getStatusList(observationData), ...getStatusList(diagnosticData), ...getStatusList(conditionData)]);
        let uniqueStatus = new Set([...getStatusList(MedicationData_), ...getStatusList(diagnosticData), ...getStatusList(conditionData)]);
        setStatusTypesList(Array.from(uniqueStatus));
    }, []);

    return(
        <React.Fragment>
            <Grid container spacing={0}>
                <Grid sm={11} >
                    <SearchBar
                    statusTypeDisplayText = "Status Type"
                    statusTypeList={statusTypesList}
                    selectStatusType = {selectStatusType}
                    statusTypeHandle = {statusTypeHandle}

                    assessmentTypeDisplayText = "Data Type"
                    assessmentTypeList={assessmentTypes}
                    selectAssessmentType = {selectDataType}
                    assessmentTypeHandle = {dataTypeHandle}

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

                        <h2>Condition Data</h2>
                        <LoadMoreDataTable 
                        selectStatusType = {selectDataType.includes("Condition Data") ? selectStatusType : []}
                        searchInput = {selectDataType.includes("Condition Data") || selectDataType.length == 0 ? searchInput : ""}
                        data = {MedicationData_}
                        />

                        <h2>Diagnostic Data</h2>
                        <LoadMoreDataTable 
                        selectStatusType = {selectDataType.includes("Diagnostic Data") ? selectStatusType : []}
                        searchInput = {selectDataType.includes("Diagnostic Data") || selectDataType.length == 0 ? searchInput : ""}
                        data = {MedicationData_}
                        />

                        <h2>Observation Data</h2>
                        <LoadMoreDataTable 
                        selectStatusType = {selectDataType.includes("Observation Data") ? selectStatusType : []}
                        searchInput = {selectDataType.includes("Observation Data") || selectDataType.length == 0 ? searchInput : ""}
                        data = {MedicationData_}
                        />
                        
                    </div>
                </Grid>
                <Grid sm={1} />
            </Grid>
        </React.Fragment>
    );
}
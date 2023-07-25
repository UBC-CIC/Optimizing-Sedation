import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';

// Components
import LoadMoreDataTable from '../components/loadMoreDataTable';
import LoadMoreDataSearchBar from '../components/loadMoreDataSearchBar';

// Material UI
import Button from '@mui/material/Button';
import {Grid, Typography} from '@mui/material';

// Data processing modules
import processMedicationData from '../DataProcessing/medicationProcessing';
import processConditionData from '../DataProcessing/conditionProcessing';

// Constants
const MEDICATION = 0;
const DIAGNOSTIC = 1;

export default function LoadMoreData(){
    const [loadData, setLoadData] = useState(null);
    const [parsedTableData, setParsedTableData] = useState(null);
    const [statusList, setStatusList] = useState(null);

    // Search Filter State Variables
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type
    const [searchInput, setSearchInput] = useState("");
    
    useEffect(() => {
        // Wait for authrization status
        FHIR.oauth2.ready().then(onResolve).catch(onErr);
    }, []);

    

    //// Helper Functions ////
    async function readURLParameter(){
        try{
            const paramURL = await new URLSearchParams(window.location.search);
            
            console.log("data: ", paramURL.get('data'));
            const parsedJSONData = JSON.parse(paramURL.get('data'))
            setLoadData(parsedJSONData);

            return parsedJSONData;

        } catch (e){
            // When catch error, print error page
            console.log("errror!!", e);
            // return <Error404 />
        }
    }

    // Resolver funcitons
    async function onResolve(client) {
        // Read URL parameters
        const urlData = await readURLParameter();

        // while(loadData == null) {};

        // Operations
        if(urlData.dataCode == MEDICATION)
            client.request(`MedicationRequest/?patient=${client.patient.id}`).then((med) => {
                const parsedData = processMedicationData(med);

                const dataCleaned = parsedData.map((row)=>{
                    const modified = row.MedicationType.charAt(0).toUpperCase() + row.MedicationType.slice(1);
                    return ({title: modified, col1: row.MedicationStatus, col2:row.MedicationTime });
                });

                const statusList_ = getStatusList(dataCleaned);
                                
                setStatusList(Array.from(statusList_))
                setParsedTableData(dataCleaned);
            }).catch(onErr);
        
        if(urlData.dataCode == DIAGNOSTIC)
            client.request(`DiagnosticReport/?patient=${client.patient.id}`).then((diagnostic) => {
                const parsedData = processConditionData(diagnostic);

                const dataCleaned = parsedData.map((row)=>{
                    const modified = row.ConditionType.charAt(0).toUpperCase() + row.ConditionType.slice(1);
                    return ({title: modified, col1: row.ConditionStatus, col2:row.ConditionTime });
                });

                setParsedTableData(dataCleaned);
            }).catch(onErr);

    }

    function onErr(err) {
        console.log("Error, ", err);
    }

    function getStatusList(tableData){
        const list = new Set(tableData.map(obj => obj.col1));
        return list;
    }

    //// End of Helper Funtions ////

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

    //// End of Handler Functions ////


    return(
        <div>
            {loadData != null &&
            <React.Fragment>
                <Grid container spacing={0}>
                    <Grid sm = {2} xs = {0}/>
                    <Grid sm={8} xs={12}>
                        <div style={{
                            marginTop: '4vh',
                        }}>
                            <Grid container spacing={0}>
                                <Grid sm={11} >
                                    <LoadMoreDataSearchBar 
                                    selectStatusType = {selectStatusType}
                                    statusTypeHandle = {statusTypeHandle}
                                    searchInput = {searchInput}
                                    searchInputHandle = {searchInputHandle}
                                    statusList = {statusList}
                                    />
                                </Grid>
                                <Grid sm={1} />
                                {
                                <Grid sm={11} >
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
                                </Grid>
                                }
                                <Grid sm={1} />
                            </Grid>
                        </div>
                    </Grid>
                    <Grid sm = {2} xs = {0}/>
                </Grid>
            </React.Fragment>
            }

            {loadData == null && 
                <h1>Error 404</h1>
            }
        </div>
    );
}
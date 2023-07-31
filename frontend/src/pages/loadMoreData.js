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
        
        // Request Observation
        client.request(`Observation/?patient=${client.patient.id}`).then((data) => {
            console.log("Observation: ", data);
        }).catch(onErr);

        // Random Requests 
        // const code  = ["93246-7", "32623-1"];
        // client.request(`Observation/?patient=${client.patient.id}&code=${code}`).then((data) => {
        //     console.log("Dental: ", data);
        // }).catch(onErr);

        const DENTISTRY_LOINC = [
            "32864-1", "32865-8", "32866-6", "32867-4", "32868-2", "32869-0", "32871-6", "32874-0", "32875-7", "32876-5", 
            "32877-3", "32878-1", "32879-9", "32880-7", "32881-5", "32882-3", "32883-1", "32888-0", "32889-8", "32890-6", 
            "32891-4", "32892-2", "32894-8", "32895-5", "32898-9", "32899-7", "32900-3", "32901-1", "32902-9", "32904-5", 
            "32906-0", "32907-8", "32908-6", "32910-2", "32911-0", "32913-6", "32914-4", "32915-1", "32916-9", "32917-7", 
            "32918-5", "32919-3", "32920-1", "32921-9", "32922-7", "32923-5", "32924-3", "32925-0", "32926-8", "32927-6", 
            "32928-4", "32929-2", "32930-0", "32931-8", "32932-6", "32933-4", "32934-2", "32935-9", "32936-7", "32937-5", 
            "32938-3", "32939-1", "32940-9", "32941-7", "32942-5", "32945-8", "32946-6", "32947-4", "32948-2", "32949-0", 
            "32950-8", "32951-6", "32952-4", "32953-2", "32954-0", "32955-7", "32956-5", "32957-3", "32958-1", "32959-9", 
            "32960-7", "32961-5", "32962-3", "32963-1", "32964-9", "32965-6", "32966-4", "32967-2", "32968-0", "32969-8", 
            "32970-6", "32971-4", "32972-2", "32973-0", "32975-5", "32976-3", "32977-1", "32978-9", "33992-9", "33993-7", 
            "33994-5", "33995-2", "33996-0", "33997-8", "33998-6", "34000-0", "34001-8", "34002-6", "34003-4", "34004-2", 
            "34005-9", "34006-7", "34007-5", "34009-1", "34010-9", "34011-7", "34012-5", "34013-3", "34014-1", "34015-8", 
            "34016-6", "34017-4", "34021-6", "34024-0", "34025-7", "34026-5", "34028-1", "34029-9", "34030-7", "34031-5", 
            "34032-3", "34033-1", "34034-9", "34035-6", "34036-4", "34037-2", "34038-0", "34039-8", "34040-6", "34041-4", 
            "34042-2", "34043-0", "34044-8", "34045-5", "34047-1", "34048-9", "34049-7", "60601-2", "60602-0", "60603-8", 
            "60604-6", "60605-3", "60606-1", "60607-9", "60608-7", "60609-5", "60610-3", "60611-1", "60612-9", "60613-7", 
            "60614-5", "60615-2", "60616-0", "60617-8", "60619-4", "60620-2", "60621-0", "60622-8", "60623-6", "60624-4", 
            "60625-1", "60628-5", "60629-3", "60630-1", "60631-9", "60632-7", "60633-5", "60634-3", "60635-0", "60636-8", 
            "60637-6", "60638-4", "60640-0", "60641-8", "60642-6", "60643-4", "60644-2", "60645-9", "60646-7", "60647-5", 
            "60648-3", "60649-1", "60650-9", "60651-7", "60652-5", "60653-3", "60654-1", "60655-8", "60656-6", "60657-4", 
            "60661-6", "60662-4", "60663-2", "60664-0", "60666-5", "60667-3", "60668-1", "60669-9", "60670-7", "60671-5", 
            "60672-3", "60673-1", "60674-9", "60675-6", "60686-3", "74049-8", "85270-7", "85271-5", "85272-3", "90855-8", 
            "90856-6", "90857-4", "90858-2", "90859-0", "90860-8", "90861-6", "90862-4", "90863-2", "90864-0", "90865-7", 
            "90866-5", "90867-3", "90868-1", "90870-7", "90871-5", "90872-3", "90928-3", "90929-1", "90930-9", "90931-7", 
            "90932-5"
        ];
        client.request(`Observation/?patient=${client.patient.id}&code=${DENTISTRY_LOINC}`).then((data) => {
            console.log("Dental: ", data);
        }).catch(onErr);

        // client.request(`Observation/?value-string=apple&patient=${client.patient.id}`).then((data) => {
        //     console.log("Dental: ", data);
        // }).catch(onErr);

        // client.request(`Observation/?patient=${client.patient.id}&code=http://loinc.org|32880-7`).then((data) => {
        //     console.log("Dental: ", data);
        // }).catch(onErr);

        // client.request(`Observation/?patient=${client.patient.id}`).then((data) => {
        //     console.log("Dental: ", data);
        // }).catch(onErr);

        // client
        // // .search({
        // //     type: 'Observation',
        // //     query: {
        // //       subject: `Patient/${client.patient.id}`,
        // //       code: '100566-9',
        // //     },
        // //   })
        //   .request({
        //     url: 'Observation', // Resource type (Observation in this case)
        //     method: 'GET',
        //     params: {
        //         patient: client.patient.id,
        //         code: '100566-9',
        //     },
        //   })
        //   .then((dental) => {
        //     console.log("Dental: ", dental);
        // }).catch(onErr);
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
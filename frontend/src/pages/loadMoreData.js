import React, { useState, useEffect } from 'react';
import FHIR from 'fhirclient';

// Components
import LoadMoreDataTable from '../components/loadMoreDataTable';
import LoadMoreDataSearchBar from '../components/loadMoreDataSearchBar';

// Material UI
import Button from '@mui/material/Button';
import {Grid, Typography} from '@mui/material';


export default function LoadMoreData(){
    const [loadData, setLoadData] = useState(null);


    // Search Filter State Variables
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type
    const [selectAssessmentType, setSelectAssessmentType] = useState([]);             // Current selection for assessment type
    const [searchInput, setSearchInput] = useState("");
    
    useEffect(() => {
        try{
            const paramURL = new URLSearchParams(window.location.search);
            setLoadData(JSON.parse(paramURL.get('data')));

            console.log("data: ", JSON.parse(paramURL.get('data')));

        } catch (e){
            // When catch error, print error page
            console.log("errror!!", e);
            // return <Error404 />
        }
    }, []);

    function onErr(err) {
        console.log("Error, ", err);
    }

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
                                    {/* <SearchBar 
                                    selectStatusType = {selectStatusType}
                                    statusTypeHandle = {statusTypeHandle}
                                    selectAssessmentType = {selectAssessmentType}
                                    assessmentTypeHandle = {assessmentTypeHandle}
                                    searchInput = {searchInput}
                                    searchInputHandle = {searchInputHandle}
                                    /> */}
                                </Grid>
                                <Grid sm={1} />

                                <Grid sm={11} >
                                    <div style={{paddingTop:'2vh'}}>
                                        <center>
                                            <h1>{loadData.title}</h1>
                                        </center>
                                        <LoadMoreDataTable 
                                        selectStatusType = {selectStatusType}
                                        searchInput = {searchInput}
                                        data = {loadData.moduleData}
                                        />
                                    </div>
                                </Grid>
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
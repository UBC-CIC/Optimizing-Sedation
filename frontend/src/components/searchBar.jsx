import React, { useState, useRef, useEffect} from 'react';


// Material UI
import {Grid, InputBase, Paper} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';


const ITEM_HEIGHT = 50;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

function getStyles(name, list, theme) {
    return {
        fontWeight:
        list.indexOf(name) === -1
            ? theme.typography.fontWeightRegular
            : theme.typography.fontWeightMedium,
    };
}

export default function SearchBar(){
    const [selectStatusType, setSelectStatusType] = useState([]);                     // Current selection for status type
    const [selectAssessmentType, setSelectAssessmentType] = useState([]);             // Current selection for assessment type
    const [searchInput, setSearchInput] = useState(undefined);


    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);

    // Selector
    const names = [
        'Oliver Hansen',
        'Van Henry',
        'April Tucker',
        'Ralph Hubbard',
        'Omar Alexander',
        'Carlos Abbott',
        'Miriam Wagner',
        'Bradley Wilkerson',
        'Virginia Andrews',
        'Kelly Snyder',
    ];

    const theme = useTheme();

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
        // Set fixed height for all sibiling
        const siblingHeight = ref1.current.clientHeight;

        ref2.current.style.height = `${siblingHeight}px`;
        ref3.current.style.height = `${siblingHeight}px`;
    }, []);

    return(
        <div>
            <Grid container justify="center" alignItems="center" spacing={0} >
                <Grid sm={4} xs={12}>
                    <Paper
                        ref={ref1}
                        component="form"
                        sx={{ p: '10px', display: 'flex', alignItems: 'center', marginLeft:'10px', marginRight:'10px', backgroundColor:'#e7e8eb'}}
                    >
                        <SearchIcon />
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Search"
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={searchInputHandle}
                        />
                    </Paper>
                </Grid>

                <Grid sm={4} xs={12}>
                    <Paper style={{marginLeft:'10px', marginRight:'10px', backgroundColor:'#e7e8eb'}}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-multiple-chip-label">Type of Assessment</InputLabel>
                            <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            displayEmpty
                            multiple
                            ref={ref2}
                            value={selectAssessmentType}
                            onChange={assessmentTypeHandle}
                            input={<OutlinedInput id="select-multiple-chip" label="Type of Assessment" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                    <div style={{ overflowX: 'auto', scrollbarDidth: 'thin', scrollbarColor: 'gray'}}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </div>
                                </Box>
                            )}
                            MenuProps={MenuProps}
                            >
                            {names.map((name) => (
                                <MenuItem
                                key={name}
                                value={name}
                                style={getStyles(name, selectStatusType, theme)}
                                >
                                {name}
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>

                <Grid sm={4} xs={12}>
                    <Paper style={{marginLeft:'10px', marginRight:'10px', backgroundColor:'#e7e8eb'}}>
                        <FormControl fullWidth >
                            <InputLabel id="demo-multiple-chip-label">Flag Type</InputLabel>
                            <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            displayEmpty
                            multiple
                            ref={ref3}
                            value={selectStatusType}
                            onChange={statusTypeHandle}
                            input={<OutlinedInput id="select-multiple-chip" label="Flag Type" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                    <div style={{ overflowX: 'auto', scrollbarDidth: 'thin', scrollbarColor: 'gray'}}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </div>
                                </Box>
                            )}

                            MenuProps={MenuProps}
                            >
                            {names.map((name) => (
                                <MenuItem
                                key={name}
                                value={name}
                                style={getStyles(name, selectStatusType, theme)}
                                >
                                {name}
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
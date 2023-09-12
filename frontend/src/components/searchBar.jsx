import React, { useRef, useEffect} from 'react';


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

export default function SearchBar({ statusTypeDisplayText, statusTypeList, selectStatusType, statusTypeHandle, 
                                    assessmentTypeDisplayText, assessmentTypeList, selectAssessmentType, assessmentTypeHandle, 
                                    searchInput, searchInputHandle}){

    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);

    const theme = useTheme();

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
            marginTop: '0.7vh',
            marginBottom: '0.7vh',
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

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault(); // Prevent the default Enter key behavior
        }
      };


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
                            value={searchInput}
                            onChange={searchInputHandle}
                            onKeyDown={ handleKeyDown }
                        />
                    </Paper>
                </Grid>

                <Grid sm={4} xs={12}>
                    <Paper style={{marginLeft:'10px', marginRight:'10px', backgroundColor:'#e7e8eb'}}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-multiple-chip-label">{(assessmentTypeDisplayText != null) ? assessmentTypeDisplayText : "Type of Assessment"}</InputLabel>
                            <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            displayEmpty
                            multiple
                            ref={ref2}
                            value={selectAssessmentType}
                            onChange={assessmentTypeHandle}
                            input={<OutlinedInput id="select-multiple-chip" label={(assessmentTypeDisplayText != null) ? assessmentTypeDisplayText : "Type of Assessment"} />}
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
                            {assessmentTypeList != null &&  assessmentTypeList.map((name) => (
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
                            <InputLabel id="demo-multiple-chip-label">{(statusTypeDisplayText != null) ? statusTypeDisplayText : "Flag Type"}</InputLabel>
                            <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            displayEmpty
                            multiple
                            ref={ref3}
                            value={selectStatusType}
                            onChange={statusTypeHandle}
                            input={<OutlinedInput id="select-multiple-chip" label={(statusTypeDisplayText != null) ? statusTypeDisplayText : "Flag Type"} />}
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
                            {statusTypeList != null && statusTypeList.map((name) => (
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
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  {
    field: 'title',
    flex: 1,
    headerName: 'Title',
    editable: false,
    headerClassName: 'classA',
  },
  {
    field: 'col1',
    headerName: 'Status',
    flex: 0.5,
    editable: false,
    headerClassName: 'classA',
  },
  {
    field: 'col2',
    headerName: 'Date',
    flex: 0.5,
    editable: false,
    headerClassName: 'classA',
  },
];

export default function CustomedDataGrid({medDiagData}) {
    const [data, setData] = useState([]);

    useEffect(() => {
        setData(medDiagData.filter((item)=>(item.title.toLowerCase().includes(""))));
    },[medDiagData]);

    return (
    <Box sx={{ 
        width: '100%', 
        '& .classA': {
            backgroundColor: '#4A4B4C',
            color: 'white'
        },
        }}>
        <DataGrid
        rows={data}
        columns={columns}
        initialState={{
            pagination: {
            paginationModel: {
                pageSize: 20,
            },
            },
        }}
        pageSizeOptions={[20]}
        disableRowSelectionOnClick
        />
    </Box>
  );
}

import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbarFilterButton } from '@mui/x-data-grid';

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

    return (
    <Box sx={{ 
      backgroundColor: 'white',
      width: '100%',
      '& .classA': {
        // backgroundColor: '#f3f6f9',
      }
      }}>
        <DataGrid
        rows={medDiagData}
        columns={columns}
        slots={{
          toolbar: GridToolbarFilterButton,
        }}
        initialState={{
            pagination: {
            paginationModel: {
                pageSize: 15,
            },
            },
        }}
        pageSizeOptions={[15]}
        disableRowSelectionOnClick
        />
    </Box>
  );
}

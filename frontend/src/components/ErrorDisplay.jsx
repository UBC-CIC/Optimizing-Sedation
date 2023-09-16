import {Typography} from '@mui/material';

export default function ErrorDisplay({errorMsg, msgForUser}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'nowrap',
            height: '100vh',
            backgroundColor: 'cornsilk'
        }}>
            <Typography variant={"h5"}>ERROR,</Typography>
            <Typography variant={"h6"} color="green">{msgForUser}</Typography>
            <Typography variant={"h6"} color="green">Maybe try relaunching the app</Typography>
            <Typography variant={"subtitle1"} color="#e91e63">({errorMsg})</Typography>
        </div>
    );
}

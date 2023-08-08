# Optimizing-Sedation
.env file should be in the form of
```
REACT_APP_REDIRECT_URI=RedirectURI_ForTestingUse_http://localhost:3000/
REACT_APP_CLIENT_ID=ClientID
```

# Creating Local Docker Image and Run
```
docker build -t sedation .
cd frontend
docker run --env-file .env -p 3000:3000 sedation 
```


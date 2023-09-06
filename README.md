# Optimizing-Sedation
.env file should be in the form of
```
REACT_APP_CLIENT_SECRET=secret
REACT_APP_CLIENT_ID=id
```

# Creating Local Docker Image and Run
```
docker build -t sedation .
cd frontend
docker run --env-file .env -p 3000:3000 sedation 
```
# Deployment
To deploy this solution into your AWS Account please follow our [Deployment Guide](./docs/DeploymentGuide.md)

# Disclaimer
This application is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Use of this application or any information provided by this application **is solely at your own risk**.
This application is for **demonstration purposes only**.

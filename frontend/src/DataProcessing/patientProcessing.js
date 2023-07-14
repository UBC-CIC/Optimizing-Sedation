function processPatientData(PatientData) {
    const results = [];
  
    if (PatientData) {  
        let PatientName = 'N/A';

        if (PatientData.name){
            for (const name of PatientData.name){
                if (name.use === "official"){
                    PatientName = name.family + ", " + name.given.join(" ");
                }
            }
        }

        let PatientMRN = 'N/A';

        if (PatientData.identifier) {
            for (const identifier of PatientData.identifier) {
                if (identifier.type && identifier.type.text === "Medical Record Number") {
                    PatientMRN = identifier.value;
                    break;
                }
            }
        }

        const PatientContactName =
          PatientData.contact
            ? PatientData.contact.name.text
            : 'N/A';

        const PatientContactEmail =
            PatientData.contact
              ? PatientData.contact.telecom.value
              : 'N/A';
        
        results.push({ PatientName, PatientMRN, PatientContactName, PatientContactEmail });
    }
    console.log("Patient Name: ", results);
    return results;
  }

export default processPatientData;
function processPatientData(PatientData) {
    const results = [];
  
    if (PatientData) {  
        try {
            let PatientName = 'N/A';
            let PatientMRN = 'N/A';
            let PatientContactName = 'N/A';
            let PatientContactInfo = 'N/A';
    
            if (PatientData.name){
                for (const name of PatientData.name){
                    if (name.use === "official"){
                        PatientName = name.family + ", " + name.given.join(" ");
                    }
                }
                else{
                    PatientName = name.family + ", " + name.given.join(" ");
                }
            }
    
            if (PatientData.identifier) {
                for (const identifier of PatientData.identifier) {
                    if (identifier.type && (identifier.type.text === "Medical Record Number"  || identifier.type.text === "MRN")) {
                        if (identifier.period){
                            if (!identifier.period.end){
                                PatientMRN = identifier.value;
                                break;
                            }
                        }
                        else if (!identifier.period){
                            PatientMRN = identifier.value;
                            break;
                        }
                    }
                }
            }
        }

        if (PatientData.contact){
            for (const contact of PatientData.contact){
                    if (contact.name){
                        if(contact.name.text){
                            PatientContactName = contact.name.text
                        }
                        else if (contact.name.given && contact.name.family){
                            PatientContactName = contact.name.family + ", " + contact.name.given.join(" ");
                        }
                    for (const telecom of contact.telecom){
                        if (telecom.rank && telecom.rank === 1){
                            PatientContactInfo = telecom.value
                            break;
                        }
                        else if (telecom.value){
                            PatientContactInfo = telecom.value
                        }
                    }
                }
            }
            
            results.push({ PatientName, PatientMRN, PatientContactName, PatientContactInfo });
        } catch (error) { }
    }

    return results;
  }

export default processPatientData;
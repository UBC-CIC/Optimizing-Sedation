function processMedicationData(MedicationData) {
    const results = [];
  
    if (MedicationData && MedicationData.entry[0].resource) {
      MedicationData.entry.forEach((entry) => {
        const MedicationType =
          entry.resource.medicationCodeableConcept
            ? entry.resource.medicationCodeableConcept.text
            : 'N/A';
        
        const MedicationStatus =
          entry.resource.status
            ? entry.resource.status
            : 'N/A';

            const MedicationTime =
            entry.resource.authoredOn
              ? entry.resource.authoredOn
              : 'N/A';
  
        results.push({MedicationType, MedicationStatus, MedicationTime});
      });
    }
    
    return results;
  }

export default processMedicationData;
function processMedicationData(MedicationData) {
    const results = [];
    const uniqueEntries = new Set();
  
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
  
        const entryString = `${MedicationType}-${MedicationStatus}-${MedicationTime}`;
        if (!uniqueEntries.has(entryString)) {
          uniqueEntries.add(entryString);
          results.push({ MedicationType, MedicationStatus, MedicationTime });
        }
      });
    }
    
    return results;
  }

export default processMedicationData;
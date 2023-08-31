function processConditionData(ConditionData) {
    const results = [];
    const uniqueEntries = new Set();
  
    if (ConditionData && ConditionData.entry) {
      ConditionData.entry.forEach((entry) => {
        const ConditionType =
          entry.resource.code.coding && entry.resource.code.coding.length > 0
            ? entry.resource.code.coding[0].display 
            : 'N/A';
        
        const ConditionStatus =
          entry.resource.clinicalStatus
            ? entry.resource.clinicalStatus.coding[0].code
            : 'N/A';

        let ConditionTime = "N/A";
        if(entry.resource.recordedDate)
        ConditionTime = entry.resource.recordedDate.substring(0, 10)
        else if (entry.resource.onsetDateTime)
        ConditionTime = entry.resource.onsetDateTime.substring(0, 10)
  
        const entryString = `${ConditionType}-${ConditionStatus}-${ConditionTime}`;
          if (!uniqueEntries.has(entryString)) {
            uniqueEntries.add(entryString);
            results.push({ ConditionType, ConditionStatus, ConditionTime });
          }
      });
    }
    
    return results;
  }

  export default processConditionData;
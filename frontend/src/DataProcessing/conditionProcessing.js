function processConditionData(ConditionData) {
    const results = [];
    const uniqueEntries = new Set();
  
    if (ConditionData && ConditionData.entry[0].resource) {
      ConditionData.entry.forEach((entry) => {
        const ConditionType =
          entry.resource.code
            ? entry.resource.code.text
            : 'N/A';
        
        const ConditionStatus =
          entry.resource.clinicalStatus
            ? entry.resource.clinicalStatus.coding[0].code
            : 'N/A';

        const ConditionTime =
          entry.resource.recordedDate
            ? entry.resource.recordedDate
            : 'N/A';
  
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
function processConditionData(ConditionData) {
    const results = [];
  
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
  
        results.push({ConditionType, ConditionStatus, ConditionTime});
      });
    }
    
    return results;
  }

  export default processConditionData;
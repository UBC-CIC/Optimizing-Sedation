function processImmunizationData(ImmunizationData) {
    const results = [];
  
    if (ImmunizationData && ImmunizationData.entry[0].resource) {
      ImmunizationData.entry.forEach((entry) => {
        const ImmunizationType =
          entry.resource
            ? entry.resource.vaccineCode.text
            : 'N/A';
        
        const ImmunizationStatus =
          entry.resource.status
            ? entry.resource.status
            : 'N/A';

            const ImmunizationTime =
            entry.resource.occurrenceDateTime
              ? entry.resource.occurrenceDateTime
              : 'N/A';
  
        results.push({ImmunizationType, ImmunizationStatus, ImmunizationTime});
      });
    }
    
    return results;
  }

  export default processImmunizationData;
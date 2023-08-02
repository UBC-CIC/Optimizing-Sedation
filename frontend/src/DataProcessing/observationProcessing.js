function processObservationData(ObservationData) {
    const results = [];
    const uniqueEntries = new Set();
  
    if (ObservationData && ObservationData.entry[0].resource) {
      ObservationData.entry.forEach((entry) => {
        if (entry.resource.category) {
          if (entry.resource.category[0].coding) {
            if (entry.resource.category[0].coding[0].display.toLowerCase() === "laboratory"){
                const ObservationType = entry.resource
                ? entry.resource.code.text
                : 'N/A';
        
                const ObservationValue = entry.resource.valueQuantity
                ? entry.resource.valueQuantity.value + " " + entry.resource.valueQuantity.unit
                : 'N/A';
        
                const ObservationTime = entry.resource.effectiveDateTime
                ? entry.resource.effectiveDateTime
                : 'N/A';

                const ObservationID = entry.resource.id
                ? entry.resource.id
                : 'N/A';
        
                const entryString = `${ObservationType}-${ObservationValue}-${ObservationTime}`;
                if (!uniqueEntries.has(entryString)) {
                uniqueEntries.add(entryString);
                results.push({ ObservationType, ObservationValue, ObservationTime, ObservationID });
                }
            }
          }
        }
      });
    }
  
    return results;
  }
  
  export default processObservationData;
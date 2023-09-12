import getReadableObservation from "./lib";

function processObservationData(ObservationData) {
    const results = [];
    const uniqueEntries = new Set();
  
    if (ObservationData && ObservationData.entry) {
      ObservationData.entry.forEach((entry) => {
        try {
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
                  ? entry.resource.effectiveDateTime.substring(0, 10)
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
        } catch (error) {}
      });
    }
  
    return results;
  }

function processAllObservationData(ObservationData) {
  const results = [];
  const uniqueEntries = new Set();

  if (ObservationData && ObservationData.entry) {
    ObservationData.entry.forEach((entry) => {
      try {
        const en = getReadableObservation(entry);
  
        const entryString = `${en.type}-${en.value}-${en.time}`;
        if (!uniqueEntries.has(entryString)) {
          uniqueEntries.add(entryString);
          results.push({ ObservationType: en.type, ObservationValue: en.value, ObservationTime: en.time, ObservationID: en.id, ObservationOther: en.other });
        }
      } catch (error) { }
    });
  }

  return results;
}

export {
  processObservationData, 
  processAllObservationData
};
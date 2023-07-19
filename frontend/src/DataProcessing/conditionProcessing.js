function processConditionData(ConditionData) {
  const results = [];
  const uniqueEntries = new Map(); // // Keeps track of the most recent entries for each ConditionType

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

      // If we have already seen this ConditionType, compare ConditionTime and update the entry if it's more recent.
      if (uniqueEntries.has(ConditionType)) {
        const currentEntry = uniqueEntries.get(ConditionType);
        if (compareDates(currentEntry.ConditionTime, ConditionTime) > 0) {
          uniqueEntries.set(ConditionType, { ConditionType, ConditionStatus, ConditionTime });
        }
      } else {
        uniqueEntries.set(ConditionType, { ConditionType, ConditionStatus, ConditionTime });
      }
    });

    // Convert the map values back to an array of results
    results.push(...uniqueEntries.values());
  }
  
  return results;
}

// Compares two dates in the format "year-month-day" or "year-month-dayThour:minute:second"
function compareDates(date1, date2) {
const timestamp1 = new Date(date1).getTime();
const timestamp2 = new Date(date2).getTime();
return timestamp2 - timestamp1;
}

export default processConditionData;
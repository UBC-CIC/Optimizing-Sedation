function processMedicationData(MedicationData) {
    const results = [];
    const uniqueEntries = new Map(); // Keeps track of the most recent entries for each MedicationType
  
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

          // If we have already seen this MedicationType, compare MedicationTime and update the entry if it's more recent.
        if (uniqueEntries.has(MedicationType)) {
          const currentEntry = uniqueEntries.get(MedicationType);
          if (compareDates(currentEntry.MedicationTime, MedicationTime) > 0) {
            uniqueEntries.set(MedicationType, { MedicationType, MedicationStatus, MedicationTime });
          }
        } else {
          uniqueEntries.set(MedicationType, { MedicationType, MedicationStatus, MedicationTime });
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

export default processMedicationData;
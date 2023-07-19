function processImmunizationData(ImmunizationData) {
  const results = [];
  const uniqueEntries = new Map(); // Keeps track of the most recent entries for each ImmunizationType

  if (ImmunizationData && ImmunizationData.entry[0].resource) {
    ImmunizationData.entry.forEach((entry) => {
      const ImmunizationType = entry.resource
        ? entry.resource.vaccineCode.text
        : 'N/A';

      const ImmunizationStatus = entry.resource.status
        ? entry.resource.status
        : 'N/A';

      let ImmunizationTime = entry.resource.occurrenceDateTime
        ? entry.resource.occurrenceDateTime
        : 'N/A';

      // If we have already seen this ImmunizationType, compare ImmunizationTime and update the entry if it's more recent.
      if (uniqueEntries.has(ImmunizationType)) {
        const currentEntry = uniqueEntries.get(ImmunizationType);
        if (compareDates(currentEntry.ImmunizationTime, ImmunizationTime) > 0) {
          uniqueEntries.set(ImmunizationType, { ImmunizationType, ImmunizationStatus, ImmunizationTime });
        }
      } else {
        uniqueEntries.set(ImmunizationType, { ImmunizationType, ImmunizationStatus, ImmunizationTime });
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

export default processImmunizationData;

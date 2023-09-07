function processImmunizationData(ImmunizationData) {
  const results = [];
  const uniqueEntries = new Set();

  if (ImmunizationData && ImmunizationData.entry) {
    ImmunizationData.entry.forEach((entry) => {
      try {
        const ImmunizationType = entry.resource
          ? entry.resource.vaccineCode.text
          : 'N/A';

        const ImmunizationStatus = entry.resource.status
          ? entry.resource.status
          : 'N/A';

        const ImmunizationTime = entry.resource.occurrenceDateTime
          ? entry.resource.occurrenceDateTime.substring(0, 10)
          : 'N/A';

        const entryString = `${ImmunizationType}-${ImmunizationStatus}-${ImmunizationTime}`;
        if (!uniqueEntries.has(entryString)) {
          uniqueEntries.add(entryString);
          results.push({ ImmunizationType, ImmunizationStatus, ImmunizationTime });
        }
      } catch (error) {}
    });
  }

  return results;
}

export default processImmunizationData;

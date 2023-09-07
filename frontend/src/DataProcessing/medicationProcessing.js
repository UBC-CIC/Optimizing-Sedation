function processMedicationData(MedicationData) {
  const results = [];
  const uniqueEntries = new Set();

  if (MedicationData && MedicationData.entry) {
    MedicationData.entry.forEach((entry) => {
      try {
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
            ? entry.resource.authoredOn.substring(0, 10)
            : 'N/A';
  
        const entryString = `${MedicationType}-${MedicationStatus}-${MedicationTime}`;
        if (!uniqueEntries.has(entryString)) {
          uniqueEntries.add(entryString);
  
          // Checks if MedicationTime is within the last six months
          if (isWithinLastSixMonths(MedicationTime)) {
            results.push({ MedicationType, MedicationStatus, MedicationTime });
          }
        }
      } catch (error) {}
    });
  }

  return results;
}

// Checks if a date string is within the last six months
function isWithinLastSixMonths(dateString) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const medicationDate = new Date(dateString);
  return medicationDate >= sixMonthsAgo;
}

export default processMedicationData;

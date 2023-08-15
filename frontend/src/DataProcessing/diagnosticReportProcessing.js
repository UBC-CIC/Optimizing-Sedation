function processDiagnosticReportData(DiagnosticReportData) {
  const results = [];
  const uniqueEntries = new Set();

  if (DiagnosticReportData && DiagnosticReportData.entry[0].resource) {
    DiagnosticReportData.entry.forEach((entry) => {
      if (
        entry.resource.category &&
        entry.resource.category[0].coding &&
        entry.resource.category[0].coding[0].display.toLowerCase() === "laboratory"
      ) {
        const DiagnosticReportType = entry.resource
          ? entry.resource.code.text
          : 'N/A';

        let DiagnosticReportReferences = ['N/A']; // Initialize as an array with 'N/A' in case there are no References

        if (entry.resource.result && Array.isArray(entry.resource.result)) {
          DiagnosticReportReferences = entry.resource.result.map((resultEntry) => {
            return resultEntry.reference ? resultEntry.reference : 'N/A';
          });
        }

        const DiagnosticReportTime = entry.resource.effectiveDateTime
          ? entry.resource.effectiveDateTime
          : 'N/A';

        const entryString = `${DiagnosticReportType}-${DiagnosticReportReferences.join(",")}-${DiagnosticReportTime}`;
        if (!uniqueEntries.has(entryString)) {
          uniqueEntries.add(entryString);
          // results.push({ DiagnosticReportType, DiagnosticReportReferences, DiagnosticReportTime });
          results.push({ title: DiagnosticReportType, references: DiagnosticReportReferences, time: DiagnosticReportTime });
        }
      }
    });
  }

  return results;
}

export default processDiagnosticReportData;

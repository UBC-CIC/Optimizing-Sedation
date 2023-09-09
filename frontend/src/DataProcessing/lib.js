export default function getReadableObservation(entry){
    const type = entry.resource
    ? entry.resource.code.text
    : 'N/A';
    
    // Get value readings
    // Need to consider other datatype
    let value = 'N/A'; 
    if(entry.resource.valueQuantity)
    value = entry.resource.valueQuantity.value + " " + ((entry.resource.valueQuantity.unit) ? entry.resource.valueQuantity.unit:" ");
    else if (entry.resource.valueCodeableConcept)
    value = entry.resource.valueCodeableConcept.text;
    else if (entry.resource.valueString)
    value = entry.resource.valueString;
    else if (entry.resource.valueBoolean)
    value = entry.resource.valueBoolean.toString();
    else if (entry.resource.valueInteger)
    value = entry.resource.valueInteger.toString();
    else if (entry.resource.valueRange)
    value = entry.resource.valueRange.low && entry.resource.valueRange.high ? '[' + entry.resource.valueRange.low + ', ' + entry.resource.valueRange.high + ']': 'N/A';
    else if (entry.resource.valueRatio)
    value = entry.resource.valueRatio.numerator && entry.resource.valueRange.denominator	 ? entry.resource.valueRatio.numerator.value + ':' + entry.resource.valueRange.denominator.value: 'N/A';

    let time = 'N/A';
    if(entry.resource.effectiveDateTime)
    time = entry.resource.effectiveDateTime.substring(0, 10);
    else if (entry.resource.performedDateTime)
    time = entry.resource.performedDateTime.substring(0,10);

    const id = entry.resource.id
    ? entry.resource.id
    : 'N/A';

    // Others
    let other = [];
    if(entry.resource.interpretation){
        let inter = 1;
        for (let i in entry.resource.interpretation){
            other.push("Interpretation " + (inter) + ": " + entry.resource.interpretation[i].text);
            inter++;
        }
    }
    if(entry.resource.note){
        let note = 1;
        for (let i in entry.resource.note){
            other.push("Note " + (note) + ": " + entry.resource.note[i].text);
            note++;
        }
    }

    return { type, value, time, id, other};
}
export function makeGraph(slope){
    let xValues = Array.from(Array(10).keys());
    let yValues = xValues.map(x => x * slope);
    return [xValues, yValues];
}
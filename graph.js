export function makeGraph(slope){

    const numberDistanceInc = 50; const numberTimeInc = 200;
    const distanceKeys = Array.from(new Array(numberDistanceInc + 1).keys());
    const timeKeys = Array.from(new Array(numberTimeInc + 1).keys());

    const F = 96485, R = 8.31451;

    let E1 = 0.2, E2 = -0.3, E0 = 0.013;
    let n = 1, C = 6.1e-8, D = 1e-5, k0 = 1, k1 = 0.075, a = 0.5, v = 0.04, A = 2.54e-2, T = 293.15;

    let potentialRange = E2 - E1
    let potentialInc = potentialRange / (numberTimeInc / 2);
    let tTotal = Math.abs((2 * (E2 - E1)) / v);
    let tInc = tTotal / numberTimeInc;
    let xTotal = 6 * Math.sqrt(D * tTotal);
    let xInc = xTotal / numberDistanceInc;
    let l = (D * tInc) / (xInc ** 2);

    let timeArray = timeKeys.map(i => i * tInc);
    let potentialArray = timeKeys.map(function(i){
        if (i <= 100){
            return (E1 + i * potentialInc);
        }else{
            return (E2 - (i - 100) * potentialInc);
        }
    });

    let kfArray = timeKeys.map(function(i){
        k0 * Math.exp(
            (-1 * a * n * F * (potentialArray[i] - E0)) / (R * T)
        );
    });
    let kbArray = timeKeys.map(function(i){
        k0 * Math.exp(
            ((1 - a) * n * F * (potentialArray[i] - E0)) / (R * T)
        );
    });

    let Cox = new Array(numberTimeInc + 1).fill(new Array(numberDistanceInc));
    let Cred = new Array(numberTimeInc + 1).fill(new Array(numberDistanceInc));

    let Jox = new Array(numberTimeInc + 1);
    let Jred = new Array(numberTimeInc + 1);

    for (let i = 0; i < numberTimeInc + 1; i++){
        for (let j = numberDistanceInc - 1; j >= 0; j--){
            if (i == 0 || j == numberDistanceInc - 1){
                Cox[i][j] = C;
                Cred[i][j] = 0;
            }else if (j == 0){
                Jox[i] = (kfArray[i] * Cox[i][1] - kbArray[i] * Cred[i][1]) / (1 + ((kfArray[i] * xInc) / D) + ((kbArray[i] * xInc) / D));
                Jred[i] = -1 * Jox[i];
                Cox[i][j] = Cox[i][1] + (Jox[i] * xInc) / D;
                Cred[i][j] = Cred[i][1] + (Jred[i] * xInc) / D;
            }else{
                Cox[i][j] = Cox[i - 1][j] + l * (Cox[i - 1][j - 1] - 2 * Cox[i - 1][j] + Cox[i - 1][j + 1]);
                Cred[i][j] = Cred[i - 1][j] + l * (Cred[i - 1][j - 1] - 2 * Cred[i - 1][j] + Cred[i - 1][j + 1]);
            }
        }
    }

    let xValues = timeArray;
    let yValues = potentialArray;
    return [xValues, yValues];
}
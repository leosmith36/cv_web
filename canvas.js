function makeGraph(nu, e0){

    const numberDistanceInc = 50; const numberTimeInc = 200;
    const distanceKeys = Array.from(new Array(numberDistanceInc + 1).keys());
    const timeKeys = Array.from(new Array(numberTimeInc + 1).keys());

    const F = 96485, R = 8.31451;

    let E1 = 0.2, E2 = -0.3, E0 = e0;
    let n = 1, C = 6.1e-8, D = 1e-5, k0 = 1, k1 = 0.075, a = 0.5, A = 2.54e-2, T = 293.15, v = nu;

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
        return k0 * Math.exp(
            (-1 * a * n * F * (potentialArray[i] - E0)) / (R * T)
        );
    });
    let kbArray = timeKeys.map(function(i){
        return k0 * Math.exp(
            ((1 - a) * n * F * (potentialArray[i] - E0)) / (R * T)
        );
    });

    let Cox = timeKeys.map((i) => new Array(numberDistanceInc));
    let Cred = timeKeys.map((i) => new Array(numberDistanceInc));
    let Cred_nr = timeKeys.map((i) => new Array(numberDistanceInc));
    let Cprod = timeKeys.map((i) => new Array(numberDistanceInc));

    let Jox = new Array(numberTimeInc + 1).fill(0);
    let Jred = new Array(numberTimeInc + 1).fill(0);

    for (let i = 0; i < numberTimeInc + 1; i++){
        for (let j = numberDistanceInc - 1; j >= 0; j--){
            if (i == 0 || j == numberDistanceInc - 1){
                Cox[i][j] = C;
                Cred[i][j] = 0;
                Cred_nr[i][j] = 0;
            }else if (j == 0){
                Jox[i] = (kbArray[i] * Cred[i][1] - kfArray[i] * Cox[i][1]) / (1 + ((kfArray[i] * xInc) / D) + ((kbArray[i] * xInc) / D));
                Jred[i] = -1 * Jox[i];
                Cox[i][j] = Cox[i][1] + (Jox[i] * xInc) / D;
                Cred[i][j] = Cred[i][1] + (Jred[i] * xInc) / D;
                Cred_nr[i][j] = Cred[i][j];
            }else{
                Cox[i][j] = Cox[i - 1][j] + l * (Cox[i - 1][j - 1] - 2 * Cox[i - 1][j] + Cox[i - 1][j + 1]);
                Cred[i][j] = Cred[i - 1][j] + l * (Cred[i - 1][j - 1] - 2 * Cred[i - 1][j] + Cred[i - 1][j + 1]) - k1 * tInc * Cred[i - 1][j];
                Cred_nr[i][j] = Cred_nr[i - 1][j] + l * (Cred_nr[i - 1][j - 1] - 2 * Cred_nr[i - 1][j] + Cred_nr[i - 1][j + 1]);
            }
            Cprod[i][j] = Cred_nr[i][j] - Cred[i][j];
        }
    }

    let currentArray = Jox.map((J) => -1 * n * F * A * J);

    let xValues = potentialArray;
    let yValues = currentArray;
    return [xValues, yValues];
}

function getMin(array){
    let length = array.length;
    let min = array[0];
    for (let i = 1; i < length; i++){
        if (array[i] < min){
            min = array[i]
        }
    }
    return min;
}

function getMax(array){
    let length = array.length;
    let max = array[0];
    for (let i = 1; i < length; i++){
        if (array[i] > max){
            max = array[i]
        }
    }
    return max;
}

export function update(){

    const WIDTH = 700;
    const HEIGHT = 400;

    const TOP = 50, BOTTOM = HEIGHT - 50, LEFT = 125, RIGHT = WIDTH - 50;
    const HRANGE = RIGHT - LEFT, VRANGE = BOTTOM - TOP;

    const xLabel = "Applied Potential (V)", yLabel = "Current (A)";

    let canvas = document.getElementById("chart");
    let context = canvas.getContext("2d");

    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.textAlign = "center";

    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(LEFT, TOP);
    context.lineTo(LEFT, BOTTOM);
    context.moveTo(LEFT, TOP + VRANGE / 2);
    context.lineTo(RIGHT, TOP + VRANGE / 2)
    context.stroke();

    let v = document.getElementById("v").value;
    let e0 = document.getElementById("e0").value;

    let values = makeGraph(v, e0);
    let xValues = values[0], yValues = values[1];

    let xMin = getMin(xValues), xMax = getMax(xValues);
    let yMin = getMin(yValues), yMax = getMax(yValues);

    let xRange = xMax - xMin, yRange = yMax - yMin;

    let xLength = xValues.length, yLength = yValues.length;

    let xInc = HRANGE / xRange, yInc = VRANGE / yRange;

    let numberTicks = 10;

    let xTick = xRange / numberTicks, yTick = yRange / numberTicks;

    let yTickLength = VRANGE / numberTicks, xTickLength = HRANGE / numberTicks;

    for (let i = 0; i <= numberTicks; i++){
        let xTickLabel = ((numberTicks - i) * xTick + xMin).toFixed(3), yTickLabel = (i * yTick + yMin).toPrecision(3);
        context.fillText((xTickLabel).toString(), LEFT + i * xTickLength, TOP + (VRANGE / 2) + 15);
        context.fillText((yTickLabel).toString(), LEFT - 25, BOTTOM - i * yTickLength + 2);
    }

    context.beginPath();
    context.strokeStyle = "green";
    context.moveTo(
        RIGHT - xInc * (xValues[0] - xMin),
        BOTTOM - yInc * (yValues[0] - yMin)
    );
    for (let i = 1; i < xLength; i++){
        context.lineTo(
            RIGHT - xInc * (xValues[i] - xMin),
            BOTTOM - yInc * (yValues[i] - yMin)
        );
    }
    context.stroke();

    context.fillText(xLabel, LEFT + (HRANGE / 2), BOTTOM + 25);
    context.fillText(yLabel, LEFT - 80, TOP + (VRANGE / 2));
}
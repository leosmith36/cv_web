function makeGraph(v, E0, E1, E2, n, C, D, k0, k1, a, A, T, r, k){

    const numberDistanceInc = 50; const numberTimeInc = 200;
    const distanceKeys = Array.from(new Array(numberDistanceInc + 1).keys());
    const timeKeys = Array.from(new Array(numberTimeInc + 1).keys());

    const F = 96485, R = 8.31451;

    let rot = r * (Math.PI / 30);

    let potentialRange = E2 - E1;
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

                let newIndex = j / (1 - 0.51 * Math.sqrt((rot ** 3 * D * tTotal) / k) * (j / Math.sqrt(D * l)));
                let newIndexInt = Math.floor(newIndex)
                let left = 1 - (newIndex - newIndexInt);
                let right = newIndex - newIndexInt;
    
                let newJ = clamp(newIndexInt, 1, numberDistanceInc - 3);
    
                let newCox = left * Cox[i - 1][newJ] + right * Cox[i - 1][newJ + 1];
                let newCoxLeft = left * Cox[i - 1][newJ - 1] + right * Cox[i - 1][newJ];
                let newCoxRight = left * Cox[i - 1][newJ + 1] + right * Cox[i - 1][newJ + 2]; 
    
                let newCred = left * Cred[i - 1][newJ] + right * Cred[i - 1][newJ + 1];
                let newCredLeft = left * Cred[i - 1][newJ - 1] + right * Cred[i - 1][newJ];
                let newCredRight = left * Cred[i - 1][newJ + 1] + right * Cred[i - 1][newJ + 2]; 
    
                let newCred_nr = left * Cred_nr[i - 1][newJ] + right * Cred_nr[i - 1][newJ + 1];
                let newCred_nrLeft = left * Cred_nr[i - 1][newJ - 1] + right * Cred_nr[i - 1][newJ];
                let newCred_nrRight = left * Cred_nr[i - 1][newJ + 1] + right * Cred_nr[i - 1][newJ + 2]; 

                Cox[i][j] = newCox + l * (newCoxLeft - 2 * newCox + newCoxRight);
                Cred[i][j] = newCred + l * (newCredLeft - 2 * newCred + newCredRight) - k1 * tInc * newCred;
                Cred_nr[i][j] = newCred_nr + l * (newCred_nrLeft - 2 * newCred_nr + newCred_nrRight);
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

function clamp(n, min, max){
    if (n > max){
        return max;
    }else if (n < min){
        return min;
    }else{
        return n;
    }
}

export function update(){

    let canvas = document.getElementById("chart");
    let context = canvas.getContext("2d");
    context.lineWidth = 2;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const TOP = 50, BOTTOM = HEIGHT - 70, LEFT = 160, RIGHT = WIDTH - 50;
    const HRANGE = RIGHT - LEFT, VRANGE = BOTTOM - TOP;

    const xLabel = "Applied Potential (V)", yLabel = "Current (A)";

    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.textAlign = "center";
    context.font = "14px Helvetica";

    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(LEFT, TOP);
    context.lineTo(LEFT, BOTTOM);
    context.moveTo(LEFT, BOTTOM);
    context.lineTo(RIGHT, BOTTOM);
    context.stroke();

    let v = parseFloat(document.getElementById("v").value) / 1000;
    let E0 = parseFloat(document.getElementById("e0").value) / 1000;
    let E1 = parseFloat(document.getElementById("e1").value) / 1000;
    let E2 = parseFloat(document.getElementById("e2").value) / 1000;
    let n = parseFloat(document.getElementById("n").value);
    let C = parseFloat(document.getElementById("C").value) / 1000;
    let D = parseFloat(document.getElementById("D").value);
    let k0 = parseFloat(document.getElementById("k0").value);
    let k1 = parseFloat(document.getElementById("k1").value);
    let a = parseFloat(document.getElementById("a").value);
    let A = parseFloat(document.getElementById("A").value);
    let T = parseFloat(document.getElementById("T").value);
    let r = parseFloat(document.getElementById("r").value);
    let k = parseFloat(document.getElementById("k").value);

    let values = makeGraph(v, E0, E1, E2, n, C, D, k0, k1, a, A, T, r, k);
    let xValues = values[0], yValues = values[1];

    let xMin = getMin(xValues), xMax = getMax(xValues);
    let yMin = getMin(yValues), yMax = getMax(yValues);

    let xRange = xMax - xMin, yRange = yMax - yMin;

    let xLength = xValues.length, yLength = yValues.length;

    let xInc = HRANGE / xRange, yInc = VRANGE / yRange;

    let numberTicks = 10;

    let xTick = xRange / numberTicks, yTick = yRange / numberTicks;

    let yTickLength = VRANGE / numberTicks, xTickLength = HRANGE / numberTicks;

    context.beginPath();
    // context.strokeStyle = "#adadad";
    for (let i = 0; i <= numberTicks; i++){

        let xTickLabel = ((numberTicks - i) * xTick + xMin).toFixed(3), yTickLabel = parseFloat((i * yTick + yMin).toPrecision(3)).toExponential();
        let xTickX = LEFT + i * xTickLength, yTickY = BOTTOM - i * yTickLength;

        context.fillText((xTickLabel).toString(), xTickX, BOTTOM + 25);
        context.moveTo(xTickX, BOTTOM + 5);
        context.lineTo(xTickX, BOTTOM - 5);
        context.fillText((yTickLabel).toString(), LEFT - 35, yTickY + 4);
        context.moveTo(LEFT - 5, yTickY);
        context.lineTo(LEFT + 5, yTickY);
    }
    context.setLineDash([10, 10]);

    context.stroke();
    context.beginPath();
    context.moveTo(LEFT, BOTTOM - (Math.abs(yMin) / yRange) * VRANGE);
    context.lineTo(RIGHT, BOTTOM - (Math.abs(yMin) / yRange) * VRANGE);
    
    context.stroke();

    context.beginPath();
    context.setLineDash([]);
    context.strokeStyle = "green";
    context.lineWidth = "5";
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
    context.font = "bold 16px Helvetica";
    context.fillText(xLabel, LEFT + (HRANGE / 2), HEIGHT - 15);
    context.fillText(yLabel, 50, TOP + (VRANGE / 2));
}
import {makeGraph} from "./graph.js";

let canvas = document.getElementById("chart");
let context = canvas.getContext("2d");

const WIDTH = 700;
const HEIGHT = 400;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const TOP = 50, BOTTOM = HEIGHT - 50, LEFT = 125, RIGHT = WIDTH - 50;
const HRANGE = RIGHT - LEFT, VRANGE = BOTTOM - TOP;

const xLabel = "Applied Potential (V)", yLabel = "Current (A)";

update();

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

function update(){

    context.clearRect(0, 0, WIDTH, HEIGHT);

    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(LEFT, TOP);
    context.lineTo(LEFT, BOTTOM);
    context.moveTo(LEFT, TOP + VRANGE / 2);
    context.lineTo(RIGHT, TOP + VRANGE / 2)
    context.stroke();

    let slope = document.getElementById("v").value;
    let values = makeGraph(slope);
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
        context.fillText((xTickLabel).toString(), LEFT + i * xTickLength + 2, TOP + (VRANGE / 2) + 15);
        context.fillText((yTickLabel).toString(), LEFT - 40, BOTTOM - i * yTickLength + 2);
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

    context.textAlign = "center";
    context.fillText(xLabel, LEFT + (HRANGE / 2), BOTTOM + 25);
    context.fillText(yLabel, LEFT - 80, TOP + (VRANGE / 2));
}

document.getElementById("button").addEventListener("click", update);
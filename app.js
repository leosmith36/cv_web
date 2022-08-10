import {update} from "./canvas.js";

update();

let sliders = document.getElementsByClassName("input");
for (let slider of sliders) {
    let entry = document.getElementById(slider.id + "-num");
    slider.addEventListener("change", function(){
        entry.value = slider.value;
        update();
    });
    entry.addEventListener("change", function(){
        slider.value = entry.value;
        update();
    });
    entry.value = slider.value;
    entry.max = slider.max;
    entry.min = slider.min;
    entry.step = slider.step;
}

let entries = document.getElementsByClassName("input-num");
for (let entry of entries) {
    let slider = document.getElementById(entry.id.substring(0, entry.id.length - 4));
    entry.addEventListener("change", function(){
        slider.value = entry.value;
        update;
    });
}

document.getElementById("open-inputs").addEventListener("click", function(){
    let inputs = document.getElementById("inputs");
    if (inputs.style.display == "none"){
        inputs.style.display = "grid";
    }else {
        inputs.style.display = "none";
    }
})
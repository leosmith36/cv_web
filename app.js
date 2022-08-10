import {update} from "./canvas.js";

update();

let sliders = document.getElementsByClassName("input");
for (let slider of sliders) {
    let entry = document.getElementById(slider.id + "-num");
    slider.addEventListener("input", function(){
        entry.value = slider.value;
        update();
    });
    entry.addEventListener("input", function(){
        slider.value = entry.value;
        update();
    });
    entry.value = slider.value;
    entry.max = slider.max;
    entry.min = slider.min;
    entry.step = slider.step;
}

document.getElementById("open-inputs").addEventListener("click", function(){
    let inputs = document.getElementById("inputs");
    if (inputs.style.display == "none"){
        inputs.style.display = "grid";
        this.innerHTML = "Hide Inputs";
    }else {
        inputs.style.display = "none";
        this.innerHTML = "Show Inputs"
    }
})
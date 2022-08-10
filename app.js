import {update} from "./canvas.js";

update();

document.getElementById("button").addEventListener("click", update);

let sliders = document.getElementsByClassName("input");
for (let slider of sliders) {
    slider.addEventListener("change", function(){
        document.getElementById(slider.id + "-num").value = slider.value;
    });
}

let entries = document.getElementsByClassName("input-num");
for (let entry of entries) {
    entry.addEventListener("change", function(){
        document.getElementById(entry.id.substring(0, entry.id.length - 4)).value = entry.value;
    });
}
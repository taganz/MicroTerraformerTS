/// <reference path='World.ts' />
import {World} from "./World.js"    // .js perque si no no ho posa al .js

var canvas = <HTMLCanvasElement> document.getElementById("canvas");
var ctx = <any> canvas.getContext("2d");

var world = new World(ctx);

function updateCanvas() {
    ctx.putImageData(world.imageData, 0, 0);
}


logStatus("Microterraformer-TS is loaded");


var iteration: number;    // aixo ho hauria de tornar world.step()?


// funcions onClic dels botons

// new simulation

document.getElementById("btn-new").addEventListener("click", function(){
    logStatus("new"); 
    iteration = 0;
    world.reset();
    updateCanvas();

});

// step simulation

function doStep() {
    world.step();
    updateCanvas();
    iteration++;
    logStatus("step "+ world.iteration); 
}
function doRun() {
    doStep();
    aTimer = window.setTimeout(doRun, 100);

}

document.getElementById("btn-step").addEventListener("click", function(){
    doStep();
});
// run simulation
var aTimer: number ;

document.getElementById("btn-run").addEventListener("click", function(){
    logStatus("run"); 
    aTimer = window.setTimeout(doRun, 100);
});

// stop simulation

document.getElementById("btn-stop").addEventListener("click", function(){
    logStatus("stop"); 
    clearTimeout(aTimer);

});



// mostra la llista de worlds salvats
document.getElementById("btn-maps").addEventListener("click", function(){
    logStatus("maps, not available!"); 
    // ---> pendent
});

// load world
document.getElementById("btn-load").addEventListener("click", function(){
    logStatus("load, not available!"); 
    // --> com seleccionar el nom?
    world.newLoadWorld("savedWorld");
});

// save world
document.getElementById("btn-save").addEventListener("click", function(){
    logStatus("save, not available!"); 
    world.saveWorld("savedWorld")
});



function logStatus(msg: string) {
    document.getElementById("status").innerHTML = msg;
    console.log(msg);

}


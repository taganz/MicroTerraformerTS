/// <reference path='World.ts' />
import {World} from "./World.js"    // .js perque si no no ho posa al .js


let world = new World(6, 3);

let htmlCanvas = <HTMLCanvasElement> document.getElementById("canvas");
let ctxHtmlCanvas = <any> htmlCanvas.getContext("2d");
ctxHtmlCanvas.mozImageSmoothingEnabled = false;
ctxHtmlCanvas.webkitImageSmoothingEnabled = false;
ctxHtmlCanvas.msImageSmoothingEnabled = false;
ctxHtmlCanvas.imageSmoothingEnabled = false;
let imageData = <HTMLImageElement> ctxHtmlCanvas.getImageData(0, 0, htmlCanvas.width, htmlCanvas.height);
// lastCanvas stores the last calculated image
let worldImageCanvas = <HTMLCanvasElement> document.createElement("canvas");
let lastCtx = <any> worldImageCanvas.getContext("2d");
worldImageCanvas.width = world.imageData.width;
worldImageCanvas.height = world.imageData.height;
doNew();

function updateCanvas() {
    worldImageCanvas.getContext("2d").putImageData(world.imageData, 0, 0);
    ctxHtmlCanvas.drawImage(worldImageCanvas, 0, 0, 400, 200);
}


// new simulation
function doNew(){
    logStatus("new"); 
    world.new();
    updateCanvas();
}
document.getElementById("btn-new").addEventListener("click", function(){
    doNew();
});

// step simulation

function doStep() {
    //world.step(lastCtx.getImageData(0,0,lastCanvas.width, lastCanvas.height));
    world.step();
    updateCanvas();
    logStatus("step "+ world.iteration); 
}
document.getElementById("btn-step").addEventListener("click", function(){
    doStep();
});


// run simulation

let aTimer: number ;
function doRun() {
    doStep();
    aTimer = window.setTimeout(doRun, 100);
}
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

    // proves
    //world.step(lastCtx.getImageData(0,0,lastCanvas.width, lastCanvas.height));
    //updateCanvas();
    //logStatus("stepOld "+ world.iteration); 
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

logStatus("Microterraformer-TS is loaded");


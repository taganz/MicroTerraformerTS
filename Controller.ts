/// <reference path="jquery.d.ts" />
/// <reference path='jqueryui.d.ts' />
/// <reference path='world.ts' />

import { World } from "./World.js"    // .js perque si no no ho posa al .js"; 

export class Controller
    {
        iteration: number;
        imageLoaded : boolean = false;

        theWorld = new World();

        constructor(){
            console.log("Controller is created");
        }

        initialize()
        {
            this.iteration = 0;
            this.imageLoaded = true;
        }

        
        newWorld()
        {
            this.theWorld.newWorld();
            this.initialize();
        }
 

        stepSimulation()
        {
            this.theWorld.iteration();
            this.iteration++;
        }

        loadWorldFromFile(fileName: string)
        {
            this.theWorld.newLoadWorld(fileName);
            this.initialize();

        }

        log(msg: string){
            console.log("Controller log:");
            console.log(msg);
        }

    }



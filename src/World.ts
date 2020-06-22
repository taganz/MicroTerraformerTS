
/// <reference path='Creature.ts' />
import type {Color }  from "./Creature.js"    // .js perque si no no ho posa al .js
import {Creature, CreatureSettings, ThrophicLevel, AttackResult, colorEqual} from "./Creature.js"    // .js perque si no no ho posa al .js

// world contains an ImageData 
// (doesn't know about canvas nor context)

export class World  {

    iteration: number;
    imageData: any;         // the image we are preparing to show at next step
    oldImageData: any;      
    
    constructor (width: number, height: number ) {
        this.imageData = new ImageData(width, height);
        this.oldImageData = new ImageData(width, height);
        this.new("default");
        console.log("World is created"); 
    }

    // reset world with default values
    new(initPopStr: string) {
        this.iteration = 0;
        this.resetImageData();
        let p: number;
        this.setInitialPopulation(initPopStr);
    }
    // reset imageData to black
    resetImageData(){
        for(let x : number = 0; x < this.imageData.width;x++){
            for(let y : number = 0; y < this.imageData.height;y++){
//                this.drawPixel(x,y, 0, 0, 0, 255);
                this.setPixelColor(x,y,CreatureSettings.blackColor);
            }
        }    
        console.log("Image reset");    
    }


    step(){

        // save imageData to oldImageData
        this.oldImageData.data.set(this.imageData.data);   // needed for getOldPixelColor...
        // reset new bitmap, paint all cells black
        this.resetImageData();

        // we'll use this object to work with creatures
        let joe : Creature = new Creature();
        let done: boolean;

        // for each cell in imageData 
        for(let y: number =0; y<this.imageData.height; y++){
            for(let x: number =0;x<this.imageData.width; x++) {


                // if cell is not black, then joe has already been processed
                // it could win an attack when its North neighbour attacked it...
                let c : Color = this.getPixelColor(x,y);      
                if  (!colorEqual(c,CreatureSettings.blackColor)) {
                    this.setPixelColor(x, y, c);
                    console.log("Joe1 at (", x, y, ") is already processed. Color: " ,c);
                }                
                // joe hasn't been processed, let's go...
                else {

                    // joe lives at x,y. get its actual color
                    // start iteration cycle, decreases energy
                    joe.beginIteration(this.getOldPixelColor(x, y));
                    console.log("Joe1 at (", x, y, ") ", joe.myColor, joe.me);
                    done = false;

                    // if cell is soil, nothing to do
                    if (Creature.isSoil(joe.myColor)){
                        console.log("Joe1 at (", x, y, ") is soil. Color: " ,c);
                        this.setPixelColor(x, y, joe.myColor);
                        done = true;
                    }

                    // if it died...
                    if (!done && joe.isDead())
                    {
                        console.log("Joe is dead");
                        this.setPixelColor(x, y, joe.myColor);
                        done = true;
                    }

                    // combat at east
                    if (!done && x < this.imageData.width - 1)
                    {
                        done = this.iterationCheckNeighbour(joe, x, y, x + 1, y);
                    }
                    // combat at south-east
                    if ((!done) && (x < this.imageData.width-1) && (y < this.imageData.height-1)) {
                        done = this.iterationCheckNeighbour(joe, x, y, x + 1, y+1);
                    }

                    // combat at south
                    if (!done && y < this.imageData.height - 1) {
                        done = this.iterationCheckNeighbour(joe, x, y, x, y + 1);
                    }
                    // combat at south-west
                    if (!done && x > 1 && y < this.imageData.height- 1) {
                        done = this.iterationCheckNeighbour(joe, x, y, x-1, y + 1);
                    }

                    // nothing happened with any neighbour, keep joe
                    if (!done)
                    {
                        this.setPixelColor(x, y, joe.myColor);
                    }
                }

            }
        }

        this.iteration++;

    }


    // attack neighbour and update bmp2 with result
    // if joe kills a neighbour or is killed by its neighbours, returns true to stop checking other directions
    iterationCheckNeighbour(joe: Creature, x1: number, y1:number, x2:number, y2:number):boolean {
        
            // get neighbour color
            let cBill : Color = this.getOldPixelColor(x2, y2);
            console.log("Bill at (", x2, y2,") ", cBill, Creature.lifeParametersFromColor(cBill));

            // attack
            let result : AttackResult = joe.attack(cBill);

            // joe kill bill
            if (result == AttackResult.KILL)     
            {
                console.log("KILL");

                // joe moves to bill position
                this.setPixelColor(x2, y2, joe.myColor);

                // after killing joe has a probability of give birth
                if (joe.isTimeForReproduction()) {
                    this.setPixelColor(x1, y1, joe.getOffspring());
                }
                else {
                    this.setPixelColor(x1, y1, CreatureSettings.soilColor);
                }

                // delete bill from oldImage to prevent further processing
                this.setOldPixelColor(x2, y2, CreatureSettings.blackColor);
                return true;
            }

            if (result == AttackResult.DIE) 
            {
                console.log("DIE");

                // bill moves to joe's position
                this.setPixelColor(x1, y1, cBill);

                // bill has a chance for reproduction, if not, leave soil at bill's place

                let cBillOffspring = Creature.isTimeForReproductionColor(cBill);
                if (!(cBillOffspring === CreatureSettings.blackColor)) {
                    this.setPixelColor(x2, y2, cBillOffspring);   
                }
                else {
                    this.setPixelColor(x2, y2, CreatureSettings.soilColor);
                }
                // delete bill from oldImage to prevent further processing
                this.setOldPixelColor(x2, y2, CreatureSettings.blackColor);
                return true;
            }

            console.log("DRAW");
            // nothing happened this time
            return false;
    }



    newLoadWorld(fileName: string){
        console.log("world: load not available!"); 
    }

    saveWorld(filename: string){
        console.log("world: save not available!"); 
    }



    getPixelIndex(x: number, y: number): number{
        return (x + y * this.imageData.width)*4;
    }
    getOldPixelIndex(x: number, y: number): number{
        return (x + y * this.oldImageData.width)*4;
    }
    getPixelColor(x: number, y: number): Color {
        let i = this.getPixelIndex(x, y);
        let c : Color = {r: this.imageData.data[i+0], g: this.imageData.data[i+1], b: this.imageData.data[i+2]};
        return c;
    }
    getOldPixelColor(x: number, y: number): Color {
        let i = this.getOldPixelIndex(x, y);
        let c : Color = {r: this.oldImageData.data[i+0], g: this.oldImageData.data[i+1], b: this.oldImageData.data[i+2]}; 
        return c;
    }
    setPixelColor(x: number, y: number, c: Color){
        let index = (x + y * this.imageData.width) * 4;

        this.imageData.data[index + 0] = c.r;
        this.imageData.data[index + 1] = c.g;
        this.imageData.data[index + 2] = c.b;
        this.imageData.data[index + 3] = 255;
    }
    setOldPixelColor(x: number, y: number, c: Color){
        let index = (x + y * this.oldImageData.width) * 4;

        this.oldImageData.data[index + 0] = c.r;
        this.oldImageData.data[index + 1] = c.g;
        this.oldImageData.data[index + 2] = c.b;
        this.oldImageData.data[index + 3] = 255;
    }

    setInitialPopulation (type: string){
        let p: number;
        switch(type){
            case "default":
            case "pnw":       // plants at a North West square of 3 x 3. herbs and carn not activated
                for (let y=0; y<this.imageData.height; y++) {
                    for (let x=0; x<this.imageData.width; x++) {
                        p=Math.random();
                        // NW square
                        if (x<4 && y < 4) {
                            if (p < 0.7) {
                                this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.PLANT, 25+Math.random()*50, 100, 50));  
                            }
                            else {
                                this.setPixelColor(x, y, CreatureSettings.soilColor);
                                }
                            } 
                        else {
                            if (p < 0.02) {
                                this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.HERBIVORE, -1, 100, 50));  
                            }
                            else if (p < 0.03) {
                                this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.CARNIVORE, -1, 100, 100));
                            }
                            else {
                                this.setPixelColor(x, y, CreatureSettings.soilColor);
                            }
                        }
                    }
                }
                break;
            case "prairie":   // plants everywhere. some non activated herbivores and carnivores 
                for (let y=0; y<this.imageData.height; y++) {
                    for (let x=0; x<this.imageData.width; x++) {
                        p=Math.random();
                        if (p < 0.01) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.HERBIVORE, 25+Math.random()*50, 100, 50));  // non activated?
                        }
                        else if (p < 0.8){
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.PLANT, 25+Math.random()*50, 100, 50));  
                        } 
                        else if (p < 0.85) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.HERBIVORE, -1, 100, 50));  
                        }
                        else if (p < 0.87) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.CARNIVORE, -1, 100, 100));
                        }
                        else {
                            this.setPixelColor(x, y, CreatureSettings.soilColor);
                        }
                    }
                }
                break;
            case "random":    // completly at random
                for (let y=0; y<this.imageData.height; y++) {
                    for (let x=0; x<this.imageData.width; x++) {

                        p = Math.random();
                        if (p < 0.3) {
                            this.setPixelColor(x, y, CreatureSettings.soilColor);
                        }
                        else if (p < 0.8) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.PLANT, 25+Math.random()*50, 100, 50));
                        }
                        else if (p < 0.98) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.HERBIVORE, 50, 100, 50));  
                        }
                        else {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.CARNIVORE, 50, 100, 100));
                        }
                    }
                }
                break;
            default:
                console.log("setInitialPopulation invalid type: ", type);
            }

        }


}
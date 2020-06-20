import { Creature, CreatureSettings, ThrophicLevel, AttackResult } from "./Creature.js"; // .js perque si no no ho posa al .js
// world contains an ImageData 
// (doesn't know about canvas nor context)
export class World {
    constructor(width, height) {
        this.imageData = new ImageData(width, height);
        this.oldImageData = new ImageData(width, height);
        this.new();
        console.log("World is created");
    }
    // reset world with default values
    new() {
        this.iteration = 0;
        this.resetImageData();
        // create some creatures at random   <-- TESTING
        this.setPixelColor(0, 0, Creature.getColor(ThrophicLevel.CARNIVORE, -1, 50, 100));
        this.setPixelColor(1, 0, Creature.getColor(ThrophicLevel.PLANT, 50, 100, 50));
        this.setPixelColor(2, 0, Creature.getColor(ThrophicLevel.PLANT, 50, 100, 50));
        this.setPixelColor(0, 1, Creature.getColor(ThrophicLevel.PLANT, 50, 100, 50));
        this.setPixelColor(1, 1, Creature.getColor(ThrophicLevel.HERBIVORE, 50, 100, 50)); // non activated?
        this.setPixelColor(2, 1, Creature.getColor(ThrophicLevel.PLANT, 50, 100, 50));
        this.setPixelColor(0, 2, Creature.getColor(ThrophicLevel.PLANT, 50, 100, 50));
        this.setPixelColor(1, 2, Creature.getColor(ThrophicLevel.PLANT, 50, 100, 50));
        this.setPixelColor(2, 2, Creature.getColor(ThrophicLevel.PLANT, 50, 100, 50));
    }
    // reset imageData to black
    resetImageData() {
        for (let x = 0; x < this.imageData.width; x++) {
            for (let y = 0; y < this.imageData.height; y++) {
                this.drawPixel(x, y, 0, 0, 0, 255);
            }
        }
        console.log("Image reset");
    }
    step() {
        // save imageData to oldImageData
        this.oldImageData.data.set(this.imageData.data); // needed for getOldPixelColor...
        // reset new bitmap, paint all cells black
        this.resetImageData();
        // we'll use this object to work with creatures
        let joe = new Creature();
        let cJoe;
        let done;
        // for each cell in imageData 
        for (let y = 0; y < this.imageData.height; y++) {
            for (let x = 0; x < this.imageData.width; x++) {
                done = false;
                // we first must check if joe has already been processed in a previous step 
                // (may be it won an attack when its North neighbour attacked it...
                // if so, its cell in imageData will not be black anymore
                let c = this.getPixelColor(x, y);
                // if cell is not black, then joe has already been processed
                if (!(c.r == 0 && c.g == 0 && c.b == 0)) {
                    done = true;
                }
                if (!done) {
                    // joe hasn't been processed, let's go...
                    // joe lives at x,y. get its actual color
                    let cJoe = this.getOldPixelColor(x, y);
                    console.log("Joe1 at (", x, y, ") ", cJoe, Creature.lifeParametersFromColor(cJoe));
                    // start iteration cycle, decreases energy
                    joe.beginIteration(cJoe);
                    // if it died...
                    if (joe.isDead()) {
                        console.log("Joe is dead");
                        this.setPixelColor(x, y, joe.myColor);
                        //20/6 per que? ja estava mort...    this.setOldPixelColor(x, y, joe.myColor);
                        done = true;
                    }
                }
                // combat at east
                if (!done && x < this.imageData.width - 1) {
                    done = this.iterationCheckNeighbour(joe, x, y, x + 1, y);
                }
                // combat at south-east
                if (!done && x < this.imageData.width - 1 && y < this.imageData.heigth - 1) {
                    done = this.iterationCheckNeighbour(joe, x, y, x + 1, y + 1);
                }
                // combat at south
                if (!done && y < this.imageData.heigth - 1) {
                    done = this.iterationCheckNeighbour(joe, x, y, x, y + 1);
                }
                // combat at south-west
                if (!done && x > 1 && y < this.imageData.heigth - 1) {
                    done = this.iterationCheckNeighbour(joe, x, y, x - 1, y + 1);
                }
                // nothing happened with any neighbour, keep joe
                if (!done) {
                    this.setPixelColor(x, y, joe.myColor);
                }
            }
        }
        this.iteration++;
    }
    // attack neighbour and update bmp2 with result
    // if joe kills a neighbour or is killed by its neighbours, returns true to stop checking other directions
    iterationCheckNeighbour(joe, x1, y1, x2, y2) {
        // get neighbour color
        let cBill = this.getOldPixelColor(x2, y2);
        console.log("Bill at (", x2, y2, ") ", cBill, Creature.lifeParametersFromColor(cBill));
        // attack
        let result = joe.attack(cBill);
        // c1 killed its neighbour
        if (result == AttackResult.KILL) {
            console.log("KILL");
            /* 9/8/17 --
              
            // joe stay at its position
            bmp2.SetPixel(x1, y1, joe.me.myColor);
            // and joe has a probability of give birth at neighbour position
            if (joe.IsTimeForReproduction())
            {
                bmp2.SetPixel(x2, y2, joe.GetOffspring());              // offsprings are born with initial energy
            }
            /*
            else
            {
                // leave neighbour
                bmp2.SetPixel(x2, y2, c2);
            }
            */
            // after killing joe can move to its neighbour position
            // it also has a chance for reproduction
            if (!joe.isTimeForMoving()) {
                // stay at place
                this.setPixelColor(x1, y1, joe.myColor);
                // try to reproduce to neighbour place
                if (joe.isTimeForReproduction())
                    this.setPixelColor(x2, y2, joe.getOffspring());
                else
                    // leave neighbour
                    this.setPixelColor(x2, y2, cBill);
            }
            else {
                // move
                this.setPixelColor(x2, y2, joe.myColor);
                // try to reproduce at joe's previous place
                if (joe.isTimeForReproduction())
                    this.setPixelColor(x1, y1, joe.getOffspring());
                else
                    // clean place
                    this.setPixelColor(x1, y1, CreatureSettings.deadCreatureColor);
            }
            return true;
        }
        if (result == AttackResult.DIE) {
            console.log("DIE");
            /*
            // put killer neighbour's offspring at joe's place or leave joe (to avoid white cells between predators and preys)
            cBill = Creature.isTimeForReproductionColor(cBill);
            if (cBill.r==0 && cBill.g==0 && cBill.b==0) {
                this.setPixelColor(x1, y1, joe.myColor);
            }
            else {
                this.setPixelColor(x1, y1, cBill);
            }
            return true;
            */
            // if reproduction put killer neighbour's offspring at joe's place 
            // else move killer and leave soil at killer's old place
            // also delete killer from oldImage to avoid reprocessing
            let cBillOffspring = Creature.isTimeForReproductionColor(cBill);
            if (!(cBillOffspring === CreatureSettings.blackColor)) {
                this.setPixelColor(x1, y1, cBillOffspring);
            }
            else {
                this.setPixelColor(x1, y1, cBill);
                this.setPixelColor(x2, y2, CreatureSettings.soilColor);
            }
            this.setOldPixelColor(x2, y2, CreatureSettings.blackColor);
            return true;
            return true;
        }
        console.log("DRAW");
        // nothing happened this time
        return false;
    }
    newLoadWorld(fileName) {
        console.log("world: load not available!");
    }
    saveWorld(filename) {
        console.log("world: save not available!");
    }
    // That's how you define the value of a pixel //
    drawPixel(x, y, r, g, b, a) {
        let index = (x + y * this.imageData.width) * 4;
        this.imageData.data[index + 0] = r;
        this.imageData.data[index + 1] = g;
        this.imageData.data[index + 2] = b;
        this.imageData.data[index + 3] = a;
    }
    drawOldPixel(x, y, r, g, b, a) {
        let index = (x + y * this.oldImageData.width) * 4;
        this.oldImageData.data[index + 0] = r;
        this.oldImageData.data[index + 1] = g;
        this.oldImageData.data[index + 2] = b;
        this.oldImageData.data[index + 3] = a;
    }
    getPixelIndex(x, y) {
        return (x + y * this.imageData.width) * 4;
    }
    getOldPixelIndex(x, y) {
        return (x + y * this.oldImageData.width) * 4;
    }
    getPixelColor(x, y) {
        let i = this.getPixelIndex(x, y);
        let c = { r: this.imageData.data[i + 0], g: this.imageData.data[i + 1], b: this.imageData.data[i + 2] };
        return c;
    }
    getOldPixelColor(x, y) {
        let i = this.getOldPixelIndex(x, y);
        let c = { r: this.oldImageData.data[i + 0], g: this.oldImageData.data[i + 1], b: this.oldImageData.data[i + 2] };
        return c;
    }
    setPixelColor(x, y, c) {
        let index = (x + y * this.imageData.width) * 4;
        this.imageData.data[index + 0] = c.r;
        this.imageData.data[index + 1] = c.g;
        this.imageData.data[index + 2] = c.b;
        this.imageData.data[index + 3] = 255;
    }
    setOldPixelColor(x, y, c) {
        let index = (x + y * this.oldImageData.width) * 4;
        this.oldImageData.data[index + 0] = c.r;
        this.oldImageData.data[index + 1] = c.g;
        this.oldImageData.data[index + 2] = c.b;
        this.oldImageData.data[index + 3] = 255;
    }
}
//# sourceMappingURL=World.js.map
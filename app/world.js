import { Creature, CreatureSettings, ThrophicLevel, AttackResult, colorEqual } from "./Creature.js"; // .js perque si no no ho posa al .js
// world contains an ImageData 
// (doesn't know about canvas nor context)
export class World {
    constructor(width, height) {
        this.imageData = new ImageData(width, height);
        this.oldImageData = new ImageData(width, height);
        this.new("default");
        console.log("World is created");
    }
    // reset world with default values
    new(initPopStr) {
        this.iteration = 0;
        this.resetImageData();
        let p;
        this.setInitialPopulation(initPopStr);
    }
    // reset imageData to black
    resetImageData() {
        for (let x = 0; x < this.imageData.width; x++) {
            for (let y = 0; y < this.imageData.height; y++) {
                //                this.drawPixel(x,y, 0, 0, 0, 255);
                this.setPixelColor(x, y, CreatureSettings.blackColor);
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
                let c = this.getPixelColor(x, y);
                // if cell is not black, then joe has already been processed
                // it could win an attack when its North neighbour attacked it...
                if (!colorEqual(c, CreatureSettings.blackColor)) {
                    this.setPixelColor(x, y, c);
                    console.log("Joe1 at (", x, y, ") is already processed. Color: ", c);
                }
                // if cell is soil, nothing to do
                else if (Creature.isSoil(c)) {
                    this.setPixelColor(x, y, c);
                    console.log("Joe1 at (", x, y, ") is soil. Color: ", c);
                }
                // joe hasn't been processed, let's go...
                else {
                    // joe lives at x,y. get its actual color
                    let cJoe = this.getOldPixelColor(x, y);
                    console.log("Joe1 at (", x, y, ") ", cJoe, Creature.lifeParametersFromColor(cJoe));
                    let done = false;
                    // start iteration cycle, decreases energy
                    joe.beginIteration(cJoe);
                    // if it died...
                    if (joe.isDead()) {
                        console.log("Joe is dead");
                        this.setPixelColor(x, y, joe.myColor);
                        done = true;
                    }
                    // combat at east
                    if (!done && x < this.imageData.width - 1) {
                        done = this.iterationCheckNeighbour(joe, x, y, x + 1, y);
                    }
                    // combat at south-east
                    if ((!done) && (x < this.imageData.width - 1) && (y < this.imageData.height - 1)) {
                        done = this.iterationCheckNeighbour(joe, x, y, x + 1, y + 1);
                    }
                    // combat at south
                    if (!done && y < this.imageData.height - 1) {
                        done = this.iterationCheckNeighbour(joe, x, y, x, y + 1);
                    }
                    // combat at south-west
                    if (!done && x > 1 && y < this.imageData.height - 1) {
                        done = this.iterationCheckNeighbour(joe, x, y, x - 1, y + 1);
                    }
                    // nothing happened with any neighbour, keep joe
                    if (!done) {
                        this.setPixelColor(x, y, joe.myColor);
                    }
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
        // joe kill bill
        if (result == AttackResult.KILL) {
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
        if (result == AttackResult.DIE) {
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
    newLoadWorld(fileName) {
        console.log("world: load not available!");
    }
    saveWorld(filename) {
        console.log("world: save not available!");
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
    setInitialPopulation(type) {
        let p;
        switch (type) {
            case "default":
            case "pnw": // plants at a North West square of 3 x 3
                for (let y = 0; y < this.imageData.height; y++) {
                    for (let x = 0; x < this.imageData.width; x++) {
                        p = Math.random();
                        if (x < 4 && y < 4 && p < 0.7) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.PLANT, 25 + Math.random() * 50, 100, 50));
                        }
                        else {
                            this.setPixelColor(x, y, CreatureSettings.soilColor);
                        }
                    }
                }
                break;
            case "prairie": // plants everywhere. some herbivores
                for (let y = 0; y < this.imageData.height; y++) {
                    for (let x = 0; x < this.imageData.width; x++) {
                        p = Math.random();
                        if (p < 0.01) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.HERBIVORE, 25 + Math.random() * 50, 100, 50)); // non activated?
                        }
                        else if (p < 0.8) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.PLANT, 25 + Math.random() * 50, 100, 50));
                        }
                        else {
                            this.setPixelColor(x, y, CreatureSettings.soilColor);
                        }
                    }
                }
                break;
            case "random": // completly at random
                for (let y = 0; y < this.imageData.height; y++) {
                    for (let x = 0; x < this.imageData.width; x++) {
                        p = Math.random();
                        if (p < 0.2) {
                            this.setPixelColor(x, y, CreatureSettings.soilColor);
                        }
                        else if (p < 0.7) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.PLANT, 25 + Math.random() * 50, 100, 50));
                        }
                        else if (p < 0.9) {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.HERBIVORE, 50, 100, 50)); // non activated?
                        }
                        else {
                            this.setPixelColor(x, y, Creature.getColor(ThrophicLevel.CARNIVORE, -1, 100, 100));
                        }
                    }
                }
                break;
            default:
                console.log("setInitialPopulation invalid type: ", type);
        }
    }
}
//# sourceMappingURL=World.js.map
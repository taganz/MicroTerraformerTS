export function colorEqual(c1, c2) {
    return c1.r == c2.r && c1.g == c2.g && c1.b == c2.b;
}
//  DEFINES 
export var ThrophicLevel;
(function (ThrophicLevel) {
    ThrophicLevel[ThrophicLevel["SOIL"] = 0] = "SOIL";
    ThrophicLevel[ThrophicLevel["PLANT"] = 1] = "PLANT";
    ThrophicLevel[ThrophicLevel["HERBIVORE"] = 2] = "HERBIVORE";
    ThrophicLevel[ThrophicLevel["CARNIVORE"] = 3] = "CARNIVORE";
})(ThrophicLevel || (ThrophicLevel = {}));
export var AttackResult;
(function (AttackResult) {
    AttackResult[AttackResult["DRAW"] = 0] = "DRAW";
    AttackResult[AttackResult["KILL"] = 1] = "KILL";
    AttackResult[AttackResult["DIE"] = 2] = "DIE";
})(AttackResult || (AttackResult = {}));
export class CreatureSettings {
}
CreatureSettings.deadCreatureColor = { r: 255, g: 255, b: 255 }; // equivalent to less defense soil
CreatureSettings.soilColor = { r: 255, g: 255, b: 128 };
CreatureSettings.errorColor = { r: 240, g: 50, b: 12 };
CreatureSettings.blackColor = { r: 0, g: 0, b: 0 };
//
//  SIMULATION PARAMETERS
//
// consumes this energy every cycle
CreatureSettings.ENERGY_CONSUMPTION_PLANTS = 1;
CreatureSettings.ENERGY_CONSUMPTION_HERBIVORES = 2; // 0.5
CreatureSettings.ENERGY_CONSUMPTION_CARNIVORES = 2;
CreatureSettings.ENERGY_INCREMENT_KILLING = 2;
CreatureSettings.DEFENSE_LEVEL_MAX = 150;
CreatureSettings.ATTACK_LEVEL_MAX = 150;
CreatureSettings.ENERGY_LEVEL_MAX = 100;
CreatureSettings.ENERGY_LEVEL_COLOR_MIN = 155; // energyLevel = color - ENERGY_LEVEL_COLOR_MIN
CreatureSettings.ENERGY_LEVEL_COLOR_NOT_ACTIVATED = 154; // 154 (energyLevel = -1) means "not activated"
CreatureSettings.ENERGY_LEVEL_AT_BIRTH = 50;
CreatureSettings.PLANT_REPRODUCTION_PROBABILITY = 0.2; // recommended 0.1 - 0.5
CreatureSettings.HERBIVORE_REPRODUCTION_PROBABILITY = 0.2; // recommended 0.15 - 
CreatureSettings.CARNIVORE_REPRODUCTION_PROBABILITY = 0.1;
// probability to move after killing a creature
CreatureSettings.PLANT_MOVE_PROBABILITY = 0;
CreatureSettings.HERBIVORE_MOVE_PROBABILITY = 0.2;
CreatureSettings.CARNIVORE_MOVE_PROBABILITY = 0.4;
export class Creature {
    constructor() {
        this.rand = Math.random();
        this.me = {
            trophicLevel: 0,
            attackLevel: 0,
            defenseLevel: 0,
            energyLevel: 0,
            activated: false
        };
        this.myColor = { r: 0, g: 0, b: 0 };
        // soil is never activated, plants are always, herbivores and carnivores only if energy == -1
        this.me.activated = Creature.isActivated(this.me);
    }
    // initialize a creature with this color and do rutine actions
    // Consumes energy, updates color 
    // If herbivores or carnivores are not still activated, don't consume energy
    beginIteration(c) {
        this.me = Creature.lifeParametersFromColor(c);
        // if activated consume energy 
        if (this.me.activated) {
            switch (this.me.trophicLevel) {
                case ThrophicLevel.PLANT:
                    this.me.energyLevel -= CreatureSettings.ENERGY_CONSUMPTION_PLANTS;
                    break;
                case ThrophicLevel.HERBIVORE:
                    this.me.energyLevel -= CreatureSettings.ENERGY_CONSUMPTION_HERBIVORES;
                    break;
                case ThrophicLevel.CARNIVORE:
                    this.me.energyLevel -= CreatureSettings.ENERGY_CONSUMPTION_CARNIVORES;
                    break;
            }
            this.me.energyLevel = this.me.energyLevel < 0 ? 0 : this.me.energyLevel;
        }
        // set my color with new energy level
        // <----- PER QUE ESTIC FIXANT EL COLOR SI JA EL SE?????  NO TE CAP SENTIT QUE JOE SIGUI UNA INSTANCIA. HAN DE SER FUNCS ESTATIQUES AMB LIFEPARAMETERS
        this.myColor = Creature.colorFromLifeParameters(this.me);
    }
    // returns attackResult
    attack(itsColor) {
        let it = Creature.lifeParametersFromColor(itsColor);
        // combats only occur when trophic levels are differents by one level
        // I'm a predator
        if (this.me.trophicLevel == ThrophicLevel.CARNIVORE && it.trophicLevel == ThrophicLevel.HERBIVORE
            || this.me.trophicLevel == ThrophicLevel.HERBIVORE && it.trophicLevel == ThrophicLevel.PLANT
            || this.me.trophicLevel == ThrophicLevel.PLANT && it.trophicLevel == ThrophicLevel.SOIL) {
            if (this.me.attackLevel > it.defenseLevel) {
                // activate if necessary
                if (!this.me.activated)
                    this.me = Creature.activate(this.me);
                this.me.energyLevel += CreatureSettings.ENERGY_INCREMENT_KILLING;
                return AttackResult.KILL;
                // <--- WORLD S'ENCARREGA DE MATAR EL BILL. HAURIA D'ESTAR AQUI?
            }
        }
        // I'm a prey
        if (it.trophicLevel == ThrophicLevel.CARNIVORE && this.me.trophicLevel == ThrophicLevel.HERBIVORE
            || it.trophicLevel == ThrophicLevel.HERBIVORE && this.me.trophicLevel == ThrophicLevel.PLANT
            || it.trophicLevel == ThrophicLevel.PLANT && this.me.trophicLevel == ThrophicLevel.SOIL) {
            if (this.me.defenseLevel < it.attackLevel) {
                // activate if necessary
                if (!it.activated)
                    it = Creature.activate(it); // <---- AIXO ES PERD!!!
                this.me.energyLevel = 0; // <---- ES IGUAL, WORLD MATARA EL JOE
                return AttackResult.DIE;
            }
        }
        return AttackResult.DRAW;
    }
    static activate(lp) {
        let lp2 = lp;
        if (lp.trophicLevel == ThrophicLevel.CARNIVORE) {
            lp2.activated = true;
            lp2.energyLevel = CreatureSettings.ENERGY_LEVEL_AT_BIRTH; // <-- HAURIA DE SER DIFERENT SEGONS TL?
        }
        else if (lp.trophicLevel == ThrophicLevel.HERBIVORE) {
            lp2.activated = true;
            lp2.energyLevel = CreatureSettings.ENERGY_LEVEL_AT_BIRTH; // <-- HAURIA DE SER DIFERENT SEGONS TL?
        }
        return lp2;
    }
    static isActivated(lp) {
        return lp.trophicLevel == ThrophicLevel.PLANT
            || (lp.trophicLevel != ThrophicLevel.SOIL && lp.energyLevel > -1);
    }
    static lifeParametersFromColor(col) {
        let pars = {
            trophicLevel: 0,
            attackLevel: 0,
            defenseLevel: 0,
            energyLevel: 0,
            activated: false
        }; // <-- com inicialitzar en blanc?????
        // backup
        if (col.r == 255 && col.g == 255) {
            pars.trophicLevel = ThrophicLevel.SOIL;
        }
        // black color is treated as SOIL
        else if (col.r == 0 && col.g == 0 && col.b == 0) {
            pars.trophicLevel = ThrophicLevel.SOIL;
        }
        // a plant
        else if (col.r <= CreatureSettings.ATTACK_LEVEL_MAX && col.g >= CreatureSettings.ENERGY_LEVEL_COLOR_MIN && col.b <= CreatureSettings.DEFENSE_LEVEL_MAX) {
            pars.trophicLevel = ThrophicLevel.PLANT;
        }
        // a herbivore
        else if (col.r <= CreatureSettings.DEFENSE_LEVEL_MAX && col.g <= CreatureSettings.ATTACK_LEVEL_MAX && col.b >= CreatureSettings.ENERGY_LEVEL_COLOR_NOT_ACTIVATED) {
            pars.trophicLevel = ThrophicLevel.HERBIVORE;
        }
        // a carnivore
        else if (col.r >= CreatureSettings.ENERGY_LEVEL_COLOR_NOT_ACTIVATED && col.g <= CreatureSettings.DEFENSE_LEVEL_MAX && col.b <= CreatureSettings.ATTACK_LEVEL_MAX) {
            pars.trophicLevel = ThrophicLevel.CARNIVORE;
        }
        else {
            // something is wrong
            console.log("lifeParametersFromColor error color:", col, "pars:", pars);
        }
        switch (pars.trophicLevel) {
            case ThrophicLevel.SOIL:
                pars.energyLevel = 0;
                pars.attackLevel = 0;
                pars.defenseLevel = 128 - col.b / 2;
                pars.activated = false;
                break;
            case ThrophicLevel.PLANT:
                pars.energyLevel = col.g - CreatureSettings.ENERGY_LEVEL_COLOR_MIN;
                pars.attackLevel = col.r;
                pars.defenseLevel = col.b;
                pars.activated = true;
                break;
            case ThrophicLevel.HERBIVORE:
                pars.energyLevel = col.b - CreatureSettings.ENERGY_LEVEL_COLOR_MIN;
                pars.attackLevel = col.g;
                pars.defenseLevel = col.r;
                pars.activated = pars.energyLevel > -1;
                break;
            case ThrophicLevel.CARNIVORE:
                pars.energyLevel = col.r - CreatureSettings.ENERGY_LEVEL_COLOR_MIN;
                pars.attackLevel = col.b;
                pars.defenseLevel = col.g;
                pars.activated = pars.energyLevel > -1;
                break;
        }
        return pars;
    }
    isDead() {
        return this.me.energyLevel == 0;
    }
    getOffspring() {
        let p = -15 + 30 * Math.random();
        this.me.energyLevel = CreatureSettings.ENERGY_LEVEL_AT_BIRTH + p; // <--- TO BE INCLUDED: mutations
        this.me.activated = true; // offspring are always activated    <--- aqui no fa res aixo
        return Creature.colorFromLifeParameters(this.me);
    }
    isTimeForMoving() {
        let p = Math.random();
        switch (this.me.trophicLevel) {
            case ThrophicLevel.PLANT:
                return p < CreatureSettings.PLANT_MOVE_PROBABILITY;
            case ThrophicLevel.HERBIVORE:
                return p < CreatureSettings.HERBIVORE_MOVE_PROBABILITY;
            case ThrophicLevel.CARNIVORE:
                return p < CreatureSettings.CARNIVORE_MOVE_PROBABILITY;
        }
        return false;
    }
    isTimeForReproduction() {
        let p = Math.random();
        switch (this.me.trophicLevel) {
            case ThrophicLevel.PLANT:
                return p < CreatureSettings.PLANT_REPRODUCTION_PROBABILITY;
            case ThrophicLevel.HERBIVORE:
                return p < CreatureSettings.HERBIVORE_REPRODUCTION_PROBABILITY; // <----  && me.energyLevel > 75;
            case ThrophicLevel.CARNIVORE:
                return p < CreatureSettings.CARNIVORE_REPRODUCTION_PROBABILITY; // <----  && me.energyLevel > 75;
        }
        return false;
    }
    // return color for offspring or black if none
    static isTimeForReproductionColor(c2) {
        let q = 0;
        let pars = this.lifeParametersFromColor(c2);
        switch (pars.trophicLevel) {
            case ThrophicLevel.PLANT:
                q = CreatureSettings.PLANT_REPRODUCTION_PROBABILITY;
                break;
            case ThrophicLevel.HERBIVORE:
                q = CreatureSettings.HERBIVORE_REPRODUCTION_PROBABILITY;
                break;
            case ThrophicLevel.CARNIVORE:
                q = CreatureSettings.CARNIVORE_REPRODUCTION_PROBABILITY;
                break;
        }
        if (q > Math.random()) {
            pars.energyLevel = CreatureSettings.ENERGY_LEVEL_AT_BIRTH; // <--- TO BE INCLUDED: mutations
            return this.colorFromLifeParameters(pars);
        }
        else
            return CreatureSettings.deadCreatureColor;
    }
    static isSoil(c) {
        return c.r == 255 && c.g == 255;
    }
    // returns creature's color from parameters
    static getColor(trophicLevel, energyLevel, attackLevel, defenseLevel) {
        let me = {
            trophicLevel: trophicLevel,
            energyLevel: energyLevel,
            attackLevel: attackLevel,
            defenseLevel: defenseLevel,
            activated: false
        };
        me.activated = Creature.isActivated(me);
        return this.colorFromLifeParameters(me);
    }
    static colorFromLifeParameters(me) {
        if (me.trophicLevel == ThrophicLevel.SOIL)
            return CreatureSettings.soilColor; // <--- ojo tenia energia diferent ?
        // if creature has died, cell becames white
        if (me.energyLevel == 0)
            return CreatureSettings.deadCreatureColor;
        // format color depending on thropic level
        let e;
        if (me.energyLevel == -1) // non activated
            e = CreatureSettings.ENERGY_LEVEL_COLOR_NOT_ACTIVATED;
        else
            e = Math.ceil(CreatureSettings.ENERGY_LEVEL_COLOR_MIN + me.energyLevel);
        let c;
        // code into RGB depending on trophiclevel
        switch (me.trophicLevel) {
            case ThrophicLevel.PLANT:
                c = { r: me.attackLevel, g: e, b: me.defenseLevel };
                break;
            case ThrophicLevel.HERBIVORE:
                c = { r: me.defenseLevel, g: me.attackLevel, b: e };
                break;
            case ThrophicLevel.CARNIVORE:
                c = { r: e, g: me.defenseLevel, b: me.attackLevel };
                break;
            default:
                // something is wrong
                console.log("Creature > colorFromLifeParameters  *** Error ***" + me.toString());
                c = CreatureSettings.errorColor;
        }
        return c;
    }
}
//# sourceMappingURL=Creature.js.map
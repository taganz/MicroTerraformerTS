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
export class Creature {
    // initialize a creature with this color and do rutine actions
    // Consumes energy, updates color 
    // If herbivores or carnivores are not still activated, don't consume energy
    static beginIteration(lp_in) {
        let lp = lp_in;
        // if activated consume energy 
        if (lp.activated && !lp.dead) {
            switch (lp.trophicLevel) {
                case ThrophicLevel.PLANT:
                    lp.energyLevel -= Creature.ENERGY_CONSUMPTION_PLANTS;
                    break;
                case ThrophicLevel.HERBIVORE:
                    lp.energyLevel -= Creature.ENERGY_CONSUMPTION_HERBIVORES;
                    break;
                case ThrophicLevel.CARNIVORE:
                    lp.energyLevel -= Creature.ENERGY_CONSUMPTION_CARNIVORES;
                    break;
            }
            lp.energyLevel = lp.energyLevel < 0 ? 0 : lp.energyLevel;
        }
        // set my color with new energy level
        lp.color = this.colorFromLifeParameters(lp);
        return lp;
    }
    // returns attackResult
    static attack(me, it) {
        let res = AttackResult.DRAW;
        // <--- QUE PASSA SI UN ESTA MORT?
        // combats only occur when trophic levels are differents by one level
        // I'm a predator
        if (me.trophicLevel == ThrophicLevel.CARNIVORE && it.trophicLevel == ThrophicLevel.HERBIVORE
            || me.trophicLevel == ThrophicLevel.HERBIVORE && it.trophicLevel == ThrophicLevel.PLANT
            || me.trophicLevel == ThrophicLevel.PLANT && it.trophicLevel == ThrophicLevel.SOIL) {
            if (me.attackLevel > it.defenseLevel) {
                // activate if necessary
                if (!me.activated) {
                    me.activated = true;
                    me.energyLevel = Creature.ENERGY_LEVEL_AT_BIRTH; // <-- HAURIA DE SER DIFERENT SEGONS TL?
                }
                me.energyLevel += Creature.ENERGY_INCREMENT_KILLING;
                it.energyLevel = 0;
                res = AttackResult.KILL;
            }
        }
        // I'm a prey
        else if (it.trophicLevel == ThrophicLevel.CARNIVORE && me.trophicLevel == ThrophicLevel.HERBIVORE
            || it.trophicLevel == ThrophicLevel.HERBIVORE && me.trophicLevel == ThrophicLevel.PLANT
            || it.trophicLevel == ThrophicLevel.PLANT && me.trophicLevel == ThrophicLevel.SOIL) {
            if (me.defenseLevel < it.attackLevel) {
                // activate if necessary
                if (!it.activated) {
                    it.activated = true;
                    it.energyLevel = Creature.ENERGY_LEVEL_AT_BIRTH; // <-- HAURIA DE SER DIFERENT SEGONS TL?
                }
                it.energyLevel += Creature.ENERGY_INCREMENT_KILLING;
                me.energyLevel = 0;
                res = AttackResult.DIE;
            }
        }
        // adjust color if energy changed
        if (res != AttackResult.DRAW) {
            me.color = this.colorFromLifeParameters(me);
            it.color = this.colorFromLifeParameters(it);
        }
        return {
            result: res,
            me_post: me,
            it_post: it
        };
    }
    static lifeParametersFromColor(col) {
        let pars = {
            trophicLevel: 0,
            attackLevel: 0,
            defenseLevel: 0,
            energyLevel: 0,
            dead: false,
            activated: false,
            color: col
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
        else if (col.r <= Creature.ATTACK_LEVEL_MAX && col.g >= Creature.ENERGY_LEVEL_COLOR_MIN && col.b <= Creature.DEFENSE_LEVEL_MAX) {
            pars.trophicLevel = ThrophicLevel.PLANT;
        }
        // a herbivore
        else if (col.r <= Creature.DEFENSE_LEVEL_MAX && col.g <= Creature.ATTACK_LEVEL_MAX && col.b >= Creature.ENERGY_LEVEL_COLOR_NOT_ACTIVATED) {
            pars.trophicLevel = ThrophicLevel.HERBIVORE;
        }
        // a carnivore
        else if (col.r >= Creature.ENERGY_LEVEL_COLOR_NOT_ACTIVATED && col.g <= Creature.DEFENSE_LEVEL_MAX && col.b <= Creature.ATTACK_LEVEL_MAX) {
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
                pars.energyLevel = col.g - Creature.ENERGY_LEVEL_COLOR_MIN;
                pars.attackLevel = col.r;
                pars.defenseLevel = col.b;
                pars.activated = true;
                break;
            case ThrophicLevel.HERBIVORE:
                pars.energyLevel = col.b - Creature.ENERGY_LEVEL_COLOR_MIN;
                pars.attackLevel = col.g;
                pars.defenseLevel = col.r;
                pars.activated = pars.energyLevel > -1;
                break;
            case ThrophicLevel.CARNIVORE:
                pars.energyLevel = col.r - Creature.ENERGY_LEVEL_COLOR_MIN;
                pars.attackLevel = col.b;
                pars.defenseLevel = col.g;
                pars.activated = pars.energyLevel > -1;
                break;
        }
        pars.dead = pars.energyLevel == 0;
        return pars;
    }
    static getOffspring(lp) {
        let p = -15 + 30 * Math.random();
        lp.energyLevel = Creature.ENERGY_LEVEL_AT_BIRTH + p; // <--- TO BE INCLUDED: mutations
        lp.activated = true; // offspring are always activated    <--- aqui no fa res aixo
        lp.color = Creature.colorFromLifeParameters(lp);
        return lp;
    }
    static isTimeForMoving(me) {
        let p = Math.random();
        switch (me.trophicLevel) {
            case ThrophicLevel.PLANT:
                return p < Creature.PLANT_MOVE_PROBABILITY;
            case ThrophicLevel.HERBIVORE:
                return p < Creature.HERBIVORE_MOVE_PROBABILITY;
            case ThrophicLevel.CARNIVORE:
                return p < Creature.CARNIVORE_MOVE_PROBABILITY;
        }
        return false;
    }
    static isTimeForReproduction(me) {
        let p = Math.random();
        switch (me.trophicLevel) {
            case ThrophicLevel.PLANT:
                return p < Creature.PLANT_REPRODUCTION_PROBABILITY;
            case ThrophicLevel.HERBIVORE:
                return p < Creature.HERBIVORE_REPRODUCTION_PROBABILITY; // <----  && me.energyLevel > 75;
            case ThrophicLevel.CARNIVORE:
                return p < Creature.CARNIVORE_REPRODUCTION_PROBABILITY; // <----  && me.energyLevel > 75;
        }
        return false;
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
            dead: energyLevel == 0,
            activated: trophicLevel == ThrophicLevel.PLANT || (trophicLevel != ThrophicLevel.SOIL && energyLevel > -1),
            color: Creature.errorColor
        };
        return this.colorFromLifeParameters(me);
    }
    static colorFromLifeParameters(me) {
        if (me.trophicLevel == ThrophicLevel.SOIL)
            return Creature.soilColor; // <--- ojo tenia energia diferent ?
        // if creature has died, cell becames white
        if (me.energyLevel == 0)
            return Creature.deadCreatureColor;
        // format color depending on thropic level
        let e;
        if (me.energyLevel == -1) // non activated
            e = Creature.ENERGY_LEVEL_COLOR_NOT_ACTIVATED;
        else
            e = Math.ceil(Creature.ENERGY_LEVEL_COLOR_MIN + me.energyLevel);
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
                c = Creature.errorColor;
        }
        return c;
    }
}
Creature.deadCreatureColor = { r: 255, g: 255, b: 255 }; // equivalent to less defense soil
Creature.soilColor = { r: 255, g: 255, b: 128 };
Creature.errorColor = { r: 240, g: 50, b: 12 };
Creature.blackColor = { r: 0, g: 0, b: 0 };
//
//  SIMULATION PARAMETERS
//
// consumes this energy every cycle
Creature.ENERGY_CONSUMPTION_PLANTS = 1;
Creature.ENERGY_CONSUMPTION_HERBIVORES = 2; // 0.5
Creature.ENERGY_CONSUMPTION_CARNIVORES = 2;
Creature.ENERGY_INCREMENT_KILLING = 2;
Creature.DEFENSE_LEVEL_MAX = 150;
Creature.ATTACK_LEVEL_MAX = 150;
Creature.ENERGY_LEVEL_MAX = 100;
Creature.ENERGY_LEVEL_COLOR_MIN = 155; // energyLevel = color - ENERGY_LEVEL_COLOR_MIN
Creature.ENERGY_LEVEL_COLOR_NOT_ACTIVATED = 154; // 154 (energyLevel = -1) means "not activated"
Creature.ENERGY_LEVEL_AT_BIRTH = 50;
Creature.PLANT_REPRODUCTION_PROBABILITY = 0.2; // recommended 0.1 - 0.5
Creature.HERBIVORE_REPRODUCTION_PROBABILITY = 0.2; // recommended 0.15 - 
Creature.CARNIVORE_REPRODUCTION_PROBABILITY = 0.1;
// probability to move after killing a creature
Creature.PLANT_MOVE_PROBABILITY = 0;
Creature.HERBIVORE_MOVE_PROBABILITY = 0.2;
Creature.CARNIVORE_MOVE_PROBABILITY = 0.4;
//# sourceMappingURL=Creature.js.map
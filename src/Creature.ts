
export type Color = {
    r: number;
    g: number;
    b: number;
}

type LifeParameters = {
    trophicLevel : number,
    attackLevel : number,
    defenseLevel : number,
    energyLevel : number,
}


//  DEFINES 

export enum ThrophicLevel {    
    SOIL, 
    PLANT,
    HERBIVORE,
    CARNIVORE
}

export enum AttackResult {
    DRAW,
    KILL,
    DIE
}

export class CreatureSettings {

    public static deadCreatureColor: Color = {r: 255, g: 255, b: 255};    // equivalent to less defense soil
    public static soilColor: Color = {r: 255, g: 255, b: 128};   
    public static errorColor: Color = {r: 240, g: 50, b: 12};   
    public static blackColor: Color = {r: 255, g: 255, b: 255};   
    

    //
    //  SIMULATION PARAMETERS
    //

    // consumes this energy every cycle
    public static ENERGY_CONSUMPTION_PLANTS: number = 1;
    public static ENERGY_CONSUMPTION_HERBIVORES: number = 2;       // 0.5
    public static ENERGY_CONSUMPTION_CARNIVORES: number = 2;

    public static ENERGY_INCREMENT_KILLING: number = 2;

    public static DEFENSE_LEVEL_MAX: number = 150;
    public static ATTACK_LEVEL_MAX: number = 150;
    public static ENERGY_LEVEL_MAX: number = 100;
    public static ENERGY_LEVEL_COLOR_MIN: number = 155;              // energyLevel = color - ENERGY_LEVEL_COLOR_MIN
    public static ENERGY_LEVEL_COLOR_NOT_ACTIVATED: number = 154;   // 154 (energyLevel = -1) means "not activated"


    public static ENERGY_LEVEL_AT_BIRTH: number = 50;

    public static PLANT_REPRODUCTION_PROBABILITY: number = 0.2;        // recommended 0.1 - 0.5
    public static HERBIVORE_REPRODUCTION_PROBABILITY: number = 0.3;    // recommended 0.15 - 
    public static CARNIVORE_REPRODUCTION_PROBABILITY: number = 0.3;

    // probability to move after killing a creature
    public static PLANT_MOVE_PROBABILITY: number = 0;        
    public static HERBIVORE_MOVE_PROBABILITY: number = 0.2;     
    public static CARNIVORE_MOVE_PROBABILITY: number = 0.4;

}

export class Creature {

        
    me: LifeParameters;
    myColor : Color
    rand = Math.random();
    
    constructor(){
        this.me = {
            trophicLevel : 0,
            attackLevel : 0,
            defenseLevel : 0,
            energyLevel : 0
        }
        this.myColor = {r: 0, g: 0, b: 0}
    }
    
    // initialize a creature with this color and do rutine actions
    // Consumes energy, updates color 
    // If herbivores or carnivores are not still activated, don't consume energy
    beginIteration(c: Color){
        this.me = Creature.lifeParametersFromColor(c);
        this.myColor = Creature.colorFromLifeParameters(this.me);

            // not "living creatures" doesn't have metabolism...
            if (this.me.trophicLevel == ThrophicLevel.SOIL)
                return;
            if (this.isActivated()==false)
                return;

            // consumes energy
            switch (this.me.trophicLevel)
            {
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

            // update my color with new energy level
            this.myColor = Creature.colorFromLifeParameters(this.me);
    }

    
    // returns attackResult

    attack(itsColor: Color) : AttackResult {
            let it : LifeParameters = Creature.lifeParametersFromColor(itsColor);

            // combats only occur when trophic levels are differents by one level

            // I'm a predator
            if (this.me.trophicLevel - it.trophicLevel == 1)
            {
                if (this.me.attackLevel > it.defenseLevel)
                {
                    // activate if necessary
                    if (!this.isActivated()) {
                        this.me.energyLevel = CreatureSettings.ENERGY_LEVEL_AT_BIRTH;
                    }

                    this.me.energyLevel += CreatureSettings.ENERGY_INCREMENT_KILLING;                    // <---- ENERGY INCREASE, TO BE ADJUSTED
                    return AttackResult.KILL;
                }
            }

            // I'm a prey
            if (this.me.trophicLevel - it.trophicLevel == -1)
            {
                if (this.me.defenseLevel < it.attackLevel)
                {
                    this.me.energyLevel = 0;
                    return AttackResult.DIE;
                }
            }

            return AttackResult.DRAW;
                    
        }


    
    static lifeParametersFromColor(col: Color): LifeParameters {
        let pars : LifeParameters = {
            trophicLevel : 0,
            attackLevel : 0,
            defenseLevel : 0,
            energyLevel : 0
        };    // <-- com inicialitzar en blanc?????

        // backup

        if (col.r == 255 && col.g == 255)
        {
            pars.trophicLevel = ThrophicLevel.SOIL;
        }
        // black color is treated as SOIL
        else if (col.r == 0 && col.g == 0 && col.b == 0)
        {
            pars.trophicLevel = ThrophicLevel.SOIL;
        }
        // a plant
        else if (col.r <= CreatureSettings.ATTACK_LEVEL_MAX && col.g >= CreatureSettings.ENERGY_LEVEL_COLOR_MIN && col.b <= CreatureSettings.DEFENSE_LEVEL_MAX)
        {
            pars.trophicLevel = ThrophicLevel.PLANT;
        }
        // a herbivore
        else if (col.r <= CreatureSettings.DEFENSE_LEVEL_MAX && col.g <= CreatureSettings.ATTACK_LEVEL_MAX && col.b >= CreatureSettings.ENERGY_LEVEL_COLOR_NOT_ACTIVATED)
        {
            pars.trophicLevel = ThrophicLevel.HERBIVORE;
        }
        // a carnivore
        else if (col.r >= CreatureSettings.ENERGY_LEVEL_COLOR_NOT_ACTIVATED && col.g <= CreatureSettings.DEFENSE_LEVEL_MAX && col.b <= CreatureSettings.ATTACK_LEVEL_MAX)
        {
            pars.trophicLevel = ThrophicLevel.CARNIVORE;
        }
        else
        {
            // something is wrong
            console.log("lifeParametersFromColor error color:", col, "pars:", pars);
        }

        switch (pars.trophicLevel)
        {
            case ThrophicLevel.SOIL:
                pars.energyLevel = 0;
                pars.attackLevel = 0;
                pars.defenseLevel = 128- col.b/2;
                break;
            case ThrophicLevel.PLANT:
                pars.energyLevel = col.g - CreatureSettings.ENERGY_LEVEL_COLOR_MIN;
                pars.attackLevel = col.r;
                pars.defenseLevel = col.b;
                break;
            case ThrophicLevel.HERBIVORE:
                pars.energyLevel = col.b - CreatureSettings.ENERGY_LEVEL_COLOR_MIN;
                pars.attackLevel = col.g;
                pars.defenseLevel = col.r;
                break;
            case ThrophicLevel.CARNIVORE:
                pars.energyLevel = col.r - CreatureSettings.ENERGY_LEVEL_COLOR_MIN;
                pars.attackLevel = col.b;
                pars.defenseLevel = col.g;
                break; 
        }

        return pars;
    }

    //<---- canviar per un atribut de la classe?

    // Herbivores and carnivores are not "activated" until they have a first interaction with predator or prey
    // SOIL is never activated
    // PLANTS are always activated
    // This is indicated with energyLevel = -1
    isActivated(): boolean {
        if (this.me.trophicLevel == ThrophicLevel.SOIL)
            return false;
        else if (this.me.trophicLevel == ThrophicLevel.PLANT)
            return true;
        else
            return this.me.energyLevel > -1;
        }

    isDead(c: Color): boolean {
        return c == CreatureSettings.deadCreatureColor;
    }

    getOffspring(): Color {
        let p : number = -15+ 30*Math.random();
        this.me.energyLevel = CreatureSettings.ENERGY_LEVEL_AT_BIRTH + p;                 // <--- TO BE INCLUDED: mutations
        return Creature.colorFromLifeParameters(this.me);
    }



    isTimeForMoving() : boolean {
        let p : number = Math.random();
        switch (this.me.trophicLevel)
        {
            case ThrophicLevel.PLANT:
                return p < CreatureSettings.PLANT_MOVE_PROBABILITY;
            case ThrophicLevel.HERBIVORE:
                return p < CreatureSettings.HERBIVORE_MOVE_PROBABILITY; 
            case ThrophicLevel.CARNIVORE:
                return p < CreatureSettings.CARNIVORE_MOVE_PROBABILITY; 

        }
        return false;
    }

    
    isTimeForReproduction(): boolean{
        let p : number = Math.random();
        switch(this.me.trophicLevel)
        {
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
    static isTimeForReproductionColor(c2: Color) : Color{
            let q : number = 0;
            let pars : LifeParameters= this.lifeParametersFromColor(c2);
            switch (pars.trophicLevel)
            {
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
            if (q > Math.random())
            {
                pars.energyLevel = CreatureSettings.ENERGY_LEVEL_AT_BIRTH;                 // <--- TO BE INCLUDED: mutations
                return this.colorFromLifeParameters(pars);
            }
            else
                return CreatureSettings.deadCreatureColor;
 
    }
    

    getTrophicLevel(c : Color): number {
        return 0;
    }


    getTrophicLevelString(c: Color): string{
        return "";
    }




    /// <summary>
    /// returns creature's color from parameters
    /// </summary>

    static getColor(trophicLevel: ThrophicLevel, energyLevel: number, attackLevel: number, defenseLevel: number): Color {
        let me : LifeParameters = {
        trophicLevel : trophicLevel,
        energyLevel : energyLevel,
        attackLevel : attackLevel,
        defenseLevel : defenseLevel
        }
        return this.colorFromLifeParameters(me);
    }

    static colorFromLifeParameters(me: LifeParameters) : Color {
        if (me.trophicLevel == ThrophicLevel.SOIL)
            return CreatureSettings.soilColor;

        // if creature has died, cell becames white (to avoid problems with soil defence)   <----- TO BE ADJUSTED 
        if (me.energyLevel == 0)                        // -1 means not activated
            return CreatureSettings.deadCreatureColor; 

        // format color depending on thropic level
        let e : number;
        if (me.energyLevel == -1)    // non activated
            e = CreatureSettings.ENERGY_LEVEL_COLOR_NOT_ACTIVATED;
        else
            e = Math.ceil(CreatureSettings.ENERGY_LEVEL_COLOR_MIN + me.energyLevel);
        let c : Color;
        switch (me.trophicLevel)
        {
            case ThrophicLevel.PLANT:
                c = {r: me.attackLevel, g: e, b: me.defenseLevel};
                break;
            case ThrophicLevel.HERBIVORE:
                c = {r: me.defenseLevel, g: me.attackLevel, b: e};
                break;
            case ThrophicLevel.CARNIVORE:
                c = {r: e, g: me.defenseLevel, b: me.attackLevel};
                break;
            default:
                // something is wrong
                console.log("Creature > colorFromLifeParameters  *** Error ***"+me.toString())
                c = CreatureSettings.errorColor;  // <----
        }            
        return c;

    } 


    // Changes color to reflect energy level at the beginning of simulation
    // Plants have ENERGY_LEVEL_AT_BIRTH
    // Herbivores and Carnivores have -1. They don't start losing energy until they eat something
    // Return White if color is not a valid creature
    setInitialEnergyLevel(c: Color): Color {
        let c2 : Color = {r: 0, g: 0, b: 0};
        return c2;

    }

}
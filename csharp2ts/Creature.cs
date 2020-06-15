using System;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MicroTerraformer2
{


    /// <summary>
    /// manages creature properties from colors
    /// </summary>
    class Creature
    {
        //
        //  DEFINES
        //
        

        // trophicLevel
        public const int SOIL = 0;
        public const int PLANT = 1;
        public const int HERBIVORE = 2;
        public const int CARNIVORE = 3;

        // attackResult
        public const int DRAW = 0;
        public const int KILL = 1;
        public const int DIE = 2;

        public static Color deadCreatureColor = Color.FromArgb(255, 255, 255, 128);    // equivalent to less defense soil
        

        //
        //  SIMULATION PARAMETERS
        //

        // consumes this energy every cycle
        const float ENERGY_CONSUMPTION_PLANTS = 1.0f;
        const float ENERGY_CONSUMPTION_HERBIVORES = 2.0f;       // 0.5
        const float ENERGY_CONSUMPTION_CARNIVORES = 2.0f;

        const float ENERGY_INCREMENT_KILLING = 2f;

        public const int DEFENSE_LEVEL_MAX = 150;
        public const int ATTACK_LEVEL_MAX = 150;
        public const int ENERGY_LEVEL_MAX = 100;
        public const int ENERGY_LEVEL_COLOR_MIN = 155;              // energyLevel = color - ENERGY_LEVEL_COLOR_MIN
        public const int ENERGY_LEVEL_COLOR_NOT_ACTIVATED = 154;   // 154 (energyLevel = -1) means "not activated"


        public const int ENERGY_LEVEL_AT_BIRTH = 50;

        public const float PLANT_REPRODUCTION_PROBABILITY = 0.20f;        // recommended 0.1 - 0.5
        public const float HERBIVORE_REPRODUCTION_PROBABILITY = 0.30f;    // recommended 0.15 - 
        public const float CARNIVORE_REPRODUCTION_PROBABILITY = 0.30f;

        // probability to move after killing a creature
        public const float PLANT_MOVE_PROBABILITY = 0f;        
        public const float HERBIVORE_MOVE_PROBABILITY = 0.20f;     
        public const float CARNIVORE_MOVE_PROBABILITY = 0.40f;


        public struct lifeParameters
        {
            public int trophicLevel;
            public int attackLevel;
            public int defenseLevel;
            public float energyLevel;
            public Color myColor;
        }

        public lifeParameters me;

        private Random rand = new Random();

        // Consumes energy and returns color for new state
        // If herbivores or carnivores are not still activated, don't consume energy

        public void BeginIteration(Color myColor)
        {

            me = LifeParametersFromColor(myColor);

            // not "living creatures" doesn't have metabolism...
            if (me.trophicLevel == SOIL)
                return;
            if (this.IsActivated()==false)
                return;

            // consumes energy
            switch (me.trophicLevel)
            {
                case PLANT:
                    me.energyLevel -= ENERGY_CONSUMPTION_PLANTS;
                    break;
                case HERBIVORE:
                    me.energyLevel -= ENERGY_CONSUMPTION_HERBIVORES;
                    break;
                case CARNIVORE:
                    me.energyLevel -= ENERGY_CONSUMPTION_CARNIVORES;
                    break;
            }

            me.energyLevel = me.energyLevel < 0 ? 0 : me.energyLevel;

            // update my color with new energy level
            me.myColor = ColorFromLifeParameters(me);
        }

        // returns attackResult

        public int Attack(Color itsColor)
        {
            lifeParameters it;
            
            it = LifeParametersFromColor(itsColor);

            // combats only occur when trophic levels are differents by one level

            // I'm a predator
            if (me.trophicLevel - it.trophicLevel == 1)
            {
                if (me.attackLevel > it.defenseLevel)
                {
                    // activate if necessary
                    if (!this.IsActivated())
                        me.energyLevel = ENERGY_LEVEL_AT_BIRTH;

                    me.energyLevel += ENERGY_INCREMENT_KILLING;                    // <---- ENERGY INCREASE, TO BE ADJUSTED
                    return KILL;
                }
            }

            // I'm a prey
            if (me.trophicLevel - it.trophicLevel == -1)
            {
                if (me.defenseLevel < it.attackLevel)
                {
                    me.energyLevel = 0;
                    return DIE;
                }
            }

            return DRAW;
                    
        }

        // Assign lifeParameters values from color
        // assume color is of a valid type
        // exception if trophicLevel is not valid
        private static lifeParameters LifeParametersFromColor(Color col)
        {
            lifeParameters pars = new lifeParameters();

            // backup
            pars.myColor = col;

            if (col.R == 255 && col.G == 255)
            {
                pars.trophicLevel = SOIL;
            }
            // black color is treated as SOIL
            else if (col.R == 0 && col.G == 0 && col.R == 0)
            {
                pars.trophicLevel = SOIL;
            }
            // a plant
            else if (col.R <= ATTACK_LEVEL_MAX && col.G >= ENERGY_LEVEL_COLOR_MIN && col.B <= DEFENSE_LEVEL_MAX)
            {
                pars.trophicLevel = PLANT;
            }
            // a herbivore
            else if (col.R <= DEFENSE_LEVEL_MAX && col.G <= ATTACK_LEVEL_MAX && col.B >= ENERGY_LEVEL_COLOR_NOT_ACTIVATED)
            {
                pars.trophicLevel = HERBIVORE;
            }
            // a carnivore
            else if (col.R >= ENERGY_LEVEL_COLOR_NOT_ACTIVATED && col.G <= DEFENSE_LEVEL_MAX && col.B <= ATTACK_LEVEL_MAX)
            {
                pars.trophicLevel = CARNIVORE;
            }
            else
            {
                // something is wrong
                throw new IndexOutOfRangeException();
            }

            switch (pars.trophicLevel)
            {
                case SOIL:
                    pars.energyLevel = 0;
                    pars.attackLevel = 0;
                    pars.defenseLevel = 128- col.B/2;
                    break;
                case PLANT:
                    pars.energyLevel = col.G - ENERGY_LEVEL_COLOR_MIN;
                    pars.attackLevel = col.R;
                    pars.defenseLevel = col.B;
                    break;
                case HERBIVORE:
                    pars.energyLevel = col.B - ENERGY_LEVEL_COLOR_MIN;
                    pars.attackLevel = col.G;
                    pars.defenseLevel = col.R;
                    break;
                case CARNIVORE:
                    pars.energyLevel = col.R - ENERGY_LEVEL_COLOR_MIN;
                    pars.attackLevel = col.B;
                    pars.defenseLevel = col.G;
                    break; 
            }

            return pars;
        }

        // Herbivores and carnivores are not "activated" until they have a first interaction with predator or prey
        // SOIL is never activated
        // PLANTS are always activated
        // This is indicated with energyLevel = -1
        public bool IsActivated()
        {
            if (me.trophicLevel == SOIL)
                return false;
            else if (me.trophicLevel == PLANT)
                return true;
            else
                return me.energyLevel > -1;
        }

        public bool IsDead()
        {
            if (me.trophicLevel == SOIL)
                return false;
            else
                return me.energyLevel == 0;
        }

        public static bool IsDead(Color c)
        {
            return (c.G == deadCreatureColor.G && c.B == deadCreatureColor.B &&  c.R == deadCreatureColor.R);               // <-- TO BE ADJUSTED
        }


        public Color GetOffspring()
        {
            int p = -15+ rand.Next(30);
            me.energyLevel = ENERGY_LEVEL_AT_BIRTH + p;                 // <--- TO BE INCLUDED: mutations
            return ColorFromLifeParameters(me);
        }

        private static Color ColorFromLifeParameters(lifeParameters me)
        {
            // for SOIL just return original color
            if (me.trophicLevel == SOIL)
                return me.myColor;

            // if creature has died, cell becames white (to avoid problems with soil defence)   <----- TO BE ADJUSTED 
            if (me.energyLevel == 0)                        // -1 means not activated
                return deadCreatureColor; 

            // format color depending on thropic level
            int e;
            if (me.energyLevel == -1)    // non activated
                e = ENERGY_LEVEL_COLOR_NOT_ACTIVATED;
            else
                e = (int)Math.Ceiling(ENERGY_LEVEL_COLOR_MIN + me.energyLevel);
            switch (me.trophicLevel)
            {
                case PLANT:
                    return Color.FromArgb(me.attackLevel, e, me.defenseLevel);
                case HERBIVORE:
                    return Color.FromArgb(me.defenseLevel, me.attackLevel, e);
                case CARNIVORE:
                    return Color.FromArgb(e, me.defenseLevel, me.attackLevel);
                default:
                    // something is wrong
                    throw new IndexOutOfRangeException();
            }
        }


        public bool IsTimeForMoving()
        {
            float p = rand.Next(1000) / 1000f;
            switch (me.trophicLevel)
            {
                case PLANT:
                    return p < PLANT_MOVE_PROBABILITY;
                case HERBIVORE:
                    return p < HERBIVORE_MOVE_PROBABILITY; 
                case CARNIVORE:
                    return p < CARNIVORE_MOVE_PROBABILITY; 

            }
            return false;
        }

        public bool IsTimeForReproduction()
        {
            float p = rand.Next(1000) / 1000f;
            switch(me.trophicLevel)
            {
                case PLANT:
                    return p < PLANT_REPRODUCTION_PROBABILITY;
                case HERBIVORE:
                    return p < HERBIVORE_REPRODUCTION_PROBABILITY; // <----  && me.energyLevel > 75;
                case CARNIVORE:
                    return p < CARNIVORE_REPRODUCTION_PROBABILITY; // <----  && me.energyLevel > 75;
 
            }
            return false;
        }

        // returns offspring color or white if it is not time for reproduction
        public static Color IsTimeForReproduction(Color c2)
        {
            Random r = new Random();
            float p = r.Next(1000) / 1000f;
            float q = 0f;
            lifeParameters pars = new lifeParameters();
            pars = LifeParametersFromColor(c2);
            pars.energyLevel = ENERGY_LEVEL_AT_BIRTH;                 // <--- TO BE INCLUDED: mutations
            switch (pars.trophicLevel)
            {
                case PLANT:
                    q = PLANT_REPRODUCTION_PROBABILITY;
                    break;
                case HERBIVORE:
                    q = HERBIVORE_REPRODUCTION_PROBABILITY;
                    break;
                case CARNIVORE:
                    q = CARNIVORE_REPRODUCTION_PROBABILITY;
                    break;

            }
            if (p < q)
            {
                return ColorFromLifeParameters(pars);
            }
            else
                return deadCreatureColor;
        }


        /// <summary>
        /// returns trophic level for the color
        /// </summary>

        public int GetTrophicLevel(Color c)
        {
            lifeParameters lp;
            lp = LifeParametersFromColor(c);
            return lp.trophicLevel;
        }
        public String GetTrophicLevelString(Color c)
        {
            lifeParameters lp;
            lp = LifeParametersFromColor(c);
            switch(lp.trophicLevel)
            {
                case SOIL:
                    return "SOIL (" + c.ToString() + ")";
                case PLANT:
                    return "PLANT (" + c.ToString() + ")";
                case HERBIVORE:
                    return "HERBIVORE (" + c.ToString() + ")";
                case CARNIVORE:
                    return "CARNIVORE (" + c.ToString() + ")";
                default:
                    return "UNKNOW ("+c.ToString() +")";
            }
        }

        /// <summary>
        /// returns creature's color from parameters
        /// </summary>

        public static Color GetColor(int trophicLevel, int energyLevel, int attackLevel, int defenseLevel)
        {
            lifeParameters me = new lifeParameters();
            me.trophicLevel = trophicLevel;
            me.energyLevel = energyLevel;
            me.attackLevel = attackLevel;
            me.defenseLevel = defenseLevel;
            me.myColor = ColorFromLifeParameters(me);
            return me.myColor;
        }


        // Changes color to reflect energy level at the beginning of simulation
        // Plants have ENERGY_LEVEL_AT_BIRTH
        // Herbivores and Carnivores have -1. They don't start losing energy until they eat something
        // Return White if color is not a valid creature
        public static Color SetInitialEnergyLevel(Color c)
        {
            try
            {
                lifeParameters myPars = LifeParametersFromColor(c);
                switch (myPars.trophicLevel)
                {
                    case SOIL:
                        break;
                    case PLANT:
                        myPars.energyLevel = ENERGY_LEVEL_AT_BIRTH;
                        break;
                    case HERBIVORE:
                        myPars.energyLevel = -1;            // non activated
                        break;
                    case CARNIVORE:
                        myPars.energyLevel = -1;            // non activated
                        break;
                }

                return ColorFromLifeParameters(myPars);
            }
            catch (Exception)
            {
                return deadCreatureColor;
            }
        }

 
    }
}

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MicroTerraformer2
{

    /// <summary>
    /// World holds the world bitmap, where creatures live. It manages iterations for them.
    /// </summary>
    class World
    {

        public void NewWorld()
        {
            // different initialization options for test purposes

            bmp = NewTestWorld(64, 64);
            //bmp = NewTestWorld3x3();

            InitializeBitmap();
        }

        /// <summary>
        /// load an image  
        /// (I use a copy because sometimes file was locked...?)
        /// </summary>
        public void NewLoadWorld(string fileName)
        {
            // Create a new bitmap.
            Bitmap bmp3 = new Bitmap(fileName);
            bmp = new Bitmap(bmp3);
            bmp3.Dispose();
            InitializeBitmap();
        }

        private void InitializeBitmap()
        {

            // check there are no invalid cells
            InitializeCreaturesInBmp();

            // create working copy
            bmp2 = new Bitmap(bmp);


        }


        public void Iteration()
        {

            // we'll use this object to work with creatures
            Creature joe = new Creature();

            // reset working bitmap, paint all cells black
            ResetBitmap2();

            // checks all cells, starting at NW
            // for each cell check E, SE, S, SW neighbours, others neighbours will check for us

            for (int y = 0; y < bmp.Height; y++)
            {
                for (int x = 0; x < bmp.Width; x++)
                {
                    bool done = false;

                    // first we must check if joe has already been processed in our working bitmap bmp2
                    // (may be it won an attack when its North neighbour attacked it...
                    // if so, its cell in bmp2 will not be black anymore

                    Color c1 = bmp2.GetPixel(x, y);
                    if (!(c1.R == 0 && c1.G == 0 && c1.B == 0))
                    {
                        // if cell is not black, then joe has already been processed
                        done = true;      
                    }                       
                    
                    if (!done)
                    {
                        // joe hasn't been processed, let's go...

                        // joe lives at x,y. get its actual color
                        c1 = bmp.GetPixel(x, y);

                        // start iteration cycle, decreases energy
                        joe.BeginIteration(c1);

                        // if it died...
                        if (joe.IsDead())
                        {
                            bmp.SetPixel(x, y, joe.me.myColor);
                            bmp2.SetPixel(x, y, joe.me.myColor);
                            done = true;
                        }

                        // get new color for joe, with energy modified
                        c1 = joe.me.myColor;
                    }

                    // combat at east
                    if (!done && x < bmp.Width - 1)
                    {
                        done = IterationCheckNeighbour(joe, x, y, x + 1, y);
                    }
                    // combat at south-east
                    if (!done && x<bmp.Width-1 && y < bmp.Height-1)
                        done = IterationCheckNeighbour(joe, x, y, x + 1, y+1);

                    // combat at south
                    if (!done && y < bmp.Height - 1)
                        done = IterationCheckNeighbour(joe, x, y, x, y + 1);

                    // combat at south-west
                    if (!done && x > 1 && y < bmp.Height- 1)
                        done = IterationCheckNeighbour(joe, x, y, x-1, y + 1);


                    // nothing happened with any neighbour, keep joe
                    if (!done)
                    {
                        bmp2.SetPixel(x, y, c1);
                    }
                }
            }


            // when finished, copy working bmp over bmp
            bmp = new Bitmap(bmp2);                                       // TO BE OPTIMIZED <----
        }

        // attack neighbour and update bmp2 with result
        // if joe kills a neighbour or is killed by its neighbours, returns true to stop checking other directions
        private bool IterationCheckNeighbour(Creature joe, int x1, int y1, int x2, int y2)
        {
            // get neighbour color
            Color c2 = bmp.GetPixel(x2, y2);

            // attack
            int result = joe.Attack(c2);

            // c1 killed its neighbour
            if (result == Creature.KILL)
            {
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
                if (!joe.IsTimeForMoving())
                {
                    // stay at place
                    bmp2.SetPixel(x1, y1, joe.me.myColor);
                    // try to reproduce to neighbour place
                    if (joe.IsTimeForReproduction())
                        bmp2.SetPixel(x2, y2, joe.GetOffspring());
                    else
                        // leave neighbour
                        bmp2.SetPixel(x2, y2, c2);
                }
                else
                {
                    // move
                    bmp2.SetPixel(x2, y2, joe.me.myColor);
                    // try to reproduce at joe's previous place
                    if (joe.IsTimeForReproduction())
                        bmp2.SetPixel(x1, y1, joe.GetOffspring());
                    else
                        // clean place
                        bmp2.SetPixel(x1, y1, Creature.deadCreatureColor);
                }





                return true;
            }

            if (result == Creature.DIE)
            {

                // put killer neighbour's offspring at joe's place or leave joe (to avoid white cells between predators and preys)
                c2 = Creature.IsTimeForReproduction(c2);
                if (c2.B==0 && c2.R==0 && c2.G==0)
                    bmp2.SetPixel(x1, y1, joe.me.myColor);
                else
                    bmp2.SetPixel(x1, y1, c2);
                return true;
            }

            // nothing happened this time
            return false;
        }
  

        // Checks that creatures are of a valid type in a new bitmap
        // Replaces invalid creatures with a white color soil
        // Assigns energy level
        private void InitializeCreaturesInBmp()
        {
            for (int y = 0; y < bmp.Height; y++)
            {
                for (int x = 0; x < bmp.Width; x++)
                {
                    Color c1 = bmp.GetPixel(x, y);
                    c1 = Creature.SetInitialEnergyLevel(c1);
                    bmp.SetPixel(x, y, c1);
                }
            }
        }

        /// <summary>
        /// fills a world with a test population
        /// </summary>
        private Bitmap NewTestWorld(int width, int heigh)
        {
            

        }

        // TEST world 3x3
        private Bitmap NewTestWorld3x3()
        {
            Bitmap bmp = new Bitmap(3, 3);
            Random rand = new Random();

            int energyNonActivated = Creature.ENERGY_LEVEL_COLOR_NOT_ACTIVATED;

            // pinta plantes
            bmp.SetPixel(0, 0, Creature.GetColor(Creature.CARNIVORE, 50, 100, energyNonActivated));
            bmp.SetPixel(1, 0, Creature.GetColor(Creature.PLANT, 50, 100, 50));
            bmp.SetPixel(2, 0, Creature.GetColor(Creature.PLANT, 50, 100, 50));
            bmp.SetPixel(0, 1, Creature.GetColor(Creature.PLANT, 50, 100, 50));
            bmp.SetPixel(1, 1, Creature.GetColor(Creature.HERBIVORE, energyNonActivated, 100, 50));
            bmp.SetPixel(2, 1, Creature.GetColor(Creature.PLANT, 50, 100, 50));
            bmp.SetPixel(0, 2, Creature.GetColor(Creature.PLANT, 50, 100, 50));
            bmp.SetPixel(1, 2, Creature.GetColor(Creature.PLANT, 50, 100, 50));
            bmp.SetPixel(2, 2, Creature.GetColor(Creature.PLANT, 50, 100, 50));

            return bmp;
        }

        // TO BE OPTIMIZED <------
        private void ResetBitmap2()
        {
            for (int y = 0; y < bmp2.Height; y++)
            {
                for (int x = 0; x < bmp2.Width; x++)
                {
                    bmp2.SetPixel(x, y, Color.Black);
                }
            }
        }
    }
}

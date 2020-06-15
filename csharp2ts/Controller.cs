using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MicroTerraformer2
{
    /// <summary>
    /// Manages theWorld and iteration counter. Nothing more right now.....
    /// </summary>
    class Controller
    {
        public int iteration;
        public bool imageLoaded = false;

        public World theWorld = new World();

        private void Initialize()
        {
            iteration = 0;
            imageLoaded = true;
        }

        
        public void NewWorld()
        {
            theWorld.NewWorld();
            Initialize();
        }
 

        public void StepSimulation()
        {
            theWorld.Iteration();
            iteration++;
        }

        public void LoadWorldFromFile(string fileName)
        {
            theWorld.NewLoadWorld(fileName);
            Initialize();

        }

    }



}

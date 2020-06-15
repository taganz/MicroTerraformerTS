System: using;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MicroTerraformer2
{
    /**Manages theWorld and iteration counter. Nothing more right now..... */
    interface Controller
    {
        iteration: number;
        imageLoaded: boolean;

        theWorld: World;

        Initialize(): void;

        
        NewWorld(): void;
 

        StepSimulation(): void;

        LoadWorldFromFile(fileName: string): void;

    }



}

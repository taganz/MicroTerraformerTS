
// gestiona el imageData

export class World  {

    iteration: number;
    imageData : ImageData;
    canvasWidth: number;
    canvasHeight: number;
    
    constructor (ctx:any) {
        this.canvasWidth = 400;     // veure html
        this.canvasHeight = 200;     // veure html
        this.imageData = ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        console.log("World is created"); 
        this.reset();
    }

    // reset world with default values

    reset() {
        this.iteration = 0;
        // ---> borrar imageData

    }
    
    // updates world 1 step

    step(){
        this.drawPixel(20+this.iteration, 20+this.iteration, 255, 0, 0, 255);
        this.drawPixel(21+this.iteration, 30+this.iteration, 255, 0, 0, 255);
        this.drawPixel(22+this.iteration, 40+this.iteration, 255, 0, 0, 255);
        this.iteration++;
    }


    newLoadWorld(fileName: string){
        console.log("world: load not available!"); 
    }

    saveWorld(filename: string){
        console.log("world: save not available!"); 
    }




    // That's how you define the value of a pixel //
     drawPixel (x: number, y:number, r:number, g:number, b:number, a:number) {
        var index = (x + y * this.canvasWidth) * 4;

        this.imageData.data[index + 0] = r;
        this.imageData.data[index + 1] = g;
        this.imageData.data[index + 2] = b;
        this.imageData.data[index + 3] = a;
    }


}
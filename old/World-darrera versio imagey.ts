
// world contains an ImageData like array (RGBA)
// (doesn't know about canvas nor context)

export class World  {

    iteration: number;
    imageData: HTMLImageElement;
    //image : number[]    // ImageData.data like array
    //image_len : number;
    width: number;
    height: number;
    
    constructor (imageData: HTMLImageElement) {
        this.width = imageData.width;     
        this.height = imageData.height;    
        this.imageData = new ImageData (imageData.data, imageData.width, imageData.height);
        //this.image_len = this.width * this.height * 4;
        //this.image = new Array(this.image_len);
        console.log("World is created"); 
        this.reset();
    }

    // reset world with default values

    reset() {
        this.iteration = 0;
        // borra image
        for(var x = 0; x < this.width;x++){
            for(var y = 0; y < this.height;y++){
                this.drawPixel(x,y, 128, 128, 128, 255);
            }
        }

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
        var index = (x + y * this.width) * 4;

        this.imageData.data[index + 0] = r;
        this.imageData.data[index + 1] = g;
        this.imageData.data[index + 2] = b;
        this.imageData.data[index + 3] = a;
    }


}



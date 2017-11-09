/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */

function GlCanvas() {

    this.construct = () => {
        // 1. Get canvas and setup WebGL context
        this.canvas = document.getElementById("gl-canvas");
        this.gl = this.canvas.getContext('webgl');

        // 2. Configure viewport
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // 4. Init shader program via additional function and bind it
        this.program = initShader(this.gl, "vertex-shader", "fragment-shader");
        this.gl.useProgram(this.program);
    };

    this.add = (object) => {
        this.objects.push(object);
    };

    this.render = () => {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        for(let i=0; i<this.objects.length; i++){
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.drawObject(this.objects[i]));
        }
        
    };


    this.drawObject = (object) => {
        let positions = object.positions;
        let colors = object.colors;

        // 5. Create VBO
        let vbo = this.gl.createBuffer();

        // 6. Fill VBO with positions and colors
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions.concat(colors)), this.gl.STATIC_DRAW);

        // 7. Link data in VBO to shader variables
        let vPosition = this.gl.getAttribLocation(this.program, "vPosition");
        this.gl.enableVertexAttribArray(vPosition);
        this.gl.vertexAttribPointer(vPosition, 2, this.gl.FLOAT, false, 0, 0);

        let vColor = this.gl.getAttribLocation(this.program, "vColor");
        this.gl.enableVertexAttribArray(vColor);
        this.gl.vertexAttribPointer(vColor, 4, this.gl.FLOAT, false, 0, positions.length * 4);
        
        //Erstelle Rotationsmatrix
		let vRotation = this.gl.getUniformLocation(this.program, "vRotation");
	
		let rotation =  object.orientation;
		let rotationsMatrix = [Math.cos(rotation), Math.sin(rotation), 0, 0,
                                -Math.sin(rotation), Math.cos(rotation), 0, 0,
                                0,                  0,                  1,  0,
                                0,                  0,                  0,  1];
        this.gl.uniformMatrix4fv(vRotation, false, rotationsMatrix);
        
        //Erstelle Translation
        let vTranslation = this.gl.getUniformLocation(this.program, "vTranslation");

        let tX = object.tx;
        let tY = object.ty;
        this.gl.uniform3fv(vTranslation, [tX, tY, 0])

        return positions.length / 2;
    };



    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.objects = [];
    this.construct();
}

function GlObject(tx, ty) {

    this.construct = () => {
        canvas.add(this);
    };

    this.translate = (tx, ty) => {
        this.tx += tx/100;
        this.ty += ty/100;
    };
	
	this.rotate = degree => {
		this.orientation = degree;
    }

    this.tx = 0;
    this.ty = 0;
    this.translate(tx, ty);
	this.orientation = 0;
    this.positions = [];
    this.colors = [];
}



function Pacman(x, y) {

    GlObject.call(this, x, y);

    this.scale = (radius, vertices, mouthAngle) => {
        this.positions = [];
        this.colors = [];

        // 3. Specify geometry
        const triangleAngle = 360 / vertices;
        const mouth = mouthAngle / 2 / triangleAngle;

        // Calculate Pac-Man shape
        for (let i=mouth*triangleAngle; i<360 - mouth*triangleAngle; i+=triangleAngle) {
            this.positions.push(
                // Erste Koordinaten für das Dreieck
                0, 0,
                // Zweite Koordinaten für das Dreieck
                radius * Math.cos(degreeToRadians(i)),
                radius * Math.sin(degreeToRadians(i)),
                // Dritte Koordinaten für das Dreieck
                radius * Math.cos(degreeToRadians(i+triangleAngle)),
                radius * Math.sin(degreeToRadians(i+triangleAngle))
            );
            for (let j=0; j<3; j++) this.colors.push(1, 1, 0, 1);
        }
    };

    this.construct();
}


const degreeToRadians = degree => {
    return (degree/180) * Math.PI;
}

let canvas = new GlCanvas();


function init() {
   let pacman1 = new Pacman(0, 30);
   pacman1.translate(50,0);
   pacman1.scale(0.45, 30, 50);
   pacman1.rotate(degreeToRadians(-70));
   

   let pacman2 = new Pacman(-80, -40);
   pacman2.translate(50,0);
   pacman2.scale(0.15, 20, 90);
   pacman2.rotate(degreeToRadians(210))

    // 8. Render
    canvas.render();
}

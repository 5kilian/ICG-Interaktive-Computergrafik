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
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.draw());
    };

    this.draw = () => {
        let [positions, colors] = this.objects.reduce((result, object) => [
            result[0].concat(object.positions),
            result[1].concat(object.colors)
        ], [[],[]]);

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

        return positions.length / 2;
    };

    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.objects = [];
    this.construct();
}

function GlObject(x, y) {

    this.construct = () => {
        canvas.add(this);
    };

    this.setPosition = (x, y) => {
        this.x = x/100;
        this.y = y/100;
    };

    this.x = 0;
    this.y = 0;
    this.setPosition(x, y);
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
                this.x, this.y,
                // Zweite Koordinaten für das Dreieck
                this.x + radius * Math.cos(Math.PI*(i/180)),
                this.y + radius * Math.sin(Math.PI*(i/180)),
                // Dritte Koordinaten für das Dreieck
                this.x + radius * Math.cos(Math.PI*((i+triangleAngle)/180)),
                this.y + radius * Math.sin(Math.PI*((i+triangleAngle)/180))
            );
            for (let j=0; j<3; j++) this.colors.push(1, 1, 0, 1);
        }
    };

    this.construct();
}

let canvas = new GlCanvas();

function init() {
    new Pacman(0, 50).scale(0.25, 30, 50);
    new Pacman(0, -5).scale(0.15, 8, 45);

    // 8. Render
    canvas.render();
}

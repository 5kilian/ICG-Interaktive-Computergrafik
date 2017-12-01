/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */

const KEYCODE_LEFT = 37;
const KEYCODE_RIGHT = 39;
const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const degreeToRadians = degree => degree / 180 * Math.PI;
const radiansToDegree = radians => radians / Math.PI * 180;

function GlCanvas() {

    this.construct = () => {
        // 2. Configure viewport
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // 4. Init shader program via additional function and bind it
        this.program = initShader(this.gl, "vertex-shader", "fragment-shader");
        this.gl.useProgram(this.program);

        requestAnimationFrame(this.tick);
    };

    this.initialize = () => {
        this.construct();
    };

    this.add = (object) => {
        this.objects.push(object);
    };

    this.remove = (object) => {
        let index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    };

    this.tick = () => {
        this.update();
        this.render();
        requestAnimationFrame(this.tick)
    };

    this.update = () => {
        this.objects.forEach(object => object.update());
        if (this.activeObject.keyChanged) {
            this.activeObject.handleEvent();
            this.activeObject.keyChanged = false;
        }
    };

    this.render = () => {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.objects.forEach(object => this.gl.drawArrays(object.glMode, 0, this.drawObject(object)));
    };


    this.drawObject = (object) => {
        // 5. Create VBO
        let vbo = this.gl.createBuffer();

        // 6. Fill VBO with positions and colors
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(object.positions.concat(object.colors)), this.gl.STATIC_DRAW);

        // 7. Link data in VBO to shader variables
        let vPosition = this.gl.getAttribLocation(this.program, "vPosition");
        this.gl.enableVertexAttribArray(vPosition);
        this.gl.vertexAttribPointer(vPosition, 2, this.gl.FLOAT, false, 0, 0);

        let vColor = this.gl.getAttribLocation(this.program, "vColor");
        this.gl.enableVertexAttribArray(vColor);
        this.gl.vertexAttribPointer(vColor, 4, this.gl.FLOAT, false, 0, object.positions.length * 4);

        // Erstelle Rotationsmatrix
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "vRotation"), false, [
            Math.cos(object.orientation), Math.sin(object.orientation), 0, 0,
            -Math.sin(object.orientation), Math.cos(object.orientation), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);

        // Erstelle Translation
        this.gl.uniform3fv(this.gl.getUniformLocation(this.program, "vTranslation"), [object.x, object.y, 0]);

        return object.positions.length / 2;
    };

    this.keyPressed = (event) => {
        if (this.activeObject.activeKeys.indexOf(event.keyCode) === -1) {
            this.activeObject.activeKeys.push(event.keyCode);
            this.activeObject.keyChanged = true;
        }
    };

    this.keyReleased = (event) => {
        this.activeObject.activeKeys = this.activeObject.activeKeys.filter(keyCode => keyCode !== event.keyCode);
        this.activeObject.keyChanged = true;
    };

    // 1. Get canvas and setup WebGL context
    this.canvas = document.getElementById("gl-canvas");
    this.gl = this.canvas.getContext('webgl');
    this.program = null;
    this.objects = [];
    this.activeObject = null;
}

function GlObject(x, y) {

    this.construct = () => {
        canvas.add(this);
    };

    /**
     * abstract method
     */
    this.update = () => { };

    /**
     * abstract method
     */
    this.handleEvent = () => { };

    this.translate = (tx, ty) => {
        this.x += tx;
        this.y += ty;
        return this;
    };

    this.rotate = (degree) => {
        this.updateOrientation(radiansToDegree(this.orientation) + degree);
        return this;
    };

    this.updateOrientation = (degree) => {
        this.orientation = degreeToRadians(degree);
    };

    /**
     * Ist ein Objekt noch im Canvas?
     */
    this.inCanvas = (x, y) => {
        return x + this.radius <= 1 && y + this.radius <= 1 && x - this.radius > -1 && y - this.radius > -1;
    };

    this.distance = (x, y) => {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    };

    this.x = 0;
    this.y = 0;
    this.translate(x, y);
    this.orientation = 0;
    this.positions = [];
    this.colors = [];
    this.glMode = canvas.gl.TRIANGLE_FAN;
    this.activeKeys = [];
    this.keyChanged = false;
}

let canvas = new GlCanvas();

function init() {

    document.addEventListener('keydown', canvas.keyPressed);
    document.addEventListener('keyup', canvas.keyReleased);
}

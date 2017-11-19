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
        new Coin(-0.8, 0.4);
        new Coin(-0.8, 0.2);
        new Coin(-0.8, 0.0);
        new Coin(-0.8, -0.2);
        new Coin(-0.8, -0.4);

        new Coin(-0.1, 0.4);
        new Coin(-0.3, 0.4);
        new Coin(-0.5, 0.2);
        new Coin(-0.5, 0.0);
        new Coin(-0.5, -0.2);
        new Coin(-0.3, -0.4);
        new Coin(-0.3, -0.4);
        new Coin(-0.1, -0.4);

        new Coin(0.4, 0.4);
        new Coin(0.6, 0.4);
        new Coin(0.2, 0.2);
        new Coin(0.2, 0.0);
        new Coin(0.2, -0.2);
        new Coin(0.4, -0.4);
        new Coin(0.6, -0.4);
        new Coin(0.8, -0.2);
        new Coin(0.8, 0.0);
        new Coin(0.6, 0.0);

        new Orange(0,0);
        new Red(0,0);
        new Pink(0,0);

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

function Pacman(x, y) {

    GlObject.call(this, x, y);

    this.update = () => {
        let tx = this.speed * Math.cos(this.orientation);
        let ty = this.speed * Math.sin(this.orientation);

        if (this.inCanvas(this.x + tx, this.y + ty)) {
            if (!this.mouthClosing) {
                this.mouthAngle += 10;
                if (this.mouthAngle > this.maxMouthAngle) {
                    this.mouthClosing = true;
                }
            } else {
                this.mouthAngle -= 10;
                if (this.mouthAngle <= 0) {
                    this.mouthClosing = false;
                }
            }

            this.translate(tx, ty).scale(this.radius, this.vertices, this.mouthAngle);
        }
    };

    this.handleEvent = () => {
        let secondKey = this.activeKeys[this.activeKeys.length-2];
        switch (this.activeKeys[this.activeKeys.length-1]) {
            case KEYCODE_RIGHT:
                if (secondKey === KEYCODE_UP) this.updateOrientation(45);
                else if (secondKey === KEYCODE_DOWN) this.updateOrientation(315);
                else this.updateOrientation(0);
                break;
            case KEYCODE_UP:
                if (secondKey === KEYCODE_RIGHT) this.updateOrientation(45);
                else if (secondKey === KEYCODE_LEFT) this.updateOrientation(135);
                else this.updateOrientation(90);
                break;
            case KEYCODE_LEFT:
                if (secondKey === KEYCODE_UP) this.updateOrientation(135);
                else if (secondKey === KEYCODE_DOWN) this.updateOrientation(225);
                else this.updateOrientation(180);
                break;
            case KEYCODE_DOWN:
                if (secondKey === KEYCODE_RIGHT) this.updateOrientation(315);
                else if (secondKey === KEYCODE_LEFT) this.updateOrientation(225);
                else this.updateOrientation(270);
                break;
        }
    };

    this.scale = (radius, vertices, mouthAngle) => {
        // Erste Koordinaten für das Dreieck
        this.positions = [0, 0];
        this.colors = [1, 1, 0, 1];

        this.radius = radius;
        this.vertices = vertices;
        this.mouthAngle = mouthAngle;

        let angle = Math.max(0, 360 - mouthAngle);
        let mouth = degreeToRadians(mouthAngle/2);
        let twoPI = 2*Math.PI;

        // Calculate Pac-Man shape
        for (let i=0; i<vertices; i++) {
            let phi = (degreeToRadians(angle * i / (vertices-1)) + mouth) % twoPI;

            // Zweite Koordinaten für das Dreieck
            this.positions.push(radius * Math.cos(phi), radius * Math.sin(phi));
            this.colors.push(1, 1, 0, 1);
        }
        return this;
    };

    this.mouthAngle = 0;
    this.radius = 0;
    this.vertices = 0;
    this.maxMouthAngle = 90;
    this.mouthClosing = true;
    this.speed = 0.04;
    this.construct();
}

function Coin(x, y) {

    GlObject.call(this, x, y);

    this.update = () => {
        if (pacman.distance(this.x + this.size / 2, this.y + this.size / 2) < pacman.radius) {
            score.add(100);
            canvas.remove(this);
        }
    };

    this.scale = (size) => {
        this.size = size;
        this.positions = [0, 0, size, 0, size, size, 0, size];
        this.colors = [];
        for (let i=0; i<this.positions.length/2; i++) this.colors.push(this.r, this.g, this.b, 1);
    };

    this.size = 0.1;
    this.r = 0.97;
    this.g = 0.69;
    this.b = 0.56;
    this.colors = [];
    this.positions = [];

    this.scale(this.size);
    this.construct();
}

function Enemy(x, y) {

    GlObject.call(this, x, y);

    this.scale = (size) => {
        this.size = size;
        // Body
        this.colors = [];
        this.positions = [
            -size/2, 0, -size/2, -size/2, size/2, -size/2,
            size/2, -size/2, size/2, 0, -size/2, 0
        ];
        for (let i=0; i<this.positions.length/2; i++) this.colors.push(this.r, this.g, this.b, 1);

        // Head
        for (let i=0; i<25; i++) {
            let phi = degreeToRadians(180 * i / 25);
            let phi2 = degreeToRadians(180 * (i+1) / 25);

            this.positions.push(
                0,0,
                size / 2 * Math.cos(phi), size / 2 * Math.sin(phi),
                size / 2 * Math.cos(phi2), size / 2 * Math.sin(phi2));
            this.colors.push(this.r, this.g, this.b, 1, this.r, this.g, this.b, 1, this.r, this.g, this.b, 1);
        }

        // Eye left
        for (let i=0; i<=25; i++) {
            let phi = degreeToRadians(360 * i / 25);
            let phi2 = degreeToRadians(360 * (i+1) / 25);

            this.positions.push(
                -size/6, 0,
                -size/6 + size/8 * Math.cos(phi), size/8 * Math.sin(phi),
                -size/6 + size/8 * Math.cos(phi2), size/8 * Math.sin(phi2));
            this.colors.push(1,1,1,1,1,1,1,1,1,1,1,1);
        }

        // Eye right
        for (let i=0; i<=25; i++) {
            let phi = degreeToRadians(360 * i / 25);
            let phi2 = degreeToRadians(360 * (i+1) / 25);

            this.positions.push(
                size/6, 0,
                size/6 + size/8 * Math.cos(phi), size/8 * Math.sin(phi),
                size/6 + size/8 * Math.cos(phi2), size/8 * Math.sin(phi2));
            this.colors.push(1,1,1,1,1,1,1,1,1,1,1,1);
        }
    };

    this.move = () => {
        let vx = Math.min(Math.abs(this.dx-this.x), this.speed);
        let vy = Math.min(Math.abs(this.dy-this.y), this.speed);
        this.translate(this.dx > this.x ? vx : -vx, this.dy > this.y ? vy : -vy);
    };

    /**
     * abstract method
     */
    this.guessDestination = () => { };

    this.dx = 0;
    this.dy = 0;
    this.size = 0.2;
    this.glMode = canvas.gl.TRIANGLES;
    this.speed = 0.005;
    this.guessDestination();
    this.construct();
}

function Orange(x, y) {
    Enemy.call(this, x, y);

    this.update = () => {
        if (this.distance(this.dx, this.dy) > this.size) {
            this.move();
        } else {
            this.guessDestination();
        }
    };

    this.guessDestination = () => {
        this.dx = 1 - Math.random() * 2;
        this.dy = 1 - Math.random() * 2;
    };

    this.r = 1;
    this.g = 0.64;
    this.b = 0;
    this.scale(this.size);
}

function Red(x, y) {
    Enemy.call(this, x, y);

    this.update = () => {
        this.guessDestination();
        if (this.distance(this.dx, this.dy) > this.size) {
            this.move();
        }
    };

    this.guessDestination = () => {
        this.dx = pacman.x;
        this.dy = pacman.y;
    };

    this.r = 1;
    this.g = 0;
    this.b = 0;
    this.scale(this.size);
}

function Pink(x, y) {
    Enemy.call(this, x, y);

    this.update = () => {
        if (this.distance(this.dx, this.dy) > this.size) {
            this.move();
        } else {
            this.guessDestination();
        }
    };

    this.guessDestination = () => {
        this.dx = pacman.x;
        this.dy = pacman.y;
    };

    this.r = 1;
    this.g = 0.75;
    this.b = 0.8;
    this.scale(this.size);
}

function Score() {

    this.add = (value) => {
        this.value += value;
        this.update();
    };

    this.update = () => {
        this.element.innerHTML = this.value;
    };

    this.element = document.getElementById('score');
    this.value = 0;
}

let canvas = new GlCanvas();
let pacman = new Pacman(0,-0.8).scale(0.15, 50, 90).translate(0.2,0).rotate(180);
let score = new Score();

function init() {
    canvas.activeObject = pacman;
    canvas.initialize();

    document.addEventListener('keydown', canvas.keyPressed);
    document.addEventListener('keyup', canvas.keyReleased);
}

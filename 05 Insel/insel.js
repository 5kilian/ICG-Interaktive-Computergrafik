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
        // 2. Configure viewport
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.95, 0.95, 0.95, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);

        // 4. Init shader program via additional function and bind it
        this.program = initShader(this.gl, "vertex-shader", "fragment-shader");
        this.gl.useProgram(this.program);

        requestAnimationFrame(this.tick);
    };

    this.initialize = () => {
        this.activeCamera = new Camera(0, 0, 0);
        this.activeObject = this.activeCamera;

        new Surface(0, -0.50005, 0);
        new Palm(0, -0.2, 4);

        new Cube(0, 0, -2).scale(0.5);
        new Cube(1, 0, 2).scale(0.5);
        new Cube(2, 0, 4).scale(0.5);
        new Cube(-2, 0, 4).scale(0.5);
        new Cube(-1, 0, 2).scale(0.5);
        new Cube(0, 0, 8).scale(0.5);

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
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.objects.forEach(object => this.gl.drawArrays(object.glMode, 0, this.drawObject(object)));
    };

    this.drawObject = (object) => {
        // 5. Create VBO
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());

        // 6. Fill VBO with positions and colors
        this.gl.bufferData(this.gl.ARRAY_BUFFER, f32a(object.positions.concat(object.colors)), this.gl.STATIC_DRAW);

        // 7. Link data in VBO to shader variables
        // 7.1 Save attribute location to address them
        let vPosition = this.getAttribute('vPosition');
        this.gl.enableVertexAttribArray(vPosition);
        this.gl.vertexAttribPointer(vPosition, 3, this.gl.FLOAT, false, 0, 0);

        // 7.2 Save attribute location to address them
        let vColor = this.getAttribute('vColor');
        this.gl.enableVertexAttribArray(vColor);
        this.gl.vertexAttribPointer(vColor, 4, this.gl.FLOAT, false, 0, object.positions.length * 4);

        // Rotationsmatrix
        this.gl.uniformMatrix4fv(this.getUniform('mRotationX'), false, mRotationX(object.orientation.x));
        this.gl.uniformMatrix4fv(this.getUniform('mRotationY'), false, mRotationY(object.orientation.y));
        this.gl.uniformMatrix4fv(this.getUniform('mRotationZ'), false, mRotationZ(object.orientation.z));

        // 7.3 Save uniform location and save the model matrix into it
        // Transformationsmatrix
        this.gl.uniformMatrix4fv(this.getUniform('mTranslation'), false, translate(object.x, object.y, object.z));

        // 7.4 Save uniform location and save the view matrix into it
        this.gl.uniformMatrix4fv(this.getUniform('mView'), false, this.activeCamera.getView());

        // 7.5 Save uniform location and save the projection matrix into it
        this.gl.uniformMatrix4fv(this.getUniform('mProjection'), false, perspective(Math.PI/4, 0.5, 100));

        return object.positions.length / 3;
    };

    this.getAttribute = (attribute) => this.gl.getAttribLocation(this.program, attribute);

    this.getUniform = (uniform) => this.gl.getUniformLocation(this.program, uniform);

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
    this.canvas = document.getElementById('gl-canvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.gl = this.canvas.getContext('webgl');
    this.program = null;
    this.objects = [];
    this.activeObject = null;
    this.activeCamera = null;
}

function GlObject(x, y, z) {

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

    /**
     * abstract method
     */
    this.handleMouseMove = (event) => { };

    /**
     * abstract method
     */
    this.scale = (size) => { };

    this.translate = (tx, ty, tz) => {
        this.x += tx;
        this.y += ty;
        this.z += tz;
        return this;
    };

    this.rotate = (axis, degree) => {
        switch (axis) {
            case X: this.updateOrientation(X, radiansToDegree(this.orientation.x) + degree); break;
            case Y: this.updateOrientation(Y, radiansToDegree(this.orientation.y) + degree); break;
            case Z: this.updateOrientation(Z, radiansToDegree(this.orientation.z) + degree); break;
        }
        return this;
    };

    this.updateOrientation = (axis, degree) => {
        switch (axis) {
            case X: this.orientation.x = degreeToRadians(degree); break;
            case Y: this.orientation.y = degreeToRadians(degree); break;
            case Z: this.orientation.z = degreeToRadians(degree); break;
        }
    };

    this.distance = (x, y, z) => {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) + Math.pow(z - this.z, 2));
    };

    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.translate(x, y, z);
    this.orientation = { x: 0, y: 0, z: 0 };
    this.positions = [];
    this.colors = [];
    this.glMode = canvas.gl.TRIANGLES;
    this.activeKeys = [];
    this.keyChanged = false;
}

function Camera(x, y, z) {

    GlObject.call(this, x, y, z);

    this.update = () => {
        this.translate(this.tx, this.ty, this.tz);
    };

    this.getView = () => {
        let position = vec3.fromValues(this.x, this.y, this.z);
        // Rotate around Y axis
        this.target = rotateY(EYE, this.orientation.x);
        // Rotation matrix from axis and angle
        this.target = rotateAround(vec3.cross(vec3.create(), this.target, UP), this.target, this.orientation.y);
        // Set view matrix
        return mat4.lookAt(mat4.create(), position, vec3.add(vec3.create(), position, this.target), UP);
    };

    this.handleEvent = () => {
        let strafeDirection;
        this.tx = this.ty = this.tz = 0;
        let secondKey = this.activeKeys[this.activeKeys.length-2];
        switch (this.activeKeys[this.activeKeys.length-1]) {
            case D:
            case KEYCODE_RIGHT:

                strafeDirection = vec3.cross(vec3.create(), this.target, UP);
                this.tx = this.speed * strafeDirection[0];
                this.tz = this.speed * strafeDirection[2];
                break;
            case W:
            case KEYCODE_UP:
                this.tx = this.speed * this.target[0];
                this.tz = this.speed * this.target[2];
                break;
            case A:
            case KEYCODE_LEFT:
                strafeDirection = vec3.cross(vec3.create(), this.target, UP);
                this.tx = -this.speed * strafeDirection[0];
                this.tz = -this.speed * strafeDirection[2];
                break;
            case S:
            case KEYCODE_DOWN:
                this.tx = -this.speed * this.target[0];
                this.tz = -this.speed * this.target[2];
                break;
            case Q:
                this.ty = -this.speed * UP[1];
                break;
            case E:
                this.ty = this.speed * UP[1];
                break;
        }
    };

    this.handleMouseMove = (event) => {
        this.rotate(X, event.movementX * this.rotationSpeed);
        this.rotate(Y, event.movementY * this.rotationSpeed);
        this.handleEvent();
    };

    this.target = EYE;
    this.speed = 0.02;
    this.rotationSpeed = -0.25;
    this.tx = 0;
    this.ty = 0;
    this.tz = 0;
    this.mouseInitialized = false;
    this.clientX = 0;
    this.clientY = 0;
    this.construct();
}

function Cube(x, y, z) {

    GlObject.call(this, x, y, z);

    Cube.prototype.scale = this.scale;

    this.scale = (size) => {
        this.positions = [
            // Front
            -size, -size,  size, size, -size,  size, size,  size,  size,
            size,  size,  size, -size,  size,  size, -size, -size,  size,
            // Right
            size,  size,  size, size, -size,  size, size, -size, -size,
            size, -size, -size, size,  size, -size, size,  size,  size,
            // Back
            -size, -size, -size, size, -size, -size, size,  size, -size,
            size,  size, -size, -size,  size, -size, -size, -size, -size,
            // Left
            -size,  size,  size, -size, -size,  size, -size, -size, -size,
            -size, -size, -size, -size,  size, -size, -size,  size,  size,
            // Bottom
            -size, -size,  size, size, -size,  size, size, -size, -size,
            size, -size, -size, -size, -size, -size, -size, -size,  size,
            // Top
            -size,  size,  size, size,  size,  size, size,  size, -size,
            size,  size, -size, -size,  size, -size, -size,  size,  size
        ];

        this.colors = [
            // Front
            0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1,
            // Right
            0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
            // Back
            1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
            // Left
            1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1,
            // Bottom
            1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1,
            // Top
            0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1
        ];
    };

    this.construct();
}

function Surface(x, y, z) {

    GlObject.call(this, x, y, z);

    this.scale = (size) => {
        this.positions = [
            0, 0, 0,
            -size, 0, -size,
            size, 0, -size,
            size, 0, size,
            -size, 0, size,
            -size, 0, -size,
        ];
        this.colors = [];
        for (let i=0; i<this.positions.length/3; i++) this.colors.push(1, 1, 0, 1);
    };

    this.scale(5);
    this.glMode = canvas.gl.TRIANGLE_FAN;
    this.construct();
}

function Palm(x, y, z) {

    GlObject.call(this, x, y, z);

    // Inner class
    function PalmPart(x, y, z) {

        GlObject.call(this, x, y, z);

        this.scale = (size, factor) => {
            this.positions = [
                // Front
                -size, -size, size, size, -size,  size, size * factor,  size,  size * factor,
                size * factor, size, size * factor, -size * factor,  size,  size * factor, -size, -size,  size,
                // Right
                size * factor, size,  size * factor,
                size, -size,  size,
                size, -size, -size,
                size * factor,  size, -size * factor,
                size * factor,  size,  size * factor,
                size, -size, -size,
                // Back
                -size, -size, -size, size, -size, -size, size * factor,  size, -size * factor,
                size * factor, size, -size * factor, -size * factor,  size, -size * factor, -size, -size, -size,
                // Left
                -size * factor, size, size * factor, -size, -size,  size, -size, -size, -size,
                -size * factor,  size, -size * factor, -size * factor, size, size * factor, -size, -size, -size,
                // Bottom
                -size, -size, size, size, -size,  size, size, -size, -size,
                size, -size, -size, -size, -size, -size, -size, -size,  size,
                // Top
                -size * factor, size, size * factor, size * factor, size,  size * factor, size * factor, size, -size * factor,
                size * factor, size, -size * factor, -size * factor, size, -size * factor, -size * factor, size, size * factor
            ];

            this.colors = [ ];
            // front: [0.54, 0.45, 0.33, 1]
            for (let i=0; i < 6; i++) this.colors.push(0.54, 0.45, 0.33, 1)
            // right: [0.57, 0.42, 0.33, 1]
            for (let i=0; i < 6; i++) this.colors.push(0.57, 0.42, 0.33, 1)
            // back: [0.52, 0.47, 0.33, 1]
            for (let i=0; i < 6; i++) this.colors.push(0.52, 0.47, 0.33, 1)
            // left: [0.53, 0.49, 0.33, 1]
            for (let i=0; i < 6; i++) this.colors.push(0.53, 0.49, 0.33, 1)
            // bottom: [0.58, 0.45, 0.33, 1]
            for (let i=0; i < 6; i++) this.colors.push(0.58, 0.45, 0.33, 1)
            // top: [0.54, 0.43, 0.33, 1]
            for (let i=0; i < 6; i++) this.colors.push(0.54, 0.43, 0.33, 1)
        };

        this.lengthY = 0.1;
        this.construct();
    }

    this.scale = (size) => {
        let height = this.y;
        for (let i=0; i<5; i++) {
            let palmPart = new PalmPart(this.x, height, this.z);
            palmPart.scale(0.1, 1.5);
            palmPart.translate(0, height, 0);
            height += palmPart.lengthY;
            this.objects.push(palmPart);
        }
    };

    this.translate = (tx, ty, tz) => {
        this.objects.forEach(object => object.translate(tx, ty, tz));
        return this
    };

    this.rotate = (axis, degree) => {
        this.objects.forEach(object => object.rotate(axis, degree));
        return this
    };

    this.objects = [];
    this.scale(1);
    this.construct();
}

let canvas = new GlCanvas();

function requestPointerLock() {
    canvas.canvas.requestPointerLock = canvas.canvas.requestPointerLock
        || canvas.canvas.mozRequestPointerLock
        || canvas.canvas.webkitRequestPointerLock;
    canvas.canvas.requestPointerLock();

    document.exitPointerLock = document.exitPointerLock
        || document.mozExitPointerLock
        || document.webkitExitPointerLock;
    document.exitPointerLock();
}

function changeCallback() {
    switch (canvas.canvas) {
        case document.pointerLockElement:
        case document.mozPointerLockElement:
        case document.webkitPointerLockElement:
            document.addEventListener('mousemove', canvas.activeObject.handleMouseMove);
            break;
        default:
            document.removeEventListener('mousemove', canvas.activeObject.handleMouseMove);
    }
}

function init() {
    canvas.initialize();

    document.addEventListener('click', requestPointerLock);
    document.addEventListener('pointerlockchange', changeCallback, false);
    document.addEventListener('mozpointerlockchange', changeCallback, false);
    document.addEventListener('webkitpointerlockchange', changeCallback, false);

    document.addEventListener('keydown', canvas.keyPressed);
    document.addEventListener('keyup', canvas.keyReleased);
}

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
        this.activeCamera = worldCam;
        this.activeObject = playCam;

        // this.terrain = new Surface(0, -0.50005, 0);
        // this.water = new Water(0, 0, 0);
        this.palm = new Palm(0, -0.2, 0);

        new Cube(0, 0, -2).scale(0.5);
        new Cube(1, 0, 2).scale(0.5);
        new Cube(2, 0, 4).scale(0.5);
        new Cube(-2, 0, 4).scale(0.5);
        new Cube(-1, 0, 2).scale(0.5);

        new Cube(0, 0, 6).scale(0.5);

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
        object.rotationOrder.forEach((order, index) => {
            let mRotation;
            switch (order) {
                case X: mRotation = mRotationX(object.orientation.x); break;
                case Y: mRotation = mRotationY(object.orientation.y); break;
                case Z: mRotation = mRotationZ(object.orientation.z); break;
            }

            this.gl.uniformMatrix4fv(this.getUniform('mRotation' + index), false, mRotation);
        });


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
    this.terrain = null;
    this.water = null;
    this.palm = null;
}

function GlObject(x, y, z) {

    this.construct = this._construct = () => {
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

    this.setPosition = (x, y, z) => {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };

    this.translate = this._translate = (tx, ty, tz) => {
        return this.setPosition(this.x + tx, this.y + ty, this.z + tz);
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
    this.rotationOrder = [X, Y, Z];
}

function Camera(x, y, z) {

    GlObject.call(this, x, y, z);

    this.update = () => {
        if (this.jumping ) {
            this.ty = 0.04;
        }
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
            case KEYCODE_D:
            case KEYCODE_RIGHT:
                strafeDirection = vec3.cross(vec3.create(), this.target, UP);
                this.tx = this.speed * strafeDirection[0];
                this.tz = this.speed * strafeDirection[2];
                break;
            case KEYCODE_W:
            case KEYCODE_UP:
                this.tx = this.speed * this.target[0];
                this.tz = this.speed * this.target[2];
                break;
            case KEYCODE_A:
            case KEYCODE_LEFT:
                strafeDirection = vec3.cross(vec3.create(), this.target, UP);
                this.tx = -this.speed * strafeDirection[0];
                this.tz = -this.speed * strafeDirection[2];
                break;
            case KEYCODE_S:
            case KEYCODE_DOWN:
                this.tx = -this.speed * this.target[0];
                this.tz = -this.speed * this.target[2];
                break;
            case KEYCODE_Q:
                this.ty = -this.speed * UP[1];
                break;
            case KEYCODE_E:
                this.ty = this.speed * UP[1];
                break;
            case KEYCODE_SPACE:
                if (!this.jumping) this.jumping = true;
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
    this.jumping = false;
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

function Water(x, y, z) {

    GlObject.call(this, x, y, z);

    this.scale = (width, height) => {
        this.width = width;
        this.height = height;
        this.positions = [];
        for (let i=0; i<this.segments; i++) {
            for (let j=0; j<this.segments; j++) {
                let iws = i*width/this.segments, jhs = j*height/this.segments;
                let iiws = (i+1)*width/this.segments, jjhs = (j+1)*height/this.segments;
                this.positions.push(
                    iws, 0, jhs,
                    iws, 0, jjhs,
                    iiws, 0, jjhs,
                    iws, 0, jhs,
                    iiws, 0, jjhs,
                    iiws, 0, jhs
                );
            }
        }

        this.colors = [];
        for (let i=0; i<this.positions.length/3; i++) this.colors.push(0, 0, 0.9, 1);

        return this;
    };

    this.segments = 1;
    this.scale(10, 10);
    this.translate(-this.width/2, 0, -this.height/2);
    this.construct();
}

function Surface(x, y, z) {

    GlObject.call(this, x, y, z);

    this.construct = () => {
        this._construct();
        this.initTerrain(5, 0.3).scale(10, 10, 0);
    };

    this.initTerrain = (detail, smoothness) => {
        this.segments = Math.pow(2, detail) + 1;
        this.terrain = [];
        for (let i=0; i<=this.segments; i++) {
            this.terrain[i] = [];
            for (let j=0; j<=this.segments; j++) {
                this.terrain[i][j] = 0;
            }
        }
        divide(this.segments-1, smoothness);
        return this;
    };

    let divide = (size, smoothness) => {
        if (size < 2) return this;
        let half = size/2;

        for (let x=half; x<this.segments-1; x+=size) {
            for (let y=half; y<this.segments-1; y+=size) {
                this.terrain[x][y] = square(x, y, half) + Math.random() * 2 * smoothness - smoothness;
            }
        }

        for (let x=0; x<this.segments-1; x+=half) {
            for (let y=(x+half) % size; y<this.segments-1; y+=size) {
                this.terrain[x][y] = diamond(x, y, half) + Math.random() * 2 * smoothness - smoothness;
            }
        }

        divide(half, smoothness/2);
    };

    let square = (x, y, size) => average([
        this.terrain[x-size][y-size],
        this.terrain[x+size][y-size],
        this.terrain[x+size][y+size],
        this.terrain[x-size][y+size]
    ]);

    let diamond = (x, y, size) => average([
        this.terrain[x][(y+size) % (2*size)],
        this.terrain[(x+size) % (2*size)][y],
        this.terrain[x][(y+size) % (2*size)],
        this.terrain[(x+size) % (2*size)][y]
    ]);

    let average = (arr) => arr.reduce((sum, value) => sum + value, 0) / arr.length;

    this.zTerrain = (index) => {
        let terrain = [];

        for (let i=0; i<=this.segments+1; i++) {
            terrain[i] = [];
            for (let j=0; j<=this.segments+1; j++) {
                terrain[i][j] = 0;
            }
        }

        for (let i=0; index > 0 && i<Math.floor(this.segments/2); i++) {
            let c = Math.ceil(index) / 10;
            for (let j=0; j<=i*2-1; j++) {
                terrain[Math.ceil(this.segments/2) - i][Math.ceil(this.segments/2) - i + j] += c;
                if (j>0) terrain[Math.ceil(this.segments/2) - i + j][Math.ceil(this.segments/2) - i] += c;
                if (i>0) terrain[Math.ceil(this.segments/2) + i - j][Math.ceil(this.segments/2) + i] += c;
                if (j>0) terrain[Math.ceil(this.segments/2) + i][Math.ceil(this.segments/2) + i - j] += c;
            }
            terrain[Math.ceil(this.segments/2) - i][Math.ceil(this.segments/2) + i] += c;
            if (i>0) terrain[Math.ceil(this.segments/2) + i][Math.ceil(this.segments/2) - i] += c;
            index -= 0.5;
        }

        return terrain;
    };

    this.scale = (width, height, z) => {
        this.width = width;
        this.height = height;
        this.zIndex = z;
        let zTerrain = this.zTerrain(z);
        this.positions = [];
        for (let i=0; i<this.segments; i++) {
            for (let j=0; j<this.segments; j++) {
                let iws = i*width/this.segments, jhs = j*height/this.segments;
                let iiws = (i+1)*width/this.segments, jjhs = (j+1)*height/this.segments;
                this.positions.push(
                    iws, zTerrain[i][j] + this.terrain[i][j], jhs,
                    iws, zTerrain[i][j+1] + this.terrain[i][j+1], jjhs,
                    iiws, zTerrain[i+1][j+1] + this.terrain[i+1][j+1], jjhs,
                    iws, zTerrain[i][j] + this.terrain[i][j], jhs,
                    iiws, zTerrain[i+1][j+1] + this.terrain[i+1][j+1], jjhs,
                    iiws, zTerrain[i+1][j] + this.terrain[i+1][j], jhs);
            }
        }

        this.colors = [];
        for (let i=0; i<this.positions.length/3; i++) {
            if (i%6<3)
            this.colors.push(1, 1, 0, 1);
            else this.colors.push(1, 0.9, 0, 1);
        }

        return this;
    };

    this.width = 0;
    this.height = 0;
    this.zIndex = 0;
    this.terrain = [];
    this.segments = 0;
    this.construct();
    this.translate(-this.width/2, 0, -this.height/2);
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
                size * factor, size,  size * factor, size, -size,  size, size, -size, -size,
                size * factor,  size, -size * factor, size * factor,  size,  size * factor, size, -size, -size,
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

        for (let i=0; i<4; i++) {
            let palmLeaf = new PalmBigLeaf(this.x, height, this.z);
            palmLeaf.translate(0, -0.7,0);
            let rotation = 20;
            palmLeaf.rotate(Y,i*90);
            switch (i) {
                case 0: palmLeaf.rotate(X,rotation); break;
                case 1: palmLeaf.rotate(Z,-rotation); break;
                case 2: palmLeaf.rotate(X,-rotation); break;
                case 3: palmLeaf.rotate(Z,rotation); break;
            }
            palmLeaf.translate(0,0.3,0);
            this.objects.push(palmLeaf);
        }
        return this;
    };

    this.translate = (tx, ty, tz) => {
        this.objects.forEach(object => object.translate(tx, ty, tz));
        return this._translate(tx, ty, tz);
    };

    this.rotate = (axis, degree) => {
        this.objects.forEach(object => object.rotate(axis, degree));
        return this
    };

    this.objects = [];
    this.scale(1);
    this.construct();
}


function PalmBigLeaf(x, y, z) {
    
            GlObject.call(this, x, y, z);
    
            this.scale = (size) => {
                this.makeModel();
                this.colors = [];
                for (let i=0; i<this.positions.length/3; i++) this.colors.push(0, 0.4 + Math.random()*0.6, 0, 1);
            };
            
            this.makeModel = () => {
                this.objects = [];

                let factor =1.7;
        
                let abstandZwischenBlättern = 0.02;
                let anzahlBlätter = 30;
                let startRotationZ = 20;
                let scaling = 0.8;
        
                let rotationX = 90;
                let rotationX2 = -30;
                let rotationZ = 90;
                for(let i=0; i<anzahlBlätter; i++){
                    let palmenblatt = new PalmSmallLeaf(0,0,0);
                    palmenblatt.rotate(X,rotationX);
                    palmenblatt.rotate(Z,-startRotationZ);                 
                    palmenblatt.rotate(Z,0 - i*((90-startRotationZ)/anzahlBlätter));
                    palmenblatt.rotate(X,i);

                    palmenblatt.translate(i*abstandZwischenBlättern, 1-Math.pow(i,1.7)*0.001, 0);

                    palmenblatt.scale(scaling);
                    this.positions.push(palmenblatt.positions);
                    this.objects.push(palmenblatt);
        
        

                    let palmenblatt2 = new PalmSmallLeaf(0,0,0);
                    palmenblatt2.rotate(X,rotationX);
                    palmenblatt2.rotate(Z,startRotationZ);    
                    palmenblatt2.rotate(Z, 180 +i*((90-startRotationZ)/anzahlBlätter));
                    palmenblatt.rotate(X,i);

                    palmenblatt2.translate(i*abstandZwischenBlättern, 1-Math.pow(i,1.7)*0.001, 0);

                    palmenblatt2.scale(scaling);
                    this.positions.push(palmenblatt2.positions);
                    this.objects.push(palmenblatt2);
                } 
            };

            this.translate = (tx, ty, tz) => {
                this.objects.forEach(object => object.translate(tx, ty, tz));
                return this._translate(tx, ty, tz);
            };

            this.scale(5);
            this.glMode = canvas.gl.TRIANGLES;
            this.construct();
        }

        


function PalmSmallLeaf(x, y, z) {
    
            GlObject.call(this, x, y, z);
    
            this.scale = (size) => {
                this.positions = [
                    -0.01, 0, 0,
                    0, 0.3, 0,	
                    0.01, 0, 0
                ];
                this.colors = [];
                for (let i=0; i<this.positions.length/3; i++) this.colors.push(0, 0.4 + Math.random()*0.6, 0, 1);
            };
    
            this.scale(5);
            this.glMode = canvas.gl.TRIANGLE_FAN;
            this.construct();
        }




let canvas = new GlCanvas();
let playCam = new Camera(0, 0, 0);
let worldCam = new Camera(6, 5, 6).rotate(X, 45).rotate(Y, -40);

function increaseZIndex(value) {
    let diff = value - canvas.terrain.zIndex;
    console.log(diff);
    canvas.terrain.scale(10, 10, value);

    canvas.palm.translate(0, diff/10, 0);
}

function rpl() {
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
            canvas.activeCamera = playCam;
            document.addEventListener('mousemove', canvas.activeObject.handleMouseMove);
            break;
        default:
            canvas.activeCamera = worldCam;
            document.removeEventListener('mousemove', canvas.activeObject.handleMouseMove);
    }
}

function init() {
    canvas.initialize();

    document.addEventListener('pointerlockchange', changeCallback, false);
    document.addEventListener('mozpointerlockchange', changeCallback, false);
    document.addEventListener('webkitpointerlockchange', changeCallback, false);

    document.addEventListener('keydown', canvas.keyPressed);
    document.addEventListener('keyup', canvas.keyReleased);
}

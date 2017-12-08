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
        this.gl.enable(this.gl.TEXTURE_2D);

        // 4. Init shader program via additional function and bind it
        this.program = initShader(this.gl, "vertex-shader", "fragment-shader");
        this.gl.useProgram(this.program);

        requestAnimationFrame(this.tick);
    };

    this.initialize = () => {
        this.activeCamera = worldCam;
        this.activeObject = playCam;

        this.terrain = new Surface(0, -0.50005, 0);
        this.water = new Water(0, 0, 0);
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
        // 8. Load the texture picture
        if (object.texture !== undefined) {
            let image = new Image(), texture = this.gl.createTexture();
            image.onload = () => { this.handleTexture(image, texture); };
            image.src = object.texture;
        }
    };

    this.handleTexture = (image, texture) => {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, image, true);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(gl.TEXTURE_2D, null);
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
        if (object.texture !== undefined) {
            this.gl.bufferData(this.gl.ARRAY_BUFFER, f32a(object.positions.concat(object.textureCoordinates)), this.gl.STATIC_DRAW);

            // 7.2 Save attribute location to address them
            let vTexture = this.getAttribute('vTexture');
            this.gl.enableVertexAttribArray(vTexture);
            this.gl.vertexAttribPointer(vTexture, 4, this.gl.FLOAT, false, 0, object.positions.length * 4);
        } else {
            this.gl.bufferData(this.gl.ARRAY_BUFFER, f32a(object.positions.concat(object.colors)), this.gl.STATIC_DRAW);

            // 7.2 Save attribute location to address them
            let vColor = this.getAttribute('vColor');
            this.gl.enableVertexAttribArray(vColor);
            this.gl.vertexAttribPointer(vColor, 4, this.gl.FLOAT, false, 0, object.positions.length * 4);
        }

        // 7. Link data in VBO to shader variables
        // 7.1 Save attribute location to address them
        let vPosition = this.getAttribute('vPosition');
        this.gl.enableVertexAttribArray(vPosition);
        this.gl.vertexAttribPointer(vPosition, 3, this.gl.FLOAT, false, 0, 0);

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

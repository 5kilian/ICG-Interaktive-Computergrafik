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
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);

        // 4. Init shader program via additional function and bind it
        this.programNormal = initShader(this.gl, "vertex-shader", "fragment-shader");
        this.programSkybox = initShader(this.gl, "vertex-shader-skybox", "fragment-shader-skybox");
        this.programWater = initShader(this.gl, "vertex-shader-water", "fragment-shader-water");
        this.program = this.programNormal;
        this.gl.useProgram(this.program);

        requestAnimationFrame(this.tick);
    };

    this.initialize = () => {
        this.activeCamera = worldCam;
        this.activeObject = playCam;

        this.setSkybox(new  Skybox(0, 0, 0).scale(9));

        // new Cube(0, 0, 0).scale(1);
        // new Cube(-4, 0, 0).scale(1);
        // new Cube(4, 0, 0).scale(1);
        // new Cube(0, 0, -4).scale(1);
        // new Cube(0, 0, 4).scale(1);

        this.terrain = new Surface(0, -0.50005, 0);
        this.water = new Water(0, 0, 0).scale(20);
        this.palm = new Palm(0, -0.35, 0).scale(6, 0.6);

        //this.licht = new Light(-2, 1, 2).scale(0.1, 0.6).setColorDiffus(1, 1, 1).setColorSpekular(0, 1, 0);
        this.licht2 = new Light(0, 1.5, 0).scale(0.1, 0.6).setColorDiffus(1, 1, 1).setColorSpekular(1, 0, 0);

        this.construct();
    };

    this.add = (object) => {
        this.objects.push(object);
        // 8. Load the texture picture
        if (object.textureSrc !== undefined) object.texture = this.createTexture(object.textureSrc);
        if (object.normalSrc !== undefined) object.normalMap = this.createTexture(object.normalSrc);
    };

    this.createTexture = (src) => {
        let texture = this.gl.createTexture();
        texture.image = new Image();
        texture.image.src = src;
        texture.image.addEventListener('load', () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            texture.loaded = true;
        });
        return texture;
    };

    this.addLight = (light) => {
        this.lightSources.push(light);
    };

    this.setSkybox = (skybox) => {
        this.skybox = skybox;
        this.skybox.texture = this.gl.createTexture();
        this.skybox.texture.images = [];
        this.skybox.texturesSrc.forEach(src => {
            let image = new Image();
            image.src = src;
            this.skybox.texture.images.push(image);
            image.addEventListener('load', () => {
                this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.skybox.texture);
                let targets = [
                    this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                    this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                    this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                ];
                for (let i = 0; i<this.skybox.texture.images.length && i < 6; i++) {
                    this.gl.texImage2D(targets[i], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.skybox.texture.images[i]);
                }
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
                this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
                this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
                this.skybox.texture.loaded = true;
            });
        });
        this.remove(skybox);
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

        
        //this.program = this.programNormal;
        //this.gl.useProgram(this.program);
        this.objects.forEach(object => {
            if(object.constructor.name == "Water"){ //Der Stamm der Palme benutzt einen anderen Shader.
                this.program = this.programWater;
                this.gl.useProgram(this.programWater);
            }
            else{
                this.program = this.programNormal;
                this.gl.useProgram(this.programNormal);
            }
            this.gl.drawArrays(object.glMode, 0, this.drawObject(object));
        });

        if (this.skybox !== null) {
            this.program = this.programSkybox;
            this.gl.useProgram(this.program);
            this.gl.drawArrays(this.skybox.glMode, 0, this.drawObject(this.skybox));
        }
    };
    
    this.timer = new Date().getTime();

    this.drawObject = (object) => {
        


        // 5. Create VBO
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());

        // 6. Fill VBO with positions and texture or colors
        if (object.texture !== undefined && object.texture.loaded) {
            this.gl.bufferData(this.gl.ARRAY_BUFFER, f32a(object.positions.concat(object.normals.concat(object.textureCoordinates))), this.gl.STATIC_DRAW);
            this.bindTexture(object, (object.positions.length + object.normals.length) * 4);
        } else {
            this.gl.bufferData(this.gl.ARRAY_BUFFER, f32a(object.positions.concat(object.normals.concat(object.colors))), this.gl.STATIC_DRAW);
            this.bindColor((object.positions.length + object.normals.length) * 4);
        }

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, object.normalMap);
        this.gl.uniform1i(this.getUniform('uNormalSampler'), 1);

        // 7. Link data in VBO to shader variables
        // 7.1 Save attribute location to address them
        let vPosition = this.getAttribute('vPosition');
        this.gl.enableVertexAttribArray(vPosition);
        this.gl.vertexAttribPointer(vPosition, 3, this.gl.FLOAT, false, 0, 0);

        // 7.2 Save attribute location to address them
        let vNormal = this.getAttribute('vNormal');
        this.gl.enableVertexAttribArray(vNormal);
        this.gl.vertexAttribPointer(vNormal, 3, this.gl.FLOAT, false, 0, object.positions.length * 4);

        // Rotationsmatrix
        // Hier wird die Modelmatrix berechnet, transponiert und invertiert
        let mModel = translate(object.x, object.y, object.z);
        object.rotationOrder.forEach((order, index) => {
            switch (order) {
                case X:
                    mat4.rotate(mModel, mModel, object.orientation.x, [1, 0, 0]);
                    break;
                case Y:
                    mat4.rotate(mModel, mModel, object.orientation.y, [0, 1, 0]);
                    break;
                case Z:
                    mat4.rotate(mModel, mModel, object.orientation.z, [0, 0, 1]);
                    break;
            }
        });

        this.gl.uniform3fv(this.getUniform('vAmbient'), [0.1, 0.1, 0.1]);

        this.gl.uniform1i(this.getUniform('iLightSources'), this.lightSources.length);
        for (let i=0; i<this.lightSources.length; i++) {
            this.gl.uniform3fv(this.getUniform('vLightSources[' + i + ']'), this.lightSources[i].position());
            this.gl.uniform3fv(this.getUniform('rgbDiffus[' + i + ']'), this.lightSources[i].rgbDiffus);
            this.gl.uniform3fv(this.getUniform('rgbSpecular[' + i + ']'), this.lightSources[i].rgbSpekular);
        }

        this.gl.uniformMatrix4fv(this.getUniform('mView'), false, this.activeCamera.getView());
        this.gl.uniform3fv(this.getUniform('vEye'), vec3.add(vec3.create(), this.activeCamera.position(), this.activeCamera.target));

        // 7.4 Save uniform location and save the normal matrix into it
        this.gl.uniformMatrix3fv(this.getUniform('mNormal'), false, mat3.normalFromMat4(mat3.create(), mModel));

        // 7.5 Save uniform location and save the model and view matrix into it
        this.gl.uniformMatrix4fv(this.getUniform('mModel'), false, mModel);

        // 7.6 Save uniform location and save the projection matrix into it
        this.gl.uniformMatrix4fv(this.getUniform('mProjection'), false, perspective(Math.PI / 4, 0.5, 100));
        
        let delta = new Date().getTime() - this.timer + 0.0;
        this.gl.uniform1f(this.getUniform('fTimer'), delta/1000); 
                   
        
        return object.positions.length / 3;
    };

    this.bindTexture = (object, pointer) => {
        // 7.3 Save attribute location to address them
        let vTexture = this.getAttribute('vTexture');
        this.gl.enableVertexAttribArray(vTexture);
        this.gl.vertexAttribPointer(vTexture, 2, this.gl.FLOAT, false, 0, pointer);

        // use texture 0
        this.gl.activeTexture(this.gl.TEXTURE0);
        if (object.type === 'skybox') {
            this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, object.texture);
        } else {
            this.gl.bindTexture(this.gl.TEXTURE_2D, object.texture);
        }
        this.gl.uniform1i(this.getUniform('uSampler'), 0);

        // use texture, disable color attribute
        this.gl.uniform1i(this.getUniform('bUseTexture'), 1);
        this.gl.disableVertexAttribArray(this.getAttribute('vColor'));
    };

    this.bindColor = (pointer) => {
        // 7.3 Save attribute location to address them
        let vColor = this.getAttribute('vColor');
        this.gl.enableVertexAttribArray(vColor);
        this.gl.vertexAttribPointer(vColor, 4, this.gl.FLOAT, false, 0, pointer);

        // use colors, disable texture attribute
        this.gl.uniform1i(this.getUniform('bUseTexture'), 0);
        this.gl.disableVertexAttribArray(this.getAttribute('vTexture'));
    };

    let slider = document.getElementById("lichtX");
    slider.oninput = (value) =>{
        let val = document.getElementById("lichtX").value;
        this.licht2.setPosition(0.1*val,this.licht2.y,this.licht2.z);
    };

    let sliderY = document.getElementById("lichtY");
    sliderY.oninput = (value) =>{
        let val = document.getElementById("lichtY").value;
        this.licht2.setPosition(this.licht2.x, 0.1*val,this.licht2.z);
    };

    let sliderZ = document.getElementById("lichtZ");
    sliderZ.oninput = (value) =>{
        let val = document.getElementById("lichtZ").value;
        this.licht2.setPosition(this.licht2.x,this.licht2.y,0.1*val);
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
    this.programNormal = null;
    this.programSkybox = null;
    this.objects = [];
    this.activeObject = null;
    this.activeCamera = null;
    this.lightSources = [];
    this.skybox = null;

    this.terrain = null;
    this.water = null;
    this.palm = null;
    this.cube = null;
}

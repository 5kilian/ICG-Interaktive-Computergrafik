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
        var fileName = location.href.split("/").slice(-1); 
        debugger;
        if(fileName == "index%20Vertex-Shader.html"){
            this.programPalme = initShader(this.gl, "vertex-shader-Palme", "fragment-shader")
        }
        else{
            this.programPalme = initShader(this.gl, "vertex-shader", "fragment-shader-Palme");
        }
        //debugger;
        this.programNormal = initShader(this.gl, "vertex-shader", "fragment-shader");
        this.program = this.programNormal;
        this.gl.useProgram(this.program);

        requestAnimationFrame(this.tick);
    };

    this.initialize = () => {
        this.activeCamera = worldCam;
        this.activeObject = playCam;

        this.terrain = new Surface(0, -0.50005, 0);
        this.water = new Water(0, 0, 0).scale(10);
        this.palm = new Palm(0, -0.35, 0).scale(6, 0.6);
        //this.palm.rotate(X,90);
        //this.palm.rotate(Z,90);
        //this.cube = new Cube(1, -0.35, 0).scale(1, 0.6);

        this.licht = new Licht(-2,1,2);
        this.licht.scale(0.1, 0.6);
        this.licht.setColorDiffus(1, 0, 0);
        this.licht.setColorSpekular(1, 0, 0);

        this.licht2 = new Licht(3,1,3);
        this.licht2.scale(0.1, 0.6);
        this.licht2.setColorDiffus(1, 1, 1);
        this.licht2.setColorSpekular(0.5,0.5,0.5);

        this.licht3 = new Licht(3,1,-3);
        this.licht3.scale(0.1, 0.6);
        this.licht3.setColorDiffus(0, 0, 1);
        this.licht3.setColorSpekular(0.0,0.0,0.5);

        this.lichtquellen.push(this.licht);
        this.lichtquellen.push(this.licht2);
        this.lichtquellen.push(this.licht3);



        // new Cube(0, 0, -2).scale(0.5);
        // new Cube(1, 0, 2).scale(0.5);
        // new Cube(2, 0, 4).scale(0.5);
        // new Cube(-2, 0, 4).scale(0.5);
        // new Cube(-1, 0, 2).scale(0.5);

        this.construct();
    };

    this.add = (object) => {
        this.objects.push(object);
        // 8. Load the texture picture
        if (object.textureSrc.length > 0) {
            object.texture = this.gl.createTexture();
            object.texture.image = new Image();
            object.texture.image.src = object.textureSrc;
            object.texture.image.addEventListener('load', () => {
                this.gl.bindTexture(this.gl.TEXTURE_2D, object.texture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, object.texture.image);
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
                object.texture.loaded = true;
            });
        }
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
       
        if(object.constructor.name == "PalmPart"){ //Der Stamm der Palme benutzt einen anderen Shader.
            this.program = this.programPalme;
            this.gl.useProgram(this.programPalme);
        }
        else{
            this.program = this.programNormal;
            this.gl.useProgram(this.programNormal);
        }

        // 5. Create VBO
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
        let normals = object.calculateNormals(object.positions);

        // 6. Fill VBO with positions and texture or colors
        if (object.texture !== undefined && object.texture.loaded) {
            this.gl.bufferData(this.gl.ARRAY_BUFFER, f32a(object.positions.concat(normals).concat(object.textureCoordinates)), this.gl.STATIC_DRAW);

            // 7.2 Save attribute location to address them
            let vTexture = this.getAttribute('vTexture');
            this.gl.enableVertexAttribArray(vTexture);
            this.gl.vertexAttribPointer(vTexture, 2, this.gl.FLOAT, false, 0, object.positions.length * 4 + normals.length * 4);

            // use texture 0
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, object.texture);
            this.gl.uniform1i(this.getUniform('uSampler'), 0);

            // use texture, disable color attribute
            this.gl.uniform1i(this.getUniform('bUseTexture'), 1);
            this.gl.disableVertexAttribArray(this.getAttribute('vColor'));


            let vNormal = this.gl.getAttribLocation(this.program, "vNormal");
            //var normalLocation = this.gl.getAttribLocation(this.program, "vNormal");
            //console.log("vNormals= " + vNormal); 
            this.gl.enableVertexAttribArray(vNormal);
            this.gl.vertexAttribPointer(vNormal, 3, this.gl.FLOAT, false, 0, object.positions.length * 4);
        } else {
            this.gl.bufferData(this.gl.ARRAY_BUFFER, f32a(object.positions.concat(normals).concat(object.colors)), this.gl.STATIC_DRAW);

            // 7.2 Save attribute location to address them
            let vColor = this.getAttribute('vColor');
            this.gl.enableVertexAttribArray(vColor);
            this.gl.vertexAttribPointer(vColor, 4, this.gl.FLOAT, false, 0, object.positions.length * 4 + normals.length * 4);

            // use colors, disable texture attribute
            this.gl.uniform1i(this.getUniform('bUseTexture'), 0);
            this.gl.disableVertexAttribArray(this.getAttribute('vTexture'));

            let vNormal = this.gl.getAttribLocation(this.program, "vNormal");
            //var normalLocation = this.gl.getAttribLocation(this.program, "vNormal");
            //console.log("vNormals= " + vNormal); 
            this.gl.enableVertexAttribArray(vNormal);
            this.gl.vertexAttribPointer(vNormal, 3, this.gl.FLOAT, false, 0, object.positions.length*4);
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


        //Hier wird die Modelmatrix berechnet, transponiert und invertiert
        let mvMatrix = mat4.create();      
        mat4.fromTranslation(mvMatrix, [object.x, object.y, object.z]); 
       
        object.rotationOrder.forEach((order, index) => {
            let angle;
            let axis;
            switch (order) {
                case X: mat4.rotate(mvMatrix,mvMatrix,object.orientation.x, [1,0,0]); break;//mat4.multiply(mvMatrix, mat4.fromXRotation(mat4.create(), object.orientation.x), mvMatrix); break;
                case Y: mat4.rotate(mvMatrix,mvMatrix,object.orientation.y, [0,1,0]);break;//mat4.multiply(mvMatrix, mat4.fromYRotation(mat4.create(), object.orientation.y), mvMatrix); break;
                case Z: mat4.rotate(mvMatrix,mvMatrix,object.orientation.z, [0,0,1]);break;//mat4.multiply(mvMatrix, mat4.fromZRotation(mat4.create(), object.orientation.z), mvMatrix); break;
            }
        });
        
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "modelMatrix"), false, mvMatrix);
       // mat4.transpose(mvMatrix, mvMatrix);
       // mat4.invert(mvMatrix, mvMatrix);
        let normalMatrix = [];
        mat3.normalFromMat4(normalMatrix, mvMatrix);
        var uNormalMatrix = this.gl.getUniformLocation(this.program, "uNormalMatrix");
        this.gl.uniformMatrix3fv(uNormalMatrix, false, normalMatrix);







        //Test für Licht
        this.gl.uniform3fv(this.getUniform('licht'), [this.licht.x, this.licht.y, this.licht.z]);

        for(let i=0; i<this.lichtquellen.length; i++){      
            this.gl.uniform3fv(this.getUniform('lichtPos[' + i + ']'), [this.lichtquellen[i].x, this.lichtquellen[i].y, this.lichtquellen[i].z]);  
            this.gl.uniform3fv(this.getUniform('lichtIntensitaetDiffus[' + i + ']'), this.lichtquellen[i].rgbDiffus);
            this.gl.uniform3fv(this.getUniform('lichtIntensitaetSpekular[' + i + ']'), this.lichtquellen[i].rgbSpekular);

            let lichtPosition = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
            let vMatrix = this.activeCamera.getView();
            let translationVector = vec3.fromValues(this.lichtquellen[i].x, this.lichtquellen[i].y, this.lichtquellen[i].z);
            let translationMatrix = [];
            mat4.fromTranslation(translationMatrix, translationVector);
            let mvMatrix = [];
            mat4.multiply(mvMatrix, vMatrix, translationMatrix);
            vec4.transformMat4(lichtPosition, lichtPosition, mvMatrix);

            this.gl.uniform3fv(this.getUniform('lichtPosition[' + i + ']'), [lichtPosition[0], lichtPosition[1], lichtPosition[2]]);
        }
        this.gl.uniform3fv(this.getUniform('lichtIntensitaetAmbient'), [ 0.2, 0.2, 0.2]);

        this.gl.uniform3fv(this.getUniform('reflexionsKoeffizientAmbient'), object.reflexionsKoeffizientAmbient);
        this.gl.uniform3fv(this.getUniform('reflexionsKoeffizientDiffus'), object.reflexionsKoeffizientDiffus);
        this.gl.uniform3fv(this.getUniform('reflexionsKoeffizientSpekular'), object.reflexionsKoeffizientSpekular);
        this.gl.uniform1f(this.getUniform('shininess'), object.shininess);

        this.gl.uniform3fv(this.getUniform('cameraPos'), [this.activeCamera.x, this.activeCamera.y, this.activeCamera.z]);
        //console.log(this.activeCamera.target.x)





        // 7.3 Save uniform location and save the model matrix into it
        // Transformationsmatrix
        this.gl.uniformMatrix4fv(this.getUniform('mTranslation'), false, translate(object.x, object.y, object.z));

        // 7.4 Save uniform location and save the view matrix into it
        this.gl.uniformMatrix4fv(this.getUniform('mView'), false, this.activeCamera.getView());

        // 7.5 Save uniform location and save the projection matrix into it
        this.gl.uniformMatrix4fv(this.getUniform('mProjection'), false, perspective(Math.PI/4, 0.5, 100));

        return object.positions.length / 3;
    };



    var slider = document.getElementById("lichtX");
    slider.oninput = (value) =>{
       var val = document.getElementById("lichtX").value
       this.licht2.setPosition(0.1*val,1,this.licht2.z);    
    } 

    var sliderZ = document.getElementById("lichtZ");
    sliderZ.oninput = (value) =>{
       var val = document.getElementById("lichtZ").value
       this.licht2.setPosition(this.licht2.x,1,0.1*val);    
    } 

/*     var sliderRL = -1;
    var sliderR = document.getElementById("rotation");
    sliderR.oninput = (value) =>{
       var val = document.getElementById("rotation").value
       if(sliderRL == -1){
        this.objects.forEach(object => object.rotate(Y,0.25));
        sliderRL = val;
       }else{
           this.objects.forEach(object => object.rotate(Y,0.25*(val-sliderRL)));
           console.log(sliderRL -val);
           sliderRL = val;
       }
    }  */


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
    this.licht = null;
    this.lichtquellen = [];    

    this.terrain = null;
    this.water = null;
    this.palm = null;
    this.cube = null;
}

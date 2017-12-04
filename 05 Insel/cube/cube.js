// Environment variables
let gl,
	canvas;

// Scene variables
let objects = [];

// Shader variables
let program;

let pointLoc,
	colorLoc;

let modelMatrixLoc;

let viewMatrixLoc,
	viewMatrix;

let projectionMatrixLoc,
	projectionMatrix;

let eye = vec3.fromValues(0.0, 2, 2.0);
let target = vec3.fromValues(0.0, 0.0, 0.0);
let up = vec3.fromValues(0.0, 1.0, 0.0);
let mousePosX=0;
let mousePosY=0;

function degToRad (deg) {
	return deg * Math.PI / 180;
}

class Cube {
	constructor (from = {x: -0.5, y: -0.5, z: -0.5}, to = {x: 0.5, y: 0.5, z: 0.5}, sideColors = {front: [0, 0, 1, 1], right: [0, 1, 0, 1], back: [1, 0, 0, 1], left: [1, 1, 0, 1], bottom: [1, 0, 1, 1], top: [0, 1, 1, 1]}) {
		this.from = from;
		this.to = to;
		this.sideColors = sideColors;
		this.mesh = [];
		this.colors = [];
		this.orientation = {x: 0, y: 0, z: 0};
		this.position = {x: 0, y: 0, z: 0};
		this.verticesVBO = gl.createBuffer();
		this.modelMatrix = this.SetModelMatrix(this.position, this.orientation);

		this.MakeModel();
		this.InitBuffer();
	}

	/**
	 * Makes the model, namely the mesh and the colors arrays
	 */
	MakeModel () {
		this.mesh = [
			// Front
			this.from.x, this.from.y, this.to.z,
			this.to.x, this.from.y, this.to.z,
			this.from.x, this.to.y, this.to.z,

			this.to.x, this.to.y, this.to.z,
			this.from.x, this.to.y, this.to.z,
			this.to.x, this.from.y, this.to.z,

			// Right
			this.to.x, this.to.y, this.to.z,
			this.to.x, this.from.y, this.to.z,
			this.to.x, this.from.y, this.from.z,

			this.to.x, this.to.y, this.from.z,
			this.to.x, this.to.y, this.to.z,
			this.to.x, this.from.y, this.from.z,

			// Back
			this.from.x, this.from.y, this.from.z,
			this.to.x, this.from.y, this.from.z,
			this.from.x, this.to.y, this.from.z,

			this.to.x, this.to.y, this.from.z,
			this.from.x, this.to.y, this.from.z,
			this.to.x, this.from.y, this.from.z,

			// Left
			this.from.x, this.to.y, this.to.z,
			this.from.x, this.from.y, this.to.z,
			this.from.x, this.from.y, this.from.z,

			this.from.x, this.to.y, this.from.z,
			this.from.x, this.to.y, this.to.z,
			this.from.x, this.from.y, this.from.z,

			// Bottom
			this.from.x, this.from.y, this.to.z,
			this.from.x, this.from.y, this.from.z,
			this.to.x, this.from.y, this.to.z,

			this.to.x, this.from.y, this.from.z,
			this.from.x, this.from.y, this.from.z,
			this.to.x, this.from.y, this.to.z,

			// Top
			this.from.x, this.to.y, this.to.z,
			this.from.x, this.to.y, this.from.z,
			this.to.x, this.to.y, this.to.z,

			this.to.x, this.to.y, this.from.z,
			this.from.x, this.to.y, this.from.z,
			this.to.x, this.to.y, this.to.z
		]

		for (let i = 0; Math.floor(i/6) < 6; i++) {

			this.colors = this.colors.concat(Object.values(this.sideColors)[Math.floor(i/6)]);

		}
	}

	/**
	 * Sets the model matrix
	 * @param {Object} position x,y,z
	 * @param {Object} orientation x,y,z - angles in degree
	 */
	SetModelMatrix (position, orientation) {
		
		// Convert the orientation to RAD
		orientation = {x: degToRad(orientation.x), y: degToRad(orientation.y), z: degToRad(orientation.z)};
	
		// Set the transformation matrix
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			position.x, position.y, position.z, 1
		];
	}

	/**
	 * Sets the buffer data
	 */
	InitBuffer () {
		gl.useProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.concat(this.colors)), gl.STATIC_DRAW);
	}

	/**
	 * Updates the model matrix to the buffer
	 */
	UpdateBuffer () {
		// Push the matrix to the buffer
		gl.uniformMatrix4fv(modelMatrixLoc, false, new Float32Array(this.modelMatrix));		
	}

	Render () {
		
		// Bind the program and the vertex buffer object
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);

		// Set attribute pointers and enable them
		gl.vertexAttribPointer(pointLoc, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, this.mesh.length*4);
		gl.enableVertexAttribArray(pointLoc);
		gl.enableVertexAttribArray(colorLoc);

		// Set uniforms
		this.UpdateBuffer();

		// Draw the object
		gl.drawArrays(gl.TRIANGLES, 0, this.mesh.length/3);
	}
}



class Surface extends Cube{
	constructor (from = {x: -5, y: 0, z: -5}, to = {x: 5, y: 0, z: 5}, sideColors = {front: [1, 1, 0, 1], right: [1, 1, 0, 1], back: [1, 1, 0, 1], left: [1, 1, 0, 1], bottom: [1, 1, 0, 1], top: [1, 1, 0, 1]}) {
		super();
		this.from = from;
		this.to = to;
		this.sideColors = sideColors;
		this.mesh = [];
		this.colors = [];
		this.orientation = {x: 0, y: 0, z: 0};
		this.position = {x: 0, y: 0, z: 0};
		this.verticesVBO = gl.createBuffer();
		this.modelMatrix = this.SetModelMatrix(this.position, this.orientation);

		this.MakeModel();
		this.InitBuffer();
	}
}



class Palme{
	constructor () {
		this.tx=0;
		this.ty=0;
		this.tz=0;

		this.objects =[];

		let newHeight =0;
		for(let i=0; i<5;i++){
			let palmenteil = new Palmenteil();
			palmenteil.translate(0,newHeight,0);
			newHeight += palmenteil.lengthY;
			this.objects.push(palmenteil);
		}

		this.orientation = {x: 0, y: 0, z: 0};
		this.position = {x: 0, y: 0, z: 0};
	}

	translate (tx, ty, tz){
		for(let i=0; i<this.objects.length;i++){
		this.objects[i].translate(tx,ty,tz);
		}
	}

	Render () {
		for(let i=0; i<this.objects.length; i++){
			this.objects[i].Render();
		}
	}
}



class Palmenteil extends Cube{
	constructor (sizeFactorXZ=1, sizeFactorY=1, from = {x: -0.1, y: -0.1, z: -0.1}, to = {x: 0.1, y: 0.1, z: 0.1}, sideColors = {front: [0.54, 0.45, 0.33, 1], right: [0.57, 0.42, 0.33, 1], back: [0.52, 0.47, 0.33, 1], left: [0.53, 0.49, 0.33, 1], bottom: [0.58, 0.45, 0.33, 1], top: [0.54, 0.43, 0.33, 1]}) {
		super();
		this.from = from;
		this.to = to;

		this.lengthY=to.y - from.y;

		this.sideColors = sideColors;
		this.mesh = [];
		this.colors = [];
		this.orientation = {x: 0, y: 0, z: 0};
		this.position = {x: 0, y: 0, z: 0};
		this.verticesVBO = gl.createBuffer();
		this.modelMatrix = this.SetModelMatrix(this.position, this.orientation);

		this.MakeModel();
		for(let i=1;i<this.mesh.length;i+=3){
			this.mesh[i] = this.mesh[i]*sizeFactorY;
		}
		for(let i=0;i<this.mesh.length;i+=3){
			this.mesh[i] = this.mesh[i]*sizeFactorXZ;
		}
		for(let i=2;i<this.mesh.length;i+=3){
			this.mesh[i] = this.mesh[i]*sizeFactorXZ;
		}
		this.InitBuffer();
	}

	translate (tx, ty, tz){
		let result = {x: 0, y: 0, z: 0};
		result.x= this.position.x + tx;
		result.y = this.position.y + ty;
		result.z = this.position.z + tz;
		this.modelMatrix = this.SetModelMatrix(result,this.orientation);
		this.UpdateBuffer();
	}


	/**
	 * Makes the model, namely the mesh and the colors arrays
	 */
	MakeModel () {
		let factor =1.7;
		this.mesh = [
			// Front
			this.from.x, this.from.y, this.to.z,
			this.to.x, this.from.y, this.to.z,
			this.from.x*factor, this.to.y, this.to.z*factor,

			this.to.x*factor, this.to.y, this.to.z*factor,
			this.from.x*factor, this.to.y, this.to.z*factor,
			this.to.x, this.from.y, this.to.z,

			// Right
			this.to.x*factor, this.to.y, this.to.z*factor,
			this.to.x, this.from.y, this.to.z,
			this.to.x, this.from.y, this.from.z,

			this.to.x*factor, this.to.y, this.from.z*factor,
			this.to.x*factor, this.to.y, this.to.z*factor,
			this.to.x, this.from.y, this.from.z,

			// Back
			this.from.x, this.from.y, this.from.z,
			this.to.x, this.from.y, this.from.z,
			this.from.x*factor, this.to.y, this.from.z*factor,

			this.to.x*factor, this.to.y, this.from.z*factor,
			this.from.x*factor, this.to.y, this.from.z*factor,
			this.to.x, this.from.y, this.from.z,

			// Left
			this.from.x*factor, this.to.y, this.to.z*factor,
			this.from.x, this.from.y, this.to.z,
			this.from.x, this.from.y, this.from.z,

			this.from.x*factor, this.to.y, this.from.z*factor,
			this.from.x*factor, this.to.y, this.to.z*factor,
			this.from.x, this.from.y, this.from.z,

			// Bottom
			this.from.x, this.from.y, this.to.z,
			this.from.x, this.from.y, this.from.z,
			this.to.x, this.from.y, this.to.z,

			this.to.x, this.from.y, this.from.z,
			this.from.x, this.from.y, this.from.z,
			this.to.x, this.from.y, this.to.z,

			// Top
			this.from.x*factor, this.to.y, this.to.z*factor,
			this.from.x*factor, this.to.y, this.from.z*factor,
			this.to.x*factor, this.to.y, this.to.z*factor,

			this.to.x*factor, this.to.y, this.from.z*factor,
			this.from.x*factor, this.to.y, this.from.z*factor,
			this.to.x*factor, this.to.y, this.to.z*factor
		]

		for (let i = 0; Math.floor(i/6) < 6; i++) {

			this.colors = this.colors.concat(Object.values(this.sideColors)[Math.floor(i/6)]);

		}
	}
}

/**
 * Initializes the program, models and shaders
 */
function init() {

	// 1. Get canvas and setup WebGL context
    canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');
	
	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.95,0.95,0.95,1.0);
	gl.enable(gl.DEPTH_TEST);

	// 3. Specify vertices
	objects.push(new Surface());
	objects.push(new Palme());	

	// 4. Init shader program via additional function and bind it
	program = initShader(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// 7 Save attribute location to address them
	pointLoc = gl.getAttribLocation(program, "vPosition");
	colorLoc = gl.getAttribLocation(program, "vColor");
	modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");

    // Set view matrix
	eye = vec3.fromValues(0.0, 0.5, 2.0);
	target = vec3.fromValues(0.0, 0.5, 0.0);
	up = vec3.fromValues(0.0, 1.0, 0.0);

	viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, eye, target, up);

	// 7 Save uniform location and save the view matrix into it
	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

    // Set projection matrix

	projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.5, 100);

	// 7 Save uniform location and save the projection matrix into it
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
	
	// 8. Render
	render();
};

document.addEventListener("keydown", keyDownHandler)
document.addEventListener("mousemove", mouseMoveHandler)

function mouseMoveHandler(e){
	let deltaX = e.clientX - mousePosX;
	let deltaY =  e.clientY - mousePosY;

	mousePosX = e.clientX;
	mousePosY = e.clientY;

	vec3.rotateY(target, target, eye, -0.01*deltaX);

	viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, eye, target, up);

	// 7 Save uniform location and save the view matrix into it
	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
}


function keyDownHandler(e){
	speed = 0.2;
	if(e.key == "w"){
		move(0);	
	}
	else if (e.key == "a"){
		move("links");
	}
	else if (e.key == "s"){
		move("unten")
	}
	else if (e.key == "d"){
		move("rechts")
	}

	viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, eye, target, up);

	// 7 Save uniform location and save the view matrix into it
	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
}

function move(richtung){
	let subVector = vec3.fromValues(0.0, 0.0, 0.0);
	vec3.sub(subVector,eye, target);

	let pfad = vec3.fromValues(0.0, 0.0,0.0);
	pfad[0] = pfad[0] - subVector[0] * speed; 
	pfad[1] = pfad[1] -subVector[1] * speed; 
	pfad[2] = pfad[2] - subVector[2] * speed; 
	if(richtung == "links"){
		let temp = pfad[0];
		pfad[0] = pfad[2];
		pfad[2] = -temp;
	}
	else if(richtung == "rechts"){
		let temp = pfad[0];
		pfad[0] = -pfad[2];
		pfad[2] = temp;
	}
	else if(richtung == "unten"){
		pfad[0] = -pfad[0];
		pfad[2] = -pfad[2];
	}
	vec3.add(eye, eye, pfad);
	vec3.add(target, target, pfad);
}


function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Call every render function
    objects.forEach(function(object) {
		object.Render();
	});

	requestAnimationFrame(render);
}

init ();
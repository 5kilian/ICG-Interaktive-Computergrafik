let gl;
let positions = [];

	
function drawPacMan(radius, numberOfVertices, amgleMouth) {

	// 1. Get canvas and setup WebGL context
    const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);

	
	const colors = [];
	
	let enf = (amgleMouth/2)/(360/numberOfVertices);

	
	for(i=enf*(360/numberOfVertices); i<360-enf*(360/numberOfVertices); i+=(360/numberOfVertices)){
		positions.push(0,0)
		
		const x = radius * Math.cos(2*Math.PI*(i/360));
		const y = radius * Math.sin(2*Math.PI*(i/360));
		
		const x1 = radius * Math.cos(2*Math.PI*((i+(360/numberOfVertices))/360));
		const y1 = radius * Math.sin(2*Math.PI*((i+(360/numberOfVertices))/360));
		
		positions.push(x, y, x1, y1);
		colors.push(1, 1, 0, 1);
		colors.push(1, 1, 0, 1);
		colors.push(1, 1, 0, 1);
	}
	


	// 4. Init shader program via additional function and bind it
	const program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
    // 5. Create VBO
	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

    // 6. Fill VBO with positions and colors
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.concat(colors)), gl.STATIC_DRAW);

    // 7. Link data in VBO to shader variables
	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPosition);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 8, 0);

	const vColor = gl.getAttribLocation(program, "vColor");
	gl.enableVertexAttribArray(vColor);
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 16, positions.length*4);

	// 8. Render
	render();
};

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, positions.length/2);
}

drawPacMan(0.6, 30, 40);


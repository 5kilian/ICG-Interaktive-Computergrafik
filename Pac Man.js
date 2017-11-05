let gl;
let positions = [];

	
function drawPacMan(radius, numberOfVertices, amgleMouth) {

	// 1. Get canvas and setup WebGL context
    const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);
	
	//3. Calculate Pac-Man shape
	const colors = [];
	const dreieckWinkel = (360/numberOfVertices);	
	const mund = (amgleMouth/2)/dreieckWinkel;
	
	for(i=mund*dreieckWinkel; i<360-mund*dreieckWinkel; i+=dreieckWinkel){
		positions.push(0,0) //Erste Koordinaten für das Dreieck
		
		const x1 = radius * Math.cos(Math.PI*(i/180)); //Zweite Koordinaten für das Dreieck
		const y1 = radius * Math.sin(Math.PI*(i/180));
		
		const x2 = radius * Math.cos(Math.PI*((i+dreieckWinkel)/180)); //Dritte Koordinaten für das Dreieck
		const y2 = radius * Math.sin(Math.PI*((i+dreieckWinkel)/180));
		
		positions.push(x1, y1, x2, y2);
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

drawPacMan(1, 30, 45);


let gl;

let positions = [];
let colors = [];

function init() {

	// 1. Get canvas and setup WebGL context
    const canvas = document.getElementById("gl-canvas"); // falsche canvas id
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);

	// 3. Specify geometry
	for (let $i=-1; $i<1; $i+=0.1) {
        for (let $j=-1; $j<1; $j+=0.1) {
        	let square = { x: $i, y: $j, r: 0, g: 1, b: 0, halfSize: 0.1 };
            drawSquare(square);
        }
	}

	for (let $j=0; $j<10; $j++) {
        let square = { x: (2*Math.random())-1, y: (2*Math.random())-1, r: 1, g: 0, b: 0, halfSize: 0.5};
        drawSquare(square);
	}

	// 4. Init shader program via additional function and bind it
	const program = initShader(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
    // 5. Create VBO
	const vbo = gl.createBuffer();

    // 6. Fill VBO with positions and colors
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo); // dieser Zeile fehlte
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.concat(colors)), gl.STATIC_DRAW);

    // 7. Link data in VBO to shader variables
	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPosition);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

	const vColor = gl.getAttribLocation(program, "vColor");
	gl.enableVertexAttribArray(vColor);
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, positions.length * 4);

	// 8. Render
	render();
}

function drawSquare(square) {
    for (let $i=0; $i<6; $i++) {
        positions = positions.concat([
            square.x + (-1* Math.floor(($i+2)/3)%2) * square.halfSize,
            square.y + (-1* Math.floor(($i+4)/3)%2) * square.halfSize
        ]);
        colors = colors.concat([
        	Math.max(0, square.r- Math.random()),
			Math.max(0, square.g- Math.random()),
			Math.max(0, square.b- Math.random()), 1]);
    }
}

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, positions.length/2);
}

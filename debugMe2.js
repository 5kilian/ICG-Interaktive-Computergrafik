let gl;
	
let positions = [];
let colors = [];

function init() {

	// 1. Get canvas and setup WebGL context
    const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);
	
	//let box = [0,0,1,0,0,1];



let boxsize =0.1;	
	
	
	for(let i=0;i<1-boxsize;i+=boxsize){
	for(let j=0;j<1-boxsize;j+=boxsize){
		//if(i==0 | j== boxsize){
		box = {
			x:i,
			y:j,
			r:Math.random(),
			g:Math.random(),
			b:Math.random(),	
			size:boxsize
			} 
			
		// 3. Specify geometry
		 positions.push( box.x - (box.size/2), box.y - (box.size/2), 
						box.x + (box.size/2), box.y - (box.size/2), 
						box.x + (box.size/2), box.y + (box.size/2),
							 
						box.x - (box.size/2), box.y - (box.size/2),
						box.x + (box.size/2), box.y + (box.size/2),
						box.x - (box.size/2), box.y + (box.size/2));


		 colors.push(   box.r, box.g, box.b, 1, // red
						box.r, box.g, box.b, 1, // red
						box.r, box.g, box.b, 1, // red
						box.r, box.g, box.b, 1, // red
						box.r, box.g, box.b, 1, // red
						box.r, box.g, box.b, 1) // red); // red
		//}
	}
}
	


	// 4. Init shader program via additional function and bind it
	const program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
    // 5. Create VBO
	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo)

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

init();

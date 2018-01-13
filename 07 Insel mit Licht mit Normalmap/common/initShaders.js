//
//  initShaders.js
//

function initShader(gl, vertexShaderId, fragmentShaderId) {

    const compileShader = (gl, gl_shaderType, shaderSource) => {
        // Create the shader
        let shader = gl.createShader(gl_shaderType);

        // Set the shader source code
        gl.shaderSource(shader, shaderSource);

        // Compile the shader to make it readable for the GPU
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            // Something went wrong during compilation; get the error
            throw "could not compile shader:" + gl.getShaderInfoLog(shader);
        }

        return shader;
    };

    /*
     * Setup shader program
     */

    // Build the program
    const program = gl.createProgram();

    // Attach shaders to it
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, document.querySelector('#' + vertexShaderId).text));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, document.querySelector('#' + fragmentShaderId).text));

    gl.linkProgram(program);

    return program;
}

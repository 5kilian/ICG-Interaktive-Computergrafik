/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */


function GlObject(x, y, z) {

    this.construct = this._construct = () => {
        if (this.type==='skybox') console.log('not possible');
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
    this.scale = this._scale = (size) => this.calculateNormals();

    this.translate = this._translate = (tx, ty, tz) => this.setPosition(this.x + tx, this.y + ty, this.z + tz);

    this.setPosition = (x, y, z) => {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };

    this.rotate = this._rotate = (axis, degree) => {
        switch (axis) {
            case X:
                this.updateOrientation(X, radiansToDegree(this.orientation.x) + degree);
                break;
            case Y:
                this.updateOrientation(Y, radiansToDegree(this.orientation.y) + degree);
                break;
            case Z:
                this.updateOrientation(Z, radiansToDegree(this.orientation.z) + degree);
                break;
        }
        return this;
    };

    this.position = () => {
        return vec3.fromValues(this.x, this.y, this.z);
    };

    this.updateOrientation = (axis, degree) => {
        switch (axis) {
            case X:
                this.orientation.x = degreeToRadians(degree);
                break;
            case Y:
                this.orientation.y = degreeToRadians(degree);
                break;
            case Z:
                this.orientation.z = degreeToRadians(degree);
                break;
        }
    };

    this.distance = (x, y, z) => {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) + Math.pow(z - this.z, 2));
    };

    this.calculateNormals = () => {
        this.normals = [];

        switch (this.glMode) {
            case canvas.gl.TRIANGLES:
                for (let k = 0; k < this.positions.length; k += 9) {
                    let polygon = [];
                    for (let i = k; i < k + 9; i++) polygon.push(this.positions[i]);

                    let normal = vec3.normalize(vec3.create(), this.calculateNormal(
                        vec3.fromValues(polygon[0], polygon[1], polygon[2]),
                        vec3.fromValues(polygon[3], polygon[4], polygon[5]),
                        vec3.fromValues(polygon[6], polygon[7], polygon[8])
                    ));

                    for (let i = 0; i < 3; i++) this.normals.push(normal[0], normal[1], normal[2]);
                }
                break;
            case canvas.gl.TRIANGLE_FAN:
                for (let k = 3; k < this.positions.length; k += 3) {
                    let polygon = [this.positions[0], this.positions[1], this.positions[2]];
                    for (let i = k; i <= k + 6; i++) polygon.push(this.positions[i]);

                    let normal = vec3.normalize(vec3.create(), this.calculateNormal(
                        vec3.fromValues(polygon[0], polygon[1], polygon[2]),
                        vec3.fromValues(polygon[3], polygon[4], polygon[5]),
                        vec3.fromValues(polygon[6], polygon[7], polygon[8])
                    ));

                    for (let i = 0; i < 3; i++) this.normals.push(normal[0], normal[1], normal[2]);
                }
        }

        return this;
    };

    this.calculateNormal = (p1, p2, p3) => {
        return vec3.cross(vec3.create(), vec3.sub(vec3.create(), p3, p2), vec3.sub(vec3.create(), p1, p2));
    };

    this.type = 'object';
    this.setPosition(x, y, z);
    this.orientation = {x: 0, y: 0, z: 0};
    this.positions = [];
    this.colors = [];
    this.normals = [];
    this.glMode = canvas.gl.TRIANGLES;
    this.texture = undefined;
    this.textureSrc = undefined;
    this.normalSr = 'assets/default_normal_map.jpg';
    this.textureCoordinates = [];
    this.activeKeys = [];
    this.keyChanged = false;
    this.rotationOrder = [X, Y, Z];
}

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
    this.scale = (size) => { };

    this.setPosition = (x, y, z) => {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };

    this.translate = this._translate = (tx, ty, tz) => {
        return this.setPosition(this.x + tx, this.y + ty, this.z + tz);
    };

    this.rotate = (axis, degree) => {
        switch (axis) {
            case X: this.updateOrientation(X, radiansToDegree(this.orientation.x) + degree); break;
            case Y: this.updateOrientation(Y, radiansToDegree(this.orientation.y) + degree); break;
            case Z: this.updateOrientation(Z, radiansToDegree(this.orientation.z) + degree); break;
        }
        return this;
    };

    this.updateOrientation = (axis, degree) => {
        switch (axis) {
            case X: this.orientation.x = degreeToRadians(degree); break;
            case Y: this.orientation.y = degreeToRadians(degree); break;
            case Z: this.orientation.z = degreeToRadians(degree); break;
        }
    };

    this.distance = (x, y, z) => {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) + Math.pow(z - this.z, 2));
    };

    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.translate(x, y, z);
    this.orientation = { x: 0, y: 0, z: 0 };
    this.positions = [];
    this.colors = [];
    this.glMode = canvas.gl.TRIANGLES;
    this.texture = undefined;
    this.textureCoordinates = [];
    this.activeKeys = [];
    this.keyChanged = false;
    this.rotationOrder = [X, Y, Z];
}

/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */


function Camera(x, y, z) {

    GlObject.call(this, x, y, z);

    this.update = () => {
        this.translate(this.tx, this.ty, this.tz);
    };

    this.getView = () => {
        let position = vec3.fromValues(this.x, this.y, this.z);
        // Rotate around Y axis
        this.target = rotateY(EYE, this.orientation.x);
        // Rotation matrix from axis and angle
        this.target = rotateAround(vec3.cross(vec3.create(), this.target, UP), this.target, this.orientation.y);
        // Set view matrix
        return mat4.lookAt(mat4.create(), position, vec3.add(vec3.create(), position, this.target), UP);
    };

    this.handleEvent = () => {
        let strafeDirection;
        this.tx = this.ty = this.tz = 0;
        let secondKey = this.activeKeys[this.activeKeys.length-2];
        switch (this.activeKeys[this.activeKeys.length-1]) {
            case KEYCODE_D:
            case KEYCODE_RIGHT:
                strafeDirection = vec3.cross(vec3.create(), this.target, UP);
                this.tx = this.speed * strafeDirection[0];
                this.tz = this.speed * strafeDirection[2];
                break;
            case KEYCODE_W:
            case KEYCODE_UP:
                this.tx = this.speed * this.target[0];
                this.tz = this.speed * this.target[2];
                break;
            case KEYCODE_A:
            case KEYCODE_LEFT:
                strafeDirection = vec3.cross(vec3.create(), this.target, UP);
                this.tx = -this.speed * strafeDirection[0];
                this.tz = -this.speed * strafeDirection[2];
                break;
            case KEYCODE_S:
            case KEYCODE_DOWN:
                this.tx = -this.speed * this.target[0];
                this.tz = -this.speed * this.target[2];
                break;
            case KEYCODE_R:
                this.ty = this.speed * UP[1];
                break;
            case KEYCODE_F:
                this.ty = -this.speed * UP[1];
                break;
            case KEYCODE_SPACE:
                break;
        }
    };

    this.handleMouseMove = (event) => {
        this.rotate(X, event.movementX * this.rotationSpeed);
        this.rotate(Y, event.movementY * this.rotationSpeed);
        this.handleEvent();
    };

    this.target = EYE;
    this.speed = 0.02;
    this.rotationSpeed = -0.25;
    this.tx = 0;
    this.ty = 0;
    this.tz = 0;
    this.construct();
}

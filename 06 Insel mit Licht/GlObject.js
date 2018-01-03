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

    this.rotate = this._rotate = (axis, degree) => {
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

    this.calculateNormals = (positions2) =>{
        normals = [];
        polygon = [];
        for(let k=0; k<positions2.length; k+=9){
            polygon = [];
            for(let i=k; i<k+9; i++){
                polygon.push(positions2[i]);
            }
            let normalVec = this.calculateNormal(polygon);
            let normalVec3  = vec3.fromValues(normalVec[0], normalVec[1], normalVec[2]);
            vec3.normalize(normalVec3, normalVec3);
            //debugger;
            for(let i = 0; i<3; i++){
                normals.push(normalVec3[0], normalVec3[1], normalVec3[2]);
            }
        }
        return normals;
    }

    this.calculateNormal = (positions) => {
        let p1 = vec3.fromValues(positions[0], positions[1], positions[2]);
        let p2 = vec3.fromValues(positions[3], positions[4], positions[5]);
        let p3 = vec3.fromValues(positions[6], positions[7], positions[8]);
        let v = vec3.create();
        vec3.sub(v, p1, p2);

        let w = vec3.create();
        vec3.sub(w, p3, p2);

        let N = vec3.create();
        vec3.cross(N, w, v);

        return N;  
    }

    this.reflexionsKoeffizientAmbient = [1.0, 1.0 ,1.0];
    this.reflexionsKoeffizientDiffus = [1.0, 1.0 ,1.0];
    this.reflexionsKoeffizientSpekular = [1.0, 1.0 ,1.0];
    this.shininess = 4.0;

    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.translate(x, y, z);
    this.orientation = { x: 0, y: 0, z: 0 };
    this.positions = [];
    this.colors = [];
    this.glMode = canvas.gl.TRIANGLES;
    this.texture = undefined;
    this.textureSrc = '';
    this.textureCoordinates = [];
    this.activeKeys = [];
    this.keyChanged = false;
    this.rotationOrder = [X, Y, Z];
}

/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */


function Palm(x, y, z) {

    GlObject.call(this, x, y, z);

    // Inner class
    function PalmPart(x, y, z) {

        GlObject.call(this, x, y, z);

        this.scale = (size, factor) => {
            this.positions = [
                // Front
                -size, -size, size, 
                size, -size,  size, 
                size * factor,  size,  size * factor,
                size * factor, size, size * factor, 
                -size * factor,  size,  size * factor, 
                -size, -size,  size,

                // Right
                size * factor, size,  size * factor,
                 size, -size,  size, 
                 size, -size, -size,
                size * factor,  size, -size * factor,
                 size * factor,  size,  size * factor, 
                 size, -size, -size,

                // Back
                -size, -size, -size, 
                size * factor,  size, -size * factor,
                size, -size, -size, 
                size * factor, size, -size * factor, 
                -size, -size, -size,
                -size * factor,  size, -size * factor, 

                // Left
                -size * factor, size, size * factor, 
                -size, -size, -size,
                -size, -size,  size, 
                -size * factor,  size, -size * factor,
                -size, -size, -size,
                 -size * factor, size, size * factor,

                // Bottom
                -size, -size, size, 
                size, -size, -size,
                size, -size,  size, 
                size, -size, -size, 
                -size, -size,  size,
                -size, -size, -size,

                // Top
                -size * factor, size, size * factor,
                 size * factor, size,  size * factor,
                  size * factor, size, -size * factor,
                size * factor, size, -size * factor,
                 -size * factor, size, -size * factor,
                  -size * factor, size, size * factor
            ];

            this.colors = [ ];
            for (let i=0; i < 6; i++) this.colors.push(0.54, 0.45, 0.33, 1) // front
            for (let i=0; i < 6; i++) this.colors.push(0.57, 0.42, 0.33, 1) // right
            for (let i=0; i < 6; i++) this.colors.push(0.52, 0.47, 0.33, 1) // back
            for (let i=0; i < 6; i++) this.colors.push(0.53, 0.49, 0.33, 1) // left
            for (let i=0; i < 6; i++) this.colors.push(0.58, 0.45, 0.33, 1) // bottom
            for (let i=0; i < 6; i++) this.colors.push(0.54, 0.43, 0.33, 1) // top

            return this._scale();
        };

        this.reflexionsKoeffizientAmbient = [0.7, 0.7 ,0.7];
        this.reflexionsKoeffizientDiffus = [0.1, 0.1 ,0.1];
        this.reflexionsKoeffizientSpekular = [0.0, 0.0 ,0.0];
        this.construct();
    }

    // Inner class
    function PalmLeafSimple(x, y, z) {

        GlObject.call(this, x, y, z);

        this.scale = (size) => {
            this.positions = [
                -size, 0, 0, -size*3, -size, size*4, -size, 0, size*12,
                size, 0, size*12, size*3, -size, size*4, size, 0, 0,
            ];

            this.colors = [];
            for (let i=0; i<this.positions.length/3; i++) this.colors.push(0, 0.4 + Math.random()*0.6, 0, 1);

            return this._scale();
        };

        this.glMode = canvas.gl.TRIANGLE_FAN;
        this.reflexionsKoeffizientAmbient = [0.5, 0.5 ,0.5];
        this.reflexionsKoeffizientDiffus = [0.5, 0.5 ,0.5];
        this.reflexionsKoeffizientSpekular = [0.5, 0.5 ,0.5];
        this.construct();
    }

    // Inner class
    function PalmLeafBig(x, y, z) {

        GlObject.call(this, x, y, z);

        this.scale = () => {
            this.makeModel();

            this.colors = [];
            for (let i=0; i<this.positions.length/3; i++) this.colors.push(0, 0.4 + Math.random()*0.6, 0, 1);

            return this._scale();
        };

        this.makeModel = () => {
            this.objects = [];

            let abstandZwischenBlattern = 0.1;
            let anzahlBlatter = 10;
            let startRotationZ = 20;
            let scaling = 0.6;

            let rotationX = 90;
            for (let i=0; i<anzahlBlatter; i++) {
                this.objects.push(new PalmLeafSmall(i*abstandZwischenBlattern, 1-Math.pow(i*3,1.7)*0.001, 0)
                    .rotate(X,rotationX + i)
                    .rotate(Z,-startRotationZ - i*((90-startRotationZ)/anzahlBlatter))
                    .scale(scaling));

                this.objects.push(new PalmLeafSmall(i*abstandZwischenBlattern, 1-Math.pow(i*3,1.7)*0.001, 0)
                    .rotate(X,rotationX + i)
                    .rotate(Z, startRotationZ + 180 +i*((90-startRotationZ)/anzahlBlatter))
                    .scale(scaling));
            }
        };

        this.translate = (tx, ty, tz) => {
            this.objects.forEach(object => object.translate(tx, ty, tz));
            return this._translate(tx, ty, tz);
        };

        this.rotate = (axis, degree) => {
            this.objects.forEach(object => object.rotate(axis, degree));
            return this._rotate(axis, degree);
        };

        this.objects = [];
        this.construct();
    }

    // Inner class
    function PalmLeafSmall(x, y, z) {

        GlObject.call(this, x, y, z);

        this.scale = (scaling) => {
            this.positions = [-0.05, 0, 0, 0, scaling, 0, 0.05, 0, 0];

            this.colors = [];
            for (let i=0; i<this.positions.length/3; i++) this.colors.push(0, 0.4 + Math.random()*0.6, 0, 1);

            return this._scale();
        };

        this.glMode = canvas.gl.TRIANGLES;
        this.construct();
    }

    this.scale = (segments, size) => {
        let height = this.y;
        for (let i=0; i<=segments; i++, height += size/segments) {
            this.objects.push(new PalmPart(this.x, 2 * height, this.z).scale(size/5, 1.5));
        }

        for (let i=0; i<4; i++) {
            if (i==0) this.objects.push(new PalmLeafBig(this.x, height, this.z).scale().translate(0, -0.35,0));
            else this.objects.push(new PalmLeafSimple(this.x, height+0.35, this.z).scale(0.1).rotate(Y, (i+1)*90));
        }

        return this._scale();
    };

    this.translate = (tx, ty, tz) => {
        this.objects.forEach(object => object.translate(tx, ty, tz));
        return this._translate(tx, ty, tz);
    };

    this.rotate = (axis, degree) => {
        this.objects.forEach(object => object.rotate(axis, degree));
        return this
    };

    this.type = 'palm';
    this.objects = [];
    this.reflexionsKoeffizientAmbient = [0.5, 0.5 ,0.5];
    this.reflexionsKoeffizientDiffus = [0.5, 0.5 ,0.5];
    this.reflexionsKoeffizientSpekular = [0.5, 0.5 ,0.5];
    this.construct();
}

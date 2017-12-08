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
                -size, -size, size, size, -size,  size, size * factor,  size,  size * factor,
                size * factor, size, size * factor, -size * factor,  size,  size * factor, -size, -size,  size,
                // Right
                size * factor, size,  size * factor, size, -size,  size, size, -size, -size,
                size * factor,  size, -size * factor, size * factor,  size,  size * factor, size, -size, -size,
                // Back
                -size, -size, -size, size, -size, -size, size * factor,  size, -size * factor,
                size * factor, size, -size * factor, -size * factor,  size, -size * factor, -size, -size, -size,
                // Left
                -size * factor, size, size * factor, -size, -size,  size, -size, -size, -size,
                -size * factor,  size, -size * factor, -size * factor, size, size * factor, -size, -size, -size,
                // Bottom
                -size, -size, size, size, -size,  size, size, -size, -size,
                size, -size, -size, -size, -size, -size, -size, -size,  size,
                // Top
                -size * factor, size, size * factor, size * factor, size,  size * factor, size * factor, size, -size * factor,
                size * factor, size, -size * factor, -size * factor, size, -size * factor, -size * factor, size, size * factor
            ];

            this.colors = [ ];
            for (let i=0; i < 6; i++) this.colors.push(0.54, 0.45, 0.33, 1) // front
            for (let i=0; i < 6; i++) this.colors.push(0.57, 0.42, 0.33, 1) // right
            for (let i=0; i < 6; i++) this.colors.push(0.52, 0.47, 0.33, 1) // back
            for (let i=0; i < 6; i++) this.colors.push(0.53, 0.49, 0.33, 1) // left
            for (let i=0; i < 6; i++) this.colors.push(0.58, 0.45, 0.33, 1) // bottom
            for (let i=0; i < 6; i++) this.colors.push(0.54, 0.43, 0.33, 1) // top
        };

        this.lengthY = 0.1;
        this.construct();
    }

    // Inner class
    function PalmLeaf(x, y, z) {

        GlObject.call(this, x, y, z);

        this.scale = (size) => {
            this.positions = [
                -0.05, 0, 0,
                -0.15, -0.05, 0.2,
                -0.05, 0, 0.6,
                0.05, 0, 0.6,
                0.15, -0.05, 0.2,
                0.05, 0, 0,
            ];
            this.colors = [];
            for (let i=0; i<this.positions.length/3; i++) this.colors.push(0, 0.4 + Math.random()*0.6, 0, 1);
        };

        this.scale(5);
        this.glMode = canvas.gl.TRIANGLE_FAN;
        this.construct();
    }

    this.scale = (size) => {
        let height = this.y;
        for (let i=0; i<5; i++) {
            let palmPart = new PalmPart(this.x, height, this.z);
            palmPart.scale(0.1, 1.5);
            palmPart.translate(0, height, 0);
            height += palmPart.lengthY;
            this.objects.push(palmPart);
        }

        for (let i=0; i<4; i++) {
            let palmLeaf = new PalmLeaf(this.x, height, this.z);
            let rotation = 20;
            palmLeaf.rotate(Y,i*90);
            switch (i) {
                case 0: palmLeaf.rotate(X,rotation); break;
                case 1: palmLeaf.rotate(Z,-rotation); break;
                case 2: palmLeaf.rotate(X,-rotation); break;
                case 3: palmLeaf.rotate(Z,rotation); break;
            }
            palmLeaf.translate(0,0.3,0);
            this.objects.push(palmLeaf);
        }
        return this;
    };

    this.translate = (tx, ty, tz) => {
        this.objects.forEach(object => object.translate(tx, ty, tz));
        return this._translate(tx, ty, tz);
    };

    this.rotate = (axis, degree) => {
        this.objects.forEach(object => object.rotate(axis, degree));
        return this
    };

    this.objects = [];
    this.scale(1);
    this.construct();
}

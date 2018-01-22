/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */


function Water(x, y, z) {

    GlObject.call(this, x, y, z);

    this.scale = (size) => {
        this.positions = [];
        for (let i=0; i<this.segments; i++) {
            for (let j=0; j<this.segments; j++) {
                let is = i*size/this.segments -size / 2, iis = (i+1)*size/this.segments -size / 2;
                let js = j*size/this.segments -size / 2, jjs = (j+1)*size/this.segments -size / 2;
                this.positions.push(
                    is, 0, js,
                    is, 0, jjs,
                    iis, 0, jjs,
                    is, 0, js,
                    iis, 0, jjs,
                    iis, 0, js,
                );
            }
        }

        this.colors = [];
        for (let i=0; i<this.positions.length/3; i++) this.colors.push(0, 0, 0.9, 1);

        this.textureCoordinates = [];
        for (let i=0; i<this.segments; i++) {
            for (let j=0; j<this.segments; j++) {
                this.textureCoordinates.push(0, 1,  1, 0,  0, 0,  1, 1,  1, 0,  0, 1);
            }
        }

        return this._scale();
    };

    this.type = 'water';
    this.textureSrc = 'assets/water_diffuse.jpg';
    this.normalSrc = 'assets/water_normal.jpg';
    this.shininess = 20.0;
    this.segments = 4;

    this.construct();
}

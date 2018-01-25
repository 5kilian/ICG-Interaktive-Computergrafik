/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */


function Surface(x, y, z) {

    GlObject.call(this, x, y, z);

    this.construct = () => {
        this._construct();
        // const terrain magic values, play around for custom terrains
        // 5 => 2^5: power of two amount of segments, because of the simplicity of the diamond-square algorithm
        // 0.4 => the smoothness of the terrain, higher: greater hills, lower: smaller hills, like islands of sand
        this.initTerrain(5, 0.3).scale(10, 10, 0);
    };

    this.initTerrain = (detail, smoothness) => {
        this.segments = Math.pow(2, detail) + 1;
        this.terrain = [];
        for (let i=0; i<=this.segments; i++) {
            this.terrain[i] = [];
            for (let j=0; j<=this.segments; j++) {
                this.terrain[i][j] = 0;
            }
        }
        divide(this.segments-1, smoothness);
        return this;
    };

    // recursive diamond square algorithm
    let divide = (size, smoothness) => {
        if (size < 2) return this;
        let half = size/2;

        // perform square step
        for (let x=half; x<this.segments-1; x+=size) {
            for (let y=half; y<this.segments-1; y+=size) {
                this.terrain[x][y] = square(x, y, half) + Math.random() * 2 * smoothness - smoothness;
            }
        }

        // perform diamond step
        for (let x=0; x<this.segments-1; x+=half) {
            for (let y=(x+half) % size; y<this.segments-1; y+=size) {
                this.terrain[x][y] = diamond(x, y, half) + Math.random() * 2 * smoothness - smoothness;
            }
        }

        divide(half, smoothness/2);
    };

    let square = (x, y, size) => average([
        this.terrain[x-size][y-size],
        this.terrain[x+size][y-size],
        this.terrain[x+size][y+size],
        this.terrain[x-size][y+size]
    ]);

    let diamond = (x, y, size) => average([
        this.terrain[x][(y+size) % (2*size)],
        this.terrain[(x+size) % (2*size)][y],
        this.terrain[x][(y+size) % (2*size)],
        this.terrain[(x+size) % (2*size)][y]
    ]);

    let average = (arr) => arr.reduce((sum, value) => sum + value, 0) / arr.length;

    // custom method to raise a hill, that always starts in the center
    this.zTerrain = (index) => {
        let terrain = [];

        // initialize custom terrain
        for (let i=0; i<=this.segments+1; i++) {
            terrain[i] = [];
            for (let j=0; j<=this.segments+1; j++) {
                terrain[i][j] = 0;
            }
        }

        // compute the hill
        for (let i=0; index > 0 && i<Math.floor(this.segments/2); i++) {
            let c = Math.ceil(index) / 10;
            for (let j=0; j<=i*2-1; j++) {
                terrain[Math.ceil(this.segments/2) - i][Math.ceil(this.segments/2) - i + j] += c;
                if (j>0) terrain[Math.ceil(this.segments/2) - i + j][Math.ceil(this.segments/2) - i] += c;
                if (i>0) terrain[Math.ceil(this.segments/2) + i - j][Math.ceil(this.segments/2) + i] += c;
                if (j>0) terrain[Math.ceil(this.segments/2) + i][Math.ceil(this.segments/2) + i - j] += c;
            }
            terrain[Math.ceil(this.segments/2) - i][Math.ceil(this.segments/2) + i] += c;
            if (i>0) terrain[Math.ceil(this.segments/2) + i][Math.ceil(this.segments/2) - i] += c;
            index -= 0.5;
        }

        return terrain;
    };

    this.scale = (width, height, z) => {
        this.width = width;
        this.height = height;
        this.zIndex = z;
        let zTerrain = this.zTerrain(z);
        this.positions = [];
        for (let i=0; i<this.segments; i++) {
            for (let j=0; j<this.segments; j++) {
                let iws = i*width/this.segments -this.width/2, jhs = j*height/this.segments -this.height/2;
                let iiws = (i+1)*width/this.segments -this.width/2, jjhs = (j+1)*height/this.segments -this.height/2;
                // draw the terrain, the height is composed of the custom hill and the diamond square algorithm.
                this.positions.push(
                    iws, zTerrain[i][j+1] + this.terrain[i][j+1], jjhs,
                    iiws, zTerrain[i+1][j] + this.terrain[i+1][j], jhs,
                    iws, zTerrain[i][j] + this.terrain[i][j], jhs,

                    iiws, zTerrain[i+1][j+1] + this.terrain[i+1][j+1], jjhs,
                    iiws, zTerrain[i+1][j] + this.terrain[i+1][j], jhs,
                    iws, zTerrain[i][j+1] + this.terrain[i][j+1], jjhs,
                );
            }
        }

        // colors for debugging
        this.colors = [];
        for (let i=0; i<this.positions.length/3; i++) {
            (i%6<3) ? this.colors.push(1, 1, 0, 1) : this.colors.push(1, 0.9, 0, 1);
        }

        // sand texture coordinates
        this.textureCoordinates = [];
        for (let i=0; i<(this.positions.length/3)/6; i++) {
            this.textureCoordinates.push(0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0);
        }

        return this._scale();
    };

    this.type = 'surface';
    this.textureSrc = 'assets/sand_diffuse.jpg';
    this.normalSrc = 'assets/sand_normal.jpg';
    this.width = 0;
    this.height = 0;
    this.zIndex = 0;
    this.terrain = [];
    this.segments = 0;
    this.construct();
}

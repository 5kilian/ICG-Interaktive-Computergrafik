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

    this.scale = (width, height) => {
        this.width = width;
        this.height = height;
        this.positions = [];
        for (let i=0; i<this.segments; i++) {
            for (let j=0; j<this.segments; j++) {
                let iws = i*width/this.segments, jhs = j*height/this.segments;
                let iiws = (i+1)*width/this.segments, jjhs = (j+1)*height/this.segments;
                this.positions.push(
                    iws, 0, jhs,
                    iws, 0, jjhs,
                    iiws, 0, jjhs,
                    iws, 0, jhs,
                    iiws, 0, jjhs,
                    iiws, 0, jhs
                );
            }
        }

        this.colors = [];
        for (let i=0; i<this.positions.length/3; i++) this.colors.push(0, 0, 0.9, 1);

        return this;
    };

    this.segments = 1;
    this.scale(10, 10);
    this.translate(-this.width/2, 0, -this.height/2);
    this.construct();
}

/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */

/**
 * Das ist ein Punktlicht.
 */
function Licht(x, y, z) {

    GlObject.call(this, x, y, z);

    this.setColorDiffus = (r, g, b) =>{
        this.rgbDiffus =  [r, g, b];
    }

    this.setColorSpekular = (r, g, b) =>{
        this.rgbSpekular = [r, g, b];
    }

    this.scale = (size) => {
        this.positions = [
            // Front
            size,  size,  size,
            -size, -size,  size,
            size, -size,  size,
            size,  size,  size,
            -size, -size,  size,
            -size,  size,  size,
            // Right
            size,  size,  size,
            size, -size, -size,
            size,  size, -size,
            size,  size,  size,
            size, -size, -size,
            size, -size,  size,
            // Back
            size,  size, -size,
            -size, -size, -size,
            size, -size, -size,
            size,  size, -size,
            -size, -size, -size,
            -size,  size, -size,
            // Left
            -size,  size,  size,
            -size, -size, -size,
            -size,  size, -size,
            -size,  size,  size,
            -size, -size, -size,
            -size, -size,  size,
            // Bottom
            size, -size,  size,
            -size, -size, -size,
            size, -size, -size,
            size, -size,  size,
            -size, -size,  -size,
            -size, -size, size,
            // Top
            size,  size,  size,
            -size,  size, -size,
            size,  size,  -size,
            size,  size,  size,
            -size,  size, -size,
            -size,  size,  size,
        ];

        this.colors = [
            // Front
            0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1,
            // Right
            0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
            // Back
            1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
            // Left
            1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1,
            // Bottom
            1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1,
            // Top
            0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1
        ];

    };


    this.rgbDiffus = [1.0, 1.0, 1.0];
    this.rgbSpekular = [1.0, 1.0, 1.0];
    this.objects = [];
    this.construct();
}

/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */


function Skybox(x, y, z) {

    Cube.call(this, x, y, z);

    this.construct = () => {

    };

    this.type = 'skybox';
    this.texturesSrc = [
        "assets/skybox_posx.jpg", "assets/skybox_negx.jpg",
        "assets/skybox_posy.jpg", "assets/skybox_negy.jpg",
        "assets/skybox_posz.jpg", "assets/skybox_negz.jpg"
    ];
    this.construct();
}
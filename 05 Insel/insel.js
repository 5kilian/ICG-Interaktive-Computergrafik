/**
 * Gruppenmitglieder:
 *
 * Anup Kumar Rana 6437137
 * Daniel Laskow 6791909
 * Dewin Bagci 6815336
 * Tim Kilian 6824270
 */


let canvas = new GlCanvas();
let playCam = new Camera(0, 0, 0);
let worldCam = new Camera(6, 5, 6).rotate(X, 45).rotate(Y, -40);

function increaseZIndex(value) {
    let diff = value - canvas.terrain.zIndex;
    canvas.terrain.scale(10, 10, value);

    canvas.palm.translate(0, diff/10, 0);
}

function rpl() {
    canvas.canvas.requestPointerLock = canvas.canvas.requestPointerLock
        || canvas.canvas.mozRequestPointerLock
        || canvas.canvas.webkitRequestPointerLock;
    canvas.canvas.requestPointerLock();

    document.exitPointerLock = document.exitPointerLock
        || document.mozExitPointerLock
        || document.webkitExitPointerLock;
    document.exitPointerLock();
}

function changeCallback() {
    switch (canvas.canvas) {
        case document.pointerLockElement:
        case document.mozPointerLockElement:
        case document.webkitPointerLockElement:
            canvas.activeCamera = playCam;
            document.addEventListener('mousemove', canvas.activeObject.handleMouseMove);
            break;
        default:
            canvas.activeCamera = worldCam;
            document.removeEventListener('mousemove', canvas.activeObject.handleMouseMove);
    }
}

function init() {
    canvas.initialize();

    document.addEventListener('pointerlockchange', changeCallback, false);
    document.addEventListener('mozpointerlockchange', changeCallback, false);
    document.addEventListener('webkitpointerlockchange', changeCallback, false);

    document.addEventListener('keydown', canvas.keyPressed);
    document.addEventListener('keyup', canvas.keyReleased);
}

// Keycodes
const KEYCODE_LEFT = 37;
const KEYCODE_RIGHT = 39;
const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_SPACE = 32;
const KEYCODE_A = 65;
const KEYCODE_D = 68;
const KEYCODE_F = 70;
const KEYCODE_R = 82;
const KEYCODE_S = 83;
const KEYCODE_W = 87;
const KEYCODE_X = X = 88;
const KEYCODE_Y = Y = 89;
const KEYCODE_Z = Z = 90;

// Math
const degreeToRadians = degree => degree / 180 * Math.PI;
const radiansToDegree = radians => radians / Math.PI * 180;
const twoPI = 2*Math.PI;

// Makros
const f32a = arr => new Float32Array(arr);
const EYE = vec3.fromValues(0, 0, -1);
const UP = vec3.fromValues(0, 1, 0);

const translate = (x, y, z) => mat4.fromTranslation(mat4.create(), vec3.fromValues(x, y, z));

const perspective = (fovy, near, far) => mat4.perspective(mat4.create(), fovy, canvas.width/canvas.height, near, far);

const mRotationX = (radians) => f32a([
    1, 0, 0, 0,
    0, Math.cos(radians), Math.sin(radians), 0,
    0, -Math.sin(radians), Math.cos(radians), 0,
    0, 0, 0, 1
]);

const mRotationY = (radians) => f32a([
    Math.cos(radians), 0, -Math.sin(radians), 0,
    0, 1, 0, 0,
    Math.sin(radians), 0, Math.cos(radians), 0,
    0, 0, 0, 1
]);

const mRotationZ = (radians) => f32a([
    Math.cos(radians), Math.sin(radians), 0, 0,
    -Math.sin(radians), Math.cos(radians), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

const rotateAround = (axis, vector, radians) => {
    let r = [];
    let c = Math.cos(radians);
    let s = Math.sin(radians);

    let x = axis[0], y = axis[1], z = axis[2];
    r[0] = vector[0] * (c + x * x * (1-c)) + vector[1] * (x * y * (1-c) - z * s) + vector[2] * (x * z * (1-c) + y * s);
    r[1] = vector[0] * (y * x * (1-c) + z * s) + vector[1] * (c + y * y * (1-c)) + vector[2] * (y * z * (1-c) - x * s);
    r[2] = vector[0] * (z * x * (1-c) - y * s) + vector[1] * (z * y * (1-c) + x * s) + vector[2] * (c + z * z * (1-c));
    return r;
};

const rotateX = (vector, radians) => {
    let r = [];
    r[0] = vector[0];
    r[1] = vector[1] * Math.cos(radians) - vector[2] * Math.sin(radians);
    r[2] = vector[1] * Math.sin(radians) + vector[2] * Math.cos(radians);
    return r;
};

const rotateY = (vector, radians) => {
    let r = [];
    r[0] = vector[2] * Math.sin(radians) + vector[0] * Math.cos(radians);
    r[1] = vector[1];
    r[2] = vector[2] * Math.cos(radians) - vector[0] * Math.sin(radians);
    return r;
};

const rotateZ = (vector, radians) => {
    let r = [];
    r[0] = vector[0] * Math.cos(radians) - vector[1] * Math.sin(radians);
    r[1] = vector[0] * Math.sin(radians) + vector[1] * Math.cos(radians);
    r[2] = vector[2];
    return r;
};

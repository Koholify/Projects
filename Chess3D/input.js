// Kyle Price
// 201707320
//
// Input class with static variable and
// Listener creation for input collection

var GOOCH_SHADING = false;
var SHOWPICK = false;
var lightSettingIndex = 0;
const lightSettings = [
    new Light(vec4(100.0, 100.0, 0.0, 1.0), vec4(1,1,1,1), vec4(0,0,0,1.0), vec4(0.3,0.3,0.3,1)),
    new Light(vec4(-100.0, -100.0, 0.0, 1.0), vec4(0,0,1,1), vec4(0,0,0,1.0), vec4(0.3,0.3,0.3,1)),
    new Light(vec4(0.0, 0.0, 0.0, 1.0), vec4(1,0,0,1), vec4(0,0,0,1.0), vec4(0.3,0.3,0.3,1)),
];

class Input {
    static foward = false;
    static backward = false;
    static left = false;
    static right = false;
    static up = false;
    static down = false;

    static one = false;
    static two = false;
    static three = false;
    static four = false;
    static five = false;

    static shift = false;
    static o = false;
    static p = false;
    static n = false;
    static l = false;
    static r = false;
    static t = false;
    static x = false;
    static h = false;
    static g = false;
    static f = false;

    static click = false;
    static clickPosition = [0,0];
}


window.addEventListener('keydown', evt => 
{
    switch(evt.code)
    {
        case 'KeyW':
            Input.foward = true;
            break;
        case 'KeyS':
            Input.backward = true;
            break;
        case 'KeyA':
            Input.left = true;
            break;
        case 'KeyD':
            Input.right = true;
            break;
        case 'KeyQ':
            Input.down = true;
            break;
        case 'KeyE':
            Input.up = true;
            break;
        case 'ShiftLeft':
            Input.shift = true;
            break;
    } 
});

window.addEventListener('keyup', evt => 
{
    switch(evt.code)
    {
        case 'KeyW':
            Input.foward = false;
            break;
        case 'KeyS':
            Input.backward = false;
            break;
        case 'KeyA':
            Input.left = false;
            break;
        case 'KeyD':
            Input.right = false;
            break;
        case 'KeyQ':
                Input.down = false;
                break;
        case 'KeyE':
                Input.up = false;
                break;
        case 'ShiftLeft':
            Input.shift = false;
            break;
    }  
});

window.addEventListener('keypress', evt => 
{
    switch(evt.code)
    {
        case 'Digit1':
            Input.one = true;
            break;
        case 'Digit2':
            Input.two = true;
            break;
        case 'Digit3':
            Input.three = true;
            break;
        case 'Digit4':
            Input.four = true;
            break;
        case 'Digit5':
            Input.five = true;
            break;
        case 'KeyO':
            Input.o = true;
            break;
        case 'KeyP':
            Input.p = true;
            break;
        case 'KeyL':
            Input.l = true;
            break;
        case 'KeyR':
            Input.r = true;
            break;
        case 'KeyT':
            Input.t = true;
            break;
        case 'KeyX':
            Input.x = true;
            break;
        case 'KeyF':
            Input.f = true;
            break;
        case 'KeyG':
            Input.g = true;
            break;
        case 'KeyH':
            Input.h = true;
            break;
    }
});

// Input handling
function handleInput() {
    var back = vec3(0,0,7);
    if(Input.foward && Input.backward) {}
    else if(Input.foward) {
        camera.forward(speed);
    } else if (Input.backward) {
        camera.backward(speed);
    }

    if(Input.left && Input.right) {}
    else if (Input.left) {
        meshes[0].transform.rotation[1] =  meshes[0].transform.rotation[1] + 1
    } else if (Input.right) {
        meshes[0].transform.rotation[1] =  meshes[0].transform.rotation[1] - 1;
    }

    if(Input.p) {
        SHOWPICK = !SHOWPICK;
        Input.p = false;
    }

    if(Input.x) {
        game.undoMove();
        Input.x = false;
    }

    if(Input.g) {
        GOOCH_SHADING = !GOOCH_SHADING;
        Input.g = false;
    }

    if(Input.t) {
        if(camera.position[2] == 0) {
            camera.position = vec3(0,105,180);
            camera.rotation = vec3(-22,0,0);
        } else {
            camera.position = vec3(0, 180, 0);
            camera.rotation = vec3(-90, 0, 0);
        }
        meshes[0].transform.rotation = vec3();
        Input.t = false;
    }

    if(Input.l) {
        lights[0] = lightSettings[(++lightSettingIndex % lightSettings.length)];
        Input.l = false;
    }

    if(Input.click) {
        var data = new Uint8Array(4);
        gl.readPixels(Input.clickPosition[0], Input.clickPosition[1], 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);

        var file = Math.floor(((data[0] - 1) / 255)  * 16);
        var row = Math.floor(((data[1] - 1) / 255) * 16);
        var color = data[2] == 0 ? 'none' : data[2] == (128>>>0) ? 'w' : 'b';
        game.selectSquare(file, row);
        Input.click = false;
    }
}

document.getElementById('gl-canvas').addEventListener('mousedown', evt => {
    var rect = canvas.getBoundingClientRect();
    Input.click = true;
    Input.clickPosition = [evt.clientX - rect.left, vHEIGHT - evt.clientY + rect.top - 1];
});
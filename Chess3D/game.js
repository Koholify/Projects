// Kyle Price
// 201707320

class Player {
    constructor() {
        this.pawns = [null, null, null, null, null, null, null, null];
        this.knight = [null, null];
        this.bishop = [null, null];
        this.rook = [null, null];
        this.queen = null;
        this.king = null;
    }

    getAtPos(pos) {
        return this.all().find(p => {return compare(p.position, pos) && p.alive});
    }

    all() {
        return [this.king, this.queen, ...this.bishop, ...this.knight, ...this.rook, ...this.pawns];
    }
}

var white = new Player();
var black = new Player();
var pieces = [];
var game;

var attribLoc = {
    cameraPosition:null,
    projection:null,
    modelView:null,
    diffuse:null,
    ambient:null,
    specular:null,
    lightPosition:null,
    cameraModelView:null,
    shininess:null,
    normalMat:null,
    position: -1,
    normal: -1,
    texture: null,
    textureCoord: -1,
    oColor: null,
};

var programs = {
    flat:null,
    texture:null,
    picker:null,
    quad:null,
    gooch:null,
    current:null,
};

var vHEIGHT, vWIDTH;
var gl, canvas;
var camera;
var square, pickTexture, pickFrameBuffer, pickRenderBuffer;
var light1, ambience;
var speed = 0.4;
var lights = [];
var meshes = [];
var positions = [
    [vec3(-56, 0, -56), vec3(-40, 0, -56), vec3(-24, 0, -56), vec3(-8, 0, -56), vec3(8, 0, -56), vec3(24, 0, -56), vec3(40, 0, -56), vec3(56, 0, -56)],
    [vec3(-56, 0, -40), vec3(-40, 0, -40), vec3(-24, 0, -40), vec3(-8, 0, -40), vec3(8, 0, -40), vec3(24, 0, -40), vec3(40, 0, -40), vec3(56, 0, -40)],
    [vec3(-56, 0, -24), vec3(-40, 0, -24), vec3(-24, 0, -24), vec3(-8, 0, -24), vec3(8, 0, -24), vec3(24, 0, -24), vec3(40, 0, -24), vec3(56, 0, -24)],
    [vec3(-56, 0, -8), vec3(-40, 0, -8), vec3(-24, 0, -8), vec3(-8, 0, -8), vec3(8, 0, -8), vec3(24, 0, -8), vec3(40, 0, -8), vec3(56, 0, -8)],
    [vec3(-56, 0, 8), vec3(-40, 0, 8), vec3(-24, 0, 8), vec3(-8, 0, 8), vec3(8, 0, 8), vec3(24, 0, 8), vec3(40, 0, 8), vec3(56, 0, 8)],
    [vec3(-56, 0, 24), vec3(-40, 0, 24), vec3(-24, 0, 24), vec3(-8, 0, 24), vec3(8, 0, 24), vec3(24, 0, 24), vec3(40, 0, 24), vec3(56, 0, 24)],
    [vec3(-56, 0, 40), vec3(-40, 0, 40), vec3(-24, 0, 40), vec3(-8, 0, 40), vec3(8, 0, 40), vec3(24, 0, 40), vec3(40, 0, 40), vec3(56, 0, 40)],
    [vec3(-56, 0, 56), vec3(-40, 0, 56), vec3(-24, 0, 56), vec3(-8, 0, 56), vec3(8, 0, 56), vec3(24, 0, 56), vec3(40, 0, 56), vec3(56, 0, 56)]
];

window.onload = LoadModels();

function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl2");

    if(!gl) { alert("WebGL 2.0 is unavailable"); }

    // webgl setup
    vHEIGHT = canvas.height;
    vWIDTH = canvas.width;
    gl.enable(gl.DEPTH_TEST);

    console.log(vWIDTH, vHEIGHT);

    programs.flat = initShaders(gl, "flat-vertex-shader", "flat-fragment-shader");
    programs.texture = initShaders(gl, "flat-vertex-shader", "tex-fragment-shader");
    programs.picker = initShaders(gl, "picker-vertex-shader", "flat-fragment-shader");
    programs.gooch = initShaders(gl, "gooch-vertex-shader", "gooch-frag-shader");
    switchProgram(programs.flat);

    setupBoard();

    createPickBuffer();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta = 0;
    proj = perspective(55, 16/9, 1.0, 500.0);

    for(var i = 0; i < 8; i++) {
        lights.push(new Light());
    }

    camera = new Camera(vec3(0,105,180), vec3(-22,0,0));

    light1 = new Light(vec4(0.0, 50.0, 0.0, 1.0));
    light1.diffuse = vec4(0.5,0.5,0.5,1);
    light1.specular = vec4(0.5,0.5,0.5,1);
    light1.ambient = vec4(0,0,0,1.0);
    lights[0] = light1;

    ambience = new Light(vec4(0,0,0,0));
    ambience.diffuse = vec4(0,0,0,1.0);
    ambience.specular = vec4(0,0,0,1.0);
    ambience.ambient = vec4(0.6,0.6,0.6,1.0);

    var amb = document.getElementById('ambient');
    amb.addEventListener('input', evt => {
        var lvl = amb.value / 100;
        ambience.ambient = vec4(lvl, lvl, lvl, 1.0);
    });
    lights[1] = ambience;

    var light = new Light(vec4(-200.0, -20.0, 0.0, 1.0));
    light.diffuse = vec4(0.3,0.3,0.3,1);
    light.specular = vec4(0.4,0.4,0.4,1);
    light.ambient = vec4(0,0,0,1.0);
    lights[2] = light;

    light = new Light(vec4(200.0, -20.0, 0.0, 1.0));
    light.diffuse = vec4(0.3,0.3,0.3,1);
    light.specular = vec4(0.4,0.4,0.4,1);
    light.ambient = vec4(0,0,0,1.0);
    lights[3] = light;

    game = new Chess();
    update();
}

function render() {
    
    var cameraMV = camera.getMV();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0,0, vWIDTH, vHEIGHT);
    gl.clearColor(1,0.7,1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    if(SHOWPICK) {
        switchProgram(programs.picker);       
        gl.uniformMatrix4fv(attribLoc.projection, false, flatten(proj));
        gl.uniformMatrix4fv(attribLoc.cameraModelView, false, flatten(cameraMV));
        meshes[0].drawPick();
    } else {
        meshes[0].draw(cameraMV);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, pickFrameBuffer);
    gl.viewport(0,0, vWIDTH, vHEIGHT);
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    switchProgram(programs.picker);       
    gl.uniformMatrix4fv(attribLoc.projection, false, flatten(proj));
    gl.uniformMatrix4fv(attribLoc.cameraModelView, false, flatten(cameraMV));
    meshes[0].drawPick();
}

// used to get delta time 
var lastTime;
function update(time) {
    // Call other main actions
    lastTime = time;

    game.update();
    if(game.selected != null) {
        square.active = true;
        square.position = [game.selected.position[0], game.selected.position[1]];
        square.transform.position = positions[game.selected.position[0]][game.selected.position[1]];
        
        if(game.selected.color != game.player) {
            game.selected = null;
            square.moves = [];
        } else {
            square.moves = game.getNextMoves();;
        }
    } else {
        square.active = false;
    }

    render();
    handleInput();
    requestAnimationFrame(update);
}

// make tween/generator for animations 
function getTween(from, to, time, reverse) {
    var now = 0;

    return function (dTime) {
        //dTime is undefined at start of runtime
        now += dTime;
        if(!now)
            now = 0;

        if((now) / time > 1) {
            now = 0;
            if(reverse) {
                var temp = from;
                from = to;
                to = temp;
            }
        }
        return mix(from, to, (now) / time);
    }
}

function switchProgram(program) {
    gl.useProgram(program);
    programs.current = program;

    attribLoc.cameraPosition = gl.getUniformLocation(program, "cPosition");
    attribLoc.projection = gl.getUniformLocation(program, "projectionMat");
    attribLoc.modelView = gl.getUniformLocation(program, "modelViewMat");
    attribLoc.diffuse = gl.getUniformLocation(program, "diffuseProduct");
    attribLoc.ambient = gl.getUniformLocation(program, "ambientProduct");
    attribLoc.specular = gl.getUniformLocation(program, "specularProduct");
    attribLoc.lightPosition = gl.getUniformLocation(program, "lPosition");
    attribLoc.shininess = gl.getUniformLocation(program, "shininess");
    attribLoc.normalMat = gl.getUniformLocation(program, "normalMat");
    attribLoc.cameraModelView = gl.getUniformLocation(program, "cameraMV");
    attribLoc.texture = gl.getUniformLocation(program, "textureMap");
    attribLoc.oColor = gl.getUniformLocation(program, "oColor");

    attribLoc.position = gl.getAttribLocation(program, 'vPosition');
    attribLoc.normal = gl.getAttribLocation(program, 'vNormal');
    attribLoc.textureCoord = gl.getAttribLocation(program, "vTexCoord");
}

function setupBoard() {
    var table = makeModel({ 
        vertices : flatten([vec3(-200,-1,-200), vec3(-200,-1,200), vec3(200,-1,200), vec3(200,-1,-200), vec3(-200,-1,-200), vec3(200,-1,200)]), 
        normals : flatten([vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0)]), 
        n : 2,}, 
        'table');
    table.mesh.material.specular = vec4(1.0,1.0,1.0,1.0);
    table.mesh.material.ambient = vec4(3,3,3,3);
    table.mesh.setTexture(document.getElementById("table"), new Float32Array([0,0, 0,1, 1,1, 1,0, 0,0, 1,1]));

    var chessboard = makeModel({ 
        vertices : flatten([vec3(-64,0,-64), vec3(-64,0,64), vec3(64,0,64), vec3(64,0,-64), vec3(-64,0,-64), vec3(64,0,64)]), 
        normals : flatten([vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0)]), 
        n : 2,}, 
        'board');
    chessboard.mesh.material.specular = vec4(1,1,1,1.0);
    chessboard.mesh.material.ambient = vec4(2,2,2,2);
    chessboard.mesh.setTexture(document.getElementById("grid"), new Float32Array([0,0, 0,1, 1,1, 1,0, 0,0, 1,1]));
    table.addChild(chessboard);

    square = makeModel({ 
        vertices : flatten([vec3(-10,0.1,-10), vec3(-10,0.1,10), vec3(10,0.1,10), vec3(10,0.1,-10), vec3(-10,0.1,-10), vec3(10,0.1,10)]), 
        normals : flatten([vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0), vec3(0,1,0)]), 
        n : 2,}, 
        'square');
    var col = vec4(0.0,0.4,0.0,1);
    square.mesh.material = new Material(col,col,col, 0.01);
    square.transform.position = positions[7][7];
    square.position = [7,7];
    square.transform.scale = vec3(0.8,0.8,0.8);
    square.active = false;
    chessboard.addChild(square);


    var rook = makeRook(chessboard);
    rook.transform.position = positions[0][0];
    
    white.rook[0] = new Piece('w', 'r', [0,0], rook);
    rook = makeRook(chessboard);
    rook.transform.position = positions[7][0];
    
    white.rook[1] = new Piece('w', 'r', [7,0], rook);
    rook = makeRook(chessboard);
    rook.transform.position = positions[0][7];
    
    black.rook[0] = new Piece('b', 'r', [0,7], rook);
    rook = makeRook(chessboard);
    rook.transform.position = positions[7][7];
    
    black.rook[1] = new Piece('b', 'r', [7,7], rook);

    var king = makeKing(chessboard);
    king.transform.position = positions[4][0];
    white.king = new Piece('w', 'k', [4,0], king);
    king = makeKing(chessboard);
    king.transform.position = positions[4][7];
    black.king = new Piece('b', 'k', [4,7], king);

    var queen = makeQueen(chessboard);
    queen.transform.position = positions[3][0];
    white.queen = new Piece('w', 'q', [3,0], queen);
    queen = makeQueen(chessboard);
    queen.transform.position = positions[3][7];
    black.queen = new Piece('b', 'q', [3,7], queen);

    var bishop = makeBishop(chessboard);
    bishop.transform.position = positions[2][0];
    bishop.transform.rotation = vec3(0,180,0);
    white.bishop[0] = new Piece('w', 'b', [2,0], bishop);
    bishop = makeBishop(chessboard);
    bishop.transform.position = positions[5][0];
    bishop.transform.rotation = vec3(0,180,0);
    white.bishop[1] = new Piece('w', 'b', [5,0], bishop);
    bishop = makeBishop(chessboard);
    bishop.transform.position = positions[2][7];
    black.bishop[1] = new Piece('b', 'b', [2,7], bishop);
    bishop = makeBishop(chessboard);
    bishop.transform.position = positions[5][7];
    black.bishop[0] = new Piece('b', 'b', [5,7], bishop);

    var knight = makeKnight(chessboard);
    knight.transform.position = positions[1][0];
    knight.transform.rotation = vec3(0,-90,0);
    white.knight[0] = new Piece('w', 'kn', [1,0], knight);
    knight = makeKnight(chessboard);
    knight.transform.position = positions[6][0];
    knight.transform.rotation = vec3(0,-90,0);
    white.knight[1] = new Piece('w', 'kn', [6,0], knight);
    knight = makeKnight(chessboard);
    knight.transform.position = positions[1][7];
    knight.transform.rotation = vec3(0,90,0);
    black.knight[0] = new Piece('b', 'kn', [1,7], knight);;
    knight = makeKnight(chessboard);
    knight.transform.position = positions[6][7];
    knight.transform.rotation = vec3(0,90,0);
    black.knight[1] = new Piece('b', 'kn', [6,7], knight);;

    for(var i = 0; i < 8; i++) {
        var pawn = makePawn(chessboard);
        pawn.transform.position = positions[i][1];
        white.pawns[i] = new Piece('w', 'p', [i,1], pawn);
        pawn = makePawn(chessboard);
        pawn.transform.position = positions[i][6];
        black.pawns[i] = new Piece('b', 'p', [i,6], pawn);
    }

    setMaterials();
}

function makeRook(board) {
    var rook = makeModel(gModels.Rook, 'rook');
    rook.transform.default = findMV(vec3(-57,0,0), vec3(-90,0,0), vec3(0.3,0.3,0.3));
    board.addChild(rook);
    return rook;
}

function makeKing(board) {
    var king = makeModel(gModels.King, 'king');
    king.transform.default = findMV(vec3(-6,0,0), vec3(-90,0,0), vec3(0.3,0.3,0.3));
    board.addChild(king);
    return king;
}

function makeQueen(board) {
    var queen = makeModel(gModels.Queen, 'queen');
    queen.transform.default = findMV(vec3(-20,0,0), vec3(-90,0,0), vec3(0.3,0.3,0.3));
    board.addChild(queen);
    return queen;
}

function makeBishop(board) {
    var bishop = makeModel(gModels.Bishop, 'bishop');
    bishop.transform.default = findMV(vec3(-34,0,0), vec3(-90,0,0), vec3(0.3,0.3,0.3));
    board.addChild(bishop);
    return bishop;
}

function makeKnight(board) {
    var knight = makeModel(gModels.Knight, 'knight');
    knight.transform.default = findMV(vec3(-45,0,0), vec3(-90,0,0), vec3(0.3,0.3,0.3));
    board.addChild(knight);
    return knight;
}

function makePawn(board) {
    var pawn = makeModel(gModels.Pawn, 'pawn');
    pawn.transform.default = findMV(vec3(-69,0,0), vec3(-90,0,0), vec3(0.3,0.3,0.3));
    board.addChild(pawn);
    return pawn;
}

function setMaterials() {
    var bcolor = vec4(0.3,0.3,0.3,1.0);
    var vspec = vec4(1,1,1,1.0);
    var sh = 200;
    black.queen.object.mesh.material = new Material(bcolor, bcolor, vspec, sh);
    black.king.object.mesh.material = new Material(bcolor, bcolor, vspec, sh);
    black.pawns.forEach(piece => piece.object.mesh.material = new Material(bcolor, bcolor, vspec, sh));
    black.rook.forEach(piece => piece.object.mesh.material = new Material(bcolor, bcolor, vspec, sh));
    black.bishop.forEach(piece => piece.object.mesh.material = new Material(bcolor, bcolor, vspec, sh));
    black.knight.forEach(kn => kn.object.mesh.material = new Material(bcolor, bcolor, vspec, sh));

    pieces.push(black.queen, black.king, white.queen, white.king);
    pieces.push(...black.rook, ...white.rook, ...black.bishop, ...white.bishop);
    pieces.push(...black.knight, ...white.knight, ...black.pawns, ...white.pawns);
}

function createPickBuffer() {
    pickTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, pickTexture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, vWIDTH, vHEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);    
    gl.texParameteri( 
        gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );    
    gl.texParameteri( 
        gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
        gl.NEAREST );

    var pickRenderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, pickRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, vWIDTH, vHEIGHT);

    pickFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, pickFrameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, pickRenderBuffer);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');
}

function compare(a, b) {
    return a.length && b.length && a.length == b.length && a[0] == b[0] && a[1] == b[1];
}
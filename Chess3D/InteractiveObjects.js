// Kyle Price
// 201707320
//
// Containers and useful function for storing and
// drawing meshes. 
// Also manipulating camera postion and rotation

class Piece {
    constructor(color, type, position, object) {
        this.color = color;
        this.type = type;
        this.position = position;
        this.object = object;
        this.object.piece = this;
        this.active = true;
        this.timesMoved = 0;
    }

    kill() {
        this.active = false;
        this.object.active = false;
    }

    unkill() {
        this.active = true;
        this.object.active = true;
    }

    move(f,r) {
        this.position = [f,r];
        this.object.transform.position = positions[f][r];
    }
}

class Object {
    constructor(tag) {
        this.mesh = new Mesh(tag, this);
        this.transform = new Transform();
        this.children = [];
        this.active = true;
        this.piece = null;
    }

    draw(cameraMV) {
        if(!this.active) { return; }
        var mv = this.transform.getMV();
        this.mesh.draw(mv, cameraMV);
        this.children.forEach(c => c.drawChild(mv, cameraMV));
    }

    drawChild(parentMV, cameraMV) {
        if(!this.active) { return; }
        var mv = mult(parentMV, this.transform.getMV());
        this.mesh.draw(mv, cameraMV);
        this.children.forEach(c => c.drawChild(mv, cameraMV));
        if(this.mesh.tag == 'square') {
            this.transform.scale = vec3(0.7,0.7,0.7);
            square.moves.forEach(m => {
                this.transform.position = positions[m[0]][m[1]];
                mv = mult(parentMV, this.transform.getMV());
                this.mesh.draw(mv, cameraMV);
            });
            this.transform.scale = vec3(0.8,0.8,0.8);
        }
    }

    drawPick() {
        if(!this.active) { return; }
        var mv = this.transform.getMV();
        if(!(this.mesh.tag == 'board' || this.mesh.tag == "table" || this.mesh.tag == "square")) {
            this.mesh.drawPick(mv, this.piece);
        }
        this.children.forEach(c => c.drawChildPick(mv));
    }
    drawChildPick(parentMV) {
        if(!this.active) { return; }
        var mv = mult(parentMV, this.transform.getMV());
        if(!(this.mesh.tag == 'board' || this.mesh.tag == "table" || this.mesh.tag == "square")) {
            this.mesh.drawPick(mv, this.piece);
        } else if (this.mesh.tag == 'board') {
            for(var f = 0; f < 8; f++) {
                for(var r = 0; r < 8; r++) {
                    square.transform.position = positions[f][r];
                    var smv = mult(mv, square.transform.getMV());
                    square.mesh.drawPick(smv, {position : [f,r]});
                }
            }
        }
        this.children.forEach(c => c.drawChildPick(mv));
    }

    addChild(object) {
        this.children.push(object);
    }

    removeChild(object) {
        for( var i = 0; i < arr.length; i++){ 
            if ( arr[i] === object) { 
                arr.splice(i, 1); 
            }
        }
    }
}

class Mesh {
    constructor(tag, object) {
        this.tag = tag;
        this.normalBuffer = null;
        this.vertexBuffer = null;
        this.length = 0;
        this.material = new Material();
        this.texture = null;
        this.texCoords = null;
        this.object = object;
    }

    setNormals(normals) {
        this.normalBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    }

    setPoints(vertices) {
        this.vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    setModel(model) {
        this.setNormals(model.normals);
        this.setPoints(model.vertices);
        this.length = model.n;
    }

    setTexture(texture, texCoords) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);

        this.texCoords = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoords);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    }

    setMaterial(color) {
        if(color.type == "Vec4")
            this.material = new Material(color);
        else 
        {
            this.material = color;
        }
    }

    drawPick(mv, piece) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(attribLoc.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLoc.position);

        gl.uniformMatrix4fv(attribLoc.modelView, false, flatten(mv));
        gl.uniform4fv(attribLoc.oColor, flatten(vec4(piece.position[0] / 16 + 1/256, piece.position[1] / 16 + 1/256, !piece.color ? 0.0 : piece.color == 'b' ? 0.2 : 0.5, 1)));

        gl.drawArrays(gl.TRIANGLES, 0, this.length * 3);

        gl.disableVertexAttribArray(attribLoc.position);
    }

    draw(mv, cameraMV) {
        if(this.object.piece != null && GOOCH_SHADING) {
            switchProgram(programs.gooch);
        }
        else if(this.texture != null) {
            switchProgram(programs.texture);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoords);
            gl.vertexAttribPointer(attribLoc.textureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attribLoc.textureCoord);

            gl.activeTexture(gl.TEXTURE0);

            gl.bindTexture(gl.TEXTURE_2D, this.tag == 'board' && SHOWPICK ? pickTexture : this.texture);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
            gl.uniform1i(attribLoc.texture, 0);
        } else if(programs.current != programs.flat) {
            switchProgram(programs.flat);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(attribLoc.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLoc.position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(attribLoc.normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLoc.normal);        

        var nMat = normalMatrix(mv, true);

        gl.uniform4fv(attribLoc.cameraPosition, flatten(camera.getPosition()));
        gl.uniformMatrix4fv(attribLoc.projection, false, flatten(proj));
        gl.uniformMatrix4fv(attribLoc.modelView, false, flatten(mv));
        gl.uniformMatrix4fv(attribLoc.cameraModelView, false, flatten(cameraMV));
        gl.uniformMatrix3fv(attribLoc.normalMat, false, flatten(nMat));
            
        if(programs.current == programs.gooch) {
            gl.uniform4fv(attribLoc.lightPosition, flatten([].concat(lights.map(v => v.position))));
            gl.uniform4fv(attribLoc.oColor, flatten(this.material.diffuse));
        } else {
            var li = [];
            for(var i = 0; i < lights.length; i++) {
                li.push(lightMaterialProduct(lights[i], this.material));
            }
            
            gl.uniform4fv(attribLoc.diffuse, flatten([].concat(li.map(v => v.diffuse))));
            gl.uniform4fv(attribLoc.specular, flatten([].concat(li.map(v => v.specular))));
            gl.uniform4fv(attribLoc.ambient, flatten([].concat(li.map(v => v.ambient))));
            gl.uniform1f(attribLoc.shininess, new Float32Array([this.material.shininess]));
            gl.uniform4fv(attribLoc.lightPosition, flatten([].concat(lights.map(v => v.position))));
        }
        gl.drawArrays(gl.TRIANGLES, 0, this.length * 3);

        gl.disableVertexAttribArray(attribLoc.position);
        gl.disableVertexAttribArray(attribLoc.normals);
        if(this.texture != null) {
            gl.disableVertexAttribArray(attribLoc.textureCoord);
        }
    }


}

class Transform {
    constructor(position = [0,0,0], rotation = [0,0,0], scale = [1,1,1]) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.default = mat4();
    }

    getMV() {
        var trans = translate(this.position[0], this.position[1], this.position[2]);
        var rot = mult(rotateX(this.rotation[0]), mult(rotateY(this.rotation[1]), rotateZ(this.rotation[2])));
        var sc = scale(this.scale[0], this.scale[1], this.scale[2]);
        var mv = mult(trans, rot);
        mv = mult(mv, sc);
        mv = mult(mv, this.default);
        return mv;
    }
}

function findMV(position, rotation, scaled) {
    var trans = translate(position[0], position[1], position[2]);
    var rot = mult(rotateX(rotation[0]), mult(rotateY(rotation[1]), rotateZ(rotation[2])));
    var sc = scale(scaled[0], scaled[1], scaled[2]);
    var mv = mult(trans, rot);
    mv = mult(mv, sc);
    return mv;
}

class Camera {
    constructor(position, rotation) {
        this.position = position;
        this.rotation = rotation;
    }

    getPosition() {
        return vec4(this.position[0], this.position[1], this.position[2], 1.0);
    }

    getMV() {
        var cameraT = translate(-this.position[0], -this.position[1], -this.position[2]);
        var cameraR = mult(rotateX(-this.rotation[0]), 
                    mult(rotateY(-this.rotation[1]), rotateZ(-this.rotation[2])));
        return mult(cameraR, cameraT);
    }

    forward(speed) {
        var f = vec4(0,0,-1,0);
        var dir = this.findDirection(speed, f);
        this.position = add(this.position, vec3(dir[0], dir[1], dir[2]));
    }

    backward(speed) {
        var f = vec4(0,0,1,0);
        var dir = this.findDirection(speed, f);
        this.position = add(this.position, vec3(dir[0], dir[1], dir[2]));
    }
    
    left(speed) {
        var f = vec4(-1,0,0,0);
        var dir = this.findDirection(speed, f);
        this.position = add(this.position, vec3(dir[0], dir[1], dir[2]));
    }

    right(speed) {
        var f = vec4(1,0,0,0);
        var dir = this.findDirection(speed, f);
        this.position = add(this.position, vec3(dir[0], dir[1], dir[2]));
    }

    findDirection(speed, angle) {
        var cameraR = mult(rotateX(this.rotation[0]), 
        mult(rotateY(this.rotation[1]), rotateZ(this.rotation[2])));
        var f = normalize(mult(cameraR, angle));
        f = mult(speed, f);
        return f;
    }
}

function makeModel(model, tag) {
    var object = new Object(tag);
    object.mesh.setModel(model);
    var c = vec4(0.8,0.8,0.8,1.0);
    object.mesh.setMaterial(new Material(c,c,vec4(0.1,0.1,0.1,1), 200));
    object.transform.scale = vec3(1, 1, 1);
    object.transform.rotation = vec3(0, 0, 0);
    object.transform.position = vec3(0,0,0);
    meshes.push(object);
    return object;
}

function quad (vert, normals, points, items, smooth = false) {
    if(items.length != 4) throw "wrong number of items";
    var a = items[0], b = items[1], c = items[2], d = items[3];
    var toAdd = [c,b,a,d,c,a];
    var normal =  normalize(cross(subtract(points[b], points[a]), subtract(points[c], points[b])));
    if (smooth) {
        toAdd = new Set(toAdd);
        for(var v of toAdd) {
            normals[v].push(normal);
        }
    } else {
        for(var v of toAdd) {
            vert.push(points[v]);
            normals.push(normal);
        }
    }
}

function triangle(vert, normals, points, items, smooth = false) {
    if(items.length != 3) throw "wrong number of items";
    var a = items[0], b = items[1], c = items[2];
    var toAdd = [c,b,a];
    var normal =  normalize(cross(subtract(points[b], points[a]), subtract(points[c], points[b])));
    if (smooth) {
        toAdd = new Set(toAdd);
        for(var v of toAdd) {
            normals[v].push(normal);
        }
    } else {
        for(var v of toAdd) {
            vert.push(points[v]);
            normals.push(normal);
        }
    }
}
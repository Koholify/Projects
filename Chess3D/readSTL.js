gModels = {
    Pawn : null,
    Rook : null,
    Knight : null,
    Bishop : null,
    Queen : null,
    King : null,
}

async function LoadModels() {
    await readSTLFile("./Models/rook.stl", 'Rook')
    .then(await readSTLFile("./Models/knight.stl", 'Knight'))
    .then(await readSTLFile("./Models/bishop.stl", 'Bishop'))
    .then(await readSTLFile("./Models/queen.stl", 'Queen'))
    .then(await readSTLFile("./Models/king.stl", 'King'))
    .then(await readSTLFile("./Models/pawn.stl", 'Pawn'))
    .then(() => init());
}

async function readSTLFile(file, ptr) {
    return await _readSTLFile(file).then(result => {gModels[ptr] = result;});
}
async function _readSTLFile(file)
{
    var enc = new TextDecoder('utf-8');
    return await fetch(file)
    .then(response => response.arrayBuffer())
    .then(buffer => {
        console.log(enc.decode(buffer.slice(0,80)));
        var n = new Uint32Array(buffer.slice(80,84))[0];
        console.log(file, n);
        var vertices = new Float32Array(n * 3 * 3);
        var normals = new Float32Array(n * 3 * 3);
        for(var i = 0; i < n; i++)
        {
            var st = 84 + i * 50;
            var vals = new Float32Array(buffer.slice(st, st + 48));
            for(var nor = 0; nor < 3; nor++)
            {
                normals[i * 9 + nor] = -vals[nor];
                normals[i * 9 + nor + 3] = -vals[nor];
                normals[i * 9 + nor + 6] = -vals[nor];
            }
            for(var ver = 0; ver < vals.length - 3; ver++)
            {
                vertices[i * 9 + ver] = vals[ver + 3];
            }
        }

        return {
            vertices : vertices,
            normals : normals,
            n : n,
        };
    });
}
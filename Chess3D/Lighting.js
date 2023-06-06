// Kyle Price
// 201707320
class Light {
    constructor(pos, diffuse, ambient, specular) {
        if(arguments.length == 0) {
            this.on = false;
            this.diffuse = vec4(0,0,0,1);
            this.ambient = vec4(0,0,0,1);
            this.specular = vec4(0,0,0,1);
            this.position = vec4(0,0,0,1);
        } else if (arguments.length == 4) {
            this.on = true;
            this.position = pos;
            this.diffuse = diffuse;
            this.ambient = ambient;
            this.specular = specular;
        } else {
            this.on = true;
            this.diffuse = vec4(1,1,1,1);
            this.ambient = vec4(1,1,1,1);
            this.specular = vec4(1,1,1,1);
            this.position = pos;
        }
    }

    getVal() {
        if(this.on) {
            return {
                ambient : this.ambient,
                diffuse : this.diffuse,
                specular: this.specular
            };
        } else {
            return {
                ambient : vec4(0,0,0,1),
                diffuse : vec4(0,0,0,1),
                specular: vec4(0,0,0,1)
            };
        }
    }
}

class Material {
    constructor(ambient, diffuse, specular, shininess) {
        if(arguments.length == 4) {
            this.ambient = ambient;
            this.diffuse = diffuse;
            this.specular = specular;
            this.shininess = shininess;
        } else if (arguments.length == 1) {
            this.ambient = vec4(0.1,0.1,0.1,0);
            this.diffuse = mult(0.4, arguments[0]);
            this.specular = mult(0.8, arguments[0]);
            this.shininess = 1;
        } else {
            this.ambient = vec4(1,1,1,1);
            this.diffuse = vec4(1,1,1,1);
            this.specular = vec4(1,1,1,1);
            this.shininess = 1;
        }
    }
}

function lightMaterialProduct(light, material) {
    var ll = light.getVal();
    return {
        ambient : mult(ll.ambient, material.ambient),
        diffuse : mult(ll.diffuse, material.diffuse),
        specular: mult(ll.specular, material.specular)
    };
}
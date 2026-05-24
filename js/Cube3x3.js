export class Cube3x3 {

    constructor(scene){

        this.scene = scene;
        this.group = new THREE.Group();

        this.cubies = [];

        this.createCube();

        this.scene.add(this.group);
    }

    createCube(){

        const spacing = 1.05;

        for(let x=-1;x<=1;x++){
            for(let y=-1;y<=1;y++){
                for(let z=-1;z<=1;z++){

                    const geo =
                        new THREE.BoxGeometry(.95,.95,.95);

                    const mat =
                        new THREE.MeshStandardMaterial({
                            color: new THREE.Color(
                                Math.random(),
                                Math.random(),
                                Math.random()
                            )
                        });

                    const cube =
                        new THREE.Mesh(geo,mat);

                    cube.position.set(
                        x*spacing,
                        y*spacing,
                        z*spacing
                    );

                    this.group.add(cube);
                    this.cubies.push(cube);
                }
            }
        }
    }

    scramble(){

        gsap.to(this.group.rotation,{
            x:Math.PI*2,
            y:Math.PI*2,
            duration:2
        });

    }

    solve(){

        gsap.to(this.group.rotation,{
            x:0,
            y:0,
            z:0,
            duration:2
        });

    }
}

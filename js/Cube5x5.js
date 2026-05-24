export class Cube5x5{

    constructor(scene){

        this.scene = scene;
        this.group = new THREE.Group();

        console.log("5x5 Loaded");

        scene.add(this.group);
    }

    scramble(){}

    solve(){}
}

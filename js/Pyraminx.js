export class Pyraminx{

    constructor(scene){

        this.scene = scene;
        this.group = new THREE.Group();

        console.log("Pyraminx Loaded");

        scene.add(this.group);
    }

    scramble(){}

    solve(){}
}

export class TutorialEngine{

    constructor(){

        this.steps = [

            {
                title:"White Cross",
                desc:"Create the white cross first."
            },

            {
                title:"White Corners",
                desc:"Insert white corner pieces."
            },

            {
                title:"Middle Layer",
                desc:"Solve the middle edges."
            }

        ];

        this.current = 0;
    }

    next(){

        if(this.current < this.steps.length-1){
            this.current++;
        }

        return this.steps[this.current];
    }

    prev(){

        if(this.current > 0){
            this.current--;
        }

        return this.steps[this.current];
    }
}

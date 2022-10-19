import utils from "./utils.min.js";
export default class steps {
    constructor(obj){
        this.step = 0;
        this.size = Number(obj.size);
        this.container = obj.container;
    }
    addSize(value){
        this.size += Number(value);
    }
    display(){
        let ul = document.createElement("ul");
        ul.className = "steps is-balanced has-gaps is-medium is-horizontal has-content-above has-content-centered";
        for(let i=0;i<this.size;i++){
            let li = utils.create("li",{className:"steps-segment"});
            let span = document.createElement("span");
            if(i === this.step){
                span.className = "steps-marker is-hollow";
                span.innerHTML = this.step+1;
                li.appendChild(span);
                //let div = utils.create("div",{className:"steps-content",innerHTML:this.step+1});
                //li.appendChild(div);
                li.className += " is-active";
            } else {
                span.className = "steps-marker";
                li.appendChild(span);
                /*let div = document.createElement("div");
                div.innerHTML = "&nbsp;";
                div.className = "steps-content";
                li.appendChild(div);*/
            }
            ul.appendChild(li);
        }
        if(this.container.hasChildNodes()){
            let node = this.container.childNodes[0];
            this.container.replaceChild(ul, node);
        } else {
            this.container.appendChild(ul);
        }
    }
    nextStep(){
        this.step++;
        this.display();
        if(this.step >= this.size)
            return false;
        return this.step;
    }
}
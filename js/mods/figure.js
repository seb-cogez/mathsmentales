import utils from "./utils.min.js";
// Figures
export default class Figure {
    constructor(obj, id, target, size){
        this.type = obj.type;
        this.content = obj.content;
        this.boundingbox = obj.boundingbox;
        this.axis = obj.axis;
        this.grid = obj.grid;
        this.id = id;
        this.keepAspect = (obj.keepAspect!==undefined)?obj.keepAspect:true;
        this.size = size;//[w,h]
        this.imgSrc = obj.imgSrc||false;
        this.figure = undefined;
        this.displayed = false;
        this.create(target);
    }
    /**
     * construct de destination DOM element
     * @param {destination} destination DOMelement
     */
    create(destination){
        if(this.type === "chart"){
            let div = utils.create("div",{id:"div-dest-canvas-"+this.id});
            let canvas = document.createElement("canvas");
            canvas.id = this.id;
            if(this.size !== undefined){
                div.style.width = this.size[0]+"px";
                div.style.height = this.size[1]+"px";
            }
            div.appendChild(canvas);
            destination.appendChild(div);
        } else if(this.type === "graph"){
            let div = document.createElement("div");
            div.id=this.id;
            div.className = "jsxbox fig";
            destination.appendChild(div);
        } else if(this.type === "svg"){
            let div = document.createElement("div");
            div.id=this.id;
            destination.appendChild(div);
        }
    }
    /**
     * Crée une copie de la figure dans une nouvelle instance
     * @param {Figure} figure instance d'une figure
     * @returns false si figure n'est pas une instance de figure, sinon la nouvelle instance
     */
    static copyFig(figure, target){
        if(!figure instanceof Figure){
            return false;
        }
        return new this(
                figure,
                figure.id,
                target,
                figure.size
            );
    }
    /**
     * Affiche / cache le graphique dans le corrigé
     */
    toggle(){
        let elt;
        if(this.type ==="chart")
            elt = document.getElementById(this.id).parentNode;
        else if(this.type ==="graph" || this.type === "svg")
            elt = document.getElementById(this.id);
        let cln = elt.className; // div contenant
        if(cln.indexOf("visible")<0){
            utils.addClass(elt,"visible");
            this.display();
        } else {
            utils.removeClass(elt,"visible");
        }
    }
    /**
     * Crée la figure
     * @param {window object} destination 
     * @returns nothing if displayed yet
     */
    display(destination){
        if(this.displayed) return;
        else this.displayed = true;
        // destination is the window destination object if defined
        if(this.type === "svg"){
            let target;
            if(destination === undefined){
                target = document.getElementById(this.id);
                //this.figure = new Chart(target, this.content);
            } else {
                target = destination.document.getElementById(this.id);
                //this.figure = new destination.Chart(target, this.content);
            }
            target.innerHTML = this.content;
        } else if(this.type === "chart"){ // Chart.js
            let target;
            if(destination === undefined){
                target = document.getElementById(this.id);
                //this.figure = new Chart(target, this.content);
            } else {
                target = destination.document.getElementById(this.id);
                //this.figure = new destination.Chart(target, this.content);
            }
            //debug("Chart data", target, utils.clone(this.content));
            this.figure = new Chart(target, this.content);
        } else if(this.type === "graph"){ //JSXGraph
            try{
                //debug(this);
                if(destination === undefined){
                    this.figure = JXG.JSXGraph.initBoard(this.id, {boundingbox:this.boundingbox, keepaspectratio: this.keepAspect, showNavigation: false, showCopyright: false,registerEvents:false, axis:this.axis, grid:this.grid});
                } else {
                    this.figure = destination.JXG.JSXGraph.initBoard(this.id, {boundingbox:this.boundingbox, keepaspectratio: this.keepAspect, showNavigation: false, showCopyright: false,registerEvents:false, axis:this.axis, grid:this.grid});
                }
                let content = utils.clone(this.content);
                let elements = [];
                // content est un tableau de tableaux à 2, 3 ou 4 éléments
                // le premier contient le type d'élément à créer
                // le 2e contient la "commande", généralement un tableau de 2 coordonnées, ou éléments
                // le 3e contient les options pour la création (affichage, taille, ...)
                // le 4e contient la référence à un élément précédemment créé pour l'utiliser dans la commande.
                // pour ce 4e, il faut bien compter les contents en partant de zéro.
                for(let i=0,len=content.length;i<len;i++){
                    let type = content[i][0];
                    let commande = content[i][1];
                    let options = false;
                    let reference = false;
                    if(content[i][2] !== undefined)
                        options = content[i][2];
                    if(content[i][3] !== undefined){
                        reference = elements[content[i][3]];
                        // normalement, il faut remplacer la référence dans la commande
                        commande.forEach(function(elt,index){
                            if(typeof elt === "string")
                                if(elt.indexOf("ref")===0){
                                    commande[index] = elements[Number(elt.substr(3))];
                                }
                        })
                    }
                    if(type === "functiongraph"){
                        let formule = commande;
                        if(!options)
                            this.figure.create("functiongraph", [function(x){return eval(formule)}], {strokeWidth:2});
                        else
                            this.figure.create("functiongraph", [function(x){return eval(formule)}], options);
                    } else if(type==="jessiescript") {
                        if(this.figure.jc === undefined){
                            this.figure.jc = new JXG.JessieCode();
                            this.figure.jc.use(this.figure);
                        }
                        this.figure.jc.parse(commande);
                    } else if(["text", "point","axis", "line", "segment", "angle", "polygon", "transform","intersection"].indexOf(type)>-1){
                        if(!options)
                            elements[i] = this.figure.create(type, commande);
                        else
                            elements[i] = this.figure.create(type,commande,options);
                    }
                }
            } catch(error){
                utils.debug("Figure", error, this);
            }
        }
    }
}

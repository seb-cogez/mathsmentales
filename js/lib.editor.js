/**
         * classe de paramètres, globaux ou locaux
         */
 class parameters {
    constructor(id){
        this.id=id
        this.buttonContent = null
        this.content = null
        this.consts=null
        this.vars=null
        this.question=null
        this.shortQ=null
        this.answer=null
        this.value=null
        this.keys=null
        this.figure=null
        this.nbvars = 0
        this.nbconsts = 0
        this.modals = {}
        this.options=null
        this.panelList = {"Constantes":"consts","Variables":"vars","Question":"question","Question courte":"shortQ","Réponse":"answer","Valeur attendue":"value","Figure":"figure","Clavier":"keys"}
        this.createButtons()
        this.createActions()
    }
    /**
     * export : retourne le json des paramètres.
     */
    export(){
        return false;
    }
    /**
     * import : récupère les paramètres d'un fichier json
     */
    import(){
        return false
    }
    // création des boutons de création des panneaux de paramétrage des données
    createButtons(){
        let container = document.getElementById(this.id);
        let divButtons = document.createElement("div");
        divButtons.id=this.id+"Buttons";
        divButtons.className="paramsButtons";
        for(const z in this.panelList){
            let span = document.createElement("span");
            span.innerText=z;
            divButtons.appendChild(span)
        }
        container.appendChild(divButtons);
        this.buttonContent = divButtons;
        let div = document.createElement("div");
        div.id = this.id+"Content";
        container.appendChild(div)
        this.content = document.getElementById(div.id);
    }
    addLine(el,type=false){
        let elementType = el.dataset.data;
        let line = `<div class="champ" contenteditable="true"> <div>`;
        if(elementType==="consts")
            line = `<div class="ligne"><span class="nom" contenteditable="true" title="Nom unique"> </span><span class="valedit"><span class="value" title="valeur" contenteditable="true"></span><span class='supprthis' contenteditable="false">-</span></span><button> + </button></div>`;
        else if(elementType==="vars"){
            if(!type)
                line = `<div class="ligne"><span class="nom" contenteditable="true" title="Nom unique"> </span><span class="value" title="Valeur/formule" contenteditable="true"> </span></div>`;
            else if(type === "liste"){
                line = `<div class="ligne"><span class="nom" contenteditable="true" title="Nom unique"> </span><span class="valedit"><span class="value" title="valeur" contenteditable="true"></span><span class='supprthis' contenteditable="false">-</span></span><button> + </button></div>`;
            }
            else if(type === "entier"){
                line = `<div class="ligne"><span class="nom" contenteditable="true" title="Nom unique"> </span>
                min :<span class="min" title="minimum" contenteditable="true"></span>
                max : <span class="max" title="maximum" contenteditable="true"></span>
                qté : <span class="qty" title="Nombre de valeurs" contenteditable="true"></span>
                éviter : <span class="avoid" title="Valeurs à éviter, séparées de virgules. & : pas de doublon, prime : pas de nb premier" contenteditable="true"></span>
                </div>`;
            }
            else if(type === "decimal"){
                line = `<div class="ligne"><span class="nom" contenteditable="true" title="Nom unique"> </span>
                min :<span class="min" title="minimum" contenteditable="true"></span>
                max : <span class="max" title="maximum" contenteditable="true"></span>
                préc : <span class="precision" title="Précision, en nombre après la virgule (peut être négatifs pour les dizaines, ceintaires...)" contenteditable="true"></span>
                qté : <span class="qty" title="Nombre de valeurs" contenteditable="true"></span>
                éviter : <span class="avoid" title="Valeurs à éviter, séparées de virgules. & : pas de doublon, prime : pas de nb premier" contenteditable="true"></span>
                </div>`;
            }
        }
        el.innerHTML +=line;
    }
    createActions(){
        this.content.onblur = (evt)=>{
            console.log(evt.target);
        }
        this.content.onclick = (evt)=>{
            if(evt.target.innerHTML==="+"){
                // ajout d'une ligne
                this.addLine(evt.target.parentNode.parentNode)
            } else if(evt.target.innerHTML===" × "){
                // suppression de la variable
                if(confirm("Ceci va supprimer toutes les donnéess de "+evt.target.parentNode.firstChild.nodeValue+".\nConfirmer ?")){
                    let el = evt.target.parentNode.parentNode; // el = le fieldset
                    this[el.dataset["data"]]=null;
                    el.parentNode.removeChild(el);
                }
            } else if(evt.target.innerHTML === " + "){
                // ajout d'un champ
                let spancontainer = document.createElement("span");
                spancontainer.className = "valedit";
                let span = document.createElement("span");
                span.className = "value";
                span.title = "valeur";
                span.contentEditable = true;
                let supprthis = document.createElement("span");
                supprthis.className ="supprthis";
                supprthis.innerHTML ="-";
                supprthis.contentEditable = false;
                spancontainer.appendChild(span);
                spancontainer.appendChild(supprthis);
                let el = evt.target.parentNode; // le div contenant le bouton;
                el.insertBefore(spancontainer,el.children[el.children.length-1])
            } else if(evt.target.className === "supprthis"){
                let el = evt.target.parentNode;
                el.parentNode.removeChild(el);
            }
        }
        this.buttonContent.onclick = (evt)=>{
            let type = evt.target.innerText;
            this.createPanel(type)
            switch(type){
                case "Constantes" :
                    break;
                case "Variables" :
                    break;
                default:
                    return false;
            }
        }
    }
    /**
     * 
     */
    createPanel(label){
        let shortID = this.panelList[label];
        if(this[shortID] !== null) return;
        this[shortID] = {};
        let fieldset = document.createElement("fieldset");
        fieldset.classList.add("add");
        fieldset.id = this.id+shortID;
        fieldset.dataset["data"] = shortID;
        let legend = document.createElement("legend");
        legend.innerText = label;
        fieldset.appendChild(legend)
        let button = document.createElement("button");
        button.innerHTML="+"
        let close = document.createElement("button");
        close.className = "close"
        close.innerHTML = " × "
        switch(shortID){
            case "consts" :
                legend.appendChild(button);
                break;
            case "vars" :
                legend.appendChild(button);
                break;
            case "question" :
                legend.appendChild(button);
                break;
            case "shortQ" :
                legend.appendChild(button);
                break;
            case "answer" :
                legend.appendChild(button);
                break;
            case "value" :
                break;
            case "keys" :
                break;
            case "figure" :
                legend.appendChild(button);
                break;
            default:
                console.log("panel non créé")
        }
        legend.appendChild(close)
        this.addLine(fieldset);
        this.content.appendChild(fieldset)
    }
}
class subActivity{
    constructor(titre){
        this.title = String(titre);
        this.params = new parameters();
    }
}
class activity {
    constructor(){
        this.id = "global"
        this.title="My Title"
        this.description=""
        this.dest=[]
        this.ID="developpement"
        this.type="latex"
        this.params = new parameters(this.id)
        this.options = null
    }
    set typeAct(value){
        if(["text","latex"].indexOf(value)>-1)
            this.type = value
        else return false;
    }
    get typeAct(){
        return this.type
    }
    addSection(){
        if(this.options===null){
            this.options=[]
        }
        let block = document.createElement("blockquote")
        block.id = "section"+this.options.length
        document.getElementById("options").appendChild(block);
        this.options.push(new section(block.id))
    }
};
class section {
    constructor(id){
        this.id = id
        this.sectionName = null
        this.params = new parameters(id)
    }
    set name(name){
        this.sectionName = name
    }
    get name(){
        return this.sectionName
    }
    /**
     * delete the section
     */
    remove(){
        
    }
}
/**
 * class modal : crée une fenêtre de choix
*/
class modal{
    /**
     * @param (String) type : type d'élèment à créer.
     * @param (String) id : id de la fenêtre modale, égal à l'id du paramètre
     * @param (function) func : fonction feedback quand on cliquer sur le bouton valider.
     */
    constructor(type,id,func){
        this.type = type;
        this.id = id;
        this.createWindow()
        this.feedback = func
    }
    createWindow(nom,id){
        this.fen = document.createElement("div");
        this.fen.id = this.id;
        this.fen.innerHTML = `
        <button class="fermer" onclick="document.getElementById('${this.id}').classList.add('closed')"> × </button>
        Nom : <input type="text" id="nom" value="${nom?nom:''}" placeholder='Nom de la ${this.type}.'><br>
        Type : <select>
            <option>tableau</option>
            <option>entier aléatoire</option>
            <option>décimal aléatoire</option>
            <option>chaine</option>
            </select><br>
            <button onclick="">Valider</button>
        `
        this.fen.classList.add("modal");
        document.body.appendChild(this.fen);
    }
    open(){
        document.getElementById(this.id).classList.remove('closed');
    }
    destroy(){
        this.fen.parentNode.removeChild(this.fen);
    }
}
let act
window.onload = ()=>{
    act = new activity()
    document.getElementById("btnAddSection").onclick = ()=>{
        act.addSection();
    }
}

import protos from './mods/protos.js';
import utils from './mods/utils.js';
import common from './mods/common.js';
import cart from './mods/cart.js';
import Figure from './mods/figure.js';
const MM={}
const content = document.getElementById("creator-content");
const parameters = {};
let separationFiches = false;
document.getElementById("creator-menu").onclick = (evt)=>{
    if(evt.target.id === "toggleCorriges"){
        if(parameters.posCorrection==="fin"){
            parameters.posCorrection = "apres";
            evt.target.innerHTML = "séparé";
        } else {
            parameters.posCorrection = "fin";
            evt.target.innerHTML = "suivant";
        }
        refresh();
    } else if(evt.target.id === "btnChangeBorder"){
        changeBorder(evt.target.checked)
    } else if(evt.target.id === "btndisplayfig"){
        displayFigures('all')
    } else if(evt.target.id === "btndisplayeval"){
        displayEval()
    } else if(evt.target.id.indexOf("btnorder")===0){
        changeOrder(evt.target.id.substr(8));
    } else if(evt.target.id.indexOf("btndisplayfig")===0){
        displayFigures(Number(evt.target.id.substr(13)));
    }
}
document.getElementById("creator-menu").oninput = (evt)=>{
    if(evt.target.id.indexOf("fsize")===0){
        changeFontSize(Number(evt.target.id.substr(5)),evt.target.value);
    } else if(evt.target.id.indexOf("asize")===0){
        changeWidth(Number(evt.target.id.substr(5)),evt.target.value);
    } else if(evt.target.id.indexOf("selpos")===0){
        setDispositionReponse(Number(evt.target.id.substr(6)),evt.target.value);
    } else if(evt.target.id.indexOf("ansWidth"===0)){
        changeAnswerWidth(evt.target.id.substr(8),evt.target.value);
    }
}

document.getElementById("nbFiches").oninput = (evt)=>{
    if(evt.target.id ==="nbFiches"){
        parameters.nb = evt.target.value;
    }
    refresh();
}
document.getElementById("inputheight").oninput = (evt)=>{
    changeHeight(evt.target.value);
}
document.getElementById("fsize").oninput = (evt)=>{
    changeAllFontSize(evt.target.value);
}
document.getElementById("setAnswerAllPos").oninput = (evt)=>{
    setDispositionReponseAll(evt.target.value);
}
document.getElementById("colorpicker").oninput = (evt)=>{
    changeColor(evt.target.value,'bg');
    //evt.target.value="#ECECEC";
}
document.getElementById("colorpicker2").oninput = (evt)=>{
    changeColor(evt.target.value,'bd');
    document.getElementById("btnChangeBorder").checked = true;
    //evt.target.value="#707070";
}
document.getElementById("colorpickertitle").oninput = (evt)=>{
    changeColor(evt.target.value,'bgt');
    //evt.target.value="#CCCCCC"
}
document.getElementById("colorpickertitle").oncontextmenu = (evt)=>{
    changeColor("",'bgt',true);
    evt.target.value="#CCCCCC";
}
/*
let exercicesColumn = Array(${nbcols}).fill("column");
let nbcols = ${nbcols};
/*
* change la hauteur des cases réponses, et de l'élément question si réponse dessous plutôt que dessus
*/
function changeHeight(nb){
    let elts = document.querySelectorAll(".ans");
    for(let i=0;i<elts.length;i++){
        elts[i].style.height = nb+"pt";
    }
}
/**
 * function from https://codepen.io/andreaswik/pen/YjJqpK/
 * @param {*} color 
 * @returns 
 */
function lightOrDark(color) {
    let r,g,b,hsp;
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
  
      // If HEX --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
  
      r = color[1];
      g = color[2];
      b = color[3];
    } 
    else {
      // If RGB --> Convert it to HEX: http://gist.github.com/983661
      color = +("0x" + color.slice(1).replace( 
        color.length < 5 && /./g, '$&$&'
      )
               );
      r = color >> 16;
      g = color >> 8 & 255;
      b = color & 255;
    }
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
    );
    // Using the HSP value, determine whether the color is light or dark
    if (hsp>127.5) {
      return 'light';
    } 
    else {
      return 'dark';
    }
  }
/*
* change la taille des caractères d'une colonne
*/
function changeFontSize(dest,value){
    // il peut y avoir plusieurs sujets, donc on doit faire un traitement multiple
    let elts = document.querySelectorAll(".question"+dest);
    for(let i=0;i<elts.length;i++){
        elts[i].style.fontSize = value+"pt";
    }
}
/*
* change la taille des caractères de toutes les colonnes
*/
function changeAllFontSize(value){
    let elts = document.querySelectorAll(".quest");
    for(let i=0;i<elts.length;i++){
        elts[i].style.fontSize = value+"pt";
    }
    // synchros des autres champs
    document.querySelectorAll("#textSizes input").forEach(el=>{el.value=value});
}
/*
* change la disposition des lignes d'exercices d'une colonne
* dest : id de la colonne où changer la place des réponses.
* (String) how : column/columnv pour colonnes en ligne ou verticales
*/
function setDispositionReponse(dest,how){
    // il peut y avoir plusieurs sujets, donc on doit faire un traitement multiple
    let elts = document.querySelectorAll(".col"+dest);
    if(how==="row"){
        elts.forEach(el=>{
            el.classList.remove("column");
        })  
        changeAnswerWidth(dest,document.getElementById("ansWidth"+dest).value)
    } else {
        elts.forEach(el=>{
            el.classList.add("column");
        })
        changeAnswerWidth(dest,100)
    }
}
/*
* Change la disposition de toutes les lignes d'exercices
*/
function setDispositionReponseAll(how){
    let elts = document.querySelectorAll(".ceinture .grid .flex");
    let selindex = 1;
    if(how==="row"){
        elts.forEach(el=>{
            el.classList.remove("column");
        })
        selindex = 0;
        document.querySelectorAll(".answidth").forEach(el=>{
            changeAnswerWidth(el.id.substring(8),el.value)
        })
    }
    else {
        elts.forEach(el=>{
            el.classList.add("column");
        })
        changeAnswerWidth("s","100",false)
    }
    // on met les valeurs des autres input à cette valeur
    let inputs = document.querySelectorAll(".selectpos");
    for(let i=0;i<inputs.length;i++){
        inputs[i].selectedIndex = selindex;
    }
}
/*
* Change la largeur des colonnes
*/
function changeWidth(dest,nb){
    let elts = document.querySelectorAll(".ceinture-content");
    if(elts[0].style["grid-template-columns"].indexOf("auto")>-1){
        for(let i=0;i<elts.length;i++){
            let stylecols = elts[i].style["grid-template-columns"].split(" ");
            let style = Array(stylecols.length).fill("1fr").join(" ");
            elts[i].style["grid-template-columns"] = style;
        }
    }
    for(let i=0;i<elts.length;i++){
        let style = elts[i].style["grid-template-columns"];
        let stylecols = style.split(" ");
        stylecols[dest-1] = nb+"fr";
        style = stylecols.join(" ");
        elts[i].style["grid-template-columns"] = style;
    }
}
function changeAnswerWidth(dest,width,changevalues=true){
    if(dest === "s"){ // tous les champs
        document.querySelectorAll(".ceinture .flex:not(.column) .ans").forEach(el=>{
            el.style["width"] = width+"%";
        })
        document.querySelectorAll(".ceinture .flex.column .ans").forEach(el=>{
            el.style["width"]="";
        })
        if(changevalues)
            document.querySelectorAll(".answidth").forEach(el=>{el.value=width});
    } else {
        document.querySelectorAll(".ceinture .col"+dest+".flex:not(.column) .ans").forEach(el=>{
            el.style["width"] = width+"%";
        })
        document.querySelectorAll(".ceinture .col"+dest+".flex.column .ans").forEach(el=>{
            el.style["width"] = "";
        })
    }
}
/*
* change la couleur du fond des réponses
* what : bg (background) || bd (border)
*/
function changeColor(hexa,what,reset=false){
    let styleAttr = "background-color";
    let styleVal = hexa;
    if(what !=="bgt"){
        let elts = document.querySelectorAll(".ans");
        if(what==="bd"){
            parameters.colorbd = hexa;
            styleAttr="border";
            if(hexa==="none")styleVal = "none";
            else styleVal="1pt solid "+hexa;
        } else if(what === "bg") {
            parameters.colorbg = hexa;
        }
        for(let i=0;i<elts.length;i++){
            elts[i].style[styleAttr] = styleVal;
        }
    } else if(what==="bgt"){
        if(!reset){
            parameters.colorbgt = hexa;
        }else {
            parameters.colorbgt = "";
        }
        let lumen = lightOrDark(parameters.colorbgt);
        document.querySelectorAll(".ceinture-titre").forEach(el=>{
            el.style[styleAttr] = parameters.colorbgt;
            if(lumen === "dark"){
                el.style["color"] = "white"
            } else {
                el.style["color"] = "";
            }
        })
    }
}
/** 
* Change la couleur du cadre des réponses
*
*/
function changeBorder(bool){
if(bool){
    changeColor(document.getElementById("colorpicker2").value,'bd');
} else {
    changeColor('none','bd');
}
}
/**
* Change l'ordre d'une colonne 
* (Integer) colId : numéro entier de la colonne (commence par 1)
*/
function changeOrder(colId){
    // on récupère l'ensemble des tableaux
    let tableaux = document.querySelectorAll(".ceinture-content");
    for(let i=0;i<tableaux.length;i++){
        // on récupère les celulles de la colonne choisie:
        let cels = tableaux[i].querySelectorAll(".col"+colId);
        let cles,start=0;
        if(cels[0].classList.contains("ceinture-titre-colonne")){
            cels[0].style["grid-row"]=1;
            start = 1;
            // on crée un tableau des clés de lignes
            cles = [...Array(cels.length-1)].map((a,b)=>b+2);
        } else {
            // on crée un tableau des clés de lignes
            cles = [...Array(cels.length)].map((a,b)=>b+1);
        }
        // on mélange les clés
        cles.sort(()=>Math.random()-0.5);
        // on met les celulles dans l'ordre
        for(let j=start;j<cels.length;j++){
            cels[j].style["grid-row"]=cles[j-start];
        }
    }
}
/**
* Affiche ou pas les figures dans la colonne
* */
function displayFigures(idcol){
    let btn, elts;
    if(idcol === 'all'){
        btn = document.getElementById('btndisplayfig');
        elts = document.querySelectorAll('div.flex');
        idcol = "Toutes";
    } else {
        btn = document.getElementById('btndisplayfig'+idcol);
        elts = document.querySelectorAll('.col'+idcol);
    }
    if(btn.innerHTML === idcol+" on"){
        elts.forEach(el=>{
            el.classList.add("nofig");
        })
        btn.innerHTML = idcol+" off";
    } else {
        elts.forEach(el=>{
            el.classList.remove("nofig");
        })
        btn.innerHTML = idcol+" on";
    }
}
/*
* toggle l'affichage de l'espace d'évaluation de la ceinture
*/
function displayEval(){
    let btn=document.getElementById("btndisplayeval"), headers = document.querySelectorAll(".ceinture-header");
    if (btn.innerHTML ==="Évaluation"){
        btn.innerHTML = "sans Éval";
        headers.forEach(el=>{
            el.classList.add("evaluation")
        })
    } else {
        btn.innerHTML ="Évaluation";
        headers.forEach(el=>{
            el.classList.remove("evaluation")
        })
    }
}
function makePage(){
    content.innerHTML = "";
    MM.memory = {};
    if(parameters.alea){
        common.setSeed(parameters.alea);
    }
    let correction;
    if(parameters.posCorrection === "fin"){
        correction = utils.create("div",{id:"correction",className:"pagebreak"});
        correction.appendChild(utils.create("div",{innerHTML:"Correction"}));
    }
    // recréation des boutons individuels de dimensions
    let textSizes = document.getElementById("textSizes");
    let colSizes = document.getElementById("columnsWidth");
    let shuffleOrders = document.getElementById("columnsShuffles");
    let figuresDisp = document.getElementById("figuresDisplay");
    let dispositionsAns = document.getElementById("answersPositions");
    let answersSizes = document.getElementById("answersSizes");
    textSizes.innerHTML = "";
    colSizes.innerHTML = "";
    shuffleOrders.innerHTML = "";
    figuresDisp.innerHTML = "";
    dispositionsAns.innerHTML = "";
    answersSizes.innerHTML = "";
    for(let i=0;i<parameters.nbcols;i++){
        textSizes.innerHTML +=`<input id="fsize${i+1}" value="10" title="Taille énoncé colonne ${i+1}" type="number" size="3" min="8" max="16" step="0.5"></input>`;
        colSizes.innerHTML += `<input id="asize${i+1}" value="1" title="Taille colonne ${i+1}" type="number" size="3" min="0.5" max="4" step="0.1">`
        shuffleOrders.innerHTML += `<button id="btnorder${i+1}">${i+1}</button>`
        figuresDisp.innerHTML += `<button id="btndisplayfig${i+1}">${i+1} on</button>`;
        dispositionsAns.innerHTML += `<select id="selpos${i+1}" class="selectpos">
        <option value="row">à côté</option>
        <option value="column">dessous</option>
        </select>`;
        answersSizes.innerHTML += `<input type="number" class="answidth" id="ansWidth${i+1}" value="20" min="0" max="100" size="3" step="5">`
    }
    // on crée autant de ceintures que demandées      
    for(let qty=0;qty<parameters.nb;qty++){
        // un conteneur pour la ceinture
        let ceinture = utils.create("div",{className:"ceinture"});
        // un conteneur pour le corrigé
        let corrige = utils.create("div",{className:"ceintCorrige corrige"});
        common.generateQuestions(parameters);
        let header = utils.create("div",{className:"ceinture-header evaluation"});
        // Entêtes
        let bloc1 = utils.create("div",{className:"border-black ceinture-titre", innerHTML:parameters.titreCeinture});
        let bloc2 = utils.create("div",{className:"border-black", innerHTML:"NOM :<br>Classe :"});
        let cleseed = "";
        if(parameters.ceintprintToEnonce)cleseed = "Clé : "+MM.seed+"<br> ";
        let bloc3 = utils.create("div",{className:"border-black", innerHTML:cleseed+"grille "+(qty+1)});
        let blocevaluation = utils.create("div",{className:"border-black evaluation",innerHTML:"□ Validée<br>□ non Validée"})
        header.appendChild(bloc1);
        header.appendChild(bloc2);
        header.appendChild(blocevaluation);
        header.appendChild(bloc3);
        ceinture.appendChild(header);
        // entête du corrigé
        if(parameters.ceintprintToCorrige)cleseed = "Clé : "+MM.seed+" / ";
        else cleseed="";
        corrige.appendChild(utils.create("div",{innerHTML:parameters.titreCeinture+"<br>"+cleseed+"grille : "+(qty+1), className:"border-black"}));
        // un repère de colonne
        let colsid=0;
        // le css directement dans le DOM pour pouvoir le modifier ensuite
        let stylecols = Array(parameters.nbcols).fill("1fr").join(" ");
        let stylecolscorrection = Array(parameters.nbcols).fill("auto").join(" ");
        let stylerows = Array(parameters.nbrows).fill("auto").join(" ");
        const divColonnes = utils.create("div",{className:"ceinture-content grid",style:"grid-template-columns:"+stylecols+";grid-template-rows:"+(stylerows+1)});
        let divColsCorrige = utils.create("div",{className:"ceinture-corrige grid",style:"grid-template-columns:"+stylecolscorrection+";grid-template-rows:"+stylerows});
        // conteners corrections et enoncés (objet de tableaux)
        let divCorr={},cols={};
        let nbq = 0;
        for(let i=0;i<parameters.cart.activities.length;i++){
            const activity = parameters.cart.activities[i];
            for(let j=0;j<activity.questions.length;j++){
                if(nbq%parameters.nbrows === 0){
                    // nouvelle colonne
                    colsid++;
                    cols[colsid]=[];
                    // on donne  à la colonne une classe pour pouvoir modifier des choses dedans.
                    divCorr[colsid]=[]
                    if(!_.isEmpty(parameters.titres)){
                        let titre = parameters.titres[colsid-1]?parameters.titres[colsid-1]:"";
                        cols[colsid].push(utils.create("div",{innerHTML:titre,className:"ceinture-titre-colonne border-black col"+colsid,style:"grid-column:"+colsid}))
                    }
                }
                nbq++;
                let ligne = utils.create("div",{className:"flex border-black col"+colsid,style:"grid-column:"+colsid});
                let divQuestion = utils.create("div",{className:"valign"});
                let ligneCorr = utils.create("div",{className:"grid border-black"});
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let divq = utils.create("div",{className:"question"+colsid+" quest"});
                    let span = utils.create("span",{className:"math", innerHTML:activity.shortQuestions[j]||activity.questions[j]});
                    divq.appendChild(span);
                    divQuestion.appendChild(divq);
                } else {
                    divQuestion.appendChild(utils.create("div",{innerHTML:activity.shortQuestions[j]||activity.questions[j],className:"question"+colsid+" quest"}));
                }
                if(activity.figures[j] !== undefined){
                    let divfig = utils.create("div",{className:"fig"});
                    divQuestion.appendChild(divfig),
                    MM.memory[qty+"-"+"f"+i+"-"+j] = new Figure(utils.clone(activity.figures[j]), qty+"-"+"f"+i+"-"+j,divfig);
                }
                ligne.appendChild(divQuestion);
                let value = activity.values[j];
                if(Array.isArray(value))value=value[0];
                let spanc = utils.create("span", {className:"math", innerHTML:value});
                ligneCorr.appendChild(spanc);
                divCorr[colsid].push(ligneCorr);
                let divans = utils.create("div",{className:"bg-grey ans answer"+colsid,style:"height:20pt;"});
                ligne.appendChild(divans);
                cols[colsid].push(ligne);
                if(nbq%parameters.nbrows === 0 && parameters.nbrows>0){
                    if(parameters.pied !== ""){
                        cols[colsid].push(utils.create("div",{innerHTML:parameters.pied,className:"ceinture-pied-colonne border-black"}));
                    }
                }
            }
        }
        // on insère les enfants
        for(let i=0;i<cols[1].length;i++){
            for(let j=1;j<=parameters.nbcols;j++){
                divColonnes.appendChild(cols[j][i]);
            }
        }
        ceinture.appendChild(divColonnes);
        content.appendChild(ceinture);

        for(let i=0;i<divCorr[1].length;i++){
            for(let j=1;j<=parameters.nbcols;j++){
                divColsCorrige.appendChild(divCorr[j][i]);
            }
        }
        corrige.appendChild(divColsCorrige);
        if(parameters.posCorrection === "fin")
            correction.appendChild(corrige);
        else {
            content.appendChild(corrige);
        }
    }
    //content.appendChild(utils.create("div",{className:"footer"}));
    // on ajoute la correction à la fin.
    if(parameters.posCorrection ==="fin")
        content.appendChild(correction);
    if(parameters.colorbd !== undefined){
        changeColor(parameters.colorbd,'bd');
    }
    if(parameters.colorbg !== undefined){
        changeColor(parameters.colorbg,'bg');
    }
    if(!utils.isEmpty(MM.memory)){
        setTimeout(function(){
            for(const k in MM.memory){
                if(k!=="dest")
                    MM.memory[k].display();
            }
        }, 300);
    }
}
function refresh(){
    makePage()
    common.mathRender()
    content.oninput = (evt)=>{
        if(evt.target.nodeName.toLowerCase()==="input"){
            changecols(evt.target.dataset.dest,evt.target.value)
        }
    }
}

function checkURL(urlString){
    const vars = utils.getUrlVars(urlString);
    if(vars.embed !== undefined){
        // cas d'une activité embeded, on vérifie que l'url est conforme
        let expression = 
/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        let regex = new RegExp(expression);
        if(vars.embed.match(regex))
            MM.embededIn = vars.embed;
    }
    if(vars.c!==undefined){ // présence de carts MM v2 à lancer ou éditer
        // le seed d'aléatorisation est fourni et on n'est pas en mode online
        if(vars.a){
            parameters.alea = vars.a;
        } else {
            parameters.alea = common.setSeed();
        }
        // paramètres des activités des paniers
        let json = vars.c;
        // parametres globaux :
        parameters.nb=Number(vars.n);
        parameters.posCorrection=vars.cor;
        parameters.titreCeinture=vars.t?decodeURI(vars.t):"Ceinture";
        parameters.nbcols=Number(vars.nc);
        parameters.nbrows=Number(vars.nr);
        parameters.ceintprintToEnonce=eval(vars.ke);
        parameters.ceintprintToCorrige=eval(vars.kc);
        parameters.titres = [];
        parameters.pied = decodeURI(vars.pie)||"";
        parameters.orientation = vars.or;
        for(let i=0;i<5;i++){
            if(vars["t"+i]!==undefined && vars["t"+i]!==false){
                parameters.titres[i]=decodeURIComponent(vars["t"+i]);
            }
        }
        // Affectation de la valeur au nombre de feuilles
        document.getElementById("nbFiches").value = parameters.nb;
        // alcarts contient des promises qu'il faut charger
        parameters.cart = new cart(0);
        parameters.cart.import(json[0],false).then(()=>{
            refresh()
        }).catch(err=>{
            // erreur à l'importation :(
            let alert=utils.create("div",
            {
                id:"messageerreur",
                className:"message",
                innerHTML:"Impossible de charger le panier :(<br>"+err
            });
            document.getElementById("tab-accueil").appendChild(alert);
        });
    }
}
checkURL();
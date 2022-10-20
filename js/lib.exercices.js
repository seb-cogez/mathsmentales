import protos from './mods/protos.min.js';
import utils from './mods/utils.min.js';
import common from './mods/common.min.js';
import cart from './mods/cart.min.js';
import Zoom from './mods/zoom.min.js';
import Figure from './mods/figure.min.js';

const MM={};
const content = document.getElementById("creator-content");
const parameters = {};
let separationFiches = false;
let zoom;
document.getElementById("creator-menu").onclick = (evt)=>{
    if(evt.target.dataset.what === "in"){
        zoom.plus();
    } else if(evt.target.dataset.what === "out"){
        zoom.minus();
    } else if(evt.target.id ==="btn-break"){
        pagebreak();
    } else if(evt.target.id === "fichesSeparation"){
        if(separationFiches){
            separationFiches = false;
            document.getElementById(evt.target.id).innerText = "Séparer";
            document.querySelectorAll("footer").forEach(elt=>{elt.className = ""})
        } else {
            separationFiches = true;
            document.getElementById(evt.target.id).innerText = "Regrouper";
            document.querySelectorAll("footer").forEach(elt=>{elt.className = "break"})
        }
    } else if(evt.target.id==="toggleCorriges"){
        let lesCorriges = document.querySelectorAll("ol.corrige");
        if(evt.target.innerHTML === " ▼ "){
            evt.target.innerHTML = " ▲ ";
            lesCorriges.forEach(el=>{el.classList.remove("hidden")});
            document.querySelectorAll(".correction").forEach(el=>{el.classList.remove("noprint");})
            document.querySelectorAll(".correction .titreCorrection").forEach(el=>{el.classList.remove("noprint")});
        } else {
            evt.target.innerHTML = " ▼ ";
            document.querySelectorAll(".correction").forEach(el=>{el.classList.add("noprint");})
            document.querySelectorAll(".correction .titreCorrection").forEach(el=>{el.classList.add("noprint")});
            lesCorriges.forEach(el=>{el.classList.add("hidden")});
        }
    }
}
document.getElementById("creator-menu").oninput = (evt)=>{
    if(evt.target.id === "nbFiches"){
        setNumberFiches(evt.target.value);
    }
}
/**
 * gestion des click sur les éléments pour afficher les corrections
 */
document.getElementById("creator-content").onclick = (evt)=>{
    if(evt.target.id.indexOf("idCorrige")===0){
        let target = document.getElementById(evt.target.id.replace("idCorrige","corrige"));
        if(target.classList.toggle("hidden")){
            document.getElementById(evt.target.id).classList.add("noprint");
        } else {
            document.getElementById(evt.target.id).classList.remove("noprint");
        }
    } else if(evt.target.id.indexOf("titreExo")===0){ // arrive sur le titre de l'exo ou le titre du corrigé.
        let target = document.getElementById(evt.target.id.replace("titreExo","corrige"));
        if(target.classList.toggle("hidden")){
            // on cache
            document.querySelector(".correction #"+evt.target.id).classList.add("noprint");
            // seulement si tous les éléments sont invisibles
            let invisible = true;
            document.querySelectorAll(".correction .titreCorrection").forEach(el=>{if(!el.classList.contains("noprint")){invisible=false}});
            if(invisible)
                document.querySelectorAll(".correction").forEach(el=>{el.classList.add("noprint");})
        } else {
            document.querySelector(".correction #"+evt.target.id).classList.remove("noprint");
            document.querySelectorAll(".correction").forEach(el=>{el.classList.remove("noprint");})
        }
    }
}
function setNumberFiches(nb){
    parameters.nb = Number(nb);
    refresh();
}
function changecols(dest,nb){
    document.querySelectorAll("."+dest).forEach((el)=>{el.className=dest+" grid g"+nb})
    // on met à jour les autres boutons
    document.querySelectorAll("[data-dest="+dest+"]").forEach((el)=>{el.value=nb})
};
function pagebreak(){
    let cor = document.querySelectorAll('.correction'),
    btn = document.getElementById('btn-break');
    if(!cor[0].classList.contains("pagebreak")){
        for(let i=0;i<cor.length;i++){
            cor[i].classList.add("pagebreak");
        }
        btn.innerText='même feuille';
    } else {
        for(let i=0;i<cor.length;i++){
            cor[i].classList.remove("pagebreak");
        }
        btn.innerText='à part';
    }
}
function makePage(){
    if(parameters.alea){
        common.setSeed(parameters.alea);
    }
    content.innerHTML = "";
    if(parameters.positionCorrection === "end" && !document.getElementById('btn-break')){
        document.getElementById('btpCorrigePlace').appendChild(utils.create("button",{id:"btn-break",innerText:"à part",title:"Ne pas mettre sur la même feuille que le sujet"}))
    }
    MM.memory = {};
    for(let qty=0;qty<parameters.nb;qty++){
        common.generateQuestions(parameters);
        // si plus d'une interro, on introduit un pagebreak
        if(qty>0)
            content.appendChild(utils.create("footer"));
        // set elements :
        let aleaCode = utils.create("div",{className:"floatright",innerHTML:"Clé : "+common.seed+" p."+(qty+1)});
        content.appendChild(aleaCode);
        // get the titlesheet
        let sheetTitle = parameters.titreFiche||"Fiche d'exercices";
        // set the titlesheet
        let header = utils.create("header",{innerHTML:sheetTitle});
        content.appendChild(header);
        // get the exercice title
        let exTitle = parameters.titreExercices||"Exercice n°";
        // get the position of the correction
        let correctionContent = utils.create("div",{className:"correction noprint", id:"divcorrection"+qty});
        if(parameters.positionCorrection === "end"){
            let titleCorrection = utils.create("header", {className:"clearfix",innerHTML:"Correction des exercices"});
            correctionContent.appendChild(titleCorrection);
        }
        // in case of figures
        // create a shit because of the li float boxes
        let divclear = utils.create("div", {className:"clearfix"});
        for(let i=0;i<parameters.cart.activities.length;i++){
            const activity = parameters.cart.activities[i];
            let sectionEnonce = utils.create("section",{id:"enonce"+qty+"-"+i,className:"enonce"});
            //let sectionCorrection = utils.create("section",{id:"corrige"+qty+"-"+i});
            let input = `<input id="nbcols${qty}-${i}" data-dest="exo${i}" class="noprint fright" value="2" title="Nb de colonnes" type="number" size="2" min="1" max="6">`;
            sectionEnonce.innerHTML += input;
            let h3 = utils.create("h3", {className:"exercice-title pointer",innerHTML:exTitle+(i+1)+" : "+activity.title,id:"titreExo"+qty+"-"+i});
            sectionEnonce.appendChild(h3);
            let ol = utils.create("ol",{id:"ol"+qty+"-"+i,className:"grid g2 exo"+i});
            let olCorrection = utils.create("ol", {className:"hidden corrige", "id":"corrige"+qty+"-"+i});
            for(let j=0;j<activity.questions.length;j++){
                let li = utils.create("li",{className:"c3"});
                let liCorrection = utils.create("li");
                let answer = (Array.isArray(activity.answers[j]))?activity.answers[j][0]:activity.answers[j];
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let span = utils.create("span",{className:"math", innerHTML:activity.questions[j]});
                    let spanCorrection = utils.create("span", {className:"math",innerHTML:answer});
                    li.appendChild(span);
                    liCorrection.appendChild(spanCorrection);
                } else {
                    li.innerHTML = activity.questions[j];
                    liCorrection.innerHTML = answer;
                }
                ol.appendChild(li);
                // figures
                if(activity.figures[j] !== undefined){
                    //if(i===0 && j=== 0)MM.memory["dest"] = content;
                    MM.memory[qty+"-"+"f"+i+"-"+j] = new Figure(utils.clone(activity.figures[j]), qty+"-"+"f"+i+"-"+j,li);
                }
                olCorrection.appendChild(liCorrection);
            }
            sectionEnonce.appendChild(ol);
            let ds = divclear.cloneNode(true);
            sectionEnonce.appendChild(ds);
            // affichage de la correction
            if(parameters.positionCorrection === "each" ){
                let hr = utils.create("div",{className:"titreCorrection pointer noprint",innerHTML:"Correction",id:"idCorrige"+qty+"-"+i});
                sectionEnonce.appendChild(hr);
                sectionEnonce.appendChild(olCorrection);
            } else if(parameters.positionCorrection === "end"){
                let h3correction = h3.cloneNode(true);
                h3correction.classList.add("titreCorrection","noprint");
                correctionContent.appendChild(h3correction);
                correctionContent.appendChild(olCorrection);
                correctionContent.appendChild(utils.create("div",{className:"clearfix"}));
                //correctionContent.appendChild(sectionCorrection);
            }
            content.appendChild(sectionEnonce);
        }
        if(correctionContent.hasChildNodes){
            content.appendChild(correctionContent);
            let ds = divclear.cloneNode(true);
            content.appendChild(ds);
        }
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
        parameters.tailleTexte=Number(vars.s);
        parameters.nb=Number(vars.n);
        parameters.positionCorrection=vars.cor;
        parameters.titreFiche=decodeURI(vars.t);
        parameters.titreExercices=decodeURI(vars.ex).trim()+" ";
        parameters.enoncesSepares=vars.es||0;
        parameters.corrigeSepare=vars.cs||0;
        parameters.activitesColonnes=vars.cols||[];
        if(!Array.isArray(parameters.activitesColonnes)){
            parameters.activitesColonnes.split("~");
        }
        parameters.corrigesVisibles=vars.cv||[];
        if(!Array.isArray(parameters.corrigesVisibles)){
            parameters.corrigesVisibles.split("~");
        }
        // Affectation de la valeur au nombre de feuilles
        document.getElementById("nbFiches").value = parameters.nb;
        zoom = new Zoom("changeFontSize","#thehtml",true,"pt",parameters.tailleTexte);
        document.getElementById("creator-menu").appendChild(zoom.createCursor());
        document.querySelector("html").style["fontSize"] = parameters.tailleTexte+"pt";
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
        
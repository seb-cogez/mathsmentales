import protos from './mods/protos.js';
import utils from './mods/utils.js';
import common from './mods/common.js';
import cart from './mods/cart.js';
import Zoom from './mods/zoom.js';
import Figure from './mods/figure.js';
import math from './mods/math.js';

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
    } else if(evt.target.id === "btnedit"){
        document.querySelector(".entete").contentEditable = true;
    } else if(evt.target.id ==="btncopy"){
        document.querySelector(".entete").contentEditable = false;
        let content = document.querySelector(".entete").innerHTML;
        document.querySelectorAll(".entete").forEach((el)=>{el.innerHTML = content});
    } else if(evt.target.id === "btnshuffle"){
        shuffleAll();
    } else if(evt.target.id ==="btneditcontent"){
        document.querySelectorAll("table").forEach(el=>{el.contentEditable = true;})
    }
}
document.getElementById("creator-menu").oninput = (evt)=>{
    if(evt.target.id === "nbFiches"){
        setNumberFiches(evt.target.value);
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
    // set elements :
    let aleaCode = utils.create("div",{className:"floatright",innerHTML:"Clé : "+common.seed});
    content.appendChild(aleaCode);
    MM.memory = {};
    let allCorrectionsContent = utils.create("div");
    for(let qty=0;qty<parameters.nb;qty++){
        common.generateQuestions(parameters);
        // si plus d'une fiche, on introduit un pagebreak
        if(qty>0)
            content.appendChild(utils.create("footer",{className:"break"}));
        // get the titlesheet
        let sheetTitle = (parameters.titreFiche||"Course aux nombres")+" "+(qty+1);
        // set the titlesheet
        let header = utils.create("header",{innerHTML:sheetTitle});
        content.appendChild(header);
        let intro = utils.create("section",{className:"entete"});
        intro.appendChild(utils.create("div",{className:"classe fright",innerHTML:"Classe : ________"}));
        intro.appendChild(utils.create("div",{className:"nom",innerHTML:"NOM : ______________________"}));
        intro.appendChild(utils.create("div",{className:"prenom",innerHTML:"Prénom : ___________________"}));
        intro.appendChild(utils.create("div",{className:"duree",innerHTML:"Durée : <b>"+parameters.time+" min</b>"}));
        intro.appendChild(utils.create("div",{className:"info",innerHTML:"<i>L'usage de la calculatrice ou de brouillon est interdit.<br>Seule la réponse doit être écrite.</i>"}));
        // get the col's titles
        let colTitle1 = parameters.titreColonne1||"Énoncé";
        let colTitle2 = parameters.titreColonne2||"Réponse";
        let colTitle3 = parameters.titreColonne3||"Jury";
        // Creation of grids
        let tableenonce = utils.create("table",{id:"tableE"+qty, className:"tablee"});
        let tablecorrection = utils.create("table",{id:"tableC"+qty});
        let theade = utils.create("thead");
        let theadc = utils.create("thead");
        let tre = utils.create("tr");
        let trc = utils.create("tr");
        tre.appendChild(utils.create("th", {innerHTML:"n°"}));
        tre.appendChild(utils.create("th",{innerHTML:colTitle1}));
        tre.appendChild(utils.create("th",{innerHTML:colTitle2}));
        tre.appendChild(utils.create("th",{innerHTML:colTitle3}));
        trc.appendChild(utils.create("th", {innerHTML:"n°"}));
        trc.appendChild(utils.create("th",{innerHTML:colTitle1}));
        trc.appendChild(utils.create("th",{innerHTML:colTitle2}));
        theade.appendChild(tre);
        theadc.appendChild(trc);
        tableenonce.appendChild(theade);
        tablecorrection.appendChild(theadc);
        let tbodye = utils.create("tbody");
        let tbodyc = utils.create("tbody");
        let compteur = 1;
        for(let i=0;i<parameters.cart.activities.length;i++){
            const activity = parameters.cart.activities[i];
            for(let j=0;j<activity.questions.length;j++){
                let tre = utils.create("tr");
                let trc = utils.create("tr");
                // colonne numéro
                tre.appendChild(utils.create("td",{width:"10",innerHTML:compteur+".",className:"right"}));
                trc.appendChild(utils.create("td",{width:"10",innerHTML:compteur+".",className:"right"}));
                compteur++;
                let divenonce = utils.create("td",{width:"50%"})
                let divanswer = utils.create("td",{width:"50%"}); // vide div réponse.
                let divenoncec = utils.create("td",{width:"50%"})
                let divanswerc = utils.create("td",{width:"50%"})
                let answer = (Array.isArray(activity.answers[j]))?activity.answers[j][0]:activity.answers[j];
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let span = utils.create("span",{className:"math", innerHTML:activity.questions[j]});
                    let spanc = utils.create("span",{className:"math", innerHTML:activity.questions[j]});
                    let spanCorrection = utils.create("span", {className:"math",innerHTML:answer});
                    divenonce.appendChild(span);
                    divenoncec.appendChild(spanc);
                    divanswerc.appendChild(spanCorrection);
                } else {
                    divenonce.appendChild(utils.create("span",{innerHTML:activity.questions[j]}));
                    divenoncec.appendChild(utils.create("span",{innerHTML:activity.questions[j]}));
                    divanswerc.appendChild(utils.create("span",{innerHTML:answer}));
                }
                tre.appendChild(divenonce);
                tre.appendChild(divanswer);
                // div jury
                tre.appendChild(utils.create("td"),{width:"10"});
                // figures
                if(activity.figures[j] !== undefined){
                    //if(i===0 && j=== 0)MM.memory["dest"] = content;
                    MM.memory[qty+"-"+"f"+i+"-"+j] = new Figure(utils.clone(activity.figures[j]), qty+"-"+"f"+i+"-"+j,divenonce);
                }
                trc.appendChild(divenoncec);
                trc.appendChild(divanswerc);
                tbodye.appendChild(tre);
                tbodyc.appendChild(trc);
                }
        }
        intro.appendChild(utils.create("div",{className:"info",innerHTML:"L'épreuve comporte <b>"+(compteur-1)+" questions</b>"}));
        content.appendChild(intro);
        tableenonce.appendChild(tbodye);
        content.appendChild(tableenonce);

        tablecorrection.appendChild(tbodyc);
        let correctionContent = utils.create("div",{className:"correction", id:"divcorrection"});
        let titleCorrection = utils.create("header", {className:"clearfix",innerHTML:"Correction de la course n°"+(qty+1)});
        correctionContent.appendChild(titleCorrection);
        correctionContent.appendChild(tablecorrection);

        if(parameters.positionCorrection=== "each"){
            content.appendChild(utils.create("footer",{className:"break"}));
            content.appendChild(correctionContent);
        } else if(parameters.positionCorrection === "end"){
            allCorrectionsContent.appendChild(utils.create("footer",{className:"break"}));
            allCorrectionsContent.appendChild(correctionContent);
        }
    }
    if(allCorrectionsContent.hasChildNodes){
        content.appendChild(allCorrectionsContent);
    }
    if(!parameters.cart.ordered && utils.isEmpty(MM.memory)){
        shuffleAll();
    }
    if(!utils.isEmpty(MM.memory)){
        setTimeout(function(){
            for(const k in MM.memory){
                if(k!=="dest")
                    MM.memory[k].display();
            }
            if(!parameters.cart.ordered){
                shuffleAll();
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
function shuffleAll(){
    document.querySelectorAll(".tablee").forEach((el,key)=>{
        shuffleTable(document.getElementById("tableE"+key),document.getElementById("tableC"+key))
    })
}
function shuffleTable(tablee, tablec){
    if(!tablee || !tablec){
        return false;
    }
    let tbodye = tablee.tBodies[0];
    let rowse = tbodye.rows;
    let tbodyc = tablec.tBodies[0];
    let rowsc = tbodyc.rows
    for(let i=rowse.length;i;i--){
        let index = math.aleaInt(0,i);
        tbodye.appendChild(rowse[index]);
        tbodyc.appendChild(rowsc[index]);
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
    if(vars.c!==undefined){
        if(vars.a){
            parameters.alea = vars.a;
        } else {
            parameters.alea = common.setSeed();
        }
        // paramètres des activités des paniers
        let json = vars.c;
        // parametres globaux :
        parameters.tailleTexte=10.5;
        parameters.nb=Number(vars.n);
        parameters.positionCorrection=vars.cor||"end";
        parameters.titreFiche=decodeURI(vars.t);
        parameters.titreColonne1=decodeURI(vars.t1).trim();
        parameters.titreColonne2=decodeURI(vars.t2).trim();
        parameters.titreColonne3=decodeURI(vars.t3).trim();
        parameters.time=vars.tm||"7";
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
        
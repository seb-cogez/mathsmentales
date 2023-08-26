import protos from './mods/protos.min.js';
import utils from './mods/utils.min.js';
import common from './mods/common.min.js';
import cart from './mods/cart.min.js';
import Zoom from './mods/zoom.min.js';
import Figure from './mods/figure.min.js';
import math from './mods/math.min.js';

const MM={};
const content = document.getElementById("creator-content");
const pageOrientations = ["portrait","paysage"]
const parameters = {};
let pageHeight = 275; // cm
let pageFormat = 0;// portrait

//let zoom;

function changeHeight(nb){
    parameters.cardHeight = Number(nb)
    refresh()
}

function changeWidth(nb){
    parameters.cardWidth = Number(nb)
    refresh()
}

document.getElementById("inputheight").oninput = (evt)=>{
    changeHeight(evt.target.value);
}

document.getElementById("inputwidth").oninput = (evt)=>{
    changeWidth(evt.target.value);
}

document.getElementById('btnRectoVerso').onclick = (evt)=>{
    let btn = evt.target
    if(parameters.disposition === 'both'){
        parameters.disposition = 'separated'
        btn.innerText = 'Impression Recto/Verso'
    } else {
        parameters.disposition = 'both'
        btn.innerText = 'Impression Recto'
    }
    refresh()
}

document.getElementById('identifiant').onchange = (evt)=>{
    const content = evt.target.value
    const cardIds = document.querySelectorAll('.identifiant')
    for (const id of cardIds){
        id.innerText = content
    }
}

function changeOrientation(evt){
    // suppression du style de page précédent
    let pagestyle = document.querySelectorAll("head style")
    for (const style of pagestyle) {
        if(style.innerText.indexOf('MMentales')>-1){
            style.parentNode.removeChild(style);
            const newStyle = utils.create("style");
            if(pageFormat===0){
                newStyle.innerHTML = `/*MMentales*/
                @page{
                    size:A4 landscape;
                    margin:0.8cm;
                }`
                document.body.setAttribute("layout","landscape");
            } else {
                newStyle.innerHTML = `/*MMentales*/
                @page{
                    size:A4 portrait;
                    margin:0.8cm;
                }`
                document.body.removeAttribute("layout");
            }        
            document.head.appendChild(newStyle);
        }
    }
    evt.target.innerHTML = pageOrientations[pageFormat];
    pageFormat = (pageFormat+1)%2;
    refresh()
}

document.getElementById('btnPageOrientation').onclick = (evt)=>{changeOrientation(evt)}

function refresh(){
    if(pageFormat===0)pageHeight=275
    else pageHeight=190
    makePage()
    common.mathRender()
}

function makePage(){
    if(parameters.alea){
        common.setSeed(parameters.alea);
    }
    content.innerHTML = "";
    MM.memory = {};
    common.generateQuestions(parameters);
    let aleaCode = utils.create("div",{className:"floatright",innerHTML:"Clé : "+parameters.alea});
    content.appendChild(aleaCode);
    // set the titlesheet
    let header = utils.create("header",{innerHTML:parameters.titreFiche});
    content.appendChild(header);
    const arrayOfFlashCardsSection = [utils.create("section",{className:"flash-section grid g2"})]
    if(parameters.disposition === 'separated'){arrayOfFlashCardsSection.push(utils.create("section",{className:"flash-section grid g2"}))}
    let currentSection = 0
    let globalPrintHeight = 0
    let nbOfCards = 0
    for (const [index,activity] of parameters.cart.activities.entries()) {
        for(let j=0;j<activity.questions.length;j++){
            if(parameters.disposition === 'separated'){
                nbOfCards++
                if (nbOfCards%2 === 1) {
                    globalPrintHeight += parameters.cardHeight
                }
            } else {
                nbOfCards = nbOfCards+2
                globalPrintHeight += parameters.cardHeight
            }
            const artQuestion = utils.create("article",{className:"flash-question card recto"});
            artQuestion.style.height = parameters.cardHeight+"mm";
            artQuestion.style.width = parameters.cardWidth+"mm";
            artQuestion.appendChild(utils.create('div', {className:'logoq', innerText:'Q'}))
            artQuestion.appendChild(utils.create('div', {className:'identifiant', innerText:document.getElementById('identifiant').value}))
            const divq = utils.create("div");
            const artCorrection = utils.create("article",{className:"flash-reponse card verso"});
            artCorrection.style.height = parameters.cardHeight+"mm";
            artCorrection.style.width = parameters.cardWidth+"mm";
            const divr = utils.create("div");
            if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                const span = utils.create("span",{className:"math", innerHTML:activity.questions[j]});
                const spanCorrection = utils.create("span", {className:"math", innerHTML:activity.answers[j]});
                divq.appendChild(span);
                divr.appendChild(spanCorrection);
            } else {
                divq.innerHTML = activity.questions[j];
                divr.innerHTML = activity.answers[j];
            }
            artQuestion.appendChild(divq);
            // figures
            if(activity.figures[j] !== undefined){
                MM.memory["f"+index+"-"+j] = new Figure(utils.clone(activity.figures[j]), "f"+index+"-"+j, divq);
            }
            artCorrection.appendChild(divr)
            if(globalPrintHeight > pageHeight){
                arrayOfFlashCardsSection.push(utils.create("section",{className:"flash-section grid g2"}))
                currentSection++;
                if(parameters.disposition === 'separated'){
                    arrayOfFlashCardsSection.push(utils.create("section",{className:"flash-section grid g2"}))
                }
                globalPrintHeight = parameters.cardHeight
            }
            let indexWhereInsertQ = currentSection
            let indexWhereInsertA = currentSection
            if(parameters.disposition === 'separated'){
                indexWhereInsertQ = 2*currentSection
                indexWhereInsertA = 2*currentSection+1
            }
            arrayOfFlashCardsSection[indexWhereInsertQ].appendChild(artQuestion)
            arrayOfFlashCardsSection[indexWhereInsertA].appendChild(artCorrection)
        }
    }
    for(const section of arrayOfFlashCardsSection){
        content.appendChild(section)
        if(parameters.disposition === 'separated'){
            const answersSections = document.querySelectorAll('.flash-section:nth-child(even)')
            for(const section of answersSections){
                if(section.childNodes.length%2 === 1){
                    section.appendChild(utils.create('article', {className:'card'}))
                }
                for(let i=1; i<section.childNodes.length; i=i+2){
                    const elem = section.childNodes[i]
                    elem.parentNode.insertBefore(elem, elem.previousSibling)
                }
            }
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
        parameters.disposition=vars.disp||'both';//'both' or 'separated'
        document.getElementById('btnRectoVerso').innerText = parameters.disposition==='both'?'Impression Recto':'Impression Recto/Verso'
        //parameters.nb=Number(vars.n);
        //document.getElementById("nbDominos").value = parameters.nb
        parameters.titreFiche=decodeURI(vars.t);
        //parameters.doublons = eval(vars.d)||false;
        //if(!parameters.doublons)document.getElementById("btnnodoublon").innerHTML = "Doublons"
        // Affectation de la valeur au nombre de feuilles
        //document.getElementById("nbDominos").value = parameters.nb;
        //zoom = new Zoom("changeFontSize","#thehtml",true,"pt",parameters.tailleTexte);
        //document.getElementById("creator-menu").appendChild(zoom.createCursor());
        document.querySelector("html").style["fontSize"] = parameters.tailleTexte+"pt";
        // alcarts contient des promises qu'il faut charger
        parameters.cart = new cart(0);
        parameters.cart.import(json[0],false).then(()=>{
            document.getElementById('inputheight').value = vars.ch||55
            parameters.cardHeight = Number(document.getElementById('inputheight').value)
            document.getElementById('inputwidth').value = vars.cw||85
            changeWidth(document.getElementById('inputwidth').value)
        }).catch(err=>{
            // erreur à l'importation :(
            let alert=utils.create("div",
            {
                id:"messageerreur",
                className:"message",
                innerHTML:"Impossible de charger le panier :(<br>"+err
            });
            document.getElementById("creator-container").appendChild(alert);
        });
    }
}
checkURL();
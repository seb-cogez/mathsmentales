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

document.getElementById("inputheight").oninput = (evt)=>{
    changeHeight(evt.target.value);
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

function createSeparator(target,nbOfCreatedCards){
    if(nbOfCreatedCards%2===0 && parameters.disposition === 'separated'){
        target.appendChild(utils.create("article", {className:'card'}))
    }
    const pageSeparator1 = utils.create("article", {className:'pageSeparator', innerText:'Page suivante'})
    target.appendChild(pageSeparator1)
    const pageSeparator2 = utils.create("article", {className:'pageSeparator'})
    target.appendChild(pageSeparator2)
}

function insertAnswers(answers,target){
    for(let i=1; i<answers.length; i=i+2){
        target.appendChild(answers[i])
        target.appendChild(answers[i-1])
    }
    if(answers.length%2===1){
        target.appendChild(utils.create('article',{className:'card'}))
        target.appendChild(answers[answers.length-1])
    }
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
    let currentSection = 0
    let globalPrintHeight = 0
    let arrayOfAnswers = []
    let nbOfCards = 0
    for (const activity of parameters.cart.activities) {
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
            const divq = utils.create("div");
            const artCorrection = utils.create("article",{className:"flash-reponse card verso"});
            artCorrection.style.height = parameters.cardHeight+"mm";
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
            artCorrection.appendChild(divr)
            if(globalPrintHeight > pageHeight){
                createSeparator(arrayOfFlashCardsSection[currentSection],nbOfCards)
                arrayOfFlashCardsSection.push(utils.create("section",{className:"flash-section grid g2"}))
                currentSection++;
                globalPrintHeight = parameters.cardHeight
                if(parameters.disposition === 'separated'){
                    insertAnswers(arrayOfAnswers,arrayOfFlashCardsSection[currentSection])
                    arrayOfAnswers = []
                    createSeparator(arrayOfFlashCardsSection[currentSection],nbOfCards)
                    arrayOfFlashCardsSection.push(utils.create("section",{className:"flash-section grid g2"}))
                    currentSection++;
                }
            }
            arrayOfFlashCardsSection[currentSection].appendChild(artQuestion);
            // figures
            if(activity.figures[j] !== undefined){
                if(i===0 && j=== 0)MM.memory["dest"] = content;
                MM.memory["f"+i+"-"+j] = new Figure(utils.clone(activity.figures[j]), "f"+i+"-"+j, divq);
            }
            if(parameters.disposition === 'separated'){
                arrayOfAnswers.push(artCorrection)
            } else {
                arrayOfFlashCardsSection[currentSection].appendChild(artCorrection)
            }
        }
        if(arrayOfAnswers.length > 0){
            createSeparator(arrayOfFlashCardsSection[currentSection],nbOfCards+1)
            arrayOfFlashCardsSection.push(utils.create("section",{className:"flash-section grid g2"}))
            currentSection++;
            insertAnswers(arrayOfAnswers,arrayOfFlashCardsSection[currentSection])
        }
    }
    for(const section of arrayOfFlashCardsSection){
        content.appendChild(section)
    }

    if(!utils.isEmpty(MM.memory)){
        setTimeout(function(){
            for(const k in MM.memory){
                if(k!=="dest")
                    MM.memory[k].display(MM.memory["dest"]);
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
            changeHeight(document.getElementById('inputheight').value)    
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
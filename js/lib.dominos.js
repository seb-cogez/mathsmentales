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
let zoom;

document.getElementById("creator-menu").onclick = (evt)=>{
    if(evt.target.dataset.what === "in"){
        zoom.plus();
    } else if(evt.target.dataset.what === "out"){
        zoom.minus();
    } else if(evt.target.id === "btneditcontent"){
        document.querySelector(".dominos-section").contentEditable = true;
    } else if(evt.target.id ==="btnnodoublon"){
        noDoublon();
    } else if(evt.target.id ==="btneditcontent"){
        document.querySelectorAll("table").forEach(el=>{el.contentEditable = true;})
    } else if(evt.target.id === "btnshuffle"){
        melanger();
    } else if(evt.target.id === "deleteImg"){
        replaceFond();
    }
}
document.getElementById("inputwidth").oninput = (evt)=>{
    changewidth(evt.target.value);
}
document.getElementById("inputheight").oninput = (evt)=>{
    changeheight(evt.target.value);
}
document.getElementById("file").onchange = (evt)=>{
    changeFond(evt);
}
document.getElementById("nbDominos").oninput = (evt)=>{
    if(parameters.cart.activities.length === 1){
        parameters.nb = Number(evt.target.value);
        setNumberOfDominos();
        refresh();    
    } else {alert("Plusieurs activités,\nopération impossible.")}
}
function changeFond(evt) {
    var input = evt.target;
    var reader = new FileReader();
    reader.onload = function () {
        replaceFond(reader.result);
    };
    reader.readAsDataURL(input.files[0]);
}
function replaceFond(imgdata){
    let delimgel = document.getElementById("deleteImg");
    if(imgdata === undefined){
        delete MM.bgImg
        document.querySelectorAll(".dominos-carte").forEach(el=>{el.style.backgroundImage = "none"});
        delimgel.style["display"] = "none"
    } else {
        let img = new Image();
        img.src = imgdata
        MM.bgImg = imgdata;
        delimgel.style["display"] = "inline"
        document.querySelectorAll(".dominos-carte").forEach(el=>{el.style.backgroundImage = "url('"+img.src+"')"});
    }
}
function changeheight(nb){
    let elts = document.querySelectorAll(".dominos-carte");
    for(let i=0;i<elts.length;i++){
        elts[i].style.height = nb+"mm";
    }
}
function changewidth(nb){
    let elts = document.querySelectorAll(".dominos-carte");
    for(let i=0;i<elts.length;i++){
        elts[i].style.width = nb+"mm";
    }
}
function setNumberOfDominos(){
    if(parameters.cart.activities.length === 1){
        parameters.cart.activities[0].nbq = parameters.nb;
    }
}
function melanger(){
    let content = document.querySelector(".dominos-section");
    // on récupère l'ensemble des dominos 
    let tableau = document.querySelectorAll(".dominos-carte");
    // on crée un tableau des clés de lignes
    let cles = [...Array(tableau.length)].map((a,b)=>b);
    // on mélange les clés
    cles.sort(()=>Math.random()-0.5);
    // on met les celulles dans l'ordre mélangé
    for(let j=0,l=cles.length;j<l;j++){
        content.removeChild(tableau[cles[j]]);
        content.appendChild(tableau[cles[j]]);
    }
}
function noDoublon(){
    parameters.doublons = !parameters.doublons;
    if(!parameters.doublons){
        document.getElementById("btnnodoublon").innerHTML = "Doublons"
    } else 
        document.getElementById("btnnodoublon").innerHTML = "No Doublons"
    refresh();
    console.log(parameters)
}
function refresh(){
    makePage()
    common.mathRender()
}
function makePage(){
    if(parameters.alea){
        common.setSeed(parameters.alea);
    }
    content.innerHTML = "";
    MM.memory = {};
    setNumberOfDominos();
    let aleaCode = utils.create("div",{className:"floatright",innerHTML:"Clé : "+parameters.alea});
    content.appendChild(aleaCode);
    let sectionCartes = utils.create("section",{className:"dominos-section"});
    let nbOfCards=0;
    common.generateQuestions(parameters);
    let span = document.getElementById("infoErrorDouble")
    if(parameters.errorDouble){
        span.innerHTML = "Impossible de supprimer les doublons"
        span.title = "Les choix d'activité ne permettent pas de générer un ensemble de dominos sans doublon. Diminuer le nombre de questions ou modifier le choix d'activités."
    } else {span.innerHTML = "";span.title="";}

    for (let i = 0; i < parameters.cart.activities.length; i++) {
        const activity = parameters.cart.activities[i];
        for(let j=0;j<activity.questions.length;j++){
            nbOfCards++;
            let carte = utils.create("article", {className:"dominos-carte",id:"domino"+nbOfCards});
            carte.style.width = document.getElementById("inputwidth").value+"mm";
            carte.style.height = document.getElementById("inputheight").value+"mm";
            if(MM.bgImg)carte.style.backgroundImage = "url('"+MM.bgImg+"')"
            let hr = utils.create("div",{className:"barrev",innerHTML:"&nbsp;"});
            carte.appendChild(hr);
            let artQuestion = utils.create("article",{className:"dominos-question"});
            let divq = utils.create("div");
            if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                let span = utils.create("span",{className:"math", innerHTML:activity.questions[j]});
                divq.appendChild(span);
            } else {
                divq.innerHTML = activity.questions[j];
            }
            artQuestion.appendChild(divq);
            carte.appendChild(artQuestion);
            // figures
            if(activity.figures[j] !== undefined){
                if(MM.memory["dest"]===undefined)MM.memory["dest"] = content;
                MM.memory["f"+nbOfCards] = new Figure(utils.clone(activity.figures[j]), "f"+nbOfCards, divq);
            }
            sectionCartes.appendChild(carte);
        }
    }
    content.appendChild(sectionCartes);
    let numAnswer=1;
    for (let i = 0; i < parameters.cart.activities.length; i++) {
        const activity = parameters.cart.activities[i];
        for(let j=0;j<activity.questions.length;j++){
            numAnswer++;
            let carte = document.getElementById("domino"+(numAnswer>nbOfCards?1:numAnswer));
            let artCorrection = utils.create("article",{className:"dominos-reponse"});
            let divr = utils.create("div");
            let answer = activity.values[j];
            if(_.isArray(answer))answer = answer[0];
            if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                let spanCorrection = utils.create("span", {className:"math", innerHTML:answer});
                divr.appendChild(spanCorrection);
            } else {
                divr.innerHTML = answer;
            }
            artCorrection.appendChild(divr);
            carte.prepend(artCorrection);
        }
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
        parameters.nb=Number(vars.n);
        document.getElementById("nbDominos").value = parameters.nb
        parameters.titreFiche=decodeURI(vars.t);
        parameters.doublons = eval(vars.d)||false;
        if(!parameters.doublons)document.getElementById("btnnodoublon").innerHTML = "Doublons"
        // Affectation de la valeur au nombre de feuilles
        document.getElementById("nbDominos").value = parameters.nb;
        zoom = new Zoom("changeFontSize","#thehtml",true,"pt",parameters.tailleTexte);
        document.getElementById("creator-menu").appendChild(zoom.createCursor());
        document.querySelector("html").style["fontSize"] = parameters.tailleTexte+"pt";
        console.log(parameters);
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
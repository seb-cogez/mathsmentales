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

document.getElementById('flipall').onclick = ()=>{
    let rotate = true;
    const elements = document.querySelectorAll('.flip-card-inner')
    const nbOfElements = elements.length
    let count = 0
    elements.forEach(el=>{
        if(el.classList.contains('rotate'))count++
    })
    elements.forEach(el=>{
        if(count<nbOfElements)
            el.classList.add('rotate')
        else
            el.classList.remove('rotate')
    })
}

function refresh(){
    makePage()
    common.mathRender(['question','answer'])
}

function getRandomPastelColor(){
    return "hsl(" + 360 * Math.random() + ',' +
             (25 + 70 * Math.random()) + '%,' + 
             (85 + 10 * Math.random()) + '%)'
}
function makePage(){
    if(parameters.alea){
        common.setSeed(parameters.alea);
    }
    content.innerHTML = "";
    MM.memory = {};
    common.generateQuestions(parameters);
    let nbOfCards = 0
    for (const [index,activity] of parameters.cart.activities.entries()) {
        for(let j=0;j<activity.questions.length;j++){
            nbOfCards++
            const colorCard = getRandomPastelColor();
            const container = utils.create('article',{className:"tuile"});
            const flipCardInner = utils.create('div',{className:'flip-card-inner'})
            const randomColor = Math.floor(Math.random()*16777215).toString(16);
            const artQuestion = utils.create('div',{className:'question flip-card-front'})
            artQuestion.style.backgroundColor = colorCard
            const buttonSolution = utils.create('div', {className:'interrogation', innerText:'?',title:'Cliquer pour afficher la correction'})
            buttonSolution.style['border-bottom'] = '0.3rem solid '+colorCard
            buttonSolution.style['border-right'] = '0.3rem solid '+colorCard
            const divq = utils.create("div");
            if(activity.consigne)
                divq.appendChild(utils.create('div',{innerHTML:'<i>'+activity.consigne+'</i>'}))
            const artCorrection = utils.create("div",{className:"answer flip-card-back"})
            artCorrection.style.backgroundColor = colorCard
            buttonSolution.onclick = () => {
                flipCardInner.classList.toggle('rotate')
            }
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
            flipCardInner.appendChild(artQuestion)
            // figures
            if(activity.figures[j] !== undefined){
                MM.memory["f"+index+"-"+j] = new Figure(utils.clone(activity.figures[j]), "f"+index+"-"+j, divq);
            }
            artCorrection.appendChild(divr)
            flipCardInner.appendChild(artCorrection)
            container.appendChild(flipCardInner)
            container.appendChild(utils.create('div', {className:'numero', innerText:nbOfCards}))
            container.appendChild(buttonSolution)
            content.appendChild(container)
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
        //document.getElementById("nbDominos").value = parameters.nb
        parameters.titreFiche=decodeURI(vars.t);
        //document.getElementById("creator-menu").appendChild(zoom.createCursor());
        //document.querySelector("html").style["fontSize"] = parameters.tailleTexte+"pt";
        // allcarts contient des promises qu'il faut charger
        parameters.cart = new cart(0);
        parameters.cart.import(json[0],false).then(()=>{
            refresh()
        }).catch(err=>{
            // erreur à l'importation :(
            // fichier et line de l'erreur
            let stack = err.stack.split('\n');
            stack.splice(0,2)
            let alert=utils.create("div",
            {
                id:"messageerreur",
                className:"message",
                innerHTML:"Impossible de charger le panier :(<br>"+err+"<br>"+stack
            });
            console.log(err.stack)
            document.getElementById("creator-content").appendChild(alert);
        });
    }
}
checkURL();
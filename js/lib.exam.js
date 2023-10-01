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
    } else if(evt.target.id === 'btn-hide-inputanswer'){
        cacheEspaceReponse()
    } else if(evt.target.id === 'fusionEnonces'){
        parameters.cart.ordered = !parameters.cart.ordered
        refresh()
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
    } else if(evt.target.id.indexOf('inputheight')===0){
        changeheight('ol'+evt.target.dataset.target,evt.target.value)
    } else if(evt.target.id.indexOf('nbcols')===0){
        changecols('ol'+evt.target.dataset.target,evt.target.value)
    }
}
function changecols(dest,nb){
    const elem = document.getElementById(dest)
    if(elem !== null)
        elem.className="grid g"+nb
}
function cacheEspaceReponse(){
    document.querySelectorAll(".interro article").forEach(el=>{
        el.classList.toggle("invisible")
    })
}
function changeheight(dest,nb){
    let elts = document.querySelectorAll("#"+dest+" .interro article");
    for(let i=0;i<elts.length;i++){
        elts[i].style.height = nb+"pt";
    }
}
function setNumberFiches(nb){
    parameters.nb = Number(nb);
    refresh();
}
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
        const aleaCode = utils.create("div",{className:"floatright",innerHTML:"p."+(qty+1)})
        content.appendChild(aleaCode);
        // get the titlesheet
        const sheetTitle = parameters.titreFiche;
        // set the titlesheet
        const header = utils.create("header",{innerHTML:sheetTitle});
        content.appendChild(header);
        const div1 = utils.create("div",{className:"studenName",innerHTML:"Nom, prénom, classe :"});
        content.appendChild(div1);
        const div2 = utils.create("div",{className:"remarques",innerHTML:"Remarques :"});
        content.appendChild(div2);
        // get the exercice title
        let exTitle = parameters.titreExercices;
        const correctionContent = utils.create("div",{className:"correction"});
        const titleCorrection = utils.create("header", {className:"clearfix",innerHTML:"Correction"});
        correctionContent.appendChild(titleCorrection);
        const divclear = utils.create("div",{className: "clearfix"});
        let activitiesArray = []
        for (let i=0; i<parameters.cart.activities.length;i++){
            for (let j=0;j<parameters.cart.activities[i].questions.length;j++){
                activitiesArray.push([i,j])
            }
        }
        if(!parameters.cart.ordered){
            activitiesArray = utils.shuffle(activitiesArray)
        }
        let lastActivityIndex = 0,ol,olCorrection,h3,input,activityTitle
        for (let i = 0; i < activitiesArray.length; i++) {
            const actIndex = activitiesArray[i][0]
            const activity = parameters.cart.activities[actIndex]
            const j = activitiesArray[i][1]
            const sectionEnonce = utils.create("section",{id:"section"+qty+"-"+i})
            const sectionCorrection = utils.create("section");
            if((lastActivityIndex !== actIndex && parameters.cart.ordered) || i===0){
                input = `<input id="inputheight${qty}-${i}" class="noprint fright" value="30" title="Taille réponse" type="number" size="3" min="10" max="200" data-target="${qty}-${i}">`;
                sectionEnonce.innerHTML += input;
                input = `<input id="nbcols${qty}-${i}" class="noprint fright" value="2" title="Nb de colonnes" type="number" size="2" min="1" max="6" data-target="${qty}-${i}">`;
                sectionEnonce.innerHTML += input;
                if(!parameters.cart.ordered)
                    activityTitle = exTitle
                else
                activityTitle = exTitle+(actIndex+1)+" : "+activity.title
                h3 = utils.create("h3", {className:"exercice-title",innerHTML: activityTitle});
                sectionEnonce.appendChild(h3);
                if(activity.consigne){
                    sectionEnonce.appendChild(utils.create('div',{className:'consigne',innerHTML:activity.consigne}))
                }
                ol = utils.create("ol",{id:"ol"+qty+"-"+i,className:"grid g2"});
                olCorrection = utils.create("ol", {className:"corrige"})
            }
            const li = utils.create("li",{className:"interro"});
            const liCorrection = utils.create("li");
            if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                const span = utils.create("span",{className:"math", innerHTML:activity.questions[j]});
                const spanCorrection = utils.create("span", {className:"math", innerHTML:activity.answers[j]});
                li.appendChild(span);
                liCorrection.appendChild(spanCorrection);
            } else {
                li.innerHTML = activity.questions[j];
                liCorrection.innerHTML = activity.answers[j];
            }
            ol.appendChild(li);
            // figures
            if(activity.figures[j] !== undefined){
                //if(i===0 && j=== 0)MM.memory["dest"] = this.wsheet;
                MM.memory["f"+qty+"-"+i+"-"+j] = new Figure(utils.clone(activity.figures[j]), "f"+qty+"-"+i+"-"+j,li);
            }                
            const article = utils.create("article");
            li.appendChild(article);
            olCorrection.appendChild(liCorrection);
            sectionEnonce.appendChild(ol);
            const ds = divclear.cloneNode(true);
            sectionEnonce.appendChild(ds);
            if((lastActivityIndex !== actIndex && parameters.cart.ordered) || i===0){
                const h3correction = h3.cloneNode(true);
                sectionCorrection.appendChild(h3correction);
                lastActivityIndex = actIndex
            }
            sectionCorrection.appendChild(olCorrection);
            correctionContent.appendChild(sectionCorrection);
            content.appendChild(sectionEnonce);

        }
        // insert footer for print page break
        content.appendChild(utils.create("footer"));
        // insert correction
        content.appendChild(correctionContent);
        const ds = divclear.cloneNode(true);
        content.appendChild(ds);
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
        parameters.positionCorrection=vars.cor||'end';
        parameters.titreFiche=decodeURI(vars.t);
        parameters.titreExercices=decodeURI(vars.ex).trim()+" ".replace("📣","");
        parameters.enoncesSepares=vars.es||0;
        parameters.corrigeSepare=vars.cs||0;
        parameters.activitesColonnes=vars.cols||[];
        parameters.doublons = true;
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
        
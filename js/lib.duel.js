import protos from './mods/protos.min.js';
import utils from './mods/utils.min.js';
import common from './mods/common.min.js';
import cart from './mods/cart.min.js';
import Zoom from './mods/zoom.min.js';
import Figure from './mods/figure.min.js';
import keyBoard from './mods/keyboard.min.js';
import MM from './mods/MM.min.js';
import math from './mods/math.min.js';

MM.touched = false;
MM.slidersNumber = 2;
let calculsEnCours = false;
let questionCount = 0;
const PERSOS = [
    "dino1","dino2","dino3","dino4","dino5","dino6","dino7","dino8",
    "dragon1","dragon2","dragon3","dragon4","dragon5","dragon6","dragon7",
    "fee1","fee2","fou1","genie1","girl1","goblin1","princess1","princess2","roi1","roi2", "sorcier1",
    "pirate1","pirate2","pirate3","pirate4","pirate5","pirate6"
]
MM.touched = 'ontouchstart' in window || navigator.msMaxTouchPoints;
//document.getElementById("infodebug").innerHTML += "ontouchstart detected : "+MM.touched+"<br>";
const content = document.getElementById("creator-content");
const parameters = {};
let zoom;
let typesDuel = {"tochoose":"","thefaster":"Lucky Luke", "mortal":"mortel", "normal":"Que le meilleur gagne !", "roulette":"Alternatif", "coop":"Coopératif"}
document.getElementById("intro").onclick = (evt)=>{
    let explain = document.getElementById("explanations");
    if(evt.target.id === "btn-choice-normal"){
        setChoice("normal");
        explain.innerHTML = "Chacun répond à son rythme, le score final décide du vainqueur";
    }else if(evt.target.id === "btn-choice-mortal"){
        setChoice("mortal");
        explain.innerHTML = "Le premier qui fait une erreur perd. Attention au temps !";
    }else if(evt.target.id === "btn-choice-roulette"){
        setChoice("roulette");
        explain.innerHTML = "Chacun répond à son tour, premier qui rate perd.";
    }else if(evt.target.id === "btn-choice-thefaster"){
        setChoice("thefaster");
        explain.innerHTML = "Le premier qui répond marque des points, pas l'autre !";
    }else if(evt.target.id === "btn-choice-coop"){
        setChoice("coop");
        explain.innerHTML = "Les points s'accumulent par la meilleure des deux réponses.";
    } else if(evt.target.id === "introPersol"){
        setPerso("l");
    } else if(evt.target.id === "introPersor"){
        setPerso("r");
    } else if(["svg-sbs","btn-orientation-sidebyside"].indexOf(evt.target.id)>-1){
        setOrientation("sidebyside");
    }else if(["svg-ftf","btn-orientation-facetoface"].indexOf(evt.target.id)>-1){
        setOrientation("facetoface");
    }else if(evt.target.id === "full-screen"){
        if(document.documentElement.requestFullscreen){
		    document.documentElement.requestFullscreen()
            .then(()=>{
                console.log("Fullscreen")
            })
            .catch((err)=>{
                console.log("Erreur de fullscreen "+err)
            });
         } else if(document.documentElement.webkitRequestFullScreen){
		    document.documentElement.webkitRequestFullScreen();
        }
    }else if(evt.target.id === "btn-start"){
        document.getElementById("intro").classList.add("hidden");
        document.getElementById("countdown-container").classList.remove("hidden");
        setTimeout(()=>{
            document.getElementById("countdown-container").classList.add("hidden");
            document.getElementById("creator-container").classList.remove("hidden");
            start();
        },3600);
    }else if(evt.target.id === "btn-infoconfig"){
        document.getElementById("infodebug").classList.remove("hidden");
    }
}
document.body.addEventListener("touchmove",(evt)=>{evt.preventDefault()},false)
document.getElementById("infodebug").onclick = ()=>{document.getElementById("infodebug").classList.add("hidden")}
document.getElementById("btn-restart").onclick = ()=>{resetAll()}

function setChoice(type){
    parameters.typeduel = type;
    // raffraichissement des boutons
    document.querySelectorAll("#typeduelchoice button").forEach(el=>{
        el.className = "";
    })
    document.getElementById("btn-choice-"+type).className = "selected";
}
function setPersos(){
    let choix1 = Math.floor(Math.random()*PERSOS.length), choix2;
    do{choix2 = Math.floor(Math.random()*PERSOS.length)}
    while(choix2 === choix1)
    PLAYER1.perso = PERSOS[choix1]
    PLAYER2.perso = PERSOS[choix2]
    displayPersos()
}
function setPerso(id){
    let choix,thisPlayer,theOther;
    if(id==="l"){
        thisPlayer=PLAYER1;theOther=PLAYER2
    } else {
        thisPlayer=PLAYER2;theOther=PLAYER1
    }
    do {choix = Math.floor(Math.random()*PERSOS.length)}
    while(PERSOS[choix]===PLAYER1.perso || PERSOS[choix]===PLAYER2.perso)
    thisPlayer.perso = PERSOS[choix]
    displayPersos()
}
function displayPersos(){
    document.getElementById("introPersol").src="library/illustrations/Persos/"+PLAYER1.perso+".png"
    document.getElementById("introPersor").src="library/illustrations/Persos/"+PLAYER2.perso+".png"
    document.getElementById("left").style.backgroundImage = "url(library/illustrations/Persos/"+PLAYER1.perso+".png)"
    document.getElementById("right").style.backgroundImage = "url(library/illustrations/Persos/"+PLAYER2.perso+".png)"
}
function setOrientation(type){
    if(type === "facetoface"){
        document.getElementById("creator-content").classList.remove("sidebyside");
        document.getElementById("creator-content").classList.add("facetoface");
        /*screen.orientation.lock("portrait-primary")
        .then(function() {
            console.log("portrait ok");
        })
        .catch(function(error) {
            console.log(error);
        });*/
    } else if(type ==="sidebyside"){
        document.getElementById("creator-content").classList.remove("facetoface");
        document.getElementById("creator-content").classList.add("sidebyside");
        /*screen.orientation.lock("landscape-primary")
        .then(function(){
            console.log("landscape ok");
        })
        .catch(function(error){
            console.log(error)
        })*/
    }
    document.querySelectorAll("#field-options button").forEach(el=>{
        el.className = "";
    })
    document.getElementById("btn-orientation-"+type).className = "selected";
}
class player {
    constructor(id){
        this.id = id
        this.name = id==="l"?"left":"right"
        this.nom = id==="l"?"JOUEUR 1":"JOUEUR 2"
        this.perso = ""
        this.score = 0
        this.scores = []
        this.numQuestion = 0
        this.time = 0
        this.timer = false
        this.success = []
        this.answers = []
        this.perso = ""
        this.ended = false
        this.timerStarted = false;
        this.lastQuestion = -1 // permet d'indiquer jusqu'à quelle question aller dans un duel à mort
    }
    /**
     * Réinitialise les données pour une nouvelle partie
     */
    reset(){
        this.score = 0
        this.scores = []
        this.numQuestion = 0
        this.time = 0
        this.timer = false
        this.success = []
        this.answers = []
        this.ended = false
        this.timerStarted = false;
        this.lastQuestion = -1
    }
    /**
     * Démarre une question
     */
    start(){
        this.showQuestion()
        this.updateProgressBar()
        if(!parameters.totaltime){
            // si le timer n'est pas global, on démarre le timer
            this.timer = new timer(this.id,MM.activities[this.numQuestion].time)
            this.timer.start();
        } else if(!this.timerStarted){
            this.timerStarted = true;
            this.timer = new timer(this.id,parameters.totaltime)
            this.timer.setDataActivity(MM.activities[this.numQuestion].time);
            this.timer.start();
        } else {
            this.timer.setDataActivity(MM.activities[this.numQuestion].time);
        }
    }
    /**
     * 
     * @returns Vérifie s'il faut passer à la question suivante
     */
    nextQ(){
        if(this.timer && !parameters.totaltime){
            this.timer.stop();
            this.timer=false
        }
        this.hideQuestion()
        if(this.ended){// c'est fini, peut-être défini par un mode de jeu tel que le temps limité.
            document.querySelector("#chrono"+this.id).innerHTML = "-:--";
            WhoWon()
            return
        }
        if(this.lastQuestion === this.numQuestion){ // on est arrivé à la dernière question, numéro déterminé par le mode de jeu "Le dernier"
            document.querySelector("#chrono"+this.id).innerHTML = "-:--";
            this.ended = true
            WhoWon()
            return
        }
        if(MM.activities.length>this.numQuestion+1){ // cas normal, il reste des questions à traiter
            this.numQuestion++
            this.start()
        } else if(MM.activities.length>=this.numQuestion+1 && parameters.totaltime !== false){
            // on est dans le mode temps limité mais il n'y a plus de question dispo, on en régénère
            addContent()
            this.numQuestion++
            this.start()
        } else { // dans les autres, cas on doit avoir terminé.
            this.ended = true;
            document.querySelector("#chrono"+this.id).innerHTML = "-:--";
            document.querySelector("#jauge"+this.id).classList.add("hidden");
            document.getElementById("enonces"+this.id).appendChild(utils.create("button", {"innerHTML":"Terminé !","className":"selected"}))
            WhoWon()
        }
    }
    /**
     * Vérifie si la dernière réponse a été valide ou pas.
     * @returns boolean
     */
    succeeded(){
        if(this.success[this.success.length-1]) return true
        else return false
    }
    /**
     * Affiche la question en cours
     */
    showQuestion(){
        document.getElementById("q"+this.id+this.numQuestion).classList.remove("hidden")
    }
    /**
     * Met à jour l'affichage de la barre de progression dans l'activité
     */
    updateProgressBar(){
        if(!parameters.totaltime){
            let len = MM.activities.length;
            let numQ = this.numQuestion;
            if(parameters.typeduel === "roulette"){
                len = Math.floor(MM.activities.length/2);
                numQ = Math.floor(this.numQuestion/2);
            }
            
            document.querySelector("#jauge"+this.id).classList.remove("hidden");
            document.querySelector("#jauge"+this.id+" .avance").innerHTML = (len-numQ)+"/"+len
            if(document.documentElement.clientHeight < document.documentElement.clientWidth){
                document.querySelector("#jauge"+this.id+" .fondjauge").style.height = "100%"
                document.querySelector("#jauge"+this.id+" .fondjauge").style.width = (Math.round((len-numQ)/len*100))+"%"
            } else {
                document.querySelector("#jauge"+this.id+" .fondjauge").style.width = "100%"
                document.querySelector("#jauge"+this.id+" .fondjauge").style.height = (Math.round((len-numQ)/len*100))+"%"
            }
        }
    }
    /**
     * Cache la question en cours
     */
    hideQuestion(){
        document.getElementById("q"+this.id+this.numQuestion).classList.add("hidden")
    }
    /**
     * Va directement au numéro de question indiqué.
     * @param {integer} idQ numero de la question à afficher
     */
    goToQ(idQ){
        this.hideQuestion()
        if(MM.activities.length>idQ){
            this.numQuestion = idQ
            this.start()
        } else {
            this.ended = true; if(this.id==="l")PLAYER2.ended=true;else PLAYER1.ended=true;
            document.querySelector("#chrono"+this.id).innerHTML = "-:--";
            WhoWon()
        }
    }
}
const PLAYER1 = new player("l")
const PLAYER2 = new player("r")
/**
 * Démarre le duel
 */
function start(){
    if(parameters.typeduel === "roulette"){
        // on n'affiche que l'un des deux
        if(Math.random()>0.5)
        PLAYER1.start();
    else
        PLAYER2.start();
    } else {
            try{
                if(["normal", "mortal","thefaster", "coop"].indexOf(parameters.typeduel)>-1){
                    PLAYER1.start()
                    PLAYER2.start()
                }
            }
            catch(err){
                console.log("Erreur display q0 : "+err);
            }
        }
}
/**
 * Interroge le changement de slide
 * Calcule le score
 * @param {string} idSlide "left" or "right"
 */
function nextSlide(idSlide){
    if(calculsEnCours) setTimeout(()=>{calculsEnCours()},50)
    calculsEnCours = true;
    let thisPlayer,theOther;
    // verif des réponses
    // calcul du score selon validité ET temps
    // 0 sec = 1000 points
    // max temps = 100 points
    if(idSlide === "l"){
        thisPlayer = PLAYER1;
        theOther = PLAYER2;
    } else if(idSlide === "r"){
        thisPlayer = PLAYER2;
        theOther = PLAYER1;
    }
    verifReponse(thisPlayer);
    displayScore(thisPlayer);
    if(["normal","thefaster","coop"].indexOf(parameters.typeduel)>-1){
        thisPlayer.nextQ();
    }
    if(parameters.typeduel === "thefaster"){
        // pas de vérif des points pour le concurent mais on passe à la suivante
        theOther.nextQ()
    } else if(parameters.typeduel === "mortal"){
        // si on a réussi, on passe à la suivante
        if(thisPlayer.succeeded() && !thisPlayer.ended)
            thisPlayer.nextQ()
        else { // sinon, il faut voir si on est allé aussi loin ou pas... TODO
            thisPlayer.hideQuestion()
            thisPlayer.ended = true;
            theOther.lastQuestion = thisPlayer.numQuestion
            WhoWon()
        }
    } else if(parameters.typeduel === "roulette"){
        // si on a réussi, l'autre passe à la suivante
        thisPlayer.hideQuestion()
        if(thisPlayer.succeeded() && !thisPlayer.ended){
            theOther.goToQ(thisPlayer.numQuestion+1)     
        } else {
            thisPlayer.ended = true;
            theOther.ended = true;
            WhoWon()
        }
    }
    calculsEnCours = false;
}
/**
 * affiche le score du player ou indique une erreur en faisant trembler l'interface
 * @param {object} player instance de la classe player
 */
function displayScore(player){
    const NQ = player.numQuestion;
    if(player.success[player.success.length-1]){
        player.scores[NQ] = player.timer.percent*10||50;
        player.score += player.timer.percent*10||50;
    } else {
        player.scores[NQ]=0;
        document.getElementById("score"+player.id).classList.add("shake");
        document.getElementById(player.name).classList.add("shake2");
        setTimeout(()=>{
            document.getElementById("score"+player.id).classList.remove("shake");
            document.getElementById(player.name).classList.remove("shake2");
        }, 1000)
    }
    document.getElementById("score"+player.id).innerHTML = player.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
/**
 * Détermine le gagnant de la partie, ou s'il y a égalité et crée l'affichage correspondant
 * @returns nothing si les deux joueurs n'ont pas terminé
 */
function WhoWon(){
    if(!PLAYER1.ended || !PLAYER2.ended){
        console.log("non terminé")
        return
    } else {
        setTimeout(()=>{
            document.getElementById("creator-container").classList.add("hidden")
            let thewinner,egaliteTxt,score=0,thelooz,finmessage =" points est"
            if(parameters.typeduel === "normal" || parameters.typeduel === "thefaster"){
                if(PLAYER1.score > PLAYER2.score){
                    thewinner = PLAYER1
                    thelooz = PLAYER2
                } else if (PLAYER2.score > PLAYER1.score){
                    thewinner = PLAYER2
                    thelooz = PLAYER1
                } else {
                    egaliteTxt = "Égalité !!! Avec"
                    score = PLAYER1.score
                    thewinner = "both"
                    finmessage = "points"
                }
            } else if(parameters.typeduel === "mortal" || parameters.typeduel === "roulette"){
                console.log(utils.clone(PLAYER1), utils.clone(PLAYER2))
                if(PLAYER1.success.lastIndexOf(true) > PLAYER2.success.lastIndexOf(true)){
                    thewinner = PLAYER1
                    thelooz = PLAYER2
                } else if(PLAYER1.success.lastIndexOf(true) < PLAYER2.success.lastIndexOf(true)){
                    thewinner = PLAYER2
                    thelooz = PLAYER1
                } else {
                    egaliteTxt = "Égalité !!! Avec"
                    score = PLAYER1.success.lastIndexOf(true)+1;
                    thewinner = "both"
                    finmessage = " réussites !"
                }
            } else if(parameters.typeduel === "coop"){
                egaliteTxt = "Vous avez cumulé "
                for(let i=0,len=PLAYER1.scores.length;i<len;i++){
                    score+=Math.max(PLAYER1.scores[i],PLAYER2.scores[i])
                }
                thewinner = "both"
                finmessage = "points"
            }
            let thewinnerDOM = document.getElementById("thewinnercontent");
            thewinnerDOM.innerHTML = ""
            if(thewinner != "both" && parameters.typeduel !=="coop"){
                let div = utils.create("div")
                thewinnerDOM.appendChild(utils.create("h1",{"innerHTML":"Le gagnant, avec <span class='scorewinner'>"+thewinner.score+"</span> "+finmessage}))
                let div1 = utils.create("div");
                div1.appendChild(utils.create("img",{"src":"library/illustrations/Persos/"+thewinner.perso+".png"}))
                div1.appendChild(utils.create("div",{"innerHTML":thewinner.nom}))
                div1.appendChild(utils.create("h2",{"innerText":thewinner.score+" ("+utils.countValue(thewinner.success,true)+" OK)"}))
                let div2 = utils.create("div")
                div2.appendChild(utils.create("img", {"src":"library/illustrations/Persos/"+thelooz.perso+".png"}))
                div2.appendChild(utils.create("div",{"innerHTML":thelooz.nom}))
                div2.appendChild(utils.create("h4",{"innerText":thelooz.score+" ("+utils.countValue(thelooz.success,true)+" OK)"}))
                div.appendChild(div1)
                div.appendChild(div2)
                thewinnerDOM.appendChild(div)
            } else {
                thewinnerDOM.appendChild(utils.create("h1",{"innerHTML":egaliteTxt+" <span class='scorewinner'>"+score+"</span> "+finmessage}))
                let div = utils.create("div");
                div.appendChild(utils.create("img",{"src":"library/illustrations/Persos/"+PLAYER1.perso+".png"}))
                div.appendChild(utils.create("img",{"src":"library/illustrations/Persos/"+PLAYER2.perso+".png"}))
                thewinnerDOM.appendChild(div);
            }
            document.getElementById("thewinner").classList.remove("hidden")
        },2000)
    }
}
/**
 * 
 * @param {object} player instance de la classe player
 * @returns false si le joueur n'a pas répondu (le champ de réponse est vide)
 */
function verifReponse(player){
    if(!parameters.totaltime){
        player.timer.stop();
        player.time += player.timer.time;
    }
    // stockage valeur
    const NQ = player.numQuestion;
    let idq = player.success.push(false)-1;
    player.answers[NQ] = MM.mf["ansInput"+player.id+"-"+NQ].value||null;
    let userAnswer = player.answers[NQ];
    if (userAnswer === null) return;// pas de réponse apportée
    if(userAnswer.indexOf("\\text")===0){
        userAnswer = userAnswer.substring(6,userAnswer.length-1);
    }
    // remplacer un espace texte par un espace
    userAnswer = userAnswer.replace("\\text{ }"," ");
    userAnswer = userAnswer.replace(">","\\gt");
    userAnswer = userAnswer.replace("<","\\lt");
    if(userAnswer === ""){
        // pas de réponse donnée.
        return false
    }
    const expectedAnswer = MM.activities[NQ].value;
    const valueType = MM.activities[NQ].valueType;
    if(Array.isArray(expectedAnswer)){
        for(let i=0;i<expectedAnswer.length;i++){
            if(String(userAnswer).toLowerCase()==String(expectedAnswer[i]).toLowerCase()){
                player.success[idq]= true;
                break;
            } else {
                const expr1 = KAS.parse(expectedAnswer[i]).expr;
                const expr2 = KAS.parse(String(userAnswer).replace('²', '^2')).expr;
                if(expr1 && expr2)try {
                    if(KAS.compare(expr1,expr2,{form:true,simplify:false}).equal){
                    // use KAS.compare for algebraics expressions.
                    player.success[idq]=true;
                    break;
                    }
                } catch(error){
                    console.log(error)
                }
            }
        }
    } else if(valueType !== false){
        // confrontation de listes séparées par des ;
        if(valueType === "liste"){
            let arrayUser = userAnswer.split(";").map(value=>value.trim()).sort((a,b)=>a-b);
            let arrayExpected = expectedAnswer.split(";").map(value=>value.trim()).sort((a,b)=>a-b);
            // comparons les contenus en transformant en une chaine
            if(arrayUser.toString()===arrayExpected.toString()){
                player.success[idq]=true;
            }
        } else if(valueType === "inInterval"){
            // ici la valeur doit être comprise entre les deux bornes de l'intervalle
            let minmax = expectedAnswer.split("-").map(value=>Number(value));
            //minmax[0] est la borne inf et minmax[1] est la borne sup;
            if(Number(userAnswer)>minmax[0] && Number(userAnswer) < minmax[1]){
                player.success[idq]=true;
            }
        }
    } else { // cas d'une chaine a priori
        if(typeof expectedAnswer === "string")
            if(expectedAnswer.indexOf(",")>0){
                let expectedAnswerArray = expectedAnswer.split(",");
                for(let i=0;i<expectedAnswer.length;i++){
                    if(String(userAnswer).toLowerCase()==String(expectedAnswerArray[i]).toLowerCase()){
                        player.success[idq]= true;
                        break;
                    } else {
                        const expr1 = KAS.parse(expectedAnswer[i]).expr;
                        const expr2 = KAS.parse(String(userAnswer).replace('²', '^2')).expr;
                        if(expr1 && expr2){
                            try {
                                if(KAS.compare(expr1,expr2,{form:true,simplify:false}).equal){
                                // use KAS.compare for algebraics expressions.
                                player.success[idq]=true;
                                break;
                                }
                            } catch(error){
                                console.log(error)
                            }
                        }
                    }
                }
            }
        if(String(userAnswer).toLowerCase()==String(expectedAnswer).toLowerCase()){
            player.success[idq]=true;
        } else {
            const expr1 = KAS.parse(String(expectedAnswer)).expr;
            const expr2 = KAS.parse(String(userAnswer).replace('²', '^2')).expr;
            if(expr1 && expr2) {
                try{
                    if(KAS.compare(expr1,expr2,{form:true,simplify:false}).equal){
                    // use KAS.compare for algebraics expressions.
                    player.success[idq]=true;
                    }
                } catch(error){
                    console.log(error);
            }}
        }
    }
    //document.getElementById("infodebug").innerHTML += player.nom + " : rép = "+player.answers[NQ]+" | attendu : "+expectedAnswer+" => "+player.success[NQ]+"<br>"
}

/**
 * Compte le temps et l'affiche
 */
class timer{
    constructor(id,duration){
        this.id = id;
        this.time = 0;
        this.duration = duration;
        this.startTime = Date.now();
        this.intermediateTime = this.startTime;
        this.timeLeft = duration*1000;
        this.endTime = this.startTime + this.timeLeft;
        this.percent = 0;
        this.timer = false;
        this.ended = false;
        this.durationAct = 0
        this.endTimeAct = 0
    }
    /**
     * Calcule le temps restant et provoque le passage de diapo si c'est fini
     */
    getTimeLeft(){
        let now = Date.now();
        this.time = now - this.startTime;
        this.timeLeft = this.endTime - now;
        if(!parameters.totaltime){
            this.percent = Math.round(this.timeLeft/10/this.duration);
        } else {
            let timeLeft = this.endTimeAct - now > 0 ? this.endTimeAct - now : 0
            this.percent = Math.round(timeLeft/10/this.durationAct);
        }
        this.display();
        if(this.timeLeft <= 0){
            this.stop();
            this.timeLeft = 0;
            if(parameters.totaltime !== false){
                PLAYER1.ended = true;
                PLAYER2.ended = true;
            }
            nextSlide(this.id);
        }
    }
    /**
     * Démarre le timer
     * @returns false si le timer est terminé
     */
    start(){
        this.stop(); // just in case;
        if(this.ended) return false;
        this.endTime = this.startTime + this.timeLeft;
        if(this.timer){
            clearInterval(this.timer);
            this.timer = false;
        }
        this.timer = setInterval(this.getTimeLeft.bind(this),50);
    }
    /**
     * Arrête le timer
     */
    stop(){
        if(this.timer){
            clearInterval(this.timer);
            this.timer = false;
        }        
    }
    /**
     * Arrête le timer avec message
     */
    end(){
        this.stop();
        this.ended = true;
        messageEndSlide(this.id,this.durationId);
    }
    /**
     * Affiche le temps
     */
    display(){
        let affichage = Math.round(this.timeLeft/1000);
        affichage = ~~(affichage/60) + ":"+(affichage<10?"0":"") + affichage%60;
        document.querySelector("#chrono"+this.id).innerHTML = affichage;
    }
    /**
     * Met à jour la durée de l'activité (pour la partie en temps limité)
     * @param {Integer} duree temps en seconde
     */
    setDataActivity(duree){
        let now = Date.now()
        this.durationAct = duree
        this.endTimeAct = now + this.durationAct*1000
    }
}

/**
 * Crée la page en donnant le fond d'écran et créant les persos
 */
function makePage(){
    document.body.style.backgroundImage = "url(./library/illustrations/backgrounds/bg"+parameters['bg']+".jpg";
    setPersos();
    if(parameters.alea){
        common.setSeed(parameters.alea);
    }
    resetAll()
}
/**
 * Remet toutes les données à zéro pour la première fois ou les nouvelles parties
 */
function resetAll(){
    PLAYER1.reset()
    PLAYER2.reset()
    document.getElementById("enoncesl").innerHTML = ""
    document.getElementById("enoncesr").innerHTML = ""
    document.getElementById("scorel").innerHTML = ""
    document.getElementById("scorer").innerHTML = ""
    MM.mf = {}
    MM.keyboards = {}
    MM.memory = {}
    MM.activities = []
    questionCount = 0
    document.getElementById("creator-container").classList.add("hidden")
    document.getElementById("thewinner").classList.add("hidden")
    document.getElementById("intro").classList.remove("hidden")
    // On créé les contenus
    addContent()
}
/**
 * Génère des questions
 */
function addContent(){
    let contentLeft = document.getElementById("enoncesl");
    let contentRight = document.getElementById("enoncesr");
    common.generateQuestions(parameters);
    let actArray=[]
    for(let z=0,alen=parameters.cart.activities.length;z<alen;z++){
        for(let j=0,qlen=parameters.cart.activities[z].questions.length;j<qlen;j++){
            actArray.push([z,j]);
        }
    }
    if(!parameters.cart.ordered){
        actArray = utils.shuffle(actArray);
    }
    for (let i = 0,len=actArray.length; i < len; i++) {
        const activity = parameters.cart.activities[actArray[i][0]];
        MM.activities.push({time:Number(activity.tempo), value:activity.values[actArray[i][1]], answer:activity.answers[actArray[i][1]], valueType:activity.valueType||false});
        let question = activity.questions[actArray[i][1]].replace(/\$\$([^$]*)\$\$/gi, '<span class="math">$1</span>');
        let carte = utils.create("article", {className:"diapo hidden",id:"ql"+questionCount});
        let carted = utils.create("article", {className:"diapo hidden",id:"qr"+questionCount});
        let divq = utils.create("div", {className:"enonce"});
        if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
            let span = utils.create("span",{className:"math", innerHTML:question});
            divq.appendChild(span);
        } else {
            divq.innerHTML = question;
        }
        carte.appendChild(divq);
        //let divqd = divq.cloneNode(true);
        let divqd = utils.create("div", {className:"enonce"});
        if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
            let span = utils.create("span",{className:"math", innerHTML:question});
            divqd.appendChild(span);
        } else {
            divqd.innerHTML = question;
        }
        carted.appendChild(divqd);
        // figures
        if(activity.figures[actArray[i][1]] !== undefined){
            //if(MM.memory["dest"]===undefined)MM.memory["dest"] = content;
            MM.memory["fl"+questionCount] = new Figure(utils.clone(activity.figures[actArray[i][1]]), "fl"+questionCount, divq);
            MM.memory["fr"+questionCount] = new Figure(utils.clone(activity.figures[actArray[i][1]]), "fr"+questionCount, divqd);
        }
        try{
            const IDL = 'ansInputl'+'-'+questionCount;
            MM.mf[IDL] = new MathfieldElement({
                smartMode:true,
                virtualKeyboardMode:'off',
                fontsDirectory:'../katex/fonts',
            });
            let keys = activity.keys || undefined;
            MM.keyboards[IDL]= new keyBoard(MM.mf[IDL],keys,carte,"l","kl"+questionCount);
            MM.mf[IDL].id = IDL;
            MM.mf[IDL].target = carte;
            MM.mf[IDL].addEventListener("keyup",function(event){
                if(event.key === "Enter" || event.code === "NumpadEnter"){
                    nextSlide("l");
                    event.preventDefault();
                }
            });
            carte.appendChild(MM.mf[IDL]);

            const IDR = 'ansInputr'+'-'+questionCount;
            MM.mf[IDR] = new MathfieldElement({
                smartMode:true,
                virtualKeyboardMode:'off',
                fontsDirectory:'../katex/fonts',
            });
            MM.keyboards[IDR]= new keyBoard(MM.mf[IDR],keys,carted,"r","kr"+questionCount);
            MM.mf[IDR].id = IDR;
            MM.mf[IDR].target = carted;
            MM.mf[IDR].addEventListener("keyup",function(event){
                if(event.key === "Enter" || event.code === "NumpadEnter"){
                    nextSlide("r");
                    event.preventDefault();
                }
            })
            carted.appendChild(MM.mf[IDR]);
        } catch(error){
            console.log(error);
        }
        contentLeft.appendChild(carte);
        contentRight.appendChild(carted);
        questionCount++;
    }
    //content.appendChild(sectionCartes);
    if(!utils.isEmpty(MM.memory)){
        setTimeout(function(){
            for(const k in MM.memory){
                if(k!=="dest")
                    MM.memory[k].display(MM.memory["dest"]);
            }
        }, 500);
    }
    common.mathRender("onlyMathSpan")
}
/**
 * Récupère les paramètres indiqués dans l'url de la page appelée.
 * @param {string} urlString adresse de la page
 */
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
        parameters.alea = common.setSeed();
        // paramètres des activités des paniers
        let json = vars.c;
        // parametres globaux :
        parameters.tailleTexte=10.5;
        parameters.nb=Number(vars.n);
        parameters.typeduel=decodeURI(vars.ty);
        parameters.totaltime=vars.t||false;
        if(parameters.totaltime){
            // on cache les jauges d'avancement si on est en mode temps limité (et donc pas de nombre max de réponses).
            document.getElementById("jauger").classList.add("hidden");
            document.getElementById("jaugel").classList.add("hidden");
        }
        document.getElementById("duel-type").innerHTML = typesDuel[parameters.typeduel];

        if(parameters.typeduel === "tochoose"){ // choix laissé aux joueurs
            document.getElementById("typeduelchoice").classList.remove("hidden");
            // choix par défaut :
            parameters.typeduel = "normal";
        }
        parameters.bg=vars.bg;
        // Affectation de la valeur au nombre de feuilles
        zoom = new Zoom("changeFontSize","#thehtml",true,"pt",11);
        document.getElementById("creator-menu").appendChild(zoom.createCursor());
        document.querySelector("html").style["fontSize"] = 11+"pt";
        //console.log(parameters);
        // alcarts contient des promises qu'il faut charger
        parameters.cart = new cart(0);
        parameters.cart.import(json[0],false).then(()=>{
            makePage()
        }).catch(err=>{
            // erreur à l'importation :(
            let alert=utils.create("div",
            {
                id:"messageerreur",
                className:"message",
                innerHTML:"Impossible de charger le panier :(<br>"+err
            });
            document.getElementById("creator-menu").appendChild(alert);
        });
    } else console.log("Problème dans l'url")
}
checkURL();
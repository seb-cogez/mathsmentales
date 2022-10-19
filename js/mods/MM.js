import utils from "./utils.min.js";
import sound from "./sound.min.js";
import cart from "./cart.min.js";
import steps from "./steps.min.js";
import Zoom from "./zoom.min.js";
import Figure from "./figure.min.js";
import timer from "./timer.min.js";
import keyBoard from "./keyboard.min.js";
import ficheToPrint from "./fichetoprint.min.js";
export {MM as default}
const MM = {
    version:7,// à mettre à jour à chaque upload pour régler les pb de cache
    content:undefined, // liste des exercices classés niveau/theme/chapitre chargé au démarrage
    introType:"321",// type of the slide's intro values : "example" "321" "nothing"
    endType:"nothing",// type of end slide's values : "correction", "nothing", "list"
    touched:false,// marker to know if the screen has been touched => online answers with virtual keyboard
    selectedCart:0,
    seed:"", // String to initialize the randomization
    editedActivity:undefined, // object activity 
    slidersOrientation: "", // if vertical => vertical presentation for 2 sliders
    onlineState:"no", // true if user answers on computer (Cf start and online functions)
    carts:[], // max 4 carts
    steps:[],
    timers:[],
    figs:{}, // 
    userAnswers:[[],[],[],[]],
    slidersNumber:1,
    faceToFace:'n',
    colorSelectors:[],
    colors:[],// couleurs de fond des diaporamas
    memory:[],// memoire des figures
    goodAnswers:[],// stockage des réponses attendues dans le online,
    zooms:{},// zooms créés pour chaque élément d'affichage,
    mf:{},// MathFields pour réponses en ligne,
    keyboards:{},// claviers virtuels pour réponses en ligne
    ended:true,
    embededIn:false, // variable qui contient l'url du site dans lequel MM est affiché (vérifier url)
    setEndType(value){
        this.endType = value;
    },
    setIntroType(value){
        this.introType = value;
    },
    setOnlineState(value){
        this.onlineState = value;
        // Mise à jour du champ
        document.querySelector("input[name='online'][value='"+value+"']").checked = true;
    },
    getOnlineState(){
        this.onlineState = utils.getRadioChecked("online");
    },
    editActivity:function(index){
        index = Number(index);
        MM.editedActivity = MM.carts[MM.selectedCart].activities[index];
        MM.setTempo(MM.editedActivity.tempo);
        MM.setNbq(MM.editedActivity.nbq);
        MM.carts[MM.selectedCart].editedActivityId = index;
        MM.carts[MM.selectedCart].display();
        MM.editedActivity.display();
        document.getElementById("unlinkCart").className = "";
        document.getElementById("addToCart").className = "hidden";
        document.getElementById("removeFromCart").className = "";
    },
    uneditActivity:function(){
        document.getElementById("addToCart").className = "";
        document.getElementById("removeFromCart").className = "hidden";
        document.getElementById("unlinkCart").className = "hidden";
    },
    unlinkActivity:function(){
        this.uneditActivity();
        MM.editedActivity = new activity(utils.clone(MM.editedActivity));
        MM.editedActivity.display();
        MM.carts[MM.selectedCart].editedActivityId = -1;
        MM.carts[MM.selectedCart].display();
    },
    setTempo:function(value){
        document.getElementById("tempo-slider").value = value;
        document.getElementById('tempo-value').innerHTML = value+" s.";
    },
    setNbq:function(value){
        document.getElementById("nbq-slider").value = value;
        document.getElementById('nbq-value').innerHTML = value;
    },
    resetCarts:function(){
        let Cart = new cart(0);
        MM.carts=[Cart];
        MM.setMinimalDisposition(0);
        MM.steps=[];
        MM.timers=[];
        MM.figs={};
        MM.resetInterface();
    },
    resetInterface(){
        document.getElementById("divcarts").className="hidden";
        document.getElementById("phantom").className="";
        document.getElementById("divparams").className="col-2 row-3";
        // on check tous les boutons radio en fonction des valeurs en méméoire
        utils.checkRadio("direction",this.slidersOrientation);
        utils.checkRadio("beforeSlider",this.introType);
        utils.checkRadio("endOfSlideRadio",this.endType);
        utils.checkRadio("online",this.onlineState);
        utils.checkRadio("facetoface",this.faceToFace);
        utils.checkRadio("Enonces",this.slidersNumber);
    },
    showCartInterface(){
        document.getElementById("divcarts").className="row-4";
        document.getElementById("phantom").className="hidden";
        document.getElementById("divparams").className="row-3";
    },
    addCart:function(){
        this.uneditActivity();
        let cartsNb = MM.carts.length+1;
        if(cartsNb>4) return false;
        MM.carts[cartsNb-1] = new cart(cartsNb-1);
        MM.setMinimalDisposition(cartsNb-1);
        // add cart button
        let button = utils.create("button");
        button.value = cartsNb;
        button.className = "tabs-menu-link";
        button.innerHTML = '<img src="img/cart'+cartsNb+'.png">';
        button.id = "button-cart"+cartsNb;
        let addcart = document.getElementById('addcart');
        let cartsMenu = document.getElementById('cartsMenu');
        let lastButton = cartsMenu.removeChild(addcart);
        cartsMenu.appendChild(button).click();
        // hide + button if 4 carts
        if(cartsNb < 4){
            cartsMenu.appendChild(lastButton);
        }
    },
    /**
     * fonction qui récupère la liste des activités d'un panier
     * 
     * return DOM object
     */
    getCartsContent:function(){
        let div = utils.create("div",{style:"display:flex;"});
        for(let i=0;i<MM.carts.length;i++){
            let ul = utils.create("ul",{innerHTML:"<span class='bold'>"+MM.carts[i].title+"</span>"});
            let acts = MM.carts[i].activities;
            for(let j=0;j<acts.length;j++){
                let li = utils.create("li", {innerText:acts[j].title});
                ul.appendChild(li);
            }
            div.appendChild(ul);
        }
        return div;
    },
    /**
    * recrée les boutons de sélection de panier en fonction des paniers existants.
    *
    */
    restoreCartsInterface:function(){
        let cartsMenu = document.getElementById('cartsMenu');
        cartsMenu.innerHTML = `<button class="tabs-menu-link is-active" value="1" id="button-cart1"><img src="img/cart1.png"></button>
        <button id="addcart" title="Ajouter un panier"><img src="img/cartadd.png"></button>`;
        for(let i=1;i<this.carts.length;i++){
            let btnnb = i+1;
            let button = utils.create("button",{
                value:btnnb,
                className:"tab-menu-link",
                innerHTML:'<img src="img/cart'+btnnb+'.png">',
                id:"button-cart"+btnnb
            });
            let addcart = document.getElementById('addcart');
            let lastButton = cartsMenu.removeChild(addcart);
            cartsMenu.appendChild(button);
            if(btnnb < 4){
                cartsMenu.appendChild(lastButton);
            }    
        }
    },
    removeCart:function(index){
        if(!window.confirm("Vous êtes sur le point de supprimer ce panier.\nConfirmez-vous ?")){
            return false;
        }
        // remove last cart button
        let buttonCartToremove = document.getElementById('button-cart'+MM.carts.length);
        let cartsMenu = document.getElementById('cartsMenu');
        cartsMenu.removeChild(buttonCartToremove);
        // recreate buttonAddCart if necessary
        if(!document.getElementById("addcart")){
            let buttonAddCart = document.createElement("button");
            buttonAddCart.id = "addcart";
            buttonAddCart.innerHTML = '<img src="img/cartadd.png">';
            buttonAddCart.onclick = function(){
                MM.addCart();
            }
            cartsMenu.appendChild(buttonAddCart);
        }
        // delete cart
        MM.carts.splice(index-1,1);
        MM.setMinimalDisposition(MM.carts.length-1);
        // show Cart1
        MM.showCart(1);
        // rewrite all contents
    },
    showCart(index){
        this.uneditActivity();
        index = Number(index);
        MM.selectedCart = index-1;
        for (let i=1,nb=MM.carts.length,btn;i<=4;i++){
            if(i<=nb)
                btn = document.getElementById('button-cart'+i);
            let div = document.getElementById('cart'+(i-1));
            if(i!==index){
                div.className = "hidden";
                if(i<=nb)utils.removeClass(btn,"is-active");
            } else {
                div.className = "cartcontent";
                if(i<=nb)utils.addClass(btn,"is-active");
            }
        }
        // show edited activity
        if(MM.carts[MM.selectedCart].editedActivityId > -1){
            MM.carts[MM.selectedCart].activities[MM.carts[MM.selectedCart].editedActivityId].display();
            this.editActivity(MM.carts[MM.selectedCart].editedActivityId);
        }
    },
    emptyCart(index){
        if(window.confirm("Vous êtes sur le point de vider ce panier.\nConfirmez-vous ?")){
            MM.carts[index-1].activities = [];
            MM.carts[index-1].editedActivityId = -1;
            MM.carts[index-1].display();
        } else return false;
    },
    addToCart(){
        MM.carts[MM.selectedCart].addActivity(MM.editedActivity);
        // on affiche les panier
        MM.showCartInterface();
    },
    removeFromCart(id=false){
        let cart = MM.carts[MM.selectedCart];
        let idact = id?id:cart.editedActivityId;
        if(!id || Number(id) == Number(cart.editedActivityId)){
            cart.editedActivityId = -1;
            document.getElementById("addToCart").className = "";
            document.getElementById("removeFromCart").className = "hidden";
            document.getElementById("unlinkCart").className = "hidden";
        }
        cart.removeActivity(idact);
    },
    /**
     * regarde si tous les paniers sont chargés
     * si oui, on lance le diaporama.
     */
    checkLoadedCarts(start=false){
        let loaded = true;
        for(const panier of this.carts){
            if(!panier.loaded)
                loaded = false;
        }
        if(loaded){
            if(start)
                MM.start();
            else {
                const tabaccueil = document.getElementById("tab-accueil");
                let message = `Tu as suivi un lien d'activité préconfigurée MathsMentales.<br>Clique ci-dessous pour démarrer.<br><br><button class="button--primary" id="btn-message-start"> Démarrer le diaporama </button>`;
                if(MM.carts.length === 1 && sound.selected===null)
                    message += `<br><br><button class="button--info" id="btn-message-sound">Avec du son</button>`;
                if(MM.carts.length===1 && MM.carts[0].target.length===1)
                    message +=`<br><br> ou <button class="button--success" id="btn-message-interact"> Commencer (interactif)</button>`;
                let alert=utils.create("div",{id:"messageinfo",className:"message",innerHTML:message});
                tabaccueil.appendChild(alert);
                tabaccueil.addEventListener("click",(evt)=>{
                    switch (evt.target.id){
                        case "btn-message-start":
                            utils.closeMessage('messageinfo');MM.start()
                            break;
                        case "btn-message-sound":
                            sound.next();
                            break;
                        case "btn-message-interact":
                            utils.closeMessage('messageinfo');MM.setOnlineState('yes');MM.start()
                            break;
                        default:
                            break;
                    }
                });
            }
        } else {
            let messageinfo = document.getElementById("messageinfo");
            if(messageinfo !== null){
                messageinfo.innerHTML +="<br><br>Le chargement n'est pas encore terminé. Patience...";
            }
        }
    },
    /**
     * création des affichages dans les diaporamas et les zones de rappel du site.
     * @param {boolean} withAnswer insère les réponses dans le diaporama si true
     */
    populateQuestionsAndAnswers(withAnswer){
        if(withAnswer=== undefined)withAnswer = true;
        MM.figs = {};MM.steps=[];MM.timers=[];MM.memory={};MM.goodAnswers=[];
        // length = nombre de paniers
        let length=MM.carts.length;
        let enonces = document.getElementById('enonce-content');
        let corriges = document.getElementById('corrige-content');
        if(length>1){
            enonces.className = "grid-"+length;
            corriges.className = "grid-"+length;
        }
        enonces.innerHTML="";
        corriges.innerHTML="";
        utils.setSeed();
        MM.copyURLtoHistory();
        // parcours des paniers
        for(let i=0;i<length;i++){
            MM.carts[i].actsArrays = [];
            // parcours des destinations du panier
            for(let kk=0,clen=MM.carts[i].target.length;kk<clen;kk++){
                let indiceSlide = 0;
                MM.goodAnswers[kk]=[];
                let slideNumber = MM.carts[i].target[kk]-1;
                let slider = document.getElementById("slider"+slideNumber);
                if(MM.colors[slideNumber]!==undefined){
                    slider.style["background"] = MM.colors[slideNumber];
                }
                let addTitle = "";
                if(clen>1)addTitle = "-"+(kk+1);
                let titleSlider = MM.carts[i].title+addTitle;
                document.querySelector("#slider"+slideNumber+" .slider-title").innerHTML = titleSlider;
                let sliderSteps = document.querySelector("#slider"+slideNumber+" .steps-container");
                let dive = utils.create("div",{id:"de"+i+"-"+kk});
                let divc = utils.create("div",{id:"dc"+i+"-"+kk});
                MM.zooms["zc"+i+"-"+kk] = new Zoom("zc"+i+"-"+kk,"#dc"+i+"-"+kk+" ol", true);
                MM.zooms["ze"+i+"-"+kk] = new Zoom("ze"+i+"-"+kk,"#de"+i+"-"+kk+" ol", true);
                dive.appendChild(MM.zooms["ze"+i+"-"+kk].createCursor());
                divc.appendChild(MM.zooms["zc"+i+"-"+kk].createCursor());
                let h3e = utils.create("h3",{innerText:titleSlider}); // exercice's title
                let h3c = utils.create("h3",{innerText:titleSlider});// correction's title
                dive.append(h3e);
                divc.append(h3c);
                let ole = utils.create("ol");
                let olc = utils.create("ol");
                // mise en couleur des listes énoncés et corrigés. (pour bilan ou impression)
                if(MM.colors[slideNumber]!==undefined){
                    ole.style["background"] = MM.colors[slideNumber];
                    olc.style["background"] = MM.colors[slideNumber];
                }
                MM.steps[slideNumber] = new steps({size:0, container:sliderSteps});
                MM.timers[slideNumber] = new timer(slideNumber);
                let actsArray=[];
                // on fait la liste des références activités / questions pour pouvoir créer les affichages
                for(let z=0,alen=MM.carts[i].activities.length;z<alen;z++){
                    let activity = MM.carts[i].activities[z];
                    activity.generate();
                    MM.goodAnswers[kk][z]=utils.clone(activity.values);
                    MM.steps[slideNumber].addSize(activity.nbq);
                    for(let j=0;j<activity.questions.length;j++){
                        actsArray.push([z,j]);
                    }
                }
                // on mélange les références si on veut que tout soit mélangé.
                if(!MM.carts[i].ordered){
                    actsArray = utils.shuffle(actsArray);
                }
                // on stocke les associations pour pouvoir comparer quand on fera le online
                MM.carts[i].actsArrays[kk] = actsArray;
                // parcours des questions
                for(let ff=0;ff<actsArray.length;ff++){
                    let activity = MM.carts[i].activities[actsArray[ff][0]];
                    // pour ne pas tout réécrire :
                    // j est le numéro de la question
                    let j = actsArray[ff][1];
                    let question = activity.questions[j];
                    let answer = activity.answers[j];
                    let fontSize = activity.textSize || false;
                    // slides
                    let color = ff%2?" pair":" impair";
                    let div = utils.create("div",{className:"slide w3-animate-top"+(indiceSlide>0?" hidden":"")+color,id:"slide"+slideNumber+"-"+indiceSlide});
                    let span = utils.create("span",{innerHTML:question});
                    if(fontSize)span.className=fontSize;
                    let spanAns = utils.create("span",{className:"answerInSlide hidden"})
                    if(Array.isArray(answer))
                        spanAns.innerHTML =answer[0];
                    else
                        spanAns.innerHTML =answer;
                    if(fontSize)spanAns.className+=" "+fontSize;
                    // timers
                    MM.timers[slideNumber].addDuration(activity.tempo);
                    // enoncés et corrigés
                    let lie = utils.create("li");
                    let lic = document.createElement("li");
                    let tex = false; let spane,spanc;
                    if(activity.type === undefined || activity.type === "" || activity.type === "latex"){
                        tex = true;
                        spane = utils.create("span",{className:"math", innerHTML:question});
                        lie.appendChild(spane);
                        spanc = utils.create("span",{className:"math"});
                        lic.appendChild(spanc);
                        span.className +=" math";
                        spanAns.className += " math";
                    } else {
                        lie.innerHTML=question;
                    }
                    div.appendChild(span);
                    if(MM.onlineState !=="yes"){
                        // include answer if not online state
                        div.appendChild(spanAns);
                    }
                    // insertion du div dans le slide
                    slider.appendChild(div);
                    if(Array.isArray(answer)){
                            if(!tex)lic.innerHTML += answer[0];
                            else spanc.innerHTML += answer[0];
                        }
                    else{
                        if(tex)
                            spanc.innerHTML += answer;
                        else
                            lic.innerHTML += answer;
                    }
                        
                    if(activity.figures[j] !== undefined){
                        lic.innerHTML += "&nbsp; <button data-id=\"c"+slideNumber+"-"+indiceSlide+"\">Figure</button>";
                        MM.figs[slideNumber+"-"+indiceSlide] = new Figure(utils.clone(activity.figures[j]), "c"+slideNumber+"-"+indiceSlide, div);
                        MM.memory['e'+slideNumber+"-"+indiceSlide] = new Figure(utils.clone(activity.figures[j]), "en"+slideNumber+"-"+indiceSlide, lie,[300,150]);
                        MM.memory['c'+slideNumber+"-"+indiceSlide] = new Figure(utils.clone(activity.figures[j]), "cor"+slideNumber+"-"+indiceSlide, lic,[450,225]);
                    }
                    ole.appendChild(lie);
                    olc.appendChild(lic);
                    indiceSlide++;
                }
                dive.append(ole);
                divc.append(olc);
                enonces.append(dive);
                corriges.append(divc);
                MM.steps[slideNumber].display();
                if(!utils.isEmpty(MM.figs)){
                    setTimeout(function(){
                    for(let j=0;j<indiceSlide;j++){
                        // toutes les questions ne comportent pas de figures, on vérifie qu'il y en a.
                        if(MM.memory['e'+slideNumber+"-"+j] !== undefined)
                            MM.memory['e'+slideNumber+"-"+j].display();
                    }
                });
                }
            }
        }
        utils.mathRender();
    },
    /**
     * Create the user inputs to answer the questions
     * Ne fonctionnera qu'avec un panier unique
     * 
     */
    createUserInputs:function(){
        MM.mf = {};
        MM.keyboards = {};
        //let slider=0,slide = 0;
        for(let slider=0,len=MM.carts[0].target.length;slider<len;slider++){
            for(let slide=0,len2=MM.carts[0].actsArrays[slider].length;slide<len2;slide++){
                const MFTARGET = document.getElementById("slider"+slider);
                const element = document.getElementById("slide"+slider+"-"+slide);
                const ID = 'ansInput'+slider+'-'+slide;
                MM.mf[ID] = new MathfieldElement({
                    smartMode:true,
                    virtualKeyboardMode:'off',
                    fontsDirectory:'../katex/fonts',
               });
               //if(MM.touched){
                    let keys = MM.carts[0].activities[MM.carts[0].actsArrays[slider][slide][0]].keyBoards[slide] || undefined;
                    MM.keyboards[ID]= new keyBoard(MM.mf[ID],keys,element,slider);
                    // si on affiche une figure, on diminue la taille du champ de réponse.
                    if(MM.figs[slider+"-"+slide]!== undefined){
                        MM.mf[ID].style.fontSize = "0.333em";
                    }
                //}
               MM.mf[ID].id = ID;
               MM.mf[ID].target = element;
               MM.mf[ID].addEventListener("keyup",function(event){
                    if(event.key === "Enter" || event.code === "NumpadEnter"){
                        MM.nextSlide(slider);
                        event.preventDefault();
                }
                });
                element.appendChild(MM.mf[ID]);
                element.appendChild(utils.create("div",{style:"height:270px;"}));
            }
        }
    },
    setFacetoFace(etat){
        this.faceToFace = etat;
        if(etat === "y"){
            utils.addClass(document.getElementById("sddiv1"),"return");
            if(MM.slidersNumber>2)
                utils.addClass(document.getElementById("sddiv2"),"return");
        } else {
            utils.removeClass(document.getElementById("sddiv1"),"return");
            utils.removeClass(document.getElementById("sddiv2"),"return");
        }
    },
    getFacetoFace(){
        this.faceToFace = utils.getRadioChecked("facetoface");
    },
    /**
     * Create a sheet of exercices
     * called by parameters
     */
    createExercicesSheet:function(){
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        let withSeed = false;
        if(document.getElementById("aleaInURL").checked)withSeed = true;
        let params = this.paramsToURL(withSeed,"exosheet");
        let value = this.setURL(params,"exosheet");
        MM.window = window.open(value,"mywindow","location=no,menubar=no,titlebar=no,width=1123");
    },
    createCourseAuxNombres:function(){
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        let withSeed = false;
        if(document.getElementById("aleaInURL").checked)withSeed = true;
        let params = this.paramsToURL(withSeed,"cansheet");
        let value = this.setURL(params,"cansheet");
        MM.window = window.open(value,"mywindow","location=no,menubar=no,titlebar=no,width=1123");
    },
    /**
     * Create a sheet of exercices
     * called by parameters
     */
    createExamSheet:function(){
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        MM.fiche = new ficheToPrint("exam",MM.carts[0]);
    },
    createCeintureSheet:function(){
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        // vérification du nombre de questions du panier
        let nbq = 0;
        for(let i=0;i<MM.carts[0].activities.length;i++){
            nbq += Number(MM.carts[0].activities[i].nbq);
        }
        // calcul du nombre de questions de la ceinture
        let nbqc = Number(document.getElementById("ceintcolsval").value)*Number(document.getElementById("ceintrowsval").value);
        if(nbq<nbqc){ // si pas assez de questions dans le panier, alerter et s'arrêter
            alert("Pas assez de questions dans le panier pour alimenter la ceinture\nde "+
            document.getElementById("ceintcolsval").value+"×"+document.getElementById("ceintrowsval").value+
            "="+nbqc+" emplacements"
            );
            return;
        } else if(nbq>nbqc){
            if(!confirm("Vous allez créé une ceinture de "+nbqc+" emplacements\nalors que vous avez créé un panier de"+
            nbq+"questions.\nToutes ne seront donc pas imprimées. Continuer ?")){
                return;
            }
        }
        let withSeed = false;
        if(document.getElementById("aleaInURL").checked)withSeed = true;
        let params = this.paramsToURL(withSeed,"ceinture");
        let value = this.setURL(params,"ceinture");
        MM.window = window.open(value,"mywindow","location=no,menubar=no,titlebar=no,width=1123");
        //MM.fiche = new ficheToPrint("ceinture",MM.carts[0],utils.getRadioChecked("ceintorientation"));
    },
    createFlashCards:function(){
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        MM.fiche = new ficheToPrint("flashcard",MM.carts[0]);
    },
    createWhoGots:function(){
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        MM.fiche = new ficheToPrint("whogots",MM.carts[0]);
    },
    createDominos:function(){
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        let withSeed = false;
        if(document.getElementById("aleaInURL").checked)withSeed = true;
        let params = this.paramsToURL(withSeed,"dominossheet");
        let value = this.setURL(params,"dominossheet");
        MM.window = window.open(value,"mywindow","location=no,menubar=no,titlebar=no,width=1123");
    },
    duelLaunch:function(){
        if(!MM.editedActivity) return;
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        let withSeed = false;
        let params = this.paramsToURL(withSeed,"duel");
        let value = this.setURL(params,"duel");
        MM.window = window.open(value,"mywindow","location=no,menubar=no,titlebar=no,width=720");
    },
    /**
     * Start the slideshow
     */
    start:function(){
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        MM.getOnlineState();
        if(MM.onlineState === "yes"){
            MM.userAnswers = [[],[],[],[]];
            // security there should not be more than 1 cart for the online use
            // TODO à adapter pour le mode duel
            if(MM.carts.length > 1){
                for(let i=1,len=MM.carts.length;i<len;i++){
                    delete MM.carts[i];
                }
            }
            // cacher le menu de commandes général
            document.querySelector("#slideshow-container > header").className="hidden";
        } else {
            // montrer le menu de commandes général
            document.querySelector("#slideshow-container > header").className="";
        }
        utils.showTab("none");
        // check if an option has been chosen
        MM.checkIntro();
        MM.createSlideShows();
        MM.populateQuestionsAndAnswers();
        if(MM.introType === "321"){
            document.getElementById("countdown-container").className = "";
            if(sound.selected){
                setTimeout(()=>{sound.beeps();},800);
                setTimeout(()=>{sound.setSound(sound.selected)},3500);
            }
            setTimeout(function(){
                document.getElementById("countdown-container").className = "hidden";
                if(MM.onlineState === "yes") { // create inputs for user
                    MM.createUserInputs();
                }
                MM.showSlideShows();
                MM.startTimers();
            },3600);
        } else if(MM.introType ==="example"){
            // on affiche un exemple
            MM.showSampleQuestion();
            MM.showSlideShows();
        } else {
            // on démarre directement
            if(MM.onlineState === "yes") { // create inputs for user
                MM.createUserInputs();
            }
            MM.showSlideShows();
            MM.startTimers();
        }
        this.ended=false;// utilisé à la fin du diapo
    },
    paramsToURL(withAleaSeed=false,type=""){
        let colors = MM.colors.join("~").replace(/\,/g,"_");
        if(type==="exosheet"){
            return "s="+document.getElementById("exTxtSizeValue").value+
                ",n="+document.getElementById("exQtyValue").value+
                ",cor="+utils.getRadioChecked("excorr")+
                ",a="+(withAleaSeed?MM.seed:"")+
                ",t="+encodeURI(document.getElementById("extitle").value||document.getElementById("extitle").placeholder)+
                ",ex="+encodeURI(document.getElementById("exeachex").value||document.getElementById("exeachex").placeholder)+
                this.export();
        } else if(type==="cansheet"){
            return "n="+document.getElementById("canqtyvalue").value+
            ",t="+encodeURI(document.getElementById("cantitle").value||document.getElementById("cantitle").placeholder)+
            ",a="+(withAleaSeed?MM.seed:"")+
            ",cor="+(utils.getRadioChecked("cancorrpos")||"fin")+
            ",tm="+(document.getElementById("cantime").value||document.getElementById("cantime").placeholder)+
            ",t1="+encodeURI(document.getElementById("cancol1title").value||document.getElementById("cancol1title").placeholder)+
            ",t2="+encodeURI(document.getElementById("cancol2title").value||document.getElementById("cancol2title").placeholder)+
            ",t3="+encodeURI(document.getElementById("cancol3title").value||document.getElementById("cancol3title").placeholder)+
            this.export()
        } else if(type==="dominossheet"){
            return "n="+document.getElementById("dominosNbValue").value+
            ",a="+(withAleaSeed?MM.seed:"")+
            ",d="+(document.getElementById("dominosDoublons").checked)+
            this.export();
        } else if(type === "duel"){
            return "ty="+utils.getRadioChecked("dueltype")+
            ",bg="+document.getElementById("duelbackgroundselect").value+
            (utils.getRadioChecked("dueltemps")==="limit"?",t="+utils.timeToSeconds(document.getElementById("dueltotaltime").value):"")+
            this.export();
        } else if(type==="ceinture"){
            let chaine = "",t=0;
            // liste des titres :
            let titles = document.querySelectorAll("#ceintcolumnTitle input")
            titles.forEach(inp =>{
                chaine += ",t"+t+"="+(inp.value?utils.superEncodeURI(inp.value):"");
                t++;
            })
            return "t="+utils.superEncodeURI(document.getElementById("ceinttitle").value)+
            ",ke="+document.getElementById("ceintprintToEnonce").checked+
            ",kc="+document.getElementById("ceintprintToCorrige").checked+
            ",nc="+document.getElementById("ceintcolsval").value+
            chaine+
            ",a="+(withAleaSeed?MM.seed:"")+
            ",nr="+document.getElementById("ceintrowsval").value+
            ",n="+document.getElementById("ceintqtyvalue").value+
            ",cor="+(utils.getRadioChecked("ceintcorrpos")||"fin")+
            ",pie="+document.getElementById("ceintpiedcol").value+
            ",or="+(utils.getRadioChecked("ceintorientation")||"portrait")+
            this.export();
        }
        return "i="+MM.introType+
            ",e="+MM.endType+
            ",o="+MM.onlineState+
            ",s="+MM.slidersNumber+
            ",so="+MM.slidersOrientation+
            ",f="+MM.faceToFace+
            ",a="+(withAleaSeed?MM.seed:"")+
            ",colors="+colors+
            ",snd="+sound.selected+
            this.export();
    },
    // open an modal and
    // get the URL of direct access to the activity with actual parameters
    copyURL(type=""){
        const colparams = document.getElementById("colparameters");
        let modalMessage = utils.create("div",
            {
                id:"urlCopy",
                className:"message",
                style:"padding:1.5rem",
                innerHTML:`<div>Adresse longue<div>
                <textarea readonly="true" id="bigurl" cols="38" onfocus=""></textarea><br>
                <button id="btn-urlshorter">Raccourcir l'url</button><br>
                <input readonly="true" type="url" id="shorturl" size="38">
                <div id="shortQRdiv"></div>
                `
            })
        colparams.addEventListener("click",(evt)=>{
            if(evt.target.id === "btn-urlshorter")MM.getQR();
        });
        colparams.addEventListener("focus",(evt)=>{
            if(["bigurl","shorturl"].indexOf(evt.target.id)>-1)utils.copy(evt.target);
        })
        //let carts = this.export();
        let withSeed = false;
        if(document.getElementById("aleaInURL").checked)withSeed = true;
        let params = this.paramsToURL(withSeed,type);
        let close = utils.create("button",{innerHTML:"<img src='img/closebutton32.png'>",style:"position:absolute;top:0.5rem;right:0.5rem;padding:0;background:transparent"});
        close.onclick = ()=>{let m = document.getElementById("urlCopy");m.parentNode.removeChild(m)};
        modalMessage.appendChild(close);
        colparams.appendChild(modalMessage);
        //if(document.getElementById("aleaInURL").checked)params.a = MM.seed;
        let input = document.getElementById("bigurl");
        input.value = this.setURL(params,type);
        // on affiche (furtivement) le input pour que son contenun puisse être sélectionné.
        //input.className = "";
        //let value = input.value;
        navigator.clipboard.writeText(input.value);
        input.select();
        input.setSelectionRange(0,99999);
        //document.execCommand("copy");
        //input.className ="hidden";
        //let message = document.querySelector(".button--inverse .tooltiptext").innerHTML;
        //document.querySelector(".button--inverse .tooltiptext").innerHTML = "Copié !";
        //setTimeout(()=>document.querySelector(".button--inverse .tooltiptext").innerHTML = message,2500);
    },
    copyURLtoHistory(type=""){
        //let carts = this.export();
        const contener = document.querySelector("#tab-historique ol");
        let withSeed = true;
        let params = this.paramsToURL(withSeed,type);
        let url = this.setURL(params,type);
        let paramsSansSeed = this.paramsToURL(false,type);
        let urlSansSeed = this.setURL(paramsSansSeed,type);
        let li = utils.create("li");
        let typeName = "Panier"
        if(type==="cansheet"){
            typeName = "🏃‍♀️ Course aux nombres"
        } else if(type==="exosheet"){
            typeName = "📖 Fiche d'exercices"
        } else if(type==="duel"){
            typeName = "💫 Duel"
        } else if(type==="ceinture"){
            typeName = "🥋 Ceinture"
        }
        let span = utils.create("span", {innerText:typeName+" du "+utils.getDate()+": ",className:"bold"});
        li.appendChild(span);
        const a = utils.create("a",{href:url,innerText:"🎯 lien (mêmes données)"});
        li.appendChild(a);
        const a2 = utils.create("a",{href:urlSansSeed,innerText:"🎯 lien (autres données)"});
        li.appendChild(a2);
        let button = `
        <span class="pointer underline" data-url="${url}">🛠 éditer</span>
        <span class="pointer underline">❌ Supprimer</span>
        `;
        li.innerHTML += button;
        li.appendChild(this.getCartsContent());
        // on supprime les anciennes références à la même activité
        try{
            let lis = document.querySelectorAll("#tab-historique span[data-url='"+url+"']");
            for(let k=0;k<lis.length;k++){
                let parent = lis[k].parentNode;
                contener.removeChild(parent);
            }
        } catch(err){
            console.log(err)
        }
        // insertion de l'élément
        contener.prepend(li);
        // TODO
        // on supprime les références qui datent de plus de ...
        if(window.localStorage){
            localStorage.setItem("history",contener.innerHTML);
        }
    },
    /**
     * Enlève un élément du DOM de l'historique et enregistre localement au cas où.
     * @param {DOM element} elem 
     */
    removeFromHistory(elem){
        if(!confirm("Supprimer cet élément : \n"+elem.childNodes[0].innerText+" ?"))return false;
        document.querySelector("#tab-historique ol").removeChild(elem);
        // sauvergarde du résultat
        if(window.localStorage){
            localStorage.setItem("history",document.querySelector("#tab-historique ol").innerHTML);
        }
    },
    /**
     * Supprime les éléments d'un historique
     */
    removeSelectionFromHistory(){
        const CHECKED = document.querySelectorAll("#tab-historique input[class='checkhistoric']:checked");
        for(let i=CHECKED.length-1;i>=0;i--){
            let parent = CHECKED[i].parentNode;
            parent.parentNode.removeChild(parent);
        }
        // sauvergarde du résultat
        if(window.localStorage){
            this.createSelectHistory();
            localStorage.setItem("history",document.querySelector("#tab-historique ol").innerHTML);
            this.createSelectHistory();
        }
    },
    /**
     * Ajoute des cases de sélection de l'historique pour des actions groupées.
     */
    createSelectHistory(){
        if(!this.historySelectCreated){
            this.historySelectCreated=true;
            const LISTE = document.querySelectorAll("#tab-historique > ol > li");
            for(let i=0;i<LISTE.length;i++){
                let input = utils.create("input",{type:"checkbox",value:i,selected:false,className:"checkhistoric"});
                LISTE[i].prepend(input);
            }
            document.getElementById("actionsSelectHist").className = "";
        } else {
            this.destroySelectHistory();
            document.getElementById("actionsSelectHist").className = "hidden";
        }
    },
    /**
     * Détruit les cases de sélection.
     */
    destroySelectHistory(){
        this.historySelectCreated = false;
        const LISTE = document.querySelectorAll("#tab-historique > ol > li > input");
        for(let i=0;i<LISTE.length;i++) {
            LISTE[i].parentNode.removeChild(LISTE[i]);
        }
    },
    /**
     * Supprime tous les éléments de l'historique
     */
    emptyHistory(){
        if(!confirm("Confirmez-vous la suppression de tout l'historique ?"))return false;
        document.querySelector("#tab-historique ol").innerHTML = "";
        if(window.localStorage){
            localStorage.setItem("history","");
        }
    },
    generatePage(){
        window.alert("Fonctionalité en cours de développement.");
    },
    generateCode(){
        window.alert("Fonctionnalité en cours de développement");
    },
    getQR(){
        // si on n'est pas en mode edition de panier.
        if(MM.carts.length < 2 && MM.carts[0].activities.length < 2){
            MM.carts[0].activities = [];
            MM.carts[0].addActivity(MM.editedActivity);
        }
        // on récupère l'adresse créée
        let url = document.getElementById("bigurl").value;
        // raccourcissement de l'url
        let alert = document.getElementById("shortQRdiv");
        alert.innerHTML = "";
        let div = utils.create("div",{className:'lds-ellipsis',innerHTML:"<div></div><div></div><div></div><div></div>"});
        let div2 = utils.create("div",{innerHTML:"Génération en cours"});
        alert.appendChild(div);
        alert.appendChild(div2);
        let shorter = new XMLHttpRequest();
        shorter.onload = function(){
            alert.removeChild(div);
            alert.removeChild(div2);
            let shorturl = shorter.responseText;
            if(shorturl.indexOf("http:")!==0){
                alert.appendChild(utils.create("h2",{innertext:"Problème de récupération de l'url courte"}));
                return;
            }
            alert.appendChild(utils.create("h2",{innerText:"QRcode de l'exercice"}));
            let qrdest = utils.create("img",{id:"qrious","title":"Clic droit pour copier l'image"});
            alert.appendChild(qrdest);
            let inputShortUrl = document.getElementById("shorturl");
            inputShortUrl.value = shorturl;
            inputShortUrl.select();
            inputShortUrl.setSelectionRange(0,99999);
            document.execCommand("copy");
            let QR = new QRious({
                element: qrdest,// DOM destination
                value : shorturl,
                size: 200,
                padding:12
            });
        }
        shorter.open("get","getshort.php?url="+encodeURIComponent(url));
        shorter.send();
    },
    /**
     * Export all carts as string
     * @returns String 
     */
    export(){
        let urlString = "";
        if(MM.carts[0].activities.length < 2 && MM.carts.length === 1){
            MM.carts[0].activities = [];
            MM.carts[0].addActivity(MM.editedActivity);
        }
        MM.checkIntro();
        //utils.setSeed();
        //let carts = {};
        for(let i=0;i<this.carts.length;i++){
            //carts[i] = this.carts[i].export();
            urlString += this.carts[i].export();
        }
        return urlString;//carts;
    },
    setURL(string,type){
        if(type==="exosheet"){
            if(utils.baseURL.indexOf("index.html")<0)
                utils.baseURL+="index.html";
            return utils.baseURL.replace('index','exercices')+'?'+string+(MM.embededIn?'&embed='+MM.embededIn:"");
        } else if(type==="cansheet"){
            if(utils.baseURL.indexOf("index.html")<0)
                utils.baseURL+="index.html";
            return utils.baseURL.replace('index','courseauxnombres')+'?'+string+(MM.embededIn?'&embed='+MM.embededIn:"");
        } else if(type==="dominossheet"){
            if(utils.baseURL.indexOf("index.html")<0)
                utils.baseURL+="index.html";
            return utils.baseURL.replace('index','dominos')+'?'+string+(MM.embededIn?'&embed='+MM.embededIn:"");
        } else if(type==="duel"){
            if(utils.baseURL.indexOf("index.html")<0)
                utils.baseURL+="index.html";
            return utils.baseURL.replace('index','duel')+'?'+string+(MM.embededIn?'&embed='+MM.embededIn:"");
        } else if(type==="ceinture"){
            if(utils.baseURL.indexOf("index.html")<0)
                utils.baseURL+="index.html";
            return utils.baseURL.replace('index','ceinture')+'?'+string+(MM.embededIn?'&embed='+MM.embededIn:"");
        } else
            return utils.baseURL+'?'+string+(MM.embededIn?'&embed='+MM.embededIn:"");
    },
    checkIntro:function(){
        MM.introType = utils.getRadioChecked("beforeSlider");
        MM.endType = utils.getRadioChecked("endOfSlideRadio");
    },
    startTimers:function(){
        if(MM.onlineState === "yes" && !MM.touched){
            document.getElementById("ansInput0-0").focus();
        }
        for(let i=0,k=MM.timers.length;i<k;i++){
            MM.timers[i].start(0);
        }
    },
    showSampleQuestion:function(){
        let nb = MM.slidersNumber;
        utils.setSeed("sample");
        let container = document.getElementById("slideshow");
        let assocSliderActivity=[];
        // génération des données aléatoires pour les exemples
        for(let i=0,len=MM.carts.length;i<len;i++){
            MM.carts[i].activities[0].generateSample();
            for(let j=0;j<MM.carts[i].target.length;j++){
                assocSliderActivity[MM.carts[i].target[j]-1] = i;
            }
        }
        let divSample = utils.create("div",{id:"sampleLayer",className:"sample"});
        // creation des emplacements d'affichage
        for(let i=0;i<nb;i++){
            let div = utils.create("div",{id:"sample"+i});
            if(nb === 1)div.className = "slider-1";
            else if(nb===2)div.className = "slider-2";
            else div.className = "slider-34";
            let nextActivity = "";
            if(MM.carts[assocSliderActivity[i]].activities.length>1) {
                nextActivity = `<button title="Activité suivante du panier" data-actid="0" id="ButtonNextAct${i}"><img src="img/slider-next.png"></button>`;
            }
            div.innerHTML = `Exemple <div class="slider-nav">
            <button title="Annoter l'exemple" id="btn-sample-annotate${i}"><img src="img/iconfinder_pencil_1055013.png"></button>
            <button title="Montrer la réponse" id="btn-sample-showanswer${i}"><img src="img/slider-solution.png"></button>
            <button title="Autre exemple" id="btn-newsample${i}"><img src="img/newsample.png"></button>
            ${nextActivity}
            <button title="Démarrer le diaporama" id="btn-sample-start${i}"><img src="img/fusee.png"></button>
            </div>`;
            let divContent = utils.create("div",{className:"slide",id:"sampleSlide"+i});
            let span = utils.create("span",{id:"sample"+i+"-enonce"});
            let spanAnswer = utils.create("span",{id:"sample"+i+"-corr",className:"hidden"});
            divContent.appendChild(span);
            divContent.appendChild(spanAnswer);
            div.appendChild(divContent);
            // math or not ?
            // insert content
            divSample.appendChild(div);
        }
        container.appendChild(divSample);
        // ajout des données dans les emplacements
        for(let i=0;i<MM.carts.length;i++){
            for(let y=0;y<MM.carts[i].target.length;y++){
                let sN = MM.carts[i].target[y]-1;
                let act = MM.carts[i].activities[0];
                document.getElementById("sample"+sN+"-enonce").innerHTML = act.sample.question;
                document.getElementById("sample"+sN+"-corr").innerHTML = act.sample.answer;
                if(act.type === undefined || act.type==="" || act.type === "latex"){
                    document.getElementById("sample"+sN+"-enonce").className = "math";
                    document.getElementById("sample"+sN+"-corr").className += " math";
                }
                if(act.sample.figure !== undefined){
                    let fig = new Figure(utils.clone(act.sample.figure), "sample-c"+sN, document.getElementById("sampleSlide"+sN));
                    setTimeout(function(){fig.display();},100);
                }
            }
        }
        utils.mathRender();
    },
    showQuestions:function(){
        if(!MM.carts[0].activities.length)
            MM.carts[0].addActivity(MM.editedActivity);
        MM.createSlideShows();
        MM.populateQuestionsAndAnswers();
        utils.showTab(document.querySelector("[numero='#tab-enonce'].tabs-menu-link"));
        if(MM.carts.length === 1 && MM.carts[0].activities.length === 1){
            MM.resetCarts();
            MM.editedActivity.display();
        }
    },
    showAnswers:function(){
        if(!MM.carts[0].activities.length)
            MM.carts[0].addActivity(MM.editedActivity);
        MM.createSlideShows();
        MM.populateQuestionsAndAnswers();
        utils.showTab(document.querySelector("[numero='#tab-corrige'].tabs-menu-link"));
        if(MM.carts.length === 1 && MM.carts[0].activities.length === 1){
            MM.resetCarts();
            MM.editedActivity.display();
        }    
    },
    /**
     * 
     * 
     */
    createSlideShows:function(){
        MM.zooms={};
        MM.zooms["thezoom"] = new Zoom("thezoom","#slideshow .slide", true);
        let insertTo = document.querySelector("#slideshow-container header");
        let ispresent = insertTo.querySelector("#thezoom");
        if(ispresent){
            insertTo.removeChild(ispresent);
        }
        insertTo.appendChild(MM.zooms["thezoom"].createCursor());
        // pour compenser une erreur abominable créée lors de la création des urls.
        if(isNaN(MM.slidersNumber)){
            // on va checker le slidersNumber d'après les paniers
            let nb = 0;
            for(let i=0;i<MM.carts.length;i++){
                nb+=MM.carts[i].target.length;
            }
            if(nb<5)MM.slidersNumber = nb;
        }
        let nb = MM.slidersNumber;
        let container = document.getElementById("slideshow");
        container.innerHTML = "";
        if(MM.slidersOrientation === "v")utils.addClass(container,"vertical");
        else utils.removeClass(container,"vertical");
        if(MM.faceToFace==="y") utils.addClass(container,"return");
        else utils.removeClass(container,"return");
        for(let i=0;i<nb;i++){
            let facteurZoom = 1;
            let div = document.createElement("div");
            div.id = "slider"+i;
            if(nb === 1){div.className = "slider-1";facteurZoom=3;}
            else if(nb===2){div.className = "slider-2";facteurZoom=2;}
            else  {div.className = "slider-34";}
            // facetoface option
            /*if(nb>1 && MM.faceToFace==="y" && i===0)div.className += " return";
            else if(nb>2 && MM.faceToFace==="y" && i===1)div.className +=" return";*/
            let innerH = `<div class="slider-head"><div class="slider-nav">
            <button title="Arrêter le diaporama" id="btn-timer-end${i}"><img src="img/slider-stop.png" /></button>`;
            if(MM.onlineState==="no"){
                // on crée les boutons de pause et montrer réponse si on n'est pas en mode online
                innerH += `<button title="Mettre le diapo en pause", id="btn-timer-pause${i}"><img src="img/slider-pause.png" /></button>
                <button title="Montrer la réponse" id="btn-show-answer${i}"><img src="img/slider-solution.png" /></button>`;
            }
            MM.zooms["zs"+i] = new Zoom("zs"+i,"#slider"+i+" .slide",false,"em",facteurZoom);
            let zoom = MM.zooms["zs"+i].createCursor();
            innerH += `<button title="Passer la diapo" id="btn-next-slide${i}"><img src="img/slider-next.png" /></button>
            </div>
            <div class="slider-title"></div>
            <div class="slider-chrono"><progress class="progress is-link is-large" value="0" max="100"></progress></div></div>
            <div class="steps-container"></div>`;
            div.innerHTML = innerH;
            div.querySelector(".slider-head").appendChild(zoom);
            container.appendChild(div);
        }
    },
    showSlideShows:function(){
        utils.removeClass(document.getElementById("slideshow-container"),"hidden");
        utils.addClass(document.getElementById("app-container"), "hidden");
        if(sound.selected){sound.play();}
        if(!utils.isEmpty(MM.figs)){
            MM.displayFirstFigs();
        }
    },
    displayFirstFigs:function(){
        for(let i=0;i<4;i++){
            if(typeof MM.figs[i+"-0"] === "object"){
                MM.figs[i+"-0"].display();
            }
        }
    },
    hideSlideshows:function(){
        if(this.ended)return false; // on l'a déjà fait
        utils.addClass(document.getElementById("slideshow-container"),"hidden");
        utils.removeClass(document.getElementById("app-container"), "hidden");
        let whatToDo = utils.getRadioChecked("endOfSlideRadio");
        if(MM.onlineState === "yes"){
            // on affiche un message de fin qui attend une validation
            let alert = utils.create("div",{id:"messagefin",className:"message",innerHTML:`L'activité MathsMentales est terminée.<br>Pour consulter les résultats, cliquer sur le bouton ci-dessous.<br><br>
            <button id="btn-messagefin-close"> Voir le corrigé 
            </button>`});
            document.body.appendChild(alert);
            document.body.addEventListener("click",(evt)=>{if(evt.target.id==="btn-messagefin-close"){utils.closeMessage('messagefin');utils.showTab('tab-corrige');}});
        } else if(whatToDo === "correction"){
            utils.showTab("tab-corrige");
        } else if(whatToDo === "list"){
            utils.showTab("tab-enonce");
        }
        this.ended=true;
    },
    /**
     * Montre la réponse si l'une est indiquée (ne l'est pas pour un élève)
     * @param {Integer} id id du slide où afficher la réponse
     * @returns nothing
     */
    showTheAnswer(id){
        let answerToShow = document.querySelector("#slide"+id+"-"+MM.steps[id].step+" .answerInSlide");
        
        if(!answerToShow)return;
        if(answerToShow.className.indexOf("hidden")>-1){
            MM.timers[id].pause();
            utils.removeClass(answerToShow, "hidden");
        }else{
            utils.addClass(answerToShow, "hidden");
            MM.timers[id].start();
        }
    },
    showSampleAnswer(id){
        let answerToShow = document.getElementById("sample"+id+"-corr");
        if(answerToShow.className.indexOf("hidden")>-1){
            utils.removeClass(answerToShow, "hidden");
        }else{
            utils.addClass(answerToShow, "hidden");
        }
    },
    /**
     * 
     * @param {id} id id de l'emplacement de l'exemple
     * @param {boolean} next passe à l'activité suivante du panier.
     */
    newSample(id,next=false){
        for(let i=0,len=MM.carts.length;i<len;i++){
            if(MM.carts[i].target.indexOf(id+1)>-1){
                let nbActivities = MM.carts[i].activities.length;
                let actId = 0;
                // si le panier contient plusieurs activités,
                // on regarde l'id de l'activité à afficher.
                if(MM.carts[i].activities.length>1){
                    actId = document.getElementById("ButtonNextAct"+id).dataset.actid;
                    if(next){
                        actId++;
                        if(actId>=nbActivities) actId=0;
                        document.getElementById("ButtonNextAct"+id).dataset.actid = actId;
                    }
                }
                let act = MM.carts[i].activities[actId];
                act.generateSample();
                document.getElementById("sample"+id+"-enonce").innerHTML = act.sample.question;
                document.getElementById("sample"+id+"-corr").innerHTML = act.sample.answer;
                if(act.type === undefined || act.type==="" || act.type === "latex"){
                    document.getElementById("sample"+id+"-enonce").className = "math";
                    document.getElementById("sample"+id+"-corr").className += " math";
                }
                if(act.sample.figure !== undefined){
                    let item;
                    if(act.sample.figure.type === "chart"){
                        item = document.getElementById("div-dest-canvas-sample-c"+id);
                    }else{
                        item = document.getElementById("sample-c"+id);
                    }
                    item.parentNode.removeChild(item);
                    let fig = new Figure(utils.clone(act.sample.figure), "sample-c"+id, document.getElementById("sampleSlide"+id));
                    setTimeout(function(){fig.display();},100);
                }
                utils.mathRender();
            }
        }
    },
    removeSample(){
        let item = document.getElementById("sampleLayer");
        item.parentNode.removeChild(item);
    },
    startSlideShow(){
        MM.removeSample();
        if(MM.onlineState === "yes") { // create inputs for user
            MM.createUserInputs();
        }
        if(MM.onlineState === "yes" && !MM.touched){
            document.getElementById("ansInput0-0").focus();
        }
        MM.startTimers();
    },
    /**
     * 
     * @param {integer} id du slider (start to 0)
     */
    nextSlide:function(id){
        if(MM.onlineState === "yes"){ // save answer
            MM.userAnswers[id][MM.steps[id].step] = MM.mf["ansInput"+id+"-"+(MM.steps[id].step)].value;
        }
        let step = MM.steps[id].nextStep();
        if(step === false) {
            MM.timers[id].end();
            return false;
        }
        // joue le son si un seul panier
        if(MM.carts.length === 1){
            sound.play();
        }
        MM.timers[id].start(step);
        let slidetoHide = document.querySelector('#slide'+id+"-"+(step-1));
        let slide = document.querySelector('#slide'+id+"-"+step);
        utils.addClass(slidetoHide, "hidden");
        if(slide){
            utils.removeClass(slide, "hidden");
            if(MM.figs[id+"-"+step] !== undefined)
                MM.figs[id+"-"+step].display();
            if(MM.onlineState === "yes" && !MM.touched){
                // on met le focus dans le champ seulement si on est online et pas sur tablette/smartphone
                //document.getElementById("userAnswer"+step).focus();
                MM.mf["ansInput"+id+"-"+step].focus();
            } else if(MM.onlineState === "yes" && MM.touched){
                // on affiche le clavier quand on a un appareil touchable
                MM.mf["ansInput"+id+"-"+step].focus();
            }
        } else {
            // fin du slide mais n'arrive jamais
        }
    },
    messageEndSlide:function(id,nth){
        // TODO : revoir le truc pour ne pas empiéter sur le dernière slide (ou pas)
        let sliderMessage = document.querySelectorAll('#slider'+id+" .slide")[nth];
        sliderMessage.innerHTML = "<span>Fin du diaporama</span>";
        //utils.removeClass(sliderMessage,"hidden");
    },
    endSliders:function(){
        let ended = true;
        // check if all timers have ended
        for(let i=0, l=MM.timers.length;i<l;i++){
            if(MM.timers[i].ended === false)
                ended = false;
        }
        if(ended){
            // tous les slides sont terminés
            MM.hideSlideshows();
            // correction si online
            if(MM.onlineState === "yes"){
                let div = document.createElement("div");
                // correction
                // TODO : modifier pour les cas où il y aura plusieurs champs réponse
                // attention, les questions ont pu être mélangées, on va donc devoir associer correctement les réponses/questions
                // les réponses sont données dans l'ordre, mais pas les questions.
                // on peut avoir plusieurs utilisateurs... pour les duels
                // 1 utilisateur = un actArray
                for(let slider=0,len=MM.carts[0].actsArrays.length;slider<len;slider++){
                    let score = 0;
                    let ol = document.createElement("ol");
                    ol.innerHTML = "<b>Réponses de "+(slider+1)+"</b>";
                    let ia = 0;
                    // pour un target, on a l'ordre des activités et des réponses.
                    for(let slide=0,len2=MM.carts[0].actsArrays[slider].length;slide<len2;slide++){
                        let refs = MM.carts[0].actsArrays[slider][slide];
                        let li = document.createElement("li");
                        let span = document.createElement("span");
                        let userAnswer = MM.userAnswers[slider][ia].replace(",",".").trim();// on remplace la virgule française par un point, au cas où
                        if(userAnswer.indexOf("\\text")===0){
                            userAnswer = userAnswer.substring(6,userAnswer.length-1);
                        }
                        // remplacer un espace texte par un espace
                        userAnswer = userAnswer.replace("\\text{ }"," ");
                        userAnswer = userAnswer.replace(">","\\gt");
                        userAnswer = userAnswer.replace("<","\\lt");
                        const expectedAnswer = MM.goodAnswers[slider][refs[0]][refs[1]];//MM.carts[0].activities[refs[0]].values[refs[1]];
                        let valueType = MM.carts[0].activities[refs[0]].valueType;
                        //debug(userAnswer,expectedAnswer);
                        // TODO : better correction value
                        // prendre en compte les cas où plusieurs réponses sont possibles
                        // attention, si c'est du texte, il faut supprimer des choses car mathlive transforme 
                        if(Array.isArray(expectedAnswer)){
                            for(let i=0;i<expectedAnswer.length;i++){
                                if(String(userAnswer).toLowerCase()==String(expectedAnswer[i]).toLowerCase()){
                                    li.className = "good";
                                    score++;
                                    break;
                                } else {
                                    const expr1 = KAS.parse(expectedAnswer[i]).expr;
                                    const expr2 = KAS.parse(String(userAnswer).replace('²', '^2')).expr;
                                    try{if(KAS.compare(expr1,expr2,{form:true,simplify:false}).equal){
                                        // use KAS.compare for algebraics expressions.
                                        li.className = "good";
                                        score++;
                                        break;
                                    } else {
                                        li.className = "wrong";
                                    }
                                    } catch(error){
                                        li.className = "wrong";
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
                                    li.className = "good";
                                    score++;
                                } else {
                                    li.className = "wrong";
                                }
                            } else if(valueType === "inInterval"){
                                // ici la valeur doit être comprise entre les deux bornes de l'intervalle
                                let minmax = expectedAnswer.split("-").map(value=>Number(value));
                                //minmax[0] est la borne inf et minmax[1] est la borne sup;
                                if(Number(userAnswer)>minmax[0] && Number(userAnswer) < minmax[1]){
                                    li.className = "good";
                                    score++;
                                } else {
                                    li.className = "wrong";
                                }
                            }
                        } else {
                            if(String(userAnswer).toLowerCase()==String(expectedAnswer).toLowerCase()){
                                li.className = "good";
                                score++;
                            } else {
                                const expr1 = KAS.parse(expectedAnswer).expr;
                                const expr2 = KAS.parse(String(userAnswer).replace('²', '^2')).expr;
                                try{if(KAS.compare(expr1,expr2,{form:true,simplify:false}).equal){
                                    // use KAS.compare for algebraics expressions.
                                    li.className = "good";
                                    score++;
                                } else {
                                    li.className = "wrong";
                                }
                                } catch(error){
                                    li.className = "wrong";
                                }
                            }
                        }
                        // On transforme ça en champ LaTeX à afficher (vient mathlive qui renvoie du LaTeX)
                        span.className ="math";
                        userAnswer = "\\displaystyle "+userAnswer;
                        span.textContent = userAnswer;
                        ia++;
                        li.appendChild(span);
                        ol.appendChild(li);
                    }
                    div.appendChild(ol);
                    let section = document.createElement("section");
                    section.innerHTML = "<b>Score :</b> "+score+"/"+ia;
                    div.appendChild(section);
                    //envoi d'un message au site qui a intégré MM :
                    if(MM.embededIn){
                        window.parent.postMessage({ url: window.location.href, graine: MM.seed, nbBonnesReponses: score, nbMauvaisesReponses: parseInt(ia) - parseInt(score), slider: slider, touchable:MM.touched }, MM.embededIn);
                    }
                }
                document.getElementById("corrige-content").appendChild(div);
                // Mise en forme Maths
                utils.mathRender();
            } else {
                if(MM.embededIn){
                    window.parent.postMessage({ url: window.location.href, graine: MM.seed}, MM.embededIn);
                }
            }
            // if only one activity in one cart, we empty it
            // TODO : why do that ?
            if(MM.carts.length === 1 && MM.carts[0].activities.length === 1){
                MM.resetCarts();
                MM.editedActivity.display();
            }
        }
    },
    pauseAllSliders(){
        // on permet de mettre en pause uniquement si on n'est pas en mode online.
        if(MM.onlineState === "no"){
            for(let i=0,l=MM.timers.length; i<l;i++){
                MM.timers[i].pause();
            }
        }
    },
    stopAllSliders:function(){
        for(let i=0,l=MM.timers.length; i<l;i++){
            MM.timers[i].end();
        }
    },
    nextAllSliders:function(){
        for(let i=0,l=MM.steps.length;i<l;i++){
            MM.nextSlide(i);
        }
    },
    setMinimalDisposition:function(index){
        let radios = document.querySelectorAll("input[name='Enonces']");
        for(let i=0,l=radios.length;i<l;i++){
            if(i<index){
                radios[i].disabled = true;
            } else {
                radios[i].disabled = false;
            }
            if(i===index && MM.slidersNumber<=index+1){
                radios[i].checked = true;
                MM.setDispositionEnonce(index+1);
            }
        }
    },
    /**
     * déclenché par les boutons radio
     * règle l'affichage des disposition dans la fenêtre de paramétrage
     * et indique aux paniers où s'afficher
     * @param {integer} value Nombre de diaporamas à afficher
     */
    setDispositionEnonce:function(value){
        value = Number(value);
        MM.slidersNumber = value;
        document.getElementById("facetofaceOption").className = "";
        if(value === 1){
            document.getElementById("sddiv1").className = "sddiv1";
            document.getElementById("sddiv2").className = "hidden";
            document.getElementById("sddiv3").className = "hidden";
            document.getElementById("sddiv4").className = "hidden";
            document.getElementById("divisionsOption").className = "hidden";
            MM.setDispositionDoubleEnonce('h');
            MM.carts[0].target = [1];
            document.getElementById("facetofaceOption").className = "hidden";
        } else if(value === 2){
            let directions = document.querySelectorAll("input[name='direction']");
            if(directions[0].checked){ // horizontal
                MM.setDispositionDoubleEnonce('h');
            } else {
                MM.setDispositionDoubleEnonce('v');
            }
            if(MM.faceToFace === "y")
                document.getElementById("sddiv1").className = "sddiv2 return";
            else
                document.getElementById("sddiv1").className = "sddiv2";
            document.getElementById("sddiv2").className = "sddiv2";
            document.getElementById("sddiv3").className = "hidden";
            document.getElementById("sddiv4").className = "hidden";
            document.getElementById("divisionsOption").className = "";
            if(value > MM.carts.length){
                MM.carts[0].target = [1,2];
            } else {
                MM.carts[0].target = [1];
                MM.carts[1].target = [2];
            }
        } else if(value === 3){
            if(MM.faceToFace === "y"){
                document.getElementById("sddiv1").className = "sddiv34 return";
                document.getElementById("sddiv2").className = "sddiv34 return";    
            } else {
                document.getElementById("sddiv1").className = "sddiv34";
                document.getElementById("sddiv2").className = "sddiv34";    
            }
            document.getElementById("sddiv3").className = "sddiv34";
            document.getElementById("sddiv4").className = "hidden";
            document.getElementById("divisionsOption").className = "hidden";
            MM.setDispositionDoubleEnonce('h');
            if(MM.carts.length === 1){
                MM.carts[0].target = [1,2,3];
            } else if(MM.carts.length === 2){
                MM.carts[0].target = [1,2];
                MM.carts[1].target = [3];
            } else {
                MM.carts[0].target = [1];
                MM.carts[1].target = [2];
                MM.carts[2].target = [3];
            }
        } else if(value === 4){
            if(MM.faceToFace === "y"){
                document.getElementById("sddiv1").className = "sddiv34 return";
                document.getElementById("sddiv2").className = "sddiv34 return";
                } else {
                document.getElementById("sddiv1").className = "sddiv34";
                document.getElementById("sddiv2").className = "sddiv34";    
            }
            document.getElementById("sddiv3").className = "sddiv34";
            document.getElementById("sddiv4").className = "sddiv34";
            document.getElementById("divisionsOption").className = "hidden";
            MM.setDispositionDoubleEnonce('h');
            if(MM.carts.length === 1){
                MM.carts[0].target = [1,2,3,4];
            } else if(MM.carts.length === 2){
                MM.carts[0].target = [1,2];
                MM.carts[1].target = [3,4];
            } else if(MM.carts.length === 3){
                MM.carts[0].target = [1,2];
                MM.carts[1].target = [3];
                MM.carts[2].target = [4];
            } else {
                MM.carts[0].target = [1];
                MM.carts[1].target = [2];
                MM.carts[2].target = [3];
                MM.carts[3].target = [4];
            }
        }
        for(let i = 0,l=MM.carts.length;i<l;i++){
            MM.carts[i].display();
        }
    },
    setDispositionDoubleEnonce:function(option){
        if(option === "h"){
            MM.slidersOrientation = "h";
            document.getElementById("screen-division").className = "";
            document.querySelector("input[name='direction'][value='h']").checked = true;
        } else {
            MM.slidersOrientation = "v";
            document.getElementById("screen-division").className = "vertical";
            document.querySelector("input[name='direction'][value='v']").checked = true;
        }
    }
}
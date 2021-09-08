"use strict"

// Javascript Objects extensions
String.prototype.minusculesSansAccent = function(){
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

    var str = this;
    for(var i = 0; i < accent.length; i++){
        str = str.replace(accent[i], noaccent[i]);
    }
    return str.toLowerCase();
}
/**
 * Supprime un élément d'un tableau
 * @param {various} value 
 * @returns 
 */
Array.prototype.removeValue = function(value){
    // the value must be unique
    let index = this.indexOf(value);
    if(index>-1) {
        this.splice(index,1);
        return true;
    } else return false;
};
/**
 * récupère un tableau des clés d'un tableau
 * @returns keys if array
 */
Array.prototype.getKeys = function(){
    let table = [];
    for(let i=0,j=this.length;i<j;i++){
        table.push(i);
    }
    return table;
}

/**
 * shuffle values of an array
 * @returns array
 */
String.prototype.shuffle = function() {
 return this
   .split("")
   .sort(function(a, b) {
     return (Math.random() < 0.5 ? 1 : -1);
   }).join("");
};
var debug = function(){
    if(modeDebug)console.log(arguments);
}
// Some traductions
var moisFR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
var joursFR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

/**
 * objet contenant des fonctions utiles à MathsMentales
 */
var modeDebug = true;
var utils = {
    baseURL:/^.*\//.exec(window.location.href),
    seed: "sample",
    security:300,// max number for boucles
    /**
     * 
     * @param {String} type of DOM element
     * @param {object} props properties of the element
     */
    create:function(type,props){
        const elt = document.createElement(type);
        for(const p in props){
            elt[p] = props[p];
        }
        return elt;
    },
    copy(DOMel){
        DOMel.select();
        DOMel.setSelectionRange(0,99999);
        document.execCommand("copy");
        DOMel.className = "copied";
        setTimeout(()=>{DOMel.className="";},3000);
    },
    pageWidth() {
        return window.innerWidth != null? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body != null ? document.body.clientWidth : null;
    },
    /**
     * La transformation d'une ou d'un panier MMv1 étant assez compliquée,
     * redirection vers le dosser comportant l'ancienne version : /old
     */
    goToOldVersion(){
        window.location.href = utils.baseURL + 'old/'+(/(^.*\/)(.*)/.exec(window.location.href)[2]);
    },
    setHistory(pageName,params){
        let url = MM.setURL(params);
        history.pushState({'id':'Homepage'},pageName,url);
    },
    checkRadio(name,value){
        let domElt =  document.querySelector("input[type=radio][name='"+name+"'][value='"+value+"']");
        if(domElt)
            domElt.click();
        else
            return false;
    },
    /**
     * regarde les paramètres fournis dans l'url
     * et lance le diapo ou passe en mode édition
     */
    checkURL(urlString=false,start=true,edit=false){
        const vars = utils.getUrlVars(urlString);
        if(vars.n!== undefined && vars.cd===undefined){ // un niveau à afficher
            library.displayContent(vars.n,true);
            return;
        } else if(vars.u!==undefined && vars.cd === undefined){ // ancien exo MM1
            let regexp = /(\d+|T|G)/;// le fichier commence par un nombre ou un T pour la terminale
            // un paramétrage d'exercice à afficher
             if(_.isArray(vars.u)){
                 let listeURLs = [];
                 // il peut y avoir plusieurs exercices correspondant à une activité MM1
                 for(let i=0;i<vars.u.length;i++){
                    let url = vars.u[i];
                    let level = regexp.exec(url)[0];
                    listeURLs.push({u:"N"+level+"/"+url+".json",t:""});
                }
                library.displayContent(listeURLs);
             } else if(vars.u !== undefined) {
                 // s'il n'y a qu'une activité, on l'affiche.
                let level = regexp.exec(vars.u)[0];
                library.load("N"+level+"/"+vars.u+".json"); 
            } else {
                let alert = utils.create("div",{className:"message",innerHTML:"Cette activité n'a pas de correspondance dans cette nouvelle version de MathsMentales.<hr class='center w50'>Vous allez être redirigé vers l'ancienne version dans 10s. <a href='javascript:utils.goToOldVersion();'>Go !</a>"});
                document.getElementById("tab-accueil").appendChild(alert);
                setTimeout(utils.goToOldVersion,10000);
            }
        } else if(vars.c!==undefined){ // présence de carts MM v2 à lancer ou éditer
            let alert = utils.create("div",{id:'messageinfo',className:"message",innerHTML:"Chargement de l'activité MathsMentales.<br>Merci pour la visite."});
            document.getElementById("tab-accueil").appendChild(alert);
            if(vars.o === "yes" && !edit){
                // cas d'un truc online : message à valider !
                start = false;
                alert.innerHTML += `<br><br>
                <button onclick="utils.closeMessage('messageinfo');MM.checkLoadedCarts(true)"> Commencer !
                </button>`;
            } else {
                setTimeout(()=>{
                    utils.closeMessage('messageinfo');
                },3000);
            }
            // indique quoi faire avant le slide
            MM.introType = vars.i;
            // indique quoi faire après le slide
            MM.endType = vars.e;
            // Mode online
            if(vars.o){
                MM.onlineState = vars.o;
            }
            // Mode face to face
            if(vars.f)MM.faceToFace = vars.f;
            // nombre de diaporamas
            if(vars.s){
                // gros bug du à une variable mal préparée
                MM.slidersNumber = Number(vars.s);
            }
            // le seed d'aléatorisation est fourni et on n'est pas en mode online
            if((vars.a && MM.onlineState === "no") || edit){
                utils.setSeed(vars.a);
            } else if(MM.onlineState=="yes" || !vars.a)
                utils.setSeed(utils.seedGenerator());
            // on supprime tous les paniers
            MM.resetCarts();
            // orientation dans le cas de 2 diapos
            if(vars.so){
                MM.slidersOrientation = vars.so;
            }
            // paramètres des activités des paniers
            let json = vars.c;
            // version avant le 15/08/21
            if(typeof vars.c === "string")
                json = JSON.parse(decodeURIComponent(vars.c));
            // la version à partir du 15/08/21 fonctionne avec un objet vars.c déjà construit.
            let allcarts = [];
            for(const i in json){
                MM.carts[i] = new cart(i);
                allcarts.push(MM.carts[i].import(json[i],start));
            }
            // on attend le résultat de toutes les promesses pour mettre à jour les affichages.
            Promise.all(allcarts).then(data=>{
                // on prépare l'affichage des paniers
                MM.resetInterface();
                MM.restoreCartsInterface();
                // on affiche l'interface des paniers si on a au moins une activité dans le panier 1 ou plusieurs paniers.
                if(MM.carts[0].activities.length>1 || MM.carts.length>1){
                    MM.showCartInterface();
                }
                // on affiche l'interface de paramétrage si on est en mode édition
                if(edit) {
                    utils.showTab("tab-parameters");
                    MM.editedActivity = MM.carts[0].activities[0];
                    if(MM.carts[0].activities.length>1 || MM.carts.length>1){
                        MM.showCart(1);
                        MM.editActivity(0);
                    } else {
                        MM.editedActivity.display();
                    }
                }
            }).catch(err=>{
                // erreur à l'importation :(
                let alert=utils.create("div",
                {
                    id:"messageerreur",
                    className:"message",
                    innerHTML:"Impossible de charger les paniers :(<br>"+err
                });
                document.getElementById("tab-accueil").appendChild(alert);
                // on fermet le message d'alerte après 3 secondes
                setTimeout(()=>{
                    let div=document.getElementById('messageerreur');
                    div.parentNode.removeChild(div);
                },3000);
            });
        } else if(vars.cd !== undefined || vars.panier !== undefined){ // activité unique importée de MM v1
            // affichage d'un message de redirection
            let alert = utils.create("div",{className:"message",innerHTML:"Ceci est le nouveau MathsMentales, les anciennes adresses ne sont malheureusement plus compatibles.<hr class='center w50'>Vous allez être redirigé vers l'ancienne version de MathsMentales dans 6 s. <a href='javascript:utils.goToOldVersion();'>Go !</a>"});
            document.getElementById("tab-accueil").appendChild(alert);
            setTimeout(utils.goToOldVersion,6000);
        }
    },
    /**
     * Endode les accolades dans une chaine car encodeURIComponent ne le fait pas
     * @param {String} url a string corresponding an URL
     * @returns better encoded string
     */
    superEncodeURI:function(url){
        var encodedStr = '', encodeChars = ["(", ")","{","}"];
        url = encodeURIComponent(url);
        for(var i = 0, len = url.length; i < len; i++) {
          if (encodeChars.indexOf(url[i]) >= 0) {
              var hex = parseInt(url.charCodeAt(i)).toString(16);
              encodedStr += '%' + hex;
          }
          else {
              encodedStr += url[i];
          }
        }
        return encodedStr;
      },
    /**
     * get data form url
     * @returns array of datas from GET vars
     */
    getUrlVars: function(urlString) {
        if(!urlString)urlString = window.location.href;
        var vars = {},
          hash;
        if(urlString.indexOf("#")>0 && urlString.indexOf("?")<0){ // cas d'une activité MMv1
            // cas d'une référence simple à l'exo
            // pour ouvrir l'éditeur sur cet exo
            let idExo = urlString.substring(urlString.indexOf("#") + 1, urlString.length);
            if(MM1toMM2[idExo].new !== undefined){
                vars.u = MM1toMM2[idExo].new;
            }
        }
        // on fait un tableau de données qui sont séparées par le &
        var hashes = urlString.replace(/\|/g,'/').slice(urlString.indexOf('?') + 1).split('&');
        var len = hashes.length;
        // cas de la version avant le 15/08/21 - simple
        // le tilde ~ est une caractéristique des nouvelles url
        if(urlString.indexOf("~")<0){
            for (var i = 0; i < len; i++) {
                hash = hashes[i].split('=');
                vars[hash[0]] = hash[1];
            }
        // version après le 15/08/21
        // reconstruction de la chaine pour en faire un objet
        // la chaine est de la forme
        /* url?i=intro,e=end,o=online,s=nbsliders,so=orientation,f=facetotface,a=seed
             &p=cartId1~t=title1~c=target1~o=ordered
            _i=activityId1~o=optionsIds~q=subOptionsIds~p=???~t=durée~n=nbquestions
            _i=activityId2~o=optionsIds~q=subOptionsIds~p=???~t=durée~n=nbquestions
            &p=cartId2~t=title2~c=target2~o=ordered
            _i=activityId1~o=optionsIds~q=subOptionsIds~p=???~t=durée~n=nbquestions
            _i=activityId2~o=optionsIds~q=subOptionsIds~p=???~t=durée~n=nbquestions
          optionsIds et subOptionsIds peuvent être une liste d'id séparés par des virgules ou rien
        */
        } else {
            // données générales :
            // la virgule est le séparateur de données avec affectation
            // ces données sont les premières du tableau hashes
            hash = hashes[0].split(",");
            for(let i=0;i<hash.length;i++){
                // le signe égal est le séparateur variable/valeur
                let data = hash[i].split("=");
                vars[data[0]] = data[1]?data[1]:false;
            }
            // vars.c doit contenir les carts. Dans la version après 15/08/21, vars.c est une chaine
            // on reconstruit l'objet json à partir de la chaine
            vars.c = {};
            for(let i=1;i<len;i++){
                // on ne commence qu'à 1, le zéro ayant déjà été traité ci-dessus
                // si la première lettre est p, on a un panier
                if(hashes[i].indexOf("p")===0){
                    // le séparateur d'activités est le _
                    let parts = hashes[i].split("_");
                    // parts[0] contient les données du panier, que l'on stocke dans data
                    // le séparateur de couples var/valeur est ~
                    let data = parts[0].split("~");
                    let datas = {};
                    for(let j=0;j<data.length;j++){
                        // le séparateur var/valeur est =
                        let dataparts = data[j].split("=");
                        datas[dataparts[0]]=decodeURI(dataparts[1]);
                    }
                    let id = datas.p;
                    vars.c[id]={i:datas.p,t:datas.t,c:datas.c,o:datas.o,a:{}};
                    // parts[>0] : parameters cart's activities
                    for(let j=1;j<parts.length;j++){
                        let datasActivity = parts[j].split("~");
                        vars.c[id].a[j-1] = {};
                        for(let k=0;k<datasActivity.length;k++){
                            let dataparts = datasActivity[k].split("=");
                            if(dataparts[0]==="o"){
                                vars.c[id].a[j-1][dataparts[0]]=utils.textToTable(dataparts[1]);
                            } else if(dataparts[0]==="q"){
                                vars.c[id].a[j-1][dataparts[0]]=utils.textToObj(dataparts[1]);
                            } else{
                                vars.c[id].a[j-1][dataparts[0]]=dataparts[1];
                            }
                        }                            
                    }
                }
            }
        }
        return vars;
    },
    /**
     * Donne la date du moment
     * @returns date en français avec jour, heure etc
     */
    getDate(){
        let ladate = new Date(),
        lheure = ladate.getHours(),
        lesminutes = ladate.getMinutes(),
        lessecondes = ladate.getSeconds(),
       ladateComplete = joursFR[ladate.getDay()] + " " + ladate.getDate() + " " + moisFR[ladate.getMonth()] + " " + ladate.getFullYear() + " - " + ((lheure < 10) ? "0" + lheure : lheure) + ":" + ((lesminutes < 10) ? "0" + lesminutes : lesminutes) + ":" + ((lessecondes < 10) ? "0" + lessecondes : lessecondes);
       return ladateComplete;
    },
    /**
     * Create a string of six alphabetic letters
     * @returns (String) a aleatorycode
     */
    seedGenerator:function(){
        let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let code = "";
        for(let i=0;i<6;i++){
            // n'utilise pas l'outil de randomisation dirigée par le seed
            code += str[Math.floor(Math.random()*(str.length))];
        }
        return code;
    },
    /**
     * Crée un grain pour la génération aléatoire des données
     * @param {String} value 
     */
    setSeed(value){
        if(value !== undefined && value !== "sample"){
            MM.seed = value;
            document.getElementById("aleaKey").value = value;
        } else if(value === "sample"){
            MM.seed = utils.seedGenerator();
        } else if(document.getElementById("aleaKey").value === ""){
            MM.seed = utils.seedGenerator();
            document.getElementById("aleaKey").value = MM.seed;
        } else {
            MM.seed = document.getElementById("aleaKey").value;
        }
        utils.initializeAlea(MM.seed);
    },
    /**
    * function addClass
    * Add a class to a DOM element
    * 
    * @params elt (DOMelt)
    * @params newClass (String) : string of coma separated classnames
    */
    addClass:function(elt,newClass){
        var n=0;
        newClass=newClass.split(",");
        for(let i=0;i<newClass.length;i++){
            if((" "+elt.className+" ").indexOf(" "+newClass[i]+" ")==-1){
                    elt.className+=" "+newClass[i];
                    n++;
            }
        }
        return n;
    },
    createCeintureTitres(qty){
        if(qty<1 || qty>5)return false;
        const dest = document.getElementById("ceintcolumnTitle");
        const champs = dest.querySelectorAll("input");
        const labels = dest.querySelectorAll("label");
        const br = dest.querySelectorAll("br");
        // création de champ :
        if(champs.length<qty){
            dest.appendChild(utils.create("br"));
            dest.appendChild(utils.create("label",{for:"ceinttitlecol"+qty,innerHTML:"Colonne "+qty+" : "}));
            dest.appendChild(utils.create("input",{type:"text",id:"ceinttitlecol"+qty,placeholder:"Texte, ou rien"}));
        } else if(champs.length>qty) {
            // suppression du dernier champ
            dest.removeChild(labels[champs.length-1]);
            dest.removeChild(champs[champs.length-1]);
            dest.removeChild(br[champs.length-1]);
        }
    },
    /**
     * Récupère la valeur cochée d'un groupe d'input radio
     * @param {String} name nom DOM du groupe d'input radio
     * @returns valeur du radio coché
     */
    getRadioChecked:function(name){
        let radio = document.getElementsByName(name);
        for(let i=0,length=radio.length;i<length;i++){
            if(radio[i].checked){
                return radio[i].value;
            }
        }
        return false;
    },
    /**
     * renvoit un nombre si le nombre est sous forme de chaine
     * @param {String} value number
     * @returns Number typed number or string
     */
    numberIfNumber:function(value){
        if(String(Number(value))===value){
            return Number(value);
        } else {
            return value;
        }
    },
    // isEmpty, teste si un objet est vide ou pas
    // @param (Object) obj : objet ou tableau à analyser
    // return true pour vide
    // return false sinon
    isEmpty: function (obj) {
        var x;
        for (x in obj) {
            return false;
        }
        return true;
    },
    /**
     * shuffle an array
     * @param {Array} arr 
     */
    shuffle : function(arr){
        if(!Array.isArray(arr))return false;
        arr.sort(()=>utils.alea()-0.5);
        return arr;
    },
    
    /**
     * Création et complétion des infos de tuiles de la page d'accueil
     */
    createTuiles(){
        let grille;
        const ordre = library.ordre;
        function setContent(id,obj){
            const elt = utils.create("article",{"className":"tuile","title":"Cliquer pour afficher toutes les activités du niveau"});
            const titre = utils.create("h3",{"innerHTML":obj.nom});
            elt.appendChild(titre);
            const nba = utils.create("div",{"innerHTML":obj.activitiesNumber+" activités"});
            elt.onclick = ()=>{library.displayContent(id,true)};
            elt.appendChild(nba);
            grille.appendChild(elt);
        }
        for(const o in ordre){
            grille = document.getElementById(o);
            for(let i=0;i<ordre[o].length;i++){
                if(MM.content[ordre[o][i]].activitiesNumber === undefined || MM.content[ordre[o][i]].activitiesNumber ===0 || i==="activitiesNumber")continue;
                setContent(ordre[o][i],MM.content[ordre[o][i]]);
            }
        }    
    },
    closeMessage(id){
        let div=document.getElementById(id);
        div.parentNode.removeChild(div)
    },
    /**
     * Création des checkbox pour sélectionner les niveaux dans lesquels chercher.
     */
    createSearchCheckboxes(){
        let dest = document.getElementById("searchLevels");
        const ordre = library.ordre;
        for(const o in ordre){
            for(let i=0;i<ordre[o].length;i++){
                if(MM.content[ordre[o][i]].activitiesNumber === undefined || MM.content[ordre[o][i]].activitiesNumber ===0 || i==="activitiesNumber")
                    continue;
                const div = utils.create("div");
                const input = utils.create("input",{type:"checkbox",name:"searchlevel",value:ordre[o][i],className:"checkbox",id:"ccbs"+ordre[o][i]});
                input.onclick = ()=>{library.displayContent(document.getElementById("searchinput").value)};
                const label = utils.create("label",{for:"ccbs"+ordre[o][i], innerText:MM.content[ordre[o][i]].nom});
                label.onclick = (evt)=>{document.getElementById(evt.target.for).click()};
                div.appendChild(input);
                div.appendChild(label);
                dest.appendChild(div);
            }
        }
    },
    /**
     * plie ou déplie la liste des exercices
     * @param {elt} elt DOM elt
     */
    deploy(elt){
        let destClass = "hideup";
        let eltClass = "pointer plus";
        if(elt.nodeName === "H3"){
            let dest = elt.nextSibling;
            if(elt.className === eltClass){
                eltClass="pointer moins";
                destClass = "showdown";
            }
            elt.className = eltClass;
            dest.className = destClass;
        } else if(elt.nodeName === "H2"){
            if(elt.className === "pointer plus"){
                eltClass = "pointer moins"
                destClass = "showdown";
            }
            elt.className = eltClass;
            while(elt.nextSibling !== null){
                elt = elt.nextSibling;
                if(elt.nodeName === "H2") break;
                if(elt.nodeName ==="UL")
                    elt.className = destClass;
                else if(elt.nodeName === "H3")
                    elt.className = eltClass;
            }
        } else if(elt.nodeName === "H1"){
            if(elt.className === "pointer plus"){
                eltClass = "pointer moins";
                destClass = "showdown";
            }
            elt.className = eltClass;
            const h2 = document.querySelectorAll("#resultat-chercher h2");
            const h3 = document.querySelectorAll("#resultat-chercher h3");
            const ul = document.querySelectorAll("#resultat-chercher ul");
            h2.forEach((el)=>el.className=eltClass);
            h3.forEach((el)=>el.className=eltClass);
            ul.forEach((el)=>el.className=destClass);
        }
    },
    /**
     * fonctions utilisées pour l'import/export des activités.
     * @param {Array} array 
     * @returns 
     */
    tableToText(array){
        if(array === undefined) return "";
        if(typeof array ==="string") return array;
        return array.join(",");
    },
    textToTable(string){
        if(string === undefined || string === "") return [];
        else
        return string.split(",").map(Number);
    },
    objToText(obj){
        if(obj === undefined) return "";
        let string = "";
        let start = true;
        for(const i in obj){
            if(start){
                string += i+"."+utils.tableToText(obj[i]);
                start = false;
            } else {
                string += "-"+i+"."+utils.tableToText(obj[i]);
            }
        }
        return string;
    },
    textToObj(string){
        let obj = {};
        let elts = string.split("-");
        for(let i=0;i<elts.length;i++){
            let subelts = elts[i].split(".");
            obj[subelts[0]] = utils.textToTable(subelts[1]);
        }
        return obj;
    },
    /**
    * function removeClass
    * remove a class name from a DOM element
    *
    * @param elt : DOM element
    * @param className (String) : name of classname
    */
    removeClass: function(elt, className){
        if((" "+elt.className+" ").indexOf(" "+className+" ")>-1){
            var classes = elt.className.split(" "), newclasses="";
            for(let i=0;i<classes.length;i++){
                if(classes[i] !== className)newclasses+=" "+classes[i];
            }
            elt.className = newclasses.trim();
        }
    },
    changeTempoValue:function(value){
        document.getElementById('tempo-value').innerHTML = value+" s.";
        if(MM.editedActivity)MM.editedActivity.setTempo(value);
        if(MM.carts[MM.selectedCart].editedActivityId > -1){
            document.querySelectorAll("#cart"+(MM.selectedCart)+"-list li.active span")[0].innerHTML = value;
        }
    },
    changeNbqValue:function(value){
        document.getElementById('nbq-value').innerHTML = value;
        if(MM.editedActivity)MM.editedActivity.setNbq(value);
        if(MM.carts[MM.selectedCart].editedActivityId > -1){
            document.querySelectorAll("#cart"+(MM.selectedCart)+"-list li.active span")[1].innerHTML = value;
        }
    },
    checkValues:function(){
        utils.changeTempoValue(document.getElementById('tempo-slider').value);
        utils.changeNbqValue(document.getElementById('nbq-slider').value);
    },
    /**
     * checkSecurity to avoid infinite loop
     * 
     */
    checkSecurity(){
        utils.security--;
        if (utils.security < 0) {
            console.log("infinite loop")
            return false;
        }
        else return true;
    },
    /**
    * 
    * @params {string} seed valeur d'initialisation des données aléatoires
    * return nothing
    */
    initializeAlea:function(seed){
        if(seed)
            utils.alea = new Math.seedrandom(seed);
        else 
            utils.alea = new Math.seedrandom(MM.seed);
    },
    /**
     * 
     * @param {DOM obj or string} element 
     * Show the selected Tab
     */
    showTab:function(element){
        utils.resetAllTabs();let tab, el;
        if(element === "none")return;
        if(typeof element === "string"){
            tab = element;
            el = document.querySelector("#header-menu a[numero='#"+element+"']");
        } else {
            el = element;
            tab = element.getAttribute('numero').substr(1);
        }
        utils.addClass(el, "is-active");
        document.getElementById(tab).style.display = "";
    },
    showParameters:function(id){
        let ids = ["paramsdiapo","paramsexos", "paramsinterro", "paramsceinture", "paramsflashcards", "paramswhogots", "paramsdominos"];//
        if(ids.indexOf(id)<0) return false;
        // hide all
        for(let i=0,len=ids.length;i<len;i++){
            document.getElementById(ids[i]).className = "hidden";
        }
        document.getElementById(id).className = "";
    },
    resetAllTabs : function(){
        // fermeture des espaces d'annotation.
        utils.annotate(false);
        let tabsButtons = document.querySelectorAll("#header-menu .tabs-menu-link");
        let contents = document.querySelectorAll(".tabs-content-item");
        document.getElementById("tab-accueil").display = "none";
        contents.forEach(element => {
            element.style.display = "none";
        });
        utils.removeClass(document.getElementById("btnaccueil"), "is-active");
        tabsButtons.forEach(element => {
            utils.removeClass(element, "is-active");
        });
    },
    toDecimalFr:function(value){
        let parties = value.split(".");
        let partieEntiere = parties[0];
        let partieDecimale = "";
        if(parties.length>1)partieDecimale = parties[1];
        if(partieEntiere.length>3){
            let s = partieEntiere.length%3;
            partieEntiere = partieEntiere.substring(0,s)+"~"+partieEntiere.substring(s).match(/\d{3}/g).join("~");
        }
        if(partieDecimale.length>3){
            let nbgp = ~~(partieDecimale.length/3);
            partieDecimale = partieDecimale.match(/\d{3}/g).join("~")+"~"+partieDecimale.substring(nbgp*3);
        }
        if(partieDecimale.length){
            partieDecimale = "{,}"+partieDecimale;
            }
        //debug(partieEntiere+partieDecimale);
        return partieEntiere+partieDecimale;
    },
    annotate:function(target,btnId){
        if(target === false && MM.annotate !== undefined){
            MM.annotate.destroy();
            MM.annotate = undefined;
        } else if(MM.annotate === undefined && _.isString(target)){
            MM.annotate = new draw(target,btnId);
        } else if(MM.annotate !== undefined) {
            MM.annotate.destroy();
            MM.annotate = undefined;
        }
    },
    /**
     * Render the math
     * @param (dom) wtarget : window reference
     */
    mathRender: function(wtarget) {
        let contents = ["tab-enonce", "tab-corrige", "activityOptions", "activityDescription"];
        contents.forEach(id => {
            // search for $$ formulas $$ => span / span
            let content = document.getElementById(id).innerHTML;
            document.getElementById(id).innerHTML = content.replace(/\$\$([^$]*)\$\$/gi, '<span class="math">$1</span>');
        });
        document.querySelectorAll(".slide").forEach(elt => {
            elt.innerHTML = elt.innerHTML.replace(/\$\$([^$]*)\$\$/gi, '<span class="math">$1</span>');

        });
        if(wtarget !== undefined){
            let content = wtarget.document.getElementById("creator-content");
            content.innerHTML = content.innerHTML.replace(/\$\$([^$]*)\$\$/gi, '<span class="math">$1</span>');
            content.querySelectorAll(".math").forEach(function(item){
                var texTxt = item.innerHTML.replace(/\&amp\;/g,"&");
                // recherche les nombres, décimaux ou pas
                let nbrgx = /(\d+\.*\d*)/g;
                // insère des espaces tous les 3 chiffres;
                texTxt = texTxt.replace(nbrgx, utils.toDecimalFr);
                try {
                  katex.render(texTxt, item, {
                    throwOnError: false,
                    errorColor: "#FFF",
                    colorIsTextColor: true
                  });
                  utils.removeClass(item,"math");
                } catch (err) {
                  item.innerHTML = "<span class='err'>" + err + ' avec '+texTxt + '</span>';
                };      
            })
        }
        document.querySelectorAll(".math").forEach(function(item) {
            // transform ascii to Latex
          //var texTxt = MM.ascii2tex.parse(item.innerHTML);
        var texTxt = item.innerHTML.replace(/\&amp\;/g,"&");
          // recherche les nombres, décimaux ou pas
          let nbrgx = /(\d+\.*\d*)/g;
          // insère des espaces tous les 3 chiffres;
          
          texTxt = texTxt.replace(nbrgx, utils.toDecimalFr);
          //texTxt = texTxt.replace(/\.(\d{3})(?=(\d+))/g,"$1~");
          //texTxt = texTxt.replace(/\./g, "{,}");
          try {
            katex.render(texTxt, item, { //"\\displaystyle "+
              throwOnError: false,
              errorColor: "#FFF",
              colorIsTextColor: true
            });
            utils.removeClass(item,"math");
          } catch (err) {
            item.innerHTML = "<span class='err'>" + err + ' avec '+texTxt + '</span>';
          };
        });
      },
      /**
       * 
       * @param {object} someThing json object or array
       * @returns a clone of the object
       */
      clone(someThing){
          if(someThing === undefined) return false;
          else if(typeof someThing === "object"){
              return JSON.parse(JSON.stringify(someThing));
          } else {
              return someThing;
          }
      },
      
    /**
     * 
     * @param {Number} value 
     * @param {Number} digits
     * 
     * return {string} number with a fix digits
     */
    toDigits(value,digits){
        let puissance = Number(1+"e"+digits)-1;
        while(String(value).length < String(puissance).length){
            value = "0"+value;
        }
        return value;
    }
}
var sound = {
    list : [
        ["sounds/BELLHand_Sonnette de velo 2 (ID 0275)_LS.mp3","Sonette"],
        ["sounds/COMCam_Un declenchement d appareil photo (ID 0307)_LS.mp3","Reflex"],
        ["sounds/COMCell_E mail envoye (ID 1312)_LS.mp3","Email"],
        ["sounds/COMTran_Bip aerospatial 1 (ID 2380)_LS.mp3","Bip"],
        ["sounds/MUSCPerc_Cartoon agogo 2 (ID 2262)_LS.mp3","Agogo"],
        ["sounds/ROBTVox_Notification lasomarie 4 (ID 2062)_LS.mp3","Notif"],
        ["sounds/SWSH_Epee qui coupe (ID 0127)_LS.mp3","Couper"],
        ["sounds/SWSH_Epee qui fend l air (ID 0128)_LS.mp3","Fendre"],
        ["sounds/SWSH_Whoosh 3 (ID 1795)_LS.mp3","whoosh"],
        ["sounds/TOONHorn_Klaxon poire double 1 (ID 1830)_LS.mp3","Pouet"],
        ["sounds/VEHHorn_Klaxon de voiture recente 4 (ID 0260)_LS.mp3","Klaxon"],
        ["sounds/WATRSplsh_Plouf petit 6 (ID 1534)_LS.mp3","Plouf"]
    ],
    selected:"null",
    player:null,
    getPlayer(){
        // récup du player
        this.player = document.getElementById("soundplayer");
        // peuple la liste
        let slct = document.getElementById("playerlist");
        for(let i=0;i<this.list.length;i++){
            let option = utils.create("option",{value:i,innerText:this.list[i][1]});
            slct.appendChild(option);
        }
    },
    play(){
        if(this.selected !== "null")
            this.player.play();
    },
    next(){
        this.setSound((this.selected+1)%this.list.length);
        this.play();
    },
    select(id){
        this.setSound(id);
        this.play();
    },
    setSound(id){
        this.selected = id;
        if(this.selected!=="null")
            this.player.src = this.list[id][0];
    }
}
var math ={
    premiers: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1249, 1259, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361, 1367, 1373, 1381, 1399, 1409, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1511, 1523, 1531, 1543, 1549, 1553, 1559, 1567, 1571, 1579, 1583, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1657, 1663, 1667, 1669, 1693, 1697, 1699, 1709, 1721, 1723, 1733, 1741, 1747, 1753, 1759, 1777, 1783, 1787, 1789, 1801, 1811, 1823, 1831, 1847, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1901, 1907, 1913, 1931, 1933, 1949, 1951, 1973, 1979, 1987, 1993, 1997, 1999],
    /**
     * 
     * @param {float} nb number to be rounded
     * @param {integer} precision may positiv or negativ
     */
    round: function(nb, precision){
        if(precision === undefined){
            return Math.round(nb);
        } else{
            if(precision < 5)
                return Number(Math.round(Number(nb+'e'+precision))+'e'+(-precision));
            else{
                let z=new Big(nb);
                return z.round(precision).toFixed();
            }
        }
    },
    valeurParDefaut: function(valeur, precision) {
        if(precision === undefined){
            return Math.floor(valeur);
        } else
        return Number(Math.floor(Number(valeur + 'e' + precision)) + 'e' + (-precision));
      },
    valeurParExces: function(valeur, precision) {
        if(precision === undefined){
            return Math.ceil(valeur);
        } else
        return Number(Math.ceil(Number(valeur + 'e' + precision)) + 'e' + (-precision));
    },
    /**
     *  
     * @param {integer} min relativ
     * @param {integer} max relativ
     * optionals
     * @param {integer} qty positiv
     * @param {string} avoid start with ^ indicates the list of exeptions,
     * & as exeption => no doble number in the list
     * prime => not a prime
     */
     aleaInt:function(min,max,...others){ // accepts 2 arguments more
        let qty=1;
        let avoid=[];
        let arrayType=false;
        utils.security = 300;
        let nodouble = false;
        let notPrime = false;
        for(let i=0;i<others.length;i++){
            if(String(Number(others[i])) === others[i] || typeof others[i]==="number"){
                qty = others[i];
                arrayType = true;
            } else if(typeof others[i] === "string" && others[i][0]=="^"){
                avoid = others[i].substring(1).split(",");
                if(avoid.indexOf("&")>-1)nodouble = true;
                if(avoid.indexOf("prime")>-1)notPrime = true;
                avoid = avoid.map(Number);
            }
        }
        if(min === max) return min;
        if(max<min){
            [min,max] = [max,min];
        }
        if(arrayType){
            var integers = [];
            for(let i=0;i<qty;i++){
                let thisint = math.round(utils.alea()*(max-min))+min;
                if(avoid.indexOf(thisint)>-1 || (nodouble && integers.indexOf(thisint)>-1) || (notPrime && math.premiers.indexOf(thisint)>-1)){
                    // do not use exeptions numbers
                    // or no double number
                    i--;
                    if(!utils.checkSecurity()) break;
                    continue;
                }
                integers.push(thisint);
                if(!utils.checkSecurity()) break;
            }
            return integers;
        } else {
            let thisint;
            do{
                thisint = math.round(utils.alea()*(max-min))+min;
                if(!utils.checkSecurity()) break;
            }
            while (avoid.indexOf(thisint)>-1 || (notPrime && math.premiers.indexOf(thisint)>-1))
            return thisint;
        }
    },
    /**
     * 
     * @param {float} min minimal value
     * @param {float} max maximal value
     * @param {integer} precision relativ
     * optionals
     * @param {integer} qty number of values to return
     * @param {string} avoid values to avoid comma separated start with ^
     */
    aleaFloat:function(min, max, precision, ...others){
        let qty=1;
        let avoid = [];
        let nodouble = false;
        utils.security = 300;
        // check others aguments
        for(let i=0;i<others.length;i++){
            if(String(Number(others[i])) === others[i] || typeof others[i] === "number"){
                qty = others[i];
            } else if(typeof others[i] === "string" && others[i][0]==="^"){
                avoid = others[i].substring(1).split(",");
                if(avoid.indexOf("&")>-1)nodouble = true;
                avoid = avoid.map(Number);
            }
        }
        // exchange values min and max if min > max
        if(max<min){
            [min,max]=[max,min];
        }
        if(qty>1){ // more than one value
            let nb;
            var floats=[];
            for(let i=0;i<qty;i++){
                nb = math.round(utils.alea()*(max-min)+min,precision);
                if(avoid.indexOf(nb)>-1 || (nodouble && floats.indexOf(nb)>-1)){
                    i--;
                    if(!utils.checkSecurity()) break;
                    continue;
                   }
                floats.push(nb);
                if(!utils.checkSecurity()) break;
            }
            //debug(floats);
            return floats;
        } else { // one value
            let nb;
            do {
                nb = math.round(utils.alea()*(max-min)+min,precision);
                if(!utils.checkSecurity()) break;
                //debug(nb);
            }
            while(avoid.indexOf(nb)>-1)
            return nb;
        }
    },
    /**
     * return one or the number
     * @param {Number} value 
     */
    unOuNombre(value){
        value = Number(value);
        if(Math.round(Math.random())){
            return 1;
        } else return value;
    },
    
    /**
     * tranform a number to a signed number
     * 
     * @param {number} nb 
     * @returns a number with his sign
     */
    signedNumber:function(nb){
        if(nb===0) return "";
        else if(nb>0) return "+"+nb;
        else return nb;
    },
    /**
     * tranform the number 1 or -1 to + or -
     * 
     * @param {Number} nb 
     * @returns nothing if nb=1, - if nb=-1 the number in other cases
     */
    signIfOne:function(nb){
        if(nb === 1)
            return "";
        else if(nb === -1)
            return "-";
        else return nb;
    },
    /**
     * tranform a number to a signed number and 1, -1 or 0 to +, - or ""
     * 
     * @param {Number} nb 
     * @returns a number always with sign (+/-) or only the sign if nb=1 or -1
     */
    signedNumberButOne:function(nb){
        if(nb===0)return "";
        if(nb===1)return "+";
        if(nb===-1)return "-";
        if(nb>0) return"+"+nb;
        return nb;
    },
    /**
     * needsParenthesis
     * return a number with parenthesis if the number is negative
     * 
     * @param {number or string} nb 
     * @returns nb with parenthesis if nb 1st char is -
     */
    nP:function(nb){
        if(String(nb)[0]==="-")return "("+nb+")";
        else return nb;
    },
    /**
     * donne la liste des produits de 2 facteurs égaux
     * @param {integer} entier product
     * @param {integer} max factors's max value
     */
    listeProduits:function(entier, max){
        let liste = [];
        if(max === undefined)max=10;
        for(let i=1,top=Math.floor(Math.sqrt(entier));i<=top;i++){
            let reste = entier%i, quotient = ~~(entier/i);
            if(reste == 0 && i<=max && quotient<=max){
                liste.push(i+"\\times"+quotient);
            }
        }
        return liste.join("; ");
    },
    /** 
    * donne la liste des diviseurs d'un nombre sous forme de chaine
    * @param {integer} nb nombre à décomposer
    * @param {boolean} array false ou undefined renvoie une chaine, un tableau sinon
    */
    listeDiviseurs:function(nb, array){
        let maxSearch = Math.floor(Math.sqrt(nb));
        let diviseurs = [];
        let grandsdiviseurs = [];
        for (let i = 1; i <= maxSearch; i++) {
          if (nb % i === 0) {
            diviseurs.push(i);
            if (i !== nb / i) // on ne met pas 2 fois le même nombre si carré parfait
              grandsdiviseurs.unshift(nb / i);
          }
        }
        diviseurs = diviseurs.concat(grandsdiviseurs);
        if(array===true)
            return diviseurs;
        else
            return diviseurs.join("; ");
    },
    /**
     * 
     * @param {integer} nb 
     * @returns integer : le plus grand diviseur non égal au nombre
     */
    plusGrandDiviseur:function(nb){
        const liste = math.listeDiviseurs(nb,true);
        return liste[liste.length-2];
    },
    /**
     * 
     * @param {integer} nb 
     * @returns integer
     */
    plusGrandDiviseurPremier(nb){
        if(nb<2) return nb;
        let prime = 0,indice=0;
        while(math.premiers[indice]<=nb){
            indice++;
            if(nb%math.premiers[indice]==0)
                prime=math.premiers[indice];
        }
        return prime;
    },
    /**
    *
    * donne la liste des diviseurs inférieurs à 10 sous forme de chaine
    * 
    *
    * */
    listeDiviseurs10:function(nb){
        let diviseurs = [2,3,5,9,10];
        let liste = [];
        for (let i = 0, len=diviseurs.length; i < len; i++) {
            const div = diviseurs[i];
            if(nb%div === 0)liste.push(div);
        }
        if(liste.length)return liste.join("; ");
        else return "aucun des nombres"
    },
    /**
     * 
     * @param {integer} nb
     * return un non diviseur d'un nombre
     */
    nonDiviseur(nb){
        let unnondiviseur=0;
        do { unnondiviseur = math.aleaInt(2,nb-1); }
        while (nb%unnondiviseur===0)
        return unnondiviseur;
    },
    /**
     * 
     * @param {float} decimal nombre décimal
     * return une fraction
     */
    fractionDecimale(decimal){
        let string = decimal.toString();
        let pointPosition = string.indexOf(".");
        // cas du nombre entier
        if(pointPosition<0) return "\\dfrac{"+decimal+"}{1}";
        else {
            let nbChiffres = string.length - pointPosition - 1;
            return "\\dfrac{"+math.round(decimal*Math.pow(10,nbChiffres),0) +"}{"+Math.pow(10,nbChiffres)+"}";
        }
        
    },
    /**
     * 
     * @param {integer} nb 
     * return un diviseur de nb
     */
    unDiviseur(nb,notOne=false){
        let diviseurs = math.listeDiviseurs(nb,true);
        if(notOne) diviseurs = _.rest(diviseurs); // on enlève la première valeur qui est 1.
        return diviseurs[math.aleaInt(0,diviseurs.length-1)];
    },
    unpower:function(value){
        let matches = value.match(/(\d*)\^(\d*)/g);
            if(matches)
            for(let i=0,l=matches.length;i<l;i+=2){
                value = value.replace(matches[i], math.powerToProduct(matches[i]));
            }
        return value;
    },
    powerToProduct(power){
        let nb = Number(power.substring(0,power.indexOf("^")));
        let puissance = Number(power.substring(power.indexOf("^")+1));
        let a = [];
        for(let i=0;i<puissance;i++){
            a.push(nb);
        }
        return a.join("*");
    },
    sToMin(sec){
        sec = Number(sec);
        let time = "";
        if(sec>3600){
          time += ~~(sec/3600) + " h ";
          sec = sec%3600;
        }
        if(sec>60){
          time += ~~(sec/60) + " min ";
          sec = sec%60;
        }
        return time += sec;
    },
    toTex(string){
        return string.replace(/\*/g, "\\times");
    },
    /**
     * 
     * @param {Integer} radicande 
     * @returns 
     */
    simplifieRacine(radicande){
        const factors = Algebrite.run('factor('+radicande+')').split('*');
        let outOfSquareR = 1;
        let inSquareR = 1;
        for(let i=0;i<factors.length;++i){
            const elt = factors[i].split("^");
            const nb = elt[0];
            const power = elt[1]===undefined?1:elt[1];
            outOfSquareR = outOfSquareR*Math.pow(nb,Math.floor(power/2));
            inSquareR = inSquareR*Math.pow(nb,power%2);
        }
        return (outOfSquareR>1?outOfSquareR:'')+(inSquareR>1?"\\sqrt{"+inSquareR+"}":'');
    },
    estDivisiblePar(nb, par, type){
        nb = Number(nb); par = Number(par);
        let reponses = {"w":[" est divisible ", "n'est pas divisible"],"yn":["oui", "non"]};
        if(nb%par === 0){
            return reponses[type][0];
        } else return reponses[type][1];
    },
    compare(a,b){
        if(a<b)return"\\lt";
        else if(a>b)return"\\gt";
        else return "=";
    },
    pgcd: function(a, b) {
    return Algebrite.run('gcd(' + a + ',' + b + ')');
    },
    ppcm: function(a, b) {
    return Algebrite.run('lcm(' + a + ',' + b + ')');
    },
    inverse:function(expr, notex){
        let ret;
        if(notex === undefined || notex===false) ret = Algebrite.run('printlatex(1/('+expr+'))');
        else ret = Algebrite.run('1/('+expr+')');
        return ret;
    },
    calc:function(expr,notex){
        let ret;
        if(notex === undefined || notex===false) ret = Algebrite.run('printlatex('+expr+')').replace(/frac/g,'dfrac');
        else ret = Algebrite.run(expr);
        return ret;
    },
    getHM(h,m,s){
        if(s===undefined)s=0;
        var d = new Date(2010,1,1,Number(h),Number(m),Number(s));
        return d.getHours()+" h "+((d.getMinutes()<10)?"0"+d.getMinutes():d.getMinutes());
    },
    getHMs(h,m,s){
        if(s===undefined)s=0;
        var d = new Date(2010,1,1,Number(h),Number(m),Number(s));
        return d.getHours()+" h "+((d.getMinutes()<10)?"0"+d.getMinutes():d.getMinutes())+" min "+((d.getSeconds()<10)?"0"+d.getSeconds():d.getSeconds())+" s.";
    },
    fractionSimplifiee(n,d){
        if(n<0 && d<0 || n>0 && d<0){
            n=-n;d=-d;
        }
        const gcd = math.pgcd(n,d);
        if(Number.isInteger(n/d))
            return n/d;
        else 
            return "\\dfrac{"+(n/gcd)+"}{"+(d/gcd)+"}";
    },
    simplifyFracDec(n,d){
        while(n%10 === 0 && d%10 === 0){
            n=n/10;d=d/10;
        }
        return "\\dfrac{"+n+"}{"+d+"}";
    },
    /**
     * 
     * @param {array} operandes array of numbers
     * @param {array} operations array of symbols : +, -, *, / or q
     * @param {string} option "p" renvoie une phrase, "a" renvoie latex, "v" renvoie asccii
     * @param {boolean} ordre 1 ou 0 la première opération est le premier argument de la 2e ou pas
     */
    phrase(operandes,operations,option,ordre){
        let x,y,r,z;
        let phrases = {
            "+":["la somme de ${x} et de ${y}","${x}+${y}","${x}+${y}"],
            "-":["la différence entre ${x} et ${y}","${x}-${y}","${x}-${y}"],
            "*":["le produit de ${x} par ${y}","${x}\\\\times ${y}","${x}*${y}"],
            "/":["le quotient de ${x} par ${y}","${x}\\\\div ${y}","${x}/${y}"],
            "q":["le quotient de ${x} par ${y}", "\\\\dfrac{${x}}{${y}}","${x}/${y}"]
        }
        x=operandes[0];y=operandes[1];
        switch(option){
            case "p":
                r = eval("`"+phrases[operations[0]][0]+"`")
                break;
            case "a":
                r = eval("`"+phrases[operations[0]][1]+"`")
                break;
            case "v":
                r = eval("`"+phrases[operations[0]][2]+"`")
                break;
            }
            //debug(r);
        if(operations.length>1){// plus d'une opération
            if(ordre){ // la première operation est le premier argument
                x=r;y=operandes[2];z=x;
                if(["*","/"].indexOf(operations[1])>-1 && ["-","+"].indexOf(operations[0])>-1)
                    z="("+x+")";
                //debug(z);
            } else {
                x=operandes[2];y=r;z=y;
                if(["*","/"].indexOf(operations[1])>-1 && ["-","+"].indexOf(operations[0])>-1 || operations[1]==="/")
                    z="("+y+")";
            }
            switch(option){
                case "p":
                    r=eval("`"+phrases[operations[1]][0]+"`").replace("de le", "du");
                    break;
                case "a":
                    if(ordre)x=z;else y=z;
                    r = eval("`"+phrases[operations[1]][1]+"`")
                    break;
                case "v":
                    if(ordre)x=z;else y=z;
                    r = eval("`"+phrases[operations[1]][2]+"`")
                    break;
            }
        }
        return r;
    },
    bigDecimal(a,op,b){
        let x = Big(a);
        return eval('x.'+op+'('+b+').toString()');
    },
        /**
     * 
     * @param {integer} billets id des billets
     * @param {boolean} entier true pour générer des montants entiers, false pour des centimes
     * @param {boolean} tot true pour donner le montant total, false pour donner un montant inférieur
     */
         montant:function(billets,entier,tot){
            let valeursBillets = [5,10,20,50,100];
            let min=Infinity;
            let total=0;
            for(let i=0,len=billets.length;i<len;i++){
                if(min>valeursBillets[billets[i]])
                    min = valeursBillets[billets[i]];
                total+=valeursBillets[billets[i]];
            }
            if(tot){
                return total;
            } else {
                if(entier){
                    return math.aleaInt(total-min+1,total);
                } else {
                    return math.aleaFloat(total-min+1,total,2);
            }}
        },
        listeBillets:function(billets){
            let valeursBillets = [5,10,20,50,100];
            let lesbillets = {5:0,10:0,20:0,50:0,100:0};
            let txt = "des billets : ";
            for(let i=0,len=billets.length;i<len;i++){
                 lesbillets[valeursBillets[billets[i]]]++;
            }
            for(let val in lesbillets){
                if(lesbillets[val]>1){
                    txt += lesbillets[val]+" de "+val+" €, ";
                } else if(lesbillets[val]>0){
                    txt += val+" €, ";
                }
            }
            return txt;
        }
}
window.onload = function(){
    // detect if touching interface
    let listener = function(evt){
        // the user touched the screen!
        MM.touched = true;
        window.removeEventListener('touchstart',listener,false);
    }
    window.addEventListener('touchstart',listener,false);
    // for ascii notations, used by math parser
    MM.ascii2tex = new AsciiMathParser();
    MM.resetCarts();
    // interface
    let tabsButtons = document.querySelectorAll("#header-menu .tabs-menu-link");
    tabsButtons.forEach(element => {
        element.onclick = function(){utils.showTab(element)};
    });
    document.getElementById("btnaccueil").onclick = function(element){
        utils.showTab(element.target);
    }
    utils.checkValues();
    utils.initializeAlea(Date());
    library.openContents();
    sound.getPlayer();
    // put the good default selected
    document.getElementById("chooseParamType").value = "paramsdiapo";
    // to show de good checked display
    MM.setDispositionEnonce(utils.getRadioChecked("Enonces"));
    // take history if present
    if(window.localStorage){
        document.querySelector("#tab-historique ol").innerHTML = localStorage.getItem("history");
    }
    // load scratchblocks french translation
    // TODO : à changer au moment de l'utilisation de scratchblocks
    // doesn't work on local file :( with Chrome
    /*let reader = new XMLHttpRequest();
    reader.onload = function(){
        let json = JSON.parse(reader.responseText);
        window.scratchblocks.loadLanguages({
            fr: json});
        }
    reader.open("get", "libs/scratchblocks/fr.json", false);
    reader.send();*/
}
class cart {
    constructor(id){
        this.id = id;
        this.activities = [];
        this.ordered = true;// les questions sont présentées par groupe d'activité
        this.sortable = undefined;
        this.editedActivityId = -1;
        this.target = [id]; // Indicates where to display the cart.
        this.nbq = 0;
        this.time = 0;
        this.title = "Diapo "+(id+1);
        this.loaded = false;
    }
    /**
     * Export datas of the cart to put in an url
     * @returns urlString
     */
    export(){
        let urlString = "&p="+this.id+
            "~t="+encodeURI(this.title)+
            "~c="+this.target+
            "~o="+this.ordered;
        for(let i=0,l=this.activities.length;i<l;i++){
            urlString += "_"+this.activities[i].export();
        }
        return urlString;
    }
    /**
     * Importe un panier et toutes ses activités
     * @param {json} obj objet importé d'un exo téléchargé
     * @param {Boolean} start if true, will make start slideshow when all is ready
     */
    import(obj,start=false){
        // à revoir
        this.title = obj.t;
        this.target = obj.c;
        if(obj.o==="false" || !obj.o){
            this.ordered = false;
        } else {
            this.ordered = true;
        }
        // activités, utilise Promise
        let activities = [];
        for(const i in obj.a){
            activities.push(activity.import(obj.a[i],i));
        }
        return Promise.all(activities).then(data=>{
            data.forEach((table)=>{
                this.activities[table[0]] = table[1];
            });
            //MM.editedActivity = this.activities[activities.length-1];
            this.loaded = true;
            // on crée l'affichage du panier chargé
            this.display();
            if(start)
                MM.checkLoadedCarts();

        }).catch(err=>{
            let alert = utils.create(
                "div",
                {
                    id:"messageerreur",
                    className:"message",
                    innerHTML:"Impossible de charger tous les exercices :(<br>"+err
                });
                document.getElementById("tab-accueil").appendChild(alert);
                setTimeout(()=>{
                    let div=document.getElementById('messageerreur');
                    div.parentNode.removeChild(div);
                },3000);
            });
    }
    /**
     * Ducplicate this object
     */
    duplicate(){
        if(MM.carts.length<4){
            // on ajoute un panier et l'affiche
            MM.addCart();
            // on affecte des copies des activités à ce nouveau panier.
            let cart = MM.carts[MM.carts.length-1];
            for(let i=0;i<this.activities.length;i++){
                cart.addActivity(this.activities[i]);
            }
            // on affiche le panier.
            cart.display();
        }

    }
    addActivity(obj){
        this.editedActivityId = -1;
        let temp = new activity(obj);
        this.activities.push(temp);
        this.display();
    }
    /**
     * remove an activity from the list
     * @param {integer} index of the activity
     */
    removeActivity(index){
        this.activities.splice(index,1);
        this.display();
    }
    /**
     * Change the order of the activities in conformity to the li order after a move
     * @param {integer} oldIndex old index of the activity
     * @param {integer} newIndex new index of the activity
     */
    exchange(oldIndex, newIndex){
        let indexes = this.activities.getKeys();
        let tempindexes = indexes[oldIndex];
        let temp = this.activities[oldIndex];
        this.activities.splice(oldIndex, 1);
        indexes.splice(oldIndex,1);
        this.activities.splice(newIndex, 0, temp);
        indexes.splice(newIndex, 0, tempindexes);
        this.editedActivityId =  indexes.indexOf(this.editedActivityId);
        this.display();// refresh order
    }
    /**
     * display the cart in his content area
     */
    display(){
        document.querySelector("#cart"+this.id+" h3").innerText=this.title;
        let dom = document.getElementById("cart"+(this.id)+"-list");
        dom.innerHTML = "";
        this.time = 0;
        this.nbq = 0;
        for(let i=0,l=this.activities.length; i<l;i++){
            let li = document.createElement("li");
            let activity = this.activities[i];
            this.time += Number(activity.tempo)*Number(activity.nbq);
            this.nbq += Number(activity.nbq);
            li.innerHTML = "<img src='img/editcart.png' align='left' onclick='MM.editActivity("+i+")' title=\"Editer l'activité\">"+activity.title + " (<span>"+activity.tempo + "</span> s. / <span>"+activity.nbq+"</span> quest.)";
            if(MM.carts[this.id].editedActivityId === i)li.className = "active";
            dom.appendChild(li);
        }
        let spans = document.querySelectorAll("#cart"+(this.id)+" div.totaux span");
        spans[0].innerHTML = math.sToMin(this.time);
        spans[1].innerHTML = this.nbq;
        spans[2].innerHTML = this.target;
        this.sortable = new Sortable(dom, {
            animation:150,
            ghostClass:'ghost-movement',
            onEnd : evt=>MM.carts[this.id].exchange(evt.oldIndex, evt.newIndex)
        });
    }
    /**
     * 
     * @param {Object} objImage DOM object of the clicked image
     */
    changeOrder(objImage){
        if(objImage.dataset["ordered"] === "true"){
            objImage.src = "img/iconfinder_windy_1054934.png";
            objImage.title = "Affichage mélangé des questions";
            objImage.dataset["ordered"] = "false";
            this.ordered = false;
        } else {
            objImage.src = "img/iconfinder_stack_1054970.png";
            objImage.title = "Affichage dans l'ordre des activités";
            objImage.dataset["ordered"] = "true";
            this.ordered = true;
        }
    }
}
/**
 * offer the possibility to anotate the page
 * designed for interactive screens
 * 
 * @param {String} tgt id de l'élément à couvrir
 * @param {String} btnId id du bouton qui déclenche le draw pour changer son image
 * 
 * fonctionne avec une variable d'environnement, ici MM.touched qui prend true si on a des évennements touch
 * détecté ainsi :
 *     let listener = function(evt){
        // the user touched the screen!
        MM.touched = true;
        window.removeEventListener('touchstart',listener,false);
    }
    window.addEventListener('touchstart',listener,false);
 * également dans le css :
#corrige-content #painting, #divparams #painting {
  position: absolute;
  display:block;
  cursor: url(../img/iconfinder_pencil.png), auto;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  z-index: 40;
}
 */
class draw {
    constructor(tgt,btnId){
        // creation du canva et instanciation
        const target = document.getElementById(tgt);
        let c = utils.create("canvas",{
            id:"painting",
            width:target.offsetWidth,
            height:target.offsetHeight+30
        });
        // changement d'aspect du bouton "annoter"
        this.btn = document.querySelector("#"+btnId + " img");
        this.btn.src = "img/iconfinder_pencil_activ.png";
        //insertion du canvas dans 
        target.appendChild(c);
        this.canvas = c;
        if(btnId.indexOf("btn-sample")>-1){
            this.canvas.style.top = 0;
            this.canvas.style.left = 0;
        }
        else {
            this.canvas.style.top = target.offsetTop+"px";
            this.canvas.style.left = target.offsetLeft+"px";
        }
        this.mouse = {x:0,y:0};
        const mouvement = (event)=>{
            let target = event.target;
            let evt = event
            if(MM.touched){
                target=event.touches[0].target;
                evt = event.touches[0];
            }
            this.mouse.x = evt.pageX - target.getBoundingClientRect().x;
            this.mouse.y = evt.pageY - target.getBoundingClientRect().y;
            if(this.enableDraw){
                if(!this.started){
                    this.started = true;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mouse.x,this.mouse.y);
                } else {
                    this.ctx.lineTo(this.mouse.x,this.mouse.y);
                    this.ctx.stroke();
                }
            }
            if(event.touches){
                event.preventDefault();
            }
        }
        const yesDraw = (event)=>{
            this.enableDraw = true;
            if(event.touches){
                event.preventDefault();
            }
        }
        const noDraw = (event)=>{
            this.enableDraw = false;this.started = false;
            if(event.touches){
                event.preventDefault();
            }
        }
        this.ctx = this.canvas.getContext('2d');
        this.ctx.strokeStyle = "grey";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.stroke();
        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 1;
        this.ctx.shadowColor = 'blue';
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.canvas.addEventListener("mousemove",mouvement, false);
        this.canvas.addEventListener('mousedown', yesDraw, false);
        this.canvas.addEventListener('mouseup',noDraw,false);
        this.canvas.addEventListener('mouseout',noDraw,false);
        if(MM.touched){
            this.canvas.addEventListener("touchmove",mouvement, false);
            this.canvas.addEventListener('touchstart', yesDraw, false);
            this.canvas.addEventListener('touchend', noDraw,false);
        }
    }
    // destroy canvas
    destroy(){
        this.btn.src = "img/iconfinder_pencil_1055013.png";
        this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = undefined;
        this.ctx = undefined;
    }
}
class steps {
    constructor(obj){
        this.step = 0;
        this.size = Number(obj.size);
        this.container = obj.container;
    }
    addSize(value){
        this.size += Number(value);
    }
    display(){
        let ul = document.createElement("ul");
        ul.className = "steps is-balanced has-gaps is-medium is-horizontal has-content-above has-content-centered";
        for(let i=0;i<this.size;i++){
            let li = utils.create("li",{className:"steps-segment"});
            let span = document.createElement("span");
            if(i === this.step){
                span.className = "steps-marker is-hollow";
                span.innerHTML = this.step+1;
                li.appendChild(span);
                //let div = utils.create("div",{className:"steps-content",innerHTML:this.step+1});
                //li.appendChild(div);
                li.className += " is-active";
            } else {
                span.className = "steps-marker";
                li.appendChild(span);
                /*let div = document.createElement("div");
                div.innerHTML = "&nbsp;";
                div.className = "steps-content";
                li.appendChild(div);*/
            }
            ul.appendChild(li);
        }
        if(this.container.hasChildNodes()){
            let node = this.container.childNodes[0];
            this.container.replaceChild(ul, node);
        } else {
            this.container.appendChild(ul);
        }
    }
    nextStep(){
        this.step++;
        this.display();
        if(this.step >= this.size)
            return false;
        return this.step;
    }
}
class Zoom {
    /**
     * 
     * @param {String} targetSelector Id de l'élément du DOM à zoomer/dézoomer
     */
    constructor(id,targetSelector){
        this.target = targetSelector;
        this.id=id;
    }
    changeSize(value){
        let dest = document.querySelectorAll(this.target);
        dest.forEach(elt=>elt.style.fontSize = math.round(Number(value)/10,1)+"em");
    }
    createCursor(){
        let div = utils.create("div",{id:this.id, className:"zoom"});
        let span = utils.create("span",{className:"zoom-a0",innerText:"A"});
        let span2 = utils.create("span",{className:"zoom-A1",innerText:"A"});
        let cursor = `<input type="range" min="6" max="60" step="2" value="10" oninput="MM.zooms['${this.id}'].changeSize(this.value)" ondblclick=MM.zooms['${this.id}'].changeSize(10)>`;
        div.appendChild(span);
        div.innerHTML += cursor;
        div.appendChild(span2);
        return div;
    }
}
// Figures
class Figure {
    constructor(obj, id, target, size){
        this.type = obj.type;
        this.content = obj.content;
        this.boundingbox = obj.boundingbox;
        this.axis = obj.axis;
        this.grid = obj.grid;
        this.id = id;
        this.size = size;//[w,h]
        this.imgSrc = obj.imgSrc||false;
        this.figure = undefined;
        this.displayed = false;
        this.create(target);
    }
    /**
     * construct de destination DOM element
     * @param {destination} destination DOMelement
     */
    create(destination){
        if(this.type === "chart"){
            let div = utils.create("div",{id:"div-dest-canvas-"+this.id});
            let canvas = document.createElement("canvas");
            canvas.id = this.id;
            if(this.size !== undefined){
                div.style.width = this.size[0]+"px";
                div.style.height = this.size[1]+"px";
            }
            div.appendChild(canvas);
            destination.appendChild(div);
        } else if(this.type === "graph"){
            let div = document.createElement("div");
            div.id=this.id;
            div.className = "jsxbox fig";
            destination.appendChild(div);
        }
    }
    /**
     * Crée une copie de la figure dans une nouvelle instance
     * @param {Figure} figure instance d'une figure
     * @returns false si figure n'est pas une instance de figure, sinon la nouvelle instance
     */
    static copyFig(figure, target){
        if(!figure instanceof Figure){
            return false;
        }
        return new this(
                figure,
                figure.id,
                target,
                figure.size
            );
    }
    /**
     * Affiche / cache le graphique dans le corrigé
     */
    toggle(){
        let elt;
        if(this.type ==="chart")
            elt = document.getElementById(this.id).parentNode;
        else if(this.type ==="graph")
            elt = document.getElementById(this.id);
        let cln = elt.className; // div contenant
        if(cln.indexOf("visible")<0){
            utils.addClass(elt,"visible");
            this.display();
        } else {
            utils.removeClass(elt,"visible");
        }
    }
    /**
     * Crée la figure
     * @param {window object} destination 
     * @returns nothing if displayed yet
     */
    display(destination){
        if(this.displayed) return;
        else this.displayed = true;
        // destination is the window destination object if defined
        if(this.type === "chart"){ // Chart.js
            let target;
            if(destination === undefined){
                target = document.getElementById(this.id);
                //this.figure = new Chart(target, this.content);
            } else {
                target = destination.document.getElementById(this.id);
                //this.figure = new destination.Chart(target, this.content);
            }
            //debug("Chart data", target, utils.clone(this.content));
            this.figure = new Chart(target, this.content);
        } else if(this.type === "graph"){ //JSXGraph
            try{
                //debug(this);
                if(destination === undefined){
                    this.figure = JXG.JSXGraph.initBoard(this.id, {boundingbox:this.boundingbox, keepaspectratio: true, showNavigation: false, showCopyright: false,registerEvents:false, axis:this.axis, grid:this.grid});
                } else {
                    this.figure = destination.JXG.JSXGraph.initBoard(this.id, {boundingbox:this.boundingbox, keepaspectratio: true, showNavigation: false, showCopyright: false,registerEvents:false, axis:this.axis, grid:this.grid});
                }
                let content = utils.clone(this.content);
                for(let i=0,len=content.length;i<len;i++){
                    let type = content[i][0];
                    let commande = content[i][1];
                    let options = false;
                    if(content[i][2] !== undefined)
                        options = content[i][2];
                    if(type === "functiongraph"){
                        let formule = commande;
                        if(!options)
                            this.figure.create("functiongraph", [function(x){return eval(formule)}], {strokeWidth:2});
                        else
                            this.figure.create("functiongraph", [function(x){return eval(formule)}], options);
                    } else if(type==="jessiescript") {
                        if(this.figure.jc === undefined){
                            this.figure.jc = new JXG.JessieCode();
                            this.figure.jc.use(this.figure);
                        }
                        this.figure.jc.parse(commande);
                    } else if(["text", "point","axis", "line", "segment", "angle", "polygon"].indexOf(type)>-1){
                        if(!options)
                            this.figure.create(type, commande);
                        else
                            this.figure.create(type,commande,options);
                    }
                }
            } catch(error){
                debug("Figure", error, this);
            }
        }
    }
}

// Timer
class timer {
    constructor(slideid){
        this.durations = []; 
        this.durationId = 0; // id of the currect duration timer
        this.startTime = 0; // start time of the timer
        this.endTime = 0; // end time of the timer
        this.timeLeft = 0; // remaining time until the end of the timer
        this.percent = 0; // width of the progressbar
        this.id = slideid; // number of the slider
        this.break = false; // break state
        this.timer = false; // interval
        this.ended = false; // indicates if all has ended
    }
    getTimeLeft(){
        this.timeLeft = this.endTime - Date.now();
        this.percent = Math.round(100 - this.timeLeft/10/this.durations[this.durationId]);
        this.display();
        if(this.timeLeft <= 0){
            this.stop();
            MM.nextSlide(this.id);
        }
    }
    addDuration(value){
        this.durations.push(value);
    }
    start(id){
        this.stop(); // just in case;
        if(this.ended) return false;
        this.break = false;
        if(MM.onlineState==="no"){
            let btnPause = document.querySelectorAll("#slider"+this.id+" .slider-nav img")[1];
            btnPause.src="img/slider-pause.png";
            utils.removeClass(btnPause,"blink_me");
        }
        if(id>-1){
            this.timeLeft = this.durations[id]*1000;
            this.durationId = id;
        }
        this.startTime = Date.now();
        this.endTime = this.startTime + this.timeLeft;
        if(this.timer){
            clearInterval(this.timer);
            this.timer = false;
        }
        this.timer = setInterval(this.getTimeLeft.bind(this),50);
    }
    pause(){
        if(this.ended) return false;
        if(this.break){
            this.break = false;
            this.start();
            return false;
        } else {
            this.break = true;
            this.stop();
            let btnPause = document.querySelectorAll("#slider"+this.id+" .slider-nav img")[1];
            btnPause.src="img/slider-play.png";
            utils.addClass(btnPause,"blink_me");
        }
    }
    stop(){
        if(this.timer){
            clearInterval(this.timer);
            this.timer = false;
        }        
    }
    end(){
        this.stop();
        this.ended = true;
        MM.messageEndSlide(this.id,this.durationId);
        setTimeout(MM.endSliders,3000);// if all of the timers ended together
    }
    display(){
        document.querySelector("#slider"+this.id+" progress").value = this.percent;
    }
}
class ficheToPrint {
    constructor(type,cart){
        this.type = type; // type = exos, interro, ceinture
        this.activities = cart.activities;
        this.wsheet = window.open("pagetoprint.html","mywindow","location=no,menubar=no,titlebar=no,width=794");
        this.wsheet.onload = function(){MM.fiche.populate()};
        this.nbq = undefined;
        if(this.type === "whogots" && this.activities.length === 1){
            this.nbq = document.getElementById("cardsNbValue").value;
        } else if(this.type === "dominos" && this.activities.length === 1){
            this.nbq = document.getElementById("dominosNbValue").value;
        }
    }
    generateQuestions(){
        // generate questions and answers
        for(let index=0;index<this.activities.length;index++){
            const activity = this.activities[index];
            activity.generate(this.nbq);
        }
    }
    populate(){
        // taille des caractères
        this.wsheet.document.getElementsByTagName('html')[0].className = "s"+document.getElementById('exTxtSizeValue').value.replace(".","");
        this.content = this.wsheet.document.getElementById("creator-content");
        this.docsheet = this.wsheet.document;
        utils.setSeed();
        if(this.type === "exo"){
            this.createExoSheet();
        } else if(this.type === "exam"){
            this.createInterroSheet();
        } else if(this.type === "ceinture"){
            this.createCeintureSheet();
        } else if(this.type === "flashcard"){
            this.generateQuestions();
            this.createFlashCards();
        } else if(this.type === "whogots"){
            this.generateQuestions();
            this.createWhoGots();
        } else if(this.type === "dominos"){
            this.generateQuestions();
            this.createDominos();
        }
        // render the math
        utils.mathRender(this.wsheet);
        // Pour pouvoir éditer l'activité en cours d'édition si unique
        if(MM.carts.length === 1 && MM.carts[0].activities.length === 1){
            MM.resetCarts();
            MM.editedActivity.display();
        }
    }
    /**
     * 
     * @param {string} type element name
     * @param {string} className
     * @param {string} innerHTML
     */
    create(type,params){
        let elm = this.docsheet.createElement(type);
        for(let i in params){
            elm[i] = params[i];
        }
        return elm;
    }
    createExoSheet(){
        let correction = "end";
        let radios = document.getElementsByName("excorr");
        for (let index = 0; index < radios.length; index++) {
            if(radios[index].checked)
                correction = radios[index].value;
        }
        let script = this.create("script",{text:`function changecols(dest,nb){document.getElementById(dest).className="grid g"+nb};
        function pagebreak(){let cor=document.querySelectorAll('.correction'),btn=document.getElementById('btn-break');if(cor[0].className==="correction"){for(i=0;i<cor.length;i++){cor[i].className="correction pagebreak";}btn.innerText='Corrigé à la suite des énoncés';}else {for(i=0;i<cor.length;i++){cor[i].className="correction";}btn.innerText='Corrigé sur page séparée';}}
        `});
        this.docsheet.head.appendChild(script);
        if(correction === "end")
            this.docsheet.getElementById('creator-menu').innerHTML += "<button id='btn-break' onclick='pagebreak();'>Corrigé sur page séparée</button>"

        MM.memory = {};

        for(let qty=0;qty<document.getElementById("exQtyValue").value;qty++){
            this.generateQuestions();

            // si plus d'une interro, on introduit un pagebreak
            if(qty>0)
                this.content.appendChild(this.create("footer"));
        // set elements :
        let aleaCode = this.create("div",{className:"floatright",innerHTML:"Clé : "+MM.seed+" p."+(qty+1)});
        this.content.appendChild(aleaCode);
        // get the titlesheet
        let sheetTitle = document.getElementById("extitle").value||"Fiche d'exercices";
        // set the titlesheet
        let header = this.create("header",{innerHTML:sheetTitle});
        this.content.appendChild(header);
        // get the exercice title
        let exTitle = document.getElementById("exeachex").value||"Exercice n°";
        // get the position of the correction
        let correctionContent = this.create("div",{className:"correction"});
        let titleCorrection = this.create("header", {className:"clearfix",innerHTML:"Correction des exercices"});
        if(correction === "end"){
            correctionContent.appendChild(titleCorrection);
        }
        // in case of figures
        // create a shit because of the li float boxes
        let divclear = this.create("div", {className:"clearfix"});
        for(let i=0;i<this.activities.length;i++){
            const activity = this.activities[i];
            let sectionEnonce = this.create("section",{id:"enonce"+qty+"-"+i,className:"enonce"});
            let sectionCorrection = this.create("section",{id:"corrige"+qty+"-"+i});
            let input = `<input id="nbcols${qty}-${i}" class="noprint fright" value="2" title="Nb de colonnes" type="number" size="2" min="1" max="6" oninput="changecols('ol${qty}-${i}',this.value)">`;
            sectionEnonce.innerHTML += input;
            let h3 = this.create("h3", {className:"exercice-title",innerHTML:exTitle+(i+1)+" : "+activity.title});
            sectionEnonce.appendChild(h3);
            let ol = this.create("ol",{id:"ol"+qty+"-"+i,className:"grid g2"});
            let olCorrection = this.create("ol", {className:"corrige"});
            for(let j=0;j<activity.questions.length;j++){
                let li = this.create("li",{className:"c3"});
                let liCorrection = this.create("li");
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let span = this.create("span",{className:"math", innerHTML:activity.questions[j]});
                    let spanCorrection = this.create("span", {className:"math",innerHTML:activity.answers[j]});
                    li.appendChild(span);
                    liCorrection.appendChild(spanCorrection);
                } else {
                    li.innerHTML = activity.questions[j];
                    liCorrection.innerHTML = activity.answers[j];
                }
                ol.appendChild(li);
                // figures
                if(activity.figures[j] !== undefined){
                    if(i===0 && j=== 0)MM.memory["dest"] = this.wsheet;
                    MM.memory[qty+"-"+"f"+i+"-"+j] = new Figure(utils.clone(activity.figures[j]), qty+"-"+"f"+i+"-"+j,li);
                }
                olCorrection.appendChild(liCorrection);
            }
            sectionEnonce.appendChild(ol);
            let ds = divclear.cloneNode(true);
            sectionEnonce.appendChild(ds);
            // affichage de la correction
            if(correction !== "end" ){
                let hr = this.docsheet.createElement("hr");
                hr.style.width = "50%";
                sectionEnonce.appendChild(hr);
                sectionEnonce.appendChild(olCorrection);
            } else {
                let h3correction = h3.cloneNode(true);
                sectionCorrection.appendChild(h3correction);
                sectionCorrection.appendChild(olCorrection);
                correctionContent.appendChild(sectionCorrection);
            }
            this.content.appendChild(sectionEnonce);
        }
        if(correctionContent.hasChildNodes){
            this.content.appendChild(correctionContent);
            let ds = divclear.cloneNode(true);
            this.content.appendChild(ds);
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
    createInterroSheet(){
        // in case of figures
        MM.memory = {};
        let script = this.create("script",{text:`
        function changecols(dest,nb){document.getElementById(dest).className="grid g"+nb};
        function changeheight(dest,nb){
            let elts = document.querySelectorAll("#"+dest+" .interro article");
            for(let i=0;i<elts.length;i++){
                elts[i].style.height = nb+"pt";
            }
        }
        `});
        this.docsheet.head.appendChild(script);
        for(let qty=0;qty<document.getElementById("intQtyValue").value;qty++){
            this.generateQuestions();
            // si plus d'une interro, on introduit un pagebreak
            if(qty>0)
                this.content.appendChild(this.create("footer"));
            // set elements :
            let aleaCode = this.create("div",{className:"floatright",innerHTML:"Clé : "+MM.seed+" p."+(qty+1)});
            this.content.appendChild(aleaCode);
            // get the titlesheet
            let sheetTitle = document.getElementById("inttitle").value||"Interrogation écrite";
            // set the titlesheet
            let header = this.create("header",{innerHTML:sheetTitle});
            this.content.appendChild(header);
            let div1 = this.create("div",{className:"studenName",innerHTML:"Nom, prénom, classe :"});
            this.content.appendChild(div1);
            let div2 = this.create("div",{className:"remarques",innerHTML:"Remarques :"});
            this.content.appendChild(div2);
            // get the exercice title
            let exTitle = document.getElementById("inteachex").value||"Exercice n°";
            let correctionContent = this.create("div",{className:"correction"});
            let titleCorrection = this.create("header", {className:"clearfix",innerHTML:"Correction des exercices"});
            correctionContent.appendChild(titleCorrection);
            let divclear = this.create("div",{className: "clearfix"});
            for (let i = 0; i < this.activities.length; i++) {
                const activity = this.activities[i];
                let sectionEnonce = this.create("section",{id:"section"+qty+"-"+i});
                let sectionCorrection = this.create("section");
                let input = `<input id="nbcols${qty}-${i}" class="noprint fright" value="30" title="Taille réponse" type="number" size="3" min="10" max="200" oninput="changeheight('ol${qty}-${i}',this.value)">`;
                sectionEnonce.innerHTML += input;
                input = `<input id="nbcols${qty}-${i}" class="noprint fright" value="2" title="Nb de colonnes" type="number" size="2" min="1" max="6" oninput="changecols('ol${qty}-${i}',this.value)">`;
                sectionEnonce.innerHTML += input;
                let h3 = this.create("h3", {className:"exercice-title",innerHTML:exTitle+(i+1)+" : "+activity.title});
                sectionEnonce.appendChild(h3);
                let ol = this.create("ol",{id:"ol"+qty+"-"+i,className:"grid g2"});
                let olCorrection = this.create("ol", {className:"corrige"});
                for(let j=0;j<activity.questions.length;j++){
                    let li = this.create("li",{className:"interro"});
                    let liCorrection = this.create("li");
                    if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                        let span = this.create("span",{className:"math", innerHTML:activity.questions[j]});
                        let spanCorrection = this.create("span", {className:"math", innerHTML:activity.answers[j]});
                        li.appendChild(span);
                        liCorrection.appendChild(spanCorrection);
                    } else {
                        li.innerHTML = activity.questions[j];
                        liCorrection.innerHTML = activity.answers[j];
                    }
                    ol.appendChild(li);
                    // figures
                    if(activity.figures[j] !== undefined){
                        if(i===0 && j=== 0)MM.memory["dest"] = this.wsheet;
                        MM.memory["f"+qty+"-"+i+"-"+j] = new Figure(utils.clone(activity.figures[j]), "f"+qty+"-"+i+"-"+j,li);
                    }                
                    let article = this.create("article");
                    li.appendChild(article);
                    olCorrection.appendChild(liCorrection);
                }
                sectionEnonce.appendChild(ol);
                let ds = divclear.cloneNode(true);
                sectionEnonce.appendChild(ds);
                let h3correction = h3.cloneNode(true);
                sectionCorrection.appendChild(h3correction);
                sectionCorrection.appendChild(olCorrection);
                correctionContent.appendChild(sectionCorrection);
                this.content.appendChild(sectionEnonce);
            }
            // insert footer for print page break
            this.content.appendChild(this.create("footer",{innerHTML:"Fin"}));
            // insert correction
            this.content.appendChild(correctionContent);
            let ds = divclear.cloneNode(true);
            this.content.appendChild(ds);
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
    createCeintureSheet(){
        // in case of figures
        MM.memory = {};
        const nbCeintures = document.getElementById("ceintqtyvalue").value;
        const nbcols = Number(document.getElementById("ceintcolsval").value);
        const nbrows = Number(document.getElementById("ceintrowsval").value);
        let script = this.create("script",{text:`
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
        * change la disposition des lignes d'exercices d'une colonne
        * dest : id de la colonne où changer la place des réponses.
        * (String) how : column/columnv pour colonnes en ligne ou verticales
        */
        function setDispositionReponse(dest,how){
            let setr="auto auto",setc="none";
            if(how==="row"){
                setr="none";setc="max-content auto";
            }
            // il peut y avoir plusieurs sujets, donc on doit faire un traitement multiple
            let elts = document.querySelectorAll(".col"+dest);
            for(let i=0;i<elts.length;i++){
                elts[i].style["grid"] = setr+" / "+setc;
            }
        }
        /*
        * Change la disposition de toutes les lignes d'exercices
        */
        function setDispositionReponseAll(how){
            let setr="auto auto",setc="none";
            let selindex = 1;
            if(how==="row"){
                setr="none";setc="max-content auto";
                selindex = 0;
            }
            // on sélectionne toutes colonnes
            let elts = document.querySelectorAll(".ceinture .grid .grid");
            for(let i=0;i<elts.length;i++){
                elts[i].style["grid"] = setr+" / "+setc;
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
        /*
        * change la couleur du fond des réponses
        * what : bg (background) || bd (border)
        */
       function changeColor(hexa,what){
           let elts = document.querySelectorAll(".ans");
           let styleAttr = "background-color";
           let styleVal = hexa;
           if(what==="bd"){
                styleAttr="border";
                if(hexa==="none")styleVal = "none";
                else styleVal="1pt solid "+hexa;
           }
           for(let i=0;i<elts.length;i++){
               elts[i].style[styleAttr] = styleVal;
           }
       }
       function changeBorder(bool){
        if(bool){
            changeColor(document.getElementById("colorpicker2").value,'bd');
        } else {
            changeColor('none','bd');
        }
       }
       `});
        this.docsheet.head.appendChild(script);
        let headnoprint = utils.create("section",{className:"noprint",id:"headnoprint"});
        headnoprint.innerHTML += "<span>Lignes :</span>"+`<input id="inputheight" value="20" title="Hauteur en pt" type="number" size="3" min="10" max="200" oninput="changeHeight(this.value)">`;
        headnoprint.innerHTML += "<span>Texte</span>";
        for(let i=1;i<=nbcols;i++){
            let input = `<input id="fsize${i}" value="12" title="Taille énoncé colonne ${i}" type="number" size="3" min="8" max="16" step="0.5" oninput="changeFontSize('${i}',this.value)">`;
            headnoprint.innerHTML += input;
        }
        headnoprint.innerHTML += "<span>Largeur colonne</span>";
        for(let i=1;i<=nbcols;i++){
            let input = `<input id="asize${i}" value="1" title="Taille colonne ${i}" type="number" size="3" min="0.5" max="4" step="0.1" oninput="changeWidth(${i},this.value)">`;
            headnoprint.innerHTML += input;
        }
        headnoprint.appendChild(utils.create("br"));
        headnoprint.innerHTML += "<strong>Réponse</strong> ";
        for(let i=1;i<=nbcols;i++){
            let input = `<select class="selectpos" oninput="setDispositionReponse(${i},this.value)">
            <option value="row">à côté</option>
            <option value="column">dessous</option>
            </select>`;
            headnoprint.innerHTML += input;
        }
        headnoprint.innerHTML += `<span>Tous</span> 
        <select oninput="setDispositionReponseAll(this.value)">
            <option value="row">à côté</option>
            <option value="column">dessous</option>
            </select>`;
        headnoprint.innerHTML+= ` Coul <input type="color" id="colorpicker" oninput="changeColor(this.value,'bg')" value="#ECECEC"> Cadre avec <input type="checkbox" value="true" onclick="changeBorder(this.checked)"> <input type="color" value="#111111" id="colorpicker2" oninput="changeColor(this.value,'bd')" size="8">`;
        this.content.appendChild(headnoprint);
        let correction = utils.create("div",{id:"correction",className:"pagebreak"});
        correction.appendChild(utils.create("div",{innerHTML:"Correction"}));
        // on crée autant de ceintures que demandées      
        for(let qty=0;qty<nbCeintures;qty++){
            // un conteneur pour la ceinture
            let ceinture = utils.create("div",{className:"ceinture"});
            // un conteneur pour le corrigé
            let corrige = utils.create("div",{className:"corrige ceinture"});
            this.generateQuestions();
            let header = utils.create("div",{className:"ceinture-header"});
            // Entêtes
            let bloc1 = utils.create("div",{className:"border-black ceinture-titre", innerHTML:document.getElementById("ceinttitle").value||"Ceinture"});
            let bloc2 = utils.create("div",{className:"border-black", innerHTML:"NOM :<br>Classe :"});
            let cleseed = "";
            if(document.getElementById("ceintprintToEnonce").checked)cleseed = "Clé : "+MM.seed+"<br> ";
            let bloc3 = this.create("div",{className:"border-black", innerHTML:cleseed+"grille "+(qty+1)});
            header.appendChild(bloc1);
            header.appendChild(bloc2);
            header.appendChild(bloc3);
            ceinture.appendChild(header);
            // entête du corrigé
            if(document.getElementById("ceintprintToCorrige").checked)cleseed = "Clé : "+MM.seed+" / ";
            else cleseed="";
            corrige.appendChild(utils.create("div",{innerHTML:(document.getElementById("ceinttitle").value||"Ceinture")+"<br>"+cleseed+"grille : "+(qty+1), className:"border-black"}));
            // un repère de colonne
            let colsid=0;
            // le css directement dans le DOM pour pouvoir le modifier ensuite
            let stylecols = Array(nbcols).fill("auto").join(" ");
            let stylerows = Array(nbrows).fill("auto").join(" ");
            const divColonnes = utils.create("div",{className:"ceinture-content grid",style:"grid-template-columns:"+stylecols+";grid-template-rows:"+(stylerows+1)});
            let divColsCorrige = utils.create("div",{className:"ceinture-corrige grid",style:"grid-template-columns:"+stylecols+";grid-template-rows:"+stylerows});
            // conteners corrections et enoncés (objet de tableaux)
            let divCorr={},cols={};
            let nbq = 0;
            for(let i=0;i<this.activities.length;i++){
                const activity = this.activities[i];
                for(let j=0;j<activity.questions.length;j++){
                    if(nbq%nbrows === 0){
                        // nouvelle colonne
                        colsid++;
                        cols[colsid]=[];
                        // on donne  à la colonne une classe pour pouvoir modifier des choses dedans.
                        divCorr[colsid]=[]
                        let titre = document.getElementById("ceinttitlecol"+colsid).value;
                        if(titre!==""){
                            cols[colsid].push(utils.create("div",{innerHTML:titre,className:"ceinture-titre-colonne border-black"}))
                        }
                    }
                    nbq++;
                    let ligne = utils.create("div",{className:"grid border-black col"+colsid,style:"grid-column:"+colsid});
                    let ligneCorr = utils.create("div",{className:"grid border-black"});
                    if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                        let divq = utils.create("div",{className:"question"+colsid+" quest"});
                        let span = utils.create("span",{className:"math", innerHTML:activity.shortQuestions[j]||activity.questions[j]});
                        divq.appendChild(span);
                        ligne.appendChild(divq);
                        
                    } else {
                        ligne.appendChild(utils.create("div",{innerHTML:activity.shortQuestions[j]||activity.questions[j],className:"question"+colsid+" quest"}));
                    }
                    let value = activity.values[j];
                    if(Array.isArray(value))value=value[0];
                    let spanc = utils.create("span", {className:"math", innerHTML:value});
                    ligneCorr.appendChild(spanc);
                    divCorr[colsid].push(ligneCorr);
                    let divans = utils.create("div",{className:"bg-grey ans answer"+colsid,style:"height:20pt;"});
                    ligne.appendChild(divans);
                    //divs[colsid-1].appendChild(ligne);
                    cols[colsid].push(ligne);
                    if(nbq%nbrows === 0 && nbrows>0){
                        let pied = document.getElementById("ceintpiedcol").value;
                        if(pied !== ""){
                            cols[colsid].push(utils.create("div",{innerHTML:pied,className:"ceinture-pied-colonne border-black"}));
                        }
                    }
                }
            }
            // on insère les enfants
            for(let i=0;i<cols[1].length;i++){
                for(let j=1;j<=nbcols;j++){
                    divColonnes.appendChild(cols[j][i]);
                }
            }
            ceinture.appendChild(divColonnes);
            this.content.appendChild(ceinture);

            for(let i=0;i<divCorr[1].length;i++){
                for(let j=1;j<=nbcols;j++){
                    divColsCorrige.appendChild(divCorr[j][i]);
                }
            }
            corrige.appendChild(divColsCorrige)
            correction.appendChild(corrige);
        }
        //this.content.appendChild(utils.create("div",{className:"footer"}));
        // on ajoute la correction à la fin.
        this.content.appendChild(correction);
    }
    createFlashCards(){
        // in case of figures
        MM.memory = {};
        let script = this.create("script",{text:`
        function changeheight(nb){
            let elts = document.querySelectorAll(".card");
            for(let i=0;i<elts.length;i++){
                elts[i].style.height = nb+"mm";
            }
        }
        `});
        this.docsheet.head.appendChild(script);
        // set elements :
        let aleaCode = this.create("div",{className:"floatright",innerHTML:"Clé : "+MM.seed});
        this.content.appendChild(aleaCode);
        let input = `<input class="noprint fright" value="55" title="Taille cartes" type="number" size="3" min="30" max="180" oninput="changeheight(this.value)">`;
        this.content.innerHTML += input;
        // get the titlesheet
        let sheetTitle = document.getElementById("FCtitle").value||"Cartes Flash";
        // set the titlesheet
        let header = this.create("header",{innerHTML:sheetTitle});
        this.content.appendChild(header);
        let sectionCartes = this.create("section",{className:"flash-section grid g2"});
        for (let i = 0; i < this.activities.length; i++) {
            const activity = this.activities[i];
            for(let j=0;j<activity.questions.length;j++){
                let artQuestion = this.create("article",{className:"flash-question card"});
                let divq = this.create("div");
                let artCorrection = this.create("article",{className:"flash-reponse card"});
                let divr = this.create("div");
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let span = this.create("span",{className:"math", innerHTML:activity.questions[j]});
                    let spanCorrection = this.create("span", {className:"math", innerHTML:activity.answers[j]});
                    divq.appendChild(span);
                    divr.appendChild(spanCorrection);
                } else {
                    divq.innerHTML = activity.questions[j];
                    divr.innerHTML = activity.answers[j];
                }
                artQuestion.appendChild(divq);
                artCorrection.appendChild(divr)
                sectionCartes.appendChild(artQuestion);
                // figures
                if(activity.figures[j] !== undefined){
                    if(i===0 && j=== 0)MM.memory["dest"] = this.wsheet;
                    MM.memory["f"+i+"-"+j] = new Figure(utils.clone(activity.figures[j]), "f"+i+"-"+j, divq);
                }
                sectionCartes.appendChild(artCorrection);
            }
        }
        this.content.appendChild(sectionCartes);
        if(!utils.isEmpty(MM.memory)){
            setTimeout(function(){
                for(const k in MM.memory){
                    if(k!=="dest")
                        MM.memory[k].display(MM.memory["dest"]);
                }
            }, 300);
        }
    }
    createWhoGots(){
        // in case of figures
        MM.memory = {};
        let script = this.create("script",{text:`
        function changeheight(nb){
            let elts = document.querySelectorAll(".whogot-carte");
            for(let i=0;i<elts.length;i++){
                elts[i].style.height = nb+"mm";
            }
        }
        function changewidth(nb){
            let elts = document.querySelectorAll(".whogot-carte");
            for(let i=0;i<elts.length;i++){
                elts[i].style.width = nb+"mm";
            }
        }
        `});
        let WGquestion = document.getElementById("WGquestion").value?document.getElementById("WGquestion").value:"Qui a ?";
        let WGaffirmation = document.getElementById("WGaffirmation").value?document.getElementById("WGaffirmation").value:"J'ai ...";
        this.docsheet.head.appendChild(script);
        // set elements :
        let aleaCode = this.create("div",{className:"floatright",innerHTML:"Clé : "+MM.seed});
        this.content.appendChild(aleaCode);
        let input = `<input class="noprint fright" value="55" title="Hauteur cartes" type="number" size="3" min="30" max="180" oninput="changeheight(this.value)">
        <input class="noprint fright" value="55" title="Largeur cartes" type="number" size="3" min="30" max="180" oninput="changewidth(this.value)">`;
        this.content.innerHTML += input;
        // get the titlesheet
        let sheetTitle = document.getElementById("FCtitle").value||"J'ai / Qui a ?";
        // set the titlesheet
        let header = this.create("header",{innerHTML:sheetTitle});
        this.content.appendChild(header);
        let sectionCartes = this.create("section",{className:"whogot-section"});
        //Nombre de cartes
        let nbOfCards = 0;
        for (let i = 0; i < this.activities.length; i++) {
            const activity = this.activities[i];
            for(let j=0;j<activity.questions.length;j++){
                nbOfCards++;
                let carte = this.create("article", {className:"whogot-carte",id:"carte"+nbOfCards});
                let artQuestion = this.create("article",{className:"whogot-question",innerHTML:"<h3>"+WGquestion+"</h3>"});
                let divq = this.create("div");
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let span = this.create("span",{className:"math", innerHTML:activity.questions[j]});
                    divq.appendChild(span);
                } else {
                    divq.innerHTML = activity.questions[j];
                }
                artQuestion.appendChild(divq);
                carte.appendChild(artQuestion);
                // figures
                if(activity.figures[j] !== undefined){
                    if(MM.memory["dest"]===undefined)MM.memory["dest"] = this.wsheet;
                    MM.memory["f"+nbOfCards] = new Figure(utils.clone(activity.figures[j]), "f"+nbOfCards, divq);
                }
                sectionCartes.appendChild(carte);
            }
        }
        this.content.appendChild(sectionCartes);
        // numéro de la carte où placer la réponse, décalé de 1 par rapport aux questions
        let numAnswer = 1;
        for (let i = 0; i < this.activities.length; i++) {
            const activity = this.activities[i];
            for(let j=0;j<activity.questions.length;j++){
                numAnswer++;
                let carte = this.docsheet.getElementById("carte"+(numAnswer>nbOfCards?1:numAnswer));
                let artCorrection = this.create("article",{className:"whogot-reponse",innerHTML:"<h3>"+WGaffirmation+"</h3"});
                let divr = this.create("div");
                let answer = activity.values[j];
                if(_.isArray(answer))answer = answer[0];
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let spanCorrection = this.create("span", {className:"math", innerHTML:answer});
                    divr.appendChild(spanCorrection);
                } else {
                    divr.innerHTML = "<span class='math'>"+answer+"</span>";
                }
                artCorrection.appendChild(divr);
                let hr = this.create("hr");
                carte.prepend(hr);
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
    createDominos(){
        // in case of figures
        MM.memory = {};
        let script = this.create("script",{text:`
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
        `});
        this.docsheet.head.appendChild(script);
        // set elements :
        let aleaCode = this.create("div",{className:"floatright",innerHTML:"Clé : "+MM.seed});
        this.content.appendChild(aleaCode);
        let input = `<div class="noprint fright">Largeur : 
        <input value="60" title="Largeur domino" type="number" size="3" min="60" max="180" oninput="changewidth(this.value)">
        Hauteur :
        <input value="25" title="Hauteur domino" type="number" size="3" min="25" max="180" oninput="changeheight(this.value)">
        </div>`;
        this.content.innerHTML += input;
        // get the titlesheet
        let sheetTitle = "<h1>Dominos</h1>";
        // set the titlesheet
        let header = this.create("header",{innerHTML:sheetTitle});
        this.content.appendChild(header);
        let sectionCartes = this.create("section",{className:"dominos-section"});
        let nbOfCards=0;
        for (let i = 0; i < this.activities.length; i++) {
            const activity = this.activities[i];
            for(let j=0;j<activity.questions.length;j++){
                nbOfCards++;
                let carte = this.create("article", {className:"dominos-carte",id:"domino"+nbOfCards});
                let hr = this.create("div",{className:"barrev",innerHTML:"&nbsp;"});
                carte.appendChild(hr);
                let artQuestion = this.create("article",{className:"dominos-question"});
                let divq = this.create("div");
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let span = this.create("span",{className:"math", innerHTML:activity.questions[j]});
                    divq.appendChild(span);
                } else {
                    divq.innerHTML = activity.questions[j];
                }
                artQuestion.appendChild(divq);
                carte.appendChild(artQuestion);
                // figures
                if(activity.figures[j] !== undefined){
                    if(MM.memory["dest"]===undefined)MM.memory["dest"] = this.wsheet;
                    MM.memory["f"+nbOfCards] = new Figure(utils.clone(activity.figures[j]), "f"+nbOfCards, divq);
                }
                sectionCartes.appendChild(carte);
            }
        }
        this.content.appendChild(sectionCartes);
        let numAnswer=1;
        for (let i = 0; i < this.activities.length; i++) {
            const activity = this.activities[i];
            for(let j=0;j<activity.questions.length;j++){
                numAnswer++;
                let carte = this.docsheet.getElementById("domino"+(numAnswer>nbOfCards?1:numAnswer));
                let artCorrection = this.create("article",{className:"dominos-reponse"});
                let divr = this.create("div");
                let answer = activity.values[j];
                if(_.isArray(answer))answer = answer[0];
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let spanCorrection = this.create("span", {className:"math", innerHTML:answer});
                    divr.appendChild(spanCorrection);
                } else {
                    divr.innerHTML = "<span class='math'>"+answer+"</span>";
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
};
// MathsMentales core
var MM = {
    version:3,// à mettre à jour à chaque upload pour régler les pb de cache
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
    userAnswers:[],
    slidersNumber:1,
    faceToFace:'n',
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
        utils.checkRadio("direction",MM.slidersOrientation);
        utils.checkRadio("beforeSlider",MM.introType);
        utils.checkRadio("endOfSlideRadio",MM.endType);
        utils.checkRadio("online",MM.onlineState);
        utils.checkRadio("facetoface",MM.faceToFace);
        utils.checkRadio("Enonces",MM.slidersNumber);
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
        let button = document.createElement("button");
        button.value = cartsNb;
        button.className = "tabs-menu-link";
        button.innerHTML = '<img src="img/cart'+cartsNb+'.png">';
        button.id = "button-cart"+cartsNb;
        button.onclick = function(elt){
            let value = "";
            if(elt.target.nodeName.toLowerCase() === "img"){
                // prevent img elt clicked detection
                value = elt.target.parentNode.value;
            } else value = elt.target.value;
            MM.showCart(value);
        }
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
        cartsMenu.innerHTML = `<button onclick="MM.showCart(this.value);" class="tabs-menu-link is-active" value="1" id="button-cart1"><img src="img/cart1.png"></button>
        <button id="addcart" title="Ajouter un panier" onclick="MM.addCart();"><img src="img/cartadd.png"></button>`;
        for(let i=1;i<this.carts.length;i++){
            let btnnb = i+1;
            let button = utils.create("button",{
                value:btnnb,
                className:"tab-menu-link",
                innerHTML:'<img src="img/cart'+btnnb+'.png">',
                id:"button-cart"+btnnb
            });
            button.onclick = function(elt){
                let value = "";
                if(elt.target.nodeName.toLowerCase() === "img"){
                    // prevent img elt clicked detection
                    value = elt.target.parentNode.value;
                } else value = elt.target.value;
                MM.showCart(value);
            }
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
            document.getElementById("cart"+index+"-list").innerHTML = "";
            MM.carts[index-1].display();
        } else return false;
    },
    addToCart(){
        MM.carts[MM.selectedCart].addActivity(MM.editedActivity);
        // on affiche les panier
        MM.showCartInterface();
    },
    removeFromCart(){
        let cart = MM.carts[MM.selectedCart];
        cart.removeActivity(cart.editedActivityId);
        cart.editedActivityId = -1;
        document.getElementById("addToCart").className = "";
        document.getElementById("removeFromCart").className = "hidden";
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
                let message = `Tu as suivi un lien d'activité préconfigurée MathsMentales.<br>Clique ci-dessous pour démarrer.<br><br><button onclick="utils.closeMessage('messageinfo');MM.start()"> Commencer ! 
                </button>`;
                if(MM.carts.length===1 && MM.carts[0].target.length===1)
                message +=`<br><br> ou <button onclick="utils.closeMessage('messageinfo');MM.setOnlineState('yes');MM.start()"> Commencer (réponse en ligne) !</button>`;
                let alert=utils.create("div",{id:"messageinfo",className:"message",innerHTML:message});
                document.getElementById("tab-accueil").appendChild(alert);
            }
        } else {
            let messageinfo = document.getElementById("messageinfo");
            if(messageinfo !== null){
                messageinfo.innerHTML +="<br><br>Le chargement n'est pas encore terminé. Patience...";
            }
        }
    },
    populateQuestionsAndAnswers(withAnswer){
        if(withAnswer=== undefined)withAnswer = true;
        MM.figs = {};MM.steps=[];MM.timers=[];MM.memory={};
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
        for(let i=0;i<length;i++){
            MM.carts[i].actsArrays = [];
            for(let kk=0,clen=MM.carts[i].target.length;kk<clen;kk++){
                let indiceSlide = 0;
                let slideNumber = MM.carts[i].target[kk]-1;
                let slider = document.getElementById("slider"+slideNumber);
                let addTitle = "";
                if(clen>1)addTitle = "-"+(kk+1);
                let titleSlider = MM.carts[i].title+addTitle;
                document.querySelector("#slider"+slideNumber+" .slider-title").innerHTML = titleSlider;
                let sliderSteps = document.querySelector("#slider"+slideNumber+" .steps-container");
                let dive = utils.create("div",{id:"de"+i+"-"+kk});
                let divc = utils.create("div",{id:"dc"+i+"-"+kk});
                MM.zooms["zc"+i+"-"+kk] = new Zoom("zc"+i+"-"+kk,"#dc"+i+"-"+kk+" ol");
                MM.zooms["ze"+i+"-"+kk] = new Zoom("ze"+i+"-"+kk,"#de"+i+"-"+kk+" ol");
                dive.appendChild(MM.zooms["ze"+i+"-"+kk].createCursor());
                divc.appendChild(MM.zooms["zc"+i+"-"+kk].createCursor());
                let h3e = utils.create("h3",{innerText:titleSlider}); // exercice's title
                let h3c = utils.create("h3",{innerText:titleSlider});// correction's title
                dive.append(h3e);
                divc.append(h3c);
                let ole = utils.create("ol");
                let olc = utils.create("ol");
                MM.steps[slideNumber] = new steps({size:0, container:sliderSteps});
                MM.timers[slideNumber] = new timer(slideNumber);
                let actsArray=[];
                // on fait la liste des références activités / questions pour pouvoir créer les affichages
                for(let z=0,alen=MM.carts[i].activities.length;z<alen;z++){
                    let activity = MM.carts[i].activities[z];
                    activity.generate();
                    MM.steps[slideNumber].addSize(activity.nbq);
                    for(let j=0;j<activity.questions.length;j++){
                        actsArray.push([z,j]);
                    }
                }
                // on mélange les références si on veut que tout soit mélangé.
                if(!MM.carts[i].ordered){
                    actsArray = _.shuffle(actsArray);
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
                    // slides
                    let div = utils.create("div",{className:"slide w3-animate-top"+(indiceSlide>0?" hidden":""),id:"slide"+slideNumber+"-"+indiceSlide});
                    let span = utils.create("span",{innerHTML:question});
                    let spanAns = utils.create("span",{className:"answerInSlide hidden",innerHTML:answer});
                    // timers
                    MM.timers[slideNumber].addDuration(activity.tempo);
                    // enoncés et corrigés
                    let lie = utils.create("li",{innerHTML:question});
                    let lic = document.createElement("li");
                    if(activity.type === undefined || activity.type === "" || activity.type === "latex"){
                        lie.className = "math";
                        lic.className = "math";
                        span.className="math";
                        spanAns.className += " math";
                    }
                    div.appendChild(span);
                    if(MM.onlineState !=="yes"){
                        // include answer if not online state
                        div.appendChild(spanAns);
                    }
                    // insertion du div dans le slide
                    slider.appendChild(div);
                    lic.innerHTML += answer;
                    if(activity.figures[j] !== undefined){
                        lic.innerHTML += "<button onclick=\"MM.memory['c"+slideNumber+"-"+indiceSlide+"'].toggle()\">Figure</button>";
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
        //let slider=0,slide = 0;
        for(let slider=0,len=MM.carts[0].target.length;slider<len;slider++){
            for(let slide=0,len2=MM.carts[0].actsArrays[slider].length;slide<len2;slide++){
                const MFTARGET = document.getElementById("slider"+slider);
                const element = document.getElementById("slide"+slider+"-"+slide);
                const ID = 'ansInput'+slider+'-'+slide;
                MM.mf[ID] = new MathfieldElement({
                    smartMode:true,
                    virtualKeyboardMode:'manual',
                    virtualKeyboards:'numeric',
                    fontsDirectory:'../katex/fonts',
                    virtualKeyboardContainer:MFTARGET,
                    virtualKeyboardTheme:"material"
               });
               MM.mf[ID].id = ID;
               MM.mf[ID].target = element;
               MM.mf[ID].addEventListener("keyup",function(event){
                    if(event.key === "Enter" || event.keyCode === 9){
                        MM.nextSlide(0);
                        event.preventDefault();
                }
                });
                element.appendChild(MM.mf[ID]);
                element.appendChild(utils.create("div",{style:"height:270px;"}));
                MM.mf[ID].addEventListener("virtual-keyboard-toggle",(evt)=>{console.log(evt)});
            }
        }
        /*for(let i=0,len=MM.carts[0].target[0].actsArray.length;i<len;i++){
            let activity = MM.carts[0].activities[i];
            const MFTARGET = document.getElementById("slider"+slider);
            for(let j=0,lenq=activity.questions.length;j<lenq;j++){
                const element = document.getElementById("slide"+slider+"-"+slide);
                const ID = 'ansInput'+slider+'-'+slide;
                MM.mf[ID] = new MathfieldElement({
                    smartMode:true,
                    virtualKeyboardMode:'manual',
                    virtualKeyboards:'numeric',
                    fontsDirectory:'../katex/fonts',
                    virtualKeyboardContainer:MFTARGET,
                    virtualKeyboardTheme:"material"
               });
               MM.mf[ID].id = ID;
               MM.mf[ID].target = element;
               MM.mf[ID].addEventListener("keyup",function(event){
                    if(event.key === "Enter" || event.keyCode === 9){
                        MM.nextSlide(0);
                        event.preventDefault();
                }
                });
                element.appendChild(MM.mf[ID]);
                element.appendChild(utils.create("div",{style:"height:270px;"}));
                MM.mf[ID].addEventListener("virtual-keyboard-toggle",(evt)=>{console.log(evt)});
                slide++;
            }
        }*/
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
        MM.fiche = new ficheToPrint("exo",MM.carts[0]);
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
        MM.fiche = new ficheToPrint("ceinture",MM.carts[0]);
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
        MM.fiche = new ficheToPrint("dominos",MM.carts[0]);
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
            MM.userAnswers = [];
            // security there should not be more than 1 cart for the online use
            // TODO à adapter pour le mode duel
            if(MM.carts.length > 1){
                for(let i=1,len=MM.carts.length;i<len;i++){
                    delete MM.carts[i];
                }
            }
        }
        utils.showTab("none");
        // check if an option has been chosen
        MM.checkIntro();
        MM.createSlideShows();
        MM.populateQuestionsAndAnswers();
        if(MM.introType === "321"){
            document.getElementById("countdown-container").className = "";
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
    },
    paramsToURL(withAleaSeed=false){
        return "i="+MM.introType+
            ",e="+MM.endType+
            ",o="+MM.onlineState+
            ",s="+MM.slidersNumber+
            ",so="+MM.slidersOrientation+
            ",f="+MM.faceToFace+
            ",a="+(withAleaSeed?MM.seed:"")+
            this.export();
    },
    // open an modal and
    // get the URL of direct access to the activity with actual parameters
    copyURL(){
        let modalMessage = utils.create("div",
            {
                id:"urlCopy",
                className:"message",
                style:"padding:1.5rem",
                innerHTML:`<div>Adresse longue<div>
                <textarea readonly="true" id="bigurl" cols="38" onfocus="utils.copy(this);"></textarea><br>
                <button onclick="MM.getQR();">Raccourcir l'url</button><br>
                <input readonly="true" type="url" id="shorturl" size="38" onfocus="utils.copy(this)">
                <div id="shortQRdiv"></div>
                `
            }
            )
        //let carts = this.export();
        let withSeed = false;
        if(document.getElementById("aleaInURL").checked)withSeed = true;
        let params = this.paramsToURL(withSeed);
        let close = utils.create("button",{innerHTML:"<img src='img/closebutton32.png'>",style:"position:absolute;top:0.5rem;right:0.5rem;padding:0;background:transparent"});
        close.onclick = ()=>{let m = document.getElementById("urlCopy");m.parentNode.removeChild(m)};
        modalMessage.appendChild(close);
        document.getElementById("colparameters").appendChild(modalMessage);
        //if(document.getElementById("aleaInURL").checked)params.a = MM.seed;
        let input = document.getElementById("bigurl");
        input.value = this.setURL(params);
        // on affiche (furtivement) le input pour que son contenun puisse être sélectionné.
        input.className = "";
        input.select();
        input.setSelectionRange(0,99999);
        document.execCommand("copy");
        //input.className ="hidden";
        //let message = document.querySelector(".button--inverse .tooltiptext").innerHTML;
        //document.querySelector(".button--inverse .tooltiptext").innerHTML = "Copié !";
        //setTimeout(()=>document.querySelector(".button--inverse .tooltiptext").innerHTML = message,2500);
    },
    copyURLtoHistory(){
        //let carts = this.export();
        let withSeed = true;
        let params = this.paramsToURL(withSeed);
        let url = this.setURL(params);
        let paramsSansSeed = this.paramsToURL(false);
        let urlSansSeed = this.setURL(paramsSansSeed);
        let li = utils.create("li");
        let span = utils.create("span", {innerText:"Panier du "+utils.getDate()+": ",className:"bold"});
        li.appendChild(span);
        const a = utils.create("a",{href:url,innerText:"🎯 lien (mêmes données)"});
        li.appendChild(a);
        const a2 = utils.create("a",{href:urlSansSeed,innerText:"🎯 lien (autres données)"});
        li.appendChild(a2);
        let button = `
        <span class="pointer underline" data-url="${url}" onclick="utils.checkURL(this.dataset['url'],false,true)">
            🛠 éditer
        </span>
        <span class="pointer underline" onclick="MM.removeFromHistory(this.parentNode)">❌ Supprimer</span>
        `;
        li.innerHTML += button;
        li.appendChild(this.getCartsContent());
        // on supprime les anciennes références à la même activité
        let lis = document.querySelectorAll("#tab-historique span[data-url='"+url+"']");
        for(let k=0;k<lis.length;k++){
            let parent = lis[k].parentNode;
            document.querySelector("#tab-historique ol").removeChild(parent);
        }
        // insertion de l'élément
        document.querySelector("#tab-historique ol").prepend(li);
        // TODO
        // on supprime les références qui datent de plus de ...
        if(window.localStorage){
            localStorage.setItem("history",document.querySelector("#tab-historique ol").innerHTML);
        }
    },
    /**
     * Enlève un élément du DOM de l'historique et enregistre localement au cas où.
     * @param {DOM element} elem 
     */
    removeFromHistory(elem){
        if(!confirm("Supprimer cet élément : \n"+elem.childNodes[0].innerText+" ?"))return false;
        document.querySelector("#tab-historique ol").removeChild(elem);
        if(window.localStorage){
            localStorage.setItem("history",document.querySelector("#tab-historique ol").innerHTML);
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
        // let carts = this.export();
        let withSeed = false;
        if(document.getElementById("aleaInURL").checked)
            withSeed = true;
        let params = this.paramsToURL(withSeed);
        let url = this.setURL(params);
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
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        MM.checkIntro();
        utils.setSeed();
        //let carts = {};
        for(let i=0;i<this.carts.length;i++){
            //carts[i] = this.carts[i].export();
            urlString += this.carts[i].export();
        }
        return urlString;//carts;
    },
    setURL(string){
        /*let chaine = "";
        let first = true;
        for(const i in params){
            if(first){
                first = false;
                chaine += i+"="+params[i];
            } else {
                chaine += "&"+i+"="+params[i];
            }
        }*/
        return utils.baseURL+'index.html?'+string;
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
        // génération des données aléatoires pour les exemples
        for(let i=0,len=MM.carts.length;i<len;i++){
            MM.carts[i].activities[0].generateSample();
        }
        let divSample = utils.create("div",{id:"sampleLayer",className:"sample"});
        // creation des emplacements d'affichage
        for(let i=0;i<nb;i++){
            let div = utils.create("div",{id:"sample"+i});
            if(nb === 1)div.className = "slider-1";
            else if(nb===2)div.className = "slider-2";
            else div.className = "slider-34";
            let nextActivity = "";
            if(MM.carts[i].activities.length>1) {
                nextActivity = `<button title="Activité suivante du panier" data-actid="0" onclick="MM.newSample(${i},true)" id="ButtonNextAct${i}"><img src="img/slider-next.png"></button>`;
            }
            div.innerHTML = `Exemple <div class="slider-nav">
            <button title="Annoter l'exemple" id="btn-sample-annotate${i}" onclick="utils.annotate('sampleSlide${i}',this.id);"><img src="img/iconfinder_pencil_1055013.png"></button>
            <button title="Montrer la réponse" onclick="MM.showSampleAnswer(${i});"><img src="img/slider-solution.png"></button>
            <button title="Autre exemple" onclick="MM.newSample(${i});"><img src="img/newsample.png"></button>
            ${nextActivity}
            <button title="Démarrer le diaporama" onclick="MM.startSlideShow(${i});"><img src="img/fusee.png"></button>
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
        if(MM.slidersOrientation === "v")container.className = "hidden vertical";
        else container.className = "hidden";
        for(let i=0;i<nb;i++){
            let div = document.createElement("div");
            div.id = "slider"+i;
            if(nb === 1)div.className = "slider-1";
            else if(nb===2)div.className = "slider-2";
            else div.className = "slider-34";
            // facetoface option
            if(nb>1 && MM.faceToFace==="y" && i===0)div.className += " return";
            else if(nb>2 && MM.faceToFace==="y" && i===1)div.className +=" return";
            let innerH = `<div class="slider-head"><div class="slider-nav">
            <button title="Arrêter le diaporama" onclick="MM.timers[${i}].end()"><img src="img/slider-stop.png" /></button>`;
            if(MM.onlineState==="no"){
                // on crée les boutons de pause et montrer réponse si on n'est pas en mode online
                innerH += `<button title="Mettre le diapo en pause" onclick="MM.timers[${i}].pause()"><img src="img/slider-pause.png" /></button>
                <button title="Montrer la réponse" onclick="MM.showTheAnswer(${i});"><img src="img/slider-solution.png" /></button>`;
            }
            innerH += `<button title="Passer la diapo" onclick="MM.nextSlide(${i});"><img src="img/slider-next.png" /></button>
            </div>
            <div class="slider-title"></div>
            <div class="slider-chrono"><progress class="progress is-link is-large" value="0" max="100"></progress></div>
            <div id="zs${i}" class="zoom">
                <span class="zoom-a0">A</span>
                <input type="range" min="6" max="60" step="2" value="10" oninput="MM.zooms['zs${i}'].changeSize(this.value)" ondblclick="MM.zooms['zs${i}'].changeSize(10)">
                <span class="zoom-A1">A</span>
            </div></div>
            <div class="steps-container"></div>`;
            div.innerHTML = innerH;
            container.appendChild(div);
            MM.zooms["zs"+i] = new Zoom("zs"+i,"#slider"+i+" .slide");
        }
    },
    showSlideShows:function(){
        utils.removeClass(document.getElementById("slideshow-container"),"hidden");
        utils.addClass(document.getElementById("app-container"), "hidden");
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
        utils.addClass(document.getElementById("slideshow-container"),"hidden");
        utils.removeClass(document.getElementById("app-container"), "hidden");
        let whatToDo = utils.getRadioChecked("endOfSlideRadio");
        if(MM.onlineState === "yes"){
            // on affiche un message de fin qui attend une validation
            let alert = utils.create("div",{id:"messagefin",className:"message",innerHTML:`L'activité MathsMentales est terminée.<br>Pour consulter les résultats, cliquer sur le bouton ci-dessous.<br><br>
            <button onclick="utils.closeMessage('messagefin');utils.showTab('tab-corrige');"> Voir le corrigé 
            </button>`});
            document.body.appendChild(alert);
        } else if(whatToDo === "correction"){
            utils.showTab("tab-corrige");
        } else if(whatToDo === "list"){
            utils.showTab("tab-enonce");
        }
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
                let actId = document.getElementById("ButtonNextAct"+id).dataset.actid;
                if(next){
                    actId++;
                    if(actId>=nbActivities) actId=0;
                    document.getElementById("ButtonNextAct"+id).dataset.actid = actId;
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
     * @param {integer} id du slide (start to 1)
     */
    nextSlide:function(id){
        if(MM.onlineState === "yes"){ // save answer
            //MM.userAnswers[MM.steps[id].step]=document.getElementById("userAnswer"+(MM.steps[id].step)).value;
            MM.userAnswers[MM.steps[id].step] = MM.mf["ansInput"+id+"-"+(MM.steps[id].step)].value;
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
                MM.mf["ansInput"+id+"-"+step].setOptions({virtualKeyboardMode:'onfocus'});
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
                let score = 0;
                let div = document.createElement("div");
                let ol = document.createElement("ol");
                ol.innerHTML = "<b>Tes réponses</b>";
                let ia = 0;
                // correction
                // TODO : modifier pour les cas où il y aura plusieurs champs réponse
                // attention, les questions ont pu être mélangées, on va donc devoir associer correctement les réponses/questions
                // les réponses sont données dans l'ordre, mais pas les questions.
                // on peut avoir plusieurs utilisateurs... pour les duels
                // 1 utilisateur = un actArray
                for(let slider=0,len=MM.carts[0].actsArrays.length;slider<len;slider++){
                    // pour un target, on a l'ordre des activités et des réponses.
                    for(let slide=0,len2=MM.carts[0].actsArrays[slider].length;slide<len2;slide++){
                        let refs = MM.carts[0].actsArrays[slider][slide];
                        let li = document.createElement("li");
                        let span = document.createElement("span");
                        let userAnswer = MM.userAnswers[ia].replace(",",".").trim();// on remplace la virgule française par un point, au cas où
                        if(userAnswer.indexOf("\\text")===0){
                            userAnswer = userAnswer.substring(6,userAnswer.length-1);
                        }
                        // remplacer un espace par un espace
                        userAnswer = userAnswer.replace("\\text{ }"," ");
                        const expectedAnswer = MM.carts[0].activities[refs[0]].values[refs[1]];
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
                        // on teste si la réponse est un nombre ou si elle contient des caractères echapé auquel cas on considère que c'est du latex
                        if(!/[^-\d]/.test(userAnswer) || /\\/.test(userAnswer)){
                            span.className ="math";
                            userAnswer = "\\displaystyle "+userAnswer;
                        }
                        span.textContent = userAnswer;
                        ia++;
                        li.appendChild(span);
                        ol.appendChild(li);
                    }
                }
                /*for(let indexA=0,lenA=MM.carts[0].activities.length;indexA<lenA;indexA++){
                    for(let indexQ=0,lenQ=MM.carts[0].activities[indexA].questions.length;indexQ<lenQ;indexQ++){
                        let li = document.createElement("li");
                        let span = document.createElement("span");
                        let userAnswer = MM.userAnswers[ia].replace(",",".").trim();// on remplace la virgule française par un point, au cas où
                        if(userAnswer.indexOf("\\text")===0){
                            userAnswer = userAnswer.substring(6,userAnswer.length-1);
                        }
                        const expectedAnswer = MM.carts[0].activities[indexA].values[indexQ];
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
                        // on teste si la réponse est un nombre ou si elle contient des caractères echapé auquel cas on considère que c'est du latex
                        if(!/[^-\d]/.test(userAnswer) || /\\/.test(userAnswer)){
                            span.className ="math";
                            userAnswer = "\\displaystyle "+userAnswer;
                        }
                        span.textContent = userAnswer;
                        ia++;
                        li.appendChild(span);
                        ol.appendChild(li);
                    }
                }*/
                div.appendChild(ol);
                let section = document.createElement("section");
                section.innerHTML = "<b>Score :</b> "+score+"/"+ia;
                div.appendChild(section);
                document.getElementById("corrige-content").appendChild(div);
                // Mise en forme Maths
                utils.mathRender();
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
        for(let i=0,l=MM.timers.length; i<l;i++){
            MM.timers[i].pause();
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
            document.getElementById("onlinechoice").className = "";
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
            document.querySelector("input[name='online'][value='no']").checked = true;
            document.getElementById("onlinechoice").className = "hidden";
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
            document.querySelector("input[name='online'][value='no']").checked = true;
            document.getElementById("onlinechoice").className = "hidden";
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
            document.getElementById("onlinechoice").className = "hidden";
            document.querySelector("input[name='online'][value='no']").checked = true;
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
        } else {
            MM.slidersOrientation = "v";
            document.getElementById("screen-division").className = "vertical";
            document.querySelector("input[name='direction'][value='v']").checked = true;
        }
    }
}

// lecture de la bibliotheque
var library = {
    ordre:{"grille-ecole":["11","10","9","8","7"],"grille-college":["6","5","4","3"],"grille-lycee":["2","G","T"]},
    open:function(json){
        let obj = new activity(json);
        MM.editedActivity = obj;
        // show tab-content
        var tab = document.querySelector("a[numero$='parameters'].tabs-menu-link");
        utils.resetAllTabs();
        utils.addClass(tab, "is-active");
        document.getElementById("tab-parameters").style.display = "";
        document.getElementById("addToCart").className = "";
        document.getElementById("removeFromCart").className = "hidden";
        obj.display();
    },
    // open file from library
    load:function(url){
        let reader = new XMLHttpRequest();
        reader.onload = ()=>{
            let json = JSON.parse(reader.responseText);
            let regexp = /\/(.*)\./;
            url = regexp.exec(url)[1];
            utils.setHistory("Exercice","u="+url);
            this.open(json);
        }
        reader.open("get", "library/"+url+"?v"+MM.version);
        reader.send();
    },
    // import activity data from file
    import:function(url){
        return new Promise((resolve,reject)=>{
        let reader = new XMLHttpRequest();
        reader.onload = function(){
            resolve(JSON.parse(reader.responseText));
        }
        reader.onerror = err=>{reject(err)};
        reader.open("get", "library/"+url+"?v"+MM.version);
        reader.send();
        })
    },
    // load data from content file = list of all activities
    openContents:function(){
        let reader = new XMLHttpRequest();
        reader.onload = function(){
            MM.content = JSON.parse(reader.responseText);
            // remplissage de la grille d'accueil
            utils.createTuiles();
            // création des tuiles des niveaux
            utils.createSearchCheckboxes();
            // check if parameters from URL
            utils.checkURL();
        }
        reader.open("get", "library/content.json?v"+MM.version, true);
        reader.send();
    },
    displayContent:function(level,base=false){
        if(MM.content === undefined) {console.log("Pas de bibliothèque"); return false;}
        let niveau={nom:"Recherche",themes:{}};
        // Cas d'un code correspondant à MMv1
        if(_.isObject(level)){
            niveau.nom = "Cette activité a été répartie en plusieurs";
            // on cherche les titres
                for(let exo in level){
                let found = false; // le titre n'est pas encore trouvé
                for(let niv in MM.content){
                    if(found) break;
                    if(_.isObject(MM.content[niv])){
                        for(let theme in MM.content[niv].themes){
                            if(found) break;
                            for(let chap in MM.content[niv].themes[theme].chapitres){
                                if(found) break;
                                if(MM.content[niv].themes[theme].chapitres[chap].e.length>0){
                                    if(found) break;
                                    for(let i=0;i<MM.content[niv].themes[theme].chapitres[chap].e.length;i++){
                                        if(MM.content[niv].themes[theme].chapitres[chap].e[i].u === level[exo].u){
                                            level[exo].t = MM.content[niv].themes[theme].chapitres[chap].e[i].t;
                                            found = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            niveau.themes[0] = {
                "nom":"Cliquer pour ouvrir une activité",
                "chapitres":{"MM1":{"n":"Cliquer sur Rechercher pour revenir ici","e":level}}
            }
            // cas d'une recherche textuelle
        } else if(!base){
            // recherche d'un terme
            if(level.length<3)return false; // on ne prend pas les mots de moins de 3 lettres
            // niveaux sélectionnés
            const levels = document.querySelectorAll("#searchLevels input[name='searchlevel']:checked");
            const selectedLevels = [];
            levels.forEach((elt)=>{selectedLevels.push(elt.value)});
            // construction du niveau par extraction des données.
            for(let niv in MM.content){
                // on ne cherche que dans les niveaux sélectionnés. Si pas de niveau sélectionné, on prend tout.
                if(selectedLevels.length > 0 && selectedLevels.indexOf(niv)<0) continue;
                if(_.isObject(MM.content[niv])){ // le niveau contient de chapitres
                    for(let theme in MM.content[niv].themes){
                        for(let chap in MM.content[niv].themes[theme].chapitres){
                            let chapExo=[];
                            for(let exo=0,lene=MM.content[niv].themes[theme].chapitres[chap].e.length;exo<lene;exo++){
                                if(MM.content[niv].themes[theme].chapitres[chap].e[exo].t.toLowerCase().indexOf(level.toLowerCase())>-1){
                                    // we find a candidate !!!
                                    let reg = new RegExp(level.toLowerCase(),"gi");
                                    chapExo.push({"u":MM.content[niv].themes[theme].chapitres[chap].e[exo].u,
                                    "t":MM.content[niv].themes[theme].chapitres[chap].e[exo].t.replace(reg,function(x){return "<mark>"+x+"</mark>"})})
                                }
                            }
                            // si chapExo! == [], alors on créée l'arbo
                            if(chapExo.length>0){
                                if(!niveau.themes[theme]){
                                    niveau.themes[theme]={
                                        nom:MM.content[niv].nom+"/"+MM.content[niv].themes[theme].nom,
                                        chapitres:{}
                                    };
                                }
                                niveau.themes[theme].chapitres[chap] = {n:MM.content[niv].themes[theme].chapitres[chap].n,e:chapExo};
                            }
                        }
                    }    
                } else continue;
            }
            // cas d'un clic sur un niveau
        } else 
            niveau = MM.content[level];
        let html = "";
        if(!base && !_.isObject(level))
            html = "<h1 class='pointer moins' onclick='utils.deploy(this)'>Résultat de la recherche</h1>";
        else if(!_.isObject(level)){
            html = "<h1 class='pointer moins' onclick='utils.deploy(this)'>Niveau "+niveau["nom"]+" ("+niveau["activitiesNumber"]+" act.)</h1>";
            // on vide le champ de recherche
            document.getElementById("searchinput").value = "";
        }else 
            html = "<h2>Cette activité MathsMentales v1 a été répartie en plusieurs activités</h2>";
        if(base && !_.isObject(level)) // on change l'url level est un niveau de la bibliothèque
            utils.setHistory(niveau["nom"],"n="+level);
        // Affichage et mise en forme des données.
        let itemsNumber = 0;
        for(let i in niveau["themes"]){
            //let first = true;
            let theme = false;
            let htmlt = "";//(first)?"<span>":"";
            htmlt += "<h2 class='pointer moins' onclick='utils.deploy(this)'>"+niveau.themes[i].nom+"</h2>";
            for(let j in niveau["themes"][i]["chapitres"]){
                let chapitre = false;
                let htmlc="";//(first)?"":"<span>";
                htmlc += "<h3 onclick='utils.deploy(this)' class='pointer moins'>"+niveau["themes"][i]["chapitres"][j]["n"]+"</h3>";
                htmlc += "<ul>";
                let nbexos = niveau["themes"][i]["chapitres"][j]["e"].length;
                if(nbexos){
                    itemsNumber += nbexos;
                    theme=true;chapitre=true;
                    for(let k=0,len=nbexos;k<len;k++){
                        htmlc += "<li onclick=\"library.load('"+niveau["themes"][i]["chapitres"][j]["e"][k]["u"]+"')\">"+niveau["themes"][i]["chapitres"][j]["e"][k]["t"]+"</li>";
                    }
                } else {
                    htmlc += "<li>Pas encore d'exercice</li>";
                }
                htmlc += "</ul>";
                if(chapitre){
                    htmlt+=htmlc;//+((first)?"":"</span>");
                    /*if(first === true){
                        htmlt += "</span>";
                        first = false;
                    }*/
                }
            }
            if(theme)html+=htmlt;
        }
        document.getElementById("resultat-chercher").innerHTML = html;
        let target = document.getElementById("tab-chercher");
        target.className = "tabs-content-item";
        // Nombre de colonnes en fonction du contenu
        if(itemsNumber > 40 && utils.pageWidth()>1000) utils.addClass(target,"cols3");
        else if(itemsNumber > 20 && utils.pageWidth()>840) utils.addClass(target, "cols2");
        document.querySelector("#header-menu a[numero='#tab-chercher']").click();
    }
}
// lecture des fichiers exercice
/**
* Structure d'un fichier exercice
* {
    'title':'short description',
    'ID':'generatedId',
    'description':'long description',
    'figure': used if graphics
    'options':[{}, {}, ...}], // ojects {"name":"NameOfOption", 'vars':{}, 'question':'pattern'||['pattern0','pattern1',...], answers:'pattern'||[], value:'valuepattern'||[]}
        if one of vars, question, answer or value not defined take it from defaults values on bottom
    'vars':{'a':'pattern', 'b':'pattern', ...}, // pattern can be a list ['value0', 'value1'], or a range "value0_value1", or a list of ranges, Integers, Decimals, letters
    to avoid certains numbers in range, add _^a,b => -5_15_^0,1,-1 will choose integers between -5 and 15 but not 0, 1 or -1
    vars can refer to a previous defined var. You have do prefixed with : like 'b' : ':a+:a' b is the sum of a and a
    'question':'pattern with :a & :b' || [pattern0, pattern1,...] || [[pattern0,pattern1,...], [pattern0,pattern1,...],...]
    'answer':'pattern' || [pattern0, pattern1,...], if question and answer are arrays with same, they are associated 1-1
    'value':'value' or [value0, value1, ...] // accepted values for online answers
}
*/
class activity {
    constructor(obj){
        if(_.isObject(obj)){
            this.setParams(obj);
        } else if(_.isString(obj)){
            this.id = obj;
        }
    }
    setParams(obj){
        this.id = obj.id||obj.ID;
        this.type = obj.type; // undefined => latex , "text" can include math, with $$ around
        this.figure = obj.figure; // for graphics description
        this.title = obj.title;  // title of de activity
        this.description = obj.description; // long description
        this.vars = obj.vars;
        this.consts = obj.consts;
        this.canrepeat = obj.repeat||false; // question & answers peuvent être répétées ou pas
        this.options = utils.clone(obj.options)||undefined;
        this.questionPatterns = utils.clone(obj.questionPatterns)||obj.question;
        this.shortQuestionPatterns = utils.clone(obj.shortQuestionPatterns)||obj.shortq||false;
        this.answerPatterns = utils.clone(obj.answerPatterns) || obj.answer;
        this.valuePatterns = utils.clone(obj.valuePatterns) || obj.value;
        this.questions = utils.clone(obj.questions)||[];
        this.shortQuestions = utils.clone(obj.shortQuestions)||[];
        this.answers = utils.clone(obj.answers)||[];
        this.samples = utils.clone(obj.samples)||[];// samples of answers, for online answer
        this.values = utils.clone(obj.values)||[];
        this.figures = utils.clone(obj.figures)||[]; // generetad figures paramaters
        this.examplesFigs = {}; // genrated graphics from Class Figure
        this.chosenOptions = utils.clone(obj.chosenOptions)||[]; // options choisies (catégories)
        this.chosenQuestions = utils.clone(obj.chosenQuestions)||{}; // questions parmi les options (sous catégories)
        this.chosenQuestionTypes = utils.clone(obj.chosenQuestionTypes)||[]; // pattern parmi les questions
        this.tempo = utils.clone(obj.tempo) || Number(document.getElementById("tempo-slider").value);
        this.nbq = utils.clone(obj.nbq) || Number(document.getElementById("nbq-slider").value);
    }
    initialize(){
        this.questions = [];
        this.shortQuestions = [];
        this.answers = [];
        this.values = [];
        this.figures = [];
        this.examplesFigs = {};
    }
    setTempo(value){
        this.tempo = Number(value);
    }
    setNbq(value){
        this.nbq = Number(value);
    }
    /**
     * export data to reproduce the choices another time
     */
    export(){
        /*return {
            i:this.id,
            o:this.chosenOptions,
            q:this.chosenQuestions,
            p:this.chosenQuestionTypes,
            t:this.tempo,
            n:this.nbq
        };*/
        return "i="+this.id+
        "~o="+utils.tableToText(this.chosenOptions)+
        "~q="+utils.objToText(this.chosenQuestions)+
        "~p="+this.chosenQuestionTypes+
        "~t="+this.tempo+
        "~n="+this.nbq;
    }
    /**
     * import datas et crée l'objet activité à partir d'un json
     * appelé par l'import de l'activité (utilise Promises)
     * 
     * @param (JSON) obj
     * @param (String) id : id de destination de l'activité
     */
    static import(obj,id){
        /* load */
        let regexp = /(^[\d*TG])/;// le fichier commence par un nombre ou un T pour la terminale
        let level = regexp.exec(obj.i)[0];
        let url = "N"+level+"/"+obj.i+".json";
        return library.import(url).then((json)=>{
            let act = new this(json);
            act.chosenOptions = obj.o;
            act.chosenQuestionTypes = obj.p;
            act.chosenQuestions = obj.q;
            act.tempo = obj.t;
            act.nbq = obj.n;
            return [id,act];
        },err=>{debug(err)});
    }
    /**
     * getOption
     * 
     * return uniqueId (Integer)
     */
    getOption(){
        if(this.chosenOptions.length === 0 && this.options){
            return math.aleaInt(0, this.options.length-1);
        } else if(this.chosenOptions.length > 0){
            return this.chosenOptions[math.aleaInt(0,this.chosenOptions.length-1)];
        } else return false;
    }
    setMath(content){
        if(this.type === undefined || this.type === "latex"){
            return '<span class="math">'+content+"</span>";
        } else return content;
    }
    /**
     * Display the activity editor
     */
    display(cle="sample"){
        this.initialize();
        document.getElementById("param-title-act").innerHTML = this.id;
        // affichages
        document.getElementById('activityTitle').innerHTML = this.title;
        if(this.description)
            document.getElementById('activityDescription').innerHTML = this.description;
        else
        document.getElementById('activityDescription').innerHTML = "";
        // affichage d'exemple(s)
        var examples = document.getElementById('activityOptions');
        examples.innerHTML = "";
        utils.setSeed(cle);
        if(this.options !== undefined && this.options.length > 0){
            let colors = ['',' red',' orange',' blue', ' green', ' grey',];
            // Ajout de la possibilité de tout cocher ou pas
            let p = utils.create("span",{className:"bold"});
            let hr = utils.create("hr");
            let input = utils.create("input",{type:"checkbox",id:"checkalloptions",className:"checkbox blue"})
            input.setAttribute("onclick","MM.editedActivity.setOption('all',this.checked)");
            p.appendChild(input);
            p.appendChild(document.createTextNode(" Tout (dé)sélectionner"));
            examples.appendChild(p);
            examples.appendChild(hr);
            let optionsLen = 0;
            // affichage des options
            for(let i=0;i<this.options.length;i++){
                this.generate(1,i,false);// génère un cas par option (si plusieurs)
                let p = utils.create("span");
                let input = utils.create("input",{id:"o"+i,type:"checkbox",value:i,defaultChecked:(this.chosenOptions.indexOf(i)>-1)?true:false,className:"checkbox"+colors[i%colors.length]});
                input.setAttribute("onclick", 'MM.editedActivity.setOption(this.value, this.checked);');
                p.appendChild(input);
                p.innerHTML += " "+this.options[i]["name"] + " :";
                let ul = document.createElement("ul");
                if(Array.isArray(this.questions[0])){
                    for(let jj=0; jj<this.questions[0].length;jj++){
                        optionsLen++;
                        let li = utils.create("li",{className:"tooltip"});
                        let checked = "";
                        if(this.chosenQuestions[i]){
                            if(this.chosenQuestions[i].indexOf(jj)>-1)
                                checked = "checked";
                        }
                        li.innerHTML = "<input class='checkbox"+colors[i%colors.length]+"' type='checkbox' id='o"+i+"-"+jj+"' value='"+i+"-"+jj+"' onclick='MM.editedActivity.setOption(this.value, this.checked);'"+checked+"> "+this.setMath(this.questions[0][jj]);
                        // answer
                        let span = utils.create("span",{className:"tooltiptext"});
                        if(Array.isArray(this.answers[0]))
                            span.innerHTML = this.setMath(String(this.answers[0][jj]).replace(this.questions[0],this.questions[0][jj]));
                        else {
                            span.innerHTML = this.setMath(String(this.answers[0]).replace(this.questions[0],this.questions[0][jj]));
                        }
                        li.appendChild(span);
                        ul.appendChild(li);
                    }
                } else {
                    optionsLen++;
                    let li = utils.create("li",{className:"tooltip",innerHTML:this.setMath(this.questions[0])});
                    if(this.figures[0]){
                        this.examplesFigs[i] = new Figure(utils.clone(this.figures[0]), "fig-ex"+i, li);
                    }
                    let span = utils.create("span",{className:"tooltiptext",innerHTML:this.setMath(this.answers[0])});
                    li.appendChild(span);
                    ul.appendChild(li);
                }
                p.appendChild(ul);
                examples.appendChild(p);
            }
            // si plus de 3 options/sous-options, 2 colonnes seulement si panier non affiché.
            if(optionsLen>3 && document.getElementById("phantom").className===""){
                utils.addClass(document.getElementById("divparams"),"colsx2");
            }
        } else {
            // no option
            this.generate(1);
            let p = document.createElement("span");
            let ul = document.createElement("ul");
            if(Array.isArray(this.questions[0])){
                for(let jj=0; jj<this.questions[0].length;jj++){
                    let li = document.createElement("li");
                    li.className = "tooltip";
                    li.innerHTML = "<input type='checkbox' class='checkbox' value='"+jj+"' onclick='MM.editedActivity.setQuestionType(this.value, this.checked);' ><span class='math'>"+this.questions[0][jj]+"</span>";
                    let span = document.createElement("span");
                    span.className = "tooltiptext";
                    if(Array.isArray(this.answers[0]))
                        span.innerHTML = this.setMath(this.answers[0][jj].replace(this.questions[0],this.questions[0][jj]));
                    else {
                        span.innerHTML = this.setMath(this.answers[0].replace(this.questions[0],this.questions[0][jj]));
                    }
                    li.appendChild(span);
                    ul.appendChild(li);
                }
            } else {
                let li = document.createElement("li");
                li.className = "tooltip";
                li.innerHTML = this.setMath(this.questions[0]);
                if(this.figures[0]){
                    this.examplesFigs[0] = new Figure(utils.clone(this.figures[0]), "fig-ex"+0, li);
                }
                let span = document.createElement("span");
                span.className = "tooltiptext";
                span.innerHTML = this.setMath(this.answers[0]);
                li.appendChild(span);
                ul.appendChild(li);
            }
            p.appendChild(ul);
            /*let p1 = document.createElement("p"); // affiche la réponse
            p1.innerHTML = this.setMath(this.answers[0]);
            p.appendChild(p1);*/
            // display answer
            examples.appendChild(p);
        }
        if(!utils.isEmpty(this.examplesFigs)){
            // it has to take his time... 
            setTimeout(()=>{
                for(let i in this.examplesFigs){
                    this.examplesFigs[i].display();
                }
            }, 300);
        }
        utils.mathRender();
    }
    /**
     * getPattern
     * récupère 1 pattern unique
     * @param {integer} option id de l'option dont dépend le pattern
     * 
     * return uniqueId (Integer)
     */
    getPattern(option){
        // l'utilisateur a choisi plusieurs types de questions, on prend l'une des valeurs
        if(this.chosenQuestionTypes.length > 0){
            return this.chosenQuestionTypes[math.aleaInt(0, this.chosenQuestionTypes.length-1)];
        }
        // no option mais plusieurs pattern possibles
        if(option === false && Array.isArray(this.questionPatterns)){
            return math.aleaInt(0,this.questionPatterns.length-1);
        }
        if(option === false)return false;
        // if option, patterns ?
        if(!Array.isArray(this.chosenQuestions[option])){
            this.chosenQuestions[option] = [];
        }
        // no pattern chosen : we choose one
        if(this.chosenQuestions[option].length === 0 && Array.isArray(this.options[option].question)){
            return math.aleaInt(0, this.options[option].question.length-1);
        } else if(this.chosenQuestions[option].length === 0 && !this.options[option].question && Array.isArray(this.questionPatterns)){
            // no question in option, but global question is an array
            return math.aleaInt(0, this.questionPatterns.length-1);
        } else if(this.chosenQuestions[option].length > 0){
            // list of patterns chosen, we pick one
            return this.chosenQuestions[option][math.aleaInt(0,this.chosenQuestions[option].length-1)];
        } else return false;
    }
    /**
     * setOption
     * 
     * @param {string} value optionId || optionID-renderID
     * @param {boolean} check check state
     * 
     */
    setOption(value, check){
        var optionId, renderId;
        if(value === "all"){
            this.chosenOptions = [];
            for(let i=0,len=this.options.length;i<len;i++){
                this.chosenQuestions[i] = [];
                let lenq = 0;
                if(typeof this.options[i].question === "object") lenq = this.options[i].question.length
                else if( typeof this.questionPatterns === "object")lenq = this.questionPatterns.length;
            if(check){
                    this.chosenOptions.push(i);
                    for (let j=0; j<lenq; j++){
                        this.chosenQuestions[i].push(j);
                        document.getElementById("o"+i+"-"+j).checked = true;
                    }
                    document.getElementById("o"+i).checked = true;
                } else {
                    for (let j=0; j<lenq; j++){
                        document.getElementById("o"+i+"-"+j).checked = false;
                    }
                    document.getElementById("o"+i).checked = false;
                }
            }
        } else if(value.indexOf("-")>-1){
            let Ids = value.split("-");
            optionId = Number(Ids[0]); renderId = Number(Ids[1]);
            if(check){ // checkbox checked
                document.getElementById("o"+optionId).checked = true;
                if(this.chosenOptions.indexOf(optionId)<0){
                    this.chosenOptions.push(optionId);
                }
                if(!Array.isArray(this.chosenQuestions[optionId])){
                    this.chosenQuestions[optionId] = [renderId];
                } else if(this.chosenQuestions[optionId].indexOf(renderId)<0){
                    this.chosenQuestions[optionId].push(renderId);
                }
            } else { // checkbox unchecked
                if(this.chosenQuestions[optionId].removeValue(renderId)){
                    if(this.chosenQuestions[optionId].length === 0){
                        this.chosenOptions.removeValue(optionId);
                        document.getElementById("o"+optionId).checked = false;
                    }
                }
            }
        } else {
            optionId = Number(value);
            if(check){ // check all values
                // not already chosen
                if(this.chosenOptions.indexOf(optionId)<0){
                    this.chosenOptions.push(optionId);
                }
                this.chosenQuestions[optionId] = [];
                if(typeof this.options[optionId].question === "object"){
                    for (let i=0; i<this.options[optionId].question.length; i++){
                        this.chosenQuestions[optionId].push(i);
                        document.getElementById("o"+optionId+"-"+i).checked = true;
                    }
                } else if(Array.isArray(this.questionPatterns)){
                    for (let i=0; i<this.questionPatterns.length; i++){
                        this.chosenQuestions[optionId].push(i);
                        document.getElementById("o"+optionId+"-"+i).checked = true;
                    }
                }
        } else { // uncheck all values
                if(this.chosenOptions.removeValue(optionId)){
                    if(typeof this.options[optionId].question === "object"){
                        for(let i=0; i<this.options[optionId].question.length; i++){
                            document.getElementById("o"+optionId+"-"+i).checked = false;
                        }
                        delete this.chosenQuestions[optionId];
                    } else if(Array.isArray(this.questionPatterns)){
                        for(let i=0; i<this.questionPatterns.length; i++){
                            document.getElementById("o"+optionId+"-"+i).checked = false;
                        }
                        delete this.chosenQuestions[optionId];
                    }
                }
            }
        }
    }
    /**
     * 
     * @param {integer} value index of the choosen question type
     * @param {boolean} check true if check, false if not
     */
    setQuestionType(value,check){
        let questionId = Number(value);
        if(check){
            // not already chosen
            if(this.chosenQuestionTypes.indexOf(questionId)<0){
                this.chosenQuestionTypes.push(questionId);
            }
        } else {
            this.chosenQuestionTypes.removeValue(questionId);
        }
    }
    /**
     * 
     * @param {string} chaine : chaine où se trouve la variable 
     * @param {integer} index : 
     */
    replaceVars(chaine, questiontext){
        function onlyVarw(all,p1,p2,decal,chaine){
            return "this.wVars['"+p1+"']"+p2;
        }
        function onlyVarc(all,p1,p2,decal,chaine){
            return "this.cConsts['"+p1+"']"+p2;
        }
        if(typeof chaine === "string"){
            for(const c in this.wVars){
                let regex = new RegExp(":("+c+")([^\\w\\d])", 'g');
                chaine = chaine.replace(regex, onlyVarw);
            }
            for(const c in this.cConsts){
                let regex = new RegExp(":("+c+")([^\\w\\d])", 'g');
                chaine = chaine.replace(regex, onlyVarc);
            }
            // check if question as to be written in answer
            // index needed to find the question
            if(questiontext !== undefined){
                let regex = /:question/g;
                chaine = chaine.replace(regex, questiontext);
            }
        //debug("Chaine à parser", chaine);
        let result = "";
        // doublage des \ caractères d'échapement.
        try { result = eval("`"+chaine.replace(/\\/g,"\\\\")+"`");}
        catch(error){
            debug(error, "Erreur avec "+chaine);
        }
        // return number if this is one
        if(!isNaN(result)){
            return parseFloat(result);
        } else return result;
        } else if(typeof chaine === "object"){
            if(_.isArray(chaine)){
                for(let i=0;i<chaine.length;++i){
                    chaine[i] = this.replaceVars(chaine[i],questiontext);
                }
            } else for(const i in chaine){
                chaine[i] = this.replaceVars(chaine[i],questiontext);
            }
            return chaine;
        } else return chaine;
    }
    /**
    * 
    * générateur de questions et réponses
    * 
    * generate this.questions, this.answers and this.values
    * @param {integer} n number of questions to create
    * @param {integer} option id of an option (optional)
    * @param {integer} patt id of question pattern (otional)
    * @param {boolean} sample if true generate a sample question to show before starting slideshow
    * return nothing
    * utilise des variables de travail this.cVars, this.cConsts, this.cFigure, this.cQuestion, this.cShortQ, this.cAnswer, this.cValue qui vont contenir les différentes définitions, this.wVars contient les variables où les variables vont être remplacées par les valeurs générées
    * 
    */
    generate(n=this.nbq, opt, patt, sample){
        // optionNumber is the number of the choosen option
        // patternNumber is the number of the choosen sub option
        let optionNumber, patternNumber, lenQ=false;
        this.wVars={};
        this.cFigure = undefined;
        let loopProtect = 0, maxLoop = 100;
        for(let i=0;i<n;i++){
            optionNumber = opt!==undefined?opt:this.getOption();
            patternNumber = patt!==undefined?patt:this.getPattern(optionNumber);
            // cas d'une option qui a été choisie
            if(optionNumber !== false){
                // set chosen vars
                if(this.options[optionNumber].vars === undefined){
                    // pas de variable définie dans l'option, on prend les variables globales
                    this.cVars = this.vars;
                } else this.cVars = this.options[optionNumber].vars;
                if(this.options[optionNumber].consts === undefined){
                    this.cConsts = utils.clone(this.consts);
                } else this.cConsts = utils.clone(this.options[optionNumber].consts);
                if(patternNumber !== false){
                    // la question est définie dans l'option, avec un pattern défini
                    if(this.options[optionNumber].question !== undefined){
                        this.cQuestion = this.options[optionNumber].question[patternNumber];
                        lenQ = this.options[optionNumber].question.length;
                        if(this.options[optionNumber].shortq !== undefined)
                            this.cShortQ = this.options[optionNumber].shortq[patternNumber]||false;
                    } else { // elle est définie globalement
                        this.cQuestion = this.questionPatterns[patternNumber];
                        this.cShortQ = this.shortQuestionPatterns[patternNumber]||false;
                        lenQ = this.questionPatterns.length;
                    }
                } else if(this.options[optionNumber].question === undefined){ // question définie dans l'option
                    this.cQuestion = this.questionPatterns;
                    this.cShortQ = this.shortQuestionPatterns||false;
                } else {
                    this.cQuestion = this.options[optionNumber].question; // question définie globalement
                    this.cShortQ = this.options[optionNumber].shortq||false;
                }
                // traitement des réponses
                if(this.options[optionNumber].answer === undefined){ //des réponses sont définies pour l'option
                    this.cAnswer = this.answerPatterns;
                } else this.cAnswer = this.options[optionNumber].answer; // on prend la réponse définie globalement
                // traitement des valeurs attendues de réponse en ligne
                if(this.options[optionNumber].value === undefined){
                    this.cValue = this.valuePatterns;
                } else this.cValue = this.options[optionNumber].value;
                if(Array.isArray(this.cAnswer) && lenQ){ // on a un tableau de réponses différentes
                    // si autant de types de réponses que de types de questions, raccord 1<->
                    if(this.cAnswer.length === lenQ){
                        this.cAnswer = this.cAnswer[patternNumber]; // same answer index as question index
                    } else { // alea answer
                        this.cAnswer = this.cAnswer[math.aleaInt(0,this.cAnswer.length-1)];
                    }
                    if(this.cValue.length === lenQ){ // same values index as question index
                        this.cValue = this.cValue[patternNumber];
                    }
                }
                // traitement des figures (optionnel)
                if(this.options[optionNumber].figure !== undefined){
                    this.cFigure = utils.clone(this.options[optionNumber].figure);
                } else if(this.figure !== undefined){
                    this.cFigure = utils.clone(this.figure);
                }
            } else {
                this.cVars = this.vars;
                this.cConsts = utils.clone(this.consts);
                if(patternNumber!==false){
                    this.cQuestion = this.questionPatterns[patternNumber];
                    this.cShortQ = this.shortQuestionPatterns[patternNumber]||false;
                } else {
                    this.cQuestion = this.questionPatterns;
                    this.cShortQ = this.shortQuestionPatterns||false;
                }
                if(Array.isArray(this.answerPatterns) && this.answerPatterns.length===this.questionPatterns.length){
                    this.cAnswer = this.answerPatterns[patternNumber];
                } else{
                    this.cAnswer = this.answerPatterns;
                }
                this.cValue = this.valuePatterns;
                if(this.figure !== undefined){
                    this.cFigure = utils.clone(this.figure);
                }
            }
            // values generation
            for(const name in this.cVars) {
                this.wVars[name]=this.cVars[name];
                if(typeof this.wVars[name] === "string" && this.wVars[name].indexOf("\$\{")>-1){
                    // var is defined with other variable, we replace the variable with her value
                    this.wVars[name] = this.replaceVars(this.wVars[name]);
                }
                if(typeof this.wVars[name] === "object"){
                    // var is defined with an array of values
                    // we sort one of them
                    // but it can content some vars value
                    this.wVars[name] = this.replaceVars(this.wVars[name][math.aleaInt(0,this.wVars[name].length-1)]);
                } else if(typeof this.wVars[name] === "string" && this.wVars[name].indexOf("_")>-1){
                    // var is defined with a min-max interval within a string
                    var bornes = this.wVars[name].split("_");
                    if(bornes[0].indexOf("d")>-1) {// float case
                        this.wVars[name] = math.aleaFloat(Number(bornes[0].substring(1)), Number(bornes[1]), Number(bornes[2]), bornes[3], bornes[4]);
                    } else { // integer case
                        this.wVars[name] = math.aleaInt(Number(bornes[0]), Number(bornes[1]), bornes[2], bornes[3]);                        
                    }
                }
            }
            // généralement pas utilisé, mais cela arrive.
            if(this.cConsts !== undefined){
                this.cConsts = this.replaceVars(this.cConsts);
            }
            if(!sample){
            // question text generation
            let thequestion = this.replaceVars(utils.clone(this.cQuestion));
            let thevalue = this.replaceVars(utils.clone(this.cValue));
            let theshort = false;
            if(this.cShortQ){
                theshort = this.replaceVars(utils.clone(this.cShortQ));
            }
            loopProtect++;
            // on évite les répétitions
            if(this.questions.indexOf(thequestion)<0 || this.values.indexOf(thevalue)<0 || this.canrepeat){
                // cas d'une répétition autorisée, on va éviter que cela arrive quand même dans les 5 précédents.
                if(this.canrepeat){
                    // on extrait les 5 dernières questions et réponses (il y a des activités avec des questions identiques mais pas les mêmes réponses)
                    let last5Questions = this.questions.slice(-5); // ça marche, même si le tableau a moins de 5 éléménts
                    let last5values = this.values.slice(-5);
                    // on teste la présence de la question dans l'extrait
                    if(last5Questions.indexOf(thequestion)>-1 && last5values.indexOf(thevalue)>-1){
                        // on a trouvé la question dans la série, on ne prend pas et on passe à la génération suivante
                        i--;
                        if(loopProtect<maxLoop) // attention à pas tourner en rond
                            continue;
                        else { // on tourne en rond, donc on arrête le script
                            debug("Pas assez de données pour éviter les répétitions")
                            break;
                        }
                    }
                }
                this.questions[i] = thequestion;
                this.shortQuestions[i] = theshort;
                this.answers[i] = this.replaceVars(utils.clone(this.cAnswer), thequestion);
                this.values[i] = thevalue;
                if(this.cFigure!== undefined){
                    this.figures[i] = {
                        "type":this.cFigure.type,
                        "content":this.replaceVars(utils.clone(this.cFigure.content)),
                        "boundingbox":this.cFigure.boundingbox,
                        "axis":this.cFigure.axis,
                        "grid":this.cFigure.grid?true:false
                    };
                }
            } else {
                i--;
                if(loopProtect<maxLoop) // avoid too many attempts 
                    continue;
                else {
                    debug("Pas assez de données pour éviter les répétitions")
                    break;
                }
            }
        } else {
                this.sample = {
                    question:this.replaceVars(this.cQuestion)
                };
                if(this.cShortQ)this.sample.shortQuestion = this.replaceVars(this.cShortQ);
                this.sample.answer=this.replaceVars(this.cAnswer, this.sample.question);
                
                if(this.cFigure !== undefined){
                    this.sample.figure = {
                        "type":this.cFigure.type,
                        "content":this.replaceVars(this.cFigure.content),
                        "boundingbox":this.cFigure.boundingbox,
                        "axis":this.cFigure.axis,
                        "grid":this.cFigure.grid?true:false
                    };
                }
            }
        }
    }
    generateSample(){
        let option = this.getOption();
        this.generate(1,option,this.getPattern(option),true);
    }
}
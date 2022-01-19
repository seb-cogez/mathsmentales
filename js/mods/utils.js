import MM from "./MM.js";
import cart from "./cart.js";
import library from "./library.js";
import draw from "./draw.js";
import sound from "./sound.js";
export {utils as default}
// Some traductions
const moisFR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const joursFR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const utils = {
    baseURL:window.location.href.split("?")[0],
    seed: "sample",
    security:300,// max number for boucles
    modeDebug : true, 
    debug : function(){
        if(utils.modeDebug)console.log(arguments);
    },
    /**
     * objet contenant des fonctions utiles à MathsMentales
     */   
    /**
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
        /*DOMel.select();
        DOMel.setSelectionRange(0,99999);
        document.execCommand("copy");*/
        let text = DOMel.value;
        navigator.clipboard.writeText(text).then(()=>{
            DOMel.className = "copied";
            setTimeout(()=>{DOMel.className="";},3000);    
        }).catch(err=>{console.log("erreur de copie dans le presse papier")});
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
     * edit est true si appelé par l'historique pour édition
     */
    checkURL(urlString=false,start=true,edit=false){
        const vars = utils.getUrlVars(urlString);
        // cas d'une prévue pour exercice.html
        if(vars.cor && vars.ex && location.href.indexOf("exercices.html")<0){
            // on redirige vers exercice.html
            let url = new URL(location.href);
            location.href= url.origin+url.pathname.replace("index.html","")+"exercices.html"+url.search;
        }
        if(vars.embed !== undefined){
            // cas d'une activité embeded, on vérifie que l'url est conforme
            let expression = 
/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
            let regex = new RegExp(expression);
            if(vars.embed.match(regex))
                MM.embededIn = vars.embed;
        }
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
                alert.innerHTML += "<br><br>";
                let button = utils.create("button",{innerHTML:"Commencer !"});
                button.onclick = ()=>{utils.closeMessage('messageinfo');MM.checkLoadedCarts(true)};
                alert.appendChild(button);
                //<button onclick="utils.closeMessage('messageinfo');MM.checkLoadedCarts(true)"> Commencer !
                //</button>`;
            } else {
                setTimeout(()=>{
                    utils.closeMessage('messageinfo');
                },3000);
            }
            // indique quoi faire avant le slide
            MM.introType = vars.i;
            // indique quoi faire après le slide
            MM.endType = vars.e;
            // couleurs des diaporamas
            if(typeof vars.colors === "string"){
                let couleurs = vars.colors.split("~");
                for(let i=0;i<couleurs.length;i++){
                    MM.colors[i]=couleurs[i].replace(/_/g,",");
                    document.getElementById("sddiv"+(i+1)).style.background = MM.colors[i];
                }
            }
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
            // son
            if(vars.snd !== undefined){
                if(vars.snd !== "null"){
                    sound.setSound(Number(vars.snd));
                }
            }
            // le seed d'aléatorisation est fourni et on n'est pas en mode online
            if((vars.a && MM.onlineState === "no") || edit){
                utils.setSeed(vars.a);
                // on check la clé de donnée incluse
                document.getElementById("aleaInURL").checked = true;
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
            // alcarts contient des promises qu'il faut charger
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
                // si panier avec plusieurs activités, on prépare l'affichage du panier
                if(MM.carts[0].activities.length>1 || MM.carts.length>1){
                    MM.showCart(1);
                    MM.editActivity(0);
                } else {
                    // sinon
                    // on affecte l'activité 0 du panier comme activité en cours d'édition.
                    MM.editedActivity = MM.carts[0].activities[0];
                    MM.editedActivity.display();
                }
            // on affiche l'interface de paramétrage si on est en mode édition
                if(edit) {
                    utils.showTab("tab-parameters");
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
        /* url?i=intro,e=end,o=online,s=nbsliders,so=orientation,f=facetotface,a=seed,colors=color0~color1~color2~color3
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
                } else if(hashes[i].indexOf("embed")===0){
                    let parts = hashes[i].split("=");
                    vars.embed = parts[1];
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
        } else if(document.getElementById("aleaInURL").checked === true){
            if(document.getElementById("aleaKey").value === ""){
                MM.seed = utils.seedGenerator();
                document.getElementById("aleaKey").value = MM.seed;
            } else {
                MM.seed = document.getElementById("aleaKey").value;
            }
         } else {
            MM.seed = utils.seedGenerator();
            document.getElementById("aleaKey").value = MM.seed;
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
    /**
     * get the DOM button originaly targeted by a click, specialy done when an image is clicked inside a button.
     * @param {evt} evt click event object
     * @returns 
     */
    getTargetWithImageInside(evt){
        let target = evt.target;
        if(evt.target.nodeName.toLowerCase()==="img"){
            target = evt.target.parentNode;
        }
        return target;
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
        let curId = arr.length;
        while(0 !== curId){
            let randId = Math.floor(utils.alea()*curId);
            curId-=1;
            let tmp = arr[curId];
            arr[curId] = arr[randId];
            arr[randId] = tmp;
        }
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
        div.parentNode.removeChild(div);
        document.body.removeEventListener("click",(evt)=>{if(evt.target.id==="btn-messagefin-close"){utils.closeMessage('messagefin');utils.showTab('tab-corrige');}});
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
        elt.classList.remove(className);
        /*if((" "+elt.className+" ").indexOf(" "+className+" ")>-1){
            var classes = elt.className.split(" "), newclasses="";
            for(let i=0;i<classes.length;i++){
                if(classes[i] !== className)newclasses+=" "+classes[i];
            }
            elt.className = newclasses.trim();
        }*/
    },
    changeTempoValue:function(value){
        document.getElementById('tempo-value').innerHTML = value+" s.";
        if(MM.editedActivity)MM.editedActivity.Tempo = value;
        if(MM.carts[MM.selectedCart].editedActivityId > -1){
            document.querySelectorAll("#cart"+(MM.selectedCart)+"-list li.active span")[0].innerHTML = value;
        }
    },
    changeNbqValue:function(value){
        document.getElementById('nbq-value').innerHTML = value;
        if(MM.editedActivity)MM.editedActivity.nombreQuestions = value;
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
        if(seed){
            if(utils.alea)delete utils.alea;
            utils.alea = new Math.seedrandom(seed);
        } else {
            if(utils.alea)delete utils.alea;
            utils.alea = new Math.seedrandom(MM.seed);
        }
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
        let contents = ["enonce-content", "corrige-content", "activityOptions", "activityDescription"];
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
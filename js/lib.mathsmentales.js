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
Array.prototype.indexOfForArrays = function(search) {
 var searchJson = JSON.stringify(search); // "[3,566,23,79]"
 var arrJson = this.map(JSON.stringify); // ["[2,6,89,45]", "[3,566,23,79]", "[434,677,9,23]"]

 return arrJson.indexOf(searchJson);
};
Array.prototype.removeValue = function(value){
    // the value must be unique
    let index = this.indexOf(value);
    if(index>-1) {
        this.splice(index,1);
        return true;
    } else return false;
};
Array.prototype.getKeys = function(){
    let table = [];
    for(let i=0,j=this.length;i<j;i++){
        table.push(i);
    }
    return table;
}
// function to shuffle a string
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

// utils
var modeDebug = true;
/**
* function addClass
* Add a class to a DOM element
* 
* @params elt (DOMelt)
* @params newClass (String) : string of coma separated classnames
*/
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
    /**
     * La transformation d'une ou d'un panier MMv1 étant assez compliquée,
     * redirection vers le dosser comportant l'ancienne version : /old
     */
    goToOldVersion(){
        window.location.href = utils.baseURL + 'old/'+(/(^.*\/)(.*)/.exec(window.location.href)[2]);
        //debug(utils.baseURL + 'old/'+(/(^.*\/)(.*)/.exec(window.location.href)[2]))
    },
    setHistory(pageName,params){
        let chaine = "";
        let first = true;
        if(params.u!==undefined){
            let regexp = /\/(.*)\./;
            params.u = regexp.exec(params.u)[1];
        }
        for(const i in params){
            if(first){
                first = false;
                chaine += i+"="+params[i];
            } else {
                chaine += "&"+i+"="+params[i];
            }
        }
        history.pushState({'id':'Homepage'},pageName,utils.baseURL+'index.html?'+chaine);
    },
    /**
     * 
     */
    checkURL:function(){
        const vars = utils.getUrlVars();
        if(vars.n!== undefined && vars.cd===undefined){ // un niveau à afficher
            library.displayContent(vars.n,true);
            return;
        } else if(vars.u!==undefined && vars.cd === undefined){
            let regexp = /(\d*|T)/;// le fichier commence par un nombre ou un T pour la terminale
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
        } else if(vars.c!==undefined){ // une activité MM v2 à lancer
            let json = JSON.parse(decodeURIComponent(vars.c));
            MM.resetCarts();
            for(const i in json){
                MM.carts[i] = new cart(i);
                MM.carts[i].import(json[i]);
            }
            setTimeout(a=>{MM.start()},2000);
        } else if(vars.cd !== undefined || vars.parnier !== undefined){ // activité unique importée de MM v1
            // affichage d'un message de redirection
            let alert = utils.create("div",{className:"message",innerHTML:"Ceci est le nouveau MathsMentales, les anciennes adresses ne sont malheureusement plus compatibles.<hr class='center w50'>Vous allez être redirigé vers l'ancienne version de MathsMentales dans 10 s. <a href='javascript:utils.goToOldVersion();'>Go !</a>"});
            document.getElementById("tab-accueil").appendChild(alert);
            setTimeout(utils.goToOldVersion,10000);
        }
    },
    /**
     * get data form url
     * @returns array of datas from GET vars
     */
    getUrlVars: function() {
        var vars = {},
          hash;
        if(location.href.indexOf("#")>0 && location.href.indexOf("?")<0){ // cas d'une activité MMv1
            // cas d'une référence simple à l'exo
            // pour ouvrir l'éditeur sur cet exo
            let idExo = location.href.substring(location.href.indexOf("#") + 1, location.href.length);
            if(MM1toMM2[idExo].new !== undefined){
                vars.u = MM1toMM2[idExo].new;
            }
        }
        var hashes = window.location.href.replace(/\|/g,'/').slice(window.location.href.indexOf('?') + 1).split('&');
        var len = hashes.length;
        for (var i = 0; i < len; i++) {
          hash = hashes[i].split('=');
          vars[hash[0]] = hash[1];
        }
        return vars;
    },
    /**
     * Create a string of six alphabetic letters
     * @returns (String) a aleatorycode
     */
    seedGenerator:function(){
        let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let code = "";
        for(let i=0;i<6;i++){
            code += str[utils.aleaInt(0,str.length-1)];
        }
        return code;
    },
    setSeed(value){
        if(value !== undefined){
            MM.seed = value;
        } else if(document.getElementById("aleaKey").value === ""){
            MM.seed = utils.seedGenerator();
            document.getElementById("aleaKey").value = MM.seed;
        } else {
            MM.seed = document.getElementById("aleaKey").value;
        }
        utils.initializeAlea(MM.seed);
    },
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
    getRadioChecked:function(name){
        let radio = document.getElementsByName(name);
        for(let i=0,length=radio.length;i<length;i++){
            if(radio[i].checked){
                return radio[i].value;
            }
        }
        return false;
    },
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
     * 
     * @param {array} array 
     * @param {string} str
     */
    join:function(arr,str){
        if(!Array.isArray(arr))return false;
        return arr.join(str);
    },
    /**
     * Création et complétion des infos de tuiles d'accueil
     */
    createTuiles(){
        let grille;
        function setContent(id,obj){
            const elt = utils.create("article",{"className":"tuile","title":"Cliquer pour afficher toutes les activités du niveau"});
            const titre = utils.create("h3",{"innerHTML":obj.nom});
            elt.appendChild(titre);
            const nba = utils.create("div",{"innerHTML":obj.activitiesNumber+" activités"});
            elt.onclick = ()=>{library.displayContent(id,true)};
            elt.appendChild(nba);
            grille.appendChild(elt);
        }
        const ordre={"grille-ecole":["11","10","9","8","7"],"grille-college":["6","5","4","3"],"grille-lycee":[2,1,"T"]};
        for(const o in ordre){
            grille = document.getElementById(o);
            for(let i=0;i<ordre[o].length;i++){
                if(MM.content[ordre[o][i]].activitiesNumber === undefined || MM.content[ordre[o][i]].activitiesNumber ===0 || i==="activitiesNumber")continue;
                setContent(ordre[o][i],MM.content[ordre[o][i]]);
            }
        }    
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
            document.querySelectorAll("#cart"+(MM.selectedCart+1)+"-list li.active span")[0].innerHTML = value;
        }
    },
    changeNbqValue:function(value){
        document.getElementById('nbq-value').innerHTML = value;
        if(MM.editedActivity)MM.editedActivity.setNbq(value);
        if(MM.carts[MM.selectedCart].editedActivityId > -1){
            document.querySelectorAll("#cart"+(MM.selectedCart+1)+"-list li.active span")[1].innerHTML = value;
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
     * @param {integer} min relativ
     * @param {integer} max relativ
     * optionals
     * @param {integer} qty positiv
     * @param {string} avoid start with ^ indicates the list of exeptions,
     * & as exeption => no doble number in the list
     * prime => not a prime
     */
    aleaInt:function(min,max){ // accepts 2 arguments more
        let qty=1;
        let avoid=[];
        let arrayType=false;
        utils.security = 300;
        let nodouble = false;
        let notPrime = false;
        for(let i=2;i<arguments.length;i++){
            if(String(Number(arguments[i])) === arguments[i] || typeof arguments[i]==="number"){
                qty = arguments[i];
                arrayType = true;
            } else if(typeof arguments[i] === "string" && arguments[i][0]=="^"){
                avoid = arguments[i].substring(1).split(",");
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
    aleaFloat:function(min, max, precision){
        let qty=1;
        let avoid = [];
        let nodouble = false;
        utils.security = 300;
        //debug(arguments);
        // check aguments
        for(let i=3;i<arguments.length;i++){
            if(String(Number(arguments[i])) === arguments[i] || typeof arguments[i] === "number"){
                qty = arguments[i];
            } else if(typeof arguments[i] === "string" && arguments[i][0]==="^"){
                avoid = arguments[i].substring(1).split(",");
                if(avoid.indexOf("&")>-1)nodouble = true;
                avoid = avoid.map(Number);
                //debug("Eviter "+avoid);
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
     * @param {number or string} nb 
     * @returns nb with parenthesis if nb 1st char is -
     */
    nP:function(nb){
        if(String(nb)[0]==="-")return "("+nb+")";
        else return nb;
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
        let ids = ["paramsdiapo","paramsexos", "paramsinterro", "paramsceinture", "paramsflashcards", "paramswhogots"];
        if(ids.indexOf(id)<0) return false;
        // hide all
        for(let i=0,len=ids.length;i<len;i++){
            document.getElementById(ids[i]).className = "hidden";
        }
        document.getElementById(id).className = "";
    },
    resetAllTabs : function(){
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
    annotate:function(){
        if(MM.annotate === undefined){
            MM.annotate = new draw();
        } else {
            MM.annotate.destroy();
            MM.annotate = undefined;
        }
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
                return utils.aleaInt(total-min+1,total);
            } else {
                return utils.aleaFloat(total-min+1,total,2);
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
    },
    /**
     * Render the math
     * @param (dom) wtarget : window reference
     */
    mathRender: function(wtarget) {
        let contents = ["tab-enonce", "tab-corrige", "activityOptions"];
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
      clone(someThing){
          if(someThing === undefined) return false;
          else if(typeof someThing === "object"){
              return JSON.parse(JSON.stringify(someThing));
          } else {
              return someThing;
          }
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
        do { unnondiviseur = utils.aleaInt(2,nb-1); }
        while (nb%unnondiviseur===0)
        return unnondiviseur;
    },
    /**
     * 
     * @param {integer} nb 
     * return un diviseur de nb
     */
    unDiviseur(nb){
        let diviseurs = math.listeDiviseurs(nb,true);
        return diviseurs[utils.aleaInt(0,diviseurs.length-1)];
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
        if(notex === undefined || notex===false) ret = Algebrite.run('printlatex('+expr+')');
        else ret = Algebrite.run(expr);
        return ret;
    },
    getHM(h,m,s){
        //debug(arguments);
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
    }
}
// test de seedrandom
window.onload = function(){
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
    // put the good default selected
    document.getElementById("chooseParamType").value = "paramsdiapo";
    // to show de good checked display
    MM.setDispositionEnonce(utils.getRadioChecked("Enonces"));
    // load scratchblocks french translation
    // TODO : à changer au moment de l'utilisation de scratchblocks
    // doesn't work on local file :( with Chrome
    let reader = new XMLHttpRequest();
    reader.onload = function(){
        let json = JSON.parse(reader.responseText);
        window.scratchblocks.loadLanguages({
            fr: json});
        }
    reader.open("get", "libs/scratchblocks/fr.json", false);
    reader.send();
}
class cart {
    constructor(id){
        this.id = id;
        this.end = "correction";
        this.introduction = "countdown";
        this.activities = [];
        this.sortable = undefined;
        this.editedActivityId = -1;
        this.target = [id]; // Indicates where to display the cart.
        this.nbq = 0;
        this.time = 0;
        this.title = "Diapo "+(id+1);
    }
    export(){
        let activities={};
        for(let i=0,l=this.activities.length;i<l;i++){
            activities[i]=this.activities[i].export();
        }
        return {
            i:this.id,
            a:activities,
            t:this.title,
            c:this.target,
            e:this.end,
            r:this.introduction
        };
    }
    // TODO : à travailler
    import(obj){
        this.end = obj.e;
        //à revoir
        this.title = obj.t;
        this.introduction = obj.r;
        this.target = obj.c;
        let activitiesNumber = _.size(obj.a);
        let count = 0;
        // activités
        for(const i in obj.a){
            this.activities[i] = new activity({'id':obj.a[i].i});
            this.activities[i].import(obj.a[i]);
            count++;
            if(activitiesNumber === count){
                MM.editedActivity = this.activities[i];
            }
        }
    }
    setEndValue(value){
        this.end = value;
    }
    setIntroduction(value){
        this.introduction = value;
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
        let dom = document.getElementById("cart"+(this.id)+"-list");
        dom.innerHTML = "";
        this.time = 0;
        this.nbq = 0;
        for(let i=0,l=this.activities.length; i<l;i++){
            let li = document.createElement("li");
            let activity = this.activities[i];
            this.time += Number(activity.tempo)*Number(activity.nbq);
            this.nbq += Number(activity.nbq);
            li.innerHTML = "<img src='img/editcart.png' align='left' onclick='MM.editActivity("+i+")' title='Editer l\'activité'>"+activity.title + " | <span>"+activity.tempo + "</span> s. | <span>"+activity.nbq+"</span> questions";
            if(MM.carts[this.id].editedActivityId === i)li.className = "active";
            dom.appendChild(li);
        }
        let spans = document.querySelectorAll("#cart"+(this.id)+" div.totaux span");
        //debug(spans);
        spans[0].innerHTML = utils.sToMin(this.time);
        spans[1].innerHTML = this.nbq;
        spans[2].innerHTML = this.target;
        this.sortable = new Sortable(dom, {
            animation:150,
            ghostClass:'ghost-movement',
            onEnd : function(evt){
                MM.carts[this.id].exchange(evt.oldIndex, evt.newIndex);
            }
        });
    }
}
/**
 * offer the possibility to anotate the page
 * designed for interactive screens
 */
class draw {
    constructor(){
        // creation du canva et instanciation
        let c = utils.create("canvas",{"id":"painting"});
        const target = document.getElementById("corrige-content");
        target.appendChild(c);
        this.canvas = document.getElementById("painting");
        this.canvas.width = target.offsetWidth;
        this.canvas.height = target.offsetHeight+30;
        this.canvas.style.top = target.offsetTop;
        this.canvas.style.left = target.offsetLeft;
        this.mouse = {x:0,y:0};
        const mouvement = (event)=>{
            this.mouse.x = event.pageX - event.target.offsetLeft;
            this.mouse.y = event.pageY - event.target.offsetTop;
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
        }
        const yesDraw = (event)=>{
            this.enableDraw = true;
        }
        const noDraw = (event)=>{
            this.enableDraw = false;this.started = false;
        }
        this.canvas.addEventListener("mousemove",mouvement, false);
        this.canvas.addEventListener("touchmove",mouvement, false);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.canvas.addEventListener('mousedown', yesDraw, false);
        this.canvas.addEventListener('touchstart', yesDraw, false);
        this.canvas.addEventListener('mouseup',noDraw,false);
        this.canvas.addEventListener('mouseout',noDraw,false);
        this.canvas.addEventListener('touchend', noDraw,false);
       // Prevent scrolling when touching the canvas
        document.body.addEventListener("touchstart", e=> {
            if (e.target == this.canvas) {
            e.preventDefault();
            }
        }, false);
        document.body.addEventListener("touchend", e=> {
            if (e.target == this.canvas) {
            e.preventDefault();
            }
        }, false);
        document.body.addEventListener("touchmove", e=> {
            if (e.target == this.canvas) {
            e.preventDefault();
            }
        }, false);
    }
    // destroy canvas
    destroy(){
        // Prevent scrolling when touching the canvas
        document.body.removeEventListener("touchstart", e=> {
            if (e.target == this.canvas) {
            e.preventDefault();
            }
        }, false);
        document.body.removeEventListener("touchend", e=> {
            if (e.target == this.canvas) {
            e.preventDefault();
            }
        }, false);
        document.body.removeEventListener("touchmove", e=> {
            if (e.target == this.canvas) {
            e.preventDefault();
            }
        }, false);
        this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = undefined;
        this.ctx = undefined;
    }
}
class steps {
    constructor(obj){
        this.step = 0;
        this.size = obj.size;
        this.container = obj.container;
    }
    addSize(value){
        this.size += value;
    }
    display(){
        let ul = document.createElement("ul");
        ul.className = "steps is-balanced has-gaps is-horizontal has-content-above has-content-centered";
        for(let i=0;i<this.size;i++){
            let li = document.createElement("li");
            li.className = "steps-segment";
            let span = document.createElement("span");
            if(i === this.step){
                span.className = "steps-marker is-hollow";
                li.appendChild(span);
                let div = document.createElement("div");
                div.className = "steps-content";
                div.innerHTML = this.step+1;
                li.appendChild(div);
                li.className += " is-active";
            } else {
                span.className = "steps-marker";
                li.appendChild(span);
                let div = document.createElement("div");
                div.innerHTML = "&nbsp;";
                div.className = "steps-content";
                li.appendChild(div);
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
        this.figure = undefined;
        this.create(target);
    }
    /**
     * construct de destination DOM element
     * @param {destination} destination DOMelement
     */
    create(destination){
        if(this.type === "chart"){
            let div = document.createElement("div");            
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
    display(destination){
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
            this.figure = new Chart(target, this.content);
            //debug("Chart data", target, utils.clone(this.content));
        } else if(this.type === "graph"){ //JSXGraph
            try{
                if(destination === undefined){
                    this.figure = JXG.JSXGraph.initBoard(this.id, {boundingbox:this.boundingbox, keepaspectratio: true, showNavigation: false, showCopyright: false,registerEvents:false, axis:this.axis, grid:this.grid});
                } else {
                    this.figure = destination.JXG.JSXGraph.initBoard(this.id, {boundingbox:this.boundingbox, keepaspectratio: true, showNavigation: false, showCopyright: false,registerEvents:false, axis:this.axis, grid:this.grid});
                }
                for(let i=0,len=this.content.length;i<len;i++){
                    let type = this.content[i][0];
                    let commande = this.content[i][1];
                    let options = false;
                    if(this.content[i][2] !== undefined)
                        options = this.content[i][2];
                    if(type === "functiongraph"){
                        let formule = commande;
                        if(!options)
                            this.figure.create("functiongraph", [function(x){return eval(formule)}], {strokeWidth:2});
                        else
                            this.figure.create("functiongraph", [function(x){return eval(formule)}], options);
                    } else if(type==="jessiescript") {
                        this.figure.construct(commande);
                    } else if(["text", "point","axis", "line", "segment"].indexOf(type)>-1){
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
        let btnPause = document.querySelectorAll("#slider"+this.id+" .slider-nav img")[1];
        btnPause.src="img/slider-pause.png";
        utils.removeClass(btnPause,"blink_me");
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
    }
    generateQuestions(){
        utils.setSeed()
        // generate questions and answers
        for(let index=0;index<this.activities.length;index++){
            const activity = this.activities[index];
            activity.generate();
        }
    }
    populate(){
        // taille des caractères
        this.wsheet.document.getElementsByTagName('html')[0].className = "s"+document.getElementById('exTxtSizeValue').value.replace(".","");
        this.content =this.wsheet.document.getElementById("creator-content");
        this.docsheet = this.wsheet.document;
        this.generateQuestions();
        if(this.type === "exo"){
            this.createExoSheet();
        } else if(this.type === "exam"){
            this.createInterroSheet();
        } else if(this.type === "ceinture"){
            this.createCeintureSheet();
        } else if(this.type === "flashcard"){
            this.createFlashCards();
        } else if(this.type === "whogots"){
            this.createWhoGots();
        }
        // render the math
        utils.mathRender(this.wsheet);
        // permet de réinitialiser l'affichage pour la prochaine
        MM.editedActivity.display();
    }
    /**
     * 
     * @param {string} type element name
     * @param {string} className
     * @param {string} innerHTML
     */
    createElement(type){
        let elm = this.docsheet.createElement(type);
        if(arguments[1] !== undefined){
            elm.className = arguments[1];
        }
        if(arguments[2] !== undefined){
            elm.innerHTML = arguments[2];
        }
        return elm;
    }
    createExoSheet(){
        // set elements :
        let aleaCode = this.createElement("div","floatright","Clé : "+MM.seed);
        this.content.appendChild(aleaCode);
        // get the titlesheet
        let sheetTitle = document.getElementById("extitle").value||"Fiche d'exercices";
        // set the titlesheet
        let header = this.createElement("header","",sheetTitle);
        this.content.appendChild(header);
        // get the exercice title
        let exTitle = document.getElementById("exeachex").value||"Exercice n°";
        // get the position of the correction
        let correction = "end";
        let radios = document.getElementsByName("excorr");
        for (let index = 0; index < radios.length; index++) {
            if(radios[index].checked)
                correction = radios[index].value;
        }
        let correctionContent = this.createElement("div","correction");
        let titleCorrection = this.createElement("header", "clearfix","Correction des exercices");
        if(correction === "end")
            correctionContent.appendChild(titleCorrection);
        // in case of figures
        MM.memory = {};
        // create a shit because of the li float boxes
        let divclear = this.createElement("div", "clearfix");
        for(let i=0;i<this.activities.length;i++){
            const activity = this.activities[i];
            let sectionEnonce = this.createElement("section");
            sectionEnonce.id = "enonce";
            let sectionCorrection = this.createElement("section");
            let h3 = this.createElement("h3", "exercice-title",exTitle+(i+1)+" : "+activity.title)
            sectionEnonce.appendChild(h3);
            let ol = this.createElement("ol");
            let olCorrection = this.createElement("ol", "corrige");
            for(let j=0;j<activity.questions.length;j++){
                let li = this.createElement("li");
                let liCorrection = this.createElement("li");
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let span = this.createElement("span","math", activity.questions[j]);
                    let spanCorrection = this.createElement("span", "math", activity.answers[j]);
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
                    MM.memory["f"+i+"-"+j] = new Figure(activity.figures[j], "f"+i+"-"+j,li);
                }
                olCorrection.appendChild(liCorrection);
            }
            sectionEnonce.appendChild(ol);
            let ds = divclear.cloneNode(true);
            sectionEnonce.appendChild(ds);
            // affichage de la correction
            if(correction !== "end" ){
                let hr = docsheet.createElement("hr");
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
        // set elements :
        let aleaCode = this.createElement("div","floatright","Clé : "+MM.seed);
        this.content.appendChild(aleaCode);
        // get the titlesheet
        let sheetTitle = document.getElementById("inttitle").value||"Interrogation écrite";
        // set the titlesheet
        let header = this.createElement("header","",sheetTitle);
        this.content.appendChild(header);
        let div1 = this.createElement("div","studenName","Nom, prénom, classe :");
        this.content.appendChild(div1);
        let div2 = this.createElement("div","remarques","Remarques :");
        this.content.appendChild(div2);
        // get the exercice title
        let exTitle = document.getElementById("inteachex").value||"Exercice n°";
        let correctionContent = this.createElement("div","correction");
        let titleCorrection = this.createElement("header", "clearfix","Correction des exercices");
        correctionContent.appendChild(titleCorrection);
        let divclear = this.createElement("div", "clearfix");
        for (let i = 0; i < this.activities.length; i++) {
            const activity = this.activities[i];
            let section = this.createElement("section");
            let sectionCorrection = this.createElement("section");
            let h3 = this.createElement("h3", "exercice-title",exTitle+(i+1)+" : "+activity.title)
            section.appendChild(h3);
            let ol = this.createElement("ol");
            let olCorrection = this.createElement("ol", "corrige");
            for(let j=0;j<activity.questions.length;j++){
                let li = this.createElement("li","interro");
                let liCorrection = this.createElement("li");
                if(activity.type === "latex" || activity.type === "" || activity.type === undefined){
                    let span = this.createElement("span","math", activity.questions[j]);
                    let spanCorrection = this.createElement("span", "math", activity.answers[j]);
                    li.appendChild(span);
                    liCorrection.appendChild(spanCorrection);
                } else {
                    li.innerHTML = activity.questions[j];
                    liCorrection.innerHTML = activity.answers[j];
                }
                ol.appendChild(li);
                olCorrection.appendChild(liCorrection);
            }
            section.appendChild(ol);
            let ds = divclear.cloneNode(true);
            section.appendChild(ds);
            let h3correction = h3.cloneNode(true);
            sectionCorrection.appendChild(h3correction);
            sectionCorrection.appendChild(olCorrection);
            correctionContent.appendChild(sectionCorrection);
            this.content.appendChild(section);
        }
        // insert footer for print page break
        this.content.appendChild(this.createElement("footer","","Fin"));
        // insert correction
        this.content.appendChild(correctionContent);
        let ds = divclear.cloneNode(true);
        this.content.appendChild(ds);
    }
    createFlashCards(){
        // set elements :
        let aleaCode = this.createElement("div","floatright","Clé : "+MM.seed);
        this.content.appendChild(aleaCode);
        // get the titlesheet
        let sheetTitle = document.getElementById("FCtitle").value||"Interrogation écrite";
        // set the titlesheet
        let header = this.createElement("header","",sheetTitle);
        this.content.appendChild(header);
    }
    createWhoGots(){

    }
};
// MathsMentales core
var MM = {
    content:undefined, // liste des exercices classés niveau/theme/chapitre chargé au démarrage
    introType:undefined,// type of the slide's intro values : "example" "321" "nothing"
    endType:undefined,// type of end slide's values : "correction", "nothing", "list"
    selectedCart:0,
    seed:"", // String to initialize the randomization
    editedActivity:undefined, // object activity 
    slidersOrientation: "", // if vertical => vertical presentation for 2 sliders
    onlineState:false, // true if user answers on computer (Cf start and online functions)
    carts:[], // max 4 carts
    steps:[],
    timers:[],
    figs:{}, // 
    userAnswers:[],
    slidersNumber:1,
    editActivity:function(index){
        MM.editedActivity = MM.carts[MM.selectedCart].activities[index];
        MM.setTempo(MM.editedActivity.tempo);
        MM.setNbq(MM.editedActivity.nbq);
        MM.carts[MM.selectedCart].editedActivityId = index;
        MM.carts[MM.selectedCart].display();
        MM.editedActivity.display();
        document.getElementById("addToCart").className = "hidden";
        document.getElementById("removeFromCart").className = "";
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
        document.getElementById("divparams").className="col-2 row-3 colsx2";
    },
    showCartInterface(){
        document.getElementById("divcarts").className="row-4";
        document.getElementById("phantom").className="hidden";
        document.getElementById("divparams").className="row-3";
    },
    addCart:function(){
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
    populateQuestionsAndAnswers:function(withAnswer){
        if(withAnswer=== undefined)withAnswer = true;
        MM.figs = {};MM.steps=[];MM.timers=[];MM.memory={};
        let length=MM.carts.length;
        let enonces = document.getElementById('enonce-content');
        let corriges = document.getElementById('corrige-content');
        if(length>1){
            enonces.className = "grid-"+length;
            corriges.className = "grid-"+length;
        }
        enonces.innerHTML="";
        corriges.innerHTML="";
        // TODO : randomize the seed and collect it for reuse
        //MM.seed = "enonce";
        utils.setSeed();
        for(let i=0;i<length;i++){
            for(let kk=0,clen=MM.carts[i].target.length;kk<clen;kk++){
                let indiceSlide = 0;
                let slideNumber = MM.carts[i].target[kk]-1;
                let slider = document.getElementById("slider"+slideNumber);
                let addTitle = "";
                if(clen>1)addTitle = "-"+(kk+1);
                let titleSlider = MM.carts[i].title+addTitle;
                document.querySelector("#slider"+slideNumber+" .slider-title").innerHTML = titleSlider;
                let sliderSteps = document.querySelector("#slider"+slideNumber+" .steps-container");
                let dive = document.createElement("div");
                let divc = document.createElement("div");
                let h3e = document.createElement("h3");
                let h3c = document.createElement("h3");
                h3e.innerText = titleSlider; // exercice's title
                h3c.innerText = titleSlider; // correction's title
                dive.append(h3e);
                divc.append(h3c);
                let ole = document.createElement("ol");
                let olc = document.createElement("ol");
                MM.steps[slideNumber] = new steps({size:0, container:sliderSteps});
                MM.timers[slideNumber] = new timer(slideNumber);
                for(let z=0,alen=MM.carts[i].activities.length;z<alen;z++){
                    let element = MM.carts[i].activities[z];
                    element.generate();
                    MM.steps[slideNumber].addSize(element.nbq);
                    for(let j=0;j<element.questions.length;j++){
                        // sliders
                        let div = document.createElement("div");
                        div.className = "slide w3-animate-top";
                        if(indiceSlide>0) div.className += " hidden";
                        div.id = "slide"+slideNumber+"-"+indiceSlide;
                        let span = document.createElement("span");
                        let spanAns = document.createElement("span");
                        spanAns.className = "answerInSlide hidden";
                        // timers
                        MM.timers[slideNumber].addDuration(element.tempo);
                        // enoncés et corrigés
                        let lie = document.createElement("li");
                        let lic = document.createElement("li");
                        if(element.type === undefined || element.type === "" || element.type === "latex"){
                            lie.className = "math";
                            lic.className = "math";
                            span.className="math";
                            spanAns.className += " math";
                        }
                        let question = element.questions[j];
                        let answer = element.answers[j];
                        // trouver une alternative dans la génération (hors exemple)
                        // TODO : à supprimer, le choix doit être fait dans la génération.
                        /*if(Array.isArray(element.questions[j])){
                            let alea = utils.aleaInt(0,element.questions[j].length-1);
                            question = element.questions[j][alea];
                        }*/
                        lie.innerHTML = question;
                        span.innerHTML = question;
                        spanAns.innerHTML = answer;
                        div.appendChild(span);
                        if(!MM.onlineState){ // include answer
                            div.appendChild(spanAns);
                        }
                        // insertion du div dans le slide
                        slider.appendChild(div);
                        lic.innerHTML += answer;
                        if(element.figures[j] !== undefined){
                            lic.innerHTML += "<button onclick=\"MM.memory['c"+slideNumber+"-"+indiceSlide+"'].toggle()\">Figure</button>";
                            MM.figs[slideNumber+"-"+indiceSlide] = new Figure(element.figures[j], "c"+slideNumber+"-"+indiceSlide, div);
                            MM.memory['e'+slideNumber+"-"+indiceSlide] = new Figure(element.figures[j], "en"+slideNumber+"-"+indiceSlide, lie,[300,150]);
                            MM.memory['c'+slideNumber+"-"+indiceSlide] = new Figure(element.figures[j], "cor"+slideNumber+"-"+indiceSlide, lic,[450,225]);
                        }
                        ole.appendChild(lie);
                        olc.appendChild(lic);
                        indiceSlide++;
                    }
                }
                dive.append(ole);
                divc.append(olc);
                enonces.append(dive);
                corriges.append(divc);
                MM.steps[slideNumber].display();
                if(!utils.isEmpty(MM.figs)){
                    setTimeout(function(){
                    for(let j=0;j<indiceSlide;j++){
                        MM.memory['e'+slideNumber+"-"+j].display();
                    }
                });
                }        
            }
        }
        utils.mathRender();
        if(MM.onlineState) { // create inputs for user
            MM.createUserInputs();
        }
    },
    /**
     * Create the user inputs to answer the questions
     * 
     */
    createUserInputs:function(){
        let slider=0,slide = 0;
        for(let i=0,len=MM.carts[0].activities.length;i<len;i++){
            let activity = MM.carts[0].activities[i];
            for(let j=0,lenq=activity.questions.length;j<lenq;j++){
                let element = document.getElementById("slide"+slider+"-"+slide);
                let span = document.createElement("span");
                let input = document.createElement("INPUT");
                input.type = "text";
                input.id = "userAnswer"+slide;
                input.dataset.id = j;
                input.className = "inputUser";
                input.pattern = "[\dxsqrt\/\*+-^%]+"
                if(activity.samples[j]!== undefined)
                    input.placeholder = "ex. : "+activity.samples[j];
                else
                    input.placeholder = "Réponse ici";
                // helpers buttons
                input.addEventListener("keyup",function(event){
                    if(event.key === "Enter"){
                        MM.nextSlide(0);
                    }
                });//update katex value
                span.appendChild(input);
                element.appendChild(span);
                slide++;
            }
        }
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
    /**
     * Start the slideshow
     */
    start:function(){
        MM.onlineState = MM.checkOnline();
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        if(MM.onlineState){
            MM.userAnswers = [];
            // security there should not be more than 1 cart for the online use
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
                MM.showSlideShows();
                MM.startTimers();
            },3600);
        } else if(MM.introType ==="example"){
            MM.showSampleQuestion();
            MM.showSlideShows();
        } else {
            MM.showSlideShows();
            MM.startTimers();
        }
    },
    // get the URL of direct access to the activity with actual parameters
    copyURL(){
        MM.checkOnline();
        if(!MM.carts[0].activities.length){
            MM.carts[0].addActivity(MM.editedActivity);
        }
        MM.checkIntro();
        utils.setSeed();
        let carts = {};
        for(let i=0;i<this.carts.length;i++){
            carts[i] = this.carts[i].export();
        }
        utils.setHistory("Activité MathsMentales",{i:MM.introType,e:MM.endType,o:MM.onlineState,c:encodeURIComponent(JSON.stringify(carts))});
    },
    /**
     * check if online session
     */
    checkOnline:function(){
        let radios = document.getElementsByName("online");
        let ret = false;
        for(let i=0;i<radios.length;i++){
            if(radios[i].value==="yes" && radios[i].checked)
                ret = true;
        }
        return ret;
    },
    checkIntro:function(){
        MM.introType = utils.getRadioChecked("beforeSlider");
        MM.entType = utils.getRadioChecked("endOfSlideRadio");
    },
    startTimers:function(){
        for(let i=0,k=MM.timers.length;i<k;i++){
            MM.timers[i].start(0);
        }
    },
    showSampleQuestion:function(){
        let nb = MM.slidersNumber;
        utils.setSeed("sample"+Date());
        let container = document.getElementById("slideshow");
        for(let i=0,len=MM.carts.length;i<len;i++){
            MM.carts[i].activities[0].generateSample();
        }
        let divSample = document.createElement("div");
        divSample.id = "sampleLayer";
        divSample.className = "sample";
        for(let i=0;i<nb;i++){
            let div = document.createElement("div");
            div.id = "sample"+i;
            if(nb === 1)div.className = "slider-1";
            else if(nb===2)div.className = "slider-2";
            else div.className = "slider-34";
            div.innerHTML = `Exemple <div class="slider-nav">
            <button title="Montrer la réponse" onclick="MM.showSampleAnswer(${i});"><img src="img/slider-solution.png" /></button>
            <button title="Autre exemple" onclick="MM.newSample(${i});"><img src="img/newsample.png" /></button>
            <button title="Démarrer le diaporama" onclick="MM.startSlideShow(${i});"><img src="img/fusee.png" /></button>
            </div>`;
            let divContent = document.createElement("div");
            divContent.className = "slide";
            divContent.id = "sampleSlide"+i;
            let span = document.createElement("span");
            span.id = "sample"+i+"-enonce";
            let spanAnswer = document.createElement("span");
            spanAnswer.id = "sample"+i+"-corr";
            spanAnswer.className = "hidden";
            divContent.appendChild(span);
            divContent.appendChild(spanAnswer);
            div.appendChild(divContent);
            // math or not ?
            // insert content
            divSample.appendChild(div);
        }
        container.appendChild(divSample);
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
                    let fig = new Figure(act.sample.figure, "sample-c"+sN, document.getElementById("sampleSlide"+sN));
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
        let nb = MM.slidersNumber;
        let container = document.getElementById("slideshow");
        container.innerHTML = "";
        if(MM.slidersOrientation === "vertical")container.className = "hidden vertical";
        else container.className = "hidden";
        for(let i=0;i<nb;i++){
            let div = document.createElement("div");
            div.id = "slider"+i;
            if(nb === 1)div.className = "slider-1";
            else if(nb===2)div.className = "slider-2";
            else div.className = "slider-34";
            div.innerHTML = `<div class="slider-nav">
            <button title="Arrêter le diaporama" onclick="MM.timers[${i}].end()"><img src="img/slider-stop.png" /></button>
            <button title="Mettre le diapo en pause" onclick="MM.timers[${i}].pause()"><img src="img/slider-pause.png" /></button>
            <button title="Montrer la réponse" onclick="MM.showTheAnswer(${i});"><img src="img/slider-solution.png" /></button>
            <button title="Passer la diapo" onclick="MM.nextSlide(${i});"><img src="img/slider-next.png" /></button>
            </div>
            <div class="slider-title"></div>
            <div class="slider-chrono"><progress class="progress is-link is-large" value="0" max="100"></progress></div>
            <div class="steps-container"></div>`;
            container.appendChild(div);
        }
    },
    showSlideShows:function(){
        utils.removeClass(document.getElementById("slideshow-container"),"hidden");
        if(MM.onlineState){
            document.getElementById("userAnswer0").focus();
        }
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
        if(whatToDo === "correction"){
            utils.showTab("tab-corrige");
        } else if(whatToDo === "list"){
            utils.showTab("tab-enonce");
        }
    },
    showTheAnswer(id){
        let answerToShow = document.querySelector("#slide"+id+"-"+MM.steps[id].step+" .answerInSlide");
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
    newSample(id){
        for(let i=0,len=MM.carts.length;i<len;i++){
            if(MM.carts[i].target.indexOf(id+1)>-1){
                let act = MM.carts[i].activities[0];
                act.generateSample();
                document.getElementById("sample"+id+"-enonce").innerHTML = act.sample.question;
                document.getElementById("sample"+id+"-corr").innerHTML = act.sample.answer;
                if(act.type === undefined || act.type==="" || act.type === "latex"){
                    document.getElementById("sample"+id+"-enonce").className = "math";
                    document.getElementById("sample"+id+"-corr").className += " math";
                }
                if(act.sample.figure !== undefined){
                    let item = document.getElementById("sample-c"+id);
                    item.parentNode.removeChild(item);
                    let fig = new Figure(act.sample.figure, "sample-c"+id, document.getElementById("sampleSlide"+id));
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
        MM.startTimers();
    },
    /**
     * 
     * @param {integer} id du slide (start to 1)
     */
    nextSlide:function(id){
        if(MM.onlineState){ // save answer
            MM.userAnswers[MM.steps[id].step]=document.getElementById("userAnswer"+(MM.steps[id].step)).value;
        }
        let step = MM.steps[id].nextStep();
        if(step === false) {
            MM.timers[id].end();
            return false;
        }
        MM.timers[id].start(step);
        let slidetoHide = document.querySelector('#slide'+id+"-"+(step-1));
        let slide = document.querySelector('#slide'+id+"-"+step);
        utils.addClass(slidetoHide, "hidden");
        if(slide){
            utils.removeClass(slide, "hidden");
            if(MM.figs[id+"-"+step] !== undefined)
                MM.figs[id+"-"+step].display();
            if(MM.onlineState){
                document.getElementById("userAnswer"+step).focus();
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
            MM.hideSlideshows();
            // correction si online
            if(MM.onlineState){
                let score = 0;
                let div = document.createElement("div");
                let ol = document.createElement("ol");
                ol.innerHTML = "<b>Tes réponses</b>";
                let ia = 0;
                for(let indexA=0,lenA=MM.carts[0].activities.length;indexA<lenA;indexA++){
                    for(let indexQ=0,lenQ=MM.carts[0].activities[indexA].questions.length;indexQ<lenQ;indexQ++){
                        let li = document.createElement("li");
                        let span = document.createElement("span");
                        const userAnswer = MM.userAnswers[ia];
                        const expectedAnswer = MM.carts[0].activities[indexA].values[indexQ];
                        if(!/[^-\d]/.test(userAnswer))
                            span.className ="math";
                        span.textContent = userAnswer;
                        // TODO : better correction value
                        // prendre en compte les cas où plusieurs réponses sont possibles
                        if(String(userAnswer)==String(expectedAnswer)){
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
                        ia++;
                        li.appendChild(span);
                        ol.appendChild(li);
                    }
                }
                div.appendChild(ol);
                let section = document.createElement("section");
                section.innerHTML = "<b>Score :</b> "+score+"/"+ia;
                div.appendChild(section);
                document.getElementById("corrige-content").appendChild(div);
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
            if(i===index){
                radios[i].checked = true;
                MM.setDispositionEnonce(index+1);
            }
        }
    },
    setDispositionEnonce:function(value){
        value = Number(value);
        MM.slidersNumber = value;
        if(value === 1){
            document.getElementById("sddiv1").className = "sddiv1";
            document.getElementById("sddiv2").className = "hidden";
            document.getElementById("sddiv3").className = "hidden";
            document.getElementById("sddiv4").className = "hidden";
            document.getElementById("divisionsOption").className = "hidden";
            document.getElementById("onlinechoice").className = "";
            MM.setDispositionDoubleEnonce('h');
            MM.carts[0].target = [1];
        } else if(value === 2){
            let directions = document.querySelectorAll("input[name='direction']");
            if(directions[0].checked){ // horizontal
                MM.setDispositionDoubleEnonce('h');
            } else {
                MM.setDispositionDoubleEnonce('v');
            }
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
            document.getElementById("sddiv1").className = "sddiv34";
            document.getElementById("sddiv2").className = "sddiv34";
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
            document.getElementById("sddiv1").className = "sddiv34";
            document.getElementById("sddiv2").className = "sddiv34";
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
            MM.slidersOrientation = "horizontal";
            document.getElementById("screen-division").className = "";
        } else {
            MM.slidersOrientation = "vertical";
            document.getElementById("screen-division").className = "vertical";
            document.querySelector("input[name='direction'][value='v']").checked = true;
        }
    }
}

// lecture de la bibliotheque
var library = {
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
    load:function(url){
        let reader = new XMLHttpRequest();
        reader.onload = ()=>{
            let json = JSON.parse(reader.responseText);
            utils.setHistory("Exercice",{"u":url});
            this.open(json);
        }
        reader.open("get", "library/"+url, false);
        reader.send();
    },
    import:function(objact,url,actparams,last=false){
        let reader = new XMLHttpRequest();
        reader.onload = function(){
            let json = JSON.parse(reader.responseText);
            let obj = objact;
            obj.setParams(json);
            obj.chosenOptions = actparams.o;
            obj.chosenQuestionTypes = actparams.p;
            obj.chosenQuestions = actparams.q;
            obj.tempo = actparams.t;
            obj.nbq = actparams.n;
        }
        reader.open("get", "library/"+url, false);
        reader.send();
    },
    openContents:function(){
        let reader = new XMLHttpRequest();
        reader.onload = function(){
            MM.content = JSON.parse(reader.responseText);
            // remplissage de la grille d'accueil
            utils.createTuiles();
            // check if parameters from URL
            utils.checkURL();
        }
        reader.open("get", "library/content.json", true);
        reader.send();
    },
    displayContent:function(level,base=false){
        if(MM.content === undefined) {console.log("Pas de bibliothèque"); return false;}
        let niveau={nom:"Recherche",themes:{}};
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
        } else if(!base){
            // recherche d'un terme, différent de T pour le niveau terminale
            if(level.length<3)return false; // on ne prend pas les mots de moins de 3 lettres
            // construction du niveau par extraction des données.
            for(let niv in MM.content){
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
        } else 
            niveau = MM.content[level];
        let html = "";
        if(!base && !_.isObject(level))
            html = "<h1>Résultat de la recherche</h1>";
        else if(!_.isObject(level))
            html = "<h1>Niveau "+niveau["nom"]+" ("+niveau["activitiesNumber"]+" act.)</h1>";
        else 
            html = "<h2>Cette activité MathsMentales v1 a été répartie en plusieurs activités</h2>";
        if(!_.isObject(level))
            utils.setHistory(niveau["nom"],{"n":level});
        // Affichage et mise en forme des données.
        let itemsNumber = 0;
        for(let i in niveau["themes"]){
            let first = true;
            let theme = false;
            let htmlt = (first)?"<span>":"";
            htmlt += "<h2>"+niveau.themes[i].nom+"</h2>";
            for(let j in niveau["themes"][i]["chapitres"]){
                let chapitre = false;
                let htmlc=(first)?"":"<span>";
                htmlc += "<h3>"+niveau["themes"][i]["chapitres"][j]["n"]+"</h3>";
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
                    htmlt+=htmlc+((first)?"":"</span>");
                    if(first === true){
                        htmlt += "</span>";
                        first = false;
                    }
                }
            }
            if(theme)html+=htmlt;
        }
        document.getElementById("resultat-chercher").innerHTML = html;
        let target = document.getElementById("tab-chercher");
        target.className = "tabs-content-item";
        // Nombre de colonnes en fonction du contenu
        if(itemsNumber > 40) utils.addClass(target,"cols3");
        else if(itemsNumber > 20) utils.addClass(target, "cols2");
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
        this.options = utils.clone(obj.options)||undefined;
        this.questionPatterns = utils.clone(obj.questionPatterns)||obj.question;
        this.answerPatterns = utils.clone(obj.answerPatterns) || obj.answer;
        this.valuePatterns = utils.clone(obj.valuePatterns) || obj.value;
        this.questions = utils.clone(obj.questions)||[];
        this.answers = utils.clone(obj.answers)||[];
        this.samples = utils.clone(obj.samples)||[];// samples of answers, for online answer
        this.values = utils.clone(obj.values)||[];
        this.figures = utils.clone(obj.figures)||[]; // generetad figures paramaters
        this.examplesFigs = {}; // genrated graphics from Class Figure
        this.chosenOptions = utils.clone(obj.chosenOptions)||[];
        this.chosenQuestions = utils.clone(obj.chosenQuestions)||{};
        this.chosenQuestionTypes = utils.clone(obj.chosenQuestionTypes)||[];
        this.tempo = utils.clone(obj.tempo) || Number(document.getElementById("tempo-slider").value);
        this.nbq = utils.clone(obj.nbq) || Number(document.getElementById("nbq-slider").value);
    }
    initialize(){
        this.questions = [];
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
        return {
            i:this.id,
            o:this.chosenOptions,
            q:this.chosenQuestions,
            p:this.chosenQuestionTypes,
            t:this.tempo,
            n:this.nbq
        };
    }
    /**
     * import datas
     */
    import(obj){
        /* load */
        let regexp = /(\d*|T)/;// le fichier commence par un nombre ou un T pour la terminale
        let level = regexp.exec(obj.i)[0];
        let url = "N"+level+"/"+obj.i+".json";
        library.import(this,url,obj); // synchrone, so no problem
    }
    /**
     * getOption
     * 
     * return uniqueId (Integer)
     */
    getOption(){
        if(this.chosenOptions.length === 0 && this.options){
            return utils.aleaInt(0, this.options.length-1);
        } else if(this.chosenOptions.length > 0){
            return this.chosenOptions[utils.aleaInt(0,this.chosenOptions.length-1)];
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
            setTimeout(function(){
                for(let i in MM.editedActivity.examplesFigs){
                    MM.editedActivity.examplesFigs[i].display();
                }
            }, 300);
        }
        utils.mathRender();
    }
    /**
     * getPattern
     * 
     * @param {integer} option id de l'option dont dépend le pattern
     * 
     * return uniqueId (Integer)
     */
    getPattern(option){
        if(this.chosenQuestionTypes.length > 0){
            return this.chosenQuestionTypes[utils.aleaInt(0, this.chosenQuestionTypes.length-1)];
        }
        // no option
        if(option === false)return false;
        // if option, patterns ?
        if(!Array.isArray(this.chosenQuestions[option])){
            this.chosenQuestions[option] = [];
        }
        // no pattern chosen : we choose one
        if(this.chosenQuestions[option].length === 0 && Array.isArray(this.options[option].question)){
            return utils.aleaInt(0, this.options[option].question.length-1);
        } else if(this.chosenQuestions[option].length === 0 && !this.options[option].question && Array.isArray(this.questionPatterns)){
            // no question in option, but global question is an array
            return utils.aleaInt(0, this.questionPatterns.length-1);
        } else if(this.chosenQuestions[option].length > 0){
            // list of patterns chosen, we pick one
            return this.chosenQuestions[option][utils.aleaInt(0,this.chosenQuestions[option].length-1)];
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
                //debug("replaceVars value to modify : "+c);
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
    * 
    */
    generate(n, opt, patt, sample){
        // empty values
        if(n === undefined) n = this.nbq;
        // optionNumber is the number of the choosen option
        // patternNumber is the number of the choosen sub option
        let optionNumber, patternNumber, lenQ=false;
        this.wVars={};
        this.cFigure = undefined;
        let loopProtect = 0, maxLoop = 100;
        for(let i=0;i<n;i++){
            if(opt === undefined) optionNumber = this.getOption(); else optionNumber = opt;
            if(patt === undefined) patternNumber = this.getPattern(optionNumber); else patternNumber = patt;
            //debug("option choisie : "+optionNumber, "Pattern choisi : "+patternNumber);
            if(optionNumber !== false){
                // set chosen vars
                if(this.options[optionNumber].vars === undefined){
                    // pas de variable définie dans l'option, on prend les variables globales
                    this.cVars = this.vars;
                } else this.cVars = this.options[optionNumber].vars;
                if(this.options[optionNumber].consts === undefined){
                    this.cConsts = this.consts;
                } else this.cConsts = this.options[optionNumber].consts;
                if(patternNumber !== false){
                    // la question est définie dans l'option, avec un pattern défini
                    if(this.options[optionNumber].question !== undefined){
                        this.cQuestion = this.options[optionNumber].question[patternNumber];
                        lenQ = this.options[optionNumber].question.length;
                    } else { // elle est définie globalement
                        this.cQuestion = this.questionPatterns[patternNumber];
                        lenQ = this.questionPatterns.length;
                    }
                } else if(this.options[optionNumber].question === undefined){ // question définie dans l'option
                    this.cQuestion = this.questionPatterns;
                } else this.cQuestion = this.options[optionNumber].question; // question définie globalement
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
                        this.cAnswer = this.cAnswer[utils.aleaInt(0,this.cAnswer.length-1)];
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
                this.cConsts = this.consts;
                if(patternNumber!==false){
                    this.cQuestion = this.questionPatterns[patternNumber];
                } else {
                    this.cQuestion = this.questionPatterns;
                }
                this.cAnswer = this.answerPatterns;
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
                    this.wVars[name] = this.replaceVars(this.wVars[name][utils.aleaInt(0,this.wVars[name].length-1)]);
                } else if(typeof this.wVars[name] === "string" && this.wVars[name].indexOf("_")>-1){
                    // var is defined with a min-max interval within a string
                    var bornes = this.wVars[name].split("_");
                    if(bornes[0].indexOf("d")>-1) {// float case
                        this.wVars[name] = utils.aleaFloat(Number(bornes[0].substring(1)), Number(bornes[1]), Number(bornes[2]), bornes[3], bornes[4]);
                    } else { // integer case
                        this.wVars[name] = utils.aleaInt(Number(bornes[0]), Number(bornes[1]), bornes[2], bornes[3]);                        
                    }
                }
            }
            // généralement pas utilisé ! à supprimer.
            if(this.cConsts !== undefined){
                this.cConsts = this.replaceVars(this.cConsts);
            }
            if(!sample){
            // question text generation
            let thequestion = this.replaceVars(_.clone(this.cQuestion));
            let thevalue = this.replaceVars(_.clone(this.cValue));
            loopProtect++;
            // on évite les répétitions
            if(this.questions.indexOf(thequestion)<0 || this.values.indexOf(thevalue)<0){
                this.questions[i] = thequestion;
                this.answers[i] = this.replaceVars(_.clone(this.cAnswer), thequestion);
                this.values[i] = thevalue;
                if(this.cFigure!== undefined){
                    this.figures[i] = {
                        "type":this.cFigure.type,
                        "content":this.replaceVars(_.clone(this.cFigure.content)),
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
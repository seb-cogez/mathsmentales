export {utils as default}
// Some traductions
const moisFR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const joursFR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const utils = {
    baseURL:window.location.href.split("?")[0].split("#")[0],
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
        window.location.href = (utils.baseURL + 'old/').replace("index.htmlold","old") +(/(^.*\/)(.*)/.exec(window.location.href)[2]);
    },
    /**
     * Performs check on radio button with name and value
     * @param {String} name 
     * @param {String} value 
     * @returns 
     */
    checkRadio(name,value){
        let domElt =  document.querySelector("input[type=radio][name='"+name+"'][value='"+value+"']");
        if(domElt)
            domElt.checked = true;
        else
            return false;
    },
    /**
     * performs check on checkbox inputs from name and values
     * @param {String} name 
     * @param {String, Array} values 
     * @returns 
     */
    checkCheckbox(name,value){
        // remise à zéro de tous les éléments
        document.querySelectorAll("input[type='checkbox'][name='"+name+"']").forEach(el=>{
            el.checked = false;
        })
        if(_.isArray(value)){
            value.forEach(el =>{
                let domElt = document.querySelector("input[type=checkbox][name='"+name+"'][value='"+el+"']");
                if(domElt)
                    domElt.checked = true;
                    })
        } else {
            let domElt = document.querySelector("input[type=checkbox][name='"+name+"'][value='"+value+"']");
            if(domElt)
                domElt.checked = true;
        }
    },
    selectOption(id,value){
        let domElt = document.getElementById(id);
        for(let i=0;i<domElt.options.length;i++){
            if(domElt.options[i].value === value){
                domElt.selectedIndex = i;
                break;
            }
        }
    },
    getTypeOfURL(url){
        if(url.indexOf("exercices.html")>-1){
            return "paramsexos"
        } else if(url.indexOf("courseauxnombres.html")>-1){
            return "paramscourse"
        } else if(url.indexOf("dominos.html")>-1){
            return "paramsdominos"
        } else if(url.indexOf("duel.html")>-1){
            return "paramsduel"
        } else if(url.indexOf("ceinture.html")>-1){
            return "paramsceinture"
        } else return "paramsdiapo"
    },
    /**
     * 
     * @param {Array} array tableau contenant des données
     * @param {someThing} value value à rechercher
     * @returns {Number} count nombre des valeurs dans le tableau
     */
    countValue(array, value){
        let count = 0
        for(let i=0,j=array.length;i<j;i++){
            if(array[i]===value)count++
        }
        return count;
    },
    /**
     * Endode les accolades dans une chaine car encodeURIComponent ne le fait pas
     * @param {String} url a string corresponding an URL
     * @returns better encoded string
     */
    superEncodeURI:function(url){
        var encodedStr = '', encodeChars = ["(", ")","{","}",",","-"];
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
                    vars.c[id]={i:datas.p,t:datas.t,c:datas.c,o:datas.o,a:{},d:datas.d,at:datas.at};
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
     * Transform 10:05 string to seconds string, return number
     * @param {string} timeValue 
     */
    timeToSeconds(timeValue){
        let elems = timeValue.split(":");
        return Number(elems[0])*60+Number(elems[1]);
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
        let returnValues = []
        for(let i=0,length=radio.length;i<length;i++){
            if(radio[i].checked){
                returnValues.push(radio[i].value);
            }
        }
        if(returnValues.length > 1) return returnValues.join("-");
        else if(returnValues.length === 1) return returnValues[0];
        else return false;
    },
    /**
     * 
     * @param {string} value id select
     * @returns string
     */
    getSelectValue:function(id){
        try {
            let select = document.getElementById(id);
            return select[select.selectedIndex].value;
        } catch(err){
            console.log(err)
        }
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
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
utils = {
    seed: "sample",
    security:300,// max number for boucles
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
        let radios = document.getElementsByName(name);
        for(let i=0,length=radios.length;i<length;i++){
            if(radio[i].checked){
                return radio[i].value;
            }
        }
        return false;
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
        utils.seed = seed;
        utils.alea = new Math.seedrandom(utils.seed);
    },
    /**
     *  
     * @param {integer} min relativ
     * @param {integer} max relativ
     * optionals
     * @param {integer} qty positiv
     * @param {string} avoid start with ^ indicates the list of exeptions
     */
    aleaInt:function(min,max){ // accept 2 arguments more
        let qty=1;
        let avoid=[];
        utils.security = 300;
        for(let i=2;i<arguments.length;i++){
            if(typeof arguments[i] === "number"){
                qty = arguments[i];
            } else if(typeof arguments[i] === "string" && arguments[i][0]=="^"){
                avoid = arguments[i].substring(1).split(",");
            }
        }
        if(min === max) return min;
        if(max<min){
            [min,max] = [max,min];
        }
        if(qty>1){
            var integers = [];
            for(let i=0;i<qty;i++){
                let thisint = math.round(utils.alea()*(max-min))+min;
                if(avoid.indexOf(thisint)>-1){
                    // do not use exeptions numbers
                    i--;
                    if(!utils.checkSecurity()) break;
                    continue;
                }
                integers.push(thisint);
                if(!utils.checkSecurity()) break;
            }
            if(modeDebug) console.log("AleaInt array : "+integers);
            return integers;
        } else {
            let thisint;
            do{
                thisint = math.round(utils.alea()*(max-min))+min;
                if(!utils.checkSecurity()) break;
            }
            while (avoid.indexOf(thisint)>-1)
            if(modeDebug) console.log("AleaInt 1 int : "+thisint);
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
        utils.security = 300;
        if(modeDebug)console.log(arguments);
        // check aguments
        for(let i=3;i<arguments.length;i++){
            if(typeof arguments[i] === "number"){
                qty = arguments[i];
            } else if(typeof arguments[i] === "string" && arguments[i][0]==="^"){
                avoid = arguments[i].substring(1).split(",").map(Number);
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
                if(precision>=0)
                    nb = math.round(utils.alea()*(max-min)+min,precision);
                else
                    nb = Number(math.round(Number((utils.alea()*(max-min)+min)+"e"+precision))+"e"+(-precision));
                if(avoid.indexOf(nb)>-1){
                    i--;
                    if(!utils.checkSecurity()) break;
                    continue;
                   }
                floats.push(nb);
                if(security<0) break;
            }
            if(modeDebug)console.log(floats);
            return floats;
        } else { // one value
            let nb;
            do {
                if(precision>=0)
                    nb = math.round(utils.alea()*(max-min)+min,precision);
                else
                    nb = Number(math.round(Number((utils.alea()*(max-min)+min)+"e"+precision))+"e"+(-precision));
                if(!utils.checkSecurity()) break;
                console.log(nb);
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
    signIfOne:function(nb){
        if(nb === 1)
            return "";
        else if(nb === -1)
            return "-";
        else return nb;
    },
    showTab:function(element){
        utils.resetAllTabs();
        utils.addClass(element, "is-active");
        var tab = element.getAttribute('href').substr(1);
        document.getElementById(tab).style.display = "";
    },
    resetAllTabs : function(){
        let tabsButtons = document.querySelectorAll("#header-menu .tabs-menu-link");
        let contents = document.querySelectorAll(".tabs-content-item");
        contents.forEach(element => {
            element.style.display = "none";
        });
        tabsButtons.forEach(element => {
            utils.removeClass(element, "is-active");
        });
    },
    /**
     * Render the math
     */
    mathRender: function() {
        document.querySelectorAll(".math").forEach(function(item) {
          var texTxt = item.innerHTML;
          texTxt = texTxt.replace(/\./g, "{,}");
          try {
            katex.render(texTxt, item, {
              throwOnError: false,
              errorColor: "#FFF"
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
      }
}
// test de seedrandom
window.onload = function(){
    MM.resetCarts();
    // interface
    let tabsButtons = document.querySelectorAll("#header-menu .tabs-menu-link");
    tabsButtons.forEach(element => {
        element.onclick = function(){utils.showTab(element)};
    });
    utils.checkValues();
    utils.resetAllTabs();
    utils.initializeAlea(Date());
    activitiesArray.forEach(function(element,index){
        let ol = document.getElementById("actlist");
        let li = document.createElement("li");
        li.onclick = function(){library.open(index)};
        li.innerText = element.title;
        ol.appendChild(li);
    });
    MM.setDispositionEnonce(MM.getDispositionEnonce());
}
class cart {
    constructor(id){
        this.id = id;
        this.end = "correction";
        this.introduction = "countdown";
        this.activities = [];
        this.sortable = undefined;
        this.editedActivityId = -1;
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
     * Change the order of the activities conformity to the li order after a move
     * @param {integer} oldIndex old index of the activity
     * @param {integer} newIndex new index of the activity
     */
    exchange(oldIndex, newIndex){
        let indexes = this.activities.getKeys();
        console.log(indexes);
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
        let dom = document.getElementById("cart"+(MM.selectedCart+1)+"-list");
        dom.innerHTML = "";
        for(let i=0,l=this.activities.length; i<l;i++){
            let li = document.createElement("li");
            let activity = this.activities[i];
            li.innerHTML = "<img src='img/editcart.png' align='left' onclick='MM.editActivity("+i+")'>"+activity.title + " | <span>"+activity.tempo + "</span> s. | <span>"+activity.nbq+"</span> questions";
            if(MM.carts[MM.selectedCart].editedActivityId === i)li.className = "active";
            dom.appendChild(li);
        }
        this.sortable = new Sortable(dom, {
            animation:150,
            ghostClass:'ghost-movement',
            onEnd : function(evt){
                MM.carts[MM.selectedCart].exchange(evt.oldIndex, evt.newIndex);
            }
        });
    }
}
class steps {
    constructor(obj){
        this.step = 0;
        this.size = obj.size;
        this.contener = obj.contener;
    }
    addSize(value){
        this.size += value;
    }
    html(){
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
            }
            ul.appendChild(li);
        }
        if(this.contener.hasChildNodes()){
            let node = this.contener.childNodes[0];
            this.contener.replaceChild(ul, node);
        } else {
            this.contener.appendChild(ul);
        }
    }
    nextStep(){
        this.step++;
        this.html();
    }
}
// MathsMentales core
MM = {
    selectedCart:0,
    editedActivity:undefined, // object activity 
    slidersOrientation: "", // if vertical => vertical presentation for 2 sliders
    carts:[], // max 4 carts
    steps:[],
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
        MM.steps=[];
    },
    addCart:function(){
        let cartsNb = MM.carts.length+1;
        if(cartsNb>4) return false;
        MM.carts[cartsNb-1] = new cart(cartsNb-1);
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
        if(!window.confirm("Vous êtes sur le points de supprimer ce panier.\nConfirmez-vous ?")){
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
            let div = document.getElementById('cart'+i);
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
        } else return false;
    },
    addToCart(){
        MM.carts[MM.selectedCart].addActivity(MM.editedActivity);
    },
    removeFromCart(){
        let cart = MM.carts[MM.selectedCart];
        cart.removeActivity(cart.editedActivityId);
        cart.editedActivityId = -1;
        document.getElementById("addToCart").className = "";
        document.getElementById("removeFromCart").className = "hidden";
    },
    populateQuestionsAndAnswers:function(){
        let enonces = document.getElementById('enonce-content');
        let corriges = document.getElementById('corrige-content');
        enonces.innerHTML="";
        corriges.innerHTML="";

        for(let i=0,length=MM.carts.length;i<length;i++){
            let slider = document.getElementById("slider"+i);
            MM.steps[i] = new steps({size:0, contener:slider});
            MM.carts[i].activities.forEach(element => {
                element.generate();
                MM.steps[i].addSize(element.nbq);
                for(let j=0;j<element.questions.length;j++){
                    // sliders
                    let div = document.createElement("div");
                    div.className = "slide w3-animate-top";
                    div.id = "slide"+i+"-"+j;
                    let span = document.createElement("span");
                    // enoncés et corrigés
                    let li = document.createElement("li");
                    let li2 = document.createElement("li");
                    li.className = "math";li2.className = "math";span.className="math";
                    let question = element.questions[j];
                    if(Array.isArray(element.questions[j])){
                        question = element.questions[j][utils.aleaInt(0,element.questions[j].length-1)];
                    }
                    li.innerHTML = question;
                    span.innerHTML = question;
                    div.append(span);
                    slider.appendChild(div);
                    enonces.append(li);
                    li2.innerHTML = element.answers[j];
                    corriges.append(li2);
                }
            });
            MM.steps[i].html();
        }
        utils.mathRender();    
    },
    start:function(){
        MM.resetCarts();
        MM.carts[0].addActivity(MM.editedActivity);
        // check if an option has been chosen
        // TODO !!!
        MM.createSlideShows();
        MM.populateQuestionsAndAnswers();
        MM.showSlideShows();
    },
    showQuestions:function(){
        MM.resetCarts();
        MM.carts[0].addActivity(MM.editedActivity);
        MM.createSlideShows();
        MM.populateQuestionsAndAnswers();
        utils.showTab(document.querySelector("[href='#tab-enonce'].tabs-menu-link"));
    },
    showAnswers:function(){
        MM.resetCarts();
        MM.carts[0].addActivity(MM.editedActivity);
        MM.createSlideShows();
        MM.populateQuestionsAndAnswers();
        utils.showTab(document.querySelector("[href='#tab-corrige'].tabs-menu-link"));
    },
    /**
     * 
     * 
     */
    createSlideShows:function(){
        let nb = MM.carts.length;
        let contener = document.getElementById("slideshow");
        if(modeDebug)console.log(nb, contener);
        contener.innerHTML = "";
        if(MM.slidersOrientation === "vertical")contener.className = "hidden vertical";
        else contener.className = "hidden";
        for(let i=0;i<nb;i++){
            let div = document.createElement("div");
            div.id = "slider"+i;
            if(nb === 1)div.className = "slider-1";
            else if(nb===2)div.className = "slider-2";
            else div.className = "slider-34";
            contener.appendChild(div);
        }
    },
    showSlideShows:function(){
        document.getElementById("slideshow").className="";
    },
    getDispositionEnonce:function(){
        let radios = document.querySelectorAll("input[name='Enonces']");
        for(let i=0,j=radios.length;i<j;i++){
            if(radios[i].checked) return i+1;
        }
    },
    setDispositionEnonce:function(value){
        if(value === 1){
            document.getElementById("sddiv1").className = "sddiv1";
            document.getElementById("sddiv2").className = "hidden";
            document.getElementById("sddiv3").className = "hidden";
            document.getElementById("sddiv4").className = "hidden";
            document.getElementById("divisionsOption").className = "hidden";
            document.getElementById("onlinechoice").className = "";
            MM.setDispositionDoubleEnonce('h');
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
        } else if(value === 3){
            document.getElementById("sddiv1").className = "sddiv34";
            document.getElementById("sddiv2").className = "sddiv34";
            document.getElementById("sddiv3").className = "sddiv34";
            document.getElementById("sddiv4").className = "hidden";
            document.getElementById("divisionsOption").className = "hidden";
            document.querySelector("input[name='online'][value='no']").checked = true;
            document.getElementById("onlinechoice").className = "hidden";
            MM.setDispositionDoubleEnonce('h');
        } else if(value === 4){
            document.getElementById("sddiv1").className = "sddiv34";
            document.getElementById("sddiv2").className = "sddiv34";
            document.getElementById("sddiv3").className = "sddiv34";
            document.getElementById("sddiv4").className = "sddiv34";
            document.getElementById("onlinechoice").className = "hidden";
            document.querySelector("input[name='online'][value='no']").checked = true;
            document.getElementById("divisionsOption").className = "hidden";
            MM.setDispositionDoubleEnonce('h');
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
library = {
    open:function(objId){
        let obj = new activity(activitiesArray[objId]);
        MM.editedActivity = obj;
        //MM.carts[MM.selectedCart].addActivity(obj);
        // show tab-content
        var tab = document.querySelector("a[href$='parameters'].tabs-menu-link");
        utils.resetAllTabs();
        utils.addClass(tab, "is-active");
        document.getElementById("tab-parameters").style.display = "";
        document.getElementById("addToCart").className = "";
        document.getElementById("removeFromCart").className = "hidden";
        obj.display();
    }
}
// lecture des fichiers exercice
/**
* Structure d'un fichier exercice
* {
    'title':'titre',
    'ID':'generatedId',
    'description':'short description',
    'options':[{}, {}, ...}], // ojects {"name":"NameOfOption", 'vars':{}, 'question':'pattern'||['pattern0','pattern1',...], answers:'pattern'||[], value:'valuepattern'||[]}
        if one of vars, question, answer or value not defined take it from defaults values on bottom
    'vars':{'a':'pattern', 'b':'pattern', ...}, // pattern can be a list ['value0', 'value1'], or a range "value0_value1", or a list of ranges, Integers, Decimals, letters
    to avoid certains numbers in range, add _^a,b => -5_15_^0,1,-1 will choose integers between -5 and 15 but not 0, 1 or -1
    vars can refer to a previous defined var. You have do prefixed with : like 'b' : ':a+:a' b is the sum of a and a
    'question':'pattern with :a & :b' || [pattern0, pattern1,...] || [[pattern0,pattern1,...], [pattern0,pattern1,...],...]
    'answer':'pattern' || [pattern0, pattern1,...],
    'value':'value' or [value0, value1, ...] // accepted values for online answers
}
*/
class activity {
    constructor(obj){
        this.id = obj.id||obj.ID;
        this.title = obj.title;
        this.description = obj.description;
        this.vars = obj.vars;
        this.options = utils.clone(obj.options)||undefined;
        this.questionPatterns = utils.clone(obj.questionPatterns)||obj.question;
        this.answerPatterns = utils.clone(obj.answerPatterns) || obj.answer;
        this.valuePatterns = utils.clone(obj.valuePatterns) || obj.value;
        this.questions = utils.clone(obj.questions)||[];
        this.answers = utils.clone(obj.answers)||[];
        this.values = utils.clone(obj.values)||[];
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
    }
    setTempo(value){
        this.tempo = Number(value);
    }
    setNbq(value){
        this.nbq = Number(value);
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
    /**
     * Display the activity editor
     */
    display(){
        this.initialize();
        // affichages
        document.getElementById('activityTitle').innerHTML = this.title;
        if(this.description)
            document.getElementById('activityDescription').innerHTML = this.description;
        // affichage d'exemple(s)
        var examples = document.getElementById('activityOptions');
        examples.innerHTML = "";
        utils.initializeAlea("sample");
        if(this.options !== undefined && this.options.length > 0){
            let colors = ['',' red',' orange',' blue', ' green', ' grey',];
            // affichage des options
            for(let i=0;i<this.options.length;i++){
                this.generate(1,i,false);// génère un cas par option (si plusieurs)
                examples.innerHTML += "<p><input id='o"+i+"' class='checkbox"+colors[i%colors.length]+"' type='checkbox' value='"+i+"' onclick='MM.editedActivity.setOption(this.value, this.checked);'"+((this.chosenOptions.indexOf(i)>-1)?"checked":"")+"> "+this.options[i]["name"] + " :";
                let ul = document.createElement("ul");
                if(Array.isArray(this.questions[0])){
                    for(let jj=0; jj<this.questions[0].length;jj++){
                        let li = document.createElement("li");
                        let checked = "";
                        if(this.chosenQuestions[i]){
                            if(this.chosenQuestions[i].indexOf(jj)>-1)
                                checked = "checked";
                        }
                        li.innerHTML = "<input class='checkbox"+colors[i%colors.length]+"' type='checkbox' id='o"+i+"-"+jj+"' value='"+i+"-"+jj+"' onclick='MM.editedActivity.setOption(this.value, this.checked);'"+checked+"> <span class='math'>"+this.questions[0][jj]+"</span>";
                        ul.appendChild(li);
                    }
                } else {
                    let li = document.createElement("li");
                    li.innerHTML = "<span class='math'>"+ this.questions[0] +"</span></p>";
                    ul.appendChild(li);
                }
                examples.appendChild(ul);
            }
        } else {
            // no option
            this.generate(1);
            let ul = document.createElement("ul");
            if(Array.isArray(this.questions[0])){
                for(let jj=0; jj<this.questions[0].length;jj++){
                    let li = document.createElement("li");
                    li.innerHTML = "<input type='checkbox' class='checkbox' value='"+jj+"' onclick='MM.editedActivity.setQuestionType(this.value, this.checked);' ><span class='math'>"+this.questions[0][jj]+"</span>";
                    ul.appendChild(li);
                }
            } else {
                let li = document.createElement("li");
                li.innerHTML = "<span class='math'>"+ this.questions[0] +"</span></p>";
                ul.appendChild(li);
            }
            // display answer
            examples.appendChild(ul);
            examples.innerHTML += "<p><span class='math'>"+this.answers[0]+"</span></p>";
        }
        utils.mathRender();
    }
    /**
     * getOption
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
            return false;
        }
        // no pattern chosen : we choose one
        if(this.chosenQuestions[option].length === 0 && Array.isArray(this.options[option].question)){
            return utils.aleaInt(0, this.options[option].question.length-1);
        } else if(this.chosenQuestions[option].length > 0){
            // list of patterns chosen, we pick one
            return this.chosenQuestions[option][utils.aleaInt(0,this.chosenQuestions[option].length-1)];
        } else return false;
    }
    /**
     * 
     * @param {string} value optionId || optionID-renderID
     */
    setOption(value, check){
        var optionId, renderId;
        if(value.indexOf("-")>-1){
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
        if(modeDebug)console.log(value,check);
        let questionId = Number(value);
        if(check){
            // not already chosen
            if(this.chosenQuestionTypes.indexOf(questionId)<0){
                if(modeDebug)console.log("chosenQuestionTypes add "+questionId);
                this.chosenQuestionTypes.push(questionId);
            }
        } else {
            if(modeDebug)console.log("chosenQuestionTypse remove "+questionId);
            this.chosenQuestionTypes.removeValue(questionId);
        }
    }
    /**
     * 
     * @param {string} chaine : chaine où se trouve la variable 
     */
    replaceVars(chaine, index){
        for(const c in this.wVars){
            //if(modeDebug) console.log("replaceVars value to modify : "+c);
            //let regex = new RegExp("(\\$\\{[^"+c+"\\}]*)"+c+"([^\\}]*\\})", 'g');
            let regex = new RegExp(":"+c, 'g');
            chaine = chaine.replace(regex, "this.wVars['"+c+"']");
            //if(modeDebug) console.log("replaceVars value modified : "+chaine);
        }
        // check if question as to be written in answer
        if(index !== undefined){
            //if(modeDebug)console.log(this.questions[index]);
            let regex = new RegExp(":question", 'g');
            chaine = chaine.replace(regex, this.questions[index]);
        }
        //if(modeDebug) console.log("replaceVars : final"+chaine);
        return chaine.replace(/\\/g,"\\\\");
    }
    /**
    * 
    * générateur de questions et réponses
    * 
    * generate this.questions, this.answers and this.values
    * @param {integer} n number of questions to create
    * @param {integer} option id of an option (optional)
    * @param {integer} pattern id of question pattern (otional)
    * return nothing
    * 
    */
    generate(n, opt, patt){
        // empty values
        if(n === undefined) n = this.nbq;
        let option, pattern;
        this.wVars={};
        for(let i=0;i<n;i++){
            if(opt === undefined) option = this.getOption(); else option = opt;
            if(patt === undefined) pattern = this.getPattern(option); else pattern = patt;
            if(modeDebug)console.log("option choisie : "+option, "Pattern choisi : "+pattern);
            if(option !== false){
                // set chosen vars
                if(this.options[option].vars === undefined){
                    this.cVars = this.vars;
                } else this.cVars = this.options[option].vars;
                if(pattern !== false){
                    if(this.options[option].question !== undefined)
                        this.cQuestion = this.options[option].question[pattern];
                    else this.cQuestion = this.questionPatterns[pattern];
                } else if(this.options[option].question === undefined){
                    this.cQuestion = this.questionPatterns;
                } else this.cQuestion = this.options[option].question;
                if(this.options[option].answer === undefined){
                    this.cAnswer = this.answerPatterns;
                } else this.cAnswer = this.options[option].answer;
                if(this.options[option].value === undefined){
                    this.cValue = this.valuePatterns;
                } else this.cValue = this.options[option].value;
            } else {
                this.cVars = this.vars;
                if(pattern!==false)
                    this.cQuestion = this.questionPatterns[pattern];
                else 
                    this.cQuestion = this.questionPatterns;
                this.cAnswer = this.answerPatterns;
                this.cValue = this.valuePatterns;
            }
            // values generation
            for(const name in this.cVars) {
                this.wVars[name]=this.cVars[name];
                if(typeof this.wVars[name] === "string" && this.wVars[name].indexOf("\$\{")>-1){
                    // var is defined with other variable, we replace the variable with her value
                    this.wVars[name] = eval("`"+this.replaceVars(this.wVars[name])+"`");
                }
                if(typeof this.wVars[name] === "object"){
                    // var is defined with an array of values
                    this.wVars[name] = this.wVars[name][utils.aleaInt(0,this.wVars[name].length-1)];
                    /*if(this.wVars[name].indexOf("\$\{")>-1){
                        this.wVars[name] = eval("`"+this.replaceVars(this.wVars[name])+"`");
                    }*/
                } else if(typeof this.wVars[name] === "string" && this.wVars[name].indexOf("_")>-1){
                    // var is defined with a min-max interval within a string
                    var bornes = this.wVars[name].split("_");
                    if(bornes[2] === undefined || bornes[2].indexOf("^")>-1) {// integer                       
                        this.wVars[name] = utils.aleaInt(Number(bornes[0]), Number(bornes[1]), bornes[2]);
                    } else { // float case, the third value is the precision
                        this.wVars[name] = utils.aleaFloat(Number(bornes[0]), Number(bornes[1]), Number(bornes[2]), bornes[3]);
                    }
                }
            }
            if(modeDebug)console.log(this.wVars);
            // question text generation
            if(typeof this.cQuestion === "string"){
                this.questions[i] = eval("`"+this.replaceVars(this.cQuestion)+"`");
            } else if(typeof this.cQuestion === "object"){
                // generate all selected patterns
                this.questions[i] = []
                for(let jj=0;jj<this.cQuestion.length;jj++){
                    this.questions[i].push(eval("`"+this.replaceVars(this.cQuestion[jj])+"`"));
                }
            }
            if(typeof this.cAnswer === "string"){
                this.answers[i] = eval("`"+this.replaceVars(this.cAnswer, i)+"`");
            } else if(typeof this.cAnswer === "object"){
                // generate all selected patterns
                this.answers[i] = [];
                for(let jj=0; jj<this.cAnswer.length; jj++){
                    this.answers[i].push(eval("`"+this.replaceVars(this.cAnswer[jj], i)+"`"));
                }
            }
            if(typeof this.cValue === "string"){
                this.values[i] = eval("`"+this.replaceVars(this.cValue)+"`");
            } else if(typeof this.cValue === "object"){
                this.values[i]= []
                // generate all patterns
                for(let kk=0;kk< this.cValue.length;kk++){
                    this.values[i][kk] = eval("`"+this.replaceVars(this.cValue[kk])+"`");
                }
            }
        }
    }
}
// tests :
activitiesArray =[{
    "title":"Tables de Multiplications",
    "ID":"mult",
    "options":[
        {"name":"Petites", "vars":{"a":"1_4", "b":"1_4"}},
        {"name": "Moyennes", "vars":{"a":"5_7", "b":"5_7"}}
    ],
    "question":["\\bold{${:a}}\\times${:b}", "${:b}\\times\\bold{${:a}}"],
    "answer":":question=\\color{red}{${:a*:b}}",
    "value":"${:a*:b}"
},{
    "title":"Conversions vers les unités de base",
    "ID":"convBase",
    "options":[
        // var k : unité d'où convertir et multiplicande
        // var p : précision max (négative : multiples de l'unité, positive : sous-multiples) et nombre max
        // var z : intervalle la précision
        // var x : intervalle de tirage entre 0 et p nombre max, avec la précision p max et non nul ^0
        {"name":"m", "vars":{"q":"m","k":[["km",1000], ["hm",100], ["dam",10], ["dm",0.1], ["cm",0.01], ["mm",0.001]],"p":[[0,0],[-1,10],[-2,100],[-3,1000]], "z":"${:p[0]}_3", "x":"0_${:p[1]}_${:z}_^0"}},
        {"name":"L", "vars":{"q":"L","k":[["hL",100], ["daL",10], ["dL",0.1], ["cL",0.01], ["mL",0.001]],"p":[[0,0],[-1,10],[-2,100],[-3,1000]],"z":"${:p[0]}_3","x":"0_${:p[1]}_${:z}_^0"}},
        {"name":"g", "vars":{"q":"g","k":[["kg",1000], ["hg",100], ["dag",10], ["dg",0.1], ["cg",0.01], ["mg",0.001]],"p":[[0,0],[-1,10],[-2,100],[-3,1000]], "z":"${:p[0]}_3", "x":"0_${:p[1]}_${:z}_^0"}}
    ],
    "description":"Conversions des multiples et sous-multiples des m, L et g vers les m, L et g",
    "question":"\\text{Convertir } ${:x} \\text{ ${:k[0]} en }\\color{blue}\\text{${:q}}",
    "answer":"${:x} \\text{ ${:k[0]}} = \\color{red}{${math.round(:x*:k[1],7)}\\text{ ${:q}}}",
    "value":"${math.round(:x*:k[1],7)}\\text{ ${:q}}"
},{
    "title":"Développer une identité remarquable",
    "ID":"devIdRem",
    // var a : entier entre 1 et 10
    // var b : entier entre 2 et 10
    // var c : variable
    "vars":{"a":"1_10", "b":"2_10", "c":["u","v","t","x", "y", "z"]},
    "options":[{
        "name":"(ax+b)²",
        "question": ["(${utils.signIfOne(:a)}${:c}+${:b})^2", "(${:b}+${utils.signIfOne(:a)}${:c})^2"],
        "answer":":question=\\color{red}{${utils.signIfOne(math.pow(:a,2))}${:c}^2+${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}}",
        "value":"${utils.signIfOne(math.pow(:a,2))}${:c}^2+${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}"    
    },
    {
        "name":"(ax-b)²",
        "question": ["(${utils.signIfOne(:a)}${:c}-${:b})^2", "(${:b}-${utils.signIfOne(:a)}${:c})^2"],
        "answer":":question=\\color{red}{${utils.signIfOne(math.pow(:a,2))}${:c}^2-${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}}",
        "value":"${utils.signIfOne(math.pow(:a,2))}${:c}^2-${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}"    
    },
    {
        "name":"(ax-b)(ax+b)",
        "question": [
            "(${utils.signIfOne(:a)}${:c}-${:b})(${utils.signIfOne(:a)}${:c}+${:b})",
            "(${utils.signIfOne(:a)}${:c}-${:b})(${:b}+${utils.signIfOne(:a)}${:c})",
            "(${utils.signIfOne(:a)}${:c}+${:b})(${utils.signIfOne(:a)}${:c}-${:b})",
            "(${:b}+${utils.signIfOne(:a)}${:c})(${utils.signIfOne(:a)}${:c}-${:b})"],
        "answer":":question=\\color{red}{${utils.signIfOne(math.pow(:a,2))}${:c}^2-${math.pow(:b,2)}}",
        "value":"${utils.signIfOne(math.pow(:a,2))}${:c}^2-${math.pow(:b,2)}"    
    }
    ]
},{
    "title":"Factoriser avec les identités remarquables",
    "ID":"factIR",
    "vars":{"k":"1_10", "b":"1_10", "c":["u","v","t","x", "y", "z"]},
    "options":[
        {
            "name":"ax²+2abx+b²",
            "question":["${utils.signIfOne(math.pow(:k,2))+:c}^2+${(2*:k*:b)+:c}+${math.pow(:b,2)}", "${utils.signIfOne(math.pow(:k,2))+:c}^2+${math.pow(:b,2)}+${(2*:k*:b)+:c}", "${(2*:k*:b)+:c}+${utils.signIfOne(math.pow(:k,2))+:c}^2+${math.pow(:b,2)}"],
            "answer":":question=\\color{red}{(${utils.signIfOne(:k)+:c}+${:b})^2}",
            "value":"(${utils.signIfOne(:k)+:c}+${:b})^2"
        },
        {
            "name":"a²-2abx+b²",
            "question":["${utils.signIfOne(math.pow(:k,2))+:c}^2-${(2*:k*:b)+:c}+${math.pow(:b,2)}", "${utils.signIfOne(math.pow(:k,2))+:c}^2+${math.pow(:b,2)}-${(2*:k*:b)+:c}", "-${(2*:k*:b)+:c}+${utils.signIfOne(math.pow(:k,2))+:c}^2+${math.pow(:b,2)}"],
            "answer":":question=\\color{red}{(${utils.signIfOne(:k)+:c}-${:b})^2}",
            "value":"(${utils.signIfOne(:k)+:c}-${:b})^2"
        },
        {
            "name":"a²-b²",
            "question":["${utils.signIfOne(math.pow(:k,2))+:c}^2-${math.pow(:b,2)}", "${math.pow(:b,2)}-${utils.signIfOne(math.pow(:k,2))+:c}^2"],
            "answer":":question=\\color{red}{(${utils.signIfOne(:k)+:c}+${:b})(${:k+:c}-${:b})}",
            "value":"(${utils.signIfOne(:k)+:c}+${:b})(${:k+:c}-${:b})"
        },
        {
            "name":"(ax+b)²-c²",
            "vars":{"a":"1_10", "b":"-10_10_^0", "c":["u","v","t","x", "y", "z"], "d":"1_10"},
            "question":"(${utils.signIfOne(:a)+:c}${utils.signedNumber(:b)})^2-${math.pow(:d,2)}",
            "answer":":question=\\color{red}{(${utils.signIfOne(:a)+:c}${utils.signedNumber(:b+:d)})(${utils.signIfOne(:a)+:c}${utils.signedNumber(:b-:d)})}",
            "value":"(${utils.signIfOne(:a)+:c}${utils.signedNumber(:b+:d)})(${utils.signIfOne(:a)+:c}${utils.signedNumber(:b-:d)})"
        }
    ]
}];
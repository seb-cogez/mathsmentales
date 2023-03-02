import utils from "./utils.min.js";
import math from "./math.min.js";
import Figure from "./figure.min.js";
import library from "./library.min.js";
import MM from "./MM.min.js";
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
export default class activity {
    /**
     * Création d'une activité à partir d'un objet javascript ou d'un code d'activité
     * @param {json ou string} obj 
     */
    constructor(obj){
        if(_.isObject(obj)){
            this.setParams(obj);
        } else if(_.isString(obj)){
            this.id = obj;
        }
    }
    /**
     * 
     * @param {Object} obj objet javascript contenant les paramètres d'une activités
     */
    setParams(obj){
        this.id = obj.id||obj.ID;
        this.type = obj.type; // undefined => latex , "text" can include math, with $$ around
        this.figure = obj.figure; // for graphics description
        this.title = obj.title;  // title of de activity
        this.description = obj.description; // long description
        this.vars = obj.vars;
        this.consts = obj.consts;
        this.repeat = obj.repeat||false; // question & answers peuvent être répétées ou pas
        this.options = utils.clone(obj.options)||undefined;
        this.questionPatterns = utils.clone(obj.questionPatterns)||obj.question;
        this.shortQuestionPatterns = utils.clone(obj.shortQuestionPatterns)||obj.shortq||false;
        this.answerPatterns = utils.clone(obj.answerPatterns) || obj.answer;
        this.valuePatterns = utils.clone(obj.valuePatterns) || obj.value;
        this.questions = utils.clone(obj.questions)||[];
        this.audios = utils.clone(obj.audios)||[];
        this.audioQuestionPatterns = utils.clone(obj.audioQuestionPatterns)||obj.audio||false;
        this.audioRead = obj.audioRead||false;// lecture audio si true
        this.audioRepeat = obj.audioRepeat||1;
        this.shortQuestions = utils.clone(obj.shortQuestions)||[];
        this.answers = utils.clone(obj.answers)||[];
        this.samples = utils.clone(obj.samples)||[];// samples of answers, for online answer
        this.values = utils.clone(obj.values)||[];
        this.figures = utils.clone(obj.figures)||[]; // generetad figures paramaters
        this.examplesFigs = {}; // genrated graphics from Class Figure
        this.chosenOptions = utils.clone(obj.chosenOptions)||[]; // options choisies (catégories)
        this.chosenQuestions = utils.clone(obj.chosenQuestions)||{}; // questions parmi les options (sous catégories)
        this.chosenQuestionTypes = utils.clone(obj.chosenQuestionTypes)||[]; // pattern parmi les questions
        this.tempo = utils.clone(obj.tempo) || this.Tempo;
        this.nbq = utils.clone(obj.nbq) || this.nombreQuestions;
        this.getOptionHistory = [];
        this.getPatternHistory = {global:[]};
        this.keys = obj.keys||[];
        this.keyBoards = [];
        this.textSize = obj.textSize||false;
        this.valueType = obj.valueType||false;
    }
    initialize(){
        this.questions = [];
        this.shortQuestions = [];
        this.answers = [];
        this.values = [];
        this.figures = [];
        this.audios = [];
        this.examplesFigs = {};
        this.intVarsHistoric = {};
        this.getOptionHistory = [];
        this.getPatternHistory = {global:[]};
        this.keyBoards = [];
    }
    get nombreQuestions(){
        if(document.getElementById("nbq-slider"))
            return Number(document.getElementById("nbq-slider").value);
        else return 10
    }
    set nombreQuestions(value){
        this.nbq = Number(value);
    }
    get Tempo(){
        if(document.getElementById("tempo-slider"))
            return Number(document.getElementById("tempo-slider").value);
        else return 8; 
    }
    set Tempo(value){
        this.tempo = Number(value);
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
        "~n="+this.nbq+
        (this.audioRead===true?"~au="+this.audioRead+"~ar="+this.audioRepeat:"");
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
        let regexp = /^(\d{1,2}|T|G|K)/;// le fichier commence par un nombre ou un T pour la terminale
        let level = regexp.exec(obj.i)[0];
        let url = "N"+level+"/"+obj.i+".json";
        return library.import(url).then((json)=>{
            let act = new this(json);
            act.chosenOptions = obj.o;
            act.chosenQuestionTypes = obj.p;
            act.chosenQuestions = obj.q;
            act.tempo = obj.t;
            act.nbq = obj.n;
            act.audioRead = (obj.au)?true:false;
            act.audioRepeat = obj.ar?obj.ar:2;
            return [id,act];
        },err=>{utils.debug(err)});
    }
    /**
     * getOption
     * 
     * return uniqueId (Integer)
     * 
     * Si plusieurs options sont disponibles, on va tirer dans les différentes options
     * (qui peuvent avoir été sélectionnées) mélangées pour éviter les répétitions trop suivies
     * Ainsi si les options choisies sont [0,2,5]
     * Les tirages successifs verront se succéder les 3 valeurs avant de les mélanger et
     * de recommencer exemple : [2,0,5] puis [5,2,0] puis [0,5,2]
     * 
     */
    getOption(){
        if(!this.options) return false;
        let ret = 0;
        // si l'historique de piochage est vide, on le remplit des options choisies mélangées
        if(this.getOptionHistory.length === 0){
            if(this.chosenOptions.length === 1){
                this.getOptionHistory = utils.clone(this.chosenOptions);
            } else if(this.chosenOptions.length > 1){
                // on pense à cloner la table, sinon celle-ci est touchée par les manipulations suivantes
                this.getOptionHistory = utils.shuffle(utils.clone(this.chosenOptions));
            } else {
                // Array.from(Array(integer).keys()) créé un tableau [0,1,2,...integer-1]
                this.getOptionHistory = utils.shuffle(Array.from(Array(this.options.length).keys()));
            }
        }
        // on prend la première option de l'historique
        ret = this.getOptionHistory[0];
        // on supprime la première option de l'historique
        this.getOptionHistory.shift();
        return ret;
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
        if(this.title.indexOf("📣")>-1){
            MM.audioSamples = [];
            document.getElementById("voix").classList.remove("hidden")
            if(this.audioRead){
                MM.setAudio(1);
            } else{
                MM.setAudio(0);
            }
        } else {
            document.getElementById("voix").classList.add("hidden")
            this.audioRead = false;
            MM.setAudio(0);
        }
        if(this.description)
            document.getElementById('activityDescription').innerHTML = this.description;
        else
        document.getElementById('activityDescription').innerHTML = "";
        // affichage d'exemple(s)
        let examples = document.getElementById('activityOptions');
        examples.innerHTML = "";
        MM.setSeed(cle);
        if(this.options !== undefined && this.options.length > 0){
            let colors = ['',' red',' orange',' blue', ' green', ' grey',];
            // Ajout de la possibilité de tout cocher ou pas
            let p = utils.create("span",{className:"bold"});
            let hr = utils.create("hr");
            let input = utils.create("input",{type:"checkbox",id:"checkalloptions",className:"checkbox blue",id:"chckallopt"})
            //input.setAttribute("onclick","MM.editedActivity.setOption('all',this.checked)");
            p.appendChild(input);
            p.appendChild(document.createTextNode(" Tout (dé)sélectionner"));
            examples.appendChild(p);
            examples.appendChild(hr);
            let optionsLen = 0;
            // affichage des options
            for(let i=0;i<this.options.length;i++){
                this.generate(1,i,false);// génère un cas par option (si plusieurs)
                if(this.audios.length>0){
                    for(let audio of this.audios){
                        if(audio)
                            MM.audioSamples.push(audio)
                    }
                }
                let p = utils.create("span");
                let input = utils.create("input",{id:"o"+i,type:"checkbox",value:i,defaultChecked:(this.chosenOptions.indexOf(i)>-1)?true:false,className:"checkbox"+colors[i%colors.length]});
                p.appendChild(input);
                p.innerHTML += " "+this.options[i]["name"] + " :";
                let ul = document.createElement("ul");
                if(Array.isArray(this.questions[0])){
                    if(this.figures[0]){
                        let div = utils.create("div");
                        this.examplesFigs[i] = new Figure(utils.clone(this.figures[0]), "fig-ex"+i, div);
                        p.appendChild(div);
                    }
                    for(let jj=0; jj<this.questions[0].length;jj++){
                        optionsLen++;
                        let li = utils.create("li",{className:"tooltip"});
                        let checked = "";
                        if(this.chosenQuestions[i]){
                            if(this.chosenQuestions[i].indexOf(jj)>-1)
                                checked = "checked";
                        }
                        li.innerHTML = "<input class='checkbox"+colors[i%colors.length]+"' type='checkbox' id='o"+i+"-"+jj+"' value='"+i+"-"+jj+"'"+checked+"> "+this.setMath(this.questions[0][jj]);
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
                    let span = utils.create("span",{className:"tooltiptext"});
                    if(Array.isArray(this.answers[0]))
                        span.innerHTML = this.setMath(this.answers[0][0]);
                    else
                        span.innerHTML = this.setMath(this.answers[0]);
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
            if(this.audios.length>0){
                for(let audio of this.audios){
                    if(audio)
                        MM.audioSamples.push(audio)
                }
            }
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
            if(this.getPatternHistory.global.length === 0){
                this.getPatternHistory.global = utils.shuffle(utils.clone(this.chosenQuestionTypes));
            }
            let ret = this.getPatternHistory.global[0];
            this.getPatternHistory.global.shift();
            return ret;
        }
        // no option mais plusieurs pattern possibles
        if(option === false && Array.isArray(this.questionPatterns)){
            if(this.getPatternHistory.global.length === 0){
                this.getPatternHistory.global = utils.shuffle(Array.from(Array(this.questionPatterns.length).keys()));
            }
            let ret = this.getPatternHistory.global[0];
            this.getPatternHistory.global.shift();
            return ret;
        }
        if(option === false)return false;
        // if option, patterns ?
        if(!Array.isArray(this.chosenQuestions[option])){
            this.chosenQuestions[option] = [];
        }
        if(!Array.isArray(this.getPatternHistory[option])){
            this.getPatternHistory[option] = [];
        }
        // no pattern chosen : we choose one
        if(this.chosenQuestions[option].length === 0 && Array.isArray(this.options[option].question)){
            if(this.getPatternHistory[option].length === 0){
                this.getPatternHistory[option] = utils.shuffle(Array.from(Array(this.options[option].question.length).keys()));
            }
            let ret = this.getPatternHistory[option][0];
            this.getPatternHistory[option].shift();
            return ret;
        } else if(this.chosenQuestions[option].length === 0 && !this.options[option].question && Array.isArray(this.questionPatterns)){
            // no question in option, but global question is an array
            if(this.getPatternHistory.global.length === 0){
                this.getPatternHistory.global = utils.shuffle(Array.from(Array(this.questionPatterns.length).keys()));
            }
            let ret = this.getPatternHistory.global[0];
            this.getPatternHistory.global.shift();
            return ret;
        } else if(this.chosenQuestions[option].length > 0){
            // list of patterns chosen, we pick one
            if(this.getPatternHistory[option].length === 0){
                this.getPatternHistory[option] = utils.shuffle(utils.clone(this.chosenQuestions[option]));
            }
            let ret = this.getPatternHistory[option][0];
            this.getPatternHistory[option].shift();
            return ret;
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
        // check or uncheck the allcheckboxes
        let boxes = document.querySelectorAll("#activityOptions input[type=checkbox]");
        let tocheck = true;
        for(const checkbox of boxes){
            if(checkbox.id === "chckallopt")continue;
            if(!checkbox.checked){
                tocheck = false;
                break;
            }
        }
        document.getElementById("chckallopt").checked = tocheck;
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
                utils.debug(error, "Error replacing vars with "+chaine);
            }
            // return number if this is one
            if(!isNaN(result)){
                return parseFloat(result);
            } else return result;
        } else if(typeof chaine === "object"){
            // case 1 : it's an array
            if(_.isArray(chaine)){
                for(let i=0;i<chaine.length;++i){
                    chaine[i] = this.replaceVars(chaine[i],questiontext);
                }
                // case 2 : it's an object
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
        // variables de travail
        this.wVars={};
        let loopProtect = 0, maxLoop = 100;
        // vidage de figures pour éviter les traces.
        this.figures = [];
        // données pour éviter une répétition acharnée des variables entières
        //utils.debug("génération de questions pour "+this.title, n+" questions");
        this.intVarsHistoric = {};
        for(let i=0;i<n;i++){
            this.cFigure = undefined;
            this.ckeyBoard = undefined;
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
                        if(this.options[optionNumber].audio !== undefined){
                            this.cAudio = this.options[optionNumber].audio[patternNumber]||false;
                        }
                    } else { // elle est définie globalement
                        this.cQuestion = this.questionPatterns[patternNumber];
                        this.cShortQ = this.shortQuestionPatterns[patternNumber]||false;
                        this.cAudio = this.audioQuestionPatterns[patternNumber]||false;
                        lenQ = this.questionPatterns.length;
                    }
                } else if(this.options[optionNumber].question === undefined){ // question définie globalement
                    this.cQuestion = this.questionPatterns;
                    this.cShortQ = this.shortQuestionPatterns||false;
                    this.cAudio = this.audioQuestionPatterns||false;
                } else {
                    this.cQuestion = this.options[optionNumber].question; // question définie dans l'option
                    this.cShortQ = this.options[optionNumber].shortq||false;
                    this.cAudio = this.options[optionNumber].audio||false;
                }
                // traitement des réponses
                if(this.options[optionNumber].answer === undefined){ //des réponses sont définies pour l'option
                    this.cAnswer = this.answerPatterns;
                } else this.cAnswer = this.options[optionNumber].answer; // on prend la réponse définie globalement
                // traitement des valeurs attendues de réponse en ligne
                if(this.options[optionNumber].value === undefined){
                    this.cValue = this.valuePatterns?this.valuePatterns:this.cAnswer;
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
                // traitement du clavier (optionnel)
                if(this.options[optionNumber].keys !== undefined){
                    this.ckeyBoard = this.options[optionNumber].keys;
                } else if(this.keys !== undefined){
                    this.ckeyBoard = this.keys;
                }
            } else {
                this.cVars = this.vars;
                this.cConsts = utils.clone(this.consts);
                if(patternNumber!==false){
                    this.cQuestion = this.questionPatterns[patternNumber];
                    this.cShortQ = this.shortQuestionPatterns[patternNumber]||false;
                    this.cAudio = this.audioQuestionPatterns[patternNumber]||false;
                } else {
                    this.cQuestion = this.questionPatterns;
                    this.cShortQ = this.shortQuestionPatterns||false;
                    this.cAudio = this.audioQuestionPatterns||false;
                }
                if(Array.isArray(this.answerPatterns) && this.answerPatterns.length===this.questionPatterns.length){
                    this.cAnswer = this.answerPatterns[patternNumber];
                } else{
                    this.cAnswer = this.answerPatterns;
                }
                this.cValue = this.valuePatterns?this.valuePatterns:this.cAnswer;
                if(this.figure !== undefined){
                    this.cFigure = utils.clone(this.figure);
                }
                if(this.keys !== undefined){
                    this.ckeyBoard = this.keys;
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
                        // on va faire un historique des données et tourner dessus, sous certaines conditions.
                        // pour cela, on va compter le nombre de valeurs entières possibles pour chaque variable.
                        if(this.intVarsHistoric[name] === undefined){
                            let nbValues = Math.abs(Number(bornes[1])-Number(bornes[0]))+1;
                            let max = Math.max(Number(bornes[0]),Number(bornes[1]));
                            let min = Math.min(Number(bornes[0]),Number(bornes[1]));
                            let primes = [];
                            let objContraintes = false;
                            if(bornes[2]){
                                if(bornes[2].indexOf("^")>-1){
                                    objContraintes = bornes[2];
                                }
                            }
                            if(bornes[3]){
                                if(bornes[3].indexOf("^")>-1){
                                    objContraintes = bornes[3];
                                }
                            }
                            if(objContraintes){
                                let liste = objContraintes.substring(1).split(",");
                                // on liste les nombre premiers à éviter
                                if(liste.indexOf("prime")>-1){
                                    for(let i=0;i<math.premiers.length;i++){
                                        if(math.premiers[i]<=max && math.premiers[i]>=min){
                                            primes.push(math.premiers[i]);
                                        } else if(math.premiers[i]>max) {
                                            break;
                                        }
                                    }
                                }
                                nbValues = nbValues - liste.length - primes.length + (liste.indexOf("prime")>-1?1:0)+(liste.indexOf("&")>-1?1:0);
                            }
                            this.intVarsHistoric[name]=[];
                            this.intVarsHistoric[name+"-length"]=nbValues;
                            //utils.debug(name,nbValues);
                        }
                        let entier;
                        // on tire un entier au hasard tant qu'il n'est pas dans l'historique
                        let protectionLoop = 0;
                        do {
                            entier = math.aleaInt(Number(bornes[0]), Number(bornes[1]), bornes[2], bornes[3]);
                            protectionLoop++;
                            if(protectionLoop>100)break;
                        } while (this.intVarsHistoric[name].indexOf(entier)>-1)// l'index 0 est réservé à la taille du tableau
                        // on stocke dans le tableau
                        this.intVarsHistoric[name].push(entier);
                        // si le tableau est plein, on le vide
                        if(this.intVarsHistoric[name].length >= this.intVarsHistoric[name+"-length"]){
                            //utils.debug("reinitialisation",utils.clone(this.intVarsHistoric[name]));
                            this.intVarsHistoric[name].splice(0);
                        }
                        this.wVars[name] = entier;
                    }
                }
            }
            // il peut y avoir des variables utilisées dans les constantes. bizarre, mais pratique
            if(this.cConsts !== undefined){
                this.cConsts = this.replaceVars(this.cConsts);
                // il faut retraiter les wVars au cas où elles contiennent des constantes
                this.wVars = this.replaceVars(this.wVars);
            }
            if(!sample){
            // question text generation
            let thequestion = this.replaceVars(utils.clone(this.cQuestion));
            let theaudio = false;
            let thevalue = this.replaceVars(utils.clone(this.cValue));
            let theshort = false;
            if(this.cShortQ){
                theshort = this.replaceVars(utils.clone(this.cShortQ));
            }
            if(this.cAudio){
                theaudio = this.replaceVars(utils.clone(this.cAudio));
            }
            loopProtect++;
            // on évite les répétitions
            if(this.questions.indexOf(thequestion)<0 || this.values.indexOf(thevalue)<0 || this.repeat){
                // cas d'une répétition autorisée, on va éviter que cela arrive quand même dans les 5 précédents.
                // généralement les VRAI/FAUX, ou 2 réponses possibles seulement.
                if(typeof this.repeat === "number"){
                    // pour les données binaire, on fera attention à ce que cela ne se répète pas trop de fois d'affilée
                    let last2Values = this.values.slice(-this.repeat);
                    let count = 0
                    for(let i=0;i<last2Values.length;i++){
                        if(last2Values[i]===thevalue)count++;
                    }
                    // on a 2 occurences de la valeur, on n'en veut pas 3.
                    if(count>=2){
                        i--;
                        if(loopProtect<maxLoop) // attention à pas tourner en rond
                            continue;
                        else { // on tourne en rond, donc on arrête le script
                            utils.debug("To many loops");
                            break;
                        }
                    }
                    // autres cas de répétitions
                } else if(this.repeat){
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
                            utils.debug("Pas assez de données pour éviter les répétitions");
                            break;
                        }
                    }
                }
                this.questions[i] = thequestion;
                this.shortQuestions[i] = theshort;
                this.audios[i] = theaudio;
                this.answers[i] = this.replaceVars(utils.clone(this.cAnswer), thequestion);
                this.values[i] = thevalue;
                if(this.cFigure!== undefined){
                    this.figures[i] = {
                        "type":this.cFigure.type,
                        "content":this.replaceVars(utils.clone(this.cFigure.content)),
                        "boundingbox":this.cFigure.boundingbox,
                        "axis":this.cFigure.axis,
                        "grid":this.cFigure.grid?true:false,
                        "keepAspect":(this.cFigure.keepAspect!==undefined)?this.cFigure.keepAspect:true
                    };
                }
                if(this.ckeyBoard !== undefined){
                    this.keyBoards[i] = utils.clone(this.ckeyBoard);
                }
            } else {
                i--;
                if(loopProtect<maxLoop) // avoid too many attempts 
                    continue;
                else {
                    utils.debug("Pas assez de données pour éviter les répétitions")
                    break;
                }
            }
        } else {
                this.sample = {
                    question:this.replaceVars(this.cQuestion)
                };
                if(this.cShortQ)this.sample.shortQuestion = this.replaceVars(this.cShortQ);
                this.sample.answer=this.replaceVars(this.cAnswer, this.sample.question);
                this.sample.audio=this.replaceVars(this.cAudio,this.sample.question);
                if(this.cFigure !== undefined){
                    this.sample.figure = {
                        "type":this.cFigure.type,
                        "content":this.replaceVars(this.cFigure.content),
                        "boundingbox":this.cFigure.boundingbox,
                        "axis":this.cFigure.axis,
                        "grid":this.cFigure.grid?true:false,
                        "keepAspect":(this.cFigure.keepAspect!==undefined)?this.cFigure.keepAspect:true
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
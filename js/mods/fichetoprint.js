import utils from "./utils.js";
import MM from "./MM.js";
import Figure from "./figure.js";

export default class ficheToPrint {
    constructor(type,cart,orientation='portrait'){
        this.type = type; // type = exos, interro, ceinture
        this.activities = cart.activities;
        if(orientation ==="portrait")
            this.wsheet = window.open("pagetoprint.html","mywindow","location=no,menubar=no,titlebar=no,width=794");
        else
            this.wsheet = window.open("pagetoprintlandscape.html","mywindow","location=no,menubar=no,titlebar=no,width=1123");
        this.wsheet.onload = function(){MM.fiche.populate()};
        this.nbq = undefined;
        if(this.type === "whogots" && this.activities.length === 1){
            this.nbq = document.getElementById("cardsNbValue").value;
        } else if(this.type === "dominos" && this.activities.length === 1){
            this.nbq = document.getElementById("dominosNbValue").value;
        }
    }
    generateQuestions(){
        // vidage des questions/réponses
        for(let index=0;index<this.activities.length;index++){
            this.activities[index].initialize();
        }
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
        const posCorrection = utils.getRadioChecked("ceintcorrpos"); // fin ou apres
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
        * change la taille des caractères de toutes les colonnes
        */
       function changeAllFontSize(value){
            let elts = document.querySelectorAll(".quest");
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
       /** 
        * Change la couleur du cadre des réponses
        *
        */
       function changeBorder(bool){
        if(bool){
            changeColor(document.getElementById("colorpicker2").value,'bd');
        } else {
            changeColor('none','bd');
        }
       }
       /**
        * Change l'ordre d'une colonne 
        * (Integer) colId : numéro entier de la colonne (commence par 1)
        */
       function changeOrder(colId){
           // on récupère l'ensemble des tableaux
            let tableaux = document.querySelectorAll(".ceinture-content");
            for(let i=0;i<tableaux.length;i++){
                // on récupère les celulles de la colonne choisie:
                let cels = tableaux[i].querySelectorAll(".col"+colId);
                // on crée un tableau des clés de lignes
                let cles = [...Array(cels.length)].map((a,b)=>b+1);
                // on mélange les clés
                cles.sort(()=>Math.random()-0.5);
                // on met les celulles dans l'ordre
                for(let j=0;j<cels.length;j++){
                    cels[j].style["grid-row"]=cles[j];
                }
            }
       }
       /**
        * Affiche ou pas les figures dans la colonne
        * */
       function displayFigures(idcol){
           let btn, elts;
           if(idcol === 'all'){
                btn = document.getElementById('btndisplayfig');
                elts = document.querySelectorAll('.quest');
                idcol = "Toutes";
           } else {
                btn = document.getElementById('btndisplayfig'+idcol);
                elts = document.querySelectorAll('.question'+idcol);
           }
           if(btn.innerHTML === idcol+" on"){
                elts.forEach(el=>{
                    el.classList.add("nofig");
                })
                btn.innerHTML = idcol+" off";
            } else {
                elts.forEach(el=>{
                    el.classList.remove("nofig");
                })
                btn.innerHTML = idcol+" on";
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
        headnoprint.innerHTML += "Tous "+`<input id="fsize" value="12" title="Taille énoncé toutes colonnes" type="number" size="3" min="8" max="16" step="0.5" oninput="changeAllFontSize(this.value)"> `;
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
        headnoprint.innerHTML += `<br>Mélanger la colonne : `;
        for(let i=1;i<=nbcols;i++){
            let bouton = `<button onclick="changeOrder(${i})">${i}</button> `;
            headnoprint.innerHTML += bouton;
        }
        headnoprint.innerHTML += " Figure : ";
        for(let i=1;i<=nbcols;i++){
            let bouton = `<button onclick="displayFigures(${i})" id="btndisplayfig${i}">${i} on</button> `;
            headnoprint.innerHTML += bouton;
        }
        headnoprint.innerHTML += `<button onclick="displayFigures('all')" id="btndisplayfig">Toutes on</button> `;
        this.content.appendChild(headnoprint);
        let correction;
        if(posCorrection === "fin"){
            correction = utils.create("div",{id:"correction",className:"pagebreak"});
            correction.appendChild(utils.create("div",{innerHTML:"Correction"}));
        }
        // on crée autant de ceintures que demandées      
        for(let qty=0;qty<nbCeintures;qty++){
            // un conteneur pour la ceinture
            let ceinture = utils.create("div",{className:"ceinture"});
            // un conteneur pour le corrigé
            let corrige = utils.create("div",{className:"ceintCorrige corrige"});
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
            corrige.appendChild(divColsCorrige);
            if(posCorrection === "fin")
                correction.appendChild(corrige);
            else {
                this.content.appendChild(corrige);
            }
        }
        //this.content.appendChild(utils.create("div",{className:"footer"}));
        // on ajoute la correction à la fin.
        if(posCorrection ==="fin")
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
        function melanger(){
            let content = document.querySelector(".dominos-section");
            // on récupère l'ensemble des dominos 
            let tableau = document.querySelectorAll(".dominos-carte");
            // on crée un tableau des clés de lignes
            let cles = [...Array(tableau.length)].map((a,b)=>b);
            // on mélange les clés
            cles.sort(()=>Math.random()-0.5);
            // on met les celulles dans l'ordre mélangé
            for(let j=0,l=cles.length;j<l;j++){
                content.removeChild(tableau[cles[j]]);
                content.appendChild(tableau[cles[j]]);
            }
        }
        `});
        this.docsheet.head.appendChild(script);
        // set elements :
        let aleaCode = this.create("div",{className:"floatright",innerHTML:"Clé : "+MM.seed});
        this.content.appendChild(aleaCode);
        let input = `<div class="noprint fright"><button onclick="melanger()">Mélanger l'ordre</button> Largeur : 
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
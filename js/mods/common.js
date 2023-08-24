import utils from "./utils.min.js";
import MM from "./MM.min.js";
export {common as default}
const pageOrientations = ["portrait","paysage"]
const pageWidthes = ["794", "1123"]
let pageFormat = 0;
const btnOrientation = document.getElementById("pageOrientation")
if (btnOrientation !== null){
    btnOrientation.onclick = (evt)=>{
        common.changeOrientation(evt)
    }
}
const common = {
    seed:"0000",
    generateQuestions(params){
        // vidage des questions/réponses
        for(let index=0;index<params.cart.activities.length;index++){
            params.cart.activities[index].initialize();
        }
        // generate questions and answers
        if(params.doublons){ // doublons autorisés
            params.errorDouble = false
            for(let index=0;index<params.cart.activities.length;index++){
                const activity = params.cart.activities[index];
                activity.generate();
            }
        } else {
            let answers = []
            params.errorDouble = false
            for(let index=0; index<params.cart.activities.length;index++){
                const activity =  params.cart.activities[index];
                let double = false
                let securite = 100;
                do {
                    activity.generate()
                    let actanswers = []
                    double = false
                    securite--;
                    if(securite<0){params.errorDouble = true;}//console.log(answers,activity.title);break;}
                    // vérification qu'il n'y ait pas de doublon
                    for(let n=0;n<activity.values.length;n++){
                        if(answers.indexOf(activity.values[n])>-1 || actanswers.indexOf(activity.values[n])>-1){
                            double = true;
                            break;
                        } else {
                            actanswers.push(activity.values[n])
                        }
                    }
                    if(!double){
                        for(let n=0;n<activity.values.length;n++){
                            answers.push(activity.values[n])
                        }
                    }
                } while(double && !params.errorDouble)
            }
        }
    },
    changeOrientation(evt){
        // suppression du style de page précédent
        let pagestyle = document.querySelector("head style");
        pagestyle.parentNode.removeChild(pagestyle);
        pagestyle = utils.create("style");
        if(pageFormat===0){
            pagestyle.innerHTML = `@page{
                size:A4 landscape;
                margin:0.8cm;
            }`
            document.body.setAttribute("layout","landscape");
        } else {
            pagestyle.innerHTML = `@page{
                size:A4 portrait;
                margin:0.8cm;
            }`
            document.body.removeAttribute("layout");
        }
        document.head.appendChild(pagestyle);
        evt.target.innerHTML = pageOrientations[pageFormat];
        pageFormat = (pageFormat+1)%2;
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
        if(value !== undefined){
            this.seed = value;
        } else {
            this.seed = this.seedGenerator();
        }
        MM.initializeAlea(this.seed);
        return this.seed;
    },
    checkURL(){
        const vars = utils.getUrlVars();
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
                common.setSeed(vars.a);
            } else {
                common.setSeed();
            }
            // paramètres des activités des paniers
            let json = vars.c;
            // alcarts contient des promises qu'il faut charger
            let allcarts = [];
            for(const i in json){
                carts[i] = new cart(i);
                allcarts.push(MM.carts[i].import(json[i],false));
            }
            // on attend le résultat de toutes les promesses pour mettre à jour les affichages.
            Promise.all(allcarts).then(data=>{
                makePage();
            }).catch(err=>{
                // erreur à l'importation :(
                let alert=utils.create("div",
                {
                    id:"messageerreur",
                    className:"message",
                    innerHTML:"Impossible de charger les paniers :(<br>"+err
                });
                document.getElementById("creator-content").appendChild(alert);
                // on fermet le message d'alerte après 3 secondes
                setTimeout(()=>{
                    let div=document.getElementById('messageerreur');
                    div.parentNode.removeChild(div);
                },3000);
            });
        }
    },
    mathRender: function(all) {
        // search for $$ formulas $$ => span / span
        if(all === undefined){
            const content = document.getElementById("creator-content");
            content.innerHTML = content.innerHTML.replace(/\$\$([^$]*)\$\$/gi, '<span class="math">$1</span>');
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
}
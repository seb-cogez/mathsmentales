import utils from "./utils.js";
import MM from "./MM.js";
import activity from "./activity.js";
export {library as default};
// lecture de la bibliotheque
const library = {
    ordre:{"grille-ecole":["11","10","9","8","7"],"grille-college":["6","5","4","3"],"grille-lycee":["2","G","T"]},
    /**
     * Affiche une activité dans l'onglet de paramètres
     * @param {JSON} json description de l'objet
     */
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
    /**
     * Ouvre un fichier de la library
     * @param {String} url adresse du fichier à ouvrir
     */
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
    /**
     * Récupère les données d'une activité lors d'un import venant du chargement d'un panier préconfiguré.
     * @param {String} url adresse
     * @returns Promesse de chargement du fichier à charger
     */
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
    /**
     * Ouvre le fichier de description de toutes les activités disponibles sur MathsMentales
     */
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
            if(MM.embededIn){
                window.parent.postMessage({url: window.location.href, ready:"ok"}, MM.embededIn);
            }        
        }
        reader.open("get", "library/content.json?v"+MM.version, true);
        reader.send();
    },
    /**
     * Affiche la liste des activités provenant d'une recherche ou d'un niveau à afficher (base=true)
     * @param {String} level Niveau à afficher
     * @param {Boolean} base Niveau de base ou pas
     * @returns 
     */
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
                                let lexo = MM.content[niv].themes[theme].chapitres[chap].e[exo];
                                let chaineATrouver = level.toLowerCase();
                                if(lexo.t.toLowerCase().indexOf(chaineATrouver)>-1){
                                    // we find a candidate !!!
                                    let reg = new RegExp(chaineATrouver,"gi");
                                    chapExo.push({"u":lexo.u,
                                    "t":lexo.t.replace(reg,function(x){return "<mark>"+x+"</mark>"})})
                                } else
                                // recherche dans le code de l'exo
                                if(lexo.u.toLowerCase().indexOf(chaineATrouver+".")>-1){
                                    chapExo.push({"u":lexo.u,"t":lexo.t});
                                } else
                                // recherche dans les descriptifs
                                if(lexo.d !== undefined){
                                    if(lexo.d.toLowerCase().indexOf(chaineATrouver)>-1){
                                        chapExo.push({"u":lexo.u,"t":lexo.t});
                                    }
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
        const eltAffichage = document.getElementById("resultat-chercher");
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
            htmlt += "<h2 class='pointer moins' id='rch2"+i+"'>"+niveau.themes[i].nom+"</h2>";
            eltAffichage.addEventListener("click",(evt)=>{if(evt.target.id === "rch2"+i){utils.deploy(evt.target)}})
            for(let j in niveau["themes"][i]["chapitres"]){
                let chapitre = false;
                let htmlc="";//(first)?"":"<span>";
                htmlc += "<h3 id='rch3"+i+"-"+j+"' class='pointer moins'>"+niveau["themes"][i]["chapitres"][j]["n"]+"</h3>";
                eltAffichage.addEventListener("click",(evt)=>{if(evt.target.id === "rch3"+i+"-"+j){utils.deploy(evt.target)}})
                htmlc += "<ul>";
                let nbexos = niveau["themes"][i]["chapitres"][j]["e"].length;
                if(nbexos){
                    itemsNumber += nbexos;
                    theme=true;chapitre=true;
                    for(let k=0,len=nbexos;k<len;k++){
                        htmlc += "<li id='rcli"+i+"-"+j+"-"+k+"'>"+niveau["themes"][i]["chapitres"][j]["e"][k]["t"]+"</li>";
                        eltAffichage.addEventListener("click",(evt)=>{if(evt.target.id === "rcli"+i+"-"+j+"-"+k){library.load(niveau["themes"][i]["chapitres"][j]["e"][k]["u"])}})
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
        eltAffichage.innerHTML = html;
        let target = document.getElementById("tab-chercher");
        target.className = "tabs-content-item";
        // Nombre de colonnes en fonction du contenu
        if(itemsNumber > 40 && utils.pageWidth()>1000) utils.addClass(target,"cols3");
        else if(itemsNumber > 20 && utils.pageWidth()>840) utils.addClass(target, "cols2");
        document.querySelector("#header-menu a[numero='#tab-chercher']").click();
    }
}
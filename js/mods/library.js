import utils from "./utils.min.js";
import content from "./content.js";
//import theactivities from "./theactivities.js";
import MM from "./MM.min.js";
import activity from "./activity.min.js";

export {library as default};
// lecture de la bibliotheque
const library = {
    ordre:{"grille-ecole":["11","10","9","8","7"],"grille-college":["6","5","4","3"],"grille-lycee":["2","G","K","T"]},
    /**
     * Affiche une activité dans l'onglet de paramètres
     * @param {JSON} json description de l'objet
     */
    open:function(json){
        let obj = new activity(json);
        MM.editedActivity = obj;
        // show tab-content
        let tab = document.querySelector("a[numero$='parameters'].tabs-menu-link");
        MM.resetAllTabs();
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
    load:function(url,id){
        // pour le développement, on peut lire une activité qui n'a pas encore été intégrée dans la bibliothèque
        // en fournissant ?u=id de l'activité.
        fetch("library/"+url+"?v"+MM.version)
            .then(r => r.json())
            .then(body => {
                let regexp = /\/(.*)\./;
                url = regexp.exec(url)[1];
                MM.setHistory("Exercice","u="+url);
                this.open(body)
        })  .catch(e => console.log)
    },
    /**
     * 
     * @param {String} url url du json à récupérer
     */
    loadJSON:async function(url){
        const r = await fetch("library/"+url+"?v"+MM.version)
        if (r.ok === true) return r.json()
        throw new Error('Erreur de chargement de l\'activité')
    },
    /**
     * Récupère les données d'une activité lors d'un import venant du chargement d'un panier préconfiguré.
     * @param {String} url adresse
     * @returns Promesse de chargement du fichier à charger
     */
    import:async function(url){
        const r = await fetch("library/"+url+"?v"+MM.version)
        if(r.ok === true) return r.json()
        throw new Error('Problème de chargement de l\'activité')
    },
    /**
     * Ouvre le fichier de description de toutes les activités disponibles sur MathsMentales
     */
    openContents:function(){
        /*let reader = new XMLHttpRequest();
        reader.onload = function(){
            MM.content = JSON.parse(reader.responseText);
            // remplissage de la grille d'accueil
            MM.createTuiles();
            // création des tuiles des niveaux
            MM.createSearchCheckboxes();
            // check if parameters from URL
            MM.checkURL();
            if(MM.embededIn){
                window.parent.postMessage({url: window.location.href, ready:"ok"}, MM.embededIn);
            }        
        }
        reader.open("get", "library/content.json?v"+MM.version, true);
        reader.send();*/
        MM.content = content;
            // remplissage de la grille d'accueil
        MM.createTuiles();
        // création des tuiles des niveaux
        MM.createSearchCheckboxes();
        // check if parameters from URL
        MM.checkURL();
        if(MM.embededIn){
            window.parent.postMessage({url: window.location.href, ready:"ok"}, MM.embededIn);
        }        
    },
    /**
     * Affiche la liste des activités provenant d'une recherche ou d'un niveau à afficher (base=true)
     * @param {String} level Niveau à afficher
     * @param {Boolean} base Niveau de base ou pas
     * @returns 
     */
    displayContent:function(level,base=false){
        let now = new Date().getTime(); // date du jour, pour afficher les mises à jour récentes
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
            let chaineATrouver = level.toLowerCase().split(" ");
            for(let niv in MM.content){
                // on ne cherche que dans les niveaux sélectionnés. Si pas de niveau sélectionné, on prend tout.
                if(selectedLevels.length > 0 && selectedLevels.indexOf(niv)<0) continue;
                if(_.isObject(MM.content[niv])){ // le niveau contient de chapitres
                    for(let theme in MM.content[niv].themes){
                        for(let chap in MM.content[niv].themes[theme].chapitres){
                            let chapExo=[];
                            for(let exo=0,lene=MM.content[niv].themes[theme].chapitres[chap].e.length;exo<lene;exo++){
                                let lexo = MM.content[niv].themes[theme].chapitres[chap].e[exo];
                                let tt = lexo.t;
                                // on prend les différents éléments
                                if(chaineATrouver.every(txt=>{
                                    return lexo.t.toLowerCase().indexOf(txt)>-1;
                                })){
                                    // we find a candidate !!!
                                    chaineATrouver.forEach(txt =>{
                                        let reg = new RegExp(txt,"gi");
                                        tt = tt.replace(reg,function(x){return '<mark data-url="'+lexo.u+'" data-id="'+lexo.id+'" id="rcli'+theme+'-'+chap+'-mark">'+x+'</mark>'})
                                    })
                                    chapExo.push({"u":lexo.u, "t":tt, id:lexo.id})
                                } else
                                // recherche dans le code de l'exo
                                if(chaineATrouver.every(txt=>{
                                    return lexo.u.toLowerCase().indexOf(txt+".")>-1
                                })){
                                    chapExo.push({"u":lexo.u,"t":lexo.t, id:lexo.id});
                                } else
                                // recherche dans les descriptifs
                                if(lexo.d !== undefined){
                                    if(chaineATrouver.every(txt=>{
                                        return lexo.d.toLowerCase().indexOf(txt)>-1
                                    })){
                                        chapExo.push({"u":lexo.u,"t":lexo.t, id:lexo.id});
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
            MM.setHistory(niveau["nom"],"n="+level);
        // Affichage et mise en forme des données.
        let itemsNumber = 0;
        for(let i in niveau["themes"]){
            //let first = true;
            let theme = false;
            let htmlt = "";//(first)?"<span>":"";
            htmlt += "<h2 class='pointer moins' id='rch2"+i+"'>"+niveau.themes[i].nom+"</h2>";
            for(let j in niveau["themes"][i]["chapitres"]){
                let chapitre = false;
                let htmlc="";//(first)?"":"<span>";
                htmlc += "<h3 id='rch3"+i+"-"+j+"' class='pointer moins'>"+niveau["themes"][i]["chapitres"][j]["n"]+"</h3>";
                htmlc += "<ul>";
                let nbexos = niveau["themes"][i]["chapitres"][j]["e"].length;
                if(nbexos){
                    itemsNumber += nbexos;
                    theme=true;chapitre=true;
                    for(let k=0,len=nbexos;k<len;k++){
                        let id = niveau["themes"][i]["chapitres"][j]["e"][k].id;
                        let title = niveau["themes"][i]["chapitres"][j]["e"][k]["t"];
                        let url = niveau["themes"][i]["chapitres"][j]["e"][k]["u"];
                        if(niveau["themes"][i]["chapitres"][j]["e"][k]["new"]){
                            htmlc += "<li id='rcli"+i+"-"+j+"-"+k+"' class='new tooltip' data-id='"+id+"' data-url='"+url+"'><input type='checkbox' class='checkitem' value='"+id+"' data-url='"+url+"'>"+title+"<div class='tooltiptext'>"+id+"</div></li>";
                        } else {
                            htmlc += "<li id='rcli"+i+"-"+j+"-"+k+"' class='tooltip' data-id='"+id+"' data-url='"+url+"'><input type='checkbox' class='checkitem' value='"+id+"' data-url='"+url+"'>"+title+"<div class='tooltiptext'>"+id+"</div></li>";
                        }
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
"use strict"

import protos from './mods/protos.min.js';
import utils from './mods/utils.min.js';
// MathsMentales core
import MM from "./mods/MM.min.js";
import library from './mods/library.min.js';
import sound from './mods/sound.min.js';
import Zoom from './mods/zoom.min.js';
import speech from './mods/speech.min.js';
import math from './mods/math.js';
//import theactivities from './mods/theactivities.js';
window.onload = function(){
    let scripturl = document.getElementById("mmscriptid").attributes.src.value;
    /*get value from query parameters*/
    MM.version = scripturl.replace(/\|/g,'/').slice(scripturl.indexOf('?') + 3);
    // detect if touching interface
    let listener = function(evt){
        // the user touched the screen!
        MM.touched = true;
        window.removeEventListener('touchstart',listener,false);
    }
    window.addEventListener('touchstart',listener,false);
    // for ascii notations, used by math parser
    //MM.ascii2tex = new AsciiMathParser();
    MM.resetCarts();
    // interface
    let tabsButtons = document.querySelectorAll("#header-menu .tabs-menu-link");
    tabsButtons.forEach(element => {
        element.onclick = function(){MM.showTab(element)};
    });
    document.getElementById("btnaccueil").onclick = function(element){
        MM.showTab(element.target);
    }
    MM.checkValues();
    MM.initializeAlea(Date());
    library.openContents();
    sound.getPlayer();
    // put the good default selected
    document.getElementById("chooseParamType").value = "paramsdiapo";
    // to show de good checked display
    MM.setDispositionEnonce(utils.getRadioChecked("Enonces"));
    // take history if present
    if(window.localStorage){
        if(localStorage.getItem("history"))
            document.querySelector("#tab-historique ol").innerHTML = localStorage.getItem("history").replace(/onclick="utils\.checkurl\(this.dataset\['url'\]\,false\,true\)"/gi,"");
    }
    MM.zoom = new Zoom("thezoom","#slideshow .slide");
    document.querySelector("#slideshow-container header").appendChild(MM.zoom.createCursor());
    // ajout des pickers de colors
    for(let i=0;i<4;i++){
        let leparent = document.getElementById("sddiv"+(i+1));
        MM.colorSelectors[i] = new Picker({parent:leparent,color:'#FFFFFF'});
        MM.colorSelectors[i].onChange = function(color){
            leparent.style.background = color.rgbaString;
            MM.colors[i] = color.rgbaString;
        }
    }
    document.querySelector("input[name='online'][value='no']").checked = true;
    // events sur les boutons
    // menus
    const lis = document.querySelectorAll("#nav-menu-niveaux li li");
    for(const li of lis){
        li.onclick = (evt)=>{library.displayContent(evt.target.dataset.niv,true)};
    }
    // ouvrons l'interface des paniers pour que tout le monde sache qu'il y en a !
    MM.showCartInterface();
    // boutons de gestion d'activité dans le panier
    document.getElementById("addToCart").onclick = ()=>{MM.addToCart();};
    document.getElementById("unlinkCart").onclick = ()=>{MM.unlinkActivity();};
    document.getElementById("removeFromCart").onclick = ()=>{MM.removeFromCart()};
    document.getElementById("tempo-slider").oninput = (evt)=>{if(evt.target.value<2)evt.target.value=0;MM.changeTempoValue(evt.target.value);};
    document.getElementById("tempo-slider").onchange=()=>{MM.carts[MM.selectedCart].display();};
    document.getElementById("nbq-slider").oninput = (evt)=>{MM.changeNbqValue(evt.target.value);};
    document.getElementById("nbq-slider").onchange = ()=>{MM.carts[MM.selectedCart].display();};
    // radio orientation séparation
    document.getElementById("radiodir1").onclick = ()=>{MM.setDispositionDoubleEnonce('h');};
    document.getElementById("radiodir2").onclick = ()=>{MM.setDispositionDoubleEnonce('v');};
    // radio intro diaporama
    document.getElementById("radiobeforeslider1").onclick = (evt)=>{MM.setIntroType(evt.target.value);};
    document.getElementById("radiobeforeslider2").onclick = (evt)=>{MM.setIntroType(evt.target.value);};
    document.getElementById("radiobeforeslider3").onclick = (evt)=>{MM.setIntroType(evt.target.value);};
    document.getElementById("playerlist").oninput = (evt)=>{sound.select(evt.target.value)};
    // panier 1
    document.getElementById("btncartclose1").onclick=()=>{MM.emptyCart(1)};
    document.getElementById("titlecart1").onblur = (evt)=>{MM.carts[0].title = evt.target.innerText}
    document.getElementById("imgordercart1").onclick = (evt)=>{MM.carts[0].changeOrder(evt.target)}
    document.getElementById("progress-cart1").onclick = (evt)=>{MM.carts[0].changeProgress(evt.target)}
    document.getElementById("imgduplicatecart1").onclick = ()=>{MM.carts[0].duplicate();};
    // panier 2
    document.getElementById("btncartdelete2").onclick=()=>{MM.removeCart(2)}
    document.getElementById("btncartclose2").onclick=()=>{MM.emptyCart(2)}
    document.getElementById("titlecart2").onblur = (evt)=>{MM.carts[1].title = evt.target.innerText}
    document.getElementById("imgordercart2").onclick = (evt)=>{MM.carts[1].changeOrder(evt.target)}
    document.getElementById("progress-cart2").onclick = (evt)=>{MM.carts[1].changeProgress(evt.target)}
    document.getElementById("imgduplicatecart2").onclick = ()=>{MM.carts[1].duplicate()}
    // panier 3
    document.getElementById("btncartdelete3").onclick=()=>{MM.removeCart(3)};
    document.getElementById("btncartclose3").onclick=()=>{MM.emptyCart(3)};
    document.getElementById("titlecart3").onblur = (evt)=>{MM.carts[2].title = evt.target.innerText}
    document.getElementById("imgordercart3").onclick = (evt)=>{MM.carts[2].changeOrder(evt.target)}
    document.getElementById("progress-cart3").onclick = (evt)=>{MM.carts[2].changeProgress(evt.target)}
    document.getElementById("imgduplicatecart3").onclick = ()=>{MM.carts[2].duplicate();};
    // panier 4
    document.getElementById("btncartdelete4").onclick=()=>{MM.removeCart(4)};
    document.getElementById("btncartclose4").onclick=()=>{MM.emptyCart(4)};
    document.getElementById("titlecart4").onblur = (evt)=>{MM.carts[3].title = evt.target.innerText;};
    document.getElementById("progress-cart4").onclick = (evt)=>{MM.carts[3].changeProgress(evt.target);};
    document.getElementById("imgordercart4").onclick = (evt)=>{MM.carts[3].changeOrder(evt.target);};
    // radio online
    document.getElementById("radioonline1").onclick = (evt)=>{MM.setOnlineState(evt.target.value)};
    document.getElementById("radioonline2").onclick = (evt)=>{MM.setOnlineState(evt.target.value)};
    // radio nb d'énoncés
    document.getElementById("radionbenonces1").onclick = ()=>{MM.setDispositionEnonce(1);};
    document.getElementById("radionbenonces2").onclick = ()=>{MM.setDispositionEnonce(2);};
    document.getElementById("radionbenonces3").onclick = ()=>{MM.setDispositionEnonce(3);};
    document.getElementById("radionbenonces4").onclick = ()=>{MM.setDispositionEnonce(4);};
    // radio face to face
    document.getElementById("radioftf1").onclick = ()=>{MM.setFacetoFace('n');};
    document.getElementById("radioftf2").onclick = ()=>{MM.setFacetoFace('y');};
    // radio fin de diaporama
    document.getElementById("radioendslider1").onclick = (evt)=>{MM.setEndType(evt.target.value)};
    document.getElementById("radioendslider2").onclick = (evt)=>{MM.setEndType(evt.target.value)};
    document.getElementById("radioendslider3").onclick = (evt)=>{MM.setEndType(evt.target.value)};
    // radio audio
    MM.speech = new speech()
    if(MM.speech.exists){
        document.getElementById("radioaudioon").onclick = (evt)=>{MM.setAudio(evt.target.value)};
        document.getElementById("radioaudiooff").onclick = (evt)=>{MM.setAudio(evt.target.value)};
        document.getElementById("audiorepeat").oninput = (evt)=>{MM.setAudioRepetitions(evt.target.value)}
        let select = document.getElementById("selectVoice");
        if(!MM.speech.generateSelectOptions(select)){
            // création d'un bouton de génération car obligation d'interagir avec le navigateur pour générer
            let button = utils.create("button",{innerHTML:'🎶', title:'Cliquer pour détecter les langues disponibles'})
            button.onclick = (evt)=>{
                MM.speech.generateSelectOptions(select)
                evt.target.parentNode.removeChild(evt.target)
            }
            document.getElementById("voix").appendChild(button)
        }
        select.onchange = (ev)=>{
            MM.speech.setVoice(ev.target.value);
            MM.audioSamples.forEach(val=>{
                MM.speech.speak(val,false)
            })
        }
        document.getElementById("btntestreader").onclick = ()=>{
            if(!select.hasChildNodes()){
                MM.speech.initialize();
                MM.speech
            }
            MM.audioSamples.forEach(val=>{
                MM.speech.speak(val,false)
            })
        }
        document.getElementById("btnstopreader").onclick = ()=>{
            MM.speech.stop();
        }
    }
    // boutons démarrage
    document.getElementById("btnstart").onclick = ()=>{MM.start();};
    document.getElementById("btnenonces").onclick = ()=>{MM.showQuestions();};
    document.getElementById("btnreponses").onclick = ()=>{MM.showAnswers();};
    document.getElementById("btnadresse").onclick = ()=>{MM.copyURL();};
    document.getElementById("btncopytohistoric").onclick = ()=>{MM.copyURLtoHistory()};
    // bouton d'inclusion de la variable aléatoire
    document.getElementById("aleaInURL").onchange = ()=>{MM.setSeed("checkSwitched")}
    // boutons génération documents
    document.getElementById("chooseParamType").onchange = (evt)=>{MM.showParameters(evt.target.value)}
    // fiche d'exercices
    document.getElementById("btngeneratesheet").onclick = ()=>{MM.createExercicesSheet()}
    document.getElementById("btn-ex-adresse").onclick = ()=>{MM.copyURL('exosheet');};
    document.getElementById("btn-ex-copytohistoric").onclick = ()=>{MM.copyURLtoHistory('exosheet')};
    document.getElementById("extitle").oninput = (evt)=>{MM.carts[0].title = evt.target.value}
    // interros
    document.getElementById("btngenerateexams").onclick = ()=>{MM.createExamSheet()}
    document.getElementById("btn-exam-adresse").onclick = ()=>{MM.copyURL('exam')}
    document.getElementById("btn-exam-copytohistoric").onclick = ()=>{MM.copyURLtoHistory('exam')}
    document.getElementById("inttitle").oninput = (evt)=>{MM.carts[0].title = evt.target.value}
    // ceintures
    document.getElementById("ceintcolsval").oninput = (evt)=>{document.getElementById('ceintcols').innerHTML=evt.target.value;utils.createCeintureTitres(evt.target.value)}
    document.getElementById("ceintrowsval").oninput = (evt)=>{document.getElementById('ceintrows').innerHTML=evt.target.value}
    document.getElementById("ceintqtyvalue").oninput = (evt)=>{document.getElementById('ceintqty').innerHTML=evt.target.value;}
    document.getElementById("btngenerateceinture").onclick = ()=>{MM.createCeintureSheet()}
    document.getElementById("btn-ceinture-adresse").onclick = ()=>{MM.copyURL('ceinture');};
    document.getElementById("btn-ceinture-copytohistoric").onclick = ()=>{MM.copyURLtoHistory('ceinture')};
    document.getElementById("ceinttitle").oninput = (evt)=>{MM.carts[0].title = evt.target.value}
    // course au nombres
    document.getElementById("canqtyvalue").oninput = (evt)=>{document.getElementById('canqty').innerHTML=evt.target.value;}
    document.getElementById("btn-can-adresse").onclick = ()=>{MM.copyURL('cansheet');};
    document.getElementById("btn-can-copytohistoric").onclick = ()=>{MM.copyURLtoHistory('cansheet')};
    document.getElementById("btngenerateCAN").onclick = ()=>{MM.createCourseAuxNombres()}
    document.getElementById("cantitle").oninput = (evt)=>{MM.carts[0].title = evt.target.value}
    // flash cards
    document.getElementById("btngenerateFC").onclick = ()=>{MM.createFlashCards()}
    document.getElementById("cardsNbValue").oninput = (evt)=>{document.getElementById('cardsNb').innerHTML=evt.target.value;}
    document.getElementById("btn-flash-adresse").onclick = ()=>{MM.copyURL('cartesflash');};
    document.getElementById("btn-flash-copytohistoric").onclick = ()=>{MM.copyURLtoHistory('cartesflash')};
    // Panneau d'activités
    document.getElementById("btngenerateWall").onclick = ()=>{MM.createWall()}
    document.getElementById("btn-wall-adresse").onclick = ()=>{MM.copyURL('wall');};
    document.getElementById("btn-wall-copytohistoric").onclick = ()=>{MM.copyURLtoHistory('wall')};

    // j'ai / qui a ?
    document.getElementById("btngenerateWG").onclick = ()=>{MM.createWhoGots()}
    // dominos
    document.getElementById("dominosNbValue").oninput = (evt)=>{document.getElementById('dominosNb').innerHTML=evt.target.value;}
    document.getElementById("dominosDoublons").onclick = (evt)=>{let text = document.getElementById("dominosDoublonsText"); if(evt.target.checked)text.innerHTML="Oui"; else text.innerHTML = "Non"}
    document.getElementById("dominosDoublons").checked = true;
    document.getElementById("btngenerateDominos").onclick = ()=>{MM.createDominos()}
    // duels
    document.getElementById("btn-duel-start").onclick = ()=>{MM.duelLaunch();};
    document.getElementById("btn-duel-adresse").onclick = ()=>{MM.copyURL('duel');};
    document.getElementById("btn-duel-copytohistoric").onclick = ()=>{MM.copyURLtoHistory('duel')};
    document.getElementById("duelbackgroundselect").onchange = (evt)=>{document.getElementById("duelbg").style.backgroundImage = "url('./library/illustrations/backgrounds/bg"+evt.target.value+".jpg')"}
    document.getElementById("duelbg").style.backgroundImage = "url('./library/illustrations/backgrounds/bg"+utils.getSelectValue("duelbackgroundselect")+".jpg')"
    // boutons d'exemples
    document.getElementById("btn-annotation2").addEventListener("click", (evt)=>{
        let target = utils.getTargetWithImageInside(evt);
        MM.annotateThisThing('divparams', target.id)
    });
    document.getElementById("btn-shuffle").onclick = ()=>{MM.editedActivity.display('sample')}
    // boutons section énoncés
    document.getElementById("btn-annotation-enonce").onclick = (evt)=>{
        let target = utils.getTargetWithImageInside(evt);
        MM.annotateThisThing('enonce-content', target.id);
    }
    // zooms
    document.getElementById("enonce-content").onclick = (evt)=>{
        if(evt.target.dataset.what === "in"){
            MM.zooms[evt.target.dataset.zoom].plus();
        } else if(evt.target.dataset.what === "out"){
            MM.zooms[evt.target.dataset.zoom].minus();
        }
    }
    document.getElementById("corrige-content").onclick = (evt)=>{
        if(evt.target.dataset.what === "in"){
            MM.zooms[evt.target.dataset.zoom].plus();
        } else if(evt.target.dataset.what === "out"){
            MM.zooms[evt.target.dataset.zoom].minus();
        }
    }
    // boutons de commande 
    document.getElementById("slideshow").addEventListener("click",(evt)=>{
        let targetId = evt.target.id;
        //zooms
        if(evt.target.dataset.what === "in"){
            MM.zooms[evt.target.dataset.zoom].plus();
            if(evt.target.dataset.assoc !== ''){
                MM.zooms[evt.target.dataset.assoc].plus();
            }
        } else if(evt.target.dataset.what === "out"){
            MM.zooms[evt.target.dataset.zoom].minus();
            if(evt.target.dataset.assoc !== ''){
                MM.zooms[evt.target.dataset.assoc].minus();
            }
        }
        if(evt.target.nodeName.toLowerCase() === "img"){
            targetId = evt.target.parentNode.id;
        }
        for(let i=0;i<4;i++){
            switch (targetId){
                case "ButtonNextAct"+i:
                    MM.newSample(i,true);
                    break;
                case "btn-sample-annotate"+i:
                    MM.annotateThisThing('sampleSlide'+i,targetId);
                    break;
                case "btn-sample-showanswer"+i:
                    MM.showSampleAnswer(i);
                    break;
                case "btn-newsample"+i:
                    MM.newSample(i);
                    break;
                case "btn-sample-start"+i:
                    MM.startSlideShow(i);
                    break;
                case "btn-timer-end"+i:
                    MM.timers[i].end();
                    break;
                case "btn-timer-pause"+i:
                    MM.timers[i].pause();
                    break;
                case "btn-show-answer"+i:
                    MM.showTheAnswer(i);
                    break;
                case "btn-next-slide"+i:
                    MM.nextSlide(i);
                    break;
                default:
                    break;
            }    
        }
    })

    // boutons section corrigés
    document.querySelector("#tab-corrige aside").addEventListener("click",(evt)=>{
        let target = utils.getTargetWithImageInside(evt);
        switch (target.id){
            case "btn-annotation-corrige":
                MM.annotateThisThing('corrige-content', target.id)
                break
            case "btn-restart-otherdata":
                MM.start()
                break
            case "btn-restart-samedata":
                // the true value force to restart with same datas
                MM.start(true)
                break
            default:
                break
        }
    })
    // boutons section historique
    document.querySelector("#tab-historique header").addEventListener("click",(evt)=>{
        switch (evt.target.id){
            case "btnemptyhist":
                MM.emptyHistory()
                break
            case "btnSelectHist":
                MM.createSelectHistory()
                break
            case "btnsupprselhist":
                MM.removeSelectionFromHistory()
                break
            default:
                break
        }
    })
    // boutons commandes générales
    document.querySelector("#slideshow-container header").onclick = (evt)=>{
        switch (evt.target.parentNode.id) {
            case "stop-all":
                MM.stopAllSliders();
                break;
            case "pause-all":
                MM.pauseAllSliders();
                break;
            case "next-all":
                MM.nextAllSliders();
                break;
            default:
                break;
        }
        switch (evt.target.dataset.what){
            case "in":
                MM.zooms[evt.target.dataset.zoom].plus();
                break;
            case "out":
                MM.zooms[evt.target.dataset.zoom].minus();
                break;
            default:
                break;
        }

    }
    // moteur de recherche d'activité
    document.getElementById("searchinput").onkeyup = (evt)=>{library.displayContent(evt.target.value)};
    document.getElementById("resultat-chercher").addEventListener("click",(evt)=>{
        if(evt.target.id.indexOf("rch2")===0){
            utils.deploy(evt.target);
        } else if(evt.target.id.indexOf("rch3")===0){
            utils.deploy(evt.target);
        } else if(evt.target.id.indexOf("rcli")===0){
            // clic sur une activite
            library.load(evt.target.dataset['url'],evt.target.dataset['id']);
        }
    })
    // bouton d'ajout au panier
    document.getElementById("btn-addToCart").onclick = ()=>{
        let selection = document.querySelectorAll("#resultat-chercher .checkitem:checked");
        if(selection.length > 0){
            let allActivities = [];
            let nbq = Number(document.getElementById("addToCartNbq").value);
            selection.forEach(el=>{
                //MM.carts[0].addActivity(theactivities[el.value],nbq);
                allActivities.push(library.loadJSON(el.dataset["url"]))
            })
            Promise.all(allActivities).then(data=>{
                data.forEach(val=>{
                    MM.carts[0].addActivity(val,nbq);
                })
                let tab = document.querySelector("a[numero$='parameters'].tabs-menu-link");
                MM.resetAllTabs();
                utils.addClass(tab, "is-active");
                document.getElementById("tab-parameters").style.display = "";
                }).catch(err=>{
                console.log(err)
            })
        } else {
            console.log("Pas d'activité à ajouter au panier")
        }
    }
    // boutons aléatorisation
    document.getElementById("btn-params-aleakey").onclick = ()=>{MM.setSeed(utils.seedGenerator())};

    /**
     * Comportements sur les éléments fixes
     */
    // Suppression comportement avant modularisation  
    document.querySelector("#tab-historique ol").addEventListener("click",(evt)=>{
        if(evt.target.innerHTML.indexOf("🛠 éditer")>-1){
            MM.checkURL(evt.target.dataset['url'],false,true)
        } else if(evt.target.innerHTML.indexOf("❌ Supprimer")>-1){
            MM.removeFromHistory(evt.target.parentNode);
        }
    })
    document.getElementById("corrige-content").addEventListener("click",(evt)=>{
        if(evt.target.innerHTML === "Figure"){
            MM.memory[evt.target.dataset.id].toggle();
        }
    })
    // évènements sur les activités dans les paniers
    for(let i=0;i<4;i++){
        document.getElementById("cart"+i+"-list").addEventListener("click",(evt)=>{
            if(evt.target.dataset.actid !== undefined){
                MM.editActivity(evt.target.dataset.actid);
            } else if(evt.target.dataset.actidtoremove !== undefined){
                MM.removeFromCart(evt.target.dataset.actidtoremove)
            }
        })    
    }
    /**
     * boutons paniers, images contenues dans des button
     */
    document.getElementById("cartsMenu").addEventListener("click",(evt)=>{
        let target = utils.getTargetWithImageInside(evt);
        if(target.value){
            MM.showCart(target.value);
        } else if(target.id==="addcart"){
            MM.addCart();
        }
    })
    /**
     * cases à cocher dans le choix des options d'une activité
     */
    document.getElementById('activityOptions').addEventListener("click",(evt)=>{
        if(evt.target.id==="chckallopt")
            {MM.editedActivity.setOption('all',evt.target.checked)
        } else if(evt.target.id.indexOf("o")===0){
            MM.editedActivity.setOption(evt.target.value, evt.target.checked)
        }
    })

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
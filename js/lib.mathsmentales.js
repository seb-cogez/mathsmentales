"use strict"

import protos from './mods/protos.js';
import utils from './mods/utils.js';
// MathsMentales core
import MM from "./mods/MM.js";
import library from './mods/library.js';
import sound from './mods/sound.js';
import Zoom from './mods/zoom.js';
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
        element.onclick = function(){utils.showTab(element)};
    });
    document.getElementById("btnaccueil").onclick = function(element){
        utils.showTab(element.target);
    }
    utils.checkValues();
    utils.initializeAlea(Date());
    library.openContents();
    sound.getPlayer();
    // put the good default selected
    document.getElementById("chooseParamType").value = "paramsdiapo";
    // to show de good checked display
    MM.setDispositionEnonce(utils.getRadioChecked("Enonces"));
    // take history if present
    if(window.localStorage){
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
    // boutons de gestion d'activité dans le panier
    document.getElementById("addToCart").onclick = ()=>{MM.addToCart();};
    document.getElementById("unlinkCart").onclick = ()=>{MM.unlinkActivity();};
    document.getElementById("removeFromCart").onclick = ()=>{MM.removeFromCart()};
    document.getElementById("tempo-slider").oninput = (evt)=>{utils.changeTempoValue(evt.target.value);};
    document.getElementById("tempo-slider").onchange=()=>{MM.carts[MM.selectedCart].display();};
    document.getElementById("nbq-slider").oninput = (evt)=>{utils.changeNbqValue(evt.target.value);};
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
    document.getElementById("titlecart1").onblur = (evt)=>{MM.carts[0].title = evt.target.innerText;};
    document.getElementById("imgordercart1").onclick = (evt)=>{MM.carts[0].changeOrder(evt.target);};
    document.getElementById("imgduplicatecart1").onclick = ()=>{MM.carts[0].duplicate();};
    // panier 2
    document.getElementById("btncartdelete2").onclick=()=>{MM.removeCart(2)};
    document.getElementById("btncartclose2").onclick=()=>{MM.emptyCart(2)};
    document.getElementById("titlecart2").onblur = (evt)=>{MM.carts[1].title = evt.target.innerText;};
    document.getElementById("imgordercart2").onclick = (evt)=>{MM.carts[1].changeOrder(evt.target);};
    document.getElementById("imgduplicatecart2").onclick = ()=>{MM.carts[1].duplicate();};
    // panier 3
    document.getElementById("btncartdelete3").onclick=()=>{MM.removeCart(3)};
    document.getElementById("btncartclose3").onclick=()=>{MM.emptyCart(3)};
    document.getElementById("titlecart3").onblur = (evt)=>{MM.carts[2].title = evt.target.innerText;};
    document.getElementById("imgordercart3").onclick = (evt)=>{MM.carts[2].changeOrder(evt.target);};
    document.getElementById("imgduplicatecart3").onclick = ()=>{MM.carts[2].duplicate();};
    // panier 4
    document.getElementById("btncartdelete4").onclick=()=>{MM.removeCart(4)};
    document.getElementById("btncartclose4").onclick=()=>{MM.emptyCart(4)};
    document.getElementById("titlecart4").onblur = (evt)=>{MM.carts[3].title = evt.target.innerText;};
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
    // boutons démarrage
    document.getElementById("btnstart").onclick = ()=>{MM.start();};
    document.getElementById("btnenonces").onclick = ()=>{MM.showQuestions();};
    document.getElementById("btnreponses").onclick = ()=>{MM.showAnswers();};
    document.getElementById("btnadresse").onclick = ()=>{MM.copyURL();};
    document.getElementById("btncopytohistoric").onclick = ()=>{MM.copyURLtoHistory()};
    // boutons génération documents
    document.getElementById("chooseParamType").onchange = (evt)=>{utils.showParameters(evt.target.value)}
    // fiche d'exercices
    document.getElementById("btngeneratesheet").onclick = ()=>{MM.createExercicesSheet()}
    document.getElementById("btn-ex-adresse").onclick = ()=>{MM.copyURL('exosheet');};
    document.getElementById("btn-ex-copytohistoric").onclick = ()=>{MM.copyURLtoHistory('exosheet')};

    document.getElementById("btngenerateexams").onclick = ()=>{MM.createExamSheet()}
    document.getElementById("ceintcolsval").oninput = (evt)=>{document.getElementById('ceintcols').innerHTML=evt.target.value;utils.createCeintureTitres(evt.target.value)}
    document.getElementById("ceintrowsval").oninput = (evt)=>{document.getElementById('ceintrows').innerHTML=evt.target.value}
    document.getElementById("ceintqtyvalue").oninput = (evt)=>{document.getElementById('ceintqty').innerHTML=evt.target.value;}
    document.getElementById("btngenerateceinture").onclick = ()=>{MM.createCeintureSheet()}
    document.getElementById("btngenerateFC").onclick = ()=>{MM.createFlashCards()}
    document.getElementById("cardsNbValue").oninput = (evt)=>{document.getElementById('cardsNb').innerHTML=evt.target.value;}
    document.getElementById("btngenerateWG").onclick = ()=>{MM.createWhoGots()}
    document.getElementById("dominosNbValue").oninput = (evt)=>{document.getElementById('dominosNb').innerHTML=evt.target.value;}
    document.getElementById("btngenerateDominos").onclick = ()=>{MM.createDominos()}
    // boutons d'exemples
    document.getElementById("btn-annotation2").addEventListener("click", (evt)=>{
        let target = utils.getTargetWithImageInside(evt);
        utils.annotate('divparams', target.id)
    });
    document.getElementById("btn-shuffle").onclick = ()=>{MM.editedActivity.display('sample')}
    // boutons section énoncés
    document.getElementById("btn-annotation-enonce").onclick = (evt)=>{
        let target = utils.getTargetWithImageInside(evt);
        utils.annotate('enonce-content', target.id);
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
        } else if(evt.target.dataset.what === "out"){
            MM.zooms[evt.target.dataset.zoom].minus();
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
                    utils.annotate('sampleSlide'+i,targetId);
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
                utils.annotate('corrige-content', target.id)
                break
            case "btn-restart-otherdata":
                utils.setSeed(utils.seedGenerator());
                MM.start()
                break
            case "btn-restart-samedata":
                MM.start()
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
    document.getElementById("stop-all").onclick = ()=>{MM.stopAllSliders()};
    document.getElementById("pause-all").onclick = ()=>{MM.pauseAllSliders()};
    document.getElementById("next-all").onclick = ()=>{MM.nextAllSliders()};
    // moteur de recherche d'activité
    document.getElementById("searchinput").onkeyup = (evt)=>{library.displayContent(evt.target.value)};
    // boutons aléatorisation
    document.getElementById("btn-params-aleakey").onclick = ()=>{document.getElementById('aleaKey').value=utils.seedGenerator();};

    /**
     * Comportements sur les éléments fixes
     */
    // Suppression comportement avant modularisation
    document.querySelector("#tab-historique ol").addEventListener("click",(evt)=>{
        if(evt.target.innerHTML.indexOf("🛠 éditer")>-1){
            utils.checkURL(evt.target.dataset['url'],false,true)
        } else if(evt.target.innerHTML.indexOf("❌ Supprimer")>-1){
            MM.removeFromHistory(evt.target.parentNode);
        }
    })
    document.getElementById("corrige-content").addEventListener("click",(evt)=>{
        if(evt.target.innerHTML === "Figure"){
            MM.memory[evt.target.dataset.id].toggle();
        }
    })
    document.getElementById("cart0-list").addEventListener("click",(evt)=>{
        if(evt.target.dataset.actid !== undefined){
            MM.editActivity(evt.target.dataset.actid);
        }
    })
    document.getElementById("cart1-list").addEventListener("click",(evt)=>{
        if(evt.target.dataset.actid !== undefined){
            MM.editActivity(evt.target.dataset.actid);
        }
    })
    document.getElementById("cart2-list").addEventListener("click",(evt)=>{
        if(evt.target.dataset.actid !== undefined){
            MM.editActivity(evt.target.dataset.actid);
        }
    })
    document.getElementById("cart3-list").addEventListener("click",(evt)=>{
        if(evt.target.dataset.actid !== undefined){
            MM.editActivity(evt.target.dataset.actid);
        }
    })
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
    if(MM.embededIn){
        window.parent.postMessage({ready:"ok"}, MM.embededIn);
    }
}

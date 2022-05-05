import MM from "./MM.js";
import utils from "./utils.js";
/**
 * keyboard interactif
 * Permet d'entrer des données, traitées ensuite par MathLive
 * 
 */
const keysSVG ={
    enterKey : `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.1495 13.4005C18.2541 13.4005 19.1495 12.5051 19.1495 11.4005V3.40051H21.1495V11.4005C21.1495 13.6097 19.3587 15.4005 17.1495 15.4005H6.84398L10.6286 19.1852L9.21443 20.5994L2.85046 14.2354L9.21443 7.87146L10.6286 9.28567L6.5138 13.4005H17.1495Z" fill="currentColor" />
              </svg>`,
    backspaceKey: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.7427 8.46448L19.1569 9.87869L17.0356 12L19.157 14.1214L17.7428 15.5356L15.6214 13.4142L13.5 15.5355L12.0858 14.1213L14.2072 12L12.0859 9.87878L13.5002 8.46457L15.6214 10.5858L17.7427 8.46448Z"
      fill="currentColor" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.58579 19L2.29289 12.7071C1.90237 12.3166 1.90237 11.6834 2.29289 11.2929L8.58579 5H22.5857V19H8.58579ZM9.41421 7L4.41421 12L9.41421 17H20.5857V7H9.41421Z"
      fill="currentColor"
    /></svg>`,
    leftArrowKey : `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20.3284 11.0001V13.0001L7.50011 13.0001L10.7426 16.2426L9.32842 17.6568L3.67157 12L9.32842 6.34314L10.7426 7.75735L7.49988 11.0001L20.3284 11.0001Z"
      fill="currentColor" />
  </svg>`,
    rightArrowKey:`<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.0378 6.34317L13.6269 7.76069L16.8972 11.0157L3.29211 11.0293L3.29413 13.0293L16.8619 13.0157L13.6467 16.2459L15.0643 17.6568L20.7079 11.9868L15.0378 6.34317Z"
      fill="currentColor" />
  </svg>`,
  undoKey:`<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M5.33929 4.46777H7.33929V7.02487C8.52931 6.08978 10.0299 5.53207 11.6607 5.53207C15.5267 5.53207 18.6607 8.66608 18.6607 12.5321C18.6607 16.3981 15.5267 19.5321 11.6607 19.5321C9.51025 19.5321 7.58625 18.5623 6.30219 17.0363L7.92151 15.8515C8.83741 16.8825 10.1732 17.5321 11.6607 17.5321C14.4222 17.5321 16.6607 15.2935 16.6607 12.5321C16.6607 9.77065 14.4222 7.53207 11.6607 7.53207C10.5739 7.53207 9.56805 7.87884 8.74779 8.46777L11.3393 8.46777V10.4678H5.33929V4.46777Z"
    fill="currentColor" />
</svg>`,
redoKey:`<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path
  d="M13.1459 11.0499L12.9716 9.05752L15.3462 8.84977C14.4471 7.98322 13.2242 7.4503 11.8769 7.4503C9.11547 7.4503 6.87689 9.68888 6.87689 12.4503C6.87689 15.2117 9.11547 17.4503 11.8769 17.4503C13.6977 17.4503 15.2911 16.4771 16.1654 15.0224L18.1682 15.5231C17.0301 17.8487 14.6405 19.4503 11.8769 19.4503C8.0109 19.4503 4.87689 16.3163 4.87689 12.4503C4.87689 8.58431 8.0109 5.4503 11.8769 5.4503C13.8233 5.4503 15.5842 6.24474 16.853 7.52706L16.6078 4.72412L18.6002 4.5498L19.1231 10.527L13.1459 11.0499Z"
  fill="currentColor" />
</svg>`,
srqt:`<svg width="1em" height="1em" viewBox="0 0 8.467 8.467" xmlns="http://www.w3.org/2000/svg"><path d="M.982 5.817l.506-.595.865 1.66L4.03 1.529h3.15" fill="none" stroke="#000" stroke-width=".529"/></svg>`
}
 export default class keyBoard {
    /**
     * 
     * @param {Integer} target champ MathLive à alimenter
     * @param {Array} keys touches à afficher
     * @param {DOMelt} displayContener élément du DOM où ajouter le clavier à afficher
     * @param {String} sliderId Id du slider contenant
     * @param {String} keyboardId Id du keyboard.
     */
    constructor(target,keys,displayContener,sliderId,keyboardId){
        this.keyConf = {
            "÷":["key colored","÷",()=>{this.targetField.executeCommand(["insert","\\div"]);this.focus();}],
            "×":["key colored","×",()=>{this.targetField.executeCommand(["insert","\\times"]);this.focus();}],
            "*":["key colored","×",()=>{this.targetField.executeCommand(["insert","\\times"]);this.focus();}],
            "-":["key colored","−",()=>{this.targetField.executeCommand(["insert","-"]);this.focus();}],
            "(":["key colored","( )",()=>{this.targetField.executeCommand(["insert","(#0)"]);this.focus();}],
            "{":["key colored","{ }",()=>{this.targetField.executeCommand(["insert","{#0;#0}"]);this.focus();}],
            "x²":["key times colored","x²",()=>{this.targetField.executeCommand(["insert","^2"]);this.focus();}],
            "√":["key colored",keysSVG.srqt,()=>{this.targetField.executeCommand(["insert","\\sqrt{#0}"]);this.focus();}],
            "/":["key colored","/",()=>{this.targetField.executeCommand(["insert","\\dfrac{#0}{#0}"]);this.focus();}],
            "pi":["key colored","π",()=>{this.targetField.executeCommand(["insert","\\pi"]);this.focus();}],
            "^":["key colored","x<sup>n</sup>",()=>{this.targetField.executeCommand(["insert","^{#0}",{format:"latex"}]),this.focus();}],
            "10n":["key colored","10<sup>n</sup>",()=>{this.targetField.executeCommand(["insert","10^{#0}",{format:"latex"}]),this.focus();}],
            "h":["key colored","h",()=>{this.targetField.executeCommand(["insert","h"]),this.focus();}],
            "min":["key colored","min",()=>{this.targetField.executeCommand(["insert","min"]),this.focus();}],
            "aigu":["key colored","aig",()=>{this.targetField.executeCommand(["insert","aigu"]),this.focus();}],
            "obtus":["key colored","obt",()=>{this.targetField.executeCommand(["insert","obtus"]),this.focus();}],
            "droit":["key colored","drt",()=>{this.targetField.executeCommand(["insert","droit"]),this.focus();}],
            "o":["key colored","O",()=>{this.targetField.executeCommand(["insert","\\text{oui}"]),this.focus();}],
            "n":["key colored","N",()=>{this.targetField.executeCommand(["insert","\\text{non}"]),this.focus();}],
            "V":["key colored","V",()=>{this.targetField.executeCommand(["insert","\\text{VRAI}"]),this.focus();}],
            "F":["key colored","F",()=>{this.targetField.executeCommand(["insert","\\text{FAUX}"]),this.focus();}],
            "A":["key colored","A",()=>{this.targetField.executeCommand(["insert","\\text{affine non linéaire}"]),this.focus();}],
            "L":["key colored","L",()=>{this.targetField.executeCommand(["insert","\\text{linéaire}"]),this.focus();}],
            "l":["key colored","L",()=>{this.targetField.executeCommand(["insert","\\text{ L}"]),this.focus();}],
            "m":["key colored","m",()=>{this.targetField.executeCommand(["insert","\\text{ m}"]),this.focus();}],
            "g":["key colored","g",()=>{this.targetField.executeCommand(["insert","\\text{ g}"]),this.focus();}],
            "%":["key colored","%",()=>{this.targetField.executeCommand(["insert","\\%"]),this.focus();}]
        }
        this.targetField = target;
        this.sliderId = sliderId;
        try{
            if(keys === undefined){
                this.defaut();
            } else {
                this.create(keys);
            }
            if(keyboardId !== undefined){
                this.content.id = keyboardId;
            }
            displayContener.appendChild(this.content);
        } catch(err){
            console.log("Création de clavier "+keyboardId+"\n"+ err);
        }
    }
    /**
     * give the focus to the target if only one player
     */
    focus(){
        if(MM.slidersNumber<2)
            this.targetField.focus();
    }
    /**
     * 
     * @param {string} className liste des classes de la touche
     * @param {display} display html à afficher sur la touche
     * @param {function} afunction ()=>{} à éxécuter à l'appui de la touche
     */
    addKey(className,display=undefined,afunction){
        if(display === undefined){
            let elm;
            if(className ==="_"){
                elm = utils.create("div");                
            } else if(["a","b","c","e","i","t",":","u","v","x","y","z","€",";","<",">","=","+","°"].indexOf(className)>-1){
                elm =utils.create("div",{className:"key times colored",innerHTML:className});
                if(MM.touched)
                    elm.ontouchend = ()=>{this.targetField.executeCommand(["insert",className]);this.focus();};
                else
                    elm.onclick = ()=>{this.targetField.executeCommand(["insert",className]);this.focus();}
            } else {
                elm =utils.create("div",{className:this.keyConf[className][0],innerHTML:this.keyConf[className][1]});
                if(MM.touched)
                    elm.ontouchend = this.keyConf[className][2];
                else
                    elm.onclick = this.keyConf[className][2];
            }
            this.content.appendChild(elm);
        } else {
            let elm =utils.create("div",{className:className,innerHTML:display});
            try {
                if(MM.touched)
                    elm.ontouchend = afunction;
                else 
                    elm.onclick = afunction;
            } catch (err){
                console.log("Erreur de création de touche\n"+err)
            }
            this.content.appendChild(elm);
        }
    }
    create(config=[]){
        this.content = utils.create("div",{className:"numkey-base"});
        /** Première ligne */
        // touches 7 8 et 9
        ["7","8","9"].forEach((val)=>{
            this.addKey("key",val,()=>{this.targetField.executeCommand(["insert",val]);this.focus();});
        });
        if(config[0]!== undefined)
            this.addKey(config[0])
        // touche diviser
        else
            this.addKey("÷");
        // touche Backspace
        this.addKey("key backspace",keysSVG.backspaceKey, ()=>{this.targetField.executeCommand("deleteBackward");this.focus();});
        // trou
        this.content.appendChild(utils.create("div"));
        // touche parenthèses
        if(config[4]!==undefined)
            this.addKey(config[4]);
        else this.addKey("(");
        // touche lettre x
        if(config[5]!==undefined)
            this.addKey(config[5])
        else this.addKey("x");
        /** Deuxième ligne */
        // touches 7 8 et 9
        ["4","5","6"].forEach((val)=>{
            this.addKey("key",val,()=>{this.targetField.executeCommand(["insert",val]);this.focus();});
        });
        // touche multiplier
        if(config[1]!==undefined)
            this.addKey(config[1])
        else this.addKey("×");
        // touche Enter
        this.addKey("key enter",keysSVG.enterKey,()=>{
            this.targetField.executeCommand("complete");
            this.targetField.dispatchEvent(new KeyboardEvent('keyup',{'key':'Enter'}));
            //MM.nextSlide(this.sliderId);
        });
        // trou
        this.content.appendChild(utils.create("div"));
        // touche carré
        if(config[6]!==undefined)
            this.addKey(config[6]);
        else this.addKey("x²");
        // touche racine
        if(config[7]!==undefined)
            this.addKey(config[7]);
        else this.addKey("√");
        /** Troisième ligne */
        // touches 7 8 et 9
        ["1","2","3"].forEach((val)=>{
            this.addKey("key",val,()=>{this.targetField.executeCommand(["insert",val]);this.focus();});
        });
        // touche moins
        if(config[2]!==undefined)
            this.addKey(config[2]);
        else this.addKey("-");
        // trou
        this.content.appendChild(utils.create("div"));
        // touche annuler
        this.addKey("key action",keysSVG.undoKey,()=>{this.targetField.executeCommand("undo");this.focus();});
        // touche refaire
        this.addKey("key action",keysSVG.redoKey,()=>{this.targetField.executeCommand("redo");this.focus();});
        /** Quatrième ligne */
        // touches 0 
        this.addKey("key zero","0",()=>{this.targetField.executeCommand(["insert","0"]);this.focus();});
        // touches , 
        this.addKey("key",",",()=>{this.targetField.executeCommand(["insert","."]);this.focus();});
        // touche plus
        if(config[3]!==undefined)
            this.addKey(config[3]);
        else this.addKey("+");
        // trou
        this.content.appendChild(utils.create("div"));
        // touche flèche gauche
        this.addKey("key action",keysSVG.leftArrowKey,()=>{this.targetField.executeCommand("moveToPreviousChar");this.focus();});
        // touche refaire
        this.addKey("key action",keysSVG.rightArrowKey,()=>{this.targetField.executeCommand("moveToNextChar");this.focus();});
    }
    /**
     * crée un clavier par défaut
     */
    defaut(){
        this.create();
    }
    show(){

    }
    hide(){

    }
}
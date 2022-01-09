import utils from "./utils.js";
import MM from "./MM.js";
/**
 * offer the possibility to anotate the page
 * designed for interactive screens
 * 
 * @param {String} tgt id de l'élément à couvrir
 * @param {String} btnId id du bouton qui déclenche le draw pour changer son image
 * 
 * fonctionne avec une variable d'environnement, ici MM.touched qui prend true si on a des évennements touch
 * détecté ainsi :
 *     let listener = function(evt){
        // the user touched the screen!
        MM.touched = true;
        window.removeEventListener('touchstart',listener,false);
    }
    window.addEventListener('touchstart',listener,false);
 * également dans le css :
#corrige-content #painting, #divparams #painting {
  position: absolute;
  display:block;
  cursor: url(../img/iconfinder_pencil.png), auto;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  z-index: 40;
}
 */
export default class draw {
    constructor(tgt,btnId){
        // creation du canva et instanciation
        const target = document.getElementById(tgt);
        let c = utils.create("canvas",{
            id:"painting",
            width:target.offsetWidth,
            height:target.offsetHeight+30
        });
        // changement d'aspect du bouton "annoter"
        this.btn = document.querySelector("#"+btnId + " img");
        this.btn.src = "img/iconfinder_pencil_activ.png";
        //insertion du canvas dans 
        target.appendChild(c);
        this.canvas = c;
        if(btnId.indexOf("btn-sample")>-1){
            this.canvas.style.top = 0;
            this.canvas.style.left = 0;
        }
        else {
            this.canvas.style.top = target.offsetTop+"px";
            this.canvas.style.left = target.offsetLeft+"px";
        }
        this.mouse = {x:0,y:0};
        const mouvement = (event)=>{
            let target = event.target;
            let evt = event
            if(MM.touched){
                target=event.touches[0].target;
                evt = event.touches[0];
            }
            this.mouse.x = evt.pageX - target.getBoundingClientRect().x;
            this.mouse.y = evt.pageY - target.getBoundingClientRect().y;
            if(this.enableDraw){
                if(!this.started){
                    this.started = true;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mouse.x,this.mouse.y);
                } else {
                    this.ctx.lineTo(this.mouse.x,this.mouse.y);
                    this.ctx.stroke();
                }
            }
            if(event.touches){
                event.preventDefault();
            }
        }
        const yesDraw = (event)=>{
            this.enableDraw = true;
            if(event.touches){
                event.preventDefault();
            }
        }
        const noDraw = (event)=>{
            this.enableDraw = false;this.started = false;
            if(event.touches){
                event.preventDefault();
            }
        }
        this.ctx = this.canvas.getContext('2d');
        this.ctx.strokeStyle = "grey";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.stroke();
        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 1;
        this.ctx.shadowColor = 'blue';
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.canvas.addEventListener("mousemove",mouvement, false);
        this.canvas.addEventListener('mousedown', yesDraw, false);
        this.canvas.addEventListener('mouseup',noDraw,false);
        this.canvas.addEventListener('mouseout',noDraw,false);
        if(MM.touched){
            this.canvas.addEventListener("touchmove",mouvement, false);
            this.canvas.addEventListener('touchstart', yesDraw, false);
            this.canvas.addEventListener('touchend', noDraw,false);
        }
    }
    // destroy canvas
    destroy(){
        this.btn.src = "img/iconfinder_pencil_1055013.png";
        this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = undefined;
        this.ctx = undefined;
    }
}
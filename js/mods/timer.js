import MM from "./MM.js";
import utils from "./utils.js";
// Timer
export default class timer {
    constructor(slideid){
        this.durations = []; 
        this.durationId = 0; // id of the currect duration timer
        this.startTime = 0; // start time of the timer
        this.endTime = 0; // end time of the timer
        this.timeLeft = 0; // remaining time until the end of the timer
        this.percent = 0; // width of the progressbar
        this.id = slideid; // number of the slider
        this.break = false; // break state
        this.timer = false; // interval
        this.ended = false; // indicates if all has ended
    }
    getTimeLeft(){
        this.timeLeft = this.endTime - Date.now();
        this.percent = Math.round(100 - this.timeLeft/10/this.durations[this.durationId]);
        this.display();
        if(this.timeLeft <= 0){
            this.stop();
            MM.nextSlide(this.id);
        }
    }
    addDuration(value){
        this.durations.push(value);
    }
    start(id){
        this.stop(); // just in case;
        if(this.ended) return false;
        this.break = false;
        if(MM.onlineState==="no"){
            let btnPause = document.querySelectorAll("#slider"+this.id+" .slider-nav img")[1];
            btnPause.src="img/slider-pause.png";
            utils.removeClass(btnPause,"blink_me");
        }
        if(id>-1){
            this.timeLeft = this.durations[id]*1000;
            this.durationId = id;
        }
        this.startTime = Date.now();
        this.endTime = this.startTime + this.timeLeft;
        if(this.timer){
            clearInterval(this.timer);
            this.timer = false;
        }
        this.timer = setInterval(this.getTimeLeft.bind(this),50);
    }
    pause(){
        if(this.ended) return false;
        if(this.break){
            this.break = false;
            this.start();
            return false;
        } else {
            this.break = true;
            this.stop();
            let btnPause = document.querySelectorAll("#slider"+this.id+" .slider-nav img")[1];
            btnPause.src="img/slider-play.png";
            utils.addClass(btnPause,"blink_me");
        }
    }
    stop(){
        if(this.timer){
            clearInterval(this.timer);
            this.timer = false;
        }        
    }
    end(){
        this.stop();
        this.ended = true;
        MM.messageEndSlide(this.id,this.durationId);
        setTimeout(MM.endSliders,3000);// if all of the timers ended together
    }
    display(){
        document.querySelector("#slider"+this.id+" progress").value = this.percent;
    }
}
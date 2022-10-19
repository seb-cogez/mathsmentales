import utils from "./utils.min.js";
export {sound as default};
const sound = {
    list : [
        ["sounds/BELLHand_Sonnette de velo 2 (ID 0275)_LS.mp3","Sonette"],
        ["sounds/COMCam_Un declenchement d appareil photo (ID 0307)_LS.mp3","Reflex"],
        ["sounds/COMCell_E mail envoye (ID 1312)_LS.mp3","Email"],
        ["sounds/COMTran_Bip aerospatial 1 (ID 2380)_LS.mp3","Bip"],
        ["sounds/MUSCPerc_Cartoon agogo 2 (ID 2262)_LS.mp3","Agogo"],
        ["sounds/ROBTVox_Notification lasomarie 4 (ID 2062)_LS.mp3","Notif"],
        ["sounds/SWSH_Epee qui coupe (ID 0127)_LS.mp3","Couper"],
        ["sounds/SWSH_Epee qui fend l air (ID 0128)_LS.mp3","Fendre"],
        ["sounds/SWSH_Whoosh 3 (ID 1795)_LS.mp3","whoosh"],
        ["sounds/TOONHorn_Klaxon poire double 1 (ID 1830)_LS.mp3","Pouet"],
        ["sounds/VEHHorn_Klaxon de voiture recente 4 (ID 0260)_LS.mp3","Klaxon"],
        ["sounds/WATRSplsh_Plouf petit 6 (ID 1534)_LS.mp3","Plouf"],
        ["sounds/Anas_platyrhynchos_-_Mallard_-_XC62258.mp3","Coincoin"]
    ],
    selected:null,
    player:null,
    getPlayer(){
        // récup du player
        this.player = document.getElementById("soundplayer");
        // peuple la liste
        let slct = document.getElementById("playerlist");
        for(let i=0;i<this.list.length;i++){
            let option = utils.create("option",{value:i,innerText:this.list[i][1]});
            slct.appendChild(option);
        }
    },
    beeps(){
        this.player.src = "sounds/BEEP_Bips horaires 1 (ID 1627)_LS.mp3";
        this.play();
    },
    play(){
        if(this.selected !== null)
            this.player.play();
    },
    next(){
        if(this.selected===null)this.selected=-1;
        this.setSound((this.selected+1)%this.list.length);
        this.play();
    },
    select(id){
        this.setSound(id);
        this.play();
    },
    setSound(id){
        if(this.player === null)this.getPlayer()
        this.selected = eval(id);
        if(this.selected!==null)
            this.player.src = this.list[id][0];
    }
}
export default class speech {
    constructor(lang='fr-FR'){
        this.exists = this.test();
        this.lang = lang;
        this.text = "";
        this.times = 1;
        this.timeout = false;
        this.initialize()
    }
    // teste l'existence du moteur speech
    test(){
        if("speechSynthesis" in window){
            return true;
        } else return false;
    }
    initialize(){
        if(!this.exists)return;
        this.voices = speechSynthesis.getVoices()
        //this.voice = this.voices[0]
    }
    speak(text=this.text,stop=true){
        if(!this.exists)return;
        if(Array.isArray(text)){
            this.times = text[1];
            this.text = text[0]
        } else {
            this.text = text;
        }
        let msg = new SpeechSynthesisUtterance()
        msg.voice = this.voice
        msg.text = this.text
        if(speechSynthesis.speaking && stop){
            if(this.timeout){
                clearTimeout(this.timeout);
                this.timeout = false;
            }
            speechSynthesis.cancel();
        }
        speechSynthesis.speak(msg)
        msg.onend = ()=>{
            this.times--;
            if(this.times>0)
                this.timeout = setTimeout(()=>{speechSynthesis.speak(msg)},1500)
        }
        return false;
    }
    setVoice(id){
        id = Number(id)
        if(id>this.voices.length-1) return false;
        this.voice = this.voices[id];
    }
    setText(text){
        this.text = text.replace("-"," moins ")
        this.text = this.text.replace(")/(",")sur(")
    }
    stop(){
        if(speechSynthesis.speaking){
            clearTimeout(this.timeout);
            this.timeout = false;
            speechSynthesis.cancel();
        }
    }
}
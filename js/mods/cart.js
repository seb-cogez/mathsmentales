import activity from "./activity.min.js";
import MM from "./MM.min.js";
import utils from "./utils.min.js";
import math from "./math.min.js";

export default class cart {
    constructor(id){
        this.id = id;
        this.activities = [];
        this.ordered = true;// les questions sont présentées par groupe d'activité
        this.sortable = undefined;
        this.editedActivityId = -1;
        this.target = [id]; // Indicates where to display the cart.
        this.nbq = 0;
        this.time = 0;
        this.title = "Diapo "+(id+1);
        this.loaded = false;
    }
    /**
     * Export datas of the cart to put in an url
     * @returns urlString
     */
    export(){
        let urlString = "&p="+this.id+
            "~t="+encodeURI(this.title)+
            "~c="+this.target+
            "~o="+this.ordered;
        for(let i=0,l=this.activities.length;i<l;i++){
            urlString += "_"+this.activities[i].export();
        }
        return urlString;
    }
    /**
     * Importe un panier et toutes ses activités
     * @param {json} obj objet importé d'un exo téléchargé
     * @param {Boolean} start if true, will make start slideshow when all is ready
     */
    import(obj,start=false){
        // à revoir
        this.title = obj.t;
        this.target = obj.c;
        if(obj.o==="false" || !obj.o){
            this.ordered = false;
        } else {
            this.ordered = true;
        }
        // activités, utilise Promise
        let activities = [];
        for(const i in obj.a){
            activities.push(activity.import(obj.a[i],i));
        }
        return Promise.all(activities).then(data=>{
            data.forEach((table)=>{
                this.activities[table[0]] = table[1];
            });
            //MM.editedActivity = this.activities[activities.length-1];
            this.loaded = true;
            // si dans contexte de MM
            if(document.querySelector("#tab-parameters") !== null){
                // on crée l'affichage du panier chargé dans le contexte de l'interface de config de MM
                this.display();
            }
            if(start)
                MM.checkLoadedCarts();

        }).catch(err=>{
            let alert = utils.create(
                "div",
                {
                    id:"messageerreur",
                    className:"message",
                    innerHTML:"Impossible de charger tous les exercices :(<br>"+err
                });
                document.getElementById("tab-accueil").appendChild(alert);
                setTimeout(()=>{
                    let div=document.getElementById('messageerreur');
                    div.parentNode.removeChild(div);
                },3000);
            });
    }
    /**
     * Ducplicate this object
     */
    duplicate(){
        if(MM.carts.length<4){
            // on ajoute un panier et l'affiche
            MM.addCart();
            // on affecte des copies des activités à ce nouveau panier.
            let cart = MM.carts[MM.carts.length-1];
            for(let i=0;i<this.activities.length;i++){
                cart.addActivity(this.activities[i]);
            }
            // on affiche le panier.
            cart.display();
        }

    }
    addActivity(obj,nbQuestions=false){
        this.editedActivityId = -1;
        let temp = new activity(obj);
        if(nbQuestions){
            temp.nbq = nbQuestions;
        }
        this.activities.push(temp);
        this.display();
    }
    /**
     * remove an activity from the list
     * @param {integer} index of the activity
     */
    removeActivity(index){
        if(this.editedActivityId === index){this.editedActivityId = -1;}
        else if(this.editedActivityId > index){this.editedActivityId--};
        this.activities.splice(index,1);
        this.display();
    }
    /**
     * Change the order of the activities in conformity to the li order after a move
     * @param {integer} oldIndex old index of the activity
     * @param {integer} newIndex new index of the activity
     */
    exchange(oldIndex, newIndex){
        let indexes = this.activities.getKeys();
        let tempindexes = indexes[oldIndex];
        let temp = this.activities[oldIndex];
        this.activities.splice(oldIndex, 1);
        indexes.splice(oldIndex,1);
        this.activities.splice(newIndex, 0, temp);
        indexes.splice(newIndex, 0, tempindexes);
        this.editedActivityId =  Number(indexes.indexOf(this.editedActivityId));
        this.display();// refresh order
    }
    /**
     * display the cart in his content area
     */
    display(){
        document.querySelector("#cart"+this.id+" h3").innerText=this.title;
        let dom = document.getElementById("cart"+(this.id)+"-list");
        dom.innerHTML = "";
        this.time = 0;
        this.nbq = 0;
        let spanOrder = document.querySelector("#cart"+this.id+" span[data-ordered]");
        if(this.ordered){
            spanOrder.innerHTML = "ordonné"
            spanOrder.dataset["ordered"] = "true";
        } else {
            spanOrder.innerHTML = "mélangé";
            spanOrder.dataset["ordered"] = "false";
        }
        /*
        let objImage = document.querySelector("#cart"+this.id+" img[data-ordered]");
        if(this.ordered){
            objImage.src = "img/iconfinder_stack_1054970.png";
            objImage.title = "Affichage dans l'ordre des activités";
            objImage.dataset["ordered"] = "true";
        } else {
            objImage.src = "img/iconfinder_windy_1054934.png";
            objImage.title = "Affichage mélangé des questions";
            objImage.dataset["ordered"] = "false";
        }*/
        for(let i=0,l=this.activities.length; i<l;i++){
            let li = document.createElement("li");
            let activity = this.activities[i];
            this.time += Number(activity.tempo)*Number(activity.nbq);
            this.nbq += Number(activity.nbq);
            li.innerHTML = "<img src='img/editcart.png' align='left' data-actid='"+i+"' title=\"Editer l'activité\"><img src='img/removefromcart.png' data-actidtoremove='"+i+"' title='Enlever du panier' class='removefromcartbutton'>"+(activity.audioRead==true?activity.title:activity.title.replace("📣 ","")) + " (<span>"+activity.tempo + "</span> s. / <span>"+activity.nbq+"</span> quest.)";
            if(MM.carts[this.id].editedActivityId === i){
                li.className = "active";
            }
            dom.appendChild(li);
        }
        let spans = document.querySelectorAll("#cart"+(this.id)+" div.totaux span");
        spans[0].innerHTML = math.sToMin(this.time);
        spans[1].innerHTML = this.nbq;
        spans[2].innerHTML = this.target;
        // détruit le sortable si déjà effectif.
        if(this.sortable)this.sortable.destroy();
        this.sortable = new Sortable(dom, {
            animation:150,
            ghostClass:'ghost-movement',
            onEnd : evt=>MM.carts[this.id].exchange(evt.oldIndex, evt.newIndex)
        });
    }
    /**
     * 
     * @param {Object} objImage DOM object of the clicked image
     */
    changeOrder(objImage){
        if(objImage.dataset["ordered"] === "true"){
            objImage.innerHTML = "mélangé"
            //objImage.src = "img/iconfinder_windy_1054934.png";
            objImage.title = "Affichage mélangé des questions";
            objImage.dataset["ordered"] = "false";
            this.ordered = false;
        } else {
            objImage.innerHTML = "ordonné"
            //objImage.src = "img/iconfinder_stack_1054970.png";
            objImage.title = "Affichage dans l'ordre des activités";
            objImage.dataset["ordered"] = "true";
            this.ordered = true;
        }
    }
}
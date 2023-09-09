import utils from "./utils.min.js";
export default class Zoom {
    /**
     * @param {Integer} id id unique du zoom
     * @param {String} targetSelector Id de l'élément du DOM à zoomer/dézoomer
     * @param {boolean} normaltarget indicate if targetSelector is the targeted elem (true) or children span
     */
    constructor(id,targetSelector,normaltarget=false,unit="em",value=1,associateTarget=''){
        this.target = targetSelector
        this.id=id
        this.value = value
        this.normaltarget = normaltarget
        this.unite=unit
        this.associateTarget=associateTarget
    }
    changeSize(value,obj=false){
        if(value===10 && obj){
            obj.value = 1;
        }
        let dest = document.querySelectorAll(this.target);// undefined;
        /*if(this.normaltarget)
            dest = document.querySelectorAll(this.target);
        else 
            dest = document.querySelectorAll(this.target+ " > span");*/
        dest.forEach(elt=>elt.style.fontSize = value+this.unite);
    }
    minus(){
        if(this.unite === "em"){
            if(this.value<0.3)return;
            if(this.value<=1)
                this.value-=0.1;
            else{
                this.value-=0.5;
            }
        } else if(this.unite === "pt"){
            if(this.value < 7) return;
            if(this.value <= 16)
                this.value -= 1;
            else this.value -= 2;
        }
        this.changeSize(this.value);
    }
    plus(){
        if(this.unite === "em"){
            if(this.value>=6)return;
            if(this.value<1)this.value+=0.1;
            else this.value +=0.5;
        } else if(this.unite === "pt"){
            if(this.value>28)return;
            if(this.value<16)this.value+=1;
            else this.value += 2;
        }
        this.changeSize(this.value);
    }
    reset(){
        if(this.unite==="em")this.value=1;
        else if(this.unite==="pt")this.value=11;
        this.changeSize(this.value);
    }
    createCursor(){
        let div = utils.create("div",{id:this.id, className:"zoom"});
        let span = utils.create("span",{className:"zoom-A1 pointer","data-what":"reset",innerText:"A", "data-zoom": this.id, "data-assoc":this.associateTarget, ondblclick:this.reset});
        let btn2 = `<button class="zoominbtn" data-what="in" data-zoom="${this.id}"><svg
        data-zoom="${this.id}"
        data-assoc="${this.associateTarget}"
        data-what="in"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
        data-zoom="${this.id}"
        data-assoc="${this.associateTarget}"
        data-what="in"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M15.3431 15.2426C17.6863 12.8995 17.6863 9.1005 15.3431 6.75736C13 4.41421 9.20101 4.41421 6.85786 6.75736C4.51472 9.1005 4.51472 12.8995 6.85786 15.2426C9.20101 17.5858 13 17.5858 15.3431 15.2426ZM16.7574 5.34315C19.6425 8.22833 19.8633 12.769 17.4195 15.9075C17.4348 15.921 17.4498 15.9351 17.4645 15.9497L21.7071 20.1924C22.0976 20.5829 22.0976 21.2161 21.7071 21.6066C21.3166 21.9971 20.6834 21.9971 20.2929 21.6066L16.0503 17.364C16.0356 17.3493 16.0215 17.3343 16.008 17.319C12.8695 19.7628 8.32883 19.542 5.44365 16.6569C2.31946 13.5327 2.31946 8.46734 5.44365 5.34315C8.56785 2.21895 13.6332 2.21895 16.7574 5.34315ZM10.1005 7H12.1005V10H15.1005V12H12.1005V15H10.1005V12H7.10052V10H10.1005V7Z"
          fill="currentColor"
        />
      </svg></button>`;
      let btn1 = `<button class="zoomoutbtn" data-what="out" data-zoom="${this.id}"><svg
      data-zoom="${this.id}"
      data-assoc="${this.associateTarget}"
      data-what="out"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
      data-zoom="${this.id}"
      data-assoc="${this.associateTarget}"
      data-what="out"
      fill-rule="evenodd"
        clip-rule="evenodd"
        d="M15.3431 15.2426C17.6863 12.8995 17.6863 9.1005 15.3431 6.75736C13 4.41421 9.20101 4.41421 6.85786 6.75736C4.51472 9.1005 4.51472 12.8995 6.85786 15.2426C9.20101 17.5858 13 17.5858 15.3431 15.2426ZM16.7574 5.34315C19.6425 8.22833 19.8633 12.769 17.4195 15.9075C17.4348 15.921 17.4498 15.9351 17.4645 15.9497L21.7071 20.1924C22.0976 20.5829 22.0976 21.2161 21.7071 21.6066C21.3166 21.9971 20.6834 21.9971 20.2929 21.6066L16.0503 17.364C16.0356 17.3493 16.0215 17.3343 16.008 17.319C12.8695 19.7628 8.32883 19.542 5.44365 16.6569C2.31946 13.5327 2.31946 8.46734 5.44365 5.34315C8.56785 2.21895 13.6332 2.21895 16.7574 5.34315ZM7.10052 10V12H15.1005V10L7.10052 10Z"
        fill="currentColor"
      />
    </svg></button>`;
        div.innerHTML += btn1;
        div.appendChild(span);
        div.innerHTML += btn2;
        return div;
    }
}
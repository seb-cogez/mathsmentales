import utils from "./utils.min.js";
//import * as ce from "../node_modules/@cortex-js/compute-engine/dist/compute-engine.min.esm.js"
export {math as default};
const math = {
    premiers: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1249, 1259, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361, 1367, 1373, 1381, 1399, 1409, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1511, 1523, 1531, 1543, 1549, 1553, 1559, 1567, 1571, 1579, 1583, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1657, 1663, 1667, 1669, 1693, 1697, 1699, 1709, 1721, 1723, 1733, 1741, 1747, 1753, 1759, 1777, 1783, 1787, 1789, 1801, 1811, 1823, 1831, 1847, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1901, 1907, 1913, 1931, 1933, 1949, 1951, 1973, 1979, 1987, 1993, 1997, 1999],
    //ce:new ComputeEngine({multiply:"\\times"}),
    /**
     * 
     * @param {float} nb number to be rounded
     * @param {integer} precision may positiv or negativ
     */
    round: function(nb, precision){
        if(precision === undefined){
            return Math.round(nb);
        } else{
            if(precision < 5)
                return Number(Math.round(Number(nb+'e'+precision))+'e'+(-precision));
            else{
                let z=new Big(nb);
                return z.round(precision).toFixed();
            }
        }
    },
    valeurParDefaut: function(valeur, precision) {
        if(precision === undefined){
            return Math.floor(valeur);
        } else
        return Number(Math.floor(Number(valeur + 'e' + precision)) + 'e' + (-precision));
      },
    valeurParExces: function(valeur, precision) {
        if(precision === undefined){
            return Math.ceil(valeur);
        } else
        return Number(Math.ceil(Number(valeur + 'e' + precision)) + 'e' + (-precision));
    },
    /**
     *  
     * @param {integer} min relativ
     * @param {integer} max relativ
     * optionals
     * @param {integer} qty positiv
     * @param {string} avoid start with ^ indicates the list of exeptions,
     * & as exeption => no doble number in the list
     * prime => not a prime
     */
     aleaInt:function(min,max,...others){ // accepts 2 arguments more
        let qty=1;
        let avoid=[];
        let arrayType=false;
        utils.security = 300;
        let nodouble = false;
        let notPrime = false;
        for(let i=0;i<others.length;i++){
            if(String(Number(others[i])) === others[i] || typeof others[i]==="number"){
                qty = others[i];
                arrayType = true;
            } else if(typeof others[i] === "string" && others[i][0]=="^"){
                avoid = others[i].substring(1).split(",");
                if(avoid.indexOf("&")>-1)nodouble = true;
                if(avoid.indexOf("prime")>-1)notPrime = true;
                avoid = avoid.map(Number);
            }
        }
        if(min === max) return min;
        if(max<min){
            [min,max] = [max,min];
        }
        if(arrayType){
            var integers = [];
            for(let i=0;i<qty;i++){
                let thisint = math.round(utils.alea()*(max-min))+min;
                if(avoid.indexOf(thisint)>-1 || (nodouble && integers.indexOf(thisint)>-1) || (notPrime && math.premiers.indexOf(thisint)>-1)){
                    // do not use exeptions numbers
                    // or no double number
                    i--;
                    if(!utils.checkSecurity()) break;
                    continue;
                }
                integers.push(thisint);
                if(!utils.checkSecurity()) break;
            }
            return integers;
        } else {
            let thisint;
            do{
                thisint = math.round(utils.alea()*(max-min))+min;
                if(!utils.checkSecurity()) break;
            }
            while (avoid.indexOf(thisint)>-1 || (notPrime && math.premiers.indexOf(thisint)>-1))
            return thisint;
        }
    },
    /**
     * 
     * @param {float} min minimal value
     * @param {float} max maximal value
     * @param {integer} precision relativ
     * optionals
     * @param {integer} qty number of values to return
     * @param {string} avoid values to avoid comma separated start with ^
     */
    aleaFloat:function(min, max, precision, ...others){
        let qty=1;
        let avoid = [];
        let nodouble = false;
        utils.security = 300;
        // check others aguments
        for(let i=0;i<others.length;i++){
            if(String(Number(others[i])) === others[i] || typeof others[i] === "number"){
                qty = others[i];
            } else if(typeof others[i] === "string" && others[i][0]==="^"){
                avoid = others[i].substring(1).split(",");
                if(avoid.indexOf("&")>-1)nodouble = true;
                avoid = avoid.map(Number);
            }
        }
        // exchange values min and max if min > max
        if(max<min){
            [min,max]=[max,min];
        }
        if(qty>1){ // more than one value
            let nb;
            var floats=[];
            for(let i=0;i<qty;i++){
                nb = math.round(utils.alea()*(max-min)+min,precision);
                if(avoid.indexOf(nb)>-1 || (nodouble && floats.indexOf(nb)>-1)){
                    i--;
                    if(!utils.checkSecurity()) break;
                    continue;
                   }
                floats.push(nb);
                if(!utils.checkSecurity()) break;
            }
            //debug(floats);
            return floats;
        } else { // one value
            let nb;
            do {
                nb = math.round(utils.alea()*(max-min)+min,precision);
                if(!utils.checkSecurity()) break;
                //debug(nb);
            }
            while(avoid.indexOf(nb)>-1)
            return nb;
        }
    },
    /**
     * return one or the number
     * @param {Number} value 
     */
    unOuNombre(value){
        value = Number(value);
        if(Math.round(Math.random())){
            return 1;
        } else return value;
    },
    /**
     * 
     * @param {Number} nb 
     * @returns 
     */
    sign:function(nb){
        nb = Number(nb);
        if(nb<0) return "-"
        else return "+"
    },
    /**
     * tranform a number to a signed number
     * 
     * @param {number} nb 
     * @returns a number with his sign
     */
    signedNumber:function(nb){
        if(nb===0) return "";
        else if(nb>0) return "+"+nb;
        else return nb;
    },
    /**
     * tranform the number 1 or -1 to + or -
     * 
     * @param {Number} nb 
     * @returns nothing if nb=1, - if nb=-1 the number in other cases
     */
    signIfOne:function(nb){
        if(nb === 1)
            return "";
        else if(nb === -1)
            return "-";
        else return nb;
    },
    /**
     * tranform a number to a signed number and 1, -1 or 0 to +, - or ""
     * 
     * @param {Number} nb 
     * @returns a number always with sign (+/-) or only the sign if nb=1 or -1
     */
    signedNumberButOne:function(nb){
        nb = Number(nb);
        if(nb===0)return "";
        if(nb===1)return "+";
        if(nb===-1)return "-";
        if(nb>0) return"+"+nb;
        return nb;
    },
    /**
     * needsParenthesis
     * return a number with parenthesis if the number is negative
     * 
     * @param {number or string} nb 
     * @returns nb with parenthesis if nb 1st char is -
     */
    nP:function(nb){
        if(String(nb)[0]==="-")return "("+nb+")";
        else return nb;
    },
    /**
     * donne la liste des produits de 2 facteurs égaux
     * @param {integer} entier product
     * @param {integer} max factors's max value
     */
    listeProduits:function(entier, max, values=false){
        let liste = [];
        if(max === undefined)max=10;
        for(let i=1,top=Math.floor(Math.sqrt(entier));i<=top;i++){
            let reste = entier%i, quotient = ~~(entier/i);
            if(reste == 0 && i<=max && quotient<=max){
                liste.push(i+"\\times"+quotient);
                if(values && i!== quotient)liste.push(quotient+"\\times"+i)
            }
        }
        if(!values)
            return liste.join("; ");
        else return liste
    },
    /** 
    * donne la liste des diviseurs d'un nombre sous forme de chaine
    * @param {integer} nb nombre à décomposer
    * @param {boolean} array false ou undefined renvoie une chaine, un tableau sinon
    */
    listeDiviseurs:function(nb, array=false){
        let maxSearch = Math.floor(Math.sqrt(nb));
        let diviseurs = [];
        let grandsdiviseurs = [];
        for (let i = 1; i <= maxSearch; i++) {
          if (nb % i === 0) {
            diviseurs.push(i);
            if (i !== nb / i) // on ne met pas 2 fois le même nombre si carré parfait
              grandsdiviseurs.unshift(nb / i);
          }
        }
        diviseurs = diviseurs.concat(grandsdiviseurs);
        if(array===true)
            return diviseurs;
        else
            return diviseurs.join("; ");
    },
    /**
     * 
     * @param {integer} nb 
     * @returns integer : le plus grand diviseur non égal au nombre
     */
    plusGrandDiviseur:function(nb){
        const liste = math.listeDiviseurs(nb,true);
        return liste[liste.length-2];
    },
    /**
     * 
     * @param {integer} nb 
     * @returns integer
     */
    plusGrandDiviseurPremier(nb){
        if(nb<2) return nb;
        let prime = 0,indice=0;
        while(math.premiers[indice]<=nb){
            indice++;
            if(nb%math.premiers[indice]==0)
                prime=math.premiers[indice];
        }
        return prime;
    },
    /**
    *
    * donne la liste des diviseurs inférieurs à 10 sous forme de chaine
    * @param {integer} nb 
    *
    * */
    listeDiviseurs10:function(nb){
        let diviseurs = [2,3,5,9,10];
        let liste = [];
        for (let i = 0, len=diviseurs.length; i < len; i++) {
            const div = diviseurs[i];
            if(nb%div === 0)liste.push(div);
        }
        if(liste.length)return liste.join("; ");
        else return "aucun des nombres"
    },
    /**
     * 
     * @param {integer} nb
     * return un non diviseur d'un nombre
     */
    nonDiviseur(nb){
        let unnondiviseur=0;
        do { unnondiviseur = math.aleaInt(2,nb-1); }
        while (nb%unnondiviseur===0)
        return unnondiviseur;
    },
    /**
     * Retourne une fraction décimale égale au nombre décimal
     * @param {float} decimal nombre décimal
     * return fraction
     */
    fractionDecimale(decimal){
        let string = decimal.toString();
        let pointPosition = string.indexOf(".");
        // cas du nombre entier
        if(pointPosition<0) return "\\dfrac{"+decimal+"}{1}";
        else {
            let nbChiffres = string.length - pointPosition - 1;
            return "\\dfrac{"+math.round(decimal*Math.pow(10,nbChiffres),0) +"}{"+Math.pow(10,nbChiffres)+"}";
        }
        
    },
    /**
     * 
     * @param {integer} nb 
     * return un diviseur de nb
     */
    unDiviseur(nb,notOne=false,notNb=true){
        let diviseurs = math.listeDiviseurs(nb,true);
        if(notOne) diviseurs = _.rest(diviseurs); // on enlève la première valeur qui est 1.
        if(notNb) diviseurs = _.initial(diviseurs);
        return diviseurs[math.aleaInt(0,diviseurs.length-1)];
    },
    /**
     * replace parts of a string written as power
     * @param {String} value "integer1^integer2*integer3^integer4..."
     * @returns product of integers2 factors equals to integer1, ...
     */
    unpower:function(value){
        let matches = value.match(/(\d*)\^(\d*)/g);
            if(matches)
            for(let i=0,l=matches.length;i<l;i+=2){
                value = value.replace(matches[i], math.powerToProduct(matches[i]));
            }
        return value;
    },
    /**
     * 
     * @param {String} power "int1^int2"
     * @returns return int1*int1*... with int2 factors
     */
    powerToProduct(power){
        let nb = Number(power.substring(0,power.indexOf("^")));
        let puissance = Number(power.substring(power.indexOf("^")+1));
        let a = [];
        for(let i=0;i<puissance;i++){
            a.push(nb);
        }
        return a.join("*");
    },
    /**
     * convert seconds to hours minutes & seconds
     * @param {Integer} sec number of seconds to convert
     * @returns 
     */
    sToMin(sec){
        sec = Number(sec);
        let time = "";
        if(sec>3600){
          time += ~~(sec/3600) + " h ";
          sec = sec%3600;
        }
        if(sec>60){
          time += ~~(sec/60) + " min ";
          sec = sec%60;
        }
        return time += sec;
    },
    /**
     * replace all * with \\times
     * @param {String} string ascii string where * is multiply symbol
     * @returns String
     */
    toTex(string){
        return string.replace(/\*/g, "\\times");
    },
    /**
     * retourne l'écriture simplifiée d'une racine carrée
     * @param {Integer} radicande 
     * @returns 
     */
    simplifieRacine(radicande){
        const factors = Algebrite.run('factor('+radicande+')').split('*');
        let outOfSquareR = 1;
        let inSquareR = 1;
        for(let i=0;i<factors.length;++i){
            const elt = factors[i].split("^");
            const nb = elt[0];
            const power = elt[1]===undefined?1:elt[1];
            outOfSquareR = outOfSquareR*Math.pow(nb,Math.floor(power/2));
            inSquareR = inSquareR*Math.pow(nb,power%2);
        }
        return (outOfSquareR>1?outOfSquareR:'')+(inSquareR>1?"\\sqrt{"+inSquareR+"}":'');
    },
    /**
     * Indicates if a number is divided by another
     * @param {Int} nb 
     * @param {Int} par 
     * @param {String} type type of return string w : phrase type or yn : yes/no type
     * @returns 
     */
    estDivisiblePar(nb, par, type){
        nb = Number(nb); par = Number(par);
        let reponses = {"w":[" est divisible ", "n'est pas divisible"],"yn":["oui", "non"]};
        if(nb%par === 0){
            return reponses[type][0];
        } else return reponses[type][1];
    },
    /**
     * Compare two numbers
     * @param {Int} a 
     * @param {Int} b 
     * @returns <, > or =
     */
    compare(a,b){
        if(a<b)return"\\lt";
        else if(a>b)return"\\gt";
        else return "=";
    },
    /**
     * Retourne le PGCD de deux nombres
     * @param {Int} a 
     * @param {Int} b 
     * @returns gcd of a & b
     */
    pgcd: function(a, b) {
        return Algebrite.run('gcd(' + a + ',' + b + ')');
    },
    /**
     * Retourne le PPCM de deux nombres
     * @param {Int} a integer 1
     * @param {Int} b integer 2
     * @returns lcm of a & b
     */
    ppcm: function(a, b) {
        return Algebrite.run('lcm(' + a + ',' + b + ')');
    },
    /**
     * Retourne l'inverse d'un nombre
     * @param {String} expr expression Latex ou text
     * @param {Boolean} notex default false : return as tex, else return as ascii
     * @returns inverse of expr
     */
    inverse:function(expr, notex){
        let ret;
        if(notex === undefined || notex===false) ret = Algebrite.run('printlatex(1/('+expr+'))');
        else ret = Algebrite.run('1/('+expr+')');
        return ret;
    },
    /**
     * 
     * @param {String} expr expression à calculer
     * @param {Boolean} notex default false : return as tex, else return as ascii
     * @returns 
     */
    calc:function(expr,notex){
        let ret = Algebrite.run(expr);
        if(notex === undefined || notex===false) {
            // on calcule l'affichage latex en réalisant quelques petites simplifications d'écriture (1*x=>x, 2x+0 => 2x)...
            //let parser= new AsciiMathParser()
            //ret = ret.replace(/([0-9])(\*)([a-z])/g,'$1$3').replace(/frac/g,'dfrac');
            //ret = parser.parse(ret);
            ret = Algebrite.run('printlatex('+expr+')').replace(/frac/g,'dfrac').replace(/(\d) (\\times|\\cdot) (\w)/g,'$1$3');
            //let expression = parse(expr);
            //ret = serialize(this.ce.canonical(expression)).replace(/frac/g,'dfrac');
        }
        return ret;
    },
    /**
     * Retourne des heures minutes à partir d'heures, minutes, secondes pouvant dépasser 60 ou être négatives
     * @param {Int} h nombre d'heures
     * @param {Int} m nombre de minutes
     * @param {Int} s nombre de secondes
     * @returns String as "5 h 09"
     */
    getHM(h,m,s){
        if(s===undefined)s=0;
        var d = new Date(2010,1,1,Number(h),Number(m),Number(s));
        return d.getHours()+" h "+((d.getMinutes()<10)?"0"+d.getMinutes():d.getMinutes());
    },
    /**
     * Retourne des heures minutes secondes à partir d'heures, minutes, secondes pouvant dépasser 60 ou être négatives
     * @param {Int} h nombre d'heures
     * @param {Int} m nombre de minutes
     * @param {Int} s nombres de secondes
     * @returns String as "11 h 07 min 03 s"
     */
    getHMs(h,m,s){
        if(s===undefined)s=0;
        var d = new Date(2010,1,1,Number(h),Number(m),Number(s));
        return d.getHours()+" h "+((d.getMinutes()<10)?"0"+d.getMinutes():d.getMinutes())+" min "+((d.getSeconds()<10)?"0"+d.getSeconds():d.getSeconds())+" s.";
    },
    /**
     * Simplifie une fraction à partir de son numérateur et de son dénominateur
     * @param {Int} n numérateur
     * @param {Int} d dénominateur
     * @returns tex expression of the simplified fraction
     */
    fractionSimplifiee(n,d){
        if(n<0 && d<0 || n>0 && d<0){
            n=-n;d=-d;
        }
        const gcd = math.pgcd(n,d);
        if(Number.isInteger(n/d))
            return n/d;
        else 
            return "\\dfrac{"+(n/gcd)+"}{"+(d/gcd)+"}";
    },
    /**
     * Retourne une fraction décimale simplifiée à partir d'une fraction décimale
     * @param {Int} n numérateur
     * @param {Int} d dénominateur
     * @returns tex expression of the fraction simplified
     */
    simplifyFracDec(n,d){
        while(n%10 === 0 && d%10 === 0){
            n=n/10;d=d/10;
        }
        return "\\dfrac{"+n+"}{"+d+"}";
    },
    /**
     * 
     * @param {array} operandes array of numbers
     * @param {array} operations array of symbols : +, -, *, / or q
     * @param {string} option "p" renvoie une phrase, "a" renvoie latex, "v" renvoie asccii
     * @param {boolean} ordre 1 ou 0 la première opération est le premier argument de la 2e ou pas
     */
    phrase(operandes,operations,option,ordre){
        let x,y,r,z;
        let phrases = {
            "+":["la somme de ${x} et de ${y}","${x}+${y}","${x}+${y}"],
            "-":["la différence entre ${x} et ${y}","${x}-${y}","${x}-${y}"],
            "*":["le produit de ${x} par ${y}","${x}\\\\times ${y}","${x}*${y}"],
            "/":["le quotient de ${x} par ${y}","${x}\\\\div ${y}","${x}/${y}"],
            "q":["le quotient de ${x} par ${y}", "\\\\dfrac{${x}}{${y}}","${x}/${y}"]
        }
        x=operandes[0];y=operandes[1];
        switch(option){
            case "p":
                r = eval("`"+phrases[operations[0]][0]+"`")
                break;
            case "a":
                r = eval("`"+phrases[operations[0]][1]+"`")
                break;
            case "v":
                r = eval("`"+phrases[operations[0]][2]+"`")
                break;
            }
            //debug(r);
        if(operations.length>1){// plus d'une opération
            if(ordre){ // la première operation est le premier argument
                x=r;y=operandes[2];z=x;
                if(["*","/"].indexOf(operations[1])>-1 && ["-","+"].indexOf(operations[0])>-1)
                    z="("+x+")";
            } else { // la deuxième opération est le 2e argument
                x=operandes[2];y=r;z=y;
                if(["*","/","-"].indexOf(operations[1])>-1 && ["-","+"].indexOf(operations[0])>-1 || operations[0]==="/")
                    z="("+y+")";
                }
            switch(option){
                case "p":
                    r=eval("`"+phrases[operations[1]][0]+"`").replace("de le", "du");
                    break;
                case "a":
                    if(ordre)x=z;else y=z;
                    r = eval("`"+phrases[operations[1]][1]+"`")
                    break;
                case "v":
                    if(ordre)x=z;else y=z;
                    r = eval("`"+phrases[operations[1]][2]+"`")
                    break;
            }
        }
        return r;
    },
    /**
     * 
     * @param {*} a 
     * @param {*} op 
     * @param {*} b 
     * @returns 
     */
    bigDecimal(a,op,b){
        let x = Big(a);
        return eval('x.'+op+'('+b+').toString()');
    },
        /**
     * Génère un montant aléatoire en €
     * @param {integer} billets id des billets
     * @param {boolean} entier true pour générer des montants entiers, false pour des centimes
     * @param {boolean} tot true pour donner le montant total, false pour donner un montant inférieur
     */
         montant:function(billets,entier,tot){
            let valeursBillets = [5,10,20,50,100];
            let min=Infinity;
            let total=0;
            for(let i=0,len=billets.length;i<len;i++){
                if(min>valeursBillets[billets[i]])
                    min = valeursBillets[billets[i]];
                total+=valeursBillets[billets[i]];
            }
            if(tot){
                return total;
            } else {
                if(entier){
                    return math.aleaInt(total-min+1,total);
                } else {
                    return math.aleaFloat(total-min+1,total,2);
            }}
        },
        /**
         * Crée un texte de nombres de billets à partir d'une simple liste de billets [5,5,10,20,50,10]
         * @param {Array} billets liste de billets
         * @returns String faisant la liste des billets par groupes
         */
        listeBillets:function(billets){
            let valeursBillets = [5,10,20,50,100];
            let lesbillets = {5:0,10:0,20:0,50:0,100:0};
            let txt = "des billets : ";
            for(let i=0,len=billets.length;i<len;i++){
                 lesbillets[valeursBillets[billets[i]]]++;
            }
            for(let val in lesbillets){
                if(lesbillets[val]>1){
                    txt += lesbillets[val]+" de "+val+" €, ";
                } else if(lesbillets[val]>0){
                    txt += val+" €, ";
                }
            }
            return txt;
        },
        // JavaScript Document
        /****************************************************************************
        *________________________________________________________________________   *
        *   About       :   Convertit jusqu'à  999 999 999 999 999 (billion)        *
        *                   avec respect des accords                                *
        *_________________________________________________________________________  *			
        *   Auteur      :   GALA OUSSE Brice, Engineer programmer of management     *
        *   Mail        :   bricegala@yahoo.fr, bricegala@gmail.com                 *
        *   Tél         :   +237 99 37 95 83 / +237 79 99 82 80                     *
        *   Copyright   :   avril  2007                                             *
        * Ce document intitulé « Conversion des nombres en lettre » issu de CommentCaMarche
        * (codes-sources.commentcamarche.net) est mis à disposition sous les termes de
        * la licence Creative Commons. Vous pouvez copier, modifier des copies de cette
        * source, dans les conditions fixées par la licence, tant que cette note    *
        * apparaît clairement.                                                      *
        *_________________________________________________________________________  *
        *****************************************************************************
        */
        NumberToLetter:function(nombre, U=null, D=null,decimalPart=false) {
            const letter = {
                0: "zéro",
                1: "un",
                2: "deux",
                3: "trois",
                4: "quatre",
                5: "cinq",
                6: "six",
                7: "sept",
                8: "huit",
                9: "neuf",
                10: "dix",
                11: "onze",
                12: "douze",
                13: "treize",
                14: "quatorze",
                15: "quinze",
                16: "seize",
                17: "dix-sept",
                18: "dix-huit",
                19: "dix-neuf",
                20: "vingt",
                30: "trente",
                40: "quarante",
                50: "cinquante",
                60: "soixante",
                70: "soixante-dix",
                80: "quatre-vingt",
                90: "quatre-vingt-dix",
            };
            const decUnit = {
                1:"dixièmes",
                2:"centièmes",
                3:"millièmes",
                4:"dix-millièmes",
                5:"cent-millièmes",
                6:"millionièmes",
                7:"dix-millionièmes",
                8:"cent-millionièmes",
                9:"milliardièmes",
                10:"dix-milliardièmes",
                11:"cent-milliardièmes"
            }
            
            let i, j, n, quotient, reste, nb;
            let ch
            let numberToLetter = '';
            //__________________________________
    
            if (isNaN(nombre.toString().replace(/ /gi, ""))) return "Nombre non valide";
            nb = parseFloat(nombre.toString().replace(/ /gi, ""));
            // nombres décimaux
            if(Math.ceil(nb) != nb){
                nb = nombre.toString().split('.');
                return this.NumberToLetter(nb[0]) + (U ? " " + U + " et " : " virgule ") + this.NumberToLetter(nb[1],D,D,true) + (D ? " " + D : "") + (nb[1].indexOf("0")===0? " " + decUnit[nb[1].length]:"");
            }

            if (nombre.toString().replace(/ /gi, "").length > 15) return "dépassement de capacité";
            n = nb.toString().length;
            switch (n) {
                case 1:
                    numberToLetter = letter[nb];
                    break;
                case 2:
                    if (nb > 19) {
                        quotient = Math.floor(nb / 10);
                        reste = nb % 10;
                        if (nb < 71 || (nb > 79 && nb < 91)) {
                            if (reste == 0) numberToLetter = letter[quotient * 10];
                            if (reste == 1) numberToLetter = letter[quotient * 10] + "-et-" + letter[reste];
                            if (reste > 1) numberToLetter = letter[quotient * 10] + "-" + letter[reste];
                        } else numberToLetter = letter[(quotient - 1) * 10] + "-" + letter[10 + reste];
                    } else numberToLetter = letter[nb];
                    break;
                case 3:
                    quotient = Math.floor(nb / 100);
                    reste = nb % 100;
                    if (quotient == 1 && reste == 0) numberToLetter = "cent";
                    if (quotient == 1 && reste != 0) numberToLetter = "cent" + " " + this.NumberToLetter(reste);
                    if (quotient > 1 && reste == 0) numberToLetter = letter[quotient] + " cents";
                    if (quotient > 1 && reste != 0) numberToLetter = letter[quotient] + " cent " + this.NumberToLetter(reste);
                    break;
                case 4 :
                case 5 :
                case 6 :
                    quotient = Math.floor(nb / 1000);
                    reste = nb - quotient * 1000;
                    if (quotient == 1 && reste == 0) numberToLetter = "mille";
                    if (quotient == 1 && reste != 0) numberToLetter = "mille" + " " + this.NumberToLetter(reste);
                    if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " mille";
                    if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " mille " + this.NumberToLetter(reste);
                    break;
                case 7:
                case 8:
                case 9:
                    quotient = Math.floor(nb / 1000000);
                    reste = nb % 1000000;
                    if (quotient == 1 && reste == 0) numberToLetter = "un million";
                    if (quotient == 1 && reste != 0) numberToLetter = "un million" + " " + this.NumberToLetter(reste);
                    if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " millions";
                    if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " millions " + this.NumberToLetter(reste);
                    break;
                case 10:
                case 11:
                case 12:
                    quotient = Math.floor(nb / 1000000000);
                    reste = nb - quotient * 1000000000;
                    if (quotient == 1 && reste == 0) numberToLetter = "un milliard";
                    if (quotient == 1 && reste != 0) numberToLetter = "un milliard" + " " + this.NumberToLetter(reste);
                    if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " milliards";
                    if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " milliards " + this.NumberToLetter(reste);
                    break;
                case 13:
                case 14:
                case 15:
                    quotient = Math.floor(nb / 1000000000000);
                    reste = nb - quotient * 1000000000000;
                    if (quotient == 1 && reste == 0) numberToLetter = "un billion";
                    if (quotient == 1 && reste != 0) numberToLetter = "un billion" + " " + this.NumberToLetter(reste);
                    if (quotient > 1 && reste == 0) numberToLetter = this.NumberToLetter(quotient) + " billions";
                    if (quotient > 1 && reste != 0) numberToLetter = this.NumberToLetter(quotient) + " billions " + this.NumberToLetter(reste);
                    break;
            }//fin switch
            /*respect de l'accord de quatre-vingt*/
            if (numberToLetter.substr(numberToLetter.length - "quatre-vingt".length, "quatre-vingt".length) == "quatre-vingt") numberToLetter = numberToLetter + "s";
            return numberToLetter;
        },
        NumberToFraction:function(nombre,speech=false, U=null, D=null,last=0) {
            const letter = {
                0: "zéro",
                1: "un",
                2: "deux",
                3: "trois",
                4: "quatre",
                5: "cinq",
                6: "six",
                7: "sept",
                8: "huit",
                9: "neuf",
                10: "dix",
                11: "onze",
                12: "douze",
                13: "treize",
                14: "quatorze",
                15: "quinze",
                16: "seize",
                17: "dix-sept",
                18: "dix-huit",
                19: "dix-neuf",
                20: "vingt",
                30: "trente",
                40: "quarante",
                50: "cinquante",
                60: "soixante",
                70: "soixante-dix",
                80: "quatre-vingt",
                90: "quatre-vingt-dix",
            };
            const ends = {
                1:"unièmes",
                2:"deuxièmes",
                3:"troisièmes",
                4:"quatrièmes",
                5:"cinquièmes",
                6:"sixièmes",
                7:"septièmes",
                8:"huitièmes",
                9:"neuvièmes",
                10:"dixièmes",
                11: "onzièmes",
                12: "douzièmes",
                13: "treizièmes",
                14: "quatorzièmes",
                15: "quinzièmes",
                16: "seizièmes",
                17: "dix-septièmes",
                18: "dix-huitièmes",
                19: "dix-neuvièmes",
                20: "vingtièmes",
                30: "trentièmes",
                40: "quarantièmes",
                50: "cinquantièmes",
                60: "soixantièmes",
                70: "soixante-dixièmes",
                80: "quatre-vingtièmes",
                90: "quatre-vingt-dixièmes",
            }
            const units = {
                2:"demis",
                3:"tiers",
                4:"quarts"
            }
            
            let i, j, n, quotient, reste, nb;
            let ch
            let numberToLetter = '';
            if(nombre<0){
                return numberToLetter = 'sur moins '+this.NumberToLetter(-nombre);
            }
            //__________________________________
    
            if (nombre.toString().replace(/ /gi, "").length > 15) return "dépassement de capacité";
            if (isNaN(nombre.toString().replace(/ /gi, ""))) return "Nombre non valide";
    
            nb = parseFloat(nombre.toString().replace(/ /gi, ""));
            //if (Math.ceil(nb) != nb) return "Nombre avec virgule non géré.";
            if(Math.ceil(nb) != nb){
                nb = nombre.toString().split('.');
                //return NumberToLetter(nb[0]) + " virgule " + NumberToLetter(nb[1]);
                return this.NumberToFraction(nb[0]) + (U ? " " + U + " et " : " virgule ") + this.NumberToFraction(nb[1]) + (D ? " " + D : "");
            }
            n = nb.toString().length;
            switch (n) {
                case 1:
                    if(nb<5 && nb > 1 && last==0){
                        numberToLetter = units[nb];
                    } else if(last < 2) {
                        numberToLetter = ends[nb];
                    } else {
                        numberToLetter = letter[nb];
                    }
                    break;
                case 2:
                    if (nb > 19) {
                        quotient = Math.floor(nb / 10);
                        reste = nb % 10;
                        if (nb < 71 || (nb > 79 && nb < 91)) {
                            if (reste == 0) numberToLetter = ends[quotient * 10];
                            if (reste == 1) numberToLetter = letter[quotient * 10] + "-et-" + ends[reste];
                            if (reste > 1) numberToLetter = letter[quotient * 10] + "-" + ends[reste];
                        } else numberToLetter = letter[(quotient - 1) * 10] + "-" + ends[10 + reste];
                    } else numberToLetter = ends[nb];
                    break;
                case 3:
                    quotient = Math.floor(nb / 100);
                    reste = nb % 100;
                    if (quotient == 1 && reste == 0) numberToLetter = "centièmes";
                    if (quotient == 1 && reste != 0) numberToLetter = "cent" + " " + this.NumberToFraction(reste,speech,U,D,1);
                    if (quotient > 1 && reste == 0) numberToLetter = letter[quotient] + " centièmes";
                    if (quotient > 1 && reste != 0) numberToLetter = letter[quotient] + " cent " + this.NumberToFraction(reste,speech,U,D,1);
                    break;
                case 4 :
                case 5 :
                case 6 :
                    quotient = Math.floor(nb / 1000);
                    reste = nb - quotient * 1000;
                    if (quotient == 1 && reste == 0) numberToLetter = "millièmes";
                    if (quotient == 1 && reste != 0) numberToLetter = "mille" + " " + this.NumberToFraction(reste,speech,U,D,false);
                    if (quotient > 1 && reste == 0) numberToLetter = this.NumberToFraction(quotient,speech,U,D,2) + " millièmes";
                    if (quotient > 1 && reste != 0) numberToLetter = this.NumberToFraction(quotient,speech,U,D,2) + " mille " + this.NumberToFraction(reste,speech,U,D,1);
                    break;
                case 7:
                case 8:
                case 9:
                    quotient = Math.floor(nb / 1000000);
                    reste = nb % 1000000;
                    if (quotient == 1 && reste == 0) numberToLetter = "millionièmes";
                    if (quotient == 1 && reste != 0) numberToLetter = "un million" + " " + this.NumberToFraction(reste,speech,U,D,1);
                    if (quotient > 1 && reste == 0) numberToLetter = this.NumberToFraction(quotient,speech,U,D,2) + " millionièmes";
                    if (quotient > 1 && reste != 0) numberToLetter = this.NumberToFraction(quotient,speech,U,D,2) + " millions " + this.NumberToFraction(reste,speech,U,D,1);
                    break;
                case 10:
                case 11:
                case 12:
                    quotient = Math.floor(nb / 1000000000);
                    reste = nb - quotient * 1000000000;
                    if (quotient == 1 && reste == 0) numberToLetter = "milliardièmes";
                    if (quotient == 1 && reste != 0) numberToLetter = "un milliard" + " " + this.NumberToFraction(reste,speech,U,D,1);
                    if (quotient > 1 && reste == 0) numberToLetter = this.NumberToFraction(quotient,speech,U,D,2) + " milliardièmes";
                    if (quotient > 1 && reste != 0) numberToLetter = this.NumberToFraction(quotient,speech,U,D,2) + " milliards " + this.NumberToFraction(reste,speech,U,D,1);
                    break;
                case 13:
                case 14:
                case 15:
                    quotient = Math.floor(nb / 1000000000000);
                    reste = nb - quotient * 1000000000000;
                    if (quotient == 1 && reste == 0) numberToLetter = "billionièmes";
                    if (quotient == 1 && reste != 0) numberToLetter = "un billion" + " " + this.NumberToFraction(reste,speech,U,D,2);
                    if (quotient > 1 && reste == 0) numberToLetter = this.NumberToFraction(quotient,speech,U,D,2) + " billionièmes";
                    if (quotient > 1 && reste != 0) numberToLetter = this.NumberToFraction(quotient,speech,U,D,2) + " billions " + this.NumberToFraction(reste,speech,U,D,1);
                    break;
            }//fin switch
            /*respect de l'accord de quatre-vingt*/
            if (numberToLetter.substr(numberToLetter.length - "quatre-vingt".length, "quatre-vingt".length) == "quatre-vingt") numberToLetter = numberToLetter + "s";
            if(last<2 && speech)
                numberToLetter = numberToLetter.replace('-'," ").replace("vingtièmes","vin tièmes").replace("soixantièmes","soissantièmes");
            return numberToLetter;
        }
}
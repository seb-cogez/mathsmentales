## Mathsmentales
Projet de réécriture du site MathsMentales.net qui permet de créer des diaporamas de calcul mental sans effort
Démo : https://seb-cogez.github.io/mathsmentales/

### Nouveautés apportées par cette version :
 * nouvelle interface : tous les réglages dans une page, affichage d'exemples de questions pour mieux comprendre
 * possibilité de créer jusqu'à 4 paniers d'activités
 * possibilité d'afficher des exemples avant de commencer le diaporama
 * possibilité d'affichage multiples des questions
   * jusqu'à 4 différents
   * à chaque affichage peut être associé un panier différent
 * possibilité de créer son propre diapo en ligne (développement non commencé)
 * d'autres possibilités d'affichage que le diaporama : mur d'activités, flash cards... (développement non commencé)
 * internationalisation (ou pas)

### bibliothèques externes
 * [KateX](https://katex.org/) pour afficher les maths (MIT licence)
 * [KAS](https://github.com/Khan/KAS) outil de la Kahn academy pour évaluer des expressions littérales (MIT licence)
 * [Underscore](https://underscorejs.org/) pour pouvoir invoquer KAS (MIT Licence)
 * [knack.css](https://www.knacss.com/) framework css simple et léger ([licence WTFPL](http://www.wtfpl.net/))
 * [bulma-steps](https://github.com/Wikiki/bulma-steps) du projet css [bulma](https://bulma.io/)
 * [algebrite.js](http://algebrite.org/) An extensive math library symbolic computation (MIT licence)
 * [Sortable.js](http://sortablejs.github.io/Sortable/) Javascript library for reorderable drag-and-drop lists (MIT licence)
 * [seedrandom.js](https://github.com/davidbau/seedrandom) pour créer des nombres aléatoires "controlés" (MIT licence)
 * [Chart.js](https://www.chartjs.org/) pour représenter des statistiques (MIT licence)
 * [JSXGraph](http://jsxgraph.uni-bayreuth.de/wp/index.html) pour les représentations graphiques et la géométrie, notamment [JessieCode](https://github.com/jsxgraph/JessieCode) qui permet de réaliser des figures facilement (LGPL & MIT licences)
 * [asciimath2tex](https://github.com/christianp/asciimath2tex) pour taper plus rapidement les formules de maths (Licence Apache 2.0)
 * [qrious](https://github.com/neocotic/qrious) pour générer les qrcodes (GPLv3 licence)
 * [mathlive](https://mathlive.io/) pour l'interface de saisie utilisateur pour répondre en ligne
 * [tinyweb](https://www.ritlabs.com/en/products/tinyweb/) pour le mini serveur web sous windows.

### icones
* "Circle Icons" de Nick Roach [iconfinder](https://www.iconfinder.com/iconsets/circle-icons-1) parfois retouchées, licence GPL
* usage d'[Emoji](https://emojipedia.org/) dans l'affichage des ressources

### liens directs :
* https://seb-cogez.github.io/mathsmentales/index.html?n=4 envoie sur le niveau 4e
* https://seb-cogez.github.io/mathsmentales/index.html?u=5NC7 envoie directement sur l'activité 5NC7
* https://seb-cogez.github.io/mathsmentales/index.html?o=false&c=%7B%220%22%3A%7B%22y%22%3A%22c%22%2C%22i%22%3A0%2C%22a%22%3A%7B%220%22%3A%7B%22y%22%3A%22a%22%2C%22i%22%3A%225NC7%22%2C%22o%22%3A%5B2%5D%2C%22q%22%3A%7B%222%22%3A%5B0%5D%7D%2C%22p%22%3A%5B%5D%2C%22t%22%3A8%2C%22n%22%3A5%7D%2C%221%22%3A%7B%22y%22%3A%22a%22%2C%22i%22%3A%225NC5%22%2C%22o%22%3A%5B1%5D%2C%22q%22%3A%7B%221%22%3A%5B%5D%7D%2C%22p%22%3A%5B%5D%2C%22t%22%3A8%2C%22n%22%3A5%7D%7D%2C%22t%22%3A%22Diapo%201%22%2C%22c%22%3A%5B1%5D%2C%22e%22%3A%22correction%22%2C%22r%22%3A%22countdown%22%7D%7D envoie sur un diaporama qui démarre automatiquement.

### Changement de fonctionnement de la bibliothèque d'activités.
Elle est à présent réalisée à l'aide de fichiers json peu complexes

Ces fichiers json comportent des *données obligatoires* :
 * **title** : titre de l'activité
 * **ID** : un identifiant unique de l'activité pour la retrouver facilement dans la base de données, correspond au nom du fichier json : ID.json (pas de doublon !), ex : 6ND6 rangé dans N6 (niveau 6e) sous le code 6ND (Cf structure.json pour le classement) 6ND6 pour le numéro dans l'ordre de création des fichiers
 * **dest** : la liste des niveaux et sous partie qui seront peuplés par l'activité, ex 7NA1 sera rangé en CM2 (**7**e) > **N**umérique > Comprendre et utiliser les nombres (**A**) > 1ère activité
 * **repeat** : true ou non défini - permet de répéter des questions "pauvres" en type de question/réponses de se répéter.
 * **vars** : objet json contenant la ou les variables utilisées dans l'activité
   * une variable est une chaine ou un tableau. elle est interprétée pour tirer au sort des nombres uniques, des tableaux de nombres ...
     * des entiers min_max ou min_max_quantité ou min_max_^liste de valeurs à éviter ou min_max_quantité_^&,val1,val2... & signifie pas de double
     * des décimaux dmin_max_précision (pouvant être négative pour les puissances de 10 positives)
     * une valeur dans un tableau
   * une variable a pourra être reprise dans une autre variable par un appel de type ${:a}
   * des calculs utilisant la bibliothèque math peuvent être effectués dans les paires d'accolades, exemple : ${math.multiply(:a,:b)}
   * d'autres traitements peuvent être effectués à l'aide de fonctions javascript ${:a.toUpperCase()}
* **consts** : objet contenant des données constantes, telles que des tableaux
* **question** : chaine unique ou tableau de chaines contenant le texte de la question
  * pour le cas du tableau, il est possible de choisir le type de question à afficher lors du paramétrage de l'activité
* **answer** : chaine unique  ou tableau de chaines contenant la réponse à la question

ainsi que des *données optionnelles* :
 * **description** : texte décrivant de manière plus précise l'activité
 * **options** : tableau d'objets json pouvant contenir *title*, *vars*, *question*, *answer* et/ou *value*
   * une variable non définie prend la valeur de l'objet parent.
 * **value** : chaine ou tableau de chaines contenant les réponses attendues dans le formulaire de réponse en ligne
 * **type** : valeurs possible : "texte", "latex" qui indique le type de rendu des questions/réponses
 * **figure** : chaine contenant une figure illustrant l'activité
---
### à faire à l'insertion d'un nouvel exercice
à l'aide de Node.js (à installer) lancer library/scan.js pour recréer le fichier qui référence tous les exercices dans une arborescence chargée au lancement de MathsMentales

### Fichiers exemple :

Tables de multiplciation : avec du latex, type par défaut, donc non indiqué

```js
{
    "title":"Tables de Multiplications", // obligatoire
    "ID":"6ND6", // obligatoire
    "vars":{
      "a":"1_10", // a : entier entre 1 et 10
      "b":"2_10" // b entier entre 2 et 10
      },
    "question":[
      "\\bold{${:a}}\\times${:b}", // en gras le nombre a multiplié par le nombre b
      "${:b}\\times\\bold{${:a}}" // le nombre b multiplié par le nombre a, en gras
      ],
    "answer":":question=\\color{red}{${:a*:b}}", // une seule réponse possible on peut reprendre la variable question ici sans ${}, c'est la seule possible dans cette chaine
    "value":"${:a*:b}" // valeur attendue dans le corrigé
}
```
Développer une identité remarquable. vars commun à toutes les options
Il est possible de choisir parmi les types de questions, celle qui sera affichée dans le diaporama.

```js
{
    "title":"Développer une identité remarquable",
    "ID":"3ND2",
    "dest":["3ND"]
    // var a : entier entre 1 et 10
    // var b : entier entre 2 et 10
    // var c : variable
    "vars":{
      "a":"1_10",
      "b":"2_10",
      "c":["u","v","t","x", "y", "z"]
      },
    "options":[{
        "name":"(ax+b)²",
        "question": [
          "(${math.signIfOne(:a)}${:c}+${:b})^2", // (ax + b)², le a pouvant être 1, on utilise math.signIfOne qui remplace le nombre par rien si 1 ou - si -1
          "(${:b}+${math.signIfOne(:a)}${:c})^2" // (b + ax)²
          ],
          // reponse : (ax+b)² = en rouge ax²+2ab+b² on utilise math.multiply et math.pow plutôt que * et ^ qui peuvent créer des pb d'arrondi
        "answer":":question=\\color{red}{${math.signIfOne(math.pow(:a,2))}${:c}^2+${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}}",
        "value":"${math.signIfOne(math.pow(:a,2))}${:c}^2+${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}"    
    },
    {
        "name":"(ax-b)²",
        "question": ["(${math.signIfOne(:a)}${:c}-${:b})^2", "(${:b}-${math.signIfOne(:a)}${:c})^2"],
        "answer":":question=\\color{red}{${math.signIfOne(math.pow(:a,2))}${:c}^2-${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}}",
        "value":"${math.signIfOne(math.pow(:a,2))}${:c}^2-${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}"    
    },
    {
        "name":"(ax-b)(ax+b)",
        "question": [
            "(${math.signIfOne(:a)}${:c}-${:b})(${math.signIfOne(:a)}${:c}+${:b})", // (ax-b)(ax+b)
            "(${math.signIfOne(:a)}${:c}-${:b})(${:b}+${math.signIfOne(:a)}${:c})", // (ax-b)(b+ax)
            "(${math.signIfOne(:a)}${:c}+${:b})(${math.signIfOne(:a)}${:c}-${:b})", // (ax+b)(ax-b)
            "(${:b}+${math.signIfOne(:a)}${:c})(${math.signIfOne(:a)}${:c}-${:b})"], // (b-ax)(ax-b)
        "answer":":question=\\color{red}{${math.signIfOne(math.pow(:a,2))}${:c}^2-${math.pow(:b,2)}}",
        "value":"${math.signIfOne(math.pow(:a,2))}${:c}^2-${math.pow(:b,2)}"    
    }
    ]
}
```

Conversions
``` js
{
    "title":"Conversions vers les unités de base",
    "ID":"7MA1", // nom du fichier
    "dest":["7MA", "6MA", "6MD"], // chapitres de destination dans l'arborescence
    "options":[
        // var k : unité d'où convertir et multiplicande
        // var p : précision max (négative : multiples de l'unité, positive : sous-multiples) et nombre max
        // var z : intervalle la précision
        // var x : intervalle de tirage entre 0 et p nombre max, avec la précision p max et non nul ^0
        {
          "name":"m",
          "vars":{
            "q":"m",
            "k":[["km",1000], ["hm",100], ["dam",10], ["dm",0.1], ["cm",0.01], ["mm",0.001]], // pour chaque unité on associe le multiplicande permettant la conversion
            "p":[[0.1,2],[1,1],[0,10],[-1,100],[-2,1000]], // le premier nombre est la précision, le second est la limite supérieure pour la génération du nombre
            "z":"${:p[0]}_3", // définition de la précision de l'arrondi : 0,1-0,001 ou 1-0,001 ou 10-0,001 ou encore 100-0,001
            "x":"d0_${:p[1]}_${:z}_^0"} // d indique qu'on veut des nombres décimaux, nombre entre 0 et 1, 10, 100 ou 1000, non nul
            },
        {
          "name":"L",
          "vars":{
            "q":"L",
            "k":[["hL",100], ["daL",10], ["dL",0.1], ["cL",0.01], ["mL",0.001]],
            "p":[[0,0],[-1,10],[-2,100],[-3,1000]],
            "z":"${:p[0]}_3",
            "x":"d0_${:p[1]}_${:z}_^0"
          }
        },
        {
          "name":"g",
          "vars":{
            "q":"g",
            "k":[["kg",1000], ["hg",100], ["dag",10], ["dg",0.1], ["cg",0.01], ["mg",0.001]],
            "p":[[0,0],[-1,10],[-2,100],[-3,1000]],
            "z":"${:p[0]}_3",
            "x":"d0_${:p[1]}_${:z}_^0"
            }
          }
    ],
    "description":"Conversions des multiples et sous-multiples des m, L et g vers les m, L et g",
    "question":"\\text{Convertir } ${:x} \\text{ ${:k[0]} en }\\color{blue}\\text{${:q}}",
    "answer":"${:x} \\text{ ${:k[0]}} = \\color{red}{${math.round(:x*:k[1],7)}\\text{ ${:q}}}",
    "value":"${math.round(:x*:k[1],7)}\\text{ ${:q}}"
}
```

Exemple avec du texte
``` js
{
  "type":"text",
  "title":"Table de 3",
  "ID":"11N1", // nom du fichier
  "dest":["11NC"], // chapitre de destination 11 pour le CP, N pour les nombres, C pour le cacul avec les nombres
  "vars":{
    "a":"2_10"
  }
  "question":"Combien font $$3\\times${:a}$$ ?",
  "answer":"$$3\\times${:a}=\\color{red}{${3*:a}}$$"
  "value":"${3*:a}"
}
```

Exemple avec chartjs : représentation de données statistiques
``` js
{
    "title":"Test de graphique",
    "type":"text",
    "dest":["5DA", "4DA", "3DA"],
    "ID":"5DA1",
    "vars":{
      "a":"10_100_5_^&", // tire 5 entiers entre 10 et 100, tous différents (^&)
      "b":[["fraises", "bananes", "oranges", "kiwis", "pommes"], ["vélo", "trotinette", "voiture", "bus", "scooter"]] // choisit l'un des deux tableaux
      },
    "figure":{
      "type":"chart", // sera affiché à l'aide de la bibliothèque chartjs
      "content":{ // les données passées à l'objet chartjs
        "type":"bar", // le type de représentation
        // les datas à afficher, dont les couleurs
        "data":{"labels":"${:b}", "datasets":[{"label":"Graphique","backgroundColor": ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],"data":"${:a}"}]}}
        },
    "question":"Quelle est la donnée la plus représentée ?", // la question posée
    "answer":"C'est ${:b[:a.indexOf(Math.max(...:a))]}", // la réponse attendue (le max de la série)
    "value":"${Math.max(...:a)}"
}
```

Exemple avec JSXGraph
``` js
{
    "ID":"3DD1",
    "dest":["3DD"],
    "title":"Lire l'ordonnée à l'origine",
    "type":"text",
    "vars":{"a":"d-2_2_1", "b":"-3_3"}, // a est le coeff, b est l'ordonnée à l'origine
    "figure":{
        "type":"graph", // usage de jsxgraph
        "boundingbox":[-5,5,5,-5], // taille de la boite de tracés (xmin,ymax,xmax,ymin)
        "axis":true, // affiche les axes
        "grid":true, // affiche la grille
        "content" :[
                ["functiongraph","${:a}*x+${:b}"] // functiongraph va tracer la représentation de la formule
            ]    
        },
    "question":"Quelle est l'ordonnée à l'origine de la fonction affine ?",
    "answer":"L'ordonnée à l'origine de la fonction est <span class='red'>${:b}</span>",
    "value":"${:b}" // valeur attendue en réponse
}
```

Fichier structure pour démarrer la création d'un exercice
``` js
{
    "title":"", // titre
    "type":"", // laisser vide ou supprimer pour des notations de maths
    "ID":"", // nom du fichier, sans l'extension .json
    "dest":[""], // Codes des chapitres de destination
    "consts":{"d":""}, // constantes utilisées, non obligatoires
    "vars":{"a":"", "b":"", "c":["u","v","t","x", "y", "z"]}, // variables utilisées, non obligatoires si dans les options
    "options":[{
        "name":"", // utilisé pour l'affichage des exemples
        "question": ["", ""], // remplace la variable commune, peut être omis
        "answer":"", // remplace la variable commune, peut être omis
        "vars":{}, // remplace les variables communes, peut être omis
        "consts":{}, // remplace les constantes communes, peut être omis
        "value":"" // remplace les valeurs attendues dans réponse online, peut être omis
    }
    ],
    "question":"", // question commune non obligatoire si dans touetes les options
    "answer":"", // réponse commune non obligatoire si dans touetes les options
    "value":""  // valeurs attendue si réponse online commune non obligatoire si dans toutes les options
}
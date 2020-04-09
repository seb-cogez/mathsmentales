## Mathsmentales
Projet de réécriture du site MathsMentales.net qui permet de créer des diaporamas de calcul mental sans effort

### Nouveautés apportées par cette version :
 * nouvelle interface : tous les réglages dans une page, affichage d'exemples de questions pour mieux comprendre
 * possibilité de créer jusqu'à 4 paniers d'activités
 * possibilité d'affichage multiples des questions
   * jusqu'à 4 différents
   * à chaque affichage peut être associé un panier différent

### bibliothèques externes
 * [KateX](https://katex.org/) pour afficher les maths
 * [knack.css](https://www.knacss.com/) framework css simple et léger
 * [bulma-steps](https://github.com/Wikiki/bulma-steps) du projet css [bulma](https://bulma.io/)
 * [math.js](https://mathjs.org/) An extensive math library for Javascript (and Node.js)
 * [Sortable.js](http://sortablejs.github.io/Sortable/) Javascript library for reorderable drag-and-drop lists
 * [seedrandom.js](https://github.com/davidbau/seedrandom) pour créer des nombres aléatoires "controlés"

### Changement de fonctionnement de la bibliothèque d'activités.
Elle est à présent réalisée à l'aide de fichiers json peu complexes

Ces fichiers json comportent des *données obligatoires* :
 * *title* : titre de l'activité
 * *ID* : un identifiant unique de l'activité pour la retrouver facilement dans la base de données, correspond au nom du fichier json : ID.json
 * *vars* : objet json contenant la ou les variables utilisées dans l'activité
   * une variable a pourra être reprise dans une autre variable par un appel de type ${:a}
   * des calculs utilisant la bibliothèque math peuvent être effectués dans les paires d'accolades, exemple : ${math.multiply(:a,:b)}
   * d'autres traitements peuvent être effectués à l'aide de fonctions javascript ${:a.toUpperCase()}
* *question* : chaine unique ou tableau de chaines contenant le texte de la question
  * pour le cas du tableau, il est possible de choisir le type de question à afficher lors du paramétrage de l'activité
* *answer* : chaine unique  ou tableau de chaines contenant la réponse à la question

ainsi que des *données optionnelles* :
 * *description* : texte décrivant de manière plus précise l'activité
 * *options* : tableau d'objets json pouvant contenir *title*, *vars*, *question*, *answer* et/ou *value*
   * une variable non définie prend la valeur de l'objet parent.
 * *value* : chaine ou tableau de chaines contenant les réponses attendues dans le formulaire de réponse en ligne
 * (prochainement) *type* : valeurs possible : "texte", "latex" qui indique le type de rendu des questions/réponses
 * (prochainement) *figure* : chaine contenant une figure illustrant l'activité
---

### Fichiers exemple :

Tables de multiplciation : avec du latex, type par défaut, donc non indiqué

```js
{
    "title":"Tables de Multiplications", // obligatoire
    "ID":"mult", // obligatoire
    "vars":{"a":"1_10", "b":"2_10"}, // a : entier entre 1 et 10 , b entier entre 2 et 10
    "question":["\\bold{${:a}}\\times${:b}", "${:b}\\times\\bold{${:a}}"], // deux types de questions qui permetttent d'intervertir la position de a et de b
    "answer":":question=\\color{red}{${:a*:b}}", // une seule réponse possible on peut reprendre la variable question ici sans ${}, c'est la seule possible dans cette chaine
    "value":"${:a*:b}" // valeur attendue dans le corrigé
}
```
Développer une identité remarquable. vars commun à toutes les options
Il est possible de choisir parmi les types de questions, celle qui sera affichée dans le diaporama.

```js
{
    "title":"Développer une identité remarquable",
    "ID":"devIdRem",
    // var a : entier entre 1 et 10
    // var b : entier entre 2 et 10
    // var c : variable
    "vars":{"a":"1_10", "b":"2_10", "c":["u","v","t","x", "y", "z"]},
    "options":[{
        "name":"(ax+b)²",
        "question": ["(${utils.signIfOne(:a)}${:c}+${:b})^2", "(${:b}+${utils.signIfOne(:a)}${:c})^2"],
        "answer":":question=\\color{red}{${utils.signIfOne(math.pow(:a,2))}${:c}^2+${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}}",
        "value":"${utils.signIfOne(math.pow(:a,2))}${:c}^2+${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}"    
    },
    {
        "name":"(ax-b)²",
        "question": ["(${utils.signIfOne(:a)}${:c}-${:b})^2", "(${:b}-${utils.signIfOne(:a)}${:c})^2"],
        "answer":":question=\\color{red}{${utils.signIfOne(math.pow(:a,2))}${:c}^2-${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}}",
        "value":"${utils.signIfOne(math.pow(:a,2))}${:c}^2-${math.multiply(2,:a,:b)}${:c}+${math.pow(:b,2)}"    
    },
    {
        "name":"(ax-b)(ax+b)",
        "question": [
            "(${utils.signIfOne(:a)}${:c}-${:b})(${utils.signIfOne(:a)}${:c}+${:b})",
            "(${utils.signIfOne(:a)}${:c}-${:b})(${:b}+${utils.signIfOne(:a)}${:c})",
            "(${utils.signIfOne(:a)}${:c}+${:b})(${utils.signIfOne(:a)}${:c}-${:b})",
            "(${:b}+${utils.signIfOne(:a)}${:c})(${utils.signIfOne(:a)}${:c}-${:b})"],
        "answer":":question=\\color{red}{${utils.signIfOne(math.pow(:a,2))}${:c}^2-${math.pow(:b,2)}}",
        "value":"${utils.signIfOne(math.pow(:a,2))}${:c}^2-${math.pow(:b,2)}"    
    }
    ]
}
```
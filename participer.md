Ce document indique comment participer au développement des activités de MathsMentales.

Si vous avez besoin d'une fonction particulière pour créer un exercice, vous pouvez consulter la documentation des fonctions disponibles.

## Installation

### Forge

- Créer un compte sur github.com puis le communiquer à Sébastien COGEZ pour lui signaler votre participation.
- Installer [Visual Studio Code](https://code.visualstudio.com/Download) de Microsoft ou [VSCodium](https://vscodium.com/), la version libre, mais parfois plus compliquée pour la suite.
- Installer [NodeJS](https://nodejs.org/fr/)
- Installer [Git](https://git-scm.com/)
- Installer [GitHub Desktop](https://desktop.github.com/)

### Paramétrage de Visual Studio Code (VSC)

- Ouvrir VSC.
- Ne pas installer de suite le module en français
- Cliquer sur "Source Control" (panneau de gauche) > "Clone Repository" > "Clone from GitHub"
![Cloner depuis GitHub](https://user-images.githubusercontent.com/85620848/155867784-8db0596a-88be-4ee7-9b03-d484ebee41cb.png)
- Se connecter sur GItHub et autoriser VSC à accéder à son compte
- Rechercher "mathsmentales" dans la barre du haut et cliquer sur "seb-cogez/mathsmentales"
![clonage de MathsMentales](https://blog.mathsmentales.net/wp-content/uploads/2022/10/cu251Jz3Wm.png)
- Sélectionner le dossier dans lequel sera copié le code source de MathsMentales et attendre que la copie se termine.
- Une fois le code chargé, cliquer sur la notification en bas à droite pour ouvrir le dossier. ![notification](https://blog.mathsmentales.net/wp-content/uploads/2022/10/BQe6ogm2nX.png)
- Vous avez à présent le code source de MathsMentales ![code source de MM](https://blog.mathsmentales.net/wp-content/uploads/2022/10/Code_CIfqRb7EA9.png)
- Installer les extensions "ESLint" (dans le gestionnaire des extensions) "French Language Pack", "JS & XSS Minifier (Minify), "Live Server", "SVG", GitHub Pull Requests and Issues"

## Créer une activité

Avant de créer une activité, vérifier qu'elle n'a pas déjà été créée en utilisant le moteur de recherche de MathsMentales.

### Arborescence

Les activités se trouvent dans le dossier /library, dans des dossiers rangés par "niveau" N0 devrait comporter la Terminale, N1 la seconde, et on remonte jusqu'à N11 avec le CP. Il y a eu quelques écarts avec :
- NG : les exercices de seconde générale
- NK : les exercices de 1ère et Tale techno
- NT : les exercices de Tale spé

Le nom des activités commence toujours par le nom du niveau où elle se trouve. Des activités prévues pour différents niveaux n'ont pas besoin d'être clonées, il faut juste indiquer dans leur code les niveaux\chapitres visés (Cf exemples dans README.md)
Exemple, dans le dossier NK, on trouvera des activités commençant pas le code du chapitre déterminé dans le fichier /library/structure.json, exemple : Ko1 pour un exercice destiné à être classé dans "Automatismes\Calculs numériques", suit ensuite le numéro de l'activité, qui prend le premier numéro non utilisé dans ce chapitre.

On peut prendre le fichier /library/modele.json pour commencer et enregistrer sous le nom voulu dans le dossier visé, une fois l'ID décidé, qui reprend le nom du fichier.

### Créer une branche GitHub

Avant chaque travail sur des activités, récupérer la dernière version du code de MathsMentales en sélectionnat la **branche master** et en faisant un **pull**. Créer ensuite une **branche** localement, en lui donnant un nom parlant, correspondant aux activités qui vont être créées. Le mieux, c'est une activité par branche, plus facile à corriger ensuite.
Une fois le développement de l'activité terminé, on procèdera à un **push** / **Validation et envoi** de la branche, il restera à indiquer un petit message dans le pull-request proposé par VSC.
![Validation et envoi](https://blog.mathsmentales.net/wp-content/uploads/2022/10/50jcLnkz3z.png)
Une fois validé par Sébastien COGEZ, l'exercice sera référencé dans la bibliothèque et mis en ligne sur MathsMentales par la suite.

### Tester une activité

Depuis VSC, ouvrir index.html, faire un clic droit et choisir **Open With Live Server**. Cela ouvre le navigateur par défaut sur MathsMentales. Pour accéder à un exercice qui n'est pas encore dans la base, il suffit d'ajouter ?u=IDdeLExercice à la fin de index.html dans le navigateur.

À chaque enregistrement dans VSC, la page est mise à jour sur le navigateur, cela permet de trouver assez rapidement les erreurs de programmation. Si rien ne s'affiche, utiliser les outils de Développement du navigateur (F12 ou CTRL + MAJ + I généralement) pour consulter les erreurs javascript. Un passage à la souris sur les exemples de "questions types" permet de voir si les corrigés sont codés correctement également.

## Plus tard
Un éditeur d'activité permettra d'écrire une activité en visualisant les résultats en direct sur la page pour ne pas avoir à jouer avec VSCode.
Espérons que cela arrive vite !
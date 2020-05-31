// Node.js
// Analyse la structure et crée le fichier de référence aux exercices
// remplace le fichier scan.php
const fs = require("fs");
const path = require("path");
const getAllFiles = function(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []
 
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push([file,path.join(__dirname, dirPath, "/", file)])
    }
  })
  return arrayOfFiles
};
const structure = JSON.parse(fs.readFileSync("./structure.json"));
for (let niveau in structure){
  for(let theme in structure[niveau].themes){
    for (let chapter in structure[niveau].themes[theme].chapitres){
      structure[niveau].themes[theme].chapitres[chapter] = {
        "nom":structure[niveau].themes[theme].chapitres[chapter],
        exercices:[]};
    }
  }
}
for (let niveau in structure){
  let listOfFiles = getAllFiles("./N"+niveau);
  listOfFiles.forEach(function(fichierExo){
    let json = JSON.parse(fs.readFileSync(fichierExo[1]));
    let exo = {"url":"N"+niveau+"/"+fichierExo[0], "title":json.title};
    for(let i in json.dest){
      let codechap = json.dest[i];
      let destLevel = codechap.match(/\d+/i);
      let themecode = codechap.match(/\d+[A-Z]/i);
      if(structure[destLevel] !== undefined)
        structure[destLevel].themes[themecode].chapitres[codechap].exercices.push(exo);
    }
  })
}
let data = JSON.stringify(structure);
fs.writeFileSync("content.json", data);
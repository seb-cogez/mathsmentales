<?php
/**
 * On créé des identifiants pour les élèves, ainsi que l'url d'accès à la ressource
 * Ce fichier reçoit des données en GET :
 * n : le nombre de codes à enregistrer
 * params : un json qui contient les paramètres permettant de reconstruire le panier (unique pour un passage en ligne)
 * 
 * Les codes générés pour les élève sont du type xxxxxxx|s|nnn
 * xxx est la date en secondes UNIX, en base 21, s est une lettre de séparation, nnn est un nombre en base 21; (on évite le l / 1)
 */
if(!filter_has_var(INPUT_GET, "n")){
    echo("nodata");
} else {
    /**
     * fonction qui permet de tester si une chaine est du json
     */
    function isJson($string) {
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
       }
    if(!is_numeric($_GET['n'])) die("dataerror");
    if(!isJson($_GET["params"])) die("datajsonerror");
    // on a donc le nombre de codes demandés à retourner
    $n = (int) $_GET["n"];
    $t = time();
    // on convertit le nombre obtenu (secondes depuis le 0 UNIX) en base 21
    $tb21 = base_convert($t,10,21); // une chaine de 7 caractères
    $content = $tb21.";".$_GET["params"]; // on stocke sur la première ligne le code
    $sample="abcdefghjkmnprst";
    $separator= substr($sample,rand(0,strlen($sample),1)); // on tire l'une des lettres au hasard
    $elevecode = 0;
    for ($i=0;$i<$n;$i++){
        $elevecode += rand(22,50); // on génère des codes qui ne se suivent pas vraiment pour prévenir quelques dérives
        $content += "\r\n". ($tb1 . $separator . base_convert($elevecode,10,21));
    }
    // on stocke tout ça dans un fichier :
    file_put_contents("sessions/".$t.$separator.".txt",$content);
    // on renvoie les données à l'utilisateur pour qu'il puisse donner les codes à ses élèves.
    echo $content;
}
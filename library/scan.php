<?php
$structure = json_decode(file_get_contents("./structure.json"));
<<<<<<< HEAD
=======
$dirs = [];
>>>>>>> Mise à jour suite à lecture de doc de VS studio + git
foreach($structure as $key => $val){
	if(is_object($structure->$key->themes)){
		foreach($structure->$key->themes as $kt => $vt){
			foreach($structure->$key->themes->$kt->chapitres as $kc => $vc){
<<<<<<< HEAD
				$name = $vc;
				$structure->$key->themes->$kt->chapitres->$kc = array("nom" => $vc, "exercices" => array());
=======
				$structure->$key->themes->$kt->chapitres->$kc = (object)array("nom" => $vc, "exercices" => array());
>>>>>>> Mise à jour suite à lecture de doc de VS studio + git
			}
		}
	}
	$dir = "N".$key;
	if(is_dir($dir)){
<<<<<<< HEAD
		echo "Scan de ". $dir."<br>";
		scan($dir);
=======
		$dirs[] = $dir;
		echo "Scan du dossier ". $dir." programmé<br>";
>>>>>>> Mise à jour suite à lecture de doc de VS studio + git
	} else {
		echo "Pas de dossier " . $dir."<br>";
	}
}
<<<<<<< HEAD
=======
/*
echo"<pre>";
var_dump($structure);
echo"</pre>";
*/
//
foreach($dirs as $dir){
	echo "Scan de ".$dir."<br>";
	scan($dir);
}
>>>>>>> Mise à jour suite à lecture de doc de VS studio + git

// This function scans the files folder recursively, and builds the complete library
function scan($dir){
	global $structure;
	$files = array();
	// Is there actually such a folder/file?
	if(file_exists($dir)){
		foreach(scandir($dir) as $f) {
			if(!$f || $f[0] == '.') {
				continue; // Ignore hidden files
			}
			if(is_dir($dir . '/' . $f)) {
				// The path is a folder
				scan($dir . '/' . $f);
			}
			else {
				$path = pathinfo($f);
				if(strtolower($path['extension']) == "json"){
					$exercice = json_decode(file_get_contents($dir.'/'.$f));
					foreach($exercice->dest as $cle => $dest){
						$exo = array("url"=>$dir."/".$f, "title" => $exercice->title);
						preg_match('/(((\d+)[A-Z])[A-Z])/', $dest, $m);
<<<<<<< HEAD
						if(is_array($structure->$m[3]->themes->$m[2]->chapitres->{$m[1]}["exercices"])){
							$structure->$m[3]->themes->$m[2]->chapitres->{$m[1]}["exercices"][] = $exo;
							echo $m[1] . "inséré <br>";
=======
						if(is_array($structure->$m[3]->themes->$m[2]->chapitres->$m[1]->exercices)){
							$structure->$m[3]->themes->$m[2]->chapitres->$m[1]->exercices[] = $exo;
							echo $dir."/".$f . " inséré dans ".$m[1] . "<br>";
>>>>>>> Mise à jour suite à lecture de doc de VS studio + git
						}
					}
				}
			}
		}
	}
	return $files;
}

// Output the directory listing as JSON

file_put_contents('content.json',json_encode($structure));// ,JSON_PRETTY_PRINT
echo "Arborescence mise à jour";

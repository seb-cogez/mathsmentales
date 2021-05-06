<?php
/**
 * script qui envoie l'url longue au raccourcisseur d'url
 */
$api_url =  'http://bref.jeduque.net/MathsMentalesShortener.php';
// Init the CURL session
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_HEADER, 0);            // No header in the result
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return, do not echo result
curl_setopt($ch, CURLOPT_POST, 1);              // This is a POST request
curl_setopt($ch, CURLOPT_POSTFIELDS, array(     // Data to POST
        'url' => $_GET['url'],
    ));
// Fetch and return content
$data = curl_exec($ch);
curl_close($ch);

// Do something with the result. Here, we echo the long URL
echo $data;
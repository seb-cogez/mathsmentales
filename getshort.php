<?php
//if($_GET['url']=="")die();
// echo file_get_contents("http://bref.jeduque.net/MathsMentalesShortener.php?url=".$_GET['url']);
/*$postdata = http_build_query(
    array(
        'url' => $_GET['url']
    )
);
$opts = array("http" => array(
    'method' => "POST",
    'header' => 'Content-Type: application/x-www-form-urlencoded',
    'content' => $postdata
    )
);
$context = stream_context_create($opts);
echo file_get_contents("http://bref.jeduque.net/MathsMentalesShortener.php",false,$context);

*/
$api_url =  'http://bref.jeduque.net/MathsMentalesShortener.php';
// Init the CURL session
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_HEADER, 0);            // No header in the result
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return, do not echo result
curl_setopt($ch, CURLOPT_POST, 1);              // This is a POST request
curl_setopt($ch, CURLOPT_POSTFIELDS, array(     // Data to POST
        'shorturl' => $_GET['url'],
    ));

// Fetch and return content
$data = curl_exec($ch);
curl_close($ch);

// Do something with the result. Here, we echo the long URL
echo $data;
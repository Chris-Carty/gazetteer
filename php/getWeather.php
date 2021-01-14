<?php

    $executionStartTime = microtime(true) / 1000;

    $url='http://api.weatherbit.io/v2.0/forecast/daily?city=' . $_REQUEST['city'] . ',' . $_REQUEST['country'] . '&days=5&units=m&key=7a31f5d9a8ac49d7b5ebbc11a99b17b4';
	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['weatherData'] = $decode['data'];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
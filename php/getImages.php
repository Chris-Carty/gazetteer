<?php

    $executionStartTime = microtime(true) / 1000;
    

    $url='https://pixabay.com/api/?key=19901724-68178cc585928a23653000e6b&q=' . $_REQUEST['country'] . '&image_type=photo&per_page=6&orientation=vertical';

	
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    header('Content-Type: application/json; charset=UTF-8');

	echo $result
	
?>	
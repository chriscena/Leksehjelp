<?php
require_once("admin.inc");
header("Content-Type: application/json");

$result = "[]";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	$action = filter_input(INPUT_POST, "a", FILTER_SANITIZE_STRING);

	switch ($action) {
		case "cc":
			$name = filter_input(INPUT_POST, "n", FILTER_SANITIZE_STRING);
			$language = filter_input(INPUT_POST, "l", FILTER_SANITIZE_STRING);
			$result = CreateCollection($name, $language);
			break;
		case "cw":
			$collectionId = filter_input(INPUT_POST, "cid", FILTER_SANITIZE_NUMBER_INT);
			$norwegianWord = filter_input(INPUT_POST, "nw", FILTER_SANITIZE_STRING);
			$norwegianWordAudio = CreateAudioFile("no", $norwegianWord);
			
			$lang = filter_input(INPUT_POST, "l", FILTER_SANITIZE_STRING);
			$foreignWordAudio = null;
			$foreignWord = null;
			if ($lang != "no") {
				$foreignWord = filter_input(INPUT_POST, "fw", FILTER_SANITIZE_STRING);
				$foreignWordAudio = CreateAudioFile($lang, $foreignWord);
			}

			$result = CreateWord($collectionId, $lang, $norwegianWord, $norwegianWordAudio, $foreignWord, $foreignWordAudio);
			break;
		case "dw":
			$index = filter_input(INPUT_POST, "i", FILTER_SANITIZE_NUMBER_INT);
			DeleteWord($index);
		default:
			$result = "[]";
			break;
	}
} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
	$action = filter_input(INPUT_GET, "a", FILTER_SANITIZE_STRING);

	switch ($action) {
		case "gc":
			$result = GetCollections();
			break;
		case "gw":
			$index = filter_input(INPUT_GET, "i", FILTER_SANITIZE_NUMBER_INT);
			$result = GetWords($index);
			break;
		default:
			$result = "[]";
			break;
	}
}

echo json_encode($result);

<?php
ini_set("default_charset", "utf-8");
require_once("../../leksehjelp.dbsettings.inc");

function CreateCollection($name, $language) {
	try {
	    $dbh = new PDO($GLOBALS["dsn"], $GLOBALS["user"], $GLOBALS["password"]);

		$sth = $dbh->prepare("insert into words_collection (name, lang) values (:name, :lang)");
		$sth->execute(array(":name" => $name, ":lang" => $language));
		$collectionid = $dbh->lastInsertId();

		return array("collectionid" => $collectionid, "name" => $name, "lang" => $lang);

	} catch (PDOException $e) {
	    return array("error" => "Connection failed: " . $e->getMessage());
	}
}

function CreateWord($collectionid, $lang, $norword, $norwordaudio, $foreignword, $foreignwordaudio) {
	try {
	    $dbh = new PDO($GLOBALS["dsn"], $GLOBALS["user"], $GLOBALS["password"]);

		$sth = $dbh->prepare("insert into words_word "
			."(collectionid, lang, norword, norwordaudio, foreignword, foreignwordaudio) "
			."values (:collectionid, :lang, :norword, :norwordaudio, :foreignword, :foreignwordaudio)");
		$sth->execute(array(":collectionid" => $collectionid, ":lang" => $lang,
			":norword" => $norword, ":norwordaudio" => $norwordaudio, 
			":foreignword" => $foreignword, ":foreignwordaudio" => $foreignwordaudio));
		$wordid = $dbh->lastInsertId();

		return array("wordid" => $wordid, "collectionid" => $collectionid, 
				"lang" => $lang, "norword" => $norword, "norwordaudio" => $norwordaudio, 
				"foreignword" => $foreignword, "foreignwordaudio" => $foreignwordaudio);

	} catch (PDOException $e) {
	    return array("error" => "Connection failed: " . $e->getMessage());
	}
}

function GetCollections() {
	try {
	    $dbh = new PDO($GLOBALS["dsn"], $GLOBALS["user"], $GLOBALS["password"]);

		$sth = $dbh->prepare("select collectionid, name, lang from words_collection order by collectionid desc");
		$sth->execute();
		$result = $sth->fetchAll(PDO::FETCH_ASSOC);
		return $result;

	} catch (PDOException $e) {
	    return array("error" => "Connection failed: " . $e->getMessage());
	}
}

function GetWords($collectionid) {
	try {
	    $dbh = new PDO($GLOBALS["dsn"], $GLOBALS["user"], $GLOBALS["password"]);

		$sth = $dbh->prepare("select collectionid, name, lang from words_collection where collectionid = :collectionid");
		$sth->execute(array(":collectionid" => $collectionid));
		$result = $sth->fetchAll(PDO::FETCH_ASSOC);

		$sth = $dbh->prepare("select wordid, collectionid, lang, norword, norwordaudio, foreignword, foreignwordaudio "
			."from words_word where collectionid = :collectionid");
		$sth->execute(array(":collectionid" => $collectionid));
		$result[0]["words"] = $sth->fetchAll(PDO::FETCH_ASSOC);
		return $result[0];

	} catch (PDOException $e) {
	    return array("error" => "Connection failed: " . $e->getMessage());
	}
}

function DeleteWord($wordid) {
	try {
	    $dbh = new PDO($GLOBALS["dsn"], $GLOBALS["user"], $GLOBALS["password"]);

		$sth = $dbh->prepare("select wordid, collectionid, lang, norword, norwordaudio, foreignword, foreignwordaudio "
			."from words_word where wordid = :wordid");
		$sth->execute(array(":wordid" => $wordid));
		$result = $sth->fetchAll(PDO::FETCH_ASSOC);

		$sth = $dbh->prepare("select count(*) as files "
			."from words_word where norwordaudio = :filename "
			."or foreignwordaudio = :filename");
		$sth->execute(array(":filename" => $result["norwordaudio"]));
		$files = $sth->fetchAll(PDO::FETCH_ASSOC);

		if ($files["files"] == 1)
			DeleteAudioFile($result["norwordaudio"]);

		if ($result["lang"] != "no") {
			$sth->execute(array(":filename" => $result["foreignwordaudio"]));
			$files = $sth->fetchAll(PDO::FETCH_ASSOC);

			if ($files["files"] == 1)
				DeleteAudioFile($result["foreignwordaudio"]);
		}

		$sth = $dbh->prepare("delete from words_word where wordid = :wordid");
		$sth->execute(array(":wordid" => $wordid));

		return array("wordid" => $wordid);

	} catch (PDOException $e) {
	    return array("error" => "Connection failed: " . $e->getMessage());
	}
}

function DeleteAudioFile($file) {
	try {
	    unlink("audio/" . $file);

	} catch (PDOException $e) {
	    return array("error" => "Connection failed: " . $e->getMessage());
	}
}


function CreateAudioFile($language, $word) {
	$wordToConvert = substr($word, 0, 100);
	$langToUse = substr($language, 0, 2);

	$file  = md5($langToUse . $wordToConvert) . ".mp3";

	$filepath = "audio/" . $file;

	if (!file_exists($filepath)) {
		
		$url = "http://translate.google.com/translate_tts?tl=" 
			. $langToUse . "&q=". urlencode($wordToConvert);
		
		$ch = curl_init();
	    curl_setopt($ch, CURLOPT_URL, $url);
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	    // As found in http://www.useragentstring.com/
	    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36");
		$mp3 = curl_exec($ch);
	    curl_close($ch);

		file_put_contents($filepath, $mp3);
	}
	
	return $file;
}
<?php

/**
 * Publish progress verifier
 */
class VerifyUtil {
	
	/**
	 * @param string $path
	 * @return stdClass
	 */
	private static function buildPathInfo($path, $fileName, $relPath) {
		$inf = (object) array(
			'type' => '-',
			'perms' => null,
			'user' => null,
			'group' => null,
			'size' => 0,
			'time' => null,
			'name' => $fileName,
			'path' => $relPath
		);
		if (is_dir($path)) {
			$inf->type = 'd';
			$inf->time = date('c', filemtime($path));
		} else {
			$stat = stat($path);
			$inf->user = $stat['uid'];
			$inf->group = $stat['gid'];
			$inf->size = $stat['size'];
			$inf->time = date('c', $stat['mtime']);
		}
		return $inf;
	}
	
	/**
	 * Get folder file tree
	 * @param string $dir folder path to get tree from
	 * @param string $rel relative path
	 * @param string $sdir published site root folder name
	 * @return array
	 */
	public static function getFileTree($dir, $rel = null, $sdir = null) {
		$list = array();
		clearstatcache();
		if (is_dir($dir)) {
			$fullDir = $dir.($rel ? ('/'.$rel) : '');
			// PHP on Windows bug workaround (https://bugs.php.net/bug.php?id=43817).
			if ($sdir && strpos($fullDir, '\\') !== false && ($dh = @opendir($fullDir)) === false) {
				$cFiles = array('index.php', 'web.config', 'web.config.backup', '.htaccess');
				foreach ($cFiles as $cFile) {
					$cFilePath = $fullDir.'/'.$cFile;
					$cFileRel = ($rel ? ($rel.'/') : '').$cFile;
					if (!is_file($cFilePath) || !is_readable($cFilePath)) continue;
					$inf = self::buildPathInfo($cFilePath, $cFile, $cFileRel);
					$list[$inf->path] = $inf;
				}
				$fullDir .= '/'.$sdir;
				$rel = ($rel ? ($rel.'/') : '').$sdir;
				$sdir = null;
			} else if (isset($dh) && $dh !== false) {
				closedir($dh);
			}
			if (($dh = opendir($fullDir))) {
				while (($file = readdir($dh)) !== false) {
					if ($file == '.' || $file == '..') { continue; }
					$rel_path = ($rel ? ($rel.'/') : '').$file;
					$path = $dir.'/'.$rel_path;
					if ($sdir && is_dir($path) && $file != $sdir) continue;
					$inf = self::buildPathInfo($path, $file, $rel_path);
					$list[$inf->path] = $inf;
					if (is_dir($path)) {	
						// do not pass $sdir here
						$list = array_merge($list, self::getFileTree($dir, $rel_path));
					}
				}
				closedir($dh);
			} else if (is_null($rel)) {
				// indicate that getting file tree failed
				return null;
			}
		}
		return $list;
	}
	
	public static function main() {
		$innerVerify = (defined('__INNER_VERIFY__') && __INNER_VERIFY__);
		if (!$innerVerify) { header('Content-Type: application/json; charset=utf-8'); }
		@set_time_limit(0);
		$sdir = (isset($_GET['sdir']) && $_GET['sdir']) ? $_GET['sdir']
				: (defined('__INNER_VERIFY_SDIR__') && __INNER_VERIFY_SDIR__ ? __INNER_VERIFY_SDIR__ : null);
		if (function_exists('json_encode')) {
			echo json_encode(self::getFileTree(dirname(__DIR__), null, $sdir));
		}
		@unlink(__FILE__);
		if (!$innerVerify) exit();
	}
	
}

if (!function_exists('json_encode') && file_exists(dirname(__FILE__).'/class.json.php')) {
	require(dirname(__FILE__).'/class.json.php');
	function json_encode($value) {
		$srvc = new Services_JSON();
		return $srvc->encode($value);
	}
}

VerifyUtil::main();

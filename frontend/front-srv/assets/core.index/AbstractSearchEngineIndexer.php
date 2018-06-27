<?php
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

namespace Pydio\Access\Indexer\Core;

use DOMNode;
use DOMXPath;
use Pydio\Access\Core\Model\Node;
use Pydio\Core\Model\ContextInterface;
use Pydio\Core\Services\ApplicationState;
use Pydio\Core\Utils\Vars\StatHelper;

use Pydio\Core\Utils\Vars\VarsFilter;
use Pydio\Access\Meta\Core\AbstractMetaSource;

/**
 * Class AbstractSearchEngineIndexer
 * @package Pydio\Access\Indexer\Core
 */
abstract class AbstractSearchEngineIndexer extends AbstractMetaSource
{

    /**
     * @param Node $node
     * @return null|string
     */
    protected function extractIndexableContent($node)
    {

        $ext = strtolower(pathinfo($node->getLabel(), PATHINFO_EXTENSION));
        if (in_array($ext, explode(",", $this->getContextualOption($node->getContext(), "PARSE_CONTENT_TXT")))) {
            return file_get_contents($node->getUrl());
        }
        $unoconv = $this->getContextualOption($node->getContext(), "UNOCONV");
        $pipe = false;
        if (!empty($unoconv) && in_array($ext, array("doc", "odt", "xls", "ods"))) {
            $targetExt = "txt";
            if (in_array($ext, array("xls", "ods"))) {
                $targetExt = "csv";
            } else if (in_array($ext, array("odp", "ppt"))) {
                $targetExt = "pdf";
                $pipe = true;
            }
            $realFile = call_user_func(array($node->wrapperClassName, "getRealFSReference"), $node->getUrl());
            $unoconv = "HOME=" . ApplicationState::getTemporaryFolder() . " " . $unoconv . " --stdout -f $targetExt " . escapeshellarg($realFile);
            if ($pipe) {
                $newTarget = str_replace(".$ext", ".pdf", $realFile);
                $unoconv .= " > $newTarget";
                register_shutdown_function("unlink", $newTarget);
            }
            $output = array();
            exec($unoconv, $output, $return);
            if (!$pipe) {
                $out = implode("\n", $output);
                $enc = 'ISO-8859-1';
                $asciiString = iconv($enc, 'ASCII//TRANSLIT//IGNORE', $out);
                return $asciiString;
            } else {
                $ext = "pdf";
            }
        }
        $pdftotext = $this->getContextualOption($node->getContext(), "PDFTOTEXT");
        if (!empty($pdftotext) && in_array($ext, array("pdf"))) {
            $realFile = call_user_func(array($node->wrapperClassName, "getRealFSReference"), $node->getUrl());
            if ($pipe && isset($newTarget) && is_file($newTarget)) {
                $realFile = $newTarget;
            }
            $cmd = $pdftotext . " " . escapeshellarg($realFile) . " -";
            $output = array();
            exec($cmd, $output, $return);
            $out = implode("\n", $output);
            $enc = 'UTF8';
            $asciiString = iconv($enc, 'ASCII//TRANSLIT//IGNORE', $out);
            return $asciiString;
        }
        return null;
    }

    /**
     * @param String $query
     * @return String mixed
     */
    protected function filterSearchRangesKeywords($query)
    {
        if (strpos($query, "PYDIO_SEARCH_RANGE_TODAY") !== false) {
            $t1 = date("Ymd");
            $t2 = date("Ymd");
            $query = str_replace("PYDIO_SEARCH_RANGE_TODAY", "[$t1 TO  $t2]", $query);
        } else if (strpos($query, "PYDIO_SEARCH_RANGE_YESTERDAY") !== false) {
            $t1 = date("Ymd", mktime(0, 0, 0, date('m'), date('d') - 1, date('Y')));
            $t2 = date("Ymd", mktime(0, 0, 0, date('m'), date('d') - 1, date('Y')));
            $query = str_replace("PYDIO_SEARCH_RANGE_YESTERDAY", "[$t1 TO $t2]", $query);
        } else if (strpos($query, "PYDIO_SEARCH_RANGE_LAST_WEEK") !== false) {
            $t1 = date("Ymd", mktime(0, 0, 0, date('m'), date('d') - 7, date('Y')));
            $t2 = date("Ymd", mktime(0, 0, 0, date('m'), date('d'), date('Y')));
            $query = str_replace("PYDIO_SEARCH_RANGE_LAST_WEEK", "[$t1 TO $t2]", $query);
        } else if (strpos($query, "PYDIO_SEARCH_RANGE_LAST_MONTH") !== false) {
            $t1 = date("Ymd", mktime(0, 0, 0, date('m') - 1, date('d'), date('Y')));
            $t2 = date("Ymd", mktime(0, 0, 0, date('m'), date('d'), date('Y')));
            $query = str_replace("PYDIO_SEARCH_RANGE_LAST_MONTH", "[$t1 TO $t2]", $query);
        } else if (strpos($query, "PYDIO_SEARCH_RANGE_LAST_YEAR") !== false) {
            $t1 = date("Ymd", mktime(0, 0, 0, date('m'), date('d'), date('Y') - 1));
            $t2 = date("Ymd", mktime(0, 0, 0, date('m'), date('d'), date('Y')));
            $query = str_replace("PYDIO_SEARCH_RANGE_LAST_YEAR", "[$t1 TO $t2]", $query);
        }

        $split = array_map("trim", explode("AND", $query));
        foreach ($split as $s) {
            list($k, $v) = explode(":", $s, 2);
            if ($k == "ajxp_bytesize") {
                //list($from, $to) = sscanf($v, "[%s TO %s]");
                preg_match('/\[(.*) TO (.*)\]/', $v, $matches);
                $oldSize = $s;
                $newSize = "ajxp_bytesize:[" . intval(StatHelper::convertBytes($matches[1])) . " TO " . intval(StatHelper::convertBytes($matches[2])) . "]";
            }
        }
        if (isSet($newSize) && isSet($oldSize)) {
            $query = str_replace($oldSize, $newSize, $query);
        }

        return $query;
    }

    /**
     * @param ContextInterface $ctx
     * @return string
     */
    protected function buildSpecificId(ContextInterface $ctx)
    {
        $specificId = "";
        $specKey = $this->getContextualOption($ctx, "repository_specific_keywords");
        if (!empty($specKey)) {
            $specificId = "-" . str_replace(array(",", "/"), array("-", "__"), VarsFilter::filter($specKey, $ctx));
        }
        return $ctx->getRepositoryId() . $specificId;
    }

} 
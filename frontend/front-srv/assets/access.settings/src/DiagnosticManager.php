<?php
/*
 * Copyright 2007-2017 Abstrium <contact (at) pydio.com>
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
 * The latest code can be found at <https://pydio.com/>.
 */
namespace Pydio\Access\Driver\DataProvider\Provisioning;

use Psr\Http\Message\ServerRequestInterface;
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Model\NodesList;
use Pydio\Core\Utils\Reflection\DiagnosticRunner;

defined('PYDIO_EXEC') or die('Access not allowed');


/**
 * Class DiagnosticManager
 * @package Pydio\Access\Driver\DataProvider\Provisioning
 */
class DiagnosticManager extends AbstractManager
{

    /**
     * @param ServerRequestInterface $requestInterface Full set of query parameters
     * @param string $rootPath Path to prepend to the resulting nodes
     * @param string $relativePath Specific path part for this function
     * @param string $paginationHash Number added to url#2 for pagination purpose.
     * @param string $findNodePosition Path to a given node to try to find it
     * @param string $aliasedDir Aliased path used for alternative url
     * @return NodesList A populated NodesList object, eventually recursive.
     */
    public function listNodes(ServerRequestInterface $requestInterface, $rootPath, $relativePath, $paginationHash = null, $findNodePosition = null, $aliasedDir = null)
    {
        $outputArray    = array();
        $testedParams   = array();
        $path           = "/$rootPath/$relativePath";
        $nodesList      = new NodesList($path);

        DiagnosticRunner::runTests($outputArray, $testedParams);
        DiagnosticRunner::testResultsToFile($outputArray, $testedParams);

        $nodesList->initColumnsData("filelist", "list", "settings.diagnostic");
        $nodesList->appendColumn("settings.23", "ajxp_label");
        $nodesList->appendColumn("settings.24", "data");

        if (is_file(PYDIO_TESTS_RESULT_FILE) || is_file(PYDIO_TESTS_RESULT_FILE_LEGACY)) {
            if(is_file(PYDIO_TESTS_RESULT_FILE_LEGACY)){
                include_once(PYDIO_TESTS_RESULT_FILE_LEGACY);
            }else{
                include_once(PYDIO_TESTS_RESULT_FILE);
            }
            if (isset($diagResults)) {
                foreach ($diagResults as $id => $value) {
                    $nodeKey = $path."/".$id;
                    $meta = [
                        "text"      => $id,
                        "data"      => $value,
                        "ajxp_mime" => "testResult"
                    ];
                    $nodesList->addBranch(new Node($nodeKey, $meta));
                }
            }
        }
        return $nodesList;

    }
}
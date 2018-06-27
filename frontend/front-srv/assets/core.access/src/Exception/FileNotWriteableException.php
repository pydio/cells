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
namespace Pydio\Access\Core\Exception;

use Pydio\Access\Core\Model\Node;
use Pydio\Core\Exception\PydioException;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class FileNotWriteableException
 * @package Pydio\Access\Core\Exception
 */
class FileNotWriteableException extends PydioException
{
    /**
     * FileNotWriteableException constructor.
     * @param Node $node
     */
    public function __construct($node)
    {
        parent::__construct("File ".$node->getPath()." is not writeable");
    }
}
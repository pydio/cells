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
namespace Pydio\Access\Core;

use Pydio\Core\Utils\TextEncoder;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Encode/Decode Class EncodingWrapper
 * @package Pydio\Access\Core
 */
class EncodingWrapper extends SchemeTranslatorWrapper
{
    /**
     * Source is the underlying FS encoding
     * @var string
     */
    private $sourceEncoding;
    /**
     * Target is the application encoding, should be utf8
     * @var string
     */
    private $targetEncoding;

    /**
     * @param $path
     * @return string
     */
    protected static function encode($path){
        return TextEncoder::fromStorageEncoding($path);
    }

    /**
     * @param $path
     * @return string
     */
    protected static function decode($path){
        return TextEncoder::toStorageEncoding($path);
    }

    /**
     * EncodingWrapper constructor.
     * @param $sourceEncoding
     * @param string $targetEncoding
     */
    public function __construct($sourceEncoding = 'UTF-8', $targetEncoding = 'UTF-8')
    {
        $this->sourceEncoding = $sourceEncoding;
        $this->targetEncoding = $targetEncoding;
    }

    /*****************/
    /* DECODE INPUTS */
    /*****************/

    /**
     * @param string $path
     * @param int $options
     * @return bool
     */
    public function dir_opendir($path, $options)
    {
        return parent::dir_opendir($this->decode($path), $options);
    }

    /**
     * @param string $path
     * @param string $mode
     * @param int $options
     * @param string $context
     * @return bool
     */
    public function stream_open($path, $mode, $options, &$context)
    {
        return parent::stream_open($this->decode($path), $mode, $options, $context);
    }

    /**
     * @param string $path
     * @param int $mode
     * @param int $options
     * @return bool
     */
    public function mkdir($path, $mode, $options)
    {
        return parent::mkdir($this->decode($path), $mode, $options);
    }

    /**
     * @param string $path_from
     * @param string $path_to
     * @return bool
     */
    public function rename($path_from, $path_to)
    {
        return parent::rename($this->decode($path_from), $this->decode($path_to));
    }

    /**
     * @param string $path
     * @param int $options
     * @return bool
     */
    public function rmdir($path, $options)
    {
        return parent::rmdir($this->decode($path), $options);
    }

    /**
     * @param string $path
     * @return bool
     */
    public function unlink($path)
    {
        return parent::unlink($this->decode($path));
    }

    /**
     * @param string $path
     * @param int $flags
     * @return array
     */
    public function url_stat($path, $flags)
    {
        return parent::url_stat($this->decode($path), $flags);
    }

    /******************/
    /* ENCODE OUTPUTS */
    /******************/

    /**
     * @return string
     */
    public function dir_readdir()
    {
        $data = parent::dir_readdir();
        if(!empty($data) && is_string($data)){
            return $this->encode($data);
        }else{
            return $data;
        }
    }


    /**
     * Get a "usable" reference to a file : the real file or a tmp copy.
     * Return the "storage-encoded" version of the path.
     *
     * @param string $path
     * @param bool $persistent
     * @return string
     * @throws \Exception
     */
    public static function getRealFSReference($path, $persistent = false)
    {
        $wrapper = self::findSubWrapperClassName($path);
        return call_user_func(array($wrapper, "getRealFSReference"), self::translateScheme(self::decode($path)), $persistent);
    }

    /**
     * Read a file (by chunks) and copy the data directly inside the given stream.
     *
     * @param string $path
     * @param resource $stream
     */
    public static function copyFileInStream($path, $stream)
    {
        $wrapper = self::findSubWrapperClassName($path);
        call_user_func(array($wrapper, "copyFileInStream"), self::translateScheme(self::decode($path)), $stream);
    }

    /**
     * Chmod implementation for this type of access.
     *
     * @param string $path
     * @param number $chmodValue
     */
    public static function changeMode($path, $chmodValue)
    {
        $wrapper = self::findSubWrapperClassName($path);
        call_user_func(array($wrapper, "changeMode"), self::translateScheme(self::decode($path)), $chmodValue);
    }


}
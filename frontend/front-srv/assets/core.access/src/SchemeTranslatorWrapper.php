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
 * The latest code can be found at <https://pydio.com>.
 */
namespace Pydio\Access\Core;

defined('PYDIO_EXEC') or die('Access not allowed');

/**
 * Class SchemeTranslatorWrapper
 * Simple Wrapper that justs converts a given protocol to another one.
 *
 * @package Pydio
 * @subpackage Core
 */
class SchemeTranslatorWrapper extends MetaStreamWrapper implements IPydioWrapper
{
    /**
     * @var resource
     */
    protected $handle;

    /**
     * @var string
     */
    protected $currentDirPath;


    /**
     * Initialise the path for a file
     */
    public static function applyInitPathHook($path, $context = 'core') {
        //Do nothing
    }

    /**
     * Get a "usable" reference to a file : the real file or a tmp copy.
     *
     * @param string $path
     * @param bool $persistent
     * @return string
     * @throws \Exception
     */
    public static function getRealFSReference($path, $persistent = false)
    {
        $wrapper = MetaStreamWrapper::findSubWrapperClassName($path);
        return call_user_func(array($wrapper, "getRealFSReference"), MetaStreamWrapper::translateScheme($path), $persistent);
    }

    /**
     * Read a file (by chunks) and copy the data directly inside the given stream.
     *
     * @param string $path
     * @param resource $stream
     */
    public static function copyFileInStream($path, $stream)
    {
        $wrapper = MetaStreamWrapper::findSubWrapperClassName($path);
        call_user_func(array($wrapper, "copyFileInStream"), MetaStreamWrapper::translateScheme($path), $stream);
    }

    /**
     * Chmod implementation for this type of access.
     *
     * @param string $path
     * @param number $chmodValue
     */
    public static function changeMode($path, $chmodValue)
    {
        $wrapper = MetaStreamWrapper::findSubWrapperClassName($path);
        call_user_func(array($wrapper, "changeMode"), MetaStreamWrapper::translateScheme($path), $chmodValue);
    }

    /**
     *
     *
     * @return bool
     */
    public function dir_closedir()
    {
        $this->currentDirPath = null;
        if(isSet($this->handle) && is_resource($this->handle)){
            closedir($this->handle);
        }
    }

    /**
     * Enter description here...
     *
     * @param string $path
     * @param int $options
     * @return bool
     */
    public function dir_opendir($path, $options)
    {
        $newPath = MetaStreamWrapper::translateScheme($path);
        $this->handle = opendir($newPath);
        if($this->handle !== false){
            $this->currentDirPath = $path;
            return true;
        }else{
            return false;
        }
    }

    /**
     * Enter description here...
     *
     * @return string
     */
    public function dir_readdir()
    {
        if(isSet($this->handle) && is_resource($this->handle)){
            return readdir($this->handle);
        }
        return false;
    }

    /**
     * Enter description here...
     *
     * @return bool
     */
    public function dir_rewinddir()
    {
        //$this->currentDirPath = null;
        if(isSet($this->handle) && is_resource($this->handle)){
            return rewind($this->handle);
        }
        return false;
    }

    /**
     * Enter description here...
     *
     * @param string $path
     * @param int $mode
     * @param int $options
     * @return bool
     */
    public function mkdir($path, $mode, $options)
    {
        return mkdir(MetaStreamWrapper::translateScheme($path), $mode, $options);
    }

    /**
     * Enter description here...
     *
     * @param string $path_from
     * @param string $path_to
     * @return bool
     */
    public function rename($path_from, $path_to)
    {
        return rename(MetaStreamWrapper::translateScheme($path_from), MetaStreamWrapper::translateScheme($path_to));
    }

    /**
     * Enter description here...
     *
     * @param string $path
     * @param int $options
     * @return bool
     */
    public function rmdir($path, $options)
    {
        if(is_resource($options)){
            return rmdir(MetaStreamWrapper::translateScheme($path), $options);
        }else{
            return rmdir(MetaStreamWrapper::translateScheme($path));
        }
    }

    /**
     * Enter description here...
     *
     */
    public function stream_close()
    {
        if(isSet($this->handle) && is_resource($this->handle)){
            return fclose($this->handle);
        }
        return false;
    }

    /**
     * Enter description here...
     *
     * @return bool
     */
    public function stream_eof()
    {
        if(isSet($this->handle) && is_resource($this->handle)){
            return feof($this->handle);
        }
        return false;
    }

    /**
     * Enter description here...
     *
     * @return bool
     */
    public function stream_flush()
    {
        if(isSet($this->handle) && is_resource($this->handle)){
            return fflush($this->handle);
        }
        return false;
    }

    /**
     * Enter description here...
     *
     * @param string $path
     * @param string $mode
     * @param int $options
     * @param string &$context
     * @return bool
     */
    public function stream_open($path, $mode, $options, &$context)
    {
        if(is_resource($context)){
            $this->handle = fopen(MetaStreamWrapper::translateScheme($path), $mode, $options, $context);
        }else{
            $this->handle = fopen(MetaStreamWrapper::translateScheme($path), $mode, $options);
        }
        return ($this->handle !== false);
    }

    /**
     * Enter description here...
     *
     * @param int $count
     * @return string
     */
    public function stream_read($count)
    {
        if(isSet($this->handle) && is_resource($this->handle)){
            return fread($this->handle, $count);
        }
        return null;
    }

    /**
     * Enter description here...
     *
     * @param int $offset
     * @param int $whence = SEEK_SET
     * @return bool
     */
    public function stream_seek($offset, $whence = SEEK_SET)
    {
        if(isSet($this->handle) && is_resource($this->handle)){
            return fseek($this->handle, $offset, $whence);
        }
        return false;
    }

    /**
     * Enter description here...
     *
     * @return array|false
     */
    public function stream_stat()
    {
        if(isSet($this->handle) && is_resource($this->handle)){
            return fstat($this->handle);
        }
        return false;
    }

    /**
     * Enter description here...
     *
     * @return int
     */
    public function stream_tell()
    {
        if(isSet($this->handle) && is_resource($this->handle)){
            return ftell($this->handle);
        }
        return false;
    }

    /**
     * Enter description here...
     *
     * @param string $data
     * @return int
     */
    public function stream_write($data)
    {
        if(isSet($this->handle) && is_resource($this->handle)){
            return fwrite($this->handle, $data);
        }
        return false;
    }

    /**
     * Enter description here...
     *
     * @param string $path
     * @return bool
     */
    public function unlink($path)
    {
        return unlink(MetaStreamWrapper::translateScheme($path));
    }

    /**
     * Enter description here...
     *
     * @param string $path
     * @param int $flags
     * @return array
     */
    public function url_stat($path, $flags)
    {
        $stat = @stat(MetaStreamWrapper::translateScheme($path));
        if($stat === false){
            return null;
        }
        return $stat;
    }
}

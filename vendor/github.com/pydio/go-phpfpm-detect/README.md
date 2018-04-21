# go-phpfpm-detect

Tool to automatically detect PHP-FPM configuration and loaded extensions

The tool will successively try to 
 - Connect to common network addresses where php-fpm listen (:9000, /run/php/php-fpm.sock, etc.)
 - Try to find a php-fpm process running and parse the conf by calling <process-name> -tt

If FPM is detected, a fastCGI clients sends some GET requests to read infos about PHP version and loaded extensions.

Copyright Pydio 2018
License MIT

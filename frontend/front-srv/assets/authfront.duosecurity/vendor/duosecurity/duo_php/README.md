# Overview

[![Build Status](https://travis-ci.org/duosecurity/duo_php.svg?branch=master)](https://travis-ci.org/duosecurity/duo_php)

**duo_php** - Duo two-factor authentication for PHP web applications: https://duo.com/docs/duoweb

This package allows a web developer to quickly add Duo's interactive, self-service, two-factor authentication to any web login form - without setting up secondary user accounts, directory synchronization, servers, or hardware.

Files located in the `js` directory should be hosted by your webserver for inclusion in web pages.

# Installing

Development:

```
$ git clone https://github.com/duosecurity/duo_php.git
$ cd duo_php
$ composer install
```

System:

```
$ composer global require duosecurity/duo_php:dev-master
```

Or add the following to your project:

```
{
    "require": {
        "duosecurity/duo_php": "dev-master"
    }
}
```

# Using

```
$ php -a -d auto_prepend_file=vendor/autoload.php
Interactive mode enabled

php > var_dump(Duo\Web::signRequest($ikey, $skey, $akey, $username));
string(202) "TX|...TX_SIGNATURE...==|...TX_HASH...:APP|...APP_SIGNATURE...==|...APP_HASH..."
```

# Demo

First add an IKEY, SKEY, and HOST to `demos/simple/index.php`, then run the following:

```
$ php -S localhost:8080 -t demos/simple/
```

# Test

```
$ ./vendor/bin/phpunit -c phpunit.xml
PHPUnit 5.3.2 by Sebastian Bergmann and contributors.

.............                                                     13 / 13 (100%)

Time: 62 ms, Memory: 6.00Mb

OK (13 tests, 13 assertions)
```

# Lint

```
$ ./vendor/bin/phpcs --standard=PSR2 -n src/* tests/*
```

# Support

Report any bugs, feature requests, etc. to us directly: support@duosecurity.com


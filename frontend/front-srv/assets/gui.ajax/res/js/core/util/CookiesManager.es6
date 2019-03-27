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
 * The latest code can be found at <https://pydio.com/>.
 *
 * Pure Javascript (ES6) Cookie Manager inspired by CookieJar that was relying on PrototypeJS.
 *
 * ----
 * CookieJAR Original Header
 *
 * Javascript code to store data as JSON strings in cookies. 
 * It uses prototype.js 1.5.1 (http://www.prototypejs.org)
 * 
 * Author : Lalit Patel
 * Website: http://www.lalit.org/lab/jsoncookies
 * License: Creative Commons Attribution-ShareAlike 2.5
 *          http://creativecommons.org/licenses/by-sa/2.5/
 * Version: 0.4
 * Updated: Aug 11, 2007 10:09am
 * 
 * Chnage Log:
 *   v 0.4
 *   -  Removed a extra comma in options (was breaking in IE and Opera). (Thanks Jason)
 *   -  Removed the parameter name from the initialize function
 *   -  Changed the way expires date was being calculated. (Thanks David)
 *   v 0.3
 *   -  Removed dependancy on json.js (http://www.json.org/json.js)
 *   -  empty() function only deletes the cookies set by CookieJar
 */

export default class CookiesManager{

    static supported(){
        return (document && document.cookie !== undefined);
    }

	/**
	 * Initializes the cookie jar with the options.
	 */
	constructor(options) {
        /**
         * Append before all cookie names to differntiate them.
         */
        this._appendString = "__PYDIO__";

        this.options = {
			expires: 3600,		// seconds (1 hr)
			path: '',			// cookie path
			domain: '',			// cookie domain
			secure: ''			// secure ?
		};
		this.options = LangUtils.objectMerge(this.options, options || {});

		if (this.options.expires != '') {
			var date = new Date();
			date = new Date(date.getTime() + (this.options.expires * 1000));
			this.options.expires = '; expires=' + date.toGMTString();
		}
		if (this.options.path != '') {
			this.options.path = '; path=' + encodeURI(this.options.path);
		}
		if (this.options.domain != '') {
			this.options.domain = '; domain=' + encodeURI(this.options.domain);
		}
		if (this.options.secure == 'secure') {
			this.options.secure = '; secure';
		} else {
			this.options.secure = '';
		}
	}

	/**
	 * Adds a name values pair.
	 */
	putCookie(name, value) {
		name = this._appendString + name;
		var cookie = this.options;
		var type = typeof value;
		switch(type) {
		  case 'undefined':
		  case 'function' :
		  case 'unknown'  : return false;
		  case 'boolean'  : 
		  case 'string'   : 
		  case 'number'   : value = String(value.toString());
		}
		var cookie_str = name + "=" + encodeURI(JSON.stringify(value));
		try {
			document.cookie = cookie_str + cookie.expires + cookie.path + cookie.domain + cookie.secure;
		} catch (e) {
			return false;
		}
		return true;
	}

	/**
	 * Removes a particular cookie (name value pair) form the Cookie Jar.
	 */
	removeCookie(name) {
		name = this._appendString + name;
		var cookie = this.options;
		try {
			var date = new Date();
			date.setTime(date.getTime() - (3600 * 1000));
			var expires = '; expires=' + date.toGMTString();
			document.cookie = name + "=" + expires + cookie.path + cookie.domain + cookie.secure;
		} catch (e) {
			return false;
		}
		return true;
	}

	/**
	 * Return a particular cookie by name;
	 */
	getCookie(name) {
		name = this._appendString + name;
		var cookies = document.cookie.match(name + '=(.*?)(;|$)');
		if (cookies) {
			return JSON.parse(decodeURI(cookies[1]));
		} else {
			return null;
		}
	}

	/**
	 * Empties the Cookie Jar. Deletes all the cookies.
	 */
	emptyAll() {
		var keys = this.getKeys();
		var size = keys.size();
		for(var i=0; i<size; i++) {
			this.removeCookie(keys[i]);
		}
	}

	/**
	 * Returns all cookies as a single object
	 */
	getPack() {
		var pack = {};
		var keys = this.getKeys();

		var size = keys.size();
		for(var i=0; i<size; i++) {
			pack[keys[i]] = this.get(keys[i]);
		}
		return pack;
	}

	/**
	 * Returns all keys.
	 */
	getKeys() {
		var keys = [];
		var keyRe= /[^=; ]+(?=\=)/g;
		var str  = document.cookie;
		var CJRe = new RegExp("^" + this._appendString);
        var match;
		while((match = keyRe.exec(str)) != undefined) {
			if (CJRe.test(match[0].strip())) {
				keys.push(match[0].strip().gsub("^" + this._appendString,""));
			}
		}
		return keys;
	}
}
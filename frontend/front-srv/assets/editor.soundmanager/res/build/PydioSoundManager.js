(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioSoundManager = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @license
 *
 * SoundManager 2: JavaScript Sound for the Web
 * ----------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License:
 * http://schillmania.com/projects/soundmanager2/license.txt
 *
 * V2.97a.20150601
 */

/*global window, SM2_DEFER, sm2Debugger, console, document, navigator, setTimeout, setInterval, clearInterval, Audio, opera, module, define */
/*jslint regexp: true, sloppy: true, white: true, nomen: true, plusplus: true, todo: true */

/**
 * About this file
 * -------------------------------------------------------------------------------------
 * This is the fully-commented source version of the SoundManager 2 API,
 * recommended for use during development and testing.
 *
 * See soundmanager2-nodebug-jsmin.js for an optimized build (~11KB with gzip.)
 * http://schillmania.com/projects/soundmanager2/doc/getstarted/#basic-inclusion
 * Alternately, serve this file with gzip for 75% compression savings (~30KB over HTTP.)
 *
 * You may notice <d> and </d> comments in this source; these are delimiters for
 * debug blocks which are removed in the -nodebug builds, further optimizing code size.
 *
 * Also, as you may note: Whoa, reliable cross-platform/device audio support is hard! ;)
 */

(function(window, _undefined) {

"use strict";

if (!window || !window.document) {

  // Don't cross the [environment] streams. SM2 expects to be running in a browser, not under node.js etc.
  // Additionally, if a browser somehow manages to fail this test, as Egon said: "It would be bad."

  throw new Error('SoundManager requires a browser with window and document objects.');

}

var soundManager = null;

/**
 * The SoundManager constructor.
 *
 * @constructor
 * @param {string} smURL Optional: Path to SWF files
 * @param {string} smID Optional: The ID to use for the SWF container element
 * @this {SoundManager}
 * @return {SoundManager} The new SoundManager instance
 */

function SoundManager(smURL, smID) {

  /**
   * soundManager configuration options list
   * defines top-level configuration properties to be applied to the soundManager instance (eg. soundManager.flashVersion)
   * to set these properties, use the setup() method - eg., soundManager.setup({url: '/swf/', flashVersion: 9})
   */

  this.setupOptions = {

    'url': (smURL || null),             // path (directory) where SoundManager 2 SWFs exist, eg., /path/to/swfs/
    'flashVersion': 8,                  // flash build to use (8 or 9.) Some API features require 9.
    'debugMode': true,                  // enable debugging output (console.log() with HTML fallback)
    'debugFlash': false,                // enable debugging output inside SWF, troubleshoot Flash/browser issues
    'useConsole': true,                 // use console.log() if available (otherwise, writes to #soundmanager-debug element)
    'consoleOnly': true,                // if console is being used, do not create/write to #soundmanager-debug
    'waitForWindowLoad': false,         // force SM2 to wait for window.onload() before trying to call soundManager.onload()
    'bgColor': '#ffffff',               // SWF background color. N/A when wmode = 'transparent'
    'useHighPerformance': false,        // position:fixed flash movie can help increase js/flash speed, minimize lag
    'flashPollingInterval': null,       // msec affecting whileplaying/loading callback frequency. If null, default of 50 msec is used.
    'html5PollingInterval': null,       // msec affecting whileplaying() for HTML5 audio, excluding mobile devices. If null, native HTML5 update events are used.
    'flashLoadTimeout': 1000,           // msec to wait for flash movie to load before failing (0 = infinity)
    'wmode': null,                      // flash rendering mode - null, 'transparent', or 'opaque' (last two allow z-index to work)
    'allowScriptAccess': 'always',      // for scripting the SWF (object/embed property), 'always' or 'sameDomain'
    'useFlashBlock': false,             // *requires flashblock.css, see demos* - allow recovery from flash blockers. Wait indefinitely and apply timeout CSS to SWF, if applicable.
    'useHTML5Audio': true,              // use HTML5 Audio() where API is supported (most Safari, Chrome versions), Firefox (MP3/MP4 support varies.) Ideally, transparent vs. Flash API where possible.
    'forceUseGlobalHTML5Audio': false,  // if true, a single Audio() object is used for all sounds - and only one can play at a time.
    'ignoreMobileRestrictions': false,  // if true, SM2 will not apply global HTML5 audio rules to mobile UAs. iOS > 7 and WebViews may allow multiple Audio() instances.
    'html5Test': /^(probably|maybe)$/i, // HTML5 Audio() format support test. Use /^probably$/i; if you want to be more conservative.
    'preferFlash': false,               // overrides useHTML5audio, will use Flash for MP3/MP4/AAC if present. Potential option if HTML5 playback with these formats is quirky.
    'noSWFCache': false,                // if true, appends ?ts={date} to break aggressive SWF caching.
    'idPrefix': 'sound'                 // if an id is not provided to createSound(), this prefix is used for generated IDs - 'sound0', 'sound1' etc.

  };

  this.defaultOptions = {

    /**
     * the default configuration for sound objects made with createSound() and related methods
     * eg., volume, auto-load behaviour and so forth
     */

    'autoLoad': false,        // enable automatic loading (otherwise .load() will be called on demand with .play(), the latter being nicer on bandwidth - if you want to .load yourself, you also can)
    'autoPlay': false,        // enable playing of file as soon as possible (much faster if "stream" is true)
    'from': null,             // position to start playback within a sound (msec), default = beginning
    'loops': 1,               // how many times to repeat the sound (position will wrap around to 0, setPosition() will break out of loop when >0)
    'onid3': null,            // callback function for "ID3 data is added/available"
    'onload': null,           // callback function for "load finished"
    'whileloading': null,     // callback function for "download progress update" (X of Y bytes received)
    'onplay': null,           // callback for "play" start
    'onpause': null,          // callback for "pause"
    'onresume': null,         // callback for "resume" (pause toggle)
    'whileplaying': null,     // callback during play (position update)
    'onposition': null,       // object containing times and function callbacks for positions of interest
    'onstop': null,           // callback for "user stop"
    'onfailure': null,        // callback function for when playing fails
    'onfinish': null,         // callback function for "sound finished playing"
    'multiShot': true,        // let sounds "restart" or layer on top of each other when played multiple times, rather than one-shot/one at a time
    'multiShotEvents': false, // fire multiple sound events (currently onfinish() only) when multiShot is enabled
    'position': null,         // offset (milliseconds) to seek to within loaded sound data.
    'pan': 0,                 // "pan" settings, left-to-right, -100 to 100
    'stream': true,           // allows playing before entire file has loaded (recommended)
    'to': null,               // position to end playback within a sound (msec), default = end
    'type': null,             // MIME-like hint for file pattern / canPlay() tests, eg. audio/mp3
    'usePolicyFile': false,   // enable crossdomain.xml request for audio on remote domains (for ID3/waveform access)
    'volume': 100             // self-explanatory. 0-100, the latter being the max.

  };

  this.flash9Options = {

    /**
     * flash 9-only options,
     * merged into defaultOptions if flash 9 is being used
     */

    'isMovieStar': null,      // "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4, AAC etc. based on URL. true = force on, ignore URL
    'usePeakData': false,     // enable left/right channel peak (level) data
    'useWaveformData': false, // enable sound spectrum (raw waveform data) - NOTE: May increase CPU load.
    'useEQData': false,       // enable sound EQ (frequency spectrum data) - NOTE: May increase CPU load.
    'onbufferchange': null,   // callback for "isBuffering" property change
    'ondataerror': null       // callback for waveform/eq data access error (flash playing audio in other tabs/domains)

  };

  this.movieStarOptions = {

    /**
     * flash 9.0r115+ MPEG4 audio options,
     * merged into defaultOptions if flash 9+movieStar mode is enabled
     */

    'bufferTime': 3,          // seconds of data to buffer before playback begins (null = flash default of 0.1 seconds - if AAC playback is gappy, try increasing.)
    'serverURL': null,        // rtmp: FMS or FMIS server to connect to, required when requesting media via RTMP or one of its variants
    'onconnect': null,        // rtmp: callback for connection to flash media server
    'duration': null          // rtmp: song duration (msec)

  };

  this.audioFormats = {

    /**
     * determines HTML5 support + flash requirements.
     * if no support (via flash and/or HTML5) for a "required" format, SM2 will fail to start.
     * flash fallback is used for MP3 or MP4 if HTML5 can't play it (or if preferFlash = true)
     */

    'mp3': {
      'type': ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust'],
      'required': true
    },

    'mp4': {
      'related': ['aac','m4a','m4b'], // additional formats under the MP4 container
      'type': ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac', 'audio/x-m4a', 'audio/MP4A-LATM', 'audio/mpeg4-generic'],
      'required': false
    },

    'ogg': {
      'type': ['audio/ogg; codecs=vorbis'],
      'required': false
    },

    'opus': {
      'type': ['audio/ogg; codecs=opus', 'audio/opus'],
      'required': false
    },

    'wav': {
      'type': ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav'],
      'required': false
    }

  };

  // HTML attributes (id + class names) for the SWF container

  this.movieID = 'sm2-container';
  this.id = (smID || 'sm2movie');

  this.debugID = 'soundmanager-debug';
  this.debugURLParam = /([#?&])debug=1/i;

  // dynamic attributes

  this.versionNumber = 'V2.97a.20150601';
  this.version = null;
  this.movieURL = null;
  this.altURL = null;
  this.swfLoaded = false;
  this.enabled = false;
  this.oMC = null;
  this.sounds = {};
  this.soundIDs = [];
  this.muted = false;
  this.didFlashBlock = false;
  this.filePattern = null;

  this.filePatterns = {
    'flash8': /\.mp3(\?.*)?$/i,
    'flash9': /\.mp3(\?.*)?$/i
  };

  // support indicators, set at init

  this.features = {
    'buffering': false,
    'peakData': false,
    'waveformData': false,
    'eqData': false,
    'movieStar': false
  };

  // flash sandbox info, used primarily in troubleshooting

  this.sandbox = {
    // <d>
    'type': null,
    'types': {
      'remote': 'remote (domain-based) rules',
      'localWithFile': 'local with file access (no internet access)',
      'localWithNetwork': 'local with network (internet access only, no local access)',
      'localTrusted': 'local, trusted (local+internet access)'
    },
    'description': null,
    'noRemote': null,
    'noLocal': null
    // </d>
  };

  /**
   * format support (html5/flash)
   * stores canPlayType() results based on audioFormats.
   * eg. { mp3: boolean, mp4: boolean }
   * treat as read-only.
   */

  this.html5 = {
    'usingFlash': null // set if/when flash fallback is needed
  };

  // file type support hash
  this.flash = {};

  // determined at init time
  this.html5Only = false;

  // used for special cases (eg. iPad/iPhone/palm OS?)
  this.ignoreFlash = false;

  /**
   * a few private internals (OK, a lot. :D)
   */

  var SMSound,
  sm2 = this, globalHTML5Audio = null, flash = null, sm = 'soundManager', smc = sm + ': ', h5 = 'HTML5::', id, ua = navigator.userAgent, wl = window.location.href.toString(), doc = document, doNothing, setProperties, init, fV, on_queue = [], debugOpen = true, debugTS, didAppend = false, appendSuccess = false, didInit = false, disabled = false, windowLoaded = false, _wDS, wdCount = 0, initComplete, mixin, assign, extraOptions, addOnEvent, processOnEvents, initUserOnload, delayWaitForEI, waitForEI, rebootIntoHTML5, setVersionInfo, handleFocus, strings, initMovie, domContentLoaded, winOnLoad, didDCLoaded, getDocument, createMovie, catchError, setPolling, initDebug, debugLevels = ['log', 'info', 'warn', 'error'], defaultFlashVersion = 8, disableObject, failSafely, normalizeMovieURL, oRemoved = null, oRemovedHTML = null, str, flashBlockHandler, getSWFCSS, swfCSS, toggleDebug, loopFix, policyFix, complain, idCheck, waitingForEI = false, initPending = false, startTimer, stopTimer, timerExecute, h5TimerCount = 0, h5IntervalTimer = null, parseURL, messages = [],
  canIgnoreFlash, needsFlash = null, featureCheck, html5OK, html5CanPlay, html5Ext, html5Unload, domContentLoadedIE, testHTML5, event, slice = Array.prototype.slice, useGlobalHTML5Audio = false, lastGlobalHTML5URL, hasFlash, detectFlash, badSafariFix, html5_events, showSupport, flushMessages, wrapCallback, idCounter = 0, didSetup, msecScale = 1000,
  is_iDevice = ua.match(/(ipad|iphone|ipod)/i), isAndroid = ua.match(/android/i), isIE = ua.match(/msie/i),
  isWebkit = ua.match(/webkit/i),
  isSafari = (ua.match(/safari/i) && !ua.match(/chrome/i)),
  isOpera = (ua.match(/opera/i)),
  mobileHTML5 = (ua.match(/(mobile|pre\/|xoom)/i) || is_iDevice || isAndroid),
  isBadSafari = (!wl.match(/usehtml5audio/i) && !wl.match(/sm2\-ignorebadua/i) && isSafari && !ua.match(/silk/i) && ua.match(/OS X 10_6_([3-7])/i)), // Safari 4 and 5 (excluding Kindle Fire, "Silk") occasionally fail to load/play HTML5 audio on Snow Leopard 10.6.3 through 10.6.7 due to bug(s) in QuickTime X and/or other underlying frameworks. :/ Confirmed bug. https://bugs.webkit.org/show_bug.cgi?id=32159
  hasConsole = (window.console !== _undefined && console.log !== _undefined),
  isFocused = (doc.hasFocus !== _undefined ? doc.hasFocus() : null),
  tryInitOnFocus = (isSafari && (doc.hasFocus === _undefined || !doc.hasFocus())),
  okToDisable = !tryInitOnFocus,
  flashMIME = /(mp3|mp4|mpa|m4a|m4b)/i,
  emptyURL = 'about:blank', // safe URL to unload, or load nothing from (flash 8 + most HTML5 UAs)
  emptyWAV = 'data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w==', // tiny WAV for HTML5 unloading
  overHTTP = (doc.location ? doc.location.protocol.match(/http/i) : null),
  http = (!overHTTP ? 'http:/'+'/' : ''),
  // mp3, mp4, aac etc.
  netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,
  // Flash v9.0r115+ "moviestar" formats
  netStreamTypes = ['mpeg4', 'aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'm4b', 'mp4v', '3gp', '3g2'],
  netStreamPattern = new RegExp('\\.(' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');

  this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i; // default mp3 set

  // use altURL if not "online"
  this.useAltURL = !overHTTP;

  swfCSS = {
    'swfBox': 'sm2-object-box',
    'swfDefault': 'movieContainer',
    'swfError': 'swf_error', // SWF loaded, but SM2 couldn't start (other error)
    'swfTimedout': 'swf_timedout',
    'swfLoaded': 'swf_loaded',
    'swfUnblocked': 'swf_unblocked', // or loaded OK
    'sm2Debug': 'sm2_debug',
    'highPerf': 'high_performance',
    'flashDebug': 'flash_debug'
  };

  /**
   * basic HTML5 Audio() support test
   * try...catch because of IE 9 "not implemented" nonsense
   * https://github.com/Modernizr/Modernizr/issues/224
   */

  this.hasHTML5 = (function() {
    try {
      // new Audio(null) for stupid Opera 9.64 case, which throws not_enough_arguments exception otherwise.
      return (Audio !== _undefined && (isOpera && opera !== _undefined && opera.version() < 10 ? new Audio(null) : new Audio()).canPlayType !== _undefined);
    } catch(e) {
      return false;
    }
  }());

  /**
   * Public SoundManager API
   * -----------------------
   */

  /**
   * Configures top-level soundManager properties.
   *
   * @param {object} options Option parameters, eg. { flashVersion: 9, url: '/path/to/swfs/' }
   * onready and ontimeout are also accepted parameters. call soundManager.setup() to see the full list.
   */

  this.setup = function(options) {

    var noURL = (!sm2.url);

    // warn if flash options have already been applied

    if (options !== _undefined && didInit && needsFlash && sm2.ok() && (options.flashVersion !== _undefined || options.url !== _undefined || options.html5Test !== _undefined)) {
      complain(str('setupLate'));
    }

    // TODO: defer: true?

    assign(options);

    if (!useGlobalHTML5Audio) {

      if (mobileHTML5) {

        // force the singleton HTML5 pattern on mobile, by default.
        if (!sm2.setupOptions.ignoreMobileRestrictions || sm2.setupOptions.forceUseGlobalHTML5Audio) {
          messages.push(strings.globalHTML5);
          useGlobalHTML5Audio = true;
        }

      } else {

        // only apply singleton HTML5 on desktop if forced.
        if (sm2.setupOptions.forceUseGlobalHTML5Audio) {
          messages.push(strings.globalHTML5);
          useGlobalHTML5Audio = true;
        }

      }

    }

    if (!didSetup && mobileHTML5) {

      if (sm2.setupOptions.ignoreMobileRestrictions) {
        
        messages.push(strings.ignoreMobile);
      
      } else {

        // prefer HTML5 for mobile + tablet-like devices, probably more reliable vs. flash at this point.

        // <d>
        if (!sm2.setupOptions.useHTML5Audio || sm2.setupOptions.preferFlash) {
          // notify that defaults are being changed.
          sm2._wD(strings.mobileUA);
        }
        // </d>

        sm2.setupOptions.useHTML5Audio = true;
        sm2.setupOptions.preferFlash = false;

        if (is_iDevice) {

          // no flash here.
          sm2.ignoreFlash = true;

        } else if ((isAndroid && !ua.match(/android\s2\.3/i)) || !isAndroid) {
        
          /**
           * Android devices tend to work better with a single audio instance, specifically for chained playback of sounds in sequence.
           * Common use case: exiting sound onfinish() -> createSound() -> play()
           * Presuming similar restrictions for other mobile, non-Android, non-iOS devices.
           */

          // <d>
          sm2._wD(strings.globalHTML5);
          // </d>

          useGlobalHTML5Audio = true;

        }

      }

    }

    // special case 1: "Late setup". SM2 loaded normally, but user didn't assign flash URL eg., setup({url:...}) before SM2 init. Treat as delayed init.

    if (options) {

      if (noURL && didDCLoaded && options.url !== _undefined) {
        sm2.beginDelayedInit();
      }

      // special case 2: If lazy-loading SM2 (DOMContentLoaded has already happened) and user calls setup() with url: parameter, try to init ASAP.

      if (!didDCLoaded && options.url !== _undefined && doc.readyState === 'complete') {
        setTimeout(domContentLoaded, 1);
      }

    }

    didSetup = true;

    return sm2;

  };

  this.ok = function() {

    return (needsFlash ? (didInit && !disabled) : (sm2.useHTML5Audio && sm2.hasHTML5));

  };

  this.supported = this.ok; // legacy

  this.getMovie = function(smID) {

    // safety net: some old browsers differ on SWF references, possibly related to ExternalInterface / flash version
    return id(smID) || doc[smID] || window[smID];

  };

  /**
   * Creates a SMSound sound object instance. Can also be overloaded, e.g., createSound('mySound', '/some.mp3');
   *
   * @param {object} oOptions Sound options (at minimum, url parameter is required.)
   * @return {object} SMSound The new SMSound object.
   */

  this.createSound = function(oOptions, _url) {

    var cs, cs_string, options, oSound = null;

    // <d>
    cs = sm + '.createSound(): ';
    cs_string = cs + str(!didInit ? 'notReady' : 'notOK');
    // </d>

    if (!didInit || !sm2.ok()) {
      complain(cs_string);
      return false;
    }

    if (_url !== _undefined) {
      // function overloading in JS! :) ... assume simple createSound(id, url) use case.
      oOptions = {
        'id': oOptions,
        'url': _url
      };
    }

    // inherit from defaultOptions
    options = mixin(oOptions);

    options.url = parseURL(options.url);

    // generate an id, if needed.
    if (options.id === _undefined) {
      options.id = sm2.setupOptions.idPrefix + (idCounter++);
    }

    // <d>
    if (options.id.toString().charAt(0).match(/^[0-9]$/)) {
      sm2._wD(cs + str('badID', options.id), 2);
    }

    sm2._wD(cs + options.id + (options.url ? ' (' + options.url + ')' : ''), 1);
    // </d>

    if (idCheck(options.id, true)) {
      sm2._wD(cs + options.id + ' exists', 1);
      return sm2.sounds[options.id];
    }

    function make() {

      options = loopFix(options);
      sm2.sounds[options.id] = new SMSound(options);
      sm2.soundIDs.push(options.id);
      return sm2.sounds[options.id];

    }

    if (html5OK(options)) {

      oSound = make();
      // <d>
      if (!sm2.html5Only) {
        sm2._wD(options.id + ': Using HTML5');
      }
      // </d>
      oSound._setup_html5(options);

    } else {

      if (sm2.html5Only) {
        sm2._wD(options.id + ': No HTML5 support for this sound, and no Flash. Exiting.');
        return make();
      }

      // TODO: Move HTML5/flash checks into generic URL parsing/handling function.

      if (sm2.html5.usingFlash && options.url && options.url.match(/data\:/i)) {
        // data: URIs not supported by Flash, either.
        sm2._wD(options.id + ': data: URIs not supported via Flash. Exiting.');
        return make();
      }

      if (fV > 8) {
        if (options.isMovieStar === null) {
          // attempt to detect MPEG-4 formats
          options.isMovieStar = !!(options.serverURL || (options.type ? options.type.match(netStreamMimeTypes) : false) || (options.url && options.url.match(netStreamPattern)));
        }
        // <d>
        if (options.isMovieStar) {
          sm2._wD(cs + 'using MovieStar handling');
          if (options.loops > 1) {
            _wDS('noNSLoop');
          }
        }
        // </d>
      }

      options = policyFix(options, cs);
      oSound = make();

      if (fV === 8) {
        flash._createSound(options.id, options.loops || 1, options.usePolicyFile);
      } else {
        flash._createSound(options.id, options.url, options.usePeakData, options.useWaveformData, options.useEQData, options.isMovieStar, (options.isMovieStar ? options.bufferTime : false), options.loops || 1, options.serverURL, options.duration || null, options.autoPlay, true, options.autoLoad, options.usePolicyFile);
        if (!options.serverURL) {
          // We are connected immediately
          oSound.connected = true;
          if (options.onconnect) {
            options.onconnect.apply(oSound);
          }
        }
      }

      if (!options.serverURL && (options.autoLoad || options.autoPlay)) {
        // call load for non-rtmp streams
        oSound.load(options);
      }

    }

    // rtmp will play in onconnect
    if (!options.serverURL && options.autoPlay) {
      oSound.play();
    }

    return oSound;

  };

  /**
   * Destroys a SMSound sound object instance.
   *
   * @param {string} sID The ID of the sound to destroy
   */

  this.destroySound = function(sID, _bFromSound) {

    // explicitly destroy a sound before normal page unload, etc.

    if (!idCheck(sID)) {
      return false;
    }

    var oS = sm2.sounds[sID], i;

    oS.stop();
    
    // Disable all callbacks after stop(), when the sound is being destroyed
    oS._iO = {};
    
    oS.unload();

    for (i = 0; i < sm2.soundIDs.length; i++) {
      if (sm2.soundIDs[i] === sID) {
        sm2.soundIDs.splice(i, 1);
        break;
      }
    }

    if (!_bFromSound) {
      // ignore if being called from SMSound instance
      oS.destruct(true);
    }

    oS = null;
    delete sm2.sounds[sID];

    return true;

  };

  /**
   * Calls the load() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   */

  this.load = function(sID, oOptions) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].load(oOptions);

  };

  /**
   * Calls the unload() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   */

  this.unload = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].unload();

  };

  /**
   * Calls the onPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod The relevant callback to fire
   * @param {object} oScope Optional: The scope to apply the callback to
   * @return {SMSound} The SMSound object
   */

  this.onPosition = function(sID, nPosition, oMethod, oScope) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].onposition(nPosition, oMethod, oScope);

  };

  // legacy/backwards-compability: lower-case method name
  this.onposition = this.onPosition;

  /**
   * Calls the clearOnPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod Optional: The relevant callback to fire
   * @return {SMSound} The SMSound object
   */

  this.clearOnPosition = function(sID, nPosition, oMethod) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].clearOnPosition(nPosition, oMethod);

  };

  /**
   * Calls the play() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   * @return {SMSound} The SMSound object
   */

  this.play = function(sID, oOptions) {

    var result = null,
        // legacy function-overloading use case: play('mySound', '/path/to/some.mp3');
        overloaded = (oOptions && !(oOptions instanceof Object));

    if (!didInit || !sm2.ok()) {
      complain(sm + '.play(): ' + str(!didInit?'notReady':'notOK'));
      return false;
    }

    if (!idCheck(sID, overloaded)) {

      if (!overloaded) {
        // no sound found for the given ID. Bail.
        return false;
      }

      if (overloaded) {
        oOptions = {
          url: oOptions
        };
      }

      if (oOptions && oOptions.url) {
        // overloading use case, create+play: .play('someID', {url:'/path/to.mp3'});
        sm2._wD(sm + '.play(): Attempting to create "' + sID + '"', 1);
        oOptions.id = sID;
        result = sm2.createSound(oOptions).play();
      }

    } else if (overloaded) {

      // existing sound object case
      oOptions = {
        url: oOptions
      };

    }

    if (result === null) {
      // default case
      result = sm2.sounds[sID].play(oOptions);
    }

    return result;

  };

  // just for convenience
  this.start = this.play;

  /**
   * Calls the setPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nMsecOffset Position (milliseconds)
   * @return {SMSound} The SMSound object
   */

  this.setPosition = function(sID, nMsecOffset) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPosition(nMsecOffset);

  };

  /**
   * Calls the stop() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.stop = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }

    sm2._wD(sm + '.stop(' + sID + ')', 1);
    return sm2.sounds[sID].stop();

  };

  /**
   * Stops all currently-playing sounds.
   */

  this.stopAll = function() {

    var oSound;
    sm2._wD(sm + '.stopAll()', 1);

    for (oSound in sm2.sounds) {
      if (sm2.sounds.hasOwnProperty(oSound)) {
        // apply only to sound objects
        sm2.sounds[oSound].stop();
      }
    }

  };

  /**
   * Calls the pause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.pause = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].pause();

  };

  /**
   * Pauses all currently-playing sounds.
   */

  this.pauseAll = function() {

    var i;
    for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].pause();
    }

  };

  /**
   * Calls the resume() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.resume = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].resume();

  };

  /**
   * Resumes all currently-paused sounds.
   */

  this.resumeAll = function() {

    var i;
    for (i = sm2.soundIDs.length- 1 ; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].resume();
    }

  };

  /**
   * Calls the togglePause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.togglePause = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].togglePause();

  };

  /**
   * Calls the setPan() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPan The pan value (-100 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setPan = function(sID, nPan) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPan(nPan);

  };

  /**
   * Calls the setVolume() method of a SMSound object by ID
   * Overloaded case: pass only volume argument eg., setVolume(50) to apply to all sounds.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nVol The volume value (0 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setVolume = function(sID, nVol) {

    // setVolume(50) function overloading case - apply to all sounds

    var i, j;

    if (sID !== _undefined && !isNaN(sID) && nVol === _undefined) {
      for (i = 0, j = sm2.soundIDs.length; i < j; i++) {
        sm2.sounds[sm2.soundIDs[i]].setVolume(sID);
      }
      return;
    }

    // setVolume('mySound', 50) case

    if (!idCheck(sID)) {
      return false;
    }

    return sm2.sounds[sID].setVolume(nVol);

  };

  /**
   * Calls the mute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.mute = function(sID) {

    var i = 0;

    if (sID instanceof String) {
      sID = null;
    }

    if (!sID) {

      sm2._wD(sm + '.mute(): Muting all sounds');
      for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].mute();
      }
      sm2.muted = true;

    } else {

      if (!idCheck(sID)) {
        return false;
      }
      sm2._wD(sm + '.mute(): Muting "' + sID + '"');
      return sm2.sounds[sID].mute();

    }

    return true;

  };

  /**
   * Mutes all sounds.
   */

  this.muteAll = function() {

    sm2.mute();

  };

  /**
   * Calls the unmute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.unmute = function(sID) {

    var i;

    if (sID instanceof String) {
      sID = null;
    }

    if (!sID) {

      sm2._wD(sm + '.unmute(): Unmuting all sounds');
      for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].unmute();
      }
      sm2.muted = false;

    } else {

      if (!idCheck(sID)) {
        return false;
      }
      sm2._wD(sm + '.unmute(): Unmuting "' + sID + '"');
      return sm2.sounds[sID].unmute();

    }

    return true;

  };

  /**
   * Unmutes all sounds.
   */

  this.unmuteAll = function() {

    sm2.unmute();

  };

  /**
   * Calls the toggleMute() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.toggleMute = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].toggleMute();

  };

  /**
   * Retrieves the memory used by the flash plugin.
   *
   * @return {number} The amount of memory in use
   */

  this.getMemoryUse = function() {

    // flash-only
    var ram = 0;

    if (flash && fV !== 8) {
      ram = parseInt(flash._getMemoryUse(), 10);
    }

    return ram;

  };

  /**
   * Undocumented: NOPs soundManager and all SMSound objects.
   */

  this.disable = function(bNoDisable) {

    // destroy all functions
    var i;

    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }

    if (disabled) {
      return false;
    }

    disabled = true;
    _wDS('shutdown', 1);

    for (i = sm2.soundIDs.length - 1; i >= 0; i--) {
      disableObject(sm2.sounds[sm2.soundIDs[i]]);
    }

    // fire "complete", despite fail
    initComplete(bNoDisable);
    event.remove(window, 'load', initUserOnload);

    return true;

  };

  /**
   * Determines playability of a MIME type, eg. 'audio/mp3'.
   */

  this.canPlayMIME = function(sMIME) {

    var result;

    if (sm2.hasHTML5) {
      result = html5CanPlay({
        type: sMIME
      });
    }

    if (!result && needsFlash) {
      // if flash 9, test netStream (movieStar) types as well.
      result = (sMIME && sm2.ok() ? !!((fV > 8 ? sMIME.match(netStreamMimeTypes) : null) || sMIME.match(sm2.mimePattern)) : null); // TODO: make less "weird" (per JSLint)
    }

    return result;

  };

  /**
   * Determines playability of a URL based on audio support.
   *
   * @param {string} sURL The URL to test
   * @return {boolean} URL playability
   */

  this.canPlayURL = function(sURL) {

    var result;

    if (sm2.hasHTML5) {
      result = html5CanPlay({
        url: sURL
      });
    }

    if (!result && needsFlash) {
      result = (sURL && sm2.ok() ? !!(sURL.match(sm2.filePattern)) : null);
    }

    return result;

  };

  /**
   * Determines playability of an HTML DOM &lt;a&gt; object (or similar object literal) based on audio support.
   *
   * @param {object} oLink an HTML DOM &lt;a&gt; object or object literal including href and/or type attributes
   * @return {boolean} URL playability
   */

  this.canPlayLink = function(oLink) {

    if (oLink.type !== _undefined && oLink.type) {
      if (sm2.canPlayMIME(oLink.type)) {
        return true;
      }
    }

    return sm2.canPlayURL(oLink.href);

  };

  /**
   * Retrieves a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.getSoundById = function(sID, _suppressDebug) {

    if (!sID) {
      return null;
    }

    var result = sm2.sounds[sID];

    // <d>
    if (!result && !_suppressDebug) {
      sm2._wD(sm + '.getSoundById(): Sound "' + sID + '" not found.', 2);
    }
    // </d>

    return result;

  };

  /**
   * Queues a callback for execution when SoundManager has successfully initialized.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.onready = function(oMethod, oScope) {

    var sType = 'onready',
        result = false;

    if (typeof oMethod === 'function') {

      // <d>
      if (didInit) {
        sm2._wD(str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = window;
      }

      addOnEvent(sType, oMethod, oScope);
      processOnEvents();

      result = true;

    } else {

      throw str('needFunction', sType);

    }

    return result;

  };

  /**
   * Queues a callback for execution when SoundManager has failed to initialize.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.ontimeout = function(oMethod, oScope) {

    var sType = 'ontimeout',
        result = false;

    if (typeof oMethod === 'function') {

      // <d>
      if (didInit) {
        sm2._wD(str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = window;
      }

      addOnEvent(sType, oMethod, oScope);
      processOnEvents({type:sType});

      result = true;

    } else {

      throw str('needFunction', sType);

    }

    return result;

  };

  /**
   * Writes console.log()-style debug output to a console or in-browser element.
   * Applies when debugMode = true
   *
   * @param {string} sText The console message
   * @param {object} nType Optional log level (number), or object. Number case: Log type/style where 0 = 'info', 1 = 'warn', 2 = 'error'. Object case: Object to be dumped.
   */

  this._writeDebug = function(sText, sTypeOrObject) {

    // pseudo-private console.log()-style output
    // <d>

    var sDID = 'soundmanager-debug', o, oItem;

    if (!sm2.setupOptions.debugMode) {
      return false;
    }

    if (hasConsole && sm2.useConsole) {
      if (sTypeOrObject && typeof sTypeOrObject === 'object') {
        // object passed; dump to console.
        console.log(sText, sTypeOrObject);
      } else if (debugLevels[sTypeOrObject] !== _undefined) {
        console[debugLevels[sTypeOrObject]](sText);
      } else {
        console.log(sText);
      }
      if (sm2.consoleOnly) {
        return true;
      }
    }

    o = id(sDID);

    if (!o) {
      return false;
    }

    oItem = doc.createElement('div');

    if (++wdCount % 2 === 0) {
      oItem.className = 'sm2-alt';
    }

    if (sTypeOrObject === _undefined) {
      sTypeOrObject = 0;
    } else {
      sTypeOrObject = parseInt(sTypeOrObject, 10);
    }

    oItem.appendChild(doc.createTextNode(sText));

    if (sTypeOrObject) {
      if (sTypeOrObject >= 2) {
        oItem.style.fontWeight = 'bold';
      }
      if (sTypeOrObject === 3) {
        oItem.style.color = '#ff3333';
      }
    }

    // top-to-bottom
    // o.appendChild(oItem);

    // bottom-to-top
    o.insertBefore(oItem, o.firstChild);

    o = null;
    // </d>

    return true;

  };

  // <d>
  // last-resort debugging option
  if (wl.indexOf('sm2-debug=alert') !== -1) {
    this._writeDebug = function(sText) {
      window.alert(sText);
    };
  }
  // </d>

  // alias
  this._wD = this._writeDebug;

  /**
   * Provides debug / state information on all SMSound objects.
   */

  this._debug = function() {

    // <d>
    var i, j;
    _wDS('currentObj', 1);

    for (i = 0, j = sm2.soundIDs.length; i < j; i++) {
      sm2.sounds[sm2.soundIDs[i]]._debug();
    }
    // </d>

  };

  /**
   * Restarts and re-initializes the SoundManager instance.
   *
   * @param {boolean} resetEvents Optional: When true, removes all registered onready and ontimeout event callbacks.
   * @param {boolean} excludeInit Options: When true, does not call beginDelayedInit() (which would restart SM2).
   * @return {object} soundManager The soundManager instance.
   */

  this.reboot = function(resetEvents, excludeInit) {

    // reset some (or all) state, and re-init unless otherwise specified.

    // <d>
    if (sm2.soundIDs.length) {
      sm2._wD('Destroying ' + sm2.soundIDs.length + ' SMSound object' + (sm2.soundIDs.length !== 1 ? 's' : '') + '...');
    }
    // </d>

    var i, j, k;

    for (i = sm2.soundIDs.length- 1 ; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].destruct();
    }

    // trash ze flash (remove from the DOM)

    if (flash) {

      try {

        if (isIE) {
          oRemovedHTML = flash.innerHTML;
        }

        oRemoved = flash.parentNode.removeChild(flash);

      } catch(e) {

        // Remove failed? May be due to flash blockers silently removing the SWF object/embed node from the DOM. Warn and continue.

        _wDS('badRemove', 2);

      }

    }

    // actually, force recreate of movie.

    oRemovedHTML = oRemoved = needsFlash = flash = null;

    sm2.enabled = didDCLoaded = didInit = waitingForEI = initPending = didAppend = appendSuccess = disabled = useGlobalHTML5Audio = sm2.swfLoaded = false;

    sm2.soundIDs = [];
    sm2.sounds = {};

    idCounter = 0;
    didSetup = false;

    if (!resetEvents) {
      // reset callbacks for onready, ontimeout etc. so that they will fire again on re-init
      for (i in on_queue) {
        if (on_queue.hasOwnProperty(i)) {
          for (j = 0, k = on_queue[i].length; j < k; j++) {
            on_queue[i][j].fired = false;
          }
        }
      }
    } else {
      // remove all callbacks entirely
      on_queue = [];
    }

    // <d>
    if (!excludeInit) {
      sm2._wD(sm + ': Rebooting...');
    }
    // </d>

    // reset HTML5 and flash canPlay test results

    sm2.html5 = {
      'usingFlash': null
    };

    sm2.flash = {};

    // reset device-specific HTML/flash mode switches

    sm2.html5Only = false;
    sm2.ignoreFlash = false;

    window.setTimeout(function() {

      // by default, re-init

      if (!excludeInit) {
        sm2.beginDelayedInit();
      }

    }, 20);

    return sm2;

  };

  this.reset = function() {

    /**
     * Shuts down and restores the SoundManager instance to its original loaded state, without an explicit reboot. All onready/ontimeout handlers are removed.
     * After this call, SM2 may be re-initialized via soundManager.beginDelayedInit().
     * @return {object} soundManager The soundManager instance.
     */

    _wDS('reset');
    return sm2.reboot(true, true);

  };

  /**
   * Undocumented: Determines the SM2 flash movie's load progress.
   *
   * @return {number or null} Percent loaded, or if invalid/unsupported, null.
   */

  this.getMoviePercent = function() {

    /**
     * Interesting syntax notes...
     * Flash/ExternalInterface (ActiveX/NPAPI) bridge methods are not typeof "function" nor instanceof Function, but are still valid.
     * Additionally, JSLint dislikes ('PercentLoaded' in flash)-style syntax and recommends hasOwnProperty(), which does not work in this case.
     * Furthermore, using (flash && flash.PercentLoaded) causes IE to throw "object doesn't support this property or method".
     * Thus, 'in' syntax must be used.
     */

    return (flash && 'PercentLoaded' in flash ? flash.PercentLoaded() : null); // Yes, JSLint. See nearby comment in source for explanation.

  };

  /**
   * Additional helper for manually invoking SM2's init process after DOM Ready / window.onload().
   */

  this.beginDelayedInit = function() {

    windowLoaded = true;
    domContentLoaded();

    setTimeout(function() {

      if (initPending) {
        return false;
      }

      createMovie();
      initMovie();
      initPending = true;

      return true;

    }, 20);

    delayWaitForEI();

  };

  /**
   * Destroys the SoundManager instance and all SMSound instances.
   */

  this.destruct = function() {

    sm2._wD(sm + '.destruct()');
    sm2.disable(true);

  };

  /**
   * SMSound() (sound object) constructor
   * ------------------------------------
   *
   * @param {object} oOptions Sound options (id and url are required attributes)
   * @return {SMSound} The new SMSound object
   */

  SMSound = function(oOptions) {

    var s = this, resetProperties, add_html5_events, remove_html5_events, stop_html5_timer, start_html5_timer, attachOnPosition, onplay_called = false, onPositionItems = [], onPositionFired = 0, detachOnPosition, applyFromTo, lastURL = null, lastHTML5State, urlOmitted;

    lastHTML5State = {
      // tracks duration + position (time)
      duration: null,
      time: null
    };

    this.id = oOptions.id;

    // legacy
    this.sID = this.id;

    this.url = oOptions.url;
    this.options = mixin(oOptions);

    // per-play-instance-specific options
    this.instanceOptions = this.options;

    // short alias
    this._iO = this.instanceOptions;

    // assign property defaults
    this.pan = this.options.pan;
    this.volume = this.options.volume;

    // whether or not this object is using HTML5
    this.isHTML5 = false;

    // internal HTML5 Audio() object reference
    this._a = null;

    // for flash 8 special-case createSound() without url, followed by load/play with url case
    urlOmitted = (this.url ? false : true);

    /**
     * SMSound() public methods
     * ------------------------
     */

    this.id3 = {};

    /**
     * Writes SMSound object parameters to debug console
     */

    this._debug = function() {

      // <d>
      sm2._wD(s.id + ': Merged options:', s.options);
      // </d>

    };

    /**
     * Begins loading a sound per its *url*.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.load = function(oOptions) {

      var oSound = null, instanceOptions;

      if (oOptions !== _undefined) {
        s._iO = mixin(oOptions, s.options);
      } else {
        oOptions = s.options;
        s._iO = oOptions;
        if (lastURL && lastURL !== s.url) {
          _wDS('manURL');
          s._iO.url = s.url;
          s.url = null;
        }
      }

      if (!s._iO.url) {
        s._iO.url = s.url;
      }

      s._iO.url = parseURL(s._iO.url);

      // ensure we're in sync
      s.instanceOptions = s._iO;

      // local shortcut
      instanceOptions = s._iO;

      sm2._wD(s.id + ': load (' + instanceOptions.url + ')');

      if (!instanceOptions.url && !s.url) {
        sm2._wD(s.id + ': load(): url is unassigned. Exiting.', 2);
        return s;
      }

      // <d>
      if (!s.isHTML5 && fV === 8 && !s.url && !instanceOptions.autoPlay) {
        // flash 8 load() -> play() won't work before onload has fired.
        sm2._wD(s.id + ': Flash 8 load() limitation: Wait for onload() before calling play().', 1);
      }
      // </d>

      if (instanceOptions.url === s.url && s.readyState !== 0 && s.readyState !== 2) {
        _wDS('onURL', 1);
        // if loaded and an onload() exists, fire immediately.
        if (s.readyState === 3 && instanceOptions.onload) {
          // assume success based on truthy duration.
          wrapCallback(s, function() {
            instanceOptions.onload.apply(s, [(!!s.duration)]);
          });
        }
        return s;
      }

      // reset a few state properties

      s.loaded = false;
      s.readyState = 1;
      s.playState = 0;
      s.id3 = {};

      // TODO: If switching from HTML5 -> flash (or vice versa), stop currently-playing audio.

      if (html5OK(instanceOptions)) {

        oSound = s._setup_html5(instanceOptions);

        if (!oSound._called_load) {

          s._html5_canplay = false;

          // TODO: review called_load / html5_canplay logic

          // if url provided directly to load(), assign it here.

          if (s.url !== instanceOptions.url) {

            sm2._wD(_wDS('manURL') + ': ' + instanceOptions.url);

            s._a.src = instanceOptions.url;

            // TODO: review / re-apply all relevant options (volume, loop, onposition etc.)

            // reset position for new URL
            s.setPosition(0);

          }

          // given explicit load call, try to preload.

          // early HTML5 implementation (non-standard)
          s._a.autobuffer = 'auto';

          // standard property, values: none / metadata / auto
          // reference: http://msdn.microsoft.com/en-us/library/ie/ff974759%28v=vs.85%29.aspx
          s._a.preload = 'auto';

          s._a._called_load = true;

        } else {

          sm2._wD(s.id + ': Ignoring request to load again');

        }

      } else {

        if (sm2.html5Only) {
          sm2._wD(s.id + ': No flash support. Exiting.');
          return s;
        }

        if (s._iO.url && s._iO.url.match(/data\:/i)) {
          // data: URIs not supported by Flash, either.
          sm2._wD(s.id + ': data: URIs not supported via Flash. Exiting.');
          return s;
        }

        try {
          s.isHTML5 = false;
          s._iO = policyFix(loopFix(instanceOptions));
          // if we have "position", disable auto-play as we'll be seeking to that position at onload().
          if (s._iO.autoPlay && (s._iO.position || s._iO.from)) {
            sm2._wD(s.id + ': Disabling autoPlay because of non-zero offset case');
            s._iO.autoPlay = false;
          }
          // re-assign local shortcut
          instanceOptions = s._iO;
          if (fV === 8) {
            flash._load(s.id, instanceOptions.url, instanceOptions.stream, instanceOptions.autoPlay, instanceOptions.usePolicyFile);
          } else {
            flash._load(s.id, instanceOptions.url, !!(instanceOptions.stream), !!(instanceOptions.autoPlay), instanceOptions.loops || 1, !!(instanceOptions.autoLoad), instanceOptions.usePolicyFile);
          }
        } catch(e) {
          _wDS('smError', 2);
          debugTS('onload', false);
          catchError({
            type: 'SMSOUND_LOAD_JS_EXCEPTION',
            fatal: true
          });
        }

      }

      // after all of this, ensure sound url is up to date.
      s.url = instanceOptions.url;

      return s;

    };

    /**
     * Unloads a sound, canceling any open HTTP requests.
     *
     * @return {SMSound} The SMSound object
     */

    this.unload = function() {

      // Flash 8/AS2 can't "close" a stream - fake it by loading an empty URL
      // Flash 9/AS3: Close stream, preventing further load
      // HTML5: Most UAs will use empty URL

      if (s.readyState !== 0) {

        sm2._wD(s.id + ': unload()');

        if (!s.isHTML5) {

          if (fV === 8) {
            flash._unload(s.id, emptyURL);
          } else {
            flash._unload(s.id);
          }

        } else {

          stop_html5_timer();

          if (s._a) {

            s._a.pause();

            // update empty URL, too
            lastURL = html5Unload(s._a);

          }

        }

        // reset load/status flags
        resetProperties();

      }

      return s;

    };

    /**
     * Unloads and destroys a sound.
     */

    this.destruct = function(_bFromSM) {

      sm2._wD(s.id + ': Destruct');

      if (!s.isHTML5) {

        // kill sound within Flash
        // Disable the onfailure handler
        s._iO.onfailure = null;
        flash._destroySound(s.id);

      } else {

        stop_html5_timer();

        if (s._a) {
          s._a.pause();
          html5Unload(s._a);
          if (!useGlobalHTML5Audio) {
            remove_html5_events();
          }
          // break obvious circular reference
          s._a._s = null;
          s._a = null;
        }

      }

      if (!_bFromSM) {
        // ensure deletion from controller
        sm2.destroySound(s.id, true);
      }

    };

    /**
     * Begins playing a sound.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.play = function(oOptions, _updatePlayState) {

      var fN, allowMulti, a, onready,
          audioClone, onended, oncanplay,
          startOK = true,
          exit = null;

      // <d>
      fN = s.id + ': play(): ';
      // </d>

      // default to true
      _updatePlayState = (_updatePlayState === _undefined ? true : _updatePlayState);

      if (!oOptions) {
        oOptions = {};
      }

      // first, use local URL (if specified)
      if (s.url) {
        s._iO.url = s.url;
      }

      // mix in any options defined at createSound()
      s._iO = mixin(s._iO, s.options);

      // mix in any options specific to this method
      s._iO = mixin(oOptions, s._iO);

      s._iO.url = parseURL(s._iO.url);

      s.instanceOptions = s._iO;

      // RTMP-only
      if (!s.isHTML5 && s._iO.serverURL && !s.connected) {
        if (!s.getAutoPlay()) {
          sm2._wD(fN +' Netstream not connected yet - setting autoPlay');
          s.setAutoPlay(true);
        }
        // play will be called in onconnect()
        return s;
      }

      if (html5OK(s._iO)) {
        s._setup_html5(s._iO);
        start_html5_timer();
      }

      if (s.playState === 1 && !s.paused) {

        allowMulti = s._iO.multiShot;

        if (!allowMulti) {

          sm2._wD(fN + 'Already playing (one-shot)', 1);

          if (s.isHTML5) {
            // go back to original position.
            s.setPosition(s._iO.position);
          }

          exit = s;

        } else {
          sm2._wD(fN + 'Already playing (multi-shot)', 1);
        }

      }

      if (exit !== null) {
        return exit;
      }

      // edge case: play() with explicit URL parameter
      if (oOptions.url && oOptions.url !== s.url) {

        // special case for createSound() followed by load() / play() with url; avoid double-load case.
        if (!s.readyState && !s.isHTML5 && fV === 8 && urlOmitted) {

          urlOmitted = false;

        } else {

          // load using merged options
          s.load(s._iO);

        }

      }

      if (!s.loaded) {

        if (s.readyState === 0) {

          sm2._wD(fN + 'Attempting to load');

          // try to get this sound playing ASAP
          if (!s.isHTML5 && !sm2.html5Only) {

            // flash: assign directly because setAutoPlay() increments the instanceCount
            s._iO.autoPlay = true;
            s.load(s._iO);

          } else if (s.isHTML5) {

            // iOS needs this when recycling sounds, loading a new URL on an existing object.
            s.load(s._iO);

          } else {

            sm2._wD(fN + 'Unsupported type. Exiting.');
            exit = s;

          }

          // HTML5 hack - re-set instanceOptions?
          s.instanceOptions = s._iO;

        } else if (s.readyState === 2) {

          sm2._wD(fN + 'Could not load - exiting', 2);
          exit = s;

        } else {

          sm2._wD(fN + 'Loading - attempting to play...');

        }

      } else {

        // "play()"
        sm2._wD(fN.substr(0, fN.lastIndexOf(':')));

      }

      if (exit !== null) {
        return exit;
      }

      if (!s.isHTML5 && fV === 9 && s.position > 0 && s.position === s.duration) {
        // flash 9 needs a position reset if play() is called while at the end of a sound.
        sm2._wD(fN + 'Sound at end, resetting to position: 0');
        oOptions.position = 0;
      }

      /**
       * Streams will pause when their buffer is full if they are being loaded.
       * In this case paused is true, but the song hasn't started playing yet.
       * If we just call resume() the onplay() callback will never be called.
       * So only call resume() if the position is > 0.
       * Another reason is because options like volume won't have been applied yet.
       * For normal sounds, just resume.
       */

      if (s.paused && s.position >= 0 && (!s._iO.serverURL || s.position > 0)) {

        // https://gist.github.com/37b17df75cc4d7a90bf6
        sm2._wD(fN + 'Resuming from paused state', 1);
        s.resume();

      } else {

        s._iO = mixin(oOptions, s._iO);

        /**
         * Preload in the event of play() with position under Flash,
         * or from/to parameters and non-RTMP case
         */
        if (((!s.isHTML5 && s._iO.position !== null && s._iO.position > 0) || (s._iO.from !== null && s._iO.from > 0) || s._iO.to !== null) && s.instanceCount === 0 && s.playState === 0 && !s._iO.serverURL) {

          onready = function() {
            // sound "canplay" or onload()
            // re-apply position/from/to to instance options, and start playback
            s._iO = mixin(oOptions, s._iO);
            s.play(s._iO);
          };

          // HTML5 needs to at least have "canplay" fired before seeking.
          if (s.isHTML5 && !s._html5_canplay) {

            // this hasn't been loaded yet. load it first, and then do this again.
            sm2._wD(fN + 'Beginning load for non-zero offset case');

            s.load({
              // note: custom HTML5-only event added for from/to implementation.
              _oncanplay: onready
            });

            exit = false;

          } else if (!s.isHTML5 && !s.loaded && (!s.readyState || s.readyState !== 2)) {

            // to be safe, preload the whole thing in Flash.

            sm2._wD(fN + 'Preloading for non-zero offset case');

            s.load({
              onload: onready
            });

            exit = false;

          }

          if (exit !== null) {
            return exit;
          }

          // otherwise, we're ready to go. re-apply local options, and continue

          s._iO = applyFromTo();

        }

        // sm2._wD(fN + 'Starting to play');

        // increment instance counter, where enabled + supported
        if (!s.instanceCount || s._iO.multiShotEvents || (s.isHTML5 && s._iO.multiShot && !useGlobalHTML5Audio) || (!s.isHTML5 && fV > 8 && !s.getAutoPlay())) {
          s.instanceCount++;
        }

        // if first play and onposition parameters exist, apply them now
        if (s._iO.onposition && s.playState === 0) {
          attachOnPosition(s);
        }

        s.playState = 1;
        s.paused = false;

        s.position = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position : 0);

        if (!s.isHTML5) {
          s._iO = policyFix(loopFix(s._iO));
        }

        if (s._iO.onplay && _updatePlayState) {
          s._iO.onplay.apply(s);
          onplay_called = true;
        }

        s.setVolume(s._iO.volume, true);
        s.setPan(s._iO.pan, true);

        if (!s.isHTML5) {

          startOK = flash._start(s.id, s._iO.loops || 1, (fV === 9 ? s.position : s.position / msecScale), s._iO.multiShot || false);

          if (fV === 9 && !startOK) {
            // edge case: no sound hardware, or 32-channel flash ceiling hit.
            // applies only to Flash 9, non-NetStream/MovieStar sounds.
            // http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/media/Sound.html#play%28%29
            sm2._wD(fN + 'No sound hardware, or 32-sound ceiling hit', 2);
            if (s._iO.onplayerror) {
              s._iO.onplayerror.apply(s);
            }

          }

        } else {

          if (s.instanceCount < 2) {

            // HTML5 single-instance case

            start_html5_timer();

            a = s._setup_html5();

            s.setPosition(s._iO.position);

            a.play();

          } else {

            // HTML5 multi-shot case

            sm2._wD(s.id + ': Cloning Audio() for instance #' + s.instanceCount + '...');

            audioClone = new Audio(s._iO.url);

            onended = function() {
              event.remove(audioClone, 'ended', onended);
              s._onfinish(s);
              // cleanup
              html5Unload(audioClone);
              audioClone = null;
            };

            oncanplay = function() {
              event.remove(audioClone, 'canplay', oncanplay);
              try {
                audioClone.currentTime = s._iO.position/msecScale;
              } catch(err) {
                complain(s.id + ': multiShot play() failed to apply position of ' + (s._iO.position/msecScale));
              }
              audioClone.play();
            };

            event.add(audioClone, 'ended', onended);

            // apply volume to clones, too
            if (s._iO.volume !== _undefined) {
              audioClone.volume = Math.max(0, Math.min(1, s._iO.volume/100));
            }

            // playing multiple muted sounds? if you do this, you're weird ;) - but let's cover it.
            if (s.muted) {
              audioClone.muted = true;
            }

            if (s._iO.position) {
              // HTML5 audio can't seek before onplay() event has fired.
              // wait for canplay, then seek to position and start playback.
              event.add(audioClone, 'canplay', oncanplay);
            } else {
              // begin playback at currentTime: 0
              audioClone.play();
            }

          }

        }

      }

      return s;

    };

    // just for convenience
    this.start = this.play;

    /**
     * Stops playing a sound (and optionally, all sounds)
     *
     * @param {boolean} bAll Optional: Whether to stop all sounds
     * @return {SMSound} The SMSound object
     */

    this.stop = function(bAll) {

      var instanceOptions = s._iO,
          originalPosition;

      if (s.playState === 1) {

        sm2._wD(s.id + ': stop()');

        s._onbufferchange(0);
        s._resetOnPosition(0);
        s.paused = false;

        if (!s.isHTML5) {
          s.playState = 0;
        }

        // remove onPosition listeners, if any
        detachOnPosition();

        // and "to" position, if set
        if (instanceOptions.to) {
          s.clearOnPosition(instanceOptions.to);
        }

        if (!s.isHTML5) {

          flash._stop(s.id, bAll);

          // hack for netStream: just unload
          if (instanceOptions.serverURL) {
            s.unload();
          }

        } else {

          if (s._a) {

            originalPosition = s.position;

            // act like Flash, though
            s.setPosition(0);

            // hack: reflect old position for onstop() (also like Flash)
            s.position = originalPosition;

            // html5 has no stop()
            // NOTE: pausing means iOS requires interaction to resume.
            s._a.pause();

            s.playState = 0;

            // and update UI
            s._onTimer();

            stop_html5_timer();

          }

        }

        s.instanceCount = 0;
        s._iO = {};

        if (instanceOptions.onstop) {
          instanceOptions.onstop.apply(s);
        }

      }

      return s;

    };

    /**
     * Undocumented/internal: Sets autoPlay for RTMP.
     *
     * @param {boolean} autoPlay state
     */

    this.setAutoPlay = function(autoPlay) {

      sm2._wD(s.id + ': Autoplay turned ' + (autoPlay ? 'on' : 'off'));
      s._iO.autoPlay = autoPlay;

      if (!s.isHTML5) {
        flash._setAutoPlay(s.id, autoPlay);
        if (autoPlay) {
          // only increment the instanceCount if the sound isn't loaded (TODO: verify RTMP)
          if (!s.instanceCount && s.readyState === 1) {
            s.instanceCount++;
            sm2._wD(s.id + ': Incremented instance count to '+s.instanceCount);
          }
        }
      }

    };

    /**
     * Undocumented/internal: Returns the autoPlay boolean.
     *
     * @return {boolean} The current autoPlay value
     */

    this.getAutoPlay = function() {

      return s._iO.autoPlay;

    };

    /**
     * Sets the position of a sound.
     *
     * @param {number} nMsecOffset Position (milliseconds)
     * @return {SMSound} The SMSound object
     */

    this.setPosition = function(nMsecOffset) {

      if (nMsecOffset === _undefined) {
        nMsecOffset = 0;
      }

      var position, position1K,
          // Use the duration from the instance options, if we don't have a track duration yet.
          // position >= 0 and <= current available (loaded) duration
          offset = (s.isHTML5 ? Math.max(nMsecOffset, 0) : Math.min(s.duration || s._iO.duration, Math.max(nMsecOffset, 0)));

      s.position = offset;
      position1K = s.position/msecScale;
      s._resetOnPosition(s.position);
      s._iO.position = offset;

      if (!s.isHTML5) {

        position = (fV === 9 ? s.position : position1K);

        if (s.readyState && s.readyState !== 2) {
          // if paused or not playing, will not resume (by playing)
          flash._setPosition(s.id, position, (s.paused || !s.playState), s._iO.multiShot);
        }

      } else if (s._a) {

        // Set the position in the canplay handler if the sound is not ready yet
        if (s._html5_canplay) {

          if (s._a.currentTime !== position1K) {

            /**
             * DOM/JS errors/exceptions to watch out for:
             * if seek is beyond (loaded?) position, "DOM exception 11"
             * "INDEX_SIZE_ERR": DOM exception 1
             */
            sm2._wD(s.id + ': setPosition(' + position1K + ')');

            try {
              s._a.currentTime = position1K;
              if (s.playState === 0 || s.paused) {
                // allow seek without auto-play/resume
                s._a.pause();
              }
            } catch(e) {
              sm2._wD(s.id + ': setPosition(' + position1K + ') failed: ' + e.message, 2);
            }

          }

        } else if (position1K) {

          // warn on non-zero seek attempts
          sm2._wD(s.id + ': setPosition(' + position1K + '): Cannot seek yet, sound not ready', 2);
          return s;

        }

        if (s.paused) {

          // if paused, refresh UI right away by forcing update
          s._onTimer(true);

        }

      }

      return s;

    };

    /**
     * Pauses sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.pause = function(_bCallFlash) {

      if (s.paused || (s.playState === 0 && s.readyState !== 1)) {
        return s;
      }

      sm2._wD(s.id + ': pause()');
      s.paused = true;

      if (!s.isHTML5) {
        if (_bCallFlash || _bCallFlash === _undefined) {
          flash._pause(s.id, s._iO.multiShot);
        }
      } else {
        s._setup_html5().pause();
        stop_html5_timer();
      }

      if (s._iO.onpause) {
        s._iO.onpause.apply(s);
      }

      return s;

    };

    /**
     * Resumes sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    /**
     * When auto-loaded streams pause on buffer full they have a playState of 0.
     * We need to make sure that the playState is set to 1 when these streams "resume".
     * When a paused stream is resumed, we need to trigger the onplay() callback if it
     * hasn't been called already. In this case since the sound is being played for the
     * first time, I think it's more appropriate to call onplay() rather than onresume().
     */

    this.resume = function() {

      var instanceOptions = s._iO;

      if (!s.paused) {
        return s;
      }

      sm2._wD(s.id + ': resume()');
      s.paused = false;
      s.playState = 1;

      if (!s.isHTML5) {

        if (instanceOptions.isMovieStar && !instanceOptions.serverURL) {
          // Bizarre Webkit bug (Chrome reported via 8tracks.com dudes): AAC content paused for 30+ seconds(?) will not resume without a reposition.
          s.setPosition(s.position);
        }

        // flash method is toggle-based (pause/resume)
        flash._pause(s.id, instanceOptions.multiShot);

      } else {

        s._setup_html5().play();
        start_html5_timer();

      }

      if (!onplay_called && instanceOptions.onplay) {

        instanceOptions.onplay.apply(s);
        onplay_called = true;

      } else if (instanceOptions.onresume) {

        instanceOptions.onresume.apply(s);

      }

      return s;

    };

    /**
     * Toggles sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.togglePause = function() {

      sm2._wD(s.id + ': togglePause()');

      if (s.playState === 0) {
        s.play({
          position: (fV === 9 && !s.isHTML5 ? s.position : s.position / msecScale)
        });
        return s;
      }

      if (s.paused) {
        s.resume();
      } else {
        s.pause();
      }

      return s;

    };

    /**
     * Sets the panning (L-R) effect.
     *
     * @param {number} nPan The pan value (-100 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setPan = function(nPan, bInstanceOnly) {

      if (nPan === _undefined) {
        nPan = 0;
      }

      if (bInstanceOnly === _undefined) {
        bInstanceOnly = false;
      }

      if (!s.isHTML5) {
        flash._setPan(s.id, nPan);
      } // else { no HTML5 pan? }

      s._iO.pan = nPan;

      if (!bInstanceOnly) {
        s.pan = nPan;
        s.options.pan = nPan;
      }

      return s;

    };

    /**
     * Sets the volume.
     *
     * @param {number} nVol The volume value (0 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setVolume = function(nVol, _bInstanceOnly) {

      /**
       * Note: Setting volume has no effect on iOS "special snowflake" devices.
       * Hardware volume control overrides software, and volume
       * will always return 1 per Apple docs. (iOS 4 + 5.)
       * http://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingSoundtoCanvasAnimations/AddingSoundtoCanvasAnimations.html
       */

      if (nVol === _undefined) {
        nVol = 100;
      }

      if (_bInstanceOnly === _undefined) {
        _bInstanceOnly = false;
      }

      if (!s.isHTML5) {

        flash._setVolume(s.id, (sm2.muted && !s.muted) || s.muted ? 0 : nVol);

      } else if (s._a) {

        if (sm2.muted && !s.muted) {
          s.muted = true;
          s._a.muted = true;
        }

        // valid range for native HTML5 Audio(): 0-1
        s._a.volume = Math.max(0, Math.min(1, nVol/100));

      }

      s._iO.volume = nVol;

      if (!_bInstanceOnly) {
        s.volume = nVol;
        s.options.volume = nVol;
      }

      return s;

    };

    /**
     * Mutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.mute = function() {

      s.muted = true;

      if (!s.isHTML5) {
        flash._setVolume(s.id, 0);
      } else if (s._a) {
        s._a.muted = true;
      }

      return s;

    };

    /**
     * Unmutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.unmute = function() {

      s.muted = false;
      var hasIO = (s._iO.volume !== _undefined);

      if (!s.isHTML5) {
        flash._setVolume(s.id, hasIO ? s._iO.volume : s.options.volume);
      } else if (s._a) {
        s._a.muted = false;
      }

      return s;

    };

    /**
     * Toggles the muted state of a sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.toggleMute = function() {

      return (s.muted ? s.unmute() : s.mute());

    };

    /**
     * Registers a callback to be fired when a sound reaches a given position during playback.
     *
     * @param {number} nPosition The position to watch for
     * @param {function} oMethod The relevant callback to fire
     * @param {object} oScope Optional: The scope to apply the callback to
     * @return {SMSound} The SMSound object
     */

    this.onPosition = function(nPosition, oMethod, oScope) {

      // TODO: basic dupe checking?

      onPositionItems.push({
        position: parseInt(nPosition, 10),
        method: oMethod,
        scope: (oScope !== _undefined ? oScope : s),
        fired: false
      });

      return s;

    };

    // legacy/backwards-compability: lower-case method name
    this.onposition = this.onPosition;

    /**
     * Removes registered callback(s) from a sound, by position and/or callback.
     *
     * @param {number} nPosition The position to clear callback(s) for
     * @param {function} oMethod Optional: Identify one callback to be removed when multiple listeners exist for one position
     * @return {SMSound} The SMSound object
     */

    this.clearOnPosition = function(nPosition, oMethod) {

      var i;

      nPosition = parseInt(nPosition, 10);

      if (isNaN(nPosition)) {
        // safety check
        return false;
      }

      for (i=0; i < onPositionItems.length; i++) {

        if (nPosition === onPositionItems[i].position) {
          // remove this item if no method was specified, or, if the method matches
          
          if (!oMethod || (oMethod === onPositionItems[i].method)) {
            
            if (onPositionItems[i].fired) {
              // decrement "fired" counter, too
              onPositionFired--;
            }
            
            onPositionItems.splice(i, 1);
          
          }
        
        }

      }

    };

    this._processOnPosition = function() {

      var i, item, j = onPositionItems.length;

      if (!j || !s.playState || onPositionFired >= j) {
        return false;
      }

      for (i = j - 1; i >= 0; i--) {
        
        item = onPositionItems[i];
        
        if (!item.fired && s.position >= item.position) {
        
          item.fired = true;
          onPositionFired++;
          item.method.apply(item.scope, [item.position]);
        
          //  reset j -- onPositionItems.length can be changed in the item callback above... occasionally breaking the loop.
		      j = onPositionItems.length;
        
        }
      
      }

      return true;

    };

    this._resetOnPosition = function(nPosition) {

      // reset "fired" for items interested in this position
      var i, item, j = onPositionItems.length;

      if (!j) {
        return false;
      }

      for (i = j - 1; i >= 0; i--) {
        
        item = onPositionItems[i];
        
        if (item.fired && nPosition <= item.position) {
          item.fired = false;
          onPositionFired--;
        }
      
      }

      return true;

    };

    /**
     * SMSound() private internals
     * --------------------------------
     */

    applyFromTo = function() {

      var instanceOptions = s._iO,
          f = instanceOptions.from,
          t = instanceOptions.to,
          start, end;

      end = function() {

        // end has been reached.
        sm2._wD(s.id + ': "To" time of ' + t + ' reached.');

        // detach listener
        s.clearOnPosition(t, end);

        // stop should clear this, too
        s.stop();

      };

      start = function() {

        sm2._wD(s.id + ': Playing "from" ' + f);

        // add listener for end
        if (t !== null && !isNaN(t)) {
          s.onPosition(t, end);
        }

      };

      if (f !== null && !isNaN(f)) {

        // apply to instance options, guaranteeing correct start position.
        instanceOptions.position = f;

        // multiShot timing can't be tracked, so prevent that.
        instanceOptions.multiShot = false;

        start();

      }

      // return updated instanceOptions including starting position
      return instanceOptions;

    };

    attachOnPosition = function() {

      var item,
          op = s._iO.onposition;

      // attach onposition things, if any, now.

      if (op) {

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.onPosition(parseInt(item, 10), op[item]);
          }
        }

      }

    };

    detachOnPosition = function() {

      var item,
          op = s._iO.onposition;

      // detach any onposition()-style listeners.

      if (op) {

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.clearOnPosition(parseInt(item, 10));
          }
        }

      }

    };

    start_html5_timer = function() {

      if (s.isHTML5) {
        startTimer(s);
      }

    };

    stop_html5_timer = function() {

      if (s.isHTML5) {
        stopTimer(s);
      }

    };

    resetProperties = function(retainPosition) {

      if (!retainPosition) {
        onPositionItems = [];
        onPositionFired = 0;
      }

      onplay_called = false;

      s._hasTimer = null;
      s._a = null;
      s._html5_canplay = false;
      s.bytesLoaded = null;
      s.bytesTotal = null;
      s.duration = (s._iO && s._iO.duration ? s._iO.duration : null);
      s.durationEstimate = null;
      s.buffered = [];

      // legacy: 1D array
      s.eqData = [];

      s.eqData.left = [];
      s.eqData.right = [];

      s.failures = 0;
      s.isBuffering = false;
      s.instanceOptions = {};
      s.instanceCount = 0;
      s.loaded = false;
      s.metadata = {};

      // 0 = uninitialised, 1 = loading, 2 = failed/error, 3 = loaded/success
      s.readyState = 0;

      s.muted = false;
      s.paused = false;

      s.peakData = {
        left: 0,
        right: 0
      };

      s.waveformData = {
        left: [],
        right: []
      };

      s.playState = 0;
      s.position = null;

      s.id3 = {};

    };

    resetProperties();

    /**
     * Pseudo-private SMSound internals
     * --------------------------------
     */

    this._onTimer = function(bForce) {

      /**
       * HTML5-only _whileplaying() etc.
       * called from both HTML5 native events, and polling/interval-based timers
       * mimics flash and fires only when time/duration change, so as to be polling-friendly
       */

      var duration, isNew = false, time, x = {};

      if (s._hasTimer || bForce) {

        // TODO: May not need to track readyState (1 = loading)

        if (s._a && (bForce || ((s.playState > 0 || s.readyState === 1) && !s.paused))) {

          duration = s._get_html5_duration();

          if (duration !== lastHTML5State.duration) {

            lastHTML5State.duration = duration;
            s.duration = duration;
            isNew = true;

          }

          // TODO: investigate why this goes wack if not set/re-set each time.
          s.durationEstimate = s.duration;

          time = (s._a.currentTime * msecScale || 0);

          if (time !== lastHTML5State.time) {

            lastHTML5State.time = time;
            isNew = true;

          }

          if (isNew || bForce) {

            s._whileplaying(time, x, x, x, x);

          }

        }/* else {

          // sm2._wD('_onTimer: Warn for "'+s.id+'": '+(!s._a?'Could not find element. ':'')+(s.playState === 0?'playState bad, 0?':'playState = '+s.playState+', OK'));

          return false;

        }*/

        return isNew;

      }

    };

    this._get_html5_duration = function() {

      var instanceOptions = s._iO,
          // if audio object exists, use its duration - else, instance option duration (if provided - it's a hack, really, and should be retired) OR null
          d = (s._a && s._a.duration ? s._a.duration * msecScale : (instanceOptions && instanceOptions.duration ? instanceOptions.duration : null)),
          result = (d && !isNaN(d) && d !== Infinity ? d : null);

      return result;

    };

    this._apply_loop = function(a, nLoops) {

      /**
       * boolean instead of "loop", for webkit? - spec says string. http://www.w3.org/TR/html-markup/audio.html#audio.attrs.loop
       * note that loop is either off or infinite under HTML5, unlike Flash which allows arbitrary loop counts to be specified.
       */

      // <d>
      if (!a.loop && nLoops > 1) {
        sm2._wD('Note: Native HTML5 looping is infinite.', 1);
      }
      // </d>

      a.loop = (nLoops > 1 ? 'loop' : '');

    };

    this._setup_html5 = function(oOptions) {

      var instanceOptions = mixin(s._iO, oOptions),
          a = useGlobalHTML5Audio ? globalHTML5Audio : s._a,
          dURL = decodeURI(instanceOptions.url),
          sameURL;

      /**
       * "First things first, I, Poppa..." (reset the previous state of the old sound, if playing)
       * Fixes case with devices that can only play one sound at a time
       * Otherwise, other sounds in mid-play will be terminated without warning and in a stuck state
       */

      if (useGlobalHTML5Audio) {

        if (dURL === decodeURI(lastGlobalHTML5URL)) {
          // global HTML5 audio: re-use of URL
          sameURL = true;
        }

      } else if (dURL === decodeURI(lastURL)) {

        // options URL is the same as the "last" URL, and we used (loaded) it
        sameURL = true;

      }

      if (a) {

        if (a._s) {

          if (useGlobalHTML5Audio) {

            if (a._s && a._s.playState && !sameURL) {

              // global HTML5 audio case, and loading a new URL. stop the currently-playing one.
              a._s.stop();

            }

          } else if (!useGlobalHTML5Audio && dURL === decodeURI(lastURL)) {

            // non-global HTML5 reuse case: same url, ignore request
            s._apply_loop(a, instanceOptions.loops);

            return a;

          }

        }

        if (!sameURL) {

          // don't retain onPosition() stuff with new URLs.

          if (lastURL) {
            resetProperties(false);
          }

          // assign new HTML5 URL

          a.src = instanceOptions.url;

          s.url = instanceOptions.url;

          lastURL = instanceOptions.url;

          lastGlobalHTML5URL = instanceOptions.url;

          a._called_load = false;

        }

      } else {

        if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

          s._a = new Audio(instanceOptions.url);
          s._a.load();

        } else {

          // null for stupid Opera 9.64 case
          s._a = (isOpera && opera.version() < 10 ? new Audio(null) : new Audio());

        }

        // assign local reference
        a = s._a;

        a._called_load = false;

        if (useGlobalHTML5Audio) {

          globalHTML5Audio = a;

        }

      }

      s.isHTML5 = true;

      // store a ref on the track
      s._a = a;

      // store a ref on the audio
      a._s = s;

      add_html5_events();

      s._apply_loop(a, instanceOptions.loops);

      if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

        s.load();

      } else {

        // early HTML5 implementation (non-standard)
        a.autobuffer = false;

        // standard ('none' is also an option.)
        a.preload = 'auto';

      }

      return a;

    };

    add_html5_events = function() {

      if (s._a._added_events) {
        return false;
      }

      var f;

      function add(oEvt, oFn, bCapture) {
        return s._a ? s._a.addEventListener(oEvt, oFn, bCapture || false) : null;
      }

      s._a._added_events = true;

      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          add(f, html5_events[f]);
        }
      }

      return true;

    };

    remove_html5_events = function() {

      // Remove event listeners

      var f;

      function remove(oEvt, oFn, bCapture) {
        return (s._a ? s._a.removeEventListener(oEvt, oFn, bCapture || false) : null);
      }

      sm2._wD(s.id + ': Removing event listeners');
      s._a._added_events = false;

      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          remove(f, html5_events[f]);
        }
      }

    };

    /**
     * Pseudo-private event internals
     * ------------------------------
     */

    this._onload = function(nSuccess) {

      var fN,
          // check for duration to prevent false positives from flash 8 when loading from cache.
          loadOK = !!nSuccess || (!s.isHTML5 && fV === 8 && s.duration);

      // <d>
      fN = s.id + ': ';
      sm2._wD(fN + (loadOK ? 'onload()' : 'Failed to load / invalid sound?' + (!s.duration ? ' Zero-length duration reported.' : ' -') + ' (' + s.url + ')'), (loadOK ? 1 : 2));

      if (!loadOK && !s.isHTML5) {
        if (sm2.sandbox.noRemote === true) {
          sm2._wD(fN + str('noNet'), 1);
        }
        if (sm2.sandbox.noLocal === true) {
          sm2._wD(fN + str('noLocal'), 1);
        }
      }
      // </d>

      s.loaded = loadOK;
      s.readyState = (loadOK ? 3 : 2);
      s._onbufferchange(0);

      if (s._iO.onload) {
        wrapCallback(s, function() {
          s._iO.onload.apply(s, [loadOK]);
        });
      }

      return true;

    };

    this._onbufferchange = function(nIsBuffering) {

      if (s.playState === 0) {
        // ignore if not playing
        return false;
      }

      if ((nIsBuffering && s.isBuffering) || (!nIsBuffering && !s.isBuffering)) {
        return false;
      }

      s.isBuffering = (nIsBuffering === 1);
      
      if (s._iO.onbufferchange) {
        sm2._wD(s.id + ': Buffer state change: ' + nIsBuffering);
        s._iO.onbufferchange.apply(s, [nIsBuffering]);
      }

      return true;

    };

    /**
     * Playback may have stopped due to buffering, or related reason.
     * This state can be encountered on iOS < 6 when auto-play is blocked.
     */

    this._onsuspend = function() {

      if (s._iO.onsuspend) {
        sm2._wD(s.id + ': Playback suspended');
        s._iO.onsuspend.apply(s);
      }

      return true;

    };

    /**
     * flash 9/movieStar + RTMP-only method, should fire only once at most
     * at this point we just recreate failed sounds rather than trying to reconnect
     */

    this._onfailure = function(msg, level, code) {

      s.failures++;
      sm2._wD(s.id + ': Failure (' + s.failures + '): ' + msg);

      if (s._iO.onfailure && s.failures === 1) {
        s._iO.onfailure(msg, level, code);
      } else {
        sm2._wD(s.id + ': Ignoring failure');
      }

    };

    /**
     * flash 9/movieStar + RTMP-only method for unhandled warnings/exceptions from Flash
     * e.g., RTMP "method missing" warning (non-fatal) for getStreamLength on server
     */

    this._onwarning = function(msg, level, code) {

      if (s._iO.onwarning) {
        s._iO.onwarning(msg, level, code);
      }

    };

    this._onfinish = function() {

      // store local copy before it gets trashed...
      var io_onfinish = s._iO.onfinish;

      s._onbufferchange(0);
      s._resetOnPosition(0);

      // reset some state items
      if (s.instanceCount) {

        s.instanceCount--;

        if (!s.instanceCount) {

          // remove onPosition listeners, if any
          detachOnPosition();

          // reset instance options
          s.playState = 0;
          s.paused = false;
          s.instanceCount = 0;
          s.instanceOptions = {};
          s._iO = {};
          stop_html5_timer();

          // reset position, too
          if (s.isHTML5) {
            s.position = 0;
          }

        }

        if (!s.instanceCount || s._iO.multiShotEvents) {
          // fire onfinish for last, or every instance
          if (io_onfinish) {
            sm2._wD(s.id + ': onfinish()');
            wrapCallback(s, function() {
              io_onfinish.apply(s);
            });
          }
        }

      }

    };

    this._whileloading = function(nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {

      var instanceOptions = s._iO;

      s.bytesLoaded = nBytesLoaded;
      s.bytesTotal = nBytesTotal;
      s.duration = Math.floor(nDuration);
      s.bufferLength = nBufferLength;

      if (!s.isHTML5 && !instanceOptions.isMovieStar) {

        if (instanceOptions.duration) {
          // use duration from options, if specified and larger. nobody should be specifying duration in options, actually, and it should be retired.
          s.durationEstimate = (s.duration > instanceOptions.duration) ? s.duration : instanceOptions.duration;
        } else {
          s.durationEstimate = parseInt((s.bytesTotal / s.bytesLoaded) * s.duration, 10);
        }

      } else {

        s.durationEstimate = s.duration;

      }

      // for flash, reflect sequential-load-style buffering
      if (!s.isHTML5) {
        s.buffered = [{
          'start': 0,
          'end': s.duration
        }];
      }

      // allow whileloading to fire even if "load" fired under HTML5, due to HTTP range/partials
      if ((s.readyState !== 3 || s.isHTML5) && instanceOptions.whileloading) {
        instanceOptions.whileloading.apply(s);
      }

    };

    this._whileplaying = function(nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {

      var instanceOptions = s._iO,
          eqLeft;

      if (isNaN(nPosition) || nPosition === null) {
        // flash safety net
        return false;
      }

      // Safari HTML5 play() may return small -ve values when starting from position: 0, eg. -50.120396875. Unexpected/invalid per W3, I think. Normalize to 0.
      s.position = Math.max(0, nPosition);

      s._processOnPosition();

      if (!s.isHTML5 && fV > 8) {

        if (instanceOptions.usePeakData && oPeakData !== _undefined && oPeakData) {
          s.peakData = {
            left: oPeakData.leftPeak,
            right: oPeakData.rightPeak
          };
        }

        if (instanceOptions.useWaveformData && oWaveformDataLeft !== _undefined && oWaveformDataLeft) {
          s.waveformData = {
            left: oWaveformDataLeft.split(','),
            right: oWaveformDataRight.split(',')
          };
        }

        if (instanceOptions.useEQData) {
          if (oEQData !== _undefined && oEQData && oEQData.leftEQ) {
            eqLeft = oEQData.leftEQ.split(',');
            s.eqData = eqLeft;
            s.eqData.left = eqLeft;
            if (oEQData.rightEQ !== _undefined && oEQData.rightEQ) {
              s.eqData.right = oEQData.rightEQ.split(',');
            }
          }
        }

      }

      if (s.playState === 1) {

        // special case/hack: ensure buffering is false if loading from cache (and not yet started)
        if (!s.isHTML5 && fV === 8 && !s.position && s.isBuffering) {
          s._onbufferchange(0);
        }

        if (instanceOptions.whileplaying) {
          // flash may call after actual finish
          instanceOptions.whileplaying.apply(s);
        }

      }

      return true;

    };

    this._oncaptiondata = function(oData) {

      /**
       * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
       *
       * @param {object} oData
       */

      sm2._wD(s.id + ': Caption data received.');

      s.captiondata = oData;

      if (s._iO.oncaptiondata) {
        s._iO.oncaptiondata.apply(s, [oData]);
      }

    };

    this._onmetadata = function(oMDProps, oMDData) {

      /**
       * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
       * RTMP may include song title, MovieStar content may include encoding info
       *
       * @param {array} oMDProps (names)
       * @param {array} oMDData (values)
       */

      sm2._wD(s.id + ': Metadata received.');

      var oData = {}, i, j;

      for (i = 0, j = oMDProps.length; i < j; i++) {
        oData[oMDProps[i]] = oMDData[i];
      }

      s.metadata = oData;

      if (s._iO.onmetadata) {
        s._iO.onmetadata.call(s, s.metadata);
      }

    };

    this._onid3 = function(oID3Props, oID3Data) {

      /**
       * internal: flash 8 + flash 9 ID3 feature
       * may include artist, song title etc.
       *
       * @param {array} oID3Props (names)
       * @param {array} oID3Data (values)
       */

      sm2._wD(s.id + ': ID3 data received.');

      var oData = [], i, j;

      for (i = 0, j = oID3Props.length; i < j; i++) {
        oData[oID3Props[i]] = oID3Data[i];
      }

      s.id3 = mixin(s.id3, oData);

      if (s._iO.onid3) {
        s._iO.onid3.apply(s);
      }

    };

    // flash/RTMP-only

    this._onconnect = function(bSuccess) {

      bSuccess = (bSuccess === 1);
      sm2._wD(s.id + ': ' + (bSuccess ? 'Connected.' : 'Failed to connect? - ' + s.url), (bSuccess ? 1 : 2));
      s.connected = bSuccess;

      if (bSuccess) {

        s.failures = 0;

        if (idCheck(s.id)) {
          if (s.getAutoPlay()) {
            // only update the play state if auto playing
            s.play(_undefined, s.getAutoPlay());
          } else if (s._iO.autoLoad) {
            s.load();
          }
        }

        if (s._iO.onconnect) {
          s._iO.onconnect.apply(s, [bSuccess]);
        }

      }

    };

    this._ondataerror = function(sError) {

      // flash 9 wave/eq data handler
      // hack: called at start, and end from flash at/after onfinish()
      if (s.playState > 0) {
        sm2._wD(s.id + ': Data error: ' + sError);
        if (s._iO.ondataerror) {
          s._iO.ondataerror.apply(s);
        }
      }

    };

    // <d>
    this._debug();
    // </d>

  }; // SMSound()

  /**
   * Private SoundManager internals
   * ------------------------------
   */

  getDocument = function() {

    return (doc.body || doc.getElementsByTagName('div')[0]);

  };

  id = function(sID) {

    return doc.getElementById(sID);

  };

  mixin = function(oMain, oAdd) {

    // non-destructive merge
    var o1 = (oMain || {}), o2, o;

    // if unspecified, o2 is the default options object
    o2 = (oAdd === _undefined ? sm2.defaultOptions : oAdd);

    for (o in o2) {

      if (o2.hasOwnProperty(o) && o1[o] === _undefined) {

        if (typeof o2[o] !== 'object' || o2[o] === null) {

          // assign directly
          o1[o] = o2[o];

        } else {

          // recurse through o2
          o1[o] = mixin(o1[o], o2[o]);

        }

      }

    }

    return o1;

  };

  wrapCallback = function(oSound, callback) {

    /**
     * 03/03/2013: Fix for Flash Player 11.6.602.171 + Flash 8 (flashVersion = 8) SWF issue
     * setTimeout() fix for certain SMSound callbacks like onload() and onfinish(), where subsequent calls like play() and load() fail when Flash Player 11.6.602.171 is installed, and using soundManager with flashVersion = 8 (which is the default).
     * Not sure of exact cause. Suspect race condition and/or invalid (NaN-style) position argument trickling down to the next JS -> Flash _start() call, in the play() case.
     * Fix: setTimeout() to yield, plus safer null / NaN checking on position argument provided to Flash.
     * https://getsatisfaction.com/schillmania/topics/recent_chrome_update_seems_to_have_broken_my_sm2_audio_player
     */
    if (!oSound.isHTML5 && fV === 8) {
      window.setTimeout(callback, 0);
    } else {
      callback();
    }

  };

  // additional soundManager properties that soundManager.setup() will accept

  extraOptions = {
    'onready': 1,
    'ontimeout': 1,
    'defaultOptions': 1,
    'flash9Options': 1,
    'movieStarOptions': 1
  };

  assign = function(o, oParent) {

    /**
     * recursive assignment of properties, soundManager.setup() helper
     * allows property assignment based on whitelist
     */

    var i,
        result = true,
        hasParent = (oParent !== _undefined),
        setupOptions = sm2.setupOptions,
        bonusOptions = extraOptions;

    // <d>

    // if soundManager.setup() called, show accepted parameters.

    if (o === _undefined) {

      result = [];

      for (i in setupOptions) {

        if (setupOptions.hasOwnProperty(i)) {
          result.push(i);
        }

      }

      for (i in bonusOptions) {

        if (bonusOptions.hasOwnProperty(i)) {

          if (typeof sm2[i] === 'object') {
            result.push(i + ': {...}');
          } else if (sm2[i] instanceof Function) {
            result.push(i + ': function() {...}');
          } else {
            result.push(i);
          }

        }

      }

      sm2._wD(str('setup', result.join(', ')));

      return false;

    }

    // </d>

    for (i in o) {

      if (o.hasOwnProperty(i)) {

        // if not an {object} we want to recurse through...

        if (typeof o[i] !== 'object' || o[i] === null || o[i] instanceof Array || o[i] instanceof RegExp) {

          // check "allowed" options

          if (hasParent && bonusOptions[oParent] !== _undefined) {

            // valid recursive / nested object option, eg., { defaultOptions: { volume: 50 } }
            sm2[oParent][i] = o[i];

          } else if (setupOptions[i] !== _undefined) {

            // special case: assign to setupOptions object, which soundManager property references
            sm2.setupOptions[i] = o[i];

            // assign directly to soundManager, too
            sm2[i] = o[i];

          } else if (bonusOptions[i] === _undefined) {

            // invalid or disallowed parameter. complain.
            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

            result = false;

          } else {

            /**
             * valid extraOptions (bonusOptions) parameter.
             * is it a method, like onready/ontimeout? call it.
             * multiple parameters should be in an array, eg. soundManager.setup({onready: [myHandler, myScope]});
             */

            if (sm2[i] instanceof Function) {

              sm2[i].apply(sm2, (o[i] instanceof Array ? o[i] : [o[i]]));

            } else {

              // good old-fashioned direct assignment
              sm2[i] = o[i];

            }

          }

        } else {

          // recursion case, eg., { defaultOptions: { ... } }

          if (bonusOptions[i] === _undefined) {

            // invalid or disallowed parameter. complain.
            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

            result = false;

          } else {

            // recurse through object
            return assign(o[i], i);

          }

        }

      }

    }

    return result;

  };

  function preferFlashCheck(kind) {

    // whether flash should play a given type
    return (sm2.preferFlash && hasFlash && !sm2.ignoreFlash && (sm2.flash[kind] !== _undefined && sm2.flash[kind]));

  }

  /**
   * Internal DOM2-level event helpers
   * ---------------------------------
   */

  event = (function() {

    // normalize event methods
    var old = (window.attachEvent),
    evt = {
      add: (old ? 'attachEvent' : 'addEventListener'),
      remove: (old ? 'detachEvent' : 'removeEventListener')
    };

    // normalize "on" event prefix, optional capture argument
    function getArgs(oArgs) {

      var args = slice.call(oArgs),
          len = args.length;

      if (old) {
        // prefix
        args[1] = 'on' + args[1];
        if (len > 3) {
          // no capture
          args.pop();
        }
      } else if (len === 3) {
        args.push(false);
      }

      return args;

    }

    function apply(args, sType) {

      // normalize and call the event method, with the proper arguments
      var element = args.shift(),
          method = [evt[sType]];

      if (old) {
        // old IE can't do apply().
        element[method](args[0], args[1]);
      } else {
        element[method].apply(element, args);
      }

    }

    function add() {
      apply(getArgs(arguments), 'add');
    }

    function remove() {
      apply(getArgs(arguments), 'remove');
    }

    return {
      'add': add,
      'remove': remove
    };

  }());

  /**
   * Internal HTML5 event handling
   * -----------------------------
   */

  function html5_event(oFn) {

    // wrap html5 event handlers so we don't call them on destroyed and/or unloaded sounds

    return function(e) {

      var s = this._s,
          result;

      if (!s || !s._a) {
        // <d>
        if (s && s.id) {
          sm2._wD(s.id + ': Ignoring ' + e.type);
        } else {
          sm2._wD(h5 + 'Ignoring ' + e.type);
        }
        // </d>
        result = null;
      } else {
        result = oFn.call(this, e);
      }

      return result;

    };

  }

  html5_events = {

    // HTML5 event-name-to-handler map

    abort: html5_event(function() {

      sm2._wD(this._s.id + ': abort');

    }),

    // enough has loaded to play

    canplay: html5_event(function() {

      var s = this._s,
          position1K;

      if (s._html5_canplay) {
        // this event has already fired. ignore.
        return true;
      }

      s._html5_canplay = true;
      sm2._wD(s.id + ': canplay');
      s._onbufferchange(0);

      // position according to instance options
      position1K = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position/msecScale : null);

      // set the position if position was provided before the sound loaded
      if (this.currentTime !== position1K) {
        sm2._wD(s.id + ': canplay: Setting position to ' + position1K);
        try {
          this.currentTime = position1K;
        } catch(ee) {
          sm2._wD(s.id + ': canplay: Setting position of ' + position1K + ' failed: ' + ee.message, 2);
        }
      }

      // hack for HTML5 from/to case
      if (s._iO._oncanplay) {
        s._iO._oncanplay();
      }

    }),

    canplaythrough: html5_event(function() {

      var s = this._s;

      if (!s.loaded) {
        s._onbufferchange(0);
        s._whileloading(s.bytesLoaded, s.bytesTotal, s._get_html5_duration());
        s._onload(true);
      }

    }),

    durationchange: html5_event(function() {

      // durationchange may fire at various times, probably the safest way to capture accurate/final duration.

      var s = this._s,
          duration;

      duration = s._get_html5_duration();

      if (!isNaN(duration) && duration !== s.duration) {

        sm2._wD(this._s.id + ': durationchange (' + duration + ')' + (s.duration ? ', previously ' + s.duration : ''));

        s.durationEstimate = s.duration = duration;

      }

    }),

    // TODO: Reserved for potential use
    /*
    emptied: html5_event(function() {

      sm2._wD(this._s.id + ': emptied');

    }),
    */

    ended: html5_event(function() {

      var s = this._s;

      sm2._wD(s.id + ': ended');

      s._onfinish();

    }),

    error: html5_event(function() {

      sm2._wD(this._s.id + ': HTML5 error, code ' + this.error.code);
      /**
       * HTML5 error codes, per W3C
       * Error 1: Client aborted download at user's request.
       * Error 2: Network error after load started.
       * Error 3: Decoding issue.
       * Error 4: Media (audio file) not supported.
       * Reference: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#error-codes
       */
      // call load with error state?
      this._s._onload(false);

    }),

    loadeddata: html5_event(function() {

      var s = this._s;

      sm2._wD(s.id + ': loadeddata');

      // safari seems to nicely report progress events, eventually totalling 100%
      if (!s._loaded && !isSafari) {
        s.duration = s._get_html5_duration();
      }

    }),

    loadedmetadata: html5_event(function() {

      sm2._wD(this._s.id + ': loadedmetadata');

    }),

    loadstart: html5_event(function() {

      sm2._wD(this._s.id + ': loadstart');
      // assume buffering at first
      this._s._onbufferchange(1);

    }),

    play: html5_event(function() {

      // sm2._wD(this._s.id + ': play()');
      // once play starts, no buffering
      this._s._onbufferchange(0);

    }),

    playing: html5_event(function() {

      sm2._wD(this._s.id + ': playing ' + String.fromCharCode(9835));
      // once play starts, no buffering
      this._s._onbufferchange(0);

    }),

    progress: html5_event(function(e) {

      // note: can fire repeatedly after "loaded" event, due to use of HTTP range/partials

      var s = this._s,
          i, j, progStr, buffered = 0,
          isProgress = (e.type === 'progress'),
          ranges = e.target.buffered,
          // firefox 3.6 implements e.loaded/total (bytes)
          loaded = (e.loaded || 0),
          total = (e.total || 1);

      // reset the "buffered" (loaded byte ranges) array
      s.buffered = [];

      if (ranges && ranges.length) {

        // if loaded is 0, try TimeRanges implementation as % of load
        // https://developer.mozilla.org/en/DOM/TimeRanges

        // re-build "buffered" array
        // HTML5 returns seconds. SM2 API uses msec for setPosition() etc., whether Flash or HTML5.
        for (i = 0, j = ranges.length; i < j; i++) {
          s.buffered.push({
            'start': ranges.start(i) * msecScale,
            'end': ranges.end(i) * msecScale
          });
        }

        // use the last value locally
        buffered = (ranges.end(0) - ranges.start(0)) * msecScale;

        // linear case, buffer sum; does not account for seeking and HTTP partials / byte ranges
        loaded = Math.min(1, buffered / (e.target.duration * msecScale));

        // <d>
        if (isProgress && ranges.length > 1) {
          progStr = [];
          j = ranges.length;
          for (i = 0; i < j; i++) {
            progStr.push((e.target.buffered.start(i) * msecScale) + '-' + (e.target.buffered.end(i) * msecScale));
          }
          sm2._wD(this._s.id + ': progress, timeRanges: ' + progStr.join(', '));
        }

        if (isProgress && !isNaN(loaded)) {
          sm2._wD(this._s.id + ': progress, ' + Math.floor(loaded * 100) + '% loaded');
        }
        // </d>

      }

      if (!isNaN(loaded)) {

        // TODO: prevent calls with duplicate values.
        s._whileloading(loaded, total, s._get_html5_duration());
        if (loaded && total && loaded === total) {
          // in case "onload" doesn't fire (eg. gecko 1.9.2)
          html5_events.canplaythrough.call(this, e);
        }

      }

    }),

    ratechange: html5_event(function() {

      sm2._wD(this._s.id + ': ratechange');

    }),

    suspend: html5_event(function(e) {

      // download paused/stopped, may have finished (eg. onload)
      var s = this._s;

      sm2._wD(this._s.id + ': suspend');
      html5_events.progress.call(this, e);
      s._onsuspend();

    }),

    stalled: html5_event(function() {

      sm2._wD(this._s.id + ': stalled');

    }),

    timeupdate: html5_event(function() {

      this._s._onTimer();

    }),

    waiting: html5_event(function() {

      var s = this._s;

      // see also: seeking
      sm2._wD(this._s.id + ': waiting');

      // playback faster than download rate, etc.
      s._onbufferchange(1);

    })

  };

  html5OK = function(iO) {

    // playability test based on URL or MIME type

    var result;

    if (!iO || (!iO.type && !iO.url && !iO.serverURL)) {

      // nothing to check
      result = false;

    } else if (iO.serverURL || (iO.type && preferFlashCheck(iO.type))) {

      // RTMP, or preferring flash
      result = false;

    } else {

      // Use type, if specified. Pass data: URIs to HTML5. If HTML5-only mode, no other options, so just give 'er
      result = ((iO.type ? html5CanPlay({type:iO.type}) : html5CanPlay({url:iO.url}) || sm2.html5Only || iO.url.match(/data\:/i)));

    }

    return result;

  };

  html5Unload = function(oAudio) {

    /**
     * Internal method: Unload media, and cancel any current/pending network requests.
     * Firefox can load an empty URL, which allegedly destroys the decoder and stops the download.
     * https://developer.mozilla.org/En/Using_audio_and_video_in_Firefox#Stopping_the_download_of_media
     * However, Firefox has been seen loading a relative URL from '' and thus requesting the hosting page on unload.
     * Other UA behaviour is unclear, so everyone else gets an about:blank-style URL.
     */

    var url;

    if (oAudio) {

      // Firefox and Chrome accept short WAVe data: URIs. Chome dislikes audio/wav, but accepts audio/wav for data: MIME.
      // Desktop Safari complains / fails on data: URI, so it gets about:blank.
      url = (isSafari ? emptyURL : (sm2.html5.canPlayType('audio/wav') ? emptyWAV : emptyURL));

      oAudio.src = url;

      // reset some state, too
      if (oAudio._called_unload !== _undefined) {
        oAudio._called_load = false;
      }

    }

    if (useGlobalHTML5Audio) {

      // ensure URL state is trashed, also
      lastGlobalHTML5URL = null;

    }

    return url;

  };

  html5CanPlay = function(o) {

    /**
     * Try to find MIME, test and return truthiness
     * o = {
     *  url: '/path/to/an.mp3',
     *  type: 'audio/mp3'
     * }
     */

    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
      return false;
    }

    var url = (o.url || null),
        mime = (o.type || null),
        aF = sm2.audioFormats,
        result,
        offset,
        fileExt,
        item;

    // account for known cases like audio/mp3

    if (mime && sm2.html5[mime] !== _undefined) {
      return (sm2.html5[mime] && !preferFlashCheck(mime));
    }

    if (!html5Ext) {
      
      html5Ext = [];
      
      for (item in aF) {
      
        if (aF.hasOwnProperty(item)) {
      
          html5Ext.push(item);
      
          if (aF[item].related) {
            html5Ext = html5Ext.concat(aF[item].related);
          }
      
        }
      
      }
      
      html5Ext = new RegExp('\\.('+html5Ext.join('|')+')(\\?.*)?$','i');
    
    }

    // TODO: Strip URL queries, etc.
    fileExt = (url ? url.toLowerCase().match(html5Ext) : null);

    if (!fileExt || !fileExt.length) {
      
      if (!mime) {
      
        result = false;
      
      } else {
      
        // audio/mp3 -> mp3, result should be known
        offset = mime.indexOf(';');
      
        // strip "audio/X; codecs..."
        fileExt = (offset !== -1 ? mime.substr(0,offset) : mime).substr(6);
      
      }
    
    } else {
    
      // match the raw extension name - "mp3", for example
      fileExt = fileExt[1];
    
    }

    if (fileExt && sm2.html5[fileExt] !== _undefined) {
    
      // result known
      result = (sm2.html5[fileExt] && !preferFlashCheck(fileExt));
    
    } else {
    
      mime = 'audio/' + fileExt;
      result = sm2.html5.canPlayType({type:mime});
    
      sm2.html5[fileExt] = result;
    
      // sm2._wD('canPlayType, found result: ' + result);
      result = (result && sm2.html5[mime] && !preferFlashCheck(mime));
    }

    return result;

  };

  testHTML5 = function() {

    /**
     * Internal: Iterates over audioFormats, determining support eg. audio/mp3, audio/mpeg and so on
     * assigns results to html5[] and flash[].
     */

    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
    
      // without HTML5, we need Flash.
      sm2.html5.usingFlash = true;
      needsFlash = true;
    
      return false;
    
    }

    // double-whammy: Opera 9.64 throws WRONG_ARGUMENTS_ERR if no parameter passed to Audio(), and Webkit + iOS happily tries to load "null" as a URL. :/
    var a = (Audio !== _undefined ? (isOpera && opera.version() < 10 ? new Audio(null) : new Audio()) : null),
        item, lookup, support = {}, aF, i;

    function cp(m) {

      var canPlay, j,
          result = false,
          isOK = false;

      if (!a || typeof a.canPlayType !== 'function') {
        return result;
      }

      if (m instanceof Array) {
    
        // iterate through all mime types, return any successes
    
        for (i = 0, j = m.length; i < j; i++) {
    
          if (sm2.html5[m[i]] || a.canPlayType(m[i]).match(sm2.html5Test)) {
    
            isOK = true;
            sm2.html5[m[i]] = true;
    
            // note flash support, too
            sm2.flash[m[i]] = !!(m[i].match(flashMIME));
    
          }
    
        }
    
        result = isOK;
    
      } else {
    
        canPlay = (a && typeof a.canPlayType === 'function' ? a.canPlayType(m) : false);
        result = !!(canPlay && (canPlay.match(sm2.html5Test)));
    
      }

      return result;

    }

    // test all registered formats + codecs

    aF = sm2.audioFormats;

    for (item in aF) {

      if (aF.hasOwnProperty(item)) {

        lookup = 'audio/' + item;

        support[item] = cp(aF[item].type);

        // write back generic type too, eg. audio/mp3
        support[lookup] = support[item];

        // assign flash
        if (item.match(flashMIME)) {

          sm2.flash[item] = true;
          sm2.flash[lookup] = true;

        } else {

          sm2.flash[item] = false;
          sm2.flash[lookup] = false;

        }

        // assign result to related formats, too

        if (aF[item] && aF[item].related) {

          for (i = aF[item].related.length - 1; i >= 0; i--) {

            // eg. audio/m4a
            support['audio/' + aF[item].related[i]] = support[item];
            sm2.html5[aF[item].related[i]] = support[item];
            sm2.flash[aF[item].related[i]] = support[item];

          }

        }

      }

    }

    support.canPlayType = (a ? cp : null);
    sm2.html5 = mixin(sm2.html5, support);

    sm2.html5.usingFlash = featureCheck();
    needsFlash = sm2.html5.usingFlash;

    return true;

  };

  strings = {

    // <d>
    notReady: 'Unavailable - wait until onready() has fired.',
    notOK: 'Audio support is not available.',
    domError: sm + 'exception caught while appending SWF to DOM.',
    spcWmode: 'Removing wmode, preventing known SWF loading issue(s)',
    swf404: smc + 'Verify that %s is a valid path.',
    tryDebug: 'Try ' + sm + '.debugFlash = true for more security details (output goes to SWF.)',
    checkSWF: 'See SWF output for more debug info.',
    localFail: smc + 'Non-HTTP page (' + doc.location.protocol + ' URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/',
    waitFocus: smc + 'Special case: Waiting for SWF to load with window focus...',
    waitForever: smc + 'Waiting indefinitely for Flash (will recover if unblocked)...',
    waitSWF: smc + 'Waiting for 100% SWF load...',
    needFunction: smc + 'Function object expected for %s',
    badID: 'Sound ID "%s" should be a string, starting with a non-numeric character',
    currentObj: smc + '_debug(): Current sound objects',
    waitOnload: smc + 'Waiting for window.onload()',
    docLoaded: smc + 'Document already loaded',
    onload: smc + 'initComplete(): calling soundManager.onload()',
    onloadOK: sm + '.onload() complete',
    didInit: smc + 'init(): Already called?',
    secNote: 'Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html',
    badRemove: smc + 'Failed to remove Flash node.',
    shutdown: sm + '.disable(): Shutting down',
    queue: smc + 'Queueing %s handler',
    smError: 'SMSound.load(): Exception: JS-Flash communication failed, or JS error.',
    fbTimeout: 'No flash response, applying .' + swfCSS.swfTimedout + ' CSS...',
    fbLoaded: 'Flash loaded',
    fbHandler: smc + 'flashBlockHandler()',
    manURL: 'SMSound.load(): Using manually-assigned URL',
    onURL: sm + '.load(): current URL already assigned.',
    badFV: sm + '.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
    as2loop: 'Note: Setting stream:false so looping can work (flash 8 limitation)',
    noNSLoop: 'Note: Looping not implemented for MovieStar formats',
    needfl9: 'Note: Switching to flash 9, required for MP4 formats.',
    mfTimeout: 'Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case',
    needFlash: smc + 'Fatal error: Flash is needed to play some required formats, but is not available.',
    gotFocus: smc + 'Got window focus.',
    policy: 'Enabling usePolicyFile for data access',
    setup: sm + '.setup(): allowed parameters: %s',
    setupError: sm + '.setup(): "%s" cannot be assigned with this method.',
    setupUndef: sm + '.setup(): Could not find option "%s"',
    setupLate: sm + '.setup(): url, flashVersion and html5Test property changes will not take effect until reboot().',
    noURL: smc + 'Flash URL required. Call soundManager.setup({url:...}) to get started.',
    sm2Loaded: 'SoundManager 2: Ready. ' + String.fromCharCode(10003),
    reset: sm + '.reset(): Removing event callbacks',
    mobileUA: 'Mobile UA detected, preferring HTML5 by default.',
    globalHTML5: 'Using singleton HTML5 Audio() pattern for this device.',
    ignoreMobile: 'Ignoring mobile restrictions for this device.'
    // </d>

  };

  str = function() {

    // internal string replace helper.
    // arguments: o [,items to replace]
    // <d>

    var args,
        i, j, o,
        sstr;

    // real array, please
    args = slice.call(arguments);

    // first argument
    o = args.shift();

    sstr = (strings && strings[o] ? strings[o] : '');

    if (sstr && args && args.length) {
      for (i = 0, j = args.length; i < j; i++) {
        sstr = sstr.replace('%s', args[i]);
      }
    }

    return sstr;
    // </d>

  };

  loopFix = function(sOpt) {

    // flash 8 requires stream = false for looping to work
    if (fV === 8 && sOpt.loops > 1 && sOpt.stream) {
      _wDS('as2loop');
      sOpt.stream = false;
    }

    return sOpt;

  };

  policyFix = function(sOpt, sPre) {

    if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
      sm2._wD((sPre || '') + str('policy'));
      sOpt.usePolicyFile = true;
    }

    return sOpt;

  };

  complain = function(sMsg) {

    // <d>
    if (hasConsole && console.warn !== _undefined) {
      console.warn(sMsg);
    } else {
      sm2._wD(sMsg);
    }
    // </d>

  };

  doNothing = function() {

    return false;

  };

  disableObject = function(o) {

    var oProp;

    for (oProp in o) {
      if (o.hasOwnProperty(oProp) && typeof o[oProp] === 'function') {
        o[oProp] = doNothing;
      }
    }

    oProp = null;

  };

  failSafely = function(bNoDisable) {

    // general failure exception handler

    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }

    if (disabled || bNoDisable) {
      sm2.disable(bNoDisable);
    }

  };

  normalizeMovieURL = function(smURL) {

    var urlParams = null, url;

    if (smURL) {
      
      if (smURL.match(/\.swf(\?.*)?$/i)) {
      
        urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf('.swf?') + 4);
      
        if (urlParams) {
          // assume user knows what they're doing
          return smURL;
        }
      
      } else if (smURL.lastIndexOf('/') !== smURL.length - 1) {
      
        // append trailing slash, if needed
        smURL += '/';
      
      }
    
    }

    url = (smURL && smURL.lastIndexOf('/') !== - 1 ? smURL.substr(0, smURL.lastIndexOf('/') + 1) : './') + sm2.movieURL;

    if (sm2.noSWFCache) {
      url += ('?ts=' + new Date().getTime());
    }

    return url;

  };

  setVersionInfo = function() {

    // short-hand for internal use

    fV = parseInt(sm2.flashVersion, 10);

    if (fV !== 8 && fV !== 9) {
      sm2._wD(str('badFV', fV, defaultFlashVersion));
      sm2.flashVersion = fV = defaultFlashVersion;
    }

    // debug flash movie, if applicable

    var isDebug = (sm2.debugMode || sm2.debugFlash ? '_debug.swf' : '.swf');

    if (sm2.useHTML5Audio && !sm2.html5Only && sm2.audioFormats.mp4.required && fV < 9) {
      sm2._wD(str('needfl9'));
      sm2.flashVersion = fV = 9;
    }

    sm2.version = sm2.versionNumber + (sm2.html5Only ? ' (HTML5-only mode)' : (fV === 9 ? ' (AS3/Flash 9)' : ' (AS2/Flash 8)'));

    // set up default options
    if (fV > 8) {
    
      // +flash 9 base options
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.flash9Options);
      sm2.features.buffering = true;
    
      // +moviestar support
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.movieStarOptions);
      sm2.filePatterns.flash9 = new RegExp('\\.(mp3|' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
      sm2.features.movieStar = true;
    
    } else {
    
      sm2.features.movieStar = false;
    
    }

    // regExp for flash canPlay(), etc.
    sm2.filePattern = sm2.filePatterns[(fV !== 8 ? 'flash9' : 'flash8')];

    // if applicable, use _debug versions of SWFs
    sm2.movieURL = (fV === 8 ? 'soundmanager2.swf' : 'soundmanager2_flash9.swf').replace('.swf', isDebug);

    sm2.features.peakData = sm2.features.waveformData = sm2.features.eqData = (fV > 8);

  };

  setPolling = function(bPolling, bHighPerformance) {

    if (!flash) {
      return false;
    }

    flash._setPolling(bPolling, bHighPerformance);

  };

  initDebug = function() {

    // starts debug mode, creating output <div> for UAs without console object

    // allow force of debug mode via URL
    // <d>
    if (sm2.debugURLParam.test(wl)) {
      sm2.setupOptions.debugMode = sm2.debugMode = true;
    }

    if (id(sm2.debugID)) {
      return false;
    }

    var oD, oDebug, oTarget, oToggle, tmp;

    if (sm2.debugMode && !id(sm2.debugID) && (!hasConsole || !sm2.useConsole || !sm2.consoleOnly)) {

      oD = doc.createElement('div');
      oD.id = sm2.debugID + '-toggle';

      oToggle = {
        'position': 'fixed',
        'bottom': '0px',
        'right': '0px',
        'width': '1.2em',
        'height': '1.2em',
        'lineHeight': '1.2em',
        'margin': '2px',
        'textAlign': 'center',
        'border': '1px solid #999',
        'cursor': 'pointer',
        'background': '#fff',
        'color': '#333',
        'zIndex': 10001
      };

      oD.appendChild(doc.createTextNode('-'));
      oD.onclick = toggleDebug;
      oD.title = 'Toggle SM2 debug console';

      if (ua.match(/msie 6/i)) {
        oD.style.position = 'absolute';
        oD.style.cursor = 'hand';
      }

      for (tmp in oToggle) {
        if (oToggle.hasOwnProperty(tmp)) {
          oD.style[tmp] = oToggle[tmp];
        }
      }

      oDebug = doc.createElement('div');
      oDebug.id = sm2.debugID;
      oDebug.style.display = (sm2.debugMode ? 'block' : 'none');

      if (sm2.debugMode && !id(oD.id)) {
        try {
          oTarget = getDocument();
          oTarget.appendChild(oD);
        } catch(e2) {
          throw new Error(str('domError') + ' \n' + e2.toString());
        }
        oTarget.appendChild(oDebug);
      }

    }

    oTarget = null;
    // </d>

  };

  idCheck = this.getSoundById;

  // <d>
  _wDS = function(o, errorLevel) {

    return (!o ? '' : sm2._wD(str(o), errorLevel));

  };

  toggleDebug = function() {

    var o = id(sm2.debugID),
    oT = id(sm2.debugID + '-toggle');

    if (!o) {
      return false;
    }

    if (debugOpen) {
      // minimize
      oT.innerHTML = '+';
      o.style.display = 'none';
    } else {
      oT.innerHTML = '-';
      o.style.display = 'block';
    }

    debugOpen = !debugOpen;

  };

  debugTS = function(sEventType, bSuccess, sMessage) {

    // troubleshooter debug hooks

    if (window.sm2Debugger !== _undefined) {
      try {
        sm2Debugger.handleEvent(sEventType, bSuccess, sMessage);
      } catch(e) {
        // oh well
        return false;
      }
    }

    return true;

  };
  // </d>

  getSWFCSS = function() {

    var css = [];

    if (sm2.debugMode) {
      css.push(swfCSS.sm2Debug);
    }

    if (sm2.debugFlash) {
      css.push(swfCSS.flashDebug);
    }

    if (sm2.useHighPerformance) {
      css.push(swfCSS.highPerf);
    }

    return css.join(' ');

  };

  flashBlockHandler = function() {

    // *possible* flash block situation.

    var name = str('fbHandler'),
        p = sm2.getMoviePercent(),
        css = swfCSS,
        error = {
          type:'FLASHBLOCK'
        };

    if (sm2.html5Only) {
      // no flash, or unused
      return false;
    }

    if (!sm2.ok()) {

      if (needsFlash) {
        // make the movie more visible, so user can fix
        sm2.oMC.className = getSWFCSS() + ' ' + css.swfDefault + ' ' + (p === null ? css.swfTimedout : css.swfError);
        sm2._wD(name + ': ' + str('fbTimeout') + (p ? ' (' + str('fbLoaded') + ')' : ''));
      }

      sm2.didFlashBlock = true;

      // fire onready(), complain lightly
      processOnEvents({
        type: 'ontimeout',
        ignoreInit: true,
        error: error
      });

      catchError(error);

    } else {

      // SM2 loaded OK (or recovered)

      // <d>
      if (sm2.didFlashBlock) {
        sm2._wD(name + ': Unblocked');
      }
      // </d>

      if (sm2.oMC) {
        sm2.oMC.className = [getSWFCSS(), css.swfDefault, css.swfLoaded + (sm2.didFlashBlock ? ' ' + css.swfUnblocked : '')].join(' ');
      }

    }

  };

  addOnEvent = function(sType, oMethod, oScope) {

    if (on_queue[sType] === _undefined) {
      on_queue[sType] = [];
    }

    on_queue[sType].push({
      'method': oMethod,
      'scope': (oScope || null),
      'fired': false
    });

  };

  processOnEvents = function(oOptions) {

    // if unspecified, assume OK/error

    if (!oOptions) {
      oOptions = {
        type: (sm2.ok() ? 'onready' : 'ontimeout')
      };
    }

    if (!didInit && oOptions && !oOptions.ignoreInit) {
      // not ready yet.
      return false;
    }

    if (oOptions.type === 'ontimeout' && (sm2.ok() || (disabled && !oOptions.ignoreInit))) {
      // invalid case
      return false;
    }

    var status = {
          success: (oOptions && oOptions.ignoreInit ? sm2.ok() : !disabled)
        },

        // queue specified by type, or none
        srcQueue = (oOptions && oOptions.type ? on_queue[oOptions.type] || [] : []),

        queue = [], i, j,
        args = [status],
        canRetry = (needsFlash && !sm2.ok());

    if (oOptions.error) {
      args[0].error = oOptions.error;
    }

    for (i = 0, j = srcQueue.length; i < j; i++) {
      if (srcQueue[i].fired !== true) {
        queue.push(srcQueue[i]);
      }
    }

    if (queue.length) {
    
      // sm2._wD(sm + ': Firing ' + queue.length + ' ' + oOptions.type + '() item' + (queue.length === 1 ? '' : 's')); 
      for (i = 0, j = queue.length; i < j; i++) {
      
        if (queue[i].scope) {
          queue[i].method.apply(queue[i].scope, args);
        } else {
          queue[i].method.apply(this, args);
        }
      
        if (!canRetry) {
          // useFlashBlock and SWF timeout case doesn't count here.
          queue[i].fired = true;
      
        }
      
      }
    
    }

    return true;

  };

  initUserOnload = function() {

    window.setTimeout(function() {

      if (sm2.useFlashBlock) {
        flashBlockHandler();
      }

      processOnEvents();

      // call user-defined "onload", scoped to window

      if (typeof sm2.onload === 'function') {
        _wDS('onload', 1);
        sm2.onload.apply(window);
        _wDS('onloadOK', 1);
      }

      if (sm2.waitForWindowLoad) {
        event.add(window, 'load', initUserOnload);
      }

    }, 1);

  };

  detectFlash = function() {

    /**
     * Hat tip: Flash Detect library (BSD, (C) 2007) by Carl "DocYes" S. Yestrau
     * http://featureblend.com/javascript-flash-detection-library.html / http://featureblend.com/license.txt
     */

    if (hasFlash !== _undefined) {
      // this work has already been done.
      return hasFlash;
    }

    var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = window.ActiveXObject;

    if (nP && nP.length) {
      
      type = 'application/x-shockwave-flash';
      types = n.mimeTypes;
      
      if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
        hasPlugin = true;
      }
    
    } else if (AX !== _undefined && !ua.match(/MSAppHost/i)) {
    
      // Windows 8 Store Apps (MSAppHost) are weird (compatibility?) and won't complain here, but will barf if Flash/ActiveX object is appended to the DOM.
      try {
        obj = new AX('ShockwaveFlash.ShockwaveFlash');
      } catch(e) {
        // oh well
        obj = null;
      }
      
      hasPlugin = (!!obj);
      
      // cleanup, because it is ActiveX after all
      obj = null;
    
    }

    hasFlash = hasPlugin;

    return hasPlugin;

  };

featureCheck = function() {

    var flashNeeded,
        item,
        formats = sm2.audioFormats,
        // iPhone <= 3.1 has broken HTML5 audio(), but firmware 3.2 (original iPad) + iOS4 works.
        isSpecial = (is_iDevice && !!(ua.match(/os (1|2|3_0|3_1)\s/i)));

    if (isSpecial) {

      // has Audio(), but is broken; let it load links directly.
      sm2.hasHTML5 = false;

      // ignore flash case, however
      sm2.html5Only = true;

      // hide the SWF, if present
      if (sm2.oMC) {
        sm2.oMC.style.display = 'none';
      }

    } else {

      if (sm2.useHTML5Audio) {

        if (!sm2.html5 || !sm2.html5.canPlayType) {
          sm2._wD('SoundManager: No HTML5 Audio() support detected.');
          sm2.hasHTML5 = false;
        }

        // <d>
        if (isBadSafari) {
          sm2._wD(smc + 'Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - ' + (!hasFlash ? ' would use flash fallback for MP3/MP4, but none detected.' : 'will use flash fallback for MP3/MP4, if available'), 1);
        }
        // </d>

      }

    }

    if (sm2.useHTML5Audio && sm2.hasHTML5) {

      // sort out whether flash is optional, required or can be ignored.

      // innocent until proven guilty.
      canIgnoreFlash = true;

      for (item in formats) {
        
        if (formats.hasOwnProperty(item)) {
        
          if (formats[item].required) {
        
            if (!sm2.html5.canPlayType(formats[item].type)) {
        
              // 100% HTML5 mode is not possible.
              canIgnoreFlash = false;
              flashNeeded = true;
        
            } else if (sm2.preferFlash && (sm2.flash[item] || sm2.flash[formats[item].type])) {
        
              // flash may be required, or preferred for this format.
              flashNeeded = true;
        
            }
        
          }

        }

      }

    }

    // sanity check...
    if (sm2.ignoreFlash) {
      flashNeeded = false;
      canIgnoreFlash = true;
    }

    sm2.html5Only = (sm2.hasHTML5 && sm2.useHTML5Audio && !flashNeeded);

    return (!sm2.html5Only);

  };

  parseURL = function(url) {

    /**
     * Internal: Finds and returns the first playable URL (or failing that, the first URL.)
     * @param {string or array} url A single URL string, OR, an array of URL strings or {url:'/path/to/resource', type:'audio/mp3'} objects.
     */

    var i, j, urlResult = 0, result;

    if (url instanceof Array) {

      // find the first good one
      for (i = 0, j = url.length; i < j; i++) {

        if (url[i] instanceof Object) {

          // MIME check
          if (sm2.canPlayMIME(url[i].type)) {
            urlResult = i;
            break;
          }

        } else if (sm2.canPlayURL(url[i])) {

          // URL string check
          urlResult = i;
          break;

        }

      }

      // normalize to string
      if (url[urlResult].url) {
        url[urlResult] = url[urlResult].url;
      }

      result = url[urlResult];

    } else {

      // single URL case
      result = url;

    }

    return result;

  };


  startTimer = function(oSound) {

    /**
     * attach a timer to this sound, and start an interval if needed
     */

    if (!oSound._hasTimer) {

      oSound._hasTimer = true;

      if (!mobileHTML5 && sm2.html5PollingInterval) {

        if (h5IntervalTimer === null && h5TimerCount === 0) {

          h5IntervalTimer = setInterval(timerExecute, sm2.html5PollingInterval);

        }

        h5TimerCount++;

      }

    }

  };

  stopTimer = function(oSound) {

    /**
     * detach a timer
     */

    if (oSound._hasTimer) {

      oSound._hasTimer = false;

      if (!mobileHTML5 && sm2.html5PollingInterval) {

        // interval will stop itself at next execution.

        h5TimerCount--;

      }

    }

  };

  timerExecute = function() {

    /**
     * manual polling for HTML5 progress events, ie., whileplaying()
     * (can achieve greater precision than conservative default HTML5 interval)
     */

    var i;

    if (h5IntervalTimer !== null && !h5TimerCount) {

      // no active timers, stop polling interval.

      clearInterval(h5IntervalTimer);

      h5IntervalTimer = null;

      return false;

    }

    // check all HTML5 sounds with timers

    for (i = sm2.soundIDs.length - 1; i >= 0; i--) {

      if (sm2.sounds[sm2.soundIDs[i]].isHTML5 && sm2.sounds[sm2.soundIDs[i]]._hasTimer) {
        sm2.sounds[sm2.soundIDs[i]]._onTimer();
      }

    }

  };

  catchError = function(options) {

    options = (options !== _undefined ? options : {});

    if (typeof sm2.onerror === 'function') {
      sm2.onerror.apply(window, [{
        type: (options.type !== _undefined ? options.type : null)
      }]);
    }

    if (options.fatal !== _undefined && options.fatal) {
      sm2.disable();
    }

  };

  badSafariFix = function() {

    // special case: "bad" Safari (OS X 10.3 - 10.7) must fall back to flash for MP3/MP4
    if (!isBadSafari || !detectFlash()) {
      // doesn't apply
      return false;
    }

    var aF = sm2.audioFormats, i, item;

    for (item in aF) {

      if (aF.hasOwnProperty(item)) {

        if (item === 'mp3' || item === 'mp4') {

          sm2._wD(sm + ': Using flash fallback for ' + item + ' format');
          sm2.html5[item] = false;

          // assign result to related formats, too
          if (aF[item] && aF[item].related) {
            for (i = aF[item].related.length - 1; i >= 0; i--) {
              sm2.html5[aF[item].related[i]] = false;
            }
          }

        }

      }

    }

  };

  /**
   * Pseudo-private flash/ExternalInterface methods
   * ----------------------------------------------
   */

  this._setSandboxType = function(sandboxType) {

    // <d>
    // Security sandbox according to Flash plugin
    var sb = sm2.sandbox;

    sb.type = sandboxType;
    sb.description = sb.types[(sb.types[sandboxType] !== _undefined?sandboxType : 'unknown')];

    if (sb.type === 'localWithFile') {

      sb.noRemote = true;
      sb.noLocal = false;
      _wDS('secNote', 2);

    } else if (sb.type === 'localWithNetwork') {

      sb.noRemote = false;
      sb.noLocal = true;

    } else if (sb.type === 'localTrusted') {

      sb.noRemote = false;
      sb.noLocal = false;

    }
    // </d>

  };

  this._externalInterfaceOK = function(swfVersion) {

    // flash callback confirming flash loaded, EI working etc.
    // swfVersion: SWF build string

    if (sm2.swfLoaded) {
      return false;
    }

    var e;

    debugTS('swf', true);
    debugTS('flashtojs', true);
    sm2.swfLoaded = true;
    tryInitOnFocus = false;

    if (isBadSafari) {
      badSafariFix();
    }

    // complain if JS + SWF build/version strings don't match, excluding +DEV builds
    // <d>
    if (!swfVersion || swfVersion.replace(/\+dev/i,'') !== sm2.versionNumber.replace(/\+dev/i, '')) {

      e = sm + ': Fatal: JavaScript file build "' + sm2.versionNumber + '" does not match Flash SWF build "' + swfVersion + '" at ' + sm2.url + '. Ensure both are up-to-date.';

      // escape flash -> JS stack so this error fires in window.
      setTimeout(function versionMismatch() {
        throw new Error(e);
      }, 0);

      // exit, init will fail with timeout
      return false;

    }
    // </d>

    // IE needs a larger timeout
    setTimeout(init, isIE ? 100 : 1);

  };

  /**
   * Private initialization helpers
   * ------------------------------
   */

  createMovie = function(smID, smURL) {

    if (didAppend && appendSuccess) {
      // ignore if already succeeded
      return false;
    }

    function initMsg() {

      // <d>

      var options = [],
          title,
          msg = [],
          delimiter = ' + ';

      title = 'SoundManager ' + sm2.version + (!sm2.html5Only && sm2.useHTML5Audio ? (sm2.hasHTML5 ? ' + HTML5 audio' : ', no HTML5 audio support') : '');

      if (!sm2.html5Only) {

        if (sm2.preferFlash) {
          options.push('preferFlash');
        }

        if (sm2.useHighPerformance) {
          options.push('useHighPerformance');
        }

        if (sm2.flashPollingInterval) {
          options.push('flashPollingInterval (' + sm2.flashPollingInterval + 'ms)');
        }

        if (sm2.html5PollingInterval) {
          options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
        }

        if (sm2.wmode) {
          options.push('wmode (' + sm2.wmode + ')');
        }

        if (sm2.debugFlash) {
          options.push('debugFlash');
        }

        if (sm2.useFlashBlock) {
          options.push('flashBlock');
        }

      } else {

        if (sm2.html5PollingInterval) {
          options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
        }

      }

      if (options.length) {
        msg = msg.concat([options.join(delimiter)]);
      }

      sm2._wD(title + (msg.length ? delimiter + msg.join(', ') : ''), 1);

      showSupport();

      // </d>

    }

    if (sm2.html5Only) {

      // 100% HTML5 mode
      setVersionInfo();

      initMsg();
      sm2.oMC = id(sm2.movieID);
      init();

      // prevent multiple init attempts
      didAppend = true;

      appendSuccess = true;

      return false;

    }

    // flash path
    var remoteURL = (smURL || sm2.url),
    localURL = (sm2.altURL || remoteURL),
    swfTitle = 'JS/Flash audio component (SoundManager 2)',
    oTarget = getDocument(),
    extraClass = getSWFCSS(),
    isRTL = null,
    html = doc.getElementsByTagName('html')[0],
    oEmbed, oMovie, tmp, movieHTML, oEl, s, x, sClass;

    isRTL = (html && html.dir && html.dir.match(/rtl/i));
    smID = (smID === _undefined ? sm2.id : smID);

    function param(name, value) {
      return '<param name="' + name + '" value="' + value + '" />';
    }

    // safety check for legacy (change to Flash 9 URL)
    setVersionInfo();
    sm2.url = normalizeMovieURL(overHTTP ? remoteURL : localURL);
    smURL = sm2.url;

    sm2.wmode = (!sm2.wmode && sm2.useHighPerformance ? 'transparent' : sm2.wmode);

    if (sm2.wmode !== null && (ua.match(/msie 8/i) || (!isIE && !sm2.useHighPerformance)) && navigator.platform.match(/win32|win64/i)) {
      /**
       * extra-special case: movie doesn't load until scrolled into view when using wmode = anything but 'window' here
       * does not apply when using high performance (position:fixed means on-screen), OR infinite flash load timeout
       * wmode breaks IE 8 on Vista + Win7 too in some cases, as of January 2011 (?)
       */
      messages.push(strings.spcWmode);
      sm2.wmode = null;
    }

    oEmbed = {
      'name': smID,
      'id': smID,
      'src': smURL,
      'quality': 'high',
      'allowScriptAccess': sm2.allowScriptAccess,
      'bgcolor': sm2.bgColor,
      'pluginspage': http + 'www.macromedia.com/go/getflashplayer',
      'title': swfTitle,
      'type': 'application/x-shockwave-flash',
      'wmode': sm2.wmode,
      // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
      'hasPriority': 'true'
    };

    if (sm2.debugFlash) {
      oEmbed.FlashVars = 'debug=1';
    }

    if (!sm2.wmode) {
      // don't write empty attribute
      delete oEmbed.wmode;
    }

    if (isIE) {

      // IE is "special".
      oMovie = doc.createElement('div');
      movieHTML = [
        '<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" title="' + oEmbed.title +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">',
        param('movie', smURL),
        param('AllowScriptAccess', sm2.allowScriptAccess),
        param('quality', oEmbed.quality),
        (sm2.wmode? param('wmode', sm2.wmode): ''),
        param('bgcolor', sm2.bgColor),
        param('hasPriority', 'true'),
        (sm2.debugFlash ? param('FlashVars', oEmbed.FlashVars) : ''),
        '</object>'
      ].join('');

    } else {

      oMovie = doc.createElement('embed');
      for (tmp in oEmbed) {
        if (oEmbed.hasOwnProperty(tmp)) {
          oMovie.setAttribute(tmp, oEmbed[tmp]);
        }
      }

    }

    initDebug();
    extraClass = getSWFCSS();
    oTarget = getDocument();

    if (oTarget) {

      sm2.oMC = (id(sm2.movieID) || doc.createElement('div'));

      if (!sm2.oMC.id) {

        sm2.oMC.id = sm2.movieID;
        sm2.oMC.className = swfCSS.swfDefault + ' ' + extraClass;
        s = null;
        oEl = null;

        if (!sm2.useFlashBlock) {
          if (sm2.useHighPerformance) {
            // on-screen at all times
            s = {
              'position': 'fixed',
              'width': '8px',
              'height': '8px',
              // >= 6px for flash to run fast, >= 8px to start up under Firefox/win32 in some cases. odd? yes.
              'bottom': '0px',
              'left': '0px',
              'overflow': 'hidden'
            };
          } else {
            // hide off-screen, lower priority
            s = {
              'position': 'absolute',
              'width': '6px',
              'height': '6px',
              'top': '-9999px',
              'left': '-9999px'
            };
            if (isRTL) {
              s.left = Math.abs(parseInt(s.left, 10)) + 'px';
            }
          }
        }

        if (isWebkit) {
          // soundcloud-reported render/crash fix, safari 5
          sm2.oMC.style.zIndex = 10000;
        }

        if (!sm2.debugFlash) {
          for (x in s) {
            if (s.hasOwnProperty(x)) {
              sm2.oMC.style[x] = s[x];
            }
          }
        }

        try {

          if (!isIE) {
            sm2.oMC.appendChild(oMovie);
          }

          oTarget.appendChild(sm2.oMC);

          if (isIE) {
            oEl = sm2.oMC.appendChild(doc.createElement('div'));
            oEl.className = swfCSS.swfBox;
            oEl.innerHTML = movieHTML;
          }

          appendSuccess = true;

        } catch(e) {

          throw new Error(str('domError') + ' \n' + e.toString());

        }

      } else {

        // SM2 container is already in the document (eg. flashblock use case)
        sClass = sm2.oMC.className;
        sm2.oMC.className = (sClass ? sClass + ' ' : swfCSS.swfDefault) + (extraClass ? ' ' + extraClass : '');
        sm2.oMC.appendChild(oMovie);

        if (isIE) {
          oEl = sm2.oMC.appendChild(doc.createElement('div'));
          oEl.className = swfCSS.swfBox;
          oEl.innerHTML = movieHTML;
        }

        appendSuccess = true;

      }

    }

    didAppend = true;

    initMsg();

    // sm2._wD(sm + ': Trying to load ' + smURL + (!overHTTP && sm2.altURL ? ' (alternate URL)' : ''), 1);

    return true;

  };

  initMovie = function() {

    if (sm2.html5Only) {
      createMovie();
      return false;
    }

    // attempt to get, or create, movie (may already exist)
    if (flash) {
      return false;
    }

    if (!sm2.url) {

      /**
       * Something isn't right - we've reached init, but the soundManager url property has not been set.
       * User has not called setup({url: ...}), or has not set soundManager.url (legacy use case) directly before init time.
       * Notify and exit. If user calls setup() with a url: property, init will be restarted as in the deferred loading case.
       */

       _wDS('noURL');
       return false;

    }

    // inline markup case
    flash = sm2.getMovie(sm2.id);

    if (!flash) {

      if (!oRemoved) {

        // try to create
        createMovie(sm2.id, sm2.url);

      } else {

        // try to re-append removed movie after reboot()
        if (!isIE) {
          sm2.oMC.appendChild(oRemoved);
        } else {
          sm2.oMC.innerHTML = oRemovedHTML;
        }

        oRemoved = null;
        didAppend = true;

      }

      flash = sm2.getMovie(sm2.id);

    }

    if (typeof sm2.oninitmovie === 'function') {
      setTimeout(sm2.oninitmovie, 1);
    }

    // <d>
    flushMessages();
    // </d>

    return true;

  };

  delayWaitForEI = function() {

    setTimeout(waitForEI, 1000);

  };

  rebootIntoHTML5 = function() {

    // special case: try for a reboot with preferFlash: false, if 100% HTML5 mode is possible and useFlashBlock is not enabled.

    window.setTimeout(function() {

      complain(smc + 'useFlashBlock is false, 100% HTML5 mode is possible. Rebooting with preferFlash: false...');

      sm2.setup({
        preferFlash: false
      }).reboot();

      // if for some reason you want to detect this case, use an ontimeout() callback and look for html5Only and didFlashBlock == true.
      sm2.didFlashBlock = true;

      sm2.beginDelayedInit();

    }, 1);

  };

  waitForEI = function() {

    var p,
        loadIncomplete = false;

    if (!sm2.url) {
      // No SWF url to load (noURL case) - exit for now. Will be retried when url is set.
      return false;
    }

    if (waitingForEI) {
      return false;
    }

    waitingForEI = true;
    event.remove(window, 'load', delayWaitForEI);

    if (hasFlash && tryInitOnFocus && !isFocused) {
      // Safari won't load flash in background tabs, only when focused.
      _wDS('waitFocus');
      return false;
    }

    if (!didInit) {
      p = sm2.getMoviePercent();
      if (p > 0 && p < 100) {
        loadIncomplete = true;
      }
    }

    setTimeout(function() {

      p = sm2.getMoviePercent();

      if (loadIncomplete) {
        // special case: if movie *partially* loaded, retry until it's 100% before assuming failure.
        waitingForEI = false;
        sm2._wD(str('waitSWF'));
        window.setTimeout(delayWaitForEI, 1);
        return false;
      }

      // <d>
      if (!didInit) {

        sm2._wD(sm + ': No Flash response within expected time. Likely causes: ' + (p === 0 ? 'SWF load failed, ' : '') + 'Flash blocked or JS-Flash security error.' + (sm2.debugFlash ? ' ' + str('checkSWF') : ''), 2);

        if (!overHTTP && p) {

          _wDS('localFail', 2);

          if (!sm2.debugFlash) {
            _wDS('tryDebug', 2);
          }

        }

        if (p === 0) {

          // if 0 (not null), probably a 404.
          sm2._wD(str('swf404', sm2.url), 1);

        }

        debugTS('flashtojs', false, ': Timed out' + (overHTTP ? ' (Check flash security or flash blockers)':' (No plugin/missing SWF?)'));

      }
      // </d>

      // give up / time-out, depending

      if (!didInit && okToDisable) {

        if (p === null) {

          // SWF failed to report load progress. Possibly blocked.

          if (sm2.useFlashBlock || sm2.flashLoadTimeout === 0) {

            if (sm2.useFlashBlock) {

              flashBlockHandler();

            }

            _wDS('waitForever');

          } else {

            // no custom flash block handling, but SWF has timed out. Will recover if user unblocks / allows SWF load.

            if (!sm2.useFlashBlock && canIgnoreFlash) {

              rebootIntoHTML5();

            } else {

              _wDS('waitForever');

              // fire any regular registered ontimeout() listeners.
              processOnEvents({
                type: 'ontimeout',
                ignoreInit: true,
                error: {
                  type: 'INIT_FLASHBLOCK'
                }
              });

            }

          }

        } else {

          // SWF loaded? Shouldn't be a blocking issue, then.

          if (sm2.flashLoadTimeout === 0) {

            _wDS('waitForever');

          } else {

            if (!sm2.useFlashBlock && canIgnoreFlash) {

              rebootIntoHTML5();

            } else {

              failSafely(true);

            }

          }

        }

      }

    }, sm2.flashLoadTimeout);

  };

  handleFocus = function() {

    function cleanup() {
      event.remove(window, 'focus', handleFocus);
    }

    if (isFocused || !tryInitOnFocus) {
      // already focused, or not special Safari background tab case
      cleanup();
      return true;
    }

    okToDisable = true;
    isFocused = true;
    _wDS('gotFocus');

    // allow init to restart
    waitingForEI = false;

    // kick off ExternalInterface timeout, now that the SWF has started
    delayWaitForEI();

    cleanup();
    return true;

  };

  flushMessages = function() {

    // <d>

    // SM2 pre-init debug messages
    if (messages.length) {
      sm2._wD('SoundManager 2: ' + messages.join(' '), 1);
      messages = [];
    }

    // </d>

  };

  showSupport = function() {

    // <d>

    flushMessages();

    var item, tests = [];

    if (sm2.useHTML5Audio && sm2.hasHTML5) {
      for (item in sm2.audioFormats) {
        if (sm2.audioFormats.hasOwnProperty(item)) {
          tests.push(item + ' = ' + sm2.html5[item] + (!sm2.html5[item] && needsFlash && sm2.flash[item] ? ' (using flash)' : (sm2.preferFlash && sm2.flash[item] && needsFlash ? ' (preferring flash)' : (!sm2.html5[item] ? ' (' + (sm2.audioFormats[item].required ? 'required, ' : '') + 'and no flash support)' : ''))));
        }
      }
      sm2._wD('SoundManager 2 HTML5 support: ' + tests.join(', '), 1);
    }

    // </d>

  };

  initComplete = function(bNoDisable) {

    if (didInit) {
      return false;
    }

    if (sm2.html5Only) {
      // all good.
      _wDS('sm2Loaded', 1);
      didInit = true;
      initUserOnload();
      debugTS('onload', true);
      return true;
    }

    var wasTimeout = (sm2.useFlashBlock && sm2.flashLoadTimeout && !sm2.getMoviePercent()),
        result = true,
        error;

    if (!wasTimeout) {
      didInit = true;
    }

    error = {
      type: (!hasFlash && needsFlash ? 'NO_FLASH' : 'INIT_TIMEOUT')
    };

    sm2._wD('SoundManager 2 ' + (disabled ? 'failed to load' : 'loaded') + ' (' + (disabled ? 'Flash security/load error' : 'OK') + ') ' + String.fromCharCode(disabled ? 10006 : 10003), disabled ? 2: 1);

    if (disabled || bNoDisable) {

      if (sm2.useFlashBlock && sm2.oMC) {
        sm2.oMC.className = getSWFCSS() + ' ' + (sm2.getMoviePercent() === null ? swfCSS.swfTimedout : swfCSS.swfError);
      }

      processOnEvents({
        type: 'ontimeout',
        error: error,
        ignoreInit: true
      });

      debugTS('onload', false);
      catchError(error);

      result = false;

    } else {

      debugTS('onload', true);

    }

    if (!disabled) {

      if (sm2.waitForWindowLoad && !windowLoaded) {

        _wDS('waitOnload');
        event.add(window, 'load', initUserOnload);

      } else {

        // <d>
        if (sm2.waitForWindowLoad && windowLoaded) {
          _wDS('docLoaded');
        }
        // </d>

        initUserOnload();

      }

    }

    return result;

  };

  /**
   * apply top-level setupOptions object as local properties, eg., this.setupOptions.flashVersion -> this.flashVersion (soundManager.flashVersion)
   * this maintains backward compatibility, and allows properties to be defined separately for use by soundManager.setup().
   */

  setProperties = function() {

    var i,
        o = sm2.setupOptions;

    for (i in o) {

      if (o.hasOwnProperty(i)) {

        // assign local property if not already defined

        if (sm2[i] === _undefined) {

          sm2[i] = o[i];

        } else if (sm2[i] !== o[i]) {

          // legacy support: write manually-assigned property (eg., soundManager.url) back to setupOptions to keep things in sync
          sm2.setupOptions[i] = sm2[i];

        }

      }

    }

  };


  init = function() {

    // called after onload()

    if (didInit) {
      _wDS('didInit');
      return false;
    }

    function cleanup() {
      event.remove(window, 'load', sm2.beginDelayedInit);
    }

    if (sm2.html5Only) {

      if (!didInit) {
        // we don't need no steenking flash!
        cleanup();
        sm2.enabled = true;
        initComplete();
      }

      return true;

    }

    // flash path
    initMovie();

    try {

      // attempt to talk to Flash
      flash._externalInterfaceTest(false);

      /**
       * Apply user-specified polling interval, OR, if "high performance" set, faster vs. default polling
       * (determines frequency of whileloading/whileplaying callbacks, effectively driving UI framerates)
       */
      setPolling(true, (sm2.flashPollingInterval || (sm2.useHighPerformance ? 10 : 50)));

      if (!sm2.debugMode) {
        // stop the SWF from making debug output calls to JS
        flash._disableDebug();
      }

      sm2.enabled = true;
      debugTS('jstoflash', true);

      if (!sm2.html5Only) {
        // prevent browser from showing cached page state (or rather, restoring "suspended" page state) via back button, because flash may be dead
        // http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
        event.add(window, 'unload', doNothing);
      }

    } catch(e) {

      sm2._wD('js/flash exception: ' + e.toString());

      debugTS('jstoflash', false);

      catchError({
        type: 'JS_TO_FLASH_EXCEPTION',
        fatal: true
      });

      // don't disable, for reboot()
      failSafely(true);

      initComplete();

      return false;

    }

    initComplete();

    // disconnect events
    cleanup();

    return true;

  };

  domContentLoaded = function() {

    if (didDCLoaded) {
      return false;
    }

    didDCLoaded = true;

    // assign top-level soundManager properties eg. soundManager.url
    setProperties();

    initDebug();

    if (!hasFlash && sm2.hasHTML5) {

      sm2._wD('SoundManager 2: No Flash detected' + (!sm2.useHTML5Audio ? ', enabling HTML5.' : '. Trying HTML5-only mode.'), 1);

      sm2.setup({
        'useHTML5Audio': true,
        // make sure we aren't preferring flash, either
        // TODO: preferFlash should not matter if flash is not installed. Currently, stuff breaks without the below tweak.
        'preferFlash': false
      });

    }

    testHTML5();

    if (!hasFlash && needsFlash) {

      messages.push(strings.needFlash);

      // TODO: Fatal here vs. timeout approach, etc.
      // hack: fail sooner.
      sm2.setup({
        'flashLoadTimeout': 1
      });

    }

    if (doc.removeEventListener) {
      doc.removeEventListener('DOMContentLoaded', domContentLoaded, false);
    }

    initMovie();

    return true;

  };

  domContentLoadedIE = function() {

    if (doc.readyState === 'complete') {
      domContentLoaded();
      doc.detachEvent('onreadystatechange', domContentLoadedIE);
    }

    return true;

  };

  winOnLoad = function() {

    // catch edge case of initComplete() firing after window.load()
    windowLoaded = true;

    // catch case where DOMContentLoaded has been sent, but we're still in doc.readyState = 'interactive'
    domContentLoaded();

    event.remove(window, 'load', winOnLoad);

  };

  // sniff up-front
  detectFlash();

  // focus and window load, init (primarily flash-driven)
  event.add(window, 'focus', handleFocus);
  event.add(window, 'load', delayWaitForEI);
  event.add(window, 'load', winOnLoad);

  if (doc.addEventListener) {

    doc.addEventListener('DOMContentLoaded', domContentLoaded, false);

  } else if (doc.attachEvent) {

    doc.attachEvent('onreadystatechange', domContentLoadedIE);

  } else {

    // no add/attachevent support - safe to assume no JS -> Flash either
    debugTS('onload', false);
    catchError({
      type: 'NO_DOM2_EVENTS',
      fatal: true
    });

  }

} // SoundManager()

// SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading

if (window.SM2_DEFER === _undefined || !SM2_DEFER) {
  soundManager = new SoundManager();
}

/**
 * SoundManager public interfaces
 * ------------------------------
 */

if (typeof module === 'object' && module && typeof module.exports === 'object') {

  /**
   * commonJS module
   */

  module.exports.SoundManager = SoundManager;
  module.exports.soundManager = soundManager;

} else if (typeof define === 'function' && define.amd) {

  /**
   * AMD - requireJS
   * basic usage:
   * require(["/path/to/soundmanager2.js"], function(SoundManager) {
   *   SoundManager.getInstance().setup({
   *     url: '/swf/',
   *     onready: function() { ... }
   *   })
   * });
   *
   * SM2_DEFER usage:
   * window.SM2_DEFER = true;
   * require(["/path/to/soundmanager2.js"], function(SoundManager) {
   *   SoundManager.getInstance(function() {
   *     var soundManager = new SoundManager.constructor();
   *     soundManager.setup({
   *       url: '/swf/',
   *       ...
   *     });
   *     ...
   *     soundManager.beginDelayedInit();
   *     return soundManager;
   *   })
   * }); 
   */

  define(function() {
    /**
     * Retrieve the global instance of SoundManager.
     * If a global instance does not exist it can be created using a callback.
     *
     * @param {Function} smBuilder Optional: Callback used to create a new SoundManager instance
     * @return {SoundManager} The global SoundManager instance
     */
    function getInstance(smBuilder) {
      if (!window.soundManager && smBuilder instanceof Function) {
        var instance = smBuilder(SoundManager);
        if (instance instanceof SoundManager) {
          window.soundManager = instance;
        }
      }
      return window.soundManager;
    }
    return {
      constructor: SoundManager,
      getInstance: getInstance
    }
  });

}

// standard browser case

// constructor
window.SoundManager = SoundManager;

/**
 * note: SM2 requires a window global due to Flash, which makes calls to window.soundManager.
 * Flash may not always be needed, but this is not known until async init and SM2 may even "reboot" into Flash mode.
 */

// public API, flash callbacks etc.
window.soundManager = soundManager;

}(window));

},{}],2:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _soundmanager2 = require('soundmanager2');

var _sm360PlayerScript360player = require('../../../sm/360-player/script/360player');

_soundmanager2.soundManager.setup({
    // path to directory containing SM2 SWF
    url: 'plugins/editor.soundmanager/sm/swf/',
    debugMode: true
});

var Player = (function (_React$Component) {
    _inherits(Player, _React$Component);

    function Player(props) {
        _classCallCheck(this, Player);

        _get(Object.getPrototypeOf(Player.prototype), 'constructor', this).call(this, props);

        _sm360PlayerScript360player.threeSixtyPlayer.config.autoPlay = props.autoPlay;

        _sm360PlayerScript360player.threeSixtyPlayer.config.scaleFont = navigator.userAgent.match(/msie/i) ? false : true;
        _sm360PlayerScript360player.threeSixtyPlayer.config.showHMSTime = true;

        // enable some spectrum stuffs
        _sm360PlayerScript360player.threeSixtyPlayer.config.useWaveformData = true;
        _sm360PlayerScript360player.threeSixtyPlayer.config.useEQData = true;
        var onFinish = props.onFinish;

        if (onFinish) {
            _sm360PlayerScript360player.threeSixtyPlayer.config.onfinish = onFinish;
        }

        // enable this in SM2 as well, as needed
        if (_sm360PlayerScript360player.threeSixtyPlayer.config.useWaveformData) {
            _soundmanager2.soundManager.flash9Options.useWaveformData = true;
        }
        if (_sm360PlayerScript360player.threeSixtyPlayer.config.useEQData) {
            _soundmanager2.soundManager.flash9Options.useEQData = true;
        }
        if (_sm360PlayerScript360player.threeSixtyPlayer.config.usePeakData) {
            _soundmanager2.soundManager.flash9Options.usePeakData = true;
        }

        if (_sm360PlayerScript360player.threeSixtyPlayer.config.useWaveformData || _sm360PlayerScript360player.threeSixtyPlayer.flash9Options.useEQData || _sm360PlayerScript360player.threeSixtyPlayer.flash9Options.usePeakData) {
            // even if HTML5 supports MP3, prefer flash so the visualization features can be used.
            _soundmanager2.soundManager.preferFlash = true;
        }

        // favicon is expensive CPU-wise, but can be used.
        if (window.location.href.match(/hifi/i)) {
            _sm360PlayerScript360player.threeSixtyPlayer.config.useFavIcon = true;
        }

        if (window.location.href.match(/html5/i)) {
            // for testing IE 9, etc.
            _soundmanager2.soundManager.useHTML5Audio = true;
        }
    }

    _createClass(Player, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            _soundmanager2.soundManager.onready(_sm360PlayerScript360player.threeSixtyPlayer.init);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.props.onFinish) {
                _sm360PlayerScript360player.threeSixtyPlayer.config.onfinish = null;
            }
            _soundmanager2.soundManager.stopAll();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (this.props.onFinish) {
                _sm360PlayerScript360player.threeSixtyPlayer.config.onfinish = this.props.onFinish;
            }
            _soundmanager2.soundManager.onready(_sm360PlayerScript360player.threeSixtyPlayer.init);
        }
    }, {
        key: 'render',
        value: function render() {
            var className = "ui360";
            if (this.props.rich) {
                className += " ui360-vis";
            }

            return _react2['default'].createElement(
                'div',
                { className: className, style: this.props.style },
                this.props.children
            );
        }
    }]);

    return Player;
})(_react2['default'].Component);

Player.propTypes = {
    threeSixtyPlayer: _react2['default'].PropTypes.object,
    autoPlay: _react2['default'].PropTypes.bool,
    rich: _react2['default'].PropTypes.bool.isRequired,
    onReady: _react2['default'].PropTypes.func
};

Player.defaultProps = {
    autoPlay: false,
    rich: true
};

exports['default'] = Player;
module.exports = exports['default'];

},{"../../../sm/360-player/script/360player":7,"react":"react","soundmanager2":1}],3:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Player = require('./Player');

var _Player2 = _interopRequireDefault(_Player);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

// The threeSixytPlayer is the same for all badges
var threeSixtyPlayer = new ThreeSixtyPlayer();

var Badge = (function (_Component) {
    _inherits(Badge, _Component);

    function Badge() {
        _classCallCheck(this, Badge);

        _get(Object.getPrototypeOf(Badge.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Badge, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadNode(this.props);

            threeSixtyPlayer.init();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.node !== this.props.node) {
                this.loadNode(nextProps);
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var _this = this;

            var node = props.node;

            _pydioHttpApi2['default'].getClient().buildPresignedGetUrl(node, function (url) {
                _this.setState({
                    url: url,
                    mimeType: "audio/" + node.getAjxpMime()
                });
            }, "audio/" + node.getAjxpMime());
        }
    }, {
        key: 'render',
        value: function render() {
            var _ref = this.state || {};

            var mimeType = _ref.mimeType;
            var url = _ref.url;

            if (!url) return null;

            return _react2['default'].createElement(
                _Player2['default'],
                { rich: false, style: { width: 40, height: 40, margin: "auto" }, onReady: function () {} },
                _react2['default'].createElement('a', { type: mimeType, href: url })
            );
        }
    }]);

    return Badge;
})(_react.Component);

exports['default'] = Badge;

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
module.exports = exports['default'];

},{"./Player":2,"pydio/http/api":"pydio/http/api","react":"react"}],4:[function(require,module,exports){
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
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _materialUi = require('material-ui');

var _Player = require('./Player');

var _Player2 = _interopRequireDefault(_Player);

var PydioApi = require('pydio/http/api');

var _Pydio$requireLib = _pydio2['default'].requireLib("hoc");

var withSelection = _Pydio$requireLib.withSelection;
var EditorActions = _Pydio$requireLib.EditorActions;
var withMenu = _Pydio$requireLib.withMenu;
var withLoader = _Pydio$requireLib.withLoader;
var withErrors = _Pydio$requireLib.withErrors;
var withControls = _Pydio$requireLib.withControls;

var editors = _pydio2['default'].getInstance().Registry.getActiveExtensionByType("editor");
var conf = editors.filter(function (_ref) {
    var id = _ref.id;
    return id === 'editor.soundmanager';
})[0];

var getSelectionFilter = function getSelectionFilter(node) {
    return conf.mimes.indexOf(node.getAjxpMime()) > -1;
};

var getSelection = function getSelection(node) {
    return new Promise(function (resolve, reject) {
        var selection = [];

        node.getParent().getChildren().forEach(function (child) {
            return selection.push(child);
        });
        selection = selection.filter(getSelectionFilter).sort(function (a, b) {
            return a.getLabel().localeCompare(b.getLabel(), undefined, { numeric: true });
        });

        resolve({
            selection: selection,
            currentIndex: selection.reduce(function (currentIndex, current, index) {
                return current === node && index || currentIndex;
            }, 0)
        });
    });
};

var styles = {
    container: {
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1
    },
    player: {
        margin: "auto"
    },
    table: {
        width: 320
    }
};

var Editor = (function (_Component) {
    _inherits(Editor, _Component);

    function Editor() {
        _classCallCheck(this, _Editor);

        _get(Object.getPrototypeOf(_Editor.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadNode(this.props);
            var editorModify = this.props.editorModify;

            if (this.props.isActive) {
                editorModify({ fixedToolbar: false });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this = this;

            var editorModify = this.props.editorModify;

            if (nextProps.isActive) {
                editorModify({ fixedToolbar: false });
            }
            if (nextProps.node !== this.props.node) {
                this.setState({ url: '' }, function () {
                    _this.loadNode(nextProps);
                });
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var _this2 = this;

            var node = props.node;

            PydioApi.getClient().buildPresignedGetUrl(node, function (url) {
                _this2.setState({
                    node: node,
                    url: url,
                    mimeType: "audio/" + node.getAjxpMime()
                });
            }, "audio/" + node.getAjxpMime());
        }
    }, {
        key: 'playNext',
        value: function playNext() {
            var selection = this.props.selection;
            var node = this.state.node;

            var index = selection.selection.indexOf(node);
            if (index < selection.selection.length - 1) {
                this.onRowSelection([index + 1]);
            }
        }
    }, {
        key: 'onRowSelection',
        value: function onRowSelection(data) {
            var _this3 = this;

            if (!data.length) return;
            var selection = this.props.selection;

            if (!selection) return;
            this.setState({ url: null }, function () {
                _this3.loadNode({ node: selection.selection[data[0]] });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _ref2 = this.state || {};

            var mimeType = _ref2.mimeType;
            var url = _ref2.url;
            var node = _ref2.node;

            return _react2['default'].createElement(
                'div',
                { style: styles.container },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 3, style: styles.player },
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '0 60px' } },
                        url && _react2['default'].createElement(
                            _Player2['default'],
                            { autoPlay: true, rich: !this.props.icon && this.props.rich, onReady: this.props.onLoad, onFinish: function () {
                                    _this4.playNext();
                                } },
                            _react2['default'].createElement('a', { type: mimeType, href: url })
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { clear: 'both' } },
                        _react2['default'].createElement(
                            _materialUi.Table,
                            {
                                style: styles.table,
                                selectable: true,
                                multiSelectable: false,
                                height: 250,
                                onRowSelection: function (data) {
                                    _this4.onRowSelection(data);
                                }
                            },
                            _react2['default'].createElement(
                                _materialUi.TableBody,
                                {
                                    displayRowCheckbox: false,
                                    stripedRows: false,
                                    deselectOnClickaway: false
                                },
                                this.props.selection && this.props.selection.selection.map(function (n, index) {
                                    return _react2['default'].createElement(
                                        _materialUi.TableRow,
                                        { key: index },
                                        _react2['default'].createElement(
                                            _materialUi.TableRowColumn,
                                            { style: { width: 16, backgroundColor: 'white' } },
                                            node && n.getPath() === node.getPath() ? _react2['default'].createElement('span', { className: "mdi mdi-play" }) : index
                                        ),
                                        _react2['default'].createElement(
                                            _materialUi.TableRowColumn,
                                            { style: { backgroundColor: 'white' } },
                                            n.getLabel()
                                        )
                                    );
                                })
                            )
                        )
                    )
                )
            );
        }
    }]);

    var _Editor = Editor;
    Editor = (0, _reactRedux.connect)(null, EditorActions)(Editor) || Editor;
    Editor = withSelection(getSelection)(Editor) || Editor;
    return Editor;
})(_react.Component);

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

exports['default'] = Editor;
module.exports = exports['default'];

},{"./Player":2,"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","react":"react","react-redux":"react-redux","redux":"redux"}],5:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _badge = require('./badge');

exports.Badge = _interopRequire(_badge);

var _preview = require('./preview');

exports.Panel = _interopRequire(_preview);

var _editor = require('./editor');

exports.Editor = _interopRequire(_editor);

},{"./badge":3,"./editor":4,"./preview":6}],6:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Player = require('./Player');

var _Player2 = _interopRequireDefault(_Player);

var PydioApi = require('pydio/http/api');

// The threeSixytPlayer is the same for all badges
var threeSixtyPlayer = new ThreeSixtyPlayer();

var Preview = (function (_Component) {
    _inherits(Preview, _Component);

    function Preview() {
        _classCallCheck(this, Preview);

        _get(Object.getPrototypeOf(Preview.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Preview, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadNode(this.props);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.node !== this.props.node) {
                this.loadNode(nextProps);
            }
        }
    }, {
        key: 'loadNode',
        value: function loadNode(props) {
            var _this = this;

            var node = props.node;

            var mime = "audio/" + node.getAjxpMime();

            PydioApi.getClient().buildPresignedGetUrl(node, function (url) {
                _this.setState({
                    url: url,
                    mimeType: mime
                });
            }, mime);

            this.setState({
                url: node.getPath(),
                mimeType: "audio/" + node.getAjxpMime()
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _ref = this.state || {};

            var mimeType = _ref.mimeType;
            var url = _ref.url;

            if (!url) return null;

            return _react2['default'].createElement(
                _Player2['default'],
                { rich: true, style: { margin: "auto" }, onReady: function () {} },
                _react2['default'].createElement('a', { type: mimeType, href: url })
            );
        }
    }]);

    return Preview;
})(_react.Component);

exports['default'] = Preview;

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
module.exports = exports['default'];

},{"./Player":2,"pydio/http/api":"pydio/http/api","react":"react"}],7:[function(require,module,exports){
/**
 *
 * SoundManager 2 Demo: 360-degree / "donut player"
 * ------------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * An inline player with a circular UI.
 * Based on the original SM2 inline player.
 * Inspired by Apple's preview feature in the
 * iTunes music store (iPhone), among others.
 *
 * Requires SoundManager 2 Javascript API.
 * Also uses Bernie's Better Animation Class (BSD):
 * http://www.berniecode.com/writing/animator.html
 *
*/

/*jslint white: false, onevar: true, undef: true, nomen: false, eqeqeq: true, plusplus: false, bitwise: true, regexp: false, newcap: true, immed: true */
/*global document, window, soundManager, navigator */

var threeSixtyPlayer, // instance
    ThreeSixtyPlayer; // constructor

(function(window, _undefined) {

function ThreeSixtyPlayer() {

  var self = this,
      pl = this,
      sm = soundManager, // soundManager instance
      uA = navigator.userAgent,
      isIE = (uA.match(/msie/i)),
      isOpera = (uA.match(/opera/i)),
      isSafari = (uA.match(/safari/i)),
      isChrome = (uA.match(/chrome/i)),
      isFirefox = (uA.match(/firefox/i)),
      isTouchDevice = (uA.match(/ipad|iphone/i)),
      hasRealCanvas = (typeof window.G_vmlCanvasManager === 'undefined' && typeof document.createElement('canvas').getContext('2d') !== 'undefined'),
      // I dunno what Opera doesn't like about this. I'm probably doing it wrong.
      fullCircle = (isOpera||isChrome?359.9:360);

  // CSS class for ignoring MP3 links
  this.excludeClass = 'threesixty-exclude';
  this.links = [];
  this.sounds = [];
  this.soundsByURL = {};
  this.indexByURL = {};
  this.lastSound = null;
  this.lastTouchedSound = null;
  this.soundCount = 0;
  this.oUITemplate = null;
  this.oUIImageMap = null;
  this.vuMeter = null;
  this.callbackCount = 0;
  this.peakDataHistory = [];

  // 360player configuration options
  this.config = {

    playNext: false,   // stop after one sound, or play through list until end
    autoPlay: false,   // start playing the first sound right away
    allowMultiple: false,  // let many sounds play at once (false = only one sound playing at a time)
    loadRingColor: '#ccc', // how much has loaded
    playRingColor: '#000', // how much has played
    backgroundRingColor: '#eee', // color shown underneath load + play ("not yet loaded" color)

    // optional segment/annotation (metadata) stuff..
    segmentRingColor: 'rgba(255,255,255,0.33)', // metadata/annotation (segment) colors
    segmentRingColorAlt: 'rgba(0,0,0,0.1)',
    loadRingColorMetadata: '#ddd', // "annotations" load color
    playRingColorMetadata: 'rgba(128,192,256,0.9)', // how much has played when metadata is present

    circleDiameter: null, // set dynamically according to values from CSS
    circleRadius: null,
    animDuration: 500,
    animTransition: window.Animator.tx.bouncy, // http://www.berniecode.com/writing/animator.html
    showHMSTime: false, // hours:minutes:seconds vs. seconds-only
    scaleFont: true,  // also set the font size (if possible) while animating the circle

    // optional: spectrum or EQ graph in canvas (not supported in IE <9, too slow via ExCanvas)
    useWaveformData: false,
    waveformDataColor: '#0099ff',
    waveformDataDownsample: 3, // use only one in X (of a set of 256 values) - 1 means all 256
    waveformDataOutside: false,
    waveformDataConstrain: false, // if true, +ve values only - keep within inside circle
    waveformDataLineRatio: 0.64,

    // "spectrum frequency" option
    useEQData: false,
    eqDataColor: '#339933',
    eqDataDownsample: 4, // use only one in X (of 256 values)
    eqDataOutside: true,
    eqDataLineRatio: 0.54,

    // enable "amplifier" (canvas pulses like a speaker) effect
    usePeakData: true,
    peakDataColor: '#ff33ff',
    peakDataOutside: true,
    peakDataLineRatio: 0.5,

    useAmplifier: true, // "pulse" like a speaker

    fontSizeMax: null, // set according to CSS

    useFavIcon: false // Experimental (also requires usePeakData: true).. Try to draw a "VU Meter" in the favicon area, if browser supports it (Firefox + Opera as of 2009)

  };

  this.css = {

    // CSS class names appended to link during various states
    sDefault: 'sm2_link', // default state
    sBuffering: 'sm2_buffering',
    sPlaying: 'sm2_playing',
    sPaused: 'sm2_paused'

  };

  this.addEventHandler = (typeof window.addEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
    return o.addEventListener(evtName,evtHandler,false);
  } : function(o, evtName, evtHandler) {
    o.attachEvent('on'+evtName,evtHandler);
  });

  this.removeEventHandler = (typeof window.removeEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
    return o.removeEventListener(evtName,evtHandler,false);
  } : function(o, evtName, evtHandler) {
    return o.detachEvent('on'+evtName,evtHandler);
  });

  this.hasClass = function(o,cStr) {
    return typeof(o.className)!=='undefined'?o.className.match(new RegExp('(\\s|^)'+cStr+'(\\s|$)')):false;
  };

  this.addClass = function(o,cStr) {

    if (!o || !cStr || self.hasClass(o,cStr)) {
      return false;
    }
    o.className = (o.className?o.className+' ':'')+cStr;

  };

  this.removeClass = function(o,cStr) {

    if (!o || !cStr || !self.hasClass(o,cStr)) {
      return false;
    }
    o.className = o.className.replace(new RegExp('( '+cStr+')|('+cStr+')','g'),'');

  };

  this.getElementsByClassName = function(className,tagNames,oParent) {

    var doc = (oParent||document),
        matches = [], i,j, nodes = [];
    if (typeof tagNames !== 'undefined' && typeof tagNames !== 'string') {
      for (i=tagNames.length; i--;) {
        if (!nodes || !nodes[tagNames[i]]) {
          nodes[tagNames[i]] = doc.getElementsByTagName(tagNames[i]);
        }
      }
    } else if (tagNames) {
      nodes = doc.getElementsByTagName(tagNames);
    } else {
      nodes = doc.all||doc.getElementsByTagName('*');
    }
    if (typeof(tagNames)!=='string') {
      for (i=tagNames.length; i--;) {
        for (j=nodes[tagNames[i]].length; j--;) {
          if (self.hasClass(nodes[tagNames[i]][j],className)) {
            matches.push(nodes[tagNames[i]][j]);
          }
        }
      }
    } else {
      for (i=0; i<nodes.length; i++) {
        if (self.hasClass(nodes[i],className)) {
          matches.push(nodes[i]);
        }
      }
    }
    return matches;

  };

  this.getParentByNodeName = function(oChild,sParentNodeName) {

    if (!oChild || !sParentNodeName) {
      return false;
    }
    sParentNodeName = sParentNodeName.toLowerCase();
    while (oChild.parentNode && sParentNodeName !== oChild.parentNode.nodeName.toLowerCase()) {
      oChild = oChild.parentNode;
    }
    return (oChild.parentNode && sParentNodeName === oChild.parentNode.nodeName.toLowerCase()?oChild.parentNode:null);

  };

  this.getParentByClassName = function(oChild,sParentClassName) {

    if (!oChild || !sParentClassName) {
      return false;
    }
    while (oChild.parentNode && !self.hasClass(oChild.parentNode,sParentClassName)) {
      oChild = oChild.parentNode;
    }
    return (oChild.parentNode && self.hasClass(oChild.parentNode,sParentClassName)?oChild.parentNode:null);

  };

  this.getSoundByURL = function(sURL) {
    return (typeof self.soundsByURL[sURL] !== 'undefined'?self.soundsByURL[sURL]:null);
  };

  this.isChildOfNode = function(o,sNodeName) {

    if (!o || !o.parentNode) {
      return false;
    }
    sNodeName = sNodeName.toLowerCase();
    do {
      o = o.parentNode;
    } while (o && o.parentNode && o.nodeName.toLowerCase() !== sNodeName);
    return (o && o.nodeName.toLowerCase() === sNodeName?o:null);

  };

  this.isChildOfClass = function(oChild,oClass) {

    if (!oChild || !oClass) {
      return false;
    }
    while (oChild.parentNode && !self.hasClass(oChild,oClass)) {
      oChild = self.findParent(oChild);
    }
    return (self.hasClass(oChild,oClass));

  };

  this.findParent = function(o) {

    if (!o || !o.parentNode) {
      return false;
    }
    o = o.parentNode;
    if (o.nodeType === 2) {
      while (o && o.parentNode && o.parentNode.nodeType === 2) {
        o = o.parentNode;
      }
    }
    return o;

  };

  this.getStyle = function(o,sProp) {

    // http://www.quirksmode.org/dom/getstyles.html
    try {
      if (o.currentStyle) {
        return o.currentStyle[sProp];
      } else if (window.getComputedStyle) {
        return document.defaultView.getComputedStyle(o,null).getPropertyValue(sProp);
      }
    } catch(e) {
      // oh well
    }
    return null;

  };

  this.findXY = function(obj) {

    var curleft = 0, curtop = 0;
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (!!(obj = obj.offsetParent));
    return [curleft,curtop];

  };

  this.getMouseXY = function(e) {

    // http://www.quirksmode.org/js/events_properties.html
    e = e?e:window.event;
    if (isTouchDevice && e.touches) {
      e = e.touches[0];
    }
    if (e.pageX || e.pageY) {
      return [e.pageX,e.pageY];
    } else if (e.clientX || e.clientY) {
      return [e.clientX+self.getScrollLeft(),e.clientY+self.getScrollTop()];
    }

  };

  this.getScrollLeft = function() {
    return (document.body.scrollLeft+document.documentElement.scrollLeft);
  };

  this.getScrollTop = function() {
    return (document.body.scrollTop+document.documentElement.scrollTop);
  };

  this.events = {

    // handlers for sound events as they're started/stopped/played

    play: function() {
        if(pl.config.onplay){
            pl.config.onplay(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = pl.css.sPlaying;
      pl.addClass(this._360data.oUIBox,this._360data.className);
      self.fanOut(this);
    },

    stop: function() {
        if(pl.config.onstop){
            pl.config.onstop(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = '';
      self.fanIn(this);
    },

    pause: function() {
        if(pl.config.onpause){
            pl.config.onpause(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = pl.css.sPaused;
      pl.addClass(this._360data.oUIBox,this._360data.className);
    },

    resume: function() {
        if(pl.config.onresume){
            pl.config.onresume(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = pl.css.sPlaying;
      pl.addClass(this._360data.oUIBox,this._360data.className);
    },

    finish: function() {
      var nextLink;
        if(pl.config.onfinish){
            pl.config.onfinish(this);
        }
      pl.removeClass(this._360data.oUIBox,this._360data.className);
      this._360data.className = '';
      // self.clearCanvas(this._360data.oCanvas);
      this._360data.didFinish = true; // so fan draws full circle
      self.fanIn(this);
      if (pl.config.playNext) {
        nextLink = (pl.indexByURL[this._360data.oLink.href]+1);
        if (nextLink<pl.links.length) {
          pl.handleClick({'target':pl.links[nextLink]});
        }
      }
    },

    whileloading: function() {
      if (this.paused) {
        self.updatePlaying.apply(this);
      }
    },

    whileplaying: function() {
      self.updatePlaying.apply(this);
      this._360data.fps++;
    },

    bufferchange: function() {
      if (this.isBuffering) {
        pl.addClass(this._360data.oUIBox,pl.css.sBuffering);
      } else {
        pl.removeClass(this._360data.oUIBox,pl.css.sBuffering);
      }
    }

  };

  this.stopEvent = function(e) {

   if (typeof e !== 'undefined' && typeof e.preventDefault !== 'undefined') {
      e.preventDefault();
    } else if (typeof window.event !== 'undefined' && typeof window.event.returnValue !== 'undefined') {
      window.event.returnValue = false;
    }
    return false;

  };

  this.getTheDamnLink = (isIE)?function(e) {
    // I really didn't want to have to do this.
    return (e && e.target?e.target:window.event.srcElement);
  }:function(e) {
    return e.target;
  };

  this.handleClick = function(e) {

    // a sound link was clicked
    if (e.button > 1) {
      // only catch left-clicks
      return true;
    }

    var o = self.getTheDamnLink(e),
        sURL, soundURL, thisSound, oContainer, has_vis, diameter;

    if (o.nodeName.toLowerCase() !== 'a') {
      o = self.isChildOfNode(o,'a');
      if (!o) {
        return true;
      }
    }

    if (!self.isChildOfClass(o,'ui360')) {
      // not a link we're interested in
      return true;
    }

    sURL = o.getAttribute('href');

    if (!o.href || !sm.canPlayLink(o) || self.hasClass(o,self.excludeClass)) {
      return true; // pass-thru for non-MP3/non-links
    }

    sm._writeDebug('handleClick()');
    soundURL = (o.href);
    thisSound = self.getSoundByURL(soundURL);

    if (thisSound) {

      // already exists
      if (thisSound === self.lastSound) {
        // and was playing (or paused)
        thisSound.togglePause();
      } else {
        // different sound
        thisSound.togglePause(); // start playing current
        sm._writeDebug('sound different than last sound: '+self.lastSound.sID);
        if (!self.config.allowMultiple && self.lastSound) {
          self.stopSound(self.lastSound);
        }
      }

    } else {

      // append some dom shiz, make noise

      oContainer = o.parentNode;
      has_vis = (self.getElementsByClassName('ui360-vis','div',oContainer.parentNode).length);

      // create sound
      thisSound = sm.createSound({
       id:'ui360Sound_'+parseInt(Math.random()*10000000),
       url:soundURL,
       onplay:self.events.play,
       onstop:self.events.stop,
       onpause:self.events.pause,
       onresume:self.events.resume,
       onfinish:self.events.finish,
       onbufferchange:self.events.bufferchange,
       whileloading:self.events.whileloading,
       whileplaying:self.events.whileplaying,
       useWaveformData:(has_vis && self.config.useWaveformData),
       useEQData:(has_vis && self.config.useEQData),
       usePeakData:(has_vis && self.config.usePeakData)
      });

      // tack on some custom data

      diameter = parseInt(self.getElementsByClassName('sm2-360ui','div',oContainer)[0].offsetWidth, 10);

      thisSound._360data = {
        oUI360: self.getParentByClassName(o,'ui360'), // the (whole) entire container
        oLink: o, // DOM node for reference within SM2 object event handlers
        className: self.css.sPlaying,
        oUIBox: self.getElementsByClassName('sm2-360ui','div',oContainer)[0],
        oCanvas: self.getElementsByClassName('sm2-canvas','canvas',oContainer)[0],
        oButton: self.getElementsByClassName('sm2-360btn','span',oContainer)[0],
        oTiming: self.getElementsByClassName('sm2-timing','div',oContainer)[0],
        oCover: self.getElementsByClassName('sm2-cover','div',oContainer)[0],
        circleDiameter: diameter,
        circleRadius: diameter/2,
        lastTime: null,
        didFinish: null,
        pauseCount:0,
        radius:0,
        fontSize: 1,
        fontSizeMax: self.config.fontSizeMax,
        scaleFont: (has_vis && self.config.scaleFont),
        showHMSTime: has_vis,
        amplifier: (has_vis && self.config.usePeakData?0.9:1), // TODO: x1 if not being used, else use dynamic "how much to amplify by" value
        radiusMax: diameter*0.175, // circle radius
        width:0,
        widthMax: diameter*0.4, // width of the outer ring
        lastValues: {
          bytesLoaded: 0,
          bytesTotal: 0,
          position: 0,
          durationEstimate: 0
        }, // used to track "last good known" values before sound finish/reset for anim
        animating: false,
        oAnim: new window.Animator({
          duration: self.config.animDuration,
          transition:self.config.animTransition,
          onComplete: function() {
            // var thisSound = this;
            // thisSound._360data.didFinish = false; // reset full circle
          }
        }),
        oAnimProgress: function(nProgress) {
          var thisSound = this;
          thisSound._360data.radius = parseInt(thisSound._360data.radiusMax*thisSound._360data.amplifier*nProgress, 10);
          thisSound._360data.width = parseInt(thisSound._360data.widthMax*thisSound._360data.amplifier*nProgress, 10);
          if (thisSound._360data.scaleFont && thisSound._360data.fontSizeMax !== null) {
            thisSound._360data.oTiming.style.fontSize = parseInt(Math.max(1,thisSound._360data.fontSizeMax*nProgress), 10)+'px';
            thisSound._360data.oTiming.style.opacity = nProgress;
          }
          if (thisSound.paused || thisSound.playState === 0 || thisSound._360data.lastValues.bytesLoaded === 0 || thisSound._360data.lastValues.position === 0) {
            self.updatePlaying.apply(thisSound);
          }
        },
        fps: 0
      };

      // "Metadata" (annotations)
      if (typeof self.Metadata !== 'undefined' && self.getElementsByClassName('metadata','div',thisSound._360data.oUI360).length) {
        thisSound._360data.metadata = new self.Metadata(thisSound,self);
      }

      // minimize ze font
      if (thisSound._360data.scaleFont && thisSound._360data.fontSizeMax !== null) {
        thisSound._360data.oTiming.style.fontSize = '1px';
      }

      // set up ze animation
      thisSound._360data.oAnim.addSubject(thisSound._360data.oAnimProgress,thisSound);

      // animate the radius out nice
      self.refreshCoords(thisSound);

      self.updatePlaying.apply(thisSound);

      self.soundsByURL[soundURL] = thisSound;
      self.sounds.push(thisSound);
      if (!self.config.allowMultiple && self.lastSound) {
        self.stopSound(self.lastSound);
      }
      thisSound.play();

    }

    self.lastSound = thisSound; // reference for next call

    if (typeof e !== 'undefined' && typeof e.preventDefault !== 'undefined') {
      e.preventDefault();
    } else if (typeof window.event !== 'undefined') {
      window.event.returnValue = false;
    }
    return false;

  };

  this.fanOut = function(oSound) {

     var thisSound = oSound;
     if (thisSound._360data.animating === 1) {
       return false;
     }
     thisSound._360data.animating = 0;
     soundManager._writeDebug('fanOut: '+thisSound.sID+': '+thisSound._360data.oLink.href);
     thisSound._360data.oAnim.seekTo(1); // play to end
     window.setTimeout(function() {
       // oncomplete hack
       thisSound._360data.animating = 0;
     },self.config.animDuration+20);

  };

  this.fanIn = function(oSound) {

     var thisSound = oSound;
     if (thisSound._360data.animating === -1) {
       return false;
     }
     thisSound._360data.animating = -1;
     soundManager._writeDebug('fanIn: '+thisSound.sID+': '+thisSound._360data.oLink.href);
     // massive hack
     thisSound._360data.oAnim.seekTo(0); // play to end
     window.setTimeout(function() {
       // reset full 360 fill after animation has completed (oncomplete hack)
       thisSound._360data.didFinish = false;
       thisSound._360data.animating = 0;
       self.resetLastValues(thisSound);
     }, self.config.animDuration+20);

  };

  this.resetLastValues = function(oSound) {
    oSound._360data.lastValues.position = 0;
  };

  this.refreshCoords = function(thisSound) {

    thisSound._360data.canvasXY = self.findXY(thisSound._360data.oCanvas);
    thisSound._360data.canvasMid = [thisSound._360data.circleRadius,thisSound._360data.circleRadius];
    thisSound._360data.canvasMidXY = [thisSound._360data.canvasXY[0]+thisSound._360data.canvasMid[0], thisSound._360data.canvasXY[1]+thisSound._360data.canvasMid[1]];

  };

  this.stopSound = function(oSound) {

    soundManager._writeDebug('stopSound: '+oSound.sID);
    soundManager.stop(oSound.sID);
    if (!isTouchDevice) { // iOS 4.2+ security blocks onfinish() -> playNext() if we set a .src in-between(?)
      soundManager.unload(oSound.sID);
    }

  };

  this.buttonClick = function(e) {

    var o = e?(e.target?e.target:e.srcElement):window.event.srcElement;
    self.handleClick({target:self.getParentByClassName(o,'sm2-360ui').nextSibling}); // link next to the nodes we inserted
    return false;

  };

  this.buttonMouseDown = function(e) {

    // user might decide to drag from here
    // watch for mouse move
    if (!isTouchDevice) {
      document.onmousemove = function(e) {
        // should be boundary-checked, really (eg. move 3px first?)
        self.mouseDown(e);
      };
    } else {
      self.addEventHandler(document,'touchmove',self.mouseDown);
    }
    self.stopEvent(e);
    return false;

  };

  this.mouseDown = function(e) {

    if (!isTouchDevice && e.button > 1) {
      return true; // ignore non-left-click
    }

    if (!self.lastSound) {
      self.stopEvent(e);
      return false;
    }

    var evt = e?e:window.event,
        target, thisSound, oData;

    if (isTouchDevice && evt.touches) {
      evt = evt.touches[0];
    }
    target = (evt.target||evt.srcElement);

    thisSound = self.getSoundByURL(self.getElementsByClassName('sm2_link','a',self.getParentByClassName(target,'ui360'))[0].href); // self.lastSound; // TODO: In multiple sound case, figure out which sound is involved etc.
    // just in case, update coordinates (maybe the element moved since last time.)
    self.lastTouchedSound = thisSound;
    self.refreshCoords(thisSound);
    oData = thisSound._360data;
    self.addClass(oData.oUIBox,'sm2_dragging');
    oData.pauseCount = (self.lastTouchedSound.paused?1:0);
    // self.lastSound.pause();
    self.mmh(e?e:window.event);

    if (isTouchDevice) {
      self.removeEventHandler(document,'touchmove',self.mouseDown);
      self.addEventHandler(document,'touchmove',self.mmh);
      self.addEventHandler(document,'touchend',self.mouseUp);
    } else {
      // incredibly old-skool. TODO: Modernize.
      document.onmousemove = self.mmh;
      document.onmouseup = self.mouseUp;
    }

    self.stopEvent(e);
    return false;

  };

  this.mouseUp = function(e) {

    var oData = self.lastTouchedSound._360data;
    self.removeClass(oData.oUIBox,'sm2_dragging');
    if (oData.pauseCount === 0) {
      self.lastTouchedSound.resume();
    }
    if (!isTouchDevice) {
      document.onmousemove = null;
      document.onmouseup = null;
    } else {
      self.removeEventHandler(document,'touchmove',self.mmh);
      self.removeEventHandler(document,'touchend',self.mouseUP);
    }

  };

  this.mmh = function(e) {

    if (typeof e === 'undefined') {
      e = window.event;
    }
    var oSound = self.lastTouchedSound,
        coords = self.getMouseXY(e),
        x = coords[0],
        y = coords[1],
        deltaX = x-oSound._360data.canvasMidXY[0],
        deltaY = y-oSound._360data.canvasMidXY[1],
        angle = Math.floor(fullCircle-(self.rad2deg(Math.atan2(deltaX,deltaY))+180));

    oSound.setPosition(oSound.durationEstimate*(angle/fullCircle));
    self.stopEvent(e);
    return false;

  };

  // assignMouseDown();

  this.drawSolidArc = function(oCanvas, color, radius, width, radians, startAngle, noClear) {

    // thank you, http://www.snipersystems.co.nz/community/polarclock/tutorial.html

    var x = radius,
        y = radius,
        canvas = oCanvas,
        ctx, innerRadius, doesntLikeZero, endPoint;

    if (canvas.getContext){
      // use getContext to use the canvas for drawing
      ctx = canvas.getContext('2d');
    }

    // re-assign canvas as the actual context
    oCanvas = ctx;

    if (!noClear) {
      self.clearCanvas(canvas);
    }
    // ctx.restore();

    if (color) {
      ctx.fillStyle = color;
    }

    oCanvas.beginPath();

    if (isNaN(radians)) {
      radians = 0;
    }

    innerRadius = radius-width;
    doesntLikeZero = (isOpera || isSafari); // safari 4 doesn't actually seem to mind.

    if (!doesntLikeZero || (doesntLikeZero && radius > 0)) {
      oCanvas.arc(0, 0, radius, startAngle, radians, false);
      endPoint = self.getArcEndpointCoords(innerRadius, radians);
      oCanvas.lineTo(endPoint.x, endPoint.y);
      oCanvas.arc(0, 0, innerRadius, radians, startAngle, true);
      oCanvas.closePath();
      oCanvas.fill();
    }

  };

  this.getArcEndpointCoords = function(radius, radians) {

    return {
      x: radius * Math.cos(radians),
      y: radius * Math.sin(radians)
    };

  };

  this.deg2rad = function(nDeg) {
    return (nDeg * Math.PI/180);
  };

  this.rad2deg = function(nRad) {
    return (nRad * 180/Math.PI);
  };

  this.getTime = function(nMSec,bAsString) {

    // convert milliseconds to mm:ss, return as object literal or string
    var nSec = Math.floor(nMSec/1000),
        min = Math.floor(nSec/60),
        sec = nSec-(min*60);
    // if (min === 0 && sec === 0) return null; // return 0:00 as null
    return (bAsString?(min+':'+(sec<10?'0'+sec:sec)):{'min':min,'sec':sec});

  };

  this.clearCanvas = function(oCanvas) {

    var canvas = oCanvas,
        ctx = null,
        width, height;
    if (canvas.getContext){
      // use getContext to use the canvas for drawing
      ctx = canvas.getContext('2d');
    }
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    ctx.clearRect(-(width/2), -(height/2), width, height);

  };

  this.updatePlaying = function() {

    var timeNow = (this._360data.showHMSTime?self.getTime(this.position,true):parseInt(this.position/1000, 10));

    if (this.bytesLoaded) {
      this._360data.lastValues.bytesLoaded = this.bytesLoaded;
      this._360data.lastValues.bytesTotal = this.bytesTotal;
    }

    if (this.position) {
      this._360data.lastValues.position = this.position;
    }

    if (this.durationEstimate) {
      this._360data.lastValues.durationEstimate = this.durationEstimate;
    }

    self.drawSolidArc(this._360data.oCanvas,self.config.backgroundRingColor,this._360data.width,this._360data.radius,self.deg2rad(fullCircle),false);

    self.drawSolidArc(this._360data.oCanvas,(this._360data.metadata?self.config.loadRingColorMetadata:self.config.loadRingColor),this._360data.width,this._360data.radius,self.deg2rad(fullCircle*(this._360data.lastValues.bytesLoaded/this._360data.lastValues.bytesTotal)),0,true);

    // don't draw if 0 (full black circle in Opera)
    if (this._360data.lastValues.position !== 0) {
      self.drawSolidArc(this._360data.oCanvas,(this._360data.metadata?self.config.playRingColorMetadata:self.config.playRingColor),this._360data.width,this._360data.radius,self.deg2rad((this._360data.didFinish===1?fullCircle:fullCircle*(this._360data.lastValues.position/this._360data.lastValues.durationEstimate))),0,true);
    }

    // metadata goes here
    if (this._360data.metadata) {
      this._360data.metadata.events.whileplaying();
    }

    if (timeNow !== this._360data.lastTime) {
      this._360data.lastTime = timeNow;
      this._360data.oTiming.innerHTML = timeNow;
    }

    // draw spectrum, if applicable
    if ((this.instanceOptions.useWaveformData || this.instanceOptions.useEQData) && hasRealCanvas) { // IE <9 can render maybe 3 or 4 FPS when including the wave/EQ, so don't bother.
      self.updateWaveform(this);
    }

    if (self.config.useFavIcon && self.vuMeter) {
      self.vuMeter.updateVU(this);
    }

  };

  this.updateWaveform = function(oSound) {

    if ((!self.config.useWaveformData && !self.config.useEQData) || (!sm.features.waveformData && !sm.features.eqData)) {
      // feature not enabled..
      return false;
    }

    if (!oSound.waveformData.left.length && !oSound.eqData.length && !oSound.peakData.left) {
      // no data (or errored out/paused/unavailable?)
      return false;
    }

    /* use for testing the data */
    /*
     for (i=0; i<256; i++) {
       oSound.eqData[i] = 1-(i/256);
     }
    */

    var oCanvas = oSound._360data.oCanvas.getContext('2d'),
        offX = 0,
        offY = parseInt(oSound._360data.circleDiameter/2, 10),
        scale = offY/2, // Y axis (+/- this distance from 0)
        // lineWidth = Math.floor(oSound._360data.circleDiameter-(oSound._360data.circleDiameter*0.175)/(oSound._360data.circleDiameter/255)); // width for each line
        lineWidth = 1,
        lineHeight = 1,
        thisY = 0,
        offset = offY,
        i, j, direction, downSample, dataLength, sampleCount, startAngle, endAngle, waveData, innerRadius, perItemAngle, yDiff, eqSamples, playedAngle, iAvg, nPeak;

    if (self.config.useWaveformData) {
      // raw waveform
      downSample = self.config.waveformDataDownsample; // only sample X in 256 (greater number = less sample points)
      downSample = Math.max(1,downSample); // make sure it's at least 1
      dataLength = 256;
      sampleCount = (dataLength/downSample);
      startAngle = 0;
      endAngle = 0;
      waveData = null;
      innerRadius = (self.config.waveformDataOutside?1:(self.config.waveformDataConstrain?0.5:0.565));
      scale = (self.config.waveformDataOutside?0.7:0.75);
      perItemAngle = self.deg2rad((360/sampleCount)*self.config.waveformDataLineRatio); // 0.85 = clean pixel lines at 150? // self.deg2rad(360*(Math.max(1,downSample-1))/sampleCount);
      for (i=0; i<dataLength; i+=downSample) {
        startAngle = self.deg2rad(360*(i/(sampleCount)*1/downSample)); // +0.67 - counter for spacing
        endAngle = startAngle+perItemAngle;
        waveData = oSound.waveformData.left[i];
        if (waveData<0 && self.config.waveformDataConstrain) {
          waveData = Math.abs(waveData);
        }
        self.drawSolidArc(oSound._360data.oCanvas,self.config.waveformDataColor,oSound._360data.width*innerRadius,oSound._360data.radius*scale*1.25*waveData,endAngle,startAngle,true);
      }
    }

    if (self.config.useEQData) {
      // EQ spectrum
      downSample = self.config.eqDataDownsample; // only sample N in 256
      yDiff = 0;
      downSample = Math.max(1,downSample); // make sure it's at least 1
      eqSamples = 192; // drop the last 25% of the spectrum (>16500 Hz), most stuff won't actually use it.
      sampleCount = (eqSamples/downSample);
      innerRadius = (self.config.eqDataOutside?1:0.565);
      direction = (self.config.eqDataOutside?-1:1);
      scale = (self.config.eqDataOutside?0.5:0.75);
      startAngle = 0;
      endAngle = 0;
      perItemAngle = self.deg2rad((360/sampleCount)*self.config.eqDataLineRatio); // self.deg2rad(360/(sampleCount+1));
      playedAngle = self.deg2rad((oSound._360data.didFinish===1?360:360*(oSound._360data.lastValues.position/oSound._360data.lastValues.durationEstimate)));
      j=0;
      iAvg = 0;
      for (i=0; i<eqSamples; i+=downSample) {
        startAngle = self.deg2rad(360*(i/eqSamples));
        endAngle = startAngle+perItemAngle;
        self.drawSolidArc(oSound._360data.oCanvas,(endAngle>playedAngle?self.config.eqDataColor:self.config.playRingColor),oSound._360data.width*innerRadius,oSound._360data.radius*scale*(oSound.eqData.left[i]*direction),endAngle,startAngle,true);
      }
    }

    if (self.config.usePeakData) {
      if (!oSound._360data.animating) {
        nPeak = (oSound.peakData.left||oSound.peakData.right);
        // GIANT HACK: use EQ spectrum data for bass frequencies
        eqSamples = 3;
        for (i=0; i<eqSamples; i++) {
          nPeak = (nPeak||oSound.eqData[i]);
        }
        oSound._360data.amplifier = (self.config.useAmplifier?(0.9+(nPeak*0.1)):1);
        oSound._360data.radiusMax = oSound._360data.circleDiameter*0.175*oSound._360data.amplifier;
        oSound._360data.widthMax = oSound._360data.circleDiameter*0.4*oSound._360data.amplifier;
        oSound._360data.radius = parseInt(oSound._360data.radiusMax*oSound._360data.amplifier, 10);
        oSound._360data.width = parseInt(oSound._360data.widthMax*oSound._360data.amplifier, 10);
      }
    }

  };

  this.getUIHTML = function(diameter) {

    return [
     '<canvas class="sm2-canvas" width="'+diameter+'" height="'+diameter+'"></canvas>',
     ' <span class="sm2-360btn sm2-360btn-default"></span>', // note use of imageMap, edit or remove if you use a different-size image.
     ' <div class="sm2-timing'+(navigator.userAgent.match(/safari/i)?' alignTweak':'')+'"></div>', // + Ever-so-slight Safari horizontal alignment tweak
     ' <div class="sm2-cover"></div>'
    ];

  };

  this.uiTest = function(sClass) {

    // fake a 360 UI so we can get some numbers from CSS, etc.

    var oTemplate = document.createElement('div'),
        oFakeUI, oFakeUIBox, oTemp, fakeDiameter, uiHTML, circleDiameter, circleRadius, fontSizeMax, oTiming;

    oTemplate.className = 'sm2-360ui';

    oFakeUI = document.createElement('div');
    oFakeUI.className = 'ui360'+(sClass?' '+sClass:''); // ui360 ui360-vis

    oFakeUIBox = oFakeUI.appendChild(oTemplate.cloneNode(true));

    oFakeUI.style.position = 'absolute';
    oFakeUI.style.left = '-9999px';

    oTemp = document.body.appendChild(oFakeUI);

    fakeDiameter = oFakeUIBox.offsetWidth;

    uiHTML = self.getUIHTML(fakeDiameter);

    oFakeUIBox.innerHTML = uiHTML[1]+uiHTML[2]+uiHTML[3];

    circleDiameter = parseInt(oFakeUIBox.offsetWidth, 10);
    circleRadius = parseInt(circleDiameter/2, 10);

    oTiming = self.getElementsByClassName('sm2-timing','div',oTemp)[0];
    fontSizeMax = parseInt(self.getStyle(oTiming,'font-size'), 10);
    if (isNaN(fontSizeMax)) {
      // getStyle() etc. didn't work.
      fontSizeMax = null;
    }

    // soundManager._writeDebug('diameter, font size: '+circleDiameter+','+fontSizeMax);

    oFakeUI.parentNode.removeChild(oFakeUI);

    uiHTML = oFakeUI = oFakeUIBox = oTemp = null;

    return {
      circleDiameter: circleDiameter,
      circleRadius: circleRadius,
      fontSizeMax: fontSizeMax
    };

  };

  this.init = function() {

    sm._writeDebug('threeSixtyPlayer.init()');

      if(self.config.items){
          var oItems = self.config.items;
      }else{
          var oItems = self.getElementsByClassName('ui360','div');
      }
    var i, j, oLinks = [], is_vis = false, foundItems = 0, oCanvas, oCanvasCTX, oCover, diameter, radius, uiData, uiDataVis, oUI, oBtn, o, o2, oID;

    for (i=0,j=oItems.length; i<j; i++) {
      oLinks.push(oItems[i].getElementsByTagName('a')[0]);
      // remove "fake" play button (unsupported case)
      oItems[i].style.backgroundImage = 'none';
    }
    // grab all links, look for .mp3

    self.oUITemplate = document.createElement('div');
    self.oUITemplate.className = 'sm2-360ui';

    self.oUITemplateVis = document.createElement('div');
    self.oUITemplateVis.className = 'sm2-360ui';

    uiData = self.uiTest();

    self.config.circleDiameter = uiData.circleDiameter;
    self.config.circleRadius = uiData.circleRadius;
    // self.config.fontSizeMax = uiData.fontSizeMax;

    uiDataVis = self.uiTest('ui360-vis');

    self.config.fontSizeMax = uiDataVis.fontSizeMax;

    // canvas needs inline width and height, doesn't quite work otherwise
    self.oUITemplate.innerHTML = self.getUIHTML(self.config.circleDiameter).join('');

    self.oUITemplateVis.innerHTML = self.getUIHTML(uiDataVis.circleDiameter).join('');

    for (i=0,j=oLinks.length; i<j; i++) {
      if (sm.canPlayLink(oLinks[i]) && !self.hasClass(oLinks[i],self.excludeClass) && !self.hasClass(oLinks[i],self.css.sDefault)) {
        self.addClass(oLinks[i],self.css.sDefault); // add default CSS decoration
        self.links[foundItems] = (oLinks[i]);
        self.indexByURL[oLinks[i].href] = foundItems; // hack for indexing
        foundItems++;

        is_vis = self.hasClass(oLinks[i].parentNode, 'ui360-vis');

        diameter = (is_vis ? uiDataVis : uiData).circleDiameter;
        radius = (is_vis ? uiDataVis : uiData).circleRadius;

        // add canvas shiz
        oUI = oLinks[i].parentNode.insertBefore((is_vis?self.oUITemplateVis:self.oUITemplate).cloneNode(true),oLinks[i]);

        if (isIE && typeof window.G_vmlCanvasManager !== 'undefined') { // IE only
          o = oLinks[i].parentNode;
          o2 = document.createElement('canvas');
          o2.className = 'sm2-canvas';
          oID = 'sm2_canvas_'+parseInt(Math.random()*1048576, 10);
          o2.id = oID;
          o2.width = diameter;
          o2.height = diameter;
          oUI.appendChild(o2);
          window.G_vmlCanvasManager.initElement(o2); // Apply ExCanvas compatibility magic
          oCanvas = document.getElementById(oID);
        } else {
          // add a handler for the button
          oCanvas = oLinks[i].parentNode.getElementsByTagName('canvas')[0];
        }
        oCover = self.getElementsByClassName('sm2-cover','div',oLinks[i].parentNode)[0];
        oBtn = oLinks[i].parentNode.getElementsByTagName('span')[0];
        self.addEventHandler(oBtn,'click',self.buttonClick);
        if (!isTouchDevice) {
          self.addEventHandler(oCover,'mousedown',self.mouseDown);
        } else {
          self.addEventHandler(oCover,'touchstart',self.mouseDown);
        }
        oCanvasCTX = oCanvas.getContext('2d');
        oCanvasCTX.translate(radius, radius);
        oCanvasCTX.rotate(self.deg2rad(-90)); // compensate for arc starting at EAST // http://stackoverflow.com/questions/319267/tutorial-for-html-canvass-arc-function
      }
    }
    if (foundItems>0) {
      self.addEventHandler(document,'click',self.handleClick);
      if (self.config.autoPlay) {
        self.handleClick({target:self.links[0],preventDefault:function(){}});
      }
    }
    sm._writeDebug('threeSixtyPlayer.init(): Found '+foundItems+' relevant items.');

    if (self.config.useFavIcon && typeof this.VUMeter !== 'undefined') {
      this.vuMeter = new this.VUMeter(this);
    }

  };

}

// Optional: VU Meter component

ThreeSixtyPlayer.prototype.VUMeter = function(oParent) {

  var self = oParent,
      me = this,
      _head = document.getElementsByTagName('head')[0],
      isOpera = (navigator.userAgent.match(/opera/i)),
      isFirefox = (navigator.userAgent.match(/firefox/i));

  this.vuMeterData = [];
  this.vuDataCanvas = null;

  this.setPageIcon = function(sDataURL) {

    if (!self.config.useFavIcon || !self.config.usePeakData || !sDataURL) {
      return false;
    }

    var link = document.getElementById('sm2-favicon');
    if (link) {
      _head.removeChild(link);
      link = null;
    }
    if (!link) {
      link = document.createElement('link');
      link.id = 'sm2-favicon';
      link.rel = 'shortcut icon';
      link.type = 'image/png';
      link.href = sDataURL;
      document.getElementsByTagName('head')[0].appendChild(link);
    }

  };

  this.resetPageIcon = function() {

    if (!self.config.useFavIcon) {
      return false;
    }
    var link = document.getElementById('favicon');
    if (link) {
      link.href = '/favicon.ico';
    }

  };

  this.updateVU = function(oSound) {

    if (soundManager.flashVersion >= 9 && self.config.useFavIcon && self.config.usePeakData) {
      me.setPageIcon(me.vuMeterData[parseInt(16*oSound.peakData.left, 10)][parseInt(16*oSound.peakData.right, 10)]);
    }

  };

  this.createVUData = function() {

    var i=0, j=0,
        canvas = me.vuDataCanvas.getContext('2d'),
        vuGrad = canvas.createLinearGradient(0, 16, 0, 0),
        bgGrad = canvas.createLinearGradient(0, 16, 0, 0),
        outline = 'rgba(0,0,0,0.2)';

    vuGrad.addColorStop(0,'rgb(0,192,0)');
    vuGrad.addColorStop(0.30,'rgb(0,255,0)');
    vuGrad.addColorStop(0.625,'rgb(255,255,0)');
    vuGrad.addColorStop(0.85,'rgb(255,0,0)');
    bgGrad.addColorStop(0,outline);
    bgGrad.addColorStop(1,'rgba(0,0,0,0.5)');
    for (i=0; i<16; i++) {
      me.vuMeterData[i] = [];
    }
    for (i=0; i<16; i++) {
      for (j=0; j<16; j++) {
        // reset/erase canvas
        me.vuDataCanvas.setAttribute('width',16);
        me.vuDataCanvas.setAttribute('height',16);
        // draw new stuffs
        canvas.fillStyle = bgGrad;
        canvas.fillRect(0,0,7,15);
        canvas.fillRect(8,0,7,15);
        /*
        // shadow
        canvas.fillStyle = 'rgba(0,0,0,0.1)';
        canvas.fillRect(1,15-i,7,17-(17-i));
        canvas.fillRect(9,15-j,7,17-(17-j));
        */
        canvas.fillStyle = vuGrad;
        canvas.fillRect(0,15-i,7,16-(16-i));
        canvas.fillRect(8,15-j,7,16-(16-j));
        // and now, clear out some bits.
        canvas.clearRect(0,3,16,1);
        canvas.clearRect(0,7,16,1);
        canvas.clearRect(0,11,16,1);
        me.vuMeterData[i][j] = me.vuDataCanvas.toDataURL('image/png');
        // for debugging VU images
        /*
        var o = document.createElement('img');
        o.style.marginRight = '5px';
        o.src = vuMeterData[i][j];
        document.documentElement.appendChild(o);
        */
      }
    }

  };

  this.testCanvas = function() {

    // canvas + toDataURL();
    var c = document.createElement('canvas'),
        ctx = null, ok;
    if (!c || typeof c.getContext === 'undefined') {
      return null;
    }
    ctx = c.getContext('2d');
    if (!ctx || typeof c.toDataURL !== 'function') {
      return null;
    }
    // just in case..
    try {
      ok = c.toDataURL('image/png');
    } catch(e) {
      // no canvas or no toDataURL()
      return null;
    }
    // assume we're all good.
    return c;

  };

  this.init = function() {

    if (self.config.useFavIcon) {
      me.vuDataCanvas = me.testCanvas();
      if (me.vuDataCanvas && (isFirefox || isOpera)) {
        // these browsers support dynamically-updating the favicon
        me.createVUData();
      } else {
        // browser doesn't support doing this
        self.config.useFavIcon = false;
      }
    }

  };

  this.init();

};

// completely optional: Metadata/annotations/segments code

ThreeSixtyPlayer.prototype.Metadata = function(oSound, oParent) {

  soundManager._wD('Metadata()');

  var me = this,
      oBox = oSound._360data.oUI360,
      o = oBox.getElementsByTagName('ul')[0],
      oItems = o.getElementsByTagName('li'),
      isFirefox = (navigator.userAgent.match(/firefox/i)),
      isAlt = false, i, oDuration;

  this.lastWPExec = 0;
  this.refreshInterval = 250;
  this.totalTime = 0;

  this.events = {

    whileplaying: function() {

      var width = oSound._360data.width,
          radius = oSound._360data.radius,
          fullDuration = (oSound.durationEstimate||(me.totalTime*1000)),
          isAlt = null, i, j, d;

      for (i=0,j=me.data.length; i<j; i++) {
        isAlt = (i%2===0);
        oParent.drawSolidArc(oSound._360data.oCanvas,(isAlt?oParent.config.segmentRingColorAlt:oParent.config.segmentRingColor),isAlt?width:width, isAlt?radius/2:radius/2, oParent.deg2rad(360*(me.data[i].endTimeMS/fullDuration)), oParent.deg2rad(360*((me.data[i].startTimeMS||1)/fullDuration)), true);
      }
      d = new Date();
      if (d-me.lastWPExec>me.refreshInterval) {
        me.refresh();
        me.lastWPExec = d;
      }

    }

  };

  this.refresh = function() {

    // Display info as appropriate
    var i, j, index = null,
        now = oSound.position,
        metadata = oSound._360data.metadata.data;

    for (i=0, j=metadata.length; i<j; i++) {
      if (now >= metadata[i].startTimeMS && now <= metadata[i].endTimeMS) {
        index = i;
        break;
      }
    }
    if (index !== metadata.currentItem && index < metadata.length) {
      // update
      oSound._360data.oLink.innerHTML = metadata.mainTitle+' <span class="metadata"><span class="sm2_divider"> | </span><span class="sm2_metadata">'+metadata[index].title+'</span></span>';
      // self.setPageTitle(metadata[index].title+' | '+metadata.mainTitle);
      metadata.currentItem = index;
    }

  };

  this.strToTime = function(sTime) {
    var segments = sTime.split(':'),
        seconds = 0, i;
    for (i=segments.length; i--;) {
      seconds += parseInt(segments[i], 10)*Math.pow(60,segments.length-1-i); // hours, minutes
    }
    return seconds;
  };

  this.data = [];
  this.data.givenDuration = null;
  this.data.currentItem = null;
  this.data.mainTitle = oSound._360data.oLink.innerHTML;

  for (i=0; i<oItems.length; i++) {
    this.data[i] = {
      o: null,
      title: oItems[i].getElementsByTagName('p')[0].innerHTML,
      startTime: oItems[i].getElementsByTagName('span')[0].innerHTML,
      startSeconds: me.strToTime(oItems[i].getElementsByTagName('span')[0].innerHTML.replace(/[()]/g,'')),
      duration: 0,
      durationMS: null,
      startTimeMS: null,
      endTimeMS: null,
      oNote: null
    };
  }
  oDuration = oParent.getElementsByClassName('duration','div',oBox);
  this.data.givenDuration = (oDuration.length?me.strToTime(oDuration[0].innerHTML)*1000:0);
  for (i=0; i<this.data.length; i++) {
    this.data[i].duration = parseInt(this.data[i+1]?this.data[i+1].startSeconds:(me.data.givenDuration?me.data.givenDuration:oSound.durationEstimate)/1000, 10)-this.data[i].startSeconds;
    this.data[i].startTimeMS = this.data[i].startSeconds*1000;
    this.data[i].durationMS = this.data[i].duration*1000;
    this.data[i].endTimeMS = this.data[i].startTimeMS+this.data[i].durationMS;
    this.totalTime += this.data[i].duration;
  }

};

if (navigator.userAgent.match(/webkit/i) && navigator.userAgent.match(/mobile/i)) {
  // iPad, iPhone etc.
  soundManager.useHTML5Audio = true;
}

soundManager.debugMode = false;// (window.location.href.match(/debug=1/i)); // disable or enable debug output
soundManager.consoleOnly = true;
soundManager.flashVersion = 9;
soundManager.useHighPerformance = true;
soundManager.useFlashBlock = true;
soundManager.flashLoadTimeout = 0;

// soundManager.useFastPolling = true; // for more aggressive, faster UI updates (higher CPU use)

// FPS data, testing/debug only
if (soundManager.debugMode) {
  window.setInterval(function() {
    var p = window.threeSixtyPlayer;
    if (p && p.lastSound && p.lastSound._360data.fps && typeof window.isHome === 'undefined') {
      soundManager._writeDebug('fps: ~'+p.lastSound._360data.fps);
      p.lastSound._360data.fps = 0;
    }
  },1000);
}

// SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading

if (window.SM2_DEFER === _undefined || !SM2_DEFER) {
  threeSixtyPlayer = new ThreeSixtyPlayer();
}

/**
 * SoundManager public interfaces
 * ------------------------------
 */

if (typeof module === 'object' && module && typeof module.exports === 'object') {

  /**
   * commonJS module
   */

  module.exports.ThreeSixtyPlayer = ThreeSixtyPlayer;
  module.exports.threeSixtyPlayer = threeSixtyPlayer;

} else if (typeof define === 'function' && define.amd) {

  define(function() {
    /**
     * Retrieve the global instance of SoundManager.
     * If a global instance does not exist it can be created using a callback.
     *
     * @param {Function} smBuilder Optional: Callback used to create a new SoundManager instance
     * @return {SoundManager} The global SoundManager instance
     */
    function getInstance(smBuilder) {
      if (!window.threeSixtyPlayer && smBuilder instanceof Function) {
        var instance = smBuilder(ThreeSixtyPlayer);
        if (instance instanceof ThreeSixtyPlayer) {
          window.threeSixtyPlayer = instance;
        }
      }
      return window.threeSixtyPlayer;
    }
    return {
      constructor: ThreeSixtyPlayer,
      getInstance: getInstance
    }
  });

}

// standard browser case

// constructor
window.ThreeSixtyPlayer = ThreeSixtyPlayer;

/**
 * note: SM2 requires a window global due to Flash, which makes calls to window.soundManager.
 * Flash may not always be needed, but this is not known until async init and SM2 may even "reboot" into Flash mode.
 */

// public API, flash callbacks etc.
window.threeSixtyPlayer = threeSixtyPlayer;

}(window));

},{}]},{},[5])(5)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc291bmRtYW5hZ2VyMi9zY3JpcHQvc291bmRtYW5hZ2VyMi5qcyIsInJlcy9idWlsZC9QeWRpb1NvdW5kTWFuYWdlci9QbGF5ZXIuanMiLCJyZXMvYnVpbGQvUHlkaW9Tb3VuZE1hbmFnZXIvYmFkZ2UuanMiLCJyZXMvYnVpbGQvUHlkaW9Tb3VuZE1hbmFnZXIvZWRpdG9yLmpzIiwicmVzL2J1aWxkL1B5ZGlvU291bmRNYW5hZ2VyL2luZGV4LmpzIiwicmVzL2J1aWxkL1B5ZGlvU291bmRNYW5hZ2VyL3ByZXZpZXcuanMiLCJzbS8zNjAtcGxheWVyL3NjcmlwdC8zNjBwbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqIEBsaWNlbnNlXHJcbiAqXHJcbiAqIFNvdW5kTWFuYWdlciAyOiBKYXZhU2NyaXB0IFNvdW5kIGZvciB0aGUgV2ViXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogaHR0cDovL3NjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDcsIFNjb3R0IFNjaGlsbGVyLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiBDb2RlIHByb3ZpZGVkIHVuZGVyIHRoZSBCU0QgTGljZW5zZTpcclxuICogaHR0cDovL3NjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL2xpY2Vuc2UudHh0XHJcbiAqXHJcbiAqIFYyLjk3YS4yMDE1MDYwMVxyXG4gKi9cclxuXHJcbi8qZ2xvYmFsIHdpbmRvdywgU00yX0RFRkVSLCBzbTJEZWJ1Z2dlciwgY29uc29sZSwgZG9jdW1lbnQsIG5hdmlnYXRvciwgc2V0VGltZW91dCwgc2V0SW50ZXJ2YWwsIGNsZWFySW50ZXJ2YWwsIEF1ZGlvLCBvcGVyYSwgbW9kdWxlLCBkZWZpbmUgKi9cclxuLypqc2xpbnQgcmVnZXhwOiB0cnVlLCBzbG9wcHk6IHRydWUsIHdoaXRlOiB0cnVlLCBub21lbjogdHJ1ZSwgcGx1c3BsdXM6IHRydWUsIHRvZG86IHRydWUgKi9cclxuXHJcbi8qKlxyXG4gKiBBYm91dCB0aGlzIGZpbGVcclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiBUaGlzIGlzIHRoZSBmdWxseS1jb21tZW50ZWQgc291cmNlIHZlcnNpb24gb2YgdGhlIFNvdW5kTWFuYWdlciAyIEFQSSxcclxuICogcmVjb21tZW5kZWQgZm9yIHVzZSBkdXJpbmcgZGV2ZWxvcG1lbnQgYW5kIHRlc3RpbmcuXHJcbiAqXHJcbiAqIFNlZSBzb3VuZG1hbmFnZXIyLW5vZGVidWctanNtaW4uanMgZm9yIGFuIG9wdGltaXplZCBidWlsZCAofjExS0Igd2l0aCBnemlwLilcclxuICogaHR0cDovL3NjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL2RvYy9nZXRzdGFydGVkLyNiYXNpYy1pbmNsdXNpb25cclxuICogQWx0ZXJuYXRlbHksIHNlcnZlIHRoaXMgZmlsZSB3aXRoIGd6aXAgZm9yIDc1JSBjb21wcmVzc2lvbiBzYXZpbmdzICh+MzBLQiBvdmVyIEhUVFAuKVxyXG4gKlxyXG4gKiBZb3UgbWF5IG5vdGljZSA8ZD4gYW5kIDwvZD4gY29tbWVudHMgaW4gdGhpcyBzb3VyY2U7IHRoZXNlIGFyZSBkZWxpbWl0ZXJzIGZvclxyXG4gKiBkZWJ1ZyBibG9ja3Mgd2hpY2ggYXJlIHJlbW92ZWQgaW4gdGhlIC1ub2RlYnVnIGJ1aWxkcywgZnVydGhlciBvcHRpbWl6aW5nIGNvZGUgc2l6ZS5cclxuICpcclxuICogQWxzbywgYXMgeW91IG1heSBub3RlOiBXaG9hLCByZWxpYWJsZSBjcm9zcy1wbGF0Zm9ybS9kZXZpY2UgYXVkaW8gc3VwcG9ydCBpcyBoYXJkISA7KVxyXG4gKi9cclxuXHJcbihmdW5jdGlvbih3aW5kb3csIF91bmRlZmluZWQpIHtcclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaWYgKCF3aW5kb3cgfHwgIXdpbmRvdy5kb2N1bWVudCkge1xyXG5cclxuICAvLyBEb24ndCBjcm9zcyB0aGUgW2Vudmlyb25tZW50XSBzdHJlYW1zLiBTTTIgZXhwZWN0cyB0byBiZSBydW5uaW5nIGluIGEgYnJvd3Nlciwgbm90IHVuZGVyIG5vZGUuanMgZXRjLlxyXG4gIC8vIEFkZGl0aW9uYWxseSwgaWYgYSBicm93c2VyIHNvbWVob3cgbWFuYWdlcyB0byBmYWlsIHRoaXMgdGVzdCwgYXMgRWdvbiBzYWlkOiBcIkl0IHdvdWxkIGJlIGJhZC5cIlxyXG5cclxuICB0aHJvdyBuZXcgRXJyb3IoJ1NvdW5kTWFuYWdlciByZXF1aXJlcyBhIGJyb3dzZXIgd2l0aCB3aW5kb3cgYW5kIGRvY3VtZW50IG9iamVjdHMuJyk7XHJcblxyXG59XHJcblxyXG52YXIgc291bmRNYW5hZ2VyID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBUaGUgU291bmRNYW5hZ2VyIGNvbnN0cnVjdG9yLlxyXG4gKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtzdHJpbmd9IHNtVVJMIE9wdGlvbmFsOiBQYXRoIHRvIFNXRiBmaWxlc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gc21JRCBPcHRpb25hbDogVGhlIElEIHRvIHVzZSBmb3IgdGhlIFNXRiBjb250YWluZXIgZWxlbWVudFxyXG4gKiBAdGhpcyB7U291bmRNYW5hZ2VyfVxyXG4gKiBAcmV0dXJuIHtTb3VuZE1hbmFnZXJ9IFRoZSBuZXcgU291bmRNYW5hZ2VyIGluc3RhbmNlXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gU291bmRNYW5hZ2VyKHNtVVJMLCBzbUlEKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIHNvdW5kTWFuYWdlciBjb25maWd1cmF0aW9uIG9wdGlvbnMgbGlzdFxyXG4gICAqIGRlZmluZXMgdG9wLWxldmVsIGNvbmZpZ3VyYXRpb24gcHJvcGVydGllcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBzb3VuZE1hbmFnZXIgaW5zdGFuY2UgKGVnLiBzb3VuZE1hbmFnZXIuZmxhc2hWZXJzaW9uKVxyXG4gICAqIHRvIHNldCB0aGVzZSBwcm9wZXJ0aWVzLCB1c2UgdGhlIHNldHVwKCkgbWV0aG9kIC0gZWcuLCBzb3VuZE1hbmFnZXIuc2V0dXAoe3VybDogJy9zd2YvJywgZmxhc2hWZXJzaW9uOiA5fSlcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXR1cE9wdGlvbnMgPSB7XHJcblxyXG4gICAgJ3VybCc6IChzbVVSTCB8fCBudWxsKSwgICAgICAgICAgICAgLy8gcGF0aCAoZGlyZWN0b3J5KSB3aGVyZSBTb3VuZE1hbmFnZXIgMiBTV0ZzIGV4aXN0LCBlZy4sIC9wYXRoL3RvL3N3ZnMvXHJcbiAgICAnZmxhc2hWZXJzaW9uJzogOCwgICAgICAgICAgICAgICAgICAvLyBmbGFzaCBidWlsZCB0byB1c2UgKDggb3IgOS4pIFNvbWUgQVBJIGZlYXR1cmVzIHJlcXVpcmUgOS5cclxuICAgICdkZWJ1Z01vZGUnOiB0cnVlLCAgICAgICAgICAgICAgICAgIC8vIGVuYWJsZSBkZWJ1Z2dpbmcgb3V0cHV0IChjb25zb2xlLmxvZygpIHdpdGggSFRNTCBmYWxsYmFjaylcclxuICAgICdkZWJ1Z0ZsYXNoJzogZmFsc2UsICAgICAgICAgICAgICAgIC8vIGVuYWJsZSBkZWJ1Z2dpbmcgb3V0cHV0IGluc2lkZSBTV0YsIHRyb3VibGVzaG9vdCBGbGFzaC9icm93c2VyIGlzc3Vlc1xyXG4gICAgJ3VzZUNvbnNvbGUnOiB0cnVlLCAgICAgICAgICAgICAgICAgLy8gdXNlIGNvbnNvbGUubG9nKCkgaWYgYXZhaWxhYmxlIChvdGhlcndpc2UsIHdyaXRlcyB0byAjc291bmRtYW5hZ2VyLWRlYnVnIGVsZW1lbnQpXHJcbiAgICAnY29uc29sZU9ubHknOiB0cnVlLCAgICAgICAgICAgICAgICAvLyBpZiBjb25zb2xlIGlzIGJlaW5nIHVzZWQsIGRvIG5vdCBjcmVhdGUvd3JpdGUgdG8gI3NvdW5kbWFuYWdlci1kZWJ1Z1xyXG4gICAgJ3dhaXRGb3JXaW5kb3dMb2FkJzogZmFsc2UsICAgICAgICAgLy8gZm9yY2UgU00yIHRvIHdhaXQgZm9yIHdpbmRvdy5vbmxvYWQoKSBiZWZvcmUgdHJ5aW5nIHRvIGNhbGwgc291bmRNYW5hZ2VyLm9ubG9hZCgpXHJcbiAgICAnYmdDb2xvcic6ICcjZmZmZmZmJywgICAgICAgICAgICAgICAvLyBTV0YgYmFja2dyb3VuZCBjb2xvci4gTi9BIHdoZW4gd21vZGUgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAndXNlSGlnaFBlcmZvcm1hbmNlJzogZmFsc2UsICAgICAgICAvLyBwb3NpdGlvbjpmaXhlZCBmbGFzaCBtb3ZpZSBjYW4gaGVscCBpbmNyZWFzZSBqcy9mbGFzaCBzcGVlZCwgbWluaW1pemUgbGFnXHJcbiAgICAnZmxhc2hQb2xsaW5nSW50ZXJ2YWwnOiBudWxsLCAgICAgICAvLyBtc2VjIGFmZmVjdGluZyB3aGlsZXBsYXlpbmcvbG9hZGluZyBjYWxsYmFjayBmcmVxdWVuY3kuIElmIG51bGwsIGRlZmF1bHQgb2YgNTAgbXNlYyBpcyB1c2VkLlxyXG4gICAgJ2h0bWw1UG9sbGluZ0ludGVydmFsJzogbnVsbCwgICAgICAgLy8gbXNlYyBhZmZlY3Rpbmcgd2hpbGVwbGF5aW5nKCkgZm9yIEhUTUw1IGF1ZGlvLCBleGNsdWRpbmcgbW9iaWxlIGRldmljZXMuIElmIG51bGwsIG5hdGl2ZSBIVE1MNSB1cGRhdGUgZXZlbnRzIGFyZSB1c2VkLlxyXG4gICAgJ2ZsYXNoTG9hZFRpbWVvdXQnOiAxMDAwLCAgICAgICAgICAgLy8gbXNlYyB0byB3YWl0IGZvciBmbGFzaCBtb3ZpZSB0byBsb2FkIGJlZm9yZSBmYWlsaW5nICgwID0gaW5maW5pdHkpXHJcbiAgICAnd21vZGUnOiBudWxsLCAgICAgICAgICAgICAgICAgICAgICAvLyBmbGFzaCByZW5kZXJpbmcgbW9kZSAtIG51bGwsICd0cmFuc3BhcmVudCcsIG9yICdvcGFxdWUnIChsYXN0IHR3byBhbGxvdyB6LWluZGV4IHRvIHdvcmspXHJcbiAgICAnYWxsb3dTY3JpcHRBY2Nlc3MnOiAnYWx3YXlzJywgICAgICAvLyBmb3Igc2NyaXB0aW5nIHRoZSBTV0YgKG9iamVjdC9lbWJlZCBwcm9wZXJ0eSksICdhbHdheXMnIG9yICdzYW1lRG9tYWluJ1xyXG4gICAgJ3VzZUZsYXNoQmxvY2snOiBmYWxzZSwgICAgICAgICAgICAgLy8gKnJlcXVpcmVzIGZsYXNoYmxvY2suY3NzLCBzZWUgZGVtb3MqIC0gYWxsb3cgcmVjb3ZlcnkgZnJvbSBmbGFzaCBibG9ja2Vycy4gV2FpdCBpbmRlZmluaXRlbHkgYW5kIGFwcGx5IHRpbWVvdXQgQ1NTIHRvIFNXRiwgaWYgYXBwbGljYWJsZS5cclxuICAgICd1c2VIVE1MNUF1ZGlvJzogdHJ1ZSwgICAgICAgICAgICAgIC8vIHVzZSBIVE1MNSBBdWRpbygpIHdoZXJlIEFQSSBpcyBzdXBwb3J0ZWQgKG1vc3QgU2FmYXJpLCBDaHJvbWUgdmVyc2lvbnMpLCBGaXJlZm94IChNUDMvTVA0IHN1cHBvcnQgdmFyaWVzLikgSWRlYWxseSwgdHJhbnNwYXJlbnQgdnMuIEZsYXNoIEFQSSB3aGVyZSBwb3NzaWJsZS5cclxuICAgICdmb3JjZVVzZUdsb2JhbEhUTUw1QXVkaW8nOiBmYWxzZSwgIC8vIGlmIHRydWUsIGEgc2luZ2xlIEF1ZGlvKCkgb2JqZWN0IGlzIHVzZWQgZm9yIGFsbCBzb3VuZHMgLSBhbmQgb25seSBvbmUgY2FuIHBsYXkgYXQgYSB0aW1lLlxyXG4gICAgJ2lnbm9yZU1vYmlsZVJlc3RyaWN0aW9ucyc6IGZhbHNlLCAgLy8gaWYgdHJ1ZSwgU00yIHdpbGwgbm90IGFwcGx5IGdsb2JhbCBIVE1MNSBhdWRpbyBydWxlcyB0byBtb2JpbGUgVUFzLiBpT1MgPiA3IGFuZCBXZWJWaWV3cyBtYXkgYWxsb3cgbXVsdGlwbGUgQXVkaW8oKSBpbnN0YW5jZXMuXHJcbiAgICAnaHRtbDVUZXN0JzogL14ocHJvYmFibHl8bWF5YmUpJC9pLCAvLyBIVE1MNSBBdWRpbygpIGZvcm1hdCBzdXBwb3J0IHRlc3QuIFVzZSAvXnByb2JhYmx5JC9pOyBpZiB5b3Ugd2FudCB0byBiZSBtb3JlIGNvbnNlcnZhdGl2ZS5cclxuICAgICdwcmVmZXJGbGFzaCc6IGZhbHNlLCAgICAgICAgICAgICAgIC8vIG92ZXJyaWRlcyB1c2VIVE1MNWF1ZGlvLCB3aWxsIHVzZSBGbGFzaCBmb3IgTVAzL01QNC9BQUMgaWYgcHJlc2VudC4gUG90ZW50aWFsIG9wdGlvbiBpZiBIVE1MNSBwbGF5YmFjayB3aXRoIHRoZXNlIGZvcm1hdHMgaXMgcXVpcmt5LlxyXG4gICAgJ25vU1dGQ2FjaGUnOiBmYWxzZSwgICAgICAgICAgICAgICAgLy8gaWYgdHJ1ZSwgYXBwZW5kcyA/dHM9e2RhdGV9IHRvIGJyZWFrIGFnZ3Jlc3NpdmUgU1dGIGNhY2hpbmcuXHJcbiAgICAnaWRQcmVmaXgnOiAnc291bmQnICAgICAgICAgICAgICAgICAvLyBpZiBhbiBpZCBpcyBub3QgcHJvdmlkZWQgdG8gY3JlYXRlU291bmQoKSwgdGhpcyBwcmVmaXggaXMgdXNlZCBmb3IgZ2VuZXJhdGVkIElEcyAtICdzb3VuZDAnLCAnc291bmQxJyBldGMuXHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuZGVmYXVsdE9wdGlvbnMgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZGVmYXVsdCBjb25maWd1cmF0aW9uIGZvciBzb3VuZCBvYmplY3RzIG1hZGUgd2l0aCBjcmVhdGVTb3VuZCgpIGFuZCByZWxhdGVkIG1ldGhvZHNcclxuICAgICAqIGVnLiwgdm9sdW1lLCBhdXRvLWxvYWQgYmVoYXZpb3VyIGFuZCBzbyBmb3J0aFxyXG4gICAgICovXHJcblxyXG4gICAgJ2F1dG9Mb2FkJzogZmFsc2UsICAgICAgICAvLyBlbmFibGUgYXV0b21hdGljIGxvYWRpbmcgKG90aGVyd2lzZSAubG9hZCgpIHdpbGwgYmUgY2FsbGVkIG9uIGRlbWFuZCB3aXRoIC5wbGF5KCksIHRoZSBsYXR0ZXIgYmVpbmcgbmljZXIgb24gYmFuZHdpZHRoIC0gaWYgeW91IHdhbnQgdG8gLmxvYWQgeW91cnNlbGYsIHlvdSBhbHNvIGNhbilcclxuICAgICdhdXRvUGxheSc6IGZhbHNlLCAgICAgICAgLy8gZW5hYmxlIHBsYXlpbmcgb2YgZmlsZSBhcyBzb29uIGFzIHBvc3NpYmxlIChtdWNoIGZhc3RlciBpZiBcInN0cmVhbVwiIGlzIHRydWUpXHJcbiAgICAnZnJvbSc6IG51bGwsICAgICAgICAgICAgIC8vIHBvc2l0aW9uIHRvIHN0YXJ0IHBsYXliYWNrIHdpdGhpbiBhIHNvdW5kIChtc2VjKSwgZGVmYXVsdCA9IGJlZ2lubmluZ1xyXG4gICAgJ2xvb3BzJzogMSwgICAgICAgICAgICAgICAvLyBob3cgbWFueSB0aW1lcyB0byByZXBlYXQgdGhlIHNvdW5kIChwb3NpdGlvbiB3aWxsIHdyYXAgYXJvdW5kIHRvIDAsIHNldFBvc2l0aW9uKCkgd2lsbCBicmVhayBvdXQgb2YgbG9vcCB3aGVuID4wKVxyXG4gICAgJ29uaWQzJzogbnVsbCwgICAgICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3IgXCJJRDMgZGF0YSBpcyBhZGRlZC9hdmFpbGFibGVcIlxyXG4gICAgJ29ubG9hZCc6IG51bGwsICAgICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3IgXCJsb2FkIGZpbmlzaGVkXCJcclxuICAgICd3aGlsZWxvYWRpbmcnOiBudWxsLCAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIFwiZG93bmxvYWQgcHJvZ3Jlc3MgdXBkYXRlXCIgKFggb2YgWSBieXRlcyByZWNlaXZlZClcclxuICAgICdvbnBsYXknOiBudWxsLCAgICAgICAgICAgLy8gY2FsbGJhY2sgZm9yIFwicGxheVwiIHN0YXJ0XHJcbiAgICAnb25wYXVzZSc6IG51bGwsICAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBcInBhdXNlXCJcclxuICAgICdvbnJlc3VtZSc6IG51bGwsICAgICAgICAgLy8gY2FsbGJhY2sgZm9yIFwicmVzdW1lXCIgKHBhdXNlIHRvZ2dsZSlcclxuICAgICd3aGlsZXBsYXlpbmcnOiBudWxsLCAgICAgLy8gY2FsbGJhY2sgZHVyaW5nIHBsYXkgKHBvc2l0aW9uIHVwZGF0ZSlcclxuICAgICdvbnBvc2l0aW9uJzogbnVsbCwgICAgICAgLy8gb2JqZWN0IGNvbnRhaW5pbmcgdGltZXMgYW5kIGZ1bmN0aW9uIGNhbGxiYWNrcyBmb3IgcG9zaXRpb25zIG9mIGludGVyZXN0XHJcbiAgICAnb25zdG9wJzogbnVsbCwgICAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBcInVzZXIgc3RvcFwiXHJcbiAgICAnb25mYWlsdXJlJzogbnVsbCwgICAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB3aGVuIHBsYXlpbmcgZmFpbHNcclxuICAgICdvbmZpbmlzaCc6IG51bGwsICAgICAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIFwic291bmQgZmluaXNoZWQgcGxheWluZ1wiXHJcbiAgICAnbXVsdGlTaG90JzogdHJ1ZSwgICAgICAgIC8vIGxldCBzb3VuZHMgXCJyZXN0YXJ0XCIgb3IgbGF5ZXIgb24gdG9wIG9mIGVhY2ggb3RoZXIgd2hlbiBwbGF5ZWQgbXVsdGlwbGUgdGltZXMsIHJhdGhlciB0aGFuIG9uZS1zaG90L29uZSBhdCBhIHRpbWVcclxuICAgICdtdWx0aVNob3RFdmVudHMnOiBmYWxzZSwgLy8gZmlyZSBtdWx0aXBsZSBzb3VuZCBldmVudHMgKGN1cnJlbnRseSBvbmZpbmlzaCgpIG9ubHkpIHdoZW4gbXVsdGlTaG90IGlzIGVuYWJsZWRcclxuICAgICdwb3NpdGlvbic6IG51bGwsICAgICAgICAgLy8gb2Zmc2V0IChtaWxsaXNlY29uZHMpIHRvIHNlZWsgdG8gd2l0aGluIGxvYWRlZCBzb3VuZCBkYXRhLlxyXG4gICAgJ3Bhbic6IDAsICAgICAgICAgICAgICAgICAvLyBcInBhblwiIHNldHRpbmdzLCBsZWZ0LXRvLXJpZ2h0LCAtMTAwIHRvIDEwMFxyXG4gICAgJ3N0cmVhbSc6IHRydWUsICAgICAgICAgICAvLyBhbGxvd3MgcGxheWluZyBiZWZvcmUgZW50aXJlIGZpbGUgaGFzIGxvYWRlZCAocmVjb21tZW5kZWQpXHJcbiAgICAndG8nOiBudWxsLCAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uIHRvIGVuZCBwbGF5YmFjayB3aXRoaW4gYSBzb3VuZCAobXNlYyksIGRlZmF1bHQgPSBlbmRcclxuICAgICd0eXBlJzogbnVsbCwgICAgICAgICAgICAgLy8gTUlNRS1saWtlIGhpbnQgZm9yIGZpbGUgcGF0dGVybiAvIGNhblBsYXkoKSB0ZXN0cywgZWcuIGF1ZGlvL21wM1xyXG4gICAgJ3VzZVBvbGljeUZpbGUnOiBmYWxzZSwgICAvLyBlbmFibGUgY3Jvc3Nkb21haW4ueG1sIHJlcXVlc3QgZm9yIGF1ZGlvIG9uIHJlbW90ZSBkb21haW5zIChmb3IgSUQzL3dhdmVmb3JtIGFjY2VzcylcclxuICAgICd2b2x1bWUnOiAxMDAgICAgICAgICAgICAgLy8gc2VsZi1leHBsYW5hdG9yeS4gMC0xMDAsIHRoZSBsYXR0ZXIgYmVpbmcgdGhlIG1heC5cclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5mbGFzaDlPcHRpb25zID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmxhc2ggOS1vbmx5IG9wdGlvbnMsXHJcbiAgICAgKiBtZXJnZWQgaW50byBkZWZhdWx0T3B0aW9ucyBpZiBmbGFzaCA5IGlzIGJlaW5nIHVzZWRcclxuICAgICAqL1xyXG5cclxuICAgICdpc01vdmllU3Rhcic6IG51bGwsICAgICAgLy8gXCJNb3ZpZVN0YXJcIiBNUEVHNCBhdWRpbyBtb2RlLiBOdWxsIChkZWZhdWx0KSA9IGF1dG8gZGV0ZWN0IE1QNCwgQUFDIGV0Yy4gYmFzZWQgb24gVVJMLiB0cnVlID0gZm9yY2Ugb24sIGlnbm9yZSBVUkxcclxuICAgICd1c2VQZWFrRGF0YSc6IGZhbHNlLCAgICAgLy8gZW5hYmxlIGxlZnQvcmlnaHQgY2hhbm5lbCBwZWFrIChsZXZlbCkgZGF0YVxyXG4gICAgJ3VzZVdhdmVmb3JtRGF0YSc6IGZhbHNlLCAvLyBlbmFibGUgc291bmQgc3BlY3RydW0gKHJhdyB3YXZlZm9ybSBkYXRhKSAtIE5PVEU6IE1heSBpbmNyZWFzZSBDUFUgbG9hZC5cclxuICAgICd1c2VFUURhdGEnOiBmYWxzZSwgICAgICAgLy8gZW5hYmxlIHNvdW5kIEVRIChmcmVxdWVuY3kgc3BlY3RydW0gZGF0YSkgLSBOT1RFOiBNYXkgaW5jcmVhc2UgQ1BVIGxvYWQuXHJcbiAgICAnb25idWZmZXJjaGFuZ2UnOiBudWxsLCAgIC8vIGNhbGxiYWNrIGZvciBcImlzQnVmZmVyaW5nXCIgcHJvcGVydHkgY2hhbmdlXHJcbiAgICAnb25kYXRhZXJyb3InOiBudWxsICAgICAgIC8vIGNhbGxiYWNrIGZvciB3YXZlZm9ybS9lcSBkYXRhIGFjY2VzcyBlcnJvciAoZmxhc2ggcGxheWluZyBhdWRpbyBpbiBvdGhlciB0YWJzL2RvbWFpbnMpXHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMubW92aWVTdGFyT3B0aW9ucyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGZsYXNoIDkuMHIxMTUrIE1QRUc0IGF1ZGlvIG9wdGlvbnMsXHJcbiAgICAgKiBtZXJnZWQgaW50byBkZWZhdWx0T3B0aW9ucyBpZiBmbGFzaCA5K21vdmllU3RhciBtb2RlIGlzIGVuYWJsZWRcclxuICAgICAqL1xyXG5cclxuICAgICdidWZmZXJUaW1lJzogMywgICAgICAgICAgLy8gc2Vjb25kcyBvZiBkYXRhIHRvIGJ1ZmZlciBiZWZvcmUgcGxheWJhY2sgYmVnaW5zIChudWxsID0gZmxhc2ggZGVmYXVsdCBvZiAwLjEgc2Vjb25kcyAtIGlmIEFBQyBwbGF5YmFjayBpcyBnYXBweSwgdHJ5IGluY3JlYXNpbmcuKVxyXG4gICAgJ3NlcnZlclVSTCc6IG51bGwsICAgICAgICAvLyBydG1wOiBGTVMgb3IgRk1JUyBzZXJ2ZXIgdG8gY29ubmVjdCB0bywgcmVxdWlyZWQgd2hlbiByZXF1ZXN0aW5nIG1lZGlhIHZpYSBSVE1QIG9yIG9uZSBvZiBpdHMgdmFyaWFudHNcclxuICAgICdvbmNvbm5lY3QnOiBudWxsLCAgICAgICAgLy8gcnRtcDogY2FsbGJhY2sgZm9yIGNvbm5lY3Rpb24gdG8gZmxhc2ggbWVkaWEgc2VydmVyXHJcbiAgICAnZHVyYXRpb24nOiBudWxsICAgICAgICAgIC8vIHJ0bXA6IHNvbmcgZHVyYXRpb24gKG1zZWMpXHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuYXVkaW9Gb3JtYXRzID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGV0ZXJtaW5lcyBIVE1MNSBzdXBwb3J0ICsgZmxhc2ggcmVxdWlyZW1lbnRzLlxyXG4gICAgICogaWYgbm8gc3VwcG9ydCAodmlhIGZsYXNoIGFuZC9vciBIVE1MNSkgZm9yIGEgXCJyZXF1aXJlZFwiIGZvcm1hdCwgU00yIHdpbGwgZmFpbCB0byBzdGFydC5cclxuICAgICAqIGZsYXNoIGZhbGxiYWNrIGlzIHVzZWQgZm9yIE1QMyBvciBNUDQgaWYgSFRNTDUgY2FuJ3QgcGxheSBpdCAob3IgaWYgcHJlZmVyRmxhc2ggPSB0cnVlKVxyXG4gICAgICovXHJcblxyXG4gICAgJ21wMyc6IHtcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL21wZWc7IGNvZGVjcz1cIm1wM1wiJywgJ2F1ZGlvL21wZWcnLCAnYXVkaW8vbXAzJywgJ2F1ZGlvL01QQScsICdhdWRpby9tcGEtcm9idXN0J10sXHJcbiAgICAgICdyZXF1aXJlZCc6IHRydWVcclxuICAgIH0sXHJcblxyXG4gICAgJ21wNCc6IHtcclxuICAgICAgJ3JlbGF0ZWQnOiBbJ2FhYycsJ200YScsJ200YiddLCAvLyBhZGRpdGlvbmFsIGZvcm1hdHMgdW5kZXIgdGhlIE1QNCBjb250YWluZXJcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL21wNDsgY29kZWNzPVwibXA0YS40MC4yXCInLCAnYXVkaW8vYWFjJywgJ2F1ZGlvL3gtbTRhJywgJ2F1ZGlvL01QNEEtTEFUTScsICdhdWRpby9tcGVnNC1nZW5lcmljJ10sXHJcbiAgICAgICdyZXF1aXJlZCc6IGZhbHNlXHJcbiAgICB9LFxyXG5cclxuICAgICdvZ2cnOiB7XHJcbiAgICAgICd0eXBlJzogWydhdWRpby9vZ2c7IGNvZGVjcz12b3JiaXMnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogZmFsc2VcclxuICAgIH0sXHJcblxyXG4gICAgJ29wdXMnOiB7XHJcbiAgICAgICd0eXBlJzogWydhdWRpby9vZ2c7IGNvZGVjcz1vcHVzJywgJ2F1ZGlvL29wdXMnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogZmFsc2VcclxuICAgIH0sXHJcblxyXG4gICAgJ3dhdic6IHtcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL3dhdjsgY29kZWNzPVwiMVwiJywgJ2F1ZGlvL3dhdicsICdhdWRpby93YXZlJywgJ2F1ZGlvL3gtd2F2J10sXHJcbiAgICAgICdyZXF1aXJlZCc6IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIEhUTUwgYXR0cmlidXRlcyAoaWQgKyBjbGFzcyBuYW1lcykgZm9yIHRoZSBTV0YgY29udGFpbmVyXHJcblxyXG4gIHRoaXMubW92aWVJRCA9ICdzbTItY29udGFpbmVyJztcclxuICB0aGlzLmlkID0gKHNtSUQgfHwgJ3NtMm1vdmllJyk7XHJcblxyXG4gIHRoaXMuZGVidWdJRCA9ICdzb3VuZG1hbmFnZXItZGVidWcnO1xyXG4gIHRoaXMuZGVidWdVUkxQYXJhbSA9IC8oWyM/Jl0pZGVidWc9MS9pO1xyXG5cclxuICAvLyBkeW5hbWljIGF0dHJpYnV0ZXNcclxuXHJcbiAgdGhpcy52ZXJzaW9uTnVtYmVyID0gJ1YyLjk3YS4yMDE1MDYwMSc7XHJcbiAgdGhpcy52ZXJzaW9uID0gbnVsbDtcclxuICB0aGlzLm1vdmllVVJMID0gbnVsbDtcclxuICB0aGlzLmFsdFVSTCA9IG51bGw7XHJcbiAgdGhpcy5zd2ZMb2FkZWQgPSBmYWxzZTtcclxuICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLm9NQyA9IG51bGw7XHJcbiAgdGhpcy5zb3VuZHMgPSB7fTtcclxuICB0aGlzLnNvdW5kSURzID0gW107XHJcbiAgdGhpcy5tdXRlZCA9IGZhbHNlO1xyXG4gIHRoaXMuZGlkRmxhc2hCbG9jayA9IGZhbHNlO1xyXG4gIHRoaXMuZmlsZVBhdHRlcm4gPSBudWxsO1xyXG5cclxuICB0aGlzLmZpbGVQYXR0ZXJucyA9IHtcclxuICAgICdmbGFzaDgnOiAvXFwubXAzKFxcPy4qKT8kL2ksXHJcbiAgICAnZmxhc2g5JzogL1xcLm1wMyhcXD8uKik/JC9pXHJcbiAgfTtcclxuXHJcbiAgLy8gc3VwcG9ydCBpbmRpY2F0b3JzLCBzZXQgYXQgaW5pdFxyXG5cclxuICB0aGlzLmZlYXR1cmVzID0ge1xyXG4gICAgJ2J1ZmZlcmluZyc6IGZhbHNlLFxyXG4gICAgJ3BlYWtEYXRhJzogZmFsc2UsXHJcbiAgICAnd2F2ZWZvcm1EYXRhJzogZmFsc2UsXHJcbiAgICAnZXFEYXRhJzogZmFsc2UsXHJcbiAgICAnbW92aWVTdGFyJzogZmFsc2VcclxuICB9O1xyXG5cclxuICAvLyBmbGFzaCBzYW5kYm94IGluZm8sIHVzZWQgcHJpbWFyaWx5IGluIHRyb3VibGVzaG9vdGluZ1xyXG5cclxuICB0aGlzLnNhbmRib3ggPSB7XHJcbiAgICAvLyA8ZD5cclxuICAgICd0eXBlJzogbnVsbCxcclxuICAgICd0eXBlcyc6IHtcclxuICAgICAgJ3JlbW90ZSc6ICdyZW1vdGUgKGRvbWFpbi1iYXNlZCkgcnVsZXMnLFxyXG4gICAgICAnbG9jYWxXaXRoRmlsZSc6ICdsb2NhbCB3aXRoIGZpbGUgYWNjZXNzIChubyBpbnRlcm5ldCBhY2Nlc3MpJyxcclxuICAgICAgJ2xvY2FsV2l0aE5ldHdvcmsnOiAnbG9jYWwgd2l0aCBuZXR3b3JrIChpbnRlcm5ldCBhY2Nlc3Mgb25seSwgbm8gbG9jYWwgYWNjZXNzKScsXHJcbiAgICAgICdsb2NhbFRydXN0ZWQnOiAnbG9jYWwsIHRydXN0ZWQgKGxvY2FsK2ludGVybmV0IGFjY2VzcyknXHJcbiAgICB9LFxyXG4gICAgJ2Rlc2NyaXB0aW9uJzogbnVsbCxcclxuICAgICdub1JlbW90ZSc6IG51bGwsXHJcbiAgICAnbm9Mb2NhbCc6IG51bGxcclxuICAgIC8vIDwvZD5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBmb3JtYXQgc3VwcG9ydCAoaHRtbDUvZmxhc2gpXHJcbiAgICogc3RvcmVzIGNhblBsYXlUeXBlKCkgcmVzdWx0cyBiYXNlZCBvbiBhdWRpb0Zvcm1hdHMuXHJcbiAgICogZWcuIHsgbXAzOiBib29sZWFuLCBtcDQ6IGJvb2xlYW4gfVxyXG4gICAqIHRyZWF0IGFzIHJlYWQtb25seS5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5odG1sNSA9IHtcclxuICAgICd1c2luZ0ZsYXNoJzogbnVsbCAvLyBzZXQgaWYvd2hlbiBmbGFzaCBmYWxsYmFjayBpcyBuZWVkZWRcclxuICB9O1xyXG5cclxuICAvLyBmaWxlIHR5cGUgc3VwcG9ydCBoYXNoXHJcbiAgdGhpcy5mbGFzaCA9IHt9O1xyXG5cclxuICAvLyBkZXRlcm1pbmVkIGF0IGluaXQgdGltZVxyXG4gIHRoaXMuaHRtbDVPbmx5ID0gZmFsc2U7XHJcblxyXG4gIC8vIHVzZWQgZm9yIHNwZWNpYWwgY2FzZXMgKGVnLiBpUGFkL2lQaG9uZS9wYWxtIE9TPylcclxuICB0aGlzLmlnbm9yZUZsYXNoID0gZmFsc2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIGEgZmV3IHByaXZhdGUgaW50ZXJuYWxzIChPSywgYSBsb3QuIDpEKVxyXG4gICAqL1xyXG5cclxuICB2YXIgU01Tb3VuZCxcclxuICBzbTIgPSB0aGlzLCBnbG9iYWxIVE1MNUF1ZGlvID0gbnVsbCwgZmxhc2ggPSBudWxsLCBzbSA9ICdzb3VuZE1hbmFnZXInLCBzbWMgPSBzbSArICc6ICcsIGg1ID0gJ0hUTUw1OjonLCBpZCwgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LCB3bCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnRvU3RyaW5nKCksIGRvYyA9IGRvY3VtZW50LCBkb05vdGhpbmcsIHNldFByb3BlcnRpZXMsIGluaXQsIGZWLCBvbl9xdWV1ZSA9IFtdLCBkZWJ1Z09wZW4gPSB0cnVlLCBkZWJ1Z1RTLCBkaWRBcHBlbmQgPSBmYWxzZSwgYXBwZW5kU3VjY2VzcyA9IGZhbHNlLCBkaWRJbml0ID0gZmFsc2UsIGRpc2FibGVkID0gZmFsc2UsIHdpbmRvd0xvYWRlZCA9IGZhbHNlLCBfd0RTLCB3ZENvdW50ID0gMCwgaW5pdENvbXBsZXRlLCBtaXhpbiwgYXNzaWduLCBleHRyYU9wdGlvbnMsIGFkZE9uRXZlbnQsIHByb2Nlc3NPbkV2ZW50cywgaW5pdFVzZXJPbmxvYWQsIGRlbGF5V2FpdEZvckVJLCB3YWl0Rm9yRUksIHJlYm9vdEludG9IVE1MNSwgc2V0VmVyc2lvbkluZm8sIGhhbmRsZUZvY3VzLCBzdHJpbmdzLCBpbml0TW92aWUsIGRvbUNvbnRlbnRMb2FkZWQsIHdpbk9uTG9hZCwgZGlkRENMb2FkZWQsIGdldERvY3VtZW50LCBjcmVhdGVNb3ZpZSwgY2F0Y2hFcnJvciwgc2V0UG9sbGluZywgaW5pdERlYnVnLCBkZWJ1Z0xldmVscyA9IFsnbG9nJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddLCBkZWZhdWx0Rmxhc2hWZXJzaW9uID0gOCwgZGlzYWJsZU9iamVjdCwgZmFpbFNhZmVseSwgbm9ybWFsaXplTW92aWVVUkwsIG9SZW1vdmVkID0gbnVsbCwgb1JlbW92ZWRIVE1MID0gbnVsbCwgc3RyLCBmbGFzaEJsb2NrSGFuZGxlciwgZ2V0U1dGQ1NTLCBzd2ZDU1MsIHRvZ2dsZURlYnVnLCBsb29wRml4LCBwb2xpY3lGaXgsIGNvbXBsYWluLCBpZENoZWNrLCB3YWl0aW5nRm9yRUkgPSBmYWxzZSwgaW5pdFBlbmRpbmcgPSBmYWxzZSwgc3RhcnRUaW1lciwgc3RvcFRpbWVyLCB0aW1lckV4ZWN1dGUsIGg1VGltZXJDb3VudCA9IDAsIGg1SW50ZXJ2YWxUaW1lciA9IG51bGwsIHBhcnNlVVJMLCBtZXNzYWdlcyA9IFtdLFxyXG4gIGNhbklnbm9yZUZsYXNoLCBuZWVkc0ZsYXNoID0gbnVsbCwgZmVhdHVyZUNoZWNrLCBodG1sNU9LLCBodG1sNUNhblBsYXksIGh0bWw1RXh0LCBodG1sNVVubG9hZCwgZG9tQ29udGVudExvYWRlZElFLCB0ZXN0SFRNTDUsIGV2ZW50LCBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZSwgdXNlR2xvYmFsSFRNTDVBdWRpbyA9IGZhbHNlLCBsYXN0R2xvYmFsSFRNTDVVUkwsIGhhc0ZsYXNoLCBkZXRlY3RGbGFzaCwgYmFkU2FmYXJpRml4LCBodG1sNV9ldmVudHMsIHNob3dTdXBwb3J0LCBmbHVzaE1lc3NhZ2VzLCB3cmFwQ2FsbGJhY2ssIGlkQ291bnRlciA9IDAsIGRpZFNldHVwLCBtc2VjU2NhbGUgPSAxMDAwLFxyXG4gIGlzX2lEZXZpY2UgPSB1YS5tYXRjaCgvKGlwYWR8aXBob25lfGlwb2QpL2kpLCBpc0FuZHJvaWQgPSB1YS5tYXRjaCgvYW5kcm9pZC9pKSwgaXNJRSA9IHVhLm1hdGNoKC9tc2llL2kpLFxyXG4gIGlzV2Via2l0ID0gdWEubWF0Y2goL3dlYmtpdC9pKSxcclxuICBpc1NhZmFyaSA9ICh1YS5tYXRjaCgvc2FmYXJpL2kpICYmICF1YS5tYXRjaCgvY2hyb21lL2kpKSxcclxuICBpc09wZXJhID0gKHVhLm1hdGNoKC9vcGVyYS9pKSksXHJcbiAgbW9iaWxlSFRNTDUgPSAodWEubWF0Y2goLyhtb2JpbGV8cHJlXFwvfHhvb20pL2kpIHx8IGlzX2lEZXZpY2UgfHwgaXNBbmRyb2lkKSxcclxuICBpc0JhZFNhZmFyaSA9ICghd2wubWF0Y2goL3VzZWh0bWw1YXVkaW8vaSkgJiYgIXdsLm1hdGNoKC9zbTJcXC1pZ25vcmViYWR1YS9pKSAmJiBpc1NhZmFyaSAmJiAhdWEubWF0Y2goL3NpbGsvaSkgJiYgdWEubWF0Y2goL09TIFggMTBfNl8oWzMtN10pL2kpKSwgLy8gU2FmYXJpIDQgYW5kIDUgKGV4Y2x1ZGluZyBLaW5kbGUgRmlyZSwgXCJTaWxrXCIpIG9jY2FzaW9uYWxseSBmYWlsIHRvIGxvYWQvcGxheSBIVE1MNSBhdWRpbyBvbiBTbm93IExlb3BhcmQgMTAuNi4zIHRocm91Z2ggMTAuNi43IGR1ZSB0byBidWcocykgaW4gUXVpY2tUaW1lIFggYW5kL29yIG90aGVyIHVuZGVybHlpbmcgZnJhbWV3b3Jrcy4gOi8gQ29uZmlybWVkIGJ1Zy4gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTMyMTU5XHJcbiAgaGFzQ29uc29sZSA9ICh3aW5kb3cuY29uc29sZSAhPT0gX3VuZGVmaW5lZCAmJiBjb25zb2xlLmxvZyAhPT0gX3VuZGVmaW5lZCksXHJcbiAgaXNGb2N1c2VkID0gKGRvYy5oYXNGb2N1cyAhPT0gX3VuZGVmaW5lZCA/IGRvYy5oYXNGb2N1cygpIDogbnVsbCksXHJcbiAgdHJ5SW5pdE9uRm9jdXMgPSAoaXNTYWZhcmkgJiYgKGRvYy5oYXNGb2N1cyA9PT0gX3VuZGVmaW5lZCB8fCAhZG9jLmhhc0ZvY3VzKCkpKSxcclxuICBva1RvRGlzYWJsZSA9ICF0cnlJbml0T25Gb2N1cyxcclxuICBmbGFzaE1JTUUgPSAvKG1wM3xtcDR8bXBhfG00YXxtNGIpL2ksXHJcbiAgZW1wdHlVUkwgPSAnYWJvdXQ6YmxhbmsnLCAvLyBzYWZlIFVSTCB0byB1bmxvYWQsIG9yIGxvYWQgbm90aGluZyBmcm9tIChmbGFzaCA4ICsgbW9zdCBIVE1MNSBVQXMpXHJcbiAgZW1wdHlXQVYgPSAnZGF0YTphdWRpby93YXZlO2Jhc2U2NCwvVWtsR1JpWUFBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlRSUFBQUQvL3c9PScsIC8vIHRpbnkgV0FWIGZvciBIVE1MNSB1bmxvYWRpbmdcclxuICBvdmVySFRUUCA9IChkb2MubG9jYXRpb24gPyBkb2MubG9jYXRpb24ucHJvdG9jb2wubWF0Y2goL2h0dHAvaSkgOiBudWxsKSxcclxuICBodHRwID0gKCFvdmVySFRUUCA/ICdodHRwOi8nKycvJyA6ICcnKSxcclxuICAvLyBtcDMsIG1wNCwgYWFjIGV0Yy5cclxuICBuZXRTdHJlYW1NaW1lVHlwZXMgPSAvXlxccyphdWRpb1xcLyg/OngtKT8oPzptcGVnNHxhYWN8Zmx2fG1vdnxtcDR8fG00dnxtNGF8bTRifG1wNHZ8M2dwfDNnMilcXHMqKD86JHw7KS9pLFxyXG4gIC8vIEZsYXNoIHY5LjByMTE1KyBcIm1vdmllc3RhclwiIGZvcm1hdHNcclxuICBuZXRTdHJlYW1UeXBlcyA9IFsnbXBlZzQnLCAnYWFjJywgJ2ZsdicsICdtb3YnLCAnbXA0JywgJ200dicsICdmNHYnLCAnbTRhJywgJ200YicsICdtcDR2JywgJzNncCcsICczZzInXSxcclxuICBuZXRTdHJlYW1QYXR0ZXJuID0gbmV3IFJlZ0V4cCgnXFxcXC4oJyArIG5ldFN0cmVhbVR5cGVzLmpvaW4oJ3wnKSArICcpKFxcXFw/LiopPyQnLCAnaScpO1xyXG5cclxuICB0aGlzLm1pbWVQYXR0ZXJuID0gL15cXHMqYXVkaW9cXC8oPzp4LSk/KD86bXAoPzplZ3wzKSlcXHMqKD86JHw7KS9pOyAvLyBkZWZhdWx0IG1wMyBzZXRcclxuXHJcbiAgLy8gdXNlIGFsdFVSTCBpZiBub3QgXCJvbmxpbmVcIlxyXG4gIHRoaXMudXNlQWx0VVJMID0gIW92ZXJIVFRQO1xyXG5cclxuICBzd2ZDU1MgPSB7XHJcbiAgICAnc3dmQm94JzogJ3NtMi1vYmplY3QtYm94JyxcclxuICAgICdzd2ZEZWZhdWx0JzogJ21vdmllQ29udGFpbmVyJyxcclxuICAgICdzd2ZFcnJvcic6ICdzd2ZfZXJyb3InLCAvLyBTV0YgbG9hZGVkLCBidXQgU00yIGNvdWxkbid0IHN0YXJ0IChvdGhlciBlcnJvcilcclxuICAgICdzd2ZUaW1lZG91dCc6ICdzd2ZfdGltZWRvdXQnLFxyXG4gICAgJ3N3ZkxvYWRlZCc6ICdzd2ZfbG9hZGVkJyxcclxuICAgICdzd2ZVbmJsb2NrZWQnOiAnc3dmX3VuYmxvY2tlZCcsIC8vIG9yIGxvYWRlZCBPS1xyXG4gICAgJ3NtMkRlYnVnJzogJ3NtMl9kZWJ1ZycsXHJcbiAgICAnaGlnaFBlcmYnOiAnaGlnaF9wZXJmb3JtYW5jZScsXHJcbiAgICAnZmxhc2hEZWJ1Zyc6ICdmbGFzaF9kZWJ1ZydcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBiYXNpYyBIVE1MNSBBdWRpbygpIHN1cHBvcnQgdGVzdFxyXG4gICAqIHRyeS4uLmNhdGNoIGJlY2F1c2Ugb2YgSUUgOSBcIm5vdCBpbXBsZW1lbnRlZFwiIG5vbnNlbnNlXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzIyNFxyXG4gICAqL1xyXG5cclxuICB0aGlzLmhhc0hUTUw1ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gbmV3IEF1ZGlvKG51bGwpIGZvciBzdHVwaWQgT3BlcmEgOS42NCBjYXNlLCB3aGljaCB0aHJvd3Mgbm90X2Vub3VnaF9hcmd1bWVudHMgZXhjZXB0aW9uIG90aGVyd2lzZS5cclxuICAgICAgcmV0dXJuIChBdWRpbyAhPT0gX3VuZGVmaW5lZCAmJiAoaXNPcGVyYSAmJiBvcGVyYSAhPT0gX3VuZGVmaW5lZCAmJiBvcGVyYS52ZXJzaW9uKCkgPCAxMCA/IG5ldyBBdWRpbyhudWxsKSA6IG5ldyBBdWRpbygpKS5jYW5QbGF5VHlwZSAhPT0gX3VuZGVmaW5lZCk7XHJcbiAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0oKSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFB1YmxpYyBTb3VuZE1hbmFnZXIgQVBJXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlcyB0b3AtbGV2ZWwgc291bmRNYW5hZ2VyIHByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBPcHRpb24gcGFyYW1ldGVycywgZWcuIHsgZmxhc2hWZXJzaW9uOiA5LCB1cmw6ICcvcGF0aC90by9zd2ZzLycgfVxyXG4gICAqIG9ucmVhZHkgYW5kIG9udGltZW91dCBhcmUgYWxzbyBhY2NlcHRlZCBwYXJhbWV0ZXJzLiBjYWxsIHNvdW5kTWFuYWdlci5zZXR1cCgpIHRvIHNlZSB0aGUgZnVsbCBsaXN0LlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldHVwID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cclxuICAgIHZhciBub1VSTCA9ICghc20yLnVybCk7XHJcblxyXG4gICAgLy8gd2FybiBpZiBmbGFzaCBvcHRpb25zIGhhdmUgYWxyZWFkeSBiZWVuIGFwcGxpZWRcclxuXHJcbiAgICBpZiAob3B0aW9ucyAhPT0gX3VuZGVmaW5lZCAmJiBkaWRJbml0ICYmIG5lZWRzRmxhc2ggJiYgc20yLm9rKCkgJiYgKG9wdGlvbnMuZmxhc2hWZXJzaW9uICE9PSBfdW5kZWZpbmVkIHx8IG9wdGlvbnMudXJsICE9PSBfdW5kZWZpbmVkIHx8IG9wdGlvbnMuaHRtbDVUZXN0ICE9PSBfdW5kZWZpbmVkKSkge1xyXG4gICAgICBjb21wbGFpbihzdHIoJ3NldHVwTGF0ZScpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBkZWZlcjogdHJ1ZT9cclxuXHJcbiAgICBhc3NpZ24ob3B0aW9ucyk7XHJcblxyXG4gICAgaWYgKCF1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICBpZiAobW9iaWxlSFRNTDUpIHtcclxuXHJcbiAgICAgICAgLy8gZm9yY2UgdGhlIHNpbmdsZXRvbiBIVE1MNSBwYXR0ZXJuIG9uIG1vYmlsZSwgYnkgZGVmYXVsdC5cclxuICAgICAgICBpZiAoIXNtMi5zZXR1cE9wdGlvbnMuaWdub3JlTW9iaWxlUmVzdHJpY3Rpb25zIHx8IHNtMi5zZXR1cE9wdGlvbnMuZm9yY2VVc2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoKHN0cmluZ3MuZ2xvYmFsSFRNTDUpO1xyXG4gICAgICAgICAgdXNlR2xvYmFsSFRNTDVBdWRpbyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gb25seSBhcHBseSBzaW5nbGV0b24gSFRNTDUgb24gZGVza3RvcCBpZiBmb3JjZWQuXHJcbiAgICAgICAgaWYgKHNtMi5zZXR1cE9wdGlvbnMuZm9yY2VVc2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoKHN0cmluZ3MuZ2xvYmFsSFRNTDUpO1xyXG4gICAgICAgICAgdXNlR2xvYmFsSFRNTDVBdWRpbyA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRpZFNldHVwICYmIG1vYmlsZUhUTUw1KSB7XHJcblxyXG4gICAgICBpZiAoc20yLnNldHVwT3B0aW9ucy5pZ25vcmVNb2JpbGVSZXN0cmljdGlvbnMpIHtcclxuICAgICAgICBcclxuICAgICAgICBtZXNzYWdlcy5wdXNoKHN0cmluZ3MuaWdub3JlTW9iaWxlKTtcclxuICAgICAgXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIHByZWZlciBIVE1MNSBmb3IgbW9iaWxlICsgdGFibGV0LWxpa2UgZGV2aWNlcywgcHJvYmFibHkgbW9yZSByZWxpYWJsZSB2cy4gZmxhc2ggYXQgdGhpcyBwb2ludC5cclxuXHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKCFzbTIuc2V0dXBPcHRpb25zLnVzZUhUTUw1QXVkaW8gfHwgc20yLnNldHVwT3B0aW9ucy5wcmVmZXJGbGFzaCkge1xyXG4gICAgICAgICAgLy8gbm90aWZ5IHRoYXQgZGVmYXVsdHMgYXJlIGJlaW5nIGNoYW5nZWQuXHJcbiAgICAgICAgICBzbTIuX3dEKHN0cmluZ3MubW9iaWxlVUEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICAgIHNtMi5zZXR1cE9wdGlvbnMudXNlSFRNTDVBdWRpbyA9IHRydWU7XHJcbiAgICAgICAgc20yLnNldHVwT3B0aW9ucy5wcmVmZXJGbGFzaCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoaXNfaURldmljZSkge1xyXG5cclxuICAgICAgICAgIC8vIG5vIGZsYXNoIGhlcmUuXHJcbiAgICAgICAgICBzbTIuaWdub3JlRmxhc2ggPSB0cnVlO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKChpc0FuZHJvaWQgJiYgIXVhLm1hdGNoKC9hbmRyb2lkXFxzMlxcLjMvaSkpIHx8ICFpc0FuZHJvaWQpIHtcclxuICAgICAgICBcclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogQW5kcm9pZCBkZXZpY2VzIHRlbmQgdG8gd29yayBiZXR0ZXIgd2l0aCBhIHNpbmdsZSBhdWRpbyBpbnN0YW5jZSwgc3BlY2lmaWNhbGx5IGZvciBjaGFpbmVkIHBsYXliYWNrIG9mIHNvdW5kcyBpbiBzZXF1ZW5jZS5cclxuICAgICAgICAgICAqIENvbW1vbiB1c2UgY2FzZTogZXhpdGluZyBzb3VuZCBvbmZpbmlzaCgpIC0+IGNyZWF0ZVNvdW5kKCkgLT4gcGxheSgpXHJcbiAgICAgICAgICAgKiBQcmVzdW1pbmcgc2ltaWxhciByZXN0cmljdGlvbnMgZm9yIG90aGVyIG1vYmlsZSwgbm9uLUFuZHJvaWQsIG5vbi1pT1MgZGV2aWNlcy5cclxuICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgIC8vIDxkPlxyXG4gICAgICAgICAgc20yLl93RChzdHJpbmdzLmdsb2JhbEhUTUw1KTtcclxuICAgICAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgICAgICB1c2VHbG9iYWxIVE1MNUF1ZGlvID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2UgMTogXCJMYXRlIHNldHVwXCIuIFNNMiBsb2FkZWQgbm9ybWFsbHksIGJ1dCB1c2VyIGRpZG4ndCBhc3NpZ24gZmxhc2ggVVJMIGVnLiwgc2V0dXAoe3VybDouLi59KSBiZWZvcmUgU00yIGluaXQuIFRyZWF0IGFzIGRlbGF5ZWQgaW5pdC5cclxuXHJcbiAgICBpZiAob3B0aW9ucykge1xyXG5cclxuICAgICAgaWYgKG5vVVJMICYmIGRpZERDTG9hZGVkICYmIG9wdGlvbnMudXJsICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgc20yLmJlZ2luRGVsYXllZEluaXQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc3BlY2lhbCBjYXNlIDI6IElmIGxhenktbG9hZGluZyBTTTIgKERPTUNvbnRlbnRMb2FkZWQgaGFzIGFscmVhZHkgaGFwcGVuZWQpIGFuZCB1c2VyIGNhbGxzIHNldHVwKCkgd2l0aCB1cmw6IHBhcmFtZXRlciwgdHJ5IHRvIGluaXQgQVNBUC5cclxuXHJcbiAgICAgIGlmICghZGlkRENMb2FkZWQgJiYgb3B0aW9ucy51cmwgIT09IF91bmRlZmluZWQgJiYgZG9jLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGRvbUNvbnRlbnRMb2FkZWQsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRpZFNldHVwID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gc20yO1xyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLm9rID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgcmV0dXJuIChuZWVkc0ZsYXNoID8gKGRpZEluaXQgJiYgIWRpc2FibGVkKSA6IChzbTIudXNlSFRNTDVBdWRpbyAmJiBzbTIuaGFzSFRNTDUpKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5zdXBwb3J0ZWQgPSB0aGlzLm9rOyAvLyBsZWdhY3lcclxuXHJcbiAgdGhpcy5nZXRNb3ZpZSA9IGZ1bmN0aW9uKHNtSUQpIHtcclxuXHJcbiAgICAvLyBzYWZldHkgbmV0OiBzb21lIG9sZCBicm93c2VycyBkaWZmZXIgb24gU1dGIHJlZmVyZW5jZXMsIHBvc3NpYmx5IHJlbGF0ZWQgdG8gRXh0ZXJuYWxJbnRlcmZhY2UgLyBmbGFzaCB2ZXJzaW9uXHJcbiAgICByZXR1cm4gaWQoc21JRCkgfHwgZG9jW3NtSURdIHx8IHdpbmRvd1tzbUlEXTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIFNNU291bmQgc291bmQgb2JqZWN0IGluc3RhbmNlLiBDYW4gYWxzbyBiZSBvdmVybG9hZGVkLCBlLmcuLCBjcmVhdGVTb3VuZCgnbXlTb3VuZCcsICcvc29tZS5tcDMnKTtcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBTb3VuZCBvcHRpb25zIChhdCBtaW5pbXVtLCB1cmwgcGFyYW1ldGVyIGlzIHJlcXVpcmVkLilcclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFNNU291bmQgVGhlIG5ldyBTTVNvdW5kIG9iamVjdC5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5jcmVhdGVTb3VuZCA9IGZ1bmN0aW9uKG9PcHRpb25zLCBfdXJsKSB7XHJcblxyXG4gICAgdmFyIGNzLCBjc19zdHJpbmcsIG9wdGlvbnMsIG9Tb3VuZCA9IG51bGw7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBjcyA9IHNtICsgJy5jcmVhdGVTb3VuZCgpOiAnO1xyXG4gICAgY3Nfc3RyaW5nID0gY3MgKyBzdHIoIWRpZEluaXQgPyAnbm90UmVhZHknIDogJ25vdE9LJyk7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgaWYgKCFkaWRJbml0IHx8ICFzbTIub2soKSkge1xyXG4gICAgICBjb21wbGFpbihjc19zdHJpbmcpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKF91cmwgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgLy8gZnVuY3Rpb24gb3ZlcmxvYWRpbmcgaW4gSlMhIDopIC4uLiBhc3N1bWUgc2ltcGxlIGNyZWF0ZVNvdW5kKGlkLCB1cmwpIHVzZSBjYXNlLlxyXG4gICAgICBvT3B0aW9ucyA9IHtcclxuICAgICAgICAnaWQnOiBvT3B0aW9ucyxcclxuICAgICAgICAndXJsJzogX3VybFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluaGVyaXQgZnJvbSBkZWZhdWx0T3B0aW9uc1xyXG4gICAgb3B0aW9ucyA9IG1peGluKG9PcHRpb25zKTtcclxuXHJcbiAgICBvcHRpb25zLnVybCA9IHBhcnNlVVJMKG9wdGlvbnMudXJsKTtcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBhbiBpZCwgaWYgbmVlZGVkLlxyXG4gICAgaWYgKG9wdGlvbnMuaWQgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgb3B0aW9ucy5pZCA9IHNtMi5zZXR1cE9wdGlvbnMuaWRQcmVmaXggKyAoaWRDb3VudGVyKyspO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKG9wdGlvbnMuaWQudG9TdHJpbmcoKS5jaGFyQXQoMCkubWF0Y2goL15bMC05XSQvKSkge1xyXG4gICAgICBzbTIuX3dEKGNzICsgc3RyKCdiYWRJRCcsIG9wdGlvbnMuaWQpLCAyKTtcclxuICAgIH1cclxuXHJcbiAgICBzbTIuX3dEKGNzICsgb3B0aW9ucy5pZCArIChvcHRpb25zLnVybCA/ICcgKCcgKyBvcHRpb25zLnVybCArICcpJyA6ICcnKSwgMSk7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgaWYgKGlkQ2hlY2sob3B0aW9ucy5pZCwgdHJ1ZSkpIHtcclxuICAgICAgc20yLl93RChjcyArIG9wdGlvbnMuaWQgKyAnIGV4aXN0cycsIDEpO1xyXG4gICAgICByZXR1cm4gc20yLnNvdW5kc1tvcHRpb25zLmlkXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtYWtlKCkge1xyXG5cclxuICAgICAgb3B0aW9ucyA9IGxvb3BGaXgob3B0aW9ucyk7XHJcbiAgICAgIHNtMi5zb3VuZHNbb3B0aW9ucy5pZF0gPSBuZXcgU01Tb3VuZChvcHRpb25zKTtcclxuICAgICAgc20yLnNvdW5kSURzLnB1c2gob3B0aW9ucy5pZCk7XHJcbiAgICAgIHJldHVybiBzbTIuc291bmRzW29wdGlvbnMuaWRdO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaHRtbDVPSyhvcHRpb25zKSkge1xyXG5cclxuICAgICAgb1NvdW5kID0gbWFrZSgpO1xyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKCFzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgICAgc20yLl93RChvcHRpb25zLmlkICsgJzogVXNpbmcgSFRNTDUnKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcbiAgICAgIG9Tb3VuZC5fc2V0dXBfaHRtbDUob3B0aW9ucyk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgICAgc20yLl93RChvcHRpb25zLmlkICsgJzogTm8gSFRNTDUgc3VwcG9ydCBmb3IgdGhpcyBzb3VuZCwgYW5kIG5vIEZsYXNoLiBFeGl0aW5nLicpO1xyXG4gICAgICAgIHJldHVybiBtYWtlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRPRE86IE1vdmUgSFRNTDUvZmxhc2ggY2hlY2tzIGludG8gZ2VuZXJpYyBVUkwgcGFyc2luZy9oYW5kbGluZyBmdW5jdGlvbi5cclxuXHJcbiAgICAgIGlmIChzbTIuaHRtbDUudXNpbmdGbGFzaCAmJiBvcHRpb25zLnVybCAmJiBvcHRpb25zLnVybC5tYXRjaCgvZGF0YVxcOi9pKSkge1xyXG4gICAgICAgIC8vIGRhdGE6IFVSSXMgbm90IHN1cHBvcnRlZCBieSBGbGFzaCwgZWl0aGVyLlxyXG4gICAgICAgIHNtMi5fd0Qob3B0aW9ucy5pZCArICc6IGRhdGE6IFVSSXMgbm90IHN1cHBvcnRlZCB2aWEgRmxhc2guIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgcmV0dXJuIG1ha2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGZWID4gOCkge1xyXG4gICAgICAgIGlmIChvcHRpb25zLmlzTW92aWVTdGFyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAvLyBhdHRlbXB0IHRvIGRldGVjdCBNUEVHLTQgZm9ybWF0c1xyXG4gICAgICAgICAgb3B0aW9ucy5pc01vdmllU3RhciA9ICEhKG9wdGlvbnMuc2VydmVyVVJMIHx8IChvcHRpb25zLnR5cGUgPyBvcHRpb25zLnR5cGUubWF0Y2gobmV0U3RyZWFtTWltZVR5cGVzKSA6IGZhbHNlKSB8fCAob3B0aW9ucy51cmwgJiYgb3B0aW9ucy51cmwubWF0Y2gobmV0U3RyZWFtUGF0dGVybikpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuaXNNb3ZpZVN0YXIpIHtcclxuICAgICAgICAgIHNtMi5fd0QoY3MgKyAndXNpbmcgTW92aWVTdGFyIGhhbmRsaW5nJyk7XHJcbiAgICAgICAgICBpZiAob3B0aW9ucy5sb29wcyA+IDEpIHtcclxuICAgICAgICAgICAgX3dEUygnbm9OU0xvb3AnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG4gICAgICB9XHJcblxyXG4gICAgICBvcHRpb25zID0gcG9saWN5Rml4KG9wdGlvbnMsIGNzKTtcclxuICAgICAgb1NvdW5kID0gbWFrZSgpO1xyXG5cclxuICAgICAgaWYgKGZWID09PSA4KSB7XHJcbiAgICAgICAgZmxhc2guX2NyZWF0ZVNvdW5kKG9wdGlvbnMuaWQsIG9wdGlvbnMubG9vcHMgfHwgMSwgb3B0aW9ucy51c2VQb2xpY3lGaWxlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmbGFzaC5fY3JlYXRlU291bmQob3B0aW9ucy5pZCwgb3B0aW9ucy51cmwsIG9wdGlvbnMudXNlUGVha0RhdGEsIG9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhLCBvcHRpb25zLnVzZUVRRGF0YSwgb3B0aW9ucy5pc01vdmllU3RhciwgKG9wdGlvbnMuaXNNb3ZpZVN0YXIgPyBvcHRpb25zLmJ1ZmZlclRpbWUgOiBmYWxzZSksIG9wdGlvbnMubG9vcHMgfHwgMSwgb3B0aW9ucy5zZXJ2ZXJVUkwsIG9wdGlvbnMuZHVyYXRpb24gfHwgbnVsbCwgb3B0aW9ucy5hdXRvUGxheSwgdHJ1ZSwgb3B0aW9ucy5hdXRvTG9hZCwgb3B0aW9ucy51c2VQb2xpY3lGaWxlKTtcclxuICAgICAgICBpZiAoIW9wdGlvbnMuc2VydmVyVVJMKSB7XHJcbiAgICAgICAgICAvLyBXZSBhcmUgY29ubmVjdGVkIGltbWVkaWF0ZWx5XHJcbiAgICAgICAgICBvU291bmQuY29ubmVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgIGlmIChvcHRpb25zLm9uY29ubmVjdCkge1xyXG4gICAgICAgICAgICBvcHRpb25zLm9uY29ubmVjdC5hcHBseShvU291bmQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFvcHRpb25zLnNlcnZlclVSTCAmJiAob3B0aW9ucy5hdXRvTG9hZCB8fCBvcHRpb25zLmF1dG9QbGF5KSkge1xyXG4gICAgICAgIC8vIGNhbGwgbG9hZCBmb3Igbm9uLXJ0bXAgc3RyZWFtc1xyXG4gICAgICAgIG9Tb3VuZC5sb2FkKG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHJ0bXAgd2lsbCBwbGF5IGluIG9uY29ubmVjdFxyXG4gICAgaWYgKCFvcHRpb25zLnNlcnZlclVSTCAmJiBvcHRpb25zLmF1dG9QbGF5KSB7XHJcbiAgICAgIG9Tb3VuZC5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9Tb3VuZDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgYSBTTVNvdW5kIHNvdW5kIG9iamVjdCBpbnN0YW5jZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZCB0byBkZXN0cm95XHJcbiAgICovXHJcblxyXG4gIHRoaXMuZGVzdHJveVNvdW5kID0gZnVuY3Rpb24oc0lELCBfYkZyb21Tb3VuZCkge1xyXG5cclxuICAgIC8vIGV4cGxpY2l0bHkgZGVzdHJveSBhIHNvdW5kIGJlZm9yZSBub3JtYWwgcGFnZSB1bmxvYWQsIGV0Yy5cclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG9TID0gc20yLnNvdW5kc1tzSURdLCBpO1xyXG5cclxuICAgIG9TLnN0b3AoKTtcclxuICAgIFxyXG4gICAgLy8gRGlzYWJsZSBhbGwgY2FsbGJhY2tzIGFmdGVyIHN0b3AoKSwgd2hlbiB0aGUgc291bmQgaXMgYmVpbmcgZGVzdHJveWVkXHJcbiAgICBvUy5faU8gPSB7fTtcclxuICAgIFxyXG4gICAgb1MudW5sb2FkKCk7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IHNtMi5zb3VuZElEcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc20yLnNvdW5kSURzW2ldID09PSBzSUQpIHtcclxuICAgICAgICBzbTIuc291bmRJRHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFfYkZyb21Tb3VuZCkge1xyXG4gICAgICAvLyBpZ25vcmUgaWYgYmVpbmcgY2FsbGVkIGZyb20gU01Tb3VuZCBpbnN0YW5jZVxyXG4gICAgICBvUy5kZXN0cnVjdCh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBvUyA9IG51bGw7XHJcbiAgICBkZWxldGUgc20yLnNvdW5kc1tzSURdO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgbG9hZCgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIE9wdGlvbmFsOiBTb3VuZCBvcHRpb25zXHJcbiAgICovXHJcblxyXG4gIHRoaXMubG9hZCA9IGZ1bmN0aW9uKHNJRCwgb09wdGlvbnMpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLmxvYWQob09wdGlvbnMpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgdW5sb2FkKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKi9cclxuXHJcbiAgdGhpcy51bmxvYWQgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnVubG9hZCgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgb25Qb3NpdGlvbigpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5Qb3NpdGlvbiBUaGUgcG9zaXRpb24gdG8gd2F0Y2ggZm9yXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBUaGUgcmVsZXZhbnQgY2FsbGJhY2sgdG8gZmlyZVxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvU2NvcGUgT3B0aW9uYWw6IFRoZSBzY29wZSB0byBhcHBseSB0aGUgY2FsbGJhY2sgdG9cclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5vblBvc2l0aW9uID0gZnVuY3Rpb24oc0lELCBuUG9zaXRpb24sIG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ub25wb3NpdGlvbihuUG9zaXRpb24sIG9NZXRob2QsIG9TY29wZSk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIGxlZ2FjeS9iYWNrd2FyZHMtY29tcGFiaWxpdHk6IGxvd2VyLWNhc2UgbWV0aG9kIG5hbWVcclxuICB0aGlzLm9ucG9zaXRpb24gPSB0aGlzLm9uUG9zaXRpb247XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBjbGVhck9uUG9zaXRpb24oKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuUG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIHdhdGNoIGZvclxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgT3B0aW9uYWw6IFRoZSByZWxldmFudCBjYWxsYmFjayB0byBmaXJlXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuY2xlYXJPblBvc2l0aW9uID0gZnVuY3Rpb24oc0lELCBuUG9zaXRpb24sIG9NZXRob2QpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLmNsZWFyT25Qb3NpdGlvbihuUG9zaXRpb24sIG9NZXRob2QpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgcGxheSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIE9wdGlvbmFsOiBTb3VuZCBvcHRpb25zXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMucGxheSA9IGZ1bmN0aW9uKHNJRCwgb09wdGlvbnMpIHtcclxuXHJcbiAgICB2YXIgcmVzdWx0ID0gbnVsbCxcclxuICAgICAgICAvLyBsZWdhY3kgZnVuY3Rpb24tb3ZlcmxvYWRpbmcgdXNlIGNhc2U6IHBsYXkoJ215U291bmQnLCAnL3BhdGgvdG8vc29tZS5tcDMnKTtcclxuICAgICAgICBvdmVybG9hZGVkID0gKG9PcHRpb25zICYmICEob09wdGlvbnMgaW5zdGFuY2VvZiBPYmplY3QpKTtcclxuXHJcbiAgICBpZiAoIWRpZEluaXQgfHwgIXNtMi5vaygpKSB7XHJcbiAgICAgIGNvbXBsYWluKHNtICsgJy5wbGF5KCk6ICcgKyBzdHIoIWRpZEluaXQ/J25vdFJlYWR5Jzonbm90T0snKSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lELCBvdmVybG9hZGVkKSkge1xyXG5cclxuICAgICAgaWYgKCFvdmVybG9hZGVkKSB7XHJcbiAgICAgICAgLy8gbm8gc291bmQgZm91bmQgZm9yIHRoZSBnaXZlbiBJRC4gQmFpbC5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvdmVybG9hZGVkKSB7XHJcbiAgICAgICAgb09wdGlvbnMgPSB7XHJcbiAgICAgICAgICB1cmw6IG9PcHRpb25zXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9PcHRpb25zICYmIG9PcHRpb25zLnVybCkge1xyXG4gICAgICAgIC8vIG92ZXJsb2FkaW5nIHVzZSBjYXNlLCBjcmVhdGUrcGxheTogLnBsYXkoJ3NvbWVJRCcsIHt1cmw6Jy9wYXRoL3RvLm1wMyd9KTtcclxuICAgICAgICBzbTIuX3dEKHNtICsgJy5wbGF5KCk6IEF0dGVtcHRpbmcgdG8gY3JlYXRlIFwiJyArIHNJRCArICdcIicsIDEpO1xyXG4gICAgICAgIG9PcHRpb25zLmlkID0gc0lEO1xyXG4gICAgICAgIHJlc3VsdCA9IHNtMi5jcmVhdGVTb3VuZChvT3B0aW9ucykucGxheSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSBlbHNlIGlmIChvdmVybG9hZGVkKSB7XHJcblxyXG4gICAgICAvLyBleGlzdGluZyBzb3VuZCBvYmplY3QgY2FzZVxyXG4gICAgICBvT3B0aW9ucyA9IHtcclxuICAgICAgICB1cmw6IG9PcHRpb25zXHJcbiAgICAgIH07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcclxuICAgICAgLy8gZGVmYXVsdCBjYXNlXHJcbiAgICAgIHJlc3VsdCA9IHNtMi5zb3VuZHNbc0lEXS5wbGF5KG9PcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvLyBqdXN0IGZvciBjb252ZW5pZW5jZVxyXG4gIHRoaXMuc3RhcnQgPSB0aGlzLnBsYXk7XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBzZXRQb3NpdGlvbigpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5Nc2VjT2Zmc2V0IFBvc2l0aW9uIChtaWxsaXNlY29uZHMpXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihzSUQsIG5Nc2VjT2Zmc2V0KSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5zZXRQb3NpdGlvbihuTXNlY09mZnNldCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBzdG9wKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zdG9wID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNtMi5fd0Qoc20gKyAnLnN0b3AoJyArIHNJRCArICcpJywgMSk7XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnN0b3AoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcHMgYWxsIGN1cnJlbnRseS1wbGF5aW5nIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5zdG9wQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIG9Tb3VuZDtcclxuICAgIHNtMi5fd0Qoc20gKyAnLnN0b3BBbGwoKScsIDEpO1xyXG5cclxuICAgIGZvciAob1NvdW5kIGluIHNtMi5zb3VuZHMpIHtcclxuICAgICAgaWYgKHNtMi5zb3VuZHMuaGFzT3duUHJvcGVydHkob1NvdW5kKSkge1xyXG4gICAgICAgIC8vIGFwcGx5IG9ubHkgdG8gc291bmQgb2JqZWN0c1xyXG4gICAgICAgIHNtMi5zb3VuZHNbb1NvdW5kXS5zdG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHBhdXNlKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ucGF1c2UoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUGF1c2VzIGFsbCBjdXJyZW50bHktcGxheWluZyBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMucGF1c2VBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgaTtcclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0ucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHJlc3VtZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMucmVzdW1lID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5yZXN1bWUoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdW1lcyBhbGwgY3VycmVudGx5LXBhdXNlZCBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMucmVzdW1lQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGk7XHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoLSAxIDsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLnJlc3VtZSgpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgdG9nZ2xlUGF1c2UoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnRvZ2dsZVBhdXNlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS50b2dnbGVQYXVzZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgc2V0UGFuKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gblBhbiBUaGUgcGFuIHZhbHVlICgtMTAwIHRvIDEwMClcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXRQYW4gPSBmdW5jdGlvbihzSUQsIG5QYW4pIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnNldFBhbihuUGFuKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHNldFZvbHVtZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElEXHJcbiAgICogT3ZlcmxvYWRlZCBjYXNlOiBwYXNzIG9ubHkgdm9sdW1lIGFyZ3VtZW50IGVnLiwgc2V0Vm9sdW1lKDUwKSB0byBhcHBseSB0byBhbGwgc291bmRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5Wb2wgVGhlIHZvbHVtZSB2YWx1ZSAoMCB0byAxMDApXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0Vm9sdW1lID0gZnVuY3Rpb24oc0lELCBuVm9sKSB7XHJcblxyXG4gICAgLy8gc2V0Vm9sdW1lKDUwKSBmdW5jdGlvbiBvdmVybG9hZGluZyBjYXNlIC0gYXBwbHkgdG8gYWxsIHNvdW5kc1xyXG5cclxuICAgIHZhciBpLCBqO1xyXG5cclxuICAgIGlmIChzSUQgIT09IF91bmRlZmluZWQgJiYgIWlzTmFOKHNJRCkgJiYgblZvbCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gc20yLnNvdW5kSURzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5zZXRWb2x1bWUoc0lEKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0Vm9sdW1lKCdteVNvdW5kJywgNTApIGNhc2VcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5zZXRWb2x1bWUoblZvbCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBtdXRlKCkgbWV0aG9kIG9mIGVpdGhlciBhIHNpbmdsZSBTTVNvdW5kIG9iamVjdCBieSBJRCwgb3IgYWxsIHNvdW5kIG9iamVjdHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIE9wdGlvbmFsOiBUaGUgSUQgb2YgdGhlIHNvdW5kIChpZiBvbWl0dGVkLCBhbGwgc291bmRzIHdpbGwgYmUgdXNlZC4pXHJcbiAgICovXHJcblxyXG4gIHRoaXMubXV0ZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICBpZiAoc0lEIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgIHNJRCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzSUQpIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLm11dGUoKTogTXV0aW5nIGFsbCBzb3VuZHMnKTtcclxuICAgICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLm11dGUoKTtcclxuICAgICAgfVxyXG4gICAgICBzbTIubXV0ZWQgPSB0cnVlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBzbTIuX3dEKHNtICsgJy5tdXRlKCk6IE11dGluZyBcIicgKyBzSUQgKyAnXCInKTtcclxuICAgICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5tdXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBNdXRlcyBhbGwgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLm11dGVBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBzbTIubXV0ZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgdW5tdXRlKCkgbWV0aG9kIG9mIGVpdGhlciBhIHNpbmdsZSBTTVNvdW5kIG9iamVjdCBieSBJRCwgb3IgYWxsIHNvdW5kIG9iamVjdHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIE9wdGlvbmFsOiBUaGUgSUQgb2YgdGhlIHNvdW5kIChpZiBvbWl0dGVkLCBhbGwgc291bmRzIHdpbGwgYmUgdXNlZC4pXHJcbiAgICovXHJcblxyXG4gIHRoaXMudW5tdXRlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgdmFyIGk7XHJcblxyXG4gICAgaWYgKHNJRCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICBzSUQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc0lEKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHNtICsgJy51bm11dGUoKTogVW5tdXRpbmcgYWxsIHNvdW5kcycpO1xyXG4gICAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0udW5tdXRlKCk7XHJcbiAgICAgIH1cclxuICAgICAgc20yLm11dGVkID0gZmFsc2U7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLnVubXV0ZSgpOiBVbm11dGluZyBcIicgKyBzSUQgKyAnXCInKTtcclxuICAgICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS51bm11dGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFVubXV0ZXMgYWxsIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy51bm11dGVBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBzbTIudW5tdXRlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSB0b2dnbGVNdXRlKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy50b2dnbGVNdXRlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS50b2dnbGVNdXRlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgbWVtb3J5IHVzZWQgYnkgdGhlIGZsYXNoIHBsdWdpbi5cclxuICAgKlxyXG4gICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGFtb3VudCBvZiBtZW1vcnkgaW4gdXNlXHJcbiAgICovXHJcblxyXG4gIHRoaXMuZ2V0TWVtb3J5VXNlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gZmxhc2gtb25seVxyXG4gICAgdmFyIHJhbSA9IDA7XHJcblxyXG4gICAgaWYgKGZsYXNoICYmIGZWICE9PSA4KSB7XHJcbiAgICAgIHJhbSA9IHBhcnNlSW50KGZsYXNoLl9nZXRNZW1vcnlVc2UoKSwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByYW07XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFVuZG9jdW1lbnRlZDogTk9QcyBzb3VuZE1hbmFnZXIgYW5kIGFsbCBTTVNvdW5kIG9iamVjdHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuZGlzYWJsZSA9IGZ1bmN0aW9uKGJOb0Rpc2FibGUpIHtcclxuXHJcbiAgICAvLyBkZXN0cm95IGFsbCBmdW5jdGlvbnNcclxuICAgIHZhciBpO1xyXG5cclxuICAgIGlmIChiTm9EaXNhYmxlID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIGJOb0Rpc2FibGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGlzYWJsZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc2FibGVkID0gdHJ1ZTtcclxuICAgIF93RFMoJ3NodXRkb3duJywgMSk7XHJcblxyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGRpc2FibGVPYmplY3Qoc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaXJlIFwiY29tcGxldGVcIiwgZGVzcGl0ZSBmYWlsXHJcbiAgICBpbml0Q29tcGxldGUoYk5vRGlzYWJsZSk7XHJcbiAgICBldmVudC5yZW1vdmUod2luZG93LCAnbG9hZCcsIGluaXRVc2VyT25sb2FkKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBwbGF5YWJpbGl0eSBvZiBhIE1JTUUgdHlwZSwgZWcuICdhdWRpby9tcDMnLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNhblBsYXlNSU1FID0gZnVuY3Rpb24oc01JTUUpIHtcclxuXHJcbiAgICB2YXIgcmVzdWx0O1xyXG5cclxuICAgIGlmIChzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgcmVzdWx0ID0gaHRtbDVDYW5QbGF5KHtcclxuICAgICAgICB0eXBlOiBzTUlNRVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlc3VsdCAmJiBuZWVkc0ZsYXNoKSB7XHJcbiAgICAgIC8vIGlmIGZsYXNoIDksIHRlc3QgbmV0U3RyZWFtIChtb3ZpZVN0YXIpIHR5cGVzIGFzIHdlbGwuXHJcbiAgICAgIHJlc3VsdCA9IChzTUlNRSAmJiBzbTIub2soKSA/ICEhKChmViA+IDggPyBzTUlNRS5tYXRjaChuZXRTdHJlYW1NaW1lVHlwZXMpIDogbnVsbCkgfHwgc01JTUUubWF0Y2goc20yLm1pbWVQYXR0ZXJuKSkgOiBudWxsKTsgLy8gVE9ETzogbWFrZSBsZXNzIFwid2VpcmRcIiAocGVyIEpTTGludClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHBsYXlhYmlsaXR5IG9mIGEgVVJMIGJhc2VkIG9uIGF1ZGlvIHN1cHBvcnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc1VSTCBUaGUgVVJMIHRvIHRlc3RcclxuICAgKiBAcmV0dXJuIHtib29sZWFufSBVUkwgcGxheWFiaWxpdHlcclxuICAgKi9cclxuXHJcbiAgdGhpcy5jYW5QbGF5VVJMID0gZnVuY3Rpb24oc1VSTCkge1xyXG5cclxuICAgIHZhciByZXN1bHQ7XHJcblxyXG4gICAgaWYgKHNtMi5oYXNIVE1MNSkge1xyXG4gICAgICByZXN1bHQgPSBodG1sNUNhblBsYXkoe1xyXG4gICAgICAgIHVybDogc1VSTFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlc3VsdCAmJiBuZWVkc0ZsYXNoKSB7XHJcbiAgICAgIHJlc3VsdCA9IChzVVJMICYmIHNtMi5vaygpID8gISEoc1VSTC5tYXRjaChzbTIuZmlsZVBhdHRlcm4pKSA6IG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgcGxheWFiaWxpdHkgb2YgYW4gSFRNTCBET00gJmx0O2EmZ3Q7IG9iamVjdCAob3Igc2ltaWxhciBvYmplY3QgbGl0ZXJhbCkgYmFzZWQgb24gYXVkaW8gc3VwcG9ydC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvTGluayBhbiBIVE1MIERPTSAmbHQ7YSZndDsgb2JqZWN0IG9yIG9iamVjdCBsaXRlcmFsIGluY2x1ZGluZyBocmVmIGFuZC9vciB0eXBlIGF0dHJpYnV0ZXNcclxuICAgKiBAcmV0dXJuIHtib29sZWFufSBVUkwgcGxheWFiaWxpdHlcclxuICAgKi9cclxuXHJcbiAgdGhpcy5jYW5QbGF5TGluayA9IGZ1bmN0aW9uKG9MaW5rKSB7XHJcblxyXG4gICAgaWYgKG9MaW5rLnR5cGUgIT09IF91bmRlZmluZWQgJiYgb0xpbmsudHlwZSkge1xyXG4gICAgICBpZiAoc20yLmNhblBsYXlNSU1FKG9MaW5rLnR5cGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc20yLmNhblBsYXlVUkwob0xpbmsuaHJlZik7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuZ2V0U291bmRCeUlkID0gZnVuY3Rpb24oc0lELCBfc3VwcHJlc3NEZWJ1Zykge1xyXG5cclxuICAgIGlmICghc0lEKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByZXN1bHQgPSBzbTIuc291bmRzW3NJRF07XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoIXJlc3VsdCAmJiAhX3N1cHByZXNzRGVidWcpIHtcclxuICAgICAgc20yLl93RChzbSArICcuZ2V0U291bmRCeUlkKCk6IFNvdW5kIFwiJyArIHNJRCArICdcIiBub3QgZm91bmQuJywgMik7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUXVldWVzIGEgY2FsbGJhY2sgZm9yIGV4ZWN1dGlvbiB3aGVuIFNvdW5kTWFuYWdlciBoYXMgc3VjY2Vzc2Z1bGx5IGluaXRpYWxpemVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBUaGUgY2FsbGJhY2sgbWV0aG9kIHRvIGZpcmVcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb1Njb3BlIE9wdGlvbmFsOiBUaGUgc2NvcGUgdG8gYXBwbHkgdG8gdGhlIGNhbGxiYWNrXHJcbiAgICovXHJcblxyXG4gIHRoaXMub25yZWFkeSA9IGZ1bmN0aW9uKG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgIHZhciBzVHlwZSA9ICdvbnJlYWR5JyxcclxuICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAodHlwZW9mIG9NZXRob2QgPT09ICdmdW5jdGlvbicpIHtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoZGlkSW5pdCkge1xyXG4gICAgICAgIHNtMi5fd0Qoc3RyKCdxdWV1ZScsIHNUeXBlKSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgaWYgKCFvU2NvcGUpIHtcclxuICAgICAgICBvU2NvcGUgPSB3aW5kb3c7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFkZE9uRXZlbnQoc1R5cGUsIG9NZXRob2QsIG9TY29wZSk7XHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cygpO1xyXG5cclxuICAgICAgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgdGhyb3cgc3RyKCduZWVkRnVuY3Rpb24nLCBzVHlwZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFF1ZXVlcyBhIGNhbGxiYWNrIGZvciBleGVjdXRpb24gd2hlbiBTb3VuZE1hbmFnZXIgaGFzIGZhaWxlZCB0byBpbml0aWFsaXplLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBUaGUgY2FsbGJhY2sgbWV0aG9kIHRvIGZpcmVcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb1Njb3BlIE9wdGlvbmFsOiBUaGUgc2NvcGUgdG8gYXBwbHkgdG8gdGhlIGNhbGxiYWNrXHJcbiAgICovXHJcblxyXG4gIHRoaXMub250aW1lb3V0ID0gZnVuY3Rpb24ob01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgdmFyIHNUeXBlID0gJ29udGltZW91dCcsXHJcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBvTWV0aG9kID09PSAnZnVuY3Rpb24nKSB7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKGRpZEluaXQpIHtcclxuICAgICAgICBzbTIuX3dEKHN0cigncXVldWUnLCBzVHlwZSkpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGlmICghb1Njb3BlKSB7XHJcbiAgICAgICAgb1Njb3BlID0gd2luZG93O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhZGRPbkV2ZW50KHNUeXBlLCBvTWV0aG9kLCBvU2NvcGUpO1xyXG4gICAgICBwcm9jZXNzT25FdmVudHMoe3R5cGU6c1R5cGV9KTtcclxuXHJcbiAgICAgIHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIHRocm93IHN0cignbmVlZEZ1bmN0aW9uJywgc1R5cGUpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBXcml0ZXMgY29uc29sZS5sb2coKS1zdHlsZSBkZWJ1ZyBvdXRwdXQgdG8gYSBjb25zb2xlIG9yIGluLWJyb3dzZXIgZWxlbWVudC5cclxuICAgKiBBcHBsaWVzIHdoZW4gZGVidWdNb2RlID0gdHJ1ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNUZXh0IFRoZSBjb25zb2xlIG1lc3NhZ2VcclxuICAgKiBAcGFyYW0ge29iamVjdH0gblR5cGUgT3B0aW9uYWwgbG9nIGxldmVsIChudW1iZXIpLCBvciBvYmplY3QuIE51bWJlciBjYXNlOiBMb2cgdHlwZS9zdHlsZSB3aGVyZSAwID0gJ2luZm8nLCAxID0gJ3dhcm4nLCAyID0gJ2Vycm9yJy4gT2JqZWN0IGNhc2U6IE9iamVjdCB0byBiZSBkdW1wZWQuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuX3dyaXRlRGVidWcgPSBmdW5jdGlvbihzVGV4dCwgc1R5cGVPck9iamVjdCkge1xyXG5cclxuICAgIC8vIHBzZXVkby1wcml2YXRlIGNvbnNvbGUubG9nKCktc3R5bGUgb3V0cHV0XHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICB2YXIgc0RJRCA9ICdzb3VuZG1hbmFnZXItZGVidWcnLCBvLCBvSXRlbTtcclxuXHJcbiAgICBpZiAoIXNtMi5zZXR1cE9wdGlvbnMuZGVidWdNb2RlKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaGFzQ29uc29sZSAmJiBzbTIudXNlQ29uc29sZSkge1xyXG4gICAgICBpZiAoc1R5cGVPck9iamVjdCAmJiB0eXBlb2Ygc1R5cGVPck9iamVjdCA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAvLyBvYmplY3QgcGFzc2VkOyBkdW1wIHRvIGNvbnNvbGUuXHJcbiAgICAgICAgY29uc29sZS5sb2coc1RleHQsIHNUeXBlT3JPYmplY3QpO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlYnVnTGV2ZWxzW3NUeXBlT3JPYmplY3RdICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc29sZVtkZWJ1Z0xldmVsc1tzVHlwZU9yT2JqZWN0XV0oc1RleHQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHNUZXh0KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc20yLmNvbnNvbGVPbmx5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvID0gaWQoc0RJRCk7XHJcblxyXG4gICAgaWYgKCFvKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBvSXRlbSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbiAgICBpZiAoKyt3ZENvdW50ICUgMiA9PT0gMCkge1xyXG4gICAgICBvSXRlbS5jbGFzc05hbWUgPSAnc20yLWFsdCc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNUeXBlT3JPYmplY3QgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgc1R5cGVPck9iamVjdCA9IDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzVHlwZU9yT2JqZWN0ID0gcGFyc2VJbnQoc1R5cGVPck9iamVjdCwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIG9JdGVtLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShzVGV4dCkpO1xyXG5cclxuICAgIGlmIChzVHlwZU9yT2JqZWN0KSB7XHJcbiAgICAgIGlmIChzVHlwZU9yT2JqZWN0ID49IDIpIHtcclxuICAgICAgICBvSXRlbS5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzVHlwZU9yT2JqZWN0ID09PSAzKSB7XHJcbiAgICAgICAgb0l0ZW0uc3R5bGUuY29sb3IgPSAnI2ZmMzMzMyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB0b3AtdG8tYm90dG9tXHJcbiAgICAvLyBvLmFwcGVuZENoaWxkKG9JdGVtKTtcclxuXHJcbiAgICAvLyBib3R0b20tdG8tdG9wXHJcbiAgICBvLmluc2VydEJlZm9yZShvSXRlbSwgby5maXJzdENoaWxkKTtcclxuXHJcbiAgICBvID0gbnVsbDtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gPGQ+XHJcbiAgLy8gbGFzdC1yZXNvcnQgZGVidWdnaW5nIG9wdGlvblxyXG4gIGlmICh3bC5pbmRleE9mKCdzbTItZGVidWc9YWxlcnQnKSAhPT0gLTEpIHtcclxuICAgIHRoaXMuX3dyaXRlRGVidWcgPSBmdW5jdGlvbihzVGV4dCkge1xyXG4gICAgICB3aW5kb3cuYWxlcnQoc1RleHQpO1xyXG4gICAgfTtcclxuICB9XHJcbiAgLy8gPC9kPlxyXG5cclxuICAvLyBhbGlhc1xyXG4gIHRoaXMuX3dEID0gdGhpcy5fd3JpdGVEZWJ1ZztcclxuXHJcbiAgLyoqXHJcbiAgICogUHJvdmlkZXMgZGVidWcgLyBzdGF0ZSBpbmZvcm1hdGlvbiBvbiBhbGwgU01Tb3VuZCBvYmplY3RzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLl9kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgdmFyIGksIGo7XHJcbiAgICBfd0RTKCdjdXJyZW50T2JqJywgMSk7XHJcblxyXG4gICAgZm9yIChpID0gMCwgaiA9IHNtMi5zb3VuZElEcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLl9kZWJ1ZygpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZXN0YXJ0cyBhbmQgcmUtaW5pdGlhbGl6ZXMgdGhlIFNvdW5kTWFuYWdlciBpbnN0YW5jZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzZXRFdmVudHMgT3B0aW9uYWw6IFdoZW4gdHJ1ZSwgcmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBvbnJlYWR5IGFuZCBvbnRpbWVvdXQgZXZlbnQgY2FsbGJhY2tzLlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZXhjbHVkZUluaXQgT3B0aW9uczogV2hlbiB0cnVlLCBkb2VzIG5vdCBjYWxsIGJlZ2luRGVsYXllZEluaXQoKSAod2hpY2ggd291bGQgcmVzdGFydCBTTTIpLlxyXG4gICAqIEByZXR1cm4ge29iamVjdH0gc291bmRNYW5hZ2VyIFRoZSBzb3VuZE1hbmFnZXIgaW5zdGFuY2UuXHJcbiAgICovXHJcblxyXG4gIHRoaXMucmVib290ID0gZnVuY3Rpb24ocmVzZXRFdmVudHMsIGV4Y2x1ZGVJbml0KSB7XHJcblxyXG4gICAgLy8gcmVzZXQgc29tZSAob3IgYWxsKSBzdGF0ZSwgYW5kIHJlLWluaXQgdW5sZXNzIG90aGVyd2lzZSBzcGVjaWZpZWQuXHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoc20yLnNvdW5kSURzLmxlbmd0aCkge1xyXG4gICAgICBzbTIuX3dEKCdEZXN0cm95aW5nICcgKyBzbTIuc291bmRJRHMubGVuZ3RoICsgJyBTTVNvdW5kIG9iamVjdCcgKyAoc20yLnNvdW5kSURzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKSArICcuLi4nKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICB2YXIgaSwgaiwgaztcclxuXHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoLSAxIDsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLmRlc3RydWN0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdHJhc2ggemUgZmxhc2ggKHJlbW92ZSBmcm9tIHRoZSBET00pXHJcblxyXG4gICAgaWYgKGZsYXNoKSB7XHJcblxyXG4gICAgICB0cnkge1xyXG5cclxuICAgICAgICBpZiAoaXNJRSkge1xyXG4gICAgICAgICAgb1JlbW92ZWRIVE1MID0gZmxhc2guaW5uZXJIVE1MO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb1JlbW92ZWQgPSBmbGFzaC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGZsYXNoKTtcclxuXHJcbiAgICAgIH0gY2F0Y2goZSkge1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgZmFpbGVkPyBNYXkgYmUgZHVlIHRvIGZsYXNoIGJsb2NrZXJzIHNpbGVudGx5IHJlbW92aW5nIHRoZSBTV0Ygb2JqZWN0L2VtYmVkIG5vZGUgZnJvbSB0aGUgRE9NLiBXYXJuIGFuZCBjb250aW51ZS5cclxuXHJcbiAgICAgICAgX3dEUygnYmFkUmVtb3ZlJywgMik7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFjdHVhbGx5LCBmb3JjZSByZWNyZWF0ZSBvZiBtb3ZpZS5cclxuXHJcbiAgICBvUmVtb3ZlZEhUTUwgPSBvUmVtb3ZlZCA9IG5lZWRzRmxhc2ggPSBmbGFzaCA9IG51bGw7XHJcblxyXG4gICAgc20yLmVuYWJsZWQgPSBkaWREQ0xvYWRlZCA9IGRpZEluaXQgPSB3YWl0aW5nRm9yRUkgPSBpbml0UGVuZGluZyA9IGRpZEFwcGVuZCA9IGFwcGVuZFN1Y2Nlc3MgPSBkaXNhYmxlZCA9IHVzZUdsb2JhbEhUTUw1QXVkaW8gPSBzbTIuc3dmTG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgc20yLnNvdW5kSURzID0gW107XHJcbiAgICBzbTIuc291bmRzID0ge307XHJcblxyXG4gICAgaWRDb3VudGVyID0gMDtcclxuICAgIGRpZFNldHVwID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKCFyZXNldEV2ZW50cykge1xyXG4gICAgICAvLyByZXNldCBjYWxsYmFja3MgZm9yIG9ucmVhZHksIG9udGltZW91dCBldGMuIHNvIHRoYXQgdGhleSB3aWxsIGZpcmUgYWdhaW4gb24gcmUtaW5pdFxyXG4gICAgICBmb3IgKGkgaW4gb25fcXVldWUpIHtcclxuICAgICAgICBpZiAob25fcXVldWUuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBvbl9xdWV1ZVtpXS5sZW5ndGg7IGogPCBrOyBqKyspIHtcclxuICAgICAgICAgICAgb25fcXVldWVbaV1bal0uZmlyZWQgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHJlbW92ZSBhbGwgY2FsbGJhY2tzIGVudGlyZWx5XHJcbiAgICAgIG9uX3F1ZXVlID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoIWV4Y2x1ZGVJbml0KSB7XHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnOiBSZWJvb3RpbmcuLi4nKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICAvLyByZXNldCBIVE1MNSBhbmQgZmxhc2ggY2FuUGxheSB0ZXN0IHJlc3VsdHNcclxuXHJcbiAgICBzbTIuaHRtbDUgPSB7XHJcbiAgICAgICd1c2luZ0ZsYXNoJzogbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICBzbTIuZmxhc2ggPSB7fTtcclxuXHJcbiAgICAvLyByZXNldCBkZXZpY2Utc3BlY2lmaWMgSFRNTC9mbGFzaCBtb2RlIHN3aXRjaGVzXHJcblxyXG4gICAgc20yLmh0bWw1T25seSA9IGZhbHNlO1xyXG4gICAgc20yLmlnbm9yZUZsYXNoID0gZmFsc2U7XHJcblxyXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBieSBkZWZhdWx0LCByZS1pbml0XHJcblxyXG4gICAgICBpZiAoIWV4Y2x1ZGVJbml0KSB7XHJcbiAgICAgICAgc20yLmJlZ2luRGVsYXllZEluaXQoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sIDIwKTtcclxuXHJcbiAgICByZXR1cm4gc20yO1xyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaHV0cyBkb3duIGFuZCByZXN0b3JlcyB0aGUgU291bmRNYW5hZ2VyIGluc3RhbmNlIHRvIGl0cyBvcmlnaW5hbCBsb2FkZWQgc3RhdGUsIHdpdGhvdXQgYW4gZXhwbGljaXQgcmVib290LiBBbGwgb25yZWFkeS9vbnRpbWVvdXQgaGFuZGxlcnMgYXJlIHJlbW92ZWQuXHJcbiAgICAgKiBBZnRlciB0aGlzIGNhbGwsIFNNMiBtYXkgYmUgcmUtaW5pdGlhbGl6ZWQgdmlhIHNvdW5kTWFuYWdlci5iZWdpbkRlbGF5ZWRJbml0KCkuXHJcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHNvdW5kTWFuYWdlciBUaGUgc291bmRNYW5hZ2VyIGluc3RhbmNlLlxyXG4gICAgICovXHJcblxyXG4gICAgX3dEUygncmVzZXQnKTtcclxuICAgIHJldHVybiBzbTIucmVib290KHRydWUsIHRydWUpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBVbmRvY3VtZW50ZWQ6IERldGVybWluZXMgdGhlIFNNMiBmbGFzaCBtb3ZpZSdzIGxvYWQgcHJvZ3Jlc3MuXHJcbiAgICpcclxuICAgKiBAcmV0dXJuIHtudW1iZXIgb3IgbnVsbH0gUGVyY2VudCBsb2FkZWQsIG9yIGlmIGludmFsaWQvdW5zdXBwb3J0ZWQsIG51bGwuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuZ2V0TW92aWVQZXJjZW50ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcmVzdGluZyBzeW50YXggbm90ZXMuLi5cclxuICAgICAqIEZsYXNoL0V4dGVybmFsSW50ZXJmYWNlIChBY3RpdmVYL05QQVBJKSBicmlkZ2UgbWV0aG9kcyBhcmUgbm90IHR5cGVvZiBcImZ1bmN0aW9uXCIgbm9yIGluc3RhbmNlb2YgRnVuY3Rpb24sIGJ1dCBhcmUgc3RpbGwgdmFsaWQuXHJcbiAgICAgKiBBZGRpdGlvbmFsbHksIEpTTGludCBkaXNsaWtlcyAoJ1BlcmNlbnRMb2FkZWQnIGluIGZsYXNoKS1zdHlsZSBzeW50YXggYW5kIHJlY29tbWVuZHMgaGFzT3duUHJvcGVydHkoKSwgd2hpY2ggZG9lcyBub3Qgd29yayBpbiB0aGlzIGNhc2UuXHJcbiAgICAgKiBGdXJ0aGVybW9yZSwgdXNpbmcgKGZsYXNoICYmIGZsYXNoLlBlcmNlbnRMb2FkZWQpIGNhdXNlcyBJRSB0byB0aHJvdyBcIm9iamVjdCBkb2Vzbid0IHN1cHBvcnQgdGhpcyBwcm9wZXJ0eSBvciBtZXRob2RcIi5cclxuICAgICAqIFRodXMsICdpbicgc3ludGF4IG11c3QgYmUgdXNlZC5cclxuICAgICAqL1xyXG5cclxuICAgIHJldHVybiAoZmxhc2ggJiYgJ1BlcmNlbnRMb2FkZWQnIGluIGZsYXNoID8gZmxhc2guUGVyY2VudExvYWRlZCgpIDogbnVsbCk7IC8vIFllcywgSlNMaW50LiBTZWUgbmVhcmJ5IGNvbW1lbnQgaW4gc291cmNlIGZvciBleHBsYW5hdGlvbi5cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkaXRpb25hbCBoZWxwZXIgZm9yIG1hbnVhbGx5IGludm9raW5nIFNNMidzIGluaXQgcHJvY2VzcyBhZnRlciBET00gUmVhZHkgLyB3aW5kb3cub25sb2FkKCkuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuYmVnaW5EZWxheWVkSW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHdpbmRvd0xvYWRlZCA9IHRydWU7XHJcbiAgICBkb21Db250ZW50TG9hZGVkKCk7XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChpbml0UGVuZGluZykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY3JlYXRlTW92aWUoKTtcclxuICAgICAgaW5pdE1vdmllKCk7XHJcbiAgICAgIGluaXRQZW5kaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sIDIwKTtcclxuXHJcbiAgICBkZWxheVdhaXRGb3JFSSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXN0cm95cyB0aGUgU291bmRNYW5hZ2VyIGluc3RhbmNlIGFuZCBhbGwgU01Tb3VuZCBpbnN0YW5jZXMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuZGVzdHJ1Y3QgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBzbTIuX3dEKHNtICsgJy5kZXN0cnVjdCgpJyk7XHJcbiAgICBzbTIuZGlzYWJsZSh0cnVlKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogU01Tb3VuZCgpIChzb3VuZCBvYmplY3QpIGNvbnN0cnVjdG9yXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgU291bmQgb3B0aW9ucyAoaWQgYW5kIHVybCBhcmUgcmVxdWlyZWQgYXR0cmlidXRlcylcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgbmV3IFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIFNNU291bmQgPSBmdW5jdGlvbihvT3B0aW9ucykge1xyXG5cclxuICAgIHZhciBzID0gdGhpcywgcmVzZXRQcm9wZXJ0aWVzLCBhZGRfaHRtbDVfZXZlbnRzLCByZW1vdmVfaHRtbDVfZXZlbnRzLCBzdG9wX2h0bWw1X3RpbWVyLCBzdGFydF9odG1sNV90aW1lciwgYXR0YWNoT25Qb3NpdGlvbiwgb25wbGF5X2NhbGxlZCA9IGZhbHNlLCBvblBvc2l0aW9uSXRlbXMgPSBbXSwgb25Qb3NpdGlvbkZpcmVkID0gMCwgZGV0YWNoT25Qb3NpdGlvbiwgYXBwbHlGcm9tVG8sIGxhc3RVUkwgPSBudWxsLCBsYXN0SFRNTDVTdGF0ZSwgdXJsT21pdHRlZDtcclxuXHJcbiAgICBsYXN0SFRNTDVTdGF0ZSA9IHtcclxuICAgICAgLy8gdHJhY2tzIGR1cmF0aW9uICsgcG9zaXRpb24gKHRpbWUpXHJcbiAgICAgIGR1cmF0aW9uOiBudWxsLFxyXG4gICAgICB0aW1lOiBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuaWQgPSBvT3B0aW9ucy5pZDtcclxuXHJcbiAgICAvLyBsZWdhY3lcclxuICAgIHRoaXMuc0lEID0gdGhpcy5pZDtcclxuXHJcbiAgICB0aGlzLnVybCA9IG9PcHRpb25zLnVybDtcclxuICAgIHRoaXMub3B0aW9ucyA9IG1peGluKG9PcHRpb25zKTtcclxuXHJcbiAgICAvLyBwZXItcGxheS1pbnN0YW5jZS1zcGVjaWZpYyBvcHRpb25zXHJcbiAgICB0aGlzLmluc3RhbmNlT3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHJcbiAgICAvLyBzaG9ydCBhbGlhc1xyXG4gICAgdGhpcy5faU8gPSB0aGlzLmluc3RhbmNlT3B0aW9ucztcclxuXHJcbiAgICAvLyBhc3NpZ24gcHJvcGVydHkgZGVmYXVsdHNcclxuICAgIHRoaXMucGFuID0gdGhpcy5vcHRpb25zLnBhbjtcclxuICAgIHRoaXMudm9sdW1lID0gdGhpcy5vcHRpb25zLnZvbHVtZTtcclxuXHJcbiAgICAvLyB3aGV0aGVyIG9yIG5vdCB0aGlzIG9iamVjdCBpcyB1c2luZyBIVE1MNVxyXG4gICAgdGhpcy5pc0hUTUw1ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gaW50ZXJuYWwgSFRNTDUgQXVkaW8oKSBvYmplY3QgcmVmZXJlbmNlXHJcbiAgICB0aGlzLl9hID0gbnVsbDtcclxuXHJcbiAgICAvLyBmb3IgZmxhc2ggOCBzcGVjaWFsLWNhc2UgY3JlYXRlU291bmQoKSB3aXRob3V0IHVybCwgZm9sbG93ZWQgYnkgbG9hZC9wbGF5IHdpdGggdXJsIGNhc2VcclxuICAgIHVybE9taXR0ZWQgPSAodGhpcy51cmwgPyBmYWxzZSA6IHRydWUpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU01Tb3VuZCgpIHB1YmxpYyBtZXRob2RzXHJcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuaWQzID0ge307XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXcml0ZXMgU01Tb3VuZCBvYmplY3QgcGFyYW1ldGVycyB0byBkZWJ1ZyBjb25zb2xlXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IE1lcmdlZCBvcHRpb25zOicsIHMub3B0aW9ucyk7XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmVnaW5zIGxvYWRpbmcgYSBzb3VuZCBwZXIgaXRzICp1cmwqLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBPcHRpb25hbDogU291bmQgb3B0aW9uc1xyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmxvYWQgPSBmdW5jdGlvbihvT3B0aW9ucykge1xyXG5cclxuICAgICAgdmFyIG9Tb3VuZCA9IG51bGwsIGluc3RhbmNlT3B0aW9ucztcclxuXHJcbiAgICAgIGlmIChvT3B0aW9ucyAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIHMuX2lPID0gbWl4aW4ob09wdGlvbnMsIHMub3B0aW9ucyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb09wdGlvbnMgPSBzLm9wdGlvbnM7XHJcbiAgICAgICAgcy5faU8gPSBvT3B0aW9ucztcclxuICAgICAgICBpZiAobGFzdFVSTCAmJiBsYXN0VVJMICE9PSBzLnVybCkge1xyXG4gICAgICAgICAgX3dEUygnbWFuVVJMJyk7XHJcbiAgICAgICAgICBzLl9pTy51cmwgPSBzLnVybDtcclxuICAgICAgICAgIHMudXJsID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5faU8udXJsKSB7XHJcbiAgICAgICAgcy5faU8udXJsID0gcy51cmw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuX2lPLnVybCA9IHBhcnNlVVJMKHMuX2lPLnVybCk7XHJcblxyXG4gICAgICAvLyBlbnN1cmUgd2UncmUgaW4gc3luY1xyXG4gICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgLy8gbG9jYWwgc2hvcnRjdXRcclxuICAgICAgaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBsb2FkICgnICsgaW5zdGFuY2VPcHRpb25zLnVybCArICcpJyk7XHJcblxyXG4gICAgICBpZiAoIWluc3RhbmNlT3B0aW9ucy51cmwgJiYgIXMudXJsKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogbG9hZCgpOiB1cmwgaXMgdW5hc3NpZ25lZC4gRXhpdGluZy4nLCAyKTtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmIGZWID09PSA4ICYmICFzLnVybCAmJiAhaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5KSB7XHJcbiAgICAgICAgLy8gZmxhc2ggOCBsb2FkKCkgLT4gcGxheSgpIHdvbid0IHdvcmsgYmVmb3JlIG9ubG9hZCBoYXMgZmlyZWQuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogRmxhc2ggOCBsb2FkKCkgbGltaXRhdGlvbjogV2FpdCBmb3Igb25sb2FkKCkgYmVmb3JlIGNhbGxpbmcgcGxheSgpLicsIDEpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudXJsID09PSBzLnVybCAmJiBzLnJlYWR5U3RhdGUgIT09IDAgJiYgcy5yZWFkeVN0YXRlICE9PSAyKSB7XHJcbiAgICAgICAgX3dEUygnb25VUkwnLCAxKTtcclxuICAgICAgICAvLyBpZiBsb2FkZWQgYW5kIGFuIG9ubG9hZCgpIGV4aXN0cywgZmlyZSBpbW1lZGlhdGVseS5cclxuICAgICAgICBpZiAocy5yZWFkeVN0YXRlID09PSAzICYmIGluc3RhbmNlT3B0aW9ucy5vbmxvYWQpIHtcclxuICAgICAgICAgIC8vIGFzc3VtZSBzdWNjZXNzIGJhc2VkIG9uIHRydXRoeSBkdXJhdGlvbi5cclxuICAgICAgICAgIHdyYXBDYWxsYmFjayhzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2VPcHRpb25zLm9ubG9hZC5hcHBseShzLCBbKCEhcy5kdXJhdGlvbildKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmVzZXQgYSBmZXcgc3RhdGUgcHJvcGVydGllc1xyXG5cclxuICAgICAgcy5sb2FkZWQgPSBmYWxzZTtcclxuICAgICAgcy5yZWFkeVN0YXRlID0gMTtcclxuICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG4gICAgICBzLmlkMyA9IHt9O1xyXG5cclxuICAgICAgLy8gVE9ETzogSWYgc3dpdGNoaW5nIGZyb20gSFRNTDUgLT4gZmxhc2ggKG9yIHZpY2UgdmVyc2EpLCBzdG9wIGN1cnJlbnRseS1wbGF5aW5nIGF1ZGlvLlxyXG5cclxuICAgICAgaWYgKGh0bWw1T0soaW5zdGFuY2VPcHRpb25zKSkge1xyXG5cclxuICAgICAgICBvU291bmQgPSBzLl9zZXR1cF9odG1sNShpbnN0YW5jZU9wdGlvbnMpO1xyXG5cclxuICAgICAgICBpZiAoIW9Tb3VuZC5fY2FsbGVkX2xvYWQpIHtcclxuXHJcbiAgICAgICAgICBzLl9odG1sNV9jYW5wbGF5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgLy8gVE9ETzogcmV2aWV3IGNhbGxlZF9sb2FkIC8gaHRtbDVfY2FucGxheSBsb2dpY1xyXG5cclxuICAgICAgICAgIC8vIGlmIHVybCBwcm92aWRlZCBkaXJlY3RseSB0byBsb2FkKCksIGFzc2lnbiBpdCBoZXJlLlxyXG5cclxuICAgICAgICAgIGlmIChzLnVybCAhPT0gaW5zdGFuY2VPcHRpb25zLnVybCkge1xyXG5cclxuICAgICAgICAgICAgc20yLl93RChfd0RTKCdtYW5VUkwnKSArICc6ICcgKyBpbnN0YW5jZU9wdGlvbnMudXJsKTtcclxuXHJcbiAgICAgICAgICAgIHMuX2Euc3JjID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IHJldmlldyAvIHJlLWFwcGx5IGFsbCByZWxldmFudCBvcHRpb25zICh2b2x1bWUsIGxvb3AsIG9ucG9zaXRpb24gZXRjLilcclxuXHJcbiAgICAgICAgICAgIC8vIHJlc2V0IHBvc2l0aW9uIGZvciBuZXcgVVJMXHJcbiAgICAgICAgICAgIHMuc2V0UG9zaXRpb24oMCk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGdpdmVuIGV4cGxpY2l0IGxvYWQgY2FsbCwgdHJ5IHRvIHByZWxvYWQuXHJcblxyXG4gICAgICAgICAgLy8gZWFybHkgSFRNTDUgaW1wbGVtZW50YXRpb24gKG5vbi1zdGFuZGFyZClcclxuICAgICAgICAgIHMuX2EuYXV0b2J1ZmZlciA9ICdhdXRvJztcclxuXHJcbiAgICAgICAgICAvLyBzdGFuZGFyZCBwcm9wZXJ0eSwgdmFsdWVzOiBub25lIC8gbWV0YWRhdGEgLyBhdXRvXHJcbiAgICAgICAgICAvLyByZWZlcmVuY2U6IGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9mZjk3NDc1OSUyOHY9dnMuODUlMjkuYXNweFxyXG4gICAgICAgICAgcy5fYS5wcmVsb2FkID0gJ2F1dG8nO1xyXG5cclxuICAgICAgICAgIHMuX2EuX2NhbGxlZF9sb2FkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJZ25vcmluZyByZXF1ZXN0IHRvIGxvYWQgYWdhaW4nKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IE5vIGZsYXNoIHN1cHBvcnQuIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzLl9pTy51cmwgJiYgcy5faU8udXJsLm1hdGNoKC9kYXRhXFw6L2kpKSB7XHJcbiAgICAgICAgICAvLyBkYXRhOiBVUklzIG5vdCBzdXBwb3J0ZWQgYnkgRmxhc2gsIGVpdGhlci5cclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IGRhdGE6IFVSSXMgbm90IHN1cHBvcnRlZCB2aWEgRmxhc2guIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBzLmlzSFRNTDUgPSBmYWxzZTtcclxuICAgICAgICAgIHMuX2lPID0gcG9saWN5Rml4KGxvb3BGaXgoaW5zdGFuY2VPcHRpb25zKSk7XHJcbiAgICAgICAgICAvLyBpZiB3ZSBoYXZlIFwicG9zaXRpb25cIiwgZGlzYWJsZSBhdXRvLXBsYXkgYXMgd2UnbGwgYmUgc2Vla2luZyB0byB0aGF0IHBvc2l0aW9uIGF0IG9ubG9hZCgpLlxyXG4gICAgICAgICAgaWYgKHMuX2lPLmF1dG9QbGF5ICYmIChzLl9pTy5wb3NpdGlvbiB8fCBzLl9pTy5mcm9tKSkge1xyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBEaXNhYmxpbmcgYXV0b1BsYXkgYmVjYXVzZSBvZiBub24temVybyBvZmZzZXQgY2FzZScpO1xyXG4gICAgICAgICAgICBzLl9pTy5hdXRvUGxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gcmUtYXNzaWduIGxvY2FsIHNob3J0Y3V0XHJcbiAgICAgICAgICBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuICAgICAgICAgIGlmIChmViA9PT0gOCkge1xyXG4gICAgICAgICAgICBmbGFzaC5fbG9hZChzLmlkLCBpbnN0YW5jZU9wdGlvbnMudXJsLCBpbnN0YW5jZU9wdGlvbnMuc3RyZWFtLCBpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXksIGluc3RhbmNlT3B0aW9ucy51c2VQb2xpY3lGaWxlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZsYXNoLl9sb2FkKHMuaWQsIGluc3RhbmNlT3B0aW9ucy51cmwsICEhKGluc3RhbmNlT3B0aW9ucy5zdHJlYW0pLCAhIShpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXkpLCBpbnN0YW5jZU9wdGlvbnMubG9vcHMgfHwgMSwgISEoaW5zdGFuY2VPcHRpb25zLmF1dG9Mb2FkKSwgaW5zdGFuY2VPcHRpb25zLnVzZVBvbGljeUZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgX3dEUygnc21FcnJvcicsIDIpO1xyXG4gICAgICAgICAgZGVidWdUUygnb25sb2FkJywgZmFsc2UpO1xyXG4gICAgICAgICAgY2F0Y2hFcnJvcih7XHJcbiAgICAgICAgICAgIHR5cGU6ICdTTVNPVU5EX0xPQURfSlNfRVhDRVBUSU9OJyxcclxuICAgICAgICAgICAgZmF0YWw6IHRydWVcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFmdGVyIGFsbCBvZiB0aGlzLCBlbnN1cmUgc291bmQgdXJsIGlzIHVwIHRvIGRhdGUuXHJcbiAgICAgIHMudXJsID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmxvYWRzIGEgc291bmQsIGNhbmNlbGluZyBhbnkgb3BlbiBIVFRQIHJlcXVlc3RzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy51bmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIEZsYXNoIDgvQVMyIGNhbid0IFwiY2xvc2VcIiBhIHN0cmVhbSAtIGZha2UgaXQgYnkgbG9hZGluZyBhbiBlbXB0eSBVUkxcclxuICAgICAgLy8gRmxhc2ggOS9BUzM6IENsb3NlIHN0cmVhbSwgcHJldmVudGluZyBmdXJ0aGVyIGxvYWRcclxuICAgICAgLy8gSFRNTDU6IE1vc3QgVUFzIHdpbGwgdXNlIGVtcHR5IFVSTFxyXG5cclxuICAgICAgaWYgKHMucmVhZHlTdGF0ZSAhPT0gMCkge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiB1bmxvYWQoKScpO1xyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAgIGlmIChmViA9PT0gOCkge1xyXG4gICAgICAgICAgICBmbGFzaC5fdW5sb2FkKHMuaWQsIGVtcHR5VVJMKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZsYXNoLl91bmxvYWQocy5pZCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICAgIGlmIChzLl9hKSB7XHJcblxyXG4gICAgICAgICAgICBzLl9hLnBhdXNlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyB1cGRhdGUgZW1wdHkgVVJMLCB0b29cclxuICAgICAgICAgICAgbGFzdFVSTCA9IGh0bWw1VW5sb2FkKHMuX2EpO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZXNldCBsb2FkL3N0YXR1cyBmbGFnc1xyXG4gICAgICAgIHJlc2V0UHJvcGVydGllcygpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVubG9hZHMgYW5kIGRlc3Ryb3lzIGEgc291bmQuXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmRlc3RydWN0ID0gZnVuY3Rpb24oX2JGcm9tU00pIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IERlc3RydWN0Jyk7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAvLyBraWxsIHNvdW5kIHdpdGhpbiBGbGFzaFxyXG4gICAgICAgIC8vIERpc2FibGUgdGhlIG9uZmFpbHVyZSBoYW5kbGVyXHJcbiAgICAgICAgcy5faU8ub25mYWlsdXJlID0gbnVsbDtcclxuICAgICAgICBmbGFzaC5fZGVzdHJveVNvdW5kKHMuaWQpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICBpZiAocy5fYSkge1xyXG4gICAgICAgICAgcy5fYS5wYXVzZSgpO1xyXG4gICAgICAgICAgaHRtbDVVbmxvYWQocy5fYSk7XHJcbiAgICAgICAgICBpZiAoIXVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuICAgICAgICAgICAgcmVtb3ZlX2h0bWw1X2V2ZW50cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gYnJlYWsgb2J2aW91cyBjaXJjdWxhciByZWZlcmVuY2VcclxuICAgICAgICAgIHMuX2EuX3MgPSBudWxsO1xyXG4gICAgICAgICAgcy5fYSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFfYkZyb21TTSkge1xyXG4gICAgICAgIC8vIGVuc3VyZSBkZWxldGlvbiBmcm9tIGNvbnRyb2xsZXJcclxuICAgICAgICBzbTIuZGVzdHJveVNvdW5kKHMuaWQsIHRydWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJlZ2lucyBwbGF5aW5nIGEgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIE9wdGlvbmFsOiBTb3VuZCBvcHRpb25zXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMucGxheSA9IGZ1bmN0aW9uKG9PcHRpb25zLCBfdXBkYXRlUGxheVN0YXRlKSB7XHJcblxyXG4gICAgICB2YXIgZk4sIGFsbG93TXVsdGksIGEsIG9ucmVhZHksXHJcbiAgICAgICAgICBhdWRpb0Nsb25lLCBvbmVuZGVkLCBvbmNhbnBsYXksXHJcbiAgICAgICAgICBzdGFydE9LID0gdHJ1ZSxcclxuICAgICAgICAgIGV4aXQgPSBudWxsO1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGZOID0gcy5pZCArICc6IHBsYXkoKTogJztcclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgLy8gZGVmYXVsdCB0byB0cnVlXHJcbiAgICAgIF91cGRhdGVQbGF5U3RhdGUgPSAoX3VwZGF0ZVBsYXlTdGF0ZSA9PT0gX3VuZGVmaW5lZCA/IHRydWUgOiBfdXBkYXRlUGxheVN0YXRlKTtcclxuXHJcbiAgICAgIGlmICghb09wdGlvbnMpIHtcclxuICAgICAgICBvT3B0aW9ucyA9IHt9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBmaXJzdCwgdXNlIGxvY2FsIFVSTCAoaWYgc3BlY2lmaWVkKVxyXG4gICAgICBpZiAocy51cmwpIHtcclxuICAgICAgICBzLl9pTy51cmwgPSBzLnVybDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbWl4IGluIGFueSBvcHRpb25zIGRlZmluZWQgYXQgY3JlYXRlU291bmQoKVxyXG4gICAgICBzLl9pTyA9IG1peGluKHMuX2lPLCBzLm9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gbWl4IGluIGFueSBvcHRpb25zIHNwZWNpZmljIHRvIHRoaXMgbWV0aG9kXHJcbiAgICAgIHMuX2lPID0gbWl4aW4ob09wdGlvbnMsIHMuX2lPKTtcclxuXHJcbiAgICAgIHMuX2lPLnVybCA9IHBhcnNlVVJMKHMuX2lPLnVybCk7XHJcblxyXG4gICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgLy8gUlRNUC1vbmx5XHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmIHMuX2lPLnNlcnZlclVSTCAmJiAhcy5jb25uZWN0ZWQpIHtcclxuICAgICAgICBpZiAoIXMuZ2V0QXV0b1BsYXkoKSkge1xyXG4gICAgICAgICAgc20yLl93RChmTiArJyBOZXRzdHJlYW0gbm90IGNvbm5lY3RlZCB5ZXQgLSBzZXR0aW5nIGF1dG9QbGF5Jyk7XHJcbiAgICAgICAgICBzLnNldEF1dG9QbGF5KHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBwbGF5IHdpbGwgYmUgY2FsbGVkIGluIG9uY29ubmVjdCgpXHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChodG1sNU9LKHMuX2lPKSkge1xyXG4gICAgICAgIHMuX3NldHVwX2h0bWw1KHMuX2lPKTtcclxuICAgICAgICBzdGFydF9odG1sNV90aW1lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDEgJiYgIXMucGF1c2VkKSB7XHJcblxyXG4gICAgICAgIGFsbG93TXVsdGkgPSBzLl9pTy5tdWx0aVNob3Q7XHJcblxyXG4gICAgICAgIGlmICghYWxsb3dNdWx0aSkge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQWxyZWFkeSBwbGF5aW5nIChvbmUtc2hvdCknLCAxKTtcclxuXHJcbiAgICAgICAgICBpZiAocy5pc0hUTUw1KSB7XHJcbiAgICAgICAgICAgIC8vIGdvIGJhY2sgdG8gb3JpZ2luYWwgcG9zaXRpb24uXHJcbiAgICAgICAgICAgIHMuc2V0UG9zaXRpb24ocy5faU8ucG9zaXRpb24pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGV4aXQgPSBzO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc20yLl93RChmTiArICdBbHJlYWR5IHBsYXlpbmcgKG11bHRpLXNob3QpJywgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGV4aXQgIT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gZXhpdDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZWRnZSBjYXNlOiBwbGF5KCkgd2l0aCBleHBsaWNpdCBVUkwgcGFyYW1ldGVyXHJcbiAgICAgIGlmIChvT3B0aW9ucy51cmwgJiYgb09wdGlvbnMudXJsICE9PSBzLnVybCkge1xyXG5cclxuICAgICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIGNyZWF0ZVNvdW5kKCkgZm9sbG93ZWQgYnkgbG9hZCgpIC8gcGxheSgpIHdpdGggdXJsOyBhdm9pZCBkb3VibGUtbG9hZCBjYXNlLlxyXG4gICAgICAgIGlmICghcy5yZWFkeVN0YXRlICYmICFzLmlzSFRNTDUgJiYgZlYgPT09IDggJiYgdXJsT21pdHRlZCkge1xyXG5cclxuICAgICAgICAgIHVybE9taXR0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBsb2FkIHVzaW5nIG1lcmdlZCBvcHRpb25zXHJcbiAgICAgICAgICBzLmxvYWQocy5faU8pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMubG9hZGVkKSB7XHJcblxyXG4gICAgICAgIGlmIChzLnJlYWR5U3RhdGUgPT09IDApIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0F0dGVtcHRpbmcgdG8gbG9hZCcpO1xyXG5cclxuICAgICAgICAgIC8vIHRyeSB0byBnZXQgdGhpcyBzb3VuZCBwbGF5aW5nIEFTQVBcclxuICAgICAgICAgIGlmICghcy5pc0hUTUw1ICYmICFzbTIuaHRtbDVPbmx5KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBmbGFzaDogYXNzaWduIGRpcmVjdGx5IGJlY2F1c2Ugc2V0QXV0b1BsYXkoKSBpbmNyZW1lbnRzIHRoZSBpbnN0YW5jZUNvdW50XHJcbiAgICAgICAgICAgIHMuX2lPLmF1dG9QbGF5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgcy5sb2FkKHMuX2lPKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAgICAgLy8gaU9TIG5lZWRzIHRoaXMgd2hlbiByZWN5Y2xpbmcgc291bmRzLCBsb2FkaW5nIGEgbmV3IFVSTCBvbiBhbiBleGlzdGluZyBvYmplY3QuXHJcbiAgICAgICAgICAgIHMubG9hZChzLl9pTyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIHNtMi5fd0QoZk4gKyAnVW5zdXBwb3J0ZWQgdHlwZS4gRXhpdGluZy4nKTtcclxuICAgICAgICAgICAgZXhpdCA9IHM7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEhUTUw1IGhhY2sgLSByZS1zZXQgaW5zdGFuY2VPcHRpb25zP1xyXG4gICAgICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChzLnJlYWR5U3RhdGUgPT09IDIpIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0NvdWxkIG5vdCBsb2FkIC0gZXhpdGluZycsIDIpO1xyXG4gICAgICAgICAgZXhpdCA9IHM7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChmTiArICdMb2FkaW5nIC0gYXR0ZW1wdGluZyB0byBwbGF5Li4uJyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFwicGxheSgpXCJcclxuICAgICAgICBzbTIuX3dEKGZOLnN1YnN0cigwLCBmTi5sYXN0SW5kZXhPZignOicpKSk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXhpdCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBleGl0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiBmViA9PT0gOSAmJiBzLnBvc2l0aW9uID4gMCAmJiBzLnBvc2l0aW9uID09PSBzLmR1cmF0aW9uKSB7XHJcbiAgICAgICAgLy8gZmxhc2ggOSBuZWVkcyBhIHBvc2l0aW9uIHJlc2V0IGlmIHBsYXkoKSBpcyBjYWxsZWQgd2hpbGUgYXQgdGhlIGVuZCBvZiBhIHNvdW5kLlxyXG4gICAgICAgIHNtMi5fd0QoZk4gKyAnU291bmQgYXQgZW5kLCByZXNldHRpbmcgdG8gcG9zaXRpb246IDAnKTtcclxuICAgICAgICBvT3B0aW9ucy5wb3NpdGlvbiA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTdHJlYW1zIHdpbGwgcGF1c2Ugd2hlbiB0aGVpciBidWZmZXIgaXMgZnVsbCBpZiB0aGV5IGFyZSBiZWluZyBsb2FkZWQuXHJcbiAgICAgICAqIEluIHRoaXMgY2FzZSBwYXVzZWQgaXMgdHJ1ZSwgYnV0IHRoZSBzb25nIGhhc24ndCBzdGFydGVkIHBsYXlpbmcgeWV0LlxyXG4gICAgICAgKiBJZiB3ZSBqdXN0IGNhbGwgcmVzdW1lKCkgdGhlIG9ucGxheSgpIGNhbGxiYWNrIHdpbGwgbmV2ZXIgYmUgY2FsbGVkLlxyXG4gICAgICAgKiBTbyBvbmx5IGNhbGwgcmVzdW1lKCkgaWYgdGhlIHBvc2l0aW9uIGlzID4gMC5cclxuICAgICAgICogQW5vdGhlciByZWFzb24gaXMgYmVjYXVzZSBvcHRpb25zIGxpa2Ugdm9sdW1lIHdvbid0IGhhdmUgYmVlbiBhcHBsaWVkIHlldC5cclxuICAgICAgICogRm9yIG5vcm1hbCBzb3VuZHMsIGp1c3QgcmVzdW1lLlxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIGlmIChzLnBhdXNlZCAmJiBzLnBvc2l0aW9uID49IDAgJiYgKCFzLl9pTy5zZXJ2ZXJVUkwgfHwgcy5wb3NpdGlvbiA+IDApKSB7XHJcblxyXG4gICAgICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzM3YjE3ZGY3NWNjNGQ3YTkwYmY2XHJcbiAgICAgICAgc20yLl93RChmTiArICdSZXN1bWluZyBmcm9tIHBhdXNlZCBzdGF0ZScsIDEpO1xyXG4gICAgICAgIHMucmVzdW1lKCk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBzLl9pTyA9IG1peGluKG9PcHRpb25zLCBzLl9pTyk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFByZWxvYWQgaW4gdGhlIGV2ZW50IG9mIHBsYXkoKSB3aXRoIHBvc2l0aW9uIHVuZGVyIEZsYXNoLFxyXG4gICAgICAgICAqIG9yIGZyb20vdG8gcGFyYW1ldGVycyBhbmQgbm9uLVJUTVAgY2FzZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmICgoKCFzLmlzSFRNTDUgJiYgcy5faU8ucG9zaXRpb24gIT09IG51bGwgJiYgcy5faU8ucG9zaXRpb24gPiAwKSB8fCAocy5faU8uZnJvbSAhPT0gbnVsbCAmJiBzLl9pTy5mcm9tID4gMCkgfHwgcy5faU8udG8gIT09IG51bGwpICYmIHMuaW5zdGFuY2VDb3VudCA9PT0gMCAmJiBzLnBsYXlTdGF0ZSA9PT0gMCAmJiAhcy5faU8uc2VydmVyVVJMKSB7XHJcblxyXG4gICAgICAgICAgb25yZWFkeSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBzb3VuZCBcImNhbnBsYXlcIiBvciBvbmxvYWQoKVxyXG4gICAgICAgICAgICAvLyByZS1hcHBseSBwb3NpdGlvbi9mcm9tL3RvIHRvIGluc3RhbmNlIG9wdGlvbnMsIGFuZCBzdGFydCBwbGF5YmFja1xyXG4gICAgICAgICAgICBzLl9pTyA9IG1peGluKG9PcHRpb25zLCBzLl9pTyk7XHJcbiAgICAgICAgICAgIHMucGxheShzLl9pTyk7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIC8vIEhUTUw1IG5lZWRzIHRvIGF0IGxlYXN0IGhhdmUgXCJjYW5wbGF5XCIgZmlyZWQgYmVmb3JlIHNlZWtpbmcuXHJcbiAgICAgICAgICBpZiAocy5pc0hUTUw1ICYmICFzLl9odG1sNV9jYW5wbGF5KSB7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGlzIGhhc24ndCBiZWVuIGxvYWRlZCB5ZXQuIGxvYWQgaXQgZmlyc3QsIGFuZCB0aGVuIGRvIHRoaXMgYWdhaW4uXHJcbiAgICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQmVnaW5uaW5nIGxvYWQgZm9yIG5vbi16ZXJvIG9mZnNldCBjYXNlJyk7XHJcblxyXG4gICAgICAgICAgICBzLmxvYWQoe1xyXG4gICAgICAgICAgICAgIC8vIG5vdGU6IGN1c3RvbSBIVE1MNS1vbmx5IGV2ZW50IGFkZGVkIGZvciBmcm9tL3RvIGltcGxlbWVudGF0aW9uLlxyXG4gICAgICAgICAgICAgIF9vbmNhbnBsYXk6IG9ucmVhZHlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBleGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmICghcy5pc0hUTUw1ICYmICFzLmxvYWRlZCAmJiAoIXMucmVhZHlTdGF0ZSB8fCBzLnJlYWR5U3RhdGUgIT09IDIpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB0byBiZSBzYWZlLCBwcmVsb2FkIHRoZSB3aG9sZSB0aGluZyBpbiBGbGFzaC5cclxuXHJcbiAgICAgICAgICAgIHNtMi5fd0QoZk4gKyAnUHJlbG9hZGluZyBmb3Igbm9uLXplcm8gb2Zmc2V0IGNhc2UnKTtcclxuXHJcbiAgICAgICAgICAgIHMubG9hZCh7XHJcbiAgICAgICAgICAgICAgb25sb2FkOiBvbnJlYWR5XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZXhpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoZXhpdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhpdDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBvdGhlcndpc2UsIHdlJ3JlIHJlYWR5IHRvIGdvLiByZS1hcHBseSBsb2NhbCBvcHRpb25zLCBhbmQgY29udGludWVcclxuXHJcbiAgICAgICAgICBzLl9pTyA9IGFwcGx5RnJvbVRvKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc20yLl93RChmTiArICdTdGFydGluZyB0byBwbGF5Jyk7XHJcblxyXG4gICAgICAgIC8vIGluY3JlbWVudCBpbnN0YW5jZSBjb3VudGVyLCB3aGVyZSBlbmFibGVkICsgc3VwcG9ydGVkXHJcbiAgICAgICAgaWYgKCFzLmluc3RhbmNlQ291bnQgfHwgcy5faU8ubXVsdGlTaG90RXZlbnRzIHx8IChzLmlzSFRNTDUgJiYgcy5faU8ubXVsdGlTaG90ICYmICF1c2VHbG9iYWxIVE1MNUF1ZGlvKSB8fCAoIXMuaXNIVE1MNSAmJiBmViA+IDggJiYgIXMuZ2V0QXV0b1BsYXkoKSkpIHtcclxuICAgICAgICAgIHMuaW5zdGFuY2VDb3VudCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgZmlyc3QgcGxheSBhbmQgb25wb3NpdGlvbiBwYXJhbWV0ZXJzIGV4aXN0LCBhcHBseSB0aGVtIG5vd1xyXG4gICAgICAgIGlmIChzLl9pTy5vbnBvc2l0aW9uICYmIHMucGxheVN0YXRlID09PSAwKSB7XHJcbiAgICAgICAgICBhdHRhY2hPblBvc2l0aW9uKHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcy5wbGF5U3RhdGUgPSAxO1xyXG4gICAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHMucG9zaXRpb24gPSAocy5faU8ucG9zaXRpb24gIT09IF91bmRlZmluZWQgJiYgIWlzTmFOKHMuX2lPLnBvc2l0aW9uKSA/IHMuX2lPLnBvc2l0aW9uIDogMCk7XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgICBzLl9pTyA9IHBvbGljeUZpeChsb29wRml4KHMuX2lPKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocy5faU8ub25wbGF5ICYmIF91cGRhdGVQbGF5U3RhdGUpIHtcclxuICAgICAgICAgIHMuX2lPLm9ucGxheS5hcHBseShzKTtcclxuICAgICAgICAgIG9ucGxheV9jYWxsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcy5zZXRWb2x1bWUocy5faU8udm9sdW1lLCB0cnVlKTtcclxuICAgICAgICBzLnNldFBhbihzLl9pTy5wYW4sIHRydWUpO1xyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAgIHN0YXJ0T0sgPSBmbGFzaC5fc3RhcnQocy5pZCwgcy5faU8ubG9vcHMgfHwgMSwgKGZWID09PSA5ID8gcy5wb3NpdGlvbiA6IHMucG9zaXRpb24gLyBtc2VjU2NhbGUpLCBzLl9pTy5tdWx0aVNob3QgfHwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgIGlmIChmViA9PT0gOSAmJiAhc3RhcnRPSykge1xyXG4gICAgICAgICAgICAvLyBlZGdlIGNhc2U6IG5vIHNvdW5kIGhhcmR3YXJlLCBvciAzMi1jaGFubmVsIGZsYXNoIGNlaWxpbmcgaGl0LlxyXG4gICAgICAgICAgICAvLyBhcHBsaWVzIG9ubHkgdG8gRmxhc2ggOSwgbm9uLU5ldFN0cmVhbS9Nb3ZpZVN0YXIgc291bmRzLlxyXG4gICAgICAgICAgICAvLyBodHRwOi8vaGVscC5hZG9iZS5jb20vZW5fVVMvRmxhc2hQbGF0Zm9ybS9yZWZlcmVuY2UvYWN0aW9uc2NyaXB0LzMvZmxhc2gvbWVkaWEvU291bmQuaHRtbCNwbGF5JTI4JTI5XHJcbiAgICAgICAgICAgIHNtMi5fd0QoZk4gKyAnTm8gc291bmQgaGFyZHdhcmUsIG9yIDMyLXNvdW5kIGNlaWxpbmcgaGl0JywgMik7XHJcbiAgICAgICAgICAgIGlmIChzLl9pTy5vbnBsYXllcnJvcikge1xyXG4gICAgICAgICAgICAgIHMuX2lPLm9ucGxheWVycm9yLmFwcGx5KHMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIGlmIChzLmluc3RhbmNlQ291bnQgPCAyKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBIVE1MNSBzaW5nbGUtaW5zdGFuY2UgY2FzZVxyXG5cclxuICAgICAgICAgICAgc3RhcnRfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGEgPSBzLl9zZXR1cF9odG1sNSgpO1xyXG5cclxuICAgICAgICAgICAgcy5zZXRQb3NpdGlvbihzLl9pTy5wb3NpdGlvbik7XHJcblxyXG4gICAgICAgICAgICBhLnBsYXkoKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gSFRNTDUgbXVsdGktc2hvdCBjYXNlXHJcblxyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBDbG9uaW5nIEF1ZGlvKCkgZm9yIGluc3RhbmNlICMnICsgcy5pbnN0YW5jZUNvdW50ICsgJy4uLicpO1xyXG5cclxuICAgICAgICAgICAgYXVkaW9DbG9uZSA9IG5ldyBBdWRpbyhzLl9pTy51cmwpO1xyXG5cclxuICAgICAgICAgICAgb25lbmRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGV2ZW50LnJlbW92ZShhdWRpb0Nsb25lLCAnZW5kZWQnLCBvbmVuZGVkKTtcclxuICAgICAgICAgICAgICBzLl9vbmZpbmlzaChzKTtcclxuICAgICAgICAgICAgICAvLyBjbGVhbnVwXHJcbiAgICAgICAgICAgICAgaHRtbDVVbmxvYWQoYXVkaW9DbG9uZSk7XHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBvbmNhbnBsYXkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBldmVudC5yZW1vdmUoYXVkaW9DbG9uZSwgJ2NhbnBsYXknLCBvbmNhbnBsYXkpO1xyXG4gICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhdWRpb0Nsb25lLmN1cnJlbnRUaW1lID0gcy5faU8ucG9zaXRpb24vbXNlY1NjYWxlO1xyXG4gICAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGFpbihzLmlkICsgJzogbXVsdGlTaG90IHBsYXkoKSBmYWlsZWQgdG8gYXBwbHkgcG9zaXRpb24gb2YgJyArIChzLl9pTy5wb3NpdGlvbi9tc2VjU2NhbGUpKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZS5wbGF5KCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBldmVudC5hZGQoYXVkaW9DbG9uZSwgJ2VuZGVkJywgb25lbmRlZCk7XHJcblxyXG4gICAgICAgICAgICAvLyBhcHBseSB2b2x1bWUgdG8gY2xvbmVzLCB0b29cclxuICAgICAgICAgICAgaWYgKHMuX2lPLnZvbHVtZSAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUudm9sdW1lID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgcy5faU8udm9sdW1lLzEwMCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBwbGF5aW5nIG11bHRpcGxlIG11dGVkIHNvdW5kcz8gaWYgeW91IGRvIHRoaXMsIHlvdSdyZSB3ZWlyZCA7KSAtIGJ1dCBsZXQncyBjb3ZlciBpdC5cclxuICAgICAgICAgICAgaWYgKHMubXV0ZWQpIHtcclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lLm11dGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHMuX2lPLnBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgLy8gSFRNTDUgYXVkaW8gY2FuJ3Qgc2VlayBiZWZvcmUgb25wbGF5KCkgZXZlbnQgaGFzIGZpcmVkLlxyXG4gICAgICAgICAgICAgIC8vIHdhaXQgZm9yIGNhbnBsYXksIHRoZW4gc2VlayB0byBwb3NpdGlvbiBhbmQgc3RhcnQgcGxheWJhY2suXHJcbiAgICAgICAgICAgICAgZXZlbnQuYWRkKGF1ZGlvQ2xvbmUsICdjYW5wbGF5Jywgb25jYW5wbGF5KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBiZWdpbiBwbGF5YmFjayBhdCBjdXJyZW50VGltZTogMFxyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUucGxheSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGp1c3QgZm9yIGNvbnZlbmllbmNlXHJcbiAgICB0aGlzLnN0YXJ0ID0gdGhpcy5wbGF5O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RvcHMgcGxheWluZyBhIHNvdW5kIChhbmQgb3B0aW9uYWxseSwgYWxsIHNvdW5kcylcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGJBbGwgT3B0aW9uYWw6IFdoZXRoZXIgdG8gc3RvcCBhbGwgc291bmRzXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc3RvcCA9IGZ1bmN0aW9uKGJBbGwpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTyxcclxuICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb247XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDEpIHtcclxuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogc3RvcCgpJyk7XHJcblxyXG4gICAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG4gICAgICAgIHMuX3Jlc2V0T25Qb3NpdGlvbigwKTtcclxuICAgICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIG9uUG9zaXRpb24gbGlzdGVuZXJzLCBpZiBhbnlcclxuICAgICAgICBkZXRhY2hPblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIC8vIGFuZCBcInRvXCIgcG9zaXRpb24sIGlmIHNldFxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudG8pIHtcclxuICAgICAgICAgIHMuY2xlYXJPblBvc2l0aW9uKGluc3RhbmNlT3B0aW9ucy50byk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAgIGZsYXNoLl9zdG9wKHMuaWQsIGJBbGwpO1xyXG5cclxuICAgICAgICAgIC8vIGhhY2sgZm9yIG5ldFN0cmVhbToganVzdCB1bmxvYWRcclxuICAgICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuc2VydmVyVVJMKSB7XHJcbiAgICAgICAgICAgIHMudW5sb2FkKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgaWYgKHMuX2EpIHtcclxuXHJcbiAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBzLnBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgLy8gYWN0IGxpa2UgRmxhc2gsIHRob3VnaFxyXG4gICAgICAgICAgICBzLnNldFBvc2l0aW9uKDApO1xyXG5cclxuICAgICAgICAgICAgLy8gaGFjazogcmVmbGVjdCBvbGQgcG9zaXRpb24gZm9yIG9uc3RvcCgpIChhbHNvIGxpa2UgRmxhc2gpXHJcbiAgICAgICAgICAgIHMucG9zaXRpb24gPSBvcmlnaW5hbFBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgLy8gaHRtbDUgaGFzIG5vIHN0b3AoKVxyXG4gICAgICAgICAgICAvLyBOT1RFOiBwYXVzaW5nIG1lYW5zIGlPUyByZXF1aXJlcyBpbnRlcmFjdGlvbiB0byByZXN1bWUuXHJcbiAgICAgICAgICAgIHMuX2EucGF1c2UoKTtcclxuXHJcbiAgICAgICAgICAgIHMucGxheVN0YXRlID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIGFuZCB1cGRhdGUgVUlcclxuICAgICAgICAgICAgcy5fb25UaW1lcigpO1xyXG5cclxuICAgICAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzLmluc3RhbmNlQ291bnQgPSAwO1xyXG4gICAgICAgIHMuX2lPID0ge307XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMub25zdG9wKSB7XHJcbiAgICAgICAgICBpbnN0YW5jZU9wdGlvbnMub25zdG9wLmFwcGx5KHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmRvY3VtZW50ZWQvaW50ZXJuYWw6IFNldHMgYXV0b1BsYXkgZm9yIFJUTVAuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBhdXRvUGxheSBzdGF0ZVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zZXRBdXRvUGxheSA9IGZ1bmN0aW9uKGF1dG9QbGF5KSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBBdXRvcGxheSB0dXJuZWQgJyArIChhdXRvUGxheSA/ICdvbicgOiAnb2ZmJykpO1xyXG4gICAgICBzLl9pTy5hdXRvUGxheSA9IGF1dG9QbGF5O1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBmbGFzaC5fc2V0QXV0b1BsYXkocy5pZCwgYXV0b1BsYXkpO1xyXG4gICAgICAgIGlmIChhdXRvUGxheSkge1xyXG4gICAgICAgICAgLy8gb25seSBpbmNyZW1lbnQgdGhlIGluc3RhbmNlQ291bnQgaWYgdGhlIHNvdW5kIGlzbid0IGxvYWRlZCAoVE9ETzogdmVyaWZ5IFJUTVApXHJcbiAgICAgICAgICBpZiAoIXMuaW5zdGFuY2VDb3VudCAmJiBzLnJlYWR5U3RhdGUgPT09IDEpIHtcclxuICAgICAgICAgICAgcy5pbnN0YW5jZUNvdW50Kys7XHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IEluY3JlbWVudGVkIGluc3RhbmNlIGNvdW50IHRvICcrcy5pbnN0YW5jZUNvdW50KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5kb2N1bWVudGVkL2ludGVybmFsOiBSZXR1cm5zIHRoZSBhdXRvUGxheSBib29sZWFuLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSBjdXJyZW50IGF1dG9QbGF5IHZhbHVlXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmdldEF1dG9QbGF5ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICByZXR1cm4gcy5faU8uYXV0b1BsYXk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIGEgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5Nc2VjT2Zmc2V0IFBvc2l0aW9uIChtaWxsaXNlY29uZHMpXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihuTXNlY09mZnNldCkge1xyXG5cclxuICAgICAgaWYgKG5Nc2VjT2Zmc2V0ID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgbk1zZWNPZmZzZXQgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgcG9zaXRpb24sIHBvc2l0aW9uMUssXHJcbiAgICAgICAgICAvLyBVc2UgdGhlIGR1cmF0aW9uIGZyb20gdGhlIGluc3RhbmNlIG9wdGlvbnMsIGlmIHdlIGRvbid0IGhhdmUgYSB0cmFjayBkdXJhdGlvbiB5ZXQuXHJcbiAgICAgICAgICAvLyBwb3NpdGlvbiA+PSAwIGFuZCA8PSBjdXJyZW50IGF2YWlsYWJsZSAobG9hZGVkKSBkdXJhdGlvblxyXG4gICAgICAgICAgb2Zmc2V0ID0gKHMuaXNIVE1MNSA/IE1hdGgubWF4KG5Nc2VjT2Zmc2V0LCAwKSA6IE1hdGgubWluKHMuZHVyYXRpb24gfHwgcy5faU8uZHVyYXRpb24sIE1hdGgubWF4KG5Nc2VjT2Zmc2V0LCAwKSkpO1xyXG5cclxuICAgICAgcy5wb3NpdGlvbiA9IG9mZnNldDtcclxuICAgICAgcG9zaXRpb24xSyA9IHMucG9zaXRpb24vbXNlY1NjYWxlO1xyXG4gICAgICBzLl9yZXNldE9uUG9zaXRpb24ocy5wb3NpdGlvbik7XHJcbiAgICAgIHMuX2lPLnBvc2l0aW9uID0gb2Zmc2V0O1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgcG9zaXRpb24gPSAoZlYgPT09IDkgPyBzLnBvc2l0aW9uIDogcG9zaXRpb24xSyk7XHJcblxyXG4gICAgICAgIGlmIChzLnJlYWR5U3RhdGUgJiYgcy5yZWFkeVN0YXRlICE9PSAyKSB7XHJcbiAgICAgICAgICAvLyBpZiBwYXVzZWQgb3Igbm90IHBsYXlpbmcsIHdpbGwgbm90IHJlc3VtZSAoYnkgcGxheWluZylcclxuICAgICAgICAgIGZsYXNoLl9zZXRQb3NpdGlvbihzLmlkLCBwb3NpdGlvbiwgKHMucGF1c2VkIHx8ICFzLnBsYXlTdGF0ZSksIHMuX2lPLm11bHRpU2hvdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIGlmIChzLl9hKSB7XHJcblxyXG4gICAgICAgIC8vIFNldCB0aGUgcG9zaXRpb24gaW4gdGhlIGNhbnBsYXkgaGFuZGxlciBpZiB0aGUgc291bmQgaXMgbm90IHJlYWR5IHlldFxyXG4gICAgICAgIGlmIChzLl9odG1sNV9jYW5wbGF5KSB7XHJcblxyXG4gICAgICAgICAgaWYgKHMuX2EuY3VycmVudFRpbWUgIT09IHBvc2l0aW9uMUspIHtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBET00vSlMgZXJyb3JzL2V4Y2VwdGlvbnMgdG8gd2F0Y2ggb3V0IGZvcjpcclxuICAgICAgICAgICAgICogaWYgc2VlayBpcyBiZXlvbmQgKGxvYWRlZD8pIHBvc2l0aW9uLCBcIkRPTSBleGNlcHRpb24gMTFcIlxyXG4gICAgICAgICAgICAgKiBcIklOREVYX1NJWkVfRVJSXCI6IERPTSBleGNlcHRpb24gMVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogc2V0UG9zaXRpb24oJyArIHBvc2l0aW9uMUsgKyAnKScpO1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBzLl9hLmN1cnJlbnRUaW1lID0gcG9zaXRpb24xSztcclxuICAgICAgICAgICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDAgfHwgcy5wYXVzZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFsbG93IHNlZWsgd2l0aG91dCBhdXRvLXBsYXkvcmVzdW1lXHJcbiAgICAgICAgICAgICAgICBzLl9hLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBzZXRQb3NpdGlvbignICsgcG9zaXRpb24xSyArICcpIGZhaWxlZDogJyArIGUubWVzc2FnZSwgMik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24xSykge1xyXG5cclxuICAgICAgICAgIC8vIHdhcm4gb24gbm9uLXplcm8gc2VlayBhdHRlbXB0c1xyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogc2V0UG9zaXRpb24oJyArIHBvc2l0aW9uMUsgKyAnKTogQ2Fubm90IHNlZWsgeWV0LCBzb3VuZCBub3QgcmVhZHknLCAyKTtcclxuICAgICAgICAgIHJldHVybiBzO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzLnBhdXNlZCkge1xyXG5cclxuICAgICAgICAgIC8vIGlmIHBhdXNlZCwgcmVmcmVzaCBVSSByaWdodCBhd2F5IGJ5IGZvcmNpbmcgdXBkYXRlXHJcbiAgICAgICAgICBzLl9vblRpbWVyKHRydWUpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGF1c2VzIHNvdW5kIHBsYXliYWNrLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKF9iQ2FsbEZsYXNoKSB7XHJcblxyXG4gICAgICBpZiAocy5wYXVzZWQgfHwgKHMucGxheVN0YXRlID09PSAwICYmIHMucmVhZHlTdGF0ZSAhPT0gMSkpIHtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogcGF1c2UoKScpO1xyXG4gICAgICBzLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGlmIChfYkNhbGxGbGFzaCB8fCBfYkNhbGxGbGFzaCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgICAgZmxhc2guX3BhdXNlKHMuaWQsIHMuX2lPLm11bHRpU2hvdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMuX3NldHVwX2h0bWw1KCkucGF1c2UoKTtcclxuICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbnBhdXNlKSB7XHJcbiAgICAgICAgcy5faU8ub25wYXVzZS5hcHBseShzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlc3VtZXMgc291bmQgcGxheWJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gYXV0by1sb2FkZWQgc3RyZWFtcyBwYXVzZSBvbiBidWZmZXIgZnVsbCB0aGV5IGhhdmUgYSBwbGF5U3RhdGUgb2YgMC5cclxuICAgICAqIFdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHBsYXlTdGF0ZSBpcyBzZXQgdG8gMSB3aGVuIHRoZXNlIHN0cmVhbXMgXCJyZXN1bWVcIi5cclxuICAgICAqIFdoZW4gYSBwYXVzZWQgc3RyZWFtIGlzIHJlc3VtZWQsIHdlIG5lZWQgdG8gdHJpZ2dlciB0aGUgb25wbGF5KCkgY2FsbGJhY2sgaWYgaXRcclxuICAgICAqIGhhc24ndCBiZWVuIGNhbGxlZCBhbHJlYWR5LiBJbiB0aGlzIGNhc2Ugc2luY2UgdGhlIHNvdW5kIGlzIGJlaW5nIHBsYXllZCBmb3IgdGhlXHJcbiAgICAgKiBmaXJzdCB0aW1lLCBJIHRoaW5rIGl0J3MgbW9yZSBhcHByb3ByaWF0ZSB0byBjYWxsIG9ucGxheSgpIHJhdGhlciB0aGFuIG9ucmVzdW1lKCkuXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgaWYgKCFzLnBhdXNlZCkge1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiByZXN1bWUoKScpO1xyXG4gICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICBzLnBsYXlTdGF0ZSA9IDE7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLmlzTW92aWVTdGFyICYmICFpbnN0YW5jZU9wdGlvbnMuc2VydmVyVVJMKSB7XHJcbiAgICAgICAgICAvLyBCaXphcnJlIFdlYmtpdCBidWcgKENocm9tZSByZXBvcnRlZCB2aWEgOHRyYWNrcy5jb20gZHVkZXMpOiBBQUMgY29udGVudCBwYXVzZWQgZm9yIDMwKyBzZWNvbmRzKD8pIHdpbGwgbm90IHJlc3VtZSB3aXRob3V0IGEgcmVwb3NpdGlvbi5cclxuICAgICAgICAgIHMuc2V0UG9zaXRpb24ocy5wb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmbGFzaCBtZXRob2QgaXMgdG9nZ2xlLWJhc2VkIChwYXVzZS9yZXN1bWUpXHJcbiAgICAgICAgZmxhc2guX3BhdXNlKHMuaWQsIGluc3RhbmNlT3B0aW9ucy5tdWx0aVNob3QpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgcy5fc2V0dXBfaHRtbDUoKS5wbGF5KCk7XHJcbiAgICAgICAgc3RhcnRfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghb25wbGF5X2NhbGxlZCAmJiBpbnN0YW5jZU9wdGlvbnMub25wbGF5KSB7XHJcblxyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy5vbnBsYXkuYXBwbHkocyk7XHJcbiAgICAgICAgb25wbGF5X2NhbGxlZCA9IHRydWU7XHJcblxyXG4gICAgICB9IGVsc2UgaWYgKGluc3RhbmNlT3B0aW9ucy5vbnJlc3VtZSkge1xyXG5cclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMub25yZXN1bWUuYXBwbHkocyk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVG9nZ2xlcyBzb3VuZCBwbGF5YmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMudG9nZ2xlUGF1c2UgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IHRvZ2dsZVBhdXNlKCknKTtcclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMCkge1xyXG4gICAgICAgIHMucGxheSh7XHJcbiAgICAgICAgICBwb3NpdGlvbjogKGZWID09PSA5ICYmICFzLmlzSFRNTDUgPyBzLnBvc2l0aW9uIDogcy5wb3NpdGlvbiAvIG1zZWNTY2FsZSlcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHMucGF1c2VkKSB7XHJcbiAgICAgICAgcy5yZXN1bWUoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzLnBhdXNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwYW5uaW5nIChMLVIpIGVmZmVjdC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gblBhbiBUaGUgcGFuIHZhbHVlICgtMTAwIHRvIDEwMClcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zZXRQYW4gPSBmdW5jdGlvbihuUGFuLCBiSW5zdGFuY2VPbmx5KSB7XHJcblxyXG4gICAgICBpZiAoblBhbiA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIG5QYW4gPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYkluc3RhbmNlT25seSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIGJJbnN0YW5jZU9ubHkgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBmbGFzaC5fc2V0UGFuKHMuaWQsIG5QYW4pO1xyXG4gICAgICB9IC8vIGVsc2UgeyBubyBIVE1MNSBwYW4/IH1cclxuXHJcbiAgICAgIHMuX2lPLnBhbiA9IG5QYW47XHJcblxyXG4gICAgICBpZiAoIWJJbnN0YW5jZU9ubHkpIHtcclxuICAgICAgICBzLnBhbiA9IG5QYW47XHJcbiAgICAgICAgcy5vcHRpb25zLnBhbiA9IG5QYW47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSB2b2x1bWUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5Wb2wgVGhlIHZvbHVtZSB2YWx1ZSAoMCB0byAxMDApXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc2V0Vm9sdW1lID0gZnVuY3Rpb24oblZvbCwgX2JJbnN0YW5jZU9ubHkpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBOb3RlOiBTZXR0aW5nIHZvbHVtZSBoYXMgbm8gZWZmZWN0IG9uIGlPUyBcInNwZWNpYWwgc25vd2ZsYWtlXCIgZGV2aWNlcy5cclxuICAgICAgICogSGFyZHdhcmUgdm9sdW1lIGNvbnRyb2wgb3ZlcnJpZGVzIHNvZnR3YXJlLCBhbmQgdm9sdW1lXHJcbiAgICAgICAqIHdpbGwgYWx3YXlzIHJldHVybiAxIHBlciBBcHBsZSBkb2NzLiAoaU9TIDQgKyA1LilcclxuICAgICAgICogaHR0cDovL2RldmVsb3Blci5hcHBsZS5jb20vbGlicmFyeS9zYWZhcmkvZG9jdW1lbnRhdGlvbi9BdWRpb1ZpZGVvL0NvbmNlcHR1YWwvSFRNTC1jYW52YXMtZ3VpZGUvQWRkaW5nU291bmR0b0NhbnZhc0FuaW1hdGlvbnMvQWRkaW5nU291bmR0b0NhbnZhc0FuaW1hdGlvbnMuaHRtbFxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIGlmIChuVm9sID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgblZvbCA9IDEwMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKF9iSW5zdGFuY2VPbmx5ID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgX2JJbnN0YW5jZU9ubHkgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgZmxhc2guX3NldFZvbHVtZShzLmlkLCAoc20yLm11dGVkICYmICFzLm11dGVkKSB8fCBzLm11dGVkID8gMCA6IG5Wb2wpO1xyXG5cclxuICAgICAgfSBlbHNlIGlmIChzLl9hKSB7XHJcblxyXG4gICAgICAgIGlmIChzbTIubXV0ZWQgJiYgIXMubXV0ZWQpIHtcclxuICAgICAgICAgIHMubXV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgcy5fYS5tdXRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB2YWxpZCByYW5nZSBmb3IgbmF0aXZlIEhUTUw1IEF1ZGlvKCk6IDAtMVxyXG4gICAgICAgIHMuX2Eudm9sdW1lID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgblZvbC8xMDApKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuX2lPLnZvbHVtZSA9IG5Wb2w7XHJcblxyXG4gICAgICBpZiAoIV9iSW5zdGFuY2VPbmx5KSB7XHJcbiAgICAgICAgcy52b2x1bWUgPSBuVm9sO1xyXG4gICAgICAgIHMub3B0aW9ucy52b2x1bWUgPSBuVm9sO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXV0ZXMgdGhlIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5tdXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzLm11dGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgZmxhc2guX3NldFZvbHVtZShzLmlkLCAwKTtcclxuICAgICAgfSBlbHNlIGlmIChzLl9hKSB7XHJcbiAgICAgICAgcy5fYS5tdXRlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbm11dGVzIHRoZSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMudW5tdXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzLm11dGVkID0gZmFsc2U7XHJcbiAgICAgIHZhciBoYXNJTyA9IChzLl9pTy52b2x1bWUgIT09IF91bmRlZmluZWQpO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBmbGFzaC5fc2V0Vm9sdW1lKHMuaWQsIGhhc0lPID8gcy5faU8udm9sdW1lIDogcy5vcHRpb25zLnZvbHVtZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAocy5fYSkge1xyXG4gICAgICAgIHMuX2EubXV0ZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIG11dGVkIHN0YXRlIG9mIGEgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnRvZ2dsZU11dGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHJldHVybiAocy5tdXRlZCA/IHMudW5tdXRlKCkgOiBzLm11dGUoKSk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGZpcmVkIHdoZW4gYSBzb3VuZCByZWFjaGVzIGEgZ2l2ZW4gcG9zaXRpb24gZHVyaW5nIHBsYXliYWNrLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuUG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIHdhdGNoIGZvclxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBUaGUgcmVsZXZhbnQgY2FsbGJhY2sgdG8gZmlyZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9TY29wZSBPcHRpb25hbDogVGhlIHNjb3BlIHRvIGFwcGx5IHRoZSBjYWxsYmFjayB0b1xyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLm9uUG9zaXRpb24gPSBmdW5jdGlvbihuUG9zaXRpb24sIG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgICAgLy8gVE9ETzogYmFzaWMgZHVwZSBjaGVja2luZz9cclxuXHJcbiAgICAgIG9uUG9zaXRpb25JdGVtcy5wdXNoKHtcclxuICAgICAgICBwb3NpdGlvbjogcGFyc2VJbnQoblBvc2l0aW9uLCAxMCksXHJcbiAgICAgICAgbWV0aG9kOiBvTWV0aG9kLFxyXG4gICAgICAgIHNjb3BlOiAob1Njb3BlICE9PSBfdW5kZWZpbmVkID8gb1Njb3BlIDogcyksXHJcbiAgICAgICAgZmlyZWQ6IGZhbHNlXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBsZWdhY3kvYmFja3dhcmRzLWNvbXBhYmlsaXR5OiBsb3dlci1jYXNlIG1ldGhvZCBuYW1lXHJcbiAgICB0aGlzLm9ucG9zaXRpb24gPSB0aGlzLm9uUG9zaXRpb247XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIHJlZ2lzdGVyZWQgY2FsbGJhY2socykgZnJvbSBhIHNvdW5kLCBieSBwb3NpdGlvbiBhbmQvb3IgY2FsbGJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5Qb3NpdGlvbiBUaGUgcG9zaXRpb24gdG8gY2xlYXIgY2FsbGJhY2socykgZm9yXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIE9wdGlvbmFsOiBJZGVudGlmeSBvbmUgY2FsbGJhY2sgdG8gYmUgcmVtb3ZlZCB3aGVuIG11bHRpcGxlIGxpc3RlbmVycyBleGlzdCBmb3Igb25lIHBvc2l0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuY2xlYXJPblBvc2l0aW9uID0gZnVuY3Rpb24oblBvc2l0aW9uLCBvTWV0aG9kKSB7XHJcblxyXG4gICAgICB2YXIgaTtcclxuXHJcbiAgICAgIG5Qb3NpdGlvbiA9IHBhcnNlSW50KG5Qb3NpdGlvbiwgMTApO1xyXG5cclxuICAgICAgaWYgKGlzTmFOKG5Qb3NpdGlvbikpIHtcclxuICAgICAgICAvLyBzYWZldHkgY2hlY2tcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaT0wOyBpIDwgb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgIGlmIChuUG9zaXRpb24gPT09IG9uUG9zaXRpb25JdGVtc1tpXS5wb3NpdGlvbikge1xyXG4gICAgICAgICAgLy8gcmVtb3ZlIHRoaXMgaXRlbSBpZiBubyBtZXRob2Qgd2FzIHNwZWNpZmllZCwgb3IsIGlmIHRoZSBtZXRob2QgbWF0Y2hlc1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiAoIW9NZXRob2QgfHwgKG9NZXRob2QgPT09IG9uUG9zaXRpb25JdGVtc1tpXS5tZXRob2QpKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAob25Qb3NpdGlvbkl0ZW1zW2ldLmZpcmVkKSB7XHJcbiAgICAgICAgICAgICAgLy8gZGVjcmVtZW50IFwiZmlyZWRcIiBjb3VudGVyLCB0b29cclxuICAgICAgICAgICAgICBvblBvc2l0aW9uRmlyZWQtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgb25Qb3NpdGlvbkl0ZW1zLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3Byb2Nlc3NPblBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaSwgaXRlbSwgaiA9IG9uUG9zaXRpb25JdGVtcy5sZW5ndGg7XHJcblxyXG4gICAgICBpZiAoIWogfHwgIXMucGxheVN0YXRlIHx8IG9uUG9zaXRpb25GaXJlZCA+PSBqKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGkgPSBqIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBcclxuICAgICAgICBpdGVtID0gb25Qb3NpdGlvbkl0ZW1zW2ldO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghaXRlbS5maXJlZCAmJiBzLnBvc2l0aW9uID49IGl0ZW0ucG9zaXRpb24pIHtcclxuICAgICAgICBcclxuICAgICAgICAgIGl0ZW0uZmlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgb25Qb3NpdGlvbkZpcmVkKys7XHJcbiAgICAgICAgICBpdGVtLm1ldGhvZC5hcHBseShpdGVtLnNjb3BlLCBbaXRlbS5wb3NpdGlvbl0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgLy8gIHJlc2V0IGogLS0gb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aCBjYW4gYmUgY2hhbmdlZCBpbiB0aGUgaXRlbSBjYWxsYmFjayBhYm92ZS4uLiBvY2Nhc2lvbmFsbHkgYnJlYWtpbmcgdGhlIGxvb3AuXHJcblx0XHQgICAgICBqID0gb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aDtcclxuICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3Jlc2V0T25Qb3NpdGlvbiA9IGZ1bmN0aW9uKG5Qb3NpdGlvbikge1xyXG5cclxuICAgICAgLy8gcmVzZXQgXCJmaXJlZFwiIGZvciBpdGVtcyBpbnRlcmVzdGVkIGluIHRoaXMgcG9zaXRpb25cclxuICAgICAgdmFyIGksIGl0ZW0sIGogPSBvblBvc2l0aW9uSXRlbXMubGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKCFqKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGkgPSBqIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBcclxuICAgICAgICBpdGVtID0gb25Qb3NpdGlvbkl0ZW1zW2ldO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChpdGVtLmZpcmVkICYmIG5Qb3NpdGlvbiA8PSBpdGVtLnBvc2l0aW9uKSB7XHJcbiAgICAgICAgICBpdGVtLmZpcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICBvblBvc2l0aW9uRmlyZWQtLTtcclxuICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU01Tb3VuZCgpIHByaXZhdGUgaW50ZXJuYWxzXHJcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICovXHJcblxyXG4gICAgYXBwbHlGcm9tVG8gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTyxcclxuICAgICAgICAgIGYgPSBpbnN0YW5jZU9wdGlvbnMuZnJvbSxcclxuICAgICAgICAgIHQgPSBpbnN0YW5jZU9wdGlvbnMudG8sXHJcbiAgICAgICAgICBzdGFydCwgZW5kO1xyXG5cclxuICAgICAgZW5kID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIGVuZCBoYXMgYmVlbiByZWFjaGVkLlxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IFwiVG9cIiB0aW1lIG9mICcgKyB0ICsgJyByZWFjaGVkLicpO1xyXG5cclxuICAgICAgICAvLyBkZXRhY2ggbGlzdGVuZXJcclxuICAgICAgICBzLmNsZWFyT25Qb3NpdGlvbih0LCBlbmQpO1xyXG5cclxuICAgICAgICAvLyBzdG9wIHNob3VsZCBjbGVhciB0aGlzLCB0b29cclxuICAgICAgICBzLnN0b3AoKTtcclxuXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzdGFydCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBQbGF5aW5nIFwiZnJvbVwiICcgKyBmKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGZvciBlbmRcclxuICAgICAgICBpZiAodCAhPT0gbnVsbCAmJiAhaXNOYU4odCkpIHtcclxuICAgICAgICAgIHMub25Qb3NpdGlvbih0LCBlbmQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZiAoZiAhPT0gbnVsbCAmJiAhaXNOYU4oZikpIHtcclxuXHJcbiAgICAgICAgLy8gYXBwbHkgdG8gaW5zdGFuY2Ugb3B0aW9ucywgZ3VhcmFudGVlaW5nIGNvcnJlY3Qgc3RhcnQgcG9zaXRpb24uXHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLnBvc2l0aW9uID0gZjtcclxuXHJcbiAgICAgICAgLy8gbXVsdGlTaG90IHRpbWluZyBjYW4ndCBiZSB0cmFja2VkLCBzbyBwcmV2ZW50IHRoYXQuXHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLm11bHRpU2hvdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBzdGFydCgpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHVwZGF0ZWQgaW5zdGFuY2VPcHRpb25zIGluY2x1ZGluZyBzdGFydGluZyBwb3NpdGlvblxyXG4gICAgICByZXR1cm4gaW5zdGFuY2VPcHRpb25zO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgYXR0YWNoT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGl0ZW0sXHJcbiAgICAgICAgICBvcCA9IHMuX2lPLm9ucG9zaXRpb247XHJcblxyXG4gICAgICAvLyBhdHRhY2ggb25wb3NpdGlvbiB0aGluZ3MsIGlmIGFueSwgbm93LlxyXG5cclxuICAgICAgaWYgKG9wKSB7XHJcblxyXG4gICAgICAgIGZvciAoaXRlbSBpbiBvcCkge1xyXG4gICAgICAgICAgaWYgKG9wLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgICAgIHMub25Qb3NpdGlvbihwYXJzZUludChpdGVtLCAxMCksIG9wW2l0ZW1dKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBkZXRhY2hPblBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaXRlbSxcclxuICAgICAgICAgIG9wID0gcy5faU8ub25wb3NpdGlvbjtcclxuXHJcbiAgICAgIC8vIGRldGFjaCBhbnkgb25wb3NpdGlvbigpLXN0eWxlIGxpc3RlbmVycy5cclxuXHJcbiAgICAgIGlmIChvcCkge1xyXG5cclxuICAgICAgICBmb3IgKGl0ZW0gaW4gb3ApIHtcclxuICAgICAgICAgIGlmIChvcC5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgICAgICBzLmNsZWFyT25Qb3NpdGlvbihwYXJzZUludChpdGVtLCAxMCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHN0YXJ0X2h0bWw1X3RpbWVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAocy5pc0hUTUw1KSB7XHJcbiAgICAgICAgc3RhcnRUaW1lcihzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgc3RvcF9odG1sNV90aW1lciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHMuaXNIVE1MNSkge1xyXG4gICAgICAgIHN0b3BUaW1lcihzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgcmVzZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24ocmV0YWluUG9zaXRpb24pIHtcclxuXHJcbiAgICAgIGlmICghcmV0YWluUG9zaXRpb24pIHtcclxuICAgICAgICBvblBvc2l0aW9uSXRlbXMgPSBbXTtcclxuICAgICAgICBvblBvc2l0aW9uRmlyZWQgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBvbnBsYXlfY2FsbGVkID0gZmFsc2U7XHJcblxyXG4gICAgICBzLl9oYXNUaW1lciA9IG51bGw7XHJcbiAgICAgIHMuX2EgPSBudWxsO1xyXG4gICAgICBzLl9odG1sNV9jYW5wbGF5ID0gZmFsc2U7XHJcbiAgICAgIHMuYnl0ZXNMb2FkZWQgPSBudWxsO1xyXG4gICAgICBzLmJ5dGVzVG90YWwgPSBudWxsO1xyXG4gICAgICBzLmR1cmF0aW9uID0gKHMuX2lPICYmIHMuX2lPLmR1cmF0aW9uID8gcy5faU8uZHVyYXRpb24gOiBudWxsKTtcclxuICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gbnVsbDtcclxuICAgICAgcy5idWZmZXJlZCA9IFtdO1xyXG5cclxuICAgICAgLy8gbGVnYWN5OiAxRCBhcnJheVxyXG4gICAgICBzLmVxRGF0YSA9IFtdO1xyXG5cclxuICAgICAgcy5lcURhdGEubGVmdCA9IFtdO1xyXG4gICAgICBzLmVxRGF0YS5yaWdodCA9IFtdO1xyXG5cclxuICAgICAgcy5mYWlsdXJlcyA9IDA7XHJcbiAgICAgIHMuaXNCdWZmZXJpbmcgPSBmYWxzZTtcclxuICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSB7fTtcclxuICAgICAgcy5pbnN0YW5jZUNvdW50ID0gMDtcclxuICAgICAgcy5sb2FkZWQgPSBmYWxzZTtcclxuICAgICAgcy5tZXRhZGF0YSA9IHt9O1xyXG5cclxuICAgICAgLy8gMCA9IHVuaW5pdGlhbGlzZWQsIDEgPSBsb2FkaW5nLCAyID0gZmFpbGVkL2Vycm9yLCAzID0gbG9hZGVkL3N1Y2Nlc3NcclxuICAgICAgcy5yZWFkeVN0YXRlID0gMDtcclxuXHJcbiAgICAgIHMubXV0ZWQgPSBmYWxzZTtcclxuICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIHMucGVha0RhdGEgPSB7XHJcbiAgICAgICAgbGVmdDogMCxcclxuICAgICAgICByaWdodDogMFxyXG4gICAgICB9O1xyXG5cclxuICAgICAgcy53YXZlZm9ybURhdGEgPSB7XHJcbiAgICAgICAgbGVmdDogW10sXHJcbiAgICAgICAgcmlnaHQ6IFtdXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcbiAgICAgIHMucG9zaXRpb24gPSBudWxsO1xyXG5cclxuICAgICAgcy5pZDMgPSB7fTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHJlc2V0UHJvcGVydGllcygpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHNldWRvLXByaXZhdGUgU01Tb3VuZCBpbnRlcm5hbHNcclxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vblRpbWVyID0gZnVuY3Rpb24oYkZvcmNlKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSFRNTDUtb25seSBfd2hpbGVwbGF5aW5nKCkgZXRjLlxyXG4gICAgICAgKiBjYWxsZWQgZnJvbSBib3RoIEhUTUw1IG5hdGl2ZSBldmVudHMsIGFuZCBwb2xsaW5nL2ludGVydmFsLWJhc2VkIHRpbWVyc1xyXG4gICAgICAgKiBtaW1pY3MgZmxhc2ggYW5kIGZpcmVzIG9ubHkgd2hlbiB0aW1lL2R1cmF0aW9uIGNoYW5nZSwgc28gYXMgdG8gYmUgcG9sbGluZy1mcmllbmRseVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIHZhciBkdXJhdGlvbiwgaXNOZXcgPSBmYWxzZSwgdGltZSwgeCA9IHt9O1xyXG5cclxuICAgICAgaWYgKHMuX2hhc1RpbWVyIHx8IGJGb3JjZSkge1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBNYXkgbm90IG5lZWQgdG8gdHJhY2sgcmVhZHlTdGF0ZSAoMSA9IGxvYWRpbmcpXHJcblxyXG4gICAgICAgIGlmIChzLl9hICYmIChiRm9yY2UgfHwgKChzLnBsYXlTdGF0ZSA+IDAgfHwgcy5yZWFkeVN0YXRlID09PSAxKSAmJiAhcy5wYXVzZWQpKSkge1xyXG5cclxuICAgICAgICAgIGR1cmF0aW9uID0gcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGR1cmF0aW9uICE9PSBsYXN0SFRNTDVTdGF0ZS5kdXJhdGlvbikge1xyXG5cclxuICAgICAgICAgICAgbGFzdEhUTUw1U3RhdGUuZHVyYXRpb24gPSBkdXJhdGlvbjtcclxuICAgICAgICAgICAgcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xyXG4gICAgICAgICAgICBpc05ldyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFRPRE86IGludmVzdGlnYXRlIHdoeSB0aGlzIGdvZXMgd2FjayBpZiBub3Qgc2V0L3JlLXNldCBlYWNoIHRpbWUuXHJcbiAgICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBzLmR1cmF0aW9uO1xyXG5cclxuICAgICAgICAgIHRpbWUgPSAocy5fYS5jdXJyZW50VGltZSAqIG1zZWNTY2FsZSB8fCAwKTtcclxuXHJcbiAgICAgICAgICBpZiAodGltZSAhPT0gbGFzdEhUTUw1U3RhdGUudGltZSkge1xyXG5cclxuICAgICAgICAgICAgbGFzdEhUTUw1U3RhdGUudGltZSA9IHRpbWU7XHJcbiAgICAgICAgICAgIGlzTmV3ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGlzTmV3IHx8IGJGb3JjZSkge1xyXG5cclxuICAgICAgICAgICAgcy5fd2hpbGVwbGF5aW5nKHRpbWUsIHgsIHgsIHgsIHgpO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfS8qIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIHNtMi5fd0QoJ19vblRpbWVyOiBXYXJuIGZvciBcIicrcy5pZCsnXCI6ICcrKCFzLl9hPydDb3VsZCBub3QgZmluZCBlbGVtZW50LiAnOicnKSsocy5wbGF5U3RhdGUgPT09IDA/J3BsYXlTdGF0ZSBiYWQsIDA/JzoncGxheVN0YXRlID0gJytzLnBsYXlTdGF0ZSsnLCBPSycpKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gaXNOZXc7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9nZXRfaHRtbDVfZHVyYXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTyxcclxuICAgICAgICAgIC8vIGlmIGF1ZGlvIG9iamVjdCBleGlzdHMsIHVzZSBpdHMgZHVyYXRpb24gLSBlbHNlLCBpbnN0YW5jZSBvcHRpb24gZHVyYXRpb24gKGlmIHByb3ZpZGVkIC0gaXQncyBhIGhhY2ssIHJlYWxseSwgYW5kIHNob3VsZCBiZSByZXRpcmVkKSBPUiBudWxsXHJcbiAgICAgICAgICBkID0gKHMuX2EgJiYgcy5fYS5kdXJhdGlvbiA/IHMuX2EuZHVyYXRpb24gKiBtc2VjU2NhbGUgOiAoaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbiA/IGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbiA6IG51bGwpKSxcclxuICAgICAgICAgIHJlc3VsdCA9IChkICYmICFpc05hTihkKSAmJiBkICE9PSBJbmZpbml0eSA/IGQgOiBudWxsKTtcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9hcHBseV9sb29wID0gZnVuY3Rpb24oYSwgbkxvb3BzKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogYm9vbGVhbiBpbnN0ZWFkIG9mIFwibG9vcFwiLCBmb3Igd2Via2l0PyAtIHNwZWMgc2F5cyBzdHJpbmcuIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWwtbWFya3VwL2F1ZGlvLmh0bWwjYXVkaW8uYXR0cnMubG9vcFxyXG4gICAgICAgKiBub3RlIHRoYXQgbG9vcCBpcyBlaXRoZXIgb2ZmIG9yIGluZmluaXRlIHVuZGVyIEhUTUw1LCB1bmxpa2UgRmxhc2ggd2hpY2ggYWxsb3dzIGFyYml0cmFyeSBsb29wIGNvdW50cyB0byBiZSBzcGVjaWZpZWQuXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmICghYS5sb29wICYmIG5Mb29wcyA+IDEpIHtcclxuICAgICAgICBzbTIuX3dEKCdOb3RlOiBOYXRpdmUgSFRNTDUgbG9vcGluZyBpcyBpbmZpbml0ZS4nLCAxKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBhLmxvb3AgPSAobkxvb3BzID4gMSA/ICdsb29wJyA6ICcnKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3NldHVwX2h0bWw1ID0gZnVuY3Rpb24ob09wdGlvbnMpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBtaXhpbihzLl9pTywgb09wdGlvbnMpLFxyXG4gICAgICAgICAgYSA9IHVzZUdsb2JhbEhUTUw1QXVkaW8gPyBnbG9iYWxIVE1MNUF1ZGlvIDogcy5fYSxcclxuICAgICAgICAgIGRVUkwgPSBkZWNvZGVVUkkoaW5zdGFuY2VPcHRpb25zLnVybCksXHJcbiAgICAgICAgICBzYW1lVVJMO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFwiRmlyc3QgdGhpbmdzIGZpcnN0LCBJLCBQb3BwYS4uLlwiIChyZXNldCB0aGUgcHJldmlvdXMgc3RhdGUgb2YgdGhlIG9sZCBzb3VuZCwgaWYgcGxheWluZylcclxuICAgICAgICogRml4ZXMgY2FzZSB3aXRoIGRldmljZXMgdGhhdCBjYW4gb25seSBwbGF5IG9uZSBzb3VuZCBhdCBhIHRpbWVcclxuICAgICAgICogT3RoZXJ3aXNlLCBvdGhlciBzb3VuZHMgaW4gbWlkLXBsYXkgd2lsbCBiZSB0ZXJtaW5hdGVkIHdpdGhvdXQgd2FybmluZyBhbmQgaW4gYSBzdHVjayBzdGF0ZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIGlmICh1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAgIGlmIChkVVJMID09PSBkZWNvZGVVUkkobGFzdEdsb2JhbEhUTUw1VVJMKSkge1xyXG4gICAgICAgICAgLy8gZ2xvYmFsIEhUTUw1IGF1ZGlvOiByZS11c2Ugb2YgVVJMXHJcbiAgICAgICAgICBzYW1lVVJMID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2UgaWYgKGRVUkwgPT09IGRlY29kZVVSSShsYXN0VVJMKSkge1xyXG5cclxuICAgICAgICAvLyBvcHRpb25zIFVSTCBpcyB0aGUgc2FtZSBhcyB0aGUgXCJsYXN0XCIgVVJMLCBhbmQgd2UgdXNlZCAobG9hZGVkKSBpdFxyXG4gICAgICAgIHNhbWVVUkwgPSB0cnVlO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGEpIHtcclxuXHJcbiAgICAgICAgaWYgKGEuX3MpIHtcclxuXHJcbiAgICAgICAgICBpZiAodXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgICAgICAgaWYgKGEuX3MgJiYgYS5fcy5wbGF5U3RhdGUgJiYgIXNhbWVVUkwpIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gZ2xvYmFsIEhUTUw1IGF1ZGlvIGNhc2UsIGFuZCBsb2FkaW5nIGEgbmV3IFVSTC4gc3RvcCB0aGUgY3VycmVudGx5LXBsYXlpbmcgb25lLlxyXG4gICAgICAgICAgICAgIGEuX3Muc3RvcCgpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAoIXVzZUdsb2JhbEhUTUw1QXVkaW8gJiYgZFVSTCA9PT0gZGVjb2RlVVJJKGxhc3RVUkwpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBub24tZ2xvYmFsIEhUTUw1IHJldXNlIGNhc2U6IHNhbWUgdXJsLCBpZ25vcmUgcmVxdWVzdFxyXG4gICAgICAgICAgICBzLl9hcHBseV9sb29wKGEsIGluc3RhbmNlT3B0aW9ucy5sb29wcyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzYW1lVVJMKSB7XHJcblxyXG4gICAgICAgICAgLy8gZG9uJ3QgcmV0YWluIG9uUG9zaXRpb24oKSBzdHVmZiB3aXRoIG5ldyBVUkxzLlxyXG5cclxuICAgICAgICAgIGlmIChsYXN0VVJMKSB7XHJcbiAgICAgICAgICAgIHJlc2V0UHJvcGVydGllcyhmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gYXNzaWduIG5ldyBIVE1MNSBVUkxcclxuXHJcbiAgICAgICAgICBhLnNyYyA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgcy51cmwgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgIGxhc3RVUkwgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgIGxhc3RHbG9iYWxIVE1MNVVSTCA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgYS5fY2FsbGVkX2xvYWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5hdXRvTG9hZCB8fCBpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXkpIHtcclxuXHJcbiAgICAgICAgICBzLl9hID0gbmV3IEF1ZGlvKGluc3RhbmNlT3B0aW9ucy51cmwpO1xyXG4gICAgICAgICAgcy5fYS5sb2FkKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gbnVsbCBmb3Igc3R1cGlkIE9wZXJhIDkuNjQgY2FzZVxyXG4gICAgICAgICAgcy5fYSA9IChpc09wZXJhICYmIG9wZXJhLnZlcnNpb24oKSA8IDEwID8gbmV3IEF1ZGlvKG51bGwpIDogbmV3IEF1ZGlvKCkpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBsb2NhbCByZWZlcmVuY2VcclxuICAgICAgICBhID0gcy5fYTtcclxuXHJcbiAgICAgICAgYS5fY2FsbGVkX2xvYWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgICAgICBnbG9iYWxIVE1MNUF1ZGlvID0gYTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcy5pc0hUTUw1ID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIHN0b3JlIGEgcmVmIG9uIHRoZSB0cmFja1xyXG4gICAgICBzLl9hID0gYTtcclxuXHJcbiAgICAgIC8vIHN0b3JlIGEgcmVmIG9uIHRoZSBhdWRpb1xyXG4gICAgICBhLl9zID0gcztcclxuXHJcbiAgICAgIGFkZF9odG1sNV9ldmVudHMoKTtcclxuXHJcbiAgICAgIHMuX2FwcGx5X2xvb3AoYSwgaW5zdGFuY2VPcHRpb25zLmxvb3BzKTtcclxuXHJcbiAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuYXV0b0xvYWQgfHwgaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5KSB7XHJcblxyXG4gICAgICAgIHMubG9hZCgpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gZWFybHkgSFRNTDUgaW1wbGVtZW50YXRpb24gKG5vbi1zdGFuZGFyZClcclxuICAgICAgICBhLmF1dG9idWZmZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gc3RhbmRhcmQgKCdub25lJyBpcyBhbHNvIGFuIG9wdGlvbi4pXHJcbiAgICAgICAgYS5wcmVsb2FkID0gJ2F1dG8nO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGE7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBhZGRfaHRtbDVfZXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAocy5fYS5fYWRkZWRfZXZlbnRzKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZjtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFkZChvRXZ0LCBvRm4sIGJDYXB0dXJlKSB7XHJcbiAgICAgICAgcmV0dXJuIHMuX2EgPyBzLl9hLmFkZEV2ZW50TGlzdGVuZXIob0V2dCwgb0ZuLCBiQ2FwdHVyZSB8fCBmYWxzZSkgOiBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLl9hLl9hZGRlZF9ldmVudHMgPSB0cnVlO1xyXG5cclxuICAgICAgZm9yIChmIGluIGh0bWw1X2V2ZW50cykge1xyXG4gICAgICAgIGlmIChodG1sNV9ldmVudHMuaGFzT3duUHJvcGVydHkoZikpIHtcclxuICAgICAgICAgIGFkZChmLCBodG1sNV9ldmVudHNbZl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICByZW1vdmVfaHRtbDVfZXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzXHJcblxyXG4gICAgICB2YXIgZjtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIHJlbW92ZShvRXZ0LCBvRm4sIGJDYXB0dXJlKSB7XHJcbiAgICAgICAgcmV0dXJuIChzLl9hID8gcy5fYS5yZW1vdmVFdmVudExpc3RlbmVyKG9FdnQsIG9GbiwgYkNhcHR1cmUgfHwgZmFsc2UpIDogbnVsbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IFJlbW92aW5nIGV2ZW50IGxpc3RlbmVycycpO1xyXG4gICAgICBzLl9hLl9hZGRlZF9ldmVudHMgPSBmYWxzZTtcclxuXHJcbiAgICAgIGZvciAoZiBpbiBodG1sNV9ldmVudHMpIHtcclxuICAgICAgICBpZiAoaHRtbDVfZXZlbnRzLmhhc093blByb3BlcnR5KGYpKSB7XHJcbiAgICAgICAgICByZW1vdmUoZiwgaHRtbDVfZXZlbnRzW2ZdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHNldWRvLXByaXZhdGUgZXZlbnQgaW50ZXJuYWxzXHJcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29ubG9hZCA9IGZ1bmN0aW9uKG5TdWNjZXNzKSB7XHJcblxyXG4gICAgICB2YXIgZk4sXHJcbiAgICAgICAgICAvLyBjaGVjayBmb3IgZHVyYXRpb24gdG8gcHJldmVudCBmYWxzZSBwb3NpdGl2ZXMgZnJvbSBmbGFzaCA4IHdoZW4gbG9hZGluZyBmcm9tIGNhY2hlLlxyXG4gICAgICAgICAgbG9hZE9LID0gISFuU3VjY2VzcyB8fCAoIXMuaXNIVE1MNSAmJiBmViA9PT0gOCAmJiBzLmR1cmF0aW9uKTtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBmTiA9IHMuaWQgKyAnOiAnO1xyXG4gICAgICBzbTIuX3dEKGZOICsgKGxvYWRPSyA/ICdvbmxvYWQoKScgOiAnRmFpbGVkIHRvIGxvYWQgLyBpbnZhbGlkIHNvdW5kPycgKyAoIXMuZHVyYXRpb24gPyAnIFplcm8tbGVuZ3RoIGR1cmF0aW9uIHJlcG9ydGVkLicgOiAnIC0nKSArICcgKCcgKyBzLnVybCArICcpJyksIChsb2FkT0sgPyAxIDogMikpO1xyXG5cclxuICAgICAgaWYgKCFsb2FkT0sgJiYgIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGlmIChzbTIuc2FuZGJveC5ub1JlbW90ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgc20yLl93RChmTiArIHN0cignbm9OZXQnKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzbTIuc2FuZGJveC5ub0xvY2FsID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgc3RyKCdub0xvY2FsJyksIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBzLmxvYWRlZCA9IGxvYWRPSztcclxuICAgICAgcy5yZWFkeVN0YXRlID0gKGxvYWRPSyA/IDMgOiAyKTtcclxuICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25sb2FkKSB7XHJcbiAgICAgICAgd3JhcENhbGxiYWNrKHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcy5faU8ub25sb2FkLmFwcGx5KHMsIFtsb2FkT0tdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmJ1ZmZlcmNoYW5nZSA9IGZ1bmN0aW9uKG5Jc0J1ZmZlcmluZykge1xyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAwKSB7XHJcbiAgICAgICAgLy8gaWdub3JlIGlmIG5vdCBwbGF5aW5nXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoKG5Jc0J1ZmZlcmluZyAmJiBzLmlzQnVmZmVyaW5nKSB8fCAoIW5Jc0J1ZmZlcmluZyAmJiAhcy5pc0J1ZmZlcmluZykpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuaXNCdWZmZXJpbmcgPSAobklzQnVmZmVyaW5nID09PSAxKTtcclxuICAgICAgXHJcbiAgICAgIGlmIChzLl9pTy5vbmJ1ZmZlcmNoYW5nZSkge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IEJ1ZmZlciBzdGF0ZSBjaGFuZ2U6ICcgKyBuSXNCdWZmZXJpbmcpO1xyXG4gICAgICAgIHMuX2lPLm9uYnVmZmVyY2hhbmdlLmFwcGx5KHMsIFtuSXNCdWZmZXJpbmddKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBsYXliYWNrIG1heSBoYXZlIHN0b3BwZWQgZHVlIHRvIGJ1ZmZlcmluZywgb3IgcmVsYXRlZCByZWFzb24uXHJcbiAgICAgKiBUaGlzIHN0YXRlIGNhbiBiZSBlbmNvdW50ZXJlZCBvbiBpT1MgPCA2IHdoZW4gYXV0by1wbGF5IGlzIGJsb2NrZWQuXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vbnN1c3BlbmQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbnN1c3BlbmQpIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBQbGF5YmFjayBzdXNwZW5kZWQnKTtcclxuICAgICAgICBzLl9pTy5vbnN1c3BlbmQuYXBwbHkocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmbGFzaCA5L21vdmllU3RhciArIFJUTVAtb25seSBtZXRob2QsIHNob3VsZCBmaXJlIG9ubHkgb25jZSBhdCBtb3N0XHJcbiAgICAgKiBhdCB0aGlzIHBvaW50IHdlIGp1c3QgcmVjcmVhdGUgZmFpbGVkIHNvdW5kcyByYXRoZXIgdGhhbiB0cnlpbmcgdG8gcmVjb25uZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vbmZhaWx1cmUgPSBmdW5jdGlvbihtc2csIGxldmVsLCBjb2RlKSB7XHJcblxyXG4gICAgICBzLmZhaWx1cmVzKys7XHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IEZhaWx1cmUgKCcgKyBzLmZhaWx1cmVzICsgJyk6ICcgKyBtc2cpO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9uZmFpbHVyZSAmJiBzLmZhaWx1cmVzID09PSAxKSB7XHJcbiAgICAgICAgcy5faU8ub25mYWlsdXJlKG1zZywgbGV2ZWwsIGNvZGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IElnbm9yaW5nIGZhaWx1cmUnKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmbGFzaCA5L21vdmllU3RhciArIFJUTVAtb25seSBtZXRob2QgZm9yIHVuaGFuZGxlZCB3YXJuaW5ncy9leGNlcHRpb25zIGZyb20gRmxhc2hcclxuICAgICAqIGUuZy4sIFJUTVAgXCJtZXRob2QgbWlzc2luZ1wiIHdhcm5pbmcgKG5vbi1mYXRhbCkgZm9yIGdldFN0cmVhbUxlbmd0aCBvbiBzZXJ2ZXJcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29ud2FybmluZyA9IGZ1bmN0aW9uKG1zZywgbGV2ZWwsIGNvZGUpIHtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbndhcm5pbmcpIHtcclxuICAgICAgICBzLl9pTy5vbndhcm5pbmcobXNnLCBsZXZlbCwgY29kZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uZmluaXNoID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBzdG9yZSBsb2NhbCBjb3B5IGJlZm9yZSBpdCBnZXRzIHRyYXNoZWQuLi5cclxuICAgICAgdmFyIGlvX29uZmluaXNoID0gcy5faU8ub25maW5pc2g7XHJcblxyXG4gICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuICAgICAgcy5fcmVzZXRPblBvc2l0aW9uKDApO1xyXG5cclxuICAgICAgLy8gcmVzZXQgc29tZSBzdGF0ZSBpdGVtc1xyXG4gICAgICBpZiAocy5pbnN0YW5jZUNvdW50KSB7XHJcblxyXG4gICAgICAgIHMuaW5zdGFuY2VDb3VudC0tO1xyXG5cclxuICAgICAgICBpZiAoIXMuaW5zdGFuY2VDb3VudCkge1xyXG5cclxuICAgICAgICAgIC8vIHJlbW92ZSBvblBvc2l0aW9uIGxpc3RlbmVycywgaWYgYW55XHJcbiAgICAgICAgICBkZXRhY2hPblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgLy8gcmVzZXQgaW5zdGFuY2Ugb3B0aW9uc1xyXG4gICAgICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG4gICAgICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICAgIHMuaW5zdGFuY2VDb3VudCA9IDA7XHJcbiAgICAgICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHt9O1xyXG4gICAgICAgICAgcy5faU8gPSB7fTtcclxuICAgICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgICAvLyByZXNldCBwb3NpdGlvbiwgdG9vXHJcbiAgICAgICAgICBpZiAocy5pc0hUTUw1KSB7XHJcbiAgICAgICAgICAgIHMucG9zaXRpb24gPSAwO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcy5pbnN0YW5jZUNvdW50IHx8IHMuX2lPLm11bHRpU2hvdEV2ZW50cykge1xyXG4gICAgICAgICAgLy8gZmlyZSBvbmZpbmlzaCBmb3IgbGFzdCwgb3IgZXZlcnkgaW5zdGFuY2VcclxuICAgICAgICAgIGlmIChpb19vbmZpbmlzaCkge1xyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBvbmZpbmlzaCgpJyk7XHJcbiAgICAgICAgICAgIHdyYXBDYWxsYmFjayhzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBpb19vbmZpbmlzaC5hcHBseShzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fd2hpbGVsb2FkaW5nID0gZnVuY3Rpb24obkJ5dGVzTG9hZGVkLCBuQnl0ZXNUb3RhbCwgbkR1cmF0aW9uLCBuQnVmZmVyTGVuZ3RoKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICBzLmJ5dGVzTG9hZGVkID0gbkJ5dGVzTG9hZGVkO1xyXG4gICAgICBzLmJ5dGVzVG90YWwgPSBuQnl0ZXNUb3RhbDtcclxuICAgICAgcy5kdXJhdGlvbiA9IE1hdGguZmxvb3IobkR1cmF0aW9uKTtcclxuICAgICAgcy5idWZmZXJMZW5ndGggPSBuQnVmZmVyTGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgIWluc3RhbmNlT3B0aW9ucy5pc01vdmllU3Rhcikge1xyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAvLyB1c2UgZHVyYXRpb24gZnJvbSBvcHRpb25zLCBpZiBzcGVjaWZpZWQgYW5kIGxhcmdlci4gbm9ib2R5IHNob3VsZCBiZSBzcGVjaWZ5aW5nIGR1cmF0aW9uIGluIG9wdGlvbnMsIGFjdHVhbGx5LCBhbmQgaXQgc2hvdWxkIGJlIHJldGlyZWQuXHJcbiAgICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSAocy5kdXJhdGlvbiA+IGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbikgPyBzLmR1cmF0aW9uIDogaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBwYXJzZUludCgocy5ieXRlc1RvdGFsIC8gcy5ieXRlc0xvYWRlZCkgKiBzLmR1cmF0aW9uLCAxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gcy5kdXJhdGlvbjtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGZvciBmbGFzaCwgcmVmbGVjdCBzZXF1ZW50aWFsLWxvYWQtc3R5bGUgYnVmZmVyaW5nXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgcy5idWZmZXJlZCA9IFt7XHJcbiAgICAgICAgICAnc3RhcnQnOiAwLFxyXG4gICAgICAgICAgJ2VuZCc6IHMuZHVyYXRpb25cclxuICAgICAgICB9XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYWxsb3cgd2hpbGVsb2FkaW5nIHRvIGZpcmUgZXZlbiBpZiBcImxvYWRcIiBmaXJlZCB1bmRlciBIVE1MNSwgZHVlIHRvIEhUVFAgcmFuZ2UvcGFydGlhbHNcclxuICAgICAgaWYgKChzLnJlYWR5U3RhdGUgIT09IDMgfHwgcy5pc0hUTUw1KSAmJiBpbnN0YW5jZU9wdGlvbnMud2hpbGVsb2FkaW5nKSB7XHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLndoaWxlbG9hZGluZy5hcHBseShzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fd2hpbGVwbGF5aW5nID0gZnVuY3Rpb24oblBvc2l0aW9uLCBvUGVha0RhdGEsIG9XYXZlZm9ybURhdGFMZWZ0LCBvV2F2ZWZvcm1EYXRhUmlnaHQsIG9FUURhdGEpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTyxcclxuICAgICAgICAgIGVxTGVmdDtcclxuXHJcbiAgICAgIGlmIChpc05hTihuUG9zaXRpb24pIHx8IG5Qb3NpdGlvbiA9PT0gbnVsbCkge1xyXG4gICAgICAgIC8vIGZsYXNoIHNhZmV0eSBuZXRcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhZmFyaSBIVE1MNSBwbGF5KCkgbWF5IHJldHVybiBzbWFsbCAtdmUgdmFsdWVzIHdoZW4gc3RhcnRpbmcgZnJvbSBwb3NpdGlvbjogMCwgZWcuIC01MC4xMjAzOTY4NzUuIFVuZXhwZWN0ZWQvaW52YWxpZCBwZXIgVzMsIEkgdGhpbmsuIE5vcm1hbGl6ZSB0byAwLlxyXG4gICAgICBzLnBvc2l0aW9uID0gTWF0aC5tYXgoMCwgblBvc2l0aW9uKTtcclxuXHJcbiAgICAgIHMuX3Byb2Nlc3NPblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiBmViA+IDgpIHtcclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy51c2VQZWFrRGF0YSAmJiBvUGVha0RhdGEgIT09IF91bmRlZmluZWQgJiYgb1BlYWtEYXRhKSB7XHJcbiAgICAgICAgICBzLnBlYWtEYXRhID0ge1xyXG4gICAgICAgICAgICBsZWZ0OiBvUGVha0RhdGEubGVmdFBlYWssXHJcbiAgICAgICAgICAgIHJpZ2h0OiBvUGVha0RhdGEucmlnaHRQZWFrXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy51c2VXYXZlZm9ybURhdGEgJiYgb1dhdmVmb3JtRGF0YUxlZnQgIT09IF91bmRlZmluZWQgJiYgb1dhdmVmb3JtRGF0YUxlZnQpIHtcclxuICAgICAgICAgIHMud2F2ZWZvcm1EYXRhID0ge1xyXG4gICAgICAgICAgICBsZWZ0OiBvV2F2ZWZvcm1EYXRhTGVmdC5zcGxpdCgnLCcpLFxyXG4gICAgICAgICAgICByaWdodDogb1dhdmVmb3JtRGF0YVJpZ2h0LnNwbGl0KCcsJylcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnVzZUVRRGF0YSkge1xyXG4gICAgICAgICAgaWYgKG9FUURhdGEgIT09IF91bmRlZmluZWQgJiYgb0VRRGF0YSAmJiBvRVFEYXRhLmxlZnRFUSkge1xyXG4gICAgICAgICAgICBlcUxlZnQgPSBvRVFEYXRhLmxlZnRFUS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICBzLmVxRGF0YSA9IGVxTGVmdDtcclxuICAgICAgICAgICAgcy5lcURhdGEubGVmdCA9IGVxTGVmdDtcclxuICAgICAgICAgICAgaWYgKG9FUURhdGEucmlnaHRFUSAhPT0gX3VuZGVmaW5lZCAmJiBvRVFEYXRhLnJpZ2h0RVEpIHtcclxuICAgICAgICAgICAgICBzLmVxRGF0YS5yaWdodCA9IG9FUURhdGEucmlnaHRFUS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAxKSB7XHJcblxyXG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZS9oYWNrOiBlbnN1cmUgYnVmZmVyaW5nIGlzIGZhbHNlIGlmIGxvYWRpbmcgZnJvbSBjYWNoZSAoYW5kIG5vdCB5ZXQgc3RhcnRlZClcclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSAmJiBmViA9PT0gOCAmJiAhcy5wb3NpdGlvbiAmJiBzLmlzQnVmZmVyaW5nKSB7XHJcbiAgICAgICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMud2hpbGVwbGF5aW5nKSB7XHJcbiAgICAgICAgICAvLyBmbGFzaCBtYXkgY2FsbCBhZnRlciBhY3R1YWwgZmluaXNoXHJcbiAgICAgICAgICBpbnN0YW5jZU9wdGlvbnMud2hpbGVwbGF5aW5nLmFwcGx5KHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25jYXB0aW9uZGF0YSA9IGZ1bmN0aW9uKG9EYXRhKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogaW50ZXJuYWw6IGZsYXNoIDkgKyBOZXRTdHJlYW0gKE1vdmllU3Rhci9SVE1QLW9ubHkpIGZlYXR1cmVcclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IG9EYXRhXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogQ2FwdGlvbiBkYXRhIHJlY2VpdmVkLicpO1xyXG5cclxuICAgICAgcy5jYXB0aW9uZGF0YSA9IG9EYXRhO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9uY2FwdGlvbmRhdGEpIHtcclxuICAgICAgICBzLl9pTy5vbmNhcHRpb25kYXRhLmFwcGx5KHMsIFtvRGF0YV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbm1ldGFkYXRhID0gZnVuY3Rpb24ob01EUHJvcHMsIG9NRERhdGEpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBpbnRlcm5hbDogZmxhc2ggOSArIE5ldFN0cmVhbSAoTW92aWVTdGFyL1JUTVAtb25seSkgZmVhdHVyZVxyXG4gICAgICAgKiBSVE1QIG1heSBpbmNsdWRlIHNvbmcgdGl0bGUsIE1vdmllU3RhciBjb250ZW50IG1heSBpbmNsdWRlIGVuY29kaW5nIGluZm9cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gb01EUHJvcHMgKG5hbWVzKVxyXG4gICAgICAgKiBAcGFyYW0ge2FycmF5fSBvTUREYXRhICh2YWx1ZXMpXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogTWV0YWRhdGEgcmVjZWl2ZWQuJyk7XHJcblxyXG4gICAgICB2YXIgb0RhdGEgPSB7fSwgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSBvTURQcm9wcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICBvRGF0YVtvTURQcm9wc1tpXV0gPSBvTUREYXRhW2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLm1ldGFkYXRhID0gb0RhdGE7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25tZXRhZGF0YSkge1xyXG4gICAgICAgIHMuX2lPLm9ubWV0YWRhdGEuY2FsbChzLCBzLm1ldGFkYXRhKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25pZDMgPSBmdW5jdGlvbihvSUQzUHJvcHMsIG9JRDNEYXRhKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogaW50ZXJuYWw6IGZsYXNoIDggKyBmbGFzaCA5IElEMyBmZWF0dXJlXHJcbiAgICAgICAqIG1heSBpbmNsdWRlIGFydGlzdCwgc29uZyB0aXRsZSBldGMuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7YXJyYXl9IG9JRDNQcm9wcyAobmFtZXMpXHJcbiAgICAgICAqIEBwYXJhbSB7YXJyYXl9IG9JRDNEYXRhICh2YWx1ZXMpXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogSUQzIGRhdGEgcmVjZWl2ZWQuJyk7XHJcblxyXG4gICAgICB2YXIgb0RhdGEgPSBbXSwgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSBvSUQzUHJvcHMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgb0RhdGFbb0lEM1Byb3BzW2ldXSA9IG9JRDNEYXRhW2ldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLmlkMyA9IG1peGluKHMuaWQzLCBvRGF0YSk7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25pZDMpIHtcclxuICAgICAgICBzLl9pTy5vbmlkMy5hcHBseShzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gZmxhc2gvUlRNUC1vbmx5XHJcblxyXG4gICAgdGhpcy5fb25jb25uZWN0ID0gZnVuY3Rpb24oYlN1Y2Nlc3MpIHtcclxuXHJcbiAgICAgIGJTdWNjZXNzID0gKGJTdWNjZXNzID09PSAxKTtcclxuICAgICAgc20yLl93RChzLmlkICsgJzogJyArIChiU3VjY2VzcyA/ICdDb25uZWN0ZWQuJyA6ICdGYWlsZWQgdG8gY29ubmVjdD8gLSAnICsgcy51cmwpLCAoYlN1Y2Nlc3MgPyAxIDogMikpO1xyXG4gICAgICBzLmNvbm5lY3RlZCA9IGJTdWNjZXNzO1xyXG5cclxuICAgICAgaWYgKGJTdWNjZXNzKSB7XHJcblxyXG4gICAgICAgIHMuZmFpbHVyZXMgPSAwO1xyXG5cclxuICAgICAgICBpZiAoaWRDaGVjayhzLmlkKSkge1xyXG4gICAgICAgICAgaWYgKHMuZ2V0QXV0b1BsYXkoKSkge1xyXG4gICAgICAgICAgICAvLyBvbmx5IHVwZGF0ZSB0aGUgcGxheSBzdGF0ZSBpZiBhdXRvIHBsYXlpbmdcclxuICAgICAgICAgICAgcy5wbGF5KF91bmRlZmluZWQsIHMuZ2V0QXV0b1BsYXkoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHMuX2lPLmF1dG9Mb2FkKSB7XHJcbiAgICAgICAgICAgIHMubG9hZCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHMuX2lPLm9uY29ubmVjdCkge1xyXG4gICAgICAgICAgcy5faU8ub25jb25uZWN0LmFwcGx5KHMsIFtiU3VjY2Vzc10pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uZGF0YWVycm9yID0gZnVuY3Rpb24oc0Vycm9yKSB7XHJcblxyXG4gICAgICAvLyBmbGFzaCA5IHdhdmUvZXEgZGF0YSBoYW5kbGVyXHJcbiAgICAgIC8vIGhhY2s6IGNhbGxlZCBhdCBzdGFydCwgYW5kIGVuZCBmcm9tIGZsYXNoIGF0L2FmdGVyIG9uZmluaXNoKClcclxuICAgICAgaWYgKHMucGxheVN0YXRlID4gMCkge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IERhdGEgZXJyb3I6ICcgKyBzRXJyb3IpO1xyXG4gICAgICAgIGlmIChzLl9pTy5vbmRhdGFlcnJvcikge1xyXG4gICAgICAgICAgcy5faU8ub25kYXRhZXJyb3IuYXBwbHkocyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIHRoaXMuX2RlYnVnKCk7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07IC8vIFNNU291bmQoKVxyXG5cclxuICAvKipcclxuICAgKiBQcml2YXRlIFNvdW5kTWFuYWdlciBpbnRlcm5hbHNcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgZ2V0RG9jdW1lbnQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICByZXR1cm4gKGRvYy5ib2R5IHx8IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZGl2JylbMF0pO1xyXG5cclxuICB9O1xyXG5cclxuICBpZCA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIHJldHVybiBkb2MuZ2V0RWxlbWVudEJ5SWQoc0lEKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgbWl4aW4gPSBmdW5jdGlvbihvTWFpbiwgb0FkZCkge1xyXG5cclxuICAgIC8vIG5vbi1kZXN0cnVjdGl2ZSBtZXJnZVxyXG4gICAgdmFyIG8xID0gKG9NYWluIHx8IHt9KSwgbzIsIG87XHJcblxyXG4gICAgLy8gaWYgdW5zcGVjaWZpZWQsIG8yIGlzIHRoZSBkZWZhdWx0IG9wdGlvbnMgb2JqZWN0XHJcbiAgICBvMiA9IChvQWRkID09PSBfdW5kZWZpbmVkID8gc20yLmRlZmF1bHRPcHRpb25zIDogb0FkZCk7XHJcblxyXG4gICAgZm9yIChvIGluIG8yKSB7XHJcblxyXG4gICAgICBpZiAobzIuaGFzT3duUHJvcGVydHkobykgJiYgbzFbb10gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvMltvXSAhPT0gJ29iamVjdCcgfHwgbzJbb10gPT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAvLyBhc3NpZ24gZGlyZWN0bHlcclxuICAgICAgICAgIG8xW29dID0gbzJbb107XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gcmVjdXJzZSB0aHJvdWdoIG8yXHJcbiAgICAgICAgICBvMVtvXSA9IG1peGluKG8xW29dLCBvMltvXSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG8xO1xyXG5cclxuICB9O1xyXG5cclxuICB3cmFwQ2FsbGJhY2sgPSBmdW5jdGlvbihvU291bmQsIGNhbGxiYWNrKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAwMy8wMy8yMDEzOiBGaXggZm9yIEZsYXNoIFBsYXllciAxMS42LjYwMi4xNzEgKyBGbGFzaCA4IChmbGFzaFZlcnNpb24gPSA4KSBTV0YgaXNzdWVcclxuICAgICAqIHNldFRpbWVvdXQoKSBmaXggZm9yIGNlcnRhaW4gU01Tb3VuZCBjYWxsYmFja3MgbGlrZSBvbmxvYWQoKSBhbmQgb25maW5pc2goKSwgd2hlcmUgc3Vic2VxdWVudCBjYWxscyBsaWtlIHBsYXkoKSBhbmQgbG9hZCgpIGZhaWwgd2hlbiBGbGFzaCBQbGF5ZXIgMTEuNi42MDIuMTcxIGlzIGluc3RhbGxlZCwgYW5kIHVzaW5nIHNvdW5kTWFuYWdlciB3aXRoIGZsYXNoVmVyc2lvbiA9IDggKHdoaWNoIGlzIHRoZSBkZWZhdWx0KS5cclxuICAgICAqIE5vdCBzdXJlIG9mIGV4YWN0IGNhdXNlLiBTdXNwZWN0IHJhY2UgY29uZGl0aW9uIGFuZC9vciBpbnZhbGlkIChOYU4tc3R5bGUpIHBvc2l0aW9uIGFyZ3VtZW50IHRyaWNrbGluZyBkb3duIHRvIHRoZSBuZXh0IEpTIC0+IEZsYXNoIF9zdGFydCgpIGNhbGwsIGluIHRoZSBwbGF5KCkgY2FzZS5cclxuICAgICAqIEZpeDogc2V0VGltZW91dCgpIHRvIHlpZWxkLCBwbHVzIHNhZmVyIG51bGwgLyBOYU4gY2hlY2tpbmcgb24gcG9zaXRpb24gYXJndW1lbnQgcHJvdmlkZWQgdG8gRmxhc2guXHJcbiAgICAgKiBodHRwczovL2dldHNhdGlzZmFjdGlvbi5jb20vc2NoaWxsbWFuaWEvdG9waWNzL3JlY2VudF9jaHJvbWVfdXBkYXRlX3NlZW1zX3RvX2hhdmVfYnJva2VuX215X3NtMl9hdWRpb19wbGF5ZXJcclxuICAgICAqL1xyXG4gICAgaWYgKCFvU291bmQuaXNIVE1MNSAmJiBmViA9PT0gOCkge1xyXG4gICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvLyBhZGRpdGlvbmFsIHNvdW5kTWFuYWdlciBwcm9wZXJ0aWVzIHRoYXQgc291bmRNYW5hZ2VyLnNldHVwKCkgd2lsbCBhY2NlcHRcclxuXHJcbiAgZXh0cmFPcHRpb25zID0ge1xyXG4gICAgJ29ucmVhZHknOiAxLFxyXG4gICAgJ29udGltZW91dCc6IDEsXHJcbiAgICAnZGVmYXVsdE9wdGlvbnMnOiAxLFxyXG4gICAgJ2ZsYXNoOU9wdGlvbnMnOiAxLFxyXG4gICAgJ21vdmllU3Rhck9wdGlvbnMnOiAxXHJcbiAgfTtcclxuXHJcbiAgYXNzaWduID0gZnVuY3Rpb24obywgb1BhcmVudCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVjdXJzaXZlIGFzc2lnbm1lbnQgb2YgcHJvcGVydGllcywgc291bmRNYW5hZ2VyLnNldHVwKCkgaGVscGVyXHJcbiAgICAgKiBhbGxvd3MgcHJvcGVydHkgYXNzaWdubWVudCBiYXNlZCBvbiB3aGl0ZWxpc3RcclxuICAgICAqL1xyXG5cclxuICAgIHZhciBpLFxyXG4gICAgICAgIHJlc3VsdCA9IHRydWUsXHJcbiAgICAgICAgaGFzUGFyZW50ID0gKG9QYXJlbnQgIT09IF91bmRlZmluZWQpLFxyXG4gICAgICAgIHNldHVwT3B0aW9ucyA9IHNtMi5zZXR1cE9wdGlvbnMsXHJcbiAgICAgICAgYm9udXNPcHRpb25zID0gZXh0cmFPcHRpb25zO1xyXG5cclxuICAgIC8vIDxkPlxyXG5cclxuICAgIC8vIGlmIHNvdW5kTWFuYWdlci5zZXR1cCgpIGNhbGxlZCwgc2hvdyBhY2NlcHRlZCBwYXJhbWV0ZXJzLlxyXG5cclxuICAgIGlmIChvID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgIGZvciAoaSBpbiBzZXR1cE9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKHNldHVwT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG4gICAgICAgICAgcmVzdWx0LnB1c2goaSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChpIGluIGJvbnVzT3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAoYm9udXNPcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XHJcblxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBzbTJbaV0gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGkgKyAnOiB7Li4ufScpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChzbTJbaV0gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpICsgJzogZnVuY3Rpb24oKSB7Li4ufScpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goaSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0Qoc3RyKCdzZXR1cCcsIHJlc3VsdC5qb2luKCcsICcpKSk7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICBmb3IgKGkgaW4gbykge1xyXG5cclxuICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkoaSkpIHtcclxuXHJcbiAgICAgICAgLy8gaWYgbm90IGFuIHtvYmplY3R9IHdlIHdhbnQgdG8gcmVjdXJzZSB0aHJvdWdoLi4uXHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygb1tpXSAhPT0gJ29iamVjdCcgfHwgb1tpXSA9PT0gbnVsbCB8fCBvW2ldIGluc3RhbmNlb2YgQXJyYXkgfHwgb1tpXSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG5cclxuICAgICAgICAgIC8vIGNoZWNrIFwiYWxsb3dlZFwiIG9wdGlvbnNcclxuXHJcbiAgICAgICAgICBpZiAoaGFzUGFyZW50ICYmIGJvbnVzT3B0aW9uc1tvUGFyZW50XSAhPT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gdmFsaWQgcmVjdXJzaXZlIC8gbmVzdGVkIG9iamVjdCBvcHRpb24sIGVnLiwgeyBkZWZhdWx0T3B0aW9uczogeyB2b2x1bWU6IDUwIH0gfVxyXG4gICAgICAgICAgICBzbTJbb1BhcmVudF1baV0gPSBvW2ldO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAoc2V0dXBPcHRpb25zW2ldICE9PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBzcGVjaWFsIGNhc2U6IGFzc2lnbiB0byBzZXR1cE9wdGlvbnMgb2JqZWN0LCB3aGljaCBzb3VuZE1hbmFnZXIgcHJvcGVydHkgcmVmZXJlbmNlc1xyXG4gICAgICAgICAgICBzbTIuc2V0dXBPcHRpb25zW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFzc2lnbiBkaXJlY3RseSB0byBzb3VuZE1hbmFnZXIsIHRvb1xyXG4gICAgICAgICAgICBzbTJbaV0gPSBvW2ldO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAoYm9udXNPcHRpb25zW2ldID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpbnZhbGlkIG9yIGRpc2FsbG93ZWQgcGFyYW1ldGVyLiBjb21wbGFpbi5cclxuICAgICAgICAgICAgY29tcGxhaW4oc3RyKChzbTJbaV0gPT09IF91bmRlZmluZWQgPyAnc2V0dXBVbmRlZicgOiAnc2V0dXBFcnJvcicpLCBpKSwgMik7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIHZhbGlkIGV4dHJhT3B0aW9ucyAoYm9udXNPcHRpb25zKSBwYXJhbWV0ZXIuXHJcbiAgICAgICAgICAgICAqIGlzIGl0IGEgbWV0aG9kLCBsaWtlIG9ucmVhZHkvb250aW1lb3V0PyBjYWxsIGl0LlxyXG4gICAgICAgICAgICAgKiBtdWx0aXBsZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBpbiBhbiBhcnJheSwgZWcuIHNvdW5kTWFuYWdlci5zZXR1cCh7b25yZWFkeTogW215SGFuZGxlciwgbXlTY29wZV19KTtcclxuICAgICAgICAgICAgICovXHJcblxyXG4gICAgICAgICAgICBpZiAoc20yW2ldIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgc20yW2ldLmFwcGx5KHNtMiwgKG9baV0gaW5zdGFuY2VvZiBBcnJheSA/IG9baV0gOiBbb1tpXV0pKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGdvb2Qgb2xkLWZhc2hpb25lZCBkaXJlY3QgYXNzaWdubWVudFxyXG4gICAgICAgICAgICAgIHNtMltpXSA9IG9baV07XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIHJlY3Vyc2lvbiBjYXNlLCBlZy4sIHsgZGVmYXVsdE9wdGlvbnM6IHsgLi4uIH0gfVxyXG5cclxuICAgICAgICAgIGlmIChib251c09wdGlvbnNbaV0gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGludmFsaWQgb3IgZGlzYWxsb3dlZCBwYXJhbWV0ZXIuIGNvbXBsYWluLlxyXG4gICAgICAgICAgICBjb21wbGFpbihzdHIoKHNtMltpXSA9PT0gX3VuZGVmaW5lZCA/ICdzZXR1cFVuZGVmJyA6ICdzZXR1cEVycm9yJyksIGkpLCAyKTtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyByZWN1cnNlIHRocm91Z2ggb2JqZWN0XHJcbiAgICAgICAgICAgIHJldHVybiBhc3NpZ24ob1tpXSwgaSk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHByZWZlckZsYXNoQ2hlY2soa2luZCkge1xyXG5cclxuICAgIC8vIHdoZXRoZXIgZmxhc2ggc2hvdWxkIHBsYXkgYSBnaXZlbiB0eXBlXHJcbiAgICByZXR1cm4gKHNtMi5wcmVmZXJGbGFzaCAmJiBoYXNGbGFzaCAmJiAhc20yLmlnbm9yZUZsYXNoICYmIChzbTIuZmxhc2hba2luZF0gIT09IF91bmRlZmluZWQgJiYgc20yLmZsYXNoW2tpbmRdKSk7XHJcblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJuYWwgRE9NMi1sZXZlbCBldmVudCBoZWxwZXJzXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIGV2ZW50ID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIG5vcm1hbGl6ZSBldmVudCBtZXRob2RzXHJcbiAgICB2YXIgb2xkID0gKHdpbmRvdy5hdHRhY2hFdmVudCksXHJcbiAgICBldnQgPSB7XHJcbiAgICAgIGFkZDogKG9sZCA/ICdhdHRhY2hFdmVudCcgOiAnYWRkRXZlbnRMaXN0ZW5lcicpLFxyXG4gICAgICByZW1vdmU6IChvbGQgPyAnZGV0YWNoRXZlbnQnIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInKVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBub3JtYWxpemUgXCJvblwiIGV2ZW50IHByZWZpeCwgb3B0aW9uYWwgY2FwdHVyZSBhcmd1bWVudFxyXG4gICAgZnVuY3Rpb24gZ2V0QXJncyhvQXJncykge1xyXG5cclxuICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKG9BcmdzKSxcclxuICAgICAgICAgIGxlbiA9IGFyZ3MubGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKG9sZCkge1xyXG4gICAgICAgIC8vIHByZWZpeFxyXG4gICAgICAgIGFyZ3NbMV0gPSAnb24nICsgYXJnc1sxXTtcclxuICAgICAgICBpZiAobGVuID4gMykge1xyXG4gICAgICAgICAgLy8gbm8gY2FwdHVyZVxyXG4gICAgICAgICAgYXJncy5wb3AoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAobGVuID09PSAzKSB7XHJcbiAgICAgICAgYXJncy5wdXNoKGZhbHNlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGFyZ3M7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGx5KGFyZ3MsIHNUeXBlKSB7XHJcblxyXG4gICAgICAvLyBub3JtYWxpemUgYW5kIGNhbGwgdGhlIGV2ZW50IG1ldGhvZCwgd2l0aCB0aGUgcHJvcGVyIGFyZ3VtZW50c1xyXG4gICAgICB2YXIgZWxlbWVudCA9IGFyZ3Muc2hpZnQoKSxcclxuICAgICAgICAgIG1ldGhvZCA9IFtldnRbc1R5cGVdXTtcclxuXHJcbiAgICAgIGlmIChvbGQpIHtcclxuICAgICAgICAvLyBvbGQgSUUgY2FuJ3QgZG8gYXBwbHkoKS5cclxuICAgICAgICBlbGVtZW50W21ldGhvZF0oYXJnc1swXSwgYXJnc1sxXSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxlbWVudFttZXRob2RdLmFwcGx5KGVsZW1lbnQsIGFyZ3MpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZCgpIHtcclxuICAgICAgYXBwbHkoZ2V0QXJncyhhcmd1bWVudHMpLCAnYWRkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlKCkge1xyXG4gICAgICBhcHBseShnZXRBcmdzKGFyZ3VtZW50cyksICdyZW1vdmUnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnYWRkJzogYWRkLFxyXG4gICAgICAncmVtb3ZlJzogcmVtb3ZlXHJcbiAgICB9O1xyXG5cclxuICB9KCkpO1xyXG5cclxuICAvKipcclxuICAgKiBJbnRlcm5hbCBIVE1MNSBldmVudCBoYW5kbGluZ1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIGh0bWw1X2V2ZW50KG9Gbikge1xyXG5cclxuICAgIC8vIHdyYXAgaHRtbDUgZXZlbnQgaGFuZGxlcnMgc28gd2UgZG9uJ3QgY2FsbCB0aGVtIG9uIGRlc3Ryb3llZCBhbmQvb3IgdW5sb2FkZWQgc291bmRzXHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcyxcclxuICAgICAgICAgIHJlc3VsdDtcclxuXHJcbiAgICAgIGlmICghcyB8fCAhcy5fYSkge1xyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChzICYmIHMuaWQpIHtcclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IElnbm9yaW5nICcgKyBlLnR5cGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGg1ICsgJ0lnbm9yaW5nICcgKyBlLnR5cGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcbiAgICAgICAgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXN1bHQgPSBvRm4uY2FsbCh0aGlzLCBlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9O1xyXG5cclxuICB9XHJcblxyXG4gIGh0bWw1X2V2ZW50cyA9IHtcclxuXHJcbiAgICAvLyBIVE1MNSBldmVudC1uYW1lLXRvLWhhbmRsZXIgbWFwXHJcblxyXG4gICAgYWJvcnQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogYWJvcnQnKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBlbm91Z2ggaGFzIGxvYWRlZCB0byBwbGF5XHJcblxyXG4gICAgY2FucGxheTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3MsXHJcbiAgICAgICAgICBwb3NpdGlvbjFLO1xyXG5cclxuICAgICAgaWYgKHMuX2h0bWw1X2NhbnBsYXkpIHtcclxuICAgICAgICAvLyB0aGlzIGV2ZW50IGhhcyBhbHJlYWR5IGZpcmVkLiBpZ25vcmUuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuX2h0bWw1X2NhbnBsYXkgPSB0cnVlO1xyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBjYW5wbGF5Jyk7XHJcbiAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG5cclxuICAgICAgLy8gcG9zaXRpb24gYWNjb3JkaW5nIHRvIGluc3RhbmNlIG9wdGlvbnNcclxuICAgICAgcG9zaXRpb24xSyA9IChzLl9pTy5wb3NpdGlvbiAhPT0gX3VuZGVmaW5lZCAmJiAhaXNOYU4ocy5faU8ucG9zaXRpb24pID8gcy5faU8ucG9zaXRpb24vbXNlY1NjYWxlIDogbnVsbCk7XHJcblxyXG4gICAgICAvLyBzZXQgdGhlIHBvc2l0aW9uIGlmIHBvc2l0aW9uIHdhcyBwcm92aWRlZCBiZWZvcmUgdGhlIHNvdW5kIGxvYWRlZFxyXG4gICAgICBpZiAodGhpcy5jdXJyZW50VGltZSAhPT0gcG9zaXRpb24xSykge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IGNhbnBsYXk6IFNldHRpbmcgcG9zaXRpb24gdG8gJyArIHBvc2l0aW9uMUspO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lID0gcG9zaXRpb24xSztcclxuICAgICAgICB9IGNhdGNoKGVlKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBjYW5wbGF5OiBTZXR0aW5nIHBvc2l0aW9uIG9mICcgKyBwb3NpdGlvbjFLICsgJyBmYWlsZWQ6ICcgKyBlZS5tZXNzYWdlLCAyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGhhY2sgZm9yIEhUTUw1IGZyb20vdG8gY2FzZVxyXG4gICAgICBpZiAocy5faU8uX29uY2FucGxheSkge1xyXG4gICAgICAgIHMuX2lPLl9vbmNhbnBsYXkoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGNhbnBsYXl0aHJvdWdoOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIGlmICghcy5sb2FkZWQpIHtcclxuICAgICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuICAgICAgICBzLl93aGlsZWxvYWRpbmcocy5ieXRlc0xvYWRlZCwgcy5ieXRlc1RvdGFsLCBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKSk7XHJcbiAgICAgICAgcy5fb25sb2FkKHRydWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgZHVyYXRpb25jaGFuZ2U6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gZHVyYXRpb25jaGFuZ2UgbWF5IGZpcmUgYXQgdmFyaW91cyB0aW1lcywgcHJvYmFibHkgdGhlIHNhZmVzdCB3YXkgdG8gY2FwdHVyZSBhY2N1cmF0ZS9maW5hbCBkdXJhdGlvbi5cclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcyxcclxuICAgICAgICAgIGR1cmF0aW9uO1xyXG5cclxuICAgICAgZHVyYXRpb24gPSBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKTtcclxuXHJcbiAgICAgIGlmICghaXNOYU4oZHVyYXRpb24pICYmIGR1cmF0aW9uICE9PSBzLmR1cmF0aW9uKSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGR1cmF0aW9uY2hhbmdlICgnICsgZHVyYXRpb24gKyAnKScgKyAocy5kdXJhdGlvbiA/ICcsIHByZXZpb3VzbHkgJyArIHMuZHVyYXRpb24gOiAnJykpO1xyXG5cclxuICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBzLmR1cmF0aW9uID0gZHVyYXRpb247XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gVE9ETzogUmVzZXJ2ZWQgZm9yIHBvdGVudGlhbCB1c2VcclxuICAgIC8qXHJcbiAgICBlbXB0aWVkOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGVtcHRpZWQnKTtcclxuXHJcbiAgICB9KSxcclxuICAgICovXHJcblxyXG4gICAgZW5kZWQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogZW5kZWQnKTtcclxuXHJcbiAgICAgIHMuX29uZmluaXNoKCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgZXJyb3I6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogSFRNTDUgZXJyb3IsIGNvZGUgJyArIHRoaXMuZXJyb3IuY29kZSk7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIVE1MNSBlcnJvciBjb2RlcywgcGVyIFczQ1xyXG4gICAgICAgKiBFcnJvciAxOiBDbGllbnQgYWJvcnRlZCBkb3dubG9hZCBhdCB1c2VyJ3MgcmVxdWVzdC5cclxuICAgICAgICogRXJyb3IgMjogTmV0d29yayBlcnJvciBhZnRlciBsb2FkIHN0YXJ0ZWQuXHJcbiAgICAgICAqIEVycm9yIDM6IERlY29kaW5nIGlzc3VlLlxyXG4gICAgICAgKiBFcnJvciA0OiBNZWRpYSAoYXVkaW8gZmlsZSkgbm90IHN1cHBvcnRlZC5cclxuICAgICAgICogUmVmZXJlbmNlOiBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS90aGUtdmlkZW8tZWxlbWVudC5odG1sI2Vycm9yLWNvZGVzXHJcbiAgICAgICAqL1xyXG4gICAgICAvLyBjYWxsIGxvYWQgd2l0aCBlcnJvciBzdGF0ZT9cclxuICAgICAgdGhpcy5fcy5fb25sb2FkKGZhbHNlKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBsb2FkZWRkYXRhOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IGxvYWRlZGRhdGEnKTtcclxuXHJcbiAgICAgIC8vIHNhZmFyaSBzZWVtcyB0byBuaWNlbHkgcmVwb3J0IHByb2dyZXNzIGV2ZW50cywgZXZlbnR1YWxseSB0b3RhbGxpbmcgMTAwJVxyXG4gICAgICBpZiAoIXMuX2xvYWRlZCAmJiAhaXNTYWZhcmkpIHtcclxuICAgICAgICBzLmR1cmF0aW9uID0gcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBsb2FkZWRtZXRhZGF0YTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBsb2FkZWRtZXRhZGF0YScpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGxvYWRzdGFydDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBsb2Fkc3RhcnQnKTtcclxuICAgICAgLy8gYXNzdW1lIGJ1ZmZlcmluZyBhdCBmaXJzdFxyXG4gICAgICB0aGlzLl9zLl9vbmJ1ZmZlcmNoYW5nZSgxKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBwbGF5OiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHBsYXkoKScpO1xyXG4gICAgICAvLyBvbmNlIHBsYXkgc3RhcnRzLCBubyBidWZmZXJpbmdcclxuICAgICAgdGhpcy5fcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgcGxheWluZzogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBwbGF5aW5nICcgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKDk4MzUpKTtcclxuICAgICAgLy8gb25jZSBwbGF5IHN0YXJ0cywgbm8gYnVmZmVyaW5nXHJcbiAgICAgIHRoaXMuX3MuX29uYnVmZmVyY2hhbmdlKDApO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHByb2dyZXNzOiBodG1sNV9ldmVudChmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAvLyBub3RlOiBjYW4gZmlyZSByZXBlYXRlZGx5IGFmdGVyIFwibG9hZGVkXCIgZXZlbnQsIGR1ZSB0byB1c2Ugb2YgSFRUUCByYW5nZS9wYXJ0aWFsc1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zLFxyXG4gICAgICAgICAgaSwgaiwgcHJvZ1N0ciwgYnVmZmVyZWQgPSAwLFxyXG4gICAgICAgICAgaXNQcm9ncmVzcyA9IChlLnR5cGUgPT09ICdwcm9ncmVzcycpLFxyXG4gICAgICAgICAgcmFuZ2VzID0gZS50YXJnZXQuYnVmZmVyZWQsXHJcbiAgICAgICAgICAvLyBmaXJlZm94IDMuNiBpbXBsZW1lbnRzIGUubG9hZGVkL3RvdGFsIChieXRlcylcclxuICAgICAgICAgIGxvYWRlZCA9IChlLmxvYWRlZCB8fCAwKSxcclxuICAgICAgICAgIHRvdGFsID0gKGUudG90YWwgfHwgMSk7XHJcblxyXG4gICAgICAvLyByZXNldCB0aGUgXCJidWZmZXJlZFwiIChsb2FkZWQgYnl0ZSByYW5nZXMpIGFycmF5XHJcbiAgICAgIHMuYnVmZmVyZWQgPSBbXTtcclxuXHJcbiAgICAgIGlmIChyYW5nZXMgJiYgcmFuZ2VzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAvLyBpZiBsb2FkZWQgaXMgMCwgdHJ5IFRpbWVSYW5nZXMgaW1wbGVtZW50YXRpb24gYXMgJSBvZiBsb2FkXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vRE9NL1RpbWVSYW5nZXNcclxuXHJcbiAgICAgICAgLy8gcmUtYnVpbGQgXCJidWZmZXJlZFwiIGFycmF5XHJcbiAgICAgICAgLy8gSFRNTDUgcmV0dXJucyBzZWNvbmRzLiBTTTIgQVBJIHVzZXMgbXNlYyBmb3Igc2V0UG9zaXRpb24oKSBldGMuLCB3aGV0aGVyIEZsYXNoIG9yIEhUTUw1LlxyXG4gICAgICAgIGZvciAoaSA9IDAsIGogPSByYW5nZXMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgICBzLmJ1ZmZlcmVkLnB1c2goe1xyXG4gICAgICAgICAgICAnc3RhcnQnOiByYW5nZXMuc3RhcnQoaSkgKiBtc2VjU2NhbGUsXHJcbiAgICAgICAgICAgICdlbmQnOiByYW5nZXMuZW5kKGkpICogbXNlY1NjYWxlXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVzZSB0aGUgbGFzdCB2YWx1ZSBsb2NhbGx5XHJcbiAgICAgICAgYnVmZmVyZWQgPSAocmFuZ2VzLmVuZCgwKSAtIHJhbmdlcy5zdGFydCgwKSkgKiBtc2VjU2NhbGU7XHJcblxyXG4gICAgICAgIC8vIGxpbmVhciBjYXNlLCBidWZmZXIgc3VtOyBkb2VzIG5vdCBhY2NvdW50IGZvciBzZWVraW5nIGFuZCBIVFRQIHBhcnRpYWxzIC8gYnl0ZSByYW5nZXNcclxuICAgICAgICBsb2FkZWQgPSBNYXRoLm1pbigxLCBidWZmZXJlZCAvIChlLnRhcmdldC5kdXJhdGlvbiAqIG1zZWNTY2FsZSkpO1xyXG5cclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAoaXNQcm9ncmVzcyAmJiByYW5nZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgcHJvZ1N0ciA9IFtdO1xyXG4gICAgICAgICAgaiA9IHJhbmdlcy5sZW5ndGg7XHJcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgICAgIHByb2dTdHIucHVzaCgoZS50YXJnZXQuYnVmZmVyZWQuc3RhcnQoaSkgKiBtc2VjU2NhbGUpICsgJy0nICsgKGUudGFyZ2V0LmJ1ZmZlcmVkLmVuZChpKSAqIG1zZWNTY2FsZSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogcHJvZ3Jlc3MsIHRpbWVSYW5nZXM6ICcgKyBwcm9nU3RyLmpvaW4oJywgJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlzUHJvZ3Jlc3MgJiYgIWlzTmFOKGxvYWRlZCkpIHtcclxuICAgICAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHByb2dyZXNzLCAnICsgTWF0aC5mbG9vcihsb2FkZWQgKiAxMDApICsgJyUgbG9hZGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghaXNOYU4obG9hZGVkKSkge1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBwcmV2ZW50IGNhbGxzIHdpdGggZHVwbGljYXRlIHZhbHVlcy5cclxuICAgICAgICBzLl93aGlsZWxvYWRpbmcobG9hZGVkLCB0b3RhbCwgcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCkpO1xyXG4gICAgICAgIGlmIChsb2FkZWQgJiYgdG90YWwgJiYgbG9hZGVkID09PSB0b3RhbCkge1xyXG4gICAgICAgICAgLy8gaW4gY2FzZSBcIm9ubG9hZFwiIGRvZXNuJ3QgZmlyZSAoZWcuIGdlY2tvIDEuOS4yKVxyXG4gICAgICAgICAgaHRtbDVfZXZlbnRzLmNhbnBsYXl0aHJvdWdoLmNhbGwodGhpcywgZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHJhdGVjaGFuZ2U6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogcmF0ZWNoYW5nZScpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHN1c3BlbmQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgIC8vIGRvd25sb2FkIHBhdXNlZC9zdG9wcGVkLCBtYXkgaGF2ZSBmaW5pc2hlZCAoZWcuIG9ubG9hZClcclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogc3VzcGVuZCcpO1xyXG4gICAgICBodG1sNV9ldmVudHMucHJvZ3Jlc3MuY2FsbCh0aGlzLCBlKTtcclxuICAgICAgcy5fb25zdXNwZW5kKCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgc3RhbGxlZDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBzdGFsbGVkJyk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgdGltZXVwZGF0ZTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB0aGlzLl9zLl9vblRpbWVyKCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgd2FpdGluZzogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICAvLyBzZWUgYWxzbzogc2Vla2luZ1xyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiB3YWl0aW5nJyk7XHJcblxyXG4gICAgICAvLyBwbGF5YmFjayBmYXN0ZXIgdGhhbiBkb3dubG9hZCByYXRlLCBldGMuXHJcbiAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDEpO1xyXG5cclxuICAgIH0pXHJcblxyXG4gIH07XHJcblxyXG4gIGh0bWw1T0sgPSBmdW5jdGlvbihpTykge1xyXG5cclxuICAgIC8vIHBsYXlhYmlsaXR5IHRlc3QgYmFzZWQgb24gVVJMIG9yIE1JTUUgdHlwZVxyXG5cclxuICAgIHZhciByZXN1bHQ7XHJcblxyXG4gICAgaWYgKCFpTyB8fCAoIWlPLnR5cGUgJiYgIWlPLnVybCAmJiAhaU8uc2VydmVyVVJMKSkge1xyXG5cclxuICAgICAgLy8gbm90aGluZyB0byBjaGVja1xyXG4gICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKGlPLnNlcnZlclVSTCB8fCAoaU8udHlwZSAmJiBwcmVmZXJGbGFzaENoZWNrKGlPLnR5cGUpKSkge1xyXG5cclxuICAgICAgLy8gUlRNUCwgb3IgcHJlZmVycmluZyBmbGFzaFxyXG4gICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgLy8gVXNlIHR5cGUsIGlmIHNwZWNpZmllZC4gUGFzcyBkYXRhOiBVUklzIHRvIEhUTUw1LiBJZiBIVE1MNS1vbmx5IG1vZGUsIG5vIG90aGVyIG9wdGlvbnMsIHNvIGp1c3QgZ2l2ZSAnZXJcclxuICAgICAgcmVzdWx0ID0gKChpTy50eXBlID8gaHRtbDVDYW5QbGF5KHt0eXBlOmlPLnR5cGV9KSA6IGh0bWw1Q2FuUGxheSh7dXJsOmlPLnVybH0pIHx8IHNtMi5odG1sNU9ubHkgfHwgaU8udXJsLm1hdGNoKC9kYXRhXFw6L2kpKSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIGh0bWw1VW5sb2FkID0gZnVuY3Rpb24ob0F1ZGlvKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcm5hbCBtZXRob2Q6IFVubG9hZCBtZWRpYSwgYW5kIGNhbmNlbCBhbnkgY3VycmVudC9wZW5kaW5nIG5ldHdvcmsgcmVxdWVzdHMuXHJcbiAgICAgKiBGaXJlZm94IGNhbiBsb2FkIGFuIGVtcHR5IFVSTCwgd2hpY2ggYWxsZWdlZGx5IGRlc3Ryb3lzIHRoZSBkZWNvZGVyIGFuZCBzdG9wcyB0aGUgZG93bmxvYWQuXHJcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9Fbi9Vc2luZ19hdWRpb19hbmRfdmlkZW9faW5fRmlyZWZveCNTdG9wcGluZ190aGVfZG93bmxvYWRfb2ZfbWVkaWFcclxuICAgICAqIEhvd2V2ZXIsIEZpcmVmb3ggaGFzIGJlZW4gc2VlbiBsb2FkaW5nIGEgcmVsYXRpdmUgVVJMIGZyb20gJycgYW5kIHRodXMgcmVxdWVzdGluZyB0aGUgaG9zdGluZyBwYWdlIG9uIHVubG9hZC5cclxuICAgICAqIE90aGVyIFVBIGJlaGF2aW91ciBpcyB1bmNsZWFyLCBzbyBldmVyeW9uZSBlbHNlIGdldHMgYW4gYWJvdXQ6Ymxhbmstc3R5bGUgVVJMLlxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIHVybDtcclxuXHJcbiAgICBpZiAob0F1ZGlvKSB7XHJcblxyXG4gICAgICAvLyBGaXJlZm94IGFuZCBDaHJvbWUgYWNjZXB0IHNob3J0IFdBVmUgZGF0YTogVVJJcy4gQ2hvbWUgZGlzbGlrZXMgYXVkaW8vd2F2LCBidXQgYWNjZXB0cyBhdWRpby93YXYgZm9yIGRhdGE6IE1JTUUuXHJcbiAgICAgIC8vIERlc2t0b3AgU2FmYXJpIGNvbXBsYWlucyAvIGZhaWxzIG9uIGRhdGE6IFVSSSwgc28gaXQgZ2V0cyBhYm91dDpibGFuay5cclxuICAgICAgdXJsID0gKGlzU2FmYXJpID8gZW1wdHlVUkwgOiAoc20yLmh0bWw1LmNhblBsYXlUeXBlKCdhdWRpby93YXYnKSA/IGVtcHR5V0FWIDogZW1wdHlVUkwpKTtcclxuXHJcbiAgICAgIG9BdWRpby5zcmMgPSB1cmw7XHJcblxyXG4gICAgICAvLyByZXNldCBzb21lIHN0YXRlLCB0b29cclxuICAgICAgaWYgKG9BdWRpby5fY2FsbGVkX3VubG9hZCAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIG9BdWRpby5fY2FsbGVkX2xvYWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAodXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgLy8gZW5zdXJlIFVSTCBzdGF0ZSBpcyB0cmFzaGVkLCBhbHNvXHJcbiAgICAgIGxhc3RHbG9iYWxIVE1MNVVSTCA9IG51bGw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB1cmw7XHJcblxyXG4gIH07XHJcblxyXG4gIGh0bWw1Q2FuUGxheSA9IGZ1bmN0aW9uKG8pIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyeSB0byBmaW5kIE1JTUUsIHRlc3QgYW5kIHJldHVybiB0cnV0aGluZXNzXHJcbiAgICAgKiBvID0ge1xyXG4gICAgICogIHVybDogJy9wYXRoL3RvL2FuLm1wMycsXHJcbiAgICAgKiAgdHlwZTogJ2F1ZGlvL21wMydcclxuICAgICAqIH1cclxuICAgICAqL1xyXG5cclxuICAgIGlmICghc20yLnVzZUhUTUw1QXVkaW8gfHwgIXNtMi5oYXNIVE1MNSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHVybCA9IChvLnVybCB8fCBudWxsKSxcclxuICAgICAgICBtaW1lID0gKG8udHlwZSB8fCBudWxsKSxcclxuICAgICAgICBhRiA9IHNtMi5hdWRpb0Zvcm1hdHMsXHJcbiAgICAgICAgcmVzdWx0LFxyXG4gICAgICAgIG9mZnNldCxcclxuICAgICAgICBmaWxlRXh0LFxyXG4gICAgICAgIGl0ZW07XHJcblxyXG4gICAgLy8gYWNjb3VudCBmb3Iga25vd24gY2FzZXMgbGlrZSBhdWRpby9tcDNcclxuXHJcbiAgICBpZiAobWltZSAmJiBzbTIuaHRtbDVbbWltZV0gIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuIChzbTIuaHRtbDVbbWltZV0gJiYgIXByZWZlckZsYXNoQ2hlY2sobWltZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaHRtbDVFeHQpIHtcclxuICAgICAgXHJcbiAgICAgIGh0bWw1RXh0ID0gW107XHJcbiAgICAgIFxyXG4gICAgICBmb3IgKGl0ZW0gaW4gYUYpIHtcclxuICAgICAgXHJcbiAgICAgICAgaWYgKGFGLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgIFxyXG4gICAgICAgICAgaHRtbDVFeHQucHVzaChpdGVtKTtcclxuICAgICAgXHJcbiAgICAgICAgICBpZiAoYUZbaXRlbV0ucmVsYXRlZCkge1xyXG4gICAgICAgICAgICBodG1sNUV4dCA9IGh0bWw1RXh0LmNvbmNhdChhRltpdGVtXS5yZWxhdGVkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICBcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaHRtbDVFeHQgPSBuZXcgUmVnRXhwKCdcXFxcLignK2h0bWw1RXh0LmpvaW4oJ3wnKSsnKShcXFxcPy4qKT8kJywnaScpO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogU3RyaXAgVVJMIHF1ZXJpZXMsIGV0Yy5cclxuICAgIGZpbGVFeHQgPSAodXJsID8gdXJsLnRvTG93ZXJDYXNlKCkubWF0Y2goaHRtbDVFeHQpIDogbnVsbCk7XHJcblxyXG4gICAgaWYgKCFmaWxlRXh0IHx8ICFmaWxlRXh0Lmxlbmd0aCkge1xyXG4gICAgICBcclxuICAgICAgaWYgKCFtaW1lKSB7XHJcbiAgICAgIFxyXG4gICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICBcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgXHJcbiAgICAgICAgLy8gYXVkaW8vbXAzIC0+IG1wMywgcmVzdWx0IHNob3VsZCBiZSBrbm93blxyXG4gICAgICAgIG9mZnNldCA9IG1pbWUuaW5kZXhPZignOycpO1xyXG4gICAgICBcclxuICAgICAgICAvLyBzdHJpcCBcImF1ZGlvL1g7IGNvZGVjcy4uLlwiXHJcbiAgICAgICAgZmlsZUV4dCA9IChvZmZzZXQgIT09IC0xID8gbWltZS5zdWJzdHIoMCxvZmZzZXQpIDogbWltZSkuc3Vic3RyKDYpO1xyXG4gICAgICBcclxuICAgICAgfVxyXG4gICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgXHJcbiAgICAgIC8vIG1hdGNoIHRoZSByYXcgZXh0ZW5zaW9uIG5hbWUgLSBcIm1wM1wiLCBmb3IgZXhhbXBsZVxyXG4gICAgICBmaWxlRXh0ID0gZmlsZUV4dFsxXTtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGlmIChmaWxlRXh0ICYmIHNtMi5odG1sNVtmaWxlRXh0XSAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgXHJcbiAgICAgIC8vIHJlc3VsdCBrbm93blxyXG4gICAgICByZXN1bHQgPSAoc20yLmh0bWw1W2ZpbGVFeHRdICYmICFwcmVmZXJGbGFzaENoZWNrKGZpbGVFeHQpKTtcclxuICAgIFxyXG4gICAgfSBlbHNlIHtcclxuICAgIFxyXG4gICAgICBtaW1lID0gJ2F1ZGlvLycgKyBmaWxlRXh0O1xyXG4gICAgICByZXN1bHQgPSBzbTIuaHRtbDUuY2FuUGxheVR5cGUoe3R5cGU6bWltZX0pO1xyXG4gICAgXHJcbiAgICAgIHNtMi5odG1sNVtmaWxlRXh0XSA9IHJlc3VsdDtcclxuICAgIFxyXG4gICAgICAvLyBzbTIuX3dEKCdjYW5QbGF5VHlwZSwgZm91bmQgcmVzdWx0OiAnICsgcmVzdWx0KTtcclxuICAgICAgcmVzdWx0ID0gKHJlc3VsdCAmJiBzbTIuaHRtbDVbbWltZV0gJiYgIXByZWZlckZsYXNoQ2hlY2sobWltZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIHRlc3RIVE1MNSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWw6IEl0ZXJhdGVzIG92ZXIgYXVkaW9Gb3JtYXRzLCBkZXRlcm1pbmluZyBzdXBwb3J0IGVnLiBhdWRpby9tcDMsIGF1ZGlvL21wZWcgYW5kIHNvIG9uXHJcbiAgICAgKiBhc3NpZ25zIHJlc3VsdHMgdG8gaHRtbDVbXSBhbmQgZmxhc2hbXS5cclxuICAgICAqL1xyXG5cclxuICAgIGlmICghc20yLnVzZUhUTUw1QXVkaW8gfHwgIXNtMi5oYXNIVE1MNSkge1xyXG4gICAgXHJcbiAgICAgIC8vIHdpdGhvdXQgSFRNTDUsIHdlIG5lZWQgRmxhc2guXHJcbiAgICAgIHNtMi5odG1sNS51c2luZ0ZsYXNoID0gdHJ1ZTtcclxuICAgICAgbmVlZHNGbGFzaCA9IHRydWU7XHJcbiAgICBcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZG91YmxlLXdoYW1teTogT3BlcmEgOS42NCB0aHJvd3MgV1JPTkdfQVJHVU1FTlRTX0VSUiBpZiBubyBwYXJhbWV0ZXIgcGFzc2VkIHRvIEF1ZGlvKCksIGFuZCBXZWJraXQgKyBpT1MgaGFwcGlseSB0cmllcyB0byBsb2FkIFwibnVsbFwiIGFzIGEgVVJMLiA6L1xyXG4gICAgdmFyIGEgPSAoQXVkaW8gIT09IF91bmRlZmluZWQgPyAoaXNPcGVyYSAmJiBvcGVyYS52ZXJzaW9uKCkgPCAxMCA/IG5ldyBBdWRpbyhudWxsKSA6IG5ldyBBdWRpbygpKSA6IG51bGwpLFxyXG4gICAgICAgIGl0ZW0sIGxvb2t1cCwgc3VwcG9ydCA9IHt9LCBhRiwgaTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcChtKSB7XHJcblxyXG4gICAgICB2YXIgY2FuUGxheSwgaixcclxuICAgICAgICAgIHJlc3VsdCA9IGZhbHNlLFxyXG4gICAgICAgICAgaXNPSyA9IGZhbHNlO1xyXG5cclxuICAgICAgaWYgKCFhIHx8IHR5cGVvZiBhLmNhblBsYXlUeXBlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG0gaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgXHJcbiAgICAgICAgLy8gaXRlcmF0ZSB0aHJvdWdoIGFsbCBtaW1lIHR5cGVzLCByZXR1cm4gYW55IHN1Y2Nlc3Nlc1xyXG4gICAgXHJcbiAgICAgICAgZm9yIChpID0gMCwgaiA9IG0ubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICBcclxuICAgICAgICAgIGlmIChzbTIuaHRtbDVbbVtpXV0gfHwgYS5jYW5QbGF5VHlwZShtW2ldKS5tYXRjaChzbTIuaHRtbDVUZXN0KSkge1xyXG4gICAgXHJcbiAgICAgICAgICAgIGlzT0sgPSB0cnVlO1xyXG4gICAgICAgICAgICBzbTIuaHRtbDVbbVtpXV0gPSB0cnVlO1xyXG4gICAgXHJcbiAgICAgICAgICAgIC8vIG5vdGUgZmxhc2ggc3VwcG9ydCwgdG9vXHJcbiAgICAgICAgICAgIHNtMi5mbGFzaFttW2ldXSA9ICEhKG1baV0ubWF0Y2goZmxhc2hNSU1FKSk7XHJcbiAgICBcclxuICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIHJlc3VsdCA9IGlzT0s7XHJcbiAgICBcclxuICAgICAgfSBlbHNlIHtcclxuICAgIFxyXG4gICAgICAgIGNhblBsYXkgPSAoYSAmJiB0eXBlb2YgYS5jYW5QbGF5VHlwZSA9PT0gJ2Z1bmN0aW9uJyA/IGEuY2FuUGxheVR5cGUobSkgOiBmYWxzZSk7XHJcbiAgICAgICAgcmVzdWx0ID0gISEoY2FuUGxheSAmJiAoY2FuUGxheS5tYXRjaChzbTIuaHRtbDVUZXN0KSkpO1xyXG4gICAgXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRlc3QgYWxsIHJlZ2lzdGVyZWQgZm9ybWF0cyArIGNvZGVjc1xyXG5cclxuICAgIGFGID0gc20yLmF1ZGlvRm9ybWF0cztcclxuXHJcbiAgICBmb3IgKGl0ZW0gaW4gYUYpIHtcclxuXHJcbiAgICAgIGlmIChhRi5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG5cclxuICAgICAgICBsb29rdXAgPSAnYXVkaW8vJyArIGl0ZW07XHJcblxyXG4gICAgICAgIHN1cHBvcnRbaXRlbV0gPSBjcChhRltpdGVtXS50eXBlKTtcclxuXHJcbiAgICAgICAgLy8gd3JpdGUgYmFjayBnZW5lcmljIHR5cGUgdG9vLCBlZy4gYXVkaW8vbXAzXHJcbiAgICAgICAgc3VwcG9ydFtsb29rdXBdID0gc3VwcG9ydFtpdGVtXTtcclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGZsYXNoXHJcbiAgICAgICAgaWYgKGl0ZW0ubWF0Y2goZmxhc2hNSU1FKSkge1xyXG5cclxuICAgICAgICAgIHNtMi5mbGFzaFtpdGVtXSA9IHRydWU7XHJcbiAgICAgICAgICBzbTIuZmxhc2hbbG9va3VwXSA9IHRydWU7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgc20yLmZsYXNoW2l0ZW1dID0gZmFsc2U7XHJcbiAgICAgICAgICBzbTIuZmxhc2hbbG9va3VwXSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiByZXN1bHQgdG8gcmVsYXRlZCBmb3JtYXRzLCB0b29cclxuXHJcbiAgICAgICAgaWYgKGFGW2l0ZW1dICYmIGFGW2l0ZW1dLnJlbGF0ZWQpIHtcclxuXHJcbiAgICAgICAgICBmb3IgKGkgPSBhRltpdGVtXS5yZWxhdGVkLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBlZy4gYXVkaW8vbTRhXHJcbiAgICAgICAgICAgIHN1cHBvcnRbJ2F1ZGlvLycgKyBhRltpdGVtXS5yZWxhdGVkW2ldXSA9IHN1cHBvcnRbaXRlbV07XHJcbiAgICAgICAgICAgIHNtMi5odG1sNVthRltpdGVtXS5yZWxhdGVkW2ldXSA9IHN1cHBvcnRbaXRlbV07XHJcbiAgICAgICAgICAgIHNtMi5mbGFzaFthRltpdGVtXS5yZWxhdGVkW2ldXSA9IHN1cHBvcnRbaXRlbV07XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHN1cHBvcnQuY2FuUGxheVR5cGUgPSAoYSA/IGNwIDogbnVsbCk7XHJcbiAgICBzbTIuaHRtbDUgPSBtaXhpbihzbTIuaHRtbDUsIHN1cHBvcnQpO1xyXG5cclxuICAgIHNtMi5odG1sNS51c2luZ0ZsYXNoID0gZmVhdHVyZUNoZWNrKCk7XHJcbiAgICBuZWVkc0ZsYXNoID0gc20yLmh0bWw1LnVzaW5nRmxhc2g7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIHN0cmluZ3MgPSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBub3RSZWFkeTogJ1VuYXZhaWxhYmxlIC0gd2FpdCB1bnRpbCBvbnJlYWR5KCkgaGFzIGZpcmVkLicsXHJcbiAgICBub3RPSzogJ0F1ZGlvIHN1cHBvcnQgaXMgbm90IGF2YWlsYWJsZS4nLFxyXG4gICAgZG9tRXJyb3I6IHNtICsgJ2V4Y2VwdGlvbiBjYXVnaHQgd2hpbGUgYXBwZW5kaW5nIFNXRiB0byBET00uJyxcclxuICAgIHNwY1dtb2RlOiAnUmVtb3Zpbmcgd21vZGUsIHByZXZlbnRpbmcga25vd24gU1dGIGxvYWRpbmcgaXNzdWUocyknLFxyXG4gICAgc3dmNDA0OiBzbWMgKyAnVmVyaWZ5IHRoYXQgJXMgaXMgYSB2YWxpZCBwYXRoLicsXHJcbiAgICB0cnlEZWJ1ZzogJ1RyeSAnICsgc20gKyAnLmRlYnVnRmxhc2ggPSB0cnVlIGZvciBtb3JlIHNlY3VyaXR5IGRldGFpbHMgKG91dHB1dCBnb2VzIHRvIFNXRi4pJyxcclxuICAgIGNoZWNrU1dGOiAnU2VlIFNXRiBvdXRwdXQgZm9yIG1vcmUgZGVidWcgaW5mby4nLFxyXG4gICAgbG9jYWxGYWlsOiBzbWMgKyAnTm9uLUhUVFAgcGFnZSAoJyArIGRvYy5sb2NhdGlvbi5wcm90b2NvbCArICcgVVJMPykgUmV2aWV3IEZsYXNoIHBsYXllciBzZWN1cml0eSBzZXR0aW5ncyBmb3IgdGhpcyBzcGVjaWFsIGNhc2U6XFxuaHR0cDovL3d3dy5tYWNyb21lZGlhLmNvbS9zdXBwb3J0L2RvY3VtZW50YXRpb24vZW4vZmxhc2hwbGF5ZXIvaGVscC9zZXR0aW5nc19tYW5hZ2VyMDQuaHRtbFxcbk1heSBuZWVkIHRvIGFkZC9hbGxvdyBwYXRoLCBlZy4gYzovc20yLyBvciAvdXNlcnMvbWUvc20yLycsXHJcbiAgICB3YWl0Rm9jdXM6IHNtYyArICdTcGVjaWFsIGNhc2U6IFdhaXRpbmcgZm9yIFNXRiB0byBsb2FkIHdpdGggd2luZG93IGZvY3VzLi4uJyxcclxuICAgIHdhaXRGb3JldmVyOiBzbWMgKyAnV2FpdGluZyBpbmRlZmluaXRlbHkgZm9yIEZsYXNoICh3aWxsIHJlY292ZXIgaWYgdW5ibG9ja2VkKS4uLicsXHJcbiAgICB3YWl0U1dGOiBzbWMgKyAnV2FpdGluZyBmb3IgMTAwJSBTV0YgbG9hZC4uLicsXHJcbiAgICBuZWVkRnVuY3Rpb246IHNtYyArICdGdW5jdGlvbiBvYmplY3QgZXhwZWN0ZWQgZm9yICVzJyxcclxuICAgIGJhZElEOiAnU291bmQgSUQgXCIlc1wiIHNob3VsZCBiZSBhIHN0cmluZywgc3RhcnRpbmcgd2l0aCBhIG5vbi1udW1lcmljIGNoYXJhY3RlcicsXHJcbiAgICBjdXJyZW50T2JqOiBzbWMgKyAnX2RlYnVnKCk6IEN1cnJlbnQgc291bmQgb2JqZWN0cycsXHJcbiAgICB3YWl0T25sb2FkOiBzbWMgKyAnV2FpdGluZyBmb3Igd2luZG93Lm9ubG9hZCgpJyxcclxuICAgIGRvY0xvYWRlZDogc21jICsgJ0RvY3VtZW50IGFscmVhZHkgbG9hZGVkJyxcclxuICAgIG9ubG9hZDogc21jICsgJ2luaXRDb21wbGV0ZSgpOiBjYWxsaW5nIHNvdW5kTWFuYWdlci5vbmxvYWQoKScsXHJcbiAgICBvbmxvYWRPSzogc20gKyAnLm9ubG9hZCgpIGNvbXBsZXRlJyxcclxuICAgIGRpZEluaXQ6IHNtYyArICdpbml0KCk6IEFscmVhZHkgY2FsbGVkPycsXHJcbiAgICBzZWNOb3RlOiAnRmxhc2ggc2VjdXJpdHkgbm90ZTogTmV0d29yay9pbnRlcm5ldCBVUkxzIHdpbGwgbm90IGxvYWQgZHVlIHRvIHNlY3VyaXR5IHJlc3RyaWN0aW9ucy4gQWNjZXNzIGNhbiBiZSBjb25maWd1cmVkIHZpYSBGbGFzaCBQbGF5ZXIgR2xvYmFsIFNlY3VyaXR5IFNldHRpbmdzIFBhZ2U6IGh0dHA6Ly93d3cubWFjcm9tZWRpYS5jb20vc3VwcG9ydC9kb2N1bWVudGF0aW9uL2VuL2ZsYXNocGxheWVyL2hlbHAvc2V0dGluZ3NfbWFuYWdlcjA0Lmh0bWwnLFxyXG4gICAgYmFkUmVtb3ZlOiBzbWMgKyAnRmFpbGVkIHRvIHJlbW92ZSBGbGFzaCBub2RlLicsXHJcbiAgICBzaHV0ZG93bjogc20gKyAnLmRpc2FibGUoKTogU2h1dHRpbmcgZG93bicsXHJcbiAgICBxdWV1ZTogc21jICsgJ1F1ZXVlaW5nICVzIGhhbmRsZXInLFxyXG4gICAgc21FcnJvcjogJ1NNU291bmQubG9hZCgpOiBFeGNlcHRpb246IEpTLUZsYXNoIGNvbW11bmljYXRpb24gZmFpbGVkLCBvciBKUyBlcnJvci4nLFxyXG4gICAgZmJUaW1lb3V0OiAnTm8gZmxhc2ggcmVzcG9uc2UsIGFwcGx5aW5nIC4nICsgc3dmQ1NTLnN3ZlRpbWVkb3V0ICsgJyBDU1MuLi4nLFxyXG4gICAgZmJMb2FkZWQ6ICdGbGFzaCBsb2FkZWQnLFxyXG4gICAgZmJIYW5kbGVyOiBzbWMgKyAnZmxhc2hCbG9ja0hhbmRsZXIoKScsXHJcbiAgICBtYW5VUkw6ICdTTVNvdW5kLmxvYWQoKTogVXNpbmcgbWFudWFsbHktYXNzaWduZWQgVVJMJyxcclxuICAgIG9uVVJMOiBzbSArICcubG9hZCgpOiBjdXJyZW50IFVSTCBhbHJlYWR5IGFzc2lnbmVkLicsXHJcbiAgICBiYWRGVjogc20gKyAnLmZsYXNoVmVyc2lvbiBtdXN0IGJlIDggb3IgOS4gXCIlc1wiIGlzIGludmFsaWQuIFJldmVydGluZyB0byAlcy4nLFxyXG4gICAgYXMybG9vcDogJ05vdGU6IFNldHRpbmcgc3RyZWFtOmZhbHNlIHNvIGxvb3BpbmcgY2FuIHdvcmsgKGZsYXNoIDggbGltaXRhdGlvbiknLFxyXG4gICAgbm9OU0xvb3A6ICdOb3RlOiBMb29waW5nIG5vdCBpbXBsZW1lbnRlZCBmb3IgTW92aWVTdGFyIGZvcm1hdHMnLFxyXG4gICAgbmVlZGZsOTogJ05vdGU6IFN3aXRjaGluZyB0byBmbGFzaCA5LCByZXF1aXJlZCBmb3IgTVA0IGZvcm1hdHMuJyxcclxuICAgIG1mVGltZW91dDogJ1NldHRpbmcgZmxhc2hMb2FkVGltZW91dCA9IDAgKGluZmluaXRlKSBmb3Igb2ZmLXNjcmVlbiwgbW9iaWxlIGZsYXNoIGNhc2UnLFxyXG4gICAgbmVlZEZsYXNoOiBzbWMgKyAnRmF0YWwgZXJyb3I6IEZsYXNoIGlzIG5lZWRlZCB0byBwbGF5IHNvbWUgcmVxdWlyZWQgZm9ybWF0cywgYnV0IGlzIG5vdCBhdmFpbGFibGUuJyxcclxuICAgIGdvdEZvY3VzOiBzbWMgKyAnR290IHdpbmRvdyBmb2N1cy4nLFxyXG4gICAgcG9saWN5OiAnRW5hYmxpbmcgdXNlUG9saWN5RmlsZSBmb3IgZGF0YSBhY2Nlc3MnLFxyXG4gICAgc2V0dXA6IHNtICsgJy5zZXR1cCgpOiBhbGxvd2VkIHBhcmFtZXRlcnM6ICVzJyxcclxuICAgIHNldHVwRXJyb3I6IHNtICsgJy5zZXR1cCgpOiBcIiVzXCIgY2Fubm90IGJlIGFzc2lnbmVkIHdpdGggdGhpcyBtZXRob2QuJyxcclxuICAgIHNldHVwVW5kZWY6IHNtICsgJy5zZXR1cCgpOiBDb3VsZCBub3QgZmluZCBvcHRpb24gXCIlc1wiJyxcclxuICAgIHNldHVwTGF0ZTogc20gKyAnLnNldHVwKCk6IHVybCwgZmxhc2hWZXJzaW9uIGFuZCBodG1sNVRlc3QgcHJvcGVydHkgY2hhbmdlcyB3aWxsIG5vdCB0YWtlIGVmZmVjdCB1bnRpbCByZWJvb3QoKS4nLFxyXG4gICAgbm9VUkw6IHNtYyArICdGbGFzaCBVUkwgcmVxdWlyZWQuIENhbGwgc291bmRNYW5hZ2VyLnNldHVwKHt1cmw6Li4ufSkgdG8gZ2V0IHN0YXJ0ZWQuJyxcclxuICAgIHNtMkxvYWRlZDogJ1NvdW5kTWFuYWdlciAyOiBSZWFkeS4gJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoMTAwMDMpLFxyXG4gICAgcmVzZXQ6IHNtICsgJy5yZXNldCgpOiBSZW1vdmluZyBldmVudCBjYWxsYmFja3MnLFxyXG4gICAgbW9iaWxlVUE6ICdNb2JpbGUgVUEgZGV0ZWN0ZWQsIHByZWZlcnJpbmcgSFRNTDUgYnkgZGVmYXVsdC4nLFxyXG4gICAgZ2xvYmFsSFRNTDU6ICdVc2luZyBzaW5nbGV0b24gSFRNTDUgQXVkaW8oKSBwYXR0ZXJuIGZvciB0aGlzIGRldmljZS4nLFxyXG4gICAgaWdub3JlTW9iaWxlOiAnSWdub3JpbmcgbW9iaWxlIHJlc3RyaWN0aW9ucyBmb3IgdGhpcyBkZXZpY2UuJ1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBzdHIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBpbnRlcm5hbCBzdHJpbmcgcmVwbGFjZSBoZWxwZXIuXHJcbiAgICAvLyBhcmd1bWVudHM6IG8gWyxpdGVtcyB0byByZXBsYWNlXVxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgdmFyIGFyZ3MsXHJcbiAgICAgICAgaSwgaiwgbyxcclxuICAgICAgICBzc3RyO1xyXG5cclxuICAgIC8vIHJlYWwgYXJyYXksIHBsZWFzZVxyXG4gICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuXHJcbiAgICAvLyBmaXJzdCBhcmd1bWVudFxyXG4gICAgbyA9IGFyZ3Muc2hpZnQoKTtcclxuXHJcbiAgICBzc3RyID0gKHN0cmluZ3MgJiYgc3RyaW5nc1tvXSA/IHN0cmluZ3Nbb10gOiAnJyk7XHJcblxyXG4gICAgaWYgKHNzdHIgJiYgYXJncyAmJiBhcmdzLmxlbmd0aCkge1xyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gYXJncy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICBzc3RyID0gc3N0ci5yZXBsYWNlKCclcycsIGFyZ3NbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNzdHI7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIGxvb3BGaXggPSBmdW5jdGlvbihzT3B0KSB7XHJcblxyXG4gICAgLy8gZmxhc2ggOCByZXF1aXJlcyBzdHJlYW0gPSBmYWxzZSBmb3IgbG9vcGluZyB0byB3b3JrXHJcbiAgICBpZiAoZlYgPT09IDggJiYgc09wdC5sb29wcyA+IDEgJiYgc09wdC5zdHJlYW0pIHtcclxuICAgICAgX3dEUygnYXMybG9vcCcpO1xyXG4gICAgICBzT3B0LnN0cmVhbSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzT3B0O1xyXG5cclxuICB9O1xyXG5cclxuICBwb2xpY3lGaXggPSBmdW5jdGlvbihzT3B0LCBzUHJlKSB7XHJcblxyXG4gICAgaWYgKHNPcHQgJiYgIXNPcHQudXNlUG9saWN5RmlsZSAmJiAoc09wdC5vbmlkMyB8fCBzT3B0LnVzZVBlYWtEYXRhIHx8IHNPcHQudXNlV2F2ZWZvcm1EYXRhIHx8IHNPcHQudXNlRVFEYXRhKSkge1xyXG4gICAgICBzbTIuX3dEKChzUHJlIHx8ICcnKSArIHN0cigncG9saWN5JykpO1xyXG4gICAgICBzT3B0LnVzZVBvbGljeUZpbGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzT3B0O1xyXG5cclxuICB9O1xyXG5cclxuICBjb21wbGFpbiA9IGZ1bmN0aW9uKHNNc2cpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmIChoYXNDb25zb2xlICYmIGNvbnNvbGUud2FybiAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBjb25zb2xlLndhcm4oc01zZyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzbTIuX3dEKHNNc2cpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBkb05vdGhpbmcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gIH07XHJcblxyXG4gIGRpc2FibGVPYmplY3QgPSBmdW5jdGlvbihvKSB7XHJcblxyXG4gICAgdmFyIG9Qcm9wO1xyXG5cclxuICAgIGZvciAob1Byb3AgaW4gbykge1xyXG4gICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShvUHJvcCkgJiYgdHlwZW9mIG9bb1Byb3BdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgb1tvUHJvcF0gPSBkb05vdGhpbmc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvUHJvcCA9IG51bGw7XHJcblxyXG4gIH07XHJcblxyXG4gIGZhaWxTYWZlbHkgPSBmdW5jdGlvbihiTm9EaXNhYmxlKSB7XHJcblxyXG4gICAgLy8gZ2VuZXJhbCBmYWlsdXJlIGV4Y2VwdGlvbiBoYW5kbGVyXHJcblxyXG4gICAgaWYgKGJOb0Rpc2FibGUgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgYk5vRGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkaXNhYmxlZCB8fCBiTm9EaXNhYmxlKSB7XHJcbiAgICAgIHNtMi5kaXNhYmxlKGJOb0Rpc2FibGUpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBub3JtYWxpemVNb3ZpZVVSTCA9IGZ1bmN0aW9uKHNtVVJMKSB7XHJcblxyXG4gICAgdmFyIHVybFBhcmFtcyA9IG51bGwsIHVybDtcclxuXHJcbiAgICBpZiAoc21VUkwpIHtcclxuICAgICAgXHJcbiAgICAgIGlmIChzbVVSTC5tYXRjaCgvXFwuc3dmKFxcPy4qKT8kL2kpKSB7XHJcbiAgICAgIFxyXG4gICAgICAgIHVybFBhcmFtcyA9IHNtVVJMLnN1YnN0cihzbVVSTC50b0xvd2VyQ2FzZSgpLmxhc3RJbmRleE9mKCcuc3dmPycpICsgNCk7XHJcbiAgICAgIFxyXG4gICAgICAgIGlmICh1cmxQYXJhbXMpIHtcclxuICAgICAgICAgIC8vIGFzc3VtZSB1c2VyIGtub3dzIHdoYXQgdGhleSdyZSBkb2luZ1xyXG4gICAgICAgICAgcmV0dXJuIHNtVVJMO1xyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIH0gZWxzZSBpZiAoc21VUkwubGFzdEluZGV4T2YoJy8nKSAhPT0gc21VUkwubGVuZ3RoIC0gMSkge1xyXG4gICAgICBcclxuICAgICAgICAvLyBhcHBlbmQgdHJhaWxpbmcgc2xhc2gsIGlmIG5lZWRlZFxyXG4gICAgICAgIHNtVVJMICs9ICcvJztcclxuICAgICAgXHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHVybCA9IChzbVVSTCAmJiBzbVVSTC5sYXN0SW5kZXhPZignLycpICE9PSAtIDEgPyBzbVVSTC5zdWJzdHIoMCwgc21VUkwubGFzdEluZGV4T2YoJy8nKSArIDEpIDogJy4vJykgKyBzbTIubW92aWVVUkw7XHJcblxyXG4gICAgaWYgKHNtMi5ub1NXRkNhY2hlKSB7XHJcbiAgICAgIHVybCArPSAoJz90cz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB1cmw7XHJcblxyXG4gIH07XHJcblxyXG4gIHNldFZlcnNpb25JbmZvID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gc2hvcnQtaGFuZCBmb3IgaW50ZXJuYWwgdXNlXHJcblxyXG4gICAgZlYgPSBwYXJzZUludChzbTIuZmxhc2hWZXJzaW9uLCAxMCk7XHJcblxyXG4gICAgaWYgKGZWICE9PSA4ICYmIGZWICE9PSA5KSB7XHJcbiAgICAgIHNtMi5fd0Qoc3RyKCdiYWRGVicsIGZWLCBkZWZhdWx0Rmxhc2hWZXJzaW9uKSk7XHJcbiAgICAgIHNtMi5mbGFzaFZlcnNpb24gPSBmViA9IGRlZmF1bHRGbGFzaFZlcnNpb247XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGVidWcgZmxhc2ggbW92aWUsIGlmIGFwcGxpY2FibGVcclxuXHJcbiAgICB2YXIgaXNEZWJ1ZyA9IChzbTIuZGVidWdNb2RlIHx8IHNtMi5kZWJ1Z0ZsYXNoID8gJ19kZWJ1Zy5zd2YnIDogJy5zd2YnKTtcclxuXHJcbiAgICBpZiAoc20yLnVzZUhUTUw1QXVkaW8gJiYgIXNtMi5odG1sNU9ubHkgJiYgc20yLmF1ZGlvRm9ybWF0cy5tcDQucmVxdWlyZWQgJiYgZlYgPCA5KSB7XHJcbiAgICAgIHNtMi5fd0Qoc3RyKCduZWVkZmw5JykpO1xyXG4gICAgICBzbTIuZmxhc2hWZXJzaW9uID0gZlYgPSA5O1xyXG4gICAgfVxyXG5cclxuICAgIHNtMi52ZXJzaW9uID0gc20yLnZlcnNpb25OdW1iZXIgKyAoc20yLmh0bWw1T25seSA/ICcgKEhUTUw1LW9ubHkgbW9kZSknIDogKGZWID09PSA5ID8gJyAoQVMzL0ZsYXNoIDkpJyA6ICcgKEFTMi9GbGFzaCA4KScpKTtcclxuXHJcbiAgICAvLyBzZXQgdXAgZGVmYXVsdCBvcHRpb25zXHJcbiAgICBpZiAoZlYgPiA4KSB7XHJcbiAgICBcclxuICAgICAgLy8gK2ZsYXNoIDkgYmFzZSBvcHRpb25zXHJcbiAgICAgIHNtMi5kZWZhdWx0T3B0aW9ucyA9IG1peGluKHNtMi5kZWZhdWx0T3B0aW9ucywgc20yLmZsYXNoOU9wdGlvbnMpO1xyXG4gICAgICBzbTIuZmVhdHVyZXMuYnVmZmVyaW5nID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgICAvLyArbW92aWVzdGFyIHN1cHBvcnRcclxuICAgICAgc20yLmRlZmF1bHRPcHRpb25zID0gbWl4aW4oc20yLmRlZmF1bHRPcHRpb25zLCBzbTIubW92aWVTdGFyT3B0aW9ucyk7XHJcbiAgICAgIHNtMi5maWxlUGF0dGVybnMuZmxhc2g5ID0gbmV3IFJlZ0V4cCgnXFxcXC4obXAzfCcgKyBuZXRTdHJlYW1UeXBlcy5qb2luKCd8JykgKyAnKShcXFxcPy4qKT8kJywgJ2knKTtcclxuICAgICAgc20yLmZlYXR1cmVzLm1vdmllU3RhciA9IHRydWU7XHJcbiAgICBcclxuICAgIH0gZWxzZSB7XHJcbiAgICBcclxuICAgICAgc20yLmZlYXR1cmVzLm1vdmllU3RhciA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVnRXhwIGZvciBmbGFzaCBjYW5QbGF5KCksIGV0Yy5cclxuICAgIHNtMi5maWxlUGF0dGVybiA9IHNtMi5maWxlUGF0dGVybnNbKGZWICE9PSA4ID8gJ2ZsYXNoOScgOiAnZmxhc2g4JyldO1xyXG5cclxuICAgIC8vIGlmIGFwcGxpY2FibGUsIHVzZSBfZGVidWcgdmVyc2lvbnMgb2YgU1dGc1xyXG4gICAgc20yLm1vdmllVVJMID0gKGZWID09PSA4ID8gJ3NvdW5kbWFuYWdlcjIuc3dmJyA6ICdzb3VuZG1hbmFnZXIyX2ZsYXNoOS5zd2YnKS5yZXBsYWNlKCcuc3dmJywgaXNEZWJ1Zyk7XHJcblxyXG4gICAgc20yLmZlYXR1cmVzLnBlYWtEYXRhID0gc20yLmZlYXR1cmVzLndhdmVmb3JtRGF0YSA9IHNtMi5mZWF0dXJlcy5lcURhdGEgPSAoZlYgPiA4KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgc2V0UG9sbGluZyA9IGZ1bmN0aW9uKGJQb2xsaW5nLCBiSGlnaFBlcmZvcm1hbmNlKSB7XHJcblxyXG4gICAgaWYgKCFmbGFzaCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZmxhc2guX3NldFBvbGxpbmcoYlBvbGxpbmcsIGJIaWdoUGVyZm9ybWFuY2UpO1xyXG5cclxuICB9O1xyXG5cclxuICBpbml0RGVidWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBzdGFydHMgZGVidWcgbW9kZSwgY3JlYXRpbmcgb3V0cHV0IDxkaXY+IGZvciBVQXMgd2l0aG91dCBjb25zb2xlIG9iamVjdFxyXG5cclxuICAgIC8vIGFsbG93IGZvcmNlIG9mIGRlYnVnIG1vZGUgdmlhIFVSTFxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoc20yLmRlYnVnVVJMUGFyYW0udGVzdCh3bCkpIHtcclxuICAgICAgc20yLnNldHVwT3B0aW9ucy5kZWJ1Z01vZGUgPSBzbTIuZGVidWdNb2RlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaWQoc20yLmRlYnVnSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgb0QsIG9EZWJ1Zywgb1RhcmdldCwgb1RvZ2dsZSwgdG1wO1xyXG5cclxuICAgIGlmIChzbTIuZGVidWdNb2RlICYmICFpZChzbTIuZGVidWdJRCkgJiYgKCFoYXNDb25zb2xlIHx8ICFzbTIudXNlQ29uc29sZSB8fCAhc20yLmNvbnNvbGVPbmx5KSkge1xyXG5cclxuICAgICAgb0QgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIG9ELmlkID0gc20yLmRlYnVnSUQgKyAnLXRvZ2dsZSc7XHJcblxyXG4gICAgICBvVG9nZ2xlID0ge1xyXG4gICAgICAgICdwb3NpdGlvbic6ICdmaXhlZCcsXHJcbiAgICAgICAgJ2JvdHRvbSc6ICcwcHgnLFxyXG4gICAgICAgICdyaWdodCc6ICcwcHgnLFxyXG4gICAgICAgICd3aWR0aCc6ICcxLjJlbScsXHJcbiAgICAgICAgJ2hlaWdodCc6ICcxLjJlbScsXHJcbiAgICAgICAgJ2xpbmVIZWlnaHQnOiAnMS4yZW0nLFxyXG4gICAgICAgICdtYXJnaW4nOiAnMnB4JyxcclxuICAgICAgICAndGV4dEFsaWduJzogJ2NlbnRlcicsXHJcbiAgICAgICAgJ2JvcmRlcic6ICcxcHggc29saWQgIzk5OScsXHJcbiAgICAgICAgJ2N1cnNvcic6ICdwb2ludGVyJyxcclxuICAgICAgICAnYmFja2dyb3VuZCc6ICcjZmZmJyxcclxuICAgICAgICAnY29sb3InOiAnIzMzMycsXHJcbiAgICAgICAgJ3pJbmRleCc6IDEwMDAxXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBvRC5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoJy0nKSk7XHJcbiAgICAgIG9ELm9uY2xpY2sgPSB0b2dnbGVEZWJ1ZztcclxuICAgICAgb0QudGl0bGUgPSAnVG9nZ2xlIFNNMiBkZWJ1ZyBjb25zb2xlJztcclxuXHJcbiAgICAgIGlmICh1YS5tYXRjaCgvbXNpZSA2L2kpKSB7XHJcbiAgICAgICAgb0Quc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgIG9ELnN0eWxlLmN1cnNvciA9ICdoYW5kJztcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yICh0bXAgaW4gb1RvZ2dsZSkge1xyXG4gICAgICAgIGlmIChvVG9nZ2xlLmhhc093blByb3BlcnR5KHRtcCkpIHtcclxuICAgICAgICAgIG9ELnN0eWxlW3RtcF0gPSBvVG9nZ2xlW3RtcF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBvRGVidWcgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIG9EZWJ1Zy5pZCA9IHNtMi5kZWJ1Z0lEO1xyXG4gICAgICBvRGVidWcuc3R5bGUuZGlzcGxheSA9IChzbTIuZGVidWdNb2RlID8gJ2Jsb2NrJyA6ICdub25lJyk7XHJcblxyXG4gICAgICBpZiAoc20yLmRlYnVnTW9kZSAmJiAhaWQob0QuaWQpKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIG9UYXJnZXQgPSBnZXREb2N1bWVudCgpO1xyXG4gICAgICAgICAgb1RhcmdldC5hcHBlbmRDaGlsZChvRCk7XHJcbiAgICAgICAgfSBjYXRjaChlMikge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0cignZG9tRXJyb3InKSArICcgXFxuJyArIGUyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvVGFyZ2V0LmFwcGVuZENoaWxkKG9EZWJ1Zyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgb1RhcmdldCA9IG51bGw7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIGlkQ2hlY2sgPSB0aGlzLmdldFNvdW5kQnlJZDtcclxuXHJcbiAgLy8gPGQ+XHJcbiAgX3dEUyA9IGZ1bmN0aW9uKG8sIGVycm9yTGV2ZWwpIHtcclxuXHJcbiAgICByZXR1cm4gKCFvID8gJycgOiBzbTIuX3dEKHN0cihvKSwgZXJyb3JMZXZlbCkpO1xyXG5cclxuICB9O1xyXG5cclxuICB0b2dnbGVEZWJ1ZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBvID0gaWQoc20yLmRlYnVnSUQpLFxyXG4gICAgb1QgPSBpZChzbTIuZGVidWdJRCArICctdG9nZ2xlJyk7XHJcblxyXG4gICAgaWYgKCFvKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGVidWdPcGVuKSB7XHJcbiAgICAgIC8vIG1pbmltaXplXHJcbiAgICAgIG9ULmlubmVySFRNTCA9ICcrJztcclxuICAgICAgby5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb1QuaW5uZXJIVE1MID0gJy0nO1xyXG4gICAgICBvLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG5cclxuICAgIGRlYnVnT3BlbiA9ICFkZWJ1Z09wZW47XHJcblxyXG4gIH07XHJcblxyXG4gIGRlYnVnVFMgPSBmdW5jdGlvbihzRXZlbnRUeXBlLCBiU3VjY2Vzcywgc01lc3NhZ2UpIHtcclxuXHJcbiAgICAvLyB0cm91Ymxlc2hvb3RlciBkZWJ1ZyBob29rc1xyXG5cclxuICAgIGlmICh3aW5kb3cuc20yRGVidWdnZXIgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzbTJEZWJ1Z2dlci5oYW5kbGVFdmVudChzRXZlbnRUeXBlLCBiU3VjY2Vzcywgc01lc3NhZ2UpO1xyXG4gICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAvLyBvaCB3ZWxsXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcbiAgLy8gPC9kPlxyXG5cclxuICBnZXRTV0ZDU1MgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgY3NzID0gW107XHJcblxyXG4gICAgaWYgKHNtMi5kZWJ1Z01vZGUpIHtcclxuICAgICAgY3NzLnB1c2goc3dmQ1NTLnNtMkRlYnVnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgY3NzLnB1c2goc3dmQ1NTLmZsYXNoRGVidWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIudXNlSGlnaFBlcmZvcm1hbmNlKSB7XHJcbiAgICAgIGNzcy5wdXNoKHN3ZkNTUy5oaWdoUGVyZik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNzcy5qb2luKCcgJyk7XHJcblxyXG4gIH07XHJcblxyXG4gIGZsYXNoQmxvY2tIYW5kbGVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gKnBvc3NpYmxlKiBmbGFzaCBibG9jayBzaXR1YXRpb24uXHJcblxyXG4gICAgdmFyIG5hbWUgPSBzdHIoJ2ZiSGFuZGxlcicpLFxyXG4gICAgICAgIHAgPSBzbTIuZ2V0TW92aWVQZXJjZW50KCksXHJcbiAgICAgICAgY3NzID0gc3dmQ1NTLFxyXG4gICAgICAgIGVycm9yID0ge1xyXG4gICAgICAgICAgdHlwZTonRkxBU0hCTE9DSydcclxuICAgICAgICB9O1xyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgIC8vIG5vIGZsYXNoLCBvciB1bnVzZWRcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc20yLm9rKCkpIHtcclxuXHJcbiAgICAgIGlmIChuZWVkc0ZsYXNoKSB7XHJcbiAgICAgICAgLy8gbWFrZSB0aGUgbW92aWUgbW9yZSB2aXNpYmxlLCBzbyB1c2VyIGNhbiBmaXhcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IGdldFNXRkNTUygpICsgJyAnICsgY3NzLnN3ZkRlZmF1bHQgKyAnICcgKyAocCA9PT0gbnVsbCA/IGNzcy5zd2ZUaW1lZG91dCA6IGNzcy5zd2ZFcnJvcik7XHJcbiAgICAgICAgc20yLl93RChuYW1lICsgJzogJyArIHN0cignZmJUaW1lb3V0JykgKyAocCA/ICcgKCcgKyBzdHIoJ2ZiTG9hZGVkJykgKyAnKScgOiAnJykpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuZGlkRmxhc2hCbG9jayA9IHRydWU7XHJcblxyXG4gICAgICAvLyBmaXJlIG9ucmVhZHkoKSwgY29tcGxhaW4gbGlnaHRseVxyXG4gICAgICBwcm9jZXNzT25FdmVudHMoe1xyXG4gICAgICAgIHR5cGU6ICdvbnRpbWVvdXQnLFxyXG4gICAgICAgIGlnbm9yZUluaXQ6IHRydWUsXHJcbiAgICAgICAgZXJyb3I6IGVycm9yXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY2F0Y2hFcnJvcihlcnJvcik7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFNNMiBsb2FkZWQgT0sgKG9yIHJlY292ZXJlZClcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoc20yLmRpZEZsYXNoQmxvY2spIHtcclxuICAgICAgICBzbTIuX3dEKG5hbWUgKyAnOiBVbmJsb2NrZWQnKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBpZiAoc20yLm9NQykge1xyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gW2dldFNXRkNTUygpLCBjc3Muc3dmRGVmYXVsdCwgY3NzLnN3ZkxvYWRlZCArIChzbTIuZGlkRmxhc2hCbG9jayA/ICcgJyArIGNzcy5zd2ZVbmJsb2NrZWQgOiAnJyldLmpvaW4oJyAnKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgYWRkT25FdmVudCA9IGZ1bmN0aW9uKHNUeXBlLCBvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICBpZiAob25fcXVldWVbc1R5cGVdID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIG9uX3F1ZXVlW3NUeXBlXSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIG9uX3F1ZXVlW3NUeXBlXS5wdXNoKHtcclxuICAgICAgJ21ldGhvZCc6IG9NZXRob2QsXHJcbiAgICAgICdzY29wZSc6IChvU2NvcGUgfHwgbnVsbCksXHJcbiAgICAgICdmaXJlZCc6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgcHJvY2Vzc09uRXZlbnRzID0gZnVuY3Rpb24ob09wdGlvbnMpIHtcclxuXHJcbiAgICAvLyBpZiB1bnNwZWNpZmllZCwgYXNzdW1lIE9LL2Vycm9yXHJcblxyXG4gICAgaWYgKCFvT3B0aW9ucykge1xyXG4gICAgICBvT3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiAoc20yLm9rKCkgPyAnb25yZWFkeScgOiAnb250aW1lb3V0JylcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRpZEluaXQgJiYgb09wdGlvbnMgJiYgIW9PcHRpb25zLmlnbm9yZUluaXQpIHtcclxuICAgICAgLy8gbm90IHJlYWR5IHlldC5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvT3B0aW9ucy50eXBlID09PSAnb250aW1lb3V0JyAmJiAoc20yLm9rKCkgfHwgKGRpc2FibGVkICYmICFvT3B0aW9ucy5pZ25vcmVJbml0KSkpIHtcclxuICAgICAgLy8gaW52YWxpZCBjYXNlXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3RhdHVzID0ge1xyXG4gICAgICAgICAgc3VjY2VzczogKG9PcHRpb25zICYmIG9PcHRpb25zLmlnbm9yZUluaXQgPyBzbTIub2soKSA6ICFkaXNhYmxlZClcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvLyBxdWV1ZSBzcGVjaWZpZWQgYnkgdHlwZSwgb3Igbm9uZVxyXG4gICAgICAgIHNyY1F1ZXVlID0gKG9PcHRpb25zICYmIG9PcHRpb25zLnR5cGUgPyBvbl9xdWV1ZVtvT3B0aW9ucy50eXBlXSB8fCBbXSA6IFtdKSxcclxuXHJcbiAgICAgICAgcXVldWUgPSBbXSwgaSwgaixcclxuICAgICAgICBhcmdzID0gW3N0YXR1c10sXHJcbiAgICAgICAgY2FuUmV0cnkgPSAobmVlZHNGbGFzaCAmJiAhc20yLm9rKCkpO1xyXG5cclxuICAgIGlmIChvT3B0aW9ucy5lcnJvcikge1xyXG4gICAgICBhcmdzWzBdLmVycm9yID0gb09wdGlvbnMuZXJyb3I7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChpID0gMCwgaiA9IHNyY1F1ZXVlLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICBpZiAoc3JjUXVldWVbaV0uZmlyZWQgIT09IHRydWUpIHtcclxuICAgICAgICBxdWV1ZS5wdXNoKHNyY1F1ZXVlW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcclxuICAgIFxyXG4gICAgICAvLyBzbTIuX3dEKHNtICsgJzogRmlyaW5nICcgKyBxdWV1ZS5sZW5ndGggKyAnICcgKyBvT3B0aW9ucy50eXBlICsgJygpIGl0ZW0nICsgKHF1ZXVlLmxlbmd0aCA9PT0gMSA/ICcnIDogJ3MnKSk7IFxyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gcXVldWUubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgIFxyXG4gICAgICAgIGlmIChxdWV1ZVtpXS5zY29wZSkge1xyXG4gICAgICAgICAgcXVldWVbaV0ubWV0aG9kLmFwcGx5KHF1ZXVlW2ldLnNjb3BlLCBhcmdzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcXVldWVbaV0ubWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgICAgaWYgKCFjYW5SZXRyeSkge1xyXG4gICAgICAgICAgLy8gdXNlRmxhc2hCbG9jayBhbmQgU1dGIHRpbWVvdXQgY2FzZSBkb2Vzbid0IGNvdW50IGhlcmUuXHJcbiAgICAgICAgICBxdWV1ZVtpXS5maXJlZCA9IHRydWU7XHJcbiAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBpbml0VXNlck9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrKSB7XHJcbiAgICAgICAgZmxhc2hCbG9ja0hhbmRsZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKCk7XHJcblxyXG4gICAgICAvLyBjYWxsIHVzZXItZGVmaW5lZCBcIm9ubG9hZFwiLCBzY29wZWQgdG8gd2luZG93XHJcblxyXG4gICAgICBpZiAodHlwZW9mIHNtMi5vbmxvYWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBfd0RTKCdvbmxvYWQnLCAxKTtcclxuICAgICAgICBzbTIub25sb2FkLmFwcGx5KHdpbmRvdyk7XHJcbiAgICAgICAgX3dEUygnb25sb2FkT0snLCAxKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNtMi53YWl0Rm9yV2luZG93TG9hZCkge1xyXG4gICAgICAgIGV2ZW50LmFkZCh3aW5kb3csICdsb2FkJywgaW5pdFVzZXJPbmxvYWQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwgMSk7XHJcblxyXG4gIH07XHJcblxyXG4gIGRldGVjdEZsYXNoID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYXQgdGlwOiBGbGFzaCBEZXRlY3QgbGlicmFyeSAoQlNELCAoQykgMjAwNykgYnkgQ2FybCBcIkRvY1llc1wiIFMuIFllc3RyYXVcclxuICAgICAqIGh0dHA6Ly9mZWF0dXJlYmxlbmQuY29tL2phdmFzY3JpcHQtZmxhc2gtZGV0ZWN0aW9uLWxpYnJhcnkuaHRtbCAvIGh0dHA6Ly9mZWF0dXJlYmxlbmQuY29tL2xpY2Vuc2UudHh0XHJcbiAgICAgKi9cclxuXHJcbiAgICBpZiAoaGFzRmxhc2ggIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgLy8gdGhpcyB3b3JrIGhhcyBhbHJlYWR5IGJlZW4gZG9uZS5cclxuICAgICAgcmV0dXJuIGhhc0ZsYXNoO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBoYXNQbHVnaW4gPSBmYWxzZSwgbiA9IG5hdmlnYXRvciwgblAgPSBuLnBsdWdpbnMsIG9iaiwgdHlwZSwgdHlwZXMsIEFYID0gd2luZG93LkFjdGl2ZVhPYmplY3Q7XHJcblxyXG4gICAgaWYgKG5QICYmIG5QLmxlbmd0aCkge1xyXG4gICAgICBcclxuICAgICAgdHlwZSA9ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCc7XHJcbiAgICAgIHR5cGVzID0gbi5taW1lVHlwZXM7XHJcbiAgICAgIFxyXG4gICAgICBpZiAodHlwZXMgJiYgdHlwZXNbdHlwZV0gJiYgdHlwZXNbdHlwZV0uZW5hYmxlZFBsdWdpbiAmJiB0eXBlc1t0eXBlXS5lbmFibGVkUGx1Z2luLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgaGFzUGx1Z2luID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgXHJcbiAgICB9IGVsc2UgaWYgKEFYICE9PSBfdW5kZWZpbmVkICYmICF1YS5tYXRjaCgvTVNBcHBIb3N0L2kpKSB7XHJcbiAgICBcclxuICAgICAgLy8gV2luZG93cyA4IFN0b3JlIEFwcHMgKE1TQXBwSG9zdCkgYXJlIHdlaXJkIChjb21wYXRpYmlsaXR5PykgYW5kIHdvbid0IGNvbXBsYWluIGhlcmUsIGJ1dCB3aWxsIGJhcmYgaWYgRmxhc2gvQWN0aXZlWCBvYmplY3QgaXMgYXBwZW5kZWQgdG8gdGhlIERPTS5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBvYmogPSBuZXcgQVgoJ1Nob2Nrd2F2ZUZsYXNoLlNob2Nrd2F2ZUZsYXNoJyk7XHJcbiAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgIC8vIG9oIHdlbGxcclxuICAgICAgICBvYmogPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBoYXNQbHVnaW4gPSAoISFvYmopO1xyXG4gICAgICBcclxuICAgICAgLy8gY2xlYW51cCwgYmVjYXVzZSBpdCBpcyBBY3RpdmVYIGFmdGVyIGFsbFxyXG4gICAgICBvYmogPSBudWxsO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgaGFzRmxhc2ggPSBoYXNQbHVnaW47XHJcblxyXG4gICAgcmV0dXJuIGhhc1BsdWdpbjtcclxuXHJcbiAgfTtcclxuXHJcbmZlYXR1cmVDaGVjayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBmbGFzaE5lZWRlZCxcclxuICAgICAgICBpdGVtLFxyXG4gICAgICAgIGZvcm1hdHMgPSBzbTIuYXVkaW9Gb3JtYXRzLFxyXG4gICAgICAgIC8vIGlQaG9uZSA8PSAzLjEgaGFzIGJyb2tlbiBIVE1MNSBhdWRpbygpLCBidXQgZmlybXdhcmUgMy4yIChvcmlnaW5hbCBpUGFkKSArIGlPUzQgd29ya3MuXHJcbiAgICAgICAgaXNTcGVjaWFsID0gKGlzX2lEZXZpY2UgJiYgISEodWEubWF0Y2goL29zICgxfDJ8M18wfDNfMSlcXHMvaSkpKTtcclxuXHJcbiAgICBpZiAoaXNTcGVjaWFsKSB7XHJcblxyXG4gICAgICAvLyBoYXMgQXVkaW8oKSwgYnV0IGlzIGJyb2tlbjsgbGV0IGl0IGxvYWQgbGlua3MgZGlyZWN0bHkuXHJcbiAgICAgIHNtMi5oYXNIVE1MNSA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gaWdub3JlIGZsYXNoIGNhc2UsIGhvd2V2ZXJcclxuICAgICAgc20yLmh0bWw1T25seSA9IHRydWU7XHJcblxyXG4gICAgICAvLyBoaWRlIHRoZSBTV0YsIGlmIHByZXNlbnRcclxuICAgICAgaWYgKHNtMi5vTUMpIHtcclxuICAgICAgICBzbTIub01DLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKHNtMi51c2VIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAgIGlmICghc20yLmh0bWw1IHx8ICFzbTIuaHRtbDUuY2FuUGxheVR5cGUpIHtcclxuICAgICAgICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlcjogTm8gSFRNTDUgQXVkaW8oKSBzdXBwb3J0IGRldGVjdGVkLicpO1xyXG4gICAgICAgICAgc20yLmhhc0hUTUw1ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAoaXNCYWRTYWZhcmkpIHtcclxuICAgICAgICAgIHNtMi5fd0Qoc21jICsgJ05vdGU6IEJ1Z2d5IEhUTUw1IEF1ZGlvIGluIFNhZmFyaSBvbiB0aGlzIE9TIFggcmVsZWFzZSwgc2VlIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0zMjE1OSAtICcgKyAoIWhhc0ZsYXNoID8gJyB3b3VsZCB1c2UgZmxhc2ggZmFsbGJhY2sgZm9yIE1QMy9NUDQsIGJ1dCBub25lIGRldGVjdGVkLicgOiAnd2lsbCB1c2UgZmxhc2ggZmFsbGJhY2sgZm9yIE1QMy9NUDQsIGlmIGF2YWlsYWJsZScpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLnVzZUhUTUw1QXVkaW8gJiYgc20yLmhhc0hUTUw1KSB7XHJcblxyXG4gICAgICAvLyBzb3J0IG91dCB3aGV0aGVyIGZsYXNoIGlzIG9wdGlvbmFsLCByZXF1aXJlZCBvciBjYW4gYmUgaWdub3JlZC5cclxuXHJcbiAgICAgIC8vIGlubm9jZW50IHVudGlsIHByb3ZlbiBndWlsdHkuXHJcbiAgICAgIGNhbklnbm9yZUZsYXNoID0gdHJ1ZTtcclxuXHJcbiAgICAgIGZvciAoaXRlbSBpbiBmb3JtYXRzKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGZvcm1hdHMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICBcclxuICAgICAgICAgIGlmIChmb3JtYXRzW2l0ZW1dLnJlcXVpcmVkKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICghc20yLmh0bWw1LmNhblBsYXlUeXBlKGZvcm1hdHNbaXRlbV0udHlwZSkpIHtcclxuICAgICAgICBcclxuICAgICAgICAgICAgICAvLyAxMDAlIEhUTUw1IG1vZGUgaXMgbm90IHBvc3NpYmxlLlxyXG4gICAgICAgICAgICAgIGNhbklnbm9yZUZsYXNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgZmxhc2hOZWVkZWQgPSB0cnVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNtMi5wcmVmZXJGbGFzaCAmJiAoc20yLmZsYXNoW2l0ZW1dIHx8IHNtMi5mbGFzaFtmb3JtYXRzW2l0ZW1dLnR5cGVdKSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgIC8vIGZsYXNoIG1heSBiZSByZXF1aXJlZCwgb3IgcHJlZmVycmVkIGZvciB0aGlzIGZvcm1hdC5cclxuICAgICAgICAgICAgICBmbGFzaE5lZWRlZCA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBzYW5pdHkgY2hlY2suLi5cclxuICAgIGlmIChzbTIuaWdub3JlRmxhc2gpIHtcclxuICAgICAgZmxhc2hOZWVkZWQgPSBmYWxzZTtcclxuICAgICAgY2FuSWdub3JlRmxhc2ggPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNtMi5odG1sNU9ubHkgPSAoc20yLmhhc0hUTUw1ICYmIHNtMi51c2VIVE1MNUF1ZGlvICYmICFmbGFzaE5lZWRlZCk7XHJcblxyXG4gICAgcmV0dXJuICghc20yLmh0bWw1T25seSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHBhcnNlVVJMID0gZnVuY3Rpb24odXJsKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcm5hbDogRmluZHMgYW5kIHJldHVybnMgdGhlIGZpcnN0IHBsYXlhYmxlIFVSTCAob3IgZmFpbGluZyB0aGF0LCB0aGUgZmlyc3QgVVJMLilcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nIG9yIGFycmF5fSB1cmwgQSBzaW5nbGUgVVJMIHN0cmluZywgT1IsIGFuIGFycmF5IG9mIFVSTCBzdHJpbmdzIG9yIHt1cmw6Jy9wYXRoL3RvL3Jlc291cmNlJywgdHlwZTonYXVkaW8vbXAzJ30gb2JqZWN0cy5cclxuICAgICAqL1xyXG5cclxuICAgIHZhciBpLCBqLCB1cmxSZXN1bHQgPSAwLCByZXN1bHQ7XHJcblxyXG4gICAgaWYgKHVybCBpbnN0YW5jZW9mIEFycmF5KSB7XHJcblxyXG4gICAgICAvLyBmaW5kIHRoZSBmaXJzdCBnb29kIG9uZVxyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gdXJsLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG5cclxuICAgICAgICBpZiAodXJsW2ldIGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcblxyXG4gICAgICAgICAgLy8gTUlNRSBjaGVja1xyXG4gICAgICAgICAgaWYgKHNtMi5jYW5QbGF5TUlNRSh1cmxbaV0udHlwZSkpIHtcclxuICAgICAgICAgICAgdXJsUmVzdWx0ID0gaTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoc20yLmNhblBsYXlVUkwodXJsW2ldKSkge1xyXG5cclxuICAgICAgICAgIC8vIFVSTCBzdHJpbmcgY2hlY2tcclxuICAgICAgICAgIHVybFJlc3VsdCA9IGk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbm9ybWFsaXplIHRvIHN0cmluZ1xyXG4gICAgICBpZiAodXJsW3VybFJlc3VsdF0udXJsKSB7XHJcbiAgICAgICAgdXJsW3VybFJlc3VsdF0gPSB1cmxbdXJsUmVzdWx0XS51cmw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlc3VsdCA9IHVybFt1cmxSZXN1bHRdO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAvLyBzaW5nbGUgVVJMIGNhc2VcclxuICAgICAgcmVzdWx0ID0gdXJsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuXHJcbiAgc3RhcnRUaW1lciA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXR0YWNoIGEgdGltZXIgdG8gdGhpcyBzb3VuZCwgYW5kIHN0YXJ0IGFuIGludGVydmFsIGlmIG5lZWRlZFxyXG4gICAgICovXHJcblxyXG4gICAgaWYgKCFvU291bmQuX2hhc1RpbWVyKSB7XHJcblxyXG4gICAgICBvU291bmQuX2hhc1RpbWVyID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmICghbW9iaWxlSFRNTDUgJiYgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKSB7XHJcblxyXG4gICAgICAgIGlmIChoNUludGVydmFsVGltZXIgPT09IG51bGwgJiYgaDVUaW1lckNvdW50ID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgaDVJbnRlcnZhbFRpbWVyID0gc2V0SW50ZXJ2YWwodGltZXJFeGVjdXRlLCBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGg1VGltZXJDb3VudCsrO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgc3RvcFRpbWVyID0gZnVuY3Rpb24ob1NvdW5kKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRhY2ggYSB0aW1lclxyXG4gICAgICovXHJcblxyXG4gICAgaWYgKG9Tb3VuZC5faGFzVGltZXIpIHtcclxuXHJcbiAgICAgIG9Tb3VuZC5faGFzVGltZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgIGlmICghbW9iaWxlSFRNTDUgJiYgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKSB7XHJcblxyXG4gICAgICAgIC8vIGludGVydmFsIHdpbGwgc3RvcCBpdHNlbGYgYXQgbmV4dCBleGVjdXRpb24uXHJcblxyXG4gICAgICAgIGg1VGltZXJDb3VudC0tO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgdGltZXJFeGVjdXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtYW51YWwgcG9sbGluZyBmb3IgSFRNTDUgcHJvZ3Jlc3MgZXZlbnRzLCBpZS4sIHdoaWxlcGxheWluZygpXHJcbiAgICAgKiAoY2FuIGFjaGlldmUgZ3JlYXRlciBwcmVjaXNpb24gdGhhbiBjb25zZXJ2YXRpdmUgZGVmYXVsdCBIVE1MNSBpbnRlcnZhbClcclxuICAgICAqL1xyXG5cclxuICAgIHZhciBpO1xyXG5cclxuICAgIGlmIChoNUludGVydmFsVGltZXIgIT09IG51bGwgJiYgIWg1VGltZXJDb3VudCkge1xyXG5cclxuICAgICAgLy8gbm8gYWN0aXZlIHRpbWVycywgc3RvcCBwb2xsaW5nIGludGVydmFsLlxyXG5cclxuICAgICAgY2xlYXJJbnRlcnZhbChoNUludGVydmFsVGltZXIpO1xyXG5cclxuICAgICAgaDVJbnRlcnZhbFRpbWVyID0gbnVsbDtcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgYWxsIEhUTUw1IHNvdW5kcyB3aXRoIHRpbWVyc1xyXG5cclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cclxuICAgICAgaWYgKHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5pc0hUTUw1ICYmIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5faGFzVGltZXIpIHtcclxuICAgICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uX29uVGltZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgY2F0Y2hFcnJvciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHJcbiAgICBvcHRpb25zID0gKG9wdGlvbnMgIT09IF91bmRlZmluZWQgPyBvcHRpb25zIDoge30pO1xyXG5cclxuICAgIGlmICh0eXBlb2Ygc20yLm9uZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgc20yLm9uZXJyb3IuYXBwbHkod2luZG93LCBbe1xyXG4gICAgICAgIHR5cGU6IChvcHRpb25zLnR5cGUgIT09IF91bmRlZmluZWQgPyBvcHRpb25zLnR5cGUgOiBudWxsKVxyXG4gICAgICB9XSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wdGlvbnMuZmF0YWwgIT09IF91bmRlZmluZWQgJiYgb3B0aW9ucy5mYXRhbCkge1xyXG4gICAgICBzbTIuZGlzYWJsZSgpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBiYWRTYWZhcmlGaXggPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IFwiYmFkXCIgU2FmYXJpIChPUyBYIDEwLjMgLSAxMC43KSBtdXN0IGZhbGwgYmFjayB0byBmbGFzaCBmb3IgTVAzL01QNFxyXG4gICAgaWYgKCFpc0JhZFNhZmFyaSB8fCAhZGV0ZWN0Rmxhc2goKSkge1xyXG4gICAgICAvLyBkb2Vzbid0IGFwcGx5XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYUYgPSBzbTIuYXVkaW9Gb3JtYXRzLCBpLCBpdGVtO1xyXG5cclxuICAgIGZvciAoaXRlbSBpbiBhRikge1xyXG5cclxuICAgICAgaWYgKGFGLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcblxyXG4gICAgICAgIGlmIChpdGVtID09PSAnbXAzJyB8fCBpdGVtID09PSAnbXA0Jykge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0Qoc20gKyAnOiBVc2luZyBmbGFzaCBmYWxsYmFjayBmb3IgJyArIGl0ZW0gKyAnIGZvcm1hdCcpO1xyXG4gICAgICAgICAgc20yLmh0bWw1W2l0ZW1dID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgLy8gYXNzaWduIHJlc3VsdCB0byByZWxhdGVkIGZvcm1hdHMsIHRvb1xyXG4gICAgICAgICAgaWYgKGFGW2l0ZW1dICYmIGFGW2l0ZW1dLnJlbGF0ZWQpIHtcclxuICAgICAgICAgICAgZm9yIChpID0gYUZbaXRlbV0ucmVsYXRlZC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgIHNtMi5odG1sNVthRltpdGVtXS5yZWxhdGVkW2ldXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFBzZXVkby1wcml2YXRlIGZsYXNoL0V4dGVybmFsSW50ZXJmYWNlIG1ldGhvZHNcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIHRoaXMuX3NldFNhbmRib3hUeXBlID0gZnVuY3Rpb24oc2FuZGJveFR5cGUpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIC8vIFNlY3VyaXR5IHNhbmRib3ggYWNjb3JkaW5nIHRvIEZsYXNoIHBsdWdpblxyXG4gICAgdmFyIHNiID0gc20yLnNhbmRib3g7XHJcblxyXG4gICAgc2IudHlwZSA9IHNhbmRib3hUeXBlO1xyXG4gICAgc2IuZGVzY3JpcHRpb24gPSBzYi50eXBlc1soc2IudHlwZXNbc2FuZGJveFR5cGVdICE9PSBfdW5kZWZpbmVkP3NhbmRib3hUeXBlIDogJ3Vua25vd24nKV07XHJcblxyXG4gICAgaWYgKHNiLnR5cGUgPT09ICdsb2NhbFdpdGhGaWxlJykge1xyXG5cclxuICAgICAgc2Iubm9SZW1vdGUgPSB0cnVlO1xyXG4gICAgICBzYi5ub0xvY2FsID0gZmFsc2U7XHJcbiAgICAgIF93RFMoJ3NlY05vdGUnLCAyKTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKHNiLnR5cGUgPT09ICdsb2NhbFdpdGhOZXR3b3JrJykge1xyXG5cclxuICAgICAgc2Iubm9SZW1vdGUgPSBmYWxzZTtcclxuICAgICAgc2Iubm9Mb2NhbCA9IHRydWU7XHJcblxyXG4gICAgfSBlbHNlIGlmIChzYi50eXBlID09PSAnbG9jYWxUcnVzdGVkJykge1xyXG5cclxuICAgICAgc2Iubm9SZW1vdGUgPSBmYWxzZTtcclxuICAgICAgc2Iubm9Mb2NhbCA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fZXh0ZXJuYWxJbnRlcmZhY2VPSyA9IGZ1bmN0aW9uKHN3ZlZlcnNpb24pIHtcclxuXHJcbiAgICAvLyBmbGFzaCBjYWxsYmFjayBjb25maXJtaW5nIGZsYXNoIGxvYWRlZCwgRUkgd29ya2luZyBldGMuXHJcbiAgICAvLyBzd2ZWZXJzaW9uOiBTV0YgYnVpbGQgc3RyaW5nXHJcblxyXG4gICAgaWYgKHNtMi5zd2ZMb2FkZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBlO1xyXG5cclxuICAgIGRlYnVnVFMoJ3N3ZicsIHRydWUpO1xyXG4gICAgZGVidWdUUygnZmxhc2h0b2pzJywgdHJ1ZSk7XHJcbiAgICBzbTIuc3dmTG9hZGVkID0gdHJ1ZTtcclxuICAgIHRyeUluaXRPbkZvY3VzID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKGlzQmFkU2FmYXJpKSB7XHJcbiAgICAgIGJhZFNhZmFyaUZpeCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbXBsYWluIGlmIEpTICsgU1dGIGJ1aWxkL3ZlcnNpb24gc3RyaW5ncyBkb24ndCBtYXRjaCwgZXhjbHVkaW5nICtERVYgYnVpbGRzXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmICghc3dmVmVyc2lvbiB8fCBzd2ZWZXJzaW9uLnJlcGxhY2UoL1xcK2Rldi9pLCcnKSAhPT0gc20yLnZlcnNpb25OdW1iZXIucmVwbGFjZSgvXFwrZGV2L2ksICcnKSkge1xyXG5cclxuICAgICAgZSA9IHNtICsgJzogRmF0YWw6IEphdmFTY3JpcHQgZmlsZSBidWlsZCBcIicgKyBzbTIudmVyc2lvbk51bWJlciArICdcIiBkb2VzIG5vdCBtYXRjaCBGbGFzaCBTV0YgYnVpbGQgXCInICsgc3dmVmVyc2lvbiArICdcIiBhdCAnICsgc20yLnVybCArICcuIEVuc3VyZSBib3RoIGFyZSB1cC10by1kYXRlLic7XHJcblxyXG4gICAgICAvLyBlc2NhcGUgZmxhc2ggLT4gSlMgc3RhY2sgc28gdGhpcyBlcnJvciBmaXJlcyBpbiB3aW5kb3cuXHJcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdmVyc2lvbk1pc21hdGNoKCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcclxuICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAvLyBleGl0LCBpbml0IHdpbGwgZmFpbCB3aXRoIHRpbWVvdXRcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICAvLyBJRSBuZWVkcyBhIGxhcmdlciB0aW1lb3V0XHJcbiAgICBzZXRUaW1lb3V0KGluaXQsIGlzSUUgPyAxMDAgOiAxKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUHJpdmF0ZSBpbml0aWFsaXphdGlvbiBoZWxwZXJzXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIGNyZWF0ZU1vdmllID0gZnVuY3Rpb24oc21JRCwgc21VUkwpIHtcclxuXHJcbiAgICBpZiAoZGlkQXBwZW5kICYmIGFwcGVuZFN1Y2Nlc3MpIHtcclxuICAgICAgLy8gaWdub3JlIGlmIGFscmVhZHkgc3VjY2VlZGVkXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TXNnKCkge1xyXG5cclxuICAgICAgLy8gPGQ+XHJcblxyXG4gICAgICB2YXIgb3B0aW9ucyA9IFtdLFxyXG4gICAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgICBtc2cgPSBbXSxcclxuICAgICAgICAgIGRlbGltaXRlciA9ICcgKyAnO1xyXG5cclxuICAgICAgdGl0bGUgPSAnU291bmRNYW5hZ2VyICcgKyBzbTIudmVyc2lvbiArICghc20yLmh0bWw1T25seSAmJiBzbTIudXNlSFRNTDVBdWRpbyA/IChzbTIuaGFzSFRNTDUgPyAnICsgSFRNTDUgYXVkaW8nIDogJywgbm8gSFRNTDUgYXVkaW8gc3VwcG9ydCcpIDogJycpO1xyXG5cclxuICAgICAgaWYgKCFzbTIuaHRtbDVPbmx5KSB7XHJcblxyXG4gICAgICAgIGlmIChzbTIucHJlZmVyRmxhc2gpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgncHJlZmVyRmxhc2gnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIudXNlSGlnaFBlcmZvcm1hbmNlKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ3VzZUhpZ2hQZXJmb3JtYW5jZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi5mbGFzaFBvbGxpbmdJbnRlcnZhbCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdmbGFzaFBvbGxpbmdJbnRlcnZhbCAoJyArIHNtMi5mbGFzaFBvbGxpbmdJbnRlcnZhbCArICdtcyknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnaHRtbDVQb2xsaW5nSW50ZXJ2YWwgKCcgKyBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwgKyAnbXMpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLndtb2RlKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ3dtb2RlICgnICsgc20yLndtb2RlICsgJyknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdkZWJ1Z0ZsYXNoJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2spIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnZmxhc2hCbG9jaycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIGlmIChzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnaHRtbDVQb2xsaW5nSW50ZXJ2YWwgKCcgKyBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwgKyAnbXMpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgbXNnID0gbXNnLmNvbmNhdChbb3B0aW9ucy5qb2luKGRlbGltaXRlcildKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RCh0aXRsZSArIChtc2cubGVuZ3RoID8gZGVsaW1pdGVyICsgbXNnLmpvaW4oJywgJykgOiAnJyksIDEpO1xyXG5cclxuICAgICAgc2hvd1N1cHBvcnQoKTtcclxuXHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuXHJcbiAgICAgIC8vIDEwMCUgSFRNTDUgbW9kZVxyXG4gICAgICBzZXRWZXJzaW9uSW5mbygpO1xyXG5cclxuICAgICAgaW5pdE1zZygpO1xyXG4gICAgICBzbTIub01DID0gaWQoc20yLm1vdmllSUQpO1xyXG4gICAgICBpbml0KCk7XHJcblxyXG4gICAgICAvLyBwcmV2ZW50IG11bHRpcGxlIGluaXQgYXR0ZW1wdHNcclxuICAgICAgZGlkQXBwZW5kID0gdHJ1ZTtcclxuXHJcbiAgICAgIGFwcGVuZFN1Y2Nlc3MgPSB0cnVlO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBmbGFzaCBwYXRoXHJcbiAgICB2YXIgcmVtb3RlVVJMID0gKHNtVVJMIHx8IHNtMi51cmwpLFxyXG4gICAgbG9jYWxVUkwgPSAoc20yLmFsdFVSTCB8fCByZW1vdGVVUkwpLFxyXG4gICAgc3dmVGl0bGUgPSAnSlMvRmxhc2ggYXVkaW8gY29tcG9uZW50IChTb3VuZE1hbmFnZXIgMiknLFxyXG4gICAgb1RhcmdldCA9IGdldERvY3VtZW50KCksXHJcbiAgICBleHRyYUNsYXNzID0gZ2V0U1dGQ1NTKCksXHJcbiAgICBpc1JUTCA9IG51bGwsXHJcbiAgICBodG1sID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdodG1sJylbMF0sXHJcbiAgICBvRW1iZWQsIG9Nb3ZpZSwgdG1wLCBtb3ZpZUhUTUwsIG9FbCwgcywgeCwgc0NsYXNzO1xyXG5cclxuICAgIGlzUlRMID0gKGh0bWwgJiYgaHRtbC5kaXIgJiYgaHRtbC5kaXIubWF0Y2goL3J0bC9pKSk7XHJcbiAgICBzbUlEID0gKHNtSUQgPT09IF91bmRlZmluZWQgPyBzbTIuaWQgOiBzbUlEKTtcclxuXHJcbiAgICBmdW5jdGlvbiBwYXJhbShuYW1lLCB2YWx1ZSkge1xyXG4gICAgICByZXR1cm4gJzxwYXJhbSBuYW1lPVwiJyArIG5hbWUgKyAnXCIgdmFsdWU9XCInICsgdmFsdWUgKyAnXCIgLz4nO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNhZmV0eSBjaGVjayBmb3IgbGVnYWN5IChjaGFuZ2UgdG8gRmxhc2ggOSBVUkwpXHJcbiAgICBzZXRWZXJzaW9uSW5mbygpO1xyXG4gICAgc20yLnVybCA9IG5vcm1hbGl6ZU1vdmllVVJMKG92ZXJIVFRQID8gcmVtb3RlVVJMIDogbG9jYWxVUkwpO1xyXG4gICAgc21VUkwgPSBzbTIudXJsO1xyXG5cclxuICAgIHNtMi53bW9kZSA9ICghc20yLndtb2RlICYmIHNtMi51c2VIaWdoUGVyZm9ybWFuY2UgPyAndHJhbnNwYXJlbnQnIDogc20yLndtb2RlKTtcclxuXHJcbiAgICBpZiAoc20yLndtb2RlICE9PSBudWxsICYmICh1YS5tYXRjaCgvbXNpZSA4L2kpIHx8ICghaXNJRSAmJiAhc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSkpICYmIG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaCgvd2luMzJ8d2luNjQvaSkpIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIGV4dHJhLXNwZWNpYWwgY2FzZTogbW92aWUgZG9lc24ndCBsb2FkIHVudGlsIHNjcm9sbGVkIGludG8gdmlldyB3aGVuIHVzaW5nIHdtb2RlID0gYW55dGhpbmcgYnV0ICd3aW5kb3cnIGhlcmVcclxuICAgICAgICogZG9lcyBub3QgYXBwbHkgd2hlbiB1c2luZyBoaWdoIHBlcmZvcm1hbmNlIChwb3NpdGlvbjpmaXhlZCBtZWFucyBvbi1zY3JlZW4pLCBPUiBpbmZpbml0ZSBmbGFzaCBsb2FkIHRpbWVvdXRcclxuICAgICAgICogd21vZGUgYnJlYWtzIElFIDggb24gVmlzdGEgKyBXaW43IHRvbyBpbiBzb21lIGNhc2VzLCBhcyBvZiBKYW51YXJ5IDIwMTEgKD8pXHJcbiAgICAgICAqL1xyXG4gICAgICBtZXNzYWdlcy5wdXNoKHN0cmluZ3Muc3BjV21vZGUpO1xyXG4gICAgICBzbTIud21vZGUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIG9FbWJlZCA9IHtcclxuICAgICAgJ25hbWUnOiBzbUlELFxyXG4gICAgICAnaWQnOiBzbUlELFxyXG4gICAgICAnc3JjJzogc21VUkwsXHJcbiAgICAgICdxdWFsaXR5JzogJ2hpZ2gnLFxyXG4gICAgICAnYWxsb3dTY3JpcHRBY2Nlc3MnOiBzbTIuYWxsb3dTY3JpcHRBY2Nlc3MsXHJcbiAgICAgICdiZ2NvbG9yJzogc20yLmJnQ29sb3IsXHJcbiAgICAgICdwbHVnaW5zcGFnZSc6IGh0dHAgKyAnd3d3Lm1hY3JvbWVkaWEuY29tL2dvL2dldGZsYXNocGxheWVyJyxcclxuICAgICAgJ3RpdGxlJzogc3dmVGl0bGUsXHJcbiAgICAgICd0eXBlJzogJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJyxcclxuICAgICAgJ3dtb2RlJzogc20yLndtb2RlLFxyXG4gICAgICAvLyBodHRwOi8vaGVscC5hZG9iZS5jb20vZW5fVVMvYXMzL21vYmlsZS9XUzRiZWJjZDY2YTc0Mjc1YzM2Y2ZiODEzNzEyNDMxOGVlYmM2LTdmZmQuaHRtbFxyXG4gICAgICAnaGFzUHJpb3JpdHknOiAndHJ1ZSdcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgIG9FbWJlZC5GbGFzaFZhcnMgPSAnZGVidWc9MSc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzbTIud21vZGUpIHtcclxuICAgICAgLy8gZG9uJ3Qgd3JpdGUgZW1wdHkgYXR0cmlidXRlXHJcbiAgICAgIGRlbGV0ZSBvRW1iZWQud21vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzSUUpIHtcclxuXHJcbiAgICAgIC8vIElFIGlzIFwic3BlY2lhbFwiLlxyXG4gICAgICBvTW92aWUgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIG1vdmllSFRNTCA9IFtcclxuICAgICAgICAnPG9iamVjdCBpZD1cIicgKyBzbUlEICsgJ1wiIGRhdGE9XCInICsgc21VUkwgKyAnXCIgdHlwZT1cIicgKyBvRW1iZWQudHlwZSArICdcIiB0aXRsZT1cIicgKyBvRW1iZWQudGl0bGUgKydcIiBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCIgY29kZWJhc2U9XCJodHRwOi8vZG93bmxvYWQubWFjcm9tZWRpYS5jb20vcHViL3Nob2Nrd2F2ZS9jYWJzL2ZsYXNoL3N3Zmxhc2guY2FiI3ZlcnNpb249NiwwLDQwLDBcIj4nLFxyXG4gICAgICAgIHBhcmFtKCdtb3ZpZScsIHNtVVJMKSxcclxuICAgICAgICBwYXJhbSgnQWxsb3dTY3JpcHRBY2Nlc3MnLCBzbTIuYWxsb3dTY3JpcHRBY2Nlc3MpLFxyXG4gICAgICAgIHBhcmFtKCdxdWFsaXR5Jywgb0VtYmVkLnF1YWxpdHkpLFxyXG4gICAgICAgIChzbTIud21vZGU/IHBhcmFtKCd3bW9kZScsIHNtMi53bW9kZSk6ICcnKSxcclxuICAgICAgICBwYXJhbSgnYmdjb2xvcicsIHNtMi5iZ0NvbG9yKSxcclxuICAgICAgICBwYXJhbSgnaGFzUHJpb3JpdHknLCAndHJ1ZScpLFxyXG4gICAgICAgIChzbTIuZGVidWdGbGFzaCA/IHBhcmFtKCdGbGFzaFZhcnMnLCBvRW1iZWQuRmxhc2hWYXJzKSA6ICcnKSxcclxuICAgICAgICAnPC9vYmplY3Q+J1xyXG4gICAgICBdLmpvaW4oJycpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBvTW92aWUgPSBkb2MuY3JlYXRlRWxlbWVudCgnZW1iZWQnKTtcclxuICAgICAgZm9yICh0bXAgaW4gb0VtYmVkKSB7XHJcbiAgICAgICAgaWYgKG9FbWJlZC5oYXNPd25Qcm9wZXJ0eSh0bXApKSB7XHJcbiAgICAgICAgICBvTW92aWUuc2V0QXR0cmlidXRlKHRtcCwgb0VtYmVkW3RtcF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpbml0RGVidWcoKTtcclxuICAgIGV4dHJhQ2xhc3MgPSBnZXRTV0ZDU1MoKTtcclxuICAgIG9UYXJnZXQgPSBnZXREb2N1bWVudCgpO1xyXG5cclxuICAgIGlmIChvVGFyZ2V0KSB7XHJcblxyXG4gICAgICBzbTIub01DID0gKGlkKHNtMi5tb3ZpZUlEKSB8fCBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG5cclxuICAgICAgaWYgKCFzbTIub01DLmlkKSB7XHJcblxyXG4gICAgICAgIHNtMi5vTUMuaWQgPSBzbTIubW92aWVJRDtcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IHN3ZkNTUy5zd2ZEZWZhdWx0ICsgJyAnICsgZXh0cmFDbGFzcztcclxuICAgICAgICBzID0gbnVsbDtcclxuICAgICAgICBvRWwgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIXNtMi51c2VGbGFzaEJsb2NrKSB7XHJcbiAgICAgICAgICBpZiAoc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSkge1xyXG4gICAgICAgICAgICAvLyBvbi1zY3JlZW4gYXQgYWxsIHRpbWVzXHJcbiAgICAgICAgICAgIHMgPSB7XHJcbiAgICAgICAgICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAnd2lkdGgnOiAnOHB4JyxcclxuICAgICAgICAgICAgICAnaGVpZ2h0JzogJzhweCcsXHJcbiAgICAgICAgICAgICAgLy8gPj0gNnB4IGZvciBmbGFzaCB0byBydW4gZmFzdCwgPj0gOHB4IHRvIHN0YXJ0IHVwIHVuZGVyIEZpcmVmb3gvd2luMzIgaW4gc29tZSBjYXNlcy4gb2RkPyB5ZXMuXHJcbiAgICAgICAgICAgICAgJ2JvdHRvbSc6ICcwcHgnLFxyXG4gICAgICAgICAgICAgICdsZWZ0JzogJzBweCcsXHJcbiAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGhpZGUgb2ZmLXNjcmVlbiwgbG93ZXIgcHJpb3JpdHlcclxuICAgICAgICAgICAgcyA9IHtcclxuICAgICAgICAgICAgICAncG9zaXRpb24nOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICd3aWR0aCc6ICc2cHgnLFxyXG4gICAgICAgICAgICAgICdoZWlnaHQnOiAnNnB4JyxcclxuICAgICAgICAgICAgICAndG9wJzogJy05OTk5cHgnLFxyXG4gICAgICAgICAgICAgICdsZWZ0JzogJy05OTk5cHgnXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChpc1JUTCkge1xyXG4gICAgICAgICAgICAgIHMubGVmdCA9IE1hdGguYWJzKHBhcnNlSW50KHMubGVmdCwgMTApKSArICdweCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1dlYmtpdCkge1xyXG4gICAgICAgICAgLy8gc291bmRjbG91ZC1yZXBvcnRlZCByZW5kZXIvY3Jhc2ggZml4LCBzYWZhcmkgNVxyXG4gICAgICAgICAgc20yLm9NQy5zdHlsZS56SW5kZXggPSAxMDAwMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgICAgIGZvciAoeCBpbiBzKSB7XHJcbiAgICAgICAgICAgIGlmIChzLmhhc093blByb3BlcnR5KHgpKSB7XHJcbiAgICAgICAgICAgICAgc20yLm9NQy5zdHlsZVt4XSA9IHNbeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgaWYgKCFpc0lFKSB7XHJcbiAgICAgICAgICAgIHNtMi5vTUMuYXBwZW5kQ2hpbGQob01vdmllKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBvVGFyZ2V0LmFwcGVuZENoaWxkKHNtMi5vTUMpO1xyXG5cclxuICAgICAgICAgIGlmIChpc0lFKSB7XHJcbiAgICAgICAgICAgIG9FbCA9IHNtMi5vTUMuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgICAgb0VsLmNsYXNzTmFtZSA9IHN3ZkNTUy5zd2ZCb3g7XHJcbiAgICAgICAgICAgIG9FbC5pbm5lckhUTUwgPSBtb3ZpZUhUTUw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYXBwZW5kU3VjY2VzcyA9IHRydWU7XHJcblxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG5cclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihzdHIoJ2RvbUVycm9yJykgKyAnIFxcbicgKyBlLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBTTTIgY29udGFpbmVyIGlzIGFscmVhZHkgaW4gdGhlIGRvY3VtZW50IChlZy4gZmxhc2hibG9jayB1c2UgY2FzZSlcclxuICAgICAgICBzQ2xhc3MgPSBzbTIub01DLmNsYXNzTmFtZTtcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IChzQ2xhc3MgPyBzQ2xhc3MgKyAnICcgOiBzd2ZDU1Muc3dmRGVmYXVsdCkgKyAoZXh0cmFDbGFzcyA/ICcgJyArIGV4dHJhQ2xhc3MgOiAnJyk7XHJcbiAgICAgICAgc20yLm9NQy5hcHBlbmRDaGlsZChvTW92aWUpO1xyXG5cclxuICAgICAgICBpZiAoaXNJRSkge1xyXG4gICAgICAgICAgb0VsID0gc20yLm9NQy5hcHBlbmRDaGlsZChkb2MuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgICAgb0VsLmNsYXNzTmFtZSA9IHN3ZkNTUy5zd2ZCb3g7XHJcbiAgICAgICAgICBvRWwuaW5uZXJIVE1MID0gbW92aWVIVE1MO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXBwZW5kU3VjY2VzcyA9IHRydWU7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRpZEFwcGVuZCA9IHRydWU7XHJcblxyXG4gICAgaW5pdE1zZygpO1xyXG5cclxuICAgIC8vIHNtMi5fd0Qoc20gKyAnOiBUcnlpbmcgdG8gbG9hZCAnICsgc21VUkwgKyAoIW92ZXJIVFRQICYmIHNtMi5hbHRVUkwgPyAnIChhbHRlcm5hdGUgVVJMKScgOiAnJyksIDEpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBpbml0TW92aWUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICBjcmVhdGVNb3ZpZSgpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXR0ZW1wdCB0byBnZXQsIG9yIGNyZWF0ZSwgbW92aWUgKG1heSBhbHJlYWR5IGV4aXN0KVxyXG4gICAgaWYgKGZsYXNoKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNtMi51cmwpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTb21ldGhpbmcgaXNuJ3QgcmlnaHQgLSB3ZSd2ZSByZWFjaGVkIGluaXQsIGJ1dCB0aGUgc291bmRNYW5hZ2VyIHVybCBwcm9wZXJ0eSBoYXMgbm90IGJlZW4gc2V0LlxyXG4gICAgICAgKiBVc2VyIGhhcyBub3QgY2FsbGVkIHNldHVwKHt1cmw6IC4uLn0pLCBvciBoYXMgbm90IHNldCBzb3VuZE1hbmFnZXIudXJsIChsZWdhY3kgdXNlIGNhc2UpIGRpcmVjdGx5IGJlZm9yZSBpbml0IHRpbWUuXHJcbiAgICAgICAqIE5vdGlmeSBhbmQgZXhpdC4gSWYgdXNlciBjYWxscyBzZXR1cCgpIHdpdGggYSB1cmw6IHByb3BlcnR5LCBpbml0IHdpbGwgYmUgcmVzdGFydGVkIGFzIGluIHRoZSBkZWZlcnJlZCBsb2FkaW5nIGNhc2UuXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgIF93RFMoJ25vVVJMJyk7XHJcbiAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlubGluZSBtYXJrdXAgY2FzZVxyXG4gICAgZmxhc2ggPSBzbTIuZ2V0TW92aWUoc20yLmlkKTtcclxuXHJcbiAgICBpZiAoIWZsYXNoKSB7XHJcblxyXG4gICAgICBpZiAoIW9SZW1vdmVkKSB7XHJcblxyXG4gICAgICAgIC8vIHRyeSB0byBjcmVhdGVcclxuICAgICAgICBjcmVhdGVNb3ZpZShzbTIuaWQsIHNtMi51cmwpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gdHJ5IHRvIHJlLWFwcGVuZCByZW1vdmVkIG1vdmllIGFmdGVyIHJlYm9vdCgpXHJcbiAgICAgICAgaWYgKCFpc0lFKSB7XHJcbiAgICAgICAgICBzbTIub01DLmFwcGVuZENoaWxkKG9SZW1vdmVkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc20yLm9NQy5pbm5lckhUTUwgPSBvUmVtb3ZlZEhUTUw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvUmVtb3ZlZCA9IG51bGw7XHJcbiAgICAgICAgZGlkQXBwZW5kID0gdHJ1ZTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZsYXNoID0gc20yLmdldE1vdmllKHNtMi5pZCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2Ygc20yLm9uaW5pdG1vdmllID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHNldFRpbWVvdXQoc20yLm9uaW5pdG1vdmllLCAxKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGZsdXNoTWVzc2FnZXMoKTtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZGVsYXlXYWl0Rm9yRUkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBzZXRUaW1lb3V0KHdhaXRGb3JFSSwgMTAwMCk7XHJcblxyXG4gIH07XHJcblxyXG4gIHJlYm9vdEludG9IVE1MNSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogdHJ5IGZvciBhIHJlYm9vdCB3aXRoIHByZWZlckZsYXNoOiBmYWxzZSwgaWYgMTAwJSBIVE1MNSBtb2RlIGlzIHBvc3NpYmxlIGFuZCB1c2VGbGFzaEJsb2NrIGlzIG5vdCBlbmFibGVkLlxyXG5cclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgY29tcGxhaW4oc21jICsgJ3VzZUZsYXNoQmxvY2sgaXMgZmFsc2UsIDEwMCUgSFRNTDUgbW9kZSBpcyBwb3NzaWJsZS4gUmVib290aW5nIHdpdGggcHJlZmVyRmxhc2g6IGZhbHNlLi4uJyk7XHJcblxyXG4gICAgICBzbTIuc2V0dXAoe1xyXG4gICAgICAgIHByZWZlckZsYXNoOiBmYWxzZVxyXG4gICAgICB9KS5yZWJvb3QoKTtcclxuXHJcbiAgICAgIC8vIGlmIGZvciBzb21lIHJlYXNvbiB5b3Ugd2FudCB0byBkZXRlY3QgdGhpcyBjYXNlLCB1c2UgYW4gb250aW1lb3V0KCkgY2FsbGJhY2sgYW5kIGxvb2sgZm9yIGh0bWw1T25seSBhbmQgZGlkRmxhc2hCbG9jayA9PSB0cnVlLlxyXG4gICAgICBzbTIuZGlkRmxhc2hCbG9jayA9IHRydWU7XHJcblxyXG4gICAgICBzbTIuYmVnaW5EZWxheWVkSW5pdCgpO1xyXG5cclxuICAgIH0sIDEpO1xyXG5cclxuICB9O1xyXG5cclxuICB3YWl0Rm9yRUkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgcCxcclxuICAgICAgICBsb2FkSW5jb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgIGlmICghc20yLnVybCkge1xyXG4gICAgICAvLyBObyBTV0YgdXJsIHRvIGxvYWQgKG5vVVJMIGNhc2UpIC0gZXhpdCBmb3Igbm93LiBXaWxsIGJlIHJldHJpZWQgd2hlbiB1cmwgaXMgc2V0LlxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHdhaXRpbmdGb3JFSSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgd2FpdGluZ0ZvckVJID0gdHJ1ZTtcclxuICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdsb2FkJywgZGVsYXlXYWl0Rm9yRUkpO1xyXG5cclxuICAgIGlmIChoYXNGbGFzaCAmJiB0cnlJbml0T25Gb2N1cyAmJiAhaXNGb2N1c2VkKSB7XHJcbiAgICAgIC8vIFNhZmFyaSB3b24ndCBsb2FkIGZsYXNoIGluIGJhY2tncm91bmQgdGFicywgb25seSB3aGVuIGZvY3VzZWQuXHJcbiAgICAgIF93RFMoJ3dhaXRGb2N1cycpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkaWRJbml0KSB7XHJcbiAgICAgIHAgPSBzbTIuZ2V0TW92aWVQZXJjZW50KCk7XHJcbiAgICAgIGlmIChwID4gMCAmJiBwIDwgMTAwKSB7XHJcbiAgICAgICAgbG9hZEluY29tcGxldGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHAgPSBzbTIuZ2V0TW92aWVQZXJjZW50KCk7XHJcblxyXG4gICAgICBpZiAobG9hZEluY29tcGxldGUpIHtcclxuICAgICAgICAvLyBzcGVjaWFsIGNhc2U6IGlmIG1vdmllICpwYXJ0aWFsbHkqIGxvYWRlZCwgcmV0cnkgdW50aWwgaXQncyAxMDAlIGJlZm9yZSBhc3N1bWluZyBmYWlsdXJlLlxyXG4gICAgICAgIHdhaXRpbmdGb3JFSSA9IGZhbHNlO1xyXG4gICAgICAgIHNtMi5fd0Qoc3RyKCd3YWl0U1dGJykpO1xyXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGRlbGF5V2FpdEZvckVJLCAxKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoIWRpZEluaXQpIHtcclxuXHJcbiAgICAgICAgc20yLl93RChzbSArICc6IE5vIEZsYXNoIHJlc3BvbnNlIHdpdGhpbiBleHBlY3RlZCB0aW1lLiBMaWtlbHkgY2F1c2VzOiAnICsgKHAgPT09IDAgPyAnU1dGIGxvYWQgZmFpbGVkLCAnIDogJycpICsgJ0ZsYXNoIGJsb2NrZWQgb3IgSlMtRmxhc2ggc2VjdXJpdHkgZXJyb3IuJyArIChzbTIuZGVidWdGbGFzaCA/ICcgJyArIHN0cignY2hlY2tTV0YnKSA6ICcnKSwgMik7XHJcblxyXG4gICAgICAgIGlmICghb3ZlckhUVFAgJiYgcCkge1xyXG5cclxuICAgICAgICAgIF93RFMoJ2xvY2FsRmFpbCcsIDIpO1xyXG5cclxuICAgICAgICAgIGlmICghc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgICAgICAgX3dEUygndHJ5RGVidWcnLCAyKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgIC8vIGlmIDAgKG5vdCBudWxsKSwgcHJvYmFibHkgYSA0MDQuXHJcbiAgICAgICAgICBzbTIuX3dEKHN0cignc3dmNDA0Jywgc20yLnVybCksIDEpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRlYnVnVFMoJ2ZsYXNodG9qcycsIGZhbHNlLCAnOiBUaW1lZCBvdXQnICsgKG92ZXJIVFRQID8gJyAoQ2hlY2sgZmxhc2ggc2VjdXJpdHkgb3IgZmxhc2ggYmxvY2tlcnMpJzonIChObyBwbHVnaW4vbWlzc2luZyBTV0Y/KScpKTtcclxuXHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgLy8gZ2l2ZSB1cCAvIHRpbWUtb3V0LCBkZXBlbmRpbmdcclxuXHJcbiAgICAgIGlmICghZGlkSW5pdCAmJiBva1RvRGlzYWJsZSkge1xyXG5cclxuICAgICAgICBpZiAocCA9PT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgIC8vIFNXRiBmYWlsZWQgdG8gcmVwb3J0IGxvYWQgcHJvZ3Jlc3MuIFBvc3NpYmx5IGJsb2NrZWQuXHJcblxyXG4gICAgICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrIHx8IHNtMi5mbGFzaExvYWRUaW1lb3V0ID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2spIHtcclxuXHJcbiAgICAgICAgICAgICAgZmxhc2hCbG9ja0hhbmRsZXIoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF93RFMoJ3dhaXRGb3JldmVyJyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG5vIGN1c3RvbSBmbGFzaCBibG9jayBoYW5kbGluZywgYnV0IFNXRiBoYXMgdGltZWQgb3V0LiBXaWxsIHJlY292ZXIgaWYgdXNlciB1bmJsb2NrcyAvIGFsbG93cyBTV0YgbG9hZC5cclxuXHJcbiAgICAgICAgICAgIGlmICghc20yLnVzZUZsYXNoQmxvY2sgJiYgY2FuSWdub3JlRmxhc2gpIHtcclxuXHJcbiAgICAgICAgICAgICAgcmVib290SW50b0hUTUw1KCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICBfd0RTKCd3YWl0Rm9yZXZlcicpO1xyXG5cclxuICAgICAgICAgICAgICAvLyBmaXJlIGFueSByZWd1bGFyIHJlZ2lzdGVyZWQgb250aW1lb3V0KCkgbGlzdGVuZXJzLlxyXG4gICAgICAgICAgICAgIHByb2Nlc3NPbkV2ZW50cyh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnb250aW1lb3V0JyxcclxuICAgICAgICAgICAgICAgIGlnbm9yZUluaXQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBlcnJvcjoge1xyXG4gICAgICAgICAgICAgICAgICB0eXBlOiAnSU5JVF9GTEFTSEJMT0NLJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBTV0YgbG9hZGVkPyBTaG91bGRuJ3QgYmUgYSBibG9ja2luZyBpc3N1ZSwgdGhlbi5cclxuXHJcbiAgICAgICAgICBpZiAoc20yLmZsYXNoTG9hZFRpbWVvdXQgPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIF93RFMoJ3dhaXRGb3JldmVyJyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghc20yLnVzZUZsYXNoQmxvY2sgJiYgY2FuSWdub3JlRmxhc2gpIHtcclxuXHJcbiAgICAgICAgICAgICAgcmVib290SW50b0hUTUw1KCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICBmYWlsU2FmZWx5KHRydWUpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH0sIHNtMi5mbGFzaExvYWRUaW1lb3V0KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaGFuZGxlRm9jdXMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xyXG4gICAgICBldmVudC5yZW1vdmUod2luZG93LCAnZm9jdXMnLCBoYW5kbGVGb2N1cyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzRm9jdXNlZCB8fCAhdHJ5SW5pdE9uRm9jdXMpIHtcclxuICAgICAgLy8gYWxyZWFkeSBmb2N1c2VkLCBvciBub3Qgc3BlY2lhbCBTYWZhcmkgYmFja2dyb3VuZCB0YWIgY2FzZVxyXG4gICAgICBjbGVhbnVwKCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIG9rVG9EaXNhYmxlID0gdHJ1ZTtcclxuICAgIGlzRm9jdXNlZCA9IHRydWU7XHJcbiAgICBfd0RTKCdnb3RGb2N1cycpO1xyXG5cclxuICAgIC8vIGFsbG93IGluaXQgdG8gcmVzdGFydFxyXG4gICAgd2FpdGluZ0ZvckVJID0gZmFsc2U7XHJcblxyXG4gICAgLy8ga2ljayBvZmYgRXh0ZXJuYWxJbnRlcmZhY2UgdGltZW91dCwgbm93IHRoYXQgdGhlIFNXRiBoYXMgc3RhcnRlZFxyXG4gICAgZGVsYXlXYWl0Rm9yRUkoKTtcclxuXHJcbiAgICBjbGVhbnVwKCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZmx1c2hNZXNzYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIDxkPlxyXG5cclxuICAgIC8vIFNNMiBwcmUtaW5pdCBkZWJ1ZyBtZXNzYWdlc1xyXG4gICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xyXG4gICAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXIgMjogJyArIG1lc3NhZ2VzLmpvaW4oJyAnKSwgMSk7XHJcbiAgICAgIG1lc3NhZ2VzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBzaG93U3VwcG9ydCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIDxkPlxyXG5cclxuICAgIGZsdXNoTWVzc2FnZXMoKTtcclxuXHJcbiAgICB2YXIgaXRlbSwgdGVzdHMgPSBbXTtcclxuXHJcbiAgICBpZiAoc20yLnVzZUhUTUw1QXVkaW8gJiYgc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIGZvciAoaXRlbSBpbiBzbTIuYXVkaW9Gb3JtYXRzKSB7XHJcbiAgICAgICAgaWYgKHNtMi5hdWRpb0Zvcm1hdHMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICAgIHRlc3RzLnB1c2goaXRlbSArICcgPSAnICsgc20yLmh0bWw1W2l0ZW1dICsgKCFzbTIuaHRtbDVbaXRlbV0gJiYgbmVlZHNGbGFzaCAmJiBzbTIuZmxhc2hbaXRlbV0gPyAnICh1c2luZyBmbGFzaCknIDogKHNtMi5wcmVmZXJGbGFzaCAmJiBzbTIuZmxhc2hbaXRlbV0gJiYgbmVlZHNGbGFzaCA/ICcgKHByZWZlcnJpbmcgZmxhc2gpJyA6ICghc20yLmh0bWw1W2l0ZW1dID8gJyAoJyArIChzbTIuYXVkaW9Gb3JtYXRzW2l0ZW1dLnJlcXVpcmVkID8gJ3JlcXVpcmVkLCAnIDogJycpICsgJ2FuZCBubyBmbGFzaCBzdXBwb3J0KScgOiAnJykpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlciAyIEhUTUw1IHN1cHBvcnQ6ICcgKyB0ZXN0cy5qb2luKCcsICcpLCAxKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIGluaXRDb21wbGV0ZSA9IGZ1bmN0aW9uKGJOb0Rpc2FibGUpIHtcclxuXHJcbiAgICBpZiAoZGlkSW5pdCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgLy8gYWxsIGdvb2QuXHJcbiAgICAgIF93RFMoJ3NtMkxvYWRlZCcsIDEpO1xyXG4gICAgICBkaWRJbml0ID0gdHJ1ZTtcclxuICAgICAgaW5pdFVzZXJPbmxvYWQoKTtcclxuICAgICAgZGVidWdUUygnb25sb2FkJywgdHJ1ZSk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB3YXNUaW1lb3V0ID0gKHNtMi51c2VGbGFzaEJsb2NrICYmIHNtMi5mbGFzaExvYWRUaW1lb3V0ICYmICFzbTIuZ2V0TW92aWVQZXJjZW50KCkpLFxyXG4gICAgICAgIHJlc3VsdCA9IHRydWUsXHJcbiAgICAgICAgZXJyb3I7XHJcblxyXG4gICAgaWYgKCF3YXNUaW1lb3V0KSB7XHJcbiAgICAgIGRpZEluaXQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGVycm9yID0ge1xyXG4gICAgICB0eXBlOiAoIWhhc0ZsYXNoICYmIG5lZWRzRmxhc2ggPyAnTk9fRkxBU0gnIDogJ0lOSVRfVElNRU9VVCcpXHJcbiAgICB9O1xyXG5cclxuICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlciAyICcgKyAoZGlzYWJsZWQgPyAnZmFpbGVkIHRvIGxvYWQnIDogJ2xvYWRlZCcpICsgJyAoJyArIChkaXNhYmxlZCA/ICdGbGFzaCBzZWN1cml0eS9sb2FkIGVycm9yJyA6ICdPSycpICsgJykgJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoZGlzYWJsZWQgPyAxMDAwNiA6IDEwMDAzKSwgZGlzYWJsZWQgPyAyOiAxKTtcclxuXHJcbiAgICBpZiAoZGlzYWJsZWQgfHwgYk5vRGlzYWJsZSkge1xyXG5cclxuICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrICYmIHNtMi5vTUMpIHtcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IGdldFNXRkNTUygpICsgJyAnICsgKHNtMi5nZXRNb3ZpZVBlcmNlbnQoKSA9PT0gbnVsbCA/IHN3ZkNTUy5zd2ZUaW1lZG91dCA6IHN3ZkNTUy5zd2ZFcnJvcik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cyh7XHJcbiAgICAgICAgdHlwZTogJ29udGltZW91dCcsXHJcbiAgICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgICAgIGlnbm9yZUluaXQ6IHRydWVcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBkZWJ1Z1RTKCdvbmxvYWQnLCBmYWxzZSk7XHJcbiAgICAgIGNhdGNoRXJyb3IoZXJyb3IpO1xyXG5cclxuICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGRlYnVnVFMoJ29ubG9hZCcsIHRydWUpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRpc2FibGVkKSB7XHJcblxyXG4gICAgICBpZiAoc20yLndhaXRGb3JXaW5kb3dMb2FkICYmICF3aW5kb3dMb2FkZWQpIHtcclxuXHJcbiAgICAgICAgX3dEUygnd2FpdE9ubG9hZCcpO1xyXG4gICAgICAgIGV2ZW50LmFkZCh3aW5kb3csICdsb2FkJywgaW5pdFVzZXJPbmxvYWQpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKHNtMi53YWl0Rm9yV2luZG93TG9hZCAmJiB3aW5kb3dMb2FkZWQpIHtcclxuICAgICAgICAgIF93RFMoJ2RvY0xvYWRlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICAgIGluaXRVc2VyT25sb2FkKCk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIGFwcGx5IHRvcC1sZXZlbCBzZXR1cE9wdGlvbnMgb2JqZWN0IGFzIGxvY2FsIHByb3BlcnRpZXMsIGVnLiwgdGhpcy5zZXR1cE9wdGlvbnMuZmxhc2hWZXJzaW9uIC0+IHRoaXMuZmxhc2hWZXJzaW9uIChzb3VuZE1hbmFnZXIuZmxhc2hWZXJzaW9uKVxyXG4gICAqIHRoaXMgbWFpbnRhaW5zIGJhY2t3YXJkIGNvbXBhdGliaWxpdHksIGFuZCBhbGxvd3MgcHJvcGVydGllcyB0byBiZSBkZWZpbmVkIHNlcGFyYXRlbHkgZm9yIHVzZSBieSBzb3VuZE1hbmFnZXIuc2V0dXAoKS5cclxuICAgKi9cclxuXHJcbiAgc2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBpLFxyXG4gICAgICAgIG8gPSBzbTIuc2V0dXBPcHRpb25zO1xyXG5cclxuICAgIGZvciAoaSBpbiBvKSB7XHJcblxyXG4gICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG5cclxuICAgICAgICAvLyBhc3NpZ24gbG9jYWwgcHJvcGVydHkgaWYgbm90IGFscmVhZHkgZGVmaW5lZFxyXG5cclxuICAgICAgICBpZiAoc20yW2ldID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgc20yW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChzbTJbaV0gIT09IG9baV0pIHtcclxuXHJcbiAgICAgICAgICAvLyBsZWdhY3kgc3VwcG9ydDogd3JpdGUgbWFudWFsbHktYXNzaWduZWQgcHJvcGVydHkgKGVnLiwgc291bmRNYW5hZ2VyLnVybCkgYmFjayB0byBzZXR1cE9wdGlvbnMgdG8ga2VlcCB0aGluZ3MgaW4gc3luY1xyXG4gICAgICAgICAgc20yLnNldHVwT3B0aW9uc1tpXSA9IHNtMltpXTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcblxyXG4gIGluaXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBjYWxsZWQgYWZ0ZXIgb25sb2FkKClcclxuXHJcbiAgICBpZiAoZGlkSW5pdCkge1xyXG4gICAgICBfd0RTKCdkaWRJbml0Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xyXG4gICAgICBldmVudC5yZW1vdmUod2luZG93LCAnbG9hZCcsIHNtMi5iZWdpbkRlbGF5ZWRJbml0KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG5cclxuICAgICAgaWYgKCFkaWRJbml0KSB7XHJcbiAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCBubyBzdGVlbmtpbmcgZmxhc2ghXHJcbiAgICAgICAgY2xlYW51cCgpO1xyXG4gICAgICAgIHNtMi5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICBpbml0Q29tcGxldGUoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZsYXNoIHBhdGhcclxuICAgIGluaXRNb3ZpZSgpO1xyXG5cclxuICAgIHRyeSB7XHJcblxyXG4gICAgICAvLyBhdHRlbXB0IHRvIHRhbGsgdG8gRmxhc2hcclxuICAgICAgZmxhc2guX2V4dGVybmFsSW50ZXJmYWNlVGVzdChmYWxzZSk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQXBwbHkgdXNlci1zcGVjaWZpZWQgcG9sbGluZyBpbnRlcnZhbCwgT1IsIGlmIFwiaGlnaCBwZXJmb3JtYW5jZVwiIHNldCwgZmFzdGVyIHZzLiBkZWZhdWx0IHBvbGxpbmdcclxuICAgICAgICogKGRldGVybWluZXMgZnJlcXVlbmN5IG9mIHdoaWxlbG9hZGluZy93aGlsZXBsYXlpbmcgY2FsbGJhY2tzLCBlZmZlY3RpdmVseSBkcml2aW5nIFVJIGZyYW1lcmF0ZXMpXHJcbiAgICAgICAqL1xyXG4gICAgICBzZXRQb2xsaW5nKHRydWUsIChzbTIuZmxhc2hQb2xsaW5nSW50ZXJ2YWwgfHwgKHNtMi51c2VIaWdoUGVyZm9ybWFuY2UgPyAxMCA6IDUwKSkpO1xyXG5cclxuICAgICAgaWYgKCFzbTIuZGVidWdNb2RlKSB7XHJcbiAgICAgICAgLy8gc3RvcCB0aGUgU1dGIGZyb20gbWFraW5nIGRlYnVnIG91dHB1dCBjYWxscyB0byBKU1xyXG4gICAgICAgIGZsYXNoLl9kaXNhYmxlRGVidWcoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICBkZWJ1Z1RTKCdqc3RvZmxhc2gnLCB0cnVlKTtcclxuXHJcbiAgICAgIGlmICghc20yLmh0bWw1T25seSkge1xyXG4gICAgICAgIC8vIHByZXZlbnQgYnJvd3NlciBmcm9tIHNob3dpbmcgY2FjaGVkIHBhZ2Ugc3RhdGUgKG9yIHJhdGhlciwgcmVzdG9yaW5nIFwic3VzcGVuZGVkXCIgcGFnZSBzdGF0ZSkgdmlhIGJhY2sgYnV0dG9uLCBiZWNhdXNlIGZsYXNoIG1heSBiZSBkZWFkXHJcbiAgICAgICAgLy8gaHR0cDovL3d3dy53ZWJraXQub3JnL2Jsb2cvNTE2L3dlYmtpdC1wYWdlLWNhY2hlLWlpLXRoZS11bmxvYWQtZXZlbnQvXHJcbiAgICAgICAgZXZlbnQuYWRkKHdpbmRvdywgJ3VubG9hZCcsIGRvTm90aGluZyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9IGNhdGNoKGUpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QoJ2pzL2ZsYXNoIGV4Y2VwdGlvbjogJyArIGUudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICBkZWJ1Z1RTKCdqc3RvZmxhc2gnLCBmYWxzZSk7XHJcblxyXG4gICAgICBjYXRjaEVycm9yKHtcclxuICAgICAgICB0eXBlOiAnSlNfVE9fRkxBU0hfRVhDRVBUSU9OJyxcclxuICAgICAgICBmYXRhbDogdHJ1ZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIGRvbid0IGRpc2FibGUsIGZvciByZWJvb3QoKVxyXG4gICAgICBmYWlsU2FmZWx5KHRydWUpO1xyXG5cclxuICAgICAgaW5pdENvbXBsZXRlKCk7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGluaXRDb21wbGV0ZSgpO1xyXG5cclxuICAgIC8vIGRpc2Nvbm5lY3QgZXZlbnRzXHJcbiAgICBjbGVhbnVwKCk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGRvbUNvbnRlbnRMb2FkZWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAoZGlkRENMb2FkZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRpZERDTG9hZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBhc3NpZ24gdG9wLWxldmVsIHNvdW5kTWFuYWdlciBwcm9wZXJ0aWVzIGVnLiBzb3VuZE1hbmFnZXIudXJsXHJcbiAgICBzZXRQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgaW5pdERlYnVnKCk7XHJcblxyXG4gICAgaWYgKCFoYXNGbGFzaCAmJiBzbTIuaGFzSFRNTDUpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlciAyOiBObyBGbGFzaCBkZXRlY3RlZCcgKyAoIXNtMi51c2VIVE1MNUF1ZGlvID8gJywgZW5hYmxpbmcgSFRNTDUuJyA6ICcuIFRyeWluZyBIVE1MNS1vbmx5IG1vZGUuJyksIDEpO1xyXG5cclxuICAgICAgc20yLnNldHVwKHtcclxuICAgICAgICAndXNlSFRNTDVBdWRpbyc6IHRydWUsXHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGFyZW4ndCBwcmVmZXJyaW5nIGZsYXNoLCBlaXRoZXJcclxuICAgICAgICAvLyBUT0RPOiBwcmVmZXJGbGFzaCBzaG91bGQgbm90IG1hdHRlciBpZiBmbGFzaCBpcyBub3QgaW5zdGFsbGVkLiBDdXJyZW50bHksIHN0dWZmIGJyZWFrcyB3aXRob3V0IHRoZSBiZWxvdyB0d2Vhay5cclxuICAgICAgICAncHJlZmVyRmxhc2gnOiBmYWxzZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdEhUTUw1KCk7XHJcblxyXG4gICAgaWYgKCFoYXNGbGFzaCAmJiBuZWVkc0ZsYXNoKSB7XHJcblxyXG4gICAgICBtZXNzYWdlcy5wdXNoKHN0cmluZ3MubmVlZEZsYXNoKTtcclxuXHJcbiAgICAgIC8vIFRPRE86IEZhdGFsIGhlcmUgdnMuIHRpbWVvdXQgYXBwcm9hY2gsIGV0Yy5cclxuICAgICAgLy8gaGFjazogZmFpbCBzb29uZXIuXHJcbiAgICAgIHNtMi5zZXR1cCh7XHJcbiAgICAgICAgJ2ZsYXNoTG9hZFRpbWVvdXQnOiAxXHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcclxuICAgICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBkb21Db250ZW50TG9hZGVkLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdE1vdmllKCk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGRvbUNvbnRlbnRMb2FkZWRJRSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmIChkb2MucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgICBkb21Db250ZW50TG9hZGVkKCk7XHJcbiAgICAgIGRvYy5kZXRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZG9tQ29udGVudExvYWRlZElFKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgd2luT25Mb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gY2F0Y2ggZWRnZSBjYXNlIG9mIGluaXRDb21wbGV0ZSgpIGZpcmluZyBhZnRlciB3aW5kb3cubG9hZCgpXHJcbiAgICB3aW5kb3dMb2FkZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIGNhdGNoIGNhc2Ugd2hlcmUgRE9NQ29udGVudExvYWRlZCBoYXMgYmVlbiBzZW50LCBidXQgd2UncmUgc3RpbGwgaW4gZG9jLnJlYWR5U3RhdGUgPSAnaW50ZXJhY3RpdmUnXHJcbiAgICBkb21Db250ZW50TG9hZGVkKCk7XHJcblxyXG4gICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2xvYWQnLCB3aW5PbkxvYWQpO1xyXG5cclxuICB9O1xyXG5cclxuICAvLyBzbmlmZiB1cC1mcm9udFxyXG4gIGRldGVjdEZsYXNoKCk7XHJcblxyXG4gIC8vIGZvY3VzIGFuZCB3aW5kb3cgbG9hZCwgaW5pdCAocHJpbWFyaWx5IGZsYXNoLWRyaXZlbilcclxuICBldmVudC5hZGQod2luZG93LCAnZm9jdXMnLCBoYW5kbGVGb2N1cyk7XHJcbiAgZXZlbnQuYWRkKHdpbmRvdywgJ2xvYWQnLCBkZWxheVdhaXRGb3JFSSk7XHJcbiAgZXZlbnQuYWRkKHdpbmRvdywgJ2xvYWQnLCB3aW5PbkxvYWQpO1xyXG5cclxuICBpZiAoZG9jLmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHJcbiAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGRvbUNvbnRlbnRMb2FkZWQsIGZhbHNlKTtcclxuXHJcbiAgfSBlbHNlIGlmIChkb2MuYXR0YWNoRXZlbnQpIHtcclxuXHJcbiAgICBkb2MuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGRvbUNvbnRlbnRMb2FkZWRJRSk7XHJcblxyXG4gIH0gZWxzZSB7XHJcblxyXG4gICAgLy8gbm8gYWRkL2F0dGFjaGV2ZW50IHN1cHBvcnQgLSBzYWZlIHRvIGFzc3VtZSBubyBKUyAtPiBGbGFzaCBlaXRoZXJcclxuICAgIGRlYnVnVFMoJ29ubG9hZCcsIGZhbHNlKTtcclxuICAgIGNhdGNoRXJyb3Ioe1xyXG4gICAgICB0eXBlOiAnTk9fRE9NMl9FVkVOVFMnLFxyXG4gICAgICBmYXRhbDogdHJ1ZVxyXG4gICAgfSk7XHJcblxyXG4gIH1cclxuXHJcbn0gLy8gU291bmRNYW5hZ2VyKClcclxuXHJcbi8vIFNNMl9ERUZFUiBkZXRhaWxzOiBodHRwOi8vd3d3LnNjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL2RvYy9nZXRzdGFydGVkLyNsYXp5LWxvYWRpbmdcclxuXHJcbmlmICh3aW5kb3cuU00yX0RFRkVSID09PSBfdW5kZWZpbmVkIHx8ICFTTTJfREVGRVIpIHtcclxuICBzb3VuZE1hbmFnZXIgPSBuZXcgU291bmRNYW5hZ2VyKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTb3VuZE1hbmFnZXIgcHVibGljIGludGVyZmFjZXNcclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqL1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZSAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIGNvbW1vbkpTIG1vZHVsZVxyXG4gICAqL1xyXG5cclxuICBtb2R1bGUuZXhwb3J0cy5Tb3VuZE1hbmFnZXIgPSBTb3VuZE1hbmFnZXI7XHJcbiAgbW9kdWxlLmV4cG9ydHMuc291bmRNYW5hZ2VyID0gc291bmRNYW5hZ2VyO1xyXG5cclxufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQU1EIC0gcmVxdWlyZUpTXHJcbiAgICogYmFzaWMgdXNhZ2U6XHJcbiAgICogcmVxdWlyZShbXCIvcGF0aC90by9zb3VuZG1hbmFnZXIyLmpzXCJdLCBmdW5jdGlvbihTb3VuZE1hbmFnZXIpIHtcclxuICAgKiAgIFNvdW5kTWFuYWdlci5nZXRJbnN0YW5jZSgpLnNldHVwKHtcclxuICAgKiAgICAgdXJsOiAnL3N3Zi8nLFxyXG4gICAqICAgICBvbnJlYWR5OiBmdW5jdGlvbigpIHsgLi4uIH1cclxuICAgKiAgIH0pXHJcbiAgICogfSk7XHJcbiAgICpcclxuICAgKiBTTTJfREVGRVIgdXNhZ2U6XHJcbiAgICogd2luZG93LlNNMl9ERUZFUiA9IHRydWU7XHJcbiAgICogcmVxdWlyZShbXCIvcGF0aC90by9zb3VuZG1hbmFnZXIyLmpzXCJdLCBmdW5jdGlvbihTb3VuZE1hbmFnZXIpIHtcclxuICAgKiAgIFNvdW5kTWFuYWdlci5nZXRJbnN0YW5jZShmdW5jdGlvbigpIHtcclxuICAgKiAgICAgdmFyIHNvdW5kTWFuYWdlciA9IG5ldyBTb3VuZE1hbmFnZXIuY29uc3RydWN0b3IoKTtcclxuICAgKiAgICAgc291bmRNYW5hZ2VyLnNldHVwKHtcclxuICAgKiAgICAgICB1cmw6ICcvc3dmLycsXHJcbiAgICogICAgICAgLi4uXHJcbiAgICogICAgIH0pO1xyXG4gICAqICAgICAuLi5cclxuICAgKiAgICAgc291bmRNYW5hZ2VyLmJlZ2luRGVsYXllZEluaXQoKTtcclxuICAgKiAgICAgcmV0dXJuIHNvdW5kTWFuYWdlcjtcclxuICAgKiAgIH0pXHJcbiAgICogfSk7IFxyXG4gICAqL1xyXG5cclxuICBkZWZpbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlIHRoZSBnbG9iYWwgaW5zdGFuY2Ugb2YgU291bmRNYW5hZ2VyLlxyXG4gICAgICogSWYgYSBnbG9iYWwgaW5zdGFuY2UgZG9lcyBub3QgZXhpc3QgaXQgY2FuIGJlIGNyZWF0ZWQgdXNpbmcgYSBjYWxsYmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzbUJ1aWxkZXIgT3B0aW9uYWw6IENhbGxiYWNrIHVzZWQgdG8gY3JlYXRlIGEgbmV3IFNvdW5kTWFuYWdlciBpbnN0YW5jZVxyXG4gICAgICogQHJldHVybiB7U291bmRNYW5hZ2VyfSBUaGUgZ2xvYmFsIFNvdW5kTWFuYWdlciBpbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRJbnN0YW5jZShzbUJ1aWxkZXIpIHtcclxuICAgICAgaWYgKCF3aW5kb3cuc291bmRNYW5hZ2VyICYmIHNtQnVpbGRlciBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdmFyIGluc3RhbmNlID0gc21CdWlsZGVyKFNvdW5kTWFuYWdlcik7XHJcbiAgICAgICAgaWYgKGluc3RhbmNlIGluc3RhbmNlb2YgU291bmRNYW5hZ2VyKSB7XHJcbiAgICAgICAgICB3aW5kb3cuc291bmRNYW5hZ2VyID0gaW5zdGFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB3aW5kb3cuc291bmRNYW5hZ2VyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29uc3RydWN0b3I6IFNvdW5kTWFuYWdlcixcclxuICAgICAgZ2V0SW5zdGFuY2U6IGdldEluc3RhbmNlXHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG59XHJcblxyXG4vLyBzdGFuZGFyZCBicm93c2VyIGNhc2VcclxuXHJcbi8vIGNvbnN0cnVjdG9yXHJcbndpbmRvdy5Tb3VuZE1hbmFnZXIgPSBTb3VuZE1hbmFnZXI7XHJcblxyXG4vKipcclxuICogbm90ZTogU00yIHJlcXVpcmVzIGEgd2luZG93IGdsb2JhbCBkdWUgdG8gRmxhc2gsIHdoaWNoIG1ha2VzIGNhbGxzIHRvIHdpbmRvdy5zb3VuZE1hbmFnZXIuXHJcbiAqIEZsYXNoIG1heSBub3QgYWx3YXlzIGJlIG5lZWRlZCwgYnV0IHRoaXMgaXMgbm90IGtub3duIHVudGlsIGFzeW5jIGluaXQgYW5kIFNNMiBtYXkgZXZlbiBcInJlYm9vdFwiIGludG8gRmxhc2ggbW9kZS5cclxuICovXHJcblxyXG4vLyBwdWJsaWMgQVBJLCBmbGFzaCBjYWxsYmFja3MgZXRjLlxyXG53aW5kb3cuc291bmRNYW5hZ2VyID0gc291bmRNYW5hZ2VyO1xyXG5cclxufSh3aW5kb3cpKTtcclxuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3NvdW5kbWFuYWdlcjIgPSByZXF1aXJlKCdzb3VuZG1hbmFnZXIyJyk7XG5cbnZhciBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9zbS8zNjAtcGxheWVyL3NjcmlwdC8zNjBwbGF5ZXInKTtcblxuX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLnNldHVwKHtcbiAgICAvLyBwYXRoIHRvIGRpcmVjdG9yeSBjb250YWluaW5nIFNNMiBTV0ZcbiAgICB1cmw6ICdwbHVnaW5zL2VkaXRvci5zb3VuZG1hbmFnZXIvc20vc3dmLycsXG4gICAgZGVidWdNb2RlOiB0cnVlXG59KTtcblxudmFyIFBsYXllciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhQbGF5ZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUGxheWVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQbGF5ZXIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFBsYXllci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcblxuICAgICAgICBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5jb25maWcuYXV0b1BsYXkgPSBwcm9wcy5hdXRvUGxheTtcblxuICAgICAgICBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5jb25maWcuc2NhbGVGb250ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvbXNpZS9pKSA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgICAgX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnNob3dITVNUaW1lID0gdHJ1ZTtcblxuICAgICAgICAvLyBlbmFibGUgc29tZSBzcGVjdHJ1bSBzdHVmZnNcbiAgICAgICAgX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVdhdmVmb3JtRGF0YSA9IHRydWU7XG4gICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy51c2VFUURhdGEgPSB0cnVlO1xuICAgICAgICB2YXIgb25GaW5pc2ggPSBwcm9wcy5vbkZpbmlzaDtcblxuICAgICAgICBpZiAob25GaW5pc2gpIHtcbiAgICAgICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy5vbmZpbmlzaCA9IG9uRmluaXNoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZW5hYmxlIHRoaXMgaW4gU00yIGFzIHdlbGwsIGFzIG5lZWRlZFxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVdhdmVmb3JtRGF0YSkge1xuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLmZsYXNoOU9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZUVRRGF0YSkge1xuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLmZsYXNoOU9wdGlvbnMudXNlRVFEYXRhID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVBlYWtEYXRhKSB7XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIuZmxhc2g5T3B0aW9ucy51c2VQZWFrRGF0YSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVdhdmVmb3JtRGF0YSB8fCBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5mbGFzaDlPcHRpb25zLnVzZUVRRGF0YSB8fCBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5mbGFzaDlPcHRpb25zLnVzZVBlYWtEYXRhKSB7XG4gICAgICAgICAgICAvLyBldmVuIGlmIEhUTUw1IHN1cHBvcnRzIE1QMywgcHJlZmVyIGZsYXNoIHNvIHRoZSB2aXN1YWxpemF0aW9uIGZlYXR1cmVzIGNhbiBiZSB1c2VkLlxuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLnByZWZlckZsYXNoID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZhdmljb24gaXMgZXhwZW5zaXZlIENQVS13aXNlLCBidXQgY2FuIGJlIHVzZWQuXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvaGlmaS9pKSkge1xuICAgICAgICAgICAgX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZUZhdkljb24gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9odG1sNS9pKSkge1xuICAgICAgICAgICAgLy8gZm9yIHRlc3RpbmcgSUUgOSwgZXRjLlxuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLnVzZUhUTUw1QXVkaW8gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBsYXllciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIub25yZWFkeShfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5pbml0KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZpbmlzaCkge1xuICAgICAgICAgICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy5vbmZpbmlzaCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIuc3RvcEFsbCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZpbmlzaCkge1xuICAgICAgICAgICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy5vbmZpbmlzaCA9IHRoaXMucHJvcHMub25GaW5pc2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIub25yZWFkeShfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5pbml0KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBcInVpMzYwXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yaWNoKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9IFwiIHVpMzYwLXZpc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSwgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFBsYXllcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5QbGF5ZXIucHJvcFR5cGVzID0ge1xuICAgIHRocmVlU2l4dHlQbGF5ZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIGF1dG9QbGF5OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wsXG4gICAgcmljaDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgb25SZWFkeTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jXG59O1xuXG5QbGF5ZXIuZGVmYXVsdFByb3BzID0ge1xuICAgIGF1dG9QbGF5OiBmYWxzZSxcbiAgICByaWNoOiB0cnVlXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQbGF5ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9QbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xuXG52YXIgX1BsYXllcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9QbGF5ZXIpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbi8vIFRoZSB0aHJlZVNpeHl0UGxheWVyIGlzIHRoZSBzYW1lIGZvciBhbGwgYmFkZ2VzXG52YXIgdGhyZWVTaXh0eVBsYXllciA9IG5ldyBUaHJlZVNpeHR5UGxheWVyKCk7XG5cbnZhciBCYWRnZSA9IChmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhCYWRnZSwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBCYWRnZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJhZGdlKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihCYWRnZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhCYWRnZSwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWROb2RlKHRoaXMucHJvcHMpO1xuXG4gICAgICAgICAgICB0aHJlZVNpeHR5UGxheWVyLmluaXQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgaWYgKG5leHRQcm9wcy5ub2RlICE9PSB0aGlzLnByb3BzLm5vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWROb2RlKG5leHRQcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWROb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWROb2RlKHByb3BzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHByb3BzLm5vZGU7XG5cbiAgICAgICAgICAgIF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgIG1pbWVUeXBlOiBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmID0gdGhpcy5zdGF0ZSB8fCB7fTtcblxuICAgICAgICAgICAgdmFyIG1pbWVUeXBlID0gX3JlZi5taW1lVHlwZTtcbiAgICAgICAgICAgIHZhciB1cmwgPSBfcmVmLnVybDtcblxuICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX1BsYXllcjJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICB7IHJpY2g6IGZhbHNlLCBzdHlsZTogeyB3aWR0aDogNDAsIGhlaWdodDogNDAsIG1hcmdpbjogXCJhdXRvXCIgfSwgb25SZWFkeTogZnVuY3Rpb24gKCkge30gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnYScsIHsgdHlwZTogbWltZVR5cGUsIGhyZWY6IHVybCB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBCYWRnZTtcbn0pKF9yZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBCYWRnZTtcblxuZnVuY3Rpb24gZ3VpZCgpIHtcbiAgICByZXR1cm4gczQoKSArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgczQoKSArIHM0KCk7XG59XG5cbmZ1bmN0aW9uIHM0KCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3RSZWR1eCA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbnZhciBfcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1BsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XG5cbnZhciBfUGxheWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1BsYXllcik7XG5cbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKFwiaG9jXCIpO1xuXG52YXIgd2l0aFNlbGVjdGlvbiA9IF9QeWRpbyRyZXF1aXJlTGliLndpdGhTZWxlY3Rpb247XG52YXIgRWRpdG9yQWN0aW9ucyA9IF9QeWRpbyRyZXF1aXJlTGliLkVkaXRvckFjdGlvbnM7XG52YXIgd2l0aE1lbnUgPSBfUHlkaW8kcmVxdWlyZUxpYi53aXRoTWVudTtcbnZhciB3aXRoTG9hZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIud2l0aExvYWRlcjtcbnZhciB3aXRoRXJyb3JzID0gX1B5ZGlvJHJlcXVpcmVMaWIud2l0aEVycm9ycztcbnZhciB3aXRoQ29udHJvbHMgPSBfUHlkaW8kcmVxdWlyZUxpYi53aXRoQ29udHJvbHM7XG5cbnZhciBlZGl0b3JzID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkuUmVnaXN0cnkuZ2V0QWN0aXZlRXh0ZW5zaW9uQnlUeXBlKFwiZWRpdG9yXCIpO1xudmFyIGNvbmYgPSBlZGl0b3JzLmZpbHRlcihmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBpZCA9IF9yZWYuaWQ7XG4gICAgcmV0dXJuIGlkID09PSAnZWRpdG9yLnNvdW5kbWFuYWdlcic7XG59KVswXTtcblxudmFyIGdldFNlbGVjdGlvbkZpbHRlciA9IGZ1bmN0aW9uIGdldFNlbGVjdGlvbkZpbHRlcihub2RlKSB7XG4gICAgcmV0dXJuIGNvbmYubWltZXMuaW5kZXhPZihub2RlLmdldEFqeHBNaW1lKCkpID4gLTE7XG59O1xuXG52YXIgZ2V0U2VsZWN0aW9uID0gZnVuY3Rpb24gZ2V0U2VsZWN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uID0gW107XG5cbiAgICAgICAgbm9kZS5nZXRQYXJlbnQoKS5nZXRDaGlsZHJlbigpLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnB1c2goY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLmZpbHRlcihnZXRTZWxlY3Rpb25GaWx0ZXIpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmdldExhYmVsKCkubG9jYWxlQ29tcGFyZShiLmdldExhYmVsKCksIHVuZGVmaW5lZCwgeyBudW1lcmljOiB0cnVlIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIHNlbGVjdGlvbjogc2VsZWN0aW9uLFxuICAgICAgICAgICAgY3VycmVudEluZGV4OiBzZWxlY3Rpb24ucmVkdWNlKGZ1bmN0aW9uIChjdXJyZW50SW5kZXgsIGN1cnJlbnQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQgPT09IG5vZGUgJiYgaW5kZXggfHwgY3VycmVudEluZGV4O1xuICAgICAgICAgICAgfSwgMClcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG52YXIgc3R5bGVzID0ge1xuICAgIGNvbnRhaW5lcjoge1xuICAgICAgICBtYXJnaW46IFwiYXV0b1wiLFxuICAgICAgICBkaXNwbGF5OiBcImZsZXhcIixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLFxuICAgICAgICBmbGV4OiAxXG4gICAgfSxcbiAgICBwbGF5ZXI6IHtcbiAgICAgICAgbWFyZ2luOiBcImF1dG9cIlxuICAgIH0sXG4gICAgdGFibGU6IHtcbiAgICAgICAgd2lkdGg6IDMyMFxuICAgIH1cbn07XG5cbnZhciBFZGl0b3IgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRWRpdG9yLCBfQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIF9FZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKF9FZGl0b3IucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRWRpdG9yLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZE5vZGUodGhpcy5wcm9wcyk7XG4gICAgICAgICAgICB2YXIgZWRpdG9yTW9kaWZ5ID0gdGhpcy5wcm9wcy5lZGl0b3JNb2RpZnk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgZWRpdG9yTW9kaWZ5KHsgZml4ZWRUb29sYmFyOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGVkaXRvck1vZGlmeSA9IHRoaXMucHJvcHMuZWRpdG9yTW9kaWZ5O1xuXG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgZWRpdG9yTW9kaWZ5KHsgZml4ZWRUb29sYmFyOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXh0UHJvcHMubm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVybDogJycgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5sb2FkTm9kZShuZXh0UHJvcHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkTm9kZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkTm9kZShwcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZTogXCJhdWRpby9cIiArIG5vZGUuZ2V0QWp4cE1pbWUoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgXCJhdWRpby9cIiArIG5vZGUuZ2V0QWp4cE1pbWUoKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BsYXlOZXh0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBsYXlOZXh0KCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMucHJvcHMuc2VsZWN0aW9uO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnN0YXRlLm5vZGU7XG5cbiAgICAgICAgICAgIHZhciBpbmRleCA9IHNlbGVjdGlvbi5zZWxlY3Rpb24uaW5kZXhPZihub2RlKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IHNlbGVjdGlvbi5zZWxlY3Rpb24ubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Sb3dTZWxlY3Rpb24oW2luZGV4ICsgMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvblJvd1NlbGVjdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvblJvd1NlbGVjdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKCFkYXRhLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMucHJvcHMuc2VsZWN0aW9uO1xuXG4gICAgICAgICAgICBpZiAoIXNlbGVjdGlvbikgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVybDogbnVsbCB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLmxvYWROb2RlKHsgbm9kZTogc2VsZWN0aW9uLnNlbGVjdGlvbltkYXRhWzBdXSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcmVmMiA9IHRoaXMuc3RhdGUgfHwge307XG5cbiAgICAgICAgICAgIHZhciBtaW1lVHlwZSA9IF9yZWYyLm1pbWVUeXBlO1xuICAgICAgICAgICAgdmFyIHVybCA9IF9yZWYyLnVybDtcbiAgICAgICAgICAgIHZhciBub2RlID0gX3JlZjIubm9kZTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5jb250YWluZXIgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgekRlcHRoOiAzLCBzdHlsZTogc3R5bGVzLnBsYXllciB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCA2MHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX1BsYXllcjJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGF1dG9QbGF5OiB0cnVlLCByaWNoOiAhdGhpcy5wcm9wcy5pY29uICYmIHRoaXMucHJvcHMucmljaCwgb25SZWFkeTogdGhpcy5wcm9wcy5vbkxvYWQsIG9uRmluaXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQucGxheU5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdhJywgeyB0eXBlOiBtaW1lVHlwZSwgaHJlZjogdXJsIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNsZWFyOiAnYm90aCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogc3R5bGVzLnRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aVNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDI1MCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Sb3dTZWxlY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQub25Sb3dTZWxlY3Rpb24oZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5UYWJsZUJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlSb3dDaGVja2JveDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpcGVkUm93czogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNlbGVjdE9uQ2xpY2thd2F5OiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNlbGVjdGlvbiAmJiB0aGlzLnByb3BzLnNlbGVjdGlvbi5zZWxlY3Rpb24ubWFwKGZ1bmN0aW9uIChuLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRhYmxlUm93LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsga2V5OiBpbmRleCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5UYWJsZVJvd0NvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMTYsIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgJiYgbi5nZXRQYXRoKCkgPT09IG5vZGUuZ2V0UGF0aCgpID8gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLXBsYXlcIiB9KSA6IGluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFibGVSb3dDb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbi5nZXRMYWJlbCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgdmFyIF9FZGl0b3IgPSBFZGl0b3I7XG4gICAgRWRpdG9yID0gKDAsIF9yZWFjdFJlZHV4LmNvbm5lY3QpKG51bGwsIEVkaXRvckFjdGlvbnMpKEVkaXRvcikgfHwgRWRpdG9yO1xuICAgIEVkaXRvciA9IHdpdGhTZWxlY3Rpb24oZ2V0U2VsZWN0aW9uKShFZGl0b3IpIHx8IEVkaXRvcjtcbiAgICByZXR1cm4gRWRpdG9yO1xufSkoX3JlYWN0LkNvbXBvbmVudCk7XG5cbmZ1bmN0aW9uIGd1aWQoKSB7XG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xufVxuXG5mdW5jdGlvbiBzNCgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbn1cblxuZXhwb3J0c1snZGVmYXVsdCddID0gRWRpdG9yO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZShvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9ialsnZGVmYXVsdCddIDogb2JqOyB9XG5cbnZhciBfYmFkZ2UgPSByZXF1aXJlKCcuL2JhZGdlJyk7XG5cbmV4cG9ydHMuQmFkZ2UgPSBfaW50ZXJvcFJlcXVpcmUoX2JhZGdlKTtcblxudmFyIF9wcmV2aWV3ID0gcmVxdWlyZSgnLi9wcmV2aWV3Jyk7XG5cbmV4cG9ydHMuUGFuZWwgPSBfaW50ZXJvcFJlcXVpcmUoX3ByZXZpZXcpO1xuXG52YXIgX2VkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbmV4cG9ydHMuRWRpdG9yID0gX2ludGVyb3BSZXF1aXJlKF9lZGl0b3IpO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1BsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XG5cbnZhciBfUGxheWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1BsYXllcik7XG5cbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbi8vIFRoZSB0aHJlZVNpeHl0UGxheWVyIGlzIHRoZSBzYW1lIGZvciBhbGwgYmFkZ2VzXG52YXIgdGhyZWVTaXh0eVBsYXllciA9IG5ldyBUaHJlZVNpeHR5UGxheWVyKCk7XG5cbnZhciBQcmV2aWV3ID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFByZXZpZXcsIF9Db21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUHJldmlldygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFByZXZpZXcpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFByZXZpZXcucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUHJldmlldywgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWROb2RlKHRoaXMucHJvcHMpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE5vZGUobmV4dFByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZE5vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZE5vZGUocHJvcHMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgdmFyIG1pbWUgPSBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpO1xuXG4gICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5idWlsZFByZXNpZ25lZEdldFVybChub2RlLCBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgbWltZVR5cGU6IG1pbWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIG1pbWUpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cmw6IG5vZGUuZ2V0UGF0aCgpLFxuICAgICAgICAgICAgICAgIG1pbWVUeXBlOiBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmID0gdGhpcy5zdGF0ZSB8fCB7fTtcblxuICAgICAgICAgICAgdmFyIG1pbWVUeXBlID0gX3JlZi5taW1lVHlwZTtcbiAgICAgICAgICAgIHZhciB1cmwgPSBfcmVmLnVybDtcblxuICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX1BsYXllcjJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICB7IHJpY2g6IHRydWUsIHN0eWxlOiB7IG1hcmdpbjogXCJhdXRvXCIgfSwgb25SZWFkeTogZnVuY3Rpb24gKCkge30gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnYScsIHsgdHlwZTogbWltZVR5cGUsIGhyZWY6IHVybCB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQcmV2aWV3O1xufSkoX3JlYWN0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFByZXZpZXc7XG5cbmZ1bmN0aW9uIGd1aWQoKSB7XG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xufVxuXG5mdW5jdGlvbiBzNCgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLyoqXG4gKlxuICogU291bmRNYW5hZ2VyIDIgRGVtbzogMzYwLWRlZ3JlZSAvIFwiZG9udXQgcGxheWVyXCJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogaHR0cDovL3NjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL1xuICpcbiAqIEFuIGlubGluZSBwbGF5ZXIgd2l0aCBhIGNpcmN1bGFyIFVJLlxuICogQmFzZWQgb24gdGhlIG9yaWdpbmFsIFNNMiBpbmxpbmUgcGxheWVyLlxuICogSW5zcGlyZWQgYnkgQXBwbGUncyBwcmV2aWV3IGZlYXR1cmUgaW4gdGhlXG4gKiBpVHVuZXMgbXVzaWMgc3RvcmUgKGlQaG9uZSksIGFtb25nIG90aGVycy5cbiAqXG4gKiBSZXF1aXJlcyBTb3VuZE1hbmFnZXIgMiBKYXZhc2NyaXB0IEFQSS5cbiAqIEFsc28gdXNlcyBCZXJuaWUncyBCZXR0ZXIgQW5pbWF0aW9uIENsYXNzIChCU0QpOlxuICogaHR0cDovL3d3dy5iZXJuaWVjb2RlLmNvbS93cml0aW5nL2FuaW1hdG9yLmh0bWxcbiAqXG4qL1xuXG4vKmpzbGludCB3aGl0ZTogZmFsc2UsIG9uZXZhcjogdHJ1ZSwgdW5kZWY6IHRydWUsIG5vbWVuOiBmYWxzZSwgZXFlcWVxOiB0cnVlLCBwbHVzcGx1czogZmFsc2UsIGJpdHdpc2U6IHRydWUsIHJlZ2V4cDogZmFsc2UsIG5ld2NhcDogdHJ1ZSwgaW1tZWQ6IHRydWUgKi9cbi8qZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3csIHNvdW5kTWFuYWdlciwgbmF2aWdhdG9yICovXG5cbnZhciB0aHJlZVNpeHR5UGxheWVyLCAvLyBpbnN0YW5jZVxuICAgIFRocmVlU2l4dHlQbGF5ZXI7IC8vIGNvbnN0cnVjdG9yXG5cbihmdW5jdGlvbih3aW5kb3csIF91bmRlZmluZWQpIHtcblxuZnVuY3Rpb24gVGhyZWVTaXh0eVBsYXllcigpIHtcblxuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBwbCA9IHRoaXMsXG4gICAgICBzbSA9IHNvdW5kTWFuYWdlciwgLy8gc291bmRNYW5hZ2VyIGluc3RhbmNlXG4gICAgICB1QSA9IG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICBpc0lFID0gKHVBLm1hdGNoKC9tc2llL2kpKSxcbiAgICAgIGlzT3BlcmEgPSAodUEubWF0Y2goL29wZXJhL2kpKSxcbiAgICAgIGlzU2FmYXJpID0gKHVBLm1hdGNoKC9zYWZhcmkvaSkpLFxuICAgICAgaXNDaHJvbWUgPSAodUEubWF0Y2goL2Nocm9tZS9pKSksXG4gICAgICBpc0ZpcmVmb3ggPSAodUEubWF0Y2goL2ZpcmVmb3gvaSkpLFxuICAgICAgaXNUb3VjaERldmljZSA9ICh1QS5tYXRjaCgvaXBhZHxpcGhvbmUvaSkpLFxuICAgICAgaGFzUmVhbENhbnZhcyA9ICh0eXBlb2Ygd2luZG93Lkdfdm1sQ2FudmFzTWFuYWdlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJykgIT09ICd1bmRlZmluZWQnKSxcbiAgICAgIC8vIEkgZHVubm8gd2hhdCBPcGVyYSBkb2Vzbid0IGxpa2UgYWJvdXQgdGhpcy4gSSdtIHByb2JhYmx5IGRvaW5nIGl0IHdyb25nLlxuICAgICAgZnVsbENpcmNsZSA9IChpc09wZXJhfHxpc0Nocm9tZT8zNTkuOTozNjApO1xuXG4gIC8vIENTUyBjbGFzcyBmb3IgaWdub3JpbmcgTVAzIGxpbmtzXG4gIHRoaXMuZXhjbHVkZUNsYXNzID0gJ3RocmVlc2l4dHktZXhjbHVkZSc7XG4gIHRoaXMubGlua3MgPSBbXTtcbiAgdGhpcy5zb3VuZHMgPSBbXTtcbiAgdGhpcy5zb3VuZHNCeVVSTCA9IHt9O1xuICB0aGlzLmluZGV4QnlVUkwgPSB7fTtcbiAgdGhpcy5sYXN0U291bmQgPSBudWxsO1xuICB0aGlzLmxhc3RUb3VjaGVkU291bmQgPSBudWxsO1xuICB0aGlzLnNvdW5kQ291bnQgPSAwO1xuICB0aGlzLm9VSVRlbXBsYXRlID0gbnVsbDtcbiAgdGhpcy5vVUlJbWFnZU1hcCA9IG51bGw7XG4gIHRoaXMudnVNZXRlciA9IG51bGw7XG4gIHRoaXMuY2FsbGJhY2tDb3VudCA9IDA7XG4gIHRoaXMucGVha0RhdGFIaXN0b3J5ID0gW107XG5cbiAgLy8gMzYwcGxheWVyIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICB0aGlzLmNvbmZpZyA9IHtcblxuICAgIHBsYXlOZXh0OiBmYWxzZSwgICAvLyBzdG9wIGFmdGVyIG9uZSBzb3VuZCwgb3IgcGxheSB0aHJvdWdoIGxpc3QgdW50aWwgZW5kXG4gICAgYXV0b1BsYXk6IGZhbHNlLCAgIC8vIHN0YXJ0IHBsYXlpbmcgdGhlIGZpcnN0IHNvdW5kIHJpZ2h0IGF3YXlcbiAgICBhbGxvd011bHRpcGxlOiBmYWxzZSwgIC8vIGxldCBtYW55IHNvdW5kcyBwbGF5IGF0IG9uY2UgKGZhbHNlID0gb25seSBvbmUgc291bmQgcGxheWluZyBhdCBhIHRpbWUpXG4gICAgbG9hZFJpbmdDb2xvcjogJyNjY2MnLCAvLyBob3cgbXVjaCBoYXMgbG9hZGVkXG4gICAgcGxheVJpbmdDb2xvcjogJyMwMDAnLCAvLyBob3cgbXVjaCBoYXMgcGxheWVkXG4gICAgYmFja2dyb3VuZFJpbmdDb2xvcjogJyNlZWUnLCAvLyBjb2xvciBzaG93biB1bmRlcm5lYXRoIGxvYWQgKyBwbGF5IChcIm5vdCB5ZXQgbG9hZGVkXCIgY29sb3IpXG5cbiAgICAvLyBvcHRpb25hbCBzZWdtZW50L2Fubm90YXRpb24gKG1ldGFkYXRhKSBzdHVmZi4uXG4gICAgc2VnbWVudFJpbmdDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC4zMyknLCAvLyBtZXRhZGF0YS9hbm5vdGF0aW9uIChzZWdtZW50KSBjb2xvcnNcbiAgICBzZWdtZW50UmluZ0NvbG9yQWx0OiAncmdiYSgwLDAsMCwwLjEpJyxcbiAgICBsb2FkUmluZ0NvbG9yTWV0YWRhdGE6ICcjZGRkJywgLy8gXCJhbm5vdGF0aW9uc1wiIGxvYWQgY29sb3JcbiAgICBwbGF5UmluZ0NvbG9yTWV0YWRhdGE6ICdyZ2JhKDEyOCwxOTIsMjU2LDAuOSknLCAvLyBob3cgbXVjaCBoYXMgcGxheWVkIHdoZW4gbWV0YWRhdGEgaXMgcHJlc2VudFxuXG4gICAgY2lyY2xlRGlhbWV0ZXI6IG51bGwsIC8vIHNldCBkeW5hbWljYWxseSBhY2NvcmRpbmcgdG8gdmFsdWVzIGZyb20gQ1NTXG4gICAgY2lyY2xlUmFkaXVzOiBudWxsLFxuICAgIGFuaW1EdXJhdGlvbjogNTAwLFxuICAgIGFuaW1UcmFuc2l0aW9uOiB3aW5kb3cuQW5pbWF0b3IudHguYm91bmN5LCAvLyBodHRwOi8vd3d3LmJlcm5pZWNvZGUuY29tL3dyaXRpbmcvYW5pbWF0b3IuaHRtbFxuICAgIHNob3dITVNUaW1lOiBmYWxzZSwgLy8gaG91cnM6bWludXRlczpzZWNvbmRzIHZzLiBzZWNvbmRzLW9ubHlcbiAgICBzY2FsZUZvbnQ6IHRydWUsICAvLyBhbHNvIHNldCB0aGUgZm9udCBzaXplIChpZiBwb3NzaWJsZSkgd2hpbGUgYW5pbWF0aW5nIHRoZSBjaXJjbGVcblxuICAgIC8vIG9wdGlvbmFsOiBzcGVjdHJ1bSBvciBFUSBncmFwaCBpbiBjYW52YXMgKG5vdCBzdXBwb3J0ZWQgaW4gSUUgPDksIHRvbyBzbG93IHZpYSBFeENhbnZhcylcbiAgICB1c2VXYXZlZm9ybURhdGE6IGZhbHNlLFxuICAgIHdhdmVmb3JtRGF0YUNvbG9yOiAnIzAwOTlmZicsXG4gICAgd2F2ZWZvcm1EYXRhRG93bnNhbXBsZTogMywgLy8gdXNlIG9ubHkgb25lIGluIFggKG9mIGEgc2V0IG9mIDI1NiB2YWx1ZXMpIC0gMSBtZWFucyBhbGwgMjU2XG4gICAgd2F2ZWZvcm1EYXRhT3V0c2lkZTogZmFsc2UsXG4gICAgd2F2ZWZvcm1EYXRhQ29uc3RyYWluOiBmYWxzZSwgLy8gaWYgdHJ1ZSwgK3ZlIHZhbHVlcyBvbmx5IC0ga2VlcCB3aXRoaW4gaW5zaWRlIGNpcmNsZVxuICAgIHdhdmVmb3JtRGF0YUxpbmVSYXRpbzogMC42NCxcblxuICAgIC8vIFwic3BlY3RydW0gZnJlcXVlbmN5XCIgb3B0aW9uXG4gICAgdXNlRVFEYXRhOiBmYWxzZSxcbiAgICBlcURhdGFDb2xvcjogJyMzMzk5MzMnLFxuICAgIGVxRGF0YURvd25zYW1wbGU6IDQsIC8vIHVzZSBvbmx5IG9uZSBpbiBYIChvZiAyNTYgdmFsdWVzKVxuICAgIGVxRGF0YU91dHNpZGU6IHRydWUsXG4gICAgZXFEYXRhTGluZVJhdGlvOiAwLjU0LFxuXG4gICAgLy8gZW5hYmxlIFwiYW1wbGlmaWVyXCIgKGNhbnZhcyBwdWxzZXMgbGlrZSBhIHNwZWFrZXIpIGVmZmVjdFxuICAgIHVzZVBlYWtEYXRhOiB0cnVlLFxuICAgIHBlYWtEYXRhQ29sb3I6ICcjZmYzM2ZmJyxcbiAgICBwZWFrRGF0YU91dHNpZGU6IHRydWUsXG4gICAgcGVha0RhdGFMaW5lUmF0aW86IDAuNSxcblxuICAgIHVzZUFtcGxpZmllcjogdHJ1ZSwgLy8gXCJwdWxzZVwiIGxpa2UgYSBzcGVha2VyXG5cbiAgICBmb250U2l6ZU1heDogbnVsbCwgLy8gc2V0IGFjY29yZGluZyB0byBDU1NcblxuICAgIHVzZUZhdkljb246IGZhbHNlIC8vIEV4cGVyaW1lbnRhbCAoYWxzbyByZXF1aXJlcyB1c2VQZWFrRGF0YTogdHJ1ZSkuLiBUcnkgdG8gZHJhdyBhIFwiVlUgTWV0ZXJcIiBpbiB0aGUgZmF2aWNvbiBhcmVhLCBpZiBicm93c2VyIHN1cHBvcnRzIGl0IChGaXJlZm94ICsgT3BlcmEgYXMgb2YgMjAwOSlcblxuICB9O1xuXG4gIHRoaXMuY3NzID0ge1xuXG4gICAgLy8gQ1NTIGNsYXNzIG5hbWVzIGFwcGVuZGVkIHRvIGxpbmsgZHVyaW5nIHZhcmlvdXMgc3RhdGVzXG4gICAgc0RlZmF1bHQ6ICdzbTJfbGluaycsIC8vIGRlZmF1bHQgc3RhdGVcbiAgICBzQnVmZmVyaW5nOiAnc20yX2J1ZmZlcmluZycsXG4gICAgc1BsYXlpbmc6ICdzbTJfcGxheWluZycsXG4gICAgc1BhdXNlZDogJ3NtMl9wYXVzZWQnXG5cbiAgfTtcblxuICB0aGlzLmFkZEV2ZW50SGFuZGxlciA9ICh0eXBlb2Ygd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgIT09ICd1bmRlZmluZWQnID8gZnVuY3Rpb24obywgZXZ0TmFtZSwgZXZ0SGFuZGxlcikge1xuICAgIHJldHVybiBvLmFkZEV2ZW50TGlzdGVuZXIoZXZ0TmFtZSxldnRIYW5kbGVyLGZhbHNlKTtcbiAgfSA6IGZ1bmN0aW9uKG8sIGV2dE5hbWUsIGV2dEhhbmRsZXIpIHtcbiAgICBvLmF0dGFjaEV2ZW50KCdvbicrZXZ0TmFtZSxldnRIYW5kbGVyKTtcbiAgfSk7XG5cbiAgdGhpcy5yZW1vdmVFdmVudEhhbmRsZXIgPSAodHlwZW9mIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICE9PSAndW5kZWZpbmVkJyA/IGZ1bmN0aW9uKG8sIGV2dE5hbWUsIGV2dEhhbmRsZXIpIHtcbiAgICByZXR1cm4gby5yZW1vdmVFdmVudExpc3RlbmVyKGV2dE5hbWUsZXZ0SGFuZGxlcixmYWxzZSk7XG4gIH0gOiBmdW5jdGlvbihvLCBldnROYW1lLCBldnRIYW5kbGVyKSB7XG4gICAgcmV0dXJuIG8uZGV0YWNoRXZlbnQoJ29uJytldnROYW1lLGV2dEhhbmRsZXIpO1xuICB9KTtcblxuICB0aGlzLmhhc0NsYXNzID0gZnVuY3Rpb24obyxjU3RyKSB7XG4gICAgcmV0dXJuIHR5cGVvZihvLmNsYXNzTmFtZSkhPT0ndW5kZWZpbmVkJz9vLmNsYXNzTmFtZS5tYXRjaChuZXcgUmVnRXhwKCcoXFxcXHN8XiknK2NTdHIrJyhcXFxcc3wkKScpKTpmYWxzZTtcbiAgfTtcblxuICB0aGlzLmFkZENsYXNzID0gZnVuY3Rpb24obyxjU3RyKSB7XG5cbiAgICBpZiAoIW8gfHwgIWNTdHIgfHwgc2VsZi5oYXNDbGFzcyhvLGNTdHIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG8uY2xhc3NOYW1lID0gKG8uY2xhc3NOYW1lP28uY2xhc3NOYW1lKycgJzonJykrY1N0cjtcblxuICB9O1xuXG4gIHRoaXMucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihvLGNTdHIpIHtcblxuICAgIGlmICghbyB8fCAhY1N0ciB8fCAhc2VsZi5oYXNDbGFzcyhvLGNTdHIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG8uY2xhc3NOYW1lID0gby5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoICcrY1N0cisnKXwoJytjU3RyKycpJywnZycpLCcnKTtcblxuICB9O1xuXG4gIHRoaXMuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSA9IGZ1bmN0aW9uKGNsYXNzTmFtZSx0YWdOYW1lcyxvUGFyZW50KSB7XG5cbiAgICB2YXIgZG9jID0gKG9QYXJlbnR8fGRvY3VtZW50KSxcbiAgICAgICAgbWF0Y2hlcyA9IFtdLCBpLGosIG5vZGVzID0gW107XG4gICAgaWYgKHR5cGVvZiB0YWdOYW1lcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHRhZ05hbWVzICE9PSAnc3RyaW5nJykge1xuICAgICAgZm9yIChpPXRhZ05hbWVzLmxlbmd0aDsgaS0tOykge1xuICAgICAgICBpZiAoIW5vZGVzIHx8ICFub2Rlc1t0YWdOYW1lc1tpXV0pIHtcbiAgICAgICAgICBub2Rlc1t0YWdOYW1lc1tpXV0gPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWdOYW1lcykge1xuICAgICAgbm9kZXMgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlcyA9IGRvYy5hbGx8fGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mKHRhZ05hbWVzKSE9PSdzdHJpbmcnKSB7XG4gICAgICBmb3IgKGk9dGFnTmFtZXMubGVuZ3RoOyBpLS07KSB7XG4gICAgICAgIGZvciAoaj1ub2Rlc1t0YWdOYW1lc1tpXV0ubGVuZ3RoOyBqLS07KSB7XG4gICAgICAgICAgaWYgKHNlbGYuaGFzQ2xhc3Mobm9kZXNbdGFnTmFtZXNbaV1dW2pdLGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgIG1hdGNoZXMucHVzaChub2Rlc1t0YWdOYW1lc1tpXV1bal0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGk9MDsgaTxub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5oYXNDbGFzcyhub2Rlc1tpXSxjbGFzc05hbWUpKSB7XG4gICAgICAgICAgbWF0Y2hlcy5wdXNoKG5vZGVzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlcztcblxuICB9O1xuXG4gIHRoaXMuZ2V0UGFyZW50QnlOb2RlTmFtZSA9IGZ1bmN0aW9uKG9DaGlsZCxzUGFyZW50Tm9kZU5hbWUpIHtcblxuICAgIGlmICghb0NoaWxkIHx8ICFzUGFyZW50Tm9kZU5hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc1BhcmVudE5vZGVOYW1lID0gc1BhcmVudE5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgd2hpbGUgKG9DaGlsZC5wYXJlbnROb2RlICYmIHNQYXJlbnROb2RlTmFtZSAhPT0gb0NoaWxkLnBhcmVudE5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgb0NoaWxkID0gb0NoaWxkLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiAob0NoaWxkLnBhcmVudE5vZGUgJiYgc1BhcmVudE5vZGVOYW1lID09PSBvQ2hpbGQucGFyZW50Tm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpP29DaGlsZC5wYXJlbnROb2RlOm51bGwpO1xuXG4gIH07XG5cbiAgdGhpcy5nZXRQYXJlbnRCeUNsYXNzTmFtZSA9IGZ1bmN0aW9uKG9DaGlsZCxzUGFyZW50Q2xhc3NOYW1lKSB7XG5cbiAgICBpZiAoIW9DaGlsZCB8fCAhc1BhcmVudENsYXNzTmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB3aGlsZSAob0NoaWxkLnBhcmVudE5vZGUgJiYgIXNlbGYuaGFzQ2xhc3Mob0NoaWxkLnBhcmVudE5vZGUsc1BhcmVudENsYXNzTmFtZSkpIHtcbiAgICAgIG9DaGlsZCA9IG9DaGlsZC5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gKG9DaGlsZC5wYXJlbnROb2RlICYmIHNlbGYuaGFzQ2xhc3Mob0NoaWxkLnBhcmVudE5vZGUsc1BhcmVudENsYXNzTmFtZSk/b0NoaWxkLnBhcmVudE5vZGU6bnVsbCk7XG5cbiAgfTtcblxuICB0aGlzLmdldFNvdW5kQnlVUkwgPSBmdW5jdGlvbihzVVJMKSB7XG4gICAgcmV0dXJuICh0eXBlb2Ygc2VsZi5zb3VuZHNCeVVSTFtzVVJMXSAhPT0gJ3VuZGVmaW5lZCc/c2VsZi5zb3VuZHNCeVVSTFtzVVJMXTpudWxsKTtcbiAgfTtcblxuICB0aGlzLmlzQ2hpbGRPZk5vZGUgPSBmdW5jdGlvbihvLHNOb2RlTmFtZSkge1xuXG4gICAgaWYgKCFvIHx8ICFvLnBhcmVudE5vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc05vZGVOYW1lID0gc05vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgZG8ge1xuICAgICAgbyA9IG8ucGFyZW50Tm9kZTtcbiAgICB9IHdoaWxlIChvICYmIG8ucGFyZW50Tm9kZSAmJiBvLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHNOb2RlTmFtZSk7XG4gICAgcmV0dXJuIChvICYmIG8ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gc05vZGVOYW1lP286bnVsbCk7XG5cbiAgfTtcblxuICB0aGlzLmlzQ2hpbGRPZkNsYXNzID0gZnVuY3Rpb24ob0NoaWxkLG9DbGFzcykge1xuXG4gICAgaWYgKCFvQ2hpbGQgfHwgIW9DbGFzcykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB3aGlsZSAob0NoaWxkLnBhcmVudE5vZGUgJiYgIXNlbGYuaGFzQ2xhc3Mob0NoaWxkLG9DbGFzcykpIHtcbiAgICAgIG9DaGlsZCA9IHNlbGYuZmluZFBhcmVudChvQ2hpbGQpO1xuICAgIH1cbiAgICByZXR1cm4gKHNlbGYuaGFzQ2xhc3Mob0NoaWxkLG9DbGFzcykpO1xuXG4gIH07XG5cbiAgdGhpcy5maW5kUGFyZW50ID0gZnVuY3Rpb24obykge1xuXG4gICAgaWYgKCFvIHx8ICFvLnBhcmVudE5vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbyA9IG8ucGFyZW50Tm9kZTtcbiAgICBpZiAoby5ub2RlVHlwZSA9PT0gMikge1xuICAgICAgd2hpbGUgKG8gJiYgby5wYXJlbnROb2RlICYmIG8ucGFyZW50Tm9kZS5ub2RlVHlwZSA9PT0gMikge1xuICAgICAgICBvID0gby5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbztcblxuICB9O1xuXG4gIHRoaXMuZ2V0U3R5bGUgPSBmdW5jdGlvbihvLHNQcm9wKSB7XG5cbiAgICAvLyBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL2RvbS9nZXRzdHlsZXMuaHRtbFxuICAgIHRyeSB7XG4gICAgICBpZiAoby5jdXJyZW50U3R5bGUpIHtcbiAgICAgICAgcmV0dXJuIG8uY3VycmVudFN0eWxlW3NQcm9wXTtcbiAgICAgIH0gZWxzZSBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUobyxudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHNQcm9wKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIC8vIG9oIHdlbGxcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG5cbiAgfTtcblxuICB0aGlzLmZpbmRYWSA9IGZ1bmN0aW9uKG9iaikge1xuXG4gICAgdmFyIGN1cmxlZnQgPSAwLCBjdXJ0b3AgPSAwO1xuICAgIGRvIHtcbiAgICAgIGN1cmxlZnQgKz0gb2JqLm9mZnNldExlZnQ7XG4gICAgICBjdXJ0b3AgKz0gb2JqLm9mZnNldFRvcDtcbiAgICB9IHdoaWxlICghIShvYmogPSBvYmoub2Zmc2V0UGFyZW50KSk7XG4gICAgcmV0dXJuIFtjdXJsZWZ0LGN1cnRvcF07XG5cbiAgfTtcblxuICB0aGlzLmdldE1vdXNlWFkgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvLyBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL2pzL2V2ZW50c19wcm9wZXJ0aWVzLmh0bWxcbiAgICBlID0gZT9lOndpbmRvdy5ldmVudDtcbiAgICBpZiAoaXNUb3VjaERldmljZSAmJiBlLnRvdWNoZXMpIHtcbiAgICAgIGUgPSBlLnRvdWNoZXNbMF07XG4gICAgfVxuICAgIGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIHtcbiAgICAgIHJldHVybiBbZS5wYWdlWCxlLnBhZ2VZXTtcbiAgICB9IGVsc2UgaWYgKGUuY2xpZW50WCB8fCBlLmNsaWVudFkpIHtcbiAgICAgIHJldHVybiBbZS5jbGllbnRYK3NlbGYuZ2V0U2Nyb2xsTGVmdCgpLGUuY2xpZW50WStzZWxmLmdldFNjcm9sbFRvcCgpXTtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmdldFNjcm9sbExlZnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCk7XG4gIH07XG5cbiAgdGhpcy5nZXRTY3JvbGxUb3AgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wK2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApO1xuICB9O1xuXG4gIHRoaXMuZXZlbnRzID0ge1xuXG4gICAgLy8gaGFuZGxlcnMgZm9yIHNvdW5kIGV2ZW50cyBhcyB0aGV5J3JlIHN0YXJ0ZWQvc3RvcHBlZC9wbGF5ZWRcblxuICAgIHBsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihwbC5jb25maWcub25wbGF5KXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbnBsYXkodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIHBsLnJlbW92ZUNsYXNzKHRoaXMuXzM2MGRhdGEub1VJQm94LHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lKTtcbiAgICAgIHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lID0gcGwuY3NzLnNQbGF5aW5nO1xuICAgICAgcGwuYWRkQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gsdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUpO1xuICAgICAgc2VsZi5mYW5PdXQodGhpcyk7XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihwbC5jb25maWcub25zdG9wKXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbnN0b3AodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIHBsLnJlbW92ZUNsYXNzKHRoaXMuXzM2MGRhdGEub1VJQm94LHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lKTtcbiAgICAgIHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lID0gJyc7XG4gICAgICBzZWxmLmZhbkluKHRoaXMpO1xuICAgIH0sXG5cbiAgICBwYXVzZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKHBsLmNvbmZpZy5vbnBhdXNlKXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbnBhdXNlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICBwbC5yZW1vdmVDbGFzcyh0aGlzLl8zNjBkYXRhLm9VSUJveCx0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSk7XG4gICAgICB0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSA9IHBsLmNzcy5zUGF1c2VkO1xuICAgICAgcGwuYWRkQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gsdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUpO1xuICAgIH0sXG5cbiAgICByZXN1bWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihwbC5jb25maWcub25yZXN1bWUpe1xuICAgICAgICAgICAgcGwuY29uZmlnLm9ucmVzdW1lKHRoaXMpO1xuICAgICAgICB9XG4gICAgICBwbC5yZW1vdmVDbGFzcyh0aGlzLl8zNjBkYXRhLm9VSUJveCx0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSk7XG4gICAgICB0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSA9IHBsLmNzcy5zUGxheWluZztcbiAgICAgIHBsLmFkZENsYXNzKHRoaXMuXzM2MGRhdGEub1VJQm94LHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lKTtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXh0TGluaztcbiAgICAgICAgaWYocGwuY29uZmlnLm9uZmluaXNoKXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbmZpbmlzaCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgcGwucmVtb3ZlQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gsdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUpO1xuICAgICAgdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUgPSAnJztcbiAgICAgIC8vIHNlbGYuY2xlYXJDYW52YXModGhpcy5fMzYwZGF0YS5vQ2FudmFzKTtcbiAgICAgIHRoaXMuXzM2MGRhdGEuZGlkRmluaXNoID0gdHJ1ZTsgLy8gc28gZmFuIGRyYXdzIGZ1bGwgY2lyY2xlXG4gICAgICBzZWxmLmZhbkluKHRoaXMpO1xuICAgICAgaWYgKHBsLmNvbmZpZy5wbGF5TmV4dCkge1xuICAgICAgICBuZXh0TGluayA9IChwbC5pbmRleEJ5VVJMW3RoaXMuXzM2MGRhdGEub0xpbmsuaHJlZl0rMSk7XG4gICAgICAgIGlmIChuZXh0TGluazxwbC5saW5rcy5sZW5ndGgpIHtcbiAgICAgICAgICBwbC5oYW5kbGVDbGljayh7J3RhcmdldCc6cGwubGlua3NbbmV4dExpbmtdfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgd2hpbGVsb2FkaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgICBzZWxmLnVwZGF0ZVBsYXlpbmcuYXBwbHkodGhpcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHdoaWxlcGxheWluZzogZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLnVwZGF0ZVBsYXlpbmcuYXBwbHkodGhpcyk7XG4gICAgICB0aGlzLl8zNjBkYXRhLmZwcysrO1xuICAgIH0sXG5cbiAgICBidWZmZXJjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaXNCdWZmZXJpbmcpIHtcbiAgICAgICAgcGwuYWRkQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gscGwuY3NzLnNCdWZmZXJpbmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGwucmVtb3ZlQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gscGwuY3NzLnNCdWZmZXJpbmcpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMuc3RvcEV2ZW50ID0gZnVuY3Rpb24oZSkge1xuXG4gICBpZiAodHlwZW9mIGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBlLnByZXZlbnREZWZhdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdy5ldmVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5ldmVudC5yZXR1cm5WYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICB0aGlzLmdldFRoZURhbW5MaW5rID0gKGlzSUUpP2Z1bmN0aW9uKGUpIHtcbiAgICAvLyBJIHJlYWxseSBkaWRuJ3Qgd2FudCB0byBoYXZlIHRvIGRvIHRoaXMuXG4gICAgcmV0dXJuIChlICYmIGUudGFyZ2V0P2UudGFyZ2V0OndpbmRvdy5ldmVudC5zcmNFbGVtZW50KTtcbiAgfTpmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGUudGFyZ2V0O1xuICB9O1xuXG4gIHRoaXMuaGFuZGxlQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvLyBhIHNvdW5kIGxpbmsgd2FzIGNsaWNrZWRcbiAgICBpZiAoZS5idXR0b24gPiAxKSB7XG4gICAgICAvLyBvbmx5IGNhdGNoIGxlZnQtY2xpY2tzXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgbyA9IHNlbGYuZ2V0VGhlRGFtbkxpbmsoZSksXG4gICAgICAgIHNVUkwsIHNvdW5kVVJMLCB0aGlzU291bmQsIG9Db250YWluZXIsIGhhc192aXMsIGRpYW1ldGVyO1xuXG4gICAgaWYgKG8ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2EnKSB7XG4gICAgICBvID0gc2VsZi5pc0NoaWxkT2ZOb2RlKG8sJ2EnKTtcbiAgICAgIGlmICghbykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuaXNDaGlsZE9mQ2xhc3MobywndWkzNjAnKSkge1xuICAgICAgLy8gbm90IGEgbGluayB3ZSdyZSBpbnRlcmVzdGVkIGluXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBzVVJMID0gby5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgIGlmICghby5ocmVmIHx8ICFzbS5jYW5QbGF5TGluayhvKSB8fCBzZWxmLmhhc0NsYXNzKG8sc2VsZi5leGNsdWRlQ2xhc3MpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTsgLy8gcGFzcy10aHJ1IGZvciBub24tTVAzL25vbi1saW5rc1xuICAgIH1cblxuICAgIHNtLl93cml0ZURlYnVnKCdoYW5kbGVDbGljaygpJyk7XG4gICAgc291bmRVUkwgPSAoby5ocmVmKTtcbiAgICB0aGlzU291bmQgPSBzZWxmLmdldFNvdW5kQnlVUkwoc291bmRVUkwpO1xuXG4gICAgaWYgKHRoaXNTb3VuZCkge1xuXG4gICAgICAvLyBhbHJlYWR5IGV4aXN0c1xuICAgICAgaWYgKHRoaXNTb3VuZCA9PT0gc2VsZi5sYXN0U291bmQpIHtcbiAgICAgICAgLy8gYW5kIHdhcyBwbGF5aW5nIChvciBwYXVzZWQpXG4gICAgICAgIHRoaXNTb3VuZC50b2dnbGVQYXVzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGlmZmVyZW50IHNvdW5kXG4gICAgICAgIHRoaXNTb3VuZC50b2dnbGVQYXVzZSgpOyAvLyBzdGFydCBwbGF5aW5nIGN1cnJlbnRcbiAgICAgICAgc20uX3dyaXRlRGVidWcoJ3NvdW5kIGRpZmZlcmVudCB0aGFuIGxhc3Qgc291bmQ6ICcrc2VsZi5sYXN0U291bmQuc0lEKTtcbiAgICAgICAgaWYgKCFzZWxmLmNvbmZpZy5hbGxvd011bHRpcGxlICYmIHNlbGYubGFzdFNvdW5kKSB7XG4gICAgICAgICAgc2VsZi5zdG9wU291bmQoc2VsZi5sYXN0U291bmQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyBhcHBlbmQgc29tZSBkb20gc2hpeiwgbWFrZSBub2lzZVxuXG4gICAgICBvQ29udGFpbmVyID0gby5wYXJlbnROb2RlO1xuICAgICAgaGFzX3ZpcyA9IChzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3VpMzYwLXZpcycsJ2Rpdicsb0NvbnRhaW5lci5wYXJlbnROb2RlKS5sZW5ndGgpO1xuXG4gICAgICAvLyBjcmVhdGUgc291bmRcbiAgICAgIHRoaXNTb3VuZCA9IHNtLmNyZWF0ZVNvdW5kKHtcbiAgICAgICBpZDondWkzNjBTb3VuZF8nK3BhcnNlSW50KE1hdGgucmFuZG9tKCkqMTAwMDAwMDApLFxuICAgICAgIHVybDpzb3VuZFVSTCxcbiAgICAgICBvbnBsYXk6c2VsZi5ldmVudHMucGxheSxcbiAgICAgICBvbnN0b3A6c2VsZi5ldmVudHMuc3RvcCxcbiAgICAgICBvbnBhdXNlOnNlbGYuZXZlbnRzLnBhdXNlLFxuICAgICAgIG9ucmVzdW1lOnNlbGYuZXZlbnRzLnJlc3VtZSxcbiAgICAgICBvbmZpbmlzaDpzZWxmLmV2ZW50cy5maW5pc2gsXG4gICAgICAgb25idWZmZXJjaGFuZ2U6c2VsZi5ldmVudHMuYnVmZmVyY2hhbmdlLFxuICAgICAgIHdoaWxlbG9hZGluZzpzZWxmLmV2ZW50cy53aGlsZWxvYWRpbmcsXG4gICAgICAgd2hpbGVwbGF5aW5nOnNlbGYuZXZlbnRzLndoaWxlcGxheWluZyxcbiAgICAgICB1c2VXYXZlZm9ybURhdGE6KGhhc192aXMgJiYgc2VsZi5jb25maWcudXNlV2F2ZWZvcm1EYXRhKSxcbiAgICAgICB1c2VFUURhdGE6KGhhc192aXMgJiYgc2VsZi5jb25maWcudXNlRVFEYXRhKSxcbiAgICAgICB1c2VQZWFrRGF0YTooaGFzX3ZpcyAmJiBzZWxmLmNvbmZpZy51c2VQZWFrRGF0YSlcbiAgICAgIH0pO1xuXG4gICAgICAvLyB0YWNrIG9uIHNvbWUgY3VzdG9tIGRhdGFcblxuICAgICAgZGlhbWV0ZXIgPSBwYXJzZUludChzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NtMi0zNjB1aScsJ2Rpdicsb0NvbnRhaW5lcilbMF0ub2Zmc2V0V2lkdGgsIDEwKTtcblxuICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhID0ge1xuICAgICAgICBvVUkzNjA6IHNlbGYuZ2V0UGFyZW50QnlDbGFzc05hbWUobywndWkzNjAnKSwgLy8gdGhlICh3aG9sZSkgZW50aXJlIGNvbnRhaW5lclxuICAgICAgICBvTGluazogbywgLy8gRE9NIG5vZGUgZm9yIHJlZmVyZW5jZSB3aXRoaW4gU00yIG9iamVjdCBldmVudCBoYW5kbGVyc1xuICAgICAgICBjbGFzc05hbWU6IHNlbGYuY3NzLnNQbGF5aW5nLFxuICAgICAgICBvVUlCb3g6IHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc20yLTM2MHVpJywnZGl2JyxvQ29udGFpbmVyKVswXSxcbiAgICAgICAgb0NhbnZhczogc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItY2FudmFzJywnY2FudmFzJyxvQ29udGFpbmVyKVswXSxcbiAgICAgICAgb0J1dHRvbjogc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItMzYwYnRuJywnc3Bhbicsb0NvbnRhaW5lcilbMF0sXG4gICAgICAgIG9UaW1pbmc6IHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc20yLXRpbWluZycsJ2Rpdicsb0NvbnRhaW5lcilbMF0sXG4gICAgICAgIG9Db3Zlcjogc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItY292ZXInLCdkaXYnLG9Db250YWluZXIpWzBdLFxuICAgICAgICBjaXJjbGVEaWFtZXRlcjogZGlhbWV0ZXIsXG4gICAgICAgIGNpcmNsZVJhZGl1czogZGlhbWV0ZXIvMixcbiAgICAgICAgbGFzdFRpbWU6IG51bGwsXG4gICAgICAgIGRpZEZpbmlzaDogbnVsbCxcbiAgICAgICAgcGF1c2VDb3VudDowLFxuICAgICAgICByYWRpdXM6MCxcbiAgICAgICAgZm9udFNpemU6IDEsXG4gICAgICAgIGZvbnRTaXplTWF4OiBzZWxmLmNvbmZpZy5mb250U2l6ZU1heCxcbiAgICAgICAgc2NhbGVGb250OiAoaGFzX3ZpcyAmJiBzZWxmLmNvbmZpZy5zY2FsZUZvbnQpLFxuICAgICAgICBzaG93SE1TVGltZTogaGFzX3ZpcyxcbiAgICAgICAgYW1wbGlmaWVyOiAoaGFzX3ZpcyAmJiBzZWxmLmNvbmZpZy51c2VQZWFrRGF0YT8wLjk6MSksIC8vIFRPRE86IHgxIGlmIG5vdCBiZWluZyB1c2VkLCBlbHNlIHVzZSBkeW5hbWljIFwiaG93IG11Y2ggdG8gYW1wbGlmeSBieVwiIHZhbHVlXG4gICAgICAgIHJhZGl1c01heDogZGlhbWV0ZXIqMC4xNzUsIC8vIGNpcmNsZSByYWRpdXNcbiAgICAgICAgd2lkdGg6MCxcbiAgICAgICAgd2lkdGhNYXg6IGRpYW1ldGVyKjAuNCwgLy8gd2lkdGggb2YgdGhlIG91dGVyIHJpbmdcbiAgICAgICAgbGFzdFZhbHVlczoge1xuICAgICAgICAgIGJ5dGVzTG9hZGVkOiAwLFxuICAgICAgICAgIGJ5dGVzVG90YWw6IDAsXG4gICAgICAgICAgcG9zaXRpb246IDAsXG4gICAgICAgICAgZHVyYXRpb25Fc3RpbWF0ZTogMFxuICAgICAgICB9LCAvLyB1c2VkIHRvIHRyYWNrIFwibGFzdCBnb29kIGtub3duXCIgdmFsdWVzIGJlZm9yZSBzb3VuZCBmaW5pc2gvcmVzZXQgZm9yIGFuaW1cbiAgICAgICAgYW5pbWF0aW5nOiBmYWxzZSxcbiAgICAgICAgb0FuaW06IG5ldyB3aW5kb3cuQW5pbWF0b3Ioe1xuICAgICAgICAgIGR1cmF0aW9uOiBzZWxmLmNvbmZpZy5hbmltRHVyYXRpb24sXG4gICAgICAgICAgdHJhbnNpdGlvbjpzZWxmLmNvbmZpZy5hbmltVHJhbnNpdGlvbixcbiAgICAgICAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIHZhciB0aGlzU291bmQgPSB0aGlzO1xuICAgICAgICAgICAgLy8gdGhpc1NvdW5kLl8zNjBkYXRhLmRpZEZpbmlzaCA9IGZhbHNlOyAvLyByZXNldCBmdWxsIGNpcmNsZVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIG9BbmltUHJvZ3Jlc3M6IGZ1bmN0aW9uKG5Qcm9ncmVzcykge1xuICAgICAgICAgIHZhciB0aGlzU291bmQgPSB0aGlzO1xuICAgICAgICAgIHRoaXNTb3VuZC5fMzYwZGF0YS5yYWRpdXMgPSBwYXJzZUludCh0aGlzU291bmQuXzM2MGRhdGEucmFkaXVzTWF4KnRoaXNTb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIqblByb2dyZXNzLCAxMCk7XG4gICAgICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLndpZHRoID0gcGFyc2VJbnQodGhpc1NvdW5kLl8zNjBkYXRhLndpZHRoTWF4KnRoaXNTb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIqblByb2dyZXNzLCAxMCk7XG4gICAgICAgICAgaWYgKHRoaXNTb3VuZC5fMzYwZGF0YS5zY2FsZUZvbnQgJiYgdGhpc1NvdW5kLl8zNjBkYXRhLmZvbnRTaXplTWF4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzU291bmQuXzM2MGRhdGEub1RpbWluZy5zdHlsZS5mb250U2l6ZSA9IHBhcnNlSW50KE1hdGgubWF4KDEsdGhpc1NvdW5kLl8zNjBkYXRhLmZvbnRTaXplTWF4Km5Qcm9ncmVzcyksIDEwKSsncHgnO1xuICAgICAgICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLm9UaW1pbmcuc3R5bGUub3BhY2l0eSA9IG5Qcm9ncmVzcztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXNTb3VuZC5wYXVzZWQgfHwgdGhpc1NvdW5kLnBsYXlTdGF0ZSA9PT0gMCB8fCB0aGlzU291bmQuXzM2MGRhdGEubGFzdFZhbHVlcy5ieXRlc0xvYWRlZCA9PT0gMCB8fCB0aGlzU291bmQuXzM2MGRhdGEubGFzdFZhbHVlcy5wb3NpdGlvbiA9PT0gMCkge1xuICAgICAgICAgICAgc2VsZi51cGRhdGVQbGF5aW5nLmFwcGx5KHRoaXNTb3VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmcHM6IDBcbiAgICAgIH07XG5cbiAgICAgIC8vIFwiTWV0YWRhdGFcIiAoYW5ub3RhdGlvbnMpXG4gICAgICBpZiAodHlwZW9mIHNlbGYuTWV0YWRhdGEgIT09ICd1bmRlZmluZWQnICYmIHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWV0YWRhdGEnLCdkaXYnLHRoaXNTb3VuZC5fMzYwZGF0YS5vVUkzNjApLmxlbmd0aCkge1xuICAgICAgICB0aGlzU291bmQuXzM2MGRhdGEubWV0YWRhdGEgPSBuZXcgc2VsZi5NZXRhZGF0YSh0aGlzU291bmQsc2VsZik7XG4gICAgICB9XG5cbiAgICAgIC8vIG1pbmltaXplIHplIGZvbnRcbiAgICAgIGlmICh0aGlzU291bmQuXzM2MGRhdGEuc2NhbGVGb250ICYmIHRoaXNTb3VuZC5fMzYwZGF0YS5mb250U2l6ZU1heCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzU291bmQuXzM2MGRhdGEub1RpbWluZy5zdHlsZS5mb250U2l6ZSA9ICcxcHgnO1xuICAgICAgfVxuXG4gICAgICAvLyBzZXQgdXAgemUgYW5pbWF0aW9uXG4gICAgICB0aGlzU291bmQuXzM2MGRhdGEub0FuaW0uYWRkU3ViamVjdCh0aGlzU291bmQuXzM2MGRhdGEub0FuaW1Qcm9ncmVzcyx0aGlzU291bmQpO1xuXG4gICAgICAvLyBhbmltYXRlIHRoZSByYWRpdXMgb3V0IG5pY2VcbiAgICAgIHNlbGYucmVmcmVzaENvb3Jkcyh0aGlzU291bmQpO1xuXG4gICAgICBzZWxmLnVwZGF0ZVBsYXlpbmcuYXBwbHkodGhpc1NvdW5kKTtcblxuICAgICAgc2VsZi5zb3VuZHNCeVVSTFtzb3VuZFVSTF0gPSB0aGlzU291bmQ7XG4gICAgICBzZWxmLnNvdW5kcy5wdXNoKHRoaXNTb3VuZCk7XG4gICAgICBpZiAoIXNlbGYuY29uZmlnLmFsbG93TXVsdGlwbGUgJiYgc2VsZi5sYXN0U291bmQpIHtcbiAgICAgICAgc2VsZi5zdG9wU291bmQoc2VsZi5sYXN0U291bmQpO1xuICAgICAgfVxuICAgICAgdGhpc1NvdW5kLnBsYXkoKTtcblxuICAgIH1cblxuICAgIHNlbGYubGFzdFNvdW5kID0gdGhpc1NvdW5kOyAvLyByZWZlcmVuY2UgZm9yIG5leHQgY2FsbFxuXG4gICAgaWYgKHR5cGVvZiBlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZS5wcmV2ZW50RGVmYXVsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuZXZlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIH07XG5cbiAgdGhpcy5mYW5PdXQgPSBmdW5jdGlvbihvU291bmQpIHtcblxuICAgICB2YXIgdGhpc1NvdW5kID0gb1NvdW5kO1xuICAgICBpZiAodGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9PT0gMSkge1xuICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgfVxuICAgICB0aGlzU291bmQuXzM2MGRhdGEuYW5pbWF0aW5nID0gMDtcbiAgICAgc291bmRNYW5hZ2VyLl93cml0ZURlYnVnKCdmYW5PdXQ6ICcrdGhpc1NvdW5kLnNJRCsnOiAnK3RoaXNTb3VuZC5fMzYwZGF0YS5vTGluay5ocmVmKTtcbiAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLm9BbmltLnNlZWtUbygxKTsgLy8gcGxheSB0byBlbmRcbiAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgLy8gb25jb21wbGV0ZSBoYWNrXG4gICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9IDA7XG4gICAgIH0sc2VsZi5jb25maWcuYW5pbUR1cmF0aW9uKzIwKTtcblxuICB9O1xuXG4gIHRoaXMuZmFuSW4gPSBmdW5jdGlvbihvU291bmQpIHtcblxuICAgICB2YXIgdGhpc1NvdW5kID0gb1NvdW5kO1xuICAgICBpZiAodGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9PT0gLTEpIHtcbiAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgIH1cbiAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9IC0xO1xuICAgICBzb3VuZE1hbmFnZXIuX3dyaXRlRGVidWcoJ2ZhbkluOiAnK3RoaXNTb3VuZC5zSUQrJzogJyt0aGlzU291bmQuXzM2MGRhdGEub0xpbmsuaHJlZik7XG4gICAgIC8vIG1hc3NpdmUgaGFja1xuICAgICB0aGlzU291bmQuXzM2MGRhdGEub0FuaW0uc2Vla1RvKDApOyAvLyBwbGF5IHRvIGVuZFxuICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAvLyByZXNldCBmdWxsIDM2MCBmaWxsIGFmdGVyIGFuaW1hdGlvbiBoYXMgY29tcGxldGVkIChvbmNvbXBsZXRlIGhhY2spXG4gICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLmRpZEZpbmlzaCA9IGZhbHNlO1xuICAgICAgIHRoaXNTb3VuZC5fMzYwZGF0YS5hbmltYXRpbmcgPSAwO1xuICAgICAgIHNlbGYucmVzZXRMYXN0VmFsdWVzKHRoaXNTb3VuZCk7XG4gICAgIH0sIHNlbGYuY29uZmlnLmFuaW1EdXJhdGlvbisyMCk7XG5cbiAgfTtcblxuICB0aGlzLnJlc2V0TGFzdFZhbHVlcyA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xuICAgIG9Tb3VuZC5fMzYwZGF0YS5sYXN0VmFsdWVzLnBvc2l0aW9uID0gMDtcbiAgfTtcblxuICB0aGlzLnJlZnJlc2hDb29yZHMgPSBmdW5jdGlvbih0aGlzU291bmQpIHtcblxuICAgIHRoaXNTb3VuZC5fMzYwZGF0YS5jYW52YXNYWSA9IHNlbGYuZmluZFhZKHRoaXNTb3VuZC5fMzYwZGF0YS5vQ2FudmFzKTtcbiAgICB0aGlzU291bmQuXzM2MGRhdGEuY2FudmFzTWlkID0gW3RoaXNTb3VuZC5fMzYwZGF0YS5jaXJjbGVSYWRpdXMsdGhpc1NvdW5kLl8zNjBkYXRhLmNpcmNsZVJhZGl1c107XG4gICAgdGhpc1NvdW5kLl8zNjBkYXRhLmNhbnZhc01pZFhZID0gW3RoaXNTb3VuZC5fMzYwZGF0YS5jYW52YXNYWVswXSt0aGlzU291bmQuXzM2MGRhdGEuY2FudmFzTWlkWzBdLCB0aGlzU291bmQuXzM2MGRhdGEuY2FudmFzWFlbMV0rdGhpc1NvdW5kLl8zNjBkYXRhLmNhbnZhc01pZFsxXV07XG5cbiAgfTtcblxuICB0aGlzLnN0b3BTb3VuZCA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xuXG4gICAgc291bmRNYW5hZ2VyLl93cml0ZURlYnVnKCdzdG9wU291bmQ6ICcrb1NvdW5kLnNJRCk7XG4gICAgc291bmRNYW5hZ2VyLnN0b3Aob1NvdW5kLnNJRCk7XG4gICAgaWYgKCFpc1RvdWNoRGV2aWNlKSB7IC8vIGlPUyA0LjIrIHNlY3VyaXR5IGJsb2NrcyBvbmZpbmlzaCgpIC0+IHBsYXlOZXh0KCkgaWYgd2Ugc2V0IGEgLnNyYyBpbi1iZXR3ZWVuKD8pXG4gICAgICBzb3VuZE1hbmFnZXIudW5sb2FkKG9Tb3VuZC5zSUQpO1xuICAgIH1cblxuICB9O1xuXG4gIHRoaXMuYnV0dG9uQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG5cbiAgICB2YXIgbyA9IGU/KGUudGFyZ2V0P2UudGFyZ2V0OmUuc3JjRWxlbWVudCk6d2luZG93LmV2ZW50LnNyY0VsZW1lbnQ7XG4gICAgc2VsZi5oYW5kbGVDbGljayh7dGFyZ2V0OnNlbGYuZ2V0UGFyZW50QnlDbGFzc05hbWUobywnc20yLTM2MHVpJykubmV4dFNpYmxpbmd9KTsgLy8gbGluayBuZXh0IHRvIHRoZSBub2RlcyB3ZSBpbnNlcnRlZFxuICAgIHJldHVybiBmYWxzZTtcblxuICB9O1xuXG4gIHRoaXMuYnV0dG9uTW91c2VEb3duID0gZnVuY3Rpb24oZSkge1xuXG4gICAgLy8gdXNlciBtaWdodCBkZWNpZGUgdG8gZHJhZyBmcm9tIGhlcmVcbiAgICAvLyB3YXRjaCBmb3IgbW91c2UgbW92ZVxuICAgIGlmICghaXNUb3VjaERldmljZSkge1xuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vIHNob3VsZCBiZSBib3VuZGFyeS1jaGVja2VkLCByZWFsbHkgKGVnLiBtb3ZlIDNweCBmaXJzdD8pXG4gICAgICAgIHNlbGYubW91c2VEb3duKGUpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tb3VzZURvd24pO1xuICAgIH1cbiAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICB0aGlzLm1vdXNlRG93biA9IGZ1bmN0aW9uKGUpIHtcblxuICAgIGlmICghaXNUb3VjaERldmljZSAmJiBlLmJ1dHRvbiA+IDEpIHtcbiAgICAgIHJldHVybiB0cnVlOyAvLyBpZ25vcmUgbm9uLWxlZnQtY2xpY2tcbiAgICB9XG5cbiAgICBpZiAoIXNlbGYubGFzdFNvdW5kKSB7XG4gICAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZXZ0ID0gZT9lOndpbmRvdy5ldmVudCxcbiAgICAgICAgdGFyZ2V0LCB0aGlzU291bmQsIG9EYXRhO1xuXG4gICAgaWYgKGlzVG91Y2hEZXZpY2UgJiYgZXZ0LnRvdWNoZXMpIHtcbiAgICAgIGV2dCA9IGV2dC50b3VjaGVzWzBdO1xuICAgIH1cbiAgICB0YXJnZXQgPSAoZXZ0LnRhcmdldHx8ZXZ0LnNyY0VsZW1lbnQpO1xuXG4gICAgdGhpc1NvdW5kID0gc2VsZi5nZXRTb3VuZEJ5VVJMKHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc20yX2xpbmsnLCdhJyxzZWxmLmdldFBhcmVudEJ5Q2xhc3NOYW1lKHRhcmdldCwndWkzNjAnKSlbMF0uaHJlZik7IC8vIHNlbGYubGFzdFNvdW5kOyAvLyBUT0RPOiBJbiBtdWx0aXBsZSBzb3VuZCBjYXNlLCBmaWd1cmUgb3V0IHdoaWNoIHNvdW5kIGlzIGludm9sdmVkIGV0Yy5cbiAgICAvLyBqdXN0IGluIGNhc2UsIHVwZGF0ZSBjb29yZGluYXRlcyAobWF5YmUgdGhlIGVsZW1lbnQgbW92ZWQgc2luY2UgbGFzdCB0aW1lLilcbiAgICBzZWxmLmxhc3RUb3VjaGVkU291bmQgPSB0aGlzU291bmQ7XG4gICAgc2VsZi5yZWZyZXNoQ29vcmRzKHRoaXNTb3VuZCk7XG4gICAgb0RhdGEgPSB0aGlzU291bmQuXzM2MGRhdGE7XG4gICAgc2VsZi5hZGRDbGFzcyhvRGF0YS5vVUlCb3gsJ3NtMl9kcmFnZ2luZycpO1xuICAgIG9EYXRhLnBhdXNlQ291bnQgPSAoc2VsZi5sYXN0VG91Y2hlZFNvdW5kLnBhdXNlZD8xOjApO1xuICAgIC8vIHNlbGYubGFzdFNvdW5kLnBhdXNlKCk7XG4gICAgc2VsZi5tbWgoZT9lOndpbmRvdy5ldmVudCk7XG5cbiAgICBpZiAoaXNUb3VjaERldmljZSkge1xuICAgICAgc2VsZi5yZW1vdmVFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tb3VzZURvd24pO1xuICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tbWgpO1xuICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNoZW5kJyxzZWxmLm1vdXNlVXApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbmNyZWRpYmx5IG9sZC1za29vbC4gVE9ETzogTW9kZXJuaXplLlxuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBzZWxmLm1taDtcbiAgICAgIGRvY3VtZW50Lm9ubW91c2V1cCA9IHNlbGYubW91c2VVcDtcbiAgICB9XG5cbiAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICB0aGlzLm1vdXNlVXAgPSBmdW5jdGlvbihlKSB7XG5cbiAgICB2YXIgb0RhdGEgPSBzZWxmLmxhc3RUb3VjaGVkU291bmQuXzM2MGRhdGE7XG4gICAgc2VsZi5yZW1vdmVDbGFzcyhvRGF0YS5vVUlCb3gsJ3NtMl9kcmFnZ2luZycpO1xuICAgIGlmIChvRGF0YS5wYXVzZUNvdW50ID09PSAwKSB7XG4gICAgICBzZWxmLmxhc3RUb3VjaGVkU291bmQucmVzdW1lKCk7XG4gICAgfVxuICAgIGlmICghaXNUb3VjaERldmljZSkge1xuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBudWxsO1xuICAgICAgZG9jdW1lbnQub25tb3VzZXVwID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5yZW1vdmVFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tbWgpO1xuICAgICAgc2VsZi5yZW1vdmVFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNoZW5kJyxzZWxmLm1vdXNlVVApO1xuICAgIH1cblxuICB9O1xuXG4gIHRoaXMubW1oID0gZnVuY3Rpb24oZSkge1xuXG4gICAgaWYgKHR5cGVvZiBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICB9XG4gICAgdmFyIG9Tb3VuZCA9IHNlbGYubGFzdFRvdWNoZWRTb3VuZCxcbiAgICAgICAgY29vcmRzID0gc2VsZi5nZXRNb3VzZVhZKGUpLFxuICAgICAgICB4ID0gY29vcmRzWzBdLFxuICAgICAgICB5ID0gY29vcmRzWzFdLFxuICAgICAgICBkZWx0YVggPSB4LW9Tb3VuZC5fMzYwZGF0YS5jYW52YXNNaWRYWVswXSxcbiAgICAgICAgZGVsdGFZID0geS1vU291bmQuXzM2MGRhdGEuY2FudmFzTWlkWFlbMV0sXG4gICAgICAgIGFuZ2xlID0gTWF0aC5mbG9vcihmdWxsQ2lyY2xlLShzZWxmLnJhZDJkZWcoTWF0aC5hdGFuMihkZWx0YVgsZGVsdGFZKSkrMTgwKSk7XG5cbiAgICBvU291bmQuc2V0UG9zaXRpb24ob1NvdW5kLmR1cmF0aW9uRXN0aW1hdGUqKGFuZ2xlL2Z1bGxDaXJjbGUpKTtcbiAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICAvLyBhc3NpZ25Nb3VzZURvd24oKTtcblxuICB0aGlzLmRyYXdTb2xpZEFyYyA9IGZ1bmN0aW9uKG9DYW52YXMsIGNvbG9yLCByYWRpdXMsIHdpZHRoLCByYWRpYW5zLCBzdGFydEFuZ2xlLCBub0NsZWFyKSB7XG5cbiAgICAvLyB0aGFuayB5b3UsIGh0dHA6Ly93d3cuc25pcGVyc3lzdGVtcy5jby5uei9jb21tdW5pdHkvcG9sYXJjbG9jay90dXRvcmlhbC5odG1sXG5cbiAgICB2YXIgeCA9IHJhZGl1cyxcbiAgICAgICAgeSA9IHJhZGl1cyxcbiAgICAgICAgY2FudmFzID0gb0NhbnZhcyxcbiAgICAgICAgY3R4LCBpbm5lclJhZGl1cywgZG9lc250TGlrZVplcm8sIGVuZFBvaW50O1xuXG4gICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0KXtcbiAgICAgIC8vIHVzZSBnZXRDb250ZXh0IHRvIHVzZSB0aGUgY2FudmFzIGZvciBkcmF3aW5nXG4gICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB9XG5cbiAgICAvLyByZS1hc3NpZ24gY2FudmFzIGFzIHRoZSBhY3R1YWwgY29udGV4dFxuICAgIG9DYW52YXMgPSBjdHg7XG5cbiAgICBpZiAoIW5vQ2xlYXIpIHtcbiAgICAgIHNlbGYuY2xlYXJDYW52YXMoY2FudmFzKTtcbiAgICB9XG4gICAgLy8gY3R4LnJlc3RvcmUoKTtcblxuICAgIGlmIChjb2xvcikge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIH1cblxuICAgIG9DYW52YXMuYmVnaW5QYXRoKCk7XG5cbiAgICBpZiAoaXNOYU4ocmFkaWFucykpIHtcbiAgICAgIHJhZGlhbnMgPSAwO1xuICAgIH1cblxuICAgIGlubmVyUmFkaXVzID0gcmFkaXVzLXdpZHRoO1xuICAgIGRvZXNudExpa2VaZXJvID0gKGlzT3BlcmEgfHwgaXNTYWZhcmkpOyAvLyBzYWZhcmkgNCBkb2Vzbid0IGFjdHVhbGx5IHNlZW0gdG8gbWluZC5cblxuICAgIGlmICghZG9lc250TGlrZVplcm8gfHwgKGRvZXNudExpa2VaZXJvICYmIHJhZGl1cyA+IDApKSB7XG4gICAgICBvQ2FudmFzLmFyYygwLCAwLCByYWRpdXMsIHN0YXJ0QW5nbGUsIHJhZGlhbnMsIGZhbHNlKTtcbiAgICAgIGVuZFBvaW50ID0gc2VsZi5nZXRBcmNFbmRwb2ludENvb3Jkcyhpbm5lclJhZGl1cywgcmFkaWFucyk7XG4gICAgICBvQ2FudmFzLmxpbmVUbyhlbmRQb2ludC54LCBlbmRQb2ludC55KTtcbiAgICAgIG9DYW52YXMuYXJjKDAsIDAsIGlubmVyUmFkaXVzLCByYWRpYW5zLCBzdGFydEFuZ2xlLCB0cnVlKTtcbiAgICAgIG9DYW52YXMuY2xvc2VQYXRoKCk7XG4gICAgICBvQ2FudmFzLmZpbGwoKTtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmdldEFyY0VuZHBvaW50Q29vcmRzID0gZnVuY3Rpb24ocmFkaXVzLCByYWRpYW5zKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogcmFkaXVzICogTWF0aC5jb3MocmFkaWFucyksXG4gICAgICB5OiByYWRpdXMgKiBNYXRoLnNpbihyYWRpYW5zKVxuICAgIH07XG5cbiAgfTtcblxuICB0aGlzLmRlZzJyYWQgPSBmdW5jdGlvbihuRGVnKSB7XG4gICAgcmV0dXJuIChuRGVnICogTWF0aC5QSS8xODApO1xuICB9O1xuXG4gIHRoaXMucmFkMmRlZyA9IGZ1bmN0aW9uKG5SYWQpIHtcbiAgICByZXR1cm4gKG5SYWQgKiAxODAvTWF0aC5QSSk7XG4gIH07XG5cbiAgdGhpcy5nZXRUaW1lID0gZnVuY3Rpb24obk1TZWMsYkFzU3RyaW5nKSB7XG5cbiAgICAvLyBjb252ZXJ0IG1pbGxpc2Vjb25kcyB0byBtbTpzcywgcmV0dXJuIGFzIG9iamVjdCBsaXRlcmFsIG9yIHN0cmluZ1xuICAgIHZhciBuU2VjID0gTWF0aC5mbG9vcihuTVNlYy8xMDAwKSxcbiAgICAgICAgbWluID0gTWF0aC5mbG9vcihuU2VjLzYwKSxcbiAgICAgICAgc2VjID0gblNlYy0obWluKjYwKTtcbiAgICAvLyBpZiAobWluID09PSAwICYmIHNlYyA9PT0gMCkgcmV0dXJuIG51bGw7IC8vIHJldHVybiAwOjAwIGFzIG51bGxcbiAgICByZXR1cm4gKGJBc1N0cmluZz8obWluKyc6Jysoc2VjPDEwPycwJytzZWM6c2VjKSk6eydtaW4nOm1pbiwnc2VjJzpzZWN9KTtcblxuICB9O1xuXG4gIHRoaXMuY2xlYXJDYW52YXMgPSBmdW5jdGlvbihvQ2FudmFzKSB7XG5cbiAgICB2YXIgY2FudmFzID0gb0NhbnZhcyxcbiAgICAgICAgY3R4ID0gbnVsbCxcbiAgICAgICAgd2lkdGgsIGhlaWdodDtcbiAgICBpZiAoY2FudmFzLmdldENvbnRleHQpe1xuICAgICAgLy8gdXNlIGdldENvbnRleHQgdG8gdXNlIHRoZSBjYW52YXMgZm9yIGRyYXdpbmdcbiAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIH1cbiAgICB3aWR0aCA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcbiAgICBoZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xuICAgIGN0eC5jbGVhclJlY3QoLSh3aWR0aC8yKSwgLShoZWlnaHQvMiksIHdpZHRoLCBoZWlnaHQpO1xuXG4gIH07XG5cbiAgdGhpcy51cGRhdGVQbGF5aW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgdGltZU5vdyA9ICh0aGlzLl8zNjBkYXRhLnNob3dITVNUaW1lP3NlbGYuZ2V0VGltZSh0aGlzLnBvc2l0aW9uLHRydWUpOnBhcnNlSW50KHRoaXMucG9zaXRpb24vMTAwMCwgMTApKTtcblxuICAgIGlmICh0aGlzLmJ5dGVzTG9hZGVkKSB7XG4gICAgICB0aGlzLl8zNjBkYXRhLmxhc3RWYWx1ZXMuYnl0ZXNMb2FkZWQgPSB0aGlzLmJ5dGVzTG9hZGVkO1xuICAgICAgdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmJ5dGVzVG90YWwgPSB0aGlzLmJ5dGVzVG90YWw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucG9zaXRpb24pIHtcbiAgICAgIHRoaXMuXzM2MGRhdGEubGFzdFZhbHVlcy5wb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZHVyYXRpb25Fc3RpbWF0ZSkge1xuICAgICAgdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmR1cmF0aW9uRXN0aW1hdGUgPSB0aGlzLmR1cmF0aW9uRXN0aW1hdGU7XG4gICAgfVxuXG4gICAgc2VsZi5kcmF3U29saWRBcmModGhpcy5fMzYwZGF0YS5vQ2FudmFzLHNlbGYuY29uZmlnLmJhY2tncm91bmRSaW5nQ29sb3IsdGhpcy5fMzYwZGF0YS53aWR0aCx0aGlzLl8zNjBkYXRhLnJhZGl1cyxzZWxmLmRlZzJyYWQoZnVsbENpcmNsZSksZmFsc2UpO1xuXG4gICAgc2VsZi5kcmF3U29saWRBcmModGhpcy5fMzYwZGF0YS5vQ2FudmFzLCh0aGlzLl8zNjBkYXRhLm1ldGFkYXRhP3NlbGYuY29uZmlnLmxvYWRSaW5nQ29sb3JNZXRhZGF0YTpzZWxmLmNvbmZpZy5sb2FkUmluZ0NvbG9yKSx0aGlzLl8zNjBkYXRhLndpZHRoLHRoaXMuXzM2MGRhdGEucmFkaXVzLHNlbGYuZGVnMnJhZChmdWxsQ2lyY2xlKih0aGlzLl8zNjBkYXRhLmxhc3RWYWx1ZXMuYnl0ZXNMb2FkZWQvdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmJ5dGVzVG90YWwpKSwwLHRydWUpO1xuXG4gICAgLy8gZG9uJ3QgZHJhdyBpZiAwIChmdWxsIGJsYWNrIGNpcmNsZSBpbiBPcGVyYSlcbiAgICBpZiAodGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLnBvc2l0aW9uICE9PSAwKSB7XG4gICAgICBzZWxmLmRyYXdTb2xpZEFyYyh0aGlzLl8zNjBkYXRhLm9DYW52YXMsKHRoaXMuXzM2MGRhdGEubWV0YWRhdGE/c2VsZi5jb25maWcucGxheVJpbmdDb2xvck1ldGFkYXRhOnNlbGYuY29uZmlnLnBsYXlSaW5nQ29sb3IpLHRoaXMuXzM2MGRhdGEud2lkdGgsdGhpcy5fMzYwZGF0YS5yYWRpdXMsc2VsZi5kZWcycmFkKCh0aGlzLl8zNjBkYXRhLmRpZEZpbmlzaD09PTE/ZnVsbENpcmNsZTpmdWxsQ2lyY2xlKih0aGlzLl8zNjBkYXRhLmxhc3RWYWx1ZXMucG9zaXRpb24vdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmR1cmF0aW9uRXN0aW1hdGUpKSksMCx0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBtZXRhZGF0YSBnb2VzIGhlcmVcbiAgICBpZiAodGhpcy5fMzYwZGF0YS5tZXRhZGF0YSkge1xuICAgICAgdGhpcy5fMzYwZGF0YS5tZXRhZGF0YS5ldmVudHMud2hpbGVwbGF5aW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHRpbWVOb3cgIT09IHRoaXMuXzM2MGRhdGEubGFzdFRpbWUpIHtcbiAgICAgIHRoaXMuXzM2MGRhdGEubGFzdFRpbWUgPSB0aW1lTm93O1xuICAgICAgdGhpcy5fMzYwZGF0YS5vVGltaW5nLmlubmVySFRNTCA9IHRpbWVOb3c7XG4gICAgfVxuXG4gICAgLy8gZHJhdyBzcGVjdHJ1bSwgaWYgYXBwbGljYWJsZVxuICAgIGlmICgodGhpcy5pbnN0YW5jZU9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhIHx8IHRoaXMuaW5zdGFuY2VPcHRpb25zLnVzZUVRRGF0YSkgJiYgaGFzUmVhbENhbnZhcykgeyAvLyBJRSA8OSBjYW4gcmVuZGVyIG1heWJlIDMgb3IgNCBGUFMgd2hlbiBpbmNsdWRpbmcgdGhlIHdhdmUvRVEsIHNvIGRvbid0IGJvdGhlci5cbiAgICAgIHNlbGYudXBkYXRlV2F2ZWZvcm0odGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuY29uZmlnLnVzZUZhdkljb24gJiYgc2VsZi52dU1ldGVyKSB7XG4gICAgICBzZWxmLnZ1TWV0ZXIudXBkYXRlVlUodGhpcyk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy51cGRhdGVXYXZlZm9ybSA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xuXG4gICAgaWYgKCghc2VsZi5jb25maWcudXNlV2F2ZWZvcm1EYXRhICYmICFzZWxmLmNvbmZpZy51c2VFUURhdGEpIHx8ICghc20uZmVhdHVyZXMud2F2ZWZvcm1EYXRhICYmICFzbS5mZWF0dXJlcy5lcURhdGEpKSB7XG4gICAgICAvLyBmZWF0dXJlIG5vdCBlbmFibGVkLi5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW9Tb3VuZC53YXZlZm9ybURhdGEubGVmdC5sZW5ndGggJiYgIW9Tb3VuZC5lcURhdGEubGVuZ3RoICYmICFvU291bmQucGVha0RhdGEubGVmdCkge1xuICAgICAgLy8gbm8gZGF0YSAob3IgZXJyb3JlZCBvdXQvcGF1c2VkL3VuYXZhaWxhYmxlPylcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiB1c2UgZm9yIHRlc3RpbmcgdGhlIGRhdGEgKi9cbiAgICAvKlxuICAgICBmb3IgKGk9MDsgaTwyNTY7IGkrKykge1xuICAgICAgIG9Tb3VuZC5lcURhdGFbaV0gPSAxLShpLzI1Nik7XG4gICAgIH1cbiAgICAqL1xuXG4gICAgdmFyIG9DYW52YXMgPSBvU291bmQuXzM2MGRhdGEub0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgICBvZmZYID0gMCxcbiAgICAgICAgb2ZmWSA9IHBhcnNlSW50KG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlci8yLCAxMCksXG4gICAgICAgIHNjYWxlID0gb2ZmWS8yLCAvLyBZIGF4aXMgKCsvLSB0aGlzIGRpc3RhbmNlIGZyb20gMClcbiAgICAgICAgLy8gbGluZVdpZHRoID0gTWF0aC5mbG9vcihvU291bmQuXzM2MGRhdGEuY2lyY2xlRGlhbWV0ZXItKG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlciowLjE3NSkvKG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlci8yNTUpKTsgLy8gd2lkdGggZm9yIGVhY2ggbGluZVxuICAgICAgICBsaW5lV2lkdGggPSAxLFxuICAgICAgICBsaW5lSGVpZ2h0ID0gMSxcbiAgICAgICAgdGhpc1kgPSAwLFxuICAgICAgICBvZmZzZXQgPSBvZmZZLFxuICAgICAgICBpLCBqLCBkaXJlY3Rpb24sIGRvd25TYW1wbGUsIGRhdGFMZW5ndGgsIHNhbXBsZUNvdW50LCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgd2F2ZURhdGEsIGlubmVyUmFkaXVzLCBwZXJJdGVtQW5nbGUsIHlEaWZmLCBlcVNhbXBsZXMsIHBsYXllZEFuZ2xlLCBpQXZnLCBuUGVhaztcblxuICAgIGlmIChzZWxmLmNvbmZpZy51c2VXYXZlZm9ybURhdGEpIHtcbiAgICAgIC8vIHJhdyB3YXZlZm9ybVxuICAgICAgZG93blNhbXBsZSA9IHNlbGYuY29uZmlnLndhdmVmb3JtRGF0YURvd25zYW1wbGU7IC8vIG9ubHkgc2FtcGxlIFggaW4gMjU2IChncmVhdGVyIG51bWJlciA9IGxlc3Mgc2FtcGxlIHBvaW50cylcbiAgICAgIGRvd25TYW1wbGUgPSBNYXRoLm1heCgxLGRvd25TYW1wbGUpOyAvLyBtYWtlIHN1cmUgaXQncyBhdCBsZWFzdCAxXG4gICAgICBkYXRhTGVuZ3RoID0gMjU2O1xuICAgICAgc2FtcGxlQ291bnQgPSAoZGF0YUxlbmd0aC9kb3duU2FtcGxlKTtcbiAgICAgIHN0YXJ0QW5nbGUgPSAwO1xuICAgICAgZW5kQW5nbGUgPSAwO1xuICAgICAgd2F2ZURhdGEgPSBudWxsO1xuICAgICAgaW5uZXJSYWRpdXMgPSAoc2VsZi5jb25maWcud2F2ZWZvcm1EYXRhT3V0c2lkZT8xOihzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFDb25zdHJhaW4/MC41OjAuNTY1KSk7XG4gICAgICBzY2FsZSA9IChzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFPdXRzaWRlPzAuNzowLjc1KTtcbiAgICAgIHBlckl0ZW1BbmdsZSA9IHNlbGYuZGVnMnJhZCgoMzYwL3NhbXBsZUNvdW50KSpzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFMaW5lUmF0aW8pOyAvLyAwLjg1ID0gY2xlYW4gcGl4ZWwgbGluZXMgYXQgMTUwPyAvLyBzZWxmLmRlZzJyYWQoMzYwKihNYXRoLm1heCgxLGRvd25TYW1wbGUtMSkpL3NhbXBsZUNvdW50KTtcbiAgICAgIGZvciAoaT0wOyBpPGRhdGFMZW5ndGg7IGkrPWRvd25TYW1wbGUpIHtcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNlbGYuZGVnMnJhZCgzNjAqKGkvKHNhbXBsZUNvdW50KSoxL2Rvd25TYW1wbGUpKTsgLy8gKzAuNjcgLSBjb3VudGVyIGZvciBzcGFjaW5nXG4gICAgICAgIGVuZEFuZ2xlID0gc3RhcnRBbmdsZStwZXJJdGVtQW5nbGU7XG4gICAgICAgIHdhdmVEYXRhID0gb1NvdW5kLndhdmVmb3JtRGF0YS5sZWZ0W2ldO1xuICAgICAgICBpZiAod2F2ZURhdGE8MCAmJiBzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFDb25zdHJhaW4pIHtcbiAgICAgICAgICB3YXZlRGF0YSA9IE1hdGguYWJzKHdhdmVEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmRyYXdTb2xpZEFyYyhvU291bmQuXzM2MGRhdGEub0NhbnZhcyxzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFDb2xvcixvU291bmQuXzM2MGRhdGEud2lkdGgqaW5uZXJSYWRpdXMsb1NvdW5kLl8zNjBkYXRhLnJhZGl1cypzY2FsZSoxLjI1KndhdmVEYXRhLGVuZEFuZ2xlLHN0YXJ0QW5nbGUsdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuY29uZmlnLnVzZUVRRGF0YSkge1xuICAgICAgLy8gRVEgc3BlY3RydW1cbiAgICAgIGRvd25TYW1wbGUgPSBzZWxmLmNvbmZpZy5lcURhdGFEb3duc2FtcGxlOyAvLyBvbmx5IHNhbXBsZSBOIGluIDI1NlxuICAgICAgeURpZmYgPSAwO1xuICAgICAgZG93blNhbXBsZSA9IE1hdGgubWF4KDEsZG93blNhbXBsZSk7IC8vIG1ha2Ugc3VyZSBpdCdzIGF0IGxlYXN0IDFcbiAgICAgIGVxU2FtcGxlcyA9IDE5MjsgLy8gZHJvcCB0aGUgbGFzdCAyNSUgb2YgdGhlIHNwZWN0cnVtICg+MTY1MDAgSHopLCBtb3N0IHN0dWZmIHdvbid0IGFjdHVhbGx5IHVzZSBpdC5cbiAgICAgIHNhbXBsZUNvdW50ID0gKGVxU2FtcGxlcy9kb3duU2FtcGxlKTtcbiAgICAgIGlubmVyUmFkaXVzID0gKHNlbGYuY29uZmlnLmVxRGF0YU91dHNpZGU/MTowLjU2NSk7XG4gICAgICBkaXJlY3Rpb24gPSAoc2VsZi5jb25maWcuZXFEYXRhT3V0c2lkZT8tMToxKTtcbiAgICAgIHNjYWxlID0gKHNlbGYuY29uZmlnLmVxRGF0YU91dHNpZGU/MC41OjAuNzUpO1xuICAgICAgc3RhcnRBbmdsZSA9IDA7XG4gICAgICBlbmRBbmdsZSA9IDA7XG4gICAgICBwZXJJdGVtQW5nbGUgPSBzZWxmLmRlZzJyYWQoKDM2MC9zYW1wbGVDb3VudCkqc2VsZi5jb25maWcuZXFEYXRhTGluZVJhdGlvKTsgLy8gc2VsZi5kZWcycmFkKDM2MC8oc2FtcGxlQ291bnQrMSkpO1xuICAgICAgcGxheWVkQW5nbGUgPSBzZWxmLmRlZzJyYWQoKG9Tb3VuZC5fMzYwZGF0YS5kaWRGaW5pc2g9PT0xPzM2MDozNjAqKG9Tb3VuZC5fMzYwZGF0YS5sYXN0VmFsdWVzLnBvc2l0aW9uL29Tb3VuZC5fMzYwZGF0YS5sYXN0VmFsdWVzLmR1cmF0aW9uRXN0aW1hdGUpKSk7XG4gICAgICBqPTA7XG4gICAgICBpQXZnID0gMDtcbiAgICAgIGZvciAoaT0wOyBpPGVxU2FtcGxlczsgaSs9ZG93blNhbXBsZSkge1xuICAgICAgICBzdGFydEFuZ2xlID0gc2VsZi5kZWcycmFkKDM2MCooaS9lcVNhbXBsZXMpKTtcbiAgICAgICAgZW5kQW5nbGUgPSBzdGFydEFuZ2xlK3Blckl0ZW1BbmdsZTtcbiAgICAgICAgc2VsZi5kcmF3U29saWRBcmMob1NvdW5kLl8zNjBkYXRhLm9DYW52YXMsKGVuZEFuZ2xlPnBsYXllZEFuZ2xlP3NlbGYuY29uZmlnLmVxRGF0YUNvbG9yOnNlbGYuY29uZmlnLnBsYXlSaW5nQ29sb3IpLG9Tb3VuZC5fMzYwZGF0YS53aWR0aCppbm5lclJhZGl1cyxvU291bmQuXzM2MGRhdGEucmFkaXVzKnNjYWxlKihvU291bmQuZXFEYXRhLmxlZnRbaV0qZGlyZWN0aW9uKSxlbmRBbmdsZSxzdGFydEFuZ2xlLHRydWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZWxmLmNvbmZpZy51c2VQZWFrRGF0YSkge1xuICAgICAgaWYgKCFvU291bmQuXzM2MGRhdGEuYW5pbWF0aW5nKSB7XG4gICAgICAgIG5QZWFrID0gKG9Tb3VuZC5wZWFrRGF0YS5sZWZ0fHxvU291bmQucGVha0RhdGEucmlnaHQpO1xuICAgICAgICAvLyBHSUFOVCBIQUNLOiB1c2UgRVEgc3BlY3RydW0gZGF0YSBmb3IgYmFzcyBmcmVxdWVuY2llc1xuICAgICAgICBlcVNhbXBsZXMgPSAzO1xuICAgICAgICBmb3IgKGk9MDsgaTxlcVNhbXBsZXM7IGkrKykge1xuICAgICAgICAgIG5QZWFrID0gKG5QZWFrfHxvU291bmQuZXFEYXRhW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBvU291bmQuXzM2MGRhdGEuYW1wbGlmaWVyID0gKHNlbGYuY29uZmlnLnVzZUFtcGxpZmllcj8oMC45KyhuUGVhayowLjEpKToxKTtcbiAgICAgICAgb1NvdW5kLl8zNjBkYXRhLnJhZGl1c01heCA9IG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlciowLjE3NSpvU291bmQuXzM2MGRhdGEuYW1wbGlmaWVyO1xuICAgICAgICBvU291bmQuXzM2MGRhdGEud2lkdGhNYXggPSBvU291bmQuXzM2MGRhdGEuY2lyY2xlRGlhbWV0ZXIqMC40Km9Tb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXI7XG4gICAgICAgIG9Tb3VuZC5fMzYwZGF0YS5yYWRpdXMgPSBwYXJzZUludChvU291bmQuXzM2MGRhdGEucmFkaXVzTWF4Km9Tb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIsIDEwKTtcbiAgICAgICAgb1NvdW5kLl8zNjBkYXRhLndpZHRoID0gcGFyc2VJbnQob1NvdW5kLl8zNjBkYXRhLndpZHRoTWF4Km9Tb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIsIDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmdldFVJSFRNTCA9IGZ1bmN0aW9uKGRpYW1ldGVyKSB7XG5cbiAgICByZXR1cm4gW1xuICAgICAnPGNhbnZhcyBjbGFzcz1cInNtMi1jYW52YXNcIiB3aWR0aD1cIicrZGlhbWV0ZXIrJ1wiIGhlaWdodD1cIicrZGlhbWV0ZXIrJ1wiPjwvY2FudmFzPicsXG4gICAgICcgPHNwYW4gY2xhc3M9XCJzbTItMzYwYnRuIHNtMi0zNjBidG4tZGVmYXVsdFwiPjwvc3Bhbj4nLCAvLyBub3RlIHVzZSBvZiBpbWFnZU1hcCwgZWRpdCBvciByZW1vdmUgaWYgeW91IHVzZSBhIGRpZmZlcmVudC1zaXplIGltYWdlLlxuICAgICAnIDxkaXYgY2xhc3M9XCJzbTItdGltaW5nJysobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvc2FmYXJpL2kpPycgYWxpZ25Ud2Vhayc6JycpKydcIj48L2Rpdj4nLCAvLyArIEV2ZXItc28tc2xpZ2h0IFNhZmFyaSBob3Jpem9udGFsIGFsaWdubWVudCB0d2Vha1xuICAgICAnIDxkaXYgY2xhc3M9XCJzbTItY292ZXJcIj48L2Rpdj4nXG4gICAgXTtcblxuICB9O1xuXG4gIHRoaXMudWlUZXN0ID0gZnVuY3Rpb24oc0NsYXNzKSB7XG5cbiAgICAvLyBmYWtlIGEgMzYwIFVJIHNvIHdlIGNhbiBnZXQgc29tZSBudW1iZXJzIGZyb20gQ1NTLCBldGMuXG5cbiAgICB2YXIgb1RlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIG9GYWtlVUksIG9GYWtlVUlCb3gsIG9UZW1wLCBmYWtlRGlhbWV0ZXIsIHVpSFRNTCwgY2lyY2xlRGlhbWV0ZXIsIGNpcmNsZVJhZGl1cywgZm9udFNpemVNYXgsIG9UaW1pbmc7XG5cbiAgICBvVGVtcGxhdGUuY2xhc3NOYW1lID0gJ3NtMi0zNjB1aSc7XG5cbiAgICBvRmFrZVVJID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb0Zha2VVSS5jbGFzc05hbWUgPSAndWkzNjAnKyhzQ2xhc3M/JyAnK3NDbGFzczonJyk7IC8vIHVpMzYwIHVpMzYwLXZpc1xuXG4gICAgb0Zha2VVSUJveCA9IG9GYWtlVUkuYXBwZW5kQ2hpbGQob1RlbXBsYXRlLmNsb25lTm9kZSh0cnVlKSk7XG5cbiAgICBvRmFrZVVJLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBvRmFrZVVJLnN0eWxlLmxlZnQgPSAnLTk5OTlweCc7XG5cbiAgICBvVGVtcCA9IGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob0Zha2VVSSk7XG5cbiAgICBmYWtlRGlhbWV0ZXIgPSBvRmFrZVVJQm94Lm9mZnNldFdpZHRoO1xuXG4gICAgdWlIVE1MID0gc2VsZi5nZXRVSUhUTUwoZmFrZURpYW1ldGVyKTtcblxuICAgIG9GYWtlVUlCb3guaW5uZXJIVE1MID0gdWlIVE1MWzFdK3VpSFRNTFsyXSt1aUhUTUxbM107XG5cbiAgICBjaXJjbGVEaWFtZXRlciA9IHBhcnNlSW50KG9GYWtlVUlCb3gub2Zmc2V0V2lkdGgsIDEwKTtcbiAgICBjaXJjbGVSYWRpdXMgPSBwYXJzZUludChjaXJjbGVEaWFtZXRlci8yLCAxMCk7XG5cbiAgICBvVGltaW5nID0gc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItdGltaW5nJywnZGl2JyxvVGVtcClbMF07XG4gICAgZm9udFNpemVNYXggPSBwYXJzZUludChzZWxmLmdldFN0eWxlKG9UaW1pbmcsJ2ZvbnQtc2l6ZScpLCAxMCk7XG4gICAgaWYgKGlzTmFOKGZvbnRTaXplTWF4KSkge1xuICAgICAgLy8gZ2V0U3R5bGUoKSBldGMuIGRpZG4ndCB3b3JrLlxuICAgICAgZm9udFNpemVNYXggPSBudWxsO1xuICAgIH1cblxuICAgIC8vIHNvdW5kTWFuYWdlci5fd3JpdGVEZWJ1ZygnZGlhbWV0ZXIsIGZvbnQgc2l6ZTogJytjaXJjbGVEaWFtZXRlcisnLCcrZm9udFNpemVNYXgpO1xuXG4gICAgb0Zha2VVSS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9GYWtlVUkpO1xuXG4gICAgdWlIVE1MID0gb0Zha2VVSSA9IG9GYWtlVUlCb3ggPSBvVGVtcCA9IG51bGw7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2lyY2xlRGlhbWV0ZXI6IGNpcmNsZURpYW1ldGVyLFxuICAgICAgY2lyY2xlUmFkaXVzOiBjaXJjbGVSYWRpdXMsXG4gICAgICBmb250U2l6ZU1heDogZm9udFNpemVNYXhcbiAgICB9O1xuXG4gIH07XG5cbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBzbS5fd3JpdGVEZWJ1ZygndGhyZWVTaXh0eVBsYXllci5pbml0KCknKTtcblxuICAgICAgaWYoc2VsZi5jb25maWcuaXRlbXMpe1xuICAgICAgICAgIHZhciBvSXRlbXMgPSBzZWxmLmNvbmZpZy5pdGVtcztcbiAgICAgIH1lbHNle1xuICAgICAgICAgIHZhciBvSXRlbXMgPSBzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3VpMzYwJywnZGl2Jyk7XG4gICAgICB9XG4gICAgdmFyIGksIGosIG9MaW5rcyA9IFtdLCBpc192aXMgPSBmYWxzZSwgZm91bmRJdGVtcyA9IDAsIG9DYW52YXMsIG9DYW52YXNDVFgsIG9Db3ZlciwgZGlhbWV0ZXIsIHJhZGl1cywgdWlEYXRhLCB1aURhdGFWaXMsIG9VSSwgb0J0biwgbywgbzIsIG9JRDtcblxuICAgIGZvciAoaT0wLGo9b0l0ZW1zLmxlbmd0aDsgaTxqOyBpKyspIHtcbiAgICAgIG9MaW5rcy5wdXNoKG9JdGVtc1tpXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpWzBdKTtcbiAgICAgIC8vIHJlbW92ZSBcImZha2VcIiBwbGF5IGJ1dHRvbiAodW5zdXBwb3J0ZWQgY2FzZSlcbiAgICAgIG9JdGVtc1tpXS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAnbm9uZSc7XG4gICAgfVxuICAgIC8vIGdyYWIgYWxsIGxpbmtzLCBsb29rIGZvciAubXAzXG5cbiAgICBzZWxmLm9VSVRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2VsZi5vVUlUZW1wbGF0ZS5jbGFzc05hbWUgPSAnc20yLTM2MHVpJztcblxuICAgIHNlbGYub1VJVGVtcGxhdGVWaXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzZWxmLm9VSVRlbXBsYXRlVmlzLmNsYXNzTmFtZSA9ICdzbTItMzYwdWknO1xuXG4gICAgdWlEYXRhID0gc2VsZi51aVRlc3QoKTtcblxuICAgIHNlbGYuY29uZmlnLmNpcmNsZURpYW1ldGVyID0gdWlEYXRhLmNpcmNsZURpYW1ldGVyO1xuICAgIHNlbGYuY29uZmlnLmNpcmNsZVJhZGl1cyA9IHVpRGF0YS5jaXJjbGVSYWRpdXM7XG4gICAgLy8gc2VsZi5jb25maWcuZm9udFNpemVNYXggPSB1aURhdGEuZm9udFNpemVNYXg7XG5cbiAgICB1aURhdGFWaXMgPSBzZWxmLnVpVGVzdCgndWkzNjAtdmlzJyk7XG5cbiAgICBzZWxmLmNvbmZpZy5mb250U2l6ZU1heCA9IHVpRGF0YVZpcy5mb250U2l6ZU1heDtcblxuICAgIC8vIGNhbnZhcyBuZWVkcyBpbmxpbmUgd2lkdGggYW5kIGhlaWdodCwgZG9lc24ndCBxdWl0ZSB3b3JrIG90aGVyd2lzZVxuICAgIHNlbGYub1VJVGVtcGxhdGUuaW5uZXJIVE1MID0gc2VsZi5nZXRVSUhUTUwoc2VsZi5jb25maWcuY2lyY2xlRGlhbWV0ZXIpLmpvaW4oJycpO1xuXG4gICAgc2VsZi5vVUlUZW1wbGF0ZVZpcy5pbm5lckhUTUwgPSBzZWxmLmdldFVJSFRNTCh1aURhdGFWaXMuY2lyY2xlRGlhbWV0ZXIpLmpvaW4oJycpO1xuXG4gICAgZm9yIChpPTAsaj1vTGlua3MubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgaWYgKHNtLmNhblBsYXlMaW5rKG9MaW5rc1tpXSkgJiYgIXNlbGYuaGFzQ2xhc3Mob0xpbmtzW2ldLHNlbGYuZXhjbHVkZUNsYXNzKSAmJiAhc2VsZi5oYXNDbGFzcyhvTGlua3NbaV0sc2VsZi5jc3Muc0RlZmF1bHQpKSB7XG4gICAgICAgIHNlbGYuYWRkQ2xhc3Mob0xpbmtzW2ldLHNlbGYuY3NzLnNEZWZhdWx0KTsgLy8gYWRkIGRlZmF1bHQgQ1NTIGRlY29yYXRpb25cbiAgICAgICAgc2VsZi5saW5rc1tmb3VuZEl0ZW1zXSA9IChvTGlua3NbaV0pO1xuICAgICAgICBzZWxmLmluZGV4QnlVUkxbb0xpbmtzW2ldLmhyZWZdID0gZm91bmRJdGVtczsgLy8gaGFjayBmb3IgaW5kZXhpbmdcbiAgICAgICAgZm91bmRJdGVtcysrO1xuXG4gICAgICAgIGlzX3ZpcyA9IHNlbGYuaGFzQ2xhc3Mob0xpbmtzW2ldLnBhcmVudE5vZGUsICd1aTM2MC12aXMnKTtcblxuICAgICAgICBkaWFtZXRlciA9IChpc192aXMgPyB1aURhdGFWaXMgOiB1aURhdGEpLmNpcmNsZURpYW1ldGVyO1xuICAgICAgICByYWRpdXMgPSAoaXNfdmlzID8gdWlEYXRhVmlzIDogdWlEYXRhKS5jaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgLy8gYWRkIGNhbnZhcyBzaGl6XG4gICAgICAgIG9VSSA9IG9MaW5rc1tpXS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSgoaXNfdmlzP3NlbGYub1VJVGVtcGxhdGVWaXM6c2VsZi5vVUlUZW1wbGF0ZSkuY2xvbmVOb2RlKHRydWUpLG9MaW5rc1tpXSk7XG5cbiAgICAgICAgaWYgKGlzSUUgJiYgdHlwZW9mIHdpbmRvdy5HX3ZtbENhbnZhc01hbmFnZXIgIT09ICd1bmRlZmluZWQnKSB7IC8vIElFIG9ubHlcbiAgICAgICAgICBvID0gb0xpbmtzW2ldLnBhcmVudE5vZGU7XG4gICAgICAgICAgbzIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICBvMi5jbGFzc05hbWUgPSAnc20yLWNhbnZhcyc7XG4gICAgICAgICAgb0lEID0gJ3NtMl9jYW52YXNfJytwYXJzZUludChNYXRoLnJhbmRvbSgpKjEwNDg1NzYsIDEwKTtcbiAgICAgICAgICBvMi5pZCA9IG9JRDtcbiAgICAgICAgICBvMi53aWR0aCA9IGRpYW1ldGVyO1xuICAgICAgICAgIG8yLmhlaWdodCA9IGRpYW1ldGVyO1xuICAgICAgICAgIG9VSS5hcHBlbmRDaGlsZChvMik7XG4gICAgICAgICAgd2luZG93Lkdfdm1sQ2FudmFzTWFuYWdlci5pbml0RWxlbWVudChvMik7IC8vIEFwcGx5IEV4Q2FudmFzIGNvbXBhdGliaWxpdHkgbWFnaWNcbiAgICAgICAgICBvQ2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob0lEKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBhZGQgYSBoYW5kbGVyIGZvciB0aGUgYnV0dG9uXG4gICAgICAgICAgb0NhbnZhcyA9IG9MaW5rc1tpXS5wYXJlbnROb2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXTtcbiAgICAgICAgfVxuICAgICAgICBvQ292ZXIgPSBzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NtMi1jb3ZlcicsJ2Rpdicsb0xpbmtzW2ldLnBhcmVudE5vZGUpWzBdO1xuICAgICAgICBvQnRuID0gb0xpbmtzW2ldLnBhcmVudE5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXTtcbiAgICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIob0J0biwnY2xpY2snLHNlbGYuYnV0dG9uQ2xpY2spO1xuICAgICAgICBpZiAoIWlzVG91Y2hEZXZpY2UpIHtcbiAgICAgICAgICBzZWxmLmFkZEV2ZW50SGFuZGxlcihvQ292ZXIsJ21vdXNlZG93bicsc2VsZi5tb3VzZURvd24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuYWRkRXZlbnRIYW5kbGVyKG9Db3ZlciwndG91Y2hzdGFydCcsc2VsZi5tb3VzZURvd24pO1xuICAgICAgICB9XG4gICAgICAgIG9DYW52YXNDVFggPSBvQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIG9DYW52YXNDVFgudHJhbnNsYXRlKHJhZGl1cywgcmFkaXVzKTtcbiAgICAgICAgb0NhbnZhc0NUWC5yb3RhdGUoc2VsZi5kZWcycmFkKC05MCkpOyAvLyBjb21wZW5zYXRlIGZvciBhcmMgc3RhcnRpbmcgYXQgRUFTVCAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxOTI2Ny90dXRvcmlhbC1mb3ItaHRtbC1jYW52YXNzLWFyYy1mdW5jdGlvblxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZm91bmRJdGVtcz4wKSB7XG4gICAgICBzZWxmLmFkZEV2ZW50SGFuZGxlcihkb2N1bWVudCwnY2xpY2snLHNlbGYuaGFuZGxlQ2xpY2spO1xuICAgICAgaWYgKHNlbGYuY29uZmlnLmF1dG9QbGF5KSB7XG4gICAgICAgIHNlbGYuaGFuZGxlQ2xpY2soe3RhcmdldDpzZWxmLmxpbmtzWzBdLHByZXZlbnREZWZhdWx0OmZ1bmN0aW9uKCl7fX0pO1xuICAgICAgfVxuICAgIH1cbiAgICBzbS5fd3JpdGVEZWJ1ZygndGhyZWVTaXh0eVBsYXllci5pbml0KCk6IEZvdW5kICcrZm91bmRJdGVtcysnIHJlbGV2YW50IGl0ZW1zLicpO1xuXG4gICAgaWYgKHNlbGYuY29uZmlnLnVzZUZhdkljb24gJiYgdHlwZW9mIHRoaXMuVlVNZXRlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudnVNZXRlciA9IG5ldyB0aGlzLlZVTWV0ZXIodGhpcyk7XG4gICAgfVxuXG4gIH07XG5cbn1cblxuLy8gT3B0aW9uYWw6IFZVIE1ldGVyIGNvbXBvbmVudFxuXG5UaHJlZVNpeHR5UGxheWVyLnByb3RvdHlwZS5WVU1ldGVyID0gZnVuY3Rpb24ob1BhcmVudCkge1xuXG4gIHZhciBzZWxmID0gb1BhcmVudCxcbiAgICAgIG1lID0gdGhpcyxcbiAgICAgIF9oZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgIGlzT3BlcmEgPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvb3BlcmEvaSkpLFxuICAgICAgaXNGaXJlZm94ID0gKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2ZpcmVmb3gvaSkpO1xuXG4gIHRoaXMudnVNZXRlckRhdGEgPSBbXTtcbiAgdGhpcy52dURhdGFDYW52YXMgPSBudWxsO1xuXG4gIHRoaXMuc2V0UGFnZUljb24gPSBmdW5jdGlvbihzRGF0YVVSTCkge1xuXG4gICAgaWYgKCFzZWxmLmNvbmZpZy51c2VGYXZJY29uIHx8ICFzZWxmLmNvbmZpZy51c2VQZWFrRGF0YSB8fCAhc0RhdGFVUkwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbTItZmF2aWNvbicpO1xuICAgIGlmIChsaW5rKSB7XG4gICAgICBfaGVhZC5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICAgIGxpbmsgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoIWxpbmspIHtcbiAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICBsaW5rLmlkID0gJ3NtMi1mYXZpY29uJztcbiAgICAgIGxpbmsucmVsID0gJ3Nob3J0Y3V0IGljb24nO1xuICAgICAgbGluay50eXBlID0gJ2ltYWdlL3BuZyc7XG4gICAgICBsaW5rLmhyZWYgPSBzRGF0YVVSTDtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQobGluayk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5yZXNldFBhZ2VJY29uID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoIXNlbGYuY29uZmlnLnVzZUZhdkljb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGxpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmF2aWNvbicpO1xuICAgIGlmIChsaW5rKSB7XG4gICAgICBsaW5rLmhyZWYgPSAnL2Zhdmljb24uaWNvJztcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLnVwZGF0ZVZVID0gZnVuY3Rpb24ob1NvdW5kKSB7XG5cbiAgICBpZiAoc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbiA+PSA5ICYmIHNlbGYuY29uZmlnLnVzZUZhdkljb24gJiYgc2VsZi5jb25maWcudXNlUGVha0RhdGEpIHtcbiAgICAgIG1lLnNldFBhZ2VJY29uKG1lLnZ1TWV0ZXJEYXRhW3BhcnNlSW50KDE2Km9Tb3VuZC5wZWFrRGF0YS5sZWZ0LCAxMCldW3BhcnNlSW50KDE2Km9Tb3VuZC5wZWFrRGF0YS5yaWdodCwgMTApXSk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5jcmVhdGVWVURhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBpPTAsIGo9MCxcbiAgICAgICAgY2FudmFzID0gbWUudnVEYXRhQ2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgIHZ1R3JhZCA9IGNhbnZhcy5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAxNiwgMCwgMCksXG4gICAgICAgIGJnR3JhZCA9IGNhbnZhcy5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAxNiwgMCwgMCksXG4gICAgICAgIG91dGxpbmUgPSAncmdiYSgwLDAsMCwwLjIpJztcblxuICAgIHZ1R3JhZC5hZGRDb2xvclN0b3AoMCwncmdiKDAsMTkyLDApJyk7XG4gICAgdnVHcmFkLmFkZENvbG9yU3RvcCgwLjMwLCdyZ2IoMCwyNTUsMCknKTtcbiAgICB2dUdyYWQuYWRkQ29sb3JTdG9wKDAuNjI1LCdyZ2IoMjU1LDI1NSwwKScpO1xuICAgIHZ1R3JhZC5hZGRDb2xvclN0b3AoMC44NSwncmdiKDI1NSwwLDApJyk7XG4gICAgYmdHcmFkLmFkZENvbG9yU3RvcCgwLG91dGxpbmUpO1xuICAgIGJnR3JhZC5hZGRDb2xvclN0b3AoMSwncmdiYSgwLDAsMCwwLjUpJyk7XG4gICAgZm9yIChpPTA7IGk8MTY7IGkrKykge1xuICAgICAgbWUudnVNZXRlckRhdGFbaV0gPSBbXTtcbiAgICB9XG4gICAgZm9yIChpPTA7IGk8MTY7IGkrKykge1xuICAgICAgZm9yIChqPTA7IGo8MTY7IGorKykge1xuICAgICAgICAvLyByZXNldC9lcmFzZSBjYW52YXNcbiAgICAgICAgbWUudnVEYXRhQ2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLDE2KTtcbiAgICAgICAgbWUudnVEYXRhQ2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywxNik7XG4gICAgICAgIC8vIGRyYXcgbmV3IHN0dWZmc1xuICAgICAgICBjYW52YXMuZmlsbFN0eWxlID0gYmdHcmFkO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoMCwwLDcsMTUpO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoOCwwLDcsMTUpO1xuICAgICAgICAvKlxuICAgICAgICAvLyBzaGFkb3dcbiAgICAgICAgY2FudmFzLmZpbGxTdHlsZSA9ICdyZ2JhKDAsMCwwLDAuMSknO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoMSwxNS1pLDcsMTctKDE3LWkpKTtcbiAgICAgICAgY2FudmFzLmZpbGxSZWN0KDksMTUtaiw3LDE3LSgxNy1qKSk7XG4gICAgICAgICovXG4gICAgICAgIGNhbnZhcy5maWxsU3R5bGUgPSB2dUdyYWQ7XG4gICAgICAgIGNhbnZhcy5maWxsUmVjdCgwLDE1LWksNywxNi0oMTYtaSkpO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoOCwxNS1qLDcsMTYtKDE2LWopKTtcbiAgICAgICAgLy8gYW5kIG5vdywgY2xlYXIgb3V0IHNvbWUgYml0cy5cbiAgICAgICAgY2FudmFzLmNsZWFyUmVjdCgwLDMsMTYsMSk7XG4gICAgICAgIGNhbnZhcy5jbGVhclJlY3QoMCw3LDE2LDEpO1xuICAgICAgICBjYW52YXMuY2xlYXJSZWN0KDAsMTEsMTYsMSk7XG4gICAgICAgIG1lLnZ1TWV0ZXJEYXRhW2ldW2pdID0gbWUudnVEYXRhQ2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG4gICAgICAgIC8vIGZvciBkZWJ1Z2dpbmcgVlUgaW1hZ2VzXG4gICAgICAgIC8qXG4gICAgICAgIHZhciBvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgIG8uc3R5bGUubWFyZ2luUmlnaHQgPSAnNXB4JztcbiAgICAgICAgby5zcmMgPSB2dU1ldGVyRGF0YVtpXVtqXTtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKG8pO1xuICAgICAgICAqL1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMudGVzdENhbnZhcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gY2FudmFzICsgdG9EYXRhVVJMKCk7XG4gICAgdmFyIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgICAgY3R4ID0gbnVsbCwgb2s7XG4gICAgaWYgKCFjIHx8IHR5cGVvZiBjLmdldENvbnRleHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY3R4ID0gYy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGlmICghY3R4IHx8IHR5cGVvZiBjLnRvRGF0YVVSTCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIGp1c3QgaW4gY2FzZS4uXG4gICAgdHJ5IHtcbiAgICAgIG9rID0gYy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLy8gbm8gY2FudmFzIG9yIG5vIHRvRGF0YVVSTCgpXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gYXNzdW1lIHdlJ3JlIGFsbCBnb29kLlxuICAgIHJldHVybiBjO1xuXG4gIH07XG5cbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoc2VsZi5jb25maWcudXNlRmF2SWNvbikge1xuICAgICAgbWUudnVEYXRhQ2FudmFzID0gbWUudGVzdENhbnZhcygpO1xuICAgICAgaWYgKG1lLnZ1RGF0YUNhbnZhcyAmJiAoaXNGaXJlZm94IHx8IGlzT3BlcmEpKSB7XG4gICAgICAgIC8vIHRoZXNlIGJyb3dzZXJzIHN1cHBvcnQgZHluYW1pY2FsbHktdXBkYXRpbmcgdGhlIGZhdmljb25cbiAgICAgICAgbWUuY3JlYXRlVlVEYXRhKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBkb2luZyB0aGlzXG4gICAgICAgIHNlbGYuY29uZmlnLnVzZUZhdkljb24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmluaXQoKTtcblxufTtcblxuLy8gY29tcGxldGVseSBvcHRpb25hbDogTWV0YWRhdGEvYW5ub3RhdGlvbnMvc2VnbWVudHMgY29kZVxuXG5UaHJlZVNpeHR5UGxheWVyLnByb3RvdHlwZS5NZXRhZGF0YSA9IGZ1bmN0aW9uKG9Tb3VuZCwgb1BhcmVudCkge1xuXG4gIHNvdW5kTWFuYWdlci5fd0QoJ01ldGFkYXRhKCknKTtcblxuICB2YXIgbWUgPSB0aGlzLFxuICAgICAgb0JveCA9IG9Tb3VuZC5fMzYwZGF0YS5vVUkzNjAsXG4gICAgICBvID0gb0JveC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndWwnKVswXSxcbiAgICAgIG9JdGVtcyA9IG8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyksXG4gICAgICBpc0ZpcmVmb3ggPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvZmlyZWZveC9pKSksXG4gICAgICBpc0FsdCA9IGZhbHNlLCBpLCBvRHVyYXRpb247XG5cbiAgdGhpcy5sYXN0V1BFeGVjID0gMDtcbiAgdGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSAyNTA7XG4gIHRoaXMudG90YWxUaW1lID0gMDtcblxuICB0aGlzLmV2ZW50cyA9IHtcblxuICAgIHdoaWxlcGxheWluZzogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciB3aWR0aCA9IG9Tb3VuZC5fMzYwZGF0YS53aWR0aCxcbiAgICAgICAgICByYWRpdXMgPSBvU291bmQuXzM2MGRhdGEucmFkaXVzLFxuICAgICAgICAgIGZ1bGxEdXJhdGlvbiA9IChvU291bmQuZHVyYXRpb25Fc3RpbWF0ZXx8KG1lLnRvdGFsVGltZSoxMDAwKSksXG4gICAgICAgICAgaXNBbHQgPSBudWxsLCBpLCBqLCBkO1xuXG4gICAgICBmb3IgKGk9MCxqPW1lLmRhdGEubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpc0FsdCA9IChpJTI9PT0wKTtcbiAgICAgICAgb1BhcmVudC5kcmF3U29saWRBcmMob1NvdW5kLl8zNjBkYXRhLm9DYW52YXMsKGlzQWx0P29QYXJlbnQuY29uZmlnLnNlZ21lbnRSaW5nQ29sb3JBbHQ6b1BhcmVudC5jb25maWcuc2VnbWVudFJpbmdDb2xvciksaXNBbHQ/d2lkdGg6d2lkdGgsIGlzQWx0P3JhZGl1cy8yOnJhZGl1cy8yLCBvUGFyZW50LmRlZzJyYWQoMzYwKihtZS5kYXRhW2ldLmVuZFRpbWVNUy9mdWxsRHVyYXRpb24pKSwgb1BhcmVudC5kZWcycmFkKDM2MCooKG1lLmRhdGFbaV0uc3RhcnRUaW1lTVN8fDEpL2Z1bGxEdXJhdGlvbikpLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgaWYgKGQtbWUubGFzdFdQRXhlYz5tZS5yZWZyZXNoSW50ZXJ2YWwpIHtcbiAgICAgICAgbWUucmVmcmVzaCgpO1xuICAgICAgICBtZS5sYXN0V1BFeGVjID0gZDtcbiAgICAgIH1cblxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gRGlzcGxheSBpbmZvIGFzIGFwcHJvcHJpYXRlXG4gICAgdmFyIGksIGosIGluZGV4ID0gbnVsbCxcbiAgICAgICAgbm93ID0gb1NvdW5kLnBvc2l0aW9uLFxuICAgICAgICBtZXRhZGF0YSA9IG9Tb3VuZC5fMzYwZGF0YS5tZXRhZGF0YS5kYXRhO1xuXG4gICAgZm9yIChpPTAsIGo9bWV0YWRhdGEubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgaWYgKG5vdyA+PSBtZXRhZGF0YVtpXS5zdGFydFRpbWVNUyAmJiBub3cgPD0gbWV0YWRhdGFbaV0uZW5kVGltZU1TKSB7XG4gICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpbmRleCAhPT0gbWV0YWRhdGEuY3VycmVudEl0ZW0gJiYgaW5kZXggPCBtZXRhZGF0YS5sZW5ndGgpIHtcbiAgICAgIC8vIHVwZGF0ZVxuICAgICAgb1NvdW5kLl8zNjBkYXRhLm9MaW5rLmlubmVySFRNTCA9IG1ldGFkYXRhLm1haW5UaXRsZSsnIDxzcGFuIGNsYXNzPVwibWV0YWRhdGFcIj48c3BhbiBjbGFzcz1cInNtMl9kaXZpZGVyXCI+IHwgPC9zcGFuPjxzcGFuIGNsYXNzPVwic20yX21ldGFkYXRhXCI+JyttZXRhZGF0YVtpbmRleF0udGl0bGUrJzwvc3Bhbj48L3NwYW4+JztcbiAgICAgIC8vIHNlbGYuc2V0UGFnZVRpdGxlKG1ldGFkYXRhW2luZGV4XS50aXRsZSsnIHwgJyttZXRhZGF0YS5tYWluVGl0bGUpO1xuICAgICAgbWV0YWRhdGEuY3VycmVudEl0ZW0gPSBpbmRleDtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLnN0clRvVGltZSA9IGZ1bmN0aW9uKHNUaW1lKSB7XG4gICAgdmFyIHNlZ21lbnRzID0gc1RpbWUuc3BsaXQoJzonKSxcbiAgICAgICAgc2Vjb25kcyA9IDAsIGk7XG4gICAgZm9yIChpPXNlZ21lbnRzLmxlbmd0aDsgaS0tOykge1xuICAgICAgc2Vjb25kcyArPSBwYXJzZUludChzZWdtZW50c1tpXSwgMTApKk1hdGgucG93KDYwLHNlZ21lbnRzLmxlbmd0aC0xLWkpOyAvLyBob3VycywgbWludXRlc1xuICAgIH1cbiAgICByZXR1cm4gc2Vjb25kcztcbiAgfTtcblxuICB0aGlzLmRhdGEgPSBbXTtcbiAgdGhpcy5kYXRhLmdpdmVuRHVyYXRpb24gPSBudWxsO1xuICB0aGlzLmRhdGEuY3VycmVudEl0ZW0gPSBudWxsO1xuICB0aGlzLmRhdGEubWFpblRpdGxlID0gb1NvdW5kLl8zNjBkYXRhLm9MaW5rLmlubmVySFRNTDtcblxuICBmb3IgKGk9MDsgaTxvSXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLmRhdGFbaV0gPSB7XG4gICAgICBvOiBudWxsLFxuICAgICAgdGl0bGU6IG9JdGVtc1tpXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpWzBdLmlubmVySFRNTCxcbiAgICAgIHN0YXJ0VGltZTogb0l0ZW1zW2ldLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0uaW5uZXJIVE1MLFxuICAgICAgc3RhcnRTZWNvbmRzOiBtZS5zdHJUb1RpbWUob0l0ZW1zW2ldLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0uaW5uZXJIVE1MLnJlcGxhY2UoL1soKV0vZywnJykpLFxuICAgICAgZHVyYXRpb246IDAsXG4gICAgICBkdXJhdGlvbk1TOiBudWxsLFxuICAgICAgc3RhcnRUaW1lTVM6IG51bGwsXG4gICAgICBlbmRUaW1lTVM6IG51bGwsXG4gICAgICBvTm90ZTogbnVsbFxuICAgIH07XG4gIH1cbiAgb0R1cmF0aW9uID0gb1BhcmVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkdXJhdGlvbicsJ2Rpdicsb0JveCk7XG4gIHRoaXMuZGF0YS5naXZlbkR1cmF0aW9uID0gKG9EdXJhdGlvbi5sZW5ndGg/bWUuc3RyVG9UaW1lKG9EdXJhdGlvblswXS5pbm5lckhUTUwpKjEwMDA6MCk7XG4gIGZvciAoaT0wOyBpPHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMuZGF0YVtpXS5kdXJhdGlvbiA9IHBhcnNlSW50KHRoaXMuZGF0YVtpKzFdP3RoaXMuZGF0YVtpKzFdLnN0YXJ0U2Vjb25kczoobWUuZGF0YS5naXZlbkR1cmF0aW9uP21lLmRhdGEuZ2l2ZW5EdXJhdGlvbjpvU291bmQuZHVyYXRpb25Fc3RpbWF0ZSkvMTAwMCwgMTApLXRoaXMuZGF0YVtpXS5zdGFydFNlY29uZHM7XG4gICAgdGhpcy5kYXRhW2ldLnN0YXJ0VGltZU1TID0gdGhpcy5kYXRhW2ldLnN0YXJ0U2Vjb25kcyoxMDAwO1xuICAgIHRoaXMuZGF0YVtpXS5kdXJhdGlvbk1TID0gdGhpcy5kYXRhW2ldLmR1cmF0aW9uKjEwMDA7XG4gICAgdGhpcy5kYXRhW2ldLmVuZFRpbWVNUyA9IHRoaXMuZGF0YVtpXS5zdGFydFRpbWVNUyt0aGlzLmRhdGFbaV0uZHVyYXRpb25NUztcbiAgICB0aGlzLnRvdGFsVGltZSArPSB0aGlzLmRhdGFbaV0uZHVyYXRpb247XG4gIH1cblxufTtcblxuaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL3dlYmtpdC9pKSAmJiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9tb2JpbGUvaSkpIHtcbiAgLy8gaVBhZCwgaVBob25lIGV0Yy5cbiAgc291bmRNYW5hZ2VyLnVzZUhUTUw1QXVkaW8gPSB0cnVlO1xufVxuXG5zb3VuZE1hbmFnZXIuZGVidWdNb2RlID0gZmFsc2U7Ly8gKHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9kZWJ1Zz0xL2kpKTsgLy8gZGlzYWJsZSBvciBlbmFibGUgZGVidWcgb3V0cHV0XG5zb3VuZE1hbmFnZXIuY29uc29sZU9ubHkgPSB0cnVlO1xuc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbiA9IDk7XG5zb3VuZE1hbmFnZXIudXNlSGlnaFBlcmZvcm1hbmNlID0gdHJ1ZTtcbnNvdW5kTWFuYWdlci51c2VGbGFzaEJsb2NrID0gdHJ1ZTtcbnNvdW5kTWFuYWdlci5mbGFzaExvYWRUaW1lb3V0ID0gMDtcblxuLy8gc291bmRNYW5hZ2VyLnVzZUZhc3RQb2xsaW5nID0gdHJ1ZTsgLy8gZm9yIG1vcmUgYWdncmVzc2l2ZSwgZmFzdGVyIFVJIHVwZGF0ZXMgKGhpZ2hlciBDUFUgdXNlKVxuXG4vLyBGUFMgZGF0YSwgdGVzdGluZy9kZWJ1ZyBvbmx5XG5pZiAoc291bmRNYW5hZ2VyLmRlYnVnTW9kZSkge1xuICB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHAgPSB3aW5kb3cudGhyZWVTaXh0eVBsYXllcjtcbiAgICBpZiAocCAmJiBwLmxhc3RTb3VuZCAmJiBwLmxhc3RTb3VuZC5fMzYwZGF0YS5mcHMgJiYgdHlwZW9mIHdpbmRvdy5pc0hvbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBzb3VuZE1hbmFnZXIuX3dyaXRlRGVidWcoJ2ZwczogficrcC5sYXN0U291bmQuXzM2MGRhdGEuZnBzKTtcbiAgICAgIHAubGFzdFNvdW5kLl8zNjBkYXRhLmZwcyA9IDA7XG4gICAgfVxuICB9LDEwMDApO1xufVxuXG4vLyBTTTJfREVGRVIgZGV0YWlsczogaHR0cDovL3d3dy5zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9kb2MvZ2V0c3RhcnRlZC8jbGF6eS1sb2FkaW5nXG5cbmlmICh3aW5kb3cuU00yX0RFRkVSID09PSBfdW5kZWZpbmVkIHx8ICFTTTJfREVGRVIpIHtcbiAgdGhyZWVTaXh0eVBsYXllciA9IG5ldyBUaHJlZVNpeHR5UGxheWVyKCk7XG59XG5cbi8qKlxuICogU291bmRNYW5hZ2VyIHB1YmxpYyBpbnRlcmZhY2VzXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblxuICAvKipcbiAgICogY29tbW9uSlMgbW9kdWxlXG4gICAqL1xuXG4gIG1vZHVsZS5leHBvcnRzLlRocmVlU2l4dHlQbGF5ZXIgPSBUaHJlZVNpeHR5UGxheWVyO1xuICBtb2R1bGUuZXhwb3J0cy50aHJlZVNpeHR5UGxheWVyID0gdGhyZWVTaXh0eVBsYXllcjtcblxufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblxuICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgdGhlIGdsb2JhbCBpbnN0YW5jZSBvZiBTb3VuZE1hbmFnZXIuXG4gICAgICogSWYgYSBnbG9iYWwgaW5zdGFuY2UgZG9lcyBub3QgZXhpc3QgaXQgY2FuIGJlIGNyZWF0ZWQgdXNpbmcgYSBjYWxsYmFjay5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHNtQnVpbGRlciBPcHRpb25hbDogQ2FsbGJhY2sgdXNlZCB0byBjcmVhdGUgYSBuZXcgU291bmRNYW5hZ2VyIGluc3RhbmNlXG4gICAgICogQHJldHVybiB7U291bmRNYW5hZ2VyfSBUaGUgZ2xvYmFsIFNvdW5kTWFuYWdlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldEluc3RhbmNlKHNtQnVpbGRlcikge1xuICAgICAgaWYgKCF3aW5kb3cudGhyZWVTaXh0eVBsYXllciAmJiBzbUJ1aWxkZXIgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBzbUJ1aWxkZXIoVGhyZWVTaXh0eVBsYXllcik7XG4gICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIFRocmVlU2l4dHlQbGF5ZXIpIHtcbiAgICAgICAgICB3aW5kb3cudGhyZWVTaXh0eVBsYXllciA9IGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gd2luZG93LnRocmVlU2l4dHlQbGF5ZXI7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBjb25zdHJ1Y3RvcjogVGhyZWVTaXh0eVBsYXllcixcbiAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxuICAgIH1cbiAgfSk7XG5cbn1cblxuLy8gc3RhbmRhcmQgYnJvd3NlciBjYXNlXG5cbi8vIGNvbnN0cnVjdG9yXG53aW5kb3cuVGhyZWVTaXh0eVBsYXllciA9IFRocmVlU2l4dHlQbGF5ZXI7XG5cbi8qKlxuICogbm90ZTogU00yIHJlcXVpcmVzIGEgd2luZG93IGdsb2JhbCBkdWUgdG8gRmxhc2gsIHdoaWNoIG1ha2VzIGNhbGxzIHRvIHdpbmRvdy5zb3VuZE1hbmFnZXIuXG4gKiBGbGFzaCBtYXkgbm90IGFsd2F5cyBiZSBuZWVkZWQsIGJ1dCB0aGlzIGlzIG5vdCBrbm93biB1bnRpbCBhc3luYyBpbml0IGFuZCBTTTIgbWF5IGV2ZW4gXCJyZWJvb3RcIiBpbnRvIEZsYXNoIG1vZGUuXG4gKi9cblxuLy8gcHVibGljIEFQSSwgZmxhc2ggY2FsbGJhY2tzIGV0Yy5cbndpbmRvdy50aHJlZVNpeHR5UGxheWVyID0gdGhyZWVTaXh0eVBsYXllcjtcblxufSh3aW5kb3cpKTtcbiJdfQ==

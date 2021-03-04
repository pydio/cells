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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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
    threeSixtyPlayer: _propTypes2['default'].object,
    autoPlay: _propTypes2['default'].bool,
    rich: _propTypes2['default'].bool.isRequired,
    onReady: _propTypes2['default'].func
};

Player.defaultProps = {
    autoPlay: false,
    rich: true
};

exports['default'] = Player;
module.exports = exports['default'];

},{"../../../sm/360-player/script/360player":7,"prop-types":"prop-types","react":"react","soundmanager2":1}],3:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc291bmRtYW5hZ2VyMi9zY3JpcHQvc291bmRtYW5hZ2VyMi5qcyIsInJlcy9idWlsZC9QeWRpb1NvdW5kTWFuYWdlci9QbGF5ZXIuanMiLCJyZXMvYnVpbGQvUHlkaW9Tb3VuZE1hbmFnZXIvYmFkZ2UuanMiLCJyZXMvYnVpbGQvUHlkaW9Tb3VuZE1hbmFnZXIvZWRpdG9yLmpzIiwicmVzL2J1aWxkL1B5ZGlvU291bmRNYW5hZ2VyL2luZGV4LmpzIiwicmVzL2J1aWxkL1B5ZGlvU291bmRNYW5hZ2VyL3ByZXZpZXcuanMiLCJzbS8zNjAtcGxheWVyL3NjcmlwdC8zNjBwbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiogQGxpY2Vuc2VcclxuICpcclxuICogU291bmRNYW5hZ2VyIDI6IEphdmFTY3JpcHQgU291bmQgZm9yIHRoZSBXZWJcclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiBodHRwOi8vc2NoaWxsbWFuaWEuY29tL3Byb2plY3RzL3NvdW5kbWFuYWdlcjIvXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAwNywgU2NvdHQgU2NoaWxsZXIuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqIENvZGUgcHJvdmlkZWQgdW5kZXIgdGhlIEJTRCBMaWNlbnNlOlxyXG4gKiBodHRwOi8vc2NoaWxsbWFuaWEuY29tL3Byb2plY3RzL3NvdW5kbWFuYWdlcjIvbGljZW5zZS50eHRcclxuICpcclxuICogVjIuOTdhLjIwMTUwNjAxXHJcbiAqL1xyXG5cclxuLypnbG9iYWwgd2luZG93LCBTTTJfREVGRVIsIHNtMkRlYnVnZ2VyLCBjb25zb2xlLCBkb2N1bWVudCwgbmF2aWdhdG9yLCBzZXRUaW1lb3V0LCBzZXRJbnRlcnZhbCwgY2xlYXJJbnRlcnZhbCwgQXVkaW8sIG9wZXJhLCBtb2R1bGUsIGRlZmluZSAqL1xyXG4vKmpzbGludCByZWdleHA6IHRydWUsIHNsb3BweTogdHJ1ZSwgd2hpdGU6IHRydWUsIG5vbWVuOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgdG9kbzogdHJ1ZSAqL1xyXG5cclxuLyoqXHJcbiAqIEFib3V0IHRoaXMgZmlsZVxyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqIFRoaXMgaXMgdGhlIGZ1bGx5LWNvbW1lbnRlZCBzb3VyY2UgdmVyc2lvbiBvZiB0aGUgU291bmRNYW5hZ2VyIDIgQVBJLFxyXG4gKiByZWNvbW1lbmRlZCBmb3IgdXNlIGR1cmluZyBkZXZlbG9wbWVudCBhbmQgdGVzdGluZy5cclxuICpcclxuICogU2VlIHNvdW5kbWFuYWdlcjItbm9kZWJ1Zy1qc21pbi5qcyBmb3IgYW4gb3B0aW1pemVkIGJ1aWxkICh+MTFLQiB3aXRoIGd6aXAuKVxyXG4gKiBodHRwOi8vc2NoaWxsbWFuaWEuY29tL3Byb2plY3RzL3NvdW5kbWFuYWdlcjIvZG9jL2dldHN0YXJ0ZWQvI2Jhc2ljLWluY2x1c2lvblxyXG4gKiBBbHRlcm5hdGVseSwgc2VydmUgdGhpcyBmaWxlIHdpdGggZ3ppcCBmb3IgNzUlIGNvbXByZXNzaW9uIHNhdmluZ3MgKH4zMEtCIG92ZXIgSFRUUC4pXHJcbiAqXHJcbiAqIFlvdSBtYXkgbm90aWNlIDxkPiBhbmQgPC9kPiBjb21tZW50cyBpbiB0aGlzIHNvdXJjZTsgdGhlc2UgYXJlIGRlbGltaXRlcnMgZm9yXHJcbiAqIGRlYnVnIGJsb2NrcyB3aGljaCBhcmUgcmVtb3ZlZCBpbiB0aGUgLW5vZGVidWcgYnVpbGRzLCBmdXJ0aGVyIG9wdGltaXppbmcgY29kZSBzaXplLlxyXG4gKlxyXG4gKiBBbHNvLCBhcyB5b3UgbWF5IG5vdGU6IFdob2EsIHJlbGlhYmxlIGNyb3NzLXBsYXRmb3JtL2RldmljZSBhdWRpbyBzdXBwb3J0IGlzIGhhcmQhIDspXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uKHdpbmRvdywgX3VuZGVmaW5lZCkge1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pZiAoIXdpbmRvdyB8fCAhd2luZG93LmRvY3VtZW50KSB7XHJcblxyXG4gIC8vIERvbid0IGNyb3NzIHRoZSBbZW52aXJvbm1lbnRdIHN0cmVhbXMuIFNNMiBleHBlY3RzIHRvIGJlIHJ1bm5pbmcgaW4gYSBicm93c2VyLCBub3QgdW5kZXIgbm9kZS5qcyBldGMuXHJcbiAgLy8gQWRkaXRpb25hbGx5LCBpZiBhIGJyb3dzZXIgc29tZWhvdyBtYW5hZ2VzIHRvIGZhaWwgdGhpcyB0ZXN0LCBhcyBFZ29uIHNhaWQ6IFwiSXQgd291bGQgYmUgYmFkLlwiXHJcblxyXG4gIHRocm93IG5ldyBFcnJvcignU291bmRNYW5hZ2VyIHJlcXVpcmVzIGEgYnJvd3NlciB3aXRoIHdpbmRvdyBhbmQgZG9jdW1lbnQgb2JqZWN0cy4nKTtcclxuXHJcbn1cclxuXHJcbnZhciBzb3VuZE1hbmFnZXIgPSBudWxsO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBTb3VuZE1hbmFnZXIgY29uc3RydWN0b3IuXHJcbiAqXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc21VUkwgT3B0aW9uYWw6IFBhdGggdG8gU1dGIGZpbGVzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzbUlEIE9wdGlvbmFsOiBUaGUgSUQgdG8gdXNlIGZvciB0aGUgU1dGIGNvbnRhaW5lciBlbGVtZW50XHJcbiAqIEB0aGlzIHtTb3VuZE1hbmFnZXJ9XHJcbiAqIEByZXR1cm4ge1NvdW5kTWFuYWdlcn0gVGhlIG5ldyBTb3VuZE1hbmFnZXIgaW5zdGFuY2VcclxuICovXHJcblxyXG5mdW5jdGlvbiBTb3VuZE1hbmFnZXIoc21VUkwsIHNtSUQpIHtcclxuXHJcbiAgLyoqXHJcbiAgICogc291bmRNYW5hZ2VyIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBsaXN0XHJcbiAgICogZGVmaW5lcyB0b3AtbGV2ZWwgY29uZmlndXJhdGlvbiBwcm9wZXJ0aWVzIHRvIGJlIGFwcGxpZWQgdG8gdGhlIHNvdW5kTWFuYWdlciBpbnN0YW5jZSAoZWcuIHNvdW5kTWFuYWdlci5mbGFzaFZlcnNpb24pXHJcbiAgICogdG8gc2V0IHRoZXNlIHByb3BlcnRpZXMsIHVzZSB0aGUgc2V0dXAoKSBtZXRob2QgLSBlZy4sIHNvdW5kTWFuYWdlci5zZXR1cCh7dXJsOiAnL3N3Zi8nLCBmbGFzaFZlcnNpb246IDl9KVxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldHVwT3B0aW9ucyA9IHtcclxuXHJcbiAgICAndXJsJzogKHNtVVJMIHx8IG51bGwpLCAgICAgICAgICAgICAvLyBwYXRoIChkaXJlY3RvcnkpIHdoZXJlIFNvdW5kTWFuYWdlciAyIFNXRnMgZXhpc3QsIGVnLiwgL3BhdGgvdG8vc3dmcy9cclxuICAgICdmbGFzaFZlcnNpb24nOiA4LCAgICAgICAgICAgICAgICAgIC8vIGZsYXNoIGJ1aWxkIHRvIHVzZSAoOCBvciA5LikgU29tZSBBUEkgZmVhdHVyZXMgcmVxdWlyZSA5LlxyXG4gICAgJ2RlYnVnTW9kZSc6IHRydWUsICAgICAgICAgICAgICAgICAgLy8gZW5hYmxlIGRlYnVnZ2luZyBvdXRwdXQgKGNvbnNvbGUubG9nKCkgd2l0aCBIVE1MIGZhbGxiYWNrKVxyXG4gICAgJ2RlYnVnRmxhc2gnOiBmYWxzZSwgICAgICAgICAgICAgICAgLy8gZW5hYmxlIGRlYnVnZ2luZyBvdXRwdXQgaW5zaWRlIFNXRiwgdHJvdWJsZXNob290IEZsYXNoL2Jyb3dzZXIgaXNzdWVzXHJcbiAgICAndXNlQ29uc29sZSc6IHRydWUsICAgICAgICAgICAgICAgICAvLyB1c2UgY29uc29sZS5sb2coKSBpZiBhdmFpbGFibGUgKG90aGVyd2lzZSwgd3JpdGVzIHRvICNzb3VuZG1hbmFnZXItZGVidWcgZWxlbWVudClcclxuICAgICdjb25zb2xlT25seSc6IHRydWUsICAgICAgICAgICAgICAgIC8vIGlmIGNvbnNvbGUgaXMgYmVpbmcgdXNlZCwgZG8gbm90IGNyZWF0ZS93cml0ZSB0byAjc291bmRtYW5hZ2VyLWRlYnVnXHJcbiAgICAnd2FpdEZvcldpbmRvd0xvYWQnOiBmYWxzZSwgICAgICAgICAvLyBmb3JjZSBTTTIgdG8gd2FpdCBmb3Igd2luZG93Lm9ubG9hZCgpIGJlZm9yZSB0cnlpbmcgdG8gY2FsbCBzb3VuZE1hbmFnZXIub25sb2FkKClcclxuICAgICdiZ0NvbG9yJzogJyNmZmZmZmYnLCAgICAgICAgICAgICAgIC8vIFNXRiBiYWNrZ3JvdW5kIGNvbG9yLiBOL0Egd2hlbiB3bW9kZSA9ICd0cmFuc3BhcmVudCdcclxuICAgICd1c2VIaWdoUGVyZm9ybWFuY2UnOiBmYWxzZSwgICAgICAgIC8vIHBvc2l0aW9uOmZpeGVkIGZsYXNoIG1vdmllIGNhbiBoZWxwIGluY3JlYXNlIGpzL2ZsYXNoIHNwZWVkLCBtaW5pbWl6ZSBsYWdcclxuICAgICdmbGFzaFBvbGxpbmdJbnRlcnZhbCc6IG51bGwsICAgICAgIC8vIG1zZWMgYWZmZWN0aW5nIHdoaWxlcGxheWluZy9sb2FkaW5nIGNhbGxiYWNrIGZyZXF1ZW5jeS4gSWYgbnVsbCwgZGVmYXVsdCBvZiA1MCBtc2VjIGlzIHVzZWQuXHJcbiAgICAnaHRtbDVQb2xsaW5nSW50ZXJ2YWwnOiBudWxsLCAgICAgICAvLyBtc2VjIGFmZmVjdGluZyB3aGlsZXBsYXlpbmcoKSBmb3IgSFRNTDUgYXVkaW8sIGV4Y2x1ZGluZyBtb2JpbGUgZGV2aWNlcy4gSWYgbnVsbCwgbmF0aXZlIEhUTUw1IHVwZGF0ZSBldmVudHMgYXJlIHVzZWQuXHJcbiAgICAnZmxhc2hMb2FkVGltZW91dCc6IDEwMDAsICAgICAgICAgICAvLyBtc2VjIHRvIHdhaXQgZm9yIGZsYXNoIG1vdmllIHRvIGxvYWQgYmVmb3JlIGZhaWxpbmcgKDAgPSBpbmZpbml0eSlcclxuICAgICd3bW9kZSc6IG51bGwsICAgICAgICAgICAgICAgICAgICAgIC8vIGZsYXNoIHJlbmRlcmluZyBtb2RlIC0gbnVsbCwgJ3RyYW5zcGFyZW50Jywgb3IgJ29wYXF1ZScgKGxhc3QgdHdvIGFsbG93IHotaW5kZXggdG8gd29yaylcclxuICAgICdhbGxvd1NjcmlwdEFjY2Vzcyc6ICdhbHdheXMnLCAgICAgIC8vIGZvciBzY3JpcHRpbmcgdGhlIFNXRiAob2JqZWN0L2VtYmVkIHByb3BlcnR5KSwgJ2Fsd2F5cycgb3IgJ3NhbWVEb21haW4nXHJcbiAgICAndXNlRmxhc2hCbG9jayc6IGZhbHNlLCAgICAgICAgICAgICAvLyAqcmVxdWlyZXMgZmxhc2hibG9jay5jc3MsIHNlZSBkZW1vcyogLSBhbGxvdyByZWNvdmVyeSBmcm9tIGZsYXNoIGJsb2NrZXJzLiBXYWl0IGluZGVmaW5pdGVseSBhbmQgYXBwbHkgdGltZW91dCBDU1MgdG8gU1dGLCBpZiBhcHBsaWNhYmxlLlxyXG4gICAgJ3VzZUhUTUw1QXVkaW8nOiB0cnVlLCAgICAgICAgICAgICAgLy8gdXNlIEhUTUw1IEF1ZGlvKCkgd2hlcmUgQVBJIGlzIHN1cHBvcnRlZCAobW9zdCBTYWZhcmksIENocm9tZSB2ZXJzaW9ucyksIEZpcmVmb3ggKE1QMy9NUDQgc3VwcG9ydCB2YXJpZXMuKSBJZGVhbGx5LCB0cmFuc3BhcmVudCB2cy4gRmxhc2ggQVBJIHdoZXJlIHBvc3NpYmxlLlxyXG4gICAgJ2ZvcmNlVXNlR2xvYmFsSFRNTDVBdWRpbyc6IGZhbHNlLCAgLy8gaWYgdHJ1ZSwgYSBzaW5nbGUgQXVkaW8oKSBvYmplY3QgaXMgdXNlZCBmb3IgYWxsIHNvdW5kcyAtIGFuZCBvbmx5IG9uZSBjYW4gcGxheSBhdCBhIHRpbWUuXHJcbiAgICAnaWdub3JlTW9iaWxlUmVzdHJpY3Rpb25zJzogZmFsc2UsICAvLyBpZiB0cnVlLCBTTTIgd2lsbCBub3QgYXBwbHkgZ2xvYmFsIEhUTUw1IGF1ZGlvIHJ1bGVzIHRvIG1vYmlsZSBVQXMuIGlPUyA+IDcgYW5kIFdlYlZpZXdzIG1heSBhbGxvdyBtdWx0aXBsZSBBdWRpbygpIGluc3RhbmNlcy5cclxuICAgICdodG1sNVRlc3QnOiAvXihwcm9iYWJseXxtYXliZSkkL2ksIC8vIEhUTUw1IEF1ZGlvKCkgZm9ybWF0IHN1cHBvcnQgdGVzdC4gVXNlIC9ecHJvYmFibHkkL2k7IGlmIHlvdSB3YW50IHRvIGJlIG1vcmUgY29uc2VydmF0aXZlLlxyXG4gICAgJ3ByZWZlckZsYXNoJzogZmFsc2UsICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGVzIHVzZUhUTUw1YXVkaW8sIHdpbGwgdXNlIEZsYXNoIGZvciBNUDMvTVA0L0FBQyBpZiBwcmVzZW50LiBQb3RlbnRpYWwgb3B0aW9uIGlmIEhUTUw1IHBsYXliYWNrIHdpdGggdGhlc2UgZm9ybWF0cyBpcyBxdWlya3kuXHJcbiAgICAnbm9TV0ZDYWNoZSc6IGZhbHNlLCAgICAgICAgICAgICAgICAvLyBpZiB0cnVlLCBhcHBlbmRzID90cz17ZGF0ZX0gdG8gYnJlYWsgYWdncmVzc2l2ZSBTV0YgY2FjaGluZy5cclxuICAgICdpZFByZWZpeCc6ICdzb3VuZCcgICAgICAgICAgICAgICAgIC8vIGlmIGFuIGlkIGlzIG5vdCBwcm92aWRlZCB0byBjcmVhdGVTb3VuZCgpLCB0aGlzIHByZWZpeCBpcyB1c2VkIGZvciBnZW5lcmF0ZWQgSURzIC0gJ3NvdW5kMCcsICdzb3VuZDEnIGV0Yy5cclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5kZWZhdWx0T3B0aW9ucyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHNvdW5kIG9iamVjdHMgbWFkZSB3aXRoIGNyZWF0ZVNvdW5kKCkgYW5kIHJlbGF0ZWQgbWV0aG9kc1xyXG4gICAgICogZWcuLCB2b2x1bWUsIGF1dG8tbG9hZCBiZWhhdmlvdXIgYW5kIHNvIGZvcnRoXHJcbiAgICAgKi9cclxuXHJcbiAgICAnYXV0b0xvYWQnOiBmYWxzZSwgICAgICAgIC8vIGVuYWJsZSBhdXRvbWF0aWMgbG9hZGluZyAob3RoZXJ3aXNlIC5sb2FkKCkgd2lsbCBiZSBjYWxsZWQgb24gZGVtYW5kIHdpdGggLnBsYXkoKSwgdGhlIGxhdHRlciBiZWluZyBuaWNlciBvbiBiYW5kd2lkdGggLSBpZiB5b3Ugd2FudCB0byAubG9hZCB5b3Vyc2VsZiwgeW91IGFsc28gY2FuKVxyXG4gICAgJ2F1dG9QbGF5JzogZmFsc2UsICAgICAgICAvLyBlbmFibGUgcGxheWluZyBvZiBmaWxlIGFzIHNvb24gYXMgcG9zc2libGUgKG11Y2ggZmFzdGVyIGlmIFwic3RyZWFtXCIgaXMgdHJ1ZSlcclxuICAgICdmcm9tJzogbnVsbCwgICAgICAgICAgICAgLy8gcG9zaXRpb24gdG8gc3RhcnQgcGxheWJhY2sgd2l0aGluIGEgc291bmQgKG1zZWMpLCBkZWZhdWx0ID0gYmVnaW5uaW5nXHJcbiAgICAnbG9vcHMnOiAxLCAgICAgICAgICAgICAgIC8vIGhvdyBtYW55IHRpbWVzIHRvIHJlcGVhdCB0aGUgc291bmQgKHBvc2l0aW9uIHdpbGwgd3JhcCBhcm91bmQgdG8gMCwgc2V0UG9zaXRpb24oKSB3aWxsIGJyZWFrIG91dCBvZiBsb29wIHdoZW4gPjApXHJcbiAgICAnb25pZDMnOiBudWxsLCAgICAgICAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBcIklEMyBkYXRhIGlzIGFkZGVkL2F2YWlsYWJsZVwiXHJcbiAgICAnb25sb2FkJzogbnVsbCwgICAgICAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBcImxvYWQgZmluaXNoZWRcIlxyXG4gICAgJ3doaWxlbG9hZGluZyc6IG51bGwsICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3IgXCJkb3dubG9hZCBwcm9ncmVzcyB1cGRhdGVcIiAoWCBvZiBZIGJ5dGVzIHJlY2VpdmVkKVxyXG4gICAgJ29ucGxheSc6IG51bGwsICAgICAgICAgICAvLyBjYWxsYmFjayBmb3IgXCJwbGF5XCIgc3RhcnRcclxuICAgICdvbnBhdXNlJzogbnVsbCwgICAgICAgICAgLy8gY2FsbGJhY2sgZm9yIFwicGF1c2VcIlxyXG4gICAgJ29ucmVzdW1lJzogbnVsbCwgICAgICAgICAvLyBjYWxsYmFjayBmb3IgXCJyZXN1bWVcIiAocGF1c2UgdG9nZ2xlKVxyXG4gICAgJ3doaWxlcGxheWluZyc6IG51bGwsICAgICAvLyBjYWxsYmFjayBkdXJpbmcgcGxheSAocG9zaXRpb24gdXBkYXRlKVxyXG4gICAgJ29ucG9zaXRpb24nOiBudWxsLCAgICAgICAvLyBvYmplY3QgY29udGFpbmluZyB0aW1lcyBhbmQgZnVuY3Rpb24gY2FsbGJhY2tzIGZvciBwb3NpdGlvbnMgb2YgaW50ZXJlc3RcclxuICAgICdvbnN0b3AnOiBudWxsLCAgICAgICAgICAgLy8gY2FsbGJhY2sgZm9yIFwidXNlciBzdG9wXCJcclxuICAgICdvbmZhaWx1cmUnOiBudWxsLCAgICAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHdoZW4gcGxheWluZyBmYWlsc1xyXG4gICAgJ29uZmluaXNoJzogbnVsbCwgICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3IgXCJzb3VuZCBmaW5pc2hlZCBwbGF5aW5nXCJcclxuICAgICdtdWx0aVNob3QnOiB0cnVlLCAgICAgICAgLy8gbGV0IHNvdW5kcyBcInJlc3RhcnRcIiBvciBsYXllciBvbiB0b3Agb2YgZWFjaCBvdGhlciB3aGVuIHBsYXllZCBtdWx0aXBsZSB0aW1lcywgcmF0aGVyIHRoYW4gb25lLXNob3Qvb25lIGF0IGEgdGltZVxyXG4gICAgJ211bHRpU2hvdEV2ZW50cyc6IGZhbHNlLCAvLyBmaXJlIG11bHRpcGxlIHNvdW5kIGV2ZW50cyAoY3VycmVudGx5IG9uZmluaXNoKCkgb25seSkgd2hlbiBtdWx0aVNob3QgaXMgZW5hYmxlZFxyXG4gICAgJ3Bvc2l0aW9uJzogbnVsbCwgICAgICAgICAvLyBvZmZzZXQgKG1pbGxpc2Vjb25kcykgdG8gc2VlayB0byB3aXRoaW4gbG9hZGVkIHNvdW5kIGRhdGEuXHJcbiAgICAncGFuJzogMCwgICAgICAgICAgICAgICAgIC8vIFwicGFuXCIgc2V0dGluZ3MsIGxlZnQtdG8tcmlnaHQsIC0xMDAgdG8gMTAwXHJcbiAgICAnc3RyZWFtJzogdHJ1ZSwgICAgICAgICAgIC8vIGFsbG93cyBwbGF5aW5nIGJlZm9yZSBlbnRpcmUgZmlsZSBoYXMgbG9hZGVkIChyZWNvbW1lbmRlZClcclxuICAgICd0byc6IG51bGwsICAgICAgICAgICAgICAgLy8gcG9zaXRpb24gdG8gZW5kIHBsYXliYWNrIHdpdGhpbiBhIHNvdW5kIChtc2VjKSwgZGVmYXVsdCA9IGVuZFxyXG4gICAgJ3R5cGUnOiBudWxsLCAgICAgICAgICAgICAvLyBNSU1FLWxpa2UgaGludCBmb3IgZmlsZSBwYXR0ZXJuIC8gY2FuUGxheSgpIHRlc3RzLCBlZy4gYXVkaW8vbXAzXHJcbiAgICAndXNlUG9saWN5RmlsZSc6IGZhbHNlLCAgIC8vIGVuYWJsZSBjcm9zc2RvbWFpbi54bWwgcmVxdWVzdCBmb3IgYXVkaW8gb24gcmVtb3RlIGRvbWFpbnMgKGZvciBJRDMvd2F2ZWZvcm0gYWNjZXNzKVxyXG4gICAgJ3ZvbHVtZSc6IDEwMCAgICAgICAgICAgICAvLyBzZWxmLWV4cGxhbmF0b3J5LiAwLTEwMCwgdGhlIGxhdHRlciBiZWluZyB0aGUgbWF4LlxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLmZsYXNoOU9wdGlvbnMgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmbGFzaCA5LW9ubHkgb3B0aW9ucyxcclxuICAgICAqIG1lcmdlZCBpbnRvIGRlZmF1bHRPcHRpb25zIGlmIGZsYXNoIDkgaXMgYmVpbmcgdXNlZFxyXG4gICAgICovXHJcblxyXG4gICAgJ2lzTW92aWVTdGFyJzogbnVsbCwgICAgICAvLyBcIk1vdmllU3RhclwiIE1QRUc0IGF1ZGlvIG1vZGUuIE51bGwgKGRlZmF1bHQpID0gYXV0byBkZXRlY3QgTVA0LCBBQUMgZXRjLiBiYXNlZCBvbiBVUkwuIHRydWUgPSBmb3JjZSBvbiwgaWdub3JlIFVSTFxyXG4gICAgJ3VzZVBlYWtEYXRhJzogZmFsc2UsICAgICAvLyBlbmFibGUgbGVmdC9yaWdodCBjaGFubmVsIHBlYWsgKGxldmVsKSBkYXRhXHJcbiAgICAndXNlV2F2ZWZvcm1EYXRhJzogZmFsc2UsIC8vIGVuYWJsZSBzb3VuZCBzcGVjdHJ1bSAocmF3IHdhdmVmb3JtIGRhdGEpIC0gTk9URTogTWF5IGluY3JlYXNlIENQVSBsb2FkLlxyXG4gICAgJ3VzZUVRRGF0YSc6IGZhbHNlLCAgICAgICAvLyBlbmFibGUgc291bmQgRVEgKGZyZXF1ZW5jeSBzcGVjdHJ1bSBkYXRhKSAtIE5PVEU6IE1heSBpbmNyZWFzZSBDUFUgbG9hZC5cclxuICAgICdvbmJ1ZmZlcmNoYW5nZSc6IG51bGwsICAgLy8gY2FsbGJhY2sgZm9yIFwiaXNCdWZmZXJpbmdcIiBwcm9wZXJ0eSBjaGFuZ2VcclxuICAgICdvbmRhdGFlcnJvcic6IG51bGwgICAgICAgLy8gY2FsbGJhY2sgZm9yIHdhdmVmb3JtL2VxIGRhdGEgYWNjZXNzIGVycm9yIChmbGFzaCBwbGF5aW5nIGF1ZGlvIGluIG90aGVyIHRhYnMvZG9tYWlucylcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5tb3ZpZVN0YXJPcHRpb25zID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmxhc2ggOS4wcjExNSsgTVBFRzQgYXVkaW8gb3B0aW9ucyxcclxuICAgICAqIG1lcmdlZCBpbnRvIGRlZmF1bHRPcHRpb25zIGlmIGZsYXNoIDkrbW92aWVTdGFyIG1vZGUgaXMgZW5hYmxlZFxyXG4gICAgICovXHJcblxyXG4gICAgJ2J1ZmZlclRpbWUnOiAzLCAgICAgICAgICAvLyBzZWNvbmRzIG9mIGRhdGEgdG8gYnVmZmVyIGJlZm9yZSBwbGF5YmFjayBiZWdpbnMgKG51bGwgPSBmbGFzaCBkZWZhdWx0IG9mIDAuMSBzZWNvbmRzIC0gaWYgQUFDIHBsYXliYWNrIGlzIGdhcHB5LCB0cnkgaW5jcmVhc2luZy4pXHJcbiAgICAnc2VydmVyVVJMJzogbnVsbCwgICAgICAgIC8vIHJ0bXA6IEZNUyBvciBGTUlTIHNlcnZlciB0byBjb25uZWN0IHRvLCByZXF1aXJlZCB3aGVuIHJlcXVlc3RpbmcgbWVkaWEgdmlhIFJUTVAgb3Igb25lIG9mIGl0cyB2YXJpYW50c1xyXG4gICAgJ29uY29ubmVjdCc6IG51bGwsICAgICAgICAvLyBydG1wOiBjYWxsYmFjayBmb3IgY29ubmVjdGlvbiB0byBmbGFzaCBtZWRpYSBzZXJ2ZXJcclxuICAgICdkdXJhdGlvbic6IG51bGwgICAgICAgICAgLy8gcnRtcDogc29uZyBkdXJhdGlvbiAobXNlYylcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5hdWRpb0Zvcm1hdHMgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlcm1pbmVzIEhUTUw1IHN1cHBvcnQgKyBmbGFzaCByZXF1aXJlbWVudHMuXHJcbiAgICAgKiBpZiBubyBzdXBwb3J0ICh2aWEgZmxhc2ggYW5kL29yIEhUTUw1KSBmb3IgYSBcInJlcXVpcmVkXCIgZm9ybWF0LCBTTTIgd2lsbCBmYWlsIHRvIHN0YXJ0LlxyXG4gICAgICogZmxhc2ggZmFsbGJhY2sgaXMgdXNlZCBmb3IgTVAzIG9yIE1QNCBpZiBIVE1MNSBjYW4ndCBwbGF5IGl0IChvciBpZiBwcmVmZXJGbGFzaCA9IHRydWUpXHJcbiAgICAgKi9cclxuXHJcbiAgICAnbXAzJzoge1xyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vbXBlZzsgY29kZWNzPVwibXAzXCInLCAnYXVkaW8vbXBlZycsICdhdWRpby9tcDMnLCAnYXVkaW8vTVBBJywgJ2F1ZGlvL21wYS1yb2J1c3QnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogdHJ1ZVxyXG4gICAgfSxcclxuXHJcbiAgICAnbXA0Jzoge1xyXG4gICAgICAncmVsYXRlZCc6IFsnYWFjJywnbTRhJywnbTRiJ10sIC8vIGFkZGl0aW9uYWwgZm9ybWF0cyB1bmRlciB0aGUgTVA0IGNvbnRhaW5lclxyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vbXA0OyBjb2RlY3M9XCJtcDRhLjQwLjJcIicsICdhdWRpby9hYWMnLCAnYXVkaW8veC1tNGEnLCAnYXVkaW8vTVA0QS1MQVRNJywgJ2F1ZGlvL21wZWc0LWdlbmVyaWMnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogZmFsc2VcclxuICAgIH0sXHJcblxyXG4gICAgJ29nZyc6IHtcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL29nZzsgY29kZWNzPXZvcmJpcyddLFxyXG4gICAgICAncmVxdWlyZWQnOiBmYWxzZVxyXG4gICAgfSxcclxuXHJcbiAgICAnb3B1cyc6IHtcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL29nZzsgY29kZWNzPW9wdXMnLCAnYXVkaW8vb3B1cyddLFxyXG4gICAgICAncmVxdWlyZWQnOiBmYWxzZVxyXG4gICAgfSxcclxuXHJcbiAgICAnd2F2Jzoge1xyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vd2F2OyBjb2RlY3M9XCIxXCInLCAnYXVkaW8vd2F2JywgJ2F1ZGlvL3dhdmUnLCAnYXVkaW8veC13YXYnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogZmFsc2VcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gSFRNTCBhdHRyaWJ1dGVzIChpZCArIGNsYXNzIG5hbWVzKSBmb3IgdGhlIFNXRiBjb250YWluZXJcclxuXHJcbiAgdGhpcy5tb3ZpZUlEID0gJ3NtMi1jb250YWluZXInO1xyXG4gIHRoaXMuaWQgPSAoc21JRCB8fCAnc20ybW92aWUnKTtcclxuXHJcbiAgdGhpcy5kZWJ1Z0lEID0gJ3NvdW5kbWFuYWdlci1kZWJ1Zyc7XHJcbiAgdGhpcy5kZWJ1Z1VSTFBhcmFtID0gLyhbIz8mXSlkZWJ1Zz0xL2k7XHJcblxyXG4gIC8vIGR5bmFtaWMgYXR0cmlidXRlc1xyXG5cclxuICB0aGlzLnZlcnNpb25OdW1iZXIgPSAnVjIuOTdhLjIwMTUwNjAxJztcclxuICB0aGlzLnZlcnNpb24gPSBudWxsO1xyXG4gIHRoaXMubW92aWVVUkwgPSBudWxsO1xyXG4gIHRoaXMuYWx0VVJMID0gbnVsbDtcclxuICB0aGlzLnN3ZkxvYWRlZCA9IGZhbHNlO1xyXG4gIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMub01DID0gbnVsbDtcclxuICB0aGlzLnNvdW5kcyA9IHt9O1xyXG4gIHRoaXMuc291bmRJRHMgPSBbXTtcclxuICB0aGlzLm11dGVkID0gZmFsc2U7XHJcbiAgdGhpcy5kaWRGbGFzaEJsb2NrID0gZmFsc2U7XHJcbiAgdGhpcy5maWxlUGF0dGVybiA9IG51bGw7XHJcblxyXG4gIHRoaXMuZmlsZVBhdHRlcm5zID0ge1xyXG4gICAgJ2ZsYXNoOCc6IC9cXC5tcDMoXFw/LiopPyQvaSxcclxuICAgICdmbGFzaDknOiAvXFwubXAzKFxcPy4qKT8kL2lcclxuICB9O1xyXG5cclxuICAvLyBzdXBwb3J0IGluZGljYXRvcnMsIHNldCBhdCBpbml0XHJcblxyXG4gIHRoaXMuZmVhdHVyZXMgPSB7XHJcbiAgICAnYnVmZmVyaW5nJzogZmFsc2UsXHJcbiAgICAncGVha0RhdGEnOiBmYWxzZSxcclxuICAgICd3YXZlZm9ybURhdGEnOiBmYWxzZSxcclxuICAgICdlcURhdGEnOiBmYWxzZSxcclxuICAgICdtb3ZpZVN0YXInOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIC8vIGZsYXNoIHNhbmRib3ggaW5mbywgdXNlZCBwcmltYXJpbHkgaW4gdHJvdWJsZXNob290aW5nXHJcblxyXG4gIHRoaXMuc2FuZGJveCA9IHtcclxuICAgIC8vIDxkPlxyXG4gICAgJ3R5cGUnOiBudWxsLFxyXG4gICAgJ3R5cGVzJzoge1xyXG4gICAgICAncmVtb3RlJzogJ3JlbW90ZSAoZG9tYWluLWJhc2VkKSBydWxlcycsXHJcbiAgICAgICdsb2NhbFdpdGhGaWxlJzogJ2xvY2FsIHdpdGggZmlsZSBhY2Nlc3MgKG5vIGludGVybmV0IGFjY2VzcyknLFxyXG4gICAgICAnbG9jYWxXaXRoTmV0d29yayc6ICdsb2NhbCB3aXRoIG5ldHdvcmsgKGludGVybmV0IGFjY2VzcyBvbmx5LCBubyBsb2NhbCBhY2Nlc3MpJyxcclxuICAgICAgJ2xvY2FsVHJ1c3RlZCc6ICdsb2NhbCwgdHJ1c3RlZCAobG9jYWwraW50ZXJuZXQgYWNjZXNzKSdcclxuICAgIH0sXHJcbiAgICAnZGVzY3JpcHRpb24nOiBudWxsLFxyXG4gICAgJ25vUmVtb3RlJzogbnVsbCxcclxuICAgICdub0xvY2FsJzogbnVsbFxyXG4gICAgLy8gPC9kPlxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIGZvcm1hdCBzdXBwb3J0IChodG1sNS9mbGFzaClcclxuICAgKiBzdG9yZXMgY2FuUGxheVR5cGUoKSByZXN1bHRzIGJhc2VkIG9uIGF1ZGlvRm9ybWF0cy5cclxuICAgKiBlZy4geyBtcDM6IGJvb2xlYW4sIG1wNDogYm9vbGVhbiB9XHJcbiAgICogdHJlYXQgYXMgcmVhZC1vbmx5LlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmh0bWw1ID0ge1xyXG4gICAgJ3VzaW5nRmxhc2gnOiBudWxsIC8vIHNldCBpZi93aGVuIGZsYXNoIGZhbGxiYWNrIGlzIG5lZWRlZFxyXG4gIH07XHJcblxyXG4gIC8vIGZpbGUgdHlwZSBzdXBwb3J0IGhhc2hcclxuICB0aGlzLmZsYXNoID0ge307XHJcblxyXG4gIC8vIGRldGVybWluZWQgYXQgaW5pdCB0aW1lXHJcbiAgdGhpcy5odG1sNU9ubHkgPSBmYWxzZTtcclxuXHJcbiAgLy8gdXNlZCBmb3Igc3BlY2lhbCBjYXNlcyAoZWcuIGlQYWQvaVBob25lL3BhbG0gT1M/KVxyXG4gIHRoaXMuaWdub3JlRmxhc2ggPSBmYWxzZTtcclxuXHJcbiAgLyoqXHJcbiAgICogYSBmZXcgcHJpdmF0ZSBpbnRlcm5hbHMgKE9LLCBhIGxvdC4gOkQpXHJcbiAgICovXHJcblxyXG4gIHZhciBTTVNvdW5kLFxyXG4gIHNtMiA9IHRoaXMsIGdsb2JhbEhUTUw1QXVkaW8gPSBudWxsLCBmbGFzaCA9IG51bGwsIHNtID0gJ3NvdW5kTWFuYWdlcicsIHNtYyA9IHNtICsgJzogJywgaDUgPSAnSFRNTDU6OicsIGlkLCB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQsIHdsID0gd2luZG93LmxvY2F0aW9uLmhyZWYudG9TdHJpbmcoKSwgZG9jID0gZG9jdW1lbnQsIGRvTm90aGluZywgc2V0UHJvcGVydGllcywgaW5pdCwgZlYsIG9uX3F1ZXVlID0gW10sIGRlYnVnT3BlbiA9IHRydWUsIGRlYnVnVFMsIGRpZEFwcGVuZCA9IGZhbHNlLCBhcHBlbmRTdWNjZXNzID0gZmFsc2UsIGRpZEluaXQgPSBmYWxzZSwgZGlzYWJsZWQgPSBmYWxzZSwgd2luZG93TG9hZGVkID0gZmFsc2UsIF93RFMsIHdkQ291bnQgPSAwLCBpbml0Q29tcGxldGUsIG1peGluLCBhc3NpZ24sIGV4dHJhT3B0aW9ucywgYWRkT25FdmVudCwgcHJvY2Vzc09uRXZlbnRzLCBpbml0VXNlck9ubG9hZCwgZGVsYXlXYWl0Rm9yRUksIHdhaXRGb3JFSSwgcmVib290SW50b0hUTUw1LCBzZXRWZXJzaW9uSW5mbywgaGFuZGxlRm9jdXMsIHN0cmluZ3MsIGluaXRNb3ZpZSwgZG9tQ29udGVudExvYWRlZCwgd2luT25Mb2FkLCBkaWREQ0xvYWRlZCwgZ2V0RG9jdW1lbnQsIGNyZWF0ZU1vdmllLCBjYXRjaEVycm9yLCBzZXRQb2xsaW5nLCBpbml0RGVidWcsIGRlYnVnTGV2ZWxzID0gWydsb2cnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJ10sIGRlZmF1bHRGbGFzaFZlcnNpb24gPSA4LCBkaXNhYmxlT2JqZWN0LCBmYWlsU2FmZWx5LCBub3JtYWxpemVNb3ZpZVVSTCwgb1JlbW92ZWQgPSBudWxsLCBvUmVtb3ZlZEhUTUwgPSBudWxsLCBzdHIsIGZsYXNoQmxvY2tIYW5kbGVyLCBnZXRTV0ZDU1MsIHN3ZkNTUywgdG9nZ2xlRGVidWcsIGxvb3BGaXgsIHBvbGljeUZpeCwgY29tcGxhaW4sIGlkQ2hlY2ssIHdhaXRpbmdGb3JFSSA9IGZhbHNlLCBpbml0UGVuZGluZyA9IGZhbHNlLCBzdGFydFRpbWVyLCBzdG9wVGltZXIsIHRpbWVyRXhlY3V0ZSwgaDVUaW1lckNvdW50ID0gMCwgaDVJbnRlcnZhbFRpbWVyID0gbnVsbCwgcGFyc2VVUkwsIG1lc3NhZ2VzID0gW10sXHJcbiAgY2FuSWdub3JlRmxhc2gsIG5lZWRzRmxhc2ggPSBudWxsLCBmZWF0dXJlQ2hlY2ssIGh0bWw1T0ssIGh0bWw1Q2FuUGxheSwgaHRtbDVFeHQsIGh0bWw1VW5sb2FkLCBkb21Db250ZW50TG9hZGVkSUUsIHRlc3RIVE1MNSwgZXZlbnQsIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLCB1c2VHbG9iYWxIVE1MNUF1ZGlvID0gZmFsc2UsIGxhc3RHbG9iYWxIVE1MNVVSTCwgaGFzRmxhc2gsIGRldGVjdEZsYXNoLCBiYWRTYWZhcmlGaXgsIGh0bWw1X2V2ZW50cywgc2hvd1N1cHBvcnQsIGZsdXNoTWVzc2FnZXMsIHdyYXBDYWxsYmFjaywgaWRDb3VudGVyID0gMCwgZGlkU2V0dXAsIG1zZWNTY2FsZSA9IDEwMDAsXHJcbiAgaXNfaURldmljZSA9IHVhLm1hdGNoKC8oaXBhZHxpcGhvbmV8aXBvZCkvaSksIGlzQW5kcm9pZCA9IHVhLm1hdGNoKC9hbmRyb2lkL2kpLCBpc0lFID0gdWEubWF0Y2goL21zaWUvaSksXHJcbiAgaXNXZWJraXQgPSB1YS5tYXRjaCgvd2Via2l0L2kpLFxyXG4gIGlzU2FmYXJpID0gKHVhLm1hdGNoKC9zYWZhcmkvaSkgJiYgIXVhLm1hdGNoKC9jaHJvbWUvaSkpLFxyXG4gIGlzT3BlcmEgPSAodWEubWF0Y2goL29wZXJhL2kpKSxcclxuICBtb2JpbGVIVE1MNSA9ICh1YS5tYXRjaCgvKG1vYmlsZXxwcmVcXC98eG9vbSkvaSkgfHwgaXNfaURldmljZSB8fCBpc0FuZHJvaWQpLFxyXG4gIGlzQmFkU2FmYXJpID0gKCF3bC5tYXRjaCgvdXNlaHRtbDVhdWRpby9pKSAmJiAhd2wubWF0Y2goL3NtMlxcLWlnbm9yZWJhZHVhL2kpICYmIGlzU2FmYXJpICYmICF1YS5tYXRjaCgvc2lsay9pKSAmJiB1YS5tYXRjaCgvT1MgWCAxMF82XyhbMy03XSkvaSkpLCAvLyBTYWZhcmkgNCBhbmQgNSAoZXhjbHVkaW5nIEtpbmRsZSBGaXJlLCBcIlNpbGtcIikgb2NjYXNpb25hbGx5IGZhaWwgdG8gbG9hZC9wbGF5IEhUTUw1IGF1ZGlvIG9uIFNub3cgTGVvcGFyZCAxMC42LjMgdGhyb3VnaCAxMC42LjcgZHVlIHRvIGJ1ZyhzKSBpbiBRdWlja1RpbWUgWCBhbmQvb3Igb3RoZXIgdW5kZXJseWluZyBmcmFtZXdvcmtzLiA6LyBDb25maXJtZWQgYnVnLiBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MzIxNTlcclxuICBoYXNDb25zb2xlID0gKHdpbmRvdy5jb25zb2xlICE9PSBfdW5kZWZpbmVkICYmIGNvbnNvbGUubG9nICE9PSBfdW5kZWZpbmVkKSxcclxuICBpc0ZvY3VzZWQgPSAoZG9jLmhhc0ZvY3VzICE9PSBfdW5kZWZpbmVkID8gZG9jLmhhc0ZvY3VzKCkgOiBudWxsKSxcclxuICB0cnlJbml0T25Gb2N1cyA9IChpc1NhZmFyaSAmJiAoZG9jLmhhc0ZvY3VzID09PSBfdW5kZWZpbmVkIHx8ICFkb2MuaGFzRm9jdXMoKSkpLFxyXG4gIG9rVG9EaXNhYmxlID0gIXRyeUluaXRPbkZvY3VzLFxyXG4gIGZsYXNoTUlNRSA9IC8obXAzfG1wNHxtcGF8bTRhfG00YikvaSxcclxuICBlbXB0eVVSTCA9ICdhYm91dDpibGFuaycsIC8vIHNhZmUgVVJMIHRvIHVubG9hZCwgb3IgbG9hZCBub3RoaW5nIGZyb20gKGZsYXNoIDggKyBtb3N0IEhUTUw1IFVBcylcclxuICBlbXB0eVdBViA9ICdkYXRhOmF1ZGlvL3dhdmU7YmFzZTY0LC9Va2xHUmlZQUFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVFJQUFBRC8vdz09JywgLy8gdGlueSBXQVYgZm9yIEhUTUw1IHVubG9hZGluZ1xyXG4gIG92ZXJIVFRQID0gKGRvYy5sb2NhdGlvbiA/IGRvYy5sb2NhdGlvbi5wcm90b2NvbC5tYXRjaCgvaHR0cC9pKSA6IG51bGwpLFxyXG4gIGh0dHAgPSAoIW92ZXJIVFRQID8gJ2h0dHA6LycrJy8nIDogJycpLFxyXG4gIC8vIG1wMywgbXA0LCBhYWMgZXRjLlxyXG4gIG5ldFN0cmVhbU1pbWVUeXBlcyA9IC9eXFxzKmF1ZGlvXFwvKD86eC0pPyg/Om1wZWc0fGFhY3xmbHZ8bW92fG1wNHx8bTR2fG00YXxtNGJ8bXA0dnwzZ3B8M2cyKVxccyooPzokfDspL2ksXHJcbiAgLy8gRmxhc2ggdjkuMHIxMTUrIFwibW92aWVzdGFyXCIgZm9ybWF0c1xyXG4gIG5ldFN0cmVhbVR5cGVzID0gWydtcGVnNCcsICdhYWMnLCAnZmx2JywgJ21vdicsICdtcDQnLCAnbTR2JywgJ2Y0dicsICdtNGEnLCAnbTRiJywgJ21wNHYnLCAnM2dwJywgJzNnMiddLFxyXG4gIG5ldFN0cmVhbVBhdHRlcm4gPSBuZXcgUmVnRXhwKCdcXFxcLignICsgbmV0U3RyZWFtVHlwZXMuam9pbignfCcpICsgJykoXFxcXD8uKik/JCcsICdpJyk7XHJcblxyXG4gIHRoaXMubWltZVBhdHRlcm4gPSAvXlxccyphdWRpb1xcLyg/OngtKT8oPzptcCg/OmVnfDMpKVxccyooPzokfDspL2k7IC8vIGRlZmF1bHQgbXAzIHNldFxyXG5cclxuICAvLyB1c2UgYWx0VVJMIGlmIG5vdCBcIm9ubGluZVwiXHJcbiAgdGhpcy51c2VBbHRVUkwgPSAhb3ZlckhUVFA7XHJcblxyXG4gIHN3ZkNTUyA9IHtcclxuICAgICdzd2ZCb3gnOiAnc20yLW9iamVjdC1ib3gnLFxyXG4gICAgJ3N3ZkRlZmF1bHQnOiAnbW92aWVDb250YWluZXInLFxyXG4gICAgJ3N3ZkVycm9yJzogJ3N3Zl9lcnJvcicsIC8vIFNXRiBsb2FkZWQsIGJ1dCBTTTIgY291bGRuJ3Qgc3RhcnQgKG90aGVyIGVycm9yKVxyXG4gICAgJ3N3ZlRpbWVkb3V0JzogJ3N3Zl90aW1lZG91dCcsXHJcbiAgICAnc3dmTG9hZGVkJzogJ3N3Zl9sb2FkZWQnLFxyXG4gICAgJ3N3ZlVuYmxvY2tlZCc6ICdzd2ZfdW5ibG9ja2VkJywgLy8gb3IgbG9hZGVkIE9LXHJcbiAgICAnc20yRGVidWcnOiAnc20yX2RlYnVnJyxcclxuICAgICdoaWdoUGVyZic6ICdoaWdoX3BlcmZvcm1hbmNlJyxcclxuICAgICdmbGFzaERlYnVnJzogJ2ZsYXNoX2RlYnVnJ1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIGJhc2ljIEhUTUw1IEF1ZGlvKCkgc3VwcG9ydCB0ZXN0XHJcbiAgICogdHJ5Li4uY2F0Y2ggYmVjYXVzZSBvZiBJRSA5IFwibm90IGltcGxlbWVudGVkXCIgbm9uc2Vuc2VcclxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvMjI0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuaGFzSFRNTDUgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBuZXcgQXVkaW8obnVsbCkgZm9yIHN0dXBpZCBPcGVyYSA5LjY0IGNhc2UsIHdoaWNoIHRocm93cyBub3RfZW5vdWdoX2FyZ3VtZW50cyBleGNlcHRpb24gb3RoZXJ3aXNlLlxyXG4gICAgICByZXR1cm4gKEF1ZGlvICE9PSBfdW5kZWZpbmVkICYmIChpc09wZXJhICYmIG9wZXJhICE9PSBfdW5kZWZpbmVkICYmIG9wZXJhLnZlcnNpb24oKSA8IDEwID8gbmV3IEF1ZGlvKG51bGwpIDogbmV3IEF1ZGlvKCkpLmNhblBsYXlUeXBlICE9PSBfdW5kZWZpbmVkKTtcclxuICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSgpKTtcclxuXHJcbiAgLyoqXHJcbiAgICogUHVibGljIFNvdW5kTWFuYWdlciBBUElcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICAvKipcclxuICAgKiBDb25maWd1cmVzIHRvcC1sZXZlbCBzb3VuZE1hbmFnZXIgcHJvcGVydGllcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIE9wdGlvbiBwYXJhbWV0ZXJzLCBlZy4geyBmbGFzaFZlcnNpb246IDksIHVybDogJy9wYXRoL3RvL3N3ZnMvJyB9XHJcbiAgICogb25yZWFkeSBhbmQgb250aW1lb3V0IGFyZSBhbHNvIGFjY2VwdGVkIHBhcmFtZXRlcnMuIGNhbGwgc291bmRNYW5hZ2VyLnNldHVwKCkgdG8gc2VlIHRoZSBmdWxsIGxpc3QuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0dXAgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblxyXG4gICAgdmFyIG5vVVJMID0gKCFzbTIudXJsKTtcclxuXHJcbiAgICAvLyB3YXJuIGlmIGZsYXNoIG9wdGlvbnMgaGF2ZSBhbHJlYWR5IGJlZW4gYXBwbGllZFxyXG5cclxuICAgIGlmIChvcHRpb25zICE9PSBfdW5kZWZpbmVkICYmIGRpZEluaXQgJiYgbmVlZHNGbGFzaCAmJiBzbTIub2soKSAmJiAob3B0aW9ucy5mbGFzaFZlcnNpb24gIT09IF91bmRlZmluZWQgfHwgb3B0aW9ucy51cmwgIT09IF91bmRlZmluZWQgfHwgb3B0aW9ucy5odG1sNVRlc3QgIT09IF91bmRlZmluZWQpKSB7XHJcbiAgICAgIGNvbXBsYWluKHN0cignc2V0dXBMYXRlJykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IGRlZmVyOiB0cnVlP1xyXG5cclxuICAgIGFzc2lnbihvcHRpb25zKTtcclxuXHJcbiAgICBpZiAoIXVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgIGlmIChtb2JpbGVIVE1MNSkge1xyXG5cclxuICAgICAgICAvLyBmb3JjZSB0aGUgc2luZ2xldG9uIEhUTUw1IHBhdHRlcm4gb24gbW9iaWxlLCBieSBkZWZhdWx0LlxyXG4gICAgICAgIGlmICghc20yLnNldHVwT3B0aW9ucy5pZ25vcmVNb2JpbGVSZXN0cmljdGlvbnMgfHwgc20yLnNldHVwT3B0aW9ucy5mb3JjZVVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuICAgICAgICAgIG1lc3NhZ2VzLnB1c2goc3RyaW5ncy5nbG9iYWxIVE1MNSk7XHJcbiAgICAgICAgICB1c2VHbG9iYWxIVE1MNUF1ZGlvID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBvbmx5IGFwcGx5IHNpbmdsZXRvbiBIVE1MNSBvbiBkZXNrdG9wIGlmIGZvcmNlZC5cclxuICAgICAgICBpZiAoc20yLnNldHVwT3B0aW9ucy5mb3JjZVVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuICAgICAgICAgIG1lc3NhZ2VzLnB1c2goc3RyaW5ncy5nbG9iYWxIVE1MNSk7XHJcbiAgICAgICAgICB1c2VHbG9iYWxIVE1MNUF1ZGlvID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmICghZGlkU2V0dXAgJiYgbW9iaWxlSFRNTDUpIHtcclxuXHJcbiAgICAgIGlmIChzbTIuc2V0dXBPcHRpb25zLmlnbm9yZU1vYmlsZVJlc3RyaWN0aW9ucykge1xyXG4gICAgICAgIFxyXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goc3RyaW5ncy5pZ25vcmVNb2JpbGUpO1xyXG4gICAgICBcclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gcHJlZmVyIEhUTUw1IGZvciBtb2JpbGUgKyB0YWJsZXQtbGlrZSBkZXZpY2VzLCBwcm9iYWJseSBtb3JlIHJlbGlhYmxlIHZzLiBmbGFzaCBhdCB0aGlzIHBvaW50LlxyXG5cclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAoIXNtMi5zZXR1cE9wdGlvbnMudXNlSFRNTDVBdWRpbyB8fCBzbTIuc2V0dXBPcHRpb25zLnByZWZlckZsYXNoKSB7XHJcbiAgICAgICAgICAvLyBub3RpZnkgdGhhdCBkZWZhdWx0cyBhcmUgYmVpbmcgY2hhbmdlZC5cclxuICAgICAgICAgIHNtMi5fd0Qoc3RyaW5ncy5tb2JpbGVVQSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgICAgc20yLnNldHVwT3B0aW9ucy51c2VIVE1MNUF1ZGlvID0gdHJ1ZTtcclxuICAgICAgICBzbTIuc2V0dXBPcHRpb25zLnByZWZlckZsYXNoID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChpc19pRGV2aWNlKSB7XHJcblxyXG4gICAgICAgICAgLy8gbm8gZmxhc2ggaGVyZS5cclxuICAgICAgICAgIHNtMi5pZ25vcmVGbGFzaCA9IHRydWU7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoKGlzQW5kcm9pZCAmJiAhdWEubWF0Y2goL2FuZHJvaWRcXHMyXFwuMy9pKSkgfHwgIWlzQW5kcm9pZCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgKiBBbmRyb2lkIGRldmljZXMgdGVuZCB0byB3b3JrIGJldHRlciB3aXRoIGEgc2luZ2xlIGF1ZGlvIGluc3RhbmNlLCBzcGVjaWZpY2FsbHkgZm9yIGNoYWluZWQgcGxheWJhY2sgb2Ygc291bmRzIGluIHNlcXVlbmNlLlxyXG4gICAgICAgICAgICogQ29tbW9uIHVzZSBjYXNlOiBleGl0aW5nIHNvdW5kIG9uZmluaXNoKCkgLT4gY3JlYXRlU291bmQoKSAtPiBwbGF5KClcclxuICAgICAgICAgICAqIFByZXN1bWluZyBzaW1pbGFyIHJlc3RyaWN0aW9ucyBmb3Igb3RoZXIgbW9iaWxlLCBub24tQW5kcm9pZCwgbm9uLWlPUyBkZXZpY2VzLlxyXG4gICAgICAgICAgICovXHJcblxyXG4gICAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgICBzbTIuX3dEKHN0cmluZ3MuZ2xvYmFsSFRNTDUpO1xyXG4gICAgICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgICAgIHVzZUdsb2JhbEhUTUw1QXVkaW8gPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZSAxOiBcIkxhdGUgc2V0dXBcIi4gU00yIGxvYWRlZCBub3JtYWxseSwgYnV0IHVzZXIgZGlkbid0IGFzc2lnbiBmbGFzaCBVUkwgZWcuLCBzZXR1cCh7dXJsOi4uLn0pIGJlZm9yZSBTTTIgaW5pdC4gVHJlYXQgYXMgZGVsYXllZCBpbml0LlxyXG5cclxuICAgIGlmIChvcHRpb25zKSB7XHJcblxyXG4gICAgICBpZiAobm9VUkwgJiYgZGlkRENMb2FkZWQgJiYgb3B0aW9ucy51cmwgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBzbTIuYmVnaW5EZWxheWVkSW5pdCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzcGVjaWFsIGNhc2UgMjogSWYgbGF6eS1sb2FkaW5nIFNNMiAoRE9NQ29udGVudExvYWRlZCBoYXMgYWxyZWFkeSBoYXBwZW5lZCkgYW5kIHVzZXIgY2FsbHMgc2V0dXAoKSB3aXRoIHVybDogcGFyYW1ldGVyLCB0cnkgdG8gaW5pdCBBU0FQLlxyXG5cclxuICAgICAgaWYgKCFkaWREQ0xvYWRlZCAmJiBvcHRpb25zLnVybCAhPT0gX3VuZGVmaW5lZCAmJiBkb2MucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZG9tQ29udGVudExvYWRlZCwgMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZGlkU2V0dXAgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiBzbTI7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMub2sgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICByZXR1cm4gKG5lZWRzRmxhc2ggPyAoZGlkSW5pdCAmJiAhZGlzYWJsZWQpIDogKHNtMi51c2VIVE1MNUF1ZGlvICYmIHNtMi5oYXNIVE1MNSkpO1xyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLnN1cHBvcnRlZCA9IHRoaXMub2s7IC8vIGxlZ2FjeVxyXG5cclxuICB0aGlzLmdldE1vdmllID0gZnVuY3Rpb24oc21JRCkge1xyXG5cclxuICAgIC8vIHNhZmV0eSBuZXQ6IHNvbWUgb2xkIGJyb3dzZXJzIGRpZmZlciBvbiBTV0YgcmVmZXJlbmNlcywgcG9zc2libHkgcmVsYXRlZCB0byBFeHRlcm5hbEludGVyZmFjZSAvIGZsYXNoIHZlcnNpb25cclxuICAgIHJldHVybiBpZChzbUlEKSB8fCBkb2Nbc21JRF0gfHwgd2luZG93W3NtSURdO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgU01Tb3VuZCBzb3VuZCBvYmplY3QgaW5zdGFuY2UuIENhbiBhbHNvIGJlIG92ZXJsb2FkZWQsIGUuZy4sIGNyZWF0ZVNvdW5kKCdteVNvdW5kJywgJy9zb21lLm1wMycpO1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIFNvdW5kIG9wdGlvbnMgKGF0IG1pbmltdW0sIHVybCBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQuKVxyXG4gICAqIEByZXR1cm4ge29iamVjdH0gU01Tb3VuZCBUaGUgbmV3IFNNU291bmQgb2JqZWN0LlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNyZWF0ZVNvdW5kID0gZnVuY3Rpb24ob09wdGlvbnMsIF91cmwpIHtcclxuXHJcbiAgICB2YXIgY3MsIGNzX3N0cmluZywgb3B0aW9ucywgb1NvdW5kID0gbnVsbDtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGNzID0gc20gKyAnLmNyZWF0ZVNvdW5kKCk6ICc7XHJcbiAgICBjc19zdHJpbmcgPSBjcyArIHN0cighZGlkSW5pdCA/ICdub3RSZWFkeScgOiAnbm90T0snKTtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICBpZiAoIWRpZEluaXQgfHwgIXNtMi5vaygpKSB7XHJcbiAgICAgIGNvbXBsYWluKGNzX3N0cmluZyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoX3VybCAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAvLyBmdW5jdGlvbiBvdmVybG9hZGluZyBpbiBKUyEgOikgLi4uIGFzc3VtZSBzaW1wbGUgY3JlYXRlU291bmQoaWQsIHVybCkgdXNlIGNhc2UuXHJcbiAgICAgIG9PcHRpb25zID0ge1xyXG4gICAgICAgICdpZCc6IG9PcHRpb25zLFxyXG4gICAgICAgICd1cmwnOiBfdXJsXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW5oZXJpdCBmcm9tIGRlZmF1bHRPcHRpb25zXHJcbiAgICBvcHRpb25zID0gbWl4aW4ob09wdGlvbnMpO1xyXG5cclxuICAgIG9wdGlvbnMudXJsID0gcGFyc2VVUkwob3B0aW9ucy51cmwpO1xyXG5cclxuICAgIC8vIGdlbmVyYXRlIGFuIGlkLCBpZiBuZWVkZWQuXHJcbiAgICBpZiAob3B0aW9ucy5pZCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBvcHRpb25zLmlkID0gc20yLnNldHVwT3B0aW9ucy5pZFByZWZpeCArIChpZENvdW50ZXIrKyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAob3B0aW9ucy5pZC50b1N0cmluZygpLmNoYXJBdCgwKS5tYXRjaCgvXlswLTldJC8pKSB7XHJcbiAgICAgIHNtMi5fd0QoY3MgKyBzdHIoJ2JhZElEJywgb3B0aW9ucy5pZCksIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNtMi5fd0QoY3MgKyBvcHRpb25zLmlkICsgKG9wdGlvbnMudXJsID8gJyAoJyArIG9wdGlvbnMudXJsICsgJyknIDogJycpLCAxKTtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICBpZiAoaWRDaGVjayhvcHRpb25zLmlkLCB0cnVlKSkge1xyXG4gICAgICBzbTIuX3dEKGNzICsgb3B0aW9ucy5pZCArICcgZXhpc3RzJywgMSk7XHJcbiAgICAgIHJldHVybiBzbTIuc291bmRzW29wdGlvbnMuaWRdO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1ha2UoKSB7XHJcblxyXG4gICAgICBvcHRpb25zID0gbG9vcEZpeChvcHRpb25zKTtcclxuICAgICAgc20yLnNvdW5kc1tvcHRpb25zLmlkXSA9IG5ldyBTTVNvdW5kKG9wdGlvbnMpO1xyXG4gICAgICBzbTIuc291bmRJRHMucHVzaChvcHRpb25zLmlkKTtcclxuICAgICAgcmV0dXJuIHNtMi5zb3VuZHNbb3B0aW9ucy5pZF07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChodG1sNU9LKG9wdGlvbnMpKSB7XHJcblxyXG4gICAgICBvU291bmQgPSBtYWtlKCk7XHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoIXNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgICBzbTIuX3dEKG9wdGlvbnMuaWQgKyAnOiBVc2luZyBIVE1MNScpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuICAgICAgb1NvdW5kLl9zZXR1cF9odG1sNShvcHRpb25zKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgICBzbTIuX3dEKG9wdGlvbnMuaWQgKyAnOiBObyBIVE1MNSBzdXBwb3J0IGZvciB0aGlzIHNvdW5kLCBhbmQgbm8gRmxhc2guIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgcmV0dXJuIG1ha2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVE9ETzogTW92ZSBIVE1MNS9mbGFzaCBjaGVja3MgaW50byBnZW5lcmljIFVSTCBwYXJzaW5nL2hhbmRsaW5nIGZ1bmN0aW9uLlxyXG5cclxuICAgICAgaWYgKHNtMi5odG1sNS51c2luZ0ZsYXNoICYmIG9wdGlvbnMudXJsICYmIG9wdGlvbnMudXJsLm1hdGNoKC9kYXRhXFw6L2kpKSB7XHJcbiAgICAgICAgLy8gZGF0YTogVVJJcyBub3Qgc3VwcG9ydGVkIGJ5IEZsYXNoLCBlaXRoZXIuXHJcbiAgICAgICAgc20yLl93RChvcHRpb25zLmlkICsgJzogZGF0YTogVVJJcyBub3Qgc3VwcG9ydGVkIHZpYSBGbGFzaC4gRXhpdGluZy4nKTtcclxuICAgICAgICByZXR1cm4gbWFrZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZlYgPiA4KSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuaXNNb3ZpZVN0YXIgPT09IG51bGwpIHtcclxuICAgICAgICAgIC8vIGF0dGVtcHQgdG8gZGV0ZWN0IE1QRUctNCBmb3JtYXRzXHJcbiAgICAgICAgICBvcHRpb25zLmlzTW92aWVTdGFyID0gISEob3B0aW9ucy5zZXJ2ZXJVUkwgfHwgKG9wdGlvbnMudHlwZSA/IG9wdGlvbnMudHlwZS5tYXRjaChuZXRTdHJlYW1NaW1lVHlwZXMpIDogZmFsc2UpIHx8IChvcHRpb25zLnVybCAmJiBvcHRpb25zLnVybC5tYXRjaChuZXRTdHJlYW1QYXR0ZXJuKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAob3B0aW9ucy5pc01vdmllU3Rhcikge1xyXG4gICAgICAgICAgc20yLl93RChjcyArICd1c2luZyBNb3ZpZVN0YXIgaGFuZGxpbmcnKTtcclxuICAgICAgICAgIGlmIChvcHRpb25zLmxvb3BzID4gMSkge1xyXG4gICAgICAgICAgICBfd0RTKCdub05TTG9vcCcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9wdGlvbnMgPSBwb2xpY3lGaXgob3B0aW9ucywgY3MpO1xyXG4gICAgICBvU291bmQgPSBtYWtlKCk7XHJcblxyXG4gICAgICBpZiAoZlYgPT09IDgpIHtcclxuICAgICAgICBmbGFzaC5fY3JlYXRlU291bmQob3B0aW9ucy5pZCwgb3B0aW9ucy5sb29wcyB8fCAxLCBvcHRpb25zLnVzZVBvbGljeUZpbGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZsYXNoLl9jcmVhdGVTb3VuZChvcHRpb25zLmlkLCBvcHRpb25zLnVybCwgb3B0aW9ucy51c2VQZWFrRGF0YSwgb3B0aW9ucy51c2VXYXZlZm9ybURhdGEsIG9wdGlvbnMudXNlRVFEYXRhLCBvcHRpb25zLmlzTW92aWVTdGFyLCAob3B0aW9ucy5pc01vdmllU3RhciA/IG9wdGlvbnMuYnVmZmVyVGltZSA6IGZhbHNlKSwgb3B0aW9ucy5sb29wcyB8fCAxLCBvcHRpb25zLnNlcnZlclVSTCwgb3B0aW9ucy5kdXJhdGlvbiB8fCBudWxsLCBvcHRpb25zLmF1dG9QbGF5LCB0cnVlLCBvcHRpb25zLmF1dG9Mb2FkLCBvcHRpb25zLnVzZVBvbGljeUZpbGUpO1xyXG4gICAgICAgIGlmICghb3B0aW9ucy5zZXJ2ZXJVUkwpIHtcclxuICAgICAgICAgIC8vIFdlIGFyZSBjb25uZWN0ZWQgaW1tZWRpYXRlbHlcclxuICAgICAgICAgIG9Tb3VuZC5jb25uZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgaWYgKG9wdGlvbnMub25jb25uZWN0KSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMub25jb25uZWN0LmFwcGx5KG9Tb3VuZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIW9wdGlvbnMuc2VydmVyVVJMICYmIChvcHRpb25zLmF1dG9Mb2FkIHx8IG9wdGlvbnMuYXV0b1BsYXkpKSB7XHJcbiAgICAgICAgLy8gY2FsbCBsb2FkIGZvciBub24tcnRtcCBzdHJlYW1zXHJcbiAgICAgICAgb1NvdW5kLmxvYWQob3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gcnRtcCB3aWxsIHBsYXkgaW4gb25jb25uZWN0XHJcbiAgICBpZiAoIW9wdGlvbnMuc2VydmVyVVJMICYmIG9wdGlvbnMuYXV0b1BsYXkpIHtcclxuICAgICAgb1NvdW5kLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb1NvdW5kO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXN0cm95cyBhIFNNU291bmQgc291bmQgb2JqZWN0IGluc3RhbmNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kIHRvIGRlc3Ryb3lcclxuICAgKi9cclxuXHJcbiAgdGhpcy5kZXN0cm95U291bmQgPSBmdW5jdGlvbihzSUQsIF9iRnJvbVNvdW5kKSB7XHJcblxyXG4gICAgLy8gZXhwbGljaXRseSBkZXN0cm95IGEgc291bmQgYmVmb3JlIG5vcm1hbCBwYWdlIHVubG9hZCwgZXRjLlxyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgb1MgPSBzbTIuc291bmRzW3NJRF0sIGk7XHJcblxyXG4gICAgb1Muc3RvcCgpO1xyXG4gICAgXHJcbiAgICAvLyBEaXNhYmxlIGFsbCBjYWxsYmFja3MgYWZ0ZXIgc3RvcCgpLCB3aGVuIHRoZSBzb3VuZCBpcyBiZWluZyBkZXN0cm95ZWRcclxuICAgIG9TLl9pTyA9IHt9O1xyXG4gICAgXHJcbiAgICBvUy51bmxvYWQoKTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgc20yLnNvdW5kSURzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChzbTIuc291bmRJRHNbaV0gPT09IHNJRCkge1xyXG4gICAgICAgIHNtMi5zb3VuZElEcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIV9iRnJvbVNvdW5kKSB7XHJcbiAgICAgIC8vIGlnbm9yZSBpZiBiZWluZyBjYWxsZWQgZnJvbSBTTVNvdW5kIGluc3RhbmNlXHJcbiAgICAgIG9TLmRlc3RydWN0KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIG9TID0gbnVsbDtcclxuICAgIGRlbGV0ZSBzbTIuc291bmRzW3NJRF07XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBsb2FkKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgT3B0aW9uYWw6IFNvdW5kIG9wdGlvbnNcclxuICAgKi9cclxuXHJcbiAgdGhpcy5sb2FkID0gZnVuY3Rpb24oc0lELCBvT3B0aW9ucykge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ubG9hZChvT3B0aW9ucyk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSB1bmxvYWQoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnVubG9hZCA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0udW5sb2FkKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBvblBvc2l0aW9uKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gblBvc2l0aW9uIFRoZSBwb3NpdGlvbiB0byB3YXRjaCBmb3JcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIFRoZSByZWxldmFudCBjYWxsYmFjayB0byBmaXJlXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9TY29wZSBPcHRpb25hbDogVGhlIHNjb3BlIHRvIGFwcGx5IHRoZSBjYWxsYmFjayB0b1xyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLm9uUG9zaXRpb24gPSBmdW5jdGlvbihzSUQsIG5Qb3NpdGlvbiwgb01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5vbnBvc2l0aW9uKG5Qb3NpdGlvbiwgb01ldGhvZCwgb1Njb3BlKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gbGVnYWN5L2JhY2t3YXJkcy1jb21wYWJpbGl0eTogbG93ZXItY2FzZSBtZXRob2QgbmFtZVxyXG4gIHRoaXMub25wb3NpdGlvbiA9IHRoaXMub25Qb3NpdGlvbjtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIGNsZWFyT25Qb3NpdGlvbigpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5Qb3NpdGlvbiBUaGUgcG9zaXRpb24gdG8gd2F0Y2ggZm9yXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBPcHRpb25hbDogVGhlIHJlbGV2YW50IGNhbGxiYWNrIHRvIGZpcmVcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5jbGVhck9uUG9zaXRpb24gPSBmdW5jdGlvbihzSUQsIG5Qb3NpdGlvbiwgb01ldGhvZCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uY2xlYXJPblBvc2l0aW9uKG5Qb3NpdGlvbiwgb01ldGhvZCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBwbGF5KCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgT3B0aW9uYWw6IFNvdW5kIG9wdGlvbnNcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5wbGF5ID0gZnVuY3Rpb24oc0lELCBvT3B0aW9ucykge1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBudWxsLFxyXG4gICAgICAgIC8vIGxlZ2FjeSBmdW5jdGlvbi1vdmVybG9hZGluZyB1c2UgY2FzZTogcGxheSgnbXlTb3VuZCcsICcvcGF0aC90by9zb21lLm1wMycpO1xyXG4gICAgICAgIG92ZXJsb2FkZWQgPSAob09wdGlvbnMgJiYgIShvT3B0aW9ucyBpbnN0YW5jZW9mIE9iamVjdCkpO1xyXG5cclxuICAgIGlmICghZGlkSW5pdCB8fCAhc20yLm9rKCkpIHtcclxuICAgICAgY29tcGxhaW4oc20gKyAnLnBsYXkoKTogJyArIHN0cighZGlkSW5pdD8nbm90UmVhZHknOidub3RPSycpKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQsIG92ZXJsb2FkZWQpKSB7XHJcblxyXG4gICAgICBpZiAoIW92ZXJsb2FkZWQpIHtcclxuICAgICAgICAvLyBubyBzb3VuZCBmb3VuZCBmb3IgdGhlIGdpdmVuIElELiBCYWlsLlxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG92ZXJsb2FkZWQpIHtcclxuICAgICAgICBvT3B0aW9ucyA9IHtcclxuICAgICAgICAgIHVybDogb09wdGlvbnNcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAob09wdGlvbnMgJiYgb09wdGlvbnMudXJsKSB7XHJcbiAgICAgICAgLy8gb3ZlcmxvYWRpbmcgdXNlIGNhc2UsIGNyZWF0ZStwbGF5OiAucGxheSgnc29tZUlEJywge3VybDonL3BhdGgvdG8ubXAzJ30pO1xyXG4gICAgICAgIHNtMi5fd0Qoc20gKyAnLnBsYXkoKTogQXR0ZW1wdGluZyB0byBjcmVhdGUgXCInICsgc0lEICsgJ1wiJywgMSk7XHJcbiAgICAgICAgb09wdGlvbnMuaWQgPSBzSUQ7XHJcbiAgICAgICAgcmVzdWx0ID0gc20yLmNyZWF0ZVNvdW5kKG9PcHRpb25zKS5wbGF5KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9IGVsc2UgaWYgKG92ZXJsb2FkZWQpIHtcclxuXHJcbiAgICAgIC8vIGV4aXN0aW5nIHNvdW5kIG9iamVjdCBjYXNlXHJcbiAgICAgIG9PcHRpb25zID0ge1xyXG4gICAgICAgIHVybDogb09wdGlvbnNcclxuICAgICAgfTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xyXG4gICAgICAvLyBkZWZhdWx0IGNhc2VcclxuICAgICAgcmVzdWx0ID0gc20yLnNvdW5kc1tzSURdLnBsYXkob09wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIGp1c3QgZm9yIGNvbnZlbmllbmNlXHJcbiAgdGhpcy5zdGFydCA9IHRoaXMucGxheTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHNldFBvc2l0aW9uKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbk1zZWNPZmZzZXQgUG9zaXRpb24gKG1pbGxpc2Vjb25kcylcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHNJRCwgbk1zZWNPZmZzZXQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnNldFBvc2l0aW9uKG5Nc2VjT2Zmc2V0KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHN0b3AoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnN0b3AgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc20yLl93RChzbSArICcuc3RvcCgnICsgc0lEICsgJyknLCAxKTtcclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uc3RvcCgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBTdG9wcyBhbGwgY3VycmVudGx5LXBsYXlpbmcgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnN0b3BBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgb1NvdW5kO1xyXG4gICAgc20yLl93RChzbSArICcuc3RvcEFsbCgpJywgMSk7XHJcblxyXG4gICAgZm9yIChvU291bmQgaW4gc20yLnNvdW5kcykge1xyXG4gICAgICBpZiAoc20yLnNvdW5kcy5oYXNPd25Qcm9wZXJ0eShvU291bmQpKSB7XHJcbiAgICAgICAgLy8gYXBwbHkgb25seSB0byBzb3VuZCBvYmplY3RzXHJcbiAgICAgICAgc20yLnNvdW5kc1tvU291bmRdLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgcGF1c2UoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnBhdXNlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5wYXVzZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBQYXVzZXMgYWxsIGN1cnJlbnRseS1wbGF5aW5nIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5wYXVzZUFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBpO1xyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5wYXVzZSgpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgcmVzdW1lKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5yZXN1bWUgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnJlc3VtZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZXN1bWVzIGFsbCBjdXJyZW50bHktcGF1c2VkIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5yZXN1bWVBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgaTtcclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGgtIDEgOyBpID49IDA7IGktLSkge1xyXG4gICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0ucmVzdW1lKCk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSB0b2dnbGVQYXVzZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMudG9nZ2xlUGF1c2UgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnRvZ2dsZVBhdXNlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBzZXRQYW4oKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuUGFuIFRoZSBwYW4gdmFsdWUgKC0xMDAgdG8gMTAwKVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldFBhbiA9IGZ1bmN0aW9uKHNJRCwgblBhbikge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uc2V0UGFuKG5QYW4pO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgc2V0Vm9sdW1lKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSURcclxuICAgKiBPdmVybG9hZGVkIGNhc2U6IHBhc3Mgb25seSB2b2x1bWUgYXJndW1lbnQgZWcuLCBzZXRWb2x1bWUoNTApIHRvIGFwcGx5IHRvIGFsbCBzb3VuZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gblZvbCBUaGUgdm9sdW1lIHZhbHVlICgwIHRvIDEwMClcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXRWb2x1bWUgPSBmdW5jdGlvbihzSUQsIG5Wb2wpIHtcclxuXHJcbiAgICAvLyBzZXRWb2x1bWUoNTApIGZ1bmN0aW9uIG92ZXJsb2FkaW5nIGNhc2UgLSBhcHBseSB0byBhbGwgc291bmRzXHJcblxyXG4gICAgdmFyIGksIGo7XHJcblxyXG4gICAgaWYgKHNJRCAhPT0gX3VuZGVmaW5lZCAmJiAhaXNOYU4oc0lEKSAmJiBuVm9sID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSBzbTIuc291bmRJRHMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLnNldFZvbHVtZShzSUQpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzZXRWb2x1bWUoJ215U291bmQnLCA1MCkgY2FzZVxyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnNldFZvbHVtZShuVm9sKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIG11dGUoKSBtZXRob2Qgb2YgZWl0aGVyIGEgc2luZ2xlIFNNU291bmQgb2JqZWN0IGJ5IElELCBvciBhbGwgc291bmQgb2JqZWN0cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgT3B0aW9uYWw6IFRoZSBJRCBvZiB0aGUgc291bmQgKGlmIG9taXR0ZWQsIGFsbCBzb3VuZHMgd2lsbCBiZSB1c2VkLilcclxuICAgKi9cclxuXHJcbiAgdGhpcy5tdXRlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGlmIChzSUQgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgc0lEID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNJRCkge1xyXG5cclxuICAgICAgc20yLl93RChzbSArICcubXV0ZSgpOiBNdXRpbmcgYWxsIHNvdW5kcycpO1xyXG4gICAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0ubXV0ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHNtMi5tdXRlZCA9IHRydWU7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLm11dGUoKTogTXV0aW5nIFwiJyArIHNJRCArICdcIicpO1xyXG4gICAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLm11dGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIE11dGVzIGFsbCBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMubXV0ZUFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHNtMi5tdXRlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSB1bm11dGUoKSBtZXRob2Qgb2YgZWl0aGVyIGEgc2luZ2xlIFNNU291bmQgb2JqZWN0IGJ5IElELCBvciBhbGwgc291bmQgb2JqZWN0cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgT3B0aW9uYWw6IFRoZSBJRCBvZiB0aGUgc291bmQgKGlmIG9taXR0ZWQsIGFsbCBzb3VuZHMgd2lsbCBiZSB1c2VkLilcclxuICAgKi9cclxuXHJcbiAgdGhpcy51bm11dGUgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICBpZiAoc0lEIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgIHNJRCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzSUQpIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLnVubXV0ZSgpOiBVbm11dGluZyBhbGwgc291bmRzJyk7XHJcbiAgICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS51bm11dGUoKTtcclxuICAgICAgfVxyXG4gICAgICBzbTIubXV0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgc20yLl93RChzbSArICcudW5tdXRlKCk6IFVubXV0aW5nIFwiJyArIHNJRCArICdcIicpO1xyXG4gICAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnVubXV0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogVW5tdXRlcyBhbGwgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnVubXV0ZUFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHNtMi51bm11dGUoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHRvZ2dsZU11dGUoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnRvZ2dsZU11dGUgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnRvZ2dsZU11dGUoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBtZW1vcnkgdXNlZCBieSB0aGUgZmxhc2ggcGx1Z2luLlxyXG4gICAqXHJcbiAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgYW1vdW50IG9mIG1lbW9yeSBpbiB1c2VcclxuICAgKi9cclxuXHJcbiAgdGhpcy5nZXRNZW1vcnlVc2UgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBmbGFzaC1vbmx5XHJcbiAgICB2YXIgcmFtID0gMDtcclxuXHJcbiAgICBpZiAoZmxhc2ggJiYgZlYgIT09IDgpIHtcclxuICAgICAgcmFtID0gcGFyc2VJbnQoZmxhc2guX2dldE1lbW9yeVVzZSgpLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJhbTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogVW5kb2N1bWVudGVkOiBOT1BzIHNvdW5kTWFuYWdlciBhbmQgYWxsIFNNU291bmQgb2JqZWN0cy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5kaXNhYmxlID0gZnVuY3Rpb24oYk5vRGlzYWJsZSkge1xyXG5cclxuICAgIC8vIGRlc3Ryb3kgYWxsIGZ1bmN0aW9uc1xyXG4gICAgdmFyIGk7XHJcblxyXG4gICAgaWYgKGJOb0Rpc2FibGUgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgYk5vRGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkaXNhYmxlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgX3dEUygnc2h1dGRvd24nLCAxKTtcclxuXHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgZGlzYWJsZU9iamVjdChzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpcmUgXCJjb21wbGV0ZVwiLCBkZXNwaXRlIGZhaWxcclxuICAgIGluaXRDb21wbGV0ZShiTm9EaXNhYmxlKTtcclxuICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdsb2FkJywgaW5pdFVzZXJPbmxvYWQpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHBsYXlhYmlsaXR5IG9mIGEgTUlNRSB0eXBlLCBlZy4gJ2F1ZGlvL21wMycuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuY2FuUGxheU1JTUUgPSBmdW5jdGlvbihzTUlNRSkge1xyXG5cclxuICAgIHZhciByZXN1bHQ7XHJcblxyXG4gICAgaWYgKHNtMi5oYXNIVE1MNSkge1xyXG4gICAgICByZXN1bHQgPSBodG1sNUNhblBsYXkoe1xyXG4gICAgICAgIHR5cGU6IHNNSU1FXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmVzdWx0ICYmIG5lZWRzRmxhc2gpIHtcclxuICAgICAgLy8gaWYgZmxhc2ggOSwgdGVzdCBuZXRTdHJlYW0gKG1vdmllU3RhcikgdHlwZXMgYXMgd2VsbC5cclxuICAgICAgcmVzdWx0ID0gKHNNSU1FICYmIHNtMi5vaygpID8gISEoKGZWID4gOCA/IHNNSU1FLm1hdGNoKG5ldFN0cmVhbU1pbWVUeXBlcykgOiBudWxsKSB8fCBzTUlNRS5tYXRjaChzbTIubWltZVBhdHRlcm4pKSA6IG51bGwpOyAvLyBUT0RPOiBtYWtlIGxlc3MgXCJ3ZWlyZFwiIChwZXIgSlNMaW50KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgcGxheWFiaWxpdHkgb2YgYSBVUkwgYmFzZWQgb24gYXVkaW8gc3VwcG9ydC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzVVJMIFRoZSBVUkwgdG8gdGVzdFxyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFVSTCBwbGF5YWJpbGl0eVxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNhblBsYXlVUkwgPSBmdW5jdGlvbihzVVJMKSB7XHJcblxyXG4gICAgdmFyIHJlc3VsdDtcclxuXHJcbiAgICBpZiAoc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIHJlc3VsdCA9IGh0bWw1Q2FuUGxheSh7XHJcbiAgICAgICAgdXJsOiBzVVJMXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmVzdWx0ICYmIG5lZWRzRmxhc2gpIHtcclxuICAgICAgcmVzdWx0ID0gKHNVUkwgJiYgc20yLm9rKCkgPyAhIShzVVJMLm1hdGNoKHNtMi5maWxlUGF0dGVybikpIDogbnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBwbGF5YWJpbGl0eSBvZiBhbiBIVE1MIERPTSAmbHQ7YSZndDsgb2JqZWN0IChvciBzaW1pbGFyIG9iamVjdCBsaXRlcmFsKSBiYXNlZCBvbiBhdWRpbyBzdXBwb3J0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9MaW5rIGFuIEhUTUwgRE9NICZsdDthJmd0OyBvYmplY3Qgb3Igb2JqZWN0IGxpdGVyYWwgaW5jbHVkaW5nIGhyZWYgYW5kL29yIHR5cGUgYXR0cmlidXRlc1xyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFVSTCBwbGF5YWJpbGl0eVxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNhblBsYXlMaW5rID0gZnVuY3Rpb24ob0xpbmspIHtcclxuXHJcbiAgICBpZiAob0xpbmsudHlwZSAhPT0gX3VuZGVmaW5lZCAmJiBvTGluay50eXBlKSB7XHJcbiAgICAgIGlmIChzbTIuY2FuUGxheU1JTUUob0xpbmsudHlwZSkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzbTIuY2FuUGxheVVSTChvTGluay5ocmVmKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5nZXRTb3VuZEJ5SWQgPSBmdW5jdGlvbihzSUQsIF9zdXBwcmVzc0RlYnVnKSB7XHJcblxyXG4gICAgaWYgKCFzSUQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IHNtMi5zb3VuZHNbc0lEXTtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmICghcmVzdWx0ICYmICFfc3VwcHJlc3NEZWJ1Zykge1xyXG4gICAgICBzbTIuX3dEKHNtICsgJy5nZXRTb3VuZEJ5SWQoKTogU291bmQgXCInICsgc0lEICsgJ1wiIG5vdCBmb3VuZC4nLCAyKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBRdWV1ZXMgYSBjYWxsYmFjayBmb3IgZXhlY3V0aW9uIHdoZW4gU291bmRNYW5hZ2VyIGhhcyBzdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIFRoZSBjYWxsYmFjayBtZXRob2QgdG8gZmlyZVxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvU2NvcGUgT3B0aW9uYWw6IFRoZSBzY29wZSB0byBhcHBseSB0byB0aGUgY2FsbGJhY2tcclxuICAgKi9cclxuXHJcbiAgdGhpcy5vbnJlYWR5ID0gZnVuY3Rpb24ob01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgdmFyIHNUeXBlID0gJ29ucmVhZHknLFxyXG4gICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICh0eXBlb2Ygb01ldGhvZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmIChkaWRJbml0KSB7XHJcbiAgICAgICAgc20yLl93RChzdHIoJ3F1ZXVlJywgc1R5cGUpKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBpZiAoIW9TY29wZSkge1xyXG4gICAgICAgIG9TY29wZSA9IHdpbmRvdztcclxuICAgICAgfVxyXG5cclxuICAgICAgYWRkT25FdmVudChzVHlwZSwgb01ldGhvZCwgb1Njb3BlKTtcclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKCk7XHJcblxyXG4gICAgICByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICB0aHJvdyBzdHIoJ25lZWRGdW5jdGlvbicsIHNUeXBlKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUXVldWVzIGEgY2FsbGJhY2sgZm9yIGV4ZWN1dGlvbiB3aGVuIFNvdW5kTWFuYWdlciBoYXMgZmFpbGVkIHRvIGluaXRpYWxpemUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIFRoZSBjYWxsYmFjayBtZXRob2QgdG8gZmlyZVxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvU2NvcGUgT3B0aW9uYWw6IFRoZSBzY29wZSB0byBhcHBseSB0byB0aGUgY2FsbGJhY2tcclxuICAgKi9cclxuXHJcbiAgdGhpcy5vbnRpbWVvdXQgPSBmdW5jdGlvbihvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICB2YXIgc1R5cGUgPSAnb250aW1lb3V0JyxcclxuICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAodHlwZW9mIG9NZXRob2QgPT09ICdmdW5jdGlvbicpIHtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoZGlkSW5pdCkge1xyXG4gICAgICAgIHNtMi5fd0Qoc3RyKCdxdWV1ZScsIHNUeXBlKSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgaWYgKCFvU2NvcGUpIHtcclxuICAgICAgICBvU2NvcGUgPSB3aW5kb3c7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFkZE9uRXZlbnQoc1R5cGUsIG9NZXRob2QsIG9TY29wZSk7XHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cyh7dHlwZTpzVHlwZX0pO1xyXG5cclxuICAgICAgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgdGhyb3cgc3RyKCduZWVkRnVuY3Rpb24nLCBzVHlwZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFdyaXRlcyBjb25zb2xlLmxvZygpLXN0eWxlIGRlYnVnIG91dHB1dCB0byBhIGNvbnNvbGUgb3IgaW4tYnJvd3NlciBlbGVtZW50LlxyXG4gICAqIEFwcGxpZXMgd2hlbiBkZWJ1Z01vZGUgPSB0cnVlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc1RleHQgVGhlIGNvbnNvbGUgbWVzc2FnZVxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBuVHlwZSBPcHRpb25hbCBsb2cgbGV2ZWwgKG51bWJlciksIG9yIG9iamVjdC4gTnVtYmVyIGNhc2U6IExvZyB0eXBlL3N0eWxlIHdoZXJlIDAgPSAnaW5mbycsIDEgPSAnd2FybicsIDIgPSAnZXJyb3InLiBPYmplY3QgY2FzZTogT2JqZWN0IHRvIGJlIGR1bXBlZC5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5fd3JpdGVEZWJ1ZyA9IGZ1bmN0aW9uKHNUZXh0LCBzVHlwZU9yT2JqZWN0KSB7XHJcblxyXG4gICAgLy8gcHNldWRvLXByaXZhdGUgY29uc29sZS5sb2coKS1zdHlsZSBvdXRwdXRcclxuICAgIC8vIDxkPlxyXG5cclxuICAgIHZhciBzRElEID0gJ3NvdW5kbWFuYWdlci1kZWJ1ZycsIG8sIG9JdGVtO1xyXG5cclxuICAgIGlmICghc20yLnNldHVwT3B0aW9ucy5kZWJ1Z01vZGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChoYXNDb25zb2xlICYmIHNtMi51c2VDb25zb2xlKSB7XHJcbiAgICAgIGlmIChzVHlwZU9yT2JqZWN0ICYmIHR5cGVvZiBzVHlwZU9yT2JqZWN0ID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIC8vIG9iamVjdCBwYXNzZWQ7IGR1bXAgdG8gY29uc29sZS5cclxuICAgICAgICBjb25zb2xlLmxvZyhzVGV4dCwgc1R5cGVPck9iamVjdCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVidWdMZXZlbHNbc1R5cGVPck9iamVjdF0gIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBjb25zb2xlW2RlYnVnTGV2ZWxzW3NUeXBlT3JPYmplY3RdXShzVGV4dCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coc1RleHQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzbTIuY29uc29sZU9ubHkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG8gPSBpZChzRElEKTtcclxuXHJcbiAgICBpZiAoIW8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG9JdGVtID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgIGlmICgrK3dkQ291bnQgJSAyID09PSAwKSB7XHJcbiAgICAgIG9JdGVtLmNsYXNzTmFtZSA9ICdzbTItYWx0JztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc1R5cGVPck9iamVjdCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBzVHlwZU9yT2JqZWN0ID0gMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNUeXBlT3JPYmplY3QgPSBwYXJzZUludChzVHlwZU9yT2JqZWN0LCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgb0l0ZW0uYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKHNUZXh0KSk7XHJcblxyXG4gICAgaWYgKHNUeXBlT3JPYmplY3QpIHtcclxuICAgICAgaWYgKHNUeXBlT3JPYmplY3QgPj0gMikge1xyXG4gICAgICAgIG9JdGVtLnN0eWxlLmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNUeXBlT3JPYmplY3QgPT09IDMpIHtcclxuICAgICAgICBvSXRlbS5zdHlsZS5jb2xvciA9ICcjZmYzMzMzJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRvcC10by1ib3R0b21cclxuICAgIC8vIG8uYXBwZW5kQ2hpbGQob0l0ZW0pO1xyXG5cclxuICAgIC8vIGJvdHRvbS10by10b3BcclxuICAgIG8uaW5zZXJ0QmVmb3JlKG9JdGVtLCBvLmZpcnN0Q2hpbGQpO1xyXG5cclxuICAgIG8gPSBudWxsO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvLyA8ZD5cclxuICAvLyBsYXN0LXJlc29ydCBkZWJ1Z2dpbmcgb3B0aW9uXHJcbiAgaWYgKHdsLmluZGV4T2YoJ3NtMi1kZWJ1Zz1hbGVydCcpICE9PSAtMSkge1xyXG4gICAgdGhpcy5fd3JpdGVEZWJ1ZyA9IGZ1bmN0aW9uKHNUZXh0KSB7XHJcbiAgICAgIHdpbmRvdy5hbGVydChzVGV4dCk7XHJcbiAgICB9O1xyXG4gIH1cclxuICAvLyA8L2Q+XHJcblxyXG4gIC8vIGFsaWFzXHJcbiAgdGhpcy5fd0QgPSB0aGlzLl93cml0ZURlYnVnO1xyXG5cclxuICAvKipcclxuICAgKiBQcm92aWRlcyBkZWJ1ZyAvIHN0YXRlIGluZm9ybWF0aW9uIG9uIGFsbCBTTVNvdW5kIG9iamVjdHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuX2RlYnVnID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICB2YXIgaSwgajtcclxuICAgIF93RFMoJ2N1cnJlbnRPYmonLCAxKTtcclxuXHJcbiAgICBmb3IgKGkgPSAwLCBqID0gc20yLnNvdW5kSURzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uX2RlYnVnKCk7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RhcnRzIGFuZCByZS1pbml0aWFsaXplcyB0aGUgU291bmRNYW5hZ2VyIGluc3RhbmNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSByZXNldEV2ZW50cyBPcHRpb25hbDogV2hlbiB0cnVlLCByZW1vdmVzIGFsbCByZWdpc3RlcmVkIG9ucmVhZHkgYW5kIG9udGltZW91dCBldmVudCBjYWxsYmFja3MuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBleGNsdWRlSW5pdCBPcHRpb25zOiBXaGVuIHRydWUsIGRvZXMgbm90IGNhbGwgYmVnaW5EZWxheWVkSW5pdCgpICh3aGljaCB3b3VsZCByZXN0YXJ0IFNNMikuXHJcbiAgICogQHJldHVybiB7b2JqZWN0fSBzb3VuZE1hbmFnZXIgVGhlIHNvdW5kTWFuYWdlciBpbnN0YW5jZS5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5yZWJvb3QgPSBmdW5jdGlvbihyZXNldEV2ZW50cywgZXhjbHVkZUluaXQpIHtcclxuXHJcbiAgICAvLyByZXNldCBzb21lIChvciBhbGwpIHN0YXRlLCBhbmQgcmUtaW5pdCB1bmxlc3Mgb3RoZXJ3aXNlIHNwZWNpZmllZC5cclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmIChzbTIuc291bmRJRHMubGVuZ3RoKSB7XHJcbiAgICAgIHNtMi5fd0QoJ0Rlc3Ryb3lpbmcgJyArIHNtMi5zb3VuZElEcy5sZW5ndGggKyAnIFNNU291bmQgb2JqZWN0JyArIChzbTIuc291bmRJRHMubGVuZ3RoICE9PSAxID8gJ3MnIDogJycpICsgJy4uLicpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIHZhciBpLCBqLCBrO1xyXG5cclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGgtIDEgOyBpID49IDA7IGktLSkge1xyXG4gICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uZGVzdHJ1Y3QoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0cmFzaCB6ZSBmbGFzaCAocmVtb3ZlIGZyb20gdGhlIERPTSlcclxuXHJcbiAgICBpZiAoZmxhc2gpIHtcclxuXHJcbiAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgIGlmIChpc0lFKSB7XHJcbiAgICAgICAgICBvUmVtb3ZlZEhUTUwgPSBmbGFzaC5pbm5lckhUTUw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvUmVtb3ZlZCA9IGZsYXNoLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZmxhc2gpO1xyXG5cclxuICAgICAgfSBjYXRjaChlKSB7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBmYWlsZWQ/IE1heSBiZSBkdWUgdG8gZmxhc2ggYmxvY2tlcnMgc2lsZW50bHkgcmVtb3ZpbmcgdGhlIFNXRiBvYmplY3QvZW1iZWQgbm9kZSBmcm9tIHRoZSBET00uIFdhcm4gYW5kIGNvbnRpbnVlLlxyXG5cclxuICAgICAgICBfd0RTKCdiYWRSZW1vdmUnLCAyKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWN0dWFsbHksIGZvcmNlIHJlY3JlYXRlIG9mIG1vdmllLlxyXG5cclxuICAgIG9SZW1vdmVkSFRNTCA9IG9SZW1vdmVkID0gbmVlZHNGbGFzaCA9IGZsYXNoID0gbnVsbDtcclxuXHJcbiAgICBzbTIuZW5hYmxlZCA9IGRpZERDTG9hZGVkID0gZGlkSW5pdCA9IHdhaXRpbmdGb3JFSSA9IGluaXRQZW5kaW5nID0gZGlkQXBwZW5kID0gYXBwZW5kU3VjY2VzcyA9IGRpc2FibGVkID0gdXNlR2xvYmFsSFRNTDVBdWRpbyA9IHNtMi5zd2ZMb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICBzbTIuc291bmRJRHMgPSBbXTtcclxuICAgIHNtMi5zb3VuZHMgPSB7fTtcclxuXHJcbiAgICBpZENvdW50ZXIgPSAwO1xyXG4gICAgZGlkU2V0dXAgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIXJlc2V0RXZlbnRzKSB7XHJcbiAgICAgIC8vIHJlc2V0IGNhbGxiYWNrcyBmb3Igb25yZWFkeSwgb250aW1lb3V0IGV0Yy4gc28gdGhhdCB0aGV5IHdpbGwgZmlyZSBhZ2FpbiBvbiByZS1pbml0XHJcbiAgICAgIGZvciAoaSBpbiBvbl9xdWV1ZSkge1xyXG4gICAgICAgIGlmIChvbl9xdWV1ZS5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG4gICAgICAgICAgZm9yIChqID0gMCwgayA9IG9uX3F1ZXVlW2ldLmxlbmd0aDsgaiA8IGs7IGorKykge1xyXG4gICAgICAgICAgICBvbl9xdWV1ZVtpXVtqXS5maXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gcmVtb3ZlIGFsbCBjYWxsYmFja3MgZW50aXJlbHlcclxuICAgICAgb25fcXVldWUgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmICghZXhjbHVkZUluaXQpIHtcclxuICAgICAgc20yLl93RChzbSArICc6IFJlYm9vdGluZy4uLicpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIC8vIHJlc2V0IEhUTUw1IGFuZCBmbGFzaCBjYW5QbGF5IHRlc3QgcmVzdWx0c1xyXG5cclxuICAgIHNtMi5odG1sNSA9IHtcclxuICAgICAgJ3VzaW5nRmxhc2gnOiBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIHNtMi5mbGFzaCA9IHt9O1xyXG5cclxuICAgIC8vIHJlc2V0IGRldmljZS1zcGVjaWZpYyBIVE1ML2ZsYXNoIG1vZGUgc3dpdGNoZXNcclxuXHJcbiAgICBzbTIuaHRtbDVPbmx5ID0gZmFsc2U7XHJcbiAgICBzbTIuaWdub3JlRmxhc2ggPSBmYWxzZTtcclxuXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIGJ5IGRlZmF1bHQsIHJlLWluaXRcclxuXHJcbiAgICAgIGlmICghZXhjbHVkZUluaXQpIHtcclxuICAgICAgICBzbTIuYmVnaW5EZWxheWVkSW5pdCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwgMjApO1xyXG5cclxuICAgIHJldHVybiBzbTI7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNodXRzIGRvd24gYW5kIHJlc3RvcmVzIHRoZSBTb3VuZE1hbmFnZXIgaW5zdGFuY2UgdG8gaXRzIG9yaWdpbmFsIGxvYWRlZCBzdGF0ZSwgd2l0aG91dCBhbiBleHBsaWNpdCByZWJvb3QuIEFsbCBvbnJlYWR5L29udGltZW91dCBoYW5kbGVycyBhcmUgcmVtb3ZlZC5cclxuICAgICAqIEFmdGVyIHRoaXMgY2FsbCwgU00yIG1heSBiZSByZS1pbml0aWFsaXplZCB2aWEgc291bmRNYW5hZ2VyLmJlZ2luRGVsYXllZEluaXQoKS5cclxuICAgICAqIEByZXR1cm4ge29iamVjdH0gc291bmRNYW5hZ2VyIFRoZSBzb3VuZE1hbmFnZXIgaW5zdGFuY2UuXHJcbiAgICAgKi9cclxuXHJcbiAgICBfd0RTKCdyZXNldCcpO1xyXG4gICAgcmV0dXJuIHNtMi5yZWJvb3QodHJ1ZSwgdHJ1ZSk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFVuZG9jdW1lbnRlZDogRGV0ZXJtaW5lcyB0aGUgU00yIGZsYXNoIG1vdmllJ3MgbG9hZCBwcm9ncmVzcy5cclxuICAgKlxyXG4gICAqIEByZXR1cm4ge251bWJlciBvciBudWxsfSBQZXJjZW50IGxvYWRlZCwgb3IgaWYgaW52YWxpZC91bnN1cHBvcnRlZCwgbnVsbC5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5nZXRNb3ZpZVBlcmNlbnQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVyZXN0aW5nIHN5bnRheCBub3Rlcy4uLlxyXG4gICAgICogRmxhc2gvRXh0ZXJuYWxJbnRlcmZhY2UgKEFjdGl2ZVgvTlBBUEkpIGJyaWRnZSBtZXRob2RzIGFyZSBub3QgdHlwZW9mIFwiZnVuY3Rpb25cIiBub3IgaW5zdGFuY2VvZiBGdW5jdGlvbiwgYnV0IGFyZSBzdGlsbCB2YWxpZC5cclxuICAgICAqIEFkZGl0aW9uYWxseSwgSlNMaW50IGRpc2xpa2VzICgnUGVyY2VudExvYWRlZCcgaW4gZmxhc2gpLXN0eWxlIHN5bnRheCBhbmQgcmVjb21tZW5kcyBoYXNPd25Qcm9wZXJ0eSgpLCB3aGljaCBkb2VzIG5vdCB3b3JrIGluIHRoaXMgY2FzZS5cclxuICAgICAqIEZ1cnRoZXJtb3JlLCB1c2luZyAoZmxhc2ggJiYgZmxhc2guUGVyY2VudExvYWRlZCkgY2F1c2VzIElFIHRvIHRocm93IFwib2JqZWN0IGRvZXNuJ3Qgc3VwcG9ydCB0aGlzIHByb3BlcnR5IG9yIG1ldGhvZFwiLlxyXG4gICAgICogVGh1cywgJ2luJyBzeW50YXggbXVzdCBiZSB1c2VkLlxyXG4gICAgICovXHJcblxyXG4gICAgcmV0dXJuIChmbGFzaCAmJiAnUGVyY2VudExvYWRlZCcgaW4gZmxhc2ggPyBmbGFzaC5QZXJjZW50TG9hZGVkKCkgOiBudWxsKTsgLy8gWWVzLCBKU0xpbnQuIFNlZSBuZWFyYnkgY29tbWVudCBpbiBzb3VyY2UgZm9yIGV4cGxhbmF0aW9uLlxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBBZGRpdGlvbmFsIGhlbHBlciBmb3IgbWFudWFsbHkgaW52b2tpbmcgU00yJ3MgaW5pdCBwcm9jZXNzIGFmdGVyIERPTSBSZWFkeSAvIHdpbmRvdy5vbmxvYWQoKS5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5iZWdpbkRlbGF5ZWRJbml0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgd2luZG93TG9hZGVkID0gdHJ1ZTtcclxuICAgIGRvbUNvbnRlbnRMb2FkZWQoKTtcclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKGluaXRQZW5kaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjcmVhdGVNb3ZpZSgpO1xyXG4gICAgICBpbml0TW92aWUoKTtcclxuICAgICAgaW5pdFBlbmRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSwgMjApO1xyXG5cclxuICAgIGRlbGF5V2FpdEZvckVJKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERlc3Ryb3lzIHRoZSBTb3VuZE1hbmFnZXIgaW5zdGFuY2UgYW5kIGFsbCBTTVNvdW5kIGluc3RhbmNlcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5kZXN0cnVjdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHNtMi5fd0Qoc20gKyAnLmRlc3RydWN0KCknKTtcclxuICAgIHNtMi5kaXNhYmxlKHRydWUpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBTTVNvdW5kKCkgKHNvdW5kIG9iamVjdCkgY29uc3RydWN0b3JcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBTb3VuZCBvcHRpb25zIChpZCBhbmQgdXJsIGFyZSByZXF1aXJlZCBhdHRyaWJ1dGVzKVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBuZXcgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgU01Tb3VuZCA9IGZ1bmN0aW9uKG9PcHRpb25zKSB7XHJcblxyXG4gICAgdmFyIHMgPSB0aGlzLCByZXNldFByb3BlcnRpZXMsIGFkZF9odG1sNV9ldmVudHMsIHJlbW92ZV9odG1sNV9ldmVudHMsIHN0b3BfaHRtbDVfdGltZXIsIHN0YXJ0X2h0bWw1X3RpbWVyLCBhdHRhY2hPblBvc2l0aW9uLCBvbnBsYXlfY2FsbGVkID0gZmFsc2UsIG9uUG9zaXRpb25JdGVtcyA9IFtdLCBvblBvc2l0aW9uRmlyZWQgPSAwLCBkZXRhY2hPblBvc2l0aW9uLCBhcHBseUZyb21UbywgbGFzdFVSTCA9IG51bGwsIGxhc3RIVE1MNVN0YXRlLCB1cmxPbWl0dGVkO1xyXG5cclxuICAgIGxhc3RIVE1MNVN0YXRlID0ge1xyXG4gICAgICAvLyB0cmFja3MgZHVyYXRpb24gKyBwb3NpdGlvbiAodGltZSlcclxuICAgICAgZHVyYXRpb246IG51bGwsXHJcbiAgICAgIHRpbWU6IG51bGxcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5pZCA9IG9PcHRpb25zLmlkO1xyXG5cclxuICAgIC8vIGxlZ2FjeVxyXG4gICAgdGhpcy5zSUQgPSB0aGlzLmlkO1xyXG5cclxuICAgIHRoaXMudXJsID0gb09wdGlvbnMudXJsO1xyXG4gICAgdGhpcy5vcHRpb25zID0gbWl4aW4ob09wdGlvbnMpO1xyXG5cclxuICAgIC8vIHBlci1wbGF5LWluc3RhbmNlLXNwZWNpZmljIG9wdGlvbnNcclxuICAgIHRoaXMuaW5zdGFuY2VPcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cclxuICAgIC8vIHNob3J0IGFsaWFzXHJcbiAgICB0aGlzLl9pTyA9IHRoaXMuaW5zdGFuY2VPcHRpb25zO1xyXG5cclxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0eSBkZWZhdWx0c1xyXG4gICAgdGhpcy5wYW4gPSB0aGlzLm9wdGlvbnMucGFuO1xyXG4gICAgdGhpcy52b2x1bWUgPSB0aGlzLm9wdGlvbnMudm9sdW1lO1xyXG5cclxuICAgIC8vIHdoZXRoZXIgb3Igbm90IHRoaXMgb2JqZWN0IGlzIHVzaW5nIEhUTUw1XHJcbiAgICB0aGlzLmlzSFRNTDUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBpbnRlcm5hbCBIVE1MNSBBdWRpbygpIG9iamVjdCByZWZlcmVuY2VcclxuICAgIHRoaXMuX2EgPSBudWxsO1xyXG5cclxuICAgIC8vIGZvciBmbGFzaCA4IHNwZWNpYWwtY2FzZSBjcmVhdGVTb3VuZCgpIHdpdGhvdXQgdXJsLCBmb2xsb3dlZCBieSBsb2FkL3BsYXkgd2l0aCB1cmwgY2FzZVxyXG4gICAgdXJsT21pdHRlZCA9ICh0aGlzLnVybCA/IGZhbHNlIDogdHJ1ZSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTTVNvdW5kKCkgcHVibGljIG1ldGhvZHNcclxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5pZDMgPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdyaXRlcyBTTVNvdW5kIG9iamVjdCBwYXJhbWV0ZXJzIHRvIGRlYnVnIGNvbnNvbGVcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX2RlYnVnID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogTWVyZ2VkIG9wdGlvbnM6Jywgcy5vcHRpb25zKTtcclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCZWdpbnMgbG9hZGluZyBhIHNvdW5kIHBlciBpdHMgKnVybCouXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIE9wdGlvbmFsOiBTb3VuZCBvcHRpb25zXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMubG9hZCA9IGZ1bmN0aW9uKG9PcHRpb25zKSB7XHJcblxyXG4gICAgICB2YXIgb1NvdW5kID0gbnVsbCwgaW5zdGFuY2VPcHRpb25zO1xyXG5cclxuICAgICAgaWYgKG9PcHRpb25zICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcy5faU8gPSBtaXhpbihvT3B0aW9ucywgcy5vcHRpb25zKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvT3B0aW9ucyA9IHMub3B0aW9ucztcclxuICAgICAgICBzLl9pTyA9IG9PcHRpb25zO1xyXG4gICAgICAgIGlmIChsYXN0VVJMICYmIGxhc3RVUkwgIT09IHMudXJsKSB7XHJcbiAgICAgICAgICBfd0RTKCdtYW5VUkwnKTtcclxuICAgICAgICAgIHMuX2lPLnVybCA9IHMudXJsO1xyXG4gICAgICAgICAgcy51cmwgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLl9pTy51cmwpIHtcclxuICAgICAgICBzLl9pTy51cmwgPSBzLnVybDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5faU8udXJsID0gcGFyc2VVUkwocy5faU8udXJsKTtcclxuXHJcbiAgICAgIC8vIGVuc3VyZSB3ZSdyZSBpbiBzeW5jXHJcbiAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICAvLyBsb2NhbCBzaG9ydGN1dFxyXG4gICAgICBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IGxvYWQgKCcgKyBpbnN0YW5jZU9wdGlvbnMudXJsICsgJyknKTtcclxuXHJcbiAgICAgIGlmICghaW5zdGFuY2VPcHRpb25zLnVybCAmJiAhcy51cmwpIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBsb2FkKCk6IHVybCBpcyB1bmFzc2lnbmVkLiBFeGl0aW5nLicsIDIpO1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgZlYgPT09IDggJiYgIXMudXJsICYmICFpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXkpIHtcclxuICAgICAgICAvLyBmbGFzaCA4IGxvYWQoKSAtPiBwbGF5KCkgd29uJ3Qgd29yayBiZWZvcmUgb25sb2FkIGhhcyBmaXJlZC5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBGbGFzaCA4IGxvYWQoKSBsaW1pdGF0aW9uOiBXYWl0IGZvciBvbmxvYWQoKSBiZWZvcmUgY2FsbGluZyBwbGF5KCkuJywgMSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy51cmwgPT09IHMudXJsICYmIHMucmVhZHlTdGF0ZSAhPT0gMCAmJiBzLnJlYWR5U3RhdGUgIT09IDIpIHtcclxuICAgICAgICBfd0RTKCdvblVSTCcsIDEpO1xyXG4gICAgICAgIC8vIGlmIGxvYWRlZCBhbmQgYW4gb25sb2FkKCkgZXhpc3RzLCBmaXJlIGltbWVkaWF0ZWx5LlxyXG4gICAgICAgIGlmIChzLnJlYWR5U3RhdGUgPT09IDMgJiYgaW5zdGFuY2VPcHRpb25zLm9ubG9hZCkge1xyXG4gICAgICAgICAgLy8gYXNzdW1lIHN1Y2Nlc3MgYmFzZWQgb24gdHJ1dGh5IGR1cmF0aW9uLlxyXG4gICAgICAgICAgd3JhcENhbGxiYWNrKHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZU9wdGlvbnMub25sb2FkLmFwcGx5KHMsIFsoISFzLmR1cmF0aW9uKV0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXNldCBhIGZldyBzdGF0ZSBwcm9wZXJ0aWVzXHJcblxyXG4gICAgICBzLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICBzLnJlYWR5U3RhdGUgPSAxO1xyXG4gICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcbiAgICAgIHMuaWQzID0ge307XHJcblxyXG4gICAgICAvLyBUT0RPOiBJZiBzd2l0Y2hpbmcgZnJvbSBIVE1MNSAtPiBmbGFzaCAob3IgdmljZSB2ZXJzYSksIHN0b3AgY3VycmVudGx5LXBsYXlpbmcgYXVkaW8uXHJcblxyXG4gICAgICBpZiAoaHRtbDVPSyhpbnN0YW5jZU9wdGlvbnMpKSB7XHJcblxyXG4gICAgICAgIG9Tb3VuZCA9IHMuX3NldHVwX2h0bWw1KGluc3RhbmNlT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmICghb1NvdW5kLl9jYWxsZWRfbG9hZCkge1xyXG5cclxuICAgICAgICAgIHMuX2h0bWw1X2NhbnBsYXkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAvLyBUT0RPOiByZXZpZXcgY2FsbGVkX2xvYWQgLyBodG1sNV9jYW5wbGF5IGxvZ2ljXHJcblxyXG4gICAgICAgICAgLy8gaWYgdXJsIHByb3ZpZGVkIGRpcmVjdGx5IHRvIGxvYWQoKSwgYXNzaWduIGl0IGhlcmUuXHJcblxyXG4gICAgICAgICAgaWYgKHMudXJsICE9PSBpbnN0YW5jZU9wdGlvbnMudXJsKSB7XHJcblxyXG4gICAgICAgICAgICBzbTIuX3dEKF93RFMoJ21hblVSTCcpICsgJzogJyArIGluc3RhbmNlT3B0aW9ucy51cmwpO1xyXG5cclxuICAgICAgICAgICAgcy5fYS5zcmMgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogcmV2aWV3IC8gcmUtYXBwbHkgYWxsIHJlbGV2YW50IG9wdGlvbnMgKHZvbHVtZSwgbG9vcCwgb25wb3NpdGlvbiBldGMuKVxyXG5cclxuICAgICAgICAgICAgLy8gcmVzZXQgcG9zaXRpb24gZm9yIG5ldyBVUkxcclxuICAgICAgICAgICAgcy5zZXRQb3NpdGlvbigwKTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gZ2l2ZW4gZXhwbGljaXQgbG9hZCBjYWxsLCB0cnkgdG8gcHJlbG9hZC5cclxuXHJcbiAgICAgICAgICAvLyBlYXJseSBIVE1MNSBpbXBsZW1lbnRhdGlvbiAobm9uLXN0YW5kYXJkKVxyXG4gICAgICAgICAgcy5fYS5hdXRvYnVmZmVyID0gJ2F1dG8nO1xyXG5cclxuICAgICAgICAgIC8vIHN0YW5kYXJkIHByb3BlcnR5LCB2YWx1ZXM6IG5vbmUgLyBtZXRhZGF0YSAvIGF1dG9cclxuICAgICAgICAgIC8vIHJlZmVyZW5jZTogaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2ZmOTc0NzU5JTI4dj12cy44NSUyOS5hc3B4XHJcbiAgICAgICAgICBzLl9hLnByZWxvYWQgPSAnYXV0byc7XHJcblxyXG4gICAgICAgICAgcy5fYS5fY2FsbGVkX2xvYWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IElnbm9yaW5nIHJlcXVlc3QgdG8gbG9hZCBhZ2FpbicpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogTm8gZmxhc2ggc3VwcG9ydC4gRXhpdGluZy4nKTtcclxuICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHMuX2lPLnVybCAmJiBzLl9pTy51cmwubWF0Y2goL2RhdGFcXDovaSkpIHtcclxuICAgICAgICAgIC8vIGRhdGE6IFVSSXMgbm90IHN1cHBvcnRlZCBieSBGbGFzaCwgZWl0aGVyLlxyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogZGF0YTogVVJJcyBub3Qgc3VwcG9ydGVkIHZpYSBGbGFzaC4gRXhpdGluZy4nKTtcclxuICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHMuaXNIVE1MNSA9IGZhbHNlO1xyXG4gICAgICAgICAgcy5faU8gPSBwb2xpY3lGaXgobG9vcEZpeChpbnN0YW5jZU9wdGlvbnMpKTtcclxuICAgICAgICAgIC8vIGlmIHdlIGhhdmUgXCJwb3NpdGlvblwiLCBkaXNhYmxlIGF1dG8tcGxheSBhcyB3ZSdsbCBiZSBzZWVraW5nIHRvIHRoYXQgcG9zaXRpb24gYXQgb25sb2FkKCkuXHJcbiAgICAgICAgICBpZiAocy5faU8uYXV0b1BsYXkgJiYgKHMuX2lPLnBvc2l0aW9uIHx8IHMuX2lPLmZyb20pKSB7XHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IERpc2FibGluZyBhdXRvUGxheSBiZWNhdXNlIG9mIG5vbi16ZXJvIG9mZnNldCBjYXNlJyk7XHJcbiAgICAgICAgICAgIHMuX2lPLmF1dG9QbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyByZS1hc3NpZ24gbG9jYWwgc2hvcnRjdXRcclxuICAgICAgICAgIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG4gICAgICAgICAgaWYgKGZWID09PSA4KSB7XHJcbiAgICAgICAgICAgIGZsYXNoLl9sb2FkKHMuaWQsIGluc3RhbmNlT3B0aW9ucy51cmwsIGluc3RhbmNlT3B0aW9ucy5zdHJlYW0sIGluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSwgaW5zdGFuY2VPcHRpb25zLnVzZVBvbGljeUZpbGUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmxhc2guX2xvYWQocy5pZCwgaW5zdGFuY2VPcHRpb25zLnVybCwgISEoaW5zdGFuY2VPcHRpb25zLnN0cmVhbSksICEhKGluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSksIGluc3RhbmNlT3B0aW9ucy5sb29wcyB8fCAxLCAhIShpbnN0YW5jZU9wdGlvbnMuYXV0b0xvYWQpLCBpbnN0YW5jZU9wdGlvbnMudXNlUG9saWN5RmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICBfd0RTKCdzbUVycm9yJywgMik7XHJcbiAgICAgICAgICBkZWJ1Z1RTKCdvbmxvYWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICBjYXRjaEVycm9yKHtcclxuICAgICAgICAgICAgdHlwZTogJ1NNU09VTkRfTE9BRF9KU19FWENFUFRJT04nLFxyXG4gICAgICAgICAgICBmYXRhbDogdHJ1ZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYWZ0ZXIgYWxsIG9mIHRoaXMsIGVuc3VyZSBzb3VuZCB1cmwgaXMgdXAgdG8gZGF0ZS5cclxuICAgICAgcy51cmwgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVubG9hZHMgYSBzb3VuZCwgY2FuY2VsaW5nIGFueSBvcGVuIEhUVFAgcmVxdWVzdHMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnVubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gRmxhc2ggOC9BUzIgY2FuJ3QgXCJjbG9zZVwiIGEgc3RyZWFtIC0gZmFrZSBpdCBieSBsb2FkaW5nIGFuIGVtcHR5IFVSTFxyXG4gICAgICAvLyBGbGFzaCA5L0FTMzogQ2xvc2Ugc3RyZWFtLCBwcmV2ZW50aW5nIGZ1cnRoZXIgbG9hZFxyXG4gICAgICAvLyBIVE1MNTogTW9zdCBVQXMgd2lsbCB1c2UgZW1wdHkgVVJMXHJcblxyXG4gICAgICBpZiAocy5yZWFkeVN0YXRlICE9PSAwKSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHVubG9hZCgpJyk7XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgICAgaWYgKGZWID09PSA4KSB7XHJcbiAgICAgICAgICAgIGZsYXNoLl91bmxvYWQocy5pZCwgZW1wdHlVUkwpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmxhc2guX3VubG9hZChzLmlkKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgICAgaWYgKHMuX2EpIHtcclxuXHJcbiAgICAgICAgICAgIHMuX2EucGF1c2UoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBlbXB0eSBVUkwsIHRvb1xyXG4gICAgICAgICAgICBsYXN0VVJMID0gaHRtbDVVbmxvYWQocy5fYSk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlc2V0IGxvYWQvc3RhdHVzIGZsYWdzXHJcbiAgICAgICAgcmVzZXRQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5sb2FkcyBhbmQgZGVzdHJveXMgYSBzb3VuZC5cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuZGVzdHJ1Y3QgPSBmdW5jdGlvbihfYkZyb21TTSkge1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogRGVzdHJ1Y3QnKTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgIC8vIGtpbGwgc291bmQgd2l0aGluIEZsYXNoXHJcbiAgICAgICAgLy8gRGlzYWJsZSB0aGUgb25mYWlsdXJlIGhhbmRsZXJcclxuICAgICAgICBzLl9pTy5vbmZhaWx1cmUgPSBudWxsO1xyXG4gICAgICAgIGZsYXNoLl9kZXN0cm95U291bmQocy5pZCk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgIGlmIChzLl9hKSB7XHJcbiAgICAgICAgICBzLl9hLnBhdXNlKCk7XHJcbiAgICAgICAgICBodG1sNVVubG9hZChzLl9hKTtcclxuICAgICAgICAgIGlmICghdXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG4gICAgICAgICAgICByZW1vdmVfaHRtbDVfZXZlbnRzKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBicmVhayBvYnZpb3VzIGNpcmN1bGFyIHJlZmVyZW5jZVxyXG4gICAgICAgICAgcy5fYS5fcyA9IG51bGw7XHJcbiAgICAgICAgICBzLl9hID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIV9iRnJvbVNNKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlIGRlbGV0aW9uIGZyb20gY29udHJvbGxlclxyXG4gICAgICAgIHNtMi5kZXN0cm95U291bmQocy5pZCwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmVnaW5zIHBsYXlpbmcgYSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgT3B0aW9uYWw6IFNvdW5kIG9wdGlvbnNcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5wbGF5ID0gZnVuY3Rpb24ob09wdGlvbnMsIF91cGRhdGVQbGF5U3RhdGUpIHtcclxuXHJcbiAgICAgIHZhciBmTiwgYWxsb3dNdWx0aSwgYSwgb25yZWFkeSxcclxuICAgICAgICAgIGF1ZGlvQ2xvbmUsIG9uZW5kZWQsIG9uY2FucGxheSxcclxuICAgICAgICAgIHN0YXJ0T0sgPSB0cnVlLFxyXG4gICAgICAgICAgZXhpdCA9IG51bGw7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgZk4gPSBzLmlkICsgJzogcGxheSgpOiAnO1xyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICAvLyBkZWZhdWx0IHRvIHRydWVcclxuICAgICAgX3VwZGF0ZVBsYXlTdGF0ZSA9IChfdXBkYXRlUGxheVN0YXRlID09PSBfdW5kZWZpbmVkID8gdHJ1ZSA6IF91cGRhdGVQbGF5U3RhdGUpO1xyXG5cclxuICAgICAgaWYgKCFvT3B0aW9ucykge1xyXG4gICAgICAgIG9PcHRpb25zID0ge307XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGZpcnN0LCB1c2UgbG9jYWwgVVJMIChpZiBzcGVjaWZpZWQpXHJcbiAgICAgIGlmIChzLnVybCkge1xyXG4gICAgICAgIHMuX2lPLnVybCA9IHMudXJsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtaXggaW4gYW55IG9wdGlvbnMgZGVmaW5lZCBhdCBjcmVhdGVTb3VuZCgpXHJcbiAgICAgIHMuX2lPID0gbWl4aW4ocy5faU8sIHMub3B0aW9ucyk7XHJcblxyXG4gICAgICAvLyBtaXggaW4gYW55IG9wdGlvbnMgc3BlY2lmaWMgdG8gdGhpcyBtZXRob2RcclxuICAgICAgcy5faU8gPSBtaXhpbihvT3B0aW9ucywgcy5faU8pO1xyXG5cclxuICAgICAgcy5faU8udXJsID0gcGFyc2VVUkwocy5faU8udXJsKTtcclxuXHJcbiAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICAvLyBSVE1QLW9ubHlcclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgcy5faU8uc2VydmVyVVJMICYmICFzLmNvbm5lY3RlZCkge1xyXG4gICAgICAgIGlmICghcy5nZXRBdXRvUGxheSgpKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsnIE5ldHN0cmVhbSBub3QgY29ubmVjdGVkIHlldCAtIHNldHRpbmcgYXV0b1BsYXknKTtcclxuICAgICAgICAgIHMuc2V0QXV0b1BsYXkodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHBsYXkgd2lsbCBiZSBjYWxsZWQgaW4gb25jb25uZWN0KClcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGh0bWw1T0socy5faU8pKSB7XHJcbiAgICAgICAgcy5fc2V0dXBfaHRtbDUocy5faU8pO1xyXG4gICAgICAgIHN0YXJ0X2h0bWw1X3RpbWVyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMSAmJiAhcy5wYXVzZWQpIHtcclxuXHJcbiAgICAgICAgYWxsb3dNdWx0aSA9IHMuX2lPLm11bHRpU2hvdDtcclxuXHJcbiAgICAgICAgaWYgKCFhbGxvd011bHRpKSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChmTiArICdBbHJlYWR5IHBsYXlpbmcgKG9uZS1zaG90KScsIDEpO1xyXG5cclxuICAgICAgICAgIGlmIChzLmlzSFRNTDUpIHtcclxuICAgICAgICAgICAgLy8gZ28gYmFjayB0byBvcmlnaW5hbCBwb3NpdGlvbi5cclxuICAgICAgICAgICAgcy5zZXRQb3NpdGlvbihzLl9pTy5wb3NpdGlvbik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZXhpdCA9IHM7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0FscmVhZHkgcGxheWluZyAobXVsdGktc2hvdCknLCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXhpdCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBleGl0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBlZGdlIGNhc2U6IHBsYXkoKSB3aXRoIGV4cGxpY2l0IFVSTCBwYXJhbWV0ZXJcclxuICAgICAgaWYgKG9PcHRpb25zLnVybCAmJiBvT3B0aW9ucy51cmwgIT09IHMudXJsKSB7XHJcblxyXG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgY3JlYXRlU291bmQoKSBmb2xsb3dlZCBieSBsb2FkKCkgLyBwbGF5KCkgd2l0aCB1cmw7IGF2b2lkIGRvdWJsZS1sb2FkIGNhc2UuXHJcbiAgICAgICAgaWYgKCFzLnJlYWR5U3RhdGUgJiYgIXMuaXNIVE1MNSAmJiBmViA9PT0gOCAmJiB1cmxPbWl0dGVkKSB7XHJcblxyXG4gICAgICAgICAgdXJsT21pdHRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIGxvYWQgdXNpbmcgbWVyZ2VkIG9wdGlvbnNcclxuICAgICAgICAgIHMubG9hZChzLl9pTyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5sb2FkZWQpIHtcclxuXHJcbiAgICAgICAgaWYgKHMucmVhZHlTdGF0ZSA9PT0gMCkge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQXR0ZW1wdGluZyB0byBsb2FkJyk7XHJcblxyXG4gICAgICAgICAgLy8gdHJ5IHRvIGdldCB0aGlzIHNvdW5kIHBsYXlpbmcgQVNBUFxyXG4gICAgICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgIXNtMi5odG1sNU9ubHkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGZsYXNoOiBhc3NpZ24gZGlyZWN0bHkgYmVjYXVzZSBzZXRBdXRvUGxheSgpIGluY3JlbWVudHMgdGhlIGluc3RhbmNlQ291bnRcclxuICAgICAgICAgICAgcy5faU8uYXV0b1BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICBzLmxvYWQocy5faU8pO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAocy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpT1MgbmVlZHMgdGhpcyB3aGVuIHJlY3ljbGluZyBzb3VuZHMsIGxvYWRpbmcgYSBuZXcgVVJMIG9uIGFuIGV4aXN0aW5nIG9iamVjdC5cclxuICAgICAgICAgICAgcy5sb2FkKHMuX2lPKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgc20yLl93RChmTiArICdVbnN1cHBvcnRlZCB0eXBlLiBFeGl0aW5nLicpO1xyXG4gICAgICAgICAgICBleGl0ID0gcztcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gSFRNTDUgaGFjayAtIHJlLXNldCBpbnN0YW5jZU9wdGlvbnM/XHJcbiAgICAgICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHMucmVhZHlTdGF0ZSA9PT0gMikge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQ291bGQgbm90IGxvYWQgLSBleGl0aW5nJywgMik7XHJcbiAgICAgICAgICBleGl0ID0gcztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0xvYWRpbmcgLSBhdHRlbXB0aW5nIHRvIHBsYXkuLi4nKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gXCJwbGF5KClcIlxyXG4gICAgICAgIHNtMi5fd0QoZk4uc3Vic3RyKDAsIGZOLmxhc3RJbmRleE9mKCc6JykpKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChleGl0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIGV4aXQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmIGZWID09PSA5ICYmIHMucG9zaXRpb24gPiAwICYmIHMucG9zaXRpb24gPT09IHMuZHVyYXRpb24pIHtcclxuICAgICAgICAvLyBmbGFzaCA5IG5lZWRzIGEgcG9zaXRpb24gcmVzZXQgaWYgcGxheSgpIGlzIGNhbGxlZCB3aGlsZSBhdCB0aGUgZW5kIG9mIGEgc291bmQuXHJcbiAgICAgICAgc20yLl93RChmTiArICdTb3VuZCBhdCBlbmQsIHJlc2V0dGluZyB0byBwb3NpdGlvbjogMCcpO1xyXG4gICAgICAgIG9PcHRpb25zLnBvc2l0aW9uID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFN0cmVhbXMgd2lsbCBwYXVzZSB3aGVuIHRoZWlyIGJ1ZmZlciBpcyBmdWxsIGlmIHRoZXkgYXJlIGJlaW5nIGxvYWRlZC5cclxuICAgICAgICogSW4gdGhpcyBjYXNlIHBhdXNlZCBpcyB0cnVlLCBidXQgdGhlIHNvbmcgaGFzbid0IHN0YXJ0ZWQgcGxheWluZyB5ZXQuXHJcbiAgICAgICAqIElmIHdlIGp1c3QgY2FsbCByZXN1bWUoKSB0aGUgb25wbGF5KCkgY2FsbGJhY2sgd2lsbCBuZXZlciBiZSBjYWxsZWQuXHJcbiAgICAgICAqIFNvIG9ubHkgY2FsbCByZXN1bWUoKSBpZiB0aGUgcG9zaXRpb24gaXMgPiAwLlxyXG4gICAgICAgKiBBbm90aGVyIHJlYXNvbiBpcyBiZWNhdXNlIG9wdGlvbnMgbGlrZSB2b2x1bWUgd29uJ3QgaGF2ZSBiZWVuIGFwcGxpZWQgeWV0LlxyXG4gICAgICAgKiBGb3Igbm9ybWFsIHNvdW5kcywganVzdCByZXN1bWUuXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgaWYgKHMucGF1c2VkICYmIHMucG9zaXRpb24gPj0gMCAmJiAoIXMuX2lPLnNlcnZlclVSTCB8fCBzLnBvc2l0aW9uID4gMCkpIHtcclxuXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vMzdiMTdkZjc1Y2M0ZDdhOTBiZjZcclxuICAgICAgICBzbTIuX3dEKGZOICsgJ1Jlc3VtaW5nIGZyb20gcGF1c2VkIHN0YXRlJywgMSk7XHJcbiAgICAgICAgcy5yZXN1bWUoKTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHMuX2lPID0gbWl4aW4ob09wdGlvbnMsIHMuX2lPKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUHJlbG9hZCBpbiB0aGUgZXZlbnQgb2YgcGxheSgpIHdpdGggcG9zaXRpb24gdW5kZXIgRmxhc2gsXHJcbiAgICAgICAgICogb3IgZnJvbS90byBwYXJhbWV0ZXJzIGFuZCBub24tUlRNUCBjYXNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCgoIXMuaXNIVE1MNSAmJiBzLl9pTy5wb3NpdGlvbiAhPT0gbnVsbCAmJiBzLl9pTy5wb3NpdGlvbiA+IDApIHx8IChzLl9pTy5mcm9tICE9PSBudWxsICYmIHMuX2lPLmZyb20gPiAwKSB8fCBzLl9pTy50byAhPT0gbnVsbCkgJiYgcy5pbnN0YW5jZUNvdW50ID09PSAwICYmIHMucGxheVN0YXRlID09PSAwICYmICFzLl9pTy5zZXJ2ZXJVUkwpIHtcclxuXHJcbiAgICAgICAgICBvbnJlYWR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIHNvdW5kIFwiY2FucGxheVwiIG9yIG9ubG9hZCgpXHJcbiAgICAgICAgICAgIC8vIHJlLWFwcGx5IHBvc2l0aW9uL2Zyb20vdG8gdG8gaW5zdGFuY2Ugb3B0aW9ucywgYW5kIHN0YXJ0IHBsYXliYWNrXHJcbiAgICAgICAgICAgIHMuX2lPID0gbWl4aW4ob09wdGlvbnMsIHMuX2lPKTtcclxuICAgICAgICAgICAgcy5wbGF5KHMuX2lPKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgLy8gSFRNTDUgbmVlZHMgdG8gYXQgbGVhc3QgaGF2ZSBcImNhbnBsYXlcIiBmaXJlZCBiZWZvcmUgc2Vla2luZy5cclxuICAgICAgICAgIGlmIChzLmlzSFRNTDUgJiYgIXMuX2h0bWw1X2NhbnBsYXkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoaXMgaGFzbid0IGJlZW4gbG9hZGVkIHlldC4gbG9hZCBpdCBmaXJzdCwgYW5kIHRoZW4gZG8gdGhpcyBhZ2Fpbi5cclxuICAgICAgICAgICAgc20yLl93RChmTiArICdCZWdpbm5pbmcgbG9hZCBmb3Igbm9uLXplcm8gb2Zmc2V0IGNhc2UnKTtcclxuXHJcbiAgICAgICAgICAgIHMubG9hZCh7XHJcbiAgICAgICAgICAgICAgLy8gbm90ZTogY3VzdG9tIEhUTUw1LW9ubHkgZXZlbnQgYWRkZWQgZm9yIGZyb20vdG8gaW1wbGVtZW50YXRpb24uXHJcbiAgICAgICAgICAgICAgX29uY2FucGxheTogb25yZWFkeVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGV4aXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCFzLmlzSFRNTDUgJiYgIXMubG9hZGVkICYmICghcy5yZWFkeVN0YXRlIHx8IHMucmVhZHlTdGF0ZSAhPT0gMikpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHRvIGJlIHNhZmUsIHByZWxvYWQgdGhlIHdob2xlIHRoaW5nIGluIEZsYXNoLlxyXG5cclxuICAgICAgICAgICAgc20yLl93RChmTiArICdQcmVsb2FkaW5nIGZvciBub24temVybyBvZmZzZXQgY2FzZScpO1xyXG5cclxuICAgICAgICAgICAgcy5sb2FkKHtcclxuICAgICAgICAgICAgICBvbmxvYWQ6IG9ucmVhZHlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBleGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChleGl0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBleGl0O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIG90aGVyd2lzZSwgd2UncmUgcmVhZHkgdG8gZ28uIHJlLWFwcGx5IGxvY2FsIG9wdGlvbnMsIGFuZCBjb250aW51ZVxyXG5cclxuICAgICAgICAgIHMuX2lPID0gYXBwbHlGcm9tVG8oKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzbTIuX3dEKGZOICsgJ1N0YXJ0aW5nIHRvIHBsYXknKTtcclxuXHJcbiAgICAgICAgLy8gaW5jcmVtZW50IGluc3RhbmNlIGNvdW50ZXIsIHdoZXJlIGVuYWJsZWQgKyBzdXBwb3J0ZWRcclxuICAgICAgICBpZiAoIXMuaW5zdGFuY2VDb3VudCB8fCBzLl9pTy5tdWx0aVNob3RFdmVudHMgfHwgKHMuaXNIVE1MNSAmJiBzLl9pTy5tdWx0aVNob3QgJiYgIXVzZUdsb2JhbEhUTUw1QXVkaW8pIHx8ICghcy5pc0hUTUw1ICYmIGZWID4gOCAmJiAhcy5nZXRBdXRvUGxheSgpKSkge1xyXG4gICAgICAgICAgcy5pbnN0YW5jZUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpZiBmaXJzdCBwbGF5IGFuZCBvbnBvc2l0aW9uIHBhcmFtZXRlcnMgZXhpc3QsIGFwcGx5IHRoZW0gbm93XHJcbiAgICAgICAgaWYgKHMuX2lPLm9ucG9zaXRpb24gJiYgcy5wbGF5U3RhdGUgPT09IDApIHtcclxuICAgICAgICAgIGF0dGFjaE9uUG9zaXRpb24ocyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzLnBsYXlTdGF0ZSA9IDE7XHJcbiAgICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcy5wb3NpdGlvbiA9IChzLl9pTy5wb3NpdGlvbiAhPT0gX3VuZGVmaW5lZCAmJiAhaXNOYU4ocy5faU8ucG9zaXRpb24pID8gcy5faU8ucG9zaXRpb24gOiAwKTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICAgIHMuX2lPID0gcG9saWN5Rml4KGxvb3BGaXgocy5faU8pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzLl9pTy5vbnBsYXkgJiYgX3VwZGF0ZVBsYXlTdGF0ZSkge1xyXG4gICAgICAgICAgcy5faU8ub25wbGF5LmFwcGx5KHMpO1xyXG4gICAgICAgICAgb25wbGF5X2NhbGxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzLnNldFZvbHVtZShzLl9pTy52b2x1bWUsIHRydWUpO1xyXG4gICAgICAgIHMuc2V0UGFuKHMuX2lPLnBhbiwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgICAgc3RhcnRPSyA9IGZsYXNoLl9zdGFydChzLmlkLCBzLl9pTy5sb29wcyB8fCAxLCAoZlYgPT09IDkgPyBzLnBvc2l0aW9uIDogcy5wb3NpdGlvbiAvIG1zZWNTY2FsZSksIHMuX2lPLm11bHRpU2hvdCB8fCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgaWYgKGZWID09PSA5ICYmICFzdGFydE9LKSB7XHJcbiAgICAgICAgICAgIC8vIGVkZ2UgY2FzZTogbm8gc291bmQgaGFyZHdhcmUsIG9yIDMyLWNoYW5uZWwgZmxhc2ggY2VpbGluZyBoaXQuXHJcbiAgICAgICAgICAgIC8vIGFwcGxpZXMgb25seSB0byBGbGFzaCA5LCBub24tTmV0U3RyZWFtL01vdmllU3RhciBzb3VuZHMuXHJcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9oZWxwLmFkb2JlLmNvbS9lbl9VUy9GbGFzaFBsYXRmb3JtL3JlZmVyZW5jZS9hY3Rpb25zY3JpcHQvMy9mbGFzaC9tZWRpYS9Tb3VuZC5odG1sI3BsYXklMjglMjlcclxuICAgICAgICAgICAgc20yLl93RChmTiArICdObyBzb3VuZCBoYXJkd2FyZSwgb3IgMzItc291bmQgY2VpbGluZyBoaXQnLCAyKTtcclxuICAgICAgICAgICAgaWYgKHMuX2lPLm9ucGxheWVycm9yKSB7XHJcbiAgICAgICAgICAgICAgcy5faU8ub25wbGF5ZXJyb3IuYXBwbHkocyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgaWYgKHMuaW5zdGFuY2VDb3VudCA8IDIpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEhUTUw1IHNpbmdsZS1pbnN0YW5jZSBjYXNlXHJcblxyXG4gICAgICAgICAgICBzdGFydF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICAgICAgYSA9IHMuX3NldHVwX2h0bWw1KCk7XHJcblxyXG4gICAgICAgICAgICBzLnNldFBvc2l0aW9uKHMuX2lPLnBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGEucGxheSgpO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBIVE1MNSBtdWx0aS1zaG90IGNhc2VcclxuXHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IENsb25pbmcgQXVkaW8oKSBmb3IgaW5zdGFuY2UgIycgKyBzLmluc3RhbmNlQ291bnQgKyAnLi4uJyk7XHJcblxyXG4gICAgICAgICAgICBhdWRpb0Nsb25lID0gbmV3IEF1ZGlvKHMuX2lPLnVybCk7XHJcblxyXG4gICAgICAgICAgICBvbmVuZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnQucmVtb3ZlKGF1ZGlvQ2xvbmUsICdlbmRlZCcsIG9uZW5kZWQpO1xyXG4gICAgICAgICAgICAgIHMuX29uZmluaXNoKHMpO1xyXG4gICAgICAgICAgICAgIC8vIGNsZWFudXBcclxuICAgICAgICAgICAgICBodG1sNVVubG9hZChhdWRpb0Nsb25lKTtcclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lID0gbnVsbDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIG9uY2FucGxheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGV2ZW50LnJlbW92ZShhdWRpb0Nsb25lLCAnY2FucGxheScsIG9uY2FucGxheSk7XHJcbiAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGF1ZGlvQ2xvbmUuY3VycmVudFRpbWUgPSBzLl9pTy5wb3NpdGlvbi9tc2VjU2NhbGU7XHJcbiAgICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsYWluKHMuaWQgKyAnOiBtdWx0aVNob3QgcGxheSgpIGZhaWxlZCB0byBhcHBseSBwb3NpdGlvbiBvZiAnICsgKHMuX2lPLnBvc2l0aW9uL21zZWNTY2FsZSkpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lLnBsYXkoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGV2ZW50LmFkZChhdWRpb0Nsb25lLCAnZW5kZWQnLCBvbmVuZGVkKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFwcGx5IHZvbHVtZSB0byBjbG9uZXMsIHRvb1xyXG4gICAgICAgICAgICBpZiAocy5faU8udm9sdW1lICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZS52b2x1bWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBzLl9pTy52b2x1bWUvMTAwKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHBsYXlpbmcgbXVsdGlwbGUgbXV0ZWQgc291bmRzPyBpZiB5b3UgZG8gdGhpcywgeW91J3JlIHdlaXJkIDspIC0gYnV0IGxldCdzIGNvdmVyIGl0LlxyXG4gICAgICAgICAgICBpZiAocy5tdXRlZCkge1xyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUubXV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocy5faU8ucG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAvLyBIVE1MNSBhdWRpbyBjYW4ndCBzZWVrIGJlZm9yZSBvbnBsYXkoKSBldmVudCBoYXMgZmlyZWQuXHJcbiAgICAgICAgICAgICAgLy8gd2FpdCBmb3IgY2FucGxheSwgdGhlbiBzZWVrIHRvIHBvc2l0aW9uIGFuZCBzdGFydCBwbGF5YmFjay5cclxuICAgICAgICAgICAgICBldmVudC5hZGQoYXVkaW9DbG9uZSwgJ2NhbnBsYXknLCBvbmNhbnBsYXkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIGJlZ2luIHBsYXliYWNrIGF0IGN1cnJlbnRUaW1lOiAwXHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZS5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8ganVzdCBmb3IgY29udmVuaWVuY2VcclxuICAgIHRoaXMuc3RhcnQgPSB0aGlzLnBsYXk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9wcyBwbGF5aW5nIGEgc291bmQgKGFuZCBvcHRpb25hbGx5LCBhbGwgc291bmRzKVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYkFsbCBPcHRpb25hbDogV2hldGhlciB0byBzdG9wIGFsbCBzb3VuZHNcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zdG9wID0gZnVuY3Rpb24oYkFsbCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPLFxyXG4gICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbjtcclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMSkge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBzdG9wKCknKTtcclxuXHJcbiAgICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcbiAgICAgICAgcy5fcmVzZXRPblBvc2l0aW9uKDApO1xyXG4gICAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZW1vdmUgb25Qb3NpdGlvbiBsaXN0ZW5lcnMsIGlmIGFueVxyXG4gICAgICAgIGRldGFjaE9uUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgLy8gYW5kIFwidG9cIiBwb3NpdGlvbiwgaWYgc2V0XHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy50bykge1xyXG4gICAgICAgICAgcy5jbGVhck9uUG9zaXRpb24oaW5zdGFuY2VPcHRpb25zLnRvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgICAgZmxhc2guX3N0b3Aocy5pZCwgYkFsbCk7XHJcblxyXG4gICAgICAgICAgLy8gaGFjayBmb3IgbmV0U3RyZWFtOiBqdXN0IHVubG9hZFxyXG4gICAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5zZXJ2ZXJVUkwpIHtcclxuICAgICAgICAgICAgcy51bmxvYWQoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBpZiAocy5fYSkge1xyXG5cclxuICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IHMucG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAvLyBhY3QgbGlrZSBGbGFzaCwgdGhvdWdoXHJcbiAgICAgICAgICAgIHMuc2V0UG9zaXRpb24oMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBoYWNrOiByZWZsZWN0IG9sZCBwb3NpdGlvbiBmb3Igb25zdG9wKCkgKGFsc28gbGlrZSBGbGFzaClcclxuICAgICAgICAgICAgcy5wb3NpdGlvbiA9IG9yaWdpbmFsUG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAvLyBodG1sNSBoYXMgbm8gc3RvcCgpXHJcbiAgICAgICAgICAgIC8vIE5PVEU6IHBhdXNpbmcgbWVhbnMgaU9TIHJlcXVpcmVzIGludGVyYWN0aW9uIHRvIHJlc3VtZS5cclxuICAgICAgICAgICAgcy5fYS5wYXVzZSgpO1xyXG5cclxuICAgICAgICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gYW5kIHVwZGF0ZSBVSVxyXG4gICAgICAgICAgICBzLl9vblRpbWVyKCk7XHJcblxyXG4gICAgICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHMuaW5zdGFuY2VDb3VudCA9IDA7XHJcbiAgICAgICAgcy5faU8gPSB7fTtcclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5vbnN0b3ApIHtcclxuICAgICAgICAgIGluc3RhbmNlT3B0aW9ucy5vbnN0b3AuYXBwbHkocyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuZG9jdW1lbnRlZC9pbnRlcm5hbDogU2V0cyBhdXRvUGxheSBmb3IgUlRNUC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGF1dG9QbGF5IHN0YXRlXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnNldEF1dG9QbGF5ID0gZnVuY3Rpb24oYXV0b1BsYXkpIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IEF1dG9wbGF5IHR1cm5lZCAnICsgKGF1dG9QbGF5ID8gJ29uJyA6ICdvZmYnKSk7XHJcbiAgICAgIHMuX2lPLmF1dG9QbGF5ID0gYXV0b1BsYXk7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGZsYXNoLl9zZXRBdXRvUGxheShzLmlkLCBhdXRvUGxheSk7XHJcbiAgICAgICAgaWYgKGF1dG9QbGF5KSB7XHJcbiAgICAgICAgICAvLyBvbmx5IGluY3JlbWVudCB0aGUgaW5zdGFuY2VDb3VudCBpZiB0aGUgc291bmQgaXNuJ3QgbG9hZGVkIChUT0RPOiB2ZXJpZnkgUlRNUClcclxuICAgICAgICAgIGlmICghcy5pbnN0YW5jZUNvdW50ICYmIHMucmVhZHlTdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICBzLmluc3RhbmNlQ291bnQrKztcclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogSW5jcmVtZW50ZWQgaW5zdGFuY2UgY291bnQgdG8gJytzLmluc3RhbmNlQ291bnQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmRvY3VtZW50ZWQvaW50ZXJuYWw6IFJldHVybnMgdGhlIGF1dG9QbGF5IGJvb2xlYW4uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIGN1cnJlbnQgYXV0b1BsYXkgdmFsdWVcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuZ2V0QXV0b1BsYXkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHJldHVybiBzLl9pTy5hdXRvUGxheTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgYSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbk1zZWNPZmZzZXQgUG9zaXRpb24gKG1pbGxpc2Vjb25kcylcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKG5Nc2VjT2Zmc2V0KSB7XHJcblxyXG4gICAgICBpZiAobk1zZWNPZmZzZXQgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBuTXNlY09mZnNldCA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBwb3NpdGlvbiwgcG9zaXRpb24xSyxcclxuICAgICAgICAgIC8vIFVzZSB0aGUgZHVyYXRpb24gZnJvbSB0aGUgaW5zdGFuY2Ugb3B0aW9ucywgaWYgd2UgZG9uJ3QgaGF2ZSBhIHRyYWNrIGR1cmF0aW9uIHlldC5cclxuICAgICAgICAgIC8vIHBvc2l0aW9uID49IDAgYW5kIDw9IGN1cnJlbnQgYXZhaWxhYmxlIChsb2FkZWQpIGR1cmF0aW9uXHJcbiAgICAgICAgICBvZmZzZXQgPSAocy5pc0hUTUw1ID8gTWF0aC5tYXgobk1zZWNPZmZzZXQsIDApIDogTWF0aC5taW4ocy5kdXJhdGlvbiB8fCBzLl9pTy5kdXJhdGlvbiwgTWF0aC5tYXgobk1zZWNPZmZzZXQsIDApKSk7XHJcblxyXG4gICAgICBzLnBvc2l0aW9uID0gb2Zmc2V0O1xyXG4gICAgICBwb3NpdGlvbjFLID0gcy5wb3NpdGlvbi9tc2VjU2NhbGU7XHJcbiAgICAgIHMuX3Jlc2V0T25Qb3NpdGlvbihzLnBvc2l0aW9uKTtcclxuICAgICAgcy5faU8ucG9zaXRpb24gPSBvZmZzZXQ7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICBwb3NpdGlvbiA9IChmViA9PT0gOSA/IHMucG9zaXRpb24gOiBwb3NpdGlvbjFLKTtcclxuXHJcbiAgICAgICAgaWYgKHMucmVhZHlTdGF0ZSAmJiBzLnJlYWR5U3RhdGUgIT09IDIpIHtcclxuICAgICAgICAgIC8vIGlmIHBhdXNlZCBvciBub3QgcGxheWluZywgd2lsbCBub3QgcmVzdW1lIChieSBwbGF5aW5nKVxyXG4gICAgICAgICAgZmxhc2guX3NldFBvc2l0aW9uKHMuaWQsIHBvc2l0aW9uLCAocy5wYXVzZWQgfHwgIXMucGxheVN0YXRlKSwgcy5faU8ubXVsdGlTaG90KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2UgaWYgKHMuX2EpIHtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSBwb3NpdGlvbiBpbiB0aGUgY2FucGxheSBoYW5kbGVyIGlmIHRoZSBzb3VuZCBpcyBub3QgcmVhZHkgeWV0XHJcbiAgICAgICAgaWYgKHMuX2h0bWw1X2NhbnBsYXkpIHtcclxuXHJcbiAgICAgICAgICBpZiAocy5fYS5jdXJyZW50VGltZSAhPT0gcG9zaXRpb24xSykge1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIERPTS9KUyBlcnJvcnMvZXhjZXB0aW9ucyB0byB3YXRjaCBvdXQgZm9yOlxyXG4gICAgICAgICAgICAgKiBpZiBzZWVrIGlzIGJleW9uZCAobG9hZGVkPykgcG9zaXRpb24sIFwiRE9NIGV4Y2VwdGlvbiAxMVwiXHJcbiAgICAgICAgICAgICAqIFwiSU5ERVhfU0laRV9FUlJcIjogRE9NIGV4Y2VwdGlvbiAxXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBzZXRQb3NpdGlvbignICsgcG9zaXRpb24xSyArICcpJyk7XHJcblxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIHMuX2EuY3VycmVudFRpbWUgPSBwb3NpdGlvbjFLO1xyXG4gICAgICAgICAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMCB8fCBzLnBhdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gYWxsb3cgc2VlayB3aXRob3V0IGF1dG8tcGxheS9yZXN1bWVcclxuICAgICAgICAgICAgICAgIHMuX2EucGF1c2UoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHNldFBvc2l0aW9uKCcgKyBwb3NpdGlvbjFLICsgJykgZmFpbGVkOiAnICsgZS5tZXNzYWdlLCAyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbjFLKSB7XHJcblxyXG4gICAgICAgICAgLy8gd2FybiBvbiBub24temVybyBzZWVrIGF0dGVtcHRzXHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBzZXRQb3NpdGlvbignICsgcG9zaXRpb24xSyArICcpOiBDYW5ub3Qgc2VlayB5ZXQsIHNvdW5kIG5vdCByZWFkeScsIDIpO1xyXG4gICAgICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHMucGF1c2VkKSB7XHJcblxyXG4gICAgICAgICAgLy8gaWYgcGF1c2VkLCByZWZyZXNoIFVJIHJpZ2h0IGF3YXkgYnkgZm9yY2luZyB1cGRhdGVcclxuICAgICAgICAgIHMuX29uVGltZXIodHJ1ZSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXVzZXMgc291bmQgcGxheWJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnBhdXNlID0gZnVuY3Rpb24oX2JDYWxsRmxhc2gpIHtcclxuXHJcbiAgICAgIGlmIChzLnBhdXNlZCB8fCAocy5wbGF5U3RhdGUgPT09IDAgJiYgcy5yZWFkeVN0YXRlICE9PSAxKSkge1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBwYXVzZSgpJyk7XHJcbiAgICAgIHMucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgaWYgKF9iQ2FsbEZsYXNoIHx8IF9iQ2FsbEZsYXNoID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICBmbGFzaC5fcGF1c2Uocy5pZCwgcy5faU8ubXVsdGlTaG90KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcy5fc2V0dXBfaHRtbDUoKS5wYXVzZSgpO1xyXG4gICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHMuX2lPLm9ucGF1c2UpIHtcclxuICAgICAgICBzLl9pTy5vbnBhdXNlLmFwcGx5KHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzdW1lcyBzb3VuZCBwbGF5YmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiBhdXRvLWxvYWRlZCBzdHJlYW1zIHBhdXNlIG9uIGJ1ZmZlciBmdWxsIHRoZXkgaGF2ZSBhIHBsYXlTdGF0ZSBvZiAwLlxyXG4gICAgICogV2UgbmVlZCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgcGxheVN0YXRlIGlzIHNldCB0byAxIHdoZW4gdGhlc2Ugc3RyZWFtcyBcInJlc3VtZVwiLlxyXG4gICAgICogV2hlbiBhIHBhdXNlZCBzdHJlYW0gaXMgcmVzdW1lZCwgd2UgbmVlZCB0byB0cmlnZ2VyIHRoZSBvbnBsYXkoKSBjYWxsYmFjayBpZiBpdFxyXG4gICAgICogaGFzbid0IGJlZW4gY2FsbGVkIGFscmVhZHkuIEluIHRoaXMgY2FzZSBzaW5jZSB0aGUgc291bmQgaXMgYmVpbmcgcGxheWVkIGZvciB0aGVcclxuICAgICAqIGZpcnN0IHRpbWUsIEkgdGhpbmsgaXQncyBtb3JlIGFwcHJvcHJpYXRlIHRvIGNhbGwgb25wbGF5KCkgcmF0aGVyIHRoYW4gb25yZXN1bWUoKS5cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMucmVzdW1lID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICBpZiAoIXMucGF1c2VkKSB7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IHJlc3VtZSgpJyk7XHJcbiAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgIHMucGxheVN0YXRlID0gMTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuaXNNb3ZpZVN0YXIgJiYgIWluc3RhbmNlT3B0aW9ucy5zZXJ2ZXJVUkwpIHtcclxuICAgICAgICAgIC8vIEJpemFycmUgV2Via2l0IGJ1ZyAoQ2hyb21lIHJlcG9ydGVkIHZpYSA4dHJhY2tzLmNvbSBkdWRlcyk6IEFBQyBjb250ZW50IHBhdXNlZCBmb3IgMzArIHNlY29uZHMoPykgd2lsbCBub3QgcmVzdW1lIHdpdGhvdXQgYSByZXBvc2l0aW9uLlxyXG4gICAgICAgICAgcy5zZXRQb3NpdGlvbihzLnBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGZsYXNoIG1ldGhvZCBpcyB0b2dnbGUtYmFzZWQgKHBhdXNlL3Jlc3VtZSlcclxuICAgICAgICBmbGFzaC5fcGF1c2Uocy5pZCwgaW5zdGFuY2VPcHRpb25zLm11bHRpU2hvdCk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBzLl9zZXR1cF9odG1sNSgpLnBsYXkoKTtcclxuICAgICAgICBzdGFydF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFvbnBsYXlfY2FsbGVkICYmIGluc3RhbmNlT3B0aW9ucy5vbnBsYXkpIHtcclxuXHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLm9ucGxheS5hcHBseShzKTtcclxuICAgICAgICBvbnBsYXlfY2FsbGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgIH0gZWxzZSBpZiAoaW5zdGFuY2VPcHRpb25zLm9ucmVzdW1lKSB7XHJcblxyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy5vbnJlc3VtZS5hcHBseShzKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHNvdW5kIHBsYXliYWNrLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogdG9nZ2xlUGF1c2UoKScpO1xyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAwKSB7XHJcbiAgICAgICAgcy5wbGF5KHtcclxuICAgICAgICAgIHBvc2l0aW9uOiAoZlYgPT09IDkgJiYgIXMuaXNIVE1MNSA/IHMucG9zaXRpb24gOiBzLnBvc2l0aW9uIC8gbXNlY1NjYWxlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocy5wYXVzZWQpIHtcclxuICAgICAgICBzLnJlc3VtZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMucGF1c2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHBhbm5pbmcgKEwtUikgZWZmZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuUGFuIFRoZSBwYW4gdmFsdWUgKC0xMDAgdG8gMTAwKVxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnNldFBhbiA9IGZ1bmN0aW9uKG5QYW4sIGJJbnN0YW5jZU9ubHkpIHtcclxuXHJcbiAgICAgIGlmIChuUGFuID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgblBhbiA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChiSW5zdGFuY2VPbmx5ID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgYkluc3RhbmNlT25seSA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGZsYXNoLl9zZXRQYW4ocy5pZCwgblBhbik7XHJcbiAgICAgIH0gLy8gZWxzZSB7IG5vIEhUTUw1IHBhbj8gfVxyXG5cclxuICAgICAgcy5faU8ucGFuID0gblBhbjtcclxuXHJcbiAgICAgIGlmICghYkluc3RhbmNlT25seSkge1xyXG4gICAgICAgIHMucGFuID0gblBhbjtcclxuICAgICAgICBzLm9wdGlvbnMucGFuID0gblBhbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHZvbHVtZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gblZvbCBUaGUgdm9sdW1lIHZhbHVlICgwIHRvIDEwMClcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zZXRWb2x1bWUgPSBmdW5jdGlvbihuVm9sLCBfYkluc3RhbmNlT25seSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE5vdGU6IFNldHRpbmcgdm9sdW1lIGhhcyBubyBlZmZlY3Qgb24gaU9TIFwic3BlY2lhbCBzbm93Zmxha2VcIiBkZXZpY2VzLlxyXG4gICAgICAgKiBIYXJkd2FyZSB2b2x1bWUgY29udHJvbCBvdmVycmlkZXMgc29mdHdhcmUsIGFuZCB2b2x1bWVcclxuICAgICAgICogd2lsbCBhbHdheXMgcmV0dXJuIDEgcGVyIEFwcGxlIGRvY3MuIChpT1MgNCArIDUuKVxyXG4gICAgICAgKiBodHRwOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L3NhZmFyaS9kb2N1bWVudGF0aW9uL0F1ZGlvVmlkZW8vQ29uY2VwdHVhbC9IVE1MLWNhbnZhcy1ndWlkZS9BZGRpbmdTb3VuZHRvQ2FudmFzQW5pbWF0aW9ucy9BZGRpbmdTb3VuZHRvQ2FudmFzQW5pbWF0aW9ucy5odG1sXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgaWYgKG5Wb2wgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBuVm9sID0gMTAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoX2JJbnN0YW5jZU9ubHkgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBfYkluc3RhbmNlT25seSA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICBmbGFzaC5fc2V0Vm9sdW1lKHMuaWQsIChzbTIubXV0ZWQgJiYgIXMubXV0ZWQpIHx8IHMubXV0ZWQgPyAwIDogblZvbCk7XHJcblxyXG4gICAgICB9IGVsc2UgaWYgKHMuX2EpIHtcclxuXHJcbiAgICAgICAgaWYgKHNtMi5tdXRlZCAmJiAhcy5tdXRlZCkge1xyXG4gICAgICAgICAgcy5tdXRlZCA9IHRydWU7XHJcbiAgICAgICAgICBzLl9hLm11dGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHZhbGlkIHJhbmdlIGZvciBuYXRpdmUgSFRNTDUgQXVkaW8oKTogMC0xXHJcbiAgICAgICAgcy5fYS52b2x1bWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBuVm9sLzEwMCkpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcy5faU8udm9sdW1lID0gblZvbDtcclxuXHJcbiAgICAgIGlmICghX2JJbnN0YW5jZU9ubHkpIHtcclxuICAgICAgICBzLnZvbHVtZSA9IG5Wb2w7XHJcbiAgICAgICAgcy5vcHRpb25zLnZvbHVtZSA9IG5Wb2w7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdXRlcyB0aGUgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLm11dGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHMubXV0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBmbGFzaC5fc2V0Vm9sdW1lKHMuaWQsIDApO1xyXG4gICAgICB9IGVsc2UgaWYgKHMuX2EpIHtcclxuICAgICAgICBzLl9hLm11dGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVubXV0ZXMgdGhlIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy51bm11dGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHMubXV0ZWQgPSBmYWxzZTtcclxuICAgICAgdmFyIGhhc0lPID0gKHMuX2lPLnZvbHVtZSAhPT0gX3VuZGVmaW5lZCk7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGZsYXNoLl9zZXRWb2x1bWUocy5pZCwgaGFzSU8gPyBzLl9pTy52b2x1bWUgOiBzLm9wdGlvbnMudm9sdW1lKTtcclxuICAgICAgfSBlbHNlIGlmIChzLl9hKSB7XHJcbiAgICAgICAgcy5fYS5tdXRlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVG9nZ2xlcyB0aGUgbXV0ZWQgc3RhdGUgb2YgYSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMudG9nZ2xlTXV0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcmV0dXJuIChzLm11dGVkID8gcy51bm11dGUoKSA6IHMubXV0ZSgpKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgZmlyZWQgd2hlbiBhIHNvdW5kIHJlYWNoZXMgYSBnaXZlbiBwb3NpdGlvbiBkdXJpbmcgcGxheWJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5Qb3NpdGlvbiBUaGUgcG9zaXRpb24gdG8gd2F0Y2ggZm9yXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIFRoZSByZWxldmFudCBjYWxsYmFjayB0byBmaXJlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb1Njb3BlIE9wdGlvbmFsOiBUaGUgc2NvcGUgdG8gYXBwbHkgdGhlIGNhbGxiYWNrIHRvXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMub25Qb3NpdGlvbiA9IGZ1bmN0aW9uKG5Qb3NpdGlvbiwgb01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgICAvLyBUT0RPOiBiYXNpYyBkdXBlIGNoZWNraW5nP1xyXG5cclxuICAgICAgb25Qb3NpdGlvbkl0ZW1zLnB1c2goe1xyXG4gICAgICAgIHBvc2l0aW9uOiBwYXJzZUludChuUG9zaXRpb24sIDEwKSxcclxuICAgICAgICBtZXRob2Q6IG9NZXRob2QsXHJcbiAgICAgICAgc2NvcGU6IChvU2NvcGUgIT09IF91bmRlZmluZWQgPyBvU2NvcGUgOiBzKSxcclxuICAgICAgICBmaXJlZDogZmFsc2VcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGxlZ2FjeS9iYWNrd2FyZHMtY29tcGFiaWxpdHk6IGxvd2VyLWNhc2UgbWV0aG9kIG5hbWVcclxuICAgIHRoaXMub25wb3NpdGlvbiA9IHRoaXMub25Qb3NpdGlvbjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgcmVnaXN0ZXJlZCBjYWxsYmFjayhzKSBmcm9tIGEgc291bmQsIGJ5IHBvc2l0aW9uIGFuZC9vciBjYWxsYmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gblBvc2l0aW9uIFRoZSBwb3NpdGlvbiB0byBjbGVhciBjYWxsYmFjayhzKSBmb3JcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgT3B0aW9uYWw6IElkZW50aWZ5IG9uZSBjYWxsYmFjayB0byBiZSByZW1vdmVkIHdoZW4gbXVsdGlwbGUgbGlzdGVuZXJzIGV4aXN0IGZvciBvbmUgcG9zaXRpb25cclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5jbGVhck9uUG9zaXRpb24gPSBmdW5jdGlvbihuUG9zaXRpb24sIG9NZXRob2QpIHtcclxuXHJcbiAgICAgIHZhciBpO1xyXG5cclxuICAgICAgblBvc2l0aW9uID0gcGFyc2VJbnQoblBvc2l0aW9uLCAxMCk7XHJcblxyXG4gICAgICBpZiAoaXNOYU4oblBvc2l0aW9uKSkge1xyXG4gICAgICAgIC8vIHNhZmV0eSBjaGVja1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChpPTA7IGkgPCBvblBvc2l0aW9uSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgaWYgKG5Qb3NpdGlvbiA9PT0gb25Qb3NpdGlvbkl0ZW1zW2ldLnBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAvLyByZW1vdmUgdGhpcyBpdGVtIGlmIG5vIG1ldGhvZCB3YXMgc3BlY2lmaWVkLCBvciwgaWYgdGhlIG1ldGhvZCBtYXRjaGVzXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmICghb01ldGhvZCB8fCAob01ldGhvZCA9PT0gb25Qb3NpdGlvbkl0ZW1zW2ldLm1ldGhvZCkpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChvblBvc2l0aW9uSXRlbXNbaV0uZmlyZWQpIHtcclxuICAgICAgICAgICAgICAvLyBkZWNyZW1lbnQgXCJmaXJlZFwiIGNvdW50ZXIsIHRvb1xyXG4gICAgICAgICAgICAgIG9uUG9zaXRpb25GaXJlZC0tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBvblBvc2l0aW9uSXRlbXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fcHJvY2Vzc09uUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpLCBpdGVtLCBqID0gb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aDtcclxuXHJcbiAgICAgIGlmICghaiB8fCAhcy5wbGF5U3RhdGUgfHwgb25Qb3NpdGlvbkZpcmVkID49IGopIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaSA9IGogLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGl0ZW0gPSBvblBvc2l0aW9uSXRlbXNbaV07XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCFpdGVtLmZpcmVkICYmIHMucG9zaXRpb24gPj0gaXRlbS5wb3NpdGlvbikge1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgaXRlbS5maXJlZCA9IHRydWU7XHJcbiAgICAgICAgICBvblBvc2l0aW9uRmlyZWQrKztcclxuICAgICAgICAgIGl0ZW0ubWV0aG9kLmFwcGx5KGl0ZW0uc2NvcGUsIFtpdGVtLnBvc2l0aW9uXSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAvLyAgcmVzZXQgaiAtLSBvblBvc2l0aW9uSXRlbXMubGVuZ3RoIGNhbiBiZSBjaGFuZ2VkIGluIHRoZSBpdGVtIGNhbGxiYWNrIGFib3ZlLi4uIG9jY2FzaW9uYWxseSBicmVha2luZyB0aGUgbG9vcC5cclxuXHRcdCAgICAgIGogPSBvblBvc2l0aW9uSXRlbXMubGVuZ3RoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fcmVzZXRPblBvc2l0aW9uID0gZnVuY3Rpb24oblBvc2l0aW9uKSB7XHJcblxyXG4gICAgICAvLyByZXNldCBcImZpcmVkXCIgZm9yIGl0ZW1zIGludGVyZXN0ZWQgaW4gdGhpcyBwb3NpdGlvblxyXG4gICAgICB2YXIgaSwgaXRlbSwgaiA9IG9uUG9zaXRpb25JdGVtcy5sZW5ndGg7XHJcblxyXG4gICAgICBpZiAoIWopIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaSA9IGogLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGl0ZW0gPSBvblBvc2l0aW9uSXRlbXNbaV07XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGl0ZW0uZmlyZWQgJiYgblBvc2l0aW9uIDw9IGl0ZW0ucG9zaXRpb24pIHtcclxuICAgICAgICAgIGl0ZW0uZmlyZWQgPSBmYWxzZTtcclxuICAgICAgICAgIG9uUG9zaXRpb25GaXJlZC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTTVNvdW5kKCkgcHJpdmF0ZSBpbnRlcm5hbHNcclxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgKi9cclxuXHJcbiAgICBhcHBseUZyb21UbyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPLFxyXG4gICAgICAgICAgZiA9IGluc3RhbmNlT3B0aW9ucy5mcm9tLFxyXG4gICAgICAgICAgdCA9IGluc3RhbmNlT3B0aW9ucy50byxcclxuICAgICAgICAgIHN0YXJ0LCBlbmQ7XHJcblxyXG4gICAgICBlbmQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgLy8gZW5kIGhhcyBiZWVuIHJlYWNoZWQuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogXCJUb1wiIHRpbWUgb2YgJyArIHQgKyAnIHJlYWNoZWQuJyk7XHJcblxyXG4gICAgICAgIC8vIGRldGFjaCBsaXN0ZW5lclxyXG4gICAgICAgIHMuY2xlYXJPblBvc2l0aW9uKHQsIGVuZCk7XHJcblxyXG4gICAgICAgIC8vIHN0b3Agc2hvdWxkIGNsZWFyIHRoaXMsIHRvb1xyXG4gICAgICAgIHMuc3RvcCgpO1xyXG5cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IFBsYXlpbmcgXCJmcm9tXCIgJyArIGYpO1xyXG5cclxuICAgICAgICAvLyBhZGQgbGlzdGVuZXIgZm9yIGVuZFxyXG4gICAgICAgIGlmICh0ICE9PSBudWxsICYmICFpc05hTih0KSkge1xyXG4gICAgICAgICAgcy5vblBvc2l0aW9uKHQsIGVuZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmIChmICE9PSBudWxsICYmICFpc05hTihmKSkge1xyXG5cclxuICAgICAgICAvLyBhcHBseSB0byBpbnN0YW5jZSBvcHRpb25zLCBndWFyYW50ZWVpbmcgY29ycmVjdCBzdGFydCBwb3NpdGlvbi5cclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMucG9zaXRpb24gPSBmO1xyXG5cclxuICAgICAgICAvLyBtdWx0aVNob3QgdGltaW5nIGNhbid0IGJlIHRyYWNrZWQsIHNvIHByZXZlbnQgdGhhdC5cclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMubXVsdGlTaG90ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHN0YXJ0KCk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXR1cm4gdXBkYXRlZCBpbnN0YW5jZU9wdGlvbnMgaW5jbHVkaW5nIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbiAgICAgIHJldHVybiBpbnN0YW5jZU9wdGlvbnM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBhdHRhY2hPblBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaXRlbSxcclxuICAgICAgICAgIG9wID0gcy5faU8ub25wb3NpdGlvbjtcclxuXHJcbiAgICAgIC8vIGF0dGFjaCBvbnBvc2l0aW9uIHRoaW5ncywgaWYgYW55LCBub3cuXHJcblxyXG4gICAgICBpZiAob3ApIHtcclxuXHJcbiAgICAgICAgZm9yIChpdGVtIGluIG9wKSB7XHJcbiAgICAgICAgICBpZiAob3AuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICAgICAgcy5vblBvc2l0aW9uKHBhcnNlSW50KGl0ZW0sIDEwKSwgb3BbaXRlbV0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGRldGFjaE9uUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpdGVtLFxyXG4gICAgICAgICAgb3AgPSBzLl9pTy5vbnBvc2l0aW9uO1xyXG5cclxuICAgICAgLy8gZGV0YWNoIGFueSBvbnBvc2l0aW9uKCktc3R5bGUgbGlzdGVuZXJzLlxyXG5cclxuICAgICAgaWYgKG9wKSB7XHJcblxyXG4gICAgICAgIGZvciAoaXRlbSBpbiBvcCkge1xyXG4gICAgICAgICAgaWYgKG9wLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgICAgIHMuY2xlYXJPblBvc2l0aW9uKHBhcnNlSW50KGl0ZW0sIDEwKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgc3RhcnRfaHRtbDVfdGltZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzLmlzSFRNTDUpIHtcclxuICAgICAgICBzdGFydFRpbWVyKHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBzdG9wX2h0bWw1X3RpbWVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAocy5pc0hUTUw1KSB7XHJcbiAgICAgICAgc3RvcFRpbWVyKHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICByZXNldFByb3BlcnRpZXMgPSBmdW5jdGlvbihyZXRhaW5Qb3NpdGlvbikge1xyXG5cclxuICAgICAgaWYgKCFyZXRhaW5Qb3NpdGlvbikge1xyXG4gICAgICAgIG9uUG9zaXRpb25JdGVtcyA9IFtdO1xyXG4gICAgICAgIG9uUG9zaXRpb25GaXJlZCA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9ucGxheV9jYWxsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIHMuX2hhc1RpbWVyID0gbnVsbDtcclxuICAgICAgcy5fYSA9IG51bGw7XHJcbiAgICAgIHMuX2h0bWw1X2NhbnBsYXkgPSBmYWxzZTtcclxuICAgICAgcy5ieXRlc0xvYWRlZCA9IG51bGw7XHJcbiAgICAgIHMuYnl0ZXNUb3RhbCA9IG51bGw7XHJcbiAgICAgIHMuZHVyYXRpb24gPSAocy5faU8gJiYgcy5faU8uZHVyYXRpb24gPyBzLl9pTy5kdXJhdGlvbiA6IG51bGwpO1xyXG4gICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBudWxsO1xyXG4gICAgICBzLmJ1ZmZlcmVkID0gW107XHJcblxyXG4gICAgICAvLyBsZWdhY3k6IDFEIGFycmF5XHJcbiAgICAgIHMuZXFEYXRhID0gW107XHJcblxyXG4gICAgICBzLmVxRGF0YS5sZWZ0ID0gW107XHJcbiAgICAgIHMuZXFEYXRhLnJpZ2h0ID0gW107XHJcblxyXG4gICAgICBzLmZhaWx1cmVzID0gMDtcclxuICAgICAgcy5pc0J1ZmZlcmluZyA9IGZhbHNlO1xyXG4gICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHt9O1xyXG4gICAgICBzLmluc3RhbmNlQ291bnQgPSAwO1xyXG4gICAgICBzLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICBzLm1ldGFkYXRhID0ge307XHJcblxyXG4gICAgICAvLyAwID0gdW5pbml0aWFsaXNlZCwgMSA9IGxvYWRpbmcsIDIgPSBmYWlsZWQvZXJyb3IsIDMgPSBsb2FkZWQvc3VjY2Vzc1xyXG4gICAgICBzLnJlYWR5U3RhdGUgPSAwO1xyXG5cclxuICAgICAgcy5tdXRlZCA9IGZhbHNlO1xyXG4gICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgcy5wZWFrRGF0YSA9IHtcclxuICAgICAgICBsZWZ0OiAwLFxyXG4gICAgICAgIHJpZ2h0OiAwXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzLndhdmVmb3JtRGF0YSA9IHtcclxuICAgICAgICBsZWZ0OiBbXSxcclxuICAgICAgICByaWdodDogW11cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHMucGxheVN0YXRlID0gMDtcclxuICAgICAgcy5wb3NpdGlvbiA9IG51bGw7XHJcblxyXG4gICAgICBzLmlkMyA9IHt9O1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgcmVzZXRQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQc2V1ZG8tcHJpdmF0ZSBTTVNvdW5kIGludGVybmFsc1xyXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29uVGltZXIgPSBmdW5jdGlvbihiRm9yY2UpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIVE1MNS1vbmx5IF93aGlsZXBsYXlpbmcoKSBldGMuXHJcbiAgICAgICAqIGNhbGxlZCBmcm9tIGJvdGggSFRNTDUgbmF0aXZlIGV2ZW50cywgYW5kIHBvbGxpbmcvaW50ZXJ2YWwtYmFzZWQgdGltZXJzXHJcbiAgICAgICAqIG1pbWljcyBmbGFzaCBhbmQgZmlyZXMgb25seSB3aGVuIHRpbWUvZHVyYXRpb24gY2hhbmdlLCBzbyBhcyB0byBiZSBwb2xsaW5nLWZyaWVuZGx5XHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgdmFyIGR1cmF0aW9uLCBpc05ldyA9IGZhbHNlLCB0aW1lLCB4ID0ge307XHJcblxyXG4gICAgICBpZiAocy5faGFzVGltZXIgfHwgYkZvcmNlKSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IE1heSBub3QgbmVlZCB0byB0cmFjayByZWFkeVN0YXRlICgxID0gbG9hZGluZylcclxuXHJcbiAgICAgICAgaWYgKHMuX2EgJiYgKGJGb3JjZSB8fCAoKHMucGxheVN0YXRlID4gMCB8fCBzLnJlYWR5U3RhdGUgPT09IDEpICYmICFzLnBhdXNlZCkpKSB7XHJcblxyXG4gICAgICAgICAgZHVyYXRpb24gPSBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKTtcclxuXHJcbiAgICAgICAgICBpZiAoZHVyYXRpb24gIT09IGxhc3RIVE1MNVN0YXRlLmR1cmF0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICBsYXN0SFRNTDVTdGF0ZS5kdXJhdGlvbiA9IGR1cmF0aW9uO1xyXG4gICAgICAgICAgICBzLmR1cmF0aW9uID0gZHVyYXRpb247XHJcbiAgICAgICAgICAgIGlzTmV3ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gVE9ETzogaW52ZXN0aWdhdGUgd2h5IHRoaXMgZ29lcyB3YWNrIGlmIG5vdCBzZXQvcmUtc2V0IGVhY2ggdGltZS5cclxuICAgICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IHMuZHVyYXRpb247XHJcblxyXG4gICAgICAgICAgdGltZSA9IChzLl9hLmN1cnJlbnRUaW1lICogbXNlY1NjYWxlIHx8IDApO1xyXG5cclxuICAgICAgICAgIGlmICh0aW1lICE9PSBsYXN0SFRNTDVTdGF0ZS50aW1lKSB7XHJcblxyXG4gICAgICAgICAgICBsYXN0SFRNTDVTdGF0ZS50aW1lID0gdGltZTtcclxuICAgICAgICAgICAgaXNOZXcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoaXNOZXcgfHwgYkZvcmNlKSB7XHJcblxyXG4gICAgICAgICAgICBzLl93aGlsZXBsYXlpbmcodGltZSwgeCwgeCwgeCwgeCk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9LyogZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gc20yLl93RCgnX29uVGltZXI6IFdhcm4gZm9yIFwiJytzLmlkKydcIjogJysoIXMuX2E/J0NvdWxkIG5vdCBmaW5kIGVsZW1lbnQuICc6JycpKyhzLnBsYXlTdGF0ZSA9PT0gMD8ncGxheVN0YXRlIGJhZCwgMD8nOidwbGF5U3RhdGUgPSAnK3MucGxheVN0YXRlKycsIE9LJykpO1xyXG5cclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIHJldHVybiBpc05ldztcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2dldF9odG1sNV9kdXJhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPLFxyXG4gICAgICAgICAgLy8gaWYgYXVkaW8gb2JqZWN0IGV4aXN0cywgdXNlIGl0cyBkdXJhdGlvbiAtIGVsc2UsIGluc3RhbmNlIG9wdGlvbiBkdXJhdGlvbiAoaWYgcHJvdmlkZWQgLSBpdCdzIGEgaGFjaywgcmVhbGx5LCBhbmQgc2hvdWxkIGJlIHJldGlyZWQpIE9SIG51bGxcclxuICAgICAgICAgIGQgPSAocy5fYSAmJiBzLl9hLmR1cmF0aW9uID8gcy5fYS5kdXJhdGlvbiAqIG1zZWNTY2FsZSA6IChpbnN0YW5jZU9wdGlvbnMgJiYgaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uID8gaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uIDogbnVsbCkpLFxyXG4gICAgICAgICAgcmVzdWx0ID0gKGQgJiYgIWlzTmFOKGQpICYmIGQgIT09IEluZmluaXR5ID8gZCA6IG51bGwpO1xyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2FwcGx5X2xvb3AgPSBmdW5jdGlvbihhLCBuTG9vcHMpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBib29sZWFuIGluc3RlYWQgb2YgXCJsb29wXCIsIGZvciB3ZWJraXQ/IC0gc3BlYyBzYXlzIHN0cmluZy4gaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbC1tYXJrdXAvYXVkaW8uaHRtbCNhdWRpby5hdHRycy5sb29wXHJcbiAgICAgICAqIG5vdGUgdGhhdCBsb29wIGlzIGVpdGhlciBvZmYgb3IgaW5maW5pdGUgdW5kZXIgSFRNTDUsIHVubGlrZSBGbGFzaCB3aGljaCBhbGxvd3MgYXJiaXRyYXJ5IGxvb3AgY291bnRzIHRvIGJlIHNwZWNpZmllZC5cclxuICAgICAgICovXHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKCFhLmxvb3AgJiYgbkxvb3BzID4gMSkge1xyXG4gICAgICAgIHNtMi5fd0QoJ05vdGU6IE5hdGl2ZSBIVE1MNSBsb29waW5nIGlzIGluZmluaXRlLicsIDEpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGEubG9vcCA9IChuTG9vcHMgPiAxID8gJ2xvb3AnIDogJycpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fc2V0dXBfaHRtbDUgPSBmdW5jdGlvbihvT3B0aW9ucykge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IG1peGluKHMuX2lPLCBvT3B0aW9ucyksXHJcbiAgICAgICAgICBhID0gdXNlR2xvYmFsSFRNTDVBdWRpbyA/IGdsb2JhbEhUTUw1QXVkaW8gOiBzLl9hLFxyXG4gICAgICAgICAgZFVSTCA9IGRlY29kZVVSSShpbnN0YW5jZU9wdGlvbnMudXJsKSxcclxuICAgICAgICAgIHNhbWVVUkw7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogXCJGaXJzdCB0aGluZ3MgZmlyc3QsIEksIFBvcHBhLi4uXCIgKHJlc2V0IHRoZSBwcmV2aW91cyBzdGF0ZSBvZiB0aGUgb2xkIHNvdW5kLCBpZiBwbGF5aW5nKVxyXG4gICAgICAgKiBGaXhlcyBjYXNlIHdpdGggZGV2aWNlcyB0aGF0IGNhbiBvbmx5IHBsYXkgb25lIHNvdW5kIGF0IGEgdGltZVxyXG4gICAgICAgKiBPdGhlcndpc2UsIG90aGVyIHNvdW5kcyBpbiBtaWQtcGxheSB3aWxsIGJlIHRlcm1pbmF0ZWQgd2l0aG91dCB3YXJuaW5nIGFuZCBpbiBhIHN0dWNrIHN0YXRlXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgaWYgKHVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgICAgaWYgKGRVUkwgPT09IGRlY29kZVVSSShsYXN0R2xvYmFsSFRNTDVVUkwpKSB7XHJcbiAgICAgICAgICAvLyBnbG9iYWwgSFRNTDUgYXVkaW86IHJlLXVzZSBvZiBVUkxcclxuICAgICAgICAgIHNhbWVVUkwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSBpZiAoZFVSTCA9PT0gZGVjb2RlVVJJKGxhc3RVUkwpKSB7XHJcblxyXG4gICAgICAgIC8vIG9wdGlvbnMgVVJMIGlzIHRoZSBzYW1lIGFzIHRoZSBcImxhc3RcIiBVUkwsIGFuZCB3ZSB1c2VkIChsb2FkZWQpIGl0XHJcbiAgICAgICAgc2FtZVVSTCA9IHRydWU7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYSkge1xyXG5cclxuICAgICAgICBpZiAoYS5fcykge1xyXG5cclxuICAgICAgICAgIGlmICh1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYS5fcyAmJiBhLl9zLnBsYXlTdGF0ZSAmJiAhc2FtZVVSTCkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBnbG9iYWwgSFRNTDUgYXVkaW8gY2FzZSwgYW5kIGxvYWRpbmcgYSBuZXcgVVJMLiBzdG9wIHRoZSBjdXJyZW50bHktcGxheWluZyBvbmUuXHJcbiAgICAgICAgICAgICAgYS5fcy5zdG9wKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmICghdXNlR2xvYmFsSFRNTDVBdWRpbyAmJiBkVVJMID09PSBkZWNvZGVVUkkobGFzdFVSTCkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG5vbi1nbG9iYWwgSFRNTDUgcmV1c2UgY2FzZTogc2FtZSB1cmwsIGlnbm9yZSByZXF1ZXN0XHJcbiAgICAgICAgICAgIHMuX2FwcGx5X2xvb3AoYSwgaW5zdGFuY2VPcHRpb25zLmxvb3BzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBhO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXNhbWVVUkwpIHtcclxuXHJcbiAgICAgICAgICAvLyBkb24ndCByZXRhaW4gb25Qb3NpdGlvbigpIHN0dWZmIHdpdGggbmV3IFVSTHMuXHJcblxyXG4gICAgICAgICAgaWYgKGxhc3RVUkwpIHtcclxuICAgICAgICAgICAgcmVzZXRQcm9wZXJ0aWVzKGZhbHNlKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBhc3NpZ24gbmV3IEhUTUw1IFVSTFxyXG5cclxuICAgICAgICAgIGEuc3JjID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICBzLnVybCA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgbGFzdFVSTCA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgbGFzdEdsb2JhbEhUTUw1VVJMID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICBhLl9jYWxsZWRfbG9hZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLmF1dG9Mb2FkIHx8IGluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSkge1xyXG5cclxuICAgICAgICAgIHMuX2EgPSBuZXcgQXVkaW8oaW5zdGFuY2VPcHRpb25zLnVybCk7XHJcbiAgICAgICAgICBzLl9hLmxvYWQoKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBudWxsIGZvciBzdHVwaWQgT3BlcmEgOS42NCBjYXNlXHJcbiAgICAgICAgICBzLl9hID0gKGlzT3BlcmEgJiYgb3BlcmEudmVyc2lvbigpIDwgMTAgPyBuZXcgQXVkaW8obnVsbCkgOiBuZXcgQXVkaW8oKSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGxvY2FsIHJlZmVyZW5jZVxyXG4gICAgICAgIGEgPSBzLl9hO1xyXG5cclxuICAgICAgICBhLl9jYWxsZWRfbG9hZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAodXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgICAgIGdsb2JhbEhUTUw1QXVkaW8gPSBhO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBzLmlzSFRNTDUgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gc3RvcmUgYSByZWYgb24gdGhlIHRyYWNrXHJcbiAgICAgIHMuX2EgPSBhO1xyXG5cclxuICAgICAgLy8gc3RvcmUgYSByZWYgb24gdGhlIGF1ZGlvXHJcbiAgICAgIGEuX3MgPSBzO1xyXG5cclxuICAgICAgYWRkX2h0bWw1X2V2ZW50cygpO1xyXG5cclxuICAgICAgcy5fYXBwbHlfbG9vcChhLCBpbnN0YW5jZU9wdGlvbnMubG9vcHMpO1xyXG5cclxuICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5hdXRvTG9hZCB8fCBpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXkpIHtcclxuXHJcbiAgICAgICAgcy5sb2FkKCk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBlYXJseSBIVE1MNSBpbXBsZW1lbnRhdGlvbiAobm9uLXN0YW5kYXJkKVxyXG4gICAgICAgIGEuYXV0b2J1ZmZlciA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBzdGFuZGFyZCAoJ25vbmUnIGlzIGFsc28gYW4gb3B0aW9uLilcclxuICAgICAgICBhLnByZWxvYWQgPSAnYXV0byc7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gYTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGFkZF9odG1sNV9ldmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzLl9hLl9hZGRlZF9ldmVudHMpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBmO1xyXG5cclxuICAgICAgZnVuY3Rpb24gYWRkKG9FdnQsIG9GbiwgYkNhcHR1cmUpIHtcclxuICAgICAgICByZXR1cm4gcy5fYSA/IHMuX2EuYWRkRXZlbnRMaXN0ZW5lcihvRXZ0LCBvRm4sIGJDYXB0dXJlIHx8IGZhbHNlKSA6IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuX2EuX2FkZGVkX2V2ZW50cyA9IHRydWU7XHJcblxyXG4gICAgICBmb3IgKGYgaW4gaHRtbDVfZXZlbnRzKSB7XHJcbiAgICAgICAgaWYgKGh0bWw1X2V2ZW50cy5oYXNPd25Qcm9wZXJ0eShmKSkge1xyXG4gICAgICAgICAgYWRkKGYsIGh0bWw1X2V2ZW50c1tmXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHJlbW92ZV9odG1sNV9ldmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lcnNcclxuXHJcbiAgICAgIHZhciBmO1xyXG5cclxuICAgICAgZnVuY3Rpb24gcmVtb3ZlKG9FdnQsIG9GbiwgYkNhcHR1cmUpIHtcclxuICAgICAgICByZXR1cm4gKHMuX2EgPyBzLl9hLnJlbW92ZUV2ZW50TGlzdGVuZXIob0V2dCwgb0ZuLCBiQ2FwdHVyZSB8fCBmYWxzZSkgOiBudWxsKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogUmVtb3ZpbmcgZXZlbnQgbGlzdGVuZXJzJyk7XHJcbiAgICAgIHMuX2EuX2FkZGVkX2V2ZW50cyA9IGZhbHNlO1xyXG5cclxuICAgICAgZm9yIChmIGluIGh0bWw1X2V2ZW50cykge1xyXG4gICAgICAgIGlmIChodG1sNV9ldmVudHMuaGFzT3duUHJvcGVydHkoZikpIHtcclxuICAgICAgICAgIHJlbW92ZShmLCBodG1sNV9ldmVudHNbZl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQc2V1ZG8tcHJpdmF0ZSBldmVudCBpbnRlcm5hbHNcclxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb25sb2FkID0gZnVuY3Rpb24oblN1Y2Nlc3MpIHtcclxuXHJcbiAgICAgIHZhciBmTixcclxuICAgICAgICAgIC8vIGNoZWNrIGZvciBkdXJhdGlvbiB0byBwcmV2ZW50IGZhbHNlIHBvc2l0aXZlcyBmcm9tIGZsYXNoIDggd2hlbiBsb2FkaW5nIGZyb20gY2FjaGUuXHJcbiAgICAgICAgICBsb2FkT0sgPSAhIW5TdWNjZXNzIHx8ICghcy5pc0hUTUw1ICYmIGZWID09PSA4ICYmIHMuZHVyYXRpb24pO1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGZOID0gcy5pZCArICc6ICc7XHJcbiAgICAgIHNtMi5fd0QoZk4gKyAobG9hZE9LID8gJ29ubG9hZCgpJyA6ICdGYWlsZWQgdG8gbG9hZCAvIGludmFsaWQgc291bmQ/JyArICghcy5kdXJhdGlvbiA/ICcgWmVyby1sZW5ndGggZHVyYXRpb24gcmVwb3J0ZWQuJyA6ICcgLScpICsgJyAoJyArIHMudXJsICsgJyknKSwgKGxvYWRPSyA/IDEgOiAyKSk7XHJcblxyXG4gICAgICBpZiAoIWxvYWRPSyAmJiAhcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgaWYgKHNtMi5zYW5kYm94Lm5vUmVtb3RlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgc3RyKCdub05ldCcpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNtMi5zYW5kYm94Lm5vTG9jYWwgPT09IHRydWUpIHtcclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyBzdHIoJ25vTG9jYWwnKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIHMubG9hZGVkID0gbG9hZE9LO1xyXG4gICAgICBzLnJlYWR5U3RhdGUgPSAobG9hZE9LID8gMyA6IDIpO1xyXG4gICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbmxvYWQpIHtcclxuICAgICAgICB3cmFwQ2FsbGJhY2socywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzLl9pTy5vbmxvYWQuYXBwbHkocywgW2xvYWRPS10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uYnVmZmVyY2hhbmdlID0gZnVuY3Rpb24obklzQnVmZmVyaW5nKSB7XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDApIHtcclxuICAgICAgICAvLyBpZ25vcmUgaWYgbm90IHBsYXlpbmdcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICgobklzQnVmZmVyaW5nICYmIHMuaXNCdWZmZXJpbmcpIHx8ICghbklzQnVmZmVyaW5nICYmICFzLmlzQnVmZmVyaW5nKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5pc0J1ZmZlcmluZyA9IChuSXNCdWZmZXJpbmcgPT09IDEpO1xyXG4gICAgICBcclxuICAgICAgaWYgKHMuX2lPLm9uYnVmZmVyY2hhbmdlKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogQnVmZmVyIHN0YXRlIGNoYW5nZTogJyArIG5Jc0J1ZmZlcmluZyk7XHJcbiAgICAgICAgcy5faU8ub25idWZmZXJjaGFuZ2UuYXBwbHkocywgW25Jc0J1ZmZlcmluZ10pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGxheWJhY2sgbWF5IGhhdmUgc3RvcHBlZCBkdWUgdG8gYnVmZmVyaW5nLCBvciByZWxhdGVkIHJlYXNvbi5cclxuICAgICAqIFRoaXMgc3RhdGUgY2FuIGJlIGVuY291bnRlcmVkIG9uIGlPUyA8IDYgd2hlbiBhdXRvLXBsYXkgaXMgYmxvY2tlZC5cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29uc3VzcGVuZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9uc3VzcGVuZCkge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IFBsYXliYWNrIHN1c3BlbmRlZCcpO1xyXG4gICAgICAgIHMuX2lPLm9uc3VzcGVuZC5hcHBseShzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGZsYXNoIDkvbW92aWVTdGFyICsgUlRNUC1vbmx5IG1ldGhvZCwgc2hvdWxkIGZpcmUgb25seSBvbmNlIGF0IG1vc3RcclxuICAgICAqIGF0IHRoaXMgcG9pbnQgd2UganVzdCByZWNyZWF0ZSBmYWlsZWQgc291bmRzIHJhdGhlciB0aGFuIHRyeWluZyB0byByZWNvbm5lY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29uZmFpbHVyZSA9IGZ1bmN0aW9uKG1zZywgbGV2ZWwsIGNvZGUpIHtcclxuXHJcbiAgICAgIHMuZmFpbHVyZXMrKztcclxuICAgICAgc20yLl93RChzLmlkICsgJzogRmFpbHVyZSAoJyArIHMuZmFpbHVyZXMgKyAnKTogJyArIG1zZyk7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25mYWlsdXJlICYmIHMuZmFpbHVyZXMgPT09IDEpIHtcclxuICAgICAgICBzLl9pTy5vbmZhaWx1cmUobXNnLCBsZXZlbCwgY29kZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogSWdub3JpbmcgZmFpbHVyZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGZsYXNoIDkvbW92aWVTdGFyICsgUlRNUC1vbmx5IG1ldGhvZCBmb3IgdW5oYW5kbGVkIHdhcm5pbmdzL2V4Y2VwdGlvbnMgZnJvbSBGbGFzaFxyXG4gICAgICogZS5nLiwgUlRNUCBcIm1ldGhvZCBtaXNzaW5nXCIgd2FybmluZyAobm9uLWZhdGFsKSBmb3IgZ2V0U3RyZWFtTGVuZ3RoIG9uIHNlcnZlclxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb253YXJuaW5nID0gZnVuY3Rpb24obXNnLCBsZXZlbCwgY29kZSkge1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9ud2FybmluZykge1xyXG4gICAgICAgIHMuX2lPLm9ud2FybmluZyhtc2csIGxldmVsLCBjb2RlKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25maW5pc2ggPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIHN0b3JlIGxvY2FsIGNvcHkgYmVmb3JlIGl0IGdldHMgdHJhc2hlZC4uLlxyXG4gICAgICB2YXIgaW9fb25maW5pc2ggPSBzLl9pTy5vbmZpbmlzaDtcclxuXHJcbiAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG4gICAgICBzLl9yZXNldE9uUG9zaXRpb24oMCk7XHJcblxyXG4gICAgICAvLyByZXNldCBzb21lIHN0YXRlIGl0ZW1zXHJcbiAgICAgIGlmIChzLmluc3RhbmNlQ291bnQpIHtcclxuXHJcbiAgICAgICAgcy5pbnN0YW5jZUNvdW50LS07XHJcblxyXG4gICAgICAgIGlmICghcy5pbnN0YW5jZUNvdW50KSB7XHJcblxyXG4gICAgICAgICAgLy8gcmVtb3ZlIG9uUG9zaXRpb24gbGlzdGVuZXJzLCBpZiBhbnlcclxuICAgICAgICAgIGRldGFjaE9uUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAvLyByZXNldCBpbnN0YW5jZSBvcHRpb25zXHJcbiAgICAgICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcbiAgICAgICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgcy5pbnN0YW5jZUNvdW50ID0gMDtcclxuICAgICAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0ge307XHJcbiAgICAgICAgICBzLl9pTyA9IHt9O1xyXG4gICAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICAgIC8vIHJlc2V0IHBvc2l0aW9uLCB0b29cclxuICAgICAgICAgIGlmIChzLmlzSFRNTDUpIHtcclxuICAgICAgICAgICAgcy5wb3NpdGlvbiA9IDA7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzLmluc3RhbmNlQ291bnQgfHwgcy5faU8ubXVsdGlTaG90RXZlbnRzKSB7XHJcbiAgICAgICAgICAvLyBmaXJlIG9uZmluaXNoIGZvciBsYXN0LCBvciBldmVyeSBpbnN0YW5jZVxyXG4gICAgICAgICAgaWYgKGlvX29uZmluaXNoKSB7XHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IG9uZmluaXNoKCknKTtcclxuICAgICAgICAgICAgd3JhcENhbGxiYWNrKHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGlvX29uZmluaXNoLmFwcGx5KHMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl93aGlsZWxvYWRpbmcgPSBmdW5jdGlvbihuQnl0ZXNMb2FkZWQsIG5CeXRlc1RvdGFsLCBuRHVyYXRpb24sIG5CdWZmZXJMZW5ndGgpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIHMuYnl0ZXNMb2FkZWQgPSBuQnl0ZXNMb2FkZWQ7XHJcbiAgICAgIHMuYnl0ZXNUb3RhbCA9IG5CeXRlc1RvdGFsO1xyXG4gICAgICBzLmR1cmF0aW9uID0gTWF0aC5mbG9vcihuRHVyYXRpb24pO1xyXG4gICAgICBzLmJ1ZmZlckxlbmd0aCA9IG5CdWZmZXJMZW5ndGg7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiAhaW5zdGFuY2VPcHRpb25zLmlzTW92aWVTdGFyKSB7XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb24pIHtcclxuICAgICAgICAgIC8vIHVzZSBkdXJhdGlvbiBmcm9tIG9wdGlvbnMsIGlmIHNwZWNpZmllZCBhbmQgbGFyZ2VyLiBub2JvZHkgc2hvdWxkIGJlIHNwZWNpZnlpbmcgZHVyYXRpb24gaW4gb3B0aW9ucywgYWN0dWFsbHksIGFuZCBpdCBzaG91bGQgYmUgcmV0aXJlZC5cclxuICAgICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IChzLmR1cmF0aW9uID4gaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uKSA/IHMuZHVyYXRpb24gOiBpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb247XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IHBhcnNlSW50KChzLmJ5dGVzVG90YWwgLyBzLmJ5dGVzTG9hZGVkKSAqIHMuZHVyYXRpb24sIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBzLmR1cmF0aW9uO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZm9yIGZsYXNoLCByZWZsZWN0IHNlcXVlbnRpYWwtbG9hZC1zdHlsZSBidWZmZXJpbmdcclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBzLmJ1ZmZlcmVkID0gW3tcclxuICAgICAgICAgICdzdGFydCc6IDAsXHJcbiAgICAgICAgICAnZW5kJzogcy5kdXJhdGlvblxyXG4gICAgICAgIH1dO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhbGxvdyB3aGlsZWxvYWRpbmcgdG8gZmlyZSBldmVuIGlmIFwibG9hZFwiIGZpcmVkIHVuZGVyIEhUTUw1LCBkdWUgdG8gSFRUUCByYW5nZS9wYXJ0aWFsc1xyXG4gICAgICBpZiAoKHMucmVhZHlTdGF0ZSAhPT0gMyB8fCBzLmlzSFRNTDUpICYmIGluc3RhbmNlT3B0aW9ucy53aGlsZWxvYWRpbmcpIHtcclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMud2hpbGVsb2FkaW5nLmFwcGx5KHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl93aGlsZXBsYXlpbmcgPSBmdW5jdGlvbihuUG9zaXRpb24sIG9QZWFrRGF0YSwgb1dhdmVmb3JtRGF0YUxlZnQsIG9XYXZlZm9ybURhdGFSaWdodCwgb0VRRGF0YSkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPLFxyXG4gICAgICAgICAgZXFMZWZ0O1xyXG5cclxuICAgICAgaWYgKGlzTmFOKG5Qb3NpdGlvbikgfHwgblBvc2l0aW9uID09PSBudWxsKSB7XHJcbiAgICAgICAgLy8gZmxhc2ggc2FmZXR5IG5ldFxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2FmYXJpIEhUTUw1IHBsYXkoKSBtYXkgcmV0dXJuIHNtYWxsIC12ZSB2YWx1ZXMgd2hlbiBzdGFydGluZyBmcm9tIHBvc2l0aW9uOiAwLCBlZy4gLTUwLjEyMDM5Njg3NS4gVW5leHBlY3RlZC9pbnZhbGlkIHBlciBXMywgSSB0aGluay4gTm9ybWFsaXplIHRvIDAuXHJcbiAgICAgIHMucG9zaXRpb24gPSBNYXRoLm1heCgwLCBuUG9zaXRpb24pO1xyXG5cclxuICAgICAgcy5fcHJvY2Vzc09uUG9zaXRpb24oKTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmIGZWID4gOCkge1xyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnVzZVBlYWtEYXRhICYmIG9QZWFrRGF0YSAhPT0gX3VuZGVmaW5lZCAmJiBvUGVha0RhdGEpIHtcclxuICAgICAgICAgIHMucGVha0RhdGEgPSB7XHJcbiAgICAgICAgICAgIGxlZnQ6IG9QZWFrRGF0YS5sZWZ0UGVhayxcclxuICAgICAgICAgICAgcmlnaHQ6IG9QZWFrRGF0YS5yaWdodFBlYWtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnVzZVdhdmVmb3JtRGF0YSAmJiBvV2F2ZWZvcm1EYXRhTGVmdCAhPT0gX3VuZGVmaW5lZCAmJiBvV2F2ZWZvcm1EYXRhTGVmdCkge1xyXG4gICAgICAgICAgcy53YXZlZm9ybURhdGEgPSB7XHJcbiAgICAgICAgICAgIGxlZnQ6IG9XYXZlZm9ybURhdGFMZWZ0LnNwbGl0KCcsJyksXHJcbiAgICAgICAgICAgIHJpZ2h0OiBvV2F2ZWZvcm1EYXRhUmlnaHQuc3BsaXQoJywnKVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudXNlRVFEYXRhKSB7XHJcbiAgICAgICAgICBpZiAob0VRRGF0YSAhPT0gX3VuZGVmaW5lZCAmJiBvRVFEYXRhICYmIG9FUURhdGEubGVmdEVRKSB7XHJcbiAgICAgICAgICAgIGVxTGVmdCA9IG9FUURhdGEubGVmdEVRLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIHMuZXFEYXRhID0gZXFMZWZ0O1xyXG4gICAgICAgICAgICBzLmVxRGF0YS5sZWZ0ID0gZXFMZWZ0O1xyXG4gICAgICAgICAgICBpZiAob0VRRGF0YS5yaWdodEVRICE9PSBfdW5kZWZpbmVkICYmIG9FUURhdGEucmlnaHRFUSkge1xyXG4gICAgICAgICAgICAgIHMuZXFEYXRhLnJpZ2h0ID0gb0VRRGF0YS5yaWdodEVRLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDEpIHtcclxuXHJcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlL2hhY2s6IGVuc3VyZSBidWZmZXJpbmcgaXMgZmFsc2UgaWYgbG9hZGluZyBmcm9tIGNhY2hlIChhbmQgbm90IHlldCBzdGFydGVkKVxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1ICYmIGZWID09PSA4ICYmICFzLnBvc2l0aW9uICYmIHMuaXNCdWZmZXJpbmcpIHtcclxuICAgICAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy53aGlsZXBsYXlpbmcpIHtcclxuICAgICAgICAgIC8vIGZsYXNoIG1heSBjYWxsIGFmdGVyIGFjdHVhbCBmaW5pc2hcclxuICAgICAgICAgIGluc3RhbmNlT3B0aW9ucy53aGlsZXBsYXlpbmcuYXBwbHkocyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmNhcHRpb25kYXRhID0gZnVuY3Rpb24ob0RhdGEpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBpbnRlcm5hbDogZmxhc2ggOSArIE5ldFN0cmVhbSAoTW92aWVTdGFyL1JUTVAtb25seSkgZmVhdHVyZVxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gb0RhdGFcclxuICAgICAgICovXHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBDYXB0aW9uIGRhdGEgcmVjZWl2ZWQuJyk7XHJcblxyXG4gICAgICBzLmNhcHRpb25kYXRhID0gb0RhdGE7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25jYXB0aW9uZGF0YSkge1xyXG4gICAgICAgIHMuX2lPLm9uY2FwdGlvbmRhdGEuYXBwbHkocywgW29EYXRhXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29ubWV0YWRhdGEgPSBmdW5jdGlvbihvTURQcm9wcywgb01ERGF0YSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGludGVybmFsOiBmbGFzaCA5ICsgTmV0U3RyZWFtIChNb3ZpZVN0YXIvUlRNUC1vbmx5KSBmZWF0dXJlXHJcbiAgICAgICAqIFJUTVAgbWF5IGluY2x1ZGUgc29uZyB0aXRsZSwgTW92aWVTdGFyIGNvbnRlbnQgbWF5IGluY2x1ZGUgZW5jb2RpbmcgaW5mb1xyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2FycmF5fSBvTURQcm9wcyAobmFtZXMpXHJcbiAgICAgICAqIEBwYXJhbSB7YXJyYXl9IG9NRERhdGEgKHZhbHVlcylcclxuICAgICAgICovXHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBNZXRhZGF0YSByZWNlaXZlZC4nKTtcclxuXHJcbiAgICAgIHZhciBvRGF0YSA9IHt9LCBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMCwgaiA9IG9NRFByb3BzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIG9EYXRhW29NRFByb3BzW2ldXSA9IG9NRERhdGFbaV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMubWV0YWRhdGEgPSBvRGF0YTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbm1ldGFkYXRhKSB7XHJcbiAgICAgICAgcy5faU8ub25tZXRhZGF0YS5jYWxsKHMsIHMubWV0YWRhdGEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmlkMyA9IGZ1bmN0aW9uKG9JRDNQcm9wcywgb0lEM0RhdGEpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBpbnRlcm5hbDogZmxhc2ggOCArIGZsYXNoIDkgSUQzIGZlYXR1cmVcclxuICAgICAgICogbWF5IGluY2x1ZGUgYXJ0aXN0LCBzb25nIHRpdGxlIGV0Yy5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gb0lEM1Byb3BzIChuYW1lcylcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gb0lEM0RhdGEgKHZhbHVlcylcclxuICAgICAgICovXHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJRDMgZGF0YSByZWNlaXZlZC4nKTtcclxuXHJcbiAgICAgIHZhciBvRGF0YSA9IFtdLCBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMCwgaiA9IG9JRDNQcm9wcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICBvRGF0YVtvSUQzUHJvcHNbaV1dID0gb0lEM0RhdGFbaV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuaWQzID0gbWl4aW4ocy5pZDMsIG9EYXRhKTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbmlkMykge1xyXG4gICAgICAgIHMuX2lPLm9uaWQzLmFwcGx5KHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBmbGFzaC9SVE1QLW9ubHlcclxuXHJcbiAgICB0aGlzLl9vbmNvbm5lY3QgPSBmdW5jdGlvbihiU3VjY2Vzcykge1xyXG5cclxuICAgICAgYlN1Y2Nlc3MgPSAoYlN1Y2Nlc3MgPT09IDEpO1xyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiAnICsgKGJTdWNjZXNzID8gJ0Nvbm5lY3RlZC4nIDogJ0ZhaWxlZCB0byBjb25uZWN0PyAtICcgKyBzLnVybCksIChiU3VjY2VzcyA/IDEgOiAyKSk7XHJcbiAgICAgIHMuY29ubmVjdGVkID0gYlN1Y2Nlc3M7XHJcblxyXG4gICAgICBpZiAoYlN1Y2Nlc3MpIHtcclxuXHJcbiAgICAgICAgcy5mYWlsdXJlcyA9IDA7XHJcblxyXG4gICAgICAgIGlmIChpZENoZWNrKHMuaWQpKSB7XHJcbiAgICAgICAgICBpZiAocy5nZXRBdXRvUGxheSgpKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgdXBkYXRlIHRoZSBwbGF5IHN0YXRlIGlmIGF1dG8gcGxheWluZ1xyXG4gICAgICAgICAgICBzLnBsYXkoX3VuZGVmaW5lZCwgcy5nZXRBdXRvUGxheSgpKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAocy5faU8uYXV0b0xvYWQpIHtcclxuICAgICAgICAgICAgcy5sb2FkKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocy5faU8ub25jb25uZWN0KSB7XHJcbiAgICAgICAgICBzLl9pTy5vbmNvbm5lY3QuYXBwbHkocywgW2JTdWNjZXNzXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25kYXRhZXJyb3IgPSBmdW5jdGlvbihzRXJyb3IpIHtcclxuXHJcbiAgICAgIC8vIGZsYXNoIDkgd2F2ZS9lcSBkYXRhIGhhbmRsZXJcclxuICAgICAgLy8gaGFjazogY2FsbGVkIGF0IHN0YXJ0LCBhbmQgZW5kIGZyb20gZmxhc2ggYXQvYWZ0ZXIgb25maW5pc2goKVxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPiAwKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogRGF0YSBlcnJvcjogJyArIHNFcnJvcik7XHJcbiAgICAgICAgaWYgKHMuX2lPLm9uZGF0YWVycm9yKSB7XHJcbiAgICAgICAgICBzLl9pTy5vbmRhdGFlcnJvci5hcHBseShzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgdGhpcy5fZGVidWcoKTtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTsgLy8gU01Tb3VuZCgpXHJcblxyXG4gIC8qKlxyXG4gICAqIFByaXZhdGUgU291bmRNYW5hZ2VyIGludGVybmFsc1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICBnZXREb2N1bWVudCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHJldHVybiAoZG9jLmJvZHkgfHwgZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdkaXYnKVswXSk7XHJcblxyXG4gIH07XHJcblxyXG4gIGlkID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgcmV0dXJuIGRvYy5nZXRFbGVtZW50QnlJZChzSUQpO1xyXG5cclxuICB9O1xyXG5cclxuICBtaXhpbiA9IGZ1bmN0aW9uKG9NYWluLCBvQWRkKSB7XHJcblxyXG4gICAgLy8gbm9uLWRlc3RydWN0aXZlIG1lcmdlXHJcbiAgICB2YXIgbzEgPSAob01haW4gfHwge30pLCBvMiwgbztcclxuXHJcbiAgICAvLyBpZiB1bnNwZWNpZmllZCwgbzIgaXMgdGhlIGRlZmF1bHQgb3B0aW9ucyBvYmplY3RcclxuICAgIG8yID0gKG9BZGQgPT09IF91bmRlZmluZWQgPyBzbTIuZGVmYXVsdE9wdGlvbnMgOiBvQWRkKTtcclxuXHJcbiAgICBmb3IgKG8gaW4gbzIpIHtcclxuXHJcbiAgICAgIGlmIChvMi5oYXNPd25Qcm9wZXJ0eShvKSAmJiBvMVtvXSA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIG8yW29dICE9PSAnb2JqZWN0JyB8fCBvMltvXSA9PT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgIC8vIGFzc2lnbiBkaXJlY3RseVxyXG4gICAgICAgICAgbzFbb10gPSBvMltvXTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyByZWN1cnNlIHRocm91Z2ggbzJcclxuICAgICAgICAgIG8xW29dID0gbWl4aW4obzFbb10sIG8yW29dKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbzE7XHJcblxyXG4gIH07XHJcblxyXG4gIHdyYXBDYWxsYmFjayA9IGZ1bmN0aW9uKG9Tb3VuZCwgY2FsbGJhY2spIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIDAzLzAzLzIwMTM6IEZpeCBmb3IgRmxhc2ggUGxheWVyIDExLjYuNjAyLjE3MSArIEZsYXNoIDggKGZsYXNoVmVyc2lvbiA9IDgpIFNXRiBpc3N1ZVxyXG4gICAgICogc2V0VGltZW91dCgpIGZpeCBmb3IgY2VydGFpbiBTTVNvdW5kIGNhbGxiYWNrcyBsaWtlIG9ubG9hZCgpIGFuZCBvbmZpbmlzaCgpLCB3aGVyZSBzdWJzZXF1ZW50IGNhbGxzIGxpa2UgcGxheSgpIGFuZCBsb2FkKCkgZmFpbCB3aGVuIEZsYXNoIFBsYXllciAxMS42LjYwMi4xNzEgaXMgaW5zdGFsbGVkLCBhbmQgdXNpbmcgc291bmRNYW5hZ2VyIHdpdGggZmxhc2hWZXJzaW9uID0gOCAod2hpY2ggaXMgdGhlIGRlZmF1bHQpLlxyXG4gICAgICogTm90IHN1cmUgb2YgZXhhY3QgY2F1c2UuIFN1c3BlY3QgcmFjZSBjb25kaXRpb24gYW5kL29yIGludmFsaWQgKE5hTi1zdHlsZSkgcG9zaXRpb24gYXJndW1lbnQgdHJpY2tsaW5nIGRvd24gdG8gdGhlIG5leHQgSlMgLT4gRmxhc2ggX3N0YXJ0KCkgY2FsbCwgaW4gdGhlIHBsYXkoKSBjYXNlLlxyXG4gICAgICogRml4OiBzZXRUaW1lb3V0KCkgdG8geWllbGQsIHBsdXMgc2FmZXIgbnVsbCAvIE5hTiBjaGVja2luZyBvbiBwb3NpdGlvbiBhcmd1bWVudCBwcm92aWRlZCB0byBGbGFzaC5cclxuICAgICAqIGh0dHBzOi8vZ2V0c2F0aXNmYWN0aW9uLmNvbS9zY2hpbGxtYW5pYS90b3BpY3MvcmVjZW50X2Nocm9tZV91cGRhdGVfc2VlbXNfdG9faGF2ZV9icm9rZW5fbXlfc20yX2F1ZGlvX3BsYXllclxyXG4gICAgICovXHJcbiAgICBpZiAoIW9Tb3VuZC5pc0hUTUw1ICYmIGZWID09PSA4KSB7XHJcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIGFkZGl0aW9uYWwgc291bmRNYW5hZ2VyIHByb3BlcnRpZXMgdGhhdCBzb3VuZE1hbmFnZXIuc2V0dXAoKSB3aWxsIGFjY2VwdFxyXG5cclxuICBleHRyYU9wdGlvbnMgPSB7XHJcbiAgICAnb25yZWFkeSc6IDEsXHJcbiAgICAnb250aW1lb3V0JzogMSxcclxuICAgICdkZWZhdWx0T3B0aW9ucyc6IDEsXHJcbiAgICAnZmxhc2g5T3B0aW9ucyc6IDEsXHJcbiAgICAnbW92aWVTdGFyT3B0aW9ucyc6IDFcclxuICB9O1xyXG5cclxuICBhc3NpZ24gPSBmdW5jdGlvbihvLCBvUGFyZW50KSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWN1cnNpdmUgYXNzaWdubWVudCBvZiBwcm9wZXJ0aWVzLCBzb3VuZE1hbmFnZXIuc2V0dXAoKSBoZWxwZXJcclxuICAgICAqIGFsbG93cyBwcm9wZXJ0eSBhc3NpZ25tZW50IGJhc2VkIG9uIHdoaXRlbGlzdFxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIGksXHJcbiAgICAgICAgcmVzdWx0ID0gdHJ1ZSxcclxuICAgICAgICBoYXNQYXJlbnQgPSAob1BhcmVudCAhPT0gX3VuZGVmaW5lZCksXHJcbiAgICAgICAgc2V0dXBPcHRpb25zID0gc20yLnNldHVwT3B0aW9ucyxcclxuICAgICAgICBib251c09wdGlvbnMgPSBleHRyYU9wdGlvbnM7XHJcblxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgLy8gaWYgc291bmRNYW5hZ2VyLnNldHVwKCkgY2FsbGVkLCBzaG93IGFjY2VwdGVkIHBhcmFtZXRlcnMuXHJcblxyXG4gICAgaWYgKG8gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgZm9yIChpIGluIHNldHVwT3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAoc2V0dXBPcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XHJcbiAgICAgICAgICByZXN1bHQucHVzaChpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGkgaW4gYm9udXNPcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChib251c09wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuXHJcbiAgICAgICAgICBpZiAodHlwZW9mIHNtMltpXSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goaSArICc6IHsuLi59Jyk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHNtMltpXSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGkgKyAnOiBmdW5jdGlvbigpIHsuLi59Jyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RChzdHIoJ3NldHVwJywgcmVzdWx0LmpvaW4oJywgJykpKTtcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIGZvciAoaSBpbiBvKSB7XHJcblxyXG4gICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG5cclxuICAgICAgICAvLyBpZiBub3QgYW4ge29iamVjdH0gd2Ugd2FudCB0byByZWN1cnNlIHRocm91Z2guLi5cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvW2ldICE9PSAnb2JqZWN0JyB8fCBvW2ldID09PSBudWxsIHx8IG9baV0gaW5zdGFuY2VvZiBBcnJheSB8fCBvW2ldIGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcblxyXG4gICAgICAgICAgLy8gY2hlY2sgXCJhbGxvd2VkXCIgb3B0aW9uc1xyXG5cclxuICAgICAgICAgIGlmIChoYXNQYXJlbnQgJiYgYm9udXNPcHRpb25zW29QYXJlbnRdICE9PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB2YWxpZCByZWN1cnNpdmUgLyBuZXN0ZWQgb2JqZWN0IG9wdGlvbiwgZWcuLCB7IGRlZmF1bHRPcHRpb25zOiB7IHZvbHVtZTogNTAgfSB9XHJcbiAgICAgICAgICAgIHNtMltvUGFyZW50XVtpXSA9IG9baV07XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmIChzZXR1cE9wdGlvbnNbaV0gIT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZTogYXNzaWduIHRvIHNldHVwT3B0aW9ucyBvYmplY3QsIHdoaWNoIHNvdW5kTWFuYWdlciBwcm9wZXJ0eSByZWZlcmVuY2VzXHJcbiAgICAgICAgICAgIHNtMi5zZXR1cE9wdGlvbnNbaV0gPSBvW2ldO1xyXG5cclxuICAgICAgICAgICAgLy8gYXNzaWduIGRpcmVjdGx5IHRvIHNvdW5kTWFuYWdlciwgdG9vXHJcbiAgICAgICAgICAgIHNtMltpXSA9IG9baV07XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmIChib251c09wdGlvbnNbaV0gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGludmFsaWQgb3IgZGlzYWxsb3dlZCBwYXJhbWV0ZXIuIGNvbXBsYWluLlxyXG4gICAgICAgICAgICBjb21wbGFpbihzdHIoKHNtMltpXSA9PT0gX3VuZGVmaW5lZCA/ICdzZXR1cFVuZGVmJyA6ICdzZXR1cEVycm9yJyksIGkpLCAyKTtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogdmFsaWQgZXh0cmFPcHRpb25zIChib251c09wdGlvbnMpIHBhcmFtZXRlci5cclxuICAgICAgICAgICAgICogaXMgaXQgYSBtZXRob2QsIGxpa2Ugb25yZWFkeS9vbnRpbWVvdXQ/IGNhbGwgaXQuXHJcbiAgICAgICAgICAgICAqIG11bHRpcGxlIHBhcmFtZXRlcnMgc2hvdWxkIGJlIGluIGFuIGFycmF5LCBlZy4gc291bmRNYW5hZ2VyLnNldHVwKHtvbnJlYWR5OiBbbXlIYW5kbGVyLCBteVNjb3BlXX0pO1xyXG4gICAgICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgICAgIGlmIChzbTJbaV0gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICBzbTJbaV0uYXBwbHkoc20yLCAob1tpXSBpbnN0YW5jZW9mIEFycmF5ID8gb1tpXSA6IFtvW2ldXSkpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gZ29vZCBvbGQtZmFzaGlvbmVkIGRpcmVjdCBhc3NpZ25tZW50XHJcbiAgICAgICAgICAgICAgc20yW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gcmVjdXJzaW9uIGNhc2UsIGVnLiwgeyBkZWZhdWx0T3B0aW9uczogeyAuLi4gfSB9XHJcblxyXG4gICAgICAgICAgaWYgKGJvbnVzT3B0aW9uc1tpXSA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gaW52YWxpZCBvciBkaXNhbGxvd2VkIHBhcmFtZXRlci4gY29tcGxhaW4uXHJcbiAgICAgICAgICAgIGNvbXBsYWluKHN0cigoc20yW2ldID09PSBfdW5kZWZpbmVkID8gJ3NldHVwVW5kZWYnIDogJ3NldHVwRXJyb3InKSwgaSksIDIpO1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlY3Vyc2UgdGhyb3VnaCBvYmplY3RcclxuICAgICAgICAgICAgcmV0dXJuIGFzc2lnbihvW2ldLCBpKTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gcHJlZmVyRmxhc2hDaGVjayhraW5kKSB7XHJcblxyXG4gICAgLy8gd2hldGhlciBmbGFzaCBzaG91bGQgcGxheSBhIGdpdmVuIHR5cGVcclxuICAgIHJldHVybiAoc20yLnByZWZlckZsYXNoICYmIGhhc0ZsYXNoICYmICFzbTIuaWdub3JlRmxhc2ggJiYgKHNtMi5mbGFzaFtraW5kXSAhPT0gX3VuZGVmaW5lZCAmJiBzbTIuZmxhc2hba2luZF0pKTtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcm5hbCBET00yLWxldmVsIGV2ZW50IGhlbHBlcnNcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgZXZlbnQgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gbm9ybWFsaXplIGV2ZW50IG1ldGhvZHNcclxuICAgIHZhciBvbGQgPSAod2luZG93LmF0dGFjaEV2ZW50KSxcclxuICAgIGV2dCA9IHtcclxuICAgICAgYWRkOiAob2xkID8gJ2F0dGFjaEV2ZW50JyA6ICdhZGRFdmVudExpc3RlbmVyJyksXHJcbiAgICAgIHJlbW92ZTogKG9sZCA/ICdkZXRhY2hFdmVudCcgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicpXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIG5vcm1hbGl6ZSBcIm9uXCIgZXZlbnQgcHJlZml4LCBvcHRpb25hbCBjYXB0dXJlIGFyZ3VtZW50XHJcbiAgICBmdW5jdGlvbiBnZXRBcmdzKG9BcmdzKSB7XHJcblxyXG4gICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwob0FyZ3MpLFxyXG4gICAgICAgICAgbGVuID0gYXJncy5sZW5ndGg7XHJcblxyXG4gICAgICBpZiAob2xkKSB7XHJcbiAgICAgICAgLy8gcHJlZml4XHJcbiAgICAgICAgYXJnc1sxXSA9ICdvbicgKyBhcmdzWzFdO1xyXG4gICAgICAgIGlmIChsZW4gPiAzKSB7XHJcbiAgICAgICAgICAvLyBubyBjYXB0dXJlXHJcbiAgICAgICAgICBhcmdzLnBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChsZW4gPT09IDMpIHtcclxuICAgICAgICBhcmdzLnB1c2goZmFsc2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gYXJncztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXBwbHkoYXJncywgc1R5cGUpIHtcclxuXHJcbiAgICAgIC8vIG5vcm1hbGl6ZSBhbmQgY2FsbCB0aGUgZXZlbnQgbWV0aG9kLCB3aXRoIHRoZSBwcm9wZXIgYXJndW1lbnRzXHJcbiAgICAgIHZhciBlbGVtZW50ID0gYXJncy5zaGlmdCgpLFxyXG4gICAgICAgICAgbWV0aG9kID0gW2V2dFtzVHlwZV1dO1xyXG5cclxuICAgICAgaWYgKG9sZCkge1xyXG4gICAgICAgIC8vIG9sZCBJRSBjYW4ndCBkbyBhcHBseSgpLlxyXG4gICAgICAgIGVsZW1lbnRbbWV0aG9kXShhcmdzWzBdLCBhcmdzWzFdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50W21ldGhvZF0uYXBwbHkoZWxlbWVudCwgYXJncyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkKCkge1xyXG4gICAgICBhcHBseShnZXRBcmdzKGFyZ3VtZW50cyksICdhZGQnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZW1vdmUoKSB7XHJcbiAgICAgIGFwcGx5KGdldEFyZ3MoYXJndW1lbnRzKSwgJ3JlbW92ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdhZGQnOiBhZGQsXHJcbiAgICAgICdyZW1vdmUnOiByZW1vdmVcclxuICAgIH07XHJcblxyXG4gIH0oKSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsIEhUTUw1IGV2ZW50IGhhbmRsaW5nXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgZnVuY3Rpb24gaHRtbDVfZXZlbnQob0ZuKSB7XHJcblxyXG4gICAgLy8gd3JhcCBodG1sNSBldmVudCBoYW5kbGVycyBzbyB3ZSBkb24ndCBjYWxsIHRoZW0gb24gZGVzdHJveWVkIGFuZC9vciB1bmxvYWRlZCBzb3VuZHNcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zLFxyXG4gICAgICAgICAgcmVzdWx0O1xyXG5cclxuICAgICAgaWYgKCFzIHx8ICFzLl9hKSB7XHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKHMgJiYgcy5pZCkge1xyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogSWdub3JpbmcgJyArIGUudHlwZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNtMi5fd0QoaDUgKyAnSWdub3JpbmcgJyArIGUudHlwZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuICAgICAgICByZXN1bHQgPSBudWxsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc3VsdCA9IG9Gbi5jYWxsKHRoaXMsIGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH07XHJcblxyXG4gIH1cclxuXHJcbiAgaHRtbDVfZXZlbnRzID0ge1xyXG5cclxuICAgIC8vIEhUTUw1IGV2ZW50LW5hbWUtdG8taGFuZGxlciBtYXBcclxuXHJcbiAgICBhYm9ydDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBhYm9ydCcpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIC8vIGVub3VnaCBoYXMgbG9hZGVkIHRvIHBsYXlcclxuXHJcbiAgICBjYW5wbGF5OiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcyxcclxuICAgICAgICAgIHBvc2l0aW9uMUs7XHJcblxyXG4gICAgICBpZiAocy5faHRtbDVfY2FucGxheSkge1xyXG4gICAgICAgIC8vIHRoaXMgZXZlbnQgaGFzIGFscmVhZHkgZmlyZWQuIGlnbm9yZS5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5faHRtbDVfY2FucGxheSA9IHRydWU7XHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IGNhbnBsYXknKTtcclxuICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcblxyXG4gICAgICAvLyBwb3NpdGlvbiBhY2NvcmRpbmcgdG8gaW5zdGFuY2Ugb3B0aW9uc1xyXG4gICAgICBwb3NpdGlvbjFLID0gKHMuX2lPLnBvc2l0aW9uICE9PSBfdW5kZWZpbmVkICYmICFpc05hTihzLl9pTy5wb3NpdGlvbikgPyBzLl9pTy5wb3NpdGlvbi9tc2VjU2NhbGUgOiBudWxsKTtcclxuXHJcbiAgICAgIC8vIHNldCB0aGUgcG9zaXRpb24gaWYgcG9zaXRpb24gd2FzIHByb3ZpZGVkIGJlZm9yZSB0aGUgc291bmQgbG9hZGVkXHJcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lICE9PSBwb3NpdGlvbjFLKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogY2FucGxheTogU2V0dGluZyBwb3NpdGlvbiB0byAnICsgcG9zaXRpb24xSyk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSBwb3NpdGlvbjFLO1xyXG4gICAgICAgIH0gY2F0Y2goZWUpIHtcclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IGNhbnBsYXk6IFNldHRpbmcgcG9zaXRpb24gb2YgJyArIHBvc2l0aW9uMUsgKyAnIGZhaWxlZDogJyArIGVlLm1lc3NhZ2UsIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaGFjayBmb3IgSFRNTDUgZnJvbS90byBjYXNlXHJcbiAgICAgIGlmIChzLl9pTy5fb25jYW5wbGF5KSB7XHJcbiAgICAgICAgcy5faU8uX29uY2FucGxheSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgY2FucGxheXRocm91Z2g6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgaWYgKCFzLmxvYWRlZCkge1xyXG4gICAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG4gICAgICAgIHMuX3doaWxlbG9hZGluZyhzLmJ5dGVzTG9hZGVkLCBzLmJ5dGVzVG90YWwsIHMuX2dldF9odG1sNV9kdXJhdGlvbigpKTtcclxuICAgICAgICBzLl9vbmxvYWQodHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBkdXJhdGlvbmNoYW5nZTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBkdXJhdGlvbmNoYW5nZSBtYXkgZmlyZSBhdCB2YXJpb3VzIHRpbWVzLCBwcm9iYWJseSB0aGUgc2FmZXN0IHdheSB0byBjYXB0dXJlIGFjY3VyYXRlL2ZpbmFsIGR1cmF0aW9uLlxyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zLFxyXG4gICAgICAgICAgZHVyYXRpb247XHJcblxyXG4gICAgICBkdXJhdGlvbiA9IHMuX2dldF9odG1sNV9kdXJhdGlvbigpO1xyXG5cclxuICAgICAgaWYgKCFpc05hTihkdXJhdGlvbikgJiYgZHVyYXRpb24gIT09IHMuZHVyYXRpb24pIHtcclxuXHJcbiAgICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogZHVyYXRpb25jaGFuZ2UgKCcgKyBkdXJhdGlvbiArICcpJyArIChzLmR1cmF0aW9uID8gJywgcHJldmlvdXNseSAnICsgcy5kdXJhdGlvbiA6ICcnKSk7XHJcblxyXG4gICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IHMuZHVyYXRpb24gPSBkdXJhdGlvbjtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBUT0RPOiBSZXNlcnZlZCBmb3IgcG90ZW50aWFsIHVzZVxyXG4gICAgLypcclxuICAgIGVtcHRpZWQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogZW1wdGllZCcpO1xyXG5cclxuICAgIH0pLFxyXG4gICAgKi9cclxuXHJcbiAgICBlbmRlZDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBlbmRlZCcpO1xyXG5cclxuICAgICAgcy5fb25maW5pc2goKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBlcnJvcjogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBIVE1MNSBlcnJvciwgY29kZSAnICsgdGhpcy5lcnJvci5jb2RlKTtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhUTUw1IGVycm9yIGNvZGVzLCBwZXIgVzNDXHJcbiAgICAgICAqIEVycm9yIDE6IENsaWVudCBhYm9ydGVkIGRvd25sb2FkIGF0IHVzZXIncyByZXF1ZXN0LlxyXG4gICAgICAgKiBFcnJvciAyOiBOZXR3b3JrIGVycm9yIGFmdGVyIGxvYWQgc3RhcnRlZC5cclxuICAgICAgICogRXJyb3IgMzogRGVjb2RpbmcgaXNzdWUuXHJcbiAgICAgICAqIEVycm9yIDQ6IE1lZGlhIChhdWRpbyBmaWxlKSBub3Qgc3VwcG9ydGVkLlxyXG4gICAgICAgKiBSZWZlcmVuY2U6IGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3RoZS12aWRlby1lbGVtZW50Lmh0bWwjZXJyb3ItY29kZXNcclxuICAgICAgICovXHJcbiAgICAgIC8vIGNhbGwgbG9hZCB3aXRoIGVycm9yIHN0YXRlP1xyXG4gICAgICB0aGlzLl9zLl9vbmxvYWQoZmFsc2UpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGxvYWRlZGRhdGE6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogbG9hZGVkZGF0YScpO1xyXG5cclxuICAgICAgLy8gc2FmYXJpIHNlZW1zIHRvIG5pY2VseSByZXBvcnQgcHJvZ3Jlc3MgZXZlbnRzLCBldmVudHVhbGx5IHRvdGFsbGluZyAxMDAlXHJcbiAgICAgIGlmICghcy5fbG9hZGVkICYmICFpc1NhZmFyaSkge1xyXG4gICAgICAgIHMuZHVyYXRpb24gPSBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGxvYWRlZG1ldGFkYXRhOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGxvYWRlZG1ldGFkYXRhJyk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgbG9hZHN0YXJ0OiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGxvYWRzdGFydCcpO1xyXG4gICAgICAvLyBhc3N1bWUgYnVmZmVyaW5nIGF0IGZpcnN0XHJcbiAgICAgIHRoaXMuX3MuX29uYnVmZmVyY2hhbmdlKDEpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHBsYXk6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gc20yLl93RCh0aGlzLl9zLmlkICsgJzogcGxheSgpJyk7XHJcbiAgICAgIC8vIG9uY2UgcGxheSBzdGFydHMsIG5vIGJ1ZmZlcmluZ1xyXG4gICAgICB0aGlzLl9zLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBwbGF5aW5nOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHBsYXlpbmcgJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoOTgzNSkpO1xyXG4gICAgICAvLyBvbmNlIHBsYXkgc3RhcnRzLCBubyBidWZmZXJpbmdcclxuICAgICAgdGhpcy5fcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgcHJvZ3Jlc3M6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgIC8vIG5vdGU6IGNhbiBmaXJlIHJlcGVhdGVkbHkgYWZ0ZXIgXCJsb2FkZWRcIiBldmVudCwgZHVlIHRvIHVzZSBvZiBIVFRQIHJhbmdlL3BhcnRpYWxzXHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3MsXHJcbiAgICAgICAgICBpLCBqLCBwcm9nU3RyLCBidWZmZXJlZCA9IDAsXHJcbiAgICAgICAgICBpc1Byb2dyZXNzID0gKGUudHlwZSA9PT0gJ3Byb2dyZXNzJyksXHJcbiAgICAgICAgICByYW5nZXMgPSBlLnRhcmdldC5idWZmZXJlZCxcclxuICAgICAgICAgIC8vIGZpcmVmb3ggMy42IGltcGxlbWVudHMgZS5sb2FkZWQvdG90YWwgKGJ5dGVzKVxyXG4gICAgICAgICAgbG9hZGVkID0gKGUubG9hZGVkIHx8IDApLFxyXG4gICAgICAgICAgdG90YWwgPSAoZS50b3RhbCB8fCAxKTtcclxuXHJcbiAgICAgIC8vIHJlc2V0IHRoZSBcImJ1ZmZlcmVkXCIgKGxvYWRlZCBieXRlIHJhbmdlcykgYXJyYXlcclxuICAgICAgcy5idWZmZXJlZCA9IFtdO1xyXG5cclxuICAgICAgaWYgKHJhbmdlcyAmJiByYW5nZXMubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIGxvYWRlZCBpcyAwLCB0cnkgVGltZVJhbmdlcyBpbXBsZW1lbnRhdGlvbiBhcyAlIG9mIGxvYWRcclxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9ET00vVGltZVJhbmdlc1xyXG5cclxuICAgICAgICAvLyByZS1idWlsZCBcImJ1ZmZlcmVkXCIgYXJyYXlcclxuICAgICAgICAvLyBIVE1MNSByZXR1cm5zIHNlY29uZHMuIFNNMiBBUEkgdXNlcyBtc2VjIGZvciBzZXRQb3NpdGlvbigpIGV0Yy4sIHdoZXRoZXIgRmxhc2ggb3IgSFRNTDUuXHJcbiAgICAgICAgZm9yIChpID0gMCwgaiA9IHJhbmdlcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICAgIHMuYnVmZmVyZWQucHVzaCh7XHJcbiAgICAgICAgICAgICdzdGFydCc6IHJhbmdlcy5zdGFydChpKSAqIG1zZWNTY2FsZSxcclxuICAgICAgICAgICAgJ2VuZCc6IHJhbmdlcy5lbmQoaSkgKiBtc2VjU2NhbGVcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdXNlIHRoZSBsYXN0IHZhbHVlIGxvY2FsbHlcclxuICAgICAgICBidWZmZXJlZCA9IChyYW5nZXMuZW5kKDApIC0gcmFuZ2VzLnN0YXJ0KDApKSAqIG1zZWNTY2FsZTtcclxuXHJcbiAgICAgICAgLy8gbGluZWFyIGNhc2UsIGJ1ZmZlciBzdW07IGRvZXMgbm90IGFjY291bnQgZm9yIHNlZWtpbmcgYW5kIEhUVFAgcGFydGlhbHMgLyBieXRlIHJhbmdlc1xyXG4gICAgICAgIGxvYWRlZCA9IE1hdGgubWluKDEsIGJ1ZmZlcmVkIC8gKGUudGFyZ2V0LmR1cmF0aW9uICogbXNlY1NjYWxlKSk7XHJcblxyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChpc1Byb2dyZXNzICYmIHJhbmdlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICBwcm9nU3RyID0gW107XHJcbiAgICAgICAgICBqID0gcmFuZ2VzLmxlbmd0aDtcclxuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICAgICAgcHJvZ1N0ci5wdXNoKChlLnRhcmdldC5idWZmZXJlZC5zdGFydChpKSAqIG1zZWNTY2FsZSkgKyAnLScgKyAoZS50YXJnZXQuYnVmZmVyZWQuZW5kKGkpICogbXNlY1NjYWxlKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBwcm9ncmVzcywgdGltZVJhbmdlczogJyArIHByb2dTdHIuam9pbignLCAnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaXNQcm9ncmVzcyAmJiAhaXNOYU4obG9hZGVkKSkge1xyXG4gICAgICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogcHJvZ3Jlc3MsICcgKyBNYXRoLmZsb29yKGxvYWRlZCAqIDEwMCkgKyAnJSBsb2FkZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFpc05hTihsb2FkZWQpKSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IHByZXZlbnQgY2FsbHMgd2l0aCBkdXBsaWNhdGUgdmFsdWVzLlxyXG4gICAgICAgIHMuX3doaWxlbG9hZGluZyhsb2FkZWQsIHRvdGFsLCBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKSk7XHJcbiAgICAgICAgaWYgKGxvYWRlZCAmJiB0b3RhbCAmJiBsb2FkZWQgPT09IHRvdGFsKSB7XHJcbiAgICAgICAgICAvLyBpbiBjYXNlIFwib25sb2FkXCIgZG9lc24ndCBmaXJlIChlZy4gZ2Vja28gMS45LjIpXHJcbiAgICAgICAgICBodG1sNV9ldmVudHMuY2FucGxheXRocm91Z2guY2FsbCh0aGlzLCBlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgcmF0ZWNoYW5nZTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiByYXRlY2hhbmdlJyk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgc3VzcGVuZDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgLy8gZG93bmxvYWQgcGF1c2VkL3N0b3BwZWQsIG1heSBoYXZlIGZpbmlzaGVkIChlZy4gb25sb2FkKVxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBzdXNwZW5kJyk7XHJcbiAgICAgIGh0bWw1X2V2ZW50cy5wcm9ncmVzcy5jYWxsKHRoaXMsIGUpO1xyXG4gICAgICBzLl9vbnN1c3BlbmQoKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBzdGFsbGVkOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHN0YWxsZWQnKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICB0aW1ldXBkYXRlOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHRoaXMuX3MuX29uVGltZXIoKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICB3YWl0aW5nOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIC8vIHNlZSBhbHNvOiBzZWVraW5nXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHdhaXRpbmcnKTtcclxuXHJcbiAgICAgIC8vIHBsYXliYWNrIGZhc3RlciB0aGFuIGRvd25sb2FkIHJhdGUsIGV0Yy5cclxuICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMSk7XHJcblxyXG4gICAgfSlcclxuXHJcbiAgfTtcclxuXHJcbiAgaHRtbDVPSyA9IGZ1bmN0aW9uKGlPKSB7XHJcblxyXG4gICAgLy8gcGxheWFiaWxpdHkgdGVzdCBiYXNlZCBvbiBVUkwgb3IgTUlNRSB0eXBlXHJcblxyXG4gICAgdmFyIHJlc3VsdDtcclxuXHJcbiAgICBpZiAoIWlPIHx8ICghaU8udHlwZSAmJiAhaU8udXJsICYmICFpTy5zZXJ2ZXJVUkwpKSB7XHJcblxyXG4gICAgICAvLyBub3RoaW5nIHRvIGNoZWNrXHJcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgIH0gZWxzZSBpZiAoaU8uc2VydmVyVVJMIHx8IChpTy50eXBlICYmIHByZWZlckZsYXNoQ2hlY2soaU8udHlwZSkpKSB7XHJcblxyXG4gICAgICAvLyBSVE1QLCBvciBwcmVmZXJyaW5nIGZsYXNoXHJcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAvLyBVc2UgdHlwZSwgaWYgc3BlY2lmaWVkLiBQYXNzIGRhdGE6IFVSSXMgdG8gSFRNTDUuIElmIEhUTUw1LW9ubHkgbW9kZSwgbm8gb3RoZXIgb3B0aW9ucywgc28ganVzdCBnaXZlICdlclxyXG4gICAgICByZXN1bHQgPSAoKGlPLnR5cGUgPyBodG1sNUNhblBsYXkoe3R5cGU6aU8udHlwZX0pIDogaHRtbDVDYW5QbGF5KHt1cmw6aU8udXJsfSkgfHwgc20yLmh0bWw1T25seSB8fCBpTy51cmwubWF0Y2goL2RhdGFcXDovaSkpKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgaHRtbDVVbmxvYWQgPSBmdW5jdGlvbihvQXVkaW8pIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVybmFsIG1ldGhvZDogVW5sb2FkIG1lZGlhLCBhbmQgY2FuY2VsIGFueSBjdXJyZW50L3BlbmRpbmcgbmV0d29yayByZXF1ZXN0cy5cclxuICAgICAqIEZpcmVmb3ggY2FuIGxvYWQgYW4gZW1wdHkgVVJMLCB3aGljaCBhbGxlZ2VkbHkgZGVzdHJveXMgdGhlIGRlY29kZXIgYW5kIHN0b3BzIHRoZSBkb3dubG9hZC5cclxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL0VuL1VzaW5nX2F1ZGlvX2FuZF92aWRlb19pbl9GaXJlZm94I1N0b3BwaW5nX3RoZV9kb3dubG9hZF9vZl9tZWRpYVxyXG4gICAgICogSG93ZXZlciwgRmlyZWZveCBoYXMgYmVlbiBzZWVuIGxvYWRpbmcgYSByZWxhdGl2ZSBVUkwgZnJvbSAnJyBhbmQgdGh1cyByZXF1ZXN0aW5nIHRoZSBob3N0aW5nIHBhZ2Ugb24gdW5sb2FkLlxyXG4gICAgICogT3RoZXIgVUEgYmVoYXZpb3VyIGlzIHVuY2xlYXIsIHNvIGV2ZXJ5b25lIGVsc2UgZ2V0cyBhbiBhYm91dDpibGFuay1zdHlsZSBVUkwuXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgdXJsO1xyXG5cclxuICAgIGlmIChvQXVkaW8pIHtcclxuXHJcbiAgICAgIC8vIEZpcmVmb3ggYW5kIENocm9tZSBhY2NlcHQgc2hvcnQgV0FWZSBkYXRhOiBVUklzLiBDaG9tZSBkaXNsaWtlcyBhdWRpby93YXYsIGJ1dCBhY2NlcHRzIGF1ZGlvL3dhdiBmb3IgZGF0YTogTUlNRS5cclxuICAgICAgLy8gRGVza3RvcCBTYWZhcmkgY29tcGxhaW5zIC8gZmFpbHMgb24gZGF0YTogVVJJLCBzbyBpdCBnZXRzIGFib3V0OmJsYW5rLlxyXG4gICAgICB1cmwgPSAoaXNTYWZhcmkgPyBlbXB0eVVSTCA6IChzbTIuaHRtbDUuY2FuUGxheVR5cGUoJ2F1ZGlvL3dhdicpID8gZW1wdHlXQVYgOiBlbXB0eVVSTCkpO1xyXG5cclxuICAgICAgb0F1ZGlvLnNyYyA9IHVybDtcclxuXHJcbiAgICAgIC8vIHJlc2V0IHNvbWUgc3RhdGUsIHRvb1xyXG4gICAgICBpZiAob0F1ZGlvLl9jYWxsZWRfdW5sb2FkICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgb0F1ZGlvLl9jYWxsZWRfbG9hZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmICh1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAvLyBlbnN1cmUgVVJMIHN0YXRlIGlzIHRyYXNoZWQsIGFsc29cclxuICAgICAgbGFzdEdsb2JhbEhUTUw1VVJMID0gbnVsbDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHVybDtcclxuXHJcbiAgfTtcclxuXHJcbiAgaHRtbDVDYW5QbGF5ID0gZnVuY3Rpb24obykge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJ5IHRvIGZpbmQgTUlNRSwgdGVzdCBhbmQgcmV0dXJuIHRydXRoaW5lc3NcclxuICAgICAqIG8gPSB7XHJcbiAgICAgKiAgdXJsOiAnL3BhdGgvdG8vYW4ubXAzJyxcclxuICAgICAqICB0eXBlOiAnYXVkaW8vbXAzJ1xyXG4gICAgICogfVxyXG4gICAgICovXHJcblxyXG4gICAgaWYgKCFzbTIudXNlSFRNTDVBdWRpbyB8fCAhc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdXJsID0gKG8udXJsIHx8IG51bGwpLFxyXG4gICAgICAgIG1pbWUgPSAoby50eXBlIHx8IG51bGwpLFxyXG4gICAgICAgIGFGID0gc20yLmF1ZGlvRm9ybWF0cyxcclxuICAgICAgICByZXN1bHQsXHJcbiAgICAgICAgb2Zmc2V0LFxyXG4gICAgICAgIGZpbGVFeHQsXHJcbiAgICAgICAgaXRlbTtcclxuXHJcbiAgICAvLyBhY2NvdW50IGZvciBrbm93biBjYXNlcyBsaWtlIGF1ZGlvL21wM1xyXG5cclxuICAgIGlmIChtaW1lICYmIHNtMi5odG1sNVttaW1lXSAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm4gKHNtMi5odG1sNVttaW1lXSAmJiAhcHJlZmVyRmxhc2hDaGVjayhtaW1lKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFodG1sNUV4dCkge1xyXG4gICAgICBcclxuICAgICAgaHRtbDVFeHQgPSBbXTtcclxuICAgICAgXHJcbiAgICAgIGZvciAoaXRlbSBpbiBhRikge1xyXG4gICAgICBcclxuICAgICAgICBpZiAoYUYuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgXHJcbiAgICAgICAgICBodG1sNUV4dC5wdXNoKGl0ZW0pO1xyXG4gICAgICBcclxuICAgICAgICAgIGlmIChhRltpdGVtXS5yZWxhdGVkKSB7XHJcbiAgICAgICAgICAgIGh0bWw1RXh0ID0gaHRtbDVFeHQuY29uY2F0KGFGW2l0ZW1dLnJlbGF0ZWQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICBcclxuICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBodG1sNUV4dCA9IG5ldyBSZWdFeHAoJ1xcXFwuKCcraHRtbDVFeHQuam9pbignfCcpKycpKFxcXFw/LiopPyQnLCdpJyk7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBTdHJpcCBVUkwgcXVlcmllcywgZXRjLlxyXG4gICAgZmlsZUV4dCA9ICh1cmwgPyB1cmwudG9Mb3dlckNhc2UoKS5tYXRjaChodG1sNUV4dCkgOiBudWxsKTtcclxuXHJcbiAgICBpZiAoIWZpbGVFeHQgfHwgIWZpbGVFeHQubGVuZ3RoKSB7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoIW1pbWUpIHtcclxuICAgICAgXHJcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcbiAgICAgIFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICBcclxuICAgICAgICAvLyBhdWRpby9tcDMgLT4gbXAzLCByZXN1bHQgc2hvdWxkIGJlIGtub3duXHJcbiAgICAgICAgb2Zmc2V0ID0gbWltZS5pbmRleE9mKCc7Jyk7XHJcbiAgICAgIFxyXG4gICAgICAgIC8vIHN0cmlwIFwiYXVkaW8vWDsgY29kZWNzLi4uXCJcclxuICAgICAgICBmaWxlRXh0ID0gKG9mZnNldCAhPT0gLTEgPyBtaW1lLnN1YnN0cigwLG9mZnNldCkgOiBtaW1lKS5zdWJzdHIoNik7XHJcbiAgICAgIFxyXG4gICAgICB9XHJcbiAgICBcclxuICAgIH0gZWxzZSB7XHJcbiAgICBcclxuICAgICAgLy8gbWF0Y2ggdGhlIHJhdyBleHRlbnNpb24gbmFtZSAtIFwibXAzXCIsIGZvciBleGFtcGxlXHJcbiAgICAgIGZpbGVFeHQgPSBmaWxlRXh0WzFdO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGZpbGVFeHQgJiYgc20yLmh0bWw1W2ZpbGVFeHRdICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICBcclxuICAgICAgLy8gcmVzdWx0IGtub3duXHJcbiAgICAgIHJlc3VsdCA9IChzbTIuaHRtbDVbZmlsZUV4dF0gJiYgIXByZWZlckZsYXNoQ2hlY2soZmlsZUV4dCkpO1xyXG4gICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgXHJcbiAgICAgIG1pbWUgPSAnYXVkaW8vJyArIGZpbGVFeHQ7XHJcbiAgICAgIHJlc3VsdCA9IHNtMi5odG1sNS5jYW5QbGF5VHlwZSh7dHlwZTptaW1lfSk7XHJcbiAgICBcclxuICAgICAgc20yLmh0bWw1W2ZpbGVFeHRdID0gcmVzdWx0O1xyXG4gICAgXHJcbiAgICAgIC8vIHNtMi5fd0QoJ2NhblBsYXlUeXBlLCBmb3VuZCByZXN1bHQ6ICcgKyByZXN1bHQpO1xyXG4gICAgICByZXN1bHQgPSAocmVzdWx0ICYmIHNtMi5odG1sNVttaW1lXSAmJiAhcHJlZmVyRmxhc2hDaGVjayhtaW1lKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGVzdEhUTUw1ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcm5hbDogSXRlcmF0ZXMgb3ZlciBhdWRpb0Zvcm1hdHMsIGRldGVybWluaW5nIHN1cHBvcnQgZWcuIGF1ZGlvL21wMywgYXVkaW8vbXBlZyBhbmQgc28gb25cclxuICAgICAqIGFzc2lnbnMgcmVzdWx0cyB0byBodG1sNVtdIGFuZCBmbGFzaFtdLlxyXG4gICAgICovXHJcblxyXG4gICAgaWYgKCFzbTIudXNlSFRNTDVBdWRpbyB8fCAhc20yLmhhc0hUTUw1KSB7XHJcbiAgICBcclxuICAgICAgLy8gd2l0aG91dCBIVE1MNSwgd2UgbmVlZCBGbGFzaC5cclxuICAgICAgc20yLmh0bWw1LnVzaW5nRmxhc2ggPSB0cnVlO1xyXG4gICAgICBuZWVkc0ZsYXNoID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICAvLyBkb3VibGUtd2hhbW15OiBPcGVyYSA5LjY0IHRocm93cyBXUk9OR19BUkdVTUVOVFNfRVJSIGlmIG5vIHBhcmFtZXRlciBwYXNzZWQgdG8gQXVkaW8oKSwgYW5kIFdlYmtpdCArIGlPUyBoYXBwaWx5IHRyaWVzIHRvIGxvYWQgXCJudWxsXCIgYXMgYSBVUkwuIDovXHJcbiAgICB2YXIgYSA9IChBdWRpbyAhPT0gX3VuZGVmaW5lZCA/IChpc09wZXJhICYmIG9wZXJhLnZlcnNpb24oKSA8IDEwID8gbmV3IEF1ZGlvKG51bGwpIDogbmV3IEF1ZGlvKCkpIDogbnVsbCksXHJcbiAgICAgICAgaXRlbSwgbG9va3VwLCBzdXBwb3J0ID0ge30sIGFGLCBpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNwKG0pIHtcclxuXHJcbiAgICAgIHZhciBjYW5QbGF5LCBqLFxyXG4gICAgICAgICAgcmVzdWx0ID0gZmFsc2UsXHJcbiAgICAgICAgICBpc09LID0gZmFsc2U7XHJcblxyXG4gICAgICBpZiAoIWEgfHwgdHlwZW9mIGEuY2FuUGxheVR5cGUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICBcclxuICAgICAgICAvLyBpdGVyYXRlIHRocm91Z2ggYWxsIG1pbWUgdHlwZXMsIHJldHVybiBhbnkgc3VjY2Vzc2VzXHJcbiAgICBcclxuICAgICAgICBmb3IgKGkgPSAwLCBqID0gbS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgIFxyXG4gICAgICAgICAgaWYgKHNtMi5odG1sNVttW2ldXSB8fCBhLmNhblBsYXlUeXBlKG1baV0pLm1hdGNoKHNtMi5odG1sNVRlc3QpKSB7XHJcbiAgICBcclxuICAgICAgICAgICAgaXNPSyA9IHRydWU7XHJcbiAgICAgICAgICAgIHNtMi5odG1sNVttW2ldXSA9IHRydWU7XHJcbiAgICBcclxuICAgICAgICAgICAgLy8gbm90ZSBmbGFzaCBzdXBwb3J0LCB0b29cclxuICAgICAgICAgICAgc20yLmZsYXNoW21baV1dID0gISEobVtpXS5tYXRjaChmbGFzaE1JTUUpKTtcclxuICAgIFxyXG4gICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgcmVzdWx0ID0gaXNPSztcclxuICAgIFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgXHJcbiAgICAgICAgY2FuUGxheSA9IChhICYmIHR5cGVvZiBhLmNhblBsYXlUeXBlID09PSAnZnVuY3Rpb24nID8gYS5jYW5QbGF5VHlwZShtKSA6IGZhbHNlKTtcclxuICAgICAgICByZXN1bHQgPSAhIShjYW5QbGF5ICYmIChjYW5QbGF5Lm1hdGNoKHNtMi5odG1sNVRlc3QpKSk7XHJcbiAgICBcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGVzdCBhbGwgcmVnaXN0ZXJlZCBmb3JtYXRzICsgY29kZWNzXHJcblxyXG4gICAgYUYgPSBzbTIuYXVkaW9Gb3JtYXRzO1xyXG5cclxuICAgIGZvciAoaXRlbSBpbiBhRikge1xyXG5cclxuICAgICAgaWYgKGFGLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcblxyXG4gICAgICAgIGxvb2t1cCA9ICdhdWRpby8nICsgaXRlbTtcclxuXHJcbiAgICAgICAgc3VwcG9ydFtpdGVtXSA9IGNwKGFGW2l0ZW1dLnR5cGUpO1xyXG5cclxuICAgICAgICAvLyB3cml0ZSBiYWNrIGdlbmVyaWMgdHlwZSB0b28sIGVnLiBhdWRpby9tcDNcclxuICAgICAgICBzdXBwb3J0W2xvb2t1cF0gPSBzdXBwb3J0W2l0ZW1dO1xyXG5cclxuICAgICAgICAvLyBhc3NpZ24gZmxhc2hcclxuICAgICAgICBpZiAoaXRlbS5tYXRjaChmbGFzaE1JTUUpKSB7XHJcblxyXG4gICAgICAgICAgc20yLmZsYXNoW2l0ZW1dID0gdHJ1ZTtcclxuICAgICAgICAgIHNtMi5mbGFzaFtsb29rdXBdID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBzbTIuZmxhc2hbaXRlbV0gPSBmYWxzZTtcclxuICAgICAgICAgIHNtMi5mbGFzaFtsb29rdXBdID0gZmFsc2U7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gYXNzaWduIHJlc3VsdCB0byByZWxhdGVkIGZvcm1hdHMsIHRvb1xyXG5cclxuICAgICAgICBpZiAoYUZbaXRlbV0gJiYgYUZbaXRlbV0ucmVsYXRlZCkge1xyXG5cclxuICAgICAgICAgIGZvciAoaSA9IGFGW2l0ZW1dLnJlbGF0ZWQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGVnLiBhdWRpby9tNGFcclxuICAgICAgICAgICAgc3VwcG9ydFsnYXVkaW8vJyArIGFGW2l0ZW1dLnJlbGF0ZWRbaV1dID0gc3VwcG9ydFtpdGVtXTtcclxuICAgICAgICAgICAgc20yLmh0bWw1W2FGW2l0ZW1dLnJlbGF0ZWRbaV1dID0gc3VwcG9ydFtpdGVtXTtcclxuICAgICAgICAgICAgc20yLmZsYXNoW2FGW2l0ZW1dLnJlbGF0ZWRbaV1dID0gc3VwcG9ydFtpdGVtXTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc3VwcG9ydC5jYW5QbGF5VHlwZSA9IChhID8gY3AgOiBudWxsKTtcclxuICAgIHNtMi5odG1sNSA9IG1peGluKHNtMi5odG1sNSwgc3VwcG9ydCk7XHJcblxyXG4gICAgc20yLmh0bWw1LnVzaW5nRmxhc2ggPSBmZWF0dXJlQ2hlY2soKTtcclxuICAgIG5lZWRzRmxhc2ggPSBzbTIuaHRtbDUudXNpbmdGbGFzaDtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgc3RyaW5ncyA9IHtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIG5vdFJlYWR5OiAnVW5hdmFpbGFibGUgLSB3YWl0IHVudGlsIG9ucmVhZHkoKSBoYXMgZmlyZWQuJyxcclxuICAgIG5vdE9LOiAnQXVkaW8gc3VwcG9ydCBpcyBub3QgYXZhaWxhYmxlLicsXHJcbiAgICBkb21FcnJvcjogc20gKyAnZXhjZXB0aW9uIGNhdWdodCB3aGlsZSBhcHBlbmRpbmcgU1dGIHRvIERPTS4nLFxyXG4gICAgc3BjV21vZGU6ICdSZW1vdmluZyB3bW9kZSwgcHJldmVudGluZyBrbm93biBTV0YgbG9hZGluZyBpc3N1ZShzKScsXHJcbiAgICBzd2Y0MDQ6IHNtYyArICdWZXJpZnkgdGhhdCAlcyBpcyBhIHZhbGlkIHBhdGguJyxcclxuICAgIHRyeURlYnVnOiAnVHJ5ICcgKyBzbSArICcuZGVidWdGbGFzaCA9IHRydWUgZm9yIG1vcmUgc2VjdXJpdHkgZGV0YWlscyAob3V0cHV0IGdvZXMgdG8gU1dGLiknLFxyXG4gICAgY2hlY2tTV0Y6ICdTZWUgU1dGIG91dHB1dCBmb3IgbW9yZSBkZWJ1ZyBpbmZvLicsXHJcbiAgICBsb2NhbEZhaWw6IHNtYyArICdOb24tSFRUUCBwYWdlICgnICsgZG9jLmxvY2F0aW9uLnByb3RvY29sICsgJyBVUkw/KSBSZXZpZXcgRmxhc2ggcGxheWVyIHNlY3VyaXR5IHNldHRpbmdzIGZvciB0aGlzIHNwZWNpYWwgY2FzZTpcXG5odHRwOi8vd3d3Lm1hY3JvbWVkaWEuY29tL3N1cHBvcnQvZG9jdW1lbnRhdGlvbi9lbi9mbGFzaHBsYXllci9oZWxwL3NldHRpbmdzX21hbmFnZXIwNC5odG1sXFxuTWF5IG5lZWQgdG8gYWRkL2FsbG93IHBhdGgsIGVnLiBjOi9zbTIvIG9yIC91c2Vycy9tZS9zbTIvJyxcclxuICAgIHdhaXRGb2N1czogc21jICsgJ1NwZWNpYWwgY2FzZTogV2FpdGluZyBmb3IgU1dGIHRvIGxvYWQgd2l0aCB3aW5kb3cgZm9jdXMuLi4nLFxyXG4gICAgd2FpdEZvcmV2ZXI6IHNtYyArICdXYWl0aW5nIGluZGVmaW5pdGVseSBmb3IgRmxhc2ggKHdpbGwgcmVjb3ZlciBpZiB1bmJsb2NrZWQpLi4uJyxcclxuICAgIHdhaXRTV0Y6IHNtYyArICdXYWl0aW5nIGZvciAxMDAlIFNXRiBsb2FkLi4uJyxcclxuICAgIG5lZWRGdW5jdGlvbjogc21jICsgJ0Z1bmN0aW9uIG9iamVjdCBleHBlY3RlZCBmb3IgJXMnLFxyXG4gICAgYmFkSUQ6ICdTb3VuZCBJRCBcIiVzXCIgc2hvdWxkIGJlIGEgc3RyaW5nLCBzdGFydGluZyB3aXRoIGEgbm9uLW51bWVyaWMgY2hhcmFjdGVyJyxcclxuICAgIGN1cnJlbnRPYmo6IHNtYyArICdfZGVidWcoKTogQ3VycmVudCBzb3VuZCBvYmplY3RzJyxcclxuICAgIHdhaXRPbmxvYWQ6IHNtYyArICdXYWl0aW5nIGZvciB3aW5kb3cub25sb2FkKCknLFxyXG4gICAgZG9jTG9hZGVkOiBzbWMgKyAnRG9jdW1lbnQgYWxyZWFkeSBsb2FkZWQnLFxyXG4gICAgb25sb2FkOiBzbWMgKyAnaW5pdENvbXBsZXRlKCk6IGNhbGxpbmcgc291bmRNYW5hZ2VyLm9ubG9hZCgpJyxcclxuICAgIG9ubG9hZE9LOiBzbSArICcub25sb2FkKCkgY29tcGxldGUnLFxyXG4gICAgZGlkSW5pdDogc21jICsgJ2luaXQoKTogQWxyZWFkeSBjYWxsZWQ/JyxcclxuICAgIHNlY05vdGU6ICdGbGFzaCBzZWN1cml0eSBub3RlOiBOZXR3b3JrL2ludGVybmV0IFVSTHMgd2lsbCBub3QgbG9hZCBkdWUgdG8gc2VjdXJpdHkgcmVzdHJpY3Rpb25zLiBBY2Nlc3MgY2FuIGJlIGNvbmZpZ3VyZWQgdmlhIEZsYXNoIFBsYXllciBHbG9iYWwgU2VjdXJpdHkgU2V0dGluZ3MgUGFnZTogaHR0cDovL3d3dy5tYWNyb21lZGlhLmNvbS9zdXBwb3J0L2RvY3VtZW50YXRpb24vZW4vZmxhc2hwbGF5ZXIvaGVscC9zZXR0aW5nc19tYW5hZ2VyMDQuaHRtbCcsXHJcbiAgICBiYWRSZW1vdmU6IHNtYyArICdGYWlsZWQgdG8gcmVtb3ZlIEZsYXNoIG5vZGUuJyxcclxuICAgIHNodXRkb3duOiBzbSArICcuZGlzYWJsZSgpOiBTaHV0dGluZyBkb3duJyxcclxuICAgIHF1ZXVlOiBzbWMgKyAnUXVldWVpbmcgJXMgaGFuZGxlcicsXHJcbiAgICBzbUVycm9yOiAnU01Tb3VuZC5sb2FkKCk6IEV4Y2VwdGlvbjogSlMtRmxhc2ggY29tbXVuaWNhdGlvbiBmYWlsZWQsIG9yIEpTIGVycm9yLicsXHJcbiAgICBmYlRpbWVvdXQ6ICdObyBmbGFzaCByZXNwb25zZSwgYXBwbHlpbmcgLicgKyBzd2ZDU1Muc3dmVGltZWRvdXQgKyAnIENTUy4uLicsXHJcbiAgICBmYkxvYWRlZDogJ0ZsYXNoIGxvYWRlZCcsXHJcbiAgICBmYkhhbmRsZXI6IHNtYyArICdmbGFzaEJsb2NrSGFuZGxlcigpJyxcclxuICAgIG1hblVSTDogJ1NNU291bmQubG9hZCgpOiBVc2luZyBtYW51YWxseS1hc3NpZ25lZCBVUkwnLFxyXG4gICAgb25VUkw6IHNtICsgJy5sb2FkKCk6IGN1cnJlbnQgVVJMIGFscmVhZHkgYXNzaWduZWQuJyxcclxuICAgIGJhZEZWOiBzbSArICcuZmxhc2hWZXJzaW9uIG11c3QgYmUgOCBvciA5LiBcIiVzXCIgaXMgaW52YWxpZC4gUmV2ZXJ0aW5nIHRvICVzLicsXHJcbiAgICBhczJsb29wOiAnTm90ZTogU2V0dGluZyBzdHJlYW06ZmFsc2Ugc28gbG9vcGluZyBjYW4gd29yayAoZmxhc2ggOCBsaW1pdGF0aW9uKScsXHJcbiAgICBub05TTG9vcDogJ05vdGU6IExvb3Bpbmcgbm90IGltcGxlbWVudGVkIGZvciBNb3ZpZVN0YXIgZm9ybWF0cycsXHJcbiAgICBuZWVkZmw5OiAnTm90ZTogU3dpdGNoaW5nIHRvIGZsYXNoIDksIHJlcXVpcmVkIGZvciBNUDQgZm9ybWF0cy4nLFxyXG4gICAgbWZUaW1lb3V0OiAnU2V0dGluZyBmbGFzaExvYWRUaW1lb3V0ID0gMCAoaW5maW5pdGUpIGZvciBvZmYtc2NyZWVuLCBtb2JpbGUgZmxhc2ggY2FzZScsXHJcbiAgICBuZWVkRmxhc2g6IHNtYyArICdGYXRhbCBlcnJvcjogRmxhc2ggaXMgbmVlZGVkIHRvIHBsYXkgc29tZSByZXF1aXJlZCBmb3JtYXRzLCBidXQgaXMgbm90IGF2YWlsYWJsZS4nLFxyXG4gICAgZ290Rm9jdXM6IHNtYyArICdHb3Qgd2luZG93IGZvY3VzLicsXHJcbiAgICBwb2xpY3k6ICdFbmFibGluZyB1c2VQb2xpY3lGaWxlIGZvciBkYXRhIGFjY2VzcycsXHJcbiAgICBzZXR1cDogc20gKyAnLnNldHVwKCk6IGFsbG93ZWQgcGFyYW1ldGVyczogJXMnLFxyXG4gICAgc2V0dXBFcnJvcjogc20gKyAnLnNldHVwKCk6IFwiJXNcIiBjYW5ub3QgYmUgYXNzaWduZWQgd2l0aCB0aGlzIG1ldGhvZC4nLFxyXG4gICAgc2V0dXBVbmRlZjogc20gKyAnLnNldHVwKCk6IENvdWxkIG5vdCBmaW5kIG9wdGlvbiBcIiVzXCInLFxyXG4gICAgc2V0dXBMYXRlOiBzbSArICcuc2V0dXAoKTogdXJsLCBmbGFzaFZlcnNpb24gYW5kIGh0bWw1VGVzdCBwcm9wZXJ0eSBjaGFuZ2VzIHdpbGwgbm90IHRha2UgZWZmZWN0IHVudGlsIHJlYm9vdCgpLicsXHJcbiAgICBub1VSTDogc21jICsgJ0ZsYXNoIFVSTCByZXF1aXJlZC4gQ2FsbCBzb3VuZE1hbmFnZXIuc2V0dXAoe3VybDouLi59KSB0byBnZXQgc3RhcnRlZC4nLFxyXG4gICAgc20yTG9hZGVkOiAnU291bmRNYW5hZ2VyIDI6IFJlYWR5LiAnICsgU3RyaW5nLmZyb21DaGFyQ29kZSgxMDAwMyksXHJcbiAgICByZXNldDogc20gKyAnLnJlc2V0KCk6IFJlbW92aW5nIGV2ZW50IGNhbGxiYWNrcycsXHJcbiAgICBtb2JpbGVVQTogJ01vYmlsZSBVQSBkZXRlY3RlZCwgcHJlZmVycmluZyBIVE1MNSBieSBkZWZhdWx0LicsXHJcbiAgICBnbG9iYWxIVE1MNTogJ1VzaW5nIHNpbmdsZXRvbiBIVE1MNSBBdWRpbygpIHBhdHRlcm4gZm9yIHRoaXMgZGV2aWNlLicsXHJcbiAgICBpZ25vcmVNb2JpbGU6ICdJZ25vcmluZyBtb2JpbGUgcmVzdHJpY3Rpb25zIGZvciB0aGlzIGRldmljZS4nXHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIHN0ciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIGludGVybmFsIHN0cmluZyByZXBsYWNlIGhlbHBlci5cclxuICAgIC8vIGFyZ3VtZW50czogbyBbLGl0ZW1zIHRvIHJlcGxhY2VdXHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICB2YXIgYXJncyxcclxuICAgICAgICBpLCBqLCBvLFxyXG4gICAgICAgIHNzdHI7XHJcblxyXG4gICAgLy8gcmVhbCBhcnJheSwgcGxlYXNlXHJcbiAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xyXG5cclxuICAgIC8vIGZpcnN0IGFyZ3VtZW50XHJcbiAgICBvID0gYXJncy5zaGlmdCgpO1xyXG5cclxuICAgIHNzdHIgPSAoc3RyaW5ncyAmJiBzdHJpbmdzW29dID8gc3RyaW5nc1tvXSA6ICcnKTtcclxuXHJcbiAgICBpZiAoc3N0ciAmJiBhcmdzICYmIGFyZ3MubGVuZ3RoKSB7XHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSBhcmdzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIHNzdHIgPSBzc3RyLnJlcGxhY2UoJyVzJywgYXJnc1tpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3N0cjtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgbG9vcEZpeCA9IGZ1bmN0aW9uKHNPcHQpIHtcclxuXHJcbiAgICAvLyBmbGFzaCA4IHJlcXVpcmVzIHN0cmVhbSA9IGZhbHNlIGZvciBsb29waW5nIHRvIHdvcmtcclxuICAgIGlmIChmViA9PT0gOCAmJiBzT3B0Lmxvb3BzID4gMSAmJiBzT3B0LnN0cmVhbSkge1xyXG4gICAgICBfd0RTKCdhczJsb29wJyk7XHJcbiAgICAgIHNPcHQuc3RyZWFtID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNPcHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIHBvbGljeUZpeCA9IGZ1bmN0aW9uKHNPcHQsIHNQcmUpIHtcclxuXHJcbiAgICBpZiAoc09wdCAmJiAhc09wdC51c2VQb2xpY3lGaWxlICYmIChzT3B0Lm9uaWQzIHx8IHNPcHQudXNlUGVha0RhdGEgfHwgc09wdC51c2VXYXZlZm9ybURhdGEgfHwgc09wdC51c2VFUURhdGEpKSB7XHJcbiAgICAgIHNtMi5fd0QoKHNQcmUgfHwgJycpICsgc3RyKCdwb2xpY3knKSk7XHJcbiAgICAgIHNPcHQudXNlUG9saWN5RmlsZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNPcHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIGNvbXBsYWluID0gZnVuY3Rpb24oc01zZykge1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKGhhc0NvbnNvbGUgJiYgY29uc29sZS53YXJuICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihzTXNnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNtMi5fd0Qoc01zZyk7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIGRvTm90aGluZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZGlzYWJsZU9iamVjdCA9IGZ1bmN0aW9uKG8pIHtcclxuXHJcbiAgICB2YXIgb1Byb3A7XHJcblxyXG4gICAgZm9yIChvUHJvcCBpbiBvKSB7XHJcbiAgICAgIGlmIChvLmhhc093blByb3BlcnR5KG9Qcm9wKSAmJiB0eXBlb2Ygb1tvUHJvcF0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBvW29Qcm9wXSA9IGRvTm90aGluZztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9Qcm9wID0gbnVsbDtcclxuXHJcbiAgfTtcclxuXHJcbiAgZmFpbFNhZmVseSA9IGZ1bmN0aW9uKGJOb0Rpc2FibGUpIHtcclxuXHJcbiAgICAvLyBnZW5lcmFsIGZhaWx1cmUgZXhjZXB0aW9uIGhhbmRsZXJcclxuXHJcbiAgICBpZiAoYk5vRGlzYWJsZSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBiTm9EaXNhYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRpc2FibGVkIHx8IGJOb0Rpc2FibGUpIHtcclxuICAgICAgc20yLmRpc2FibGUoYk5vRGlzYWJsZSk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIG5vcm1hbGl6ZU1vdmllVVJMID0gZnVuY3Rpb24oc21VUkwpIHtcclxuXHJcbiAgICB2YXIgdXJsUGFyYW1zID0gbnVsbCwgdXJsO1xyXG5cclxuICAgIGlmIChzbVVSTCkge1xyXG4gICAgICBcclxuICAgICAgaWYgKHNtVVJMLm1hdGNoKC9cXC5zd2YoXFw/LiopPyQvaSkpIHtcclxuICAgICAgXHJcbiAgICAgICAgdXJsUGFyYW1zID0gc21VUkwuc3Vic3RyKHNtVVJMLnRvTG93ZXJDYXNlKCkubGFzdEluZGV4T2YoJy5zd2Y/JykgKyA0KTtcclxuICAgICAgXHJcbiAgICAgICAgaWYgKHVybFBhcmFtcykge1xyXG4gICAgICAgICAgLy8gYXNzdW1lIHVzZXIga25vd3Mgd2hhdCB0aGV5J3JlIGRvaW5nXHJcbiAgICAgICAgICByZXR1cm4gc21VUkw7XHJcbiAgICAgICAgfVxyXG4gICAgICBcclxuICAgICAgfSBlbHNlIGlmIChzbVVSTC5sYXN0SW5kZXhPZignLycpICE9PSBzbVVSTC5sZW5ndGggLSAxKSB7XHJcbiAgICAgIFxyXG4gICAgICAgIC8vIGFwcGVuZCB0cmFpbGluZyBzbGFzaCwgaWYgbmVlZGVkXHJcbiAgICAgICAgc21VUkwgKz0gJy8nO1xyXG4gICAgICBcclxuICAgICAgfVxyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgdXJsID0gKHNtVVJMICYmIHNtVVJMLmxhc3RJbmRleE9mKCcvJykgIT09IC0gMSA/IHNtVVJMLnN1YnN0cigwLCBzbVVSTC5sYXN0SW5kZXhPZignLycpICsgMSkgOiAnLi8nKSArIHNtMi5tb3ZpZVVSTDtcclxuXHJcbiAgICBpZiAoc20yLm5vU1dGQ2FjaGUpIHtcclxuICAgICAgdXJsICs9ICgnP3RzPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHVybDtcclxuXHJcbiAgfTtcclxuXHJcbiAgc2V0VmVyc2lvbkluZm8gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBzaG9ydC1oYW5kIGZvciBpbnRlcm5hbCB1c2VcclxuXHJcbiAgICBmViA9IHBhcnNlSW50KHNtMi5mbGFzaFZlcnNpb24sIDEwKTtcclxuXHJcbiAgICBpZiAoZlYgIT09IDggJiYgZlYgIT09IDkpIHtcclxuICAgICAgc20yLl93RChzdHIoJ2JhZEZWJywgZlYsIGRlZmF1bHRGbGFzaFZlcnNpb24pKTtcclxuICAgICAgc20yLmZsYXNoVmVyc2lvbiA9IGZWID0gZGVmYXVsdEZsYXNoVmVyc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZWJ1ZyBmbGFzaCBtb3ZpZSwgaWYgYXBwbGljYWJsZVxyXG5cclxuICAgIHZhciBpc0RlYnVnID0gKHNtMi5kZWJ1Z01vZGUgfHwgc20yLmRlYnVnRmxhc2ggPyAnX2RlYnVnLnN3ZicgOiAnLnN3ZicpO1xyXG5cclxuICAgIGlmIChzbTIudXNlSFRNTDVBdWRpbyAmJiAhc20yLmh0bWw1T25seSAmJiBzbTIuYXVkaW9Gb3JtYXRzLm1wNC5yZXF1aXJlZCAmJiBmViA8IDkpIHtcclxuICAgICAgc20yLl93RChzdHIoJ25lZWRmbDknKSk7XHJcbiAgICAgIHNtMi5mbGFzaFZlcnNpb24gPSBmViA9IDk7XHJcbiAgICB9XHJcblxyXG4gICAgc20yLnZlcnNpb24gPSBzbTIudmVyc2lvbk51bWJlciArIChzbTIuaHRtbDVPbmx5ID8gJyAoSFRNTDUtb25seSBtb2RlKScgOiAoZlYgPT09IDkgPyAnIChBUzMvRmxhc2ggOSknIDogJyAoQVMyL0ZsYXNoIDgpJykpO1xyXG5cclxuICAgIC8vIHNldCB1cCBkZWZhdWx0IG9wdGlvbnNcclxuICAgIGlmIChmViA+IDgpIHtcclxuICAgIFxyXG4gICAgICAvLyArZmxhc2ggOSBiYXNlIG9wdGlvbnNcclxuICAgICAgc20yLmRlZmF1bHRPcHRpb25zID0gbWl4aW4oc20yLmRlZmF1bHRPcHRpb25zLCBzbTIuZmxhc2g5T3B0aW9ucyk7XHJcbiAgICAgIHNtMi5mZWF0dXJlcy5idWZmZXJpbmcgPSB0cnVlO1xyXG4gICAgXHJcbiAgICAgIC8vICttb3ZpZXN0YXIgc3VwcG9ydFxyXG4gICAgICBzbTIuZGVmYXVsdE9wdGlvbnMgPSBtaXhpbihzbTIuZGVmYXVsdE9wdGlvbnMsIHNtMi5tb3ZpZVN0YXJPcHRpb25zKTtcclxuICAgICAgc20yLmZpbGVQYXR0ZXJucy5mbGFzaDkgPSBuZXcgUmVnRXhwKCdcXFxcLihtcDN8JyArIG5ldFN0cmVhbVR5cGVzLmpvaW4oJ3wnKSArICcpKFxcXFw/LiopPyQnLCAnaScpO1xyXG4gICAgICBzbTIuZmVhdHVyZXMubW92aWVTdGFyID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgfSBlbHNlIHtcclxuICAgIFxyXG4gICAgICBzbTIuZmVhdHVyZXMubW92aWVTdGFyID0gZmFsc2U7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICAvLyByZWdFeHAgZm9yIGZsYXNoIGNhblBsYXkoKSwgZXRjLlxyXG4gICAgc20yLmZpbGVQYXR0ZXJuID0gc20yLmZpbGVQYXR0ZXJuc1soZlYgIT09IDggPyAnZmxhc2g5JyA6ICdmbGFzaDgnKV07XHJcblxyXG4gICAgLy8gaWYgYXBwbGljYWJsZSwgdXNlIF9kZWJ1ZyB2ZXJzaW9ucyBvZiBTV0ZzXHJcbiAgICBzbTIubW92aWVVUkwgPSAoZlYgPT09IDggPyAnc291bmRtYW5hZ2VyMi5zd2YnIDogJ3NvdW5kbWFuYWdlcjJfZmxhc2g5LnN3ZicpLnJlcGxhY2UoJy5zd2YnLCBpc0RlYnVnKTtcclxuXHJcbiAgICBzbTIuZmVhdHVyZXMucGVha0RhdGEgPSBzbTIuZmVhdHVyZXMud2F2ZWZvcm1EYXRhID0gc20yLmZlYXR1cmVzLmVxRGF0YSA9IChmViA+IDgpO1xyXG5cclxuICB9O1xyXG5cclxuICBzZXRQb2xsaW5nID0gZnVuY3Rpb24oYlBvbGxpbmcsIGJIaWdoUGVyZm9ybWFuY2UpIHtcclxuXHJcbiAgICBpZiAoIWZsYXNoKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBmbGFzaC5fc2V0UG9sbGluZyhiUG9sbGluZywgYkhpZ2hQZXJmb3JtYW5jZSk7XHJcblxyXG4gIH07XHJcblxyXG4gIGluaXREZWJ1ZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIHN0YXJ0cyBkZWJ1ZyBtb2RlLCBjcmVhdGluZyBvdXRwdXQgPGRpdj4gZm9yIFVBcyB3aXRob3V0IGNvbnNvbGUgb2JqZWN0XHJcblxyXG4gICAgLy8gYWxsb3cgZm9yY2Ugb2YgZGVidWcgbW9kZSB2aWEgVVJMXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmIChzbTIuZGVidWdVUkxQYXJhbS50ZXN0KHdsKSkge1xyXG4gICAgICBzbTIuc2V0dXBPcHRpb25zLmRlYnVnTW9kZSA9IHNtMi5kZWJ1Z01vZGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpZChzbTIuZGVidWdJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBvRCwgb0RlYnVnLCBvVGFyZ2V0LCBvVG9nZ2xlLCB0bXA7XHJcblxyXG4gICAgaWYgKHNtMi5kZWJ1Z01vZGUgJiYgIWlkKHNtMi5kZWJ1Z0lEKSAmJiAoIWhhc0NvbnNvbGUgfHwgIXNtMi51c2VDb25zb2xlIHx8ICFzbTIuY29uc29sZU9ubHkpKSB7XHJcblxyXG4gICAgICBvRCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgb0QuaWQgPSBzbTIuZGVidWdJRCArICctdG9nZ2xlJztcclxuXHJcbiAgICAgIG9Ub2dnbGUgPSB7XHJcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcclxuICAgICAgICAnYm90dG9tJzogJzBweCcsXHJcbiAgICAgICAgJ3JpZ2h0JzogJzBweCcsXHJcbiAgICAgICAgJ3dpZHRoJzogJzEuMmVtJyxcclxuICAgICAgICAnaGVpZ2h0JzogJzEuMmVtJyxcclxuICAgICAgICAnbGluZUhlaWdodCc6ICcxLjJlbScsXHJcbiAgICAgICAgJ21hcmdpbic6ICcycHgnLFxyXG4gICAgICAgICd0ZXh0QWxpZ24nOiAnY2VudGVyJyxcclxuICAgICAgICAnYm9yZGVyJzogJzFweCBzb2xpZCAjOTk5JyxcclxuICAgICAgICAnY3Vyc29yJzogJ3BvaW50ZXInLFxyXG4gICAgICAgICdiYWNrZ3JvdW5kJzogJyNmZmYnLFxyXG4gICAgICAgICdjb2xvcic6ICcjMzMzJyxcclxuICAgICAgICAnekluZGV4JzogMTAwMDFcclxuICAgICAgfTtcclxuXHJcbiAgICAgIG9ELmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZSgnLScpKTtcclxuICAgICAgb0Qub25jbGljayA9IHRvZ2dsZURlYnVnO1xyXG4gICAgICBvRC50aXRsZSA9ICdUb2dnbGUgU00yIGRlYnVnIGNvbnNvbGUnO1xyXG5cclxuICAgICAgaWYgKHVhLm1hdGNoKC9tc2llIDYvaSkpIHtcclxuICAgICAgICBvRC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgb0Quc3R5bGUuY3Vyc29yID0gJ2hhbmQnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHRtcCBpbiBvVG9nZ2xlKSB7XHJcbiAgICAgICAgaWYgKG9Ub2dnbGUuaGFzT3duUHJvcGVydHkodG1wKSkge1xyXG4gICAgICAgICAgb0Quc3R5bGVbdG1wXSA9IG9Ub2dnbGVbdG1wXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9EZWJ1ZyA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgb0RlYnVnLmlkID0gc20yLmRlYnVnSUQ7XHJcbiAgICAgIG9EZWJ1Zy5zdHlsZS5kaXNwbGF5ID0gKHNtMi5kZWJ1Z01vZGUgPyAnYmxvY2snIDogJ25vbmUnKTtcclxuXHJcbiAgICAgIGlmIChzbTIuZGVidWdNb2RlICYmICFpZChvRC5pZCkpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgb1RhcmdldCA9IGdldERvY3VtZW50KCk7XHJcbiAgICAgICAgICBvVGFyZ2V0LmFwcGVuZENoaWxkKG9EKTtcclxuICAgICAgICB9IGNhdGNoKGUyKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKCdkb21FcnJvcicpICsgJyBcXG4nICsgZTIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9UYXJnZXQuYXBwZW5kQ2hpbGQob0RlYnVnKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBvVGFyZ2V0ID0gbnVsbDtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgaWRDaGVjayA9IHRoaXMuZ2V0U291bmRCeUlkO1xyXG5cclxuICAvLyA8ZD5cclxuICBfd0RTID0gZnVuY3Rpb24obywgZXJyb3JMZXZlbCkge1xyXG5cclxuICAgIHJldHVybiAoIW8gPyAnJyA6IHNtMi5fd0Qoc3RyKG8pLCBlcnJvckxldmVsKSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHRvZ2dsZURlYnVnID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIG8gPSBpZChzbTIuZGVidWdJRCksXHJcbiAgICBvVCA9IGlkKHNtMi5kZWJ1Z0lEICsgJy10b2dnbGUnKTtcclxuXHJcbiAgICBpZiAoIW8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkZWJ1Z09wZW4pIHtcclxuICAgICAgLy8gbWluaW1pemVcclxuICAgICAgb1QuaW5uZXJIVE1MID0gJysnO1xyXG4gICAgICBvLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvVC5pbm5lckhUTUwgPSAnLSc7XHJcbiAgICAgIG8uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB9XHJcblxyXG4gICAgZGVidWdPcGVuID0gIWRlYnVnT3BlbjtcclxuXHJcbiAgfTtcclxuXHJcbiAgZGVidWdUUyA9IGZ1bmN0aW9uKHNFdmVudFR5cGUsIGJTdWNjZXNzLCBzTWVzc2FnZSkge1xyXG5cclxuICAgIC8vIHRyb3VibGVzaG9vdGVyIGRlYnVnIGhvb2tzXHJcblxyXG4gICAgaWYgKHdpbmRvdy5zbTJEZWJ1Z2dlciAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHNtMkRlYnVnZ2VyLmhhbmRsZUV2ZW50KHNFdmVudFR5cGUsIGJTdWNjZXNzLCBzTWVzc2FnZSk7XHJcbiAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgIC8vIG9oIHdlbGxcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuICAvLyA8L2Q+XHJcblxyXG4gIGdldFNXRkNTUyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBjc3MgPSBbXTtcclxuXHJcbiAgICBpZiAoc20yLmRlYnVnTW9kZSkge1xyXG4gICAgICBjc3MucHVzaChzd2ZDU1Muc20yRGVidWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICBjc3MucHVzaChzd2ZDU1MuZmxhc2hEZWJ1Zyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi51c2VIaWdoUGVyZm9ybWFuY2UpIHtcclxuICAgICAgY3NzLnB1c2goc3dmQ1NTLmhpZ2hQZXJmKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY3NzLmpvaW4oJyAnKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZmxhc2hCbG9ja0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyAqcG9zc2libGUqIGZsYXNoIGJsb2NrIHNpdHVhdGlvbi5cclxuXHJcbiAgICB2YXIgbmFtZSA9IHN0cignZmJIYW5kbGVyJyksXHJcbiAgICAgICAgcCA9IHNtMi5nZXRNb3ZpZVBlcmNlbnQoKSxcclxuICAgICAgICBjc3MgPSBzd2ZDU1MsXHJcbiAgICAgICAgZXJyb3IgPSB7XHJcbiAgICAgICAgICB0eXBlOidGTEFTSEJMT0NLJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgLy8gbm8gZmxhc2gsIG9yIHVudXNlZFxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzbTIub2soKSkge1xyXG5cclxuICAgICAgaWYgKG5lZWRzRmxhc2gpIHtcclxuICAgICAgICAvLyBtYWtlIHRoZSBtb3ZpZSBtb3JlIHZpc2libGUsIHNvIHVzZXIgY2FuIGZpeFxyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gZ2V0U1dGQ1NTKCkgKyAnICcgKyBjc3Muc3dmRGVmYXVsdCArICcgJyArIChwID09PSBudWxsID8gY3NzLnN3ZlRpbWVkb3V0IDogY3NzLnN3ZkVycm9yKTtcclxuICAgICAgICBzbTIuX3dEKG5hbWUgKyAnOiAnICsgc3RyKCdmYlRpbWVvdXQnKSArIChwID8gJyAoJyArIHN0cignZmJMb2FkZWQnKSArICcpJyA6ICcnKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5kaWRGbGFzaEJsb2NrID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIGZpcmUgb25yZWFkeSgpLCBjb21wbGFpbiBsaWdodGx5XHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cyh7XHJcbiAgICAgICAgdHlwZTogJ29udGltZW91dCcsXHJcbiAgICAgICAgaWdub3JlSW5pdDogdHJ1ZSxcclxuICAgICAgICBlcnJvcjogZXJyb3JcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjYXRjaEVycm9yKGVycm9yKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgLy8gU00yIGxvYWRlZCBPSyAob3IgcmVjb3ZlcmVkKVxyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmIChzbTIuZGlkRmxhc2hCbG9jaykge1xyXG4gICAgICAgIHNtMi5fd0QobmFtZSArICc6IFVuYmxvY2tlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGlmIChzbTIub01DKSB7XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSBbZ2V0U1dGQ1NTKCksIGNzcy5zd2ZEZWZhdWx0LCBjc3Muc3dmTG9hZGVkICsgKHNtMi5kaWRGbGFzaEJsb2NrID8gJyAnICsgY3NzLnN3ZlVuYmxvY2tlZCA6ICcnKV0uam9pbignICcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBhZGRPbkV2ZW50ID0gZnVuY3Rpb24oc1R5cGUsIG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgIGlmIChvbl9xdWV1ZVtzVHlwZV0gPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgb25fcXVldWVbc1R5cGVdID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgb25fcXVldWVbc1R5cGVdLnB1c2goe1xyXG4gICAgICAnbWV0aG9kJzogb01ldGhvZCxcclxuICAgICAgJ3Njb3BlJzogKG9TY29wZSB8fCBudWxsKSxcclxuICAgICAgJ2ZpcmVkJzogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICB9O1xyXG5cclxuICBwcm9jZXNzT25FdmVudHMgPSBmdW5jdGlvbihvT3B0aW9ucykge1xyXG5cclxuICAgIC8vIGlmIHVuc3BlY2lmaWVkLCBhc3N1bWUgT0svZXJyb3JcclxuXHJcbiAgICBpZiAoIW9PcHRpb25zKSB7XHJcbiAgICAgIG9PcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IChzbTIub2soKSA/ICdvbnJlYWR5JyA6ICdvbnRpbWVvdXQnKVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZGlkSW5pdCAmJiBvT3B0aW9ucyAmJiAhb09wdGlvbnMuaWdub3JlSW5pdCkge1xyXG4gICAgICAvLyBub3QgcmVhZHkgeWV0LlxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9PcHRpb25zLnR5cGUgPT09ICdvbnRpbWVvdXQnICYmIChzbTIub2soKSB8fCAoZGlzYWJsZWQgJiYgIW9PcHRpb25zLmlnbm9yZUluaXQpKSkge1xyXG4gICAgICAvLyBpbnZhbGlkIGNhc2VcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzdGF0dXMgPSB7XHJcbiAgICAgICAgICBzdWNjZXNzOiAob09wdGlvbnMgJiYgb09wdGlvbnMuaWdub3JlSW5pdCA/IHNtMi5vaygpIDogIWRpc2FibGVkKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIHF1ZXVlIHNwZWNpZmllZCBieSB0eXBlLCBvciBub25lXHJcbiAgICAgICAgc3JjUXVldWUgPSAob09wdGlvbnMgJiYgb09wdGlvbnMudHlwZSA/IG9uX3F1ZXVlW29PcHRpb25zLnR5cGVdIHx8IFtdIDogW10pLFxyXG5cclxuICAgICAgICBxdWV1ZSA9IFtdLCBpLCBqLFxyXG4gICAgICAgIGFyZ3MgPSBbc3RhdHVzXSxcclxuICAgICAgICBjYW5SZXRyeSA9IChuZWVkc0ZsYXNoICYmICFzbTIub2soKSk7XHJcblxyXG4gICAgaWYgKG9PcHRpb25zLmVycm9yKSB7XHJcbiAgICAgIGFyZ3NbMF0uZXJyb3IgPSBvT3B0aW9ucy5lcnJvcjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGkgPSAwLCBqID0gc3JjUXVldWUubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgIGlmIChzcmNRdWV1ZVtpXS5maXJlZCAhPT0gdHJ1ZSkge1xyXG4gICAgICAgIHF1ZXVlLnB1c2goc3JjUXVldWVbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgXHJcbiAgICAgIC8vIHNtMi5fd0Qoc20gKyAnOiBGaXJpbmcgJyArIHF1ZXVlLmxlbmd0aCArICcgJyArIG9PcHRpb25zLnR5cGUgKyAnKCkgaXRlbScgKyAocXVldWUubGVuZ3RoID09PSAxID8gJycgOiAncycpKTsgXHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSBxdWV1ZS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgXHJcbiAgICAgICAgaWYgKHF1ZXVlW2ldLnNjb3BlKSB7XHJcbiAgICAgICAgICBxdWV1ZVtpXS5tZXRob2QuYXBwbHkocXVldWVbaV0uc2NvcGUsIGFyZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBxdWV1ZVtpXS5tZXRob2QuYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICBcclxuICAgICAgICBpZiAoIWNhblJldHJ5KSB7XHJcbiAgICAgICAgICAvLyB1c2VGbGFzaEJsb2NrIGFuZCBTV0YgdGltZW91dCBjYXNlIGRvZXNuJ3QgY291bnQgaGVyZS5cclxuICAgICAgICAgIHF1ZXVlW2ldLmZpcmVkID0gdHJ1ZTtcclxuICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICBcclxuICAgICAgfVxyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGluaXRVc2VyT25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2spIHtcclxuICAgICAgICBmbGFzaEJsb2NrSGFuZGxlcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwcm9jZXNzT25FdmVudHMoKTtcclxuXHJcbiAgICAgIC8vIGNhbGwgdXNlci1kZWZpbmVkIFwib25sb2FkXCIsIHNjb3BlZCB0byB3aW5kb3dcclxuXHJcbiAgICAgIGlmICh0eXBlb2Ygc20yLm9ubG9hZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIF93RFMoJ29ubG9hZCcsIDEpO1xyXG4gICAgICAgIHNtMi5vbmxvYWQuYXBwbHkod2luZG93KTtcclxuICAgICAgICBfd0RTKCdvbmxvYWRPSycsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc20yLndhaXRGb3JXaW5kb3dMb2FkKSB7XHJcbiAgICAgICAgZXZlbnQuYWRkKHdpbmRvdywgJ2xvYWQnLCBpbml0VXNlck9ubG9hZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCAxKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZGV0ZWN0Rmxhc2ggPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhdCB0aXA6IEZsYXNoIERldGVjdCBsaWJyYXJ5IChCU0QsIChDKSAyMDA3KSBieSBDYXJsIFwiRG9jWWVzXCIgUy4gWWVzdHJhdVxyXG4gICAgICogaHR0cDovL2ZlYXR1cmVibGVuZC5jb20vamF2YXNjcmlwdC1mbGFzaC1kZXRlY3Rpb24tbGlicmFyeS5odG1sIC8gaHR0cDovL2ZlYXR1cmVibGVuZC5jb20vbGljZW5zZS50eHRcclxuICAgICAqL1xyXG5cclxuICAgIGlmIChoYXNGbGFzaCAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAvLyB0aGlzIHdvcmsgaGFzIGFscmVhZHkgYmVlbiBkb25lLlxyXG4gICAgICByZXR1cm4gaGFzRmxhc2g7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhc1BsdWdpbiA9IGZhbHNlLCBuID0gbmF2aWdhdG9yLCBuUCA9IG4ucGx1Z2lucywgb2JqLCB0eXBlLCB0eXBlcywgQVggPSB3aW5kb3cuQWN0aXZlWE9iamVjdDtcclxuXHJcbiAgICBpZiAoblAgJiYgblAubGVuZ3RoKSB7XHJcbiAgICAgIFxyXG4gICAgICB0eXBlID0gJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJztcclxuICAgICAgdHlwZXMgPSBuLm1pbWVUeXBlcztcclxuICAgICAgXHJcbiAgICAgIGlmICh0eXBlcyAmJiB0eXBlc1t0eXBlXSAmJiB0eXBlc1t0eXBlXS5lbmFibGVkUGx1Z2luICYmIHR5cGVzW3R5cGVdLmVuYWJsZWRQbHVnaW4uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICBoYXNQbHVnaW4gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICBcclxuICAgIH0gZWxzZSBpZiAoQVggIT09IF91bmRlZmluZWQgJiYgIXVhLm1hdGNoKC9NU0FwcEhvc3QvaSkpIHtcclxuICAgIFxyXG4gICAgICAvLyBXaW5kb3dzIDggU3RvcmUgQXBwcyAoTVNBcHBIb3N0KSBhcmUgd2VpcmQgKGNvbXBhdGliaWxpdHk/KSBhbmQgd29uJ3QgY29tcGxhaW4gaGVyZSwgYnV0IHdpbGwgYmFyZiBpZiBGbGFzaC9BY3RpdmVYIG9iamVjdCBpcyBhcHBlbmRlZCB0byB0aGUgRE9NLlxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIG9iaiA9IG5ldyBBWCgnU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2gnKTtcclxuICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgLy8gb2ggd2VsbFxyXG4gICAgICAgIG9iaiA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGhhc1BsdWdpbiA9ICghIW9iaik7XHJcbiAgICAgIFxyXG4gICAgICAvLyBjbGVhbnVwLCBiZWNhdXNlIGl0IGlzIEFjdGl2ZVggYWZ0ZXIgYWxsXHJcbiAgICAgIG9iaiA9IG51bGw7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICBoYXNGbGFzaCA9IGhhc1BsdWdpbjtcclxuXHJcbiAgICByZXR1cm4gaGFzUGx1Z2luO1xyXG5cclxuICB9O1xyXG5cclxuZmVhdHVyZUNoZWNrID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGZsYXNoTmVlZGVkLFxyXG4gICAgICAgIGl0ZW0sXHJcbiAgICAgICAgZm9ybWF0cyA9IHNtMi5hdWRpb0Zvcm1hdHMsXHJcbiAgICAgICAgLy8gaVBob25lIDw9IDMuMSBoYXMgYnJva2VuIEhUTUw1IGF1ZGlvKCksIGJ1dCBmaXJtd2FyZSAzLjIgKG9yaWdpbmFsIGlQYWQpICsgaU9TNCB3b3Jrcy5cclxuICAgICAgICBpc1NwZWNpYWwgPSAoaXNfaURldmljZSAmJiAhISh1YS5tYXRjaCgvb3MgKDF8MnwzXzB8M18xKVxccy9pKSkpO1xyXG5cclxuICAgIGlmIChpc1NwZWNpYWwpIHtcclxuXHJcbiAgICAgIC8vIGhhcyBBdWRpbygpLCBidXQgaXMgYnJva2VuOyBsZXQgaXQgbG9hZCBsaW5rcyBkaXJlY3RseS5cclxuICAgICAgc20yLmhhc0hUTUw1ID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBpZ25vcmUgZmxhc2ggY2FzZSwgaG93ZXZlclxyXG4gICAgICBzbTIuaHRtbDVPbmx5ID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIGhpZGUgdGhlIFNXRiwgaWYgcHJlc2VudFxyXG4gICAgICBpZiAoc20yLm9NQykge1xyXG4gICAgICAgIHNtMi5vTUMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBpZiAoc20yLnVzZUhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgICAgaWYgKCFzbTIuaHRtbDUgfHwgIXNtMi5odG1sNS5jYW5QbGF5VHlwZSkge1xyXG4gICAgICAgICAgc20yLl93RCgnU291bmRNYW5hZ2VyOiBObyBIVE1MNSBBdWRpbygpIHN1cHBvcnQgZGV0ZWN0ZWQuJyk7XHJcbiAgICAgICAgICBzbTIuaGFzSFRNTDUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChpc0JhZFNhZmFyaSkge1xyXG4gICAgICAgICAgc20yLl93RChzbWMgKyAnTm90ZTogQnVnZ3kgSFRNTDUgQXVkaW8gaW4gU2FmYXJpIG9uIHRoaXMgT1MgWCByZWxlYXNlLCBzZWUgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTMyMTU5IC0gJyArICghaGFzRmxhc2ggPyAnIHdvdWxkIHVzZSBmbGFzaCBmYWxsYmFjayBmb3IgTVAzL01QNCwgYnV0IG5vbmUgZGV0ZWN0ZWQuJyA6ICd3aWxsIHVzZSBmbGFzaCBmYWxsYmFjayBmb3IgTVAzL01QNCwgaWYgYXZhaWxhYmxlJyksIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIudXNlSFRNTDVBdWRpbyAmJiBzbTIuaGFzSFRNTDUpIHtcclxuXHJcbiAgICAgIC8vIHNvcnQgb3V0IHdoZXRoZXIgZmxhc2ggaXMgb3B0aW9uYWwsIHJlcXVpcmVkIG9yIGNhbiBiZSBpZ25vcmVkLlxyXG5cclxuICAgICAgLy8gaW5ub2NlbnQgdW50aWwgcHJvdmVuIGd1aWx0eS5cclxuICAgICAgY2FuSWdub3JlRmxhc2ggPSB0cnVlO1xyXG5cclxuICAgICAgZm9yIChpdGVtIGluIGZvcm1hdHMpIHtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoZm9ybWF0cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgaWYgKGZvcm1hdHNbaXRlbV0ucmVxdWlyZWQpIHtcclxuICAgICAgICBcclxuICAgICAgICAgICAgaWYgKCFzbTIuaHRtbDUuY2FuUGxheVR5cGUoZm9ybWF0c1tpdGVtXS50eXBlKSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgIC8vIDEwMCUgSFRNTDUgbW9kZSBpcyBub3QgcG9zc2libGUuXHJcbiAgICAgICAgICAgICAgY2FuSWdub3JlRmxhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICBmbGFzaE5lZWRlZCA9IHRydWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc20yLnByZWZlckZsYXNoICYmIChzbTIuZmxhc2hbaXRlbV0gfHwgc20yLmZsYXNoW2Zvcm1hdHNbaXRlbV0udHlwZV0pKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgLy8gZmxhc2ggbWF5IGJlIHJlcXVpcmVkLCBvciBwcmVmZXJyZWQgZm9yIHRoaXMgZm9ybWF0LlxyXG4gICAgICAgICAgICAgIGZsYXNoTmVlZGVkID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNhbml0eSBjaGVjay4uLlxyXG4gICAgaWYgKHNtMi5pZ25vcmVGbGFzaCkge1xyXG4gICAgICBmbGFzaE5lZWRlZCA9IGZhbHNlO1xyXG4gICAgICBjYW5JZ25vcmVGbGFzaCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc20yLmh0bWw1T25seSA9IChzbTIuaGFzSFRNTDUgJiYgc20yLnVzZUhUTUw1QXVkaW8gJiYgIWZsYXNoTmVlZGVkKTtcclxuXHJcbiAgICByZXR1cm4gKCFzbTIuaHRtbDVPbmx5KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgcGFyc2VVUkwgPSBmdW5jdGlvbih1cmwpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVybmFsOiBGaW5kcyBhbmQgcmV0dXJucyB0aGUgZmlyc3QgcGxheWFibGUgVVJMIChvciBmYWlsaW5nIHRoYXQsIHRoZSBmaXJzdCBVUkwuKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmcgb3IgYXJyYXl9IHVybCBBIHNpbmdsZSBVUkwgc3RyaW5nLCBPUiwgYW4gYXJyYXkgb2YgVVJMIHN0cmluZ3Mgb3Ige3VybDonL3BhdGgvdG8vcmVzb3VyY2UnLCB0eXBlOidhdWRpby9tcDMnfSBvYmplY3RzLlxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIGksIGosIHVybFJlc3VsdCA9IDAsIHJlc3VsdDtcclxuXHJcbiAgICBpZiAodXJsIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuXHJcbiAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IGdvb2Qgb25lXHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSB1cmwubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcblxyXG4gICAgICAgIGlmICh1cmxbaV0gaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuXHJcbiAgICAgICAgICAvLyBNSU1FIGNoZWNrXHJcbiAgICAgICAgICBpZiAoc20yLmNhblBsYXlNSU1FKHVybFtpXS50eXBlKSkge1xyXG4gICAgICAgICAgICB1cmxSZXN1bHQgPSBpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChzbTIuY2FuUGxheVVSTCh1cmxbaV0pKSB7XHJcblxyXG4gICAgICAgICAgLy8gVVJMIHN0cmluZyBjaGVja1xyXG4gICAgICAgICAgdXJsUmVzdWx0ID0gaTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBub3JtYWxpemUgdG8gc3RyaW5nXHJcbiAgICAgIGlmICh1cmxbdXJsUmVzdWx0XS51cmwpIHtcclxuICAgICAgICB1cmxbdXJsUmVzdWx0XSA9IHVybFt1cmxSZXN1bHRdLnVybDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmVzdWx0ID0gdXJsW3VybFJlc3VsdF07XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIHNpbmdsZSBVUkwgY2FzZVxyXG4gICAgICByZXN1bHQgPSB1cmw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG5cclxuICBzdGFydFRpbWVyID0gZnVuY3Rpb24ob1NvdW5kKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhdHRhY2ggYSB0aW1lciB0byB0aGlzIHNvdW5kLCBhbmQgc3RhcnQgYW4gaW50ZXJ2YWwgaWYgbmVlZGVkXHJcbiAgICAgKi9cclxuXHJcbiAgICBpZiAoIW9Tb3VuZC5faGFzVGltZXIpIHtcclxuXHJcbiAgICAgIG9Tb3VuZC5faGFzVGltZXIgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKCFtb2JpbGVIVE1MNSAmJiBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpIHtcclxuXHJcbiAgICAgICAgaWYgKGg1SW50ZXJ2YWxUaW1lciA9PT0gbnVsbCAmJiBoNVRpbWVyQ291bnQgPT09IDApIHtcclxuXHJcbiAgICAgICAgICBoNUludGVydmFsVGltZXIgPSBzZXRJbnRlcnZhbCh0aW1lckV4ZWN1dGUsIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaDVUaW1lckNvdW50Kys7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBzdG9wVGltZXIgPSBmdW5jdGlvbihvU291bmQpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGRldGFjaCBhIHRpbWVyXHJcbiAgICAgKi9cclxuXHJcbiAgICBpZiAob1NvdW5kLl9oYXNUaW1lcikge1xyXG5cclxuICAgICAgb1NvdW5kLl9oYXNUaW1lciA9IGZhbHNlO1xyXG5cclxuICAgICAgaWYgKCFtb2JpbGVIVE1MNSAmJiBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpIHtcclxuXHJcbiAgICAgICAgLy8gaW50ZXJ2YWwgd2lsbCBzdG9wIGl0c2VsZiBhdCBuZXh0IGV4ZWN1dGlvbi5cclxuXHJcbiAgICAgICAgaDVUaW1lckNvdW50LS07XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICB0aW1lckV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIG1hbnVhbCBwb2xsaW5nIGZvciBIVE1MNSBwcm9ncmVzcyBldmVudHMsIGllLiwgd2hpbGVwbGF5aW5nKClcclxuICAgICAqIChjYW4gYWNoaWV2ZSBncmVhdGVyIHByZWNpc2lvbiB0aGFuIGNvbnNlcnZhdGl2ZSBkZWZhdWx0IEhUTUw1IGludGVydmFsKVxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIGk7XHJcblxyXG4gICAgaWYgKGg1SW50ZXJ2YWxUaW1lciAhPT0gbnVsbCAmJiAhaDVUaW1lckNvdW50KSB7XHJcblxyXG4gICAgICAvLyBubyBhY3RpdmUgdGltZXJzLCBzdG9wIHBvbGxpbmcgaW50ZXJ2YWwuXHJcblxyXG4gICAgICBjbGVhckludGVydmFsKGg1SW50ZXJ2YWxUaW1lcik7XHJcblxyXG4gICAgICBoNUludGVydmFsVGltZXIgPSBudWxsO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBhbGwgSFRNTDUgc291bmRzIHdpdGggdGltZXJzXHJcblxyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblxyXG4gICAgICBpZiAoc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLmlzSFRNTDUgJiYgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLl9oYXNUaW1lcikge1xyXG4gICAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5fb25UaW1lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBjYXRjaEVycm9yID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cclxuICAgIG9wdGlvbnMgPSAob3B0aW9ucyAhPT0gX3VuZGVmaW5lZCA/IG9wdGlvbnMgOiB7fSk7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBzbTIub25lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBzbTIub25lcnJvci5hcHBseSh3aW5kb3csIFt7XHJcbiAgICAgICAgdHlwZTogKG9wdGlvbnMudHlwZSAhPT0gX3VuZGVmaW5lZCA/IG9wdGlvbnMudHlwZSA6IG51bGwpXHJcbiAgICAgIH1dKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucy5mYXRhbCAhPT0gX3VuZGVmaW5lZCAmJiBvcHRpb25zLmZhdGFsKSB7XHJcbiAgICAgIHNtMi5kaXNhYmxlKCk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIGJhZFNhZmFyaUZpeCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogXCJiYWRcIiBTYWZhcmkgKE9TIFggMTAuMyAtIDEwLjcpIG11c3QgZmFsbCBiYWNrIHRvIGZsYXNoIGZvciBNUDMvTVA0XHJcbiAgICBpZiAoIWlzQmFkU2FmYXJpIHx8ICFkZXRlY3RGbGFzaCgpKSB7XHJcbiAgICAgIC8vIGRvZXNuJ3QgYXBwbHlcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhRiA9IHNtMi5hdWRpb0Zvcm1hdHMsIGksIGl0ZW07XHJcblxyXG4gICAgZm9yIChpdGVtIGluIGFGKSB7XHJcblxyXG4gICAgICBpZiAoYUYuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuXHJcbiAgICAgICAgaWYgKGl0ZW0gPT09ICdtcDMnIHx8IGl0ZW0gPT09ICdtcDQnKSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChzbSArICc6IFVzaW5nIGZsYXNoIGZhbGxiYWNrIGZvciAnICsgaXRlbSArICcgZm9ybWF0Jyk7XHJcbiAgICAgICAgICBzbTIuaHRtbDVbaXRlbV0gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAvLyBhc3NpZ24gcmVzdWx0IHRvIHJlbGF0ZWQgZm9ybWF0cywgdG9vXHJcbiAgICAgICAgICBpZiAoYUZbaXRlbV0gJiYgYUZbaXRlbV0ucmVsYXRlZCkge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSBhRltpdGVtXS5yZWxhdGVkLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgc20yLmh0bWw1W2FGW2l0ZW1dLnJlbGF0ZWRbaV1dID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUHNldWRvLXByaXZhdGUgZmxhc2gvRXh0ZXJuYWxJbnRlcmZhY2UgbWV0aG9kc1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgdGhpcy5fc2V0U2FuZGJveFR5cGUgPSBmdW5jdGlvbihzYW5kYm94VHlwZSkge1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgLy8gU2VjdXJpdHkgc2FuZGJveCBhY2NvcmRpbmcgdG8gRmxhc2ggcGx1Z2luXHJcbiAgICB2YXIgc2IgPSBzbTIuc2FuZGJveDtcclxuXHJcbiAgICBzYi50eXBlID0gc2FuZGJveFR5cGU7XHJcbiAgICBzYi5kZXNjcmlwdGlvbiA9IHNiLnR5cGVzWyhzYi50eXBlc1tzYW5kYm94VHlwZV0gIT09IF91bmRlZmluZWQ/c2FuZGJveFR5cGUgOiAndW5rbm93bicpXTtcclxuXHJcbiAgICBpZiAoc2IudHlwZSA9PT0gJ2xvY2FsV2l0aEZpbGUnKSB7XHJcblxyXG4gICAgICBzYi5ub1JlbW90ZSA9IHRydWU7XHJcbiAgICAgIHNiLm5vTG9jYWwgPSBmYWxzZTtcclxuICAgICAgX3dEUygnc2VjTm90ZScsIDIpO1xyXG5cclxuICAgIH0gZWxzZSBpZiAoc2IudHlwZSA9PT0gJ2xvY2FsV2l0aE5ldHdvcmsnKSB7XHJcblxyXG4gICAgICBzYi5ub1JlbW90ZSA9IGZhbHNlO1xyXG4gICAgICBzYi5ub0xvY2FsID0gdHJ1ZTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKHNiLnR5cGUgPT09ICdsb2NhbFRydXN0ZWQnKSB7XHJcblxyXG4gICAgICBzYi5ub1JlbW90ZSA9IGZhbHNlO1xyXG4gICAgICBzYi5ub0xvY2FsID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLl9leHRlcm5hbEludGVyZmFjZU9LID0gZnVuY3Rpb24oc3dmVmVyc2lvbikge1xyXG5cclxuICAgIC8vIGZsYXNoIGNhbGxiYWNrIGNvbmZpcm1pbmcgZmxhc2ggbG9hZGVkLCBFSSB3b3JraW5nIGV0Yy5cclxuICAgIC8vIHN3ZlZlcnNpb246IFNXRiBidWlsZCBzdHJpbmdcclxuXHJcbiAgICBpZiAoc20yLnN3ZkxvYWRlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGU7XHJcblxyXG4gICAgZGVidWdUUygnc3dmJywgdHJ1ZSk7XHJcbiAgICBkZWJ1Z1RTKCdmbGFzaHRvanMnLCB0cnVlKTtcclxuICAgIHNtMi5zd2ZMb2FkZWQgPSB0cnVlO1xyXG4gICAgdHJ5SW5pdE9uRm9jdXMgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoaXNCYWRTYWZhcmkpIHtcclxuICAgICAgYmFkU2FmYXJpRml4KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29tcGxhaW4gaWYgSlMgKyBTV0YgYnVpbGQvdmVyc2lvbiBzdHJpbmdzIGRvbid0IG1hdGNoLCBleGNsdWRpbmcgK0RFViBidWlsZHNcclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKCFzd2ZWZXJzaW9uIHx8IHN3ZlZlcnNpb24ucmVwbGFjZSgvXFwrZGV2L2ksJycpICE9PSBzbTIudmVyc2lvbk51bWJlci5yZXBsYWNlKC9cXCtkZXYvaSwgJycpKSB7XHJcblxyXG4gICAgICBlID0gc20gKyAnOiBGYXRhbDogSmF2YVNjcmlwdCBmaWxlIGJ1aWxkIFwiJyArIHNtMi52ZXJzaW9uTnVtYmVyICsgJ1wiIGRvZXMgbm90IG1hdGNoIEZsYXNoIFNXRiBidWlsZCBcIicgKyBzd2ZWZXJzaW9uICsgJ1wiIGF0ICcgKyBzbTIudXJsICsgJy4gRW5zdXJlIGJvdGggYXJlIHVwLXRvLWRhdGUuJztcclxuXHJcbiAgICAgIC8vIGVzY2FwZSBmbGFzaCAtPiBKUyBzdGFjayBzbyB0aGlzIGVycm9yIGZpcmVzIGluIHdpbmRvdy5cclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiB2ZXJzaW9uTWlzbWF0Y2goKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xyXG4gICAgICB9LCAwKTtcclxuXHJcbiAgICAgIC8vIGV4aXQsIGluaXQgd2lsbCBmYWlsIHdpdGggdGltZW91dFxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIC8vIElFIG5lZWRzIGEgbGFyZ2VyIHRpbWVvdXRcclxuICAgIHNldFRpbWVvdXQoaW5pdCwgaXNJRSA/IDEwMCA6IDEpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBQcml2YXRlIGluaXRpYWxpemF0aW9uIGhlbHBlcnNcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgY3JlYXRlTW92aWUgPSBmdW5jdGlvbihzbUlELCBzbVVSTCkge1xyXG5cclxuICAgIGlmIChkaWRBcHBlbmQgJiYgYXBwZW5kU3VjY2Vzcykge1xyXG4gICAgICAvLyBpZ25vcmUgaWYgYWxyZWFkeSBzdWNjZWVkZWRcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNc2coKSB7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuXHJcbiAgICAgIHZhciBvcHRpb25zID0gW10sXHJcbiAgICAgICAgICB0aXRsZSxcclxuICAgICAgICAgIG1zZyA9IFtdLFxyXG4gICAgICAgICAgZGVsaW1pdGVyID0gJyArICc7XHJcblxyXG4gICAgICB0aXRsZSA9ICdTb3VuZE1hbmFnZXIgJyArIHNtMi52ZXJzaW9uICsgKCFzbTIuaHRtbDVPbmx5ICYmIHNtMi51c2VIVE1MNUF1ZGlvID8gKHNtMi5oYXNIVE1MNSA/ICcgKyBIVE1MNSBhdWRpbycgOiAnLCBubyBIVE1MNSBhdWRpbyBzdXBwb3J0JykgOiAnJyk7XHJcblxyXG4gICAgICBpZiAoIXNtMi5odG1sNU9ubHkpIHtcclxuXHJcbiAgICAgICAgaWYgKHNtMi5wcmVmZXJGbGFzaCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdwcmVmZXJGbGFzaCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi51c2VIaWdoUGVyZm9ybWFuY2UpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgndXNlSGlnaFBlcmZvcm1hbmNlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLmZsYXNoUG9sbGluZ0ludGVydmFsKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2ZsYXNoUG9sbGluZ0ludGVydmFsICgnICsgc20yLmZsYXNoUG9sbGluZ0ludGVydmFsICsgJ21zKScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdodG1sNVBvbGxpbmdJbnRlcnZhbCAoJyArIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCArICdtcyknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIud21vZGUpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnd21vZGUgKCcgKyBzbTIud21vZGUgKyAnKScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2RlYnVnRmxhc2gnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jaykge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdmbGFzaEJsb2NrJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgaWYgKHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdodG1sNVBvbGxpbmdJbnRlcnZhbCAoJyArIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCArICdtcyknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAob3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBtc2cgPSBtc2cuY29uY2F0KFtvcHRpb25zLmpvaW4oZGVsaW1pdGVyKV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHRpdGxlICsgKG1zZy5sZW5ndGggPyBkZWxpbWl0ZXIgKyBtc2cuam9pbignLCAnKSA6ICcnKSwgMSk7XHJcblxyXG4gICAgICBzaG93U3VwcG9ydCgpO1xyXG5cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG5cclxuICAgICAgLy8gMTAwJSBIVE1MNSBtb2RlXHJcbiAgICAgIHNldFZlcnNpb25JbmZvKCk7XHJcblxyXG4gICAgICBpbml0TXNnKCk7XHJcbiAgICAgIHNtMi5vTUMgPSBpZChzbTIubW92aWVJRCk7XHJcbiAgICAgIGluaXQoKTtcclxuXHJcbiAgICAgIC8vIHByZXZlbnQgbXVsdGlwbGUgaW5pdCBhdHRlbXB0c1xyXG4gICAgICBkaWRBcHBlbmQgPSB0cnVlO1xyXG5cclxuICAgICAgYXBwZW5kU3VjY2VzcyA9IHRydWU7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZsYXNoIHBhdGhcclxuICAgIHZhciByZW1vdGVVUkwgPSAoc21VUkwgfHwgc20yLnVybCksXHJcbiAgICBsb2NhbFVSTCA9IChzbTIuYWx0VVJMIHx8IHJlbW90ZVVSTCksXHJcbiAgICBzd2ZUaXRsZSA9ICdKUy9GbGFzaCBhdWRpbyBjb21wb25lbnQgKFNvdW5kTWFuYWdlciAyKScsXHJcbiAgICBvVGFyZ2V0ID0gZ2V0RG9jdW1lbnQoKSxcclxuICAgIGV4dHJhQ2xhc3MgPSBnZXRTV0ZDU1MoKSxcclxuICAgIGlzUlRMID0gbnVsbCxcclxuICAgIGh0bWwgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKVswXSxcclxuICAgIG9FbWJlZCwgb01vdmllLCB0bXAsIG1vdmllSFRNTCwgb0VsLCBzLCB4LCBzQ2xhc3M7XHJcblxyXG4gICAgaXNSVEwgPSAoaHRtbCAmJiBodG1sLmRpciAmJiBodG1sLmRpci5tYXRjaCgvcnRsL2kpKTtcclxuICAgIHNtSUQgPSAoc21JRCA9PT0gX3VuZGVmaW5lZCA/IHNtMi5pZCA6IHNtSUQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhcmFtKG5hbWUsIHZhbHVlKSB7XHJcbiAgICAgIHJldHVybiAnPHBhcmFtIG5hbWU9XCInICsgbmFtZSArICdcIiB2YWx1ZT1cIicgKyB2YWx1ZSArICdcIiAvPic7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2FmZXR5IGNoZWNrIGZvciBsZWdhY3kgKGNoYW5nZSB0byBGbGFzaCA5IFVSTClcclxuICAgIHNldFZlcnNpb25JbmZvKCk7XHJcbiAgICBzbTIudXJsID0gbm9ybWFsaXplTW92aWVVUkwob3ZlckhUVFAgPyByZW1vdGVVUkwgOiBsb2NhbFVSTCk7XHJcbiAgICBzbVVSTCA9IHNtMi51cmw7XHJcblxyXG4gICAgc20yLndtb2RlID0gKCFzbTIud21vZGUgJiYgc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSA/ICd0cmFuc3BhcmVudCcgOiBzbTIud21vZGUpO1xyXG5cclxuICAgIGlmIChzbTIud21vZGUgIT09IG51bGwgJiYgKHVhLm1hdGNoKC9tc2llIDgvaSkgfHwgKCFpc0lFICYmICFzbTIudXNlSGlnaFBlcmZvcm1hbmNlKSkgJiYgbmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKC93aW4zMnx3aW42NC9pKSkge1xyXG4gICAgICAvKipcclxuICAgICAgICogZXh0cmEtc3BlY2lhbCBjYXNlOiBtb3ZpZSBkb2Vzbid0IGxvYWQgdW50aWwgc2Nyb2xsZWQgaW50byB2aWV3IHdoZW4gdXNpbmcgd21vZGUgPSBhbnl0aGluZyBidXQgJ3dpbmRvdycgaGVyZVxyXG4gICAgICAgKiBkb2VzIG5vdCBhcHBseSB3aGVuIHVzaW5nIGhpZ2ggcGVyZm9ybWFuY2UgKHBvc2l0aW9uOmZpeGVkIG1lYW5zIG9uLXNjcmVlbiksIE9SIGluZmluaXRlIGZsYXNoIGxvYWQgdGltZW91dFxyXG4gICAgICAgKiB3bW9kZSBicmVha3MgSUUgOCBvbiBWaXN0YSArIFdpbjcgdG9vIGluIHNvbWUgY2FzZXMsIGFzIG9mIEphbnVhcnkgMjAxMSAoPylcclxuICAgICAgICovXHJcbiAgICAgIG1lc3NhZ2VzLnB1c2goc3RyaW5ncy5zcGNXbW9kZSk7XHJcbiAgICAgIHNtMi53bW9kZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgb0VtYmVkID0ge1xyXG4gICAgICAnbmFtZSc6IHNtSUQsXHJcbiAgICAgICdpZCc6IHNtSUQsXHJcbiAgICAgICdzcmMnOiBzbVVSTCxcclxuICAgICAgJ3F1YWxpdHknOiAnaGlnaCcsXHJcbiAgICAgICdhbGxvd1NjcmlwdEFjY2Vzcyc6IHNtMi5hbGxvd1NjcmlwdEFjY2VzcyxcclxuICAgICAgJ2JnY29sb3InOiBzbTIuYmdDb2xvcixcclxuICAgICAgJ3BsdWdpbnNwYWdlJzogaHR0cCArICd3d3cubWFjcm9tZWRpYS5jb20vZ28vZ2V0Zmxhc2hwbGF5ZXInLFxyXG4gICAgICAndGl0bGUnOiBzd2ZUaXRsZSxcclxuICAgICAgJ3R5cGUnOiAnYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnLFxyXG4gICAgICAnd21vZGUnOiBzbTIud21vZGUsXHJcbiAgICAgIC8vIGh0dHA6Ly9oZWxwLmFkb2JlLmNvbS9lbl9VUy9hczMvbW9iaWxlL1dTNGJlYmNkNjZhNzQyNzVjMzZjZmI4MTM3MTI0MzE4ZWViYzYtN2ZmZC5odG1sXHJcbiAgICAgICdoYXNQcmlvcml0eSc6ICd0cnVlJ1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgb0VtYmVkLkZsYXNoVmFycyA9ICdkZWJ1Zz0xJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNtMi53bW9kZSkge1xyXG4gICAgICAvLyBkb24ndCB3cml0ZSBlbXB0eSBhdHRyaWJ1dGVcclxuICAgICAgZGVsZXRlIG9FbWJlZC53bW9kZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNJRSkge1xyXG5cclxuICAgICAgLy8gSUUgaXMgXCJzcGVjaWFsXCIuXHJcbiAgICAgIG9Nb3ZpZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgbW92aWVIVE1MID0gW1xyXG4gICAgICAgICc8b2JqZWN0IGlkPVwiJyArIHNtSUQgKyAnXCIgZGF0YT1cIicgKyBzbVVSTCArICdcIiB0eXBlPVwiJyArIG9FbWJlZC50eXBlICsgJ1wiIHRpdGxlPVwiJyArIG9FbWJlZC50aXRsZSArJ1wiIGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIiBjb2RlYmFzZT1cImh0dHA6Ly9kb3dubG9hZC5tYWNyb21lZGlhLmNvbS9wdWIvc2hvY2t3YXZlL2NhYnMvZmxhc2gvc3dmbGFzaC5jYWIjdmVyc2lvbj02LDAsNDAsMFwiPicsXHJcbiAgICAgICAgcGFyYW0oJ21vdmllJywgc21VUkwpLFxyXG4gICAgICAgIHBhcmFtKCdBbGxvd1NjcmlwdEFjY2VzcycsIHNtMi5hbGxvd1NjcmlwdEFjY2VzcyksXHJcbiAgICAgICAgcGFyYW0oJ3F1YWxpdHknLCBvRW1iZWQucXVhbGl0eSksXHJcbiAgICAgICAgKHNtMi53bW9kZT8gcGFyYW0oJ3dtb2RlJywgc20yLndtb2RlKTogJycpLFxyXG4gICAgICAgIHBhcmFtKCdiZ2NvbG9yJywgc20yLmJnQ29sb3IpLFxyXG4gICAgICAgIHBhcmFtKCdoYXNQcmlvcml0eScsICd0cnVlJyksXHJcbiAgICAgICAgKHNtMi5kZWJ1Z0ZsYXNoID8gcGFyYW0oJ0ZsYXNoVmFycycsIG9FbWJlZC5GbGFzaFZhcnMpIDogJycpLFxyXG4gICAgICAgICc8L29iamVjdD4nXHJcbiAgICAgIF0uam9pbignJyk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIG9Nb3ZpZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdlbWJlZCcpO1xyXG4gICAgICBmb3IgKHRtcCBpbiBvRW1iZWQpIHtcclxuICAgICAgICBpZiAob0VtYmVkLmhhc093blByb3BlcnR5KHRtcCkpIHtcclxuICAgICAgICAgIG9Nb3ZpZS5zZXRBdHRyaWJ1dGUodG1wLCBvRW1iZWRbdG1wXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGluaXREZWJ1ZygpO1xyXG4gICAgZXh0cmFDbGFzcyA9IGdldFNXRkNTUygpO1xyXG4gICAgb1RhcmdldCA9IGdldERvY3VtZW50KCk7XHJcblxyXG4gICAgaWYgKG9UYXJnZXQpIHtcclxuXHJcbiAgICAgIHNtMi5vTUMgPSAoaWQoc20yLm1vdmllSUQpIHx8IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcblxyXG4gICAgICBpZiAoIXNtMi5vTUMuaWQpIHtcclxuXHJcbiAgICAgICAgc20yLm9NQy5pZCA9IHNtMi5tb3ZpZUlEO1xyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gc3dmQ1NTLnN3ZkRlZmF1bHQgKyAnICcgKyBleHRyYUNsYXNzO1xyXG4gICAgICAgIHMgPSBudWxsO1xyXG4gICAgICAgIG9FbCA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmICghc20yLnVzZUZsYXNoQmxvY2spIHtcclxuICAgICAgICAgIGlmIChzbTIudXNlSGlnaFBlcmZvcm1hbmNlKSB7XHJcbiAgICAgICAgICAgIC8vIG9uLXNjcmVlbiBhdCBhbGwgdGltZXNcclxuICAgICAgICAgICAgcyA9IHtcclxuICAgICAgICAgICAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICd3aWR0aCc6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICdoZWlnaHQnOiAnOHB4JyxcclxuICAgICAgICAgICAgICAvLyA+PSA2cHggZm9yIGZsYXNoIHRvIHJ1biBmYXN0LCA+PSA4cHggdG8gc3RhcnQgdXAgdW5kZXIgRmlyZWZveC93aW4zMiBpbiBzb21lIGNhc2VzLiBvZGQ/IHllcy5cclxuICAgICAgICAgICAgICAnYm90dG9tJzogJzBweCcsXHJcbiAgICAgICAgICAgICAgJ2xlZnQnOiAnMHB4JyxcclxuICAgICAgICAgICAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gaGlkZSBvZmYtc2NyZWVuLCBsb3dlciBwcmlvcml0eVxyXG4gICAgICAgICAgICBzID0ge1xyXG4gICAgICAgICAgICAgICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgJ3dpZHRoJzogJzZweCcsXHJcbiAgICAgICAgICAgICAgJ2hlaWdodCc6ICc2cHgnLFxyXG4gICAgICAgICAgICAgICd0b3AnOiAnLTk5OTlweCcsXHJcbiAgICAgICAgICAgICAgJ2xlZnQnOiAnLTk5OTlweCdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGlzUlRMKSB7XHJcbiAgICAgICAgICAgICAgcy5sZWZ0ID0gTWF0aC5hYnMocGFyc2VJbnQocy5sZWZ0LCAxMCkpICsgJ3B4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlzV2Via2l0KSB7XHJcbiAgICAgICAgICAvLyBzb3VuZGNsb3VkLXJlcG9ydGVkIHJlbmRlci9jcmFzaCBmaXgsIHNhZmFyaSA1XHJcbiAgICAgICAgICBzbTIub01DLnN0eWxlLnpJbmRleCA9IDEwMDAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICAgICAgZm9yICh4IGluIHMpIHtcclxuICAgICAgICAgICAgaWYgKHMuaGFzT3duUHJvcGVydHkoeCkpIHtcclxuICAgICAgICAgICAgICBzbTIub01DLnN0eWxlW3hdID0gc1t4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICBpZiAoIWlzSUUpIHtcclxuICAgICAgICAgICAgc20yLm9NQy5hcHBlbmRDaGlsZChvTW92aWUpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG9UYXJnZXQuYXBwZW5kQ2hpbGQoc20yLm9NQyk7XHJcblxyXG4gICAgICAgICAgaWYgKGlzSUUpIHtcclxuICAgICAgICAgICAgb0VsID0gc20yLm9NQy5hcHBlbmRDaGlsZChkb2MuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgICAgICBvRWwuY2xhc3NOYW1lID0gc3dmQ1NTLnN3ZkJveDtcclxuICAgICAgICAgICAgb0VsLmlubmVySFRNTCA9IG1vdmllSFRNTDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBhcHBlbmRTdWNjZXNzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfSBjYXRjaChlKSB7XHJcblxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0cignZG9tRXJyb3InKSArICcgXFxuJyArIGUudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFNNMiBjb250YWluZXIgaXMgYWxyZWFkeSBpbiB0aGUgZG9jdW1lbnQgKGVnLiBmbGFzaGJsb2NrIHVzZSBjYXNlKVxyXG4gICAgICAgIHNDbGFzcyA9IHNtMi5vTUMuY2xhc3NOYW1lO1xyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gKHNDbGFzcyA/IHNDbGFzcyArICcgJyA6IHN3ZkNTUy5zd2ZEZWZhdWx0KSArIChleHRyYUNsYXNzID8gJyAnICsgZXh0cmFDbGFzcyA6ICcnKTtcclxuICAgICAgICBzbTIub01DLmFwcGVuZENoaWxkKG9Nb3ZpZSk7XHJcblxyXG4gICAgICAgIGlmIChpc0lFKSB7XHJcbiAgICAgICAgICBvRWwgPSBzbTIub01DLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcbiAgICAgICAgICBvRWwuY2xhc3NOYW1lID0gc3dmQ1NTLnN3ZkJveDtcclxuICAgICAgICAgIG9FbC5pbm5lckhUTUwgPSBtb3ZpZUhUTUw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhcHBlbmRTdWNjZXNzID0gdHJ1ZTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZGlkQXBwZW5kID0gdHJ1ZTtcclxuXHJcbiAgICBpbml0TXNnKCk7XHJcblxyXG4gICAgLy8gc20yLl93RChzbSArICc6IFRyeWluZyB0byBsb2FkICcgKyBzbVVSTCArICghb3ZlckhUVFAgJiYgc20yLmFsdFVSTCA/ICcgKGFsdGVybmF0ZSBVUkwpJyA6ICcnKSwgMSk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGluaXRNb3ZpZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgIGNyZWF0ZU1vdmllKCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhdHRlbXB0IHRvIGdldCwgb3IgY3JlYXRlLCBtb3ZpZSAobWF5IGFscmVhZHkgZXhpc3QpXHJcbiAgICBpZiAoZmxhc2gpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc20yLnVybCkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNvbWV0aGluZyBpc24ndCByaWdodCAtIHdlJ3ZlIHJlYWNoZWQgaW5pdCwgYnV0IHRoZSBzb3VuZE1hbmFnZXIgdXJsIHByb3BlcnR5IGhhcyBub3QgYmVlbiBzZXQuXHJcbiAgICAgICAqIFVzZXIgaGFzIG5vdCBjYWxsZWQgc2V0dXAoe3VybDogLi4ufSksIG9yIGhhcyBub3Qgc2V0IHNvdW5kTWFuYWdlci51cmwgKGxlZ2FjeSB1c2UgY2FzZSkgZGlyZWN0bHkgYmVmb3JlIGluaXQgdGltZS5cclxuICAgICAgICogTm90aWZ5IGFuZCBleGl0LiBJZiB1c2VyIGNhbGxzIHNldHVwKCkgd2l0aCBhIHVybDogcHJvcGVydHksIGluaXQgd2lsbCBiZSByZXN0YXJ0ZWQgYXMgaW4gdGhlIGRlZmVycmVkIGxvYWRpbmcgY2FzZS5cclxuICAgICAgICovXHJcblxyXG4gICAgICAgX3dEUygnbm9VUkwnKTtcclxuICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW5saW5lIG1hcmt1cCBjYXNlXHJcbiAgICBmbGFzaCA9IHNtMi5nZXRNb3ZpZShzbTIuaWQpO1xyXG5cclxuICAgIGlmICghZmxhc2gpIHtcclxuXHJcbiAgICAgIGlmICghb1JlbW92ZWQpIHtcclxuXHJcbiAgICAgICAgLy8gdHJ5IHRvIGNyZWF0ZVxyXG4gICAgICAgIGNyZWF0ZU1vdmllKHNtMi5pZCwgc20yLnVybCk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyB0cnkgdG8gcmUtYXBwZW5kIHJlbW92ZWQgbW92aWUgYWZ0ZXIgcmVib290KClcclxuICAgICAgICBpZiAoIWlzSUUpIHtcclxuICAgICAgICAgIHNtMi5vTUMuYXBwZW5kQ2hpbGQob1JlbW92ZWQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzbTIub01DLmlubmVySFRNTCA9IG9SZW1vdmVkSFRNTDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9SZW1vdmVkID0gbnVsbDtcclxuICAgICAgICBkaWRBcHBlbmQgPSB0cnVlO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgZmxhc2ggPSBzbTIuZ2V0TW92aWUoc20yLmlkKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBzbTIub25pbml0bW92aWUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgc2V0VGltZW91dChzbTIub25pbml0bW92aWUsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgZmx1c2hNZXNzYWdlcygpO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBkZWxheVdhaXRGb3JFSSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHNldFRpbWVvdXQod2FpdEZvckVJLCAxMDAwKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgcmVib290SW50b0hUTUw1ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiB0cnkgZm9yIGEgcmVib290IHdpdGggcHJlZmVyRmxhc2g6IGZhbHNlLCBpZiAxMDAlIEhUTUw1IG1vZGUgaXMgcG9zc2libGUgYW5kIHVzZUZsYXNoQmxvY2sgaXMgbm90IGVuYWJsZWQuXHJcblxyXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBjb21wbGFpbihzbWMgKyAndXNlRmxhc2hCbG9jayBpcyBmYWxzZSwgMTAwJSBIVE1MNSBtb2RlIGlzIHBvc3NpYmxlLiBSZWJvb3Rpbmcgd2l0aCBwcmVmZXJGbGFzaDogZmFsc2UuLi4nKTtcclxuXHJcbiAgICAgIHNtMi5zZXR1cCh7XHJcbiAgICAgICAgcHJlZmVyRmxhc2g6IGZhbHNlXHJcbiAgICAgIH0pLnJlYm9vdCgpO1xyXG5cclxuICAgICAgLy8gaWYgZm9yIHNvbWUgcmVhc29uIHlvdSB3YW50IHRvIGRldGVjdCB0aGlzIGNhc2UsIHVzZSBhbiBvbnRpbWVvdXQoKSBjYWxsYmFjayBhbmQgbG9vayBmb3IgaHRtbDVPbmx5IGFuZCBkaWRGbGFzaEJsb2NrID09IHRydWUuXHJcbiAgICAgIHNtMi5kaWRGbGFzaEJsb2NrID0gdHJ1ZTtcclxuXHJcbiAgICAgIHNtMi5iZWdpbkRlbGF5ZWRJbml0KCk7XHJcblxyXG4gICAgfSwgMSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHdhaXRGb3JFSSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBwLFxyXG4gICAgICAgIGxvYWRJbmNvbXBsZXRlID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKCFzbTIudXJsKSB7XHJcbiAgICAgIC8vIE5vIFNXRiB1cmwgdG8gbG9hZCAobm9VUkwgY2FzZSkgLSBleGl0IGZvciBub3cuIFdpbGwgYmUgcmV0cmllZCB3aGVuIHVybCBpcyBzZXQuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2FpdGluZ0ZvckVJKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB3YWl0aW5nRm9yRUkgPSB0cnVlO1xyXG4gICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2xvYWQnLCBkZWxheVdhaXRGb3JFSSk7XHJcblxyXG4gICAgaWYgKGhhc0ZsYXNoICYmIHRyeUluaXRPbkZvY3VzICYmICFpc0ZvY3VzZWQpIHtcclxuICAgICAgLy8gU2FmYXJpIHdvbid0IGxvYWQgZmxhc2ggaW4gYmFja2dyb3VuZCB0YWJzLCBvbmx5IHdoZW4gZm9jdXNlZC5cclxuICAgICAgX3dEUygnd2FpdEZvY3VzJyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRpZEluaXQpIHtcclxuICAgICAgcCA9IHNtMi5nZXRNb3ZpZVBlcmNlbnQoKTtcclxuICAgICAgaWYgKHAgPiAwICYmIHAgPCAxMDApIHtcclxuICAgICAgICBsb2FkSW5jb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcCA9IHNtMi5nZXRNb3ZpZVBlcmNlbnQoKTtcclxuXHJcbiAgICAgIGlmIChsb2FkSW5jb21wbGV0ZSkge1xyXG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZTogaWYgbW92aWUgKnBhcnRpYWxseSogbG9hZGVkLCByZXRyeSB1bnRpbCBpdCdzIDEwMCUgYmVmb3JlIGFzc3VtaW5nIGZhaWx1cmUuXHJcbiAgICAgICAgd2FpdGluZ0ZvckVJID0gZmFsc2U7XHJcbiAgICAgICAgc20yLl93RChzdHIoJ3dhaXRTV0YnKSk7XHJcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZGVsYXlXYWl0Rm9yRUksIDEpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmICghZGlkSW5pdCkge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHNtICsgJzogTm8gRmxhc2ggcmVzcG9uc2Ugd2l0aGluIGV4cGVjdGVkIHRpbWUuIExpa2VseSBjYXVzZXM6ICcgKyAocCA9PT0gMCA/ICdTV0YgbG9hZCBmYWlsZWQsICcgOiAnJykgKyAnRmxhc2ggYmxvY2tlZCBvciBKUy1GbGFzaCBzZWN1cml0eSBlcnJvci4nICsgKHNtMi5kZWJ1Z0ZsYXNoID8gJyAnICsgc3RyKCdjaGVja1NXRicpIDogJycpLCAyKTtcclxuXHJcbiAgICAgICAgaWYgKCFvdmVySFRUUCAmJiBwKSB7XHJcblxyXG4gICAgICAgICAgX3dEUygnbG9jYWxGYWlsJywgMik7XHJcblxyXG4gICAgICAgICAgaWYgKCFzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICAgICAgICBfd0RTKCd0cnlEZWJ1ZycsIDIpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgLy8gaWYgMCAobm90IG51bGwpLCBwcm9iYWJseSBhIDQwNC5cclxuICAgICAgICAgIHNtMi5fd0Qoc3RyKCdzd2Y0MDQnLCBzbTIudXJsKSwgMSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGVidWdUUygnZmxhc2h0b2pzJywgZmFsc2UsICc6IFRpbWVkIG91dCcgKyAob3ZlckhUVFAgPyAnIChDaGVjayBmbGFzaCBzZWN1cml0eSBvciBmbGFzaCBibG9ja2VycyknOicgKE5vIHBsdWdpbi9taXNzaW5nIFNXRj8pJykpO1xyXG5cclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICAvLyBnaXZlIHVwIC8gdGltZS1vdXQsIGRlcGVuZGluZ1xyXG5cclxuICAgICAgaWYgKCFkaWRJbml0ICYmIG9rVG9EaXNhYmxlKSB7XHJcblxyXG4gICAgICAgIGlmIChwID09PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgLy8gU1dGIGZhaWxlZCB0byByZXBvcnQgbG9hZCBwcm9ncmVzcy4gUG9zc2libHkgYmxvY2tlZC5cclxuXHJcbiAgICAgICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2sgfHwgc20yLmZsYXNoTG9hZFRpbWVvdXQgPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jaykge1xyXG5cclxuICAgICAgICAgICAgICBmbGFzaEJsb2NrSGFuZGxlcigpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgX3dEUygnd2FpdEZvcmV2ZXInKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gbm8gY3VzdG9tIGZsYXNoIGJsb2NrIGhhbmRsaW5nLCBidXQgU1dGIGhhcyB0aW1lZCBvdXQuIFdpbGwgcmVjb3ZlciBpZiB1c2VyIHVuYmxvY2tzIC8gYWxsb3dzIFNXRiBsb2FkLlxyXG5cclxuICAgICAgICAgICAgaWYgKCFzbTIudXNlRmxhc2hCbG9jayAmJiBjYW5JZ25vcmVGbGFzaCkge1xyXG5cclxuICAgICAgICAgICAgICByZWJvb3RJbnRvSFRNTDUoKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIF93RFMoJ3dhaXRGb3JldmVyJyk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGZpcmUgYW55IHJlZ3VsYXIgcmVnaXN0ZXJlZCBvbnRpbWVvdXQoKSBsaXN0ZW5lcnMuXHJcbiAgICAgICAgICAgICAgcHJvY2Vzc09uRXZlbnRzKHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdvbnRpbWVvdXQnLFxyXG4gICAgICAgICAgICAgICAgaWdub3JlSW5pdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdJTklUX0ZMQVNIQkxPQ0snXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIFNXRiBsb2FkZWQ/IFNob3VsZG4ndCBiZSBhIGJsb2NraW5nIGlzc3VlLCB0aGVuLlxyXG5cclxuICAgICAgICAgIGlmIChzbTIuZmxhc2hMb2FkVGltZW91dCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgX3dEUygnd2FpdEZvcmV2ZXInKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzbTIudXNlRmxhc2hCbG9jayAmJiBjYW5JZ25vcmVGbGFzaCkge1xyXG5cclxuICAgICAgICAgICAgICByZWJvb3RJbnRvSFRNTDUoKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIGZhaWxTYWZlbHkodHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfSwgc20yLmZsYXNoTG9hZFRpbWVvdXQpO1xyXG5cclxuICB9O1xyXG5cclxuICBoYW5kbGVGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGNsZWFudXAoKSB7XHJcbiAgICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdmb2N1cycsIGhhbmRsZUZvY3VzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNGb2N1c2VkIHx8ICF0cnlJbml0T25Gb2N1cykge1xyXG4gICAgICAvLyBhbHJlYWR5IGZvY3VzZWQsIG9yIG5vdCBzcGVjaWFsIFNhZmFyaSBiYWNrZ3JvdW5kIHRhYiBjYXNlXHJcbiAgICAgIGNsZWFudXAoKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgb2tUb0Rpc2FibGUgPSB0cnVlO1xyXG4gICAgaXNGb2N1c2VkID0gdHJ1ZTtcclxuICAgIF93RFMoJ2dvdEZvY3VzJyk7XHJcblxyXG4gICAgLy8gYWxsb3cgaW5pdCB0byByZXN0YXJ0XHJcbiAgICB3YWl0aW5nRm9yRUkgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBraWNrIG9mZiBFeHRlcm5hbEludGVyZmFjZSB0aW1lb3V0LCBub3cgdGhhdCB0aGUgU1dGIGhhcyBzdGFydGVkXHJcbiAgICBkZWxheVdhaXRGb3JFSSgpO1xyXG5cclxuICAgIGNsZWFudXAoKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBmbHVzaE1lc3NhZ2VzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgLy8gU00yIHByZS1pbml0IGRlYnVnIG1lc3NhZ2VzXHJcbiAgICBpZiAobWVzc2FnZXMubGVuZ3RoKSB7XHJcbiAgICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlciAyOiAnICsgbWVzc2FnZXMuam9pbignICcpLCAxKTtcclxuICAgICAgbWVzc2FnZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIHNob3dTdXBwb3J0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgZmx1c2hNZXNzYWdlcygpO1xyXG5cclxuICAgIHZhciBpdGVtLCB0ZXN0cyA9IFtdO1xyXG5cclxuICAgIGlmIChzbTIudXNlSFRNTDVBdWRpbyAmJiBzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgZm9yIChpdGVtIGluIHNtMi5hdWRpb0Zvcm1hdHMpIHtcclxuICAgICAgICBpZiAoc20yLmF1ZGlvRm9ybWF0cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgICAgdGVzdHMucHVzaChpdGVtICsgJyA9ICcgKyBzbTIuaHRtbDVbaXRlbV0gKyAoIXNtMi5odG1sNVtpdGVtXSAmJiBuZWVkc0ZsYXNoICYmIHNtMi5mbGFzaFtpdGVtXSA/ICcgKHVzaW5nIGZsYXNoKScgOiAoc20yLnByZWZlckZsYXNoICYmIHNtMi5mbGFzaFtpdGVtXSAmJiBuZWVkc0ZsYXNoID8gJyAocHJlZmVycmluZyBmbGFzaCknIDogKCFzbTIuaHRtbDVbaXRlbV0gPyAnICgnICsgKHNtMi5hdWRpb0Zvcm1hdHNbaXRlbV0ucmVxdWlyZWQgPyAncmVxdWlyZWQsICcgOiAnJykgKyAnYW5kIG5vIGZsYXNoIHN1cHBvcnQpJyA6ICcnKSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc20yLl93RCgnU291bmRNYW5hZ2VyIDIgSFRNTDUgc3VwcG9ydDogJyArIHRlc3RzLmpvaW4oJywgJyksIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgaW5pdENvbXBsZXRlID0gZnVuY3Rpb24oYk5vRGlzYWJsZSkge1xyXG5cclxuICAgIGlmIChkaWRJbml0KSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICAvLyBhbGwgZ29vZC5cclxuICAgICAgX3dEUygnc20yTG9hZGVkJywgMSk7XHJcbiAgICAgIGRpZEluaXQgPSB0cnVlO1xyXG4gICAgICBpbml0VXNlck9ubG9hZCgpO1xyXG4gICAgICBkZWJ1Z1RTKCdvbmxvYWQnLCB0cnVlKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHdhc1RpbWVvdXQgPSAoc20yLnVzZUZsYXNoQmxvY2sgJiYgc20yLmZsYXNoTG9hZFRpbWVvdXQgJiYgIXNtMi5nZXRNb3ZpZVBlcmNlbnQoKSksXHJcbiAgICAgICAgcmVzdWx0ID0gdHJ1ZSxcclxuICAgICAgICBlcnJvcjtcclxuXHJcbiAgICBpZiAoIXdhc1RpbWVvdXQpIHtcclxuICAgICAgZGlkSW5pdCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZXJyb3IgPSB7XHJcbiAgICAgIHR5cGU6ICghaGFzRmxhc2ggJiYgbmVlZHNGbGFzaCA/ICdOT19GTEFTSCcgOiAnSU5JVF9USU1FT1VUJylcclxuICAgIH07XHJcblxyXG4gICAgc20yLl93RCgnU291bmRNYW5hZ2VyIDIgJyArIChkaXNhYmxlZCA/ICdmYWlsZWQgdG8gbG9hZCcgOiAnbG9hZGVkJykgKyAnICgnICsgKGRpc2FibGVkID8gJ0ZsYXNoIHNlY3VyaXR5L2xvYWQgZXJyb3InIDogJ09LJykgKyAnKSAnICsgU3RyaW5nLmZyb21DaGFyQ29kZShkaXNhYmxlZCA/IDEwMDA2IDogMTAwMDMpLCBkaXNhYmxlZCA/IDI6IDEpO1xyXG5cclxuICAgIGlmIChkaXNhYmxlZCB8fCBiTm9EaXNhYmxlKSB7XHJcblxyXG4gICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2sgJiYgc20yLm9NQykge1xyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gZ2V0U1dGQ1NTKCkgKyAnICcgKyAoc20yLmdldE1vdmllUGVyY2VudCgpID09PSBudWxsID8gc3dmQ1NTLnN3ZlRpbWVkb3V0IDogc3dmQ1NTLnN3ZkVycm9yKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKHtcclxuICAgICAgICB0eXBlOiAnb250aW1lb3V0JyxcclxuICAgICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICAgICAgaWdub3JlSW5pdDogdHJ1ZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGRlYnVnVFMoJ29ubG9hZCcsIGZhbHNlKTtcclxuICAgICAgY2F0Y2hFcnJvcihlcnJvcik7XHJcblxyXG4gICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgZGVidWdUUygnb25sb2FkJywgdHJ1ZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmICghZGlzYWJsZWQpIHtcclxuXHJcbiAgICAgIGlmIChzbTIud2FpdEZvcldpbmRvd0xvYWQgJiYgIXdpbmRvd0xvYWRlZCkge1xyXG5cclxuICAgICAgICBfd0RTKCd3YWl0T25sb2FkJyk7XHJcbiAgICAgICAgZXZlbnQuYWRkKHdpbmRvdywgJ2xvYWQnLCBpbml0VXNlck9ubG9hZCk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAoc20yLndhaXRGb3JXaW5kb3dMb2FkICYmIHdpbmRvd0xvYWRlZCkge1xyXG4gICAgICAgICAgX3dEUygnZG9jTG9hZGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgICAgaW5pdFVzZXJPbmxvYWQoKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogYXBwbHkgdG9wLWxldmVsIHNldHVwT3B0aW9ucyBvYmplY3QgYXMgbG9jYWwgcHJvcGVydGllcywgZWcuLCB0aGlzLnNldHVwT3B0aW9ucy5mbGFzaFZlcnNpb24gLT4gdGhpcy5mbGFzaFZlcnNpb24gKHNvdW5kTWFuYWdlci5mbGFzaFZlcnNpb24pXHJcbiAgICogdGhpcyBtYWludGFpbnMgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgYW5kIGFsbG93cyBwcm9wZXJ0aWVzIHRvIGJlIGRlZmluZWQgc2VwYXJhdGVseSBmb3IgdXNlIGJ5IHNvdW5kTWFuYWdlci5zZXR1cCgpLlxyXG4gICAqL1xyXG5cclxuICBzZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGksXHJcbiAgICAgICAgbyA9IHNtMi5zZXR1cE9wdGlvbnM7XHJcblxyXG4gICAgZm9yIChpIGluIG8pIHtcclxuXHJcbiAgICAgIGlmIChvLmhhc093blByb3BlcnR5KGkpKSB7XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBsb2NhbCBwcm9wZXJ0eSBpZiBub3QgYWxyZWFkeSBkZWZpbmVkXHJcblxyXG4gICAgICAgIGlmIChzbTJbaV0gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICBzbTJbaV0gPSBvW2ldO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHNtMltpXSAhPT0gb1tpXSkge1xyXG5cclxuICAgICAgICAgIC8vIGxlZ2FjeSBzdXBwb3J0OiB3cml0ZSBtYW51YWxseS1hc3NpZ25lZCBwcm9wZXJ0eSAoZWcuLCBzb3VuZE1hbmFnZXIudXJsKSBiYWNrIHRvIHNldHVwT3B0aW9ucyB0byBrZWVwIHRoaW5ncyBpbiBzeW5jXHJcbiAgICAgICAgICBzbTIuc2V0dXBPcHRpb25zW2ldID0gc20yW2ldO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuXHJcbiAgaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIGNhbGxlZCBhZnRlciBvbmxvYWQoKVxyXG5cclxuICAgIGlmIChkaWRJbml0KSB7XHJcbiAgICAgIF93RFMoJ2RpZEluaXQnKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsZWFudXAoKSB7XHJcbiAgICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdsb2FkJywgc20yLmJlZ2luRGVsYXllZEluaXQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcblxyXG4gICAgICBpZiAoIWRpZEluaXQpIHtcclxuICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIG5vIHN0ZWVua2luZyBmbGFzaCFcclxuICAgICAgICBjbGVhbnVwKCk7XHJcbiAgICAgICAgc20yLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIGluaXRDb21wbGV0ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmxhc2ggcGF0aFxyXG4gICAgaW5pdE1vdmllKCk7XHJcblxyXG4gICAgdHJ5IHtcclxuXHJcbiAgICAgIC8vIGF0dGVtcHQgdG8gdGFsayB0byBGbGFzaFxyXG4gICAgICBmbGFzaC5fZXh0ZXJuYWxJbnRlcmZhY2VUZXN0KGZhbHNlKTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBBcHBseSB1c2VyLXNwZWNpZmllZCBwb2xsaW5nIGludGVydmFsLCBPUiwgaWYgXCJoaWdoIHBlcmZvcm1hbmNlXCIgc2V0LCBmYXN0ZXIgdnMuIGRlZmF1bHQgcG9sbGluZ1xyXG4gICAgICAgKiAoZGV0ZXJtaW5lcyBmcmVxdWVuY3kgb2Ygd2hpbGVsb2FkaW5nL3doaWxlcGxheWluZyBjYWxsYmFja3MsIGVmZmVjdGl2ZWx5IGRyaXZpbmcgVUkgZnJhbWVyYXRlcylcclxuICAgICAgICovXHJcbiAgICAgIHNldFBvbGxpbmcodHJ1ZSwgKHNtMi5mbGFzaFBvbGxpbmdJbnRlcnZhbCB8fCAoc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSA/IDEwIDogNTApKSk7XHJcblxyXG4gICAgICBpZiAoIXNtMi5kZWJ1Z01vZGUpIHtcclxuICAgICAgICAvLyBzdG9wIHRoZSBTV0YgZnJvbSBtYWtpbmcgZGVidWcgb3V0cHV0IGNhbGxzIHRvIEpTXHJcbiAgICAgICAgZmxhc2guX2Rpc2FibGVEZWJ1ZygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgIGRlYnVnVFMoJ2pzdG9mbGFzaCcsIHRydWUpO1xyXG5cclxuICAgICAgaWYgKCFzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgICAgLy8gcHJldmVudCBicm93c2VyIGZyb20gc2hvd2luZyBjYWNoZWQgcGFnZSBzdGF0ZSAob3IgcmF0aGVyLCByZXN0b3JpbmcgXCJzdXNwZW5kZWRcIiBwYWdlIHN0YXRlKSB2aWEgYmFjayBidXR0b24sIGJlY2F1c2UgZmxhc2ggbWF5IGJlIGRlYWRcclxuICAgICAgICAvLyBodHRwOi8vd3d3LndlYmtpdC5vcmcvYmxvZy81MTYvd2Via2l0LXBhZ2UtY2FjaGUtaWktdGhlLXVubG9hZC1ldmVudC9cclxuICAgICAgICBldmVudC5hZGQod2luZG93LCAndW5sb2FkJywgZG9Ob3RoaW5nKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0gY2F0Y2goZSkge1xyXG5cclxuICAgICAgc20yLl93RCgnanMvZmxhc2ggZXhjZXB0aW9uOiAnICsgZS50b1N0cmluZygpKTtcclxuXHJcbiAgICAgIGRlYnVnVFMoJ2pzdG9mbGFzaCcsIGZhbHNlKTtcclxuXHJcbiAgICAgIGNhdGNoRXJyb3Ioe1xyXG4gICAgICAgIHR5cGU6ICdKU19UT19GTEFTSF9FWENFUFRJT04nLFxyXG4gICAgICAgIGZhdGFsOiB0cnVlXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gZG9uJ3QgZGlzYWJsZSwgZm9yIHJlYm9vdCgpXHJcbiAgICAgIGZhaWxTYWZlbHkodHJ1ZSk7XHJcblxyXG4gICAgICBpbml0Q29tcGxldGUoKTtcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaW5pdENvbXBsZXRlKCk7XHJcblxyXG4gICAgLy8gZGlzY29ubmVjdCBldmVudHNcclxuICAgIGNsZWFudXAoKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZG9tQ29udGVudExvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmIChkaWREQ0xvYWRlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZGlkRENMb2FkZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIGFzc2lnbiB0b3AtbGV2ZWwgc291bmRNYW5hZ2VyIHByb3BlcnRpZXMgZWcuIHNvdW5kTWFuYWdlci51cmxcclxuICAgIHNldFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICBpbml0RGVidWcoKTtcclxuXHJcbiAgICBpZiAoIWhhc0ZsYXNoICYmIHNtMi5oYXNIVE1MNSkge1xyXG5cclxuICAgICAgc20yLl93RCgnU291bmRNYW5hZ2VyIDI6IE5vIEZsYXNoIGRldGVjdGVkJyArICghc20yLnVzZUhUTUw1QXVkaW8gPyAnLCBlbmFibGluZyBIVE1MNS4nIDogJy4gVHJ5aW5nIEhUTUw1LW9ubHkgbW9kZS4nKSwgMSk7XHJcblxyXG4gICAgICBzbTIuc2V0dXAoe1xyXG4gICAgICAgICd1c2VIVE1MNUF1ZGlvJzogdHJ1ZSxcclxuICAgICAgICAvLyBtYWtlIHN1cmUgd2UgYXJlbid0IHByZWZlcnJpbmcgZmxhc2gsIGVpdGhlclxyXG4gICAgICAgIC8vIFRPRE86IHByZWZlckZsYXNoIHNob3VsZCBub3QgbWF0dGVyIGlmIGZsYXNoIGlzIG5vdCBpbnN0YWxsZWQuIEN1cnJlbnRseSwgc3R1ZmYgYnJlYWtzIHdpdGhvdXQgdGhlIGJlbG93IHR3ZWFrLlxyXG4gICAgICAgICdwcmVmZXJGbGFzaCc6IGZhbHNlXHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0SFRNTDUoKTtcclxuXHJcbiAgICBpZiAoIWhhc0ZsYXNoICYmIG5lZWRzRmxhc2gpIHtcclxuXHJcbiAgICAgIG1lc3NhZ2VzLnB1c2goc3RyaW5ncy5uZWVkRmxhc2gpO1xyXG5cclxuICAgICAgLy8gVE9ETzogRmF0YWwgaGVyZSB2cy4gdGltZW91dCBhcHByb2FjaCwgZXRjLlxyXG4gICAgICAvLyBoYWNrOiBmYWlsIHNvb25lci5cclxuICAgICAgc20yLnNldHVwKHtcclxuICAgICAgICAnZmxhc2hMb2FkVGltZW91dCc6IDFcclxuICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGRvbUNvbnRlbnRMb2FkZWQsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0TW92aWUoKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZG9tQ29udGVudExvYWRlZElFID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKGRvYy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICAgIGRvbUNvbnRlbnRMb2FkZWQoKTtcclxuICAgICAgZG9jLmRldGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBkb21Db250ZW50TG9hZGVkSUUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICB3aW5PbkxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBjYXRjaCBlZGdlIGNhc2Ugb2YgaW5pdENvbXBsZXRlKCkgZmlyaW5nIGFmdGVyIHdpbmRvdy5sb2FkKClcclxuICAgIHdpbmRvd0xvYWRlZCA9IHRydWU7XHJcblxyXG4gICAgLy8gY2F0Y2ggY2FzZSB3aGVyZSBET01Db250ZW50TG9hZGVkIGhhcyBiZWVuIHNlbnQsIGJ1dCB3ZSdyZSBzdGlsbCBpbiBkb2MucmVhZHlTdGF0ZSA9ICdpbnRlcmFjdGl2ZSdcclxuICAgIGRvbUNvbnRlbnRMb2FkZWQoKTtcclxuXHJcbiAgICBldmVudC5yZW1vdmUod2luZG93LCAnbG9hZCcsIHdpbk9uTG9hZCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIHNuaWZmIHVwLWZyb250XHJcbiAgZGV0ZWN0Rmxhc2goKTtcclxuXHJcbiAgLy8gZm9jdXMgYW5kIHdpbmRvdyBsb2FkLCBpbml0IChwcmltYXJpbHkgZmxhc2gtZHJpdmVuKVxyXG4gIGV2ZW50LmFkZCh3aW5kb3csICdmb2N1cycsIGhhbmRsZUZvY3VzKTtcclxuICBldmVudC5hZGQod2luZG93LCAnbG9hZCcsIGRlbGF5V2FpdEZvckVJKTtcclxuICBldmVudC5hZGQod2luZG93LCAnbG9hZCcsIHdpbk9uTG9hZCk7XHJcblxyXG4gIGlmIChkb2MuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG5cclxuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZG9tQ29udGVudExvYWRlZCwgZmFsc2UpO1xyXG5cclxuICB9IGVsc2UgaWYgKGRvYy5hdHRhY2hFdmVudCkge1xyXG5cclxuICAgIGRvYy5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZG9tQ29udGVudExvYWRlZElFKTtcclxuXHJcbiAgfSBlbHNlIHtcclxuXHJcbiAgICAvLyBubyBhZGQvYXR0YWNoZXZlbnQgc3VwcG9ydCAtIHNhZmUgdG8gYXNzdW1lIG5vIEpTIC0+IEZsYXNoIGVpdGhlclxyXG4gICAgZGVidWdUUygnb25sb2FkJywgZmFsc2UpO1xyXG4gICAgY2F0Y2hFcnJvcih7XHJcbiAgICAgIHR5cGU6ICdOT19ET00yX0VWRU5UUycsXHJcbiAgICAgIGZhdGFsOiB0cnVlXHJcbiAgICB9KTtcclxuXHJcbiAgfVxyXG5cclxufSAvLyBTb3VuZE1hbmFnZXIoKVxyXG5cclxuLy8gU00yX0RFRkVSIGRldGFpbHM6IGh0dHA6Ly93d3cuc2NoaWxsbWFuaWEuY29tL3Byb2plY3RzL3NvdW5kbWFuYWdlcjIvZG9jL2dldHN0YXJ0ZWQvI2xhenktbG9hZGluZ1xyXG5cclxuaWYgKHdpbmRvdy5TTTJfREVGRVIgPT09IF91bmRlZmluZWQgfHwgIVNNMl9ERUZFUikge1xyXG4gIHNvdW5kTWFuYWdlciA9IG5ldyBTb3VuZE1hbmFnZXIoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNvdW5kTWFuYWdlciBwdWJsaWMgaW50ZXJmYWNlc1xyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICovXHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuXHJcbiAgLyoqXHJcbiAgICogY29tbW9uSlMgbW9kdWxlXHJcbiAgICovXHJcblxyXG4gIG1vZHVsZS5leHBvcnRzLlNvdW5kTWFuYWdlciA9IFNvdW5kTWFuYWdlcjtcclxuICBtb2R1bGUuZXhwb3J0cy5zb3VuZE1hbmFnZXIgPSBzb3VuZE1hbmFnZXI7XHJcblxyXG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG5cclxuICAvKipcclxuICAgKiBBTUQgLSByZXF1aXJlSlNcclxuICAgKiBiYXNpYyB1c2FnZTpcclxuICAgKiByZXF1aXJlKFtcIi9wYXRoL3RvL3NvdW5kbWFuYWdlcjIuanNcIl0sIGZ1bmN0aW9uKFNvdW5kTWFuYWdlcikge1xyXG4gICAqICAgU291bmRNYW5hZ2VyLmdldEluc3RhbmNlKCkuc2V0dXAoe1xyXG4gICAqICAgICB1cmw6ICcvc3dmLycsXHJcbiAgICogICAgIG9ucmVhZHk6IGZ1bmN0aW9uKCkgeyAuLi4gfVxyXG4gICAqICAgfSlcclxuICAgKiB9KTtcclxuICAgKlxyXG4gICAqIFNNMl9ERUZFUiB1c2FnZTpcclxuICAgKiB3aW5kb3cuU00yX0RFRkVSID0gdHJ1ZTtcclxuICAgKiByZXF1aXJlKFtcIi9wYXRoL3RvL3NvdW5kbWFuYWdlcjIuanNcIl0sIGZ1bmN0aW9uKFNvdW5kTWFuYWdlcikge1xyXG4gICAqICAgU291bmRNYW5hZ2VyLmdldEluc3RhbmNlKGZ1bmN0aW9uKCkge1xyXG4gICAqICAgICB2YXIgc291bmRNYW5hZ2VyID0gbmV3IFNvdW5kTWFuYWdlci5jb25zdHJ1Y3RvcigpO1xyXG4gICAqICAgICBzb3VuZE1hbmFnZXIuc2V0dXAoe1xyXG4gICAqICAgICAgIHVybDogJy9zd2YvJyxcclxuICAgKiAgICAgICAuLi5cclxuICAgKiAgICAgfSk7XHJcbiAgICogICAgIC4uLlxyXG4gICAqICAgICBzb3VuZE1hbmFnZXIuYmVnaW5EZWxheWVkSW5pdCgpO1xyXG4gICAqICAgICByZXR1cm4gc291bmRNYW5hZ2VyO1xyXG4gICAqICAgfSlcclxuICAgKiB9KTsgXHJcbiAgICovXHJcblxyXG4gIGRlZmluZShmdW5jdGlvbigpIHtcclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmUgdGhlIGdsb2JhbCBpbnN0YW5jZSBvZiBTb3VuZE1hbmFnZXIuXHJcbiAgICAgKiBJZiBhIGdsb2JhbCBpbnN0YW5jZSBkb2VzIG5vdCBleGlzdCBpdCBjYW4gYmUgY3JlYXRlZCB1c2luZyBhIGNhbGxiYWNrLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHNtQnVpbGRlciBPcHRpb25hbDogQ2FsbGJhY2sgdXNlZCB0byBjcmVhdGUgYSBuZXcgU291bmRNYW5hZ2VyIGluc3RhbmNlXHJcbiAgICAgKiBAcmV0dXJuIHtTb3VuZE1hbmFnZXJ9IFRoZSBnbG9iYWwgU291bmRNYW5hZ2VyIGluc3RhbmNlXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldEluc3RhbmNlKHNtQnVpbGRlcikge1xyXG4gICAgICBpZiAoIXdpbmRvdy5zb3VuZE1hbmFnZXIgJiYgc21CdWlsZGVyIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcclxuICAgICAgICB2YXIgaW5zdGFuY2UgPSBzbUJ1aWxkZXIoU291bmRNYW5hZ2VyKTtcclxuICAgICAgICBpZiAoaW5zdGFuY2UgaW5zdGFuY2VvZiBTb3VuZE1hbmFnZXIpIHtcclxuICAgICAgICAgIHdpbmRvdy5zb3VuZE1hbmFnZXIgPSBpbnN0YW5jZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHdpbmRvdy5zb3VuZE1hbmFnZXI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb25zdHJ1Y3RvcjogU291bmRNYW5hZ2VyLFxyXG4gICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2VcclxuICAgIH1cclxuICB9KTtcclxuXHJcbn1cclxuXHJcbi8vIHN0YW5kYXJkIGJyb3dzZXIgY2FzZVxyXG5cclxuLy8gY29uc3RydWN0b3Jcclxud2luZG93LlNvdW5kTWFuYWdlciA9IFNvdW5kTWFuYWdlcjtcclxuXHJcbi8qKlxyXG4gKiBub3RlOiBTTTIgcmVxdWlyZXMgYSB3aW5kb3cgZ2xvYmFsIGR1ZSB0byBGbGFzaCwgd2hpY2ggbWFrZXMgY2FsbHMgdG8gd2luZG93LnNvdW5kTWFuYWdlci5cclxuICogRmxhc2ggbWF5IG5vdCBhbHdheXMgYmUgbmVlZGVkLCBidXQgdGhpcyBpcyBub3Qga25vd24gdW50aWwgYXN5bmMgaW5pdCBhbmQgU00yIG1heSBldmVuIFwicmVib290XCIgaW50byBGbGFzaCBtb2RlLlxyXG4gKi9cclxuXHJcbi8vIHB1YmxpYyBBUEksIGZsYXNoIGNhbGxiYWNrcyBldGMuXHJcbndpbmRvdy5zb3VuZE1hbmFnZXIgPSBzb3VuZE1hbmFnZXI7XHJcblxyXG59KHdpbmRvdykpO1xyXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3NvdW5kbWFuYWdlcjIgPSByZXF1aXJlKCdzb3VuZG1hbmFnZXIyJyk7XG5cbnZhciBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9zbS8zNjAtcGxheWVyL3NjcmlwdC8zNjBwbGF5ZXInKTtcblxuX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLnNldHVwKHtcbiAgICAvLyBwYXRoIHRvIGRpcmVjdG9yeSBjb250YWluaW5nIFNNMiBTV0ZcbiAgICB1cmw6ICdwbHVnaW5zL2VkaXRvci5zb3VuZG1hbmFnZXIvc20vc3dmLycsXG4gICAgZGVidWdNb2RlOiB0cnVlXG59KTtcblxudmFyIFBsYXllciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhQbGF5ZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUGxheWVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQbGF5ZXIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFBsYXllci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcblxuICAgICAgICBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5jb25maWcuYXV0b1BsYXkgPSBwcm9wcy5hdXRvUGxheTtcblxuICAgICAgICBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5jb25maWcuc2NhbGVGb250ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvbXNpZS9pKSA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgICAgX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnNob3dITVNUaW1lID0gdHJ1ZTtcblxuICAgICAgICAvLyBlbmFibGUgc29tZSBzcGVjdHJ1bSBzdHVmZnNcbiAgICAgICAgX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVdhdmVmb3JtRGF0YSA9IHRydWU7XG4gICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy51c2VFUURhdGEgPSB0cnVlO1xuICAgICAgICB2YXIgb25GaW5pc2ggPSBwcm9wcy5vbkZpbmlzaDtcblxuICAgICAgICBpZiAob25GaW5pc2gpIHtcbiAgICAgICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy5vbmZpbmlzaCA9IG9uRmluaXNoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZW5hYmxlIHRoaXMgaW4gU00yIGFzIHdlbGwsIGFzIG5lZWRlZFxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVdhdmVmb3JtRGF0YSkge1xuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLmZsYXNoOU9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZUVRRGF0YSkge1xuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLmZsYXNoOU9wdGlvbnMudXNlRVFEYXRhID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVBlYWtEYXRhKSB7XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIuZmxhc2g5T3B0aW9ucy51c2VQZWFrRGF0YSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZVdhdmVmb3JtRGF0YSB8fCBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5mbGFzaDlPcHRpb25zLnVzZUVRRGF0YSB8fCBfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5mbGFzaDlPcHRpb25zLnVzZVBlYWtEYXRhKSB7XG4gICAgICAgICAgICAvLyBldmVuIGlmIEhUTUw1IHN1cHBvcnRzIE1QMywgcHJlZmVyIGZsYXNoIHNvIHRoZSB2aXN1YWxpemF0aW9uIGZlYXR1cmVzIGNhbiBiZSB1c2VkLlxuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLnByZWZlckZsYXNoID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZhdmljb24gaXMgZXhwZW5zaXZlIENQVS13aXNlLCBidXQgY2FuIGJlIHVzZWQuXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvaGlmaS9pKSkge1xuICAgICAgICAgICAgX3NtMzYwUGxheWVyU2NyaXB0MzYwcGxheWVyLnRocmVlU2l4dHlQbGF5ZXIuY29uZmlnLnVzZUZhdkljb24gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9odG1sNS9pKSkge1xuICAgICAgICAgICAgLy8gZm9yIHRlc3RpbmcgSUUgOSwgZXRjLlxuICAgICAgICAgICAgX3NvdW5kbWFuYWdlcjIuc291bmRNYW5hZ2VyLnVzZUhUTUw1QXVkaW8gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBsYXllciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIub25yZWFkeShfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5pbml0KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZpbmlzaCkge1xuICAgICAgICAgICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy5vbmZpbmlzaCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIuc3RvcEFsbCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZpbmlzaCkge1xuICAgICAgICAgICAgICAgIF9zbTM2MFBsYXllclNjcmlwdDM2MHBsYXllci50aHJlZVNpeHR5UGxheWVyLmNvbmZpZy5vbmZpbmlzaCA9IHRoaXMucHJvcHMub25GaW5pc2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfc291bmRtYW5hZ2VyMi5zb3VuZE1hbmFnZXIub25yZWFkeShfc20zNjBQbGF5ZXJTY3JpcHQzNjBwbGF5ZXIudGhyZWVTaXh0eVBsYXllci5pbml0KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBcInVpMzYwXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yaWNoKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9IFwiIHVpMzYwLXZpc1wiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSwgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFBsYXllcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5QbGF5ZXIucHJvcFR5cGVzID0ge1xuICAgIHRocmVlU2l4dHlQbGF5ZXI6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10ub2JqZWN0LFxuICAgIGF1dG9QbGF5OiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmJvb2wsXG4gICAgcmljaDogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5ib29sLmlzUmVxdWlyZWQsXG4gICAgb25SZWFkeTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jXG59O1xuXG5QbGF5ZXIuZGVmYXVsdFByb3BzID0ge1xuICAgIGF1dG9QbGF5OiBmYWxzZSxcbiAgICByaWNoOiB0cnVlXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQbGF5ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9QbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xuXG52YXIgX1BsYXllcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9QbGF5ZXIpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbi8vIFRoZSB0aHJlZVNpeHl0UGxheWVyIGlzIHRoZSBzYW1lIGZvciBhbGwgYmFkZ2VzXG52YXIgdGhyZWVTaXh0eVBsYXllciA9IG5ldyBUaHJlZVNpeHR5UGxheWVyKCk7XG5cbnZhciBCYWRnZSA9IChmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhCYWRnZSwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBCYWRnZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJhZGdlKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihCYWRnZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhCYWRnZSwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWROb2RlKHRoaXMucHJvcHMpO1xuXG4gICAgICAgICAgICB0aHJlZVNpeHR5UGxheWVyLmluaXQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgaWYgKG5leHRQcm9wcy5ub2RlICE9PSB0aGlzLnByb3BzLm5vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWROb2RlKG5leHRQcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWROb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWROb2RlKHByb3BzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHByb3BzLm5vZGU7XG5cbiAgICAgICAgICAgIF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgIG1pbWVUeXBlOiBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmID0gdGhpcy5zdGF0ZSB8fCB7fTtcblxuICAgICAgICAgICAgdmFyIG1pbWVUeXBlID0gX3JlZi5taW1lVHlwZTtcbiAgICAgICAgICAgIHZhciB1cmwgPSBfcmVmLnVybDtcblxuICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX1BsYXllcjJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICB7IHJpY2g6IGZhbHNlLCBzdHlsZTogeyB3aWR0aDogNDAsIGhlaWdodDogNDAsIG1hcmdpbjogXCJhdXRvXCIgfSwgb25SZWFkeTogZnVuY3Rpb24gKCkge30gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnYScsIHsgdHlwZTogbWltZVR5cGUsIGhyZWY6IHVybCB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBCYWRnZTtcbn0pKF9yZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBCYWRnZTtcblxuZnVuY3Rpb24gZ3VpZCgpIHtcbiAgICByZXR1cm4gczQoKSArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgczQoKSArIHM0KCk7XG59XG5cbmZ1bmN0aW9uIHM0KCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3RSZWR1eCA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbnZhciBfcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1BsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XG5cbnZhciBfUGxheWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1BsYXllcik7XG5cbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKFwiaG9jXCIpO1xuXG52YXIgd2l0aFNlbGVjdGlvbiA9IF9QeWRpbyRyZXF1aXJlTGliLndpdGhTZWxlY3Rpb247XG52YXIgRWRpdG9yQWN0aW9ucyA9IF9QeWRpbyRyZXF1aXJlTGliLkVkaXRvckFjdGlvbnM7XG52YXIgd2l0aE1lbnUgPSBfUHlkaW8kcmVxdWlyZUxpYi53aXRoTWVudTtcbnZhciB3aXRoTG9hZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIud2l0aExvYWRlcjtcbnZhciB3aXRoRXJyb3JzID0gX1B5ZGlvJHJlcXVpcmVMaWIud2l0aEVycm9ycztcbnZhciB3aXRoQ29udHJvbHMgPSBfUHlkaW8kcmVxdWlyZUxpYi53aXRoQ29udHJvbHM7XG5cbnZhciBlZGl0b3JzID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkuUmVnaXN0cnkuZ2V0QWN0aXZlRXh0ZW5zaW9uQnlUeXBlKFwiZWRpdG9yXCIpO1xudmFyIGNvbmYgPSBlZGl0b3JzLmZpbHRlcihmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBpZCA9IF9yZWYuaWQ7XG4gICAgcmV0dXJuIGlkID09PSAnZWRpdG9yLnNvdW5kbWFuYWdlcic7XG59KVswXTtcblxudmFyIGdldFNlbGVjdGlvbkZpbHRlciA9IGZ1bmN0aW9uIGdldFNlbGVjdGlvbkZpbHRlcihub2RlKSB7XG4gICAgcmV0dXJuIGNvbmYubWltZXMuaW5kZXhPZihub2RlLmdldEFqeHBNaW1lKCkpID4gLTE7XG59O1xuXG52YXIgZ2V0U2VsZWN0aW9uID0gZnVuY3Rpb24gZ2V0U2VsZWN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uID0gW107XG5cbiAgICAgICAgbm9kZS5nZXRQYXJlbnQoKS5nZXRDaGlsZHJlbigpLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnB1c2goY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLmZpbHRlcihnZXRTZWxlY3Rpb25GaWx0ZXIpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmdldExhYmVsKCkubG9jYWxlQ29tcGFyZShiLmdldExhYmVsKCksIHVuZGVmaW5lZCwgeyBudW1lcmljOiB0cnVlIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIHNlbGVjdGlvbjogc2VsZWN0aW9uLFxuICAgICAgICAgICAgY3VycmVudEluZGV4OiBzZWxlY3Rpb24ucmVkdWNlKGZ1bmN0aW9uIChjdXJyZW50SW5kZXgsIGN1cnJlbnQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQgPT09IG5vZGUgJiYgaW5kZXggfHwgY3VycmVudEluZGV4O1xuICAgICAgICAgICAgfSwgMClcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG52YXIgc3R5bGVzID0ge1xuICAgIGNvbnRhaW5lcjoge1xuICAgICAgICBtYXJnaW46IFwiYXV0b1wiLFxuICAgICAgICBkaXNwbGF5OiBcImZsZXhcIixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLFxuICAgICAgICBmbGV4OiAxXG4gICAgfSxcbiAgICBwbGF5ZXI6IHtcbiAgICAgICAgbWFyZ2luOiBcImF1dG9cIlxuICAgIH0sXG4gICAgdGFibGU6IHtcbiAgICAgICAgd2lkdGg6IDMyMFxuICAgIH1cbn07XG5cbnZhciBFZGl0b3IgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRWRpdG9yLCBfQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIF9FZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKF9FZGl0b3IucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRWRpdG9yLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZE5vZGUodGhpcy5wcm9wcyk7XG4gICAgICAgICAgICB2YXIgZWRpdG9yTW9kaWZ5ID0gdGhpcy5wcm9wcy5lZGl0b3JNb2RpZnk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgZWRpdG9yTW9kaWZ5KHsgZml4ZWRUb29sYmFyOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGVkaXRvck1vZGlmeSA9IHRoaXMucHJvcHMuZWRpdG9yTW9kaWZ5O1xuXG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgZWRpdG9yTW9kaWZ5KHsgZml4ZWRUb29sYmFyOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXh0UHJvcHMubm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVybDogJycgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5sb2FkTm9kZShuZXh0UHJvcHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkTm9kZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkTm9kZShwcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgICAgICBtaW1lVHlwZTogXCJhdWRpby9cIiArIG5vZGUuZ2V0QWp4cE1pbWUoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgXCJhdWRpby9cIiArIG5vZGUuZ2V0QWp4cE1pbWUoKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BsYXlOZXh0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBsYXlOZXh0KCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMucHJvcHMuc2VsZWN0aW9uO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnN0YXRlLm5vZGU7XG5cbiAgICAgICAgICAgIHZhciBpbmRleCA9IHNlbGVjdGlvbi5zZWxlY3Rpb24uaW5kZXhPZihub2RlKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IHNlbGVjdGlvbi5zZWxlY3Rpb24ubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Sb3dTZWxlY3Rpb24oW2luZGV4ICsgMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvblJvd1NlbGVjdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvblJvd1NlbGVjdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKCFkYXRhLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHRoaXMucHJvcHMuc2VsZWN0aW9uO1xuXG4gICAgICAgICAgICBpZiAoIXNlbGVjdGlvbikgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVybDogbnVsbCB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLmxvYWROb2RlKHsgbm9kZTogc2VsZWN0aW9uLnNlbGVjdGlvbltkYXRhWzBdXSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcmVmMiA9IHRoaXMuc3RhdGUgfHwge307XG5cbiAgICAgICAgICAgIHZhciBtaW1lVHlwZSA9IF9yZWYyLm1pbWVUeXBlO1xuICAgICAgICAgICAgdmFyIHVybCA9IF9yZWYyLnVybDtcbiAgICAgICAgICAgIHZhciBub2RlID0gX3JlZjIubm9kZTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5jb250YWluZXIgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgekRlcHRoOiAzLCBzdHlsZTogc3R5bGVzLnBsYXllciB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCA2MHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX1BsYXllcjJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGF1dG9QbGF5OiB0cnVlLCByaWNoOiAhdGhpcy5wcm9wcy5pY29uICYmIHRoaXMucHJvcHMucmljaCwgb25SZWFkeTogdGhpcy5wcm9wcy5vbkxvYWQsIG9uRmluaXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQucGxheU5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdhJywgeyB0eXBlOiBtaW1lVHlwZSwgaHJlZjogdXJsIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNsZWFyOiAnYm90aCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogc3R5bGVzLnRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aVNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDI1MCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Sb3dTZWxlY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQub25Sb3dTZWxlY3Rpb24oZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5UYWJsZUJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlSb3dDaGVja2JveDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpcGVkUm93czogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNlbGVjdE9uQ2xpY2thd2F5OiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNlbGVjdGlvbiAmJiB0aGlzLnByb3BzLnNlbGVjdGlvbi5zZWxlY3Rpb24ubWFwKGZ1bmN0aW9uIChuLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRhYmxlUm93LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsga2V5OiBpbmRleCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5UYWJsZVJvd0NvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMTYsIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgJiYgbi5nZXRQYXRoKCkgPT09IG5vZGUuZ2V0UGF0aCgpID8gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLXBsYXlcIiB9KSA6IGluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFibGVSb3dDb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbi5nZXRMYWJlbCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgdmFyIF9FZGl0b3IgPSBFZGl0b3I7XG4gICAgRWRpdG9yID0gKDAsIF9yZWFjdFJlZHV4LmNvbm5lY3QpKG51bGwsIEVkaXRvckFjdGlvbnMpKEVkaXRvcikgfHwgRWRpdG9yO1xuICAgIEVkaXRvciA9IHdpdGhTZWxlY3Rpb24oZ2V0U2VsZWN0aW9uKShFZGl0b3IpIHx8IEVkaXRvcjtcbiAgICByZXR1cm4gRWRpdG9yO1xufSkoX3JlYWN0LkNvbXBvbmVudCk7XG5cbmZ1bmN0aW9uIGd1aWQoKSB7XG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xufVxuXG5mdW5jdGlvbiBzNCgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbn1cblxuZXhwb3J0c1snZGVmYXVsdCddID0gRWRpdG9yO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZShvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9ialsnZGVmYXVsdCddIDogb2JqOyB9XG5cbnZhciBfYmFkZ2UgPSByZXF1aXJlKCcuL2JhZGdlJyk7XG5cbmV4cG9ydHMuQmFkZ2UgPSBfaW50ZXJvcFJlcXVpcmUoX2JhZGdlKTtcblxudmFyIF9wcmV2aWV3ID0gcmVxdWlyZSgnLi9wcmV2aWV3Jyk7XG5cbmV4cG9ydHMuUGFuZWwgPSBfaW50ZXJvcFJlcXVpcmUoX3ByZXZpZXcpO1xuXG52YXIgX2VkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbmV4cG9ydHMuRWRpdG9yID0gX2ludGVyb3BSZXF1aXJlKF9lZGl0b3IpO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1BsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XG5cbnZhciBfUGxheWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1BsYXllcik7XG5cbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbi8vIFRoZSB0aHJlZVNpeHl0UGxheWVyIGlzIHRoZSBzYW1lIGZvciBhbGwgYmFkZ2VzXG52YXIgdGhyZWVTaXh0eVBsYXllciA9IG5ldyBUaHJlZVNpeHR5UGxheWVyKCk7XG5cbnZhciBQcmV2aWV3ID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFByZXZpZXcsIF9Db21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUHJldmlldygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFByZXZpZXcpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFByZXZpZXcucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUHJldmlldywgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWROb2RlKHRoaXMucHJvcHMpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZE5vZGUobmV4dFByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZE5vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZE5vZGUocHJvcHMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgdmFyIG1pbWUgPSBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpO1xuXG4gICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5idWlsZFByZXNpZ25lZEdldFVybChub2RlLCBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgbWltZVR5cGU6IG1pbWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIG1pbWUpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB1cmw6IG5vZGUuZ2V0UGF0aCgpLFxuICAgICAgICAgICAgICAgIG1pbWVUeXBlOiBcImF1ZGlvL1wiICsgbm9kZS5nZXRBanhwTWltZSgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmID0gdGhpcy5zdGF0ZSB8fCB7fTtcblxuICAgICAgICAgICAgdmFyIG1pbWVUeXBlID0gX3JlZi5taW1lVHlwZTtcbiAgICAgICAgICAgIHZhciB1cmwgPSBfcmVmLnVybDtcblxuICAgICAgICAgICAgaWYgKCF1cmwpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX1BsYXllcjJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICB7IHJpY2g6IHRydWUsIHN0eWxlOiB7IG1hcmdpbjogXCJhdXRvXCIgfSwgb25SZWFkeTogZnVuY3Rpb24gKCkge30gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnYScsIHsgdHlwZTogbWltZVR5cGUsIGhyZWY6IHVybCB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQcmV2aWV3O1xufSkoX3JlYWN0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFByZXZpZXc7XG5cbmZ1bmN0aW9uIGd1aWQoKSB7XG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xufVxuXG5mdW5jdGlvbiBzNCgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLyoqXG4gKlxuICogU291bmRNYW5hZ2VyIDIgRGVtbzogMzYwLWRlZ3JlZSAvIFwiZG9udXQgcGxheWVyXCJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogaHR0cDovL3NjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL1xuICpcbiAqIEFuIGlubGluZSBwbGF5ZXIgd2l0aCBhIGNpcmN1bGFyIFVJLlxuICogQmFzZWQgb24gdGhlIG9yaWdpbmFsIFNNMiBpbmxpbmUgcGxheWVyLlxuICogSW5zcGlyZWQgYnkgQXBwbGUncyBwcmV2aWV3IGZlYXR1cmUgaW4gdGhlXG4gKiBpVHVuZXMgbXVzaWMgc3RvcmUgKGlQaG9uZSksIGFtb25nIG90aGVycy5cbiAqXG4gKiBSZXF1aXJlcyBTb3VuZE1hbmFnZXIgMiBKYXZhc2NyaXB0IEFQSS5cbiAqIEFsc28gdXNlcyBCZXJuaWUncyBCZXR0ZXIgQW5pbWF0aW9uIENsYXNzIChCU0QpOlxuICogaHR0cDovL3d3dy5iZXJuaWVjb2RlLmNvbS93cml0aW5nL2FuaW1hdG9yLmh0bWxcbiAqXG4qL1xuXG4vKmpzbGludCB3aGl0ZTogZmFsc2UsIG9uZXZhcjogdHJ1ZSwgdW5kZWY6IHRydWUsIG5vbWVuOiBmYWxzZSwgZXFlcWVxOiB0cnVlLCBwbHVzcGx1czogZmFsc2UsIGJpdHdpc2U6IHRydWUsIHJlZ2V4cDogZmFsc2UsIG5ld2NhcDogdHJ1ZSwgaW1tZWQ6IHRydWUgKi9cbi8qZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3csIHNvdW5kTWFuYWdlciwgbmF2aWdhdG9yICovXG5cbnZhciB0aHJlZVNpeHR5UGxheWVyLCAvLyBpbnN0YW5jZVxuICAgIFRocmVlU2l4dHlQbGF5ZXI7IC8vIGNvbnN0cnVjdG9yXG5cbihmdW5jdGlvbih3aW5kb3csIF91bmRlZmluZWQpIHtcblxuZnVuY3Rpb24gVGhyZWVTaXh0eVBsYXllcigpIHtcblxuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBwbCA9IHRoaXMsXG4gICAgICBzbSA9IHNvdW5kTWFuYWdlciwgLy8gc291bmRNYW5hZ2VyIGluc3RhbmNlXG4gICAgICB1QSA9IG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICBpc0lFID0gKHVBLm1hdGNoKC9tc2llL2kpKSxcbiAgICAgIGlzT3BlcmEgPSAodUEubWF0Y2goL29wZXJhL2kpKSxcbiAgICAgIGlzU2FmYXJpID0gKHVBLm1hdGNoKC9zYWZhcmkvaSkpLFxuICAgICAgaXNDaHJvbWUgPSAodUEubWF0Y2goL2Nocm9tZS9pKSksXG4gICAgICBpc0ZpcmVmb3ggPSAodUEubWF0Y2goL2ZpcmVmb3gvaSkpLFxuICAgICAgaXNUb3VjaERldmljZSA9ICh1QS5tYXRjaCgvaXBhZHxpcGhvbmUvaSkpLFxuICAgICAgaGFzUmVhbENhbnZhcyA9ICh0eXBlb2Ygd2luZG93Lkdfdm1sQ2FudmFzTWFuYWdlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJykgIT09ICd1bmRlZmluZWQnKSxcbiAgICAgIC8vIEkgZHVubm8gd2hhdCBPcGVyYSBkb2Vzbid0IGxpa2UgYWJvdXQgdGhpcy4gSSdtIHByb2JhYmx5IGRvaW5nIGl0IHdyb25nLlxuICAgICAgZnVsbENpcmNsZSA9IChpc09wZXJhfHxpc0Nocm9tZT8zNTkuOTozNjApO1xuXG4gIC8vIENTUyBjbGFzcyBmb3IgaWdub3JpbmcgTVAzIGxpbmtzXG4gIHRoaXMuZXhjbHVkZUNsYXNzID0gJ3RocmVlc2l4dHktZXhjbHVkZSc7XG4gIHRoaXMubGlua3MgPSBbXTtcbiAgdGhpcy5zb3VuZHMgPSBbXTtcbiAgdGhpcy5zb3VuZHNCeVVSTCA9IHt9O1xuICB0aGlzLmluZGV4QnlVUkwgPSB7fTtcbiAgdGhpcy5sYXN0U291bmQgPSBudWxsO1xuICB0aGlzLmxhc3RUb3VjaGVkU291bmQgPSBudWxsO1xuICB0aGlzLnNvdW5kQ291bnQgPSAwO1xuICB0aGlzLm9VSVRlbXBsYXRlID0gbnVsbDtcbiAgdGhpcy5vVUlJbWFnZU1hcCA9IG51bGw7XG4gIHRoaXMudnVNZXRlciA9IG51bGw7XG4gIHRoaXMuY2FsbGJhY2tDb3VudCA9IDA7XG4gIHRoaXMucGVha0RhdGFIaXN0b3J5ID0gW107XG5cbiAgLy8gMzYwcGxheWVyIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICB0aGlzLmNvbmZpZyA9IHtcblxuICAgIHBsYXlOZXh0OiBmYWxzZSwgICAvLyBzdG9wIGFmdGVyIG9uZSBzb3VuZCwgb3IgcGxheSB0aHJvdWdoIGxpc3QgdW50aWwgZW5kXG4gICAgYXV0b1BsYXk6IGZhbHNlLCAgIC8vIHN0YXJ0IHBsYXlpbmcgdGhlIGZpcnN0IHNvdW5kIHJpZ2h0IGF3YXlcbiAgICBhbGxvd011bHRpcGxlOiBmYWxzZSwgIC8vIGxldCBtYW55IHNvdW5kcyBwbGF5IGF0IG9uY2UgKGZhbHNlID0gb25seSBvbmUgc291bmQgcGxheWluZyBhdCBhIHRpbWUpXG4gICAgbG9hZFJpbmdDb2xvcjogJyNjY2MnLCAvLyBob3cgbXVjaCBoYXMgbG9hZGVkXG4gICAgcGxheVJpbmdDb2xvcjogJyMwMDAnLCAvLyBob3cgbXVjaCBoYXMgcGxheWVkXG4gICAgYmFja2dyb3VuZFJpbmdDb2xvcjogJyNlZWUnLCAvLyBjb2xvciBzaG93biB1bmRlcm5lYXRoIGxvYWQgKyBwbGF5IChcIm5vdCB5ZXQgbG9hZGVkXCIgY29sb3IpXG5cbiAgICAvLyBvcHRpb25hbCBzZWdtZW50L2Fubm90YXRpb24gKG1ldGFkYXRhKSBzdHVmZi4uXG4gICAgc2VnbWVudFJpbmdDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC4zMyknLCAvLyBtZXRhZGF0YS9hbm5vdGF0aW9uIChzZWdtZW50KSBjb2xvcnNcbiAgICBzZWdtZW50UmluZ0NvbG9yQWx0OiAncmdiYSgwLDAsMCwwLjEpJyxcbiAgICBsb2FkUmluZ0NvbG9yTWV0YWRhdGE6ICcjZGRkJywgLy8gXCJhbm5vdGF0aW9uc1wiIGxvYWQgY29sb3JcbiAgICBwbGF5UmluZ0NvbG9yTWV0YWRhdGE6ICdyZ2JhKDEyOCwxOTIsMjU2LDAuOSknLCAvLyBob3cgbXVjaCBoYXMgcGxheWVkIHdoZW4gbWV0YWRhdGEgaXMgcHJlc2VudFxuXG4gICAgY2lyY2xlRGlhbWV0ZXI6IG51bGwsIC8vIHNldCBkeW5hbWljYWxseSBhY2NvcmRpbmcgdG8gdmFsdWVzIGZyb20gQ1NTXG4gICAgY2lyY2xlUmFkaXVzOiBudWxsLFxuICAgIGFuaW1EdXJhdGlvbjogNTAwLFxuICAgIGFuaW1UcmFuc2l0aW9uOiB3aW5kb3cuQW5pbWF0b3IudHguYm91bmN5LCAvLyBodHRwOi8vd3d3LmJlcm5pZWNvZGUuY29tL3dyaXRpbmcvYW5pbWF0b3IuaHRtbFxuICAgIHNob3dITVNUaW1lOiBmYWxzZSwgLy8gaG91cnM6bWludXRlczpzZWNvbmRzIHZzLiBzZWNvbmRzLW9ubHlcbiAgICBzY2FsZUZvbnQ6IHRydWUsICAvLyBhbHNvIHNldCB0aGUgZm9udCBzaXplIChpZiBwb3NzaWJsZSkgd2hpbGUgYW5pbWF0aW5nIHRoZSBjaXJjbGVcblxuICAgIC8vIG9wdGlvbmFsOiBzcGVjdHJ1bSBvciBFUSBncmFwaCBpbiBjYW52YXMgKG5vdCBzdXBwb3J0ZWQgaW4gSUUgPDksIHRvbyBzbG93IHZpYSBFeENhbnZhcylcbiAgICB1c2VXYXZlZm9ybURhdGE6IGZhbHNlLFxuICAgIHdhdmVmb3JtRGF0YUNvbG9yOiAnIzAwOTlmZicsXG4gICAgd2F2ZWZvcm1EYXRhRG93bnNhbXBsZTogMywgLy8gdXNlIG9ubHkgb25lIGluIFggKG9mIGEgc2V0IG9mIDI1NiB2YWx1ZXMpIC0gMSBtZWFucyBhbGwgMjU2XG4gICAgd2F2ZWZvcm1EYXRhT3V0c2lkZTogZmFsc2UsXG4gICAgd2F2ZWZvcm1EYXRhQ29uc3RyYWluOiBmYWxzZSwgLy8gaWYgdHJ1ZSwgK3ZlIHZhbHVlcyBvbmx5IC0ga2VlcCB3aXRoaW4gaW5zaWRlIGNpcmNsZVxuICAgIHdhdmVmb3JtRGF0YUxpbmVSYXRpbzogMC42NCxcblxuICAgIC8vIFwic3BlY3RydW0gZnJlcXVlbmN5XCIgb3B0aW9uXG4gICAgdXNlRVFEYXRhOiBmYWxzZSxcbiAgICBlcURhdGFDb2xvcjogJyMzMzk5MzMnLFxuICAgIGVxRGF0YURvd25zYW1wbGU6IDQsIC8vIHVzZSBvbmx5IG9uZSBpbiBYIChvZiAyNTYgdmFsdWVzKVxuICAgIGVxRGF0YU91dHNpZGU6IHRydWUsXG4gICAgZXFEYXRhTGluZVJhdGlvOiAwLjU0LFxuXG4gICAgLy8gZW5hYmxlIFwiYW1wbGlmaWVyXCIgKGNhbnZhcyBwdWxzZXMgbGlrZSBhIHNwZWFrZXIpIGVmZmVjdFxuICAgIHVzZVBlYWtEYXRhOiB0cnVlLFxuICAgIHBlYWtEYXRhQ29sb3I6ICcjZmYzM2ZmJyxcbiAgICBwZWFrRGF0YU91dHNpZGU6IHRydWUsXG4gICAgcGVha0RhdGFMaW5lUmF0aW86IDAuNSxcblxuICAgIHVzZUFtcGxpZmllcjogdHJ1ZSwgLy8gXCJwdWxzZVwiIGxpa2UgYSBzcGVha2VyXG5cbiAgICBmb250U2l6ZU1heDogbnVsbCwgLy8gc2V0IGFjY29yZGluZyB0byBDU1NcblxuICAgIHVzZUZhdkljb246IGZhbHNlIC8vIEV4cGVyaW1lbnRhbCAoYWxzbyByZXF1aXJlcyB1c2VQZWFrRGF0YTogdHJ1ZSkuLiBUcnkgdG8gZHJhdyBhIFwiVlUgTWV0ZXJcIiBpbiB0aGUgZmF2aWNvbiBhcmVhLCBpZiBicm93c2VyIHN1cHBvcnRzIGl0IChGaXJlZm94ICsgT3BlcmEgYXMgb2YgMjAwOSlcblxuICB9O1xuXG4gIHRoaXMuY3NzID0ge1xuXG4gICAgLy8gQ1NTIGNsYXNzIG5hbWVzIGFwcGVuZGVkIHRvIGxpbmsgZHVyaW5nIHZhcmlvdXMgc3RhdGVzXG4gICAgc0RlZmF1bHQ6ICdzbTJfbGluaycsIC8vIGRlZmF1bHQgc3RhdGVcbiAgICBzQnVmZmVyaW5nOiAnc20yX2J1ZmZlcmluZycsXG4gICAgc1BsYXlpbmc6ICdzbTJfcGxheWluZycsXG4gICAgc1BhdXNlZDogJ3NtMl9wYXVzZWQnXG5cbiAgfTtcblxuICB0aGlzLmFkZEV2ZW50SGFuZGxlciA9ICh0eXBlb2Ygd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgIT09ICd1bmRlZmluZWQnID8gZnVuY3Rpb24obywgZXZ0TmFtZSwgZXZ0SGFuZGxlcikge1xuICAgIHJldHVybiBvLmFkZEV2ZW50TGlzdGVuZXIoZXZ0TmFtZSxldnRIYW5kbGVyLGZhbHNlKTtcbiAgfSA6IGZ1bmN0aW9uKG8sIGV2dE5hbWUsIGV2dEhhbmRsZXIpIHtcbiAgICBvLmF0dGFjaEV2ZW50KCdvbicrZXZ0TmFtZSxldnRIYW5kbGVyKTtcbiAgfSk7XG5cbiAgdGhpcy5yZW1vdmVFdmVudEhhbmRsZXIgPSAodHlwZW9mIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICE9PSAndW5kZWZpbmVkJyA/IGZ1bmN0aW9uKG8sIGV2dE5hbWUsIGV2dEhhbmRsZXIpIHtcbiAgICByZXR1cm4gby5yZW1vdmVFdmVudExpc3RlbmVyKGV2dE5hbWUsZXZ0SGFuZGxlcixmYWxzZSk7XG4gIH0gOiBmdW5jdGlvbihvLCBldnROYW1lLCBldnRIYW5kbGVyKSB7XG4gICAgcmV0dXJuIG8uZGV0YWNoRXZlbnQoJ29uJytldnROYW1lLGV2dEhhbmRsZXIpO1xuICB9KTtcblxuICB0aGlzLmhhc0NsYXNzID0gZnVuY3Rpb24obyxjU3RyKSB7XG4gICAgcmV0dXJuIHR5cGVvZihvLmNsYXNzTmFtZSkhPT0ndW5kZWZpbmVkJz9vLmNsYXNzTmFtZS5tYXRjaChuZXcgUmVnRXhwKCcoXFxcXHN8XiknK2NTdHIrJyhcXFxcc3wkKScpKTpmYWxzZTtcbiAgfTtcblxuICB0aGlzLmFkZENsYXNzID0gZnVuY3Rpb24obyxjU3RyKSB7XG5cbiAgICBpZiAoIW8gfHwgIWNTdHIgfHwgc2VsZi5oYXNDbGFzcyhvLGNTdHIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG8uY2xhc3NOYW1lID0gKG8uY2xhc3NOYW1lP28uY2xhc3NOYW1lKycgJzonJykrY1N0cjtcblxuICB9O1xuXG4gIHRoaXMucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihvLGNTdHIpIHtcblxuICAgIGlmICghbyB8fCAhY1N0ciB8fCAhc2VsZi5oYXNDbGFzcyhvLGNTdHIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG8uY2xhc3NOYW1lID0gby5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoICcrY1N0cisnKXwoJytjU3RyKycpJywnZycpLCcnKTtcblxuICB9O1xuXG4gIHRoaXMuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSA9IGZ1bmN0aW9uKGNsYXNzTmFtZSx0YWdOYW1lcyxvUGFyZW50KSB7XG5cbiAgICB2YXIgZG9jID0gKG9QYXJlbnR8fGRvY3VtZW50KSxcbiAgICAgICAgbWF0Y2hlcyA9IFtdLCBpLGosIG5vZGVzID0gW107XG4gICAgaWYgKHR5cGVvZiB0YWdOYW1lcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHRhZ05hbWVzICE9PSAnc3RyaW5nJykge1xuICAgICAgZm9yIChpPXRhZ05hbWVzLmxlbmd0aDsgaS0tOykge1xuICAgICAgICBpZiAoIW5vZGVzIHx8ICFub2Rlc1t0YWdOYW1lc1tpXV0pIHtcbiAgICAgICAgICBub2Rlc1t0YWdOYW1lc1tpXV0gPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWdOYW1lcykge1xuICAgICAgbm9kZXMgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlcyA9IGRvYy5hbGx8fGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mKHRhZ05hbWVzKSE9PSdzdHJpbmcnKSB7XG4gICAgICBmb3IgKGk9dGFnTmFtZXMubGVuZ3RoOyBpLS07KSB7XG4gICAgICAgIGZvciAoaj1ub2Rlc1t0YWdOYW1lc1tpXV0ubGVuZ3RoOyBqLS07KSB7XG4gICAgICAgICAgaWYgKHNlbGYuaGFzQ2xhc3Mobm9kZXNbdGFnTmFtZXNbaV1dW2pdLGNsYXNzTmFtZSkpIHtcbiAgICAgICAgICAgIG1hdGNoZXMucHVzaChub2Rlc1t0YWdOYW1lc1tpXV1bal0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGk9MDsgaTxub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5oYXNDbGFzcyhub2Rlc1tpXSxjbGFzc05hbWUpKSB7XG4gICAgICAgICAgbWF0Y2hlcy5wdXNoKG5vZGVzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlcztcblxuICB9O1xuXG4gIHRoaXMuZ2V0UGFyZW50QnlOb2RlTmFtZSA9IGZ1bmN0aW9uKG9DaGlsZCxzUGFyZW50Tm9kZU5hbWUpIHtcblxuICAgIGlmICghb0NoaWxkIHx8ICFzUGFyZW50Tm9kZU5hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc1BhcmVudE5vZGVOYW1lID0gc1BhcmVudE5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgd2hpbGUgKG9DaGlsZC5wYXJlbnROb2RlICYmIHNQYXJlbnROb2RlTmFtZSAhPT0gb0NoaWxkLnBhcmVudE5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgb0NoaWxkID0gb0NoaWxkLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiAob0NoaWxkLnBhcmVudE5vZGUgJiYgc1BhcmVudE5vZGVOYW1lID09PSBvQ2hpbGQucGFyZW50Tm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpP29DaGlsZC5wYXJlbnROb2RlOm51bGwpO1xuXG4gIH07XG5cbiAgdGhpcy5nZXRQYXJlbnRCeUNsYXNzTmFtZSA9IGZ1bmN0aW9uKG9DaGlsZCxzUGFyZW50Q2xhc3NOYW1lKSB7XG5cbiAgICBpZiAoIW9DaGlsZCB8fCAhc1BhcmVudENsYXNzTmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB3aGlsZSAob0NoaWxkLnBhcmVudE5vZGUgJiYgIXNlbGYuaGFzQ2xhc3Mob0NoaWxkLnBhcmVudE5vZGUsc1BhcmVudENsYXNzTmFtZSkpIHtcbiAgICAgIG9DaGlsZCA9IG9DaGlsZC5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gKG9DaGlsZC5wYXJlbnROb2RlICYmIHNlbGYuaGFzQ2xhc3Mob0NoaWxkLnBhcmVudE5vZGUsc1BhcmVudENsYXNzTmFtZSk/b0NoaWxkLnBhcmVudE5vZGU6bnVsbCk7XG5cbiAgfTtcblxuICB0aGlzLmdldFNvdW5kQnlVUkwgPSBmdW5jdGlvbihzVVJMKSB7XG4gICAgcmV0dXJuICh0eXBlb2Ygc2VsZi5zb3VuZHNCeVVSTFtzVVJMXSAhPT0gJ3VuZGVmaW5lZCc/c2VsZi5zb3VuZHNCeVVSTFtzVVJMXTpudWxsKTtcbiAgfTtcblxuICB0aGlzLmlzQ2hpbGRPZk5vZGUgPSBmdW5jdGlvbihvLHNOb2RlTmFtZSkge1xuXG4gICAgaWYgKCFvIHx8ICFvLnBhcmVudE5vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc05vZGVOYW1lID0gc05vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgZG8ge1xuICAgICAgbyA9IG8ucGFyZW50Tm9kZTtcbiAgICB9IHdoaWxlIChvICYmIG8ucGFyZW50Tm9kZSAmJiBvLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHNOb2RlTmFtZSk7XG4gICAgcmV0dXJuIChvICYmIG8ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gc05vZGVOYW1lP286bnVsbCk7XG5cbiAgfTtcblxuICB0aGlzLmlzQ2hpbGRPZkNsYXNzID0gZnVuY3Rpb24ob0NoaWxkLG9DbGFzcykge1xuXG4gICAgaWYgKCFvQ2hpbGQgfHwgIW9DbGFzcykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB3aGlsZSAob0NoaWxkLnBhcmVudE5vZGUgJiYgIXNlbGYuaGFzQ2xhc3Mob0NoaWxkLG9DbGFzcykpIHtcbiAgICAgIG9DaGlsZCA9IHNlbGYuZmluZFBhcmVudChvQ2hpbGQpO1xuICAgIH1cbiAgICByZXR1cm4gKHNlbGYuaGFzQ2xhc3Mob0NoaWxkLG9DbGFzcykpO1xuXG4gIH07XG5cbiAgdGhpcy5maW5kUGFyZW50ID0gZnVuY3Rpb24obykge1xuXG4gICAgaWYgKCFvIHx8ICFvLnBhcmVudE5vZGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbyA9IG8ucGFyZW50Tm9kZTtcbiAgICBpZiAoby5ub2RlVHlwZSA9PT0gMikge1xuICAgICAgd2hpbGUgKG8gJiYgby5wYXJlbnROb2RlICYmIG8ucGFyZW50Tm9kZS5ub2RlVHlwZSA9PT0gMikge1xuICAgICAgICBvID0gby5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbztcblxuICB9O1xuXG4gIHRoaXMuZ2V0U3R5bGUgPSBmdW5jdGlvbihvLHNQcm9wKSB7XG5cbiAgICAvLyBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL2RvbS9nZXRzdHlsZXMuaHRtbFxuICAgIHRyeSB7XG4gICAgICBpZiAoby5jdXJyZW50U3R5bGUpIHtcbiAgICAgICAgcmV0dXJuIG8uY3VycmVudFN0eWxlW3NQcm9wXTtcbiAgICAgIH0gZWxzZSBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUobyxudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHNQcm9wKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIC8vIG9oIHdlbGxcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG5cbiAgfTtcblxuICB0aGlzLmZpbmRYWSA9IGZ1bmN0aW9uKG9iaikge1xuXG4gICAgdmFyIGN1cmxlZnQgPSAwLCBjdXJ0b3AgPSAwO1xuICAgIGRvIHtcbiAgICAgIGN1cmxlZnQgKz0gb2JqLm9mZnNldExlZnQ7XG4gICAgICBjdXJ0b3AgKz0gb2JqLm9mZnNldFRvcDtcbiAgICB9IHdoaWxlICghIShvYmogPSBvYmoub2Zmc2V0UGFyZW50KSk7XG4gICAgcmV0dXJuIFtjdXJsZWZ0LGN1cnRvcF07XG5cbiAgfTtcblxuICB0aGlzLmdldE1vdXNlWFkgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvLyBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL2pzL2V2ZW50c19wcm9wZXJ0aWVzLmh0bWxcbiAgICBlID0gZT9lOndpbmRvdy5ldmVudDtcbiAgICBpZiAoaXNUb3VjaERldmljZSAmJiBlLnRvdWNoZXMpIHtcbiAgICAgIGUgPSBlLnRvdWNoZXNbMF07XG4gICAgfVxuICAgIGlmIChlLnBhZ2VYIHx8IGUucGFnZVkpIHtcbiAgICAgIHJldHVybiBbZS5wYWdlWCxlLnBhZ2VZXTtcbiAgICB9IGVsc2UgaWYgKGUuY2xpZW50WCB8fCBlLmNsaWVudFkpIHtcbiAgICAgIHJldHVybiBbZS5jbGllbnRYK3NlbGYuZ2V0U2Nyb2xsTGVmdCgpLGUuY2xpZW50WStzZWxmLmdldFNjcm9sbFRvcCgpXTtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmdldFNjcm9sbExlZnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCk7XG4gIH07XG5cbiAgdGhpcy5nZXRTY3JvbGxUb3AgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wK2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApO1xuICB9O1xuXG4gIHRoaXMuZXZlbnRzID0ge1xuXG4gICAgLy8gaGFuZGxlcnMgZm9yIHNvdW5kIGV2ZW50cyBhcyB0aGV5J3JlIHN0YXJ0ZWQvc3RvcHBlZC9wbGF5ZWRcblxuICAgIHBsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihwbC5jb25maWcub25wbGF5KXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbnBsYXkodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIHBsLnJlbW92ZUNsYXNzKHRoaXMuXzM2MGRhdGEub1VJQm94LHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lKTtcbiAgICAgIHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lID0gcGwuY3NzLnNQbGF5aW5nO1xuICAgICAgcGwuYWRkQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gsdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUpO1xuICAgICAgc2VsZi5mYW5PdXQodGhpcyk7XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihwbC5jb25maWcub25zdG9wKXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbnN0b3AodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIHBsLnJlbW92ZUNsYXNzKHRoaXMuXzM2MGRhdGEub1VJQm94LHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lKTtcbiAgICAgIHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lID0gJyc7XG4gICAgICBzZWxmLmZhbkluKHRoaXMpO1xuICAgIH0sXG5cbiAgICBwYXVzZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKHBsLmNvbmZpZy5vbnBhdXNlKXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbnBhdXNlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICBwbC5yZW1vdmVDbGFzcyh0aGlzLl8zNjBkYXRhLm9VSUJveCx0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSk7XG4gICAgICB0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSA9IHBsLmNzcy5zUGF1c2VkO1xuICAgICAgcGwuYWRkQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gsdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUpO1xuICAgIH0sXG5cbiAgICByZXN1bWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZihwbC5jb25maWcub25yZXN1bWUpe1xuICAgICAgICAgICAgcGwuY29uZmlnLm9ucmVzdW1lKHRoaXMpO1xuICAgICAgICB9XG4gICAgICBwbC5yZW1vdmVDbGFzcyh0aGlzLl8zNjBkYXRhLm9VSUJveCx0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSk7XG4gICAgICB0aGlzLl8zNjBkYXRhLmNsYXNzTmFtZSA9IHBsLmNzcy5zUGxheWluZztcbiAgICAgIHBsLmFkZENsYXNzKHRoaXMuXzM2MGRhdGEub1VJQm94LHRoaXMuXzM2MGRhdGEuY2xhc3NOYW1lKTtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXh0TGluaztcbiAgICAgICAgaWYocGwuY29uZmlnLm9uZmluaXNoKXtcbiAgICAgICAgICAgIHBsLmNvbmZpZy5vbmZpbmlzaCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgcGwucmVtb3ZlQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gsdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUpO1xuICAgICAgdGhpcy5fMzYwZGF0YS5jbGFzc05hbWUgPSAnJztcbiAgICAgIC8vIHNlbGYuY2xlYXJDYW52YXModGhpcy5fMzYwZGF0YS5vQ2FudmFzKTtcbiAgICAgIHRoaXMuXzM2MGRhdGEuZGlkRmluaXNoID0gdHJ1ZTsgLy8gc28gZmFuIGRyYXdzIGZ1bGwgY2lyY2xlXG4gICAgICBzZWxmLmZhbkluKHRoaXMpO1xuICAgICAgaWYgKHBsLmNvbmZpZy5wbGF5TmV4dCkge1xuICAgICAgICBuZXh0TGluayA9IChwbC5pbmRleEJ5VVJMW3RoaXMuXzM2MGRhdGEub0xpbmsuaHJlZl0rMSk7XG4gICAgICAgIGlmIChuZXh0TGluazxwbC5saW5rcy5sZW5ndGgpIHtcbiAgICAgICAgICBwbC5oYW5kbGVDbGljayh7J3RhcmdldCc6cGwubGlua3NbbmV4dExpbmtdfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgd2hpbGVsb2FkaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgICBzZWxmLnVwZGF0ZVBsYXlpbmcuYXBwbHkodGhpcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHdoaWxlcGxheWluZzogZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLnVwZGF0ZVBsYXlpbmcuYXBwbHkodGhpcyk7XG4gICAgICB0aGlzLl8zNjBkYXRhLmZwcysrO1xuICAgIH0sXG5cbiAgICBidWZmZXJjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaXNCdWZmZXJpbmcpIHtcbiAgICAgICAgcGwuYWRkQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gscGwuY3NzLnNCdWZmZXJpbmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGwucmVtb3ZlQ2xhc3ModGhpcy5fMzYwZGF0YS5vVUlCb3gscGwuY3NzLnNCdWZmZXJpbmcpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMuc3RvcEV2ZW50ID0gZnVuY3Rpb24oZSkge1xuXG4gICBpZiAodHlwZW9mIGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBlLnByZXZlbnREZWZhdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdy5ldmVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5ldmVudC5yZXR1cm5WYWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICB0aGlzLmdldFRoZURhbW5MaW5rID0gKGlzSUUpP2Z1bmN0aW9uKGUpIHtcbiAgICAvLyBJIHJlYWxseSBkaWRuJ3Qgd2FudCB0byBoYXZlIHRvIGRvIHRoaXMuXG4gICAgcmV0dXJuIChlICYmIGUudGFyZ2V0P2UudGFyZ2V0OndpbmRvdy5ldmVudC5zcmNFbGVtZW50KTtcbiAgfTpmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGUudGFyZ2V0O1xuICB9O1xuXG4gIHRoaXMuaGFuZGxlQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvLyBhIHNvdW5kIGxpbmsgd2FzIGNsaWNrZWRcbiAgICBpZiAoZS5idXR0b24gPiAxKSB7XG4gICAgICAvLyBvbmx5IGNhdGNoIGxlZnQtY2xpY2tzXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgbyA9IHNlbGYuZ2V0VGhlRGFtbkxpbmsoZSksXG4gICAgICAgIHNVUkwsIHNvdW5kVVJMLCB0aGlzU291bmQsIG9Db250YWluZXIsIGhhc192aXMsIGRpYW1ldGVyO1xuXG4gICAgaWYgKG8ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2EnKSB7XG4gICAgICBvID0gc2VsZi5pc0NoaWxkT2ZOb2RlKG8sJ2EnKTtcbiAgICAgIGlmICghbykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXNlbGYuaXNDaGlsZE9mQ2xhc3MobywndWkzNjAnKSkge1xuICAgICAgLy8gbm90IGEgbGluayB3ZSdyZSBpbnRlcmVzdGVkIGluXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBzVVJMID0gby5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgIGlmICghby5ocmVmIHx8ICFzbS5jYW5QbGF5TGluayhvKSB8fCBzZWxmLmhhc0NsYXNzKG8sc2VsZi5leGNsdWRlQ2xhc3MpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTsgLy8gcGFzcy10aHJ1IGZvciBub24tTVAzL25vbi1saW5rc1xuICAgIH1cblxuICAgIHNtLl93cml0ZURlYnVnKCdoYW5kbGVDbGljaygpJyk7XG4gICAgc291bmRVUkwgPSAoby5ocmVmKTtcbiAgICB0aGlzU291bmQgPSBzZWxmLmdldFNvdW5kQnlVUkwoc291bmRVUkwpO1xuXG4gICAgaWYgKHRoaXNTb3VuZCkge1xuXG4gICAgICAvLyBhbHJlYWR5IGV4aXN0c1xuICAgICAgaWYgKHRoaXNTb3VuZCA9PT0gc2VsZi5sYXN0U291bmQpIHtcbiAgICAgICAgLy8gYW5kIHdhcyBwbGF5aW5nIChvciBwYXVzZWQpXG4gICAgICAgIHRoaXNTb3VuZC50b2dnbGVQYXVzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGlmZmVyZW50IHNvdW5kXG4gICAgICAgIHRoaXNTb3VuZC50b2dnbGVQYXVzZSgpOyAvLyBzdGFydCBwbGF5aW5nIGN1cnJlbnRcbiAgICAgICAgc20uX3dyaXRlRGVidWcoJ3NvdW5kIGRpZmZlcmVudCB0aGFuIGxhc3Qgc291bmQ6ICcrc2VsZi5sYXN0U291bmQuc0lEKTtcbiAgICAgICAgaWYgKCFzZWxmLmNvbmZpZy5hbGxvd011bHRpcGxlICYmIHNlbGYubGFzdFNvdW5kKSB7XG4gICAgICAgICAgc2VsZi5zdG9wU291bmQoc2VsZi5sYXN0U291bmQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyBhcHBlbmQgc29tZSBkb20gc2hpeiwgbWFrZSBub2lzZVxuXG4gICAgICBvQ29udGFpbmVyID0gby5wYXJlbnROb2RlO1xuICAgICAgaGFzX3ZpcyA9IChzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3VpMzYwLXZpcycsJ2Rpdicsb0NvbnRhaW5lci5wYXJlbnROb2RlKS5sZW5ndGgpO1xuXG4gICAgICAvLyBjcmVhdGUgc291bmRcbiAgICAgIHRoaXNTb3VuZCA9IHNtLmNyZWF0ZVNvdW5kKHtcbiAgICAgICBpZDondWkzNjBTb3VuZF8nK3BhcnNlSW50KE1hdGgucmFuZG9tKCkqMTAwMDAwMDApLFxuICAgICAgIHVybDpzb3VuZFVSTCxcbiAgICAgICBvbnBsYXk6c2VsZi5ldmVudHMucGxheSxcbiAgICAgICBvbnN0b3A6c2VsZi5ldmVudHMuc3RvcCxcbiAgICAgICBvbnBhdXNlOnNlbGYuZXZlbnRzLnBhdXNlLFxuICAgICAgIG9ucmVzdW1lOnNlbGYuZXZlbnRzLnJlc3VtZSxcbiAgICAgICBvbmZpbmlzaDpzZWxmLmV2ZW50cy5maW5pc2gsXG4gICAgICAgb25idWZmZXJjaGFuZ2U6c2VsZi5ldmVudHMuYnVmZmVyY2hhbmdlLFxuICAgICAgIHdoaWxlbG9hZGluZzpzZWxmLmV2ZW50cy53aGlsZWxvYWRpbmcsXG4gICAgICAgd2hpbGVwbGF5aW5nOnNlbGYuZXZlbnRzLndoaWxlcGxheWluZyxcbiAgICAgICB1c2VXYXZlZm9ybURhdGE6KGhhc192aXMgJiYgc2VsZi5jb25maWcudXNlV2F2ZWZvcm1EYXRhKSxcbiAgICAgICB1c2VFUURhdGE6KGhhc192aXMgJiYgc2VsZi5jb25maWcudXNlRVFEYXRhKSxcbiAgICAgICB1c2VQZWFrRGF0YTooaGFzX3ZpcyAmJiBzZWxmLmNvbmZpZy51c2VQZWFrRGF0YSlcbiAgICAgIH0pO1xuXG4gICAgICAvLyB0YWNrIG9uIHNvbWUgY3VzdG9tIGRhdGFcblxuICAgICAgZGlhbWV0ZXIgPSBwYXJzZUludChzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NtMi0zNjB1aScsJ2Rpdicsb0NvbnRhaW5lcilbMF0ub2Zmc2V0V2lkdGgsIDEwKTtcblxuICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhID0ge1xuICAgICAgICBvVUkzNjA6IHNlbGYuZ2V0UGFyZW50QnlDbGFzc05hbWUobywndWkzNjAnKSwgLy8gdGhlICh3aG9sZSkgZW50aXJlIGNvbnRhaW5lclxuICAgICAgICBvTGluazogbywgLy8gRE9NIG5vZGUgZm9yIHJlZmVyZW5jZSB3aXRoaW4gU00yIG9iamVjdCBldmVudCBoYW5kbGVyc1xuICAgICAgICBjbGFzc05hbWU6IHNlbGYuY3NzLnNQbGF5aW5nLFxuICAgICAgICBvVUlCb3g6IHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc20yLTM2MHVpJywnZGl2JyxvQ29udGFpbmVyKVswXSxcbiAgICAgICAgb0NhbnZhczogc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItY2FudmFzJywnY2FudmFzJyxvQ29udGFpbmVyKVswXSxcbiAgICAgICAgb0J1dHRvbjogc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItMzYwYnRuJywnc3Bhbicsb0NvbnRhaW5lcilbMF0sXG4gICAgICAgIG9UaW1pbmc6IHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc20yLXRpbWluZycsJ2Rpdicsb0NvbnRhaW5lcilbMF0sXG4gICAgICAgIG9Db3Zlcjogc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItY292ZXInLCdkaXYnLG9Db250YWluZXIpWzBdLFxuICAgICAgICBjaXJjbGVEaWFtZXRlcjogZGlhbWV0ZXIsXG4gICAgICAgIGNpcmNsZVJhZGl1czogZGlhbWV0ZXIvMixcbiAgICAgICAgbGFzdFRpbWU6IG51bGwsXG4gICAgICAgIGRpZEZpbmlzaDogbnVsbCxcbiAgICAgICAgcGF1c2VDb3VudDowLFxuICAgICAgICByYWRpdXM6MCxcbiAgICAgICAgZm9udFNpemU6IDEsXG4gICAgICAgIGZvbnRTaXplTWF4OiBzZWxmLmNvbmZpZy5mb250U2l6ZU1heCxcbiAgICAgICAgc2NhbGVGb250OiAoaGFzX3ZpcyAmJiBzZWxmLmNvbmZpZy5zY2FsZUZvbnQpLFxuICAgICAgICBzaG93SE1TVGltZTogaGFzX3ZpcyxcbiAgICAgICAgYW1wbGlmaWVyOiAoaGFzX3ZpcyAmJiBzZWxmLmNvbmZpZy51c2VQZWFrRGF0YT8wLjk6MSksIC8vIFRPRE86IHgxIGlmIG5vdCBiZWluZyB1c2VkLCBlbHNlIHVzZSBkeW5hbWljIFwiaG93IG11Y2ggdG8gYW1wbGlmeSBieVwiIHZhbHVlXG4gICAgICAgIHJhZGl1c01heDogZGlhbWV0ZXIqMC4xNzUsIC8vIGNpcmNsZSByYWRpdXNcbiAgICAgICAgd2lkdGg6MCxcbiAgICAgICAgd2lkdGhNYXg6IGRpYW1ldGVyKjAuNCwgLy8gd2lkdGggb2YgdGhlIG91dGVyIHJpbmdcbiAgICAgICAgbGFzdFZhbHVlczoge1xuICAgICAgICAgIGJ5dGVzTG9hZGVkOiAwLFxuICAgICAgICAgIGJ5dGVzVG90YWw6IDAsXG4gICAgICAgICAgcG9zaXRpb246IDAsXG4gICAgICAgICAgZHVyYXRpb25Fc3RpbWF0ZTogMFxuICAgICAgICB9LCAvLyB1c2VkIHRvIHRyYWNrIFwibGFzdCBnb29kIGtub3duXCIgdmFsdWVzIGJlZm9yZSBzb3VuZCBmaW5pc2gvcmVzZXQgZm9yIGFuaW1cbiAgICAgICAgYW5pbWF0aW5nOiBmYWxzZSxcbiAgICAgICAgb0FuaW06IG5ldyB3aW5kb3cuQW5pbWF0b3Ioe1xuICAgICAgICAgIGR1cmF0aW9uOiBzZWxmLmNvbmZpZy5hbmltRHVyYXRpb24sXG4gICAgICAgICAgdHJhbnNpdGlvbjpzZWxmLmNvbmZpZy5hbmltVHJhbnNpdGlvbixcbiAgICAgICAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIHZhciB0aGlzU291bmQgPSB0aGlzO1xuICAgICAgICAgICAgLy8gdGhpc1NvdW5kLl8zNjBkYXRhLmRpZEZpbmlzaCA9IGZhbHNlOyAvLyByZXNldCBmdWxsIGNpcmNsZVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIG9BbmltUHJvZ3Jlc3M6IGZ1bmN0aW9uKG5Qcm9ncmVzcykge1xuICAgICAgICAgIHZhciB0aGlzU291bmQgPSB0aGlzO1xuICAgICAgICAgIHRoaXNTb3VuZC5fMzYwZGF0YS5yYWRpdXMgPSBwYXJzZUludCh0aGlzU291bmQuXzM2MGRhdGEucmFkaXVzTWF4KnRoaXNTb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIqblByb2dyZXNzLCAxMCk7XG4gICAgICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLndpZHRoID0gcGFyc2VJbnQodGhpc1NvdW5kLl8zNjBkYXRhLndpZHRoTWF4KnRoaXNTb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIqblByb2dyZXNzLCAxMCk7XG4gICAgICAgICAgaWYgKHRoaXNTb3VuZC5fMzYwZGF0YS5zY2FsZUZvbnQgJiYgdGhpc1NvdW5kLl8zNjBkYXRhLmZvbnRTaXplTWF4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzU291bmQuXzM2MGRhdGEub1RpbWluZy5zdHlsZS5mb250U2l6ZSA9IHBhcnNlSW50KE1hdGgubWF4KDEsdGhpc1NvdW5kLl8zNjBkYXRhLmZvbnRTaXplTWF4Km5Qcm9ncmVzcyksIDEwKSsncHgnO1xuICAgICAgICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLm9UaW1pbmcuc3R5bGUub3BhY2l0eSA9IG5Qcm9ncmVzcztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXNTb3VuZC5wYXVzZWQgfHwgdGhpc1NvdW5kLnBsYXlTdGF0ZSA9PT0gMCB8fCB0aGlzU291bmQuXzM2MGRhdGEubGFzdFZhbHVlcy5ieXRlc0xvYWRlZCA9PT0gMCB8fCB0aGlzU291bmQuXzM2MGRhdGEubGFzdFZhbHVlcy5wb3NpdGlvbiA9PT0gMCkge1xuICAgICAgICAgICAgc2VsZi51cGRhdGVQbGF5aW5nLmFwcGx5KHRoaXNTb3VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmcHM6IDBcbiAgICAgIH07XG5cbiAgICAgIC8vIFwiTWV0YWRhdGFcIiAoYW5ub3RhdGlvbnMpXG4gICAgICBpZiAodHlwZW9mIHNlbGYuTWV0YWRhdGEgIT09ICd1bmRlZmluZWQnICYmIHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWV0YWRhdGEnLCdkaXYnLHRoaXNTb3VuZC5fMzYwZGF0YS5vVUkzNjApLmxlbmd0aCkge1xuICAgICAgICB0aGlzU291bmQuXzM2MGRhdGEubWV0YWRhdGEgPSBuZXcgc2VsZi5NZXRhZGF0YSh0aGlzU291bmQsc2VsZik7XG4gICAgICB9XG5cbiAgICAgIC8vIG1pbmltaXplIHplIGZvbnRcbiAgICAgIGlmICh0aGlzU291bmQuXzM2MGRhdGEuc2NhbGVGb250ICYmIHRoaXNTb3VuZC5fMzYwZGF0YS5mb250U2l6ZU1heCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzU291bmQuXzM2MGRhdGEub1RpbWluZy5zdHlsZS5mb250U2l6ZSA9ICcxcHgnO1xuICAgICAgfVxuXG4gICAgICAvLyBzZXQgdXAgemUgYW5pbWF0aW9uXG4gICAgICB0aGlzU291bmQuXzM2MGRhdGEub0FuaW0uYWRkU3ViamVjdCh0aGlzU291bmQuXzM2MGRhdGEub0FuaW1Qcm9ncmVzcyx0aGlzU291bmQpO1xuXG4gICAgICAvLyBhbmltYXRlIHRoZSByYWRpdXMgb3V0IG5pY2VcbiAgICAgIHNlbGYucmVmcmVzaENvb3Jkcyh0aGlzU291bmQpO1xuXG4gICAgICBzZWxmLnVwZGF0ZVBsYXlpbmcuYXBwbHkodGhpc1NvdW5kKTtcblxuICAgICAgc2VsZi5zb3VuZHNCeVVSTFtzb3VuZFVSTF0gPSB0aGlzU291bmQ7XG4gICAgICBzZWxmLnNvdW5kcy5wdXNoKHRoaXNTb3VuZCk7XG4gICAgICBpZiAoIXNlbGYuY29uZmlnLmFsbG93TXVsdGlwbGUgJiYgc2VsZi5sYXN0U291bmQpIHtcbiAgICAgICAgc2VsZi5zdG9wU291bmQoc2VsZi5sYXN0U291bmQpO1xuICAgICAgfVxuICAgICAgdGhpc1NvdW5kLnBsYXkoKTtcblxuICAgIH1cblxuICAgIHNlbGYubGFzdFNvdW5kID0gdGhpc1NvdW5kOyAvLyByZWZlcmVuY2UgZm9yIG5leHQgY2FsbFxuXG4gICAgaWYgKHR5cGVvZiBlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZS5wcmV2ZW50RGVmYXVsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuZXZlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIH07XG5cbiAgdGhpcy5mYW5PdXQgPSBmdW5jdGlvbihvU291bmQpIHtcblxuICAgICB2YXIgdGhpc1NvdW5kID0gb1NvdW5kO1xuICAgICBpZiAodGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9PT0gMSkge1xuICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgfVxuICAgICB0aGlzU291bmQuXzM2MGRhdGEuYW5pbWF0aW5nID0gMDtcbiAgICAgc291bmRNYW5hZ2VyLl93cml0ZURlYnVnKCdmYW5PdXQ6ICcrdGhpc1NvdW5kLnNJRCsnOiAnK3RoaXNTb3VuZC5fMzYwZGF0YS5vTGluay5ocmVmKTtcbiAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLm9BbmltLnNlZWtUbygxKTsgLy8gcGxheSB0byBlbmRcbiAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgLy8gb25jb21wbGV0ZSBoYWNrXG4gICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9IDA7XG4gICAgIH0sc2VsZi5jb25maWcuYW5pbUR1cmF0aW9uKzIwKTtcblxuICB9O1xuXG4gIHRoaXMuZmFuSW4gPSBmdW5jdGlvbihvU291bmQpIHtcblxuICAgICB2YXIgdGhpc1NvdW5kID0gb1NvdW5kO1xuICAgICBpZiAodGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9PT0gLTEpIHtcbiAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgIH1cbiAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLmFuaW1hdGluZyA9IC0xO1xuICAgICBzb3VuZE1hbmFnZXIuX3dyaXRlRGVidWcoJ2ZhbkluOiAnK3RoaXNTb3VuZC5zSUQrJzogJyt0aGlzU291bmQuXzM2MGRhdGEub0xpbmsuaHJlZik7XG4gICAgIC8vIG1hc3NpdmUgaGFja1xuICAgICB0aGlzU291bmQuXzM2MGRhdGEub0FuaW0uc2Vla1RvKDApOyAvLyBwbGF5IHRvIGVuZFxuICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAvLyByZXNldCBmdWxsIDM2MCBmaWxsIGFmdGVyIGFuaW1hdGlvbiBoYXMgY29tcGxldGVkIChvbmNvbXBsZXRlIGhhY2spXG4gICAgICAgdGhpc1NvdW5kLl8zNjBkYXRhLmRpZEZpbmlzaCA9IGZhbHNlO1xuICAgICAgIHRoaXNTb3VuZC5fMzYwZGF0YS5hbmltYXRpbmcgPSAwO1xuICAgICAgIHNlbGYucmVzZXRMYXN0VmFsdWVzKHRoaXNTb3VuZCk7XG4gICAgIH0sIHNlbGYuY29uZmlnLmFuaW1EdXJhdGlvbisyMCk7XG5cbiAgfTtcblxuICB0aGlzLnJlc2V0TGFzdFZhbHVlcyA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xuICAgIG9Tb3VuZC5fMzYwZGF0YS5sYXN0VmFsdWVzLnBvc2l0aW9uID0gMDtcbiAgfTtcblxuICB0aGlzLnJlZnJlc2hDb29yZHMgPSBmdW5jdGlvbih0aGlzU291bmQpIHtcblxuICAgIHRoaXNTb3VuZC5fMzYwZGF0YS5jYW52YXNYWSA9IHNlbGYuZmluZFhZKHRoaXNTb3VuZC5fMzYwZGF0YS5vQ2FudmFzKTtcbiAgICB0aGlzU291bmQuXzM2MGRhdGEuY2FudmFzTWlkID0gW3RoaXNTb3VuZC5fMzYwZGF0YS5jaXJjbGVSYWRpdXMsdGhpc1NvdW5kLl8zNjBkYXRhLmNpcmNsZVJhZGl1c107XG4gICAgdGhpc1NvdW5kLl8zNjBkYXRhLmNhbnZhc01pZFhZID0gW3RoaXNTb3VuZC5fMzYwZGF0YS5jYW52YXNYWVswXSt0aGlzU291bmQuXzM2MGRhdGEuY2FudmFzTWlkWzBdLCB0aGlzU291bmQuXzM2MGRhdGEuY2FudmFzWFlbMV0rdGhpc1NvdW5kLl8zNjBkYXRhLmNhbnZhc01pZFsxXV07XG5cbiAgfTtcblxuICB0aGlzLnN0b3BTb3VuZCA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xuXG4gICAgc291bmRNYW5hZ2VyLl93cml0ZURlYnVnKCdzdG9wU291bmQ6ICcrb1NvdW5kLnNJRCk7XG4gICAgc291bmRNYW5hZ2VyLnN0b3Aob1NvdW5kLnNJRCk7XG4gICAgaWYgKCFpc1RvdWNoRGV2aWNlKSB7IC8vIGlPUyA0LjIrIHNlY3VyaXR5IGJsb2NrcyBvbmZpbmlzaCgpIC0+IHBsYXlOZXh0KCkgaWYgd2Ugc2V0IGEgLnNyYyBpbi1iZXR3ZWVuKD8pXG4gICAgICBzb3VuZE1hbmFnZXIudW5sb2FkKG9Tb3VuZC5zSUQpO1xuICAgIH1cblxuICB9O1xuXG4gIHRoaXMuYnV0dG9uQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG5cbiAgICB2YXIgbyA9IGU/KGUudGFyZ2V0P2UudGFyZ2V0OmUuc3JjRWxlbWVudCk6d2luZG93LmV2ZW50LnNyY0VsZW1lbnQ7XG4gICAgc2VsZi5oYW5kbGVDbGljayh7dGFyZ2V0OnNlbGYuZ2V0UGFyZW50QnlDbGFzc05hbWUobywnc20yLTM2MHVpJykubmV4dFNpYmxpbmd9KTsgLy8gbGluayBuZXh0IHRvIHRoZSBub2RlcyB3ZSBpbnNlcnRlZFxuICAgIHJldHVybiBmYWxzZTtcblxuICB9O1xuXG4gIHRoaXMuYnV0dG9uTW91c2VEb3duID0gZnVuY3Rpb24oZSkge1xuXG4gICAgLy8gdXNlciBtaWdodCBkZWNpZGUgdG8gZHJhZyBmcm9tIGhlcmVcbiAgICAvLyB3YXRjaCBmb3IgbW91c2UgbW92ZVxuICAgIGlmICghaXNUb3VjaERldmljZSkge1xuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vIHNob3VsZCBiZSBib3VuZGFyeS1jaGVja2VkLCByZWFsbHkgKGVnLiBtb3ZlIDNweCBmaXJzdD8pXG4gICAgICAgIHNlbGYubW91c2VEb3duKGUpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tb3VzZURvd24pO1xuICAgIH1cbiAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICB0aGlzLm1vdXNlRG93biA9IGZ1bmN0aW9uKGUpIHtcblxuICAgIGlmICghaXNUb3VjaERldmljZSAmJiBlLmJ1dHRvbiA+IDEpIHtcbiAgICAgIHJldHVybiB0cnVlOyAvLyBpZ25vcmUgbm9uLWxlZnQtY2xpY2tcbiAgICB9XG5cbiAgICBpZiAoIXNlbGYubGFzdFNvdW5kKSB7XG4gICAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZXZ0ID0gZT9lOndpbmRvdy5ldmVudCxcbiAgICAgICAgdGFyZ2V0LCB0aGlzU291bmQsIG9EYXRhO1xuXG4gICAgaWYgKGlzVG91Y2hEZXZpY2UgJiYgZXZ0LnRvdWNoZXMpIHtcbiAgICAgIGV2dCA9IGV2dC50b3VjaGVzWzBdO1xuICAgIH1cbiAgICB0YXJnZXQgPSAoZXZ0LnRhcmdldHx8ZXZ0LnNyY0VsZW1lbnQpO1xuXG4gICAgdGhpc1NvdW5kID0gc2VsZi5nZXRTb3VuZEJ5VVJMKHNlbGYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc20yX2xpbmsnLCdhJyxzZWxmLmdldFBhcmVudEJ5Q2xhc3NOYW1lKHRhcmdldCwndWkzNjAnKSlbMF0uaHJlZik7IC8vIHNlbGYubGFzdFNvdW5kOyAvLyBUT0RPOiBJbiBtdWx0aXBsZSBzb3VuZCBjYXNlLCBmaWd1cmUgb3V0IHdoaWNoIHNvdW5kIGlzIGludm9sdmVkIGV0Yy5cbiAgICAvLyBqdXN0IGluIGNhc2UsIHVwZGF0ZSBjb29yZGluYXRlcyAobWF5YmUgdGhlIGVsZW1lbnQgbW92ZWQgc2luY2UgbGFzdCB0aW1lLilcbiAgICBzZWxmLmxhc3RUb3VjaGVkU291bmQgPSB0aGlzU291bmQ7XG4gICAgc2VsZi5yZWZyZXNoQ29vcmRzKHRoaXNTb3VuZCk7XG4gICAgb0RhdGEgPSB0aGlzU291bmQuXzM2MGRhdGE7XG4gICAgc2VsZi5hZGRDbGFzcyhvRGF0YS5vVUlCb3gsJ3NtMl9kcmFnZ2luZycpO1xuICAgIG9EYXRhLnBhdXNlQ291bnQgPSAoc2VsZi5sYXN0VG91Y2hlZFNvdW5kLnBhdXNlZD8xOjApO1xuICAgIC8vIHNlbGYubGFzdFNvdW5kLnBhdXNlKCk7XG4gICAgc2VsZi5tbWgoZT9lOndpbmRvdy5ldmVudCk7XG5cbiAgICBpZiAoaXNUb3VjaERldmljZSkge1xuICAgICAgc2VsZi5yZW1vdmVFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tb3VzZURvd24pO1xuICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tbWgpO1xuICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNoZW5kJyxzZWxmLm1vdXNlVXApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbmNyZWRpYmx5IG9sZC1za29vbC4gVE9ETzogTW9kZXJuaXplLlxuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBzZWxmLm1taDtcbiAgICAgIGRvY3VtZW50Lm9ubW91c2V1cCA9IHNlbGYubW91c2VVcDtcbiAgICB9XG5cbiAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICB0aGlzLm1vdXNlVXAgPSBmdW5jdGlvbihlKSB7XG5cbiAgICB2YXIgb0RhdGEgPSBzZWxmLmxhc3RUb3VjaGVkU291bmQuXzM2MGRhdGE7XG4gICAgc2VsZi5yZW1vdmVDbGFzcyhvRGF0YS5vVUlCb3gsJ3NtMl9kcmFnZ2luZycpO1xuICAgIGlmIChvRGF0YS5wYXVzZUNvdW50ID09PSAwKSB7XG4gICAgICBzZWxmLmxhc3RUb3VjaGVkU291bmQucmVzdW1lKCk7XG4gICAgfVxuICAgIGlmICghaXNUb3VjaERldmljZSkge1xuICAgICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBudWxsO1xuICAgICAgZG9jdW1lbnQub25tb3VzZXVwID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5yZW1vdmVFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNobW92ZScsc2VsZi5tbWgpO1xuICAgICAgc2VsZi5yZW1vdmVFdmVudEhhbmRsZXIoZG9jdW1lbnQsJ3RvdWNoZW5kJyxzZWxmLm1vdXNlVVApO1xuICAgIH1cblxuICB9O1xuXG4gIHRoaXMubW1oID0gZnVuY3Rpb24oZSkge1xuXG4gICAgaWYgKHR5cGVvZiBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICB9XG4gICAgdmFyIG9Tb3VuZCA9IHNlbGYubGFzdFRvdWNoZWRTb3VuZCxcbiAgICAgICAgY29vcmRzID0gc2VsZi5nZXRNb3VzZVhZKGUpLFxuICAgICAgICB4ID0gY29vcmRzWzBdLFxuICAgICAgICB5ID0gY29vcmRzWzFdLFxuICAgICAgICBkZWx0YVggPSB4LW9Tb3VuZC5fMzYwZGF0YS5jYW52YXNNaWRYWVswXSxcbiAgICAgICAgZGVsdGFZID0geS1vU291bmQuXzM2MGRhdGEuY2FudmFzTWlkWFlbMV0sXG4gICAgICAgIGFuZ2xlID0gTWF0aC5mbG9vcihmdWxsQ2lyY2xlLShzZWxmLnJhZDJkZWcoTWF0aC5hdGFuMihkZWx0YVgsZGVsdGFZKSkrMTgwKSk7XG5cbiAgICBvU291bmQuc2V0UG9zaXRpb24ob1NvdW5kLmR1cmF0aW9uRXN0aW1hdGUqKGFuZ2xlL2Z1bGxDaXJjbGUpKTtcbiAgICBzZWxmLnN0b3BFdmVudChlKTtcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgfTtcblxuICAvLyBhc3NpZ25Nb3VzZURvd24oKTtcblxuICB0aGlzLmRyYXdTb2xpZEFyYyA9IGZ1bmN0aW9uKG9DYW52YXMsIGNvbG9yLCByYWRpdXMsIHdpZHRoLCByYWRpYW5zLCBzdGFydEFuZ2xlLCBub0NsZWFyKSB7XG5cbiAgICAvLyB0aGFuayB5b3UsIGh0dHA6Ly93d3cuc25pcGVyc3lzdGVtcy5jby5uei9jb21tdW5pdHkvcG9sYXJjbG9jay90dXRvcmlhbC5odG1sXG5cbiAgICB2YXIgeCA9IHJhZGl1cyxcbiAgICAgICAgeSA9IHJhZGl1cyxcbiAgICAgICAgY2FudmFzID0gb0NhbnZhcyxcbiAgICAgICAgY3R4LCBpbm5lclJhZGl1cywgZG9lc250TGlrZVplcm8sIGVuZFBvaW50O1xuXG4gICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0KXtcbiAgICAgIC8vIHVzZSBnZXRDb250ZXh0IHRvIHVzZSB0aGUgY2FudmFzIGZvciBkcmF3aW5nXG4gICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB9XG5cbiAgICAvLyByZS1hc3NpZ24gY2FudmFzIGFzIHRoZSBhY3R1YWwgY29udGV4dFxuICAgIG9DYW52YXMgPSBjdHg7XG5cbiAgICBpZiAoIW5vQ2xlYXIpIHtcbiAgICAgIHNlbGYuY2xlYXJDYW52YXMoY2FudmFzKTtcbiAgICB9XG4gICAgLy8gY3R4LnJlc3RvcmUoKTtcblxuICAgIGlmIChjb2xvcikge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIH1cblxuICAgIG9DYW52YXMuYmVnaW5QYXRoKCk7XG5cbiAgICBpZiAoaXNOYU4ocmFkaWFucykpIHtcbiAgICAgIHJhZGlhbnMgPSAwO1xuICAgIH1cblxuICAgIGlubmVyUmFkaXVzID0gcmFkaXVzLXdpZHRoO1xuICAgIGRvZXNudExpa2VaZXJvID0gKGlzT3BlcmEgfHwgaXNTYWZhcmkpOyAvLyBzYWZhcmkgNCBkb2Vzbid0IGFjdHVhbGx5IHNlZW0gdG8gbWluZC5cblxuICAgIGlmICghZG9lc250TGlrZVplcm8gfHwgKGRvZXNudExpa2VaZXJvICYmIHJhZGl1cyA+IDApKSB7XG4gICAgICBvQ2FudmFzLmFyYygwLCAwLCByYWRpdXMsIHN0YXJ0QW5nbGUsIHJhZGlhbnMsIGZhbHNlKTtcbiAgICAgIGVuZFBvaW50ID0gc2VsZi5nZXRBcmNFbmRwb2ludENvb3Jkcyhpbm5lclJhZGl1cywgcmFkaWFucyk7XG4gICAgICBvQ2FudmFzLmxpbmVUbyhlbmRQb2ludC54LCBlbmRQb2ludC55KTtcbiAgICAgIG9DYW52YXMuYXJjKDAsIDAsIGlubmVyUmFkaXVzLCByYWRpYW5zLCBzdGFydEFuZ2xlLCB0cnVlKTtcbiAgICAgIG9DYW52YXMuY2xvc2VQYXRoKCk7XG4gICAgICBvQ2FudmFzLmZpbGwoKTtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmdldEFyY0VuZHBvaW50Q29vcmRzID0gZnVuY3Rpb24ocmFkaXVzLCByYWRpYW5zKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogcmFkaXVzICogTWF0aC5jb3MocmFkaWFucyksXG4gICAgICB5OiByYWRpdXMgKiBNYXRoLnNpbihyYWRpYW5zKVxuICAgIH07XG5cbiAgfTtcblxuICB0aGlzLmRlZzJyYWQgPSBmdW5jdGlvbihuRGVnKSB7XG4gICAgcmV0dXJuIChuRGVnICogTWF0aC5QSS8xODApO1xuICB9O1xuXG4gIHRoaXMucmFkMmRlZyA9IGZ1bmN0aW9uKG5SYWQpIHtcbiAgICByZXR1cm4gKG5SYWQgKiAxODAvTWF0aC5QSSk7XG4gIH07XG5cbiAgdGhpcy5nZXRUaW1lID0gZnVuY3Rpb24obk1TZWMsYkFzU3RyaW5nKSB7XG5cbiAgICAvLyBjb252ZXJ0IG1pbGxpc2Vjb25kcyB0byBtbTpzcywgcmV0dXJuIGFzIG9iamVjdCBsaXRlcmFsIG9yIHN0cmluZ1xuICAgIHZhciBuU2VjID0gTWF0aC5mbG9vcihuTVNlYy8xMDAwKSxcbiAgICAgICAgbWluID0gTWF0aC5mbG9vcihuU2VjLzYwKSxcbiAgICAgICAgc2VjID0gblNlYy0obWluKjYwKTtcbiAgICAvLyBpZiAobWluID09PSAwICYmIHNlYyA9PT0gMCkgcmV0dXJuIG51bGw7IC8vIHJldHVybiAwOjAwIGFzIG51bGxcbiAgICByZXR1cm4gKGJBc1N0cmluZz8obWluKyc6Jysoc2VjPDEwPycwJytzZWM6c2VjKSk6eydtaW4nOm1pbiwnc2VjJzpzZWN9KTtcblxuICB9O1xuXG4gIHRoaXMuY2xlYXJDYW52YXMgPSBmdW5jdGlvbihvQ2FudmFzKSB7XG5cbiAgICB2YXIgY2FudmFzID0gb0NhbnZhcyxcbiAgICAgICAgY3R4ID0gbnVsbCxcbiAgICAgICAgd2lkdGgsIGhlaWdodDtcbiAgICBpZiAoY2FudmFzLmdldENvbnRleHQpe1xuICAgICAgLy8gdXNlIGdldENvbnRleHQgdG8gdXNlIHRoZSBjYW52YXMgZm9yIGRyYXdpbmdcbiAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIH1cbiAgICB3aWR0aCA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcbiAgICBoZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xuICAgIGN0eC5jbGVhclJlY3QoLSh3aWR0aC8yKSwgLShoZWlnaHQvMiksIHdpZHRoLCBoZWlnaHQpO1xuXG4gIH07XG5cbiAgdGhpcy51cGRhdGVQbGF5aW5nID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgdGltZU5vdyA9ICh0aGlzLl8zNjBkYXRhLnNob3dITVNUaW1lP3NlbGYuZ2V0VGltZSh0aGlzLnBvc2l0aW9uLHRydWUpOnBhcnNlSW50KHRoaXMucG9zaXRpb24vMTAwMCwgMTApKTtcblxuICAgIGlmICh0aGlzLmJ5dGVzTG9hZGVkKSB7XG4gICAgICB0aGlzLl8zNjBkYXRhLmxhc3RWYWx1ZXMuYnl0ZXNMb2FkZWQgPSB0aGlzLmJ5dGVzTG9hZGVkO1xuICAgICAgdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmJ5dGVzVG90YWwgPSB0aGlzLmJ5dGVzVG90YWw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucG9zaXRpb24pIHtcbiAgICAgIHRoaXMuXzM2MGRhdGEubGFzdFZhbHVlcy5wb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZHVyYXRpb25Fc3RpbWF0ZSkge1xuICAgICAgdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmR1cmF0aW9uRXN0aW1hdGUgPSB0aGlzLmR1cmF0aW9uRXN0aW1hdGU7XG4gICAgfVxuXG4gICAgc2VsZi5kcmF3U29saWRBcmModGhpcy5fMzYwZGF0YS5vQ2FudmFzLHNlbGYuY29uZmlnLmJhY2tncm91bmRSaW5nQ29sb3IsdGhpcy5fMzYwZGF0YS53aWR0aCx0aGlzLl8zNjBkYXRhLnJhZGl1cyxzZWxmLmRlZzJyYWQoZnVsbENpcmNsZSksZmFsc2UpO1xuXG4gICAgc2VsZi5kcmF3U29saWRBcmModGhpcy5fMzYwZGF0YS5vQ2FudmFzLCh0aGlzLl8zNjBkYXRhLm1ldGFkYXRhP3NlbGYuY29uZmlnLmxvYWRSaW5nQ29sb3JNZXRhZGF0YTpzZWxmLmNvbmZpZy5sb2FkUmluZ0NvbG9yKSx0aGlzLl8zNjBkYXRhLndpZHRoLHRoaXMuXzM2MGRhdGEucmFkaXVzLHNlbGYuZGVnMnJhZChmdWxsQ2lyY2xlKih0aGlzLl8zNjBkYXRhLmxhc3RWYWx1ZXMuYnl0ZXNMb2FkZWQvdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmJ5dGVzVG90YWwpKSwwLHRydWUpO1xuXG4gICAgLy8gZG9uJ3QgZHJhdyBpZiAwIChmdWxsIGJsYWNrIGNpcmNsZSBpbiBPcGVyYSlcbiAgICBpZiAodGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLnBvc2l0aW9uICE9PSAwKSB7XG4gICAgICBzZWxmLmRyYXdTb2xpZEFyYyh0aGlzLl8zNjBkYXRhLm9DYW52YXMsKHRoaXMuXzM2MGRhdGEubWV0YWRhdGE/c2VsZi5jb25maWcucGxheVJpbmdDb2xvck1ldGFkYXRhOnNlbGYuY29uZmlnLnBsYXlSaW5nQ29sb3IpLHRoaXMuXzM2MGRhdGEud2lkdGgsdGhpcy5fMzYwZGF0YS5yYWRpdXMsc2VsZi5kZWcycmFkKCh0aGlzLl8zNjBkYXRhLmRpZEZpbmlzaD09PTE/ZnVsbENpcmNsZTpmdWxsQ2lyY2xlKih0aGlzLl8zNjBkYXRhLmxhc3RWYWx1ZXMucG9zaXRpb24vdGhpcy5fMzYwZGF0YS5sYXN0VmFsdWVzLmR1cmF0aW9uRXN0aW1hdGUpKSksMCx0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBtZXRhZGF0YSBnb2VzIGhlcmVcbiAgICBpZiAodGhpcy5fMzYwZGF0YS5tZXRhZGF0YSkge1xuICAgICAgdGhpcy5fMzYwZGF0YS5tZXRhZGF0YS5ldmVudHMud2hpbGVwbGF5aW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHRpbWVOb3cgIT09IHRoaXMuXzM2MGRhdGEubGFzdFRpbWUpIHtcbiAgICAgIHRoaXMuXzM2MGRhdGEubGFzdFRpbWUgPSB0aW1lTm93O1xuICAgICAgdGhpcy5fMzYwZGF0YS5vVGltaW5nLmlubmVySFRNTCA9IHRpbWVOb3c7XG4gICAgfVxuXG4gICAgLy8gZHJhdyBzcGVjdHJ1bSwgaWYgYXBwbGljYWJsZVxuICAgIGlmICgodGhpcy5pbnN0YW5jZU9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhIHx8IHRoaXMuaW5zdGFuY2VPcHRpb25zLnVzZUVRRGF0YSkgJiYgaGFzUmVhbENhbnZhcykgeyAvLyBJRSA8OSBjYW4gcmVuZGVyIG1heWJlIDMgb3IgNCBGUFMgd2hlbiBpbmNsdWRpbmcgdGhlIHdhdmUvRVEsIHNvIGRvbid0IGJvdGhlci5cbiAgICAgIHNlbGYudXBkYXRlV2F2ZWZvcm0odGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuY29uZmlnLnVzZUZhdkljb24gJiYgc2VsZi52dU1ldGVyKSB7XG4gICAgICBzZWxmLnZ1TWV0ZXIudXBkYXRlVlUodGhpcyk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy51cGRhdGVXYXZlZm9ybSA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xuXG4gICAgaWYgKCghc2VsZi5jb25maWcudXNlV2F2ZWZvcm1EYXRhICYmICFzZWxmLmNvbmZpZy51c2VFUURhdGEpIHx8ICghc20uZmVhdHVyZXMud2F2ZWZvcm1EYXRhICYmICFzbS5mZWF0dXJlcy5lcURhdGEpKSB7XG4gICAgICAvLyBmZWF0dXJlIG5vdCBlbmFibGVkLi5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW9Tb3VuZC53YXZlZm9ybURhdGEubGVmdC5sZW5ndGggJiYgIW9Tb3VuZC5lcURhdGEubGVuZ3RoICYmICFvU291bmQucGVha0RhdGEubGVmdCkge1xuICAgICAgLy8gbm8gZGF0YSAob3IgZXJyb3JlZCBvdXQvcGF1c2VkL3VuYXZhaWxhYmxlPylcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiB1c2UgZm9yIHRlc3RpbmcgdGhlIGRhdGEgKi9cbiAgICAvKlxuICAgICBmb3IgKGk9MDsgaTwyNTY7IGkrKykge1xuICAgICAgIG9Tb3VuZC5lcURhdGFbaV0gPSAxLShpLzI1Nik7XG4gICAgIH1cbiAgICAqL1xuXG4gICAgdmFyIG9DYW52YXMgPSBvU291bmQuXzM2MGRhdGEub0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgICBvZmZYID0gMCxcbiAgICAgICAgb2ZmWSA9IHBhcnNlSW50KG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlci8yLCAxMCksXG4gICAgICAgIHNjYWxlID0gb2ZmWS8yLCAvLyBZIGF4aXMgKCsvLSB0aGlzIGRpc3RhbmNlIGZyb20gMClcbiAgICAgICAgLy8gbGluZVdpZHRoID0gTWF0aC5mbG9vcihvU291bmQuXzM2MGRhdGEuY2lyY2xlRGlhbWV0ZXItKG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlciowLjE3NSkvKG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlci8yNTUpKTsgLy8gd2lkdGggZm9yIGVhY2ggbGluZVxuICAgICAgICBsaW5lV2lkdGggPSAxLFxuICAgICAgICBsaW5lSGVpZ2h0ID0gMSxcbiAgICAgICAgdGhpc1kgPSAwLFxuICAgICAgICBvZmZzZXQgPSBvZmZZLFxuICAgICAgICBpLCBqLCBkaXJlY3Rpb24sIGRvd25TYW1wbGUsIGRhdGFMZW5ndGgsIHNhbXBsZUNvdW50LCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgd2F2ZURhdGEsIGlubmVyUmFkaXVzLCBwZXJJdGVtQW5nbGUsIHlEaWZmLCBlcVNhbXBsZXMsIHBsYXllZEFuZ2xlLCBpQXZnLCBuUGVhaztcblxuICAgIGlmIChzZWxmLmNvbmZpZy51c2VXYXZlZm9ybURhdGEpIHtcbiAgICAgIC8vIHJhdyB3YXZlZm9ybVxuICAgICAgZG93blNhbXBsZSA9IHNlbGYuY29uZmlnLndhdmVmb3JtRGF0YURvd25zYW1wbGU7IC8vIG9ubHkgc2FtcGxlIFggaW4gMjU2IChncmVhdGVyIG51bWJlciA9IGxlc3Mgc2FtcGxlIHBvaW50cylcbiAgICAgIGRvd25TYW1wbGUgPSBNYXRoLm1heCgxLGRvd25TYW1wbGUpOyAvLyBtYWtlIHN1cmUgaXQncyBhdCBsZWFzdCAxXG4gICAgICBkYXRhTGVuZ3RoID0gMjU2O1xuICAgICAgc2FtcGxlQ291bnQgPSAoZGF0YUxlbmd0aC9kb3duU2FtcGxlKTtcbiAgICAgIHN0YXJ0QW5nbGUgPSAwO1xuICAgICAgZW5kQW5nbGUgPSAwO1xuICAgICAgd2F2ZURhdGEgPSBudWxsO1xuICAgICAgaW5uZXJSYWRpdXMgPSAoc2VsZi5jb25maWcud2F2ZWZvcm1EYXRhT3V0c2lkZT8xOihzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFDb25zdHJhaW4/MC41OjAuNTY1KSk7XG4gICAgICBzY2FsZSA9IChzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFPdXRzaWRlPzAuNzowLjc1KTtcbiAgICAgIHBlckl0ZW1BbmdsZSA9IHNlbGYuZGVnMnJhZCgoMzYwL3NhbXBsZUNvdW50KSpzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFMaW5lUmF0aW8pOyAvLyAwLjg1ID0gY2xlYW4gcGl4ZWwgbGluZXMgYXQgMTUwPyAvLyBzZWxmLmRlZzJyYWQoMzYwKihNYXRoLm1heCgxLGRvd25TYW1wbGUtMSkpL3NhbXBsZUNvdW50KTtcbiAgICAgIGZvciAoaT0wOyBpPGRhdGFMZW5ndGg7IGkrPWRvd25TYW1wbGUpIHtcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNlbGYuZGVnMnJhZCgzNjAqKGkvKHNhbXBsZUNvdW50KSoxL2Rvd25TYW1wbGUpKTsgLy8gKzAuNjcgLSBjb3VudGVyIGZvciBzcGFjaW5nXG4gICAgICAgIGVuZEFuZ2xlID0gc3RhcnRBbmdsZStwZXJJdGVtQW5nbGU7XG4gICAgICAgIHdhdmVEYXRhID0gb1NvdW5kLndhdmVmb3JtRGF0YS5sZWZ0W2ldO1xuICAgICAgICBpZiAod2F2ZURhdGE8MCAmJiBzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFDb25zdHJhaW4pIHtcbiAgICAgICAgICB3YXZlRGF0YSA9IE1hdGguYWJzKHdhdmVEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmRyYXdTb2xpZEFyYyhvU291bmQuXzM2MGRhdGEub0NhbnZhcyxzZWxmLmNvbmZpZy53YXZlZm9ybURhdGFDb2xvcixvU291bmQuXzM2MGRhdGEud2lkdGgqaW5uZXJSYWRpdXMsb1NvdW5kLl8zNjBkYXRhLnJhZGl1cypzY2FsZSoxLjI1KndhdmVEYXRhLGVuZEFuZ2xlLHN0YXJ0QW5nbGUsdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuY29uZmlnLnVzZUVRRGF0YSkge1xuICAgICAgLy8gRVEgc3BlY3RydW1cbiAgICAgIGRvd25TYW1wbGUgPSBzZWxmLmNvbmZpZy5lcURhdGFEb3duc2FtcGxlOyAvLyBvbmx5IHNhbXBsZSBOIGluIDI1NlxuICAgICAgeURpZmYgPSAwO1xuICAgICAgZG93blNhbXBsZSA9IE1hdGgubWF4KDEsZG93blNhbXBsZSk7IC8vIG1ha2Ugc3VyZSBpdCdzIGF0IGxlYXN0IDFcbiAgICAgIGVxU2FtcGxlcyA9IDE5MjsgLy8gZHJvcCB0aGUgbGFzdCAyNSUgb2YgdGhlIHNwZWN0cnVtICg+MTY1MDAgSHopLCBtb3N0IHN0dWZmIHdvbid0IGFjdHVhbGx5IHVzZSBpdC5cbiAgICAgIHNhbXBsZUNvdW50ID0gKGVxU2FtcGxlcy9kb3duU2FtcGxlKTtcbiAgICAgIGlubmVyUmFkaXVzID0gKHNlbGYuY29uZmlnLmVxRGF0YU91dHNpZGU/MTowLjU2NSk7XG4gICAgICBkaXJlY3Rpb24gPSAoc2VsZi5jb25maWcuZXFEYXRhT3V0c2lkZT8tMToxKTtcbiAgICAgIHNjYWxlID0gKHNlbGYuY29uZmlnLmVxRGF0YU91dHNpZGU/MC41OjAuNzUpO1xuICAgICAgc3RhcnRBbmdsZSA9IDA7XG4gICAgICBlbmRBbmdsZSA9IDA7XG4gICAgICBwZXJJdGVtQW5nbGUgPSBzZWxmLmRlZzJyYWQoKDM2MC9zYW1wbGVDb3VudCkqc2VsZi5jb25maWcuZXFEYXRhTGluZVJhdGlvKTsgLy8gc2VsZi5kZWcycmFkKDM2MC8oc2FtcGxlQ291bnQrMSkpO1xuICAgICAgcGxheWVkQW5nbGUgPSBzZWxmLmRlZzJyYWQoKG9Tb3VuZC5fMzYwZGF0YS5kaWRGaW5pc2g9PT0xPzM2MDozNjAqKG9Tb3VuZC5fMzYwZGF0YS5sYXN0VmFsdWVzLnBvc2l0aW9uL29Tb3VuZC5fMzYwZGF0YS5sYXN0VmFsdWVzLmR1cmF0aW9uRXN0aW1hdGUpKSk7XG4gICAgICBqPTA7XG4gICAgICBpQXZnID0gMDtcbiAgICAgIGZvciAoaT0wOyBpPGVxU2FtcGxlczsgaSs9ZG93blNhbXBsZSkge1xuICAgICAgICBzdGFydEFuZ2xlID0gc2VsZi5kZWcycmFkKDM2MCooaS9lcVNhbXBsZXMpKTtcbiAgICAgICAgZW5kQW5nbGUgPSBzdGFydEFuZ2xlK3Blckl0ZW1BbmdsZTtcbiAgICAgICAgc2VsZi5kcmF3U29saWRBcmMob1NvdW5kLl8zNjBkYXRhLm9DYW52YXMsKGVuZEFuZ2xlPnBsYXllZEFuZ2xlP3NlbGYuY29uZmlnLmVxRGF0YUNvbG9yOnNlbGYuY29uZmlnLnBsYXlSaW5nQ29sb3IpLG9Tb3VuZC5fMzYwZGF0YS53aWR0aCppbm5lclJhZGl1cyxvU291bmQuXzM2MGRhdGEucmFkaXVzKnNjYWxlKihvU291bmQuZXFEYXRhLmxlZnRbaV0qZGlyZWN0aW9uKSxlbmRBbmdsZSxzdGFydEFuZ2xlLHRydWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZWxmLmNvbmZpZy51c2VQZWFrRGF0YSkge1xuICAgICAgaWYgKCFvU291bmQuXzM2MGRhdGEuYW5pbWF0aW5nKSB7XG4gICAgICAgIG5QZWFrID0gKG9Tb3VuZC5wZWFrRGF0YS5sZWZ0fHxvU291bmQucGVha0RhdGEucmlnaHQpO1xuICAgICAgICAvLyBHSUFOVCBIQUNLOiB1c2UgRVEgc3BlY3RydW0gZGF0YSBmb3IgYmFzcyBmcmVxdWVuY2llc1xuICAgICAgICBlcVNhbXBsZXMgPSAzO1xuICAgICAgICBmb3IgKGk9MDsgaTxlcVNhbXBsZXM7IGkrKykge1xuICAgICAgICAgIG5QZWFrID0gKG5QZWFrfHxvU291bmQuZXFEYXRhW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBvU291bmQuXzM2MGRhdGEuYW1wbGlmaWVyID0gKHNlbGYuY29uZmlnLnVzZUFtcGxpZmllcj8oMC45KyhuUGVhayowLjEpKToxKTtcbiAgICAgICAgb1NvdW5kLl8zNjBkYXRhLnJhZGl1c01heCA9IG9Tb3VuZC5fMzYwZGF0YS5jaXJjbGVEaWFtZXRlciowLjE3NSpvU291bmQuXzM2MGRhdGEuYW1wbGlmaWVyO1xuICAgICAgICBvU291bmQuXzM2MGRhdGEud2lkdGhNYXggPSBvU291bmQuXzM2MGRhdGEuY2lyY2xlRGlhbWV0ZXIqMC40Km9Tb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXI7XG4gICAgICAgIG9Tb3VuZC5fMzYwZGF0YS5yYWRpdXMgPSBwYXJzZUludChvU291bmQuXzM2MGRhdGEucmFkaXVzTWF4Km9Tb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIsIDEwKTtcbiAgICAgICAgb1NvdW5kLl8zNjBkYXRhLndpZHRoID0gcGFyc2VJbnQob1NvdW5kLl8zNjBkYXRhLndpZHRoTWF4Km9Tb3VuZC5fMzYwZGF0YS5hbXBsaWZpZXIsIDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmdldFVJSFRNTCA9IGZ1bmN0aW9uKGRpYW1ldGVyKSB7XG5cbiAgICByZXR1cm4gW1xuICAgICAnPGNhbnZhcyBjbGFzcz1cInNtMi1jYW52YXNcIiB3aWR0aD1cIicrZGlhbWV0ZXIrJ1wiIGhlaWdodD1cIicrZGlhbWV0ZXIrJ1wiPjwvY2FudmFzPicsXG4gICAgICcgPHNwYW4gY2xhc3M9XCJzbTItMzYwYnRuIHNtMi0zNjBidG4tZGVmYXVsdFwiPjwvc3Bhbj4nLCAvLyBub3RlIHVzZSBvZiBpbWFnZU1hcCwgZWRpdCBvciByZW1vdmUgaWYgeW91IHVzZSBhIGRpZmZlcmVudC1zaXplIGltYWdlLlxuICAgICAnIDxkaXYgY2xhc3M9XCJzbTItdGltaW5nJysobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvc2FmYXJpL2kpPycgYWxpZ25Ud2Vhayc6JycpKydcIj48L2Rpdj4nLCAvLyArIEV2ZXItc28tc2xpZ2h0IFNhZmFyaSBob3Jpem9udGFsIGFsaWdubWVudCB0d2Vha1xuICAgICAnIDxkaXYgY2xhc3M9XCJzbTItY292ZXJcIj48L2Rpdj4nXG4gICAgXTtcblxuICB9O1xuXG4gIHRoaXMudWlUZXN0ID0gZnVuY3Rpb24oc0NsYXNzKSB7XG5cbiAgICAvLyBmYWtlIGEgMzYwIFVJIHNvIHdlIGNhbiBnZXQgc29tZSBudW1iZXJzIGZyb20gQ1NTLCBldGMuXG5cbiAgICB2YXIgb1RlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIG9GYWtlVUksIG9GYWtlVUlCb3gsIG9UZW1wLCBmYWtlRGlhbWV0ZXIsIHVpSFRNTCwgY2lyY2xlRGlhbWV0ZXIsIGNpcmNsZVJhZGl1cywgZm9udFNpemVNYXgsIG9UaW1pbmc7XG5cbiAgICBvVGVtcGxhdGUuY2xhc3NOYW1lID0gJ3NtMi0zNjB1aSc7XG5cbiAgICBvRmFrZVVJID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgb0Zha2VVSS5jbGFzc05hbWUgPSAndWkzNjAnKyhzQ2xhc3M/JyAnK3NDbGFzczonJyk7IC8vIHVpMzYwIHVpMzYwLXZpc1xuXG4gICAgb0Zha2VVSUJveCA9IG9GYWtlVUkuYXBwZW5kQ2hpbGQob1RlbXBsYXRlLmNsb25lTm9kZSh0cnVlKSk7XG5cbiAgICBvRmFrZVVJLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBvRmFrZVVJLnN0eWxlLmxlZnQgPSAnLTk5OTlweCc7XG5cbiAgICBvVGVtcCA9IGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob0Zha2VVSSk7XG5cbiAgICBmYWtlRGlhbWV0ZXIgPSBvRmFrZVVJQm94Lm9mZnNldFdpZHRoO1xuXG4gICAgdWlIVE1MID0gc2VsZi5nZXRVSUhUTUwoZmFrZURpYW1ldGVyKTtcblxuICAgIG9GYWtlVUlCb3guaW5uZXJIVE1MID0gdWlIVE1MWzFdK3VpSFRNTFsyXSt1aUhUTUxbM107XG5cbiAgICBjaXJjbGVEaWFtZXRlciA9IHBhcnNlSW50KG9GYWtlVUlCb3gub2Zmc2V0V2lkdGgsIDEwKTtcbiAgICBjaXJjbGVSYWRpdXMgPSBwYXJzZUludChjaXJjbGVEaWFtZXRlci8yLCAxMCk7XG5cbiAgICBvVGltaW5nID0gc2VsZi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdzbTItdGltaW5nJywnZGl2JyxvVGVtcClbMF07XG4gICAgZm9udFNpemVNYXggPSBwYXJzZUludChzZWxmLmdldFN0eWxlKG9UaW1pbmcsJ2ZvbnQtc2l6ZScpLCAxMCk7XG4gICAgaWYgKGlzTmFOKGZvbnRTaXplTWF4KSkge1xuICAgICAgLy8gZ2V0U3R5bGUoKSBldGMuIGRpZG4ndCB3b3JrLlxuICAgICAgZm9udFNpemVNYXggPSBudWxsO1xuICAgIH1cblxuICAgIC8vIHNvdW5kTWFuYWdlci5fd3JpdGVEZWJ1ZygnZGlhbWV0ZXIsIGZvbnQgc2l6ZTogJytjaXJjbGVEaWFtZXRlcisnLCcrZm9udFNpemVNYXgpO1xuXG4gICAgb0Zha2VVSS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9GYWtlVUkpO1xuXG4gICAgdWlIVE1MID0gb0Zha2VVSSA9IG9GYWtlVUlCb3ggPSBvVGVtcCA9IG51bGw7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2lyY2xlRGlhbWV0ZXI6IGNpcmNsZURpYW1ldGVyLFxuICAgICAgY2lyY2xlUmFkaXVzOiBjaXJjbGVSYWRpdXMsXG4gICAgICBmb250U2l6ZU1heDogZm9udFNpemVNYXhcbiAgICB9O1xuXG4gIH07XG5cbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBzbS5fd3JpdGVEZWJ1ZygndGhyZWVTaXh0eVBsYXllci5pbml0KCknKTtcblxuICAgICAgaWYoc2VsZi5jb25maWcuaXRlbXMpe1xuICAgICAgICAgIHZhciBvSXRlbXMgPSBzZWxmLmNvbmZpZy5pdGVtcztcbiAgICAgIH1lbHNle1xuICAgICAgICAgIHZhciBvSXRlbXMgPSBzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3VpMzYwJywnZGl2Jyk7XG4gICAgICB9XG4gICAgdmFyIGksIGosIG9MaW5rcyA9IFtdLCBpc192aXMgPSBmYWxzZSwgZm91bmRJdGVtcyA9IDAsIG9DYW52YXMsIG9DYW52YXNDVFgsIG9Db3ZlciwgZGlhbWV0ZXIsIHJhZGl1cywgdWlEYXRhLCB1aURhdGFWaXMsIG9VSSwgb0J0biwgbywgbzIsIG9JRDtcblxuICAgIGZvciAoaT0wLGo9b0l0ZW1zLmxlbmd0aDsgaTxqOyBpKyspIHtcbiAgICAgIG9MaW5rcy5wdXNoKG9JdGVtc1tpXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpWzBdKTtcbiAgICAgIC8vIHJlbW92ZSBcImZha2VcIiBwbGF5IGJ1dHRvbiAodW5zdXBwb3J0ZWQgY2FzZSlcbiAgICAgIG9JdGVtc1tpXS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAnbm9uZSc7XG4gICAgfVxuICAgIC8vIGdyYWIgYWxsIGxpbmtzLCBsb29rIGZvciAubXAzXG5cbiAgICBzZWxmLm9VSVRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2VsZi5vVUlUZW1wbGF0ZS5jbGFzc05hbWUgPSAnc20yLTM2MHVpJztcblxuICAgIHNlbGYub1VJVGVtcGxhdGVWaXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzZWxmLm9VSVRlbXBsYXRlVmlzLmNsYXNzTmFtZSA9ICdzbTItMzYwdWknO1xuXG4gICAgdWlEYXRhID0gc2VsZi51aVRlc3QoKTtcblxuICAgIHNlbGYuY29uZmlnLmNpcmNsZURpYW1ldGVyID0gdWlEYXRhLmNpcmNsZURpYW1ldGVyO1xuICAgIHNlbGYuY29uZmlnLmNpcmNsZVJhZGl1cyA9IHVpRGF0YS5jaXJjbGVSYWRpdXM7XG4gICAgLy8gc2VsZi5jb25maWcuZm9udFNpemVNYXggPSB1aURhdGEuZm9udFNpemVNYXg7XG5cbiAgICB1aURhdGFWaXMgPSBzZWxmLnVpVGVzdCgndWkzNjAtdmlzJyk7XG5cbiAgICBzZWxmLmNvbmZpZy5mb250U2l6ZU1heCA9IHVpRGF0YVZpcy5mb250U2l6ZU1heDtcblxuICAgIC8vIGNhbnZhcyBuZWVkcyBpbmxpbmUgd2lkdGggYW5kIGhlaWdodCwgZG9lc24ndCBxdWl0ZSB3b3JrIG90aGVyd2lzZVxuICAgIHNlbGYub1VJVGVtcGxhdGUuaW5uZXJIVE1MID0gc2VsZi5nZXRVSUhUTUwoc2VsZi5jb25maWcuY2lyY2xlRGlhbWV0ZXIpLmpvaW4oJycpO1xuXG4gICAgc2VsZi5vVUlUZW1wbGF0ZVZpcy5pbm5lckhUTUwgPSBzZWxmLmdldFVJSFRNTCh1aURhdGFWaXMuY2lyY2xlRGlhbWV0ZXIpLmpvaW4oJycpO1xuXG4gICAgZm9yIChpPTAsaj1vTGlua3MubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgaWYgKHNtLmNhblBsYXlMaW5rKG9MaW5rc1tpXSkgJiYgIXNlbGYuaGFzQ2xhc3Mob0xpbmtzW2ldLHNlbGYuZXhjbHVkZUNsYXNzKSAmJiAhc2VsZi5oYXNDbGFzcyhvTGlua3NbaV0sc2VsZi5jc3Muc0RlZmF1bHQpKSB7XG4gICAgICAgIHNlbGYuYWRkQ2xhc3Mob0xpbmtzW2ldLHNlbGYuY3NzLnNEZWZhdWx0KTsgLy8gYWRkIGRlZmF1bHQgQ1NTIGRlY29yYXRpb25cbiAgICAgICAgc2VsZi5saW5rc1tmb3VuZEl0ZW1zXSA9IChvTGlua3NbaV0pO1xuICAgICAgICBzZWxmLmluZGV4QnlVUkxbb0xpbmtzW2ldLmhyZWZdID0gZm91bmRJdGVtczsgLy8gaGFjayBmb3IgaW5kZXhpbmdcbiAgICAgICAgZm91bmRJdGVtcysrO1xuXG4gICAgICAgIGlzX3ZpcyA9IHNlbGYuaGFzQ2xhc3Mob0xpbmtzW2ldLnBhcmVudE5vZGUsICd1aTM2MC12aXMnKTtcblxuICAgICAgICBkaWFtZXRlciA9IChpc192aXMgPyB1aURhdGFWaXMgOiB1aURhdGEpLmNpcmNsZURpYW1ldGVyO1xuICAgICAgICByYWRpdXMgPSAoaXNfdmlzID8gdWlEYXRhVmlzIDogdWlEYXRhKS5jaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgLy8gYWRkIGNhbnZhcyBzaGl6XG4gICAgICAgIG9VSSA9IG9MaW5rc1tpXS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSgoaXNfdmlzP3NlbGYub1VJVGVtcGxhdGVWaXM6c2VsZi5vVUlUZW1wbGF0ZSkuY2xvbmVOb2RlKHRydWUpLG9MaW5rc1tpXSk7XG5cbiAgICAgICAgaWYgKGlzSUUgJiYgdHlwZW9mIHdpbmRvdy5HX3ZtbENhbnZhc01hbmFnZXIgIT09ICd1bmRlZmluZWQnKSB7IC8vIElFIG9ubHlcbiAgICAgICAgICBvID0gb0xpbmtzW2ldLnBhcmVudE5vZGU7XG4gICAgICAgICAgbzIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICBvMi5jbGFzc05hbWUgPSAnc20yLWNhbnZhcyc7XG4gICAgICAgICAgb0lEID0gJ3NtMl9jYW52YXNfJytwYXJzZUludChNYXRoLnJhbmRvbSgpKjEwNDg1NzYsIDEwKTtcbiAgICAgICAgICBvMi5pZCA9IG9JRDtcbiAgICAgICAgICBvMi53aWR0aCA9IGRpYW1ldGVyO1xuICAgICAgICAgIG8yLmhlaWdodCA9IGRpYW1ldGVyO1xuICAgICAgICAgIG9VSS5hcHBlbmRDaGlsZChvMik7XG4gICAgICAgICAgd2luZG93Lkdfdm1sQ2FudmFzTWFuYWdlci5pbml0RWxlbWVudChvMik7IC8vIEFwcGx5IEV4Q2FudmFzIGNvbXBhdGliaWxpdHkgbWFnaWNcbiAgICAgICAgICBvQ2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob0lEKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBhZGQgYSBoYW5kbGVyIGZvciB0aGUgYnV0dG9uXG4gICAgICAgICAgb0NhbnZhcyA9IG9MaW5rc1tpXS5wYXJlbnROb2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXTtcbiAgICAgICAgfVxuICAgICAgICBvQ292ZXIgPSBzZWxmLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3NtMi1jb3ZlcicsJ2Rpdicsb0xpbmtzW2ldLnBhcmVudE5vZGUpWzBdO1xuICAgICAgICBvQnRuID0gb0xpbmtzW2ldLnBhcmVudE5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXTtcbiAgICAgICAgc2VsZi5hZGRFdmVudEhhbmRsZXIob0J0biwnY2xpY2snLHNlbGYuYnV0dG9uQ2xpY2spO1xuICAgICAgICBpZiAoIWlzVG91Y2hEZXZpY2UpIHtcbiAgICAgICAgICBzZWxmLmFkZEV2ZW50SGFuZGxlcihvQ292ZXIsJ21vdXNlZG93bicsc2VsZi5tb3VzZURvd24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuYWRkRXZlbnRIYW5kbGVyKG9Db3ZlciwndG91Y2hzdGFydCcsc2VsZi5tb3VzZURvd24pO1xuICAgICAgICB9XG4gICAgICAgIG9DYW52YXNDVFggPSBvQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIG9DYW52YXNDVFgudHJhbnNsYXRlKHJhZGl1cywgcmFkaXVzKTtcbiAgICAgICAgb0NhbnZhc0NUWC5yb3RhdGUoc2VsZi5kZWcycmFkKC05MCkpOyAvLyBjb21wZW5zYXRlIGZvciBhcmMgc3RhcnRpbmcgYXQgRUFTVCAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxOTI2Ny90dXRvcmlhbC1mb3ItaHRtbC1jYW52YXNzLWFyYy1mdW5jdGlvblxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZm91bmRJdGVtcz4wKSB7XG4gICAgICBzZWxmLmFkZEV2ZW50SGFuZGxlcihkb2N1bWVudCwnY2xpY2snLHNlbGYuaGFuZGxlQ2xpY2spO1xuICAgICAgaWYgKHNlbGYuY29uZmlnLmF1dG9QbGF5KSB7XG4gICAgICAgIHNlbGYuaGFuZGxlQ2xpY2soe3RhcmdldDpzZWxmLmxpbmtzWzBdLHByZXZlbnREZWZhdWx0OmZ1bmN0aW9uKCl7fX0pO1xuICAgICAgfVxuICAgIH1cbiAgICBzbS5fd3JpdGVEZWJ1ZygndGhyZWVTaXh0eVBsYXllci5pbml0KCk6IEZvdW5kICcrZm91bmRJdGVtcysnIHJlbGV2YW50IGl0ZW1zLicpO1xuXG4gICAgaWYgKHNlbGYuY29uZmlnLnVzZUZhdkljb24gJiYgdHlwZW9mIHRoaXMuVlVNZXRlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudnVNZXRlciA9IG5ldyB0aGlzLlZVTWV0ZXIodGhpcyk7XG4gICAgfVxuXG4gIH07XG5cbn1cblxuLy8gT3B0aW9uYWw6IFZVIE1ldGVyIGNvbXBvbmVudFxuXG5UaHJlZVNpeHR5UGxheWVyLnByb3RvdHlwZS5WVU1ldGVyID0gZnVuY3Rpb24ob1BhcmVudCkge1xuXG4gIHZhciBzZWxmID0gb1BhcmVudCxcbiAgICAgIG1lID0gdGhpcyxcbiAgICAgIF9oZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICAgIGlzT3BlcmEgPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvb3BlcmEvaSkpLFxuICAgICAgaXNGaXJlZm94ID0gKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2ZpcmVmb3gvaSkpO1xuXG4gIHRoaXMudnVNZXRlckRhdGEgPSBbXTtcbiAgdGhpcy52dURhdGFDYW52YXMgPSBudWxsO1xuXG4gIHRoaXMuc2V0UGFnZUljb24gPSBmdW5jdGlvbihzRGF0YVVSTCkge1xuXG4gICAgaWYgKCFzZWxmLmNvbmZpZy51c2VGYXZJY29uIHx8ICFzZWxmLmNvbmZpZy51c2VQZWFrRGF0YSB8fCAhc0RhdGFVUkwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbTItZmF2aWNvbicpO1xuICAgIGlmIChsaW5rKSB7XG4gICAgICBfaGVhZC5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICAgIGxpbmsgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoIWxpbmspIHtcbiAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICBsaW5rLmlkID0gJ3NtMi1mYXZpY29uJztcbiAgICAgIGxpbmsucmVsID0gJ3Nob3J0Y3V0IGljb24nO1xuICAgICAgbGluay50eXBlID0gJ2ltYWdlL3BuZyc7XG4gICAgICBsaW5rLmhyZWYgPSBzRGF0YVVSTDtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQobGluayk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5yZXNldFBhZ2VJY29uID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoIXNlbGYuY29uZmlnLnVzZUZhdkljb24pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGxpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmF2aWNvbicpO1xuICAgIGlmIChsaW5rKSB7XG4gICAgICBsaW5rLmhyZWYgPSAnL2Zhdmljb24uaWNvJztcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLnVwZGF0ZVZVID0gZnVuY3Rpb24ob1NvdW5kKSB7XG5cbiAgICBpZiAoc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbiA+PSA5ICYmIHNlbGYuY29uZmlnLnVzZUZhdkljb24gJiYgc2VsZi5jb25maWcudXNlUGVha0RhdGEpIHtcbiAgICAgIG1lLnNldFBhZ2VJY29uKG1lLnZ1TWV0ZXJEYXRhW3BhcnNlSW50KDE2Km9Tb3VuZC5wZWFrRGF0YS5sZWZ0LCAxMCldW3BhcnNlSW50KDE2Km9Tb3VuZC5wZWFrRGF0YS5yaWdodCwgMTApXSk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5jcmVhdGVWVURhdGEgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBpPTAsIGo9MCxcbiAgICAgICAgY2FudmFzID0gbWUudnVEYXRhQ2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgIHZ1R3JhZCA9IGNhbnZhcy5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAxNiwgMCwgMCksXG4gICAgICAgIGJnR3JhZCA9IGNhbnZhcy5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAxNiwgMCwgMCksXG4gICAgICAgIG91dGxpbmUgPSAncmdiYSgwLDAsMCwwLjIpJztcblxuICAgIHZ1R3JhZC5hZGRDb2xvclN0b3AoMCwncmdiKDAsMTkyLDApJyk7XG4gICAgdnVHcmFkLmFkZENvbG9yU3RvcCgwLjMwLCdyZ2IoMCwyNTUsMCknKTtcbiAgICB2dUdyYWQuYWRkQ29sb3JTdG9wKDAuNjI1LCdyZ2IoMjU1LDI1NSwwKScpO1xuICAgIHZ1R3JhZC5hZGRDb2xvclN0b3AoMC44NSwncmdiKDI1NSwwLDApJyk7XG4gICAgYmdHcmFkLmFkZENvbG9yU3RvcCgwLG91dGxpbmUpO1xuICAgIGJnR3JhZC5hZGRDb2xvclN0b3AoMSwncmdiYSgwLDAsMCwwLjUpJyk7XG4gICAgZm9yIChpPTA7IGk8MTY7IGkrKykge1xuICAgICAgbWUudnVNZXRlckRhdGFbaV0gPSBbXTtcbiAgICB9XG4gICAgZm9yIChpPTA7IGk8MTY7IGkrKykge1xuICAgICAgZm9yIChqPTA7IGo8MTY7IGorKykge1xuICAgICAgICAvLyByZXNldC9lcmFzZSBjYW52YXNcbiAgICAgICAgbWUudnVEYXRhQ2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLDE2KTtcbiAgICAgICAgbWUudnVEYXRhQ2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywxNik7XG4gICAgICAgIC8vIGRyYXcgbmV3IHN0dWZmc1xuICAgICAgICBjYW52YXMuZmlsbFN0eWxlID0gYmdHcmFkO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoMCwwLDcsMTUpO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoOCwwLDcsMTUpO1xuICAgICAgICAvKlxuICAgICAgICAvLyBzaGFkb3dcbiAgICAgICAgY2FudmFzLmZpbGxTdHlsZSA9ICdyZ2JhKDAsMCwwLDAuMSknO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoMSwxNS1pLDcsMTctKDE3LWkpKTtcbiAgICAgICAgY2FudmFzLmZpbGxSZWN0KDksMTUtaiw3LDE3LSgxNy1qKSk7XG4gICAgICAgICovXG4gICAgICAgIGNhbnZhcy5maWxsU3R5bGUgPSB2dUdyYWQ7XG4gICAgICAgIGNhbnZhcy5maWxsUmVjdCgwLDE1LWksNywxNi0oMTYtaSkpO1xuICAgICAgICBjYW52YXMuZmlsbFJlY3QoOCwxNS1qLDcsMTYtKDE2LWopKTtcbiAgICAgICAgLy8gYW5kIG5vdywgY2xlYXIgb3V0IHNvbWUgYml0cy5cbiAgICAgICAgY2FudmFzLmNsZWFyUmVjdCgwLDMsMTYsMSk7XG4gICAgICAgIGNhbnZhcy5jbGVhclJlY3QoMCw3LDE2LDEpO1xuICAgICAgICBjYW52YXMuY2xlYXJSZWN0KDAsMTEsMTYsMSk7XG4gICAgICAgIG1lLnZ1TWV0ZXJEYXRhW2ldW2pdID0gbWUudnVEYXRhQ2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG4gICAgICAgIC8vIGZvciBkZWJ1Z2dpbmcgVlUgaW1hZ2VzXG4gICAgICAgIC8qXG4gICAgICAgIHZhciBvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgIG8uc3R5bGUubWFyZ2luUmlnaHQgPSAnNXB4JztcbiAgICAgICAgby5zcmMgPSB2dU1ldGVyRGF0YVtpXVtqXTtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKG8pO1xuICAgICAgICAqL1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMudGVzdENhbnZhcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gY2FudmFzICsgdG9EYXRhVVJMKCk7XG4gICAgdmFyIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgICAgY3R4ID0gbnVsbCwgb2s7XG4gICAgaWYgKCFjIHx8IHR5cGVvZiBjLmdldENvbnRleHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY3R4ID0gYy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGlmICghY3R4IHx8IHR5cGVvZiBjLnRvRGF0YVVSTCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIGp1c3QgaW4gY2FzZS4uXG4gICAgdHJ5IHtcbiAgICAgIG9rID0gYy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLy8gbm8gY2FudmFzIG9yIG5vIHRvRGF0YVVSTCgpXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gYXNzdW1lIHdlJ3JlIGFsbCBnb29kLlxuICAgIHJldHVybiBjO1xuXG4gIH07XG5cbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoc2VsZi5jb25maWcudXNlRmF2SWNvbikge1xuICAgICAgbWUudnVEYXRhQ2FudmFzID0gbWUudGVzdENhbnZhcygpO1xuICAgICAgaWYgKG1lLnZ1RGF0YUNhbnZhcyAmJiAoaXNGaXJlZm94IHx8IGlzT3BlcmEpKSB7XG4gICAgICAgIC8vIHRoZXNlIGJyb3dzZXJzIHN1cHBvcnQgZHluYW1pY2FsbHktdXBkYXRpbmcgdGhlIGZhdmljb25cbiAgICAgICAgbWUuY3JlYXRlVlVEYXRhKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBkb2luZyB0aGlzXG4gICAgICAgIHNlbGYuY29uZmlnLnVzZUZhdkljb24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLmluaXQoKTtcblxufTtcblxuLy8gY29tcGxldGVseSBvcHRpb25hbDogTWV0YWRhdGEvYW5ub3RhdGlvbnMvc2VnbWVudHMgY29kZVxuXG5UaHJlZVNpeHR5UGxheWVyLnByb3RvdHlwZS5NZXRhZGF0YSA9IGZ1bmN0aW9uKG9Tb3VuZCwgb1BhcmVudCkge1xuXG4gIHNvdW5kTWFuYWdlci5fd0QoJ01ldGFkYXRhKCknKTtcblxuICB2YXIgbWUgPSB0aGlzLFxuICAgICAgb0JveCA9IG9Tb3VuZC5fMzYwZGF0YS5vVUkzNjAsXG4gICAgICBvID0gb0JveC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndWwnKVswXSxcbiAgICAgIG9JdGVtcyA9IG8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyksXG4gICAgICBpc0ZpcmVmb3ggPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvZmlyZWZveC9pKSksXG4gICAgICBpc0FsdCA9IGZhbHNlLCBpLCBvRHVyYXRpb247XG5cbiAgdGhpcy5sYXN0V1BFeGVjID0gMDtcbiAgdGhpcy5yZWZyZXNoSW50ZXJ2YWwgPSAyNTA7XG4gIHRoaXMudG90YWxUaW1lID0gMDtcblxuICB0aGlzLmV2ZW50cyA9IHtcblxuICAgIHdoaWxlcGxheWluZzogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciB3aWR0aCA9IG9Tb3VuZC5fMzYwZGF0YS53aWR0aCxcbiAgICAgICAgICByYWRpdXMgPSBvU291bmQuXzM2MGRhdGEucmFkaXVzLFxuICAgICAgICAgIGZ1bGxEdXJhdGlvbiA9IChvU291bmQuZHVyYXRpb25Fc3RpbWF0ZXx8KG1lLnRvdGFsVGltZSoxMDAwKSksXG4gICAgICAgICAgaXNBbHQgPSBudWxsLCBpLCBqLCBkO1xuXG4gICAgICBmb3IgKGk9MCxqPW1lLmRhdGEubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpc0FsdCA9IChpJTI9PT0wKTtcbiAgICAgICAgb1BhcmVudC5kcmF3U29saWRBcmMob1NvdW5kLl8zNjBkYXRhLm9DYW52YXMsKGlzQWx0P29QYXJlbnQuY29uZmlnLnNlZ21lbnRSaW5nQ29sb3JBbHQ6b1BhcmVudC5jb25maWcuc2VnbWVudFJpbmdDb2xvciksaXNBbHQ/d2lkdGg6d2lkdGgsIGlzQWx0P3JhZGl1cy8yOnJhZGl1cy8yLCBvUGFyZW50LmRlZzJyYWQoMzYwKihtZS5kYXRhW2ldLmVuZFRpbWVNUy9mdWxsRHVyYXRpb24pKSwgb1BhcmVudC5kZWcycmFkKDM2MCooKG1lLmRhdGFbaV0uc3RhcnRUaW1lTVN8fDEpL2Z1bGxEdXJhdGlvbikpLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgaWYgKGQtbWUubGFzdFdQRXhlYz5tZS5yZWZyZXNoSW50ZXJ2YWwpIHtcbiAgICAgICAgbWUucmVmcmVzaCgpO1xuICAgICAgICBtZS5sYXN0V1BFeGVjID0gZDtcbiAgICAgIH1cblxuICAgIH1cblxuICB9O1xuXG4gIHRoaXMucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gRGlzcGxheSBpbmZvIGFzIGFwcHJvcHJpYXRlXG4gICAgdmFyIGksIGosIGluZGV4ID0gbnVsbCxcbiAgICAgICAgbm93ID0gb1NvdW5kLnBvc2l0aW9uLFxuICAgICAgICBtZXRhZGF0YSA9IG9Tb3VuZC5fMzYwZGF0YS5tZXRhZGF0YS5kYXRhO1xuXG4gICAgZm9yIChpPTAsIGo9bWV0YWRhdGEubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgaWYgKG5vdyA+PSBtZXRhZGF0YVtpXS5zdGFydFRpbWVNUyAmJiBub3cgPD0gbWV0YWRhdGFbaV0uZW5kVGltZU1TKSB7XG4gICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpbmRleCAhPT0gbWV0YWRhdGEuY3VycmVudEl0ZW0gJiYgaW5kZXggPCBtZXRhZGF0YS5sZW5ndGgpIHtcbiAgICAgIC8vIHVwZGF0ZVxuICAgICAgb1NvdW5kLl8zNjBkYXRhLm9MaW5rLmlubmVySFRNTCA9IG1ldGFkYXRhLm1haW5UaXRsZSsnIDxzcGFuIGNsYXNzPVwibWV0YWRhdGFcIj48c3BhbiBjbGFzcz1cInNtMl9kaXZpZGVyXCI+IHwgPC9zcGFuPjxzcGFuIGNsYXNzPVwic20yX21ldGFkYXRhXCI+JyttZXRhZGF0YVtpbmRleF0udGl0bGUrJzwvc3Bhbj48L3NwYW4+JztcbiAgICAgIC8vIHNlbGYuc2V0UGFnZVRpdGxlKG1ldGFkYXRhW2luZGV4XS50aXRsZSsnIHwgJyttZXRhZGF0YS5tYWluVGl0bGUpO1xuICAgICAgbWV0YWRhdGEuY3VycmVudEl0ZW0gPSBpbmRleDtcbiAgICB9XG5cbiAgfTtcblxuICB0aGlzLnN0clRvVGltZSA9IGZ1bmN0aW9uKHNUaW1lKSB7XG4gICAgdmFyIHNlZ21lbnRzID0gc1RpbWUuc3BsaXQoJzonKSxcbiAgICAgICAgc2Vjb25kcyA9IDAsIGk7XG4gICAgZm9yIChpPXNlZ21lbnRzLmxlbmd0aDsgaS0tOykge1xuICAgICAgc2Vjb25kcyArPSBwYXJzZUludChzZWdtZW50c1tpXSwgMTApKk1hdGgucG93KDYwLHNlZ21lbnRzLmxlbmd0aC0xLWkpOyAvLyBob3VycywgbWludXRlc1xuICAgIH1cbiAgICByZXR1cm4gc2Vjb25kcztcbiAgfTtcblxuICB0aGlzLmRhdGEgPSBbXTtcbiAgdGhpcy5kYXRhLmdpdmVuRHVyYXRpb24gPSBudWxsO1xuICB0aGlzLmRhdGEuY3VycmVudEl0ZW0gPSBudWxsO1xuICB0aGlzLmRhdGEubWFpblRpdGxlID0gb1NvdW5kLl8zNjBkYXRhLm9MaW5rLmlubmVySFRNTDtcblxuICBmb3IgKGk9MDsgaTxvSXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLmRhdGFbaV0gPSB7XG4gICAgICBvOiBudWxsLFxuICAgICAgdGl0bGU6IG9JdGVtc1tpXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgncCcpWzBdLmlubmVySFRNTCxcbiAgICAgIHN0YXJ0VGltZTogb0l0ZW1zW2ldLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0uaW5uZXJIVE1MLFxuICAgICAgc3RhcnRTZWNvbmRzOiBtZS5zdHJUb1RpbWUob0l0ZW1zW2ldLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0uaW5uZXJIVE1MLnJlcGxhY2UoL1soKV0vZywnJykpLFxuICAgICAgZHVyYXRpb246IDAsXG4gICAgICBkdXJhdGlvbk1TOiBudWxsLFxuICAgICAgc3RhcnRUaW1lTVM6IG51bGwsXG4gICAgICBlbmRUaW1lTVM6IG51bGwsXG4gICAgICBvTm90ZTogbnVsbFxuICAgIH07XG4gIH1cbiAgb0R1cmF0aW9uID0gb1BhcmVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkdXJhdGlvbicsJ2Rpdicsb0JveCk7XG4gIHRoaXMuZGF0YS5naXZlbkR1cmF0aW9uID0gKG9EdXJhdGlvbi5sZW5ndGg/bWUuc3RyVG9UaW1lKG9EdXJhdGlvblswXS5pbm5lckhUTUwpKjEwMDA6MCk7XG4gIGZvciAoaT0wOyBpPHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMuZGF0YVtpXS5kdXJhdGlvbiA9IHBhcnNlSW50KHRoaXMuZGF0YVtpKzFdP3RoaXMuZGF0YVtpKzFdLnN0YXJ0U2Vjb25kczoobWUuZGF0YS5naXZlbkR1cmF0aW9uP21lLmRhdGEuZ2l2ZW5EdXJhdGlvbjpvU291bmQuZHVyYXRpb25Fc3RpbWF0ZSkvMTAwMCwgMTApLXRoaXMuZGF0YVtpXS5zdGFydFNlY29uZHM7XG4gICAgdGhpcy5kYXRhW2ldLnN0YXJ0VGltZU1TID0gdGhpcy5kYXRhW2ldLnN0YXJ0U2Vjb25kcyoxMDAwO1xuICAgIHRoaXMuZGF0YVtpXS5kdXJhdGlvbk1TID0gdGhpcy5kYXRhW2ldLmR1cmF0aW9uKjEwMDA7XG4gICAgdGhpcy5kYXRhW2ldLmVuZFRpbWVNUyA9IHRoaXMuZGF0YVtpXS5zdGFydFRpbWVNUyt0aGlzLmRhdGFbaV0uZHVyYXRpb25NUztcbiAgICB0aGlzLnRvdGFsVGltZSArPSB0aGlzLmRhdGFbaV0uZHVyYXRpb247XG4gIH1cblxufTtcblxuaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL3dlYmtpdC9pKSAmJiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9tb2JpbGUvaSkpIHtcbiAgLy8gaVBhZCwgaVBob25lIGV0Yy5cbiAgc291bmRNYW5hZ2VyLnVzZUhUTUw1QXVkaW8gPSB0cnVlO1xufVxuXG5zb3VuZE1hbmFnZXIuZGVidWdNb2RlID0gZmFsc2U7Ly8gKHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9kZWJ1Zz0xL2kpKTsgLy8gZGlzYWJsZSBvciBlbmFibGUgZGVidWcgb3V0cHV0XG5zb3VuZE1hbmFnZXIuY29uc29sZU9ubHkgPSB0cnVlO1xuc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbiA9IDk7XG5zb3VuZE1hbmFnZXIudXNlSGlnaFBlcmZvcm1hbmNlID0gdHJ1ZTtcbnNvdW5kTWFuYWdlci51c2VGbGFzaEJsb2NrID0gdHJ1ZTtcbnNvdW5kTWFuYWdlci5mbGFzaExvYWRUaW1lb3V0ID0gMDtcblxuLy8gc291bmRNYW5hZ2VyLnVzZUZhc3RQb2xsaW5nID0gdHJ1ZTsgLy8gZm9yIG1vcmUgYWdncmVzc2l2ZSwgZmFzdGVyIFVJIHVwZGF0ZXMgKGhpZ2hlciBDUFUgdXNlKVxuXG4vLyBGUFMgZGF0YSwgdGVzdGluZy9kZWJ1ZyBvbmx5XG5pZiAoc291bmRNYW5hZ2VyLmRlYnVnTW9kZSkge1xuICB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHAgPSB3aW5kb3cudGhyZWVTaXh0eVBsYXllcjtcbiAgICBpZiAocCAmJiBwLmxhc3RTb3VuZCAmJiBwLmxhc3RTb3VuZC5fMzYwZGF0YS5mcHMgJiYgdHlwZW9mIHdpbmRvdy5pc0hvbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBzb3VuZE1hbmFnZXIuX3dyaXRlRGVidWcoJ2ZwczogficrcC5sYXN0U291bmQuXzM2MGRhdGEuZnBzKTtcbiAgICAgIHAubGFzdFNvdW5kLl8zNjBkYXRhLmZwcyA9IDA7XG4gICAgfVxuICB9LDEwMDApO1xufVxuXG4vLyBTTTJfREVGRVIgZGV0YWlsczogaHR0cDovL3d3dy5zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9kb2MvZ2V0c3RhcnRlZC8jbGF6eS1sb2FkaW5nXG5cbmlmICh3aW5kb3cuU00yX0RFRkVSID09PSBfdW5kZWZpbmVkIHx8ICFTTTJfREVGRVIpIHtcbiAgdGhyZWVTaXh0eVBsYXllciA9IG5ldyBUaHJlZVNpeHR5UGxheWVyKCk7XG59XG5cbi8qKlxuICogU291bmRNYW5hZ2VyIHB1YmxpYyBpbnRlcmZhY2VzXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblxuICAvKipcbiAgICogY29tbW9uSlMgbW9kdWxlXG4gICAqL1xuXG4gIG1vZHVsZS5leHBvcnRzLlRocmVlU2l4dHlQbGF5ZXIgPSBUaHJlZVNpeHR5UGxheWVyO1xuICBtb2R1bGUuZXhwb3J0cy50aHJlZVNpeHR5UGxheWVyID0gdGhyZWVTaXh0eVBsYXllcjtcblxufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblxuICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgdGhlIGdsb2JhbCBpbnN0YW5jZSBvZiBTb3VuZE1hbmFnZXIuXG4gICAgICogSWYgYSBnbG9iYWwgaW5zdGFuY2UgZG9lcyBub3QgZXhpc3QgaXQgY2FuIGJlIGNyZWF0ZWQgdXNpbmcgYSBjYWxsYmFjay5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHNtQnVpbGRlciBPcHRpb25hbDogQ2FsbGJhY2sgdXNlZCB0byBjcmVhdGUgYSBuZXcgU291bmRNYW5hZ2VyIGluc3RhbmNlXG4gICAgICogQHJldHVybiB7U291bmRNYW5hZ2VyfSBUaGUgZ2xvYmFsIFNvdW5kTWFuYWdlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldEluc3RhbmNlKHNtQnVpbGRlcikge1xuICAgICAgaWYgKCF3aW5kb3cudGhyZWVTaXh0eVBsYXllciAmJiBzbUJ1aWxkZXIgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBzbUJ1aWxkZXIoVGhyZWVTaXh0eVBsYXllcik7XG4gICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIFRocmVlU2l4dHlQbGF5ZXIpIHtcbiAgICAgICAgICB3aW5kb3cudGhyZWVTaXh0eVBsYXllciA9IGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gd2luZG93LnRocmVlU2l4dHlQbGF5ZXI7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBjb25zdHJ1Y3RvcjogVGhyZWVTaXh0eVBsYXllcixcbiAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxuICAgIH1cbiAgfSk7XG5cbn1cblxuLy8gc3RhbmRhcmQgYnJvd3NlciBjYXNlXG5cbi8vIGNvbnN0cnVjdG9yXG53aW5kb3cuVGhyZWVTaXh0eVBsYXllciA9IFRocmVlU2l4dHlQbGF5ZXI7XG5cbi8qKlxuICogbm90ZTogU00yIHJlcXVpcmVzIGEgd2luZG93IGdsb2JhbCBkdWUgdG8gRmxhc2gsIHdoaWNoIG1ha2VzIGNhbGxzIHRvIHdpbmRvdy5zb3VuZE1hbmFnZXIuXG4gKiBGbGFzaCBtYXkgbm90IGFsd2F5cyBiZSBuZWVkZWQsIGJ1dCB0aGlzIGlzIG5vdCBrbm93biB1bnRpbCBhc3luYyBpbml0IGFuZCBTTTIgbWF5IGV2ZW4gXCJyZWJvb3RcIiBpbnRvIEZsYXNoIG1vZGUuXG4gKi9cblxuLy8gcHVibGljIEFQSSwgZmxhc2ggY2FsbGJhY2tzIGV0Yy5cbndpbmRvdy50aHJlZVNpeHR5UGxheWVyID0gdGhyZWVTaXh0eVBsYXllcjtcblxufSh3aW5kb3cpKTtcbiJdfQ==

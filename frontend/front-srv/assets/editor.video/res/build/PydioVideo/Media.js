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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var DEFAULT_HEIGHT = "100%";
var DEFAULT_WIDTH = "100%";
var DEFAULT_ASPECT_RATIO = 9 / 16;
var DEFAULT_ADJUSTED_SIZE = 0;
var DEFAULT_RESIZE_DEBOUNCE_TIME = 500;
var DEFAULT_VIDEO_OPTIONS = {
    preload: 'auto',
    autoplay: false,
    controls: true
};

function noop() {}

var Media = (function (_React$Component) {
    _inherits(Media, _React$Component);

    _createClass(Media, null, [{
        key: 'styles',
        get: function get() {
            return {
                container: { padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                },
                video: {
                    flex: 1
                }
            };
        }
    }]);

    function Media(props) {
        _classCallCheck(this, Media);

        _get(Object.getPrototypeOf(Media.prototype), 'constructor', this).call(this, props);

        this.handleVideoPlayerReady = this.handleVideoPlayerReady.bind(this);
        this.handleVideoPlayerResize = this.handleVideoPlayerResize.bind(this);
        this.getResizedVideoPlayerMeasurements = this.getResizedVideoPlayerMeasurements.bind(this);
    }

    _createClass(Media, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.mountVideoPlayer();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var isEndless = this.props.endlessMode;
            var willBeEndless = nextProps.endlessMode;

            if (isEndless !== willBeEndless) {
                if (willBeEndless) {
                    this.addEndlessMode();
                } else {
                    this.removeEndlessMode();
                }
            }

            var isResizable = this.props.resize;
            var willBeResizeable = nextProps.resize;

            if (isResizable !== willBeResizeable) {
                if (willBeResizeable) {
                    this.addResizeEventListener();
                } else {
                    this.removeResizeEventListener();
                }
            }

            var currentSrc = this.props.src;
            var newSrc = nextProps.src;

            if (currentSrc !== newSrc) {
                this.setVideoPlayerSrc(newSrc);
            } else if (isEndless === willBeEndless) {
                try {
                    this.restartVideo();
                } catch (e) {}
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate() {
            return false;
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unmountVideoPlayer();
        }
    }, {
        key: 'getVideoPlayer',
        value: function getVideoPlayer() {
            return this._player;
        }
    }, {
        key: 'getVideoPlayerEl',
        value: function getVideoPlayerEl() {
            if (!this._player) {
                return ReactDOM.findDOMNode(this.refs.videoPlayer);
            } else {
                return this._player.el();
            }
        }
    }, {
        key: 'getVideoPlayerOptions',
        value: function getVideoPlayerOptions() {
            return _lodash2['default'].defaults({}, this.props.options, {
                height: this.props.resize ? '' : this.props.height || DEFAULT_HEIGHT,
                width: this.props.resize ? '' : this.props.width || DEFAULT_WIDTH
            }, DEFAULT_VIDEO_OPTIONS);
        }
    }, {
        key: 'getVideoResizeOptions',
        value: function getVideoResizeOptions() {
            return _lodash2['default'].defaults({}, this.props.resizeOptions, {
                aspectRatio: DEFAULT_ASPECT_RATIO,
                shortWindowVideoHeightAdjustment: DEFAULT_ADJUSTED_SIZE,
                defaultVideoWidthAdjustment: DEFAULT_ADJUSTED_SIZE,
                debounceTime: DEFAULT_RESIZE_DEBOUNCE_TIME
            });
        }
    }, {
        key: 'getResizedVideoPlayerMeasurements',
        value: function getResizedVideoPlayerMeasurements() {
            var resizeOptions = this.getVideoResizeOptions();
            var aspectRatio = resizeOptions.aspectRatio;
            var defaultVideoWidthAdjustment = resizeOptions.defaultVideoWidthAdjustment;
            var winHeight = this._windowHeight();
            var baseWidth = this._videoElementWidth();
            var vidWidth = baseWidth - defaultVideoWidthAdjustment;
            var vidHeight = vidWidth * aspectRatio;
            if (winHeight < vidHeight) {
                var shortWindowVideoHeightAdjustment = resizeOptions.shortWindowVideoHeightAdjustment;
                vidHeight = winHeight - shortWindowVideoHeightAdjustment;
            }

            return {
                width: vidWidth,
                height: vidHeight
            };
        }
    }, {
        key: 'setVideoPlayerSrc',
        value: function setVideoPlayerSrc(src) {
            this._player.src(src);
        }
    }, {
        key: 'mountVideoPlayer',
        value: function mountVideoPlayer() {
            var src = this.props.src;
            var poster = this.props.poster;
            var options = this.getVideoPlayerOptions();

            this._player = (0, _videoJs2['default'])(this.getVideoPlayerEl(), options);

            var player = this._player;

            player.ready(this.handleVideoPlayerReady);

            _lodash2['default'].forEach(this.props.eventListeners, function (val, key) {
                player.on(key, val);
            });

            player.src(src);
            player.poster(poster);

            if (this.props.endlessMode) {
                this.addEndlessMode();
            }
        }
    }, {
        key: 'unmountVideoPlayer',
        value: function unmountVideoPlayer() {
            this.removeResizeEventListener();
            this._player.dispose();
        }
    }, {
        key: 'addEndlessMode',
        value: function addEndlessMode() {
            var player = this._player;

            player.on('ended', this.handleNextVideo);

            if (player.ended()) {
                this.handleNextVideo();
            }
        }
    }, {
        key: 'addResizeEventListener',
        value: function addResizeEventListener() {
            var debounceTime = this.getVideoResizeOptions().debounceTime;

            this._handleVideoPlayerResize = _lodash2['default'].debounce(this.handleVideoPlayerResize, debounceTime);
            window.addEventListener('resize', this._handleVideoPlayerResize);
        }
    }, {
        key: 'removeEndlessMode',
        value: function removeEndlessMode() {
            var player = this._player;

            player.off('ended', this.handleNextVideo);
        }
    }, {
        key: 'removeResizeEventListener',
        value: function removeResizeEventListener() {
            window.removeEventListener('resize', this._handleVideoPlayerResize);
        }
    }, {
        key: 'pauseVideo',
        value: function pauseVideo() {
            this._player.pause();
        }
    }, {
        key: 'playVideo',
        value: function playVideo() {
            this._player.play();
        }
    }, {
        key: 'restartVideo',
        value: function restartVideo() {
            this._player.currentTime(0).play();
        }
    }, {
        key: 'togglePauseVideo',
        value: function togglePauseVideo() {
            if (this._player.paused()) {
                this.playVideo();
            } else {
                this.pauseVideo();
            }
        }
    }, {
        key: 'handleVideoPlayerReady',
        value: function handleVideoPlayerReady() {

            var parent = this.getVideoPlayerEl().parentElement;

            if (parent) parent.removeAttribute('data-reactid');

            if (this.props.resize) {
                this.handleVideoPlayerResize();
                this.addResizeEventListener();
            }

            this.props.onReady();
        }
    }, {
        key: 'handleVideoPlayerResize',
        value: function handleVideoPlayerResize() {
            var player = this._player;
            var videoMeasurements = this.getResizedVideoPlayerMeasurements();

            player.dimensions(videoMeasurements.width, videoMeasurements.height);
        }
    }, {
        key: 'handleNextVideo',
        value: function handleNextVideo() {
            this.props.onNextVideo();
        }
    }, {
        key: 'renderDefaultWarning',
        value: function renderDefaultWarning() {
            return React.createElement(
                'p',
                { className: 'vjs-no-js' },
                React.createElement(
                    'a',
                    { href: 'http://www.google.cn/chrome/browser/desktop/index.html', target: '_blank' },
                    'The current browser version is too low, please use the latest browser to watch, thank you cooperation.'
                )
            );
        }
    }, {
        key: '_windowHeight',
        value: function _windowHeight() {
            return window.innerHeight;
        }
    }, {
        key: '_videoElementWidth',
        value: function _videoElementWidth() {
            return this.getVideoPlayerEl().parentElement.parentElement.offsetWidth;
        }
    }, {
        key: 'render',
        value: function render() {
            var videoPlayerClasses = (0, _classnames2['default'])({
                'video-js': true,
                'vjs-default-skin': this.props.vjsDefaultSkin,
                'vjs-big-play-centered': this.props.vjsBigPlayCentered
            });

            // We have a reference to the parent so that if the video tag has disappeared, no errors is thrown when unmounting
            return React.createElement(
                'div',
                { ref: 'videoPlayerMountPoint', style: Media.styles.container },
                React.createElement(
                    'video',
                    { ref: 'videoPlayer', className: videoPlayerClasses, style: Media.styles.video },
                    this.props.children || this.renderDefaultWarning()
                )
            );
        }
    }]);

    return Media;
})(React.Component);

;

Media.defaultProps = {
    endlessMode: false,
    options: DEFAULT_VIDEO_OPTIONS,
    onReady: noop,
    eventListeners: {},
    resize: false,
    resizeOptions: {},
    vjsDefaultSkin: true,
    vjsBigPlayCentered: true,
    onNextVideo: noop
};

Media.propTypes = {
    src: React.PropTypes.string.isRequired,
    poster: React.PropTypes.string,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    endlessMode: React.PropTypes.bool,
    options: React.PropTypes.object,
    onReady: React.PropTypes.func,
    eventListeners: React.PropTypes.object,
    resize: React.PropTypes.bool,
    resizeOptions: React.PropTypes.shape({
        aspectRatio: React.PropTypes.number,
        shortWindowVideoHeightAdjustment: React.PropTypes.number,
        defaultVideoWidthAdjustment: React.PropTypes.number,
        debounceTime: React.PropTypes.number
    }),
    vjsDefaultSkin: React.PropTypes.bool,
    vjsBigPlayCentered: React.PropTypes.bool,
    children: React.PropTypes.element,
    dispose: React.PropTypes.bool,
    onNextVideo: React.PropTypes.func
};

exports['default'] = Media;
module.exports = exports['default'];

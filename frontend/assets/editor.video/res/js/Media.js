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

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import cx from 'classnames';
import vjs from 'video.js';
import _  from   'lodash';

const DEFAULT_HEIGHT = "100%";
const DEFAULT_WIDTH =  "100%";
const DEFAULT_ASPECT_RATIO = (9 / 16);
const DEFAULT_ADJUSTED_SIZE = 0;
const DEFAULT_RESIZE_DEBOUNCE_TIME = 500;
const DEFAULT_VIDEO_OPTIONS = {
    preload: 'auto',
    autoplay: false,
    controls: true
};

function noop() {}

class Media extends React.Component {

    static get styles() {
        return {
            container: {padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
            },
            video: {
                flex: 1
            }
        }
    }

    constructor(props) {
        super(props)

        this.handleVideoPlayerReady = this.handleVideoPlayerReady.bind(this)
        this.handleVideoPlayerResize = this.handleVideoPlayerResize.bind(this)
        this.getResizedVideoPlayerMeasurements = this.getResizedVideoPlayerMeasurements.bind(this)
    }

    componentDidMount(){
        this.mountVideoPlayer();
    }

    componentWillReceiveProps(nextProps){
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
            } catch(e){}
        }
    }

    shouldComponentUpdate(){
        return false;
    }

    componentWillUnmount(){
        this.unmountVideoPlayer();
    }

    getVideoPlayer(){
        return this._player;
    }

    getVideoPlayerEl() {
        if (!this._player) {
            return ReactDOM.findDOMNode(this.refs.videoPlayer);
        } else {
            return this._player.el();
        }
    }

    getVideoPlayerOptions(){
        return _.defaults(
            {},
            this.props.options, {
                height: this.props.resize ? '' : (this.props.height || DEFAULT_HEIGHT),
                width: this.props.resize ? '' : (this.props.width || DEFAULT_WIDTH)
            },
            DEFAULT_VIDEO_OPTIONS
        );
    }

    getVideoResizeOptions(){
        return _.defaults({}, this.props.resizeOptions, {
            aspectRatio: DEFAULT_ASPECT_RATIO,
            shortWindowVideoHeightAdjustment: DEFAULT_ADJUSTED_SIZE,
            defaultVideoWidthAdjustment: DEFAULT_ADJUSTED_SIZE,
            debounceTime: DEFAULT_RESIZE_DEBOUNCE_TIME
        });
    }

    getResizedVideoPlayerMeasurements(){
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

    setVideoPlayerSrc(src){
        this._player.src(src);
    }

    mountVideoPlayer(){
        var src = this.props.src;
        var poster = this.props.poster;
        var options = this.getVideoPlayerOptions();

        this._player = vjs(this.getVideoPlayerEl(), options);

        var player = this._player;

        player.ready(this.handleVideoPlayerReady);

        _.forEach(this.props.eventListeners, function(val, key) {
            player.on(key, val);
        });

        player.src(src);
        player.poster(poster);

        if (this.props.endlessMode) {
            this.addEndlessMode();
        }
    }

    unmountVideoPlayer(){
        this.removeResizeEventListener();
        this._player.dispose();
    }

    addEndlessMode(){
        var player = this._player;

        player.on('ended', this.handleNextVideo);

        if (player.ended()) {
            this.handleNextVideo();
        }
    }

    addResizeEventListener(){
        var debounceTime = this.getVideoResizeOptions().debounceTime;

        this._handleVideoPlayerResize = _.debounce(this.handleVideoPlayerResize, debounceTime);
        window.addEventListener('resize', this._handleVideoPlayerResize);
    }

    removeEndlessMode(){
        var player = this._player;

        player.off('ended', this.handleNextVideo);
    }

    removeResizeEventListener(){
        window.removeEventListener('resize', this._handleVideoPlayerResize);
    }

    pauseVideo(){
        this._player.pause();
    }

    playVideo(){
        this._player.play();
    }

    restartVideo(){
        this._player.currentTime(0).play();
    }

    togglePauseVideo(){
        if (this._player.paused()) {
            this.playVideo();
        } else {
            this.pauseVideo();
        }
    }

    handleVideoPlayerReady(){

        const parent = this.getVideoPlayerEl().parentElement;

        if (parent) parent.removeAttribute('data-reactid');

        if (this.props.resize) {
            this.handleVideoPlayerResize();
            this.addResizeEventListener();
        }

        this.props.onReady();
    }

    handleVideoPlayerResize(){
        var player = this._player;
        var videoMeasurements = this.getResizedVideoPlayerMeasurements();

        player.dimensions(videoMeasurements.width, videoMeasurements.height);
    }

    handleNextVideo(){
        this.props.onNextVideo();
    }

    renderDefaultWarning(){
        return (
            <p className="vjs-no-js">
                <a href="http://www.google.cn/chrome/browser/desktop/index.html" target="_blank">
                The current browser version is too low, please use the latest browser to watch, thank you cooperation.
                </a>
            </p>
        );
    }

    _windowHeight(){
        return window.innerHeight;
    }

    _videoElementWidth(){
        return this.getVideoPlayerEl().parentElement.parentElement.offsetWidth;
    }

    render(){
        var videoPlayerClasses = cx({
            'video-js': true,
            'vjs-default-skin': this.props.vjsDefaultSkin,
            'vjs-big-play-centered': this.props.vjsBigPlayCentered
        });

        // We have a reference to the parent so that if the video tag has disappeared, no errors is thrown when unmounting
        return (
            <div ref="videoPlayerMountPoint" style={Media.styles.container}>
                <video ref="videoPlayer" className={videoPlayerClasses} style={Media.styles.video}>
                {this.props.children || this.renderDefaultWarning()}
                </video>
            </div>
        );
    }
};

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
}

Media.propTypes = {
    src: PropTypes.string.isRequired,
    poster: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number,
    endlessMode: PropTypes.bool,
    options: PropTypes.object,
    onReady: PropTypes.func,
    eventListeners: PropTypes.object,
    resize: PropTypes.bool,
    resizeOptions: PropTypes.shape({
        aspectRatio: PropTypes.number,
        shortWindowVideoHeightAdjustment: PropTypes.number,
        defaultVideoWidthAdjustment: PropTypes.number,
        debounceTime: PropTypes.number
    }),
    vjsDefaultSkin: PropTypes.bool,
    vjsBigPlayCentered: PropTypes.bool,
    children: PropTypes.element,
    dispose: PropTypes.bool,
    onNextVideo: PropTypes.func
}

export default Media

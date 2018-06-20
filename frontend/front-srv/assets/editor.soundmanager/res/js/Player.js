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
import { soundManager } from 'soundmanager2';
import { threeSixtyPlayer } from '../../../sm/360-player/script/360player';


soundManager.setup({
    // path to directory containing SM2 SWF
    url: 'plugins/editor.soundmanager/sm/swf/',
    debugMode: true
});

class Player extends React.Component {
    constructor(props) {
        super(props)

        threeSixtyPlayer.config.autoPlay = props.autoPlay

        threeSixtyPlayer.config.scaleFont = (navigator.userAgent.match(/msie/i)?false:true);
        threeSixtyPlayer.config.showHMSTime = true;

        // enable some spectrum stuffs
        threeSixtyPlayer.config.useWaveformData = true;
        threeSixtyPlayer.config.useEQData = true;

        // enable this in SM2 as well, as needed
        if (threeSixtyPlayer.config.useWaveformData) {
          soundManager.flash9Options.useWaveformData = true;
        }
        if (threeSixtyPlayer.config.useEQData) {
          soundManager.flash9Options.useEQData = true;
        }
        if (threeSixtyPlayer.config.usePeakData) {
          soundManager.flash9Options.usePeakData = true;
        }

        if (threeSixtyPlayer.config.useWaveformData || threeSixtyPlayer.flash9Options.useEQData || threeSixtyPlayer.flash9Options.usePeakData) {
            // even if HTML5 supports MP3, prefer flash so the visualization features can be used.
            soundManager.preferFlash = true;
        }

        // favicon is expensive CPU-wise, but can be used.
        if (window.location.href.match(/hifi/i)) {
          threeSixtyPlayer.config.useFavIcon = true;
        }

        if (window.location.href.match(/html5/i)) {
          // for testing IE 9, etc.
          soundManager.useHTML5Audio = true;
        }
    }

    componentWillMount() {

        //soundManager.createSound()
    }


    componentDidMount() {
        //soundManager.onready(() => React.Children.map(this.props.children, (child) => soundManager.createSound({url: child.href})))
        soundManager.onready(threeSixtyPlayer.init)

        // soundManager.onready(nextProps.onReady)
        // soundManager.beginDelayedInit()
    }

    componentWillReceiveProps(nextProps) {
        //soundManager.onready(() => React.Children.map(nextProps.children, (child) => soundManager.createSound({url: child.href})))
        soundManager.onready(threeSixtyPlayer.init)
    }

    /*componentWillUnmount() {
        soundManager.reboot()
    }*/

    render() {
        let className="ui360"
        if (this.props.rich) {
            className += " ui360-vis"
        }

        return (
            <div className={className} style={this.props.style}>
                {this.props.children}
            </div>
        )
    }
}

Player.propTypes = {
    threeSixtyPlayer: React.PropTypes.object,
    autoPlay: React.PropTypes.bool,
    rich: React.PropTypes.bool.isRequired,
    onReady: React.PropTypes.func
}

Player.defaultProps = {
    autoPlay: false,
    rich: true
}

export default Player

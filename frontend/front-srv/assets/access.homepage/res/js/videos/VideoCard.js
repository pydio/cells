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

const React = require('react')
import PropTypes from 'prop-types'
const ReactDOM = require('react-dom')
const {asGridItem} = require('pydio').requireLib('components')
const {MenuItem, IconMenu, IconButton, Color} = require('material-ui')

import VideoPlayer from './VideoPlayer'
import Palette from '../board/Palette'
import ColorPaper from '../board/ColorPaper'

const PALETTE_INDEX = 4;

/**
 * Display a list of tutorial videos as a material card
 */
class VideoCard extends React.Component {
    static propTypes = {
        youtubeId           : PropTypes.string,
        contentMessageId    : PropTypes.string
    };

    constructor(props) {
        super(props);
        this._videos = [
            ['qvsSeLXr-T4', 'user_home.63'],
            ['HViCWPpyZ6k', 'user_home.79'],
            ['jBRNqwannJM', 'user_home.80'],
            ['2jl1EsML5v8', 'user_home.81'],
            ['28-t4dvhE6c', 'user_home.82'],
            ['fP0MVejnVZE', 'user_home.83'],
            ['TXFz4w4trlQ', 'user_home.84'],
            ['OjHtgnL_L7Y', 'user_home.85'],
            ['ot2Nq-RAnYE', 'user_home.66']
        ];
        const k = Math.floor(Math.random() * this._videos.length);
        const value = this._videos[k];

        this.state = {
            videoIndex      : k,
            youtubeId       : value[0],
            contentMessageId: value[1]
        };
    }

    launchVideo = () => {
        const url = "//www.youtube.com/embed/"+this.state.youtubeId+"?list=PLxzQJCqzktEbYm3U_O1EqFru0LsEFBca5&autoplay=1";
        this._videoDiv = document.createElement('div');
        document.body.appendChild(this._videoDiv);
        ReactDOM.render(<VideoPlayer videoSrc={url} closePlayer={this.closePlayer}/>, this._videoDiv);
    };

    closePlayer = () => {
        ReactDOM.unmountComponentAtNode(this._videoDiv);
        document.body.removeChild(this._videoDiv);
    };

    getTitle = (messId) => {
        const text = this.props.pydio.MessageHash[messId];
        return text.split('\n').shift().replace('<h2>', '').replace('</h2>', '');
    };

    browse = (direction = 'next', event) => {
        let nextIndex;
        const {videoIndex} = this.state;
        if(direction === 'next'){
            nextIndex = videoIndex < this._videos.length -1  ? videoIndex + 1 : 0;
        }else{
            nextIndex = videoIndex > 0  ? videoIndex - 1 : this._videos.length - 1;
        }
        const value = this._videos[nextIndex];
        this.setState({
            videoIndex      : nextIndex,
            youtubeId       : value[0],
            contentMessageId: value[1]
        });
    };

    render() {
        const MessageHash = this.props.pydio.MessageHash;
        const htmlMessage = function(id){
            return {__html:MessageHash[id]};
        };
        const menus = this._videos.map(function(item, index){
            return <MenuItem key={`videoCardMenuItem_${index}`} primaryText={this.getTitle(item[1])} onClick={() => {this.setState({youtubeId:item[0], contentMessageId:item[1], videoIndex: index})} }/>;
        }.bind(this));
        let props = {...this.props};
        const {youtubeId, contentMessageId} = this.state;
        props.className += ' video-card';

        const tint = Color(Palette[PALETTE_INDEX]).alpha(0.8).toString();
        return (
            <ColorPaper {...props} paletteIndex={PALETTE_INDEX} getCloseButton={() => {return this.props.closeButton}}>
                <div className="tutorial_legend">
                    <div className="tutorial_video_thumb" style={{backgroundImage:'url("https://img.youtube.com/vi/'+youtubeId+'/0.jpg")'}}>
                        <div style={{position:'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tint}}/>
                        <div className="tutorial_prev mdi mdi-arrow-left" onClick={this.browse.bind(this, 'previous')}/>
                        <div className="tutorial_play mdi mdi-play" onClick={this.launchVideo}/>
                        <div className="tutorial_next mdi mdi-arrow-right" onClick={this.browse.bind(this, 'next')}/>
                        <div className="tutorial_title">
                            <span dangerouslySetInnerHTML={htmlMessage(contentMessageId)}/>
                            <IconMenu
                                style={{position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.43)', padding: 2, borderRadius: '0 0 2px 0'}}
                                iconStyle={{color:'white'}}
                                iconButtonElement={<IconButton iconClassName="mdi mdi-dots-vertical"/>}
                                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                            >{menus}</IconMenu>
                        </div>
                    </div>
                </div>
            </ColorPaper>
        );
    }
}

VideoCard = asGridItem(VideoCard,global.pydio.MessageHash['user_home.94'],{gridWidth:2,gridHeight:12},[]);
export {VideoCard as default}

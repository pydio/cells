/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import React from 'react'
import {IconButton} from 'material-ui'
import toggleBookmarkNode from "./toggleBmNode";

class BookmarkButton extends React.Component{


    constructor(props){
        super(props);
        this.state = this.valueFromNodes(props.nodes);
    }

    valueFromNodes(nodes = []) {

        let mixed, value = undefined;
        nodes.forEach(n => {
            const nVal = n.getMetadata().get('bookmark') === 'true';
            if(value !== undefined && nVal !== value) {
                mixed = true;
            }
            value = nVal;
        });
        return {value, mixed};

    }

    updateValue(value){

        const {nodes} = this.props;

        this.setState({saving: true});
        const proms = [];
        nodes.forEach(n => {
            const isBookmarked = n.getMetadata().get('bookmark') === 'true';
            if(value !== isBookmarked){
                proms.push(toggleBookmarkNode(n));
                let overlay = n.getMetadata().get('overlay_class') || '';
                if(value) {
                    n.getMetadata().set('bookmark', 'true');
                    let overlays = overlay.replace('mdi mdi-star', '').split(',');
                    overlays.push('mdi mdi-star');
                    n.getMetadata().set('overlay_class', overlays.join(','));
                } else {
                    n.getMetadata().delete('bookmark');
                    n.getMetadata().set('overlay_class', overlay.replace('mdi mdi-star', ''));
                }
                n.notify('node_replaced');
            }
        });
        Promise.all(proms).then(()=>{
            window.setTimeout(()=>{
                this.setState({saving: false});
            }, 250)
            this.setState(this.valueFromNodes(nodes));
        }).catch(()=>{
            this.setState({saving: false});
        });

    }


    render() {

        const {styles} = this.props;
        const baseStyles = {
            style: {width:40,height:40,padding:8},
            iconStyle: {color:'var(--md-sys-color-primary)'}
        }
        const {value, mixed, saving} = this.state;
        let icon, touchValue, tt, disabled;
        const mm = Pydio.getInstance().MessageHash;
        if(mixed){
            icon = 'star-half';
            touchValue = true;
            tt = mm['bookmark.button.tip.mixed'];
        } else if(value){
            icon = 'star';
            touchValue = false;
            tt = mm['bookmark.button.tip.remove'];
        } else {
            icon = 'star-outline';
            touchValue = true;
            tt = mm['bookmark.button.tip.add'];
        }

        if(saving){
            icon = 'star-circle';
            tt = mm['bookmark.button.tip.saving'];
            disabled = true;
        }

        return (
            <IconButton
                disabled={disabled}
                iconClassName={'mdi mdi-' + icon}
                tooltip={tt}
                onClick={() => this.updateValue(touchValue)} {...styles}
                style={{...baseStyles.style, ...styles.style}}
                iconStyle={{...baseStyles.iconStyle, ...styles.iconStyle}}
            />)


    }

}

export default BookmarkButton
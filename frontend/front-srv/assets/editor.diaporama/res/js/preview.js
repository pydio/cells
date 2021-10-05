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
import React, {Component} from 'react'
import { ImageContainer } from './components'
import urlForSize from './sizes'

class Preview extends Component {

    constructor(props){
        super(props);
        this.state = {src: ''};
    }

    componentDidMount(){
        const {node} = this.props;
        urlForSize(node, 'preview').then(url => {
            if (url) {
                this.setState({src: url});
            }
        });
    }

    render(){
        const {node, ...remainingProps} = this.props;
        let orientation;
        if(node && node.getMetadata().get("image_exif_orientation")){
            orientation = node.getMetadata().get("image_exif_orientation");
            if(remainingProps.className){
                remainingProps.className += ' ort-rotate-' + orientation
            } else {
                remainingProps.className = 'ort-rotate-' + orientation
            }
            if(parseInt(orientation) >= 5 && remainingProps.style && remainingProps.style.height === 200){
                remainingProps.style.height = 250;
            }
        }

        const {src} = this.state;
        if (!src) {
            return null;
        }
        let mFont;
        const {mimeFontOverlay} = remainingProps;
        if(mimeFontOverlay && node.isLeaf() && node.getMetadata().get('ImagePreview')){
            const icClass = node.getSvgSource()
            if (icClass){
                mFont = 'mdi mdi-' + icClass
            }
        }
        return (<ImageContainer
            {...remainingProps}
            src={src}
            mFont={mFont}
            imgStyle={{
                width: "100%",
                height: "100%",
                flex: 1
            }}
        />);
    }
}

export default Preview

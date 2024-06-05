const PropTypes = require('prop-types');
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

const {
    Component
} = require('react')

export function bgCoverFromScreenRatio(width, height){
    const screenWidth = DOMUtils.getViewportWidth();
    const screenHeight = DOMUtils.getViewportHeight();

    const imageRatio = width/height;
    const coverRatio = screenWidth/screenHeight;

    let coverHeight, scale, coverWidth;
    if (imageRatio >= coverRatio) {
        coverHeight = screenHeight;
        scale = (coverHeight / height);
        coverWidth = width * scale;
    } else {
        coverWidth = screenWidth;
        scale = (coverWidth / width);
        coverHeight = height * scale;
    }
    return coverWidth + 'px ' + coverHeight + 'px';
}

class CSSBlurBackground extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {};
    }

    componentDidMount(){
        this.activateResizeObserver();
    }

    componentWillUnmount(){
        this.deactivateResizeObserver();
    }

    activateResizeObserver(){
        if(this._resizeObserver) return;
        this._resizeObserver = () => {this.computeBackgroundData()};
        DOMUtils.observeWindowResize(this._resizeObserver);
        this.computeBackgroundData();
    }

    deactivateResizeObserver(){
        if(this._resizeObserver){
            DOMUtils.stopObservingWindowResize(this._resizeObserver);
            this._resizeObserver = null;
        }
    }

    computeBackgroundData(){

        const pydioMainElement = document.getElementById(window.pydio.Parameters.get('MAIN_ELEMENT'));
        const reference = pydioMainElement.querySelector('div[style]');
        if(!reference){
            return;
        }
        if(this.backgroundImageData){
            this.computeRatio();
            return;
        }

        const url = window.getComputedStyle(reference).getPropertyValue('background-image');
        let backgroundImage = new Image();
        backgroundImage.src = url.replace(/"/g,"").replace(/url\(|\)$/ig, "");

        let oThis = this;
        backgroundImage.onload = function() {
            const width = this.width;
            const height = this.height;

            oThis.backgroundImageData = {
                url: url,
                width: width,
                height: height
            };

            oThis.computeRatio();

        };
    }

    computeRatio(){

        const {width, height, url} = this.backgroundImageData;
        this.setState({
            backgroundImage: url,
            backgroundSize: bgCoverFromScreenRatio(width, height)
        });

    }


    render(){

        const {backgroundImage, backgroundSize} = this.state;
        if(!backgroundImage) return null;
        return(
            <style dangerouslySetInnerHTML={{
                __html: [
                    '.react-mui-context div.dialogRootBlur > div > div.dialogRootBlur:before {',
                    '  background-image: '+backgroundImage+';',
                    '  background-size: '+backgroundSize+';',
                    '}'
                ].join('\n')
            }}>
            </style>
        );

    }

}

export {CSSBlurBackground as default}
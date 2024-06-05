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
import PropTypes from 'prop-types'

export class Image extends Component {
    render() {
        const {src, style, ...remainingProps} = this.props
        let cleanSrc = src.replace(new RegExp("'", 'g') , "\\'");
        cleanSrc = cleanSrc.replace(new RegExp("\\+", 'g') , encodeURIComponent("+"));

        return (
            <div
                {...remainingProps}
                style={{
                    ...style,
                    backgroundImage: `url('${cleanSrc}')`,
                    backgroundSize : "cover",
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    margin: 'auto'
                }}
            />
        )
    }
}

export class ImageContainer extends Component {
    static get propTypes() {
        return {
            src: PropTypes.string.isRequired,
            imgClassName: PropTypes.string,
            imgStyle: PropTypes.object,
            width: PropTypes.number,
            height: PropTypes.number
        }
    }

    static get defaultProps() {
        return {
            src: ""
        }
    }

    static get styles() {
        return {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: 'auto',
            width: "100%",
            height: "100%"
        }
    }

    render() {
        const {src, style, width, height, imgStyle, imgClassName, scale = 1, mFont, ...remaining} = this.props;

        const {editorData} = this.props;
        if(editorData && editorData.extensions && editorData.extensions.length > 0){
            const extName = editorData.extensions[0];
            // it must have been previously loaded via classes dependencies
            const provider = window[extName];
            if(provider && provider.getWrapper && provider.getWrapper('ImageContainer')){
                return React.createElement(
                    provider.getWrapper('ImageContainer'),
                    {...this.props, style:{...ImageContainer.styles, ...style}},
                    <Image
                        src={src}
                        className={imgClassName}
                        style={{
                            width: width && width * scale || "100%",
                            height: height && height * scale || "100%",
                            ...imgStyle,
                        }}
                    />
                );
            }
        }

        // Do not pass all "remaining" as div props
        const {className, mimeFontOverlayStyle} = remaining || {};
        const otherStyle = {};
        if(mFont){
            otherStyle.position='relative';
        }

        return (
            <div style={{...ImageContainer.styles, ...style, ...otherStyle}} className={className}>
                <Image
                    src={src}
                    className={imgClassName}
                    style={{
                        width: width && width * scale || "100%",
                        height: height && height * scale || "100%",
                        ...imgStyle,
                    }}
                />
                {mFont && <div className={mFont + ' mimefont mimefont-overlay'} style={mimeFontOverlayStyle}/>}
            </div>
        )
    }
}

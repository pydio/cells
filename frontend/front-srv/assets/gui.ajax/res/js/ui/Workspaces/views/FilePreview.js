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

import PropTypes from 'prop-types';

import Pydio from 'pydio'
import { PureComponent } from 'react';
import {muiThemeable} from 'material-ui/styles';
import {CircularProgress} from 'material-ui';
import Color from 'color'
import FuncUtils from 'pydio/util/func'

class FilePreview extends PureComponent {
    static get propTypes() {
        return {
            node            : PropTypes.instanceOf(AjxpNode).isRequired,
            loadThumbnail   : PropTypes.bool,
            richPreview     : PropTypes.bool,
            processing      : PropTypes.bool,
            // Additional styling
            style           : PropTypes.object,
            mimeFontStyle   : PropTypes.object,
            mimeClassName   : PropTypes.string
        }
    }

    static get defaultProps() {
        return {richPreview: false}
    }

    constructor(props) {
        super(props)

        this.state = {
            loading: false
        }
    }

    getStyles() {
        const {style, mimeFontStyle, lightBackground, muiTheme} = this.props

        const color = new Color(muiTheme.palette.primary1Color).saturationl(18).lightness(44).toString();
        const light = new Color(muiTheme.palette.primary1Color).saturationl(15).lightness(lightBackground?98:94).toString();

        const rootStyle = {
            backgroundColor: light,
            alignItems: "initial",
            ...style
        };

        const mimefontStyle = {
            color: color,
            ...mimeFontStyle
        };

        return {rootStyle: rootStyle, mimeFontStyle: mimefontStyle};
    }

    insertPreviewNode(previewNode) {
        this._previewNode = previewNode;
        let containerNode = this.refs.container;
        containerNode.innerHTML = '';
        containerNode.className='richPreviewContainer';
        containerNode.appendChild(this._previewNode);
    }

    destroyPreviewNode() {
        if(this._previewNode) {
            this._previewNode.destroyElement();
            if(this._previewNode.parentNode) {
                this._previewNode.parentNode.removeChild(this._previewNode);
            }
            this._previewNode = null;
        }
    }

    componentDidMount() {
        this.loadCoveringImage();
    }

    componentWillUnmount() {
        this.destroyPreviewNode();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.node.getPath() !== this.props.node.getPath()){
            this.destroyPreviewNode();
            this.loadCoveringImage();
            return;
        }

        if(this._previewNode){
            return;
        }

        if(nextProps.loadThumbnail !== this.props.loadThumbnail && nextProps.loadThumbnail){
            this.loadCoveringImage(true);
        }
    }

    loadCoveringImage(force = false) {
        const {node, loadThumbnail, richPreview} = this.props;
        if(!loadThumbnail && !force){
            return;
        }
        const pydio = Pydio.getInstance();
        let editors = pydio.Registry.findEditorsForMime((node.isLeaf()?node.getAjxpMime():"mime_folder"), true);
        if(!editors || !editors.length) {
            if(richPreview && node.getMetadata().get('PDFPreview')) {
                editors = pydio.Registry.findEditorsForMime('pdf', true);
            } else if (node.getMetadata().get('ImagePreview')) {
                editors = pydio.Registry.findEditorsForMime('jpg', true);
            }
            if(!editors || !editors.length){
                return;
            }
        }
        const editorClassName = editors[0].editorClass;
        pydio.Registry.loadEditorResources(editors[0].resourcesManager, function(){
            const component = FuncUtils.getFunctionByName(editorClassName, window);
            if(component){
                this.loadPreviewFromEditor(component, node);
            }
        }.bind(this));
    }

    loadPreviewFromEditor(editorClass, node) {
        this.setState({
            EditorClass: this.props.richPreview ? editorClass.Panel : editorClass.Badge
        })
    }

    render() {
        const {rootStyle, mimeFontStyle} = this.getStyles();

        const {node, mimeClassName, processing} = this.props;
        const {EditorClass} = this.state;

        let element, additionalClass = '';

        if (processing) {
            if (rootStyle.height > 150) {
                element = <CircularProgress size={30} thickness={2}/>
                rootStyle.alignItems = 'center';
                rootStyle.justifyContent= 'center';
            } else {
                element = <CircularProgress size={24} thickness={1.5} style={{margin:8}} />
            }
        } else if (EditorClass) {
            element = <EditorClass pydio={Pydio.getInstance()} {...this.props} preview={true} mimeFontStyle={mimeFontStyle} />
            additionalClass = ' editor_mime_' + node.getAjxpMime();
        } else {
            let icClass = node.getSvgSource() || (node.isLeaf() ? 'file': 'folder');
            if(icClass && !icClass.startsWith('icomoon')){
                icClass = 'mdi mdi-' + icClass;
            }
            element = <div key="icon" className={mimeClassName || 'mimefont ' + icClass} style={mimeFontStyle}/>
        }


        return (
            <div ref="container" style={rootStyle} className={'mimefont-container' + (EditorClass?' with-editor-badge':'') + additionalClass} onClick={this.props.onClick}>
                {element}
            </div>
        );
    }
}

export default muiThemeable()(FilePreview)

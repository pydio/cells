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



import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { ImageContainer } from './components'
import urlForSize from './sizes'

const editors = Pydio.getInstance().Registry.getActiveExtensionByType("editor")
const editorConf = editors.filter(({id}) => id === 'editor.diaporama')[0]
const pluginConf = pydio.getPluginConfigs('editor.diaporama');
const sizes = pluginConf && pluginConf.get("PREVIEWER_LOWRES_SIZES").split(",") || [300, 700, 1000, 1300];


const { withResolution, withSelection, withResize, EditorActions } = Pydio.requireLib('hoc');
const ExtendedImageContainer = withResize(ImageContainer);

@connect(null, EditorActions)
class Editor extends PureComponent {

    static get propTypes() {
        return {
            node: PropTypes.instanceOf(AjxpNode).isRequired
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectionPlaying !== nextProps.selectionPlaying)  {
            if (nextProps.selectionPlaying) {
                this.pe = new PeriodicalExecuter(nextProps.onRequestSelectionPlay, 3);
            } else {
                this.pe && this.pe.stop()
            }
        }
        const {editorModify} = this.props;
        if (nextProps.isActive) {
            editorModify({fixedToolbar: false})
        }
    }

    render() {
        const {node, src, editorData} = this.props;

        if (!node || !src) return null;

        let orientation;
        if(node.getMetadata().get("image_exif_orientation")){
            orientation = node.getMetadata().get("image_exif_orientation");
        }

        let imageClassName = ['diaporama-image-main-block']
        let imageStyle = {
            boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
        }

        if (orientation) {
            imageClassName = [
                ...imageClassName,
                'ort-rotate-' + orientation
            ];
            imageStyle.imageOrientation = 'none'
        }
        return (
            <ExtendedImageContainer
                editorData={editorData}
                node={node}
                src={src}
                renderOnChange={true}
                passOnProps={true}
                imgClassName={imageClassName.join(" ")}
                imgStyle={imageStyle}
            />
        )
    }
}

const getSelectionFilter = (node) => editorConf.mimes.indexOf(node.getAjxpMime()) > -1
// const getSelectionFilter = (node) => node.getMetadata().get('is_image')
const getSelection = (node) => new Promise((resolve, reject) => {
    let selection = [];

    node.getParent().getChildren().forEach((child) => selection.push(child));
    selection = selection.filter(getSelectionFilter).sort((a,b)=>{
        return a.getLabel().localeCompare(b.getLabel(), undefined, {numeric:true})
    })


    resolve({
        selection,
        currentIndex: selection.reduce((currentIndex, current, index) => current === node && index || currentIndex, 0)
    })
});

const mapStateToProps = (state, props) => {
    const {node, editorData} = props;

    if (!node) {
        return props;
    }

    const {tabs} = state;

    const tab = tabs.filter(({editorData: currentEditorData, node: currentNode}) => (!currentEditorData || currentEditorData.id === editorData.id) && currentNode.getPath() === node.getPath())[0] || {}

    if (!tab) {
        return props;
    }

    const {node: tabNode, resolution: tabResolution} = tab;

    return {
        orientation: tabResolution === 'hi' ? tabNode.getMetadata().get("image_exif_orientation") : null,
        ...props
    }
};

export default compose(
    withSelection(getSelection, getSelectionFilter),
    withResolution(sizes,
        (node) => urlForSize(node, "hq"),
        (node, dimension) => urlForSize(node, "editor"),
    ),
    connect(mapStateToProps)
)(Editor)

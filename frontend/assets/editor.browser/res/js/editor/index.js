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
import React, {Component} from 'react';
const PydioApi = require("pydio/http/api");
import {connect} from 'react-redux'
const {EditorActions} = Pydio.requireLib('hoc');

@connect(null, EditorActions)
class Editor extends Component {

    static get styles() {
        return {
            iframe: {
                border: 0,
                flex: 1,
                width: '100%',
                backgroundColor: 'white',
            }
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            frameSrc: null
        }
    }

    componentDidMount(){
        const {pydio, node, editorModify, isActive} = this.props;
        const configs = pydio.getPluginConfigs("editor.browser");

        if (node.getAjxpMime() === "url" || node.getAjxpMime() === "website") {
            this.openBookmark(node, configs);
        } else {
            this.openNode(node, configs);
        }
        if (editorModify && isActive) {
            editorModify({fixedToolbar: false})
        }

    }

    componentWillReceiveProps(nextProps) {
        const {editorModify} = this.props;
        if (editorModify && nextProps.isActive) {
            editorModify({fixedToolbar: false})
        }
    }
    
    openBookmark(node, configs) {

        let alwaysOpenLinksInBrowser = (configs.get('OPEN_LINK_IN_TAB') === 'browser');

        PydioApi.getClient().getPlainContent(node, (url) => {
            if (url.indexOf('URL=') !== -1) {
                url = url.split('URL=')[1];
                if(url.indexOf('\n') !== -1){
                    url = url.split('\n')[0];
                }
            }
            this._openURL(url, alwaysOpenLinksInBrowser, true);
        })
    }

    openNode(node, configs) {

        const {pydio} = this.props;
        const alwaysOpenDocsInBrowser = configs.get('OPEN_DOCS_IN_TAB') === "browser";

        PydioApi.getClient().buildPresignedGetUrl(node, (url) => {
            this._openURL(url, alwaysOpenDocsInBrowser, false);
        }, "detect");

    }

    _openURL(url, modal=false, updateTitle = false) {
        if(modal){
            global.open(url, '', "location=yes,menubar=yes,resizable=yes,scrollbars=yes,toolbar=yes,status=yes");
            if (this.props.onRequestTabClose) {
                this.props.onRequestTabClose();
            }
        }else{
            if (updateTitle && this.props.onRequestTabTitleUpdate) {
                this.props.onRequestTabTitleUpdate(url);
            }
            this.setState({frameSrc:url});
        }
    }

    render() {
        return (
            <iframe  style={Editor.styles.iframe} src={this.state.frameSrc} sandbox={""}/>
        )
    }
}

export {Editor}

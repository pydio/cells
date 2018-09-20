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
import { connect } from 'react-redux'
import { compose } from 'redux'
import Pydio from 'pydio'
const {EditorActions, withLoader, withErrors} = Pydio.requireLib('hoc');

class Viewer extends React.Component{

    componentDidMount(){
        const {path} = this.props;
        const {iframe} = this.refs;
        if(iframe){
            const ifrm = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
            let content = "<html>\n" +
                "<head>\n" +
                "    <script src=\"http://webodf.org/demo/demobrowser/webodf.js\" type=\"text/javascript\" charset=\"utf-8\"></script>\n" +
                "    <script type=\"text/javascript\" charset=\"utf-8\">\n" +
                "        function init()\n" +
                "        {\n" +
                "            var odfelement = document.getElementById(\"odf\");\n" +
                "            window.odfcanvas = new odf.OdfCanvas(odfelement);\n" +
                "            window.odfcanvas.load(\"../../\" + window.parent.ajxpServerAccessPath + \"&get_action=download&file="+path+"\");\n" +
                "        }\n" +
                "        window.setTimeout(init, 0);\n" +
                "    </script>\n" +
                "    <style type=\"text/css\">\n" +
                "        .shadow_class{\n" +
                "            box-shadow: 1px 1px 6px black;\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body style=\"background-color: rgb(85, 85, 85);\">\n" +
                "    <div id=\"odf\" class=\"shadow_class\"></div>\n" +
                "</body>\n" +
                "</html>\n";
            ifrm.document.write(content);
        }
    }

    render(){
        const {style, onLoad} = this.props;
        return (
            <iframe ref={"iframe"} style={{...style, height: "100%", border: 0, flex: 1}} onLoad={onLoad} className="vertical_fit"></iframe>
        );
    }
}

@connect(null, EditorActions)
class Editor extends React.Component {
    componentDidMount() {
        this.loadNode(this.props)
        const {editorModify} = this.props;
        if (this.props.isActive) {
            editorModify({fixedToolbar: true})
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.node !== this.props.node) {
            this.loadNode(nextProps)
        }
        const {editorModify} = this.props;
        if (nextProps.isActive) {
            editorModify({fixedToolbar: true})
        }
    }

    loadNode(props) {
        const {node} = props;
        this.setState({path: node.getPath()});
    }

    render() {
        return (
            <Viewer ref="iframe" {...this.props} {...this.state} />
        );
    }
}

// Define HOCs
Viewer = withLoader(Viewer);
Viewer = withErrors(Viewer);

export default Editor

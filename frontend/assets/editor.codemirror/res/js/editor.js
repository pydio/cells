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



import Pydio from 'pydio'
import React from 'react';
import DOMUtils from 'pydio/util/dom'
import { connect } from 'react-redux';
import Markdown from "react-markdown";
import RemarkGFM from "remark-gfm";
import ReactCodeMirror from "./ReactCodeMirror";
import {Resizable} from 're-resizable'

const {EditorActions} = Pydio.requireLib('hoc');

function mapStateToProps (state, props) {
    const {tabs} = state

    const tab = tabs.filter(({editorData, node}) => (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath())[0] || {}

    return {
        id: tab.id,
        tab,
        ...props
    }
}

@connect(mapStateToProps, EditorActions)
export default class Editor extends React.Component {

    constructor(props) {
        super(props);

        const {node, tab = {}, tabCreate} = this.props;
        const {id} = tab;
        this.state = {}

        if (!id) {
            tabCreate({id: node.getLabel(), node})
        }
    }

    componentDidMount() {
        const {pydio, node, tab, tabModify} = this.props;
        const {id} = tab;

        let defaultWidth = localStorage.getItem('pydio.layout.markdown-editor.rightColumnWidth')
        if (defaultWidth) {
            defaultWidth = DOMUtils.getViewportWidth() *  parseInt(defaultWidth) / 100
        } else {
            defaultWidth = DOMUtils.getViewportWidth() / 2
        }
        this.setState({rightColumnWidth:defaultWidth})

        pydio.ApiClient.getPlainContent(node, (content) => {
            tabModify({
                id: id || node.getLabel(),
                editable: true,
                editortools: true,
                searchable: true,
                lineNumbers: true,
                content: content,
                node
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        const {editorModify} = this.props;

        if (editorModify && nextProps.isActive) {
            editorModify({fixedToolbar: true})
        }
    }

    render() {
        const {node, tab, error, tabModify} = this.props;

        if (!tab) {
            return null;
        }

        const {id, content, lineWrapping, lineNumbers} = tab;
        const {rightColumnClosed = false, rightColumnWidth} = this.state;

        if(node.getAjxpMime() === 'md'){
            const show = DOMUtils.getViewportWidth() > 480;
            return (
                <div style={{display:'flex', flex:1, width: '100%', backgroundColor:'white'}}>
                    <Resizable
                        enable={{top:false, right:true, bottom:false, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false}}
                        minWidth={'4%'}
                        maxWidth={'96%'}
                        style={{transition: 'width 550ms cubic-bezier(0.23, 1, 0.32, 1) 0ms', display:'flex'}}
                        //handleStyles={{left:{width: 6, left: 0}}}
                        size={{width:rightColumnClosed?0:rightColumnWidth, height: '100%'}}
                        onResizeStop={(e, direction, ref, d)=>{
                            const newWidth = rightColumnWidth+d.width
                            this.setState({rightColumnWidth:newWidth})
                            localStorage.setItem('pydio.layout.markdown-editor.rightColumnWidth', parseInt(100*newWidth/DOMUtils.getViewportWidth())+'')
                        }}
                    >
                    <ReactCodeMirror
                            {...this.props}
                            url={node.getPath()}
                            content={content}
                            options={{lineNumbers: lineNumbers, lineWrapping: lineWrapping}}
                            error={error}
                            onLoad={(codemirror) => tabModify({id, codemirror})}
                            onChange={content => tabModify({id, content})}
                            onCursorChange={cursor => tabModify({id, cursor})}
                        />
                    </Resizable>
                    <Markdown
                        style={{flex: 1}}
                        className={"mdviewer"}
                        remarkPlugins={[RemarkGFM]}
                    >{content}</Markdown>
                </div>
            )
        } else{
            return (
                <ReactCodeMirror
                    {...this.props}

                    url={node.getPath()}
                    content={content}
                    options={{lineNumbers: lineNumbers, lineWrapping: lineWrapping}}
                    error={error}

                    onLoad={(codemirror) => tabModify({id, codemirror})}
                    onChange={content => tabModify({id, content})}
                    onCursorChange={cursor => tabModify({id, cursor})}
                />
            )

        }
    }
}

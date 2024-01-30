/*
 * Copyright 2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import PathUtils from 'pydio/util/path'
import Markdown from "react-markdown";
import RemarkGFM from "remark-gfm";

import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark, a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {muiThemeable} from 'material-ui/styles'

const biggerCss = (ext) => `
.mimefont-container.with-editor-badge.editor_mime_`+ext+` {
    height: 300px !important;
}
`
const extsToSyntax = {
    html: 'htmlbars',
    htm: 'htmlbars',
    js: 'javascript',
    phtml: 'php-template',
    py: 'python','c#':'csharp',
    jsp:'java',
    pl:'perl',
    md:'markdown'
}


class MdBadge extends Component{

    constructor(props, context){
        super(props, context);
        const {node} = props;
        this.state=  {};
        this._observer = (n)=>{
            if(this.state.eTag && n.getMetadata().get('etag') !== this.state.eTag) {
                this.load();
            }
        }
        node.observe('node_replaced', this._observer)
        this.load()
    }

    componentWillUnmount() {
        const {node} = this.props;
        node.stopObserving('node_replaced', this._observer)
    }

    load(){
        const {node, pydio} = this.props;
        console.log(node);
        if(node.getMetadata().has('bytesize')) {
            const bs = parseInt(node.getMetadata().get('bytesize'))
            const conf = pydio.getPluginConfigs('editor.codemirror').get('TEXTUAL_PREVIEW_SIZE_LIMIT')
            if(bs && conf && bs > conf) {
                this.setState({content: null, eTag: node.getMetadata().get('etag')})
                return
            }
        }
        pydio.ApiClient.getPlainContent(node, (content) => {
            this.setState({content, eTag: node.getMetadata().get('etag')})
        })
    }

    render(){

        const {pydio, node, mimeFontStyle, muiTheme} = this.props;
        const {content} = this.state;
        const ext = PathUtils.getFileExtension(node.getPath())
        if(content) {
            let component
            const lang = extsToSyntax[ext] || ext
            if(ext !== 'md' && SyntaxHighlighter.supportedLanguages.indexOf(lang)>=0) {
                component = (
                    <SyntaxHighlighter wrapLongLines={false} language={lang} style={muiTheme.darkMode?a11yDark:a11yLight}>
                        {content}
                    </SyntaxHighlighter>
                )
            } else if (ext === 'md') {
                component = (
                    <Markdown className={"mdviewer mdbadge"} style={{padding: '10px 20px'}} remarkPlugins={[RemarkGFM]}>{content}</Markdown>
                )
            } else {
                component = <pre className={"mdviewer mdbadge"} style={{padding: '10px 20px'}}>{content}</pre>
            }

            return (
                <div style={{width:'100%', backgroundColor:'var(--md-sys-color-surface)', fontSize: 'initial', lineHeight:'initial', textAlign:'initial', overflowY: 'auto', zoom: 0.8}}>
                    {component}
                    <style type={"text/css"} dangerouslySetInnerHTML={{__html:biggerCss(ext)}}/>
                </div>
            )
        } else {
            const ee = pydio.Registry.getFilesExtensions()
            const ic = ee.has(ext) ? ee.get(ext).fontIcon : 'file'
            return <div className={"mimefont mdi-" +ic} style={mimeFontStyle}/>;
        }

    }

}

MdBadge = muiThemeable()(MdBadge)
export {MdBadge as default}
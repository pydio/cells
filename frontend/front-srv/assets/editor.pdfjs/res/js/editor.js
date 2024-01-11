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

import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = 'plug/editor.pdfjs/pdfjs-2.12.313-dist/build/pdf.worker.js';
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Document, Page } from 'react-pdf';

const { EditorActions, withSelection } = Pydio.requireLib('hoc');

class InlineViewer extends React.Component {

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return nextProps.pdfUrl !== this.props.pdfUrl || nextProps.pageNumber !== this.props.pageNumber || nextProps.width !== this.props.width;
    }

    render() {
        const {pdfUrl, pageNumber, onNumPages, width=250, onKnownHeight} = this.props;

        const infoBlock = (msg) => {
            return <div className={'inline-pdf-info-block'} style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                fontSize: 13,
                fontWeight:500,
                color:'rgba(19, 78, 108, 0.4)'
            }}>{msg}</div>
        }

        return(
            <Document
                file={{url:pdfUrl}}
                onLoadError={(e)=>console.error(e)}
                onLoadSuccess={({numPages}) => onNumPages(numPages)}
                loading={infoBlock('Loading document...')}
                noData={infoBlock('No data loaded!')}
                error={infoBlock('Failed loading page')}
            >
                <Page
                    pageNumber={pageNumber}
                    width={width}
                    loading={infoBlock('Loading page...')}
                    onLoadSuccess={(page)=>onKnownHeight(Math.floor(page.height))}
                />
            </Document>
        );

    }
}

class Viewer extends Component {
    componentDidMount() {
        this.loadNode(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.node !== this.props.node) {
            this.loadNode(nextProps)
        }
    }

    loadNode(props) {
        const {node, pydio} = props;

        let bucketParams = null;
        if (node.getMetadata().get('PDFPreview')) {
            bucketParams = {
                Bucket: 'io',
                Key:'pydio-thumbstore/' + node.getMetadata().get('PDFPreview')
            }
        }
        const distViewerPath = 'plug/editor.pdfjs/pdfjs-2.12.313-dist/web'
        const viewerPage = pydio.getPluginConfigs("editor.pdfjs").get('PDF_JS_DISABLE_SCRIPTING') ? "viewer_noscript.html":"viewer.html"
        PydioApi.getClient().buildPresignedGetUrl(node, null, "", bucketParams).then(pdfUrl => {
            this.setState({
                pdfUrl: pdfUrl,
                crtPage: 1,
                lastKnownHeight:150,
                url: `${distViewerPath}/${viewerPage}?file=${encodeURIComponent(pdfUrl)}`
            })
        })

    }

    makeCss(lastKnownHeight, currentPin){
        if(currentPin) {
            return `
            .mimefont-container.with-editor-badge.editor_mime_pdf{
                overflow-y:auto;
            }`;
        }
        return `
        #info_panel .mimefont-container.with-editor-badge{
            position:relative;
            min-height: ${lastKnownHeight}px; 
            height:auto !important;
            max-height:320px;
        }
        #info_panel .inline-pdf-info-block{
            min-height:${lastKnownHeight}px;
        }`
    }

    render() {
        const {loadThumbnail, containerWidth, currentPin} = this.props;
        const {url, pdfUrl, crtPage = 1, numPages, showPaginator, lastKnownHeight} = this.state || {}
        let mw = 250;
        if(containerWidth > 300) {
            // Assume a pseudo letter format
            mw = Math.round(containerWidth * 21 / 29.7);
        }
        const margin = `0 calc(50% - ${Math.round(mw/2)}px)`

        if (!url) {
            return null
        }
        if(loadThumbnail) {
            let paginator;
            if(numPages > 1 && showPaginator) {
                paginator = (
                    <div style={{position:'absolute', bottom: 10, right: 10, backgroundColor:'white',display:'flex', cursor:'pointer', fontSize: 24, boxShadow: 'rgba(0, 0, 0, .2) 0px 0px 12px',borderRadius: 40}}>
                        <div className={"mdi mdi-chevron-left"} style={{opacity:crtPage === 1 ? 0.5:1}} onClick={()=>{this.setState({crtPage: Math.max(crtPage-1, 1)})}}/>
                        <div className={"mdi mdi-chevron-right"} style={{opacity:crtPage === numPages ? 0.5:1}} onClick={()=>{this.setState({crtPage: Math.min(crtPage+1, numPages)})}}/>
                    </div>
                );
            }
            return (
                <div
                    style={{flex: 1, width:'100%', maxWidth: mw, height: "100%", border: 0, margin, position: 'relative'}}
                    onMouseEnter={()=>{this.setState({showPaginator:true})}}
                    onMouseLeave={()=>{this.setState({showPaginator:false})}}
                >
                    <InlineViewer
                        width={mw}
                        pdfUrl={pdfUrl}
                        pageNumber={crtPage}
                        onNumPages={(n) => this.setState({numPages: n})}
                        onKnownHeight={(h) => this.setState({lastKnownHeight:h})}
                    />
                    {paginator}
                    <style type={"text/css"} dangerouslySetInnerHTML={{__html:this.makeCss(lastKnownHeight, currentPin)}}/>
                </div>
            );
        }

        return (
            <iframe {...this.props} style={{flex: 1, width: "100%", height: "100%", border: 0}} src={url} />
        );
    }
}

const editors = pydio.Registry.getActiveExtensionByType("editor")
const conf = editors.filter(({id}) => id === 'editor.pdfjs')[0]

const getSelectionFilter = (node) => conf.mimes.indexOf(node.getAjxpMime()) > -1

const getSelection = (node) => new Promise((resolve, reject) => {
    let selection = [];

    node.getParent().getChildren().forEach((child) => selection.push(child));
    selection = selection.filter(getSelectionFilter).sort((a,b)=>{
        return a.getLabel().localeCompare(b.getLabel(), undefined, {numeric:true})
    });

    resolve({
        selection,
        currentIndex: selection.reduce((currentIndex, current, index) => current === node && index || currentIndex, 0)
    })
})

export const Panel = Viewer

@withSelection(getSelection)
@connect(null, EditorActions)
export class Editor extends React.Component {
    componentWillReceiveProps(nextProps) {
        const {editorModify} = this.props

        if (nextProps.isActive) {
            editorModify({fixedToolbar: true})
        }
    }

    render() {
        return <Viewer {...this.props} />
    }
}

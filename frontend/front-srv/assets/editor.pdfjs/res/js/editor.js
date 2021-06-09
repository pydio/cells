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
pdfjs.GlobalWorkerOptions.workerSrc = 'plug/editor.pdfjs/pdfjs/build/min/pdf.worker.min.js';
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import DOMUtils from 'pydio/util/dom'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Document, Page } from 'react-pdf';

const { EditorActions } = Pydio.requireLib('hoc');

class InlineViewer extends React.Component {

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return nextProps.pdfUrl !== this.props.pdfUrl || nextProps.pageNumber !== this.props.pageNumber;
    }

    render() {
        const {pdfUrl, pageNumber, onNumPages, onKnownHeight} = this.props;

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
                    width={250}
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
        const {pydio, node, loadThumbnail} = props;

        let url;
        let base = DOMUtils.getUrlFromBase();

        if (base) {
            url = base;
            if (!url.startsWith('http') && !url.startsWith('https')) {
                if (!window.location.origin) {
                    // Fix for IE when Pydio is inside an iFrame
                    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
                }
                url = document.location.origin + url;
            }
        } else {
            // Get the URL for current workspace path.
            url = document.location.href.split('#').shift().split('?').shift();
            if(url[(url.length-1)] === '/'){
                url = url.substr(0, url.length-1);
            }else if(url.lastIndexOf('/') > -1){
                url = url.substr(0, url.lastIndexOf('/'));
            }
        }
        let viewerFile = 'viewer.html';
        if(loadThumbnail){
            viewerFile = 'viewer-thumb.html';
        } else if(pydio.Parameters.has('MINISITE')){
            viewerFile = 'viewer-minisite.html';
        }

        let bucketParams = null;
        if (node.getMetadata().get('PDFPreview')) {
            bucketParams = {
                Bucket: 'io',
                Key:'pydio-thumbstore/' + node.getMetadata().get('PDFPreview')
            }
        }
        PydioApi.getClient().buildPresignedGetUrl(node, null, "", bucketParams).then(pdfUrl => {
            this.setState({
                pdfUrl: pdfUrl,
                crtPage: 1,
                lastKnownHeight:150,
                url: 'plug/editor.pdfjs/pdfjs/web/' + viewerFile + '?file=' + encodeURIComponent(pdfUrl)
            })
        })

    }

    makeCss(lastKnownHeight){
        return `
        #info_panel .mimefont-container.with-editor-badge{
            position:relative;
            min-height: ${lastKnownHeight}px; 
            height:auto !important;
            max-height:320px
        }
        #info_panel .inline-pdf-info-block{
            min-height:${lastKnownHeight}px;
        }`
    }

    render() {
        const {loadThumbnail} = this.props;
        const {url, pdfUrl, crtPage = 1, numPages, showPaginator, lastKnownHeight} = this.state || {}

        if (!url) {
            return null
        }
        if(loadThumbnail) {
            let paginator;
            if(numPages > 1 && showPaginator) {
                paginator = (
                    <div style={{position:'absolute', bottom: 10, right: 10, backgroundColor:'white',display:'flex', cursor:'pointer', fontSize: 24, boxShadow: 'rgba(0, 0, 0, .2) 0px 0px 12px',borderRadius: 40}}>
                        <div className={"mdi mdi-chevron-left"} style={{opacity:crtPage === 1 ? .5:1}} onClick={()=>{this.setState({crtPage: Math.max(crtPage-1, 1)})}}/>
                        <div className={"mdi mdi-chevron-right"} style={{opacity:crtPage === numPages ? .5:1}} onClick={()=>{this.setState({crtPage: Math.min(crtPage+1, numPages)})}}/>
                    </div>
                );
            }
            return (
                <div
                    style={{flex: 1, width: "100%", height: "100%", border: 0}}
                    onMouseEnter={()=>{this.setState({showPaginator:true})}}
                    onMouseLeave={()=>{this.setState({showPaginator:false})}}
                >
                    <InlineViewer
                        pdfUrl={pdfUrl}
                        pageNumber={crtPage}
                        onNumPages={(n) => this.setState({numPages: n})}
                        onKnownHeight={(h) => this.setState({lastKnownHeight:h})}
                    />
                    {paginator}
                    <style type={"text/css"} dangerouslySetInnerHTML={{__html:this.makeCss(lastKnownHeight)}}/>
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

const {withSelection} = PydioHOCs;

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

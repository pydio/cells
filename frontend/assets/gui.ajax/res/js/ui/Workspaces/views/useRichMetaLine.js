import Pydio from 'pydio'
import React, {useCallback} from "react";
import PathUtils from 'pydio/util/path'

import OverlayIcon from "./OverlayIcon";
const {moment, SingleJobProgress} = Pydio.requireLib('boot');

const useRichMetaLine = ({pydio, columns, searchResults=false, searchScope='all'}) => {

    return useCallback((node) => {

        let metaData = node.getMetadata();
        let pieces = [];
        const standardPieces = [];
        const otherPieces = [];

        if (metaData.has('pending_operation')){
            if (metaData.has('pending_operation_uuid')) {
                return (
                    <SingleJobProgress
                        jobID={metaData.get('pending_operation_uuid')}
                        style={{display:'flex', flexDirection:'row-reverse', alignItems:'center'}}
                        progressStyle={{width: 60, paddingRight: 10}}
                        labelStyle={{flex: 1}}
                    />
                );
            } else {
                return <span style={{fontStyle:'italic', color:'rgba(0,0,0,.33)'}}>{metaData.get('pending_operation')}</span>
            }
        } else if(metaData.has('local:entryRenderSecondLine')){
            return metaData.get('local:entryRenderSecondLine')();
        } else if(metaData.has('local:entryDescription')){
            return <span className={"metadata_chunk metadata_chunk_description"}>{metaData.get('local:entryDescription')}</span>
        }

        if(searchResults) {
            let linkString, repoLabel;
            if(node.getMetadata().has("repository_display")) {
                let display = node.getMetadata().get("repository_display")
                if (display === '{{RefLabel}}') {
                    display = pydio.getContextHolder().getRootNode().getLabel();
                }
                repoLabel = '[' + display + ']'
            }
            if(node.isLeaf()) {
                linkString = PathUtils.getDirname(node.getPath())
            } else {
                linkString = node.getPath()
            }
            if(linkString && linkString.charAt(0) === '/') {
                linkString = linkString.substr(1);
            }
            if(searchScope === 'all' && linkString) {
                linkString = repoLabel + ' ' + linkString;
            } else if (!linkString) {
                linkString = repoLabel;
            }
            pieces.push(
                <span
                    className="metadata_chunk metadata_chunk_description metadata_chunk_clickable"
                    key={"result_path"}
                    style={{marginRight: 5, cursor:'pointer'}}
                    onClick={(e)=>{
                        e.stopPropagation();
                        pydio.goTo(node)
                    }}
                >{linkString}</span>,
                <span>&bull;&nbsp;</span>
            )
        }

        if(metaData.has('ajxp_modiftime')) {
            let mDate = moment(parseFloat(metaData.get('ajxp_modiftime'))*1000);
            let dateString = mDate.calendar();
            if(dateString.indexOf('/') > -1) {
                dateString = mDate.fromNow();
            }
            const title = PathUtils.formatModifDate(mDate.toDate());
            pieces.push(<span key="time_description" title={title} className="metadata_chunk metadata_chunk_description">{dateString}</span>);
        }
        if(metaData.has('etag') && metaData.get('etag') === 'temporary' && node.isLeaf()) {
            // Display a sign for temporary files
            pieces.push(<span style={{marginLeft: 5, marginRight: 5}} key="etag_temp_description" title={Pydio.getMessages()['ajax_gui.file.temporary-etag.tooltip']} className="metadata_chunk metadata_chunk_description"><span className={"mdi mdi-alert-outline"} style={{color:'#e57373'}}/> {Pydio.getMessages()['ajax_gui.file.temporary-etag.flag']}</span>);
        }

        let first = false;
        Object.keys(columns).forEach((s) => {
            let columnDef = columns[s];
            let label;
            let standard = false;
            if(s === 'ajxp_label' || s === 'text' || s === 'ajxp_modiftime' || columnDef.inlineHide){
                return
            } else if(s === "ajxp_dirname" && metaData.get("filename")){
                let dirName = PathUtils.getDirname(metaData.get("filename"));
                label =  dirName?dirName:"/" ;
                standard = true;
            } else if (s === "bytesize") {
                if(!metaData.has(s) || metaData.get(s) === "-"){
                    return;
                }
                label = PathUtils.roundFileSize(parseInt(metaData.get(s)));
                standard = true;
            }else if(columnDef.renderComponent){
                columnDef['name'] = s;
                label = columnDef.renderComponent(node, columnDef);
                if(label === null){
                    return;
                }
            }else{
                if(s === 'mimestring' || s === 'readable_dimension'){
                    standard = true;
                }
                let metaValue = metaData.get(s) || "";
                if(!metaValue) {
                    return;
                }
                if(metaValue.length && metaValue.length > 26) {
                    metaValue = <React.Fragment>{metaValue.substr(0, 26)}&hellip;</React.Fragment>;
                }
                label = metaValue;
            }
            let sep;
            if(!first){
                sep = <span className="mdi mdi-chevron-right"></span>;
            }
            let cellClass = 'metadata_chunk metadata_chunk_'+(standard ?'standard':'other')+' metadata_chunk_' + s;
            if(columnDef.renderComponent && columnDef.renderBlock){
                cellClass += ' metadata_chunk_block'
            }
            const cell = <span key={s} className={cellClass}>{sep}<span className="text_label">{label}</span></span>;
            standard ? standardPieces.push(cell) : otherPieces.push(cell);
        });
        pieces.push(...otherPieces);
        if (pydio.Registry.hasPluginOfType("meta", "user")) {
            pieces.push(
                <span className={"metadata_chunk metadata_chunk_standard"}>
                <OverlayIcon
                    pydio={pydio}
                    node={node}
                    overlay={'mdi mdi-tag-outline'}
                    style={{height:18, width: 18, margin:0, padding: '1px 0'}}
                    disableActions={!!searchResults}
                    tooltipPosition={'bottom-right'}
                    popoverDirection={'left'}
                />
            </span>
            );
        }
        pieces.push(...standardPieces);
        return pieces;

    }, [searchResults, searchScope, pydio, columns]);


}

export {useRichMetaLine}
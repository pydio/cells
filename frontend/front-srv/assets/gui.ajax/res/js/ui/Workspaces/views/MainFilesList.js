import React from 'react';

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
import PathUtils from 'pydio/util/path'
import XMLUtils from 'pydio/util/xml'
import ResourcesManager from 'pydio/http/resources-manager'
import Action from 'pydio/model/action'
import ReactDOM from 'react-dom'

import FilePreview from './FilePreview'
import {IconButton, Divider} from 'material-ui'
import CellsMessageToolbar from './CellsMessageToolbar'
const {SimpleList, Masonry} = Pydio.requireLib('components');
const {moment, SingleJobProgress} = Pydio.requireLib('boot');
import OverlayIcon from './OverlayIcon'
import {debounce} from 'lodash'
import {muiThemeable} from 'material-ui/styles'

class ComponentConfigsParser {

    constructor(renderLabel) {
        this.renderLabel = renderLabel;
    }

    getDefaultListColumns() {
        return {
            text:{
                label:'File Name',
                message:'1',
                width: '50%',
                renderCell:this.renderLabel,
                sortType:'file-natural',
                remoteSortAttribute:'ajxp_label'
            },
            bytesize:{
                label:'File Size',
                message:'2',
                sortType:'number',
                sortAttribute:'bytesize',
                remoteSortAttribute:'filesize'
            },
            mimestring:{
                label:'File Type',
                message:'3',
                sortType:'string'
            },
            ajxp_modiftime:{
                label:'Mofidied on',
                message:'4',
                sortType:'number'
            }
        };
    }

    loadConfigs() {

        let columnsNodes = XMLUtils.XPathSelectNodes(Pydio.getInstance().getXmlRegistry(), 'client_configs/component_config[@component="FilesList"]/columns/column|client_configs/component_config[@component="FilesList"]/columns/additional_column');
        let columns = {};
        let messages = Pydio.getMessages();
        const proms = [];
        columnsNodes.forEach((colNode) => {
            let name = colNode.getAttribute('attributeName');
            let sortType = colNode.getAttribute('sortType');
            const sorts = {'String':'string', 'StringDirFile':'string', 'MyDate':'number', 'CellSorterValue': 'number', 'Number': 'number'};
            sortType = sorts[sortType] || 'string';
            if(name === 'bytesize') {
                sortType = 'number';
            }
            columns[name] = {
                message : colNode.getAttribute('messageId'),
                label   : colNode.getAttribute('messageString') ? colNode.getAttribute('messageString') : messages[colNode.getAttribute('messageId')],
                sortType: sortType,
                inlineHide: colNode.getAttribute('defaultVisibilty') === "false"
            };
            if(name === 'ajxp_label') {
                columns[name].renderCell = this.renderLabel;
            }
        });
        proms.push(ResourcesManager.loadClass('ReactMeta').then(c => {
            const {MetaClient, Renderer} = c;
            return MetaClient.getInstance().loadConfigs().then(metas => {
                metas.forEach((v,k)=>{
                    columns[k] = {
                        label:      v.label,
                        inlineHide: !v.visible,
                        ...Renderer.typeColumnRenderer(v.type),
                        nsData:     v.data
                    }
                })
            })
        }))
        return Promise.all(proms).then(()=> {
            return columns || this.getDefaultListColumns();
        })
    }

}

class MainFilesList extends React.Component {
    static propTypes = {
        pydio: PropTypes.instanceOf(Pydio),
        horizontalRibbon: PropTypes.bool
    };

    constructor(props, context) {
        super(props, context);
        let configParser = new ComponentConfigsParser(this.tableEntryRenderCell.bind(this));
        configParser.loadConfigs('FilesList').then((columns) => {
            this.setState({columns});
        })
        const dMode = this.getPrefValue('FilesListDisplayMode', this.props.displayMode || 'list');
        let tSize = 200;
        if(dMode === 'grid-320') {
            tSize = 320;
        } else if(dMode === 'grid-80') {
            tSize = 80;
        }

        const {dataModel} = this.props;

        this.state = {
            contextNode : dataModel.getContextNode(),
            displayMode : dMode,
            showExtensions: this.getPrefValue('FilesListShowExtensions', false),
            pinBookmarks: this.getPrefValue('FilesListPinBookmarks', false),
            thumbNearest: tSize,
            thumbSize   : tSize,
            elementsPerLine: 5,
            columns     : configParser.getDefaultListColumns(),
            parentIsScrolling: props.parentIsScrolling,
            repositoryId: props.pydio.repositoryId
        };
    }

    getPrefValue(prefName, defaultValue){
        const {pydio} = this.props;
        if(!pydio.user){
            return defaultValue;
        }
        const slug = pydio.user.getActiveRepositoryObject().getSlug();
        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : {};
        if(guiPrefs[prefName] && guiPrefs[prefName][slug] !== undefined){
            return guiPrefs[prefName][slug];
        }
        return defaultValue;
    }

    /**
     * Save displayMode to user prefs
     * @param prefName
     * @param value
     * @return {string}
     */
    setPrefValue(prefName, value){
        const {pydio} = this.props;
        if(!pydio.user){
            return;
        }
        const slug = pydio.user.getActiveRepositoryObject().getSlug();
        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : {};
        const dPrefs = guiPrefs[prefName] || {};
        dPrefs[slug] = value;
        guiPrefs[prefName] = dPrefs;
        pydio.user.setPreference('gui_preferences', guiPrefs, true);
        pydio.user.savePreference('gui_preferences');
    }

    componentDidMount() {
        const {dataModel} = this.props;
        // Hook to the central datamodel
        this._contextObserver = function(){
            this.setState({contextNode: dataModel.getContextNode()});
        }.bind(this);
        dataModel.observe("context_changed", this._contextObserver);
        this.props.pydio.getController().updateGuiActions(this.getPydioActions());

        this.recomputeThumbnailsDimension();
        this._thumbObserver = debounce(this.recomputeThumbnailsDimension.bind(this), 500);
        if(window.addEventListener){
            window.addEventListener('resize', this._thumbObserver);
        }else{
            window.attachEvent('onresize', this._thumbObserver);
        }
        if(this.props.onDisplayModeChange && this.state && this.state.displayMode){
            this.props.onDisplayModeChange(this.state.displayMode);
        }
    }

    componentWillUnmount() {
        const {dataModel} = this.props;
        dataModel.stopObserving("context_changed", this._contextObserver);
        this.getPydioActions(true).map(function(key){
            this.props.pydio.getController().deleteFromGuiActions(key);
        }.bind(this));
        if(window.addEventListener){
            window.removeEventListener('resize', this._thumbObserver);
        }else{
            window.detachEvent('onresize', this._thumbObserver);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (!this.state
            || this.state.repositoryId !== nextProps.pydio.repositoryId
            || nextProps.dataModel !== this.props.dataModel
            || nextProps.searchLoading !== this.props.searchLoading
            || nextProps.searchResults !== this.props.searchResults
            || nextProps.searchScope !== this.props.searchScope
            || nextProps.listStyle !== this.props.listStyle
            || nextState !== this.state );
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.dataModel !== this.props.dataModel){
            this.props.dataModel.stopObserving("context_changed", this._contextObserver);
            nextProps.dataModel.observe("context_changed", this._contextObserver);
            this._contextObserver();
        }
        if(this.state && this.state.repositoryId !== this.props.pydio.repositoryId ){
            this.props.pydio.getController().updateGuiActions(this.getPydioActions());
            let configParser = new ComponentConfigsParser(this.tableEntryRenderCell.bind(this));
            configParser.loadConfigs('FilesList').then((columns) => {
                this.setState({columns});
            })
            const dMode = this.getPrefValue('FilesListDisplayMode', this.state && this.state.displayMode ? this.state.displayMode:'list');
            if(this.state.displayMode !== dMode && dMode.indexOf('grid-') === 0){
                let tSize = 200;
                if(dMode === 'grid-320') {
                    tSize = 320;
                } else if(dMode === 'grid-80') {
                    tSize = 80;
                }
                this.setState({
                    thumbNearest:tSize,
                    thumbSize: tSize
                });
            }
            this.setState({
                repositoryId: this.props.pydio.repositoryId,
                displayMode:dMode
            }, ()=>{
                if(this.props.onDisplayModeChange) {
                    this.props.onDisplayModeChange(dMode);
                }
            })
        }
    }

    resize(){
        this.recomputeThumbnailsDimension();
    }

    recomputeThumbnailsDimension(nearest){

        const {contextNode, displayMode, thumbNearest} = this.state;
        const {muiTheme} = this.props;
        if(displayMode.indexOf('grid') !== 0){
            return
        }

        const MAIN_CONTAINER_FULL_PADDING = 5;
        const THUMBNAIL_MARGIN = (muiTheme.userTheme === 'mui3' || displayMode ===  'grid-80') ? 4 : 8;
        let containerWidth;
        try{
            containerWidth = ReactDOM.findDOMNode(this.refs['list'].infinite.current).clientWidth - MAIN_CONTAINER_FULL_PADDING;
        }catch(e){
            containerWidth = 200;
        }

        if(!nearest || nearest instanceof Event){
            nearest = thumbNearest;
        }
        // Find nearest dim
        let blockNumber = Math.floor(containerWidth / nearest);
        let width = Math.floor(containerWidth / blockNumber) - THUMBNAIL_MARGIN * 2;
        if(this.props.horizontalRibbon){
            blockNumber = contextNode.getChildren().size;
            if(displayMode === 'grid-160') {
                width = 160;
            } else if(displayMode === 'grid-320') {
                width = 280;
            } else if(displayMode === 'grid-80') {
                width = 100;
            } else {
                width = 200;
            }
        }
        this.setState({
            elementsPerLine: blockNumber,
            thumbSize: width,
            thumbNearest:nearest
        });


    }

    computeLabel(node){
        const {showExtensions} = this.state;
        let label = node.getLabel();
        if(node.isLeaf() && label[0] !== "."){
            let ext = PathUtils.getFileExtension(label);
            if(ext){
                ext = '.' + ext;
                label = <span>{label.substring(0, label.length-ext.length)}<span className={"label-extension"} style={{opacity:0.33, display:showExtensions?null:'none'}}>{ext}</span></span>;
            }
        }
        return label;
    }

    tableEntryRenderCell(node){
        return (
            <span>
                <FilePreview rounded={true} loadThumbnail={false} node={node} style={{backgroundColor:'transparent'}}/>
                <span style={{display:'block',overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}} title={node.getLabel()}>{this.computeLabel(node)}</span>
            </span>
        );
    }

    entryRenderIcon(node, entryProps = {}){
        const {displayMode} = this.state;
        const lightBackground = displayMode.indexOf('grid') === 0 || displayMode === 'masonry'
        if(entryProps && entryProps.parent){
            return (
                <FilePreview
                    loadThumbnail={false}
                    node={node}
                    mimeClassName="mimefont mdi mdi-chevron-left"
                    onClick={()=>{this.entryHandleClicks(node, SimpleList.CLICK_TYPE_DOUBLE)}}
                    style={{cursor:'pointer'}}
                    lightBackground={lightBackground}
                />
            );
        }else{
            const hasThumbnail = !!node.getMetadata().get("thumbnails") || !!node.getMetadata().get('ImagePreview');
            const processing = !!node.getMetadata().get('Processing');
            const uploading = node.getMetadata().get('local:UploadStatus') === 'loading'
            const uploadprogress = node.getMetadata().get('local:UploadProgress');
            return (
                <FilePreview
                    loadThumbnail={!entryProps['parentIsScrolling'] && hasThumbnail && !processing}
                    node={node}
                    processing={processing}
                    lightBackground={lightBackground}
                    displayLarge={lightBackground}
                    mimeFontOverlay={displayMode === 'list'}
                    uploading={uploading}
                    uploadprogress={uploadprogress}
                />
            );
        }
    }

    entryRenderActions(node){
        let content = null;
        const {pydio, dataModel, searchResults} = this.props;
        const {displayMode} = this.state;
        const gridMode = displayMode.indexOf('grid-') === 0 || displayMode === 'masonry';
        const overlayClasses = node.getMetadata().get('overlay_class') || ''
        if(node.getMetadata().has('local:entryRenderActions')){
            return node.getMetadata().get('local:entryRenderActions')(node, this.props, this.state);
        }
        if(pydio.UI.MOBILE_EXTENSIONS){
            const ContextMenuModel = require('pydio/model/context-menu');
            return <IconButton iconClassName="mdi mdi-dots-vertical" style={{zIndex:0, padding: 10}} tooltip="Info" onClick={(event) => {
                pydio.observeOnce('actions_refreshed', ()=>{
                    ContextMenuModel.getInstance().openNodeAtPosition(node, event.clientX, event.clientY);
                });
                event.stopPropagation();
                dataModel.setSelectedNodes([node]);
                ContextMenuModel.getInstance().openNodeAtPosition(node, event.clientX, event.clientY);
            }}/>;
        }else if(overlayClasses || displayMode !== 'list'){
            let classes = overlayClasses.split(',').filter(c=>!!c);
            if(gridMode) {
                classes = classes.filter(c => c !== 'mdi mdi-star')
            }
            let elements = classes.map(function(c){
                return (
                    <OverlayIcon
                        node={node}
                        key={c}
                        overlay={c}
                        pydio={pydio}
                        disableActions={!!searchResults}
                        tooltipPosition={gridMode?'bottom-right':undefined}
                        popoverDirection={gridMode?'left':'right'}
                    />
                );
            });
            if(displayMode !== 'list' && displayMode !== 'masonry') {
                // Add meta button in thumbs mode
                elements.push(<OverlayIcon
                        pydio={pydio}
                        node={node}
                        overlay={'mdi mdi-tag-outline'}
                        disableActions={!!searchResults}
                        tooltipPosition={gridMode ? 'bottom-right':undefined}
                        popoverDirection={gridMode ? 'left':'right'}
                    />
                );
            }
            if(gridMode) {
                // Add toggleable bookmark button
                elements.unshift(
                    <OverlayIcon
                        pydio={pydio}
                        node={node}
                        overlay={'mdi mdi-star'+(overlayClasses.indexOf('mdi-star')>-1?'':'-outline')}
                        disableActions={!!searchResults}
                        tooltipPosition={'bottom-right'}
                        clickActions={true}
                    />
                );
            }
            let style;
            if(displayMode === 'detail') {
                style = {width:34 * elements.length}
            }
            content = <div className="overlay_icon_div" style={style}>{elements}</div>;
            if(displayMode.indexOf('grid-') === 0 && node.isLeaf() && node.getMetadata().get('ImagePreview') && node.getSvgSource()) {
                // Append font-icon for specific cases
                content = (
                    <React.Fragment>
                        {content}
                        <span style={{flex: 1}}/>
                        <div className={'mdi mdi-'+node.getSvgSource()+' mimefont mimefont-overlay'}/>
                    </React.Fragment>
                );
            }
        }
        return content;

    };

    entryHandleClicks(node, clickType, event){
        const {dataModel: dm, pydio} = this.props;
        const mobile = pydio.UI.MOBILE_EXTENSIONS || this.props.horizontalRibbon;
        if(dm.getContextNode().getParent() === node && clickType === SimpleList.CLICK_TYPE_SIMPLE){
            return;
        }
        if(!mobile && ( !clickType || clickType === SimpleList.CLICK_TYPE_SIMPLE )){
            const crtSelection = dm.getSelectedNodes();
            if(event && event.shiftKey && crtSelection.length && this.refs.list) {
                const newSelection = this.refs.list.computeSelectionFromCurrentPlusTargetNode(crtSelection, node);
                dm.setSelectedNodes(newSelection);
            } else if(event && (event.ctrlKey || event.metaKey) && crtSelection.length){
                if(crtSelection.indexOf(node) === -1){
                    dm.setSelectedNodes([...crtSelection, node]);
                } else {
                    const otherSelection = crtSelection.filter((obj) => {return obj!== node;})
                    dm.setSelectedNodes(otherSelection);
                }
            }else{
                dm.setSelectedNodes([node]);
            }
        }else if(mobile || clickType === SimpleList.CLICK_TYPE_DOUBLE){
            if (node.isBrowsable()) {
                //dm.requireContextChange(node);
                pydio.goTo(node);
            } else {
                dm.setSelectedNodes([node]);
                pydio.Controller.fireAction("open_with_unique");
            }
        }
    };

    entryRenderSecondLine(node){
        const {searchResults, searchScope, pydio} = this.props;
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
            if(node.getMetadata().get("repository_display")) {
                repoLabel = '[' + node.getMetadata().get("repository_display") + ']'
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
                <span>&bull; </span>
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
        const {columns} = this.state;
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
        const metaIc = (
            <OverlayIcon
                pydio={pydio}
                node={node}
                overlay={'mdi mdi-tag-outline'}
                style={{height:22, width: 22, margin:'0 2px', padding: '0 2px'}}
                disableActions={!!searchResults}
                className={"metadata_chunk metadata_chunk_standard"}
                tooltipPosition={'bottom-right'}
                popoverDirection={'left'}
            />
        );
        pieces.push(...otherPieces, metaIc, ...standardPieces);
        return pieces;

    };

    switchDisplayMode(displayMode){
        this.setState({displayMode: displayMode}, ()=>{
            let near = null;
            if(displayMode.indexOf('grid-') === 0) {
                near = parseInt(displayMode.split('-')[1]);
            }
            this.recomputeThumbnailsDimension(near);
            this.setPrefValue('FilesListDisplayMode', displayMode);
            if(this.props.onDisplayModeChange) {
                this.props.onDisplayModeChange(displayMode);
            }
            this.props.pydio.notify('actions_refreshed');
        });
    }

    buildDisplayModeItems(){
        const {displayMode} = this.state;
        const list = [
            {name:Pydio.getMessages()['ajax_gui.list.display-mode.list'],title:227,icon_class:'mdi mdi-view-list',value:'list',hasAccessKey:true,accessKey:'list_access_key'},
            {name:Pydio.getMessages()['ajax_gui.list.display-mode.details'],title:461,icon_class:'mdi mdi-view-headline',value:'detail',hasAccessKey:true,accessKey:'detail_access_key'},
            {name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs'],title:229,icon_class:'mdi mdi-view-grid',value:'grid-160',hasAccessKey:true,accessKey:'thumbs_access_key', highlight:(v)=>v.indexOf('grid-')===0}
        ];
        if(displayMode.indexOf('grid-') === 0) {
            list.push(
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-large'],
                    icon_class:'mdi mdi-arrow-up',
                    value:'grid-320'
                },
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-medium'],
                    icon_class:'mdi mdi-minus',
                    value:'grid-160'
                },
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-small'],
                    icon_class:'mdi mdi-arrow-down',
                    value:'grid-80'
                },
            )
        }
        list.push(
            {
                name:Pydio.getMessages()['ajax_gui.list.display-mode.masonry'],
                icon_class:'mdi mdi-view-dashboard',
                value:'masonry',
                highlight:(v)=>v.indexOf('masonry')===0
            },
        )
        if(displayMode.indexOf('masonry') === 0) {
            list.push(
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-large'],
                    icon_class:'mdi mdi-arrow-up',value:'masonry-440'
                },
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-medium'],
                    icon_class:'mdi mdi-minus',value:'masonry'
                },
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-small'],
                    icon_class:'mdi mdi-arrow-down',value:'masonry-100'
                }
            )
        }
        return list.map(item => {
            const i = {...item};
            const value = item.value;
            i.callback = () => {this.switchDisplayMode(i.value)};
            if(value === displayMode || (i.highlight && i.highlight(displayMode))){
                i.name = <span style={{fontWeight: 500}}>{i.name}</span>
            }
            return i;
        });
    }

    buildShowExtensionsItems(){
        const {showExtensions, pinBookmarks} = this.state;
        return [
            {name:Pydio.getMessages()['ajax_gui.list.extensions.show'], icon_class:showExtensions?'mdi mdi-toggle-switch':'mdi mdi-toggle-switch-off', callback:()=>{
                    this.setState({showExtensions:!showExtensions}, () => {
                        this.props.pydio.notify('actions_refreshed');
                        this.setPrefValue('FilesListShowExtensions', !showExtensions);
                    });
                }
            },
            {name:Pydio.getMessages()['ajax_gui.list.pin.bookmarks'], icon_class:pinBookmarks?'mdi mdi-toggle-switch':'mdi mdi-toggle-switch-off', callback:()=>{
                    this.setState({pinBookmarks:!pinBookmarks}, () => {
                        this.props.pydio.notify('actions_refreshed');
                        this.setPrefValue('FilesListPinBookmarks', !pinBookmarks);
                    });
                }
            }
        ]
    }

    getPydioActions(keysOnly = false){
        if(keysOnly){
            return ['switch_display_mode', 'toggle_show_extensions'];
        }
        const multiAction = new Action({
            name:'switch_display_mode',
            icon_class:'mdi mdi-view-list',
            text_id:150,
            title_id:151,
            text:MessageHash[150],
            title:MessageHash[151],
            hasAccessKey:false,
            subMenu:true,
            subMenuUpdateImage:true
        }, {
            selection:false,
            dir:true,
            actionBar:true,
            actionBarGroup:'display_toolbar',
            contextMenu:false,
            infoPanel:false
        }, {}, {}, {
            dynamicBuilder:this.buildDisplayModeItems.bind(this),
        });
        let buttons = new Map();
        buttons.set('switch_display_mode', multiAction);
        const extAction = new Action(
            {
                name:'toggle_show_extensions',
                icon_class:'mdi mdi-format-size',
                text_id:'ajax_gui.list.extensions.action',
                text:Pydio.getMessages()['ajax_gui.list.extensions.action'],
                subMenu:true,
                subMenuUpdateImage:true
            },
            {
                selection: false,
                dir: true,
                actionBar: true,
                actionBarGroup:'display_toolbar',
                contextMenu: false,
                infoPanel: false
            }, {}, {},
            {
                dynamicBuilder: this.buildShowExtensionsItems.bind(this)
            }
        );
        buttons.set('toggle_show_extensions', extAction);
        return buttons;
    }

    render() {

        const {pydio, dataModel, style, onScroll, gridBackground} = this.props;
        const {contextNode, displayMode, columns, thumbSize, pinBookmarks} = this.state;
        let tableKeys, sortKeys, elementStyle, className = 'files-list layout-fill main-files-list';
        let elementHeight, entryRenderSecondLine, near, elementsPerLine = 1;
        let dMode = displayMode;
        if(dMode.indexOf('grid-') === 0){
            near = parseInt(dMode.split('-')[1]);
            dMode = 'grid';
        }
        let infiniteSliceCount = 50;
        let additionalStyle = {}

        if(dMode === 'detail'){

            elementHeight = SimpleList.HEIGHT_ONE_LINE;
            tableKeys = columns;
            additionalStyle = {marginLeft: 10 + (style.marginLeft||0)}

        } else if(dMode === 'grid'){

            sortKeys = columns;
            className += ' material-list-grid grid-size-' + near;
            const labelHeight = near === 80 ? 16 : 36
            elementsPerLine = this.state.elementsPerLine
            if (elementsPerLine > 0) {
                elementHeight =  Math.ceil((thumbSize + labelHeight) / elementsPerLine);
            }
            if(!elementHeight || this.props.horizontalRibbon){
                elementHeight = 1;
            }
            elementStyle={
                width: thumbSize,
                height: thumbSize + labelHeight
            };
            if(this.props.horizontalRibbon){
                className += ' horizontal-ribbon';
            }
            // Todo: compute a more real number of elements visible per page.
            if(near === 320) {
                infiniteSliceCount = 25;
            } else if(near === 160) {
                infiniteSliceCount = 80;
            } else if(near === 80) {
                infiniteSliceCount = 200;
            }

        } else if(dMode === 'list'){

            sortKeys = columns;
            elementHeight = SimpleList.HEIGHT_TWO_LINES;
            entryRenderSecondLine = this.entryRenderSecondLine.bind(this);

        }

        const messages = pydio.MessageHash;
        const canUpload = (pydio.Controller.getActionByName('upload') && !contextNode.getMetadata().has('node_readonly'));
        const secondary = messages[canUpload ? '565' : '566'];
        const iconClassName = canUpload ? 'mdi mdi-cloud-upload' : 'mdi mdi-folder-outline';
        let emptyStateProps = {
            style           : {backgroundColor: 'transparent'},
            iconClassName   : iconClassName,
            primaryTextId   : messages['562'],
            secondaryTextId : secondary,
        };
        if(contextNode.isRoot()){
            const isCell = (pydio.user && pydio.user.activeRepository) ? pydio.user.getRepositoriesList().get(pydio.user.activeRepository).getOwner() : false;
            const recyclePath = contextNode.getMetadata().get('repo_has_recycle');
            emptyStateProps = {
                style           : {backgroundColor: 'transparent'},
                iconClassName   : iconClassName,
                primaryTextId   : isCell? messages['631'] : messages['563'],
                secondaryTextId : secondary,
            };
            if(recyclePath){
                emptyStateProps = {
                    ...emptyStateProps,
                    checkEmptyState: (node) => { return (node.isLoaded() && node.getChildren().size === 1 && node.getChildren().get(recyclePath) )} ,
                    actionLabelId: messages['567'],
                    actionIconClassName: 'mdi mdi-delete',
                    actionCallback: (e) => {
                        pydio.goTo(recyclePath);
                    }
                };
            }
        }else{
            const recycle = dataModel.getRootNode().getMetadata().get('repo_has_recycle');
            if(contextNode.getPath() === recycle){
                emptyStateProps = {
                    ...emptyStateProps,
                    iconClassName   : 'mdi mdi-delete-empty',
                    primaryTextId   : messages['564'],
                    secondaryTextId : null,
                }
            }
        }

        if(contextNode.getMetadata().has('local:custom-list-classes')) {
            className += ' ' + contextNode.getMetadata().get('local:custom-list-classes').join(' ');
        }

        const {searchResults, searchScope, searchLoading} = this.props;
        let groupProps = {};
        if(searchResults) {
            groupProps = {
                skipParentNavigation: true,
            };
            if(searchScope === 'all') {
                groupProps = {
                    ...groupProps,
                    defaultGroupBy:"repository_id",
                    groupByLabel:'repository_display',
                }
            }
            emptyStateProps = {
                primaryTextId:searchLoading?'searchengine.searching':478,
                    style:{
                    backgroundColor:'transparent'
                }
            }
        } else if(pinBookmarks) {
            groupProps = {
                groupSkipUnique: true,
                defaultGroupBy: "bookmark",
                groupByValueFunc:(value) => value === "true" ? -1 : 1,
                renderGroupLabels:(groupBy, value) => {
                    if(value === -1) {
                        return <span><span className={"mdi mdi-pin"}/> {pydio.MessageHash[147]}</span>
                    } else {
                        return <span><span className={"mdi mdi-folder-multiple-outline"}/> {pydio.MessageHash['ajax_gui.pinned-bookmarks.other']}</span>
                    }
                }
            }
        }

        if(dMode.indexOf('masonry')=== 0) {
            let cWidth = 220
            if(dMode.indexOf('masonry-')=== 0){
                cWidth = parseInt(dMode.replace('masonry-', ''))
            }
            return (
                <React.Fragment>
                    <Masonry
                        className={"masonry-grid"}
                        dataModel={dataModel}
                        entryProps={{
                            handleClicks:this.entryHandleClicks.bind(this),
                            renderIcon:this.entryRenderIcon.bind(this),
                            renderActions: this.entryRenderActions.bind(this)
                        }}
                        emptyStateProps={emptyStateProps}
                        containerStyle={style}
                        columnWidth={cWidth}
                        onScroll={onScroll}
                    />
                </React.Fragment>
            )
        }

        return (
            <SimpleList
                ref="list"
                tableKeys={tableKeys}
                sortKeys={sortKeys}
                node={contextNode}
                dataModel={dataModel}
                observeNodeReload={true}
                className={className}
                actionBarGroups={["change_main"]}
                infiniteSliceCount={infiniteSliceCount}
                skipInternalDataModel={true}
                style={{...style, ...additionalStyle}}
                displayMode={dMode}
                usePlaceHolder={true}
                onScroll={onScroll}
                elementsPerLine={elementsPerLine}
                elementHeight={elementHeight}
                elementStyle={elementStyle}
                passScrollingStateToChildren={true}
                entryRenderIcon={this.entryRenderIcon.bind(this)}
                entryRenderParentIcon={this.entryRenderIcon.bind(this)}
                entryRenderFirstLine={(node)=>this.computeLabel(node)}
                entryRenderSecondLine={entryRenderSecondLine}
                entryRenderActions={this.entryRenderActions.bind(this)}
                entryHandleClicks={this.entryHandleClicks.bind(this)}
                entriesProps={dMode === 'grid' ? {selectedAsBorder: true, noHover: true}:{}}
                horizontalRibbon={this.props.horizontalRibbon}
                emptyStateProps={emptyStateProps}
                defaultSortingInfo={{sortType:'file-natural',attribute:'',direction:'asc'}}
                hideToolbar={true}
                customToolbar={<CellsMessageToolbar pydio={pydio}/>}
                {...groupProps}
            />
        );
    }
}

MainFilesList = muiThemeable()(MainFilesList)
export {MainFilesList as default}

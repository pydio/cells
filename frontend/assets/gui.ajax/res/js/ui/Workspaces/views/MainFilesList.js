/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React from 'react';

import PropTypes from 'prop-types';

import Pydio from 'pydio'
import PathUtils from 'pydio/util/path'
import ResourcesManager from 'pydio/http/resources-manager'
import Action from 'pydio/model/action'
import ReactDOM from 'react-dom'

import FilePreview from './FilePreview'
import {IconButton} from 'material-ui'
import CellsMessageToolbar from './CellsMessageToolbar'
const {SimpleList, Masonry} = Pydio.requireLib('components');
const {moment, SingleJobProgress} = Pydio.requireLib('boot');
const {ListColumnsParser} = Pydio.requireLib('hoc');
import OverlayIcon from './OverlayIcon'
import {debounce} from 'lodash'
import {muiThemeable} from 'material-ui/styles'

class MainFilesList extends React.Component {
    static propTypes = {
        pydio: PropTypes.instanceOf(Pydio),
        horizontalRibbon: PropTypes.bool,
        fixedDisplayMode: PropTypes.string,
        fixedColumns: PropTypes.object,
    };

    constructor(props, context) {
        super(props, context);
        const {dataModel, fixedDisplayMode, fixedColumns} = this.props;
        const configParser = new ListColumnsParser(this.tableEntryRenderCell.bind(this));
        if (!fixedColumns) {
            configParser.loadConfigs('FilesList').then((columns) => {
                this.setState({columns});
            })
        }
        let dMode = this.getPrefValue('FilesList.DisplayMode', this.props.displayMode || 'list');
        let tSize = 200;
        if(dMode === 'grid-320') {
            tSize = 320;
        } else if(dMode === 'grid-80') {
            tSize = 80;

        }
        if(fixedDisplayMode) {
            dMode = fixedDisplayMode;
        }

        this.state = {
            contextNode : dataModel.getContextNode(),
            displayMode : dMode,
            showExtensions: this.getPrefValue('FilesList.ShowExtensions', false),
            pinBookmarks: this.getPrefValue('FilesList.PinBookmarks', false),
            thumbNearest: tSize,
            thumbSize   : tSize,
            elementsPerLine: 5,
            columns     : fixedColumns || configParser.getDefaultListColumns(props.pydio),
            parentIsScrolling: props.parentIsScrolling,
            repositoryId: props.pydio.repositoryId
        };
    }

    getPrefValue(prefName, defaultValue){
        const {pydio} = this.props;
        if(!pydio.user){
            return defaultValue;
        }
        return pydio.user.getLayoutPreference('FSTemplate.' + prefName, defaultValue)
    }

    /**
     * Save displayMode to user prefs
     * @param prefName
     * @param value
     */
    setPrefValue(prefName, value){
        const {pydio} = this.props;
        pydio.user && pydio.user.setLayoutPreference('FSTemplate.' + prefName, value)
    }

    componentDidMount() {
        const {dataModel, pydio, onDisplayModeChange, fixedDisplayMode} = this.props;
        // Hook to the central datamodel
        this._contextObserver = () =>{
            this.setState({contextNode: dataModel.getContextNode()});
        };
        dataModel.observe("context_changed", this._contextObserver);
        pydio.getController().updateGuiActions(this.getPydioActions());

        this._prefObserver = () => {
            this.setState({
                showExtensions: this.getPrefValue('FilesList.ShowExtensions', false),
                pinBookmarks: this.getPrefValue('FilesList.PinBookmarks', false)
            })
            if(!fixedDisplayMode) {
                const displayMode = this.getPrefValue('FilesList.DisplayMode', 'list')
                this.setState({displayMode})
            }
        }
        pydio.observe('reload_layout_preferences', this._prefObserver)

        this.recomputeThumbnailsDimension();
        this._thumbObserver = debounce(this.recomputeThumbnailsDimension.bind(this), 500);
        if(window.addEventListener){
            window.addEventListener('resize', this._thumbObserver);
        }else{
            window.attachEvent('onresize', this._thumbObserver);
        }
        if(!fixedDisplayMode && onDisplayModeChange && this.state && this.state.displayMode){
            onDisplayModeChange(this.state.displayMode);
        }
    }

    componentWillUnmount() {
        const {dataModel, pydio} = this.props;
        dataModel.stopObserving("context_changed", this._contextObserver);
        pydio.stopObserving('reload_layout_preferences', this._prefObserver)

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
            || nextProps.fixedDisplayMode !== this.props.fixedDisplayMode
            || nextProps.style !== this.props.style
            || nextState !== this.state );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {pydio, fixedDisplayMode, fixedColumns, onDisplayModeChange} = this.props;
        const {repositoryId} = prevState;
        const {displayMode:originalDisplayMode} = this.state;
        if(prevProps.dataModel !== this.props.dataModel) {
            prevProps.dataModel.stopObserving("context_changed", this._contextObserver);
            this.props.dataModel.observe("context_changed", this._contextObserver);
            this._contextObserver();
        }
        if(repositoryId !== pydio.repositoryId) {
            pydio.getController().updateGuiActions(this.getPydioActions());
            if(!fixedColumns) {
                const configParser = new ListColumnsParser(this.tableEntryRenderCell.bind(this));
                configParser.loadConfigs('FilesList').then((columns) => {
                    this.setState({columns});
                })
            }
            let dMode = this.getPrefValue('FilesList.DisplayMode', originalDisplayMode || 'list');
            if(fixedDisplayMode) {
                dMode = fixedDisplayMode
            } else if(prevState.displayMode !== dMode && dMode.indexOf('grid-') === 0){
                let tSize = 160;
                if(dMode === 'grid-320') {
                    tSize = 320;
                } else if(dMode === 'grid-80') {
                    tSize = 80;
                }
                this.recomputeThumbnailsDimension(tSize)
            }
            this.setState({
                repositoryId: pydio.repositoryId,
                displayMode:dMode
            }, ()=>{
                if(onDisplayModeChange && dMode !== originalDisplayMode) {
                    onDisplayModeChange(dMode);
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

        const MAIN_CONTAINER_FULL_PADDING = 4;
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
                width = 160;
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
        const metaDisabled = !pydio.Registry.hasPluginOfType("meta", "user")
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
            if (metaDisabled) {
                classes = classes.filter(c => c !== 'mdi-tag' && c !== 'mdi-tag-outline')
            }
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
            if(!metaDisabled && displayMode !== 'list' && displayMode !== 'masonry') {
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
            if(displayMode.indexOf('grid-') === 0 && node.isLeaf() && node.getMetadata().get('ImagePreview') && node.getSvgSource(false)) {
                // Append font-icon for specific cases
                content = (
                    <React.Fragment>
                        {content}
                        <span style={{flex: 1}}/>
                        <div className={node.getSvgSource(false)+' mimefont mimefont-overlay'}/>
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

    };

    switchDisplayMode(displayMode){
        this.setState({displayMode: displayMode}, ()=>{
            let near = null;
            if(displayMode.indexOf('grid-') === 0) {
                near = parseInt(displayMode.split('-')[1]);
            }
            this.recomputeThumbnailsDimension(near);
            this.setPrefValue('FilesList.DisplayMode', displayMode);
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
        ];
        if(this.props.pydio.Registry.findEditorById('editor.bnote') && this.props.pydio.getPluginConfigs('editor.bnote').get('BNOTE_PAGES_META')) {
            ResourcesManager.loadClass('BlockNote').then((lib) => this.setState({BlockNote: lib}))
            list.push(
                {
                    name: 'Pages',
                    icon_class: 'mdi mdi-file-document-multiple',
                    value: 'pages',
                }
            )
        }
        list.push(
            {name:Pydio.getMessages()['ajax_gui.list.display-mode.details'],title:461,icon_class:'mdi mdi-view-headline',value:'detail',hasAccessKey:true,accessKey:'detail_access_key'},
            {name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs'],title:229,icon_class:'mdi mdi-view-grid',value:'grid-160',hasAccessKey:true,accessKey:'thumbs_access_key', highlight:(v)=>v.indexOf('grid-')===0}
        )

        if(displayMode.indexOf('grid-') === 0) {
            list.push(
                {
                    name:Pydio.getMessages()['ajax_gui.list.display-mode.thumbs-large'],
                    icon_class:'mdi mdi-arrow-up',
                    value:'grid-320'
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
                i.name = (
                    <span style={{fontWeight: 500, display: 'flex'}}>
                        <span style={{flex: 1}}>{i.name}</span>
                        {value === displayMode && <span className="mdi mdi-checkbox-marked-circle-outline"/>}
                    </span>
                )
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
                        this.setPrefValue('FilesList.ShowExtensions', !showExtensions);
                    });
                }
            },
            {name:Pydio.getMessages()['ajax_gui.list.pin.bookmarks'], icon_class:pinBookmarks?'mdi mdi-toggle-switch':'mdi mdi-toggle-switch-off', callback:()=>{
                    this.setState({pinBookmarks:!pinBookmarks}, () => {
                        this.props.pydio.notify('actions_refreshed');
                        this.setPrefValue('FilesList.PinBookmarks', !pinBookmarks);
                    });
                }
            }
        ]
    }

    getPydioActions(keysOnly = false){
        const {fixedDisplayMode} = this.props;
        if(keysOnly){
            if(fixedDisplayMode) {
                return ['toggle_show_extensions'];
            }
            return ['switch_display_mode', 'toggle_show_extensions'];
        }
        const actions = new Map();

        if(!fixedDisplayMode) {
            const multiAction = new Action({
                name:'switch_display_mode',
                icon_class:'mdi mdi-view-list',
                text_id:150,
                title_id:151,
                text:Pydio.getMessages()[150],
                title:Pydio.getMessages()[151],
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
            actions.set('switch_display_mode', multiAction);
        }

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
        actions.set('toggle_show_extensions', extAction);
        return actions;
    }

    render() {

        const {pydio, dataModel, style, onScroll} = this.props;
        const {searchResults, searchScope, searchLoading, searchEmpty} = this.props;
        const {contextNode, displayMode, columns, thumbSize, pinBookmarks} = this.state;
        let tableKeys, sortKeys, elementStyle, className = 'files-list layout-fill main-files-list';
        let elementHeight, entryRenderSecondLine, near, elementsPerLine = 1;
        let dMode = displayMode;
        // Override display Mode
        if(dMode.indexOf('grid-') === 0){
            near = parseInt(dMode.split('-')[1]);
            dMode = 'grid';
        } else if(dMode === 'pages' && searchResults) {
            dMode = 'list';
        }
        let additionalStyle = {}

        if(dMode === 'detail'){

            elementHeight = SimpleList.HEIGHT_ONE_LINE;
            tableKeys = columns;

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
            additionalStyle = {padding: 0, margin: -4}

        } else if(dMode === 'list'){

            sortKeys = columns;
            elementHeight = SimpleList.HEIGHT_TWO_LINES;
            entryRenderSecondLine = this.entryRenderSecondLine.bind(this);

        }

        const messages = pydio.MessageHash;
        const canUpload = !contextNode.getMetadata().has('node_readonly') && pydio.Controller.getActionByName('upload');
        const writeOnly = contextNode.getMetadata().has('node_writeonly');
        const secondary = messages[canUpload ? '565' : '566'];
        const iconClassName = canUpload ? 'mdi mdi-cloud-upload' : 'mdi mdi-folder-outline';
        const errorStateProps = {
            style           : {backgroundColor: 'transparent'},
            iconStyle       : {fontSize: 80, padding: 20},
            buttonContainerStyle: {marginTop: 30},
            iconClassName   :"mdi mdi-alert-circle-outline",
            primaryTextId   :"Oops, something went wrong!",
            actionLabelId   : messages['149'],
            actionIconClassName:"mdi mdi-refresh",
            actionCallback: () => contextNode.reload()
        }

        let emptyStateProps = {
            style           : {backgroundColor: 'transparent'},
            buttonContainerStyle: {marginTop: 30},
            iconClassName   : iconClassName,
            primaryTextId   : messages['562'],
            secondaryTextId : secondary,
        };

        if(writeOnly) {

            emptyStateProps.primaryTextId = messages['ajax_gui.list.writeonly.emptystate.title']
            emptyStateProps.secondaryTextId = messages['ajax_gui.list.writeonly.emptystate.legend']

        } else if(contextNode.isRoot()){
            const isCell = (pydio.user && pydio.user.activeRepository) ? pydio.user.getRepositoriesList().get(pydio.user.activeRepository).getOwner() : false;
            const recyclePath = contextNode.getMetadata().get('repo_has_recycle');
            emptyStateProps = {...emptyStateProps,
                iconClassName   : iconClassName,
                primaryTextId   : isCell? messages['631'] : messages['563'],
                secondaryTextId : secondary,
            };
            if(canUpload) {
                emptyStateProps = {...emptyStateProps,
                    actionLabelId: canUpload.options.text_id,
                    actionIconClassName: canUpload.options.icon_class,
                    actionCallback: () => {
                        pydio.Controller.fireAction('upload')
                    }
                }
            }
            if(recyclePath){
                emptyStateProps = {
                    ...emptyStateProps,
                    checkEmptyState: (node) => { return (node.isLoaded() && node.getChildren().size === 1 && node.getChildren().get(recyclePath) )} ,
                    actionLabelId: messages['567'],
                    actionIconClassName: 'mdi mdi-delete',
                    actionCallback: () => {
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
                primaryTextId:searchEmpty?'searchengine.start':(searchLoading?'searchengine.searching':478),
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
                        className={"masonry-grid "+"masonry-size-"+cWidth}
                        dataModel={dataModel}
                        entryProps={{
                            handleClicks:this.entryHandleClicks.bind(this),
                            renderIcon:this.entryRenderIcon.bind(this),
                            renderActions: this.entryRenderActions.bind(this)
                        }}
                        emptyStateProps={emptyStateProps}
                        errorStateProps={errorStateProps}
                        containerStyle={{...style, margin: -2, padding: 2}}
                        columnWidth={cWidth}
                        onScroll={onScroll}
                    />
                </React.Fragment>
            )
        } else if (dMode === 'pages') {
            const {BlockNote} = this.state;
            if(!BlockNote) {
                return (
                    <div>Loading...</div>
                )
            }
            return (
                <div style={{...style, position:'relative', overflowY: 'scroll'}}>
                    <BlockNote.MainPanel
                        dataModel={dataModel}
                        style={null}
                        contentMeta={this.props.pydio.getPluginConfigs('editor.bnote').get('BNOTE_PAGES_META')}
                        entryProps={{
                            handleClicks:this.entryHandleClicks.bind(this),
                            renderIcon:this.entryRenderIcon.bind(this),
                            renderActions: this.entryRenderActions.bind(this)
                        }}
                    />
                    {this.props.children}
                </div>
            );
        }

        let sortingInfoChange
        const {onSortingInfoChange} = this.props;
        if(onSortingInfoChange) {
            sortingInfoChange = (si) => {
                let label;
                if(si.attribute) {
                    if (columns[si.attribute]) {
                        label = columns[si.attribute].label
                    } else if (si.remote) {
                        const ff = Object.keys(columns).map(c => columns[c]).filter(c => c.remoteSortAttribute === si.attribute)
                        if (ff.length) {
                            label = ff[0].label
                        }
                    }
                }
                onSortingInfoChange({...si, label})
            }
        }

        return (
            <SimpleList
                ref="list"
                pydio={pydio}
                tableKeys={tableKeys}
                sortKeys={sortKeys}
                node={contextNode}
                dataModel={dataModel}
                observeNodeReload={true}
                className={className}
                actionBarGroups={["change_main"]}
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
                errorStateProps={errorStateProps}
                defaultSortingInfo={{sortType:'file-natural',attribute:'',direction:'asc'}}
                sortingPreferenceKey={'FSTemplate.FilesList.SortingInfo'}
                onSortingInfoChange={sortingInfoChange}
                hideToolbar={true}
                customToolbar={<CellsMessageToolbar pydio={pydio}/>}
                {...groupProps}
            />
        );
    }
}

MainFilesList = muiThemeable()(MainFilesList)
export {MainFilesList as default}

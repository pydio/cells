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

import React from 'react'
import Pydio from 'pydio'
import PathUtils from 'pydio/util/path'
import Action from 'pydio/model/action'
import ReactDOM from 'react-dom'

import FilePreview from './FilePreview'
import {IconButton} from 'material-ui'
import CellsMessageToolbar from './CellsMessageToolbar'
const {SimpleList} = Pydio.requireLib('components');
const {moment, SingleJobProgress} = Pydio.requireLib('boot');
import OverlayIcon from './OverlayIcon'

class ComponentConfigsParser {

    constructor() {

    }

    getDefaultListColumns() {
        return {
            text:{
                label:'File Name',
                message:'1',
                width: '50%',
                renderCell:MainFilesList.tableEntryRenderCell,
                sortType:'file-natural',
                remoteSortAttribute:'ajxp_label'
            },
            filesize:{
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

    loadConfigs(componentName) {
        let configs = new Map();
        let columnsNodes = XMLUtils.XPathSelectNodes(global.pydio.getXmlRegistry(), 'client_configs/component_config[@component="FilesList"]/columns/column|client_configs/component_config[@component="FilesList"]/columns/additional_column');
        let columns = {};
        let messages = global.pydio.MessageHash;
        columnsNodes.forEach(function(colNode){
            let name = colNode.getAttribute('attributeName');
            let sortType = colNode.getAttribute('sortType');
            const sorts = {'String':'string', 'StringDirFile':'string', 'MyDate':'number', 'CellSorterValue': 'number'};
            sortType = sorts[sortType] || 'string';
            if(name === 'bytesize') sortType = 'number';
            columns[name] = {
                message : colNode.getAttribute('messageId'),
                label   : colNode.getAttribute('messageString') ? colNode.getAttribute('messageString') : messages[colNode.getAttribute('messageId')],
                sortType: sortType
            };
            if(name === 'ajxp_label') {
                columns[name].renderCell = MainFilesList.tableEntryRenderCell;
            }
            if(colNode.getAttribute('reactModifier')){
                let reactModifier = colNode.getAttribute('reactModifier');
                ResourcesManager.detectModuleToLoadAndApply(reactModifier, function(){
                    columns[name].renderComponent = columns[name].renderCell = FuncUtils.getFunctionByName(reactModifier, global);
                }, true);
            }
        });
        configs.set('columns', columns);
        return configs;
    }

}

class MainFilesList extends React.Component {
    static propTypes = {
        pydio: React.PropTypes.instanceOf(Pydio),
        horizontalRibbon: React.PropTypes.bool
    };

    static computeLabel = (node)=>{
        let label = node.getLabel();
        if(node.isLeaf() && label[0] !== "."){
            let ext = PathUtils.getFileExtension(label);
            if(ext){
                ext = '.' + ext;
                label = <span>{label.substring(0, label.length-ext.length)}<span className={"label-extension"} style={{opacity:0.33, display:'none'}}>{ext}</span></span>;
            }
        }
        return label;
    };

    static tableEntryRenderCell(node) {
        return (
            <span>
                <FilePreview rounded={true} loadThumbnail={false} node={node} style={{backgroundColor:'transparent'}}/>
                <span style={{display:'block',overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}} title={node.getLabel()}>{node.getLabel()}</span>
            </span>
        );
    }

    constructor(props, context) {
        super(props, context);
        let configParser = new ComponentConfigsParser();
        let columns = configParser.loadConfigs('FilesList').get('columns');
        const dMode = this.displayModeFromPrefs(props.displayMode);
        let tSize = 200;
        if(dMode === 'grid-320') {
            tSize = 320;
        } else if(dMode === 'grid-80') {
            tSize = 80;
        }

        this.state = {
            contextNode : props.pydio.getContextHolder().getContextNode(),
            displayMode : dMode,
            thumbNearest: tSize,
            thumbSize   : tSize,
            elementsPerLine: 5,
            columns     : columns ? columns : configParser.getDefaultListColumns(),
            parentIsScrolling: props.parentIsScrolling,
            repositoryId: props.pydio.repositoryId
        };
    }

    displayModeFromPrefs = (defaultMode) => {
        const {pydio} = this.props;
        if(!pydio.user){
            return defaultMode || 'list';
        }
        const slug = pydio.user.getActiveRepositoryObject().getSlug();
        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : {};
        if(guiPrefs['FilesListDisplayMode'] && guiPrefs['FilesListDisplayMode'][slug]){
            return guiPrefs['FilesListDisplayMode'][slug];
        }
        return defaultMode || 'list';
    };

    /**
     * Save displayMode to user prefs
     * @param mode
     * @return {string}
     */
    displayModeToPrefs = (mode) => {
        const {pydio} = this.props;
        if(!pydio.user){
            return 'list';
        }
        const slug = pydio.user.getActiveRepositoryObject().getSlug();
        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : {};
        const dPrefs = guiPrefs['FilesListDisplayMode'] || {};
        dPrefs[slug] = mode;
        guiPrefs['FilesListDisplayMode'] = dPrefs;
        pydio.user.setPreference('gui_preferences', guiPrefs, true);
        pydio.user.savePreference('gui_preferences');
    };

    componentDidMount() {
        // Hook to the central datamodel
        this._contextObserver = function(){
            this.setState({contextNode: this.props.pydio.getContextHolder().getContextNode()});
        }.bind(this);
        this.props.pydio.getContextHolder().observe("context_changed", this._contextObserver);
        this.props.pydio.getController().updateGuiActions(this.getPydioActions());

        this.recomputeThumbnailsDimension();
        if(window.addEventListener){
            window.addEventListener('resize', this.recomputeThumbnailsDimension);
        }else{
            window.attachEvent('onresize', this.recomputeThumbnailsDimension);
        }
        if(this.props.onDisplayModeChange && this.state && this.state.displayMode){
            this.props.onDisplayModeChange(this.state.displayMode);
        }
    }

    componentWillUnmount() {
        this.props.pydio.getContextHolder().stopObserving("context_changed", this._contextObserver);
        this.getPydioActions(true).map(function(key){
            this.props.pydio.getController().deleteFromGuiActions(key);
        }.bind(this));
        if(window.addEventListener){
            window.removeEventListener('resize', this.recomputeThumbnailsDimension);
        }else{
            window.detachEvent('onresize', this.recomputeThumbnailsDimension);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (!this.state || this.state.repositoryId !== nextProps.pydio.repositoryId || nextState !== this.state );
    }

    componentWillReceiveProps() {
        if(this.state && this.state.repositoryId !== this.props.pydio.repositoryId ){
            this.props.pydio.getController().updateGuiActions(this.getPydioActions());
            let configParser = new ComponentConfigsParser();
            const columns = configParser.loadConfigs('FilesList').get('columns');
            const dMode = this.displayModeFromPrefs(this.state?this.state.displayMode:'list');
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
                columns: columns ? columns : configParser.getDefaultListColumns(),
                displayMode:dMode
            }, ()=>{
                if(this.props.onDisplayModeChange) {
                    this.props.onDisplayModeChange(dMode);
                }
            })
        }
    }

    resize = () => {
        this.recomputeThumbnailsDimension();
    };

    recomputeThumbnailsDimension = (nearest) => {

        const MAIN_CONTAINER_FULL_PADDING = 2;
        const THUMBNAIL_MARGIN = 1;
        let containerWidth;
        try{
            containerWidth = ReactDOM.findDOMNode(this.refs['list'].refs['infinite']).clientWidth - MAIN_CONTAINER_FULL_PADDING;
        }catch(e){
            containerWidth = 200;
        }
        if(this.state.displayMode.indexOf('grid') === 0) {
            if(!nearest || nearest instanceof Event){
                nearest = this.state.thumbNearest;
            }
            // Find nearest dim
            let blockNumber = Math.floor(containerWidth / nearest);
            let width = Math.floor(containerWidth / blockNumber) - THUMBNAIL_MARGIN * 2;
            if(this.props.horizontalRibbon){
                blockNumber = this.state.contextNode.getChildren().size;
                if(this.state.displayMode === 'grid-160') {
                    width = 160;
                } else if(this.state.displayMode === 'grid-320') {
                    width = 320;
                } else if(this.state.displayMode === 'grid-80') {
                    width = 80;
                } else {
                    width = 200;
                }
            }
            this.setState({
                elementsPerLine: blockNumber,
                thumbSize: width,
                thumbNearest:nearest
            });

        } else {
            // Recompute columns widths
            let columns = this.state.columns;
            let columnKeys = Object.keys(columns);
            let defaultFirstWidthPercent = 10;
            let firstColWidth = Math.max(250, containerWidth * defaultFirstWidthPercent / 100);
            let otherColWidth = (containerWidth - firstColWidth) / (Object.keys(this.state.columns).length - 1);
            columnKeys.map(function(columnKey){
                columns[columnKey]['width'] = otherColWidth;
            });
            this.setState({
                columns: columns,
            });

        }

    };

    entryRenderIcon = (node, entryProps = {}) => {
        if(entryProps && entryProps.parent){
            return (
                <FilePreview
                    loadThumbnail={false}
                    node={node}
                    mimeClassName="mimefont mdi mdi-chevron-left"
                    onTouchTap={()=>{this.entryHandleClicks(node, SimpleList.CLICK_TYPE_DOUBLE)}}
                    style={{cursor:'pointer'}}
                />
            );
        }else{
            const hasThumbnail = !!node.getMetadata().get("thumbnails");
            const processing = !!node.getMetadata().get('Processing');
            return (
                <FilePreview
                    loadThumbnail={!entryProps['parentIsScrolling'] && hasThumbnail && !processing}
                    node={node}
                    processing={processing}
                />
            );
        }
    };

    entryRenderActions = (node) => {
        let content = null;
        const {pydio} = this.props;
        const mobile = pydio.UI.MOBILE_EXTENSIONS;
        const dm = pydio.getContextHolder();
        if(mobile){
            const ContextMenuModel = require('pydio/model/context-menu');
            return <IconButton iconClassName="mdi mdi-dots-vertical" style={{zIndex:0, padding: 10}} tooltip="Info" onClick={(event) => {
                pydio.observeOnce('actions_refreshed', ()=>{
                    ContextMenuModel.getInstance().openNodeAtPosition(node, event.clientX, event.clientY);
                });
                event.stopPropagation();
                dm.setSelectedNodes([node]);
                ContextMenuModel.getInstance().openNodeAtPosition(node, event.clientX, event.clientY);
            }}/>;
        }else if(node.getMetadata().get('overlay_class')){
            let elements = node.getMetadata().get('overlay_class').split(',').filter(c=>!!c).map(function(c){
                return <OverlayIcon node={node} key={c} overlay={c} pydio={pydio}/>;
            });
            content = <div className="overlay_icon_div">{elements}</div>;
        }
        return content;

    };

    entryHandleClicks = (node, clickType, event) => {
        let dm = this.props.pydio.getContextHolder();
        const mobile = this.props.pydio.UI.MOBILE_EXTENSIONS || this.props.horizontalRibbon;
        if(dm.getContextNode().getParent() === node && clickType === SimpleList.CLICK_TYPE_SIMPLE){
            return;
        }
        if(!mobile && ( !clickType || clickType === SimpleList.CLICK_TYPE_SIMPLE )){
            const crtSelection = dm.getSelectedNodes();
            if(event && event.shiftKey && crtSelection.length) {
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
            if(!node.isBrowsable()){
                dm.setSelectedNodes([node]);
                this.props.pydio.Controller.fireAction("open_with_unique");
            }else{
                dm.requireContextChange(node);
            }
        }
    };

    entryRenderSecondLine = (node) => {
        let metaData = node.getMetadata();
        let pieces = [];
        const standardPieces = [];
        const otherPieces = [];

        if (metaData.has('pending_operation')){
            if (metaData.has('pending_operation_uuid')) {
                return <SingleJobProgress jobID={metaData.get('pending_operation_uuid')} style={{display:'flex', flexDirection:'row-reverse', alignItems:'center'}} progressStyle={{width: 60, paddingRight: 10}} labelStyle={{flex: 1}}/>
            } else {
                return <span style={{fontStyle:'italic', color:'rgba(0,0,0,.33)'}}>{metaData.get('pending_operation')}</span>
            }
        }

        if(metaData.get('ajxp_modiftime')) {
            let mDate = moment(parseFloat(metaData.get('ajxp_modiftime'))*1000);
            let dateString = mDate.calendar();
            if(dateString.indexOf('/') > -1) {
                dateString = mDate.fromNow();
            }
            pieces.push(<span key="time_description" className="metadata_chunk metadata_chunk_description">{dateString}</span>);
        }

        let first = false;
        let attKeys = Object.keys(this.state.columns);

        for(let i = 0; i<attKeys.length;i++ ){
            let s = attKeys[i];
            let columnDef = this.state.columns[s];
            let label;
            let standard = false;
            if(s === 'ajxp_label' || s === 'text'){
                continue;
            }else if(s==="ajxp_modiftime"){
                let date = new Date();
                date.setTime(parseInt(metaData.get(s))*1000);
                label = PathUtils.formatModifDate(date);
                standard = true;
            }else if(s === "ajxp_dirname" && metaData.get("filename")){
                let dirName = PathUtils.getDirname(metaData.get("filename"));
                label =  dirName?dirName:"/" ;
                standard = true;
            }else if(s === "bytesize") {
                if(metaData.get(s) === "-"){
                    continue;
                } else {
                    let test = PathUtils.roundFileSize(parseInt(metaData.get(s)));
                    if(test !== NaN){
                        label = test;
                    } else {
                        continue;
                    }
                }
                standard = true;
            }else if(columnDef.renderComponent){
                columnDef['name'] = s;
                label = columnDef.renderComponent(node, columnDef);
                if(label === null){
                    continue;
                }
            }else{
                if(s === 'mimestring' || s === 'readable_dimension'){
                    standard = true;
                }
                const metaValue = metaData.get(s) || "";
                if(!metaValue) {
                    continue;
                }
                label = metaValue;
            }
            let sep;
            if(!first){
                sep = <span className="icon-angle-right"></span>;
            }
            let cellClass = 'metadata_chunk metadata_chunk_'+(standard ?'standard':'other')+' metadata_chunk_' + s;
            const cell = <span key={s} className={cellClass}>{sep}<span className="text_label">{label}</span></span>;
            standard ? standardPieces.push(cell) : otherPieces.push(cell);
        }
        pieces.push(...otherPieces, ...standardPieces);
        return pieces;

    };

    switchDisplayMode = (displayMode) => {
        this.setState({displayMode: displayMode}, ()=>{
            let near = null;
            if(displayMode.indexOf('grid-') === 0) {
                near = parseInt(displayMode.split('-')[1]);
            }
            this.recomputeThumbnailsDimension(near);
            this.displayModeToPrefs(displayMode);
            if(this.props.onDisplayModeChange) {
                this.props.onDisplayModeChange(displayMode);
            }
            this.props.pydio.notify('actions_refreshed');
        });
    };

    buildDisplayModeItems = () => {
        const {displayMode} = this.state;
        const list = [
            {name:'List',title:227,icon_class:'mdi mdi-view-list',value:'list',hasAccessKey:true,accessKey:'list_access_key'},
            {name:'Detail',title:461,icon_class:'mdi mdi-view-headline',value:'detail',hasAccessKey:true,accessKey:'detail_access_key'},
            {name:'Thumbs',title:229,icon_class:'mdi mdi-view-grid',value:'grid-160',hasAccessKey:true,accessKey:'thumbs_access_key'},
            {name:'Thumbs large',title:229,icon_class:'mdi mdi-view-agenda',value:'grid-320',hasAccessKey:false},
            {name:'Thumbs small',title:229,icon_class:'mdi mdi-view-module',value:'grid-80',hasAccessKey:false}
        ];
        return list.map(item => {
            const i = {...item};
            const value = item.value;
            i.callback = () => {this.switchDisplayMode(i.value)};
            if(value === displayMode){
                i.icon_class = 'mdi mdi-check';
            }
            return i;
        });
    };

    getPydioActions = (keysOnly = false) => {
        if(keysOnly){
            return ['switch_display_mode'];
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
        return buttons;
    };

    render() {

        let tableKeys, sortKeys, elementStyle, className = 'files-list layout-fill main-files-list';
        let elementHeight, entryRenderSecondLine, elementsPerLine = 1, near;
        let dMode = this.state.displayMode;
        if(dMode.indexOf('grid-') === 0){
            near = parseInt(dMode.split('-')[1]);
            dMode = 'grid';
        }
        let infiniteSliceCount = 50;

        if(dMode === 'detail'){

            elementHeight = SimpleList.HEIGHT_ONE_LINE;
            tableKeys = this.state.columns;

        } else if(dMode === 'grid'){

            sortKeys = this.state.columns;
            className += ' material-list-grid grid-size-' + near;
            elementHeight =  Math.ceil(this.state.thumbSize / this.state.elementsPerLine);
            if(!elementHeight || this.props.horizontalRibbon){
                elementHeight = 1;
            }
            elementsPerLine = this.state.elementsPerLine;
            elementStyle={
                width: this.state.thumbSize,
                height: this.state.thumbSize
            };
            if(this.props.horizontalRibbon){
                className += ' horizontal-ribbon';
            }
            // Todo: compute a more real number of elements visible per page.
            if(near === 320) infiniteSliceCount = 25;
            else if(near === 160) infiniteSliceCount = 80;
            else if(near === 80) infiniteSliceCount = 200;

        } else if(dMode === 'list'){

            sortKeys = this.state.columns;
            elementHeight = SimpleList.HEIGHT_TWO_LINES;
            entryRenderSecondLine = this.entryRenderSecondLine;

        }

        const {pydio} = this.props;
        const {contextNode} = this.state;
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
            const recycle = pydio.getContextHolder().getRootNode().getMetadata().get('repo_has_recycle');
            if(contextNode.getPath() === recycle){
                emptyStateProps = {
                    ...emptyStateProps,
                    iconClassName   : 'mdi mdi-delete-empty',
                    primaryTextId   : messages['564'],
                    secondaryTextId : null,
                }
            }
        }

        return (
            <SimpleList
                ref="list"
                tableKeys={tableKeys}
                sortKeys={sortKeys}
                node={this.state.contextNode}
                dataModel={pydio.getContextHolder()}
                className={className}
                actionBarGroups={["change_main"]}
                infiniteSliceCount={infiniteSliceCount}
                skipInternalDataModel={true}
                style={this.props.style}
                elementsPerLine={elementsPerLine}
                elementHeight={elementHeight}
                elementStyle={elementStyle}
                passScrollingStateToChildren={true}
                entryRenderIcon={this.entryRenderIcon}
                entryRenderParentIcon={this.entryRenderIcon}
                entryRenderFirstLine={(node)=>MainFilesList.computeLabel(node)}
                entryRenderSecondLine={entryRenderSecondLine}
                entryRenderActions={this.entryRenderActions}
                entryHandleClicks={this.entryHandleClicks}
                horizontalRibbon={this.props.horizontalRibbon}
                emptyStateProps={emptyStateProps}
                defaultSortingInfo={{sortType:'file-natural',attribute:'',direction:'asc'}}
                hideToolbar={true}
                customToolbar={<CellsMessageToolbar pydio={pydio}/>}
            />
        );
    }
}

export {MainFilesList as default}

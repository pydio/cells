import React, {useCallback} from "react";
import {IconButton} from "material-ui";
import OverlayIcon from "./OverlayIcon";

const useRichMetaActions = ({dataModel, pydio, displayMode, searchResultsMode=false, customRenderProps={}}) => {

    return useCallback((node) => {
        let content = null;
        const metaDisabled = !pydio.Registry.hasPluginOfType("meta", "user")
        const gridMode = displayMode.indexOf('grid') === 0 || displayMode === 'masonry';
        const overlayClasses = node.getMetadata().get('overlay_class') || ''
        if(node.getMetadata().has('local:entryRenderActions')){
            return node.getMetadata().get('local:entryRenderActions')(node, customRenderProps, {});// TODO STATE AS 2ND ARG
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
                        disableActions={!!searchResultsMode}
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
                        disableActions={!!searchResultsMode}
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
                        disableActions={!!searchResultsMode}
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
            if(displayMode.indexOf('grid') === 0 && node.isLeaf() && (node.getMetadata().has('ImagePreview') && !node.getMetadata().get('ImagePreview').Error) && node.getSvgSource(false)) {
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

    }, [dataModel, pydio, displayMode, searchResultsMode, customRenderProps]);


}

export {useRichMetaActions}
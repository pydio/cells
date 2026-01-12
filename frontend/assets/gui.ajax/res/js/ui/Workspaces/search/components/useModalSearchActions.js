import {useCallback} from "react";
import {IconButton} from "material-ui";

const styles = {
    style: {
        width: 28,
        height: 28,
        background: 'var(--md-sys-color-surface)',
        border: '1px solid var(--md-sys-color-inverse-primary)',
        padding: 3,
        borderRadius: 8,
        marginRight: 8,
    },
    iconStyle: {
        fontSize: 16,
        color: 'var(--md-sys-color-primary)',
    }
}

const previewNode = (e, pydio, node) => {
    e.stopPropagation();
    pydio.UI.openCurrentSelectionInEditor(null, node);
}

const goToNode = (e, pydio, node, requestClose) => {
    pydio.goTo(node);
    requestClose()
}

const useModalSearchActions = ({dataModel, pydio, displayMode, requestClose=()=>{}}) => {
    return useCallback((node, entryState) => {
        console.log(node, entryState)
        if(entryState && !(entryState.hover || entryState.selected)) {
            return null
        }
        const elements = [
            <div style={{marginLeft:8}}></div>
        ]
        const style = {...styles.style};
        const iconStyle = {...styles.iconStyle};
        let tooltipPosition = 'top-left';
        if(displayMode.indexOf('grid') === 0) {
            style.marginTop = 8;
            tooltipPosition = 'bottom-right';
        } else if(displayMode.indexOf('masonry') === 0) {
            style.margin = 8;
            style.marginRight = 0;
            tooltipPosition = 'bottom-right';
        }
        if(node.isLeaf()) {
            const editorData = pydio.UI.findEditorDataForPreview(node)
            elements.push(
                <IconButton
                    style={style}
                    iconStyle={iconStyle}
                    tooltip={editorData ? pydio.MessageHash['462'] : pydio.MessageHash['88']}
                    tooltipPosition={tooltipPosition}
                    iconClassName={editorData ? "mdi mdi-eye-outline": "mdi mdi-download"}
                    onClick={(e) => previewNode(e, pydio, node)}
                />
            )
        }
        elements.push(
            <IconButton
                style={style}
                iconStyle={iconStyle}
                tooltip={pydio.MessageHash['action.goto.label']}
                tooltipPosition={tooltipPosition}
                iconClassName="mdi mdi-arrow-left-bottom"
                onClick={(e) => goToNode(e, pydio, node, requestClose)}
            />
        )
        return (<>{elements}</>)
    }, [dataModel, displayMode]);
}

const useModalHandleClick = ({dataModel, pydio, displayMode, requestClose}) => {
    return {
        handleItemDoubleClick: (item, event) => {
            const {node} = item
            event.stopPropagation();
            if(node.isLeaf()) {
                previewNode(event, pydio, node)
            } else {
                goToNode(event, pydio, node, requestClose);
            }
        }
    }
}

export {useModalSearchActions, useModalHandleClick}
import React from 'react'
import {Paper} from 'material-ui'

const styles =  {
    paper: {
        borderLeft:'1px solid #e0e0e0',// + Orange,
        width: 300,
        height: '100%',
        display:'flex',
        overflow: 'hidden',
        flexDirection: 'column'
    },
    header : {
        padding: 10,
        fontSize: 15,
        fontWeight: 500,
        display:'flex',
        alignItems: 'center',
    },
    body: {
        flex: 1,
        overflowY: 'auto'
    },
    button: {
        fontSize: 20,
        marginLeft: 10,
        cursor: 'pointer',
        color: '#2196f3',
    },
    delete: {
        color: "#ef5350"
    },
    close: {
        color: '#9e9e9e',
    },
    disabled:{
        color: '#9e9e9e',
        opacity: 0.3,
        cursor: 'default'
    }
};

function position(width, sourceSize, sourcePosition, scrollLeft, topOffset = 0) {

    let top, left;
    left = sourcePosition.x + (sourceSize.width - width) / 2 - scrollLeft;
    top = sourcePosition.y + sourceSize.height + 10 + topOffset;
    return {top, left, width};

}

class RightPanel extends React.Component{
    render(){
        const {title, icon, saveButtons, onRevert, onRemove, onSave, onDismiss, width, children} = this.props;
        let bStyles = styles.button;
        if(saveButtons && !onSave){
            bStyles = {...bStyles, ...styles.disabled};
        }
        return (
            <Paper rounded={false} zDepth={0} style={{...styles.paper, width}}>
                <div style={styles.header}>
                    {icon && <span className={'mdi mdi-' + icon} style={{marginRight: 4}}/>}
                    <span style={{flex: 1}}>{title}</span>
                    {saveButtons && <span className={'mdi mdi-undo'} onClick={onRevert} style={bStyles}/>}
                    {saveButtons && <span className={'mdi mdi-content-save'} onClick={onSave} style={bStyles}/>}
                    {onRemove && <span className={'mdi mdi-delete'} onClick={onRemove} style={{...styles.button, ...styles.delete}}/>}
                    <span className={'mdi mdi-close'} onClick={()=>{onDismiss()}} style={{...styles.button, ...styles.close}}/>
                </div>
                <div style={styles.body}>
                    {children}
                </div>
            </Paper>
        );
    }
}

const cssStyle = `
text[joint-selector="icon"] tspan, 
text[joint-selector="type-icon"] tspan, 
text[joint-selector="type-icon-outline"] tspan, 
text[joint-selector="filter-icon"] tspan, 
text[joint-selector="selector-icon"] tspan,
text[joint-selector="add-icon"] tspan,
text[joint-selector="swap-icon"] tspan,
text[joint-selector="split-icon"] tspan,
text[joint-selector="remove-icon"] tspan
{
    font: normal normal normal 24px/1 "Material Design Icons";
    font-size: 24px;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
}
text[joint-selector="filter-icon"] tspan, 
text[joint-selector="selector-icon"] tspan, 
text[joint-selector="swap-icon"] tspan, 
text[joint-selector="add-icon"] tspan, 
text[joint-selector="split-icon"] tspan, 
text[joint-selector="remove-icon"] tspan
{
    font-size: 18px;
}
text[joint-selector="type-icon"] tspan, text[joint-selector="type-icon-outline"] tspan{
    font-size: 14px;
}
.joint-tool circle {
    fill: #ef534f;
}
.react-mui-context .pydio-form-panel{
    padding-bottom: 0;
}
.react-mui-context .pydio-form-panel .form-legend{
    display:none;
}
.react-mui-context .pydio-form-panel>.pydio-form-group{
    margin: 12px;
}
.react-mui-context .pydio-form-panel .replicable-field .title-bar {
    display: flex;
    align-items: center;
}
.react-mui-context .pydio-form-panel .replicable-field .title-bar .legend{
    display: none;
}
.react-mui-context .pydio-form-panel .replicable-field .replicable-group{
    margin-bottom: 0;
    padding-bottom: 0;
}
.right-panel-expand-button{
    position: absolute;
    bottom: 7px;
    left: -9px;
    cursor: pointer;
    display: block;
    background-color: #f5f5f5;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid #e0e0e0;
    font-size: 18px;
}
`;

const cssReadonlyStyle = `
path.marker-arrowhead {
    opacity: 0 !important;
}
.joint-element, .marker-arrowheads, [magnet=true]:not(.joint-element){
    cursor: default;
}
`;

function getCssStyle(editMode = false) {
    return <style type={"text/css"} dangerouslySetInnerHTML={{__html:cssStyle + (editMode ? '' : cssReadonlyStyle)}}></style>
}


export {styles, position, RightPanel, getCssStyle}
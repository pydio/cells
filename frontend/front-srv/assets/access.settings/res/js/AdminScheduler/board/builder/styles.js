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
    close: {
        color: '#9e9e9e',
        cursor: 'pointer'
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
        const {title, icon, onRevert, onSave, onDismiss, width, children} = this.props;
        return (
            <Paper rounded={false} zDepth={0} style={{...styles.paper, width}}>
                <div style={styles.header}>
                    {icon && <span className={'mdi mdi-' + icon} style={{marginRight: 4}}/>}
                    <span style={{flex: 1}}>{title}</span>
                    {onRevert && <span className={'mdi mdi-undo'} onClick={()=>{onRevert()}} style={styles.close}/>}
                    {onSave && <span className={'mdi mdi-content-save'} onClick={()=>{onSave()}} style={styles.close}/>}
                    <span className={'mdi mdi-close'} onClick={()=>{onDismiss()}} style={styles.close}/>
                </div>
                <div style={styles.body}>
                    {children}
                </div>
            </Paper>
        );
    }
}

export {styles, position, RightPanel}
import React from 'react'
import {Paper} from 'material-ui'

const styles =  {
    paper: {
        borderLeft:'1px solid #e0e0e0',// + Orange,
        width: 300,
        height: '100%'
    },
    header : {
        padding: 10,
        fontSize: 15,
        fontWeight: 500,
        display:'flex',
        alignItems: 'center',
    },
    close: {
        color: '#9e9e9e',
        cursor: 'pointer'
    }
};

function position(width, sourceSize, sourcePosition, scrollLeft) {

    let top, left;
    left = sourcePosition.x + (sourceSize.width - width) / 2 - scrollLeft;
    top = sourcePosition.y + sourceSize.height + 10;
    return {top, left, width};

}

class RightPanel extends React.Component{
    render(){
        const {title, icon, onDismiss, width, children} = this.props;
        return (
            <Paper rounded={false} zDepth={0} style={{...styles.paper, width}}>
                <div style={styles.header}>
                    {icon && <span className={'mdi mdi-' + icon} style={{marginRight: 4}}/>}
                    <span style={{flex: 1}}>{title}</span>
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
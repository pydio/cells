import React from 'react'
import {Popover, Paper, IconButton} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

const ThemedPaper = muiThemeable()((props) => {
    const {style={}, muiTheme, ...other} = props;
    return (
        <Paper {...other} style={{...style, ...muiTheme.menuContainer}}/>
    );
})


const ThemedPopover = muiThemeable()((props) => {
    const {style={}, muiTheme, ...other} = props;
    return (
        <Popover {...other} style={{...style, ...muiTheme.menuContainer}}/>
    );
})

const ThemedIconButton = muiThemeable()((props)=> {
    const {muiTheme:{iconButton={}}, style, iconStyle, ...other} = props;
    return (
        <IconButton
            style={{...iconButton.style, ...style}}
            iconStyle={{...iconButton.iconStyle, ...iconStyle}}
            {...other}
        />
    );
})

export {ThemedPaper as Paper, ThemedPopover as Popover, ThemedIconButton as IconButton}

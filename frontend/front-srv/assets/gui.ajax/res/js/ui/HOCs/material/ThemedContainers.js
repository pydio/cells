import React from 'react'
import {Popover, Paper, IconButton, DatePicker, TimePicker, MuiThemeProvider} from 'material-ui'
import {muiThemeable, getMuiTheme} from 'material-ui/styles'

const ThemedPaper = muiThemeable()((props) => {
    const {style={}, muiTheme, ...other} = props;
    return (
        <Paper {...other} style={{...style, ...muiTheme.menuContainer}}/>
    );
})


const ThemedPopover = muiThemeable()((props) => {
    const {style={}, muiTheme, panelTitle, panelIconClassName, children, ...other} = props;
    let titleBlock
    if(panelTitle){
        const popTitle = {
            display: 'flex',
            alignItems: 'center',
            borderRadius:`${muiTheme.borderRadius}px ${muiTheme.borderRadius}px 0 0`,
            width: '100%',
            borderBottom: '1px solid ' + muiTheme.palette.mui3['outline-variant-50'],
            //color: muiTheme.palette.mui3['on-surface']
        }
        titleBlock = (
            <div style={popTitle}>
                {panelIconClassName && <span className={panelIconClassName} style={{fontSize: 18, margin:'12px 8px 14px 16px'}}/>}
                <span style={{fontSize:15, fontWeight: 500}}>{panelTitle}</span>
            </div>
        )
    }
    return (
        <Popover {...other} style={{...style, ...muiTheme.menuContainer}} className={"themed-popover"}>{titleBlock}{children}</Popover>
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

const ThemedDatePicker = muiThemeable()((props) => {
    const {muiTheme, ...other} = props;
    const pickerTheme = {...muiTheme, paper: {backgroundColor:muiTheme.palette.mui3['surface']}}
    return (
        <MuiThemeProvider muiTheme={getMuiTheme(pickerTheme)}>
            <DatePicker {...other}/>
        </MuiThemeProvider>
    )
})

const ThemedTimePicker = muiThemeable()((props) => {
    const {muiTheme, ...other} = props;
    const pickerTheme = {...muiTheme, paper: {backgroundColor:muiTheme.palette.mui3['surface']}}
    return (
        <MuiThemeProvider muiTheme={getMuiTheme(pickerTheme)}>
            <TimePicker {...other}/>
        </MuiThemeProvider>
    )
})

export {ThemedPaper as Paper, ThemedPopover as Popover, ThemedIconButton as IconButton, ThemedDatePicker as DatePicker, ThemedTimePicker as TimePicker}

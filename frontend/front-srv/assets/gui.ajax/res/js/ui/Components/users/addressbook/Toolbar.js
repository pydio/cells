import React from 'react'
import {muiThemeable} from 'material-ui/styles'
import {Checkbox, IconButton, RaisedButton, TextField} from "material-ui";
import SearchForm from "./SearchForm";
import Color from "color";
import DOMUtils from 'pydio/util/dom'

class Toolbar extends React.Component {

    state={editLabel:false}

    onLabelKeyEnter(e){
        if (e.key === 'Enter'){
            this.updateLabel();
        }
    }
    onLabelChange(e, value){
        this.setState({editValue: value});
    }
    updateLabel(){
        const {model, onEditLabel} = this.props;
        const {editValue} = this.state;
        if(editValue !== model.contextItem().label){
            onEditLabel(model.contextItem(), editValue);
        }
        this.setState({editLabel: false});
    }

    render() {

        const {muiTheme, bookColumn, mode, getMessage, pydio, style,
            model, searchLabel, onSearch, enableSearch, onEditLabel,
            actionsPanel
        } = this.props;

        const item = model.contextItem()

        const selectionMode = model.getSelectionMode()
        const onFolderClicked= (i,c) => model.setContext(i,c)
        const reloadAction= ()=>model.reloadContext()
        const deleteAction= ()=>model.deleteMultipleSelection()
        const createAction= ()=>model.setCreateItem()

        const accentColor = muiTheme.userTheme==='mui3'?muiTheme.palette.mui3['primary'] : muiTheme.palette.accent2Color;
        const appBar = muiTheme.appBar;
        let stylesProps = {
            toolbarHeight: mode === 'book' ? 56 : 48,
            toolbarBgColor: mode === 'book' ? (selectionMode?accentColor : '#fafafa') : appBar.color,
            titleFontsize: mode === 'book' ? 20 : 16,
            titleFontWeight: 400,
            titleColor: mode === 'book' ? selectionMode?'white':'rgba(0,0,0,0.87)' : appBar.textColor,
            titlePadding: 10,
            button: {
                border: '1px solid ' + accentColor,
                borderRadius: '50%',
                margin: '0 4px',
                width: 36,
                height: 36,
                padding: 6
            },
            icon : {
                fontSize: 22,
                color: accentColor
            }
        };
        if(bookColumn){
            const colorHue = Color(muiTheme.palette.primary1Color).hsl().array()[0];
            const headerTitle = new Color({h:colorHue,s:30,l:43});
            stylesProps.toolbarBgColor = 'transparent';
            stylesProps.titleColor = headerTitle.toString();
            stylesProps.titleFontsize = 14;
            stylesProps.titleFontWeight = 500;
            stylesProps.titlePadding = '10px 6px 10px 16px';
            stylesProps.button.margin = '0';
            stylesProps.button.border = '0';
            stylesProps.icon.color = '#ccc';
        }
        let searchProps = {
            style:{flex:1, minWidth: 110},
        };
        if (mode === 'selector'){
            searchProps.inputStyle={color:'white'};
            searchProps.hintStyle={color:'rgba(255,255,255,.5)'};
            searchProps.underlineStyle={borderColor:'rgba(255,255,255,.5)'};
            searchProps.underlineFocusStyle={borderColor:'white'};
        }
        const ellipsis = {
            whiteSpace:'nowrap',
            textOverflow:'ellipsis',
            overflow:'hidden'
        };
        let createIcon = 'mdi mdi-account-plus';
        if(item.actions && item.actions.type === 'teams'){
            createIcon = 'mdi mdi-account-multiple-plus';
        }

        const {editLabel, editValue} = this.state;
        let mainTitle = item.label;
        if(onEditLabel && !selectionMode){
            if(editLabel){
                mainTitle = (
                    <div style={{display:'flex', alignItems:'center', flex: 1}}>
                        <TextField
                            style={{fontSize: 20}}
                            value={editValue}
                            onChange={this.onLabelChange.bind(this)}
                            onKeyDown={this.onLabelKeyEnter.bind(this)}
                        />
                        <IconButton
                            iconStyle={{color: '#e0e0e0'}}
                            secondary={true}
                            iconClassName={"mdi mdi-content-save"}
                            tooltip={getMessage(48)}
                            onClick={() => {this.updateLabel()}}
                        />
                    </div>
                );
            } else {
                mainTitle = (
                    <div style={{display:'flex', alignItems:'center', flex: 1}}>
                        {mainTitle}
                        <IconButton
                            iconStyle={{color: '#e0e0e0'}}
                            iconClassName={"mdi mdi-pencil"}
                            tooltip={getMessage(48)}
                            onClick={() => {this.setState({editLabel:true, label:item.label})}}
                        />
                    </div>
                );
            }
        }

        return (
            <div style={{padding: stylesProps.titlePadding, height:stylesProps.toolbarHeight, minHeight:stylesProps.toolbarHeight, borderRadius: '2px 2px 0 0', display:'flex', alignItems:'center', transition:DOMUtils.getBeziersTransition(), ...style}}>
                {mode === "selector" && item._parent && <IconButton style={{marginLeft: -10}} iconStyle={{color:stylesProps.titleColor}} iconClassName="mdi mdi-chevron-left" onClick={() => {onFolderClicked(item._parent)}}/>}
                {mode === 'book' && item.actions && item.actions.multiple && <Checkbox style={{width:'initial', marginLeft: selectionMode?7:14}} checked={selectionMode} onCheck={(e,v)=>model.setSelectionMode(v)}/>}
                <div style={{flex:2, fontSize:stylesProps.titleFontsize, color:stylesProps.titleColor, fontWeight:stylesProps.titleFontWeight, ...ellipsis}}>{mainTitle}</div>
                {(mode === 'book' || (mode === 'selector' && bookColumn)) && item.actions && item.actions.create && !selectionMode && <IconButton style={stylesProps.button} iconStyle={stylesProps.icon} iconClassName={createIcon} tooltipPosition={"bottom-left"} tooltip={getMessage(item.actions.create)} onClick={createAction}/>}
                {bookColumn && !item._parent && <IconButton style={stylesProps.button} iconStyle={stylesProps.icon} iconClassName={"mdi mdi-window-restore"} tooltipPosition={"bottom-left"} tooltip={pydio.MessageHash['411']} onClick={()=>{pydio.Controller.fireAction('open_address_book')}}/>}
                {mode === 'book' && item.actions && item.actions.remove && selectionMode && <RaisedButton secondary={true} label={getMessage(item.actions.remove)} disabled={!model.getMultipleSelection().length} onClick={deleteAction}/>}
                {!selectionMode && actionsPanel}
                {enableSearch && !bookColumn && <SearchForm searchLabel={searchLabel} onSearch={onSearch} {...searchProps}/>}
                {reloadAction && (mode === 'book' || (mode === 'selector' && bookColumn)) && <IconButton style={stylesProps.button} iconStyle={stylesProps.icon} iconClassName={"mdi mdi-refresh"} tooltipPosition={"bottom-left"} tooltip={pydio.MessageHash['149']} onClick={reloadAction} disabled={model.loading}/>}
            </div>
        );
    }

}

Toolbar = muiThemeable()(Toolbar)
export default Toolbar
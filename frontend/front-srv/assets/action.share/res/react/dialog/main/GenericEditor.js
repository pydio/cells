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
import {RaisedButton, FlatButton, IconButton, Divider} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

class EditorTab extends React.Component{

    render(){
        const {tabs, active, onChange, style, muiTheme} = this.props;
        const {primary1Color} = muiTheme.palette;
        return(
            <div style={{display:'flex', ...style}}>
                {tabs.map(t => {
                    const isActive = t.Value === active;
                    return <FlatButton label={t.Label} onTouchTap={()=>{onChange(t.Value)}} primary={isActive} style={isActive?{borderBottom: '2px solid ' + primary1Color}:{borderBottom:0}}/>
                })}
                <span style={{flex: 1}}/>
            </div>
        );
    }

}

EditorTab = muiThemeable()(EditorTab);

class EditorTabContent extends React.Component{
    render(){
        const {tabs, active} = this.props;
        let activeContent = null;
        tabs.map(t => {
            if (t.Value === active){
                activeContent = t.Component;
            }
        });
        return activeContent;
    }
}

class GenericEditor extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            left:props.tabs.left.length ? props.tabs.left[0].Value : '',
            right:props.tabs.right.length ? props.tabs.right[0].Value : '',
        };
    }

    componentWillReceiveProps(props){
        if(!this.state.left && props.tabs.left.length){
            this.setState({left: props.tabs.left[0].Value});
        }
        if(!this.state.right && props.tabs.right.length){
            this.setState({right: props.tabs.right[0].Value});
        }
    }


    render(){

        const {tabs, header, onSaveAction, onCloseAction, onRevertAction, saveEnabled, style, pydio} = this.props;
        const {left, right} = this.state;

        return (
            <div style={{display:'flex', flexDirection:'column', height: '100%', ...style}}>
                <div style={{display:'flex', padding: '10px 20px 20px'}}>
                    <div style={{flex: 1, paddingRight: 20}}>{header}</div>
                    <div style={{paddingTop: 10}}>
                        <RaisedButton disabled={!saveEnabled} primary={true} label={pydio.MessageHash['53']} onTouchTap={onSaveAction}/>
                        <FlatButton disabled={!saveEnabled} label={pydio.MessageHash['628']} onTouchTap={onRevertAction} style={{marginLeft: 10}}/>
                        <IconButton iconClassName={"mdi mdi-close"} tooltip={pydio.MessageHash['86']} onTouchTap={onCloseAction} style={{marginLeft: 10}}/>
                    </div>
                </div>
                <div style={{display:'flex'}}>
                    <EditorTab tabs={tabs.left} active={left} style={{flex: 1}} onChange={(value)=>{this.setState({left:value})}}/>
                    <EditorTab tabs={tabs.right} active={right} style={{flex: 1}}  onChange={(value)=>{this.setState({right:value})}}/>
                </div>
                <Divider/>
                <div style={{display:'flex', flex: 1}}>
                    <div style={{overflowY:'auto', width:'50%', borderRight: '1px solid #e0e0e0', height: '100%', padding: 10, ...tabs.leftStyle}}>
                        <EditorTabContent tabs={tabs.left} active={left}/>
                    </div>
                    <div style={{overflowY:'auto', width:'50%', height: '100%', padding: 10, ...tabs.rightStyle}}>
                        <EditorTabContent tabs={tabs.right} active={right}/>
                    </div>
                </div>
            </div>
        );
    }

}

export {GenericEditor as default}
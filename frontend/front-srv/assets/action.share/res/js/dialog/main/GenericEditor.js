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
import {Paper, RaisedButton, FlatButton, IconButton, Divider} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

class EditorTab extends React.Component{

    render(){
        const {tabs, active, onChange, style, muiTheme} = this.props;
        const {primary1Color} = muiTheme.palette;
        return(
            <div style={{display:'flex', ...style}}>
                {tabs.map(t => {
                    const isActive = t.Value === active;
                    let label = t.Label;
                    if(t.Icon){
                        label = <span><span className={t.Icon} style={{marginLeft: -5}}/> {t.Label}</span>
                    }
                    return (
                        <FlatButton
                            label={label}
                            onClick={()=>{onChange(t.Value)}}
                            primary={isActive}
                            style={{flex: 1, height:46, lineHeight:'46px', borderBottom: '3px solid ' + (isActive?primary1Color:'transparent')}}
                            labelStyle={{textTransform:'none', fontSize: 15, paddingLeft: 8, paddingRight: 8, color:isActive?primary1Color:'rgba(0,0,0,.3)'}}
                        />)
                })}
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
        if(props.defaultLeft){
            this.state.left = props.defaultLeft;
        }
        if(props.defaultRight){
            this.state.right = props.defaultRight;
        }
    }

    componentWillReceiveProps(props){
        if(!this.props.defaultLeft && props.defaultLeft){
            this.setState({left: props.defaultLeft});
        } else if(!this.state.left && props.tabs.left.length){
            this.setState({left: props.tabs.left[0].Value});
        }
        if(!this.props.defaultRight && props.defaultRight){
            this.setState({right: props.defaultRight});
        } else if(!this.state.right && props.tabs.right.length){
            this.setState({right: props.tabs.right[0].Value});
        }
    }


    render(){

        const {tabs, header, onSaveAction, onCloseAction, onRevertAction, saveEnabled, style, pydio, editorOneColumn} = this.props;
        let {left, right} = this.state;

        if(editorOneColumn){

            let merged = [...tabs.left, ...tabs.right];
            const hasLast = merged.filter(tab => tab.AlwaysLast);
            if(hasLast.length){
                merged = [...merged.filter(tab => !tab.AlwaysLast), ...hasLast];
            }
            if(merged.length && merged.filter(tab => tab.Value === left).length === 0){
                left = merged[0].Value;
            }

            return (
                <div style={{display:'flex', flexDirection:'column', height: '100%', ...style}}>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <div style={{flex: 1, padding: 10}}>{header}</div>
                        <IconButton iconClassName={"mdi mdi-close"} tooltip={pydio.MessageHash['86']} onClick={onCloseAction} style={{marginRight: 10}}/>
                    </div>
                    <div style={{display:'flex'}}>
                        <EditorTab tabs={merged} active={left} style={{flex: 1, padding:'0 16px'}} onChange={(value)=>{this.setState({left:value})}}/>
                    </div>
                    <Divider style={{flexShrink:0, backgroundColor:'#e0e0e0'}}/>
                    <div style={{display:'flex', flex: 1, overflow:'hidden'}}>
                        <div style={{overflowY:'auto', width:'100%', height: '100%', ...tabs.leftStyle}}>
                            <EditorTabContent tabs={merged} active={left}/>
                        </div>
                    </div>
                    <div style={{borderTop: '1px solid #eeeeee', padding:10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                        <FlatButton disabled={!saveEnabled} label={pydio.MessageHash['628']} onClick={onRevertAction} style={{marginLeft: 10}}/>
                        <RaisedButton disabled={!saveEnabled} primary={true} label={pydio.MessageHash['53']} onClick={onSaveAction}/>
                    </div>
                </div>
            );


        } else {

            if(tabs.left && tabs.left.length && tabs.left.filter(tab => tab.Value === left).length === 0){
                left = tabs.left[0].Value;
            }
            if(tabs.right && tabs.right.length && tabs.right.filter(tab => tab.Value === left).length === 0){
                right = tabs.right[0].Value;
            }

            return (
                <div style={{backgroundColor:'#fafafa', display:'flex', flexDirection:'column', height: '100%', ...style}}>
                    <div style={{display:'flex', alignItems:'center', padding: 10, paddingBottom: 0}}>
                        <div style={{flex: 1, alignItems:'center', paddingRight: 20}}>{header}</div>
                        <RaisedButton disabled={!saveEnabled} primary={true} label={pydio.MessageHash['53']} onClick={onSaveAction}/>
                        <FlatButton disabled={!saveEnabled} label={pydio.MessageHash['628']} onClick={onRevertAction} style={{marginLeft: 10}}/>
                        <IconButton iconClassName={"mdi mdi-close"} tooltip={pydio.MessageHash['86']} onClick={onCloseAction} style={{marginLeft: 10}}/>
                    </div>
                    <div style={{display:'flex'}}>
                        <EditorTab tabs={tabs.left} active={left} style={{flex: 1, margin:'0 16px'}} onChange={(value)=>{this.setState({left:value})}}/>
                        <EditorTab tabs={tabs.right} active={right} style={{flex: 1, margin:'0 16px'}}  onChange={(value)=>{this.setState({right:value})}}/>
                    </div>
                    <Divider style={{flexShrink:0, display:'none'}}/>
                    <div style={{display:'flex', flex: 1, overflow:'hidden', padding:'0 5px 5px'}}>
                        <Paper zDepth={1} style={{overflowY:'auto', width:'50%', margin:'0 5px 5px', border:'1px solid #e0e0e0', borderRadius: 5, ...tabs.leftStyle}}>
                            <EditorTabContent tabs={tabs.left} active={left}/>
                        </Paper>
                        <Paper zDepth={1} style={{overflowY:'auto', width:'50%', margin:'0 5px 5px', border:'1px solid #e0e0e0', borderRadius: 5, ...tabs.rightStyle}}>
                            <EditorTabContent tabs={tabs.right} active={right}/>
                        </Paper>
                    </div>
                </div>
            );

        }
    }

}

export {GenericEditor as default}
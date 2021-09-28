/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Fragment} from 'react';
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';

import Pydio from 'pydio'
import {LogLogMessage} from 'cells-sdk'
import {Divider, FontIcon, Paper, IconButton} from 'material-ui'
import Clipboard from 'clipboard'

const {UserAvatar} = Pydio.requireLib('components');

class GenericLine extends React.Component{
    render(){
        const {iconClassName, legend, data, selectable} = this.props;
        const style = {
            icon: {
                margin:'16px 20px 0',
            },
            legend: {
                fontSize: 12,
                color: '#aaaaaa',
                fontWeight: 500,
                textTransform: 'lowercase'
            },
            data: {
                fontSize: 15,
                paddingRight: 6,
                overflow:'hidden',
                textOverflow:'ellipsis',
                userSelect: 'text'
            }
        };
        return (
            <div style={{display:'flex', marginBottom: 8, overflow:'hidden'}}>
                <div style={{width: 64}}>
                    <FontIcon color={'#aaaaaa'} className={iconClassName} style={style.icon}/>
                </div>
                <div style={{flex: 1}}>
                    <div style={style.legend}>{legend}</div>
                    <div style={style.data}>{data}</div>
                </div>
            </div>
        );
    }
}


class LogDetail extends React.Component{

    constructor(props){
        super(props);
        this.state = {copySuccess: false};
    }

    componentDidMount(){
        this.attachClipboard();
    }

    componentWillUnmount(){
        this.detachClipboard();
    }

    attachClipboard(){
        const {log, pydio} = this.props;
        this.detachClipboard();
        if(this.refs['copy-button']){
            this._clip = new Clipboard(ReactDOM.findDOMNode(this.refs['copy-button']), {
                text: function(trigger) {
                    let data = [];
                    Object.keys(log).map(k => {
                        let val = log[k];
                        if(!val) return;
                        if(k === 'RoleUuids') val = val.join(',');
                        data.push(k + ' : ' + val);
                    });
                    return data.join('\n');
                }.bind(this)
            });
            this._clip.on('success', function(){
                this.setState({copySuccess:true}, () => {
                    setTimeout(()=>{this.setState({copySuccess:false})}, 3000)
                });
            }.bind(this));
            this._clip.on('error', function(){}.bind(this));
        }
    }
    detachClipboard(){
        if(this._clip){
            this._clip.destroy();
        }
    }

    focusPeriod(){
        const {onSelectPeriod, log} = this.props;
        const ts = log.Ts;
        onSelectPeriod(ts);
    }

    unfocusPeriod(){
        const {onSelectPeriod, focus} = this.props;
        if(focus){
            onSelectPeriod(null);
        }
    }

    render(){
        const {log, pydio, onRequestClose, onSelectPeriod, style, focus, darkTheme, timeOffset=0, userDisplay = 'avatar'} = this.props;
        const {copySuccess} = this.state;
        const styles = {
            divider: {marginTop: 5, marginBottom:5},
            userLegend: {
                marginTop: -16,
                paddingBottom: 10,
                textAlign: 'center',
                color: '#9E9E9E',
                fontWeight: 500
            },
            buttons: {
                position:'absolute',
                top: 6,
                right: 6,
                display:'flex'
            },
            button: {
                height:36,
                width: 36,
                padding: 8
            },
            buttonIcon: {
                fontSize: 20,
                color:darkTheme?'white':null
            }
        };

        let userLegend;
        if(log.Profile || log.RoleUuids || log.GroupPath){
            let leg = [];
            if(log.Profile) {
                leg.push('Profile: ' + log.Profile);
            }
            if(log.GroupPath) {
                leg.push('Group: ' + log.GroupPath);
            }
            if(log.RoleUuids) {
                leg.push('Roles: ' + log.RoleUuids.join(','));
            }
            userLegend = leg.join(' - ');
        }

        let msg = log.Msg;
        if (log.Level === 'error') {
            msg = <span style={{color: '#e53935'}}>{log.Msg}</span>
        }
        let zaps = {};
        if (log.JsonZaps) {
            const data = JSON.parse(log.JsonZaps)
            Object.keys(data).map(k => {
                zaps[k] = JSON.stringify(data[k])
            });
        }

        return (
            <div style={{fontSize: 13, color:'rgba(0,0,0,.87)', paddingBottom: 10, ...style}}>
                <Paper zDepth={1} style={{backgroundColor: '#f5f5f5', marginBottom: 10, position:'relative'}}>
                    <div style={styles.buttons}>
                        <IconButton style={styles.button} iconStyle={styles.buttonIcon} iconClassName={copySuccess?'mdi mdi-check':'mdi mdi-content-copy'} tooltip={'Copy log to clipboard'} tooltipPosition={"bottom-left"} ref={"copy-button"} />
                        {onSelectPeriod &&
                            <IconButton style={styles.button} iconStyle={{...styles.buttonIcon,color:focus?'#ff5722':styles.buttonIcon.color}} iconClassName={"mdi mdi-clock"} onClick={focus ? this.unfocusPeriod.bind(this) : this.focusPeriod.bind(this)} tooltip={"Show +/- 5 minutes"} tooltipPosition={"bottom-left"}/>
                        }
                        <IconButton style={styles.button} iconStyle={styles.buttonIcon} iconClassName={"mdi mdi-close"} onClick={() => {this.unfocusPeriod(); onRequestClose()}} tooltip={"Close log detail"} tooltipPosition={"bottom-left"}/>
                    </div>
                    {userDisplay === 'avatar' && log.UserName &&
                        <UserAvatar
                            pydio={pydio}
                            userId={log.UserName}
                            richCard={true}
                            displayLabel={true}
                            displayAvatar={true}
                            noActionsPanel={true}
                        />
                    }
                    {userDisplay === "avatar" && userLegend && <div style={styles.userLegend}>{userLegend}</div>}
                </Paper>
                {log.UserName && userDisplay === 'inline' &&
                <Fragment>
                    <GenericLine iconClassName={"mdi mdi-account"} legend={"User"} data={log.UserName} />
                    {userLegend &&
                        <GenericLine iconClassName={"mdi mdi-account-multiple"} legend={"User Attributes"} data={userLegend}/>
                    }
                    <Divider style={styles.divider}/>
                </Fragment>
                }
                <GenericLine iconClassName={"mdi mdi-calendar"} legend={"Event Date"} data={new Date((log.Ts+timeOffset) * 1000).toLocaleString()}/>
                <GenericLine iconClassName={"mdi mdi-comment-text"} legend={"Event Message"} data={msg} />
                <GenericLine iconClassName={"mdi mdi-server-network"} legend={"Service"} data={log.Logger} />

                {(log.RemoteAddress  || log.UserAgent || log.HttpProtocol) &&
                    <Divider style={styles.divider}/>
                }
                {log.RemoteAddress && <GenericLine iconClassName={"mdi mdi-cast-connected"} legend={"Connection IP"} data={log.RemoteAddress} />}
                {log.UserAgent && <GenericLine iconClassName={"mdi mdi-cellphone-link"} legend={"User Agent"} data={log.UserAgent} />}
                {log.HttpProtocol && <GenericLine iconClassName={"mdi mdi-open-in-app"} legend={"Protocol"} data={log.HttpProtocol} />}
                {log.NodePath &&
                <Fragment>
                    <Divider style={styles.divider}/>
                    <GenericLine iconClassName={"mdi mdi-file-tree"} legend={"File/Folder"} data={log.NodePath} />
                    <GenericLine iconClassName={"mdi mdi-folder-open"} legend={"In Workspace"} data={log.WsUuid} />
                </Fragment>
                }
                {Object.keys(zaps).length > 0 &&
                <Fragment>
                    <Divider style={styles.divider}/>
                    {Object.keys(zaps).map(k => <GenericLine iconClassName={"mdi mdi-tag"} legend={k} data={zaps[k]}/>)}
                </Fragment>
                }
            </div>
        );
    }

}

LogDetail.PropTypes = {
    pydio: PropTypes.instanceOf(Pydio),
    log: PropTypes.instanceOf(LogLogMessage)
};

export {LogDetail as default}
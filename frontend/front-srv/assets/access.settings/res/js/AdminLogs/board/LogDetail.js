import React from 'react'
import Pydio from 'pydio'
import {LogLogMessage} from 'pydio/http/rest-api'
import {Divider, FontIcon, Paper, IconButton} from 'material-ui'
import Clipboard from 'clipboard'

const {UserAvatar} = Pydio.requireLib('components');

class GenericLine extends React.Component{
    render(){
        const {iconClassName, legend, data} = this.props;
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
                textOverflow:'ellipsis'
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
            this._clip = new Clipboard(this.refs['copy-button'], {
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

    render(){
        const {log, pydio, onRequestClose} = this.props;
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
                top: 0,
                right: 0,
                display:'flex'
            },
            copyButton: {
                cursor: 'pointer',
                display: 'inline-block',
                fontSize: 18,
                padding: 14,
            }
        };

        let userLegend;
        if(log.Profile || log.RoleUuids || log.GroupPath){
            let leg = [];
            if(log.Profile) leg.push('Profile: ' + log.Profile);
            if(log.GroupPath) leg.push('Group: ' + log.GroupPath);
            if(log.RoleUuids) leg.push('Roles: ' + log.RoleUuids.join(','));
            userLegend = leg.join(' - ');
        }

        let msg = log.Msg;
        if (log.Level === 'error') {
            msg = <span style={{color: '#e53935'}}>{log.Msg}</span>
        }

        return (
            <div style={{fontSize: 13, color:'rgba(0,0,0,.87)', paddingBottom: 10}}>
                <Paper zDepth={1} style={{backgroundColor: '#f5f5f5', marginBottom: 10, position:'relative'}}>
                    <div style={styles.buttons}>
                        <span ref={"copy-button"} style={styles.copyButton} className={copySuccess?'mdi mdi-check':'mdi mdi-content-copy'} title={'Copy log to clipboard'}/>
                        <IconButton iconClassName={"mdi mdi-close"} onTouchTap={onRequestClose}/>
                    </div>
                    {log.UserName &&
                        <UserAvatar
                            pydio={pydio}
                            userId={log.UserName}
                            richCard={true}
                            displayLabel={true}
                            displayAvatar={true}
                            noActionsPanel={true}
                        />
                    }
                    {userLegend && <div style={styles.userLegend}>{userLegend}</div>}
                </Paper>
                <GenericLine iconClassName={"mdi mdi-calendar"} legend={"Event Date"} data={new Date(log.Ts * 1000).toLocaleString()}/>
                <GenericLine iconClassName={"mdi mdi-comment-text"} legend={"Event Message"} data={msg} />
                <GenericLine iconClassName={"mdi mdi-server-network"} legend={"Service"} data={log.Logger} />

                {(log.RemoteAddress  || log.UserAgent || log.HttpProtocol) &&
                    <Divider style={styles.divider}/>
                }
                {log.RemoteAddress && <GenericLine iconClassName={"mdi mdi-cast-connected"} legend={"Connection IP"} data={log.RemoteAddress} />}
                {log.UserAgent && <GenericLine iconClassName={"mdi mdi-cellphone-link"} legend={"User Agent"} data={log.UserAgent} />}
                {log.HttpProtocol && <GenericLine iconClassName={"mdi mdi-open-in-app"} legend={"Protocol"} data={log.HttpProtocol} />}
                {log.NodePath &&
                <div>
                    <Divider style={styles.divider}/>
                    <GenericLine iconClassName={"mdi mdi-file-tree"} legend={"File/Folder"} data={log.NodePath} />
                    <GenericLine iconClassName={"mdi mdi-folder-open"} legend={"In Workspace"} data={log.WsUuid} />
                </div>
                }
            </div>
        );
    }

}

LogDetail.PropTypes = {
    pydio: React.PropTypes.instanceOf(Pydio),
    log: React.PropTypes.instanceOf(LogLogMessage)
};

export {LogDetail as default}
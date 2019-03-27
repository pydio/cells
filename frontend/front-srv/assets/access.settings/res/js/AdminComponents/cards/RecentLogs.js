import {Component} from 'react'
import {Paper, IconMenu, MenuItem, IconButton, List, ListItem, FlatButton} from 'material-ui'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import {RestLogMessageCollection, LogListLogRequest, ListLogRequestLogFormat} from 'pydio/http/rest-api';
import ReloadWrapper from '../util/ReloadWrapper'
import ResourcesManager from 'pydio/http/resources-manager'

const {asGridItem} = Pydio.requireLib('components');
const {PydioContextConsumer} = Pydio.requireLib('boot');

class RecentLogs extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {filter:'', logs: []}
    }

    loadLogs(){
        ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
            const api = new sdk.EnterpriseLogServiceApi(PydioApi.getRestClient());
            let request = new LogListLogRequest();
            request.Query = '';
            request.Page = 0;
            request.Size = 20;
            request.Format = ListLogRequestLogFormat.constructFromObject('JSON');
            api.audit(request).then(result => {
                if(result.Logs){
                    this.setState({logs: result.Logs});
                }
            })
        });
    }

    componentDidMount(){
        this.loadLogs();
    }

    changeFilter(value){
        this.setState({filter:value});
    }

    triggerReload(){
        this.loadLogs();
    }

    render(){

        const {logs, filter} = this.state;

        const iconMenuItems = [
            {payload:'', text:this.props.getMessage('home.33')},
            {payload:'error', text:this.props.getMessage('home.34')}
        ];

        const dropDown = (
            <div style={{position:'absolute', right:0, top: 8}}>
                <IconMenu
                    value={filter}
                    onChange={this.changeFilter.bind(this)}
                    anchorOrigin={{horizontal:'right', vertical:'top'}}
                    targetOrigin={{horizontal:'right', vertical:'top'}}
                    iconButtonElement={<IconButton iconClassName="mdi mdi-filter" iconStyle={{color: '#9e9e9e'}} />}
                >{iconMenuItems.map((item) => <MenuItem primaryText={item.text} onTouchTap={() => {this.changeFilter(item.payload)}}/> )}</IconMenu>
            </div>
        );

        const style = {
            ...this.props.style,
            display:'flex',
            flexDirection:'column'
        };

        return (
            <Paper {...this.props} zDepth={1} transitionEnabled={false} style={style}>
                {this.props.closeButton}
                {dropDown}
                <h4>{this.props.getMessage('home.32')}</h4>
                <List style={{flex: 1, overflowY: 'auto'}}>
                    {logs.map(line => {
                        if(filter && line.Level !== filter) {
                            return null;
                        }

                        let sec = (line.UserName ? "By " + line.UserName : "From " + line.RemoteAddress )+ " at " + new Date(line.Ts * 1000).toLocaleTimeString();
                        return <ListItem primaryText={line.Msg} secondaryText={sec}/>
                    })}
                </List>
            </Paper>
        );

    }

}

const globalMessages = global.pydio.MessageHash;

RecentLogs = PydioContextConsumer(ReloadWrapper(RecentLogs));
RecentLogs = asGridItem(
    RecentLogs,
    globalMessages['ajxp_admin.home.32'],
    {gridWidth:3,gridHeight:26},
    [{name:'interval',label:globalMessages['ajxp_admin.home.18'], type:'integer', default:120}]
);

RecentLogs.displayName = 'RecentLogs';
export {RecentLogs as default}
import React from "react"
import PydioApi from "pydio/http/api";
import ResourcesManager from 'pydio/http/resources-manager'
import {Paper} from 'material-ui'
import {LogListLogRequest, ListLogRequestLogFormat} from 'pydio/http/rest-api';
const {MaterialTable} = Pydio.requireLib('components');
const {moment} = Pydio.requireLib('boot');

class UserActivity extends React.Component{

    constructor(props){
        super(props);
        this.state = {activity:[], loading: false};
    }

    componentDidMount(){
        this.loadActivity();
    }

    loadActivity(){

        const {user} = this.props;
        return ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {

            let request = new LogListLogRequest();
            request.Query = "+UserUuid:\"" + user.getIdmUser().Uuid + "\"";
            request.Page = 0;
            request.Size = 50;
            request.Format = ListLogRequestLogFormat.constructFromObject('JSON');
            const api = new sdk.EnterpriseLogServiceApi(PydioApi.getRestClient());
            this.setState({loading: true});
            api.audit(request).then(response => {
                this.setState({activity:response.Logs || [], loading: false})
            }).catch(()=>{
                this.setState({activity:[], loading: false})
            });

        });
    }

    render(){
        const {pydio} = this.props;
        const {activity, loading} = this.state;
        const columns = [
            {name:'Ts', label:pydio.MessageHash['settings.17'], style:{width: '25%'}, headerStyle:{width: '25%'}, renderCell:(row=>{
                    return moment(row.Ts * 1000).fromNow();
            })},
            {name:'Msg', label:pydio.MessageHash['ajxp_admin.logs.message']}
        ];
        return (
            <div className="vertical-layout" style={{height:'100%'}}>
                <h3 className="paper-right-title">{pydio.MessageHash['ajxp_admin.ws.33']}
                    <div className="section-legend">See Dashboard > Activity and use the filter to get more activity for this user</div>
                </h3>
                <Paper style={{margin:16}} zDepth={1} className="workspace-activity-block layout-fill vertical-layout">
                <MaterialTable
                    columns={columns}
                    data={activity}
                    showCheckboxes={false}
                    emptyStateString={'No activity found'}
                />
                </Paper>
            </div>
        )
    }

}

export {UserActivity as default}
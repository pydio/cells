import React from "react"
import Pydio from 'pydio'
import PydioApi from "pydio/http/api";
import ResourcesManager from 'pydio/http/resources-manager'
import {Paper} from 'material-ui'
import {LogListLogRequest, ListLogRequestLogFormat} from 'cells-sdk';

const {MaterialTable} = Pydio.requireLib('components');
const {moment} = Pydio.requireLib('boot');

class TaskActivity extends React.Component{

    constructor(props){
        super(props);
        this.state = {activity:[], loading: false};
    }

    T(id){
        return this.props.pydio.MessageHash['migration.' + id] || id;
    }

    componentDidMount(){
        this.loadActivity(this.props);
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.task){
            this.loadActivity(nextProps);
        }
        if(nextProps.task && this.props.task && nextProps.task.ID !== this.props.task.ID){
            this.loadActivity(nextProps);
        }
    }

    loadActivity(props){

        const {task} = props;
        if(!task){
            return;
        }
        const operationId = task.JobID + '-' + task.ID.substr(0, 8);
        return ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {

            let request = new LogListLogRequest();
            request.Query = "+OperationUuid:\"" + operationId + "\"";
            request.Page = 0;
            request.Size = 100;
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
        const {pydio, task, styles} = this.props;
        const {activity} = this.state;
        const columns = [
            {name:'Ts', label:pydio.MessageHash['settings.17'], style:{width: '25%'}, headerStyle:{width: '25%'}, renderCell:(row=>{
                    return moment(row.Ts * 1000).fromNow();
                })},
            {name:'Msg', label:pydio.MessageHash['ajxp_admin.logs.message']}
        ];
        return (
            <div className="vertical-layout" style={{height:'100%'}}>
                <div style={{...styles.body.block.headerFull}}>{this.T('logs.legend').replace("%s", task.ID)}</div>
                <div className="layout-fill vertical-layout">
                    <MaterialTable
                        columns={columns}
                        data={activity}
                        showCheckboxes={false}
                        emptyStateString={this.T('logs.empty')}
                    />
                </div>
            </div>
        )
    }

}

export {TaskActivity as default}
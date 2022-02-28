import React from "react"
import Pydio from 'pydio'
import LangUtils from 'pydio/util/lang'
import {Paper, Divider, SelectField, MenuItem, LinearProgress, Stepper} from 'material-ui'
import {JobsJob, JobsTask} from 'cells-sdk'
const {JobsStore, moment} = Pydio.requireLib("boot");
const {ModernSelectField} = Pydio.requireLib('hoc');

import StepEmptyConfig from './steps/StepEmptyConfig'
import StepConnection from './steps/StepConnection'
import StepCategories from './steps/StepCategories'
import StepMetadata from './steps/StepMetadata'
import StepShares from './steps/StepShares'
import StepWorkspaces from './steps/StepWorkspaces'
import StepPrequisites from './steps/StepPrerequisites'
import StepDisclaimer from './steps/StepDisclaimer'
import TaskActivity from './TaskActivity'

import * as Actions from './actions/actions'

const styles = {
    stepLegend:{color: '#757575', padding:'6px 0'}
};

export default class Dashboard extends React.Component {

    _observer;

    constructor(props){
        super(props);

        const features = {
            // configs: {label:this.T('feature.configs'), value: false, action: Actions.getConfigsAction},
            users: {label:this.T('feature.users'), value: false, action: Actions.getUsersAction},
            workspaces:{label:this.T('feature.workspaces'), value: false, action: Actions.getWorkspacesAction, summary: Actions.getWorkspacesSummary},
            acls:{label:this.T('feature.acls'), value: false, action: Actions.getAclsAction, depends:'workspaces'},
            metadata:{label:this.T('feature.meta'), value: false, action: Actions.getMetadataAction, summary: Actions.getMedataSummary, depends:'workspaces'},
            shares:{label:this.T('feature.shares'), value: false, action: Actions.getSharesAction, summary: Actions.getSharesSummary, depends: 'workspaces'},
        };
        /*
            if(!props.advanced){
                delete features.configs;
            }
         */

        this.state = {
            activeStep: 0,
            url: "",
            user:"importer",
            pwd: "",
            cellAdmin:props.pydio.user.id,
            skipVerify: false,
            features: features,
            workspaces: [],
            workspaceMapping: {},
            localStatus:[],
            previousTasks:[],
            showLogs: null,
        };
    }

    T(id){
        return this.props.pydio.MessageHash['migration.dash.' + id] || this.props.pydio.MessageHash['migration.' + id] || id;
    }

    loadPreviousTasks(){
        JobsStore.getInstance().getAdminJobs(null, null, "pydio8-data-import", 20).then(response => {
            if(response.Jobs && response.Jobs.length){
                const tasks = response.Jobs[0].Tasks || [];
                tasks.sort(LangUtils.arraySorter('StartTime'));
                tasks.reverse();
                this.setState({previousTasks:tasks});
            }
        });
    }

    componentDidMount(){
        const {pydio} = this.props;
        this._observer = jsonObject => {
            const {Job, TaskUpdated} = jsonObject;
            const job = JobsJob.constructFromObject(Job);
            if (job.ID === 'pydio8-data-import') {
                const task = JobsTask.constructFromObject(TaskUpdated);
                this.setState({job: job, task: task});
            }
        };
        pydio.observe("task_message", this._observer);
        this.loadPreviousTasks();
    }

    componentWillUnmount(){
        if(this._observer){
            const {pydio} = this.props;
            pydio.stopObserving("task_message", this._observer);
            this._observer = null;
        }
    }

    render(){

        const {pydio, openRightPane, closeRightPane, advanced, currentNode} = this.props;
        const {activeStep, url, skipVerify, user, pwd, features, task, showLogs, localStatus, previousTasks, ...remainingState} = this.state;
        const adminStyles = AdminComponents.AdminStyles();

        const previousJobsSelector = (
            <ModernSelectField fullWidth={true} value={showLogs} onChange={(e,i,v) => {this.setState({showLogs:v})}}>
                <MenuItem value={null} primaryText={this.T('job.new')}/>
                {previousTasks.length > 0 && <Divider/> }
                {previousTasks.map((t) => {
                    let label;
                    if(t.EndTime){
                        label= t.Status + ' ' + moment(new Date(t.EndTime*1000)).fromNow();
                    } else {
                        label= t.Status + ' ' + moment(new Date(t.StartTime*1000)).fromNow();
                    }
                    return <MenuItem label={label} primaryText={label} value={t}/>
                })}
            </ModernSelectField>
        );

        let content;
        if(showLogs){
            content = (
                <Paper {...adminStyles.body.block.props}>
                    <TaskActivity pydio={pydio} task={showLogs} styles={adminStyles}/>
                </Paper>
            )
        } else {

            const commonProps = {
                pydio,
                onBack: ()=> this.setState({activeStep: activeStep - 1}),
                onComplete:()=> this.setState({activeStep: activeStep + 1}),
                onChange:(params)=> this.setState(params),
                url,
                skipVerify,
                user,
                pwd,
                styles,
                hasRunning: task && task.Status === 'Running'
            };

            content = (
                <Paper {...adminStyles.body.block.props} style={{...adminStyles.body.block.container, paddingBottom: 16}}>
                    <Stepper style={{display:'flex'}} orientation="vertical" activeStep={activeStep}>
                        <StepDisclaimer {...commonProps} onBack={null} advanced={advanced}/>

                        <StepPrequisites {...commonProps} onBack={null} advanced={advanced}/>

                        <StepConnection {...commonProps} url={url} skipVerify={skipVerify} user={user} pwd={pwd}/>

                        <StepCategories {...commonProps} features={features}
                            onChange={(newFeatures) => this.setState({features: {
                                    ...features,
                                    ...newFeatures
                                }})}
                        />

                        {Object.keys(features).filter((k) => k === "configs" && features[k].value).map((k) => (
                            <StepEmptyConfig
                                {...commonProps}
                                title={this.T('feature.configs')}
                                legend={this.T('feature.configs.legend')}
                                style={{flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0'}}
                            />
                        ))}

                        {Object.keys(features).filter((k) => k === "users" && features[k].value).map((k) => (
                            <StepEmptyConfig
                                {...commonProps}
                                title={this.T('feature.users')}
                                legend={this.T('feature.users.legend')}
                                style={{flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0'}}
                            />
                        ))}

                        {Object.keys(features).filter((k) => k === "workspaces" && features[k].value).map((k) => (
                            <StepWorkspaces
                                {...commonProps}
                                style={{flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0'}}
                                openRightPane={openRightPane}
                                closeRightPane={closeRightPane}
                            />
                        ))}

                        {Object.keys(features).filter((k) => k === "acls" && features[k].value).map((k) => (
                            <StepEmptyConfig
                                {...commonProps}
                                title={this.T('feature.acls')}
                                legend={this.T('feature.acls.legend')}
                                style={{flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0'}}
                            />
                        ))}

                        {Object.keys(features).filter((k) => k === "metadata" && features[k].value).map((k) => (
                            <StepMetadata {...commonProps} style={{flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0'}} />
                        ))}

                        {Object.keys(features).filter((k) => k === "shares" && features[k].value).map((k) => (
                            <StepShares {...commonProps} style={{flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0'}} />
                        ))}

                        <StepCategories {...commonProps} features={features} summary={true} summaryState={this.state}
                            {...remainingState}
                            onComplete={() => {
                                this.setState({localStatus:[]}, ()=> {
                                    Actions.startJob(this.state, (localUpdate)=>{
                                        this.setState({localStatus:[...localStatus, localUpdate]})
                                    });
                                    setTimeout(()=>{this.loadPreviousTasks()}, 1000);
                                });
                            }}
                        />
                    </Stepper>
                </Paper>
            );
        }

        return (
            <div className="main-layout-nav-to-stack workspaces-board">
                <div className="vertical-layout" style={{width:'100%'}}>
                    <AdminComponents.Header
                        title={this.T('title')}
                        icon={currentNode.getMetadata().get('icon_class')}
                        actions={[previousJobsSelector]}
                    />

                    <div className="layout-fill">
                        {(task || localStatus.length > 0) &&
                        <Paper {...adminStyles.body.block.props}>
                            <div style={adminStyles.body.block.headerFull}>{this.T('importing')}</div>
                            <div style={{padding:16}}>
                                {localStatus.length > 0 &&
                                <div>{localStatus.map(x => <div>{x}</div>)}</div>
                                }
                                {task &&
                                <div>
                                    <h6>{task.StatusMessage}</h6>
                                    {task.Status !== "Finished" &&
                                    <LinearProgress mode="determinate" min={0} max={100} value={(task.Progress || 0) * 100} style={{width:'100%'}} />
                                    }
                                </div>
                                }
                            </div>
                        </Paper>
                        }

                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

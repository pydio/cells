import React from 'react'
import {Step, StepLabel, StepContent, RaisedButton, Paper, TextField, Checkbox, CircularProgress} from 'material-ui'
import Loader from "../workspaces/Loader";
import WorkspaceMapper from "../workspaces/Mapper";
import Pydio from 'pydio'

class StepWorkspaces extends React.Component {

    _loader;

    constructor(props) {
        super(props);
        this._loader = new Loader();

        this.state = {
            loaded: false,
            workspaces: [],
            cellsWorkspaces: [],
        }
    }

    T(id){
        const m = Pydio.getInstance().MessageHash;
        return m['migration.step.ws.' + id] || m['migration.' + id] || m[id] || id;
    }

    componentDidMount(){
        const {url, user, pwd} = this.props;
        AdminWorkspaces.Workspace.listWorkspaces().then(wsResponse => {
            this.setState({cellsWorkspaces:wsResponse.Workspaces || []});
        }).then(()=>{
            this._loader.loadWorkspaces(url, user, pwd).catch(err => {
                this.setState({err, loaded: true})
            }).then(workspaces => {
                this.setState({workspaces, loaded: true});
            })
        });
    }

    startListeningToJob() {
        this._loader = new Loader();
        this._loader.observe('progress', (memo) => {
            this.setState({workspacesProgress: memo});
        });
    }


    render() {
        const {onChange, onComplete, onBack, openRightPane, closeRightPane, pydio, styles} = this.props;
        const {workspaces, cellsWorkspaces, loaded} = this.state;

        if(!loaded) {
            return(
                <Step {...this.props}>
                    <StepLabel>{this.T('title')} {this.T('loading')}</StepLabel>
                    <StepContent>
                        <div style={{textAlign:'center', padding: 40}}>
                            <CircularProgress mode={"indeterminate"}/>
                        </div>
                    </StepContent>
                </Step>
            );
        }

        return (
            <Step {...this.props}>
                <StepLabel>{this.T('title')}</StepLabel>
                <StepContent>
                    <div style={styles.stepLegend}>
                        {this.T('legend')}
                        <ul>
                            <li>{this.T('step1')}</li>
                            <li>{this.T('step2')}</li>
                            <li>{this.T('step3')}</li>
                            <li>{this.T('step4')}</li>
                        </ul>
                    </div>
                    <WorkspaceMapper
                        cellsWorkspaces={cellsWorkspaces}
                        workspaces={workspaces.filter((ws) => (ws.accessType === 'fs' || ws.accessType === 's3') && !ws.isTemplate)}
                        onBack={() => onBack()}
                        pydio={pydio}
                        openRightPane={openRightPane}
                        closeRightPane={closeRightPane}
                        onMapped={(data) => {
                            const {mapping, create, existing} = data;
                            onChange({workspaceMapping: mapping, workspaceCreate:create, workspaceExisting:existing});
                            onComplete()
                        }}
                    />
                </StepContent>
            </Step>
        )
    }
}

export {StepWorkspaces as default}
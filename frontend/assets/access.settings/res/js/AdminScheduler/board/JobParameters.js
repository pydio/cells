/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import {MenuItem, Dialog, FlatButton, FontIcon} from 'material-ui'
const {ModernTextField, ModernSelectField} = Pydio.requireLib('hoc');

import {JobsJob, JobsJobParameter} from 'cells-sdk'

class Parameter extends React.Component{

    constructor(props){
        super(props);
    }

    render() {
        let {parameter, onChange, m, checkMandatory} = this.props;
        const blockStyle={margin:'0 5px'};
        let choices = {};
        let type = parameter.Type;
        try{
            choices = JSON.parse(parameter.JsonChoices);
            if(choices.type) {
                type = choices.type
            }
        }catch(e){}
        const errorText = (checkMandatory && parameter.Mandatory && (parameter.Value === undefined || parameter.Value === '')) ? (parameter.Description || '!!') : undefined
        return (
            <div style={{display:'flex', alignItems:'center'}}>
                <div style={{...blockStyle,fontSize:15, width: 120, minWidth: 120}}>
                    {parameter.Name} {parameter.Mandatory && checkMandatory && "*"}
                </div>
                <div style={{...blockStyle, width: 200, minWidth: 200}}>
                    {type === 'select' &&
                    <ModernSelectField fullWidth={true} errorText={errorText} value={parameter.Value} onChange={(e,i,v) => {onChange({...parameter, Value: v})}}>
                        {Object.keys(choices).map(k => {
                            return <MenuItem value={k} primaryText={choices[k]}/>
                        })}
                    </ModernSelectField>
                    }
                    {type === 'text' &&
                    <ModernTextField fullWidth={true} errorText={errorText} value={parameter.Value} onChange={(e,v) => {onChange({...parameter, Value: v})}}/>
                    }
                    {type === 'integer' &&
                    <ModernTextField fullWidth={true} errorText={errorText} value={parseInt(parameter.Value)} type={"number"} onChange={(e,v) => {onChange({...parameter, Value: parseInt(v)})}}/>
                    }
                    {type === 'boolean' &&
                    <ModernSelectField fullWidth={true} errorText={errorText} value={parameter.Value} onChange={(e,i,v) => {onChange({...parameter, Value: v})}}>
                        <MenuItem value={"true"} primaryText={Pydio.getMessages()[440]}/>
                        <MenuItem value={"false"} primaryText={Pydio.getMessages()[441]}/>
                    </ModernSelectField>
                    }
                </div>
                <div style={{...blockStyle, color:'#bdbdbd', fontWeight: 500, fontSize: 13, fontStyle:'italic', userSelect:'text', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {parameter.Description}
                    {parameter.Description && " "}
                </div>
            </div>
        );
    }

}

class JobParameters extends React.Component {

    constructor(props){
        super(props);
        this.state = {open: false};
        if(props.prompts) {
            this.state.parameters = [...props.prompts]
        }
    }

    m(id){
        const pydio = Pydio.getInstance();
        return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id
    }


    changeParam(index, newParam) {
        const {job} = this.props;
        const {parameters} = this.state;
        const params = parameters || job.Parameters;
        const pp = params.map((p,i) => i === index ? JobsJobParameter.constructFromObject(JSON.parse(JSON.stringify(newParam)))  : p);
        this.setState({parameters: pp});
    }

    save() {
        const {job, onUpdate = ()=>{}} = this.props;
        const {parameters} = this.state;
        job.Parameters = parameters;
        ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
            const {SchedulerServiceApi, JobsPutJobRequest} = sdk;
            const api = new SchedulerServiceApi(PydioApi.getRestClient());
            const req = new JobsPutJobRequest();
            // Clone and remove tasks
            req.Job = JobsJob.constructFromObject(JSON.parse(JSON.stringify(job)));
            if(req.Job.Tasks !== undefined){
                delete req.Job.Tasks;
            }
            api.putJob(req).then(()=>{
                onUpdate();
                this.setState({open: false, parameters: null, rand:Math.random()});
            }).catch(e => {})
        }).catch(e => {
            console.error('Cannot load specific library', e)
        })
    }

    render(){
        const {job, prompts, onSubmit, onClose, checkMandatory} = this.props;
        const {open, parameters} = this.state;
        const pp = parameters || job.Parameters;
        const missings = checkMandatory && checkMandatory(pp)

        return (
            <React.Fragment>
                {!prompts &&
                    <FlatButton primary={true} icon={<FontIcon className={"mdi mdi-playlist-check"}/>} label={Pydio.getMessages()['ajxp_admin.scheduler.job-parameters.button']} onClick={()=>this.setState({open: true})}/>
                }
                <Dialog
                    title={Pydio.getMessages()['ajxp_admin.scheduler.job-parameters.dialog']}
                    open={open || prompts}
                    modal={true}
                    onRequestClose={() => this.setState({open: false})}
                    actions={[
                        <FlatButton label={Pydio.getMessages()[54]} onClick={()=> onClose ? onClose() : this.setState({open: false})}/>,
                        <FlatButton label={Pydio.getMessages()[onSubmit?48:53]} onClick={() => onSubmit? onSubmit(pp):this.save()} disabled={!parameters||missings}/>,
                    ]}
                >
                    <div>
                        {pp.map((p,i) => <Parameter
                            key={p.Name || "p-" + i}
                            onChange={(v)=>{this.changeParam(i, v)}}
                            parameter={p}
                            m={this.m.bind(this)}
                            checkMandatory={checkMandatory}
                        />)}
                    </div>
                </Dialog>
            </React.Fragment>

        );

    }

}

export default JobParameters
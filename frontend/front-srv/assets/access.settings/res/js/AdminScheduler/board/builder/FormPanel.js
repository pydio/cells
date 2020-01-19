import React from 'react'
import Pydio from 'pydio'
import {MenuItem, Paper, RaisedButton, SelectField, Subheader} from 'material-ui'
import {RightPanel} from './styles'
import {JOB_ACTION_EMPTY} from "../actions/editor";
import FormLoader from './FormLoader'
import {ConfigServiceApi, JobsAction, JobsJob, RestConfiguration} from 'pydio/http/rest-api'

const PydioForm = Pydio.requireLib('form');
const {ModernSelectField, ModernTextField} = Pydio.requireLib('hoc');

class FormPanel extends React.Component {

    constructor(props){
        super(props);
        const {action} = props;
        this.state = {
            action: JobsAction.constructFromObject(JSON.parse(JSON.stringify(action))),
            actionInfo: this.getActionInfo(action),
            valid: true
        };
    }

    getActionInfo(action){
        const {actions} = this.props;
        let actionInfo;
        if(actions[action.ID]) {
            actionInfo = actions[action.ID];
            if (actionInfo.HasForm) {
                this.loadForm(action.ID);
            }
        } else if (action.ID === JOB_ACTION_EMPTY){
            actionInfo = {
                Name: JOB_ACTION_EMPTY,
                Label: 'Create Action',
                Icon: 'chip',
                Description:''
            }
        } else {
            actionInfo = {
                Name: action.ID,
                Label: action.ID,
                Icon: 'chip',
                Description:'No description provided'
            }
        }
        return actionInfo;
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.action !== this.state.action || nextProps.create !== this.props.create) {
            this.setState({
                action: JobsAction.constructFromObject(JSON.parse(JSON.stringify(nextProps.action))),
                actionInfo: this.getActionInfo(nextProps.action),
                formParams: null
            })
        }
    }

    loadForm(actionID){
        FormLoader.loadAction(actionID).then((params) => {
            this.setState({formParams: params});
            const {create} = this.props;
            if(create){
                const defaults = {};
                params.forEach(p => {
                    if(p.default) {
                        defaults[p.name] = p.default;
                    }
                });
                if(Object.keys(defaults).length){
                    this.onFormChange(defaults);
                }
            }
        })
    }

    /**
     * Convert standard json to map[string]string for Parameters field
     * @param params
     */
    toStringString(params = {}){
        const map = {};
        Object.keys(params).forEach(k => {
            const value = params[k];
            let v;
            switch (typeof value) {
                case 'string':
                   v = value;
                   break;
                case 'number':
                    v = '' + value;
                    break;
                case 'boolean':
                    v = value ? 'true' : 'false';
                    break;
                default:
                    v = '' + value;
            }
            map[k] = v;
        });
        return map;
    }

    /**
     * Convert map[string]string to form usable parameters
     * @param params
     * @param map
     */
    fromStringString(params, map = {}) {
        if(!map){
            map = {};
        }
        const values = {};
        params.forEach(p => {
            if(map[p.name]){
                if(p.type === 'boolean') {
                    values[p.name] = map[p.name] === 'true';
                }else if(p.type === 'integer') {
                    values[p.name] = parseInt(map[p.name])
                } else {
                    values[p.name] = map[p.name];
                }
            }
        });
        return values;
    }

    onFormChange(values){
        const {action} = this.state;
        action.Parameters = this.toStringString(values);
        this.setState({action, dirty: true});
    }

    onLabelChange(value){
        const {action} = this.state;
        action.Label = value ? value.substr(0, 20) : undefined;
        this.setState({action, dirty: true});
    }

    onDescriptionChange(value){
        const {action} = this.state;
        action.Description = value;
        this.setState({action, dirty: true});
    }

    onValidStatusChange(valid, failing){
        this.setState({valid});
    }

    onIdChange(id){
        const {action} = this.state;
        action.ID = id;
        // Refresh state
        const newActionInfo = this.getActionInfo(action);
        if(!newActionInfo.HasForm){
            this.setState({formParams: null, valid: true});
        }
        this.setState({
            action,
            actionInfo: newActionInfo
        })
    }

    actionPicker(){
        const {actions} = this.props;
        const {action} = this.state;
        // Group by categories and sort
        const categs = {};
        Object.keys(actions).forEach(id => {
            const c = actions[id].Category || 'No category';
            if(!categs[c]){
                categs[c] = [];
            }
            categs[c].push(actions[id]);
        });
        let options = [];
        const cKeys = Object.keys(categs);
        cKeys.sort();
        cKeys.forEach(c => {
            options.push(<Subheader>{c}</Subheader>);
            categs[c].sort((a,b) => {return a.Label > b.Label ? 1 : -1 });
            categs[c].forEach(a => {
                options.push(<MenuItem primaryText={a.Label || a.Name} value={a.Name}/>)
            })
        });
        return (
            <ModernSelectField
                fullWidth={true}
                value={action.ID}
                onChange={(ev, i, value) => {
                    this.onIdChange(value);
                }}
            >{[<MenuItem value={JOB_ACTION_EMPTY} primaryText={"Please pick an action"}/>, ...options]}
            </ModernSelectField>
        )
    }

    save(){
        const {onChange, onDismiss} = this.props;
        const {action} = this.state;
        onChange(action);
        this.setState({dirty: false});
        //onDismiss();
    }

    revert(){
        const original = this.props.action;
        this.setState({
            action: JobsAction.constructFromObject(JSON.parse(JSON.stringify(original))),
            dirty: false
        })
    }

    render(){

        const {onDismiss, onRemove, create} = this.props;
        const {actionInfo, action, formParams, dirty, valid} = this.state;
        let save, revert;
        if(!create && dirty && valid) {
            save = () => this.save();
            revert = () => this.revert();
        }
        let form;
        if(formParams && formParams.length && formParams[0].type === 'textarea' && formParams[0].choices==='json:content-type:text/go'){
            //Switch to CodeMirror component
            let value = '';
            if(action.Parameters && action.Parameters[formParams[0].name]){
                value = action.Parameters[formParams[0].name];
            }
            form= (
                <div style={{border: '1px solid #e0e0e0', margin: '0 10px', borderRadius: 3}}>
                    <AdminComponents.CodeMirrorField
                        value={value}
                        onChange={(e, v) => {
                            const values = {};
                            values[formParams[0].name] = v;
                            this.onFormChange(values);
                            this.setState({valid: !!v});
                        }}
                    />
                </div>
            );
        } else if (formParams) {
            form = (
                <div>
                    <PydioForm.FormPanel
                        ref="formPanel"
                        depth={-1}
                        parameters={formParams}
                        values={this.fromStringString(formParams, action.Parameters)}
                        onChange={this.onFormChange.bind(this)}
                        onValidStatusChange={this.onValidStatusChange.bind(this)}
                    />
                </div>
            )

        }
        return (
            <RightPanel
                title={actionInfo.Label}
                icon={actionInfo.Icon}
                onDismiss={onDismiss}
                saveButtons={!create}
                onSave={save}
                onRevert={revert}
                onRemove={onRemove}
            >
                {create && <div style={{padding: 10}}>{this.actionPicker()}</div>}
                <div style={{padding: 10}}>{actionInfo.Description}</div>
                {form}
                {action.ID !== JOB_ACTION_EMPTY &&
                    <div style={{padding: '0 12px', marginTop: -6}}>
                        <ModernTextField hintText={"Custom label (optional - 20 chars max)"} value={action.Label} onChange={(e,v) => {this.onLabelChange(v)}} fullWidth={true}/>
                        <ModernTextField hintText={"Comment (optional)"} style={{marginTop: -2 }} multiLine={true} value={action.Description} onChange={(e,v) => {this.onDescriptionChange(v)}} fullWidth={true}/>
                    </div>
                }
                {create &&
                    <div style={{padding: 10, textAlign:'right'}}>
                        <RaisedButton
                            primary={true}
                            label={"Create Action"}
                            disabled={action.ID === JOB_ACTION_EMPTY || !valid}
                            onTouchTap={() => {this.save(); onDismiss()}}/>
                    </div>
                }
            </RightPanel>
        )
    }
}

export default FormPanel;
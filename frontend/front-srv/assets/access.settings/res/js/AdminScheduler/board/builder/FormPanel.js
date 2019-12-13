import React from 'react'
import Pydio from 'pydio'
import {Paper, MenuItem, SelectField, RaisedButton} from 'material-ui'
const PydioForm = Pydio.requireLib('form');
import {RightPanel} from './styles'
import {JOB_ACTION_EMPTY} from "../actions/editor";
import FormLoader from './FormLoader'
import {JobsJob, ConfigServiceApi, RestConfiguration, JobsAction} from 'pydio/http/rest-api'
import {LightGrey} from "../graph/Configs";
const {ModernSelectField} = Pydio.requireLib('hoc');

class FormPanel extends React.Component {

    constructor(props){
        super(props);
        const {action} = props;
        this.state = {
            action: JobsAction.constructFromObject(JSON.parse(JSON.stringify(action))),
            actionInfo: this.getActionInfo(action),
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
                Description:'Pick an action'
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

    onIdChange(id){
        const {action} = this.state;
        action.ID = id;
        // Refresh state
        this.setState({
            action,
            actionInfo: this.getActionInfo(action)
        })
    }

    actionPicker(){
        const {actions} = this.props;
        const {action} = this.state;
        let options = Object.keys(actions).map(id => {
            return <MenuItem primaryText={actions[id].Label || actions[id].Name} value={id}/>
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

        const {onDismiss, create, height} = this.props;
        const {actionInfo, action, formParams, dirty} = this.state;
        let save, revert;
        if(!create && formParams && dirty) {
            save = () => this.save();
            revert = () => this.revert();
        }
        return (
            <RightPanel title={actionInfo.Label} icon={actionInfo.Icon} onDismiss={onDismiss} saveButtons={!!formParams} onSave={save} onRevert={revert} height={this.props}>
                <div style={{padding: 10}}>{actionInfo.Description}</div>
                {create && <div style={{padding: 10}}>{this.actionPicker()}</div>}
                {formParams &&
                <div>
                    <PydioForm.FormPanel
                        ref="formPanel"
                        depth={-1}
                        parameters={formParams}
                        values={this.fromStringString(formParams, action.Parameters)}
                        onChange={this.onFormChange.bind(this)}
                    />
                </div>
                }
                {create && <div style={{padding: 10, textAlign:'right'}}>
                    <RaisedButton
                        primary={true}
                        label={"Create Action"}
                        disabled={action.ID === JOB_ACTION_EMPTY}
                        onTouchTap={() => {this.save(); onDismiss()}}/>
                </div>
                }
                {!create && !formParams &&
                    <div style={{padding: 10, color: '#9E9E9E'}}>There are no parameters for this action</div>
                }
            </RightPanel>
        )
    }
}

export default FormPanel;
import React from 'react'
import Pydio from 'pydio'
import {Paper, MenuItem, SelectField, RaisedButton} from 'material-ui'
const PydioForm = Pydio.requireLib('form');
import {RightPanel} from './styles'
import {JOB_ACTION_EMPTY} from "../actions/editor";
import FormLoader from './FormLoader'

class FormPanel extends React.Component {

    constructor(props){
        super(props);
        const {action} = props;
        this.state = {
            action,
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
        if(nextProps.action !== this.state.action) {
            this.setState({
                action: nextProps.action,
                actionInfo: this.getActionInfo(nextProps.action)
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
        console.log(action.Parameters);
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
            <SelectField
                value={action.ID}
                onChange={(ev, i, value) => {
                    this.onIdChange(value);
                }}
            >{[<MenuItem value={JOB_ACTION_EMPTY} primaryText={"Please pick an action"}/>, ...options]}</SelectField>
        )
    }

    render(){

        const {onDismiss, onChange, create} = this.props;
        const {actionInfo, action, formParams} = this.state;

        return (
            <RightPanel title={actionInfo.Label} icon={actionInfo.Icon} onDismiss={onDismiss}>
                <div style={{padding: 10}}>{actionInfo.Description}</div>
                {create && this.actionPicker()}
                {formParams &&
                <div style={{margin: -10}}>
                    <PydioForm.FormPanel
                        ref="formPanel"
                        depth={-1}
                        parameters={formParams}
                        values={this.fromStringString(formParams, action.Parameters)}
                        onChange={this.onFormChange.bind(this)}
                    />
                </div>
                }
                <div>
                    <RaisedButton
                        primary={true}
                        label={"SAVE"}
                        disabled={action.ID === JOB_ACTION_EMPTY}
                        onTouchTap={() => {
                            onChange(action);
                            onDismiss();
                        }}/>
                </div>
            </RightPanel>
        )
    }
}

export default FormPanel;
import React from 'react'
import {Paper, FlatButton, Toggle} from 'material-ui'
import FormLoader from "./FormLoader";
import Pydio from 'pydio'
const PydioForm = Pydio.requireLib('form');

class ProtoValue extends React.Component {

    constructor(props){
        super(props);
        this.state = {fieldName: props.fieldName};
        // load params
        const {singleQuery}  = this.props;
        FormLoader.loadAction("proto:switch:" + singleQuery).then(params => {
            let formValues = {};
            let isNot = false;
            if(props.fieldName){
                let notProps = {};
                if(props.proto.value["Not"]){
                    notProps["Not"] = true;
                    isNot = true;
                } else if(props.proto.value["not"]){
                    notProps["not"] = true;
                    isNot = true;
                }
                formValues = ProtoValue.protoValueToFormValues(params, props.fieldName, props.proto.value[props.fieldName], notProps);
            }
            this.setState({
                formParams: ProtoValue.filterNot(params),
                hasNot: ProtoValue.hasNot(params),
                formValues,
                isNot,
            });
        })
    }

    static hasNot(params){
        const notParams = params.filter(p => p.group_switch_label === 'Not' && p.name === '@value');
        if(notParams.length){
            return notParams[0].group_switch_value;
        } else {
            return null;
        }
    }

    static filterNot(params){
        return params.filter(p => !(p.group_switch_label === 'Not'))
        /*
        return params.filter(p => !(p.group_switch_label === 'Not' && p.name === '@value')).map(p => {
            if(p.group_switch_label === 'Not'){
                delete(p.group_switch_label);
                delete(p.group_switch_value);
                delete(p.group_switch_name);
            }
            return p;
        })
        */
    }

    static protoValueToFormValues(params, fieldName, value, notProps){
        const data =  {
            fieldname: {
                '@value': fieldName,
            },
            //...notProps
        };
        data.fieldname[fieldName] = value;
        const repParams = params.filter(p => p.group_switch_value === fieldName && p.replicationGroup && p.name !== '@value');
        if(repParams.length && typeof value === "object"){
            // Spread values as field, field_1, field_2 ...
            let i = 0;
            value.forEach(v => {
                repParams.forEach(p => {
                    data.fieldname[p.name + (i===0?'':'_'+i)] = typeof v === 'object' ? v[p.name] : v;
                });
                i++;
            })
        }
        return PydioForm.Manager.JsonToSlashes(data);
    }

    static formValuesToProtoValue(params, values){
        let fieldName, value;
        const json = PydioForm.Manager.SlashesToJson(values);
        if(json.fieldname && json.fieldname['@value']){
            fieldName = json.fieldname['@value'];
            const repParams = params.filter(p => p.group_switch_value === fieldName && p.replicationGroup && p.name !== '@value');
            if(repParams.length){
                value = ProtoValue.replicatedValue(repParams, json.fieldname, fieldName)
            } else {
                value = json.fieldname[fieldName];
            }
        }
        let notProps = {};
        if(json["Not"]){
            notProps.Not = true
        } else if(json["not"]){
            notProps.not = true;
        } else {
            notProps = null;
        }
        return {fieldName, value, notProps}
    }

    static replicatedValue(params, jsonObject, fieldName){
        const data = [];
        let i = 0;
        let suffix = '';
        const refName = params[0].name;
        while (jsonObject[refName+suffix]){
            if(params.length > 1){
                const obj = {};
                params.forEach(param => {
                    obj[param.name] = jsonObject[param.name + suffix];
                });
                data.push(obj);
            } else {
                data.push(jsonObject[refName+suffix]);
            }
            i++;
            suffix = '_' + i;
        }
        return data;
    }

    onFormChange(newValues){
        const {formParams} = this.state;
        console.log(ProtoValue.formValuesToProtoValue(formParams, newValues));
        this.setState({formValues: newValues});
    }

    onSubmit(){
        const {formParams, formValues, isNot, hasNot} = this.state;
        let notProps = null;
        if(hasNot && isNot){
            notProps = {};
            notProps[hasNot] = true;
        }
        console.log(notProps);
        const {fieldName, value} = ProtoValue.formValuesToProtoValue(formParams, formValues);
        this.props.onChange(fieldName, value, notProps);
        this.props.onDismiss();
    }

    render(){
        const {onDismiss, style} = this.props;
        const {formParams, formValues = {}, hasNot, isNot} = this.state;
        if(formParams){
            return (
                <Paper zDepth={2} style={{position:'absolute', borderRadius: 10, zIndex: 10, border:'2px solid #fac684', width: 300, ...style}}>
                    <PydioForm.FormPanel
                        depth={-1}
                        style={{margin: -10}}
                        parameters={formParams}
                        values={formValues}
                        onChange={this.onFormChange.bind(this)}
                    />
                    <div style={{display:'flex', borderTop: '2px solid #fac684', borderRadius: '0 0 10px 10px'}}>
                        <span style={{flex: 1}}>
                            {hasNot &&
                            <Toggle
                                toggled={isNot}
                                onToggle={(e,v)=>{this.setState({isNot:v})}}
                                style={{padding: '7px 5px 4px',fontSize: 15, minWidth:128}}
                                labelPosition={"right"}
                                label={isNot?"not equals":"equals"}
                            />}
                        </span>
                        <FlatButton label={"Ok"} onTouchTap={() => this.onSubmit()} primary={true}/>
                        <FlatButton label={"Cancel"} onTouchTap={onDismiss}/>
                    </div>
                </Paper>
            );
        } else {
            return <div>Loading form...</div>;
        }

    }

}

export default ProtoValue
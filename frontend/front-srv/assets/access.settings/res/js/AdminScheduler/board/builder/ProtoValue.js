import React from 'react'
import {Paper, FlatButton} from 'material-ui'
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
            if(props.fieldName){
                let notProps = {};
                if(props.proto.value["Not"]){
                    notProps["Not"] = true
                } else if(props.proto.value["not"]){
                    notProps["not"] = true;
                }
                formValues = ProtoValue.protoValueToFormValues(params, props.fieldName, props.proto.value[props.fieldName], notProps);
            }
            this.setState({formParams: ProtoValue.filterNot(params), formValues});
        })
    }

    static filterNot(params){
        return params.filter(p => !(p.group_switch_label === 'Not' && p.name === '@value')).map(p => {
            if(p.group_switch_label === 'Not'){
                delete(p.group_switch_label);
                delete(p.group_switch_value);
                delete(p.group_switch_name);
            }
            return p;
        })
    }

    static protoValueToFormValues(params, fieldName, value, notProps){
        const data =  {
            fieldname: {
                '@value': fieldName,
            },
            ...notProps
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
        const {formParams, formValues} = this.state;
        const {fieldName, value, notProps} = ProtoValue.formValuesToProtoValue(formParams, formValues);
        this.props.onChange(fieldName, value, notProps);
        this.props.onDismiss();
    }

    render(){
        const {onDismiss, style} = this.props;
        const {formParams, formValues = {}} = this.state;
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
                    <div style={{textAlign:'right'}}>
                        <FlatButton label={"Ok"} onTouchTap={() => this.onSubmit()}/>
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
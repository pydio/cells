import React, {Fragment} from 'react'
import Pydio from 'pydio'
import asMetaField from "../hoc/asMetaField";
import asMetaForm from "../hoc/asMetaForm";
const {InputIntegerBytes} = Pydio.requireLib('form');
const {ModernTextField, ModernSelectField} = Pydio.requireLib('hoc');
import {LinearProgress, MenuItem} from 'material-ui'
import MetaClient from "../MetaClient";

class IntegerField extends React.Component{
    render() {

        const {getRealValue, configs, column, inline} = this.props;

        let fieldConfig = configs.get(column.name);
        let format = 'general';
        if(fieldConfig && fieldConfig.data){
            format = fieldConfig.data.format || format;
        }
        let value = getRealValue();
        switch (format){
            case 'bytesize':
                const id=()=>{}
                return <InputIntegerBytes value={value} editMode={false} displayContext={"grid"} toggleEditMode={id} disabled={true}/>
            case 'percentage':
                return <Fragment>{value}%</Fragment>
            case 'progress':
                if(inline){
                    return <LinearProgress value={value} max={100} mode={"determinate"} style={{display:'inline-block', width:60, height: 6, backgroundColor:'rgba(189,189,189,.5)'}}/>
                } else {
                    return (
                        <div style={{display:'flex', alignItems:'center'}}>
                            <LinearProgress value={value} max={100} mode={"determinate"} style={{flex:1}}/>
                            <div style={{marginLeft:5}}>{value}%</div>
                        </div>
                    )
                }
            default:
                return <Fragment>{value}</Fragment>;
        }

    }
}
IntegerField = asMetaField(IntegerField)
export {IntegerField}

class IntegerForm extends React.Component{

    constructor(props) {
        super(props);
        this.state = {}
    }

    configAsState(configs, fieldname){
        if(configs.has(fieldname)){
            this.setState(configs.get(fieldname).data)
        }
    }

    componentDidMount() {
        const {fieldname, configs} = this.props;
        console.log(configs, fieldname);
        if(configs){
            this.configAsState(configs, fieldname)
        }else{
            MetaClient.getInstance().loadConfigs().then(metaConfigs => this.configAsState(metaConfigs, fieldname));
        }
    }

    render() {
        const {supportTemplates, search, updateValue: propsUpdateValue, label} = this.props;
        // Disable autoSubmit
        const updateValue = (v) => {
            propsUpdateValue(v, false);
        }

        const {format = 'general'} = this.state;
        let {value} = this.props;
        let searchComp = ''
        if(search) {
            if (value.indexOf && ['<','>'].indexOf(value.charAt(0))>-1){
                searchComp = value.charAt(0)
                if(value.charAt(1) === "=") {
                    searchComp += "="
                    value = parseInt(value.substr(2))
                } else {
                    value = parseInt(value.substr(1))
                }
            } else {
                value = parseInt(value)
            }
        }
        const tf = (type, change, hideUnderline = false) => {
            return (
                <ModernTextField
                    value={value}
                    fullWidth={true}
                    hintText={label}
                    type={type}
                    onChange={change}
                    underlineShow={!hideUnderline}
                    variant={search?"v1":"v2"}
                />
            )
        }
        if(supportTemplates) {
            return tf('', (e,v)=>updateValue(v))
        } else if(search) {
            return (
                <div style={{display:'flex'}}>
                    <div style={{width: 60, marginRight:8}}>
                        <ModernSelectField fullWidth={true} value={searchComp} onChange={(e,i,v)=>updateValue(v+''+value)}>
                            <MenuItem value={""} primaryText={"="}/>
                            <MenuItem value={">="} primaryText={">="}/>
                            <MenuItem value={"<="} primaryText={"<="}/>
                            <MenuItem value={">"} primaryText={">"}/>
                            <MenuItem value={"<"} primaryText={"<"}/>
                        </ModernSelectField>
                    </div>
                    <div style={{flex: 1}}>{tf('number', (e,v)=>{updateValue(v?(searchComp+''+v):v)})}</div>
                </div>
            );

        }

        let textType = 'number', onChangeInt = (e, v) => updateValue(parseInt(v));
        switch (format){
            case 'general':
                return tf(textType, onChangeInt)
            case 'percentage':
                return tf(textType, (e, v)=> {
                    updateValue(Math.max(0, Math.min(100, v)))
                })
            case 'progress':
                return (
                    <div>
                        {tf(textType, (e, v)=> {
                            updateValue(Math.max(0, Math.min(100, v)))
                        }, true)}
                        <LinearProgress mode={"determinate"} max={100} value={value} style={{marginTop: -8}}/>
                    </div>
                )
            case 'bytesize':
                const id = ()=>{}
                return (
                    <InputIntegerBytes
                        value={value}
                        editMode={true}
                        onChange={(newValue, oldValue) => updateValue(parseInt(newValue))}
                        isDisplayGrid={id}
                        isDisplayForm={id}
                        toggleEditMode={id}
                        attributes={{type:'integer-bytes', label:label}}
                        variant={search?"v1":"v2"}
                    />)
            default:
                return tf(textType, onChangeInt)
        }

    }
}
IntegerForm = asMetaForm(IntegerForm)
export {IntegerForm}
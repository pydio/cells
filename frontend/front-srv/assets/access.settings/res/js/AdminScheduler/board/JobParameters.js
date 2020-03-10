import React from 'react'
import Pydio from 'pydio'
import {IconButton, FlatButton, MenuItem, Checkbox, Toggle} from 'material-ui'
const {ModernTextField, ModernSelectField} = Pydio.requireLib('hoc');

import {JobsJobParameter} from 'pydio/http/rest-api'

class Parameter extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            edit: props.edit || false,
            editParameter: JobsJobParameter.constructFromObject(JSON.parse(JSON.stringify(props.parameter)))
        }
    }

    save(){
        const {editParameter} = this.state;
        const {onChange} = this.props;
        onChange(editParameter);
        this.setState({edit: false});
    }

    toggleEdit(){
        const {edit} = this.state;
        this.setState({
            editParameter: JobsJobParameter.constructFromObject(JSON.parse(JSON.stringify(this.props.parameter))),
            edit: !edit,
        })
    }

    render() {
        let {parameter, onChange, onDelete} = this.props;
        const {edit, editParameter} = this.state;
        const editChange = (val => {
            this.setState({editParameter: val});
        });
        const blockStyle={margin:'0 5px'};
        if(!edit) {
            let choices = {};
            try{
                choices = JSON.parse(parameter.JsonChoices);
            }catch(e){}
            return (
                <div style={{display:'flex', alignItems:'center'}}>
                    <div style={{...blockStyle,fontSize:15, width: 120}}>
                        {parameter.Name}
                    </div>
                    <div style={{blockStyle, width: 200}}>
                        {parameter.Type === 'select' &&
                            <ModernSelectField fullWidth={true} hintText={"Value"} value={parameter.Value} onChange={(e,i,v) => {onChange({...parameter, Value: v})}}>
                                {Object.keys(choices).map(k => {
                                    return <MenuItem value={k} primaryText={choices[k]}/>
                                })}
                            </ModernSelectField>
                        }
                        {parameter.Type === 'text' &&
                            <ModernTextField fullWidth={true} hintText={"Value"} value={parameter.Value} onChange={(e,v) => {onChange({...parameter, Value: v})}}/>
                        }
                        {parameter.Type === 'integer' &&
                            <ModernTextField fullWidth={true} hintText={"Value"} value={parseInt(parameter.Value)} type={"number"} onChange={(e,v) => {onChange({...parameter, Value: parseInt(v)})}}/>
                        }
                        {parameter.Type === 'boolean' &&
                            <ModernSelectField fullWidth={true} hintText={"Value"} value={parameter.Value} onChange={(e,i,v) => {onChange({...parameter, Value: v})}}>
                                <MenuItem value={"true"} primaryText={"Yes"}/>
                                <MenuItem value={"false"} primaryText={"No"}/>
                            </ModernSelectField>
                        }
                    </div>
                    <div style={blockStyle}>{parameter.Description}</div>
                    <IconButton iconClassName={"mdi mdi-pencil"} tooltip={"Edit"} onTouchTap={()=>this.toggleEdit()} iconStyle={{color:'#e0e0e0'}}/>
                </div>
            );
        }
        return (
            <div style={{display:'flex', alignItems:'center', backgroundColor: 'rgba(255, 243, 224, 0.22)', borderRadius: 4, border: '1px solid #FFE0B2'}}>
                <div style={blockStyle}>
                    <ModernTextField fullWidth={true} hintText={"Name"} value={editParameter.Name} onChange={(e,v) => {editChange({...editParameter,Name:v})}}/>
                </div>
                <div style={blockStyle}>
                    <ModernTextField fullWidth={true} hintText={"Default Value"} value={editParameter.Value} onChange={(e,v) => {editChange({...editParameter, Value: v})}}/>
                </div>
                <div style={blockStyle}>
                    <ModernTextField fullWidth={true} hintText={"Description"} value={editParameter.Description} onChange={(e,v) => {editChange({...editParameter,Description:v})}}/>
                </div>
                <div style={{...blockStyle, width: 120}}>
                    <ModernSelectField fullWidth={true} value={editParameter.Type} onChange={(e,i,v)=>{editChange({...editParameter,Type:v})}}>
                        <MenuItem value={"text"} primaryText={"Text"}/>
                        <MenuItem value={"integer"} primaryText={"Integer"}/>
                        <MenuItem value={"boolean"} primaryText={"Boolean"}/>
                        <MenuItem value={"select"} primaryText={"SelectField"}/>
                    </ModernSelectField>
                </div>
                {editParameter.Type === 'select' &&
                    <div style={blockStyle}>
                        <ModernTextField fullWidth={true} hintText={'{"key":"value"} pairs'} value={editParameter.JsonChoices} onChange={(e,v)=>{editChange({...editParameter, JsonChoices:v})}}/>
                    </div>
                }
                <div style={blockStyle}>
                    <Checkbox label={"Mandatory"} checked={editParameter.Mandatory} onCheck={(e,v)=>{editChange({...editParameter, Mandatory:v})}}/>
                </div>
                <div style={{flex: 1}}/>
                <IconButton iconClassName={"mdi mdi-undo"} tooltip={"Close"} onTouchTap={()=>this.toggleEdit()} iconStyle={{color:'#9e9e9e'}}/>
                <IconButton iconClassName={"mdi mdi-check"} tooltip={"Save"} onTouchTap={()=>this.save()} iconStyle={{color:'#9e9e9e'}}/>
                <IconButton iconClassName={"mdi mdi-delete"} tooltip={"Remove"} onTouchTap={()=>{onDelete()}} iconStyle={{color:'#9e9e9e'}}/>
            </div>
        );
    }

}

class JobParameters extends React.Component {

    constructor(props){
        super(props);
        /*
        // For testing
        parameters = [
            {"Name":"RecyclePath","Description":"This is a description","Value":"recycle_bin","Type":"text","edit":true},
            {"Name":"AnotherParam","Description":"","Value":"true","Type":"boolean","edit":true},
            {"Name":"SelectValues","Description":"Delete users recycles as well","Value":"key1","Type":"select","JsonChoices":"{\"key1\":\"value1\"}","edit":true}
            ];
        */

    }


    changeParam(index, newParam) {
        const {onChange, parameters = []} = this.props;
        const pp = parameters.map((p,i) => i === index ? newParam  : p);
        onChange(pp);
    }

    removeParam(index){
        const {onChange, parameters = []} = this.props;
        const pp = parameters.filter((p,i) => i !== index);
        onChange(pp);
    }

    addParam(){
        const {onChange, parameters = []} = this.props;
        const newP = new JobsJobParameter();
        newP.Type = 'text';
        newP.edit = true;
        onChange([...parameters, newP]);
    }

    render(){
        const {parameters = []} = this.props;

        return (
            <div style={{borderBottom:'1px solid rgb(236, 239, 241)'}}>
                <div style={{display:'flex', padding:'0 10px'}}>
                    <div style={{flex: 1, padding:'16px 10px'}}>Job-level parameters can be used by actions, filters and selectors.</div>
                    <IconButton iconClassName={"mdi mdi-plus"} tooltip={"Add Parameter"} onTouchTap={()=>this.addParam()}/>
                </div>
                <div style={{padding:16, paddingTop: 0}}>
                    {parameters.length === 0 &&
                        <div style={{textAlign:'center', fontStyle: 'italic', fontWeight: 500, color: '#90A4AE'}}>No parameters defined</div>
                    }
                    {parameters.map((p,i) => <Parameter key={p.Name || "p-" + i} onChange={(v)=>{this.changeParam(i, v)}} onDelete={() => this.removeParam(i)} parameter={p} edit={p.edit}/>)}
                </div>
            </div>

        );

    }

}

export default JobParameters
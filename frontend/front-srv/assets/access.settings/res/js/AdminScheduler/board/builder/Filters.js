import React from 'react'
import {RightPanel} from "./styles";
import QueryBuilder from "./QueryBuilder";
import {AllowedKeys} from "../graph/Configs";
import {Toggle} from 'material-ui'

export default class Filters extends React.Component {

    removeFilter(data, type, modelType){
        const {job, action, onRemoveFilter, onDismiss} = this.props;
        if(job){
            onRemoveFilter(job, data, type, modelType);
        } else {
            onRemoveFilter(action, data, type, modelType);
        }
        const types =  AllowedKeys[type][job?'job':'action'];
        const stack = Object.keys(types).map(key => {
            return job?job[key]:action[key]
        }).filter(c => c);
        if(!stack.length){
            onDismiss();
        }
    }

    render(){
        const {job, action, type, onDismiss, onSave, onToggleFilterAsCondition} = this.props;

        const target = job || action;
        const types = AllowedKeys[type][job?'job':'action'];
        const stack = Object.keys(types).map(key => {
            const data = job?job[key]:action[key];
            if(data){
                return {key, data, constructor: types[key]}
            } else {
                return null
            }
        }).filter(c => c).map(({key,data,constructor},index) => {
            return (
                <QueryBuilder
                    key={key}
                    cloner={(d) => constructor.constructFromObject(JSON.parse(JSON.stringify(d)))}
                    query={data}
                    queryType={type}
                    style={{borderBottom:'1px solid #e0e0e0', width:'100%', backgroundColor:'#FAFAFA', borderTop:index===0?'1px solid #e0e0e0':''}}
                    onRemoveFilter={(modelType) => { this.removeFilter(data, type, modelType) }}
                    onSave={(newData) => {
                        target[key] = newData;
                        onSave();
                    }}
                />
            );
        });

        let toggle;
        if(onToggleFilterAsCondition){
            toggle = (
                <Toggle
                    style={{minWidth: 256, flex: 1}}
                    toggled={target.FailedFilterActions !== undefined}
                    onToggle={(e, v) => {onToggleFilterAsCondition(v, target)}}
                    labelPosition={"left"}
                    label={"Conditional expression"}
                    labelStyle={{textAlign:'right'}}
                />);
        }
        let title;
        if(job){
            title = 'Input > '
        } else {
            title = 'Action > '
        }
        if(type === 'filter'){
            title += ' Filters';
        } else {
            title += ' Selectors'
        }

        return (
            <RightPanel
                width={600}
                onDismiss={onDismiss}
                title={title}
                titleAdditional={toggle}
                icon={type === 'filter' ? 'filter' : 'magnify'}
            >
                {stack}
            </RightPanel>
        )
    }

}
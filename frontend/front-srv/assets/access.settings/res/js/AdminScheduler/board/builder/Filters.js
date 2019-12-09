import React from 'react'
import {RightPanel} from "./styles";
import QueryBuilder from "./QueryBuilder";

const keys = {
    filter: {
        job: ['NodeEventFilter', 'UserEventFilter', 'IdmFilter'],
        action:['NodesFilter', 'UsersFilter', 'IdmFilter']
    },
    selector: {
        job: ['NodesSelector', 'UsersSelector', 'IdmSelector'],
        action: ['NodesSelector', 'UsersSelector', 'IdmSelector'],
    }
};

export default class Filters extends React.Component {

    render(){
        const {job, action, type, onDismiss, onRemoveFilter} = this.props;
        const stack = keys[type][job?'job':'action'].map(key => {
            return job?job[key]:action[key]
        }).filter(c => c).map(data => <QueryBuilder
            query={data}
            queryType={type}
            style={{borderBottom:'1px solid #e0e0e0'}}
            onRemoveFilter={(modelType) => {
                if(job){
                    onRemoveFilter(job, data, type, modelType);
                } else {
                    onRemoveFilter(action, data, type, modelType);
                }
            }}
        />);

        let title;
        if(job){
            title = 'Input > '
        } else {
            title = 'Action > '
        }
        if(type === 'filter'){
            title += ' Filters'
        } else {
            title += ' Selectors'
        }

        return (
            <RightPanel
                onDismiss={onDismiss}
                title={title}
                icon={type === 'filter' ? 'filter' : 'magnify'}
            >
                {stack}
            </RightPanel>
        )
    }

}
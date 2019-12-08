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
        const {job, action, type, onDismiss} = this.props;
        const stack = keys[type][job?'job':'action'].map(key => {
            return job?job[key]:action[key]
        }).filter(c => c).map(data => <QueryBuilder query={data} queryType={type} style={{borderBottom:'1px solid #e0e0e0'}}/>);

        return (
            <RightPanel
                onDismiss={onDismiss}
                title={type === 'filter' ? 'Filters' : 'Selectors'}
                icon={type === 'filter' ? 'filter' : 'magnify'}
            >
                {stack}
            </RightPanel>
        )
    }

}
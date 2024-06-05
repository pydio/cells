/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
import React from 'react';
import PropTypes from 'prop-types'
import Pydio from 'pydio'
import AS2Client from './Client'

const { PydioContextConsumer, moment } = Pydio.requireLib('boot');
const {EmptyStateView, Timeline} = Pydio.requireLib('components');
import {ActivityMD} from "./Activity";

class ActivityList extends React.Component {

    constructor(props) {
        super(props);
        if(props.items){
            this.state = {data:{items:props.items}, offset: 0, loadMore: false, loading: false};
        } else {
            this.state = {data:[], offset: 0, loadMore: true, loading: false};
        }
    }

    mergeMoreFeed(currentFeed, newFeed){
        const currentIds = currentFeed.items.map(item => item.id);
        const filtered = newFeed.items.filter(item => currentIds.indexOf(item.id) === -1);
        if(!filtered.length){
            this.setState({loadMore: false});
            return currentFeed;
        }
        let merged = currentFeed;
        merged.items = [...currentFeed.items, ...filtered];
        merged.totalItems = merged.items.length;
        return merged;
    }

    loadForProps(props){
        let {context, pointOfView, contextData, limit} = props;
        const {offset, data} = this.state;
        if (limit === undefined){
            limit = -1;
        }
        if(offset > 0){
            limit = 100;
        }
        this.setState({loading: true, error: null});
        AS2Client.loadActivityStreams(
            context,
            contextData,
            'outbox',
            pointOfView,
            offset,
            limit
        ).then((json) => {
            if(offset > 0 && data && data.items){
                if(json && json.items) this.setState({data: this.mergeMoreFeed(data, json)});
            }else {
                this.setState({data: json});
            }
            if(!json || !json.items || !json.items.length){
                this.setState({loadMore: false});
            }
            this.setState({loading: false});
        }).catch(msg => {
            this.setState({loading: false, error: msg});
        });
    }

    componentWillMount(){
        const {items, contextData} = this.props;
        if(items) {
            return
        }
        if(contextData) {
            this.loadForProps(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.items) {
            this.setState({data:{items:nextProps.items}, offset: 0, loadMore: false});
            return;
        }
        if (nextProps.contextData !== this.props.contextData || nextProps.context !== this.props.context) {
            this.setState({offset: 0, loadMore: true}, () => {
                this.loadForProps(nextProps);
            });
        }
    }

    render(){

        let content = [];
        const {listContext, pydio} = this.props;
        let {data, loadMore, loading, error} = this.state;
        let previousFrom;
        let emptyStateIcon = "mdi mdi-pulse";
        let emptyStateString = loading ? pydio.MessageHash['notification_center.17'] : pydio.MessageHash['notification_center.18'];
        if(error){
            emptyStateString = error.Detail || error.msg || error;
            emptyStateIcon = "mdi mdi-alert-circle-outline";
         }
        const loadAction = () => {
            this.setState({offset: data.items.length + 1}, () => {
                this.loadForProps(this.props);
            })
        };
        const loadMoreLabel = loading ? pydio.MessageHash['notification_center.20'] : pydio.MessageHash['notification_center.19']


        // Empty Case
        if(!data || !data.items || data.items.length === 0) {
            return (
                <EmptyStateView
                    pydio={this.props.pydio}
                    iconClassName={emptyStateIcon}
                    primaryTextId={emptyStateString}
                    style={{backgroundColor: 'transparent', paddingBottom: 20, paddingTop: 10}}
                    iconStyle={{fontSize: 40}}
                    legendStyle={{fontSize: 13}}
                />);
        }

        return <Timeline
            items={data.items}
            className={'small'}
            useSelection={false}
            itemUuid={(item) => item.id}
            itemMoment={(item) => moment(item.updated)}
            itemDesc={(item) => <ActivityMD activity={item} listContext={listContext} inlineActor={true}/> }
            itemActions={()=>[]}
            itemAnnotations={()=>null}
            color={"#2196f3"}
            loadMoreAction={data.items.length && loadMore ? loadAction : null}
            loadMoreLabel={loadMoreLabel}
            loadMoreDisabled={loading}
        />


    }

}

ActivityList.PropTypes = {
    context: PropTypes.string,
    contextData: PropTypes.string,
    boxName : PropTypes.string,
    pointOfView: PropTypes.oneOf(['GENERIC', 'ACTOR', 'SUBJECT'])
};

ActivityList = PydioContextConsumer(ActivityList);
export {ActivityList as default}
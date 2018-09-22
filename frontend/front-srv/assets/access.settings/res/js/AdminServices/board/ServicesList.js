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
import Pydio from 'pydio'
import React from "react";
import PydioApi from 'pydio/http/api'
import {ConfigServiceApi} from 'pydio/http/rest-api'
import {Paper, List, ListItem, Checkbox, FontIcon, Divider} from 'material-ui'
import ServiceCard from './ServiceCard'

const tags = {
    "gateway":{label:'Gateways', description:'World-facing services for accessing the platform'},
    "datasource":{label:'Data Sources', description:'Storage endpoints used to access concrete file storages. Main services are in charge of starting sub services (per datasource).'},
    "data":{label:'Data', description:'Services handling data and metadata.'},
    "idm":{label:'Identity Management', description:'All services related to authentication and authorizations, roles, security policies, etc.'},
    "scheduler":{label:'Scheduler', description:'Services for managing background jobs. The "tasks" server can be dispatched accross various peers.'},
    "broker":{label:'Broker', description:'Services dispatching and processing events (generally toward users) accross the application.'},
    "frontend":{label:'Frontend', description:'Frontend oriented services'},
    "discovery":{label:'Discovery', description:'Basic configurations and services registries called by all other services.'},
};

function groupAndSortServices(services) {

    let Peers = {};
    let Tags = {};
    // Sort all services on name
    services.sort((s1, s2) => {
        return s1.Name > s2.Name ? 1 : (s1.Name === s2.Name ? 0 : -1);
    });
    // First detect peers
    services.map(service => {
        if(!service.RunningPeers) return;
        service.RunningPeers.map(peer => {
            Peers[peer.Address] = peer.Address;
        });
    });
    // Now split services on various tags
    Object.keys(tags).map(tagName => {
        Tags[tagName] = {
            tagData: tags[tagName],
            services:{}
        };
        services.map(service => {
            if(tagName === service.Tag) {
                let genericId = service.Name;
                if(genericId.startsWith('pydio.grpc.')) genericId = genericId.replace('pydio.grpc.', '');
                else if(genericId.startsWith('pydio.rest.')) genericId = genericId.replace('pydio.rest.', '');
                if(tagName === 'datasource' && genericId.startsWith('data.')){
                    genericId = genericId.replace('data.', '');
                    if(genericId === 'index' || genericId === 'sync' || genericId === 'objects'){
                        genericId = 'main - ' + genericId;
                    } else {
                        let type = genericId.split('.').shift();
                        genericId = genericId.split('.').pop();
                        if(type === 'objects'){
                            genericId = 'objects - ' + genericId;
                        } else {
                            genericId = 'datasource - ' + genericId;
                        }
                    }
                }
                if(!Tags[tagName].services[genericId]) {
                    Tags[tagName].services[genericId] = [];
                }
                Tags[tagName].services[genericId].push(service);
            }
        });
    });

    return {Peers, Tags};

}

export default React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:React.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:React.PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode:React.PropTypes.instanceOf(AjxpNode).isRequired,
        filter:React.PropTypes.string,
        details: React.PropTypes.bool
    },

    getInitialState(){
        return {services: []};
    },

    componentDidMount(){
        this.load();
    },

    reload(){
        this.load();
    },

    load(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        Pydio.startLoading();
        api.listServices().then((servicesCollection) => {
            Pydio.endLoading();
            this.setState({services: servicesCollection.Services});
        }).catch(()=>{
            Pydio.endLoading();
        });
    },
    /**
     * @param service RestService
     * @returns {XML}
     */
    renderListItem: function(service){
        let description = [];
        if(this.props.details) {
            if(service.Description){
                description.push(service.Description)
            }
            let metaNode = service.RunningPeers;
            if(metaNode && metaNode.length){
                let strings = [];
                metaNode.map(Peer => {
                    strings.push(Peer.Address);
                });
                description.push('Running on ' + strings.join(','));
            }
        }
        return (
            <ListItem
                primaryText={service.Name}
                secondaryText={description.join(' - ')}
                leftCheckbox={<Checkbox defaultChecked={service.Status === 'STARTED'} checked={service.Status === 'STARTED'}/>}
            />);
    },


    filterNodes:function(service){
        if(service.Name.indexOf('.(.+)') !== -1){
            return false;
        }
        if(! this.props.filter ) {
            return true;
        }
        return service.Status === this.props.filter;
    },

    render:function(){
        const {services} = this.state;
        /*
        let tags = new Map();
        services.forEach((service) => {
            if (!this.filterNodes(service)){
                return;
            }
            const tag = service.Tag || 'General';
            if(!tags.has(tag)) {
                tags.set(tag, []);
            }
            tags.get(tag).push(service);
        });
        let blocks = [];
        tags.forEach((items, tag) => {
            const title = tag.charAt(0).toUpperCase() + tag.substr(1);
            let listItems = [];
            for(let i=0; i < items.length; i++){
                listItems.push(this.renderListItem(items[i]));
                listItems.push(<Divider inset={true}/>)
            }
            listItems.pop();
            blocks.push(
                <div>
                    <AdminComponents.SubHeader title={title}/>
                    <Paper style={{margin:'0 16px'}}>
                        <List>{listItems}</List>
                    </Paper>
                </div>
            );
        });
        */
        const blockStyle = {margin:20, backgroundColor: 'rgba(207, 216, 220, 0.59)', borderRadius: 3, padding: 3, display:'flex', flexWrap:'wrap'};

        const {Peers, Tags} = groupAndSortServices(services.filter(s => this.filterNodes(s)));
        const blocks = Object.keys(Tags).map(tag => {
            const tagData = Tags[tag].tagData;
            const services = Tags[tag].services;
            const srvComps = Object.keys(services).map(id => <ServiceCard showDescription={this.props.details} title={id} tagId={tag} services={services[id]}/> );
            let subBlocks = [];
            if(tag === 'datasource') {
                // Regroup by type
                subBlocks.push(
                    <div style={{...blockStyle, marginBottom: 5}} >
                        {Object.keys(services).map(id => {
                            if(!id.startsWith('main -')) return null;
                            return <ServiceCard showDescription={this.props.details} title={id.replace('main - ', '')} tagId={tag} services={services[id]}/>
                        })}
                    </div>
                );
                subBlocks.push(
                    <div style={{...blockStyle, margin:'5px 20px'}} >
                        {Object.keys(services).map(id => {
                            if(!id.startsWith('datasource -')) return null;
                            return <ServiceCard showDescription={this.props.details} title={id.replace('datasource - ', '')} tagId={tag} services={services[id]}/>
                        })}
                    </div>
                );
                subBlocks.push(
                    <div style={{...blockStyle, marginTop:5}} >
                        {Object.keys(services).map(id => {
                            if(!id.startsWith('objects -')) return null;
                            return <ServiceCard showDescription={this.props.details} title={id.replace('objects - ', '')} tagId={tag} services={services[id]}/>
                        })}
                    </div>
                );

            } else {
                subBlocks.push(
                    <div style={blockStyle} >
                        {Object.keys(services).map(id => <ServiceCard showDescription={this.props.details} title={id} tagId={tag} services={services[id]}/>)}
                    </div>
                )
            }
            if(srvComps.length === 0) {
                return null;
            }
            return (
                <div>
                    <AdminComponents.SubHeader title={tagData.label} legend={tagData.description}/>
                    {subBlocks}
                </div>
            );
        });


        return (
            <div className={this.props.className} style={this.props.style}>{blocks}</div>
        );
    }

});

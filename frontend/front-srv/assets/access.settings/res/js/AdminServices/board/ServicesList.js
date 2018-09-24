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

const tags = ['gateway', 'datasource', 'data', 'idm', 'scheduler', 'broker', 'frontend', 'discovery'];

function groupAndSortServices(services) {

    let Peers = {};
    let Tags = {};
    // Sort all services on name
    services.sort((s1, s2) => {
        return s1.Name > s2.Name ? 1 : (s1.Name === s2.Name ? 0 : -1);
    });
    // First detect peers
    services.map(service => {
        if(!service.RunningPeers) {
            return;
        }
        service.RunningPeers.map(peer => {
            Peers[peer.Address] = peer.Address;
        });
    });
    // Now split services on various tags
    tags.forEach(tagName => {
        Tags[tagName] = {
            services:{}
        };
        services.map(service => {
            if(tagName === service.Tag) {
                let genericId = service.Name;
                if(genericId.startsWith('pydio.grpc.')) {
                    genericId = genericId.replace('pydio.grpc.', '');
                }
                else if(genericId.startsWith('pydio.rest.')) {
                    genericId = genericId.replace('pydio.rest.', '');
                }
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
    renderListItem(service){
        let description = [];
        const {details, pydio} = this.props;
        if(details) {
            if(service.Description){
                description.push(service.Description)
            }
            let metaNode = service.RunningPeers;
            if(metaNode && metaNode.length){
                let strings = [];
                metaNode.map(Peer => {
                    strings.push(Peer.Address);
                });
                description.push(pydio.MessageHash['ajxp_admin.services.service.ip'].replace('%s', strings.join(',')));
            }
        }
        return (
            <ListItem
                primaryText={service.Name}
                secondaryText={description.join(' - ')}
                leftCheckbox={<Checkbox defaultChecked={service.Status === 'STARTED'} checked={service.Status === 'STARTED'}/>}
            />);
    },


    filterNodes(service){
        if(service.Name.indexOf('.(.+)') !== -1){
            return false;
        }
        if(! this.props.filter ) {
            return true;
        }
        return service.Status === this.props.filter;
    },

    render(){
        const {pydio} = this.props;
        const {services} = this.state;
        const blockStyle = {margin:20, backgroundColor: 'rgba(207, 216, 220, 0.59)', borderRadius: 3, padding: 3, display:'flex', flexWrap:'wrap'};
        const m = id => pydio.MessageHash['ajxp_admin.services.tag.' + id] || id;


        const {Peers, Tags} = groupAndSortServices(services.filter(s => this.filterNodes(s)), pydio);
        const blocks = Object.keys(Tags).map(tag => {
            const services = Tags[tag].services;
            const srvComps = Object.keys(services).map(id => <ServiceCard pydio={pydio} showDescription={this.props.details} title={id} tagId={tag} services={services[id]}/> );
            let subBlocks = [];
            if(tag === 'datasource') {
                // Regroup by type
                subBlocks.push(
                    <div style={{...blockStyle, marginBottom: 5}} >
                        {Object.keys(services).map(id => {
                            if(!id.startsWith('main -')) return null;
                            return <ServiceCard pydio={pydio} showDescription={this.props.details} title={id.replace('main - ', '')} tagId={tag} services={services[id]}/>
                        })}
                    </div>
                );
                subBlocks.push(
                    <div style={{...blockStyle, margin:'5px 20px'}} >
                        {Object.keys(services).map(id => {
                            if(!id.startsWith('datasource -')) return null;
                            return <ServiceCard pydio={pydio} showDescription={this.props.details} title={id.replace('datasource - ', '')} tagId={tag} services={services[id]}/>
                        })}
                    </div>
                );
                subBlocks.push(
                    <div style={{...blockStyle, marginTop:5}} >
                        {Object.keys(services).map(id => {
                            if(!id.startsWith('objects -')) return null;
                            return <ServiceCard pydio={pydio} showDescription={this.props.details} title={id.replace('objects - ', '')} tagId={tag} services={services[id]}/>
                        })}
                    </div>
                );

            } else {
                subBlocks.push(
                    <div style={blockStyle} >
                        {Object.keys(services).map(id => <ServiceCard pydio={pydio} showDescription={this.props.details} title={id} tagId={tag} services={services[id]}/>)}
                    </div>
                )
            }
            if(srvComps.length === 0) {
                return null;
            }
            return (
                <div>
                    <AdminComponents.SubHeader title={m(tag + '.title')} legend={m(tag + '.description')}/>
                    {subBlocks}
                </div>
            );
        });


        return (
            <div className={this.props.className} style={this.props.style}>{blocks}</div>
        );
    }

});

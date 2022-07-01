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
import PropTypes from 'prop-types';

import Pydio from 'pydio';
import React from "react";
import createReactClass from 'create-react-class';
import PydioApi from 'pydio/http/api'
import {ConfigServiceApi} from 'cells-sdk'
import {Paper, List, ListItem, Checkbox, FontIcon, Divider} from 'material-ui'
import ServiceCard from './ServiceCard'
const {MaterialTable} = Pydio.requireLib('components');

const tags = ['gateway', 'datasource', 'data', 'idm', 'scheduler', 'broker', 'frontend', 'discovery'];

function extractPeers(services) {
    let Peers = {};
    // First detect peers
    services.map(service => {
        if(!service.RunningPeers) {
            return;
        }
        service.RunningPeers.map(peer => {
            Peers[peer.Address] = peer.Address;
        });
    });
    return Object.keys(Peers);
}

function groupAndSortServices(services) {

    let Tags = {};
    // Sort all services on name
    services.sort((s1, s2) => {
        return s1.Name > s2.Name ? 1 : (s1.Name === s2.Name ? 0 : -1);
    });
    // Split services on various tags
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

    return Tags;

}

export default createReactClass({
    displayName: 'ServicesList',
    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        dataModel:PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode:PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode:PropTypes.instanceOf(AjxpNode).isRequired,
        filter:PropTypes.string,
        peerFilter:PropTypes.string,
        details: PropTypes.bool,
        onUpdatePeers: PropTypes.func,
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
        this.setState({loading:true});
        api.listServices().then((servicesCollection) => {
            Pydio.endLoading();
            this.setState({loading:false});
            this.setState({services: servicesCollection.Services});
            if(this.props.onUpdatePeers){
                const peers = extractPeers(servicesCollection.Services);
                this.props.onUpdatePeers(peers);
            }
        }).catch(()=>{
            Pydio.endLoading();
            this.setState({loading:false});
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
        if(this.props.filter && service.Status !== this.props.filter ) {
            return false;
        }
        if(this.props.peerFilter) {
            if(!service.RunningPeers) return false;
            return service.RunningPeers.filter(p => {
                return p.Address === this.props.peerFilter;
            }).length > 0;
        }
        return true;
    },

    render(){
        const {pydio, details} = this.props;
        const {services = [], loading} = this.state;
        const blockStyle = {
            margin:16,
            display:'flex',
            flexWrap:'wrap'
        };
        const m = id => pydio.MessageHash['ajxp_admin.services.tag.' + id] || id;
        const m2 = id => pydio.MessageHash['ajxp_admin.services.column.' + id] || id;

        const Tags = groupAndSortServices(services.filter(s => this.filterNodes(s)), pydio);
        if (!details){
            let tableData = [];
            const tableColumns = [
                {name:'Status', label: '', style:{width:56, paddingLeft:12, paddingRight:12, textOverflow:'inherit'}, headerStyle:{width:56}, renderCell: (service) =>{
                    let iconColor = service.Status === 'STARTED' ? '#33691e' : '#d32f2f';
                    let text = service.Status === 'STARTED' ? 'Running' : 'Stopped';
                    if( service.Status !== 'STARTED' && service.Metadata && service.Metadata.unique ){
                        iconColor = '#9E9E9E';
                        text = 'Standby'
                    }
                    return {
                        element:<FontIcon style={{margin:'0 9px 0 4px', fontSize: 20}} className={"mdi-traffic-light"} color={iconColor}/>,
                        text,
                    }
                }},
                {name:'Name', label: m2('name'), style:{paddingLeft: 0}, headerStyle:{paddingLeft: 0}},
                {name:'Description', label: m2('description'), style:{width: '40%'}, headerStyle:{width: '40%'}, hideSmall: true},
                {name:'Version', label: m2('version'), style:{width: 110}, headerStyle:{width: 110}, hideSmall: true},
                {name:'Type', label:m2('tag'), style:{width: 120}, headerStyle:{width: 120}, hideSmall: true, renderCell:(service)=>{
                        const isGrpc = service.Name.startsWith('pydio.grpc.');
                        let legend = isGrpc ? "Grpc" : "Rest";
                        const m = id => pydio.MessageHash['ajxp_admin.services.service.' + id] || id;
                        if(service.Tag === 'gateway') {
                            legend = service.Name.split('.').pop();
                        } else if (service.Tag === 'datasource') {
                            if(service.Name.startsWith('pydio.grpc.data.sync.')){
                                legend=m('datasource.sync')
                            } else if(service.Name.startsWith('pydio.grpc.data.objects.')){
                                legend=m('datasource.objects')
                            } else if(service.Name.startsWith('pydio.grpc.data.index.')){
                                legend=m('datasource.index')
                            }
                        }
                        return legend;
                }},
                {name:'RunningPeers', label: m2('peers'), hideSmall: true, renderCell:(service)=>{
                    let peers = [];
                    if(service.Status === 'STARTED' && service.RunningPeers) {
                        peers = service.RunningPeers.map(p => {
                            if(p.Metadata && p.Metadata['non-addressable']){
                                return p.Metadata['non-addressable'];
                            } else if(p.Port) {
                                return p.Address + ':' + p.Port;
                            } else {
                                return p.Address;
                            }
                        });
                    } else {
                        peers.push('N/A');
                    }
                    return peers.join(',');
                }}
            ];
            Object.keys(Tags).forEach(tag => {
                const tagData = [];
                const services = Tags[tag].services;
                Object.keys(services).forEach(id => {
                    const subServices = services[id];
                    subServices.forEach(service => {
                        tagData.push(service);
                    });
                });
                if(tagData.length){
                    tagData.unshift({Subheader: <span><span style={{textTransform:'uppercase'}}>{m(tag + '.title')}</span> - {m(tag + '.description')}</span>});
                    tableData.push(...tagData)
                }
            });

            const {body} = AdminComponents.AdminStyles();
            const {tableMaster} = body;
            const blockProps = body.block.props;
            const blockStyle = body.block.container;


            return (
                <div className={this.props.className} style={this.props.style}>
                    <Paper {...blockProps} style={blockStyle}>
                        <MaterialTable
                            data={tableData}
                            columns={tableColumns}
                            deselectOnClickAway={true}
                            showCheckboxes={false}
                            emptyStateString={pydio.MessageHash['ajxp_admin.services.empty.' + (loading?'loading':'noservice')]}
                            masterStyles={tableMaster}
                        />
                    </Paper>
                </div>
            );
        } else {

            const blocks = Object.keys(Tags).map(tag => {
                const services = Tags[tag].services;
                const srvComps = Object.keys(services).map(id => <ServiceCard pydio={pydio} showDescription={true} title={id} tagId={tag} services={services[id]}/> );
                let subBlocks = [];
                if(tag === 'datasource') {
                    // Regroup by type
                    subBlocks.push(
                        <div style={{...blockStyle, margin: '0 16px'}} >
                            {Object.keys(services).map(id => {
                                if(!id.startsWith('main -')) return null;
                                return <ServiceCard pydio={pydio} showDescription={true} title={id.replace('main - ', '')} tagId={tag} services={services[id]}/>
                            })}
                        </div>
                    );
                    subBlocks.push(
                        <div style={{...blockStyle, margin: '0 16px'}} >
                            {Object.keys(services).map(id => {
                                if(!id.startsWith('datasource -')) return null;
                                return <ServiceCard pydio={pydio} showDescription={true} title={id.replace('datasource - ', '')} tagId={tag} services={services[id]}/>
                            })}
                        </div>
                    );
                    subBlocks.push(
                        <div style={{...blockStyle, margin: '0 16px'}} >
                            {Object.keys(services).map(id => {
                                if(!id.startsWith('objects -')) return null;
                                return <ServiceCard pydio={pydio} showDescription={true} title={id.replace('objects - ', '')} tagId={tag} services={services[id]}/>
                            })}
                        </div>
                    );

                } else {
                    subBlocks.push(
                        <div style={blockStyle} >
                            {Object.keys(services).map(id => <ServiceCard pydio={pydio} showDescription={true} title={id} tagId={tag} services={services[id]}/>)}
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
    },
});

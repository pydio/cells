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
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _ServiceCard = require('./ServiceCard');

var _ServiceCard2 = _interopRequireDefault(_ServiceCard);

var React = require('react');

var tags = {
    "gateway": { label: 'Gateways', description: 'World-facing services for accessing the platform' },
    "datasource": { label: 'Data Sources', description: 'Storage endpoints used to access concrete file storages. Main services are in charge of starting sub services (per datasource).' },
    "data": { label: 'Data', description: 'Services handling data and metadata.' },
    "idm": { label: 'Identity Management', description: 'All services related to authentication and authorizations, roles, security policies, etc.' },
    "scheduler": { label: 'Scheduler', description: 'Services for managing background jobs. The "tasks" server can be dispatched accross various peers.' },
    "broker": { label: 'Broker', description: 'Services dispatching and processing events (generally toward users) accross the application.' },
    "frontend": { label: 'Frontend', description: 'Frontend oriented services' },
    "discovery": { label: 'Discovery', description: 'Basic configurations and services registries called by all other services.' }
};

function groupAndSortServices(services) {

    var Peers = {};
    var Tags = {};
    // Sort all services on name
    services.sort(function (s1, s2) {
        return s1.Name > s2.Name ? 1 : s1.Name === s2.Name ? 0 : -1;
    });
    // First detect peers
    services.map(function (service) {
        if (!service.RunningPeers) return;
        service.RunningPeers.map(function (peer) {
            Peers[peer.Address] = peer.Address;
        });
    });
    // Now split services on various tags
    Object.keys(tags).map(function (tagName) {
        Tags[tagName] = {
            tagData: tags[tagName],
            services: {}
        };
        services.map(function (service) {
            if (tagName === service.Tag) {
                var genericId = service.Name;
                if (genericId.startsWith('pydio.grpc.')) genericId = genericId.replace('pydio.grpc.', '');else if (genericId.startsWith('pydio.rest.')) genericId = genericId.replace('pydio.rest.', '');
                if (tagName === 'datasource' && genericId.startsWith('data.')) {
                    genericId = genericId.replace('data.', '');
                    if (genericId === 'index' || genericId === 'sync' || genericId === 'objects') {
                        genericId = 'main - ' + genericId;
                    } else {
                        var type = genericId.split('.').shift();
                        genericId = genericId.split('.').pop();
                        if (type === 'objects') {
                            genericId = 'objects - ' + genericId;
                        } else {
                            genericId = 'datasource - ' + genericId;
                        }
                    }
                }
                if (!Tags[tagName].services[genericId]) {
                    Tags[tagName].services[genericId] = [];
                }
                Tags[tagName].services[genericId].push(service);
            }
        });
    });

    return { Peers: Peers, Tags: Tags };
}

exports['default'] = React.createClass({
    displayName: 'ServicesList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: React.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode: React.PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode: React.PropTypes.instanceOf(AjxpNode).isRequired,
        filter: React.PropTypes.string,
        details: React.PropTypes.bool
    },

    getInitialState: function getInitialState() {
        return { services: [] };
    },

    componentDidMount: function componentDidMount() {
        this.load();
    },

    reload: function reload() {
        this.load();
    },

    load: function load() {
        var _this = this;

        var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
        api.listServices().then(function (servicesCollection) {
            _this.setState({ services: servicesCollection.Services });
        });
    },
    /**
     * @param service RestService
     * @returns {XML}
     */
    renderListItem: function renderListItem(service) {
        var description = [];
        if (this.props.details) {
            if (service.Description) {
                description.push(service.Description);
            }
            var metaNode = service.RunningPeers;
            if (metaNode && metaNode.length) {
                (function () {
                    var strings = [];
                    metaNode.map(function (Peer) {
                        strings.push(Peer.Address);
                    });
                    description.push('Running on ' + strings.join(','));
                })();
            }
        }
        return React.createElement(_materialUi.ListItem, {
            primaryText: service.Name,
            secondaryText: description.join(' - '),
            leftCheckbox: React.createElement(_materialUi.Checkbox, { defaultChecked: service.Status === 'STARTED', checked: service.Status === 'STARTED' })
        });
    },

    filterNodes: function filterNodes(service) {
        if (service.Name.indexOf('.(.+)') !== -1) {
            return false;
        }
        if (!this.props.filter) {
            return true;
        }
        return service.Status === this.props.filter;
    },

    render: function render() {
        var _this2 = this;

        var services = this.state.services;

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
        var blockStyle = { margin: 20, backgroundColor: 'rgba(207, 216, 220, 0.59)', borderRadius: 3, padding: 3, display: 'flex', flexWrap: 'wrap' };

        var _groupAndSortServices = groupAndSortServices(services.filter(function (s) {
            return _this2.filterNodes(s);
        }));

        var Peers = _groupAndSortServices.Peers;
        var Tags = _groupAndSortServices.Tags;

        var blocks = Object.keys(Tags).map(function (tag) {
            var tagData = Tags[tag].tagData;
            var services = Tags[tag].services;
            var srvComps = Object.keys(services).map(function (id) {
                return React.createElement(_ServiceCard2['default'], { showDescription: _this2.props.details, title: id, tagId: tag, services: services[id] });
            });
            var subBlocks = [];
            if (tag === 'datasource') {
                // Regroup by type
                subBlocks.push(React.createElement(
                    'div',
                    { style: _extends({}, blockStyle, { marginBottom: 5 }) },
                    Object.keys(services).map(function (id) {
                        if (!id.startsWith('main -')) return null;
                        return React.createElement(_ServiceCard2['default'], { showDescription: _this2.props.details, title: id.replace('main - ', ''), tagId: tag, services: services[id] });
                    })
                ));
                subBlocks.push(React.createElement(
                    'div',
                    { style: _extends({}, blockStyle, { margin: '5px 20px' }) },
                    Object.keys(services).map(function (id) {
                        if (!id.startsWith('datasource -')) return null;
                        return React.createElement(_ServiceCard2['default'], { showDescription: _this2.props.details, title: id.replace('datasource - ', ''), tagId: tag, services: services[id] });
                    })
                ));
                subBlocks.push(React.createElement(
                    'div',
                    { style: _extends({}, blockStyle, { marginTop: 5 }) },
                    Object.keys(services).map(function (id) {
                        if (!id.startsWith('objects -')) return null;
                        return React.createElement(_ServiceCard2['default'], { showDescription: _this2.props.details, title: id.replace('objects - ', ''), tagId: tag, services: services[id] });
                    })
                ));
            } else {
                subBlocks.push(React.createElement(
                    'div',
                    { style: blockStyle },
                    Object.keys(services).map(function (id) {
                        return React.createElement(_ServiceCard2['default'], { showDescription: _this2.props.details, title: id, tagId: tag, services: services[id] });
                    })
                ));
            }
            if (srvComps.length === 0) {
                return null;
            }
            return React.createElement(
                'div',
                null,
                React.createElement(AdminComponents.SubHeader, { title: tagData.label, legend: tagData.description }),
                subBlocks
            );
        });

        return React.createElement(
            'div',
            { className: this.props.className, style: this.props.style },
            blocks
        );
    }

});
module.exports = exports['default'];

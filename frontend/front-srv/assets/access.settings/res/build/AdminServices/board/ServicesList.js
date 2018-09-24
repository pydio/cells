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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _ServiceCard = require('./ServiceCard');

var _ServiceCard2 = _interopRequireDefault(_ServiceCard);

var tags = ['gateway', 'datasource', 'data', 'idm', 'scheduler', 'broker', 'frontend', 'discovery'];

function groupAndSortServices(services) {

    var Peers = {};
    var Tags = {};
    // Sort all services on name
    services.sort(function (s1, s2) {
        return s1.Name > s2.Name ? 1 : s1.Name === s2.Name ? 0 : -1;
    });
    // First detect peers
    services.map(function (service) {
        if (!service.RunningPeers) {
            return;
        }
        service.RunningPeers.map(function (peer) {
            Peers[peer.Address] = peer.Address;
        });
    });
    // Now split services on various tags
    tags.forEach(function (tagName) {
        Tags[tagName] = {
            services: {}
        };
        services.map(function (service) {
            if (tagName === service.Tag) {
                var genericId = service.Name;
                if (genericId.startsWith('pydio.grpc.')) {
                    genericId = genericId.replace('pydio.grpc.', '');
                } else if (genericId.startsWith('pydio.rest.')) {
                    genericId = genericId.replace('pydio.rest.', '');
                }
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

exports['default'] = _react2['default'].createClass({
    displayName: 'ServicesList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
        filter: _react2['default'].PropTypes.string,
        details: _react2['default'].PropTypes.bool
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
        _pydio2['default'].startLoading();
        api.listServices().then(function (servicesCollection) {
            _pydio2['default'].endLoading();
            _this.setState({ services: servicesCollection.Services });
        })['catch'](function () {
            _pydio2['default'].endLoading();
        });
    },
    /**
     * @param service RestService
     * @returns {XML}
     */
    renderListItem: function renderListItem(service) {
        var description = [];
        var _props = this.props;
        var details = _props.details;
        var pydio = _props.pydio;

        if (details) {
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
                    description.push(pydio.MessageHash['ajxp_admin.services.service.ip'].replace('%s', strings.join(',')));
                })();
            }
        }
        return _react2['default'].createElement(_materialUi.ListItem, {
            primaryText: service.Name,
            secondaryText: description.join(' - '),
            leftCheckbox: _react2['default'].createElement(_materialUi.Checkbox, { defaultChecked: service.Status === 'STARTED', checked: service.Status === 'STARTED' })
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

        var pydio = this.props.pydio;
        var services = this.state.services;

        var blockStyle = { margin: 20, backgroundColor: 'rgba(207, 216, 220, 0.59)', borderRadius: 3, padding: 3, display: 'flex', flexWrap: 'wrap' };
        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.services.tag.' + id] || id;
        };

        var _groupAndSortServices = groupAndSortServices(services.filter(function (s) {
            return _this2.filterNodes(s);
        }), pydio);

        var Peers = _groupAndSortServices.Peers;
        var Tags = _groupAndSortServices.Tags;

        var blocks = Object.keys(Tags).map(function (tag) {
            var services = Tags[tag].services;
            var srvComps = Object.keys(services).map(function (id) {
                return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: _this2.props.details, title: id, tagId: tag, services: services[id] });
            });
            var subBlocks = [];
            if (tag === 'datasource') {
                // Regroup by type
                subBlocks.push(_react2['default'].createElement(
                    'div',
                    { style: _extends({}, blockStyle, { marginBottom: 5 }) },
                    Object.keys(services).map(function (id) {
                        if (!id.startsWith('main -')) return null;
                        return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: _this2.props.details, title: id.replace('main - ', ''), tagId: tag, services: services[id] });
                    })
                ));
                subBlocks.push(_react2['default'].createElement(
                    'div',
                    { style: _extends({}, blockStyle, { margin: '5px 20px' }) },
                    Object.keys(services).map(function (id) {
                        if (!id.startsWith('datasource -')) return null;
                        return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: _this2.props.details, title: id.replace('datasource - ', ''), tagId: tag, services: services[id] });
                    })
                ));
                subBlocks.push(_react2['default'].createElement(
                    'div',
                    { style: _extends({}, blockStyle, { marginTop: 5 }) },
                    Object.keys(services).map(function (id) {
                        if (!id.startsWith('objects -')) return null;
                        return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: _this2.props.details, title: id.replace('objects - ', ''), tagId: tag, services: services[id] });
                    })
                ));
            } else {
                subBlocks.push(_react2['default'].createElement(
                    'div',
                    { style: blockStyle },
                    Object.keys(services).map(function (id) {
                        return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: _this2.props.details, title: id, tagId: tag, services: services[id] });
                    })
                ));
            }
            if (srvComps.length === 0) {
                return null;
            }
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(AdminComponents.SubHeader, { title: m(tag + '.title'), legend: m(tag + '.description') }),
                subBlocks
            );
        });

        return _react2['default'].createElement(
            'div',
            { className: this.props.className, style: this.props.style },
            blocks
        );
    }

});
module.exports = exports['default'];

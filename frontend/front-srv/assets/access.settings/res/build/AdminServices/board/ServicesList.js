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

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var tags = ['gateway', 'datasource', 'data', 'idm', 'scheduler', 'broker', 'frontend', 'discovery'];

function extractPeers(services) {
    var Peers = {};
    // First detect peers
    services.map(function (service) {
        if (!service.RunningPeers) {
            return;
        }
        service.RunningPeers.map(function (peer) {
            Peers[peer.Address] = peer.Address;
        });
    });
    return Object.keys(Peers);
}

function groupAndSortServices(services) {

    var Tags = {};
    // Sort all services on name
    services.sort(function (s1, s2) {
        return s1.Name > s2.Name ? 1 : s1.Name === s2.Name ? 0 : -1;
    });
    // Split services on various tags
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

    return Tags;
}

exports['default'] = _react2['default'].createClass({
    displayName: 'ServicesList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
        filter: _react2['default'].PropTypes.string,
        peerFilter: _react2['default'].PropTypes.string,
        details: _react2['default'].PropTypes.bool,
        onUpdatePeers: _react2['default'].PropTypes.func
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
        this.setState({ loading: true });
        api.listServices().then(function (servicesCollection) {
            _pydio2['default'].endLoading();
            _this.setState({ loading: false });
            _this.setState({ services: servicesCollection.Services });
            if (_this.props.onUpdatePeers) {
                var peers = extractPeers(servicesCollection.Services);
                _this.props.onUpdatePeers(peers);
            }
        })['catch'](function () {
            _pydio2['default'].endLoading();
            _this.setState({ loading: false });
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
        var _this2 = this;

        if (service.Name.indexOf('.(.+)') !== -1) {
            return false;
        }
        if (this.props.filter && service.Status !== this.props.filter) {
            return false;
        }
        if (this.props.peerFilter) {
            if (!service.RunningPeers) return false;
            return service.RunningPeers.filter(function (p) {
                return p.Address === _this2.props.peerFilter;
            }).length > 0;
        }
        return true;
    },

    render: function render() {
        var _this3 = this;

        var _props2 = this.props;
        var pydio = _props2.pydio;
        var details = _props2.details;
        var _state = this.state;
        var _state$services = _state.services;
        var services = _state$services === undefined ? [] : _state$services;
        var loading = _state.loading;

        var blockStyle = {
            margin: 16,
            display: 'flex',
            flexWrap: 'wrap'
        };
        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.services.tag.' + id] || id;
        };
        var m2 = function m2(id) {
            return pydio.MessageHash['ajxp_admin.services.column.' + id] || id;
        };

        var Tags = groupAndSortServices(services.filter(function (s) {
            return _this3.filterNodes(s);
        }), pydio);
        if (!details) {
            var _ret2 = (function () {
                var tableData = [];
                var tableColumns = [{ name: 'Status', label: '', style: { width: 56, paddingLeft: 12, paddingRight: 12, textOverflow: 'inherit' }, headerStyle: { width: 56 }, renderCell: function renderCell(service) {
                        var iconColor = service.Status === 'STARTED' ? '#33691e' : '#d32f2f';
                        var text = service.Status === 'STARTED' ? 'Running' : 'Stopped';
                        if (service.Status !== 'STARTED' && (service.Name === "consul" || service.Name === "pydio.rest.install" || service.Name === "nats")) {
                            iconColor = '#9E9E9E';
                        }
                        return {
                            element: _react2['default'].createElement(_materialUi.FontIcon, { style: { margin: '0 9px 0 4px', fontSize: 20 }, className: "mdi-traffic-light", color: iconColor }),
                            text: text
                        };
                    } }, { name: 'Name', label: m2('name'), style: { paddingLeft: 0 }, headerStyle: { paddingLeft: 0 } }, { name: 'Description', label: m2('description'), style: { width: '40%' }, headerStyle: { width: '40%' }, hideSmall: true }, { name: 'Version', label: m2('version'), style: { width: 80 }, headerStyle: { width: 80 }, hideSmall: true }, { name: 'Type', label: m2('tag'), style: { width: 140 }, headerStyle: { width: 140 }, hideSmall: true, renderCell: function renderCell(service) {
                        var isGrpc = service.Name.startsWith('pydio.grpc.');
                        var legend = isGrpc ? "Grpc" : "Rest";
                        var m = function m(id) {
                            return pydio.MessageHash['ajxp_admin.services.service.' + id] || id;
                        };
                        if (service.Tag === 'gateway') {
                            legend = service.Name.split('.').pop();
                        } else if (service.Tag === 'datasource') {
                            if (service.Name.startsWith('pydio.grpc.data.sync.')) {
                                legend = m('datasource.sync');
                            } else if (service.Name.startsWith('pydio.grpc.data.objects.')) {
                                legend = m('datasource.objects');
                            } else if (service.Name.startsWith('pydio.grpc.data.index.')) {
                                legend = m('datasource.index');
                            }
                        }
                        return legend;
                    } }, { name: 'RunningPeers', label: m2('peers'), hideSmall: true, renderCell: function renderCell(service) {
                        var peers = [];
                        if (service.Status === 'STARTED' && service.RunningPeers) {
                            peers = service.RunningPeers.map(function (p) {
                                if (p.Metadata && p.Metadata['non-addressable']) {
                                    return p.Metadata['non-addressable'];
                                } else if (p.Port) {
                                    return p.Address + ':' + p.Port;
                                } else {
                                    return p.Address;
                                }
                            });
                        } else {
                            peers.push('N/A');
                        }
                        return peers.join(',');
                    } }];
                Object.keys(Tags).forEach(function (tag) {
                    var tagData = [];
                    var services = Tags[tag].services;
                    Object.keys(services).forEach(function (id) {
                        var subServices = services[id];
                        subServices.forEach(function (service) {
                            tagData.push(service);
                        });
                    });
                    if (tagData.length) {
                        tagData.unshift({ Subheader: _react2['default'].createElement(
                                'span',
                                null,
                                _react2['default'].createElement(
                                    'span',
                                    { style: { textTransform: 'uppercase' } },
                                    m(tag + '.title')
                                ),
                                ' - ',
                                m(tag + '.description')
                            ) });
                        tableData.push.apply(tableData, tagData);
                    }
                });

                var _AdminComponents$AdminStyles = AdminComponents.AdminStyles();

                var body = _AdminComponents$AdminStyles.body;
                var tableMaster = body.tableMaster;

                var blockProps = body.block.props;
                var blockStyle = body.block.container;

                return {
                    v: _react2['default'].createElement(
                        'div',
                        { className: _this3.props.className, style: _this3.props.style },
                        _react2['default'].createElement(
                            _materialUi.Paper,
                            _extends({}, blockProps, { style: blockStyle }),
                            _react2['default'].createElement(MaterialTable, {
                                data: tableData,
                                columns: tableColumns,
                                deselectOnClickAway: true,
                                showCheckboxes: false,
                                emptyStateString: pydio.MessageHash['ajxp_admin.services.empty.' + (loading ? 'loading' : 'noservice')],
                                masterStyles: tableMaster
                            })
                        )
                    )
                };
            })();

            if (typeof _ret2 === 'object') return _ret2.v;
        } else {

            var blocks = Object.keys(Tags).map(function (tag) {
                var services = Tags[tag].services;
                var srvComps = Object.keys(services).map(function (id) {
                    return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: true, title: id, tagId: tag, services: services[id] });
                });
                var subBlocks = [];
                if (tag === 'datasource') {
                    // Regroup by type
                    subBlocks.push(_react2['default'].createElement(
                        'div',
                        { style: _extends({}, blockStyle, { margin: '0 16px' }) },
                        Object.keys(services).map(function (id) {
                            if (!id.startsWith('main -')) return null;
                            return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: true, title: id.replace('main - ', ''), tagId: tag, services: services[id] });
                        })
                    ));
                    subBlocks.push(_react2['default'].createElement(
                        'div',
                        { style: _extends({}, blockStyle, { margin: '0 16px' }) },
                        Object.keys(services).map(function (id) {
                            if (!id.startsWith('datasource -')) return null;
                            return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: true, title: id.replace('datasource - ', ''), tagId: tag, services: services[id] });
                        })
                    ));
                    subBlocks.push(_react2['default'].createElement(
                        'div',
                        { style: _extends({}, blockStyle, { margin: '0 16px' }) },
                        Object.keys(services).map(function (id) {
                            if (!id.startsWith('objects -')) return null;
                            return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: true, title: id.replace('objects - ', ''), tagId: tag, services: services[id] });
                        })
                    ));
                } else {
                    subBlocks.push(_react2['default'].createElement(
                        'div',
                        { style: blockStyle },
                        Object.keys(services).map(function (id) {
                            return _react2['default'].createElement(_ServiceCard2['default'], { pydio: pydio, showDescription: true, title: id, tagId: tag, services: services[id] });
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
    }

});
module.exports = exports['default'];

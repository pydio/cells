(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ServicesList = require('./ServicesList');

var _ServicesList2 = _interopRequireDefault(_ServicesList);

var _materialUi = require('material-ui');

exports['default'] = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired,
        openRightPane: _react2['default'].PropTypes.func.isRequired,
        closeRightPane: _react2['default'].PropTypes.func.isRequired,
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default'])
    },

    getInitialState: function getInitialState() {
        return { details: true, filter: '' };
    },

    onDetailsChange: function onDetailsChange(event, value) {
        this.setState({ details: value });
    },

    onFilterChange: function onFilterChange(event, index, value) {
        this.setState({ filter: value });
    },

    reloadList: function reloadList() {
        this.refs.servicesList.reload();
    },

    render: function render() {
        var pydio = this.props.pydio;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.services.' + id] || id;
        };

        var buttonContainer = _react2['default'].createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', padding: '0 20px', width: '100%' } },
            _react2['default'].createElement(_materialUi.Toggle, { label: m('toggle.details'), toggled: this.state.details, onToggle: this.onDetailsChange, labelPosition: "right", style: { width: 150 } }),
            _react2['default'].createElement(
                _materialUi.DropDownMenu,
                { style: { marginTop: -10 }, underlineStyle: { display: 'none' }, value: this.state.filter, onChange: this.onFilterChange },
                _react2['default'].createElement(_materialUi.MenuItem, { value: '', primaryText: m('filter.nofilter') }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: 'STARTED', primaryText: m('filter.started') }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: 'STOPPED', primaryText: m('filter.stopped') })
            )
        );
        return _react2['default'].createElement(
            'div',
            { className: 'main-layout-nav-to-stack workspaces-board' },
            _react2['default'].createElement(
                'div',
                { className: 'vertical-layout', style: { width: '100%' } },
                _react2['default'].createElement(AdminComponents.Header, {
                    title: this.context.getMessage('172', 'settings'),
                    icon: 'mdi mdi-access-point-network',
                    legend: this.context.getMessage('173', 'settings'),
                    actions: buttonContainer,
                    reloadAction: this.reloadList.bind(this)
                }),
                _react2['default'].createElement(_ServicesList2['default'], {
                    ref: 'servicesList',
                    pydio: pydio,
                    className: 'layout-fill',
                    style: { paddingBottom: 16 },
                    dataModel: this.props.dataModel,
                    rootNode: this.props.rootNode,
                    currentNode: this.props.rootNode,
                    filter: this.state.filter,
                    details: this.state.details
                })
            )
        );
    }

});
module.exports = exports['default'];

},{"./ServicesList":3,"material-ui":"material-ui","pydio":"pydio","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node","react":"react"}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var ServiceCard = (function (_React$Component) {
    _inherits(ServiceCard, _React$Component);

    function ServiceCard() {
        _classCallCheck(this, ServiceCard);

        _get(Object.getPrototypeOf(ServiceCard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ServiceCard, [{
        key: 'renderServiceLine',

        /**
         *
         * @param service Object
         * @param tag String
         * @param m Function
         * @return {*}
         */
        value: function renderServiceLine(service, tag, m) {
            var iconColor = service.Status === 'STARTED' ? '#33691e' : '#d32f2f';

            var isGrpc = service.Name.startsWith('pydio.grpc.');
            var legend = isGrpc ? "Grpc" : "Rest";

            if (tag === 'gateway') {
                legend = service.Name.split('.').pop();
            } else if (tag === 'datasource') {
                if (service.Name.startsWith('pydio.grpc.data.sync.')) {
                    legend = m('datasource.sync');
                } else if (service.Name.startsWith('pydio.grpc.data.objects.')) {
                    legend = m('datasource.objects');
                } else if (service.Name.startsWith('pydio.grpc.data.index.')) {
                    legend = m('datasource.index');
                }
            }

            var peers = [];
            if (service.Status === 'STARTED' && service.RunningPeers) {
                service.RunningPeers.map(function (p) {
                    peers.push(p.Address + ':' + p.Port);
                });
            } else {
                peers.push('N/A');
            }

            return _react2['default'].createElement(
                'div',
                { style: { padding: '8px' } },
                _react2['default'].createElement(
                    'div',
                    { style: { fontWeight: 500, color: '#9e9e9e' } },
                    legend
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', marginTop: 6 } },
                    _react2['default'].createElement(_materialUi.FontIcon, { style: { margin: '0 9px 0 4px', fontSize: 20 }, className: "mdi-traffic-light", color: iconColor }),
                    _react2['default'].createElement(
                        'span',
                        null,
                        peers.join(', ')
                    )
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var title = _props.title;
            var services = _props.services;
            var tagId = _props.tagId;
            var showDescription = _props.showDescription;
            var pydio = _props.pydio;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.services.service.' + id] || id;
            };

            var grpcDescription = undefined;
            if (services.length > 1) {
                services.map(function (s) {
                    if (s.Name.startsWith('pydio.grpc.')) {
                        grpcDescription = s.Description;
                    }
                });
            }
            var description = grpcDescription || services[0].Description;
            if (!description && tagId === 'datasource') {
                if (services[0].Name.startsWith('pydio.grpc.data.objects.')) {
                    description = m('datasource.objects.legend');
                } else {
                    description = m('datasource.legend');
                }
            }

            var styles = {
                container: {
                    width: 200, margin: 8, display: 'flex', flexDirection: 'column'
                },
                title: {
                    padding: 8, fontSize: 16, backgroundColor: '#607D8B', color: 'white'
                },
                description: {
                    padding: 8, color: 'rgba(0,0,0,0.53)', borderTop: '1px solid #eee'
                }
            };

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: styles.container },
                _react2['default'].createElement(
                    'div',
                    { style: styles.title },
                    title
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    services.map(function (service) {
                        return _this.renderServiceLine(service, tagId, m);
                    })
                ),
                showDescription && _react2['default'].createElement(
                    'div',
                    { style: styles.description },
                    description
                )
            );
        }
    }]);

    return ServiceCard;
})(_react2['default'].Component);

exports['default'] = ServiceCard;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}],3:[function(require,module,exports){
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

},{"./ServiceCard":2,"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],4:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boardDashboard = require('./board/Dashboard');

var _boardDashboard2 = _interopRequireDefault(_boardDashboard);

window.AdminServices = {
  Dashboard: _boardDashboard2['default']
};

},{"./board/Dashboard":1}]},{},[4]);

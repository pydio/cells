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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var DynamicGrid = _Pydio$requireLib.DynamicGrid;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib2.PydioContextConsumer;

var AdvancedDashboard = (function (_React$Component) {
    _inherits(AdvancedDashboard, _React$Component);

    function AdvancedDashboard() {
        _classCallCheck(this, AdvancedDashboard);

        _get(Object.getPrototypeOf(AdvancedDashboard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(AdvancedDashboard, [{
        key: 'getDefaultCards',
        value: function getDefaultCards() {

            var getMessageFunc = this.props.getMessage;

            return [
            /*
            {
                id:'welcome_panel',
                componentClass:'AdminComponents.WelcomePanel',
                props:{},
                defaultPosition:{
                    x:0, y:0
                }
            },
            */
            {
                id: 'quick_links',
                componentClass: 'AdminComponents.QuickLinks',
                props: {},
                defaultPosition: {
                    x: 0, y: 0
                }
            }, {
                id: 'connections_today',
                componentClass: 'AdminComponents.GraphBadge',
                props: {
                    queryName: "LoginSuccess",
                    legend: getMessageFunc('home.57'),
                    frequency: "D",
                    interval: 60
                },
                defaultPosition: {
                    x: 0, y: 1
                }
            }, {
                id: 'downloads_today',
                componentClass: 'AdminComponents.GraphBadge',
                props: {
                    queryName: "ObjectGet",
                    legend: getMessageFunc('home.58'),
                    frequency: "D",
                    interval: 60
                },
                defaultPosition: {
                    x: 2, y: 1
                }
            }, {
                id: 'uploads_this_week',
                componentClass: 'AdminComponents.GraphBadge',
                props: {
                    queryName: "ObjectPut",
                    legend: getMessageFunc('home.59'),
                    frequency: "D",
                    interval: 60
                },
                defaultPosition: {
                    x: 4, y: 1
                }
            }, {
                id: 'sharedfiles_per_today',
                componentClass: 'AdminComponents.GraphBadge',
                props: {
                    queryName: "LinkCreated",
                    legend: getMessageFunc('home.60'),
                    frequency: "D",
                    interval: 60
                },
                defaultPosition: {
                    x: 6, y: 1
                }
            },
            /*
            {
                id:'most_active_user_today',
                componentClass:'AdminComponents.MostActiveBadge',
                props:{
                    type:"user",
                    legend:getMessageFunc('home.61'),
                    range:"last_day"
                },
                defaultPosition:{
                    x:0, y:6
                }
            },
            {
                id:'most_active_ip_last_week',
                componentClass:'AdminComponents.MostActiveBadge',
                props:{
                    type:"ip",
                    legend:getMessageFunc('home.62'),
                    range:"last_week"
                },
                defaultPosition:{
                    x:2, y:6
                }
            },
            {
                id:'most_downloaded_last_week',
                componentClass:'AdminComponents.MostActiveBadge',
                props:{
                    type:"action",
                    legend:getMessageFunc('home.63'),
                    range:"last_week",
                    actionName:"download"
                },
                defaultPosition:{
                    x:4, y:6
                }
            },
            {
                id:'most_previewed_last_week',
                componentClass:'AdminComponents.MostActiveBadge',
                props:{
                    type:"action",
                    legend:getMessageFunc('home.64'),
                    range:"last_week",
                    actionName:"preview"
                },
                defaultPosition:{
                    x:6, y:6
                }
            },
            */
            {
                id: 'files_activity',
                componentClass: 'AdminComponents.GraphCard',
                props: {
                    title: getMessageFunc('home.65'),
                    queryName: "ObjectGet",
                    frequency: "H",
                    interval: 60
                },
                defaultPosition: {
                    x: 0, y: 12
                }
            }, {
                id: 'webconnections_graph',
                componentClass: 'AdminComponents.GraphCard',
                props: {
                    title: getMessageFunc('home.66'),
                    queryName: "LoginSuccess",
                    frequency: "H",
                    interval: 60
                },
                defaultPosition: {
                    x: 4, y: 12
                }
            }, {
                id: 'recent_logs',
                componentClass: 'AdminComponents.RecentLogs',
                props: {
                    interval: 60
                },
                defaultPosition: {
                    x: 0, y: 26
                }
            }, {
                id: 'services_status',
                componentClass: 'AdminComponents.ServicesStatus',
                props: {
                    interval: 120
                },
                defaultPosition: {
                    x: 3, y: 26
                }
            }, {
                id: 'todo_list',
                componentClass: 'AdminComponents.ToDoList',
                defaultPosition: {
                    x: 6, y: 26
                }
            }];
        }
    }, {
        key: 'render',
        value: function render() {

            return _react2['default'].createElement(DynamicGrid, {
                storeNamespace: 'AdminHome.AdvancedDashboard',
                builderNamespaces: ['AdminComponents'],
                defaultCards: this.getDefaultCards(),
                pydio: this.props.pydio,
                style: { height: '100%' },
                rglStyle: { position: 'absolute', top: 6, left: 6, right: 6, bottom: 6 },
                disableEdit: true
            });
        }
    }]);

    return AdvancedDashboard;
})(_react2['default'].Component);

exports['default'] = AdvancedDashboard = PydioContextConsumer(AdvancedDashboard);
exports['default'] = AdvancedDashboard;
module.exports = exports['default'];

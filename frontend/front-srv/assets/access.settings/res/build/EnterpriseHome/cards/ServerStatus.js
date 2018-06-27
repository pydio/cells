'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilReloadWrapper = require('../util/ReloadWrapper');

var _utilReloadWrapper2 = _interopRequireDefault(_utilReloadWrapper);

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var Paper = _require2.Paper;

var _require3 = require('react-chartjs');

var Doughnut = _require3.Doughnut;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var _require$requireLib2 = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib2.PydioContextConsumer;

var ServerStatus = (function (_Component) {
    _inherits(ServerStatus, _Component);

    function ServerStatus(props, context) {
        _classCallCheck(this, ServerStatus);

        _get(Object.getPrototypeOf(ServerStatus.prototype), 'constructor', this).call(this, props, context);
        this.state = { cpu: 0, disk: { free: 0, total: 1 }, load: ['-', '-', '-'] };
    }

    _createClass(ServerStatus, [{
        key: 'loadStatus',
        value: function loadStatus() {
            this.firstLoad = null;
            PydioApi.getClient().request({
                get_action: 'system_status'
            }, (function (transport) {

                this.setState(transport.responseJSON);
            }).bind(this), null, { discrete: true });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.firstLoad = setTimeout(this.loadStatus.bind(this), 500);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.firstLoad) {
                clearTimeout(this.firstLoad);
            }
        }
    }, {
        key: 'triggerReload',
        value: function triggerReload() {
            this.loadStatus();
        }
    }, {
        key: 'render',
        value: function render() {
            var cpuData = [{
                value: this.state.cpu,
                color: "rgba(247, 70, 74, 0.51)",
                highlight: "#FF5A5E",
                label: this.props.getMessage("home.36")
            }, {
                value: 100 - this.state.cpu,
                color: "rgba(70, 191, 189, 0.59)",
                highlight: "#5AD3D1",
                label: this.props.getMessage("home.37")
            }];
            var freePercent = Math.round(this.state.disk.free / this.state.disk.total * 100);
            var diskData = [{
                value: 100 - freePercent,
                color: "rgba(247, 70, 74, 0.51)",
                highlight: "#FF5A5E",
                label: this.props.getMessage("home.38")
            }, {
                value: freePercent,
                color: "rgba(70, 191, 189, 0.59)",
                highlight: "#5AD3D1",
                label: this.props.getMessage("home.39")
            }];

            return React.createElement(
                Paper,
                _extends({}, this.props, {
                    zDepth: 1,
                    transitionEnabled: false
                }),
                this.props.buttons,
                React.createElement(
                    'h4',
                    null,
                    this.props.getMessage('home.35')
                ),
                React.createElement(
                    'div',
                    { className: 'server-status' },
                    React.createElement(
                        'div',
                        { className: 'doughnut-chart' },
                        React.createElement(
                            'h5',
                            null,
                            this.props.getMessage('home.40')
                        ),
                        React.createElement(Doughnut, {
                            data: cpuData,
                            options: {},
                            width: 200
                        }),
                        React.createElement(
                            'span',
                            { className: 'figure' },
                            this.state.cpu,
                            '%'
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'doughnut-chart' },
                        React.createElement(
                            'h5',
                            null,
                            this.props.getMessage('home.41')
                        ),
                        React.createElement(Doughnut, {
                            data: diskData,
                            options: {},
                            width: 200
                        }),
                        React.createElement(
                            'span',
                            { className: 'figure' },
                            100 - freePercent,
                            '%'
                        )
                    )
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h4',
                        null,
                        this.props.getMessage('home.42')
                    ),
                    React.createElement(
                        'div',
                        { className: 'server-loads' },
                        React.createElement(
                            'span',
                            { className: 'server-load legend' },
                            '1mn'
                        ),
                        React.createElement(
                            'span',
                            { className: 'server-load legend' },
                            '5mn'
                        ),
                        React.createElement(
                            'span',
                            { className: 'server-load legend' },
                            '15mn'
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'server-loads' },
                        React.createElement(
                            'span',
                            { className: 'server-load' },
                            this.state.load[0] != '-' ? Math.round(this.state.load[0] * 100) / 100 : '-'
                        ),
                        React.createElement(
                            'span',
                            { className: 'server-load' },
                            this.state.load[1] != '-' ? Math.round(this.state.load[1] * 100) / 100 : '-'
                        ),
                        React.createElement(
                            'span',
                            { className: 'server-load' },
                            this.state.load[2] != '-' ? Math.round(this.state.load[2] * 100) / 100 : '-'
                        )
                    )
                )
            );
        }
    }]);

    return ServerStatus;
})(Component);

var globalMessages = global.pydio.MessageHash;

ServerStatus.displayName = 'ServerStatus';
exports['default'] = ServerStatus = PydioContextConsumer((0, _utilReloadWrapper2['default'])(ServerStatus));
exports['default'] = ServerStatus = asGridItem(ServerStatus, globalMessages['ajxp_admin.home.35'], { gridWidth: 5, gridHeight: 26 }, [{ name: 'interval', label: globalMessages['ajxp_admin.home.18'], type: 'integer', 'default': 20 }]);

exports['default'] = ServerStatus;
module.exports = exports['default'];

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

var _react = require('react');

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _utilReloadWrapper = require('../util/ReloadWrapper');

var _utilReloadWrapper2 = _interopRequireDefault(_utilReloadWrapper);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var asGridItem = _Pydio$requireLib.asGridItem;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib2.PydioContextConsumer;

var RecentLogs = (function (_Component) {
    _inherits(RecentLogs, _Component);

    function RecentLogs(props, context) {
        _classCallCheck(this, RecentLogs);

        _get(Object.getPrototypeOf(RecentLogs.prototype), 'constructor', this).call(this, props, context);
        this.state = { filter: '', logs: [] };
    }

    _createClass(RecentLogs, [{
        key: 'loadLogs',
        value: function loadLogs() {
            var _this = this;

            var api = new _pydioHttpRestApi.EnterpriseLogServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.LogListLogRequest();
            request.Query = '';
            request.Page = 0;
            request.Size = 20;
            request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject('JSON');
            api.audit(request).then(function (result) {
                if (result.Logs) {
                    _this.setState({ logs: result.Logs });
                }
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadLogs();
        }
    }, {
        key: 'changeFilter',
        value: function changeFilter(value) {
            this.setState({ filter: value });
        }
    }, {
        key: 'triggerReload',
        value: function triggerReload() {
            this.loadLogs();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var logs = _state.logs;
            var filter = _state.filter;

            var iconMenuItems = [{ payload: '', text: this.props.getMessage('home.33') }, { payload: 'error', text: this.props.getMessage('home.34') }];

            var dropDown = React.createElement(
                'div',
                { style: { position: 'absolute', right: 0, top: 8 } },
                React.createElement(
                    _materialUi.IconMenu,
                    {
                        value: filter,
                        onChange: this.changeFilter.bind(this),
                        anchorOrigin: { horizontal: 'right', vertical: 'top' },
                        targetOrigin: { horizontal: 'right', vertical: 'top' },
                        iconButtonElement: React.createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-filter', iconStyle: { color: '#9e9e9e' } })
                    },
                    iconMenuItems.map(function (item) {
                        return React.createElement(_materialUi.MenuItem, { primaryText: item.text, onTouchTap: function () {
                                _this2.changeFilter(item.payload);
                            } });
                    })
                )
            );

            var style = _extends({}, this.props.style, {
                display: 'flex',
                flexDirection: 'column'
            });

            return React.createElement(
                _materialUi.Paper,
                _extends({}, this.props, { zDepth: 1, transitionEnabled: false, style: style }),
                this.props.closeButton,
                dropDown,
                React.createElement(
                    'h4',
                    null,
                    this.props.getMessage('home.32')
                ),
                React.createElement(
                    _materialUi.List,
                    { style: { flex: 1, overflowY: 'auto' } },
                    logs.map(function (line) {
                        if (filter && line.Level !== filter) {
                            return null;
                        }

                        var sec = (line.UserName ? "By " + line.UserName : "From " + line.RemoteAddress) + " at " + new Date(line.Ts * 1000).toLocaleTimeString();
                        return React.createElement(_materialUi.ListItem, { primaryText: line.Msg, secondaryText: sec });
                    })
                )
            );
        }
    }]);

    return RecentLogs;
})(_react.Component);

var globalMessages = global.pydio.MessageHash;

exports['default'] = RecentLogs = PydioContextConsumer((0, _utilReloadWrapper2['default'])(RecentLogs));
exports['default'] = RecentLogs = asGridItem(RecentLogs, globalMessages['ajxp_admin.home.32'], { gridWidth: 3, gridHeight: 26 }, [{ name: 'interval', label: globalMessages['ajxp_admin.home.18'], type: 'integer', 'default': 120 }]);

RecentLogs.displayName = 'RecentLogs';
exports['default'] = RecentLogs;
module.exports = exports['default'];

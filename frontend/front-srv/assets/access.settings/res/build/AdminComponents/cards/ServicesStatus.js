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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _require = require('react');

var Component = _require.Component;

var _require2 = require('material-ui');

var Paper = _require2.Paper;
var List = _require2.List;
var ListItem = _require2.ListItem;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var _require$requireLib2 = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib2.PydioContextConsumer;

var ServicesStatus = (function (_Component) {
    _inherits(ServicesStatus, _Component);

    function ServicesStatus(props, context) {
        _classCallCheck(this, ServicesStatus);

        _get(Object.getPrototypeOf(ServicesStatus.prototype), 'constructor', this).call(this, props, context);
        this.state = { services: [] };
    }

    _createClass(ServicesStatus, [{
        key: 'loadStatus',
        value: function loadStatus() {
            var _this = this;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.listServices().then(function (servicesCollection) {
                _this.setState({ services: servicesCollection.Services });
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadStatus();
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
            var services = this.state.services;

            var tags = new Map(),
                items = [];
            services.forEach(function (service) {
                var tag = service.Tag || 'General';
                if (!tags.has(tag)) {
                    tags.set(tag, { running: [], stopped: [] });
                }
                if (service.Status === 'STARTED') {
                    tags.get(tag).running.push(service);
                } else {
                    tags.get(tag).stopped.push(service);
                }
            });
            tags.forEach(function (v, k) {
                var tagTitle = k.charAt(0).toUpperCase() + k.substr(1);
                items.push(React.createElement(ListItem, { primaryText: tagTitle, secondaryText: v.running.length + ' services running, ' + v.stopped.length + ' stopped' }));
            });

            var style = _extends({}, this.props.style, {
                display: 'flex',
                flexDirection: 'column'
            });

            return React.createElement(
                Paper,
                _extends({}, this.props, { zDepth: 1, transitionEnabled: false, style: style }),
                this.props.closeButton,
                React.createElement(
                    'h4',
                    null,
                    this.props.getMessage('home.35')
                ),
                React.createElement(
                    List,
                    { style: { flex: 1, overflowY: 'auto' } },
                    items
                )
            );
        }
    }]);

    return ServicesStatus;
})(Component);

var globalMessages = global.pydio.MessageHash;

ServicesStatus.displayName = 'ServerStatus';
exports['default'] = ServicesStatus = PydioContextConsumer((0, _utilReloadWrapper2['default'])(ServicesStatus));
exports['default'] = ServicesStatus = asGridItem(ServicesStatus, globalMessages['ajxp_admin.home.35'], { gridWidth: 3, gridHeight: 26 }, [{ name: 'interval', label: globalMessages['ajxp_admin.home.18'], type: 'integer', 'default': 20 }]);

exports['default'] = ServicesStatus;
module.exports = exports['default'];

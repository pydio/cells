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

var _RichLogsList = require('./RichLogsList');

var _RichLogsList2 = _interopRequireDefault(_RichLogsList);

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var Paper = _require2.Paper;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var _require$requireLib2 = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib2.PydioContextConsumer;

var RecentLogs = (function (_Component) {
    _inherits(RecentLogs, _Component);

    function RecentLogs(props, context) {
        _classCallCheck(this, RecentLogs);

        _get(Object.getPrototypeOf(RecentLogs.prototype), 'constructor', this).call(this, props, context);
        this.state = { filter: {} };
    }

    _createClass(RecentLogs, [{
        key: 'changeFilter',
        value: function changeFilter(ev, index, item) {
            this.setState({ filter: item.payload });
        }
    }, {
        key: 'triggerReload',
        value: function triggerReload() {
            this.refs['logList'].loadLogs();
        }
    }, {
        key: 'render',
        value: function render() {

            var iconMenuItems = [{ payload: {}, text: this.props.getMessage('home.33') }, { payload: { severity: 'ERROR|WARNING' }, text: this.props.getMessage('home.34') }];
            var taggedItems = iconMenuItems.map((function (item) {
                if (JSON.stringify(item.payload) == JSON.stringify(this.state.filter)) {
                    item.text = '[' + item.text + ']';
                } else {
                    item.text = ' ' + item.text;
                }
                return item;
            }).bind(this));

            var dropDown = React.createElement(
                'div',
                { className: 'logs-filter' },
                React.createElement(ReactMUI.DropDownIcon, {
                    onChange: this.changeFilter.bind(this),
                    autoWidth: false,
                    iconClassName: 'icon-angle-down',
                    menuItems: taggedItems
                })
            );

            return React.createElement(
                Paper,
                _extends({}, this.props, { zDepth: 1, transitionEnabled: false }),
                this.props.buttons,
                dropDown,
                React.createElement(
                    'h4',
                    null,
                    this.props.getMessage('home.32')
                ),
                React.createElement(_RichLogsList2['default'], { ref: 'logList', localFilter: this.state.filter })
            );
        }
    }]);

    return RecentLogs;
})(Component);

var globalMessages = global.pydio.MessageHash;

exports['default'] = RecentLogs = PydioContextConsumer((0, _utilReloadWrapper2['default'])(RecentLogs));
exports['default'] = RecentLogs = asGridItem(RecentLogs, globalMessages['ajxp_admin.home.32'], { gridWidth: 3, gridHeight: 26 }, [{ name: 'interval', label: globalMessages['ajxp_admin.home.18'], type: 'integer', 'default': 120 }]);

RecentLogs.displayName = 'RecentLogs';
exports['default'] = RecentLogs;
module.exports = exports['default'];

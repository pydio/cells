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

var _react2 = _interopRequireDefault(_react);

var _SimpleDashboard = require('./SimpleDashboard');

var _SimpleDashboard2 = _interopRequireDefault(_SimpleDashboard);

var _AdvancedDashboard = require('./AdvancedDashboard');

var _AdvancedDashboard2 = _interopRequireDefault(_AdvancedDashboard);

var _Header = require('./Header');

var _Header2 = _interopRequireDefault(_Header);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var TabBoard = (function (_React$Component) {
    _inherits(TabBoard, _React$Component);

    function TabBoard(props) {
        _classCallCheck(this, TabBoard);

        _get(Object.getPrototypeOf(TabBoard.prototype), 'constructor', this).call(this, props);
        this.state = { tab: 'dashboard' };
    }

    _createClass(TabBoard, [{
        key: 'onTabChange',
        value: function onTabChange(value) {
            var _this = this;

            if (value === 'dashboard') {
                this.setState({ tab: value });
            } else if (value === 'audit') {
                // Load
                _pydioHttpResourcesManager2['default'].loadClassesAndApply(['AdminLogs'], function () {
                    _this.setState({ tab: 'audit' });
                });
            }
        }
    }, {
        key: 'handleLogToolsChange',
        value: function handleLogToolsChange(state) {
            this.setState({ logToolsState: state });
        }
    }, {
        key: 'handleLoadingStatusChange',
        value: function handleLoadingStatusChange(status) {
            this.setState({ logsLoading: status });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var tab = _state.tab;
            var logToolsState = _state.logToolsState;

            var tabs = [{ Value: 'dashboard', Label: 'Dashboard', Icon: 'mdi mdi-view-dashboard' }, { Value: 'audit', Label: 'Activity', Icon: 'mdi mdi-pulse' }];
            var buttons = [];
            if (tab === 'audit') {
                buttons.push(_react2['default'].createElement(AdminLogs.LogTools, { pydio: pydio, service: 'audit', onStateChange: this.handleLogToolsChange.bind(this) }));
            }

            var mainContent = undefined;
            if (tab === 'dashboard') {
                //mainContent = <SimpleDashboard {...this.props}/>
                mainContent = _react2['default'].createElement(_AdvancedDashboard2['default'], this.props);
            } else if (tab === 'audit') {
                mainContent = _react2['default'].createElement(AdminLogs.Dashboard, _extends({ ref: 'logBoard' }, this.props, logToolsState, { noHeader: true, service: 'audit', onLoadingStatusChange: this.handleLoadingStatusChange.bind(this) }));
            }

            return _react2['default'].createElement(
                'div',
                { className: 'main-layout-nav-to-stack vertical-layout workspaces-board' },
                _react2['default'].createElement(
                    'div',
                    { className: 'vertical-layout layout-fill', style: { width: '100%' } },
                    _react2['default'].createElement(_Header2['default'], {
                        tabs: tabs,
                        onTabChange: this.onTabChange.bind(this),
                        tabValue: tab,
                        actions: buttons,
                        reloadAction: tab === 'audit' ? function () {
                            _this2.refs.logBoard.handleReload();
                        } : undefined,
                        loading: this.state.logsLoading
                    }),
                    _react2['default'].createElement(
                        'div',
                        { className: 'layout-fill' },
                        mainContent
                    )
                )
            );
        }
    }]);

    return TabBoard;
})(_react2['default'].Component);

exports['default'] = TabBoard;
module.exports = exports['default'];

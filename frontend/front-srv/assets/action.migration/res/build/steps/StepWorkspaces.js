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

var _workspacesLoader = require("../workspaces/Loader");

var _workspacesLoader2 = _interopRequireDefault(_workspacesLoader);

var _workspacesMapper = require("../workspaces/Mapper");

var _workspacesMapper2 = _interopRequireDefault(_workspacesMapper);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var StepWorkspaces = (function (_React$Component) {
    _inherits(StepWorkspaces, _React$Component);

    function StepWorkspaces(props) {
        _classCallCheck(this, StepWorkspaces);

        _get(Object.getPrototypeOf(StepWorkspaces.prototype), 'constructor', this).call(this, props);
        this._loader = new _workspacesLoader2['default']();

        this.state = {
            loaded: false,
            workspaces: [],
            cellsWorkspaces: []
        };
    }

    _createClass(StepWorkspaces, [{
        key: 'T',
        value: function T(id) {
            var m = _pydio2['default'].getInstance().MessageHash;
            return m['migration.step.ws.' + id] || m['migration.' + id] || m[id] || id;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            var _props = this.props;
            var url = _props.url;
            var user = _props.user;
            var pwd = _props.pwd;

            AdminWorkspaces.Workspace.listWorkspaces().then(function (wsResponse) {
                _this.setState({ cellsWorkspaces: wsResponse.Workspaces || [] });
            }).then(function () {
                _this._loader.loadWorkspaces(url, user, pwd)['catch'](function (err) {
                    _this.setState({ err: err, loaded: true });
                }).then(function (workspaces) {
                    _this.setState({ workspaces: workspaces, loaded: true });
                });
            });
        }
    }, {
        key: 'startListeningToJob',
        value: function startListeningToJob() {
            var _this2 = this;

            this._loader = new _workspacesLoader2['default']();
            this._loader.observe('progress', function (memo) {
                _this2.setState({ workspacesProgress: memo });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var onChange = _props2.onChange;
            var onComplete = _props2.onComplete;
            var onBack = _props2.onBack;
            var openRightPane = _props2.openRightPane;
            var closeRightPane = _props2.closeRightPane;
            var pydio = _props2.pydio;
            var styles = _props2.styles;
            var _state = this.state;
            var workspaces = _state.workspaces;
            var cellsWorkspaces = _state.cellsWorkspaces;
            var loaded = _state.loaded;

            if (!loaded) {
                return _react2['default'].createElement(
                    _materialUi.Step,
                    this.props,
                    _react2['default'].createElement(
                        _materialUi.StepLabel,
                        null,
                        this.T('title'),
                        ' ',
                        this.T('loading')
                    ),
                    _react2['default'].createElement(
                        _materialUi.StepContent,
                        null,
                        _react2['default'].createElement(
                            'div',
                            { style: { textAlign: 'center', padding: 40 } },
                            _react2['default'].createElement(_materialUi.CircularProgress, { mode: "indeterminate" })
                        )
                    )
                );
            }

            return _react2['default'].createElement(
                _materialUi.Step,
                this.props,
                _react2['default'].createElement(
                    _materialUi.StepLabel,
                    null,
                    this.T('title')
                ),
                _react2['default'].createElement(
                    _materialUi.StepContent,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.stepLegend },
                        this.T('legend'),
                        _react2['default'].createElement(
                            'ul',
                            null,
                            _react2['default'].createElement(
                                'li',
                                null,
                                this.T('step1')
                            ),
                            _react2['default'].createElement(
                                'li',
                                null,
                                this.T('step2')
                            ),
                            _react2['default'].createElement(
                                'li',
                                null,
                                this.T('step3')
                            ),
                            _react2['default'].createElement(
                                'li',
                                null,
                                this.T('step4')
                            )
                        )
                    ),
                    _react2['default'].createElement(_workspacesMapper2['default'], {
                        cellsWorkspaces: cellsWorkspaces,
                        workspaces: workspaces.filter(function (ws) {
                            return (ws.accessType === 'fs' || ws.accessType === 's3') && !ws.isTemplate;
                        }),
                        onBack: function () {
                            return onBack();
                        },
                        pydio: pydio,
                        openRightPane: openRightPane,
                        closeRightPane: closeRightPane,
                        onMapped: function (data) {
                            var mapping = data.mapping;
                            var create = data.create;
                            var existing = data.existing;

                            onChange({ workspaceMapping: mapping, workspaceCreate: create, workspaceExisting: existing });
                            onComplete();
                        }
                    })
                )
            );
        }
    }]);

    return StepWorkspaces;
})(_react2['default'].Component);

exports['default'] = StepWorkspaces;
module.exports = exports['default'];

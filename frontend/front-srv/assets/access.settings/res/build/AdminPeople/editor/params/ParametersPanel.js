'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ParameterEntry = require('./ParameterEntry');

var _ParameterEntry2 = _interopRequireDefault(_ParameterEntry);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var ParametersPanel = (function (_React$Component) {
    _inherits(ParametersPanel, _React$Component);

    function ParametersPanel(props) {
        var _this = this;

        _classCallCheck(this, ParametersPanel);

        _get(Object.getPrototypeOf(ParametersPanel.prototype), 'constructor', this).call(this, props);
        this.state = { actions: {}, parameters: {}, workspaces: {} };
        var api = new _pydioHttpRestApi.WorkspaceServiceApi(PydioApi.getRestClient());
        var request = new _pydioHttpRestApi.RestSearchWorkspaceRequest();
        request.Queries = [_pydioHttpRestApi.IdmWorkspaceSingleQuery.constructFromObject({
            scope: 'ADMIN'
        })];
        api.searchWorkspaces(request).then(function (collection) {
            var wss = collection.Workspaces || [];
            var workspaces = {};
            wss.forEach(function (ws) {
                workspaces[ws.UUID] = ws;
            });
            _this.setState({ workspaces: workspaces });
        });
    }

    _createClass(ParametersPanel, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var loader = AdminComponents.PluginsLoader.getInstance(this.props.pydio);
            loader.allPluginsActionsAndParameters().then(function (plugins) {
                _this2.setState({ actions: plugins.ACTIONS, parameters: plugins.PARAMETERS });
            });
        }
    }, {
        key: 'onCreateParameter',
        value: function onCreateParameter(scope, type, pluginName, paramName, attributes) {
            var role = this.props.role;

            var aclKey = type + ':' + pluginName + ':' + paramName;
            var value = undefined;
            //console.log(scope, type, pluginName, paramName, attributes);
            if (type === 'action') {
                value = false;
            } else if (attributes && attributes.xmlNode) {
                var xmlNode = attributes.xmlNode;
                value = xmlNode.getAttribute('default') ? xmlNode.getAttribute('default') : "";
                if (xmlNode.getAttribute('type') === 'boolean') {
                    value = value === "true";
                } else if (xmlNode.getAttribute('type') === 'integer') {
                    value = parseInt(value);
                }
            }
            role.setParameter(aclKey, value, scope);
        }
    }, {
        key: 'addParameter',
        value: function addParameter(scope) {
            var _this3 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var roleType = _props.roleType;
            var _state = this.state;
            var actions = _state.actions;
            var parameters = _state.parameters;

            pydio.UI.openComponentInModal('AdminPeople', 'ParameterCreate', {
                pydio: pydio,
                actions: actions,
                parameters: parameters,
                workspaceScope: scope,
                createParameter: function createParameter(type, pluginName, paramName, attributes) {
                    _this3.onCreateParameter(scope, type, pluginName, paramName, attributes);
                },
                roleType: roleType
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props2 = this.props;
            var role = _props2.role;
            var pydio = _props2.pydio;

            if (!role) {
                return null;
            }
            var workspaces = this.state.workspaces;

            var m = function m(id) {
                return pydio.MessageHash['pydio_role.' + id] || id;
            };

            var params = role.listParametersAndActions();
            var scopes = {
                PYDIO_REPO_SCOPE_ALL: {},
                PYDIO_REPO_SCOPE_SHARED: {}
            };

            params.forEach(function (a) {
                if (!scopes[a.WorkspaceID]) {
                    scopes[a.WorkspaceID] = {};
                }

                var _a$Action$Name$split = a.Action.Name.split(':');

                var _a$Action$Name$split2 = _slicedToArray(_a$Action$Name$split, 3);

                var type = _a$Action$Name$split2[0];
                var pluginId = _a$Action$Name$split2[1];
                var paramName = _a$Action$Name$split2[2];

                scopes[a.WorkspaceID][paramName] = a;
            });
            var wsItems = [_react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('parameters.scope.selector.title'), value: 1 }), _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('parameters.scope.all'), onTouchTap: function () {
                    _this4.addParameter('PYDIO_REPO_SCOPE_ALL');
                } }), _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('parameters.scope.shared'), onTouchTap: function () {
                    _this4.addParameter('PYDIO_REPO_SCOPE_SHARED');
                } }), _react2['default'].createElement(_materialUi.Divider, null)].concat(Object.keys(workspaces).map(function (ws) {
                return _react2['default'].createElement(_materialUi.MenuItem, { primaryText: workspaces[ws].Label, onTouchTap: function () {
                        _this4.addParameter(ws);
                    } });
            }));

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'h3',
                    { className: 'paper-right-title', style: { display: 'flex' } },
                    _react2['default'].createElement(
                        'span',
                        { style: { flex: 1, paddingRight: 20 } },
                        m('46'),
                        _react2['default'].createElement(
                            'div',
                            { className: "section-legend" },
                            m('47')
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 160 } },
                        _react2['default'].createElement(
                            _materialUi.SelectField,
                            { fullWidth: true, value: 1 },
                            wsItems
                        )
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    Object.keys(scopes).map(function (s) {
                        var scopeLabel = undefined;
                        var odd = false;
                        if (s === 'PYDIO_REPO_SCOPE_ALL') {
                            scopeLabel = m('parameters.scope.all');
                        } else if (s === 'PYDIO_REPO_SCOPE_SHARED') {
                            scopeLabel = m('parameters.scope.shared');
                        } else if (workspaces[s]) {
                            scopeLabel = m('parameters.scope.workspace').replace('%s', workspaces[s].Label);
                        } else {
                            scopeLabel = m('parameters.scope.workspace').replace('%s', s);
                        }
                        var entries = undefined;
                        if (Object.keys(scopes[s]).length) {
                            entries = Object.keys(scopes[s]).map(function (param) {
                                var style = { backgroundColor: odd ? '#FAFAFA' : 'white' };
                                odd = !odd;
                                return _react2['default'].createElement(_ParameterEntry2['default'], _extends({ pydio: pydio, acl: scopes[s][param], role: role }, _this4.state, { style: style }));
                            });
                        } else {
                            entries = _react2['default'].createElement(
                                'tr',
                                null,
                                _react2['default'].createElement(
                                    'td',
                                    { colSpan: 3, style: { padding: '14px 0' } },
                                    m('parameters.empty')
                                )
                            );
                        }
                        return _react2['default'].createElement(
                            'table',
                            { style: { width: '100%', marginBottom: 20 } },
                            _react2['default'].createElement(
                                'tr',
                                { style: { borderBottom: '1px solid #e0e0e0' } },
                                _react2['default'].createElement(
                                    'td',
                                    { colSpan: 2, style: { fontSize: 15, paddingTop: 10 } },
                                    scopeLabel
                                ),
                                _react2['default'].createElement(
                                    'td',
                                    { style: { width: 50 } },
                                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", onTouchTap: function () {
                                            _this4.addParameter(s);
                                        }, tooltip: m('parameters.custom.add') })
                                )
                            ),
                            entries
                        );
                    })
                )
            );
        }
    }]);

    return ParametersPanel;
})(_react2['default'].Component);

exports['default'] = ParametersPanel;
module.exports = exports['default'];

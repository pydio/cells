'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _styles = require('./styles');

var _actionsEditor = require("../actions/editor");

var _FormLoader = require('./FormLoader');

var _FormLoader2 = _interopRequireDefault(_FormLoader);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var PydioForm = _pydio2['default'].requireLib('form');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib.ModernSelectField;
var ModernTextField = _Pydio$requireLib.ModernTextField;

var FormPanel = (function (_React$Component) {
    _inherits(FormPanel, _React$Component);

    function FormPanel(props) {
        _classCallCheck(this, FormPanel);

        _get(Object.getPrototypeOf(FormPanel.prototype), 'constructor', this).call(this, props);
        var action = props.action;

        this.state = {
            action: _pydioHttpRestApi.JobsAction.constructFromObject(JSON.parse(JSON.stringify(action))),
            actionInfo: this.getActionInfo(action),
            valid: true
        };
    }

    _createClass(FormPanel, [{
        key: 'getActionInfo',
        value: function getActionInfo(action) {
            var actions = this.props.actions;

            var actionInfo = undefined;
            if (actions[action.ID]) {
                actionInfo = actions[action.ID];
                if (actionInfo.HasForm) {
                    this.loadForm(action.ID);
                }
            } else if (action.ID === _actionsEditor.JOB_ACTION_EMPTY) {
                actionInfo = {
                    Name: _actionsEditor.JOB_ACTION_EMPTY,
                    Label: 'Create Action',
                    Icon: 'chip',
                    Description: ''
                };
            } else {
                actionInfo = {
                    Name: action.ID,
                    Label: action.ID,
                    Icon: 'chip',
                    Description: 'No description provided'
                };
            }
            return actionInfo;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.action !== this.state.action || nextProps.create !== this.props.create) {
                this.setState({
                    action: _pydioHttpRestApi.JobsAction.constructFromObject(JSON.parse(JSON.stringify(nextProps.action))),
                    actionInfo: this.getActionInfo(nextProps.action),
                    formParams: null
                });
            }
        }
    }, {
        key: 'loadForm',
        value: function loadForm(actionID) {
            var _this = this;

            _FormLoader2['default'].loadAction(actionID).then(function (params) {
                var _props = _this.props;
                var create = _props.create;
                var onLoaded = _props.onLoaded;

                _this.setState({ formParams: params }, function () {
                    if (onLoaded && !(_this.formsLoaded && _this.formsLoaded[actionID])) {
                        if (!_this.formsLoaded) {
                            _this.formsLoaded = {};
                        }
                        _this.formsLoaded[actionID] = true;
                        console.log("ONLOADED");
                        onLoaded();
                    }
                });
                if (create) {
                    (function () {
                        var defaults = {};
                        params.forEach(function (p) {
                            if (p['default']) {
                                defaults[p.name] = p['default'];
                            }
                        });
                        if (Object.keys(defaults).length) {
                            _this.onFormChange(defaults);
                        }
                    })();
                }
            });
        }

        /**
         * Convert standard json to map[string]string for Parameters field
         * @param params
         */
    }, {
        key: 'toStringString',
        value: function toStringString() {
            var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var map = {};
            Object.keys(params).forEach(function (k) {
                var value = params[k];
                var v = undefined;
                switch (typeof value) {
                    case 'string':
                        v = value;
                        break;
                    case 'number':
                        v = '' + value;
                        break;
                    case 'boolean':
                        v = value ? 'true' : 'false';
                        break;
                    default:
                        v = '' + value;
                }
                map[k] = v;
            });
            return map;
        }

        /**
         * Convert map[string]string to form usable parameters
         * @param params
         * @param map
         */
    }, {
        key: 'fromStringString',
        value: function fromStringString(params) {
            var map = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if (!map) {
                map = {};
            }
            var values = {};
            params.forEach(function (p) {
                if (map[p.name]) {
                    if (p.type === 'boolean') {
                        values[p.name] = map[p.name] === 'true';
                    } else if (p.type === 'integer') {
                        values[p.name] = parseInt(map[p.name]);
                    } else {
                        values[p.name] = map[p.name];
                    }
                }
            });
            return values;
        }
    }, {
        key: 'onFormChange',
        value: function onFormChange(values) {
            var action = this.state.action;

            action.Parameters = this.toStringString(values);
            this.setState({ action: action, dirty: true });
        }
    }, {
        key: 'onLabelChange',
        value: function onLabelChange(value) {
            var action = this.state.action;

            action.Label = value ? value.substr(0, 20) : undefined;
            this.setState({ action: action, dirty: true });
        }
    }, {
        key: 'onDescriptionChange',
        value: function onDescriptionChange(value) {
            var action = this.state.action;

            action.Description = value;
            this.setState({ action: action, dirty: true });
        }
    }, {
        key: 'onValidStatusChange',
        value: function onValidStatusChange(valid, failing) {
            this.setState({ valid: valid });
        }
    }, {
        key: 'onIdChange',
        value: function onIdChange(id) {
            var action = this.state.action;

            action.ID = id;
            // Refresh state
            var newActionInfo = this.getActionInfo(action);
            if (!newActionInfo.HasForm) {
                this.setState({ formParams: null, valid: true });
            }
            this.setState({
                action: action,
                actionInfo: newActionInfo
            });
        }
    }, {
        key: 'actionPicker',
        value: function actionPicker() {
            var _this2 = this;

            var actions = this.props.actions;
            var action = this.state.action;

            // Group by categories and sort
            var categs = {};
            Object.keys(actions).forEach(function (id) {
                var c = actions[id].Category || 'No category';
                if (!categs[c]) {
                    categs[c] = [];
                }
                categs[c].push(actions[id]);
            });
            var options = [];
            var cKeys = Object.keys(categs);
            cKeys.sort();
            cKeys.forEach(function (c) {
                options.push(_react2['default'].createElement(
                    _materialUi.Subheader,
                    null,
                    c
                ));
                categs[c].sort(function (a, b) {
                    return a.Label > b.Label ? 1 : -1;
                });
                categs[c].forEach(function (a) {
                    options.push(_react2['default'].createElement(_materialUi.MenuItem, { primaryText: a.Label || a.Name, value: a.Name }));
                });
            });
            return _react2['default'].createElement(
                ModernSelectField,
                {
                    fullWidth: true,
                    value: action.ID,
                    onChange: function (ev, i, value) {
                        _this2.onIdChange(value);
                    }
                },
                [_react2['default'].createElement(_materialUi.MenuItem, { value: _actionsEditor.JOB_ACTION_EMPTY, primaryText: "Please pick an action" })].concat(options)
            );
        }
    }, {
        key: 'save',
        value: function save() {
            var _props2 = this.props;
            var onChange = _props2.onChange;
            var onDismiss = _props2.onDismiss;
            var action = this.state.action;

            onChange(action);
            this.setState({ dirty: false });
            //onDismiss();
        }
    }, {
        key: 'revert',
        value: function revert() {
            var original = this.props.action;
            this.setState({
                action: _pydioHttpRestApi.JobsAction.constructFromObject(JSON.parse(JSON.stringify(original))),
                dirty: false
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props3 = this.props;
            var onDismiss = _props3.onDismiss;
            var onRemove = _props3.onRemove;
            var create = _props3.create;
            var inDialog = _props3.inDialog;
            var _state = this.state;
            var actionInfo = _state.actionInfo;
            var action = _state.action;
            var formParams = _state.formParams;
            var dirty = _state.dirty;
            var valid = _state.valid;

            var save = undefined,
                revert = undefined;
            if (!create && dirty && valid) {
                save = function () {
                    return _this3.save();
                };
                revert = function () {
                    return _this3.revert();
                };
            }
            var form = undefined;
            if (formParams && formParams.length && formParams[0].type === 'textarea' && formParams[0].choices === 'json:content-type:text/go') {
                //Switch to CodeMirror component
                var value = '';
                if (action.Parameters && action.Parameters[formParams[0].name]) {
                    value = action.Parameters[formParams[0].name];
                }
                form = _react2['default'].createElement(
                    'div',
                    { style: { border: '1px solid #e0e0e0', margin: '0 10px', borderRadius: 3 } },
                    _react2['default'].createElement(AdminComponents.CodeMirrorField, {
                        value: value,
                        onChange: function (e, v) {
                            var values = {};
                            values[formParams[0].name] = v;
                            _this3.onFormChange(values);
                            _this3.setState({ valid: !!v });
                        }
                    })
                );
            } else if (formParams) {
                form = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(PydioForm.FormPanel, {
                        ref: 'formPanel',
                        depth: -1,
                        parameters: formParams,
                        values: this.fromStringString(formParams, action.Parameters),
                        onChange: this.onFormChange.bind(this),
                        onValidStatusChange: this.onValidStatusChange.bind(this)
                    })
                );
            }

            var children = [];
            if (create && !inDialog) {
                children.push(_react2['default'].createElement(
                    'div',
                    { style: { padding: 10 } },
                    this.actionPicker()
                ));
            }
            children.push(_react2['default'].createElement(
                'div',
                { style: { padding: 12, fontWeight: 300, fontSize: 13 } },
                actionInfo.Description
            ));
            children.push(form);
            if (action.ID !== _actionsEditor.JOB_ACTION_EMPTY) {
                children.push(_react2['default'].createElement(
                    'div',
                    { style: { padding: '0 12px', marginTop: -6 } },
                    _react2['default'].createElement(ModernTextField, { hintText: "Custom label (optional - 20 chars max)", value: action.Label, onChange: function (e, v) {
                            _this3.onLabelChange(v);
                        }, fullWidth: true }),
                    _react2['default'].createElement(ModernTextField, { hintText: "Comment (optional)", style: { marginTop: -2 }, multiLine: true, value: action.Description, onChange: function (e, v) {
                            _this3.onDescriptionChange(v);
                        }, fullWidth: true })
                ));
            }
            if (create) {
                children.push(_react2['default'].createElement(
                    'div',
                    { style: { padding: 10, textAlign: 'right' } },
                    _react2['default'].createElement(_materialUi.RaisedButton, {
                        primary: true,
                        label: "Create Action",
                        disabled: action.ID === _actionsEditor.JOB_ACTION_EMPTY || !valid,
                        onTouchTap: function () {
                            _this3.save();onDismiss();
                        } })
                ));
            }
            if (inDialog) {
                return _react2['default'].createElement(
                    'div',
                    { style: this.props.style },
                    children
                );
            } else {
                return _react2['default'].createElement(
                    _styles.RightPanel,
                    {
                        title: actionInfo.Label,
                        icon: actionInfo.Icon,
                        onDismiss: onDismiss,
                        saveButtons: !create,
                        onSave: save,
                        onRevert: revert,
                        onRemove: onRemove
                    },
                    children
                );
            }
        }
    }]);

    return FormPanel;
})(_react2['default'].Component);

exports['default'] = FormPanel;
module.exports = exports['default'];

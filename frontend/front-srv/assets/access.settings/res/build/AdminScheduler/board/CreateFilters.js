/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _builderQueryBuilder = require("./builder/QueryBuilder");

var _builderQueryBuilder2 = _interopRequireDefault(_builderQueryBuilder);

var _graphTplManager = require("./graph/TplManager");

var _graphTplManager2 = _interopRequireDefault(_graphTplManager);

var _Pydio$requireLib = _pydio2['default'].requireLib("components");

var Stepper = _Pydio$requireLib.Stepper;
var Dialog = Stepper.Dialog;
var PanelBigButtons = Stepper.PanelBigButtons;

var tints = {
    nodes: '',
    idm: '#438db3',
    context: '#795649',
    output: '#009688',
    preset: '#F57C00'
};

var presetTagStyle = {
    display: 'inline-block',
    backgroundColor: tints.preset,
    padding: '0 5px',
    marginRight: 5,
    borderRadius: 5,
    color: 'white',
    fontSize: 12,
    lineHeight: '17px'
};

var types = {
    filters: {
        nodes: {
            title: 'Files and folders',
            Actions: [{
                title: 'Filter file or folder',
                description: 'Exclude files or folders based on various criteria',
                icon: 'mdi mdi-file-tree',
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsNodesSelector.constructFromObject({}), type: '' };
                }
            }]
        },
        idm: {
            title: 'Identity Management',
            Actions: [{
                title: 'Filter User',
                description: 'Set criteria like profile, roles, group, etc... to match specific users or groups',
                icon: 'mdi mdi-account',
                tint: tints.idm,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'User' }), type: 'idm' };
                }
            }, {
                title: 'Filter Workspaces',
                description: 'Set criteria like Scope (workspace/cell/link), uuid, etc... to match specific workspaces',
                icon: 'mdi mdi-folder',
                tint: tints.idm,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Workspace' }), type: 'idm' };
                }
            }, {
                title: 'Filter Roles',
                description: 'Set criteria to match specific roles. You can differentiate admin-defined roles, user teams, user roles, etc.',
                icon: 'mdi mdi-account-card-details',
                tint: tints.idm,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Role' }), type: 'idm' };
                }
            }, {
                title: 'Filter ACL',
                description: 'Set criteria to match specific Access Control List, by node, role and workspace UUIDs',
                icon: 'mdi mdi-view-list',
                tint: tints.idm,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Role' }), type: 'idm' };
                }
            }]
        },
        context: {
            title: 'Request Context',
            Actions: [{
                title: 'Request Metadata',
                description: 'Match specific informations carried by request, like User-Agent, IP of client connection, etc.',
                icon: 'mdi mdi-tag',
                tint: tints.context,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsContextMetaFilter.constructFromObject({}), type: 'context' };
                }
            }, {
                title: 'Request User',
                description: 'Match currently logged user attributes (like profile, roles, etc.)',
                icon: 'mdi mdi-account',
                tint: tints.context,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsContextMetaFilter.constructFromObject({ Type: 'ContextUser' }), type: 'context' };
                }
            }]
        },
        output: {
            title: 'Previous action output',
            Actions: [{
                title: 'Filter Action Output',
                description: 'Actions append data to their input and send to the next one. This filter applies to the previous action output.',
                icon: 'mdi mdi-code-braces',
                tint: tints.output,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsActionOutputFilter.constructFromObject({}), type: 'output' };
                }
            }]
        }

    },
    selectors: {
        nodes: {
            title: 'Files and folders',
            Actions: [{
                title: 'Select files or folders',
                description: 'Lookup existing files and folders matching various search criteria',
                icon: 'mdi mdi-file-tree',
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsNodesSelector.constructFromObject({}), type: '' };
                }
            }]
        },
        idm: {
            title: 'Identity Management',
            Actions: [{
                title: 'Select Users',
                description: 'Lookup existing users and groups matching various search criteria',
                icon: 'mdi mdi-account',
                tint: tints.idm,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'User' }), type: 'idm' };
                }
            }, {
                title: 'Select Workspaces',
                description: 'Lookup existing workspaces matching various search criteria',
                icon: 'mdi mdi-folder',
                tint: tints.idm,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Workspace' }), type: 'idm' };
                }
            }, {
                title: 'Select Roles',
                description: 'Lookup existing roles matching various search criteria',
                icon: 'mdi mdi-account-card-details',
                tint: tints.idm,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Role' }), type: 'idm' };
                }
            }, {
                title: 'Select ACL',
                description: 'Lookup specific ACLs matching your search criteria',
                icon: 'mdi mdi-view-list',
                tint: tints.idm,
                value: function value() {
                    return { model: _pydioHttpRestApi.JobsIdmSelector.constructFromObject({ Type: 'Acl' }), type: 'idm' };
                }
            }]
        }
    }
};

var CreateFilters = (function (_React$Component) {
    _inherits(CreateFilters, _React$Component);

    function CreateFilters(props) {
        _classCallCheck(this, CreateFilters);

        _get(Object.getPrototypeOf(CreateFilters.prototype), 'constructor', this).call(this, props);
        this.state = { filter: '', templates: {} };
    }

    _createClass(CreateFilters, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next) {
            if (next.open && !this.props.open) {
                this.loadTemplates(next.open);
            }
        }
    }, {
        key: 'loadTemplates',
        value: function loadTemplates(open) {
            var _this = this;

            _graphTplManager2['default'].getInstance().listSelectors().then(function (result) {
                if (open === 'selector') {
                    _this.setState({ templates: result['selectors'] });
                } else {
                    _this.setState({ templates: result['filters'] });
                }
            });
        }
    }, {
        key: 'dismiss',
        value: function dismiss() {
            this.setState({ action: null, model: null, type: '', random: null });
            var onDismiss = this.props.onDismiss;

            onDismiss();
        }
    }, {
        key: 'insert',
        value: function insert(model, type) {
            var onSubmit = this.props.onSubmit;

            onSubmit(model, type);
            //console.log(model, type);
            this.setState({ action: null, model: null, type: '', random: null });
        }
    }, {
        key: 'actionFromList',
        value: function actionFromList(value) {
            var selectors = this.props.selectors;

            var a = undefined;
            var data = selectors ? types.selectors : types.filters;
            Object.keys(data).forEach(function (k) {
                data[k].Actions.forEach(function (action) {
                    if (action.value === value) {
                        a = action;
                    }
                });
            });
            return a;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var open = _props.open;
            var selectors = _props.selectors;
            var _state = this.state;
            var filter = _state.filter;
            var model = _state.model;
            var action = _state.action;
            var random = _state.random;
            var templates = _state.templates;

            var title = undefined,
                content = undefined,
                dialogFilter = undefined,
                dialogProps = {};
            if (action) {
                var icon = action.icon || (selectors ? 'mdi mdi-magnify' : 'mdi mdi-chip');
                title = _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement(_materialUi.FontIcon, { style: { marginRight: 8 }, className: icon, color: action.tint }),
                    action.title
                );
                content = [_react2['default'].createElement(_builderQueryBuilder2['default'], {
                    cloner: function (d) {
                        return d;
                    },
                    query: model,
                    queryType: selectors ? 'selector' : 'filter',
                    style: {},
                    autoSave: true,
                    inDialog: true,
                    onRemoveFilter: function (modelType) {},
                    onSave: function (newData) {
                        _this2.setState({ model: newData, random: Math.random() });
                    }
                }), _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', padding: '24px 0 0' } },
                    _react2['default'].createElement(_materialUi.FlatButton, { label: "<< Change", 'default': true, onTouchTap: function () {
                            _this2.setState({ model: null, action: null, type: '' });
                        } }),
                    _react2['default'].createElement('span', { style: { flex: 1 } }),
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: "Insert", primary: true, onTouchTap: function () {
                            var _state2 = _this2.state;
                            var model = _state2.model;
                            var type = _state2.type;

                            _this2.insert(model, type);
                        } })
                )];

                dialogProps = {
                    bodyStyle: {
                        backgroundColor: 'white',
                        padding: 12,
                        overflow: 'visible'
                    },
                    contentStyle: {
                        maxWidth: 800
                    }
                };
            } else {
                (function () {

                    var bbModel = { Sections: [] };
                    var data = selectors ? types.selectors : types.filters;
                    Object.keys(data).forEach(function (k) {
                        // TODO : TRANSLATE
                        var dd = data[k];
                        var aa = dd.Actions;
                        if (filter) {
                            aa = aa.filter(function (a) {
                                return a.title.toLowerCase().indexOf(filter) > -1 || a.description.toLowerCase().indexOf(filter) > -1;
                            });
                        }
                        var section = { title: dd.title, Actions: [] };
                        section.Actions = aa.map(function (a) {
                            var title = a.title;
                            if (a.preset) {
                                title = _react2['default'].createElement(
                                    'span',
                                    null,
                                    _react2['default'].createElement(
                                        'span',
                                        { style: presetTagStyle },
                                        'preset'
                                    ),
                                    a.title
                                );
                            }
                            return _extends({}, a, { title: title });
                        });
                        // Add templates
                        if (templates[k] && templates[k].length) {
                            templates[k].forEach(function (tpl) {
                                var value = undefined,
                                    icon = undefined,
                                    tint = undefined;
                                switch (k) {
                                    case "nodes":
                                        value = function () {
                                            return { model: _pydioHttpRestApi.JobsNodesSelector.constructFromObject(JSON.parse(JSON.stringify(tpl.NodesSelector))), type: k };
                                        };
                                        icon = 'mdi mdi-file-tree';
                                        break;
                                    case "idm":
                                        value = function () {
                                            return { model: _pydioHttpRestApi.JobsIdmSelector.constructFromObject(JSON.parse(JSON.stringify(tpl.IdmSelector))), type: k };
                                        };
                                        icon = 'mdi mdi-account';
                                        break;
                                    case "output":
                                        value = function () {
                                            return { model: _pydioHttpRestApi.JobsActionOutputFilter.constructFromObject(JSON.parse(JSON.stringify(tpl.ActionOutputFilter))), type: k };
                                        };
                                        icon = 'mdi mdi-code-braces';
                                        break;
                                    case "context":
                                        value = function () {
                                            return { model: _pydioHttpRestApi.JobsContextMetaFilter.constructFromObject(JSON.parse(JSON.stringify(tpl.ContextMetaFilter))), type: k };
                                        };
                                        icon = 'mdi mdi-tag';
                                        break;
                                    default:
                                        break;
                                }
                                section.Actions.push({
                                    title: _react2['default'].createElement(
                                        'span',
                                        null,
                                        _react2['default'].createElement(
                                            'span',
                                            { style: presetTagStyle },
                                            'preset'
                                        ),
                                        tpl.Label
                                    ),
                                    description: tpl.Description,
                                    icon: icon,
                                    tint: tints[k],
                                    onDelete: function onDelete() {
                                        if (confirm('Do you want to remove this tempalte?')) {
                                            _graphTplManager2['default'].getInstance().deleteSelector(tpl.Name).then(function () {
                                                _this2.loadTemplates(open);
                                            });
                                        }
                                    },
                                    value: value
                                });
                            });
                        }
                        if (section.Actions.length) {
                            bbModel.Sections.push(section);
                        }
                    });
                    //console.log(bbModel);

                    title = selectors ? "Feed input with data" : "Filter data input";
                    content = _react2['default'].createElement(PanelBigButtons, {
                        model: bbModel,
                        onPick: function (constructor) {
                            var action = _this2.actionFromList(constructor);

                            var _constructor = constructor();

                            var model = _constructor.model;
                            var type = _constructor.type;

                            var preset = true;
                            if (action) {
                                preset = action.preset;
                            }
                            if (preset) {
                                _this2.insert(model, type);
                            } else {
                                _this2.setState({ model: model, type: type, action: action, filter: '' });
                            }
                        }
                    });
                    dialogFilter = function (v) {
                        _this2.setState({ filter: v.toLowerCase() });
                    };
                })();
            }

            return _react2['default'].createElement(
                Dialog,
                {
                    title: title,
                    open: open,
                    dialogProps: dialogProps,
                    onDismiss: function () {
                        _this2.dismiss();
                    },
                    onFilter: dialogFilter,
                    random: random
                },
                content
            );
        }
    }]);

    return CreateFilters;
})(_react2['default'].Component);

exports['default'] = CreateFilters;
module.exports = exports['default'];

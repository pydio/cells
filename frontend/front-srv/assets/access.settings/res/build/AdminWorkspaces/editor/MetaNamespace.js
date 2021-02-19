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

/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _cellsSdk = require('cells-sdk');

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _modelMetadata = require('../model/Metadata');

var _modelMetadata2 = _interopRequireDefault(_modelMetadata);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib.ModernSelectField;
var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernStyles = _Pydio$requireLib.ModernStyles;

var MetaNamespace = (function (_React$Component) {
    _inherits(MetaNamespace, _React$Component);

    function MetaNamespace(props) {
        _classCallCheck(this, MetaNamespace);

        _get(Object.getPrototypeOf(MetaNamespace.prototype), 'constructor', this).call(this, props);
        this.state = {
            namespace: this.cloneNs(props.namespace),
            m: function m(id) {
                return props.pydio.MessageHash['ajxp_admin.metadata.' + id];
            },
            selectorNewKey: '',
            selectorNewValue: ''
        };
    }

    _createClass(MetaNamespace, [{
        key: 'cloneNs',
        value: function cloneNs(ns) {
            return _cellsSdk.IdmUserMetaNamespace.constructFromObject(JSON.parse(JSON.stringify(ns)));
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(props) {
            this.setState({ namespace: this.cloneNs(props.namespace) });
        }
    }, {
        key: 'updateType',
        value: function updateType(value) {
            var namespace = this.state.namespace;

            namespace.JsonDefinition = JSON.stringify({ type: value });
            this.setState({ namespace: namespace });
        }
    }, {
        key: 'updateName',
        value: function updateName(value) {
            var namespace = this.state.namespace;

            var slug = _pydioUtilLang2['default'].computeStringSlug(value);
            if (slug.indexOf('usermeta-') !== 0) {
                slug = 'usermeta-' + slug;
            }
            namespace.Namespace = slug;
            this.setState({ namespace: namespace });
        }
    }, {
        key: 'save',
        value: function save() {
            var _this = this;

            var namespace = this.state.namespace;

            _modelMetadata2['default'].putNS(namespace).then(function () {
                _this.props.onRequestClose();
                _this.props.reloadList();
            });
        }
    }, {
        key: 'getSelectionData',
        value: function getSelectionData() {
            var namespace = this.state.namespace;

            var data = {};
            try {
                var current = JSON.parse(namespace.JsonDefinition).data;
                if (current) {
                    current.split(',').map(function (line) {
                        var _line$split = line.split('|');

                        var _line$split2 = _slicedToArray(_line$split, 2);

                        var key = _line$split2[0];
                        var value = _line$split2[1];

                        data[key] = value;
                    });
                }
            } catch (e) {}
            return data;
        }
    }, {
        key: 'setSelectionData',
        value: function setSelectionData(newData) {
            var namespace = this.state.namespace;

            var def = JSON.parse(namespace.JsonDefinition);

            def.data = Object.keys(newData).map(function (k) {
                return k + '|' + newData[k];
            }).join(',');
            namespace.JsonDefinition = JSON.stringify(def);
            this.setState({ namespace: namespace });
        }
    }, {
        key: 'addSelectionValue',
        value: function addSelectionValue() {
            var data = this.getSelectionData();
            var _state = this.state;
            var selectorNewKey = _state.selectorNewKey;
            var selectorNewValue = _state.selectorNewValue;

            var key = _pydioUtilLang2['default'].computeStringSlug(selectorNewKey);
            data[key] = selectorNewValue;
            this.setSelectionData(data);
            this.setState({ selectorNewKey: '', selectorNewValue: '' });
        }
    }, {
        key: 'removeSelectionValue',
        value: function removeSelectionValue(key) {
            var data = this.getSelectionData();
            delete data[key];
            this.setSelectionData(data);
        }
    }, {
        key: 'renderSelectionBoard',
        value: function renderSelectionBoard() {
            var _this2 = this;

            var data = this.getSelectionData();
            var _state2 = this.state;
            var m = _state2.m;
            var selectorNewKey = _state2.selectorNewKey;
            var selectorNewValue = _state2.selectorNewValue;

            return _react2['default'].createElement(
                'div',
                { style: { padding: 10, backgroundColor: '#f5f5f5', borderRadius: 3 } },
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 13 } },
                    m('editor.selection')
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    Object.keys(data).map(function (k) {
                        return _react2['default'].createElement(
                            'div',
                            { key: k, style: { display: 'flex' } },
                            _react2['default'].createElement(
                                'span',
                                null,
                                _react2['default'].createElement(_materialUi.TextField, { value: k, disabled: true, fullWidth: true })
                            ),
                            _react2['default'].createElement(
                                'span',
                                { style: { marginLeft: 10 } },
                                _react2['default'].createElement(_materialUi.TextField, { value: data[k], disabled: true, fullWidth: true })
                            ),
                            _react2['default'].createElement(
                                'span',
                                null,
                                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", onClick: function () {
                                        _this2.removeSelectionValue(k);
                                    } })
                            )
                        );
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex' }, key: "new-selection-key" },
                    _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement(_materialUi.TextField, { value: selectorNewKey, onChange: function (e, v) {
                                _this2.setState({ selectorNewKey: v });
                            }, hintText: m('editor.selection.key'), fullWidth: true })
                    ),
                    _react2['default'].createElement(
                        'span',
                        { style: { marginLeft: 10 } },
                        _react2['default'].createElement(_materialUi.TextField, { value: selectorNewValue, onChange: function (e, v) {
                                _this2.setState({ selectorNewValue: v });
                            }, hintText: m('editor.selection.value'), fullWidth: true })
                    ),
                    _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", onClick: function () {
                                _this2.addSelectionValue();
                            }, disabled: !selectorNewKey || !selectorNewValue })
                    )
                )
            );
        }
    }, {
        key: 'togglePolicies',
        value: function togglePolicies(right, value) {
            var _this3 = this;

            var namespace = this.state.namespace;

            var pol = namespace.Policies || [];
            var newPols = pol.filter(function (p) {
                return p.Action !== right;
            });
            newPols.push(_cellsSdk.ServiceResourcePolicy.constructFromObject({ Action: right, Effect: 'allow', Subject: value ? 'profile:admin' : '*' }));
            namespace.Policies = newPols;
            this.setState({ namespace: namespace }, function () {
                if (right === 'READ' && value) {
                    _this3.togglePolicies('WRITE', true);
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props = this.props;
            var create = _props.create;
            var namespaces = _props.namespaces;
            var pydio = _props.pydio;
            var readonly = _props.readonly;
            var _state3 = this.state;
            var namespace = _state3.namespace;
            var m = _state3.m;

            var title = undefined;
            if (namespace.Label) {
                title = namespace.Label;
            } else {
                title = m('editor.title.create');
            }
            var type = 'string';
            if (namespace.JsonDefinition) {
                type = JSON.parse(namespace.JsonDefinition).type;
            }

            var invalid = false,
                nameError = undefined,
                labelError = undefined;
            if (!namespace.Namespace) {
                invalid = true;
                nameError = m('editor.ns.error');
            }
            if (!namespace.Label) {
                invalid = true;
                labelError = m('editor.label.error');
            }
            if (create) {
                if (namespaces.filter(function (n) {
                    return n.Namespace === namespace.Namespace;
                }).length) {
                    invalid = true;
                    nameError = m('editor.ns.exists');
                }
            }
            if (type === 'choice' && Object.keys(this.getSelectionData()).length === 0) {
                invalid = true;
            }

            var adminRead = undefined,
                adminWrite = undefined;
            if (namespace.Policies) {
                namespace.Policies.map(function (p) {
                    if (p.Subject === 'profile:admin' && p.Action === 'READ') {
                        adminRead = true;
                    }
                    if (p.Subject === 'profile:admin' && p.Action === 'WRITE') {
                        adminWrite = true;
                    }
                });
            }

            var actions = [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: pydio.MessageHash['54'], onClick: this.props.onRequestClose }), _react2['default'].createElement(_materialUi.FlatButton, { primary: true, disabled: invalid || readonly, label: "Save", onClick: function () {
                    _this4.save();
                } })];
            if (type === 'tags' && !readonly) {
                actions.unshift(_react2['default'].createElement(_materialUi.FlatButton, { primary: false, label: m('editor.tags.reset'), onClick: function () {
                        var api = new _cellsSdk.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
                        api.deleteUserMetaTags(namespace.Namespace, "*").then(function () {
                            pydio.UI.displayMessage('SUCCESS', m('editor.tags.cleared').replace('%s', namespace.Namespace));
                        })['catch'](function (e) {
                            pydio.UI.displayMessage('ERROR', e.message);
                        });
                    } }));
            }
            var styles = {
                section: { marginTop: 10, fontWeight: 500, fontSize: 12 }
            };

            return _react2['default'].createElement(
                _materialUi.Dialog,
                {
                    title: title,
                    actions: actions,
                    modal: false,
                    contentStyle: { width: 360 },
                    open: this.props.open,
                    onRequestClose: this.props.onRequestClose,
                    autoScrollBodyContent: true,
                    bodyStyle: { padding: 20 }
                },
                _react2['default'].createElement(ModernTextField, {
                    floatingLabelText: m('namespace'),
                    disabled: !create,
                    value: namespace.Namespace,
                    onChange: function (e, v) {
                        _this4.updateName(v);
                    },
                    fullWidth: true,
                    errorText: nameError
                }),
                _react2['default'].createElement(ModernTextField, {
                    floatingLabelText: m('label'),
                    value: namespace.Label,
                    onChange: function (e, v) {
                        namespace.Label = v;_this4.setState({ namespace: namespace });
                    },
                    fullWidth: true,
                    errorText: labelError,
                    disabled: readonly
                }),
                _react2['default'].createElement(
                    'div',
                    { style: styles.section },
                    m('type')
                ),
                _react2['default'].createElement(
                    ModernSelectField,
                    {
                        hintText: m('type'),
                        value: type,
                        onChange: function (e, i, v) {
                            return _this4.updateType(v);
                        },
                        disabled: readonly,
                        fullWidth: true },
                    Object.keys(_modelMetadata2['default'].MetaTypes).map(function (k) {
                        return _react2['default'].createElement(_materialUi.MenuItem, { value: k, primaryText: _modelMetadata2['default'].MetaTypes[k] });
                    })
                ),
                type === 'choice' && this.renderSelectionBoard(),
                _react2['default'].createElement(
                    'div',
                    { style: styles.section },
                    _pydio2['default'].getInstance().MessageHash[310]
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '6px 0' } },
                    _react2['default'].createElement(_materialUi.Toggle, _extends({ label: m('toggle.index'), disabled: readonly, labelPosition: "left", toggled: namespace.Indexable, onToggle: function (e, v) {
                            namespace.Indexable = v;_this4.setState({ namespace: namespace });
                        } }, ModernStyles.toggleField))
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '6px 0' } },
                    _react2['default'].createElement(_materialUi.Toggle, _extends({ label: m('toggle.read'), disabled: readonly, labelPosition: "left", toggled: adminRead, onToggle: function (e, v) {
                            _this4.togglePolicies('READ', v);
                        } }, ModernStyles.toggleField))
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '6px 0' } },
                    _react2['default'].createElement(_materialUi.Toggle, _extends({ label: m('toggle.write'), labelPosition: "left", disabled: adminRead || readonly, toggled: adminWrite, onToggle: function (e, v) {
                            _this4.togglePolicies('WRITE', v);
                        } }, ModernStyles.toggleField))
                ),
                _react2['default'].createElement(
                    'div',
                    { style: styles.section },
                    m('order')
                ),
                _react2['default'].createElement(ModernTextField, {
                    floatingLabelText: m('order'),
                    value: namespace.Order ? namespace.Order : '0',
                    onChange: function (e, v) {
                        namespace.Order = parseInt(v);_this4.setState({ namespace: namespace });
                    },
                    fullWidth: true,
                    type: "number",
                    readOnly: readonly
                })
            );
        }
    }]);

    return MetaNamespace;
})(_react2['default'].Component);

MetaNamespace.PropTypes = {
    namespace: _propTypes2['default'].instanceOf(_cellsSdk.IdmUserMetaNamespace).isRequired,
    create: _propTypes2['default'].boolean,
    reloadList: _propTypes2['default'].func,
    onRequestClose: _propTypes2['default'].func
};

exports['default'] = MetaNamespace;
module.exports = exports['default'];

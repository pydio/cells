'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _modelMetadata = require('../model/Metadata');

var _modelMetadata2 = _interopRequireDefault(_modelMetadata);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var MetaNamespace = (function (_React$Component) {
    _inherits(MetaNamespace, _React$Component);

    function MetaNamespace(props) {
        _classCallCheck(this, MetaNamespace);

        _get(Object.getPrototypeOf(MetaNamespace.prototype), 'constructor', this).call(this, props);
        this.state = { namespace: this.cloneNs(props.namespace) };
    }

    _createClass(MetaNamespace, [{
        key: 'cloneNs',
        value: function cloneNs(ns) {
            return _pydioHttpRestApi.IdmUserMetaNamespace.constructFromObject(JSON.parse(JSON.stringify(ns)));
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
            var key = _pydioUtilLang2['default'].computeStringSlug(this.refs.newkey.getValue());
            data[key] = this.refs.newvalue.getValue();
            console.log(data);
            this.setSelectionData(data);
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
            return _react2['default'].createElement(
                'div',
                { style: { padding: 10, backgroundColor: '#f5f5f5', borderRadius: 2 } },
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 13 } },
                    'Selection Values'
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    Object.keys(data).map(function (k) {
                        return _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex' } },
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
                                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", onTouchTap: function () {
                                        _this2.removeSelectionValue(k);
                                    } })
                            )
                        );
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex' } },
                    _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement(_materialUi.TextField, { ref: 'newkey', hintText: "Key", fullWidth: true })
                    ),
                    _react2['default'].createElement(
                        'span',
                        { style: { marginLeft: 10 } },
                        _react2['default'].createElement(_materialUi.TextField, { ref: 'newvalue', hintText: "Value", fullWidth: true })
                    ),
                    _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", onTouchTap: function () {
                                _this2.addSelectionValue();
                            } })
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
            newPols.push(_pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({ Action: right, Effect: 'allow', Subject: value ? 'profile:admin' : '*' }));
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
            var namespace = this.state.namespace;

            var title = undefined;
            if (namespace.Label) {
                title = namespace.Label;
            } else {
                title = "Create Namespace";
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
                nameError = 'Choose a namespace for this metadata';
            }
            if (!namespace.Label) {
                invalid = true;
                labelError = 'Metadata label cannot be empty';
            }
            if (create) {
                if (namespaces.filter(function (n) {
                    return n.Namespace === namespace.Namespace;
                }).length) {
                    invalid = true;
                    nameError = 'Name already exists, please pick another one';
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

            var actions = [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: "Cancel", onTouchTap: this.props.onRequestClose }), _react2['default'].createElement(_materialUi.FlatButton, { primary: true, disabled: invalid, label: "Save", onTouchTap: function () {
                    _this4.save();
                } })];
            if (type === 'tags') {
                actions.unshift(_react2['default'].createElement(_materialUi.FlatButton, { primary: false, label: "Reset Tags", onTouchTap: function () {
                        var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
                        api.deleteUserMetaTags(namespace.Namespace, "*").then(function () {
                            pydio.UI.displayMessage('SUCCESS', "Cleared tags for namespace " + namespace.Namespace);
                        })['catch'](function (e) {
                            pydio.UI.displayMessage('ERROR', e.message);
                        });
                    } }));
            }

            return _react2['default'].createElement(
                _materialUi.Dialog,
                {
                    title: title,
                    actions: actions,
                    modal: false,
                    contentStyle: { width: 420 },
                    open: this.props.open,
                    onRequestClose: this.props.onRequestClose,
                    autoScrollBodyContent: true
                },
                _react2['default'].createElement(_materialUi.TextField, {
                    floatingLabelText: "Name",
                    disabled: !create,
                    value: namespace.Namespace,
                    onChange: function (e, v) {
                        _this4.updateName(v);
                    },
                    fullWidth: true,
                    errorText: nameError
                }),
                _react2['default'].createElement(_materialUi.TextField, {
                    floatingLabelText: "Label",
                    value: namespace.Label,
                    onChange: function (e, v) {
                        namespace.Label = v;_this4.setState({ namespace: namespace });
                    },
                    fullWidth: true,
                    errorText: labelError
                }),
                _react2['default'].createElement(_materialUi.TextField, {
                    floatingLabelText: "Order",
                    value: namespace.Order ? namespace.Order : '0',
                    onChange: function (e, v) {
                        namespace.Order = parseInt(v);_this4.setState({ namespace: namespace });
                    },
                    fullWidth: true,
                    type: "number"
                }),
                _react2['default'].createElement(
                    _materialUi.SelectField,
                    {
                        floatingLabelText: "Type",
                        value: type,
                        onChange: function (e, i, v) {
                            return _this4.updateType(v);
                        },
                        fullWidth: true },
                    Object.keys(_modelMetadata2['default'].MetaTypes).map(function (k) {
                        return _react2['default'].createElement(_materialUi.MenuItem, { value: k, primaryText: _modelMetadata2['default'].MetaTypes[k] });
                    })
                ),
                type === 'choice' && this.renderSelectionBoard(),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '20px 0 10px' } },
                    _react2['default'].createElement(_materialUi.Toggle, { label: "Index in search engine", labelPosition: "left", toggled: namespace.Indexable, onToggle: function (e, v) {
                            namespace.Indexable = v;_this4.setState({ namespace: namespace });
                        } })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '20px 0 10px' } },
                    _react2['default'].createElement(_materialUi.Toggle, { label: "Restrict visibility to admins", labelPosition: "left", toggled: adminRead, onToggle: function (e, v) {
                            _this4.togglePolicies('READ', v);
                        } })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '20px 0 10px' } },
                    _react2['default'].createElement(_materialUi.Toggle, { label: "Restrict edition to admins", labelPosition: "left", disabled: adminRead, toggled: adminWrite, onToggle: function (e, v) {
                            _this4.togglePolicies('WRITE', v);
                        } })
                )
            );
        }
    }]);

    return MetaNamespace;
})(_react2['default'].Component);

MetaNamespace.PropTypes = {
    namespace: _react2['default'].PropTypes.instanceOf(_pydioHttpRestApi.IdmUserMetaNamespace).isRequired,
    create: _react2['default'].PropTypes.boolean,
    reloadList: _react2['default'].PropTypes.func,
    onRequestClose: _react2['default'].PropTypes.func
};

exports['default'] = MetaNamespace;
module.exports = exports['default'];

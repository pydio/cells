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

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _Loader = require('./Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _Connect = require('./Connect');

var _Connect2 = _interopRequireDefault(_Connect);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _cellsSdk = require('cells-sdk');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var MetadataMapper = (function (_React$Component) {
    _inherits(MetadataMapper, _React$Component);

    function MetadataMapper(props) {
        _classCallCheck(this, MetadataMapper);

        _get(Object.getPrototypeOf(MetadataMapper.prototype), 'constructor', this).call(this, props);
        this.state = {};
    }

    _createClass(MetadataMapper, [{
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getInstance().MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'renderFontIcon',
        value: function renderFontIcon(meta) {
            var icon = undefined;
            switch (meta.type) {
                case "string":
                case "text":
                case "longtext":
                    icon = "pencil";
                    break;
                case "stars_rate":
                    icon = "star";
                    break;
                case "css_label":
                    icon = "label-outline";
                    break;
                case "choice":
                    icon = "format-list-bulleted";
                    break;
                case "tags":
                    icon = "cloud-outline";
                    break;
                default:
                    icon = "file";
                    break;
            }
            return _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-" + icon });
        }
    }, {
        key: 'exportMapping',
        value: function exportMapping() {
            var _state = this.state;
            var metas = _state.metas;
            var factorized = _state.factorized;
            var links = _state.links;

            if (!metas || !metas.length) {
                return;
            }
            var data = {
                mapping: {},
                create: this.buildNamespaces()
            };
            metas.forEach(function (m, i) {
                var rightIndex = links.filter(function (l) {
                    return l.left === i;
                })[0].right;
                data.mapping[m.name] = factorized[rightIndex].namespace;
            });
            this.props.onMapped(data);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            if (this.props.workspaces && this.props.workspaces.length) {
                var _Loader$parseUserMetaDefinitions = _Loader2['default'].parseUserMetaDefinitions(this.props.workspaces.filter(function (ws) {
                    return !ws.isTemplate;
                }));

                var metas = _Loader$parseUserMetaDefinitions.metas;
                var factorized = _Loader$parseUserMetaDefinitions.factorized;
                var links = _Loader$parseUserMetaDefinitions.links;

                this.setState({ metas: metas, factorized: factorized, links: links }, function () {
                    _this.exportMapping();
                });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this2 = this;

            if (nextProps.workspaces && nextProps.workspaces.length && (nextProps.workspaces !== this.props.workspaces || !this.props.workspaces || !this.props.workspaces.length)) {
                var _Loader$parseUserMetaDefinitions2 = _Loader2['default'].parseUserMetaDefinitions(nextProps.workspaces.filter(function (ws) {
                    return !ws.isTemplate;
                }));

                var metas = _Loader$parseUserMetaDefinitions2.metas;
                var factorized = _Loader$parseUserMetaDefinitions2.factorized;
                var links = _Loader$parseUserMetaDefinitions2.links;

                this.setState({ metas: metas, factorized: factorized, links: links }, function () {
                    _this2.exportMapping();
                });
            }
        }
    }, {
        key: 'toggle',
        value: function toggle(index) {
            var factorized = this.state.factorized;

            factorized[index].edit = !factorized[index].edit;
            this.setState({ factorized: factorized });
        }
    }, {
        key: 'updateLabel',
        value: function updateLabel(index, value) {
            var _this3 = this;

            var factorized = this.state.factorized;

            factorized[index].label = value;
            factorized[index].namespace = 'usermeta-' + _pydioUtilLang2['default'].computeStringSlug(value);
            this.setState({ factorized: factorized }, function () {
                _this3.exportMapping();
            });
        }
    }, {
        key: 'buildNamespaces',
        value: function buildNamespaces() {
            var factorized = this.state.factorized;

            return factorized.map(function (meta, i) {
                var ns = new _cellsSdk.IdmUserMetaNamespace();
                ns.Namespace = meta.namespace;
                ns.Label = meta.label;
                var json = { type: meta.type };
                if (meta.type === 'choice') {
                    json['data'] = meta.additional;
                }
                ns.JsonDefinition = JSON.stringify(json);
                ns.Order = i;
                ns.Indexable = true;
                ns.Policies = [_cellsSdk.ServiceResourcePolicy.constructFromObject({ Action: 'READ', Subject: '*', Effect: 'allow' }), _cellsSdk.ServiceResourcePolicy.constructFromObject({ Action: 'WRITE', Subject: '*', Effect: 'allow' })];
                return ns;
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _state2 = this.state;
            var metas = _state2.metas;
            var factorized = _state2.factorized;
            var links = _state2.links;

            if (!metas) {
                return null;
            }
            var linkColor = '#2196f3';
            return _react2['default'].createElement(
                'div',
                { style: { margin: 16, display: 'flex' } },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { width: 350 } },
                    _react2['default'].createElement(
                        _materialUi.List,
                        null,
                        _react2['default'].createElement(
                            _materialUi.Subheader,
                            null,
                            this.T('step.meta.from')
                        ),
                        metas.map(function (m) {
                            return _react2['default'].createElement(_materialUi.ListItem, {
                                primaryText: m.label,
                                secondaryText: _this4.T('step.meta.map.ws').replace('%s', m.ws.display),
                                leftIcon: _this4.renderFontIcon(m),
                                disabled: true
                            });
                        })
                    )
                ),
                _react2['default'].createElement(_Connect2['default'], {
                    leftNumber: metas.length,
                    rightNumber: factorized.length,
                    leftGridHeight: 72,
                    rightGridHeight: 72,
                    links: links.map(function (m) {
                        return _extends({}, m, { color: linkColor });
                    }),
                    style: { marginLeft: -9, marginRight: -5 }
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { width: 350 } },
                    _react2['default'].createElement(
                        _materialUi.List,
                        null,
                        _react2['default'].createElement(
                            _materialUi.Subheader,
                            null,
                            this.T('step.meta.to')
                        ),
                        factorized.map(function (m, i) {
                            if (!m.edit) {
                                return _react2['default'].createElement(_materialUi.ListItem, {
                                    primaryText: m.label,
                                    secondaryText: m.namespace + (m.additional ? _this4.T('step.meta.map.values').replace('%s', m.additional) : ''),
                                    leftIcon: _this4.renderFontIcon(m),
                                    onClick: function () {
                                        _this4.toggle(i);
                                    }
                                });
                            } else {
                                return _react2['default'].createElement(_materialUi.ListItem, {
                                    style: { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                                    primaryText: _react2['default'].createElement(ModernTextField, { style: { height: 40 }, value: m.label, onChange: function (e, v) {
                                            _this4.updateLabel(i, v);
                                        } }),
                                    leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { margin: '24px 12px', cursor: 'pointer' }, className: "mdi mdi-check", onClick: function () {
                                            _this4.toggle(i);
                                        } }),
                                    disabled: true
                                });
                            }
                        })
                    )
                )
            );
        }
    }]);

    return MetadataMapper;
})(_react2['default'].Component);

exports['default'] = MetadataMapper;
module.exports = exports['default'];

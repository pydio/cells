'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var Loader = _Pydio$requireLib.Loader;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var ModalAppBar = _Pydio$requireLib2.ModalAppBar;
var EmptyStateView = _Pydio$requireLib2.EmptyStateView;

var _Pydio$requireLib3 = _pydio2['default'].requireLib("hoc");

var ModernTextField = _Pydio$requireLib3.ModernTextField;

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var Selector = (function (_React$Component) {
    _inherits(Selector, _React$Component);

    function Selector() {
        _classCallCheck(this, Selector);

        _get(Object.getPrototypeOf(Selector.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Selector, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var value = _props.value;
            var onChange = _props.onChange;
            var muiTheme = _props.muiTheme;
            var m = _props.m;
            var palette = muiTheme.palette;

            var tabStyle = {
                color: '#616161'
            };
            var activeStyle = {
                color: palette.accent1Color
            };
            var spanStyle = {
                marginRight: 5
            };
            return _react2['default'].createElement(
                _materialUi.Tabs,
                { style: { width: 360 }, onChange: function (v) {
                        onChange(null, 0, v);
                    }, value: value, tabItemContainerStyle: { background: 'transparent' } },
                _react2['default'].createElement(_materialUi.Tab, { label: _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement('span', { style: spanStyle, className: "mdi mdi-share-variant" }),
                        m(243)
                    ), value: "LINKS", buttonStyle: value === 'LINKS' ? activeStyle : tabStyle }),
                _react2['default'].createElement(_materialUi.Tab, { label: _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement('span', { style: spanStyle, className: "icomoon-cells" }),
                        m(254)
                    ), value: "CELLS", buttonStyle: value === 'CELLS' ? activeStyle : tabStyle })
            );
        }
    }]);

    return Selector;
})(_react2['default'].Component);

Selector = muiThemeable()(Selector);

var ShareView = (function (_React$Component2) {
    _inherits(ShareView, _React$Component2);

    _createClass(ShareView, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var messages = this.props.pydio.MessageHash;
            return {
                messages: messages,
                getMessage: function getMessage(messageId) {
                    var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'share_center' : arguments[1];

                    try {
                        return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                    } catch (e) {
                        return messageId;
                    }
                },
                isReadonly: (function () {
                    return false;
                }).bind(this)
            };
        }
    }]);

    function ShareView(props) {
        _classCallCheck(this, ShareView);

        _get(Object.getPrototypeOf(ShareView.prototype), 'constructor', this).call(this, props);
        this.state = {
            resources: [],
            loading: false,
            selectedModel: null,
            shareType: props.defaultShareType || 'LINKS'
        };
    }

    _createClass(ShareView, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.load();
        }
    }, {
        key: 'load',
        value: function load() {
            var _this = this;

            this.setState({ filter: '' });
            var api = new _pydioHttpRestApi.ShareServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.RestListSharedResourcesRequest();
            request.ShareType = _pydioHttpRestApi.ListSharedResourcesRequestListShareType.constructFromObject(this.state.shareType);
            if (this.props.subject) {
                request.Subject = this.props.subject;
            } else {
                request.OwnedBySubject = true;
            }
            this.setState({ loading: true });
            api.listSharedResources(request).then(function (res) {
                _this.setState({ resources: res.Resources || [], loading: false });
            })['catch'](function () {
                _this.setState({ loading: false });
            });
        }
    }, {
        key: 'getLongestPath',
        value: function getLongestPath(node) {
            if (!node.AppearsIn) {
                return { path: node.Path, basename: node.Path };
            }
            var paths = {};
            node.AppearsIn.map(function (a) {
                paths[a.Path] = a;
            });
            var keys = Object.keys(paths);
            keys.sort();
            var longest = keys[keys.length - 1];
            var label = _pydioUtilPath2['default'].getBasename(longest);
            if (!label) {
                label = paths[longest].WsLabel;
            }
            return { path: longest, appearsIn: paths[longest], basename: label };
        }
    }, {
        key: 'goTo',
        value: function goTo(appearsIn) {
            var Path = appearsIn.Path;
            var WsLabel = appearsIn.WsLabel;
            var WsUuid = appearsIn.WsUuid;

            // Remove first segment (ws slug)
            var pathes = Path.split('/');
            pathes.shift();
            var pydioNode = new _pydioModelNode2['default'](pathes.join('/'));
            pydioNode.getMetadata().set('repository_id', WsUuid);
            pydioNode.getMetadata().set('repository_label', WsLabel);
            this.props.pydio.goTo(pydioNode);
            this.props.onRequestClose();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var loading = _state.loading;
            var resources = _state.resources;
            var _state$filter = _state.filter;
            var filter = _state$filter === undefined ? '' : _state$filter;
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var style = _props2.style;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };
            resources.sort(function (a, b) {
                var kA = a.Node.Path;
                var kB = b.Node.Path;
                return kA === kB ? 0 : kA > kB ? 1 : -1;
            });
            var extensions = pydio.Registry.getFilesExtensions();
            return _react2['default'].createElement(
                'div',
                { style: _extends({}, style, { display: 'flex', flexDirection: 'column', overflow: 'hidden' }) },
                _react2['default'].createElement(
                    'div',
                    { style: { backgroundColor: '#F5F5F5', borderBottom: '1px solid #EEEEEE', display: 'flex', paddingRight: 16, paddingTop: 3 } },
                    _react2['default'].createElement(Selector, {
                        m: m,
                        value: this.state.shareType,
                        onChange: function (e, i, v) {
                            _this2.setState({ shareType: v }, function () {
                                _this2.load();
                            });
                        }
                    }),
                    _react2['default'].createElement('span', { style: { flex: 1 } }),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 150 } },
                        _react2['default'].createElement(ModernTextField, { hintText: m('sharelist.quick-filter'), value: filter, onChange: function (e, v) {
                                _this2.setState({ filter: v });
                            }, fullWidth: true })
                    )
                ),
                loading && _react2['default'].createElement(Loader, { style: { height: 400 } }),
                !loading && resources.length === 0 && _react2['default'].createElement(EmptyStateView, {
                    pydio: pydio,
                    iconClassName: "mdi mdi-share-variant",
                    primaryTextId: m(131),
                    style: { flex: 1, height: 400, padding: '90px 0', backgroundColor: 'transparent' }
                }),
                !loading && resources.length > 0 && _react2['default'].createElement(
                    _materialUi.List,
                    { style: { flex: 1, minHeight: 400, maxHeight: 400, overflowY: 'auto', paddingTop: 0 } },
                    resources.map(function (res) {
                        var _getLongestPath = _this2.getLongestPath(res.Node);

                        var appearsIn = _getLongestPath.appearsIn;
                        var basename = _getLongestPath.basename;

                        var icon = undefined;
                        if (basename.indexOf('.') === -1) {
                            icon = 'mdi mdi-folder';
                        } else {
                            var ext = _pydioUtilPath2['default'].getFileExtension(basename);
                            if (extensions.has(ext)) {
                                var _extensions$get = extensions.get(ext);

                                var fontIcon = _extensions$get.fontIcon;

                                icon = 'mdi mdi-' + fontIcon;
                            } else {
                                icon = 'mdi mdi-file';
                            }
                        }
                        if (res.Link && res.Link.Label && res.Link.Label !== basename) {
                            basename = res.Link.Label + ' (' + basename + ')';
                        }

                        return {
                            primaryText: basename,
                            secondaryText: res.Link ? m(251) + ': ' + res.Link.Description : m(284).replace('%s', res.Cells.length),
                            icon: icon,
                            appearsIn: appearsIn
                        };
                    }).filter(function (props) {
                        console.log(filter);
                        return !filter || props.primaryText.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
                    }).map(function (props) {
                        var appearsIn = props.appearsIn;
                        var icon = props.icon;

                        return _react2['default'].createElement(_materialUi.ListItem, {
                            primaryText: props.primaryText,
                            secondaryText: props.secondaryText,
                            onTouchTap: function () {
                                appearsIn ? _this2.goTo(appearsIn) : null;
                            },
                            disabled: !appearsIn,
                            leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: icon })
                        });
                    })
                )
            );
        }
    }]);

    return ShareView;
})(_react2['default'].Component);

ShareView.childContextTypes = {
    messages: _react2['default'].PropTypes.object,
    getMessage: _react2['default'].PropTypes.func,
    isReadonly: _react2['default'].PropTypes.func
};

var ShareViewModal = _react2['default'].createClass({
    displayName: 'ShareViewModal',

    mixins: [ActionDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogSize: 'lg',
            dialogPadding: false,
            dialogIsModal: false,
            dialogScrollBody: false
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    render: function render() {
        var _this3 = this;

        return _react2['default'].createElement(
            'div',
            { style: { width: '100%', display: 'flex', flexDirection: 'column' } },
            _react2['default'].createElement(ModalAppBar, {
                title: this.props.pydio.MessageHash['share_center.98'],
                showMenuIconButton: false,
                iconClassNameRight: 'mdi mdi-close',
                onRightIconButtonTouchTap: function () {
                    _this3.dismiss();
                }
            }),
            _react2['default'].createElement(ShareView, _extends({}, this.props, { style: { width: '100%', flex: 1 }, onRequestClose: function () {
                    _this3.dismiss();
                } }))
        );
    }

});

exports.ShareView = ShareView;
exports.ShareViewModal = ShareViewModal;

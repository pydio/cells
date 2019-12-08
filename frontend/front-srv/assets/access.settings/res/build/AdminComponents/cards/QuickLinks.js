'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilNavigationHelper = require('../util/NavigationHelper');

var _utilNavigationHelper2 = _interopRequireDefault(_utilNavigationHelper);

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var DropDownMenu = _require2.DropDownMenu;
var MenuItem = _require2.MenuItem;
var FlatButton = _require2.FlatButton;
var Paper = _require2.Paper;
var IconButton = _require2.IconButton;

var _require$requireLib = require('pydio').requireLib('components');

var asGridItem = _require$requireLib.asGridItem;

var _require$requireLib2 = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib2.PydioContextConsumer;

var QuickLinks = (function (_Component) {
    _inherits(QuickLinks, _Component);

    function QuickLinks(props, context) {
        _classCallCheck(this, QuickLinks);

        _get(Object.getPrototypeOf(QuickLinks.prototype), 'constructor', this).call(this, props, context);

        var preferencesProvider = props.preferencesProvider;
        var getMessage = props.getMessage;

        if (preferencesProvider) {
            var links = preferencesProvider.getUserPreference('QuickLinks');
            if (links && typeof links === "object") {
                this.state = { links: links, edit: false };
                return;
            }
        }

        this.state = {
            edit: false,
            links: [{
                path: '/idm/users',
                iconClass: 'mdi mdi-account',
                label: getMessage('2', 'settings'),
                description: getMessage('139', 'settings')
            }, {
                path: '/data/workspaces',
                iconClass: 'mdi mdi-network',
                label: getMessage('3', 'settings'),
                description: getMessage('138', 'settings')
            }]
        };
    }

    _createClass(QuickLinks, [{
        key: 'menuClicked',
        value: function menuClicked(event, index, node) {

            if (node !== -1) {
                var newLinks = [].concat(_toConsumableArray(this.state.links));
                var already = false;
                newLinks.forEach(function (l) {
                    if (l.path == node.getPath()) already = true;
                });
                if (already) return;
                newLinks.push({
                    path: node.getPath(),
                    label: node.getLabel().replace('---', ''),
                    description: node.getMetadata().get('description'),
                    iconClass: node.getMetadata().get('icon_class')
                });
                if (this.props.preferencesProvider) {
                    this.props.preferencesProvider.saveUserPreference('QuickLinks', newLinks);
                }
                this.setState({ links: newLinks });
            }
        }
    }, {
        key: 'removeLink',
        value: function removeLink(payload, event) {

            var links = this.state.links;
            var newLinks = [];
            links.map(function (l) {
                if (l.path != payload) newLinks.push(l);
            });
            if (this.props.preferencesProvider) {
                this.props.preferencesProvider.saveUserPreference('QuickLinks', newLinks);
            }
            this.setState({ links: newLinks });
        }
    }, {
        key: 'toggleEdit',
        value: function toggleEdit() {
            if (!this.state.edit) {
                this.props.onFocusItem();
            } else {
                this.props.onBlurItem();
            }
            this.setState({ edit: !this.state.edit });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var muiTheme = _props.muiTheme;
            var pydio = _props.pydio;

            var links = this.state.links.map((function (l) {
                var label = undefined;
                if (this.state.edit) {
                    label = React.createElement(
                        'span',
                        { style: { color: '#9e9e9e' } },
                        React.createElement('span', { className: 'mdi mdi-delete' }),
                        ' ',
                        l.label
                    );
                    return React.createElement(FlatButton, {
                        key: l.path,
                        secondary: false,
                        onTouchTap: this.removeLink.bind(this, l.path),
                        label: label
                    });
                } else {
                    label = React.createElement(
                        'span',
                        null,
                        React.createElement('span', { className: l.iconClass + ' button-icon' }),
                        ' ',
                        l.label
                    );
                    return React.createElement(FlatButton, {
                        key: l.path,
                        primary: true,
                        onTouchTap: function () {
                            pydio.goTo(l.path);
                        },
                        label: label
                    });
                }
            }).bind(this));
            var dropDown = undefined;
            if (this.state.edit) {
                var menuItems = [React.createElement(MenuItem, { primaryText: this.props.getMessage('home.43'), value: '-1' })];
                var rootNode = pydio.getContextHolder().getRootNode();
                menuItems = menuItems.concat(_utilNavigationHelper2['default'].buildNavigationItems(pydio, rootNode, muiTheme.palette, true, true));
                dropDown = React.createElement(
                    'div',
                    null,
                    React.createElement(
                        DropDownMenu,
                        {
                            style: { marginTop: 6 },
                            underlineStyle: { display: 'none' },
                            onChange: this.menuClicked.bind(this),
                            value: '-1' },
                        menuItems
                    )
                );
            } else {
                dropDown = React.createElement(
                    'h4',
                    { style: { padding: '15px 6px 0', fontWeight: 500, color: '#9e9e9e', fontSize: 15, textTransform: 'uppercase' } },
                    this.props.getMessage('home.1')
                );
            }
            return React.createElement(
                Paper,
                _extends({}, this.props, {
                    zDepth: 1,
                    transitionEnabled: false,
                    style: _extends({}, this.props.style, { display: 'flex', alignItems: 'center' })
                }),
                this.props.closeButton,
                dropDown,
                links,
                React.createElement('span', { style: { flex: 1 } }),
                React.createElement(IconButton, {
                    onTouchTap: this.editor.bind(this),
                    iconClassName: this.state.edit ? 'icon-ok' : 'mdi mdi-pencil',
                    secondary: this.state.edit,
                    iconStyle: { color: "#9e9e9e" }
                })
            );
        }
    }]);

    return QuickLinks;
})(Component);

var globalMessages = global.pydio.MessageHash;
exports['default'] = QuickLinks = PydioContextConsumer(QuickLinks);
exports['default'] = QuickLinks = asGridItem(QuickLinks, globalMessages["ajxp_admin.home.1"], { gridWidth: 8, gridHeight: 4 }, []);
exports['default'] = QuickLinks;
module.exports = exports['default'];

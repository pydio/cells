/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var AsyncComponent = _Pydio$requireLib.AsyncComponent;

var TopBar = (function (_React$Component) {
    _inherits(TopBar, _React$Component);

    function TopBar() {
        _classCallCheck(this, TopBar);

        _get(Object.getPrototypeOf(TopBar.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(TopBar, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var tabs = _props.tabs;
            var dismiss = _props.dismiss;
            var muiTheme = _props.muiTheme;

            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', backgroundColor: muiTheme.tabs.backgroundColor } },
                _react2['default'].createElement(
                    _materialUi.Tabs,
                    { style: { flex: 1 } },
                    tabs
                ),
                _react2['default'].createElement(_materialUi.IconButton, { iconStyle: { color: muiTheme.tabs.selectedTextColor }, iconClassName: "mdi mdi-close", onTouchTap: dismiss, tooltip: "Close" })
            );
        }
    }]);

    return TopBar;
})(_react2['default'].Component);

TopBar = (0, _materialUiStyles.muiThemeable)()(TopBar);

var UploadDialog = _react2['default'].createClass({
    displayName: 'UploadDialog',

    mixins: [ActionDialogMixin],

    getDefaultProps: function getDefaultProps() {
        var mobile = _pydio2['default'].getInstance().UI.MOBILE_EXTENSIONS;
        return {
            dialogTitle: '',
            dialogSize: mobile ? 'md' : 'lg',
            dialogPadding: false,
            dialogIsModal: false
        };
    },

    getInitialState: function getInitialState() {
        var uploaders = this.props.pydio.Registry.getActiveExtensionByType("uploader").filter(function (uploader) {
            return uploader.moduleName;
        });
        uploaders.sort(function (objA, objB) {
            return objA.order - objB.order;
        });
        var current = undefined;
        if (uploaders.length) {
            current = uploaders[0];
        }
        return {
            uploaders: uploaders,
            current: current,
            loaded: false
        };
    },

    render: function render() {
        var _this = this;

        var tabs = [];
        var component = _react2['default'].createElement('div', { style: { height: 360 } });
        var dismiss = function dismiss() {
            _this.dismiss();
        };
        var _state = this.state;
        var uploaders = _state.uploaders;
        var current = _state.current;
        var loaded = _state.loaded;

        uploaders.map(function (uploader) {
            tabs.push(_react2['default'].createElement(_materialUi.Tab, { label: uploader.xmlNode.getAttribute('label'), key: uploader.id, onActive: function () {
                    _this.setState({ current: uploader });
                } }));
        });
        if (current) {
            var parts = current.moduleName.split('.');
            component = _react2['default'].createElement(AsyncComponent, _extends({
                pydio: this.props.pydio,
                namespace: parts[0],
                componentName: parts[1],
                onDismiss: dismiss,
                showDismiss: tabs.length === 1,
                onLoad: function () {
                    _this.setState({ loaded: true });
                }
            }, this.props.uploaderProps));
        }

        return _react2['default'].createElement(
            'div',
            { style: { width: '100%' } },
            tabs.length > 1 && _react2['default'].createElement(TopBar, { tabs: tabs, dismiss: dismiss }),
            component,
            !loaded && _react2['default'].createElement(
                'div',
                { style: { padding: '100px 40px', textAlign: 'center', color: 'rgba(0,0,0,.5)' } },
                this.props.pydio.MessageHash['466']
            )
        );
    }

});

exports['default'] = UploadDialog;
module.exports = exports['default'];

'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _localStorage = require('./localStorage');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorReducers = _Pydio$requireLib.EditorReducers;

var store = _redux.createStore(EditorReducers, _localStorage.loadState(), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

store.subscribe(function () {
    _localStorage.saveState({
        editor: store.getState().editor
    });
});

var MainProvider = _materialUi.MuiThemeProvider;
var DND = undefined;
try {
    DND = require('react-dnd');
    var Backend = require('react-dnd-html5-backend');
    MainProvider = DND.DragDropContext(Backend)(MainProvider);
} catch (e) {}

exports['default'] = function (PydioComponent, pydio) {
    var Wrapped = (function (_Component) {
        _inherits(Wrapped, _Component);

        function Wrapped() {
            _classCallCheck(this, Wrapped);

            _Component.apply(this, arguments);
        }

        Wrapped.prototype.getChildContext = function getChildContext() {
            var messages = pydio.MessageHash;
            return {
                pydio: pydio,
                messages: messages,
                getMessage: function getMessage(messageId) {
                    var namespace = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

                    if (namespace) {
                        messageId = namespace + '.' + messageId;
                    }
                    try {
                        return messages[messageId] || messageId;
                    } catch (e) {
                        return messageId;
                    }
                },
                getPydio: function getPydio() {
                    return pydio;
                }
            };
        };

        Wrapped.prototype.render = function render() {

            var customPalette = {};
            if (pydio.Parameters.has('other') && pydio.Parameters.get('other')['vanity']) {
                customPalette = pydio.Parameters.get('other')['vanity']['palette'] || {};
            }
            var themeCusto = {
                palette: _extends({
                    primary1Color: '#134e6c',
                    primary2Color: '#f44336',
                    accent1Color: '#f44336',
                    accent2Color: '#018dcc',
                    avatarsColor: '#438db3',
                    sharingColor: '#4aceb0'
                }, customPalette)
            };

            themeCusto.toggle = {
                thumbOffColor: themeCusto.palette.primary1Color,
                thumbOnColor: themeCusto.palette.accent2Color
            };
            themeCusto.menuItem = {
                selectedTextColor: themeCusto.palette.accent2Color
            };

            var theme = _materialUiStyles.getMuiTheme(themeCusto);

            return React.createElement(
                MainProvider,
                { muiTheme: theme },
                React.createElement(
                    _reactRedux.Provider,
                    { store: store },
                    React.createElement(PydioComponent, this.props)
                )
            );
        };

        return Wrapped;
    })(_react.Component);

    Wrapped.displayName = 'PydioContextProvider';
    Wrapped.propTypes = {
        pydio: _propTypes2['default'].instanceOf(_pydio2['default']).isRequired
    };
    Wrapped.childContextTypes = {
        /* Current Instance of Pydio */
        pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
        /* Accessor for pydio */
        getPydio: _propTypes2['default'].func,

        /* Associative array of i18n messages */
        messages: _propTypes2['default'].object,
        /* Accessor for messages */
        getMessage: _propTypes2['default'].func
    };

    return Wrapped;
};

module.exports = exports['default'];

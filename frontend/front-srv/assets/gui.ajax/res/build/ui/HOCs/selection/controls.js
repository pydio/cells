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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _materialUi = require('material-ui');

var _reactRedux = require('react-redux');

var _utils = require('./utils');

var _utils2 = require('../utils');

var withSelectionControls = function withSelectionControls() {
    return function (Component) {
        return (function (_React$Component) {
            _inherits(_class, _React$Component);

            function _class() {
                _classCallCheck(this, _class2);

                _React$Component.apply(this, arguments);
            }

            _class.prototype.render = function render() {
                var _props = this.props;
                var tab = _props.tab;

                var remaining = _objectWithoutProperties(_props, ['tab']);

                var selection = tab.selection;

                if (!selection || selection.length() == 0) {
                    return React.createElement(Component, null);
                }

                var fn = _utils2.handler("onSelectionChange", this.props);

                return React.createElement(Component, _extends({
                    prevSelectionDisabled: !selection.hasPrevious(),
                    nextSelectionDisabled: !selection.hasNext(),
                    onSelectPrev: function () {
                        return fn(selection.previous());
                    },
                    onSelectNext: function () {
                        return fn(selection.next());
                    }
                }, remaining));
            };

            _createClass(_class, null, [{
                key: 'displayName',
                get: function get() {
                    return 'WithSelectionControls(' + _utils2.getDisplayName(Component) + ')';
                }
            }]);

            var _class2 = _class;
            _class = _reactRedux.connect(_utils.mapStateToProps)(_class) || _class;
            return _class;
        })(React.Component);
    };
};

exports.withSelectionControls = withSelectionControls;
// const _Prev = (props) => <IconButton onClick={() => handler("onSelectionChange", props)(props.tab.selection.previous())} iconClassName="mdi mdi-arrow-left" disabled={props.tab.selection && !props.tab.selection.hasPrevious()} />
// const _Play = (props) => <IconButton onClick={() => handler("onTogglePlaying", props)(true)} iconClassName="mdi mdi-play" disabled={props.tab.playing} />
// const _Pause = (props) => <IconButton onClick={() => handler("onTogglePlaying", props)(false)} iconClassName="mdi mdi-pause" disabled={!props.tab.playing} />
// const _Next = (props) => <IconButton onClick={() => handler("onSelectionChange", props)(props.tab.selection.next())} iconClassName="mdi mdi-arrow-right" disabled={props.tab.selection && !props.tab.selection.hasNext()} />

// // Final export and connection
// export const Prev = connect(mapStateToProps)(_Prev)
// export const Play = connect(mapStateToProps)(_Play)
// export const Pause = connect(mapStateToProps)(_Pause)
// export const Next = connect(mapStateToProps)(_Next)

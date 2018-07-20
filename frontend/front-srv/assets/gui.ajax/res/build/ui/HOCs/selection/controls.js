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

var _materialUi = require('material-ui');

var _reactRedux = require('react-redux');

var _utils = require('./utils');

var _utils2 = require('../utils');

var _Prev = function _Prev(props) {
  return React.createElement(_materialUi.IconButton, { onClick: function () {
      return _utils2.handler("onSelectionChange", props)(props.tab.selection.previous());
    }, iconClassName: 'mdi mdi-arrow-left', disabled: props.tab.selection && !props.tab.selection.hasPrevious() });
};
var _Play = function _Play(props) {
  return React.createElement(_materialUi.IconButton, { onClick: function () {
      return _utils2.handler("onTogglePlaying", props)(true);
    }, iconClassName: 'mdi mdi-play', disabled: props.tab.playing });
};
var _Pause = function _Pause(props) {
  return React.createElement(_materialUi.IconButton, { onClick: function () {
      return _utils2.handler("onTogglePlaying", props)(false);
    }, iconClassName: 'mdi mdi-pause', disabled: !props.tab.playing });
};
var _Next = function _Next(props) {
  return React.createElement(_materialUi.IconButton, { onClick: function () {
      return _utils2.handler("onSelectionChange", props)(props.tab.selection.next());
    }, iconClassName: 'mdi mdi-arrow-right', disabled: props.tab.selection && !props.tab.selection.hasNext() });
};

// Final export and connection
var Prev = _reactRedux.connect(_utils.mapStateToProps)(_Prev);
exports.Prev = Prev;
var Play = _reactRedux.connect(_utils.mapStateToProps)(_Play);
exports.Play = Play;
var Pause = _reactRedux.connect(_utils.mapStateToProps)(_Pause);
exports.Pause = Pause;
var Next = _reactRedux.connect(_utils.mapStateToProps)(_Next);
exports.Next = Next;

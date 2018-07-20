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

// Controls definitions
var _Save = function _Save(props) {
    return React.createElement(_materialUi.IconButton, { onClick: function () {
            return _utils2.handler("onSave", props);
        }, iconClassName: 'mdi mdi-content-save' });
};
var _Undo = function _Undo(props) {
    return React.createElement(_materialUi.IconButton, { onClick: function () {
            return _utils2.handler("onUndo", props);
        }, iconClassName: 'mdi mdi-undo' });
};
var _Redo = function _Redo(props) {
    return React.createElement(_materialUi.IconButton, { onClick: function () {
            return _utils2.handler("onRedo", props);
        }, iconClassName: 'mdi mdi-redo' });
};

var _ToggleLineNumbers = function _ToggleLineNumbers(props) {
    return React.createElement(_materialUi.IconButton, { onClick: function () {
            return _utils2.handler("onToggleLineNumbers", props);
        }, iconClassName: 'mdi mdi-format-list-numbers' });
};
var _ToggleLineWrapping = function _ToggleLineWrapping(props) {
    return React.createElement(_materialUi.IconButton, { onClick: function () {
            return _utils2.handler("onToggleLineWrapping", props);
        }, iconClassName: 'mdi mdi-wrap' });
};

var _JumpTo = function _JumpTo(props) {
    return React.createElement(_materialUi.TextField, { onKeyUp: function (_ref) {
            var key = _ref.key;
            var target = _ref.target;
            return key === 'Enter' && _utils2.handler("onJumpTo", props)(target.value);
        }, hintText: 'Jump to Line', style: { width: 150, marginRight: 40 } });
};
var _Search = function _Search(props) {
    return React.createElement(_materialUi.TextField, { onKeyUp: function (_ref2) {
            var key = _ref2.key;
            var target = _ref2.target;
            return key === 'Enter' && _utils2.handler("onSearch", props)(target.value);
        }, hintText: 'Search...' });
};

// Final export and connection
var ContentControls = {
    Save: _reactRedux.connect(_utils.mapStateToProps)(_Save),
    Undo: _reactRedux.connect(_utils.mapStateToProps)(_Undo),
    Redo: _reactRedux.connect(_utils.mapStateToProps)(_Redo),
    ToggleLineNumbers: _reactRedux.connect(_utils.mapStateToProps)(_ToggleLineNumbers),
    ToggleLineWrapping: _reactRedux.connect(_utils.mapStateToProps)(_ToggleLineWrapping)
};

var ContentSearchControls = {
    JumpTo: _reactRedux.connect(_utils.mapStateToProps)(_JumpTo),
    Search: _reactRedux.connect(_utils.mapStateToProps)(_Search)
};

exports.ContentControls = ContentControls;
exports.ContentSearchControls = ContentSearchControls;

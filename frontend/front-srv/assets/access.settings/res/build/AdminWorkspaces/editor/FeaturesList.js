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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _metaMetaList = require('../meta/MetaList');

var _metaMetaList2 = _interopRequireDefault(_metaMetaList);

var _modelWorkspace = require('../model/Workspace');

var _modelWorkspace2 = _interopRequireDefault(_modelWorkspace);

exports['default'] = _react2['default'].createClass({
    displayName: 'FeaturesList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        onSelectionChange: _react2['default'].PropTypes.func.isRequired,
        metaSourceProvider: _react2['default'].PropTypes.object.isRequired,
        driverLabel: _react2['default'].PropTypes.string,
        driverDescription: _react2['default'].PropTypes.string,
        currentSelection: _react2['default'].PropTypes.string,
        model: _react2['default'].PropTypes.instanceOf(_modelWorkspace2['default']),
        tplFieldsComponent: _react2['default'].PropTypes.object
    },

    setEditState: function setEditState(key) {
        this.props.onSelectionChange(key);
    },

    closeCurrent: function closeCurrent(event) {
        event.stopPropagation();
        this.setEditState('activity');
    },

    render: function render() {

        var firstSections = [];
        var driverTabLabel = this.context.getMessage('ws.9');
        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(PydioComponents.PaperEditorNavHeader, { key: 'parameters-k', label: this.context.getMessage('ws.29') }),
            _react2['default'].createElement(PydioComponents.PaperEditorNavEntry, { keyName: 'general', key: 'general', selectedKey: this.props.currentSelection, label: this.context.getMessage('ws.30'), onClick: this.setEditState }),
            _react2['default'].createElement(
                PydioComponents.PaperEditorNavEntry,
                { keyName: 'driver', key: 'driver', selectedKey: this.props.currentSelection, onClick: this.setEditState },
                driverTabLabel
            ),
            firstSections,
            this.props.tplFieldsComponent
        );
    }

});
module.exports = exports['default'];

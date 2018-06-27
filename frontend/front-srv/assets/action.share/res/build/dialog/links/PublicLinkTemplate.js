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

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _materialUi = require('material-ui');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var PublicLinkTemplate = _react2['default'].createClass({
    displayName: 'PublicLinkTemplate',

    propTypes: {
        linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default'])
    },

    onDropDownChange: function onDropDownChange(event, index, value) {
        var linkModel = this.props.linkModel;

        linkModel.getLink().ViewTemplateName = value;
        linkModel.notifyDirty();
    },

    render: function render() {
        var crtLabel = undefined;
        var linkModel = this.props.linkModel;

        var selected = linkModel.getLink().ViewTemplateName;
        var menuItems = this.props.layoutData.map(function (l) {
            if (selected && l.LAYOUT_ELEMENT === selected) {
                crtLabel = l.LAYOUT_LABEL;
            }
            if (!selected && !crtLabel) {
                selected = l.LAYOUT_ELEMENT, crtLabel = l.LAYOUT_LABEL;
            }
            return _react2['default'].createElement(_materialUi.MenuItem, { key: l.LAYOUT_ELEMENT, value: l.LAYOUT_ELEMENT, primaryText: l.LAYOUT_LABEL });
        });
        var unusedLegend = _react2['default'].createElement(
            'div',
            { className: 'form-legend' },
            this.props.getMessage('198')
        );
        return _react2['default'].createElement(
            'div',
            { style: this.props.style },
            _react2['default'].createElement(
                _materialUi.SelectField,
                {
                    fullWidth: true,
                    value: selected,
                    onChange: this.onDropDownChange,
                    disabled: this.props.isReadonly() || !linkModel.isEditable(),
                    floatingLabelText: this.props.getMessage('151')
                },
                menuItems
            )
        );
    }
});

PublicLinkTemplate = (0, _ShareContextConsumer2['default'])(PublicLinkTemplate);
exports['default'] = PublicLinkTemplate;
module.exports = exports['default'];

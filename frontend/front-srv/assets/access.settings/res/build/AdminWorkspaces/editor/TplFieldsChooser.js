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

var _require = require('material-ui');

var Checkbox = _require.Checkbox;
exports['default'] = React.createClass({
    displayName: 'TplFieldsChooser',

    propTypes: {
        driverName: React.PropTypes.string,
        driverFields: React.PropTypes.array,
        selectedFields: React.PropTypes.array,
        onToggleField: React.PropTypes.func
    },

    toggleField: function toggleField(name, e) {
        this.props.onToggleField(name, e.currentTarget.checked, this.props.selectedFields);
    },

    render: function render() {
        var fields = this.props.driverFields.map((function (f) {
            return React.createElement(
                'div',
                { key: this.props.driverName + '-' + f.name, style: { paddingTop: 6, paddingBottom: 6 } },
                React.createElement(Checkbox, {
                    label: f.label,
                    checked: this.props.selectedFields.indexOf(f.name) !== -1,
                    onCheck: this.toggleField.bind(this, f.name)
                })
            );
        }).bind(this));
        return React.createElement(
            'div',
            { style: this.props.style },
            fields
        );
    }

});
module.exports = exports['default'];

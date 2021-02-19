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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require('material-ui');

var ListItem = _require.ListItem;
var Avatar = _require.Avatar;
var FontIcon = _require.FontIcon;

var _require2 = require('material-ui/styles');

var muiThemeable = _require2.muiThemeable;

var Color = require('color');

var PropTypes = require('prop-types');

var Pydio = require('pydio');
var Repository = require('pydio/model/repository');

var WorkspaceEntryMaterial = (function (_React$Component) {
    _inherits(WorkspaceEntryMaterial, _React$Component);

    function WorkspaceEntryMaterial() {
        _classCallCheck(this, WorkspaceEntryMaterial);

        _React$Component.apply(this, arguments);
    }

    WorkspaceEntryMaterial.prototype.onClick = function onClick() {
        if (this.props.onWorkspaceTouchTap) {
            this.props.onWorkspaceTouchTap(this.props.workspace.getId());
            return;
        }
        if (this.props.workspace.getId() === this.props.pydio.user.activeRepository && this.props.showFoldersTree) {
            this.props.pydio.goTo('/');
        } else {
            this.props.pydio.triggerRepositoryChange(this.props.workspace.getId());
        }
    };

    WorkspaceEntryMaterial.prototype.render = function render() {
        var _props = this.props;
        var workspace = _props.workspace;
        var muiTheme = _props.muiTheme;

        var leftAvatar = undefined,
            leftIcon = undefined;
        var color = muiTheme.palette.primary1Color;
        //let backgroundColor = new Color(muiTheme.palette.primary1Color).lightness(96).rgb().toString();
        var backgroundColor = '#ECEFF1';
        if (workspace.getOwner() || workspace.getAccessType() === 'inbox') {
            color = MaterialUI.Style.colors.teal500;
            var icon = workspace.getAccessType() === 'inbox' ? 'file-multiple' : 'folder-outline';
            if (workspace.getRepositoryType() === 'remote') icon = 'cloud-outline';
            leftAvatar = React.createElement(Avatar, { backgroundColor: backgroundColor, color: color, icon: React.createElement(FontIcon, { className: 'mdi mdi-' + icon }) });
        } else {
            leftAvatar = React.createElement(
                Avatar,
                { style: { fontSize: 18 }, backgroundColor: backgroundColor, color: color },
                workspace.getLettersBadge()
            );
        }
        return React.createElement(ListItem, {
            leftAvatar: leftAvatar,
            leftIcon: leftIcon,
            primaryText: workspace.getLabel(),
            secondaryText: workspace.getDescription(),
            onClick: this.onClick.bind(this)
        });
    };

    return WorkspaceEntryMaterial;
})(React.Component);

WorkspaceEntryMaterial.propTypes = {
    pydio: PropTypes.instanceOf(Pydio).isRequired,
    workspace: PropTypes.instanceOf(Repository).isRequired,
    muiTheme: PropTypes.object
};

exports['default'] = WorkspaceEntryMaterial = muiThemeable()(WorkspaceEntryMaterial);
exports['default'] = WorkspaceEntryMaterial;
module.exports = exports['default'];

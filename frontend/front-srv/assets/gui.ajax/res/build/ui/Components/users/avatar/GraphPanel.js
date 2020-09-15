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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _addressbookUsersList = require('../addressbook/UsersList');

var _addressbookUsersList2 = _interopRequireDefault(_addressbookUsersList);

var _require = require('react');

var Component = _require.Component;

var _require2 = require('material-ui');

var Divider = _require2.Divider;
var Subheader = _require2.Subheader;
var List = _require2.List;
var ListItem = _require2.ListItem;
var FontIcon = _require2.FontIcon;
var Avatar = _require2.Avatar;

var PydioApi = require('pydio/http/api');

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

/**
 * Display information about user or team relations
 */

var GraphPanel = (function (_Component) {
    _inherits(GraphPanel, _Component);

    function GraphPanel() {
        _classCallCheck(this, GraphPanel);

        _Component.apply(this, arguments);
    }

    GraphPanel.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var graph = _props.graph;
        var userLabel = _props.userLabel;
        var pydio = _props.pydio;
        var getMessage = _props.getMessage;

        var teamsEditable = pydio.getController().actions.has("user_team_create");

        var elements = [];
        if (graph.teams && graph.teams.length) {
            var onDeleteAction = null;
            if (teamsEditable) {
                onDeleteAction = function (parentItem, team) {
                    PydioApi.getRestClient().getIdmApi().removeUserFromTeam(team[0].id, _this.props.userId, function (response) {
                        if (response && response.message) {
                            pydio.UI.displayMessage('SUCCESS', response.message);
                        }
                        _this.props.reloadAction();
                    });
                };
            }
            elements.push(React.createElement(
                'div',
                { key: 'teams' },
                React.createElement(_addressbookUsersList2['default'], { subHeader: getMessage(581).replace('%s', graph.teams.length), onItemClicked: function () {}, item: { leafs: graph.teams }, mode: 'inner', onDeleteAction: onDeleteAction })
            ));
        }
        if (graph.cells) {
            var cells = Object.Val(graph.cells).filter(function (cell) {
                return cell.Scope === "ROOM";
            });
            if (cells.length) {
                elements.push(React.createElement(
                    'div',
                    null,
                    elements.length ? React.createElement(Divider, null) : null,
                    React.createElement(
                        Subheader,
                        null,
                        cells.length === 1 ? getMessage('601') : getMessage('602').replace('%1', cells.length)
                    ),
                    React.createElement(
                        List,
                        null,
                        cells.map(function (cell) {
                            return React.createElement(ListItem, {
                                leftAvatar: React.createElement(Avatar, { icon: React.createElement(FontIcon, { className: 'mdi mdi-share-variant' }), backgroundColor: "#009688", size: 36 }),
                                primaryText: cell.Label,
                                onTouchTap: function () {
                                    pydio.triggerRepositoryChange(cell.UUID);
                                } });
                        })
                    )
                ));
            }
        }
        return React.createElement(
            'div',
            null,
            elements
        );
    };

    return GraphPanel;
})(Component);

exports['default'] = GraphPanel = PydioContextConsumer(GraphPanel);
exports['default'] = GraphPanel;
module.exports = exports['default'];

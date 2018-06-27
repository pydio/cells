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

var _WorkspaceSummaryCard = require('./WorkspaceSummaryCard');

var _WorkspaceSummaryCard2 = _interopRequireDefault(_WorkspaceSummaryCard);

var _modelWorkspace = require('../model/Workspace');

var _modelWorkspace2 = _interopRequireDefault(_modelWorkspace);

exports['default'] = React.createClass({
    displayName: 'WorkspaceSummary',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        model: React.PropTypes.instanceOf(_modelWorkspace2['default']).isRequired
    },

    getInitialState: function getInitialState() {
        return { optionsLoaded: false, workspaceInfo: null };
    },

    loadInfo: function loadInfo(model) {
        var optionsLoadedFunc = (function () {
            this.setState({ optionsLoaded: true });
        }).bind(this);
        if (model.loaded) optionsLoadedFunc();else model.observe('loaded', optionsLoadedFunc);
    },

    componentDidMount: function componentDidMount() {
        this.loadInfo(this.props.model);
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.loadInfo(newProps.model);
    },

    render: function render() {
        var driverIcon = 'icon-hdd',
            driverName,
            driverDescription;
        var aclsTitle, aclsDescriptions;
        if (this.state.optionsLoaded) {
            driverIcon = this.props.model.getDriverIconClass();
            driverName = this.props.model.getDriverLabel();
            driverDescription = this.props.model.getDescriptionFromDriverTemplate();
            if (!driverDescription) driverDescription = React.createElement(
                'span',
                null,
                ' '
            );

            var totalUsers = this.props.model.getSingleNodeTextFromXML("admin_data/additional_info/users/@total");
            var sharedFolders = this.props.model.getSingleNodeTextFromXML("admin_data/additional_info/shares/@total");
            aclsTitle = React.createElement(
                'span',
                null,
                this.context.getMessage('ws.35').replace('%i', totalUsers)
            );
            aclsDescriptions = React.createElement(
                'span',
                null,
                this.context.getMessage('ws.36').replace('%i', sharedFolders)
            );
        }

        return React.createElement(
            'div',
            { className: 'workspace-cards-container' },
            React.createElement(
                _WorkspaceSummaryCard2['default'],
                { icon: driverIcon },
                React.createElement(
                    'h4',
                    null,
                    driverName
                ),
                React.createElement(
                    'h5',
                    null,
                    driverDescription ? driverDescription : "&nbsp;"
                )
            ),
            React.createElement(
                _WorkspaceSummaryCard2['default'],
                { icon: 'icon-group' },
                React.createElement(
                    'h4',
                    null,
                    aclsTitle
                ),
                React.createElement(
                    'h5',
                    null,
                    aclsDescriptions
                )
            ),
            React.createElement('span', { style: { clear: 'left' } })
        );
    }

});
module.exports = exports['default'];

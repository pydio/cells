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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _InfoPanelCard = require('./InfoPanelCard');

var _InfoPanelCard2 = _interopRequireDefault(_InfoPanelCard);

exports['default'] = _createReactClass2['default']({
    displayName: 'RootNode',

    getInitialState: function getInitialState() {
        return {
            repoKey: null
        };
    },

    componentDidMount: function componentDidMount() {
        this.loadData(this.props);
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (nextProps.pydio.user && nextProps.pydio.user.activeRepository !== this.state.repoKey) {
            this.loadData(nextProps);
        }
    },

    loadData: function loadData(props) {
        if (!props.pydio.user) {
            return;
        }
        var cacheService = MetaCacheService.getInstance();
        cacheService.registerMetaStream('workspace.info', 'MANUAL_TRIGGER');
        var oThis = this;
        var render = function render(data) {
            oThis.setState(_extends({}, data['core.users']));
        };
        var repoKey = pydio.user.getActiveRepository();
        this.setState({ repoKey: repoKey });
        if (cacheService.hasKey('workspace.info', repoKey)) {
            render(cacheService.getByKey('workspace.info', repoKey));
        } else {
            FuncUtils.bufferCallback("ajxp_load_repo_info_timer", 700, function () {
                if (!oThis.isMounted()) return;
                // Todo: load info about workspace
            });
        }
    },

    render: function render() {
        var messages = this.props.pydio.MessageHash;
        var internal = messages[528];
        var external = messages[530];
        var shared = messages[527];

        var content = undefined,
            panelData = undefined;

        if (this.state && this.state.users) {
            panelData = [{ key: 'internal', label: internal, value: this.state.users }, { key: 'external', label: external, value: this.state.groups }];
        }

        return _react2['default'].createElement(
            _InfoPanelCard2['default'],
            { identifier: "file-info", title: messages[249], style: this.props.style, standardData: panelData, icon: 'account-multiple-outline', iconColor: '00838f' },
            content
        );
    }
});
module.exports = exports['default'];

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

var _ActionDialogMixin = require('./ActionDialogMixin');

var _ActionDialogMixin2 = _interopRequireDefault(_ActionDialogMixin);

/**
 * Sample Dialog class used for reference only, ready to be
 * copy/pasted :-)
 */
exports['default'] = React.createClass({
    displayName: 'ActivityWarningDialog',

    mixins: [_ActionDialogMixin2['default']],

    getInitialState: function getInitialState() {
        return _extends({}, this.props.activityState);
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        this._observer = function (activityState) {
            _this.setState(activityState);
        };
        this.props.pydio.observe('activity_state_change', this._observer);
    },

    componentWillUnmount: function componentWillUnmount() {
        this.props.pydio.stopObserving('activity_state_change', this._observer);
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: '375t',
            dialogIsModal: false
        };
    },
    render: function render() {
        var _this2 = this;

        var MessageHash = this.props.pydio.MessageHash;
        var _state = this.state;
        var lastActiveSince = _state.lastActiveSince;
        var timerString = _state.timerString;

        var sentence = MessageHash['375'].replace('__IDLE__', lastActiveSince).replace('__LOGOUT__', timerString);
        return React.createElement(
            'div',
            { onTouchTap: function () {
                    _this2.props.pydio.notify('user_activity');
                } },
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                React.createElement('div', { className: 'mdi mdi-security', style: { fontSize: 70, paddingRight: 10 } }),
                React.createElement(
                    'p',
                    null,
                    sentence
                )
            ),
            React.createElement(
                'p',
                { style: { textAlign: 'right', fontWeight: 500, color: '#607D8B', fontSize: 14 } },
                MessageHash['376']
            )
        );
    }

});
module.exports = exports['default'];

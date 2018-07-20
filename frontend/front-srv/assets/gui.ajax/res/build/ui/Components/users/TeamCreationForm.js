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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

/**
 * Simple form for creating a team
 */

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var TextField = _require2.TextField;
var FlatButton = _require2.FlatButton;

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var TeamCreationForm = (function (_Component) {
    _inherits(TeamCreationForm, _Component);

    function TeamCreationForm(props, context) {
        _classCallCheck(this, TeamCreationForm);

        _Component.call(this, props, context);
        this.state = { value: '' };
    }

    TeamCreationForm.prototype.onChange = function onChange(e, value) {
        this.setState({ value: value });
    };

    TeamCreationForm.prototype.submitCreationForm = function submitCreationForm() {
        var value = this.state.value;
        _pydioHttpApi2['default'].getRestClient().getIdmApi().saveSelectionAsTeam(value, [], this.props.onTeamCreated);
    };

    TeamCreationForm.prototype.render = function render() {
        var getMessage = this.props.getMessage;

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { style: { padding: 20 } },
                React.createElement(
                    'div',
                    null,
                    getMessage(591)
                ),
                React.createElement(TextField, { floatingLabelText: getMessage(578), value: this.state.value, onChange: this.onChange.bind(this), fullWidth: true })
            ),
            React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { style: { textAlign: 'right', padding: 8 } },
                    React.createElement(FlatButton, { label: getMessage(49), onTouchTap: this.props.onCancel.bind(this) }),
                    React.createElement(FlatButton, { label: getMessage(579), primary: true, onTouchTap: this.submitCreationForm.bind(this) })
                )
            )
        );
    };

    return TeamCreationForm;
})(Component);

TeamCreationForm.propTypes = {
    /**
     * Callback triggered after team creation succeeded
     */
    onTeamCreated: PropTypes.func.isRequired,
    /**
     * Request modal close
     */
    onCancel: PropTypes.func.isRequired
};

exports['default'] = TeamCreationForm = PydioContextConsumer(TeamCreationForm);

exports['default'] = TeamCreationForm;
module.exports = exports['default'];

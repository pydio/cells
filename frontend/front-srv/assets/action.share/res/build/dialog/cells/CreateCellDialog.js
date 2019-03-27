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

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _SharedUsers = require('./SharedUsers');

var _SharedUsers2 = _interopRequireDefault(_SharedUsers);

var _NodesPicker = require('./NodesPicker');

var _NodesPicker2 = _interopRequireDefault(_NodesPicker);

var _pydioModelCell = require('pydio/model/cell');

var _pydioModelCell2 = _interopRequireDefault(_pydioModelCell);

/**
 * Dialog for letting users create a workspace
 */
var CreateCellDialog = _react2['default'].createClass({
    displayName: 'CreateCellDialog',

    childContextTypes: {
        messages: _react2['default'].PropTypes.object,
        getMessage: _react2['default'].PropTypes.func,
        isReadonly: _react2['default'].PropTypes.func
    },

    getChildContext: function getChildContext() {
        var messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function getMessage(messageId) {
                var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'share_center' : arguments[1];

                try {
                    return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                } catch (e) {
                    return messageId;
                }
            },
            isReadonly: (function () {
                return false;
            }).bind(this)
        };
    },

    getInitialState: function getInitialState() {
        return { step: 'users', model: new _pydioModelCell2['default'](), saving: false };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        this.refs.title.focus();
        this.state.model.observe('update', function () {
            _this.forceUpdate();
        });
    },

    componentWillUnmount: function componentWillUnmount() {
        this.state.model.stopObserving('update');
    },

    submit: function submit() {
        var _this2 = this;

        var model = this.state.model;

        this.setState({ saving: true });
        model.save().then(function (result) {
            _this2.props.onDismiss();
            _this2.setState({ saving: false });
        })['catch'](function (reason) {
            pydio.UI.displayMessage('ERROR', reason.message);
            _this2.setState({ saving: false });
        });
    },

    m: function m(id) {
        return this.props.pydio.MessageHash['share_center.' + id];
    },

    computeSummaryString: function computeSummaryString() {
        var model = this.state.model;

        var users = 0;
        var groups = 0;
        var teams = 0;
        var userString = [];
        var objs = model.getAcls();
        Object.keys(objs).map(function (k) {
            var acl = objs[k];
            if (acl.Group) groups++;else if (acl.Role) teams++;else users++;
        });
        if (users) userString.push(users + ' ' + this.m(270));
        if (groups) userString.push(groups + ' ' + this.m(271));
        if (teams) userString.push(teams + ' ' + this.m(272));
        var finalString = undefined;
        if (userString.length === 3) {
            finalString = userString[0] + ', ' + userString[1] + this.m(274) + userString[3];
        } else if (userString.length === 0) {
            finalString = this.m(273);
        } else {
            finalString = userString.join(this.m(274));
        }
        return this.m(269).replace('%USERS', finalString);
    },

    render: function render() {
        var _this3 = this;

        var buttons = [];
        var content = undefined;
        var pydio = this.props.pydio;
        var _state = this.state;
        var step = _state.step;
        var model = _state.model;
        var saving = _state.saving;

        var dialogLabel = pydio.MessageHash['418'];
        if (step !== 'users') {
            dialogLabel = model.getLabel();
        }

        if (step === 'users') {

            content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    null,
                    this.m(275)
                ),
                _react2['default'].createElement(_materialUi.TextField, { ref: "title", floatingLabelText: this.m(276), value: model.getLabel(), onChange: function (e, v) {
                        model.setLabel(v);
                    }, fullWidth: true }),
                _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: this.m(277), value: model.getDescription(), onChange: function (e, v) {
                        model.setDescription(v);
                    }, fullWidth: true })
            );

            if (model.getLabel()) {
                buttons.push(_react2['default'].createElement(_materialUi.FlatButton, {
                    key: 'quick',
                    primary: true,
                    disabled: !model.getLabel() || saving,
                    label: this.m('cells.create.advanced'), // Advanced
                    onTouchTap: function () {
                        _this3.setState({ step: 'data' });
                    } }));
                buttons.push(_react2['default'].createElement(
                    'span',
                    { style: { display: 'inline-block', margin: '0  10px', fontSize: 14, fontWeight: 500, color: '#9E9E9E' } },
                    this.m('cells.create.buttons.separator')
                ));
            }

            buttons.push(_react2['default'].createElement(_materialUi.RaisedButton, {
                key: 'next1',
                disabled: !model.getLabel() || saving,
                primary: true,
                label: this.m(279), // Create Cell
                onTouchTap: function () {
                    _this3.submit();
                } }));
        } else if (step === 'data') {

            content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'h5',
                    { style: { marginTop: -10 } },
                    this.m(278)
                ),
                _react2['default'].createElement(_SharedUsers2['default'], {
                    pydio: pydio,
                    cellAcls: model.getAcls(),

                    excludes: [pydio.user.id],
                    onUserObjectAdd: model.addUser.bind(model),
                    onUserObjectRemove: model.removeUser.bind(model),
                    onUserObjectUpdateRight: model.updateUserRight.bind(model)
                })
            );

            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'prev1', primary: false, label: pydio.MessageHash['304'], onTouchTap: function () {
                    _this3.setState({ step: 'users' });
                } }));
            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'next2', primary: true, label: pydio.MessageHash['179'], onTouchTap: function () {
                    return _this3.setState({ step: 'label' });
                } }));
        } else {

            content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'h5',
                    { style: { marginTop: -10 } },
                    this.m('cells.create.title.fill.folders')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { color: '#9e9e9e' } },
                    this.computeSummaryString()
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { paddingTop: 16 } },
                    _react2['default'].createElement(_NodesPicker2['default'], { pydio: pydio, model: model })
                )
            );

            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'prev2', primary: false, label: pydio.MessageHash['304'], onTouchTap: function () {
                    _this3.setState({ step: 'data' });
                } }));
            buttons.push(_react2['default'].createElement(_materialUi.RaisedButton, { key: 'submit', disabled: saving, primary: true, label: this.m(279), onTouchTap: this.submit.bind(this) }));
        }

        return _react2['default'].createElement(
            'div',
            { style: { width: 380, fontSize: 13, color: 'rgba(0,0,0,.87)', display: 'flex', flexDirection: 'column', minHeight: 300 } },
            _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', paddingLeft: 20 } },
                _react2['default'].createElement(_materialUi.FontIcon, { className: "icomoon-cells-full-plus" }),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 20, fontSize: 22 } },
                    dialogLabel
                )
            ),
            _react2['default'].createElement(
                'div',
                { style: { padding: '20px 20px 10px', flex: 1 } },
                content
            ),
            _react2['default'].createElement(
                'div',
                { style: { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' } },
                buttons
            )
        );
    }

});

exports['default'] = CreateCellDialog = (0, _materialUiStyles.muiThemeable)()(CreateCellDialog);
exports['default'] = CreateCellDialog;
module.exports = exports['default'];

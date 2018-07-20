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
var React = require('react');
var Pydio = require('pydio');
var AjxpNode = require('pydio/model/node');

var _Pydio$requireLib = Pydio.requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var _require = require('material-ui');

var Paper = _require.Paper;
var TextField = _require.TextField;
var FlatButton = _require.FlatButton;

var InlineEditor = React.createClass({
    displayName: 'InlineEditor',

    propTypes: {
        node: React.PropTypes.instanceOf(AjxpNode),
        callback: React.PropTypes.func,
        onClose: React.PropTypes.func,
        detached: React.PropTypes.bool
    },

    submit: function submit() {
        if (!this.state || !this.state.value || this.state.value === this.props.node.getLabel()) {
            this.setState({ errorString: 'Please use a different value for renaming!' });
            this.props.getPydio().displayMessage('ERROR', 'Please use a different value for renaming!');
        } else {
            this.props.callback(this.state.value);
            this.props.onClose();
        }
    },

    componentDidMount: function componentDidMount() {
        this.refs.text.focus();
    },

    catchClicks: function catchClicks(e) {
        e.stopPropagation();
    },

    onKeyDown: function onKeyDown(e) {
        if (e.key === 'Enter') {
            this.submit();
        }
        this.setState({ errorString: '' });
        e.stopPropagation();
    },

    render: function render() {
        var _this = this;

        return React.createElement(
            Paper,
            { className: "inline-editor" + (this.props.detached ? " detached" : ""), style: { padding: 8 }, zDepth: 2 },
            React.createElement(TextField, {
                ref: 'text',
                defaultValue: this.props.node.getLabel(),
                onChange: function (e, value) {
                    _this.setState({ value: value });
                },
                onClick: this['catch'], onDoubleClick: this.catchClicks,
                tabIndex: '0', onKeyDown: this.onKeyDown,
                errorText: this.state ? this.state.errorString : null
            }),
            React.createElement(
                'div',
                { style: { textAlign: 'right', paddingTop: 8 } },
                React.createElement(FlatButton, { label: 'Cancel', onClick: this.props.onClose }),
                React.createElement(FlatButton, { label: 'Submit', onClick: this.submit })
            )
        );
    }

});

exports['default'] = InlineEditor = PydioContextConsumer(InlineEditor);

exports['default'] = InlineEditor;
module.exports = exports['default'];

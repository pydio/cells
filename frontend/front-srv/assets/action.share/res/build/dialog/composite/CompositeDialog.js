'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _CompositeCard = require('./CompositeCard');

var _CompositeCard2 = _interopRequireDefault(_CompositeCard);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var React = require('react');
var createReactClass = require('create-react-class');

var _require$requireLib = require('pydio').requireLib('boot');

var ActionDialogMixin = _require$requireLib.ActionDialogMixin;

var CompositeDialog = createReactClass({
    displayName: 'CompositeDialog',
    mixins: [ActionDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogIsModal: true,
            dialogPadding: false,
            dialogSize: 'lg'
        };
    },

    propTypes: {
        pydio: _propTypes2['default'].instanceOf(_pydio2['default']).isRequired,
        selection: _propTypes2['default'].instanceOf(_pydioModelDataModel2['default']),
        readonly: _propTypes2['default'].bool
    },

    childContextTypes: {
        messages: _propTypes2['default'].object,
        getMessage: _propTypes2['default'].func,
        isReadonly: _propTypes2['default'].func
    },

    getChildContext: function getChildContext() {
        var _this = this;

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
            isReadonly: function isReadonly() {
                return _this.props.readonly;
            }
        };
    },

    render: function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var selection = _props.selection;

        var node = undefined;
        if (selection.getUniqueNode()) {
            node = selection.getUniqueNode();
        }

        return React.createElement(_CompositeCard2['default'], {
            editorOneColumn: this.props.editorOneColumn,
            pydio: pydio,
            mode: 'edit',
            node: node,
            onDismiss: this.props.onDismiss
        });
    }
});

exports['default'] = CompositeDialog;
module.exports = exports['default'];

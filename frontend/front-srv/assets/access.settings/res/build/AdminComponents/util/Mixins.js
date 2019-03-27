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
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var MessagesConsumerMixin = {
    contextTypes: {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func
    }
};

var MessagesProviderMixin = {

    childContextTypes: {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func
    },

    getChildContext: function getChildContext() {
        var messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function getMessage(messageId) {
                var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'ajxp_admin' : arguments[1];

                try {
                    return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                } catch (e) {
                    return messageId;
                }
            }
        };
    }

};

var PydioConsumerMixin = {
    contextTypes: {
        pydio: React.PropTypes.instanceOf(Pydio)
    }
};

var PydioProviderMixin = {
    childContextTypes: {
        pydio: React.PropTypes.instanceOf(Pydio)
    },

    getChildContext: function getChildContext() {
        return {
            pydio: this.props.pydio
        };
    }
};

exports.MessagesConsumerMixin = MessagesConsumerMixin;
exports.MessagesProviderMixin = MessagesProviderMixin;
exports.PydioConsumerMixin = PydioConsumerMixin;
exports.PydioProviderMixin = PydioProviderMixin;

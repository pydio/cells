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

exports['default'] = _react2['default'].createClass({
    displayName: 'MetaList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        currentMetas: _react2['default'].PropTypes.object,
        edit: _react2['default'].PropTypes.string,
        metaSourceProvider: _react2['default'].PropTypes.object,
        closeCurrent: _react2['default'].PropTypes.func,
        setEditState: _react2['default'].PropTypes.func,
        featuresEditable: _react2['default'].PropTypes.bool
    },

    render: function render() {
        var features = [];
        var metas = Object.keys(this.props.currentMetas);
        metas.sort(function (k1, k2) {
            var type1 = k1.split('.').shift();
            var type2 = k2.split('.').shift();
            if (type1 == 'metastore' || type2 == 'index') return -1;
            if (type1 == 'index' || type2 == 'metastore') return 1;
            return k1 > k2 ? 1 : -1;
        });
        if (metas) {
            features = metas.map((function (k) {
                var removeButton, description;
                if (this.props.edit == k && this.props.featuresEditable) {
                    var remove = (function (event) {
                        event.stopPropagation();
                        this.props.metaSourceProvider.removeMetaSource(k);
                    }).bind(this);
                    removeButton = _react2['default'].createElement(
                        'div',
                        { style: { textAlign: 'right' } },
                        _react2['default'].createElement(_materialUi.FlatButton, { label: this.context.getMessage('ws.31'), primary: true, onTouchTap: remove })
                    );
                }
                description = _react2['default'].createElement(
                    'div',
                    { className: 'legend' },
                    this.props.metaSourceProvider.getMetaSourceDescription(k)
                );
                return _react2['default'].createElement(
                    PydioComponents.PaperEditorNavEntry,
                    { key: k, keyName: k, selectedKey: this.props.edit, onClick: this.props.setEditState },
                    this.props.metaSourceProvider.getMetaSourceLabel(k),
                    description,
                    removeButton
                );
            }).bind(this));
        }
        if (this.props.featuresEditable) {
            features.push(_react2['default'].createElement(
                'div',
                { className: 'menu-entry', key: 'add-feature', onClick: this.props.metaSourceProvider.showMetaSourceForm.bind(this.props.metaSourceProvider) },
                '+ ',
                this.context.getMessage('ws.32')
            ));
        }

        return _react2['default'].createElement(
            'div',
            null,
            features
        );
    }

});
module.exports = exports['default'];

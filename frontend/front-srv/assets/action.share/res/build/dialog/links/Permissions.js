'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _materialUi = require('material-ui');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _cellsSdk = require('cells-sdk');

var PublicLinkPermissions = (function (_React$Component) {
    _inherits(PublicLinkPermissions, _React$Component);

    function PublicLinkPermissions() {
        var _this = this;

        _classCallCheck(this, PublicLinkPermissions);

        _get(Object.getPrototypeOf(PublicLinkPermissions.prototype), 'constructor', this).apply(this, arguments);

        this.changePermission = function (event) {
            var name = event.target.name;
            var checked = event.target.checked;
            var _props = _this.props;
            var compositeModel = _props.compositeModel;
            var linkModel = _props.linkModel;

            var link = linkModel.getLink();
            if (checked) {
                link.Permissions.push(_cellsSdk.RestShareLinkAccessType.constructFromObject(name));
            } else {
                link.Permissions = link.Permissions.filter(function (perm) {
                    return perm !== name;
                });
            }
            if (compositeModel.getNode().isLeaf()) {
                var auth = _mainShareHelper2['default'].getAuthorizations();
                var max = auth.max_downloads;
                // Readapt template depending on permissions
                if (linkModel.hasPermission('Preview')) {
                    link.ViewTemplateName = "pydio_unique_strip";
                    link.MaxDownloads = 0; // Clear Max Downloads if Preview enabled
                } else {
                        link.ViewTemplateName = "pydio_unique_dl";
                        if (max && !link.MaxDownloads) {
                            link.MaxDownloads = max;
                        }
                    }
            }
            _this.props.linkModel.updateLink(link);
        };
    }

    _createClass(PublicLinkPermissions, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var linkModel = _props2.linkModel;
            var compositeModel = _props2.compositeModel;
            var pydio = _props2.pydio;

            var node = compositeModel.getNode();
            var perms = [],
                previewWarning = undefined;
            var auth = _mainShareHelper2['default'].getAuthorizations();

            if (node.isLeaf()) {
                var _ShareHelper$nodeHasEditor = _mainShareHelper2['default'].nodeHasEditor(pydio, node);

                var preview = _ShareHelper$nodeHasEditor.preview;
                var writeable = _ShareHelper$nodeHasEditor.writeable;

                perms.push({
                    NAME: 'Download',
                    LABEL: this.props.getMessage('73'),
                    DISABLED: !preview || !linkModel.hasPermission('Preview') // Download Only, cannot edit this
                });
                if (preview && !auth.max_downloads) {
                    perms.push({
                        NAME: 'Preview',
                        LABEL: this.props.getMessage('72'),
                        DISABLED: !linkModel.hasPermission('Download')
                    });
                    if (linkModel.hasPermission('Preview')) {
                        if (writeable) {
                            perms.push({
                                NAME: 'Upload',
                                LABEL: this.props.getMessage('74b')
                            });
                        }
                    }
                }
            } else {
                perms.push({
                    NAME: 'Preview',
                    LABEL: this.props.getMessage('72'),
                    DISABLED: !linkModel.hasPermission('Upload')
                });
                perms.push({
                    NAME: 'Download',
                    LABEL: this.props.getMessage('73')
                });
                perms.push({
                    NAME: 'Upload',
                    LABEL: this.props.getMessage('74')
                });
            }

            /*
            if(this.props.shareModel.isPublicLinkPreviewDisabled() && this.props.shareModel.getPublicLinkPermission(linkId, 'read')){
                previewWarning = <div>{this.props.getMessage('195')}</div>;
            }
            */
            return _react2['default'].createElement(
                'div',
                { style: _extends({ padding: '10px 16px' }, this.props.style) },
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)' } },
                    this.props.getMessage('70r')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { margin: '10px 0 20px' } },
                    perms.map((function (p) {
                        return _react2['default'].createElement(_materialUi.Checkbox, {
                            key: p.NAME,
                            disabled: p.DISABLED || this.props.isReadonly() || !linkModel.isEditable(),
                            type: 'checkbox',
                            name: p.NAME,
                            label: p.LABEL,
                            onCheck: this.changePermission,
                            checked: linkModel.hasPermission(p.NAME),
                            labelStyle: { whiteSpace: 'nowrap' },
                            style: { margin: '10px 0' }
                        });
                    }).bind(this)),
                    previewWarning
                )
            );
        }
    }], [{
        key: 'propTypes',
        value: {
            linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default']),
            style: _propTypes2['default'].object
        },
        enumerable: true
    }]);

    return PublicLinkPermissions;
})(_react2['default'].Component);

exports['default'] = PublicLinkPermissions = (0, _ShareContextConsumer2['default'])(PublicLinkPermissions);
exports['default'] = PublicLinkPermissions;
module.exports = exports['default'];

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _InfoPanelCard = require('./InfoPanelCard');

var _InfoPanelCard2 = _interopRequireDefault(_InfoPanelCard);

var _viewsFilePreview = require('../views/FilePreview');

var _viewsFilePreview2 = _interopRequireDefault(_viewsFilePreview);

var GenericInfoCard = (function (_React$Component) {
    _inherits(GenericInfoCard, _React$Component);

    function GenericInfoCard(props) {
        _classCallCheck(this, GenericInfoCard);

        _React$Component.call(this, props);
        this.state = this.build(props);
    }

    GenericInfoCard.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        this.setState(this.build(nextProps));
    };

    GenericInfoCard.prototype.build = function build(props) {
        var isMultiple = undefined,
            isLeaf = undefined,
            isDir = undefined;

        // Determine if we have a multiple selection or a single
        var node = props.node;
        var nodes = props.nodes;

        if (nodes) {
            isMultiple = true;
        } else if (node) {
            isLeaf = node.isLeaf();
            isDir = !isLeaf;
        } else {
            return { ready: false };
        }
        return {
            isMultiple: isMultiple,
            isLeaf: isLeaf,
            isDir: isDir,
            ready: true
        };
    };

    GenericInfoCard.prototype.render = function render() {

        if (!this.state.ready) {
            return null;
        }

        if (this.state.isMultiple) {
            var nodes = this.props.nodes;
            var more = undefined;
            if (nodes.length > 10) {
                var moreNumber = nodes.length - 10;
                nodes = nodes.slice(0, 10);
                more = _react2['default'].createElement(
                    'div',
                    null,
                    '... and ',
                    moreNumber,
                    ' more.'
                );
            }
            return _react2['default'].createElement(
                _InfoPanelCard2['default'],
                _extends({}, this.props, { primaryToolbars: ["info_panel", "info_panel_share"] }),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '0' } },
                    nodes.map(function (node) {
                        return _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #eeeeee' } },
                            _react2['default'].createElement(_viewsFilePreview2['default'], {
                                key: node.getPath(),
                                style: { height: 50, width: 50, fontSize: 25, flexShrink: 0 },
                                node: node,
                                loadThumbnail: true,
                                richPreview: false
                            }),
                            _react2['default'].createElement(
                                'div',
                                { style: { flex: 1, fontSize: 14, marginLeft: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                                node.getLabel()
                            )
                        );
                    }),
                    more
                )
            );
        } else {
            var processing = !!this.props.node.getMetadata().get('Processing');
            return _react2['default'].createElement(
                _InfoPanelCard2['default'],
                _extends({}, this.props, { primaryToolbars: ["info_panel", "info_panel_share"] }),
                _react2['default'].createElement(_viewsFilePreview2['default'], {
                    key: this.props.node.getPath(),
                    style: { backgroundColor: 'white', height: 200, padding: 0 },
                    node: this.props.node,
                    loadThumbnail: this.state.isLeaf && !processing,
                    richPreview: this.state.isLeaf,
                    processing: processing
                })
            );
        }

        return null;
    };

    return GenericInfoCard;
})(_react2['default'].Component);

exports['default'] = GenericInfoCard;
module.exports = exports['default'];

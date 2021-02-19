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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var FilePreview = (function (_PureComponent) {
    _inherits(FilePreview, _PureComponent);

    _createClass(FilePreview, null, [{
        key: 'propTypes',
        get: function get() {
            return {
                node: _propTypes2['default'].instanceOf(AjxpNode).isRequired,
                loadThumbnail: _propTypes2['default'].bool,
                richPreview: _propTypes2['default'].bool,
                processing: _propTypes2['default'].bool,
                // Additional styling
                style: _propTypes2['default'].object,
                mimeFontStyle: _propTypes2['default'].object,
                mimeClassName: _propTypes2['default'].string
            };
        }
    }, {
        key: 'defaultProps',
        get: function get() {
            return { richPreview: false };
        }
    }]);

    function FilePreview(props) {
        _classCallCheck(this, FilePreview);

        _PureComponent.call(this, props);

        this.state = {
            loading: false
        };
    }

    FilePreview.prototype.getStyles = function getStyles() {
        var _props = this.props;
        var style = _props.style;
        var mimeFontStyle = _props.mimeFontStyle;

        var color = new _color2['default'](this.props.muiTheme.palette.primary1Color).saturationl(18).lightness(44).toString();
        var light = new _color2['default'](this.props.muiTheme.palette.primary1Color).saturationl(15).lightness(94).toString();

        var rootStyle = _extends({
            backgroundColor: light,
            alignItems: "initial"
        }, style);

        var mimefontStyle = _extends({
            color: color
        }, mimeFontStyle);

        return { rootStyle: rootStyle, mimeFontStyle: mimefontStyle };
    };

    FilePreview.prototype.insertPreviewNode = function insertPreviewNode(previewNode) {
        this._previewNode = previewNode;
        var containerNode = this.refs.container;
        containerNode.innerHTML = '';
        containerNode.className = 'richPreviewContainer';
        containerNode.appendChild(this._previewNode);
    };

    FilePreview.prototype.destroyPreviewNode = function destroyPreviewNode() {
        if (this._previewNode) {
            this._previewNode.destroyElement();
            if (this._previewNode.parentNode) {
                this._previewNode.parentNode.removeChild(this._previewNode);
            }
            this._previewNode = null;
        }
    };

    FilePreview.prototype.componentDidMount = function componentDidMount() {
        this.loadCoveringImage();
    };

    FilePreview.prototype.componentWillUnmount = function componentWillUnmount() {
        this.destroyPreviewNode();
    };

    FilePreview.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        if (nextProps.node.getPath() !== this.props.node.getPath()) {
            this.destroyPreviewNode();
            this.loadCoveringImage();
            return;
        }

        if (this._previewNode) {
            return;
        }

        if (nextProps.loadThumbnail !== this.props.loadThumbnail && nextProps.loadThumbnail) {
            this.loadCoveringImage(true);
        }
    };

    FilePreview.prototype.loadCoveringImage = function loadCoveringImage() {
        var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (!this.props.loadThumbnail && !force) {
            return;
        }
        var pydio = window.pydio,
            node = this.props.node;
        var editors = window.pydio.Registry.findEditorsForMime(node.isLeaf() ? node.getAjxpMime() : "mime_folder", true);
        if (!editors || !editors.length) {
            return;
        }
        var editor = editors[0];
        var editorClassName = editors[0].editorClass;

        pydio.Registry.loadEditorResources(editors[0].resourcesManager, (function () {
            var component = FuncUtils.getFunctionByName(editorClassName, window);

            if (component) {
                this.loadPreviewFromEditor(component, node);
            }
        }).bind(this));
    };

    FilePreview.prototype.loadPreviewFromEditor = function loadPreviewFromEditor(editorClass, node) {
        this.setState({
            EditorClass: this.props.richPreview ? editorClass.Panel : editorClass.Badge
        });
    };

    FilePreview.prototype.render = function render() {
        var _getStyles = this.getStyles();

        var rootStyle = _getStyles.rootStyle;
        var mimeFontStyle = _getStyles.mimeFontStyle;
        var _props2 = this.props;
        var node = _props2.node;
        var mimeClassName = _props2.mimeClassName;
        var processing = _props2.processing;
        var EditorClass = this.state.EditorClass;

        var element = undefined;

        if (processing) {
            element = React.createElement(_materialUi.CircularProgress, { size: 40, thickness: 2 });
        } else if (EditorClass) {
            element = React.createElement(EditorClass, _extends({ pydio: pydio }, this.props, { preview: true, mimeFontStyle: mimeFontStyle }));
        } else {
            var icClass = node.getSvgSource() || (node.isLeaf() ? 'file' : 'folder');
            if (icClass && !icClass.startsWith('icomoon')) {
                icClass = 'mdi mdi-' + icClass;
            }
            element = React.createElement('div', { key: 'icon', className: mimeClassName || 'mimefont ' + icClass, style: mimeFontStyle });
        }

        return React.createElement(
            'div',
            { ref: 'container', style: rootStyle, className: 'mimefont-container' + (EditorClass ? ' with-editor-badge' : ''), onClick: this.props.onClick },
            element
        );
    };

    return FilePreview;
})(_react.PureComponent);

exports['default'] = _materialUiStyles.muiThemeable()(FilePreview);
module.exports = exports['default'];

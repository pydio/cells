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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var _FileDropzone = require('./FileDropzone');

var _FileDropzone2 = _interopRequireDefault(_FileDropzone);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var NativeFileDropProvider = _Pydio$requireLib.NativeFileDropProvider;

// Just enable the drop mechanism, but do nothing, it is managed by the FileDropzone
var BinaryDropZone = NativeFileDropProvider(_FileDropzone2['default'], function (items, files, props) {});

/**
 * UI for displaying and uploading an image,
 * using the binaryContext string.
 */
exports['default'] = _react2['default'].createClass({
    displayName: 'InputImage',

    mixins: [_mixinsFormMixin2['default']],

    propTypes: {
        attributes: _react2['default'].PropTypes.object,
        binary_context: _react2['default'].PropTypes.string
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        var imgSrc = undefined;
        if ((newProps.value || newProps.binary_context && newProps.binary_context !== this.props.binary_context) && !this.state.reset) {
            imgSrc = this.getBinaryUrl(newProps, this.state.temporaryBinary && this.state.temporaryBinary === newProps.value);
        } else if (newProps.attributes['defaultImage']) {
            imgSrc = newProps.attributes['defaultImage'];
        }
        if (imgSrc) {
            this.setState({ imageSrc: imgSrc, reset: false });
        }
    },

    getInitialState: function getInitialState() {
        var imgSrc = undefined,
            originalBinary = undefined;
        if (this.props.value) {
            imgSrc = this.getBinaryUrl(this.props);
            originalBinary = this.props.value;
        } else if (this.props.attributes['defaultImage']) {
            imgSrc = this.props.attributes['defaultImage'];
        }
        return { imageSrc: imgSrc, originalBinary: originalBinary };
    },

    getBinaryUrl: function getBinaryUrl(props) {
        var pydio = _pydioHttpApi2['default'].getClient().getPydioObject();
        var url = pydio.Parameters.get('ENDPOINT_REST_API') + props.attributes['loadAction'];
        var bId = props.value;
        if (props.binary_context && props.binary_context.indexOf('user_id=') === 0) {
            bId = props.binary_context.replace('user_id=', '');
        }
        url = url.replace('{BINARY}', bId);
        return url;
    },

    getUploadUrl: function getUploadUrl() {
        var pydio = _pydioHttpApi2['default'].getClient().getPydioObject();
        var url = pydio.Parameters.get('ENDPOINT_REST_API') + this.props.attributes['uploadAction'];
        var bId = '';
        if (this.props.binary_context && this.props.binary_context.indexOf('user_id=') === 0) {
            bId = this.props.binary_context.replace('user_id=', '');
        } else if (this.props.value) {
            bId = this.props.value;
        } else {
            bId = _pydioUtilLang2['default'].computeStringSlug(this.props.attributes["name"] + ".png");
        }
        url = url.replace('{BINARY}', bId);
        return url;
    },

    uploadComplete: function uploadComplete(newBinaryName) {
        var prevValue = this.state.value;
        this.setState({
            temporaryBinary: newBinaryName,
            value: null
        });
        if (this.props.onChange) {
            var additionalFormData = { type: 'binary' };
            if (this.state.originalBinary) {
                additionalFormData['original_binary'] = this.state.originalBinary;
            }
            this.props.onChange(newBinaryName, prevValue, additionalFormData);
        }
    },

    htmlUpload: function htmlUpload() {
        window.formManagerHiddenIFrameSubmission = (function (result) {
            this.uploadComplete(result.trim());
            window.formManagerHiddenIFrameSubmission = null;
        }).bind(this);
        this.refs.uploadForm.submit();
    },

    onDrop: function onDrop(files, event, dropzone) {
        var _this = this;

        if (files.length === 0) {
            return;
        }
        var messages = _pydio2['default'].getMessages();
        var name = this.props.name;

        if (name === 'avatar' && files[0].size > 5 * 1024 * 1024) {
            this.setState({ error: messages['form.input-image.avatarMax'] });
            return;
        }
        if (['image/jpeg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'].indexOf(files[0].type) === -1) {
            this.setState({ error: messages['form.input-image.fileTypes'] });
            return;
        }
        this.setState({ error: null });
        if (_pydioHttpApi2['default'].supportsUpload()) {
            this.setState({ loading: true });
            _pydioHttpApi2['default'].getRestClient().getOrUpdateJwt().then(function (jwt) {
                var xhrSettings = { customHeaders: { Authorization: 'Bearer ' + jwt } };
                _pydioHttpApi2['default'].getClient().uploadFile(files[0], "userfile", '', function (transport) {
                    var result = JSON.parse(transport.responseText);
                    if (result && result.binary) {
                        _this.uploadComplete(result.binary);
                    }
                    _this.setState({ loading: false });
                }, function (error) {
                    // error
                    _this.setState({ loading: false, error: error });
                }, function (computableEvent) {
                    // progress, not really useful for small uploads
                    // console.log(computableEvent);
                }, _this.getUploadUrl(), xhrSettings);
            });
        } else {
            this.htmlUpload();
        }
    },

    clearImage: function clearImage() {
        var _this2 = this;

        if (global.confirm(_pydio2['default'].getMessages()['form.input-image.clearConfirm'])) {
            (function () {
                var prevValue = _this2.state.value;
                _this2.setState({
                    value: null,
                    error: null,
                    reset: true
                }, (function () {
                    this.props.onChange('', prevValue, { type: 'binary' });
                }).bind(_this2));
            })();
        }
    },

    render: function render() {
        var _this3 = this;

        var _state = this.state;
        var loading = _state.loading;
        var error = _state.error;

        var coverImageStyle = {
            backgroundImage: "url(" + this.state.imageSrc + ")",
            backgroundPosition: "50% 50%",
            backgroundSize: "cover",
            position: 'relative'
        };
        var overlay = undefined,
            overlayBg = {};
        if (error) {
            overlayBg = { backgroundColor: 'rgba(255, 255, 255, 0.77)', borderRadius: '50%' };
            overlay = _react2['default'].createElement(
                'div',
                { style: { color: '#F44336', textAlign: 'center', fontSize: 11, cursor: 'pointer' }, onClick: function () {
                        _this3.setState({ error: null });
                    } },
                _react2['default'].createElement('span', { className: "mdi mdi-alert", style: { fontSize: 40 } }),
                _react2['default'].createElement('br', null),
                error
            );
        } else if (loading) {
            overlay = _react2['default'].createElement(_materialUi.CircularProgress, { mode: "indeterminate" });
        } else {
            var isDefault = this.props.attributes['defaultImage'] && this.props.attributes['defaultImage'] === this.state.imageSrc;
            overlay = _react2['default'].createElement('span', { className: "mdi mdi-camera", style: { fontSize: 40, opacity: .5, color: isDefault ? null : 'white' } });
        }

        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(
                'div',
                { className: 'image-label' },
                this.props.attributes.label
            ),
            _react2['default'].createElement(
                'form',
                { ref: 'uploadForm', encType: 'multipart/form-data', target: 'uploader_hidden_iframe', method: 'post', action: this.getUploadUrl() },
                _react2['default'].createElement(
                    BinaryDropZone,
                    { onDrop: this.onDrop, accept: 'image/*', style: coverImageStyle },
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }, overlayBg) },
                        overlay
                    )
                )
            ),
            _react2['default'].createElement(
                'div',
                { className: 'binary-remove-button', onClick: this.clearImage },
                _react2['default'].createElement('span', { key: 'remove', className: 'mdi mdi-close' }),
                ' ',
                _pydio2['default'].getMessages()['form.input-image.clearButton']
            ),
            _react2['default'].createElement('iframe', { style: { display: "none" }, id: 'uploader_hidden_iframe', name: 'uploader_hidden_iframe' })
        );
    }

});
module.exports = exports['default'];

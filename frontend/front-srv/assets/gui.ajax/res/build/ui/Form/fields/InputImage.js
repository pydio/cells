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

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var _FileDropzone = require('./FileDropzone');

var _FileDropzone2 = _interopRequireDefault(_FileDropzone);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

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
        console.log('uploading now');
        if (_pydioHttpApi2['default'].supportsUpload()) {
            this.setState({ loading: true });
            _pydioHttpApi2['default'].getClient().uploadFile(files[0], "userfile", '', (function (transport) {
                var result = JSON.parse(transport.responseText);
                if (result && result.binary) {
                    this.uploadComplete(result.binary);
                }
                this.setState({ loading: false });
            }).bind(this), (function (transport) {
                // error
                this.setState({ loading: false });
            }).bind(this), function (computableEvent) {
                // progress
                // console.log(computableEvent);
            }, this.getUploadUrl());
        } else {
            this.htmlUpload();
        }
    },

    clearImage: function clearImage() {
        var _this = this;

        if (global.confirm('Do you want to remove the current image?')) {
            (function () {
                var prevValue = _this.state.value;
                _this.setState({
                    value: null,
                    reset: true
                }, (function () {
                    this.props.onChange('', prevValue, { type: 'binary' });
                }).bind(_this));
            })();
        }
    },

    render: function render() {
        var coverImageStyle = {
            backgroundImage: "url(" + this.state.imageSrc + ")",
            backgroundPosition: "50% 50%",
            backgroundSize: "cover"
        };
        var icons = [];
        if (this.state && this.state.loading) {
            icons.push(_react2['default'].createElement('span', { key: 'spinner', className: 'icon-spinner rotating', style: { opacity: '0' } }));
        } else {
            icons.push(_react2['default'].createElement('span', { key: 'camera', className: 'icon-camera', style: { opacity: '0' } }));
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
                    icons
                )
            ),
            _react2['default'].createElement(
                'div',
                { className: 'binary-remove-button', onClick: this.clearImage },
                _react2['default'].createElement('span', { key: 'remove', className: 'mdi mdi-close' }),
                ' RESET'
            ),
            _react2['default'].createElement('iframe', { style: { display: "none" }, id: 'uploader_hidden_iframe', name: 'uploader_hidden_iframe' })
        );
    }

});
module.exports = exports['default'];

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioForm = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var _mixinsFieldWithChoices = require('../mixins/FieldWithChoices');

var _mixinsFieldWithChoices2 = _interopRequireDefault(_mixinsFieldWithChoices);

var React = require('react');

var _require = require('material-ui');

var AutoComplete = _require.AutoComplete;
var MenuItem = _require.MenuItem;
var RefreshIndicator = _require.RefreshIndicator;

var AutocompleteBox = React.createClass({
    displayName: 'AutocompleteBox',

    mixins: [_mixinsFormMixin2['default']],

    handleUpdateInput: function handleUpdateInput(searchText) {
        //this.setState({searchText: searchText});
    },

    handleNewRequest: function handleNewRequest(chosenValue) {
        if (chosenValue.key === undefined) {
            this.onChange(null, chosenValue);
        } else {
            this.onChange(null, chosenValue.key);
        }
    },

    render: function render() {
        var choices = this.props.choices;

        var dataSource = [];
        var labels = {};
        choices.forEach(function (choice, key) {
            dataSource.push({
                key: key,
                text: choice,
                value: React.createElement(
                    MenuItem,
                    null,
                    choice
                )
            });
            labels[key] = choice;
        });

        var displayText = this.state.value;
        if (labels && labels[displayText]) {
            displayText = labels[displayText];
        }

        if (this.isDisplayGrid() && !this.state.editMode || this.props.disabled) {
            var value = this.state.value;
            if (choices.get(value)) {
                value = choices.get(value);
            }
            return React.createElement(
                'div',
                {
                    onClick: this.props.disabled ? function () {} : this.toggleEditMode,
                    className: value ? '' : 'paramValue-empty' },
                !value ? 'Empty' : value,
                '   ',
                React.createElement('span', { className: 'icon-caret-down' })
            );
        }

        return React.createElement(
            'div',
            { className: 'pydioform_autocomplete', style: { position: 'relative' } },
            !dataSource.length && React.createElement(RefreshIndicator, {
                size: 30,
                right: 10,
                top: 0,
                status: 'loading'
            }),
            dataSource.length && React.createElement(AutoComplete, {
                fullWidth: true,
                searchText: displayText,
                onUpdateInput: this.handleUpdateInput,
                onNewRequest: this.handleNewRequest,
                dataSource: dataSource,
                floatingLabelText: this.props.attributes['label'],
                filter: function (searchText, key) {
                    if (!key || !searchText) {
                        return false;
                    }
                    return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
                },
                openOnFocus: true,
                menuProps: { maxHeight: 200 }
            })
        );
    }

});

exports['default'] = AutocompleteBox = _mixinsFieldWithChoices2['default'](AutocompleteBox);
exports['default'] = AutocompleteBox;
module.exports = exports['default'];

},{"../mixins/FieldWithChoices":16,"../mixins/FormMixin":17,"material-ui":"material-ui","react":"react"}],2:[function(require,module,exports){
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

var React = require('react');
var debounce = require('lodash.debounce');

var _require = require('material-ui');

var AutoComplete = _require.AutoComplete;
var MenuItem = _require.MenuItem;
var RefreshIndicator = _require.RefreshIndicator;
var FontIcon = _require.FontIcon;

var AutocompleteTree = React.createClass({
    displayName: 'AutocompleteTree',

    mixins: [_mixinsFormMixin2['default']],

    handleUpdateInput: function handleUpdateInput(searchText) {
        this.debounced();
        this.setState({ searchText: searchText });
    },

    handleNewRequest: function handleNewRequest(chosenValue) {
        var key = undefined;
        if (chosenValue.key !== undefined) {
            key = chosenValue.key;
        } else {
            key = chosenValue;
        }
        this.onChange(null, key);
        this.loadValues(key);
    },

    componentWillMount: function componentWillMount() {
        this.debounced = debounce(this.loadValues.bind(this), 300);
        this.lastSearch = null;
        var value = "";
        if (this.props.value) {
            value = this.props.value;
        }
        this.loadValues(value);
    },

    loadValues: function loadValues() {
        var value = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

        var basePath = value;
        if (!value && this.state.searchText) {
            var last = this.state.searchText.lastIndexOf('/');
            basePath = this.state.searchText.substr(0, last);
        }
        if (this.lastSearch !== null && this.lastSearch === basePath) {
            return;
        }
        this.lastSearch = basePath;
        // TODO : load values from service
    },

    render: function render() {

        var dataSource = [];
        if (this.state && this.state.nodes) {
            this.state.nodes.forEach(function (node) {
                var icon = "mdi mdi-folder";
                if (node.uuid.startsWith("DATASOURCE:")) {
                    icon = "mdi mdi-database";
                }
                dataSource.push({
                    key: node.path,
                    text: node.path,
                    value: React.createElement(
                        MenuItem,
                        null,
                        React.createElement(FontIcon, { className: icon, color: '#616161', style: { float: 'left', marginRight: 8 } }),
                        ' ',
                        node.path
                    )
                });
            });
        }

        var displayText = this.state.value;

        return React.createElement(
            'div',
            { className: 'pydioform_autocomplete', style: { position: 'relative' } },
            !dataSource.length && React.createElement(RefreshIndicator, {
                size: 30,
                right: 10,
                top: 0,
                status: 'loading'
            }),
            React.createElement(AutoComplete, {
                fullWidth: true,
                searchText: displayText,
                onUpdateInput: this.handleUpdateInput,
                onNewRequest: this.handleNewRequest,
                dataSource: dataSource,
                floatingLabelText: this.props.attributes['label'],
                filter: function (searchText, key) {
                    return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
                },
                openOnFocus: true,
                menuProps: { maxHeight: 200 }
            })
        );
    }

});

exports['default'] = AutocompleteTree;
module.exports = exports['default'];

},{"../mixins/FormMixin":17,"lodash.debounce":"lodash.debounce","material-ui":"material-ui","react":"react"}],3:[function(require,module,exports){
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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');

/**
 * UI to drop a file (or click to browse), used by the InputImage component.
 */
exports["default"] = React.createClass({
    displayName: "FileDropzone",

    getDefaultProps: function getDefaultProps() {
        return {
            supportClick: true,
            multiple: true,
            onDrop: function onDrop() {}
        };
    },

    getInitialState: function getInitialState() {
        return {
            isDragActive: false
        };
    },

    propTypes: {
        onDrop: React.PropTypes.func.isRequired,
        ignoreNativeDrop: React.PropTypes.bool,
        size: React.PropTypes.number,
        style: React.PropTypes.object,
        dragActiveStyle: React.PropTypes.object,
        supportClick: React.PropTypes.bool,
        accept: React.PropTypes.string,
        multiple: React.PropTypes.bool
    },

    onDragLeave: function onDragLeave(e) {
        this.setState({
            isDragActive: false
        });
    },

    onDragOver: function onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";

        this.setState({
            isDragActive: true
        });
    },

    onFilePicked: function onFilePicked(e) {
        if (!e.target || !e.target.files) return;
        var files = e.target.files;
        var maxFiles = this.props.multiple ? files.length : 1;
        files = Array.prototype.slice.call(files, 0, maxFiles);
        if (this.props.onDrop) {
            this.props.onDrop(files, e, this);
        }
    },

    onFolderPicked: function onFolderPicked(e) {
        if (this.props.onFolderPicked) {
            this.props.onFolderPicked(e.target.files);
        }
    },

    onDrop: function onDrop(e) {

        this.setState({
            isDragActive: false
        });
        e.preventDefault();
        if (this.props.ignoreNativeDrop) {
            return;
        }

        var files = undefined;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }

        var maxFiles = this.props.multiple ? files.length : 1;
        for (var i = 0; i < maxFiles; i++) {
            files[i].preview = URL.createObjectURL(files[i]);
        }

        if (this.props.onDrop) {
            files = Array.prototype.slice.call(files, 0, maxFiles);
            this.props.onDrop(files, e, this);
        }
    },

    onClick: function onClick() {
        if (this.props.supportClick === true) {
            this.open();
        }
    },

    open: function open() {
        this.refs.fileInput.click();
    },

    openFolderPicker: function openFolderPicker() {
        this.refs.folderInput.setAttribute("webkitdirectory", "true");
        this.refs.folderInput.click();
    },

    render: function render() {

        var className = this.props.className || 'file-dropzone';
        if (this.state.isDragActive) {
            className += ' active';
        }

        var style = {
            width: this.props.size || 100,
            height: this.props.size || 100
        };
        //borderStyle: this.state.isDragActive ? "solid" : "dashed"
        if (this.props.style) {
            style = _extends({}, style, this.props.style);
        }
        if (this.state.isDragActive && this.props.dragActiveStyle) {
            style = _extends({}, style, this.props.dragActiveStyle);
        }
        var folderInput = undefined;
        if (this.props.enableFolders) {
            folderInput = React.createElement("input", { style: { display: 'none' }, name: "userfolder", type: "file", ref: "folderInput", onChange: this.onFolderPicked });
        }
        return React.createElement(
            "div",
            { className: className, style: style, onClick: this.onClick, onDragLeave: this.onDragLeave, onDragOver: this.onDragOver, onDrop: this.onDrop },
            React.createElement("input", { style: { display: 'none' }, name: "userfile", type: "file", multiple: this.props.multiple, ref: "fileInput", value: "", onChange: this.onFilePicked, accept: this.props.accept }),
            folderInput,
            this.props.children
        );
    }

});
module.exports = exports["default"];

},{"react":"react"}],4:[function(require,module,exports){
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

var React = require('react');

var _require = require('material-ui');

var Toggle = _require.Toggle;

/**
 * Boolean input
 */
exports['default'] = React.createClass({
    displayName: 'InputBoolean',

    mixins: [_mixinsFormMixin2['default']],

    getDefaultProps: function getDefaultProps() {
        return {
            skipBufferChanges: true
        };
    },

    onCheck: function onCheck(event, newValue) {
        this.props.onChange(newValue, this.state.value);
        this.setState({
            dirty: true,
            value: newValue
        });
    },

    getBooleanState: function getBooleanState() {
        var boolVal = this.state.value;
        if (typeof boolVal === 'string') {
            boolVal = boolVal == "true";
        }
        return boolVal;
    },

    render: function render() {
        var boolVal = this.getBooleanState();
        return React.createElement(
            'span',
            null,
            React.createElement(Toggle, {
                toggled: boolVal,
                onToggle: this.onCheck,
                disabled: this.props.disabled,
                label: this.isDisplayForm() ? this.props.attributes.label : null,
                labelPosition: this.isDisplayForm() ? 'left' : 'right'
            })
        );
    }

});
module.exports = exports['default'];

},{"../mixins/FormMixin":17,"material-ui":"material-ui","react":"react"}],5:[function(require,module,exports){
(function (global){
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

var _mixinsActionRunnerMixin = require('../mixins/ActionRunnerMixin');

var _mixinsActionRunnerMixin2 = _interopRequireDefault(_mixinsActionRunnerMixin);

var React = require('react');

var _require = require('material-ui');

var RaisedButton = _require.RaisedButton;

/**
 * Simple RaisedButton executing the applyButtonAction
 */
exports['default'] = React.createClass({
    displayName: 'InputButton',

    mixins: [_mixinsActionRunnerMixin2['default']],

    applyButton: function applyButton() {

        var callback = this.props.actionCallback;
        if (!callback) {
            callback = function (transport) {
                var text = transport.responseText;
                if (text.startsWith('SUCCESS:')) {
                    global.pydio.displayMessage('SUCCESS', transport.responseText.replace('SUCCESS:', ''));
                } else {
                    global.pydio.displayMessage('ERROR', transport.responseText.replace('ERROR:', ''));
                }
            };
        }
        this.applyAction(callback);
    },

    render: function render() {
        return React.createElement(RaisedButton, {
            label: this.props.attributes['label'],
            onTouchTap: this.applyButton,
            disabled: this.props.disabled
        });
    }
});
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../mixins/ActionRunnerMixin":15,"material-ui":"material-ui","react":"react"}],6:[function(require,module,exports){
(function (global){
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
        var _this = this;

        if (_pydioHttpApi2['default'].supportsUpload()) {
            this.setState({ loading: true });
            _pydioHttpApi2['default'].getRestClient().getOrUpdateJwt().then(function (jwt) {
                var xhrSettings = { customHeaders: { Authorization: 'Bearer ' + jwt } };
                _pydioHttpApi2['default'].getClient().uploadFile(files[0], "userfile", '', (function (transport) {
                    var result = JSON.parse(transport.responseText);
                    if (result && result.binary) {
                        this.uploadComplete(result.binary);
                    }
                    this.setState({ loading: false });
                }).bind(_this), (function (transport) {
                    // error
                    this.setState({ loading: false });
                }).bind(_this), function (computableEvent) {
                    // progress
                    // console.log(computableEvent);
                }, _this.getUploadUrl(), xhrSettings);
            });
        } else {
            this.htmlUpload();
        }
    },

    clearImage: function clearImage() {
        var _this2 = this;

        if (global.confirm('Do you want to remove the current image?')) {
            (function () {
                var prevValue = _this2.state.value;
                _this2.setState({
                    value: null,
                    reset: true
                }, (function () {
                    this.props.onChange('', prevValue, { type: 'binary' });
                }).bind(_this2));
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../mixins/FormMixin":17,"./FileDropzone":3,"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/lang":"pydio/util/lang","react":"react"}],7:[function(require,module,exports){
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

var React = require('react');
var ReactMUI = require('material-ui-legacy');

/**
 * Text input that is converted to integer, and
 * the UI can react to arrows for incrementing/decrementing values
 */
exports['default'] = React.createClass({
    displayName: 'InputInteger',

    mixins: [_mixinsFormMixin2['default']],

    keyDown: function keyDown(event) {
        var inc = 0,
            multiple = 1;
        if (event.key == 'Enter') {
            this.toggleEditMode();
            return;
        } else if (event.key == 'ArrowUp') {
            inc = +1;
        } else if (event.key == 'ArrowDown') {
            inc = -1;
        }
        if (event.shiftKey) {
            multiple = 10;
        }
        var parsed = parseInt(this.state.value);
        if (isNaN(parsed)) parsed = 0;
        var value = parsed + inc * multiple;
        this.onChange(null, value);
    },

    render: function render() {
        if (this.isDisplayGrid() && !this.state.editMode) {
            var value = this.state.value;
            return React.createElement(
                'div',
                { onClick: this.props.disabled ? function () {} : this.toggleEditMode, className: value ? '' : 'paramValue-empty' },
                !value ? 'Empty' : value
            );
        } else {
            var intval = undefined;
            if (this.state.value) {
                intval = parseInt(this.state.value) + '';
                if (isNaN(intval)) intval = this.state.value + '';
            } else {
                intval = '0';
            }
            return React.createElement(
                'span',
                { className: 'integer-input' },
                React.createElement(ReactMUI.TextField, {
                    value: intval,
                    onChange: this.onChange,
                    onKeyDown: this.keyDown,
                    disabled: this.props.disabled,
                    floatingLabelText: this.isDisplayForm() ? this.props.attributes.label : null
                })
            );
        }
    }

});
module.exports = exports['default'];

},{"../mixins/FormMixin":17,"material-ui-legacy":"material-ui-legacy","react":"react"}],8:[function(require,module,exports){
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

var _mixinsFieldWithChoices = require('../mixins/FieldWithChoices');

var _mixinsFieldWithChoices2 = _interopRequireDefault(_mixinsFieldWithChoices);

/**
 * Select box input conforming to Pydio standard form parameter.
 */

var React = require('react');

var _require = require('material-ui');

var SelectField = _require.SelectField;
var MenuItem = _require.MenuItem;
var Chip = _require.Chip;

var LangUtils = require('pydio/util/lang');
var InputSelectBox = React.createClass({
    displayName: 'InputSelectBox',

    mixins: [_mixinsFormMixin2['default']],

    getDefaultProps: function getDefaultProps() {
        return {
            skipBufferChanges: true
        };
    },

    onDropDownChange: function onDropDownChange(event, index, value) {
        this.onChange(event, value);
        this.toggleEditMode();
    },

    onMultipleSelect: function onMultipleSelect(event, index, newValue) {
        if (newValue == -1) return;
        var currentValue = this.state.value;
        var currentValues = typeof currentValue === 'string' ? currentValue.split(',') : currentValue;
        if (!currentValues.indexOf(newValue) !== -1) {
            currentValues.push(newValue);
            this.onChange(event, currentValues.join(','));
        }
        this.toggleEditMode();
    },

    onMultipleRemove: function onMultipleRemove(value) {
        var currentValue = this.state.value;
        var currentValues = typeof currentValue === 'string' ? currentValue.split(',') : currentValue;
        if (currentValues.indexOf(value) !== -1) {
            currentValues = LangUtils.arrayWithout(currentValues, currentValues.indexOf(value));
            this.onChange(null, currentValues.join(','));
        }
    },

    render: function render() {
        var _this = this;

        var currentValue = this.state.value;
        var menuItems = [],
            multipleOptions = [],
            mandatory = true;
        if (!this.props.attributes['mandatory'] || this.props.attributes['mandatory'] != "true") {
            mandatory = false;
            menuItems.push(React.createElement(MenuItem, { value: -1, primaryText: this.props.attributes['label'] + '...' }));
        }
        var choices = this.props.choices;

        choices.forEach(function (value, key) {
            menuItems.push(React.createElement(MenuItem, { value: key, primaryText: value }));
            multipleOptions.push({ value: key, label: value });
        });
        if (this.isDisplayGrid() && !this.state.editMode || this.props.disabled) {
            var value = this.state.value;
            if (choices.get(value)) value = choices.get(value);
            return React.createElement(
                'div',
                {
                    onClick: this.props.disabled ? function () {} : this.toggleEditMode,
                    className: value ? '' : 'paramValue-empty' },
                !value ? 'Empty' : value,
                '   ',
                React.createElement('span', { className: 'icon-caret-down' })
            );
        } else {
            var hasValue = false;
            if (this.props.multiple && this.props.multiple == true) {
                var currentValues = currentValue;
                if (typeof currentValue === "string") {
                    currentValues = currentValue.split(",");
                }
                hasValue = currentValues.length ? true : false;
                return React.createElement(
                    'span',
                    { className: "multiple has-value" },
                    React.createElement(
                        'div',
                        { style: { display: 'flex', flexWrap: 'wrap' } },
                        currentValues.map(function (v) {
                            return React.createElement(
                                Chip,
                                { onRequestDelete: function () {
                                        _this.onMultipleRemove(v);
                                    } },
                                v
                            );
                        })
                    ),
                    React.createElement(
                        SelectField,
                        {
                            value: -1,
                            onChange: this.onMultipleSelect,
                            fullWidth: true,
                            className: this.props.className
                        },
                        menuItems
                    )
                );
            } else {
                return React.createElement(
                    'span',
                    null,
                    React.createElement(
                        SelectField,
                        {
                            floatingLabelText: this.props.attributes.label,
                            value: currentValue,
                            onChange: this.onDropDownChange,
                            fullWidth: true,
                            className: this.props.className
                        },
                        menuItems
                    )
                );
            }
        }
    }
});

exports['default'] = InputSelectBox = _mixinsFieldWithChoices2['default'](InputSelectBox);
exports['default'] = InputSelectBox;
module.exports = exports['default'];

},{"../mixins/FieldWithChoices":16,"../mixins/FormMixin":17,"material-ui":"material-ui","pydio/util/lang":"pydio/util/lang","react":"react"}],9:[function(require,module,exports){
(function (global){
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

var _mixinsActionRunnerMixin = require('../mixins/ActionRunnerMixin');

var _mixinsActionRunnerMixin2 = _interopRequireDefault(_mixinsActionRunnerMixin);

var React = require('react');

exports['default'] = React.createClass({
    displayName: 'MonitoringLabel',

    mixins: [_mixinsActionRunnerMixin2['default']],

    getInitialState: function getInitialState() {
        var loadingMessage = 'Loading';
        if (this.context && this.context.getMessage) {
            loadingMessage = this.context.getMessage(466, '');
        } else if (global.pydio && global.pydio.MessageHash) {
            loadingMessage = global.pydio.MessageHash[466];
        }
        return { status: loadingMessage };
    },

    componentDidMount: function componentDidMount() {
        var callback = (function (transport) {
            this.setState({ status: transport.responseText });
        }).bind(this);
        this._poller = (function () {
            this.applyAction(callback);
        }).bind(this);
        this._poller();
        this._pe = global.setInterval(this._poller, 10000);
    },

    componentWillUnmount: function componentWillUnmount() {
        if (this._pe) {
            global.clearInterval(this._pe);
        }
    },

    render: function render() {
        return React.createElement(
            'div',
            null,
            this.state.status
        );
    }

});
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../mixins/ActionRunnerMixin":15,"react":"react"}],10:[function(require,module,exports){
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

var _materialUi = require('material-ui');

/**
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */

var React = require('react');
exports['default'] = React.createClass({
    displayName: 'TextField',

    mixins: [_mixinsFormMixin2['default']],

    render: function render() {
        if (this.isDisplayGrid() && !this.state.editMode) {
            var value = this.state.value;
            if (this.props.attributes['type'] === 'password' && value) {
                value = '***********';
            } else {
                value = this.state.value;
            }
            return React.createElement(
                'div',
                { onClick: this.props.disabled ? function () {} : this.toggleEditMode, className: value ? '' : 'paramValue-empty' },
                !value ? 'Empty' : value
            );
        } else {
            var field = React.createElement(_materialUi.TextField, {
                floatingLabelText: this.isDisplayForm() ? this.props.attributes.label : null,
                value: this.state.value || "",
                onChange: this.onChange,
                onKeyDown: this.enterToToggle,
                type: this.props.attributes['type'] === 'password' ? 'password' : null,
                multiLine: this.props.attributes['type'] === 'textarea',
                disabled: this.props.disabled,
                errorText: this.props.errorText,
                autoComplete: 'off',
                fullWidth: true
            });
            if (this.props.attributes['type'] === 'password') {
                return React.createElement(
                    'form',
                    { autoComplete: 'off', style: { display: 'inline' } },
                    field
                );
            } else {
                return React.createElement(
                    'span',
                    null,
                    field
                );
            }
        }
    }

});
module.exports = exports['default'];

},{"../mixins/FormMixin":17,"material-ui":"material-ui","react":"react"}],11:[function(require,module,exports){
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

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _materialUi = require('material-ui');

/**
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */

var React = require('react');
exports['default'] = React.createClass({
    displayName: 'ValidLogin',

    mixins: [_mixinsFormMixin2['default']],

    textValueChanged: function textValueChanged(event, value) {
        var err = _pydioUtilPass2['default'].isValidLogin(value);
        var prevStateValid = this.state.valid;
        var valid = !err;
        if (prevStateValid !== valid && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(valid);
        }
        this.setState({ valid: valid, err: err });

        this.onChange(event, value);
    },

    render: function render() {
        var _this = this;

        if (this.isDisplayGrid() && !this.state.editMode) {
            var value = this.state.value;
            if (this.props.attributes['type'] === 'password' && value) {
                value = '***********';
            } else {
                value = this.state.value;
            }
            return React.createElement(
                'div',
                { onClick: this.props.disabled ? function () {} : this.toggleEditMode, className: value ? '' : 'paramValue-empty' },
                !value ? 'Empty' : value
            );
        } else {
            var err = this.state.err;

            var field = React.createElement(_materialUi.TextField, {
                floatingLabelText: this.isDisplayForm() ? this.props.attributes.label : null,
                value: this.state.value || "",
                onChange: function (e, v) {
                    return _this.textValueChanged(e, v);
                },
                onKeyDown: this.enterToToggle,
                type: this.props.attributes['type'] === 'password' ? 'password' : null,
                multiLine: this.props.attributes['type'] === 'textarea',
                disabled: this.props.disabled,
                errorText: this.props.errorText || err,
                autoComplete: 'off',
                fullWidth: true
            });
            if (this.props.attributes['type'] === 'password') {
                return React.createElement(
                    'form',
                    { autoComplete: 'off', style: { display: 'inline' } },
                    field
                );
            } else {
                return React.createElement(
                    'span',
                    null,
                    field
                );
            }
        }
    }

});
module.exports = exports['default'];

},{"../mixins/FormMixin":17,"material-ui":"material-ui","pydio/util/pass":"pydio/util/pass","react":"react"}],12:[function(require,module,exports){
(function (global){
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

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var PassUtils = require('pydio/util/pass');
var React = require('react');

var _require = require('material-ui');

var TextField = _require.TextField;
exports['default'] = React.createClass({
    displayName: 'ValidPassword',

    mixins: [_mixinsFormMixin2['default']],

    isValid: function isValid() {
        return this.state.valid;
    },

    checkMinLength: function checkMinLength(value) {
        var minLength = parseInt(global.pydio.getPluginConfigs("core.auth").get("PASSWORD_MINLENGTH"));
        return !(value && value.length < minLength);
    },

    getMessage: function getMessage(messageId) {
        if (this.context && this.context.getMessage) {
            return this.context.getMessage(messageId, '');
        } else if (global.pydio && global.pydio.MessageHash) {
            return global.pydio.MessageHash[messageId];
        }
    },

    updatePassState: function updatePassState() {
        var prevStateValid = this.state.valid;
        var newState = PassUtils.getState(this.refs.pass.getValue(), this.refs.confirm ? this.refs.confirm.getValue() : '');
        this.setState(newState);
        if (prevStateValid !== newState.valid && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(newState.valid);
        }
    },

    onPasswordChange: function onPasswordChange(event) {
        this.updatePassState();
        this.onChange(event, event.target.value);
    },

    onConfirmChange: function onConfirmChange(event) {
        this.setState({ confirmValue: event.target.value });
        this.updatePassState();
        this.onChange(event, this.state.value);
    },

    render: function render() {
        if (this.isDisplayGrid() && !this.state.editMode) {
            var value = this.state.value;
            return React.createElement(
                'div',
                { onClick: this.props.disabled ? function () {} : this.toggleEditMode, className: value ? '' : 'paramValue-empty' },
                !value ? 'Empty' : value
            );
        } else {
            var overflow = { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' };
            var className = this.state.valid ? '' : 'mui-error-as-hint';
            if (this.props.className) {
                className = this.props.className + ' ' + className;
            }
            var _confirm = undefined;
            if (this.state.value && !this.props.disabled) {
                _confirm = [React.createElement('div', { key: 'sep', style: { width: 20 } }), React.createElement(TextField, {
                    key: 'confirm',
                    ref: 'confirm',
                    floatingLabelText: this.getMessage(199),
                    floatingLabelShrinkStyle: _extends({}, overflow, { width: '130%' }),
                    floatingLabelStyle: overflow,
                    className: className,
                    value: this.state.confirmValue,
                    onChange: this.onConfirmChange,
                    type: 'password',
                    multiLine: false,
                    disabled: this.props.disabled,
                    fullWidth: true,
                    style: { flex: 1 },
                    errorText: this.state.confirmErrorText
                })];
            }
            return React.createElement(
                'form',
                { autoComplete: 'off' },
                React.createElement(
                    'div',
                    { style: { display: 'flex', marginTop: -16 } },
                    React.createElement(TextField, {
                        ref: 'pass',
                        floatingLabelText: this.isDisplayForm() ? this.props.attributes.label : null,
                        floatingLabelShrinkStyle: _extends({}, overflow, { width: '130%' }),
                        floatingLabelStyle: overflow,
                        className: className,
                        value: this.state.value,
                        onChange: this.onPasswordChange,
                        onKeyDown: this.enterToToggle,
                        type: 'password',
                        multiLine: false,
                        disabled: this.props.disabled,
                        errorText: this.state.passErrorText,
                        fullWidth: true,
                        style: { flex: 1 }
                    }),
                    _confirm
                )
            );
        }
    }

});
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../mixins/FormMixin":17,"material-ui":"material-ui","pydio/util/pass":"pydio/util/pass","react":"react"}],13:[function(require,module,exports){
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

var _mixinsHelperMixin = require('./mixins/HelperMixin');

var _mixinsHelperMixin2 = _interopRequireDefault(_mixinsHelperMixin);

var _managerManager = require('./manager/Manager');

var _managerManager2 = _interopRequireDefault(_managerManager);

var _fieldsTextField = require('./fields/TextField');

var _fieldsTextField2 = _interopRequireDefault(_fieldsTextField);

var _fieldsValidPassword = require('./fields/ValidPassword');

var _fieldsValidPassword2 = _interopRequireDefault(_fieldsValidPassword);

var _fieldsInputInteger = require('./fields/InputInteger');

var _fieldsInputInteger2 = _interopRequireDefault(_fieldsInputInteger);

var _fieldsInputBoolean = require('./fields/InputBoolean');

var _fieldsInputBoolean2 = _interopRequireDefault(_fieldsInputBoolean);

var _fieldsInputButton = require('./fields/InputButton');

var _fieldsInputButton2 = _interopRequireDefault(_fieldsInputButton);

var _fieldsMonitoringLabel = require('./fields/MonitoringLabel');

var _fieldsMonitoringLabel2 = _interopRequireDefault(_fieldsMonitoringLabel);

var _fieldsInputSelectBox = require('./fields/InputSelectBox');

var _fieldsInputSelectBox2 = _interopRequireDefault(_fieldsInputSelectBox);

var _fieldsAutocompleteBox = require('./fields/AutocompleteBox');

var _fieldsAutocompleteBox2 = _interopRequireDefault(_fieldsAutocompleteBox);

var _fieldsInputImage = require('./fields/InputImage');

var _fieldsInputImage2 = _interopRequireDefault(_fieldsInputImage);

var _panelFormPanel = require('./panel/FormPanel');

var _panelFormPanel2 = _interopRequireDefault(_panelFormPanel);

var _panelFormHelper = require('./panel/FormHelper');

var _panelFormHelper2 = _interopRequireDefault(_panelFormHelper);

var _fieldsFileDropzone = require('./fields/FileDropzone');

var _fieldsFileDropzone2 = _interopRequireDefault(_fieldsFileDropzone);

var _fieldsAutocompleteTree = require('./fields/AutocompleteTree');

var _fieldsAutocompleteTree2 = _interopRequireDefault(_fieldsAutocompleteTree);

var PydioForm = {
  HelperMixin: _mixinsHelperMixin2['default'],
  Manager: _managerManager2['default'],
  InputText: _fieldsTextField2['default'],
  ValidPassword: _fieldsValidPassword2['default'],
  InputBoolean: _fieldsInputBoolean2['default'],
  InputInteger: _fieldsInputInteger2['default'],
  InputButton: _fieldsInputButton2['default'],
  MonitoringLabel: _fieldsMonitoringLabel2['default'],
  InputSelectBox: _fieldsInputSelectBox2['default'],
  AutocompleteBox: _fieldsAutocompleteBox2['default'],
  AutocompleteTree: _fieldsAutocompleteTree2['default'],
  InputImage: _fieldsInputImage2['default'],
  FormPanel: _panelFormPanel2['default'],
  PydioHelper: _panelFormHelper2['default'],
  FileDropZone: _fieldsFileDropzone2['default'],
  createFormElement: _managerManager2['default'].createFormElement
};

exports['default'] = PydioForm;
module.exports = exports['default'];

},{"./fields/AutocompleteBox":1,"./fields/AutocompleteTree":2,"./fields/FileDropzone":3,"./fields/InputBoolean":4,"./fields/InputButton":5,"./fields/InputImage":6,"./fields/InputInteger":7,"./fields/InputSelectBox":8,"./fields/MonitoringLabel":9,"./fields/TextField":10,"./fields/ValidPassword":12,"./manager/Manager":14,"./mixins/HelperMixin":18,"./panel/FormHelper":19,"./panel/FormPanel":20}],14:[function(require,module,exports){
(function (global){
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

var _fieldsValidLogin = require('../fields/ValidLogin');

var _fieldsValidLogin2 = _interopRequireDefault(_fieldsValidLogin);

var XMLUtils = require('pydio/util/xml');
var InputBoolean = require('./../fields/InputBoolean');
var InputText = require('./../fields/TextField');
var ValidPassword = require('./../fields/ValidPassword');
var InputInteger = require('./../fields/InputInteger');
var InputButton = require('./../fields/InputButton');
var MonitoringLabel = require('./../fields/MonitoringLabel');
var InputImage = require('./../fields/InputImage');
var SelectBox = require('./../fields/InputSelectBox');
var AutocompleteBox = require('./../fields/AutocompleteBox');
var AutocompleteTree = require('./../fields/AutocompleteTree');

/**
 * Utility class to parse / handle pydio standard form definitions/values.
 */

var Manager = (function () {
    function Manager() {
        _classCallCheck(this, Manager);
    }

    Manager.hasHelper = function hasHelper(pluginId, paramName) {

        var helpers = Manager.getHelpersCache();
        return helpers[pluginId] && helpers[pluginId]['parameters'][paramName];
    };

    Manager.getHelpersCache = function getHelpersCache() {
        if (!Manager.HELPERS_CACHE) {
            var helperCache = {};
            var helpers = XMLUtils.XPathSelectNodes(window.pydio.Registry.getXML(), 'plugins/*/client_settings/resources/js[@type="helper"]');
            for (var i = 0; i < helpers.length; i++) {
                var helperNode = helpers[i];
                var plugin = helperNode.getAttribute("plugin");
                helperCache[plugin] = { namespace: helperNode.getAttribute('className'), parameters: {} };
                var paramNodes = XMLUtils.XPathSelectNodes(helperNode, 'parameter');
                for (var k = 0; k < paramNodes.length; k++) {
                    var paramNode = paramNodes[k];
                    helperCache[plugin]['parameters'][paramNode.getAttribute('name')] = true;
                }
            }
            Manager.HELPERS_CACHE = helperCache;
        }
        return Manager.HELPERS_CACHE;
    };

    Manager.parseParameters = function parseParameters(xmlDocument, query) {
        return XMLUtils.XPathSelectNodes(xmlDocument, query).map((function (node) {
            return Manager.parameterNodeToHash(node);
        }).bind(this));
    };

    Manager.parameterNodeToHash = function parameterNodeToHash(paramNode) {
        var paramsAtts = paramNode.attributes;
        var paramsObject = {};
        if (paramNode.parentNode && paramNode.parentNode.parentNode && paramNode.parentNode.parentNode.getAttribute) {
            paramsObject["pluginId"] = paramNode.parentNode.parentNode.getAttribute("id");
        }
        var collectCdata = false;
        var MessageHash = global.pydio.MessageHash;

        for (var i = 0; i < paramsAtts.length; i++) {
            var attName = paramsAtts.item(i).nodeName;
            var value = paramsAtts.item(i).value;
            if ((attName === "label" || attName === "description" || attName === "group" || attName.indexOf("group_switch_") === 0) && MessageHash[value]) {
                value = MessageHash[value];
            }
            if (attName === "cdatavalue") {
                collectCdata = true;
                continue;
            }
            paramsObject[attName] = value;
        }
        if (collectCdata) {
            paramsObject['value'] = paramNode.firstChild.value;
        }
        if (paramsObject['type'] === 'boolean') {
            if (paramsObject['value'] !== undefined) {
                paramsObject['value'] = paramsObject['value'] === "true";
            }
            if (paramsObject['default'] !== undefined) {
                paramsObject['default'] = paramsObject['default'] === "true";
            }
        } else if (paramsObject['type'] === 'integer') {
            if (paramsObject['value'] !== undefined) {
                paramsObject['value'] = parseInt(paramsObject['value']);
            }
            if (paramsObject['default'] !== undefined) {
                paramsObject['default'] = parseInt(paramsObject['default']);
            }
        }
        return paramsObject;
    };

    Manager.createFormElement = function createFormElement(props) {
        var value = undefined;
        switch (props.attributes['type']) {
            case 'boolean':
                value = React.createElement(InputBoolean, props);
                break;
            case 'string':
            case 'textarea':
            case 'password':
                value = React.createElement(InputText, props);
                break;
            case 'valid-password':
                value = React.createElement(ValidPassword, props);
                break;
            case 'valid-login':
                value = React.createElement(_fieldsValidLogin2['default'], props);
                break;
            case 'integer':
                value = React.createElement(InputInteger, props);
                break;
            case 'button':
                value = React.createElement(InputButton, props);
                break;
            case 'monitor':
                value = React.createElement(MonitoringLabel, props);
                break;
            case 'image':
                value = React.createElement(InputImage, props);
                break;
            case 'select':
                value = React.createElement(SelectBox, props);
                break;
            case 'autocomplete':
                value = React.createElement(AutocompleteBox, props);
                break;
            case 'autocomplete-tree':
                value = React.createElement(AutocompleteTree, props);
                break;
            case 'legend':
                value = null;
                break;
            case 'hidden':
                value = null;
                break;
            default:
                if (props.value) {
                    value = props.value;
                } else {
                    value = React.createElement(
                        'span',
                        { className: 'paramValue-empty' },
                        'Empty'
                    );
                }
                break;
        }
        return value;
    };

    Manager.SlashesToJson = function SlashesToJson(values) {
        if (values === undefined || typeof values !== 'object') {
            return values;
        }
        var newValues = {};
        var recurseOnKeys = {};
        Object.keys(values).forEach(function (k) {
            var data = values[k];
            if (k.indexOf('/') > 0) {
                var parts = k.split('/');
                var firstPart = parts.shift();
                var lastPart = parts.join('/');
                if (!newValues[firstPart]) {
                    newValues[firstPart] = {};
                } else if (typeof newValues[firstPart] === 'string') {
                    newValues[firstPart] = { '@value': newValues[firstPart] };
                }
                newValues[firstPart][lastPart] = data;
                recurseOnKeys[firstPart] = firstPart;
            } else {
                if (newValues[k] && typeof newValues[k] === 'object') {
                    newValues[k]['@value'] = data;
                } else {
                    newValues[k] = data;
                }
            }
        });
        Object.keys(recurseOnKeys).map(function (key) {
            newValues[key] = Manager.SlashesToJson(newValues[key]);
        });
        return newValues;
    };

    Manager.JsonToSlashes = function JsonToSlashes(values) {
        var prefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        var newValues = {};
        Object.keys(values).forEach(function (k) {
            if (typeof values[k] === 'object') {
                var subValues = Manager.JsonToSlashes(values[k], prefix + k + '/');
                newValues = _extends({}, newValues, subValues);
                if (values[k]['@value']) {
                    newValues[prefix + k] = values[k]['@value'];
                }
            } else {
                newValues[prefix + k] = values[k];
            }
        });
        return newValues;
    };

    /**
     *
     * Extract POST-ready values from a combo parameters/values
     *
     * @param definitions Array Standard Form Definition array
     * @param values Object Key/Values of the current form
     * @param prefix String Optional prefix to add to all parameters (by default DRIVER_OPTION_).
     * @returns Object Object with all pydio-compatible POST parameters
     */

    Manager.getValuesForPOST = function getValuesForPOST(definitions, values) {
        var prefix = arguments.length <= 2 || arguments[2] === undefined ? 'DRIVER_OPTION_' : arguments[2];
        var additionalMetadata = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

        var clientParams = {};
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                clientParams[prefix + key] = values[key];
                var defType = null;
                for (var d = 0; d < definitions.length; d++) {
                    if (definitions[d]['name'] == key) {
                        defType = definitions[d]['type'];
                        break;
                    }
                }
                if (!defType) {

                    var parts = key.split('/');
                    var last, prev;
                    if (parts.length > 1) {
                        last = parts.pop();
                        prev = parts.pop();
                    }
                    for (var k = 0; k < definitions.length; k++) {
                        if (last !== undefined) {
                            if (definitions[k]['name'] == last && definitions[k]['group_switch_name'] && definitions[k]['group_switch_name'] == prev) {
                                defType = definitions[k]['type'];
                                break;
                            }
                        } else {
                            if (definitions[k]['name'] == key) {
                                defType = definitions[k]['type'];
                                break;
                            }
                        }
                    }
                }
                //definitions.map(function(d){if(d.name == theKey) defType = d.type});
                if (defType) {
                    if (defType == "image") defType = "binary";
                    clientParams[prefix + key + '_ajxptype'] = defType;
                }
                if (additionalMetadata && additionalMetadata[key]) {
                    for (var meta in additionalMetadata[key]) {
                        if (additionalMetadata[key].hasOwnProperty(meta)) {
                            clientParams[prefix + key + '_' + meta] = additionalMetadata[key][meta];
                        }
                    }
                }
            }
        }

        // Reorder tree keys
        var allKeys = Object.keys(clientParams);
        allKeys.sort();
        allKeys.reverse();
        var treeKeys = {};
        allKeys.map(function (key) {
            if (key.indexOf("/") === -1) return;
            if (key.endsWith("_ajxptype")) return;
            var typeKey = key + "_ajxptype";
            var parts = key.split("/");
            var parentName = parts.shift();
            var parentKey;
            while (parts.length > 0) {
                if (!parentKey) {
                    parentKey = treeKeys;
                }
                if (!parentKey[parentName]) {
                    parentKey[parentName] = {};
                }
                parentKey = parentKey[parentName];
                parentName = parts.shift();
            }
            var type = clientParams[typeKey];
            delete clientParams[typeKey];
            if (parentKey && !parentKey[parentName]) {
                if (type == "boolean") {
                    var v = clientParams[key];
                    parentKey[parentName] = v == "true" || v == 1 || v === true;
                } else if (type == "integer") {
                    parentKey[parentName] = parseInt(clientParams[key]);
                } else if (type && type.startsWith("group_switch:") && typeof clientParams[key] == "string") {
                    parentKey[parentName] = { group_switch_value: clientParams[key] };
                } else {
                    parentKey[parentName] = clientParams[key];
                }
            } else if (parentKey && type && type.startsWith('group_switch:')) {
                parentKey[parentName]["group_switch_value"] = clientParams[key];
            }
            delete clientParams[key];
        });
        for (key in treeKeys) {
            if (!treeKeys.hasOwnProperty(key)) continue;
            var treeValue = treeKeys[key];
            if (clientParams[key + '_ajxptype'] && clientParams[key + '_ajxptype'].indexOf('group_switch:') === 0 && !treeValue['group_switch_value']) {
                treeValue['group_switch_value'] = clientParams[key];
            }

            clientParams[key] = JSON.stringify(treeValue);
            clientParams[key + '_ajxptype'] = "text/json";
        }

        // Clean XXX_group_switch parameters
        for (var theKey in clientParams) {
            if (!clientParams.hasOwnProperty(theKey)) continue;

            if (theKey.indexOf("/") == -1 && clientParams[theKey] && clientParams[theKey + "_ajxptype"] && clientParams[theKey + "_ajxptype"].startsWith("group_switch:")) {
                if (typeof clientParams[theKey] == "string") {
                    clientParams[theKey] = JSON.stringify({ group_switch_value: clientParams[theKey] });
                    clientParams[theKey + "_ajxptype"] = "text/json";
                }
            }
            if (clientParams.hasOwnProperty(theKey)) {
                if (theKey.endsWith("_group_switch")) {
                    delete clientParams[theKey];
                }
            }
        }

        return clientParams;
    };

    return Manager;
})();

exports['default'] = Manager;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../fields/ValidLogin":11,"./../fields/AutocompleteBox":1,"./../fields/AutocompleteTree":2,"./../fields/InputBoolean":4,"./../fields/InputButton":5,"./../fields/InputImage":6,"./../fields/InputInteger":7,"./../fields/InputSelectBox":8,"./../fields/MonitoringLabel":9,"./../fields/TextField":10,"./../fields/ValidPassword":12,"pydio/util/xml":"pydio/util/xml"}],15:[function(require,module,exports){
(function (global){
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
var PathUtils = require('pydio/util/path');

exports['default'] = {

    propTypes: {
        attributes: React.PropTypes.object.isRequired,
        applyButtonAction: React.PropTypes.func,
        actionCallback: React.PropTypes.func
    },

    applyAction: function applyAction(callback) {
        var choicesValue = this.props.attributes['choices'].split(":");
        var firstPart = choicesValue.shift();
        if (firstPart === "run_client_action" && global.pydio) {
            global.pydio.getController().fireAction(choicesValue.shift());
            return;
        }
        if (this.props.applyButtonAction) {
            var parameters = { action: firstPart };
            if (choicesValue.length > 1) {
                parameters['action_plugin_id'] = choicesValue.shift();
                parameters['action_plugin_method'] = choicesValue.shift();
            }
            if (this.props.attributes['name'].indexOf("/") !== -1) {
                parameters['button_key'] = PathUtils.getDirname(this.props.attributes['name']);
            }
            this.props.applyButtonAction(parameters, callback);
        }
    }

};
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"pydio/util/path":"pydio/util/path","react":"react"}],16:[function(require,module,exports){
(function (global){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

exports['default'] = function (PydioComponent) {
    var FieldWithChoices = (function (_Component) {
        _inherits(FieldWithChoices, _Component);

        FieldWithChoices.prototype.loadExternalValues = function loadExternalValues(choices) {
            var _this = this;

            var pydio = this.props.pydio;

            var parsed = true;

            var list_action = undefined;
            if (choices instanceof Map) {
                if (this.onChoicesLoaded) this.onChoicesLoaded(choices);
                return { choices: choices, parsed: parsed };
            }

            var output = new Map();
            if (choices.indexOf('json_file:') === 0) {
                parsed = false;
                list_action = choices.replace('json_file:', '');
                output.set('0', pydio.MessageHash['ajxp_admin.home.6']);
                PydioApi.getClient().loadFile(list_action, function (transport) {
                    var newOutput = new Map();
                    if (transport.responseJSON) {
                        transport.responseJSON.forEach(function (entry) {
                            newOutput.set(entry.key, entry.label);
                        });
                    } else if (transport.responseText) {
                        try {
                            JSON.parse(transport.responseText).forEach(function (entry) {
                                newOutput.set(entry.key, entry.label);
                            });
                        } catch (e) {
                            console.log('Error while parsing list ' + choices, e);
                        }
                    }
                    _this.setState({ choices: newOutput }, function () {
                        if (_this.onChoicesLoaded) {
                            _this.onChoicesLoaded(newOutput);
                        }
                    });
                });
            } else if (choices === "PYDIO_AVAILABLE_LANGUAGES") {
                pydio.listLanguagesWithCallback(function (key, label) {
                    output.set(key, label);
                });
                if (this.onChoicesLoaded) this.onChoicesLoaded(output);
            } else if (choices === "PYDIO_AVAILABLE_REPOSITORIES") {
                if (pydio.user) {
                    pydio.user.repositories.forEach(function (repository) {
                        if (repository.getRepositoryType() !== "cell") {
                            output.set(repository.getId(), repository.getLabel());
                        }
                    });
                }
                if (this.onChoicesLoaded) this.onChoicesLoaded(output);
            } else {
                // Parse string and return map
                choices.split(",").map(function (choice) {
                    var label = undefined,
                        value = undefined;
                    var l = choice.split('|');
                    if (l.length > 1) {
                        value = l[0];
                        label = l[1];
                    } else {
                        value = label = choice;
                    }
                    if (global.pydio.MessageHash[label]) label = global.pydio.MessageHash[label];
                    output.set(value, label);
                });
            }
            return { choices: output, parsed: parsed };
        };

        function FieldWithChoices(props, context) {
            _classCallCheck(this, FieldWithChoices);

            _Component.call(this, props, context);
            var choices = new Map();
            choices.set('0', this.props.pydio ? this.props.pydio.MessageHash['ajxp_admin.home.6'] : ' ... ');
            this.state = { choices: choices, choicesParsed: false };
        }

        FieldWithChoices.prototype.componentDidMount = function componentDidMount() {
            if (this.props.attributes['choices']) {
                var _loadExternalValues = this.loadExternalValues(this.props.attributes['choices']);

                var choices = _loadExternalValues.choices;
                var parsed = _loadExternalValues.parsed;

                this.setState({ choices: choices, choicesParsed: parsed });
            }
        };

        FieldWithChoices.prototype.componentWillReceiveProps = function componentWillReceiveProps(newProps) {
            if (newProps.attributes['choices'] && newProps.attributes['choices'] !== this.props.attributes['choices']) {
                var _loadExternalValues2 = this.loadExternalValues(newProps.attributes['choices']);

                var choices = _loadExternalValues2.choices;
                var parsed = _loadExternalValues2.parsed;

                this.setState({
                    choices: choices,
                    choicesParsed: parsed
                });
            }
        };

        FieldWithChoices.prototype.render = function render() {
            return React.createElement(PydioComponent, _extends({}, this.props, this.state));
        };

        return FieldWithChoices;
    })(Component);

    FieldWithChoices = PydioContextConsumer(FieldWithChoices);

    return FieldWithChoices;
};

module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"pydio":"pydio","react":"react"}],17:[function(require,module,exports){
(function (global){
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
var PydioApi = require('pydio/http/api');
/**
 * React Mixin for Form Element
 */
exports['default'] = {

    propTypes: {
        attributes: React.PropTypes.object.isRequired,
        name: React.PropTypes.string.isRequired,

        displayContext: React.PropTypes.oneOf(['form', 'grid']),
        disabled: React.PropTypes.bool,
        multiple: React.PropTypes.bool,
        value: React.PropTypes.any,
        onChange: React.PropTypes.func,
        onChangeEditMode: React.PropTypes.func,
        binary_context: React.PropTypes.string,
        errorText: React.PropTypes.string
    },

    getDefaultProps: function getDefaultProps() {
        return {
            displayContext: 'form',
            disabled: false
        };
    },

    isDisplayGrid: function isDisplayGrid() {
        return this.props.displayContext == 'grid';
    },

    isDisplayForm: function isDisplayForm() {
        return this.props.displayContext == 'form';
    },

    toggleEditMode: function toggleEditMode() {
        if (this.isDisplayForm()) return;
        var newState = !this.state.editMode;
        this.setState({ editMode: newState });
        if (this.props.onChangeEditMode) {
            this.props.onChangeEditMode(newState);
        }
    },

    enterToToggle: function enterToToggle(event) {
        if (event.key == 'Enter') {
            this.toggleEditMode();
        }
    },

    bufferChanges: function bufferChanges(newValue, oldValue) {
        this.triggerPropsOnChange(newValue, oldValue);
    },

    onChange: function onChange(event, value) {
        if (value === undefined) {
            value = event.currentTarget.getValue ? event.currentTarget.getValue() : event.currentTarget.value;
        }
        if (this.changeTimeout) {
            global.clearTimeout(this.changeTimeout);
        }
        var newValue = value,
            oldValue = this.state.value;
        if (this.props.skipBufferChanges) {
            this.triggerPropsOnChange(newValue, oldValue);
        }
        this.setState({
            dirty: true,
            value: newValue
        });
        if (!this.props.skipBufferChanges) {
            var timerLength = 250;
            if (this.props.attributes['type'] === 'password') {
                timerLength = 1200;
            }
            this.changeTimeout = global.setTimeout((function () {
                this.bufferChanges(newValue, oldValue);
            }).bind(this), timerLength);
        }
    },

    triggerPropsOnChange: function triggerPropsOnChange(newValue, oldValue) {
        if (this.props.attributes['type'] === 'password') {
            this.toggleEditMode();
            this.props.onChange(newValue, oldValue, { type: this.props.attributes['type'] });
        } else {
            this.props.onChange(newValue, oldValue);
        }
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.setState({
            value: newProps.value,
            dirty: false
        });
    },

    getInitialState: function getInitialState() {
        return {
            editMode: false,
            dirty: false,
            value: this.props.value
        };
    }

};
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"pydio/http/api":"pydio/http/api","react":"react"}],18:[function(require,module,exports){
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
/**
 * React Mixin for the form helper : default properties that
 * helpers can receive
 */
exports['default'] = {
  propTypes: {
    paramName: React.PropTypes.string,
    paramAttributes: React.PropTypes.object,
    values: React.PropTypes.object,
    updateCallback: React.PropTypes.func
  }
};
module.exports = exports['default'];

},{"react":"react"}],19:[function(require,module,exports){
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

var _managerManager = require('../manager/Manager');

var _managerManager2 = _interopRequireDefault(_managerManager);

var React = require('react');

var _require$requireLib = require('pydio').requireLib('boot');

var AsyncComponent = _require$requireLib.AsyncComponent;

/**
 * Display a form companion linked to a given input.
 * Props: helperData : contains the pluginId and the whole paramAttributes
 */
exports['default'] = React.createClass({
    displayName: 'FormHelper',

    propTypes: {
        helperData: React.PropTypes.object,
        close: React.PropTypes.func.isRequired
    },

    closeHelper: function closeHelper() {
        this.props.close();
    },

    render: function render() {
        var helper = undefined;
        if (this.props.helperData) {
            var helpersCache = _managerManager2['default'].getHelpersCache();
            var pluginHelperNamespace = helpersCache[this.props.helperData['pluginId']]['namespace'];
            helper = React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'helper-title' },
                    React.createElement('span', { className: 'helper-close mdi mdi-close', onClick: this.closeHelper }),
                    'Pydio Companion'
                ),
                React.createElement(
                    'div',
                    { className: 'helper-content' },
                    React.createElement(AsyncComponent, _extends({}, this.props.helperData, {
                        namespace: pluginHelperNamespace,
                        componentName: 'Helper',
                        paramName: this.props.helperData['paramAttributes']['name']
                    }))
                )
            );
        }
        return React.createElement(
            'div',
            { className: 'pydio-form-helper' + (helper ? ' helper-visible' : ' helper-empty'), style: { zIndex: 1 } },
            helper
        );
    }

});
module.exports = exports['default'];

},{"../manager/Manager":14,"pydio":"pydio","react":"react"}],20:[function(require,module,exports){
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

var _GroupSwitchPanel = require('./GroupSwitchPanel');

var _GroupSwitchPanel2 = _interopRequireDefault(_GroupSwitchPanel);

var _ReplicationPanel = require('./ReplicationPanel');

var _ReplicationPanel2 = _interopRequireDefault(_ReplicationPanel);

var _managerManager = require('../manager/Manager');

var _managerManager2 = _interopRequireDefault(_managerManager);

/**
 * Form Panel is a ready to use form builder inherited for Pydio's legacy parameters formats ('standard form').
 * It is very versatile and can basically take a set of parameters defined in the XML manifests (or defined manually
 * in JS) and display them as a user form.
 * It is a controlled component: it takes a {values} object and triggers back an onChange() function.
 *
 * See also Manager class to get some utilitary functions to parse parameters and extract values for the form.
 */
var React = require('react');
var ReactMUI = require('material-ui-legacy');
var LangUtils = require('pydio/util/lang');
var PydioApi = require('pydio/http/api');

var _require = require('material-ui');

var Tabs = _require.Tabs;
var Tab = _require.Tab;
var Paper = _require.Paper;
exports['default'] = React.createClass({
    displayName: 'FormPanel',

    _hiddenValues: {},
    _internalValid: null,
    _parametersMetadata: null,

    propTypes: {
        /**
         * Array of Pydio StandardForm parameters
         */
        parameters: React.PropTypes.array.isRequired,
        /**
         * Object containing values for the parameters
         */
        values: React.PropTypes.object,
        /**
         * Trigger unitary function when one form input changes.
         */
        onParameterChange: React.PropTypes.func,
        /**
         * Send all form values onchange, including eventually the removed ones (for dynamic panels)
         */
        onChange: React.PropTypes.func,
        /**
         * Triggered when the form globabally switches between valid and invalid state
         * Triggered once at form construction
         */
        onValidStatusChange: React.PropTypes.func,
        /**
         * Disable the whole form at once
         */
        disabled: React.PropTypes.bool,
        /**
         * String added to the image inputs for upload/download operations
         */
        binary_context: React.PropTypes.string,
        /**
         * 0 by default, subforms will have their zDepth value increased by one
         */
        depth: React.PropTypes.number,

        /**
         * Add an additional header component (added inside first subpanel)
         */
        header: React.PropTypes.object,
        /**
         * Add an additional footer component (added inside last subpanel)
         */
        footer: React.PropTypes.object,
        /**
         * Add other arbitrary panels, either at the top or the bottom
         */
        additionalPanes: React.PropTypes.shape({
            top: React.PropTypes.array,
            bottom: React.PropTypes.array
        }),
        /**
         * An array of tabs containing groupNames. Groups will be splitted
         * accross those tabs
         */
        tabs: React.PropTypes.array,
        /**
         * Fired when a the active tab changes
         */
        onTabChange: React.PropTypes.func,
        /**
         * A bit like tabs, but using accordion-like layout
         */
        accordionizeIfGroupsMoreThan: React.PropTypes.number,
        /**
         * Forward an event when scrolling the form
         */
        onScrollCallback: React.PropTypes.func,
        /**
         * Restrict to a subset of field groups
         */
        limitToGroups: React.PropTypes.array,
        /**
         * Ignore some specific fields types
         */
        skipFieldsTypes: React.PropTypes.array,

        /* Helper Options */
        /**
         * Pass pointers to the Pydio Companion container
         */
        setHelperData: React.PropTypes.func,
        /**
         * Function to check if the companion is active or none and if a parameter
         * has helper data
         */
        checkHasHelper: React.PropTypes.func,
        /**
         * Test for parameter
         */
        helperTestFor: React.PropTypes.string

    },

    externallySelectTab: function externallySelectTab(index) {
        this.setState({ tabSelectedIndex: index });
    },

    getInitialState: function getInitialState() {
        if (this.props.onTabChange) return { tabSelectedIndex: 0 };
        return {};
    },

    getDefaultProps: function getDefaultProps() {
        return { depth: 0, values: {} };
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        if (JSON.stringify(newProps.parameters) !== JSON.stringify(this.props.parameters)) {
            this._internalValid = null;
            this._hiddenValues = {};
            this._parametersMetadata = {};
        }
        if (newProps.values && newProps.values !== this.props.values) {
            this.checkValidStatus(newProps.values);
        }
    },

    getValues: function getValues() {
        return this.props.values; //LangUtils.mergeObjectsRecursive(this._hiddenValues, this.props.values);
    },

    onParameterChange: function onParameterChange(paramName, newValue, oldValue) {
        var additionalFormData = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

        // Update writeValues
        var newValues = LangUtils.deepCopy(this.getValues());
        if (this.props.onParameterChange) {
            this.props.onParameterChange(paramName, newValue, oldValue, additionalFormData);
        }
        if (additionalFormData) {
            if (!this._parametersMetadata) this._parametersMetadata = {};
            this._parametersMetadata[paramName] = additionalFormData;
        }
        newValues[paramName] = newValue;
        var dirty = true;
        this.onChange(newValues, dirty);
    },

    onChange: function onChange(newValues, dirty, removeValues) {
        if (this.props.onChange) {
            //newValues = LangUtils.mergeObjectsRecursive(this._hiddenValues, newValues);
            for (var key in this._hiddenValues) {
                if (this._hiddenValues.hasOwnProperty(key) && newValues[key] === undefined && (!removeValues || removeValues[key] == undefined)) {
                    newValues[key] = this._hiddenValues[key];
                }
            }
            this.props.onChange(newValues, dirty, removeValues);
        }
        this.checkValidStatus(newValues);
    },

    onSubformChange: function onSubformChange(newValues, dirty, removeValues) {
        var values = LangUtils.mergeObjectsRecursive(this.getValues(), newValues);
        if (removeValues) {
            for (var k in removeValues) {
                if (removeValues.hasOwnProperty(k) && values[k] !== undefined) {
                    delete values[k];
                    if (this._hiddenValues[k] !== undefined) {
                        delete this._hiddenValues[k];
                    }
                }
            }
        }
        this.onChange(values, dirty, removeValues);
    },

    onSubformValidStatusChange: function onSubformValidStatusChange(newValidValue, failedMandatories) {
        if ((newValidValue !== this._internalValid || this.props.forceValidStatusCheck) && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(newValidValue, failedMandatories);
        }
        this._internalValid = newValidValue;
    },

    applyButtonAction: function applyButtonAction(parameters, callback) {
        if (this.props.applyButtonAction) {
            this.props.applyButtonAction(parameters, callback);
            return;
        }
        parameters = LangUtils.mergeObjectsRecursive(parameters, this.getValuesForPOST(this.getValues()));
        PydioApi.getClient().request(parameters, callback);
    },

    getValuesForPOST: function getValuesForPOST(values) {
        var prefix = arguments.length <= 1 || arguments[1] === undefined ? 'DRIVER_OPTION_' : arguments[1];

        return _managerManager2['default'].getValuesForPOST(this.props.parameters, values, prefix, this._parametersMetadata);
    },

    checkValidStatus: function checkValidStatus(values) {
        var failedMandatories = [];
        this.props.parameters.map((function (p) {
            if (['string', 'textarea', 'password', 'integer'].indexOf(p.type) > -1 && (p.mandatory == "true" || p.mandatory === true)) {
                if (!values || !values.hasOwnProperty(p.name) || values[p.name] === undefined || values[p.name] === "") {
                    failedMandatories.push(p);
                }
            }
            if (p.type === 'valid-password' && this.refs['form-element-' + p.name]) {
                if (!this.refs['form-element-' + p.name].isValid()) {
                    failedMandatories.push(p);
                }
            }
        }).bind(this));
        var previousValue, newValue;
        previousValue = this._internalValid; //(this._internalValid !== undefined ? this._internalValid : true);
        newValue = failedMandatories.length ? false : true;
        if ((newValue !== this._internalValid || this.props.forceValidStatusCheck) && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(newValue, failedMandatories);
        }
        this._internalValid = newValue;
    },

    componentDidMount: function componentDidMount() {
        this.checkValidStatus(this.props.values);
    },

    renderGroupHeader: function renderGroupHeader(groupLabel, accordionize, index, active) {

        var properties = { key: 'group-' + groupLabel };
        if (accordionize) {
            var current = this.state && this.state.currentActiveGroup ? this.state.currentActiveGroup : null;
            properties['className'] = 'group-label-' + (active ? 'active' : 'inactive');
            properties['onClick'] = (function () {
                this.setState({ currentActiveGroup: current != index ? index : null });
            }).bind(this);
            groupLabel = [React.createElement('span', { key: 'toggler', className: "group-active-toggler icon-angle-" + (current == index ? 'down' : 'right') }), groupLabel];
        }

        return React.createElement('h' + (3 + this.props.depth), properties, groupLabel);
    },

    render: function render() {
        var _this = this;

        var allGroups = [];
        var values = this.getValues();
        var groupsOrdered = ['__DEFAULT__'];
        allGroups['__DEFAULT__'] = { FIELDS: [] };
        var replicationGroups = {};

        this.props.parameters.map((function (attributes) {

            var type = attributes['type'];
            if (this.props.skipFieldsTypes && this.props.skipFieldsTypes.indexOf(type) > -1) {
                return;
            }
            var paramName = attributes['name'];
            var field;
            if (attributes['group_switch_name']) return;

            var group = attributes['group'] || '__DEFAULT__';
            if (!allGroups[group]) {
                groupsOrdered.push(group);
                allGroups[group] = { FIELDS: [], LABEL: group };
            }

            var repGroup = attributes['replicationGroup'];
            if (repGroup) {

                if (!replicationGroups[repGroup]) {
                    replicationGroups[repGroup] = {
                        PARAMS: [],
                        GROUP: group,
                        POSITION: allGroups[group].FIELDS.length
                    };
                    allGroups[group].FIELDS.push('REPLICATION:' + repGroup);
                }
                // Copy
                var repAttr = LangUtils.deepCopy(attributes);
                delete repAttr['replicationGroup'];
                delete repAttr['group'];
                replicationGroups[repGroup].PARAMS.push(repAttr);
            } else {

                if (type.indexOf("group_switch:") === 0) {

                    field = React.createElement(_GroupSwitchPanel2['default'], _extends({}, this.props, {
                        onChange: this.onSubformChange,
                        paramAttributes: attributes,
                        parameters: this.props.parameters,
                        values: this.props.values,
                        key: paramName,
                        onScrollCallback: null,
                        limitToGroups: null,
                        onValidStatusChange: this.onSubformValidStatusChange
                    }));
                } else if (attributes['type'] !== 'hidden') {

                    var helperMark;
                    if (this.props.setHelperData && this.props.checkHasHelper && this.props.checkHasHelper(attributes['name'], this.props.helperTestFor)) {
                        var showHelper = (function () {
                            this.props.setHelperData({
                                paramAttributes: attributes,
                                values: values,
                                postValues: this.getValuesForPOST(values),
                                applyButtonAction: this.applyButtonAction
                            }, this.props.helperTestFor);
                        }).bind(this);
                        helperMark = React.createElement('span', { className: 'icon-question-sign', onClick: showHelper });
                    }
                    var mandatoryMissing = false;
                    var classLegend = "form-legend";
                    if (attributes['errorText']) {
                        classLegend = "form-legend mandatory-missing";
                    } else if (attributes['warningText']) {
                        classLegend = "form-legend warning-message";
                    } else if (attributes['mandatory'] && (attributes['mandatory'] === "true" || attributes['mandatory'] === true)) {
                        if (['string', 'textarea', 'image', 'integer'].indexOf(attributes['type']) !== -1 && !values[paramName]) {
                            mandatoryMissing = true;
                            classLegend = "form-legend mandatory-missing";
                        }
                    }

                    var props = {
                        ref: "form-element-" + paramName,
                        attributes: attributes,
                        name: paramName,
                        value: values[paramName],
                        onChange: (function (newValue, oldValue, additionalFormData) {
                            this.onParameterChange(paramName, newValue, oldValue, additionalFormData);
                        }).bind(this),
                        disabled: this.props.disabled || attributes['readonly'],
                        multiple: attributes['multiple'],
                        binary_context: this.props.binary_context,
                        displayContext: 'form',
                        applyButtonAction: this.applyButtonAction,
                        errorText: mandatoryMissing ? pydio.MessageHash['621'] : attributes.errorText ? attributes.errorText : null
                    };

                    field = React.createElement(
                        'div',
                        { key: paramName, className: 'form-entry-' + attributes['type'] },
                        _managerManager2['default'].createFormElement(props),
                        React.createElement(
                            'div',
                            { className: classLegend },
                            attributes['warningText'] ? attributes['warningText'] : attributes['description'],
                            ' ',
                            helperMark
                        )
                    );
                } else {

                    this._hiddenValues[paramName] = values[paramName] !== undefined ? values[paramName] : attributes['default'];
                }

                if (field) {
                    allGroups[group].FIELDS.push(field);
                }
            }
        }).bind(this));

        for (var rGroup in replicationGroups) {
            if (!replicationGroups.hasOwnProperty(rGroup)) continue;
            var rGroupData = replicationGroups[rGroup];
            allGroups[rGroupData.GROUP].FIELDS[rGroupData.POSITION] = React.createElement(_ReplicationPanel2['default'], _extends({}, this.props, {
                key: "replication-group-" + rGroupData.PARAMS[0].name,
                onChange: this.onSubformChange,
                onParameterChange: null,
                values: this.getValues(),
                depth: this.props.depth + 1,
                parameters: rGroupData.PARAMS,
                applyButtonAction: this.applyButtonAction,
                onScrollCallback: null
            }));
        }

        var groupPanes = [];
        var accordionize = this.props.accordionizeIfGroupsMoreThan && groupsOrdered.length > this.props.accordionizeIfGroupsMoreThan;
        var currentActiveGroup = this.state && this.state.currentActiveGroup ? this.state.currentActiveGroup : 0;
        groupsOrdered.map((function (g, gIndex) {
            if (this.props.limitToGroups && this.props.limitToGroups.indexOf(g) === -1) {
                return;
            }
            var header,
                gData = allGroups[g];
            var className = 'pydio-form-group',
                active = false;
            if (accordionize) {
                active = currentActiveGroup == gIndex;
                if (gIndex == currentActiveGroup) className += ' form-group-active';else className += ' form-group-inactive';
            }
            if (!gData.FIELDS.length) return;
            if (gData.LABEL && !(this.props.skipFieldsTypes && this.props.skipFieldsTypes.indexOf('GroupHeader') > -1)) {
                header = this.renderGroupHeader(gData.LABEL, accordionize, gIndex, active);
            }
            if (this.props.depth == 0) {
                className += ' z-depth-1';
                groupPanes.push(React.createElement(
                    Paper,
                    { className: className, key: 'pane-' + g },
                    gIndex == 0 && this.props.header ? this.props.header : null,
                    header,
                    React.createElement(
                        'div',
                        null,
                        gData.FIELDS
                    ),
                    gIndex == groupsOrdered.length - 1 && this.props.footer ? this.props.footer : null
                ));
            } else {
                groupPanes.push(React.createElement(
                    'div',
                    { className: className, key: 'pane-' + g },
                    gIndex == 0 && this.props.header ? this.props.header : null,
                    header,
                    React.createElement(
                        'div',
                        null,
                        gData.FIELDS
                    ),
                    gIndex == groupsOrdered.length - 1 && this.props.footer ? this.props.footer : null
                ));
            }
        }).bind(this));
        if (this.props.additionalPanes) {
            (function () {
                var otherPanes = { top: [], bottom: [] };
                var depth = _this.props.depth;
                var index = 0;

                var _loop = function (k) {
                    if (!otherPanes.hasOwnProperty(k)) return 'continue';
                    if (_this.props.additionalPanes[k]) {
                        _this.props.additionalPanes[k].map(function (p) {
                            if (depth == 0) {
                                otherPanes[k].push(React.createElement(
                                    Paper,
                                    { className: 'pydio-form-group additional', key: 'other-pane-' + index },
                                    p
                                ));
                            } else {
                                otherPanes[k].push(React.createElement(
                                    'div',
                                    { className: 'pydio-form-group additional', key: 'other-pane-' + index },
                                    p
                                ));
                            }
                            index++;
                        });
                    }
                };

                for (var k in otherPanes) {
                    var _ret2 = _loop(k);

                    if (_ret2 === 'continue') continue;
                }
                groupPanes = otherPanes['top'].concat(groupPanes).concat(otherPanes['bottom']);
            })();
        }

        if (this.props.tabs) {
            var _ret3 = (function () {
                var className = _this.props.className;
                var initialSelectedIndex = 0;
                var i = 0;
                var tabs = _this.props.tabs.map((function (tDef) {
                    var label = tDef['label'];
                    var groups = tDef['groups'];
                    if (tDef['selected']) {
                        initialSelectedIndex = i;
                    }
                    var panes = groups.map(function (gId) {
                        if (groupPanes[gId]) {
                            return groupPanes[gId];
                        } else {
                            return null;
                        }
                    });
                    i++;
                    return React.createElement(
                        Tab,
                        { label: label,
                            key: label,
                            value: this.props.onTabChange ? i - 1 : undefined },
                        React.createElement(
                            'div',
                            { className: (className ? className + ' ' : ' ') + 'pydio-form-panel' + (panes.length % 2 ? ' form-panel-odd' : '') },
                            panes
                        )
                    );
                }).bind(_this));
                if (_this.state.tabSelectedIndex !== undefined) {
                    initialSelectedIndex = _this.state.tabSelectedIndex;
                }
                return {
                    v: React.createElement(
                        'div',
                        { className: 'layout-fill vertical-layout tab-vertical-layout' },
                        React.createElement(
                            Tabs,
                            { ref: 'tabs',
                                initialSelectedIndex: initialSelectedIndex,
                                value: _this.props.onTabChange ? initialSelectedIndex : undefined,
                                onChange: _this.props.onTabChange ? function (i) {
                                    _this.setState({ tabSelectedIndex: i });_this.props.onTabChange(i);
                                } : undefined,
                                style: { flex: 1, display: 'flex', flexDirection: 'column' },
                                contentContainerStyle: { flex: 1, overflowY: 'auto' }
                            },
                            tabs
                        )
                    )
                };
            })();

            if (typeof _ret3 === 'object') return _ret3.v;
        } else {
            return React.createElement(
                'div',
                { className: (this.props.className ? this.props.className + ' ' : ' ') + 'pydio-form-panel' + (groupPanes.length % 2 ? ' form-panel-odd' : ''), onScroll: this.props.onScrollCallback },
                groupPanes
            );
        }
    }

});
module.exports = exports['default'];

},{"../manager/Manager":14,"./GroupSwitchPanel":21,"./ReplicationPanel":23,"material-ui":"material-ui","material-ui-legacy":"material-ui-legacy","pydio/http/api":"pydio/http/api","pydio/util/lang":"pydio/util/lang","react":"react"}],21:[function(require,module,exports){
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

var _FormPanel = require('./FormPanel');

var _FormPanel2 = _interopRequireDefault(_FormPanel);

var _fieldsInputSelectBox = require('../fields/InputSelectBox');

var _fieldsInputSelectBox2 = _interopRequireDefault(_fieldsInputSelectBox);

var React = require('react');

var LangUtils = require('pydio/util/lang');

/**
 * Sub form with a selector, switching its fields depending
 * on the selector value.
 */
exports['default'] = React.createClass({
    displayName: 'GroupSwitchPanel',

    propTypes: {
        paramAttributes: React.PropTypes.object.isRequired,
        parameters: React.PropTypes.array.isRequired,
        values: React.PropTypes.object.isRequired,
        onChange: React.PropTypes.func.isRequired
    },

    computeSubPanelParameters: function computeSubPanelParameters() {

        // CREATE SUB FORM PANEL
        // Get all values
        var switchName = this.props.paramAttributes['type'].split(":").pop();
        var parentName = this.props.paramAttributes['name'];
        var switchValues = {},
            potentialSubSwitches = [];

        this.props.parameters.map((function (p) {
            "use strict";
            if (!p['group_switch_name']) return;
            if (p['group_switch_name'] != switchName) {
                potentialSubSwitches.push(p);
                return;
            }
            var crtSwitch = p['group_switch_value'];
            if (!switchValues[crtSwitch]) {
                switchValues[crtSwitch] = {
                    label: p['group_switch_label'],
                    fields: [],
                    values: {},
                    fieldsKeys: {}
                };
            }
            p = LangUtils.deepCopy(p);
            delete p['group_switch_name'];
            p['name'] = parentName + '/' + p['name'];
            var vKey = p['name'];
            var paramName = vKey;
            if (switchValues[crtSwitch].fieldsKeys[paramName]) {
                return;
            }
            switchValues[crtSwitch].fields.push(p);
            switchValues[crtSwitch].fieldsKeys[paramName] = paramName;
            if (this.props.values && this.props.values[vKey]) {
                switchValues[crtSwitch].values[paramName] = this.props.values[vKey];
            }
        }).bind(this));
        // Remerge potentialSubSwitches to each parameters set
        for (var k in switchValues) {
            if (switchValues.hasOwnProperty(k)) {
                var sv = switchValues[k];
                sv.fields = sv.fields.concat(potentialSubSwitches);
            }
        }

        return switchValues;
    },

    clearSubParametersValues: function clearSubParametersValues(parentName, newValue, newFields) {
        var vals = LangUtils.deepCopy(this.props.values);
        var toRemove = {};
        for (var key in vals) {
            if (vals.hasOwnProperty(key) && key.indexOf(parentName + '/') === 0) {
                toRemove[key] = '';
            }
        }
        vals[parentName] = newValue;

        newFields.map(function (p) {
            if (p.type == 'hidden' && p['default'] && !p['group_switch_name'] || p['group_switch_name'] == parentName) {
                vals[p['name']] = p['default'];
                if (toRemove[p['name']] !== undefined) delete toRemove[p['name']];
            } else if (p['name'].indexOf(parentName + '/') === 0 && p['default']) {
                if (p['type'] && p['type'].startsWith('group_switch:')) {
                    //vals[p['name']] = {group_switch_value:p['default']};
                    vals[p['name']] = p['default'];
                } else {
                    vals[p['name']] = p['default'];
                }
            }
        });
        this.props.onChange(vals, true, toRemove);
        //this.onParameterChange(parentName, newValue);
    },

    onChange: function onChange(newValues, dirty, removeValues) {
        this.props.onChange(newValues, true, removeValues);
    },

    render: function render() {
        var attributes = this.props.paramAttributes;
        var values = this.props.values;

        var paramName = attributes['name'];
        var switchValues = this.computeSubPanelParameters(attributes);
        var selectorValues = new Map();
        Object.keys(switchValues).map(function (k) {
            selectorValues.set(k, switchValues[k].label);
        });
        var selectorChanger = (function (newValue) {
            this.clearSubParametersValues(paramName, newValue, switchValues[newValue] ? switchValues[newValue].fields : []);
        }).bind(this);
        var subForm = undefined,
            selectorLegend = undefined,
            subFormHeader = undefined;
        var selector = React.createElement(_fieldsInputSelectBox2['default'], {
            key: paramName,
            name: paramName,
            className: 'group-switch-selector',
            attributes: {
                name: paramName,
                choices: selectorValues,
                label: attributes['label'],
                mandatory: attributes['mandatory']
            },
            value: values[paramName],
            onChange: selectorChanger,
            displayContext: 'form',
            disabled: this.props.disabled,
            ref: 'subFormSelector'
        });

        var helperMark = undefined;
        if (this.props.setHelperData && this.props.checkHasHelper && this.props.checkHasHelper(attributes['name'], this.props.helperTestFor)) {
            var showHelper = (function () {
                this.props.setHelperData({ paramAttributes: attributes, values: values });
            }).bind(this);
            helperMark = React.createElement('span', { className: 'icon-question-sign', onClick: showHelper });
        }

        selectorLegend = React.createElement(
            'div',
            { className: 'form-legend' },
            attributes['description'],
            ' ',
            helperMark
        );
        if (values[paramName] && switchValues[values[paramName]]) {
            subFormHeader = React.createElement(
                'h4',
                null,
                values[paramName]
            );
            subForm = React.createElement(_FormPanel2['default'], {
                onParameterChange: this.props.onParameterChange,
                applyButtonAction: this.props.applyButtonAction,
                disabled: this.props.disabled,
                ref: paramName + '-SUB',
                key: paramName + '-SUB',
                className: 'sub-form',
                parameters: switchValues[values[paramName]].fields,
                values: values,
                depth: this.props.depth + 1,
                onChange: this.onChange,
                checkHasHelper: this.props.checkHasHelper,
                setHelperData: this.props.setHelperData,
                helperTestFor: values[paramName],
                accordionizeIfGroupsMoreThan: 5
            });
        }
        return React.createElement(
            'div',
            { className: 'sub-form-group' },
            selector,
            selectorLegend,
            subForm
        );
    }

});
module.exports = exports['default'];

},{"../fields/InputSelectBox":8,"./FormPanel":20,"pydio/util/lang":"pydio/util/lang","react":"react"}],22:[function(require,module,exports){
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

var _FormPanel = require('./FormPanel');

var _FormPanel2 = _interopRequireDefault(_FormPanel);

var _require = require('react');

var Component = _require.Component;

var _require2 = require('material-ui');

var IconButton = _require2.IconButton;
var FlatButton = _require2.FlatButton;
var Paper = _require2.Paper;

var UP_ARROW = 'mdi mdi-menu-up';
var DOWN_ARROW = 'mdi mdi-menu-down';
var REMOVE = 'mdi mdi-delete-circle';

var ReplicatedGroup = (function (_Component) {
    _inherits(ReplicatedGroup, _Component);

    function ReplicatedGroup(props, context) {
        _classCallCheck(this, ReplicatedGroup);

        _Component.call(this, props, context);
        var subValues = props.subValues;
        var parameters = props.parameters;

        var firstParam = parameters[0];
        var instanceValue = subValues[firstParam['name']] || '';
        this.state = { toggled: instanceValue ? false : true };
    }

    ReplicatedGroup.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var depth = _props.depth;
        var onSwapUp = _props.onSwapUp;
        var onSwapDown = _props.onSwapDown;
        var onRemove = _props.onRemove;
        var parameters = _props.parameters;
        var subValues = _props.subValues;
        var disabled = _props.disabled;
        var toggled = this.state.toggled;

        var firstParam = parameters[0];
        var instanceValue = subValues[firstParam['name']] || React.createElement(
            'span',
            { style: { color: 'rgba(0,0,0,0.33)' } },
            'Empty Value'
        );

        return React.createElement(
            Paper,
            { style: { marginLeft: 2, marginRight: 2, marginBottom: 10 } },
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                React.createElement(
                    'div',
                    null,
                    React.createElement(IconButton, { iconClassName: 'mdi mdi-chevron-' + (this.state.toggled ? 'up' : 'down'), onTouchTap: function () {
                            _this.setState({ toggled: !_this.state.toggled });
                        } })
                ),
                React.createElement(
                    'div',
                    { style: { flex: 1, fontSize: 16 } },
                    instanceValue
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(IconButton, { iconClassName: UP_ARROW, onTouchTap: onSwapUp, disabled: !!!onSwapUp || disabled }),
                    React.createElement(IconButton, { iconClassName: DOWN_ARROW, onTouchTap: onSwapDown, disabled: !!!onSwapDown || disabled })
                )
            ),
            toggled && React.createElement(_FormPanel2['default'], _extends({}, this.props, {
                tabs: null,
                values: subValues,
                onChange: null,
                className: 'replicable-group',
                depth: depth
            })),
            toggled && React.createElement(
                'div',
                { style: { padding: 4, textAlign: 'right' } },
                React.createElement(FlatButton, { label: 'Remove', primary: true, onTouchTap: onRemove, disabled: !!!onRemove || disabled })
            )
        );
    };

    return ReplicatedGroup;
})(Component);

exports['default'] = ReplicatedGroup;
module.exports = exports['default'];

},{"./FormPanel":20,"material-ui":"material-ui","react":"react"}],23:[function(require,module,exports){
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

var _ReplicatedGroup = require('./ReplicatedGroup');

var _ReplicatedGroup2 = _interopRequireDefault(_ReplicatedGroup);

var React = require('react');

var _require = require('material-ui');

var IconButton = _require.IconButton;

var LangUtils = require('pydio/util/lang');

/**
 * Sub form replicating itself (+/-)
 */
exports['default'] = React.createClass({
    displayName: 'ReplicationPanel',

    propTypes: {
        parameters: React.PropTypes.array.isRequired,
        values: React.PropTypes.object,
        onChange: React.PropTypes.func,
        disabled: React.PropTypes.bool,
        binary_context: React.PropTypes.string,
        depth: React.PropTypes.number
    },

    buildSubValue: function buildSubValue(values) {
        var index = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        var subVal = undefined;
        var suffix = index == 0 ? '' : '_' + index;
        this.props.parameters.map(function (p) {
            var pName = p['name'];
            if (values[pName + suffix] !== undefined) {
                if (!subVal) subVal = {};
                subVal[pName] = values[pName + suffix];
            }
        });
        return subVal || false;
    },

    indexedValues: function indexedValues(rowsArray) {
        var index = 0,
            values = {};
        rowsArray.map(function (row) {
            var suffix = index == 0 ? '' : '_' + index;
            for (var p in row) {
                if (!row.hasOwnProperty(p)) continue;
                values[p + suffix] = row[p];
            }
            index++;
        });
        return values;
    },

    indexValues: function indexValues(rowsArray, removeLastRow) {
        var _this = this;

        var indexed = this.indexedValues(rowsArray);
        if (this.props.onChange) {
            if (removeLastRow) {
                (function () {
                    var lastRow = {},
                        nextIndex = rowsArray.length - 1;
                    _this.props.parameters.map(function (p) {
                        lastRow[p['name'] + (nextIndex > 0 ? '_' + nextIndex : '')] = '';
                    });
                    _this.props.onChange(indexed, true, lastRow);
                })();
            } else {
                this.props.onChange(indexed, true);
            }
        }
    },

    instances: function instances() {
        var _this2 = this;

        // Analyze current value to grab number of rows.
        var rows = [],
            subVal = undefined,
            index = 0;
        while (subVal = this.buildSubValue(this.props.values, index)) {
            index++;
            rows.push(subVal);
        }
        var firstParam = this.props.parameters[0];
        if (!rows.length && firstParam['replicationMandatory'] === 'true') {
            (function () {
                var emptyValue = {};
                _this2.props.parameters.map(function (p) {
                    emptyValue[p['name']] = p['default'] || '';
                });
                rows.push(emptyValue);
            })();
        }
        return rows;
    },

    addRow: function addRow() {
        var newValue = {},
            currentValues = this.instances();
        this.props.parameters.map(function (p) {
            newValue[p['name']] = p['default'] || '';
        });
        currentValues.push(newValue);
        this.indexValues(currentValues);
    },

    removeRow: function removeRow(index) {
        var instances = this.instances();
        var removeInst = instances[index];
        instances = LangUtils.arrayWithout(this.instances(), index);
        instances.push(removeInst);
        this.indexValues(instances, true);
    },

    swapRows: function swapRows(i, j) {
        var instances = this.instances();
        var tmp = instances[j];
        instances[j] = instances[i];
        instances[i] = tmp;
        this.indexValues(instances);
    },

    onChange: function onChange(index, newValues, dirty) {
        var instances = this.instances();
        instances[index] = newValues;
        this.indexValues(instances);
    },

    onParameterChange: function onParameterChange(index, paramName, newValue, oldValue) {
        var instances = this.instances();
        instances[index][paramName] = newValue;
        this.indexValues(instances);
    },

    render: function render() {
        var _this3 = this;

        var _props = this.props;
        var parameters = _props.parameters;
        var disabled = _props.disabled;

        var firstParam = parameters[0];
        var replicationTitle = firstParam['replicationTitle'] || firstParam['label'];
        var replicationDescription = firstParam['replicationDescription'] || firstParam['description'];
        var replicationMandatory = firstParam['replicationMandatory'] === 'true';

        var instances = this.instances();
        var multiple = instances.length > 1;
        var rows = instances.map(function (subValues, index) {
            var onSwapUp = undefined,
                onSwapDown = undefined,
                onRemove = undefined;
            var onParameterChange = function onParameterChange(paramName, newValue, oldValue) {
                _this3.onParameterChange(index, paramName, newValue, oldValue);
            };
            if (multiple && index > 0) {
                onSwapUp = function () {
                    _this3.swapRows(index, index - 1);
                };
            }
            if (multiple && index < instances.length - 1) {
                onSwapDown = function () {
                    _this3.swapRows(index, index + 1);
                };
            }
            if (multiple || !replicationMandatory) {
                onRemove = function () {
                    _this3.removeRow(index);
                };
            }
            var props = { onSwapUp: onSwapUp, onSwapDown: onSwapDown, onRemove: onRemove, onParameterChange: onParameterChange };
            return React.createElement(_ReplicatedGroup2['default'], _extends({ key: index }, _this3.props, props, { subValues: subValues }));
        });

        return React.createElement(
            'div',
            { className: 'replicable-field' },
            React.createElement(
                'div',
                { className: 'title-bar' },
                React.createElement(IconButton, { key: 'add', style: { float: 'right' }, iconClassName: 'mdi mdi-plus', iconStyle: { fontSize: 24 }, tooltip: 'Add value', onClick: this.addRow, disabled: disabled }),
                React.createElement(
                    'div',
                    { className: 'title' },
                    replicationTitle
                ),
                React.createElement(
                    'div',
                    { className: 'legend' },
                    replicationDescription
                )
            ),
            rows
        );
    }

});
module.exports = exports['default'];

},{"./ReplicatedGroup":22,"material-ui":"material-ui","pydio/util/lang":"pydio/util/lang","react":"react"}]},{},[13])(13)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvQXV0b2NvbXBsZXRlQm94LmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0F1dG9jb21wbGV0ZVRyZWUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvRmlsZURyb3B6b25lLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0Qm9vbGVhbi5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9JbnB1dEJ1dHRvbi5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9JbnB1dEltYWdlLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0SW50ZWdlci5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9JbnB1dFNlbGVjdEJveC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9Nb25pdG9yaW5nTGFiZWwuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvVGV4dEZpZWxkLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL1ZhbGlkTG9naW4uanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvVmFsaWRQYXNzd29yZC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2luZGV4LmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWFuYWdlci9NYW5hZ2VyLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWl4aW5zL0FjdGlvblJ1bm5lck1peGluLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWl4aW5zL0ZpZWxkV2l0aENob2ljZXMuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9taXhpbnMvRm9ybU1peGluLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWl4aW5zL0hlbHBlck1peGluLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vcGFuZWwvRm9ybUhlbHBlci5qcyIsInJlcy9idWlsZC91aS9Gb3JtL3BhbmVsL0Zvcm1QYW5lbC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL3BhbmVsL0dyb3VwU3dpdGNoUGFuZWwuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9SZXBsaWNhdGVkR3JvdXAuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9SZXBsaWNhdGlvblBhbmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX21peGluc0Zvcm1NaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9Gb3JtTWl4aW4nKTtcblxudmFyIF9taXhpbnNGb3JtTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRm9ybU1peGluKTtcblxudmFyIF9taXhpbnNGaWVsZFdpdGhDaG9pY2VzID0gcmVxdWlyZSgnLi4vbWl4aW5zL0ZpZWxkV2l0aENob2ljZXMnKTtcblxudmFyIF9taXhpbnNGaWVsZFdpdGhDaG9pY2VzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0ZpZWxkV2l0aENob2ljZXMpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgQXV0b0NvbXBsZXRlID0gX3JlcXVpcmUuQXV0b0NvbXBsZXRlO1xudmFyIE1lbnVJdGVtID0gX3JlcXVpcmUuTWVudUl0ZW07XG52YXIgUmVmcmVzaEluZGljYXRvciA9IF9yZXF1aXJlLlJlZnJlc2hJbmRpY2F0b3I7XG5cbnZhciBBdXRvY29tcGxldGVCb3ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdBdXRvY29tcGxldGVCb3gnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBoYW5kbGVVcGRhdGVJbnB1dDogZnVuY3Rpb24gaGFuZGxlVXBkYXRlSW5wdXQoc2VhcmNoVGV4dCkge1xuICAgICAgICAvL3RoaXMuc2V0U3RhdGUoe3NlYXJjaFRleHQ6IHNlYXJjaFRleHR9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlTmV3UmVxdWVzdDogZnVuY3Rpb24gaGFuZGxlTmV3UmVxdWVzdChjaG9zZW5WYWx1ZSkge1xuICAgICAgICBpZiAoY2hvc2VuVmFsdWUua2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2UobnVsbCwgY2hvc2VuVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZShudWxsLCBjaG9zZW5WYWx1ZS5rZXkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcztcblxuICAgICAgICB2YXIgZGF0YVNvdXJjZSA9IFtdO1xuICAgICAgICB2YXIgbGFiZWxzID0ge307XG4gICAgICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBrZXkpIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICAgdGV4dDogY2hvaWNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBNZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYWJlbHNba2V5XSA9IGNob2ljZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGRpc3BsYXlUZXh0ID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgaWYgKGxhYmVscyAmJiBsYWJlbHNbZGlzcGxheVRleHRdKSB7XG4gICAgICAgICAgICBkaXNwbGF5VGV4dCA9IGxhYmVsc1tkaXNwbGF5VGV4dF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0Rpc3BsYXlHcmlkKCkgJiYgIXRoaXMuc3RhdGUuZWRpdE1vZGUgfHwgdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzLmdldCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGNob2ljZXMuZ2V0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5wcm9wcy5kaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdGhpcy50b2dnbGVFZGl0TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiB2YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgIXZhbHVlID8gJ0VtcHR5JyA6IHZhbHVlLFxuICAgICAgICAgICAgICAgICcgwqDCoCcsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnaWNvbi1jYXJldC1kb3duJyB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3B5ZGlvZm9ybV9hdXRvY29tcGxldGUnLCBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9IH0sXG4gICAgICAgICAgICAhZGF0YVNvdXJjZS5sZW5ndGggJiYgUmVhY3QuY3JlYXRlRWxlbWVudChSZWZyZXNoSW5kaWNhdG9yLCB7XG4gICAgICAgICAgICAgICAgc2l6ZTogMzAsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IDEwLFxuICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdsb2FkaW5nJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBkYXRhU291cmNlLmxlbmd0aCAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KEF1dG9Db21wbGV0ZSwge1xuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWFyY2hUZXh0OiBkaXNwbGF5VGV4dCxcbiAgICAgICAgICAgICAgICBvblVwZGF0ZUlucHV0OiB0aGlzLmhhbmRsZVVwZGF0ZUlucHV0LFxuICAgICAgICAgICAgICAgIG9uTmV3UmVxdWVzdDogdGhpcy5oYW5kbGVOZXdSZXF1ZXN0LFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U6IGRhdGFTb3VyY2UsXG4gICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMucHJvcHMuYXR0cmlidXRlc1snbGFiZWwnXSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uIChzZWFyY2hUZXh0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFrZXkgfHwgIXNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpID09PSAwO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3Blbk9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVudVByb3BzOiB7IG1heEhlaWdodDogMjAwIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQXV0b2NvbXBsZXRlQm94ID0gX21peGluc0ZpZWxkV2l0aENob2ljZXMyWydkZWZhdWx0J10oQXV0b2NvbXBsZXRlQm94KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEF1dG9jb21wbGV0ZUJveDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNGb3JtTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvRm9ybU1peGluJyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0Zvcm1NaXhpbik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCdsb2Rhc2guZGVib3VuY2UnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIEF1dG9Db21wbGV0ZSA9IF9yZXF1aXJlLkF1dG9Db21wbGV0ZTtcbnZhciBNZW51SXRlbSA9IF9yZXF1aXJlLk1lbnVJdGVtO1xudmFyIFJlZnJlc2hJbmRpY2F0b3IgPSBfcmVxdWlyZS5SZWZyZXNoSW5kaWNhdG9yO1xudmFyIEZvbnRJY29uID0gX3JlcXVpcmUuRm9udEljb247XG5cbnZhciBBdXRvY29tcGxldGVUcmVlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnQXV0b2NvbXBsZXRlVHJlZScsXG5cbiAgICBtaXhpbnM6IFtfbWl4aW5zRm9ybU1peGluMlsnZGVmYXVsdCddXSxcblxuICAgIGhhbmRsZVVwZGF0ZUlucHV0OiBmdW5jdGlvbiBoYW5kbGVVcGRhdGVJbnB1dChzZWFyY2hUZXh0KSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VkKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0IH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVOZXdSZXF1ZXN0OiBmdW5jdGlvbiBoYW5kbGVOZXdSZXF1ZXN0KGNob3NlblZhbHVlKSB7XG4gICAgICAgIHZhciBrZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChjaG9zZW5WYWx1ZS5rZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAga2V5ID0gY2hvc2VuVmFsdWUua2V5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5ID0gY2hvc2VuVmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbkNoYW5nZShudWxsLCBrZXkpO1xuICAgICAgICB0aGlzLmxvYWRWYWx1ZXMoa2V5KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VkID0gZGVib3VuY2UodGhpcy5sb2FkVmFsdWVzLmJpbmQodGhpcyksIDMwMCk7XG4gICAgICAgIHRoaXMubGFzdFNlYXJjaCA9IG51bGw7XG4gICAgICAgIHZhciB2YWx1ZSA9IFwiXCI7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkVmFsdWVzKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgbG9hZFZhbHVlczogZnVuY3Rpb24gbG9hZFZhbHVlcygpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICB2YXIgYmFzZVBhdGggPSB2YWx1ZTtcbiAgICAgICAgaWYgKCF2YWx1ZSAmJiB0aGlzLnN0YXRlLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIHZhciBsYXN0ID0gdGhpcy5zdGF0ZS5zZWFyY2hUZXh0Lmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuc3RhdGUuc2VhcmNoVGV4dC5zdWJzdHIoMCwgbGFzdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGFzdFNlYXJjaCAhPT0gbnVsbCAmJiB0aGlzLmxhc3RTZWFyY2ggPT09IGJhc2VQYXRoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0U2VhcmNoID0gYmFzZVBhdGg7XG4gICAgICAgIC8vIFRPRE8gOiBsb2FkIHZhbHVlcyBmcm9tIHNlcnZpY2VcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cbiAgICAgICAgdmFyIGRhdGFTb3VyY2UgPSBbXTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5ub2Rlcykge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGljb24gPSBcIm1kaSBtZGktZm9sZGVyXCI7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudXVpZC5zdGFydHNXaXRoKFwiREFUQVNPVVJDRTpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaWNvbiA9IFwibWRpIG1kaS1kYXRhYmFzZVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkYXRhU291cmNlLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBrZXk6IG5vZGUucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogbm9kZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIE1lbnVJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRm9udEljb24sIHsgY2xhc3NOYW1lOiBpY29uLCBjb2xvcjogJyM2MTYxNjEnLCBzdHlsZTogeyBmbG9hdDogJ2xlZnQnLCBtYXJnaW5SaWdodDogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5wYXRoXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRpc3BsYXlUZXh0ID0gdGhpcy5zdGF0ZS52YWx1ZTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdweWRpb2Zvcm1fYXV0b2NvbXBsZXRlJywgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScgfSB9LFxuICAgICAgICAgICAgIWRhdGFTb3VyY2UubGVuZ3RoICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVmcmVzaEluZGljYXRvciwge1xuICAgICAgICAgICAgICAgIHNpemU6IDMwLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnbG9hZGluZydcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChBdXRvQ29tcGxldGUsIHtcbiAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VhcmNoVGV4dDogZGlzcGxheVRleHQsXG4gICAgICAgICAgICAgICAgb25VcGRhdGVJbnB1dDogdGhpcy5oYW5kbGVVcGRhdGVJbnB1dCxcbiAgICAgICAgICAgICAgICBvbk5ld1JlcXVlc3Q6IHRoaXMuaGFuZGxlTmV3UmVxdWVzdCxcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlOiBkYXRhU291cmNlLFxuICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2xhYmVsJ10sXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmdW5jdGlvbiAoc2VhcmNoVGV4dCwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrZXkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKSkgPT09IDA7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvcGVuT25Gb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtZW51UHJvcHM6IHsgbWF4SGVpZ2h0OiAyMDAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBBdXRvY29tcGxldGVUcmVlO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG4vKipcbiAqIFVJIHRvIGRyb3AgYSBmaWxlIChvciBjbGljayB0byBicm93c2UpLCB1c2VkIGJ5IHRoZSBJbnB1dEltYWdlIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6IFwiRmlsZURyb3B6b25lXCIsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1cHBvcnRDbGljazogdHJ1ZSxcbiAgICAgICAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgb25Ecm9wOiBmdW5jdGlvbiBvbkRyb3AoKSB7fVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlzRHJhZ0FjdGl2ZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIG9uRHJvcDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgaWdub3JlTmF0aXZlRHJvcDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIHNpemU6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgICAgIHN0eWxlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBkcmFnQWN0aXZlU3R5bGU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIHN1cHBvcnRDbGljazogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGFjY2VwdDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgbXVsdGlwbGU6IFJlYWN0LlByb3BUeXBlcy5ib29sXG4gICAgfSxcblxuICAgIG9uRHJhZ0xlYXZlOiBmdW5jdGlvbiBvbkRyYWdMZWF2ZShlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNEcmFnQWN0aXZlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25EcmFnT3ZlcjogZnVuY3Rpb24gb25EcmFnT3ZlcihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwiY29weVwiO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNEcmFnQWN0aXZlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbkZpbGVQaWNrZWQ6IGZ1bmN0aW9uIG9uRmlsZVBpY2tlZChlKSB7XG4gICAgICAgIGlmICghZS50YXJnZXQgfHwgIWUudGFyZ2V0LmZpbGVzKSByZXR1cm47XG4gICAgICAgIHZhciBmaWxlcyA9IGUudGFyZ2V0LmZpbGVzO1xuICAgICAgICB2YXIgbWF4RmlsZXMgPSB0aGlzLnByb3BzLm11bHRpcGxlID8gZmlsZXMubGVuZ3RoIDogMTtcbiAgICAgICAgZmlsZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmaWxlcywgMCwgbWF4RmlsZXMpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkRyb3ApIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Ecm9wKGZpbGVzLCBlLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkZvbGRlclBpY2tlZDogZnVuY3Rpb24gb25Gb2xkZXJQaWNrZWQoZSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZvbGRlclBpY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZvbGRlclBpY2tlZChlLnRhcmdldC5maWxlcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25Ecm9wOiBmdW5jdGlvbiBvbkRyb3AoZSkge1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNEcmFnQWN0aXZlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pZ25vcmVOYXRpdmVEcm9wKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZmlsZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChlLmRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgICAgZmlsZXMgPSBlLmRhdGFUcmFuc2Zlci5maWxlcztcbiAgICAgICAgfSBlbHNlIGlmIChlLnRhcmdldCkge1xuICAgICAgICAgICAgZmlsZXMgPSBlLnRhcmdldC5maWxlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtYXhGaWxlcyA9IHRoaXMucHJvcHMubXVsdGlwbGUgPyBmaWxlcy5sZW5ndGggOiAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1heEZpbGVzOyBpKyspIHtcbiAgICAgICAgICAgIGZpbGVzW2ldLnByZXZpZXcgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRHJvcCkge1xuICAgICAgICAgICAgZmlsZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmaWxlcywgMCwgbWF4RmlsZXMpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRyb3AoZmlsZXMsIGUsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnN1cHBvcnRDbGljayA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb3BlbjogZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgdGhpcy5yZWZzLmZpbGVJbnB1dC5jbGljaygpO1xuICAgIH0sXG5cbiAgICBvcGVuRm9sZGVyUGlja2VyOiBmdW5jdGlvbiBvcGVuRm9sZGVyUGlja2VyKCkge1xuICAgICAgICB0aGlzLnJlZnMuZm9sZGVySW5wdXQuc2V0QXR0cmlidXRlKFwid2Via2l0ZGlyZWN0b3J5XCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgdGhpcy5yZWZzLmZvbGRlcklucHV0LmNsaWNrKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgIHZhciBjbGFzc05hbWUgPSB0aGlzLnByb3BzLmNsYXNzTmFtZSB8fCAnZmlsZS1kcm9wem9uZSc7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzRHJhZ0FjdGl2ZSkge1xuICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgYWN0aXZlJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdHlsZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnNpemUgfHwgMTAwLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLnNpemUgfHwgMTAwXG4gICAgICAgIH07XG4gICAgICAgIC8vYm9yZGVyU3R5bGU6IHRoaXMuc3RhdGUuaXNEcmFnQWN0aXZlID8gXCJzb2xpZFwiIDogXCJkYXNoZWRcIlxuICAgICAgICBpZiAodGhpcy5wcm9wcy5zdHlsZSkge1xuICAgICAgICAgICAgc3R5bGUgPSBfZXh0ZW5kcyh7fSwgc3R5bGUsIHRoaXMucHJvcHMuc3R5bGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzRHJhZ0FjdGl2ZSAmJiB0aGlzLnByb3BzLmRyYWdBY3RpdmVTdHlsZSkge1xuICAgICAgICAgICAgc3R5bGUgPSBfZXh0ZW5kcyh7fSwgc3R5bGUsIHRoaXMucHJvcHMuZHJhZ0FjdGl2ZVN0eWxlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm9sZGVySW5wdXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVuYWJsZUZvbGRlcnMpIHtcbiAgICAgICAgICAgIGZvbGRlcklucHV0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ25vbmUnIH0sIG5hbWU6IFwidXNlcmZvbGRlclwiLCB0eXBlOiBcImZpbGVcIiwgcmVmOiBcImZvbGRlcklucHV0XCIsIG9uQ2hhbmdlOiB0aGlzLm9uRm9sZGVyUGlja2VkIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIHN0eWxlOiBzdHlsZSwgb25DbGljazogdGhpcy5vbkNsaWNrLCBvbkRyYWdMZWF2ZTogdGhpcy5vbkRyYWdMZWF2ZSwgb25EcmFnT3ZlcjogdGhpcy5vbkRyYWdPdmVyLCBvbkRyb3A6IHRoaXMub25Ecm9wIH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSwgbmFtZTogXCJ1c2VyZmlsZVwiLCB0eXBlOiBcImZpbGVcIiwgbXVsdGlwbGU6IHRoaXMucHJvcHMubXVsdGlwbGUsIHJlZjogXCJmaWxlSW5wdXRcIiwgdmFsdWU6IFwiXCIsIG9uQ2hhbmdlOiB0aGlzLm9uRmlsZVBpY2tlZCwgYWNjZXB0OiB0aGlzLnByb3BzLmFjY2VwdCB9KSxcbiAgICAgICAgICAgIGZvbGRlcklucHV0LFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNGb3JtTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvRm9ybU1peGluJyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0Zvcm1NaXhpbik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBUb2dnbGUgPSBfcmVxdWlyZS5Ub2dnbGU7XG5cbi8qKlxuICogQm9vbGVhbiBpbnB1dFxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdJbnB1dEJvb2xlYW4nLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNraXBCdWZmZXJDaGFuZ2VzOiB0cnVlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hlY2s6IGZ1bmN0aW9uIG9uQ2hlY2soZXZlbnQsIG5ld1ZhbHVlKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIHRoaXMuc3RhdGUudmFsdWUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpcnR5OiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IG5ld1ZhbHVlXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRCb29sZWFuU3RhdGU6IGZ1bmN0aW9uIGdldEJvb2xlYW5TdGF0ZSgpIHtcbiAgICAgICAgdmFyIGJvb2xWYWwgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICBpZiAodHlwZW9mIGJvb2xWYWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBib29sVmFsID0gYm9vbFZhbCA9PSBcInRydWVcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYm9vbFZhbDtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBib29sVmFsID0gdGhpcy5nZXRCb29sZWFuU3RhdGUoKTtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUb2dnbGUsIHtcbiAgICAgICAgICAgICAgICB0b2dnbGVkOiBib29sVmFsLFxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlOiB0aGlzLm9uQ2hlY2ssXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuaXNEaXNwbGF5Rm9ybSgpID8gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsIDogbnVsbCxcbiAgICAgICAgICAgICAgICBsYWJlbFBvc2l0aW9uOiB0aGlzLmlzRGlzcGxheUZvcm0oKSA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNBY3Rpb25SdW5uZXJNaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9BY3Rpb25SdW5uZXJNaXhpbicpO1xuXG52YXIgX21peGluc0FjdGlvblJ1bm5lck1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0FjdGlvblJ1bm5lck1peGluKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIFJhaXNlZEJ1dHRvbiA9IF9yZXF1aXJlLlJhaXNlZEJ1dHRvbjtcblxuLyoqXG4gKiBTaW1wbGUgUmFpc2VkQnV0dG9uIGV4ZWN1dGluZyB0aGUgYXBwbHlCdXR0b25BY3Rpb25cbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnSW5wdXRCdXR0b24nLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0FjdGlvblJ1bm5lck1peGluMlsnZGVmYXVsdCddXSxcblxuICAgIGFwcGx5QnV0dG9uOiBmdW5jdGlvbiBhcHBseUJ1dHRvbigpIHtcblxuICAgICAgICB2YXIgY2FsbGJhY2sgPSB0aGlzLnByb3BzLmFjdGlvbkNhbGxiYWNrO1xuICAgICAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IHRyYW5zcG9ydC5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQuc3RhcnRzV2l0aCgnU1VDQ0VTUzonKSkge1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWwucHlkaW8uZGlzcGxheU1lc3NhZ2UoJ1NVQ0NFU1MnLCB0cmFuc3BvcnQucmVzcG9uc2VUZXh0LnJlcGxhY2UoJ1NVQ0NFU1M6JywgJycpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWwucHlkaW8uZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgdHJhbnNwb3J0LnJlc3BvbnNlVGV4dC5yZXBsYWNlKCdFUlJPUjonLCAnJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hcHBseUFjdGlvbihjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChSYWlzZWRCdXR0b24sIHtcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2xhYmVsJ10sXG4gICAgICAgICAgICBvblRvdWNoVGFwOiB0aGlzLmFwcGx5QnV0dG9uLFxuICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWRcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgX0ZpbGVEcm9wem9uZSA9IHJlcXVpcmUoJy4vRmlsZURyb3B6b25lJyk7XG5cbnZhciBfRmlsZURyb3B6b25lMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ZpbGVEcm9wem9uZSk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcHlkaW9VdGlsTGFuZyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsTGFuZyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE5hdGl2ZUZpbGVEcm9wUHJvdmlkZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5OYXRpdmVGaWxlRHJvcFByb3ZpZGVyO1xuXG4vLyBKdXN0IGVuYWJsZSB0aGUgZHJvcCBtZWNoYW5pc20sIGJ1dCBkbyBub3RoaW5nLCBpdCBpcyBtYW5hZ2VkIGJ5IHRoZSBGaWxlRHJvcHpvbmVcbnZhciBCaW5hcnlEcm9wWm9uZSA9IE5hdGl2ZUZpbGVEcm9wUHJvdmlkZXIoX0ZpbGVEcm9wem9uZTJbJ2RlZmF1bHQnXSwgZnVuY3Rpb24gKGl0ZW1zLCBmaWxlcywgcHJvcHMpIHt9KTtcblxuLyoqXG4gKiBVSSBmb3IgZGlzcGxheWluZyBhbmQgdXBsb2FkaW5nIGFuIGltYWdlLFxuICogdXNpbmcgdGhlIGJpbmFyeUNvbnRleHQgc3RyaW5nLlxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnSW5wdXRJbWFnZScsXG5cbiAgICBtaXhpbnM6IFtfbWl4aW5zRm9ybU1peGluMlsnZGVmYXVsdCddXSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBhdHRyaWJ1dGVzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgYmluYXJ5X2NvbnRleHQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nXG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgdmFyIGltZ1NyYyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKChuZXdQcm9wcy52YWx1ZSB8fCBuZXdQcm9wcy5iaW5hcnlfY29udGV4dCAmJiBuZXdQcm9wcy5iaW5hcnlfY29udGV4dCAhPT0gdGhpcy5wcm9wcy5iaW5hcnlfY29udGV4dCkgJiYgIXRoaXMuc3RhdGUucmVzZXQpIHtcbiAgICAgICAgICAgIGltZ1NyYyA9IHRoaXMuZ2V0QmluYXJ5VXJsKG5ld1Byb3BzLCB0aGlzLnN0YXRlLnRlbXBvcmFyeUJpbmFyeSAmJiB0aGlzLnN0YXRlLnRlbXBvcmFyeUJpbmFyeSA9PT0gbmV3UHJvcHMudmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKG5ld1Byb3BzLmF0dHJpYnV0ZXNbJ2RlZmF1bHRJbWFnZSddKSB7XG4gICAgICAgICAgICBpbWdTcmMgPSBuZXdQcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW1nU3JjKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaW1hZ2VTcmM6IGltZ1NyYywgcmVzZXQ6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICB2YXIgaW1nU3JjID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgb3JpZ2luYWxCaW5hcnkgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICBpbWdTcmMgPSB0aGlzLmdldEJpbmFyeVVybCh0aGlzLnByb3BzKTtcbiAgICAgICAgICAgIG9yaWdpbmFsQmluYXJ5ID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2RlZmF1bHRJbWFnZSddKSB7XG4gICAgICAgICAgICBpbWdTcmMgPSB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2RlZmF1bHRJbWFnZSddO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGltYWdlU3JjOiBpbWdTcmMsIG9yaWdpbmFsQmluYXJ5OiBvcmlnaW5hbEJpbmFyeSB9O1xuICAgIH0sXG5cbiAgICBnZXRCaW5hcnlVcmw6IGZ1bmN0aW9uIGdldEJpbmFyeVVybChwcm9wcykge1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpLmdldFB5ZGlvT2JqZWN0KCk7XG4gICAgICAgIHZhciB1cmwgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnRU5EUE9JTlRfUkVTVF9BUEknKSArIHByb3BzLmF0dHJpYnV0ZXNbJ2xvYWRBY3Rpb24nXTtcbiAgICAgICAgdmFyIGJJZCA9IHByb3BzLnZhbHVlO1xuICAgICAgICBpZiAocHJvcHMuYmluYXJ5X2NvbnRleHQgJiYgcHJvcHMuYmluYXJ5X2NvbnRleHQuaW5kZXhPZigndXNlcl9pZD0nKSA9PT0gMCkge1xuICAgICAgICAgICAgYklkID0gcHJvcHMuYmluYXJ5X2NvbnRleHQucmVwbGFjZSgndXNlcl9pZD0nLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJ3tCSU5BUll9JywgYklkKTtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9LFxuXG4gICAgZ2V0VXBsb2FkVXJsOiBmdW5jdGlvbiBnZXRVcGxvYWRVcmwoKSB7XG4gICAgICAgIHZhciBweWRpbyA9IF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0Q2xpZW50KCkuZ2V0UHlkaW9PYmplY3QoKTtcbiAgICAgICAgdmFyIHVybCA9IHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdFTkRQT0lOVF9SRVNUX0FQSScpICsgdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd1cGxvYWRBY3Rpb24nXTtcbiAgICAgICAgdmFyIGJJZCA9ICcnO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5iaW5hcnlfY29udGV4dCAmJiB0aGlzLnByb3BzLmJpbmFyeV9jb250ZXh0LmluZGV4T2YoJ3VzZXJfaWQ9JykgPT09IDApIHtcbiAgICAgICAgICAgIGJJZCA9IHRoaXMucHJvcHMuYmluYXJ5X2NvbnRleHQucmVwbGFjZSgndXNlcl9pZD0nLCAnJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgYklkID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJJZCA9IF9weWRpb1V0aWxMYW5nMlsnZGVmYXVsdCddLmNvbXB1dGVTdHJpbmdTbHVnKHRoaXMucHJvcHMuYXR0cmlidXRlc1tcIm5hbWVcIl0gKyBcIi5wbmdcIik7XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJ3tCSU5BUll9JywgYklkKTtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9LFxuXG4gICAgdXBsb2FkQ29tcGxldGU6IGZ1bmN0aW9uIHVwbG9hZENvbXBsZXRlKG5ld0JpbmFyeU5hbWUpIHtcbiAgICAgICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdGVtcG9yYXJ5QmluYXJ5OiBuZXdCaW5hcnlOYW1lLFxuICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB2YXIgYWRkaXRpb25hbEZvcm1EYXRhID0geyB0eXBlOiAnYmluYXJ5JyB9O1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUub3JpZ2luYWxCaW5hcnkpIHtcbiAgICAgICAgICAgICAgICBhZGRpdGlvbmFsRm9ybURhdGFbJ29yaWdpbmFsX2JpbmFyeSddID0gdGhpcy5zdGF0ZS5vcmlnaW5hbEJpbmFyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3QmluYXJ5TmFtZSwgcHJldlZhbHVlLCBhZGRpdGlvbmFsRm9ybURhdGEpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGh0bWxVcGxvYWQ6IGZ1bmN0aW9uIGh0bWxVcGxvYWQoKSB7XG4gICAgICAgIHdpbmRvdy5mb3JtTWFuYWdlckhpZGRlbklGcmFtZVN1Ym1pc3Npb24gPSAoZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgdGhpcy51cGxvYWRDb21wbGV0ZShyZXN1bHQudHJpbSgpKTtcbiAgICAgICAgICAgIHdpbmRvdy5mb3JtTWFuYWdlckhpZGRlbklGcmFtZVN1Ym1pc3Npb24gPSBudWxsO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlZnMudXBsb2FkRm9ybS5zdWJtaXQoKTtcbiAgICB9LFxuXG4gICAgb25Ecm9wOiBmdW5jdGlvbiBvbkRyb3AoZmlsZXMsIGV2ZW50LCBkcm9wem9uZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmIChfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLnN1cHBvcnRzVXBsb2FkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuICAgICAgICAgICAgX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkuZ2V0T3JVcGRhdGVKd3QoKS50aGVuKGZ1bmN0aW9uIChqd3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgeGhyU2V0dGluZ3MgPSB7IGN1c3RvbUhlYWRlcnM6IHsgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgand0IH0gfTtcbiAgICAgICAgICAgICAgICBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpLnVwbG9hZEZpbGUoZmlsZXNbMF0sIFwidXNlcmZpbGVcIiwgJycsIChmdW5jdGlvbiAodHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBKU09OLnBhcnNlKHRyYW5zcG9ydC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5iaW5hcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBsb2FkQ29tcGxldGUocmVzdWx0LmJpbmFyeSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMpLCAoZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBlcnJvclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZChfdGhpcyksIGZ1bmN0aW9uIChjb21wdXRhYmxlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY29tcHV0YWJsZUV2ZW50KTtcbiAgICAgICAgICAgICAgICB9LCBfdGhpcy5nZXRVcGxvYWRVcmwoKSwgeGhyU2V0dGluZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmh0bWxVcGxvYWQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjbGVhckltYWdlOiBmdW5jdGlvbiBjbGVhckltYWdlKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICBpZiAoZ2xvYmFsLmNvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIHJlbW92ZSB0aGUgY3VycmVudCBpbWFnZT8nKSkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJldlZhbHVlID0gX3RoaXMyLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICByZXNldDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoJycsIHByZXZWYWx1ZSwgeyB0eXBlOiAnYmluYXJ5JyB9KTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKF90aGlzMikpO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGNvdmVySW1hZ2VTdHlsZSA9IHtcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogXCJ1cmwoXCIgKyB0aGlzLnN0YXRlLmltYWdlU3JjICsgXCIpXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb246IFwiNTAlIDUwJVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6IFwiY292ZXJcIlxuICAgICAgICB9O1xuICAgICAgICB2YXIgaWNvbnMgPSBbXTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgICAgICBpY29ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBrZXk6ICdzcGlubmVyJywgY2xhc3NOYW1lOiAnaWNvbi1zcGlubmVyIHJvdGF0aW5nJywgc3R5bGU6IHsgb3BhY2l0eTogJzAnIH0gfSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWNvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiAnY2FtZXJhJywgY2xhc3NOYW1lOiAnaWNvbi1jYW1lcmEnLCBzdHlsZTogeyBvcGFjaXR5OiAnMCcgfSB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2ltYWdlLWxhYmVsJyB9LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAgICAgICB7IHJlZjogJ3VwbG9hZEZvcm0nLCBlbmNUeXBlOiAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScsIHRhcmdldDogJ3VwbG9hZGVyX2hpZGRlbl9pZnJhbWUnLCBtZXRob2Q6ICdwb3N0JywgYWN0aW9uOiB0aGlzLmdldFVwbG9hZFVybCgpIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIEJpbmFyeURyb3Bab25lLFxuICAgICAgICAgICAgICAgICAgICB7IG9uRHJvcDogdGhpcy5vbkRyb3AsIGFjY2VwdDogJ2ltYWdlLyonLCBzdHlsZTogY292ZXJJbWFnZVN0eWxlIH0sXG4gICAgICAgICAgICAgICAgICAgIGljb25zXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnYmluYXJ5LXJlbW92ZS1idXR0b24nLCBvbkNsaWNrOiB0aGlzLmNsZWFySW1hZ2UgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiAncmVtb3ZlJywgY2xhc3NOYW1lOiAnbWRpIG1kaS1jbG9zZScgfSksXG4gICAgICAgICAgICAgICAgJyBSRVNFVCdcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnaWZyYW1lJywgeyBzdHlsZTogeyBkaXNwbGF5OiBcIm5vbmVcIiB9LCBpZDogJ3VwbG9hZGVyX2hpZGRlbl9pZnJhbWUnLCBuYW1lOiAndXBsb2FkZXJfaGlkZGVuX2lmcmFtZScgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX21peGluc0Zvcm1NaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9Gb3JtTWl4aW4nKTtcblxudmFyIF9taXhpbnNGb3JtTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRm9ybU1peGluKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdE1VSSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpLWxlZ2FjeScpO1xuXG4vKipcbiAqIFRleHQgaW5wdXQgdGhhdCBpcyBjb252ZXJ0ZWQgdG8gaW50ZWdlciwgYW5kXG4gKiB0aGUgVUkgY2FuIHJlYWN0IHRvIGFycm93cyBmb3IgaW5jcmVtZW50aW5nL2RlY3JlbWVudGluZyB2YWx1ZXNcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnSW5wdXRJbnRlZ2VyJyxcblxuICAgIG1peGluczogW19taXhpbnNGb3JtTWl4aW4yWydkZWZhdWx0J11dLFxuXG4gICAga2V5RG93bjogZnVuY3Rpb24ga2V5RG93bihldmVudCkge1xuICAgICAgICB2YXIgaW5jID0gMCxcbiAgICAgICAgICAgIG11bHRpcGxlID0gMTtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PSAnRW50ZXInKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09ICdBcnJvd1VwJykge1xuICAgICAgICAgICAgaW5jID0gKzE7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09ICdBcnJvd0Rvd24nKSB7XG4gICAgICAgICAgICBpbmMgPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIG11bHRpcGxlID0gMTA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHRoaXMuc3RhdGUudmFsdWUpO1xuICAgICAgICBpZiAoaXNOYU4ocGFyc2VkKSkgcGFyc2VkID0gMDtcbiAgICAgICAgdmFyIHZhbHVlID0gcGFyc2VkICsgaW5jICogbXVsdGlwbGU7XG4gICAgICAgIHRoaXMub25DaGFuZ2UobnVsbCwgdmFsdWUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwbGF5R3JpZCgpICYmICF0aGlzLnN0YXRlLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBvbkNsaWNrOiB0aGlzLnByb3BzLmRpc2FibGVkID8gZnVuY3Rpb24gKCkge30gOiB0aGlzLnRvZ2dsZUVkaXRNb2RlLCBjbGFzc05hbWU6IHZhbHVlID8gJycgOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICAhdmFsdWUgPyAnRW1wdHknIDogdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgaW50dmFsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpbnR2YWwgPSBwYXJzZUludCh0aGlzLnN0YXRlLnZhbHVlKSArICcnO1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihpbnR2YWwpKSBpbnR2YWwgPSB0aGlzLnN0YXRlLnZhbHVlICsgJyc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGludHZhbCA9ICcwJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2ludGVnZXItaW5wdXQnIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdE1VSS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGludHZhbCxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5rZXlEb3duLFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuaXNEaXNwbGF5Rm9ybSgpID8gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsIDogbnVsbFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNGb3JtTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvRm9ybU1peGluJyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0Zvcm1NaXhpbik7XG5cbnZhciBfbWl4aW5zRmllbGRXaXRoQ2hvaWNlcyA9IHJlcXVpcmUoJy4uL21peGlucy9GaWVsZFdpdGhDaG9pY2VzJyk7XG5cbnZhciBfbWl4aW5zRmllbGRXaXRoQ2hvaWNlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGaWVsZFdpdGhDaG9pY2VzKTtcblxuLyoqXG4gKiBTZWxlY3QgYm94IGlucHV0IGNvbmZvcm1pbmcgdG8gUHlkaW8gc3RhbmRhcmQgZm9ybSBwYXJhbWV0ZXIuXG4gKi9cblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIFNlbGVjdEZpZWxkID0gX3JlcXVpcmUuU2VsZWN0RmllbGQ7XG52YXIgTWVudUl0ZW0gPSBfcmVxdWlyZS5NZW51SXRlbTtcbnZhciBDaGlwID0gX3JlcXVpcmUuQ2hpcDtcblxudmFyIExhbmdVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xudmFyIElucHV0U2VsZWN0Qm94ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnSW5wdXRTZWxlY3RCb3gnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNraXBCdWZmZXJDaGFuZ2VzOiB0cnVlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIG9uRHJvcERvd25DaGFuZ2U6IGZ1bmN0aW9uIG9uRHJvcERvd25DaGFuZ2UoZXZlbnQsIGluZGV4LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKGV2ZW50LCB2YWx1ZSk7XG4gICAgICAgIHRoaXMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICB9LFxuXG4gICAgb25NdWx0aXBsZVNlbGVjdDogZnVuY3Rpb24gb25NdWx0aXBsZVNlbGVjdChldmVudCwgaW5kZXgsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmIChuZXdWYWx1ZSA9PSAtMSkgcmV0dXJuO1xuICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZXMgPSB0eXBlb2YgY3VycmVudFZhbHVlID09PSAnc3RyaW5nJyA/IGN1cnJlbnRWYWx1ZS5zcGxpdCgnLCcpIDogY3VycmVudFZhbHVlO1xuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZXMuaW5kZXhPZihuZXdWYWx1ZSkgIT09IC0xKSB7XG4gICAgICAgICAgICBjdXJyZW50VmFsdWVzLnB1c2gobmV3VmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZShldmVudCwgY3VycmVudFZhbHVlcy5qb2luKCcsJykpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICB9LFxuXG4gICAgb25NdWx0aXBsZVJlbW92ZTogZnVuY3Rpb24gb25NdWx0aXBsZVJlbW92ZSh2YWx1ZSkge1xuICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZXMgPSB0eXBlb2YgY3VycmVudFZhbHVlID09PSAnc3RyaW5nJyA/IGN1cnJlbnRWYWx1ZS5zcGxpdCgnLCcpIDogY3VycmVudFZhbHVlO1xuICAgICAgICBpZiAoY3VycmVudFZhbHVlcy5pbmRleE9mKHZhbHVlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZXMgPSBMYW5nVXRpbHMuYXJyYXlXaXRob3V0KGN1cnJlbnRWYWx1ZXMsIGN1cnJlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSkpO1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZShudWxsLCBjdXJyZW50VmFsdWVzLmpvaW4oJywnKSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgIHZhciBtZW51SXRlbXMgPSBbXSxcbiAgICAgICAgICAgIG11bHRpcGxlT3B0aW9ucyA9IFtdLFxuICAgICAgICAgICAgbWFuZGF0b3J5ID0gdHJ1ZTtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddIHx8IHRoaXMucHJvcHMuYXR0cmlidXRlc1snbWFuZGF0b3J5J10gIT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIG1hbmRhdG9yeSA9IGZhbHNlO1xuICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwgeyB2YWx1ZTogLTEsIHByaW1hcnlUZXh0OiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2xhYmVsJ10gKyAnLi4uJyB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXM7XG5cbiAgICAgICAgY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBtZW51SXRlbXMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVJdGVtLCB7IHZhbHVlOiBrZXksIHByaW1hcnlUZXh0OiB2YWx1ZSB9KSk7XG4gICAgICAgICAgICBtdWx0aXBsZU9wdGlvbnMucHVzaCh7IHZhbHVlOiBrZXksIGxhYmVsOiB2YWx1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLmlzRGlzcGxheUdyaWQoKSAmJiAhdGhpcy5zdGF0ZS5lZGl0TW9kZSB8fCB0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgaWYgKGNob2ljZXMuZ2V0KHZhbHVlKSkgdmFsdWUgPSBjaG9pY2VzLmdldCh2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMuZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRoaXMudG9nZ2xlRWRpdE1vZGUsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgICF2YWx1ZSA/ICdFbXB0eScgOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAnIMKgwqAnLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2ljb24tY2FyZXQtZG93bicgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgaGFzVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm11bHRpcGxlICYmIHRoaXMucHJvcHMubXVsdGlwbGUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmFsdWVzID0gY3VycmVudFZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudFZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZXMgPSBjdXJyZW50VmFsdWUuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBoYXNWYWx1ZSA9IGN1cnJlbnRWYWx1ZXMubGVuZ3RoID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIm11bHRpcGxlIGhhcy12YWx1ZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZXMubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENoaXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgb25SZXF1ZXN0RGVsZXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMub25NdWx0aXBsZVJlbW92ZSh2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgU2VsZWN0RmllbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IC0xLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uTXVsdGlwbGVTZWxlY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBTZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25Ecm9wRG93bkNoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBJbnB1dFNlbGVjdEJveCA9IF9taXhpbnNGaWVsZFdpdGhDaG9pY2VzMlsnZGVmYXVsdCddKElucHV0U2VsZWN0Qm94KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IElucHV0U2VsZWN0Qm94O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX21peGluc0FjdGlvblJ1bm5lck1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0FjdGlvblJ1bm5lck1peGluJyk7XG5cbnZhciBfbWl4aW5zQWN0aW9uUnVubmVyTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zQWN0aW9uUnVubmVyTWl4aW4pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdNb25pdG9yaW5nTGFiZWwnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0FjdGlvblJ1bm5lck1peGluMlsnZGVmYXVsdCddXSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICB2YXIgbG9hZGluZ01lc3NhZ2UgPSAnTG9hZGluZyc7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQgJiYgdGhpcy5jb250ZXh0LmdldE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGxvYWRpbmdNZXNzYWdlID0gdGhpcy5jb250ZXh0LmdldE1lc3NhZ2UoNDY2LCAnJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZ2xvYmFsLnB5ZGlvICYmIGdsb2JhbC5weWRpby5NZXNzYWdlSGFzaCkge1xuICAgICAgICAgICAgbG9hZGluZ01lc3NhZ2UgPSBnbG9iYWwucHlkaW8uTWVzc2FnZUhhc2hbNDY2XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IGxvYWRpbmdNZXNzYWdlIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gKGZ1bmN0aW9uICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzdGF0dXM6IHRyYW5zcG9ydC5yZXNwb25zZVRleHQgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3BvbGxlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmFwcGx5QWN0aW9uKGNhbGxiYWNrKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcG9sbGVyKCk7XG4gICAgICAgIHRoaXMuX3BlID0gZ2xvYmFsLnNldEludGVydmFsKHRoaXMuX3BvbGxlciwgMTAwMDApO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9wZSkge1xuICAgICAgICAgICAgZ2xvYmFsLmNsZWFySW50ZXJ2YWwodGhpcy5fcGUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc3RhdHVzXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNGb3JtTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvRm9ybU1peGluJyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0Zvcm1NaXhpbik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbi8qKlxuICogVGV4dCBpbnB1dCwgY2FuIGJlIHNpbmdsZSBsaW5lLCBtdWx0aUxpbmUsIG9yIHBhc3N3b3JkLCBkZXBlbmRpbmcgb24gdGhlXG4gKiBhdHRyaWJ1dGVzLnR5cGUga2V5LlxuICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdUZXh0RmllbGQnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwbGF5R3JpZCgpICYmICF0aGlzLnN0YXRlLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnICYmIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSAnKioqKioqKioqKionO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IHRoaXMucHJvcHMuZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRoaXMudG9nZ2xlRWRpdE1vZGUsIGNsYXNzTmFtZTogdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgICF2YWx1ZSA/ICdFbXB0eScgOiB2YWx1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBmaWVsZCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuaXNEaXNwbGF5Rm9ybSgpID8gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsIDogbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5lbnRlclRvVG9nZ2xlLFxuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnID8gJ3Bhc3N3b3JkJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgbXVsdGlMaW5lOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3RleHRhcmVhJyxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMucHJvcHMuZXJyb3JUZXh0LFxuICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogJ29mZicsXG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZm9ybScsXG4gICAgICAgICAgICAgICAgICAgIHsgYXV0b0NvbXBsZXRlOiAnb2ZmJywgc3R5bGU6IHsgZGlzcGxheTogJ2lubGluZScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MgPSByZXF1aXJlKCdweWRpby91dGlsL3Bhc3MnKTtcblxudmFyIF9weWRpb1V0aWxQYXNzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbFBhc3MpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG4vKipcbiAqIFRleHQgaW5wdXQsIGNhbiBiZSBzaW5nbGUgbGluZSwgbXVsdGlMaW5lLCBvciBwYXNzd29yZCwgZGVwZW5kaW5nIG9uIHRoZVxuICogYXR0cmlidXRlcy50eXBlIGtleS5cbiAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVmFsaWRMb2dpbicsXG5cbiAgICBtaXhpbnM6IFtfbWl4aW5zRm9ybU1peGluMlsnZGVmYXVsdCddXSxcblxuICAgIHRleHRWYWx1ZUNoYW5nZWQ6IGZ1bmN0aW9uIHRleHRWYWx1ZUNoYW5nZWQoZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgIHZhciBlcnIgPSBfcHlkaW9VdGlsUGFzczJbJ2RlZmF1bHQnXS5pc1ZhbGlkTG9naW4odmFsdWUpO1xuICAgICAgICB2YXIgcHJldlN0YXRlVmFsaWQgPSB0aGlzLnN0YXRlLnZhbGlkO1xuICAgICAgICB2YXIgdmFsaWQgPSAhZXJyO1xuICAgICAgICBpZiAocHJldlN0YXRlVmFsaWQgIT09IHZhbGlkICYmIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKHZhbGlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsaWQ6IHZhbGlkLCBlcnI6IGVyciB9KTtcblxuICAgICAgICB0aGlzLm9uQ2hhbmdlKGV2ZW50LCB2YWx1ZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0aGlzLmlzRGlzcGxheUdyaWQoKSAmJiAhdGhpcy5zdGF0ZS5lZGl0TW9kZSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJyAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gJyoqKioqKioqKioqJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBvbkNsaWNrOiB0aGlzLnByb3BzLmRpc2FibGVkID8gZnVuY3Rpb24gKCkge30gOiB0aGlzLnRvZ2dsZUVkaXRNb2RlLCBjbGFzc05hbWU6IHZhbHVlID8gJycgOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICAhdmFsdWUgPyAnRW1wdHknIDogdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gdGhpcy5zdGF0ZS5lcnI7XG5cbiAgICAgICAgICAgIHZhciBmaWVsZCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuaXNEaXNwbGF5Rm9ybSgpID8gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsIDogbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudGV4dFZhbHVlQ2hhbmdlZChlLCB2KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5lbnRlclRvVG9nZ2xlLFxuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnID8gJ3Bhc3N3b3JkJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgbXVsdGlMaW5lOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3RleHRhcmVhJyxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMucHJvcHMuZXJyb3JUZXh0IHx8IGVycixcbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU6ICdvZmYnLFxuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2Zvcm0nLFxuICAgICAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogJ29mZicsIHN0eWxlOiB7IGRpc3BsYXk6ICdpbmxpbmUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX21peGluc0Zvcm1NaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9Gb3JtTWl4aW4nKTtcblxudmFyIF9taXhpbnNGb3JtTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRm9ybU1peGluKTtcblxudmFyIFBhc3NVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGFzcycpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIFRleHRGaWVsZCA9IF9yZXF1aXJlLlRleHRGaWVsZDtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1ZhbGlkUGFzc3dvcmQnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBpc1ZhbGlkOiBmdW5jdGlvbiBpc1ZhbGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS52YWxpZDtcbiAgICB9LFxuXG4gICAgY2hlY2tNaW5MZW5ndGg6IGZ1bmN0aW9uIGNoZWNrTWluTGVuZ3RoKHZhbHVlKSB7XG4gICAgICAgIHZhciBtaW5MZW5ndGggPSBwYXJzZUludChnbG9iYWwucHlkaW8uZ2V0UGx1Z2luQ29uZmlncyhcImNvcmUuYXV0aFwiKS5nZXQoXCJQQVNTV09SRF9NSU5MRU5HVEhcIikpO1xuICAgICAgICByZXR1cm4gISh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPCBtaW5MZW5ndGgpO1xuICAgIH0sXG5cbiAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2VJZCkge1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0ICYmIHRoaXMuY29udGV4dC5nZXRNZXNzYWdlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmdldE1lc3NhZ2UobWVzc2FnZUlkLCAnJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZ2xvYmFsLnB5ZGlvICYmIGdsb2JhbC5weWRpby5NZXNzYWdlSGFzaCkge1xuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbC5weWRpby5NZXNzYWdlSGFzaFttZXNzYWdlSWRdO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVBhc3NTdGF0ZTogZnVuY3Rpb24gdXBkYXRlUGFzc1N0YXRlKCkge1xuICAgICAgICB2YXIgcHJldlN0YXRlVmFsaWQgPSB0aGlzLnN0YXRlLnZhbGlkO1xuICAgICAgICB2YXIgbmV3U3RhdGUgPSBQYXNzVXRpbHMuZ2V0U3RhdGUodGhpcy5yZWZzLnBhc3MuZ2V0VmFsdWUoKSwgdGhpcy5yZWZzLmNvbmZpcm0gPyB0aGlzLnJlZnMuY29uZmlybS5nZXRWYWx1ZSgpIDogJycpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgICAgaWYgKHByZXZTdGF0ZVZhbGlkICE9PSBuZXdTdGF0ZS52YWxpZCAmJiB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZShuZXdTdGF0ZS52YWxpZCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25QYXNzd29yZENoYW5nZTogZnVuY3Rpb24gb25QYXNzd29yZENoYW5nZShldmVudCkge1xuICAgICAgICB0aGlzLnVwZGF0ZVBhc3NTdGF0ZSgpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKGV2ZW50LCBldmVudC50YXJnZXQudmFsdWUpO1xuICAgIH0sXG5cbiAgICBvbkNvbmZpcm1DaGFuZ2U6IGZ1bmN0aW9uIG9uQ29uZmlybUNoYW5nZShldmVudCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybVZhbHVlOiBldmVudC50YXJnZXQudmFsdWUgfSk7XG4gICAgICAgIHRoaXMudXBkYXRlUGFzc1N0YXRlKCk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoZXZlbnQsIHRoaXMuc3RhdGUudmFsdWUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwbGF5R3JpZCgpICYmICF0aGlzLnN0YXRlLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBvbkNsaWNrOiB0aGlzLnByb3BzLmRpc2FibGVkID8gZnVuY3Rpb24gKCkge30gOiB0aGlzLnRvZ2dsZUVkaXRNb2RlLCBjbGFzc05hbWU6IHZhbHVlID8gJycgOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICAhdmFsdWUgPyAnRW1wdHknIDogdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgb3ZlcmZsb3cgPSB7IG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJywgd2lkdGg6ICcxMDAlJyB9O1xuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IHRoaXMuc3RhdGUudmFsaWQgPyAnJyA6ICdtdWktZXJyb3ItYXMtaGludCc7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGlzLnByb3BzLmNsYXNzTmFtZSArICcgJyArIGNsYXNzTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBfY29uZmlybSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnZhbHVlICYmICF0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgX2NvbmZpcm0gPSBbUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBrZXk6ICdzZXAnLCBzdHlsZTogeyB3aWR0aDogMjAgfSB9KSwgUmVhY3QuY3JlYXRlRWxlbWVudChUZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnY29uZmlybScsXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ2NvbmZpcm0nLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5nZXRNZXNzYWdlKDE5OSksXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxTaHJpbmtTdHlsZTogX2V4dGVuZHMoe30sIG92ZXJmbG93LCB7IHdpZHRoOiAnMTMwJScgfSksXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxTdHlsZTogb3ZlcmZsb3csXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5jb25maXJtVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ29uZmlybUNoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlMaW5lOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMuc3RhdGUuY29uZmlybUVycm9yVGV4dFxuICAgICAgICAgICAgICAgIH0pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogJ29mZicgfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIG1hcmdpblRvcDogLTE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ3Bhc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuaXNEaXNwbGF5Rm9ybSgpID8gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxTaHJpbmtTdHlsZTogX2V4dGVuZHMoe30sIG92ZXJmbG93LCB7IHdpZHRoOiAnMTMwJScgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsU3R5bGU6IG92ZXJmbG93LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBjbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uUGFzc3dvcmRDaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuZW50ZXJUb1RvZ2dsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aUxpbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMuc3RhdGUucGFzc0Vycm9yVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX2NvbmZpcm1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNIZWxwZXJNaXhpbiA9IHJlcXVpcmUoJy4vbWl4aW5zL0hlbHBlck1peGluJyk7XG5cbnZhciBfbWl4aW5zSGVscGVyTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zSGVscGVyTWl4aW4pO1xuXG52YXIgX21hbmFnZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyL01hbmFnZXInKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYW5hZ2VyTWFuYWdlcik7XG5cbnZhciBfZmllbGRzVGV4dEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZHMvVGV4dEZpZWxkJyk7XG5cbnZhciBfZmllbGRzVGV4dEZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc1RleHRGaWVsZCk7XG5cbnZhciBfZmllbGRzVmFsaWRQYXNzd29yZCA9IHJlcXVpcmUoJy4vZmllbGRzL1ZhbGlkUGFzc3dvcmQnKTtcblxudmFyIF9maWVsZHNWYWxpZFBhc3N3b3JkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc1ZhbGlkUGFzc3dvcmQpO1xuXG52YXIgX2ZpZWxkc0lucHV0SW50ZWdlciA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0SW50ZWdlcicpO1xuXG52YXIgX2ZpZWxkc0lucHV0SW50ZWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dEludGVnZXIpO1xuXG52YXIgX2ZpZWxkc0lucHV0Qm9vbGVhbiA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0Qm9vbGVhbicpO1xuXG52YXIgX2ZpZWxkc0lucHV0Qm9vbGVhbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dEJvb2xlYW4pO1xuXG52YXIgX2ZpZWxkc0lucHV0QnV0dG9uID0gcmVxdWlyZSgnLi9maWVsZHMvSW5wdXRCdXR0b24nKTtcblxudmFyIF9maWVsZHNJbnB1dEJ1dHRvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dEJ1dHRvbik7XG5cbnZhciBfZmllbGRzTW9uaXRvcmluZ0xhYmVsID0gcmVxdWlyZSgnLi9maWVsZHMvTW9uaXRvcmluZ0xhYmVsJyk7XG5cbnZhciBfZmllbGRzTW9uaXRvcmluZ0xhYmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc01vbml0b3JpbmdMYWJlbCk7XG5cbnZhciBfZmllbGRzSW5wdXRTZWxlY3RCb3ggPSByZXF1aXJlKCcuL2ZpZWxkcy9JbnB1dFNlbGVjdEJveCcpO1xuXG52YXIgX2ZpZWxkc0lucHV0U2VsZWN0Qm94MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0lucHV0U2VsZWN0Qm94KTtcblxudmFyIF9maWVsZHNBdXRvY29tcGxldGVCb3ggPSByZXF1aXJlKCcuL2ZpZWxkcy9BdXRvY29tcGxldGVCb3gnKTtcblxudmFyIF9maWVsZHNBdXRvY29tcGxldGVCb3gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzQXV0b2NvbXBsZXRlQm94KTtcblxudmFyIF9maWVsZHNJbnB1dEltYWdlID0gcmVxdWlyZSgnLi9maWVsZHMvSW5wdXRJbWFnZScpO1xuXG52YXIgX2ZpZWxkc0lucHV0SW1hZ2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRJbWFnZSk7XG5cbnZhciBfcGFuZWxGb3JtUGFuZWwgPSByZXF1aXJlKCcuL3BhbmVsL0Zvcm1QYW5lbCcpO1xuXG52YXIgX3BhbmVsRm9ybVBhbmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhbmVsRm9ybVBhbmVsKTtcblxudmFyIF9wYW5lbEZvcm1IZWxwZXIgPSByZXF1aXJlKCcuL3BhbmVsL0Zvcm1IZWxwZXInKTtcblxudmFyIF9wYW5lbEZvcm1IZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcGFuZWxGb3JtSGVscGVyKTtcblxudmFyIF9maWVsZHNGaWxlRHJvcHpvbmUgPSByZXF1aXJlKCcuL2ZpZWxkcy9GaWxlRHJvcHpvbmUnKTtcblxudmFyIF9maWVsZHNGaWxlRHJvcHpvbmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzRmlsZURyb3B6b25lKTtcblxudmFyIF9maWVsZHNBdXRvY29tcGxldGVUcmVlID0gcmVxdWlyZSgnLi9maWVsZHMvQXV0b2NvbXBsZXRlVHJlZScpO1xuXG52YXIgX2ZpZWxkc0F1dG9jb21wbGV0ZVRyZWUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzQXV0b2NvbXBsZXRlVHJlZSk7XG5cbnZhciBQeWRpb0Zvcm0gPSB7XG4gIEhlbHBlck1peGluOiBfbWl4aW5zSGVscGVyTWl4aW4yWydkZWZhdWx0J10sXG4gIE1hbmFnZXI6IF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRUZXh0OiBfZmllbGRzVGV4dEZpZWxkMlsnZGVmYXVsdCddLFxuICBWYWxpZFBhc3N3b3JkOiBfZmllbGRzVmFsaWRQYXNzd29yZDJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRCb29sZWFuOiBfZmllbGRzSW5wdXRCb29sZWFuMlsnZGVmYXVsdCddLFxuICBJbnB1dEludGVnZXI6IF9maWVsZHNJbnB1dEludGVnZXIyWydkZWZhdWx0J10sXG4gIElucHV0QnV0dG9uOiBfZmllbGRzSW5wdXRCdXR0b24yWydkZWZhdWx0J10sXG4gIE1vbml0b3JpbmdMYWJlbDogX2ZpZWxkc01vbml0b3JpbmdMYWJlbDJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRTZWxlY3RCb3g6IF9maWVsZHNJbnB1dFNlbGVjdEJveDJbJ2RlZmF1bHQnXSxcbiAgQXV0b2NvbXBsZXRlQm94OiBfZmllbGRzQXV0b2NvbXBsZXRlQm94MlsnZGVmYXVsdCddLFxuICBBdXRvY29tcGxldGVUcmVlOiBfZmllbGRzQXV0b2NvbXBsZXRlVHJlZTJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRJbWFnZTogX2ZpZWxkc0lucHV0SW1hZ2UyWydkZWZhdWx0J10sXG4gIEZvcm1QYW5lbDogX3BhbmVsRm9ybVBhbmVsMlsnZGVmYXVsdCddLFxuICBQeWRpb0hlbHBlcjogX3BhbmVsRm9ybUhlbHBlcjJbJ2RlZmF1bHQnXSxcbiAgRmlsZURyb3Bab25lOiBfZmllbGRzRmlsZURyb3B6b25lMlsnZGVmYXVsdCddLFxuICBjcmVhdGVGb3JtRWxlbWVudDogX21hbmFnZXJNYW5hZ2VyMlsnZGVmYXVsdCddLmNyZWF0ZUZvcm1FbGVtZW50XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQeWRpb0Zvcm07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX2ZpZWxkc1ZhbGlkTG9naW4gPSByZXF1aXJlKCcuLi9maWVsZHMvVmFsaWRMb2dpbicpO1xuXG52YXIgX2ZpZWxkc1ZhbGlkTG9naW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzVmFsaWRMb2dpbik7XG5cbnZhciBYTUxVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwveG1sJyk7XG52YXIgSW5wdXRCb29sZWFuID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvSW5wdXRCb29sZWFuJyk7XG52YXIgSW5wdXRUZXh0ID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvVGV4dEZpZWxkJyk7XG52YXIgVmFsaWRQYXNzd29yZCA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL1ZhbGlkUGFzc3dvcmQnKTtcbnZhciBJbnB1dEludGVnZXIgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9JbnB1dEludGVnZXInKTtcbnZhciBJbnB1dEJ1dHRvbiA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0lucHV0QnV0dG9uJyk7XG52YXIgTW9uaXRvcmluZ0xhYmVsID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvTW9uaXRvcmluZ0xhYmVsJyk7XG52YXIgSW5wdXRJbWFnZSA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0lucHV0SW1hZ2UnKTtcbnZhciBTZWxlY3RCb3ggPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9JbnB1dFNlbGVjdEJveCcpO1xudmFyIEF1dG9jb21wbGV0ZUJveCA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0F1dG9jb21wbGV0ZUJveCcpO1xudmFyIEF1dG9jb21wbGV0ZVRyZWUgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9BdXRvY29tcGxldGVUcmVlJyk7XG5cbi8qKlxuICogVXRpbGl0eSBjbGFzcyB0byBwYXJzZSAvIGhhbmRsZSBweWRpbyBzdGFuZGFyZCBmb3JtIGRlZmluaXRpb25zL3ZhbHVlcy5cbiAqL1xuXG52YXIgTWFuYWdlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTWFuYWdlcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1hbmFnZXIpO1xuICAgIH1cblxuICAgIE1hbmFnZXIuaGFzSGVscGVyID0gZnVuY3Rpb24gaGFzSGVscGVyKHBsdWdpbklkLCBwYXJhbU5hbWUpIHtcblxuICAgICAgICB2YXIgaGVscGVycyA9IE1hbmFnZXIuZ2V0SGVscGVyc0NhY2hlKCk7XG4gICAgICAgIHJldHVybiBoZWxwZXJzW3BsdWdpbklkXSAmJiBoZWxwZXJzW3BsdWdpbklkXVsncGFyYW1ldGVycyddW3BhcmFtTmFtZV07XG4gICAgfTtcblxuICAgIE1hbmFnZXIuZ2V0SGVscGVyc0NhY2hlID0gZnVuY3Rpb24gZ2V0SGVscGVyc0NhY2hlKCkge1xuICAgICAgICBpZiAoIU1hbmFnZXIuSEVMUEVSU19DQUNIRSkge1xuICAgICAgICAgICAgdmFyIGhlbHBlckNhY2hlID0ge307XG4gICAgICAgICAgICB2YXIgaGVscGVycyA9IFhNTFV0aWxzLlhQYXRoU2VsZWN0Tm9kZXMod2luZG93LnB5ZGlvLlJlZ2lzdHJ5LmdldFhNTCgpLCAncGx1Z2lucy8qL2NsaWVudF9zZXR0aW5ncy9yZXNvdXJjZXMvanNbQHR5cGU9XCJoZWxwZXJcIl0nKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGVscGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBoZWxwZXJOb2RlID0gaGVscGVyc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgcGx1Z2luID0gaGVscGVyTm9kZS5nZXRBdHRyaWJ1dGUoXCJwbHVnaW5cIik7XG4gICAgICAgICAgICAgICAgaGVscGVyQ2FjaGVbcGx1Z2luXSA9IHsgbmFtZXNwYWNlOiBoZWxwZXJOb2RlLmdldEF0dHJpYnV0ZSgnY2xhc3NOYW1lJyksIHBhcmFtZXRlcnM6IHt9IH07XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtTm9kZXMgPSBYTUxVdGlscy5YUGF0aFNlbGVjdE5vZGVzKGhlbHBlck5vZGUsICdwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHBhcmFtTm9kZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtTm9kZSA9IHBhcmFtTm9kZXNba107XG4gICAgICAgICAgICAgICAgICAgIGhlbHBlckNhY2hlW3BsdWdpbl1bJ3BhcmFtZXRlcnMnXVtwYXJhbU5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNYW5hZ2VyLkhFTFBFUlNfQ0FDSEUgPSBoZWxwZXJDYWNoZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWFuYWdlci5IRUxQRVJTX0NBQ0hFO1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLnBhcnNlUGFyYW1ldGVycyA9IGZ1bmN0aW9uIHBhcnNlUGFyYW1ldGVycyh4bWxEb2N1bWVudCwgcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIFhNTFV0aWxzLlhQYXRoU2VsZWN0Tm9kZXMoeG1sRG9jdW1lbnQsIHF1ZXJ5KS5tYXAoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gTWFuYWdlci5wYXJhbWV0ZXJOb2RlVG9IYXNoKG5vZGUpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgTWFuYWdlci5wYXJhbWV0ZXJOb2RlVG9IYXNoID0gZnVuY3Rpb24gcGFyYW1ldGVyTm9kZVRvSGFzaChwYXJhbU5vZGUpIHtcbiAgICAgICAgdmFyIHBhcmFtc0F0dHMgPSBwYXJhbU5vZGUuYXR0cmlidXRlcztcbiAgICAgICAgdmFyIHBhcmFtc09iamVjdCA9IHt9O1xuICAgICAgICBpZiAocGFyYW1Ob2RlLnBhcmVudE5vZGUgJiYgcGFyYW1Ob2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZSAmJiBwYXJhbU5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgcGFyYW1zT2JqZWN0W1wicGx1Z2luSWRcIl0gPSBwYXJhbU5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcImlkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb2xsZWN0Q2RhdGEgPSBmYWxzZTtcbiAgICAgICAgdmFyIE1lc3NhZ2VIYXNoID0gZ2xvYmFsLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zQXR0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGF0dE5hbWUgPSBwYXJhbXNBdHRzLml0ZW0oaSkubm9kZU5hbWU7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJhbXNBdHRzLml0ZW0oaSkudmFsdWU7XG4gICAgICAgICAgICBpZiAoKGF0dE5hbWUgPT09IFwibGFiZWxcIiB8fCBhdHROYW1lID09PSBcImRlc2NyaXB0aW9uXCIgfHwgYXR0TmFtZSA9PT0gXCJncm91cFwiIHx8IGF0dE5hbWUuaW5kZXhPZihcImdyb3VwX3N3aXRjaF9cIikgPT09IDApICYmIE1lc3NhZ2VIYXNoW3ZhbHVlXSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gTWVzc2FnZUhhc2hbdmFsdWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGF0dE5hbWUgPT09IFwiY2RhdGF2YWx1ZVwiKSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdENkYXRhID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmFtc09iamVjdFthdHROYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2xsZWN0Q2RhdGEpIHtcbiAgICAgICAgICAgIHBhcmFtc09iamVjdFsndmFsdWUnXSA9IHBhcmFtTm9kZS5maXJzdENoaWxkLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbXNPYmplY3RbJ3R5cGUnXSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zT2JqZWN0Wyd2YWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPSBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPT09IFwidHJ1ZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsnZGVmYXVsdCddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSA9IHBhcmFtc09iamVjdFsnZGVmYXVsdCddID09PSBcInRydWVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXNPYmplY3RbJ3R5cGUnXSA9PT0gJ2ludGVnZXInKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zT2JqZWN0Wyd2YWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPSBwYXJzZUludChwYXJhbXNPYmplY3RbJ3ZhbHVlJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsnZGVmYXVsdCddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSA9IHBhcnNlSW50KHBhcmFtc09iamVjdFsnZGVmYXVsdCddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyYW1zT2JqZWN0O1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLmNyZWF0ZUZvcm1FbGVtZW50ID0gZnVuY3Rpb24gY3JlYXRlRm9ybUVsZW1lbnQocHJvcHMpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBzd2l0Y2ggKHByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSkge1xuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KElucHV0Qm9vbGVhbiwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIGNhc2UgJ3RleHRhcmVhJzpcbiAgICAgICAgICAgIGNhc2UgJ3Bhc3N3b3JkJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoSW5wdXRUZXh0LCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2YWxpZC1wYXNzd29yZCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFZhbGlkUGFzc3dvcmQsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZhbGlkLWxvZ2luJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX2ZpZWxkc1ZhbGlkTG9naW4yWydkZWZhdWx0J10sIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChJbnB1dEludGVnZXIsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2J1dHRvbic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KElucHV0QnV0dG9uLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtb25pdG9yJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9uaXRvcmluZ0xhYmVsLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbWFnZSc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KElucHV0SW1hZ2UsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFNlbGVjdEJveCwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXV0b2NvbXBsZXRlJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXV0b2NvbXBsZXRlQm94LCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhdXRvY29tcGxldGUtdHJlZSc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KEF1dG9jb21wbGV0ZVRyZWUsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2xlZ2VuZCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaGlkZGVuJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmIChwcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHByb3BzLnZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdFbXB0eSdcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLlNsYXNoZXNUb0pzb24gPSBmdW5jdGlvbiBTbGFzaGVzVG9Kc29uKHZhbHVlcykge1xuICAgICAgICBpZiAodmFsdWVzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHZhbHVlcyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld1ZhbHVlcyA9IHt9O1xuICAgICAgICB2YXIgcmVjdXJzZU9uS2V5cyA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyh2YWx1ZXMpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdmFsdWVzW2tdO1xuICAgICAgICAgICAgaWYgKGsuaW5kZXhPZignLycpID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IGsuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICB2YXIgZmlyc3RQYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdFBhcnQgPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdWYWx1ZXNbZmlyc3RQYXJ0XSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNbZmlyc3RQYXJ0XSA9IHt9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5ld1ZhbHVlc1tmaXJzdFBhcnRdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNbZmlyc3RQYXJ0XSA9IHsgJ0B2YWx1ZSc6IG5ld1ZhbHVlc1tmaXJzdFBhcnRdIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1tmaXJzdFBhcnRdW2xhc3RQYXJ0XSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgcmVjdXJzZU9uS2V5c1tmaXJzdFBhcnRdID0gZmlyc3RQYXJ0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVzW2tdICYmIHR5cGVvZiBuZXdWYWx1ZXNba10gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1trXVsnQHZhbHVlJ10gPSBkYXRhO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1trXSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmtleXMocmVjdXJzZU9uS2V5cykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlc1trZXldID0gTWFuYWdlci5TbGFzaGVzVG9Kc29uKG5ld1ZhbHVlc1trZXldKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZXM7XG4gICAgfTtcblxuICAgIE1hbmFnZXIuSnNvblRvU2xhc2hlcyA9IGZ1bmN0aW9uIEpzb25Ub1NsYXNoZXModmFsdWVzKSB7XG4gICAgICAgIHZhciBwcmVmaXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB2YXIgbmV3VmFsdWVzID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKHZhbHVlcykuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXNba10gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YlZhbHVlcyA9IE1hbmFnZXIuSnNvblRvU2xhc2hlcyh2YWx1ZXNba10sIHByZWZpeCArIGsgKyAnLycpO1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlcyA9IF9leHRlbmRzKHt9LCBuZXdWYWx1ZXMsIHN1YlZhbHVlcyk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlc1trXVsnQHZhbHVlJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVzW3ByZWZpeCArIGtdID0gdmFsdWVzW2tdWydAdmFsdWUnXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1twcmVmaXggKyBrXSA9IHZhbHVlc1trXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogRXh0cmFjdCBQT1NULXJlYWR5IHZhbHVlcyBmcm9tIGEgY29tYm8gcGFyYW1ldGVycy92YWx1ZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkZWZpbml0aW9ucyBBcnJheSBTdGFuZGFyZCBGb3JtIERlZmluaXRpb24gYXJyYXlcbiAgICAgKiBAcGFyYW0gdmFsdWVzIE9iamVjdCBLZXkvVmFsdWVzIG9mIHRoZSBjdXJyZW50IGZvcm1cbiAgICAgKiBAcGFyYW0gcHJlZml4IFN0cmluZyBPcHRpb25hbCBwcmVmaXggdG8gYWRkIHRvIGFsbCBwYXJhbWV0ZXJzIChieSBkZWZhdWx0IERSSVZFUl9PUFRJT05fKS5cbiAgICAgKiBAcmV0dXJucyBPYmplY3QgT2JqZWN0IHdpdGggYWxsIHB5ZGlvLWNvbXBhdGlibGUgUE9TVCBwYXJhbWV0ZXJzXG4gICAgICovXG5cbiAgICBNYW5hZ2VyLmdldFZhbHVlc0ZvclBPU1QgPSBmdW5jdGlvbiBnZXRWYWx1ZXNGb3JQT1NUKGRlZmluaXRpb25zLCB2YWx1ZXMpIHtcbiAgICAgICAgdmFyIHByZWZpeCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/ICdEUklWRVJfT1BUSU9OXycgOiBhcmd1bWVudHNbMl07XG4gICAgICAgIHZhciBhZGRpdGlvbmFsTWV0YWRhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzNdO1xuXG4gICAgICAgIHZhciBjbGllbnRQYXJhbXMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHZhbHVlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgY2xpZW50UGFyYW1zW3ByZWZpeCArIGtleV0gPSB2YWx1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICB2YXIgZGVmVHlwZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZCA9IDA7IGQgPCBkZWZpbml0aW9ucy5sZW5ndGg7IGQrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmaW5pdGlvbnNbZF1bJ25hbWUnXSA9PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZlR5cGUgPSBkZWZpbml0aW9uc1tkXVsndHlwZSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFkZWZUeXBlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnRzID0ga2V5LnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0LCBwcmV2O1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCA9IHBhcnRzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldiA9IHBhcnRzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZGVmaW5pdGlvbnMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVmaW5pdGlvbnNba11bJ25hbWUnXSA9PSBsYXN0ICYmIGRlZmluaXRpb25zW2tdWydncm91cF9zd2l0Y2hfbmFtZSddICYmIGRlZmluaXRpb25zW2tdWydncm91cF9zd2l0Y2hfbmFtZSddID09IHByZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmVHlwZSA9IGRlZmluaXRpb25zW2tdWyd0eXBlJ107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlZmluaXRpb25zW2tdWyduYW1lJ10gPT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZlR5cGUgPSBkZWZpbml0aW9uc1trXVsndHlwZSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9kZWZpbml0aW9ucy5tYXAoZnVuY3Rpb24oZCl7aWYoZC5uYW1lID09IHRoZUtleSkgZGVmVHlwZSA9IGQudHlwZX0pO1xuICAgICAgICAgICAgICAgIGlmIChkZWZUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWZUeXBlID09IFwiaW1hZ2VcIikgZGVmVHlwZSA9IFwiYmluYXJ5XCI7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtc1twcmVmaXggKyBrZXkgKyAnX2FqeHB0eXBlJ10gPSBkZWZUeXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYWRkaXRpb25hbE1ldGFkYXRhICYmIGFkZGl0aW9uYWxNZXRhZGF0YVtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIG1ldGEgaW4gYWRkaXRpb25hbE1ldGFkYXRhW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhZGRpdGlvbmFsTWV0YWRhdGFba2V5XS5oYXNPd25Qcm9wZXJ0eShtZXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtc1twcmVmaXggKyBrZXkgKyAnXycgKyBtZXRhXSA9IGFkZGl0aW9uYWxNZXRhZGF0YVtrZXldW21ldGFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVvcmRlciB0cmVlIGtleXNcbiAgICAgICAgdmFyIGFsbEtleXMgPSBPYmplY3Qua2V5cyhjbGllbnRQYXJhbXMpO1xuICAgICAgICBhbGxLZXlzLnNvcnQoKTtcbiAgICAgICAgYWxsS2V5cy5yZXZlcnNlKCk7XG4gICAgICAgIHZhciB0cmVlS2V5cyA9IHt9O1xuICAgICAgICBhbGxLZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoXCIvXCIpID09PSAtMSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGtleS5lbmRzV2l0aChcIl9hanhwdHlwZVwiKSkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHR5cGVLZXkgPSBrZXkgKyBcIl9hanhwdHlwZVwiO1xuICAgICAgICAgICAgdmFyIHBhcnRzID0ga2V5LnNwbGl0KFwiL1wiKTtcbiAgICAgICAgICAgIHZhciBwYXJlbnROYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciBwYXJlbnRLZXk7XG4gICAgICAgICAgICB3aGlsZSAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghcGFyZW50S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleSA9IHRyZWVLZXlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXBhcmVudEtleVtwYXJlbnROYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV0gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFyZW50S2V5ID0gcGFyZW50S2V5W3BhcmVudE5hbWVdO1xuICAgICAgICAgICAgICAgIHBhcmVudE5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHR5cGUgPSBjbGllbnRQYXJhbXNbdHlwZUtleV07XG4gICAgICAgICAgICBkZWxldGUgY2xpZW50UGFyYW1zW3R5cGVLZXldO1xuICAgICAgICAgICAgaWYgKHBhcmVudEtleSAmJiAhcGFyZW50S2V5W3BhcmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHYgPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdID0gdiA9PSBcInRydWVcIiB8fCB2ID09IDEgfHwgdiA9PT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJpbnRlZ2VyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdID0gcGFyc2VJbnQoY2xpZW50UGFyYW1zW2tleV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSAmJiB0eXBlLnN0YXJ0c1dpdGgoXCJncm91cF9zd2l0Y2g6XCIpICYmIHR5cGVvZiBjbGllbnRQYXJhbXNba2V5XSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXSA9IHsgZ3JvdXBfc3dpdGNoX3ZhbHVlOiBjbGllbnRQYXJhbXNba2V5XSB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXSA9IGNsaWVudFBhcmFtc1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyZW50S2V5ICYmIHR5cGUgJiYgdHlwZS5zdGFydHNXaXRoKCdncm91cF9zd2l0Y2g6JykpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV1bXCJncm91cF9zd2l0Y2hfdmFsdWVcIl0gPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAoa2V5IGluIHRyZWVLZXlzKSB7XG4gICAgICAgICAgICBpZiAoIXRyZWVLZXlzLmhhc093blByb3BlcnR5KGtleSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgdmFyIHRyZWVWYWx1ZSA9IHRyZWVLZXlzW2tleV07XG4gICAgICAgICAgICBpZiAoY2xpZW50UGFyYW1zW2tleSArICdfYWp4cHR5cGUnXSAmJiBjbGllbnRQYXJhbXNba2V5ICsgJ19hanhwdHlwZSddLmluZGV4T2YoJ2dyb3VwX3N3aXRjaDonKSA9PT0gMCAmJiAhdHJlZVZhbHVlWydncm91cF9zd2l0Y2hfdmFsdWUnXSkge1xuICAgICAgICAgICAgICAgIHRyZWVWYWx1ZVsnZ3JvdXBfc3dpdGNoX3ZhbHVlJ10gPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xpZW50UGFyYW1zW2tleV0gPSBKU09OLnN0cmluZ2lmeSh0cmVlVmFsdWUpO1xuICAgICAgICAgICAgY2xpZW50UGFyYW1zW2tleSArICdfYWp4cHR5cGUnXSA9IFwidGV4dC9qc29uXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhbiBYWFhfZ3JvdXBfc3dpdGNoIHBhcmFtZXRlcnNcbiAgICAgICAgZm9yICh2YXIgdGhlS2V5IGluIGNsaWVudFBhcmFtcykge1xuICAgICAgICAgICAgaWYgKCFjbGllbnRQYXJhbXMuaGFzT3duUHJvcGVydHkodGhlS2V5KSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGlmICh0aGVLZXkuaW5kZXhPZihcIi9cIikgPT0gLTEgJiYgY2xpZW50UGFyYW1zW3RoZUtleV0gJiYgY2xpZW50UGFyYW1zW3RoZUtleSArIFwiX2FqeHB0eXBlXCJdICYmIGNsaWVudFBhcmFtc1t0aGVLZXkgKyBcIl9hanhwdHlwZVwiXS5zdGFydHNXaXRoKFwiZ3JvdXBfc3dpdGNoOlwiKSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2xpZW50UGFyYW1zW3RoZUtleV0gPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICBjbGllbnRQYXJhbXNbdGhlS2V5XSA9IEpTT04uc3RyaW5naWZ5KHsgZ3JvdXBfc3dpdGNoX3ZhbHVlOiBjbGllbnRQYXJhbXNbdGhlS2V5XSB9KTtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50UGFyYW1zW3RoZUtleSArIFwiX2FqeHB0eXBlXCJdID0gXCJ0ZXh0L2pzb25cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2xpZW50UGFyYW1zLmhhc093blByb3BlcnR5KHRoZUtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhlS2V5LmVuZHNXaXRoKFwiX2dyb3VwX3N3aXRjaFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY2xpZW50UGFyYW1zW3RoZUtleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNsaWVudFBhcmFtcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIE1hbmFnZXI7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNYW5hZ2VyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUGF0aFV0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBhdHRyaWJ1dGVzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIGFwcGx5QnV0dG9uQWN0aW9uOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgYWN0aW9uQ2FsbGJhY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgfSxcblxuICAgIGFwcGx5QWN0aW9uOiBmdW5jdGlvbiBhcHBseUFjdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2hvaWNlc1ZhbHVlID0gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10uc3BsaXQoXCI6XCIpO1xuICAgICAgICB2YXIgZmlyc3RQYXJ0ID0gY2hvaWNlc1ZhbHVlLnNoaWZ0KCk7XG4gICAgICAgIGlmIChmaXJzdFBhcnQgPT09IFwicnVuX2NsaWVudF9hY3Rpb25cIiAmJiBnbG9iYWwucHlkaW8pIHtcbiAgICAgICAgICAgIGdsb2JhbC5weWRpby5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbihjaG9pY2VzVmFsdWUuc2hpZnQoKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0geyBhY3Rpb246IGZpcnN0UGFydCB9O1xuICAgICAgICAgICAgaWYgKGNob2ljZXNWYWx1ZS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyc1snYWN0aW9uX3BsdWdpbl9pZCddID0gY2hvaWNlc1ZhbHVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyc1snYWN0aW9uX3BsdWdpbl9tZXRob2QnXSA9IGNob2ljZXNWYWx1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1snbmFtZSddLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnNbJ2J1dHRvbl9rZXknXSA9IFBhdGhVdGlscy5nZXREaXJuYW1lKHRoaXMucHJvcHMuYXR0cmlidXRlc1snbmFtZSddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24ocGFyYW1ldGVycywgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBDb21wb25lbnQgPSBfcmVxdWlyZS5Db21wb25lbnQ7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBQeWRpb0NvbnRleHRDb25zdW1lciA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuUHlkaW9Db250ZXh0Q29uc3VtZXI7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChQeWRpb0NvbXBvbmVudCkge1xuICAgIHZhciBGaWVsZFdpdGhDaG9pY2VzID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgICAgIF9pbmhlcml0cyhGaWVsZFdpdGhDaG9pY2VzLCBfQ29tcG9uZW50KTtcblxuICAgICAgICBGaWVsZFdpdGhDaG9pY2VzLnByb3RvdHlwZS5sb2FkRXh0ZXJuYWxWYWx1ZXMgPSBmdW5jdGlvbiBsb2FkRXh0ZXJuYWxWYWx1ZXMoY2hvaWNlcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICAgICAgdmFyIHBhcnNlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIHZhciBsaXN0X2FjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25DaG9pY2VzTG9hZGVkKSB0aGlzLm9uQ2hvaWNlc0xvYWRlZChjaG9pY2VzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBjaG9pY2VzOiBjaG9pY2VzLCBwYXJzZWQ6IHBhcnNlZCB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgaWYgKGNob2ljZXMuaW5kZXhPZignanNvbl9maWxlOicpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcGFyc2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGlzdF9hY3Rpb24gPSBjaG9pY2VzLnJlcGxhY2UoJ2pzb25fZmlsZTonLCAnJyk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnNldCgnMCcsIHB5ZGlvLk1lc3NhZ2VIYXNoWydhanhwX2FkbWluLmhvbWUuNiddKTtcbiAgICAgICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5sb2FkRmlsZShsaXN0X2FjdGlvbiwgZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3T3V0cHV0ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNwb3J0LnJlc3BvbnNlSlNPTikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0LnJlc3BvbnNlSlNPTi5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld091dHB1dC5zZXQoZW50cnkua2V5LCBlbnRyeS5sYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmFuc3BvcnQucmVzcG9uc2VUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UodHJhbnNwb3J0LnJlc3BvbnNlVGV4dCkuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T3V0cHV0LnNldChlbnRyeS5rZXksIGVudHJ5LmxhYmVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgcGFyc2luZyBsaXN0ICcgKyBjaG9pY2VzLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGNob2ljZXM6IG5ld091dHB1dCB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMub25DaG9pY2VzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMub25DaG9pY2VzTG9hZGVkKG5ld091dHB1dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2VzID09PSBcIlBZRElPX0FWQUlMQUJMRV9MQU5HVUFHRVNcIikge1xuICAgICAgICAgICAgICAgIHB5ZGlvLmxpc3RMYW5ndWFnZXNXaXRoQ2FsbGJhY2soZnVuY3Rpb24gKGtleSwgbGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnNldChrZXksIGxhYmVsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkNob2ljZXNMb2FkZWQpIHRoaXMub25DaG9pY2VzTG9hZGVkKG91dHB1dCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNob2ljZXMgPT09IFwiUFlESU9fQVZBSUxBQkxFX1JFUE9TSVRPUklFU1wiKSB7XG4gICAgICAgICAgICAgICAgaWYgKHB5ZGlvLnVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8udXNlci5yZXBvc2l0b3JpZXMuZm9yRWFjaChmdW5jdGlvbiAocmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcG9zaXRvcnkuZ2V0UmVwb3NpdG9yeVR5cGUoKSAhPT0gXCJjZWxsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQuc2V0KHJlcG9zaXRvcnkuZ2V0SWQoKSwgcmVwb3NpdG9yeS5nZXRMYWJlbCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQ2hvaWNlc0xvYWRlZCkgdGhpcy5vbkNob2ljZXNMb2FkZWQob3V0cHV0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUGFyc2Ugc3RyaW5nIGFuZCByZXR1cm4gbWFwXG4gICAgICAgICAgICAgICAgY2hvaWNlcy5zcGxpdChcIixcIikubWFwKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsID0gY2hvaWNlLnNwbGl0KCd8Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbFswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gbFsxXTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbGFiZWwgPSBjaG9pY2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGdsb2JhbC5weWRpby5NZXNzYWdlSGFzaFtsYWJlbF0pIGxhYmVsID0gZ2xvYmFsLnB5ZGlvLk1lc3NhZ2VIYXNoW2xhYmVsXTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnNldCh2YWx1ZSwgbGFiZWwpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgY2hvaWNlczogb3V0cHV0LCBwYXJzZWQ6IHBhcnNlZCB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIEZpZWxkV2l0aENob2ljZXMocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGaWVsZFdpdGhDaG9pY2VzKTtcblxuICAgICAgICAgICAgX0NvbXBvbmVudC5jYWxsKHRoaXMsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIHZhciBjaG9pY2VzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgY2hvaWNlcy5zZXQoJzAnLCB0aGlzLnByb3BzLnB5ZGlvID8gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnYWp4cF9hZG1pbi5ob21lLjYnXSA6ICcgLi4uICcpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHsgY2hvaWNlczogY2hvaWNlcywgY2hvaWNlc1BhcnNlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIEZpZWxkV2l0aENob2ljZXMucHJvdG90eXBlLmNvbXBvbmVudERpZE1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10pIHtcbiAgICAgICAgICAgICAgICB2YXIgX2xvYWRFeHRlcm5hbFZhbHVlcyA9IHRoaXMubG9hZEV4dGVybmFsVmFsdWVzKHRoaXMucHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddKTtcblxuICAgICAgICAgICAgICAgIHZhciBjaG9pY2VzID0gX2xvYWRFeHRlcm5hbFZhbHVlcy5jaG9pY2VzO1xuICAgICAgICAgICAgICAgIHZhciBwYXJzZWQgPSBfbG9hZEV4dGVybmFsVmFsdWVzLnBhcnNlZDtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjaG9pY2VzOiBjaG9pY2VzLCBjaG9pY2VzUGFyc2VkOiBwYXJzZWQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgRmllbGRXaXRoQ2hvaWNlcy5wcm90b3R5cGUuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgICAgIGlmIChuZXdQcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10gJiYgbmV3UHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddICE9PSB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSkge1xuICAgICAgICAgICAgICAgIHZhciBfbG9hZEV4dGVybmFsVmFsdWVzMiA9IHRoaXMubG9hZEV4dGVybmFsVmFsdWVzKG5ld1Byb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hvaWNlcyA9IF9sb2FkRXh0ZXJuYWxWYWx1ZXMyLmNob2ljZXM7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnNlZCA9IF9sb2FkRXh0ZXJuYWxWYWx1ZXMyLnBhcnNlZDtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBjaG9pY2VzOiBjaG9pY2VzLFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2VzUGFyc2VkOiBwYXJzZWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBGaWVsZFdpdGhDaG9pY2VzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQeWRpb0NvbXBvbmVudCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHRoaXMuc3RhdGUpKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gRmllbGRXaXRoQ2hvaWNlcztcbiAgICB9KShDb21wb25lbnQpO1xuXG4gICAgRmllbGRXaXRoQ2hvaWNlcyA9IFB5ZGlvQ29udGV4dENvbnN1bWVyKEZpZWxkV2l0aENob2ljZXMpO1xuXG4gICAgcmV0dXJuIEZpZWxkV2l0aENob2ljZXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG4vKipcbiAqIFJlYWN0IE1peGluIGZvciBGb3JtIEVsZW1lbnRcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0ge1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgbmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXG4gICAgICAgIGRpc3BsYXlDb250ZXh0OiBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydmb3JtJywgJ2dyaWQnXSksXG4gICAgICAgIGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgbXVsdGlwbGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICB2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLmFueSxcbiAgICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvbkNoYW5nZUVkaXRNb2RlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgYmluYXJ5X2NvbnRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGVycm9yVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpc3BsYXlDb250ZXh0OiAnZm9ybScsXG4gICAgICAgICAgICBkaXNhYmxlZDogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgaXNEaXNwbGF5R3JpZDogZnVuY3Rpb24gaXNEaXNwbGF5R3JpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZGlzcGxheUNvbnRleHQgPT0gJ2dyaWQnO1xuICAgIH0sXG5cbiAgICBpc0Rpc3BsYXlGb3JtOiBmdW5jdGlvbiBpc0Rpc3BsYXlGb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5kaXNwbGF5Q29udGV4dCA9PSAnZm9ybSc7XG4gICAgfSxcblxuICAgIHRvZ2dsZUVkaXRNb2RlOiBmdW5jdGlvbiB0b2dnbGVFZGl0TW9kZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwbGF5Rm9ybSgpKSByZXR1cm47XG4gICAgICAgIHZhciBuZXdTdGF0ZSA9ICF0aGlzLnN0YXRlLmVkaXRNb2RlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IG5ld1N0YXRlIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZUVkaXRNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlRWRpdE1vZGUobmV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGVudGVyVG9Ub2dnbGU6IGZ1bmN0aW9uIGVudGVyVG9Ub2dnbGUoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PSAnRW50ZXInKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYnVmZmVyQ2hhbmdlczogZnVuY3Rpb24gYnVmZmVyQ2hhbmdlcyhuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyUHJvcHNPbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UoZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0VmFsdWUgPyBldmVudC5jdXJyZW50VGFyZ2V0LmdldFZhbHVlKCkgOiBldmVudC5jdXJyZW50VGFyZ2V0LnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNoYW5nZVRpbWVvdXQpIHtcbiAgICAgICAgICAgIGdsb2JhbC5jbGVhclRpbWVvdXQodGhpcy5jaGFuZ2VUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmV3VmFsdWUgPSB2YWx1ZSxcbiAgICAgICAgICAgIG9sZFZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc2tpcEJ1ZmZlckNoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlclByb3BzT25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpcnR5OiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IG5ld1ZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuc2tpcEJ1ZmZlckNoYW5nZXMpIHtcbiAgICAgICAgICAgIHZhciB0aW1lckxlbmd0aCA9IDI1MDtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICAgICAgICAgIHRpbWVyTGVuZ3RoID0gMTIwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2hhbmdlVGltZW91dCA9IGdsb2JhbC5zZXRUaW1lb3V0KChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJDaGFuZ2VzKG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpLCB0aW1lckxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgdHJpZ2dlclByb3BzT25DaGFuZ2U6IGZ1bmN0aW9uIHRyaWdnZXJQcm9wc09uQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlLCB7IHR5cGU6IHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWUsXG4gICAgICAgICAgICBkaXJ0eTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWRpdE1vZGU6IGZhbHNlLFxuICAgICAgICAgICAgZGlydHk6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMudmFsdWVcbiAgICAgICAgfTtcbiAgICB9XG5cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbi8qKlxuICogUmVhY3QgTWl4aW4gZm9yIHRoZSBmb3JtIGhlbHBlciA6IGRlZmF1bHQgcHJvcGVydGllcyB0aGF0XG4gKiBoZWxwZXJzIGNhbiByZWNlaXZlXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgcGFyYW1OYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBhcmFtQXR0cmlidXRlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICB2YWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgdXBkYXRlQ2FsbGJhY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWFuYWdlck1hbmFnZXIgPSByZXF1aXJlKCcuLi9tYW5hZ2VyL01hbmFnZXInKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYW5hZ2VyTWFuYWdlcik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBBc3luY0NvbXBvbmVudCA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuQXN5bmNDb21wb25lbnQ7XG5cbi8qKlxuICogRGlzcGxheSBhIGZvcm0gY29tcGFuaW9uIGxpbmtlZCB0byBhIGdpdmVuIGlucHV0LlxuICogUHJvcHM6IGhlbHBlckRhdGEgOiBjb250YWlucyB0aGUgcGx1Z2luSWQgYW5kIHRoZSB3aG9sZSBwYXJhbUF0dHJpYnV0ZXNcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnRm9ybUhlbHBlcicsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgaGVscGVyRGF0YTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgY2xvc2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgY2xvc2VIZWxwZXI6IGZ1bmN0aW9uIGNsb3NlSGVscGVyKCkge1xuICAgICAgICB0aGlzLnByb3BzLmNsb3NlKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgaGVscGVyID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5oZWxwZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgaGVscGVyc0NhY2hlID0gX21hbmFnZXJNYW5hZ2VyMlsnZGVmYXVsdCddLmdldEhlbHBlcnNDYWNoZSgpO1xuICAgICAgICAgICAgdmFyIHBsdWdpbkhlbHBlck5hbWVzcGFjZSA9IGhlbHBlcnNDYWNoZVt0aGlzLnByb3BzLmhlbHBlckRhdGFbJ3BsdWdpbklkJ11dWyduYW1lc3BhY2UnXTtcbiAgICAgICAgICAgIGhlbHBlciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdoZWxwZXItdGl0bGUnIH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2hlbHBlci1jbG9zZSBtZGkgbWRpLWNsb3NlJywgb25DbGljazogdGhpcy5jbG9zZUhlbHBlciB9KSxcbiAgICAgICAgICAgICAgICAgICAgJ1B5ZGlvIENvbXBhbmlvbidcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2hlbHBlci1jb250ZW50JyB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEFzeW5jQ29tcG9uZW50LCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcy5oZWxwZXJEYXRhLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IHBsdWdpbkhlbHBlck5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5hbWU6ICdIZWxwZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1OYW1lOiB0aGlzLnByb3BzLmhlbHBlckRhdGFbJ3BhcmFtQXR0cmlidXRlcyddWyduYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdweWRpby1mb3JtLWhlbHBlcicgKyAoaGVscGVyID8gJyBoZWxwZXItdmlzaWJsZScgOiAnIGhlbHBlci1lbXB0eScpLCBzdHlsZTogeyB6SW5kZXg6IDEgfSB9LFxuICAgICAgICAgICAgaGVscGVyXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9Hcm91cFN3aXRjaFBhbmVsID0gcmVxdWlyZSgnLi9Hcm91cFN3aXRjaFBhbmVsJyk7XG5cbnZhciBfR3JvdXBTd2l0Y2hQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Hcm91cFN3aXRjaFBhbmVsKTtcblxudmFyIF9SZXBsaWNhdGlvblBhbmVsID0gcmVxdWlyZSgnLi9SZXBsaWNhdGlvblBhbmVsJyk7XG5cbnZhciBfUmVwbGljYXRpb25QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9SZXBsaWNhdGlvblBhbmVsKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlciA9IHJlcXVpcmUoJy4uL21hbmFnZXIvTWFuYWdlcicpO1xuXG52YXIgX21hbmFnZXJNYW5hZ2VyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21hbmFnZXJNYW5hZ2VyKTtcblxuLyoqXG4gKiBGb3JtIFBhbmVsIGlzIGEgcmVhZHkgdG8gdXNlIGZvcm0gYnVpbGRlciBpbmhlcml0ZWQgZm9yIFB5ZGlvJ3MgbGVnYWN5IHBhcmFtZXRlcnMgZm9ybWF0cyAoJ3N0YW5kYXJkIGZvcm0nKS5cbiAqIEl0IGlzIHZlcnkgdmVyc2F0aWxlIGFuZCBjYW4gYmFzaWNhbGx5IHRha2UgYSBzZXQgb2YgcGFyYW1ldGVycyBkZWZpbmVkIGluIHRoZSBYTUwgbWFuaWZlc3RzIChvciBkZWZpbmVkIG1hbnVhbGx5XG4gKiBpbiBKUykgYW5kIGRpc3BsYXkgdGhlbSBhcyBhIHVzZXIgZm9ybS5cbiAqIEl0IGlzIGEgY29udHJvbGxlZCBjb21wb25lbnQ6IGl0IHRha2VzIGEge3ZhbHVlc30gb2JqZWN0IGFuZCB0cmlnZ2VycyBiYWNrIGFuIG9uQ2hhbmdlKCkgZnVuY3Rpb24uXG4gKlxuICogU2VlIGFsc28gTWFuYWdlciBjbGFzcyB0byBnZXQgc29tZSB1dGlsaXRhcnkgZnVuY3Rpb25zIHRvIHBhcnNlIHBhcmFtZXRlcnMgYW5kIGV4dHJhY3QgdmFsdWVzIGZvciB0aGUgZm9ybS5cbiAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdE1VSSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpLWxlZ2FjeScpO1xudmFyIExhbmdVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xudmFyIFB5ZGlvQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIFRhYnMgPSBfcmVxdWlyZS5UYWJzO1xudmFyIFRhYiA9IF9yZXF1aXJlLlRhYjtcbnZhciBQYXBlciA9IF9yZXF1aXJlLlBhcGVyO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnRm9ybVBhbmVsJyxcblxuICAgIF9oaWRkZW5WYWx1ZXM6IHt9LFxuICAgIF9pbnRlcm5hbFZhbGlkOiBudWxsLFxuICAgIF9wYXJhbWV0ZXJzTWV0YWRhdGE6IG51bGwsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IG9mIFB5ZGlvIFN0YW5kYXJkRm9ybSBwYXJhbWV0ZXJzXG4gICAgICAgICAqL1xuICAgICAgICBwYXJhbWV0ZXJzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9iamVjdCBjb250YWluaW5nIHZhbHVlcyBmb3IgdGhlIHBhcmFtZXRlcnNcbiAgICAgICAgICovXG4gICAgICAgIHZhbHVlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXIgdW5pdGFyeSBmdW5jdGlvbiB3aGVuIG9uZSBmb3JtIGlucHV0IGNoYW5nZXMuXG4gICAgICAgICAqL1xuICAgICAgICBvblBhcmFtZXRlckNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW5kIGFsbCBmb3JtIHZhbHVlcyBvbmNoYW5nZSwgaW5jbHVkaW5nIGV2ZW50dWFsbHkgdGhlIHJlbW92ZWQgb25lcyAoZm9yIGR5bmFtaWMgcGFuZWxzKVxuICAgICAgICAgKi9cbiAgICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIGZvcm0gZ2xvYmFiYWxseSBzd2l0Y2hlcyBiZXR3ZWVuIHZhbGlkIGFuZCBpbnZhbGlkIHN0YXRlXG4gICAgICAgICAqIFRyaWdnZXJlZCBvbmNlIGF0IGZvcm0gY29uc3RydWN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBvblZhbGlkU3RhdHVzQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc2FibGUgdGhlIHdob2xlIGZvcm0gYXQgb25jZVxuICAgICAgICAgKi9cbiAgICAgICAgZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICAvKipcbiAgICAgICAgICogU3RyaW5nIGFkZGVkIHRvIHRoZSBpbWFnZSBpbnB1dHMgZm9yIHVwbG9hZC9kb3dubG9hZCBvcGVyYXRpb25zXG4gICAgICAgICAqL1xuICAgICAgICBiaW5hcnlfY29udGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIDAgYnkgZGVmYXVsdCwgc3ViZm9ybXMgd2lsbCBoYXZlIHRoZWlyIHpEZXB0aCB2YWx1ZSBpbmNyZWFzZWQgYnkgb25lXG4gICAgICAgICAqL1xuICAgICAgICBkZXB0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGFuIGFkZGl0aW9uYWwgaGVhZGVyIGNvbXBvbmVudCAoYWRkZWQgaW5zaWRlIGZpcnN0IHN1YnBhbmVsKVxuICAgICAgICAgKi9cbiAgICAgICAgaGVhZGVyOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGFuIGFkZGl0aW9uYWwgZm9vdGVyIGNvbXBvbmVudCAoYWRkZWQgaW5zaWRlIGxhc3Qgc3VicGFuZWwpXG4gICAgICAgICAqL1xuICAgICAgICBmb290ZXI6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgb3RoZXIgYXJiaXRyYXJ5IHBhbmVscywgZWl0aGVyIGF0IHRoZSB0b3Agb3IgdGhlIGJvdHRvbVxuICAgICAgICAgKi9cbiAgICAgICAgYWRkaXRpb25hbFBhbmVzOiBSZWFjdC5Qcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgICAgICAgdG9wOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG4gICAgICAgICAgICBib3R0b206IFJlYWN0LlByb3BUeXBlcy5hcnJheVxuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFuIGFycmF5IG9mIHRhYnMgY29udGFpbmluZyBncm91cE5hbWVzLiBHcm91cHMgd2lsbCBiZSBzcGxpdHRlZFxuICAgICAgICAgKiBhY2Nyb3NzIHRob3NlIHRhYnNcbiAgICAgICAgICovXG4gICAgICAgIHRhYnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVkIHdoZW4gYSB0aGUgYWN0aXZlIHRhYiBjaGFuZ2VzXG4gICAgICAgICAqL1xuICAgICAgICBvblRhYkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIGJpdCBsaWtlIHRhYnMsIGJ1dCB1c2luZyBhY2NvcmRpb24tbGlrZSBsYXlvdXRcbiAgICAgICAgICovXG4gICAgICAgIGFjY29yZGlvbml6ZUlmR3JvdXBzTW9yZVRoYW46IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGb3J3YXJkIGFuIGV2ZW50IHdoZW4gc2Nyb2xsaW5nIHRoZSBmb3JtXG4gICAgICAgICAqL1xuICAgICAgICBvblNjcm9sbENhbGxiYWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3RyaWN0IHRvIGEgc3Vic2V0IG9mIGZpZWxkIGdyb3Vwc1xuICAgICAgICAgKi9cbiAgICAgICAgbGltaXRUb0dyb3VwczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LFxuICAgICAgICAvKipcbiAgICAgICAgICogSWdub3JlIHNvbWUgc3BlY2lmaWMgZmllbGRzIHR5cGVzXG4gICAgICAgICAqL1xuICAgICAgICBza2lwRmllbGRzVHlwZXM6IFJlYWN0LlByb3BUeXBlcy5hcnJheSxcblxuICAgICAgICAvKiBIZWxwZXIgT3B0aW9ucyAqL1xuICAgICAgICAvKipcbiAgICAgICAgICogUGFzcyBwb2ludGVycyB0byB0aGUgUHlkaW8gQ29tcGFuaW9uIGNvbnRhaW5lclxuICAgICAgICAgKi9cbiAgICAgICAgc2V0SGVscGVyRGF0YTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgY29tcGFuaW9uIGlzIGFjdGl2ZSBvciBub25lIGFuZCBpZiBhIHBhcmFtZXRlclxuICAgICAgICAgKiBoYXMgaGVscGVyIGRhdGFcbiAgICAgICAgICovXG4gICAgICAgIGNoZWNrSGFzSGVscGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRlc3QgZm9yIHBhcmFtZXRlclxuICAgICAgICAgKi9cbiAgICAgICAgaGVscGVyVGVzdEZvcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuXG4gICAgfSxcblxuICAgIGV4dGVybmFsbHlTZWxlY3RUYWI6IGZ1bmN0aW9uIGV4dGVybmFsbHlTZWxlY3RUYWIoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRhYlNlbGVjdGVkSW5kZXg6IGluZGV4IH0pO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25UYWJDaGFuZ2UpIHJldHVybiB7IHRhYlNlbGVjdGVkSW5kZXg6IDAgfTtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHsgZGVwdGg6IDAsIHZhbHVlczoge30gfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICBpZiAoSlNPTi5zdHJpbmdpZnkobmV3UHJvcHMucGFyYW1ldGVycykgIT09IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMucGFyYW1ldGVycykpIHtcbiAgICAgICAgICAgIHRoaXMuX2ludGVybmFsVmFsaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5faGlkZGVuVmFsdWVzID0ge307XG4gICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGEgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3UHJvcHMudmFsdWVzICYmIG5ld1Byb3BzLnZhbHVlcyAhPT0gdGhpcy5wcm9wcy52YWx1ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tWYWxpZFN0YXR1cyhuZXdQcm9wcy52YWx1ZXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFZhbHVlczogZnVuY3Rpb24gZ2V0VmFsdWVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy52YWx1ZXM7IC8vTGFuZ1V0aWxzLm1lcmdlT2JqZWN0c1JlY3Vyc2l2ZSh0aGlzLl9oaWRkZW5WYWx1ZXMsIHRoaXMucHJvcHMudmFsdWVzKTtcbiAgICB9LFxuXG4gICAgb25QYXJhbWV0ZXJDaGFuZ2U6IGZ1bmN0aW9uIG9uUGFyYW1ldGVyQ2hhbmdlKHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIHZhciBhZGRpdGlvbmFsRm9ybURhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzNdO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB3cml0ZVZhbHVlc1xuICAgICAgICB2YXIgbmV3VmFsdWVzID0gTGFuZ1V0aWxzLmRlZXBDb3B5KHRoaXMuZ2V0VmFsdWVzKCkpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblBhcmFtZXRlckNoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblBhcmFtZXRlckNoYW5nZShwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSwgYWRkaXRpb25hbEZvcm1EYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWRkaXRpb25hbEZvcm1EYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3BhcmFtZXRlcnNNZXRhZGF0YSkgdGhpcy5fcGFyYW1ldGVyc01ldGFkYXRhID0ge307XG4gICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGFbcGFyYW1OYW1lXSA9IGFkZGl0aW9uYWxGb3JtRGF0YTtcbiAgICAgICAgfVxuICAgICAgICBuZXdWYWx1ZXNbcGFyYW1OYW1lXSA9IG5ld1ZhbHVlO1xuICAgICAgICB2YXIgZGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKG5ld1ZhbHVlcywgZGlydHkpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UobmV3VmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICAvL25ld1ZhbHVlcyA9IExhbmdVdGlscy5tZXJnZU9iamVjdHNSZWN1cnNpdmUodGhpcy5faGlkZGVuVmFsdWVzLCBuZXdWYWx1ZXMpO1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuX2hpZGRlblZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9oaWRkZW5WYWx1ZXMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBuZXdWYWx1ZXNba2V5XSA9PT0gdW5kZWZpbmVkICYmICghcmVtb3ZlVmFsdWVzIHx8IHJlbW92ZVZhbHVlc1trZXldID09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVzW2tleV0gPSB0aGlzLl9oaWRkZW5WYWx1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlcywgZGlydHksIHJlbW92ZVZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja1ZhbGlkU3RhdHVzKG5ld1ZhbHVlcyk7XG4gICAgfSxcblxuICAgIG9uU3ViZm9ybUNoYW5nZTogZnVuY3Rpb24gb25TdWJmb3JtQ2hhbmdlKG5ld1ZhbHVlcywgZGlydHksIHJlbW92ZVZhbHVlcykge1xuICAgICAgICB2YXIgdmFsdWVzID0gTGFuZ1V0aWxzLm1lcmdlT2JqZWN0c1JlY3Vyc2l2ZSh0aGlzLmdldFZhbHVlcygpLCBuZXdWYWx1ZXMpO1xuICAgICAgICBpZiAocmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIHJlbW92ZVZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVWYWx1ZXMuaGFzT3duUHJvcGVydHkoaykgJiYgdmFsdWVzW2tdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbHVlc1trXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGRlblZhbHVlc1trXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5faGlkZGVuVmFsdWVzW2tdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub25DaGFuZ2UodmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKTtcbiAgICB9LFxuXG4gICAgb25TdWJmb3JtVmFsaWRTdGF0dXNDaGFuZ2U6IGZ1bmN0aW9uIG9uU3ViZm9ybVZhbGlkU3RhdHVzQ2hhbmdlKG5ld1ZhbGlkVmFsdWUsIGZhaWxlZE1hbmRhdG9yaWVzKSB7XG4gICAgICAgIGlmICgobmV3VmFsaWRWYWx1ZSAhPT0gdGhpcy5faW50ZXJuYWxWYWxpZCB8fCB0aGlzLnByb3BzLmZvcmNlVmFsaWRTdGF0dXNDaGVjaykgJiYgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UobmV3VmFsaWRWYWx1ZSwgZmFpbGVkTWFuZGF0b3JpZXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2ludGVybmFsVmFsaWQgPSBuZXdWYWxpZFZhbHVlO1xuICAgIH0sXG5cbiAgICBhcHBseUJ1dHRvbkFjdGlvbjogZnVuY3Rpb24gYXBwbHlCdXR0b25BY3Rpb24ocGFyYW1ldGVycywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24ocGFyYW1ldGVycywgY2FsbGJhY2spO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtZXRlcnMgPSBMYW5nVXRpbHMubWVyZ2VPYmplY3RzUmVjdXJzaXZlKHBhcmFtZXRlcnMsIHRoaXMuZ2V0VmFsdWVzRm9yUE9TVCh0aGlzLmdldFZhbHVlcygpKSk7XG4gICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLnJlcXVlc3QocGFyYW1ldGVycywgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICBnZXRWYWx1ZXNGb3JQT1NUOiBmdW5jdGlvbiBnZXRWYWx1ZXNGb3JQT1NUKHZhbHVlcykge1xuICAgICAgICB2YXIgcHJlZml4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ0RSSVZFUl9PUFRJT05fJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICByZXR1cm4gX21hbmFnZXJNYW5hZ2VyMlsnZGVmYXVsdCddLmdldFZhbHVlc0ZvclBPU1QodGhpcy5wcm9wcy5wYXJhbWV0ZXJzLCB2YWx1ZXMsIHByZWZpeCwgdGhpcy5fcGFyYW1ldGVyc01ldGFkYXRhKTtcbiAgICB9LFxuXG4gICAgY2hlY2tWYWxpZFN0YXR1czogZnVuY3Rpb24gY2hlY2tWYWxpZFN0YXR1cyh2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGZhaWxlZE1hbmRhdG9yaWVzID0gW107XG4gICAgICAgIHRoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICBpZiAoWydzdHJpbmcnLCAndGV4dGFyZWEnLCAncGFzc3dvcmQnLCAnaW50ZWdlciddLmluZGV4T2YocC50eXBlKSA+IC0xICYmIChwLm1hbmRhdG9yeSA9PSBcInRydWVcIiB8fCBwLm1hbmRhdG9yeSA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcyB8fCAhdmFsdWVzLmhhc093blByb3BlcnR5KHAubmFtZSkgfHwgdmFsdWVzW3AubmFtZV0gPT09IHVuZGVmaW5lZCB8fCB2YWx1ZXNbcC5uYW1lXSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICBmYWlsZWRNYW5kYXRvcmllcy5wdXNoKHApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwLnR5cGUgPT09ICd2YWxpZC1wYXNzd29yZCcgJiYgdGhpcy5yZWZzWydmb3JtLWVsZW1lbnQtJyArIHAubmFtZV0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucmVmc1snZm9ybS1lbGVtZW50LScgKyBwLm5hbWVdLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICBmYWlsZWRNYW5kYXRvcmllcy5wdXNoKHApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHZhciBwcmV2aW91c1ZhbHVlLCBuZXdWYWx1ZTtcbiAgICAgICAgcHJldmlvdXNWYWx1ZSA9IHRoaXMuX2ludGVybmFsVmFsaWQ7IC8vKHRoaXMuX2ludGVybmFsVmFsaWQgIT09IHVuZGVmaW5lZCA/IHRoaXMuX2ludGVybmFsVmFsaWQgOiB0cnVlKTtcbiAgICAgICAgbmV3VmFsdWUgPSBmYWlsZWRNYW5kYXRvcmllcy5sZW5ndGggPyBmYWxzZSA6IHRydWU7XG4gICAgICAgIGlmICgobmV3VmFsdWUgIT09IHRoaXMuX2ludGVybmFsVmFsaWQgfHwgdGhpcy5wcm9wcy5mb3JjZVZhbGlkU3RhdHVzQ2hlY2spICYmIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKG5ld1ZhbHVlLCBmYWlsZWRNYW5kYXRvcmllcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW50ZXJuYWxWYWxpZCA9IG5ld1ZhbHVlO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuY2hlY2tWYWxpZFN0YXR1cyh0aGlzLnByb3BzLnZhbHVlcyk7XG4gICAgfSxcblxuICAgIHJlbmRlckdyb3VwSGVhZGVyOiBmdW5jdGlvbiByZW5kZXJHcm91cEhlYWRlcihncm91cExhYmVsLCBhY2NvcmRpb25pemUsIGluZGV4LCBhY3RpdmUpIHtcblxuICAgICAgICB2YXIgcHJvcGVydGllcyA9IHsga2V5OiAnZ3JvdXAtJyArIGdyb3VwTGFiZWwgfTtcbiAgICAgICAgaWYgKGFjY29yZGlvbml6ZSkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuY3VycmVudEFjdGl2ZUdyb3VwID8gdGhpcy5zdGF0ZS5jdXJyZW50QWN0aXZlR3JvdXAgOiBudWxsO1xuICAgICAgICAgICAgcHJvcGVydGllc1snY2xhc3NOYW1lJ10gPSAnZ3JvdXAtbGFiZWwtJyArIChhY3RpdmUgPyAnYWN0aXZlJyA6ICdpbmFjdGl2ZScpO1xuICAgICAgICAgICAgcHJvcGVydGllc1snb25DbGljayddID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY3VycmVudEFjdGl2ZUdyb3VwOiBjdXJyZW50ICE9IGluZGV4ID8gaW5kZXggOiBudWxsIH0pO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGdyb3VwTGFiZWwgPSBbUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiAndG9nZ2xlcicsIGNsYXNzTmFtZTogXCJncm91cC1hY3RpdmUtdG9nZ2xlciBpY29uLWFuZ2xlLVwiICsgKGN1cnJlbnQgPT0gaW5kZXggPyAnZG93bicgOiAncmlnaHQnKSB9KSwgZ3JvdXBMYWJlbF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCgnaCcgKyAoMyArIHRoaXMucHJvcHMuZGVwdGgpLCBwcm9wZXJ0aWVzLCBncm91cExhYmVsKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGFsbEdyb3VwcyA9IFtdO1xuICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5nZXRWYWx1ZXMoKTtcbiAgICAgICAgdmFyIGdyb3Vwc09yZGVyZWQgPSBbJ19fREVGQVVMVF9fJ107XG4gICAgICAgIGFsbEdyb3Vwc1snX19ERUZBVUxUX18nXSA9IHsgRklFTERTOiBbXSB9O1xuICAgICAgICB2YXIgcmVwbGljYXRpb25Hcm91cHMgPSB7fTtcblxuICAgICAgICB0aGlzLnByb3BzLnBhcmFtZXRlcnMubWFwKChmdW5jdGlvbiAoYXR0cmlidXRlcykge1xuXG4gICAgICAgICAgICB2YXIgdHlwZSA9IGF0dHJpYnV0ZXNbJ3R5cGUnXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNraXBGaWVsZHNUeXBlcyAmJiB0aGlzLnByb3BzLnNraXBGaWVsZHNUeXBlcy5pbmRleE9mKHR5cGUpID4gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcGFyYW1OYW1lID0gYXR0cmlidXRlc1snbmFtZSddO1xuICAgICAgICAgICAgdmFyIGZpZWxkO1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbJ2dyb3VwX3N3aXRjaF9uYW1lJ10pIHJldHVybjtcblxuICAgICAgICAgICAgdmFyIGdyb3VwID0gYXR0cmlidXRlc1snZ3JvdXAnXSB8fCAnX19ERUZBVUxUX18nO1xuICAgICAgICAgICAgaWYgKCFhbGxHcm91cHNbZ3JvdXBdKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzT3JkZXJlZC5wdXNoKGdyb3VwKTtcbiAgICAgICAgICAgICAgICBhbGxHcm91cHNbZ3JvdXBdID0geyBGSUVMRFM6IFtdLCBMQUJFTDogZ3JvdXAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlcEdyb3VwID0gYXR0cmlidXRlc1sncmVwbGljYXRpb25Hcm91cCddO1xuICAgICAgICAgICAgaWYgKHJlcEdyb3VwKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXJlcGxpY2F0aW9uR3JvdXBzW3JlcEdyb3VwXSkge1xuICAgICAgICAgICAgICAgICAgICByZXBsaWNhdGlvbkdyb3Vwc1tyZXBHcm91cF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBQQVJBTVM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgR1JPVVA6IGdyb3VwLFxuICAgICAgICAgICAgICAgICAgICAgICAgUE9TSVRJT046IGFsbEdyb3Vwc1tncm91cF0uRklFTERTLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBhbGxHcm91cHNbZ3JvdXBdLkZJRUxEUy5wdXNoKCdSRVBMSUNBVElPTjonICsgcmVwR3JvdXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDb3B5XG4gICAgICAgICAgICAgICAgdmFyIHJlcEF0dHIgPSBMYW5nVXRpbHMuZGVlcENvcHkoYXR0cmlidXRlcyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlcEF0dHJbJ3JlcGxpY2F0aW9uR3JvdXAnXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVwQXR0clsnZ3JvdXAnXTtcbiAgICAgICAgICAgICAgICByZXBsaWNhdGlvbkdyb3Vwc1tyZXBHcm91cF0uUEFSQU1TLnB1c2gocmVwQXR0cik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUuaW5kZXhPZihcImdyb3VwX3N3aXRjaDpcIikgPT09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX0dyb3VwU3dpdGNoUGFuZWwyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblN1YmZvcm1DaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbUF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB0aGlzLnByb3BzLnBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMucHJvcHMudmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNjcm9sbENhbGxiYWNrOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGltaXRUb0dyb3VwczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsaWRTdGF0dXNDaGFuZ2U6IHRoaXMub25TdWJmb3JtVmFsaWRTdGF0dXNDaGFuZ2VcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlc1sndHlwZSddICE9PSAnaGlkZGVuJykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWxwZXJNYXJrO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZXRIZWxwZXJEYXRhICYmIHRoaXMucHJvcHMuY2hlY2tIYXNIZWxwZXIgJiYgdGhpcy5wcm9wcy5jaGVja0hhc0hlbHBlcihhdHRyaWJ1dGVzWyduYW1lJ10sIHRoaXMucHJvcHMuaGVscGVyVGVzdEZvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzaG93SGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNldEhlbHBlckRhdGEoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbUF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0VmFsdWVzOiB0aGlzLmdldFZhbHVlc0ZvclBPU1QodmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlCdXR0b25BY3Rpb246IHRoaXMuYXBwbHlCdXR0b25BY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLnByb3BzLmhlbHBlclRlc3RGb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlbHBlck1hcmsgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdpY29uLXF1ZXN0aW9uLXNpZ24nLCBvbkNsaWNrOiBzaG93SGVscGVyIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYW5kYXRvcnlNaXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc0xlZ2VuZCA9IFwiZm9ybS1sZWdlbmRcIjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbJ2Vycm9yVGV4dCddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc0xlZ2VuZCA9IFwiZm9ybS1sZWdlbmQgbWFuZGF0b3J5LW1pc3NpbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRyaWJ1dGVzWyd3YXJuaW5nVGV4dCddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc0xlZ2VuZCA9IFwiZm9ybS1sZWdlbmQgd2FybmluZy1tZXNzYWdlXCI7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlc1snbWFuZGF0b3J5J10gJiYgKGF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddID09PSBcInRydWVcIiB8fCBhdHRyaWJ1dGVzWydtYW5kYXRvcnknXSA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChbJ3N0cmluZycsICd0ZXh0YXJlYScsICdpbWFnZScsICdpbnRlZ2VyJ10uaW5kZXhPZihhdHRyaWJ1dGVzWyd0eXBlJ10pICE9PSAtMSAmJiAhdmFsdWVzW3BhcmFtTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYW5kYXRvcnlNaXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc0xlZ2VuZCA9IFwiZm9ybS1sZWdlbmQgbWFuZGF0b3J5LW1pc3NpbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9wcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogXCJmb3JtLWVsZW1lbnQtXCIgKyBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcGFyYW1OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlc1twYXJhbU5hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IChmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlLCBhZGRpdGlvbmFsRm9ybURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUGFyYW1ldGVyQ2hhbmdlKHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlLCBhZGRpdGlvbmFsRm9ybURhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkIHx8IGF0dHJpYnV0ZXNbJ3JlYWRvbmx5J10sXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZTogYXR0cmlidXRlc1snbXVsdGlwbGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmFyeV9jb250ZXh0OiB0aGlzLnByb3BzLmJpbmFyeV9jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheUNvbnRleHQ6ICdmb3JtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5QnV0dG9uQWN0aW9uOiB0aGlzLmFwcGx5QnV0dG9uQWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBtYW5kYXRvcnlNaXNzaW5nID8gcHlkaW8uTWVzc2FnZUhhc2hbJzYyMSddIDogYXR0cmlidXRlcy5lcnJvclRleHQgPyBhdHRyaWJ1dGVzLmVycm9yVGV4dCA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsga2V5OiBwYXJhbU5hbWUsIGNsYXNzTmFtZTogJ2Zvcm0tZW50cnktJyArIGF0dHJpYnV0ZXNbJ3R5cGUnXSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hbmFnZXJNYW5hZ2VyMlsnZGVmYXVsdCddLmNyZWF0ZUZvcm1FbGVtZW50KHByb3BzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGNsYXNzTGVnZW5kIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlc1snd2FybmluZ1RleHQnXSA/IGF0dHJpYnV0ZXNbJ3dhcm5pbmdUZXh0J10gOiBhdHRyaWJ1dGVzWydkZXNjcmlwdGlvbiddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWxwZXJNYXJrXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaWRkZW5WYWx1ZXNbcGFyYW1OYW1lXSA9IHZhbHVlc1twYXJhbU5hbWVdICE9PSB1bmRlZmluZWQgPyB2YWx1ZXNbcGFyYW1OYW1lXSA6IGF0dHJpYnV0ZXNbJ2RlZmF1bHQnXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxsR3JvdXBzW2dyb3VwXS5GSUVMRFMucHVzaChmaWVsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICBmb3IgKHZhciByR3JvdXAgaW4gcmVwbGljYXRpb25Hcm91cHMpIHtcbiAgICAgICAgICAgIGlmICghcmVwbGljYXRpb25Hcm91cHMuaGFzT3duUHJvcGVydHkockdyb3VwKSkgY29udGludWU7XG4gICAgICAgICAgICB2YXIgckdyb3VwRGF0YSA9IHJlcGxpY2F0aW9uR3JvdXBzW3JHcm91cF07XG4gICAgICAgICAgICBhbGxHcm91cHNbckdyb3VwRGF0YS5HUk9VUF0uRklFTERTW3JHcm91cERhdGEuUE9TSVRJT05dID0gUmVhY3QuY3JlYXRlRWxlbWVudChfUmVwbGljYXRpb25QYW5lbDJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVwbGljYXRpb24tZ3JvdXAtXCIgKyByR3JvdXBEYXRhLlBBUkFNU1swXS5uYW1lLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uU3ViZm9ybUNoYW5nZSxcbiAgICAgICAgICAgICAgICBvblBhcmFtZXRlckNoYW5nZTogbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMuZ2V0VmFsdWVzKCksXG4gICAgICAgICAgICAgICAgZGVwdGg6IHRoaXMucHJvcHMuZGVwdGggKyAxLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHJHcm91cERhdGEuUEFSQU1TLFxuICAgICAgICAgICAgICAgIGFwcGx5QnV0dG9uQWN0aW9uOiB0aGlzLmFwcGx5QnV0dG9uQWN0aW9uLFxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsQ2FsbGJhY2s6IG51bGxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBncm91cFBhbmVzID0gW107XG4gICAgICAgIHZhciBhY2NvcmRpb25pemUgPSB0aGlzLnByb3BzLmFjY29yZGlvbml6ZUlmR3JvdXBzTW9yZVRoYW4gJiYgZ3JvdXBzT3JkZXJlZC5sZW5ndGggPiB0aGlzLnByb3BzLmFjY29yZGlvbml6ZUlmR3JvdXBzTW9yZVRoYW47XG4gICAgICAgIHZhciBjdXJyZW50QWN0aXZlR3JvdXAgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuY3VycmVudEFjdGl2ZUdyb3VwID8gdGhpcy5zdGF0ZS5jdXJyZW50QWN0aXZlR3JvdXAgOiAwO1xuICAgICAgICBncm91cHNPcmRlcmVkLm1hcCgoZnVuY3Rpb24gKGcsIGdJbmRleCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubGltaXRUb0dyb3VwcyAmJiB0aGlzLnByb3BzLmxpbWl0VG9Hcm91cHMuaW5kZXhPZihnKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGVhZGVyLFxuICAgICAgICAgICAgICAgIGdEYXRhID0gYWxsR3JvdXBzW2ddO1xuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9ICdweWRpby1mb3JtLWdyb3VwJyxcbiAgICAgICAgICAgICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChhY2NvcmRpb25pemUpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmUgPSBjdXJyZW50QWN0aXZlR3JvdXAgPT0gZ0luZGV4O1xuICAgICAgICAgICAgICAgIGlmIChnSW5kZXggPT0gY3VycmVudEFjdGl2ZUdyb3VwKSBjbGFzc05hbWUgKz0gJyBmb3JtLWdyb3VwLWFjdGl2ZSc7ZWxzZSBjbGFzc05hbWUgKz0gJyBmb3JtLWdyb3VwLWluYWN0aXZlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZ0RhdGEuRklFTERTLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGdEYXRhLkxBQkVMICYmICEodGhpcy5wcm9wcy5za2lwRmllbGRzVHlwZXMgJiYgdGhpcy5wcm9wcy5za2lwRmllbGRzVHlwZXMuaW5kZXhPZignR3JvdXBIZWFkZXInKSA+IC0xKSkge1xuICAgICAgICAgICAgICAgIGhlYWRlciA9IHRoaXMucmVuZGVyR3JvdXBIZWFkZXIoZ0RhdGEuTEFCRUwsIGFjY29yZGlvbml6ZSwgZ0luZGV4LCBhY3RpdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGVwdGggPT0gMCkge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnIHotZGVwdGgtMSc7XG4gICAgICAgICAgICAgICAgZ3JvdXBQYW5lcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFBhcGVyLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCBrZXk6ICdwYW5lLScgKyBnIH0sXG4gICAgICAgICAgICAgICAgICAgIGdJbmRleCA9PSAwICYmIHRoaXMucHJvcHMuaGVhZGVyID8gdGhpcy5wcm9wcy5oZWFkZXIgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBnRGF0YS5GSUVMRFNcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgZ0luZGV4ID09IGdyb3Vwc09yZGVyZWQubGVuZ3RoIC0gMSAmJiB0aGlzLnByb3BzLmZvb3RlciA/IHRoaXMucHJvcHMuZm9vdGVyIDogbnVsbFxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBncm91cFBhbmVzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGtleTogJ3BhbmUtJyArIGcgfSxcbiAgICAgICAgICAgICAgICAgICAgZ0luZGV4ID09IDAgJiYgdGhpcy5wcm9wcy5oZWFkZXIgPyB0aGlzLnByb3BzLmhlYWRlciA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdEYXRhLkZJRUxEU1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBnSW5kZXggPT0gZ3JvdXBzT3JkZXJlZC5sZW5ndGggLSAxICYmIHRoaXMucHJvcHMuZm9vdGVyID8gdGhpcy5wcm9wcy5mb290ZXIgOiBudWxsXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hZGRpdGlvbmFsUGFuZXMpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG90aGVyUGFuZXMgPSB7IHRvcDogW10sIGJvdHRvbTogW10gfTtcbiAgICAgICAgICAgICAgICB2YXIgZGVwdGggPSBfdGhpcy5wcm9wcy5kZXB0aDtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xuXG4gICAgICAgICAgICAgICAgdmFyIF9sb29wID0gZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvdGhlclBhbmVzLmhhc093blByb3BlcnR5KGspKSByZXR1cm4gJ2NvbnRpbnVlJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLnByb3BzLmFkZGl0aW9uYWxQYW5lc1trXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMucHJvcHMuYWRkaXRpb25hbFBhbmVzW2tdLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXB0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyUGFuZXNba10ucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3B5ZGlvLWZvcm0tZ3JvdXAgYWRkaXRpb25hbCcsIGtleTogJ290aGVyLXBhbmUtJyArIGluZGV4IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyUGFuZXNba10ucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3B5ZGlvLWZvcm0tZ3JvdXAgYWRkaXRpb25hbCcsIGtleTogJ290aGVyLXBhbmUtJyArIGluZGV4IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvdGhlclBhbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfcmV0MiA9IF9sb29wKGspO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmV0MiA9PT0gJ2NvbnRpbnVlJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyb3VwUGFuZXMgPSBvdGhlclBhbmVzWyd0b3AnXS5jb25jYXQoZ3JvdXBQYW5lcykuY29uY2F0KG90aGVyUGFuZXNbJ2JvdHRvbSddKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy50YWJzKSB7XG4gICAgICAgICAgICB2YXIgX3JldDMgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBfdGhpcy5wcm9wcy5jbGFzc05hbWU7XG4gICAgICAgICAgICAgICAgdmFyIGluaXRpYWxTZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHRhYnMgPSBfdGhpcy5wcm9wcy50YWJzLm1hcCgoZnVuY3Rpb24gKHREZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdERlZlsnbGFiZWwnXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwcyA9IHREZWZbJ2dyb3VwcyddO1xuICAgICAgICAgICAgICAgICAgICBpZiAodERlZlsnc2VsZWN0ZWQnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFNlbGVjdGVkSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYW5lcyA9IGdyb3Vwcy5tYXAoZnVuY3Rpb24gKGdJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3VwUGFuZXNbZ0lkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBncm91cFBhbmVzW2dJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIFRhYixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMub25UYWJDaGFuZ2UgPyBpIC0gMSA6IHVuZGVmaW5lZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogKGNsYXNzTmFtZSA/IGNsYXNzTmFtZSArICcgJyA6ICcgJykgKyAncHlkaW8tZm9ybS1wYW5lbCcgKyAocGFuZXMubGVuZ3RoICUgMiA/ICcgZm9ybS1wYW5lbC1vZGQnIDogJycpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFuZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKF90aGlzKSk7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLnN0YXRlLnRhYlNlbGVjdGVkSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpbml0aWFsU2VsZWN0ZWRJbmRleCA9IF90aGlzLnN0YXRlLnRhYlNlbGVjdGVkSW5kZXg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHY6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnbGF5b3V0LWZpbGwgdmVydGljYWwtbGF5b3V0IHRhYi12ZXJ0aWNhbC1sYXlvdXQnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRhYnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWY6ICd0YWJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFNlbGVjdGVkSW5kZXg6IGluaXRpYWxTZWxlY3RlZEluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogX3RoaXMucHJvcHMub25UYWJDaGFuZ2UgPyBpbml0aWFsU2VsZWN0ZWRJbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IF90aGlzLnByb3BzLm9uVGFiQ2hhbmdlID8gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgdGFiU2VsZWN0ZWRJbmRleDogaSB9KTtfdGhpcy5wcm9wcy5vblRhYkNoYW5nZShpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSwgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50Q29udGFpbmVyU3R5bGU6IHsgZmxleDogMSwgb3ZlcmZsb3dZOiAnYXV0bycgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFic1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3JldDMgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldDMudjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAodGhpcy5wcm9wcy5jbGFzc05hbWUgPyB0aGlzLnByb3BzLmNsYXNzTmFtZSArICcgJyA6ICcgJykgKyAncHlkaW8tZm9ybS1wYW5lbCcgKyAoZ3JvdXBQYW5lcy5sZW5ndGggJSAyID8gJyBmb3JtLXBhbmVsLW9kZCcgOiAnJyksIG9uU2Nyb2xsOiB0aGlzLnByb3BzLm9uU2Nyb2xsQ2FsbGJhY2sgfSxcbiAgICAgICAgICAgICAgICBncm91cFBhbmVzXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9Gb3JtUGFuZWwgPSByZXF1aXJlKCcuL0Zvcm1QYW5lbCcpO1xuXG52YXIgX0Zvcm1QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Gb3JtUGFuZWwpO1xuXG52YXIgX2ZpZWxkc0lucHV0U2VsZWN0Qm94ID0gcmVxdWlyZSgnLi4vZmllbGRzL0lucHV0U2VsZWN0Qm94Jyk7XG5cbnZhciBfZmllbGRzSW5wdXRTZWxlY3RCb3gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRTZWxlY3RCb3gpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgTGFuZ1V0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbi8qKlxuICogU3ViIGZvcm0gd2l0aCBhIHNlbGVjdG9yLCBzd2l0Y2hpbmcgaXRzIGZpZWxkcyBkZXBlbmRpbmdcbiAqIG9uIHRoZSBzZWxlY3RvciB2YWx1ZS5cbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnR3JvdXBTd2l0Y2hQYW5lbCcsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgcGFyYW1BdHRyaWJ1dGVzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIHBhcmFtZXRlcnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgICB2YWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgY29tcHV0ZVN1YlBhbmVsUGFyYW1ldGVyczogZnVuY3Rpb24gY29tcHV0ZVN1YlBhbmVsUGFyYW1ldGVycygpIHtcblxuICAgICAgICAvLyBDUkVBVEUgU1VCIEZPUk0gUEFORUxcbiAgICAgICAgLy8gR2V0IGFsbCB2YWx1ZXNcbiAgICAgICAgdmFyIHN3aXRjaE5hbWUgPSB0aGlzLnByb3BzLnBhcmFtQXR0cmlidXRlc1sndHlwZSddLnNwbGl0KFwiOlwiKS5wb3AoKTtcbiAgICAgICAgdmFyIHBhcmVudE5hbWUgPSB0aGlzLnByb3BzLnBhcmFtQXR0cmlidXRlc1snbmFtZSddO1xuICAgICAgICB2YXIgc3dpdGNoVmFsdWVzID0ge30sXG4gICAgICAgICAgICBwb3RlbnRpYWxTdWJTd2l0Y2hlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgICAgIGlmICghcFsnZ3JvdXBfc3dpdGNoX25hbWUnXSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHBbJ2dyb3VwX3N3aXRjaF9uYW1lJ10gIT0gc3dpdGNoTmFtZSkge1xuICAgICAgICAgICAgICAgIHBvdGVudGlhbFN1YlN3aXRjaGVzLnB1c2gocCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNydFN3aXRjaCA9IHBbJ2dyb3VwX3N3aXRjaF92YWx1ZSddO1xuICAgICAgICAgICAgaWYgKCFzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdID0ge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogcFsnZ3JvdXBfc3dpdGNoX2xhYmVsJ10sXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkczogW10sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczoge30sXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc0tleXM6IHt9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHAgPSBMYW5nVXRpbHMuZGVlcENvcHkocCk7XG4gICAgICAgICAgICBkZWxldGUgcFsnZ3JvdXBfc3dpdGNoX25hbWUnXTtcbiAgICAgICAgICAgIHBbJ25hbWUnXSA9IHBhcmVudE5hbWUgKyAnLycgKyBwWyduYW1lJ107XG4gICAgICAgICAgICB2YXIgdktleSA9IHBbJ25hbWUnXTtcbiAgICAgICAgICAgIHZhciBwYXJhbU5hbWUgPSB2S2V5O1xuICAgICAgICAgICAgaWYgKHN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdLmZpZWxkc0tleXNbcGFyYW1OYW1lXSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdLmZpZWxkcy5wdXNoKHApO1xuICAgICAgICAgICAgc3dpdGNoVmFsdWVzW2NydFN3aXRjaF0uZmllbGRzS2V5c1twYXJhbU5hbWVdID0gcGFyYW1OYW1lO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWVzICYmIHRoaXMucHJvcHMudmFsdWVzW3ZLZXldKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoVmFsdWVzW2NydFN3aXRjaF0udmFsdWVzW3BhcmFtTmFtZV0gPSB0aGlzLnByb3BzLnZhbHVlc1t2S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIC8vIFJlbWVyZ2UgcG90ZW50aWFsU3ViU3dpdGNoZXMgdG8gZWFjaCBwYXJhbWV0ZXJzIHNldFxuICAgICAgICBmb3IgKHZhciBrIGluIHN3aXRjaFZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHN3aXRjaFZhbHVlcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgIHZhciBzdiA9IHN3aXRjaFZhbHVlc1trXTtcbiAgICAgICAgICAgICAgICBzdi5maWVsZHMgPSBzdi5maWVsZHMuY29uY2F0KHBvdGVudGlhbFN1YlN3aXRjaGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzd2l0Y2hWYWx1ZXM7XG4gICAgfSxcblxuICAgIGNsZWFyU3ViUGFyYW1ldGVyc1ZhbHVlczogZnVuY3Rpb24gY2xlYXJTdWJQYXJhbWV0ZXJzVmFsdWVzKHBhcmVudE5hbWUsIG5ld1ZhbHVlLCBuZXdGaWVsZHMpIHtcbiAgICAgICAgdmFyIHZhbHMgPSBMYW5nVXRpbHMuZGVlcENvcHkodGhpcy5wcm9wcy52YWx1ZXMpO1xuICAgICAgICB2YXIgdG9SZW1vdmUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHMpIHtcbiAgICAgICAgICAgIGlmICh2YWxzLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5LmluZGV4T2YocGFyZW50TmFtZSArICcvJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0b1JlbW92ZVtrZXldID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFsc1twYXJlbnROYW1lXSA9IG5ld1ZhbHVlO1xuXG4gICAgICAgIG5ld0ZpZWxkcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIGlmIChwLnR5cGUgPT0gJ2hpZGRlbicgJiYgcFsnZGVmYXVsdCddICYmICFwWydncm91cF9zd2l0Y2hfbmFtZSddIHx8IHBbJ2dyb3VwX3N3aXRjaF9uYW1lJ10gPT0gcGFyZW50TmFtZSkge1xuICAgICAgICAgICAgICAgIHZhbHNbcFsnbmFtZSddXSA9IHBbJ2RlZmF1bHQnXTtcbiAgICAgICAgICAgICAgICBpZiAodG9SZW1vdmVbcFsnbmFtZSddXSAhPT0gdW5kZWZpbmVkKSBkZWxldGUgdG9SZW1vdmVbcFsnbmFtZSddXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocFsnbmFtZSddLmluZGV4T2YocGFyZW50TmFtZSArICcvJykgPT09IDAgJiYgcFsnZGVmYXVsdCddKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBbJ3R5cGUnXSAmJiBwWyd0eXBlJ10uc3RhcnRzV2l0aCgnZ3JvdXBfc3dpdGNoOicpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdmFsc1twWyduYW1lJ11dID0ge2dyb3VwX3N3aXRjaF92YWx1ZTpwWydkZWZhdWx0J119O1xuICAgICAgICAgICAgICAgICAgICB2YWxzW3BbJ25hbWUnXV0gPSBwWydkZWZhdWx0J107XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsc1twWyduYW1lJ11dID0gcFsnZGVmYXVsdCddO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFscywgdHJ1ZSwgdG9SZW1vdmUpO1xuICAgICAgICAvL3RoaXMub25QYXJhbWV0ZXJDaGFuZ2UocGFyZW50TmFtZSwgbmV3VmFsdWUpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UobmV3VmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWVzLCB0cnVlLCByZW1vdmVWYWx1ZXMpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSB0aGlzLnByb3BzLnBhcmFtQXR0cmlidXRlcztcbiAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMucHJvcHMudmFsdWVzO1xuXG4gICAgICAgIHZhciBwYXJhbU5hbWUgPSBhdHRyaWJ1dGVzWyduYW1lJ107XG4gICAgICAgIHZhciBzd2l0Y2hWYWx1ZXMgPSB0aGlzLmNvbXB1dGVTdWJQYW5lbFBhcmFtZXRlcnMoYXR0cmlidXRlcyk7XG4gICAgICAgIHZhciBzZWxlY3RvclZhbHVlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgT2JqZWN0LmtleXMoc3dpdGNoVmFsdWVzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHNlbGVjdG9yVmFsdWVzLnNldChrLCBzd2l0Y2hWYWx1ZXNba10ubGFiZWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHNlbGVjdG9yQ2hhbmdlciA9IChmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJTdWJQYXJhbWV0ZXJzVmFsdWVzKHBhcmFtTmFtZSwgbmV3VmFsdWUsIHN3aXRjaFZhbHVlc1tuZXdWYWx1ZV0gPyBzd2l0Y2hWYWx1ZXNbbmV3VmFsdWVdLmZpZWxkcyA6IFtdKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgdmFyIHN1YkZvcm0gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBzZWxlY3RvckxlZ2VuZCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHN1YkZvcm1IZWFkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBzZWxlY3RvciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX2ZpZWxkc0lucHV0U2VsZWN0Qm94MlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICBrZXk6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgIG5hbWU6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2dyb3VwLXN3aXRjaC1zZWxlY3RvcicsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogcGFyYW1OYW1lLFxuICAgICAgICAgICAgICAgIGNob2ljZXM6IHNlbGVjdG9yVmFsdWVzLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBhdHRyaWJ1dGVzWydsYWJlbCddLFxuICAgICAgICAgICAgICAgIG1hbmRhdG9yeTogYXR0cmlidXRlc1snbWFuZGF0b3J5J11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVzW3BhcmFtTmFtZV0sXG4gICAgICAgICAgICBvbkNoYW5nZTogc2VsZWN0b3JDaGFuZ2VyLFxuICAgICAgICAgICAgZGlzcGxheUNvbnRleHQ6ICdmb3JtJyxcbiAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICAgICAgcmVmOiAnc3ViRm9ybVNlbGVjdG9yJ1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgaGVscGVyTWFyayA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc2V0SGVscGVyRGF0YSAmJiB0aGlzLnByb3BzLmNoZWNrSGFzSGVscGVyICYmIHRoaXMucHJvcHMuY2hlY2tIYXNIZWxwZXIoYXR0cmlidXRlc1snbmFtZSddLCB0aGlzLnByb3BzLmhlbHBlclRlc3RGb3IpKSB7XG4gICAgICAgICAgICB2YXIgc2hvd0hlbHBlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zZXRIZWxwZXJEYXRhKHsgcGFyYW1BdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLCB2YWx1ZXM6IHZhbHVlcyB9KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICBoZWxwZXJNYXJrID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnaWNvbi1xdWVzdGlvbi1zaWduJywgb25DbGljazogc2hvd0hlbHBlciB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGVjdG9yTGVnZW5kID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdmb3JtLWxlZ2VuZCcgfSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXNbJ2Rlc2NyaXB0aW9uJ10sXG4gICAgICAgICAgICAnICcsXG4gICAgICAgICAgICBoZWxwZXJNYXJrXG4gICAgICAgICk7XG4gICAgICAgIGlmICh2YWx1ZXNbcGFyYW1OYW1lXSAmJiBzd2l0Y2hWYWx1ZXNbdmFsdWVzW3BhcmFtTmFtZV1dKSB7XG4gICAgICAgICAgICBzdWJGb3JtSGVhZGVyID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnaDQnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVzW3BhcmFtTmFtZV1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBzdWJGb3JtID0gUmVhY3QuY3JlYXRlRWxlbWVudChfRm9ybVBhbmVsMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgb25QYXJhbWV0ZXJDaGFuZ2U6IHRoaXMucHJvcHMub25QYXJhbWV0ZXJDaGFuZ2UsXG4gICAgICAgICAgICAgICAgYXBwbHlCdXR0b25BY3Rpb246IHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24sXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgcmVmOiBwYXJhbU5hbWUgKyAnLVNVQicsXG4gICAgICAgICAgICAgICAga2V5OiBwYXJhbU5hbWUgKyAnLVNVQicsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnc3ViLWZvcm0nLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHN3aXRjaFZhbHVlc1t2YWx1ZXNbcGFyYW1OYW1lXV0uZmllbGRzLFxuICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGRlcHRoOiB0aGlzLnByb3BzLmRlcHRoICsgMSxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgICBjaGVja0hhc0hlbHBlcjogdGhpcy5wcm9wcy5jaGVja0hhc0hlbHBlcixcbiAgICAgICAgICAgICAgICBzZXRIZWxwZXJEYXRhOiB0aGlzLnByb3BzLnNldEhlbHBlckRhdGEsXG4gICAgICAgICAgICAgICAgaGVscGVyVGVzdEZvcjogdmFsdWVzW3BhcmFtTmFtZV0sXG4gICAgICAgICAgICAgICAgYWNjb3JkaW9uaXplSWZHcm91cHNNb3JlVGhhbjogNVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc3ViLWZvcm0tZ3JvdXAnIH0sXG4gICAgICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgICAgIHNlbGVjdG9yTGVnZW5kLFxuICAgICAgICAgICAgc3ViRm9ybVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX0Zvcm1QYW5lbCA9IHJlcXVpcmUoJy4vRm9ybVBhbmVsJyk7XG5cbnZhciBfRm9ybVBhbmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0Zvcm1QYW5lbCk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBDb21wb25lbnQgPSBfcmVxdWlyZS5Db21wb25lbnQ7XG5cbnZhciBfcmVxdWlyZTIgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgSWNvbkJ1dHRvbiA9IF9yZXF1aXJlMi5JY29uQnV0dG9uO1xudmFyIEZsYXRCdXR0b24gPSBfcmVxdWlyZTIuRmxhdEJ1dHRvbjtcbnZhciBQYXBlciA9IF9yZXF1aXJlMi5QYXBlcjtcblxudmFyIFVQX0FSUk9XID0gJ21kaSBtZGktbWVudS11cCc7XG52YXIgRE9XTl9BUlJPVyA9ICdtZGkgbWRpLW1lbnUtZG93bic7XG52YXIgUkVNT1ZFID0gJ21kaSBtZGktZGVsZXRlLWNpcmNsZSc7XG5cbnZhciBSZXBsaWNhdGVkR3JvdXAgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUmVwbGljYXRlZEdyb3VwLCBfQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFJlcGxpY2F0ZWRHcm91cChwcm9wcywgY29udGV4dCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVwbGljYXRlZEdyb3VwKTtcblxuICAgICAgICBfQ29tcG9uZW50LmNhbGwodGhpcywgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB2YXIgc3ViVmFsdWVzID0gcHJvcHMuc3ViVmFsdWVzO1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9IHByb3BzLnBhcmFtZXRlcnM7XG5cbiAgICAgICAgdmFyIGZpcnN0UGFyYW0gPSBwYXJhbWV0ZXJzWzBdO1xuICAgICAgICB2YXIgaW5zdGFuY2VWYWx1ZSA9IHN1YlZhbHVlc1tmaXJzdFBhcmFtWyduYW1lJ11dIHx8ICcnO1xuICAgICAgICB0aGlzLnN0YXRlID0geyB0b2dnbGVkOiBpbnN0YW5jZVZhbHVlID8gZmFsc2UgOiB0cnVlIH07XG4gICAgfVxuXG4gICAgUmVwbGljYXRlZEdyb3VwLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBkZXB0aCA9IF9wcm9wcy5kZXB0aDtcbiAgICAgICAgdmFyIG9uU3dhcFVwID0gX3Byb3BzLm9uU3dhcFVwO1xuICAgICAgICB2YXIgb25Td2FwRG93biA9IF9wcm9wcy5vblN3YXBEb3duO1xuICAgICAgICB2YXIgb25SZW1vdmUgPSBfcHJvcHMub25SZW1vdmU7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gX3Byb3BzLnBhcmFtZXRlcnM7XG4gICAgICAgIHZhciBzdWJWYWx1ZXMgPSBfcHJvcHMuc3ViVmFsdWVzO1xuICAgICAgICB2YXIgZGlzYWJsZWQgPSBfcHJvcHMuZGlzYWJsZWQ7XG4gICAgICAgIHZhciB0b2dnbGVkID0gdGhpcy5zdGF0ZS50b2dnbGVkO1xuXG4gICAgICAgIHZhciBmaXJzdFBhcmFtID0gcGFyYW1ldGVyc1swXTtcbiAgICAgICAgdmFyIGluc3RhbmNlVmFsdWUgPSBzdWJWYWx1ZXNbZmlyc3RQYXJhbVsnbmFtZSddXSB8fCBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsMC4zMyknIH0gfSxcbiAgICAgICAgICAgICdFbXB0eSBWYWx1ZSdcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFBhcGVyLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBtYXJnaW5MZWZ0OiAyLCBtYXJnaW5SaWdodDogMiwgbWFyZ2luQm90dG9tOiAxMCB9IH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1jaGV2cm9uLScgKyAodGhpcy5zdGF0ZS50b2dnbGVkID8gJ3VwJyA6ICdkb3duJyksIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHRvZ2dsZWQ6ICFfdGhpcy5zdGF0ZS50b2dnbGVkIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZm9udFNpemU6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VWYWx1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBVUF9BUlJPVywgb25Ub3VjaFRhcDogb25Td2FwVXAsIGRpc2FibGVkOiAhISFvblN3YXBVcCB8fCBkaXNhYmxlZCB9KSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IERPV05fQVJST1csIG9uVG91Y2hUYXA6IG9uU3dhcERvd24sIGRpc2FibGVkOiAhISFvblN3YXBEb3duIHx8IGRpc2FibGVkIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHRvZ2dsZWQgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChfRm9ybVBhbmVsMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgIHRhYnM6IG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiBzdWJWYWx1ZXMsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAncmVwbGljYWJsZS1ncm91cCcsXG4gICAgICAgICAgICAgICAgZGVwdGg6IGRlcHRoXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgICB0b2dnbGVkICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiA0LCB0ZXh0QWxpZ246ICdyaWdodCcgfSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRmxhdEJ1dHRvbiwgeyBsYWJlbDogJ1JlbW92ZScsIHByaW1hcnk6IHRydWUsIG9uVG91Y2hUYXA6IG9uUmVtb3ZlLCBkaXNhYmxlZDogISEhb25SZW1vdmUgfHwgZGlzYWJsZWQgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFJlcGxpY2F0ZWRHcm91cDtcbn0pKENvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlcGxpY2F0ZWRHcm91cDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9SZXBsaWNhdGVkR3JvdXAgPSByZXF1aXJlKCcuL1JlcGxpY2F0ZWRHcm91cCcpO1xuXG52YXIgX1JlcGxpY2F0ZWRHcm91cDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9SZXBsaWNhdGVkR3JvdXApO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgSWNvbkJ1dHRvbiA9IF9yZXF1aXJlLkljb25CdXR0b247XG5cbnZhciBMYW5nVXRpbHMgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxuLyoqXG4gKiBTdWIgZm9ybSByZXBsaWNhdGluZyBpdHNlbGYgKCsvLSlcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUmVwbGljYXRpb25QYW5lbCcsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgcGFyYW1ldGVyczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgICAgIHZhbHVlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBkaXNhYmxlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGJpbmFyeV9jb250ZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBkZXB0aDogUmVhY3QuUHJvcFR5cGVzLm51bWJlclxuICAgIH0sXG5cbiAgICBidWlsZFN1YlZhbHVlOiBmdW5jdGlvbiBidWlsZFN1YlZhbHVlKHZhbHVlcykge1xuICAgICAgICB2YXIgaW5kZXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIHZhciBzdWJWYWwgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBzdWZmaXggPSBpbmRleCA9PSAwID8gJycgOiAnXycgKyBpbmRleDtcbiAgICAgICAgdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgdmFyIHBOYW1lID0gcFsnbmFtZSddO1xuICAgICAgICAgICAgaWYgKHZhbHVlc1twTmFtZSArIHN1ZmZpeF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmICghc3ViVmFsKSBzdWJWYWwgPSB7fTtcbiAgICAgICAgICAgICAgICBzdWJWYWxbcE5hbWVdID0gdmFsdWVzW3BOYW1lICsgc3VmZml4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzdWJWYWwgfHwgZmFsc2U7XG4gICAgfSxcblxuICAgIGluZGV4ZWRWYWx1ZXM6IGZ1bmN0aW9uIGluZGV4ZWRWYWx1ZXMocm93c0FycmF5KSB7XG4gICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICB2YWx1ZXMgPSB7fTtcbiAgICAgICAgcm93c0FycmF5Lm1hcChmdW5jdGlvbiAocm93KSB7XG4gICAgICAgICAgICB2YXIgc3VmZml4ID0gaW5kZXggPT0gMCA/ICcnIDogJ18nICsgaW5kZXg7XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHJvdykge1xuICAgICAgICAgICAgICAgIGlmICghcm93Lmhhc093blByb3BlcnR5KHApKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbcCArIHN1ZmZpeF0gPSByb3dbcF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICB9LFxuXG4gICAgaW5kZXhWYWx1ZXM6IGZ1bmN0aW9uIGluZGV4VmFsdWVzKHJvd3NBcnJheSwgcmVtb3ZlTGFzdFJvdykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBpbmRleGVkID0gdGhpcy5pbmRleGVkVmFsdWVzKHJvd3NBcnJheSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBpZiAocmVtb3ZlTGFzdFJvdykge1xuICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0Um93ID0ge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0SW5kZXggPSByb3dzQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RSb3dbcFsnbmFtZSddICsgKG5leHRJbmRleCA+IDAgPyAnXycgKyBuZXh0SW5kZXggOiAnJyldID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5vbkNoYW5nZShpbmRleGVkLCB0cnVlLCBsYXN0Um93KTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGluZGV4ZWQsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGluc3RhbmNlczogZnVuY3Rpb24gaW5zdGFuY2VzKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAvLyBBbmFseXplIGN1cnJlbnQgdmFsdWUgdG8gZ3JhYiBudW1iZXIgb2Ygcm93cy5cbiAgICAgICAgdmFyIHJvd3MgPSBbXSxcbiAgICAgICAgICAgIHN1YlZhbCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgd2hpbGUgKHN1YlZhbCA9IHRoaXMuYnVpbGRTdWJWYWx1ZSh0aGlzLnByb3BzLnZhbHVlcywgaW5kZXgpKSB7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgcm93cy5wdXNoKHN1YlZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZpcnN0UGFyYW0gPSB0aGlzLnByb3BzLnBhcmFtZXRlcnNbMF07XG4gICAgICAgIGlmICghcm93cy5sZW5ndGggJiYgZmlyc3RQYXJhbVsncmVwbGljYXRpb25NYW5kYXRvcnknXSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBlbXB0eVZhbHVlID0ge307XG4gICAgICAgICAgICAgICAgX3RoaXMyLnByb3BzLnBhcmFtZXRlcnMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgIGVtcHR5VmFsdWVbcFsnbmFtZSddXSA9IHBbJ2RlZmF1bHQnXSB8fCAnJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByb3dzLnB1c2goZW1wdHlWYWx1ZSk7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByb3dzO1xuICAgIH0sXG5cbiAgICBhZGRSb3c6IGZ1bmN0aW9uIGFkZFJvdygpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0ge30sXG4gICAgICAgICAgICBjdXJyZW50VmFsdWVzID0gdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgbmV3VmFsdWVbcFsnbmFtZSddXSA9IHBbJ2RlZmF1bHQnXSB8fCAnJztcbiAgICAgICAgfSk7XG4gICAgICAgIGN1cnJlbnRWYWx1ZXMucHVzaChuZXdWYWx1ZSk7XG4gICAgICAgIHRoaXMuaW5kZXhWYWx1ZXMoY3VycmVudFZhbHVlcyk7XG4gICAgfSxcblxuICAgIHJlbW92ZVJvdzogZnVuY3Rpb24gcmVtb3ZlUm93KGluZGV4KSB7XG4gICAgICAgIHZhciBpbnN0YW5jZXMgPSB0aGlzLmluc3RhbmNlcygpO1xuICAgICAgICB2YXIgcmVtb3ZlSW5zdCA9IGluc3RhbmNlc1tpbmRleF07XG4gICAgICAgIGluc3RhbmNlcyA9IExhbmdVdGlscy5hcnJheVdpdGhvdXQodGhpcy5pbnN0YW5jZXMoKSwgaW5kZXgpO1xuICAgICAgICBpbnN0YW5jZXMucHVzaChyZW1vdmVJbnN0KTtcbiAgICAgICAgdGhpcy5pbmRleFZhbHVlcyhpbnN0YW5jZXMsIHRydWUpO1xuICAgIH0sXG5cbiAgICBzd2FwUm93czogZnVuY3Rpb24gc3dhcFJvd3MoaSwgaikge1xuICAgICAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgdmFyIHRtcCA9IGluc3RhbmNlc1tqXTtcbiAgICAgICAgaW5zdGFuY2VzW2pdID0gaW5zdGFuY2VzW2ldO1xuICAgICAgICBpbnN0YW5jZXNbaV0gPSB0bXA7XG4gICAgICAgIHRoaXMuaW5kZXhWYWx1ZXMoaW5zdGFuY2VzKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIG9uQ2hhbmdlKGluZGV4LCBuZXdWYWx1ZXMsIGRpcnR5KSB7XG4gICAgICAgIHZhciBpbnN0YW5jZXMgPSB0aGlzLmluc3RhbmNlcygpO1xuICAgICAgICBpbnN0YW5jZXNbaW5kZXhdID0gbmV3VmFsdWVzO1xuICAgICAgICB0aGlzLmluZGV4VmFsdWVzKGluc3RhbmNlcyk7XG4gICAgfSxcblxuICAgIG9uUGFyYW1ldGVyQ2hhbmdlOiBmdW5jdGlvbiBvblBhcmFtZXRlckNoYW5nZShpbmRleCwgcGFyYW1OYW1lLCBuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlcyA9IHRoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgIGluc3RhbmNlc1tpbmRleF1bcGFyYW1OYW1lXSA9IG5ld1ZhbHVlO1xuICAgICAgICB0aGlzLmluZGV4VmFsdWVzKGluc3RhbmNlcyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBfcHJvcHMucGFyYW1ldGVycztcbiAgICAgICAgdmFyIGRpc2FibGVkID0gX3Byb3BzLmRpc2FibGVkO1xuXG4gICAgICAgIHZhciBmaXJzdFBhcmFtID0gcGFyYW1ldGVyc1swXTtcbiAgICAgICAgdmFyIHJlcGxpY2F0aW9uVGl0bGUgPSBmaXJzdFBhcmFtWydyZXBsaWNhdGlvblRpdGxlJ10gfHwgZmlyc3RQYXJhbVsnbGFiZWwnXTtcbiAgICAgICAgdmFyIHJlcGxpY2F0aW9uRGVzY3JpcHRpb24gPSBmaXJzdFBhcmFtWydyZXBsaWNhdGlvbkRlc2NyaXB0aW9uJ10gfHwgZmlyc3RQYXJhbVsnZGVzY3JpcHRpb24nXTtcbiAgICAgICAgdmFyIHJlcGxpY2F0aW9uTWFuZGF0b3J5ID0gZmlyc3RQYXJhbVsncmVwbGljYXRpb25NYW5kYXRvcnknXSA9PT0gJ3RydWUnO1xuXG4gICAgICAgIHZhciBpbnN0YW5jZXMgPSB0aGlzLmluc3RhbmNlcygpO1xuICAgICAgICB2YXIgbXVsdGlwbGUgPSBpbnN0YW5jZXMubGVuZ3RoID4gMTtcbiAgICAgICAgdmFyIHJvd3MgPSBpbnN0YW5jZXMubWFwKGZ1bmN0aW9uIChzdWJWYWx1ZXMsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgb25Td2FwVXAgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgb25Td2FwRG93biA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBvblJlbW92ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBvblBhcmFtZXRlckNoYW5nZSA9IGZ1bmN0aW9uIG9uUGFyYW1ldGVyQ2hhbmdlKHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLm9uUGFyYW1ldGVyQ2hhbmdlKGluZGV4LCBwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKG11bHRpcGxlICYmIGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIG9uU3dhcFVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc3dhcFJvd3MoaW5kZXgsIGluZGV4IC0gMSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtdWx0aXBsZSAmJiBpbmRleCA8IGluc3RhbmNlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgb25Td2FwRG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnN3YXBSb3dzKGluZGV4LCBpbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobXVsdGlwbGUgfHwgIXJlcGxpY2F0aW9uTWFuZGF0b3J5KSB7XG4gICAgICAgICAgICAgICAgb25SZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5yZW1vdmVSb3coaW5kZXgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSB7IG9uU3dhcFVwOiBvblN3YXBVcCwgb25Td2FwRG93bjogb25Td2FwRG93biwgb25SZW1vdmU6IG9uUmVtb3ZlLCBvblBhcmFtZXRlckNoYW5nZTogb25QYXJhbWV0ZXJDaGFuZ2UgfTtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KF9SZXBsaWNhdGVkR3JvdXAyWydkZWZhdWx0J10sIF9leHRlbmRzKHsga2V5OiBpbmRleCB9LCBfdGhpczMucHJvcHMsIHByb3BzLCB7IHN1YlZhbHVlczogc3ViVmFsdWVzIH0pKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncmVwbGljYWJsZS1maWVsZCcgfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICd0aXRsZS1iYXInIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7IGtleTogJ2FkZCcsIHN0eWxlOiB7IGZsb2F0OiAncmlnaHQnIH0sIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLXBsdXMnLCBpY29uU3R5bGU6IHsgZm9udFNpemU6IDI0IH0sIHRvb2x0aXA6ICdBZGQgdmFsdWUnLCBvbkNsaWNrOiB0aGlzLmFkZFJvdywgZGlzYWJsZWQ6IGRpc2FibGVkIH0pLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3RpdGxlJyB9LFxuICAgICAgICAgICAgICAgICAgICByZXBsaWNhdGlvblRpdGxlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdsZWdlbmQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcGxpY2F0aW9uRGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgcm93c1xuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiJdfQ==

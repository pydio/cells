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

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _GroupSwitchPanel = require('./GroupSwitchPanel');

var _GroupSwitchPanel2 = _interopRequireDefault(_GroupSwitchPanel);

var _ReplicationPanel = require('./ReplicationPanel');

var _ReplicationPanel2 = _interopRequireDefault(_ReplicationPanel);

var _managerManager = require('../manager/Manager');

var _managerManager2 = _interopRequireDefault(_managerManager);

var _pydioUtilLang = require("pydio/util/lang");

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require("material-ui");

/**
 * Form Panel is a ready to use form builder inherited for Pydio's legacy parameters formats ('standard form').
 * It is very versatile and can basically take a set of parameters defined in the XML manifests (or defined manually
 * in JS) and display them as a user form.
 * It is a controlled component: it takes a {values} object and triggers back an onChange() function.
 *
 * See also Manager class to get some utilitary functions to parse parameters and extract values for the form.
 */
exports['default'] = _react2['default'].createClass({
    displayName: 'FormPanel',

    _hiddenValues: {},
    _internalValid: null,
    _parametersMetadata: null,

    propTypes: {
        /**
         * Array of Pydio StandardForm parameters
         */
        parameters: _react2['default'].PropTypes.array.isRequired,
        /**
         * Object containing values for the parameters
         */
        values: _react2['default'].PropTypes.object,
        /**
         * Trigger unitary function when one form input changes.
         */
        onParameterChange: _react2['default'].PropTypes.func,
        /**
         * Send all form values onchange, including eventually the removed ones (for dynamic panels)
         */
        onChange: _react2['default'].PropTypes.func,
        /**
         * Triggered when the form globabally switches between valid and invalid state
         * Triggered once at form construction
         */
        onValidStatusChange: _react2['default'].PropTypes.func,
        /**
         * Disable the whole form at once
         */
        disabled: _react2['default'].PropTypes.bool,
        /**
         * String added to the image inputs for upload/download operations
         */
        binary_context: _react2['default'].PropTypes.string,
        /**
         * 0 by default, subforms will have their zDepth value increased by one
         */
        depth: _react2['default'].PropTypes.number,

        /**
         * Add an additional header component (added inside first subpanel)
         */
        header: _react2['default'].PropTypes.object,
        /**
         * Add an additional footer component (added inside last subpanel)
         */
        footer: _react2['default'].PropTypes.object,
        /**
         * Add other arbitrary panels, either at the top or the bottom
         */
        additionalPanes: _react2['default'].PropTypes.shape({
            top: _react2['default'].PropTypes.array,
            bottom: _react2['default'].PropTypes.array
        }),
        /**
         * An array of tabs containing groupNames. Groups will be splitted
         * accross those tabs
         */
        tabs: _react2['default'].PropTypes.array,
        /**
         * Fired when a the active tab changes
         */
        onTabChange: _react2['default'].PropTypes.func,
        /**
         * A bit like tabs, but using accordion-like layout
         */
        accordionizeIfGroupsMoreThan: _react2['default'].PropTypes.number,
        /**
         * Forward an event when scrolling the form
         */
        onScrollCallback: _react2['default'].PropTypes.func,
        /**
         * Restrict to a subset of field groups
         */
        limitToGroups: _react2['default'].PropTypes.array,
        /**
         * Ignore some specific fields types
         */
        skipFieldsTypes: _react2['default'].PropTypes.array,

        /* Helper Options */
        /**
         * Pass pointers to the Pydio Companion container
         */
        setHelperData: _react2['default'].PropTypes.func,
        /**
         * Function to check if the companion is active or none and if a parameter
         * has helper data
         */
        checkHasHelper: _react2['default'].PropTypes.func,
        /**
         * Test for parameter
         */
        helperTestFor: _react2['default'].PropTypes.string

    },

    externallySelectTab: function externallySelectTab(index) {
        this.setState({ tabSelectedIndex: index });
    },

    getInitialState: function getInitialState() {
        if (this.props.onTabChange) {
            return { tabSelectedIndex: 0 };
        }
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
        var newValues = _pydioUtilLang2['default'].deepCopy(this.getValues());
        if (this.props.onParameterChange) {
            this.props.onParameterChange(paramName, newValue, oldValue, additionalFormData);
        }
        if (additionalFormData) {
            if (!this._parametersMetadata) {
                this._parametersMetadata = {};
            }
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
                if (this._hiddenValues.hasOwnProperty(key) && newValues[key] === undefined && (!removeValues || removeValues[key] === undefined)) {
                    newValues[key] = this._hiddenValues[key];
                }
            }
            this.props.onChange(newValues, dirty, removeValues);
        }
        this.checkValidStatus(newValues);
    },

    onSubformChange: function onSubformChange(newValues, dirty, removeValues) {
        var values = _pydioUtilLang2['default'].mergeObjectsRecursive(this.getValues(), newValues);
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
        }
        /*
        // Old way
        parameters = LangUtils.mergeObjectsRecursive(parameters, this.getValuesForPOST(this.getValues()));
        PydioApi.getClient().request(parameters, callback);
        */
    },

    getValuesForPOST: function getValuesForPOST(values) {
        var prefix = arguments.length <= 1 || arguments[1] === undefined ? 'DRIVER_OPTION_' : arguments[1];

        return _managerManager2['default'].getValuesForPOST(this.props.parameters, values, prefix, this._parametersMetadata);
    },

    checkValidStatus: function checkValidStatus(values) {
        var failedMandatories = [];
        this.props.parameters.map((function (p) {
            if (['string', 'textarea', 'password', 'integer'].indexOf(p.type) > -1 && (p.mandatory === "true" || p.mandatory === true)) {
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
        var previousValue = undefined,
            newValue = undefined;
        previousValue = this._internalValid; //(this._internalValid !== undefined ? this._internalValid : true);
        newValue = !failedMandatories.length;
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
                this.setState({ currentActiveGroup: current !== index ? index : null });
            }).bind(this);
            groupLabel = [_react2['default'].createElement('span', { key: 'toggler', className: "group-active-toggler icon-angle-" + (current === index ? 'down' : 'right') }), groupLabel];
        }

        return _react2['default'].createElement('h' + (3 + this.props.depth), properties, groupLabel);
    },

    render: function render() {
        var _this2 = this;

        var allGroups = [];
        var values = this.getValues();
        var groupsOrdered = ['__DEFAULT__'];
        allGroups['__DEFAULT__'] = { FIELDS: [] };
        var replicationGroups = {};

        this.props.parameters.map((function (attributes) {
            var _this = this;

            var type = attributes['type'];
            if (this.props.skipFieldsTypes && this.props.skipFieldsTypes.indexOf(type) > -1) {
                return;
            }
            var paramName = attributes['name'];
            var field;
            if (attributes['group_switch_name']) {
                return;
            }

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
                var repAttr = _pydioUtilLang2['default'].deepCopy(attributes);
                delete repAttr['replicationGroup'];
                delete repAttr['group'];
                replicationGroups[repGroup].PARAMS.push(repAttr);
            } else {

                if (type.indexOf("group_switch:") === 0) {

                    field = _react2['default'].createElement(_GroupSwitchPanel2['default'], _extends({}, this.props, {
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
                        helperMark = _react2['default'].createElement('span', { className: 'icon-question-sign', onClick: showHelper });
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
                        onChange: function onChange(newValue, oldValue, additionalFormData) {
                            _this.onParameterChange(paramName, newValue, oldValue, additionalFormData);
                        },
                        disabled: this.props.disabled || attributes['readonly'],
                        multiple: attributes['multiple'],
                        binary_context: this.props.binary_context,
                        displayContext: 'form',
                        applyButtonAction: this.applyButtonAction,
                        errorText: mandatoryMissing ? pydio.MessageHash['621'] : attributes.errorText ? attributes.errorText : null
                    };

                    field = _react2['default'].createElement(
                        'div',
                        { key: paramName, className: 'form-entry-' + attributes['type'] },
                        _managerManager2['default'].createFormElement(props),
                        _react2['default'].createElement(
                            'div',
                            { className: classLegend },
                            attributes['warningText'] ? attributes['warningText'] : attributes['description'],
                            ' ',
                            helperMark
                        )
                    );
                } else {

                    this._hiddenValues[paramName] = values[paramName] === undefined ? attributes['default'] : values[paramName];
                }

                if (field) {
                    allGroups[group].FIELDS.push(field);
                }
            }
        }).bind(this));

        for (var rGroup in replicationGroups) {
            if (!replicationGroups.hasOwnProperty(rGroup)) {
                continue;
            }
            var rGroupData = replicationGroups[rGroup];
            allGroups[rGroupData.GROUP].FIELDS[rGroupData.POSITION] = _react2['default'].createElement(_ReplicationPanel2['default'], _extends({}, this.props, {
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
                active = currentActiveGroup === gIndex;
                if (gIndex === currentActiveGroup) {
                    className += ' form-group-active';
                } else {
                    className += ' form-group-inactive';
                }
            }
            if (!gData.FIELDS.length) {
                return;
            }
            if (gData.LABEL && !(this.props.skipFieldsTypes && this.props.skipFieldsTypes.indexOf('GroupHeader') > -1)) {
                header = this.renderGroupHeader(gData.LABEL, accordionize, gIndex, active);
            }
            if (this.props.depth === 0) {
                className += ' z-depth-1';
                groupPanes.push(_react2['default'].createElement(
                    _materialUi.Paper,
                    { className: className, key: 'pane-' + g },
                    gIndex === 0 && this.props.header ? this.props.header : null,
                    header,
                    _react2['default'].createElement(
                        'div',
                        null,
                        gData.FIELDS
                    ),
                    gIndex === groupsOrdered.length - 1 && this.props.footer ? this.props.footer : null
                ));
            } else {
                groupPanes.push(_react2['default'].createElement(
                    'div',
                    { className: className, key: 'pane-' + g },
                    gIndex === 0 && this.props.header ? this.props.header : null,
                    header,
                    _react2['default'].createElement(
                        'div',
                        null,
                        gData.FIELDS
                    ),
                    gIndex === groupsOrdered.length - 1 && this.props.footer ? this.props.footer : null
                ));
            }
        }).bind(this));
        if (this.props.additionalPanes) {
            (function () {
                var otherPanes = { top: [], bottom: [] };
                var depth = _this2.props.depth;
                var index = 0;

                var _loop = function (k) {
                    if (!otherPanes.hasOwnProperty(k)) {
                        return 'continue';
                    }
                    if (_this2.props.additionalPanes[k]) {
                        _this2.props.additionalPanes[k].map(function (p) {
                            if (depth === 0) {
                                otherPanes[k].push(_react2['default'].createElement(
                                    _materialUi.Paper,
                                    { className: 'pydio-form-group additional', key: 'other-pane-' + index },
                                    p
                                ));
                            } else {
                                otherPanes[k].push(_react2['default'].createElement(
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
                var className = _this2.props.className;
                var initialSelectedIndex = 0;
                var i = 0;
                var tabs = _this2.props.tabs.map((function (tDef) {
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
                    return _react2['default'].createElement(
                        _materialUi.Tab,
                        { label: label,
                            key: label,
                            value: this.props.onTabChange ? i - 1 : undefined },
                        _react2['default'].createElement(
                            'div',
                            { className: (className ? className + ' ' : ' ') + 'pydio-form-panel' + (panes.length % 2 ? ' form-panel-odd' : '') },
                            panes
                        )
                    );
                }).bind(_this2));
                if (_this2.state.tabSelectedIndex !== undefined) {
                    initialSelectedIndex = _this2.state.tabSelectedIndex;
                }
                return {
                    v: _react2['default'].createElement(
                        'div',
                        { className: 'layout-fill vertical-layout tab-vertical-layout' },
                        _react2['default'].createElement(
                            _materialUi.Tabs,
                            { ref: 'tabs',
                                initialSelectedIndex: initialSelectedIndex,
                                value: _this2.props.onTabChange ? initialSelectedIndex : undefined,
                                onChange: _this2.props.onTabChange ? function (i) {
                                    _this2.setState({ tabSelectedIndex: i });_this2.props.onTabChange(i);
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
            return _react2['default'].createElement(
                'div',
                { className: (this.props.className ? this.props.className + ' ' : ' ') + 'pydio-form-panel' + (groupPanes.length % 2 ? ' form-panel-odd' : ''), onScroll: this.props.onScrollCallback },
                groupPanes
            );
        }
    }

});
module.exports = exports['default'];

},{"../manager/Manager":14,"./GroupSwitchPanel":21,"./ReplicationPanel":23,"material-ui":"material-ui","pydio/util/lang":"pydio/util/lang","react":"react"}],21:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvQXV0b2NvbXBsZXRlQm94LmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0F1dG9jb21wbGV0ZVRyZWUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvRmlsZURyb3B6b25lLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0Qm9vbGVhbi5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9JbnB1dEJ1dHRvbi5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9JbnB1dEltYWdlLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0SW50ZWdlci5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9JbnB1dFNlbGVjdEJveC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9Nb25pdG9yaW5nTGFiZWwuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvVGV4dEZpZWxkLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL1ZhbGlkTG9naW4uanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvVmFsaWRQYXNzd29yZC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2luZGV4LmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWFuYWdlci9NYW5hZ2VyLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWl4aW5zL0FjdGlvblJ1bm5lck1peGluLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWl4aW5zL0ZpZWxkV2l0aENob2ljZXMuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9taXhpbnMvRm9ybU1peGluLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWl4aW5zL0hlbHBlck1peGluLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vcGFuZWwvRm9ybUhlbHBlci5qcyIsInJlcy9idWlsZC91aS9Gb3JtL3BhbmVsL0Zvcm1QYW5lbC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL3BhbmVsL0dyb3VwU3dpdGNoUGFuZWwuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9SZXBsaWNhdGVkR3JvdXAuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9SZXBsaWNhdGlvblBhbmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNGb3JtTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvRm9ybU1peGluJyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0Zvcm1NaXhpbik7XG5cbnZhciBfbWl4aW5zRmllbGRXaXRoQ2hvaWNlcyA9IHJlcXVpcmUoJy4uL21peGlucy9GaWVsZFdpdGhDaG9pY2VzJyk7XG5cbnZhciBfbWl4aW5zRmllbGRXaXRoQ2hvaWNlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGaWVsZFdpdGhDaG9pY2VzKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIEF1dG9Db21wbGV0ZSA9IF9yZXF1aXJlLkF1dG9Db21wbGV0ZTtcbnZhciBNZW51SXRlbSA9IF9yZXF1aXJlLk1lbnVJdGVtO1xudmFyIFJlZnJlc2hJbmRpY2F0b3IgPSBfcmVxdWlyZS5SZWZyZXNoSW5kaWNhdG9yO1xuXG52YXIgQXV0b2NvbXBsZXRlQm94ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnQXV0b2NvbXBsZXRlQm94JyxcblxuICAgIG1peGluczogW19taXhpbnNGb3JtTWl4aW4yWydkZWZhdWx0J11dLFxuXG4gICAgaGFuZGxlVXBkYXRlSW5wdXQ6IGZ1bmN0aW9uIGhhbmRsZVVwZGF0ZUlucHV0KHNlYXJjaFRleHQpIHtcbiAgICAgICAgLy90aGlzLnNldFN0YXRlKHtzZWFyY2hUZXh0OiBzZWFyY2hUZXh0fSk7XG4gICAgfSxcblxuICAgIGhhbmRsZU5ld1JlcXVlc3Q6IGZ1bmN0aW9uIGhhbmRsZU5ld1JlcXVlc3QoY2hvc2VuVmFsdWUpIHtcbiAgICAgICAgaWYgKGNob3NlblZhbHVlLmtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKG51bGwsIGNob3NlblZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2UobnVsbCwgY2hvc2VuVmFsdWUua2V5KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXM7XG5cbiAgICAgICAgdmFyIGRhdGFTb3VyY2UgPSBbXTtcbiAgICAgICAgdmFyIGxhYmVscyA9IHt9O1xuICAgICAgICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwga2V5KSB7XG4gICAgICAgICAgICBkYXRhU291cmNlLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICAgIHRleHQ6IGNob2ljZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgTWVudUl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGFiZWxzW2tleV0gPSBjaG9pY2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBkaXNwbGF5VGV4dCA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzW2Rpc3BsYXlUZXh0XSkge1xuICAgICAgICAgICAgZGlzcGxheVRleHQgPSBsYWJlbHNbZGlzcGxheVRleHRdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwbGF5R3JpZCgpICYmICF0aGlzLnN0YXRlLmVkaXRNb2RlIHx8IHRoaXMucHJvcHMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgICAgICBpZiAoY2hvaWNlcy5nZXQodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjaG9pY2VzLmdldCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMuZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRoaXMudG9nZ2xlRWRpdE1vZGUsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgICF2YWx1ZSA/ICdFbXB0eScgOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAnIMKgwqAnLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2ljb24tY2FyZXQtZG93bicgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdweWRpb2Zvcm1fYXV0b2NvbXBsZXRlJywgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScgfSB9LFxuICAgICAgICAgICAgIWRhdGFTb3VyY2UubGVuZ3RoICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVmcmVzaEluZGljYXRvciwge1xuICAgICAgICAgICAgICAgIHNpemU6IDMwLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnbG9hZGluZydcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZGF0YVNvdXJjZS5sZW5ndGggJiYgUmVhY3QuY3JlYXRlRWxlbWVudChBdXRvQ29tcGxldGUsIHtcbiAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VhcmNoVGV4dDogZGlzcGxheVRleHQsXG4gICAgICAgICAgICAgICAgb25VcGRhdGVJbnB1dDogdGhpcy5oYW5kbGVVcGRhdGVJbnB1dCxcbiAgICAgICAgICAgICAgICBvbk5ld1JlcXVlc3Q6IHRoaXMuaGFuZGxlTmV3UmVxdWVzdCxcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlOiBkYXRhU291cmNlLFxuICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2xhYmVsJ10sXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmdW5jdGlvbiAoc2VhcmNoVGV4dCwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgha2V5IHx8ICFzZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKSA9PT0gMDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wZW5PbkZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1lbnVQcm9wczogeyBtYXhIZWlnaHQ6IDIwMCB9XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEF1dG9jb21wbGV0ZUJveCA9IF9taXhpbnNGaWVsZFdpdGhDaG9pY2VzMlsnZGVmYXVsdCddKEF1dG9jb21wbGV0ZUJveCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBBdXRvY29tcGxldGVCb3g7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoLmRlYm91bmNlJyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBBdXRvQ29tcGxldGUgPSBfcmVxdWlyZS5BdXRvQ29tcGxldGU7XG52YXIgTWVudUl0ZW0gPSBfcmVxdWlyZS5NZW51SXRlbTtcbnZhciBSZWZyZXNoSW5kaWNhdG9yID0gX3JlcXVpcmUuUmVmcmVzaEluZGljYXRvcjtcbnZhciBGb250SWNvbiA9IF9yZXF1aXJlLkZvbnRJY29uO1xuXG52YXIgQXV0b2NvbXBsZXRlVHJlZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0F1dG9jb21wbGV0ZVRyZWUnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBoYW5kbGVVcGRhdGVJbnB1dDogZnVuY3Rpb24gaGFuZGxlVXBkYXRlSW5wdXQoc2VhcmNoVGV4dCkge1xuICAgICAgICB0aGlzLmRlYm91bmNlZCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VhcmNoVGV4dDogc2VhcmNoVGV4dCB9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlTmV3UmVxdWVzdDogZnVuY3Rpb24gaGFuZGxlTmV3UmVxdWVzdChjaG9zZW5WYWx1ZSkge1xuICAgICAgICB2YXIga2V5ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoY2hvc2VuVmFsdWUua2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGtleSA9IGNob3NlblZhbHVlLmtleTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleSA9IGNob3NlblZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25DaGFuZ2UobnVsbCwga2V5KTtcbiAgICAgICAgdGhpcy5sb2FkVmFsdWVzKGtleSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICB0aGlzLmRlYm91bmNlZCA9IGRlYm91bmNlKHRoaXMubG9hZFZhbHVlcy5iaW5kKHRoaXMpLCAzMDApO1xuICAgICAgICB0aGlzLmxhc3RTZWFyY2ggPSBudWxsO1xuICAgICAgICB2YXIgdmFsdWUgPSBcIlwiO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9hZFZhbHVlcyh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGxvYWRWYWx1ZXM6IGZ1bmN0aW9uIGxvYWRWYWx1ZXMoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgdmFyIGJhc2VQYXRoID0gdmFsdWU7XG4gICAgICAgIGlmICghdmFsdWUgJiYgdGhpcy5zdGF0ZS5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICB2YXIgbGFzdCA9IHRoaXMuc3RhdGUuc2VhcmNoVGV4dC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLnN0YXRlLnNlYXJjaFRleHQuc3Vic3RyKDAsIGxhc3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxhc3RTZWFyY2ggIT09IG51bGwgJiYgdGhpcy5sYXN0U2VhcmNoID09PSBiYXNlUGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdFNlYXJjaCA9IGJhc2VQYXRoO1xuICAgICAgICAvLyBUT0RPIDogbG9hZCB2YWx1ZXMgZnJvbSBzZXJ2aWNlXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgIHZhciBkYXRhU291cmNlID0gW107XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUubm9kZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBpY29uID0gXCJtZGkgbWRpLWZvbGRlclwiO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnV1aWQuc3RhcnRzV2l0aChcIkRBVEFTT1VSQ0U6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGljb24gPSBcIm1kaSBtZGktZGF0YWJhc2VcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBub2RlLnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IG5vZGUucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBNZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEZvbnRJY29uLCB7IGNsYXNzTmFtZTogaWNvbiwgY29sb3I6ICcjNjE2MTYxJywgc3R5bGU6IHsgZmxvYXQ6ICdsZWZ0JywgbWFyZ2luUmlnaHQ6IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucGF0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkaXNwbGF5VGV4dCA9IHRoaXMuc3RhdGUudmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncHlkaW9mb3JtX2F1dG9jb21wbGV0ZScsIHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnIH0gfSxcbiAgICAgICAgICAgICFkYXRhU291cmNlLmxlbmd0aCAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlZnJlc2hJbmRpY2F0b3IsIHtcbiAgICAgICAgICAgICAgICBzaXplOiAzMCxcbiAgICAgICAgICAgICAgICByaWdodDogMTAsXG4gICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ2xvYWRpbmcnXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXV0b0NvbXBsZXRlLCB7XG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlYXJjaFRleHQ6IGRpc3BsYXlUZXh0LFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlSW5wdXQ6IHRoaXMuaGFuZGxlVXBkYXRlSW5wdXQsXG4gICAgICAgICAgICAgICAgb25OZXdSZXF1ZXN0OiB0aGlzLmhhbmRsZU5ld1JlcXVlc3QsXG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZTogZGF0YVNvdXJjZSxcbiAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydsYWJlbCddLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKHNlYXJjaFRleHQsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpID09PSAwO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3Blbk9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVudVByb3BzOiB7IG1heEhlaWdodDogMjAwIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQXV0b2NvbXBsZXRlVHJlZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuLyoqXG4gKiBVSSB0byBkcm9wIGEgZmlsZSAob3IgY2xpY2sgdG8gYnJvd3NlKSwgdXNlZCBieSB0aGUgSW5wdXRJbWFnZSBjb21wb25lbnQuXG4gKi9cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiBcIkZpbGVEcm9wem9uZVwiLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdXBwb3J0Q2xpY2s6IHRydWUsXG4gICAgICAgICAgICBtdWx0aXBsZTogdHJ1ZSxcbiAgICAgICAgICAgIG9uRHJvcDogZnVuY3Rpb24gb25Ecm9wKCkge31cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc0RyYWdBY3RpdmU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBvbkRyb3A6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGlnbm9yZU5hdGl2ZURyb3A6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICBzaXplOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgICBzdHlsZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgZHJhZ0FjdGl2ZVN0eWxlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBzdXBwb3J0Q2xpY2s6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICBhY2NlcHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG11bHRpcGxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuICAgIH0sXG5cbiAgICBvbkRyYWdMZWF2ZTogZnVuY3Rpb24gb25EcmFnTGVhdmUoZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzRHJhZ0FjdGl2ZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uRHJhZ092ZXI6IGZ1bmN0aW9uIG9uRHJhZ092ZXIoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcImNvcHlcIjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzRHJhZ0FjdGl2ZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25GaWxlUGlja2VkOiBmdW5jdGlvbiBvbkZpbGVQaWNrZWQoZSkge1xuICAgICAgICBpZiAoIWUudGFyZ2V0IHx8ICFlLnRhcmdldC5maWxlcykgcmV0dXJuO1xuICAgICAgICB2YXIgZmlsZXMgPSBlLnRhcmdldC5maWxlcztcbiAgICAgICAgdmFyIG1heEZpbGVzID0gdGhpcy5wcm9wcy5tdWx0aXBsZSA/IGZpbGVzLmxlbmd0aCA6IDE7XG4gICAgICAgIGZpbGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZmlsZXMsIDAsIG1heEZpbGVzKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25Ecm9wKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRHJvcChmaWxlcywgZSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25Gb2xkZXJQaWNrZWQ6IGZ1bmN0aW9uIG9uRm9sZGVyUGlja2VkKGUpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25Gb2xkZXJQaWNrZWQpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Gb2xkZXJQaWNrZWQoZS50YXJnZXQuZmlsZXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uRHJvcDogZnVuY3Rpb24gb25Ecm9wKGUpIHtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzRHJhZ0FjdGl2ZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaWdub3JlTmF0aXZlRHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpbGVzID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgICAgIGZpbGVzID0gZS5kYXRhVHJhbnNmZXIuZmlsZXM7XG4gICAgICAgIH0gZWxzZSBpZiAoZS50YXJnZXQpIHtcbiAgICAgICAgICAgIGZpbGVzID0gZS50YXJnZXQuZmlsZXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWF4RmlsZXMgPSB0aGlzLnByb3BzLm11bHRpcGxlID8gZmlsZXMubGVuZ3RoIDogMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXhGaWxlczsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlc1tpXS5wcmV2aWV3ID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkRyb3ApIHtcbiAgICAgICAgICAgIGZpbGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZmlsZXMsIDAsIG1heEZpbGVzKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Ecm9wKGZpbGVzLCBlLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkNsaWNrOiBmdW5jdGlvbiBvbkNsaWNrKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zdXBwb3J0Q2xpY2sgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9wZW46IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgIHRoaXMucmVmcy5maWxlSW5wdXQuY2xpY2soKTtcbiAgICB9LFxuXG4gICAgb3BlbkZvbGRlclBpY2tlcjogZnVuY3Rpb24gb3BlbkZvbGRlclBpY2tlcigpIHtcbiAgICAgICAgdGhpcy5yZWZzLmZvbGRlcklucHV0LnNldEF0dHJpYnV0ZShcIndlYmtpdGRpcmVjdG9yeVwiLCBcInRydWVcIik7XG4gICAgICAgIHRoaXMucmVmcy5mb2xkZXJJbnB1dC5jbGljaygpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICB2YXIgY2xhc3NOYW1lID0gdGhpcy5wcm9wcy5jbGFzc05hbWUgfHwgJ2ZpbGUtZHJvcHpvbmUnO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc0RyYWdBY3RpdmUpIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnIGFjdGl2ZSc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5wcm9wcy5zaXplIHx8IDEwMCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5zaXplIHx8IDEwMFxuICAgICAgICB9O1xuICAgICAgICAvL2JvcmRlclN0eWxlOiB0aGlzLnN0YXRlLmlzRHJhZ0FjdGl2ZSA/IFwic29saWRcIiA6IFwiZGFzaGVkXCJcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc3R5bGUpIHtcbiAgICAgICAgICAgIHN0eWxlID0gX2V4dGVuZHMoe30sIHN0eWxlLCB0aGlzLnByb3BzLnN0eWxlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc0RyYWdBY3RpdmUgJiYgdGhpcy5wcm9wcy5kcmFnQWN0aXZlU3R5bGUpIHtcbiAgICAgICAgICAgIHN0eWxlID0gX2V4dGVuZHMoe30sIHN0eWxlLCB0aGlzLnByb3BzLmRyYWdBY3RpdmVTdHlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvbGRlcklucHV0ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lbmFibGVGb2xkZXJzKSB7XG4gICAgICAgICAgICBmb2xkZXJJbnB1dCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9LCBuYW1lOiBcInVzZXJmb2xkZXJcIiwgdHlwZTogXCJmaWxlXCIsIHJlZjogXCJmb2xkZXJJbnB1dFwiLCBvbkNoYW5nZTogdGhpcy5vbkZvbGRlclBpY2tlZCB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCBzdHlsZTogc3R5bGUsIG9uQ2xpY2s6IHRoaXMub25DbGljaywgb25EcmFnTGVhdmU6IHRoaXMub25EcmFnTGVhdmUsIG9uRHJhZ092ZXI6IHRoaXMub25EcmFnT3Zlciwgb25Ecm9wOiB0aGlzLm9uRHJvcCB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ25vbmUnIH0sIG5hbWU6IFwidXNlcmZpbGVcIiwgdHlwZTogXCJmaWxlXCIsIG11bHRpcGxlOiB0aGlzLnByb3BzLm11bHRpcGxlLCByZWY6IFwiZmlsZUlucHV0XCIsIHZhbHVlOiBcIlwiLCBvbkNoYW5nZTogdGhpcy5vbkZpbGVQaWNrZWQsIGFjY2VwdDogdGhpcy5wcm9wcy5hY2NlcHQgfSksXG4gICAgICAgICAgICBmb2xkZXJJbnB1dCxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgVG9nZ2xlID0gX3JlcXVpcmUuVG9nZ2xlO1xuXG4vKipcbiAqIEJvb2xlYW4gaW5wdXRcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnSW5wdXRCb29sZWFuJyxcblxuICAgIG1peGluczogW19taXhpbnNGb3JtTWl4aW4yWydkZWZhdWx0J11dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBza2lwQnVmZmVyQ2hhbmdlczogdHJ1ZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoZWNrOiBmdW5jdGlvbiBvbkNoZWNrKGV2ZW50LCBuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCB0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXJ0eTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0Qm9vbGVhblN0YXRlOiBmdW5jdGlvbiBnZXRCb29sZWFuU3RhdGUoKSB7XG4gICAgICAgIHZhciBib29sVmFsID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgaWYgKHR5cGVvZiBib29sVmFsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgYm9vbFZhbCA9IGJvb2xWYWwgPT0gXCJ0cnVlXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvb2xWYWw7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgYm9vbFZhbCA9IHRoaXMuZ2V0Qm9vbGVhblN0YXRlKCk7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVG9nZ2xlLCB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlZDogYm9vbFZhbCxcbiAgICAgICAgICAgICAgICBvblRvZ2dsZTogdGhpcy5vbkNoZWNrLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLmlzRGlzcGxheUZvcm0oKSA/IHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbCA6IG51bGwsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjogdGhpcy5pc0Rpc3BsYXlGb3JtKCkgPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zQWN0aW9uUnVubmVyTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvQWN0aW9uUnVubmVyTWl4aW4nKTtcblxudmFyIF9taXhpbnNBY3Rpb25SdW5uZXJNaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNBY3Rpb25SdW5uZXJNaXhpbik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBSYWlzZWRCdXR0b24gPSBfcmVxdWlyZS5SYWlzZWRCdXR0b247XG5cbi8qKlxuICogU2ltcGxlIFJhaXNlZEJ1dHRvbiBleGVjdXRpbmcgdGhlIGFwcGx5QnV0dG9uQWN0aW9uXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0lucHV0QnV0dG9uJyxcblxuICAgIG1peGluczogW19taXhpbnNBY3Rpb25SdW5uZXJNaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBhcHBseUJ1dHRvbjogZnVuY3Rpb24gYXBwbHlCdXR0b24oKSB7XG5cbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdGhpcy5wcm9wcy5hY3Rpb25DYWxsYmFjaztcbiAgICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAodHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSB0cmFuc3BvcnQucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0LnN0YXJ0c1dpdGgoJ1NVQ0NFU1M6JykpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLnB5ZGlvLmRpc3BsYXlNZXNzYWdlKCdTVUNDRVNTJywgdHJhbnNwb3J0LnJlc3BvbnNlVGV4dC5yZXBsYWNlKCdTVUNDRVNTOicsICcnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLnB5ZGlvLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIHRyYW5zcG9ydC5yZXNwb25zZVRleHQucmVwbGFjZSgnRVJST1I6JywgJycpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXBwbHlBY3Rpb24oY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmFpc2VkQnV0dG9uLCB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydsYWJlbCddLFxuICAgICAgICAgICAgb25Ub3VjaFRhcDogdGhpcy5hcHBseUJ1dHRvbixcbiAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX21peGluc0Zvcm1NaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9Gb3JtTWl4aW4nKTtcblxudmFyIF9taXhpbnNGb3JtTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRm9ybU1peGluKTtcblxudmFyIF9GaWxlRHJvcHpvbmUgPSByZXF1aXJlKCcuL0ZpbGVEcm9wem9uZScpO1xuXG52YXIgX0ZpbGVEcm9wem9uZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9GaWxlRHJvcHpvbmUpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxudmFyIF9weWRpb1V0aWxMYW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbExhbmcpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBOYXRpdmVGaWxlRHJvcFByb3ZpZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuTmF0aXZlRmlsZURyb3BQcm92aWRlcjtcblxuLy8gSnVzdCBlbmFibGUgdGhlIGRyb3AgbWVjaGFuaXNtLCBidXQgZG8gbm90aGluZywgaXQgaXMgbWFuYWdlZCBieSB0aGUgRmlsZURyb3B6b25lXG52YXIgQmluYXJ5RHJvcFpvbmUgPSBOYXRpdmVGaWxlRHJvcFByb3ZpZGVyKF9GaWxlRHJvcHpvbmUyWydkZWZhdWx0J10sIGZ1bmN0aW9uIChpdGVtcywgZmlsZXMsIHByb3BzKSB7fSk7XG5cbi8qKlxuICogVUkgZm9yIGRpc3BsYXlpbmcgYW5kIHVwbG9hZGluZyBhbiBpbWFnZSxcbiAqIHVzaW5nIHRoZSBiaW5hcnlDb250ZXh0IHN0cmluZy5cbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0lucHV0SW1hZ2UnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgYXR0cmlidXRlczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGJpbmFyeV9jb250ZXh0OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZ1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIHZhciBpbWdTcmMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICgobmV3UHJvcHMudmFsdWUgfHwgbmV3UHJvcHMuYmluYXJ5X2NvbnRleHQgJiYgbmV3UHJvcHMuYmluYXJ5X2NvbnRleHQgIT09IHRoaXMucHJvcHMuYmluYXJ5X2NvbnRleHQpICYmICF0aGlzLnN0YXRlLnJlc2V0KSB7XG4gICAgICAgICAgICBpbWdTcmMgPSB0aGlzLmdldEJpbmFyeVVybChuZXdQcm9wcywgdGhpcy5zdGF0ZS50ZW1wb3JhcnlCaW5hcnkgJiYgdGhpcy5zdGF0ZS50ZW1wb3JhcnlCaW5hcnkgPT09IG5ld1Byb3BzLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChuZXdQcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXSkge1xuICAgICAgICAgICAgaW1nU3JjID0gbmV3UHJvcHMuYXR0cmlidXRlc1snZGVmYXVsdEltYWdlJ107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGltZ1NyYykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGltYWdlU3JjOiBpbWdTcmMsIHJlc2V0OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgdmFyIGltZ1NyYyA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9yaWdpbmFsQmluYXJ5ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgaW1nU3JjID0gdGhpcy5nZXRCaW5hcnlVcmwodGhpcy5wcm9wcyk7XG4gICAgICAgICAgICBvcmlnaW5hbEJpbmFyeSA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXSkge1xuICAgICAgICAgICAgaW1nU3JjID0gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBpbWFnZVNyYzogaW1nU3JjLCBvcmlnaW5hbEJpbmFyeTogb3JpZ2luYWxCaW5hcnkgfTtcbiAgICB9LFxuXG4gICAgZ2V0QmluYXJ5VXJsOiBmdW5jdGlvbiBnZXRCaW5hcnlVcmwocHJvcHMpIHtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRDbGllbnQoKS5nZXRQeWRpb09iamVjdCgpO1xuICAgICAgICB2YXIgdXJsID0gcHlkaW8uUGFyYW1ldGVycy5nZXQoJ0VORFBPSU5UX1JFU1RfQVBJJykgKyBwcm9wcy5hdHRyaWJ1dGVzWydsb2FkQWN0aW9uJ107XG4gICAgICAgIHZhciBiSWQgPSBwcm9wcy52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BzLmJpbmFyeV9jb250ZXh0ICYmIHByb3BzLmJpbmFyeV9jb250ZXh0LmluZGV4T2YoJ3VzZXJfaWQ9JykgPT09IDApIHtcbiAgICAgICAgICAgIGJJZCA9IHByb3BzLmJpbmFyeV9jb250ZXh0LnJlcGxhY2UoJ3VzZXJfaWQ9JywgJycpO1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHVybC5yZXBsYWNlKCd7QklOQVJZfScsIGJJZCk7XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfSxcblxuICAgIGdldFVwbG9hZFVybDogZnVuY3Rpb24gZ2V0VXBsb2FkVXJsKCkge1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpLmdldFB5ZGlvT2JqZWN0KCk7XG4gICAgICAgIHZhciB1cmwgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnRU5EUE9JTlRfUkVTVF9BUEknKSArIHRoaXMucHJvcHMuYXR0cmlidXRlc1sndXBsb2FkQWN0aW9uJ107XG4gICAgICAgIHZhciBiSWQgPSAnJztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYmluYXJ5X2NvbnRleHQgJiYgdGhpcy5wcm9wcy5iaW5hcnlfY29udGV4dC5pbmRleE9mKCd1c2VyX2lkPScpID09PSAwKSB7XG4gICAgICAgICAgICBiSWQgPSB0aGlzLnByb3BzLmJpbmFyeV9jb250ZXh0LnJlcGxhY2UoJ3VzZXJfaWQ9JywgJycpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIGJJZCA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiSWQgPSBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS5jb21wdXRlU3RyaW5nU2x1Zyh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbXCJuYW1lXCJdICsgXCIucG5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHVybC5yZXBsYWNlKCd7QklOQVJZfScsIGJJZCk7XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfSxcblxuICAgIHVwbG9hZENvbXBsZXRlOiBmdW5jdGlvbiB1cGxvYWRDb21wbGV0ZShuZXdCaW5hcnlOYW1lKSB7XG4gICAgICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRlbXBvcmFyeUJpbmFyeTogbmV3QmluYXJ5TmFtZSxcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIGFkZGl0aW9uYWxGb3JtRGF0YSA9IHsgdHlwZTogJ2JpbmFyeScgfTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm9yaWdpbmFsQmluYXJ5KSB7XG4gICAgICAgICAgICAgICAgYWRkaXRpb25hbEZvcm1EYXRhWydvcmlnaW5hbF9iaW5hcnknXSA9IHRoaXMuc3RhdGUub3JpZ2luYWxCaW5hcnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld0JpbmFyeU5hbWUsIHByZXZWYWx1ZSwgYWRkaXRpb25hbEZvcm1EYXRhKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBodG1sVXBsb2FkOiBmdW5jdGlvbiBodG1sVXBsb2FkKCkge1xuICAgICAgICB3aW5kb3cuZm9ybU1hbmFnZXJIaWRkZW5JRnJhbWVTdWJtaXNzaW9uID0gKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIHRoaXMudXBsb2FkQ29tcGxldGUocmVzdWx0LnRyaW0oKSk7XG4gICAgICAgICAgICB3aW5kb3cuZm9ybU1hbmFnZXJIaWRkZW5JRnJhbWVTdWJtaXNzaW9uID0gbnVsbDtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWZzLnVwbG9hZEZvcm0uc3VibWl0KCk7XG4gICAgfSxcblxuICAgIG9uRHJvcDogZnVuY3Rpb24gb25Ecm9wKGZpbGVzLCBldmVudCwgZHJvcHpvbmUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBpZiAoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5zdXBwb3J0c1VwbG9hZCgpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgIF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpLmdldE9yVXBkYXRlSnd0KCkudGhlbihmdW5jdGlvbiAoand0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHhoclNldHRpbmdzID0geyBjdXN0b21IZWFkZXJzOiB7IEF1dGhvcml6YXRpb246ICdCZWFyZXIgJyArIGp3dCB9IH07XG4gICAgICAgICAgICAgICAgX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRDbGllbnQoKS51cGxvYWRGaWxlKGZpbGVzWzBdLCBcInVzZXJmaWxlXCIsICcnLCAoZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gSlNPTi5wYXJzZSh0cmFuc3BvcnQucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuYmluYXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZENvbXBsZXRlKHJlc3VsdC5iaW5hcnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKF90aGlzKSwgKGZ1bmN0aW9uICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMpLCBmdW5jdGlvbiAoY29tcHV0YWJsZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHByb2dyZXNzXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvbXB1dGFibGVFdmVudCk7XG4gICAgICAgICAgICAgICAgfSwgX3RoaXMuZ2V0VXBsb2FkVXJsKCksIHhoclNldHRpbmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5odG1sVXBsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xlYXJJbWFnZTogZnVuY3Rpb24gY2xlYXJJbWFnZSgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKGdsb2JhbC5jb25maXJtKCdEbyB5b3Ugd2FudCB0byByZW1vdmUgdGhlIGN1cnJlbnQgaW1hZ2U/JykpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByZXZWYWx1ZSA9IF90aGlzMi5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IHRydWVcbiAgICAgICAgICAgICAgICB9LCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKCcnLCBwcmV2VmFsdWUsIHsgdHlwZTogJ2JpbmFyeScgfSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZChfdGhpczIpKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBjb3ZlckltYWdlU3R5bGUgPSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKFwiICsgdGhpcy5zdGF0ZS5pbWFnZVNyYyArIFwiKVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZFBvc2l0aW9uOiBcIjUwJSA1MCVcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRTaXplOiBcImNvdmVyXCJcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGljb25zID0gW107XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUubG9hZGluZykge1xuICAgICAgICAgICAgaWNvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiAnc3Bpbm5lcicsIGNsYXNzTmFtZTogJ2ljb24tc3Bpbm5lciByb3RhdGluZycsIHN0eWxlOiB7IG9wYWNpdHk6ICcwJyB9IH0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGljb25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGtleTogJ2NhbWVyYScsIGNsYXNzTmFtZTogJ2ljb24tY2FtZXJhJywgc3R5bGU6IHsgb3BhY2l0eTogJzAnIH0gfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbWFnZS1sYWJlbCcgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmF0dHJpYnV0ZXMubGFiZWxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZm9ybScsXG4gICAgICAgICAgICAgICAgeyByZWY6ICd1cGxvYWRGb3JtJywgZW5jVHlwZTogJ211bHRpcGFydC9mb3JtLWRhdGEnLCB0YXJnZXQ6ICd1cGxvYWRlcl9oaWRkZW5faWZyYW1lJywgbWV0aG9kOiAncG9zdCcsIGFjdGlvbjogdGhpcy5nZXRVcGxvYWRVcmwoKSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBCaW5hcnlEcm9wWm9uZSxcbiAgICAgICAgICAgICAgICAgICAgeyBvbkRyb3A6IHRoaXMub25Ecm9wLCBhY2NlcHQ6ICdpbWFnZS8qJywgc3R5bGU6IGNvdmVySW1hZ2VTdHlsZSB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2JpbmFyeS1yZW1vdmUtYnV0dG9uJywgb25DbGljazogdGhpcy5jbGVhckltYWdlIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGtleTogJ3JlbW92ZScsIGNsYXNzTmFtZTogJ21kaSBtZGktY2xvc2UnIH0pLFxuICAgICAgICAgICAgICAgICcgUkVTRVQnXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScsIHsgc3R5bGU6IHsgZGlzcGxheTogXCJub25lXCIgfSwgaWQ6ICd1cGxvYWRlcl9oaWRkZW5faWZyYW1lJywgbmFtZTogJ3VwbG9hZGVyX2hpZGRlbl9pZnJhbWUnIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNGb3JtTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvRm9ybU1peGluJyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0Zvcm1NaXhpbik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVhY3RNVUkgPSByZXF1aXJlKCdtYXRlcmlhbC11aS1sZWdhY3knKTtcblxuLyoqXG4gKiBUZXh0IGlucHV0IHRoYXQgaXMgY29udmVydGVkIHRvIGludGVnZXIsIGFuZFxuICogdGhlIFVJIGNhbiByZWFjdCB0byBhcnJvd3MgZm9yIGluY3JlbWVudGluZy9kZWNyZW1lbnRpbmcgdmFsdWVzXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0lucHV0SW50ZWdlcicsXG5cbiAgICBtaXhpbnM6IFtfbWl4aW5zRm9ybU1peGluMlsnZGVmYXVsdCddXSxcblxuICAgIGtleURvd246IGZ1bmN0aW9uIGtleURvd24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGluYyA9IDAsXG4gICAgICAgICAgICBtdWx0aXBsZSA9IDE7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT0gJ0VudGVyJykge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVFZGl0TW9kZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PSAnQXJyb3dVcCcpIHtcbiAgICAgICAgICAgIGluYyA9ICsxO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PSAnQXJyb3dEb3duJykge1xuICAgICAgICAgICAgaW5jID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBtdWx0aXBsZSA9IDEwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJzZWQgPSBwYXJzZUludCh0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICAgICAgaWYgKGlzTmFOKHBhcnNlZCkpIHBhcnNlZCA9IDA7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnNlZCArIGluYyAqIG11bHRpcGxlO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKG51bGwsIHZhbHVlKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRGlzcGxheUdyaWQoKSAmJiAhdGhpcy5zdGF0ZS5lZGl0TW9kZSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgb25DbGljazogdGhpcy5wcm9wcy5kaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdGhpcy50b2dnbGVFZGl0TW9kZSwgY2xhc3NOYW1lOiB2YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgIXZhbHVlID8gJ0VtcHR5JyA6IHZhbHVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGludHZhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaW50dmFsID0gcGFyc2VJbnQodGhpcy5zdGF0ZS52YWx1ZSkgKyAnJztcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oaW50dmFsKSkgaW50dmFsID0gdGhpcy5zdGF0ZS52YWx1ZSArICcnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnR2YWwgPSAnMCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbnRlZ2VyLWlucHV0JyB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3RNVUkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpbnR2YWwsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMua2V5RG93bixcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLmlzRGlzcGxheUZvcm0oKSA/IHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbCA6IG51bGxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgX21peGluc0ZpZWxkV2l0aENob2ljZXMgPSByZXF1aXJlKCcuLi9taXhpbnMvRmllbGRXaXRoQ2hvaWNlcycpO1xuXG52YXIgX21peGluc0ZpZWxkV2l0aENob2ljZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRmllbGRXaXRoQ2hvaWNlcyk7XG5cbi8qKlxuICogU2VsZWN0IGJveCBpbnB1dCBjb25mb3JtaW5nIHRvIFB5ZGlvIHN0YW5kYXJkIGZvcm0gcGFyYW1ldGVyLlxuICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBTZWxlY3RGaWVsZCA9IF9yZXF1aXJlLlNlbGVjdEZpZWxkO1xudmFyIE1lbnVJdGVtID0gX3JlcXVpcmUuTWVudUl0ZW07XG52YXIgQ2hpcCA9IF9yZXF1aXJlLkNoaXA7XG5cbnZhciBMYW5nVXRpbHMgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcbnZhciBJbnB1dFNlbGVjdEJveCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0lucHV0U2VsZWN0Qm94JyxcblxuICAgIG1peGluczogW19taXhpbnNGb3JtTWl4aW4yWydkZWZhdWx0J11dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBza2lwQnVmZmVyQ2hhbmdlczogdHJ1ZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkRyb3BEb3duQ2hhbmdlOiBmdW5jdGlvbiBvbkRyb3BEb3duQ2hhbmdlKGV2ZW50LCBpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5vbkNoYW5nZShldmVudCwgdmFsdWUpO1xuICAgICAgICB0aGlzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgfSxcblxuICAgIG9uTXVsdGlwbGVTZWxlY3Q6IGZ1bmN0aW9uIG9uTXVsdGlwbGVTZWxlY3QoZXZlbnQsIGluZGV4LCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAobmV3VmFsdWUgPT0gLTEpIHJldHVybjtcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgIHZhciBjdXJyZW50VmFsdWVzID0gdHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gJ3N0cmluZycgPyBjdXJyZW50VmFsdWUuc3BsaXQoJywnKSA6IGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWVzLmluZGV4T2YobmV3VmFsdWUpICE9PSAtMSkge1xuICAgICAgICAgICAgY3VycmVudFZhbHVlcy5wdXNoKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2UoZXZlbnQsIGN1cnJlbnRWYWx1ZXMuam9pbignLCcpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgfSxcblxuICAgIG9uTXVsdGlwbGVSZW1vdmU6IGZ1bmN0aW9uIG9uTXVsdGlwbGVSZW1vdmUodmFsdWUpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgIHZhciBjdXJyZW50VmFsdWVzID0gdHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gJ3N0cmluZycgPyBjdXJyZW50VmFsdWUuc3BsaXQoJywnKSA6IGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSkgIT09IC0xKSB7XG4gICAgICAgICAgICBjdXJyZW50VmFsdWVzID0gTGFuZ1V0aWxzLmFycmF5V2l0aG91dChjdXJyZW50VmFsdWVzLCBjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpKTtcbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2UobnVsbCwgY3VycmVudFZhbHVlcy5qb2luKCcsJykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICB2YXIgbWVudUl0ZW1zID0gW10sXG4gICAgICAgICAgICBtdWx0aXBsZU9wdGlvbnMgPSBbXSxcbiAgICAgICAgICAgIG1hbmRhdG9yeSA9IHRydWU7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydtYW5kYXRvcnknXSB8fCB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddICE9IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICBtYW5kYXRvcnkgPSBmYWxzZTtcbiAgICAgICAgICAgIG1lbnVJdGVtcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgdmFsdWU6IC0xLCBwcmltYXJ5VGV4dDogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydsYWJlbCddICsgJy4uLicgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjaG9pY2VzID0gdGhpcy5wcm9wcy5jaG9pY2VzO1xuXG4gICAgICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwgeyB2YWx1ZToga2V5LCBwcmltYXJ5VGV4dDogdmFsdWUgfSkpO1xuICAgICAgICAgICAgbXVsdGlwbGVPcHRpb25zLnB1c2goeyB2YWx1ZToga2V5LCBsYWJlbDogdmFsdWUgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5pc0Rpc3BsYXlHcmlkKCkgJiYgIXRoaXMuc3RhdGUuZWRpdE1vZGUgfHwgdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzLmdldCh2YWx1ZSkpIHZhbHVlID0gY2hvaWNlcy5nZXQodmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLnByb3BzLmRpc2FibGVkID8gZnVuY3Rpb24gKCkge30gOiB0aGlzLnRvZ2dsZUVkaXRNb2RlLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHZhbHVlID8gJycgOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICAhdmFsdWUgPyAnRW1wdHknIDogdmFsdWUsXG4gICAgICAgICAgICAgICAgJyDCoMKgJyxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdpY29uLWNhcmV0LWRvd24nIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGhhc1ZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5tdWx0aXBsZSAmJiB0aGlzLnByb3BzLm11bHRpcGxlID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlcyA9IGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWVzID0gY3VycmVudFZhbHVlLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaGFzVmFsdWUgPSBjdXJyZW50VmFsdWVzLmxlbmd0aCA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJtdWx0aXBsZSBoYXMtdmFsdWVcIiB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWVzLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDaGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uUmVxdWVzdERlbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm9uTXVsdGlwbGVSZW1vdmUodik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIFNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbk11bHRpcGxlU2VsZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVudUl0ZW1zXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgU2VsZWN0RmllbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uRHJvcERvd25DaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSW5wdXRTZWxlY3RCb3ggPSBfbWl4aW5zRmllbGRXaXRoQ2hvaWNlczJbJ2RlZmF1bHQnXShJbnB1dFNlbGVjdEJveCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBJbnB1dFNlbGVjdEJveDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNBY3Rpb25SdW5uZXJNaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9BY3Rpb25SdW5uZXJNaXhpbicpO1xuXG52YXIgX21peGluc0FjdGlvblJ1bm5lck1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0FjdGlvblJ1bm5lck1peGluKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnTW9uaXRvcmluZ0xhYmVsJyxcblxuICAgIG1peGluczogW19taXhpbnNBY3Rpb25SdW5uZXJNaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgdmFyIGxvYWRpbmdNZXNzYWdlID0gJ0xvYWRpbmcnO1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0ICYmIHRoaXMuY29udGV4dC5nZXRNZXNzYWdlKSB7XG4gICAgICAgICAgICBsb2FkaW5nTWVzc2FnZSA9IHRoaXMuY29udGV4dC5nZXRNZXNzYWdlKDQ2NiwgJycpO1xuICAgICAgICB9IGVsc2UgaWYgKGdsb2JhbC5weWRpbyAmJiBnbG9iYWwucHlkaW8uTWVzc2FnZUhhc2gpIHtcbiAgICAgICAgICAgIGxvYWRpbmdNZXNzYWdlID0gZ2xvYmFsLnB5ZGlvLk1lc3NhZ2VIYXNoWzQ2Nl07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBsb2FkaW5nTWVzc2FnZSB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IChmdW5jdGlvbiAodHJhbnNwb3J0KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc3RhdHVzOiB0cmFuc3BvcnQucmVzcG9uc2VUZXh0IH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9wb2xsZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5hcHBseUFjdGlvbihjYWxsYmFjayk7XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3BvbGxlcigpO1xuICAgICAgICB0aGlzLl9wZSA9IGdsb2JhbC5zZXRJbnRlcnZhbCh0aGlzLl9wb2xsZXIsIDEwMDAwKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBpZiAodGhpcy5fcGUpIHtcbiAgICAgICAgICAgIGdsb2JhbC5jbGVhckludGVydmFsKHRoaXMuX3BlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnN0YXR1c1xuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG4vKipcbiAqIFRleHQgaW5wdXQsIGNhbiBiZSBzaW5nbGUgbGluZSwgbXVsdGlMaW5lLCBvciBwYXNzd29yZCwgZGVwZW5kaW5nIG9uIHRoZVxuICogYXR0cmlidXRlcy50eXBlIGtleS5cbiAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVGV4dEZpZWxkJyxcblxuICAgIG1peGluczogW19taXhpbnNGb3JtTWl4aW4yWydkZWZhdWx0J11dLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRGlzcGxheUdyaWQoKSAmJiAhdGhpcy5zdGF0ZS5lZGl0TW9kZSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJyAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gJyoqKioqKioqKioqJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBvbkNsaWNrOiB0aGlzLnByb3BzLmRpc2FibGVkID8gZnVuY3Rpb24gKCkge30gOiB0aGlzLnRvZ2dsZUVkaXRNb2RlLCBjbGFzc05hbWU6IHZhbHVlID8gJycgOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICAhdmFsdWUgPyAnRW1wdHknIDogdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZmllbGQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLmlzRGlzcGxheUZvcm0oKSA/IHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbCA6IG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUgfHwgXCJcIixcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuZW50ZXJUb1RvZ2dsZSxcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJyA/ICdwYXNzd29yZCcgOiBudWxsLFxuICAgICAgICAgICAgICAgIG11bHRpTGluZTogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICd0ZXh0YXJlYScsXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiB0aGlzLnByb3BzLmVycm9yVGV4dCxcbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU6ICdvZmYnLFxuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2Zvcm0nLFxuICAgICAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogJ29mZicsIHN0eWxlOiB7IGRpc3BsYXk6ICdpbmxpbmUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX21peGluc0Zvcm1NaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9Gb3JtTWl4aW4nKTtcblxudmFyIF9taXhpbnNGb3JtTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRm9ybU1peGluKTtcblxudmFyIF9weWRpb1V0aWxQYXNzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXNzJyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXNzKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuLyoqXG4gKiBUZXh0IGlucHV0LCBjYW4gYmUgc2luZ2xlIGxpbmUsIG11bHRpTGluZSwgb3IgcGFzc3dvcmQsIGRlcGVuZGluZyBvbiB0aGVcbiAqIGF0dHJpYnV0ZXMudHlwZSBrZXkuXG4gKi9cblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1ZhbGlkTG9naW4nLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICB0ZXh0VmFsdWVDaGFuZ2VkOiBmdW5jdGlvbiB0ZXh0VmFsdWVDaGFuZ2VkKGV2ZW50LCB2YWx1ZSkge1xuICAgICAgICB2YXIgZXJyID0gX3B5ZGlvVXRpbFBhc3MyWydkZWZhdWx0J10uaXNWYWxpZExvZ2luKHZhbHVlKTtcbiAgICAgICAgdmFyIHByZXZTdGF0ZVZhbGlkID0gdGhpcy5zdGF0ZS52YWxpZDtcbiAgICAgICAgdmFyIHZhbGlkID0gIWVycjtcbiAgICAgICAgaWYgKHByZXZTdGF0ZVZhbGlkICE9PSB2YWxpZCAmJiB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSh2YWxpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbGlkOiB2YWxpZCwgZXJyOiBlcnIgfSk7XG5cbiAgICAgICAgdGhpcy5vbkNoYW5nZShldmVudCwgdmFsdWUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBpZiAodGhpcy5pc0Rpc3BsYXlHcmlkKCkgJiYgIXRoaXMuc3RhdGUuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICcqKioqKioqKioqKic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgb25DbGljazogdGhpcy5wcm9wcy5kaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdGhpcy50b2dnbGVFZGl0TW9kZSwgY2xhc3NOYW1lOiB2YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgIXZhbHVlID8gJ0VtcHR5JyA6IHZhbHVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGVyciA9IHRoaXMuc3RhdGUuZXJyO1xuXG4gICAgICAgICAgICB2YXIgZmllbGQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLmlzRGlzcGxheUZvcm0oKSA/IHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbCA6IG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUgfHwgXCJcIixcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnRleHRWYWx1ZUNoYW5nZWQoZSwgdik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuZW50ZXJUb1RvZ2dsZSxcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJyA/ICdwYXNzd29yZCcgOiBudWxsLFxuICAgICAgICAgICAgICAgIG11bHRpTGluZTogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICd0ZXh0YXJlYScsXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiB0aGlzLnByb3BzLmVycm9yVGV4dCB8fCBlcnIsXG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiAnb2ZmJyxcbiAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAgICAgICAgICAgeyBhdXRvQ29tcGxldGU6ICdvZmYnLCBzdHlsZTogeyBkaXNwbGF5OiAnaW5saW5lJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNGb3JtTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvRm9ybU1peGluJyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0Zvcm1NaXhpbik7XG5cbnZhciBQYXNzVXRpbHMgPSByZXF1aXJlKCdweWRpby91dGlsL3Bhc3MnKTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBUZXh0RmllbGQgPSBfcmVxdWlyZS5UZXh0RmllbGQ7XG5leHBvcnRzWydkZWZhdWx0J10gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdWYWxpZFBhc3N3b3JkJyxcblxuICAgIG1peGluczogW19taXhpbnNGb3JtTWl4aW4yWydkZWZhdWx0J11dLFxuXG4gICAgaXNWYWxpZDogZnVuY3Rpb24gaXNWYWxpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudmFsaWQ7XG4gICAgfSxcblxuICAgIGNoZWNrTWluTGVuZ3RoOiBmdW5jdGlvbiBjaGVja01pbkxlbmd0aCh2YWx1ZSkge1xuICAgICAgICB2YXIgbWluTGVuZ3RoID0gcGFyc2VJbnQoZ2xvYmFsLnB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoXCJjb3JlLmF1dGhcIikuZ2V0KFwiUEFTU1dPUkRfTUlOTEVOR1RIXCIpKTtcbiAgICAgICAgcmV0dXJuICEodmFsdWUgJiYgdmFsdWUubGVuZ3RoIDwgbWluTGVuZ3RoKTtcbiAgICB9LFxuXG4gICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShtZXNzYWdlSWQpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dCAmJiB0aGlzLmNvbnRleHQuZ2V0TWVzc2FnZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5nZXRNZXNzYWdlKG1lc3NhZ2VJZCwgJycpO1xuICAgICAgICB9IGVsc2UgaWYgKGdsb2JhbC5weWRpbyAmJiBnbG9iYWwucHlkaW8uTWVzc2FnZUhhc2gpIHtcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWwucHlkaW8uTWVzc2FnZUhhc2hbbWVzc2FnZUlkXTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVQYXNzU3RhdGU6IGZ1bmN0aW9uIHVwZGF0ZVBhc3NTdGF0ZSgpIHtcbiAgICAgICAgdmFyIHByZXZTdGF0ZVZhbGlkID0gdGhpcy5zdGF0ZS52YWxpZDtcbiAgICAgICAgdmFyIG5ld1N0YXRlID0gUGFzc1V0aWxzLmdldFN0YXRlKHRoaXMucmVmcy5wYXNzLmdldFZhbHVlKCksIHRoaXMucmVmcy5jb25maXJtID8gdGhpcy5yZWZzLmNvbmZpcm0uZ2V0VmFsdWUoKSA6ICcnKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICAgIGlmIChwcmV2U3RhdGVWYWxpZCAhPT0gbmV3U3RhdGUudmFsaWQgJiYgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UobmV3U3RhdGUudmFsaWQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uUGFzc3dvcmRDaGFuZ2U6IGZ1bmN0aW9uIG9uUGFzc3dvcmRDaGFuZ2UoZXZlbnQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVQYXNzU3RhdGUoKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZShldmVudCwgZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB9LFxuXG4gICAgb25Db25maXJtQ2hhbmdlOiBmdW5jdGlvbiBvbkNvbmZpcm1DaGFuZ2UoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbmZpcm1WYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZVBhc3NTdGF0ZSgpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKGV2ZW50LCB0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRGlzcGxheUdyaWQoKSAmJiAhdGhpcy5zdGF0ZS5lZGl0TW9kZSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgb25DbGljazogdGhpcy5wcm9wcy5kaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdGhpcy50b2dnbGVFZGl0TW9kZSwgY2xhc3NOYW1lOiB2YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgIXZhbHVlID8gJ0VtcHR5JyA6IHZhbHVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG92ZXJmbG93ID0geyBvdmVyZmxvdzogJ2hpZGRlbicsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsIHdpZHRoOiAnMTAwJScgfTtcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSB0aGlzLnN0YXRlLnZhbGlkID8gJycgOiAnbXVpLWVycm9yLWFzLWhpbnQnO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gdGhpcy5wcm9wcy5jbGFzc05hbWUgKyAnICcgKyBjbGFzc05hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgX2NvbmZpcm0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS52YWx1ZSAmJiAhdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIF9jb25maXJtID0gW1JlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsga2V5OiAnc2VwJywgc3R5bGU6IHsgd2lkdGg6IDIwIH0gfSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogJ2NvbmZpcm0nLFxuICAgICAgICAgICAgICAgICAgICByZWY6ICdjb25maXJtJyxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuZ2V0TWVzc2FnZSgxOTkpLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsU2hyaW5rU3R5bGU6IF9leHRlbmRzKHt9LCBvdmVyZmxvdywgeyB3aWR0aDogJzEzMCUnIH0pLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsU3R5bGU6IG92ZXJmbG93LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUuY29uZmlybVZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNvbmZpcm1DaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpTGluZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiB0aGlzLnN0YXRlLmNvbmZpcm1FcnJvclRleHRcbiAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZm9ybScsXG4gICAgICAgICAgICAgICAgeyBhdXRvQ29tcGxldGU6ICdvZmYnIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBtYXJnaW5Ub3A6IC0xNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdwYXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLmlzRGlzcGxheUZvcm0oKSA/IHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbCA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsU2hyaW5rU3R5bGU6IF9leHRlbmRzKHt9LCBvdmVyZmxvdywgeyB3aWR0aDogJzEzMCUnIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFN0eWxlOiBvdmVyZmxvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblBhc3N3b3JkQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLmVudGVyVG9Ub2dnbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlMaW5lOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiB0aGlzLnN0YXRlLnBhc3NFcnJvclRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIF9jb25maXJtXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zSGVscGVyTWl4aW4gPSByZXF1aXJlKCcuL21peGlucy9IZWxwZXJNaXhpbicpO1xuXG52YXIgX21peGluc0hlbHBlck1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0hlbHBlck1peGluKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9NYW5hZ2VyJyk7XG5cbnZhciBfbWFuYWdlck1hbmFnZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFuYWdlck1hbmFnZXIpO1xuXG52YXIgX2ZpZWxkc1RleHRGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGRzL1RleHRGaWVsZCcpO1xuXG52YXIgX2ZpZWxkc1RleHRGaWVsZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNUZXh0RmllbGQpO1xuXG52YXIgX2ZpZWxkc1ZhbGlkUGFzc3dvcmQgPSByZXF1aXJlKCcuL2ZpZWxkcy9WYWxpZFBhc3N3b3JkJyk7XG5cbnZhciBfZmllbGRzVmFsaWRQYXNzd29yZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNWYWxpZFBhc3N3b3JkKTtcblxudmFyIF9maWVsZHNJbnB1dEludGVnZXIgPSByZXF1aXJlKCcuL2ZpZWxkcy9JbnB1dEludGVnZXInKTtcblxudmFyIF9maWVsZHNJbnB1dEludGVnZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRJbnRlZ2VyKTtcblxudmFyIF9maWVsZHNJbnB1dEJvb2xlYW4gPSByZXF1aXJlKCcuL2ZpZWxkcy9JbnB1dEJvb2xlYW4nKTtcblxudmFyIF9maWVsZHNJbnB1dEJvb2xlYW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRCb29sZWFuKTtcblxudmFyIF9maWVsZHNJbnB1dEJ1dHRvbiA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0QnV0dG9uJyk7XG5cbnZhciBfZmllbGRzSW5wdXRCdXR0b24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRCdXR0b24pO1xuXG52YXIgX2ZpZWxkc01vbml0b3JpbmdMYWJlbCA9IHJlcXVpcmUoJy4vZmllbGRzL01vbml0b3JpbmdMYWJlbCcpO1xuXG52YXIgX2ZpZWxkc01vbml0b3JpbmdMYWJlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNNb25pdG9yaW5nTGFiZWwpO1xuXG52YXIgX2ZpZWxkc0lucHV0U2VsZWN0Qm94ID0gcmVxdWlyZSgnLi9maWVsZHMvSW5wdXRTZWxlY3RCb3gnKTtcblxudmFyIF9maWVsZHNJbnB1dFNlbGVjdEJveDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dFNlbGVjdEJveCk7XG5cbnZhciBfZmllbGRzQXV0b2NvbXBsZXRlQm94ID0gcmVxdWlyZSgnLi9maWVsZHMvQXV0b2NvbXBsZXRlQm94Jyk7XG5cbnZhciBfZmllbGRzQXV0b2NvbXBsZXRlQm94MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0F1dG9jb21wbGV0ZUJveCk7XG5cbnZhciBfZmllbGRzSW5wdXRJbWFnZSA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0SW1hZ2UnKTtcblxudmFyIF9maWVsZHNJbnB1dEltYWdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0lucHV0SW1hZ2UpO1xuXG52YXIgX3BhbmVsRm9ybVBhbmVsID0gcmVxdWlyZSgnLi9wYW5lbC9Gb3JtUGFuZWwnKTtcblxudmFyIF9wYW5lbEZvcm1QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYW5lbEZvcm1QYW5lbCk7XG5cbnZhciBfcGFuZWxGb3JtSGVscGVyID0gcmVxdWlyZSgnLi9wYW5lbC9Gb3JtSGVscGVyJyk7XG5cbnZhciBfcGFuZWxGb3JtSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhbmVsRm9ybUhlbHBlcik7XG5cbnZhciBfZmllbGRzRmlsZURyb3B6b25lID0gcmVxdWlyZSgnLi9maWVsZHMvRmlsZURyb3B6b25lJyk7XG5cbnZhciBfZmllbGRzRmlsZURyb3B6b25lMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0ZpbGVEcm9wem9uZSk7XG5cbnZhciBfZmllbGRzQXV0b2NvbXBsZXRlVHJlZSA9IHJlcXVpcmUoJy4vZmllbGRzL0F1dG9jb21wbGV0ZVRyZWUnKTtcblxudmFyIF9maWVsZHNBdXRvY29tcGxldGVUcmVlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0F1dG9jb21wbGV0ZVRyZWUpO1xuXG52YXIgUHlkaW9Gb3JtID0ge1xuICBIZWxwZXJNaXhpbjogX21peGluc0hlbHBlck1peGluMlsnZGVmYXVsdCddLFxuICBNYW5hZ2VyOiBfbWFuYWdlck1hbmFnZXIyWydkZWZhdWx0J10sXG4gIElucHV0VGV4dDogX2ZpZWxkc1RleHRGaWVsZDJbJ2RlZmF1bHQnXSxcbiAgVmFsaWRQYXNzd29yZDogX2ZpZWxkc1ZhbGlkUGFzc3dvcmQyWydkZWZhdWx0J10sXG4gIElucHV0Qm9vbGVhbjogX2ZpZWxkc0lucHV0Qm9vbGVhbjJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRJbnRlZ2VyOiBfZmllbGRzSW5wdXRJbnRlZ2VyMlsnZGVmYXVsdCddLFxuICBJbnB1dEJ1dHRvbjogX2ZpZWxkc0lucHV0QnV0dG9uMlsnZGVmYXVsdCddLFxuICBNb25pdG9yaW5nTGFiZWw6IF9maWVsZHNNb25pdG9yaW5nTGFiZWwyWydkZWZhdWx0J10sXG4gIElucHV0U2VsZWN0Qm94OiBfZmllbGRzSW5wdXRTZWxlY3RCb3gyWydkZWZhdWx0J10sXG4gIEF1dG9jb21wbGV0ZUJveDogX2ZpZWxkc0F1dG9jb21wbGV0ZUJveDJbJ2RlZmF1bHQnXSxcbiAgQXV0b2NvbXBsZXRlVHJlZTogX2ZpZWxkc0F1dG9jb21wbGV0ZVRyZWUyWydkZWZhdWx0J10sXG4gIElucHV0SW1hZ2U6IF9maWVsZHNJbnB1dEltYWdlMlsnZGVmYXVsdCddLFxuICBGb3JtUGFuZWw6IF9wYW5lbEZvcm1QYW5lbDJbJ2RlZmF1bHQnXSxcbiAgUHlkaW9IZWxwZXI6IF9wYW5lbEZvcm1IZWxwZXIyWydkZWZhdWx0J10sXG4gIEZpbGVEcm9wWm9uZTogX2ZpZWxkc0ZpbGVEcm9wem9uZTJbJ2RlZmF1bHQnXSxcbiAgY3JlYXRlRm9ybUVsZW1lbnQ6IF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXS5jcmVhdGVGb3JtRWxlbWVudFxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHlkaW9Gb3JtO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9maWVsZHNWYWxpZExvZ2luID0gcmVxdWlyZSgnLi4vZmllbGRzL1ZhbGlkTG9naW4nKTtcblxudmFyIF9maWVsZHNWYWxpZExvZ2luMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc1ZhbGlkTG9naW4pO1xuXG52YXIgWE1MVXRpbHMgPSByZXF1aXJlKCdweWRpby91dGlsL3htbCcpO1xudmFyIElucHV0Qm9vbGVhbiA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0lucHV0Qm9vbGVhbicpO1xudmFyIElucHV0VGV4dCA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL1RleHRGaWVsZCcpO1xudmFyIFZhbGlkUGFzc3dvcmQgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9WYWxpZFBhc3N3b3JkJyk7XG52YXIgSW5wdXRJbnRlZ2VyID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvSW5wdXRJbnRlZ2VyJyk7XG52YXIgSW5wdXRCdXR0b24gPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9JbnB1dEJ1dHRvbicpO1xudmFyIE1vbml0b3JpbmdMYWJlbCA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL01vbml0b3JpbmdMYWJlbCcpO1xudmFyIElucHV0SW1hZ2UgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9JbnB1dEltYWdlJyk7XG52YXIgU2VsZWN0Qm94ID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvSW5wdXRTZWxlY3RCb3gnKTtcbnZhciBBdXRvY29tcGxldGVCb3ggPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9BdXRvY29tcGxldGVCb3gnKTtcbnZhciBBdXRvY29tcGxldGVUcmVlID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvQXV0b2NvbXBsZXRlVHJlZScpO1xuXG4vKipcbiAqIFV0aWxpdHkgY2xhc3MgdG8gcGFyc2UgLyBoYW5kbGUgcHlkaW8gc3RhbmRhcmQgZm9ybSBkZWZpbml0aW9ucy92YWx1ZXMuXG4gKi9cblxudmFyIE1hbmFnZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE1hbmFnZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNYW5hZ2VyKTtcbiAgICB9XG5cbiAgICBNYW5hZ2VyLmhhc0hlbHBlciA9IGZ1bmN0aW9uIGhhc0hlbHBlcihwbHVnaW5JZCwgcGFyYW1OYW1lKSB7XG5cbiAgICAgICAgdmFyIGhlbHBlcnMgPSBNYW5hZ2VyLmdldEhlbHBlcnNDYWNoZSgpO1xuICAgICAgICByZXR1cm4gaGVscGVyc1twbHVnaW5JZF0gJiYgaGVscGVyc1twbHVnaW5JZF1bJ3BhcmFtZXRlcnMnXVtwYXJhbU5hbWVdO1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLmdldEhlbHBlcnNDYWNoZSA9IGZ1bmN0aW9uIGdldEhlbHBlcnNDYWNoZSgpIHtcbiAgICAgICAgaWYgKCFNYW5hZ2VyLkhFTFBFUlNfQ0FDSEUpIHtcbiAgICAgICAgICAgIHZhciBoZWxwZXJDYWNoZSA9IHt9O1xuICAgICAgICAgICAgdmFyIGhlbHBlcnMgPSBYTUxVdGlscy5YUGF0aFNlbGVjdE5vZGVzKHdpbmRvdy5weWRpby5SZWdpc3RyeS5nZXRYTUwoKSwgJ3BsdWdpbnMvKi9jbGllbnRfc2V0dGluZ3MvcmVzb3VyY2VzL2pzW0B0eXBlPVwiaGVscGVyXCJdJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhlbHBlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaGVscGVyTm9kZSA9IGhlbHBlcnNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHBsdWdpbiA9IGhlbHBlck5vZGUuZ2V0QXR0cmlidXRlKFwicGx1Z2luXCIpO1xuICAgICAgICAgICAgICAgIGhlbHBlckNhY2hlW3BsdWdpbl0gPSB7IG5hbWVzcGFjZTogaGVscGVyTm9kZS5nZXRBdHRyaWJ1dGUoJ2NsYXNzTmFtZScpLCBwYXJhbWV0ZXJzOiB7fSB9O1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbU5vZGVzID0gWE1MVXRpbHMuWFBhdGhTZWxlY3ROb2RlcyhoZWxwZXJOb2RlLCAncGFyYW1ldGVyJyk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBwYXJhbU5vZGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbU5vZGUgPSBwYXJhbU5vZGVzW2tdO1xuICAgICAgICAgICAgICAgICAgICBoZWxwZXJDYWNoZVtwbHVnaW5dWydwYXJhbWV0ZXJzJ11bcGFyYW1Ob2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWFuYWdlci5IRUxQRVJTX0NBQ0hFID0gaGVscGVyQ2FjaGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hbmFnZXIuSEVMUEVSU19DQUNIRTtcbiAgICB9O1xuXG4gICAgTWFuYWdlci5wYXJzZVBhcmFtZXRlcnMgPSBmdW5jdGlvbiBwYXJzZVBhcmFtZXRlcnMoeG1sRG9jdW1lbnQsIHF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiBYTUxVdGlscy5YUGF0aFNlbGVjdE5vZGVzKHhtbERvY3VtZW50LCBxdWVyeSkubWFwKChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIE1hbmFnZXIucGFyYW1ldGVyTm9kZVRvSGFzaChub2RlKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIE1hbmFnZXIucGFyYW1ldGVyTm9kZVRvSGFzaCA9IGZ1bmN0aW9uIHBhcmFtZXRlck5vZGVUb0hhc2gocGFyYW1Ob2RlKSB7XG4gICAgICAgIHZhciBwYXJhbXNBdHRzID0gcGFyYW1Ob2RlLmF0dHJpYnV0ZXM7XG4gICAgICAgIHZhciBwYXJhbXNPYmplY3QgPSB7fTtcbiAgICAgICAgaWYgKHBhcmFtTm9kZS5wYXJlbnROb2RlICYmIHBhcmFtTm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUgJiYgcGFyYW1Ob2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIHBhcmFtc09iamVjdFtcInBsdWdpbklkXCJdID0gcGFyYW1Ob2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29sbGVjdENkYXRhID0gZmFsc2U7XG4gICAgICAgIHZhciBNZXNzYWdlSGFzaCA9IGdsb2JhbC5weWRpby5NZXNzYWdlSGFzaDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtc0F0dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhdHROYW1lID0gcGFyYW1zQXR0cy5pdGVtKGkpLm5vZGVOYW1lO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gcGFyYW1zQXR0cy5pdGVtKGkpLnZhbHVlO1xuICAgICAgICAgICAgaWYgKChhdHROYW1lID09PSBcImxhYmVsXCIgfHwgYXR0TmFtZSA9PT0gXCJkZXNjcmlwdGlvblwiIHx8IGF0dE5hbWUgPT09IFwiZ3JvdXBcIiB8fCBhdHROYW1lLmluZGV4T2YoXCJncm91cF9zd2l0Y2hfXCIpID09PSAwKSAmJiBNZXNzYWdlSGFzaFt2YWx1ZV0pIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IE1lc3NhZ2VIYXNoW3ZhbHVlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhdHROYW1lID09PSBcImNkYXRhdmFsdWVcIikge1xuICAgICAgICAgICAgICAgIGNvbGxlY3RDZGF0YSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJhbXNPYmplY3RbYXR0TmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sbGVjdENkYXRhKSB7XG4gICAgICAgICAgICBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPSBwYXJhbU5vZGUuZmlyc3RDaGlsZC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zT2JqZWN0Wyd0eXBlJ10gPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsndmFsdWUnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zT2JqZWN0Wyd2YWx1ZSddID0gcGFyYW1zT2JqZWN0Wyd2YWx1ZSddID09PSBcInRydWVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zT2JqZWN0WydkZWZhdWx0J10gPSBwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zT2JqZWN0Wyd0eXBlJ10gPT09ICdpbnRlZ2VyJykge1xuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsndmFsdWUnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zT2JqZWN0Wyd2YWx1ZSddID0gcGFyc2VJbnQocGFyYW1zT2JqZWN0Wyd2YWx1ZSddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zT2JqZWN0WydkZWZhdWx0J10gPSBwYXJzZUludChwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcmFtc09iamVjdDtcbiAgICB9O1xuXG4gICAgTWFuYWdlci5jcmVhdGVGb3JtRWxlbWVudCA9IGZ1bmN0aW9uIGNyZWF0ZUZvcm1FbGVtZW50KHByb3BzKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgc3dpdGNoIChwcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10pIHtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChJbnB1dEJvb2xlYW4sIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICBjYXNlICd0ZXh0YXJlYSc6XG4gICAgICAgICAgICBjYXNlICdwYXNzd29yZCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KElucHV0VGV4dCwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmFsaWQtcGFzc3dvcmQnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChWYWxpZFBhc3N3b3JkLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2YWxpZC1sb2dpbic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KF9maWVsZHNWYWxpZExvZ2luMlsnZGVmYXVsdCddLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbnRlZ2VyJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoSW5wdXRJbnRlZ2VyLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdidXR0b24nOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChJbnB1dEJ1dHRvbiwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbW9uaXRvcic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KE1vbml0b3JpbmdMYWJlbCwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW1hZ2UnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChJbnB1dEltYWdlLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChTZWxlY3RCb3gsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2F1dG9jb21wbGV0ZSc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KEF1dG9jb21wbGV0ZUJveCwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXV0b2NvbXBsZXRlLXRyZWUnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChBdXRvY29tcGxldGVUcmVlLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsZWdlbmQnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2hpZGRlbic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBwcm9wcy52YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAnRW1wdHknXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuXG4gICAgTWFuYWdlci5TbGFzaGVzVG9Kc29uID0gZnVuY3Rpb24gU2xhc2hlc1RvSnNvbih2YWx1ZXMpIHtcbiAgICAgICAgaWYgKHZhbHVlcyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB2YWx1ZXMgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZXdWYWx1ZXMgPSB7fTtcbiAgICAgICAgdmFyIHJlY3Vyc2VPbktleXMgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXModmFsdWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHZhbHVlc1trXTtcbiAgICAgICAgICAgIGlmIChrLmluZGV4T2YoJy8nKSA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFydHMgPSBrLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgdmFyIGZpcnN0UGFydCA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgdmFyIGxhc3RQYXJ0ID0gcGFydHMuam9pbignLycpO1xuICAgICAgICAgICAgICAgIGlmICghbmV3VmFsdWVzW2ZpcnN0UGFydF0pIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVzW2ZpcnN0UGFydF0gPSB7fTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBuZXdWYWx1ZXNbZmlyc3RQYXJ0XSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVzW2ZpcnN0UGFydF0gPSB7ICdAdmFsdWUnOiBuZXdWYWx1ZXNbZmlyc3RQYXJ0XSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdWYWx1ZXNbZmlyc3RQYXJ0XVtsYXN0UGFydF0gPSBkYXRhO1xuICAgICAgICAgICAgICAgIHJlY3Vyc2VPbktleXNbZmlyc3RQYXJ0XSA9IGZpcnN0UGFydDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlc1trXSAmJiB0eXBlb2YgbmV3VmFsdWVzW2tdID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNba11bJ0B2YWx1ZSddID0gZGF0YTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNba10gPSBkYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5rZXlzKHJlY3Vyc2VPbktleXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBuZXdWYWx1ZXNba2V5XSA9IE1hbmFnZXIuU2xhc2hlc1RvSnNvbihuZXdWYWx1ZXNba2V5XSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3VmFsdWVzO1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLkpzb25Ub1NsYXNoZXMgPSBmdW5jdGlvbiBKc29uVG9TbGFzaGVzKHZhbHVlcykge1xuICAgICAgICB2YXIgcHJlZml4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJycgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdmFyIG5ld1ZhbHVlcyA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyh2YWx1ZXMpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWVzW2tdID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHZhciBzdWJWYWx1ZXMgPSBNYW5hZ2VyLkpzb25Ub1NsYXNoZXModmFsdWVzW2tdLCBwcmVmaXggKyBrICsgJy8nKTtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZXMgPSBfZXh0ZW5kcyh7fSwgbmV3VmFsdWVzLCBzdWJWYWx1ZXMpO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZXNba11bJ0B2YWx1ZSddKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1twcmVmaXggKyBrXSA9IHZhbHVlc1trXVsnQHZhbHVlJ107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZXNbcHJlZml4ICsga10gPSB2YWx1ZXNba107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3VmFsdWVzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEV4dHJhY3QgUE9TVC1yZWFkeSB2YWx1ZXMgZnJvbSBhIGNvbWJvIHBhcmFtZXRlcnMvdmFsdWVzXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGVmaW5pdGlvbnMgQXJyYXkgU3RhbmRhcmQgRm9ybSBEZWZpbml0aW9uIGFycmF5XG4gICAgICogQHBhcmFtIHZhbHVlcyBPYmplY3QgS2V5L1ZhbHVlcyBvZiB0aGUgY3VycmVudCBmb3JtXG4gICAgICogQHBhcmFtIHByZWZpeCBTdHJpbmcgT3B0aW9uYWwgcHJlZml4IHRvIGFkZCB0byBhbGwgcGFyYW1ldGVycyAoYnkgZGVmYXVsdCBEUklWRVJfT1BUSU9OXykuXG4gICAgICogQHJldHVybnMgT2JqZWN0IE9iamVjdCB3aXRoIGFsbCBweWRpby1jb21wYXRpYmxlIFBPU1QgcGFyYW1ldGVyc1xuICAgICAqL1xuXG4gICAgTWFuYWdlci5nZXRWYWx1ZXNGb3JQT1NUID0gZnVuY3Rpb24gZ2V0VmFsdWVzRm9yUE9TVChkZWZpbml0aW9ucywgdmFsdWVzKSB7XG4gICAgICAgIHZhciBwcmVmaXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAnRFJJVkVSX09QVElPTl8nIDogYXJndW1lbnRzWzJdO1xuICAgICAgICB2YXIgYWRkaXRpb25hbE1ldGFkYXRhID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1szXTtcblxuICAgICAgICB2YXIgY2xpZW50UGFyYW1zID0ge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtc1twcmVmaXggKyBrZXldID0gdmFsdWVzW2tleV07XG4gICAgICAgICAgICAgICAgdmFyIGRlZlR5cGUgPSBudWxsO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgZGVmaW5pdGlvbnMubGVuZ3RoOyBkKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlZmluaXRpb25zW2RdWyduYW1lJ10gPT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZUeXBlID0gZGVmaW5pdGlvbnNbZF1bJ3R5cGUnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZGVmVHlwZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IGtleS5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdCwgcHJldjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBwYXJ0cy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYgPSBwYXJ0cy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGRlZmluaXRpb25zLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlZmluaXRpb25zW2tdWyduYW1lJ10gPT0gbGFzdCAmJiBkZWZpbml0aW9uc1trXVsnZ3JvdXBfc3dpdGNoX25hbWUnXSAmJiBkZWZpbml0aW9uc1trXVsnZ3JvdXBfc3dpdGNoX25hbWUnXSA9PSBwcmV2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZlR5cGUgPSBkZWZpbml0aW9uc1trXVsndHlwZSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWZpbml0aW9uc1trXVsnbmFtZSddID09IGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZUeXBlID0gZGVmaW5pdGlvbnNba11bJ3R5cGUnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vZGVmaW5pdGlvbnMubWFwKGZ1bmN0aW9uKGQpe2lmKGQubmFtZSA9PSB0aGVLZXkpIGRlZlR5cGUgPSBkLnR5cGV9KTtcbiAgICAgICAgICAgICAgICBpZiAoZGVmVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmVHlwZSA9PSBcImltYWdlXCIpIGRlZlR5cGUgPSBcImJpbmFyeVwiO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnRQYXJhbXNbcHJlZml4ICsga2V5ICsgJ19hanhwdHlwZSddID0gZGVmVHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFkZGl0aW9uYWxNZXRhZGF0YSAmJiBhZGRpdGlvbmFsTWV0YWRhdGFba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBtZXRhIGluIGFkZGl0aW9uYWxNZXRhZGF0YVtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWRkaXRpb25hbE1ldGFkYXRhW2tleV0uaGFzT3duUHJvcGVydHkobWV0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRQYXJhbXNbcHJlZml4ICsga2V5ICsgJ18nICsgbWV0YV0gPSBhZGRpdGlvbmFsTWV0YWRhdGFba2V5XVttZXRhXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlb3JkZXIgdHJlZSBrZXlzXG4gICAgICAgIHZhciBhbGxLZXlzID0gT2JqZWN0LmtleXMoY2xpZW50UGFyYW1zKTtcbiAgICAgICAgYWxsS2V5cy5zb3J0KCk7XG4gICAgICAgIGFsbEtleXMucmV2ZXJzZSgpO1xuICAgICAgICB2YXIgdHJlZUtleXMgPSB7fTtcbiAgICAgICAgYWxsS2V5cy5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKFwiL1wiKSA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgICAgIGlmIChrZXkuZW5kc1dpdGgoXCJfYWp4cHR5cGVcIikpIHJldHVybjtcbiAgICAgICAgICAgIHZhciB0eXBlS2V5ID0ga2V5ICsgXCJfYWp4cHR5cGVcIjtcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IGtleS5zcGxpdChcIi9cIik7XG4gICAgICAgICAgICB2YXIgcGFyZW50TmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgICAgICB2YXIgcGFyZW50S2V5O1xuICAgICAgICAgICAgd2hpbGUgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmVudEtleSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRLZXkgPSB0cmVlS2V5cztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnRLZXlbcGFyZW50TmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhcmVudEtleSA9IHBhcmVudEtleVtwYXJlbnROYW1lXTtcbiAgICAgICAgICAgICAgICBwYXJlbnROYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0eXBlID0gY2xpZW50UGFyYW1zW3R5cGVLZXldO1xuICAgICAgICAgICAgZGVsZXRlIGNsaWVudFBhcmFtc1t0eXBlS2V5XTtcbiAgICAgICAgICAgIGlmIChwYXJlbnRLZXkgJiYgIXBhcmVudEtleVtwYXJlbnROYW1lXSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2ID0gY2xpZW50UGFyYW1zW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXSA9IHYgPT0gXCJ0cnVlXCIgfHwgdiA9PSAxIHx8IHYgPT09IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiaW50ZWdlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXSA9IHBhcnNlSW50KGNsaWVudFBhcmFtc1trZXldKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgJiYgdHlwZS5zdGFydHNXaXRoKFwiZ3JvdXBfc3dpdGNoOlwiKSAmJiB0eXBlb2YgY2xpZW50UGFyYW1zW2tleV0gPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV0gPSB7IGdyb3VwX3N3aXRjaF92YWx1ZTogY2xpZW50UGFyYW1zW2tleV0gfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV0gPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmVudEtleSAmJiB0eXBlICYmIHR5cGUuc3RhcnRzV2l0aCgnZ3JvdXBfc3dpdGNoOicpKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdW1wiZ3JvdXBfc3dpdGNoX3ZhbHVlXCJdID0gY2xpZW50UGFyYW1zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgY2xpZW50UGFyYW1zW2tleV07XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKGtleSBpbiB0cmVlS2V5cykge1xuICAgICAgICAgICAgaWYgKCF0cmVlS2V5cy5oYXNPd25Qcm9wZXJ0eShrZXkpKSBjb250aW51ZTtcbiAgICAgICAgICAgIHZhciB0cmVlVmFsdWUgPSB0cmVlS2V5c1trZXldO1xuICAgICAgICAgICAgaWYgKGNsaWVudFBhcmFtc1trZXkgKyAnX2FqeHB0eXBlJ10gJiYgY2xpZW50UGFyYW1zW2tleSArICdfYWp4cHR5cGUnXS5pbmRleE9mKCdncm91cF9zd2l0Y2g6JykgPT09IDAgJiYgIXRyZWVWYWx1ZVsnZ3JvdXBfc3dpdGNoX3ZhbHVlJ10pIHtcbiAgICAgICAgICAgICAgICB0cmVlVmFsdWVbJ2dyb3VwX3N3aXRjaF92YWx1ZSddID0gY2xpZW50UGFyYW1zW2tleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsaWVudFBhcmFtc1trZXldID0gSlNPTi5zdHJpbmdpZnkodHJlZVZhbHVlKTtcbiAgICAgICAgICAgIGNsaWVudFBhcmFtc1trZXkgKyAnX2FqeHB0eXBlJ10gPSBcInRleHQvanNvblwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYW4gWFhYX2dyb3VwX3N3aXRjaCBwYXJhbWV0ZXJzXG4gICAgICAgIGZvciAodmFyIHRoZUtleSBpbiBjbGllbnRQYXJhbXMpIHtcbiAgICAgICAgICAgIGlmICghY2xpZW50UGFyYW1zLmhhc093blByb3BlcnR5KHRoZUtleSkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBpZiAodGhlS2V5LmluZGV4T2YoXCIvXCIpID09IC0xICYmIGNsaWVudFBhcmFtc1t0aGVLZXldICYmIGNsaWVudFBhcmFtc1t0aGVLZXkgKyBcIl9hanhwdHlwZVwiXSAmJiBjbGllbnRQYXJhbXNbdGhlS2V5ICsgXCJfYWp4cHR5cGVcIl0uc3RhcnRzV2l0aChcImdyb3VwX3N3aXRjaDpcIikpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNsaWVudFBhcmFtc1t0aGVLZXldID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50UGFyYW1zW3RoZUtleV0gPSBKU09OLnN0cmluZ2lmeSh7IGdyb3VwX3N3aXRjaF92YWx1ZTogY2xpZW50UGFyYW1zW3RoZUtleV0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtc1t0aGVLZXkgKyBcIl9hanhwdHlwZVwiXSA9IFwidGV4dC9qc29uXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNsaWVudFBhcmFtcy5oYXNPd25Qcm9wZXJ0eSh0aGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoZUtleS5lbmRzV2l0aChcIl9ncm91cF9zd2l0Y2hcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNsaWVudFBhcmFtc1t0aGVLZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjbGllbnRQYXJhbXM7XG4gICAgfTtcblxuICAgIHJldHVybiBNYW5hZ2VyO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTWFuYWdlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFBhdGhVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSB7XG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgYXR0cmlidXRlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBhcHBseUJ1dHRvbkFjdGlvbjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGFjdGlvbkNhbGxiYWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBhcHBseUFjdGlvbjogZnVuY3Rpb24gYXBwbHlBY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNob2ljZXNWYWx1ZSA9IHRoaXMucHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgdmFyIGZpcnN0UGFydCA9IGNob2ljZXNWYWx1ZS5zaGlmdCgpO1xuICAgICAgICBpZiAoZmlyc3RQYXJ0ID09PSBcInJ1bl9jbGllbnRfYWN0aW9uXCIgJiYgZ2xvYmFsLnB5ZGlvKSB7XG4gICAgICAgICAgICBnbG9iYWwucHlkaW8uZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oY2hvaWNlc1ZhbHVlLnNoaWZ0KCkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmFwcGx5QnV0dG9uQWN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IHsgYWN0aW9uOiBmaXJzdFBhcnQgfTtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzVmFsdWUubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnNbJ2FjdGlvbl9wbHVnaW5faWQnXSA9IGNob2ljZXNWYWx1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnNbJ2FjdGlvbl9wbHVnaW5fbWV0aG9kJ10gPSBjaG9pY2VzVmFsdWUuc2hpZnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ25hbWUnXS5pbmRleE9mKFwiL1wiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzWydidXR0b25fa2V5J10gPSBQYXRoVXRpbHMuZ2V0RGlybmFtZSh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ25hbWUnXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb3BzLmFwcGx5QnV0dG9uQWN0aW9uKHBhcmFtZXRlcnMsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgQ29tcG9uZW50ID0gX3JlcXVpcmUuQ29tcG9uZW50O1xuXG52YXIgX3JlcXVpcmUkcmVxdWlyZUxpYiA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgUHlkaW9Db250ZXh0Q29uc3VtZXIgPSBfcmVxdWlyZSRyZXF1aXJlTGliLlB5ZGlvQ29udGV4dENvbnN1bWVyO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoUHlkaW9Db21wb25lbnQpIHtcbiAgICB2YXIgRmllbGRXaXRoQ2hvaWNlcyA9IChmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICAgICAgICBfaW5oZXJpdHMoRmllbGRXaXRoQ2hvaWNlcywgX0NvbXBvbmVudCk7XG5cbiAgICAgICAgRmllbGRXaXRoQ2hvaWNlcy5wcm90b3R5cGUubG9hZEV4dGVybmFsVmFsdWVzID0gZnVuY3Rpb24gbG9hZEV4dGVybmFsVmFsdWVzKGNob2ljZXMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG5cbiAgICAgICAgICAgIHZhciBwYXJzZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB2YXIgbGlzdF9hY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoY2hvaWNlcyBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQ2hvaWNlc0xvYWRlZCkgdGhpcy5vbkNob2ljZXNMb2FkZWQoY2hvaWNlcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgY2hvaWNlczogY2hvaWNlcywgcGFyc2VkOiBwYXJzZWQgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG91dHB1dCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzLmluZGV4T2YoJ2pzb25fZmlsZTonKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHBhcnNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxpc3RfYWN0aW9uID0gY2hvaWNlcy5yZXBsYWNlKCdqc29uX2ZpbGU6JywgJycpO1xuICAgICAgICAgICAgICAgIG91dHB1dC5zZXQoJzAnLCBweWRpby5NZXNzYWdlSGFzaFsnYWp4cF9hZG1pbi5ob21lLjYnXSk7XG4gICAgICAgICAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkubG9hZEZpbGUobGlzdF9hY3Rpb24sIGZ1bmN0aW9uICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld091dHB1dCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zcG9ydC5yZXNwb25zZUpTT04pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydC5yZXNwb25zZUpTT04uZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdPdXRwdXQuc2V0KGVudHJ5LmtleSwgZW50cnkubGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHJhbnNwb3J0LnJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKHRyYW5zcG9ydC5yZXNwb25zZVRleHQpLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld091dHB1dC5zZXQoZW50cnkua2V5LCBlbnRyeS5sYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdoaWxlIHBhcnNpbmcgbGlzdCAnICsgY2hvaWNlcywgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBjaG9pY2VzOiBuZXdPdXRwdXQgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLm9uQ2hvaWNlc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm9uQ2hvaWNlc0xvYWRlZChuZXdPdXRwdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hvaWNlcyA9PT0gXCJQWURJT19BVkFJTEFCTEVfTEFOR1VBR0VTXCIpIHtcbiAgICAgICAgICAgICAgICBweWRpby5saXN0TGFuZ3VhZ2VzV2l0aENhbGxiYWNrKGZ1bmN0aW9uIChrZXksIGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5zZXQoa2V5LCBsYWJlbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25DaG9pY2VzTG9hZGVkKSB0aGlzLm9uQ2hvaWNlc0xvYWRlZChvdXRwdXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2VzID09PSBcIlBZRElPX0FWQUlMQUJMRV9SRVBPU0lUT1JJRVNcIikge1xuICAgICAgICAgICAgICAgIGlmIChweWRpby51c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLnVzZXIucmVwb3NpdG9yaWVzLmZvckVhY2goZnVuY3Rpb24gKHJlcG9zaXRvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXBvc2l0b3J5LmdldFJlcG9zaXRvcnlUeXBlKCkgIT09IFwiY2VsbFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnNldChyZXBvc2l0b3J5LmdldElkKCksIHJlcG9zaXRvcnkuZ2V0TGFiZWwoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkNob2ljZXNMb2FkZWQpIHRoaXMub25DaG9pY2VzTG9hZGVkKG91dHB1dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFBhcnNlIHN0cmluZyBhbmQgcmV0dXJuIG1hcFxuICAgICAgICAgICAgICAgIGNob2ljZXMuc3BsaXQoXCIsXCIpLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IGNob2ljZS5zcGxpdCgnfCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGxbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGxbMV07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGxhYmVsID0gY2hvaWNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChnbG9iYWwucHlkaW8uTWVzc2FnZUhhc2hbbGFiZWxdKSBsYWJlbCA9IGdsb2JhbC5weWRpby5NZXNzYWdlSGFzaFtsYWJlbF07XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5zZXQodmFsdWUsIGxhYmVsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IGNob2ljZXM6IG91dHB1dCwgcGFyc2VkOiBwYXJzZWQgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBGaWVsZFdpdGhDaG9pY2VzKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRmllbGRXaXRoQ2hvaWNlcyk7XG5cbiAgICAgICAgICAgIF9Db21wb25lbnQuY2FsbCh0aGlzLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICB2YXIgY2hvaWNlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGNob2ljZXMuc2V0KCcwJywgdGhpcy5wcm9wcy5weWRpbyA/IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJ2FqeHBfYWRtaW4uaG9tZS42J10gOiAnIC4uLiAnKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB7IGNob2ljZXM6IGNob2ljZXMsIGNob2ljZXNQYXJzZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cblxuICAgICAgICBGaWVsZFdpdGhDaG9pY2VzLnByb3RvdHlwZS5jb21wb25lbnREaWRNb3VudCA9IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9sb2FkRXh0ZXJuYWxWYWx1ZXMgPSB0aGlzLmxvYWRFeHRlcm5hbFZhbHVlcyh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hvaWNlcyA9IF9sb2FkRXh0ZXJuYWxWYWx1ZXMuY2hvaWNlcztcbiAgICAgICAgICAgICAgICB2YXIgcGFyc2VkID0gX2xvYWRFeHRlcm5hbFZhbHVlcy5wYXJzZWQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY2hvaWNlczogY2hvaWNlcywgY2hvaWNlc1BhcnNlZDogcGFyc2VkIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIEZpZWxkV2l0aENob2ljZXMucHJvdG90eXBlLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgICAgICBpZiAobmV3UHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddICYmIG5ld1Byb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSAhPT0gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10pIHtcbiAgICAgICAgICAgICAgICB2YXIgX2xvYWRFeHRlcm5hbFZhbHVlczIgPSB0aGlzLmxvYWRFeHRlcm5hbFZhbHVlcyhuZXdQcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10pO1xuXG4gICAgICAgICAgICAgICAgdmFyIGNob2ljZXMgPSBfbG9hZEV4dGVybmFsVmFsdWVzMi5jaG9pY2VzO1xuICAgICAgICAgICAgICAgIHZhciBwYXJzZWQgPSBfbG9hZEV4dGVybmFsVmFsdWVzMi5wYXJzZWQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlczogY2hvaWNlcyxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlc1BhcnNlZDogcGFyc2VkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgRmllbGRXaXRoQ2hvaWNlcy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHlkaW9Db21wb25lbnQsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB0aGlzLnN0YXRlKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIEZpZWxkV2l0aENob2ljZXM7XG4gICAgfSkoQ29tcG9uZW50KTtcblxuICAgIEZpZWxkV2l0aENob2ljZXMgPSBQeWRpb0NvbnRleHRDb25zdW1lcihGaWVsZFdpdGhDaG9pY2VzKTtcblxuICAgIHJldHVybiBGaWVsZFdpdGhDaG9pY2VzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUHlkaW9BcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuLyoqXG4gKiBSZWFjdCBNaXhpbiBmb3IgRm9ybSBFbGVtZW50XG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBhdHRyaWJ1dGVzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIG5hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblxuICAgICAgICBkaXNwbGF5Q29udGV4dDogUmVhY3QuUHJvcFR5cGVzLm9uZU9mKFsnZm9ybScsICdncmlkJ10pLFxuICAgICAgICBkaXNhYmxlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG11bHRpcGxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgdmFsdWU6IFJlYWN0LlByb3BUeXBlcy5hbnksXG4gICAgICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25DaGFuZ2VFZGl0TW9kZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGJpbmFyeV9jb250ZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBlcnJvclRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaXNwbGF5Q29udGV4dDogJ2Zvcm0nLFxuICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGlzRGlzcGxheUdyaWQ6IGZ1bmN0aW9uIGlzRGlzcGxheUdyaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmRpc3BsYXlDb250ZXh0ID09ICdncmlkJztcbiAgICB9LFxuXG4gICAgaXNEaXNwbGF5Rm9ybTogZnVuY3Rpb24gaXNEaXNwbGF5Rm9ybSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZGlzcGxheUNvbnRleHQgPT0gJ2Zvcm0nO1xuICAgIH0sXG5cbiAgICB0b2dnbGVFZGl0TW9kZTogZnVuY3Rpb24gdG9nZ2xlRWRpdE1vZGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRGlzcGxheUZvcm0oKSkgcmV0dXJuO1xuICAgICAgICB2YXIgbmV3U3RhdGUgPSAhdGhpcy5zdGF0ZS5lZGl0TW9kZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiBuZXdTdGF0ZSB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VFZGl0TW9kZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZUVkaXRNb2RlKG5ld1N0YXRlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBlbnRlclRvVG9nZ2xlOiBmdW5jdGlvbiBlbnRlclRvVG9nZ2xlKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT0gJ0VudGVyJykge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVFZGl0TW9kZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGJ1ZmZlckNoYW5nZXM6IGZ1bmN0aW9uIGJ1ZmZlckNoYW5nZXMobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlclByb3BzT25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIG9uQ2hhbmdlKGV2ZW50LCB2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsdWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldFZhbHVlID8gZXZlbnQuY3VycmVudFRhcmdldC5nZXRWYWx1ZSgpIDogZXZlbnQuY3VycmVudFRhcmdldC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jaGFuZ2VUaW1lb3V0KSB7XG4gICAgICAgICAgICBnbG9iYWwuY2xlYXJUaW1lb3V0KHRoaXMuY2hhbmdlVGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gdmFsdWUsXG4gICAgICAgICAgICBvbGRWYWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNraXBCdWZmZXJDaGFuZ2VzKSB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXJQcm9wc09uQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXJ0eTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnNraXBCdWZmZXJDaGFuZ2VzKSB7XG4gICAgICAgICAgICB2YXIgdGltZXJMZW5ndGggPSAyNTA7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgICAgICB0aW1lckxlbmd0aCA9IDEyMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNoYW5nZVRpbWVvdXQgPSBnbG9iYWwuc2V0VGltZW91dCgoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyQ2hhbmdlcyhuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSwgdGltZXJMZW5ndGgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHRyaWdnZXJQcm9wc09uQ2hhbmdlOiBmdW5jdGlvbiB0cmlnZ2VyUHJvcHNPbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSwgeyB0eXBlOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlLFxuICAgICAgICAgICAgZGlydHk6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVkaXRNb2RlOiBmYWxzZSxcbiAgICAgICAgICAgIGRpcnR5OiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlXG4gICAgICAgIH07XG4gICAgfVxuXG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG4vKipcbiAqIFJlYWN0IE1peGluIGZvciB0aGUgZm9ybSBoZWxwZXIgOiBkZWZhdWx0IHByb3BlcnRpZXMgdGhhdFxuICogaGVscGVycyBjYW4gcmVjZWl2ZVxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSB7XG4gIHByb3BUeXBlczoge1xuICAgIHBhcmFtTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBwYXJhbUF0dHJpYnV0ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgdmFsdWVzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIHVwZGF0ZUNhbGxiYWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX21hbmFnZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi4vbWFuYWdlci9NYW5hZ2VyJyk7XG5cbnZhciBfbWFuYWdlck1hbmFnZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFuYWdlck1hbmFnZXIpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUkcmVxdWlyZUxpYiA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQXN5bmNDb21wb25lbnQgPSBfcmVxdWlyZSRyZXF1aXJlTGliLkFzeW5jQ29tcG9uZW50O1xuXG4vKipcbiAqIERpc3BsYXkgYSBmb3JtIGNvbXBhbmlvbiBsaW5rZWQgdG8gYSBnaXZlbiBpbnB1dC5cbiAqIFByb3BzOiBoZWxwZXJEYXRhIDogY29udGFpbnMgdGhlIHBsdWdpbklkIGFuZCB0aGUgd2hvbGUgcGFyYW1BdHRyaWJ1dGVzXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0Zvcm1IZWxwZXInLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGhlbHBlckRhdGE6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGNsb3NlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIGNsb3NlSGVscGVyOiBmdW5jdGlvbiBjbG9zZUhlbHBlcigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5jbG9zZSgpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGhlbHBlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaGVscGVyRGF0YSkge1xuICAgICAgICAgICAgdmFyIGhlbHBlcnNDYWNoZSA9IF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXS5nZXRIZWxwZXJzQ2FjaGUoKTtcbiAgICAgICAgICAgIHZhciBwbHVnaW5IZWxwZXJOYW1lc3BhY2UgPSBoZWxwZXJzQ2FjaGVbdGhpcy5wcm9wcy5oZWxwZXJEYXRhWydwbHVnaW5JZCddXVsnbmFtZXNwYWNlJ107XG4gICAgICAgICAgICBoZWxwZXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaGVscGVyLXRpdGxlJyB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdoZWxwZXItY2xvc2UgbWRpIG1kaS1jbG9zZScsIG9uQ2xpY2s6IHRoaXMuY2xvc2VIZWxwZXIgfSksXG4gICAgICAgICAgICAgICAgICAgICdQeWRpbyBDb21wYW5pb24nXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdoZWxwZXItY29udGVudCcgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChBc3luY0NvbXBvbmVudCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMuaGVscGVyRGF0YSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBwbHVnaW5IZWxwZXJOYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROYW1lOiAnSGVscGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogdGhpcy5wcm9wcy5oZWxwZXJEYXRhWydwYXJhbUF0dHJpYnV0ZXMnXVsnbmFtZSddXG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncHlkaW8tZm9ybS1oZWxwZXInICsgKGhlbHBlciA/ICcgaGVscGVyLXZpc2libGUnIDogJyBoZWxwZXItZW1wdHknKSwgc3R5bGU6IHsgekluZGV4OiAxIH0gfSxcbiAgICAgICAgICAgIGhlbHBlclxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX0dyb3VwU3dpdGNoUGFuZWwgPSByZXF1aXJlKCcuL0dyb3VwU3dpdGNoUGFuZWwnKTtcblxudmFyIF9Hcm91cFN3aXRjaFBhbmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0dyb3VwU3dpdGNoUGFuZWwpO1xuXG52YXIgX1JlcGxpY2F0aW9uUGFuZWwgPSByZXF1aXJlKCcuL1JlcGxpY2F0aW9uUGFuZWwnKTtcblxudmFyIF9SZXBsaWNhdGlvblBhbmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1JlcGxpY2F0aW9uUGFuZWwpO1xuXG52YXIgX21hbmFnZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi4vbWFuYWdlci9NYW5hZ2VyJyk7XG5cbnZhciBfbWFuYWdlck1hbmFnZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFuYWdlck1hbmFnZXIpO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcgPSByZXF1aXJlKFwicHlkaW8vdXRpbC9sYW5nXCIpO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsTGFuZyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoXCJtYXRlcmlhbC11aVwiKTtcblxuLyoqXG4gKiBGb3JtIFBhbmVsIGlzIGEgcmVhZHkgdG8gdXNlIGZvcm0gYnVpbGRlciBpbmhlcml0ZWQgZm9yIFB5ZGlvJ3MgbGVnYWN5IHBhcmFtZXRlcnMgZm9ybWF0cyAoJ3N0YW5kYXJkIGZvcm0nKS5cbiAqIEl0IGlzIHZlcnkgdmVyc2F0aWxlIGFuZCBjYW4gYmFzaWNhbGx5IHRha2UgYSBzZXQgb2YgcGFyYW1ldGVycyBkZWZpbmVkIGluIHRoZSBYTUwgbWFuaWZlc3RzIChvciBkZWZpbmVkIG1hbnVhbGx5XG4gKiBpbiBKUykgYW5kIGRpc3BsYXkgdGhlbSBhcyBhIHVzZXIgZm9ybS5cbiAqIEl0IGlzIGEgY29udHJvbGxlZCBjb21wb25lbnQ6IGl0IHRha2VzIGEge3ZhbHVlc30gb2JqZWN0IGFuZCB0cmlnZ2VycyBiYWNrIGFuIG9uQ2hhbmdlKCkgZnVuY3Rpb24uXG4gKlxuICogU2VlIGFsc28gTWFuYWdlciBjbGFzcyB0byBnZXQgc29tZSB1dGlsaXRhcnkgZnVuY3Rpb25zIHRvIHBhcnNlIHBhcmFtZXRlcnMgYW5kIGV4dHJhY3QgdmFsdWVzIGZvciB0aGUgZm9ybS5cbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0Zvcm1QYW5lbCcsXG5cbiAgICBfaGlkZGVuVmFsdWVzOiB7fSxcbiAgICBfaW50ZXJuYWxWYWxpZDogbnVsbCxcbiAgICBfcGFyYW1ldGVyc01ldGFkYXRhOiBudWxsLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcnJheSBvZiBQeWRpbyBTdGFuZGFyZEZvcm0gcGFyYW1ldGVyc1xuICAgICAgICAgKi9cbiAgICAgICAgcGFyYW1ldGVyczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgICAvKipcbiAgICAgICAgICogT2JqZWN0IGNvbnRhaW5pbmcgdmFsdWVzIGZvciB0aGUgcGFyYW1ldGVyc1xuICAgICAgICAgKi9cbiAgICAgICAgdmFsdWVzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXIgdW5pdGFyeSBmdW5jdGlvbiB3aGVuIG9uZSBmb3JtIGlucHV0IGNoYW5nZXMuXG4gICAgICAgICAqL1xuICAgICAgICBvblBhcmFtZXRlckNoYW5nZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogU2VuZCBhbGwgZm9ybSB2YWx1ZXMgb25jaGFuZ2UsIGluY2x1ZGluZyBldmVudHVhbGx5IHRoZSByZW1vdmVkIG9uZXMgKGZvciBkeW5hbWljIHBhbmVscylcbiAgICAgICAgICovXG4gICAgICAgIG9uQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiB0aGUgZm9ybSBnbG9iYWJhbGx5IHN3aXRjaGVzIGJldHdlZW4gdmFsaWQgYW5kIGludmFsaWQgc3RhdGVcbiAgICAgICAgICogVHJpZ2dlcmVkIG9uY2UgYXQgZm9ybSBjb25zdHJ1Y3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIG9uVmFsaWRTdGF0dXNDaGFuZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc2FibGUgdGhlIHdob2xlIGZvcm0gYXQgb25jZVxuICAgICAgICAgKi9cbiAgICAgICAgZGlzYWJsZWQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0cmluZyBhZGRlZCB0byB0aGUgaW1hZ2UgaW5wdXRzIGZvciB1cGxvYWQvZG93bmxvYWQgb3BlcmF0aW9uc1xuICAgICAgICAgKi9cbiAgICAgICAgYmluYXJ5X2NvbnRleHQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAvKipcbiAgICAgICAgICogMCBieSBkZWZhdWx0LCBzdWJmb3JtcyB3aWxsIGhhdmUgdGhlaXIgekRlcHRoIHZhbHVlIGluY3JlYXNlZCBieSBvbmVcbiAgICAgICAgICovXG4gICAgICAgIGRlcHRoOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm51bWJlcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGFuIGFkZGl0aW9uYWwgaGVhZGVyIGNvbXBvbmVudCAoYWRkZWQgaW5zaWRlIGZpcnN0IHN1YnBhbmVsKVxuICAgICAgICAgKi9cbiAgICAgICAgaGVhZGVyOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBhbiBhZGRpdGlvbmFsIGZvb3RlciBjb21wb25lbnQgKGFkZGVkIGluc2lkZSBsYXN0IHN1YnBhbmVsKVxuICAgICAgICAgKi9cbiAgICAgICAgZm9vdGVyOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBvdGhlciBhcmJpdHJhcnkgcGFuZWxzLCBlaXRoZXIgYXQgdGhlIHRvcCBvciB0aGUgYm90dG9tXG4gICAgICAgICAqL1xuICAgICAgICBhZGRpdGlvbmFsUGFuZXM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgICAgICAgdG9wOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmFycmF5LFxuICAgICAgICAgICAgYm90dG9tOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmFycmF5XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICogQW4gYXJyYXkgb2YgdGFicyBjb250YWluaW5nIGdyb3VwTmFtZXMuIEdyb3VwcyB3aWxsIGJlIHNwbGl0dGVkXG4gICAgICAgICAqIGFjY3Jvc3MgdGhvc2UgdGFic1xuICAgICAgICAgKi9cbiAgICAgICAgdGFiczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5hcnJheSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVkIHdoZW4gYSB0aGUgYWN0aXZlIHRhYiBjaGFuZ2VzXG4gICAgICAgICAqL1xuICAgICAgICBvblRhYkNoYW5nZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogQSBiaXQgbGlrZSB0YWJzLCBidXQgdXNpbmcgYWNjb3JkaW9uLWxpa2UgbGF5b3V0XG4gICAgICAgICAqL1xuICAgICAgICBhY2NvcmRpb25pemVJZkdyb3Vwc01vcmVUaGFuOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm51bWJlcixcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZvcndhcmQgYW4gZXZlbnQgd2hlbiBzY3JvbGxpbmcgdGhlIGZvcm1cbiAgICAgICAgICovXG4gICAgICAgIG9uU2Nyb2xsQ2FsbGJhY2s6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3RyaWN0IHRvIGEgc3Vic2V0IG9mIGZpZWxkIGdyb3Vwc1xuICAgICAgICAgKi9cbiAgICAgICAgbGltaXRUb0dyb3VwczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5hcnJheSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIElnbm9yZSBzb21lIHNwZWNpZmljIGZpZWxkcyB0eXBlc1xuICAgICAgICAgKi9cbiAgICAgICAgc2tpcEZpZWxkc1R5cGVzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmFycmF5LFxuXG4gICAgICAgIC8qIEhlbHBlciBPcHRpb25zICovXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQYXNzIHBvaW50ZXJzIHRvIHRoZSBQeWRpbyBDb21wYW5pb24gY29udGFpbmVyXG4gICAgICAgICAqL1xuICAgICAgICBzZXRIZWxwZXJEYXRhOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgY29tcGFuaW9uIGlzIGFjdGl2ZSBvciBub25lIGFuZCBpZiBhIHBhcmFtZXRlclxuICAgICAgICAgKiBoYXMgaGVscGVyIGRhdGFcbiAgICAgICAgICovXG4gICAgICAgIGNoZWNrSGFzSGVscGVyOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUZXN0IGZvciBwYXJhbWV0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGhlbHBlclRlc3RGb3I6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nXG5cbiAgICB9LFxuXG4gICAgZXh0ZXJuYWxseVNlbGVjdFRhYjogZnVuY3Rpb24gZXh0ZXJuYWxseVNlbGVjdFRhYihpbmRleCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGFiU2VsZWN0ZWRJbmRleDogaW5kZXggfSk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblRhYkNoYW5nZSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdGFiU2VsZWN0ZWRJbmRleDogMCB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7IGRlcHRoOiAwLCB2YWx1ZXM6IHt9IH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgaWYgKEpTT04uc3RyaW5naWZ5KG5ld1Byb3BzLnBhcmFtZXRlcnMpICE9PSBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLnBhcmFtZXRlcnMpKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnRlcm5hbFZhbGlkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2hpZGRlblZhbHVlcyA9IHt9O1xuICAgICAgICAgICAgdGhpcy5fcGFyYW1ldGVyc01ldGFkYXRhID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1Byb3BzLnZhbHVlcyAmJiBuZXdQcm9wcy52YWx1ZXMgIT09IHRoaXMucHJvcHMudmFsdWVzKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrVmFsaWRTdGF0dXMobmV3UHJvcHMudmFsdWVzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRWYWx1ZXM6IGZ1bmN0aW9uIGdldFZhbHVlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMudmFsdWVzOyAvL0xhbmdVdGlscy5tZXJnZU9iamVjdHNSZWN1cnNpdmUodGhpcy5faGlkZGVuVmFsdWVzLCB0aGlzLnByb3BzLnZhbHVlcyk7XG4gICAgfSxcblxuICAgIG9uUGFyYW1ldGVyQ2hhbmdlOiBmdW5jdGlvbiBvblBhcmFtZXRlckNoYW5nZShwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB2YXIgYWRkaXRpb25hbEZvcm1EYXRhID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1szXTtcblxuICAgICAgICAvLyBVcGRhdGUgd3JpdGVWYWx1ZXNcbiAgICAgICAgdmFyIG5ld1ZhbHVlcyA9IF9weWRpb1V0aWxMYW5nMlsnZGVmYXVsdCddLmRlZXBDb3B5KHRoaXMuZ2V0VmFsdWVzKCkpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblBhcmFtZXRlckNoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblBhcmFtZXRlckNoYW5nZShwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSwgYWRkaXRpb25hbEZvcm1EYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWRkaXRpb25hbEZvcm1EYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3BhcmFtZXRlcnNNZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhcmFtZXRlcnNNZXRhZGF0YSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fcGFyYW1ldGVyc01ldGFkYXRhW3BhcmFtTmFtZV0gPSBhZGRpdGlvbmFsRm9ybURhdGE7XG4gICAgICAgIH1cbiAgICAgICAgbmV3VmFsdWVzW3BhcmFtTmFtZV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgdmFyIGRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZShuZXdWYWx1ZXMsIGRpcnR5KTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIG9uQ2hhbmdlKG5ld1ZhbHVlcywgZGlydHksIHJlbW92ZVZhbHVlcykge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgLy9uZXdWYWx1ZXMgPSBMYW5nVXRpbHMubWVyZ2VPYmplY3RzUmVjdXJzaXZlKHRoaXMuX2hpZGRlblZhbHVlcywgbmV3VmFsdWVzKTtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLl9oaWRkZW5WYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faGlkZGVuVmFsdWVzLmhhc093blByb3BlcnR5KGtleSkgJiYgbmV3VmFsdWVzW2tleV0gPT09IHVuZGVmaW5lZCAmJiAoIXJlbW92ZVZhbHVlcyB8fCByZW1vdmVWYWx1ZXNba2V5XSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNba2V5XSA9IHRoaXMuX2hpZGRlblZhbHVlc1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoZWNrVmFsaWRTdGF0dXMobmV3VmFsdWVzKTtcbiAgICB9LFxuXG4gICAgb25TdWJmb3JtQ2hhbmdlOiBmdW5jdGlvbiBvblN1YmZvcm1DaGFuZ2UobmV3VmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS5tZXJnZU9iamVjdHNSZWN1cnNpdmUodGhpcy5nZXRWYWx1ZXMoKSwgbmV3VmFsdWVzKTtcbiAgICAgICAgaWYgKHJlbW92ZVZhbHVlcykge1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiByZW1vdmVWYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlVmFsdWVzLmhhc093blByb3BlcnR5KGspICYmIHZhbHVlc1trXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZXNba107XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9oaWRkZW5WYWx1ZXNba10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2hpZGRlblZhbHVlc1trXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uQ2hhbmdlKHZhbHVlcywgZGlydHksIHJlbW92ZVZhbHVlcyk7XG4gICAgfSxcblxuICAgIG9uU3ViZm9ybVZhbGlkU3RhdHVzQ2hhbmdlOiBmdW5jdGlvbiBvblN1YmZvcm1WYWxpZFN0YXR1c0NoYW5nZShuZXdWYWxpZFZhbHVlLCBmYWlsZWRNYW5kYXRvcmllcykge1xuICAgICAgICBpZiAoKG5ld1ZhbGlkVmFsdWUgIT09IHRoaXMuX2ludGVybmFsVmFsaWQgfHwgdGhpcy5wcm9wcy5mb3JjZVZhbGlkU3RhdHVzQ2hlY2spICYmIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKG5ld1ZhbGlkVmFsdWUsIGZhaWxlZE1hbmRhdG9yaWVzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnRlcm5hbFZhbGlkID0gbmV3VmFsaWRWYWx1ZTtcbiAgICB9LFxuXG4gICAgYXBwbHlCdXR0b25BY3Rpb246IGZ1bmN0aW9uIGFwcGx5QnV0dG9uQWN0aW9uKHBhcmFtZXRlcnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmFwcGx5QnV0dG9uQWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLmFwcGx5QnV0dG9uQWN0aW9uKHBhcmFtZXRlcnMsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgICAvKlxuICAgICAgICAvLyBPbGQgd2F5XG4gICAgICAgIHBhcmFtZXRlcnMgPSBMYW5nVXRpbHMubWVyZ2VPYmplY3RzUmVjdXJzaXZlKHBhcmFtZXRlcnMsIHRoaXMuZ2V0VmFsdWVzRm9yUE9TVCh0aGlzLmdldFZhbHVlcygpKSk7XG4gICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLnJlcXVlc3QocGFyYW1ldGVycywgY2FsbGJhY2spO1xuICAgICAgICAqL1xuICAgIH0sXG5cbiAgICBnZXRWYWx1ZXNGb3JQT1NUOiBmdW5jdGlvbiBnZXRWYWx1ZXNGb3JQT1NUKHZhbHVlcykge1xuICAgICAgICB2YXIgcHJlZml4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ0RSSVZFUl9PUFRJT05fJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICByZXR1cm4gX21hbmFnZXJNYW5hZ2VyMlsnZGVmYXVsdCddLmdldFZhbHVlc0ZvclBPU1QodGhpcy5wcm9wcy5wYXJhbWV0ZXJzLCB2YWx1ZXMsIHByZWZpeCwgdGhpcy5fcGFyYW1ldGVyc01ldGFkYXRhKTtcbiAgICB9LFxuXG4gICAgY2hlY2tWYWxpZFN0YXR1czogZnVuY3Rpb24gY2hlY2tWYWxpZFN0YXR1cyh2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGZhaWxlZE1hbmRhdG9yaWVzID0gW107XG4gICAgICAgIHRoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICBpZiAoWydzdHJpbmcnLCAndGV4dGFyZWEnLCAncGFzc3dvcmQnLCAnaW50ZWdlciddLmluZGV4T2YocC50eXBlKSA+IC0xICYmIChwLm1hbmRhdG9yeSA9PT0gXCJ0cnVlXCIgfHwgcC5tYW5kYXRvcnkgPT09IHRydWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWx1ZXMgfHwgIXZhbHVlcy5oYXNPd25Qcm9wZXJ0eShwLm5hbWUpIHx8IHZhbHVlc1twLm5hbWVdID09PSB1bmRlZmluZWQgfHwgdmFsdWVzW3AubmFtZV0gPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbGVkTWFuZGF0b3JpZXMucHVzaChwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocC50eXBlID09PSAndmFsaWQtcGFzc3dvcmQnICYmIHRoaXMucmVmc1snZm9ybS1lbGVtZW50LScgKyBwLm5hbWVdKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnJlZnNbJ2Zvcm0tZWxlbWVudC0nICsgcC5uYW1lXS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbGVkTWFuZGF0b3JpZXMucHVzaChwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB2YXIgcHJldmlvdXNWYWx1ZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBwcmV2aW91c1ZhbHVlID0gdGhpcy5faW50ZXJuYWxWYWxpZDsgLy8odGhpcy5faW50ZXJuYWxWYWxpZCAhPT0gdW5kZWZpbmVkID8gdGhpcy5faW50ZXJuYWxWYWxpZCA6IHRydWUpO1xuICAgICAgICBuZXdWYWx1ZSA9ICFmYWlsZWRNYW5kYXRvcmllcy5sZW5ndGg7XG4gICAgICAgIGlmICgobmV3VmFsdWUgIT09IHRoaXMuX2ludGVybmFsVmFsaWQgfHwgdGhpcy5wcm9wcy5mb3JjZVZhbGlkU3RhdHVzQ2hlY2spICYmIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKG5ld1ZhbHVlLCBmYWlsZWRNYW5kYXRvcmllcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW50ZXJuYWxWYWxpZCA9IG5ld1ZhbHVlO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuY2hlY2tWYWxpZFN0YXR1cyh0aGlzLnByb3BzLnZhbHVlcyk7XG4gICAgfSxcblxuICAgIHJlbmRlckdyb3VwSGVhZGVyOiBmdW5jdGlvbiByZW5kZXJHcm91cEhlYWRlcihncm91cExhYmVsLCBhY2NvcmRpb25pemUsIGluZGV4LCBhY3RpdmUpIHtcblxuICAgICAgICB2YXIgcHJvcGVydGllcyA9IHsga2V5OiAnZ3JvdXAtJyArIGdyb3VwTGFiZWwgfTtcbiAgICAgICAgaWYgKGFjY29yZGlvbml6ZSkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuY3VycmVudEFjdGl2ZUdyb3VwID8gdGhpcy5zdGF0ZS5jdXJyZW50QWN0aXZlR3JvdXAgOiBudWxsO1xuICAgICAgICAgICAgcHJvcGVydGllc1snY2xhc3NOYW1lJ10gPSAnZ3JvdXAtbGFiZWwtJyArIChhY3RpdmUgPyAnYWN0aXZlJyA6ICdpbmFjdGl2ZScpO1xuICAgICAgICAgICAgcHJvcGVydGllc1snb25DbGljayddID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY3VycmVudEFjdGl2ZUdyb3VwOiBjdXJyZW50ICE9PSBpbmRleCA/IGluZGV4IDogbnVsbCB9KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICBncm91cExhYmVsID0gW19yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBrZXk6ICd0b2dnbGVyJywgY2xhc3NOYW1lOiBcImdyb3VwLWFjdGl2ZS10b2dnbGVyIGljb24tYW5nbGUtXCIgKyAoY3VycmVudCA9PT0gaW5kZXggPyAnZG93bicgOiAncmlnaHQnKSB9KSwgZ3JvdXBMYWJlbF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2gnICsgKDMgKyB0aGlzLnByb3BzLmRlcHRoKSwgcHJvcGVydGllcywgZ3JvdXBMYWJlbCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgYWxsR3JvdXBzID0gW107XG4gICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuICAgICAgICB2YXIgZ3JvdXBzT3JkZXJlZCA9IFsnX19ERUZBVUxUX18nXTtcbiAgICAgICAgYWxsR3JvdXBzWydfX0RFRkFVTFRfXyddID0geyBGSUVMRFM6IFtdIH07XG4gICAgICAgIHZhciByZXBsaWNhdGlvbkdyb3VwcyA9IHt9O1xuXG4gICAgICAgIHRoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoKGZ1bmN0aW9uIChhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgdHlwZSA9IGF0dHJpYnV0ZXNbJ3R5cGUnXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNraXBGaWVsZHNUeXBlcyAmJiB0aGlzLnByb3BzLnNraXBGaWVsZHNUeXBlcy5pbmRleE9mKHR5cGUpID4gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcGFyYW1OYW1lID0gYXR0cmlidXRlc1snbmFtZSddO1xuICAgICAgICAgICAgdmFyIGZpZWxkO1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbJ2dyb3VwX3N3aXRjaF9uYW1lJ10pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBncm91cCA9IGF0dHJpYnV0ZXNbJ2dyb3VwJ10gfHwgJ19fREVGQVVMVF9fJztcbiAgICAgICAgICAgIGlmICghYWxsR3JvdXBzW2dyb3VwXSkge1xuICAgICAgICAgICAgICAgIGdyb3Vwc09yZGVyZWQucHVzaChncm91cCk7XG4gICAgICAgICAgICAgICAgYWxsR3JvdXBzW2dyb3VwXSA9IHsgRklFTERTOiBbXSwgTEFCRUw6IGdyb3VwIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZXBHcm91cCA9IGF0dHJpYnV0ZXNbJ3JlcGxpY2F0aW9uR3JvdXAnXTtcbiAgICAgICAgICAgIGlmIChyZXBHcm91cCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCFyZXBsaWNhdGlvbkdyb3Vwc1tyZXBHcm91cF0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVwbGljYXRpb25Hcm91cHNbcmVwR3JvdXBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgUEFSQU1TOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIEdST1VQOiBncm91cCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFBPU0lUSU9OOiBhbGxHcm91cHNbZ3JvdXBdLkZJRUxEUy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgYWxsR3JvdXBzW2dyb3VwXS5GSUVMRFMucHVzaCgnUkVQTElDQVRJT046JyArIHJlcEdyb3VwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ29weVxuICAgICAgICAgICAgICAgIHZhciByZXBBdHRyID0gX3B5ZGlvVXRpbExhbmcyWydkZWZhdWx0J10uZGVlcENvcHkoYXR0cmlidXRlcyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlcEF0dHJbJ3JlcGxpY2F0aW9uR3JvdXAnXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVwQXR0clsnZ3JvdXAnXTtcbiAgICAgICAgICAgICAgICByZXBsaWNhdGlvbkdyb3Vwc1tyZXBHcm91cF0uUEFSQU1TLnB1c2gocmVwQXR0cik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUuaW5kZXhPZihcImdyb3VwX3N3aXRjaDpcIikgPT09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9Hcm91cFN3aXRjaFBhbmVsMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25TdWJmb3JtQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1BdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVyczogdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB0aGlzLnByb3BzLnZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogcGFyYW1OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25TY3JvbGxDYWxsYmFjazogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0VG9Hcm91cHM6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbGlkU3RhdHVzQ2hhbmdlOiB0aGlzLm9uU3ViZm9ybVZhbGlkU3RhdHVzQ2hhbmdlXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF0dHJpYnV0ZXNbJ3R5cGUnXSAhPT0gJ2hpZGRlbicpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaGVscGVyTWFyaztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2V0SGVscGVyRGF0YSAmJiB0aGlzLnByb3BzLmNoZWNrSGFzSGVscGVyICYmIHRoaXMucHJvcHMuY2hlY2tIYXNIZWxwZXIoYXR0cmlidXRlc1snbmFtZSddLCB0aGlzLnByb3BzLmhlbHBlclRlc3RGb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2hvd0hlbHBlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zZXRIZWxwZXJEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1BdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFZhbHVlczogdGhpcy5nZXRWYWx1ZXNGb3JQT1NUKHZhbHVlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5QnV0dG9uQWN0aW9uOiB0aGlzLmFwcGx5QnV0dG9uQWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9wcy5oZWxwZXJUZXN0Rm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWxwZXJNYXJrID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2ljb24tcXVlc3Rpb24tc2lnbicsIG9uQ2xpY2s6IHNob3dIZWxwZXIgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hbmRhdG9yeU1pc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsYXNzTGVnZW5kID0gXCJmb3JtLWxlZ2VuZFwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlc1snZXJyb3JUZXh0J10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTGVnZW5kID0gXCJmb3JtLWxlZ2VuZCBtYW5kYXRvcnktbWlzc2luZ1wiO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF0dHJpYnV0ZXNbJ3dhcm5pbmdUZXh0J10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTGVnZW5kID0gXCJmb3JtLWxlZ2VuZCB3YXJuaW5nLW1lc3NhZ2VcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRyaWJ1dGVzWydtYW5kYXRvcnknXSAmJiAoYXR0cmlidXRlc1snbWFuZGF0b3J5J10gPT09IFwidHJ1ZVwiIHx8IGF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddID09PSB0cnVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFsnc3RyaW5nJywgJ3RleHRhcmVhJywgJ2ltYWdlJywgJ2ludGVnZXInXS5pbmRleE9mKGF0dHJpYnV0ZXNbJ3R5cGUnXSkgIT09IC0xICYmICF2YWx1ZXNbcGFyYW1OYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hbmRhdG9yeU1pc3NpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTGVnZW5kID0gXCJmb3JtLWxlZ2VuZCBtYW5kYXRvcnktbWlzc2luZ1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3BzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBcImZvcm0tZWxlbWVudC1cIiArIHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVzW3BhcmFtTmFtZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlLCBhZGRpdGlvbmFsRm9ybURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5vblBhcmFtZXRlckNoYW5nZShwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSwgYWRkaXRpb25hbEZvcm1EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCB8fCBhdHRyaWJ1dGVzWydyZWFkb25seSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGU6IGF0dHJpYnV0ZXNbJ211bHRpcGxlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5hcnlfY29udGV4dDogdGhpcy5wcm9wcy5iaW5hcnlfY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlDb250ZXh0OiAnZm9ybScsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBseUJ1dHRvbkFjdGlvbjogdGhpcy5hcHBseUJ1dHRvbkFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogbWFuZGF0b3J5TWlzc2luZyA/IHB5ZGlvLk1lc3NhZ2VIYXNoWyc2MjEnXSA6IGF0dHJpYnV0ZXMuZXJyb3JUZXh0ID8gYXR0cmlidXRlcy5lcnJvclRleHQgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBrZXk6IHBhcmFtTmFtZSwgY2xhc3NOYW1lOiAnZm9ybS1lbnRyeS0nICsgYXR0cmlidXRlc1sndHlwZSddIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWFuYWdlck1hbmFnZXIyWydkZWZhdWx0J10uY3JlYXRlRm9ybUVsZW1lbnQocHJvcHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGNsYXNzTGVnZW5kIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlc1snd2FybmluZ1RleHQnXSA/IGF0dHJpYnV0ZXNbJ3dhcm5pbmdUZXh0J10gOiBhdHRyaWJ1dGVzWydkZXNjcmlwdGlvbiddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWxwZXJNYXJrXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaWRkZW5WYWx1ZXNbcGFyYW1OYW1lXSA9IHZhbHVlc1twYXJhbU5hbWVdID09PSB1bmRlZmluZWQgPyBhdHRyaWJ1dGVzWydkZWZhdWx0J10gOiB2YWx1ZXNbcGFyYW1OYW1lXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxsR3JvdXBzW2dyb3VwXS5GSUVMRFMucHVzaChmaWVsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICBmb3IgKHZhciByR3JvdXAgaW4gcmVwbGljYXRpb25Hcm91cHMpIHtcbiAgICAgICAgICAgIGlmICghcmVwbGljYXRpb25Hcm91cHMuaGFzT3duUHJvcGVydHkockdyb3VwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJHcm91cERhdGEgPSByZXBsaWNhdGlvbkdyb3Vwc1tyR3JvdXBdO1xuICAgICAgICAgICAgYWxsR3JvdXBzW3JHcm91cERhdGEuR1JPVVBdLkZJRUxEU1tyR3JvdXBEYXRhLlBPU0lUSU9OXSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9SZXBsaWNhdGlvblBhbmVsMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXBsaWNhdGlvbi1ncm91cC1cIiArIHJHcm91cERhdGEuUEFSQU1TWzBdLm5hbWUsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25TdWJmb3JtQ2hhbmdlLFxuICAgICAgICAgICAgICAgIG9uUGFyYW1ldGVyQ2hhbmdlOiBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlczogdGhpcy5nZXRWYWx1ZXMoKSxcbiAgICAgICAgICAgICAgICBkZXB0aDogdGhpcy5wcm9wcy5kZXB0aCArIDEsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczogckdyb3VwRGF0YS5QQVJBTVMsXG4gICAgICAgICAgICAgICAgYXBwbHlCdXR0b25BY3Rpb246IHRoaXMuYXBwbHlCdXR0b25BY3Rpb24sXG4gICAgICAgICAgICAgICAgb25TY3JvbGxDYWxsYmFjazogbnVsbFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdyb3VwUGFuZXMgPSBbXTtcbiAgICAgICAgdmFyIGFjY29yZGlvbml6ZSA9IHRoaXMucHJvcHMuYWNjb3JkaW9uaXplSWZHcm91cHNNb3JlVGhhbiAmJiBncm91cHNPcmRlcmVkLmxlbmd0aCA+IHRoaXMucHJvcHMuYWNjb3JkaW9uaXplSWZHcm91cHNNb3JlVGhhbjtcbiAgICAgICAgdmFyIGN1cnJlbnRBY3RpdmVHcm91cCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5jdXJyZW50QWN0aXZlR3JvdXAgPyB0aGlzLnN0YXRlLmN1cnJlbnRBY3RpdmVHcm91cCA6IDA7XG4gICAgICAgIGdyb3Vwc09yZGVyZWQubWFwKChmdW5jdGlvbiAoZywgZ0luZGV4KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5saW1pdFRvR3JvdXBzICYmIHRoaXMucHJvcHMubGltaXRUb0dyb3Vwcy5pbmRleE9mKGcpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBoZWFkZXIsXG4gICAgICAgICAgICAgICAgZ0RhdGEgPSBhbGxHcm91cHNbZ107XG4gICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gJ3B5ZGlvLWZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGFjY29yZGlvbml6ZSkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZSA9IGN1cnJlbnRBY3RpdmVHcm91cCA9PT0gZ0luZGV4O1xuICAgICAgICAgICAgICAgIGlmIChnSW5kZXggPT09IGN1cnJlbnRBY3RpdmVHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgKz0gJyBmb3JtLWdyb3VwLWFjdGl2ZSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgZm9ybS1ncm91cC1pbmFjdGl2ZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFnRGF0YS5GSUVMRFMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGdEYXRhLkxBQkVMICYmICEodGhpcy5wcm9wcy5za2lwRmllbGRzVHlwZXMgJiYgdGhpcy5wcm9wcy5za2lwRmllbGRzVHlwZXMuaW5kZXhPZignR3JvdXBIZWFkZXInKSA+IC0xKSkge1xuICAgICAgICAgICAgICAgIGhlYWRlciA9IHRoaXMucmVuZGVyR3JvdXBIZWFkZXIoZ0RhdGEuTEFCRUwsIGFjY29yZGlvbml6ZSwgZ0luZGV4LCBhY3RpdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGVwdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgKz0gJyB6LWRlcHRoLTEnO1xuICAgICAgICAgICAgICAgIGdyb3VwUGFuZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGtleTogJ3BhbmUtJyArIGcgfSxcbiAgICAgICAgICAgICAgICAgICAgZ0luZGV4ID09PSAwICYmIHRoaXMucHJvcHMuaGVhZGVyID8gdGhpcy5wcm9wcy5oZWFkZXIgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ0RhdGEuRklFTERTXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGdJbmRleCA9PT0gZ3JvdXBzT3JkZXJlZC5sZW5ndGggLSAxICYmIHRoaXMucHJvcHMuZm9vdGVyID8gdGhpcy5wcm9wcy5mb290ZXIgOiBudWxsXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyb3VwUGFuZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGtleTogJ3BhbmUtJyArIGcgfSxcbiAgICAgICAgICAgICAgICAgICAgZ0luZGV4ID09PSAwICYmIHRoaXMucHJvcHMuaGVhZGVyID8gdGhpcy5wcm9wcy5oZWFkZXIgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ0RhdGEuRklFTERTXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGdJbmRleCA9PT0gZ3JvdXBzT3JkZXJlZC5sZW5ndGggLSAxICYmIHRoaXMucHJvcHMuZm9vdGVyID8gdGhpcy5wcm9wcy5mb290ZXIgOiBudWxsXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hZGRpdGlvbmFsUGFuZXMpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG90aGVyUGFuZXMgPSB7IHRvcDogW10sIGJvdHRvbTogW10gfTtcbiAgICAgICAgICAgICAgICB2YXIgZGVwdGggPSBfdGhpczIucHJvcHMuZGVwdGg7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcblxuICAgICAgICAgICAgICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghb3RoZXJQYW5lcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdjb250aW51ZSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzMi5wcm9wcy5hZGRpdGlvbmFsUGFuZXNba10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5hZGRpdGlvbmFsUGFuZXNba10ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyUGFuZXNba10ucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdweWRpby1mb3JtLWdyb3VwIGFkZGl0aW9uYWwnLCBrZXk6ICdvdGhlci1wYW5lLScgKyBpbmRleCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlclBhbmVzW2tdLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncHlkaW8tZm9ybS1ncm91cCBhZGRpdGlvbmFsJywga2V5OiAnb3RoZXItcGFuZS0nICsgaW5kZXggfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIG90aGVyUGFuZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9yZXQyID0gX2xvb3Aoayk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF9yZXQyID09PSAnY29udGludWUnKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3JvdXBQYW5lcyA9IG90aGVyUGFuZXNbJ3RvcCddLmNvbmNhdChncm91cFBhbmVzKS5jb25jYXQob3RoZXJQYW5lc1snYm90dG9tJ10pO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnRhYnMpIHtcbiAgICAgICAgICAgIHZhciBfcmV0MyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IF90aGlzMi5wcm9wcy5jbGFzc05hbWU7XG4gICAgICAgICAgICAgICAgdmFyIGluaXRpYWxTZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHRhYnMgPSBfdGhpczIucHJvcHMudGFicy5tYXAoKGZ1bmN0aW9uICh0RGVmKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IHREZWZbJ2xhYmVsJ107XG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cHMgPSB0RGVmWydncm91cHMnXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHREZWZbJ3NlbGVjdGVkJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxTZWxlY3RlZEluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFuZXMgPSBncm91cHMubWFwKGZ1bmN0aW9uIChnSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncm91cFBhbmVzW2dJZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBQYW5lc1tnSWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy5vblRhYkNoYW5nZSA/IGkgLSAxIDogdW5kZWZpbmVkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogKGNsYXNzTmFtZSA/IGNsYXNzTmFtZSArICcgJyA6ICcgJykgKyAncHlkaW8tZm9ybS1wYW5lbCcgKyAocGFuZXMubGVuZ3RoICUgMiA/ICcgZm9ybS1wYW5lbC1vZGQnIDogJycpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFuZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKF90aGlzMikpO1xuICAgICAgICAgICAgICAgIGlmIChfdGhpczIuc3RhdGUudGFiU2VsZWN0ZWRJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxTZWxlY3RlZEluZGV4ID0gX3RoaXMyLnN0YXRlLnRhYlNlbGVjdGVkSW5kZXg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHY6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2xheW91dC1maWxsIHZlcnRpY2FsLWxheW91dCB0YWItdmVydGljYWwtbGF5b3V0JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFicyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlZjogJ3RhYnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsU2VsZWN0ZWRJbmRleDogaW5pdGlhbFNlbGVjdGVkSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBfdGhpczIucHJvcHMub25UYWJDaGFuZ2UgPyBpbml0aWFsU2VsZWN0ZWRJbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IF90aGlzMi5wcm9wcy5vblRhYkNoYW5nZSA/IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyB0YWJTZWxlY3RlZEluZGV4OiBpIH0pO190aGlzMi5wcm9wcy5vblRhYkNoYW5nZShpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSwgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50Q29udGFpbmVyU3R5bGU6IHsgZmxleDogMSwgb3ZlcmZsb3dZOiAnYXV0bycgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFic1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3JldDMgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldDMudjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogKHRoaXMucHJvcHMuY2xhc3NOYW1lID8gdGhpcy5wcm9wcy5jbGFzc05hbWUgKyAnICcgOiAnICcpICsgJ3B5ZGlvLWZvcm0tcGFuZWwnICsgKGdyb3VwUGFuZXMubGVuZ3RoICUgMiA/ICcgZm9ybS1wYW5lbC1vZGQnIDogJycpLCBvblNjcm9sbDogdGhpcy5wcm9wcy5vblNjcm9sbENhbGxiYWNrIH0sXG4gICAgICAgICAgICAgICAgZ3JvdXBQYW5lc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfRm9ybVBhbmVsID0gcmVxdWlyZSgnLi9Gb3JtUGFuZWwnKTtcblxudmFyIF9Gb3JtUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRm9ybVBhbmVsKTtcblxudmFyIF9maWVsZHNJbnB1dFNlbGVjdEJveCA9IHJlcXVpcmUoJy4uL2ZpZWxkcy9JbnB1dFNlbGVjdEJveCcpO1xuXG52YXIgX2ZpZWxkc0lucHV0U2VsZWN0Qm94MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0lucHV0U2VsZWN0Qm94KTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIExhbmdVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xuXG4vKipcbiAqIFN1YiBmb3JtIHdpdGggYSBzZWxlY3Rvciwgc3dpdGNoaW5nIGl0cyBmaWVsZHMgZGVwZW5kaW5nXG4gKiBvbiB0aGUgc2VsZWN0b3IgdmFsdWUuXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0dyb3VwU3dpdGNoUGFuZWwnLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHBhcmFtQXR0cmlidXRlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBwYXJhbWV0ZXJzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgdmFsdWVzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIGNvbXB1dGVTdWJQYW5lbFBhcmFtZXRlcnM6IGZ1bmN0aW9uIGNvbXB1dGVTdWJQYW5lbFBhcmFtZXRlcnMoKSB7XG5cbiAgICAgICAgLy8gQ1JFQVRFIFNVQiBGT1JNIFBBTkVMXG4gICAgICAgIC8vIEdldCBhbGwgdmFsdWVzXG4gICAgICAgIHZhciBzd2l0Y2hOYW1lID0gdGhpcy5wcm9wcy5wYXJhbUF0dHJpYnV0ZXNbJ3R5cGUnXS5zcGxpdChcIjpcIikucG9wKCk7XG4gICAgICAgIHZhciBwYXJlbnROYW1lID0gdGhpcy5wcm9wcy5wYXJhbUF0dHJpYnV0ZXNbJ25hbWUnXTtcbiAgICAgICAgdmFyIHN3aXRjaFZhbHVlcyA9IHt9LFxuICAgICAgICAgICAgcG90ZW50aWFsU3ViU3dpdGNoZXMgPSBbXTtcblxuICAgICAgICB0aGlzLnByb3BzLnBhcmFtZXRlcnMubWFwKChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgICAgICBpZiAoIXBbJ2dyb3VwX3N3aXRjaF9uYW1lJ10pIHJldHVybjtcbiAgICAgICAgICAgIGlmIChwWydncm91cF9zd2l0Y2hfbmFtZSddICE9IHN3aXRjaE5hbWUpIHtcbiAgICAgICAgICAgICAgICBwb3RlbnRpYWxTdWJTd2l0Y2hlcy5wdXNoKHApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjcnRTd2l0Y2ggPSBwWydncm91cF9zd2l0Y2hfdmFsdWUnXTtcbiAgICAgICAgICAgIGlmICghc3dpdGNoVmFsdWVzW2NydFN3aXRjaF0pIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHBbJ2dyb3VwX3N3aXRjaF9sYWJlbCddLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNLZXlzOiB7fVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwID0gTGFuZ1V0aWxzLmRlZXBDb3B5KHApO1xuICAgICAgICAgICAgZGVsZXRlIHBbJ2dyb3VwX3N3aXRjaF9uYW1lJ107XG4gICAgICAgICAgICBwWyduYW1lJ10gPSBwYXJlbnROYW1lICsgJy8nICsgcFsnbmFtZSddO1xuICAgICAgICAgICAgdmFyIHZLZXkgPSBwWyduYW1lJ107XG4gICAgICAgICAgICB2YXIgcGFyYW1OYW1lID0gdktleTtcbiAgICAgICAgICAgIGlmIChzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXS5maWVsZHNLZXlzW3BhcmFtTmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXS5maWVsZHMucHVzaChwKTtcbiAgICAgICAgICAgIHN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdLmZpZWxkc0tleXNbcGFyYW1OYW1lXSA9IHBhcmFtTmFtZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnZhbHVlcyAmJiB0aGlzLnByb3BzLnZhbHVlc1t2S2V5XSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdLnZhbHVlc1twYXJhbU5hbWVdID0gdGhpcy5wcm9wcy52YWx1ZXNbdktleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAvLyBSZW1lcmdlIHBvdGVudGlhbFN1YlN3aXRjaGVzIHRvIGVhY2ggcGFyYW1ldGVycyBzZXRcbiAgICAgICAgZm9yICh2YXIgayBpbiBzd2l0Y2hWYWx1ZXMpIHtcbiAgICAgICAgICAgIGlmIChzd2l0Y2hWYWx1ZXMuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3YgPSBzd2l0Y2hWYWx1ZXNba107XG4gICAgICAgICAgICAgICAgc3YuZmllbGRzID0gc3YuZmllbGRzLmNvbmNhdChwb3RlbnRpYWxTdWJTd2l0Y2hlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3dpdGNoVmFsdWVzO1xuICAgIH0sXG5cbiAgICBjbGVhclN1YlBhcmFtZXRlcnNWYWx1ZXM6IGZ1bmN0aW9uIGNsZWFyU3ViUGFyYW1ldGVyc1ZhbHVlcyhwYXJlbnROYW1lLCBuZXdWYWx1ZSwgbmV3RmllbGRzKSB7XG4gICAgICAgIHZhciB2YWxzID0gTGFuZ1V0aWxzLmRlZXBDb3B5KHRoaXMucHJvcHMudmFsdWVzKTtcbiAgICAgICAgdmFyIHRvUmVtb3ZlID0ge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB2YWxzKSB7XG4gICAgICAgICAgICBpZiAodmFscy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS5pbmRleE9mKHBhcmVudE5hbWUgKyAnLycpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdG9SZW1vdmVba2V5XSA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhbHNbcGFyZW50TmFtZV0gPSBuZXdWYWx1ZTtcblxuICAgICAgICBuZXdGaWVsZHMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICBpZiAocC50eXBlID09ICdoaWRkZW4nICYmIHBbJ2RlZmF1bHQnXSAmJiAhcFsnZ3JvdXBfc3dpdGNoX25hbWUnXSB8fCBwWydncm91cF9zd2l0Y2hfbmFtZSddID09IHBhcmVudE5hbWUpIHtcbiAgICAgICAgICAgICAgICB2YWxzW3BbJ25hbWUnXV0gPSBwWydkZWZhdWx0J107XG4gICAgICAgICAgICAgICAgaWYgKHRvUmVtb3ZlW3BbJ25hbWUnXV0gIT09IHVuZGVmaW5lZCkgZGVsZXRlIHRvUmVtb3ZlW3BbJ25hbWUnXV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBbJ25hbWUnXS5pbmRleE9mKHBhcmVudE5hbWUgKyAnLycpID09PSAwICYmIHBbJ2RlZmF1bHQnXSkge1xuICAgICAgICAgICAgICAgIGlmIChwWyd0eXBlJ10gJiYgcFsndHlwZSddLnN0YXJ0c1dpdGgoJ2dyb3VwX3N3aXRjaDonKSkge1xuICAgICAgICAgICAgICAgICAgICAvL3ZhbHNbcFsnbmFtZSddXSA9IHtncm91cF9zd2l0Y2hfdmFsdWU6cFsnZGVmYXVsdCddfTtcbiAgICAgICAgICAgICAgICAgICAgdmFsc1twWyduYW1lJ11dID0gcFsnZGVmYXVsdCddO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHNbcFsnbmFtZSddXSA9IHBbJ2RlZmF1bHQnXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHMsIHRydWUsIHRvUmVtb3ZlKTtcbiAgICAgICAgLy90aGlzLm9uUGFyYW1ldGVyQ2hhbmdlKHBhcmVudE5hbWUsIG5ld1ZhbHVlKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIG9uQ2hhbmdlKG5ld1ZhbHVlcywgZGlydHksIHJlbW92ZVZhbHVlcykge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlcywgdHJ1ZSwgcmVtb3ZlVmFsdWVzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0gdGhpcy5wcm9wcy5wYXJhbUF0dHJpYnV0ZXM7XG4gICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLnByb3BzLnZhbHVlcztcblxuICAgICAgICB2YXIgcGFyYW1OYW1lID0gYXR0cmlidXRlc1snbmFtZSddO1xuICAgICAgICB2YXIgc3dpdGNoVmFsdWVzID0gdGhpcy5jb21wdXRlU3ViUGFuZWxQYXJhbWV0ZXJzKGF0dHJpYnV0ZXMpO1xuICAgICAgICB2YXIgc2VsZWN0b3JWYWx1ZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgIE9iamVjdC5rZXlzKHN3aXRjaFZhbHVlcykubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICBzZWxlY3RvclZhbHVlcy5zZXQoaywgc3dpdGNoVmFsdWVzW2tdLmxhYmVsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBzZWxlY3RvckNoYW5nZXIgPSAoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyU3ViUGFyYW1ldGVyc1ZhbHVlcyhwYXJhbU5hbWUsIG5ld1ZhbHVlLCBzd2l0Y2hWYWx1ZXNbbmV3VmFsdWVdID8gc3dpdGNoVmFsdWVzW25ld1ZhbHVlXS5maWVsZHMgOiBbXSk7XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgIHZhciBzdWJGb3JtID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgc2VsZWN0b3JMZWdlbmQgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBzdWJGb3JtSGVhZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgc2VsZWN0b3IgPSBSZWFjdC5jcmVhdGVFbGVtZW50KF9maWVsZHNJbnB1dFNlbGVjdEJveDJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAga2V5OiBwYXJhbU5hbWUsXG4gICAgICAgICAgICBuYW1lOiBwYXJhbU5hbWUsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdncm91cC1zd2l0Y2gtc2VsZWN0b3InLFxuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIG5hbWU6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICBjaG9pY2VzOiBzZWxlY3RvclZhbHVlcyxcbiAgICAgICAgICAgICAgICBsYWJlbDogYXR0cmlidXRlc1snbGFiZWwnXSxcbiAgICAgICAgICAgICAgICBtYW5kYXRvcnk6IGF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlc1twYXJhbU5hbWVdLFxuICAgICAgICAgICAgb25DaGFuZ2U6IHNlbGVjdG9yQ2hhbmdlcixcbiAgICAgICAgICAgIGRpc3BsYXlDb250ZXh0OiAnZm9ybScsXG4gICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgICAgIHJlZjogJ3N1YkZvcm1TZWxlY3RvcidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGhlbHBlck1hcmsgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNldEhlbHBlckRhdGEgJiYgdGhpcy5wcm9wcy5jaGVja0hhc0hlbHBlciAmJiB0aGlzLnByb3BzLmNoZWNrSGFzSGVscGVyKGF0dHJpYnV0ZXNbJ25hbWUnXSwgdGhpcy5wcm9wcy5oZWxwZXJUZXN0Rm9yKSkge1xuICAgICAgICAgICAgdmFyIHNob3dIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc2V0SGVscGVyRGF0YSh7IHBhcmFtQXR0cmlidXRlczogYXR0cmlidXRlcywgdmFsdWVzOiB2YWx1ZXMgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgaGVscGVyTWFyayA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2ljb24tcXVlc3Rpb24tc2lnbicsIG9uQ2xpY2s6IHNob3dIZWxwZXIgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxlY3RvckxlZ2VuZCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZm9ybS1sZWdlbmQnIH0sXG4gICAgICAgICAgICBhdHRyaWJ1dGVzWydkZXNjcmlwdGlvbiddLFxuICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgaGVscGVyTWFya1xuICAgICAgICApO1xuICAgICAgICBpZiAodmFsdWVzW3BhcmFtTmFtZV0gJiYgc3dpdGNoVmFsdWVzW3ZhbHVlc1twYXJhbU5hbWVdXSkge1xuICAgICAgICAgICAgc3ViRm9ybUhlYWRlciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2g0JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlc1twYXJhbU5hbWVdXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgc3ViRm9ybSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX0Zvcm1QYW5lbDJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgIG9uUGFyYW1ldGVyQ2hhbmdlOiB0aGlzLnByb3BzLm9uUGFyYW1ldGVyQ2hhbmdlLFxuICAgICAgICAgICAgICAgIGFwcGx5QnV0dG9uQWN0aW9uOiB0aGlzLnByb3BzLmFwcGx5QnV0dG9uQWN0aW9uLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICAgICAgICAgIHJlZjogcGFyYW1OYW1lICsgJy1TVUInLFxuICAgICAgICAgICAgICAgIGtleTogcGFyYW1OYW1lICsgJy1TVUInLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3N1Yi1mb3JtJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiBzd2l0Y2hWYWx1ZXNbdmFsdWVzW3BhcmFtTmFtZV1dLmZpZWxkcyxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBkZXB0aDogdGhpcy5wcm9wcy5kZXB0aCArIDEsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgICAgICAgY2hlY2tIYXNIZWxwZXI6IHRoaXMucHJvcHMuY2hlY2tIYXNIZWxwZXIsXG4gICAgICAgICAgICAgICAgc2V0SGVscGVyRGF0YTogdGhpcy5wcm9wcy5zZXRIZWxwZXJEYXRhLFxuICAgICAgICAgICAgICAgIGhlbHBlclRlc3RGb3I6IHZhbHVlc1twYXJhbU5hbWVdLFxuICAgICAgICAgICAgICAgIGFjY29yZGlvbml6ZUlmR3JvdXBzTW9yZVRoYW46IDVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3N1Yi1mb3JtLWdyb3VwJyB9LFxuICAgICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgICBzZWxlY3RvckxlZ2VuZCxcbiAgICAgICAgICAgIHN1YkZvcm1cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9Gb3JtUGFuZWwgPSByZXF1aXJlKCcuL0Zvcm1QYW5lbCcpO1xuXG52YXIgX0Zvcm1QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Gb3JtUGFuZWwpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgQ29tcG9uZW50ID0gX3JlcXVpcmUuQ29tcG9uZW50O1xuXG52YXIgX3JlcXVpcmUyID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIEljb25CdXR0b24gPSBfcmVxdWlyZTIuSWNvbkJ1dHRvbjtcbnZhciBGbGF0QnV0dG9uID0gX3JlcXVpcmUyLkZsYXRCdXR0b247XG52YXIgUGFwZXIgPSBfcmVxdWlyZTIuUGFwZXI7XG5cbnZhciBVUF9BUlJPVyA9ICdtZGkgbWRpLW1lbnUtdXAnO1xudmFyIERPV05fQVJST1cgPSAnbWRpIG1kaS1tZW51LWRvd24nO1xudmFyIFJFTU9WRSA9ICdtZGkgbWRpLWRlbGV0ZS1jaXJjbGUnO1xuXG52YXIgUmVwbGljYXRlZEdyb3VwID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFJlcGxpY2F0ZWRHcm91cCwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBSZXBsaWNhdGVkR3JvdXAocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlcGxpY2F0ZWRHcm91cCk7XG5cbiAgICAgICAgX0NvbXBvbmVudC5jYWxsKHRoaXMsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgdmFyIHN1YlZhbHVlcyA9IHByb3BzLnN1YlZhbHVlcztcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBwcm9wcy5wYXJhbWV0ZXJzO1xuXG4gICAgICAgIHZhciBmaXJzdFBhcmFtID0gcGFyYW1ldGVyc1swXTtcbiAgICAgICAgdmFyIGluc3RhbmNlVmFsdWUgPSBzdWJWYWx1ZXNbZmlyc3RQYXJhbVsnbmFtZSddXSB8fCAnJztcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgdG9nZ2xlZDogaW5zdGFuY2VWYWx1ZSA/IGZhbHNlIDogdHJ1ZSB9O1xuICAgIH1cblxuICAgIFJlcGxpY2F0ZWRHcm91cC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgZGVwdGggPSBfcHJvcHMuZGVwdGg7XG4gICAgICAgIHZhciBvblN3YXBVcCA9IF9wcm9wcy5vblN3YXBVcDtcbiAgICAgICAgdmFyIG9uU3dhcERvd24gPSBfcHJvcHMub25Td2FwRG93bjtcbiAgICAgICAgdmFyIG9uUmVtb3ZlID0gX3Byb3BzLm9uUmVtb3ZlO1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9IF9wcm9wcy5wYXJhbWV0ZXJzO1xuICAgICAgICB2YXIgc3ViVmFsdWVzID0gX3Byb3BzLnN1YlZhbHVlcztcbiAgICAgICAgdmFyIGRpc2FibGVkID0gX3Byb3BzLmRpc2FibGVkO1xuICAgICAgICB2YXIgdG9nZ2xlZCA9IHRoaXMuc3RhdGUudG9nZ2xlZDtcblxuICAgICAgICB2YXIgZmlyc3RQYXJhbSA9IHBhcmFtZXRlcnNbMF07XG4gICAgICAgIHZhciBpbnN0YW5jZVZhbHVlID0gc3ViVmFsdWVzW2ZpcnN0UGFyYW1bJ25hbWUnXV0gfHwgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgY29sb3I6ICdyZ2JhKDAsMCwwLDAuMzMpJyB9IH0sXG4gICAgICAgICAgICAnRW1wdHkgVmFsdWUnXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBQYXBlcixcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgbWFyZ2luTGVmdDogMiwgbWFyZ2luUmlnaHQ6IDIsIG1hcmdpbkJvdHRvbTogMTAgfSB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktY2hldnJvbi0nICsgKHRoaXMuc3RhdGUudG9nZ2xlZCA/ICd1cCcgOiAnZG93bicpLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyB0b2dnbGVkOiAhX3RoaXMuc3RhdGUudG9nZ2xlZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEsIGZvbnRTaXplOiAxNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlVmFsdWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogVVBfQVJST1csIG9uVG91Y2hUYXA6IG9uU3dhcFVwLCBkaXNhYmxlZDogISEhb25Td2FwVXAgfHwgZGlzYWJsZWQgfSksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBET1dOX0FSUk9XLCBvblRvdWNoVGFwOiBvblN3YXBEb3duLCBkaXNhYmxlZDogISEhb25Td2FwRG93biB8fCBkaXNhYmxlZCB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICB0b2dnbGVkICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX0Zvcm1QYW5lbDJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgICAgICAgICB0YWJzOiBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlczogc3ViVmFsdWVzLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBudWxsLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3JlcGxpY2FibGUtZ3JvdXAnLFxuICAgICAgICAgICAgICAgIGRlcHRoOiBkZXB0aFxuICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgdG9nZ2xlZCAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogNCwgdGV4dEFsaWduOiAncmlnaHQnIH0gfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEZsYXRCdXR0b24sIHsgbGFiZWw6ICdSZW1vdmUnLCBwcmltYXJ5OiB0cnVlLCBvblRvdWNoVGFwOiBvblJlbW92ZSwgZGlzYWJsZWQ6ICEhIW9uUmVtb3ZlIHx8IGRpc2FibGVkIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHJldHVybiBSZXBsaWNhdGVkR3JvdXA7XG59KShDb21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBSZXBsaWNhdGVkR3JvdXA7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfUmVwbGljYXRlZEdyb3VwID0gcmVxdWlyZSgnLi9SZXBsaWNhdGVkR3JvdXAnKTtcblxudmFyIF9SZXBsaWNhdGVkR3JvdXAyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUmVwbGljYXRlZEdyb3VwKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIEljb25CdXR0b24gPSBfcmVxdWlyZS5JY29uQnV0dG9uO1xuXG52YXIgTGFuZ1V0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbi8qKlxuICogU3ViIGZvcm0gcmVwbGljYXRpbmcgaXRzZWxmICgrLy0pXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1JlcGxpY2F0aW9uUGFuZWwnLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHBhcmFtZXRlcnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgICB2YWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICBiaW5hcnlfY29udGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgZGVwdGg6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgICB9LFxuXG4gICAgYnVpbGRTdWJWYWx1ZTogZnVuY3Rpb24gYnVpbGRTdWJWYWx1ZSh2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB2YXIgc3ViVmFsID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgc3VmZml4ID0gaW5kZXggPT0gMCA/ICcnIDogJ18nICsgaW5kZXg7XG4gICAgICAgIHRoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHZhciBwTmFtZSA9IHBbJ25hbWUnXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZXNbcE5hbWUgKyBzdWZmaXhdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXN1YlZhbCkgc3ViVmFsID0ge307XG4gICAgICAgICAgICAgICAgc3ViVmFsW3BOYW1lXSA9IHZhbHVlc1twTmFtZSArIHN1ZmZpeF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3ViVmFsIHx8IGZhbHNlO1xuICAgIH0sXG5cbiAgICBpbmRleGVkVmFsdWVzOiBmdW5jdGlvbiBpbmRleGVkVmFsdWVzKHJvd3NBcnJheSkge1xuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgdmFsdWVzID0ge307XG4gICAgICAgIHJvd3NBcnJheS5tYXAoZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgdmFyIHN1ZmZpeCA9IGluZGV4ID09IDAgPyAnJyA6ICdfJyArIGluZGV4O1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiByb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJvdy5oYXNPd25Qcm9wZXJ0eShwKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgdmFsdWVzW3AgKyBzdWZmaXhdID0gcm93W3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfSxcblxuICAgIGluZGV4VmFsdWVzOiBmdW5jdGlvbiBpbmRleFZhbHVlcyhyb3dzQXJyYXksIHJlbW92ZUxhc3RSb3cpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgaW5kZXhlZCA9IHRoaXMuaW5kZXhlZFZhbHVlcyhyb3dzQXJyYXkpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgaWYgKHJlbW92ZUxhc3RSb3cpIHtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFJvdyA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluZGV4ID0gcm93c0FycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLnBhcmFtZXRlcnMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Um93W3BbJ25hbWUnXSArIChuZXh0SW5kZXggPiAwID8gJ18nICsgbmV4dEluZGV4IDogJycpXSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMucHJvcHMub25DaGFuZ2UoaW5kZXhlZCwgdHJ1ZSwgbGFzdFJvdyk7XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShpbmRleGVkLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpbnN0YW5jZXM6IGZ1bmN0aW9uIGluc3RhbmNlcygpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgLy8gQW5hbHl6ZSBjdXJyZW50IHZhbHVlIHRvIGdyYWIgbnVtYmVyIG9mIHJvd3MuXG4gICAgICAgIHZhciByb3dzID0gW10sXG4gICAgICAgICAgICBzdWJWYWwgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIHdoaWxlIChzdWJWYWwgPSB0aGlzLmJ1aWxkU3ViVmFsdWUodGhpcy5wcm9wcy52YWx1ZXMsIGluZGV4KSkge1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIHJvd3MucHVzaChzdWJWYWwpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmaXJzdFBhcmFtID0gdGhpcy5wcm9wcy5wYXJhbWV0ZXJzWzBdO1xuICAgICAgICBpZiAoIXJvd3MubGVuZ3RoICYmIGZpcnN0UGFyYW1bJ3JlcGxpY2F0aW9uTWFuZGF0b3J5J10gPT09ICd0cnVlJykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW1wdHlWYWx1ZSA9IHt9O1xuICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5wYXJhbWV0ZXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICBlbXB0eVZhbHVlW3BbJ25hbWUnXV0gPSBwWydkZWZhdWx0J10gfHwgJyc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcm93cy5wdXNoKGVtcHR5VmFsdWUpO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93cztcbiAgICB9LFxuXG4gICAgYWRkUm93OiBmdW5jdGlvbiBhZGRSb3coKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHt9LFxuICAgICAgICAgICAgY3VycmVudFZhbHVlcyA9IHRoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgIHRoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlW3BbJ25hbWUnXV0gPSBwWydkZWZhdWx0J10gfHwgJyc7XG4gICAgICAgIH0pO1xuICAgICAgICBjdXJyZW50VmFsdWVzLnB1c2gobmV3VmFsdWUpO1xuICAgICAgICB0aGlzLmluZGV4VmFsdWVzKGN1cnJlbnRWYWx1ZXMpO1xuICAgIH0sXG5cbiAgICByZW1vdmVSb3c6IGZ1bmN0aW9uIHJlbW92ZVJvdyhpbmRleCkge1xuICAgICAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgdmFyIHJlbW92ZUluc3QgPSBpbnN0YW5jZXNbaW5kZXhdO1xuICAgICAgICBpbnN0YW5jZXMgPSBMYW5nVXRpbHMuYXJyYXlXaXRob3V0KHRoaXMuaW5zdGFuY2VzKCksIGluZGV4KTtcbiAgICAgICAgaW5zdGFuY2VzLnB1c2gocmVtb3ZlSW5zdCk7XG4gICAgICAgIHRoaXMuaW5kZXhWYWx1ZXMoaW5zdGFuY2VzLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgc3dhcFJvd3M6IGZ1bmN0aW9uIHN3YXBSb3dzKGksIGopIHtcbiAgICAgICAgdmFyIGluc3RhbmNlcyA9IHRoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgIHZhciB0bXAgPSBpbnN0YW5jZXNbal07XG4gICAgICAgIGluc3RhbmNlc1tqXSA9IGluc3RhbmNlc1tpXTtcbiAgICAgICAgaW5zdGFuY2VzW2ldID0gdG1wO1xuICAgICAgICB0aGlzLmluZGV4VmFsdWVzKGluc3RhbmNlcyk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZShpbmRleCwgbmV3VmFsdWVzLCBkaXJ0eSkge1xuICAgICAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgaW5zdGFuY2VzW2luZGV4XSA9IG5ld1ZhbHVlcztcbiAgICAgICAgdGhpcy5pbmRleFZhbHVlcyhpbnN0YW5jZXMpO1xuICAgIH0sXG5cbiAgICBvblBhcmFtZXRlckNoYW5nZTogZnVuY3Rpb24gb25QYXJhbWV0ZXJDaGFuZ2UoaW5kZXgsIHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZXMgPSB0aGlzLmluc3RhbmNlcygpO1xuICAgICAgICBpbnN0YW5jZXNbaW5kZXhdW3BhcmFtTmFtZV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgdGhpcy5pbmRleFZhbHVlcyhpbnN0YW5jZXMpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gX3Byb3BzLnBhcmFtZXRlcnM7XG4gICAgICAgIHZhciBkaXNhYmxlZCA9IF9wcm9wcy5kaXNhYmxlZDtcblxuICAgICAgICB2YXIgZmlyc3RQYXJhbSA9IHBhcmFtZXRlcnNbMF07XG4gICAgICAgIHZhciByZXBsaWNhdGlvblRpdGxlID0gZmlyc3RQYXJhbVsncmVwbGljYXRpb25UaXRsZSddIHx8IGZpcnN0UGFyYW1bJ2xhYmVsJ107XG4gICAgICAgIHZhciByZXBsaWNhdGlvbkRlc2NyaXB0aW9uID0gZmlyc3RQYXJhbVsncmVwbGljYXRpb25EZXNjcmlwdGlvbiddIHx8IGZpcnN0UGFyYW1bJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgIHZhciByZXBsaWNhdGlvbk1hbmRhdG9yeSA9IGZpcnN0UGFyYW1bJ3JlcGxpY2F0aW9uTWFuZGF0b3J5J10gPT09ICd0cnVlJztcblxuICAgICAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgdmFyIG11bHRpcGxlID0gaW5zdGFuY2VzLmxlbmd0aCA+IDE7XG4gICAgICAgIHZhciByb3dzID0gaW5zdGFuY2VzLm1hcChmdW5jdGlvbiAoc3ViVmFsdWVzLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIG9uU3dhcFVwID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG9uU3dhcERvd24gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgb25SZW1vdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgb25QYXJhbWV0ZXJDaGFuZ2UgPSBmdW5jdGlvbiBvblBhcmFtZXRlckNoYW5nZShwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMy5vblBhcmFtZXRlckNoYW5nZShpbmRleCwgcGFyYW1OYW1lLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChtdWx0aXBsZSAmJiBpbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICBvblN3YXBVcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnN3YXBSb3dzKGluZGV4LCBpbmRleCAtIDEpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobXVsdGlwbGUgJiYgaW5kZXggPCBpbnN0YW5jZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIG9uU3dhcERvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5zd2FwUm93cyhpbmRleCwgaW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG11bHRpcGxlIHx8ICFyZXBsaWNhdGlvbk1hbmRhdG9yeSkge1xuICAgICAgICAgICAgICAgIG9uUmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMucmVtb3ZlUm93KGluZGV4KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHByb3BzID0geyBvblN3YXBVcDogb25Td2FwVXAsIG9uU3dhcERvd246IG9uU3dhcERvd24sIG9uUmVtb3ZlOiBvblJlbW92ZSwgb25QYXJhbWV0ZXJDaGFuZ2U6IG9uUGFyYW1ldGVyQ2hhbmdlIH07XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChfUmVwbGljYXRlZEdyb3VwMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7IGtleTogaW5kZXggfSwgX3RoaXMzLnByb3BzLCBwcm9wcywgeyBzdWJWYWx1ZXM6IHN1YlZhbHVlcyB9KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3JlcGxpY2FibGUtZmllbGQnIH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndGl0bGUtYmFyJyB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSWNvbkJ1dHRvbiwgeyBrZXk6ICdhZGQnLCBzdHlsZTogeyBmbG9hdDogJ3JpZ2h0JyB9LCBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1wbHVzJywgaWNvblN0eWxlOiB7IGZvbnRTaXplOiAyNCB9LCB0b29sdGlwOiAnQWRkIHZhbHVlJywgb25DbGljazogdGhpcy5hZGRSb3csIGRpc2FibGVkOiBkaXNhYmxlZCB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICd0aXRsZScgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVwbGljYXRpb25UaXRsZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnbGVnZW5kJyB9LFxuICAgICAgICAgICAgICAgICAgICByZXBsaWNhdGlvbkRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHJvd3NcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iXX0=

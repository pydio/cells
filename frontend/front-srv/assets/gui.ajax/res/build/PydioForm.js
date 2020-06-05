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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var _mixinsFieldWithChoices = require('../mixins/FieldWithChoices');

var _mixinsFieldWithChoices2 = _interopRequireDefault(_mixinsFieldWithChoices);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var React = require('react');

var _require = require('material-ui');

var AutoComplete = _require.AutoComplete;
var MenuItem = _require.MenuItem;
var RefreshIndicator = _require.RefreshIndicator;

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernStyles = _Pydio$requireLib.ModernStyles;

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
            dataSource.length && React.createElement(AutoComplete, _extends({
                fullWidth: true,
                searchText: displayText,
                onUpdateInput: this.handleUpdateInput,
                onNewRequest: this.handleNewRequest,
                dataSource: dataSource,
                hintText: this.props.attributes['label'],
                filter: function (searchText, key) {
                    if (!key || !searchText) {
                        return false;
                    }
                    return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
                },
                openOnFocus: true,
                menuProps: { maxHeight: 200 }
            }, ModernStyles.textField))
        );
    }

});

exports['default'] = AutocompleteBox = _mixinsFieldWithChoices2['default'](AutocompleteBox);
exports['default'] = AutocompleteBox;
module.exports = exports['default'];

},{"../mixins/FieldWithChoices":16,"../mixins/FormMixin":17,"material-ui":"material-ui","pydio":"pydio","react":"react"}],2:[function(require,module,exports){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var _materialUi = require("material-ui");

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernStyles = _Pydio$requireLib.ModernStyles;

/**
 * Boolean input
 */
exports['default'] = _react2['default'].createClass({
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
            boolVal = boolVal === "true";
        }
        return boolVal;
    },

    render: function render() {
        var boolVal = this.getBooleanState();
        return _react2['default'].createElement(
            'span',
            null,
            _react2['default'].createElement(_materialUi.Toggle, _extends({
                toggled: boolVal,
                onToggle: this.onCheck,
                disabled: this.props.disabled,
                label: this.isDisplayForm() ? this.props.attributes.label : null,
                labelPosition: this.isDisplayForm() ? 'left' : 'right'
            }, ModernStyles.toggleField))
        );
    }

});
module.exports = exports['default'];

},{"../mixins/FormMixin":17,"material-ui":"material-ui","pydio":"pydio","react":"react"}],5:[function(require,module,exports){
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../mixins/FormMixin":17,"./FileDropzone":3,"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/lang":"pydio/util/lang","react":"react"}],7:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Text input that is converted to integer, and
 * the UI can react to arrows for incrementing/decrementing values
 */
exports['default'] = _react2['default'].createClass({
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
            return _react2['default'].createElement(
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
            return _react2['default'].createElement(
                'span',
                { className: 'integer-input' },
                _react2['default'].createElement(ModernTextField, {
                    value: intval,
                    onChange: this.onChange,
                    onKeyDown: this.keyDown,
                    disabled: this.props.disabled,
                    fullWidth: true,
                    hintText: this.isDisplayForm() ? this.props.attributes.label : null
                })
            );
        }
    }

});
module.exports = exports['default'];

},{"../mixins/FormMixin":17,"pydio":"pydio","react":"react"}],8:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var React = require('react');

var _require = require('material-ui');

var SelectField = _require.SelectField;
var MenuItem = _require.MenuItem;
var Chip = _require.Chip;

var LangUtils = require('pydio/util/lang');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib.ModernSelectField;

/**
 * Select box input conforming to Pydio standard form parameter.
 */
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
                        ModernSelectField,
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
                        ModernSelectField,
                        {
                            hintText: this.props.attributes.label,
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

},{"../mixins/FieldWithChoices":16,"../mixins/FormMixin":17,"material-ui":"material-ui","pydio":"pydio","pydio/util/lang":"pydio/util/lang","react":"react"}],9:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */
exports['default'] = _react2['default'].createClass({
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
            return _react2['default'].createElement(
                'div',
                { onClick: this.props.disabled ? function () {} : this.toggleEditMode, className: value ? '' : 'paramValue-empty' },
                !value ? 'Empty' : value
            );
        } else {
            var field = _react2['default'].createElement(ModernTextField, {
                hintText: this.isDisplayForm() ? this.props.attributes.label : null,
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
                return _react2['default'].createElement(
                    'form',
                    { autoComplete: 'off', onSubmit: function (e) {
                            e.stopPropagation();e.preventDefault();
                        }, style: { display: 'inline' } },
                    field
                );
            } else {
                return _react2['default'].createElement(
                    'span',
                    null,
                    field
                );
            }
        }
    }

});
module.exports = exports['default'];

},{"../mixins/FormMixin":17,"material-ui":"material-ui","pydio":"pydio","react":"react"}],11:[function(require,module,exports){
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

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */
exports['default'] = _react2['default'].createClass({
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
            return _react2['default'].createElement(
                'div',
                { onClick: this.props.disabled ? function () {} : this.toggleEditMode, className: value ? '' : 'paramValue-empty' },
                !value ? 'Empty' : value
            );
        } else {
            var err = this.state.err;

            var field = _react2['default'].createElement(ModernTextField, {
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
                return _react2['default'].createElement(
                    'form',
                    { autoComplete: 'off', onSubmit: function (e) {
                            e.stopPropagation();e.preventDefault();
                        }, style: { display: 'inline' } },
                    field
                );
            } else {
                return _react2['default'].createElement(
                    'span',
                    null,
                    field
                );
            }
        }
    }

});
module.exports = exports['default'];

},{"../mixins/FormMixin":17,"pydio":"pydio","pydio/util/pass":"pydio/util/pass","react":"react"}],12:[function(require,module,exports){
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
"use strict";

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilPass = require("pydio/util/pass");

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _mixinsFormMixin = require('../mixins/FormMixin');

var _mixinsFormMixin2 = _interopRequireDefault(_mixinsFormMixin);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2["default"].requireLib("hoc");

var ModernTextField = _Pydio$requireLib.ModernTextField;
exports["default"] = _react2["default"].createClass({
    displayName: "ValidPassword",

    mixins: [_mixinsFormMixin2["default"]],

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
        var newState = _pydioUtilPass2["default"].getState(this.refs.pass.getValue(), this.refs.confirm ? this.refs.confirm.getValue() : '');
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
        var _props = this.props;
        var disabled = _props.disabled;
        var className = _props.className;
        var attributes = _props.attributes;
        var dialogField = _props.dialogField;

        if (this.isDisplayGrid() && !this.state.editMode) {
            var value = this.state.value;
            return _react2["default"].createElement(
                "div",
                { onClick: disabled ? function () {} : this.toggleEditMode, className: value ? '' : 'paramValue-empty' },
                value ? value : 'Empty'
            );
        } else {
            var overflow = { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' };
            var cName = this.state.valid ? '' : 'mui-error-as-hint';
            if (className) {
                cName = className + ' ' + cName;
            }
            var _confirm = undefined;
            var TextComponent = dialogField ? _materialUi.TextField : ModernTextField;
            if (this.state.value && !disabled) {

                _confirm = [_react2["default"].createElement("div", { key: "sep", style: { width: 8 } }), _react2["default"].createElement(TextComponent, {
                    key: "confirm",
                    ref: "confirm",
                    floatingLabelText: this.getMessage(199),
                    floatingLabelShrinkStyle: _extends({}, overflow, { width: '130%' }),
                    floatingLabelStyle: overflow,
                    className: cName,
                    value: this.state.confirmValue,
                    onChange: this.onConfirmChange,
                    type: "password",
                    multiLine: false,
                    disabled: disabled,
                    fullWidth: true,
                    style: { flex: 1 },
                    errorText: this.state.confirmErrorText,
                    errorStyle: dialogField ? { bottom: -5 } : null
                })];
            }
            return _react2["default"].createElement(
                "form",
                { autoComplete: "off", onSubmit: function (e) {
                        e.stopPropagation();e.preventDefault();
                    } },
                _react2["default"].createElement(
                    "div",
                    { style: { display: 'flex' } },
                    _react2["default"].createElement(TextComponent, {
                        ref: "pass",
                        floatingLabelText: this.isDisplayForm() ? attributes.label : null,
                        floatingLabelShrinkStyle: _extends({}, overflow, { width: '130%' }),
                        floatingLabelStyle: overflow,
                        className: cName,
                        value: this.state.value,
                        onChange: this.onPasswordChange,
                        onKeyDown: this.enterToToggle,
                        type: "password",
                        multiLine: false,
                        disabled: disabled,
                        errorText: this.state.passErrorText,
                        fullWidth: true,
                        style: { flex: 1 },
                        errorStyle: dialogField ? { bottom: -5 } : null
                    }),
                    _confirm
                )
            );
        }
    }

});
module.exports = exports["default"];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../mixins/FormMixin":17,"material-ui":"material-ui","pydio":"pydio","pydio/util/pass":"pydio/util/pass","react":"react"}],13:[function(require,module,exports){
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
                    (function () {
                        var sorter = [];
                        var pages = [];
                        pydio.user.repositories.forEach(function (repository) {
                            if (repository.getId() === 'settings' || repository.getId() === 'homepage') {
                                pages.push({ id: repository.getId(), label: '[' + pydio.MessageHash['331'] + '] ' + repository.getLabel() });
                            } else if (repository.getRepositoryType() !== "cell") {
                                sorter.push({ id: repository.getId(), label: repository.getLabel() });
                            }
                        });
                        console.log(sorter);
                        sorter.sort(function (a, b) {
                            return a.label.localeCompare(b.label, undefined, { numeric: true });
                        });
                        sorter.push.apply(sorter, pages);
                        sorter.forEach(function (d) {
                            return output.set(d.id, d.label);
                        });
                    })();
                }
                if (this.onChoicesLoaded) {
                    this.onChoicesLoaded(output);
                }
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

var _react = require('react');

var _materialUi = require('material-ui');

var _FormPanel = require('./FormPanel');

var _FormPanel2 = _interopRequireDefault(_FormPanel);

var UP_ARROW = 'mdi mdi-chevron-up';
var DOWN_ARROW = 'mdi mdi-chevron-down';
var REMOVE = 'mdi mdi-close';
var ADD_VALUE = 'mdi mdi-plus';

var ReplicatedGroup = (function (_Component) {
    _inherits(ReplicatedGroup, _Component);

    function ReplicatedGroup(props, context) {
        _classCallCheck(this, ReplicatedGroup);

        _Component.call(this, props, context);
        var subValues = props.subValues;
        var parameters = props.parameters;

        var firstParam = parameters[0];
        var instanceValue = subValues[firstParam['name']] || '';
        this.state = { toggled: !instanceValue };
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
        var onAddValue = _props.onAddValue;
        var toggled = this.state.toggled;

        var unique = parameters.length === 1;
        var firstParam = parameters[0];
        var instanceValue = subValues[firstParam['name']] || React.createElement(
            'span',
            { style: { color: 'rgba(0,0,0,0.33)' } },
            'Empty Value'
        );
        var ibStyles = { width: 36, height: 36, padding: 6 };

        if (unique) {
            var disStyle = { opacity: .3 };
            var remStyle = !!!onRemove || disabled ? disStyle : {};
            var upStyle = !!!onSwapUp || disabled ? disStyle : {};
            var downStyle = !!!onSwapDown || disabled ? disStyle : {};
            return React.createElement(
                'div',
                { style: { display: 'flex', width: '100%' } },
                React.createElement(
                    'div',
                    { style: { flex: 1 } },
                    React.createElement(_FormPanel2['default'], _extends({}, this.props, {
                        tabs: null,
                        values: subValues,
                        onChange: null,
                        className: 'replicable-unique',
                        depth: -1,
                        style: { paddingBottom: 0 }
                    }))
                ),
                React.createElement(
                    'div',
                    { style: { display: 'flex', fontSize: 24, paddingLeft: 4, paddingTop: 2 } },
                    onAddValue && React.createElement(
                        'div',
                        null,
                        React.createElement('div', { className: ADD_VALUE, style: { padding: '8px 4px', cursor: 'pointer' }, onClick: onAddValue })
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('div', { className: REMOVE, style: _extends({ padding: '8px 4px', cursor: 'pointer' }, remStyle), onClick: onRemove })
                    ),
                    React.createElement(
                        'div',
                        { style: { display: 'flex', flexDirection: 'column', padding: '0 4px' } },
                        React.createElement('div', { className: UP_ARROW, style: _extends({ height: 16, cursor: 'pointer' }, upStyle), onClick: onSwapUp }),
                        React.createElement('div', { className: DOWN_ARROW, style: _extends({ height: 16, cursor: 'pointer' }, downStyle), onClick: onSwapDown })
                    )
                )
            );
        }

        return React.createElement(
            _materialUi.Paper,
            { zDepth: 0, style: { border: '2px solid whitesmoke', marginBottom: 8 } },
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                React.createElement(
                    'div',
                    null,
                    React.createElement(_materialUi.IconButton, { iconClassName: 'mdi mdi-menu-' + (this.state.toggled ? 'down' : 'right'), iconStyle: { color: 'rgba(0,0,0,.15)' }, onTouchTap: function () {
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
                    onAddValue && React.createElement(_materialUi.IconButton, { style: ibStyles, iconClassName: ADD_VALUE, onTouchTap: onAddValue }),
                    React.createElement(_materialUi.IconButton, { style: ibStyles, iconClassName: REMOVE, onTouchTap: onRemove, disabled: !!!onRemove || disabled }),
                    React.createElement(_materialUi.IconButton, { style: ibStyles, iconClassName: UP_ARROW, onTouchTap: onSwapUp, disabled: !!!onSwapUp || disabled }),
                    React.createElement(_materialUi.IconButton, { style: ibStyles, iconClassName: DOWN_ARROW, onTouchTap: onSwapDown, disabled: !!!onSwapDown || disabled })
                )
            ),
            toggled && React.createElement(_FormPanel2['default'], _extends({}, this.props, {
                tabs: null,
                values: subValues,
                onChange: null,
                className: 'replicable-group',
                depth: -1
            }))
        );
    };

    return ReplicatedGroup;
})(_react.Component);

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
        var multipleRows = instances.length > 1;
        var multipleParams = parameters.length > 1;
        var rows = instances.map(function (subValues, index) {
            var onSwapUp = undefined,
                onSwapDown = undefined,
                onRemove = undefined;
            var onParameterChange = function onParameterChange(paramName, newValue, oldValue) {
                _this3.onParameterChange(index, paramName, newValue, oldValue);
            };
            if (multipleRows && index > 0) {
                onSwapUp = function () {
                    _this3.swapRows(index, index - 1);
                };
            }
            if (multipleRows && index < instances.length - 1) {
                onSwapDown = function () {
                    _this3.swapRows(index, index + 1);
                };
            }
            if (multipleRows || !replicationMandatory) {
                onRemove = function () {
                    _this3.removeRow(index);
                };
            }
            var props = { onSwapUp: onSwapUp, onSwapDown: onSwapDown, onRemove: onRemove, onParameterChange: onParameterChange };
            if (replicationMandatory && index === 0) {
                props.onAddValue = function () {
                    return _this3.addRow();
                };
            }
            return React.createElement(_ReplicatedGroup2['default'], _extends({ key: index }, _this3.props, props, { subValues: subValues }));
        });

        if (replicationMandatory) {
            return React.createElement(
                'div',
                { className: 'replicable-field', style: { marginBottom: 14 } },
                rows
            );
        }

        var tStyle = rows.length ? {} : { backgroundColor: 'whitesmoke', borderRadius: 4 };
        return React.createElement(
            'div',
            { className: 'replicable-field', style: { marginBottom: 14 } },
            React.createElement(
                'div',
                { style: _extends({ display: 'flex', alignItems: 'center' }, tStyle) },
                React.createElement(IconButton, { key: 'add', iconClassName: 'mdi mdi-plus-box-outline', tooltipPosition: "top-right", style: { height: 36, width: 36, padding: 6 }, iconStyle: { fontSize: 24 }, tooltip: 'Add value', onClick: function () {
                        return _this3.addRow();
                    }, disabled: disabled }),
                React.createElement(
                    'div',
                    { className: 'title', style: { fontSize: 16, flex: 1 } },
                    replicationTitle
                )
            ),
            rows
        );
    }

});
module.exports = exports['default'];

},{"./ReplicatedGroup":22,"material-ui":"material-ui","pydio/util/lang":"pydio/util/lang","react":"react"}]},{},[13])(13)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvQXV0b2NvbXBsZXRlQm94LmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0F1dG9jb21wbGV0ZVRyZWUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvRmlsZURyb3B6b25lLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0Qm9vbGVhbi5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9JbnB1dEJ1dHRvbi5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9JbnB1dEltYWdlLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0SW50ZWdlci5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9JbnB1dFNlbGVjdEJveC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9Nb25pdG9yaW5nTGFiZWwuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvVGV4dEZpZWxkLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL1ZhbGlkTG9naW4uanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvVmFsaWRQYXNzd29yZC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2luZGV4LmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWFuYWdlci9NYW5hZ2VyLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWl4aW5zL0FjdGlvblJ1bm5lck1peGluLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWl4aW5zL0ZpZWxkV2l0aENob2ljZXMuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9taXhpbnMvRm9ybU1peGluLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vbWl4aW5zL0hlbHBlck1peGluLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vcGFuZWwvRm9ybUhlbHBlci5qcyIsInJlcy9idWlsZC91aS9Gb3JtL3BhbmVsL0Zvcm1QYW5lbC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL3BhbmVsL0dyb3VwU3dpdGNoUGFuZWwuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9SZXBsaWNhdGVkR3JvdXAuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9SZXBsaWNhdGlvblBhbmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDalJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgX21peGluc0ZpZWxkV2l0aENob2ljZXMgPSByZXF1aXJlKCcuLi9taXhpbnMvRmllbGRXaXRoQ2hvaWNlcycpO1xuXG52YXIgX21peGluc0ZpZWxkV2l0aENob2ljZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRmllbGRXaXRoQ2hvaWNlcyk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIEF1dG9Db21wbGV0ZSA9IF9yZXF1aXJlLkF1dG9Db21wbGV0ZTtcbnZhciBNZW51SXRlbSA9IF9yZXF1aXJlLk1lbnVJdGVtO1xudmFyIFJlZnJlc2hJbmRpY2F0b3IgPSBfcmVxdWlyZS5SZWZyZXNoSW5kaWNhdG9yO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5TdHlsZXMgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5TdHlsZXM7XG5cbnZhciBBdXRvY29tcGxldGVCb3ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdBdXRvY29tcGxldGVCb3gnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBoYW5kbGVVcGRhdGVJbnB1dDogZnVuY3Rpb24gaGFuZGxlVXBkYXRlSW5wdXQoc2VhcmNoVGV4dCkge1xuICAgICAgICAvL3RoaXMuc2V0U3RhdGUoe3NlYXJjaFRleHQ6IHNlYXJjaFRleHR9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlTmV3UmVxdWVzdDogZnVuY3Rpb24gaGFuZGxlTmV3UmVxdWVzdChjaG9zZW5WYWx1ZSkge1xuICAgICAgICBpZiAoY2hvc2VuVmFsdWUua2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2UobnVsbCwgY2hvc2VuVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZShudWxsLCBjaG9zZW5WYWx1ZS5rZXkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcztcblxuICAgICAgICB2YXIgZGF0YVNvdXJjZSA9IFtdO1xuICAgICAgICB2YXIgbGFiZWxzID0ge307XG4gICAgICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBrZXkpIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICAgdGV4dDogY2hvaWNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBNZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYWJlbHNba2V5XSA9IGNob2ljZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGRpc3BsYXlUZXh0ID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgaWYgKGxhYmVscyAmJiBsYWJlbHNbZGlzcGxheVRleHRdKSB7XG4gICAgICAgICAgICBkaXNwbGF5VGV4dCA9IGxhYmVsc1tkaXNwbGF5VGV4dF07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0Rpc3BsYXlHcmlkKCkgJiYgIXRoaXMuc3RhdGUuZWRpdE1vZGUgfHwgdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzLmdldCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGNob2ljZXMuZ2V0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5wcm9wcy5kaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdGhpcy50b2dnbGVFZGl0TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiB2YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgIXZhbHVlID8gJ0VtcHR5JyA6IHZhbHVlLFxuICAgICAgICAgICAgICAgICcgwqDCoCcsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnaWNvbi1jYXJldC1kb3duJyB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3B5ZGlvZm9ybV9hdXRvY29tcGxldGUnLCBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9IH0sXG4gICAgICAgICAgICAhZGF0YVNvdXJjZS5sZW5ndGggJiYgUmVhY3QuY3JlYXRlRWxlbWVudChSZWZyZXNoSW5kaWNhdG9yLCB7XG4gICAgICAgICAgICAgICAgc2l6ZTogMzAsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IDEwLFxuICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdsb2FkaW5nJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBkYXRhU291cmNlLmxlbmd0aCAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KEF1dG9Db21wbGV0ZSwgX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWFyY2hUZXh0OiBkaXNwbGF5VGV4dCxcbiAgICAgICAgICAgICAgICBvblVwZGF0ZUlucHV0OiB0aGlzLmhhbmRsZVVwZGF0ZUlucHV0LFxuICAgICAgICAgICAgICAgIG9uTmV3UmVxdWVzdDogdGhpcy5oYW5kbGVOZXdSZXF1ZXN0LFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U6IGRhdGFTb3VyY2UsXG4gICAgICAgICAgICAgICAgaGludFRleHQ6IHRoaXMucHJvcHMuYXR0cmlidXRlc1snbGFiZWwnXSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uIChzZWFyY2hUZXh0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFrZXkgfHwgIXNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpID09PSAwO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3Blbk9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVudVByb3BzOiB7IG1heEhlaWdodDogMjAwIH1cbiAgICAgICAgICAgIH0sIE1vZGVyblN0eWxlcy50ZXh0RmllbGQpKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEF1dG9jb21wbGV0ZUJveCA9IF9taXhpbnNGaWVsZFdpdGhDaG9pY2VzMlsnZGVmYXVsdCddKEF1dG9jb21wbGV0ZUJveCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBBdXRvY29tcGxldGVCb3g7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoLmRlYm91bmNlJyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBBdXRvQ29tcGxldGUgPSBfcmVxdWlyZS5BdXRvQ29tcGxldGU7XG52YXIgTWVudUl0ZW0gPSBfcmVxdWlyZS5NZW51SXRlbTtcbnZhciBSZWZyZXNoSW5kaWNhdG9yID0gX3JlcXVpcmUuUmVmcmVzaEluZGljYXRvcjtcbnZhciBGb250SWNvbiA9IF9yZXF1aXJlLkZvbnRJY29uO1xuXG52YXIgQXV0b2NvbXBsZXRlVHJlZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0F1dG9jb21wbGV0ZVRyZWUnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBoYW5kbGVVcGRhdGVJbnB1dDogZnVuY3Rpb24gaGFuZGxlVXBkYXRlSW5wdXQoc2VhcmNoVGV4dCkge1xuICAgICAgICB0aGlzLmRlYm91bmNlZCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VhcmNoVGV4dDogc2VhcmNoVGV4dCB9KTtcbiAgICB9LFxuXG4gICAgaGFuZGxlTmV3UmVxdWVzdDogZnVuY3Rpb24gaGFuZGxlTmV3UmVxdWVzdChjaG9zZW5WYWx1ZSkge1xuICAgICAgICB2YXIga2V5ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoY2hvc2VuVmFsdWUua2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGtleSA9IGNob3NlblZhbHVlLmtleTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleSA9IGNob3NlblZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25DaGFuZ2UobnVsbCwga2V5KTtcbiAgICAgICAgdGhpcy5sb2FkVmFsdWVzKGtleSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICB0aGlzLmRlYm91bmNlZCA9IGRlYm91bmNlKHRoaXMubG9hZFZhbHVlcy5iaW5kKHRoaXMpLCAzMDApO1xuICAgICAgICB0aGlzLmxhc3RTZWFyY2ggPSBudWxsO1xuICAgICAgICB2YXIgdmFsdWUgPSBcIlwiO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9hZFZhbHVlcyh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGxvYWRWYWx1ZXM6IGZ1bmN0aW9uIGxvYWRWYWx1ZXMoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgdmFyIGJhc2VQYXRoID0gdmFsdWU7XG4gICAgICAgIGlmICghdmFsdWUgJiYgdGhpcy5zdGF0ZS5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICB2YXIgbGFzdCA9IHRoaXMuc3RhdGUuc2VhcmNoVGV4dC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLnN0YXRlLnNlYXJjaFRleHQuc3Vic3RyKDAsIGxhc3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxhc3RTZWFyY2ggIT09IG51bGwgJiYgdGhpcy5sYXN0U2VhcmNoID09PSBiYXNlUGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdFNlYXJjaCA9IGJhc2VQYXRoO1xuICAgICAgICAvLyBUT0RPIDogbG9hZCB2YWx1ZXMgZnJvbSBzZXJ2aWNlXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgIHZhciBkYXRhU291cmNlID0gW107XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUubm9kZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBpY29uID0gXCJtZGkgbWRpLWZvbGRlclwiO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnV1aWQuc3RhcnRzV2l0aChcIkRBVEFTT1VSQ0U6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGljb24gPSBcIm1kaSBtZGktZGF0YWJhc2VcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBub2RlLnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IG5vZGUucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBNZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEZvbnRJY29uLCB7IGNsYXNzTmFtZTogaWNvbiwgY29sb3I6ICcjNjE2MTYxJywgc3R5bGU6IHsgZmxvYXQ6ICdsZWZ0JywgbWFyZ2luUmlnaHQ6IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucGF0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkaXNwbGF5VGV4dCA9IHRoaXMuc3RhdGUudmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncHlkaW9mb3JtX2F1dG9jb21wbGV0ZScsIHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnIH0gfSxcbiAgICAgICAgICAgICFkYXRhU291cmNlLmxlbmd0aCAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlZnJlc2hJbmRpY2F0b3IsIHtcbiAgICAgICAgICAgICAgICBzaXplOiAzMCxcbiAgICAgICAgICAgICAgICByaWdodDogMTAsXG4gICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ2xvYWRpbmcnXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXV0b0NvbXBsZXRlLCB7XG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlYXJjaFRleHQ6IGRpc3BsYXlUZXh0LFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlSW5wdXQ6IHRoaXMuaGFuZGxlVXBkYXRlSW5wdXQsXG4gICAgICAgICAgICAgICAgb25OZXdSZXF1ZXN0OiB0aGlzLmhhbmRsZU5ld1JlcXVlc3QsXG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZTogZGF0YVNvdXJjZSxcbiAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydsYWJlbCddLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZnVuY3Rpb24gKHNlYXJjaFRleHQsIGtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpID09PSAwO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3Blbk9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVudVByb3BzOiB7IG1heEhlaWdodDogMjAwIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQXV0b2NvbXBsZXRlVHJlZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuLyoqXG4gKiBVSSB0byBkcm9wIGEgZmlsZSAob3IgY2xpY2sgdG8gYnJvd3NlKSwgdXNlZCBieSB0aGUgSW5wdXRJbWFnZSBjb21wb25lbnQuXG4gKi9cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiBcIkZpbGVEcm9wem9uZVwiLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdXBwb3J0Q2xpY2s6IHRydWUsXG4gICAgICAgICAgICBtdWx0aXBsZTogdHJ1ZSxcbiAgICAgICAgICAgIG9uRHJvcDogZnVuY3Rpb24gb25Ecm9wKCkge31cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc0RyYWdBY3RpdmU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBvbkRyb3A6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGlnbm9yZU5hdGl2ZURyb3A6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICBzaXplOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgICBzdHlsZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgZHJhZ0FjdGl2ZVN0eWxlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBzdXBwb3J0Q2xpY2s6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICBhY2NlcHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIG11bHRpcGxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuICAgIH0sXG5cbiAgICBvbkRyYWdMZWF2ZTogZnVuY3Rpb24gb25EcmFnTGVhdmUoZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzRHJhZ0FjdGl2ZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uRHJhZ092ZXI6IGZ1bmN0aW9uIG9uRHJhZ092ZXIoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcImNvcHlcIjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzRHJhZ0FjdGl2ZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25GaWxlUGlja2VkOiBmdW5jdGlvbiBvbkZpbGVQaWNrZWQoZSkge1xuICAgICAgICBpZiAoIWUudGFyZ2V0IHx8ICFlLnRhcmdldC5maWxlcykgcmV0dXJuO1xuICAgICAgICB2YXIgZmlsZXMgPSBlLnRhcmdldC5maWxlcztcbiAgICAgICAgdmFyIG1heEZpbGVzID0gdGhpcy5wcm9wcy5tdWx0aXBsZSA/IGZpbGVzLmxlbmd0aCA6IDE7XG4gICAgICAgIGZpbGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZmlsZXMsIDAsIG1heEZpbGVzKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25Ecm9wKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRHJvcChmaWxlcywgZSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25Gb2xkZXJQaWNrZWQ6IGZ1bmN0aW9uIG9uRm9sZGVyUGlja2VkKGUpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25Gb2xkZXJQaWNrZWQpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Gb2xkZXJQaWNrZWQoZS50YXJnZXQuZmlsZXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uRHJvcDogZnVuY3Rpb24gb25Ecm9wKGUpIHtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzRHJhZ0FjdGl2ZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaWdub3JlTmF0aXZlRHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpbGVzID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgICAgIGZpbGVzID0gZS5kYXRhVHJhbnNmZXIuZmlsZXM7XG4gICAgICAgIH0gZWxzZSBpZiAoZS50YXJnZXQpIHtcbiAgICAgICAgICAgIGZpbGVzID0gZS50YXJnZXQuZmlsZXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWF4RmlsZXMgPSB0aGlzLnByb3BzLm11bHRpcGxlID8gZmlsZXMubGVuZ3RoIDogMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXhGaWxlczsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlc1tpXS5wcmV2aWV3ID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkRyb3ApIHtcbiAgICAgICAgICAgIGZpbGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZmlsZXMsIDAsIG1heEZpbGVzKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Ecm9wKGZpbGVzLCBlLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkNsaWNrOiBmdW5jdGlvbiBvbkNsaWNrKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zdXBwb3J0Q2xpY2sgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9wZW46IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgIHRoaXMucmVmcy5maWxlSW5wdXQuY2xpY2soKTtcbiAgICB9LFxuXG4gICAgb3BlbkZvbGRlclBpY2tlcjogZnVuY3Rpb24gb3BlbkZvbGRlclBpY2tlcigpIHtcbiAgICAgICAgdGhpcy5yZWZzLmZvbGRlcklucHV0LnNldEF0dHJpYnV0ZShcIndlYmtpdGRpcmVjdG9yeVwiLCBcInRydWVcIik7XG4gICAgICAgIHRoaXMucmVmcy5mb2xkZXJJbnB1dC5jbGljaygpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICB2YXIgY2xhc3NOYW1lID0gdGhpcy5wcm9wcy5jbGFzc05hbWUgfHwgJ2ZpbGUtZHJvcHpvbmUnO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc0RyYWdBY3RpdmUpIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnIGFjdGl2ZSc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5wcm9wcy5zaXplIHx8IDEwMCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5zaXplIHx8IDEwMFxuICAgICAgICB9O1xuICAgICAgICAvL2JvcmRlclN0eWxlOiB0aGlzLnN0YXRlLmlzRHJhZ0FjdGl2ZSA/IFwic29saWRcIiA6IFwiZGFzaGVkXCJcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc3R5bGUpIHtcbiAgICAgICAgICAgIHN0eWxlID0gX2V4dGVuZHMoe30sIHN0eWxlLCB0aGlzLnByb3BzLnN0eWxlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc0RyYWdBY3RpdmUgJiYgdGhpcy5wcm9wcy5kcmFnQWN0aXZlU3R5bGUpIHtcbiAgICAgICAgICAgIHN0eWxlID0gX2V4dGVuZHMoe30sIHN0eWxlLCB0aGlzLnByb3BzLmRyYWdBY3RpdmVTdHlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvbGRlcklucHV0ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lbmFibGVGb2xkZXJzKSB7XG4gICAgICAgICAgICBmb2xkZXJJbnB1dCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9LCBuYW1lOiBcInVzZXJmb2xkZXJcIiwgdHlwZTogXCJmaWxlXCIsIHJlZjogXCJmb2xkZXJJbnB1dFwiLCBvbkNoYW5nZTogdGhpcy5vbkZvbGRlclBpY2tlZCB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCBzdHlsZTogc3R5bGUsIG9uQ2xpY2s6IHRoaXMub25DbGljaywgb25EcmFnTGVhdmU6IHRoaXMub25EcmFnTGVhdmUsIG9uRHJhZ092ZXI6IHRoaXMub25EcmFnT3Zlciwgb25Ecm9wOiB0aGlzLm9uRHJvcCB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ25vbmUnIH0sIG5hbWU6IFwidXNlcmZpbGVcIiwgdHlwZTogXCJmaWxlXCIsIG11bHRpcGxlOiB0aGlzLnByb3BzLm11bHRpcGxlLCByZWY6IFwiZmlsZUlucHV0XCIsIHZhbHVlOiBcIlwiLCBvbkNoYW5nZTogdGhpcy5vbkZpbGVQaWNrZWQsIGFjY2VwdDogdGhpcy5wcm9wcy5hY2NlcHQgfSksXG4gICAgICAgICAgICBmb2xkZXJJbnB1dCxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9Gb3JtTWl4aW4nKTtcblxudmFyIF9taXhpbnNGb3JtTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRm9ybU1peGluKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZShcIm1hdGVyaWFsLXVpXCIpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5TdHlsZXMgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5TdHlsZXM7XG5cbi8qKlxuICogQm9vbGVhbiBpbnB1dFxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnSW5wdXRCb29sZWFuJyxcblxuICAgIG1peGluczogW19taXhpbnNGb3JtTWl4aW4yWydkZWZhdWx0J11dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBza2lwQnVmZmVyQ2hhbmdlczogdHJ1ZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoZWNrOiBmdW5jdGlvbiBvbkNoZWNrKGV2ZW50LCBuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCB0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkaXJ0eTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0Qm9vbGVhblN0YXRlOiBmdW5jdGlvbiBnZXRCb29sZWFuU3RhdGUoKSB7XG4gICAgICAgIHZhciBib29sVmFsID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgaWYgKHR5cGVvZiBib29sVmFsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgYm9vbFZhbCA9IGJvb2xWYWwgPT09IFwidHJ1ZVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib29sVmFsO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGJvb2xWYWwgPSB0aGlzLmdldEJvb2xlYW5TdGF0ZSgpO1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgdG9nZ2xlZDogYm9vbFZhbCxcbiAgICAgICAgICAgICAgICBvblRvZ2dsZTogdGhpcy5vbkNoZWNrLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLmlzRGlzcGxheUZvcm0oKSA/IHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbCA6IG51bGwsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjogdGhpcy5pc0Rpc3BsYXlGb3JtKCkgPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgICAgICAgICB9LCBNb2Rlcm5TdHlsZXMudG9nZ2xlRmllbGQpKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zQWN0aW9uUnVubmVyTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvQWN0aW9uUnVubmVyTWl4aW4nKTtcblxudmFyIF9taXhpbnNBY3Rpb25SdW5uZXJNaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNBY3Rpb25SdW5uZXJNaXhpbik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBSYWlzZWRCdXR0b24gPSBfcmVxdWlyZS5SYWlzZWRCdXR0b247XG5cbi8qKlxuICogU2ltcGxlIFJhaXNlZEJ1dHRvbiBleGVjdXRpbmcgdGhlIGFwcGx5QnV0dG9uQWN0aW9uXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0lucHV0QnV0dG9uJyxcblxuICAgIG1peGluczogW19taXhpbnNBY3Rpb25SdW5uZXJNaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBhcHBseUJ1dHRvbjogZnVuY3Rpb24gYXBwbHlCdXR0b24oKSB7XG5cbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdGhpcy5wcm9wcy5hY3Rpb25DYWxsYmFjaztcbiAgICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAodHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSB0cmFuc3BvcnQucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0LnN0YXJ0c1dpdGgoJ1NVQ0NFU1M6JykpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLnB5ZGlvLmRpc3BsYXlNZXNzYWdlKCdTVUNDRVNTJywgdHJhbnNwb3J0LnJlc3BvbnNlVGV4dC5yZXBsYWNlKCdTVUNDRVNTOicsICcnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLnB5ZGlvLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIHRyYW5zcG9ydC5yZXNwb25zZVRleHQucmVwbGFjZSgnRVJST1I6JywgJycpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXBwbHlBY3Rpb24oY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmFpc2VkQnV0dG9uLCB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydsYWJlbCddLFxuICAgICAgICAgICAgb25Ub3VjaFRhcDogdGhpcy5hcHBseUJ1dHRvbixcbiAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9Gb3JtTWl4aW4nKTtcblxudmFyIF9taXhpbnNGb3JtTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRm9ybU1peGluKTtcblxudmFyIF9GaWxlRHJvcHpvbmUgPSByZXF1aXJlKCcuL0ZpbGVEcm9wem9uZScpO1xuXG52YXIgX0ZpbGVEcm9wem9uZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9GaWxlRHJvcHpvbmUpO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxudmFyIF9weWRpb1V0aWxMYW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbExhbmcpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBOYXRpdmVGaWxlRHJvcFByb3ZpZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuTmF0aXZlRmlsZURyb3BQcm92aWRlcjtcblxuLy8gSnVzdCBlbmFibGUgdGhlIGRyb3AgbWVjaGFuaXNtLCBidXQgZG8gbm90aGluZywgaXQgaXMgbWFuYWdlZCBieSB0aGUgRmlsZURyb3B6b25lXG52YXIgQmluYXJ5RHJvcFpvbmUgPSBOYXRpdmVGaWxlRHJvcFByb3ZpZGVyKF9GaWxlRHJvcHpvbmUyWydkZWZhdWx0J10sIGZ1bmN0aW9uIChpdGVtcywgZmlsZXMsIHByb3BzKSB7fSk7XG5cbi8qKlxuICogVUkgZm9yIGRpc3BsYXlpbmcgYW5kIHVwbG9hZGluZyBhbiBpbWFnZSxcbiAqIHVzaW5nIHRoZSBiaW5hcnlDb250ZXh0IHN0cmluZy5cbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0lucHV0SW1hZ2UnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgYXR0cmlidXRlczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGJpbmFyeV9jb250ZXh0OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZ1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIHZhciBpbWdTcmMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICgobmV3UHJvcHMudmFsdWUgfHwgbmV3UHJvcHMuYmluYXJ5X2NvbnRleHQgJiYgbmV3UHJvcHMuYmluYXJ5X2NvbnRleHQgIT09IHRoaXMucHJvcHMuYmluYXJ5X2NvbnRleHQpICYmICF0aGlzLnN0YXRlLnJlc2V0KSB7XG4gICAgICAgICAgICBpbWdTcmMgPSB0aGlzLmdldEJpbmFyeVVybChuZXdQcm9wcywgdGhpcy5zdGF0ZS50ZW1wb3JhcnlCaW5hcnkgJiYgdGhpcy5zdGF0ZS50ZW1wb3JhcnlCaW5hcnkgPT09IG5ld1Byb3BzLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChuZXdQcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXSkge1xuICAgICAgICAgICAgaW1nU3JjID0gbmV3UHJvcHMuYXR0cmlidXRlc1snZGVmYXVsdEltYWdlJ107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGltZ1NyYykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGltYWdlU3JjOiBpbWdTcmMsIHJlc2V0OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgdmFyIGltZ1NyYyA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9yaWdpbmFsQmluYXJ5ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgaW1nU3JjID0gdGhpcy5nZXRCaW5hcnlVcmwodGhpcy5wcm9wcyk7XG4gICAgICAgICAgICBvcmlnaW5hbEJpbmFyeSA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXSkge1xuICAgICAgICAgICAgaW1nU3JjID0gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBpbWFnZVNyYzogaW1nU3JjLCBvcmlnaW5hbEJpbmFyeTogb3JpZ2luYWxCaW5hcnkgfTtcbiAgICB9LFxuXG4gICAgZ2V0QmluYXJ5VXJsOiBmdW5jdGlvbiBnZXRCaW5hcnlVcmwocHJvcHMpIHtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRDbGllbnQoKS5nZXRQeWRpb09iamVjdCgpO1xuICAgICAgICB2YXIgdXJsID0gcHlkaW8uUGFyYW1ldGVycy5nZXQoJ0VORFBPSU5UX1JFU1RfQVBJJykgKyBwcm9wcy5hdHRyaWJ1dGVzWydsb2FkQWN0aW9uJ107XG4gICAgICAgIHZhciBiSWQgPSBwcm9wcy52YWx1ZTtcbiAgICAgICAgaWYgKHByb3BzLmJpbmFyeV9jb250ZXh0ICYmIHByb3BzLmJpbmFyeV9jb250ZXh0LmluZGV4T2YoJ3VzZXJfaWQ9JykgPT09IDApIHtcbiAgICAgICAgICAgIGJJZCA9IHByb3BzLmJpbmFyeV9jb250ZXh0LnJlcGxhY2UoJ3VzZXJfaWQ9JywgJycpO1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHVybC5yZXBsYWNlKCd7QklOQVJZfScsIGJJZCk7XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfSxcblxuICAgIGdldFVwbG9hZFVybDogZnVuY3Rpb24gZ2V0VXBsb2FkVXJsKCkge1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpLmdldFB5ZGlvT2JqZWN0KCk7XG4gICAgICAgIHZhciB1cmwgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnRU5EUE9JTlRfUkVTVF9BUEknKSArIHRoaXMucHJvcHMuYXR0cmlidXRlc1sndXBsb2FkQWN0aW9uJ107XG4gICAgICAgIHZhciBiSWQgPSAnJztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYmluYXJ5X2NvbnRleHQgJiYgdGhpcy5wcm9wcy5iaW5hcnlfY29udGV4dC5pbmRleE9mKCd1c2VyX2lkPScpID09PSAwKSB7XG4gICAgICAgICAgICBiSWQgPSB0aGlzLnByb3BzLmJpbmFyeV9jb250ZXh0LnJlcGxhY2UoJ3VzZXJfaWQ9JywgJycpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIGJJZCA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiSWQgPSBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS5jb21wdXRlU3RyaW5nU2x1Zyh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbXCJuYW1lXCJdICsgXCIucG5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHVybC5yZXBsYWNlKCd7QklOQVJZfScsIGJJZCk7XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfSxcblxuICAgIHVwbG9hZENvbXBsZXRlOiBmdW5jdGlvbiB1cGxvYWRDb21wbGV0ZShuZXdCaW5hcnlOYW1lKSB7XG4gICAgICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRlbXBvcmFyeUJpbmFyeTogbmV3QmluYXJ5TmFtZSxcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIGFkZGl0aW9uYWxGb3JtRGF0YSA9IHsgdHlwZTogJ2JpbmFyeScgfTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm9yaWdpbmFsQmluYXJ5KSB7XG4gICAgICAgICAgICAgICAgYWRkaXRpb25hbEZvcm1EYXRhWydvcmlnaW5hbF9iaW5hcnknXSA9IHRoaXMuc3RhdGUub3JpZ2luYWxCaW5hcnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld0JpbmFyeU5hbWUsIHByZXZWYWx1ZSwgYWRkaXRpb25hbEZvcm1EYXRhKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBodG1sVXBsb2FkOiBmdW5jdGlvbiBodG1sVXBsb2FkKCkge1xuICAgICAgICB3aW5kb3cuZm9ybU1hbmFnZXJIaWRkZW5JRnJhbWVTdWJtaXNzaW9uID0gKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIHRoaXMudXBsb2FkQ29tcGxldGUocmVzdWx0LnRyaW0oKSk7XG4gICAgICAgICAgICB3aW5kb3cuZm9ybU1hbmFnZXJIaWRkZW5JRnJhbWVTdWJtaXNzaW9uID0gbnVsbDtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWZzLnVwbG9hZEZvcm0uc3VibWl0KCk7XG4gICAgfSxcblxuICAgIG9uRHJvcDogZnVuY3Rpb24gb25Ecm9wKGZpbGVzLCBldmVudCwgZHJvcHpvbmUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldE1lc3NhZ2VzKCk7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5wcm9wcy5uYW1lO1xuXG4gICAgICAgIGlmIChuYW1lID09PSAnYXZhdGFyJyAmJiBmaWxlc1swXS5zaXplID4gNSAqIDEwMjQgKiAxMDI0KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG1lc3NhZ2VzWydmb3JtLmlucHV0LWltYWdlLmF2YXRhck1heCddIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChbJ2ltYWdlL2pwZWcnLCAnaW1hZ2UvcG5nJywgJ2ltYWdlL2JtcCcsICdpbWFnZS90aWZmJywgJ2ltYWdlL3dlYnAnXS5pbmRleE9mKGZpbGVzWzBdLnR5cGUpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBtZXNzYWdlc1snZm9ybS5pbnB1dC1pbWFnZS5maWxlVHlwZXMnXSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSk7XG4gICAgICAgIGlmIChfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLnN1cHBvcnRzVXBsb2FkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuICAgICAgICAgICAgX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkuZ2V0T3JVcGRhdGVKd3QoKS50aGVuKGZ1bmN0aW9uIChqd3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgeGhyU2V0dGluZ3MgPSB7IGN1c3RvbUhlYWRlcnM6IHsgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgand0IH0gfTtcbiAgICAgICAgICAgICAgICBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpLnVwbG9hZEZpbGUoZmlsZXNbMF0sIFwidXNlcmZpbGVcIiwgJycsIGZ1bmN0aW9uICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IEpTT04ucGFyc2UodHJhbnNwb3J0LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LmJpbmFyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudXBsb2FkQ29tcGxldGUocmVzdWx0LmJpbmFyeSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSwgZXJyb3I6IGVycm9yIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChjb21wdXRhYmxlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJvZ3Jlc3MsIG5vdCByZWFsbHkgdXNlZnVsIGZvciBzbWFsbCB1cGxvYWRzXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvbXB1dGFibGVFdmVudCk7XG4gICAgICAgICAgICAgICAgfSwgX3RoaXMuZ2V0VXBsb2FkVXJsKCksIHhoclNldHRpbmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5odG1sVXBsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xlYXJJbWFnZTogZnVuY3Rpb24gY2xlYXJJbWFnZSgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKGdsb2JhbC5jb25maXJtKF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRNZXNzYWdlcygpWydmb3JtLmlucHV0LWltYWdlLmNsZWFyQ29uZmlybSddKSkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJldlZhbHVlID0gX3RoaXMyLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IHRydWVcbiAgICAgICAgICAgICAgICB9LCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKCcnLCBwcmV2VmFsdWUsIHsgdHlwZTogJ2JpbmFyeScgfSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZChfdGhpczIpKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgbG9hZGluZyA9IF9zdGF0ZS5sb2FkaW5nO1xuICAgICAgICB2YXIgZXJyb3IgPSBfc3RhdGUuZXJyb3I7XG5cbiAgICAgICAgdmFyIGNvdmVySW1hZ2VTdHlsZSA9IHtcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogXCJ1cmwoXCIgKyB0aGlzLnN0YXRlLmltYWdlU3JjICsgXCIpXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb246IFwiNTAlIDUwJVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6IFwiY292ZXJcIixcbiAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gICAgICAgIH07XG4gICAgICAgIHZhciBvdmVybGF5ID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgb3ZlcmxheUJnID0ge307XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgb3ZlcmxheUJnID0geyBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzcpJywgYm9yZGVyUmFkaXVzOiAnNTAlJyB9O1xuICAgICAgICAgICAgb3ZlcmxheSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY29sb3I6ICcjRjQ0MzM2JywgdGV4dEFsaWduOiAnY2VudGVyJywgZm9udFNpemU6IDExLCBjdXJzb3I6ICdwb2ludGVyJyB9LCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1hbGVydFwiLCBzdHlsZTogeyBmb250U2l6ZTogNDAgfSB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnYnInLCBudWxsKSxcbiAgICAgICAgICAgICAgICBlcnJvclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChsb2FkaW5nKSB7XG4gICAgICAgICAgICBvdmVybGF5ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2lyY3VsYXJQcm9ncmVzcywgeyBtb2RlOiBcImluZGV0ZXJtaW5hdGVcIiB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBpc0RlZmF1bHQgPSB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2RlZmF1bHRJbWFnZSddICYmIHRoaXMucHJvcHMuYXR0cmlidXRlc1snZGVmYXVsdEltYWdlJ10gPT09IHRoaXMuc3RhdGUuaW1hZ2VTcmM7XG4gICAgICAgICAgICBvdmVybGF5ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLWNhbWVyYVwiLCBzdHlsZTogeyBmb250U2l6ZTogNDAsIG9wYWNpdHk6IC41LCBjb2xvcjogaXNEZWZhdWx0ID8gbnVsbCA6ICd3aGl0ZScgfSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW1hZ2UtbGFiZWwnIH0sXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2Zvcm0nLFxuICAgICAgICAgICAgICAgIHsgcmVmOiAndXBsb2FkRm9ybScsIGVuY1R5cGU6ICdtdWx0aXBhcnQvZm9ybS1kYXRhJywgdGFyZ2V0OiAndXBsb2FkZXJfaGlkZGVuX2lmcmFtZScsIG1ldGhvZDogJ3Bvc3QnLCBhY3Rpb246IHRoaXMuZ2V0VXBsb2FkVXJsKCkgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgQmluYXJ5RHJvcFpvbmUsXG4gICAgICAgICAgICAgICAgICAgIHsgb25Ecm9wOiB0aGlzLm9uRHJvcCwgYWNjZXB0OiAnaW1hZ2UvKicsIHN0eWxlOiBjb3ZlckltYWdlU3R5bGUgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJScsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9LCBvdmVybGF5QmcpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVybGF5XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdiaW5hcnktcmVtb3ZlLWJ1dHRvbicsIG9uQ2xpY2s6IHRoaXMuY2xlYXJJbWFnZSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBrZXk6ICdyZW1vdmUnLCBjbGFzc05hbWU6ICdtZGkgbWRpLWNsb3NlJyB9KSxcbiAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgX3B5ZGlvMlsnZGVmYXVsdCddLmdldE1lc3NhZ2VzKClbJ2Zvcm0uaW5wdXQtaW1hZ2UuY2xlYXJCdXR0b24nXVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdpZnJhbWUnLCB7IHN0eWxlOiB7IGRpc3BsYXk6IFwibm9uZVwiIH0sIGlkOiAndXBsb2FkZXJfaGlkZGVuX2lmcmFtZScsIG5hbWU6ICd1cGxvYWRlcl9oaWRkZW5faWZyYW1lJyB9KVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9taXhpbnNGb3JtTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvRm9ybU1peGluJyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0Zvcm1NaXhpbik7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuVGV4dEZpZWxkO1xuXG4vKipcbiAqIFRleHQgaW5wdXQgdGhhdCBpcyBjb252ZXJ0ZWQgdG8gaW50ZWdlciwgYW5kXG4gKiB0aGUgVUkgY2FuIHJlYWN0IHRvIGFycm93cyBmb3IgaW5jcmVtZW50aW5nL2RlY3JlbWVudGluZyB2YWx1ZXNcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0lucHV0SW50ZWdlcicsXG5cbiAgICBtaXhpbnM6IFtfbWl4aW5zRm9ybU1peGluMlsnZGVmYXVsdCddXSxcblxuICAgIGtleURvd246IGZ1bmN0aW9uIGtleURvd24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGluYyA9IDAsXG4gICAgICAgICAgICBtdWx0aXBsZSA9IDE7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT0gJ0VudGVyJykge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVFZGl0TW9kZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PSAnQXJyb3dVcCcpIHtcbiAgICAgICAgICAgIGluYyA9ICsxO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PSAnQXJyb3dEb3duJykge1xuICAgICAgICAgICAgaW5jID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBtdWx0aXBsZSA9IDEwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJzZWQgPSBwYXJzZUludCh0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICAgICAgaWYgKGlzTmFOKHBhcnNlZCkpIHBhcnNlZCA9IDA7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnNlZCArIGluYyAqIG11bHRpcGxlO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKG51bGwsIHZhbHVlKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRGlzcGxheUdyaWQoKSAmJiAhdGhpcy5zdGF0ZS5lZGl0TW9kZSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IHRoaXMucHJvcHMuZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRoaXMudG9nZ2xlRWRpdE1vZGUsIGNsYXNzTmFtZTogdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgICF2YWx1ZSA/ICdFbXB0eScgOiB2YWx1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBpbnR2YWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGludHZhbCA9IHBhcnNlSW50KHRoaXMuc3RhdGUudmFsdWUpICsgJyc7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGludHZhbCkpIGludHZhbCA9IHRoaXMuc3RhdGUudmFsdWUgKyAnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW50dmFsID0gJzAnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2ludGVnZXItaW5wdXQnIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTW9kZXJuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpbnR2YWwsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMua2V5RG93bixcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGludFRleHQ6IHRoaXMuaXNEaXNwbGF5Rm9ybSgpID8gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsIDogbnVsbFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNGb3JtTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvRm9ybU1peGluJyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21peGluc0Zvcm1NaXhpbik7XG5cbnZhciBfbWl4aW5zRmllbGRXaXRoQ2hvaWNlcyA9IHJlcXVpcmUoJy4uL21peGlucy9GaWVsZFdpdGhDaG9pY2VzJyk7XG5cbnZhciBfbWl4aW5zRmllbGRXaXRoQ2hvaWNlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGaWVsZFdpdGhDaG9pY2VzKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgU2VsZWN0RmllbGQgPSBfcmVxdWlyZS5TZWxlY3RGaWVsZDtcbnZhciBNZW51SXRlbSA9IF9yZXF1aXJlLk1lbnVJdGVtO1xudmFyIENoaXAgPSBfcmVxdWlyZS5DaGlwO1xuXG52YXIgTGFuZ1V0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblNlbGVjdEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuU2VsZWN0RmllbGQ7XG5cbi8qKlxuICogU2VsZWN0IGJveCBpbnB1dCBjb25mb3JtaW5nIHRvIFB5ZGlvIHN0YW5kYXJkIGZvcm0gcGFyYW1ldGVyLlxuICovXG52YXIgSW5wdXRTZWxlY3RCb3ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdJbnB1dFNlbGVjdEJveCcsXG5cbiAgICBtaXhpbnM6IFtfbWl4aW5zRm9ybU1peGluMlsnZGVmYXVsdCddXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2tpcEJ1ZmZlckNoYW5nZXM6IHRydWVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25Ecm9wRG93bkNoYW5nZTogZnVuY3Rpb24gb25Ecm9wRG93bkNoYW5nZShldmVudCwgaW5kZXgsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoZXZlbnQsIHZhbHVlKTtcbiAgICAgICAgdGhpcy50b2dnbGVFZGl0TW9kZSgpO1xuICAgIH0sXG5cbiAgICBvbk11bHRpcGxlU2VsZWN0OiBmdW5jdGlvbiBvbk11bHRpcGxlU2VsZWN0KGV2ZW50LCBpbmRleCwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKG5ld1ZhbHVlID09IC0xKSByZXR1cm47XG4gICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICB2YXIgY3VycmVudFZhbHVlcyA9IHR5cGVvZiBjdXJyZW50VmFsdWUgPT09ICdzdHJpbmcnID8gY3VycmVudFZhbHVlLnNwbGl0KCcsJykgOiBjdXJyZW50VmFsdWU7XG4gICAgICAgIGlmICghY3VycmVudFZhbHVlcy5pbmRleE9mKG5ld1ZhbHVlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZXMucHVzaChuZXdWYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKGV2ZW50LCBjdXJyZW50VmFsdWVzLmpvaW4oJywnKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50b2dnbGVFZGl0TW9kZSgpO1xuICAgIH0sXG5cbiAgICBvbk11bHRpcGxlUmVtb3ZlOiBmdW5jdGlvbiBvbk11bHRpcGxlUmVtb3ZlKHZhbHVlKSB7XG4gICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICB2YXIgY3VycmVudFZhbHVlcyA9IHR5cGVvZiBjdXJyZW50VmFsdWUgPT09ICdzdHJpbmcnID8gY3VycmVudFZhbHVlLnNwbGl0KCcsJykgOiBjdXJyZW50VmFsdWU7XG4gICAgICAgIGlmIChjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpICE9PSAtMSkge1xuICAgICAgICAgICAgY3VycmVudFZhbHVlcyA9IExhbmdVdGlscy5hcnJheVdpdGhvdXQoY3VycmVudFZhbHVlcywgY3VycmVudFZhbHVlcy5pbmRleE9mKHZhbHVlKSk7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKG51bGwsIGN1cnJlbnRWYWx1ZXMuam9pbignLCcpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgdmFyIG1lbnVJdGVtcyA9IFtdLFxuICAgICAgICAgICAgbXVsdGlwbGVPcHRpb25zID0gW10sXG4gICAgICAgICAgICBtYW5kYXRvcnkgPSB0cnVlO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuYXR0cmlidXRlc1snbWFuZGF0b3J5J10gfHwgdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydtYW5kYXRvcnknXSAhPSBcInRydWVcIikge1xuICAgICAgICAgICAgbWFuZGF0b3J5ID0gZmFsc2U7XG4gICAgICAgICAgICBtZW51SXRlbXMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVJdGVtLCB7IHZhbHVlOiAtMSwgcHJpbWFyeVRleHQ6IHRoaXMucHJvcHMuYXR0cmlidXRlc1snbGFiZWwnXSArICcuLi4nIH0pKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcztcblxuICAgICAgICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgdmFsdWU6IGtleSwgcHJpbWFyeVRleHQ6IHZhbHVlIH0pKTtcbiAgICAgICAgICAgIG11bHRpcGxlT3B0aW9ucy5wdXNoKHsgdmFsdWU6IGtleSwgbGFiZWw6IHZhbHVlIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwbGF5R3JpZCgpICYmICF0aGlzLnN0YXRlLmVkaXRNb2RlIHx8IHRoaXMucHJvcHMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgICAgICBpZiAoY2hvaWNlcy5nZXQodmFsdWUpKSB2YWx1ZSA9IGNob2ljZXMuZ2V0KHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5wcm9wcy5kaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdGhpcy50b2dnbGVFZGl0TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiB2YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgIXZhbHVlID8gJ0VtcHR5JyA6IHZhbHVlLFxuICAgICAgICAgICAgICAgICcgwqDCoCcsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnaWNvbi1jYXJldC1kb3duJyB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBoYXNWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubXVsdGlwbGUgJiYgdGhpcy5wcm9wcy5tdWx0aXBsZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZXMgPSBjdXJyZW50VmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50VmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlcyA9IGN1cnJlbnRWYWx1ZS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1ZhbHVlID0gY3VycmVudFZhbHVlcy5sZW5ndGggPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwibXVsdGlwbGUgaGFzLXZhbHVlXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlcy5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2hpcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBvblJlcXVlc3REZWxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbk11bHRpcGxlUmVtb3ZlKHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2Rlcm5TZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogLTEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25NdWx0aXBsZVNlbGVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vZGVyblNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiB0aGlzLnByb3BzLmF0dHJpYnV0ZXMubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkRyb3BEb3duQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVudUl0ZW1zXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IElucHV0U2VsZWN0Qm94ID0gX21peGluc0ZpZWxkV2l0aENob2ljZXMyWydkZWZhdWx0J10oSW5wdXRTZWxlY3RCb3gpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gSW5wdXRTZWxlY3RCb3g7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWl4aW5zQWN0aW9uUnVubmVyTWl4aW4gPSByZXF1aXJlKCcuLi9taXhpbnMvQWN0aW9uUnVubmVyTWl4aW4nKTtcblxudmFyIF9taXhpbnNBY3Rpb25SdW5uZXJNaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNBY3Rpb25SdW5uZXJNaXhpbik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ01vbml0b3JpbmdMYWJlbCcsXG5cbiAgICBtaXhpbnM6IFtfbWl4aW5zQWN0aW9uUnVubmVyTWl4aW4yWydkZWZhdWx0J11dLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHZhciBsb2FkaW5nTWVzc2FnZSA9ICdMb2FkaW5nJztcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dCAmJiB0aGlzLmNvbnRleHQuZ2V0TWVzc2FnZSkge1xuICAgICAgICAgICAgbG9hZGluZ01lc3NhZ2UgPSB0aGlzLmNvbnRleHQuZ2V0TWVzc2FnZSg0NjYsICcnKTtcbiAgICAgICAgfSBlbHNlIGlmIChnbG9iYWwucHlkaW8gJiYgZ2xvYmFsLnB5ZGlvLk1lc3NhZ2VIYXNoKSB7XG4gICAgICAgICAgICBsb2FkaW5nTWVzc2FnZSA9IGdsb2JhbC5weWRpby5NZXNzYWdlSGFzaFs0NjZdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogbG9hZGluZ01lc3NhZ2UgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSAoZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHN0YXR1czogdHJhbnNwb3J0LnJlc3BvbnNlVGV4dCB9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fcG9sbGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlBY3Rpb24oY2FsbGJhY2spO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9wb2xsZXIoKTtcbiAgICAgICAgdGhpcy5fcGUgPSBnbG9iYWwuc2V0SW50ZXJ2YWwodGhpcy5fcG9sbGVyLCAxMDAwMCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3BlKSB7XG4gICAgICAgICAgICBnbG9iYWwuY2xlYXJJbnRlcnZhbCh0aGlzLl9wZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zdGF0dXNcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblRleHRGaWVsZCA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblRleHRGaWVsZDtcblxuLyoqXG4gKiBUZXh0IGlucHV0LCBjYW4gYmUgc2luZ2xlIGxpbmUsIG11bHRpTGluZSwgb3IgcGFzc3dvcmQsIGRlcGVuZGluZyBvbiB0aGVcbiAqIGF0dHJpYnV0ZXMudHlwZSBrZXkuXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdUZXh0RmllbGQnLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwbGF5R3JpZCgpICYmICF0aGlzLnN0YXRlLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnICYmIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSAnKioqKioqKioqKionO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBvbkNsaWNrOiB0aGlzLnByb3BzLmRpc2FibGVkID8gZnVuY3Rpb24gKCkge30gOiB0aGlzLnRvZ2dsZUVkaXRNb2RlLCBjbGFzc05hbWU6IHZhbHVlID8gJycgOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICAhdmFsdWUgPyAnRW1wdHknIDogdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICBoaW50VGV4dDogdGhpcy5pc0Rpc3BsYXlGb3JtKCkgPyB0aGlzLnByb3BzLmF0dHJpYnV0ZXMubGFiZWwgOiBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLmVudGVyVG9Ub2dnbGUsXG4gICAgICAgICAgICAgICAgdHlwZTogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcgPyAncGFzc3dvcmQnIDogbnVsbCxcbiAgICAgICAgICAgICAgICBtdWx0aUxpbmU6IHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAndGV4dGFyZWEnLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogdGhpcy5wcm9wcy5lcnJvclRleHQsXG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiAnb2ZmJyxcbiAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZm9ybScsXG4gICAgICAgICAgICAgICAgICAgIHsgYXV0b0NvbXBsZXRlOiAnb2ZmJywgb25TdWJtaXQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBzdHlsZTogeyBkaXNwbGF5OiAnaW5saW5lJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbiA9IHJlcXVpcmUoJy4uL21peGlucy9Gb3JtTWl4aW4nKTtcblxudmFyIF9taXhpbnNGb3JtTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zRm9ybU1peGluKTtcblxudmFyIF9weWRpb1V0aWxQYXNzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXNzJyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXNzKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuVGV4dEZpZWxkO1xuXG4vKipcbiAqIFRleHQgaW5wdXQsIGNhbiBiZSBzaW5nbGUgbGluZSwgbXVsdGlMaW5lLCBvciBwYXNzd29yZCwgZGVwZW5kaW5nIG9uIHRoZVxuICogYXR0cmlidXRlcy50eXBlIGtleS5cbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1ZhbGlkTG9naW4nLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbJ2RlZmF1bHQnXV0sXG5cbiAgICB0ZXh0VmFsdWVDaGFuZ2VkOiBmdW5jdGlvbiB0ZXh0VmFsdWVDaGFuZ2VkKGV2ZW50LCB2YWx1ZSkge1xuICAgICAgICB2YXIgZXJyID0gX3B5ZGlvVXRpbFBhc3MyWydkZWZhdWx0J10uaXNWYWxpZExvZ2luKHZhbHVlKTtcbiAgICAgICAgdmFyIHByZXZTdGF0ZVZhbGlkID0gdGhpcy5zdGF0ZS52YWxpZDtcbiAgICAgICAgdmFyIHZhbGlkID0gIWVycjtcbiAgICAgICAgaWYgKHByZXZTdGF0ZVZhbGlkICE9PSB2YWxpZCAmJiB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSh2YWxpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbGlkOiB2YWxpZCwgZXJyOiBlcnIgfSk7XG5cbiAgICAgICAgdGhpcy5vbkNoYW5nZShldmVudCwgdmFsdWUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBpZiAodGhpcy5pc0Rpc3BsYXlHcmlkKCkgJiYgIXRoaXMuc3RhdGUuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICcqKioqKioqKioqKic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IHRoaXMucHJvcHMuZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRoaXMudG9nZ2xlRWRpdE1vZGUsIGNsYXNzTmFtZTogdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgICF2YWx1ZSA/ICdFbXB0eScgOiB2YWx1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSB0aGlzLnN0YXRlLmVycjtcblxuICAgICAgICAgICAgdmFyIGZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTW9kZXJuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuaXNEaXNwbGF5Rm9ybSgpID8gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsIDogbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudGV4dFZhbHVlQ2hhbmdlZChlLCB2KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5lbnRlclRvVG9nZ2xlLFxuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnID8gJ3Bhc3N3b3JkJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgbXVsdGlMaW5lOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3RleHRhcmVhJyxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMucHJvcHMuZXJyb3JUZXh0IHx8IGVycixcbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU6ICdvZmYnLFxuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAgICAgICAgICAgeyBhdXRvQ29tcGxldGU6ICdvZmYnLCBvblN1Ym1pdDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO2UucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHN0eWxlOiB7IGRpc3BsYXk6ICdpbmxpbmUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MgPSByZXF1aXJlKFwicHlkaW8vdXRpbC9wYXNzXCIpO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGFzcyk7XG5cbnZhciBfbWl4aW5zRm9ybU1peGluID0gcmVxdWlyZSgnLi4vbWl4aW5zL0Zvcm1NaXhpbicpO1xuXG52YXIgX21peGluc0Zvcm1NaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taXhpbnNGb3JtTWl4aW4pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yW1wiZGVmYXVsdFwiXS5yZXF1aXJlTGliKFwiaG9jXCIpO1xuXG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuVGV4dEZpZWxkO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6IFwiVmFsaWRQYXNzd29yZFwiLFxuXG4gICAgbWl4aW5zOiBbX21peGluc0Zvcm1NaXhpbjJbXCJkZWZhdWx0XCJdXSxcblxuICAgIGlzVmFsaWQ6IGZ1bmN0aW9uIGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnZhbGlkO1xuICAgIH0sXG5cbiAgICBjaGVja01pbkxlbmd0aDogZnVuY3Rpb24gY2hlY2tNaW5MZW5ndGgodmFsdWUpIHtcbiAgICAgICAgdmFyIG1pbkxlbmd0aCA9IHBhcnNlSW50KGdsb2JhbC5weWRpby5nZXRQbHVnaW5Db25maWdzKFwiY29yZS5hdXRoXCIpLmdldChcIlBBU1NXT1JEX01JTkxFTkdUSFwiKSk7XG4gICAgICAgIHJldHVybiAhKHZhbHVlICYmIHZhbHVlLmxlbmd0aCA8IG1pbkxlbmd0aCk7XG4gICAgfSxcblxuICAgIGdldE1lc3NhZ2U6IGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZUlkKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQgJiYgdGhpcy5jb250ZXh0LmdldE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuZ2V0TWVzc2FnZShtZXNzYWdlSWQsICcnKTtcbiAgICAgICAgfSBlbHNlIGlmIChnbG9iYWwucHlkaW8gJiYgZ2xvYmFsLnB5ZGlvLk1lc3NhZ2VIYXNoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsLnB5ZGlvLk1lc3NhZ2VIYXNoW21lc3NhZ2VJZF07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlUGFzc1N0YXRlOiBmdW5jdGlvbiB1cGRhdGVQYXNzU3RhdGUoKSB7XG4gICAgICAgIHZhciBwcmV2U3RhdGVWYWxpZCA9IHRoaXMuc3RhdGUudmFsaWQ7XG4gICAgICAgIHZhciBuZXdTdGF0ZSA9IF9weWRpb1V0aWxQYXNzMltcImRlZmF1bHRcIl0uZ2V0U3RhdGUodGhpcy5yZWZzLnBhc3MuZ2V0VmFsdWUoKSwgdGhpcy5yZWZzLmNvbmZpcm0gPyB0aGlzLnJlZnMuY29uZmlybS5nZXRWYWx1ZSgpIDogJycpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgICAgaWYgKHByZXZTdGF0ZVZhbGlkICE9PSBuZXdTdGF0ZS52YWxpZCAmJiB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZShuZXdTdGF0ZS52YWxpZCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25QYXNzd29yZENoYW5nZTogZnVuY3Rpb24gb25QYXNzd29yZENoYW5nZShldmVudCkge1xuICAgICAgICB0aGlzLnVwZGF0ZVBhc3NTdGF0ZSgpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKGV2ZW50LCBldmVudC50YXJnZXQudmFsdWUpO1xuICAgIH0sXG5cbiAgICBvbkNvbmZpcm1DaGFuZ2U6IGZ1bmN0aW9uIG9uQ29uZmlybUNoYW5nZShldmVudCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybVZhbHVlOiBldmVudC50YXJnZXQudmFsdWUgfSk7XG4gICAgICAgIHRoaXMudXBkYXRlUGFzc1N0YXRlKCk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoZXZlbnQsIHRoaXMuc3RhdGUudmFsdWUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBkaXNhYmxlZCA9IF9wcm9wcy5kaXNhYmxlZDtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IF9wcm9wcy5jbGFzc05hbWU7XG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0gX3Byb3BzLmF0dHJpYnV0ZXM7XG4gICAgICAgIHZhciBkaWFsb2dGaWVsZCA9IF9wcm9wcy5kaWFsb2dGaWVsZDtcblxuICAgICAgICBpZiAodGhpcy5pc0Rpc3BsYXlHcmlkKCkgJiYgIXRoaXMuc3RhdGUuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgb25DbGljazogZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRoaXMudG9nZ2xlRWRpdE1vZGUsIGNsYXNzTmFtZTogdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgIHZhbHVlID8gdmFsdWUgOiAnRW1wdHknXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG92ZXJmbG93ID0geyBvdmVyZmxvdzogJ2hpZGRlbicsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsIHdpZHRoOiAnMTAwJScgfTtcbiAgICAgICAgICAgIHZhciBjTmFtZSA9IHRoaXMuc3RhdGUudmFsaWQgPyAnJyA6ICdtdWktZXJyb3ItYXMtaGludCc7XG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgY05hbWUgPSBjbGFzc05hbWUgKyAnICcgKyBjTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBfY29uZmlybSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBUZXh0Q29tcG9uZW50ID0gZGlhbG9nRmllbGQgPyBfbWF0ZXJpYWxVaS5UZXh0RmllbGQgOiBNb2Rlcm5UZXh0RmllbGQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS52YWx1ZSAmJiAhZGlzYWJsZWQpIHtcblxuICAgICAgICAgICAgICAgIF9jb25maXJtID0gW19yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeyBrZXk6IFwic2VwXCIsIHN0eWxlOiB7IHdpZHRoOiA4IH0gfSksIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoVGV4dENvbXBvbmVudCwge1xuICAgICAgICAgICAgICAgICAgICBrZXk6IFwiY29uZmlybVwiLFxuICAgICAgICAgICAgICAgICAgICByZWY6IFwiY29uZmlybVwiLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5nZXRNZXNzYWdlKDE5OSksXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxTaHJpbmtTdHlsZTogX2V4dGVuZHMoe30sIG92ZXJmbG93LCB7IHdpZHRoOiAnMTMwJScgfSksXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxTdHlsZTogb3ZlcmZsb3csXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogY05hbWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLmNvbmZpcm1WYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25Db25maXJtQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInBhc3N3b3JkXCIsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpTGluZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogdGhpcy5zdGF0ZS5jb25maXJtRXJyb3JUZXh0LFxuICAgICAgICAgICAgICAgICAgICBlcnJvclN0eWxlOiBkaWFsb2dGaWVsZCA/IHsgYm90dG9tOiAtNSB9IDogbnVsbFxuICAgICAgICAgICAgICAgIH0pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZm9ybVwiLFxuICAgICAgICAgICAgICAgIHsgYXV0b0NvbXBsZXRlOiBcIm9mZlwiLCBvblN1Ym1pdDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFRleHRDb21wb25lbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogXCJwYXNzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5pc0Rpc3BsYXlGb3JtKCkgPyBhdHRyaWJ1dGVzLmxhYmVsIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxTaHJpbmtTdHlsZTogX2V4dGVuZHMoe30sIG92ZXJmbG93LCB7IHdpZHRoOiAnMTMwJScgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsU3R5bGU6IG92ZXJmbG93LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBjTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25QYXNzd29yZENoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5lbnRlclRvVG9nZ2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJwYXNzd29yZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlMaW5lOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogdGhpcy5zdGF0ZS5wYXNzRXJyb3JUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JTdHlsZTogZGlhbG9nRmllbGQgPyB7IGJvdHRvbTogLTUgfSA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIF9jb25maXJtXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9taXhpbnNIZWxwZXJNaXhpbiA9IHJlcXVpcmUoJy4vbWl4aW5zL0hlbHBlck1peGluJyk7XG5cbnZhciBfbWl4aW5zSGVscGVyTWl4aW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWl4aW5zSGVscGVyTWl4aW4pO1xuXG52YXIgX21hbmFnZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyL01hbmFnZXInKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYW5hZ2VyTWFuYWdlcik7XG5cbnZhciBfZmllbGRzVGV4dEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZHMvVGV4dEZpZWxkJyk7XG5cbnZhciBfZmllbGRzVGV4dEZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc1RleHRGaWVsZCk7XG5cbnZhciBfZmllbGRzVmFsaWRQYXNzd29yZCA9IHJlcXVpcmUoJy4vZmllbGRzL1ZhbGlkUGFzc3dvcmQnKTtcblxudmFyIF9maWVsZHNWYWxpZFBhc3N3b3JkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc1ZhbGlkUGFzc3dvcmQpO1xuXG52YXIgX2ZpZWxkc0lucHV0SW50ZWdlciA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0SW50ZWdlcicpO1xuXG52YXIgX2ZpZWxkc0lucHV0SW50ZWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dEludGVnZXIpO1xuXG52YXIgX2ZpZWxkc0lucHV0Qm9vbGVhbiA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0Qm9vbGVhbicpO1xuXG52YXIgX2ZpZWxkc0lucHV0Qm9vbGVhbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dEJvb2xlYW4pO1xuXG52YXIgX2ZpZWxkc0lucHV0QnV0dG9uID0gcmVxdWlyZSgnLi9maWVsZHMvSW5wdXRCdXR0b24nKTtcblxudmFyIF9maWVsZHNJbnB1dEJ1dHRvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dEJ1dHRvbik7XG5cbnZhciBfZmllbGRzTW9uaXRvcmluZ0xhYmVsID0gcmVxdWlyZSgnLi9maWVsZHMvTW9uaXRvcmluZ0xhYmVsJyk7XG5cbnZhciBfZmllbGRzTW9uaXRvcmluZ0xhYmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc01vbml0b3JpbmdMYWJlbCk7XG5cbnZhciBfZmllbGRzSW5wdXRTZWxlY3RCb3ggPSByZXF1aXJlKCcuL2ZpZWxkcy9JbnB1dFNlbGVjdEJveCcpO1xuXG52YXIgX2ZpZWxkc0lucHV0U2VsZWN0Qm94MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0lucHV0U2VsZWN0Qm94KTtcblxudmFyIF9maWVsZHNBdXRvY29tcGxldGVCb3ggPSByZXF1aXJlKCcuL2ZpZWxkcy9BdXRvY29tcGxldGVCb3gnKTtcblxudmFyIF9maWVsZHNBdXRvY29tcGxldGVCb3gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzQXV0b2NvbXBsZXRlQm94KTtcblxudmFyIF9maWVsZHNJbnB1dEltYWdlID0gcmVxdWlyZSgnLi9maWVsZHMvSW5wdXRJbWFnZScpO1xuXG52YXIgX2ZpZWxkc0lucHV0SW1hZ2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRJbWFnZSk7XG5cbnZhciBfcGFuZWxGb3JtUGFuZWwgPSByZXF1aXJlKCcuL3BhbmVsL0Zvcm1QYW5lbCcpO1xuXG52YXIgX3BhbmVsRm9ybVBhbmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhbmVsRm9ybVBhbmVsKTtcblxudmFyIF9wYW5lbEZvcm1IZWxwZXIgPSByZXF1aXJlKCcuL3BhbmVsL0Zvcm1IZWxwZXInKTtcblxudmFyIF9wYW5lbEZvcm1IZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcGFuZWxGb3JtSGVscGVyKTtcblxudmFyIF9maWVsZHNGaWxlRHJvcHpvbmUgPSByZXF1aXJlKCcuL2ZpZWxkcy9GaWxlRHJvcHpvbmUnKTtcblxudmFyIF9maWVsZHNGaWxlRHJvcHpvbmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzRmlsZURyb3B6b25lKTtcblxudmFyIF9maWVsZHNBdXRvY29tcGxldGVUcmVlID0gcmVxdWlyZSgnLi9maWVsZHMvQXV0b2NvbXBsZXRlVHJlZScpO1xuXG52YXIgX2ZpZWxkc0F1dG9jb21wbGV0ZVRyZWUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzQXV0b2NvbXBsZXRlVHJlZSk7XG5cbnZhciBQeWRpb0Zvcm0gPSB7XG4gIEhlbHBlck1peGluOiBfbWl4aW5zSGVscGVyTWl4aW4yWydkZWZhdWx0J10sXG4gIE1hbmFnZXI6IF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRUZXh0OiBfZmllbGRzVGV4dEZpZWxkMlsnZGVmYXVsdCddLFxuICBWYWxpZFBhc3N3b3JkOiBfZmllbGRzVmFsaWRQYXNzd29yZDJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRCb29sZWFuOiBfZmllbGRzSW5wdXRCb29sZWFuMlsnZGVmYXVsdCddLFxuICBJbnB1dEludGVnZXI6IF9maWVsZHNJbnB1dEludGVnZXIyWydkZWZhdWx0J10sXG4gIElucHV0QnV0dG9uOiBfZmllbGRzSW5wdXRCdXR0b24yWydkZWZhdWx0J10sXG4gIE1vbml0b3JpbmdMYWJlbDogX2ZpZWxkc01vbml0b3JpbmdMYWJlbDJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRTZWxlY3RCb3g6IF9maWVsZHNJbnB1dFNlbGVjdEJveDJbJ2RlZmF1bHQnXSxcbiAgQXV0b2NvbXBsZXRlQm94OiBfZmllbGRzQXV0b2NvbXBsZXRlQm94MlsnZGVmYXVsdCddLFxuICBBdXRvY29tcGxldGVUcmVlOiBfZmllbGRzQXV0b2NvbXBsZXRlVHJlZTJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRJbWFnZTogX2ZpZWxkc0lucHV0SW1hZ2UyWydkZWZhdWx0J10sXG4gIEZvcm1QYW5lbDogX3BhbmVsRm9ybVBhbmVsMlsnZGVmYXVsdCddLFxuICBQeWRpb0hlbHBlcjogX3BhbmVsRm9ybUhlbHBlcjJbJ2RlZmF1bHQnXSxcbiAgRmlsZURyb3Bab25lOiBfZmllbGRzRmlsZURyb3B6b25lMlsnZGVmYXVsdCddLFxuICBjcmVhdGVGb3JtRWxlbWVudDogX21hbmFnZXJNYW5hZ2VyMlsnZGVmYXVsdCddLmNyZWF0ZUZvcm1FbGVtZW50XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQeWRpb0Zvcm07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX2ZpZWxkc1ZhbGlkTG9naW4gPSByZXF1aXJlKCcuLi9maWVsZHMvVmFsaWRMb2dpbicpO1xuXG52YXIgX2ZpZWxkc1ZhbGlkTG9naW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzVmFsaWRMb2dpbik7XG5cbnZhciBYTUxVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwveG1sJyk7XG52YXIgSW5wdXRCb29sZWFuID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvSW5wdXRCb29sZWFuJyk7XG52YXIgSW5wdXRUZXh0ID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvVGV4dEZpZWxkJyk7XG52YXIgVmFsaWRQYXNzd29yZCA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL1ZhbGlkUGFzc3dvcmQnKTtcbnZhciBJbnB1dEludGVnZXIgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9JbnB1dEludGVnZXInKTtcbnZhciBJbnB1dEJ1dHRvbiA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0lucHV0QnV0dG9uJyk7XG52YXIgTW9uaXRvcmluZ0xhYmVsID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvTW9uaXRvcmluZ0xhYmVsJyk7XG52YXIgSW5wdXRJbWFnZSA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0lucHV0SW1hZ2UnKTtcbnZhciBTZWxlY3RCb3ggPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9JbnB1dFNlbGVjdEJveCcpO1xudmFyIEF1dG9jb21wbGV0ZUJveCA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0F1dG9jb21wbGV0ZUJveCcpO1xudmFyIEF1dG9jb21wbGV0ZVRyZWUgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9BdXRvY29tcGxldGVUcmVlJyk7XG5cbi8qKlxuICogVXRpbGl0eSBjbGFzcyB0byBwYXJzZSAvIGhhbmRsZSBweWRpbyBzdGFuZGFyZCBmb3JtIGRlZmluaXRpb25zL3ZhbHVlcy5cbiAqL1xuXG52YXIgTWFuYWdlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTWFuYWdlcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1hbmFnZXIpO1xuICAgIH1cblxuICAgIE1hbmFnZXIuaGFzSGVscGVyID0gZnVuY3Rpb24gaGFzSGVscGVyKHBsdWdpbklkLCBwYXJhbU5hbWUpIHtcblxuICAgICAgICB2YXIgaGVscGVycyA9IE1hbmFnZXIuZ2V0SGVscGVyc0NhY2hlKCk7XG4gICAgICAgIHJldHVybiBoZWxwZXJzW3BsdWdpbklkXSAmJiBoZWxwZXJzW3BsdWdpbklkXVsncGFyYW1ldGVycyddW3BhcmFtTmFtZV07XG4gICAgfTtcblxuICAgIE1hbmFnZXIuZ2V0SGVscGVyc0NhY2hlID0gZnVuY3Rpb24gZ2V0SGVscGVyc0NhY2hlKCkge1xuICAgICAgICBpZiAoIU1hbmFnZXIuSEVMUEVSU19DQUNIRSkge1xuICAgICAgICAgICAgdmFyIGhlbHBlckNhY2hlID0ge307XG4gICAgICAgICAgICB2YXIgaGVscGVycyA9IFhNTFV0aWxzLlhQYXRoU2VsZWN0Tm9kZXMod2luZG93LnB5ZGlvLlJlZ2lzdHJ5LmdldFhNTCgpLCAncGx1Z2lucy8qL2NsaWVudF9zZXR0aW5ncy9yZXNvdXJjZXMvanNbQHR5cGU9XCJoZWxwZXJcIl0nKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGVscGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBoZWxwZXJOb2RlID0gaGVscGVyc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgcGx1Z2luID0gaGVscGVyTm9kZS5nZXRBdHRyaWJ1dGUoXCJwbHVnaW5cIik7XG4gICAgICAgICAgICAgICAgaGVscGVyQ2FjaGVbcGx1Z2luXSA9IHsgbmFtZXNwYWNlOiBoZWxwZXJOb2RlLmdldEF0dHJpYnV0ZSgnY2xhc3NOYW1lJyksIHBhcmFtZXRlcnM6IHt9IH07XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtTm9kZXMgPSBYTUxVdGlscy5YUGF0aFNlbGVjdE5vZGVzKGhlbHBlck5vZGUsICdwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHBhcmFtTm9kZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtTm9kZSA9IHBhcmFtTm9kZXNba107XG4gICAgICAgICAgICAgICAgICAgIGhlbHBlckNhY2hlW3BsdWdpbl1bJ3BhcmFtZXRlcnMnXVtwYXJhbU5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNYW5hZ2VyLkhFTFBFUlNfQ0FDSEUgPSBoZWxwZXJDYWNoZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWFuYWdlci5IRUxQRVJTX0NBQ0hFO1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLnBhcnNlUGFyYW1ldGVycyA9IGZ1bmN0aW9uIHBhcnNlUGFyYW1ldGVycyh4bWxEb2N1bWVudCwgcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIFhNTFV0aWxzLlhQYXRoU2VsZWN0Tm9kZXMoeG1sRG9jdW1lbnQsIHF1ZXJ5KS5tYXAoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gTWFuYWdlci5wYXJhbWV0ZXJOb2RlVG9IYXNoKG5vZGUpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgTWFuYWdlci5wYXJhbWV0ZXJOb2RlVG9IYXNoID0gZnVuY3Rpb24gcGFyYW1ldGVyTm9kZVRvSGFzaChwYXJhbU5vZGUpIHtcbiAgICAgICAgdmFyIHBhcmFtc0F0dHMgPSBwYXJhbU5vZGUuYXR0cmlidXRlcztcbiAgICAgICAgdmFyIHBhcmFtc09iamVjdCA9IHt9O1xuICAgICAgICBpZiAocGFyYW1Ob2RlLnBhcmVudE5vZGUgJiYgcGFyYW1Ob2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZSAmJiBwYXJhbU5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgcGFyYW1zT2JqZWN0W1wicGx1Z2luSWRcIl0gPSBwYXJhbU5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcImlkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb2xsZWN0Q2RhdGEgPSBmYWxzZTtcbiAgICAgICAgdmFyIE1lc3NhZ2VIYXNoID0gZ2xvYmFsLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zQXR0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGF0dE5hbWUgPSBwYXJhbXNBdHRzLml0ZW0oaSkubm9kZU5hbWU7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJhbXNBdHRzLml0ZW0oaSkudmFsdWU7XG4gICAgICAgICAgICBpZiAoKGF0dE5hbWUgPT09IFwibGFiZWxcIiB8fCBhdHROYW1lID09PSBcImRlc2NyaXB0aW9uXCIgfHwgYXR0TmFtZSA9PT0gXCJncm91cFwiIHx8IGF0dE5hbWUuaW5kZXhPZihcImdyb3VwX3N3aXRjaF9cIikgPT09IDApICYmIE1lc3NhZ2VIYXNoW3ZhbHVlXSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gTWVzc2FnZUhhc2hbdmFsdWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGF0dE5hbWUgPT09IFwiY2RhdGF2YWx1ZVwiKSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdENkYXRhID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmFtc09iamVjdFthdHROYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2xsZWN0Q2RhdGEpIHtcbiAgICAgICAgICAgIHBhcmFtc09iamVjdFsndmFsdWUnXSA9IHBhcmFtTm9kZS5maXJzdENoaWxkLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbXNPYmplY3RbJ3R5cGUnXSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zT2JqZWN0Wyd2YWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPSBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPT09IFwidHJ1ZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsnZGVmYXVsdCddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSA9IHBhcmFtc09iamVjdFsnZGVmYXVsdCddID09PSBcInRydWVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXNPYmplY3RbJ3R5cGUnXSA9PT0gJ2ludGVnZXInKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zT2JqZWN0Wyd2YWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPSBwYXJzZUludChwYXJhbXNPYmplY3RbJ3ZhbHVlJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsnZGVmYXVsdCddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSA9IHBhcnNlSW50KHBhcmFtc09iamVjdFsnZGVmYXVsdCddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyYW1zT2JqZWN0O1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLmNyZWF0ZUZvcm1FbGVtZW50ID0gZnVuY3Rpb24gY3JlYXRlRm9ybUVsZW1lbnQocHJvcHMpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBzd2l0Y2ggKHByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSkge1xuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KElucHV0Qm9vbGVhbiwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIGNhc2UgJ3RleHRhcmVhJzpcbiAgICAgICAgICAgIGNhc2UgJ3Bhc3N3b3JkJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoSW5wdXRUZXh0LCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2YWxpZC1wYXNzd29yZCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFZhbGlkUGFzc3dvcmQsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZhbGlkLWxvZ2luJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX2ZpZWxkc1ZhbGlkTG9naW4yWydkZWZhdWx0J10sIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChJbnB1dEludGVnZXIsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2J1dHRvbic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KElucHV0QnV0dG9uLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtb25pdG9yJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9uaXRvcmluZ0xhYmVsLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbWFnZSc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KElucHV0SW1hZ2UsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFNlbGVjdEJveCwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXV0b2NvbXBsZXRlJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXV0b2NvbXBsZXRlQm94LCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhdXRvY29tcGxldGUtdHJlZSc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KEF1dG9jb21wbGV0ZVRyZWUsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2xlZ2VuZCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaGlkZGVuJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmIChwcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHByb3BzLnZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdFbXB0eSdcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLlNsYXNoZXNUb0pzb24gPSBmdW5jdGlvbiBTbGFzaGVzVG9Kc29uKHZhbHVlcykge1xuICAgICAgICBpZiAodmFsdWVzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHZhbHVlcyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld1ZhbHVlcyA9IHt9O1xuICAgICAgICB2YXIgcmVjdXJzZU9uS2V5cyA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyh2YWx1ZXMpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdmFsdWVzW2tdO1xuICAgICAgICAgICAgaWYgKGsuaW5kZXhPZignLycpID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IGsuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICB2YXIgZmlyc3RQYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdFBhcnQgPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdWYWx1ZXNbZmlyc3RQYXJ0XSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNbZmlyc3RQYXJ0XSA9IHt9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5ld1ZhbHVlc1tmaXJzdFBhcnRdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNbZmlyc3RQYXJ0XSA9IHsgJ0B2YWx1ZSc6IG5ld1ZhbHVlc1tmaXJzdFBhcnRdIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1tmaXJzdFBhcnRdW2xhc3RQYXJ0XSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgcmVjdXJzZU9uS2V5c1tmaXJzdFBhcnRdID0gZmlyc3RQYXJ0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVzW2tdICYmIHR5cGVvZiBuZXdWYWx1ZXNba10gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1trXVsnQHZhbHVlJ10gPSBkYXRhO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1trXSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmtleXMocmVjdXJzZU9uS2V5cykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlc1trZXldID0gTWFuYWdlci5TbGFzaGVzVG9Kc29uKG5ld1ZhbHVlc1trZXldKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZXM7XG4gICAgfTtcblxuICAgIE1hbmFnZXIuSnNvblRvU2xhc2hlcyA9IGZ1bmN0aW9uIEpzb25Ub1NsYXNoZXModmFsdWVzKSB7XG4gICAgICAgIHZhciBwcmVmaXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB2YXIgbmV3VmFsdWVzID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKHZhbHVlcykuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXNba10gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YlZhbHVlcyA9IE1hbmFnZXIuSnNvblRvU2xhc2hlcyh2YWx1ZXNba10sIHByZWZpeCArIGsgKyAnLycpO1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlcyA9IF9leHRlbmRzKHt9LCBuZXdWYWx1ZXMsIHN1YlZhbHVlcyk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlc1trXVsnQHZhbHVlJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVzW3ByZWZpeCArIGtdID0gdmFsdWVzW2tdWydAdmFsdWUnXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1twcmVmaXggKyBrXSA9IHZhbHVlc1trXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogRXh0cmFjdCBQT1NULXJlYWR5IHZhbHVlcyBmcm9tIGEgY29tYm8gcGFyYW1ldGVycy92YWx1ZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkZWZpbml0aW9ucyBBcnJheSBTdGFuZGFyZCBGb3JtIERlZmluaXRpb24gYXJyYXlcbiAgICAgKiBAcGFyYW0gdmFsdWVzIE9iamVjdCBLZXkvVmFsdWVzIG9mIHRoZSBjdXJyZW50IGZvcm1cbiAgICAgKiBAcGFyYW0gcHJlZml4IFN0cmluZyBPcHRpb25hbCBwcmVmaXggdG8gYWRkIHRvIGFsbCBwYXJhbWV0ZXJzIChieSBkZWZhdWx0IERSSVZFUl9PUFRJT05fKS5cbiAgICAgKiBAcmV0dXJucyBPYmplY3QgT2JqZWN0IHdpdGggYWxsIHB5ZGlvLWNvbXBhdGlibGUgUE9TVCBwYXJhbWV0ZXJzXG4gICAgICovXG5cbiAgICBNYW5hZ2VyLmdldFZhbHVlc0ZvclBPU1QgPSBmdW5jdGlvbiBnZXRWYWx1ZXNGb3JQT1NUKGRlZmluaXRpb25zLCB2YWx1ZXMpIHtcbiAgICAgICAgdmFyIHByZWZpeCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/ICdEUklWRVJfT1BUSU9OXycgOiBhcmd1bWVudHNbMl07XG4gICAgICAgIHZhciBhZGRpdGlvbmFsTWV0YWRhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzNdO1xuXG4gICAgICAgIHZhciBjbGllbnRQYXJhbXMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHZhbHVlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgY2xpZW50UGFyYW1zW3ByZWZpeCArIGtleV0gPSB2YWx1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICB2YXIgZGVmVHlwZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZCA9IDA7IGQgPCBkZWZpbml0aW9ucy5sZW5ndGg7IGQrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmaW5pdGlvbnNbZF1bJ25hbWUnXSA9PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZlR5cGUgPSBkZWZpbml0aW9uc1tkXVsndHlwZSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFkZWZUeXBlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnRzID0ga2V5LnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0LCBwcmV2O1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCA9IHBhcnRzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldiA9IHBhcnRzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZGVmaW5pdGlvbnMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVmaW5pdGlvbnNba11bJ25hbWUnXSA9PSBsYXN0ICYmIGRlZmluaXRpb25zW2tdWydncm91cF9zd2l0Y2hfbmFtZSddICYmIGRlZmluaXRpb25zW2tdWydncm91cF9zd2l0Y2hfbmFtZSddID09IHByZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmVHlwZSA9IGRlZmluaXRpb25zW2tdWyd0eXBlJ107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlZmluaXRpb25zW2tdWyduYW1lJ10gPT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZlR5cGUgPSBkZWZpbml0aW9uc1trXVsndHlwZSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9kZWZpbml0aW9ucy5tYXAoZnVuY3Rpb24oZCl7aWYoZC5uYW1lID09IHRoZUtleSkgZGVmVHlwZSA9IGQudHlwZX0pO1xuICAgICAgICAgICAgICAgIGlmIChkZWZUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWZUeXBlID09IFwiaW1hZ2VcIikgZGVmVHlwZSA9IFwiYmluYXJ5XCI7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtc1twcmVmaXggKyBrZXkgKyAnX2FqeHB0eXBlJ10gPSBkZWZUeXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYWRkaXRpb25hbE1ldGFkYXRhICYmIGFkZGl0aW9uYWxNZXRhZGF0YVtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIG1ldGEgaW4gYWRkaXRpb25hbE1ldGFkYXRhW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhZGRpdGlvbmFsTWV0YWRhdGFba2V5XS5oYXNPd25Qcm9wZXJ0eShtZXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtc1twcmVmaXggKyBrZXkgKyAnXycgKyBtZXRhXSA9IGFkZGl0aW9uYWxNZXRhZGF0YVtrZXldW21ldGFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVvcmRlciB0cmVlIGtleXNcbiAgICAgICAgdmFyIGFsbEtleXMgPSBPYmplY3Qua2V5cyhjbGllbnRQYXJhbXMpO1xuICAgICAgICBhbGxLZXlzLnNvcnQoKTtcbiAgICAgICAgYWxsS2V5cy5yZXZlcnNlKCk7XG4gICAgICAgIHZhciB0cmVlS2V5cyA9IHt9O1xuICAgICAgICBhbGxLZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoXCIvXCIpID09PSAtMSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGtleS5lbmRzV2l0aChcIl9hanhwdHlwZVwiKSkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHR5cGVLZXkgPSBrZXkgKyBcIl9hanhwdHlwZVwiO1xuICAgICAgICAgICAgdmFyIHBhcnRzID0ga2V5LnNwbGl0KFwiL1wiKTtcbiAgICAgICAgICAgIHZhciBwYXJlbnROYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciBwYXJlbnRLZXk7XG4gICAgICAgICAgICB3aGlsZSAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghcGFyZW50S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleSA9IHRyZWVLZXlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXBhcmVudEtleVtwYXJlbnROYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV0gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFyZW50S2V5ID0gcGFyZW50S2V5W3BhcmVudE5hbWVdO1xuICAgICAgICAgICAgICAgIHBhcmVudE5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHR5cGUgPSBjbGllbnRQYXJhbXNbdHlwZUtleV07XG4gICAgICAgICAgICBkZWxldGUgY2xpZW50UGFyYW1zW3R5cGVLZXldO1xuICAgICAgICAgICAgaWYgKHBhcmVudEtleSAmJiAhcGFyZW50S2V5W3BhcmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHYgPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdID0gdiA9PSBcInRydWVcIiB8fCB2ID09IDEgfHwgdiA9PT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJpbnRlZ2VyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdID0gcGFyc2VJbnQoY2xpZW50UGFyYW1zW2tleV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSAmJiB0eXBlLnN0YXJ0c1dpdGgoXCJncm91cF9zd2l0Y2g6XCIpICYmIHR5cGVvZiBjbGllbnRQYXJhbXNba2V5XSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXSA9IHsgZ3JvdXBfc3dpdGNoX3ZhbHVlOiBjbGllbnRQYXJhbXNba2V5XSB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXSA9IGNsaWVudFBhcmFtc1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyZW50S2V5ICYmIHR5cGUgJiYgdHlwZS5zdGFydHNXaXRoKCdncm91cF9zd2l0Y2g6JykpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV1bXCJncm91cF9zd2l0Y2hfdmFsdWVcIl0gPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAoa2V5IGluIHRyZWVLZXlzKSB7XG4gICAgICAgICAgICBpZiAoIXRyZWVLZXlzLmhhc093blByb3BlcnR5KGtleSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgdmFyIHRyZWVWYWx1ZSA9IHRyZWVLZXlzW2tleV07XG4gICAgICAgICAgICBpZiAoY2xpZW50UGFyYW1zW2tleSArICdfYWp4cHR5cGUnXSAmJiBjbGllbnRQYXJhbXNba2V5ICsgJ19hanhwdHlwZSddLmluZGV4T2YoJ2dyb3VwX3N3aXRjaDonKSA9PT0gMCAmJiAhdHJlZVZhbHVlWydncm91cF9zd2l0Y2hfdmFsdWUnXSkge1xuICAgICAgICAgICAgICAgIHRyZWVWYWx1ZVsnZ3JvdXBfc3dpdGNoX3ZhbHVlJ10gPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xpZW50UGFyYW1zW2tleV0gPSBKU09OLnN0cmluZ2lmeSh0cmVlVmFsdWUpO1xuICAgICAgICAgICAgY2xpZW50UGFyYW1zW2tleSArICdfYWp4cHR5cGUnXSA9IFwidGV4dC9qc29uXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhbiBYWFhfZ3JvdXBfc3dpdGNoIHBhcmFtZXRlcnNcbiAgICAgICAgZm9yICh2YXIgdGhlS2V5IGluIGNsaWVudFBhcmFtcykge1xuICAgICAgICAgICAgaWYgKCFjbGllbnRQYXJhbXMuaGFzT3duUHJvcGVydHkodGhlS2V5KSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGlmICh0aGVLZXkuaW5kZXhPZihcIi9cIikgPT0gLTEgJiYgY2xpZW50UGFyYW1zW3RoZUtleV0gJiYgY2xpZW50UGFyYW1zW3RoZUtleSArIFwiX2FqeHB0eXBlXCJdICYmIGNsaWVudFBhcmFtc1t0aGVLZXkgKyBcIl9hanhwdHlwZVwiXS5zdGFydHNXaXRoKFwiZ3JvdXBfc3dpdGNoOlwiKSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2xpZW50UGFyYW1zW3RoZUtleV0gPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICBjbGllbnRQYXJhbXNbdGhlS2V5XSA9IEpTT04uc3RyaW5naWZ5KHsgZ3JvdXBfc3dpdGNoX3ZhbHVlOiBjbGllbnRQYXJhbXNbdGhlS2V5XSB9KTtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50UGFyYW1zW3RoZUtleSArIFwiX2FqeHB0eXBlXCJdID0gXCJ0ZXh0L2pzb25cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2xpZW50UGFyYW1zLmhhc093blByb3BlcnR5KHRoZUtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhlS2V5LmVuZHNXaXRoKFwiX2dyb3VwX3N3aXRjaFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY2xpZW50UGFyYW1zW3RoZUtleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNsaWVudFBhcmFtcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIE1hbmFnZXI7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNYW5hZ2VyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUGF0aFV0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBhdHRyaWJ1dGVzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIGFwcGx5QnV0dG9uQWN0aW9uOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgYWN0aW9uQ2FsbGJhY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgfSxcblxuICAgIGFwcGx5QWN0aW9uOiBmdW5jdGlvbiBhcHBseUFjdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2hvaWNlc1ZhbHVlID0gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10uc3BsaXQoXCI6XCIpO1xuICAgICAgICB2YXIgZmlyc3RQYXJ0ID0gY2hvaWNlc1ZhbHVlLnNoaWZ0KCk7XG4gICAgICAgIGlmIChmaXJzdFBhcnQgPT09IFwicnVuX2NsaWVudF9hY3Rpb25cIiAmJiBnbG9iYWwucHlkaW8pIHtcbiAgICAgICAgICAgIGdsb2JhbC5weWRpby5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbihjaG9pY2VzVmFsdWUuc2hpZnQoKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0geyBhY3Rpb246IGZpcnN0UGFydCB9O1xuICAgICAgICAgICAgaWYgKGNob2ljZXNWYWx1ZS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyc1snYWN0aW9uX3BsdWdpbl9pZCddID0gY2hvaWNlc1ZhbHVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyc1snYWN0aW9uX3BsdWdpbl9tZXRob2QnXSA9IGNob2ljZXNWYWx1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1snbmFtZSddLmluZGV4T2YoXCIvXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnNbJ2J1dHRvbl9rZXknXSA9IFBhdGhVdGlscy5nZXREaXJuYW1lKHRoaXMucHJvcHMuYXR0cmlidXRlc1snbmFtZSddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24ocGFyYW1ldGVycywgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBDb21wb25lbnQgPSBfcmVxdWlyZS5Db21wb25lbnQ7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBQeWRpb0NvbnRleHRDb25zdW1lciA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuUHlkaW9Db250ZXh0Q29uc3VtZXI7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChQeWRpb0NvbXBvbmVudCkge1xuICAgIHZhciBGaWVsZFdpdGhDaG9pY2VzID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgICAgIF9pbmhlcml0cyhGaWVsZFdpdGhDaG9pY2VzLCBfQ29tcG9uZW50KTtcblxuICAgICAgICBGaWVsZFdpdGhDaG9pY2VzLnByb3RvdHlwZS5sb2FkRXh0ZXJuYWxWYWx1ZXMgPSBmdW5jdGlvbiBsb2FkRXh0ZXJuYWxWYWx1ZXMoY2hvaWNlcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICAgICAgdmFyIHBhcnNlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIHZhciBsaXN0X2FjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25DaG9pY2VzTG9hZGVkKSB0aGlzLm9uQ2hvaWNlc0xvYWRlZChjaG9pY2VzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBjaG9pY2VzOiBjaG9pY2VzLCBwYXJzZWQ6IHBhcnNlZCB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgaWYgKGNob2ljZXMuaW5kZXhPZignanNvbl9maWxlOicpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcGFyc2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbGlzdF9hY3Rpb24gPSBjaG9pY2VzLnJlcGxhY2UoJ2pzb25fZmlsZTonLCAnJyk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnNldCgnMCcsIHB5ZGlvLk1lc3NhZ2VIYXNoWydhanhwX2FkbWluLmhvbWUuNiddKTtcbiAgICAgICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5sb2FkRmlsZShsaXN0X2FjdGlvbiwgZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3T3V0cHV0ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNwb3J0LnJlc3BvbnNlSlNPTikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0LnJlc3BvbnNlSlNPTi5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld091dHB1dC5zZXQoZW50cnkua2V5LCBlbnRyeS5sYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmFuc3BvcnQucmVzcG9uc2VUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UodHJhbnNwb3J0LnJlc3BvbnNlVGV4dCkuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T3V0cHV0LnNldChlbnRyeS5rZXksIGVudHJ5LmxhYmVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgcGFyc2luZyBsaXN0ICcgKyBjaG9pY2VzLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGNob2ljZXM6IG5ld091dHB1dCB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMub25DaG9pY2VzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMub25DaG9pY2VzTG9hZGVkKG5ld091dHB1dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2VzID09PSBcIlBZRElPX0FWQUlMQUJMRV9MQU5HVUFHRVNcIikge1xuICAgICAgICAgICAgICAgIHB5ZGlvLmxpc3RMYW5ndWFnZXNXaXRoQ2FsbGJhY2soZnVuY3Rpb24gKGtleSwgbGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnNldChrZXksIGxhYmVsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkNob2ljZXNMb2FkZWQpIHRoaXMub25DaG9pY2VzTG9hZGVkKG91dHB1dCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNob2ljZXMgPT09IFwiUFlESU9fQVZBSUxBQkxFX1JFUE9TSVRPUklFU1wiKSB7XG4gICAgICAgICAgICAgICAgaWYgKHB5ZGlvLnVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzb3J0ZXIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYWdlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8udXNlci5yZXBvc2l0b3JpZXMuZm9yRWFjaChmdW5jdGlvbiAocmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXBvc2l0b3J5LmdldElkKCkgPT09ICdzZXR0aW5ncycgfHwgcmVwb3NpdG9yeS5nZXRJZCgpID09PSAnaG9tZXBhZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VzLnB1c2goeyBpZDogcmVwb3NpdG9yeS5nZXRJZCgpLCBsYWJlbDogJ1snICsgcHlkaW8uTWVzc2FnZUhhc2hbJzMzMSddICsgJ10gJyArIHJlcG9zaXRvcnkuZ2V0TGFiZWwoKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlcG9zaXRvcnkuZ2V0UmVwb3NpdG9yeVR5cGUoKSAhPT0gXCJjZWxsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGVyLnB1c2goeyBpZDogcmVwb3NpdG9yeS5nZXRJZCgpLCBsYWJlbDogcmVwb3NpdG9yeS5nZXRMYWJlbCgpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc29ydGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlci5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEubGFiZWwubG9jYWxlQ29tcGFyZShiLmxhYmVsLCB1bmRlZmluZWQsIHsgbnVtZXJpYzogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGVyLnB1c2guYXBwbHkoc29ydGVyLCBwYWdlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0ZXIuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQuc2V0KGQuaWQsIGQubGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQ2hvaWNlc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ2hvaWNlc0xvYWRlZChvdXRwdXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUGFyc2Ugc3RyaW5nIGFuZCByZXR1cm4gbWFwXG4gICAgICAgICAgICAgICAgY2hvaWNlcy5zcGxpdChcIixcIikubWFwKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsID0gY2hvaWNlLnNwbGl0KCd8Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbFswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gbFsxXTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbGFiZWwgPSBjaG9pY2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGdsb2JhbC5weWRpby5NZXNzYWdlSGFzaFtsYWJlbF0pIGxhYmVsID0gZ2xvYmFsLnB5ZGlvLk1lc3NhZ2VIYXNoW2xhYmVsXTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnNldCh2YWx1ZSwgbGFiZWwpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgY2hvaWNlczogb3V0cHV0LCBwYXJzZWQ6IHBhcnNlZCB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIEZpZWxkV2l0aENob2ljZXMocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGaWVsZFdpdGhDaG9pY2VzKTtcblxuICAgICAgICAgICAgX0NvbXBvbmVudC5jYWxsKHRoaXMsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIHZhciBjaG9pY2VzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgY2hvaWNlcy5zZXQoJzAnLCB0aGlzLnByb3BzLnB5ZGlvID8gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnYWp4cF9hZG1pbi5ob21lLjYnXSA6ICcgLi4uICcpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHsgY2hvaWNlczogY2hvaWNlcywgY2hvaWNlc1BhcnNlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIEZpZWxkV2l0aENob2ljZXMucHJvdG90eXBlLmNvbXBvbmVudERpZE1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10pIHtcbiAgICAgICAgICAgICAgICB2YXIgX2xvYWRFeHRlcm5hbFZhbHVlcyA9IHRoaXMubG9hZEV4dGVybmFsVmFsdWVzKHRoaXMucHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddKTtcblxuICAgICAgICAgICAgICAgIHZhciBjaG9pY2VzID0gX2xvYWRFeHRlcm5hbFZhbHVlcy5jaG9pY2VzO1xuICAgICAgICAgICAgICAgIHZhciBwYXJzZWQgPSBfbG9hZEV4dGVybmFsVmFsdWVzLnBhcnNlZDtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjaG9pY2VzOiBjaG9pY2VzLCBjaG9pY2VzUGFyc2VkOiBwYXJzZWQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgRmllbGRXaXRoQ2hvaWNlcy5wcm90b3R5cGUuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgICAgIGlmIChuZXdQcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10gJiYgbmV3UHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddICE9PSB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSkge1xuICAgICAgICAgICAgICAgIHZhciBfbG9hZEV4dGVybmFsVmFsdWVzMiA9IHRoaXMubG9hZEV4dGVybmFsVmFsdWVzKG5ld1Byb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hvaWNlcyA9IF9sb2FkRXh0ZXJuYWxWYWx1ZXMyLmNob2ljZXM7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnNlZCA9IF9sb2FkRXh0ZXJuYWxWYWx1ZXMyLnBhcnNlZDtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBjaG9pY2VzOiBjaG9pY2VzLFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2VzUGFyc2VkOiBwYXJzZWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBGaWVsZFdpdGhDaG9pY2VzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQeWRpb0NvbXBvbmVudCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHRoaXMuc3RhdGUpKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gRmllbGRXaXRoQ2hvaWNlcztcbiAgICB9KShDb21wb25lbnQpO1xuXG4gICAgRmllbGRXaXRoQ2hvaWNlcyA9IFB5ZGlvQ29udGV4dENvbnN1bWVyKEZpZWxkV2l0aENob2ljZXMpO1xuXG4gICAgcmV0dXJuIEZpZWxkV2l0aENob2ljZXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG4vKipcbiAqIFJlYWN0IE1peGluIGZvciBGb3JtIEVsZW1lbnRcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0ge1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgbmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXG4gICAgICAgIGRpc3BsYXlDb250ZXh0OiBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydmb3JtJywgJ2dyaWQnXSksXG4gICAgICAgIGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgbXVsdGlwbGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICB2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLmFueSxcbiAgICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvbkNoYW5nZUVkaXRNb2RlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgYmluYXJ5X2NvbnRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGVycm9yVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpc3BsYXlDb250ZXh0OiAnZm9ybScsXG4gICAgICAgICAgICBkaXNhYmxlZDogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgaXNEaXNwbGF5R3JpZDogZnVuY3Rpb24gaXNEaXNwbGF5R3JpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZGlzcGxheUNvbnRleHQgPT0gJ2dyaWQnO1xuICAgIH0sXG5cbiAgICBpc0Rpc3BsYXlGb3JtOiBmdW5jdGlvbiBpc0Rpc3BsYXlGb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5kaXNwbGF5Q29udGV4dCA9PSAnZm9ybSc7XG4gICAgfSxcblxuICAgIHRvZ2dsZUVkaXRNb2RlOiBmdW5jdGlvbiB0b2dnbGVFZGl0TW9kZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwbGF5Rm9ybSgpKSByZXR1cm47XG4gICAgICAgIHZhciBuZXdTdGF0ZSA9ICF0aGlzLnN0YXRlLmVkaXRNb2RlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IG5ld1N0YXRlIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZUVkaXRNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlRWRpdE1vZGUobmV3U3RhdGUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGVudGVyVG9Ub2dnbGU6IGZ1bmN0aW9uIGVudGVyVG9Ub2dnbGUoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PSAnRW50ZXInKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYnVmZmVyQ2hhbmdlczogZnVuY3Rpb24gYnVmZmVyQ2hhbmdlcyhuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyUHJvcHNPbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UoZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0VmFsdWUgPyBldmVudC5jdXJyZW50VGFyZ2V0LmdldFZhbHVlKCkgOiBldmVudC5jdXJyZW50VGFyZ2V0LnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNoYW5nZVRpbWVvdXQpIHtcbiAgICAgICAgICAgIGdsb2JhbC5jbGVhclRpbWVvdXQodGhpcy5jaGFuZ2VUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmV3VmFsdWUgPSB2YWx1ZSxcbiAgICAgICAgICAgIG9sZFZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc2tpcEJ1ZmZlckNoYW5nZXMpIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlclByb3BzT25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpcnR5OiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IG5ld1ZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuc2tpcEJ1ZmZlckNoYW5nZXMpIHtcbiAgICAgICAgICAgIHZhciB0aW1lckxlbmd0aCA9IDI1MDtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICAgICAgICAgIHRpbWVyTGVuZ3RoID0gMTIwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2hhbmdlVGltZW91dCA9IGdsb2JhbC5zZXRUaW1lb3V0KChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJDaGFuZ2VzKG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpLCB0aW1lckxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgdHJpZ2dlclByb3BzT25DaGFuZ2U6IGZ1bmN0aW9uIHRyaWdnZXJQcm9wc09uQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlLCB7IHR5cGU6IHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWUsXG4gICAgICAgICAgICBkaXJ0eTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWRpdE1vZGU6IGZhbHNlLFxuICAgICAgICAgICAgZGlydHk6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMudmFsdWVcbiAgICAgICAgfTtcbiAgICB9XG5cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbi8qKlxuICogUmVhY3QgTWl4aW4gZm9yIHRoZSBmb3JtIGhlbHBlciA6IGRlZmF1bHQgcHJvcGVydGllcyB0aGF0XG4gKiBoZWxwZXJzIGNhbiByZWNlaXZlXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgcGFyYW1OYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBhcmFtQXR0cmlidXRlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICB2YWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgdXBkYXRlQ2FsbGJhY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWFuYWdlck1hbmFnZXIgPSByZXF1aXJlKCcuLi9tYW5hZ2VyL01hbmFnZXInKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYW5hZ2VyTWFuYWdlcik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBBc3luY0NvbXBvbmVudCA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuQXN5bmNDb21wb25lbnQ7XG5cbi8qKlxuICogRGlzcGxheSBhIGZvcm0gY29tcGFuaW9uIGxpbmtlZCB0byBhIGdpdmVuIGlucHV0LlxuICogUHJvcHM6IGhlbHBlckRhdGEgOiBjb250YWlucyB0aGUgcGx1Z2luSWQgYW5kIHRoZSB3aG9sZSBwYXJhbUF0dHJpYnV0ZXNcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnRm9ybUhlbHBlcicsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgaGVscGVyRGF0YTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgY2xvc2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgY2xvc2VIZWxwZXI6IGZ1bmN0aW9uIGNsb3NlSGVscGVyKCkge1xuICAgICAgICB0aGlzLnByb3BzLmNsb3NlKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgaGVscGVyID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5oZWxwZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgaGVscGVyc0NhY2hlID0gX21hbmFnZXJNYW5hZ2VyMlsnZGVmYXVsdCddLmdldEhlbHBlcnNDYWNoZSgpO1xuICAgICAgICAgICAgdmFyIHBsdWdpbkhlbHBlck5hbWVzcGFjZSA9IGhlbHBlcnNDYWNoZVt0aGlzLnByb3BzLmhlbHBlckRhdGFbJ3BsdWdpbklkJ11dWyduYW1lc3BhY2UnXTtcbiAgICAgICAgICAgIGhlbHBlciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdoZWxwZXItdGl0bGUnIH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2hlbHBlci1jbG9zZSBtZGkgbWRpLWNsb3NlJywgb25DbGljazogdGhpcy5jbG9zZUhlbHBlciB9KSxcbiAgICAgICAgICAgICAgICAgICAgJ1B5ZGlvIENvbXBhbmlvbidcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2hlbHBlci1jb250ZW50JyB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEFzeW5jQ29tcG9uZW50LCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcy5oZWxwZXJEYXRhLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IHBsdWdpbkhlbHBlck5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5hbWU6ICdIZWxwZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1OYW1lOiB0aGlzLnByb3BzLmhlbHBlckRhdGFbJ3BhcmFtQXR0cmlidXRlcyddWyduYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdweWRpby1mb3JtLWhlbHBlcicgKyAoaGVscGVyID8gJyBoZWxwZXItdmlzaWJsZScgOiAnIGhlbHBlci1lbXB0eScpLCBzdHlsZTogeyB6SW5kZXg6IDEgfSB9LFxuICAgICAgICAgICAgaGVscGVyXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfR3JvdXBTd2l0Y2hQYW5lbCA9IHJlcXVpcmUoJy4vR3JvdXBTd2l0Y2hQYW5lbCcpO1xuXG52YXIgX0dyb3VwU3dpdGNoUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfR3JvdXBTd2l0Y2hQYW5lbCk7XG5cbnZhciBfUmVwbGljYXRpb25QYW5lbCA9IHJlcXVpcmUoJy4vUmVwbGljYXRpb25QYW5lbCcpO1xuXG52YXIgX1JlcGxpY2F0aW9uUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUmVwbGljYXRpb25QYW5lbCk7XG5cbnZhciBfbWFuYWdlck1hbmFnZXIgPSByZXF1aXJlKCcuLi9tYW5hZ2VyL01hbmFnZXInKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYW5hZ2VyTWFuYWdlcik7XG5cbnZhciBfcHlkaW9VdGlsTGFuZyA9IHJlcXVpcmUoXCJweWRpby91dGlsL2xhbmdcIik7XG5cbnZhciBfcHlkaW9VdGlsTGFuZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxMYW5nKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZShcIm1hdGVyaWFsLXVpXCIpO1xuXG4vKipcbiAqIEZvcm0gUGFuZWwgaXMgYSByZWFkeSB0byB1c2UgZm9ybSBidWlsZGVyIGluaGVyaXRlZCBmb3IgUHlkaW8ncyBsZWdhY3kgcGFyYW1ldGVycyBmb3JtYXRzICgnc3RhbmRhcmQgZm9ybScpLlxuICogSXQgaXMgdmVyeSB2ZXJzYXRpbGUgYW5kIGNhbiBiYXNpY2FsbHkgdGFrZSBhIHNldCBvZiBwYXJhbWV0ZXJzIGRlZmluZWQgaW4gdGhlIFhNTCBtYW5pZmVzdHMgKG9yIGRlZmluZWQgbWFudWFsbHlcbiAqIGluIEpTKSBhbmQgZGlzcGxheSB0aGVtIGFzIGEgdXNlciBmb3JtLlxuICogSXQgaXMgYSBjb250cm9sbGVkIGNvbXBvbmVudDogaXQgdGFrZXMgYSB7dmFsdWVzfSBvYmplY3QgYW5kIHRyaWdnZXJzIGJhY2sgYW4gb25DaGFuZ2UoKSBmdW5jdGlvbi5cbiAqXG4gKiBTZWUgYWxzbyBNYW5hZ2VyIGNsYXNzIHRvIGdldCBzb21lIHV0aWxpdGFyeSBmdW5jdGlvbnMgdG8gcGFyc2UgcGFyYW1ldGVycyBhbmQgZXh0cmFjdCB2YWx1ZXMgZm9yIHRoZSBmb3JtLlxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnRm9ybVBhbmVsJyxcblxuICAgIF9oaWRkZW5WYWx1ZXM6IHt9LFxuICAgIF9pbnRlcm5hbFZhbGlkOiBudWxsLFxuICAgIF9wYXJhbWV0ZXJzTWV0YWRhdGE6IG51bGwsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IG9mIFB5ZGlvIFN0YW5kYXJkRm9ybSBwYXJhbWV0ZXJzXG4gICAgICAgICAqL1xuICAgICAgICBwYXJhbWV0ZXJzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYmplY3QgY29udGFpbmluZyB2YWx1ZXMgZm9yIHRoZSBwYXJhbWV0ZXJzXG4gICAgICAgICAqL1xuICAgICAgICB2YWx1ZXM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlciB1bml0YXJ5IGZ1bmN0aW9uIHdoZW4gb25lIGZvcm0gaW5wdXQgY2hhbmdlcy5cbiAgICAgICAgICovXG4gICAgICAgIG9uUGFyYW1ldGVyQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW5kIGFsbCBmb3JtIHZhbHVlcyBvbmNoYW5nZSwgaW5jbHVkaW5nIGV2ZW50dWFsbHkgdGhlIHJlbW92ZWQgb25lcyAoZm9yIGR5bmFtaWMgcGFuZWxzKVxuICAgICAgICAgKi9cbiAgICAgICAgb25DaGFuZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSBmb3JtIGdsb2JhYmFsbHkgc3dpdGNoZXMgYmV0d2VlbiB2YWxpZCBhbmQgaW52YWxpZCBzdGF0ZVxuICAgICAgICAgKiBUcmlnZ2VyZWQgb25jZSBhdCBmb3JtIGNvbnN0cnVjdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgb25WYWxpZFN0YXR1c0NoYW5nZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzYWJsZSB0aGUgd2hvbGUgZm9ybSBhdCBvbmNlXG4gICAgICAgICAqL1xuICAgICAgICBkaXNhYmxlZDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5ib29sLFxuICAgICAgICAvKipcbiAgICAgICAgICogU3RyaW5nIGFkZGVkIHRvIHRoZSBpbWFnZSBpbnB1dHMgZm9yIHVwbG9hZC9kb3dubG9hZCBvcGVyYXRpb25zXG4gICAgICAgICAqL1xuICAgICAgICBiaW5hcnlfY29udGV4dDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAwIGJ5IGRlZmF1bHQsIHN1YmZvcm1zIHdpbGwgaGF2ZSB0aGVpciB6RGVwdGggdmFsdWUgaW5jcmVhc2VkIGJ5IG9uZVxuICAgICAgICAgKi9cbiAgICAgICAgZGVwdGg6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMubnVtYmVyLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgYW4gYWRkaXRpb25hbCBoZWFkZXIgY29tcG9uZW50IChhZGRlZCBpbnNpZGUgZmlyc3Qgc3VicGFuZWwpXG4gICAgICAgICAqL1xuICAgICAgICBoZWFkZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGFuIGFkZGl0aW9uYWwgZm9vdGVyIGNvbXBvbmVudCAoYWRkZWQgaW5zaWRlIGxhc3Qgc3VicGFuZWwpXG4gICAgICAgICAqL1xuICAgICAgICBmb290ZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIG90aGVyIGFyYml0cmFyeSBwYW5lbHMsIGVpdGhlciBhdCB0aGUgdG9wIG9yIHRoZSBib3R0b21cbiAgICAgICAgICovXG4gICAgICAgIGFkZGl0aW9uYWxQYW5lczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgICB0b3A6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYXJyYXksXG4gICAgICAgICAgICBib3R0b206IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYXJyYXlcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBbiBhcnJheSBvZiB0YWJzIGNvbnRhaW5pbmcgZ3JvdXBOYW1lcy4gR3JvdXBzIHdpbGwgYmUgc3BsaXR0ZWRcbiAgICAgICAgICogYWNjcm9zcyB0aG9zZSB0YWJzXG4gICAgICAgICAqL1xuICAgICAgICB0YWJzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmFycmF5LFxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZWQgd2hlbiBhIHRoZSBhY3RpdmUgdGFiIGNoYW5nZXNcbiAgICAgICAgICovXG4gICAgICAgIG9uVGFiQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIGJpdCBsaWtlIHRhYnMsIGJ1dCB1c2luZyBhY2NvcmRpb24tbGlrZSBsYXlvdXRcbiAgICAgICAgICovXG4gICAgICAgIGFjY29yZGlvbml6ZUlmR3JvdXBzTW9yZVRoYW46IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgICAvKipcbiAgICAgICAgICogRm9yd2FyZCBhbiBldmVudCB3aGVuIHNjcm9sbGluZyB0aGUgZm9ybVxuICAgICAgICAgKi9cbiAgICAgICAgb25TY3JvbGxDYWxsYmFjazogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzdHJpY3QgdG8gYSBzdWJzZXQgb2YgZmllbGQgZ3JvdXBzXG4gICAgICAgICAqL1xuICAgICAgICBsaW1pdFRvR3JvdXBzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmFycmF5LFxuICAgICAgICAvKipcbiAgICAgICAgICogSWdub3JlIHNvbWUgc3BlY2lmaWMgZmllbGRzIHR5cGVzXG4gICAgICAgICAqL1xuICAgICAgICBza2lwRmllbGRzVHlwZXM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYXJyYXksXG5cbiAgICAgICAgLyogSGVscGVyIE9wdGlvbnMgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBhc3MgcG9pbnRlcnMgdG8gdGhlIFB5ZGlvIENvbXBhbmlvbiBjb250YWluZXJcbiAgICAgICAgICovXG4gICAgICAgIHNldEhlbHBlckRhdGE6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBjb21wYW5pb24gaXMgYWN0aXZlIG9yIG5vbmUgYW5kIGlmIGEgcGFyYW1ldGVyXG4gICAgICAgICAqIGhhcyBoZWxwZXIgZGF0YVxuICAgICAgICAgKi9cbiAgICAgICAgY2hlY2tIYXNIZWxwZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRlc3QgZm9yIHBhcmFtZXRlclxuICAgICAgICAgKi9cbiAgICAgICAgaGVscGVyVGVzdEZvcjogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmdcblxuICAgIH0sXG5cbiAgICBleHRlcm5hbGx5U2VsZWN0VGFiOiBmdW5jdGlvbiBleHRlcm5hbGx5U2VsZWN0VGFiKGluZGV4KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWJTZWxlY3RlZEluZGV4OiBpbmRleCB9KTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uVGFiQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm4geyB0YWJTZWxlY3RlZEluZGV4OiAwIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHsgZGVwdGg6IDAsIHZhbHVlczoge30gfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICBpZiAoSlNPTi5zdHJpbmdpZnkobmV3UHJvcHMucGFyYW1ldGVycykgIT09IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMucGFyYW1ldGVycykpIHtcbiAgICAgICAgICAgIHRoaXMuX2ludGVybmFsVmFsaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5faGlkZGVuVmFsdWVzID0ge307XG4gICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGEgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3UHJvcHMudmFsdWVzICYmIG5ld1Byb3BzLnZhbHVlcyAhPT0gdGhpcy5wcm9wcy52YWx1ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tWYWxpZFN0YXR1cyhuZXdQcm9wcy52YWx1ZXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFZhbHVlczogZnVuY3Rpb24gZ2V0VmFsdWVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy52YWx1ZXM7IC8vTGFuZ1V0aWxzLm1lcmdlT2JqZWN0c1JlY3Vyc2l2ZSh0aGlzLl9oaWRkZW5WYWx1ZXMsIHRoaXMucHJvcHMudmFsdWVzKTtcbiAgICB9LFxuXG4gICAgb25QYXJhbWV0ZXJDaGFuZ2U6IGZ1bmN0aW9uIG9uUGFyYW1ldGVyQ2hhbmdlKHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIHZhciBhZGRpdGlvbmFsRm9ybURhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzNdO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB3cml0ZVZhbHVlc1xuICAgICAgICB2YXIgbmV3VmFsdWVzID0gX3B5ZGlvVXRpbExhbmcyWydkZWZhdWx0J10uZGVlcENvcHkodGhpcy5nZXRWYWx1ZXMoKSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uUGFyYW1ldGVyQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUGFyYW1ldGVyQ2hhbmdlKHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlLCBhZGRpdGlvbmFsRm9ybURhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhZGRpdGlvbmFsRm9ybURhdGEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fcGFyYW1ldGVyc01ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyYW1ldGVyc01ldGFkYXRhID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGFbcGFyYW1OYW1lXSA9IGFkZGl0aW9uYWxGb3JtRGF0YTtcbiAgICAgICAgfVxuICAgICAgICBuZXdWYWx1ZXNbcGFyYW1OYW1lXSA9IG5ld1ZhbHVlO1xuICAgICAgICB2YXIgZGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKG5ld1ZhbHVlcywgZGlydHkpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UobmV3VmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICAvL25ld1ZhbHVlcyA9IExhbmdVdGlscy5tZXJnZU9iamVjdHNSZWN1cnNpdmUodGhpcy5faGlkZGVuVmFsdWVzLCBuZXdWYWx1ZXMpO1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuX2hpZGRlblZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9oaWRkZW5WYWx1ZXMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBuZXdWYWx1ZXNba2V5XSA9PT0gdW5kZWZpbmVkICYmICghcmVtb3ZlVmFsdWVzIHx8IHJlbW92ZVZhbHVlc1trZXldID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1trZXldID0gdGhpcy5faGlkZGVuVmFsdWVzW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZXMsIGRpcnR5LCByZW1vdmVWYWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tWYWxpZFN0YXR1cyhuZXdWYWx1ZXMpO1xuICAgIH0sXG5cbiAgICBvblN1YmZvcm1DaGFuZ2U6IGZ1bmN0aW9uIG9uU3ViZm9ybUNoYW5nZShuZXdWYWx1ZXMsIGRpcnR5LCByZW1vdmVWYWx1ZXMpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IF9weWRpb1V0aWxMYW5nMlsnZGVmYXVsdCddLm1lcmdlT2JqZWN0c1JlY3Vyc2l2ZSh0aGlzLmdldFZhbHVlcygpLCBuZXdWYWx1ZXMpO1xuICAgICAgICBpZiAocmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIHJlbW92ZVZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVWYWx1ZXMuaGFzT3duUHJvcGVydHkoaykgJiYgdmFsdWVzW2tdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbHVlc1trXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGRlblZhbHVlc1trXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5faGlkZGVuVmFsdWVzW2tdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub25DaGFuZ2UodmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKTtcbiAgICB9LFxuXG4gICAgb25TdWJmb3JtVmFsaWRTdGF0dXNDaGFuZ2U6IGZ1bmN0aW9uIG9uU3ViZm9ybVZhbGlkU3RhdHVzQ2hhbmdlKG5ld1ZhbGlkVmFsdWUsIGZhaWxlZE1hbmRhdG9yaWVzKSB7XG4gICAgICAgIGlmICgobmV3VmFsaWRWYWx1ZSAhPT0gdGhpcy5faW50ZXJuYWxWYWxpZCB8fCB0aGlzLnByb3BzLmZvcmNlVmFsaWRTdGF0dXNDaGVjaykgJiYgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UobmV3VmFsaWRWYWx1ZSwgZmFpbGVkTWFuZGF0b3JpZXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2ludGVybmFsVmFsaWQgPSBuZXdWYWxpZFZhbHVlO1xuICAgIH0sXG5cbiAgICBhcHBseUJ1dHRvbkFjdGlvbjogZnVuY3Rpb24gYXBwbHlCdXR0b25BY3Rpb24ocGFyYW1ldGVycywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24ocGFyYW1ldGVycywgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICAgIC8qXG4gICAgICAgIC8vIE9sZCB3YXlcbiAgICAgICAgcGFyYW1ldGVycyA9IExhbmdVdGlscy5tZXJnZU9iamVjdHNSZWN1cnNpdmUocGFyYW1ldGVycywgdGhpcy5nZXRWYWx1ZXNGb3JQT1NUKHRoaXMuZ2V0VmFsdWVzKCkpKTtcbiAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkucmVxdWVzdChwYXJhbWV0ZXJzLCBjYWxsYmFjayk7XG4gICAgICAgICovXG4gICAgfSxcblxuICAgIGdldFZhbHVlc0ZvclBPU1Q6IGZ1bmN0aW9uIGdldFZhbHVlc0ZvclBPU1QodmFsdWVzKSB7XG4gICAgICAgIHZhciBwcmVmaXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnRFJJVkVSX09QVElPTl8nIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIHJldHVybiBfbWFuYWdlck1hbmFnZXIyWydkZWZhdWx0J10uZ2V0VmFsdWVzRm9yUE9TVCh0aGlzLnByb3BzLnBhcmFtZXRlcnMsIHZhbHVlcywgcHJlZml4LCB0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGEpO1xuICAgIH0sXG5cbiAgICBjaGVja1ZhbGlkU3RhdHVzOiBmdW5jdGlvbiBjaGVja1ZhbGlkU3RhdHVzKHZhbHVlcykge1xuICAgICAgICB2YXIgZmFpbGVkTWFuZGF0b3JpZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcCgoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIGlmIChbJ3N0cmluZycsICd0ZXh0YXJlYScsICdwYXNzd29yZCcsICdpbnRlZ2VyJ10uaW5kZXhPZihwLnR5cGUpID4gLTEgJiYgKHAubWFuZGF0b3J5ID09PSBcInRydWVcIiB8fCBwLm1hbmRhdG9yeSA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcyB8fCAhdmFsdWVzLmhhc093blByb3BlcnR5KHAubmFtZSkgfHwgdmFsdWVzW3AubmFtZV0gPT09IHVuZGVmaW5lZCB8fCB2YWx1ZXNbcC5uYW1lXSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICBmYWlsZWRNYW5kYXRvcmllcy5wdXNoKHApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwLnR5cGUgPT09ICd2YWxpZC1wYXNzd29yZCcgJiYgdGhpcy5yZWZzWydmb3JtLWVsZW1lbnQtJyArIHAubmFtZV0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucmVmc1snZm9ybS1lbGVtZW50LScgKyBwLm5hbWVdLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICBmYWlsZWRNYW5kYXRvcmllcy5wdXNoKHApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHZhciBwcmV2aW91c1ZhbHVlID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmV3VmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHByZXZpb3VzVmFsdWUgPSB0aGlzLl9pbnRlcm5hbFZhbGlkOyAvLyh0aGlzLl9pbnRlcm5hbFZhbGlkICE9PSB1bmRlZmluZWQgPyB0aGlzLl9pbnRlcm5hbFZhbGlkIDogdHJ1ZSk7XG4gICAgICAgIG5ld1ZhbHVlID0gIWZhaWxlZE1hbmRhdG9yaWVzLmxlbmd0aDtcbiAgICAgICAgaWYgKChuZXdWYWx1ZSAhPT0gdGhpcy5faW50ZXJuYWxWYWxpZCB8fCB0aGlzLnByb3BzLmZvcmNlVmFsaWRTdGF0dXNDaGVjaykgJiYgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UobmV3VmFsdWUsIGZhaWxlZE1hbmRhdG9yaWVzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnRlcm5hbFZhbGlkID0gbmV3VmFsdWU7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5jaGVja1ZhbGlkU3RhdHVzKHRoaXMucHJvcHMudmFsdWVzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyR3JvdXBIZWFkZXI6IGZ1bmN0aW9uIHJlbmRlckdyb3VwSGVhZGVyKGdyb3VwTGFiZWwsIGFjY29yZGlvbml6ZSwgaW5kZXgsIGFjdGl2ZSkge1xuXG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0geyBrZXk6ICdncm91cC0nICsgZ3JvdXBMYWJlbCB9O1xuICAgICAgICBpZiAoYWNjb3JkaW9uaXplKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5jdXJyZW50QWN0aXZlR3JvdXAgPyB0aGlzLnN0YXRlLmN1cnJlbnRBY3RpdmVHcm91cCA6IG51bGw7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydjbGFzc05hbWUnXSA9ICdncm91cC1sYWJlbC0nICsgKGFjdGl2ZSA/ICdhY3RpdmUnIDogJ2luYWN0aXZlJyk7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydvbkNsaWNrJ10gPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXJyZW50QWN0aXZlR3JvdXA6IGN1cnJlbnQgIT09IGluZGV4ID8gaW5kZXggOiBudWxsIH0pO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGdyb3VwTGFiZWwgPSBbX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGtleTogJ3RvZ2dsZXInLCBjbGFzc05hbWU6IFwiZ3JvdXAtYWN0aXZlLXRvZ2dsZXIgaWNvbi1hbmdsZS1cIiArIChjdXJyZW50ID09PSBpbmRleCA/ICdkb3duJyA6ICdyaWdodCcpIH0pLCBncm91cExhYmVsXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnaCcgKyAoMyArIHRoaXMucHJvcHMuZGVwdGgpLCBwcm9wZXJ0aWVzLCBncm91cExhYmVsKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHZhciBhbGxHcm91cHMgPSBbXTtcbiAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMuZ2V0VmFsdWVzKCk7XG4gICAgICAgIHZhciBncm91cHNPcmRlcmVkID0gWydfX0RFRkFVTFRfXyddO1xuICAgICAgICBhbGxHcm91cHNbJ19fREVGQVVMVF9fJ10gPSB7IEZJRUxEUzogW10gfTtcbiAgICAgICAgdmFyIHJlcGxpY2F0aW9uR3JvdXBzID0ge307XG5cbiAgICAgICAgdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcCgoZnVuY3Rpb24gKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciB0eXBlID0gYXR0cmlidXRlc1sndHlwZSddO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2tpcEZpZWxkc1R5cGVzICYmIHRoaXMucHJvcHMuc2tpcEZpZWxkc1R5cGVzLmluZGV4T2YodHlwZSkgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwYXJhbU5hbWUgPSBhdHRyaWJ1dGVzWyduYW1lJ107XG4gICAgICAgICAgICB2YXIgZmllbGQ7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlc1snZ3JvdXBfc3dpdGNoX25hbWUnXSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGdyb3VwID0gYXR0cmlidXRlc1snZ3JvdXAnXSB8fCAnX19ERUZBVUxUX18nO1xuICAgICAgICAgICAgaWYgKCFhbGxHcm91cHNbZ3JvdXBdKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBzT3JkZXJlZC5wdXNoKGdyb3VwKTtcbiAgICAgICAgICAgICAgICBhbGxHcm91cHNbZ3JvdXBdID0geyBGSUVMRFM6IFtdLCBMQUJFTDogZ3JvdXAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlcEdyb3VwID0gYXR0cmlidXRlc1sncmVwbGljYXRpb25Hcm91cCddO1xuICAgICAgICAgICAgaWYgKHJlcEdyb3VwKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXJlcGxpY2F0aW9uR3JvdXBzW3JlcEdyb3VwXSkge1xuICAgICAgICAgICAgICAgICAgICByZXBsaWNhdGlvbkdyb3Vwc1tyZXBHcm91cF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBQQVJBTVM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgR1JPVVA6IGdyb3VwLFxuICAgICAgICAgICAgICAgICAgICAgICAgUE9TSVRJT046IGFsbEdyb3Vwc1tncm91cF0uRklFTERTLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBhbGxHcm91cHNbZ3JvdXBdLkZJRUxEUy5wdXNoKCdSRVBMSUNBVElPTjonICsgcmVwR3JvdXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDb3B5XG4gICAgICAgICAgICAgICAgdmFyIHJlcEF0dHIgPSBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS5kZWVwQ29weShhdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVwQXR0clsncmVwbGljYXRpb25Hcm91cCddO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXBBdHRyWydncm91cCddO1xuICAgICAgICAgICAgICAgIHJlcGxpY2F0aW9uR3JvdXBzW3JlcEdyb3VwXS5QQVJBTVMucHVzaChyZXBBdHRyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZS5pbmRleE9mKFwiZ3JvdXBfc3dpdGNoOlwiKSA9PT0gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX0dyb3VwU3dpdGNoUGFuZWwyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblN1YmZvcm1DaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbUF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB0aGlzLnByb3BzLnBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMucHJvcHMudmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNjcm9sbENhbGxiYWNrOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGltaXRUb0dyb3VwczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsaWRTdGF0dXNDaGFuZ2U6IHRoaXMub25TdWJmb3JtVmFsaWRTdGF0dXNDaGFuZ2VcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlc1sndHlwZSddICE9PSAnaGlkZGVuJykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWxwZXJNYXJrO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZXRIZWxwZXJEYXRhICYmIHRoaXMucHJvcHMuY2hlY2tIYXNIZWxwZXIgJiYgdGhpcy5wcm9wcy5jaGVja0hhc0hlbHBlcihhdHRyaWJ1dGVzWyduYW1lJ10sIHRoaXMucHJvcHMuaGVscGVyVGVzdEZvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzaG93SGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNldEhlbHBlckRhdGEoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbUF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0VmFsdWVzOiB0aGlzLmdldFZhbHVlc0ZvclBPU1QodmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlCdXR0b25BY3Rpb246IHRoaXMuYXBwbHlCdXR0b25BY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLnByb3BzLmhlbHBlclRlc3RGb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlbHBlck1hcmsgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnaWNvbi1xdWVzdGlvbi1zaWduJywgb25DbGljazogc2hvd0hlbHBlciB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFuZGF0b3J5TWlzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2xhc3NMZWdlbmQgPSBcImZvcm0tbGVnZW5kXCI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzWydlcnJvclRleHQnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NMZWdlbmQgPSBcImZvcm0tbGVnZW5kIG1hbmRhdG9yeS1taXNzaW5nXCI7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlc1snd2FybmluZ1RleHQnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NMZWdlbmQgPSBcImZvcm0tbGVnZW5kIHdhcm5pbmctbWVzc2FnZVwiO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddICYmIChhdHRyaWJ1dGVzWydtYW5kYXRvcnknXSA9PT0gXCJ0cnVlXCIgfHwgYXR0cmlidXRlc1snbWFuZGF0b3J5J10gPT09IHRydWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoWydzdHJpbmcnLCAndGV4dGFyZWEnLCAnaW1hZ2UnLCAnaW50ZWdlciddLmluZGV4T2YoYXR0cmlidXRlc1sndHlwZSddKSAhPT0gLTEgJiYgIXZhbHVlc1twYXJhbU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFuZGF0b3J5TWlzc2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NMZWdlbmQgPSBcImZvcm0tbGVnZW5kIG1hbmRhdG9yeS1taXNzaW5nXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwiZm9ybS1lbGVtZW50LVwiICsgcGFyYW1OYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogYXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZXNbcGFyYW1OYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUsIGFkZGl0aW9uYWxGb3JtRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm9uUGFyYW1ldGVyQ2hhbmdlKHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlLCBhZGRpdGlvbmFsRm9ybURhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkIHx8IGF0dHJpYnV0ZXNbJ3JlYWRvbmx5J10sXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZTogYXR0cmlidXRlc1snbXVsdGlwbGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmFyeV9jb250ZXh0OiB0aGlzLnByb3BzLmJpbmFyeV9jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheUNvbnRleHQ6ICdmb3JtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5QnV0dG9uQWN0aW9uOiB0aGlzLmFwcGx5QnV0dG9uQWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBtYW5kYXRvcnlNaXNzaW5nID8gcHlkaW8uTWVzc2FnZUhhc2hbJzYyMSddIDogYXR0cmlidXRlcy5lcnJvclRleHQgPyBhdHRyaWJ1dGVzLmVycm9yVGV4dCA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGtleTogcGFyYW1OYW1lLCBjbGFzc05hbWU6ICdmb3JtLWVudHJ5LScgKyBhdHRyaWJ1dGVzWyd0eXBlJ10gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXS5jcmVhdGVGb3JtRWxlbWVudChwcm9wcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogY2xhc3NMZWdlbmQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzWyd3YXJuaW5nVGV4dCddID8gYXR0cmlidXRlc1snd2FybmluZ1RleHQnXSA6IGF0dHJpYnV0ZXNbJ2Rlc2NyaXB0aW9uJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlbHBlck1hcmtcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hpZGRlblZhbHVlc1twYXJhbU5hbWVdID0gdmFsdWVzW3BhcmFtTmFtZV0gPT09IHVuZGVmaW5lZCA/IGF0dHJpYnV0ZXNbJ2RlZmF1bHQnXSA6IHZhbHVlc1twYXJhbU5hbWVdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICAgICAgICAgICAgICBhbGxHcm91cHNbZ3JvdXBdLkZJRUxEUy5wdXNoKGZpZWxkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgIGZvciAodmFyIHJHcm91cCBpbiByZXBsaWNhdGlvbkdyb3Vwcykge1xuICAgICAgICAgICAgaWYgKCFyZXBsaWNhdGlvbkdyb3Vwcy5oYXNPd25Qcm9wZXJ0eShyR3JvdXApKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgckdyb3VwRGF0YSA9IHJlcGxpY2F0aW9uR3JvdXBzW3JHcm91cF07XG4gICAgICAgICAgICBhbGxHcm91cHNbckdyb3VwRGF0YS5HUk9VUF0uRklFTERTW3JHcm91cERhdGEuUE9TSVRJT05dID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX1JlcGxpY2F0aW9uUGFuZWwyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcGxpY2F0aW9uLWdyb3VwLVwiICsgckdyb3VwRGF0YS5QQVJBTVNbMF0ubmFtZSxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblN1YmZvcm1DaGFuZ2UsXG4gICAgICAgICAgICAgICAgb25QYXJhbWV0ZXJDaGFuZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiB0aGlzLmdldFZhbHVlcygpLFxuICAgICAgICAgICAgICAgIGRlcHRoOiB0aGlzLnByb3BzLmRlcHRoICsgMSxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiByR3JvdXBEYXRhLlBBUkFNUyxcbiAgICAgICAgICAgICAgICBhcHBseUJ1dHRvbkFjdGlvbjogdGhpcy5hcHBseUJ1dHRvbkFjdGlvbixcbiAgICAgICAgICAgICAgICBvblNjcm9sbENhbGxiYWNrOiBudWxsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZ3JvdXBQYW5lcyA9IFtdO1xuICAgICAgICB2YXIgYWNjb3JkaW9uaXplID0gdGhpcy5wcm9wcy5hY2NvcmRpb25pemVJZkdyb3Vwc01vcmVUaGFuICYmIGdyb3Vwc09yZGVyZWQubGVuZ3RoID4gdGhpcy5wcm9wcy5hY2NvcmRpb25pemVJZkdyb3Vwc01vcmVUaGFuO1xuICAgICAgICB2YXIgY3VycmVudEFjdGl2ZUdyb3VwID0gdGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLmN1cnJlbnRBY3RpdmVHcm91cCA/IHRoaXMuc3RhdGUuY3VycmVudEFjdGl2ZUdyb3VwIDogMDtcbiAgICAgICAgZ3JvdXBzT3JkZXJlZC5tYXAoKGZ1bmN0aW9uIChnLCBnSW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmxpbWl0VG9Hcm91cHMgJiYgdGhpcy5wcm9wcy5saW1pdFRvR3JvdXBzLmluZGV4T2YoZykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhlYWRlcixcbiAgICAgICAgICAgICAgICBnRGF0YSA9IGFsbEdyb3Vwc1tnXTtcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSAncHlkaW8tZm9ybS1ncm91cCcsXG4gICAgICAgICAgICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoYWNjb3JkaW9uaXplKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlID0gY3VycmVudEFjdGl2ZUdyb3VwID09PSBnSW5kZXg7XG4gICAgICAgICAgICAgICAgaWYgKGdJbmRleCA9PT0gY3VycmVudEFjdGl2ZUdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnIGZvcm0tZ3JvdXAtYWN0aXZlJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgKz0gJyBmb3JtLWdyb3VwLWluYWN0aXZlJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWdEYXRhLkZJRUxEUy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ0RhdGEuTEFCRUwgJiYgISh0aGlzLnByb3BzLnNraXBGaWVsZHNUeXBlcyAmJiB0aGlzLnByb3BzLnNraXBGaWVsZHNUeXBlcy5pbmRleE9mKCdHcm91cEhlYWRlcicpID4gLTEpKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVyID0gdGhpcy5yZW5kZXJHcm91cEhlYWRlcihnRGF0YS5MQUJFTCwgYWNjb3JkaW9uaXplLCBnSW5kZXgsIGFjdGl2ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5kZXB0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnIHotZGVwdGgtMSc7XG4gICAgICAgICAgICAgICAgZ3JvdXBQYW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSwga2V5OiAncGFuZS0nICsgZyB9LFxuICAgICAgICAgICAgICAgICAgICBnSW5kZXggPT09IDAgJiYgdGhpcy5wcm9wcy5oZWFkZXIgPyB0aGlzLnByb3BzLmhlYWRlciA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBnRGF0YS5GSUVMRFNcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgZ0luZGV4ID09PSBncm91cHNPcmRlcmVkLmxlbmd0aCAtIDEgJiYgdGhpcy5wcm9wcy5mb290ZXIgPyB0aGlzLnByb3BzLmZvb3RlciA6IG51bGxcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBQYW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSwga2V5OiAncGFuZS0nICsgZyB9LFxuICAgICAgICAgICAgICAgICAgICBnSW5kZXggPT09IDAgJiYgdGhpcy5wcm9wcy5oZWFkZXIgPyB0aGlzLnByb3BzLmhlYWRlciA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBnRGF0YS5GSUVMRFNcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgZ0luZGV4ID09PSBncm91cHNPcmRlcmVkLmxlbmd0aCAtIDEgJiYgdGhpcy5wcm9wcy5mb290ZXIgPyB0aGlzLnByb3BzLmZvb3RlciA6IG51bGxcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmFkZGl0aW9uYWxQYW5lcykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3RoZXJQYW5lcyA9IHsgdG9wOiBbXSwgYm90dG9tOiBbXSB9O1xuICAgICAgICAgICAgICAgIHZhciBkZXB0aCA9IF90aGlzMi5wcm9wcy5kZXB0aDtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xuXG4gICAgICAgICAgICAgICAgdmFyIF9sb29wID0gZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvdGhlclBhbmVzLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2NvbnRpbnVlJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMyLnByb3BzLmFkZGl0aW9uYWxQYW5lc1trXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb3BzLmFkZGl0aW9uYWxQYW5lc1trXS5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVwdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXJQYW5lc1trXS5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3B5ZGlvLWZvcm0tZ3JvdXAgYWRkaXRpb25hbCcsIGtleTogJ290aGVyLXBhbmUtJyArIGluZGV4IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyUGFuZXNba10ucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdweWRpby1mb3JtLWdyb3VwIGFkZGl0aW9uYWwnLCBrZXk6ICdvdGhlci1wYW5lLScgKyBpbmRleCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gb3RoZXJQYW5lcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3JldDIgPSBfbG9vcChrKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX3JldDIgPT09ICdjb250aW51ZScpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBncm91cFBhbmVzID0gb3RoZXJQYW5lc1sndG9wJ10uY29uY2F0KGdyb3VwUGFuZXMpLmNvbmNhdChvdGhlclBhbmVzWydib3R0b20nXSk7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMudGFicykge1xuICAgICAgICAgICAgdmFyIF9yZXQzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gX3RoaXMyLnByb3BzLmNsYXNzTmFtZTtcbiAgICAgICAgICAgICAgICB2YXIgaW5pdGlhbFNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgdGFicyA9IF90aGlzMi5wcm9wcy50YWJzLm1hcCgoZnVuY3Rpb24gKHREZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdERlZlsnbGFiZWwnXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwcyA9IHREZWZbJ2dyb3VwcyddO1xuICAgICAgICAgICAgICAgICAgICBpZiAodERlZlsnc2VsZWN0ZWQnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFNlbGVjdGVkSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYW5lcyA9IGdyb3Vwcy5tYXAoZnVuY3Rpb24gKGdJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3VwUGFuZXNbZ0lkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBncm91cFBhbmVzW2dJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5UYWIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLm9uVGFiQ2hhbmdlID8gaSAtIDEgOiB1bmRlZmluZWQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAoY2xhc3NOYW1lID8gY2xhc3NOYW1lICsgJyAnIDogJyAnKSArICdweWRpby1mb3JtLXBhbmVsJyArIChwYW5lcy5sZW5ndGggJSAyID8gJyBmb3JtLXBhbmVsLW9kZCcgOiAnJykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMyKSk7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzMi5zdGF0ZS50YWJTZWxlY3RlZEluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFNlbGVjdGVkSW5kZXggPSBfdGhpczIuc3RhdGUudGFiU2VsZWN0ZWRJbmRleDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdjogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnbGF5b3V0LWZpbGwgdmVydGljYWwtbGF5b3V0IHRhYi12ZXJ0aWNhbC1sYXlvdXQnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5UYWJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVmOiAndGFicycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxTZWxlY3RlZEluZGV4OiBpbml0aWFsU2VsZWN0ZWRJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IF90aGlzMi5wcm9wcy5vblRhYkNoYW5nZSA/IGluaXRpYWxTZWxlY3RlZEluZGV4IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogX3RoaXMyLnByb3BzLm9uVGFiQ2hhbmdlID8gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHRhYlNlbGVjdGVkSW5kZXg6IGkgfSk7X3RoaXMyLnByb3BzLm9uVGFiQ2hhbmdlKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRDb250YWluZXJTdHlsZTogeyBmbGV4OiAxLCBvdmVyZmxvd1k6ICdhdXRvJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfcmV0MyA9PT0gJ29iamVjdCcpIHJldHVybiBfcmV0My52O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAodGhpcy5wcm9wcy5jbGFzc05hbWUgPyB0aGlzLnByb3BzLmNsYXNzTmFtZSArICcgJyA6ICcgJykgKyAncHlkaW8tZm9ybS1wYW5lbCcgKyAoZ3JvdXBQYW5lcy5sZW5ndGggJSAyID8gJyBmb3JtLXBhbmVsLW9kZCcgOiAnJyksIG9uU2Nyb2xsOiB0aGlzLnByb3BzLm9uU2Nyb2xsQ2FsbGJhY2sgfSxcbiAgICAgICAgICAgICAgICBncm91cFBhbmVzXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9Gb3JtUGFuZWwgPSByZXF1aXJlKCcuL0Zvcm1QYW5lbCcpO1xuXG52YXIgX0Zvcm1QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Gb3JtUGFuZWwpO1xuXG52YXIgX2ZpZWxkc0lucHV0U2VsZWN0Qm94ID0gcmVxdWlyZSgnLi4vZmllbGRzL0lucHV0U2VsZWN0Qm94Jyk7XG5cbnZhciBfZmllbGRzSW5wdXRTZWxlY3RCb3gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRTZWxlY3RCb3gpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgTGFuZ1V0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbi8qKlxuICogU3ViIGZvcm0gd2l0aCBhIHNlbGVjdG9yLCBzd2l0Y2hpbmcgaXRzIGZpZWxkcyBkZXBlbmRpbmdcbiAqIG9uIHRoZSBzZWxlY3RvciB2YWx1ZS5cbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnR3JvdXBTd2l0Y2hQYW5lbCcsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgcGFyYW1BdHRyaWJ1dGVzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIHBhcmFtZXRlcnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgICB2YWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgY29tcHV0ZVN1YlBhbmVsUGFyYW1ldGVyczogZnVuY3Rpb24gY29tcHV0ZVN1YlBhbmVsUGFyYW1ldGVycygpIHtcblxuICAgICAgICAvLyBDUkVBVEUgU1VCIEZPUk0gUEFORUxcbiAgICAgICAgLy8gR2V0IGFsbCB2YWx1ZXNcbiAgICAgICAgdmFyIHN3aXRjaE5hbWUgPSB0aGlzLnByb3BzLnBhcmFtQXR0cmlidXRlc1sndHlwZSddLnNwbGl0KFwiOlwiKS5wb3AoKTtcbiAgICAgICAgdmFyIHBhcmVudE5hbWUgPSB0aGlzLnByb3BzLnBhcmFtQXR0cmlidXRlc1snbmFtZSddO1xuICAgICAgICB2YXIgc3dpdGNoVmFsdWVzID0ge30sXG4gICAgICAgICAgICBwb3RlbnRpYWxTdWJTd2l0Y2hlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgICAgIGlmICghcFsnZ3JvdXBfc3dpdGNoX25hbWUnXSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHBbJ2dyb3VwX3N3aXRjaF9uYW1lJ10gIT0gc3dpdGNoTmFtZSkge1xuICAgICAgICAgICAgICAgIHBvdGVudGlhbFN1YlN3aXRjaGVzLnB1c2gocCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNydFN3aXRjaCA9IHBbJ2dyb3VwX3N3aXRjaF92YWx1ZSddO1xuICAgICAgICAgICAgaWYgKCFzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdID0ge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogcFsnZ3JvdXBfc3dpdGNoX2xhYmVsJ10sXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkczogW10sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczoge30sXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc0tleXM6IHt9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHAgPSBMYW5nVXRpbHMuZGVlcENvcHkocCk7XG4gICAgICAgICAgICBkZWxldGUgcFsnZ3JvdXBfc3dpdGNoX25hbWUnXTtcbiAgICAgICAgICAgIHBbJ25hbWUnXSA9IHBhcmVudE5hbWUgKyAnLycgKyBwWyduYW1lJ107XG4gICAgICAgICAgICB2YXIgdktleSA9IHBbJ25hbWUnXTtcbiAgICAgICAgICAgIHZhciBwYXJhbU5hbWUgPSB2S2V5O1xuICAgICAgICAgICAgaWYgKHN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdLmZpZWxkc0tleXNbcGFyYW1OYW1lXSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdLmZpZWxkcy5wdXNoKHApO1xuICAgICAgICAgICAgc3dpdGNoVmFsdWVzW2NydFN3aXRjaF0uZmllbGRzS2V5c1twYXJhbU5hbWVdID0gcGFyYW1OYW1lO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWVzICYmIHRoaXMucHJvcHMudmFsdWVzW3ZLZXldKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoVmFsdWVzW2NydFN3aXRjaF0udmFsdWVzW3BhcmFtTmFtZV0gPSB0aGlzLnByb3BzLnZhbHVlc1t2S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIC8vIFJlbWVyZ2UgcG90ZW50aWFsU3ViU3dpdGNoZXMgdG8gZWFjaCBwYXJhbWV0ZXJzIHNldFxuICAgICAgICBmb3IgKHZhciBrIGluIHN3aXRjaFZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHN3aXRjaFZhbHVlcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgIHZhciBzdiA9IHN3aXRjaFZhbHVlc1trXTtcbiAgICAgICAgICAgICAgICBzdi5maWVsZHMgPSBzdi5maWVsZHMuY29uY2F0KHBvdGVudGlhbFN1YlN3aXRjaGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzd2l0Y2hWYWx1ZXM7XG4gICAgfSxcblxuICAgIGNsZWFyU3ViUGFyYW1ldGVyc1ZhbHVlczogZnVuY3Rpb24gY2xlYXJTdWJQYXJhbWV0ZXJzVmFsdWVzKHBhcmVudE5hbWUsIG5ld1ZhbHVlLCBuZXdGaWVsZHMpIHtcbiAgICAgICAgdmFyIHZhbHMgPSBMYW5nVXRpbHMuZGVlcENvcHkodGhpcy5wcm9wcy52YWx1ZXMpO1xuICAgICAgICB2YXIgdG9SZW1vdmUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHMpIHtcbiAgICAgICAgICAgIGlmICh2YWxzLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5LmluZGV4T2YocGFyZW50TmFtZSArICcvJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0b1JlbW92ZVtrZXldID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFsc1twYXJlbnROYW1lXSA9IG5ld1ZhbHVlO1xuXG4gICAgICAgIG5ld0ZpZWxkcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIGlmIChwLnR5cGUgPT0gJ2hpZGRlbicgJiYgcFsnZGVmYXVsdCddICYmICFwWydncm91cF9zd2l0Y2hfbmFtZSddIHx8IHBbJ2dyb3VwX3N3aXRjaF9uYW1lJ10gPT0gcGFyZW50TmFtZSkge1xuICAgICAgICAgICAgICAgIHZhbHNbcFsnbmFtZSddXSA9IHBbJ2RlZmF1bHQnXTtcbiAgICAgICAgICAgICAgICBpZiAodG9SZW1vdmVbcFsnbmFtZSddXSAhPT0gdW5kZWZpbmVkKSBkZWxldGUgdG9SZW1vdmVbcFsnbmFtZSddXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocFsnbmFtZSddLmluZGV4T2YocGFyZW50TmFtZSArICcvJykgPT09IDAgJiYgcFsnZGVmYXVsdCddKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBbJ3R5cGUnXSAmJiBwWyd0eXBlJ10uc3RhcnRzV2l0aCgnZ3JvdXBfc3dpdGNoOicpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdmFsc1twWyduYW1lJ11dID0ge2dyb3VwX3N3aXRjaF92YWx1ZTpwWydkZWZhdWx0J119O1xuICAgICAgICAgICAgICAgICAgICB2YWxzW3BbJ25hbWUnXV0gPSBwWydkZWZhdWx0J107XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsc1twWyduYW1lJ11dID0gcFsnZGVmYXVsdCddO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFscywgdHJ1ZSwgdG9SZW1vdmUpO1xuICAgICAgICAvL3RoaXMub25QYXJhbWV0ZXJDaGFuZ2UocGFyZW50TmFtZSwgbmV3VmFsdWUpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UobmV3VmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWVzLCB0cnVlLCByZW1vdmVWYWx1ZXMpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSB0aGlzLnByb3BzLnBhcmFtQXR0cmlidXRlcztcbiAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMucHJvcHMudmFsdWVzO1xuXG4gICAgICAgIHZhciBwYXJhbU5hbWUgPSBhdHRyaWJ1dGVzWyduYW1lJ107XG4gICAgICAgIHZhciBzd2l0Y2hWYWx1ZXMgPSB0aGlzLmNvbXB1dGVTdWJQYW5lbFBhcmFtZXRlcnMoYXR0cmlidXRlcyk7XG4gICAgICAgIHZhciBzZWxlY3RvclZhbHVlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgT2JqZWN0LmtleXMoc3dpdGNoVmFsdWVzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHNlbGVjdG9yVmFsdWVzLnNldChrLCBzd2l0Y2hWYWx1ZXNba10ubGFiZWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHNlbGVjdG9yQ2hhbmdlciA9IChmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJTdWJQYXJhbWV0ZXJzVmFsdWVzKHBhcmFtTmFtZSwgbmV3VmFsdWUsIHN3aXRjaFZhbHVlc1tuZXdWYWx1ZV0gPyBzd2l0Y2hWYWx1ZXNbbmV3VmFsdWVdLmZpZWxkcyA6IFtdKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgdmFyIHN1YkZvcm0gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBzZWxlY3RvckxlZ2VuZCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHN1YkZvcm1IZWFkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBzZWxlY3RvciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX2ZpZWxkc0lucHV0U2VsZWN0Qm94MlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICBrZXk6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgIG5hbWU6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2dyb3VwLXN3aXRjaC1zZWxlY3RvcicsXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogcGFyYW1OYW1lLFxuICAgICAgICAgICAgICAgIGNob2ljZXM6IHNlbGVjdG9yVmFsdWVzLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBhdHRyaWJ1dGVzWydsYWJlbCddLFxuICAgICAgICAgICAgICAgIG1hbmRhdG9yeTogYXR0cmlidXRlc1snbWFuZGF0b3J5J11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVzW3BhcmFtTmFtZV0sXG4gICAgICAgICAgICBvbkNoYW5nZTogc2VsZWN0b3JDaGFuZ2VyLFxuICAgICAgICAgICAgZGlzcGxheUNvbnRleHQ6ICdmb3JtJyxcbiAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICAgICAgcmVmOiAnc3ViRm9ybVNlbGVjdG9yJ1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgaGVscGVyTWFyayA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc2V0SGVscGVyRGF0YSAmJiB0aGlzLnByb3BzLmNoZWNrSGFzSGVscGVyICYmIHRoaXMucHJvcHMuY2hlY2tIYXNIZWxwZXIoYXR0cmlidXRlc1snbmFtZSddLCB0aGlzLnByb3BzLmhlbHBlclRlc3RGb3IpKSB7XG4gICAgICAgICAgICB2YXIgc2hvd0hlbHBlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zZXRIZWxwZXJEYXRhKHsgcGFyYW1BdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLCB2YWx1ZXM6IHZhbHVlcyB9KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICBoZWxwZXJNYXJrID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnaWNvbi1xdWVzdGlvbi1zaWduJywgb25DbGljazogc2hvd0hlbHBlciB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGVjdG9yTGVnZW5kID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdmb3JtLWxlZ2VuZCcgfSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXNbJ2Rlc2NyaXB0aW9uJ10sXG4gICAgICAgICAgICAnICcsXG4gICAgICAgICAgICBoZWxwZXJNYXJrXG4gICAgICAgICk7XG4gICAgICAgIGlmICh2YWx1ZXNbcGFyYW1OYW1lXSAmJiBzd2l0Y2hWYWx1ZXNbdmFsdWVzW3BhcmFtTmFtZV1dKSB7XG4gICAgICAgICAgICBzdWJGb3JtSGVhZGVyID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnaDQnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVzW3BhcmFtTmFtZV1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBzdWJGb3JtID0gUmVhY3QuY3JlYXRlRWxlbWVudChfRm9ybVBhbmVsMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgb25QYXJhbWV0ZXJDaGFuZ2U6IHRoaXMucHJvcHMub25QYXJhbWV0ZXJDaGFuZ2UsXG4gICAgICAgICAgICAgICAgYXBwbHlCdXR0b25BY3Rpb246IHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24sXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgcmVmOiBwYXJhbU5hbWUgKyAnLVNVQicsXG4gICAgICAgICAgICAgICAga2V5OiBwYXJhbU5hbWUgKyAnLVNVQicsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnc3ViLWZvcm0nLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHN3aXRjaFZhbHVlc1t2YWx1ZXNbcGFyYW1OYW1lXV0uZmllbGRzLFxuICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGRlcHRoOiB0aGlzLnByb3BzLmRlcHRoICsgMSxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgICBjaGVja0hhc0hlbHBlcjogdGhpcy5wcm9wcy5jaGVja0hhc0hlbHBlcixcbiAgICAgICAgICAgICAgICBzZXRIZWxwZXJEYXRhOiB0aGlzLnByb3BzLnNldEhlbHBlckRhdGEsXG4gICAgICAgICAgICAgICAgaGVscGVyVGVzdEZvcjogdmFsdWVzW3BhcmFtTmFtZV0sXG4gICAgICAgICAgICAgICAgYWNjb3JkaW9uaXplSWZHcm91cHNNb3JlVGhhbjogNVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc3ViLWZvcm0tZ3JvdXAnIH0sXG4gICAgICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgICAgIHNlbGVjdG9yTGVnZW5kLFxuICAgICAgICAgICAgc3ViRm9ybVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9Gb3JtUGFuZWwgPSByZXF1aXJlKCcuL0Zvcm1QYW5lbCcpO1xuXG52YXIgX0Zvcm1QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Gb3JtUGFuZWwpO1xuXG52YXIgVVBfQVJST1cgPSAnbWRpIG1kaS1jaGV2cm9uLXVwJztcbnZhciBET1dOX0FSUk9XID0gJ21kaSBtZGktY2hldnJvbi1kb3duJztcbnZhciBSRU1PVkUgPSAnbWRpIG1kaS1jbG9zZSc7XG52YXIgQUREX1ZBTFVFID0gJ21kaSBtZGktcGx1cyc7XG5cbnZhciBSZXBsaWNhdGVkR3JvdXAgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUmVwbGljYXRlZEdyb3VwLCBfQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFJlcGxpY2F0ZWRHcm91cChwcm9wcywgY29udGV4dCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVwbGljYXRlZEdyb3VwKTtcblxuICAgICAgICBfQ29tcG9uZW50LmNhbGwodGhpcywgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB2YXIgc3ViVmFsdWVzID0gcHJvcHMuc3ViVmFsdWVzO1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9IHByb3BzLnBhcmFtZXRlcnM7XG5cbiAgICAgICAgdmFyIGZpcnN0UGFyYW0gPSBwYXJhbWV0ZXJzWzBdO1xuICAgICAgICB2YXIgaW5zdGFuY2VWYWx1ZSA9IHN1YlZhbHVlc1tmaXJzdFBhcmFtWyduYW1lJ11dIHx8ICcnO1xuICAgICAgICB0aGlzLnN0YXRlID0geyB0b2dnbGVkOiAhaW5zdGFuY2VWYWx1ZSB9O1xuICAgIH1cblxuICAgIFJlcGxpY2F0ZWRHcm91cC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgZGVwdGggPSBfcHJvcHMuZGVwdGg7XG4gICAgICAgIHZhciBvblN3YXBVcCA9IF9wcm9wcy5vblN3YXBVcDtcbiAgICAgICAgdmFyIG9uU3dhcERvd24gPSBfcHJvcHMub25Td2FwRG93bjtcbiAgICAgICAgdmFyIG9uUmVtb3ZlID0gX3Byb3BzLm9uUmVtb3ZlO1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9IF9wcm9wcy5wYXJhbWV0ZXJzO1xuICAgICAgICB2YXIgc3ViVmFsdWVzID0gX3Byb3BzLnN1YlZhbHVlcztcbiAgICAgICAgdmFyIGRpc2FibGVkID0gX3Byb3BzLmRpc2FibGVkO1xuICAgICAgICB2YXIgb25BZGRWYWx1ZSA9IF9wcm9wcy5vbkFkZFZhbHVlO1xuICAgICAgICB2YXIgdG9nZ2xlZCA9IHRoaXMuc3RhdGUudG9nZ2xlZDtcblxuICAgICAgICB2YXIgdW5pcXVlID0gcGFyYW1ldGVycy5sZW5ndGggPT09IDE7XG4gICAgICAgIHZhciBmaXJzdFBhcmFtID0gcGFyYW1ldGVyc1swXTtcbiAgICAgICAgdmFyIGluc3RhbmNlVmFsdWUgPSBzdWJWYWx1ZXNbZmlyc3RQYXJhbVsnbmFtZSddXSB8fCBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsMC4zMyknIH0gfSxcbiAgICAgICAgICAgICdFbXB0eSBWYWx1ZSdcbiAgICAgICAgKTtcbiAgICAgICAgdmFyIGliU3R5bGVzID0geyB3aWR0aDogMzYsIGhlaWdodDogMzYsIHBhZGRpbmc6IDYgfTtcblxuICAgICAgICBpZiAodW5pcXVlKSB7XG4gICAgICAgICAgICB2YXIgZGlzU3R5bGUgPSB7IG9wYWNpdHk6IC4zIH07XG4gICAgICAgICAgICB2YXIgcmVtU3R5bGUgPSAhISFvblJlbW92ZSB8fCBkaXNhYmxlZCA/IGRpc1N0eWxlIDoge307XG4gICAgICAgICAgICB2YXIgdXBTdHlsZSA9ICEhIW9uU3dhcFVwIHx8IGRpc2FibGVkID8gZGlzU3R5bGUgOiB7fTtcbiAgICAgICAgICAgIHZhciBkb3duU3R5bGUgPSAhISFvblN3YXBEb3duIHx8IGRpc2FibGVkID8gZGlzU3R5bGUgOiB7fTtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCB3aWR0aDogJzEwMCUnIH0gfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfRm9ybVBhbmVsMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczogc3ViVmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdyZXBsaWNhYmxlLXVuaXF1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogLTEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiAwIH1cbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZvbnRTaXplOiAyNCwgcGFkZGluZ0xlZnQ6IDQsIHBhZGRpbmdUb3A6IDIgfSB9LFxuICAgICAgICAgICAgICAgICAgICBvbkFkZFZhbHVlICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogQUREX1ZBTFVFLCBzdHlsZTogeyBwYWRkaW5nOiAnOHB4IDRweCcsIGN1cnNvcjogJ3BvaW50ZXInIH0sIG9uQ2xpY2s6IG9uQWRkVmFsdWUgfSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiBSRU1PVkUsIHN0eWxlOiBfZXh0ZW5kcyh7IHBhZGRpbmc6ICc4cHggNHB4JywgY3Vyc29yOiAncG9pbnRlcicgfSwgcmVtU3R5bGUpLCBvbkNsaWNrOiBvblJlbW92ZSB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIHBhZGRpbmc6ICcwIDRweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6IFVQX0FSUk9XLCBzdHlsZTogX2V4dGVuZHMoeyBoZWlnaHQ6IDE2LCBjdXJzb3I6ICdwb2ludGVyJyB9LCB1cFN0eWxlKSwgb25DbGljazogb25Td2FwVXAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogRE9XTl9BUlJPVywgc3R5bGU6IF9leHRlbmRzKHsgaGVpZ2h0OiAxNiwgY3Vyc29yOiAncG9pbnRlcicgfSwgZG93blN0eWxlKSwgb25DbGljazogb25Td2FwRG93biB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICB7IHpEZXB0aDogMCwgc3R5bGU6IHsgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlc21va2UnLCBtYXJnaW5Cb3R0b206IDggfSB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktbWVudS0nICsgKHRoaXMuc3RhdGUudG9nZ2xlZCA/ICdkb3duJyA6ICdyaWdodCcpLCBpY29uU3R5bGU6IHsgY29sb3I6ICdyZ2JhKDAsMCwwLC4xNSknIH0sIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHRvZ2dsZWQ6ICFfdGhpcy5zdGF0ZS50b2dnbGVkIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZm9udFNpemU6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VWYWx1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG9uQWRkVmFsdWUgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IHN0eWxlOiBpYlN0eWxlcywgaWNvbkNsYXNzTmFtZTogQUREX1ZBTFVFLCBvblRvdWNoVGFwOiBvbkFkZFZhbHVlIH0pLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IGliU3R5bGVzLCBpY29uQ2xhc3NOYW1lOiBSRU1PVkUsIG9uVG91Y2hUYXA6IG9uUmVtb3ZlLCBkaXNhYmxlZDogISEhb25SZW1vdmUgfHwgZGlzYWJsZWQgfSksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBzdHlsZTogaWJTdHlsZXMsIGljb25DbGFzc05hbWU6IFVQX0FSUk9XLCBvblRvdWNoVGFwOiBvblN3YXBVcCwgZGlzYWJsZWQ6ICEhIW9uU3dhcFVwIHx8IGRpc2FibGVkIH0pLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IGliU3R5bGVzLCBpY29uQ2xhc3NOYW1lOiBET1dOX0FSUk9XLCBvblRvdWNoVGFwOiBvblN3YXBEb3duLCBkaXNhYmxlZDogISEhb25Td2FwRG93biB8fCBkaXNhYmxlZCB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICB0b2dnbGVkICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX0Zvcm1QYW5lbDJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgICAgICAgICB0YWJzOiBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlczogc3ViVmFsdWVzLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBudWxsLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3JlcGxpY2FibGUtZ3JvdXAnLFxuICAgICAgICAgICAgICAgIGRlcHRoOiAtMVxuICAgICAgICAgICAgfSkpXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHJldHVybiBSZXBsaWNhdGVkR3JvdXA7XG59KShfcmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUmVwbGljYXRlZEdyb3VwO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX1JlcGxpY2F0ZWRHcm91cCA9IHJlcXVpcmUoJy4vUmVwbGljYXRlZEdyb3VwJyk7XG5cbnZhciBfUmVwbGljYXRlZEdyb3VwMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1JlcGxpY2F0ZWRHcm91cCk7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBJY29uQnV0dG9uID0gX3JlcXVpcmUuSWNvbkJ1dHRvbjtcblxudmFyIExhbmdVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xuXG4vKipcbiAqIFN1YiBmb3JtIHJlcGxpY2F0aW5nIGl0c2VsZiAoKy8tKVxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdSZXBsaWNhdGlvblBhbmVsJyxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBwYXJhbWV0ZXJzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgdmFsdWVzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBvbkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgYmluYXJ5X2NvbnRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGRlcHRoOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyXG4gICAgfSxcblxuICAgIGJ1aWxkU3ViVmFsdWU6IGZ1bmN0aW9uIGJ1aWxkU3ViVmFsdWUodmFsdWVzKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgdmFyIHN1YlZhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIHN1ZmZpeCA9IGluZGV4ID09IDAgPyAnJyA6ICdfJyArIGluZGV4O1xuICAgICAgICB0aGlzLnByb3BzLnBhcmFtZXRlcnMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICB2YXIgcE5hbWUgPSBwWyduYW1lJ107XG4gICAgICAgICAgICBpZiAodmFsdWVzW3BOYW1lICsgc3VmZml4XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdWJWYWwpIHN1YlZhbCA9IHt9O1xuICAgICAgICAgICAgICAgIHN1YlZhbFtwTmFtZV0gPSB2YWx1ZXNbcE5hbWUgKyBzdWZmaXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHN1YlZhbCB8fCBmYWxzZTtcbiAgICB9LFxuXG4gICAgaW5kZXhlZFZhbHVlczogZnVuY3Rpb24gaW5kZXhlZFZhbHVlcyhyb3dzQXJyYXkpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIHZhbHVlcyA9IHt9O1xuICAgICAgICByb3dzQXJyYXkubWFwKGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgIHZhciBzdWZmaXggPSBpbmRleCA9PSAwID8gJycgOiAnXycgKyBpbmRleDtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcm93KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyb3cuaGFzT3duUHJvcGVydHkocCkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHZhbHVlc1twICsgc3VmZml4XSA9IHJvd1twXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgIH0sXG5cbiAgICBpbmRleFZhbHVlczogZnVuY3Rpb24gaW5kZXhWYWx1ZXMocm93c0FycmF5LCByZW1vdmVMYXN0Um93KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGluZGV4ZWQgPSB0aGlzLmluZGV4ZWRWYWx1ZXMocm93c0FycmF5KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGlmIChyZW1vdmVMYXN0Um93KSB7XG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RSb3cgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRJbmRleCA9IHJvd3NBcnJheS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFJvd1twWyduYW1lJ10gKyAobmV4dEluZGV4ID4gMCA/ICdfJyArIG5leHRJbmRleCA6ICcnKV0gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLm9uQ2hhbmdlKGluZGV4ZWQsIHRydWUsIGxhc3RSb3cpO1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoaW5kZXhlZCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5zdGFuY2VzOiBmdW5jdGlvbiBpbnN0YW5jZXMoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIC8vIEFuYWx5emUgY3VycmVudCB2YWx1ZSB0byBncmFiIG51bWJlciBvZiByb3dzLlxuICAgICAgICB2YXIgcm93cyA9IFtdLFxuICAgICAgICAgICAgc3ViVmFsID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoc3ViVmFsID0gdGhpcy5idWlsZFN1YlZhbHVlKHRoaXMucHJvcHMudmFsdWVzLCBpbmRleCkpIHtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICByb3dzLnB1c2goc3ViVmFsKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZmlyc3RQYXJhbSA9IHRoaXMucHJvcHMucGFyYW1ldGVyc1swXTtcbiAgICAgICAgaWYgKCFyb3dzLmxlbmd0aCAmJiBmaXJzdFBhcmFtWydyZXBsaWNhdGlvbk1hbmRhdG9yeSddID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVtcHR5VmFsdWUgPSB7fTtcbiAgICAgICAgICAgICAgICBfdGhpczIucHJvcHMucGFyYW1ldGVycy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgZW1wdHlWYWx1ZVtwWyduYW1lJ11dID0gcFsnZGVmYXVsdCddIHx8ICcnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJvd3MucHVzaChlbXB0eVZhbHVlKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJvd3M7XG4gICAgfSxcblxuICAgIGFkZFJvdzogZnVuY3Rpb24gYWRkUm93KCkge1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSB7fSxcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZXMgPSB0aGlzLmluc3RhbmNlcygpO1xuICAgICAgICB0aGlzLnByb3BzLnBhcmFtZXRlcnMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZVtwWyduYW1lJ11dID0gcFsnZGVmYXVsdCddIHx8ICcnO1xuICAgICAgICB9KTtcbiAgICAgICAgY3VycmVudFZhbHVlcy5wdXNoKG5ld1ZhbHVlKTtcbiAgICAgICAgdGhpcy5pbmRleFZhbHVlcyhjdXJyZW50VmFsdWVzKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlUm93OiBmdW5jdGlvbiByZW1vdmVSb3coaW5kZXgpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlcyA9IHRoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgIHZhciByZW1vdmVJbnN0ID0gaW5zdGFuY2VzW2luZGV4XTtcbiAgICAgICAgaW5zdGFuY2VzID0gTGFuZ1V0aWxzLmFycmF5V2l0aG91dCh0aGlzLmluc3RhbmNlcygpLCBpbmRleCk7XG4gICAgICAgIGluc3RhbmNlcy5wdXNoKHJlbW92ZUluc3QpO1xuICAgICAgICB0aGlzLmluZGV4VmFsdWVzKGluc3RhbmNlcywgdHJ1ZSk7XG4gICAgfSxcblxuICAgIHN3YXBSb3dzOiBmdW5jdGlvbiBzd2FwUm93cyhpLCBqKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZXMgPSB0aGlzLmluc3RhbmNlcygpO1xuICAgICAgICB2YXIgdG1wID0gaW5zdGFuY2VzW2pdO1xuICAgICAgICBpbnN0YW5jZXNbal0gPSBpbnN0YW5jZXNbaV07XG4gICAgICAgIGluc3RhbmNlc1tpXSA9IHRtcDtcbiAgICAgICAgdGhpcy5pbmRleFZhbHVlcyhpbnN0YW5jZXMpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UoaW5kZXgsIG5ld1ZhbHVlcywgZGlydHkpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlcyA9IHRoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgIGluc3RhbmNlc1tpbmRleF0gPSBuZXdWYWx1ZXM7XG4gICAgICAgIHRoaXMuaW5kZXhWYWx1ZXMoaW5zdGFuY2VzKTtcbiAgICB9LFxuXG4gICAgb25QYXJhbWV0ZXJDaGFuZ2U6IGZ1bmN0aW9uIG9uUGFyYW1ldGVyQ2hhbmdlKGluZGV4LCBwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgaW5zdGFuY2VzW2luZGV4XVtwYXJhbU5hbWVdID0gbmV3VmFsdWU7XG4gICAgICAgIHRoaXMuaW5kZXhWYWx1ZXMoaW5zdGFuY2VzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9IF9wcm9wcy5wYXJhbWV0ZXJzO1xuICAgICAgICB2YXIgZGlzYWJsZWQgPSBfcHJvcHMuZGlzYWJsZWQ7XG5cbiAgICAgICAgdmFyIGZpcnN0UGFyYW0gPSBwYXJhbWV0ZXJzWzBdO1xuICAgICAgICB2YXIgcmVwbGljYXRpb25UaXRsZSA9IGZpcnN0UGFyYW1bJ3JlcGxpY2F0aW9uVGl0bGUnXSB8fCBmaXJzdFBhcmFtWydsYWJlbCddO1xuICAgICAgICB2YXIgcmVwbGljYXRpb25EZXNjcmlwdGlvbiA9IGZpcnN0UGFyYW1bJ3JlcGxpY2F0aW9uRGVzY3JpcHRpb24nXSB8fCBmaXJzdFBhcmFtWydkZXNjcmlwdGlvbiddO1xuICAgICAgICB2YXIgcmVwbGljYXRpb25NYW5kYXRvcnkgPSBmaXJzdFBhcmFtWydyZXBsaWNhdGlvbk1hbmRhdG9yeSddID09PSAndHJ1ZSc7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlcyA9IHRoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgIHZhciBtdWx0aXBsZVJvd3MgPSBpbnN0YW5jZXMubGVuZ3RoID4gMTtcbiAgICAgICAgdmFyIG11bHRpcGxlUGFyYW1zID0gcGFyYW1ldGVycy5sZW5ndGggPiAxO1xuICAgICAgICB2YXIgcm93cyA9IGluc3RhbmNlcy5tYXAoZnVuY3Rpb24gKHN1YlZhbHVlcywgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBvblN3YXBVcCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBvblN3YXBEb3duID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG9uUmVtb3ZlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIG9uUGFyYW1ldGVyQ2hhbmdlID0gZnVuY3Rpb24gb25QYXJhbWV0ZXJDaGFuZ2UocGFyYW1OYW1lLCBuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczMub25QYXJhbWV0ZXJDaGFuZ2UoaW5kZXgsIHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobXVsdGlwbGVSb3dzICYmIGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIG9uU3dhcFVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc3dhcFJvd3MoaW5kZXgsIGluZGV4IC0gMSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtdWx0aXBsZVJvd3MgJiYgaW5kZXggPCBpbnN0YW5jZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIG9uU3dhcERvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5zd2FwUm93cyhpbmRleCwgaW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG11bHRpcGxlUm93cyB8fCAhcmVwbGljYXRpb25NYW5kYXRvcnkpIHtcbiAgICAgICAgICAgICAgICBvblJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbW92ZVJvdyhpbmRleCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwcm9wcyA9IHsgb25Td2FwVXA6IG9uU3dhcFVwLCBvblN3YXBEb3duOiBvblN3YXBEb3duLCBvblJlbW92ZTogb25SZW1vdmUsIG9uUGFyYW1ldGVyQ2hhbmdlOiBvblBhcmFtZXRlckNoYW5nZSB9O1xuICAgICAgICAgICAgaWYgKHJlcGxpY2F0aW9uTWFuZGF0b3J5ICYmIGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMub25BZGRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMy5hZGRSb3coKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX1JlcGxpY2F0ZWRHcm91cDJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoeyBrZXk6IGluZGV4IH0sIF90aGlzMy5wcm9wcywgcHJvcHMsIHsgc3ViVmFsdWVzOiBzdWJWYWx1ZXMgfSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVwbGljYXRpb25NYW5kYXRvcnkpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncmVwbGljYWJsZS1maWVsZCcsIHN0eWxlOiB7IG1hcmdpbkJvdHRvbTogMTQgfSB9LFxuICAgICAgICAgICAgICAgIHJvd3NcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdFN0eWxlID0gcm93cy5sZW5ndGggPyB7fSA6IHsgYmFja2dyb3VuZENvbG9yOiAnd2hpdGVzbW9rZScsIGJvcmRlclJhZGl1czogNCB9O1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdyZXBsaWNhYmxlLWZpZWxkJywgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxNCB9IH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9LCB0U3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7IGtleTogJ2FkZCcsIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLXBsdXMtYm94LW91dGxpbmUnLCB0b29sdGlwUG9zaXRpb246IFwidG9wLXJpZ2h0XCIsIHN0eWxlOiB7IGhlaWdodDogMzYsIHdpZHRoOiAzNiwgcGFkZGluZzogNiB9LCBpY29uU3R5bGU6IHsgZm9udFNpemU6IDI0IH0sIHRvb2x0aXA6ICdBZGQgdmFsdWUnLCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLmFkZFJvdygpO1xuICAgICAgICAgICAgICAgICAgICB9LCBkaXNhYmxlZDogZGlzYWJsZWQgfSksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndGl0bGUnLCBzdHlsZTogeyBmb250U2l6ZTogMTYsIGZsZXg6IDEgfSB9LFxuICAgICAgICAgICAgICAgICAgICByZXBsaWNhdGlvblRpdGxlXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHJvd3NcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iXX0=

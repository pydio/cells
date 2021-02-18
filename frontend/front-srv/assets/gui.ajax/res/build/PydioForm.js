(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioForm = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require("material-ui");

var _TextField = require("./TextField");

var _TextField2 = _interopRequireDefault(_TextField);

var AltText = (function (_React$Component) {
    _inherits(AltText, _React$Component);

    function AltText() {
        _classCallCheck(this, AltText);

        _React$Component.apply(this, arguments);
    }

    AltText.prototype.render = function render() {
        var _props = this.props;
        var attributes = _props.attributes;
        var _props$altIcon = _props.altIcon;
        var altIcon = _props$altIcon === undefined ? "mdi mdi-toggle-switch" : _props$altIcon;
        var _props$altIconText = _props.altIconText;
        var altIconText = _props$altIconText === undefined ? "mdi mdi-textbox" : _props$altIconText;
        var _props$altTip = _props.altTip;
        var altTip = _props$altTip === undefined ? "Switch to text version" : _props$altTip;
        var onAltTextSwitch = _props.onAltTextSwitch;

        var comp = undefined;
        var alternativeText = attributes.alternativeText;

        if (alternativeText) {
            comp = _react2["default"].createElement(_TextField2["default"], this.props);
        } else {
            comp = this.props.children;
        }
        return _react2["default"].createElement(
            "div",
            { style: { display: 'flex' } },
            _react2["default"].createElement(
                "div",
                { style: { flex: 1 } },
                comp
            ),
            _react2["default"].createElement(
                "div",
                null,
                _react2["default"].createElement(_materialUi.IconButton, {
                    iconClassName: alternativeText ? altIcon : altIconText,
                    title: altTip,
                    onTouchTap: function () {
                        return onAltTextSwitch(attributes["name"], !alternativeText);
                    },
                    iconStyle: { opacity: .3, fontSize: 20 },
                    style: { padding: '14px 8px', width: 42, height: 42 }
                })
            )
        );
    };

    return AltText;
})(_react2["default"].Component);

exports["default"] = AltText;

var test = function test(Component) {
    var wrapped = (function (_React$Component2) {
        _inherits(wrapped, _React$Component2);

        function wrapped() {
            _classCallCheck(this, wrapped);

            _React$Component2.apply(this, arguments);
        }

        wrapped.prototype.render = function render() {
            var _props2 = this.props;
            var attributes = _props2.attributes;
            var _props2$altIcon = _props2.altIcon;
            var altIcon = _props2$altIcon === undefined ? "mdi mdi-toggle-switch" : _props2$altIcon;
            var _props2$altIconText = _props2.altIconText;
            var altIconText = _props2$altIconText === undefined ? "mdi mdi-textbox" : _props2$altIconText;
            var _props2$altTip = _props2.altTip;
            var altTip = _props2$altTip === undefined ? "Switch" : _props2$altTip;
            var onAltTextSwitch = _props2.onAltTextSwitch;

            var comp = undefined;
            var alternativeText = attributes.alternativeText;

            if (alternativeText) {
                comp = _react2["default"].createElement(_TextField2["default"], this.props);
            } else {
                comp = _react2["default"].createElement(Component, this.props);
            }
            return _react2["default"].createElement(
                "div",
                { style: { display: 'flex' } },
                _react2["default"].createElement(
                    "div",
                    { style: { flex: 1 } },
                    comp
                ),
                _react2["default"].createElement(
                    "div",
                    null,
                    _react2["default"].createElement(_materialUi.IconButton, {
                        iconClassName: alternativeText ? altIcon : altIconText,
                        tooltip: altTip,
                        onTouchTap: function () {
                            return onAltTextSwitch(attributes["name"], !alternativeText);
                        }
                    })
                )
            );
        };

        return wrapped;
    })(_react2["default"].Component);

    return wrapped;
};
module.exports = exports["default"];

},{"./TextField":9,"material-ui":"material-ui","react":"react"}],2:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var _hocWithChoices = require('../hoc/withChoices');

var _hocWithChoices2 = _interopRequireDefault(_hocWithChoices);

var React = require('react');

var _require = require('material-ui');

var AutoComplete = _require.AutoComplete;
var MenuItem = _require.MenuItem;
var RefreshIndicator = _require.RefreshIndicator;

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernStyles = _Pydio$requireLib.ModernStyles;

var AutocompleteBox = (function (_React$Component) {
    _inherits(AutocompleteBox, _React$Component);

    function AutocompleteBox() {
        _classCallCheck(this, AutocompleteBox);

        _React$Component.apply(this, arguments);
    }

    AutocompleteBox.prototype.handleUpdateInput = function handleUpdateInput(searchText) {
        //this.setState({searchText: searchText});
    };

    AutocompleteBox.prototype.handleNewRequest = function handleNewRequest(chosenValue) {
        if (chosenValue.key === undefined) {
            this.props.onChange(null, chosenValue);
        } else {
            this.props.onChange(null, chosenValue.key);
        }
    };

    AutocompleteBox.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var choices = _props.choices;
        var isDisplayGrid = _props.isDisplayGrid;
        var editMode = _props.editMode;
        var disabled = _props.disabled;
        var toggleEditMode = _props.toggleEditMode;

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

        var value = this.props.value;

        if (labels && labels[value]) {
            value = labels[value];
        }

        if (isDisplayGrid() && !editMode || disabled) {
            if (choices.get(value)) {
                value = choices.get(value);
            }
            return React.createElement(
                'div',
                {
                    onClick: disabled ? function () {} : toggleEditMode,
                    className: value ? '' : 'paramValue-empty' },
                value ? value : 'Empty',
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
                searchText: value,
                onUpdateInput: function (s) {
                    return _this.handleUpdateInput(s);
                },
                onNewRequest: function (v) {
                    return _this.handleNewRequest(v);
                },
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
    };

    return AutocompleteBox;
})(React.Component);

exports['default'] = AutocompleteBox = _hocAsFormField2['default'](AutocompleteBox);
exports['default'] = AutocompleteBox = _hocWithChoices2['default'](AutocompleteBox);
exports['default'] = AutocompleteBox;
module.exports = exports['default'];

},{"../hoc/asFormField":12,"../hoc/withChoices":13,"material-ui":"material-ui","pydio":"pydio","react":"react"}],3:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var React = require('react');

var debounce = require('lodash.debounce');

var _require = require('material-ui');

var AutoComplete = _require.AutoComplete;
var MenuItem = _require.MenuItem;
var RefreshIndicator = _require.RefreshIndicator;
var FontIcon = _require.FontIcon;

var AutocompleteTree = (function (_React$Component) {
    _inherits(AutocompleteTree, _React$Component);

    function AutocompleteTree() {
        _classCallCheck(this, AutocompleteTree);

        _React$Component.apply(this, arguments);
    }

    AutocompleteTree.prototype.handleUpdateInput = function handleUpdateInput(searchText) {
        this.debounced();
        this.setState({ searchText: searchText });
    };

    AutocompleteTree.prototype.handleNewRequest = function handleNewRequest(chosenValue) {
        var key = undefined;
        if (chosenValue.key === undefined) {
            key = chosenValue;
        } else {
            key = chosenValue.key;
        }
        this.props.onChange(null, key);
        this.loadValues(key);
    };

    AutocompleteTree.prototype.componentWillMount = function componentWillMount() {
        this.debounced = debounce(this.loadValues.bind(this), 300);
        this.lastSearch = null;
        var value = "";
        if (this.props.value) {
            value = this.props.value;
        }
        this.loadValues(value);
    };

    AutocompleteTree.prototype.loadValues = function loadValues() {
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
    };

    AutocompleteTree.prototype.render = function render() {

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
                onUpdateInput: this.handleUpdateInput.bind(this),
                onNewRequest: this.handleNewRequest.bind(this),
                dataSource: dataSource,
                floatingLabelText: this.props.attributes['label'],
                filter: function (searchText, key) {
                    return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
                },
                openOnFocus: true,
                menuProps: { maxHeight: 200 }
            })
        );
    };

    return AutocompleteTree;
})(React.Component);

exports['default'] = _hocAsFormField2['default'](AutocompleteTree);
module.exports = exports['default'];

},{"../hoc/asFormField":12,"lodash.debounce":"lodash.debounce","material-ui":"material-ui","react":"react"}],4:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

/**
 * UI to drop a file (or click to browse), used by the InputImage component.
 */

var FileDropzone = (function (_React$Component) {
    _inherits(FileDropzone, _React$Component);

    function FileDropzone(props) {
        _classCallCheck(this, FileDropzone);

        _React$Component.call(this, _extends({ onDrop: function onDrop() {} }, props));
        this.state = {
            isDragActive: false,
            supportClick: props.supportClick === undefined ? true : props.supportClick,
            multiple: props.multiple === undefined ? true : props.multiple
        };
    }

    // propTypes: {
    //     onDrop          : React.PropTypes.func.isRequired,
    //     ignoreNativeDrop: React.PropTypes.bool,
    //     size            : React.PropTypes.number,
    //     style           : React.PropTypes.object,
    //     dragActiveStyle : React.PropTypes.object,
    //     supportClick    : React.PropTypes.bool,
    //     accept          : React.PropTypes.string,
    //     multiple        : React.PropTypes.bool
    // },

    FileDropzone.prototype.onDragLeave = function onDragLeave(e) {
        this.setState({
            isDragActive: false
        });
    };

    FileDropzone.prototype.onDragOver = function onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";

        this.setState({
            isDragActive: true
        });
    };

    FileDropzone.prototype.onFilePicked = function onFilePicked(e) {
        if (!e.target || !e.target.files) {
            return;
        }
        var files = e.target.files;
        var maxFiles = this.state.multiple ? files.length : 1;
        files = Array.prototype.slice.call(files, 0, maxFiles);
        if (this.props.onDrop) {
            this.props.onDrop(files, e, this);
        }
    };

    FileDropzone.prototype.onFolderPicked = function onFolderPicked(e) {
        if (this.props.onFolderPicked) {
            this.props.onFolderPicked(e.target.files);
        }
    };

    FileDropzone.prototype.onDrop = function onDrop(e) {

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

        var maxFiles = this.state.multiple ? files.length : 1;
        for (var i = 0; i < maxFiles; i++) {
            files[i].preview = URL.createObjectURL(files[i]);
        }

        if (this.props.onDrop) {
            files = Array.prototype.slice.call(files, 0, maxFiles);
            this.props.onDrop(files, e, this);
        }
    };

    FileDropzone.prototype.onClick = function onClick() {
        if (this.state.supportClick === true) {
            this.open();
        }
    };

    FileDropzone.prototype.open = function open() {
        this.refs.fileInput.click();
    };

    FileDropzone.prototype.openFolderPicker = function openFolderPicker() {
        this.refs.folderInput.setAttribute("webkitdirectory", "true");
        this.refs.folderInput.click();
    };

    FileDropzone.prototype.render = function render() {
        var _this = this;

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
            folderInput = React.createElement("input", { style: { display: 'none' }, name: "userfolder", type: "file", ref: "folderInput", onChange: function (e) {
                    return _this.onFolderPicked(e);
                } });
        }
        return React.createElement(
            "div",
            { className: className, style: style, onClick: this.onClick.bind(this), onDragLeave: this.onDragLeave.bind(this), onDragOver: this.onDragOver.bind(this), onDrop: this.onDrop.bind(this) },
            React.createElement("input", { style: { display: 'none' }, name: "userfile", type: "file", multiple: this.state.multiple, ref: "fileInput", value: "", onChange: this.onFilePicked.bind(this), accept: this.props.accept }),
            folderInput,
            this.props.children
        );
    };

    return FileDropzone;
})(React.Component);

exports["default"] = FileDropzone;
module.exports = exports["default"];

},{"react":"react"}],5:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _materialUi = require("material-ui");

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var _Pydio$requireLib = _pydio2["default"].requireLib('hoc');

var ModernStyles = _Pydio$requireLib.ModernStyles;

/**
 * Boolean input
 */

var InputBoolean = (function (_React$Component) {
    _inherits(InputBoolean, _React$Component);

    function InputBoolean() {
        _classCallCheck(this, InputBoolean);

        _React$Component.apply(this, arguments);
    }

    InputBoolean.prototype.render = function render() {
        var _this = this;

        var boolVal = this.props.value;
        if (typeof boolVal === 'string') {
            boolVal = boolVal === "true";
        }
        return _react2["default"].createElement(
            "span",
            null,
            _react2["default"].createElement(_materialUi.Toggle, _extends({
                toggled: boolVal,
                onToggle: function (e, v) {
                    return _this.props.onChange(e, v);
                },
                disabled: this.props.disabled,
                label: this.props.isDisplayForm() ? this.props.attributes.label : null,
                labelPosition: this.props.isDisplayForm() ? 'left' : 'right'
            }, ModernStyles.toggleField))
        );
    };

    return InputBoolean;
})(_react2["default"].Component);

exports["default"] = _hocAsFormField2["default"](InputBoolean, true);
module.exports = exports["default"];

},{"../hoc/asFormField":12,"material-ui":"material-ui","pydio":"pydio","react":"react"}],6:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

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

var InputImage = (function (_React$Component) {
    _inherits(InputImage, _React$Component);

    // propTypes: {
    //     attributes: React.PropTypes.object,
    //     binary_context: React.PropTypes.string
    // },

    function InputImage(props) {
        _classCallCheck(this, InputImage);

        _React$Component.call(this, props);
        var imageSrc = undefined,
            originalBinary = undefined;
        if (this.props.value) {
            imageSrc = this.getBinaryUrl(this.props);
            originalBinary = this.props.value;
        } else if (this.props.attributes['defaultImage']) {
            imageSrc = this.props.attributes['defaultImage'];
        }
        this.state = {
            imageSrc: imageSrc,
            originalBinary: originalBinary,
            value: this.props.value
        };
    }

    InputImage.prototype.componentWillReceiveProps = function componentWillReceiveProps(newProps) {
        var imgSrc = undefined;
        if ((newProps.value || newProps.binary_context && newProps.binary_context !== this.props.binary_context) && !this.state.reset) {
            imgSrc = this.getBinaryUrl(newProps, this.state.temporaryBinary && this.state.temporaryBinary === newProps.value);
        } else if (newProps.attributes['defaultImage']) {
            imgSrc = newProps.attributes['defaultImage'];
        }
        if (imgSrc) {
            this.setState({ imageSrc: imgSrc, reset: false, value: newProps.value });
        }
    };

    InputImage.prototype.getBinaryUrl = function getBinaryUrl(props) {
        var pydio = _pydioHttpApi2['default'].getClient().getPydioObject();
        var url = pydio.Parameters.get('ENDPOINT_REST_API') + props.attributes['loadAction'];
        var bId = props.value;
        if (props.binary_context && props.binary_context.indexOf('user_id=') === 0) {
            bId = props.binary_context.replace('user_id=', '');
        }
        url = url.replace('{BINARY}', bId);
        return url;
    };

    InputImage.prototype.getUploadUrl = function getUploadUrl() {
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
    };

    InputImage.prototype.uploadComplete = function uploadComplete(newBinaryName) {
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
            this.setState({
                dirty: true,
                value: newBinaryName
            });
        }
    };

    InputImage.prototype.htmlUpload = function htmlUpload() {
        window.formManagerHiddenIFrameSubmission = (function (result) {
            this.uploadComplete(result.trim());
            window.formManagerHiddenIFrameSubmission = null;
        }).bind(this);
        this.refs.uploadForm.submit();
    };

    InputImage.prototype.onDrop = function onDrop(files, event, dropzone) {
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
    };

    InputImage.prototype.clearImage = function clearImage() {
        var _this2 = this;

        if (confirm(_pydio2['default'].getMessages()['form.input-image.clearConfirm'])) {
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
    };

    InputImage.prototype.render = function render() {
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
        var isDefault = this.props.attributes['defaultImage'] && this.props.attributes['defaultImage'] === this.state.imageSrc;

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
                    { onDrop: this.onDrop.bind(this), accept: 'image/*', style: coverImageStyle },
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }, overlayBg) },
                        overlay
                    )
                )
            ),
            !isDefault && _react2['default'].createElement(
                'div',
                { className: 'binary-remove-button', onClick: this.clearImage.bind(this) },
                _react2['default'].createElement('span', { key: 'remove', className: 'mdi mdi-close' }),
                ' ',
                _pydio2['default'].getMessages()['form.input-image.clearButton']
            ),
            _react2['default'].createElement('iframe', { style: { display: "none" }, id: 'uploader_hidden_iframe', name: 'uploader_hidden_iframe' })
        );
    };

    return InputImage;
})(_react2['default'].Component);

exports['default'] = InputImage;
module.exports = exports['default'];

},{"./FileDropzone":4,"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/lang":"pydio/util/lang","react":"react"}],7:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Text input that is converted to integer, and
 * the UI can react to arrows for incrementing/decrementing values
 */

var InputInteger = (function (_React$Component) {
    _inherits(InputInteger, _React$Component);

    function InputInteger() {
        _classCallCheck(this, InputInteger);

        _React$Component.apply(this, arguments);
    }

    InputInteger.prototype.keyDown = function keyDown(event) {
        var inc = 0,
            multiple = 1;
        if (event.key === 'Enter') {
            this.props.toggleEditMode();
            return;
        } else if (event.key === 'ArrowUp') {
            inc = +1;
        } else if (event.key === 'ArrowDown') {
            inc = -1;
        }
        if (event.shiftKey) {
            multiple = 10;
        }
        var parsed = parseInt(this.props.value);
        if (isNaN(parsed)) {
            parsed = 0;
        }
        var value = parsed + inc * multiple;
        this.props.onChange(null, value);
    };

    InputInteger.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var value = _props.value;
        var isDisplayGrid = _props.isDisplayGrid;
        var isDisplayForm = _props.isDisplayForm;
        var editMode = _props.editMode;
        var disabled = _props.disabled;
        var toggleEditMode = _props.toggleEditMode;
        var attributes = _props.attributes;

        if (isDisplayGrid() && !editMode) {
            return _react2['default'].createElement(
                'div',
                { onClick: disabled ? function () {} : toggleEditMode, className: value ? '' : 'paramValue-empty' },
                value ? value : 'Empty'
            );
        } else {
            var intval = undefined;
            if (value) {
                intval = parseInt(value) + '';
                if (isNaN(intval)) {
                    intval = value + '';
                }
            } else {
                intval = '0';
            }
            return _react2['default'].createElement(
                'span',
                { className: 'integer-input' },
                _react2['default'].createElement(ModernTextField, {
                    value: intval,
                    onChange: function (e, v) {
                        return _this.props.onChange(e, v);
                    },
                    onKeyDown: function (e) {
                        return _this.keyDown(e);
                    },
                    disabled: disabled,
                    fullWidth: true,
                    hintText: isDisplayForm() ? attributes.label : null
                })
            );
        }
    };

    return InputInteger;
})(_react2['default'].Component);

exports['default'] = _hocAsFormField2['default'](InputInteger);
module.exports = exports['default'];

},{"../hoc/asFormField":12,"pydio":"pydio","react":"react"}],8:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var _hocWithChoices = require('../hoc/withChoices');

var _hocWithChoices2 = _interopRequireDefault(_hocWithChoices);

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

var InputSelectBox = (function (_React$Component) {
    _inherits(InputSelectBox, _React$Component);

    function InputSelectBox() {
        _classCallCheck(this, InputSelectBox);

        _React$Component.apply(this, arguments);
    }

    InputSelectBox.prototype.onDropDownChange = function onDropDownChange(event, index, value) {
        this.props.onChange(event, value);
        this.props.toggleEditMode();
    };

    InputSelectBox.prototype.onMultipleSelect = function onMultipleSelect(event, index, newValue) {
        if (newValue === -1) {
            return;
        }
        var currentValue = this.props.value;
        var currentValues = typeof currentValue === 'string' ? currentValue.split(',') : currentValue;
        if (!currentValues.indexOf(newValue) !== -1) {
            currentValues.push(newValue);
            this.props.onChange(event, currentValues.join(','));
        }
        this.props.toggleEditMode();
    };

    InputSelectBox.prototype.onMultipleRemove = function onMultipleRemove(value) {
        var currentValue = this.props.value;
        var currentValues = typeof currentValue === 'string' ? currentValue.split(',') : currentValue;
        if (currentValues.indexOf(value) !== -1) {
            currentValues = LangUtils.arrayWithout(currentValues, currentValues.indexOf(value));
            this.props.onChange(null, currentValues.join(','));
        }
    };

    InputSelectBox.prototype.render = function render() {
        var _this = this;

        var currentValue = this.props.value;
        var menuItems = [],
            multipleOptions = [];
        if (!this.props.attributes['mandatory'] || this.props.attributes['mandatory'] !== "true") {
            menuItems.push(React.createElement(MenuItem, { value: -1, primaryText: this.props.attributes['label'] + '...' }));
        }
        var choices = this.props.choices;

        choices.forEach(function (value, key) {
            menuItems.push(React.createElement(MenuItem, { value: key, primaryText: value }));
            multipleOptions.push({ value: key, label: value });
        });
        if (this.props.isDisplayGrid() && !this.props.editMode || this.props.disabled) {
            var value = this.props.value;
            if (choices.get(value)) {
                value = choices.get(value);
            }
            return React.createElement(
                'div',
                {
                    onClick: this.props.disabled ? function () {} : this.props.toggleEditMode,
                    className: value ? '' : 'paramValue-empty' },
                value ? value : 'Empty',
                '   ',
                React.createElement('span', { className: 'icon-caret-down' })
            );
        } else {
            if (this.props.multiple && this.props.multiple === true) {
                var currentValues = currentValue;
                if (typeof currentValue === "string") {
                    currentValues = currentValue.split(",");
                }
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
                            onChange: function (e, i, v) {
                                return _this.onMultipleSelect(e, i, v);
                            },
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
                            onChange: function (e, i, v) {
                                return _this.onDropDownChange(e, i, v);
                            },
                            fullWidth: true,
                            className: this.props.className
                        },
                        menuItems
                    )
                );
            }
        }
    };

    return InputSelectBox;
})(React.Component);

exports['default'] = InputSelectBox = _hocAsFormField2['default'](InputSelectBox, true);
exports['default'] = InputSelectBox = _hocWithChoices2['default'](InputSelectBox);
exports['default'] = InputSelectBox;
module.exports = exports['default'];

},{"../hoc/asFormField":12,"../hoc/withChoices":13,"material-ui":"material-ui","pydio":"pydio","pydio/util/lang":"pydio/util/lang","react":"react"}],9:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */

var TextField = (function (_React$Component) {
    _inherits(TextField, _React$Component);

    function TextField() {
        _classCallCheck(this, TextField);

        _React$Component.apply(this, arguments);
    }

    TextField.prototype.render = function render() {
        var _props = this.props;
        var editMode = _props.editMode;
        var value = _props.value;

        if (this.props.isDisplayGrid() && !editMode) {
            var val = value;
            if (this.props.attributes['type'] === 'password' && value) {
                val = '***********';
            }
            return _react2['default'].createElement(
                'div',
                { onClick: this.props.disabled ? function () {} : this.props.toggleEditMode, className: val ? '' : 'paramValue-empty' },
                val ? val : 'Empty'
            );
        } else {
            var field = _react2['default'].createElement(ModernTextField, {
                hintText: this.props.isDisplayForm() ? this.props.attributes.label : null,
                value: value || "",
                onChange: this.props.onChange,
                onKeyDown: this.props.enterToToggle,
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
    };

    return TextField;
})(_react2['default'].Component);

exports['default'] = _hocAsFormField2['default'](TextField);
module.exports = exports['default'];

},{"../hoc/asFormField":12,"pydio":"pydio","react":"react"}],10:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _Pydio$requireLib = _pydio2["default"].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Text input, can be single line, multiLine, or password, depending on the
 * attributes.type key.
 */

var ValidLogin = (function (_React$Component) {
    _inherits(ValidLogin, _React$Component);

    function ValidLogin() {
        _classCallCheck(this, ValidLogin);

        _React$Component.apply(this, arguments);
    }

    ValidLogin.prototype.textValueChanged = function textValueChanged(event, value) {
        var err = _pydioUtilPass2["default"].isValidLogin(value);
        var prevStateValid = this.state.valid;
        var valid = !err;
        if (prevStateValid !== valid && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(valid);
        }
        this.setState({ valid: valid, err: err });

        this.props.onChange(event, value);
    };

    ValidLogin.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var isDisplayGrid = _props.isDisplayGrid;
        var isDisplayForm = _props.isDisplayForm;
        var editMode = _props.editMode;
        var disabled = _props.disabled;
        var errorText = _props.errorText;
        var enterToToggle = _props.enterToToggle;
        var toggleEditMode = _props.toggleEditMode;
        var attributes = _props.attributes;

        if (isDisplayGrid() && !editMode) {
            var _value = this.props.value;

            if (attributes['type'] === 'password' && _value) {
                _value = '***********';
            }
            return _react2["default"].createElement(
                "div",
                { onClick: disabled ? function () {} : toggleEditMode, className: _value ? '' : 'paramValue-empty' },
                _value ? _value : 'Empty'
            );
        } else {
            var err = this.state.err;

            var field = _react2["default"].createElement(ModernTextField, {
                floatingLabelText: isDisplayForm() ? attributes.label : null,
                value: value || "",
                onChange: function (e, v) {
                    return _this.textValueChanged(e, v);
                },
                onKeyDown: enterToToggle,
                type: attributes['type'] === 'password' ? 'password' : null,
                multiLine: attributes['type'] === 'textarea',
                disabled: disabled,
                errorText: errorText || err,
                autoComplete: "off",
                fullWidth: true
            });
            if (attributes['type'] === 'password') {
                return _react2["default"].createElement(
                    "form",
                    { autoComplete: "off", onSubmit: function (e) {
                            e.stopPropagation();e.preventDefault();
                        }, style: { display: 'inline' } },
                    field
                );
            } else {
                return _react2["default"].createElement(
                    "span",
                    null,
                    field
                );
            }
        }
    };

    return ValidLogin;
})(_react2["default"].Component);

exports["default"] = _hocAsFormField2["default"](ValidLogin);
module.exports = exports["default"];

},{"../hoc/asFormField":12,"pydio":"pydio","pydio/util/pass":"pydio/util/pass","react":"react"}],11:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilPass = require("pydio/util/pass");

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _hocAsFormField = require("../hoc/asFormField");

var _hocAsFormField2 = _interopRequireDefault(_hocAsFormField);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2["default"].requireLib("hoc");

var ModernTextField = _Pydio$requireLib.ModernTextField;

var ValidPassword = (function (_React$Component) {
    _inherits(ValidPassword, _React$Component);

    function ValidPassword(props) {
        _classCallCheck(this, ValidPassword);

        _React$Component.call(this, props);
        this.state = {};
    }

    ValidPassword.prototype.isValid = function isValid() {
        return this.state.valid;
    };

    ValidPassword.prototype.checkMinLength = function checkMinLength(value) {
        var minLength = parseInt(_pydio2["default"].getInstance().getPluginConfigs("core.auth").get("PASSWORD_MINLENGTH"));
        return !(value && value.length < minLength);
    };

    ValidPassword.prototype.getMessage = function getMessage(messageId) {
        return _pydio2["default"].getMessages()[messageId] || messageId;
    };

    ValidPassword.prototype.updatePassState = function updatePassState() {
        var prevStateValid = this.state.valid;
        var newState = _pydioUtilPass2["default"].getState(this.refs.pass.getValue(), this.refs.confirm ? this.refs.confirm.getValue() : '');
        this.setState(newState);
        if (prevStateValid !== newState.valid && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(newState.valid);
        }
    };

    ValidPassword.prototype.onPasswordChange = function onPasswordChange(event) {
        this.updatePassState();
        this.props.onChange(event, event.target.value);
    };

    ValidPassword.prototype.onConfirmChange = function onConfirmChange(event) {
        this.setState({ confirmValue: event.target.value });
        this.updatePassState();
        this.props.onChange(event, this.state.value);
    };

    ValidPassword.prototype.render = function render() {
        var _props = this.props;
        var disabled = _props.disabled;
        var className = _props.className;
        var attributes = _props.attributes;
        var dialogField = _props.dialogField;
        var _props2 = this.props;
        var isDisplayGrid = _props2.isDisplayGrid;
        var isDisplayForm = _props2.isDisplayForm;
        var editMode = _props2.editMode;
        var value = _props2.value;
        var toggleEditMode = _props2.toggleEditMode;
        var enterToToggle = _props2.enterToToggle;

        if (isDisplayGrid() && !editMode) {
            return _react2["default"].createElement(
                "div",
                { onClick: disabled ? function () {} : toggleEditMode, className: value ? '' : 'paramValue-empty' },
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
            if (value && !disabled) {

                _confirm = [_react2["default"].createElement("div", { key: "sep", style: { width: 8 } }), _react2["default"].createElement(TextComponent, {
                    key: "confirm",
                    ref: "confirm",
                    floatingLabelText: this.getMessage(199),
                    floatingLabelShrinkStyle: _extends({}, overflow, { width: '130%' }),
                    floatingLabelStyle: overflow,
                    className: cName,
                    value: this.state.confirmValue,
                    onChange: this.onConfirmChange.bind(this),
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
                        floatingLabelText: isDisplayForm() ? attributes.label : null,
                        floatingLabelShrinkStyle: _extends({}, overflow, { width: '130%' }),
                        floatingLabelStyle: overflow,
                        className: cName,
                        value: this.state.value,
                        onChange: this.onPasswordChange.bind(this),
                        onKeyDown: enterToToggle,
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
    };

    return ValidPassword;
})(_react2["default"].Component);

exports["default"] = _hocAsFormField2["default"](ValidPassword);
module.exports = exports["default"];

},{"../hoc/asFormField":12,"material-ui":"material-ui","pydio":"pydio","pydio/util/pass":"pydio/util/pass","react":"react"}],12:[function(require,module,exports){
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

/**
 * React Mixin for Form Element
 */

exports['default'] = function (Field) {
    var skipBufferChanges = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var FormField = (function (_React$Component) {
        _inherits(FormField, _React$Component);

        // propTypes:{
        //     attributes:React.PropTypes.object.isRequired,
        //     name:React.PropTypes.string.isRequired,
        //
        //     displayContext:React.PropTypes.oneOf(['form', 'grid']),
        //     disabled:React.PropTypes.bool,
        //     multiple:React.PropTypes.bool,
        //     value:React.PropTypes.any,
        //     onChange:React.PropTypes.func,
        //     onChangeEditMode:React.PropTypes.func,
        //     binary_context:React.PropTypes.string,
        //     errorText:React.PropTypes.string
        // },

        function FormField(props) {
            _classCallCheck(this, FormField);

            props = _extends({ displayContext: 'form', disabled: false }, props);
            _React$Component.call(this, props);
            this.state = {
                editMode: false,
                dirty: false,
                value: this.props.value
            };
        }

        FormField.prototype.isDisplayGrid = function isDisplayGrid() {
            return this.props.displayContext === 'grid';
        };

        FormField.prototype.isDisplayForm = function isDisplayForm() {
            return this.props.displayContext === 'form';
        };

        FormField.prototype.toggleEditMode = function toggleEditMode() {
            if (this.isDisplayForm()) {
                return;
            }
            var newState = !this.state.editMode;
            this.setState({ editMode: newState });
            if (this.props.onChangeEditMode) {
                this.props.onChangeEditMode(newState);
            }
        };

        FormField.prototype.enterToToggle = function enterToToggle(event) {
            if (event.key === 'Enter') {
                this.toggleEditMode();
            }
        };

        FormField.prototype.bufferChanges = function bufferChanges(newValue, oldValue) {
            this.triggerPropsOnChange(newValue, oldValue);
        };

        FormField.prototype.onChange = function onChange(event, value) {
            if (value === undefined) {
                value = event.currentTarget.getValue ? event.currentTarget.getValue() : event.currentTarget.value;
            }
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            }
            var newValue = value,
                oldValue = this.state.value;
            if (skipBufferChanges) {
                this.triggerPropsOnChange(newValue, oldValue);
            }
            this.setState({
                dirty: true,
                value: newValue
            });
            if (!skipBufferChanges) {
                var timerLength = 250;
                if (this.props.attributes['type'] === 'password') {
                    timerLength = 1200;
                }
                this.changeTimeout = setTimeout((function () {
                    this.bufferChanges(newValue, oldValue);
                }).bind(this), timerLength);
            }
        };

        FormField.prototype.triggerPropsOnChange = function triggerPropsOnChange(newValue, oldValue) {
            if (this.props.attributes['type'] === 'password') {
                this.toggleEditMode();
                this.props.onChange(newValue, oldValue, { type: this.props.attributes['type'] });
            } else {
                this.props.onChange(newValue, oldValue);
            }
        };

        FormField.prototype.componentWillReceiveProps = function componentWillReceiveProps(newProps) {
            this.setState({
                value: newProps.value,
                dirty: false
            });
        };

        FormField.prototype.render = function render() {
            var _this = this;

            return _react2['default'].createElement(Field, _extends({}, this.props, this.state, {
                onChange: function (e, v) {
                    return _this.onChange(e, v);
                },
                toggleEditMode: function () {
                    return _this.toggleEditMode();
                },
                enterToToggle: function (e) {
                    return _this.enterToToggle(e);
                },
                isDisplayGrid: function () {
                    return _this.isDisplayGrid();
                },
                isDisplayForm: function () {
                    return _this.isDisplayForm();
                }
            }));
        };

        return FormField;
    })(_react2['default'].Component);

    return FormField;
};

module.exports = exports['default'];

},{"react":"react"}],13:[function(require,module,exports){
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
                if (this.onChoicesLoaded) {
                    this.onChoicesLoaded(choices);
                }
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
                if (this.onChoicesLoaded) {
                    this.onChoicesLoaded(output);
                }
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
                    if (pydio.MessageHash[label]) {
                        label = pydio.MessageHash[label];
                    }
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

    return PydioContextConsumer(FieldWithChoices);
};

module.exports = exports['default'];

},{"pydio":"pydio","react":"react"}],14:[function(require,module,exports){
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

  Manager: _managerManager2['default'],
  InputText: _fieldsTextField2['default'],
  ValidPassword: _fieldsValidPassword2['default'],
  InputBoolean: _fieldsInputBoolean2['default'],
  InputInteger: _fieldsInputInteger2['default'],
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

},{"./fields/AutocompleteBox":2,"./fields/AutocompleteTree":3,"./fields/FileDropzone":4,"./fields/InputBoolean":5,"./fields/InputImage":6,"./fields/InputInteger":7,"./fields/InputSelectBox":8,"./fields/TextField":9,"./fields/ValidPassword":11,"./manager/Manager":15,"./panel/FormHelper":16,"./panel/FormPanel":17}],15:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _fieldsValidLogin = require('../fields/ValidLogin');

var _fieldsValidLogin2 = _interopRequireDefault(_fieldsValidLogin);

var _fieldsAltText = require("../fields/AltText");

var _fieldsAltText2 = _interopRequireDefault(_fieldsAltText);

var XMLUtils = require('pydio/util/xml');
var InputBoolean = require('./../fields/InputBoolean');
var InputText = require('./../fields/TextField');
var ValidPassword = require('./../fields/ValidPassword');
var InputInteger = require('./../fields/InputInteger');
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
        var attributes = props.attributes;
        var onAltTextSwitch = props.onAltTextSwitch;
        var altTextSwitchIcon = props.altTextSwitchIcon;
        var altTextSwitchTip = props.altTextSwitchTip;

        var switchProps = { onAltTextSwitch: onAltTextSwitch, altTip: altTextSwitchTip, altIconText: altTextSwitchIcon };
        switch (attributes['type']) {
            case 'boolean':
                value = _react2['default'].createElement(InputBoolean, props);
                if (onAltTextSwitch) {
                    value = _react2['default'].createElement(
                        _fieldsAltText2['default'],
                        _extends({}, props, switchProps, { altIcon: "mdi mdi-toggle-switch" }),
                        value
                    );
                }
                break;
            case 'string':
            case 'textarea':
            case 'password':
                value = _react2['default'].createElement(InputText, props);
                break;
            case 'valid-password':
                value = _react2['default'].createElement(ValidPassword, props);
                break;
            case 'valid-login':
                value = _react2['default'].createElement(_fieldsValidLogin2['default'], props);
                break;
            case 'integer':
                value = _react2['default'].createElement(InputInteger, props);
                if (onAltTextSwitch) {
                    value = _react2['default'].createElement(
                        _fieldsAltText2['default'],
                        _extends({}, props, switchProps, { altIcon: "mdi mdi-number" }),
                        value
                    );
                }
                break;
            case 'image':
                value = _react2['default'].createElement(InputImage, props);
                break;
            case 'select':
                value = _react2['default'].createElement(SelectBox, props);
                if (onAltTextSwitch) {
                    value = _react2['default'].createElement(
                        _fieldsAltText2['default'],
                        _extends({}, props, switchProps, { altIcon: "mdi mdi-view-list" }),
                        value
                    );
                }
                break;
            case 'autocomplete':
                value = _react2['default'].createElement(AutocompleteBox, props);
                break;
            case 'autocomplete-tree':
                value = _react2['default'].createElement(AutocompleteTree, props);
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
                    value = _react2['default'].createElement(
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

},{"../fields/AltText":1,"../fields/ValidLogin":10,"./../fields/AutocompleteBox":2,"./../fields/AutocompleteTree":3,"./../fields/InputBoolean":5,"./../fields/InputImage":6,"./../fields/InputInteger":7,"./../fields/InputSelectBox":8,"./../fields/TextField":9,"./../fields/ValidPassword":11,"pydio/util/xml":"pydio/util/xml","react":"react"}],16:[function(require,module,exports){
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

},{"../manager/Manager":15,"pydio":"pydio","react":"react"}],17:[function(require,module,exports){
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
        var groupsOrdered = ['__DEFAULT__'];
        allGroups['__DEFAULT__'] = { FIELDS: [] };
        var replicationGroups = {};
        var _props = this.props;
        var parameters = _props.parameters;
        var values = _props.values;
        var skipFieldsTypes = _props.skipFieldsTypes;
        var disabled = _props.disabled;
        var binary_context = _props.binary_context;
        var _props2 = this.props;
        var altTextSwitchIcon = _props2.altTextSwitchIcon;
        var altTextSwitchTip = _props2.altTextSwitchTip;
        var onAltTextSwitch = _props2.onAltTextSwitch;

        parameters.map((function (attributes) {
            var _this = this;

            var type = attributes['type'];
            if (skipFieldsTypes && skipFieldsTypes.indexOf(type) > -1) {
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

            var repGroup = attributes.replicationGroup;

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
                        parameters: parameters,
                        values: values,
                        key: paramName,
                        onScrollCallback: null,
                        limitToGroups: null,
                        onValidStatusChange: this.onSubformValidStatusChange
                    }));
                } else if (attributes['type'] !== 'hidden') {
                    (function () {

                        var helperMark = undefined;
                        var _props3 = _this.props;
                        var setHelperData = _props3.setHelperData;
                        var checkHasHelper = _props3.checkHasHelper;
                        var helperTestFor = _props3.helperTestFor;

                        if (setHelperData && checkHasHelper && checkHasHelper(attributes['name'], helperTestFor)) {
                            var showHelper = (function () {
                                setHelperData({
                                    paramAttributes: attributes,
                                    values: values,
                                    postValues: this.getValuesForPOST(values),
                                    applyButtonAction: this.applyButtonAction
                                }, helperTestFor);
                            }).bind(_this);
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
                            disabled: disabled || attributes['readonly'],
                            multiple: attributes['multiple'],
                            binary_context: binary_context,
                            displayContext: 'form',
                            applyButtonAction: _this.applyButtonAction,
                            errorText: mandatoryMissing ? pydio.MessageHash['621'] : attributes.errorText ? attributes.errorText : null,
                            onAltTextSwitch: onAltTextSwitch, altTextSwitchIcon: altTextSwitchIcon, altTextSwitchTip: altTextSwitchTip
                        };

                        field = _react2['default'].createElement(
                            'div',
                            { key: paramName, className: 'form-entry-' + attributes['type'] },
                            _react2['default'].createElement(
                                'div',
                                { className: classLegend },
                                attributes['warningText'] ? attributes['warningText'] : attributes['description'],
                                ' ',
                                helperMark
                            ),
                            _managerManager2['default'].createFormElement(props)
                        );
                    })();
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
                    var _ret3 = _loop(k);

                    if (_ret3 === 'continue') continue;
                }
                groupPanes = otherPanes['top'].concat(groupPanes).concat(otherPanes['bottom']);
            })();
        }

        if (this.props.tabs) {
            var _ret4 = (function () {
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

            if (typeof _ret4 === 'object') return _ret4.v;
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

},{"../manager/Manager":15,"./GroupSwitchPanel":18,"./ReplicationPanel":20,"material-ui":"material-ui","pydio/util/lang":"pydio/util/lang","react":"react"}],18:[function(require,module,exports){
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
            selectorLegend = undefined;
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

        if (values[paramName] && switchValues[values[paramName]]) {
            var _props = this.props;
            var onAltTextSwitch = _props.onAltTextSwitch;
            var altTextSwitchIcon = _props.altTextSwitchIcon;
            var altTextSwitchTip = _props.altTextSwitchTip;

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
                accordionizeIfGroupsMoreThan: 5,
                onAltTextSwitch: onAltTextSwitch,
                altTextSwitchIcon: altTextSwitchIcon,
                altTextSwitchTip: altTextSwitchTip
            });
        }
        return React.createElement(
            'div',
            { className: 'sub-form-group' },
            React.createElement(
                'div',
                { className: 'form-legend' },
                attributes['description'],
                ' ',
                helperMark
            ),
            selector,
            subForm
        );
    }

});
module.exports = exports['default'];

},{"../fields/InputSelectBox":8,"./FormPanel":17,"pydio/util/lang":"pydio/util/lang","react":"react"}],19:[function(require,module,exports){
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

},{"./FormPanel":17,"material-ui":"material-ui","react":"react"}],20:[function(require,module,exports){
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

},{"./ReplicatedGroup":19,"material-ui":"material-ui","pydio/util/lang":"pydio/util/lang","react":"react"}]},{},[14])(14)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvQWx0VGV4dC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9BdXRvY29tcGxldGVCb3guanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvQXV0b2NvbXBsZXRlVHJlZS5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9GaWxlRHJvcHpvbmUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvSW5wdXRCb29sZWFuLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0SW1hZ2UuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvSW5wdXRJbnRlZ2VyLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0U2VsZWN0Qm94LmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL1RleHRGaWVsZC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9WYWxpZExvZ2luLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL1ZhbGlkUGFzc3dvcmQuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9ob2MvYXNGb3JtRmllbGQuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9ob2Mvd2l0aENob2ljZXMuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9pbmRleC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL21hbmFnZXIvTWFuYWdlci5qcyIsInJlcy9idWlsZC91aS9Gb3JtL3BhbmVsL0Zvcm1IZWxwZXIuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9Gb3JtUGFuZWwuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9Hcm91cFN3aXRjaFBhbmVsLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vcGFuZWwvUmVwbGljYXRlZEdyb3VwLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vcGFuZWwvUmVwbGljYXRpb25QYW5lbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9SQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25aQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3bUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZShcIm1hdGVyaWFsLXVpXCIpO1xuXG52YXIgX1RleHRGaWVsZCA9IHJlcXVpcmUoXCIuL1RleHRGaWVsZFwiKTtcblxudmFyIF9UZXh0RmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVGV4dEZpZWxkKTtcblxudmFyIEFsdFRleHQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQWx0VGV4dCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBBbHRUZXh0KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQWx0VGV4dCk7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIEFsdFRleHQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0gX3Byb3BzLmF0dHJpYnV0ZXM7XG4gICAgICAgIHZhciBfcHJvcHMkYWx0SWNvbiA9IF9wcm9wcy5hbHRJY29uO1xuICAgICAgICB2YXIgYWx0SWNvbiA9IF9wcm9wcyRhbHRJY29uID09PSB1bmRlZmluZWQgPyBcIm1kaSBtZGktdG9nZ2xlLXN3aXRjaFwiIDogX3Byb3BzJGFsdEljb247XG4gICAgICAgIHZhciBfcHJvcHMkYWx0SWNvblRleHQgPSBfcHJvcHMuYWx0SWNvblRleHQ7XG4gICAgICAgIHZhciBhbHRJY29uVGV4dCA9IF9wcm9wcyRhbHRJY29uVGV4dCA9PT0gdW5kZWZpbmVkID8gXCJtZGkgbWRpLXRleHRib3hcIiA6IF9wcm9wcyRhbHRJY29uVGV4dDtcbiAgICAgICAgdmFyIF9wcm9wcyRhbHRUaXAgPSBfcHJvcHMuYWx0VGlwO1xuICAgICAgICB2YXIgYWx0VGlwID0gX3Byb3BzJGFsdFRpcCA9PT0gdW5kZWZpbmVkID8gXCJTd2l0Y2ggdG8gdGV4dCB2ZXJzaW9uXCIgOiBfcHJvcHMkYWx0VGlwO1xuICAgICAgICB2YXIgb25BbHRUZXh0U3dpdGNoID0gX3Byb3BzLm9uQWx0VGV4dFN3aXRjaDtcblxuICAgICAgICB2YXIgY29tcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIGFsdGVybmF0aXZlVGV4dCA9IGF0dHJpYnV0ZXMuYWx0ZXJuYXRpdmVUZXh0O1xuXG4gICAgICAgIGlmIChhbHRlcm5hdGl2ZVRleHQpIHtcbiAgICAgICAgICAgIGNvbXAgPSBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9UZXh0RmllbGQyW1wiZGVmYXVsdFwiXSwgdGhpcy5wcm9wcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wID0gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JyB9IH0sXG4gICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICBjb21wXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6IGFsdGVybmF0aXZlVGV4dCA/IGFsdEljb24gOiBhbHRJY29uVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGFsdFRpcCxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9uQWx0VGV4dFN3aXRjaChhdHRyaWJ1dGVzW1wibmFtZVwiXSwgIWFsdGVybmF0aXZlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGljb25TdHlsZTogeyBvcGFjaXR5OiAuMywgZm9udFNpemU6IDIwIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHBhZGRpbmc6ICcxNHB4IDhweCcsIHdpZHRoOiA0MiwgaGVpZ2h0OiA0MiB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEFsdFRleHQ7XG59KShfcmVhY3QyW1wiZGVmYXVsdFwiXS5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEFsdFRleHQ7XG5cbnZhciB0ZXN0ID0gZnVuY3Rpb24gdGVzdChDb21wb25lbnQpIHtcbiAgICB2YXIgd3JhcHBlZCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDIpIHtcbiAgICAgICAgX2luaGVyaXRzKHdyYXBwZWQsIF9SZWFjdCRDb21wb25lbnQyKTtcblxuICAgICAgICBmdW5jdGlvbiB3cmFwcGVkKCkge1xuICAgICAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIHdyYXBwZWQpO1xuXG4gICAgICAgICAgICBfUmVhY3QkQ29tcG9uZW50Mi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgd3JhcHBlZC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBfcHJvcHMyLmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiRhbHRJY29uID0gX3Byb3BzMi5hbHRJY29uO1xuICAgICAgICAgICAgdmFyIGFsdEljb24gPSBfcHJvcHMyJGFsdEljb24gPT09IHVuZGVmaW5lZCA/IFwibWRpIG1kaS10b2dnbGUtc3dpdGNoXCIgOiBfcHJvcHMyJGFsdEljb247XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiRhbHRJY29uVGV4dCA9IF9wcm9wczIuYWx0SWNvblRleHQ7XG4gICAgICAgICAgICB2YXIgYWx0SWNvblRleHQgPSBfcHJvcHMyJGFsdEljb25UZXh0ID09PSB1bmRlZmluZWQgPyBcIm1kaSBtZGktdGV4dGJveFwiIDogX3Byb3BzMiRhbHRJY29uVGV4dDtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyJGFsdFRpcCA9IF9wcm9wczIuYWx0VGlwO1xuICAgICAgICAgICAgdmFyIGFsdFRpcCA9IF9wcm9wczIkYWx0VGlwID09PSB1bmRlZmluZWQgPyBcIlN3aXRjaFwiIDogX3Byb3BzMiRhbHRUaXA7XG4gICAgICAgICAgICB2YXIgb25BbHRUZXh0U3dpdGNoID0gX3Byb3BzMi5vbkFsdFRleHRTd2l0Y2g7XG5cbiAgICAgICAgICAgIHZhciBjb21wID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGFsdGVybmF0aXZlVGV4dCA9IGF0dHJpYnV0ZXMuYWx0ZXJuYXRpdmVUZXh0O1xuXG4gICAgICAgICAgICBpZiAoYWx0ZXJuYXRpdmVUZXh0KSB7XG4gICAgICAgICAgICAgICAgY29tcCA9IF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX1RleHRGaWVsZDJbXCJkZWZhdWx0XCJdLCB0aGlzLnByb3BzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcCA9IF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoQ29tcG9uZW50LCB0aGlzLnByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogYWx0ZXJuYXRpdmVUZXh0ID8gYWx0SWNvbiA6IGFsdEljb25UZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcDogYWx0VGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbkFsdFRleHRTd2l0Y2goYXR0cmlidXRlc1tcIm5hbWVcIl0sICFhbHRlcm5hdGl2ZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHdyYXBwZWQ7XG4gICAgfSkoX3JlYWN0MltcImRlZmF1bHRcIl0uQ29tcG9uZW50KTtcblxuICAgIHJldHVybiB3cmFwcGVkO1xufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2hvY0FzRm9ybUZpZWxkID0gcmVxdWlyZShcIi4uL2hvYy9hc0Zvcm1GaWVsZFwiKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ob2NBc0Zvcm1GaWVsZCk7XG5cbnZhciBfaG9jV2l0aENob2ljZXMgPSByZXF1aXJlKCcuLi9ob2Mvd2l0aENob2ljZXMnKTtcblxudmFyIF9ob2NXaXRoQ2hvaWNlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ob2NXaXRoQ2hvaWNlcyk7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBBdXRvQ29tcGxldGUgPSBfcmVxdWlyZS5BdXRvQ29tcGxldGU7XG52YXIgTWVudUl0ZW0gPSBfcmVxdWlyZS5NZW51SXRlbTtcbnZhciBSZWZyZXNoSW5kaWNhdG9yID0gX3JlcXVpcmUuUmVmcmVzaEluZGljYXRvcjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuU3R5bGVzID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuU3R5bGVzO1xuXG52YXIgQXV0b2NvbXBsZXRlQm94ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEF1dG9jb21wbGV0ZUJveCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBBdXRvY29tcGxldGVCb3goKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBdXRvY29tcGxldGVCb3gpO1xuXG4gICAgICAgIF9SZWFjdCRDb21wb25lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBBdXRvY29tcGxldGVCb3gucHJvdG90eXBlLmhhbmRsZVVwZGF0ZUlucHV0ID0gZnVuY3Rpb24gaGFuZGxlVXBkYXRlSW5wdXQoc2VhcmNoVGV4dCkge1xuICAgICAgICAvL3RoaXMuc2V0U3RhdGUoe3NlYXJjaFRleHQ6IHNlYXJjaFRleHR9KTtcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlQm94LnByb3RvdHlwZS5oYW5kbGVOZXdSZXF1ZXN0ID0gZnVuY3Rpb24gaGFuZGxlTmV3UmVxdWVzdChjaG9zZW5WYWx1ZSkge1xuICAgICAgICBpZiAoY2hvc2VuVmFsdWUua2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobnVsbCwgY2hvc2VuVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShudWxsLCBjaG9zZW5WYWx1ZS5rZXkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEF1dG9jb21wbGV0ZUJveC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgY2hvaWNlcyA9IF9wcm9wcy5jaG9pY2VzO1xuICAgICAgICB2YXIgaXNEaXNwbGF5R3JpZCA9IF9wcm9wcy5pc0Rpc3BsYXlHcmlkO1xuICAgICAgICB2YXIgZWRpdE1vZGUgPSBfcHJvcHMuZWRpdE1vZGU7XG4gICAgICAgIHZhciBkaXNhYmxlZCA9IF9wcm9wcy5kaXNhYmxlZDtcbiAgICAgICAgdmFyIHRvZ2dsZUVkaXRNb2RlID0gX3Byb3BzLnRvZ2dsZUVkaXRNb2RlO1xuXG4gICAgICAgIHZhciBkYXRhU291cmNlID0gW107XG4gICAgICAgIHZhciBsYWJlbHMgPSB7fTtcbiAgICAgICAgY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIGtleSkge1xuICAgICAgICAgICAgZGF0YVNvdXJjZS5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBjaG9pY2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIE1lbnVJdGVtLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2VcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxhYmVsc1trZXldID0gY2hvaWNlO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlO1xuXG4gICAgICAgIGlmIChsYWJlbHMgJiYgbGFiZWxzW3ZhbHVlXSkge1xuICAgICAgICAgICAgdmFsdWUgPSBsYWJlbHNbdmFsdWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzRGlzcGxheUdyaWQoKSAmJiAhZWRpdE1vZGUgfHwgZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzLmdldCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGNob2ljZXMuZ2V0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRvZ2dsZUVkaXRNb2RlLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IHZhbHVlID8gJycgOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA/IHZhbHVlIDogJ0VtcHR5JyxcbiAgICAgICAgICAgICAgICAnIMKgwqAnLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2ljb24tY2FyZXQtZG93bicgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdweWRpb2Zvcm1fYXV0b2NvbXBsZXRlJywgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScgfSB9LFxuICAgICAgICAgICAgIWRhdGFTb3VyY2UubGVuZ3RoICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVmcmVzaEluZGljYXRvciwge1xuICAgICAgICAgICAgICAgIHNpemU6IDMwLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnbG9hZGluZydcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZGF0YVNvdXJjZS5sZW5ndGggJiYgUmVhY3QuY3JlYXRlRWxlbWVudChBdXRvQ29tcGxldGUsIF9leHRlbmRzKHtcbiAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VhcmNoVGV4dDogdmFsdWUsXG4gICAgICAgICAgICAgICAgb25VcGRhdGVJbnB1dDogZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmhhbmRsZVVwZGF0ZUlucHV0KHMpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25OZXdSZXF1ZXN0OiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuaGFuZGxlTmV3UmVxdWVzdCh2KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U6IGRhdGFTb3VyY2UsXG4gICAgICAgICAgICAgICAgaGludFRleHQ6IHRoaXMucHJvcHMuYXR0cmlidXRlc1snbGFiZWwnXSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uIChzZWFyY2hUZXh0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFrZXkgfHwgIXNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpID09PSAwO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3Blbk9uRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVudVByb3BzOiB7IG1heEhlaWdodDogMjAwIH1cbiAgICAgICAgICAgIH0sIE1vZGVyblN0eWxlcy50ZXh0RmllbGQpKVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICByZXR1cm4gQXV0b2NvbXBsZXRlQm94O1xufSkoUmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQXV0b2NvbXBsZXRlQm94ID0gX2hvY0FzRm9ybUZpZWxkMlsnZGVmYXVsdCddKEF1dG9jb21wbGV0ZUJveCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBBdXRvY29tcGxldGVCb3ggPSBfaG9jV2l0aENob2ljZXMyWydkZWZhdWx0J10oQXV0b2NvbXBsZXRlQm94KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEF1dG9jb21wbGV0ZUJveDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfaG9jQXNGb3JtRmllbGQgPSByZXF1aXJlKFwiLi4vaG9jL2FzRm9ybUZpZWxkXCIpO1xuXG52YXIgX2hvY0FzRm9ybUZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hvY0FzRm9ybUZpZWxkKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoLmRlYm91bmNlJyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBBdXRvQ29tcGxldGUgPSBfcmVxdWlyZS5BdXRvQ29tcGxldGU7XG52YXIgTWVudUl0ZW0gPSBfcmVxdWlyZS5NZW51SXRlbTtcbnZhciBSZWZyZXNoSW5kaWNhdG9yID0gX3JlcXVpcmUuUmVmcmVzaEluZGljYXRvcjtcbnZhciBGb250SWNvbiA9IF9yZXF1aXJlLkZvbnRJY29uO1xuXG52YXIgQXV0b2NvbXBsZXRlVHJlZSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhBdXRvY29tcGxldGVUcmVlLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEF1dG9jb21wbGV0ZVRyZWUoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBdXRvY29tcGxldGVUcmVlKTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgQXV0b2NvbXBsZXRlVHJlZS5wcm90b3R5cGUuaGFuZGxlVXBkYXRlSW5wdXQgPSBmdW5jdGlvbiBoYW5kbGVVcGRhdGVJbnB1dChzZWFyY2hUZXh0KSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VkKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0IH0pO1xuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGVUcmVlLnByb3RvdHlwZS5oYW5kbGVOZXdSZXF1ZXN0ID0gZnVuY3Rpb24gaGFuZGxlTmV3UmVxdWVzdChjaG9zZW5WYWx1ZSkge1xuICAgICAgICB2YXIga2V5ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoY2hvc2VuVmFsdWUua2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGtleSA9IGNob3NlblZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5ID0gY2hvc2VuVmFsdWUua2V5O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobnVsbCwga2V5KTtcbiAgICAgICAgdGhpcy5sb2FkVmFsdWVzKGtleSk7XG4gICAgfTtcblxuICAgIEF1dG9jb21wbGV0ZVRyZWUucHJvdG90eXBlLmNvbXBvbmVudFdpbGxNb3VudCA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgdGhpcy5kZWJvdW5jZWQgPSBkZWJvdW5jZSh0aGlzLmxvYWRWYWx1ZXMuYmluZCh0aGlzKSwgMzAwKTtcbiAgICAgICAgdGhpcy5sYXN0U2VhcmNoID0gbnVsbDtcbiAgICAgICAgdmFyIHZhbHVlID0gXCJcIjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvYWRWYWx1ZXModmFsdWUpO1xuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGVUcmVlLnByb3RvdHlwZS5sb2FkVmFsdWVzID0gZnVuY3Rpb24gbG9hZFZhbHVlcygpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICB2YXIgYmFzZVBhdGggPSB2YWx1ZTtcbiAgICAgICAgaWYgKCF2YWx1ZSAmJiB0aGlzLnN0YXRlLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIHZhciBsYXN0ID0gdGhpcy5zdGF0ZS5zZWFyY2hUZXh0Lmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuc3RhdGUuc2VhcmNoVGV4dC5zdWJzdHIoMCwgbGFzdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGFzdFNlYXJjaCAhPT0gbnVsbCAmJiB0aGlzLmxhc3RTZWFyY2ggPT09IGJhc2VQYXRoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0U2VhcmNoID0gYmFzZVBhdGg7XG4gICAgICAgIC8vIFRPRE8gOiBsb2FkIHZhbHVlcyBmcm9tIHNlcnZpY2VcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlVHJlZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgIHZhciBkYXRhU291cmNlID0gW107XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUubm9kZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBpY29uID0gXCJtZGkgbWRpLWZvbGRlclwiO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnV1aWQuc3RhcnRzV2l0aChcIkRBVEFTT1VSQ0U6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGljb24gPSBcIm1kaSBtZGktZGF0YWJhc2VcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGF0YVNvdXJjZS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBub2RlLnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IG5vZGUucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBNZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEZvbnRJY29uLCB7IGNsYXNzTmFtZTogaWNvbiwgY29sb3I6ICcjNjE2MTYxJywgc3R5bGU6IHsgZmxvYXQ6ICdsZWZ0JywgbWFyZ2luUmlnaHQ6IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucGF0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkaXNwbGF5VGV4dCA9IHRoaXMuc3RhdGUudmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncHlkaW9mb3JtX2F1dG9jb21wbGV0ZScsIHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnIH0gfSxcbiAgICAgICAgICAgICFkYXRhU291cmNlLmxlbmd0aCAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlZnJlc2hJbmRpY2F0b3IsIHtcbiAgICAgICAgICAgICAgICBzaXplOiAzMCxcbiAgICAgICAgICAgICAgICByaWdodDogMTAsXG4gICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ2xvYWRpbmcnXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXV0b0NvbXBsZXRlLCB7XG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlYXJjaFRleHQ6IGRpc3BsYXlUZXh0LFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlSW5wdXQ6IHRoaXMuaGFuZGxlVXBkYXRlSW5wdXQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvbk5ld1JlcXVlc3Q6IHRoaXMuaGFuZGxlTmV3UmVxdWVzdC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2U6IGRhdGFTb3VyY2UsXG4gICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMucHJvcHMuYXR0cmlidXRlc1snbGFiZWwnXSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGZ1bmN0aW9uIChzZWFyY2hUZXh0LCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKSA9PT0gMDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wZW5PbkZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1lbnVQcm9wczogeyBtYXhIZWlnaHQ6IDIwMCB9XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICByZXR1cm4gQXV0b2NvbXBsZXRlVHJlZTtcbn0pKFJlYWN0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IF9ob2NBc0Zvcm1GaWVsZDJbJ2RlZmF1bHQnXShBdXRvY29tcGxldGVUcmVlKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbi8qKlxuICogVUkgdG8gZHJvcCBhIGZpbGUgKG9yIGNsaWNrIHRvIGJyb3dzZSksIHVzZWQgYnkgdGhlIElucHV0SW1hZ2UgY29tcG9uZW50LlxuICovXG5cbnZhciBGaWxlRHJvcHpvbmUgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRmlsZURyb3B6b25lLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEZpbGVEcm9wem9uZShwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRmlsZURyb3B6b25lKTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmNhbGwodGhpcywgX2V4dGVuZHMoeyBvbkRyb3A6IGZ1bmN0aW9uIG9uRHJvcCgpIHt9IH0sIHByb3BzKSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpc0RyYWdBY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgc3VwcG9ydENsaWNrOiBwcm9wcy5zdXBwb3J0Q2xpY2sgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBwcm9wcy5zdXBwb3J0Q2xpY2ssXG4gICAgICAgICAgICBtdWx0aXBsZTogcHJvcHMubXVsdGlwbGUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBwcm9wcy5tdWx0aXBsZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIHByb3BUeXBlczoge1xuICAgIC8vICAgICBvbkRyb3AgICAgICAgICAgOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIC8vICAgICBpZ25vcmVOYXRpdmVEcm9wOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICAvLyAgICAgc2l6ZSAgICAgICAgICAgIDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICAvLyAgICAgc3R5bGUgICAgICAgICAgIDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAvLyAgICAgZHJhZ0FjdGl2ZVN0eWxlIDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAvLyAgICAgc3VwcG9ydENsaWNrICAgIDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgLy8gICAgIGFjY2VwdCAgICAgICAgICA6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgLy8gICAgIG11bHRpcGxlICAgICAgICA6IFJlYWN0LlByb3BUeXBlcy5ib29sXG4gICAgLy8gfSxcblxuICAgIEZpbGVEcm9wem9uZS5wcm90b3R5cGUub25EcmFnTGVhdmUgPSBmdW5jdGlvbiBvbkRyYWdMZWF2ZShlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNEcmFnQWN0aXZlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgRmlsZURyb3B6b25lLnByb3RvdHlwZS5vbkRyYWdPdmVyID0gZnVuY3Rpb24gb25EcmFnT3ZlcihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwiY29weVwiO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNEcmFnQWN0aXZlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBGaWxlRHJvcHpvbmUucHJvdG90eXBlLm9uRmlsZVBpY2tlZCA9IGZ1bmN0aW9uIG9uRmlsZVBpY2tlZChlKSB7XG4gICAgICAgIGlmICghZS50YXJnZXQgfHwgIWUudGFyZ2V0LmZpbGVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZpbGVzID0gZS50YXJnZXQuZmlsZXM7XG4gICAgICAgIHZhciBtYXhGaWxlcyA9IHRoaXMuc3RhdGUubXVsdGlwbGUgPyBmaWxlcy5sZW5ndGggOiAxO1xuICAgICAgICBmaWxlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZpbGVzLCAwLCBtYXhGaWxlcyk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRHJvcCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRyb3AoZmlsZXMsIGUsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEZpbGVEcm9wem9uZS5wcm90b3R5cGUub25Gb2xkZXJQaWNrZWQgPSBmdW5jdGlvbiBvbkZvbGRlclBpY2tlZChlKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRm9sZGVyUGlja2VkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRm9sZGVyUGlja2VkKGUudGFyZ2V0LmZpbGVzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBGaWxlRHJvcHpvbmUucHJvdG90eXBlLm9uRHJvcCA9IGZ1bmN0aW9uIG9uRHJvcChlKSB7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpc0RyYWdBY3RpdmU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlnbm9yZU5hdGl2ZURyb3ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaWxlcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGUuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgICAgICBmaWxlcyA9IGUuZGF0YVRyYW5zZmVyLmZpbGVzO1xuICAgICAgICB9IGVsc2UgaWYgKGUudGFyZ2V0KSB7XG4gICAgICAgICAgICBmaWxlcyA9IGUudGFyZ2V0LmZpbGVzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1heEZpbGVzID0gdGhpcy5zdGF0ZS5tdWx0aXBsZSA/IGZpbGVzLmxlbmd0aCA6IDE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWF4RmlsZXM7IGkrKykge1xuICAgICAgICAgICAgZmlsZXNbaV0ucHJldmlldyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25Ecm9wKSB7XG4gICAgICAgICAgICBmaWxlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZpbGVzLCAwLCBtYXhGaWxlcyk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRHJvcChmaWxlcywgZSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRmlsZURyb3B6b25lLnByb3RvdHlwZS5vbkNsaWNrID0gZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc3VwcG9ydENsaWNrID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBGaWxlRHJvcHpvbmUucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICB0aGlzLnJlZnMuZmlsZUlucHV0LmNsaWNrKCk7XG4gICAgfTtcblxuICAgIEZpbGVEcm9wem9uZS5wcm90b3R5cGUub3BlbkZvbGRlclBpY2tlciA9IGZ1bmN0aW9uIG9wZW5Gb2xkZXJQaWNrZXIoKSB7XG4gICAgICAgIHRoaXMucmVmcy5mb2xkZXJJbnB1dC5zZXRBdHRyaWJ1dGUoXCJ3ZWJraXRkaXJlY3RvcnlcIiwgXCJ0cnVlXCIpO1xuICAgICAgICB0aGlzLnJlZnMuZm9sZGVySW5wdXQuY2xpY2soKTtcbiAgICB9O1xuXG4gICAgRmlsZURyb3B6b25lLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IHRoaXMucHJvcHMuY2xhc3NOYW1lIHx8ICdmaWxlLWRyb3B6b25lJztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNEcmFnQWN0aXZlKSB7XG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gJyBhY3RpdmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICAgICAgd2lkdGg6IHRoaXMucHJvcHMuc2l6ZSB8fCAxMDAsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuc2l6ZSB8fCAxMDBcbiAgICAgICAgfTtcbiAgICAgICAgLy9ib3JkZXJTdHlsZTogdGhpcy5zdGF0ZS5pc0RyYWdBY3RpdmUgPyBcInNvbGlkXCIgOiBcImRhc2hlZFwiXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnN0eWxlKSB7XG4gICAgICAgICAgICBzdHlsZSA9IF9leHRlbmRzKHt9LCBzdHlsZSwgdGhpcy5wcm9wcy5zdHlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNEcmFnQWN0aXZlICYmIHRoaXMucHJvcHMuZHJhZ0FjdGl2ZVN0eWxlKSB7XG4gICAgICAgICAgICBzdHlsZSA9IF9leHRlbmRzKHt9LCBzdHlsZSwgdGhpcy5wcm9wcy5kcmFnQWN0aXZlU3R5bGUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmb2xkZXJJbnB1dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZW5hYmxlRm9sZGVycykge1xuICAgICAgICAgICAgZm9sZGVySW5wdXQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSwgbmFtZTogXCJ1c2VyZm9sZGVyXCIsIHR5cGU6IFwiZmlsZVwiLCByZWY6IFwiZm9sZGVySW5wdXRcIiwgb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5vbkZvbGRlclBpY2tlZChlKTtcbiAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIHN0eWxlOiBzdHlsZSwgb25DbGljazogdGhpcy5vbkNsaWNrLmJpbmQodGhpcyksIG9uRHJhZ0xlYXZlOiB0aGlzLm9uRHJhZ0xlYXZlLmJpbmQodGhpcyksIG9uRHJhZ092ZXI6IHRoaXMub25EcmFnT3Zlci5iaW5kKHRoaXMpLCBvbkRyb3A6IHRoaXMub25Ecm9wLmJpbmQodGhpcykgfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7IHN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9LCBuYW1lOiBcInVzZXJmaWxlXCIsIHR5cGU6IFwiZmlsZVwiLCBtdWx0aXBsZTogdGhpcy5zdGF0ZS5tdWx0aXBsZSwgcmVmOiBcImZpbGVJbnB1dFwiLCB2YWx1ZTogXCJcIiwgb25DaGFuZ2U6IHRoaXMub25GaWxlUGlja2VkLmJpbmQodGhpcyksIGFjY2VwdDogdGhpcy5wcm9wcy5hY2NlcHQgfSksXG4gICAgICAgICAgICBmb2xkZXJJbnB1dCxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEZpbGVEcm9wem9uZTtcbn0pKFJlYWN0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gRmlsZURyb3B6b25lO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoXCJtYXRlcmlhbC11aVwiKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZCA9IHJlcXVpcmUoXCIuLi9ob2MvYXNGb3JtRmllbGRcIik7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaG9jQXNGb3JtRmllbGQpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yW1wiZGVmYXVsdFwiXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblN0eWxlcyA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblN0eWxlcztcblxuLyoqXG4gKiBCb29sZWFuIGlucHV0XG4gKi9cblxudmFyIElucHV0Qm9vbGVhbiA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhJbnB1dEJvb2xlYW4sIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gSW5wdXRCb29sZWFuKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5wdXRCb29sZWFuKTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgSW5wdXRCb29sZWFuLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGJvb2xWYWwgPSB0aGlzLnByb3BzLnZhbHVlO1xuICAgICAgICBpZiAodHlwZW9mIGJvb2xWYWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBib29sVmFsID0gYm9vbFZhbCA9PT0gXCJ0cnVlXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRvZ2dsZSwgX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgIHRvZ2dsZWQ6IGJvb2xWYWwsXG4gICAgICAgICAgICAgICAgb25Ub2dnbGU6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5wcm9wcy5vbkNoYW5nZShlLCB2KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnByb3BzLmlzRGlzcGxheUZvcm0oKSA/IHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbCA6IG51bGwsXG4gICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjogdGhpcy5wcm9wcy5pc0Rpc3BsYXlGb3JtKCkgPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgICAgICAgICB9LCBNb2Rlcm5TdHlsZXMudG9nZ2xlRmllbGQpKVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICByZXR1cm4gSW5wdXRCb29sZWFuO1xufSkoX3JlYWN0MltcImRlZmF1bHRcIl0uQ29tcG9uZW50KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfaG9jQXNGb3JtRmllbGQyW1wiZGVmYXVsdFwiXShJbnB1dEJvb2xlYW4sIHRydWUpO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX0ZpbGVEcm9wem9uZSA9IHJlcXVpcmUoJy4vRmlsZURyb3B6b25lJyk7XG5cbnZhciBfRmlsZURyb3B6b25lMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ZpbGVEcm9wem9uZSk7XG5cbnZhciBfcHlkaW9VdGlsTGFuZyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsTGFuZyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE5hdGl2ZUZpbGVEcm9wUHJvdmlkZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5OYXRpdmVGaWxlRHJvcFByb3ZpZGVyO1xuXG4vLyBKdXN0IGVuYWJsZSB0aGUgZHJvcCBtZWNoYW5pc20sIGJ1dCBkbyBub3RoaW5nLCBpdCBpcyBtYW5hZ2VkIGJ5IHRoZSBGaWxlRHJvcHpvbmVcbnZhciBCaW5hcnlEcm9wWm9uZSA9IE5hdGl2ZUZpbGVEcm9wUHJvdmlkZXIoX0ZpbGVEcm9wem9uZTJbJ2RlZmF1bHQnXSwgZnVuY3Rpb24gKGl0ZW1zLCBmaWxlcywgcHJvcHMpIHt9KTtcblxuLyoqXG4gKiBVSSBmb3IgZGlzcGxheWluZyBhbmQgdXBsb2FkaW5nIGFuIGltYWdlLFxuICogdXNpbmcgdGhlIGJpbmFyeUNvbnRleHQgc3RyaW5nLlxuICovXG5cbnZhciBJbnB1dEltYWdlID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKElucHV0SW1hZ2UsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgLy8gcHJvcFR5cGVzOiB7XG4gICAgLy8gICAgIGF0dHJpYnV0ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgLy8gICAgIGJpbmFyeV9jb250ZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG4gICAgLy8gfSxcblxuICAgIGZ1bmN0aW9uIElucHV0SW1hZ2UocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIElucHV0SW1hZ2UpO1xuXG4gICAgICAgIF9SZWFjdCRDb21wb25lbnQuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHZhciBpbWFnZVNyYyA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9yaWdpbmFsQmluYXJ5ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgaW1hZ2VTcmMgPSB0aGlzLmdldEJpbmFyeVVybCh0aGlzLnByb3BzKTtcbiAgICAgICAgICAgIG9yaWdpbmFsQmluYXJ5ID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2RlZmF1bHRJbWFnZSddKSB7XG4gICAgICAgICAgICBpbWFnZVNyYyA9IHRoaXMucHJvcHMuYXR0cmlidXRlc1snZGVmYXVsdEltYWdlJ107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGltYWdlU3JjOiBpbWFnZVNyYyxcbiAgICAgICAgICAgIG9yaWdpbmFsQmluYXJ5OiBvcmlnaW5hbEJpbmFyeSxcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgSW5wdXRJbWFnZS5wcm90b3R5cGUuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgdmFyIGltZ1NyYyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKChuZXdQcm9wcy52YWx1ZSB8fCBuZXdQcm9wcy5iaW5hcnlfY29udGV4dCAmJiBuZXdQcm9wcy5iaW5hcnlfY29udGV4dCAhPT0gdGhpcy5wcm9wcy5iaW5hcnlfY29udGV4dCkgJiYgIXRoaXMuc3RhdGUucmVzZXQpIHtcbiAgICAgICAgICAgIGltZ1NyYyA9IHRoaXMuZ2V0QmluYXJ5VXJsKG5ld1Byb3BzLCB0aGlzLnN0YXRlLnRlbXBvcmFyeUJpbmFyeSAmJiB0aGlzLnN0YXRlLnRlbXBvcmFyeUJpbmFyeSA9PT0gbmV3UHJvcHMudmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKG5ld1Byb3BzLmF0dHJpYnV0ZXNbJ2RlZmF1bHRJbWFnZSddKSB7XG4gICAgICAgICAgICBpbWdTcmMgPSBuZXdQcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW1nU3JjKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaW1hZ2VTcmM6IGltZ1NyYywgcmVzZXQ6IGZhbHNlLCB2YWx1ZTogbmV3UHJvcHMudmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgSW5wdXRJbWFnZS5wcm90b3R5cGUuZ2V0QmluYXJ5VXJsID0gZnVuY3Rpb24gZ2V0QmluYXJ5VXJsKHByb3BzKSB7XG4gICAgICAgIHZhciBweWRpbyA9IF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0Q2xpZW50KCkuZ2V0UHlkaW9PYmplY3QoKTtcbiAgICAgICAgdmFyIHVybCA9IHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdFTkRQT0lOVF9SRVNUX0FQSScpICsgcHJvcHMuYXR0cmlidXRlc1snbG9hZEFjdGlvbiddO1xuICAgICAgICB2YXIgYklkID0gcHJvcHMudmFsdWU7XG4gICAgICAgIGlmIChwcm9wcy5iaW5hcnlfY29udGV4dCAmJiBwcm9wcy5iaW5hcnlfY29udGV4dC5pbmRleE9mKCd1c2VyX2lkPScpID09PSAwKSB7XG4gICAgICAgICAgICBiSWQgPSBwcm9wcy5iaW5hcnlfY29udGV4dC5yZXBsYWNlKCd1c2VyX2lkPScsICcnKTtcbiAgICAgICAgfVxuICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgne0JJTkFSWX0nLCBiSWQpO1xuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH07XG5cbiAgICBJbnB1dEltYWdlLnByb3RvdHlwZS5nZXRVcGxvYWRVcmwgPSBmdW5jdGlvbiBnZXRVcGxvYWRVcmwoKSB7XG4gICAgICAgIHZhciBweWRpbyA9IF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0Q2xpZW50KCkuZ2V0UHlkaW9PYmplY3QoKTtcbiAgICAgICAgdmFyIHVybCA9IHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdFTkRQT0lOVF9SRVNUX0FQSScpICsgdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd1cGxvYWRBY3Rpb24nXTtcbiAgICAgICAgdmFyIGJJZCA9ICcnO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5iaW5hcnlfY29udGV4dCAmJiB0aGlzLnByb3BzLmJpbmFyeV9jb250ZXh0LmluZGV4T2YoJ3VzZXJfaWQ9JykgPT09IDApIHtcbiAgICAgICAgICAgIGJJZCA9IHRoaXMucHJvcHMuYmluYXJ5X2NvbnRleHQucmVwbGFjZSgndXNlcl9pZD0nLCAnJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgYklkID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJJZCA9IF9weWRpb1V0aWxMYW5nMlsnZGVmYXVsdCddLmNvbXB1dGVTdHJpbmdTbHVnKHRoaXMucHJvcHMuYXR0cmlidXRlc1tcIm5hbWVcIl0gKyBcIi5wbmdcIik7XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJ3tCSU5BUll9JywgYklkKTtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9O1xuXG4gICAgSW5wdXRJbWFnZS5wcm90b3R5cGUudXBsb2FkQ29tcGxldGUgPSBmdW5jdGlvbiB1cGxvYWRDb21wbGV0ZShuZXdCaW5hcnlOYW1lKSB7XG4gICAgICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRlbXBvcmFyeUJpbmFyeTogbmV3QmluYXJ5TmFtZSxcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIGFkZGl0aW9uYWxGb3JtRGF0YSA9IHsgdHlwZTogJ2JpbmFyeScgfTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLm9yaWdpbmFsQmluYXJ5KSB7XG4gICAgICAgICAgICAgICAgYWRkaXRpb25hbEZvcm1EYXRhWydvcmlnaW5hbF9iaW5hcnknXSA9IHRoaXMuc3RhdGUub3JpZ2luYWxCaW5hcnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld0JpbmFyeU5hbWUsIHByZXZWYWx1ZSwgYWRkaXRpb25hbEZvcm1EYXRhKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGRpcnR5OiB0cnVlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBuZXdCaW5hcnlOYW1lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBJbnB1dEltYWdlLnByb3RvdHlwZS5odG1sVXBsb2FkID0gZnVuY3Rpb24gaHRtbFVwbG9hZCgpIHtcbiAgICAgICAgd2luZG93LmZvcm1NYW5hZ2VySGlkZGVuSUZyYW1lU3VibWlzc2lvbiA9IChmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICB0aGlzLnVwbG9hZENvbXBsZXRlKHJlc3VsdC50cmltKCkpO1xuICAgICAgICAgICAgd2luZG93LmZvcm1NYW5hZ2VySGlkZGVuSUZyYW1lU3VibWlzc2lvbiA9IG51bGw7XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucmVmcy51cGxvYWRGb3JtLnN1Ym1pdCgpO1xuICAgIH07XG5cbiAgICBJbnB1dEltYWdlLnByb3RvdHlwZS5vbkRyb3AgPSBmdW5jdGlvbiBvbkRyb3AoZmlsZXMsIGV2ZW50LCBkcm9wem9uZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWVzc2FnZXMgPSBfcHlkaW8yWydkZWZhdWx0J10uZ2V0TWVzc2FnZXMoKTtcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnByb3BzLm5hbWU7XG5cbiAgICAgICAgaWYgKG5hbWUgPT09ICdhdmF0YXInICYmIGZpbGVzWzBdLnNpemUgPiA1ICogMTAyNCAqIDEwMjQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbWVzc2FnZXNbJ2Zvcm0uaW5wdXQtaW1hZ2UuYXZhdGFyTWF4J10gfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFsnaW1hZ2UvanBlZycsICdpbWFnZS9wbmcnLCAnaW1hZ2UvYm1wJywgJ2ltYWdlL3RpZmYnLCAnaW1hZ2Uvd2VicCddLmluZGV4T2YoZmlsZXNbMF0udHlwZSkgPT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG1lc3NhZ2VzWydmb3JtLmlucHV0LWltYWdlLmZpbGVUeXBlcyddIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KTtcbiAgICAgICAgaWYgKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uc3VwcG9ydHNVcGxvYWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG4gICAgICAgICAgICBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKS5nZXRPclVwZGF0ZUp3dCgpLnRoZW4oZnVuY3Rpb24gKGp3dCkge1xuICAgICAgICAgICAgICAgIHZhciB4aHJTZXR0aW5ncyA9IHsgY3VzdG9tSGVhZGVyczogeyBBdXRob3JpemF0aW9uOiAnQmVhcmVyICcgKyBqd3QgfSB9O1xuICAgICAgICAgICAgICAgIF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0Q2xpZW50KCkudXBsb2FkRmlsZShmaWxlc1swXSwgXCJ1c2VyZmlsZVwiLCAnJywgZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gSlNPTi5wYXJzZSh0cmFuc3BvcnQucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuYmluYXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGxvYWRDb21wbGV0ZShyZXN1bHQuYmluYXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBlcnJvclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlLCBlcnJvcjogZXJyb3IgfSk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGNvbXB1dGFibGVFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBwcm9ncmVzcywgbm90IHJlYWxseSB1c2VmdWwgZm9yIHNtYWxsIHVwbG9hZHNcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY29tcHV0YWJsZUV2ZW50KTtcbiAgICAgICAgICAgICAgICB9LCBfdGhpcy5nZXRVcGxvYWRVcmwoKSwgeGhyU2V0dGluZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmh0bWxVcGxvYWQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBJbnB1dEltYWdlLnByb3RvdHlwZS5jbGVhckltYWdlID0gZnVuY3Rpb24gY2xlYXJJbWFnZSgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKGNvbmZpcm0oX3B5ZGlvMlsnZGVmYXVsdCddLmdldE1lc3NhZ2VzKClbJ2Zvcm0uaW5wdXQtaW1hZ2UuY2xlYXJDb25maXJtJ10pKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBwcmV2VmFsdWUgPSBfdGhpczIuc3RhdGUudmFsdWU7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICByZXNldDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoJycsIHByZXZWYWx1ZSwgeyB0eXBlOiAnYmluYXJ5JyB9KTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKF90aGlzMikpO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBJbnB1dEltYWdlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgbG9hZGluZyA9IF9zdGF0ZS5sb2FkaW5nO1xuICAgICAgICB2YXIgZXJyb3IgPSBfc3RhdGUuZXJyb3I7XG5cbiAgICAgICAgdmFyIGNvdmVySW1hZ2VTdHlsZSA9IHtcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogXCJ1cmwoXCIgKyB0aGlzLnN0YXRlLmltYWdlU3JjICsgXCIpXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb246IFwiNTAlIDUwJVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6IFwiY292ZXJcIixcbiAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gICAgICAgIH07XG4gICAgICAgIHZhciBvdmVybGF5ID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgb3ZlcmxheUJnID0ge307XG4gICAgICAgIHZhciBpc0RlZmF1bHQgPSB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2RlZmF1bHRJbWFnZSddICYmIHRoaXMucHJvcHMuYXR0cmlidXRlc1snZGVmYXVsdEltYWdlJ10gPT09IHRoaXMuc3RhdGUuaW1hZ2VTcmM7XG5cbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBvdmVybGF5QmcgPSB7IGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC43NyknLCBib3JkZXJSYWRpdXM6ICc1MCUnIH07XG4gICAgICAgICAgICBvdmVybGF5ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJyNGNDQzMzYnLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBmb250U2l6ZTogMTEsIGN1cnNvcjogJ3BvaW50ZXInIH0sIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLWFsZXJ0XCIsIHN0eWxlOiB7IGZvbnRTaXplOiA0MCB9IH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdicicsIG51bGwpLFxuICAgICAgICAgICAgICAgIGVycm9yXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKGxvYWRpbmcpIHtcbiAgICAgICAgICAgIG92ZXJsYXkgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaXJjdWxhclByb2dyZXNzLCB7IG1vZGU6IFwiaW5kZXRlcm1pbmF0ZVwiIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3ZlcmxheSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1jYW1lcmFcIiwgc3R5bGU6IHsgZm9udFNpemU6IDQwLCBvcGFjaXR5OiAuNSwgY29sb3I6IGlzRGVmYXVsdCA/IG51bGwgOiAnd2hpdGUnIH0gfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2ltYWdlLWxhYmVsJyB9LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYXR0cmlidXRlcy5sYWJlbFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAgICAgICB7IHJlZjogJ3VwbG9hZEZvcm0nLCBlbmNUeXBlOiAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScsIHRhcmdldDogJ3VwbG9hZGVyX2hpZGRlbl9pZnJhbWUnLCBtZXRob2Q6ICdwb3N0JywgYWN0aW9uOiB0aGlzLmdldFVwbG9hZFVybCgpIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIEJpbmFyeURyb3Bab25lLFxuICAgICAgICAgICAgICAgICAgICB7IG9uRHJvcDogdGhpcy5vbkRyb3AuYmluZCh0aGlzKSwgYWNjZXB0OiAnaW1hZ2UvKicsIHN0eWxlOiBjb3ZlckltYWdlU3R5bGUgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJScsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9LCBvdmVybGF5QmcpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVybGF5XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgIWlzRGVmYXVsdCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2JpbmFyeS1yZW1vdmUtYnV0dG9uJywgb25DbGljazogdGhpcy5jbGVhckltYWdlLmJpbmQodGhpcykgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiAncmVtb3ZlJywgY2xhc3NOYW1lOiAnbWRpIG1kaS1jbG9zZScgfSksXG4gICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgIF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRNZXNzYWdlcygpWydmb3JtLmlucHV0LWltYWdlLmNsZWFyQnV0dG9uJ11cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnaWZyYW1lJywgeyBzdHlsZTogeyBkaXNwbGF5OiBcIm5vbmVcIiB9LCBpZDogJ3VwbG9hZGVyX2hpZGRlbl9pZnJhbWUnLCBuYW1lOiAndXBsb2FkZXJfaGlkZGVuX2lmcmFtZScgfSlcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIElucHV0SW1hZ2U7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSW5wdXRJbWFnZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2hvY0FzRm9ybUZpZWxkID0gcmVxdWlyZShcIi4uL2hvYy9hc0Zvcm1GaWVsZFwiKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ob2NBc0Zvcm1GaWVsZCk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblRleHRGaWVsZCA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblRleHRGaWVsZDtcblxuLyoqXG4gKiBUZXh0IGlucHV0IHRoYXQgaXMgY29udmVydGVkIHRvIGludGVnZXIsIGFuZFxuICogdGhlIFVJIGNhbiByZWFjdCB0byBhcnJvd3MgZm9yIGluY3JlbWVudGluZy9kZWNyZW1lbnRpbmcgdmFsdWVzXG4gKi9cblxudmFyIElucHV0SW50ZWdlciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhJbnB1dEludGVnZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gSW5wdXRJbnRlZ2VyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5wdXRJbnRlZ2VyKTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgSW5wdXRJbnRlZ2VyLnByb3RvdHlwZS5rZXlEb3duID0gZnVuY3Rpb24ga2V5RG93bihldmVudCkge1xuICAgICAgICB2YXIgaW5jID0gMCxcbiAgICAgICAgICAgIG11bHRpcGxlID0gMTtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy50b2dnbGVFZGl0TW9kZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgICAgICAgICBpbmMgPSArMTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT09ICdBcnJvd0Rvd24nKSB7XG4gICAgICAgICAgICBpbmMgPSAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIG11bHRpcGxlID0gMTA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHRoaXMucHJvcHMudmFsdWUpO1xuICAgICAgICBpZiAoaXNOYU4ocGFyc2VkKSkge1xuICAgICAgICAgICAgcGFyc2VkID0gMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdmFsdWUgPSBwYXJzZWQgKyBpbmMgKiBtdWx0aXBsZTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShudWxsLCB2YWx1ZSk7XG4gICAgfTtcblxuICAgIElucHV0SW50ZWdlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgdmFsdWUgPSBfcHJvcHMudmFsdWU7XG4gICAgICAgIHZhciBpc0Rpc3BsYXlHcmlkID0gX3Byb3BzLmlzRGlzcGxheUdyaWQ7XG4gICAgICAgIHZhciBpc0Rpc3BsYXlGb3JtID0gX3Byb3BzLmlzRGlzcGxheUZvcm07XG4gICAgICAgIHZhciBlZGl0TW9kZSA9IF9wcm9wcy5lZGl0TW9kZTtcbiAgICAgICAgdmFyIGRpc2FibGVkID0gX3Byb3BzLmRpc2FibGVkO1xuICAgICAgICB2YXIgdG9nZ2xlRWRpdE1vZGUgPSBfcHJvcHMudG9nZ2xlRWRpdE1vZGU7XG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0gX3Byb3BzLmF0dHJpYnV0ZXM7XG5cbiAgICAgICAgaWYgKGlzRGlzcGxheUdyaWQoKSAmJiAhZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IGRpc2FibGVkID8gZnVuY3Rpb24gKCkge30gOiB0b2dnbGVFZGl0TW9kZSwgY2xhc3NOYW1lOiB2YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgdmFsdWUgPyB2YWx1ZSA6ICdFbXB0eSdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgaW50dmFsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaW50dmFsID0gcGFyc2VJbnQodmFsdWUpICsgJyc7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGludHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW50dmFsID0gdmFsdWUgKyAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGludHZhbCA9ICcwJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbnRlZ2VyLWlucHV0JyB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaW50dmFsLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5wcm9wcy5vbkNoYW5nZShlLCB2KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmtleURvd24oZSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBoaW50VGV4dDogaXNEaXNwbGF5Rm9ybSgpID8gYXR0cmlidXRlcy5sYWJlbCA6IG51bGxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gSW5wdXRJbnRlZ2VyO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IF9ob2NBc0Zvcm1GaWVsZDJbJ2RlZmF1bHQnXShJbnB1dEludGVnZXIpO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9ob2NBc0Zvcm1GaWVsZCA9IHJlcXVpcmUoXCIuLi9ob2MvYXNGb3JtRmllbGRcIik7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaG9jQXNGb3JtRmllbGQpO1xuXG52YXIgX2hvY1dpdGhDaG9pY2VzID0gcmVxdWlyZSgnLi4vaG9jL3dpdGhDaG9pY2VzJyk7XG5cbnZhciBfaG9jV2l0aENob2ljZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaG9jV2l0aENob2ljZXMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBTZWxlY3RGaWVsZCA9IF9yZXF1aXJlLlNlbGVjdEZpZWxkO1xudmFyIE1lbnVJdGVtID0gX3JlcXVpcmUuTWVudUl0ZW07XG52YXIgQ2hpcCA9IF9yZXF1aXJlLkNoaXA7XG5cbnZhciBMYW5nVXRpbHMgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuU2VsZWN0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5TZWxlY3RGaWVsZDtcblxuLyoqXG4gKiBTZWxlY3QgYm94IGlucHV0IGNvbmZvcm1pbmcgdG8gUHlkaW8gc3RhbmRhcmQgZm9ybSBwYXJhbWV0ZXIuXG4gKi9cblxudmFyIElucHV0U2VsZWN0Qm94ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKElucHV0U2VsZWN0Qm94LCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIElucHV0U2VsZWN0Qm94KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5wdXRTZWxlY3RCb3gpO1xuXG4gICAgICAgIF9SZWFjdCRDb21wb25lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBJbnB1dFNlbGVjdEJveC5wcm90b3R5cGUub25Ecm9wRG93bkNoYW5nZSA9IGZ1bmN0aW9uIG9uRHJvcERvd25DaGFuZ2UoZXZlbnQsIGluZGV4LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50LCB2YWx1ZSk7XG4gICAgICAgIHRoaXMucHJvcHMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICB9O1xuXG4gICAgSW5wdXRTZWxlY3RCb3gucHJvdG90eXBlLm9uTXVsdGlwbGVTZWxlY3QgPSBmdW5jdGlvbiBvbk11bHRpcGxlU2VsZWN0KGV2ZW50LCBpbmRleCwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKG5ld1ZhbHVlID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlO1xuICAgICAgICB2YXIgY3VycmVudFZhbHVlcyA9IHR5cGVvZiBjdXJyZW50VmFsdWUgPT09ICdzdHJpbmcnID8gY3VycmVudFZhbHVlLnNwbGl0KCcsJykgOiBjdXJyZW50VmFsdWU7XG4gICAgICAgIGlmICghY3VycmVudFZhbHVlcy5pbmRleE9mKG5ld1ZhbHVlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZXMucHVzaChuZXdWYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50LCBjdXJyZW50VmFsdWVzLmpvaW4oJywnKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcm9wcy50b2dnbGVFZGl0TW9kZSgpO1xuICAgIH07XG5cbiAgICBJbnB1dFNlbGVjdEJveC5wcm90b3R5cGUub25NdWx0aXBsZVJlbW92ZSA9IGZ1bmN0aW9uIG9uTXVsdGlwbGVSZW1vdmUodmFsdWUpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIHZhciBjdXJyZW50VmFsdWVzID0gdHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gJ3N0cmluZycgPyBjdXJyZW50VmFsdWUuc3BsaXQoJywnKSA6IGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSkgIT09IC0xKSB7XG4gICAgICAgICAgICBjdXJyZW50VmFsdWVzID0gTGFuZ1V0aWxzLmFycmF5V2l0aG91dChjdXJyZW50VmFsdWVzLCBjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobnVsbCwgY3VycmVudFZhbHVlcy5qb2luKCcsJykpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIElucHV0U2VsZWN0Qm94LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIHZhciBtZW51SXRlbXMgPSBbXSxcbiAgICAgICAgICAgIG11bHRpcGxlT3B0aW9ucyA9IFtdO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuYXR0cmlidXRlc1snbWFuZGF0b3J5J10gfHwgdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydtYW5kYXRvcnknXSAhPT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgdmFsdWU6IC0xLCBwcmltYXJ5VGV4dDogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydsYWJlbCddICsgJy4uLicgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjaG9pY2VzID0gdGhpcy5wcm9wcy5jaG9pY2VzO1xuXG4gICAgICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwgeyB2YWx1ZToga2V5LCBwcmltYXJ5VGV4dDogdmFsdWUgfSkpO1xuICAgICAgICAgICAgbXVsdGlwbGVPcHRpb25zLnB1c2goeyB2YWx1ZToga2V5LCBsYWJlbDogdmFsdWUgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc0Rpc3BsYXlHcmlkKCkgJiYgIXRoaXMucHJvcHMuZWRpdE1vZGUgfHwgdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzLmdldCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGNob2ljZXMuZ2V0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5wcm9wcy5kaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdGhpcy5wcm9wcy50b2dnbGVFZGl0TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiB2YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgdmFsdWUgPyB2YWx1ZSA6ICdFbXB0eScsXG4gICAgICAgICAgICAgICAgJyDCoMKgJyxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdpY29uLWNhcmV0LWRvd24nIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubXVsdGlwbGUgJiYgdGhpcy5wcm9wcy5tdWx0aXBsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmFsdWVzID0gY3VycmVudFZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudFZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZXMgPSBjdXJyZW50VmFsdWUuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJtdWx0aXBsZSBoYXMtdmFsdWVcIiB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWVzLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDaGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uUmVxdWVzdERlbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm9uTXVsdGlwbGVSZW1vdmUodik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vZGVyblNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIGksIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLm9uTXVsdGlwbGVTZWxlY3QoZSwgaSwgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vZGVyblNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiB0aGlzLnByb3BzLmF0dHJpYnV0ZXMubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIGksIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLm9uRHJvcERvd25DaGFuZ2UoZSwgaSwgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gSW5wdXRTZWxlY3RCb3g7XG59KShSZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBJbnB1dFNlbGVjdEJveCA9IF9ob2NBc0Zvcm1GaWVsZDJbJ2RlZmF1bHQnXShJbnB1dFNlbGVjdEJveCwgdHJ1ZSk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBJbnB1dFNlbGVjdEJveCA9IF9ob2NXaXRoQ2hvaWNlczJbJ2RlZmF1bHQnXShJbnB1dFNlbGVjdEJveCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBJbnB1dFNlbGVjdEJveDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2hvY0FzRm9ybUZpZWxkID0gcmVxdWlyZShcIi4uL2hvYy9hc0Zvcm1GaWVsZFwiKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ob2NBc0Zvcm1GaWVsZCk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblRleHRGaWVsZCA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblRleHRGaWVsZDtcblxuLyoqXG4gKiBUZXh0IGlucHV0LCBjYW4gYmUgc2luZ2xlIGxpbmUsIG11bHRpTGluZSwgb3IgcGFzc3dvcmQsIGRlcGVuZGluZyBvbiB0aGVcbiAqIGF0dHJpYnV0ZXMudHlwZSBrZXkuXG4gKi9cblxudmFyIFRleHRGaWVsZCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhUZXh0RmllbGQsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVGV4dEZpZWxkKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVGV4dEZpZWxkKTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgVGV4dEZpZWxkLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgZWRpdE1vZGUgPSBfcHJvcHMuZWRpdE1vZGU7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9wcm9wcy52YWx1ZTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc0Rpc3BsYXlHcmlkKCkgJiYgIWVkaXRNb2RlKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gdmFsdWU7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSAnKioqKioqKioqKionO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgb25DbGljazogdGhpcy5wcm9wcy5kaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdGhpcy5wcm9wcy50b2dnbGVFZGl0TW9kZSwgY2xhc3NOYW1lOiB2YWwgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgIHZhbCA/IHZhbCA6ICdFbXB0eSdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICBoaW50VGV4dDogdGhpcy5wcm9wcy5pc0Rpc3BsYXlGb3JtKCkgPyB0aGlzLnByb3BzLmF0dHJpYnV0ZXMubGFiZWwgOiBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLnByb3BzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5wcm9wcy5lbnRlclRvVG9nZ2xlLFxuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnID8gJ3Bhc3N3b3JkJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgbXVsdGlMaW5lOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3RleHRhcmVhJyxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMucHJvcHMuZXJyb3JUZXh0LFxuICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogJ29mZicsXG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2Zvcm0nLFxuICAgICAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogJ29mZicsIG9uU3VibWl0OiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgc3R5bGU6IHsgZGlzcGxheTogJ2lubGluZScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFRleHRGaWVsZDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBfaG9jQXNGb3JtRmllbGQyWydkZWZhdWx0J10oVGV4dEZpZWxkKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZCA9IHJlcXVpcmUoXCIuLi9ob2MvYXNGb3JtRmllbGRcIik7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaG9jQXNGb3JtRmllbGQpO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MgPSByZXF1aXJlKCdweWRpby91dGlsL3Bhc3MnKTtcblxudmFyIF9weWRpb1V0aWxQYXNzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbFBhc3MpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yW1wiZGVmYXVsdFwiXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblRleHRGaWVsZCA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblRleHRGaWVsZDtcblxuLyoqXG4gKiBUZXh0IGlucHV0LCBjYW4gYmUgc2luZ2xlIGxpbmUsIG11bHRpTGluZSwgb3IgcGFzc3dvcmQsIGRlcGVuZGluZyBvbiB0aGVcbiAqIGF0dHJpYnV0ZXMudHlwZSBrZXkuXG4gKi9cblxudmFyIFZhbGlkTG9naW4gPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVmFsaWRMb2dpbiwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBWYWxpZExvZ2luKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVmFsaWRMb2dpbik7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIFZhbGlkTG9naW4ucHJvdG90eXBlLnRleHRWYWx1ZUNoYW5nZWQgPSBmdW5jdGlvbiB0ZXh0VmFsdWVDaGFuZ2VkKGV2ZW50LCB2YWx1ZSkge1xuICAgICAgICB2YXIgZXJyID0gX3B5ZGlvVXRpbFBhc3MyW1wiZGVmYXVsdFwiXS5pc1ZhbGlkTG9naW4odmFsdWUpO1xuICAgICAgICB2YXIgcHJldlN0YXRlVmFsaWQgPSB0aGlzLnN0YXRlLnZhbGlkO1xuICAgICAgICB2YXIgdmFsaWQgPSAhZXJyO1xuICAgICAgICBpZiAocHJldlN0YXRlVmFsaWQgIT09IHZhbGlkICYmIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKHZhbGlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsaWQ6IHZhbGlkLCBlcnI6IGVyciB9KTtcblxuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50LCB2YWx1ZSk7XG4gICAgfTtcblxuICAgIFZhbGlkTG9naW4ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGlzRGlzcGxheUdyaWQgPSBfcHJvcHMuaXNEaXNwbGF5R3JpZDtcbiAgICAgICAgdmFyIGlzRGlzcGxheUZvcm0gPSBfcHJvcHMuaXNEaXNwbGF5Rm9ybTtcbiAgICAgICAgdmFyIGVkaXRNb2RlID0gX3Byb3BzLmVkaXRNb2RlO1xuICAgICAgICB2YXIgZGlzYWJsZWQgPSBfcHJvcHMuZGlzYWJsZWQ7XG4gICAgICAgIHZhciBlcnJvclRleHQgPSBfcHJvcHMuZXJyb3JUZXh0O1xuICAgICAgICB2YXIgZW50ZXJUb1RvZ2dsZSA9IF9wcm9wcy5lbnRlclRvVG9nZ2xlO1xuICAgICAgICB2YXIgdG9nZ2xlRWRpdE1vZGUgPSBfcHJvcHMudG9nZ2xlRWRpdE1vZGU7XG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0gX3Byb3BzLmF0dHJpYnV0ZXM7XG5cbiAgICAgICAgaWYgKGlzRGlzcGxheUdyaWQoKSAmJiAhZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHZhciBfdmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlO1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnICYmIF92YWx1ZSkge1xuICAgICAgICAgICAgICAgIF92YWx1ZSA9ICcqKioqKioqKioqKic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgb25DbGljazogZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRvZ2dsZUVkaXRNb2RlLCBjbGFzc05hbWU6IF92YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgX3ZhbHVlID8gX3ZhbHVlIDogJ0VtcHR5J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSB0aGlzLnN0YXRlLmVycjtcblxuICAgICAgICAgICAgdmFyIGZpZWxkID0gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogaXNEaXNwbGF5Rm9ybSgpID8gYXR0cmlidXRlcy5sYWJlbCA6IG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50ZXh0VmFsdWVDaGFuZ2VkKGUsIHYpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25LZXlEb3duOiBlbnRlclRvVG9nZ2xlLFxuICAgICAgICAgICAgICAgIHR5cGU6IGF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJyA/ICdwYXNzd29yZCcgOiBudWxsLFxuICAgICAgICAgICAgICAgIG11bHRpTGluZTogYXR0cmlidXRlc1sndHlwZSddID09PSAndGV4dGFyZWEnLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IGVycm9yVGV4dCB8fCBlcnIsXG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiBcIm9mZlwiLFxuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwiZm9ybVwiLFxuICAgICAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogXCJvZmZcIiwgb25TdWJtaXQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBzdHlsZTogeyBkaXNwbGF5OiAnaW5saW5lJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFZhbGlkTG9naW47XG59KShfcmVhY3QyW1wiZGVmYXVsdFwiXS5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9ob2NBc0Zvcm1GaWVsZDJbXCJkZWZhdWx0XCJdKFZhbGlkTG9naW4pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzcyA9IHJlcXVpcmUoXCJweWRpby91dGlsL3Bhc3NcIik7XG5cbnZhciBfcHlkaW9VdGlsUGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXNzKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZCA9IHJlcXVpcmUoXCIuLi9ob2MvYXNGb3JtRmllbGRcIik7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaG9jQXNGb3JtRmllbGQpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yW1wiZGVmYXVsdFwiXS5yZXF1aXJlTGliKFwiaG9jXCIpO1xuXG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuVGV4dEZpZWxkO1xuXG52YXIgVmFsaWRQYXNzd29yZCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhWYWxpZFBhc3N3b3JkLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFZhbGlkUGFzc3dvcmQocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFZhbGlkUGFzc3dvcmQpO1xuXG4gICAgICAgIF9SZWFjdCRDb21wb25lbnQuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB9XG5cbiAgICBWYWxpZFBhc3N3b3JkLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24gaXNWYWxpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudmFsaWQ7XG4gICAgfTtcblxuICAgIFZhbGlkUGFzc3dvcmQucHJvdG90eXBlLmNoZWNrTWluTGVuZ3RoID0gZnVuY3Rpb24gY2hlY2tNaW5MZW5ndGgodmFsdWUpIHtcbiAgICAgICAgdmFyIG1pbkxlbmd0aCA9IHBhcnNlSW50KF9weWRpbzJbXCJkZWZhdWx0XCJdLmdldEluc3RhbmNlKCkuZ2V0UGx1Z2luQ29uZmlncyhcImNvcmUuYXV0aFwiKS5nZXQoXCJQQVNTV09SRF9NSU5MRU5HVEhcIikpO1xuICAgICAgICByZXR1cm4gISh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGggPCBtaW5MZW5ndGgpO1xuICAgIH07XG5cbiAgICBWYWxpZFBhc3N3b3JkLnByb3RvdHlwZS5nZXRNZXNzYWdlID0gZnVuY3Rpb24gZ2V0TWVzc2FnZShtZXNzYWdlSWQpIHtcbiAgICAgICAgcmV0dXJuIF9weWRpbzJbXCJkZWZhdWx0XCJdLmdldE1lc3NhZ2VzKClbbWVzc2FnZUlkXSB8fCBtZXNzYWdlSWQ7XG4gICAgfTtcblxuICAgIFZhbGlkUGFzc3dvcmQucHJvdG90eXBlLnVwZGF0ZVBhc3NTdGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZVBhc3NTdGF0ZSgpIHtcbiAgICAgICAgdmFyIHByZXZTdGF0ZVZhbGlkID0gdGhpcy5zdGF0ZS52YWxpZDtcbiAgICAgICAgdmFyIG5ld1N0YXRlID0gX3B5ZGlvVXRpbFBhc3MyW1wiZGVmYXVsdFwiXS5nZXRTdGF0ZSh0aGlzLnJlZnMucGFzcy5nZXRWYWx1ZSgpLCB0aGlzLnJlZnMuY29uZmlybSA/IHRoaXMucmVmcy5jb25maXJtLmdldFZhbHVlKCkgOiAnJyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgICAgICBpZiAocHJldlN0YXRlVmFsaWQgIT09IG5ld1N0YXRlLnZhbGlkICYmIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKG5ld1N0YXRlLnZhbGlkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBWYWxpZFBhc3N3b3JkLnByb3RvdHlwZS5vblBhc3N3b3JkQ2hhbmdlID0gZnVuY3Rpb24gb25QYXNzd29yZENoYW5nZShldmVudCkge1xuICAgICAgICB0aGlzLnVwZGF0ZVBhc3NTdGF0ZSgpO1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50LCBldmVudC50YXJnZXQudmFsdWUpO1xuICAgIH07XG5cbiAgICBWYWxpZFBhc3N3b3JkLnByb3RvdHlwZS5vbkNvbmZpcm1DaGFuZ2UgPSBmdW5jdGlvbiBvbkNvbmZpcm1DaGFuZ2UoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbmZpcm1WYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZVBhc3NTdGF0ZSgpO1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50LCB0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICB9O1xuXG4gICAgVmFsaWRQYXNzd29yZC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGRpc2FibGVkID0gX3Byb3BzLmRpc2FibGVkO1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gX3Byb3BzLmNsYXNzTmFtZTtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBfcHJvcHMuYXR0cmlidXRlcztcbiAgICAgICAgdmFyIGRpYWxvZ0ZpZWxkID0gX3Byb3BzLmRpYWxvZ0ZpZWxkO1xuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBpc0Rpc3BsYXlHcmlkID0gX3Byb3BzMi5pc0Rpc3BsYXlHcmlkO1xuICAgICAgICB2YXIgaXNEaXNwbGF5Rm9ybSA9IF9wcm9wczIuaXNEaXNwbGF5Rm9ybTtcbiAgICAgICAgdmFyIGVkaXRNb2RlID0gX3Byb3BzMi5lZGl0TW9kZTtcbiAgICAgICAgdmFyIHZhbHVlID0gX3Byb3BzMi52YWx1ZTtcbiAgICAgICAgdmFyIHRvZ2dsZUVkaXRNb2RlID0gX3Byb3BzMi50b2dnbGVFZGl0TW9kZTtcbiAgICAgICAgdmFyIGVudGVyVG9Ub2dnbGUgPSBfcHJvcHMyLmVudGVyVG9Ub2dnbGU7XG5cbiAgICAgICAgaWYgKGlzRGlzcGxheUdyaWQoKSAmJiAhZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgeyBvbkNsaWNrOiBkaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdG9nZ2xlRWRpdE1vZGUsIGNsYXNzTmFtZTogdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgIHZhbHVlID8gdmFsdWUgOiAnRW1wdHknXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG92ZXJmbG93ID0geyBvdmVyZmxvdzogJ2hpZGRlbicsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsIHdpZHRoOiAnMTAwJScgfTtcbiAgICAgICAgICAgIHZhciBjTmFtZSA9IHRoaXMuc3RhdGUudmFsaWQgPyAnJyA6ICdtdWktZXJyb3ItYXMtaGludCc7XG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgY05hbWUgPSBjbGFzc05hbWUgKyAnICcgKyBjTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBfY29uZmlybSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBUZXh0Q29tcG9uZW50ID0gZGlhbG9nRmllbGQgPyBfbWF0ZXJpYWxVaS5UZXh0RmllbGQgOiBNb2Rlcm5UZXh0RmllbGQ7XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgIWRpc2FibGVkKSB7XG5cbiAgICAgICAgICAgICAgICBfY29uZmlybSA9IFtfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsga2V5OiBcInNlcFwiLCBzdHlsZTogeyB3aWR0aDogOCB9IH0pLCBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFRleHRDb21wb25lbnQsIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBcImNvbmZpcm1cIixcbiAgICAgICAgICAgICAgICAgICAgcmVmOiBcImNvbmZpcm1cIixcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuZ2V0TWVzc2FnZSgxOTkpLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsU2hyaW5rU3R5bGU6IF9leHRlbmRzKHt9LCBvdmVyZmxvdywgeyB3aWR0aDogJzEzMCUnIH0pLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsU3R5bGU6IG92ZXJmbG93LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGNOYW1lLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5jb25maXJtVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ29uZmlybUNoYW5nZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInBhc3N3b3JkXCIsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpTGluZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogdGhpcy5zdGF0ZS5jb25maXJtRXJyb3JUZXh0LFxuICAgICAgICAgICAgICAgICAgICBlcnJvclN0eWxlOiBkaWFsb2dGaWVsZCA/IHsgYm90dG9tOiAtNSB9IDogbnVsbFxuICAgICAgICAgICAgICAgIH0pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZm9ybVwiLFxuICAgICAgICAgICAgICAgIHsgYXV0b0NvbXBsZXRlOiBcIm9mZlwiLCBvblN1Ym1pdDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFRleHRDb21wb25lbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogXCJwYXNzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogaXNEaXNwbGF5Rm9ybSgpID8gYXR0cmlidXRlcy5sYWJlbCA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsU2hyaW5rU3R5bGU6IF9leHRlbmRzKHt9LCBvdmVyZmxvdywgeyB3aWR0aDogJzEzMCUnIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFN0eWxlOiBvdmVyZmxvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogY05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uUGFzc3dvcmRDaGFuZ2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bjogZW50ZXJUb1RvZ2dsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicGFzc3dvcmRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpTGluZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMuc3RhdGUucGFzc0Vycm9yVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yU3R5bGU6IGRpYWxvZ0ZpZWxkID8geyBib3R0b206IC01IH0gOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBfY29uZmlybVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFZhbGlkUGFzc3dvcmQ7XG59KShfcmVhY3QyW1wiZGVmYXVsdFwiXS5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9ob2NBc0Zvcm1GaWVsZDJbXCJkZWZhdWx0XCJdKFZhbGlkUGFzc3dvcmQpO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbi8qKlxuICogUmVhY3QgTWl4aW4gZm9yIEZvcm0gRWxlbWVudFxuICovXG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChGaWVsZCkge1xuICAgIHZhciBza2lwQnVmZmVyQ2hhbmdlcyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIEZvcm1GaWVsZCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgICAgICBfaW5oZXJpdHMoRm9ybUZpZWxkLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgICAgICAvLyBwcm9wVHlwZXM6e1xuICAgICAgICAvLyAgICAgYXR0cmlidXRlczpSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIC8vICAgICBuYW1lOlJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIGRpc3BsYXlDb250ZXh0OlJlYWN0LlByb3BUeXBlcy5vbmVPZihbJ2Zvcm0nLCAnZ3JpZCddKSxcbiAgICAgICAgLy8gICAgIGRpc2FibGVkOlJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICAvLyAgICAgbXVsdGlwbGU6UmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIC8vICAgICB2YWx1ZTpSZWFjdC5Qcm9wVHlwZXMuYW55LFxuICAgICAgICAvLyAgICAgb25DaGFuZ2U6UmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8vICAgICBvbkNoYW5nZUVkaXRNb2RlOlJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICAvLyAgICAgYmluYXJ5X2NvbnRleHQ6UmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgLy8gICAgIGVycm9yVGV4dDpSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG4gICAgICAgIC8vIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gRm9ybUZpZWxkKHByb3BzKSB7XG4gICAgICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRm9ybUZpZWxkKTtcblxuICAgICAgICAgICAgcHJvcHMgPSBfZXh0ZW5kcyh7IGRpc3BsYXlDb250ZXh0OiAnZm9ybScsIGRpc2FibGVkOiBmYWxzZSB9LCBwcm9wcyk7XG4gICAgICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgICAgICBlZGl0TW9kZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGlydHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgRm9ybUZpZWxkLnByb3RvdHlwZS5pc0Rpc3BsYXlHcmlkID0gZnVuY3Rpb24gaXNEaXNwbGF5R3JpZCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLmRpc3BsYXlDb250ZXh0ID09PSAnZ3JpZCc7XG4gICAgICAgIH07XG5cbiAgICAgICAgRm9ybUZpZWxkLnByb3RvdHlwZS5pc0Rpc3BsYXlGb3JtID0gZnVuY3Rpb24gaXNEaXNwbGF5Rm9ybSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLmRpc3BsYXlDb250ZXh0ID09PSAnZm9ybSc7XG4gICAgICAgIH07XG5cbiAgICAgICAgRm9ybUZpZWxkLnByb3RvdHlwZS50b2dnbGVFZGl0TW9kZSA9IGZ1bmN0aW9uIHRvZ2dsZUVkaXRNb2RlKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNEaXNwbGF5Rm9ybSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5ld1N0YXRlID0gIXRoaXMuc3RhdGUuZWRpdE1vZGU7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdE1vZGU6IG5ld1N0YXRlIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VFZGl0TW9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2VFZGl0TW9kZShuZXdTdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgRm9ybUZpZWxkLnByb3RvdHlwZS5lbnRlclRvVG9nZ2xlID0gZnVuY3Rpb24gZW50ZXJUb1RvZ2dsZShldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBGb3JtRmllbGQucHJvdG90eXBlLmJ1ZmZlckNoYW5nZXMgPSBmdW5jdGlvbiBidWZmZXJDaGFuZ2VzKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyUHJvcHNPbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIEZvcm1GaWVsZC5wcm90b3R5cGUub25DaGFuZ2UgPSBmdW5jdGlvbiBvbkNoYW5nZShldmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldFZhbHVlID8gZXZlbnQuY3VycmVudFRhcmdldC5nZXRWYWx1ZSgpIDogZXZlbnQuY3VycmVudFRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmNoYW5nZVRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5jaGFuZ2VUaW1lb3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbHVlLFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgICAgIGlmIChza2lwQnVmZmVyQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlclByb3BzT25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGRpcnR5OiB0cnVlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXNraXBCdWZmZXJDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRpbWVyTGVuZ3RoID0gMjUwO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICAgICAgICAgICAgICB0aW1lckxlbmd0aCA9IDEyMDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlVGltZW91dCA9IHNldFRpbWVvdXQoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXJDaGFuZ2VzKG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSwgdGltZXJMZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIEZvcm1GaWVsZC5wcm90b3R5cGUudHJpZ2dlclByb3BzT25DaGFuZ2UgPSBmdW5jdGlvbiB0cmlnZ2VyUHJvcHNPbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSwgeyB0eXBlOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIEZvcm1GaWVsZC5wcm90b3R5cGUuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZhbHVlOiBuZXdQcm9wcy52YWx1ZSxcbiAgICAgICAgICAgICAgICBkaXJ0eTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIEZvcm1GaWVsZC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEZpZWxkLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgdGhpcy5zdGF0ZSwge1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMub25DaGFuZ2UoZSwgdik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b2dnbGVFZGl0TW9kZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVudGVyVG9Ub2dnbGU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5lbnRlclRvVG9nZ2xlKGUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaXNEaXNwbGF5R3JpZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuaXNEaXNwbGF5R3JpZCgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaXNEaXNwbGF5Rm9ybTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuaXNEaXNwbGF5Rm9ybSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gRm9ybUZpZWxkO1xuICAgIH0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG4gICAgcmV0dXJuIEZvcm1GaWVsZDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgQ29tcG9uZW50ID0gX3JlcXVpcmUuQ29tcG9uZW50O1xuXG52YXIgX3JlcXVpcmUkcmVxdWlyZUxpYiA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgUHlkaW9Db250ZXh0Q29uc3VtZXIgPSBfcmVxdWlyZSRyZXF1aXJlTGliLlB5ZGlvQ29udGV4dENvbnN1bWVyO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoUHlkaW9Db21wb25lbnQpIHtcbiAgICB2YXIgRmllbGRXaXRoQ2hvaWNlcyA9IChmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICAgICAgICBfaW5oZXJpdHMoRmllbGRXaXRoQ2hvaWNlcywgX0NvbXBvbmVudCk7XG5cbiAgICAgICAgRmllbGRXaXRoQ2hvaWNlcy5wcm90b3R5cGUubG9hZEV4dGVybmFsVmFsdWVzID0gZnVuY3Rpb24gbG9hZEV4dGVybmFsVmFsdWVzKGNob2ljZXMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG5cbiAgICAgICAgICAgIHZhciBwYXJzZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB2YXIgbGlzdF9hY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoY2hvaWNlcyBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQ2hvaWNlc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ2hvaWNlc0xvYWRlZChjaG9pY2VzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgY2hvaWNlczogY2hvaWNlcywgcGFyc2VkOiBwYXJzZWQgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG91dHB1dCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGlmIChjaG9pY2VzLmluZGV4T2YoJ2pzb25fZmlsZTonKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHBhcnNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGxpc3RfYWN0aW9uID0gY2hvaWNlcy5yZXBsYWNlKCdqc29uX2ZpbGU6JywgJycpO1xuICAgICAgICAgICAgICAgIG91dHB1dC5zZXQoJzAnLCBweWRpby5NZXNzYWdlSGFzaFsnYWp4cF9hZG1pbi5ob21lLjYnXSk7XG4gICAgICAgICAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkubG9hZEZpbGUobGlzdF9hY3Rpb24sIGZ1bmN0aW9uICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld091dHB1dCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zcG9ydC5yZXNwb25zZUpTT04pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydC5yZXNwb25zZUpTT04uZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdPdXRwdXQuc2V0KGVudHJ5LmtleSwgZW50cnkubGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHJhbnNwb3J0LnJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKHRyYW5zcG9ydC5yZXNwb25zZVRleHQpLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld091dHB1dC5zZXQoZW50cnkua2V5LCBlbnRyeS5sYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdoaWxlIHBhcnNpbmcgbGlzdCAnICsgY2hvaWNlcywgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBjaG9pY2VzOiBuZXdPdXRwdXQgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLm9uQ2hvaWNlc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm9uQ2hvaWNlc0xvYWRlZChuZXdPdXRwdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hvaWNlcyA9PT0gXCJQWURJT19BVkFJTEFCTEVfTEFOR1VBR0VTXCIpIHtcbiAgICAgICAgICAgICAgICBweWRpby5saXN0TGFuZ3VhZ2VzV2l0aENhbGxiYWNrKGZ1bmN0aW9uIChrZXksIGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5zZXQoa2V5LCBsYWJlbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25DaG9pY2VzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25DaG9pY2VzTG9hZGVkKG91dHB1dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2VzID09PSBcIlBZRElPX0FWQUlMQUJMRV9SRVBPU0lUT1JJRVNcIikge1xuICAgICAgICAgICAgICAgIGlmIChweWRpby51c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc29ydGVyID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFnZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLnVzZXIucmVwb3NpdG9yaWVzLmZvckVhY2goZnVuY3Rpb24gKHJlcG9zaXRvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVwb3NpdG9yeS5nZXRJZCgpID09PSAnc2V0dGluZ3MnIHx8IHJlcG9zaXRvcnkuZ2V0SWQoKSA9PT0gJ2hvbWVwYWdlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlcy5wdXNoKHsgaWQ6IHJlcG9zaXRvcnkuZ2V0SWQoKSwgbGFiZWw6ICdbJyArIHB5ZGlvLk1lc3NhZ2VIYXNoWyczMzEnXSArICddICcgKyByZXBvc2l0b3J5LmdldExhYmVsKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXBvc2l0b3J5LmdldFJlcG9zaXRvcnlUeXBlKCkgIT09IFwiY2VsbFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlci5wdXNoKHsgaWQ6IHJlcG9zaXRvcnkuZ2V0SWQoKSwgbGFiZWw6IHJlcG9zaXRvcnkuZ2V0TGFiZWwoKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlci5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEubGFiZWwubG9jYWxlQ29tcGFyZShiLmxhYmVsLCB1bmRlZmluZWQsIHsgbnVtZXJpYzogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGVyLnB1c2guYXBwbHkoc29ydGVyLCBwYWdlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0ZXIuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQuc2V0KGQuaWQsIGQubGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQ2hvaWNlc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ2hvaWNlc0xvYWRlZChvdXRwdXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUGFyc2Ugc3RyaW5nIGFuZCByZXR1cm4gbWFwXG4gICAgICAgICAgICAgICAgY2hvaWNlcy5zcGxpdChcIixcIikubWFwKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsID0gY2hvaWNlLnNwbGl0KCd8Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbFswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gbFsxXTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbGFiZWwgPSBjaG9pY2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHB5ZGlvLk1lc3NhZ2VIYXNoW2xhYmVsXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBweWRpby5NZXNzYWdlSGFzaFtsYWJlbF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnNldCh2YWx1ZSwgbGFiZWwpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgY2hvaWNlczogb3V0cHV0LCBwYXJzZWQ6IHBhcnNlZCB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIEZpZWxkV2l0aENob2ljZXMocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGaWVsZFdpdGhDaG9pY2VzKTtcblxuICAgICAgICAgICAgX0NvbXBvbmVudC5jYWxsKHRoaXMsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIHZhciBjaG9pY2VzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgY2hvaWNlcy5zZXQoJzAnLCB0aGlzLnByb3BzLnB5ZGlvID8gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnYWp4cF9hZG1pbi5ob21lLjYnXSA6ICcgLi4uICcpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHsgY2hvaWNlczogY2hvaWNlcywgY2hvaWNlc1BhcnNlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIEZpZWxkV2l0aENob2ljZXMucHJvdG90eXBlLmNvbXBvbmVudERpZE1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10pIHtcbiAgICAgICAgICAgICAgICB2YXIgX2xvYWRFeHRlcm5hbFZhbHVlcyA9IHRoaXMubG9hZEV4dGVybmFsVmFsdWVzKHRoaXMucHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddKTtcblxuICAgICAgICAgICAgICAgIHZhciBjaG9pY2VzID0gX2xvYWRFeHRlcm5hbFZhbHVlcy5jaG9pY2VzO1xuICAgICAgICAgICAgICAgIHZhciBwYXJzZWQgPSBfbG9hZEV4dGVybmFsVmFsdWVzLnBhcnNlZDtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjaG9pY2VzOiBjaG9pY2VzLCBjaG9pY2VzUGFyc2VkOiBwYXJzZWQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgRmllbGRXaXRoQ2hvaWNlcy5wcm90b3R5cGUuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgICAgIGlmIChuZXdQcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10gJiYgbmV3UHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddICE9PSB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSkge1xuICAgICAgICAgICAgICAgIHZhciBfbG9hZEV4dGVybmFsVmFsdWVzMiA9IHRoaXMubG9hZEV4dGVybmFsVmFsdWVzKG5ld1Byb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hvaWNlcyA9IF9sb2FkRXh0ZXJuYWxWYWx1ZXMyLmNob2ljZXM7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnNlZCA9IF9sb2FkRXh0ZXJuYWxWYWx1ZXMyLnBhcnNlZDtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBjaG9pY2VzOiBjaG9pY2VzLFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2VzUGFyc2VkOiBwYXJzZWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBGaWVsZFdpdGhDaG9pY2VzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQeWRpb0NvbXBvbmVudCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHRoaXMuc3RhdGUpKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gRmllbGRXaXRoQ2hvaWNlcztcbiAgICB9KShDb21wb25lbnQpO1xuXG4gICAgcmV0dXJuIFB5ZGlvQ29udGV4dENvbnN1bWVyKEZpZWxkV2l0aENob2ljZXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX21hbmFnZXJNYW5hZ2VyID0gcmVxdWlyZSgnLi9tYW5hZ2VyL01hbmFnZXInKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYW5hZ2VyTWFuYWdlcik7XG5cbnZhciBfZmllbGRzVGV4dEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZHMvVGV4dEZpZWxkJyk7XG5cbnZhciBfZmllbGRzVGV4dEZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc1RleHRGaWVsZCk7XG5cbnZhciBfZmllbGRzVmFsaWRQYXNzd29yZCA9IHJlcXVpcmUoJy4vZmllbGRzL1ZhbGlkUGFzc3dvcmQnKTtcblxudmFyIF9maWVsZHNWYWxpZFBhc3N3b3JkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc1ZhbGlkUGFzc3dvcmQpO1xuXG52YXIgX2ZpZWxkc0lucHV0SW50ZWdlciA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0SW50ZWdlcicpO1xuXG52YXIgX2ZpZWxkc0lucHV0SW50ZWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dEludGVnZXIpO1xuXG52YXIgX2ZpZWxkc0lucHV0Qm9vbGVhbiA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0Qm9vbGVhbicpO1xuXG52YXIgX2ZpZWxkc0lucHV0Qm9vbGVhbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dEJvb2xlYW4pO1xuXG52YXIgX2ZpZWxkc0lucHV0U2VsZWN0Qm94ID0gcmVxdWlyZSgnLi9maWVsZHMvSW5wdXRTZWxlY3RCb3gnKTtcblxudmFyIF9maWVsZHNJbnB1dFNlbGVjdEJveDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dFNlbGVjdEJveCk7XG5cbnZhciBfZmllbGRzQXV0b2NvbXBsZXRlQm94ID0gcmVxdWlyZSgnLi9maWVsZHMvQXV0b2NvbXBsZXRlQm94Jyk7XG5cbnZhciBfZmllbGRzQXV0b2NvbXBsZXRlQm94MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0F1dG9jb21wbGV0ZUJveCk7XG5cbnZhciBfZmllbGRzSW5wdXRJbWFnZSA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0SW1hZ2UnKTtcblxudmFyIF9maWVsZHNJbnB1dEltYWdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0lucHV0SW1hZ2UpO1xuXG52YXIgX3BhbmVsRm9ybVBhbmVsID0gcmVxdWlyZSgnLi9wYW5lbC9Gb3JtUGFuZWwnKTtcblxudmFyIF9wYW5lbEZvcm1QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYW5lbEZvcm1QYW5lbCk7XG5cbnZhciBfcGFuZWxGb3JtSGVscGVyID0gcmVxdWlyZSgnLi9wYW5lbC9Gb3JtSGVscGVyJyk7XG5cbnZhciBfcGFuZWxGb3JtSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhbmVsRm9ybUhlbHBlcik7XG5cbnZhciBfZmllbGRzRmlsZURyb3B6b25lID0gcmVxdWlyZSgnLi9maWVsZHMvRmlsZURyb3B6b25lJyk7XG5cbnZhciBfZmllbGRzRmlsZURyb3B6b25lMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0ZpbGVEcm9wem9uZSk7XG5cbnZhciBfZmllbGRzQXV0b2NvbXBsZXRlVHJlZSA9IHJlcXVpcmUoJy4vZmllbGRzL0F1dG9jb21wbGV0ZVRyZWUnKTtcblxudmFyIF9maWVsZHNBdXRvY29tcGxldGVUcmVlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0F1dG9jb21wbGV0ZVRyZWUpO1xuXG52YXIgUHlkaW9Gb3JtID0ge1xuXG4gIE1hbmFnZXI6IF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRUZXh0OiBfZmllbGRzVGV4dEZpZWxkMlsnZGVmYXVsdCddLFxuICBWYWxpZFBhc3N3b3JkOiBfZmllbGRzVmFsaWRQYXNzd29yZDJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRCb29sZWFuOiBfZmllbGRzSW5wdXRCb29sZWFuMlsnZGVmYXVsdCddLFxuICBJbnB1dEludGVnZXI6IF9maWVsZHNJbnB1dEludGVnZXIyWydkZWZhdWx0J10sXG4gIElucHV0U2VsZWN0Qm94OiBfZmllbGRzSW5wdXRTZWxlY3RCb3gyWydkZWZhdWx0J10sXG4gIEF1dG9jb21wbGV0ZUJveDogX2ZpZWxkc0F1dG9jb21wbGV0ZUJveDJbJ2RlZmF1bHQnXSxcbiAgQXV0b2NvbXBsZXRlVHJlZTogX2ZpZWxkc0F1dG9jb21wbGV0ZVRyZWUyWydkZWZhdWx0J10sXG4gIElucHV0SW1hZ2U6IF9maWVsZHNJbnB1dEltYWdlMlsnZGVmYXVsdCddLFxuICBGb3JtUGFuZWw6IF9wYW5lbEZvcm1QYW5lbDJbJ2RlZmF1bHQnXSxcbiAgUHlkaW9IZWxwZXI6IF9wYW5lbEZvcm1IZWxwZXIyWydkZWZhdWx0J10sXG4gIEZpbGVEcm9wWm9uZTogX2ZpZWxkc0ZpbGVEcm9wem9uZTJbJ2RlZmF1bHQnXSxcbiAgY3JlYXRlRm9ybUVsZW1lbnQ6IF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXS5jcmVhdGVGb3JtRWxlbWVudFxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHlkaW9Gb3JtO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2ZpZWxkc1ZhbGlkTG9naW4gPSByZXF1aXJlKCcuLi9maWVsZHMvVmFsaWRMb2dpbicpO1xuXG52YXIgX2ZpZWxkc1ZhbGlkTG9naW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzVmFsaWRMb2dpbik7XG5cbnZhciBfZmllbGRzQWx0VGV4dCA9IHJlcXVpcmUoXCIuLi9maWVsZHMvQWx0VGV4dFwiKTtcblxudmFyIF9maWVsZHNBbHRUZXh0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc0FsdFRleHQpO1xuXG52YXIgWE1MVXRpbHMgPSByZXF1aXJlKCdweWRpby91dGlsL3htbCcpO1xudmFyIElucHV0Qm9vbGVhbiA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0lucHV0Qm9vbGVhbicpO1xudmFyIElucHV0VGV4dCA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL1RleHRGaWVsZCcpO1xudmFyIFZhbGlkUGFzc3dvcmQgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9WYWxpZFBhc3N3b3JkJyk7XG52YXIgSW5wdXRJbnRlZ2VyID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvSW5wdXRJbnRlZ2VyJyk7XG52YXIgSW5wdXRJbWFnZSA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0lucHV0SW1hZ2UnKTtcbnZhciBTZWxlY3RCb3ggPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9JbnB1dFNlbGVjdEJveCcpO1xudmFyIEF1dG9jb21wbGV0ZUJveCA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0F1dG9jb21wbGV0ZUJveCcpO1xudmFyIEF1dG9jb21wbGV0ZVRyZWUgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9BdXRvY29tcGxldGVUcmVlJyk7XG5cbi8qKlxuICogVXRpbGl0eSBjbGFzcyB0byBwYXJzZSAvIGhhbmRsZSBweWRpbyBzdGFuZGFyZCBmb3JtIGRlZmluaXRpb25zL3ZhbHVlcy5cbiAqL1xuXG52YXIgTWFuYWdlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTWFuYWdlcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1hbmFnZXIpO1xuICAgIH1cblxuICAgIE1hbmFnZXIuaGFzSGVscGVyID0gZnVuY3Rpb24gaGFzSGVscGVyKHBsdWdpbklkLCBwYXJhbU5hbWUpIHtcblxuICAgICAgICB2YXIgaGVscGVycyA9IE1hbmFnZXIuZ2V0SGVscGVyc0NhY2hlKCk7XG4gICAgICAgIHJldHVybiBoZWxwZXJzW3BsdWdpbklkXSAmJiBoZWxwZXJzW3BsdWdpbklkXVsncGFyYW1ldGVycyddW3BhcmFtTmFtZV07XG4gICAgfTtcblxuICAgIE1hbmFnZXIuZ2V0SGVscGVyc0NhY2hlID0gZnVuY3Rpb24gZ2V0SGVscGVyc0NhY2hlKCkge1xuICAgICAgICBpZiAoIU1hbmFnZXIuSEVMUEVSU19DQUNIRSkge1xuICAgICAgICAgICAgdmFyIGhlbHBlckNhY2hlID0ge307XG4gICAgICAgICAgICB2YXIgaGVscGVycyA9IFhNTFV0aWxzLlhQYXRoU2VsZWN0Tm9kZXMod2luZG93LnB5ZGlvLlJlZ2lzdHJ5LmdldFhNTCgpLCAncGx1Z2lucy8qL2NsaWVudF9zZXR0aW5ncy9yZXNvdXJjZXMvanNbQHR5cGU9XCJoZWxwZXJcIl0nKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGVscGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBoZWxwZXJOb2RlID0gaGVscGVyc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgcGx1Z2luID0gaGVscGVyTm9kZS5nZXRBdHRyaWJ1dGUoXCJwbHVnaW5cIik7XG4gICAgICAgICAgICAgICAgaGVscGVyQ2FjaGVbcGx1Z2luXSA9IHsgbmFtZXNwYWNlOiBoZWxwZXJOb2RlLmdldEF0dHJpYnV0ZSgnY2xhc3NOYW1lJyksIHBhcmFtZXRlcnM6IHt9IH07XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtTm9kZXMgPSBYTUxVdGlscy5YUGF0aFNlbGVjdE5vZGVzKGhlbHBlck5vZGUsICdwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHBhcmFtTm9kZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtTm9kZSA9IHBhcmFtTm9kZXNba107XG4gICAgICAgICAgICAgICAgICAgIGhlbHBlckNhY2hlW3BsdWdpbl1bJ3BhcmFtZXRlcnMnXVtwYXJhbU5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNYW5hZ2VyLkhFTFBFUlNfQ0FDSEUgPSBoZWxwZXJDYWNoZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWFuYWdlci5IRUxQRVJTX0NBQ0hFO1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLnBhcnNlUGFyYW1ldGVycyA9IGZ1bmN0aW9uIHBhcnNlUGFyYW1ldGVycyh4bWxEb2N1bWVudCwgcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIFhNTFV0aWxzLlhQYXRoU2VsZWN0Tm9kZXMoeG1sRG9jdW1lbnQsIHF1ZXJ5KS5tYXAoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gTWFuYWdlci5wYXJhbWV0ZXJOb2RlVG9IYXNoKG5vZGUpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgTWFuYWdlci5wYXJhbWV0ZXJOb2RlVG9IYXNoID0gZnVuY3Rpb24gcGFyYW1ldGVyTm9kZVRvSGFzaChwYXJhbU5vZGUpIHtcbiAgICAgICAgdmFyIHBhcmFtc0F0dHMgPSBwYXJhbU5vZGUuYXR0cmlidXRlcztcbiAgICAgICAgdmFyIHBhcmFtc09iamVjdCA9IHt9O1xuICAgICAgICBpZiAocGFyYW1Ob2RlLnBhcmVudE5vZGUgJiYgcGFyYW1Ob2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZSAmJiBwYXJhbU5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgcGFyYW1zT2JqZWN0W1wicGx1Z2luSWRcIl0gPSBwYXJhbU5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcImlkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb2xsZWN0Q2RhdGEgPSBmYWxzZTtcbiAgICAgICAgdmFyIE1lc3NhZ2VIYXNoID0gZ2xvYmFsLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyYW1zQXR0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGF0dE5hbWUgPSBwYXJhbXNBdHRzLml0ZW0oaSkubm9kZU5hbWU7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJhbXNBdHRzLml0ZW0oaSkudmFsdWU7XG4gICAgICAgICAgICBpZiAoKGF0dE5hbWUgPT09IFwibGFiZWxcIiB8fCBhdHROYW1lID09PSBcImRlc2NyaXB0aW9uXCIgfHwgYXR0TmFtZSA9PT0gXCJncm91cFwiIHx8IGF0dE5hbWUuaW5kZXhPZihcImdyb3VwX3N3aXRjaF9cIikgPT09IDApICYmIE1lc3NhZ2VIYXNoW3ZhbHVlXSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gTWVzc2FnZUhhc2hbdmFsdWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGF0dE5hbWUgPT09IFwiY2RhdGF2YWx1ZVwiKSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdENkYXRhID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmFtc09iamVjdFthdHROYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2xsZWN0Q2RhdGEpIHtcbiAgICAgICAgICAgIHBhcmFtc09iamVjdFsndmFsdWUnXSA9IHBhcmFtTm9kZS5maXJzdENoaWxkLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbXNPYmplY3RbJ3R5cGUnXSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zT2JqZWN0Wyd2YWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPSBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPT09IFwidHJ1ZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsnZGVmYXVsdCddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSA9IHBhcmFtc09iamVjdFsnZGVmYXVsdCddID09PSBcInRydWVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbXNPYmplY3RbJ3R5cGUnXSA9PT0gJ2ludGVnZXInKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zT2JqZWN0Wyd2YWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPSBwYXJzZUludChwYXJhbXNPYmplY3RbJ3ZhbHVlJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsnZGVmYXVsdCddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSA9IHBhcnNlSW50KHBhcmFtc09iamVjdFsnZGVmYXVsdCddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyYW1zT2JqZWN0O1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLmNyZWF0ZUZvcm1FbGVtZW50ID0gZnVuY3Rpb24gY3JlYXRlRm9ybUVsZW1lbnQocHJvcHMpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IHByb3BzLmF0dHJpYnV0ZXM7XG4gICAgICAgIHZhciBvbkFsdFRleHRTd2l0Y2ggPSBwcm9wcy5vbkFsdFRleHRTd2l0Y2g7XG4gICAgICAgIHZhciBhbHRUZXh0U3dpdGNoSWNvbiA9IHByb3BzLmFsdFRleHRTd2l0Y2hJY29uO1xuICAgICAgICB2YXIgYWx0VGV4dFN3aXRjaFRpcCA9IHByb3BzLmFsdFRleHRTd2l0Y2hUaXA7XG5cbiAgICAgICAgdmFyIHN3aXRjaFByb3BzID0geyBvbkFsdFRleHRTd2l0Y2g6IG9uQWx0VGV4dFN3aXRjaCwgYWx0VGlwOiBhbHRUZXh0U3dpdGNoVGlwLCBhbHRJY29uVGV4dDogYWx0VGV4dFN3aXRjaEljb24gfTtcbiAgICAgICAgc3dpdGNoIChhdHRyaWJ1dGVzWyd0eXBlJ10pIHtcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoSW5wdXRCb29sZWFuLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgaWYgKG9uQWx0VGV4dFN3aXRjaCkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX2ZpZWxkc0FsdFRleHQyWydkZWZhdWx0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICBfZXh0ZW5kcyh7fSwgcHJvcHMsIHN3aXRjaFByb3BzLCB7IGFsdEljb246IFwibWRpIG1kaS10b2dnbGUtc3dpdGNoXCIgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICBjYXNlICd0ZXh0YXJlYSc6XG4gICAgICAgICAgICBjYXNlICdwYXNzd29yZCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChJbnB1dFRleHQsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZhbGlkLXBhc3N3b3JkJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFZhbGlkUGFzc3dvcmQsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ZhbGlkLWxvZ2luJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9maWVsZHNWYWxpZExvZ2luMlsnZGVmYXVsdCddLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbnRlZ2VyJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KElucHV0SW50ZWdlciwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGlmIChvbkFsdFRleHRTd2l0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9maWVsZHNBbHRUZXh0MlsnZGVmYXVsdCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2V4dGVuZHMoe30sIHByb3BzLCBzd2l0Y2hQcm9wcywgeyBhbHRJY29uOiBcIm1kaSBtZGktbnVtYmVyXCIgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2ltYWdlJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KElucHV0SW1hZ2UsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTZWxlY3RCb3gsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBpZiAob25BbHRUZXh0U3dpdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfZmllbGRzQWx0VGV4dDJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9leHRlbmRzKHt9LCBwcm9wcywgc3dpdGNoUHJvcHMsIHsgYWx0SWNvbjogXCJtZGkgbWRpLXZpZXctbGlzdFwiIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhdXRvY29tcGxldGUnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoQXV0b2NvbXBsZXRlQm94LCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhdXRvY29tcGxldGUtdHJlZSc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChBdXRvY29tcGxldGVUcmVlLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsZWdlbmQnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2hpZGRlbic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBwcm9wcy52YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0VtcHR5J1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcblxuICAgIE1hbmFnZXIuU2xhc2hlc1RvSnNvbiA9IGZ1bmN0aW9uIFNsYXNoZXNUb0pzb24odmFsdWVzKSB7XG4gICAgICAgIGlmICh2YWx1ZXMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgdmFsdWVzICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmV3VmFsdWVzID0ge307XG4gICAgICAgIHZhciByZWN1cnNlT25LZXlzID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKHZhbHVlcykuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB2YWx1ZXNba107XG4gICAgICAgICAgICBpZiAoay5pbmRleE9mKCcvJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gay5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgIHZhciBmaXJzdFBhcnQgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIHZhciBsYXN0UGFydCA9IHBhcnRzLmpvaW4oJy8nKTtcbiAgICAgICAgICAgICAgICBpZiAoIW5ld1ZhbHVlc1tmaXJzdFBhcnRdKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1tmaXJzdFBhcnRdID0ge307XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbmV3VmFsdWVzW2ZpcnN0UGFydF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1tmaXJzdFBhcnRdID0geyAnQHZhbHVlJzogbmV3VmFsdWVzW2ZpcnN0UGFydF0gfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3VmFsdWVzW2ZpcnN0UGFydF1bbGFzdFBhcnRdID0gZGF0YTtcbiAgICAgICAgICAgICAgICByZWN1cnNlT25LZXlzW2ZpcnN0UGFydF0gPSBmaXJzdFBhcnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZXNba10gJiYgdHlwZW9mIG5ld1ZhbHVlc1trXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVzW2tdWydAdmFsdWUnXSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVzW2tdID0gZGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3Qua2V5cyhyZWN1cnNlT25LZXlzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgbmV3VmFsdWVzW2tleV0gPSBNYW5hZ2VyLlNsYXNoZXNUb0pzb24obmV3VmFsdWVzW2tleV0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ld1ZhbHVlcztcbiAgICB9O1xuXG4gICAgTWFuYWdlci5Kc29uVG9TbGFzaGVzID0gZnVuY3Rpb24gSnNvblRvU2xhc2hlcyh2YWx1ZXMpIHtcbiAgICAgICAgdmFyIHByZWZpeCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICcnIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIHZhciBuZXdWYWx1ZXMgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXModmFsdWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlc1trXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViVmFsdWVzID0gTWFuYWdlci5Kc29uVG9TbGFzaGVzKHZhbHVlc1trXSwgcHJlZml4ICsgayArICcvJyk7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWVzID0gX2V4dGVuZHMoe30sIG5ld1ZhbHVlcywgc3ViVmFsdWVzKTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzW2tdWydAdmFsdWUnXSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNbcHJlZml4ICsga10gPSB2YWx1ZXNba11bJ0B2YWx1ZSddO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWVzW3ByZWZpeCArIGtdID0gdmFsdWVzW2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ld1ZhbHVlcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBFeHRyYWN0IFBPU1QtcmVhZHkgdmFsdWVzIGZyb20gYSBjb21ibyBwYXJhbWV0ZXJzL3ZhbHVlc1xuICAgICAqXG4gICAgICogQHBhcmFtIGRlZmluaXRpb25zIEFycmF5IFN0YW5kYXJkIEZvcm0gRGVmaW5pdGlvbiBhcnJheVxuICAgICAqIEBwYXJhbSB2YWx1ZXMgT2JqZWN0IEtleS9WYWx1ZXMgb2YgdGhlIGN1cnJlbnQgZm9ybVxuICAgICAqIEBwYXJhbSBwcmVmaXggU3RyaW5nIE9wdGlvbmFsIHByZWZpeCB0byBhZGQgdG8gYWxsIHBhcmFtZXRlcnMgKGJ5IGRlZmF1bHQgRFJJVkVSX09QVElPTl8pLlxuICAgICAqIEByZXR1cm5zIE9iamVjdCBPYmplY3Qgd2l0aCBhbGwgcHlkaW8tY29tcGF0aWJsZSBQT1NUIHBhcmFtZXRlcnNcbiAgICAgKi9cblxuICAgIE1hbmFnZXIuZ2V0VmFsdWVzRm9yUE9TVCA9IGZ1bmN0aW9uIGdldFZhbHVlc0ZvclBPU1QoZGVmaW5pdGlvbnMsIHZhbHVlcykge1xuICAgICAgICB2YXIgcHJlZml4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gJ0RSSVZFUl9PUFRJT05fJyA6IGFyZ3VtZW50c1syXTtcbiAgICAgICAgdmFyIGFkZGl0aW9uYWxNZXRhZGF0YSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbM107XG5cbiAgICAgICAgdmFyIGNsaWVudFBhcmFtcyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAodmFsdWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBjbGllbnRQYXJhbXNbcHJlZml4ICsga2V5XSA9IHZhbHVlc1trZXldO1xuICAgICAgICAgICAgICAgIHZhciBkZWZUeXBlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBkID0gMDsgZCA8IGRlZmluaXRpb25zLmxlbmd0aDsgZCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWZpbml0aW9uc1tkXVsnbmFtZSddID09IGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmVHlwZSA9IGRlZmluaXRpb25zW2RdWyd0eXBlJ107XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWRlZlR5cGUpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFydHMgPSBrZXkuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3QsIHByZXY7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0ID0gcGFydHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gcGFydHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBkZWZpbml0aW9ucy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWZpbml0aW9uc1trXVsnbmFtZSddID09IGxhc3QgJiYgZGVmaW5pdGlvbnNba11bJ2dyb3VwX3N3aXRjaF9uYW1lJ10gJiYgZGVmaW5pdGlvbnNba11bJ2dyb3VwX3N3aXRjaF9uYW1lJ10gPT0gcHJldikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZUeXBlID0gZGVmaW5pdGlvbnNba11bJ3R5cGUnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVmaW5pdGlvbnNba11bJ25hbWUnXSA9PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmVHlwZSA9IGRlZmluaXRpb25zW2tdWyd0eXBlJ107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL2RlZmluaXRpb25zLm1hcChmdW5jdGlvbihkKXtpZihkLm5hbWUgPT0gdGhlS2V5KSBkZWZUeXBlID0gZC50eXBlfSk7XG4gICAgICAgICAgICAgICAgaWYgKGRlZlR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlZlR5cGUgPT0gXCJpbWFnZVwiKSBkZWZUeXBlID0gXCJiaW5hcnlcIjtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50UGFyYW1zW3ByZWZpeCArIGtleSArICdfYWp4cHR5cGUnXSA9IGRlZlR5cGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhZGRpdGlvbmFsTWV0YWRhdGEgJiYgYWRkaXRpb25hbE1ldGFkYXRhW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgbWV0YSBpbiBhZGRpdGlvbmFsTWV0YWRhdGFba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFkZGl0aW9uYWxNZXRhZGF0YVtrZXldLmhhc093blByb3BlcnR5KG1ldGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50UGFyYW1zW3ByZWZpeCArIGtleSArICdfJyArIG1ldGFdID0gYWRkaXRpb25hbE1ldGFkYXRhW2tleV1bbWV0YV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW9yZGVyIHRyZWUga2V5c1xuICAgICAgICB2YXIgYWxsS2V5cyA9IE9iamVjdC5rZXlzKGNsaWVudFBhcmFtcyk7XG4gICAgICAgIGFsbEtleXMuc29ydCgpO1xuICAgICAgICBhbGxLZXlzLnJldmVyc2UoKTtcbiAgICAgICAgdmFyIHRyZWVLZXlzID0ge307XG4gICAgICAgIGFsbEtleXMubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihcIi9cIikgPT09IC0xKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoa2V5LmVuZHNXaXRoKFwiX2FqeHB0eXBlXCIpKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgdHlwZUtleSA9IGtleSArIFwiX2FqeHB0eXBlXCI7XG4gICAgICAgICAgICB2YXIgcGFydHMgPSBrZXkuc3BsaXQoXCIvXCIpO1xuICAgICAgICAgICAgdmFyIHBhcmVudE5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICAgICAgdmFyIHBhcmVudEtleTtcbiAgICAgICAgICAgIHdoaWxlIChwYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5ID0gdHJlZUtleXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghcGFyZW50S2V5W3BhcmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXJlbnRLZXkgPSBwYXJlbnRLZXlbcGFyZW50TmFtZV07XG4gICAgICAgICAgICAgICAgcGFyZW50TmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdHlwZSA9IGNsaWVudFBhcmFtc1t0eXBlS2V5XTtcbiAgICAgICAgICAgIGRlbGV0ZSBjbGllbnRQYXJhbXNbdHlwZUtleV07XG4gICAgICAgICAgICBpZiAocGFyZW50S2V5ICYmICFwYXJlbnRLZXlbcGFyZW50TmFtZV0pIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdiA9IGNsaWVudFBhcmFtc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV0gPSB2ID09IFwidHJ1ZVwiIHx8IHYgPT0gMSB8fCB2ID09PSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImludGVnZXJcIikge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV0gPSBwYXJzZUludChjbGllbnRQYXJhbXNba2V5XSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlICYmIHR5cGUuc3RhcnRzV2l0aChcImdyb3VwX3N3aXRjaDpcIikgJiYgdHlwZW9mIGNsaWVudFBhcmFtc1trZXldID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdID0geyBncm91cF9zd2l0Y2hfdmFsdWU6IGNsaWVudFBhcmFtc1trZXldIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdID0gY2xpZW50UGFyYW1zW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJlbnRLZXkgJiYgdHlwZSAmJiB0eXBlLnN0YXJ0c1dpdGgoJ2dyb3VwX3N3aXRjaDonKSkge1xuICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXVtcImdyb3VwX3N3aXRjaF92YWx1ZVwiXSA9IGNsaWVudFBhcmFtc1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIGNsaWVudFBhcmFtc1trZXldO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChrZXkgaW4gdHJlZUtleXMpIHtcbiAgICAgICAgICAgIGlmICghdHJlZUtleXMuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG4gICAgICAgICAgICB2YXIgdHJlZVZhbHVlID0gdHJlZUtleXNba2V5XTtcbiAgICAgICAgICAgIGlmIChjbGllbnRQYXJhbXNba2V5ICsgJ19hanhwdHlwZSddICYmIGNsaWVudFBhcmFtc1trZXkgKyAnX2FqeHB0eXBlJ10uaW5kZXhPZignZ3JvdXBfc3dpdGNoOicpID09PSAwICYmICF0cmVlVmFsdWVbJ2dyb3VwX3N3aXRjaF92YWx1ZSddKSB7XG4gICAgICAgICAgICAgICAgdHJlZVZhbHVlWydncm91cF9zd2l0Y2hfdmFsdWUnXSA9IGNsaWVudFBhcmFtc1trZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGllbnRQYXJhbXNba2V5XSA9IEpTT04uc3RyaW5naWZ5KHRyZWVWYWx1ZSk7XG4gICAgICAgICAgICBjbGllbnRQYXJhbXNba2V5ICsgJ19hanhwdHlwZSddID0gXCJ0ZXh0L2pzb25cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWFuIFhYWF9ncm91cF9zd2l0Y2ggcGFyYW1ldGVyc1xuICAgICAgICBmb3IgKHZhciB0aGVLZXkgaW4gY2xpZW50UGFyYW1zKSB7XG4gICAgICAgICAgICBpZiAoIWNsaWVudFBhcmFtcy5oYXNPd25Qcm9wZXJ0eSh0aGVLZXkpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKHRoZUtleS5pbmRleE9mKFwiL1wiKSA9PSAtMSAmJiBjbGllbnRQYXJhbXNbdGhlS2V5XSAmJiBjbGllbnRQYXJhbXNbdGhlS2V5ICsgXCJfYWp4cHR5cGVcIl0gJiYgY2xpZW50UGFyYW1zW3RoZUtleSArIFwiX2FqeHB0eXBlXCJdLnN0YXJ0c1dpdGgoXCJncm91cF9zd2l0Y2g6XCIpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjbGllbnRQYXJhbXNbdGhlS2V5XSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtc1t0aGVLZXldID0gSlNPTi5zdHJpbmdpZnkoeyBncm91cF9zd2l0Y2hfdmFsdWU6IGNsaWVudFBhcmFtc1t0aGVLZXldIH0pO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnRQYXJhbXNbdGhlS2V5ICsgXCJfYWp4cHR5cGVcIl0gPSBcInRleHQvanNvblwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjbGllbnRQYXJhbXMuaGFzT3duUHJvcGVydHkodGhlS2V5KSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGVLZXkuZW5kc1dpdGgoXCJfZ3JvdXBfc3dpdGNoXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjbGllbnRQYXJhbXNbdGhlS2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2xpZW50UGFyYW1zO1xuICAgIH07XG5cbiAgICByZXR1cm4gTWFuYWdlcjtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE1hbmFnZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfbWFuYWdlck1hbmFnZXIgPSByZXF1aXJlKCcuLi9tYW5hZ2VyL01hbmFnZXInKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYW5hZ2VyTWFuYWdlcik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBBc3luY0NvbXBvbmVudCA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuQXN5bmNDb21wb25lbnQ7XG5cbi8qKlxuICogRGlzcGxheSBhIGZvcm0gY29tcGFuaW9uIGxpbmtlZCB0byBhIGdpdmVuIGlucHV0LlxuICogUHJvcHM6IGhlbHBlckRhdGEgOiBjb250YWlucyB0aGUgcGx1Z2luSWQgYW5kIHRoZSB3aG9sZSBwYXJhbUF0dHJpYnV0ZXNcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnRm9ybUhlbHBlcicsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgaGVscGVyRGF0YTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgY2xvc2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgY2xvc2VIZWxwZXI6IGZ1bmN0aW9uIGNsb3NlSGVscGVyKCkge1xuICAgICAgICB0aGlzLnByb3BzLmNsb3NlKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgaGVscGVyID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5oZWxwZXJEYXRhKSB7XG4gICAgICAgICAgICB2YXIgaGVscGVyc0NhY2hlID0gX21hbmFnZXJNYW5hZ2VyMlsnZGVmYXVsdCddLmdldEhlbHBlcnNDYWNoZSgpO1xuICAgICAgICAgICAgdmFyIHBsdWdpbkhlbHBlck5hbWVzcGFjZSA9IGhlbHBlcnNDYWNoZVt0aGlzLnByb3BzLmhlbHBlckRhdGFbJ3BsdWdpbklkJ11dWyduYW1lc3BhY2UnXTtcbiAgICAgICAgICAgIGhlbHBlciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdoZWxwZXItdGl0bGUnIH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2hlbHBlci1jbG9zZSBtZGkgbWRpLWNsb3NlJywgb25DbGljazogdGhpcy5jbG9zZUhlbHBlciB9KSxcbiAgICAgICAgICAgICAgICAgICAgJ1B5ZGlvIENvbXBhbmlvbidcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2hlbHBlci1jb250ZW50JyB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEFzeW5jQ29tcG9uZW50LCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcy5oZWxwZXJEYXRhLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IHBsdWdpbkhlbHBlck5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5hbWU6ICdIZWxwZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1OYW1lOiB0aGlzLnByb3BzLmhlbHBlckRhdGFbJ3BhcmFtQXR0cmlidXRlcyddWyduYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdweWRpby1mb3JtLWhlbHBlcicgKyAoaGVscGVyID8gJyBoZWxwZXItdmlzaWJsZScgOiAnIGhlbHBlci1lbXB0eScpLCBzdHlsZTogeyB6SW5kZXg6IDEgfSB9LFxuICAgICAgICAgICAgaGVscGVyXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfR3JvdXBTd2l0Y2hQYW5lbCA9IHJlcXVpcmUoJy4vR3JvdXBTd2l0Y2hQYW5lbCcpO1xuXG52YXIgX0dyb3VwU3dpdGNoUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfR3JvdXBTd2l0Y2hQYW5lbCk7XG5cbnZhciBfUmVwbGljYXRpb25QYW5lbCA9IHJlcXVpcmUoJy4vUmVwbGljYXRpb25QYW5lbCcpO1xuXG52YXIgX1JlcGxpY2F0aW9uUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUmVwbGljYXRpb25QYW5lbCk7XG5cbnZhciBfbWFuYWdlck1hbmFnZXIgPSByZXF1aXJlKCcuLi9tYW5hZ2VyL01hbmFnZXInKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYW5hZ2VyTWFuYWdlcik7XG5cbnZhciBfcHlkaW9VdGlsTGFuZyA9IHJlcXVpcmUoXCJweWRpby91dGlsL2xhbmdcIik7XG5cbnZhciBfcHlkaW9VdGlsTGFuZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxMYW5nKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZShcIm1hdGVyaWFsLXVpXCIpO1xuXG4vKipcbiAqIEZvcm0gUGFuZWwgaXMgYSByZWFkeSB0byB1c2UgZm9ybSBidWlsZGVyIGluaGVyaXRlZCBmb3IgUHlkaW8ncyBsZWdhY3kgcGFyYW1ldGVycyBmb3JtYXRzICgnc3RhbmRhcmQgZm9ybScpLlxuICogSXQgaXMgdmVyeSB2ZXJzYXRpbGUgYW5kIGNhbiBiYXNpY2FsbHkgdGFrZSBhIHNldCBvZiBwYXJhbWV0ZXJzIGRlZmluZWQgaW4gdGhlIFhNTCBtYW5pZmVzdHMgKG9yIGRlZmluZWQgbWFudWFsbHlcbiAqIGluIEpTKSBhbmQgZGlzcGxheSB0aGVtIGFzIGEgdXNlciBmb3JtLlxuICogSXQgaXMgYSBjb250cm9sbGVkIGNvbXBvbmVudDogaXQgdGFrZXMgYSB7dmFsdWVzfSBvYmplY3QgYW5kIHRyaWdnZXJzIGJhY2sgYW4gb25DaGFuZ2UoKSBmdW5jdGlvbi5cbiAqXG4gKiBTZWUgYWxzbyBNYW5hZ2VyIGNsYXNzIHRvIGdldCBzb21lIHV0aWxpdGFyeSBmdW5jdGlvbnMgdG8gcGFyc2UgcGFyYW1ldGVycyBhbmQgZXh0cmFjdCB2YWx1ZXMgZm9yIHRoZSBmb3JtLlxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnRm9ybVBhbmVsJyxcblxuICAgIF9oaWRkZW5WYWx1ZXM6IHt9LFxuICAgIF9pbnRlcm5hbFZhbGlkOiBudWxsLFxuICAgIF9wYXJhbWV0ZXJzTWV0YWRhdGE6IG51bGwsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IG9mIFB5ZGlvIFN0YW5kYXJkRm9ybSBwYXJhbWV0ZXJzXG4gICAgICAgICAqL1xuICAgICAgICBwYXJhbWV0ZXJzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYmplY3QgY29udGFpbmluZyB2YWx1ZXMgZm9yIHRoZSBwYXJhbWV0ZXJzXG4gICAgICAgICAqL1xuICAgICAgICB2YWx1ZXM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlciB1bml0YXJ5IGZ1bmN0aW9uIHdoZW4gb25lIGZvcm0gaW5wdXQgY2hhbmdlcy5cbiAgICAgICAgICovXG4gICAgICAgIG9uUGFyYW1ldGVyQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZW5kIGFsbCBmb3JtIHZhbHVlcyBvbmNoYW5nZSwgaW5jbHVkaW5nIGV2ZW50dWFsbHkgdGhlIHJlbW92ZWQgb25lcyAoZm9yIGR5bmFtaWMgcGFuZWxzKVxuICAgICAgICAgKi9cbiAgICAgICAgb25DaGFuZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIHRoZSBmb3JtIGdsb2JhYmFsbHkgc3dpdGNoZXMgYmV0d2VlbiB2YWxpZCBhbmQgaW52YWxpZCBzdGF0ZVxuICAgICAgICAgKiBUcmlnZ2VyZWQgb25jZSBhdCBmb3JtIGNvbnN0cnVjdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgb25WYWxpZFN0YXR1c0NoYW5nZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzYWJsZSB0aGUgd2hvbGUgZm9ybSBhdCBvbmNlXG4gICAgICAgICAqL1xuICAgICAgICBkaXNhYmxlZDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5ib29sLFxuICAgICAgICAvKipcbiAgICAgICAgICogU3RyaW5nIGFkZGVkIHRvIHRoZSBpbWFnZSBpbnB1dHMgZm9yIHVwbG9hZC9kb3dubG9hZCBvcGVyYXRpb25zXG4gICAgICAgICAqL1xuICAgICAgICBiaW5hcnlfY29udGV4dDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAwIGJ5IGRlZmF1bHQsIHN1YmZvcm1zIHdpbGwgaGF2ZSB0aGVpciB6RGVwdGggdmFsdWUgaW5jcmVhc2VkIGJ5IG9uZVxuICAgICAgICAgKi9cbiAgICAgICAgZGVwdGg6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMubnVtYmVyLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgYW4gYWRkaXRpb25hbCBoZWFkZXIgY29tcG9uZW50IChhZGRlZCBpbnNpZGUgZmlyc3Qgc3VicGFuZWwpXG4gICAgICAgICAqL1xuICAgICAgICBoZWFkZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGFuIGFkZGl0aW9uYWwgZm9vdGVyIGNvbXBvbmVudCAoYWRkZWQgaW5zaWRlIGxhc3Qgc3VicGFuZWwpXG4gICAgICAgICAqL1xuICAgICAgICBmb290ZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIG90aGVyIGFyYml0cmFyeSBwYW5lbHMsIGVpdGhlciBhdCB0aGUgdG9wIG9yIHRoZSBib3R0b21cbiAgICAgICAgICovXG4gICAgICAgIGFkZGl0aW9uYWxQYW5lczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgICAgICB0b3A6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYXJyYXksXG4gICAgICAgICAgICBib3R0b206IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYXJyYXlcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBbiBhcnJheSBvZiB0YWJzIGNvbnRhaW5pbmcgZ3JvdXBOYW1lcy4gR3JvdXBzIHdpbGwgYmUgc3BsaXR0ZWRcbiAgICAgICAgICogYWNjcm9zcyB0aG9zZSB0YWJzXG4gICAgICAgICAqL1xuICAgICAgICB0YWJzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmFycmF5LFxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZWQgd2hlbiBhIHRoZSBhY3RpdmUgdGFiIGNoYW5nZXNcbiAgICAgICAgICovXG4gICAgICAgIG9uVGFiQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIGJpdCBsaWtlIHRhYnMsIGJ1dCB1c2luZyBhY2NvcmRpb24tbGlrZSBsYXlvdXRcbiAgICAgICAgICovXG4gICAgICAgIGFjY29yZGlvbml6ZUlmR3JvdXBzTW9yZVRoYW46IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgICAvKipcbiAgICAgICAgICogRm9yd2FyZCBhbiBldmVudCB3aGVuIHNjcm9sbGluZyB0aGUgZm9ybVxuICAgICAgICAgKi9cbiAgICAgICAgb25TY3JvbGxDYWxsYmFjazogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzdHJpY3QgdG8gYSBzdWJzZXQgb2YgZmllbGQgZ3JvdXBzXG4gICAgICAgICAqL1xuICAgICAgICBsaW1pdFRvR3JvdXBzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmFycmF5LFxuICAgICAgICAvKipcbiAgICAgICAgICogSWdub3JlIHNvbWUgc3BlY2lmaWMgZmllbGRzIHR5cGVzXG4gICAgICAgICAqL1xuICAgICAgICBza2lwRmllbGRzVHlwZXM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYXJyYXksXG5cbiAgICAgICAgLyogSGVscGVyIE9wdGlvbnMgKi9cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBhc3MgcG9pbnRlcnMgdG8gdGhlIFB5ZGlvIENvbXBhbmlvbiBjb250YWluZXJcbiAgICAgICAgICovXG4gICAgICAgIHNldEhlbHBlckRhdGE6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBjb21wYW5pb24gaXMgYWN0aXZlIG9yIG5vbmUgYW5kIGlmIGEgcGFyYW1ldGVyXG4gICAgICAgICAqIGhhcyBoZWxwZXIgZGF0YVxuICAgICAgICAgKi9cbiAgICAgICAgY2hlY2tIYXNIZWxwZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRlc3QgZm9yIHBhcmFtZXRlclxuICAgICAgICAgKi9cbiAgICAgICAgaGVscGVyVGVzdEZvcjogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmdcblxuICAgIH0sXG5cbiAgICBleHRlcm5hbGx5U2VsZWN0VGFiOiBmdW5jdGlvbiBleHRlcm5hbGx5U2VsZWN0VGFiKGluZGV4KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWJTZWxlY3RlZEluZGV4OiBpbmRleCB9KTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uVGFiQ2hhbmdlKSB7XG4gICAgICAgICAgICByZXR1cm4geyB0YWJTZWxlY3RlZEluZGV4OiAwIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHsgZGVwdGg6IDAsIHZhbHVlczoge30gfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICBpZiAoSlNPTi5zdHJpbmdpZnkobmV3UHJvcHMucGFyYW1ldGVycykgIT09IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMucGFyYW1ldGVycykpIHtcbiAgICAgICAgICAgIHRoaXMuX2ludGVybmFsVmFsaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5faGlkZGVuVmFsdWVzID0ge307XG4gICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGEgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3UHJvcHMudmFsdWVzICYmIG5ld1Byb3BzLnZhbHVlcyAhPT0gdGhpcy5wcm9wcy52YWx1ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tWYWxpZFN0YXR1cyhuZXdQcm9wcy52YWx1ZXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFZhbHVlczogZnVuY3Rpb24gZ2V0VmFsdWVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy52YWx1ZXM7IC8vTGFuZ1V0aWxzLm1lcmdlT2JqZWN0c1JlY3Vyc2l2ZSh0aGlzLl9oaWRkZW5WYWx1ZXMsIHRoaXMucHJvcHMudmFsdWVzKTtcbiAgICB9LFxuXG4gICAgb25QYXJhbWV0ZXJDaGFuZ2U6IGZ1bmN0aW9uIG9uUGFyYW1ldGVyQ2hhbmdlKHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIHZhciBhZGRpdGlvbmFsRm9ybURhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzNdO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB3cml0ZVZhbHVlc1xuICAgICAgICB2YXIgbmV3VmFsdWVzID0gX3B5ZGlvVXRpbExhbmcyWydkZWZhdWx0J10uZGVlcENvcHkodGhpcy5nZXRWYWx1ZXMoKSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uUGFyYW1ldGVyQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUGFyYW1ldGVyQ2hhbmdlKHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlLCBhZGRpdGlvbmFsRm9ybURhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhZGRpdGlvbmFsRm9ybURhdGEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fcGFyYW1ldGVyc01ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyYW1ldGVyc01ldGFkYXRhID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGFbcGFyYW1OYW1lXSA9IGFkZGl0aW9uYWxGb3JtRGF0YTtcbiAgICAgICAgfVxuICAgICAgICBuZXdWYWx1ZXNbcGFyYW1OYW1lXSA9IG5ld1ZhbHVlO1xuICAgICAgICB2YXIgZGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKG5ld1ZhbHVlcywgZGlydHkpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UobmV3VmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICAvL25ld1ZhbHVlcyA9IExhbmdVdGlscy5tZXJnZU9iamVjdHNSZWN1cnNpdmUodGhpcy5faGlkZGVuVmFsdWVzLCBuZXdWYWx1ZXMpO1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuX2hpZGRlblZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9oaWRkZW5WYWx1ZXMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBuZXdWYWx1ZXNba2V5XSA9PT0gdW5kZWZpbmVkICYmICghcmVtb3ZlVmFsdWVzIHx8IHJlbW92ZVZhbHVlc1trZXldID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1trZXldID0gdGhpcy5faGlkZGVuVmFsdWVzW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZXMsIGRpcnR5LCByZW1vdmVWYWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tWYWxpZFN0YXR1cyhuZXdWYWx1ZXMpO1xuICAgIH0sXG5cbiAgICBvblN1YmZvcm1DaGFuZ2U6IGZ1bmN0aW9uIG9uU3ViZm9ybUNoYW5nZShuZXdWYWx1ZXMsIGRpcnR5LCByZW1vdmVWYWx1ZXMpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IF9weWRpb1V0aWxMYW5nMlsnZGVmYXVsdCddLm1lcmdlT2JqZWN0c1JlY3Vyc2l2ZSh0aGlzLmdldFZhbHVlcygpLCBuZXdWYWx1ZXMpO1xuICAgICAgICBpZiAocmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIHJlbW92ZVZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVWYWx1ZXMuaGFzT3duUHJvcGVydHkoaykgJiYgdmFsdWVzW2tdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbHVlc1trXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGRlblZhbHVlc1trXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5faGlkZGVuVmFsdWVzW2tdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub25DaGFuZ2UodmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKTtcbiAgICB9LFxuXG4gICAgb25TdWJmb3JtVmFsaWRTdGF0dXNDaGFuZ2U6IGZ1bmN0aW9uIG9uU3ViZm9ybVZhbGlkU3RhdHVzQ2hhbmdlKG5ld1ZhbGlkVmFsdWUsIGZhaWxlZE1hbmRhdG9yaWVzKSB7XG4gICAgICAgIGlmICgobmV3VmFsaWRWYWx1ZSAhPT0gdGhpcy5faW50ZXJuYWxWYWxpZCB8fCB0aGlzLnByb3BzLmZvcmNlVmFsaWRTdGF0dXNDaGVjaykgJiYgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UobmV3VmFsaWRWYWx1ZSwgZmFpbGVkTWFuZGF0b3JpZXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2ludGVybmFsVmFsaWQgPSBuZXdWYWxpZFZhbHVlO1xuICAgIH0sXG5cbiAgICBhcHBseUJ1dHRvbkFjdGlvbjogZnVuY3Rpb24gYXBwbHlCdXR0b25BY3Rpb24ocGFyYW1ldGVycywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24ocGFyYW1ldGVycywgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICAgIC8qXG4gICAgICAgIC8vIE9sZCB3YXlcbiAgICAgICAgcGFyYW1ldGVycyA9IExhbmdVdGlscy5tZXJnZU9iamVjdHNSZWN1cnNpdmUocGFyYW1ldGVycywgdGhpcy5nZXRWYWx1ZXNGb3JQT1NUKHRoaXMuZ2V0VmFsdWVzKCkpKTtcbiAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkucmVxdWVzdChwYXJhbWV0ZXJzLCBjYWxsYmFjayk7XG4gICAgICAgICovXG4gICAgfSxcblxuICAgIGdldFZhbHVlc0ZvclBPU1Q6IGZ1bmN0aW9uIGdldFZhbHVlc0ZvclBPU1QodmFsdWVzKSB7XG4gICAgICAgIHZhciBwcmVmaXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnRFJJVkVSX09QVElPTl8nIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIHJldHVybiBfbWFuYWdlck1hbmFnZXIyWydkZWZhdWx0J10uZ2V0VmFsdWVzRm9yUE9TVCh0aGlzLnByb3BzLnBhcmFtZXRlcnMsIHZhbHVlcywgcHJlZml4LCB0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGEpO1xuICAgIH0sXG5cbiAgICBjaGVja1ZhbGlkU3RhdHVzOiBmdW5jdGlvbiBjaGVja1ZhbGlkU3RhdHVzKHZhbHVlcykge1xuICAgICAgICB2YXIgZmFpbGVkTWFuZGF0b3JpZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcCgoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIGlmIChbJ3N0cmluZycsICd0ZXh0YXJlYScsICdwYXNzd29yZCcsICdpbnRlZ2VyJ10uaW5kZXhPZihwLnR5cGUpID4gLTEgJiYgKHAubWFuZGF0b3J5ID09PSBcInRydWVcIiB8fCBwLm1hbmRhdG9yeSA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcyB8fCAhdmFsdWVzLmhhc093blByb3BlcnR5KHAubmFtZSkgfHwgdmFsdWVzW3AubmFtZV0gPT09IHVuZGVmaW5lZCB8fCB2YWx1ZXNbcC5uYW1lXSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICBmYWlsZWRNYW5kYXRvcmllcy5wdXNoKHApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwLnR5cGUgPT09ICd2YWxpZC1wYXNzd29yZCcgJiYgdGhpcy5yZWZzWydmb3JtLWVsZW1lbnQtJyArIHAubmFtZV0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucmVmc1snZm9ybS1lbGVtZW50LScgKyBwLm5hbWVdLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgICAgICAgICBmYWlsZWRNYW5kYXRvcmllcy5wdXNoKHApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIHZhciBwcmV2aW91c1ZhbHVlID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmV3VmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHByZXZpb3VzVmFsdWUgPSB0aGlzLl9pbnRlcm5hbFZhbGlkOyAvLyh0aGlzLl9pbnRlcm5hbFZhbGlkICE9PSB1bmRlZmluZWQgPyB0aGlzLl9pbnRlcm5hbFZhbGlkIDogdHJ1ZSk7XG4gICAgICAgIG5ld1ZhbHVlID0gIWZhaWxlZE1hbmRhdG9yaWVzLmxlbmd0aDtcbiAgICAgICAgaWYgKChuZXdWYWx1ZSAhPT0gdGhpcy5faW50ZXJuYWxWYWxpZCB8fCB0aGlzLnByb3BzLmZvcmNlVmFsaWRTdGF0dXNDaGVjaykgJiYgdGhpcy5wcm9wcy5vblZhbGlkU3RhdHVzQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UobmV3VmFsdWUsIGZhaWxlZE1hbmRhdG9yaWVzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnRlcm5hbFZhbGlkID0gbmV3VmFsdWU7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5jaGVja1ZhbGlkU3RhdHVzKHRoaXMucHJvcHMudmFsdWVzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyR3JvdXBIZWFkZXI6IGZ1bmN0aW9uIHJlbmRlckdyb3VwSGVhZGVyKGdyb3VwTGFiZWwsIGFjY29yZGlvbml6ZSwgaW5kZXgsIGFjdGl2ZSkge1xuXG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0geyBrZXk6ICdncm91cC0nICsgZ3JvdXBMYWJlbCB9O1xuICAgICAgICBpZiAoYWNjb3JkaW9uaXplKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5jdXJyZW50QWN0aXZlR3JvdXAgPyB0aGlzLnN0YXRlLmN1cnJlbnRBY3RpdmVHcm91cCA6IG51bGw7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydjbGFzc05hbWUnXSA9ICdncm91cC1sYWJlbC0nICsgKGFjdGl2ZSA/ICdhY3RpdmUnIDogJ2luYWN0aXZlJyk7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydvbkNsaWNrJ10gPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXJyZW50QWN0aXZlR3JvdXA6IGN1cnJlbnQgIT09IGluZGV4ID8gaW5kZXggOiBudWxsIH0pO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGdyb3VwTGFiZWwgPSBbX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGtleTogJ3RvZ2dsZXInLCBjbGFzc05hbWU6IFwiZ3JvdXAtYWN0aXZlLXRvZ2dsZXIgaWNvbi1hbmdsZS1cIiArIChjdXJyZW50ID09PSBpbmRleCA/ICdkb3duJyA6ICdyaWdodCcpIH0pLCBncm91cExhYmVsXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnaCcgKyAoMyArIHRoaXMucHJvcHMuZGVwdGgpLCBwcm9wZXJ0aWVzLCBncm91cExhYmVsKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHZhciBhbGxHcm91cHMgPSBbXTtcbiAgICAgICAgdmFyIGdyb3Vwc09yZGVyZWQgPSBbJ19fREVGQVVMVF9fJ107XG4gICAgICAgIGFsbEdyb3Vwc1snX19ERUZBVUxUX18nXSA9IHsgRklFTERTOiBbXSB9O1xuICAgICAgICB2YXIgcmVwbGljYXRpb25Hcm91cHMgPSB7fTtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gX3Byb3BzLnBhcmFtZXRlcnM7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBfcHJvcHMudmFsdWVzO1xuICAgICAgICB2YXIgc2tpcEZpZWxkc1R5cGVzID0gX3Byb3BzLnNraXBGaWVsZHNUeXBlcztcbiAgICAgICAgdmFyIGRpc2FibGVkID0gX3Byb3BzLmRpc2FibGVkO1xuICAgICAgICB2YXIgYmluYXJ5X2NvbnRleHQgPSBfcHJvcHMuYmluYXJ5X2NvbnRleHQ7XG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGFsdFRleHRTd2l0Y2hJY29uID0gX3Byb3BzMi5hbHRUZXh0U3dpdGNoSWNvbjtcbiAgICAgICAgdmFyIGFsdFRleHRTd2l0Y2hUaXAgPSBfcHJvcHMyLmFsdFRleHRTd2l0Y2hUaXA7XG4gICAgICAgIHZhciBvbkFsdFRleHRTd2l0Y2ggPSBfcHJvcHMyLm9uQWx0VGV4dFN3aXRjaDtcblxuICAgICAgICBwYXJhbWV0ZXJzLm1hcCgoZnVuY3Rpb24gKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciB0eXBlID0gYXR0cmlidXRlc1sndHlwZSddO1xuICAgICAgICAgICAgaWYgKHNraXBGaWVsZHNUeXBlcyAmJiBza2lwRmllbGRzVHlwZXMuaW5kZXhPZih0eXBlKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBhcmFtTmFtZSA9IGF0dHJpYnV0ZXNbJ25hbWUnXTtcbiAgICAgICAgICAgIHZhciBmaWVsZDtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzWydncm91cF9zd2l0Y2hfbmFtZSddKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZ3JvdXAgPSBhdHRyaWJ1dGVzWydncm91cCddIHx8ICdfX0RFRkFVTFRfXyc7XG4gICAgICAgICAgICBpZiAoIWFsbEdyb3Vwc1tncm91cF0pIHtcbiAgICAgICAgICAgICAgICBncm91cHNPcmRlcmVkLnB1c2goZ3JvdXApO1xuICAgICAgICAgICAgICAgIGFsbEdyb3Vwc1tncm91cF0gPSB7IEZJRUxEUzogW10sIExBQkVMOiBncm91cCB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVwR3JvdXAgPSBhdHRyaWJ1dGVzLnJlcGxpY2F0aW9uR3JvdXA7XG5cbiAgICAgICAgICAgIGlmIChyZXBHcm91cCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCFyZXBsaWNhdGlvbkdyb3Vwc1tyZXBHcm91cF0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVwbGljYXRpb25Hcm91cHNbcmVwR3JvdXBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgUEFSQU1TOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIEdST1VQOiBncm91cCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFBPU0lUSU9OOiBhbGxHcm91cHNbZ3JvdXBdLkZJRUxEUy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgYWxsR3JvdXBzW2dyb3VwXS5GSUVMRFMucHVzaCgnUkVQTElDQVRJT046JyArIHJlcEdyb3VwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ29weVxuICAgICAgICAgICAgICAgIHZhciByZXBBdHRyID0gX3B5ZGlvVXRpbExhbmcyWydkZWZhdWx0J10uZGVlcENvcHkoYXR0cmlidXRlcyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlcEF0dHJbJ3JlcGxpY2F0aW9uR3JvdXAnXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVwQXR0clsnZ3JvdXAnXTtcbiAgICAgICAgICAgICAgICByZXBsaWNhdGlvbkdyb3Vwc1tyZXBHcm91cF0uUEFSQU1TLnB1c2gocmVwQXR0cik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUuaW5kZXhPZihcImdyb3VwX3N3aXRjaDpcIikgPT09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9Hcm91cFN3aXRjaFBhbmVsMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25TdWJmb3JtQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1BdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVyczogcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNjcm9sbENhbGxiYWNrOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGltaXRUb0dyb3VwczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsaWRTdGF0dXNDaGFuZ2U6IHRoaXMub25TdWJmb3JtVmFsaWRTdGF0dXNDaGFuZ2VcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlc1sndHlwZSddICE9PSAnaGlkZGVuJykge1xuICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGVscGVyTWFyayA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfcHJvcHMzID0gX3RoaXMucHJvcHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2V0SGVscGVyRGF0YSA9IF9wcm9wczMuc2V0SGVscGVyRGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjaGVja0hhc0hlbHBlciA9IF9wcm9wczMuY2hlY2tIYXNIZWxwZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGVscGVyVGVzdEZvciA9IF9wcm9wczMuaGVscGVyVGVzdEZvcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldEhlbHBlckRhdGEgJiYgY2hlY2tIYXNIZWxwZXIgJiYgY2hlY2tIYXNIZWxwZXIoYXR0cmlidXRlc1snbmFtZSddLCBoZWxwZXJUZXN0Rm9yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzaG93SGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0SGVscGVyRGF0YSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbUF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RWYWx1ZXM6IHRoaXMuZ2V0VmFsdWVzRm9yUE9TVCh2YWx1ZXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlCdXR0b25BY3Rpb246IHRoaXMuYXBwbHlCdXR0b25BY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgaGVscGVyVGVzdEZvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuYmluZChfdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVscGVyTWFyayA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdpY29uLXF1ZXN0aW9uLXNpZ24nLCBvbkNsaWNrOiBzaG93SGVscGVyIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hbmRhdG9yeU1pc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc0xlZ2VuZCA9IFwiZm9ybS1sZWdlbmRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzWydlcnJvclRleHQnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTGVnZW5kID0gXCJmb3JtLWxlZ2VuZCBtYW5kYXRvcnktbWlzc2luZ1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRyaWJ1dGVzWyd3YXJuaW5nVGV4dCddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NMZWdlbmQgPSBcImZvcm0tbGVnZW5kIHdhcm5pbmctbWVzc2FnZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRyaWJ1dGVzWydtYW5kYXRvcnknXSAmJiAoYXR0cmlidXRlc1snbWFuZGF0b3J5J10gPT09IFwidHJ1ZVwiIHx8IGF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddID09PSB0cnVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChbJ3N0cmluZycsICd0ZXh0YXJlYScsICdpbWFnZScsICdpbnRlZ2VyJ10uaW5kZXhPZihhdHRyaWJ1dGVzWyd0eXBlJ10pICE9PSAtMSAmJiAhdmFsdWVzW3BhcmFtTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFuZGF0b3J5TWlzc2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTGVnZW5kID0gXCJmb3JtLWxlZ2VuZCBtYW5kYXRvcnktbWlzc2luZ1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb3BzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogXCJmb3JtLWVsZW1lbnQtXCIgKyBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogYXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlc1twYXJhbU5hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUsIGFkZGl0aW9uYWxGb3JtRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5vblBhcmFtZXRlckNoYW5nZShwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSwgYWRkaXRpb25hbEZvcm1EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCB8fCBhdHRyaWJ1dGVzWydyZWFkb25seSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiBhdHRyaWJ1dGVzWydtdWx0aXBsZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmFyeV9jb250ZXh0OiBiaW5hcnlfY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5Q29udGV4dDogJ2Zvcm0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5QnV0dG9uQWN0aW9uOiBfdGhpcy5hcHBseUJ1dHRvbkFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IG1hbmRhdG9yeU1pc3NpbmcgPyBweWRpby5NZXNzYWdlSGFzaFsnNjIxJ10gOiBhdHRyaWJ1dGVzLmVycm9yVGV4dCA/IGF0dHJpYnV0ZXMuZXJyb3JUZXh0IDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkFsdFRleHRTd2l0Y2g6IG9uQWx0VGV4dFN3aXRjaCwgYWx0VGV4dFN3aXRjaEljb246IGFsdFRleHRTd2l0Y2hJY29uLCBhbHRUZXh0U3dpdGNoVGlwOiBhbHRUZXh0U3dpdGNoVGlwXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsga2V5OiBwYXJhbU5hbWUsIGNsYXNzTmFtZTogJ2Zvcm0tZW50cnktJyArIGF0dHJpYnV0ZXNbJ3R5cGUnXSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IGNsYXNzTGVnZW5kIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNbJ3dhcm5pbmdUZXh0J10gPyBhdHRyaWJ1dGVzWyd3YXJuaW5nVGV4dCddIDogYXR0cmlidXRlc1snZGVzY3JpcHRpb24nXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWxwZXJNYXJrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWFuYWdlck1hbmFnZXIyWydkZWZhdWx0J10uY3JlYXRlRm9ybUVsZW1lbnQocHJvcHMpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlkZGVuVmFsdWVzW3BhcmFtTmFtZV0gPSB2YWx1ZXNbcGFyYW1OYW1lXSA9PT0gdW5kZWZpbmVkID8gYXR0cmlidXRlc1snZGVmYXVsdCddIDogdmFsdWVzW3BhcmFtTmFtZV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbEdyb3Vwc1tncm91cF0uRklFTERTLnB1c2goZmllbGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgZm9yICh2YXIgckdyb3VwIGluIHJlcGxpY2F0aW9uR3JvdXBzKSB7XG4gICAgICAgICAgICBpZiAoIXJlcGxpY2F0aW9uR3JvdXBzLmhhc093blByb3BlcnR5KHJHcm91cCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByR3JvdXBEYXRhID0gcmVwbGljYXRpb25Hcm91cHNbckdyb3VwXTtcbiAgICAgICAgICAgIGFsbEdyb3Vwc1tyR3JvdXBEYXRhLkdST1VQXS5GSUVMRFNbckdyb3VwRGF0YS5QT1NJVElPTl0gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfUmVwbGljYXRpb25QYW5lbDJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVwbGljYXRpb24tZ3JvdXAtXCIgKyByR3JvdXBEYXRhLlBBUkFNU1swXS5uYW1lLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uU3ViZm9ybUNoYW5nZSxcbiAgICAgICAgICAgICAgICBvblBhcmFtZXRlckNoYW5nZTogbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXMuZ2V0VmFsdWVzKCksXG4gICAgICAgICAgICAgICAgZGVwdGg6IHRoaXMucHJvcHMuZGVwdGggKyAxLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHJHcm91cERhdGEuUEFSQU1TLFxuICAgICAgICAgICAgICAgIGFwcGx5QnV0dG9uQWN0aW9uOiB0aGlzLmFwcGx5QnV0dG9uQWN0aW9uLFxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsQ2FsbGJhY2s6IG51bGxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBncm91cFBhbmVzID0gW107XG4gICAgICAgIHZhciBhY2NvcmRpb25pemUgPSB0aGlzLnByb3BzLmFjY29yZGlvbml6ZUlmR3JvdXBzTW9yZVRoYW4gJiYgZ3JvdXBzT3JkZXJlZC5sZW5ndGggPiB0aGlzLnByb3BzLmFjY29yZGlvbml6ZUlmR3JvdXBzTW9yZVRoYW47XG4gICAgICAgIHZhciBjdXJyZW50QWN0aXZlR3JvdXAgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuY3VycmVudEFjdGl2ZUdyb3VwID8gdGhpcy5zdGF0ZS5jdXJyZW50QWN0aXZlR3JvdXAgOiAwO1xuICAgICAgICBncm91cHNPcmRlcmVkLm1hcCgoZnVuY3Rpb24gKGcsIGdJbmRleCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubGltaXRUb0dyb3VwcyAmJiB0aGlzLnByb3BzLmxpbWl0VG9Hcm91cHMuaW5kZXhPZihnKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGVhZGVyLFxuICAgICAgICAgICAgICAgIGdEYXRhID0gYWxsR3JvdXBzW2ddO1xuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9ICdweWRpby1mb3JtLWdyb3VwJyxcbiAgICAgICAgICAgICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChhY2NvcmRpb25pemUpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmUgPSBjdXJyZW50QWN0aXZlR3JvdXAgPT09IGdJbmRleDtcbiAgICAgICAgICAgICAgICBpZiAoZ0luZGV4ID09PSBjdXJyZW50QWN0aXZlR3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgZm9ybS1ncm91cC1hY3RpdmUnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnIGZvcm0tZ3JvdXAtaW5hY3RpdmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZ0RhdGEuRklFTERTLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChnRGF0YS5MQUJFTCAmJiAhKHRoaXMucHJvcHMuc2tpcEZpZWxkc1R5cGVzICYmIHRoaXMucHJvcHMuc2tpcEZpZWxkc1R5cGVzLmluZGV4T2YoJ0dyb3VwSGVhZGVyJykgPiAtMSkpIHtcbiAgICAgICAgICAgICAgICBoZWFkZXIgPSB0aGlzLnJlbmRlckdyb3VwSGVhZGVyKGdEYXRhLkxBQkVMLCBhY2NvcmRpb25pemUsIGdJbmRleCwgYWN0aXZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgei1kZXB0aC0xJztcbiAgICAgICAgICAgICAgICBncm91cFBhbmVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCBrZXk6ICdwYW5lLScgKyBnIH0sXG4gICAgICAgICAgICAgICAgICAgIGdJbmRleCA9PT0gMCAmJiB0aGlzLnByb3BzLmhlYWRlciA/IHRoaXMucHJvcHMuaGVhZGVyIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdEYXRhLkZJRUxEU1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBnSW5kZXggPT09IGdyb3Vwc09yZGVyZWQubGVuZ3RoIC0gMSAmJiB0aGlzLnByb3BzLmZvb3RlciA/IHRoaXMucHJvcHMuZm9vdGVyIDogbnVsbFxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBncm91cFBhbmVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCBrZXk6ICdwYW5lLScgKyBnIH0sXG4gICAgICAgICAgICAgICAgICAgIGdJbmRleCA9PT0gMCAmJiB0aGlzLnByb3BzLmhlYWRlciA/IHRoaXMucHJvcHMuaGVhZGVyIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdEYXRhLkZJRUxEU1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBnSW5kZXggPT09IGdyb3Vwc09yZGVyZWQubGVuZ3RoIC0gMSAmJiB0aGlzLnByb3BzLmZvb3RlciA/IHRoaXMucHJvcHMuZm9vdGVyIDogbnVsbFxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYWRkaXRpb25hbFBhbmVzKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBvdGhlclBhbmVzID0geyB0b3A6IFtdLCBib3R0b206IFtdIH07XG4gICAgICAgICAgICAgICAgdmFyIGRlcHRoID0gX3RoaXMyLnByb3BzLmRlcHRoO1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IDA7XG5cbiAgICAgICAgICAgICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW90aGVyUGFuZXMuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnY29udGludWUnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpczIucHJvcHMuYWRkaXRpb25hbFBhbmVzW2tdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIucHJvcHMuYWRkaXRpb25hbFBhbmVzW2tdLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXB0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlclBhbmVzW2tdLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncHlkaW8tZm9ybS1ncm91cCBhZGRpdGlvbmFsJywga2V5OiAnb3RoZXItcGFuZS0nICsgaW5kZXggfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXJQYW5lc1trXS5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3B5ZGlvLWZvcm0tZ3JvdXAgYWRkaXRpb25hbCcsIGtleTogJ290aGVyLXBhbmUtJyArIGluZGV4IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvdGhlclBhbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfcmV0MyA9IF9sb29wKGspO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfcmV0MyA9PT0gJ2NvbnRpbnVlJykgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyb3VwUGFuZXMgPSBvdGhlclBhbmVzWyd0b3AnXS5jb25jYXQoZ3JvdXBQYW5lcykuY29uY2F0KG90aGVyUGFuZXNbJ2JvdHRvbSddKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy50YWJzKSB7XG4gICAgICAgICAgICB2YXIgX3JldDQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBfdGhpczIucHJvcHMuY2xhc3NOYW1lO1xuICAgICAgICAgICAgICAgIHZhciBpbml0aWFsU2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgICAgICAgIHZhciB0YWJzID0gX3RoaXMyLnByb3BzLnRhYnMubWFwKChmdW5jdGlvbiAodERlZikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSB0RGVmWydsYWJlbCddO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZ3JvdXBzID0gdERlZlsnZ3JvdXBzJ107XG4gICAgICAgICAgICAgICAgICAgIGlmICh0RGVmWydzZWxlY3RlZCddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsU2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhbmVzID0gZ3JvdXBzLm1hcChmdW5jdGlvbiAoZ0lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXBQYW5lc1tnSWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdyb3VwUGFuZXNbZ0lkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRhYixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMub25UYWJDaGFuZ2UgPyBpIC0gMSA6IHVuZGVmaW5lZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IChjbGFzc05hbWUgPyBjbGFzc05hbWUgKyAnICcgOiAnICcpICsgJ3B5ZGlvLWZvcm0tcGFuZWwnICsgKHBhbmVzLmxlbmd0aCAlIDIgPyAnIGZvcm0tcGFuZWwtb2RkJyA6ICcnKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSkuYmluZChfdGhpczIpKTtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMyLnN0YXRlLnRhYlNlbGVjdGVkSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpbml0aWFsU2VsZWN0ZWRJbmRleCA9IF90aGlzMi5zdGF0ZS50YWJTZWxlY3RlZEluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB2OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdsYXlvdXQtZmlsbCB2ZXJ0aWNhbC1sYXlvdXQgdGFiLXZlcnRpY2FsLWxheW91dCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRhYnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWY6ICd0YWJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFNlbGVjdGVkSW5kZXg6IGluaXRpYWxTZWxlY3RlZEluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogX3RoaXMyLnByb3BzLm9uVGFiQ2hhbmdlID8gaW5pdGlhbFNlbGVjdGVkSW5kZXggOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBfdGhpczIucHJvcHMub25UYWJDaGFuZ2UgPyBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgdGFiU2VsZWN0ZWRJbmRleDogaSB9KTtfdGhpczIucHJvcHMub25UYWJDaGFuZ2UoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudENvbnRhaW5lclN0eWxlOiB7IGZsZXg6IDEsIG92ZXJmbG93WTogJ2F1dG8nIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYnNcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIF9yZXQ0ID09PSAnb2JqZWN0JykgcmV0dXJuIF9yZXQ0LnY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICh0aGlzLnByb3BzLmNsYXNzTmFtZSA/IHRoaXMucHJvcHMuY2xhc3NOYW1lICsgJyAnIDogJyAnKSArICdweWRpby1mb3JtLXBhbmVsJyArIChncm91cFBhbmVzLmxlbmd0aCAlIDIgPyAnIGZvcm0tcGFuZWwtb2RkJyA6ICcnKSwgb25TY3JvbGw6IHRoaXMucHJvcHMub25TY3JvbGxDYWxsYmFjayB9LFxuICAgICAgICAgICAgICAgIGdyb3VwUGFuZXNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX0Zvcm1QYW5lbCA9IHJlcXVpcmUoJy4vRm9ybVBhbmVsJyk7XG5cbnZhciBfRm9ybVBhbmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0Zvcm1QYW5lbCk7XG5cbnZhciBfZmllbGRzSW5wdXRTZWxlY3RCb3ggPSByZXF1aXJlKCcuLi9maWVsZHMvSW5wdXRTZWxlY3RCb3gnKTtcblxudmFyIF9maWVsZHNJbnB1dFNlbGVjdEJveDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dFNlbGVjdEJveCk7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBMYW5nVXRpbHMgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxuLyoqXG4gKiBTdWIgZm9ybSB3aXRoIGEgc2VsZWN0b3IsIHN3aXRjaGluZyBpdHMgZmllbGRzIGRlcGVuZGluZ1xuICogb24gdGhlIHNlbGVjdG9yIHZhbHVlLlxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdHcm91cFN3aXRjaFBhbmVsJyxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBwYXJhbUF0dHJpYnV0ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgcGFyYW1ldGVyczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgICAgIHZhbHVlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBvbkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICAgIH0sXG5cbiAgICBjb21wdXRlU3ViUGFuZWxQYXJhbWV0ZXJzOiBmdW5jdGlvbiBjb21wdXRlU3ViUGFuZWxQYXJhbWV0ZXJzKCkge1xuXG4gICAgICAgIC8vIENSRUFURSBTVUIgRk9STSBQQU5FTFxuICAgICAgICAvLyBHZXQgYWxsIHZhbHVlc1xuICAgICAgICB2YXIgc3dpdGNoTmFtZSA9IHRoaXMucHJvcHMucGFyYW1BdHRyaWJ1dGVzWyd0eXBlJ10uc3BsaXQoXCI6XCIpLnBvcCgpO1xuICAgICAgICB2YXIgcGFyZW50TmFtZSA9IHRoaXMucHJvcHMucGFyYW1BdHRyaWJ1dGVzWyduYW1lJ107XG4gICAgICAgIHZhciBzd2l0Y2hWYWx1ZXMgPSB7fSxcbiAgICAgICAgICAgIHBvdGVudGlhbFN1YlN3aXRjaGVzID0gW107XG5cbiAgICAgICAgdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcCgoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgICAgICAgaWYgKCFwWydncm91cF9zd2l0Y2hfbmFtZSddKSByZXR1cm47XG4gICAgICAgICAgICBpZiAocFsnZ3JvdXBfc3dpdGNoX25hbWUnXSAhPSBzd2l0Y2hOYW1lKSB7XG4gICAgICAgICAgICAgICAgcG90ZW50aWFsU3ViU3dpdGNoZXMucHVzaChwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgY3J0U3dpdGNoID0gcFsnZ3JvdXBfc3dpdGNoX3ZhbHVlJ107XG4gICAgICAgICAgICBpZiAoIXN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoVmFsdWVzW2NydFN3aXRjaF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwWydncm91cF9zd2l0Y2hfbGFiZWwnXSxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzS2V5czoge31cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcCA9IExhbmdVdGlscy5kZWVwQ29weShwKTtcbiAgICAgICAgICAgIGRlbGV0ZSBwWydncm91cF9zd2l0Y2hfbmFtZSddO1xuICAgICAgICAgICAgcFsnbmFtZSddID0gcGFyZW50TmFtZSArICcvJyArIHBbJ25hbWUnXTtcbiAgICAgICAgICAgIHZhciB2S2V5ID0gcFsnbmFtZSddO1xuICAgICAgICAgICAgdmFyIHBhcmFtTmFtZSA9IHZLZXk7XG4gICAgICAgICAgICBpZiAoc3dpdGNoVmFsdWVzW2NydFN3aXRjaF0uZmllbGRzS2V5c1twYXJhbU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoVmFsdWVzW2NydFN3aXRjaF0uZmllbGRzLnB1c2gocCk7XG4gICAgICAgICAgICBzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXS5maWVsZHNLZXlzW3BhcmFtTmFtZV0gPSBwYXJhbU5hbWU7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy52YWx1ZXMgJiYgdGhpcy5wcm9wcy52YWx1ZXNbdktleV0pIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXS52YWx1ZXNbcGFyYW1OYW1lXSA9IHRoaXMucHJvcHMudmFsdWVzW3ZLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gUmVtZXJnZSBwb3RlbnRpYWxTdWJTd2l0Y2hlcyB0byBlYWNoIHBhcmFtZXRlcnMgc2V0XG4gICAgICAgIGZvciAodmFyIGsgaW4gc3dpdGNoVmFsdWVzKSB7XG4gICAgICAgICAgICBpZiAoc3dpdGNoVmFsdWVzLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN2ID0gc3dpdGNoVmFsdWVzW2tdO1xuICAgICAgICAgICAgICAgIHN2LmZpZWxkcyA9IHN2LmZpZWxkcy5jb25jYXQocG90ZW50aWFsU3ViU3dpdGNoZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN3aXRjaFZhbHVlcztcbiAgICB9LFxuXG4gICAgY2xlYXJTdWJQYXJhbWV0ZXJzVmFsdWVzOiBmdW5jdGlvbiBjbGVhclN1YlBhcmFtZXRlcnNWYWx1ZXMocGFyZW50TmFtZSwgbmV3VmFsdWUsIG5ld0ZpZWxkcykge1xuICAgICAgICB2YXIgdmFscyA9IExhbmdVdGlscy5kZWVwQ29weSh0aGlzLnByb3BzLnZhbHVlcyk7XG4gICAgICAgIHZhciB0b1JlbW92ZSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdmFscykge1xuICAgICAgICAgICAgaWYgKHZhbHMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkuaW5kZXhPZihwYXJlbnROYW1lICsgJy8nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRvUmVtb3ZlW2tleV0gPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YWxzW3BhcmVudE5hbWVdID0gbmV3VmFsdWU7XG5cbiAgICAgICAgbmV3RmllbGRzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgaWYgKHAudHlwZSA9PSAnaGlkZGVuJyAmJiBwWydkZWZhdWx0J10gJiYgIXBbJ2dyb3VwX3N3aXRjaF9uYW1lJ10gfHwgcFsnZ3JvdXBfc3dpdGNoX25hbWUnXSA9PSBwYXJlbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFsc1twWyduYW1lJ11dID0gcFsnZGVmYXVsdCddO1xuICAgICAgICAgICAgICAgIGlmICh0b1JlbW92ZVtwWyduYW1lJ11dICE9PSB1bmRlZmluZWQpIGRlbGV0ZSB0b1JlbW92ZVtwWyduYW1lJ11dO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwWyduYW1lJ10uaW5kZXhPZihwYXJlbnROYW1lICsgJy8nKSA9PT0gMCAmJiBwWydkZWZhdWx0J10pIHtcbiAgICAgICAgICAgICAgICBpZiAocFsndHlwZSddICYmIHBbJ3R5cGUnXS5zdGFydHNXaXRoKCdncm91cF9zd2l0Y2g6JykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy92YWxzW3BbJ25hbWUnXV0gPSB7Z3JvdXBfc3dpdGNoX3ZhbHVlOnBbJ2RlZmF1bHQnXX07XG4gICAgICAgICAgICAgICAgICAgIHZhbHNbcFsnbmFtZSddXSA9IHBbJ2RlZmF1bHQnXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWxzW3BbJ25hbWUnXV0gPSBwWydkZWZhdWx0J107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWxzLCB0cnVlLCB0b1JlbW92ZSk7XG4gICAgICAgIC8vdGhpcy5vblBhcmFtZXRlckNoYW5nZShwYXJlbnROYW1lLCBuZXdWYWx1ZSk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZShuZXdWYWx1ZXMsIGRpcnR5LCByZW1vdmVWYWx1ZXMpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZXMsIHRydWUsIHJlbW92ZVZhbHVlcyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMucHJvcHMucGFyYW1BdHRyaWJ1dGVzO1xuICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5wcm9wcy52YWx1ZXM7XG5cbiAgICAgICAgdmFyIHBhcmFtTmFtZSA9IGF0dHJpYnV0ZXNbJ25hbWUnXTtcbiAgICAgICAgdmFyIHN3aXRjaFZhbHVlcyA9IHRoaXMuY29tcHV0ZVN1YlBhbmVsUGFyYW1ldGVycyhhdHRyaWJ1dGVzKTtcbiAgICAgICAgdmFyIHNlbGVjdG9yVmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICBPYmplY3Qua2V5cyhzd2l0Y2hWYWx1ZXMpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgc2VsZWN0b3JWYWx1ZXMuc2V0KGssIHN3aXRjaFZhbHVlc1trXS5sYWJlbCk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgc2VsZWN0b3JDaGFuZ2VyID0gKGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5jbGVhclN1YlBhcmFtZXRlcnNWYWx1ZXMocGFyYW1OYW1lLCBuZXdWYWx1ZSwgc3dpdGNoVmFsdWVzW25ld1ZhbHVlXSA/IHN3aXRjaFZhbHVlc1tuZXdWYWx1ZV0uZmllbGRzIDogW10pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICB2YXIgc3ViRm9ybSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHNlbGVjdG9yTGVnZW5kID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgc2VsZWN0b3IgPSBSZWFjdC5jcmVhdGVFbGVtZW50KF9maWVsZHNJbnB1dFNlbGVjdEJveDJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAga2V5OiBwYXJhbU5hbWUsXG4gICAgICAgICAgICBuYW1lOiBwYXJhbU5hbWUsXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdncm91cC1zd2l0Y2gtc2VsZWN0b3InLFxuICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgIG5hbWU6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICBjaG9pY2VzOiBzZWxlY3RvclZhbHVlcyxcbiAgICAgICAgICAgICAgICBsYWJlbDogYXR0cmlidXRlc1snbGFiZWwnXSxcbiAgICAgICAgICAgICAgICBtYW5kYXRvcnk6IGF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlc1twYXJhbU5hbWVdLFxuICAgICAgICAgICAgb25DaGFuZ2U6IHNlbGVjdG9yQ2hhbmdlcixcbiAgICAgICAgICAgIGRpc3BsYXlDb250ZXh0OiAnZm9ybScsXG4gICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgICAgIHJlZjogJ3N1YkZvcm1TZWxlY3RvcidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGhlbHBlck1hcmsgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNldEhlbHBlckRhdGEgJiYgdGhpcy5wcm9wcy5jaGVja0hhc0hlbHBlciAmJiB0aGlzLnByb3BzLmNoZWNrSGFzSGVscGVyKGF0dHJpYnV0ZXNbJ25hbWUnXSwgdGhpcy5wcm9wcy5oZWxwZXJUZXN0Rm9yKSkge1xuICAgICAgICAgICAgdmFyIHNob3dIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc2V0SGVscGVyRGF0YSh7IHBhcmFtQXR0cmlidXRlczogYXR0cmlidXRlcywgdmFsdWVzOiB2YWx1ZXMgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgaGVscGVyTWFyayA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2ljb24tcXVlc3Rpb24tc2lnbicsIG9uQ2xpY2s6IHNob3dIZWxwZXIgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWVzW3BhcmFtTmFtZV0gJiYgc3dpdGNoVmFsdWVzW3ZhbHVlc1twYXJhbU5hbWVdXSkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgb25BbHRUZXh0U3dpdGNoID0gX3Byb3BzLm9uQWx0VGV4dFN3aXRjaDtcbiAgICAgICAgICAgIHZhciBhbHRUZXh0U3dpdGNoSWNvbiA9IF9wcm9wcy5hbHRUZXh0U3dpdGNoSWNvbjtcbiAgICAgICAgICAgIHZhciBhbHRUZXh0U3dpdGNoVGlwID0gX3Byb3BzLmFsdFRleHRTd2l0Y2hUaXA7XG5cbiAgICAgICAgICAgIHN1YkZvcm0gPSBSZWFjdC5jcmVhdGVFbGVtZW50KF9Gb3JtUGFuZWwyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICBvblBhcmFtZXRlckNoYW5nZTogdGhpcy5wcm9wcy5vblBhcmFtZXRlckNoYW5nZSxcbiAgICAgICAgICAgICAgICBhcHBseUJ1dHRvbkFjdGlvbjogdGhpcy5wcm9wcy5hcHBseUJ1dHRvbkFjdGlvbixcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgICAgICAgICByZWY6IHBhcmFtTmFtZSArICctU1VCJyxcbiAgICAgICAgICAgICAgICBrZXk6IHBhcmFtTmFtZSArICctU1VCJyxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdzdWItZm9ybScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczogc3dpdGNoVmFsdWVzW3ZhbHVlc1twYXJhbU5hbWVdXS5maWVsZHMsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgZGVwdGg6IHRoaXMucHJvcHMuZGVwdGggKyAxLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICAgIGNoZWNrSGFzSGVscGVyOiB0aGlzLnByb3BzLmNoZWNrSGFzSGVscGVyLFxuICAgICAgICAgICAgICAgIHNldEhlbHBlckRhdGE6IHRoaXMucHJvcHMuc2V0SGVscGVyRGF0YSxcbiAgICAgICAgICAgICAgICBoZWxwZXJUZXN0Rm9yOiB2YWx1ZXNbcGFyYW1OYW1lXSxcbiAgICAgICAgICAgICAgICBhY2NvcmRpb25pemVJZkdyb3Vwc01vcmVUaGFuOiA1LFxuICAgICAgICAgICAgICAgIG9uQWx0VGV4dFN3aXRjaDogb25BbHRUZXh0U3dpdGNoLFxuICAgICAgICAgICAgICAgIGFsdFRleHRTd2l0Y2hJY29uOiBhbHRUZXh0U3dpdGNoSWNvbixcbiAgICAgICAgICAgICAgICBhbHRUZXh0U3dpdGNoVGlwOiBhbHRUZXh0U3dpdGNoVGlwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdzdWItZm9ybS1ncm91cCcgfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdmb3JtLWxlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzWydkZXNjcmlwdGlvbiddLFxuICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICBoZWxwZXJNYXJrXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgICBzdWJGb3JtXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX0Zvcm1QYW5lbCA9IHJlcXVpcmUoJy4vRm9ybVBhbmVsJyk7XG5cbnZhciBfRm9ybVBhbmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0Zvcm1QYW5lbCk7XG5cbnZhciBVUF9BUlJPVyA9ICdtZGkgbWRpLWNoZXZyb24tdXAnO1xudmFyIERPV05fQVJST1cgPSAnbWRpIG1kaS1jaGV2cm9uLWRvd24nO1xudmFyIFJFTU9WRSA9ICdtZGkgbWRpLWNsb3NlJztcbnZhciBBRERfVkFMVUUgPSAnbWRpIG1kaS1wbHVzJztcblxudmFyIFJlcGxpY2F0ZWRHcm91cCA9IChmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhSZXBsaWNhdGVkR3JvdXAsIF9Db21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUmVwbGljYXRlZEdyb3VwKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSZXBsaWNhdGVkR3JvdXApO1xuXG4gICAgICAgIF9Db21wb25lbnQuY2FsbCh0aGlzLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgIHZhciBzdWJWYWx1ZXMgPSBwcm9wcy5zdWJWYWx1ZXM7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gcHJvcHMucGFyYW1ldGVycztcblxuICAgICAgICB2YXIgZmlyc3RQYXJhbSA9IHBhcmFtZXRlcnNbMF07XG4gICAgICAgIHZhciBpbnN0YW5jZVZhbHVlID0gc3ViVmFsdWVzW2ZpcnN0UGFyYW1bJ25hbWUnXV0gfHwgJyc7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IHRvZ2dsZWQ6ICFpbnN0YW5jZVZhbHVlIH07XG4gICAgfVxuXG4gICAgUmVwbGljYXRlZEdyb3VwLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBkZXB0aCA9IF9wcm9wcy5kZXB0aDtcbiAgICAgICAgdmFyIG9uU3dhcFVwID0gX3Byb3BzLm9uU3dhcFVwO1xuICAgICAgICB2YXIgb25Td2FwRG93biA9IF9wcm9wcy5vblN3YXBEb3duO1xuICAgICAgICB2YXIgb25SZW1vdmUgPSBfcHJvcHMub25SZW1vdmU7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gX3Byb3BzLnBhcmFtZXRlcnM7XG4gICAgICAgIHZhciBzdWJWYWx1ZXMgPSBfcHJvcHMuc3ViVmFsdWVzO1xuICAgICAgICB2YXIgZGlzYWJsZWQgPSBfcHJvcHMuZGlzYWJsZWQ7XG4gICAgICAgIHZhciBvbkFkZFZhbHVlID0gX3Byb3BzLm9uQWRkVmFsdWU7XG4gICAgICAgIHZhciB0b2dnbGVkID0gdGhpcy5zdGF0ZS50b2dnbGVkO1xuXG4gICAgICAgIHZhciB1bmlxdWUgPSBwYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMTtcbiAgICAgICAgdmFyIGZpcnN0UGFyYW0gPSBwYXJhbWV0ZXJzWzBdO1xuICAgICAgICB2YXIgaW5zdGFuY2VWYWx1ZSA9IHN1YlZhbHVlc1tmaXJzdFBhcmFtWyduYW1lJ11dIHx8IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwwLjMzKScgfSB9LFxuICAgICAgICAgICAgJ0VtcHR5IFZhbHVlJ1xuICAgICAgICApO1xuICAgICAgICB2YXIgaWJTdHlsZXMgPSB7IHdpZHRoOiAzNiwgaGVpZ2h0OiAzNiwgcGFkZGluZzogNiB9O1xuXG4gICAgICAgIGlmICh1bmlxdWUpIHtcbiAgICAgICAgICAgIHZhciBkaXNTdHlsZSA9IHsgb3BhY2l0eTogLjMgfTtcbiAgICAgICAgICAgIHZhciByZW1TdHlsZSA9ICEhIW9uUmVtb3ZlIHx8IGRpc2FibGVkID8gZGlzU3R5bGUgOiB7fTtcbiAgICAgICAgICAgIHZhciB1cFN0eWxlID0gISEhb25Td2FwVXAgfHwgZGlzYWJsZWQgPyBkaXNTdHlsZSA6IHt9O1xuICAgICAgICAgICAgdmFyIGRvd25TdHlsZSA9ICEhIW9uU3dhcERvd24gfHwgZGlzYWJsZWQgPyBkaXNTdHlsZSA6IHt9O1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIHdpZHRoOiAnMTAwJScgfSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9Gb3JtUGFuZWwyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBzdWJWYWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3JlcGxpY2FibGUtdW5pcXVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDAgfVxuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZm9udFNpemU6IDI0LCBwYWRkaW5nTGVmdDogNCwgcGFkZGluZ1RvcDogMiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIG9uQWRkVmFsdWUgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiBBRERfVkFMVUUsIHN0eWxlOiB7IHBhZGRpbmc6ICc4cHggNHB4JywgY3Vyc29yOiAncG9pbnRlcicgfSwgb25DbGljazogb25BZGRWYWx1ZSB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6IFJFTU9WRSwgc3R5bGU6IF9leHRlbmRzKHsgcGFkZGluZzogJzhweCA0cHgnLCBjdXJzb3I6ICdwb2ludGVyJyB9LCByZW1TdHlsZSksIG9uQ2xpY2s6IG9uUmVtb3ZlIH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgcGFkZGluZzogJzAgNHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogVVBfQVJST1csIHN0eWxlOiBfZXh0ZW5kcyh7IGhlaWdodDogMTYsIGN1cnNvcjogJ3BvaW50ZXInIH0sIHVwU3R5bGUpLCBvbkNsaWNrOiBvblN3YXBVcCB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiBET1dOX0FSUk9XLCBzdHlsZTogX2V4dGVuZHMoeyBoZWlnaHQ6IDE2LCBjdXJzb3I6ICdwb2ludGVyJyB9LCBkb3duU3R5bGUpLCBvbkNsaWNrOiBvblN3YXBEb3duIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgIHsgekRlcHRoOiAwLCBzdHlsZTogeyBib3JkZXI6ICcycHggc29saWQgd2hpdGVzbW9rZScsIG1hcmdpbkJvdHRvbTogOCB9IH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1tZW51LScgKyAodGhpcy5zdGF0ZS50b2dnbGVkID8gJ2Rvd24nIDogJ3JpZ2h0JyksIGljb25TdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsLjE1KScgfSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgdG9nZ2xlZDogIV90aGlzLnN0YXRlLnRvZ2dsZWQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBmb250U2l6ZTogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVZhbHVlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgb25BZGRWYWx1ZSAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IGliU3R5bGVzLCBpY29uQ2xhc3NOYW1lOiBBRERfVkFMVUUsIG9uVG91Y2hUYXA6IG9uQWRkVmFsdWUgfSksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBzdHlsZTogaWJTdHlsZXMsIGljb25DbGFzc05hbWU6IFJFTU9WRSwgb25Ub3VjaFRhcDogb25SZW1vdmUsIGRpc2FibGVkOiAhISFvblJlbW92ZSB8fCBkaXNhYmxlZCB9KSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IHN0eWxlOiBpYlN0eWxlcywgaWNvbkNsYXNzTmFtZTogVVBfQVJST1csIG9uVG91Y2hUYXA6IG9uU3dhcFVwLCBkaXNhYmxlZDogISEhb25Td2FwVXAgfHwgZGlzYWJsZWQgfSksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBzdHlsZTogaWJTdHlsZXMsIGljb25DbGFzc05hbWU6IERPV05fQVJST1csIG9uVG91Y2hUYXA6IG9uU3dhcERvd24sIGRpc2FibGVkOiAhISFvblN3YXBEb3duIHx8IGRpc2FibGVkIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHRvZ2dsZWQgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChfRm9ybVBhbmVsMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgIHRhYnM6IG51bGwsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiBzdWJWYWx1ZXMsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAncmVwbGljYWJsZS1ncm91cCcsXG4gICAgICAgICAgICAgICAgZGVwdGg6IC0xXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFJlcGxpY2F0ZWRHcm91cDtcbn0pKF9yZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBSZXBsaWNhdGVkR3JvdXA7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfUmVwbGljYXRlZEdyb3VwID0gcmVxdWlyZSgnLi9SZXBsaWNhdGVkR3JvdXAnKTtcblxudmFyIF9SZXBsaWNhdGVkR3JvdXAyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUmVwbGljYXRlZEdyb3VwKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIEljb25CdXR0b24gPSBfcmVxdWlyZS5JY29uQnV0dG9uO1xuXG52YXIgTGFuZ1V0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbi8qKlxuICogU3ViIGZvcm0gcmVwbGljYXRpbmcgaXRzZWxmICgrLy0pXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1JlcGxpY2F0aW9uUGFuZWwnLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHBhcmFtZXRlcnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgICB2YWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICBiaW5hcnlfY29udGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgZGVwdGg6IFJlYWN0LlByb3BUeXBlcy5udW1iZXJcbiAgICB9LFxuXG4gICAgYnVpbGRTdWJWYWx1ZTogZnVuY3Rpb24gYnVpbGRTdWJWYWx1ZSh2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB2YXIgc3ViVmFsID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgc3VmZml4ID0gaW5kZXggPT0gMCA/ICcnIDogJ18nICsgaW5kZXg7XG4gICAgICAgIHRoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHZhciBwTmFtZSA9IHBbJ25hbWUnXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZXNbcE5hbWUgKyBzdWZmaXhdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXN1YlZhbCkgc3ViVmFsID0ge307XG4gICAgICAgICAgICAgICAgc3ViVmFsW3BOYW1lXSA9IHZhbHVlc1twTmFtZSArIHN1ZmZpeF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3ViVmFsIHx8IGZhbHNlO1xuICAgIH0sXG5cbiAgICBpbmRleGVkVmFsdWVzOiBmdW5jdGlvbiBpbmRleGVkVmFsdWVzKHJvd3NBcnJheSkge1xuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgdmFsdWVzID0ge307XG4gICAgICAgIHJvd3NBcnJheS5tYXAoZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgdmFyIHN1ZmZpeCA9IGluZGV4ID09IDAgPyAnJyA6ICdfJyArIGluZGV4O1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiByb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJvdy5oYXNPd25Qcm9wZXJ0eShwKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgdmFsdWVzW3AgKyBzdWZmaXhdID0gcm93W3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfSxcblxuICAgIGluZGV4VmFsdWVzOiBmdW5jdGlvbiBpbmRleFZhbHVlcyhyb3dzQXJyYXksIHJlbW92ZUxhc3RSb3cpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgaW5kZXhlZCA9IHRoaXMuaW5kZXhlZFZhbHVlcyhyb3dzQXJyYXkpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgaWYgKHJlbW92ZUxhc3RSb3cpIHtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFJvdyA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluZGV4ID0gcm93c0FycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLnBhcmFtZXRlcnMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Um93W3BbJ25hbWUnXSArIChuZXh0SW5kZXggPiAwID8gJ18nICsgbmV4dEluZGV4IDogJycpXSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMucHJvcHMub25DaGFuZ2UoaW5kZXhlZCwgdHJ1ZSwgbGFzdFJvdyk7XG4gICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShpbmRleGVkLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpbnN0YW5jZXM6IGZ1bmN0aW9uIGluc3RhbmNlcygpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgLy8gQW5hbHl6ZSBjdXJyZW50IHZhbHVlIHRvIGdyYWIgbnVtYmVyIG9mIHJvd3MuXG4gICAgICAgIHZhciByb3dzID0gW10sXG4gICAgICAgICAgICBzdWJWYWwgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIHdoaWxlIChzdWJWYWwgPSB0aGlzLmJ1aWxkU3ViVmFsdWUodGhpcy5wcm9wcy52YWx1ZXMsIGluZGV4KSkge1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIHJvd3MucHVzaChzdWJWYWwpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmaXJzdFBhcmFtID0gdGhpcy5wcm9wcy5wYXJhbWV0ZXJzWzBdO1xuICAgICAgICBpZiAoIXJvd3MubGVuZ3RoICYmIGZpcnN0UGFyYW1bJ3JlcGxpY2F0aW9uTWFuZGF0b3J5J10gPT09ICd0cnVlJykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW1wdHlWYWx1ZSA9IHt9O1xuICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5wYXJhbWV0ZXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICBlbXB0eVZhbHVlW3BbJ25hbWUnXV0gPSBwWydkZWZhdWx0J10gfHwgJyc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcm93cy5wdXNoKGVtcHR5VmFsdWUpO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93cztcbiAgICB9LFxuXG4gICAgYWRkUm93OiBmdW5jdGlvbiBhZGRSb3coKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHt9LFxuICAgICAgICAgICAgY3VycmVudFZhbHVlcyA9IHRoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgIHRoaXMucHJvcHMucGFyYW1ldGVycy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlW3BbJ25hbWUnXV0gPSBwWydkZWZhdWx0J10gfHwgJyc7XG4gICAgICAgIH0pO1xuICAgICAgICBjdXJyZW50VmFsdWVzLnB1c2gobmV3VmFsdWUpO1xuICAgICAgICB0aGlzLmluZGV4VmFsdWVzKGN1cnJlbnRWYWx1ZXMpO1xuICAgIH0sXG5cbiAgICByZW1vdmVSb3c6IGZ1bmN0aW9uIHJlbW92ZVJvdyhpbmRleCkge1xuICAgICAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgdmFyIHJlbW92ZUluc3QgPSBpbnN0YW5jZXNbaW5kZXhdO1xuICAgICAgICBpbnN0YW5jZXMgPSBMYW5nVXRpbHMuYXJyYXlXaXRob3V0KHRoaXMuaW5zdGFuY2VzKCksIGluZGV4KTtcbiAgICAgICAgaW5zdGFuY2VzLnB1c2gocmVtb3ZlSW5zdCk7XG4gICAgICAgIHRoaXMuaW5kZXhWYWx1ZXMoaW5zdGFuY2VzLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgc3dhcFJvd3M6IGZ1bmN0aW9uIHN3YXBSb3dzKGksIGopIHtcbiAgICAgICAgdmFyIGluc3RhbmNlcyA9IHRoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgIHZhciB0bXAgPSBpbnN0YW5jZXNbal07XG4gICAgICAgIGluc3RhbmNlc1tqXSA9IGluc3RhbmNlc1tpXTtcbiAgICAgICAgaW5zdGFuY2VzW2ldID0gdG1wO1xuICAgICAgICB0aGlzLmluZGV4VmFsdWVzKGluc3RhbmNlcyk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZShpbmRleCwgbmV3VmFsdWVzLCBkaXJ0eSkge1xuICAgICAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgaW5zdGFuY2VzW2luZGV4XSA9IG5ld1ZhbHVlcztcbiAgICAgICAgdGhpcy5pbmRleFZhbHVlcyhpbnN0YW5jZXMpO1xuICAgIH0sXG5cbiAgICBvblBhcmFtZXRlckNoYW5nZTogZnVuY3Rpb24gb25QYXJhbWV0ZXJDaGFuZ2UoaW5kZXgsIHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZXMgPSB0aGlzLmluc3RhbmNlcygpO1xuICAgICAgICBpbnN0YW5jZXNbaW5kZXhdW3BhcmFtTmFtZV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgdGhpcy5pbmRleFZhbHVlcyhpbnN0YW5jZXMpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBwYXJhbWV0ZXJzID0gX3Byb3BzLnBhcmFtZXRlcnM7XG4gICAgICAgIHZhciBkaXNhYmxlZCA9IF9wcm9wcy5kaXNhYmxlZDtcblxuICAgICAgICB2YXIgZmlyc3RQYXJhbSA9IHBhcmFtZXRlcnNbMF07XG4gICAgICAgIHZhciByZXBsaWNhdGlvblRpdGxlID0gZmlyc3RQYXJhbVsncmVwbGljYXRpb25UaXRsZSddIHx8IGZpcnN0UGFyYW1bJ2xhYmVsJ107XG4gICAgICAgIHZhciByZXBsaWNhdGlvbkRlc2NyaXB0aW9uID0gZmlyc3RQYXJhbVsncmVwbGljYXRpb25EZXNjcmlwdGlvbiddIHx8IGZpcnN0UGFyYW1bJ2Rlc2NyaXB0aW9uJ107XG4gICAgICAgIHZhciByZXBsaWNhdGlvbk1hbmRhdG9yeSA9IGZpcnN0UGFyYW1bJ3JlcGxpY2F0aW9uTWFuZGF0b3J5J10gPT09ICd0cnVlJztcblxuICAgICAgICB2YXIgaW5zdGFuY2VzID0gdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgdmFyIG11bHRpcGxlUm93cyA9IGluc3RhbmNlcy5sZW5ndGggPiAxO1xuICAgICAgICB2YXIgbXVsdGlwbGVQYXJhbXMgPSBwYXJhbWV0ZXJzLmxlbmd0aCA+IDE7XG4gICAgICAgIHZhciByb3dzID0gaW5zdGFuY2VzLm1hcChmdW5jdGlvbiAoc3ViVmFsdWVzLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIG9uU3dhcFVwID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG9uU3dhcERvd24gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgb25SZW1vdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgb25QYXJhbWV0ZXJDaGFuZ2UgPSBmdW5jdGlvbiBvblBhcmFtZXRlckNoYW5nZShwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMy5vblBhcmFtZXRlckNoYW5nZShpbmRleCwgcGFyYW1OYW1lLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChtdWx0aXBsZVJvd3MgJiYgaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgb25Td2FwVXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5zd2FwUm93cyhpbmRleCwgaW5kZXggLSAxKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG11bHRpcGxlUm93cyAmJiBpbmRleCA8IGluc3RhbmNlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgb25Td2FwRG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnN3YXBSb3dzKGluZGV4LCBpbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobXVsdGlwbGVSb3dzIHx8ICFyZXBsaWNhdGlvbk1hbmRhdG9yeSkge1xuICAgICAgICAgICAgICAgIG9uUmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMucmVtb3ZlUm93KGluZGV4KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHByb3BzID0geyBvblN3YXBVcDogb25Td2FwVXAsIG9uU3dhcERvd246IG9uU3dhcERvd24sIG9uUmVtb3ZlOiBvblJlbW92ZSwgb25QYXJhbWV0ZXJDaGFuZ2U6IG9uUGFyYW1ldGVyQ2hhbmdlIH07XG4gICAgICAgICAgICBpZiAocmVwbGljYXRpb25NYW5kYXRvcnkgJiYgaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICBwcm9wcy5vbkFkZFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLmFkZFJvdygpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChfUmVwbGljYXRlZEdyb3VwMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7IGtleTogaW5kZXggfSwgX3RoaXMzLnByb3BzLCBwcm9wcywgeyBzdWJWYWx1ZXM6IHN1YlZhbHVlcyB9KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZXBsaWNhdGlvbk1hbmRhdG9yeSkge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdyZXBsaWNhYmxlLWZpZWxkJywgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxNCB9IH0sXG4gICAgICAgICAgICAgICAgcm93c1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0U3R5bGUgPSByb3dzLmxlbmd0aCA/IHt9IDogeyBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZXNtb2tlJywgYm9yZGVyUmFkaXVzOiA0IH07XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3JlcGxpY2FibGUtZmllbGQnLCBzdHlsZTogeyBtYXJnaW5Cb3R0b206IDE0IH0gfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0sIHRTdHlsZSkgfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEljb25CdXR0b24sIHsga2V5OiAnYWRkJywgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktcGx1cy1ib3gtb3V0bGluZScsIHRvb2x0aXBQb3NpdGlvbjogXCJ0b3AtcmlnaHRcIiwgc3R5bGU6IHsgaGVpZ2h0OiAzNiwgd2lkdGg6IDM2LCBwYWRkaW5nOiA2IH0sIGljb25TdHlsZTogeyBmb250U2l6ZTogMjQgfSwgdG9vbHRpcDogJ0FkZCB2YWx1ZScsIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczMuYWRkUm93KCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGRpc2FibGVkOiBkaXNhYmxlZCB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICd0aXRsZScsIHN0eWxlOiB7IGZvbnRTaXplOiAxNiwgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcGxpY2F0aW9uVGl0bGVcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgcm93c1xuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiJdfQ==

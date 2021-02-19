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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _managerManager = require('../manager/Manager');

var _managerManager2 = _interopRequireDefault(_managerManager);

var React = require('react');

var _require$requireLib = require('pydio').requireLib('boot');

var AsyncComponent = _require$requireLib.AsyncComponent;

/**
 * Display a form companion linked to a given input.
 * Props: helperData : contains the pluginId and the whole paramAttributes
 */

var _default = (function (_React$Component) {
    _inherits(_default, _React$Component);

    function _default() {
        var _this = this;

        _classCallCheck(this, _default);

        _React$Component.apply(this, arguments);

        this.closeHelper = function () {
            _this.props.close();
        };
    }

    _default.prototype.render = function render() {
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
    };

    _createClass(_default, null, [{
        key: 'propTypes',
        value: {
            helperData: _propTypes2['default'].object,
            close: _propTypes2['default'].func.isRequired
        },
        enumerable: true
    }]);

    return _default;
})(React.Component);

exports['default'] = _default;
module.exports = exports['default'];

},{"../manager/Manager":15,"prop-types":"prop-types","pydio":"pydio","react":"react"}],17:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _GroupSwitchPanel = require('./GroupSwitchPanel');

var _GroupSwitchPanel2 = _interopRequireDefault(_GroupSwitchPanel);

var _ReplicationPanel = require('./ReplicationPanel');

var _ReplicationPanel2 = _interopRequireDefault(_ReplicationPanel);

var _managerManager = require('../manager/Manager');

var _managerManager2 = _interopRequireDefault(_managerManager);

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
exports['default'] = _createReactClass2['default']({
    displayName: 'FormPanel',
    _hiddenValues: {},
    _internalValid: null,
    _parametersMetadata: null,

    propTypes: {
        /**
         * Array of Pydio StandardForm parameters
         */
        parameters: _propTypes2['default'].array.isRequired,
        /**
         * Object containing values for the parameters
         */
        values: _propTypes2['default'].object,
        /**
         * Trigger unitary function when one form input changes.
         */
        onParameterChange: _propTypes2['default'].func,
        /**
         * Send all form values onchange, including eventually the removed ones (for dynamic panels)
         */
        onChange: _propTypes2['default'].func,
        /**
         * Triggered when the form globabally switches between valid and invalid state
         * Triggered once at form construction
         */
        onValidStatusChange: _propTypes2['default'].func,
        /**
         * Disable the whole form at once
         */
        disabled: _propTypes2['default'].bool,
        /**
         * String added to the image inputs for upload/download operations
         */
        binary_context: _propTypes2['default'].string,
        /**
         * 0 by default, subforms will have their zDepth value increased by one
         */
        depth: _propTypes2['default'].number,

        /**
         * Add an additional header component (added inside first subpanel)
         */
        header: _propTypes2['default'].object,
        /**
         * Add an additional footer component (added inside last subpanel)
         */
        footer: _propTypes2['default'].object,
        /**
         * Add other arbitrary panels, either at the top or the bottom
         */
        additionalPanes: _propTypes2['default'].shape({
            top: _propTypes2['default'].array,
            bottom: _propTypes2['default'].array
        }),
        /**
         * An array of tabs containing groupNames. Groups will be splitted
         * accross those tabs
         */
        tabs: _propTypes2['default'].array,
        /**
         * Fired when a the active tab changes
         */
        onTabChange: _propTypes2['default'].func,
        /**
         * A bit like tabs, but using accordion-like layout
         */
        accordionizeIfGroupsMoreThan: _propTypes2['default'].number,
        /**
         * Forward an event when scrolling the form
         */
        onScrollCallback: _propTypes2['default'].func,
        /**
         * Restrict to a subset of field groups
         */
        limitToGroups: _propTypes2['default'].array,
        /**
         * Ignore some specific fields types
         */
        skipFieldsTypes: _propTypes2['default'].array,

        /* Helper Options */
        /**
         * Pass pointers to the Pydio Companion container
         */
        setHelperData: _propTypes2['default'].func,
        /**
         * Function to check if the companion is active or none and if a parameter
         * has helper data
         */
        checkHasHelper: _propTypes2['default'].func,
        /**
         * Test for parameter
         */
        helperTestFor: _propTypes2['default'].string

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

},{"../manager/Manager":15,"./GroupSwitchPanel":18,"./ReplicationPanel":20,"create-react-class":"create-react-class","material-ui":"material-ui","prop-types":"prop-types","pydio/util/lang":"pydio/util/lang","react":"react"}],18:[function(require,module,exports){
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _FormPanel = require('./FormPanel');

var _FormPanel2 = _interopRequireDefault(_FormPanel);

var _fieldsInputSelectBox = require('../fields/InputSelectBox');

var _fieldsInputSelectBox2 = _interopRequireDefault(_fieldsInputSelectBox);

var React = require('react');

var PropTypes = require('prop-types');
var LangUtils = require('pydio/util/lang');

/**
 * Sub form with a selector, switching its fields depending
 * on the selector value.
 */

var _default = (function (_React$Component) {
    _inherits(_default, _React$Component);

    function _default() {
        var _this = this;

        _classCallCheck(this, _default);

        _React$Component.apply(this, arguments);

        this.computeSubPanelParameters = function () {

            // CREATE SUB FORM PANEL
            // Get all values
            var switchName = _this.props.paramAttributes['type'].split(":").pop();
            var parentName = _this.props.paramAttributes['name'];
            var switchValues = {},
                potentialSubSwitches = [];

            _this.props.parameters.map((function (p) {
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
            }).bind(_this));
            // Remerge potentialSubSwitches to each parameters set
            for (var k in switchValues) {
                if (switchValues.hasOwnProperty(k)) {
                    var sv = switchValues[k];
                    sv.fields = sv.fields.concat(potentialSubSwitches);
                }
            }

            return switchValues;
        };

        this.clearSubParametersValues = function (parentName, newValue, newFields) {
            var vals = LangUtils.deepCopy(_this.props.values);
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
            _this.props.onChange(vals, true, toRemove);
            //this.onParameterChange(parentName, newValue);
        };

        this.onChange = function (newValues, dirty, removeValues) {
            _this.props.onChange(newValues, true, removeValues);
        };
    }

    _default.prototype.render = function render() {
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
    };

    _createClass(_default, null, [{
        key: 'propTypes',
        value: {
            paramAttributes: PropTypes.object.isRequired,
            parameters: PropTypes.array.isRequired,
            values: PropTypes.object.isRequired,
            onChange: PropTypes.func.isRequired
        },
        enumerable: true
    }]);

    return _default;
})(React.Component);

exports['default'] = _default;
module.exports = exports['default'];

},{"../fields/InputSelectBox":8,"./FormPanel":17,"prop-types":"prop-types","pydio/util/lang":"pydio/util/lang","react":"react"}],19:[function(require,module,exports){
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ReplicatedGroup = require('./ReplicatedGroup');

var _ReplicatedGroup2 = _interopRequireDefault(_ReplicatedGroup);

var React = require('react');

var _require = require('material-ui');

var IconButton = _require.IconButton;

var PropTypes = require('prop-types');
var LangUtils = require('pydio/util/lang');

/**
 * Sub form replicating itself (+/-)
 */

var _default = (function (_React$Component) {
    _inherits(_default, _React$Component);

    function _default() {
        var _this = this;

        _classCallCheck(this, _default);

        _React$Component.apply(this, arguments);

        this.buildSubValue = function (values) {
            var index = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

            var subVal = undefined;
            var suffix = index == 0 ? '' : '_' + index;
            _this.props.parameters.map(function (p) {
                var pName = p['name'];
                if (values[pName + suffix] !== undefined) {
                    if (!subVal) subVal = {};
                    subVal[pName] = values[pName + suffix];
                }
            });
            return subVal || false;
        };

        this.indexedValues = function (rowsArray) {
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
        };

        this.indexValues = function (rowsArray, removeLastRow) {
            var indexed = _this.indexedValues(rowsArray);
            if (_this.props.onChange) {
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
                    _this.props.onChange(indexed, true);
                }
            }
        };

        this.instances = function () {
            // Analyze current value to grab number of rows.
            var rows = [],
                subVal = undefined,
                index = 0;
            while (subVal = _this.buildSubValue(_this.props.values, index)) {
                index++;
                rows.push(subVal);
            }
            var firstParam = _this.props.parameters[0];
            if (!rows.length && firstParam['replicationMandatory'] === 'true') {
                (function () {
                    var emptyValue = {};
                    _this.props.parameters.map(function (p) {
                        emptyValue[p['name']] = p['default'] || '';
                    });
                    rows.push(emptyValue);
                })();
            }
            return rows;
        };

        this.addRow = function () {
            var newValue = {},
                currentValues = _this.instances();
            _this.props.parameters.map(function (p) {
                newValue[p['name']] = p['default'] || '';
            });
            currentValues.push(newValue);
            _this.indexValues(currentValues);
        };

        this.removeRow = function (index) {
            var instances = _this.instances();
            var removeInst = instances[index];
            instances = LangUtils.arrayWithout(_this.instances(), index);
            instances.push(removeInst);
            _this.indexValues(instances, true);
        };

        this.swapRows = function (i, j) {
            var instances = _this.instances();
            var tmp = instances[j];
            instances[j] = instances[i];
            instances[i] = tmp;
            _this.indexValues(instances);
        };

        this.onChange = function (index, newValues, dirty) {
            var instances = _this.instances();
            instances[index] = newValues;
            _this.indexValues(instances);
        };

        this.onParameterChange = function (index, paramName, newValue, oldValue) {
            var instances = _this.instances();
            instances[index][paramName] = newValue;
            _this.indexValues(instances);
        };
    }

    _default.prototype.render = function render() {
        var _this2 = this;

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
                _this2.onParameterChange(index, paramName, newValue, oldValue);
            };
            if (multipleRows && index > 0) {
                onSwapUp = function () {
                    _this2.swapRows(index, index - 1);
                };
            }
            if (multipleRows && index < instances.length - 1) {
                onSwapDown = function () {
                    _this2.swapRows(index, index + 1);
                };
            }
            if (multipleRows || !replicationMandatory) {
                onRemove = function () {
                    _this2.removeRow(index);
                };
            }
            var props = { onSwapUp: onSwapUp, onSwapDown: onSwapDown, onRemove: onRemove, onParameterChange: onParameterChange };
            if (replicationMandatory && index === 0) {
                props.onAddValue = function () {
                    return _this2.addRow();
                };
            }
            return React.createElement(_ReplicatedGroup2['default'], _extends({ key: index }, _this2.props, props, { subValues: subValues }));
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
                        return _this2.addRow();
                    }, disabled: disabled }),
                React.createElement(
                    'div',
                    { className: 'title', style: { fontSize: 16, flex: 1 } },
                    replicationTitle
                )
            ),
            rows
        );
    };

    _createClass(_default, null, [{
        key: 'propTypes',
        value: {
            parameters: PropTypes.array.isRequired,
            values: PropTypes.object,
            onChange: PropTypes.func,
            disabled: PropTypes.bool,
            binary_context: PropTypes.string,
            depth: PropTypes.number
        },
        enumerable: true
    }]);

    return _default;
})(React.Component);

exports['default'] = _default;
module.exports = exports['default'];

},{"./ReplicatedGroup":19,"material-ui":"material-ui","prop-types":"prop-types","pydio/util/lang":"pydio/util/lang","react":"react"}]},{},[14])(14)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvQWx0VGV4dC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9BdXRvY29tcGxldGVCb3guanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvQXV0b2NvbXBsZXRlVHJlZS5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9GaWxlRHJvcHpvbmUuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvSW5wdXRCb29sZWFuLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0SW1hZ2UuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9maWVsZHMvSW5wdXRJbnRlZ2VyLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL0lucHV0U2VsZWN0Qm94LmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL1RleHRGaWVsZC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL2ZpZWxkcy9WYWxpZExvZ2luLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vZmllbGRzL1ZhbGlkUGFzc3dvcmQuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9ob2MvYXNGb3JtRmllbGQuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9ob2Mvd2l0aENob2ljZXMuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9pbmRleC5qcyIsInJlcy9idWlsZC91aS9Gb3JtL21hbmFnZXIvTWFuYWdlci5qcyIsInJlcy9idWlsZC91aS9Gb3JtL3BhbmVsL0Zvcm1IZWxwZXIuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9Gb3JtUGFuZWwuanMiLCJyZXMvYnVpbGQvdWkvRm9ybS9wYW5lbC9Hcm91cFN3aXRjaFBhbmVsLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vcGFuZWwvUmVwbGljYXRlZEdyb3VwLmpzIiwicmVzL2J1aWxkL3VpL0Zvcm0vcGFuZWwvUmVwbGljYXRpb25QYW5lbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9SQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25aQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbm5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoXCJtYXRlcmlhbC11aVwiKTtcblxudmFyIF9UZXh0RmllbGQgPSByZXF1aXJlKFwiLi9UZXh0RmllbGRcIik7XG5cbnZhciBfVGV4dEZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RleHRGaWVsZCk7XG5cbnZhciBBbHRUZXh0ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEFsdFRleHQsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQWx0VGV4dCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEFsdFRleHQpO1xuXG4gICAgICAgIF9SZWFjdCRDb21wb25lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBBbHRUZXh0LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IF9wcm9wcy5hdHRyaWJ1dGVzO1xuICAgICAgICB2YXIgX3Byb3BzJGFsdEljb24gPSBfcHJvcHMuYWx0SWNvbjtcbiAgICAgICAgdmFyIGFsdEljb24gPSBfcHJvcHMkYWx0SWNvbiA9PT0gdW5kZWZpbmVkID8gXCJtZGkgbWRpLXRvZ2dsZS1zd2l0Y2hcIiA6IF9wcm9wcyRhbHRJY29uO1xuICAgICAgICB2YXIgX3Byb3BzJGFsdEljb25UZXh0ID0gX3Byb3BzLmFsdEljb25UZXh0O1xuICAgICAgICB2YXIgYWx0SWNvblRleHQgPSBfcHJvcHMkYWx0SWNvblRleHQgPT09IHVuZGVmaW5lZCA/IFwibWRpIG1kaS10ZXh0Ym94XCIgOiBfcHJvcHMkYWx0SWNvblRleHQ7XG4gICAgICAgIHZhciBfcHJvcHMkYWx0VGlwID0gX3Byb3BzLmFsdFRpcDtcbiAgICAgICAgdmFyIGFsdFRpcCA9IF9wcm9wcyRhbHRUaXAgPT09IHVuZGVmaW5lZCA/IFwiU3dpdGNoIHRvIHRleHQgdmVyc2lvblwiIDogX3Byb3BzJGFsdFRpcDtcbiAgICAgICAgdmFyIG9uQWx0VGV4dFN3aXRjaCA9IF9wcm9wcy5vbkFsdFRleHRTd2l0Y2g7XG5cbiAgICAgICAgdmFyIGNvbXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBhbHRlcm5hdGl2ZVRleHQgPSBhdHRyaWJ1dGVzLmFsdGVybmF0aXZlVGV4dDtcblxuICAgICAgICBpZiAoYWx0ZXJuYXRpdmVUZXh0KSB7XG4gICAgICAgICAgICBjb21wID0gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfVGV4dEZpZWxkMltcImRlZmF1bHRcIl0sIHRoaXMucHJvcHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcCA9IHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgY29tcFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lOiBhbHRlcm5hdGl2ZVRleHQgPyBhbHRJY29uIDogYWx0SWNvblRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBhbHRUaXAsXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbkFsdFRleHRTd2l0Y2goYXR0cmlidXRlc1tcIm5hbWVcIl0sICFhbHRlcm5hdGl2ZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uU3R5bGU6IHsgb3BhY2l0eTogLjMsIGZvbnRTaXplOiAyMCB9LFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBwYWRkaW5nOiAnMTRweCA4cHgnLCB3aWR0aDogNDIsIGhlaWdodDogNDIgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHJldHVybiBBbHRUZXh0O1xufSkoX3JlYWN0MltcImRlZmF1bHRcIl0uQ29tcG9uZW50KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBBbHRUZXh0O1xuXG52YXIgdGVzdCA9IGZ1bmN0aW9uIHRlc3QoQ29tcG9uZW50KSB7XG4gICAgdmFyIHdyYXBwZWQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgICAgIF9pbmhlcml0cyh3cmFwcGVkLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICAgICAgZnVuY3Rpb24gd3JhcHBlZCgpIHtcbiAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCB3cmFwcGVkKTtcblxuICAgICAgICAgICAgX1JlYWN0JENvbXBvbmVudDIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyYXBwZWQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBhdHRyaWJ1dGVzID0gX3Byb3BzMi5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgdmFyIF9wcm9wczIkYWx0SWNvbiA9IF9wcm9wczIuYWx0SWNvbjtcbiAgICAgICAgICAgIHZhciBhbHRJY29uID0gX3Byb3BzMiRhbHRJY29uID09PSB1bmRlZmluZWQgPyBcIm1kaSBtZGktdG9nZ2xlLXN3aXRjaFwiIDogX3Byb3BzMiRhbHRJY29uO1xuICAgICAgICAgICAgdmFyIF9wcm9wczIkYWx0SWNvblRleHQgPSBfcHJvcHMyLmFsdEljb25UZXh0O1xuICAgICAgICAgICAgdmFyIGFsdEljb25UZXh0ID0gX3Byb3BzMiRhbHRJY29uVGV4dCA9PT0gdW5kZWZpbmVkID8gXCJtZGkgbWRpLXRleHRib3hcIiA6IF9wcm9wczIkYWx0SWNvblRleHQ7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiRhbHRUaXAgPSBfcHJvcHMyLmFsdFRpcDtcbiAgICAgICAgICAgIHZhciBhbHRUaXAgPSBfcHJvcHMyJGFsdFRpcCA9PT0gdW5kZWZpbmVkID8gXCJTd2l0Y2hcIiA6IF9wcm9wczIkYWx0VGlwO1xuICAgICAgICAgICAgdmFyIG9uQWx0VGV4dFN3aXRjaCA9IF9wcm9wczIub25BbHRUZXh0U3dpdGNoO1xuXG4gICAgICAgICAgICB2YXIgY29tcCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBhbHRlcm5hdGl2ZVRleHQgPSBhdHRyaWJ1dGVzLmFsdGVybmF0aXZlVGV4dDtcblxuICAgICAgICAgICAgaWYgKGFsdGVybmF0aXZlVGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbXAgPSBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9UZXh0RmllbGQyW1wiZGVmYXVsdFwiXSwgdGhpcy5wcm9wcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXAgPSBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KENvbXBvbmVudCwgdGhpcy5wcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6IGFsdGVybmF0aXZlVGV4dCA/IGFsdEljb24gOiBhbHRJY29uVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA6IGFsdFRpcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb25BbHRUZXh0U3dpdGNoKGF0dHJpYnV0ZXNbXCJuYW1lXCJdLCAhYWx0ZXJuYXRpdmVUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB3cmFwcGVkO1xuICAgIH0pKF9yZWFjdDJbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbiAgICByZXR1cm4gd3JhcHBlZDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZCA9IHJlcXVpcmUoXCIuLi9ob2MvYXNGb3JtRmllbGRcIik7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaG9jQXNGb3JtRmllbGQpO1xuXG52YXIgX2hvY1dpdGhDaG9pY2VzID0gcmVxdWlyZSgnLi4vaG9jL3dpdGhDaG9pY2VzJyk7XG5cbnZhciBfaG9jV2l0aENob2ljZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaG9jV2l0aENob2ljZXMpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgQXV0b0NvbXBsZXRlID0gX3JlcXVpcmUuQXV0b0NvbXBsZXRlO1xudmFyIE1lbnVJdGVtID0gX3JlcXVpcmUuTWVudUl0ZW07XG52YXIgUmVmcmVzaEluZGljYXRvciA9IF9yZXF1aXJlLlJlZnJlc2hJbmRpY2F0b3I7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblN0eWxlcyA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblN0eWxlcztcblxudmFyIEF1dG9jb21wbGV0ZUJveCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhBdXRvY29tcGxldGVCb3gsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlQm94KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQXV0b2NvbXBsZXRlQm94KTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgQXV0b2NvbXBsZXRlQm94LnByb3RvdHlwZS5oYW5kbGVVcGRhdGVJbnB1dCA9IGZ1bmN0aW9uIGhhbmRsZVVwZGF0ZUlucHV0KHNlYXJjaFRleHQpIHtcbiAgICAgICAgLy90aGlzLnNldFN0YXRlKHtzZWFyY2hUZXh0OiBzZWFyY2hUZXh0fSk7XG4gICAgfTtcblxuICAgIEF1dG9jb21wbGV0ZUJveC5wcm90b3R5cGUuaGFuZGxlTmV3UmVxdWVzdCA9IGZ1bmN0aW9uIGhhbmRsZU5ld1JlcXVlc3QoY2hvc2VuVmFsdWUpIHtcbiAgICAgICAgaWYgKGNob3NlblZhbHVlLmtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG51bGwsIGNob3NlblZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobnVsbCwgY2hvc2VuVmFsdWUua2V5KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGVCb3gucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGNob2ljZXMgPSBfcHJvcHMuY2hvaWNlcztcbiAgICAgICAgdmFyIGlzRGlzcGxheUdyaWQgPSBfcHJvcHMuaXNEaXNwbGF5R3JpZDtcbiAgICAgICAgdmFyIGVkaXRNb2RlID0gX3Byb3BzLmVkaXRNb2RlO1xuICAgICAgICB2YXIgZGlzYWJsZWQgPSBfcHJvcHMuZGlzYWJsZWQ7XG4gICAgICAgIHZhciB0b2dnbGVFZGl0TW9kZSA9IF9wcm9wcy50b2dnbGVFZGl0TW9kZTtcblxuICAgICAgICB2YXIgZGF0YVNvdXJjZSA9IFtdO1xuICAgICAgICB2YXIgbGFiZWxzID0ge307XG4gICAgICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBrZXkpIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICAgICAgdGV4dDogY2hvaWNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBNZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsYWJlbHNba2V5XSA9IGNob2ljZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTtcblxuICAgICAgICBpZiAobGFiZWxzICYmIGxhYmVsc1t2YWx1ZV0pIHtcbiAgICAgICAgICAgIHZhbHVlID0gbGFiZWxzW3ZhbHVlXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0Rpc3BsYXlHcmlkKCkgJiYgIWVkaXRNb2RlIHx8IGRpc2FibGVkKSB7XG4gICAgICAgICAgICBpZiAoY2hvaWNlcy5nZXQodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjaG9pY2VzLmdldCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGRpc2FibGVkID8gZnVuY3Rpb24gKCkge30gOiB0b2dnbGVFZGl0TW9kZSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiB2YWx1ZSA/ICcnIDogJ3BhcmFtVmFsdWUtZW1wdHknIH0sXG4gICAgICAgICAgICAgICAgdmFsdWUgPyB2YWx1ZSA6ICdFbXB0eScsXG4gICAgICAgICAgICAgICAgJyDCoMKgJyxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdpY29uLWNhcmV0LWRvd24nIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncHlkaW9mb3JtX2F1dG9jb21wbGV0ZScsIHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnIH0gfSxcbiAgICAgICAgICAgICFkYXRhU291cmNlLmxlbmd0aCAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlZnJlc2hJbmRpY2F0b3IsIHtcbiAgICAgICAgICAgICAgICBzaXplOiAzMCxcbiAgICAgICAgICAgICAgICByaWdodDogMTAsXG4gICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ2xvYWRpbmcnXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGRhdGFTb3VyY2UubGVuZ3RoICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXV0b0NvbXBsZXRlLCBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNlYXJjaFRleHQ6IHZhbHVlLFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlSW5wdXQ6IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5oYW5kbGVVcGRhdGVJbnB1dChzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uTmV3UmVxdWVzdDogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmhhbmRsZU5ld1JlcXVlc3Qodik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlOiBkYXRhU291cmNlLFxuICAgICAgICAgICAgICAgIGhpbnRUZXh0OiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2xhYmVsJ10sXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmdW5jdGlvbiAoc2VhcmNoVGV4dCwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgha2V5IHx8ICFzZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKSA9PT0gMDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wZW5PbkZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1lbnVQcm9wczogeyBtYXhIZWlnaHQ6IDIwMCB9XG4gICAgICAgICAgICB9LCBNb2Rlcm5TdHlsZXMudGV4dEZpZWxkKSlcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEF1dG9jb21wbGV0ZUJveDtcbn0pKFJlYWN0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEF1dG9jb21wbGV0ZUJveCA9IF9ob2NBc0Zvcm1GaWVsZDJbJ2RlZmF1bHQnXShBdXRvY29tcGxldGVCb3gpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gQXV0b2NvbXBsZXRlQm94ID0gX2hvY1dpdGhDaG9pY2VzMlsnZGVmYXVsdCddKEF1dG9jb21wbGV0ZUJveCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBBdXRvY29tcGxldGVCb3g7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX2hvY0FzRm9ybUZpZWxkID0gcmVxdWlyZShcIi4uL2hvYy9hc0Zvcm1GaWVsZFwiKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ob2NBc0Zvcm1GaWVsZCk7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC5kZWJvdW5jZScpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgQXV0b0NvbXBsZXRlID0gX3JlcXVpcmUuQXV0b0NvbXBsZXRlO1xudmFyIE1lbnVJdGVtID0gX3JlcXVpcmUuTWVudUl0ZW07XG52YXIgUmVmcmVzaEluZGljYXRvciA9IF9yZXF1aXJlLlJlZnJlc2hJbmRpY2F0b3I7XG52YXIgRm9udEljb24gPSBfcmVxdWlyZS5Gb250SWNvbjtcblxudmFyIEF1dG9jb21wbGV0ZVRyZWUgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQXV0b2NvbXBsZXRlVHJlZSwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBBdXRvY29tcGxldGVUcmVlKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQXV0b2NvbXBsZXRlVHJlZSk7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIEF1dG9jb21wbGV0ZVRyZWUucHJvdG90eXBlLmhhbmRsZVVwZGF0ZUlucHV0ID0gZnVuY3Rpb24gaGFuZGxlVXBkYXRlSW5wdXQoc2VhcmNoVGV4dCkge1xuICAgICAgICB0aGlzLmRlYm91bmNlZCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VhcmNoVGV4dDogc2VhcmNoVGV4dCB9KTtcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlVHJlZS5wcm90b3R5cGUuaGFuZGxlTmV3UmVxdWVzdCA9IGZ1bmN0aW9uIGhhbmRsZU5ld1JlcXVlc3QoY2hvc2VuVmFsdWUpIHtcbiAgICAgICAgdmFyIGtleSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGNob3NlblZhbHVlLmtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBrZXkgPSBjaG9zZW5WYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleSA9IGNob3NlblZhbHVlLmtleTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG51bGwsIGtleSk7XG4gICAgICAgIHRoaXMubG9hZFZhbHVlcyhrZXkpO1xuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGVUcmVlLnByb3RvdHlwZS5jb21wb25lbnRXaWxsTW91bnQgPSBmdW5jdGlvbiBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGVib3VuY2VkID0gZGVib3VuY2UodGhpcy5sb2FkVmFsdWVzLmJpbmQodGhpcyksIDMwMCk7XG4gICAgICAgIHRoaXMubGFzdFNlYXJjaCA9IG51bGw7XG4gICAgICAgIHZhciB2YWx1ZSA9IFwiXCI7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkVmFsdWVzKHZhbHVlKTtcbiAgICB9O1xuXG4gICAgQXV0b2NvbXBsZXRlVHJlZS5wcm90b3R5cGUubG9hZFZhbHVlcyA9IGZ1bmN0aW9uIGxvYWRWYWx1ZXMoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgdmFyIGJhc2VQYXRoID0gdmFsdWU7XG4gICAgICAgIGlmICghdmFsdWUgJiYgdGhpcy5zdGF0ZS5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICB2YXIgbGFzdCA9IHRoaXMuc3RhdGUuc2VhcmNoVGV4dC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLnN0YXRlLnNlYXJjaFRleHQuc3Vic3RyKDAsIGxhc3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxhc3RTZWFyY2ggIT09IG51bGwgJiYgdGhpcy5sYXN0U2VhcmNoID09PSBiYXNlUGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdFNlYXJjaCA9IGJhc2VQYXRoO1xuICAgICAgICAvLyBUT0RPIDogbG9hZCB2YWx1ZXMgZnJvbSBzZXJ2aWNlXG4gICAgfTtcblxuICAgIEF1dG9jb21wbGV0ZVRyZWUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICB2YXIgZGF0YVNvdXJjZSA9IFtdO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLm5vZGVzKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLm5vZGVzLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgaWNvbiA9IFwibWRpIG1kaS1mb2xkZXJcIjtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS51dWlkLnN0YXJ0c1dpdGgoXCJEQVRBU09VUkNFOlwiKSkge1xuICAgICAgICAgICAgICAgICAgICBpY29uID0gXCJtZGkgbWRpLWRhdGFiYXNlXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2UucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogbm9kZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBub2RlLnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgTWVudUl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChGb250SWNvbiwgeyBjbGFzc05hbWU6IGljb24sIGNvbG9yOiAnIzYxNjE2MScsIHN0eWxlOiB7IGZsb2F0OiAnbGVmdCcsIG1hcmdpblJpZ2h0OiA4IH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnBhdGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGlzcGxheVRleHQgPSB0aGlzLnN0YXRlLnZhbHVlO1xuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3B5ZGlvZm9ybV9hdXRvY29tcGxldGUnLCBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9IH0sXG4gICAgICAgICAgICAhZGF0YVNvdXJjZS5sZW5ndGggJiYgUmVhY3QuY3JlYXRlRWxlbWVudChSZWZyZXNoSW5kaWNhdG9yLCB7XG4gICAgICAgICAgICAgICAgc2l6ZTogMzAsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IDEwLFxuICAgICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdsb2FkaW5nJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEF1dG9Db21wbGV0ZSwge1xuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzZWFyY2hUZXh0OiBkaXNwbGF5VGV4dCxcbiAgICAgICAgICAgICAgICBvblVwZGF0ZUlucHV0OiB0aGlzLmhhbmRsZVVwZGF0ZUlucHV0LmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25OZXdSZXF1ZXN0OiB0aGlzLmhhbmRsZU5ld1JlcXVlc3QuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlOiBkYXRhU291cmNlLFxuICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2xhYmVsJ10sXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBmdW5jdGlvbiAoc2VhcmNoVGV4dCwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrZXkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKSkgPT09IDA7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvcGVuT25Gb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtZW51UHJvcHM6IHsgbWF4SGVpZ2h0OiAyMDAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEF1dG9jb21wbGV0ZVRyZWU7XG59KShSZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBfaG9jQXNGb3JtRmllbGQyWydkZWZhdWx0J10oQXV0b2NvbXBsZXRlVHJlZSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG4vKipcbiAqIFVJIHRvIGRyb3AgYSBmaWxlIChvciBjbGljayB0byBicm93c2UpLCB1c2VkIGJ5IHRoZSBJbnB1dEltYWdlIGNvbXBvbmVudC5cbiAqL1xuXG52YXIgRmlsZURyb3B6b25lID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEZpbGVEcm9wem9uZSwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBGaWxlRHJvcHpvbmUocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEZpbGVEcm9wem9uZSk7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5jYWxsKHRoaXMsIF9leHRlbmRzKHsgb25Ecm9wOiBmdW5jdGlvbiBvbkRyb3AoKSB7fSB9LCBwcm9wcykpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaXNEcmFnQWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHN1cHBvcnRDbGljazogcHJvcHMuc3VwcG9ydENsaWNrID09PSB1bmRlZmluZWQgPyB0cnVlIDogcHJvcHMuc3VwcG9ydENsaWNrLFxuICAgICAgICAgICAgbXVsdGlwbGU6IHByb3BzLm11bHRpcGxlID09PSB1bmRlZmluZWQgPyB0cnVlIDogcHJvcHMubXVsdGlwbGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBwcm9wVHlwZXM6IHtcbiAgICAvLyAgICAgb25Ecm9wICAgICAgICAgIDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvLyAgICAgaWdub3JlTmF0aXZlRHJvcDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgLy8gICAgIHNpemUgICAgICAgICAgICA6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgLy8gICAgIHN0eWxlICAgICAgICAgICA6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgLy8gICAgIGRyYWdBY3RpdmVTdHlsZSA6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgLy8gICAgIHN1cHBvcnRDbGljayAgICA6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgIC8vICAgICBhY2NlcHQgICAgICAgICAgOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8vICAgICBtdWx0aXBsZSAgICAgICAgOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuICAgIC8vIH0sXG5cbiAgICBGaWxlRHJvcHpvbmUucHJvdG90eXBlLm9uRHJhZ0xlYXZlID0gZnVuY3Rpb24gb25EcmFnTGVhdmUoZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzRHJhZ0FjdGl2ZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIEZpbGVEcm9wem9uZS5wcm90b3R5cGUub25EcmFnT3ZlciA9IGZ1bmN0aW9uIG9uRHJhZ092ZXIoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcImNvcHlcIjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzRHJhZ0FjdGl2ZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgRmlsZURyb3B6b25lLnByb3RvdHlwZS5vbkZpbGVQaWNrZWQgPSBmdW5jdGlvbiBvbkZpbGVQaWNrZWQoZSkge1xuICAgICAgICBpZiAoIWUudGFyZ2V0IHx8ICFlLnRhcmdldC5maWxlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmaWxlcyA9IGUudGFyZ2V0LmZpbGVzO1xuICAgICAgICB2YXIgbWF4RmlsZXMgPSB0aGlzLnN0YXRlLm11bHRpcGxlID8gZmlsZXMubGVuZ3RoIDogMTtcbiAgICAgICAgZmlsZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmaWxlcywgMCwgbWF4RmlsZXMpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkRyb3ApIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Ecm9wKGZpbGVzLCBlLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBGaWxlRHJvcHpvbmUucHJvdG90eXBlLm9uRm9sZGVyUGlja2VkID0gZnVuY3Rpb24gb25Gb2xkZXJQaWNrZWQoZSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZvbGRlclBpY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZvbGRlclBpY2tlZChlLnRhcmdldC5maWxlcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRmlsZURyb3B6b25lLnByb3RvdHlwZS5vbkRyb3AgPSBmdW5jdGlvbiBvbkRyb3AoZSkge1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNEcmFnQWN0aXZlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pZ25vcmVOYXRpdmVEcm9wKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZmlsZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChlLmRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgICAgZmlsZXMgPSBlLmRhdGFUcmFuc2Zlci5maWxlcztcbiAgICAgICAgfSBlbHNlIGlmIChlLnRhcmdldCkge1xuICAgICAgICAgICAgZmlsZXMgPSBlLnRhcmdldC5maWxlcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtYXhGaWxlcyA9IHRoaXMuc3RhdGUubXVsdGlwbGUgPyBmaWxlcy5sZW5ndGggOiAxO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1heEZpbGVzOyBpKyspIHtcbiAgICAgICAgICAgIGZpbGVzW2ldLnByZXZpZXcgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRHJvcCkge1xuICAgICAgICAgICAgZmlsZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmaWxlcywgMCwgbWF4RmlsZXMpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRyb3AoZmlsZXMsIGUsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEZpbGVEcm9wem9uZS5wcm90b3R5cGUub25DbGljayA9IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnN1cHBvcnRDbGljayA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgRmlsZURyb3B6b25lLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgdGhpcy5yZWZzLmZpbGVJbnB1dC5jbGljaygpO1xuICAgIH07XG5cbiAgICBGaWxlRHJvcHpvbmUucHJvdG90eXBlLm9wZW5Gb2xkZXJQaWNrZXIgPSBmdW5jdGlvbiBvcGVuRm9sZGVyUGlja2VyKCkge1xuICAgICAgICB0aGlzLnJlZnMuZm9sZGVySW5wdXQuc2V0QXR0cmlidXRlKFwid2Via2l0ZGlyZWN0b3J5XCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgdGhpcy5yZWZzLmZvbGRlcklucHV0LmNsaWNrKCk7XG4gICAgfTtcblxuICAgIEZpbGVEcm9wem9uZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBjbGFzc05hbWUgPSB0aGlzLnByb3BzLmNsYXNzTmFtZSB8fCAnZmlsZS1kcm9wem9uZSc7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzRHJhZ0FjdGl2ZSkge1xuICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgYWN0aXZlJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdHlsZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnNpemUgfHwgMTAwLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLnNpemUgfHwgMTAwXG4gICAgICAgIH07XG4gICAgICAgIC8vYm9yZGVyU3R5bGU6IHRoaXMuc3RhdGUuaXNEcmFnQWN0aXZlID8gXCJzb2xpZFwiIDogXCJkYXNoZWRcIlxuICAgICAgICBpZiAodGhpcy5wcm9wcy5zdHlsZSkge1xuICAgICAgICAgICAgc3R5bGUgPSBfZXh0ZW5kcyh7fSwgc3R5bGUsIHRoaXMucHJvcHMuc3R5bGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzRHJhZ0FjdGl2ZSAmJiB0aGlzLnByb3BzLmRyYWdBY3RpdmVTdHlsZSkge1xuICAgICAgICAgICAgc3R5bGUgPSBfZXh0ZW5kcyh7fSwgc3R5bGUsIHRoaXMucHJvcHMuZHJhZ0FjdGl2ZVN0eWxlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm9sZGVySW5wdXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVuYWJsZUZvbGRlcnMpIHtcbiAgICAgICAgICAgIGZvbGRlcklucHV0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgc3R5bGU6IHsgZGlzcGxheTogJ25vbmUnIH0sIG5hbWU6IFwidXNlcmZvbGRlclwiLCB0eXBlOiBcImZpbGVcIiwgcmVmOiBcImZvbGRlcklucHV0XCIsIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMub25Gb2xkZXJQaWNrZWQoZSk7XG4gICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCBzdHlsZTogc3R5bGUsIG9uQ2xpY2s6IHRoaXMub25DbGljay5iaW5kKHRoaXMpLCBvbkRyYWdMZWF2ZTogdGhpcy5vbkRyYWdMZWF2ZS5iaW5kKHRoaXMpLCBvbkRyYWdPdmVyOiB0aGlzLm9uRHJhZ092ZXIuYmluZCh0aGlzKSwgb25Ecm9wOiB0aGlzLm9uRHJvcC5iaW5kKHRoaXMpIH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyBzdHlsZTogeyBkaXNwbGF5OiAnbm9uZScgfSwgbmFtZTogXCJ1c2VyZmlsZVwiLCB0eXBlOiBcImZpbGVcIiwgbXVsdGlwbGU6IHRoaXMuc3RhdGUubXVsdGlwbGUsIHJlZjogXCJmaWxlSW5wdXRcIiwgdmFsdWU6IFwiXCIsIG9uQ2hhbmdlOiB0aGlzLm9uRmlsZVBpY2tlZC5iaW5kKHRoaXMpLCBhY2NlcHQ6IHRoaXMucHJvcHMuYWNjZXB0IH0pLFxuICAgICAgICAgICAgZm9sZGVySW5wdXQsXG4gICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHJldHVybiBGaWxlRHJvcHpvbmU7XG59KShSZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEZpbGVEcm9wem9uZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKFwibWF0ZXJpYWwtdWlcIik7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQgPSByZXF1aXJlKFwiLi4vaG9jL2FzRm9ybUZpZWxkXCIpO1xuXG52YXIgX2hvY0FzRm9ybUZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hvY0FzRm9ybUZpZWxkKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMltcImRlZmF1bHRcIl0ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5TdHlsZXMgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5TdHlsZXM7XG5cbi8qKlxuICogQm9vbGVhbiBpbnB1dFxuICovXG5cbnZhciBJbnB1dEJvb2xlYW4gPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoSW5wdXRCb29sZWFuLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIElucHV0Qm9vbGVhbigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIElucHV0Qm9vbGVhbik7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIElucHV0Qm9vbGVhbi5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBib29sVmFsID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICAgICAgaWYgKHR5cGVvZiBib29sVmFsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgYm9vbFZhbCA9IGJvb2xWYWwgPT09IFwidHJ1ZVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Ub2dnbGUsIF9leHRlbmRzKHtcbiAgICAgICAgICAgICAgICB0b2dnbGVkOiBib29sVmFsLFxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMucHJvcHMub25DaGFuZ2UoZSwgdik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5wcm9wcy5pc0Rpc3BsYXlGb3JtKCkgPyB0aGlzLnByb3BzLmF0dHJpYnV0ZXMubGFiZWwgOiBudWxsLFxuICAgICAgICAgICAgICAgIGxhYmVsUG9zaXRpb246IHRoaXMucHJvcHMuaXNEaXNwbGF5Rm9ybSgpID8gJ2xlZnQnIDogJ3JpZ2h0J1xuICAgICAgICAgICAgfSwgTW9kZXJuU3R5bGVzLnRvZ2dsZUZpZWxkKSlcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIElucHV0Qm9vbGVhbjtcbn0pKF9yZWFjdDJbXCJkZWZhdWx0XCJdLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2hvY0FzRm9ybUZpZWxkMltcImRlZmF1bHRcIl0oSW5wdXRCb29sZWFuLCB0cnVlKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9GaWxlRHJvcHpvbmUgPSByZXF1aXJlKCcuL0ZpbGVEcm9wem9uZScpO1xuXG52YXIgX0ZpbGVEcm9wem9uZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9GaWxlRHJvcHpvbmUpO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcgPSByZXF1aXJlKCdweWRpby91dGlsL2xhbmcnKTtcblxudmFyIF9weWRpb1V0aWxMYW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbExhbmcpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBOYXRpdmVGaWxlRHJvcFByb3ZpZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuTmF0aXZlRmlsZURyb3BQcm92aWRlcjtcblxuLy8gSnVzdCBlbmFibGUgdGhlIGRyb3AgbWVjaGFuaXNtLCBidXQgZG8gbm90aGluZywgaXQgaXMgbWFuYWdlZCBieSB0aGUgRmlsZURyb3B6b25lXG52YXIgQmluYXJ5RHJvcFpvbmUgPSBOYXRpdmVGaWxlRHJvcFByb3ZpZGVyKF9GaWxlRHJvcHpvbmUyWydkZWZhdWx0J10sIGZ1bmN0aW9uIChpdGVtcywgZmlsZXMsIHByb3BzKSB7fSk7XG5cbi8qKlxuICogVUkgZm9yIGRpc3BsYXlpbmcgYW5kIHVwbG9hZGluZyBhbiBpbWFnZSxcbiAqIHVzaW5nIHRoZSBiaW5hcnlDb250ZXh0IHN0cmluZy5cbiAqL1xuXG52YXIgSW5wdXRJbWFnZSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhJbnB1dEltYWdlLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIC8vIHByb3BUeXBlczoge1xuICAgIC8vICAgICBhdHRyaWJ1dGVzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIC8vICAgICBiaW5hcnlfY29udGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICAgIC8vIH0sXG5cbiAgICBmdW5jdGlvbiBJbnB1dEltYWdlKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBJbnB1dEltYWdlKTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB2YXIgaW1hZ2VTcmMgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBvcmlnaW5hbEJpbmFyeSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIGltYWdlU3JjID0gdGhpcy5nZXRCaW5hcnlVcmwodGhpcy5wcm9wcyk7XG4gICAgICAgICAgICBvcmlnaW5hbEJpbmFyeSA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXSkge1xuICAgICAgICAgICAgaW1hZ2VTcmMgPSB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2RlZmF1bHRJbWFnZSddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpbWFnZVNyYzogaW1hZ2VTcmMsXG4gICAgICAgICAgICBvcmlnaW5hbEJpbmFyeTogb3JpZ2luYWxCaW5hcnksXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIElucHV0SW1hZ2UucHJvdG90eXBlLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIHZhciBpbWdTcmMgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICgobmV3UHJvcHMudmFsdWUgfHwgbmV3UHJvcHMuYmluYXJ5X2NvbnRleHQgJiYgbmV3UHJvcHMuYmluYXJ5X2NvbnRleHQgIT09IHRoaXMucHJvcHMuYmluYXJ5X2NvbnRleHQpICYmICF0aGlzLnN0YXRlLnJlc2V0KSB7XG4gICAgICAgICAgICBpbWdTcmMgPSB0aGlzLmdldEJpbmFyeVVybChuZXdQcm9wcywgdGhpcy5zdGF0ZS50ZW1wb3JhcnlCaW5hcnkgJiYgdGhpcy5zdGF0ZS50ZW1wb3JhcnlCaW5hcnkgPT09IG5ld1Byb3BzLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChuZXdQcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXSkge1xuICAgICAgICAgICAgaW1nU3JjID0gbmV3UHJvcHMuYXR0cmlidXRlc1snZGVmYXVsdEltYWdlJ107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGltZ1NyYykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGltYWdlU3JjOiBpbWdTcmMsIHJlc2V0OiBmYWxzZSwgdmFsdWU6IG5ld1Byb3BzLnZhbHVlIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIElucHV0SW1hZ2UucHJvdG90eXBlLmdldEJpbmFyeVVybCA9IGZ1bmN0aW9uIGdldEJpbmFyeVVybChwcm9wcykge1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpLmdldFB5ZGlvT2JqZWN0KCk7XG4gICAgICAgIHZhciB1cmwgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnRU5EUE9JTlRfUkVTVF9BUEknKSArIHByb3BzLmF0dHJpYnV0ZXNbJ2xvYWRBY3Rpb24nXTtcbiAgICAgICAgdmFyIGJJZCA9IHByb3BzLnZhbHVlO1xuICAgICAgICBpZiAocHJvcHMuYmluYXJ5X2NvbnRleHQgJiYgcHJvcHMuYmluYXJ5X2NvbnRleHQuaW5kZXhPZigndXNlcl9pZD0nKSA9PT0gMCkge1xuICAgICAgICAgICAgYklkID0gcHJvcHMuYmluYXJ5X2NvbnRleHQucmVwbGFjZSgndXNlcl9pZD0nLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJ3tCSU5BUll9JywgYklkKTtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9O1xuXG4gICAgSW5wdXRJbWFnZS5wcm90b3R5cGUuZ2V0VXBsb2FkVXJsID0gZnVuY3Rpb24gZ2V0VXBsb2FkVXJsKCkge1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpLmdldFB5ZGlvT2JqZWN0KCk7XG4gICAgICAgIHZhciB1cmwgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnRU5EUE9JTlRfUkVTVF9BUEknKSArIHRoaXMucHJvcHMuYXR0cmlidXRlc1sndXBsb2FkQWN0aW9uJ107XG4gICAgICAgIHZhciBiSWQgPSAnJztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYmluYXJ5X2NvbnRleHQgJiYgdGhpcy5wcm9wcy5iaW5hcnlfY29udGV4dC5pbmRleE9mKCd1c2VyX2lkPScpID09PSAwKSB7XG4gICAgICAgICAgICBiSWQgPSB0aGlzLnByb3BzLmJpbmFyeV9jb250ZXh0LnJlcGxhY2UoJ3VzZXJfaWQ9JywgJycpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIGJJZCA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiSWQgPSBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS5jb21wdXRlU3RyaW5nU2x1Zyh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbXCJuYW1lXCJdICsgXCIucG5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHVybC5yZXBsYWNlKCd7QklOQVJZfScsIGJJZCk7XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfTtcblxuICAgIElucHV0SW1hZ2UucHJvdG90eXBlLnVwbG9hZENvbXBsZXRlID0gZnVuY3Rpb24gdXBsb2FkQ29tcGxldGUobmV3QmluYXJ5TmFtZSkge1xuICAgICAgICB2YXIgcHJldlZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0ZW1wb3JhcnlCaW5hcnk6IG5ld0JpbmFyeU5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBhZGRpdGlvbmFsRm9ybURhdGEgPSB7IHR5cGU6ICdiaW5hcnknIH07XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5vcmlnaW5hbEJpbmFyeSkge1xuICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxGb3JtRGF0YVsnb3JpZ2luYWxfYmluYXJ5J10gPSB0aGlzLnN0YXRlLm9yaWdpbmFsQmluYXJ5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdCaW5hcnlOYW1lLCBwcmV2VmFsdWUsIGFkZGl0aW9uYWxGb3JtRGF0YSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBkaXJ0eTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogbmV3QmluYXJ5TmFtZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgSW5wdXRJbWFnZS5wcm90b3R5cGUuaHRtbFVwbG9hZCA9IGZ1bmN0aW9uIGh0bWxVcGxvYWQoKSB7XG4gICAgICAgIHdpbmRvdy5mb3JtTWFuYWdlckhpZGRlbklGcmFtZVN1Ym1pc3Npb24gPSAoZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgdGhpcy51cGxvYWRDb21wbGV0ZShyZXN1bHQudHJpbSgpKTtcbiAgICAgICAgICAgIHdpbmRvdy5mb3JtTWFuYWdlckhpZGRlbklGcmFtZVN1Ym1pc3Npb24gPSBudWxsO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlZnMudXBsb2FkRm9ybS5zdWJtaXQoKTtcbiAgICB9O1xuXG4gICAgSW5wdXRJbWFnZS5wcm90b3R5cGUub25Ecm9wID0gZnVuY3Rpb24gb25Ecm9wKGZpbGVzLCBldmVudCwgZHJvcHpvbmUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldE1lc3NhZ2VzKCk7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5wcm9wcy5uYW1lO1xuXG4gICAgICAgIGlmIChuYW1lID09PSAnYXZhdGFyJyAmJiBmaWxlc1swXS5zaXplID4gNSAqIDEwMjQgKiAxMDI0KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG1lc3NhZ2VzWydmb3JtLmlucHV0LWltYWdlLmF2YXRhck1heCddIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChbJ2ltYWdlL2pwZWcnLCAnaW1hZ2UvcG5nJywgJ2ltYWdlL2JtcCcsICdpbWFnZS90aWZmJywgJ2ltYWdlL3dlYnAnXS5pbmRleE9mKGZpbGVzWzBdLnR5cGUpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBtZXNzYWdlc1snZm9ybS5pbnB1dC1pbWFnZS5maWxlVHlwZXMnXSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSk7XG4gICAgICAgIGlmIChfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLnN1cHBvcnRzVXBsb2FkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuICAgICAgICAgICAgX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkuZ2V0T3JVcGRhdGVKd3QoKS50aGVuKGZ1bmN0aW9uIChqd3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgeGhyU2V0dGluZ3MgPSB7IGN1c3RvbUhlYWRlcnM6IHsgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgand0IH0gfTtcbiAgICAgICAgICAgICAgICBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpLnVwbG9hZEZpbGUoZmlsZXNbMF0sIFwidXNlcmZpbGVcIiwgJycsIGZ1bmN0aW9uICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IEpTT04ucGFyc2UodHJhbnNwb3J0LnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LmJpbmFyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudXBsb2FkQ29tcGxldGUocmVzdWx0LmJpbmFyeSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSwgZXJyb3I6IGVycm9yIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChjb21wdXRhYmxlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJvZ3Jlc3MsIG5vdCByZWFsbHkgdXNlZnVsIGZvciBzbWFsbCB1cGxvYWRzXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvbXB1dGFibGVFdmVudCk7XG4gICAgICAgICAgICAgICAgfSwgX3RoaXMuZ2V0VXBsb2FkVXJsKCksIHhoclNldHRpbmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5odG1sVXBsb2FkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgSW5wdXRJbWFnZS5wcm90b3R5cGUuY2xlYXJJbWFnZSA9IGZ1bmN0aW9uIGNsZWFySW1hZ2UoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIGlmIChjb25maXJtKF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRNZXNzYWdlcygpWydmb3JtLmlucHV0LWltYWdlLmNsZWFyQ29uZmlybSddKSkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJldlZhbHVlID0gX3RoaXMyLnN0YXRlLnZhbHVlO1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IHRydWVcbiAgICAgICAgICAgICAgICB9LCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKCcnLCBwcmV2VmFsdWUsIHsgdHlwZTogJ2JpbmFyeScgfSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZChfdGhpczIpKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgSW5wdXRJbWFnZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdmFyIGxvYWRpbmcgPSBfc3RhdGUubG9hZGluZztcbiAgICAgICAgdmFyIGVycm9yID0gX3N0YXRlLmVycm9yO1xuXG4gICAgICAgIHZhciBjb3ZlckltYWdlU3R5bGUgPSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKFwiICsgdGhpcy5zdGF0ZS5pbWFnZVNyYyArIFwiKVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZFBvc2l0aW9uOiBcIjUwJSA1MCVcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRTaXplOiBcImNvdmVyXCIsXG4gICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xuICAgICAgICB9O1xuICAgICAgICB2YXIgb3ZlcmxheSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG92ZXJsYXlCZyA9IHt9O1xuICAgICAgICB2YXIgaXNEZWZhdWx0ID0gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydkZWZhdWx0SW1hZ2UnXSAmJiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2RlZmF1bHRJbWFnZSddID09PSB0aGlzLnN0YXRlLmltYWdlU3JjO1xuXG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgb3ZlcmxheUJnID0geyBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzcpJywgYm9yZGVyUmFkaXVzOiAnNTAlJyB9O1xuICAgICAgICAgICAgb3ZlcmxheSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY29sb3I6ICcjRjQ0MzM2JywgdGV4dEFsaWduOiAnY2VudGVyJywgZm9udFNpemU6IDExLCBjdXJzb3I6ICdwb2ludGVyJyB9LCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1hbGVydFwiLCBzdHlsZTogeyBmb250U2l6ZTogNDAgfSB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnYnInLCBudWxsKSxcbiAgICAgICAgICAgICAgICBlcnJvclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChsb2FkaW5nKSB7XG4gICAgICAgICAgICBvdmVybGF5ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2lyY3VsYXJQcm9ncmVzcywgeyBtb2RlOiBcImluZGV0ZXJtaW5hdGVcIiB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG92ZXJsYXkgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiBcIm1kaSBtZGktY2FtZXJhXCIsIHN0eWxlOiB7IGZvbnRTaXplOiA0MCwgb3BhY2l0eTogLjUsIGNvbG9yOiBpc0RlZmF1bHQgPyBudWxsIDogJ3doaXRlJyB9IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdpbWFnZS1sYWJlbCcgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmF0dHJpYnV0ZXMubGFiZWxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZm9ybScsXG4gICAgICAgICAgICAgICAgeyByZWY6ICd1cGxvYWRGb3JtJywgZW5jVHlwZTogJ211bHRpcGFydC9mb3JtLWRhdGEnLCB0YXJnZXQ6ICd1cGxvYWRlcl9oaWRkZW5faWZyYW1lJywgbWV0aG9kOiAncG9zdCcsIGFjdGlvbjogdGhpcy5nZXRVcGxvYWRVcmwoKSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBCaW5hcnlEcm9wWm9uZSxcbiAgICAgICAgICAgICAgICAgICAgeyBvbkRyb3A6IHRoaXMub25Ecm9wLmJpbmQodGhpcyksIGFjY2VwdDogJ2ltYWdlLyonLCBzdHlsZTogY292ZXJJbWFnZVN0eWxlIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicgfSwgb3ZlcmxheUJnKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmxheVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICFpc0RlZmF1bHQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdiaW5hcnktcmVtb3ZlLWJ1dHRvbicsIG9uQ2xpY2s6IHRoaXMuY2xlYXJJbWFnZS5iaW5kKHRoaXMpIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGtleTogJ3JlbW92ZScsIGNsYXNzTmFtZTogJ21kaSBtZGktY2xvc2UnIH0pLFxuICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICBfcHlkaW8yWydkZWZhdWx0J10uZ2V0TWVzc2FnZXMoKVsnZm9ybS5pbnB1dC1pbWFnZS5jbGVhckJ1dHRvbiddXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScsIHsgc3R5bGU6IHsgZGlzcGxheTogXCJub25lXCIgfSwgaWQ6ICd1cGxvYWRlcl9oaWRkZW5faWZyYW1lJywgbmFtZTogJ3VwbG9hZGVyX2hpZGRlbl9pZnJhbWUnIH0pXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHJldHVybiBJbnB1dEltYWdlO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IElucHV0SW1hZ2U7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZCA9IHJlcXVpcmUoXCIuLi9ob2MvYXNGb3JtRmllbGRcIik7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaG9jQXNGb3JtRmllbGQpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5UZXh0RmllbGQ7XG5cbi8qKlxuICogVGV4dCBpbnB1dCB0aGF0IGlzIGNvbnZlcnRlZCB0byBpbnRlZ2VyLCBhbmRcbiAqIHRoZSBVSSBjYW4gcmVhY3QgdG8gYXJyb3dzIGZvciBpbmNyZW1lbnRpbmcvZGVjcmVtZW50aW5nIHZhbHVlc1xuICovXG5cbnZhciBJbnB1dEludGVnZXIgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoSW5wdXRJbnRlZ2VyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIElucHV0SW50ZWdlcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIElucHV0SW50ZWdlcik7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIElucHV0SW50ZWdlci5wcm90b3R5cGUua2V5RG93biA9IGZ1bmN0aW9uIGtleURvd24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGluYyA9IDAsXG4gICAgICAgICAgICBtdWx0aXBsZSA9IDE7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT09ICdBcnJvd1VwJykge1xuICAgICAgICAgICAgaW5jID0gKzE7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dEb3duJykge1xuICAgICAgICAgICAgaW5jID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBtdWx0aXBsZSA9IDEwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJzZWQgPSBwYXJzZUludCh0aGlzLnByb3BzLnZhbHVlKTtcbiAgICAgICAgaWYgKGlzTmFOKHBhcnNlZCkpIHtcbiAgICAgICAgICAgIHBhcnNlZCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZhbHVlID0gcGFyc2VkICsgaW5jICogbXVsdGlwbGU7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobnVsbCwgdmFsdWUpO1xuICAgIH07XG5cbiAgICBJbnB1dEludGVnZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIHZhbHVlID0gX3Byb3BzLnZhbHVlO1xuICAgICAgICB2YXIgaXNEaXNwbGF5R3JpZCA9IF9wcm9wcy5pc0Rpc3BsYXlHcmlkO1xuICAgICAgICB2YXIgaXNEaXNwbGF5Rm9ybSA9IF9wcm9wcy5pc0Rpc3BsYXlGb3JtO1xuICAgICAgICB2YXIgZWRpdE1vZGUgPSBfcHJvcHMuZWRpdE1vZGU7XG4gICAgICAgIHZhciBkaXNhYmxlZCA9IF9wcm9wcy5kaXNhYmxlZDtcbiAgICAgICAgdmFyIHRvZ2dsZUVkaXRNb2RlID0gX3Byb3BzLnRvZ2dsZUVkaXRNb2RlO1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IF9wcm9wcy5hdHRyaWJ1dGVzO1xuXG4gICAgICAgIGlmIChpc0Rpc3BsYXlHcmlkKCkgJiYgIWVkaXRNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBvbkNsaWNrOiBkaXNhYmxlZCA/IGZ1bmN0aW9uICgpIHt9IDogdG9nZ2xlRWRpdE1vZGUsIGNsYXNzTmFtZTogdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgIHZhbHVlID8gdmFsdWUgOiAnRW1wdHknXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGludHZhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGludHZhbCA9IHBhcnNlSW50KHZhbHVlKSArICcnO1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihpbnR2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIGludHZhbCA9IHZhbHVlICsgJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnR2YWwgPSAnMCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaW50ZWdlci1pbnB1dCcgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGludHZhbCxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMucHJvcHMub25DaGFuZ2UoZSwgdik7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5rZXlEb3duKGUpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaGludFRleHQ6IGlzRGlzcGxheUZvcm0oKSA/IGF0dHJpYnV0ZXMubGFiZWwgOiBudWxsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIElucHV0SW50ZWdlcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBfaG9jQXNGb3JtRmllbGQyWydkZWZhdWx0J10oSW5wdXRJbnRlZ2VyKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfaG9jQXNGb3JtRmllbGQgPSByZXF1aXJlKFwiLi4vaG9jL2FzRm9ybUZpZWxkXCIpO1xuXG52YXIgX2hvY0FzRm9ybUZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hvY0FzRm9ybUZpZWxkKTtcblxudmFyIF9ob2NXaXRoQ2hvaWNlcyA9IHJlcXVpcmUoJy4uL2hvYy93aXRoQ2hvaWNlcycpO1xuXG52YXIgX2hvY1dpdGhDaG9pY2VzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hvY1dpdGhDaG9pY2VzKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgU2VsZWN0RmllbGQgPSBfcmVxdWlyZS5TZWxlY3RGaWVsZDtcbnZhciBNZW51SXRlbSA9IF9yZXF1aXJlLk1lbnVJdGVtO1xudmFyIENoaXAgPSBfcmVxdWlyZS5DaGlwO1xuXG52YXIgTGFuZ1V0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblNlbGVjdEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuU2VsZWN0RmllbGQ7XG5cbi8qKlxuICogU2VsZWN0IGJveCBpbnB1dCBjb25mb3JtaW5nIHRvIFB5ZGlvIHN0YW5kYXJkIGZvcm0gcGFyYW1ldGVyLlxuICovXG5cbnZhciBJbnB1dFNlbGVjdEJveCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhJbnB1dFNlbGVjdEJveCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBJbnB1dFNlbGVjdEJveCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIElucHV0U2VsZWN0Qm94KTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgSW5wdXRTZWxlY3RCb3gucHJvdG90eXBlLm9uRHJvcERvd25DaGFuZ2UgPSBmdW5jdGlvbiBvbkRyb3BEb3duQ2hhbmdlKGV2ZW50LCBpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCwgdmFsdWUpO1xuICAgICAgICB0aGlzLnByb3BzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgfTtcblxuICAgIElucHV0U2VsZWN0Qm94LnByb3RvdHlwZS5vbk11bHRpcGxlU2VsZWN0ID0gZnVuY3Rpb24gb25NdWx0aXBsZVNlbGVjdChldmVudCwgaW5kZXgsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmIChuZXdWYWx1ZSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTtcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZXMgPSB0eXBlb2YgY3VycmVudFZhbHVlID09PSAnc3RyaW5nJyA/IGN1cnJlbnRWYWx1ZS5zcGxpdCgnLCcpIDogY3VycmVudFZhbHVlO1xuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZXMuaW5kZXhPZihuZXdWYWx1ZSkgIT09IC0xKSB7XG4gICAgICAgICAgICBjdXJyZW50VmFsdWVzLnB1c2gobmV3VmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCwgY3VycmVudFZhbHVlcy5qb2luKCcsJykpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMudG9nZ2xlRWRpdE1vZGUoKTtcbiAgICB9O1xuXG4gICAgSW5wdXRTZWxlY3RCb3gucHJvdG90eXBlLm9uTXVsdGlwbGVSZW1vdmUgPSBmdW5jdGlvbiBvbk11bHRpcGxlUmVtb3ZlKHZhbHVlKSB7XG4gICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlO1xuICAgICAgICB2YXIgY3VycmVudFZhbHVlcyA9IHR5cGVvZiBjdXJyZW50VmFsdWUgPT09ICdzdHJpbmcnID8gY3VycmVudFZhbHVlLnNwbGl0KCcsJykgOiBjdXJyZW50VmFsdWU7XG4gICAgICAgIGlmIChjdXJyZW50VmFsdWVzLmluZGV4T2YodmFsdWUpICE9PSAtMSkge1xuICAgICAgICAgICAgY3VycmVudFZhbHVlcyA9IExhbmdVdGlscy5hcnJheVdpdGhvdXQoY3VycmVudFZhbHVlcywgY3VycmVudFZhbHVlcy5pbmRleE9mKHZhbHVlKSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG51bGwsIGN1cnJlbnRWYWx1ZXMuam9pbignLCcpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBJbnB1dFNlbGVjdEJveC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBjdXJyZW50VmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlO1xuICAgICAgICB2YXIgbWVudUl0ZW1zID0gW10sXG4gICAgICAgICAgICBtdWx0aXBsZU9wdGlvbnMgPSBbXTtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddIHx8IHRoaXMucHJvcHMuYXR0cmlidXRlc1snbWFuZGF0b3J5J10gIT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICBtZW51SXRlbXMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVJdGVtLCB7IHZhbHVlOiAtMSwgcHJpbWFyeVRleHQ6IHRoaXMucHJvcHMuYXR0cmlidXRlc1snbGFiZWwnXSArICcuLi4nIH0pKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcztcblxuICAgICAgICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgdmFsdWU6IGtleSwgcHJpbWFyeVRleHQ6IHZhbHVlIH0pKTtcbiAgICAgICAgICAgIG11bHRpcGxlT3B0aW9ucy5wdXNoKHsgdmFsdWU6IGtleSwgbGFiZWw6IHZhbHVlIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNEaXNwbGF5R3JpZCgpICYmICF0aGlzLnByb3BzLmVkaXRNb2RlIHx8IHRoaXMucHJvcHMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMucHJvcHMudmFsdWU7XG4gICAgICAgICAgICBpZiAoY2hvaWNlcy5nZXQodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjaG9pY2VzLmdldCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMucHJvcHMuZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRoaXMucHJvcHMudG9nZ2xlRWRpdE1vZGUsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgIHZhbHVlID8gdmFsdWUgOiAnRW1wdHknLFxuICAgICAgICAgICAgICAgICcgwqDCoCcsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnaWNvbi1jYXJldC1kb3duJyB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm11bHRpcGxlICYmIHRoaXMucHJvcHMubXVsdGlwbGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlcyA9IGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWVzID0gY3VycmVudFZhbHVlLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwibXVsdGlwbGUgaGFzLXZhbHVlXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlcy5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2hpcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBvblJlcXVlc3REZWxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbk11bHRpcGxlUmVtb3ZlKHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2Rlcm5TZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogLTEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCBpLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5vbk11bHRpcGxlU2VsZWN0KGUsIGksIHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2Rlcm5TZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaW50VGV4dDogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCBpLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5vbkRyb3BEb3duQ2hhbmdlKGUsIGksIHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIElucHV0U2VsZWN0Qm94O1xufSkoUmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSW5wdXRTZWxlY3RCb3ggPSBfaG9jQXNGb3JtRmllbGQyWydkZWZhdWx0J10oSW5wdXRTZWxlY3RCb3gsIHRydWUpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gSW5wdXRTZWxlY3RCb3ggPSBfaG9jV2l0aENob2ljZXMyWydkZWZhdWx0J10oSW5wdXRTZWxlY3RCb3gpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gSW5wdXRTZWxlY3RCb3g7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9ob2NBc0Zvcm1GaWVsZCA9IHJlcXVpcmUoXCIuLi9ob2MvYXNGb3JtRmllbGRcIik7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaG9jQXNGb3JtRmllbGQpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5UZXh0RmllbGQ7XG5cbi8qKlxuICogVGV4dCBpbnB1dCwgY2FuIGJlIHNpbmdsZSBsaW5lLCBtdWx0aUxpbmUsIG9yIHBhc3N3b3JkLCBkZXBlbmRpbmcgb24gdGhlXG4gKiBhdHRyaWJ1dGVzLnR5cGUga2V5LlxuICovXG5cbnZhciBUZXh0RmllbGQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVGV4dEZpZWxkLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFRleHRGaWVsZCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFRleHRGaWVsZCk7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIFRleHRGaWVsZC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGVkaXRNb2RlID0gX3Byb3BzLmVkaXRNb2RlO1xuICAgICAgICB2YXIgdmFsdWUgPSBfcHJvcHMudmFsdWU7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNEaXNwbGF5R3JpZCgpICYmICFlZGl0TW9kZSkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHZhbHVlO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1sndHlwZSddID09PSAncGFzc3dvcmQnICYmIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFsID0gJyoqKioqKioqKioqJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IHRoaXMucHJvcHMuZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRoaXMucHJvcHMudG9nZ2xlRWRpdE1vZGUsIGNsYXNzTmFtZTogdmFsID8gJycgOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICB2YWwgPyB2YWwgOiAnRW1wdHknXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTW9kZXJuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgaGludFRleHQ6IHRoaXMucHJvcHMuaXNEaXNwbGF5Rm9ybSgpID8gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzLmxhYmVsIDogbnVsbCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUgfHwgXCJcIixcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5wcm9wcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMucHJvcHMuZW50ZXJUb1RvZ2dsZSxcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJyA/ICdwYXNzd29yZCcgOiBudWxsLFxuICAgICAgICAgICAgICAgIG11bHRpTGluZTogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICd0ZXh0YXJlYScsXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiB0aGlzLnByb3BzLmVycm9yVGV4dCxcbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU6ICdvZmYnLFxuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAgICAgICAgICAgeyBhdXRvQ29tcGxldGU6ICdvZmYnLCBvblN1Ym1pdDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO2UucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHN0eWxlOiB7IGRpc3BsYXk6ICdpbmxpbmUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBUZXh0RmllbGQ7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gX2hvY0FzRm9ybUZpZWxkMlsnZGVmYXVsdCddKFRleHRGaWVsZCk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQgPSByZXF1aXJlKFwiLi4vaG9jL2FzRm9ybUZpZWxkXCIpO1xuXG52YXIgX2hvY0FzRm9ybUZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hvY0FzRm9ybUZpZWxkKTtcblxudmFyIF9weWRpb1V0aWxQYXNzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXNzJyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXNzKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMltcImRlZmF1bHRcIl0ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5UZXh0RmllbGQ7XG5cbi8qKlxuICogVGV4dCBpbnB1dCwgY2FuIGJlIHNpbmdsZSBsaW5lLCBtdWx0aUxpbmUsIG9yIHBhc3N3b3JkLCBkZXBlbmRpbmcgb24gdGhlXG4gKiBhdHRyaWJ1dGVzLnR5cGUga2V5LlxuICovXG5cbnZhciBWYWxpZExvZ2luID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFZhbGlkTG9naW4sIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVmFsaWRMb2dpbigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFZhbGlkTG9naW4pO1xuXG4gICAgICAgIF9SZWFjdCRDb21wb25lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBWYWxpZExvZ2luLnByb3RvdHlwZS50ZXh0VmFsdWVDaGFuZ2VkID0gZnVuY3Rpb24gdGV4dFZhbHVlQ2hhbmdlZChldmVudCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIGVyciA9IF9weWRpb1V0aWxQYXNzMltcImRlZmF1bHRcIl0uaXNWYWxpZExvZ2luKHZhbHVlKTtcbiAgICAgICAgdmFyIHByZXZTdGF0ZVZhbGlkID0gdGhpcy5zdGF0ZS52YWxpZDtcbiAgICAgICAgdmFyIHZhbGlkID0gIWVycjtcbiAgICAgICAgaWYgKHByZXZTdGF0ZVZhbGlkICE9PSB2YWxpZCAmJiB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSh2YWxpZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbGlkOiB2YWxpZCwgZXJyOiBlcnIgfSk7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCwgdmFsdWUpO1xuICAgIH07XG5cbiAgICBWYWxpZExvZ2luLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBpc0Rpc3BsYXlHcmlkID0gX3Byb3BzLmlzRGlzcGxheUdyaWQ7XG4gICAgICAgIHZhciBpc0Rpc3BsYXlGb3JtID0gX3Byb3BzLmlzRGlzcGxheUZvcm07XG4gICAgICAgIHZhciBlZGl0TW9kZSA9IF9wcm9wcy5lZGl0TW9kZTtcbiAgICAgICAgdmFyIGRpc2FibGVkID0gX3Byb3BzLmRpc2FibGVkO1xuICAgICAgICB2YXIgZXJyb3JUZXh0ID0gX3Byb3BzLmVycm9yVGV4dDtcbiAgICAgICAgdmFyIGVudGVyVG9Ub2dnbGUgPSBfcHJvcHMuZW50ZXJUb1RvZ2dsZTtcbiAgICAgICAgdmFyIHRvZ2dsZUVkaXRNb2RlID0gX3Byb3BzLnRvZ2dsZUVkaXRNb2RlO1xuICAgICAgICB2YXIgYXR0cmlidXRlcyA9IF9wcm9wcy5hdHRyaWJ1dGVzO1xuXG4gICAgICAgIGlmIChpc0Rpc3BsYXlHcmlkKCkgJiYgIWVkaXRNb2RlKSB7XG4gICAgICAgICAgICB2YXIgX3ZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJyAmJiBfdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfdmFsdWUgPSAnKioqKioqKioqKionO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IGRpc2FibGVkID8gZnVuY3Rpb24gKCkge30gOiB0b2dnbGVFZGl0TW9kZSwgY2xhc3NOYW1lOiBfdmFsdWUgPyAnJyA6ICdwYXJhbVZhbHVlLWVtcHR5JyB9LFxuICAgICAgICAgICAgICAgIF92YWx1ZSA/IF92YWx1ZSA6ICdFbXB0eSdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gdGhpcy5zdGF0ZS5lcnI7XG5cbiAgICAgICAgICAgIHZhciBmaWVsZCA9IF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoTW9kZXJuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IGlzRGlzcGxheUZvcm0oKSA/IGF0dHJpYnV0ZXMubGFiZWwgOiBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudGV4dFZhbHVlQ2hhbmdlZChlLCB2KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uS2V5RG93bjogZW50ZXJUb1RvZ2dsZSxcbiAgICAgICAgICAgICAgICB0eXBlOiBhdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcgPyAncGFzc3dvcmQnIDogbnVsbCxcbiAgICAgICAgICAgICAgICBtdWx0aUxpbmU6IGF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3RleHRhcmVhJyxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBlcnJvclRleHQgfHwgZXJyLFxuICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogXCJvZmZcIixcbiAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbJ3R5cGUnXSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImZvcm1cIixcbiAgICAgICAgICAgICAgICAgICAgeyBhdXRvQ29tcGxldGU6IFwib2ZmXCIsIG9uU3VibWl0OiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7ZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgc3R5bGU6IHsgZGlzcGxheTogJ2lubGluZScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBmaWVsZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZmllbGRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBWYWxpZExvZ2luO1xufSkoX3JlYWN0MltcImRlZmF1bHRcIl0uQ29tcG9uZW50KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfaG9jQXNGb3JtRmllbGQyW1wiZGVmYXVsdFwiXShWYWxpZExvZ2luKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MgPSByZXF1aXJlKFwicHlkaW8vdXRpbC9wYXNzXCIpO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGFzcyk7XG5cbnZhciBfaG9jQXNGb3JtRmllbGQgPSByZXF1aXJlKFwiLi4vaG9jL2FzRm9ybUZpZWxkXCIpO1xuXG52YXIgX2hvY0FzRm9ybUZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hvY0FzRm9ybUZpZWxkKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMltcImRlZmF1bHRcIl0ucmVxdWlyZUxpYihcImhvY1wiKTtcblxudmFyIE1vZGVyblRleHRGaWVsZCA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblRleHRGaWVsZDtcblxudmFyIFZhbGlkUGFzc3dvcmQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVmFsaWRQYXNzd29yZCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBWYWxpZFBhc3N3b3JkKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBWYWxpZFBhc3N3b3JkKTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge307XG4gICAgfVxuXG4gICAgVmFsaWRQYXNzd29yZC5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uIGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnZhbGlkO1xuICAgIH07XG5cbiAgICBWYWxpZFBhc3N3b3JkLnByb3RvdHlwZS5jaGVja01pbkxlbmd0aCA9IGZ1bmN0aW9uIGNoZWNrTWluTGVuZ3RoKHZhbHVlKSB7XG4gICAgICAgIHZhciBtaW5MZW5ndGggPSBwYXJzZUludChfcHlkaW8yW1wiZGVmYXVsdFwiXS5nZXRJbnN0YW5jZSgpLmdldFBsdWdpbkNvbmZpZ3MoXCJjb3JlLmF1dGhcIikuZ2V0KFwiUEFTU1dPUkRfTUlOTEVOR1RIXCIpKTtcbiAgICAgICAgcmV0dXJuICEodmFsdWUgJiYgdmFsdWUubGVuZ3RoIDwgbWluTGVuZ3RoKTtcbiAgICB9O1xuXG4gICAgVmFsaWRQYXNzd29yZC5wcm90b3R5cGUuZ2V0TWVzc2FnZSA9IGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZUlkKSB7XG4gICAgICAgIHJldHVybiBfcHlkaW8yW1wiZGVmYXVsdFwiXS5nZXRNZXNzYWdlcygpW21lc3NhZ2VJZF0gfHwgbWVzc2FnZUlkO1xuICAgIH07XG5cbiAgICBWYWxpZFBhc3N3b3JkLnByb3RvdHlwZS51cGRhdGVQYXNzU3RhdGUgPSBmdW5jdGlvbiB1cGRhdGVQYXNzU3RhdGUoKSB7XG4gICAgICAgIHZhciBwcmV2U3RhdGVWYWxpZCA9IHRoaXMuc3RhdGUudmFsaWQ7XG4gICAgICAgIHZhciBuZXdTdGF0ZSA9IF9weWRpb1V0aWxQYXNzMltcImRlZmF1bHRcIl0uZ2V0U3RhdGUodGhpcy5yZWZzLnBhc3MuZ2V0VmFsdWUoKSwgdGhpcy5yZWZzLmNvbmZpcm0gPyB0aGlzLnJlZnMuY29uZmlybS5nZXRWYWx1ZSgpIDogJycpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgICAgaWYgKHByZXZTdGF0ZVZhbGlkICE9PSBuZXdTdGF0ZS52YWxpZCAmJiB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZShuZXdTdGF0ZS52YWxpZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgVmFsaWRQYXNzd29yZC5wcm90b3R5cGUub25QYXNzd29yZENoYW5nZSA9IGZ1bmN0aW9uIG9uUGFzc3dvcmRDaGFuZ2UoZXZlbnQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVQYXNzU3RhdGUoKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCwgZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuXG4gICAgVmFsaWRQYXNzd29yZC5wcm90b3R5cGUub25Db25maXJtQ2hhbmdlID0gZnVuY3Rpb24gb25Db25maXJtQ2hhbmdlKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb25maXJtVmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZSB9KTtcbiAgICAgICAgdGhpcy51cGRhdGVQYXNzU3RhdGUoKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCwgdGhpcy5zdGF0ZS52YWx1ZSk7XG4gICAgfTtcblxuICAgIFZhbGlkUGFzc3dvcmQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBkaXNhYmxlZCA9IF9wcm9wcy5kaXNhYmxlZDtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IF9wcm9wcy5jbGFzc05hbWU7XG4gICAgICAgIHZhciBhdHRyaWJ1dGVzID0gX3Byb3BzLmF0dHJpYnV0ZXM7XG4gICAgICAgIHZhciBkaWFsb2dGaWVsZCA9IF9wcm9wcy5kaWFsb2dGaWVsZDtcbiAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgaXNEaXNwbGF5R3JpZCA9IF9wcm9wczIuaXNEaXNwbGF5R3JpZDtcbiAgICAgICAgdmFyIGlzRGlzcGxheUZvcm0gPSBfcHJvcHMyLmlzRGlzcGxheUZvcm07XG4gICAgICAgIHZhciBlZGl0TW9kZSA9IF9wcm9wczIuZWRpdE1vZGU7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9wcm9wczIudmFsdWU7XG4gICAgICAgIHZhciB0b2dnbGVFZGl0TW9kZSA9IF9wcm9wczIudG9nZ2xlRWRpdE1vZGU7XG4gICAgICAgIHZhciBlbnRlclRvVG9nZ2xlID0gX3Byb3BzMi5lbnRlclRvVG9nZ2xlO1xuXG4gICAgICAgIGlmIChpc0Rpc3BsYXlHcmlkKCkgJiYgIWVkaXRNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgb25DbGljazogZGlzYWJsZWQgPyBmdW5jdGlvbiAoKSB7fSA6IHRvZ2dsZUVkaXRNb2RlLCBjbGFzc05hbWU6IHZhbHVlID8gJycgOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA/IHZhbHVlIDogJ0VtcHR5J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBvdmVyZmxvdyA9IHsgb3ZlcmZsb3c6ICdoaWRkZW4nLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLCB3aWR0aDogJzEwMCUnIH07XG4gICAgICAgICAgICB2YXIgY05hbWUgPSB0aGlzLnN0YXRlLnZhbGlkID8gJycgOiAnbXVpLWVycm9yLWFzLWhpbnQnO1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgIGNOYW1lID0gY2xhc3NOYW1lICsgJyAnICsgY05hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgX2NvbmZpcm0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgVGV4dENvbXBvbmVudCA9IGRpYWxvZ0ZpZWxkID8gX21hdGVyaWFsVWkuVGV4dEZpZWxkIDogTW9kZXJuVGV4dEZpZWxkO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmICFkaXNhYmxlZCkge1xuXG4gICAgICAgICAgICAgICAgX2NvbmZpcm0gPSBbX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcImRpdlwiLCB7IGtleTogXCJzZXBcIiwgc3R5bGU6IHsgd2lkdGg6IDggfSB9KSwgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChUZXh0Q29tcG9uZW50LCB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogXCJjb25maXJtXCIsXG4gICAgICAgICAgICAgICAgICAgIHJlZjogXCJjb25maXJtXCIsXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLmdldE1lc3NhZ2UoMTk5KSxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFNocmlua1N0eWxlOiBfZXh0ZW5kcyh7fSwgb3ZlcmZsb3csIHsgd2lkdGg6ICcxMzAlJyB9KSxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFN0eWxlOiBvdmVyZmxvdyxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBjTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUuY29uZmlybVZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNvbmZpcm1DaGFuZ2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJwYXNzd29yZFwiLFxuICAgICAgICAgICAgICAgICAgICBtdWx0aUxpbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IHRoaXMuc3RhdGUuY29uZmlybUVycm9yVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JTdHlsZTogZGlhbG9nRmllbGQgPyB7IGJvdHRvbTogLTUgfSA6IG51bGxcbiAgICAgICAgICAgICAgICB9KV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImZvcm1cIixcbiAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogXCJvZmZcIiwgb25TdWJtaXQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO2UucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChUZXh0Q29tcG9uZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwicGFzc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IGlzRGlzcGxheUZvcm0oKSA/IGF0dHJpYnV0ZXMubGFiZWwgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFNocmlua1N0eWxlOiBfZXh0ZW5kcyh7fSwgb3ZlcmZsb3csIHsgd2lkdGg6ICcxMzAlJyB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxTdHlsZTogb3ZlcmZsb3csXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGNOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblBhc3N3b3JkQ2hhbmdlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd246IGVudGVyVG9Ub2dnbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInBhc3N3b3JkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aUxpbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGRpc2FibGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiB0aGlzLnN0YXRlLnBhc3NFcnJvclRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclN0eWxlOiBkaWFsb2dGaWVsZCA/IHsgYm90dG9tOiAtNSB9IDogbnVsbFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX2NvbmZpcm1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBWYWxpZFBhc3N3b3JkO1xufSkoX3JlYWN0MltcImRlZmF1bHRcIl0uQ29tcG9uZW50KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfaG9jQXNGb3JtRmllbGQyW1wiZGVmYXVsdFwiXShWYWxpZFBhc3N3b3JkKTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG4vKipcbiAqIFJlYWN0IE1peGluIGZvciBGb3JtIEVsZW1lbnRcbiAqL1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoRmllbGQpIHtcbiAgICB2YXIgc2tpcEJ1ZmZlckNoYW5nZXMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHZhciBGb3JtRmllbGQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICAgICAgX2luaGVyaXRzKEZvcm1GaWVsZCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICAgICAgLy8gcHJvcFR5cGVzOntcbiAgICAgICAgLy8gICAgIGF0dHJpYnV0ZXM6UmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICAvLyAgICAgbmFtZTpSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICBkaXNwbGF5Q29udGV4dDpSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydmb3JtJywgJ2dyaWQnXSksXG4gICAgICAgIC8vICAgICBkaXNhYmxlZDpSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgLy8gICAgIG11bHRpcGxlOlJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICAvLyAgICAgdmFsdWU6UmVhY3QuUHJvcFR5cGVzLmFueSxcbiAgICAgICAgLy8gICAgIG9uQ2hhbmdlOlJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICAvLyAgICAgb25DaGFuZ2VFZGl0TW9kZTpSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLy8gICAgIGJpbmFyeV9jb250ZXh0OlJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIC8vICAgICBlcnJvclRleHQ6UmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICAgICAgICAvLyB9LFxuXG4gICAgICAgIGZ1bmN0aW9uIEZvcm1GaWVsZChwcm9wcykge1xuICAgICAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEZvcm1GaWVsZCk7XG5cbiAgICAgICAgICAgIHByb3BzID0gX2V4dGVuZHMoeyBkaXNwbGF5Q29udGV4dDogJ2Zvcm0nLCBkaXNhYmxlZDogZmFsc2UgfSwgcHJvcHMpO1xuICAgICAgICAgICAgX1JlYWN0JENvbXBvbmVudC5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgZWRpdE1vZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRpcnR5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIEZvcm1GaWVsZC5wcm90b3R5cGUuaXNEaXNwbGF5R3JpZCA9IGZ1bmN0aW9uIGlzRGlzcGxheUdyaWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5kaXNwbGF5Q29udGV4dCA9PT0gJ2dyaWQnO1xuICAgICAgICB9O1xuXG4gICAgICAgIEZvcm1GaWVsZC5wcm90b3R5cGUuaXNEaXNwbGF5Rm9ybSA9IGZ1bmN0aW9uIGlzRGlzcGxheUZvcm0oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5kaXNwbGF5Q29udGV4dCA9PT0gJ2Zvcm0nO1xuICAgICAgICB9O1xuXG4gICAgICAgIEZvcm1GaWVsZC5wcm90b3R5cGUudG9nZ2xlRWRpdE1vZGUgPSBmdW5jdGlvbiB0b2dnbGVFZGl0TW9kZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRGlzcGxheUZvcm0oKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBuZXdTdGF0ZSA9ICF0aGlzLnN0YXRlLmVkaXRNb2RlO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRNb2RlOiBuZXdTdGF0ZSB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlRWRpdE1vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlRWRpdE1vZGUobmV3U3RhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIEZvcm1GaWVsZC5wcm90b3R5cGUuZW50ZXJUb1RvZ2dsZSA9IGZ1bmN0aW9uIGVudGVyVG9Ub2dnbGUoZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgRm9ybUZpZWxkLnByb3RvdHlwZS5idWZmZXJDaGFuZ2VzID0gZnVuY3Rpb24gYnVmZmVyQ2hhbmdlcyhuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlclByb3BzT25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBGb3JtRmllbGQucHJvdG90eXBlLm9uQ2hhbmdlID0gZnVuY3Rpb24gb25DaGFuZ2UoZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRWYWx1ZSA/IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0VmFsdWUoKSA6IGV2ZW50LmN1cnJlbnRUYXJnZXQudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5jaGFuZ2VUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY2hhbmdlVGltZW91dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB2YWx1ZSxcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgICAgICAgICBpZiAoc2tpcEJ1ZmZlckNoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJQcm9wc09uQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBkaXJ0eTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFza2lwQnVmZmVyQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgIHZhciB0aW1lckxlbmd0aCA9IDI1MDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZXJMZW5ndGggPSAxMjAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZVRpbWVvdXQgPSBzZXRUaW1lb3V0KChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyQ2hhbmdlcyhuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcyksIHRpbWVyTGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBGb3JtRmllbGQucHJvdG90eXBlLnRyaWdnZXJQcm9wc09uQ2hhbmdlID0gZnVuY3Rpb24gdHJpZ2dlclByb3BzT25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUsIHsgdHlwZTogdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWyd0eXBlJ10gfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBGb3JtRmllbGQucHJvdG90eXBlLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWUsXG4gICAgICAgICAgICAgICAgZGlydHk6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBGb3JtRmllbGQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChGaWVsZCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHRoaXMuc3RhdGUsIHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLm9uQ2hhbmdlKGUsIHYpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdG9nZ2xlRWRpdE1vZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnRvZ2dsZUVkaXRNb2RlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbnRlclRvVG9nZ2xlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZW50ZXJUb1RvZ2dsZShlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzRGlzcGxheUdyaWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmlzRGlzcGxheUdyaWQoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzRGlzcGxheUZvcm06IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmlzRGlzcGxheUZvcm0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIEZvcm1GaWVsZDtcbiAgICB9KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuICAgIHJldHVybiBGb3JtRmllbGQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIENvbXBvbmVudCA9IF9yZXF1aXJlLkNvbXBvbmVudDtcblxudmFyIF9yZXF1aXJlJHJlcXVpcmVMaWIgPSByZXF1aXJlKCdweWRpbycpLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIFB5ZGlvQ29udGV4dENvbnN1bWVyID0gX3JlcXVpcmUkcmVxdWlyZUxpYi5QeWRpb0NvbnRleHRDb25zdW1lcjtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKFB5ZGlvQ29tcG9uZW50KSB7XG4gICAgdmFyIEZpZWxkV2l0aENob2ljZXMgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICAgICAgX2luaGVyaXRzKEZpZWxkV2l0aENob2ljZXMsIF9Db21wb25lbnQpO1xuXG4gICAgICAgIEZpZWxkV2l0aENob2ljZXMucHJvdG90eXBlLmxvYWRFeHRlcm5hbFZhbHVlcyA9IGZ1bmN0aW9uIGxvYWRFeHRlcm5hbFZhbHVlcyhjaG9pY2VzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgcHlkaW8gPSB0aGlzLnByb3BzLnB5ZGlvO1xuXG4gICAgICAgICAgICB2YXIgcGFyc2VkID0gdHJ1ZTtcblxuICAgICAgICAgICAgdmFyIGxpc3RfYWN0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGNob2ljZXMgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkNob2ljZXNMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNob2ljZXNMb2FkZWQoY2hvaWNlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGNob2ljZXM6IGNob2ljZXMsIHBhcnNlZDogcGFyc2VkIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBpZiAoY2hvaWNlcy5pbmRleE9mKCdqc29uX2ZpbGU6JykgPT09IDApIHtcbiAgICAgICAgICAgICAgICBwYXJzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsaXN0X2FjdGlvbiA9IGNob2ljZXMucmVwbGFjZSgnanNvbl9maWxlOicsICcnKTtcbiAgICAgICAgICAgICAgICBvdXRwdXQuc2V0KCcwJywgcHlkaW8uTWVzc2FnZUhhc2hbJ2FqeHBfYWRtaW4uaG9tZS42J10pO1xuICAgICAgICAgICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLmxvYWRGaWxlKGxpc3RfYWN0aW9uLCBmdW5jdGlvbiAodHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdPdXRwdXQgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc3BvcnQucmVzcG9uc2VKU09OKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnQucmVzcG9uc2VKU09OLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T3V0cHV0LnNldChlbnRyeS5rZXksIGVudHJ5LmxhYmVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRyYW5zcG9ydC5yZXNwb25zZVRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZSh0cmFuc3BvcnQucmVzcG9uc2VUZXh0KS5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdPdXRwdXQuc2V0KGVudHJ5LmtleSwgZW50cnkubGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGlsZSBwYXJzaW5nIGxpc3QgJyArIGNob2ljZXMsIGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgY2hvaWNlczogbmV3T3V0cHV0IH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5vbkNob2ljZXNMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbkNob2ljZXNMb2FkZWQobmV3T3V0cHV0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNob2ljZXMgPT09IFwiUFlESU9fQVZBSUxBQkxFX0xBTkdVQUdFU1wiKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8ubGlzdExhbmd1YWdlc1dpdGhDYWxsYmFjayhmdW5jdGlvbiAoa2V5LCBsYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuc2V0KGtleSwgbGFiZWwpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uQ2hvaWNlc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ2hvaWNlc0xvYWRlZChvdXRwdXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hvaWNlcyA9PT0gXCJQWURJT19BVkFJTEFCTEVfUkVQT1NJVE9SSUVTXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAocHlkaW8udXNlcikge1xuICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNvcnRlciA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhZ2VzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpby51c2VyLnJlcG9zaXRvcmllcy5mb3JFYWNoKGZ1bmN0aW9uIChyZXBvc2l0b3J5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcG9zaXRvcnkuZ2V0SWQoKSA9PT0gJ3NldHRpbmdzJyB8fCByZXBvc2l0b3J5LmdldElkKCkgPT09ICdob21lcGFnZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZXMucHVzaCh7IGlkOiByZXBvc2l0b3J5LmdldElkKCksIGxhYmVsOiAnWycgKyBweWRpby5NZXNzYWdlSGFzaFsnMzMxJ10gKyAnXSAnICsgcmVwb3NpdG9yeS5nZXRMYWJlbCgpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVwb3NpdG9yeS5nZXRSZXBvc2l0b3J5VHlwZSgpICE9PSBcImNlbGxcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3J0ZXIucHVzaCh7IGlkOiByZXBvc2l0b3J5LmdldElkKCksIGxhYmVsOiByZXBvc2l0b3J5LmdldExhYmVsKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0ZXIuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhLmxhYmVsLmxvY2FsZUNvbXBhcmUoYi5sYWJlbCwgdW5kZWZpbmVkLCB7IG51bWVyaWM6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRlci5wdXNoLmFwcGx5KHNvcnRlciwgcGFnZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGVyLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0LnNldChkLmlkLCBkLmxhYmVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbkNob2ljZXNMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNob2ljZXNMb2FkZWQob3V0cHV0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFBhcnNlIHN0cmluZyBhbmQgcmV0dXJuIG1hcFxuICAgICAgICAgICAgICAgIGNob2ljZXMuc3BsaXQoXCIsXCIpLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IGNob2ljZS5zcGxpdCgnfCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGxbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGxbMV07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGxhYmVsID0gY2hvaWNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChweWRpby5NZXNzYWdlSGFzaFtsYWJlbF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gcHlkaW8uTWVzc2FnZUhhc2hbbGFiZWxdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5zZXQodmFsdWUsIGxhYmVsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IGNob2ljZXM6IG91dHB1dCwgcGFyc2VkOiBwYXJzZWQgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBGaWVsZFdpdGhDaG9pY2VzKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRmllbGRXaXRoQ2hvaWNlcyk7XG5cbiAgICAgICAgICAgIF9Db21wb25lbnQuY2FsbCh0aGlzLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICB2YXIgY2hvaWNlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGNob2ljZXMuc2V0KCcwJywgdGhpcy5wcm9wcy5weWRpbyA/IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJ2FqeHBfYWRtaW4uaG9tZS42J10gOiAnIC4uLiAnKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB7IGNob2ljZXM6IGNob2ljZXMsIGNob2ljZXNQYXJzZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cblxuICAgICAgICBGaWVsZFdpdGhDaG9pY2VzLnByb3RvdHlwZS5jb21wb25lbnREaWRNb3VudCA9IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9sb2FkRXh0ZXJuYWxWYWx1ZXMgPSB0aGlzLmxvYWRFeHRlcm5hbFZhbHVlcyh0aGlzLnByb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hvaWNlcyA9IF9sb2FkRXh0ZXJuYWxWYWx1ZXMuY2hvaWNlcztcbiAgICAgICAgICAgICAgICB2YXIgcGFyc2VkID0gX2xvYWRFeHRlcm5hbFZhbHVlcy5wYXJzZWQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY2hvaWNlczogY2hvaWNlcywgY2hvaWNlc1BhcnNlZDogcGFyc2VkIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIEZpZWxkV2l0aENob2ljZXMucHJvdG90eXBlLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgPSBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgICAgICBpZiAobmV3UHJvcHMuYXR0cmlidXRlc1snY2hvaWNlcyddICYmIG5ld1Byb3BzLmF0dHJpYnV0ZXNbJ2Nob2ljZXMnXSAhPT0gdGhpcy5wcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10pIHtcbiAgICAgICAgICAgICAgICB2YXIgX2xvYWRFeHRlcm5hbFZhbHVlczIgPSB0aGlzLmxvYWRFeHRlcm5hbFZhbHVlcyhuZXdQcm9wcy5hdHRyaWJ1dGVzWydjaG9pY2VzJ10pO1xuXG4gICAgICAgICAgICAgICAgdmFyIGNob2ljZXMgPSBfbG9hZEV4dGVybmFsVmFsdWVzMi5jaG9pY2VzO1xuICAgICAgICAgICAgICAgIHZhciBwYXJzZWQgPSBfbG9hZEV4dGVybmFsVmFsdWVzMi5wYXJzZWQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlczogY2hvaWNlcyxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlc1BhcnNlZDogcGFyc2VkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgRmllbGRXaXRoQ2hvaWNlcy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHlkaW9Db21wb25lbnQsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB0aGlzLnN0YXRlKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIEZpZWxkV2l0aENob2ljZXM7XG4gICAgfSkoQ29tcG9uZW50KTtcblxuICAgIHJldHVybiBQeWRpb0NvbnRleHRDb25zdW1lcihGaWVsZFdpdGhDaG9pY2VzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9tYW5hZ2VyTWFuYWdlciA9IHJlcXVpcmUoJy4vbWFuYWdlci9NYW5hZ2VyJyk7XG5cbnZhciBfbWFuYWdlck1hbmFnZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFuYWdlck1hbmFnZXIpO1xuXG52YXIgX2ZpZWxkc1RleHRGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGRzL1RleHRGaWVsZCcpO1xuXG52YXIgX2ZpZWxkc1RleHRGaWVsZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNUZXh0RmllbGQpO1xuXG52YXIgX2ZpZWxkc1ZhbGlkUGFzc3dvcmQgPSByZXF1aXJlKCcuL2ZpZWxkcy9WYWxpZFBhc3N3b3JkJyk7XG5cbnZhciBfZmllbGRzVmFsaWRQYXNzd29yZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNWYWxpZFBhc3N3b3JkKTtcblxudmFyIF9maWVsZHNJbnB1dEludGVnZXIgPSByZXF1aXJlKCcuL2ZpZWxkcy9JbnB1dEludGVnZXInKTtcblxudmFyIF9maWVsZHNJbnB1dEludGVnZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRJbnRlZ2VyKTtcblxudmFyIF9maWVsZHNJbnB1dEJvb2xlYW4gPSByZXF1aXJlKCcuL2ZpZWxkcy9JbnB1dEJvb2xlYW4nKTtcblxudmFyIF9maWVsZHNJbnB1dEJvb2xlYW4yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRCb29sZWFuKTtcblxudmFyIF9maWVsZHNJbnB1dFNlbGVjdEJveCA9IHJlcXVpcmUoJy4vZmllbGRzL0lucHV0U2VsZWN0Qm94Jyk7XG5cbnZhciBfZmllbGRzSW5wdXRTZWxlY3RCb3gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRTZWxlY3RCb3gpO1xuXG52YXIgX2ZpZWxkc0F1dG9jb21wbGV0ZUJveCA9IHJlcXVpcmUoJy4vZmllbGRzL0F1dG9jb21wbGV0ZUJveCcpO1xuXG52YXIgX2ZpZWxkc0F1dG9jb21wbGV0ZUJveDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNBdXRvY29tcGxldGVCb3gpO1xuXG52YXIgX2ZpZWxkc0lucHV0SW1hZ2UgPSByZXF1aXJlKCcuL2ZpZWxkcy9JbnB1dEltYWdlJyk7XG5cbnZhciBfZmllbGRzSW5wdXRJbWFnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNJbnB1dEltYWdlKTtcblxudmFyIF9wYW5lbEZvcm1QYW5lbCA9IHJlcXVpcmUoJy4vcGFuZWwvRm9ybVBhbmVsJyk7XG5cbnZhciBfcGFuZWxGb3JtUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcGFuZWxGb3JtUGFuZWwpO1xuXG52YXIgX3BhbmVsRm9ybUhlbHBlciA9IHJlcXVpcmUoJy4vcGFuZWwvRm9ybUhlbHBlcicpO1xuXG52YXIgX3BhbmVsRm9ybUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYW5lbEZvcm1IZWxwZXIpO1xuXG52YXIgX2ZpZWxkc0ZpbGVEcm9wem9uZSA9IHJlcXVpcmUoJy4vZmllbGRzL0ZpbGVEcm9wem9uZScpO1xuXG52YXIgX2ZpZWxkc0ZpbGVEcm9wem9uZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNGaWxlRHJvcHpvbmUpO1xuXG52YXIgX2ZpZWxkc0F1dG9jb21wbGV0ZVRyZWUgPSByZXF1aXJlKCcuL2ZpZWxkcy9BdXRvY29tcGxldGVUcmVlJyk7XG5cbnZhciBfZmllbGRzQXV0b2NvbXBsZXRlVHJlZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNBdXRvY29tcGxldGVUcmVlKTtcblxudmFyIFB5ZGlvRm9ybSA9IHtcblxuICBNYW5hZ2VyOiBfbWFuYWdlck1hbmFnZXIyWydkZWZhdWx0J10sXG4gIElucHV0VGV4dDogX2ZpZWxkc1RleHRGaWVsZDJbJ2RlZmF1bHQnXSxcbiAgVmFsaWRQYXNzd29yZDogX2ZpZWxkc1ZhbGlkUGFzc3dvcmQyWydkZWZhdWx0J10sXG4gIElucHV0Qm9vbGVhbjogX2ZpZWxkc0lucHV0Qm9vbGVhbjJbJ2RlZmF1bHQnXSxcbiAgSW5wdXRJbnRlZ2VyOiBfZmllbGRzSW5wdXRJbnRlZ2VyMlsnZGVmYXVsdCddLFxuICBJbnB1dFNlbGVjdEJveDogX2ZpZWxkc0lucHV0U2VsZWN0Qm94MlsnZGVmYXVsdCddLFxuICBBdXRvY29tcGxldGVCb3g6IF9maWVsZHNBdXRvY29tcGxldGVCb3gyWydkZWZhdWx0J10sXG4gIEF1dG9jb21wbGV0ZVRyZWU6IF9maWVsZHNBdXRvY29tcGxldGVUcmVlMlsnZGVmYXVsdCddLFxuICBJbnB1dEltYWdlOiBfZmllbGRzSW5wdXRJbWFnZTJbJ2RlZmF1bHQnXSxcbiAgRm9ybVBhbmVsOiBfcGFuZWxGb3JtUGFuZWwyWydkZWZhdWx0J10sXG4gIFB5ZGlvSGVscGVyOiBfcGFuZWxGb3JtSGVscGVyMlsnZGVmYXVsdCddLFxuICBGaWxlRHJvcFpvbmU6IF9maWVsZHNGaWxlRHJvcHpvbmUyWydkZWZhdWx0J10sXG4gIGNyZWF0ZUZvcm1FbGVtZW50OiBfbWFuYWdlck1hbmFnZXIyWydkZWZhdWx0J10uY3JlYXRlRm9ybUVsZW1lbnRcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB5ZGlvRm9ybTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9maWVsZHNWYWxpZExvZ2luID0gcmVxdWlyZSgnLi4vZmllbGRzL1ZhbGlkTG9naW4nKTtcblxudmFyIF9maWVsZHNWYWxpZExvZ2luMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2ZpZWxkc1ZhbGlkTG9naW4pO1xuXG52YXIgX2ZpZWxkc0FsdFRleHQgPSByZXF1aXJlKFwiLi4vZmllbGRzL0FsdFRleHRcIik7XG5cbnZhciBfZmllbGRzQWx0VGV4dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9maWVsZHNBbHRUZXh0KTtcblxudmFyIFhNTFV0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC94bWwnKTtcbnZhciBJbnB1dEJvb2xlYW4gPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9JbnB1dEJvb2xlYW4nKTtcbnZhciBJbnB1dFRleHQgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9UZXh0RmllbGQnKTtcbnZhciBWYWxpZFBhc3N3b3JkID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvVmFsaWRQYXNzd29yZCcpO1xudmFyIElucHV0SW50ZWdlciA9IHJlcXVpcmUoJy4vLi4vZmllbGRzL0lucHV0SW50ZWdlcicpO1xudmFyIElucHV0SW1hZ2UgPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9JbnB1dEltYWdlJyk7XG52YXIgU2VsZWN0Qm94ID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvSW5wdXRTZWxlY3RCb3gnKTtcbnZhciBBdXRvY29tcGxldGVCb3ggPSByZXF1aXJlKCcuLy4uL2ZpZWxkcy9BdXRvY29tcGxldGVCb3gnKTtcbnZhciBBdXRvY29tcGxldGVUcmVlID0gcmVxdWlyZSgnLi8uLi9maWVsZHMvQXV0b2NvbXBsZXRlVHJlZScpO1xuXG4vKipcbiAqIFV0aWxpdHkgY2xhc3MgdG8gcGFyc2UgLyBoYW5kbGUgcHlkaW8gc3RhbmRhcmQgZm9ybSBkZWZpbml0aW9ucy92YWx1ZXMuXG4gKi9cblxudmFyIE1hbmFnZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE1hbmFnZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNYW5hZ2VyKTtcbiAgICB9XG5cbiAgICBNYW5hZ2VyLmhhc0hlbHBlciA9IGZ1bmN0aW9uIGhhc0hlbHBlcihwbHVnaW5JZCwgcGFyYW1OYW1lKSB7XG5cbiAgICAgICAgdmFyIGhlbHBlcnMgPSBNYW5hZ2VyLmdldEhlbHBlcnNDYWNoZSgpO1xuICAgICAgICByZXR1cm4gaGVscGVyc1twbHVnaW5JZF0gJiYgaGVscGVyc1twbHVnaW5JZF1bJ3BhcmFtZXRlcnMnXVtwYXJhbU5hbWVdO1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLmdldEhlbHBlcnNDYWNoZSA9IGZ1bmN0aW9uIGdldEhlbHBlcnNDYWNoZSgpIHtcbiAgICAgICAgaWYgKCFNYW5hZ2VyLkhFTFBFUlNfQ0FDSEUpIHtcbiAgICAgICAgICAgIHZhciBoZWxwZXJDYWNoZSA9IHt9O1xuICAgICAgICAgICAgdmFyIGhlbHBlcnMgPSBYTUxVdGlscy5YUGF0aFNlbGVjdE5vZGVzKHdpbmRvdy5weWRpby5SZWdpc3RyeS5nZXRYTUwoKSwgJ3BsdWdpbnMvKi9jbGllbnRfc2V0dGluZ3MvcmVzb3VyY2VzL2pzW0B0eXBlPVwiaGVscGVyXCJdJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhlbHBlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaGVscGVyTm9kZSA9IGhlbHBlcnNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHBsdWdpbiA9IGhlbHBlck5vZGUuZ2V0QXR0cmlidXRlKFwicGx1Z2luXCIpO1xuICAgICAgICAgICAgICAgIGhlbHBlckNhY2hlW3BsdWdpbl0gPSB7IG5hbWVzcGFjZTogaGVscGVyTm9kZS5nZXRBdHRyaWJ1dGUoJ2NsYXNzTmFtZScpLCBwYXJhbWV0ZXJzOiB7fSB9O1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbU5vZGVzID0gWE1MVXRpbHMuWFBhdGhTZWxlY3ROb2RlcyhoZWxwZXJOb2RlLCAncGFyYW1ldGVyJyk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBwYXJhbU5vZGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbU5vZGUgPSBwYXJhbU5vZGVzW2tdO1xuICAgICAgICAgICAgICAgICAgICBoZWxwZXJDYWNoZVtwbHVnaW5dWydwYXJhbWV0ZXJzJ11bcGFyYW1Ob2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWFuYWdlci5IRUxQRVJTX0NBQ0hFID0gaGVscGVyQ2FjaGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hbmFnZXIuSEVMUEVSU19DQUNIRTtcbiAgICB9O1xuXG4gICAgTWFuYWdlci5wYXJzZVBhcmFtZXRlcnMgPSBmdW5jdGlvbiBwYXJzZVBhcmFtZXRlcnMoeG1sRG9jdW1lbnQsIHF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiBYTUxVdGlscy5YUGF0aFNlbGVjdE5vZGVzKHhtbERvY3VtZW50LCBxdWVyeSkubWFwKChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIE1hbmFnZXIucGFyYW1ldGVyTm9kZVRvSGFzaChub2RlKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIE1hbmFnZXIucGFyYW1ldGVyTm9kZVRvSGFzaCA9IGZ1bmN0aW9uIHBhcmFtZXRlck5vZGVUb0hhc2gocGFyYW1Ob2RlKSB7XG4gICAgICAgIHZhciBwYXJhbXNBdHRzID0gcGFyYW1Ob2RlLmF0dHJpYnV0ZXM7XG4gICAgICAgIHZhciBwYXJhbXNPYmplY3QgPSB7fTtcbiAgICAgICAgaWYgKHBhcmFtTm9kZS5wYXJlbnROb2RlICYmIHBhcmFtTm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUgJiYgcGFyYW1Ob2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIHBhcmFtc09iamVjdFtcInBsdWdpbklkXCJdID0gcGFyYW1Ob2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29sbGVjdENkYXRhID0gZmFsc2U7XG4gICAgICAgIHZhciBNZXNzYWdlSGFzaCA9IGdsb2JhbC5weWRpby5NZXNzYWdlSGFzaDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmFtc0F0dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhdHROYW1lID0gcGFyYW1zQXR0cy5pdGVtKGkpLm5vZGVOYW1lO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gcGFyYW1zQXR0cy5pdGVtKGkpLnZhbHVlO1xuICAgICAgICAgICAgaWYgKChhdHROYW1lID09PSBcImxhYmVsXCIgfHwgYXR0TmFtZSA9PT0gXCJkZXNjcmlwdGlvblwiIHx8IGF0dE5hbWUgPT09IFwiZ3JvdXBcIiB8fCBhdHROYW1lLmluZGV4T2YoXCJncm91cF9zd2l0Y2hfXCIpID09PSAwKSAmJiBNZXNzYWdlSGFzaFt2YWx1ZV0pIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IE1lc3NhZ2VIYXNoW3ZhbHVlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhdHROYW1lID09PSBcImNkYXRhdmFsdWVcIikge1xuICAgICAgICAgICAgICAgIGNvbGxlY3RDZGF0YSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJhbXNPYmplY3RbYXR0TmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sbGVjdENkYXRhKSB7XG4gICAgICAgICAgICBwYXJhbXNPYmplY3RbJ3ZhbHVlJ10gPSBwYXJhbU5vZGUuZmlyc3RDaGlsZC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zT2JqZWN0Wyd0eXBlJ10gPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsndmFsdWUnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zT2JqZWN0Wyd2YWx1ZSddID0gcGFyYW1zT2JqZWN0Wyd2YWx1ZSddID09PSBcInRydWVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zT2JqZWN0WydkZWZhdWx0J10gPSBwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zT2JqZWN0Wyd0eXBlJ10gPT09ICdpbnRlZ2VyJykge1xuICAgICAgICAgICAgaWYgKHBhcmFtc09iamVjdFsndmFsdWUnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zT2JqZWN0Wyd2YWx1ZSddID0gcGFyc2VJbnQocGFyYW1zT2JqZWN0Wyd2YWx1ZSddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zT2JqZWN0WydkZWZhdWx0J10gPSBwYXJzZUludChwYXJhbXNPYmplY3RbJ2RlZmF1bHQnXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcmFtc09iamVjdDtcbiAgICB9O1xuXG4gICAgTWFuYWdlci5jcmVhdGVGb3JtRWxlbWVudCA9IGZ1bmN0aW9uIGNyZWF0ZUZvcm1FbGVtZW50KHByb3BzKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBwcm9wcy5hdHRyaWJ1dGVzO1xuICAgICAgICB2YXIgb25BbHRUZXh0U3dpdGNoID0gcHJvcHMub25BbHRUZXh0U3dpdGNoO1xuICAgICAgICB2YXIgYWx0VGV4dFN3aXRjaEljb24gPSBwcm9wcy5hbHRUZXh0U3dpdGNoSWNvbjtcbiAgICAgICAgdmFyIGFsdFRleHRTd2l0Y2hUaXAgPSBwcm9wcy5hbHRUZXh0U3dpdGNoVGlwO1xuXG4gICAgICAgIHZhciBzd2l0Y2hQcm9wcyA9IHsgb25BbHRUZXh0U3dpdGNoOiBvbkFsdFRleHRTd2l0Y2gsIGFsdFRpcDogYWx0VGV4dFN3aXRjaFRpcCwgYWx0SWNvblRleHQ6IGFsdFRleHRTd2l0Y2hJY29uIH07XG4gICAgICAgIHN3aXRjaCAoYXR0cmlidXRlc1sndHlwZSddKSB7XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KElucHV0Qm9vbGVhbiwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGlmIChvbkFsdFRleHRTd2l0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9maWVsZHNBbHRUZXh0MlsnZGVmYXVsdCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2V4dGVuZHMoe30sIHByb3BzLCBzd2l0Y2hQcm9wcywgeyBhbHRJY29uOiBcIm1kaSBtZGktdG9nZ2xlLXN3aXRjaFwiIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgY2FzZSAndGV4dGFyZWEnOlxuICAgICAgICAgICAgY2FzZSAncGFzc3dvcmQnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoSW5wdXRUZXh0LCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2YWxpZC1wYXNzd29yZCc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChWYWxpZFBhc3N3b3JkLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2YWxpZC1sb2dpbic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfZmllbGRzVmFsaWRMb2dpbjJbJ2RlZmF1bHQnXSwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW50ZWdlcic6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChJbnB1dEludGVnZXIsIHByb3BzKTtcbiAgICAgICAgICAgICAgICBpZiAob25BbHRUZXh0U3dpdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfZmllbGRzQWx0VGV4dDJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9leHRlbmRzKHt9LCBwcm9wcywgc3dpdGNoUHJvcHMsIHsgYWx0SWNvbjogXCJtZGkgbWRpLW51bWJlclwiIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbWFnZSc6XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChJbnB1dEltYWdlLCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU2VsZWN0Qm94LCBwcm9wcyk7XG4gICAgICAgICAgICAgICAgaWYgKG9uQWx0VGV4dFN3aXRjaCkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX2ZpZWxkc0FsdFRleHQyWydkZWZhdWx0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICBfZXh0ZW5kcyh7fSwgcHJvcHMsIHN3aXRjaFByb3BzLCB7IGFsdEljb246IFwibWRpIG1kaS12aWV3LWxpc3RcIiB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXV0b2NvbXBsZXRlJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEF1dG9jb21wbGV0ZUJveCwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYXV0b2NvbXBsZXRlLXRyZWUnOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoQXV0b2NvbXBsZXRlVHJlZSwgcHJvcHMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVnZW5kJzpcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdoaWRkZW4nOlxuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcHJvcHMudmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncGFyYW1WYWx1ZS1lbXB0eScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdFbXB0eSdcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG5cbiAgICBNYW5hZ2VyLlNsYXNoZXNUb0pzb24gPSBmdW5jdGlvbiBTbGFzaGVzVG9Kc29uKHZhbHVlcykge1xuICAgICAgICBpZiAodmFsdWVzID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHZhbHVlcyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld1ZhbHVlcyA9IHt9O1xuICAgICAgICB2YXIgcmVjdXJzZU9uS2V5cyA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyh2YWx1ZXMpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gdmFsdWVzW2tdO1xuICAgICAgICAgICAgaWYgKGsuaW5kZXhPZignLycpID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IGsuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICB2YXIgZmlyc3RQYXJ0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdFBhcnQgPSBwYXJ0cy5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdWYWx1ZXNbZmlyc3RQYXJ0XSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNbZmlyc3RQYXJ0XSA9IHt9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5ld1ZhbHVlc1tmaXJzdFBhcnRdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZXNbZmlyc3RQYXJ0XSA9IHsgJ0B2YWx1ZSc6IG5ld1ZhbHVlc1tmaXJzdFBhcnRdIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1tmaXJzdFBhcnRdW2xhc3RQYXJ0XSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgcmVjdXJzZU9uS2V5c1tmaXJzdFBhcnRdID0gZmlyc3RQYXJ0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVzW2tdICYmIHR5cGVvZiBuZXdWYWx1ZXNba10gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1trXVsnQHZhbHVlJ10gPSBkYXRhO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1trXSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmtleXMocmVjdXJzZU9uS2V5cykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlc1trZXldID0gTWFuYWdlci5TbGFzaGVzVG9Kc29uKG5ld1ZhbHVlc1trZXldKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZXM7XG4gICAgfTtcblxuICAgIE1hbmFnZXIuSnNvblRvU2xhc2hlcyA9IGZ1bmN0aW9uIEpzb25Ub1NsYXNoZXModmFsdWVzKSB7XG4gICAgICAgIHZhciBwcmVmaXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICB2YXIgbmV3VmFsdWVzID0ge307XG4gICAgICAgIE9iamVjdC5rZXlzKHZhbHVlcykuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXNba10gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YlZhbHVlcyA9IE1hbmFnZXIuSnNvblRvU2xhc2hlcyh2YWx1ZXNba10sIHByZWZpeCArIGsgKyAnLycpO1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlcyA9IF9leHRlbmRzKHt9LCBuZXdWYWx1ZXMsIHN1YlZhbHVlcyk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlc1trXVsnQHZhbHVlJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVzW3ByZWZpeCArIGtdID0gdmFsdWVzW2tdWydAdmFsdWUnXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlc1twcmVmaXggKyBrXSA9IHZhbHVlc1trXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogRXh0cmFjdCBQT1NULXJlYWR5IHZhbHVlcyBmcm9tIGEgY29tYm8gcGFyYW1ldGVycy92YWx1ZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkZWZpbml0aW9ucyBBcnJheSBTdGFuZGFyZCBGb3JtIERlZmluaXRpb24gYXJyYXlcbiAgICAgKiBAcGFyYW0gdmFsdWVzIE9iamVjdCBLZXkvVmFsdWVzIG9mIHRoZSBjdXJyZW50IGZvcm1cbiAgICAgKiBAcGFyYW0gcHJlZml4IFN0cmluZyBPcHRpb25hbCBwcmVmaXggdG8gYWRkIHRvIGFsbCBwYXJhbWV0ZXJzIChieSBkZWZhdWx0IERSSVZFUl9PUFRJT05fKS5cbiAgICAgKiBAcmV0dXJucyBPYmplY3QgT2JqZWN0IHdpdGggYWxsIHB5ZGlvLWNvbXBhdGlibGUgUE9TVCBwYXJhbWV0ZXJzXG4gICAgICovXG5cbiAgICBNYW5hZ2VyLmdldFZhbHVlc0ZvclBPU1QgPSBmdW5jdGlvbiBnZXRWYWx1ZXNGb3JQT1NUKGRlZmluaXRpb25zLCB2YWx1ZXMpIHtcbiAgICAgICAgdmFyIHByZWZpeCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/ICdEUklWRVJfT1BUSU9OXycgOiBhcmd1bWVudHNbMl07XG4gICAgICAgIHZhciBhZGRpdGlvbmFsTWV0YWRhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzNdO1xuXG4gICAgICAgIHZhciBjbGllbnRQYXJhbXMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHVlcykge1xuICAgICAgICAgICAgaWYgKHZhbHVlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgY2xpZW50UGFyYW1zW3ByZWZpeCArIGtleV0gPSB2YWx1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICB2YXIgZGVmVHlwZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZCA9IDA7IGQgPCBkZWZpbml0aW9ucy5sZW5ndGg7IGQrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmaW5pdGlvbnNbZF1bJ25hbWUnXSA9PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZlR5cGUgPSBkZWZpbml0aW9uc1tkXVsndHlwZSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFkZWZUeXBlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnRzID0ga2V5LnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXN0LCBwcmV2O1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCA9IHBhcnRzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldiA9IHBhcnRzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZGVmaW5pdGlvbnMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVmaW5pdGlvbnNba11bJ25hbWUnXSA9PSBsYXN0ICYmIGRlZmluaXRpb25zW2tdWydncm91cF9zd2l0Y2hfbmFtZSddICYmIGRlZmluaXRpb25zW2tdWydncm91cF9zd2l0Y2hfbmFtZSddID09IHByZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmVHlwZSA9IGRlZmluaXRpb25zW2tdWyd0eXBlJ107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlZmluaXRpb25zW2tdWyduYW1lJ10gPT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZlR5cGUgPSBkZWZpbml0aW9uc1trXVsndHlwZSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9kZWZpbml0aW9ucy5tYXAoZnVuY3Rpb24oZCl7aWYoZC5uYW1lID09IHRoZUtleSkgZGVmVHlwZSA9IGQudHlwZX0pO1xuICAgICAgICAgICAgICAgIGlmIChkZWZUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWZUeXBlID09IFwiaW1hZ2VcIikgZGVmVHlwZSA9IFwiYmluYXJ5XCI7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtc1twcmVmaXggKyBrZXkgKyAnX2FqeHB0eXBlJ10gPSBkZWZUeXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYWRkaXRpb25hbE1ldGFkYXRhICYmIGFkZGl0aW9uYWxNZXRhZGF0YVtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIG1ldGEgaW4gYWRkaXRpb25hbE1ldGFkYXRhW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhZGRpdGlvbmFsTWV0YWRhdGFba2V5XS5oYXNPd25Qcm9wZXJ0eShtZXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtc1twcmVmaXggKyBrZXkgKyAnXycgKyBtZXRhXSA9IGFkZGl0aW9uYWxNZXRhZGF0YVtrZXldW21ldGFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVvcmRlciB0cmVlIGtleXNcbiAgICAgICAgdmFyIGFsbEtleXMgPSBPYmplY3Qua2V5cyhjbGllbnRQYXJhbXMpO1xuICAgICAgICBhbGxLZXlzLnNvcnQoKTtcbiAgICAgICAgYWxsS2V5cy5yZXZlcnNlKCk7XG4gICAgICAgIHZhciB0cmVlS2V5cyA9IHt9O1xuICAgICAgICBhbGxLZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoXCIvXCIpID09PSAtMSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGtleS5lbmRzV2l0aChcIl9hanhwdHlwZVwiKSkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHR5cGVLZXkgPSBrZXkgKyBcIl9hanhwdHlwZVwiO1xuICAgICAgICAgICAgdmFyIHBhcnRzID0ga2V5LnNwbGl0KFwiL1wiKTtcbiAgICAgICAgICAgIHZhciBwYXJlbnROYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciBwYXJlbnRLZXk7XG4gICAgICAgICAgICB3aGlsZSAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghcGFyZW50S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleSA9IHRyZWVLZXlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXBhcmVudEtleVtwYXJlbnROYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV0gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFyZW50S2V5ID0gcGFyZW50S2V5W3BhcmVudE5hbWVdO1xuICAgICAgICAgICAgICAgIHBhcmVudE5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHR5cGUgPSBjbGllbnRQYXJhbXNbdHlwZUtleV07XG4gICAgICAgICAgICBkZWxldGUgY2xpZW50UGFyYW1zW3R5cGVLZXldO1xuICAgICAgICAgICAgaWYgKHBhcmVudEtleSAmJiAhcGFyZW50S2V5W3BhcmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHYgPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdID0gdiA9PSBcInRydWVcIiB8fCB2ID09IDEgfHwgdiA9PT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJpbnRlZ2VyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50S2V5W3BhcmVudE5hbWVdID0gcGFyc2VJbnQoY2xpZW50UGFyYW1zW2tleV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSAmJiB0eXBlLnN0YXJ0c1dpdGgoXCJncm91cF9zd2l0Y2g6XCIpICYmIHR5cGVvZiBjbGllbnRQYXJhbXNba2V5XSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXSA9IHsgZ3JvdXBfc3dpdGNoX3ZhbHVlOiBjbGllbnRQYXJhbXNba2V5XSB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEtleVtwYXJlbnROYW1lXSA9IGNsaWVudFBhcmFtc1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyZW50S2V5ICYmIHR5cGUgJiYgdHlwZS5zdGFydHNXaXRoKCdncm91cF9zd2l0Y2g6JykpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnRLZXlbcGFyZW50TmFtZV1bXCJncm91cF9zd2l0Y2hfdmFsdWVcIl0gPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAoa2V5IGluIHRyZWVLZXlzKSB7XG4gICAgICAgICAgICBpZiAoIXRyZWVLZXlzLmhhc093blByb3BlcnR5KGtleSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgdmFyIHRyZWVWYWx1ZSA9IHRyZWVLZXlzW2tleV07XG4gICAgICAgICAgICBpZiAoY2xpZW50UGFyYW1zW2tleSArICdfYWp4cHR5cGUnXSAmJiBjbGllbnRQYXJhbXNba2V5ICsgJ19hanhwdHlwZSddLmluZGV4T2YoJ2dyb3VwX3N3aXRjaDonKSA9PT0gMCAmJiAhdHJlZVZhbHVlWydncm91cF9zd2l0Y2hfdmFsdWUnXSkge1xuICAgICAgICAgICAgICAgIHRyZWVWYWx1ZVsnZ3JvdXBfc3dpdGNoX3ZhbHVlJ10gPSBjbGllbnRQYXJhbXNba2V5XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xpZW50UGFyYW1zW2tleV0gPSBKU09OLnN0cmluZ2lmeSh0cmVlVmFsdWUpO1xuICAgICAgICAgICAgY2xpZW50UGFyYW1zW2tleSArICdfYWp4cHR5cGUnXSA9IFwidGV4dC9qc29uXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhbiBYWFhfZ3JvdXBfc3dpdGNoIHBhcmFtZXRlcnNcbiAgICAgICAgZm9yICh2YXIgdGhlS2V5IGluIGNsaWVudFBhcmFtcykge1xuICAgICAgICAgICAgaWYgKCFjbGllbnRQYXJhbXMuaGFzT3duUHJvcGVydHkodGhlS2V5KSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGlmICh0aGVLZXkuaW5kZXhPZihcIi9cIikgPT0gLTEgJiYgY2xpZW50UGFyYW1zW3RoZUtleV0gJiYgY2xpZW50UGFyYW1zW3RoZUtleSArIFwiX2FqeHB0eXBlXCJdICYmIGNsaWVudFBhcmFtc1t0aGVLZXkgKyBcIl9hanhwdHlwZVwiXS5zdGFydHNXaXRoKFwiZ3JvdXBfc3dpdGNoOlwiKSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2xpZW50UGFyYW1zW3RoZUtleV0gPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICBjbGllbnRQYXJhbXNbdGhlS2V5XSA9IEpTT04uc3RyaW5naWZ5KHsgZ3JvdXBfc3dpdGNoX3ZhbHVlOiBjbGllbnRQYXJhbXNbdGhlS2V5XSB9KTtcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50UGFyYW1zW3RoZUtleSArIFwiX2FqeHB0eXBlXCJdID0gXCJ0ZXh0L2pzb25cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2xpZW50UGFyYW1zLmhhc093blByb3BlcnR5KHRoZUtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhlS2V5LmVuZHNXaXRoKFwiX2dyb3VwX3N3aXRjaFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY2xpZW50UGFyYW1zW3RoZUtleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNsaWVudFBhcmFtcztcbiAgICB9O1xuXG4gICAgcmV0dXJuIE1hbmFnZXI7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNYW5hZ2VyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfbWFuYWdlck1hbmFnZXIgPSByZXF1aXJlKCcuLi9tYW5hZ2VyL01hbmFnZXInKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYW5hZ2VyTWFuYWdlcik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBBc3luY0NvbXBvbmVudCA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuQXN5bmNDb21wb25lbnQ7XG5cbi8qKlxuICogRGlzcGxheSBhIGZvcm0gY29tcGFuaW9uIGxpbmtlZCB0byBhIGdpdmVuIGlucHV0LlxuICogUHJvcHM6IGhlbHBlckRhdGEgOiBjb250YWlucyB0aGUgcGx1Z2luSWQgYW5kIHRoZSB3aG9sZSBwYXJhbUF0dHJpYnV0ZXNcbiAqL1xuXG52YXIgX2RlZmF1bHQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoX2RlZmF1bHQsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gX2RlZmF1bHQoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIF9kZWZhdWx0KTtcblxuICAgICAgICBfUmVhY3QkQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgdGhpcy5jbG9zZUhlbHBlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLnByb3BzLmNsb3NlKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2RlZmF1bHQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGhlbHBlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaGVscGVyRGF0YSkge1xuICAgICAgICAgICAgdmFyIGhlbHBlcnNDYWNoZSA9IF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXS5nZXRIZWxwZXJzQ2FjaGUoKTtcbiAgICAgICAgICAgIHZhciBwbHVnaW5IZWxwZXJOYW1lc3BhY2UgPSBoZWxwZXJzQ2FjaGVbdGhpcy5wcm9wcy5oZWxwZXJEYXRhWydwbHVnaW5JZCddXVsnbmFtZXNwYWNlJ107XG4gICAgICAgICAgICBoZWxwZXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnaGVscGVyLXRpdGxlJyB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdoZWxwZXItY2xvc2UgbWRpIG1kaS1jbG9zZScsIG9uQ2xpY2s6IHRoaXMuY2xvc2VIZWxwZXIgfSksXG4gICAgICAgICAgICAgICAgICAgICdQeWRpbyBDb21wYW5pb24nXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdoZWxwZXItY29udGVudCcgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChBc3luY0NvbXBvbmVudCwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMuaGVscGVyRGF0YSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBwbHVnaW5IZWxwZXJOYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROYW1lOiAnSGVscGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZTogdGhpcy5wcm9wcy5oZWxwZXJEYXRhWydwYXJhbUF0dHJpYnV0ZXMnXVsnbmFtZSddXG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncHlkaW8tZm9ybS1oZWxwZXInICsgKGhlbHBlciA/ICcgaGVscGVyLXZpc2libGUnIDogJyBoZWxwZXItZW1wdHknKSwgc3R5bGU6IHsgekluZGV4OiAxIH0gfSxcbiAgICAgICAgICAgIGhlbHBlclxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBfY3JlYXRlQ2xhc3MoX2RlZmF1bHQsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ3Byb3BUeXBlcycsXG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBoZWxwZXJEYXRhOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLm9iamVjdCxcbiAgICAgICAgICAgIGNsb3NlOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmZ1bmMuaXNSZXF1aXJlZFxuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIF9kZWZhdWx0O1xufSkoUmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gX2RlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9jcmVhdGVSZWFjdENsYXNzID0gcmVxdWlyZSgnY3JlYXRlLXJlYWN0LWNsYXNzJyk7XG5cbnZhciBfY3JlYXRlUmVhY3RDbGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGVSZWFjdENsYXNzKTtcblxudmFyIF9Hcm91cFN3aXRjaFBhbmVsID0gcmVxdWlyZSgnLi9Hcm91cFN3aXRjaFBhbmVsJyk7XG5cbnZhciBfR3JvdXBTd2l0Y2hQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Hcm91cFN3aXRjaFBhbmVsKTtcblxudmFyIF9SZXBsaWNhdGlvblBhbmVsID0gcmVxdWlyZSgnLi9SZXBsaWNhdGlvblBhbmVsJyk7XG5cbnZhciBfUmVwbGljYXRpb25QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9SZXBsaWNhdGlvblBhbmVsKTtcblxudmFyIF9tYW5hZ2VyTWFuYWdlciA9IHJlcXVpcmUoJy4uL21hbmFnZXIvTWFuYWdlcicpO1xuXG52YXIgX21hbmFnZXJNYW5hZ2VyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21hbmFnZXJNYW5hZ2VyKTtcblxuLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxudmFyIF9weWRpb1V0aWxMYW5nID0gcmVxdWlyZShcInB5ZGlvL3V0aWwvbGFuZ1wiKTtcblxudmFyIF9weWRpb1V0aWxMYW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbExhbmcpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKFwibWF0ZXJpYWwtdWlcIik7XG5cbi8qKlxuICogRm9ybSBQYW5lbCBpcyBhIHJlYWR5IHRvIHVzZSBmb3JtIGJ1aWxkZXIgaW5oZXJpdGVkIGZvciBQeWRpbydzIGxlZ2FjeSBwYXJhbWV0ZXJzIGZvcm1hdHMgKCdzdGFuZGFyZCBmb3JtJykuXG4gKiBJdCBpcyB2ZXJ5IHZlcnNhdGlsZSBhbmQgY2FuIGJhc2ljYWxseSB0YWtlIGEgc2V0IG9mIHBhcmFtZXRlcnMgZGVmaW5lZCBpbiB0aGUgWE1MIG1hbmlmZXN0cyAob3IgZGVmaW5lZCBtYW51YWxseVxuICogaW4gSlMpIGFuZCBkaXNwbGF5IHRoZW0gYXMgYSB1c2VyIGZvcm0uXG4gKiBJdCBpcyBhIGNvbnRyb2xsZWQgY29tcG9uZW50OiBpdCB0YWtlcyBhIHt2YWx1ZXN9IG9iamVjdCBhbmQgdHJpZ2dlcnMgYmFjayBhbiBvbkNoYW5nZSgpIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSBhbHNvIE1hbmFnZXIgY2xhc3MgdG8gZ2V0IHNvbWUgdXRpbGl0YXJ5IGZ1bmN0aW9ucyB0byBwYXJzZSBwYXJhbWV0ZXJzIGFuZCBleHRyYWN0IHZhbHVlcyBmb3IgdGhlIGZvcm0uXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IF9jcmVhdGVSZWFjdENsYXNzMlsnZGVmYXVsdCddKHtcbiAgICBkaXNwbGF5TmFtZTogJ0Zvcm1QYW5lbCcsXG4gICAgX2hpZGRlblZhbHVlczoge30sXG4gICAgX2ludGVybmFsVmFsaWQ6IG51bGwsXG4gICAgX3BhcmFtZXRlcnNNZXRhZGF0YTogbnVsbCxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJyYXkgb2YgUHlkaW8gU3RhbmRhcmRGb3JtIHBhcmFtZXRlcnNcbiAgICAgICAgICovXG4gICAgICAgIHBhcmFtZXRlcnM6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9iamVjdCBjb250YWluaW5nIHZhbHVlcyBmb3IgdGhlIHBhcmFtZXRlcnNcbiAgICAgICAgICovXG4gICAgICAgIHZhbHVlczogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vYmplY3QsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcmlnZ2VyIHVuaXRhcnkgZnVuY3Rpb24gd2hlbiBvbmUgZm9ybSBpbnB1dCBjaGFuZ2VzLlxuICAgICAgICAgKi9cbiAgICAgICAgb25QYXJhbWV0ZXJDaGFuZ2U6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbmQgYWxsIGZvcm0gdmFsdWVzIG9uY2hhbmdlLCBpbmNsdWRpbmcgZXZlbnR1YWxseSB0aGUgcmVtb3ZlZCBvbmVzIChmb3IgZHluYW1pYyBwYW5lbHMpXG4gICAgICAgICAqL1xuICAgICAgICBvbkNoYW5nZTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogVHJpZ2dlcmVkIHdoZW4gdGhlIGZvcm0gZ2xvYmFiYWxseSBzd2l0Y2hlcyBiZXR3ZWVuIHZhbGlkIGFuZCBpbnZhbGlkIHN0YXRlXG4gICAgICAgICAqIFRyaWdnZXJlZCBvbmNlIGF0IGZvcm0gY29uc3RydWN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICBvblZhbGlkU3RhdHVzQ2hhbmdlOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlIHRoZSB3aG9sZSBmb3JtIGF0IG9uY2VcbiAgICAgICAgICovXG4gICAgICAgIGRpc2FibGVkOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmJvb2wsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdHJpbmcgYWRkZWQgdG8gdGhlIGltYWdlIGlucHV0cyBmb3IgdXBsb2FkL2Rvd25sb2FkIG9wZXJhdGlvbnNcbiAgICAgICAgICovXG4gICAgICAgIGJpbmFyeV9jb250ZXh0OiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLnN0cmluZyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIDAgYnkgZGVmYXVsdCwgc3ViZm9ybXMgd2lsbCBoYXZlIHRoZWlyIHpEZXB0aCB2YWx1ZSBpbmNyZWFzZWQgYnkgb25lXG4gICAgICAgICAqL1xuICAgICAgICBkZXB0aDogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5udW1iZXIsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCBhbiBhZGRpdGlvbmFsIGhlYWRlciBjb21wb25lbnQgKGFkZGVkIGluc2lkZSBmaXJzdCBzdWJwYW5lbClcbiAgICAgICAgICovXG4gICAgICAgIGhlYWRlcjogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vYmplY3QsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgYW4gYWRkaXRpb25hbCBmb290ZXIgY29tcG9uZW50IChhZGRlZCBpbnNpZGUgbGFzdCBzdWJwYW5lbClcbiAgICAgICAgICovXG4gICAgICAgIGZvb3RlcjogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vYmplY3QsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgb3RoZXIgYXJiaXRyYXJ5IHBhbmVscywgZWl0aGVyIGF0IHRoZSB0b3Agb3IgdGhlIGJvdHRvbVxuICAgICAgICAgKi9cbiAgICAgICAgYWRkaXRpb25hbFBhbmVzOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLnNoYXBlKHtcbiAgICAgICAgICAgIHRvcDogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5hcnJheSxcbiAgICAgICAgICAgIGJvdHRvbTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5hcnJheVxuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFuIGFycmF5IG9mIHRhYnMgY29udGFpbmluZyBncm91cE5hbWVzLiBHcm91cHMgd2lsbCBiZSBzcGxpdHRlZFxuICAgICAgICAgKiBhY2Nyb3NzIHRob3NlIHRhYnNcbiAgICAgICAgICovXG4gICAgICAgIHRhYnM6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uYXJyYXksXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlZCB3aGVuIGEgdGhlIGFjdGl2ZSB0YWIgY2hhbmdlc1xuICAgICAgICAgKi9cbiAgICAgICAgb25UYWJDaGFuZ2U6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuYyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgYml0IGxpa2UgdGFicywgYnV0IHVzaW5nIGFjY29yZGlvbi1saWtlIGxheW91dFxuICAgICAgICAgKi9cbiAgICAgICAgYWNjb3JkaW9uaXplSWZHcm91cHNNb3JlVGhhbjogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5udW1iZXIsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGb3J3YXJkIGFuIGV2ZW50IHdoZW4gc2Nyb2xsaW5nIHRoZSBmb3JtXG4gICAgICAgICAqL1xuICAgICAgICBvblNjcm9sbENhbGxiYWNrOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmZ1bmMsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0byBhIHN1YnNldCBvZiBmaWVsZCBncm91cHNcbiAgICAgICAgICovXG4gICAgICAgIGxpbWl0VG9Hcm91cHM6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uYXJyYXksXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZ25vcmUgc29tZSBzcGVjaWZpYyBmaWVsZHMgdHlwZXNcbiAgICAgICAgICovXG4gICAgICAgIHNraXBGaWVsZHNUeXBlczogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5hcnJheSxcblxuICAgICAgICAvKiBIZWxwZXIgT3B0aW9ucyAqL1xuICAgICAgICAvKipcbiAgICAgICAgICogUGFzcyBwb2ludGVycyB0byB0aGUgUHlkaW8gQ29tcGFuaW9uIGNvbnRhaW5lclxuICAgICAgICAgKi9cbiAgICAgICAgc2V0SGVscGVyRGF0YTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogRnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGNvbXBhbmlvbiBpcyBhY3RpdmUgb3Igbm9uZSBhbmQgaWYgYSBwYXJhbWV0ZXJcbiAgICAgICAgICogaGFzIGhlbHBlciBkYXRhXG4gICAgICAgICAqL1xuICAgICAgICBjaGVja0hhc0hlbHBlcjogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jLFxuICAgICAgICAvKipcbiAgICAgICAgICogVGVzdCBmb3IgcGFyYW1ldGVyXG4gICAgICAgICAqL1xuICAgICAgICBoZWxwZXJUZXN0Rm9yOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLnN0cmluZ1xuXG4gICAgfSxcblxuICAgIGV4dGVybmFsbHlTZWxlY3RUYWI6IGZ1bmN0aW9uIGV4dGVybmFsbHlTZWxlY3RUYWIoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRhYlNlbGVjdGVkSW5kZXg6IGluZGV4IH0pO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25UYWJDaGFuZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHRhYlNlbGVjdGVkSW5kZXg6IDAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge307XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4geyBkZXB0aDogMCwgdmFsdWVzOiB7fSB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShuZXdQcm9wcy5wYXJhbWV0ZXJzKSAhPT0gSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5wYXJhbWV0ZXJzKSkge1xuICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxWYWxpZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9oaWRkZW5WYWx1ZXMgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuX3BhcmFtZXRlcnNNZXRhZGF0YSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdQcm9wcy52YWx1ZXMgJiYgbmV3UHJvcHMudmFsdWVzICE9PSB0aGlzLnByb3BzLnZhbHVlcykge1xuICAgICAgICAgICAgdGhpcy5jaGVja1ZhbGlkU3RhdHVzKG5ld1Byb3BzLnZhbHVlcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0VmFsdWVzOiBmdW5jdGlvbiBnZXRWYWx1ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnZhbHVlczsgLy9MYW5nVXRpbHMubWVyZ2VPYmplY3RzUmVjdXJzaXZlKHRoaXMuX2hpZGRlblZhbHVlcywgdGhpcy5wcm9wcy52YWx1ZXMpO1xuICAgIH0sXG5cbiAgICBvblBhcmFtZXRlckNoYW5nZTogZnVuY3Rpb24gb25QYXJhbWV0ZXJDaGFuZ2UocGFyYW1OYW1lLCBuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgdmFyIGFkZGl0aW9uYWxGb3JtRGF0YSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbM107XG5cbiAgICAgICAgLy8gVXBkYXRlIHdyaXRlVmFsdWVzXG4gICAgICAgIHZhciBuZXdWYWx1ZXMgPSBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS5kZWVwQ29weSh0aGlzLmdldFZhbHVlcygpKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25QYXJhbWV0ZXJDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25QYXJhbWV0ZXJDaGFuZ2UocGFyYW1OYW1lLCBuZXdWYWx1ZSwgb2xkVmFsdWUsIGFkZGl0aW9uYWxGb3JtRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFkZGl0aW9uYWxGb3JtRGF0YSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzTWV0YWRhdGEgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3BhcmFtZXRlcnNNZXRhZGF0YVtwYXJhbU5hbWVdID0gYWRkaXRpb25hbEZvcm1EYXRhO1xuICAgICAgICB9XG4gICAgICAgIG5ld1ZhbHVlc1twYXJhbU5hbWVdID0gbmV3VmFsdWU7XG4gICAgICAgIHZhciBkaXJ0eSA9IHRydWU7XG4gICAgICAgIHRoaXMub25DaGFuZ2UobmV3VmFsdWVzLCBkaXJ0eSk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZShuZXdWYWx1ZXMsIGRpcnR5LCByZW1vdmVWYWx1ZXMpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIC8vbmV3VmFsdWVzID0gTGFuZ1V0aWxzLm1lcmdlT2JqZWN0c1JlY3Vyc2l2ZSh0aGlzLl9oaWRkZW5WYWx1ZXMsIG5ld1ZhbHVlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5faGlkZGVuVmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2hpZGRlblZhbHVlcy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIG5ld1ZhbHVlc1trZXldID09PSB1bmRlZmluZWQgJiYgKCFyZW1vdmVWYWx1ZXMgfHwgcmVtb3ZlVmFsdWVzW2tleV0gPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVzW2tleV0gPSB0aGlzLl9oaWRkZW5WYWx1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlcywgZGlydHksIHJlbW92ZVZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja1ZhbGlkU3RhdHVzKG5ld1ZhbHVlcyk7XG4gICAgfSxcblxuICAgIG9uU3ViZm9ybUNoYW5nZTogZnVuY3Rpb24gb25TdWJmb3JtQ2hhbmdlKG5ld1ZhbHVlcywgZGlydHksIHJlbW92ZVZhbHVlcykge1xuICAgICAgICB2YXIgdmFsdWVzID0gX3B5ZGlvVXRpbExhbmcyWydkZWZhdWx0J10ubWVyZ2VPYmplY3RzUmVjdXJzaXZlKHRoaXMuZ2V0VmFsdWVzKCksIG5ld1ZhbHVlcyk7XG4gICAgICAgIGlmIChyZW1vdmVWYWx1ZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gcmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZVZhbHVlcy5oYXNPd25Qcm9wZXJ0eShrKSAmJiB2YWx1ZXNba10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWVzW2tdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faGlkZGVuVmFsdWVzW2tdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9oaWRkZW5WYWx1ZXNba107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbkNoYW5nZSh2YWx1ZXMsIGRpcnR5LCByZW1vdmVWYWx1ZXMpO1xuICAgIH0sXG5cbiAgICBvblN1YmZvcm1WYWxpZFN0YXR1c0NoYW5nZTogZnVuY3Rpb24gb25TdWJmb3JtVmFsaWRTdGF0dXNDaGFuZ2UobmV3VmFsaWRWYWx1ZSwgZmFpbGVkTWFuZGF0b3JpZXMpIHtcbiAgICAgICAgaWYgKChuZXdWYWxpZFZhbHVlICE9PSB0aGlzLl9pbnRlcm5hbFZhbGlkIHx8IHRoaXMucHJvcHMuZm9yY2VWYWxpZFN0YXR1c0NoZWNrKSAmJiB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZShuZXdWYWxpZFZhbHVlLCBmYWlsZWRNYW5kYXRvcmllcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW50ZXJuYWxWYWxpZCA9IG5ld1ZhbGlkVmFsdWU7XG4gICAgfSxcblxuICAgIGFwcGx5QnV0dG9uQWN0aW9uOiBmdW5jdGlvbiBhcHBseUJ1dHRvbkFjdGlvbihwYXJhbWV0ZXJzLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hcHBseUJ1dHRvbkFjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5hcHBseUJ1dHRvbkFjdGlvbihwYXJhbWV0ZXJzLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgLy8gT2xkIHdheVxuICAgICAgICBwYXJhbWV0ZXJzID0gTGFuZ1V0aWxzLm1lcmdlT2JqZWN0c1JlY3Vyc2l2ZShwYXJhbWV0ZXJzLCB0aGlzLmdldFZhbHVlc0ZvclBPU1QodGhpcy5nZXRWYWx1ZXMoKSkpO1xuICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5yZXF1ZXN0KHBhcmFtZXRlcnMsIGNhbGxiYWNrKTtcbiAgICAgICAgKi9cbiAgICB9LFxuXG4gICAgZ2V0VmFsdWVzRm9yUE9TVDogZnVuY3Rpb24gZ2V0VmFsdWVzRm9yUE9TVCh2YWx1ZXMpIHtcbiAgICAgICAgdmFyIHByZWZpeCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICdEUklWRVJfT1BUSU9OXycgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgcmV0dXJuIF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXS5nZXRWYWx1ZXNGb3JQT1NUKHRoaXMucHJvcHMucGFyYW1ldGVycywgdmFsdWVzLCBwcmVmaXgsIHRoaXMuX3BhcmFtZXRlcnNNZXRhZGF0YSk7XG4gICAgfSxcblxuICAgIGNoZWNrVmFsaWRTdGF0dXM6IGZ1bmN0aW9uIGNoZWNrVmFsaWRTdGF0dXModmFsdWVzKSB7XG4gICAgICAgIHZhciBmYWlsZWRNYW5kYXRvcmllcyA9IFtdO1xuICAgICAgICB0aGlzLnByb3BzLnBhcmFtZXRlcnMubWFwKChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgaWYgKFsnc3RyaW5nJywgJ3RleHRhcmVhJywgJ3Bhc3N3b3JkJywgJ2ludGVnZXInXS5pbmRleE9mKHAudHlwZSkgPiAtMSAmJiAocC5tYW5kYXRvcnkgPT09IFwidHJ1ZVwiIHx8IHAubWFuZGF0b3J5ID09PSB0cnVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghdmFsdWVzIHx8ICF2YWx1ZXMuaGFzT3duUHJvcGVydHkocC5uYW1lKSB8fCB2YWx1ZXNbcC5uYW1lXSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlc1twLm5hbWVdID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWxlZE1hbmRhdG9yaWVzLnB1c2gocCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHAudHlwZSA9PT0gJ3ZhbGlkLXBhc3N3b3JkJyAmJiB0aGlzLnJlZnNbJ2Zvcm0tZWxlbWVudC0nICsgcC5uYW1lXSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5yZWZzWydmb3JtLWVsZW1lbnQtJyArIHAubmFtZV0uaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWxlZE1hbmRhdG9yaWVzLnB1c2gocCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdmFyIHByZXZpb3VzVmFsdWUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZXdWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcHJldmlvdXNWYWx1ZSA9IHRoaXMuX2ludGVybmFsVmFsaWQ7IC8vKHRoaXMuX2ludGVybmFsVmFsaWQgIT09IHVuZGVmaW5lZCA/IHRoaXMuX2ludGVybmFsVmFsaWQgOiB0cnVlKTtcbiAgICAgICAgbmV3VmFsdWUgPSAhZmFpbGVkTWFuZGF0b3JpZXMubGVuZ3RoO1xuICAgICAgICBpZiAoKG5ld1ZhbHVlICE9PSB0aGlzLl9pbnRlcm5hbFZhbGlkIHx8IHRoaXMucHJvcHMuZm9yY2VWYWxpZFN0YXR1c0NoZWNrKSAmJiB0aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZShuZXdWYWx1ZSwgZmFpbGVkTWFuZGF0b3JpZXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2ludGVybmFsVmFsaWQgPSBuZXdWYWx1ZTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmNoZWNrVmFsaWRTdGF0dXModGhpcy5wcm9wcy52YWx1ZXMpO1xuICAgIH0sXG5cbiAgICByZW5kZXJHcm91cEhlYWRlcjogZnVuY3Rpb24gcmVuZGVyR3JvdXBIZWFkZXIoZ3JvdXBMYWJlbCwgYWNjb3JkaW9uaXplLCBpbmRleCwgYWN0aXZlKSB7XG5cbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSB7IGtleTogJ2dyb3VwLScgKyBncm91cExhYmVsIH07XG4gICAgICAgIGlmIChhY2NvcmRpb25pemUpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLmN1cnJlbnRBY3RpdmVHcm91cCA/IHRoaXMuc3RhdGUuY3VycmVudEFjdGl2ZUdyb3VwIDogbnVsbDtcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ2NsYXNzTmFtZSddID0gJ2dyb3VwLWxhYmVsLScgKyAoYWN0aXZlID8gJ2FjdGl2ZScgOiAnaW5hY3RpdmUnKTtcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ29uQ2xpY2snXSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1cnJlbnRBY3RpdmVHcm91cDogY3VycmVudCAhPT0gaW5kZXggPyBpbmRleCA6IG51bGwgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgZ3JvdXBMYWJlbCA9IFtfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsga2V5OiAndG9nZ2xlcicsIGNsYXNzTmFtZTogXCJncm91cC1hY3RpdmUtdG9nZ2xlciBpY29uLWFuZ2xlLVwiICsgKGN1cnJlbnQgPT09IGluZGV4ID8gJ2Rvd24nIDogJ3JpZ2h0JykgfSksIGdyb3VwTGFiZWxdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdoJyArICgzICsgdGhpcy5wcm9wcy5kZXB0aCksIHByb3BlcnRpZXMsIGdyb3VwTGFiZWwpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGFsbEdyb3VwcyA9IFtdO1xuICAgICAgICB2YXIgZ3JvdXBzT3JkZXJlZCA9IFsnX19ERUZBVUxUX18nXTtcbiAgICAgICAgYWxsR3JvdXBzWydfX0RFRkFVTFRfXyddID0geyBGSUVMRFM6IFtdIH07XG4gICAgICAgIHZhciByZXBsaWNhdGlvbkdyb3VwcyA9IHt9O1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBfcHJvcHMucGFyYW1ldGVycztcbiAgICAgICAgdmFyIHZhbHVlcyA9IF9wcm9wcy52YWx1ZXM7XG4gICAgICAgIHZhciBza2lwRmllbGRzVHlwZXMgPSBfcHJvcHMuc2tpcEZpZWxkc1R5cGVzO1xuICAgICAgICB2YXIgZGlzYWJsZWQgPSBfcHJvcHMuZGlzYWJsZWQ7XG4gICAgICAgIHZhciBiaW5hcnlfY29udGV4dCA9IF9wcm9wcy5iaW5hcnlfY29udGV4dDtcbiAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgYWx0VGV4dFN3aXRjaEljb24gPSBfcHJvcHMyLmFsdFRleHRTd2l0Y2hJY29uO1xuICAgICAgICB2YXIgYWx0VGV4dFN3aXRjaFRpcCA9IF9wcm9wczIuYWx0VGV4dFN3aXRjaFRpcDtcbiAgICAgICAgdmFyIG9uQWx0VGV4dFN3aXRjaCA9IF9wcm9wczIub25BbHRUZXh0U3dpdGNoO1xuXG4gICAgICAgIHBhcmFtZXRlcnMubWFwKChmdW5jdGlvbiAoYXR0cmlidXRlcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHR5cGUgPSBhdHRyaWJ1dGVzWyd0eXBlJ107XG4gICAgICAgICAgICBpZiAoc2tpcEZpZWxkc1R5cGVzICYmIHNraXBGaWVsZHNUeXBlcy5pbmRleE9mKHR5cGUpID4gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcGFyYW1OYW1lID0gYXR0cmlidXRlc1snbmFtZSddO1xuICAgICAgICAgICAgdmFyIGZpZWxkO1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbJ2dyb3VwX3N3aXRjaF9uYW1lJ10pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBncm91cCA9IGF0dHJpYnV0ZXNbJ2dyb3VwJ10gfHwgJ19fREVGQVVMVF9fJztcbiAgICAgICAgICAgIGlmICghYWxsR3JvdXBzW2dyb3VwXSkge1xuICAgICAgICAgICAgICAgIGdyb3Vwc09yZGVyZWQucHVzaChncm91cCk7XG4gICAgICAgICAgICAgICAgYWxsR3JvdXBzW2dyb3VwXSA9IHsgRklFTERTOiBbXSwgTEFCRUw6IGdyb3VwIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZXBHcm91cCA9IGF0dHJpYnV0ZXMucmVwbGljYXRpb25Hcm91cDtcblxuICAgICAgICAgICAgaWYgKHJlcEdyb3VwKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXJlcGxpY2F0aW9uR3JvdXBzW3JlcEdyb3VwXSkge1xuICAgICAgICAgICAgICAgICAgICByZXBsaWNhdGlvbkdyb3Vwc1tyZXBHcm91cF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBQQVJBTVM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgR1JPVVA6IGdyb3VwLFxuICAgICAgICAgICAgICAgICAgICAgICAgUE9TSVRJT046IGFsbEdyb3Vwc1tncm91cF0uRklFTERTLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBhbGxHcm91cHNbZ3JvdXBdLkZJRUxEUy5wdXNoKCdSRVBMSUNBVElPTjonICsgcmVwR3JvdXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDb3B5XG4gICAgICAgICAgICAgICAgdmFyIHJlcEF0dHIgPSBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS5kZWVwQ29weShhdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVwQXR0clsncmVwbGljYXRpb25Hcm91cCddO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXBBdHRyWydncm91cCddO1xuICAgICAgICAgICAgICAgIHJlcGxpY2F0aW9uR3JvdXBzW3JlcEdyb3VwXS5QQVJBTVMucHVzaChyZXBBdHRyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZS5pbmRleE9mKFwiZ3JvdXBfc3dpdGNoOlwiKSA9PT0gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX0dyb3VwU3dpdGNoUGFuZWwyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblN1YmZvcm1DaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbUF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2Nyb2xsQ2FsbGJhY2s6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW1pdFRvR3JvdXBzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZFN0YXR1c0NoYW5nZTogdGhpcy5vblN1YmZvcm1WYWxpZFN0YXR1c0NoYW5nZVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRyaWJ1dGVzWyd0eXBlJ10gIT09ICdoaWRkZW4nKSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoZWxwZXJNYXJrID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9wcm9wczMgPSBfdGhpcy5wcm9wcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZXRIZWxwZXJEYXRhID0gX3Byb3BzMy5zZXRIZWxwZXJEYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNoZWNrSGFzSGVscGVyID0gX3Byb3BzMy5jaGVja0hhc0hlbHBlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoZWxwZXJUZXN0Rm9yID0gX3Byb3BzMy5oZWxwZXJUZXN0Rm9yO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0SGVscGVyRGF0YSAmJiBjaGVja0hhc0hlbHBlciAmJiBjaGVja0hhc0hlbHBlcihhdHRyaWJ1dGVzWyduYW1lJ10sIGhlbHBlclRlc3RGb3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNob3dIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRIZWxwZXJEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtQXR0cmlidXRlczogYXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdFZhbHVlczogdGhpcy5nZXRWYWx1ZXNGb3JQT1NUKHZhbHVlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseUJ1dHRvbkFjdGlvbjogdGhpcy5hcHBseUJ1dHRvbkFjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBoZWxwZXJUZXN0Rm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5iaW5kKF90aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWxwZXJNYXJrID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2ljb24tcXVlc3Rpb24tc2lnbicsIG9uQ2xpY2s6IHNob3dIZWxwZXIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFuZGF0b3J5TWlzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsYXNzTGVnZW5kID0gXCJmb3JtLWxlZ2VuZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXNbJ2Vycm9yVGV4dCddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NMZWdlbmQgPSBcImZvcm0tbGVnZW5kIG1hbmRhdG9yeS1taXNzaW5nXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF0dHJpYnV0ZXNbJ3dhcm5pbmdUZXh0J10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc0xlZ2VuZCA9IFwiZm9ybS1sZWdlbmQgd2FybmluZy1tZXNzYWdlXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF0dHJpYnV0ZXNbJ21hbmRhdG9yeSddICYmIChhdHRyaWJ1dGVzWydtYW5kYXRvcnknXSA9PT0gXCJ0cnVlXCIgfHwgYXR0cmlidXRlc1snbWFuZGF0b3J5J10gPT09IHRydWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFsnc3RyaW5nJywgJ3RleHRhcmVhJywgJ2ltYWdlJywgJ2ludGVnZXInXS5pbmRleE9mKGF0dHJpYnV0ZXNbJ3R5cGUnXSkgIT09IC0xICYmICF2YWx1ZXNbcGFyYW1OYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYW5kYXRvcnlNaXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NMZWdlbmQgPSBcImZvcm0tbGVnZW5kIG1hbmRhdG9yeS1taXNzaW5nXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBcImZvcm0tZWxlbWVudC1cIiArIHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHBhcmFtTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVzW3BhcmFtTmFtZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIG9uQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSwgYWRkaXRpb25hbEZvcm1EYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm9uUGFyYW1ldGVyQ2hhbmdlKHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlLCBhZGRpdGlvbmFsRm9ybURhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGRpc2FibGVkIHx8IGF0dHJpYnV0ZXNbJ3JlYWRvbmx5J10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGU6IGF0dHJpYnV0ZXNbJ211bHRpcGxlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluYXJ5X2NvbnRleHQ6IGJpbmFyeV9jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlDb250ZXh0OiAnZm9ybScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlCdXR0b25BY3Rpb246IF90aGlzLmFwcGx5QnV0dG9uQWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogbWFuZGF0b3J5TWlzc2luZyA/IHB5ZGlvLk1lc3NhZ2VIYXNoWyc2MjEnXSA6IGF0dHJpYnV0ZXMuZXJyb3JUZXh0ID8gYXR0cmlidXRlcy5lcnJvclRleHQgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQWx0VGV4dFN3aXRjaDogb25BbHRUZXh0U3dpdGNoLCBhbHRUZXh0U3dpdGNoSWNvbjogYWx0VGV4dFN3aXRjaEljb24sIGFsdFRleHRTd2l0Y2hUaXA6IGFsdFRleHRTd2l0Y2hUaXBcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBrZXk6IHBhcmFtTmFtZSwgY2xhc3NOYW1lOiAnZm9ybS1lbnRyeS0nICsgYXR0cmlidXRlc1sndHlwZSddIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogY2xhc3NMZWdlbmQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlc1snd2FybmluZ1RleHQnXSA/IGF0dHJpYnV0ZXNbJ3dhcm5pbmdUZXh0J10gOiBhdHRyaWJ1dGVzWydkZXNjcmlwdGlvbiddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlbHBlck1hcmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYW5hZ2VyTWFuYWdlcjJbJ2RlZmF1bHQnXS5jcmVhdGVGb3JtRWxlbWVudChwcm9wcylcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaWRkZW5WYWx1ZXNbcGFyYW1OYW1lXSA9IHZhbHVlc1twYXJhbU5hbWVdID09PSB1bmRlZmluZWQgPyBhdHRyaWJ1dGVzWydkZWZhdWx0J10gOiB2YWx1ZXNbcGFyYW1OYW1lXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgYWxsR3JvdXBzW2dyb3VwXS5GSUVMRFMucHVzaChmaWVsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICBmb3IgKHZhciByR3JvdXAgaW4gcmVwbGljYXRpb25Hcm91cHMpIHtcbiAgICAgICAgICAgIGlmICghcmVwbGljYXRpb25Hcm91cHMuaGFzT3duUHJvcGVydHkockdyb3VwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJHcm91cERhdGEgPSByZXBsaWNhdGlvbkdyb3Vwc1tyR3JvdXBdO1xuICAgICAgICAgICAgYWxsR3JvdXBzW3JHcm91cERhdGEuR1JPVVBdLkZJRUxEU1tyR3JvdXBEYXRhLlBPU0lUSU9OXSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9SZXBsaWNhdGlvblBhbmVsMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXBsaWNhdGlvbi1ncm91cC1cIiArIHJHcm91cERhdGEuUEFSQU1TWzBdLm5hbWUsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25TdWJmb3JtQ2hhbmdlLFxuICAgICAgICAgICAgICAgIG9uUGFyYW1ldGVyQ2hhbmdlOiBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlczogdGhpcy5nZXRWYWx1ZXMoKSxcbiAgICAgICAgICAgICAgICBkZXB0aDogdGhpcy5wcm9wcy5kZXB0aCArIDEsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczogckdyb3VwRGF0YS5QQVJBTVMsXG4gICAgICAgICAgICAgICAgYXBwbHlCdXR0b25BY3Rpb246IHRoaXMuYXBwbHlCdXR0b25BY3Rpb24sXG4gICAgICAgICAgICAgICAgb25TY3JvbGxDYWxsYmFjazogbnVsbFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdyb3VwUGFuZXMgPSBbXTtcbiAgICAgICAgdmFyIGFjY29yZGlvbml6ZSA9IHRoaXMucHJvcHMuYWNjb3JkaW9uaXplSWZHcm91cHNNb3JlVGhhbiAmJiBncm91cHNPcmRlcmVkLmxlbmd0aCA+IHRoaXMucHJvcHMuYWNjb3JkaW9uaXplSWZHcm91cHNNb3JlVGhhbjtcbiAgICAgICAgdmFyIGN1cnJlbnRBY3RpdmVHcm91cCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5jdXJyZW50QWN0aXZlR3JvdXAgPyB0aGlzLnN0YXRlLmN1cnJlbnRBY3RpdmVHcm91cCA6IDA7XG4gICAgICAgIGdyb3Vwc09yZGVyZWQubWFwKChmdW5jdGlvbiAoZywgZ0luZGV4KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5saW1pdFRvR3JvdXBzICYmIHRoaXMucHJvcHMubGltaXRUb0dyb3Vwcy5pbmRleE9mKGcpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBoZWFkZXIsXG4gICAgICAgICAgICAgICAgZ0RhdGEgPSBhbGxHcm91cHNbZ107XG4gICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gJ3B5ZGlvLWZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGFjY29yZGlvbml6ZSkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZSA9IGN1cnJlbnRBY3RpdmVHcm91cCA9PT0gZ0luZGV4O1xuICAgICAgICAgICAgICAgIGlmIChnSW5kZXggPT09IGN1cnJlbnRBY3RpdmVHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgKz0gJyBmb3JtLWdyb3VwLWFjdGl2ZSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgZm9ybS1ncm91cC1pbmFjdGl2ZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFnRGF0YS5GSUVMRFMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGdEYXRhLkxBQkVMICYmICEodGhpcy5wcm9wcy5za2lwRmllbGRzVHlwZXMgJiYgdGhpcy5wcm9wcy5za2lwRmllbGRzVHlwZXMuaW5kZXhPZignR3JvdXBIZWFkZXInKSA+IC0xKSkge1xuICAgICAgICAgICAgICAgIGhlYWRlciA9IHRoaXMucmVuZGVyR3JvdXBIZWFkZXIoZ0RhdGEuTEFCRUwsIGFjY29yZGlvbml6ZSwgZ0luZGV4LCBhY3RpdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGVwdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgKz0gJyB6LWRlcHRoLTEnO1xuICAgICAgICAgICAgICAgIGdyb3VwUGFuZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGtleTogJ3BhbmUtJyArIGcgfSxcbiAgICAgICAgICAgICAgICAgICAgZ0luZGV4ID09PSAwICYmIHRoaXMucHJvcHMuaGVhZGVyID8gdGhpcy5wcm9wcy5oZWFkZXIgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ0RhdGEuRklFTERTXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGdJbmRleCA9PT0gZ3JvdXBzT3JkZXJlZC5sZW5ndGggLSAxICYmIHRoaXMucHJvcHMuZm9vdGVyID8gdGhpcy5wcm9wcy5mb290ZXIgOiBudWxsXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdyb3VwUGFuZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGtleTogJ3BhbmUtJyArIGcgfSxcbiAgICAgICAgICAgICAgICAgICAgZ0luZGV4ID09PSAwICYmIHRoaXMucHJvcHMuaGVhZGVyID8gdGhpcy5wcm9wcy5oZWFkZXIgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ0RhdGEuRklFTERTXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGdJbmRleCA9PT0gZ3JvdXBzT3JkZXJlZC5sZW5ndGggLSAxICYmIHRoaXMucHJvcHMuZm9vdGVyID8gdGhpcy5wcm9wcy5mb290ZXIgOiBudWxsXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hZGRpdGlvbmFsUGFuZXMpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG90aGVyUGFuZXMgPSB7IHRvcDogW10sIGJvdHRvbTogW10gfTtcbiAgICAgICAgICAgICAgICB2YXIgZGVwdGggPSBfdGhpczIucHJvcHMuZGVwdGg7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcblxuICAgICAgICAgICAgICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghb3RoZXJQYW5lcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdjb250aW51ZSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzMi5wcm9wcy5hZGRpdGlvbmFsUGFuZXNba10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5hZGRpdGlvbmFsUGFuZXNba10ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlcHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyUGFuZXNba10ucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdweWRpby1mb3JtLWdyb3VwIGFkZGl0aW9uYWwnLCBrZXk6ICdvdGhlci1wYW5lLScgKyBpbmRleCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlclBhbmVzW2tdLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncHlkaW8tZm9ybS1ncm91cCBhZGRpdGlvbmFsJywga2V5OiAnb3RoZXItcGFuZS0nICsgaW5kZXggfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIG90aGVyUGFuZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9yZXQzID0gX2xvb3Aoayk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF9yZXQzID09PSAnY29udGludWUnKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3JvdXBQYW5lcyA9IG90aGVyUGFuZXNbJ3RvcCddLmNvbmNhdChncm91cFBhbmVzKS5jb25jYXQob3RoZXJQYW5lc1snYm90dG9tJ10pO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnRhYnMpIHtcbiAgICAgICAgICAgIHZhciBfcmV0NCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IF90aGlzMi5wcm9wcy5jbGFzc05hbWU7XG4gICAgICAgICAgICAgICAgdmFyIGluaXRpYWxTZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHRhYnMgPSBfdGhpczIucHJvcHMudGFicy5tYXAoKGZ1bmN0aW9uICh0RGVmKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IHREZWZbJ2xhYmVsJ107XG4gICAgICAgICAgICAgICAgICAgIHZhciBncm91cHMgPSB0RGVmWydncm91cHMnXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHREZWZbJ3NlbGVjdGVkJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxTZWxlY3RlZEluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFuZXMgPSBncm91cHMubWFwKGZ1bmN0aW9uIChnSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncm91cFBhbmVzW2dJZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ3JvdXBQYW5lc1tnSWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy5vblRhYkNoYW5nZSA/IGkgLSAxIDogdW5kZWZpbmVkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogKGNsYXNzTmFtZSA/IGNsYXNzTmFtZSArICcgJyA6ICcgJykgKyAncHlkaW8tZm9ybS1wYW5lbCcgKyAocGFuZXMubGVuZ3RoICUgMiA/ICcgZm9ybS1wYW5lbC1vZGQnIDogJycpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFuZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKF90aGlzMikpO1xuICAgICAgICAgICAgICAgIGlmIChfdGhpczIuc3RhdGUudGFiU2VsZWN0ZWRJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxTZWxlY3RlZEluZGV4ID0gX3RoaXMyLnN0YXRlLnRhYlNlbGVjdGVkSW5kZXg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHY6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2xheW91dC1maWxsIHZlcnRpY2FsLWxheW91dCB0YWItdmVydGljYWwtbGF5b3V0JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVGFicyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlZjogJ3RhYnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsU2VsZWN0ZWRJbmRleDogaW5pdGlhbFNlbGVjdGVkSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBfdGhpczIucHJvcHMub25UYWJDaGFuZ2UgPyBpbml0aWFsU2VsZWN0ZWRJbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IF90aGlzMi5wcm9wcy5vblRhYkNoYW5nZSA/IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyB0YWJTZWxlY3RlZEluZGV4OiBpIH0pO190aGlzMi5wcm9wcy5vblRhYkNoYW5nZShpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSwgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50Q29udGFpbmVyU3R5bGU6IHsgZmxleDogMSwgb3ZlcmZsb3dZOiAnYXV0bycgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFic1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3JldDQgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldDQudjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogKHRoaXMucHJvcHMuY2xhc3NOYW1lID8gdGhpcy5wcm9wcy5jbGFzc05hbWUgKyAnICcgOiAnICcpICsgJ3B5ZGlvLWZvcm0tcGFuZWwnICsgKGdyb3VwUGFuZXMubGVuZ3RoICUgMiA/ICcgZm9ybS1wYW5lbC1vZGQnIDogJycpLCBvblNjcm9sbDogdGhpcy5wcm9wcy5vblNjcm9sbENhbGxiYWNrIH0sXG4gICAgICAgICAgICAgICAgZ3JvdXBQYW5lc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9Gb3JtUGFuZWwgPSByZXF1aXJlKCcuL0Zvcm1QYW5lbCcpO1xuXG52YXIgX0Zvcm1QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Gb3JtUGFuZWwpO1xuXG52YXIgX2ZpZWxkc0lucHV0U2VsZWN0Qm94ID0gcmVxdWlyZSgnLi4vZmllbGRzL0lucHV0U2VsZWN0Qm94Jyk7XG5cbnZhciBfZmllbGRzSW5wdXRTZWxlY3RCb3gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmllbGRzSW5wdXRTZWxlY3RCb3gpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xudmFyIExhbmdVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xuXG4vKipcbiAqIFN1YiBmb3JtIHdpdGggYSBzZWxlY3Rvciwgc3dpdGNoaW5nIGl0cyBmaWVsZHMgZGVwZW5kaW5nXG4gKiBvbiB0aGUgc2VsZWN0b3IgdmFsdWUuXG4gKi9cblxudmFyIF9kZWZhdWx0ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKF9kZWZhdWx0LCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIF9kZWZhdWx0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBfZGVmYXVsdCk7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIHRoaXMuY29tcHV0ZVN1YlBhbmVsUGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgLy8gQ1JFQVRFIFNVQiBGT1JNIFBBTkVMXG4gICAgICAgICAgICAvLyBHZXQgYWxsIHZhbHVlc1xuICAgICAgICAgICAgdmFyIHN3aXRjaE5hbWUgPSBfdGhpcy5wcm9wcy5wYXJhbUF0dHJpYnV0ZXNbJ3R5cGUnXS5zcGxpdChcIjpcIikucG9wKCk7XG4gICAgICAgICAgICB2YXIgcGFyZW50TmFtZSA9IF90aGlzLnByb3BzLnBhcmFtQXR0cmlidXRlc1snbmFtZSddO1xuICAgICAgICAgICAgdmFyIHN3aXRjaFZhbHVlcyA9IHt9LFxuICAgICAgICAgICAgICAgIHBvdGVudGlhbFN1YlN3aXRjaGVzID0gW107XG5cbiAgICAgICAgICAgIF90aGlzLnByb3BzLnBhcmFtZXRlcnMubWFwKChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgICAgICAgICAgIGlmICghcFsnZ3JvdXBfc3dpdGNoX25hbWUnXSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGlmIChwWydncm91cF9zd2l0Y2hfbmFtZSddICE9IHN3aXRjaE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcG90ZW50aWFsU3ViU3dpdGNoZXMucHVzaChwKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgY3J0U3dpdGNoID0gcFsnZ3JvdXBfc3dpdGNoX3ZhbHVlJ107XG4gICAgICAgICAgICAgICAgaWYgKCFzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwWydncm91cF9zd2l0Y2hfbGFiZWwnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRzS2V5czoge31cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcCA9IExhbmdVdGlscy5kZWVwQ29weShwKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgcFsnZ3JvdXBfc3dpdGNoX25hbWUnXTtcbiAgICAgICAgICAgICAgICBwWyduYW1lJ10gPSBwYXJlbnROYW1lICsgJy8nICsgcFsnbmFtZSddO1xuICAgICAgICAgICAgICAgIHZhciB2S2V5ID0gcFsnbmFtZSddO1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbU5hbWUgPSB2S2V5O1xuICAgICAgICAgICAgICAgIGlmIChzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXS5maWVsZHNLZXlzW3BhcmFtTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXS5maWVsZHMucHVzaChwKTtcbiAgICAgICAgICAgICAgICBzd2l0Y2hWYWx1ZXNbY3J0U3dpdGNoXS5maWVsZHNLZXlzW3BhcmFtTmFtZV0gPSBwYXJhbU5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWVzICYmIHRoaXMucHJvcHMudmFsdWVzW3ZLZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaFZhbHVlc1tjcnRTd2l0Y2hdLnZhbHVlc1twYXJhbU5hbWVdID0gdGhpcy5wcm9wcy52YWx1ZXNbdktleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZChfdGhpcykpO1xuICAgICAgICAgICAgLy8gUmVtZXJnZSBwb3RlbnRpYWxTdWJTd2l0Y2hlcyB0byBlYWNoIHBhcmFtZXRlcnMgc2V0XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIHN3aXRjaFZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmIChzd2l0Y2hWYWx1ZXMuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN2ID0gc3dpdGNoVmFsdWVzW2tdO1xuICAgICAgICAgICAgICAgICAgICBzdi5maWVsZHMgPSBzdi5maWVsZHMuY29uY2F0KHBvdGVudGlhbFN1YlN3aXRjaGVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzd2l0Y2hWYWx1ZXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGVhclN1YlBhcmFtZXRlcnNWYWx1ZXMgPSBmdW5jdGlvbiAocGFyZW50TmFtZSwgbmV3VmFsdWUsIG5ld0ZpZWxkcykge1xuICAgICAgICAgICAgdmFyIHZhbHMgPSBMYW5nVXRpbHMuZGVlcENvcHkoX3RoaXMucHJvcHMudmFsdWVzKTtcbiAgICAgICAgICAgIHZhciB0b1JlbW92ZSA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHMpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFscy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleS5pbmRleE9mKHBhcmVudE5hbWUgKyAnLycpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvUmVtb3ZlW2tleV0gPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxzW3BhcmVudE5hbWVdID0gbmV3VmFsdWU7XG5cbiAgICAgICAgICAgIG5ld0ZpZWxkcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICBpZiAocC50eXBlID09ICdoaWRkZW4nICYmIHBbJ2RlZmF1bHQnXSAmJiAhcFsnZ3JvdXBfc3dpdGNoX25hbWUnXSB8fCBwWydncm91cF9zd2l0Y2hfbmFtZSddID09IHBhcmVudE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsc1twWyduYW1lJ11dID0gcFsnZGVmYXVsdCddO1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9SZW1vdmVbcFsnbmFtZSddXSAhPT0gdW5kZWZpbmVkKSBkZWxldGUgdG9SZW1vdmVbcFsnbmFtZSddXTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBbJ25hbWUnXS5pbmRleE9mKHBhcmVudE5hbWUgKyAnLycpID09PSAwICYmIHBbJ2RlZmF1bHQnXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocFsndHlwZSddICYmIHBbJ3R5cGUnXS5zdGFydHNXaXRoKCdncm91cF9zd2l0Y2g6JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdmFsc1twWyduYW1lJ11dID0ge2dyb3VwX3N3aXRjaF92YWx1ZTpwWydkZWZhdWx0J119O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsc1twWyduYW1lJ11dID0gcFsnZGVmYXVsdCddO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsc1twWyduYW1lJ11dID0gcFsnZGVmYXVsdCddO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWxzLCB0cnVlLCB0b1JlbW92ZSk7XG4gICAgICAgICAgICAvL3RoaXMub25QYXJhbWV0ZXJDaGFuZ2UocGFyZW50TmFtZSwgbmV3VmFsdWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSBmdW5jdGlvbiAobmV3VmFsdWVzLCBkaXJ0eSwgcmVtb3ZlVmFsdWVzKSB7XG4gICAgICAgICAgICBfdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZXMsIHRydWUsIHJlbW92ZVZhbHVlcyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2RlZmF1bHQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZXMgPSB0aGlzLnByb3BzLnBhcmFtQXR0cmlidXRlcztcbiAgICAgICAgdmFyIHZhbHVlcyA9IHRoaXMucHJvcHMudmFsdWVzO1xuXG4gICAgICAgIHZhciBwYXJhbU5hbWUgPSBhdHRyaWJ1dGVzWyduYW1lJ107XG4gICAgICAgIHZhciBzd2l0Y2hWYWx1ZXMgPSB0aGlzLmNvbXB1dGVTdWJQYW5lbFBhcmFtZXRlcnMoYXR0cmlidXRlcyk7XG4gICAgICAgIHZhciBzZWxlY3RvclZhbHVlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgT2JqZWN0LmtleXMoc3dpdGNoVmFsdWVzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHNlbGVjdG9yVmFsdWVzLnNldChrLCBzd2l0Y2hWYWx1ZXNba10ubGFiZWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHNlbGVjdG9yQ2hhbmdlciA9IChmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJTdWJQYXJhbWV0ZXJzVmFsdWVzKHBhcmFtTmFtZSwgbmV3VmFsdWUsIHN3aXRjaFZhbHVlc1tuZXdWYWx1ZV0gPyBzd2l0Y2hWYWx1ZXNbbmV3VmFsdWVdLmZpZWxkcyA6IFtdKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgdmFyIHN1YkZvcm0gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBzZWxlY3RvckxlZ2VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIHNlbGVjdG9yID0gUmVhY3QuY3JlYXRlRWxlbWVudChfZmllbGRzSW5wdXRTZWxlY3RCb3gyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgIGtleTogcGFyYW1OYW1lLFxuICAgICAgICAgICAgbmFtZTogcGFyYW1OYW1lLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAnZ3JvdXAtc3dpdGNoLXNlbGVjdG9yJyxcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBwYXJhbU5hbWUsXG4gICAgICAgICAgICAgICAgY2hvaWNlczogc2VsZWN0b3JWYWx1ZXMsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGF0dHJpYnV0ZXNbJ2xhYmVsJ10sXG4gICAgICAgICAgICAgICAgbWFuZGF0b3J5OiBhdHRyaWJ1dGVzWydtYW5kYXRvcnknXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZXNbcGFyYW1OYW1lXSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiBzZWxlY3RvckNoYW5nZXIsXG4gICAgICAgICAgICBkaXNwbGF5Q29udGV4dDogJ2Zvcm0nLFxuICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICByZWY6ICdzdWJGb3JtU2VsZWN0b3InXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBoZWxwZXJNYXJrID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zZXRIZWxwZXJEYXRhICYmIHRoaXMucHJvcHMuY2hlY2tIYXNIZWxwZXIgJiYgdGhpcy5wcm9wcy5jaGVja0hhc0hlbHBlcihhdHRyaWJ1dGVzWyduYW1lJ10sIHRoaXMucHJvcHMuaGVscGVyVGVzdEZvcikpIHtcbiAgICAgICAgICAgIHZhciBzaG93SGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNldEhlbHBlckRhdGEoeyBwYXJhbUF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMsIHZhbHVlczogdmFsdWVzIH0pO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGhlbHBlck1hcmsgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdpY29uLXF1ZXN0aW9uLXNpZ24nLCBvbkNsaWNrOiBzaG93SGVscGVyIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlc1twYXJhbU5hbWVdICYmIHN3aXRjaFZhbHVlc1t2YWx1ZXNbcGFyYW1OYW1lXV0pIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG9uQWx0VGV4dFN3aXRjaCA9IF9wcm9wcy5vbkFsdFRleHRTd2l0Y2g7XG4gICAgICAgICAgICB2YXIgYWx0VGV4dFN3aXRjaEljb24gPSBfcHJvcHMuYWx0VGV4dFN3aXRjaEljb247XG4gICAgICAgICAgICB2YXIgYWx0VGV4dFN3aXRjaFRpcCA9IF9wcm9wcy5hbHRUZXh0U3dpdGNoVGlwO1xuXG4gICAgICAgICAgICBzdWJGb3JtID0gUmVhY3QuY3JlYXRlRWxlbWVudChfRm9ybVBhbmVsMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgb25QYXJhbWV0ZXJDaGFuZ2U6IHRoaXMucHJvcHMub25QYXJhbWV0ZXJDaGFuZ2UsXG4gICAgICAgICAgICAgICAgYXBwbHlCdXR0b25BY3Rpb246IHRoaXMucHJvcHMuYXBwbHlCdXR0b25BY3Rpb24sXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgcmVmOiBwYXJhbU5hbWUgKyAnLVNVQicsXG4gICAgICAgICAgICAgICAga2V5OiBwYXJhbU5hbWUgKyAnLVNVQicsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnc3ViLWZvcm0nLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHN3aXRjaFZhbHVlc1t2YWx1ZXNbcGFyYW1OYW1lXV0uZmllbGRzLFxuICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGRlcHRoOiB0aGlzLnByb3BzLmRlcHRoICsgMSxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgICBjaGVja0hhc0hlbHBlcjogdGhpcy5wcm9wcy5jaGVja0hhc0hlbHBlcixcbiAgICAgICAgICAgICAgICBzZXRIZWxwZXJEYXRhOiB0aGlzLnByb3BzLnNldEhlbHBlckRhdGEsXG4gICAgICAgICAgICAgICAgaGVscGVyVGVzdEZvcjogdmFsdWVzW3BhcmFtTmFtZV0sXG4gICAgICAgICAgICAgICAgYWNjb3JkaW9uaXplSWZHcm91cHNNb3JlVGhhbjogNSxcbiAgICAgICAgICAgICAgICBvbkFsdFRleHRTd2l0Y2g6IG9uQWx0VGV4dFN3aXRjaCxcbiAgICAgICAgICAgICAgICBhbHRUZXh0U3dpdGNoSWNvbjogYWx0VGV4dFN3aXRjaEljb24sXG4gICAgICAgICAgICAgICAgYWx0VGV4dFN3aXRjaFRpcDogYWx0VGV4dFN3aXRjaFRpcFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc3ViLWZvcm0tZ3JvdXAnIH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZm9ybS1sZWdlbmQnIH0sXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlc1snZGVzY3JpcHRpb24nXSxcbiAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgaGVscGVyTWFya1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgICAgc3ViRm9ybVxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBfY3JlYXRlQ2xhc3MoX2RlZmF1bHQsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ3Byb3BUeXBlcycsXG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBwYXJhbUF0dHJpYnV0ZXM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgICAgIHBhcmFtZXRlcnM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgICAgICAgICAgdmFsdWVzOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgICAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIF9kZWZhdWx0O1xufSkoUmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gX2RlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9Gb3JtUGFuZWwgPSByZXF1aXJlKCcuL0Zvcm1QYW5lbCcpO1xuXG52YXIgX0Zvcm1QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Gb3JtUGFuZWwpO1xuXG52YXIgVVBfQVJST1cgPSAnbWRpIG1kaS1jaGV2cm9uLXVwJztcbnZhciBET1dOX0FSUk9XID0gJ21kaSBtZGktY2hldnJvbi1kb3duJztcbnZhciBSRU1PVkUgPSAnbWRpIG1kaS1jbG9zZSc7XG52YXIgQUREX1ZBTFVFID0gJ21kaSBtZGktcGx1cyc7XG5cbnZhciBSZXBsaWNhdGVkR3JvdXAgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUmVwbGljYXRlZEdyb3VwLCBfQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFJlcGxpY2F0ZWRHcm91cChwcm9wcywgY29udGV4dCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVwbGljYXRlZEdyb3VwKTtcblxuICAgICAgICBfQ29tcG9uZW50LmNhbGwodGhpcywgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB2YXIgc3ViVmFsdWVzID0gcHJvcHMuc3ViVmFsdWVzO1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9IHByb3BzLnBhcmFtZXRlcnM7XG5cbiAgICAgICAgdmFyIGZpcnN0UGFyYW0gPSBwYXJhbWV0ZXJzWzBdO1xuICAgICAgICB2YXIgaW5zdGFuY2VWYWx1ZSA9IHN1YlZhbHVlc1tmaXJzdFBhcmFtWyduYW1lJ11dIHx8ICcnO1xuICAgICAgICB0aGlzLnN0YXRlID0geyB0b2dnbGVkOiAhaW5zdGFuY2VWYWx1ZSB9O1xuICAgIH1cblxuICAgIFJlcGxpY2F0ZWRHcm91cC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgZGVwdGggPSBfcHJvcHMuZGVwdGg7XG4gICAgICAgIHZhciBvblN3YXBVcCA9IF9wcm9wcy5vblN3YXBVcDtcbiAgICAgICAgdmFyIG9uU3dhcERvd24gPSBfcHJvcHMub25Td2FwRG93bjtcbiAgICAgICAgdmFyIG9uUmVtb3ZlID0gX3Byb3BzLm9uUmVtb3ZlO1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9IF9wcm9wcy5wYXJhbWV0ZXJzO1xuICAgICAgICB2YXIgc3ViVmFsdWVzID0gX3Byb3BzLnN1YlZhbHVlcztcbiAgICAgICAgdmFyIGRpc2FibGVkID0gX3Byb3BzLmRpc2FibGVkO1xuICAgICAgICB2YXIgb25BZGRWYWx1ZSA9IF9wcm9wcy5vbkFkZFZhbHVlO1xuICAgICAgICB2YXIgdG9nZ2xlZCA9IHRoaXMuc3RhdGUudG9nZ2xlZDtcblxuICAgICAgICB2YXIgdW5pcXVlID0gcGFyYW1ldGVycy5sZW5ndGggPT09IDE7XG4gICAgICAgIHZhciBmaXJzdFBhcmFtID0gcGFyYW1ldGVyc1swXTtcbiAgICAgICAgdmFyIGluc3RhbmNlVmFsdWUgPSBzdWJWYWx1ZXNbZmlyc3RQYXJhbVsnbmFtZSddXSB8fCBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsMC4zMyknIH0gfSxcbiAgICAgICAgICAgICdFbXB0eSBWYWx1ZSdcbiAgICAgICAgKTtcbiAgICAgICAgdmFyIGliU3R5bGVzID0geyB3aWR0aDogMzYsIGhlaWdodDogMzYsIHBhZGRpbmc6IDYgfTtcblxuICAgICAgICBpZiAodW5pcXVlKSB7XG4gICAgICAgICAgICB2YXIgZGlzU3R5bGUgPSB7IG9wYWNpdHk6IC4zIH07XG4gICAgICAgICAgICB2YXIgcmVtU3R5bGUgPSAhISFvblJlbW92ZSB8fCBkaXNhYmxlZCA/IGRpc1N0eWxlIDoge307XG4gICAgICAgICAgICB2YXIgdXBTdHlsZSA9ICEhIW9uU3dhcFVwIHx8IGRpc2FibGVkID8gZGlzU3R5bGUgOiB7fTtcbiAgICAgICAgICAgIHZhciBkb3duU3R5bGUgPSAhISFvblN3YXBEb3duIHx8IGRpc2FibGVkID8gZGlzU3R5bGUgOiB7fTtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCB3aWR0aDogJzEwMCUnIH0gfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfRm9ybVBhbmVsMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczogc3ViVmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdyZXBsaWNhYmxlLXVuaXF1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aDogLTEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiAwIH1cbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZvbnRTaXplOiAyNCwgcGFkZGluZ0xlZnQ6IDQsIHBhZGRpbmdUb3A6IDIgfSB9LFxuICAgICAgICAgICAgICAgICAgICBvbkFkZFZhbHVlICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogQUREX1ZBTFVFLCBzdHlsZTogeyBwYWRkaW5nOiAnOHB4IDRweCcsIGN1cnNvcjogJ3BvaW50ZXInIH0sIG9uQ2xpY2s6IG9uQWRkVmFsdWUgfSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiBSRU1PVkUsIHN0eWxlOiBfZXh0ZW5kcyh7IHBhZGRpbmc6ICc4cHggNHB4JywgY3Vyc29yOiAncG9pbnRlcicgfSwgcmVtU3R5bGUpLCBvbkNsaWNrOiBvblJlbW92ZSB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIHBhZGRpbmc6ICcwIDRweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6IFVQX0FSUk9XLCBzdHlsZTogX2V4dGVuZHMoeyBoZWlnaHQ6IDE2LCBjdXJzb3I6ICdwb2ludGVyJyB9LCB1cFN0eWxlKSwgb25DbGljazogb25Td2FwVXAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IGNsYXNzTmFtZTogRE9XTl9BUlJPVywgc3R5bGU6IF9leHRlbmRzKHsgaGVpZ2h0OiAxNiwgY3Vyc29yOiAncG9pbnRlcicgfSwgZG93blN0eWxlKSwgb25DbGljazogb25Td2FwRG93biB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICB7IHpEZXB0aDogMCwgc3R5bGU6IHsgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlc21va2UnLCBtYXJnaW5Cb3R0b206IDggfSB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktbWVudS0nICsgKHRoaXMuc3RhdGUudG9nZ2xlZCA/ICdkb3duJyA6ICdyaWdodCcpLCBpY29uU3R5bGU6IHsgY29sb3I6ICdyZ2JhKDAsMCwwLC4xNSknIH0sIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHRvZ2dsZWQ6ICFfdGhpcy5zdGF0ZS50b2dnbGVkIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZm9udFNpemU6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VWYWx1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG9uQWRkVmFsdWUgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IHN0eWxlOiBpYlN0eWxlcywgaWNvbkNsYXNzTmFtZTogQUREX1ZBTFVFLCBvblRvdWNoVGFwOiBvbkFkZFZhbHVlIH0pLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IGliU3R5bGVzLCBpY29uQ2xhc3NOYW1lOiBSRU1PVkUsIG9uVG91Y2hUYXA6IG9uUmVtb3ZlLCBkaXNhYmxlZDogISEhb25SZW1vdmUgfHwgZGlzYWJsZWQgfSksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBzdHlsZTogaWJTdHlsZXMsIGljb25DbGFzc05hbWU6IFVQX0FSUk9XLCBvblRvdWNoVGFwOiBvblN3YXBVcCwgZGlzYWJsZWQ6ICEhIW9uU3dhcFVwIHx8IGRpc2FibGVkIH0pLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IGliU3R5bGVzLCBpY29uQ2xhc3NOYW1lOiBET1dOX0FSUk9XLCBvblRvdWNoVGFwOiBvblN3YXBEb3duLCBkaXNhYmxlZDogISEhb25Td2FwRG93biB8fCBkaXNhYmxlZCB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICB0b2dnbGVkICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX0Zvcm1QYW5lbDJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgICAgICAgICB0YWJzOiBudWxsLFxuICAgICAgICAgICAgICAgIHZhbHVlczogc3ViVmFsdWVzLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBudWxsLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3JlcGxpY2FibGUtZ3JvdXAnLFxuICAgICAgICAgICAgICAgIGRlcHRoOiAtMVxuICAgICAgICAgICAgfSkpXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHJldHVybiBSZXBsaWNhdGVkR3JvdXA7XG59KShfcmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUmVwbGljYXRlZEdyb3VwO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9SZXBsaWNhdGVkR3JvdXAgPSByZXF1aXJlKCcuL1JlcGxpY2F0ZWRHcm91cCcpO1xuXG52YXIgX1JlcGxpY2F0ZWRHcm91cDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9SZXBsaWNhdGVkR3JvdXApO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgSWNvbkJ1dHRvbiA9IF9yZXF1aXJlLkljb25CdXR0b247XG5cbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG52YXIgTGFuZ1V0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbi8qKlxuICogU3ViIGZvcm0gcmVwbGljYXRpbmcgaXRzZWxmICgrLy0pXG4gKi9cblxudmFyIF9kZWZhdWx0ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKF9kZWZhdWx0LCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIF9kZWZhdWx0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBfZGVmYXVsdCk7XG5cbiAgICAgICAgX1JlYWN0JENvbXBvbmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIHRoaXMuYnVpbGRTdWJWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIHZhciBzdWJWYWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgc3VmZml4ID0gaW5kZXggPT0gMCA/ICcnIDogJ18nICsgaW5kZXg7XG4gICAgICAgICAgICBfdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgIHZhciBwTmFtZSA9IHBbJ25hbWUnXTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzW3BOYW1lICsgc3VmZml4XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3ViVmFsKSBzdWJWYWwgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgc3ViVmFsW3BOYW1lXSA9IHZhbHVlc1twTmFtZSArIHN1ZmZpeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gc3ViVmFsIHx8IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW5kZXhlZFZhbHVlcyA9IGZ1bmN0aW9uIChyb3dzQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgICAgICAgICAgdmFsdWVzID0ge307XG4gICAgICAgICAgICByb3dzQXJyYXkubWFwKGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VmZml4ID0gaW5kZXggPT0gMCA/ICcnIDogJ18nICsgaW5kZXg7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcCBpbiByb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb3cuaGFzT3duUHJvcGVydHkocCkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbcCArIHN1ZmZpeF0gPSByb3dbcF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbmRleFZhbHVlcyA9IGZ1bmN0aW9uIChyb3dzQXJyYXksIHJlbW92ZUxhc3RSb3cpIHtcbiAgICAgICAgICAgIHZhciBpbmRleGVkID0gX3RoaXMuaW5kZXhlZFZhbHVlcyhyb3dzQXJyYXkpO1xuICAgICAgICAgICAgaWYgKF90aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZUxhc3RSb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYXN0Um93ID0ge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEluZGV4ID0gcm93c0FycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RSb3dbcFsnbmFtZSddICsgKG5leHRJbmRleCA+IDAgPyAnXycgKyBuZXh0SW5kZXggOiAnJyldID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLm9uQ2hhbmdlKGluZGV4ZWQsIHRydWUsIGxhc3RSb3cpO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLm9uQ2hhbmdlKGluZGV4ZWQsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluc3RhbmNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIEFuYWx5emUgY3VycmVudCB2YWx1ZSB0byBncmFiIG51bWJlciBvZiByb3dzLlxuICAgICAgICAgICAgdmFyIHJvd3MgPSBbXSxcbiAgICAgICAgICAgICAgICBzdWJWYWwgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHN1YlZhbCA9IF90aGlzLmJ1aWxkU3ViVmFsdWUoX3RoaXMucHJvcHMudmFsdWVzLCBpbmRleCkpIHtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIHJvd3MucHVzaChzdWJWYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZpcnN0UGFyYW0gPSBfdGhpcy5wcm9wcy5wYXJhbWV0ZXJzWzBdO1xuICAgICAgICAgICAgaWYgKCFyb3dzLmxlbmd0aCAmJiBmaXJzdFBhcmFtWydyZXBsaWNhdGlvbk1hbmRhdG9yeSddID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW1wdHlWYWx1ZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5wYXJhbWV0ZXJzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHlWYWx1ZVtwWyduYW1lJ11dID0gcFsnZGVmYXVsdCddIHx8ICcnO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKGVtcHR5VmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcm93cztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkZFJvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHt9LFxuICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZXMgPSBfdGhpcy5pbnN0YW5jZXMoKTtcbiAgICAgICAgICAgIF90aGlzLnByb3BzLnBhcmFtZXRlcnMubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWVbcFsnbmFtZSddXSA9IHBbJ2RlZmF1bHQnXSB8fCAnJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY3VycmVudFZhbHVlcy5wdXNoKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIF90aGlzLmluZGV4VmFsdWVzKGN1cnJlbnRWYWx1ZXMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlUm93ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgaW5zdGFuY2VzID0gX3RoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgICAgICB2YXIgcmVtb3ZlSW5zdCA9IGluc3RhbmNlc1tpbmRleF07XG4gICAgICAgICAgICBpbnN0YW5jZXMgPSBMYW5nVXRpbHMuYXJyYXlXaXRob3V0KF90aGlzLmluc3RhbmNlcygpLCBpbmRleCk7XG4gICAgICAgICAgICBpbnN0YW5jZXMucHVzaChyZW1vdmVJbnN0KTtcbiAgICAgICAgICAgIF90aGlzLmluZGV4VmFsdWVzKGluc3RhbmNlcywgdHJ1ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zd2FwUm93cyA9IGZ1bmN0aW9uIChpLCBqKSB7XG4gICAgICAgICAgICB2YXIgaW5zdGFuY2VzID0gX3RoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgICAgICB2YXIgdG1wID0gaW5zdGFuY2VzW2pdO1xuICAgICAgICAgICAgaW5zdGFuY2VzW2pdID0gaW5zdGFuY2VzW2ldO1xuICAgICAgICAgICAgaW5zdGFuY2VzW2ldID0gdG1wO1xuICAgICAgICAgICAgX3RoaXMuaW5kZXhWYWx1ZXMoaW5zdGFuY2VzKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gZnVuY3Rpb24gKGluZGV4LCBuZXdWYWx1ZXMsIGRpcnR5KSB7XG4gICAgICAgICAgICB2YXIgaW5zdGFuY2VzID0gX3RoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgICAgICBpbnN0YW5jZXNbaW5kZXhdID0gbmV3VmFsdWVzO1xuICAgICAgICAgICAgX3RoaXMuaW5kZXhWYWx1ZXMoaW5zdGFuY2VzKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uUGFyYW1ldGVyQ2hhbmdlID0gZnVuY3Rpb24gKGluZGV4LCBwYXJhbU5hbWUsIG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGluc3RhbmNlcyA9IF90aGlzLmluc3RhbmNlcygpO1xuICAgICAgICAgICAgaW5zdGFuY2VzW2luZGV4XVtwYXJhbU5hbWVdID0gbmV3VmFsdWU7XG4gICAgICAgICAgICBfdGhpcy5pbmRleFZhbHVlcyhpbnN0YW5jZXMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9kZWZhdWx0LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9IF9wcm9wcy5wYXJhbWV0ZXJzO1xuICAgICAgICB2YXIgZGlzYWJsZWQgPSBfcHJvcHMuZGlzYWJsZWQ7XG5cbiAgICAgICAgdmFyIGZpcnN0UGFyYW0gPSBwYXJhbWV0ZXJzWzBdO1xuICAgICAgICB2YXIgcmVwbGljYXRpb25UaXRsZSA9IGZpcnN0UGFyYW1bJ3JlcGxpY2F0aW9uVGl0bGUnXSB8fCBmaXJzdFBhcmFtWydsYWJlbCddO1xuICAgICAgICB2YXIgcmVwbGljYXRpb25EZXNjcmlwdGlvbiA9IGZpcnN0UGFyYW1bJ3JlcGxpY2F0aW9uRGVzY3JpcHRpb24nXSB8fCBmaXJzdFBhcmFtWydkZXNjcmlwdGlvbiddO1xuICAgICAgICB2YXIgcmVwbGljYXRpb25NYW5kYXRvcnkgPSBmaXJzdFBhcmFtWydyZXBsaWNhdGlvbk1hbmRhdG9yeSddID09PSAndHJ1ZSc7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlcyA9IHRoaXMuaW5zdGFuY2VzKCk7XG4gICAgICAgIHZhciBtdWx0aXBsZVJvd3MgPSBpbnN0YW5jZXMubGVuZ3RoID4gMTtcbiAgICAgICAgdmFyIG11bHRpcGxlUGFyYW1zID0gcGFyYW1ldGVycy5sZW5ndGggPiAxO1xuICAgICAgICB2YXIgcm93cyA9IGluc3RhbmNlcy5tYXAoZnVuY3Rpb24gKHN1YlZhbHVlcywgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBvblN3YXBVcCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBvblN3YXBEb3duID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG9uUmVtb3ZlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIG9uUGFyYW1ldGVyQ2hhbmdlID0gZnVuY3Rpb24gb25QYXJhbWV0ZXJDaGFuZ2UocGFyYW1OYW1lLCBuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIub25QYXJhbWV0ZXJDaGFuZ2UoaW5kZXgsIHBhcmFtTmFtZSwgbmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobXVsdGlwbGVSb3dzICYmIGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIG9uU3dhcFVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc3dhcFJvd3MoaW5kZXgsIGluZGV4IC0gMSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtdWx0aXBsZVJvd3MgJiYgaW5kZXggPCBpbnN0YW5jZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIG9uU3dhcERvd24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zd2FwUm93cyhpbmRleCwgaW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG11bHRpcGxlUm93cyB8fCAhcmVwbGljYXRpb25NYW5kYXRvcnkpIHtcbiAgICAgICAgICAgICAgICBvblJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnJlbW92ZVJvdyhpbmRleCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwcm9wcyA9IHsgb25Td2FwVXA6IG9uU3dhcFVwLCBvblN3YXBEb3duOiBvblN3YXBEb3duLCBvblJlbW92ZTogb25SZW1vdmUsIG9uUGFyYW1ldGVyQ2hhbmdlOiBvblBhcmFtZXRlckNoYW5nZSB9O1xuICAgICAgICAgICAgaWYgKHJlcGxpY2F0aW9uTWFuZGF0b3J5ICYmIGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcHJvcHMub25BZGRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi5hZGRSb3coKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX1JlcGxpY2F0ZWRHcm91cDJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoeyBrZXk6IGluZGV4IH0sIF90aGlzMi5wcm9wcywgcHJvcHMsIHsgc3ViVmFsdWVzOiBzdWJWYWx1ZXMgfSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVwbGljYXRpb25NYW5kYXRvcnkpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncmVwbGljYWJsZS1maWVsZCcsIHN0eWxlOiB7IG1hcmdpbkJvdHRvbTogMTQgfSB9LFxuICAgICAgICAgICAgICAgIHJvd3NcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdFN0eWxlID0gcm93cy5sZW5ndGggPyB7fSA6IHsgYmFja2dyb3VuZENvbG9yOiAnd2hpdGVzbW9rZScsIGJvcmRlclJhZGl1czogNCB9O1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdyZXBsaWNhYmxlLWZpZWxkJywgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxNCB9IH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9LCB0U3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7IGtleTogJ2FkZCcsIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLXBsdXMtYm94LW91dGxpbmUnLCB0b29sdGlwUG9zaXRpb246IFwidG9wLXJpZ2h0XCIsIHN0eWxlOiB7IGhlaWdodDogMzYsIHdpZHRoOiAzNiwgcGFkZGluZzogNiB9LCBpY29uU3R5bGU6IHsgZm9udFNpemU6IDI0IH0sIHRvb2x0aXA6ICdBZGQgdmFsdWUnLCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMyLmFkZFJvdygpO1xuICAgICAgICAgICAgICAgICAgICB9LCBkaXNhYmxlZDogZGlzYWJsZWQgfSksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndGl0bGUnLCBzdHlsZTogeyBmb250U2l6ZTogMTYsIGZsZXg6IDEgfSB9LFxuICAgICAgICAgICAgICAgICAgICByZXBsaWNhdGlvblRpdGxlXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHJvd3NcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgX2NyZWF0ZUNsYXNzKF9kZWZhdWx0LCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdwcm9wVHlwZXMnLFxuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgcGFyYW1ldGVyczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgICAgICAgICB2YWx1ZXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgICAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgICAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgICAgICBiaW5hcnlfY29udGV4dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgIGRlcHRoOiBQcm9wVHlwZXMubnVtYmVyXG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9XSk7XG5cbiAgICByZXR1cm4gX2RlZmF1bHQ7XG59KShSZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBfZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIl19

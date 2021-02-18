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

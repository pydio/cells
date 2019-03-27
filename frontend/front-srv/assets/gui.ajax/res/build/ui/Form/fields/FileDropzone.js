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

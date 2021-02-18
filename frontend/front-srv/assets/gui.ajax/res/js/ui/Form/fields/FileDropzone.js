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

const React = require('react')

/**
 * UI to drop a file (or click to browse), used by the InputImage component.
 */
class FileDropzone extends React.Component{

    constructor(props) {
        super({onDrop:function(){}, ...props});
        this.state = {
            isDragActive: false,
            supportClick: props.supportClick === undefined ? true : props.supportClick,
            multiple: props.multiple === undefined ? true : props.multiple,
        }

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

    onDragLeave(e) {
        this.setState({
            isDragActive: false
        });
    }

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";

        this.setState({
            isDragActive: true
        });
    }

    onFilePicked(e){
        if(!e.target || !e.target.files) {
            return;
        }
        let files = e.target.files;
        const maxFiles = (this.state.multiple) ? files.length : 1;
        files = Array.prototype.slice.call(files, 0, maxFiles);
        if (this.props.onDrop) {
            this.props.onDrop(files, e, this);
        }
    }

    onFolderPicked(e){
        if(this.props.onFolderPicked){
            this.props.onFolderPicked(e.target.files);
        }
    }

    onDrop(e) {

        this.setState({
            isDragActive: false
        });
        e.preventDefault();
        if(this.props.ignoreNativeDrop){
            return;
        }

        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }

        const maxFiles = (this.state.multiple) ? files.length : 1;
        for (let i = 0; i < maxFiles; i++) {
            files[i].preview = URL.createObjectURL(files[i]);
        }

        if (this.props.onDrop) {
            files = Array.prototype.slice.call(files, 0, maxFiles);
            this.props.onDrop(files, e, this);
        }
    }

    onClick() {
        if (this.state.supportClick === true) {
            this.open();
        }
    }

    open() {
        this.refs.fileInput.click();
    }

    openFolderPicker(){
        this.refs.folderInput.setAttribute("webkitdirectory", "true");
        this.refs.folderInput.click();
    }

    render() {

        let className = this.props.className || 'file-dropzone';
        if (this.state.isDragActive) {
            className += ' active';
        }

        let style = {
            width: this.props.size || 100,
            height: this.props.size || 100,
            //borderStyle: this.state.isDragActive ? "solid" : "dashed"
        };
        if(this.props.style){
            style = {...style, ...this.props.style};
        }
        if(this.state.isDragActive && this.props.dragActiveStyle){
            style = {...style, ...this.props.dragActiveStyle};
        }
        let folderInput;
        if(this.props.enableFolders){
            folderInput = <input style={{display:'none'}} name="userfolder" type="file" ref="folderInput" onChange={(e) => this.onFolderPicked(e)}/>;
        }
        return (
            <div className={className} style={style} onClick={this.onClick.bind(this)} onDragLeave={this.onDragLeave.bind(this)} onDragOver={this.onDragOver.bind(this)} onDrop={this.onDrop.bind(this)}>
                <input style={{display:'none'}} name="userfile" type="file" multiple={this.state.multiple} ref="fileInput" value={""} onChange={this.onFilePicked.bind(this)} accept={this.props.accept}/>
                {folderInput}
                {this.props.children}
            </div>
        );
    }

}

export default FileDropzone
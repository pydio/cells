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

import FormMixin from '../mixins/FormMixin'
import FileDropzone from './FileDropzone'
import React from 'react';
import PydioApi from 'pydio/http/api';
import Pydio from 'pydio'
import LangUtils from 'pydio/util/lang'
const {NativeFileDropProvider} = Pydio.requireLib('hoc');

// Just enable the drop mechanism, but do nothing, it is managed by the FileDropzone
const BinaryDropZone = NativeFileDropProvider(FileDropzone, (items, files, props) => {});

/**
 * UI for displaying and uploading an image,
 * using the binaryContext string.
 */
export default React.createClass({

    mixins:[FormMixin],

    propTypes: {
        attributes: React.PropTypes.object,
        binary_context: React.PropTypes.string
    },

    componentWillReceiveProps(newProps){
        let imgSrc;
        if((newProps.value || (newProps.binary_context && newProps.binary_context !== this.props.binary_context)) && !this.state.reset){
            imgSrc = this.getBinaryUrl(newProps, (this.state.temporaryBinary && this.state.temporaryBinary===newProps.value));
        }else if(newProps.attributes['defaultImage']){
            imgSrc = newProps.attributes['defaultImage'];
        }
        if(imgSrc){
            this.setState({imageSrc:imgSrc, reset:false});
        }
    },

    getInitialState(){
        let imgSrc, originalBinary;
        if(this.props.value){
            imgSrc = this.getBinaryUrl(this.props);
            originalBinary = this.props.value;
        }else if(this.props.attributes['defaultImage']){
            imgSrc = this.props.attributes['defaultImage'];
        }
        return {imageSrc:imgSrc, originalBinary:originalBinary};
    },

    getBinaryUrl(props){
        const pydio = PydioApi.getClient().getPydioObject();
        let url = pydio.Parameters.get('ENDPOINT_REST_API') + props.attributes['loadAction'];
        let bId = props.value;
        if(props.binary_context && props.binary_context.indexOf('user_id=') === 0){
            bId = props.binary_context.replace('user_id=', '');
        }
        url = url.replace('{BINARY}', bId);
        return url;
    },

    getUploadUrl(){
        const pydio = PydioApi.getClient().getPydioObject();
        let url = pydio.Parameters.get('ENDPOINT_REST_API') + this.props.attributes['uploadAction'];
        let bId = '';
        if(this.props.binary_context && this.props.binary_context.indexOf('user_id=') === 0){
            bId = this.props.binary_context.replace('user_id=', '');
        } else if (this.props.value) {
            bId = this.props.value
        } else {
            bId = LangUtils.computeStringSlug(this.props.attributes["name"] + ".png");
        }
        url = url.replace('{BINARY}', bId);
        return url;
    },

    uploadComplete(newBinaryName){
        const prevValue = this.state.value;
        this.setState({
            temporaryBinary:newBinaryName,
            value:null
        });
        if(this.props.onChange){
            let additionalFormData = {type:'binary'};
            if(this.state.originalBinary){
                additionalFormData['original_binary'] = this.state.originalBinary;
            }
            this.props.onChange(newBinaryName, prevValue, additionalFormData);
        }
    },

    htmlUpload(){
        window.formManagerHiddenIFrameSubmission = function(result){
            this.uploadComplete(result.trim());
            window.formManagerHiddenIFrameSubmission = null;
        }.bind(this);
        this.refs.uploadForm.submit();
    },

    onDrop(files, event, dropzone){
        if(PydioApi.supportsUpload()){
            this.setState({loading:true});
            PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                const xhrSettings = {customHeaders:{Authorization: 'Bearer ' + jwt}};
                PydioApi.getClient().uploadFile(files[0], "userfile", '',
                    function(transport){
                        const result = JSON.parse(transport.responseText);
                        if(result && result.binary){
                            this.uploadComplete(result.binary);
                        }
                        this.setState({loading:false});
                    }.bind(this), function(transport){
                        // error
                        this.setState({loading:false});
                    }.bind(this), function(computableEvent){
                        // progress
                        // console.log(computableEvent);
                    },
                    this.getUploadUrl(),
                    xhrSettings
                );
            })
        }else{
            this.htmlUpload();
        }
    },

    clearImage(){
        if(global.confirm('Do you want to remove the current image?')){
            const prevValue = this.state.value;
            this.setState({
                value:null,
                reset:true
            }, function(){
                this.props.onChange('', prevValue, {type:'binary'});
            }.bind(this));

        }
    },

    render(){
        const coverImageStyle = {
            backgroundImage:"url("+this.state.imageSrc+")",
            backgroundPosition:"50% 50%",
            backgroundSize:"cover"
        };
        let icons = [];
        if(this.state && this.state.loading){
            icons.push(<span key="spinner" className="icon-spinner rotating" style={{opacity:'0'}}></span>);
        }else{
            icons.push(<span key="camera" className="icon-camera" style={{opacity:'0'}}></span>);
        }

        return(
            <div>
                <div className="image-label">{this.props.attributes.label}</div>
                <form ref="uploadForm" encType="multipart/form-data" target="uploader_hidden_iframe" method="post" action={this.getUploadUrl()}>
                    <BinaryDropZone onDrop={this.onDrop} accept="image/*" style={coverImageStyle}>
                        {icons}
                    </BinaryDropZone>
                </form>
                <div className="binary-remove-button" onClick={this.clearImage}><span key="remove" className="mdi mdi-close"></span> RESET</div>
                <iframe style={{display:"none"}} id="uploader_hidden_iframe" name="uploader_hidden_iframe"></iframe>
            </div>
        );
    }

});
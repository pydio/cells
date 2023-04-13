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

import React from 'react';
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api';
import FileDropzone from './FileDropzone'
import LangUtils from 'pydio/util/lang'
import {CircularProgress} from 'material-ui'
const {NativeFileDropProvider} = Pydio.requireLib('hoc');

// Just enable the drop mechanism, but do nothing, it is managed by the FileDropzone
const BinaryDropZone = NativeFileDropProvider(FileDropzone, (items, files, props) => {});

/**
 * UI for displaying and uploading an image,
 * using the binaryContext string.
 */
class InputImage extends React.Component {

    // propTypes: {
    //     attributes: React.PropTypes.object,
    //     binary_context: React.PropTypes.string
    // },

    constructor(props) {
        super(props);
        let imageSrc, originalBinary;
        if(this.props.value){
            imageSrc = this.getBinaryUrl(this.props);
            originalBinary = this.props.value;
        }else if(this.props.attributes['defaultImage']){
            imageSrc = this.props.attributes['defaultImage'];
        }
        this.state = {
            imageSrc,
            originalBinary,
            value: this.props.value
        };
    }

    componentWillReceiveProps(newProps){
        let imgSrc;
        if((newProps.value || (newProps.binary_context && newProps.binary_context !== this.props.binary_context)) && !this.state.reset){
            imgSrc = this.getBinaryUrl(newProps, (this.state.temporaryBinary && this.state.temporaryBinary===newProps.value));
        }else if(newProps.attributes['defaultImage']){
            imgSrc = newProps.attributes['defaultImage'];
        }
        if(imgSrc){
            this.setState({imageSrc:imgSrc, reset:false, value: newProps.value});
        }
    }

    getBinaryUrl(props){
        const pydio = PydioApi.getClient().getPydioObject();
        let url = pydio.Parameters.get('ENDPOINT_REST_API') + props.attributes['loadAction'];
        let bId = props.value;
        if(props.binary_context && props.binary_context.indexOf('user_id=') === 0){
            bId = props.binary_context.replace('user_id=', '');
        }
        url = url.replace('{BINARY}', bId);
        return url;
    }

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
    }

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
            this.setState({
                dirty:true,
                value:newBinaryName
            });
        }
    }

    htmlUpload(){
        window.formManagerHiddenIFrameSubmission = function(result){
            this.uploadComplete(result.trim());
            window.formManagerHiddenIFrameSubmission = null;
        }.bind(this);
        this.refs.uploadForm.submit();
    }

    onDrop(files, event, dropzone){
        if (files.length === 0) {
            return
        }
        const messages = Pydio.getMessages();
        const {name} = this.props;
        if (name === 'avatar' && files[0].size > 5 * 1024 * 1024) {
            this.setState({error: messages['form.input-image.avatarMax']});
            return
        }
        if(['image/jpeg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'].indexOf(files[0].type) === -1){
            this.setState({error: messages['form.input-image.fileTypes']});
            return
        }
        this.setState({error: null});
        if(PydioApi.supportsUpload()){
            this.setState({loading:true});
            PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                const xhrSettings = {customHeaders:{Authorization: 'Bearer ' + jwt}};
                PydioApi.getClient().uploadFile(files[0], "userfile", '',
                    (transport) => {
                        const result = JSON.parse(transport.responseText);
                        if(result && result.binary){
                            this.uploadComplete(result.binary);
                        }
                        this.setState({loading:false});
                    }, (error) => {
                        // error
                        this.setState({loading:false, error: error});
                    }, (computableEvent)=>{
                        // progress, not really useful for small uploads
                        // console.log(computableEvent);
                    },
                    this.getUploadUrl(),
                    xhrSettings
                );
            })
        }else{
            this.htmlUpload();
        }
    }

    clearImage(){
        if(confirm(Pydio.getMessages()['form.input-image.clearConfirm'])){
            const prevValue = this.state.value;
            this.setState({
                value:null,
                error: null,
                reset:true
            }, function(){
                this.props.onChange('', prevValue, {type:'binary'});
            }.bind(this));

        }
    }

    render(){
        const {loading, error} = this.state;
        let {imageSrc} = this.state;
        const {attributes} =  this.props;

        const isDefault = (attributes['defaultImage'] === imageSrc);
        if(imageSrc.indexOf('[mode]') > -1) {
            imageSrc = imageSrc.replace('[mode]', 'light')
        }

        const coverImageStyle = {
            backgroundImage:"url("+imageSrc+")",
            backgroundPosition:"50% 50%",
            backgroundSize:"cover",
            position:'relative'
        };
        let overlay, overlayBg = {};

        if(error){
            overlayBg = {backgroundColor: 'rgba(255, 255, 255, 0.77)', borderRadius: '50%'};
            overlay = (
                <div style={{color:'#F44336', textAlign:'center', fontSize: 11, cursor:'pointer'}} onClick={()=>{this.setState({error: null})}}>
                    <span className={"mdi mdi-alert"} style={{fontSize: 40}}/><br/>
                    {error}
                </div>
            );
        } else if(loading){
            overlay = <CircularProgress mode={"indeterminate"}/>;
        }else{
            overlay = <span className={"mdi mdi-camera"} style={{fontSize: 40, opacity: .5, color:isDefault?null:'white'}}/>
        }

        const {variant} = this.props

        return(
            <div style={variant==='v2'?{backgroundColor:'#f6f6f8'}:null}>
                <div className="image-label">{attributes.label}</div>
                <form ref="uploadForm" encType="multipart/form-data" target="uploader_hidden_iframe" method="post" action={this.getUploadUrl()}>
                    <BinaryDropZone onDrop={this.onDrop.bind(this)} accept="image/*" style={coverImageStyle}>
                        <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', ...overlayBg}}>{overlay}</div>
                    </BinaryDropZone>
                </form>
                {!isDefault &&
                <div className="binary-remove-button" onClick={this.clearImage.bind(this)}>
                    <span key="remove" className="mdi mdi-close"></span> {Pydio.getMessages()['form.input-image.clearButton']}
                </div>
                }
                <iframe style={{display:"none"}} id="uploader_hidden_iframe" name="uploader_hidden_iframe"></iframe>
            </div>
        );
    }

}

export default InputImage
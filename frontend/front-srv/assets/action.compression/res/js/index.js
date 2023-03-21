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
import Pydio from 'pydio'
import React from 'react'
import createReactClass from 'create-react-class'
import PydioApi from 'pydio/http/api'
import {JobsServiceApi, RestUserJobRequest} from 'cells-sdk'
import PathUtils from 'pydio/util/path'
import {MenuItem, FlatButton} from 'material-ui'
const {ModernTextField, ModernSelectField} = Pydio.requireLib("hoc");
const {ActionDialogMixin} = Pydio.requireLib("boot")

let CompressionDialog = createReactClass({

    mixins:[
        ActionDialogMixin
    ],

    getDefaultProps: function(){
        let formats = ['zip', 'tar', 'tar.gz'];
        if(!pydio.Parameters.get('multipleFilesDownloadEnabled')){
            formats.pop();
        }
        return {
            dialogTitleId: 313,
            legendId: 314,
            dialogIsModal: true,
            formats: formats
        };
    },

    getInitialState: function(){

        let baseName;
        const {userSelection} = this.props;
        if(userSelection.isUnique()){
            baseName = PathUtils.getBasename(userSelection.getUniqueFileName());
            if(!userSelection.hasDir()) {
                baseName = baseName.substr(0, baseName.lastIndexOf("\."));
            }
        }else{
            baseName = PathUtils.getBasename(userSelection.getContextNode().getPath());
            if(baseName === "") {
                baseName = "Archive";
            }
        }
        let defaultCompression = this.props.formats[0];


        return {
            archiveBase:baseName,
            compression:defaultCompression,
            fileName: this.buildUniqueFileName(baseName, defaultCompression),
            loading: false
        }
    },

    getButtons(updater) {
        this._updater = updater;
        return this.makeButtons();
    },

    makeButtons() {
        const {loading} = this.state;
        return [
            <FlatButton
                key="cancel"
                label={this.props.pydio.MessageHash['49']}
                primary={false}
                onClick={() => this.dismiss()}
            />,
            <FlatButton
                label={this.props.pydio.MessageHash['48']}
                primary={true}
                keyboardFocused={true}
                disabled={loading}
                onClick={() => this.submit()}
            />
        ]
    },

    buildUniqueFileName: function(base, extension){
        let index=0;
        let result = base;
        let buff = base;
        while(this.props.userSelection.fileNameExists(result + '.' + extension, true)){
            if(index > 0) {
                result = buff + "-" + index;
            }
            index ++ ;
        }
        return result;
    },

    textFieldChange: function(event, newValue){
        this.setState({
            archiveBase:newValue,
            fileName: this.buildUniqueFileName(newValue, this.state.compression)
        });
    },

    selectFieldChange: function(event, index, payload){
        this.setState({
            compression:payload,
            fileName: this.buildUniqueFileName(this.state.archiveBase, payload)
        });
    },

    submit(){

        const files = this.props.userSelection.getFileNames();
        const repoSlug = this.props.pydio.user.getActiveRepositoryObject().getSlug();
        let archivePath = repoSlug + this.props.userSelection.getContextNode().getPath() + "/" + this.state.fileName + "." + this.state.compression;
        archivePath = archivePath.replace('//', '/');
        const job = RestUserJobRequest.constructFromObject({
            JobName: "compress",
            JsonParameters: JSON.stringify({
                archiveName: archivePath,
                format: this.state.compression,
                nodes: files.map(f => repoSlug + f),
            })
        });
        const api = new JobsServiceApi(PydioApi.getRestClient());
        this.setState({loading: true}, () => this._updater(this.makeButtons()))
        api.userCreateJob("compress", job).then(r => {
            this.dismiss();
            this.setState({loading: false}, () => this._updater(this.makeButtons()))
        }).catch(e => {
            this.setState({loading: false, err: e.message}, () => this._updater(this.makeButtons()))
        });

    },

    render: function(){
        const formatMenus = this.props.formats.map(function(f){
            return <MenuItem value={f} primaryText={'.' + f}/>
        });

        const messages = this.props.pydio.MessageHash;
        const {compression, fileName, err} = this.state;
        const flStyle = {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        };

        return (
            <div>
                <div style={{display:'flex'}}>
                    <ModernTextField
                        style={{width: 210, marginRight: 10}}
                        onChange={this.textFieldChange}
                        value={fileName}
                        floatingLabelText={messages['compression.4']}
                        floatingLabelStyle={flStyle}
                        variant={"v2"}
                    />
                    <ModernSelectField
                        style={{width: 160}}
                        onChange={this.selectFieldChange}
                        value={compression}
                        floatingLabelText={messages['compression.3']}
                        floatingLabelStyle={flStyle}
                        variant={"v2"}
                    >{formatMenus}</ModernSelectField>
                </div>
                {err && <div style={{color:'#e53935'}}>{err}</div>}
            </div>
        );
    }

});

class Callbacks{

    static compressUI(controller){
        const pydio = controller.getPydio();
        const userSelection = pydio.getUserSelection();
        if(!pydio.Parameters.get('multipleFilesDownloadEnabled')){
            return;
        }
        pydio.UI.openComponentInModal('CompressionActions', 'CompressionDialog', {userSelection:userSelection});

    }


    static extract(controller){
        const pydio = controller.getPydio();
        const userSelection = pydio.getUserSelection();
        if (!userSelection.isEmpty()) {

            const file = userSelection.getUniqueFileName();
            let ext = PathUtils.getFileExtension(file);
            if (ext === 'gz') {
                ext = 'tar.gz';
            }
            const repoSlug = pydio.user.getActiveRepositoryObject().getSlug();
            const job = RestUserJobRequest.constructFromObject({
                JobName: "extract",
                JsonParameters: JSON.stringify({
                    node: repoSlug + file,
                    format: ext,
                    target: "", // will be computed automatically
                })
            });
            const api = new JobsServiceApi(PydioApi.getRestClient());
            api.userCreateJob("extract", job);

        }
    }
}

export {CompressionDialog, Callbacks}
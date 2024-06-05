/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React from 'react'
import Pydio from 'pydio'
import {Checkbox, RadioButtonGroup, RadioButton, Subheader} from 'material-ui'
const {ThemedContainers:{Popover}} = Pydio.requireLib('hoc')

class UploadOptionsPane extends React.Component {
    
    updateField(fName, event){

        const {configs} = this.props;

        if(fName === 'autostart'){
            let toggleStart = configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true);
            toggleStart = !toggleStart;
            configs.updateOption('upload_auto_send', toggleStart, true);
        }else if(fName === 'autoclose'){
            let toggleStart = configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close', true);
            toggleStart = !toggleStart;
            configs.updateOption('upload_auto_close', toggleStart, true);
        }else if(fName === 'existing'){
            configs.updateOption('upload_existing', event.target.getSelectedValue());
        }else if(fName === 'show_processed'){
            let toggleShowProcessed = configs.getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false);
            toggleShowProcessed = !toggleShowProcessed;
            configs.updateOption('upload_show_processed', toggleShowProcessed, true);
        }
        this.setState({random: Math.random()});
    }

    radioChange(e, newValue) {
        const {configs} = this.props;

        configs.updateOption('upload_existing', newValue);
        this.setState({random: Math.random()});
    }

    render() {
        const {configs} = this.props;
        const pydio = Pydio.getInstance();

        let toggleStart = configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send');
        let toggleClose = configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close');
        let overwriteType = configs.getOption('DEFAULT_EXISTING', 'upload_existing');

        return (
            <Popover
                open={this.props.open}
                anchorEl={this.props.anchorEl}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                onRequestClose={(e) => {
                    this.props.onDismiss(e)
                }}
            >
                <div style={{width: 320, paddingBottom: 6}}>
                    <Subheader>{pydio.MessageHash['html_uploader.options']}</Subheader>
                    <div style={{padding: '0 16px', marginTop: -6}}>
                        <Checkbox style={{margin:'8px 0'}} checked={toggleStart} labelPosition={"right"} onCheck={this.updateField.bind(this, 'autostart')} label={pydio.MessageHash[337]} labelStyle={{fontSize:14}}/>
                        <Checkbox style={{margin:'8px 0'}} checked={toggleClose} labelPosition={"right"} onCheck={this.updateField.bind(this, 'autoclose')} label={pydio.MessageHash[338]} labelStyle={{fontSize:14}} />
                    </div>

                    <Subheader>{pydio.MessageHash['html_uploader.options.existing']}</Subheader>
                    <div style={{padding: 16, fontSize:14, paddingTop: 0}}>
                        <RadioButtonGroup ref="group" name="shipSpeed" defaultSelected={overwriteType} onChange={this.radioChange.bind(this)}>
                            <RadioButton value="alert" label={pydio.MessageHash['html_uploader.options.existing.alert']} style={{paddingBottom: 8}} />
                            <RadioButton value="rename-folders" label={pydio.MessageHash['html_uploader.options.existing.folders']} style={{paddingBottom: 8}}/>
                            <RadioButton value="rename" label={pydio.MessageHash['html_uploader.options.existing.merge']} style={{paddingBottom: 8}}/>
                            <RadioButton value="overwrite" label={pydio.MessageHash['html_uploader.options.existing.overwrite']}/>
                        </RadioButtonGroup>
                    </div>
                </div>
            </Popover>
        );
    }

}

export {UploadOptionsPane as default}
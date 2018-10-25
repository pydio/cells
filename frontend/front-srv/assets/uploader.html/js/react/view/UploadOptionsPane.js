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
import {Popover, List, ListItem, Divider, Toggle, RadioButtonGroup, RadioButton, Subheader} from 'material-ui'

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
        let toggleShowProcessed = configs.getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false);
        let overwriteType = configs.getOption('DEFAULT_EXISTING', 'upload_existing');

        return (
            <Popover
                open={this.props.open}
                anchorEl={this.props.anchorEl}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                onRequestClose={(e) => {
                    this.props.onDismiss(e)
                }}
            >
                <List style={{width: 260}}>
                    <ListItem primaryText={pydio.MessageHash[337]} rightToggle={<Toggle toggled={toggleStart} defaultToggled={toggleStart} onToggle={this.updateField.bind(this, 'autostart')} />} />
                    <ListItem primaryText={pydio.MessageHash[338]} rightToggle={<Toggle toggled={toggleClose} onToggle={this.updateField.bind(this, 'autoclose')} />} />
                    <ListItem primaryText={pydio.MessageHash['html_uploader.17']} rightToggle={<Toggle toggled={toggleShowProcessed} onToggle={this.updateField.bind(this, 'show_processed')} />} />
                    <Divider />
                    <Subheader>{pydio.MessageHash['html_uploader.18']}</Subheader>
                    <ListItem disabled={true} style={{paddingTop: 0}}>
                        <RadioButtonGroup ref="group" name="shipSpeed" defaultSelected={overwriteType} onChange={this.radioChange.bind(this)}>
                            <RadioButton value="alert" label={pydio.MessageHash['html_uploader.19']} style={{paddingBottom: 8}} />
                            <RadioButton value="rename" label={pydio.MessageHash['html_uploader.20']} style={{paddingBottom: 8}}/>
                            <RadioButton value="overwrite" label={pydio.MessageHash['html_uploader.21']}/>
                        </RadioButtonGroup>
                    </ListItem>
                </List>
            </Popover>
        );
    }

}

export {UploadOptionsPane as default}
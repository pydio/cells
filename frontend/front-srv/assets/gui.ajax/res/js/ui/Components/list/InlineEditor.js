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

import Pydio from "pydio";
import React from "react";
const {PydioContextConsumer, PromptValidators} = Pydio.requireLib('boot')
const {Paper, FlatButton} = require('material-ui')
const {ModernTextField} = Pydio.requireLib("hoc");
import Popper from '@mui/material/Popper';
import {muiThemeable} from "material-ui/styles";

class InlineEditor extends React.Component {

    constructor(props) {
        super(props);
        const {node} = this.props;
        this.errorChecks = [
            PromptValidators.Empty,
            PromptValidators.NoSlash,
            PromptValidators.MustDifferFrom(node.getLabel()),
            PromptValidators.MustDifferSiblings(),
        ]
        this.warningChecks = [
            PromptValidators.WarnSpace
        ]
        this.state = {value: node.getLabel()}

    }

    setValue(value = '', callback=null) {
        this.setState({value:value, errorString: null, warningString: null})
        const messages = Pydio.getMessages();
        const {error, warning} = PromptValidators.ApplyChecks(this.errorChecks, this.warningChecks, value)
        if(error) {
            this.setState({errorString: messages[error]}, callback);
            return;
        }
        if(warning) {
            this.setState({warningString: messages[warning]}, callback);
            return;
        }
        if(callback) {
            callback();
        }
        return;
    }

    submit(){
        const {value, errorString} =  this.state;
        if(errorString) {
            return;
        }
        this.props.callback(value);
        this.props.onClose();
    }

    catchClicks(e){
        e.stopPropagation();
    }

    onKeyDown(e){
        e.stopPropagation();
        if(e.key === 'Enter') {
            this.submit();
        } else if(e.key === 'Escape') {
            this.props.onClose()
        }
    }

    render() {
        const messages = Pydio.getMessages();
        const {node, onClose, anchor, muiTheme, editorStyle = {}} = this.props;
        const {value, errorString, warningString} = this.state;
        return (
            <Popper id={'rename-popper:'+node.getPath()} open={true} anchorEl={anchor} placement={"bottom-start"}>
                <Paper style={{width:320, padding: 8, fontWeight:'initial', background:muiTheme.palette.mui3?muiTheme.palette.mui3['surface-2']:'white', ...editorStyle}} zDepth={2}>
                    <ModernTextField
                        value={value}
                        onChange={(e, value)=>this.setValue(value)}
                        onClick={(e) => this.catchClicks(e)}
                        onDoubleClick={(e) => this.catchClicks(e)}
                        tabIndex="0"
                        onKeyDown={(e) => this.onKeyDown(e)}
                        selectBaseOnMount={true}
                        hintText={messages['6']}
                        variant={"v2"}
                        fullWidth={true}
                    />
                    {errorString && <div style={{color: 'var(--md-sys-color-error)', fontSize: 13, padding: '0 6px'}}>{errorString}</div>}
                    {warningString && <div style={{fontSize: 13, padding: '0 6px', opacity:0.73}}>{warningString}</div>}
                    <div style={{textAlign:'right', paddingTop: 8}}>
                        <FlatButton style={{height: 32, lineHeight:'32px'}} label={messages['54']} onClick={onClose}/>
                        <FlatButton style={{height: 32, lineHeight:'32px'}} label={messages['48']} onClick={
                            () => {this.setValue(value, () => this.submit())}
                        }/>
                    </div>
                </Paper>
            </Popper>
        );
    }
}

InlineEditor = PydioContextConsumer(muiThemeable()(InlineEditor));

export {InlineEditor as default}
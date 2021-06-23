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
import DOMUtils from 'pydio/util/dom'
import React, {createRef} from "react";
const {PydioContextConsumer} = Pydio.requireLib('boot')
const {Paper, FlatButton} = require('material-ui')
const {ModernTextField} = Pydio.requireLib("hoc");

class InlineEditor extends React.Component {

    constructor(props) {
        super(props);
        this.text = createRef();
    }

    submit(){
        let value;
        if(this.state && this.state.value){
            value = this.state.value;
        }
        const messages = Pydio.getMessages();
        if(!value || value === this.props.node.getLabel()) {
            this.setState({
                errorString: messages['rename.newvalue.error.similar']
            });
        } else if(value && value.indexOf('/') > -1){
            this.setState({
                errorString: messages['filename.forbidden.slash']
            });
        }else{
            this.props.callback(value);
            this.props.onClose();
        }
    }

    componentDidMount() {
        if(this.text){
            DOMUtils.selectBaseFileName(this.text.current.getInput());
            this.text.current.focus();
        }
    }

    catchClicks(e){
        e.stopPropagation();
    }

    onKeyDown(e){
        e.stopPropagation();
        if(e.key === 'Enter') {
            this.submit();
        } else {
            this.setState({errorString: ''});
        }
    }

    render() {
        const messages = Pydio.getMessages();
        return (
            <Paper className={"inline-editor" + (this.props.detached ? " detached" : "")} style={{padding: 8, fontWeight:'initial'}} zDepth={2}>
                <ModernTextField
                    ref={this.text}
                    defaultValue={this.props.node.getLabel()}
                    onChange={(e, value)=>{this.setState({value:value})}}
                    onClick={this.catch} onDoubleClick={(e) => this.catchClicks(e)}
                    tabIndex="0" onKeyDown={(e) => this.onKeyDown(e)}
                    errorText={this.state ? this.state.errorString : null}
                />
                <div style={{textAlign:'right', paddingTop: 8}}>
                    <FlatButton label={messages['54']} onClick={this.props.onClose}/>
                    <FlatButton label={messages['48']} onClick={() => this.submit()}/>
                </div>
            </Paper>
        );
    }
}

InlineEditor = PydioContextConsumer(InlineEditor);

export {InlineEditor as default}
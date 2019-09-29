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
import AjxpNode from 'pydio/model/node'
import React from "react";
const {PydioContextConsumer} = Pydio.requireLib('boot')
const {Paper, FlatButton} = require('material-ui')
const {ModernTextField} = Pydio.requireLib("hoc");

let InlineEditor = React.createClass({

    propTypes:{
        node        : React.PropTypes.instanceOf(AjxpNode),
        callback    : React.PropTypes.func,
        onClose     : React.PropTypes.func,
        detached    : React.PropTypes.bool
    },

    submit: function(){
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
    },

    componentDidMount:function(){
        if(this.refs.text){
            DOMUtils.selectBaseFileName(this.refs.text.getInput());
            this.refs.text.focus();
        }
    },

    catchClicks: function(e){
        e.stopPropagation();
    },

    onKeyDown: function(e){
        e.stopPropagation();
        if(e.key === 'Enter') {
            this.submit();
        } else {
            this.setState({errorString: ''});
        }
    },

    render: function(){
        const messages = Pydio.getMessages();
        return (
            <Paper className={"inline-editor" + (this.props.detached ? " detached" : "")} style={{padding: 8}} zDepth={2}>
                <ModernTextField
                    ref="text"
                    defaultValue={this.props.node.getLabel()}
                    onChange={(e, value)=>{this.setState({value:value})}}
                    onClick={this.catch} onDoubleClick={this.catchClicks}
                    tabIndex="0" onKeyDown={this.onKeyDown}
                    errorText={this.state ? this.state.errorString : null}
                />
                <div style={{textAlign:'right', paddingTop: 8}}>
                    <FlatButton label={messages['54']} onClick={this.props.onClose}/>
                    <FlatButton label={messages['48']} onClick={this.submit}/>
                </div>
            </Paper>
        );
    }

});

InlineEditor = PydioContextConsumer(InlineEditor);

export {InlineEditor as default}
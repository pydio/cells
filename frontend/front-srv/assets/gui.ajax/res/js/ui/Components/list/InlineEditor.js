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
const Pydio = require('pydio')
const AjxpNode = require('pydio/model/node')
const {PydioContextConsumer} = Pydio.requireLib('boot')
const {Paper, TextField, FlatButton} = require('material-ui')

let InlineEditor = React.createClass({

    propTypes:{
        node        : React.PropTypes.instanceOf(AjxpNode),
        callback    : React.PropTypes.func,
        onClose     : React.PropTypes.func,
        detached    : React.PropTypes.bool
    },

    submit: function(){
        if(!this.state || !this.state.value || this.state.value === this.props.node.getLabel()){
            this.setState({errorString: 'Please use a different value for renaming!'});
            this.props.getPydio().displayMessage('ERROR', 'Please use a different value for renaming!');
        }else{
            this.props.callback(this.state.value);
            this.props.onClose();
        }
    },

    componentDidMount:function(){
        this.refs.text.focus();
    },

    catchClicks: function(e){
        e.stopPropagation();
    },

    onKeyDown: function(e){
        if(e.key === 'Enter') {
            this.submit();
        }
        this.setState({errorString: ''});
        e.stopPropagation();
    },

    render: function(){
        return (
            <Paper className={"inline-editor" + (this.props.detached ? " detached" : "")} style={{padding: 8}} zDepth={2}>
                <TextField
                    ref="text"
                    defaultValue={this.props.node.getLabel()}
                    onChange={(e, value)=>{this.setState({value:value})}}
                    onClick={this.catch} onDoubleClick={this.catchClicks}
                    tabIndex="0" onKeyDown={this.onKeyDown}
                    errorText={this.state ? this.state.errorString : null}
                />
                <div style={{textAlign:'right', paddingTop: 8}}>
                    <FlatButton label="Cancel" onClick={this.props.onClose}/>
                    <FlatButton label="Submit" onClick={this.submit}/>
                </div>
            </Paper>
        );
    }

});

InlineEditor = PydioContextConsumer(InlineEditor)

export {InlineEditor as default}
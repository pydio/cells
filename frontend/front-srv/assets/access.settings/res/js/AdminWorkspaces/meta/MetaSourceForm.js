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
const {MenuItem, SelectField} = require('material-ui')
const {ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin} = require('pydio').requireLib('boot')
const {MessagesConsumerMixin} = AdminComponents;

const MetaSourceForm = React.createClass({

    mixins:[
        MessagesConsumerMixin,
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],

    propTypes:{
        model: React.PropTypes.object,
        editor: React.PropTypes.object,
        modalData:React.PropTypes.object
    },

    getDefaultProps: function(){
        return {
            dialogTitleId: 'ajxp_admin.ws.46',
            dialogSize:'sm'
        };
    },

    getInitialState:function(){
        return {step:'chooser'};
    },

    setModal:function(pydioModal){
        this.setState({modal:pydioModal});
    },

    submit:function(){
        if(this.state.pluginId && this.state.pluginId !== -1){
            this.dismiss();
            this.props.editor.addMetaSource(this.state.pluginId);
        }
    },

    render:function(){
        const model = this.props.model;
        const currentMetas = model.getOption("META_SOURCES", true);
        const allMetas = model.getAllMetaSources();

        let menuItems = [];
        allMetas.map(function(metaSource){
            const id = metaSource['id'];
            const type = id.split('.').shift();
            if(type == 'metastore' || type == 'index'){
                let already = false;
                Object.keys(currentMetas).map(function(metaKey){
                    if(metaKey.indexOf(type) === 0) already = true;
                });
                if(already) return;
            }else{
                if(currentMetas[id]) return;
            }
            menuItems.push(<MenuItem value={metaSource['id']} primaryText={metaSource['label']}/>);
        });
        const change = function(event, index, value){
            if(value !== -1){
                this.setState({pluginId:value});
            }
        }.bind(this);
        return (
            <div style={{width:'100%'}}>
                <SelectField value={this.state.pluginId} fullWidth={true} onChange={change}>{menuItems}</SelectField>
            </div>
        );
    }

});

export {MetaSourceForm as default}
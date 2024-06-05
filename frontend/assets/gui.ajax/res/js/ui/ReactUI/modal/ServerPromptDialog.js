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

import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import {TextField} from 'material-ui'
import ActionDialogMixin from './ActionDialogMixin'
import CancelButtonProviderMixin from './CancelButtonProviderMixin'
import SubmitButtonProviderMixin from './SubmitButtonProviderMixin'

export default createReactClass({
    displayName: 'ServerPromptDialog',

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],

    propTypes: {
        /**
         * Message ID used for the dialog title
         */
        dialogTitleId: PropTypes.string,
        /**
         * Main Message displayed in the body of the dialog
         */
        dialogLegendId: PropTypes.string,
        /**
         * If not empty, dialog will display and then trigger a redirection.
         */
        autoRedirectUrl: PropTypes.string,
        /**
         * Object containing fields definition that must be shown to user
         * and sent back to server. Fields can be text, password or hidden.
         */
        fieldsDefinitions: PropTypes.object

    },

    getDefaultProps(){
        return {
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },

    componentDidMount:function(){
        if(this.props.autoRedirectUrl){
            this._redirectTimeout = setTimeout(this.redirect.bind(this), 3000);
        }
    },

    redirect(){
        window.location.href = this.props.autoRedirectUrl;
    },

    submit(){
        const {autoRedirectUrl, fieldsDefinitions, postSubmitCallback} = this.props;

        if(autoRedirectUrl){
            this.redirect();
            return;
        }
        if(fieldsDefinitions){
            let parameters = {};
            Object.keys(fieldsDefinitions).forEach((k) => {
                const def = fieldsDefinitions[k];
                if(def.type !== 'hidden'){
                    parameters[k] = this.refs['input-' + k].getValue();
                }else{
                    parameters[k] = def.value;
                }
            });
            /*
            // Todo: should be rewired to a REST API call
            PydioApi.getClient().request(parameters, (transp) => {
                if(postSubmitCallback){
                    eval(postSubmitCallback);
                }
                this.dismiss();
            });
            */
        }else{
            if(postSubmitCallback){
                eval(postSubmitCallback);
            }
            this.dismiss();
        }
    },

    cancel(){
        if(this._redirectTimeout){
            clearTimeout(this._redirectTimeout);
            this.dismiss();
            return;
        }
        this.dismiss();
    },

    render(){

        const {pydio, dialogLegendId, autoRedirectUrl, fieldsDefinitions} = this.props;
        const {MessageHash} = pydio;
        const legend = <div>{pydio.MessageHash[dialogLegendId]}</div>;

        if(fieldsDefinitions){
            let fields = [];
            Object.keys(fieldsDefinitions).forEach((k) => {
                const def = fieldsDefinitions[k];
                if(def.type !== 'hidden'){
                    fields.push(
                        <TextField
                            key={k}
                            floatingLabelText={MessageHash[def.labelId]}
                            ref={"input-" + k}
                            defaultValue={def.value || ''}
                            onKeyDown={this.submitOnEnterKey}
                            type={def.type}
                            fullWidth={true}
                        />
                    );
                }
            });
            return (
                <div>
                    {legend}
                    <form autoComplete="off">
                        {fields}
                    </form>
                </div>
            );
        }else if(autoRedirectUrl){
            return (
                <div>
                    {legend}
                    <div style={{marginTop: 16}}>
                        <a href={autoRedirectUrl}>{autoRedirectUrl}</a>
                    </div>
                </div>
            );
        }
        return legend;

    },
});
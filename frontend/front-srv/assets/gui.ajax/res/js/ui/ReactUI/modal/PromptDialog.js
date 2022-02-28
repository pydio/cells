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

import React from "react";
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import DOMUtils from 'pydio/util/dom';
import ActionDialogMixin from './ActionDialogMixin'
import CancelButtonProviderMixin from './CancelButtonProviderMixin'
import SubmitButtonProviderMixin from './SubmitButtonProviderMixin'

import Pydio from 'pydio'
const {ModernTextField} = Pydio.requireLib("hoc");


/**
 * Ready-to-use dialog for requiring information (text or password) from the user
 *
 */
export default createReactClass({
    displayName: 'PromptDialog',

    propTypes: {
        /**
         * Message ID used for the dialog title
         */
        dialogTitleId:PropTypes.string,
        /**
         * Message ID or string used for dialog legend
         */
        legendId:PropTypes.string,
        /**
         * MessageID used for the field Floating Label Text
         */
        fieldLabelId:PropTypes.string,
        /**
         * Either text or password
         */
        fieldType: PropTypes.oneOf(['text', 'password']),
        /**
         * Callback used at submit time
         */
        submitValue:PropTypes.func.isRequired,
        /**
         * Preset value displayed in the text field
         */
        defaultValue:PropTypes.string,
        /**
         * Select a part of the default value [NOT IMPLEMENTED]
         */
        defaultInputSelection:PropTypes.string
    },

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],

    getDefaultProps(){
        return {
            dialogTitle: '',
            dialogIsModal: true,
            fieldType: 'text'
        };
    },

    getInitialState(){
        if(this.props.defaultValue){
            return {internalValue: this.props.defaultValue}
        }else {
            return {internalValue: ''}
        }
    },

    /**
     * Trigger props callback and dismiss modal
     */
    submit(){
        this.props.submitValue(this.state.internalValue);
        this.dismiss();
    },

    /**
     * Focus on input at mount time
     */
    componentDidMount(){
        const {defaultInputSelection} = this.props;
        setTimeout(()=> {
            try{
                if(defaultInputSelection && this.refs.input && this.refs.input.getInput()){
                    DOMUtils.selectBaseFileName(this.refs.input.getInput());
                }
                this.refs.input.focus();
            }catch (e){}
        }, 150);
    },

    render(){
        const {internalValue} = this.state;
        return (
            <div style={{width:'100%'}}>
                <div className="dialogLegend">{MessageHash[this.props.legendId] || this.props.legendId}</div>
                <ModernTextField
                    floatingLabelText={MessageHash[this.props.fieldLabelId] || this.props.fieldLabelId}
                    ref="input"
                    onKeyDown={this.submitOnEnterKey}
                    value={internalValue}
                    onChange={(e,v) => this.setState({internalValue: v})}
                    type={this.props.fieldType}
                    variant={"v2"}
                    fullWidth={true}
                />
            </div>
        );
    },
});

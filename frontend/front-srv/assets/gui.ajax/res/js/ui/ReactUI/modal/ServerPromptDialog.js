import React from 'react'
import {TextField} from 'material-ui'
import ActionDialogMixin from './ActionDialogMixin'
import CancelButtonProviderMixin from './CancelButtonProviderMixin'
import SubmitButtonProviderMixin from './SubmitButtonProviderMixin'

export default React.createClass({

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],


    propTypes: {
        /**
         * Message ID used for the dialog title
         */
        dialogTitleId: React.PropTypes.string,
        /**
         * Main Message displayed in the body of the dialog
         */
        dialogLegendId: React.PropTypes.string,
        /**
         * If not empty, dialog will display and then trigger a redirection.
         */
        autoRedirectUrl: React.PropTypes.string,
        /**
         * Object containing fields definition that must be shown to user
         * and sent back to server. Fields can be text, password or hidden.
         */
        fieldsDefinitions: React.PropTypes.object

    },

    getDefaultProps: function(){
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

    redirect: function(){
        window.location.href = this.props.autoRedirectUrl;
    },

    submit: function(){
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
            PydioApi.getClient().request(parameters, (transp) => {
                if(postSubmitCallback){
                    eval(postSubmitCallback);
                }
                this.dismiss();
            });
        }else{
            if(postSubmitCallback){
                eval(postSubmitCallback);
            }
            this.dismiss();
        }
    },

    cancel: function(){
        if(this._redirectTimeout){
            clearTimeout(this._redirectTimeout);
            this.dismiss();
            return;
        }
        this.dismiss();
    },

    render: function(){

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

    }

});
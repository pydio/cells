import React from 'react'
import ShareContextConsumer from '../ShareContextConsumer'
import PublicLinkField from './Field'
import PublicLinkPermissions from './Permissions'
import TargetedUsers from './TargetedUsers'
import {RaisedButton, Toggle, Divider} from 'material-ui'
import LinkModel from './LinkModel'
import CompositeModel from '../composite/CompositeModel'
import Pydio from 'pydio'
import ShareHelper from '../main/ShareHelper'
const {ValidPassword} = Pydio.requireLib('form');

let PublicLinkPanel = React.createClass({

    propTypes: {
        linkModel:React.PropTypes.instanceOf(LinkModel),
        compositeModel:React.PropTypes.instanceOf(CompositeModel),
        pydio:React.PropTypes.instanceOf(Pydio),
        authorizations: React.PropTypes.object,
        showMailer:React.PropTypes.func
    },

    toggleLink: function(){
        const {linkModel, pydio} = this.props;
        const {showTemporaryPassword} = this.state;
        if(showTemporaryPassword){
            this.setState({showTemporaryPassword: false, temporaryPassword: null});
        }else if(!linkModel.getLinkUuid() && ShareHelper.getAuthorizations(pydio).password_mandatory){
            this.setState({showTemporaryPassword: true, temporaryPassword: ''});
        }else{
            if(linkModel.getLinkUuid()){
                this.props.compositeModel.deleteLink(linkModel);
            } else {
                linkModel.save();
            }
        }
    },

    getInitialState: function(){
        return {showTemporaryPassword: false, temporaryPassword: null, disabled: false};
    },

    updateTemporaryPassword: function(value, event){
        if(value === undefined) {
            value = event.currentTarget.getValue();
        }
        this.setState({temporaryPassword:value});
    },

    enableLinkWithPassword:function(){
        const {linkModel} = this.props;
        if(!this.refs['valid-pass'].isValid()){
            this.props.pydio.UI.displayMessage('ERROR', 'Invalid Password');
            return;
        }
        linkModel.setCreatePassword(this.state.temporaryPassword);
        try{
            linkModel.save();
        } catch(e){
            this.props.pydio.UI.displayMessage('ERROR', e.message)
        }
        this.setState({showTemporaryPassword:false, temporaryPassword:null});
    },

    render: function(){

        const {linkModel, pydio, compositeModel} = this.props;

        let publicLinkPanes, publicLinkField;
        if(linkModel.getLinkUuid()) {
            publicLinkField = (<PublicLinkField
                pydio={pydio}
                linkModel={linkModel}
                showMailer={this.props.showMailer}
                editAllowed={(!this.props.authorizations || this.props.authorizations.editable_hash) && linkModel.isEditable()}
                key="public-link"
            />);
            publicLinkPanes = [
                <Divider/>,
                <PublicLinkPermissions
                    compositeModel={compositeModel}
                    linkModel={linkModel}
                    pydio={pydio}
                    key="public-perm"
                />,
            ];
            if(linkModel.getLink().TargetUsers) {
                publicLinkPanes.push(<Divider/>);
                publicLinkPanes.push(<TargetedUsers linkModel={linkModel} pydio={pydio}/>);
            }

        }else if(this.state.showTemporaryPassword){
            publicLinkField = (
                <div>
                    <div className="section-legend" style={{marginTop:20}}>{this.props.getMessage('215')}</div>
                    <div style={{width:'100%'}}>
                        <ValidPassword
                            attributes={{label:this.props.getMessage('23')}}
                            value={this.state.temporaryPassword}
                            onChange={this.updateTemporaryPassword}
                            ref={"valid-pass"}
                        />
                    </div>
                    <div style={{textAlign:'center',marginTop: 20}}>
                        <RaisedButton label={this.props.getMessage('92')} secondary={true} onClick={this.enableLinkWithPassword}/>
                    </div>
                </div>
            );

        }else{
            publicLinkField = (
                <div style={{fontSize:13, fontWeight:500, color:'rgba(0,0,0,0.43)', paddingBottom: 16, paddingTop: 16}}>{this.props.getMessage('190')}</div>
            );
        }
        return (
            <div style={this.props.style}>
                <div style={{padding:'15px 10px 11px', backgroundColor:'#f5f5f5', borderBottom:'1px solid #e0e0e0', fontSize: 15}}>
                    <Toggle
                        disabled={this.props.isReadonly() || this.state.disabled || !linkModel.isEditable()}
                        onToggle={this.toggleLink}
                        toggled={linkModel.getLinkUuid() || this.state.showTemporaryPassword}
                        label={this.props.getMessage('189')}
                    />
                </div>
                <div style={{padding:20}}>{publicLinkField}</div>
                {publicLinkPanes}
            </div>
        );
    }
});

PublicLinkPanel = ShareContextConsumer(PublicLinkPanel);
export {PublicLinkPanel as default}
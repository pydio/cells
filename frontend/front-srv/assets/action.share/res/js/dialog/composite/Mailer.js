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
import React from 'react'
import ResourcesManager from 'pydio/http/resources-manager'
import ShareHelper from '../main/ShareHelper'
import {muiThemeable} from 'material-ui/styles'
import {RestShareLinkTargetUser} from 'cells-sdk'

class Mailer extends React.Component {

    constructor(props){
        super(props);
        this.state = {mailerData:null};
    }

    componentWillReceiveProps(newProps){
        const {subject, message, users, linkModel, templateId, templateData} = newProps;

        if(subject || templateId){
            if(ShareHelper.forceMailerOldSchool()){
                const encSubject = encodeURIComponent(subject);
                location.href = "mailto:custom-email@domain.com?Subject="+encSubject+"&Body="+message;
                return;
            }
            //const linkData = hash ? this.state.model.getLinkData(hash) : undefined;
            ResourcesManager.loadClass('PydioMailer').then((ns)=>{
                this.setState({
                    mailerData: {
                        ...newProps,
                        enableIdentification:(linkModel && linkModel.getLink().TargetUsers),
                        identifiedOnly:(linkModel && linkModel.getLink().RestrictToTargetUsers),
                        crippleIdentificationKeys:true,
                    },
                    MailerPanel:ns.Pane
                });
            });

        } else {
            this.setState({mailerData: null});
        }
    }

    toggleMailerData(data){
        this.setState({mailerData: {...this.state.mailerData, ...data}});
    }

    dismissMailer(){
        this.props.onDismiss();
    }

    mailerProcessPost(Email, users, subject, message, link, callback){
        const {mailerData} = this.state;
        const {crippleIdentificationKeys, identifiedOnly, linkModel} = mailerData;
        let linkObject = linkModel.getLink();
        if(!linkObject.TargetUsers) {
            linkObject.TargetUsers = {};
        }
        linkObject.RestrictToTargetUsers = identifiedOnly;

        let shareMails = {};
        Object.keys(users).forEach((u) => {
            const k = crippleIdentificationKeys ? Math.random().toString(36).substring(7) : u;
            linkObject.TargetUsers[k] = RestShareLinkTargetUser.constructFromObject({Display:users[u].getLabel(), DownloadCount:0});
            shareMails[k] = u;
        });
        linkModel.updateLink(linkObject);
        linkModel.save().then(() => {
            const email = new Email();
            const originalLink = linkModel.getPublicUrl();
            const regexp = new RegExp(originalLink, 'g');
            Object.keys(shareMails).forEach((u) => {
                const newLink = originalLink + '?u='  + u;
                const newMessage = message.replace(regexp, newLink);
                email.addTarget(shareMails[u], subject, newMessage);
            });
            email.post((res) => {
                callback(res);
            });
        });
    }

    getMessage(key, namespace = 'share_center'){
        return this.props.pydio.MessageHash[namespace + (namespace?'.':'') + key];
    }

    render() {
        const {mailerData, MailerPanel} = this.state;
        if(!mailerData){
            return null
        }

        const {muiTheme} = this.props;
        let customizeMessagePane;
        /*
        if(false && mailerData.linkModel){
            const style = mailerData.enableIdentification ? {padding:'10px 20px', backgroundColor: '#ECEFF1', fontSize: 14} : {padding:'10px 20px 0', fontSize: 14};
            const letUserChooseCripple = this.props.pydio.getPluginConfigs('action.share').get('EMAIL_PERSONAL_LINK_SEND_CLEAR');
            customizeMessagePane = (
                <div style={style}>
                    <Toggle label={this.getMessage(235)} toggled={mailerData.enableIdentification} onToggle={(e, c) => {this.toggleMailerData({enableIdentification:c})} }/>
                    {mailerData.enableIdentification &&
                    <Toggle label={"-- " + this.getMessage(236)} toggled={mailerData.identifiedOnly} onToggle={(e, c) => {this.toggleMailerData({identifiedOnly:c})} }/>
                    }
                    {mailerData.enableIdentification && letUserChooseCripple &&
                    <Toggle label={"-- " + this.getMessage(237)} toggled={mailerData.crippleIdentificationKeys} onToggle={(e, c) => {this.toggleMailerData({crippleIdentificationKeys:c})} }/>
                    }
                </div>
            );
        }
         */
        return (<MailerPanel
            {...mailerData}
            onDismiss={this.dismissMailer.bind(this)}
            overlay={true}
            className="share-center-mailer"
            panelTitle={this.props.pydio.MessageHash["share_center.45"]}
            additionalPaneTop={customizeMessagePane}
            processPost={mailerData.enableIdentification ? this.mailerProcessPost.bind(this) : null}
            style={{width: 420, margin: '0 auto', background:muiTheme.palette.mui3['surface-3']}}
        />);

    }

}
Mailer = muiThemeable()(Mailer)
export {Mailer as default}
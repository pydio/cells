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
import Pydio from 'pydio'
import PropTypes from 'prop-types'
import PydioApi from 'pydio/http/api'
import {FontIcon, Chip, Avatar, Paper, Divider, TextField, FlatButton} from 'material-ui'
import {colors} from 'material-ui/styles'
import {MailerServiceApi, MailerMail, MailerUser} from 'cells-sdk'
const {UsersCompleter} = Pydio.requireLib('components');

const styles = {
    chip: {
        marginRight: 4,
        marginBottom: 4
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    overlay:{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.33)',
        paddingTop: 77,
        zIndex: 100
    }
};

class DestBadge extends React.Component{
    render(){
        const userObject = this.props.user;
        return (
            <div className={"share-dialog user-badge user-type-" + (userObject.getTemporary() ? "tmp_user" : "user")}>
                <span className={"avatar icon-" + (userObject.getTemporary()?"envelope":"user")}/>
                <span className="user-badge-label">{userObject.getExtendedLabel() || userObject.getLabel()}</span>
            </div>
        );
    }
}

class UserChip extends React.Component {

    render(){
        const {user, onRemove} = this.props;
        const tmp = user.FreeValue;
        let label;
        if(tmp){
            label = user.FreeValue;
        } else {
            if (user.Attributes && user.Attributes['displayName']){
                label = user.Attributes['displayName'];
            } else {
                label = user.Login;
            }
        }

        const icon = <FontIcon className={"mdi mdi-" + (tmp?"email":"account")} />;
        return (
            <Chip
                backgroundColor={tmp ? colors.lightBlue100 : colors.blueGrey100}
                onRequestDelete={() => {onRemove()}}
                style={styles.chip}
            >
                <Avatar icon={icon} color={tmp ? 'white' : colors.blueGrey600} backgroundColor={tmp ? colors.lightBlue300 : colors.blueGrey300}/>
                {label}
            </Chip>
        )
    }
}

class Email {

    constructor(subject = null, message = null, link = null){

        this._subjects = [];
        this._messages = [];
        this._targets = [];
        this._links = [];
        this.templateId = "";
        this.templateData = {};
        if(subject) {
            this._subjects.push(subject);
        }
        if(message) {
            this._messages.push(message);
        }
        if(link) {
            this._links.push(link);
        }
    }

    addTarget(userOrEmail, subject = null, message = null, link = null){
        this._targets.push(userOrEmail);
        if(subject) {
            this._subjects.push(subject);
        }
        if(message) {
            this._messages.push(message);
        }
        if(link) {
            this._links.push(link);
        }
    }

    setTemplateData(templateId, templateData){
        this.templateId = templateId;
        this.templateData = templateData;
    }

    /**
     *
     * @param targets Array
     * @param subject string
     * @param templateId string
     * @param templateData Object
     * @return {Promise}
     */
    postOne(targets, subject, templateId, templateData){
        const api = new MailerServiceApi(PydioApi.getRestClient());
        let email = new MailerMail();
        email.Subject = subject;
        email.To = targets.map(t => MailerUser.constructFromObject({Uuid: t}));
        email.TemplateId = templateId;
        email.TemplateData = templateData;
        return api.send(email);
    }

    post(callback = null){

        if((!this._subjects.length && ! this.templateId) || !this._targets.length || !this._messages.length){
            throw new Error('Invalid data');
        }
        let templateData = {...this.templateData};
        let proms = [];

        if(this._messages.length > 1 && this._messages.length === this._targets.length && this._subjects.length === this._targets.length) {
            // Send as many emails as targets with their own messages
            this._targets.map((t,i) => {
                const subject = this._subjects[i];
                templateData = {...templateData, Message: this._messages[i]};
                proms.push(this.postOne([t], subject, this.templateId, templateData));
            });
        } else {
            const subject = this._subjects[0];
            templateData['Message'] = this._messages[0];
            proms.push(this.postOne(this._targets, subject, this.templateId, templateData));
        }

        Promise.all(proms).then(() => {
            callback(true);
        }).catch(e => {
            if (e.response && e.response.body && e.response.body.Title) {
                e = new Error(e.response.body.Title);
            }
            callback(false, e);
        });

    }

}

class Pane extends React.Component {

    constructor(props){
        if(props.showAddressBook === undefined){
            props.showAddressBook = true;
        }
        super(props);
        this.state = {
            users:this.props.users || {},
            subject:this.props.subject,
            message:this.props.message,
            errorMessage:null,
            posting: false,
        };
    }

    updateSubject(event){
        this.setState({subject:event.currentTarget.value});
    }

    updateMessage(event){
        this.setState({message:event.currentTarget.value});
    }

    addUser(userObject){
        let {users} = this.state;
        if(userObject.FreeValue){
            users[userObject.FreeValue] = userObject;
        } else if(userObject.IdmUser){
            users[userObject.IdmUser.Login] = userObject.IdmUser;
        }
        this.setState({users:users, errorMessage:null});
    }

    removeUser(userId){
        let {users} = this.state;
        delete users[userId];
        this.setState({users:users});
    }

    getMessage(messageId, nameSpace = undefined){
        try{
            if(nameSpace === undefined) {
                nameSpace = 'core.mailer';
            }
            if(nameSpace) {
                nameSpace += ".";
            }
            return pydio.MessageHash[ nameSpace + messageId ];
        }catch(e){
            return messageId;
        }
    }

    postEmail(repost=false){
        const {users, subject, message} = this.state;
        if(!repost && this.refs.completer && this.refs.completer.getPendingSearchText && this.refs.completer.getPendingSearchText()){
            this.refs.completer.onCompleterRequest(this.refs.completer.getPendingSearchText(), -1);
            setTimeout(() => this.postEmail(true), 500);
            return;
        }
        if(!Object.keys(users).length){
            this.setState({errorMessage:this.getMessage(2)});
            return;
        }
        const {link, templateId, templateData} = this.props;
        const callback = (res, err) => {
            this.setState({posting: false});
            if(res) {
                this.props.pydio.UI.displayMessage('SUCCESS', this.props.pydio.MessageHash["core.mailer.1"].replace('%s', Object.keys(users).length));
                if(this.props.onDismiss){
                    this.props.onDismiss();
                } else {
                    this.setState({users: {}, subject:'', message:''});
                }
            } else {
                this.props.pydio.UI.displayMessage('ERROR', this.props.pydio.MessageHash["core.mailer.sender.error"] + (err?' : ' + err.message : ''));
            }
        };
        this.setState({posting: true});

        if(this.props.processPost){
            this.props.processPost(Email, users, subject, message, link, callback);
            return;
        }

        let email = new Email(subject, message, link || null);
        Object.keys(users).forEach((k) => {
            email.addTarget(k);
        });
        if(templateId){
            email.setTemplateData(templateId, templateData);
        }
        email.post(callback);
    }

    render(){
        const {users, posting, errorMessage, subject, message} = this.state;

        const className = [this.props.className, "react-mailer", "reset-pydio-forms"].join(" ");
        const usersChips = Object.keys(users).map(function(uId){
            return (
                <UserChip key={uId} user={users[uId]} onRemove={()=>{this.removeUser(uId)}}/>
            );
        }.bind(this));
        let errorDiv;
        if(errorMessage){
            errorDiv = <div style={{padding: '10px 20px', color: 'red'}}>{errorMessage}</div>
        }
        const style = {
            margin:this.props.uniqueUserStyle ? 0 : 8,
            ...this.props.style,
        };
        const content = (
            <Paper zDepth={this.props.zDepth !== undefined ? this.props.zDepth : 2} className={className} style={style}>
                <h3  style={{padding:20, color:'rgba(0,0,0,0.87)', fontSize:25, marginBottom: 0, paddingBottom: 10, ...this.props.titleStyle}}>{this.props.panelTitle}</h3>
                {errorDiv}
                {this.props.additionalPaneTop}
                {!this.props.uniqueUserStyle &&
                    <div className="users-block" style={{padding: '0 20px', ...this.props.usersBlockStyle}}>
                        <UsersCompleter
                            ref="completer"
                            fieldLabel={this.getMessage('8')}
                            usersOnly={true}
                            existingOnly={true}
                            freeValueAllowed={true}
                            onValueSelected={this.addUser.bind(this)}
                            excludes={Object.keys(users)}
                            renderSuggestion={(userObject) => <DestBadge user={userObject}/> }
                            pydio={pydio}
                            showAddressBook={this.props.showAddressBook}
                            underlineHide={true}
                        />
                        <div style={styles.wrapper}>{usersChips}</div>
                    </div>
                }
                {!this.props.uniqueUserStyle && <Divider/>}
                {!this.props.templateId &&
                    <div  style={{padding:'0 20px'}}>
                        <TextField fullWidth={true} underlineShow={false} floatingLabelText={this.getMessage('6')} value={subject} onChange={this.updateSubject.bind(this)}/>
                    </div>
                }
                {!this.props.templateId &&
                    <Divider/>
                }
                <div style={{padding:'0 20px', ...this.props.messageBlockStyle}}>
                    <TextField
                        fullWidth={true}
                        underlineShow={false}
                        floatingLabelText={this.getMessage('7')}
                        value={message}
                        multiLine={true}
                        onChange={this.updateMessage.bind(this)}
                        rowsMax={6}
                    />
                </div>
                {this.props.additionalPaneBottom}
                <Divider/>
                <div style={{textAlign:'right', padding: '8px 20px'}}>
                    {this.props.onDismiss && <FlatButton label={this.getMessage('54', '')} onClick={this.props.onDismiss}/>}
                    {!this.props.onDismiss && <FlatButton label={this.getMessage('216', '')} onClick={()=>{this.setState({users: {}, subject:'', message:''});}}/>}
                    <FlatButton disabled={posting} primary={true} label={this.getMessage('77', '')} onClick={(e)=>this.postEmail()}/>
                </div>
            </Paper>
        );
        if(this.props.overlay){
            return (
                <div style={styles.overlay}>{content}</div>
            );
        }else{
            return content;
        }
    }
}

Pane.PropTypes = {
    message:PropTypes.string,
    subject:PropTypes.string,
    templateId: PropTypes.string,
    templateData: PropTypes.object,
    link:PropTypes.string,
    onDismiss:PropTypes.func,
    className:PropTypes.string,
    overlay:PropTypes.bool,
    uniqueUserStyle:PropTypes.bool,
    users:PropTypes.object,
    panelTitle:PropTypes.string,
    zDepth:PropTypes.number,
    showAddressBook: PropTypes.bool,
    processPost: PropTypes.func,
    additionalPaneTop: PropTypes.instanceOf(React.Component),
    additionalPaneBottom: PropTypes.instanceOf(React.Component)
};


class PreferencesPanel extends React.Component{
    render(){
        return <div>Preferences Panel</div>;
    }
}

export {Pane, PreferencesPanel};
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


(function(global){

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

    var DestBadge = React.createClass({
        propTypes:{
            user:React.PropTypes.instanceOf(PydioUsers.User)
        },
        render: function(){
            const userObject = this.props.user;
            return (
                <div className={"share-dialog user-badge user-type-" + (userObject.getTemporary() ? "tmp_user" : "user")}>
                    <span className={"avatar icon-" + (userObject.getTemporary()?"envelope":"user")}/>
                    <span className="user-badge-label">{userObject.getExtendedLabel() || userObject.getLabel()}</span>
                </div>
            );
        }
    });

    var UserEntry = React.createClass({
        propTypes:{
            user:React.PropTypes.instanceOf(PydioUsers.User),
            onRemove:React.PropTypes.func
        },
        remove: function(){
            this.props.onRemove(this.props.user.getId());
        },
        toggleRemove:function(){
            var current = this.state && this.state.remove;
            this.setState({remove:!current});
        },
        render:function(){
            var icon, className = 'pydio-mailer-user ' + 'user-type-' + (this.props.user.getTemporary() ? "email" : "user");
            var clik = function(){};
            if(this.state && this.state.remove){
                clik = this.remove;
                icon = <span className="avatar mdi mdi-close"/>;
                className += ' remove';
            }else{
                icon = <span className={"avatar icon-" + (this.props.user.getTemporary()?"envelope":"user")}/>;
            }
            return (
                <div className={className} onMouseOver={this.toggleRemove} onMouseOut={this.toggleRemove} onClick={clik}>
                    {icon}
                    {this.props.user.getLabel()}
                </div>
            );
        }
    });

    var UserChip = React.createClass({
        propTypes:{
            user:React.PropTypes.instanceOf(PydioUsers.User),
            onRemove:React.PropTypes.func
        },
        remove: function(){
            this.props.onRemove(this.props.user.getId());
        },
        render: function(){
            const tmp = this.props.user.getTemporary();
            const icon = <MaterialUI.FontIcon className={"icon-" + (tmp?"envelope":"user")} />;
            const {colors} = MaterialUI.Style;
            return (
                <MaterialUI.Chip
                    backgroundColor={tmp ? colors.lightBlue100 : colors.blueGrey100}
                    onRequestDelete={this.remove}
                    style={styles.chip}
                >
                    <MaterialUI.Avatar icon={icon} color={tmp ? 'white' : colors.blueGrey600} backgroundColor={tmp ? colors.lightBlue300 : colors.blueGrey300}/>
                    {this.props.user.getLabel()}
                </MaterialUI.Chip>
            )
        }
    });

    class Email {

        constructor(subject = null, message = null, link = null){

            this._subjects = [];
            this._messages = [];
            this._targets = [];
            this._links = [];
            this.templateId = "";
            this.templateData = {};
            if(subject) this._subjects.push(subject);
            if(message) this._messages.push(message);
            if(link) this._links.push(link);
        }

        addTarget(userOrEmail, subject = null, message = null, link = null){
            this._targets.push(userOrEmail);
            if(subject) this._subjects.push(subject);
            if(message) this._messages.push(message);
            if(link) this._links.push(link);
        }

        setTemplateData(templateId, templateData){
            this.templateId = templateId;
            this.templateData = templateData;
        }

        post(callback = null){

            if((!this._subjects.length && ! this.templateId)|| !this._targets.length || !this._messages.length){
                throw new Error('Invalid data');
            }
            let params = {
                get_action  : "send_mail",
                'emails[]'  : this._targets
            };
            if(this._messages.length === 1){
                params['message'] = this._messages[0];
            }else{
                params['messages[]'] = this._messages;
            }

            if(this._subjects.length === 1){
                params['subject'] = this._subjects[0];
            }else{
                params['subjects[]'] = this._subjects;
            }

            if(this._links.length === 1){
                params['link'] = this._links;
            }else if(this._links.length > 1){
                params['links[]'] = this._links;
            }
            if(this.templateId) {
                params["template_id"] = this.templateId;
                params["template_data"] = JSON.stringify(this.templateData);
            }

            const client = PydioApi.getClient();
            client.request(params, function(transport){
                const res = client.parseXmlMessage(transport.responseXML);
                callback(res);
            }.bind(this));

        }

    }

    const Mailer = React.createClass({

        propTypes:{
            message:React.PropTypes.string,
            subject:React.PropTypes.string,
            templateId: React.PropTypes.string,
            templateData: React.PropTypes.object,
            link:React.PropTypes.string,
            onDismiss:React.PropTypes.func,
            className:React.PropTypes.string,
            overlay:React.PropTypes.bool,
            uniqueUserStyle:React.PropTypes.bool,
            users:React.PropTypes.object,
            panelTitle:React.PropTypes.string,
            zDepth:React.PropTypes.number,
            showAddressBook: React.PropTypes.bool,
            processPost: React.PropTypes.func,
            additionalPaneTop: React.PropTypes.instanceOf(React.Component),
            additionalPaneBottom: React.PropTypes.instanceOf(React.Component)
        },

        getInitialState: function(){
            return {
                users:this.props.users || {},
                subject:this.props.subject,
                message:this.props.message,
                errorMessage:null
            };
        },

        getDefaultProps: function(){
            return {showAddressBook: true};
        },

        updateSubject: function(event){
            this.setState({subject:event.currentTarget.value});
        },

        updateMessage: function(event){
            this.setState({message:event.currentTarget.value});
        },

        addUser: function(userObject){
            var users = this.state.users;
            users[userObject.getId()] = userObject;
            this.setState({users:users, errorMessage:null});
        },

        removeUser: function(userId){
            delete this.state.users[userId];
            this.setState({users:this.state.users});
        },

        getMessage: function(messageId, nameSpace = undefined){
            try{
                if(nameSpace === undefined) nameSpace = 'core.mailer';
                if(nameSpace) nameSpace += ".";
                return global.pydio.MessageHash[ nameSpace + messageId ];
            }catch(e){
                return messageId;
            }
        },

        postEmail : function(repost=false){
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
            const callback = (res) => {
                if(res) this.props.onDismiss();
            };
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
        },

        usersLoaderRenderSuggestion(userObject){
            return <DestBadge user={userObject}/> ;
        },

        render: function(){
            const className = [this.props.className, "react-mailer", "reset-pydio-forms"].join(" ");
            const users = Object.keys(this.state.users).map(function(uId){
                return (
                    <UserChip key={uId} user={this.state.users[uId]} onRemove={this.removeUser}/>
                );
            }.bind(this));
            let errorDiv;
            if(this.state.errorMessage){
                errorDiv = <div style={{padding: '10px 20px', color: 'red'}}>{this.state.errorMessage}</div>
            }
            const style = {
                margin:this.props.uniqueUserStyle ? 0 : 8,
                ...this.props.style,
            };
            const content = (
                <MaterialUI.Paper zDepth={this.props.zDepth !== undefined ? this.props.zDepth : 2} className={className} style={style}>
                    <h3  style={{padding:20, color:'rgba(0,0,0,0.87)', fontSize:25, marginBottom: 0, paddingBottom: 10}}>{this.props.panelTitle}</h3>
                    {errorDiv}
                    {this.props.additionalPaneTop}
                    {!this.props.uniqueUserStyle &&
                        <div className="users-block" style={{padding: '0 20px'}}>
                            <PydioComponents.UsersCompleter
                                ref="completer"
                                fieldLabel={this.getMessage('8')}
                                usersOnly={true}
                                existingOnly={true}
                                freeValueAllowed={true}
                                onValueSelected={this.addUser}
                                excludes={Object.keys(this.state.users)}
                                renderSuggestion={this.usersLoaderRenderSuggestion}
                                pydio={global.pydio}
                                showAddressBook={this.props.showAddressBook}
                                underlineHide={true}
                            />
                            <div style={styles.wrapper}>{users}</div>
                        </div>
                    }
                    {!this.props.uniqueUserStyle && <MaterialUI.Divider/>}
                    {!this.props.templateId &&
                        <div  style={{padding:'0 20px'}}>
                            <MaterialUI.TextField fullWidth={true} underlineShow={false} floatingLabelText={this.getMessage('6')} value={this.state.subject} onChange={this.updateSubject}/>
                        </div>
                    }
                    {!this.props.templateId &&
                        <MaterialUI.Divider/>
                    }
                    <div style={{padding:'0 20px'}}>
                        <MaterialUI.TextField
                            fullWidth={true}
                            underlineShow={false}
                            floatingLabelText={this.getMessage('7')}
                            value={this.state.message}
                            multiLine={true}
                            onChange={this.updateMessage}
                            rowsMax={6}
                        />
                    </div>
                    {this.props.additionalPaneBottom}
                    <MaterialUI.Divider/>
                    <div style={{textAlign:'right', padding: '8px 20px'}}>
                        <MaterialUI.FlatButton label={this.getMessage('54', '')} onTouchTap={this.props.onDismiss}/>
                        <MaterialUI.FlatButton primary={true} label={this.getMessage('77', '')} onTouchTap={(e)=>this.postEmail()}/>
                    </div>
                </MaterialUI.Paper>
            );
            if(this.props.overlay){
                return (
                    <div style={styles.overlay}>{content}</div>
                );
            }else{
                return content;
            }
        }
    });

    const Preferences = React.createClass({
        render: function(){
            return <div>Preferences Panel</div>;
        }
    });


    let PydioMailer = global.PydioMailer || {};
    PydioMailer.Pane = Mailer;
    PydioMailer.PreferencesPanel = Preferences;
    global.PydioMailer = PydioMailer;

})(window);
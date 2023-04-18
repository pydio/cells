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
import React from 'react'
import ResourcesManager from 'pydio/http/resources-manager'

class MailerTest extends React.Component {

    constructor(props){
        super(props);
        this.state = {loaded: false};
    }

    componentDidMount(){
        ResourcesManager.loadClass('PydioMailer').then((ns)=> {
            this.setState({loaded: true, Pane: ns.Pane});
        });
    }

    render(){

        const {loaded, Pane} = this.state;
        const {MessageHash} = this.props.pydio;
        const {adminStyles} = this.props;

        if(!loaded){
            return (
                <div style={{padding: 20}}>
                    {MessageHash["ajxp_admin.mailer.test.loading"]}
                </div>
            );
        }

        return (
            <div>
                <Pane
                    pydio={this.props.pydio}
                    templateId={"AdminTestMail"}
                    templateData={{}}
                    overlay={false}
                    panelTitle={MessageHash["ajxp_admin.mailer.test.title"]}
                    style={{margin:0}}
                    titleStyle={adminStyles.body.block.headerFull}
                    usersBlockStyle={{}}
                    messageBlockStyle={{}}
                    zDepth={0}
                />
                <div style={{color: '#BDBDBD',margin: '20px 16px', fontSize: 12}}>{MessageHash["ajxp_admin.mailer.test.legend"]}</div>
            </div>
        );

    }

}

export {MailerTest as default}
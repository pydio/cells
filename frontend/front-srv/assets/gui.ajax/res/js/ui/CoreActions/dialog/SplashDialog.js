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
import createReactClass from 'create-react-class';
import Pydio from "pydio";
import {Card, CardTitle, CardText, Divider, FlatButton, FontIcon, IconButton, CardActions} from 'material-ui'
const {ActionDialogMixin, SubmitButtonProviderMixin, Loader} = Pydio.requireLib('boot');
import Markdown from "react-markdown";

const mdStyle = `
.credits-md h4 {
    padding-top: 0;
}

.credits-md h5 {
    font-weight: 500;
}

.credits-md ul {
    padding-left: 20px;
    padding-bottom: 20px;
}

.credits-md li {
    list-style-type: square;
    line-height: 1.6em;
}

.credits-md a {
    color: #607D8B;
    font-weight: 500;
}
`;

const SplashDialog = createReactClass({
    displayName: 'SplashDialog',

    mixins:[
        ActionDialogMixin,
        SubmitButtonProviderMixin
    ],

    getDefaultProps(){
        return {
            dialogTitle: '',
            dialogSize:'lg',
            dialogIsModal: false,
            dialogPadding: false,
            dialogScrollBody: true
        };
    },

    submit(){
        this.dismiss();
    },

    openDocs(){
        open("https://pydio.com/en/docs");
    },

    openForum(){
        open("https://forum.pydio.com");
    },

    openGithub(){
        open("https://github.com/pydio/cells/issues");
    },

    getInitialState(){
        return {aboutContent: null};
    },

    componentDidMount(){
        window.fetch('plug/gui.ajax/credits.md', {
            method:'GET',
            credentials:'same-origin',
        }).then((response) => {
            response.text().then((data) => {
                this.setState({aboutContent: data});
            });
        });
    },

    render(){
        let credit;
        if (this.state.aboutContent) {
            credit = <Markdown source={this.state.aboutContent}/>;
        } else {
            credit = <Loader style={{minHeight: 200}}/>;
        }
        return (
            <div style={{height:'100%', width: '100%'}}>
                <Card style={{borderRadius: 0}}>
                    <CardTitle title={pydio.Parameters.get('backend')['PackageLabel']}/>
                    <Divider/>
                    <CardActions style={{display:'flex', alignItems:'center'}}>
                        <FlatButton primary={true} icon={<FontIcon className="mdi mdi-book-variant" />} label="Docs" onClick={this.openDocs} />
                        <FlatButton primary={true} icon={<FontIcon className="mdi mdi-slack" />} label="Forums" onClick={this.openForum}/>
                        <FlatButton primary={true} icon={<FontIcon className="mdi mdi-github-box" />} label="Issues" onClick={this.openGithub}/>
                        <span style={{flex: 1}}/>
                        <IconButton style={{width:40,height:40,padding:8}} iconStyle={{color:'#FF786A'}} iconClassName={"icomoon-cells"} onClick={() => {open('https://pydio.com/?utm_source=cells-about')} } tooltip={"Pydio.com"}/>
                        <IconButton style={{width:40,height:40,padding:8}} iconStyle={{color:'#3b5998'}} iconClassName={"mdi mdi-facebook-box"} onClick={() => {open('https://facebook.com/Pydio')} } tooltip={"@Pydio"}/>
                        <IconButton style={{width:40,height:40,padding:8}} iconStyle={{color:'#00acee'}} iconClassName={"mdi mdi-twitter-box"} onClick={() => {open('https://twitter.com/pydio')} } tooltip={"@pydio"}/>
                    </CardActions>
                    <Divider/>
                    <CardText className={"credits-md"}>
                        {credit}
                    </CardText>
                    <style type={"text/css"} dangerouslySetInnerHTML={{__html:mdStyle}}/>
                </Card>
            </div>
        );
    },
});

export default SplashDialog
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
import {RaisedButton, Divider} from 'material-ui'
const {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader} = Pydio.requireLib('components');
import {AuthLdapServerConfig} from 'pydio/http/rest-api'
import ServerConfigModel from './ServerConfigModel'
import ConnectionPane from './ConnectionPane'
import FilterPane from './FilterPane'
import MappingsPane from './MappingsPane'
import MemberOfPane from './MemberOfPane'
import GeneralPane from './GeneralPane'
import uuid from 'uuid4'

class LdapEditor extends React.Component{

    constructor(props){
        super(props);
        const {config} = props;
        let model, create = true;
        if(config){
            model = new ServerConfigModel(config.ConfigId, config);
            create = false;
        } else {
            let conf = new AuthLdapServerConfig();
            conf.ConfigId = uuid();
            model = new ServerConfigModel(conf.ConfigId, conf);
        }
        model.observe('update', () => {
            this.setState({
                config:model.getConfig(),
                dirty: true,
                valid: model.isValid()
            }, ()=>{this.forceUpdate()});
        });
        this.state = {
            model: model,
            config : model.getConfig(),
            snapshot: model.snapshot(),
            dirty: create,
            valid: !create,
            create: create,
            currentPane:'general'
        };
    }

    isDirty(){
        return this.state.dirty;
    }

    isValid(){
        return this.state.valid;
    }

    isCreate(){
        return this.state.create;
    }


    componentWillReceiveProps(newProps) {
        const {config} = newProps;
        if(config && this.props.config !== config) {
            const model = new ServerConfigModel(config.ConfigId, config);
            model.observe('update', () => {
                this.setState({
                    config:model.getConfig(),
                    dirty: true,
                    valid: model.isValid()
                }, ()=>{this.forceUpdate()});
            });
            this.state = {
                model: model,
                config: model.getConfig(),
                snapshot: model.snapshot(),
            }
        }
    }

    revert(){
        const {model, snapshot} = this.state;
        const newConfig = model.revertTo(snapshot);
        this.setState({config: newConfig, dirty: false});
    }

    save(){
        const {model} = this.state;
        const {reload} = this.props;
        model.save().then(resp => {
            this.setState({dirty: false, snapshot:model.snapshot()});
            reload();
        });
    }

    setSelectedPane(key){
        this.setState({currentPane:key});
    }

    render(){

        const {dirty, valid, currentPane, config} = this.state;
        const buttonMargin = {marginLeft: 6};
        let actions = [];
        if(!this.isCreate()){
            actions.push(<RaisedButton style={buttonMargin} disabled={!dirty} label={"Revert"} onTouchTap={this.revert.bind(this)}/>);
        }
        actions.push(<RaisedButton style={buttonMargin} disabled={!dirty || !valid} label={"Save"} onTouchTap={this.save.bind(this)}/>);
        if(this.isCreate()){
            actions.push(<RaisedButton style={buttonMargin} label={"Cancel"} onTouchTap={() => this.props.onRequestTabClose(this)}/>);
        } else {
            actions.push(<RaisedButton style={buttonMargin} label={"Close"} onTouchTap={() => this.props.onRequestTabClose(this)}/>);
        }

        const leftNav = [
            <PaperEditorNavHeader key="h1" label={"Directory"}/>,
            <PaperEditorNavEntry key="general" keyName="general" onClick={this.setSelectedPane.bind(this)} label={pydio.MessageHash["ldap.2"]} selectedKey={currentPane}/>,
            <PaperEditorNavEntry key="connection" keyName="connection" onClick={this.setSelectedPane.bind(this)} label={pydio.MessageHash["ldap.3"]} selectedKey={currentPane}/>,
            <PaperEditorNavEntry key="filter" keyName="filter" onClick={this.setSelectedPane.bind(this)} label={pydio.MessageHash["ldap.4"]} selectedKey={currentPane}/>,
            <PaperEditorNavHeader key="h2" label={"Mapping"}/>,
            <PaperEditorNavEntry key="mappings" keyName="mappings" onClick={this.setSelectedPane.bind(this)} label={pydio.MessageHash["ldap.5"]} selectedKey={currentPane}/>,
            <PaperEditorNavEntry key="memberof" keyName="memberof" onClick={this.setSelectedPane.bind(this)} label={pydio.MessageHash["ldap.6"]} selectedKey={currentPane}/>,
        ];

        const paneStyle = {padding: 20};
        const titleStyle={fontSize:16, paddingBottom: 6};
        const legendStyle={fontSize: 13, color: '#9e9e9e'};
        const paneProps = {
            pydio: pydio,
            style: paneStyle,
            config: config,
            titleStyle: titleStyle,
            legendStyle:legendStyle,
            divider: <Divider style={{marginTop:20, marginBottom: 20, marginLeft: -20, marginRight: -20}}/>
        };

        let pane;
        switch (currentPane) {
            case "general":
                pane = <GeneralPane {...paneProps}/>
                break;
            case "connection":
                pane = <ConnectionPane {...paneProps}/>
                break;
            case "filter":
                pane = <FilterPane  {...paneProps}/>
                break;
            case "mappings":
                pane = <MappingsPane  {...paneProps}/>
                break;
            case "memberof":
                pane = <MemberOfPane  {...paneProps}/>
                break;
            default:
                break;
        }

        return <PaperEditorLayout
            title={config.DomainName ? config.DomainName : 'New Directory'}
            titleActionBar={actions}
            contentFill={false}
            leftNav={leftNav}
        >
            {pane}
        </PaperEditorLayout>

    }

}

export {LdapEditor as default}
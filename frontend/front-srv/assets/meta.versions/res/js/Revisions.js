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

import React, {Component, Fragment} from 'react'
import Pydio from 'pydio'
const PydioApi = require('pydio/http/api');
import MetaNodeProvider from 'pydio/model/meta-node-provider'
const Node = require('pydio/model/node');
import ReactMarkdown from 'react-markdown';
const {Timeline, UserAvatar} = Pydio.requireLib('components');
const {moment} = Pydio.requireLib('boot')
import PathUtils from 'pydio/util/path'

const UserLinkWrapper = ({href, children}) => {
    if (href.startsWith('user://')) {
        const userId = href.replace('user://', '');
        return (
            <UserAvatar
                userId={userId}
                displayAvatar={false}
                richOnClick={false}
                style={{display:'inline-block', fontWeight: 500}}
                pydio={Pydio.getInstance()}
            />)
    }
    return <span>{children}</span>
};

const Paragraph = ({children}) => <span>{children}</span>;

class Revisions extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            revs: [],
            selection: props.preselection
        }
        this.load()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.node !== this.props.node) {
            this.load()
        }
    }


    getMessage(id){
        return Pydio.getMessages()['meta.versions.' + id] || id;
    }

    load() {
        const {node} = this.props;
        const provider = new MetaNodeProvider({versions:'true',file:node.getPath()});
        const versionsRoot = new Node("/", false, "Versions", "folder.png", provider);
        provider.loadNode(versionsRoot, (n) => {
            const revs = [];
            n.getChildren().forEach(c => revs.push(c));
            this.setState({loading: false, revs});
        })
    }

    applyAction(action, versionNode){
        const {node, onRequestClose} = this.props;
        switch(action){
            case 'dl':
                PydioApi.getClient().openVersion(node, versionNode.getMetadata().get('versionId'));
                break;
            case 'revert':
                if(!confirm(this.getMessage('13'))){
                    return;
                }
                PydioApi.getClient().revertToVersion(node, versionNode.getMetadata().get('versionId'), ()=>{
                    if(onRequestClose) {
                        onRequestClose();
                    }
                });
                break;
            default:
                break;
        }
    }

    itemActions(item, prev, next) {
        if(prev) {
            return [
                {onClick:() => this.applyAction('dl', item), label:this.getMessage('3')},
                {onClick:() => this.applyAction('revert', item), label:this.getMessage('7')}
            ]
        } else {
            return []
        }
    }

    itemAnnotations(item, prev, next) {
        let arrow
        const size = parseInt(item.getMetadata().get('bytesize'));
        if(next){
            const nextSize = parseInt(next.getMetadata().get('bytesize'));
            if(nextSize === size){
                arrow = 'right'
            } else  if(nextSize > size){
                arrow = 'bottom-right'
            } else {
                arrow = 'top-right'
            }
        }
        return (
            <div className={"tl-annotation"}>{arrow && <span className={"tl-annotation-dir mdi mdi-arrow-" + arrow}/>}{PathUtils.roundFileSize(size)}</div>
        )
    }

    render() {
        const {loading, revs, selection} = this.state;
        if (loading) {
            return <div style={{textAlign:'center', fontWeight: 500, opacity: 0.3, padding: 20}}>{Pydio.getMessages()['466']}</div>
        }
        const {className='', onClick} = this.props;

        return (
            <Timeline
                items={revs}
                className={className}
                useSelection={true}
                preSelection={selection}
                onItemSelect={onClick}
                itemUuid={(item) => item.getMetadata().get("versionId")}
                itemMoment={(item) => moment(item.getMetadata().get('ajxp_modiftime')*1000)}
                itemDesc={(item) => <ReactMarkdown
                        source={item.getMetadata().get('versionDescription')}
                        renderers={{'link': UserLinkWrapper, 'paragraph':Paragraph}}
                    />}
                itemActions={this.itemActions.bind(this)}
                itemAnnotations={this.itemAnnotations.bind(this)}
                color={"#2196f3"}
            />
        )

    }

}

export default Revisions;
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
const {UserAvatar} = Pydio.requireLib('components');
const {moment} = Pydio.requireLib('boot')
import {IconButton} from 'material-ui'
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

const IcStyles = {
    style:{
        width: 26,
        height: 26,
        padding: 4,
        marginLeft: 4
    },
    iconStyle:{
        fontSize: 18
    },
}

class Timeblock extends Component {
    render() {

        const {node, prev, next, getMessage, applyAction, onClick} = this.props;
        const date = moment(node.getMetadata().get('ajxp_modiftime')*1000);
        let className = 'rev-block';
        let sepClassName = 'sep-date';
        let similar = false
        let arrow;
        const size = parseInt(node.getMetadata().get('bytesize'));

        if(prev){
            const prevDate = moment(prev.getMetadata().get('ajxp_modiftime')*1000);

            if(date.format('L') === prevDate.format('L')){
                className += ' similar';
                similar = true
            } else {
                className += ' newday';
                sepClassName += ' newday';
            }
        }
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
            <Fragment>
            {!similar &&
                <div className={sepClassName}>
                    <div className={"daymonth"}>{date.format('DD')}</div>
                    <div className={"dayweek"}>{date.format('ddd')}</div>
                </div>
            }
            <div className={className}>
                <div className={"rev-date"}>
                    <div className={"daymonth"}>{date.format('DD')}</div>
                    <div className={"dayweek"}>{date.format('ddd')}</div>
                </div>
                <div className={"rev-dot"}></div>
                <div className={"rev-card"} onClick={onClick}>
                    <div className={"rev-desc"}>
                        <div className={"desc-date"}>{date.format(similar?'LT':'llll')}</div>
                        <ReactMarkdown
                            source={node.getMetadata().get('versionDescription')}
                            renderers={{'link': UserLinkWrapper, 'paragraph':Paragraph}}
                        />
                    </div>
                    <div className={"rev-actions"}>
                        <div className={"rev-size"}>{arrow && <span className={"size-dir mdi mdi-arrow-" + arrow}/>}{PathUtils.roundFileSize(size)}</div>
                        <IconButton iconClassName={"mdi mdi-download rev-action"} onClick={() => applyAction('dl', node)} tooltip={getMessage('3')} {...IcStyles}/>
                        <IconButton iconClassName={"mdi mdi-backup-restore rev-action"} onClick={() => applyAction('revert', node)} tooltip={getMessage('7')} {...IcStyles}/>
                    </div>
                </div>
            </div>
            </Fragment>
        )
    }
}

class Revisions extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            revs: []
        }
        this.load()
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

    makeStyle() {
        const {color="#2196f3"} = this.props;
        const style = `
        .timeline .rev-timeline .rev-block .rev-dot{
            background-color: ${color};
            box-shadow: ${color} 0px 0px 4px;
        }
        .timeline .rev-timeline .rev-block .rev-dot:before{
            border-color: ${color}
        }
        .timeline .rev-timeline .daymonth{
            color: ${color}
        }
        `
        return (<style type="text/css">{style}</style>)
    }

    render() {
        const {loading, revs} = this.state;
        if (loading) {
            return <div style={{textAlign:'center', fontWeight: 500, opacity: 0.3, padding: 20}}>{Pydio.getMessages()['466']}</div>
        }
        const {className='', onClick} = this.props;

        return(
            <div className={"timeline " + className}>
                <div className={"rev-line"}></div>
                <div className={"rev-timeline"}>
                    {revs.map((n,i) => <Timeblock
                        node={n}
                        prev={i>0?revs[i-1]:null}
                        next={i<revs.length-1?revs[i+1]:null}
                        getMessage={this.getMessage.bind(this)}
                        applyAction={this.applyAction.bind(this)}
                        onClick={onClick}
                    />)}
                </div>
                {this.makeStyle()}
            </div>
        )
    }

}

export default Revisions;
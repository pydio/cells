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
import PropTypes from 'prop-types';

import React from 'react';
import ReactDOM from 'react-dom'
import ShareContextConsumer from '../ShareContextConsumer'
import {IconButton} from 'material-ui'
import Clipboard from 'clipboard'
import LinkModel from '../links/LinkModel'

class TargetedUserLink extends React.Component{


    constructor(props){
        super(props);
        this.state = {copyMessage : ''};
    }


    componentDidMount(){
        if(this._clip){
            this._clip.destroy();
        }
        if(this._button){
            this._clip = new Clipboard(this._button, {
                text: function(trigger) {
                    return this.props.link;
                }.bind(this)
            });
            this._clip.on('success', function(){
                this.setState({copyMessage:this.props.getMessage('192')}, this.clearCopyMessage);
            }.bind(this));
            this._clip.on('error', function(){
                let copyMessage;
                if( global.navigator.platform.indexOf("Mac") === 0 ){
                    copyMessage = this.props.getMessage('144');
                }else{
                    copyMessage = this.props.getMessage('share_center.143');
                }
                this.setState({copyMessage:copyMessage}, this.clearCopyMessage);
            }.bind(this));
        }
    }

    componentWillUnmount(){
        if(this._clip){
            this._clip.destroy();
        }
    }

    clearCopyMessage(){
        setTimeout(function(){
            this.setState({copyMessage:''});
        }.bind(this), 5000);
    }

    render(){
        const {targetUser, link} = this.props;

        return (
            <div style={{display:'flex'}}>
                <div style={{flex: 1}} >
                    {targetUser.Display}
                    <IconButton
                        pydio={this.props.pydio}
                        ref={(ref) => {this._button = ReactDOM.findDOMNode(ref)}}
                        iconClassName="mdi mdi-link"
                        tooltip={this.state.copyMessage || link}
                        iconStyle={{fontSize: 13, lineHeight:'17px'}} style={{width:34, height: 34, padding:6}}
                    />
                </div>
                <div style={{width: 40, textAlign:'center'}}>{targetUser.DownloadCount}</div>
            </div>
        );

    }
}

class TargetedUsers extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {open: false};
    }

    render(){
        const {linkModel} = this.props;
        const link = linkModel.getLink();
        let targetUsers;
        if(link.TargetUsers){
            targetUsers = link.TargetUsers;
        }
        let items = Object.keys(targetUsers).map((k) => {
            const title = linkModel.getPublicUrl() + '?u=' + k;
            return <TargetedUserLink targetUser={targetUsers[k]} link={title}/>;
        });
        if(!items.length) {
            return null;
        }

        const rootStyle = {
            lineHeight: '34px',
            padding: '4px 10px 4px',
            fontSize: 14,
            backgroundColor: '#fafafa',
            borderRadius: 2
        };
        const headerStyle = {
            borderBottom: this.state.open ?  '1px solid #757575' : '',
            color: 'rgba(0, 0, 0, 0.36)'
        };

        return (
            <div style={rootStyle}>
                <div style={{display:'flex', ...headerStyle}}>
                    <div style={{flex: 1}} >{this.props.getMessage('245').replace('%s', items.length)} <span className={'mdi mdi-chevron-' + (this.state.open ? 'up' : 'down')} style={{cursor:'pointer'}} onClick={() => {this.setState({open:!this.state.open})}}/></div>
                    {this.state.open && <div style={{width: 40, textAlign:'center'}}>#DL</div>}
                </div>
                {this.state.open &&
                    <div>{items}</div>
                }
            </div>
        );

    }

}

TargetedUsers.propTypes = {
    linkModel:PropTypes.instanceOf(LinkModel)
};

TargetedUsers = ShareContextConsumer(TargetedUsers);
TargetedUserLink = ShareContextConsumer(TargetedUserLink);

export {TargetedUsers as default}
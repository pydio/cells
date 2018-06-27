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

    const Panel = React.createClass({

        componentDidMount: function(){
            this.loadKeys();
        },

        getInitialState: function(){
            return {loaded: false, keys: {}}
        },

        generateAllowed: function(){
            return this.props.pydio.getPluginConfigs("authfront.keystore").get("USER_GENERATE_KEYS");
        },

        loadKeys: function(){
            this.setState({loaded: false});
            PydioApi.getClient().request({
                get_action: 'keystore_list_tokens'
            }, function(transport) {
                if (transport.responseJSON){
                    this.setState({keys: transport.responseJSON});
                }
                this.setState({loaded: true});
            }.bind(this));
        },

        removeKey: function(k){

            if(!window.confirm(MessageHash['keystore.7'])){
                return;
            }
            let params = {get_action:'keystore_revoke_tokens'};
            if(k){
                params['key_id'] = k;
            }
            PydioApi.getClient().request(params, () => {this.loadKeys()});

        },

        generateKey: function(){

            if(!this.generateAllowed()) return;

            PydioApi.getClient().request({
                get_action:"keystore_generate_auth_token"
            }, function(transport){
                const data = transport.responseJSON;
                this.setState({
                    newKey:data//'Token : ' + data['t'] + '<br> Private : ' + data['p']
                });
                this.loadKeys();
            }.bind(this))

        },


        render: function(){
            let keys = [];
            for(let k in this.state.keys){
                if(!this.state.keys.hasOwnProperty(k)) continue;
                let item = this.state.keys[k];
                let remove = function(){
                    this.removeKey(k);
                }.bind(this);
                let deviceId = item['DEVICE_ID'] || '';
                deviceId = deviceId.substring(0 , 13) + (deviceId.length > 13 ? '...' : '');
                const primaryText = item.DEVICE_DESC + (item.DEVICE_OS !== item.DEVICE_DESC ? ' - ' + item.DEVICE_OS : '');
                const secondaryText = 'From: ' + (item.DEVICE_IP === '::1' ? 'Local' : item.DEVICE_IP) + (deviceId ? ' - Id: ' + deviceId : '');
                const leftIcon = <MaterialUI.FontIcon className="mdi mdi-responsive" style={{color:this.props.muiTheme.palette.primary1Color}}/>
                const rightIcon = <MaterialUI.IconButton iconClassName="mdi mdi-key-minus" onTouchTap={remove}  iconStyle={{color:'rgba(0,0,0,0.53)'}}/>
                keys.push(
                    <MaterialUI.ListItem
                        key={k}
                        primaryText={primaryText}
                        secondaryText={secondaryText}
                        disabled={true}
                        leftIcon={leftIcon}
                        rightIconButton={rightIcon}
                    />);
            }
            let mess = this.props.pydio.MessageHash;
            let tokenResult;
            if(this.state.newKey){
                const getMessage = id => mess[id];
                tokenResult = (
                    <div id="token_results" style={{backgroundColor:'#FFFDE7', padding:'8px 16px'}}>
                        <div id="token_results_content">
                            <PydioComponents.ClipboardTextField floatingLabelText="Key" inputValue={this.state.newKey.t} getMessage={getMessage} />
                            <PydioComponents.ClipboardTextField floatingLabelText="Secret" inputValue={this.state.newKey.p} getMessage={getMessage} />
                        </div>
                        <div style={{textAlign:'right'}}>
                            <MaterialUI.RaisedButton label="OK" onTouchTap={() => {this.setState({newKey: null})}}/>
                        </div>
                    </div>
                );
            }
            let list = this.state.loaded ? <MaterialUI.List>{keys}</MaterialUI.List> : <PydioReactUI.Loader/>;
            return (
                <div>
                    <MaterialUI.Toolbar>
                        <div style={{color: 'white', padding: '18px 0px', marginLeft: -10, fontWeight: 500}}>{mess['keystore.9']}</div>
                        <div style={{flex:1}}></div>
                        <MaterialUI.ToolbarGroup lastChild={true}>
                            {this.generateAllowed() &&
                                <MaterialUI.IconButton tooltip={mess['keystore.3']} tooltipPosition="bottom-left" iconClassName="mdi mdi-key-plus" onTouchTap={this.generateKey} iconStyle={{color:'white'}}/>
                            }
                            <MaterialUI.IconButton tooltip={mess['keystore.5']} tooltipPosition="bottom-left" iconClassName="mdi mdi-key-remove" onTouchTap={() => {this.removeKey();}} iconStyle={{color:'white'}}/>
                        </MaterialUI.ToolbarGroup>
                    </MaterialUI.Toolbar>
                    {tokenResult}
                    {list}
                </div>
            );
        }

    });

    global.ApiKeys = {
        Panel: MaterialUI.Style.muiThemeable()(Panel)
    };

})(window);
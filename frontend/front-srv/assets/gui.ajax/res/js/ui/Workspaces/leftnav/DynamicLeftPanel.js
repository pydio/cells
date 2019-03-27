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

import WorkspaceList from '../wslist/WorkspacesList'

export default React.createClass({

    propTypes:{
        pydio:React.PropTypes.instanceOf(Pydio).isRequired,
        pydioId:React.PropTypes.string.isRequired
    },

    childContextTypes: {
        messages:React.PropTypes.object,
        getMessage:React.PropTypes.func
    },

    getChildContext: function() {
        var messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function(messageId, namespace='ajxp_admin'){
                try{
                    return messages[namespace + (namespace?".":"") + messageId] || messageId;
                }catch(e){
                    return messageId;
                }
            }
        };
    },

    parseComponentConfigs:function(){
        var reg = this.props.pydio.Registry.getXML();
        //Does not work on IE 11
        //var contentNodes = XMLUtils.XPathSelectNodes(reg, 'client_configs/component_config[@className="AjxpReactComponent::'+this.props.pydioId+'"]/additional_content');
        var contentNodes = XMLUtils.XPathSelectNodes(reg, 'client_configs/component_config/additional_content');
        var result = [];
        var compId = "AjxpReactComponent::"+this.props.pydioId;
        contentNodes.map(function(node){
            if(node.parentNode.getAttribute('className') == compId){
                result.push({
                    id:node.getAttribute('id'),
                    position: parseInt(node.getAttribute('position')),
                    type: node.getAttribute('type'),
                    options: JSON.parse(node.getAttribute('options'))
                });
            }
        });
        result.sort(function(a,b){return a.position >= b.position ? 1 : -1});
        return result;
    },

    getInitialState:function(){
        return {
            statusOpen:true,
            blinkingBell: false,
            additionalContents:this.parseComponentConfigs(),
            workspaces: this.props.pydio.user.getRepositoriesList()
        };
    },

    componentDidMount:function(){
        if(this._timer) global.clearTimeout(this._timer);
        this._timer = global.setTimeout(this.closeNavigation, 3000);

        this._reloadObserver = function(){
            try{
                if(this.isMounted()){
                    this.setState({
                        workspaces:this.props.pydio.user ? this.props.pydio.user.getRepositoriesList() : []
                    });
                }
            }catch(e){
                if(global.console){
                    console.error('Error while setting state on LeftPanel component - Probably height error on IE8', e);
                }
            }
        }.bind(this);

        this.props.pydio.observe('repository_list_refreshed', this._reloadObserver);
    },

    componentWillUnmount:function(){
        if(this._reloadObserver){
            this.props.pydio.stopObserving('repository_list_refreshed', this._reloadObserver);
        }
    },

    openNavigation:function(){
        if(!this.state.statusOpen){
            this.setState({statusOpen:true});
        }
    },

    closeNavigation:function(){
        this.setState({statusOpen:false});
    },

    listNodeClicked:function(node){
        this.props.pydio.goTo(node);
        this.closeNavigation();
    },

    closeMouseover:function(){
        if(this._timer) global.clearTimeout(this._timer);
    },

    closeMouseout:function(){
        if(this._timer) global.clearTimeout(this._timer);
        this._timer = global.setTimeout(this.closeNavigation, 300);
    },

    onAlertPanelBadgeChange: function(paneData, newValue, oldValue, memoData){
        if(paneData.id !== 'navigation_alerts'){
            return;
        }
        if(newValue){
            this.setState({blinkingBell: newValue, blinkingBellClass:paneData.options['titleClassName']});
        }else{
            this.setState({blinkingBell: false});
        }

        if(newValue && newValue !== oldValue){
            if(Object.isNumber(newValue)){
                if(oldValue !== '' && newValue > oldValue){
                    let notifText = 'Something happened!';
                    if(memoData instanceof PydioDataModel){
                        let node = memoData.getRootNode().getFirstChildIfExists();
                        if(node){
                            if(paneData.options['tipAttribute']){
                                notifText = node.getMetadata().get(paneData.options['tipAttribute']);
                            }else{
                                notifText = node.getLabel();
                            }
                        }
                    }
                    if(PydioTasks){
                        PydioTasks.AlertTask.setCloser(this.openNavigation.bind(this));
                        let title = global.pydio.MessageHash[paneData.options.title] || paneData.options.title;
                        let alert = new PydioTasks.AlertTask(title, notifText);
                        alert.show();
                    }
                }
            }
        }

    },

    render:function(){
        const additional = this.state.additionalContents.map(function(paneData){
            if(paneData.type == 'ListProvider'){
                return (
                    <PydioComponents.CollapsableListProvider
                        pydio={this.props.pydio}
                        paneData={paneData}
                        nodeClicked={this.listNodeClicked}
                        onBadgeChange={this.onAlertPanelBadgeChange}
                    />
                );
            }else{
                return null;
            }
        }.bind(this));

        let badge;
        if(this.state.blinkingBell){
            badge = <span className={"badge-icon icon-bell-alt"}/>;
        }

        return (
            <span>
                    <div  id="repo_chooser" onClick={this.openNavigation} onMouseOver={this.openNavigation} className={this.state.statusOpen?"open":""}>
                        <span className="icon-reorder"/>{badge}
                    </div>
                    <div className={"left-panel" + (this.state.statusOpen?'':' hidden')} onMouseOver={this.closeMouseover} onMouseOut={this.closeMouseout}>
                        {additional}
                        <UserWorkspacesList
                            pydio={this.props.pydio}
                            workspaces={this.state.workspaces}
                        />
                    </div>
                </span>
        );
    }
});

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
const {ActionDialogMixin, AsyncComponent} = Pydio.requireLib('boot');
import createReactClass from 'create-react-class'
import {Tabs, Tab, IconButton, FontIcon} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

class TopBar extends React.Component{

    render(){
        const {tabs, dismiss, muiTheme} = this.props;
        const br = muiTheme.borderRadius
        const {mui3} = muiTheme.palette
        return(
            <div style={{display:'flex', borderRadius:`${br}px ${br}px 0 0` , overflow:'hidden', borderBottom: '1px solid '+mui3['outline-variant-50']}}>
                <Tabs style={{flex: 1}} inkBarStyle={{backgroundColor: muiTheme.tabs.selectedTextColor}}>
                    {tabs}
                </Tabs>
                <IconButton iconStyle={{color:muiTheme.tabs.selectedTextColor}} iconClassName={"mdi mdi-close"} onClick={dismiss} tooltip={"Close"}/>
            </div>
        );
    }

}

TopBar = muiThemeable()(TopBar);

let UploadDialog = createReactClass({

    mixins:[
        ActionDialogMixin
    ],

    getDefaultProps: function(){
        const mobile = Pydio.getInstance().UI.MOBILE_EXTENSIONS;
        return {
            dialogTitle: '',
            dialogSize: mobile ? 'md' : 'lg',
            dialogPadding: false,
            dialogIsModal: false
        };
    },

    getInitialState(){
        let uploaders = this.props.pydio.Registry.getActiveExtensionByType("uploader").filter(uploader => uploader.moduleName);
        uploaders.sort(function(objA, objB){
            return objA.order - objB.order;
        });
        let current;
        if(uploaders.length){
            current = uploaders[0];
        }
        return {
            uploaders,
            current,
            loaded: false,
        };
    },

    render: function(){
        let tabs = [];
        let component = <div style={{height: 360}}></div>;
        const dismiss = () => {this.dismiss()};
        const {uploaders, current, loaded} = this.state;
        uploaders.map((uploader) => {
            tabs.push(<Tab label={uploader.xmlNode.getAttribute('label')} key={uploader.id} onActive={()=>{this.setState({current:uploader})}} style={{textTransform:'none'}}/>);
        });
        if(current){
            let parts = current.moduleName.split('.');
            component = (
                <AsyncComponent
                    pydio={this.props.pydio}
                    namespace={parts[0]}
                    componentName={parts[1]}
                    onDismiss={dismiss}
                    showDismiss={tabs.length === 1}
                    onLoad={()=>{this.setState({loaded: true})}}
                    {...this.props.uploaderProps}
                />
            );
        }

        return (
            <div style={{width: '100%'}}>
                {tabs.length > 1 && <TopBar tabs={tabs} dismiss={dismiss}/>}
                {component}
                {!loaded && <div style={{padding: '100px 40px', textAlign:'center', color: 'rgba(0,0,0,.5)'}}>{this.props.pydio.MessageHash['466']}</div>}
            </div>
        );
    }

});

export {UploadDialog as default}
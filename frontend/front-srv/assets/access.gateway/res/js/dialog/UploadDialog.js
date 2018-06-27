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

const React = require('react')
const {ActionDialogMixin, SubmitButtonProviderMixin} = require('pydio').requireLib('boot')

let UploadDialog = React.createClass({

    mixins:[
        ActionDialogMixin,
        SubmitButtonProviderMixin
    ],

    getDefaultProps: function(){
        const mobile = pydio.UI.MOBILE_EXTENSIONS;
        return {
            dialogTitle: '',
            dialogSize: mobile ? 'md' : 'lg',
            dialogPadding: false,
            dialogIsModal: true
        };
    },

    submit(){
        this.dismiss();
    },

    render: function(){
        let tabs = [];
        let uploaders = this.props.pydio.Registry.getActiveExtensionByType("uploader");
        const dismiss = () => {this.dismiss()};

        uploaders.sort(function(objA, objB){
            return objA.order - objB.order;
        });

        uploaders.map((uploader) => {
            if(uploader.moduleName) {
                let parts = uploader.moduleName.split('.');
                tabs.push(
                    <MaterialUI.Tab label={uploader.xmlNode.getAttribute('label')} key={uploader.id}>
                        <PydioReactUI.AsyncComponent
                            pydio={this.props.pydio}
                            namespace={parts[0]}
                            componentName={parts[1]}
                            onDismiss={dismiss}
                        />
                    </MaterialUI.Tab>
                );
            }
        });

        return (
            <MaterialUI.Tabs style={{width: '100%'}}>
                {tabs}
            </MaterialUI.Tabs>
        );
    }

});

export {UploadDialog as default}
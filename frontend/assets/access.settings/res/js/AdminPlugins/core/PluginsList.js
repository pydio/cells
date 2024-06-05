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

import XMLUtils from 'pydio/util/xml'
import LangUtils from 'pydio/util/lang'
import {Toggle, IconButton} from 'material-ui'
import Loader from './Loader'
const {MaterialTable} = Pydio.requireLib('components');
import PluginEditor from './PluginEditor'
import createReactClass from 'create-react-class'

const PluginsList = createReactClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    getInitialState(){
        return {};
    },

    componentDidMount(){
        Loader.getInstance(this.props.pydio).loadPlugins().then(res => {
            this.setState({xmlPlugins: res});
        });
    },
    
    togglePluginEnable(node, toggled) {
        Loader.getInstance(this.props.pydio).toggleEnabled(node, toggled, () => {
            this.reload();
        })
    },

    openTableRows(rows){
        if(rows && rows.length && this.props.openRightPane){
            this.props.openRightPane({
                COMPONENT:PluginEditor,
                PROPS:{
                    pluginId:rows[0].id,
                    docAsAdditionalPane:true,
                    className:"vertical edit-plugin-inpane",
                    closeEditor:this.props.closeRightPane,
                    accessByName:this.props.accessByName
                },
                CHILDREN:null
            });
        }
    },

    reload(){
        Loader.getInstance(this.props.pydio).loadPlugins(true).then(res => {
            this.setState({xmlPlugins: res});
        });
    },

    computeTableData(){
        let rows = [];
        const {xmlPlugins} = this.state;
        if(!xmlPlugins){
            return rows;
        }

        const {filterType, filterString} = this.props;

        return XMLUtils.XPathSelectNodes(xmlPlugins, "/plugins/*")
            .filter((xmlNode) => {
                return !filterType || xmlNode.getAttribute("id").indexOf(filterType) === 0
            })
            .filter((xmlNode) => {
                return !filterString
                    || xmlNode.getAttribute("id").toLowerCase().indexOf(filterString.toLowerCase()) !== -1
                    || xmlNode.getAttribute("label").toLowerCase().indexOf(filterString.toLowerCase()) !== -1
                    || xmlNode.getAttribute("description").toLowerCase().indexOf(filterString.toLowerCase()) !== -1;
            })
            .map(xmlNode => {
            return {
                id:xmlNode.getAttribute("id"),
                label:xmlNode.getAttribute("label"),
                description:xmlNode.getAttribute("description"),
                xmlNode: xmlNode,
            };
        }).sort(LangUtils.arraySorter('id'));
    },

    render(){

        const {displaySmall, pydio, accessByName} = this.props;
        const m = (id) => pydio.MessageHash['ajxp_admin.plugins.list.' + id] || id;
        const adminStyles=AdminComponents.AdminStyles();

        let columns;
        const renderEnabled = (row) => {
            const enableValue = row.xmlNode.getAttribute("enabled");
            return (
                <Toggle
                    toggled={row.xmlNode.getAttribute('enabled') !== 'false'}
                    onToggle={(e,v) => this.togglePluginEnable(row.xmlNode, v)}
                    onClick={(e)=> e.stopPropagation()}
                    disabled={enableValue === 'always' || enableValue === 'auto'  || !accessByName('Create')  || row.id === 'meta.layout_sendfile' || row.id === 'gui.mobile'}
                />
            );
        };
        const enabledSortValue = (row) => {
            const enableValue = row.xmlNode.getAttribute("enabled");
            const disabled = enableValue === 'always' || enableValue === 'auto'  || !accessByName('Create')  || row.id === 'meta.layout_sendfile'  || row.id === 'gui.mobile';
            if(disabled) {
                return -1;
            } else if (row.xmlNode.getAttribute('enabled') !== 'false'){
                return 1;
            } else {
                return 0;
            }
        };
        const renderEditButton = (row) => {
            if(!accessByName('Create')){
                return null;
            }
            if(XMLUtils.XPathSelectNodes(row.xmlNode, "server_settings/global_param").length){
                return (
                    <IconButton
                        iconStyle={{color: 'rgba(0,0,0,0.33)', fontSize:20}}
                        iconClassName="mdi mdi-pencil"
                        tooltip={m('action.edit')}
                        onClick={()=>this.openTableRows([row])}
                    />);
            } else {
                return <span/>;
            }
        };


        if(displaySmall) {
            columns = [
                {name:'enabled', label: m('column.enabled'), style:{width:80}, headerStyle:{width:80}, renderCell: renderEnabled},
                {name:'label', label: m('column.label'), style:{fontSize:15}},
                {name:'action', label: '', style:{width:80, textOverflow:'inherit'}, headerStyle:{width:80}, renderCell: renderEditButton}
            ];

        } else {
            columns = [
                {name:'enabled', label: m('column.enabled'), style:{width:80}, headerStyle:{width:80}, renderCell: renderEnabled, sorter:{type:'number', value:enabledSortValue}},
                {name:'label', label: m('column.label'), style:{width:'20%', fontSize:15}, headerStyle:{width:'20%'}, sorter:{type:'string'}},
                {name:'id', label: m('column.id'), style:{width:'15%'}, headerStyle:{width:'15%'}, hideSmall: true, sorter:{type:'string', default:true}},
                {name:'description', label: m('column.description'), hideSmall: true, sorter:{type:'string'}},
                {name:'action', label: '', style:{width:80, textOverflow:'inherit'}, headerStyle:{width:80}, renderCell: renderEditButton}
            ];
        }

        const data = this.computeTableData();

        return (
            <MaterialTable
                data={data}
                columns={columns}
                deselectOnClickAway={true}
                showCheckboxes={false}
                masterStyles={adminStyles.body.tableMaster}
                storageKey={'console.plugins.list'}
            />
        );

    }

});

export {PluginsList as default}
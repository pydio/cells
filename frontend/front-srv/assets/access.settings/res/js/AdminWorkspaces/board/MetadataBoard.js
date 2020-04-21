import React from 'react'
import Metadata from '../model/Metadata'
import {FlatButton, Paper, IconButton} from 'material-ui'
const {muiThemeable} = require('material-ui/styles');
import Pydio from 'pydio'
const {MaterialTable} = Pydio.requireLib('components');
import MetaNamespace from '../editor/MetaNamespace'
import {IdmUserMetaNamespace, ServiceResourcePolicy} from 'pydio/http/rest-api'


class MetadataBoard extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            loading: false,
            namespaces: [],
            m : (id) => props.pydio.MessageHash['ajxp_admin.metadata.' + id]
        };
    }

    componentWillMount(){
        this.load();
    }

    load(){
        this.setState({loading: true});
        Metadata.loadNamespaces().then(result => {
            this.setState({loading: false, namespaces: result.Namespaces || []});
        })
    }

    emptyNs(){
        let ns = new IdmUserMetaNamespace();
        ns.Policies = [
            ServiceResourcePolicy.constructFromObject({Action:'READ', Subject:'*', Effect:'allow'}),
            ServiceResourcePolicy.constructFromObject({Action:'WRITE', Subject:'*', Effect:'allow'})
        ];
        ns.JsonDefinition = JSON.stringify({type:'string'});
        return ns;
    }

    create(){
        this.setState({
            create: true,
            dialogOpen: true,
            selectedNamespace: this.emptyNs(),
        });
    };

    deleteNs(row){
        const {pydio} = this.props;
        const {m} = this.state;
        pydio.UI.openConfirmDialog({
            message:m('delete.confirm'),
            destructive:[row.Namespace],
            validCallback:() => {
                Metadata.deleteNS(row).then(() => {
                    this.load();
                });
            }
        });
    }

    open(rows){
        if(rows.length){
            this.setState({
                create: false,
                dialogOpen: true,
                selectedNamespace: rows[0],
            });
        }
    }

    close(){
        this.setState({dialogOpen: false, selectedNamespace: null});
    }

    render(){
        const {muiTheme} = this.props;
        const adminStyle = AdminComponents.AdminStyles(muiTheme.palette);

        let {namespaces, loading, dialogOpen, selectedNamespace, create, m} = this.state;
        if(!selectedNamespace){
            selectedNamespace = this.emptyNs();
        }
        namespaces.sort((a,b) => {
            const a0 = a.Order || 0;
            const b0 = b.Order || 0;
            if (a0 === b0) return 0;
            return a0 > b0 ? 1 : -1;
        });
        const {currentNode, pydio, accessByName} = this.props;
        const columns = [
            {name:'Order', label:m('order'), style:{width: 30}, headerStyle:{width:30}, hideSmall:true, renderCell:row => {
                return row.Order || '0';
            }, sorter:{type:'number'}},
            {name:'Namespace', label:m('namespace'), style:{fontSize: 15}, sorter:{type:'string'}},
            {name:'Label', label:m('label'), style:{width:'25%'}, headerStyle:{width:'25%'}, sorter:{type:'string'}},
            {name:'Indexable', label:m('indexable'), style:{width:'10%'}, headerStyle:{width:'10%'}, hideSmall:true, renderCell:(row => {
                return row.Indexable ? 'Yes' : 'No';
            }), sorter:{type:'number', value:(row)=>row.Indexable?1:0}},
            {name:'JsonDefinition', label:m('definition'), hideSmall:true, renderCell:(row => {
                const def = row.JsonDefinition;
                if(!def) {
                    return '';
                }
                const data = JSON.parse(def);
                return Metadata.MetaTypes[data.type] || data.type;
            }), sorter:{type:'string'}}
        ];
        const title = currentNode.getLabel();
        const icon = currentNode.getMetadata().get('icon_class');
        let buttons = [];
        const actions = [];
        if(accessByName('Create')){
            buttons.push(<FlatButton primary={true} label={m('namespace.add')} onTouchTap={()=>{this.create()}} {...adminStyle.props.header.flatButton}/>);
            actions.push({
                iconClassName:'mdi mdi-pencil',
                onTouchTap:(row)=>{this.open([row])},
            },{
                iconClassName:'mdi mdi-delete',
                onTouchTap:(row)=>{this.deleteNs(row)}
            })
        }

        return (

            <div className="main-layout-nav-to-stack workspaces-board">
                <MetaNamespace
                    pydio={pydio}
                    open={dialogOpen}
                    create={create}
                    namespace={selectedNamespace}
                    onRequestClose={() => this.close()}
                    reloadList={() => this.load()}
                    namespaces={namespaces}
                    readonly={!accessByName('Create')}
                />
                <div className="vertical-layout" style={{width:'100%'}}>
                    <AdminComponents.Header
                        title={title}
                        icon={icon}
                        actions={buttons}
                        reloadAction={this.load.bind(this)}
                        loading={loading}
                    />
                    <div className="layout-fill">
                        <AdminComponents.SubHeader title={m('namespaces')} legend={m('namespaces.legend')}/>
                        <Paper {...adminStyle.body.block.props}>
                            <MaterialTable
                                data={namespaces}
                                columns={columns}
                                actions={actions}
                                onSelectRows={this.open.bind(this)}
                                deselectOnClickAway={true}
                                showCheckboxes={false}
                                emptyStateString={m('empty')}
                                masterStyles={adminStyle.body.tableMaster}
                            />
                        </Paper>
                    </div>

                </div>
            </div>

        );
    }

}

MetadataBoard = muiThemeable()(MetadataBoard);

export {MetadataBoard as default}
import React from 'react'
import Metadata from '../model/Metadata'
import {FlatButton, Paper, IconButton} from 'material-ui'
const {muiThemeable} = require('material-ui/styles');
import Pydio from 'pydio'
const {MaterialTable} = Pydio.requireLib('components');
import MetaNamespace, {getGroupValue} from '../editor/MetaNamespace'
import {IdmUserMetaNamespace, ServiceResourcePolicy} from 'cells-sdk'


class MetadataBoard extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            loading: false,
            namespaces: [],
            m : (id) => props.pydio.MessageHash['ajxp_admin.metadata.' + id] || id
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
        ns.Indexable = true;
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
        const {muiTheme, currentNode, pydio, accessByName, policiesBuilder} = this.props;
        const adminStyle = AdminComponents.AdminStyles(muiTheme.palette);
        let {namespaces, loading, dialogOpen, selectedNamespace, create, m} = this.state;
        if(!selectedNamespace){
            selectedNamespace = this.emptyNs();
        }

        const knownGroups = [... new Set(namespaces.map(n => getGroupValue(n)).filter(g => g))];

        namespaces.sort((a,b) => {
            const a0 = a.Order || 0;
            const b0 = b.Order || 0;
            const orderSort = (oA, oB) => {
                if (oA === oB) {
                    return 0;
                }
                return oA > oB ? 1 : -1;
            }
            return orderSort(a0, b0)
        });

        let columns = [
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

        const groupedNS = {}
        if(knownGroups.length) {
            namespaces.map(ns => {
                const g = getGroupValue(ns)
                if(!groupedNS[g]) {
                    groupedNS[g] = []
                }
                groupedNS[g].push(ns)
            })
        } else {
            groupedNS[''] = namespaces
        }

        const title = currentNode.getLabel();
        const icon = currentNode.getMetadata().get('icon_class');
        let buttons = [];
        const actions = [];
        if(accessByName('Create')){
            buttons.push(<FlatButton primary={true} label={m('namespace.add')} onClick={()=>{this.create()}} {...adminStyle.props.header.flatButton}/>);
            actions.push({
                iconClassName:'mdi mdi-pencil',
                onClick:(row)=>{this.open([row])},
            },{
                iconClassName:'mdi mdi-delete',
                onClick:(row)=>{this.deleteNs(row)}
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
                    policiesBuilder={policiesBuilder}
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
                            {Object.keys(groupedNS).sort().map(k => {
                                return (
                                    <React.Fragment>
                                    {k && <div style={{padding: 20, fontWeight: 500, paddingBottom: 0}}>{'['+m('group')+'] ' + k}</div>}
                                    {!k && knownGroups.length > 0 && <div style={{padding: 20, fontWeight: 500, paddingBottom: 0}}>{m('default-group')}</div>}
                                    <Paper {...adminStyle.body.block.props}>
                                        <MaterialTable
                                            data={groupedNS[k]}
                                            columns={columns}
                                            actions={actions}
                                            onSelectRows={this.open.bind(this)}
                                            deselectOnClickAway={true}
                                            showCheckboxes={false}
                                            emptyStateString={m('empty')}
                                            masterStyles={adminStyle.body.tableMaster}
                                            storageKey={'console.metadata.list'}
                                        />
                                    </Paper>
                                    </React.Fragment>
                                )
                            })}
                    </div>

                </div>
            </div>

        );
    }

}

MetadataBoard = muiThemeable()(MetadataBoard);

export {MetadataBoard as default}
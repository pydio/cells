import React from 'react'
import Metadata from '../model/Metadata'
import {FlatButton, Paper, IconButton} from 'material-ui'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
const {MaterialTable} = Pydio.requireLib('components');
import MetaNamespace from '../editor/MetaNamespace'
import {IdmUserMetaNamespace, ServiceResourcePolicy} from 'pydio/http/rest-api'


class MetadataBoard extends React.Component{

    constructor(props){
        super(props);
        this.state = {loading: false, namespaces: []};
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
        if(confirm('Are you sure you want to delete this metadata?')) {
            Metadata.deleteNS(row).then(() => {
                this.load();
            });
        }
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
        let {namespaces, loading, dialogOpen, selectedNamespace, create} = this.state;
        if(!selectedNamespace){
            selectedNamespace = this.emptyNs();
        }
        namespaces.sort((a,b) => {
            if (a.Order === b.Order) return 0;
            return a.Order > b.Order ? 1 : -1;
        });
        const {currentNode, pydio} = this.props;
        const columns = [
            {name:'Order', label:'Order', style:{width: 30}, headerStyle:{width:30}},
            {name:'Namespace', label:'Name', style:{fontSize: 15}},
            {name:'Label', label:'Label', style:{width:'25%'}, headerStyle:{width:'25%'}},
            {name:'Indexable', label:'Indexation', style:{width:'25%'}, headerStyle:{width:'25%'}, renderCell:(row => {
                return row.Indexable ? 'Yes' : 'No';
            })},
            {name:'JsonDefinition', label:'Definition', renderCell:(row => {
                const def = row.JsonDefinition;
                if(!def) {
                    return '';
                }
                const data = JSON.parse(def);
                return Metadata.MetaTypes[data.type] || data.type;
            })},
            {name:'actions', label: '', style:{width:100}, headerStyle:{width:100}, renderCell:(row =>{
                return <IconButton
                    iconClassName="mdi mdi-delete"
                    onTouchTap={() => {this.deleteNs(row)}}
                    onClick={(e)=>{e.stopPropagation()}}
                    iconStyle={{color: 'rgba(0,0,0,0.3)',fontSize: 20}}
                />

            })}
        ];
        const title = currentNode.getLabel();
        const icon = currentNode.getMetadata().get('icon_class');
        const buttons = [
            <FlatButton primary={true} label={"+ Namespace"} onTouchTap={()=>{this.create()}}/>,
        ];

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
                        <AdminComponents.SubHeader title="Namespaces" legend="Metadata can be attached to any files or folders by the users. You can define here the kind of metadata you want to display, and whether each meta is readable/writeable by standard users as opposed to admin users."/>
                        <Paper zDepth={1} style={{margin: 16}}>
                            <MaterialTable
                                data={namespaces}
                                columns={columns}
                                onSelectRows={this.open.bind(this)}
                                deselectOnClickAway={true}
                                showCheckboxes={false}
                                emptyStateString={"No metadata defined"}
                            />
                        </Paper>
                    </div>

                </div>
            </div>

        );
    }

}


export {MetadataBoard as default}
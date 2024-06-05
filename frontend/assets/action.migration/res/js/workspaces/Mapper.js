import React from 'react'
import ReactDOM from 'react-dom'
import Pydio from 'pydio'
import Ws2Datasources from './Ws2Datasources'
import {Card, CardText, CardHeader, CardActions, FontIcon, FlatButton, IconMenu, MenuItem, Divider, LinearProgress, RaisedButton, Dialog, Paper, Checkbox} from 'material-ui'
import Loader from "./Loader";
import Ws2TemplatePaths from "./Ws2TemplatePaths";
import Ws2RootNodes from "./Ws2RootNodes";
import Pydio8Workspaces from "./Pydio8Workspaces";
import {ObjectDataSource} from 'cells-sdk';
import LangUtils from 'pydio/util/lang'
import PathTree from './PathTree'
import Connect from './Connect'

const styles = {
    button: {
        margin: "0 10px 0"
    },
    addButton: {
        animation: "joyride-beacon-outer 1.2s infinite ease-in-out",
        color: "rgba(255, 215, 0, 1)",
        boxShadow: "1px",
        marginTop: -3
    },
    connect: {
        marginLeft: -9,
        marginRight: -5,
        zIndex: 2,
        marginTop: 30
    }
};

export default class WorkspaceMapper extends React.Component{
    constructor(props){
        super(props);
        const {workspaces, cellsWorkspaces} = props;
        // remove ones already mapped
        const filtered = workspaces.filter((workspace) => {
            return cellsWorkspaces.filter(cW => cW.UUID === workspace.id).length === 0
        });
        const mappedWorkspaces = workspaces.filter((workspace) => {
            return cellsWorkspaces.filter(cW => cW.UUID === workspace.id).length > 0
        });
        const correspondingWorkspaces = cellsWorkspaces.filter((ws) => {
            return workspaces.filter(w => w.id === ws.UUID).length > 0
        });
        this.state = {
            cellsWorkspaces: [...correspondingWorkspaces],
            workspaces: filtered,
            mappedWorkspaces: mappedWorkspaces,
            showDatasources: true,
            showTemplatePaths: true,
            datasources: [],
            templatePaths:[],
            offset: 0,
            limit: 10,
        };
        this.loader = new Loader();
    }

    T(id){
        const {pydio} = this.props;
        return pydio.MessageHash['migration.step.mapper.' + id] || pydio.MessageHash['migration.' + id] || id;
    }

    componentDidMount(){
        this.loadDatasources();
        this.loadTemplatePaths();
    }

    loadDatasources(){
        this.loader.loadDataSources().then(datasources => {
            this.setState({datasources});
        });
    }

    loadTemplatePaths(){
        this.loader.loadTemplatePaths().then(templatePaths => {
            this.setState({templatePaths: [null, ...templatePaths]});
        })
    }

    toggleRemap(check, cellsWorkspace){
        const {workspaces, mappedWorkspaces} = this.state;
        const propsWorkspaces = this.props.workspaces;

        let newWs, newMapped;
        const workspace = propsWorkspaces.filter(ws => ws.id === cellsWorkspace.UUID)[0];
        if (check) {
            newWs = workspaces.filter(ws => ws.id !== cellsWorkspace.UUID);
            newMapped = [...mappedWorkspaces, workspace];
        } else {
            newWs = [...workspaces, workspace];
            newMapped = mappedWorkspaces.filter(ws => ws.id !== cellsWorkspace.UUID)
        }
        this.setState({workspaces: newWs, mappedWorkspaces: newMapped});
    }

    get mapping(){
        const {mapping, datasources, templatePaths, workspaces} = this.state;

        if (mapping) {
            return mapping
        }

        const tree = new PathTree(workspaces.map((workspace) => Pydio8Workspaces.extractPath(workspace)), '/');

        // First we start the mapping by loading the workspaces
        let initialMapping = workspaces.map((workspace) => ({workspace: workspace}));

        // First we map the datasources
        initialMapping = initialMapping.map((map, idx) => {
            const root = tree.getNewRoots(root => root.ws === idx)[0];

            const {parentDs} = root;

            // let datasourcePath;

            // // Check if we have a perfect match for a datasource
            // const cellsDataPath = // TODO need to get this path from the loaded datasources
            // let datasource = datasources.filter((ds) => trimURL(template.replace(/AJXP_DATA_PATH/g, cellsDataPath)) === trimURL(Ws2Datasources.extractPath(ds)))[0]

            // if (!datasource) {
            //     // Check if we have a parent match for a datasource
            //     datasource = datasources.filter((ds) => trimURL(parentDs.replace(/AJXP_DATA_PATH/g, cellsDataPath)) === trimURL(Ws2Datasources.extractPath(ds)))[0]
            //     datasourcePath = parentDs
            // } else {
            //     datasourcePath = template
            // }

            return {
                ...map,
                datasourcePath: parentDs,
                datasource: {}
            }
        });

        // Then we map the potential template paths
        initialMapping = initialMapping.map((map, idx) => {
            const {datasource} = map;

            const root = tree.getNewRoots(root => root.template && root.ws === idx)[0]

            const {parentDs, template} = root;

            let value = "Path = DataSources." + datasource.Name + " + \"" + template.substring(parentDs.length) + "\";";
            // Special case for AJXP_USER
            value = value.replace(/AJXP_USER/g, "\" + User.Name + \"");
            // Stripping value at the end
            value = value.replace(/ \+ "";$/, ";");

            // Trying to find if an existing template already is there
            const templatePath = templatePaths.filter(tp => tp && removeComments(tp.MetaStore.resolution) === value)[0];

            return {
                ...map,
                templatePath: templatePath || null,
                rootNodePath: template.substring(parentDs.length)
            }
        });

        return initialMapping
    }

    get linkWorkspacesToDatasources() {
        const {datasources, highlight, selected, workspaces, offset, limit} = this.state;
        const mapping = this.mapping;
        const count = Math.min(workspaces.length - offset, limit);
        const wss = workspaces.slice(offset, offset+count);

        return this.getLinks(wss, datasources, (ws, ds) => {
            return mapping.filter(({workspace, datasource}) => workspace == ws && datasource == ds)[0]
        }, (entry) => {
            return entry.workspace === selected ? "#7C0A02" : (entry.workspace === highlight ? "#000000" : "#cccccc")
        })
    }

    get linkWorkspacesToTemplatePaths() {
        const {templatePaths, highlight, selected, workspaces, offset, limit} = this.state;
        const mapping = this.mapping;
        const count = Math.min(workspaces.length - offset, limit);
        const wss = workspaces.slice(offset, offset+count);

        return this.getLinks(wss, templatePaths, (ws, tp) => {
            return mapping.filter(({workspace, templatePath, datasource}) => workspace == ws && templatePath == tp && datasource && datasource.Name)[0]
        }, (entry) => {
            return entry.workspace === selected ? "#7C0A02" : (entry.workspace === highlight ? "#000000" : "#cccccc")
        })
    }

    get linkDatasourcesToTemplatePaths() {
        const {datasources, templatePaths, highlight, selected} = this.state;
        const mapping = this.mapping;

        return this.getLinks(datasources, templatePaths, (ds, tp) => {
            return mapping.filter(({datasource}) => datasource == ds).filter(({templatePath}) => templatePath == tp)[0]
        }, (entry) => {
            return entry.workspace === selected ? "#7C0A02" : (entry.workspace === highlight ? "#000000" : "#cccccc")
        })
    }

    get linkDatasourcesToWorkspaces() {
        const {datasources, highlight, selected, workspaces, offset, limit} = this.state;
        const mapping = this.mapping;
        const count = Math.min(workspaces.length - offset, limit);
        const wss = workspaces.slice(offset, offset+count);


        return this.getLinks(datasources, wss, (ds, ws) => {
            return mapping.filter(({workspace, datasource}) => workspace == ws && datasource == ds)[0]
        }, (entry) => {
            return entry.workspace === selected ? "#7C0A02" : (entry.workspace === highlight ? "#000000" : "#cccccc")
        })
    }

    get linkTemplatePathsToWorkspaces() {
        const {templatePaths, highlight, selected, workspaces, offset, limit} = this.state;
        const mapping = this.mapping;
        const count = Math.min(workspaces.length - offset, limit);
        const wss = workspaces.slice(offset, offset+count);

        return this.getLinks(templatePaths, wss, (tp, ws) => {
            return mapping.filter(({templatePath}) => templatePath == tp).filter(({workspace}) => workspace == ws).filter(({datasource}) => datasource.Name)[0]
        }, (entry) => {
            return entry.workspace === selected ? "#7C0A02" : (entry.workspace === highlight ? "#000000" : "#cccccc")
        })
    }

    get linkWorkspacesToWorkspaces() {
        const {datasources, highlight, selected, workspaces, offset, limit} = this.state;
        const mapping = this.mapping;
        const count = Math.min(workspaces.length - offset, limit);
        const wss = workspaces.slice(offset, offset+count);

        return this.getLinks(wss, wss, (ws1, ws2) => {
            return mapping.filter(({workspace}) => workspace == ws1 && workspace == ws2)[0]
        }, (entry) => {
            return entry.workspace === selected ? "#7C0A02" : (entry.workspace === highlight ? "#000000" : "#cccccc")
        })
    }

    getLinks(arr1, arr2, comp, color) {
        return arr1.reduce((res1, v1, idx1) => [
            ...res1,
            ...arr2.reduce((res2, v2, idx2) => {
                const entry = comp(v1, v2)
                if (!entry) {
                    return res2
                }

                return [
                    ...res2, {
                        left: idx1,
                        right: idx2,
                        color: color(entry),
                    }
                ]
            }, [])
        ], [])
    }

    handleSelectWorkspace(ws) {
        this.setState({
            selected: ws
        })
    }

    handleSelectDatasource(ds) {
        const {selected} = this.state;
        const mapping = this.mapping;

        const newMapping = mapping.map((map) => {
            if (map.workspace === selected) {
                delete map.datasource;
                delete map.templatePath;

                return {
                    ...map,
                    datasource: ds
                }
            }

            return map
        })

        this.setState({
            mapping: newMapping
        })
    }

    handleSelectTemplatePath(tp) {
        const {datasources, selected} = this.state;
        const mapping = this.mapping;

        // Retrieve datasource
        const datasourceName = getDatasource(removeComments(tp.MetaStore.resolution))

        const ds = datasources.filter((ds) => ds.Name === datasourceName)[0];

        const newMapping = mapping.map((map) => {
            if (map.workspace === selected) {
                delete map.datasource;
                delete map.templatePath;

                return {
                    ...map,
                    datasource: ds,
                    templatePath: tp
                }
            }

            return map
        })

        this.setState({
            mapping: newMapping,
            selected: null
        })
    }

    handleSelectRootNode(ws, node) {
        const mapping = this.mapping;

        const newMapping = mapping.map((map) => {
            if (map.workspace === ws) {
                return {
                    ...map,
                    rootNode: node,
                    valid: true
                }
            }
            return map
        });

        this.setState({
            mapping: newMapping
        })
    }

    handleInvalidRootNode(ws) {
        const mapping = this.mapping;

        const newMapping = mapping.map((map) => {
            if (map.workspace === ws) {
                return {
                    ...map,
                    valid: false
                }
            }
            return map
        });

        this.setState({
            mapping: newMapping
        })
    }

    handleShowPath(ws) {
        this.setState({
            highlight: ws
        })
    }

    handleHidePath() {
        const state = this.state;
        delete state.highlight;
        this.setState(state)
    }

    handleShowDatasources() {
        this.setState({
            showDatasources: true,
        })
    }

    handleHideDatasources() {
        this.setState({
            showDatasources: false,
        })
    }

    handleShowTemplatePaths() {
        this.setState({
            showTemplatePaths: true,
        })
    }

    handleHideTemplatePaths() {
        this.setState({
            showTemplatePaths: false,
        })
    }

    handleCreateDatasource() {
        const {selected} = this.state;
        const {pydio, openRightPane, closeRightPane} = this.props;

        const {display, accessType, parameters} = selected;

        let presetDataSource;

        if (accessType === 's3'){
            presetDataSource = new ObjectDataSource();
            presetDataSource.Name = LangUtils.computeStringSlug(display).replace(/-/g, "");
            presetDataSource.StorageType = 'S3';
            presetDataSource.ApiKey = parameters['API_KEY'];
            presetDataSource.ApiSecret = parameters['SECRET_KEY'];
            presetDataSource.ObjectsBucket = parameters['CONTAINER'];
            presetDataSource.StorageConfiguration = {};
            if(parameters['STORAGE_URL']){
                presetDataSource.StorageConfiguration={customEndpoint:parameters['STORAGE_URL']};
            }
            if(parameters['PATH']){
                presetDataSource.ObjectsBaseFolder = parameters['PATH'];
            }
        } else if (accessType === 'fs') {
            presetDataSource = new ObjectDataSource();

            let path = parameters['PATH'] || "";

            if (selected) {
                path = this.mapping.filter(({workspace}) => workspace === selected)[0].datasourcePath
            }

            presetDataSource.Name = LangUtils.computeStringSlug(path.substr(1)).replace(/-/g, "");
            presetDataSource.StorageConfiguration = {};
            presetDataSource.StorageConfiguration.folder = path;
        }
        openRightPane({
            COMPONENT: AdminWorkspaces.DataSourceEditor,
            PROPS:{
                ref:"editor",
                pydio:pydio,
                create:true,
                dataSource: presetDataSource,
                storageTypes: [],
                closeEditor:() => {closeRightPane()},
                reloadList:() => {this.loadDatasources()},
            }
        });
    }

    handleCreateTemplatePath() {
        const containerEl = ReactDOM.findDOMNode(this.container);
        const el = ReactDOM.findDOMNode(this.templatePaths);

        const containerPosition = containerEl.getBoundingClientRect();
        const position = el.getBoundingClientRect();

        const {selected} = this.state;

        const selection = this.mapping.filter(({workspace}) => selected === workspace)[0];

        const {TemplatePathEditor, TemplatePath} = AdminWorkspaces;
        const newTpl = new TemplatePath();

        let path = " + \"" + selection.rootNodePath + "\";";
        // Special case for AJXP_USER
        path = path.replace(/AJXP_USER/g, "\" + User.Name + \"");
        // Stripping value at the end
        path = path.replace(/ \+ "";$/, ";");

        newTpl.setName(selected.slug);
        newTpl.setValue("Path = DataSources." + selection.datasource.Name + path);

        this.setState({
            dialogComponent: (
                <TemplatePathEditor
                    dataSources={this.state.datasources}
                    node={newTpl}
                    oneLiner={true}
                    onSave={() => {
                        this.loadTemplatePaths()
                        this.setState({dialogComponent: null})
                    }}
                    onClose={() => this.setState({dialogComponent: null})} />
            ),
            dialogStyle: {
                position:'absolute',
                zIndex:2,
                background: 'white',
                top: position.y - containerPosition.y + position.height,
                left: position.x + containerEl.scrollLeft - containerPosition.x,
                width: position.w,
                height: 48
            }
        });
    }

    handleNext() {
        const {onMapped} = this.props;
        const {mappedWorkspaces} = this.state;
        const mapping = this.mapping;
        let ret = {mapping:{}, create:{}, existing:{}};

        mappedWorkspaces.forEach(ws => {
            ret.mapping[ws.id] = ws.id;
            ret.existing[ws.id] = ws;
        });

        mapping.filter(({rootNode}) => rootNode).map(({workspace, rootNode}) => {
            const ws = new AdminWorkspaces.Workspace();
            const model = ws.getModel();
            // Map old properties to new object
            model.UUID = workspace.id;
            model.Label = workspace.display;
            model.Description = workspace.display;
            model.Slug = workspace.slug;
            model.Attributes['DEFAULT_RIGHTS'] = '';
            if(workspace.parameters['DEFAULT_RIGHTS']){
                //this should be handled via roles ACLs instead
                //model.Attributes['DEFAULT_RIGHTS'] = workspace.parameters['DEFAULT_RIGHTS'];
            }
            if(workspace.features && workspace.features['meta.syncable'] && workspace.features['meta.syncable']['REPO_SYNCABLE'] === 'true'){
                model.Attributes['ALLOW_SYNC'] = "true";
            }

            model.RootNodes = {};// Nodes must be indexed by Uuid, not Path
            Object.keys(rootNode).forEach(rootKey => {
                const root = rootNode[rootKey];
                model.RootNodes[root.Uuid] = root;
            });

            // ws.save();

            ret.mapping[workspace.id] = model.UUID;
            ret.create[workspace.id] = ws;
        });

        onMapped(ret)
    }

    isInvalid(ws) {
        return this.mapping.filter(({workspace, valid}) => workspace === ws && valid === false).length > 0
    }

    isValid(ws) {
        return this.mapping.filter(({workspace, valid}) => workspace === ws && valid === true).length > 0
    }

    isDatasourceSelectable(ds) {
        const {selected} = this.state;

        return selected && selected.accessType === (typeof ds.StorageType === 'string' && ds.StorageType.toLowerCase() || "fs")
    }

    isDatasourceHighlighted(ds) {
        const {highlight} = this.state;

        return this.mapping.filter(({workspace, datasource}) => highlight === workspace && datasource === ds).length > 0
    }

    isTemplatePathSelectable(tp) {
        const {selected} = this.state;

        return selected && tp
    }

    isTemplatePathHighlighted(tp) {
        const {highlight} = this.state;

        return this.mapping.filter(({workspace, datasource, templatePath}) => highlight === workspace && datasource && datasource.Name && templatePath === tp).length > 0
    }

    paginator() {
        const {workspaces, offset, limit} = this.state;
        if(workspaces.length <= limit) {
            return null
        }
        let next, prev;
        if(workspaces.length - offset > limit) {
            next = offset + limit;
        }
        if(offset > 0) {
            prev = offset - limit;
        }
        return (
            <div style={{display:'flex', justifyContent:'center', position: 'absolute', top: -13, left: 0, right: 0}}>
                <FlatButton primary={true} icon={<FontIcon className={"mdi mdi-chevron-left"}/>} label={this.T('next10') + limit} disabled={prev === undefined} onClick={()=>{this.setState({offset: prev})}}/>
                <FlatButton primary={true} icon={<FontIcon className={"mdi mdi-chevron-right"}/>} label={this.T('prev10') + limit} labelPosition={"before"} disabled={next === undefined} onClick={()=>{this.setState({offset: next})}}/>
            </div>
        );
    }

    render() {
        let {loading, error, progress, onBack} = this.props;
        const {selected, workspaces, datasources, templatePaths, dialogComponent, dialogStyle, mappedWorkspaces, cellsWorkspaces, offset, limit} = this.state;

        const {showDatasources, showTemplatePaths} = this.state;

        const mapping = this.mapping;

        const paths = mapping.map(({workspace, datasource, templatePath, rootNodePath}) => {
            if (templatePath) {
                return templatePath.Path
            }

            if (datasource && datasource.Name) {
                return datasource.Name + rootNodePath
            }
        });

        const count = Math.min(workspaces.length - offset, limit);

        return (
            <div ref={(el) => this.container = el} style={{position:'relative', overflowX: 'scroll'}}>
                {cellsWorkspaces.length > 0 &&
                    <div style={{padding: 16}}>
                        {this.T('already')} :
                        {cellsWorkspaces.map((ws) => {
                            const label = ws.Label + " ("+ ws.UUID + ")";
                            const mapped = mappedWorkspaces.filter(w=> ws.UUID === w.id ).length;
                            return <Checkbox label={label} checked={mapped} onCheck={(e,v)=>{this.toggleRemap(v, ws)}}/>
                        })}
                    </div>
                }
                <div style={{padding: 16}}>
                    {!loading &&
                        <div>{this.T('wsnumber').replace('%s', workspaces.length)}</div>
                    }
                    {loading &&
                        <div>
                            {this.T('loading')}
                            {progress &&  <LinearProgress mode={"determinate"} max={progress.max} value={progress.value}/>}
                        </div>

                    }
                    {error &&
                        <div style={{color:'red'}}>{this.T('loading.error').replace('%s', error)}</div>
                    }
                </div>
                {dialogComponent && <Paper style={dialogStyle}>{dialogComponent}</Paper>}
                <div style={{display: "flex", marginLeft: 16, padding: 16, backgroundColor:'#fafafa', overflowX: 'scroll'}} onMouseLeave={() => this.handleHidePath()}>
                    <Divider/>

                    <Card>
                        <CardHeader
                            title={this.T('p8.title')}
                            openIcon={
                                <IconMenu iconButtonElement={<FontIcon className={"mdi mdi-dots-vertical"} />}>
                                    <MenuItem primaryText={this.T('p8.ds.show')} onClick={() => this.handleShowDatasources()} />
                                    <MenuItem primaryText={this.T('p8.tpl.show')} onClick={() => this.handleShowTemplatePaths()} />
                                </IconMenu>
                            }
                            closeIcon={
                                <IconMenu iconButtonElement={<FontIcon className={"mdi mdi-dots-vertical"} />}>
                                    <MenuItem primaryText={this.T('p8.ds.show')} onClick={() => this.handleShowDatasources()} />
                                    <MenuItem primaryText={this.T('p8.tpl.show')} onClick={() => this.handleShowTemplatePaths()} />
                                </IconMenu>
                            }
                            showExpandableButton={true}
                        />

                        <CardText style={{position:'relative', minWidth:400}}>
                            <Pydio8Workspaces
                                workspaces={workspaces.slice(offset, offset + count)}
                                selected={selected}
                                isValid={(ws) => this.isValid(ws)}
                                isInvalid={(ws) => this.isInvalid(ws)}
                                onHover={(ws) => this.handleShowPath(ws)}
                                onSelect={(ws) => this.handleSelectWorkspace(ws)}
                            />
                            {this.paginator()}
                        </CardText>
                    </Card>

                    {showDatasources &&
                        <Connect style={styles.connect} leftNumber={count} rightNumber={datasources.length} links={this.linkWorkspacesToDatasources}/>
                    }

                    {showDatasources &&
                        <Card>
                            <CardHeader
                                title={this.T('cells.title')}
                                closeIcon={<FontIcon className={"mdi mdi-eye-off"} onClick={() => this.handleHideDatasources()} />}
                                showExpandableButton={true}
                            />

                            <CardText>
                                <Ws2Datasources
                                    datasources={datasources}
                                    selectable={(ds) => this.isDatasourceSelectable(ds)}
                                    highlighted={(ds) => this.isDatasourceHighlighted(ds)}
                                    onSelect={(ds) => this.handleSelectDatasource(ds)}
                                />
                            </CardText>

                            <CardActions>
                                {selected && <RaisedButton
                                    label={this.T('createds')}
                                    style={styles.button}
                                    icon={<FontIcon className={"mdi mdi-plus-circle-outline"} style={styles.addButton} />}
                                    onClick={() => this.handleCreateDatasource()}
                                />}
                            </CardActions>
                        </Card>
                    }

                    {showTemplatePaths && (
                        showDatasources &&
                            <Connect style={styles.connect} leftNumber={datasources.length} rightNumber={templatePaths.length} links={this.linkDatasourcesToTemplatePaths}/> ||
                            <Connect style={styles.connect} leftNumber={count} rightNumber={templatePaths.length} links={this.linkWorkspacesToTemplatePaths}/>
                    )}

                    {showTemplatePaths &&
                        <Card style={{position: "relative"}}>
                            <CardHeader
                                title={this.T('tpath.title')}
                                closeIcon={<FontIcon className={"mdi mdi-eye-off"} onClick={() => this.handleHideTemplatePaths()} />}
                                showExpandableButton={true}
                            />

                            <CardText>
                                <Ws2TemplatePaths
                                    style={{flex: 1}}
                                    templatePaths={templatePaths}
                                    selectable={(tp) => this.isTemplatePathSelectable(tp)}
                                    highlighted={(tp) => this.isTemplatePathHighlighted(tp)}
                                    onSelect={(tp) => this.handleSelectTemplatePath(tp)}
                                />
                            </CardText>

                            <CardActions>
                                {selected && <RaisedButton
                                    label={this.T('tpath.create')}
                                    ref={(el) => this.templatePaths = el}
                                    style={styles.button}
                                    icon={<FontIcon className={"mdi mdi-plus-circle-outline"} style={styles.addButton} />}
                                    onClick={() => this.handleCreateTemplatePath()}
                                />}
                            </CardActions>
                        </Card>
                    }

                    {showTemplatePaths && <Connect style={styles.connect} leftNumber={templatePaths.length} rightNumber={count} links={this.linkTemplatePathsToWorkspaces}/>}
                    {!showTemplatePaths && showDatasources && <Connect style={styles.connect} leftNumber={datasources.length} rightNumber={count} links={this.linkDatasourcesToWorkspaces}/>}
                    {!showTemplatePaths && !showDatasources && <Connect style={styles.connect} leftNumber={count} rightNumber={count} links={this.linkWorkspacesToWorkspaces}/>}

                    <Card style={{marginRight: 16}}>
                        <CardHeader
                            title={this.T('nodes.title')}
                        />

                        <CardText>
                            <Ws2RootNodes
                                pydio={Pydio.getInstance()}
                                style={{flex: 1}}
                                workspaces={workspaces.slice(offset, offset + count)}
                                paths={paths.slice(offset, offset + count)}
                                onSelect={(ws, node) => this.handleSelectRootNode(ws, node)}
                                onError={(ws) => this.handleInvalidRootNode(ws)}
                            />
                        </CardText>
                    </Card>

                    <div style={{minWidth: 8}}/>
                </div>

                <div style={{padding: "20px 16px 2px"}}>
                    <RaisedButton label={this.T('back')} onClick={() => onBack()} />&nbsp;&nbsp;
                    <RaisedButton label={this.T('next')} primary={true} onClick={()=>{this.handleNext()}}/>
                </div>
            </div>
        );
    }
}

const removeComments = (str) => {
    return str.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "").replace(/(\r\n|\n|\r)/gm,"")
}

const getDatasource = (str) => {
    return str.replace(/^Path = DataSources\.([^ ]*) \+ .*$/, "$1")
}

const trimURL = (str) => {
    return str.replace(/^\//, "").replace(/\/$/, "");
}

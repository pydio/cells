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

    class Renderer{

        static getMetadataConfigs(){

            if(pydio && pydio.user && pydio.user.activeRepository && Renderer.__CACHE
                && Renderer.__CACHE.has(pydio.user.activeRepository)){
                return Renderer.__CACHE.get(pydio.user.activeRepository);
            }
            let configMap = new Map();
            try{
                let configs = JSON.parse(pydio.getPluginConfigs("meta.user").get("meta_definitions"));
                let arrConfigs = Object.entries(configs).map(entry => {
                    entry[1].ns = entry[0];
                    return entry[1];
                });
                arrConfigs.sort((a,b) => {
                    const orderA = a.order;
                    const orderB = b.order;
                    return orderA > orderB ? 1 : orderA === orderB ? 0 : -1;
                });
                arrConfigs.map((value) => {
                    const type = value.type;
                    if(type === 'choice' && value.data){
                        let values = new Map();
                        value.data.split(",").map(function(keyLabel){
                            const parts = keyLabel.split("|");
                            values.set(parts[0], parts[1]);
                        });
                        value.data = values;
                    }
                    configMap.set(value.ns, value);
                });
            }catch(e){
                //console.debug(e);
            }
            if(pydio && pydio.user && pydio.user.activeRepository){
                if(!Renderer.__CACHE) Renderer.__CACHE = new Map();
                Renderer.__CACHE.set(pydio.user.activeRepository, configMap);
            }
            return configMap;
        }

        static renderStars(node, column){
            return <MetaStarsRenderer node={node} column={column} size="small"/>;
        }

        static renderSelector(node, column){
            return <SelectorFilter node={node} column={column}/>;
        }

        static renderCSSLabel(node, column){
            return <CSSLabelsFilter node={node} column={column}/>;
        }

        static renderTagsCloud(node, column){
            return <span>{node.getMetadata().get(column.name)}</span>
        }

        static formPanelStars(props){
            return <StarsFormPanel {...props}/>;
        }

        static formPanelCssLabels(props){

            const menuItems = Object.keys(CSSLabelsFilter.CSS_LABELS).map(function(id){
                let label = CSSLabelsFilter.CSS_LABELS[id];
                //return {payload:id, text:label.label};
                return <MaterialUI.MenuItem value={id} primaryText={label.label}/>
            }.bind(this));

            return <MetaSelectorFormPanel {...props} menuItems={menuItems}/>;
        }

        static formPanelSelectorFilter(props){

            let configs = Renderer.getMetadataConfigs().get(props.fieldname);
            let menuItems = [];
            if(configs && configs.data){
                configs.data.forEach(function(value, key){
                    //menuItems.push({payload:key, text:value});
                    menuItems.push(<MaterialUI.MenuItem value={key} primaryText={value}/>);
                });
            }

            return <MetaSelectorFormPanel {...props} menuItems={menuItems}/>;
        }

        static formPanelTags(props){
            let configs = Renderer.getMetadataConfigs().get(props.fieldname);
            return <TagsCloud {...props} editMode={true}/>;
        }

    }

    class Callbacks{

        static editMeta(){
            pydio.UI.openComponentInModal('ReactMeta', 'UserMetaDialog', {
                dialogTitleId: 489,
                selection: pydio.getUserSelection(),
            });
        }

    }

    let MetaFieldFormPanelMixin = {

        propTypes:{
            label:React.PropTypes.string,
            fieldname:React.PropTypes.string,
            onChange:React.PropTypes.func,
            onValueChange:React.PropTypes.func
        },

        updateValue:function(value, submit = true){
            this.setState({value:value});
            if(this.props.onChange){
                let object = {};
                object['ajxp_meta_' + this.props.fieldname] = value;
                this.props.onChange(object, submit);
            }else if(this.props.onValueChange){
                this.props.onValueChange(this.props.fieldname, value);
            }
        }

    };

    let MetaFieldRendererMixin = {

        propTypes:{
            node:React.PropTypes.instanceOf(AjxpNode),
            column:React.PropTypes.object
        },

        getRealValue: function(){
            return this.props.node.getMetadata().get(this.props.column.name);
        }

    };

    const starsStyle = { fontSize: 20, color: '#FBC02D' };

    let StarsFormPanel = React.createClass({

        mixins:[MetaFieldFormPanelMixin],

        getInitialState: function(){
            return {value: this.props.value || 0};
        },

        render: function(){
            let value = this.state.value;
            let stars = [-1,0,1,2,3,4].map(function(v){
                const ic = 'star' + (v === -1 ? '-off' : (value > v ? '' : '-outline') );
                const style = (v === -1 ? {marginRight: 5, cursor:'pointer'} : {cursor: 'pointer'});
                return <span key={"star-" + v} onClick={this.updateValue.bind(this, v+1)} className={"mdi mdi-" + ic} style={style}></span>;
            }.bind(this));
            return (
                <div className="advanced-search-stars" style={starsStyle}>
                    <div>{stars}</div>
                </div>
            );
        }

    });

    let MetaStarsRenderer = React.createClass({

        mixins:[MetaFieldRendererMixin],

        render: function(){
            let value = this.getRealValue() || 0;
            let stars = [0,1,2,3,4].map(function(v){
                return <span key={"star-" + v} className={"mdi mdi-star" + (value > v ? '' : '-outline')}></span>;
            });
            const style = this.props.size === 'small' ? {color: starsStyle.color} : starsStyle;
            return <span style={style}>{stars}</span>;
        }

    });

    let SelectorFilter = React.createClass({

        mixins:[MetaFieldRendererMixin],

        render: function(){
            let value;
            let displayValue = value = this.getRealValue();
            let configs = Renderer.getMetadataConfigs().get(this.props.column.name);
            if(configs && configs.data){
                displayValue = configs.data.get(value);
            }
            return <span>{displayValue}</span>;
        }

    });

    let CSSLabelsFilter = React.createClass({

        mixins:[MetaFieldRendererMixin],

        statics:{
            CSS_LABELS : {
                'low'       : {label:MessageHash['meta.user.4'], sortValue:'5', color: '#66c'},
                'todo'      : {label:MessageHash['meta.user.5'], sortValue:'4', color: '#69c'},
                'personal'  : {label:MessageHash['meta.user.6'], sortValue:'3', color: '#6c6'},
                'work'      : {label:MessageHash['meta.user.7'], sortValue:'2', color: '#c96'},
                'important' : {label:MessageHash['meta.user.8'], sortValue:'1', color: '#c66'}
            }
        },

        render: function(){
            let MessageHash = global.pydio.MessageHash;
            let value = this.getRealValue();
            const data = CSSLabelsFilter.CSS_LABELS;
            if(value && data[value]){
                let dV = data[value];
                return <span><span className="mdi mdi-label" style={{color: dV.color}} /> {dV.label}</span>
            }else{
                return <span>{value}</span>;
            }
        }

    });

    let MetaSelectorFormPanel = React.createClass({

        mixins:[MetaFieldFormPanelMixin],

        changeSelector: function(e, selectedIndex, payload){
            this.updateValue(payload);
        },

        getInitialState: function(){
            return {value: this.props.value};
        },

        render: function(){
            let index = 0, i = 1;
            this.props.menuItems.unshift(<MaterialUI.MenuItem value={''} primaryText=""/>);
            return (
                <div>
                    <MaterialUI.SelectField
                        style={{width:'100%'}}
                        value={this.state.value}
                        onChange={this.changeSelector}>{this.props.menuItems}</MaterialUI.SelectField>
                </div>
            );
        }

    });

    let TagsCloud = React.createClass({

        mixins: [MetaFieldFormPanelMixin],

        propTypes:{
            node:React.PropTypes.instanceOf(AjxpNode),
            column:React.PropTypes.object
        },
        componentDidMount: function() {
            this.getRealValue();
            if(this.props.editMode){
                this.load();
            }
        },

        componentWillReceiveProps: function (nextProps) {
            let {node, value, column} = nextProps;
            if(node && node !== this.props.node){
                this.setState({tags: node.getMetadata().get(column.name)});
            }else if(value){
                this.setState({tags: value});
            }
            if(nextProps.editMode && !this.state.loaded) {
                this.load();
            }
        },

        getRealValue: function(){
            let {node, value, column} = this.props;
            if (node != null) {
                this.setState({tags: node.getMetadata().get(column.name)});
            } else {
                this.setState({tags: value});
            }
        },

        getInitialState: function(){
            let {node, value} = this.props;
            return {
                loading     : false,
                dataSource  : [],
                tags        : (node ? node.getMetadata().get(this.props.column.name) : value),
                searchText  : ''
            };
        },

        suggestionLoader: function(callback) {
            this.setState({loading:this.state.loading + 1});
            PydioApi.getClient().request({get_action: 'meta_user_list_tags', namespace: this.props.fieldname || this.props.column.name}, (transport) => {
                this.setState({loading:this.state.loading - 1});
                if(transport.responseJSON && transport.responseJSON.length){
                    callback(transport.responseJSON);
                }
            });
        },

        load: function() {
            this.setState({loading: true});
            this.suggestionLoader(function(tags){
                let crtValueFound = false;
                const values = tags.map(function(tag){
                    let component = (<MaterialUI.MenuItem>{tag}</MaterialUI.MenuItem>);
                    return {
                        text        : tag,
                        value       : component
                    };
                }.bind(this));
                this.setState({dataSource: values, loading: false, loaded: true});
            }.bind(this));
        },

        handleRequestDelete: function(tag) {
            let tags = this.state.tags.split(',');
            let index = tags.indexOf(tag);
            tags.splice(index, 1);
            this.setState({
                tags: tags.toString()},
            () => {
                this.updateValue(this.state.tags);
            });
        },

        handleUpdateInput: function(searchText) {
            this.setState({searchText: searchText});
        },

        handleNewRequest: function() {
            let tags = [];
            if (this.state.tags) {
                tags = this.state.tags.split(',');
            }
            tags.push(this.state.searchText);
            this.setState({
                tags: tags.toString()},
            () => {
                this.updateValue(this.state.tags);
            });
            this.setState({
                searchText: '',
            });
        },

        renderChip: function(tag) {
            const chipStyle = {margin:2, backgroundColor:'#F5F5F5'};
            if (this.props.editMode) {
                return ( <MaterialUI.Chip key={tag} style={chipStyle} onRequestDelete={this.handleRequestDelete.bind(this, tag)}>{tag}</MaterialUI.Chip> );
            } else {
                return ( <MaterialUI.Chip key={tag} style={chipStyle}>{tag}</MaterialUI.Chip> );
            }
        },

        render: function(){
            let tags;
            if (this.state.tags) {
                tags = this.state.tags.split(",").map(function(tag){
                    tag = LangUtils.trim(tag, ' ');
                    if(!tag) return null;
                    return (this.renderChip(tag));
                }.bind(this));
            } else {
                tags = <div></div>
            }
            let autoCompleter;
            let textField;
            if (this.props.editMode) {
                autoCompleter = <MaterialUI.AutoComplete
                                    fullWidth={true}
                                    hintText={global.pydio.MessageHash['meta.user.10']}
                                    searchText={this.state.searchText}
                                    onUpdateInput={this.handleUpdateInput}
                                    onNewRequest={this.handleNewRequest}
                                    dataSource={this.state.dataSource}
                                    filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) === 0)}
                                    openOnFocus={true}
                                    menuProps={{maxHeight: 200}}
                                />
            } else {
                autoCompleter = <div></div>

            }

            return (
                <div>
                    <div style={{display: 'flex', flexWrap: 'wrap'}}>
                        {tags}
                    </div>
                    {autoCompleter}
                </div>
            );
        }

    });


    let UserMetaDialog = React.createClass({
        propsTypes: {
            selection: React.PropTypes.instanceOf(PydioDataModel),
        },

        mixins: [
            PydioReactUI.ActionDialogMixin,
            PydioReactUI.CancelButtonProviderMixin,
            PydioReactUI.SubmitButtonProviderMixin
        ],

        submit: function(){
            let values = this.refs.panel.getUpdateData();
            let params = {};
            values.forEach(function(v, k){
                params[k] = v;
            });
            PydioApi.getClient().postSelectionWithAction("edit_user_meta", function(t){
                PydioApi.getClient().parseXmlMessage(t.responseXML);
                this.dismiss();
            }.bind(this), this.props.selection, params);
        },
        render: function(){
            return (
                <UserMetaPanel
                    pydio={this.props.pydio}
                    multiple={!this.props.selection.isUnique()}
                    ref="panel"
                    node={this.props.selection.isUnique() ? this.props.selection.getUniqueNode() : new AjxpNode()}
                    editMode={true}
                />
            );
        }
    });

    let UserMetaPanel = React.createClass({

        propTypes:{
            editMode: React.PropTypes.bool
        },

        getDefaultProps: function(){
            return {editMode: false};
        },
        getInitialState: function(){
            return {
                updateMeta: new Map(),
                isChecked: false,
                fields: []
                };
        },
        updateValue: function(name, value){
            this.state.updateMeta.set(name, value);
            this.setState({
                updateMeta: this.state.updateMeta
            });
        },
        deleteValue: function(name) {
            this.state.updateMeta.delete(name);
            this.setState({
                updateMeta: this.state.updateMeta
            })
        },
        getUpdateData: function(){
            return this.state.updateMeta;
        },

        resetUpdateData: function(){
            this.setState({
                updateMeta: new Map()
            });
        },
        onCheck: function(e, isInputChecked, value){
            let state = this.state;
            state['fields'][e.target.value] = isInputChecked;
            if(isInputChecked == false){
                this.deleteValue(e.target.value);
            }
            this.setState(state);
        },
        render: function(){
            let configs = Renderer.getMetadataConfigs();
            let data = [];
            let node = this.props.node;
            let metadata = this.props.node.getMetadata();
            let updateMeta = this.state.updateMeta;
            let nonEmptyDataCount = 0;
            const isAdmin = pydio.user.isAdmin;

            configs.forEach(function(meta, key){
                let readonly = false, value;
                const {label, type, writeSubject, readSubject} = meta;
                if(readSubject === 'profile:admin' && !isAdmin) {
                    return;
                }
                if(writeSubject === 'profile:admin' && !isAdmin) {
                    readonly = true;
                }
                value = metadata.get(key);
                if(updateMeta.has(key)){
                    value = updateMeta.get(key);
                }
                let realValue = value;

                if(this.props.editMode && !readonly){
                    let field;
                    let baseProps = {
                        isChecked: this.state.isChecked,
                        fieldname: key,
                        label: label,
                        value: value,
                        onValueChange: this.updateValue
                    };
                    if(type === 'stars_rate'){
                        field = <StarsFormPanel {...baseProps}/>;
                    }else if(type === 'choice') {
                        field = Renderer.formPanelSelectorFilter(baseProps);
                    }else if(type === 'css_label'){
                        field = Renderer.formPanelCssLabels(baseProps);
                    }else if(type === 'tags'){
                        field = Renderer.formPanelTags(baseProps);
                    }else{
                        field = (
                            <MaterialUI.TextField
                                value={value}
                                fullWidth={true}
                                disabled={readonly}
                                onChange={(event, value)=>{this.updateValue(key, value);}}
                            />
                        );
                    }
                    if(this.props.multiple){
                        data.push(
                            <div className={"infoPanelRow"} key={key} style={{ marginBottom: 20}}>
                                <MaterialUI.Checkbox value={key} label={label} onCheck={this.onCheck.bind(value)}/>
                                {this.state['fields'][key] && <div className="infoPanelValue">{field}</div>}
                            </div>
                        );
                    }else{
                        data.push(
                            <div className={"infoPanelRow"} key={key}>
                                <div className="infoPanelLabel">{label}</div>
                                <div className="infoPanelValue">{field}</div>
                            </div>
                        );
                    }
                }else{
                    let column = {name:key};
                    if(type === 'stars_rate'){
                        value = <MetaStarsRenderer node={node} column={column}/>
                    }else if(type === 'css_label'){
                        value = <CSSLabelsFilter node={node} column={column}/>
                    }else if(type === 'choice'){
                        value = <SelectorFilter node={node} column={column}/>
                    }else if(type === 'tags'){
                        value = <TagsCloud node={node} column={column}/>
                    }
                    if(realValue) {
                        nonEmptyDataCount ++;
                    }
                    data.push(
                        <div className={"infoPanelRow" + (!realValue?' no-value':'')} key={key}>
                            <div className="infoPanelLabel">{label}</div>
                            <div className="infoPanelValue">{value}</div>
                        </div>
                    );
                }
            }.bind(this));
            const mess = this.props.pydio.MessageHash;
            if(!this.props.editMode && !nonEmptyDataCount){
                return <div><div style={{color: 'rgba(0,0,0,0.23)', paddingBottom:10}} onTouchTap={this.props.onRequestEditMode}>{mess['meta.user.11']}</div>{data}</div>
            }else{
                let legend;
                if(this.props.multiple){
                    legend = <div style={{paddingBottom: 16}}><em>{mess['meta.user.12']}</em> {mess['meta.user.13']}</div>
                }
                return (<div style={{width: '100%', overflowY: 'scroll'}}>{legend}{data}</div>);
            }
        }

    });

    let InfoPanel = React.createClass({

        propTypes: {
            node: React.PropTypes.instanceOf(AjxpNode)
        },

        getInitialState: function(){
            return {editMode: false};
        },

        openEditMode: function(){
            this.setState({editMode:true });
        },

        reset: function(){
            this.refs.panel.resetUpdateData();
            this.setState({editMode: false});
        },

        componentWillReceiveProps: function(newProps){
            if(newProps.node !== this.props.node && this.refs.panel){
                this.reset();
            }
        },

        saveChanges: function(){
            let values = this.refs.panel.getUpdateData();
            let params = {};
            values.forEach(function(v, k){
                params[k] = v;
            });
            PydioApi.getClient().postSelectionWithAction("edit_user_meta", function(t){
                PydioApi.getClient().parseXmlMessage(t.responseXML);
                this.reset();
            }.bind(this), null, params);
        },

        render: function(){
            let actions = [];
            const {MessageHash} = this.props.pydio;

            if(this.state.editMode){
                actions.push(
                    <MaterialUI.FlatButton
                        key="cancel"
                        label={MessageHash['54']}
                        onClick={()=>{this.reset()}}
                    />
                );
            }
            if(!this.props.node.getMetadata().has('node_readonly')){
                actions.push(
                    <MaterialUI.FlatButton
                        key="edit"
                        label={this.state.editMode?MessageHash['meta.user.15']:MessageHash['meta.user.14']}
                        onClick={()=>{!this.state.editMode?this.openEditMode():this.saveChanges()}}
                    />
                );
            }

            return (
                <PydioWorkspaces.InfoPanelCard identifier={"meta-user"} style={this.props.style} title={this.props.pydio.MessageHash['meta.user.1']} actions={actions.length ? actions : null} icon="tag-multiple" iconColor="#00ACC1">
                    <UserMetaPanel
                        ref="panel"
                        node={this.props.node}
                        editMode={this.state.editMode}
                        onRequestEditMode={this.openEditMode.bind(this)}
                        pydio={this.props.pydio}
                    />
                </PydioWorkspaces.InfoPanelCard>
            );
        }

    });

    let ns = global.ReactMeta || {};
    ns.Renderer = Renderer;
    ns.InfoPanel = InfoPanel;
    ns.Callbacks = Callbacks;
    ns.UserMetaDialog = UserMetaDialog;

    global.ReactMeta = ns;

})(window);

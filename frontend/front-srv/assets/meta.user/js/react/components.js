/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import MetaClient from './MetaClient'
import React from 'react'
import Color from 'color'
import {MenuItem, Chip, AutoComplete, TextField, Checkbox, FlatButton} from 'material-ui'
import Pydio from 'pydio'
const {ModernSelectField, ModernTextField, ModernStyles} = Pydio.requireLib('hoc');

const colorsCache = {};

function colorsFromString(s){
    if (s.length === 0) {
        return {};
    }
    if(colorsCache[s]){
        return colorsCache[s];
    }
    let hash = 0, i, chr, len;
    for (i = 0, len = s.length; i < len; i++) {
        chr   = s.charCodeAt(i) * 1000;
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    const hex = "00000".substring(0, 6 - c.length) + c;
    let color = new Color('#' + hex).hsl();
    const hue = color.hue();
    const bg = new Color({h: hue, s: color.saturationl(), l: 90});
    const fg = new Color({h: hue, s: color.saturationl(), l: 40});
    const result = {color: fg.string(), backgroundColor:bg.string()};
    colorsCache[s] = result;
    return result;
}

class Renderer{

    static getMetadataConfigs(){
        return Renderer.getClient().loadConfigs();
    }

    /**
     *
     * @return {MetaClient}
     */
    static getClient(){
        if(!Renderer.Client){
            Renderer.Client = new MetaClient();
        }
        return Renderer.Client;
    }

    static renderStars(node, column){
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <MetaStarsRenderer node={node} column={column} size="small"/>;
    }

    static renderSelector(node, column){
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <SelectorFilter node={node} column={column}/>;
    }

    static renderCSSLabel(node, column){
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        return <CSSLabelsFilter node={node} column={column}/>;
    }

    static renderTagsCloud(node, column){
        if(!node.getMetadata().get(column.name)){
            return null;
        }
        const tagStyle = {
            display:'inline-block',
            backgroundColor: '#E1BEE7',
            borderRadius: '3px 10px 10px 3px',
            height: 18,
            lineHeight: '18px',
            padding: '0 12px 0 6px',
            color: '#9C27B0',
            fontWeight: 500,
            fontSize: 12,
            marginRight: 6
        };
        const value = node.getMetadata().get(column.name);
        if(!value) return null;
        return <span>{value.split(',').map(tag => <span style={{...tagStyle, ...colorsFromString(tag)}}>{tag}</span>)}</span>
    }

    static formPanelStars(props){
        return <StarsFormPanel {...props}/>;
    }

    static formPanelCssLabels(props){

        const menuItems = Object.keys(CSSLabelsFilter.CSS_LABELS).map(function(id){
            let label = CSSLabelsFilter.CSS_LABELS[id];
            return <MenuItem value={id} primaryText={label.label}/>
        }.bind(this));

        return <MetaSelectorFormPanel {...props} menuItems={menuItems}/>;
    }

    static formPanelSelectorFilter(props){

        const itemsLoader = (callback) => {
            Renderer.getMetadataConfigs().then(metaConfigs => {
                let configs = metaConfigs.get(props.fieldname);
                let menuItems = [];
                if(configs && configs.data){
                    configs.data.forEach(function(value, key){
                        menuItems.push(<MenuItem value={key} primaryText={value}/>);
                    });
                }
                callback(menuItems);
            })
        };

        return <MetaSelectorFormPanel {...props} menuItems={[]} itemsLoader={itemsLoader}/>;
    }

    static formPanelTags(props){
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

    getInitialState(){
        return {configs: new Map()}
    },

    componentDidMount(){
        Renderer.getMetadataConfigs().then(c => {
            this.setState({configs: c});
        })
    },

    updateValue(value, submit = true){
        this.setState({value:value});
        if(this.props.onChange){
            let object = {};
            object['ajxp_meta_' + this.props.fieldname] = value;
            this.props.onChange(object, submit);
        }else if(this.props.onValueChange){
            this.props.onValueChange(this.props.fieldname, value, submit);
        }
    }

};

let MetaFieldRendererMixin = {

    propTypes:{
        node:React.PropTypes.instanceOf(AjxpNode),
        column:React.PropTypes.object
    },

    getInitialState(){
        return {
            value: this.props.value || 0,
            configs: new Map()
        };
    },

    componentDidMount(){
        Renderer.getMetadataConfigs().then(configs => {
            this.setState({configs: configs});
        })
    },

    getRealValue(){
        return this.props.node.getMetadata().get(this.props.column.name);
    }

};

const starsStyle = { fontSize: 20, color: '#FBC02D', marginTop:6, marginBottom: 6};

let StarsFormPanel = React.createClass({

    mixins:[MetaFieldFormPanelMixin],

    getInitialState(){
        return {value: this.props.value || 0};
    },

    render(){
        let value = this.state.value;
        let stars = [-1,0,1,2,3,4].map(function(v){
            const ic = 'star' + (v === -1 ? '-off' : (value > v ? '' : '-outline') );
            const style = (v === -1 ? {marginRight: 5, cursor:'pointer'} : {cursor: 'pointer'});
            return <span key={"star-" + v} onClick={() => this.updateValue(v+1, true)} className={"mdi mdi-" + ic} style={style}></span>;
        }.bind(this));
        return (
            <div className="advanced-search-stars" style={{...ModernStyles.div, ...starsStyle}}>
                <div>{stars}</div>
            </div>
        );
    }

});

let MetaStarsRenderer = React.createClass({

    mixins:[MetaFieldRendererMixin],

    render(){
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

    render(){
        const {configs} = this.state;
        let value;
        let displayValue = value = this.getRealValue();
        let fieldConfig = configs.get(this.props.column.name);
        if(fieldConfig && fieldConfig.data){
            displayValue = fieldConfig.data.get(value);
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

    render(){
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

    changeSelector(e, selectedIndex, payload){
        this.updateValue(payload, true);
    },

    componentDidMount(){
        if(this.props.itemsLoader){
            this.props.itemsLoader((items) => {
                this.setState({menuItems: items});
            })
        }
    },

    getInitialState(){
        return {value: this.props.value};
    },

    render(){
        let index = 0, i = 1;
        let menuItems;
        if(this.state.menuItems === undefined){
            menuItems = [...this.props.menuItems]
        } else {
            menuItems = [...this.state.menuItems]
        }
        menuItems.unshift(<MenuItem value={''} primaryText=""/>);
        return (
            <div>
                <ModernSelectField
                    style={{width:'100%'}}
                    value={this.state.value}
                    hintText={this.props.label}
                    onChange={this.changeSelector}>{menuItems}</ModernSelectField>
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
    componentDidMount() {
        this.getRealValue();
        if(this.props.editMode){
            this.load();
        }
    },

    componentWillReceiveProps(nextProps) {
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

    getRealValue(){
        let {node, value, column} = this.props;
        if (node == null) {
            this.setState({tags: value});
        } else {
            this.setState({tags: node.getMetadata().get(column.name)});
        }
    },

    getInitialState(){
        let {node, value} = this.props;
        return {
            loading     : false,
            dataSource  : [],
            tags        : (node ? node.getMetadata().get(this.props.column.name) : value),
            searchText  : ''
        };
    },

    suggestionLoader(callback) {
        this.setState({loading:this.state.loading + 1});

        Renderer.getClient().listTags(this.props.fieldname || this.props.column.name).then(tags => {
            this.setState({loading:this.state.loading - 1});
            callback(tags);
        });

    },

    load() {
        this.setState({loading: true});
        this.suggestionLoader(function(tags){
            let crtValueFound = false;
            const values = tags.map(function(tag){
                let component = (<MenuItem>{tag}</MenuItem>);
                return {
                    text        : tag,
                    value       : component
                };
            }.bind(this));
            this.setState({dataSource: values, loading: false, loaded: true});
        }.bind(this));
    },

    handleRequestDelete(tag) {
        let tags = this.state.tags.split(',');
        let index = tags.indexOf(tag);
        tags.splice(index, 1);
        this.setState({
            tags: tags.toString()},
        () => {
            this.updateValue(this.state.tags, true);
        });
    },

    handleUpdateInput(searchText) {
        this.setState({searchText: searchText});
    },

    handleNewRequest() {
        if (!this.state.searchText){
            return
        }
        let tags = [];
        if (this.state.tags) {
            tags = this.state.tags.split(',');
        }
        tags.push(this.state.searchText);
        this.setState({
            tags: tags.toString()},
        () => {
            this.updateValue(this.state.tags, true);
        });
        this.setState({
            searchText: '',
        });
    },

    renderChip(tag) {
        const {color, backgroundColor} = colorsFromString(tag);
        const chipStyle = {margin:2, borderRadius:'4px 16px 16px 4px'};
        const labelStyle = {color, fontWeight: 500, paddingLeft: 10, paddingRight: 16};
        if (this.props.editMode) {
            return ( <Chip key={tag} backgroundColor={backgroundColor} labelStyle={labelStyle} style={chipStyle} onRequestDelete={this.handleRequestDelete.bind(this, tag)}>{tag}</Chip> );
        } else {
            return ( <Chip key={tag} backgroundColor={backgroundColor} labelStyle={labelStyle} style={chipStyle}>{tag}</Chip> );
        }
    },

    render(){
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
        if (this.props.editMode) {
            autoCompleter = <AutoComplete
                fullWidth={true}
                hintText={pydio.MessageHash['meta.user.10']}
                searchText={this.state.searchText}
                onUpdateInput={this.handleUpdateInput}
                onNewRequest={this.handleNewRequest}
                dataSource={this.state.dataSource}
                filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) === 0)}
                openOnFocus={true}
                menuProps={{maxHeight: 200}}
                style={{marginBottom: -8}}
                onClose={() => {if(this.state.searchText) {
                    this.handleNewRequest()
                }}}
                {...ModernStyles.textField}
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

    saveMeta(){
        let values = this.refs.panel.getUpdateData();
        let params = {};
        values.forEach(function(v, k){
            params[k] = v;
        });
        return Renderer.getClient().saveMeta(this.props.selection.getSelectedNodes(), values);
    },

    submit(){
        this.saveMeta().then(() => {
            this.dismiss();
        });
    },
    render(){
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

class UserMetaPanel extends React.Component{

    constructor(props){
        if(props.editMode === undefined){
            props.editMode = false;
        }
        super(props);
        this.state = {
            updateMeta: new Map(),
            isChecked: false,
            fields: [],
            configs: new Map()
        }
    }

    componentDidMount(){
        Renderer.getMetadataConfigs().then(configs => {
            this.setState({configs});
        })
    }
    updateValue(name, value, submit = false){
        this.state.updateMeta.set(name, value);
        this.setState({
            updateMeta: this.state.updateMeta
        });
        if(this.props.onChangeUpdateData){
            this.props.onChangeUpdateData(this.state.updateMeta);
        }
        if(submit && this.props.autoSave){
            this.props.autoSave();
        }
    }
    deleteValue(name) {
        this.state.updateMeta.delete(name);
        this.setState({
            updateMeta: this.state.updateMeta
        });
        if(this.props.onChangeUpdateData){
            this.props.onChangeUpdateData(this.state.updateMeta);
        }
    }
    getUpdateData(){
        return this.state.updateMeta;
    }

    resetUpdateData(){
        this.setState({
            updateMeta: new Map()
        });
        if(this.props.onChangeUpdateData){
            this.props.onChangeUpdateData(new Map());
        }
    }
    onCheck(e, isInputChecked, value){
        let state = this.state;
        state['fields'][e.target.value] = isInputChecked;
        if(isInputChecked === false){
            this.deleteValue(e.target.value);
        }
        this.setState(state);
    }
    render(){
        const {configs} = this.state;
        let data = [];
        let node = this.props.node;
        let metadata = this.props.node.getMetadata();
        let updateMeta = this.state.updateMeta;
        let nonEmptyDataCount = 0;
        const isAdmin = pydio.user.isAdmin;

        configs.forEach((meta, key) => {
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
                    onValueChange: (name, value, submit) => this.updateValue(name, value, submit)
                };
                if(type === 'stars_rate'){
                    field = <StarsFormPanel {...baseProps}/>;
                }else if(type === 'choice') {
                    field = Renderer.formPanelSelectorFilter(baseProps, configs);
                }else if(type === 'css_label'){
                    field = Renderer.formPanelCssLabels(baseProps, configs);
                }else if(type === 'tags'){
                    field = Renderer.formPanelTags(baseProps, configs);
                }else{
                    field = (
                        <ModernTextField
                            value={value}
                            fullWidth={true}
                            disabled={readonly}
                            hintText={label}
                            multiLine={type === 'textarea'}
                            onChange={(event, value)=>{this.updateValue(key, value);}}
                        />
                    );
                }
                if(this.props.multiple){
                    data.push(
                        <div className={"infoPanelRow"} key={key} style={{ marginBottom: 20}}>
                            <Checkbox value={key} label={label} onCheck={this.onCheck.bind(this)}/>
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
        });
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

}

class InfoPanel extends React.Component{

    constructor(props){
        super(props);
        this.state = {editMode: false};
        this._nodeObserver = () => {
            if(this.refs.panel){
                this.refs.panel.resetUpdateData();
            }
            this.forceUpdate();
            //this.setState({editMode: false}, ()=>{this.forceUpdate()});

        };
        if(props.node){
            props.node.observe('node_replaced', this._nodeObserver)
        }
    }

    openEditMode(){
        this.setState({editMode:true });
    }

    reset(){
        this.refs.panel.resetUpdateData();
        this.setState({editMode: false});
    }

    componentWillReceiveProps(newProps){
        if(this.props.node){
            this.props.node.stopObserving('node_replaced', this._nodeObserver)
        }
        if(newProps.node !== this.props.node && this.refs.panel){
            this.reset();
            newProps.node.observe('node_replaced', this._nodeObserver)
        }
    }

    componentWillUnmount(){
        if(this.props.node){
            this.props.node.stopObserving('node_replaced', this._nodeObserver)
        }
    }

    saveMeta(){
        let values = this.refs.panel.getUpdateData();
        return Renderer.getClient().saveMeta(this.props.pydio.getContextHolder().getSelectedNodes(), values);
    }

    saveAndClose(){
        this.saveMeta().then(()=> {
            this.reset();
        });
    }

    onChangeUpdateData(updateData){
        this.setState({updateData})
    }

    render(){
        let actions = [];
        const {MessageHash} = this.props.pydio;
        const values = this.state.updateData || new Map();

        if(this.state.editMode){
            actions.push(
                <FlatButton
                    key="cancel"
                    label={values.size ? MessageHash['54'] : MessageHash['86']}
                    onClick={()=>{this.reset()}}
                />
            );
            if(!this.props.node.getMetadata().has('node_readonly') && values.size > 0){
                actions.push(
                    <FlatButton
                        key="edit"
                        label={this.state.editMode?MessageHash['meta.user.15']:MessageHash['meta.user.14']}
                        onClick={()=>{this.saveAndClose()}}
                    />
                );
            }
        } else {
            actions.push(
                <FlatButton
                    key="edit"
                    label={this.state.editMode?MessageHash['meta.user.15']:MessageHash['meta.user.14']}
                    onClick={()=>{this.openEditMode()}}
                />
            );
        }

        return (
            <PydioWorkspaces.InfoPanelCard
                identifier={"meta-user"}
                style={this.props.style}
                title={this.props.pydio.MessageHash['meta.user.1']}
                actions={actions.length ? actions : null}
                icon="tag-multiple" iconColor="#00ACC1"
            >
                <UserMetaPanel
                    ref="panel"
                    node={this.props.node}
                    editMode={this.state.editMode}
                    onRequestEditMode={this.openEditMode.bind(this)}
                    pydio={this.props.pydio}
                    onChangeUpdateData={(d) => {this.onChangeUpdateData(d)}}
                    autoSave={()=>{
                        this.saveMeta().then(()=>{
                            this.refs.panel.resetUpdateData();
                        })
                    }}
                />
            </PydioWorkspaces.InfoPanelCard>
        );
    }

}

export {Renderer, InfoPanel, Callbacks, UserMetaDialog}
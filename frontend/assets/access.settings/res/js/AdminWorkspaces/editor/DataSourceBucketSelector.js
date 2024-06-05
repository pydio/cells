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

import Pydio from 'pydio'
import React from 'react'
import LangUtils from 'pydio/util/lang'
import DataSource from '../model/DataSource'
import {RaisedButton, Toggle, Chip, IconButton, FontIcon} from 'material-ui'
const {ModernTextField} = Pydio.requireLib('hoc');
import {debounce} from 'lodash'

export default class DataSourceBucketSelector extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            buckets:[],
            selection:[],
            mode:this.modeFromValue(),
            monitorApi: props.dataSource.ApiKey + '-' + props.dataSource.ApiSecret
        };
        if (props.dataSource.ObjectsBucket) {
            this.state.selection = [props.dataSource.ObjectsBucket];
        }
        this.load();
        this.loadSelection();
        this.reloadSelection = debounce(() => {
            this.loadSelection();
        }, 500);
        this.loadDebounced = debounce(() => {
            this.load();
        }, 500);
    }

    componentWillReceiveProps(newProps){
        const monitor = newProps.dataSource.ApiKey + '-' + newProps.dataSource.ApiSecret;
        const {monitorApi} = this.state;
        if(monitor !== monitorApi) {
            this.loadDebounced();
            this.setState({monitorApi: monitor})
        }
    }

    load() {
        const {dataSource} = this.props;
        if(!dataSource.ApiKey || !dataSource.ApiSecret) {
            this.setState({buckets:[]});
            return;
        }
        this.setState({loading: true});
        DataSource.loadBuckets(dataSource).then(collection => {
            const nodes = collection.Children || [];
            this.setState({buckets: nodes.map(n => {return n.Path}), loading: false})
        }).catch(e => {
            this.setState({buckets: [], loading: false});
        })
    }

    createBucket() {
        const {dataSource} = this.props;
        const {createBucket} = this.state;
        this.setState({loading: true});
        DataSource.createBucket(dataSource, createBucket).then(() => {
            this.setState({create: false, createBucket: ''})
            this.load()
        }).catch(e => {
            this.setState({loading: false})
        })
    }

    loadSelection(){
        const {dataSource} = this.props;
        if(!dataSource.ApiKey || !dataSource.ApiSecret) {
            this.setState({selection:[]});
            return
        }
        if(dataSource.ObjectsBucket) {
            this.setState({selection:[dataSource.ObjectsBucket]});
            return;
        }
        this.setState({selection:[]});
        if(!dataSource.StorageConfiguration.bucketsRegexp){
            return
        }
        DataSource.loadBuckets(dataSource, dataSource.StorageConfiguration.bucketsRegexp).then(collection => {
            const nodes = collection.Children || [];
            this.setState({selection: nodes.map(n => {return n.Path})})
        })
    }

    modeFromValue(){
        const {dataSource} = this.props;
        let mode = 'picker';
        if(dataSource.StorageConfiguration.bucketsRegexp) {
            mode = 'regexp';
        }
        return mode;
    }

    toggleMode(){
        const {mode} = this.state;
        const {dataSource} = this.props;
        if(mode === 'picker'){
            if(dataSource.ObjectsBucket){
                dataSource.StorageConfiguration.bucketsRegexp = dataSource.ObjectsBucket;
                dataSource.ObjectsBucket = '';
                this.reloadSelection();
            }
            this.setState({mode:'regexp'});
        } else {
            dataSource.StorageConfiguration.bucketsRegexp = '';
            this.reloadSelection();
            this.setState({mode:'picker'});
        }
    }

    togglePicker(value) {
        const {dataSource} = this.props;
        const {selection} = this.state;
        let newSel = [];
        const idx = selection.indexOf(value);
        if(idx === -1){
            newSel = [...selection, value];
        } else {
            newSel = LangUtils.arrayWithout(selection, idx);
        }
        if(newSel.length === 1) {
            dataSource.ObjectsBucket = newSel[0];
            dataSource.StorageConfiguration.bucketsRegexp = '';
        } else {
            dataSource.ObjectsBucket = '';
            dataSource.StorageConfiguration.bucketsRegexp = newSel.map(v => '^' + v + '$').join('|');
        }
        this.setState({selection:newSel});
    }

    updateRegexp(v) {
        const {dataSource} = this.props;
        dataSource.StorageConfiguration.bucketsRegexp = v;
        this.reloadSelection();
    }

    render() {

        const {dataSource} = this.props;
        const {buckets, selection, mode, loading, create, createBucket = ''} = this.state;
        const mm = Pydio.getInstance().MessageHash
        const m = (id) => mm['ajxp_admin.ds.editor.storage.' + id] || id;

        const iconStyles = {
            style:{width: 30, height: 30, padding: 5},
            iconStyle:{width: 20, height: 20, color:'rgba(0,0,0,.5)', fontSize:18},
        };
        const disabled = (!dataSource.ApiKey || !dataSource.ApiSecret);

        return (
            <div>
                <div style={{display:'flex', alignItems:'flex-end', marginTop: 20}}>
                    <div>{m('buckets.legend')}</div>
                    <div style={{flex: 1}}/>
                    <div style={{display:'flex', alignItems:'flex-end', marginRight:create?30:0}}>
                        {create &&
                            <div style={{width: 200, height: 36}}>
                                <ModernTextField
                                    hintText={m('buckets.create.hint')}
                                    fullWidth={true}
                                    value={createBucket}
                                    onChange={(e,v) => {
                                        this.setState({createBucket: LangUtils.computeStringSlug(v)})
                                    }}
                                />
                            </div>
                        }
                        <IconButton
                            iconClassName={create?"mdi mdi-check":"mdi mdi-plus-circle"}
                            tooltip={m('buckets.create')}
                            tooltipPosition={"top-left"}
                            onClick={() => {
                                if(create){
                                    this.createBucket()
                                } else {
                                    this.setState({create:true})
                                }
                            }}
                            disabled={disabled}
                            {...iconStyles}
                        />
                        {create &&
                            <IconButton
                                iconClassName={'mdi mdi-close'}
                                tooltip={mm['54']}
                                tooltipPosition={"top-left"}
                                onClick={() => this.setState({create:false, createBucket:''})}
                                disabled={disabled}
                                {...iconStyles}
                            />
                        }
                    </div>
                    <div style={{display:'flex', alignItems:'flex-end'}}>
                        {mode === 'regexp' &&
                        <div style={{width: 200, height: 36}}>
                            <ModernTextField
                                hintText={m('buckets.regexp.hint')}
                                fullWidth={true}
                                value={dataSource.StorageConfiguration.bucketsRegexp || ''}
                                onChange={(e,v) => {this.updateRegexp(v)}}
                            />
                        </div>
                        }
                        <IconButton
                            iconClassName={"mdi mdi-filter"}
                            tooltip={mode==='picker'?m('buckets.regexp'):''}
                            tooltipPosition={"top-left"}
                            onClick={() => {this.toggleMode()}}
                            disabled={disabled}
                            {...iconStyles}
                        />
                    </div>
                    <IconButton
                        iconClassName={"mdi mdi-reload"}
                        tooltip={m('buckets.reload')}
                        tooltipPosition={"top-left"}
                        onClick={() => {this.load()}}
                        disabled={disabled}
                        {...iconStyles}
                    />
                </div>
                <div style={{display:'flex', flexWrap:'wrap', marginTop: 8, backgroundColor: 'rgb(246 246 248)', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #e0e0e0', minHeight:52, padding: 2, maxHeight:275, overflowY:'auto'}}>
                    {buckets.map(b => {
                        const selected = selection.indexOf(b) !== -1;
                        let chipToucher = {};
                        if(mode === 'picker'){
                            chipToucher.onClick = () => {this.togglePicker(b)}
                        } else if(!dataSource.StorageConfiguration.bucketsRegexp) {
                            chipToucher.onClick = () => {this.toggleMode();this.togglePicker(b);}
                        }
                        return <div style={{margin:5}}><Chip {...chipToucher} backgroundColor={selected?'#03a9f4':null}>{b}</Chip></div>
                    })}
                    {buckets.length === 0 &&
                        <div style={{paddingLeft: 5, textAlign:'center', fontSize:12, color:'rgba(0,0,0,.3)'}}>
                            {disabled ? m('buckets.cont.nokeys') : (loading ? m('buckets.cont.loading') : m('buckets.cont.empty'))}
                        </div>
                    }
                </div>
            </div>
        );
    }

}
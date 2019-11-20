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
import {RaisedButton, Toggle, Chip} from 'material-ui'
const {ModernTextField} = Pydio.requireLib('hoc');
import {debounce} from 'lodash'

export default class DataSourceBucketSelector extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            buckets:[],
            selection:[],
            mode:this.modeFromValue(),
        };
        this.load();
        this.loadSelection();
        this.reloadSelection = debounce(() => {
            this.loadSelection();
        }, 500);
    }

    load() {
        const {dataSource} = this.props;
        if(!dataSource.ApiKey || !dataSource.ApiSecret) {
            this.setState({buckets:[]});
            return
        }
        DataSource.loadBuckets(dataSource).then(collection => {
            const nodes = collection.Children || [];
            this.setState({buckets: nodes.map(n => {return n.Path})})
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

    togglePicker(value) {
        const {dataSource} = this.props;
        const {selection} = this.state;
        console.log(value);
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
        const {buckets, selection, mode} = this.state;
        const m = (id) => Pydio.getInstance().MessageHash['ajxp_admin.ds.editor.' + id] || id;


        return (
            <div>
                <RaisedButton label={"Reload all"} onTouchTap={() => {this.load()}}/>
                <RaisedButton label={"Regexp Mode"} onTouchTap={() => {this.setState({mode:mode==='picker'?'regexp':'picker'})}}/>
                {mode === 'regexp' &&
                    <ModernTextField fullWidth={true} value={dataSource.StorageConfiguration.bucketsRegexp || ''} onChange={(e,v) => {this.updateRegexp(v)}}/>
                }
                <div style={{display:'flex', flexWrap:'wrap', marginTop: 10, backgroundColor: '#f5f5f5', borderRadius: 5, padding: 2, maxHeight:275, overflowY:'auto'}}>
                    {buckets.map(b => {
                        const selected = selection.indexOf(b) !== -1;
                        let chipToucher = null;
                        if(mode === 'picker'){
                            chipToucher = () => {this.togglePicker(b)}
                        }
                        return <div style={{margin:5}}><Chip onTouchTap={chipToucher} backgroundColor={selected?'#03a9f4':null}>{b}</Chip></div>
                    })}
                </div>
            </div>
        );
    }

}
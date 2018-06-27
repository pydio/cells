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

import React from 'react'
import {RaisedButton} from 'material-ui'
const {Doughnut} = require('react-chartjs')
import PluginEditor from '../core/PluginEditor'

const CacheServerDashboard = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    getInitialState:function(){
        return {cacheStatuses:[], loading:false};
    },

    componentDidMount:function(){
        this.checkCacheStats();
    },

    clearCache: function(namespace){
        PydioApi.getClient().request({get_action:'cache_service_clear_cache', namespace:namespace}, function(transp) {
            this.checkCacheStats();
        }.bind(this));
    },

    checkCacheStats: function(){
        this.setState({loading:true});
        PydioApi.getClient().request({get_action:'cache_service_expose_stats'}, function(transp) {
            this.setState({loading: false});
            if (!this.isMounted()) return;
            var response = transp.responseJSON;
            this.setState({cacheStatuses:response});
            setTimeout(this.checkCacheStats.bind(this), 4000);
        }.bind(this));
    },

    formatUptime(time){
        var sec_num = parseInt(time, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes+':'+seconds;
    },

    renderCachePane: function(cacheData){
        let healthPercent = parseInt( 100 * cacheData.misses / cacheData.hits);
        let health;
        if(healthPercent < 5) {
            health = '< 5%';
        }else if(healthPercent < 20){
            health = '< 20%';
        }else if(healthPercent < 40){
            health = '< 40%';
        }else if(healthPercent < 60){
            health = '> 40%';
        }else{
            health = '> 60%';
        }
        let memoryUsage;
        if(cacheData.memory_available){
            memoryUsage = (
                <div className="doughnut-chart">
                    <h5>Memory Usage</h5>
                    <Doughnut
                        data={[{
                            value: cacheData.memory_usage,
                            color:"rgba(247, 70, 74, 0.51)",
                            highlight: "#FF5A5E",
                            label: "Memory Used"
                        },{
                            value: cacheData.memory_available - cacheData.memory_usage,
                            color: "rgba(70, 191, 189, 0.59)",
                            highlight: "#5AD3D1",
                            label: "Memory Available"
                        }]}
                        options={{}}
                        width={150}
                    />
                    <span className="figure">{parseInt( 100 * cacheData.memory_usage / cacheData.memory_available) }%</span>
                </div>
            );
        }else{
            memoryUsage = (
                <div className="doughnut-chart">
                    <h5>Memory Usage</h5>
                    <div className="figure" style={{top:'auto'}}>{PathUtils.roundFileSize(cacheData.memory_usage)}</div>
                </div>
            );
        }

        return (
            <div>
                <h4>Namespace '{cacheData.namespace}'</h4>
                <div>
                    <div style={{width:'50%', float:'left'}}>
                        {memoryUsage}
                    </div>
                    <div style={{width:'50%', float:'left'}}>
                        <div className="doughnut-chart">
                            <h5>Cache Health</h5>
                            <Doughnut
                                data={[{
                                    value: cacheData.misses,
                                    color:"rgba(247, 70, 74, 0.51)",
                                    highlight: "#FF5A5E",
                                    label: "Missed"
                                },{
                                    value: cacheData.hits,
                                    color: "rgba(70, 191, 189, 0.59)",
                                    highlight: "#5AD3D1",
                                    label: "Hits"
                                }]}
                                options={{}}
                                width={150}
                            />
                            <span className="figure">{health}</span>
                        </div>
                    </div>
                </div>
                <div>Uptime: {this.formatUptime(cacheData.uptime)}</div>
            </div>
        );
    },

    renderClearButton:function(cacheData){
        return (
            <div style={{paddingBottom: 10}}>
                <RaisedButton
                    label={"Clear " + cacheData.namespace + " cache"}
                    onTouchTap={this.clearCache.bind(this, cacheData.namespace)}
                />
            </div>
        );
    },

    renderStatusPane: function(){
        var overall = (this.state.cacheStatuses.length?this.renderCachePane(this.state.cacheStatuses[0]):null);
        return (
            <div style={{padding:'0 20px'}}>
                <h3>Status</h3>
                <div>
                    {overall}
                </div>
                <h3>Cache Control</h3>
                <div>
                    {this.state.cacheStatuses.map(this.renderClearButton.bind(this))}
                </div>
            </div>
        );
    },

    render: function(){
        var pane = this.renderStatusPane();
        return (
            <div className="cache-server-panel" style={{height:'100%'}}>
                <PluginEditor
                    {...this.props}
                    additionalPanes={{top:[], bottom:[pane]}}
                />
            </div>
        );
    }

});

export {CacheServerDashboard as default}
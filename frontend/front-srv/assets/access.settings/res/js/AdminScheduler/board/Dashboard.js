/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {muiThemeable} from 'material-ui/styles'
const {JobsStore} = Pydio.requireLib("boot");

import JobBoard from './JobBoard'
import debounce from 'lodash.debounce'
import {JobsJob} from 'pydio/http/rest-api';
import JobsList from "./JobsList";

let Dashboard = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    getInitialState(){
        return {
            Owner: null,
            Filter: null,
        }
    },

    load(hideLoading = false){
        const {Owner, Filter} = this.state;
        if (!hideLoading) {
            this.setState({loading: true});
        }
        JobsStore.getInstance().getAdminJobs(Owner, Filter, "", 1).then(jobs => {
            this.setState({result: jobs, loading: false});
        }).catch(reason => {
            this.setState({error: reason.message, loading: false});
        })
    },

    loadOne(jobID, hideLoading = false) {
        // Merge job inside global results
        const {result} = this.state;
        if(!hideLoading){
            this.setState({loading: true});
        }
        return JobsStore.getInstance().getAdminJobs(null, null, jobID).then(jobs => {
            result.Jobs.forEach((v, k) => {
                if (v.ID === jobID){
                    result.Jobs[k] = jobs.Jobs[0];
                }
            });
            this.setState({result, loading: false});
            return result
        }).catch(reason => {
            this.setState({error: reason.message, loading: false});
        });
    },

    componentDidMount(){
        this.load();
        this._loadDebounced = debounce((jobId)=>{
            if (jobId && this.state && this.state.selectJob === jobId){
                this.loadOne(jobId, true);
            } else {
                this.load(true)
            }
        }, 500);
        JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
        this._poll = setInterval(()=>{
            if (this.state && this.state.selectJob){
                this.loadOne(this.state.selectJob, true);
            } else {
                this.load(true)
            }
        }, 10000);
    },

    componentWillUnmount(){
        if(this._poll){
            clearInterval(this._poll);
        }
        JobsStore.getInstance().stopObserving("tasks_updated");
    },

    selectRows(rows){
        if(rows.length){
            const jobID = rows[0].ID;
            this.loadOne(jobID).then(() => {
                this.setState({selectJob:jobID});
            });
        }
    },

    render(){

        const {pydio, jobsEditable, muiTheme} = this.props;
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        const {result, loading, selectJob} = this.state;

        if(selectJob && result && result.Jobs){
            const found = result.Jobs.filter((j) => j.ID === selectJob);
            if(found.length){
                return (
                    <JobBoard
                        pydio={pydio}
                        job={found[0]}
                        jobsEditable={jobsEditable}
                        onSave={()=>{this.load(true)}}
                        adminStyles={adminStyles}
                        onRequestClose={(refresh)=>{
                            this.setState({selectJob: null});
                            if(refresh){
                                this.load();
                            }
                        }}
                    />);
            }
        }

        return (
            <div style={{height: '100%', display:'flex', flexDirection:'column', position:'relative'}}>
                <AdminComponents.Header
                    title={m('title')}
                    icon="mdi mdi-timetable"
                    reloadAction={this.load.bind(this)}
                    loading={loading}
                />
                <JobsList
                    pydio={pydio}
                    selectRows={(rows)=>{this.selectRows(rows)}}
                    jobs={result ? result.Jobs : []}
                    loading={loading}
                />
            </div>
        );

    }

});

Dashboard = muiThemeable()(Dashboard);
export {Dashboard as default};
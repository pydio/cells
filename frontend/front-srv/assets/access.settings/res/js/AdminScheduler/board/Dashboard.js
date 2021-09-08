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
import createReactClass from 'create-react-class';
import {muiThemeable} from 'material-ui/styles'

import JobBoard from './JobBoard'
import JobsList from "./JobsList";
import Loader from './Loader';

let Dashboard = createReactClass({
    displayName: 'Dashboard',
    mixins:[AdminComponents.MessagesConsumerMixin],

    getInitialState(){
        return {
            jobs: [],
            Owner: null,
            Filter: null,
        }
    },

    reload(){
        this.loader.load();
    },

    componentDidMount(){
        this.loader = new Loader();
        this.loader.observe('loading',() => {
            this.setState({loading: true})
        })
        this.loader.observe('loaded',(memo) => {
            this.setState({loading: false})
            if(memo.jobs){
                this.setState({jobs: memo.jobs})
            } else if(memo.error){
                this.setState({error: memo.error})
            }
        })
        this.loader.start();
    },

    componentWillUnmount(){
        this.loader.stop();
    },

    selectRows(rows){
        if(rows.length){
            const jobID = rows[0].ID;
            this.loader.stop();
            this.setState({selectJob:jobID});
        }
    },

    render(){

        const {pydio, jobsEditable, muiTheme} = this.props;
        const m = (id) => pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        const {jobs, loading, selectJob} = this.state;

        if(selectJob && jobs){
            const found = jobs.filter((j) => j.ID === selectJob);
            if(found.length){
                return (
                    <JobBoard
                        pydio={pydio}
                        job={found[0]}
                        jobsEditable={jobsEditable}
                        onSave={()=>{this.reload()}}
                        adminStyles={adminStyles}
                        onRequestClose={()=>{
                            this.loader.start();
                            this.setState({selectJob: null});
                        }}
                    />);
            }
        }

        return (
            <div style={{height: '100%', display:'flex', flexDirection:'column', position:'relative'}}>
                <AdminComponents.Header
                    title={m('title')}
                    icon="mdi mdi-timetable"
                    reloadAction={this.reload.bind(this)}
                    loading={loading}
                />
                <JobsList
                    pydio={pydio}
                    selectRows={(rows)=>{this.selectRows(rows)}}
                    jobs={jobs}
                    loading={loading}
                    jobsEditable={jobsEditable}
                />
            </div>
        );

    },
});

Dashboard = muiThemeable()(Dashboard);
export {Dashboard as default};
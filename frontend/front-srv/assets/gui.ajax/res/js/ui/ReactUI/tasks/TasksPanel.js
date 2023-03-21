/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {useState, useRef, useEffect, useLayoutEffect} from 'react'
import Pydio from 'pydio'
import JobsStore from './JobsStore'
import {Paper, IconButton} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import JobEntry from './JobEntry'
import debounce from 'lodash.debounce'

/**
 * TasksPanel provides a view on the tasks registered
 * in the JobStore
 */
let TasksPanel = ({pydio, muiTheme, mode, panelStyle, headerStyle}) => {

    const [wsDisconnected, setWsDisconnected] = useState(false)
    const [wsStartDisconnected, _] = useState(pydio.WebSocketClient.getStatus())
    const [jobs, setJobs] = useState([])
    const [folded, setFolded] = useState(true)
    const [error, setError] = useState(null)
    const [innerScroll, setInnerScroll] = useState(0)
    const innerPane = useRef(null)

    useLayoutEffect(()=> {
        if(folded) {
            return ;
        }
        let newScroll = 8;

        if (innerPane && innerPane.current.children){
            for(let i=0; i<innerPane.current.children.length; i++){
                newScroll += innerPane.current.children.item(i).clientHeight + 8;
            }
        }
        if(newScroll && innerScroll !== newScroll){
            setInnerScroll(newScroll)
        }
    }, [folded, jobs])


    const reload = () => {
        JobsStore.getInstance().getJobs().then(jobs => {
            const jArr = []
            jobs.forEach(j => jArr.push(j))
            setJobs(jArr)
        }).catch(reason => {
            setError(reason.message)
        });
    }

    useEffect(()=> {
        setTimeout(()=>{
            // Recheck status after starting
            if(wsStartDisconnected){
                const status = pydio.WebSocketClient.getStatus();
                if(!status){
                    setWsDisconnected(true)
                }
            }
        }, 10000);
    }, [])

    useEffect(()=>{
        reload()
        const obs1 = (event) => {
            setWsDisconnected(!event.status)
            setFolded(true)
        }
        pydio.observe("ws_status", obs1)
        const obs2 = () => {
            reload()
        }
        JobsStore.getInstance().observe("tasks_updated", obs2);
        return () => {
            pydio.stopObserving('ws_status', obs1)
            JobsStore.getInstance().stopObserving('tasks_updated', obs2)
        }
    }, [])


    const palette = muiTheme.palette;
    const Color = require('color');
    let headerColor = Color(palette.primary1Color).darken(0.1).alpha(0.50).toString();

    const filtered = jobs.filter(j => j.Tasks).filter(j => {
        let hasRunning = false;
        j.Tasks.map(t => {
            if (t.Status === 'Running' || t.Status === 'Paused'){
                j.Time = t.StartTime;
                hasRunning = true;
            }
        });
        return hasRunning
    })

    filtered.sort((a,b)=>{
        if (a.Time === b.Time){
            return 0;
        }
        return a.Time > b.Time ? -1 : 1;
    });

    let elements = filtered.map(j => <JobEntry muiTheme={muiTheme} key={j.ID} job={j} onTaskAction={JobsStore.getInstance().controlTask}/>);
    let height = Math.min(elements.length * 72, 300) + 38;
    if(innerScroll){
        height = Math.min(innerScroll, 300) + 38;
    }

    const {mui3={}} = palette;
    let mui3style;
    if (muiTheme.userTheme === 'mui3') {
        headerColor = mui3.tertiary
        mui3style = {
            borderRadius: 12,
            margin: 8
        }
    }

    if(wsDisconnected){
        elements = [];
        height = 140;
        headerColor = mui3.error;
    }
    let styles = {
        panel:{
            position: 'absolute',
            width: 400,
            bottom: 0,
            left: '50%',
            marginLeft: -200,
            overflowX: 'hidden',
            zIndex: 20001,
            height: height,
            display:'flex',
            flexDirection:'column',
            background:mui3['surface-1'],
            ...mui3style,
            ...panelStyle
        },
        header:{
            color: headerColor,
            textTransform:'uppercase',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 500,
            backgroundColor: 'transparent',
            ...headerStyle
        },
        innerPane: {
            flex: 1,
            overflowY: 'auto'
        },
        iconButtonStyles:{
            style:{width:30, height: 30, padding: 6, marginRight: 4},
            iconStyle:{width:15, height: 15, fontSize: 15, color: palette.primary1Color}
        }
    };
    let mainDepth = 3;
    if (folded){
        styles.panel = {
            ...styles.panel,
            height: 42,
            cursor: 'pointer',
            overflowY: 'hidden'
        };
        styles.innerPane = {
            display: 'none',
        }
    }
    if (mode === 'flex') {
        mainDepth = 0;
        styles.panel = {...styles.panel,
            position:null,
            marginLeft: null,
            left: null,
            width: null
        };
    }

    if (!elements.length && !wsDisconnected) {
        if(mode !== 'flex'){
            styles.panel.bottom = -10000;
        }
        styles.panel.height = 0;
    }

    let mainTouchTap;
    const title = pydio.MessageHash['ajax_gui.background.jobs.running'] || 'Jobs Running';
    let badge;
    if(elements.length){
        badge = <span style={{
            display: 'inline-block',
            backgroundColor: palette.mui3['tertiary'],
            color: palette.mui3['on-tertiary'],
            width: 18,
            height: 18,
            fontSize: 11,
            lineHeight: '20px',
            textAlign: 'center',
            borderRadius: '50%',
            marginTop: -1
        }}>{elements.length}</span>;
    }
    if(folded){
        mainTouchTap = () => setFolded(false)
    }
    if(wsDisconnected){
        mainTouchTap = () => setFolded(!folded)
    }

    return (
        <Paper zDepth={mainDepth} style={styles.panel} onClick={mainTouchTap} rounded={false}>
            {wsDisconnected &&
                <Paper zDepth={0} style={styles.header}>
                    <div style={{padding: '12px 8px 12px 16px', flex: 1}}><span className={"mdi mdi-alert"}/> {pydio.MessageHash['ajax_gui.websocket.disconnected.title']}</div>
                </Paper>
            }
            {!wsDisconnected &&
            <Paper zDepth={0} style={styles.header} className="handle">
                <div style={{padding: '12px 8px 12px 16px'}}>{title}</div>
                {badge}
                <span style={{flex: 1}}/>
                {!folded && <IconButton iconClassName={"mdi mdi-chevron-down"} {...styles.iconButtonStyles} onClick={() => setFolded(true)} />}
                {folded && <IconButton iconClassName={"mdi mdi-chevron-right"} {...styles.iconButtonStyles} onClick={() => setFolded(false)} />}
            </Paper>
            }
            <div style={styles.innerPane} ref={innerPane}>
                {elements}
                {wsDisconnected && <div style={{padding:'0 16px'}}>{pydio.MessageHash['ajax_gui.websocket.disconnected.legend']}</div>}
            </div>
        </Paper>
    );

}

TasksPanel = muiThemeable()(TasksPanel);
export {TasksPanel as default}
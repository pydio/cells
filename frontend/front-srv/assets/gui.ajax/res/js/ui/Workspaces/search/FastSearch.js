/*
 * Copyright 2007-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import * as React from 'react';
import Pydio from 'pydio';
import SearchApi from 'pydio/http/search-api'
import LangUtils from 'pydio/util/lang'
import Node from 'pydio/model/node'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import InputAdornment from "@mui/material/InputAdornment";
import { debounce } from '@mui/material/utils';
const {DNDActionParameter} = Pydio.requireLib('components');
import reactStringReplace from 'react-string-replace';

const keys = {
    'j': {
        label:() => { return {title: 'Quick Jump', legend: 'Hit [Enter] to jump, add a trailing [/] to search inside children, [Esc] to Close'}},
        icon: () => 'mdi mdi-step-forward-2',
        filterKey: () => true,
        callback:(option) => {
            if(option.node){
                Pydio.getInstance().goTo(option.node)
                return {close: true, clear:true};
            } else if (option.repo) {
                Pydio.getInstance().triggerRepositoryChange(option.repo.getId())
                return {close: true, clear:true};
            } else {
                return {}
            }
        }
    },
    'v' :{
        label:() => {
            const nl = Pydio.getInstance().getContextHolder().getSelectedNodes().length
            return {title: 'Quick Move', legend: 'Hit [Enter] to move %s selected items to target, [Esc] to Close'.replace('%s', nl)}
        },
        icon: () => 'mdi mdi-folder-move',
        filterKey: () => {
            const move = Pydio.getInstance().Controller.actions.get('move')
            return (move && !move.deny)
        },
        callback: (option) => {
            if(!option.node || option.node.getMetadata().has('node_readonly') || option.node.getMetadata().has('virtual_root')){
                return {error: 'Cannot move to this target!'}
            }
            const ss = Pydio.getInstance().getContextHolder().getSelectedNodes()
            const parameter = new DNDActionParameter(ss[0], option.node, DNDActionParameter.STEP_END_DRAG, 'move');
            Pydio.getInstance().Controller.fireDefaultAction('dragndrop', parameter)
            return {close: true}
        }
    },
    'c' :{
        label:() => {
            const nl = Pydio.getInstance().getContextHolder().getSelectedNodes().length
            return {title: 'Quick Copy', legend: 'Hit [Enter] to copy %s selected items to target, [Esc] to Close'.replace('%s', nl)}
        },
        icon: () => 'mdi mdi-folder-multiple',
        filterKey: () => {
            const copy = Pydio.getInstance().Controller.actions.get('copy')
            return (copy && !copy.deny)
        },
        callback: (option) => {
            if(!option.node || option.node.getMetadata().has('node_readonly') || option.node.getMetadata().has('virtual_root')){
                return {error: 'Cannot copy to this target!'}
            }
            const ss = Pydio.getInstance().getContextHolder().getSelectedNodes()
            const parameter = new DNDActionParameter(ss[0], option.node, DNDActionParameter.STEP_END_DRAG, 'copy');
            Pydio.getInstance().Controller.fireDefaultAction('dragndrop', parameter)
            return {close: true}
        }
    }
}

const keyStyle = {
    fontFamily: 'monospace',
    display: 'inline-block',
    backgroundColor: '#eee',
    padding: '0px 5px',
    margin: '0 3px',
    borderRadius: 4,
    border: '1px solid #9e9e9e',
    color: '#000'
}
const stringReplaceKeys = (label) => {
    return reactStringReplace(label, /\[(\w+|\/)\]/g, (match) => <span style={keyStyle}>{match.replace(/\[\]/,'')}</span> )
}


export default function FastSearch() {
    const m =(id) => Pydio.getMessages()[id] || id
    const repos = Pydio.getInstance().user.repositories;
    const baseOptions = []
    repos.forEach(r => {
        if(r.accessType !== 'gateway'){
            return
        }
        const menuNode = new Node('/', false, r.getLabel());
        menuNode.setRoot(true);
        menuNode.getMetadata().set('repository_id', r.getId());
        baseOptions.push({
            key: r.getId(),
            label: r.getSlug(),
            display:r.getLabel(),
            repo: r,
            base: true,
            node: menuNode,
            groupLabel: r.getOwner()?m(469):m(468)
        })
    })
    baseOptions.sort(LangUtils.arraySorter('display'))
    const [memo, setMemo] = React.useState(null);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState(baseOptions);
    const [useGroups, setUseGroups] = React.useState(false);

    const [loading, setLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [scope, setScope] = React.useState(null);

    const api = new SearchApi(Pydio.getInstance());

    const fetch = React.useMemo(
        () =>
            debounce((request, callback) => {
                let {input=''} = request;
                let scope = '', basename = '';
                const lastSlash = input.lastIndexOf('/')
                if(lastSlash > 0){
                    scope = input.substring(0, lastSlash)
                    if(lastSlash < input.length - 1) {
                        basename = input.substring(lastSlash+1)
                    }
                } else {
                    basename = request.input
                }
                setLoading(true)
                api.search({ajxp_mime:'ajxp_folder', basename:basename?'*'+basename.toLowerCase()+'*' : '*'}, scope||'all', 30, true).then(response => {
                    const res = response.Results || []
                    const crtOptions=[], otherOptions = [];
                    const crtRepo = Pydio.getInstance().user.activeRepository
                    res.forEach((node, i) => {
                        const repoId = node.getMetadata().get('repository_id')
                        const repo = repos.get(repoId)
                        const path = node.getPath();
                        const option = {
                            key: node.getMetadata().get('uuid'),
                            label: path,
                            scope,basename,repo,node,
                            groupLabel:repo.getLabel()
                        }
                        if(repoId === crtRepo) {
                            crtOptions.push(option)
                        } else {
                            otherOptions.push(option)
                        }
                    })
                    otherOptions.sort(LangUtils.arraySorter('groupLabel'))
                    callback([...crtOptions, ...otherOptions], scope, otherOptions.length>0)
                    setLoading(false)
                }).catch(e => {
                    setLoading(false)
                });
            }, 400),
        [],
    );

    React.useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setOptions([]);
            return undefined;
        }

        fetch({ input: inputValue }, (results, scope, multipleRepos = false) => {
            if (active && open) {
                setOptions([...results]);
                setScope(scope)
                setUseGroups(multipleRepos);
            }
        });

        return () => {
            active = false;
        };
    }, [inputValue, fetch]);

    React.useEffect(() => {
        const listener = e => {
            if(open && e.key === 'Escape') {
                setOpen(false)
                return
            }
            if(open || e.ctrlKey || e.metaKey) {
                return
            }
            if(!keys[e.key] || !keys[e.key].filterKey()) {
                return;
            }
            if (/^(?:input|textarea|select|button)$/i.test(e.target.tagName)) {
                return;
            }
            e.preventDefault();
            setOpen(e.key);
        }
        document.addEventListener("keyup", listener);
        return () => {
            document.removeEventListener("keyup", listener)
        }
    })

    const sxs = {
        backdropColor: 'rgba(0,0,0,.1)',
        modalPosition: {display:'flex', alignItems:'center', justifyContent:'center', bottom:'40%'},
        mainPaper: {width: '80%', padding: '8px 0 2px !important'},
        header:{padding: '0 10px 5px', display: 'flex', alignItems: 'center'},
        title: {fontSize: 18, flex: 1, color: 'rgba(17, 70, 97, 0.87)'},
        legend:{opacity: .6, fontStyle:'italic'},
        popperModifiers: [{
            name: "offset",
            options: {
                offset: [0, 10],
            }
        }],
        groupHeader: {position: 'sticky', top: 0, padding: '8px 10px', fontSize: 13, fontWeight: 500, color:'rgba(17, 70, 97, 0.87)', backgroundColor:'rgba(255,255,255,.9)'}
    }

    const filteredBase = baseOptions.filter(o => {
        return o.display.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    })
    let header;
    if(keys[open]){
        let {title, legend} = keys[open].label()
        legend = stringReplaceKeys(legend)
        header = <div style={sxs.header}><span style={sxs.title}>{title}</span> <span style={sxs.legend}>{legend}</span></div>
    }

    return (
        <Modal open={!!open} onClose={()=>setOpen(false)} slotProps={{backdrop:{sx:{backgroundColor:sxs.backdropColor}}}} sx={sxs.modalPosition}>
            <Paper elevation={10} sx={sxs.mainPaper}>
                {header}
                <Autocomplete
                    id="quick-search"
                    sx={{ width: '100%' }}
                    getOptionLabel={(option) => {
                        if (typeof option === 'string') {
                            return option
                        }
                        if(option.base || !option.repo) {
                            return option.label
                        } else {
                            return option.repo.getSlug() + option.label
                        }
                    }}
                    filterOptions={(x) => x}
                    options={[...filteredBase,...options]}
                    autoComplete
                    openOnFocus
                    selectOnFocus
                    autoHighlight
                    filterSelectedOptions={false}
                    popupIcon={<span/>}
                    slotProps={{paper:{elevation:10}, popper:{modifiers:sxs.popperModifiers}}}
                    noOptionsText={<div style={{padding:'8px 10px'}}>{loading?m(466):m(478)}</div>}
                    onChange={(event, newValue) => {
                        if(newValue && keys[open]){
                            const {close, clear, error} = keys[open].callback(newValue)
                            if(close){
                                setOpen(false)
                                if(clear){
                                    setOptions([])
                                    setInputValue('')
                                } else {
                                    setMemo(newValue.label)
                                    setOptions([newValue])
                                }
                            } else if(error) {
                                console.error(error)
                            }
                        }
                    }}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                        setMemo(null)
                    }}
                    renderInput={(params) => {
                        return (
                        <TextField
                            {...params}
                            variant={"standard"}
                            /*label={keys[open] && stringReplaceKeys(keys[open].label())}*/
                            fullWidth={true}
                            autoFocus={true}
                            placeholder={memo||''}
                            InputLabelProps={{sx:{fontSize:'1rem !important', marginLeft: '10px !important', marginTop: '-3px !important'}}}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position={"start"}>
                                        <span className={keys[open] && keys[open].icon()} style={{marginLeft: 10, marginRight: 8}}/>
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <span style={{marginRight: 10}}>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </span>
                                ),
                                disableUnderline: true
                            }}
                        />
                    )}}
                    renderOption={(props, option) => {
                        const parts = []
                        let fullPath = option.display || option.label || '';
                        parts.push(<span className={'mdi mdi-folder-outline'} style={{marginRight: 10, marginLeft: -6, opacity: .6}} />)
                        if(scope && !option.base) {
                            if(option.repo){
                                fullPath = option.repo.getSlug() + fullPath
                            }
                            const scopeLookup = scope.length;
                            parts.push(<span style={{color:'rgba(0,0,0,.5)'}}>{fullPath.substring(0, scopeLookup)}</span>)
                            fullPath = fullPath.substring(scopeLookup)
                        }
                        if(option.basename){
                            const start = fullPath.toLowerCase().indexOf(option.basename.toLowerCase())
                            parts.push(<span>{fullPath.substring(0, start)}</span>)
                            parts.push(<span style={{fontWeight: 400, backgroundColor:'rgba(255,255,0,.4)'}}>{fullPath.substring(start, start+option.basename.length)}</span>)
                            parts.push(<span>{fullPath.substring(start+option.basename.length)}</span>)
                        } else {
                            parts.push(<span>{fullPath}</span>)
                        }
                        return (
                            <li {...props}>
                                <span style={{display:'inline'}}>{parts}</span>
                            </li>
                        )
                    }}
                    groupBy={useGroups?(option => option.groupLabel):undefined}
                    renderGroup={(params) => (
                        <li key={params.key}>
                            <div style={sxs.groupHeader}>{params.group}</div>
                            <ul>{params.children}</ul>
                        </li>
                    )}
                />
            </Paper>
        </Modal>
    );
}
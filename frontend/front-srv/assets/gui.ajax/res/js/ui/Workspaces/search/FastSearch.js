import * as React from 'react';
import Pydio from 'pydio';
import SearchApi from 'pydio/http/search-api'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { debounce } from '@mui/material/utils';

export default function FastSearch() {
    const repos = Pydio.getInstance().user.repositories;
    const baseOptions = []
    repos.forEach(r => {
        if(r.accessType !== 'gateway'){
            return
        }
        baseOptions.push({key: r.getId(), label: r.getSlug(), repo: r})
    })
    const [value, setValue] = React.useState(null);
    const [lastInputValue, setLastInputValue] = React.useState('');
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState(baseOptions);
    const [loading, setLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const fetch = React.useMemo(
        () =>
            debounce((request, callback) => {
                const api = new SearchApi(Pydio.getInstance());
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
                    const options = [];
                    res.forEach((node, i) => {
                        const repo = repos.get(node.getMetadata().get('repository_id'))
                        const path = repo.getSlug() + node.getPath();
                        options.push({
                            key: node.getMetadata().get('uuid'),
                            label: path,
                            scope,basename,repo,node
                        })
                    })
                    callback(options)
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
            setOptions(baseOptions);
            return undefined;
        }

        fetch({ input: inputValue }, (results) => {
            if (active) {
                let newOptions = [];

                if (value) {
                    newOptions = [value];
                }

                if (results) {
                    newOptions = [...newOptions, ...results];
                }

                setOptions(newOptions);
            }
        });

        return () => {
            active = false;
        };
    }, [value, inputValue, fetch, open]);

    React.useEffect(() => {
        const listener = e => {
            if(open && e.key === 'Escape') {
                setOpen(false)
                return
            }
            if(open) {
                return
            }
            if (e.key !== "j" || e.ctrlKey || e.metaKey) {
                return;
            }
            if (/^(?:input|textarea|select|button)$/i.test(e.target.tagName)) {
                return;
            }
            e.preventDefault();
            if(lastInputValue) {
                setValue(lastInputValue)
            }
            setOpen(true);
        }
        document.addEventListener("keyup", listener);
        return () => {
            document.removeEventListener("keyup", listener)
        }
    })

    return (
        <Modal open={open} onClose={()=>setOpen(false)} sx={{display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Box sx={{width: '80%', borderRadius: '5px', backgroundColor: '#fff', padding: '6px !important'}}>
                <Autocomplete
                    id="quick-search-map-demo"
                    sx={{ width: '100%' }}
                    getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.label
                    }
                    filterOptions={(x) => x}
                    options={options}
                    autoComplete
                    openOnFocus
                    selectOnFocus
                    autoHighlight
                    filterSelectedOptions
                    value={value}
                    noOptionsText="Start typing to find a folder"
                    onChange={(event, newValue) => {
                        //setOptions(newValue ? [newValue, ...options] : options);
                        if(newValue && (newValue.node||newValue.repo)){
                            setOpen(false)
                            if(newValue.node){
                                setLastInputValue(inputValue)
                                Pydio.getInstance().goTo(newValue.node)
                            } else {
                                setInputValue('')
                                setLastInputValue('')
                                Pydio.getInstance().triggerRepositoryChange(newValue.repo.getId())
                            }
                        }
                    }}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    renderInput={(params) => {
                        return (
                        <TextField
                            {...params}
                            variant={"standard"}
                            label="Quick Jump [Hit 'Enter' to Jump, Trailing '/' to list children, 'Esc' to Close]"
                            fullWidth={true}
                            autoFocus={true}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                        />
                    )}}
                    renderOption={(props, option) => {
                        const parts = []
                        let fullPath = option.label;
                        if(option.scope) {
                            parts.push(<span style={{color:'rgba(0,0,0,.5)'}}>{fullPath.substring(0, option.scope.length)}</span>)
                            fullPath = fullPath.substring(option.scope.length)
                        }
                        if(option.basename){
                            const start = fullPath.toLowerCase().indexOf(option.basename.toLowerCase())
                            parts.push(<span>{fullPath.substring(0, start)}</span>)
                            parts.push(<span style={{fontWeight: 500, backgroundColor:'rgba(255,255,0,.5)'}}>{fullPath.substring(start, start+option.basename.length)}</span>)
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
                />
            </Box>
        </Modal>
    );
}
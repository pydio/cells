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

import React, {Component, PropTypes} from 'react'
import {FontIcon, TextField, CircularProgress, FlatButton} from 'material-ui';
import SearchScopeSelector from './SearchScopeSelector'
const {PydioContextConsumer} = require('pydio').requireLib('boot')
import _ from 'lodash';
import {muiThemeable} from 'material-ui/styles'

/**
 * Subpane for search form
 */
class MainSearch extends Component {

    static get propTypes() {
        return {
            title           :PropTypes.string,
            mode            :PropTypes.string,
            onOpen          :PropTypes.func,
            onAdvanced      :PropTypes.func,
            onMore          :PropTypes.func,
            onClose         :PropTypes.func,
            hintText        :PropTypes.string,
            loading         :PropTypes.bool,
            scopeSelectorProps:PropTypes.object,
            showAdvanced    :PropTypes.bool
        }
    }

    static get styles() {
        return {
            main: {
                background: "#ffffff",
                width: "100%",
                height: 36,
                border: "none",
                transition:'all .25s',
                display:'flex'
            },
            input: {
                padding: "0 4px",
                border: 0
            },
            hint: {
                transition:'all .25s',
                width: "100%",
                padding: "0 4px",
                bottom: 0,
                lineHeight: "36px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
            },
            magnifier: {
                padding: '7px 0 0 8px',
                fontSize: 23,
                color: 'rgba(0, 0, 0, 0.33)'
            },
            underline: {
                display: "none"
            },
            closedMode: {
                main: {
                    background: 'rgba(255,255,255,.1)',
                    boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px',
                    borderRadius: 2
                },
                magnifier: {
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.64)'
                },
                input: {
                    color: 'rgba(255, 255, 255, 0.64)'
                },
                hint: {
                    color: 'rgba(255, 255, 255, 0.64)'
                }
            }
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            mode: props.mode,
            value: props.value || ''
        }

        // Making sure we don't send too many requests
        // this.onChange = _.debounce(this.onChange, 500)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            mode: nextProps.mode
        })
        if(nextProps.value && !this.state.value){
            this.setState({value: nextProps.value});
        }
    }

    componentDidUpdate() {
        if (this.state.mode !== 'closed') {
            this.input && this.input.focus()
        }
    }

    onChange(value) {
        this.setState({value: value}, () => {
            this.props.onChange({'basename': value})
        });
    }

    render() {
        const {title, mode, onOpen, onAdvanced, onMore, onClose, hintText, loading, scopeSelectorProps, showAdvanced, getMessage} = this.props;
        let {main, input, hint, underline, magnifier, closedMode} = MainSearch.styles
        if(mode === 'closed'){
            main = {...main, ...closedMode.main};
            hint = {...hint, ...closedMode.hint};
            input = {...input, ...closedMode.input};
            magnifier = {...magnifier, ...closedMode.magnifier};
        }
        let topStyle = {};
        if(mode !== 'closed'){
            topStyle = {backgroundColor: this.props.muiTheme.palette.accent2Color};
        }

        return (
            <div className="search-input" style={topStyle}>
                <div className="panel-header" style={{display:'flex'}}>
                    {scopeSelectorProps &&
                    <span>
                            <SearchScopeSelector style={{marginTop:-16, marginLeft:-26}} labelStyle={{color: 'white'}} {...scopeSelectorProps}/>
                        </span>
                    }
                    <span style={{flex:1}}></span>
                    {showAdvanced &&
                    <FlatButton style={{textTransform:'none', color:'white', fontSize:15, marginTop:-5, padding:'0 16px'}} onTouchTap={mode === 'advanced' ? onMore : onAdvanced}>{mode === 'advanced' ? '- ' + getMessage(606) : '+ ' + getMessage(605)}</FlatButton>
                    }
                    {mode === 'advanced' && loading &&
                    <div style={{marginRight: 10}} ><CircularProgress size={20} thickness={3}/></div>
                    }
                    <span className="panel-header-close mdi mdi-close" onClick={this.props.onClose}></span>
                </div>

                {mode !== 'advanced' &&
                <div style={main}>

                    <FontIcon className="mdi mdi-magnify" style={magnifier}/>

                    <TextField
                        ref={(input) => this.input = input}
                        style={{flex: 1, height:main.height}}
                        inputStyle={input}
                        hintStyle={hint}
                        fullWidth={true}
                        underlineShow={false}
                        onFocus={onOpen}
                        onBlur={mode === 'small' ? onClose : null}
                        hintText={hintText}
                        value={this.state.value || ''}
                        onChange={(e,v) => this.onChange(v)}
                        onKeyPress={(e) => (e.key === 'Enter' ? this.onChange(e.target.value) : null)}
                    />

                    {loading &&
                    <div style={{marginTop:9, marginRight: 9}} ><CircularProgress size={20} thickness={3}/></div>
                    }
                </div>
                }

            </div>
        )
    }
}

MainSearch = PydioContextConsumer(muiThemeable()(MainSearch));
export {MainSearch as default}
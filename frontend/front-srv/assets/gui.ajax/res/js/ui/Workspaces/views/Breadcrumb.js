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

const React = require('react')
const PydioNode = require('pydio/model/node')
const {muiThemeable} = require('material-ui/styles')
const LangUtils = require('pydio/util/lang')
const {Textfit} = require('react-textfit')
import Color from 'color'
import {Tooltip} from '@mui/material'
import DOMUtils from 'pydio/util/dom'


class Breadcrumb extends React.Component {
    state = {node: null, minFit: false};

    componentDidMount() {
        let n = this.props.pydio.getContextHolder().getContextNode();
        if(n){
            this.setState({node: n});
        }
        this._observer = function(event){
            this.setState({node: event.memo, minFit: false});
        }.bind(this);
        this.props.pydio.getContextHolder().observe("context_changed", this._observer);
    }

    componentWillUnmount() {
        this.props.pydio.getContextHolder().stopObserving("context_changed", this._observer);
    }

    goTo = (target, event) => {
        const targetNode = new PydioNode(target);
        this.props.pydio.getContextHolder().requireContextChange(targetNode);
    };

    toggleMinFit = (font) => {
        const {minFit} = this.state;
        const newMinFit = (font === 12);
        if(newMinFit !== minFit) {
            this.setState({minFit: newMinFit});
        }
    };

    makeStyle(textColor) {
        const shadow = Color(textColor).fade(0.6).toString();
        return `
        .react_breadcrumb span.segment:hover{ text-shadow: 0 0 1px ${shadow}; }
        .react_breadcrumb span.segment.last:not(.first){ text-shadow: 0 0 1px ${shadow}; }
        `
    }

    render() {
        const {pydio, muiTheme, rootStyle} = this.props;
        const {node, minFit, refreshHover} = this.state;
        const styles = {
            main: {
                fontSize: 21,
                height: 36,
                lineHeight:'40px',
                padding: '0 20px',
                color: muiTheme.appBar.textColor,
                width: '100%'
            }
        };
        let buttonColor
        if(muiTheme.palette.mui3) {
            buttonColor = muiTheme.palette.mui3.primary;
        }
        if(!pydio.user){
            return <span className="react_breadcrumb"></span>;
        }
        let repoLabel = ' ';
        if(pydio.user && pydio.user.activeRepository && pydio.user.repositories.has(pydio.user.activeRepository)){
            repoLabel = pydio.user.repositories.get(pydio.user.activeRepository).getLabel();
        }
        let segments = [];
        const path = node ? LangUtils.trimLeft(node.getPath(), '/') : '';
        const label = node ? node.getLabel() : '';
        let rebuilt = '';
        let mainStyle = rootStyle || {};
        mainStyle = {...styles.main, ...mainStyle};
        if(minFit){
            mainStyle = {...mainStyle, overflow:'hidden'}
        }
        const parts = path.split('/');
        parts.forEach(function(seg, i){
            if(!seg) {
                return;
            }
            const last = (i===parts.length-1)
            rebuilt += '/' + seg;
            segments.push(<span key={'bread_sep_' + i} className="separator"> / </span>);
            segments.push(<span key={'bread_' + i} className={"segment"+(last?' last':'')} onClick={this.goTo.bind(this, rebuilt)}>{last ? label : seg}</span>);
        }.bind(this));
        let refreshAction, refreshLabel;
        const a = pydio.Controller.getActionByName('refresh')
        if(a){
            refreshAction = a.apply.bind(a)
            refreshLabel = a.options.text;
        }

        return (
            <Textfit mode="single" min={12} max={22} className="react_breadcrumb" style={mainStyle} onReady={(f) => {this.toggleMinFit(f)}}>
                 {this.props.startWithSeparator && <span className="separator"> / </span>}
                <span className={"mdi mdi-folder-outline"} style={{fontSize:'0.9em', marginRight: 5}}/>
                <span className={"segment first" + (segments.length ? '' : ' last')} onClick={this.goTo.bind(this, '/')}>{repoLabel}</span>
                {segments}
                {refreshAction &&
                <Tooltip title={<div style={{padding:'2px 10px'}}>{refreshLabel}</div>} placement={"bottom"}><span
                    className={"mdi mdi-refresh"}
                    style={{
                        cursor: 'pointer',
                        color:buttonColor,
                        fontSize:'0.8em',
                        opacity:refreshHover?1:0.5,
                        padding: 5,
                        marginLeft: 2,
                        borderRadius: '50%',
                        backgroundColor:refreshHover?'var(--md-sys-color-outline-variant-50)':'',
                        transition: DOMUtils.getBeziersTransition()
                }}
                    onMouseOver={()=>this.setState({refreshHover:true})}
                    onMouseOut={()=>this.setState({refreshHover:false})}
                    onClick={() => refreshAction()}
                /></Tooltip>
                }
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:this.makeStyle(mainStyle.color)}}/>
            </Textfit>
        );
    }
}

Breadcrumb = muiThemeable()(Breadcrumb);

export {Breadcrumb as default}

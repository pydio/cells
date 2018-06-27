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


let Breadcrumb = React.createClass({

    getInitialState: function(){
        return {node: null};
    },

    componentDidMount: function(){
        let n = this.props.pydio.getContextHolder().getContextNode();
        if(n){
            this.setState({node: n});
        }
        this._observer = function(event){
            this.setState({node: event.memo});
        }.bind(this);
        this.props.pydio.getContextHolder().observe("context_changed", this._observer);
    },

    componentWillUnmount: function(){
        this.props.pydio.getContextHolder().stopObserving("context_changed", this._observer);
    },

    goTo: function(target, event){
        const targetNode = new PydioNode(target);
        this.props.pydio.getContextHolder().requireContextChange(targetNode);
    },

    render: function(){
        const pydio = this.props.pydio;
        const styles = {
            main: {
                fontSize: 22,
                lineHeight:'24px',
                padding: 20,
                color: this.props.muiTheme.appBar.textColor,
                maxWidth: '70%',
                flex:1
            }
        };
        if(!pydio.user){
            return <span className="react_breadcrumb"></span>;
        }
        let repoLabel = ' ';
        if(pydio.user && pydio.user.activeRepository && pydio.user.repositories.has(pydio.user.activeRepository)){
            repoLabel = pydio.user.repositories.get(pydio.user.activeRepository).getLabel();
        }
        let segments = [];
        const path = this.state.node ? LangUtils.trimLeft(this.state.node.getPath(), '/') : '';
        const label = this.state.node ? this.state.node.getLabel() : '';
        let rebuilt = '';
        let mainStyle = this.props.rootStyle || {};
        mainStyle = {...styles.main, ...mainStyle};
        const parts = path.split('/');
        parts.forEach(function(seg, i){
            if(!seg) return;
            rebuilt += '/' + seg;
            segments.push(<span key={'bread_sep_' + i} className="separator"> / </span>);
            segments.push(<span key={'bread_' + i} className="segment" onClick={this.goTo.bind(this, rebuilt)}>{i===parts.length-1 ? label : seg}</span>);
        }.bind(this));
        return (
            <Textfit mode="single" perfectFit={false} min={12} max={22} className="react_breadcrumb" style={mainStyle}>
                 {this.props.startWithSeparator && <span className="separator"> / </span>}
                <span className="segment first" onClick={this.goTo.bind(this, '/')}>{repoLabel}</span>
                {segments}
            </Textfit>
        );
    }

});

Breadcrumb = muiThemeable()(Breadcrumb);

export {Breadcrumb as default}

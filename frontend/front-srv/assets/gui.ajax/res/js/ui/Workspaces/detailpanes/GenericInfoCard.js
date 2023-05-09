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
import InfoPanelCard from './InfoPanelCard'
import FilePreview from '../views/FilePreview'
import {muiThemeable} from "material-ui/styles";

class GenericInfoCard extends React.Component {

    constructor(props) {
        super(props)
        this.state = this.build(props);

    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.build(nextProps));
    }

    build(props) {
        let isMultiple, isLeaf, isDir, recycleContext;

        // Determine if we have a multiple selection or a single
        const {node, nodes} = props

        if (nodes) {
            isMultiple = true
            recycleContext = nodes[0].hasAjxpMimeInBranch('ajxp_recycle');
        } else if (node) {
            isLeaf = node.isLeaf()
            isDir = !isLeaf;
            recycleContext = node.hasAjxpMimeInBranch('ajxp_recycle');
        } else {
            return {ready: false};
        }
        return {
            isMultiple,
            isLeaf,
            isDir,
            recycleContext,
            ready: true
        };
    }

    render() {

        const {ready, isMultiple, recycleContext} = this.state;

        if (!ready) {
            return null
        }

        let toolbars = [];
        if(recycleContext){
            toolbars.push('info_panel_recycle');
        } else {
            toolbars.push('info_panel');
        }

        if (isMultiple) {
            let {nodes, muiTheme} = this.props;
            let more;
            if(nodes.length > 10){
                const moreNumber = nodes.length - 10;
                nodes = nodes.slice(0, 10);
                more = <div>... and {moreNumber} more.</div>
            }
            const sepColor = muiTheme.palette.mui3?muiTheme.palette.mui3['outline-variant-50']:'#eee'
            return (
                <InfoPanelCard {...this.props} primaryToolbars={toolbars}>
                    <div style={{padding:'0'}}>
                        {nodes.map(function(node){
                            return (
                                <div style={{display:'flex', alignItems:'center', borderBottom:'1px solid '+sepColor}}>
                                    <FilePreview
                                        key={node.getPath()}
                                        style={{height:50, width:50, fontSize: 25, flexShrink: 0}}
                                        node={node}
                                        loadThumbnail={true}
                                        richPreview={false}
                                    />
                                    <div style={{flex:1, fontSize:14, fontWeight:500, marginLeft:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{node.getLabel()}</div>
                                </div>
                            );
                        })}
                        {more}
                    </div>
                </InfoPanelCard>
            );
        } else {
            const processing = !!this.props.node.getMetadata().get('Processing');
            toolbars.push('info_panel_share');
            return (
                <InfoPanelCard {...this.props} primaryToolbars={toolbars}>
                    <FilePreview
                        key={this.props.node.getPath()}
                        style={{backgroundColor:'white', height: 200, padding: 0}}
                        node={this.props.node}
                        loadThumbnail={this.state.isLeaf && !processing}
                        richPreview={this.state.isLeaf}
                        processing={processing}
                    />
                </InfoPanelCard>
            );
        }

        return null
    }
}

GenericInfoCard = muiThemeable()(GenericInfoCard)
export {GenericInfoCard as default}

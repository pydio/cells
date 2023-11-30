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

import Pydio from 'pydio'
import React, {Component} from 'react';
import ResourcesManager from 'pydio/http/resources-manager'
import {FlatButton} from 'material-ui'
const {AsyncComponent} = Pydio.requireLib('boot')
const {InfoPanelCard} = Pydio.requireLib('workspaces')

class Panel extends Component {

    parseValues(node){
        const configs = this.props.pydio.getPluginConfigs('meta.exif');
        if(!configs.has('exif_meta_fields') || !configs.has('exif_meta_labels')){
            return;
        }
        let fieldsLabels = {};
        const metaFields = configs.get('exif_meta_fields').split(',');
        const metaLabels = configs.get('exif_meta_labels').split(',');
        metaFields.map((k, i) => {fieldsLabels[k] = metaLabels[i]});
        const nodeMeta = node.getMetadata();
        let items = metaFields
            .map(key => key.split('.'))
            .filter(secField => secField.length === 2 && nodeMeta.has(secField[0]) && nodeMeta.get(secField[0])[secField[1]])
            .map(secField => ({
                key:secField.join('.'),
                label:fieldsLabels[secField.join('.')],
                value:nodeMeta.get(secField[0])[secField[1]]
            }));

        if(nodeMeta.has('GeoLocation') && nodeMeta.get('GeoLocation')['lat'] && nodeMeta.get('GeoLocation')['lon']){
            ResourcesManager.loadClassesAndApply(['PydioMaps'], () => this.setState({gpsData: true}));
        }

        this.setState({items});
    }

    componentDidMount() {
        this.parseValues(this.props.node);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.node !== this.props.node){
            this.setState({gpsData:null});
            this.parseValues(nextProps.node);
        }
    }

    mapLoaded(map, error){
        if (error && console) console.log(error);
    }

    openInExifEditor() {
        const {pydio, node} = this.props;

        const editor = pydio.Registry.findEditorById("editor.exif");
        if (editor) {
            pydio.UI.openCurrentSelectionInEditor(editor, node);
        }
    }

    openInMapEditor() {
        const {pydio, node} = this.props;

        const editors = pydio.Registry.findEditorsForMime("ol_layer");
        if (editors.length) {
            pydio.UI.openCurrentSelectionInEditor(editors[0], node);
        }
    }

    render(){

        let items = [];
        let actions = [];
        const labelStyle = {
            overflow:'hidden',
            textOverflow:'ellipsis',
            whiteSpace:'nowrap'
        };
        if (this.state && this.state.items && this.state.items.length) {

            const fields = this.state.items.map(function(object){
                return (
                    <div key={object.key} className="infoPanelRow" style={{float:'left', width: '50%', padding: '0 4px 12px', whiteSpace:'nowrap'}}>
                        <div className="infoPanelLabel">{object.label}</div>
                        <div className="infoPanelValue" title={object.value} style={labelStyle}>{object.value}</div>
                    </div>
                )
            });
            items.push(<div style={{padding: '0 12px'}}>{fields}</div>)
            items.push(<div style={{clear:'left'}}></div>)

            actions.push(
                <FlatButton onClick={() => this.openInExifEditor()} label={this.props.pydio.MessageHash['456']} />
            );
        }
        if (this.state && this.state.gpsData) {
            items.push(
                <AsyncComponent
                    namespace="PydioMaps"
                    componentName="OLMap"
                    key="map"
                    style={{height: 170, marginBottom:0, padding:0}}
                    centerNode={this.props.node}
                    mapLoaded={this.mapLoaded}
                />
            );
            actions.push(
                <FlatButton onClick={() => this.openInMapEditor()} label={this.props.pydio.MessageHash['meta.exif.2']} />
            )
        }

        if (!items.length) {
            return null;
        }
        return (
            <InfoPanelCard identifier={"meta-exif"} style={this.props.style} title={this.props.pydio.MessageHash['meta.exif.3']} actions={actions} icon="camera">
                {items}
            </InfoPanelCard>
        );

    }
}

export default Panel;

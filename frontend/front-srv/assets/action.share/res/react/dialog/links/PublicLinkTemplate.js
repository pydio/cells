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
import React from 'react';
import ShareContextConsumer from '../ShareContextConsumer'
import {SelectField, MenuItem} from 'material-ui';
import LinkModel from './LinkModel'

let PublicLinkTemplate = React.createClass({

    propTypes:{
        linkModel:React.PropTypes.instanceOf(LinkModel)
    },

    onDropDownChange: function(event, index, value){
        const {linkModel} = this.props;
        linkModel.getLink().ViewTemplateName = value;
        linkModel.notifyDirty();
    },

    render: function(){
        let crtLabel;
        const {linkModel} = this.props;
        let selected = linkModel.getLink().ViewTemplateName;
        const menuItems=this.props.layoutData.map(function(l){
            if(selected && l.LAYOUT_ELEMENT === selected) {
                crtLabel = l.LAYOUT_LABEL;
            }
            if(!selected && !crtLabel) {
                selected = l.LAYOUT_ELEMENT, crtLabel = l.LAYOUT_LABEL;
            }
            return <MenuItem key={l.LAYOUT_ELEMENT} value={l.LAYOUT_ELEMENT} primaryText={l.LAYOUT_LABEL}/>;
        });
        const unusedLegend = <div className="form-legend">{this.props.getMessage('198')}</div>;
        return (
            <div style={this.props.style}>
                <SelectField
                    fullWidth={true}
                    value={selected}
                    onChange={this.onDropDownChange}
                    disabled={this.props.isReadonly() || !linkModel.isEditable()}
                    floatingLabelText={this.props.getMessage('151')}
                >{menuItems}</SelectField>
            </div>
        );
    }
});

PublicLinkTemplate = ShareContextConsumer(PublicLinkTemplate);
export default PublicLinkTemplate
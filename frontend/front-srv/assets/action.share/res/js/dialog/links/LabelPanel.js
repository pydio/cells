import React from 'react';

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
import PropTypes from 'prop-types';

import Pydio from 'pydio'
import LinkModel from './LinkModel'
const {ModernTextField} = Pydio.requireLib('hoc');

class LabelPanel extends React.Component {


    render(){

        const {pydio, linkModel} = this.props;
        const m = (id) => pydio.MessageHash['share_center.' + id];
        const link = linkModel.getLink();
        const updateLabel = (e,v) => {
            link.Label = v;
            linkModel.updateLink(link);
        };

        const updateDescription = (e,v) => {
            link.Description = v;
            linkModel.updateLink(link);
        };

        return (
            <div>
                <ModernTextField floatingLabelText={m(265)} value={link.Label} onChange={updateLabel} fullWidth={true}/>
                <ModernTextField floatingLabelText={m(266)} value={link.Description} onChange={updateDescription} fullWidth={true}/>
            </div>
        );

    }

}

LabelPanel.PropTypes = {

    pydio: PropTypes.instanceOf(Pydio),
    linkModel: PropTypes.instanceOf(LinkModel),

};

export {LabelPanel as default}
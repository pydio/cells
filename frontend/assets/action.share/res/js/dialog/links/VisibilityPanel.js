import React from 'react';
import ShareContextConsumer from '../ShareContextConsumer'

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
import Policies from 'pydio/http/policies'
import {ServiceResourcePolicy, ServiceResourcePolicyPolicyEffect} from 'cells-sdk'
const {ResourcePoliciesPanel} = Pydio.requireLib('components');
import LinkModel from './LinkModel'

class VisibilityPanel extends React.Component {
    /**
     * Update associated hidden users policies, otherwise
     * the public link visibility cannot be changed
     * @param diffPolicies
     */
    onSavePolicies = (diffPolicies) => {

        const {linkModel, pydio} = this.props;
        const internalUser = linkModel.getLink().UserLogin;
        Policies.loadPolicies('user', internalUser).then(policies=>{
            if(policies.length){
                const resourceId = policies[0].Resource;
                const newPolicies = this.diffPolicies(policies, diffPolicies, resourceId);
                Policies.savePolicies('user', internalUser, newPolicies);
            }
        });

    };

    diffPolicies = (policies, diffPolicies, resourceId) => {
        let newPols = [];
        policies.map(p=>{
            const key = p.Action + '///' + p.Subject;
            if (!diffPolicies.remove[key]){
                newPols.push(p);
            }
        });
        Object.keys(diffPolicies.add).map(k=>{
            let newPol = new ServiceResourcePolicy();
            const [action, subject] = k.split('///');
            newPol.Resource = resourceId;
            newPol.Effect = ServiceResourcePolicyPolicyEffect.constructFromObject('allow');
            newPol.Subject = subject;
            newPol.Action = action;
            newPols.push(newPol);
        });
        return newPols;
    };

    render() {

        const {linkModel, pydio} = this.props;
        let subjectsHidden = [];
        const shareLink = linkModel.getLink()
        subjectsHidden["user:" + shareLink.UserLogin] = true;
        subjectsHidden["subject:" + shareLink.UserUuid] = true;
        let subjectDisables = {READ:subjectsHidden, WRITE:subjectsHidden};
        return (
            <div style={this.props.style}>
                {linkModel.getLink().Uuid &&
                    <ResourcePoliciesPanel
                        pydio={pydio}
                        resourceType="link"
                        description={this.props.getMessage('link.visibility.advanced')}
                        resourceId={shareLink.Uuid}
                        skipTitle={true}
                        onSavePolicies={this.onSavePolicies.bind(this)}
                        subjectsDisabled={subjectDisables}
                        subjectsHidden={subjectsHidden}
                        readonly={this.props.isReadonly() || !linkModel.isEditable()}
                        ref="policies"
                    />
                }
            </div>
        );

    }
}

VisibilityPanel.PropTypes = {
    pydio: PropTypes.instanceOf(Pydio).isRequired,
    linkModel: PropTypes.instanceOf(LinkModel).isRequired
};

VisibilityPanel = ShareContextConsumer(VisibilityPanel);
export default VisibilityPanel
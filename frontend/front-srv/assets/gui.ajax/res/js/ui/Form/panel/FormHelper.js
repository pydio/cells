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
import PropTypes from 'prop-types'
import Manager from '../manager/Manager'
const {AsyncComponent} = require('pydio').requireLib('boot')

/**
 * Display a form companion linked to a given input.
 * Props: helperData : contains the pluginId and the whole paramAttributes
 */
export default class extends React.Component {
    static propTypes = {
        helperData:PropTypes.object,
        close:PropTypes.func.isRequired
    };

    closeHelper = () => {
        this.props.close();
    };

    render() {
        let helper;
        if(this.props.helperData){
            const helpersCache = Manager.getHelpersCache();
            const pluginHelperNamespace = helpersCache[this.props.helperData['pluginId']]['namespace'];
            helper = (
                <div>
                    <div className="helper-title">
                        <span className="helper-close mdi mdi-close" onClick={this.closeHelper}></span>
                        Pydio Companion
                    </div>
                    <div className="helper-content">
                        <AsyncComponent
                            {...this.props.helperData}
                            namespace={pluginHelperNamespace}
                            componentName="Helper"
                            paramName={this.props.helperData['paramAttributes']['name']}
                        />
                    </div>
                </div>);
        }
        return <div className={'pydio-form-helper' + (helper?' helper-visible':' helper-empty')} style={{zIndex:1}}>{helper}</div>;
    }
}
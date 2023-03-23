import React from 'react';
import AsyncComponent from './AsyncComponent'

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

// import {compose} from 'redux';
import PropTypes from 'prop-types';

import XMLUtils from 'pydio/util/xml'
import withProgressiveBg from './withProgressiveBg'

// Animations
//const originStyles = {opacity: 0}
//const targetStyles = {opacity: 1}
//const enterAnimation = {stiffness: 350, damping: 28}

let Template = ({style, id, pydio, children}) => {
    const userIsActive = ()=>{pydio.notify('user_activity')};
    return (
        <div
            style={style}
            id={id}
            onMouseMove={userIsActive}
            onMouseOver={userIsActive}
            onKeyDown={userIsActive}>{children}</div>
    );
}

class TemplateBuilder extends React.Component {

    render() {
        const {pydio, containerId, bgStyle} = this.props;
        const currentTheme = pydio.Parameters.get('theme')

        let style = {
            display: "flex",
            flex: 1
        };
        if(bgStyle){
            style = bgStyle
        }

        const components = XMLUtils.XPathSelectNodes(pydio.getXmlRegistry(), "client_configs/template_part[@component]")
            .filter(node => {
                // Filter on theme
                return !node.getAttribute("theme") || node.getAttribute("theme") === currentTheme
            })
            .filter(node => {
                // Filter on containerId
                return containerId === node.getAttribute("ajxpId")
            })
            .map((node, index) => {
                // Map to AsyncComponent(s)
                const namespace = node.getAttribute("namespace");
                const componentName = node.getAttribute("component");
                let props = {};
                if(node.getAttribute("props")){
                    props = JSON.parse(node.getAttribute("props"));
                }
                return (
                    <AsyncComponent
                        key={index}
                        namespace={namespace}
                        componentName={componentName}
                        noLoader={true}
                        style={style}
                        {...props}
                        pydio={pydio}
                    />
                );
            })

        return <Template style={style} id={this.props.containerId} pydio={pydio}>{components}</Template>
    }
}

TemplateBuilder.propTypes = {
    pydio: PropTypes.instanceOf(Pydio),
    containerId:PropTypes.string
};

TemplateBuilder = withProgressiveBg(TemplateBuilder);

export default TemplateBuilder

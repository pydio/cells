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

import {compose} from 'redux';

import AsyncComponent from './AsyncComponent'
import BackgroundImage from './BackgroundImage'

// Animations
const originStyles = {opacity: 0}
const targetStyles = {opacity: 1}
const enterAnimation = {stiffness: 350, damping: 28}

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

/*
Template = compose (
    PydioHOCs.Animations.makeTransition(originStyles, targetStyles, enterAnimation)
)(Template)
*/

class TemplateBuilder extends React.Component {

    render() {

        let pydio = this.props.pydio;
        let containerId = this.props.containerId;

        let components = [];
        let style = {
            display: "flex",
            flex: 1
        };

        if(this.props.imageBackgroundFromConfigs){
            if(BackgroundImage.SESSION_IMAGE){
                style = BackgroundImage.SESSION_IMAGE;
            }else{
                style = BackgroundImage.getImageBackgroundFromConfig(this.props.imageBackgroundFromConfigs);
                BackgroundImage.SESSION_IMAGE = style;
            }
        }

        let parts = XMLUtils.XPathSelectNodes(pydio.getXmlRegistry(), "client_configs/template_part[@component]");
        parts.map(function(node){
            if(node.getAttribute("theme") && node.getAttribute("theme") != pydio.Parameters.get("theme")){
                return;
            }
            if(containerId !== node.getAttribute("ajxpId")){
                return;
            }

            let namespace = node.getAttribute("namespace");
            let componentName = node.getAttribute("component");


            let props = {};
            if(node.getAttribute("props")){
                props = JSON.parse(node.getAttribute("props"));
            }
            props['pydio'] = pydio;

            components.push(
                <AsyncComponent
                    key={namespace}
                    namespace={namespace}
                    componentName={componentName}
                    noLoader={true}
                    style={style}
                    {...props}
                />
            );
        }.bind(this));

        return <Template style={style} id={this.props.containerId} pydio={pydio}>{components}</Template>
    }
}

TemplateBuilder.propTypes = {
    pydio: React.PropTypes.instanceOf(Pydio),
    containerId:React.PropTypes.string
}



export default TemplateBuilder

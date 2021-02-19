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

import Node from 'pydio/model/node'
import InlineEditor from './InlineEditor'
import {DragDropListEntry} from './ListEntry'
import {FontIcon} from 'material-ui'
import withNodeListenerEntry from './withNodeListenerEntry'

/**
 * Callback based material list entry with custom icon render, firstLine, secondLine, etc.
 */
class ConfigurableListEntry extends React.Component {

    render(){
        let {secondLine, thirdLine, style = {}, actions} = this.props;
        const {renderIcon, node, renderFirstLine, renderSecondLine, renderThirdLine, renderActions} = this.props;
        let icon, firstLine;

        if(renderIcon) {
            icon = renderIcon(node, this.props);
        } else {
            const iconClass = node.getMetadata().get("icon_class")? node.getMetadata().get("icon_class") : (node.isLeaf()?"icon-file-alt":"icon-folder-close");
            icon = <FontIcon className={iconClass}/>;
        }

        if(renderFirstLine) {
            firstLine = renderFirstLine(this.props.node);
        } else {
            firstLine = node.getLabel();
        }
        if(this.props.inlineEdition){
            firstLine = (
                <span>
                        <InlineEditor
                            node={this.props.node}
                            onClose={this.props.inlineEditionDismiss}
                            callback={this.props.inlineEditionCallback}
                        />
                    {firstLine}
                    </span>
            );
            style.position = 'relative';
        }
        if(renderSecondLine) {
            secondLine = renderSecondLine(node);
        }
        if(renderThirdLine) {
            thirdLine = renderThirdLine(node);
        }
        if(renderActions) {
            actions = renderActions(node);
        }

        return (
            <DragDropListEntry
                {...this.props}
                iconCell={icon}
                firstLine={firstLine}
                secondLine={secondLine}
                thirdLine={thirdLine}
                actions={actions}
                style={style}
            />
        );

    }

}

ConfigurableListEntry.propTypes = {
    node:PropTypes.instanceOf(Node),
    renderIcon: PropTypes.func,
    renderFirstLine:PropTypes.func,
    renderSecondLine:PropTypes.func,
    renderThirdLine:PropTypes.func,
    renderActions:PropTypes.func,
    style: PropTypes.object
};

ConfigurableListEntry = withNodeListenerEntry(ConfigurableListEntry)
export default ConfigurableListEntry;
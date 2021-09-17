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
import PropTypes from 'prop-types'

const propTypes = {
    node: PropTypes.instanceOf(AjxpNode).isRequired,
    registry: PropTypes.instanceOf(Registry).isRequired,
    editorData: PropTypes.object.isRequired,
    icon: PropTypes.bool,
};

const defaultProps = {
    icon: false
};

class ReactEditorOpener extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            ready: false
        }
    }

    componentDidMount() {
        const {editorData, registry} = this.props

        registry.loadEditorResources(
            editorData.resourcesManager,
            () => this.setState({ready: true})
        );
    }

    render() {
        const {editorData} = this.props
        const {ready} = this.state

        if (!ready) return null

        let EditorClass = null
        if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
            return <div>{"Cannot find editor component (" + editorData.editorClass + ")!"}</div>
        }

        // Getting HOC of the class
        return <EditorClass.Editor {...this.props} />
    }
}

ReactEditorOpener.propTypes = propTypes;
ReactEditorOpener.defaultProps = defaultProps;

export default ReactEditorOpener

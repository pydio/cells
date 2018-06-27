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
import { Toolbar, ToolbarGroup, Card, CardHeader, CardMedia } from 'material-ui';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import makeMaximise from './make-maximise';

const { EditorActions, ResolutionActions, ContentActions, SizeActions, SelectionActions, LocalisationActions, withMenu } = Pydio.requireLib('hoc');

class Tab extends React.Component {
    static get styles() {
        return {
            container: {
                display: "flex",
                flex: 1,
                flexFlow: "column nowrap",
                overflow: "auto"
            },
            child: {
                display: "flex",
                flex: 1
            },
            toolbar: {
                backgroundColor: "#eeeeee",
                flexShrink: 0
            }
        }
    }

    renderControls(Controls, Actions) {
        const {node, editorData} = this.props
        const {SelectionControls, ResolutionControls, SizeControls, ContentControls, ContentSearchControls, LocalisationControls} = Controls

        let actions = {
            ...SizeActions,
            ...SelectionActions,
            ...ResolutionActions,
            ...ContentActions,
            ...LocalisationActions
        }

        if (editorData.editorActions) {
            actions = {
                ...actions,
                ...Actions
            }
        }

        let boundActionCreators = bindActionCreators(actions)

        const controls = (Controls) => {
            return Object.keys(Controls)
                .filter((key) => typeof Controls[key] === 'function')
                .map((key) => {
                    const Control = Controls[key]
                    return <Control editorData={editorData} node={node} {...boundActionCreators} />
                })
        }

        return (
            <Toolbar style={Tab.styles.toolbar}>
                {SelectionControls && <ToolbarGroup>{controls(SelectionControls)}</ToolbarGroup>}
                {ResolutionControls && <ToolbarGroup>{controls(ResolutionControls)}</ToolbarGroup>}
                {SizeControls && <ToolbarGroup>{controls(SizeControls)}</ToolbarGroup>}
                {ContentControls && <ToolbarGroup>{controls(ContentControls)}</ToolbarGroup>}
                {ContentSearchControls && <ToolbarGroup>{controls(ContentSearchControls)}</ToolbarGroup>}
                {LocalisationControls && <ToolbarGroup>{controls(LocalisationControls)}</ToolbarGroup>}
            </Toolbar>
        )
    }

    render() {
        const {node, editorData, Editor, Controls, Actions, id, isActive, editorSetActiveTab, style} = this.props

        const select = () => editorSetActiveTab(id)

        return !isActive ? (
            <AnimatedCard style={style} containerStyle={Tab.styles.container} maximised={isActive} expanded={isActive} onExpandChange={!isActive ? select : null}>
                <CardHeader title={id} actAsExpander={true} showExpandableButton={true} />
                <CardMedia style={Tab.styles.child} mediaStyle={Tab.styles.child}>
                    <Editor pydio={pydio} node={node} editorData={editorData} />
                </CardMedia>
            </AnimatedCard>
        ) : (
            <AnimatedCard style={style} containerStyle={Tab.styles.container} maximised={true} expanded={isActive} onExpandChange={!isActive ? select : null}>
                {Controls && this.renderControls(Controls, Actions)}

                <Editor pydio={pydio} node={node} editorData={editorData} />
            </AnimatedCard>
        )
    }
}

function mapStateToProps(state, ownProps) {
    const { editor, tabs } = state

    let current = tabs.filter(tab => tab.id === ownProps.id)[0]

    return  {
        ...ownProps,
        ...current,
        isActive: editor.activeTabId === current.id
    }
}

const AnimatedCard = makeMaximise(Card)

const EditorTab = connect(mapStateToProps, EditorActions)(Tab)

export default EditorTab

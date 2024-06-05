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
import Pydio from 'pydio';
import { connect } from 'react-redux';
import { Editor } from './components/editor';
import { Menu } from './components/menu';

const { withContainerSize, EditorActions } = Pydio.requireLib('hoc');

@withContainerSize
@connect(mapStateToProps, EditorActions)
class App extends React.Component {

    constructor(props) {
        super(props)

        const {editorModify, editorSetActiveTab} = props

        editorModify({isOpen: false})
        editorSetActiveTab(null)

        this.state = {
            fullBrowserScreen: pydio.UI.MOBILE_EXTENSIONS || true
        }

        this.onFullBrowserScreen = () => this.setState({fullBrowserScreen: !this.state.fullBrowserScreen})
    }

    render() {
        const {isOpen, isMinimised, displayToolbar, documentWidth, documentHeight} = this.props
        const {fullBrowserScreen} = this.state

        if (!isOpen) {
            return null
        }

        const editorStyle = {
            position: "fixed",
            top: fullBrowserScreen ? 0 : "1%",
            left: fullBrowserScreen ? 0 : "1%",
            right: fullBrowserScreen ? 0 : "15%",
            bottom: fullBrowserScreen ? 0 : "1%",
        }

        const overlayStyle = {
            position: "fixed",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            background: "#000000",
            opacity: "0.8",
            transition: "opacity .5s ease-in"
        };

        const buttonCenterPositionTop = documentHeight - 50
        const buttonCenterPositionLeft = documentWidth - 50

        let menuStyle = {
            position: "fixed",
            top: buttonCenterPositionTop,
            left: buttonCenterPositionLeft,
            cursor: "pointer",
            transform: "translate(-50%, -50%)",
            zIndex: 5
        }

        return (
            <div style={{position: "fixed", top: 0, left: 0,  zIndex: 1400}}>
                { !isMinimised && <div style={overlayStyle} /> }
                { <Editor displayToolbar={displayToolbar} style={editorStyle} minimiseStyle={{transformOrigin: buttonCenterPositionLeft + "px " + buttonCenterPositionTop + "px"}} /> }
                { isMinimised && <Menu style={menuStyle} /> }
            </div>
        )
    }
}

// REDUX - Then connect the redux store
function mapStateToProps(state, ownProps) {
    const {editor, tabs} = state
    const {isMinimised = false} = editor
    const {displayToolbar = true, ...remaining} = ownProps

    return {
        ...remaining,
        tabs,
        isOpen: tabs.filter(({editorData}) => editorData).length > 0,
        isMinimised: isMinimised,
        displayToolbar: displayToolbar,
    }
}

export default App
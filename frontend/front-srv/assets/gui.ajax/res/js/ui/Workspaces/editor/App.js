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

import Pydio from 'pydio';
import { connect } from 'react-redux';
import { Editor } from './components/editor';
import { Menu } from './components/menu';
import makeEditorOpen from './make-editor-open';

const { EditorActions } = Pydio.requireLib('hoc');

class App extends React.Component {

    constructor(props) {
        super(props)

        const {editorModify, editorSetActiveTab} = props

        editorModify({open: false})
        editorSetActiveTab(null)

        this.onEditorMinimise = () => this.setState({editorMinimised: !this.props.displayPanel})

        this.state = {
            editorMinimised: false,
            fullBrowserScreen: pydio.UI.MOBILE_EXTENSIONS || false
        }

        this.onFullBrowserScreen = () => this.setState({fullBrowserScreen: !this.state.fullBrowserScreen})
    }

    componentWillReceiveProps(nextProps) {
        const {editorModify, tabs, displayPanel, positionOrigin, positionTarget} = nextProps

        editorModify({open: tabs.filter(({editorData}) => editorData).length > 0})

        if (displayPanel) {

            this.setState({
                editorMinimised: false
            })

            let transformOrigin = ""
            if (positionOrigin && positionTarget) {
                const x = parseInt(positionTarget.left - positionOrigin.left + ((positionTarget.right - positionTarget.left) / 2))
                const y = parseInt(positionTarget.top - positionOrigin.top + ((positionTarget.bottom - positionTarget.top) / 2))

                this.setState({
                    transformOrigin: `${x}px ${y}px`
                })
            }
        }
    }

    render() {

        const {display, displayPanel} = this.props
        const {editorMinimised, fullBrowserScreen} = this.state

        let editorStyle = {
            display: "none"
        }

        let overlayStyle = {
            display: "none"
        }

        if (!editorMinimised) {
            editorStyle = {
                position: "fixed",
                top: fullBrowserScreen ? 0 : "1%",
                left: fullBrowserScreen ? 0 : "1%",
                right: fullBrowserScreen ? 0 : "15%",
                bottom: fullBrowserScreen ? 0 : "1%",
                transformOrigin: this.state.transformOrigin
            }

            overlayStyle = {position: "fixed", top: 0, bottom: 0, right: 0, left: 0, background: "#000000", opacity: "0.5", transition: "opacity .5s ease-in"}
        }

        if (!displayPanel) {
            overlayStyle = {opacity: 0, transition: "opacity .5s ease-in"}
        }

        let menuStyle = {
            position: "fixed",
            bottom: "50px",
            right: "50px",
            cursor: "pointer",
            transform: "translate(50%, 50%)",
            zIndex: 5
        }

        return (
            <div>
                { display ? <div style={overlayStyle} /> : null }
                <AnimationGroup>
                    { display ? <Editor style={editorStyle} onFullBrowserScreen={this.onFullBrowserScreen.bind(this)} onMinimise={this.onEditorMinimise.bind(this)}  /> : null }
                    { display ? <Menu style={menuStyle} /> : null }
                </AnimationGroup>
            </div>
        )
    }
}

const Animation = (props) => {
    return (
        <div {...props} />
    );
};

const AnimationGroup = makeEditorOpen(Animation)

// REDUX - Then connect the redux store
function mapStateToProps(state, ownProps) {
    const {editor, tabs} = state

    return {
        ...ownProps,
        tabs,
        display: editor.open,
        displayPanel: editor.isPanelActive,
        displayMenu: editor.isMenuActive,
        positionOrigin: editor.panel && editor.panel.rect,
        positionTarget: editor.menu && editor.menu.rect
    }
}
const ConnectedApp = connect(mapStateToProps, EditorActions)(App)

export default ConnectedApp;

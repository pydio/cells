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

// IMPORT
import Pydio from 'pydio'
//import FullScreen from 'react-fullscreen';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import { IconButton, Paper } from 'material-ui';
import Tab from './EditorTab';
import EditorToolbar from './EditorToolbar';
import Button from './EditorButton';
import makeMinimise from './make-minimise';

const MAX_ITEMS = 4;

const { makeMotion, makeTransitionHOC, withMouseTracker, withSelectionControls, withContainerSize, EditorActions } = Pydio.requireLib('hoc');

const styles = {
    selectionButtonLeft: {
        position: "absolute",
        top: "calc(50% - 18px)",
        left: "40px"
    },
    selectionButtonRight: {
        position: "absolute",
        top: "calc(50% - 18px)",
        right: "40px"
    },
    iconSelectionButton: {
        borderRadius: "50%",
        width: "36px",
        height: "36px",
        lineHeight: "36px",
        backgroundColor: "rgb(0, 0, 0, 0.87)",
        color: "rgb(255, 255,255, 0.87)"
    },
    toolbar: {
        default: {
            top: 0,
            left: 0,
            right: 0,
            flexShrink: 0
        }
    }
}

// MAIN COMPONENT
@makeTransitionHOC({translateY: 800}, {translateY: 0})
@withMouseTracker()
@withSelectionControls(({tab}) => tab.browseable)
@connect(mapStateToProps, EditorActions)
@makeMotion({scale: 1}, {scale: 0}, {
    check: (props) => props.isMinimised,
    style: (props) => props.minimiseStyle
})
export default class Editor extends React.Component {

    handleBlurOnSelection(e) {
        const {editorModify} = this.props

        editorModify({focusOnSelection: false})
    }

    handleFocusOnSelection(e) {
        const {editorModify} = this.props

        editorModify({focusOnSelection: true})

        e.preventDefault()
        e.stopPropagation()

        return false;
    }

    renderChild() {
        const {activeTab, tabs} = this.props

        const filteredTabs = tabs.filter(({editorData}) => editorData)

        return filteredTabs.map((tab, index) => {
            let style = {
                display: "flex",
                width: (100 / MAX_ITEMS) + "%",
                height: "40%",
                margin: "10px",
                overflow: "hidden",
                whiteSpace: "nowrap"
            }

            if (filteredTabs.length > MAX_ITEMS) {
                if (index < MAX_ITEMS) {
                    style.flex = 1
                } else {
                    style.flex = 0
                    style.margin = 0
                }
            }

            if (activeTab) {
                if (tab.id === activeTab.id) {
                    style.margin = 0
                    style.flex = 1
                } else {
                    style.flex = 0
                    style.margin = 0
                }
            }

            return <Tab key={`editortab${tab.id}`} id={tab.id} style={{...style}} />
        })
    }

    render() {
        const {style, activeTab, fixedToolbar, hideToolbar, hideSelectionControls, prevSelectionDisabled, nextSelectionDisabled, onSelectPrev, onSelectNext} = this.props

        let parentStyle = {
            display: "flex",
            flex: 1,
            overflow: "hidden",
            width: "100%",
            height: "100%",
            position: "relative"
        }

        if (!activeTab) {
            parentStyle = {
                ...parentStyle,
                alignItems: "center", // To fix a bug in Safari, we only set it when height not = 100% (aka when there is no active tab)
                justifyContent: "center"
            }
        }

        const paperStyle = {
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            backgroundColor: 'transparent',
            borderRadius: 0,
            ...style
        };

        let toolbarStyle = styles.toolbar.default

        return (
            <Paper zDepth={5} style={paperStyle} onClick={(e) => this.handleBlurOnSelection(e)}>
                {!hideToolbar && (
                    <EditorToolbar style={toolbarStyle} display={fixedToolbar ? "fixed" : "removable"} />
                )}

                <div className="body" style={parentStyle} onClick={(e) => this.handleFocusOnSelection(e)}>
                    {this.props.transitionEnded && this.renderChild()}
                </div>

                {!hideSelectionControls && onSelectPrev && (
                    <Button
                        iconClassName="mdi mdi-chevron-left"
                        style={styles.selectionButtonLeft}
                        iconStyle={styles.iconSelectionButton}
                        disabled={prevSelectionDisabled}
                        onClick={() => onSelectPrev()}
                    />
                )}
                {!hideSelectionControls && onSelectNext && (
                    <Button
                        iconClassName="mdi mdi-chevron-right"
                        style={styles.selectionButtonRight}
                        iconStyle={styles.iconSelectionButton}
                        disabled={nextSelectionDisabled}
                        onClick={() => onSelectNext()}
                    />
                )}
            </Paper>
        );
    }
};

// REDUX - Then connect the redux store
function mapStateToProps(state, ownProps) {
    const { editor = {}, tabs = [] } = state
    const { activeTabId = -1, isMinimised = false, fixedToolbar = false, focusOnSelection = false } = editor

    const activeTab = tabs.filter(tab => tab.id === activeTabId)[0]

    return  {
        ...ownProps,
        fixedToolbar: fixedToolbar,
        hideToolbar: !fixedToolbar && focusOnSelection && !ownProps.isNearTop,
        hideSelectionControls: focusOnSelection && !ownProps.isNearTop && !ownProps.isNearLeft && ! ownProps.isNearRight,
        activeTab,
        tabs,
        isMinimised,
    }
}

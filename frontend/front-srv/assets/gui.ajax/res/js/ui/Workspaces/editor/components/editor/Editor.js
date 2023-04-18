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
import React from 'react'
import Pydio from 'pydio'
import { connect } from 'react-redux';
import { Paper } from 'material-ui';
import Tab from './EditorTab';
import EditorToolbar from './EditorToolbar';
import Button from './EditorButton';

const { getActiveTab, makeMotion, makeTransitionHOC, withMouseTracker, withSelectionControls, EditorActions } = Pydio.requireLib('hoc');

const styles = {
    selectionButtonLeft: {
        zIndex: 3,
        position: "absolute",
        top: "calc(50% - 18px)",
        left: "40px"
    },
    selectionButtonRight: {
        zIndex: 3,
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

function buttonStyleVisible(rootStyle, visible) {
    if (visible) {
        return {...rootStyle, opacity: 1}
    } else {
        return rootStyle
    }
}

// MAIN COMPONENT
@makeTransitionHOC({translateY: 800}, {translateY: 0})
@withMouseTracker()
@withSelectionControls
@connect(mapStateToProps, EditorActions)
@makeMotion({scale: 1}, {scale: 0}, {
    check: (props) => props.isMinimised,
    style: (props) => props.minimiseStyle
})
class Editor extends React.Component {

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
        const {activeTab} = this.props
        return <Tab id={activeTab.id} />
    }

    render() {
        const {style, activeTab, fixedToolbar, hideToolbar, tabDeleteAll, hideSelectionControls, prevSelectionDisabled, nextSelectionDisabled, onSelectPrev, onSelectNext} = this.props

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

        let toolbarStyle = styles.toolbar.default;
        let keyPress;
        if(onSelectNext || onSelectPrev) {
            keyPress = (e) => {
                if(e.key === 'ArrowLeft' && onSelectPrev && !prevSelectionDisabled) {
                    try{
                        onSelectPrev();
                    }catch(e){}
                } else if(e.key === 'ArrowRight' && onSelectNext && !nextSelectionDisabled){
                    try{
                        onSelectNext();
                    }catch (e) {}
                } else if(e.key === 'Escape' && tabDeleteAll){
                    tabDeleteAll();
                }
            }
        }

        return (
            <Paper zDepth={5} style={paperStyle} onClick={(e) => this.handleBlurOnSelection(e)} tabIndex={"-1"} onKeyDown={keyPress}>

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
}

// REDUX - Then connect the redux store
function mapStateToProps(state, ownProps) {
    const { editor = {}, tabs = [] } = state
    const { isMinimised = false, fixedToolbar = false, focusOnSelection = false } = editor

    return  {
        ...ownProps,
        fixedToolbar: fixedToolbar,
        hideToolbar: !ownProps.displayToolbar || (!fixedToolbar && focusOnSelection && !ownProps.isNearTop),
        hideSelectionControls: !ownProps.browseable || (focusOnSelection && !ownProps.isNearTop && !ownProps.isNearLeft && ! ownProps.isNearRight),
        activeTab: getActiveTab(state),
        tabs,
        isMinimised,
    }
}

export default Editor
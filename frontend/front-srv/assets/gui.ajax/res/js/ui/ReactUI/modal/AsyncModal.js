const React = require('react');
const createReactClass = require('create-react-class');
import AsyncComponent from '../AsyncComponent'
import PydioContextConsumer from '../PydioContextConsumer'
const {FlatButton, Dialog} = require('material-ui')
import CSSBlurBackground, {bgCoverFromScreenRatio} from './CSSBlurBackground'

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

import DOMUtils from "pydio/util/dom";

/**
 * Specific AsyncComponent for Modal Dialog
 */
let AsyncModal = createReactClass({
    displayName: 'AsyncModal',

    propTypes: {
        size:       PropTypes.oneOf(['xxs', 'xs', 'sm', 'md', 'md+', 'lg', 'xl']),
        padding:    PropTypes.bool,
        bgBlur:     PropTypes.bool
    },

    sizes: {
        'xxs': {width: 120},
        'xs': {width: 210},
        'sm': {width: 320},
        'md': {width: 420},
        'md+': {width: 520},
        'lg': {width: 720},
        'xl': {width: '80%'}
    },

    styles: {
        dialogRoot: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            padding: '0px !important'
        },
        dialogContent: {
            position: 'relative',
            paddingTop: 0,
            paddingBottom: 0,
            transform: ""
        },
        dialogBody: {
            paddingTop: 0,
            paddingBottom: 0
        },
        dialogTitle: {
        }
    },

    blurStyles:{
        overlayStyle:{
            backgroundColor: 'rgba(0,0,0,0)'
        },
        dialogContent: {

        },
        dialogTitle:{
            color: 'rgba(255,255,255,0.9)'
        },
        dialogBody:{
            color: 'rgba(255,255,255,0.9)',
            paddingTop: 24
        }
    },

    getInitialState:function(){
        const {open, size, padding} = this.props;
        return {
            async: true,
            componentData: null,
            open: !!open,
            actions: [],
            title: null,
            size: size || 'md',
            dialogWidth: size ? this.sizes[size].width : 420,
            padding: !!padding,
            blur: false
        }
    },

    componentWillUnmount: function(){
        this.deactivateResizeObserver();
        if(this._crtPercentSizeObserver){
            DOMUtils.stopObservingWindowResize(this._crtPercentSizeObserver);
            this._crtPercentSizeObserver = null;
        }
    },

    activateResizeObserver: function(){
        return;

        if(this._resizeObserver) return;
        this._resizeObserver = () => {this.computeBackgroundData()};
        DOMUtils.observeWindowResize(this._resizeObserver);
        this.computeBackgroundData();
    },

    deactivateResizeObserver: function(){
        return;

        if(this._resizeObserver){
            DOMUtils.stopObservingWindowResize(this._resizeObserver);
            this._resizeObserver = null;
        }
    },

    componentWillReceiveProps: function(nextProps) {

        const componentData = nextProps.componentData;
        let state = {
            componentData:componentData,
            async:true,
            actions:[],
            title:null,
            open: !!nextProps.open,
            blur: !!nextProps.blur || ( componentData && componentData.payload && componentData.payload.blur )
        };
        if(componentData && (!componentData instanceof Object || !componentData['namespace'])){
            state['async'] = false;
            const compState = this.initModalFromComponent(componentData, true);
            state = {...state, ...compState};
        }
        if(this.refs.modalAsync){
            this.refs.modalAsync.loadFired = false;
        }
        this.setState(state);

    },

    updateButtons(actions){
        this.setState({actions: actions});
    },

    initModalFromComponent(component, returnState = false) {
        let state = {};
        const prepareState = (s) => { state = {...state, ...s} };

        if(component.getButtons) {
            const buttons = component.getButtons(this.updateButtons.bind(this));
            if(buttons && buttons.length){
                prepareState({actions:buttons});
            }
        } else if(component.getSubmitCallback || component.getCancelCallback || component.getNextCallback) {
            let actions = [];
            const blur = this.state && this.state.blur;
            if(component.getCancelCallback){
                actions.push(
                    <FlatButton
                        key="cancel"
                        label={this.props.getMessage('49')}
                        primary={false}
                        onClick={component.getCancelCallback()}
                    />);
            }
            if(component.getSubmitCallback){
                actions.push(<FlatButton
                    label={this.props.getMessage('48')}
                    primary={!blur}
                    secondary={blur}
                    keyboardFocused={true}
                    onClick={component.getSubmitCallback()}
                />);
            }
            if(component.getNextCallback){
                actions.push(<FlatButton
                    label="Next"
                    primary={!blur}
                    secondary={blur}
                    keyboardFocused={true}
                    onClick={component.getNextCallback()}
                />);
            }
            prepareState({actions: actions});
        }
        if(component.getTitle){
            prepareState({title: component.getTitle()});
        }
        if(component.getSize){
            const size = component.getSize();
            if(this._crtPercentSizeObserver){
                DOMUtils.stopObservingWindowResize(this._crtPercentSizeObserver);
                this._crtPercentSizeObserver = null;
            }
            const width = this.sizes[size].width;
            if(width.indexOf && width.indexOf('%') > 0){
                const percent = parseInt(width.replace('%', ''));
                this._crtPercentSizeObserver = () => {
                    prepareState({
                        dialogWidth: DOMUtils.getViewportWidth() * percent / 100,
                        dialogHeight: DOMUtils.getViewportHeight() * percent / 100
                    });
                };
                DOMUtils.observeWindowResize(this._crtPercentSizeObserver);
                this._crtPercentSizeObserver();
            }else{
                prepareState({dialogWidth: width, dialogHeight: 0});
            }
        }
        if(component.getPadding){
            prepareState({padding: component.getPadding()});
        }
        if(component.scrollBody && component.scrollBody()){
            prepareState({scrollBody:true});
        }else{
            prepareState({scrollBody:false});
        }
        if(component.setModal){
            component.setModal(this);
        }
        if(component.isModal){
            prepareState({modal: component.isModal()});
        }else{
            prepareState({modal:false});
        }
        if(component.useBlur){
            prepareState({blur: component.useBlur()});
        }else{
            prepareState({blur: false});
        }
        if(component.dialogBodyStyle){
            prepareState({dialogBodyStyle: component.dialogBodyStyle()});
        } else {
            prepareState({dialogBodyStyle: null});
        }

        if(returnState) {
            return state;
        } else {
            this.setState(state);
        }
    },

    computeBackgroundData: function(){
        const pydioMainElement = document.getElementById(window.pydio.Parameters.get('MAIN_ELEMENT'));
        const reference = pydioMainElement.querySelector('div[data-reactroot]');
        if(!reference){
            return;
        }
        const url = window.getComputedStyle(reference).getPropertyValue('background-image');

        let backgroundImage = new Image();
        backgroundImage.src = url.replace(/"/g,"").replace(/url\(|\)$/ig, "");

        let oThis = this;
        backgroundImage.onload = function() {
            oThis.setState({
                backgroundImage: url,
                backgroundSize: bgCoverFromScreenRatio(this.width, this.height)
            });
        };
    },

    render: function() {

        let modalContent;

        const { state, styles, blurStyles } = this
        const { async, componentData, title, actions, modal, open, dialogWidth, padding, scrollBody, blur, dialogBodyStyle } = state
        let { className } = state;

        if (componentData) {
            if(async) {
                modalContent =
                    <AsyncComponent
                        {...this.props}
                        namespace={componentData.namespace}
                        componentName={componentData.compName}
                        ref="modalAsync"
                        onLoad={this.initModalFromComponent}
                        dismiss={this.hide}
                        modalData={{modal:this, payload: componentData['payload']}}
                    />
            } else {
                modalContent = componentData;
            }
        }

        let maxWidth = dialogWidth;
        if(this.props.pydio.UI.MOBILE_EXTENSIONS){
            maxWidth = blur ? '97%' : '87%';
        }
        let dialogRoot = {...styles.dialogRoot}
        let dialogBody = {...styles.dialogBody, display:'flex'}
        let dialogContent = {...styles.dialogContent, width: dialogWidth, maxWidth: maxWidth}
        if(state.dialogHeight){
            dialogContent.minHeight = dialogBody.minHeight = state.dialogHeight;
        }else{
            dialogContent.minHeight = dialogBody.minHeight = null;
        }
        let dialogTitle = {...styles.dialogTitle}
        let overlayStyle;

        if (!padding) {
            dialogRoot = {...dialogRoot, padding: 0}
            dialogBody = {...dialogBody, padding: 0}
            dialogContent = {...dialogContent, padding: 0}
        }

        if (title === "") {
            dialogTitle = {...dialogTitle, display: 'none'}
        }

        if(blur){

            overlayStyle = {...blurStyles.overlayStyle};
            dialogContent = {...dialogContent, ...blurStyles.dialogContent};
            dialogBody = {...dialogBody, ...blurStyles.dialogBody};
            dialogTitle = {...dialogTitle, ...blurStyles.dialogTitle};
            className = className ? className + ' dialogRootBlur' : 'dialogRootBlur';
            dialogRoot = {...dialogRoot, backgroundImage:'', backgroundPosition:'center center', backgroundSize:'cover'}

            modalContent = <span><CSSBlurBackground/>{modalContent}</span>

        }
        if(dialogBodyStyle){
            dialogBody = {...dialogBody, ...dialogBodyStyle};
        }

        return (
            <Dialog
                ref="dialog"
                title={title}
                actions={actions}
                modal={modal}
                className={className}
                open={open}
                contentClassName={className}
                repositionOnUpdate={false}
                autoScrollBodyContent={scrollBody}
                onRequestClose={this.props.onDismiss}

                contentStyle={dialogContent}
                bodyStyle={dialogBody}
                titleStyle={dialogTitle}
                style={dialogRoot}
                overlayStyle={overlayStyle}
            >{modalContent}</Dialog>
        );
    },
});

AsyncModal = PydioContextConsumer(AsyncModal)

export {AsyncModal as default}

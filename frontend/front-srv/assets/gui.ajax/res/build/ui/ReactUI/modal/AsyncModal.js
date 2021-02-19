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

'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AsyncComponent = require('../AsyncComponent');

var _AsyncComponent2 = _interopRequireDefault(_AsyncComponent);

var _PydioContextConsumer = require('../PydioContextConsumer');

var _PydioContextConsumer2 = _interopRequireDefault(_PydioContextConsumer);

var _CSSBlurBackground = require('./CSSBlurBackground');

var _CSSBlurBackground2 = _interopRequireDefault(_CSSBlurBackground);

var _pydioUtilDom = require("pydio/util/dom");

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

/**
 * Specific AsyncComponent for Modal Dialog
 */
var React = require('react');
var createReactClass = require('create-react-class');

var _require = require('material-ui');

var FlatButton = _require.FlatButton;
var Dialog = _require.Dialog;
var AsyncModal = createReactClass({
    displayName: 'AsyncModal',

    propTypes: {
        size: React.PropTypes.oneOf(['xxs', 'xs', 'sm', 'md', 'lg', 'xl']),
        padding: React.PropTypes.bool,
        bgBlur: React.PropTypes.bool
    },

    sizes: {
        'xxs': { width: 120 },
        'xs': { width: 210 },
        'sm': { width: 320 },
        'md': { width: 420 },
        'lg': { width: 720 },
        'xl': { width: '80%' }
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
        dialogTitle: {}
    },

    blurStyles: {
        overlayStyle: {
            backgroundColor: 'rgba(0,0,0,0)'
        },
        dialogContent: {},
        dialogTitle: {
            color: 'rgba(255,255,255,0.9)'
        },
        dialogBody: {
            color: 'rgba(255,255,255,0.9)',
            paddingTop: 24
        }
    },

    getInitialState: function getInitialState() {
        return {
            async: true,
            componentData: null,
            open: !!this.props.open,
            actions: [],
            title: null,
            size: this.props.size || 'md',
            dialogWidth: this.props.size ? this.sizes[this.props.size].width : 420,
            padding: !!this.props.padding,
            blur: false
        };
    },

    componentWillUnmount: function componentWillUnmount() {
        this.deactivateResizeObserver();
        if (this._crtPercentSizeObserver) {
            _pydioUtilDom2['default'].stopObservingWindowResize(this._crtPercentSizeObserver);
            this._crtPercentSizeObserver = null;
        }
    },

    activateResizeObserver: function activateResizeObserver() {
        var _this = this;

        return;

        if (this._resizeObserver) return;
        this._resizeObserver = function () {
            _this.computeBackgroundData();
        };
        _pydioUtilDom2['default'].observeWindowResize(this._resizeObserver);
        this.computeBackgroundData();
    },

    deactivateResizeObserver: function deactivateResizeObserver() {
        return;

        if (this._resizeObserver) {
            _pydioUtilDom2['default'].stopObservingWindowResize(this._resizeObserver);
            this._resizeObserver = null;
        }
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {

        var componentData = nextProps.componentData;
        var state = {
            componentData: componentData,
            async: true,
            actions: [],
            title: null,
            open: !!nextProps.open,
            blur: !!nextProps.blur || componentData && componentData.payload && componentData.payload.blur
        };
        if (componentData && (!componentData instanceof Object || !componentData['namespace'])) {
            state['async'] = false;
            var compState = this.initModalFromComponent(componentData, true);
            state = _extends({}, state, compState);
        }
        if (this.refs.modalAsync) {
            this.refs.modalAsync.loadFired = false;
        }
        this.setState(state);
    },

    updateButtons: function updateButtons(actions) {
        this.setState({ actions: actions });
    },

    initModalFromComponent: function initModalFromComponent(component) {
        var _this2 = this;

        var returnState = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        var state = {};
        var prepareState = function prepareState(s) {
            state = _extends({}, state, s);
        };

        if (component.getButtons) {
            var buttons = component.getButtons(this.updateButtons.bind(this));
            if (buttons && buttons.length) {
                prepareState({ actions: buttons });
            }
        } else if (component.getSubmitCallback || component.getCancelCallback || component.getNextCallback) {
            var actions = [];
            var _blur = this.state && this.state.blur;
            if (component.getCancelCallback) {
                actions.push(React.createElement(FlatButton, {
                    key: 'cancel',
                    label: this.props.getMessage('49'),
                    primary: false,
                    onTouchTap: component.getCancelCallback()
                }));
            }
            if (component.getSubmitCallback) {
                actions.push(React.createElement(FlatButton, {
                    label: this.props.getMessage('48'),
                    primary: !_blur,
                    secondary: _blur,
                    keyboardFocused: true,
                    onTouchTap: component.getSubmitCallback()
                }));
            }
            if (component.getNextCallback) {
                actions.push(React.createElement(FlatButton, {
                    label: 'Next',
                    primary: !_blur,
                    secondary: _blur,
                    keyboardFocused: true,
                    onTouchTap: component.getNextCallback()
                }));
            }
            prepareState({ actions: actions });
        }
        if (component.getTitle) {
            prepareState({ title: component.getTitle() });
        }
        if (component.getSize) {
            var size = component.getSize();
            if (this._crtPercentSizeObserver) {
                _pydioUtilDom2['default'].stopObservingWindowResize(this._crtPercentSizeObserver);
                this._crtPercentSizeObserver = null;
            }
            var width = this.sizes[size].width;
            if (width.indexOf && width.indexOf('%') > 0) {
                (function () {
                    var percent = parseInt(width.replace('%', ''));
                    _this2._crtPercentSizeObserver = function () {
                        prepareState({
                            dialogWidth: _pydioUtilDom2['default'].getViewportWidth() * percent / 100,
                            dialogHeight: _pydioUtilDom2['default'].getViewportHeight() * percent / 100
                        });
                    };
                    _pydioUtilDom2['default'].observeWindowResize(_this2._crtPercentSizeObserver);
                    _this2._crtPercentSizeObserver();
                })();
            } else {
                prepareState({ dialogWidth: width, dialogHeight: 0 });
            }
        }
        if (component.getPadding) {
            prepareState({ padding: component.getPadding() });
        }
        if (component.scrollBody && component.scrollBody()) {
            prepareState({ scrollBody: true });
        } else {
            prepareState({ scrollBody: false });
        }
        if (component.setModal) {
            component.setModal(this);
        }
        if (component.isModal) {
            prepareState({ modal: component.isModal() });
        } else {
            prepareState({ modal: false });
        }
        if (component.useBlur) {
            prepareState({ blur: component.useBlur() });
        } else {
            prepareState({ blur: false });
        }
        if (component.dialogBodyStyle) {
            prepareState({ dialogBodyStyle: component.dialogBodyStyle() });
        } else {
            prepareState({ dialogBodyStyle: null });
        }

        if (returnState) {
            return state;
        } else {
            this.setState(state);
        }
    },

    computeBackgroundData: function computeBackgroundData() {
        var pydioMainElement = document.getElementById(window.pydio.Parameters.get('MAIN_ELEMENT'));
        var reference = pydioMainElement.querySelector('div[data-reactroot]');
        if (!reference) {
            return;
        }
        var url = window.getComputedStyle(reference).getPropertyValue('background-image');

        var backgroundImage = new Image();
        backgroundImage.src = url.replace(/"/g, "").replace(/url\(|\)$/ig, "");

        var oThis = this;
        backgroundImage.onload = function () {
            oThis.setState({
                backgroundImage: url,
                backgroundSize: _CSSBlurBackground.bgCoverFromScreenRatio(this.width, this.height)
            });
        };
    },

    render: function render() {

        var modalContent = undefined;

        var state = this.state;
        var styles = this.styles;
        var blurStyles = this.blurStyles;
        var async = state.async;
        var componentData = state.componentData;
        var title = state.title;
        var actions = state.actions;
        var modal = state.modal;
        var open = state.open;
        var dialogWidth = state.dialogWidth;
        var padding = state.padding;
        var scrollBody = state.scrollBody;
        var blur = state.blur;
        var dialogBodyStyle = state.dialogBodyStyle;
        var className = state.className;

        if (componentData) {
            if (async) {
                modalContent = React.createElement(_AsyncComponent2['default'], _extends({}, this.props, {
                    namespace: componentData.namespace,
                    componentName: componentData.compName,
                    ref: 'modalAsync',
                    onLoad: this.initModalFromComponent,
                    dismiss: this.hide,
                    modalData: { modal: this, payload: componentData['payload'] }
                }));
            } else {
                modalContent = componentData;
            }
        }

        var maxWidth = dialogWidth;
        if (this.props.pydio.UI.MOBILE_EXTENSIONS) {
            maxWidth = blur ? '97%' : '87%';
        }
        var dialogRoot = _extends({}, styles.dialogRoot);
        var dialogBody = _extends({}, styles.dialogBody, { display: 'flex' });
        var dialogContent = _extends({}, styles.dialogContent, { width: dialogWidth, maxWidth: maxWidth });
        if (state.dialogHeight) {
            dialogContent.minHeight = dialogBody.minHeight = state.dialogHeight;
        } else {
            dialogContent.minHeight = dialogBody.minHeight = null;
        }
        var dialogTitle = _extends({}, styles.dialogTitle);
        var overlayStyle = undefined;

        if (!padding) {
            dialogRoot = _extends({}, dialogRoot, { padding: 0 });
            dialogBody = _extends({}, dialogBody, { padding: 0 });
            dialogContent = _extends({}, dialogContent, { padding: 0 });
        }

        if (title === "") {
            dialogTitle = _extends({}, dialogTitle, { display: 'none' });
        }

        if (blur) {

            overlayStyle = _extends({}, blurStyles.overlayStyle);
            dialogContent = _extends({}, dialogContent, blurStyles.dialogContent);
            dialogBody = _extends({}, dialogBody, blurStyles.dialogBody);
            dialogTitle = _extends({}, dialogTitle, blurStyles.dialogTitle);
            className = className ? className + ' dialogRootBlur' : 'dialogRootBlur';
            dialogRoot = _extends({}, dialogRoot, { backgroundImage: '', backgroundPosition: 'center center', backgroundSize: 'cover' });

            modalContent = React.createElement(
                'span',
                null,
                React.createElement(_CSSBlurBackground2['default'], null),
                modalContent
            );
        }
        if (dialogBodyStyle) {
            dialogBody = _extends({}, dialogBody, dialogBodyStyle);
        }

        return React.createElement(
            Dialog,
            {
                ref: 'dialog',
                title: title,
                actions: actions,
                modal: modal,
                className: className,
                open: open,
                contentClassName: className,
                repositionOnUpdate: false,
                autoScrollBodyContent: scrollBody,
                onRequestClose: this.props.onDismiss,

                contentStyle: dialogContent,
                bodyStyle: dialogBody,
                titleStyle: dialogTitle,
                style: dialogRoot,
                overlayStyle: overlayStyle
            },
            modalContent
        );
    }
});

exports['default'] = AsyncModal = _PydioContextConsumer2['default'](AsyncModal);

exports['default'] = AsyncModal;
module.exports = exports['default'];

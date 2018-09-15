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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _TourGuide = require('./TourGuide');

var _TourGuide2 = _interopRequireDefault(_TourGuide);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var DOMUtils = require('pydio/util/dom');

var Scheme = (function (_Component) {
    _inherits(Scheme, _Component);

    function Scheme() {
        _classCallCheck(this, Scheme);

        _Component.apply(this, arguments);
    }

    Scheme.prototype.render = function render() {
        var style = {
            position: 'relative',
            fontSize: 24,
            width: this.props.dimension || 100,
            height: this.props.dimension || 100,
            backgroundColor: '#ECEFF1',
            color: '#607d8b',
            borderRadius: '50%',
            margin: '0 auto'
        };
        return React.createElement(
            'div',
            { style: _extends({}, style, this.props.style) },
            this.props.children
        );
    };

    return Scheme;
})(_react.Component);

var IconScheme = (function (_Component2) {
    _inherits(IconScheme, _Component2);

    function IconScheme(props) {
        _classCallCheck(this, IconScheme);

        _Component2.call(this, props);
        this.state = { icon: props.icon || props.icons[0], index: 0 };
    }

    IconScheme.prototype.componentDidMount = function componentDidMount() {
        this.componentWillReceiveProps(this.props);
    };

    IconScheme.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        var _this = this;

        var icon = nextProps.icon;
        var icons = nextProps.icons;

        if (this._interval) clearInterval(this._interval);

        var state = undefined;
        if (icon) {
            state = { icon: icon };
        } else if (icons) {
            state = { icon: icons[0], index: 0 };
            this._interval = setInterval(function () {
                _this.nextIcon();
            }, 1700);
        }
        this.setState(state);
    };

    IconScheme.prototype.nextIcon = function nextIcon() {
        var icons = this.props.icons;

        var next = this.state.index + 1;
        if (next > icons.length - 1) next = 0;
        this.setState({ index: next, icon: icons[next] });
    };

    IconScheme.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this._interval) clearInterval(this._interval);
    };

    IconScheme.prototype.render = function render() {
        var icon = this.state.icon;

        return React.createElement(
            Scheme,
            { dimension: 80 },
            React.createElement('span', { className: "mdi mdi-" + icon, style: { position: 'absolute', top: 14, left: 14, fontSize: 50 } })
        );
    };

    return IconScheme;
})(_react.Component);

var CreateMenuCard = (function (_Component3) {
    _inherits(CreateMenuCard, _Component3);

    function CreateMenuCard() {
        _classCallCheck(this, CreateMenuCard);

        _Component3.apply(this, arguments);
    }

    CreateMenuCard.prototype.componentDidMount = function componentDidMount() {
        var _this2 = this;

        setTimeout(function () {
            _this2.props.pydio.notify('tutorial-open-create-menu');
        }, 950);
    };

    CreateMenuCard.prototype.render = function render() {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'p',
                null,
                this.props.message('create-menu')
            ),
            React.createElement(IconScheme, { icons: ['file-plus', 'folder-plus'] })
        );
    };

    return CreateMenuCard;
})(_react.Component);

var InfoPanelCard = (function (_Component4) {
    _inherits(InfoPanelCard, _Component4);

    function InfoPanelCard() {
        _classCallCheck(this, InfoPanelCard);

        _Component4.apply(this, arguments);
    }

    InfoPanelCard.prototype.componentDidMount = function componentDidMount() {
        var _this3 = this;

        this._int = setInterval(function () {
            _this3.setState({ closed: !(_this3.state && _this3.state.closed) });
        }, 1500);
    };

    InfoPanelCard.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this._int) clearInterval(this._int);
    };

    InfoPanelCard.prototype.render = function render() {
        var leftStyle = { width: 24, transition: DOMUtils.getBeziersTransition(), transform: 'scaleX(1)', transformOrigin: 'right' };
        if (this.state && this.state.closed) {
            leftStyle = _extends({}, leftStyle, { width: 0, transform: 'scaleX(0)' });
        }

        return React.createElement(
            'div',
            null,
            React.createElement(
                'p',
                null,
                this.props.message('infopanel.1')
            ),
            React.createElement(
                Scheme,
                { style: { fontSize: 10, padding: 25 }, dimension: 130 },
                React.createElement(
                    'div',
                    { style: { boxShadow: '2px 2px 0px #CFD8DC', display: 'flex' } },
                    React.createElement(
                        'div',
                        { style: { backgroundColor: 'white', flex: 3 } },
                        React.createElement(
                            'div',
                            null,
                            React.createElement('span', { className: 'mdi mdi-folder' }),
                            ' ',
                            this.props.message('infopanel.folder'),
                            ' 1 '
                        ),
                        React.createElement(
                            'div',
                            { style: { backgroundColor: '#03a9f4', color: 'white' } },
                            React.createElement('span', { className: 'mdi mdi-folder' }),
                            '  ',
                            this.props.message('infopanel.folder'),
                            ' 2'
                        ),
                        React.createElement(
                            'div',
                            null,
                            React.createElement('span', { className: 'mdi mdi-file' }),
                            ' ',
                            this.props.message('infopanel.file'),
                            ' 3'
                        ),
                        React.createElement(
                            'div',
                            null,
                            React.createElement('span', { className: 'mdi mdi-file' }),
                            ' ',
                            this.props.message('infopanel.file'),
                            ' 4'
                        )
                    ),
                    React.createElement(
                        'div',
                        { style: leftStyle },
                        React.createElement(
                            'div',
                            { style: { backgroundColor: '#edf4f7', padding: 4, height: '100%', fontSize: 17 } },
                            React.createElement('span', { className: 'mdi mdi-information-variant' })
                        )
                    )
                )
            ),
            React.createElement(
                'p',
                null,
                this.props.message('infopanel.2'),
                ' (',
                React.createElement('span', { className: 'mdi mdi-information', style: { fontSize: 18, color: '#5c7784' } }),
                ').'
            )
        );
    };

    return InfoPanelCard;
})(_react.Component);

var UserWidgetCard = (function (_Component5) {
    _inherits(UserWidgetCard, _Component5);

    function UserWidgetCard() {
        _classCallCheck(this, UserWidgetCard);

        _Component5.apply(this, arguments);
    }

    UserWidgetCard.prototype.render = function render() {
        var iconStyle = {
            display: 'inline-block',
            textAlign: 'center',
            fontSize: 17,
            lineHeight: '20px',
            backgroundColor: '#ECEFF1',
            color: '#607D8B',
            borderRadius: '50%',
            padding: '5px 6px',
            width: 30,
            height: 30,
            marginRight: 5
        };
        return React.createElement(
            'div',
            null,
            React.createElement(
                'p',
                null,
                React.createElement('span', { className: 'mdi mdi-book-open-variant', style: iconStyle }),
                ' ',
                this.props.message('uwidget.addressbook')
            ),
            React.createElement(_materialUi.Divider, null),
            React.createElement(
                'p',
                null,
                React.createElement('span', { className: 'mdi mdi-bell-outline', style: iconStyle }),
                ' ',
                this.props.message('uwidget.alerts')
            ),
            React.createElement(_materialUi.Divider, null),
            React.createElement(
                'p',
                null,
                React.createElement('span', { className: 'mdi mdi-dots-vertical', style: iconStyle }),
                ' ',
                this.props.message('uwidget.menu')
            ),
            React.createElement(_materialUi.Divider, null),
            React.createElement(
                'p',
                null,
                React.createElement('span', { className: 'mdi mdi-home-variant', style: iconStyle }),
                ' ',
                this.props.message('uwidget.home')
            )
        );
    };

    return UserWidgetCard;
})(_react.Component);

var WelcomeTour = (function (_Component6) {
    _inherits(WelcomeTour, _Component6);

    function WelcomeTour(props, context) {
        _classCallCheck(this, WelcomeTour);

        _Component6.call(this, props, context);
        this.state = { started: !(props.pydio.user && !props.pydio.user.getPreference('gui_preferences', true)['UserAccount.WelcomeModal.Shown']) };
    }

    WelcomeTour.prototype.discard = function discard() {
        var finished = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
        var user = this.props.pydio.user;

        var guiPrefs = user.getPreference('gui_preferences', true);
        guiPrefs['UserAccount.WelcomeModal.Shown'] = true;
        if (finished) guiPrefs['WelcomeComponent.Pydio8.TourGuide.FSTemplate'] = true;
        user.setPreference('gui_preferences', guiPrefs, true);
        user.savePreference('gui_preferences');
    };

    WelcomeTour.prototype.componentDidMount = function componentDidMount() {
        var _this4 = this;

        if (!this.state.started) {
            pydio.UI.openComponentInModal('UserAccount', 'WelcomeModal', {
                onRequestStart: function onRequestStart(skip) {
                    if (skip) {
                        _this4.discard(true);
                    } else {
                        _this4.discard();
                        _this4.setState({ started: true, skip: skip });
                    }
                }
            });
        }
    };

    WelcomeTour.prototype.render = function render() {
        var _this5 = this;

        if (!this.state.started || this.state.skip) {
            return null;
        }
        var _props = this.props;
        var getMessage = _props.getMessage;
        var pydio = _props.pydio;

        var message = function message(id) {
            return getMessage('ajax_gui.tour.' + id);
        };

        var tourguideSteps = [];
        var Controller = pydio.Controller;
        var user = pydio.user;

        var mkdir = Controller.getActionByName("mkdir") || {};
        var upload = Controller.getActionByName("upload") || {};
        if (user && user.activeRepository && (!mkdir.deny || !upload.deny)) {
            tourguideSteps.push({
                title: message('create-menu.title'),
                text: React.createElement(CreateMenuCard, { message: message, pydio: this.props.pydio }),
                selector: '#create-button-menu',
                position: 'left',
                style: { width: 220 }
            });
        }

        tourguideSteps = tourguideSteps.concat([{
            title: message('display-bar.title'),
            text: React.createElement(
                'div',
                null,
                React.createElement(
                    'p',
                    null,
                    message('display-bar')
                ),
                React.createElement(IconScheme, { icons: ['view-list', 'view-grid', 'view-carousel', 'sort-ascending', 'sort-descending'] })
            ),
            selector: '#display-toolbar',
            position: 'left'
        }, {
            title: message('infopanel.title'),
            text: React.createElement(InfoPanelCard, { message: message }),
            selector: '#info_panel',
            position: 'left'
        }, {
            title: message('uwidget.title'),
            text: React.createElement(UserWidgetCard, { message: message }),
            selector: '.user-widget',
            position: 'right',
            style: { width: 320 }
        }]);
        var callback = function callback(data) {
            if (data.type === 'step:after' && data.index === tourguideSteps.length - 1) {
                _this5.discard(true);
            }
        };
        return React.createElement(_TourGuide2['default'], {
            ref: 'joyride',
            steps: tourguideSteps,
            run: true, // or some other boolean for when you want to start it
            autoStart: true,
            debug: false,
            callback: callback,
            type: 'continuous'
        });
    };

    return WelcomeTour;
})(_react.Component);

exports['default'] = WelcomeTour = PydioContextConsumer(WelcomeTour);
exports['default'] = WelcomeTour;
module.exports = exports['default'];

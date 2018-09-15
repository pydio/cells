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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var AsyncComponent = _Pydio$requireLib.AsyncComponent;
var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var Scheme = (function (_Component) {
    _inherits(Scheme, _Component);

    function Scheme() {
        _classCallCheck(this, Scheme);

        _get(Object.getPrototypeOf(Scheme.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Scheme, [{
        key: 'render',
        value: function render() {
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
        }
    }]);

    return Scheme;
})(_react.Component);

var WorkspacesCard = function WorkspacesCard(props) {

    var renderRay = function renderRay(angle) {
        return React.createElement(
            'div',
            { style: { position: 'absolute', top: 52, left: 20, width: 80, display: 'flex', transformOrigin: 'left', transform: 'rotate(' + -angle + 'deg)' } },
            React.createElement('span', { style: { flex: 1 } }),
            React.createElement('span', { className: 'mdi mdi-dots-horizontal', style: { opacity: .5, marginRight: 5 } }),
            React.createElement('span', { style: { display: 'inline-block', transform: 'rotate(' + angle + 'deg)' }, className: 'mdi mdi-account' })
        );
    };

    return React.createElement(
        'div',
        null,
        React.createElement(
            'p',
            null,
            props.message('workspaces.1')
        ),
        React.createElement(
            Scheme,
            { dimension: 130 },
            React.createElement('span', { style: { position: 'absolute', top: 52, left: 20 }, className: 'mdi mdi-network' }),
            renderRay(30),
            renderRay(0),
            renderRay(-30)
        ),
        React.createElement(
            'p',
            null,
            props.message('workspaces.2')
        ),
        React.createElement(
            Scheme,
            { dimension: 130 },
            React.createElement('span', { className: 'mdi mdi-account', style: { position: 'absolute', left: 54, top: 32 } }),
            React.createElement(
                'div',
                { style: { position: 'absolute', top: 60, left: 30 } },
                React.createElement('span', { className: 'mdi mdi-folder' }),
                React.createElement('span', { className: 'mdi mdi-arrow-right' }),
                React.createElement('span', { className: 'mdi mdi-network' })
            )
        )
    );
};

var SearchCard = function SearchCard(props) {

    return React.createElement(
        'div',
        null,
        React.createElement(
            'p',
            null,
            props.message('globsearch.1')
        ),
        React.createElement(
            Scheme,
            { style: { fontSize: 10, padding: 25 }, dimension: 130 },
            React.createElement(
                'div',
                { style: { boxShadow: '2px 2px 0px #CFD8DC' } },
                React.createElement(
                    'div',
                    { style: { backgroundColor: '#03a9f4', color: 'white', borderRadius: '3px 3px 0 0' } },
                    React.createElement('span', { className: 'mdi mdi-magnify' }),
                    props.message('infopanel.search'),
                    '...'
                ),
                React.createElement(
                    'div',
                    { style: { backgroundColor: 'white' } },
                    React.createElement(
                        'div',
                        null,
                        React.createElement('span', { className: 'mdi mdi-folder' }),
                        ' ',
                        props.message('infopanel.folder'),
                        ' 1 '
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('span', { className: 'mdi mdi-folder' }),
                        '  ',
                        props.message('infopanel.file'),
                        ' 2'
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement('span', { className: 'mdi mdi-file' }),
                        ' ',
                        props.message('infopanel.file'),
                        ' 3'
                    )
                )
            )
        ),
        React.createElement(
            'p',
            null,
            props.message('globsearch.2')
        )
    );
};

var WidgetsCard = function WidgetsCard(props) {

    return React.createElement(
        'div',
        null,
        React.createElement(
            'p',
            null,
            props.message('widget-cards')
        ),
        React.createElement(
            Scheme,
            null,
            React.createElement('img', { src: 'plug/access.homepage/res/images/movecards.gif', style: { height: 70, margin: '15px 30px' } })
        )
    );
};

var WelcomeTour = (function (_Component2) {
    _inherits(WelcomeTour, _Component2);

    function WelcomeTour(props, context) {
        _classCallCheck(this, WelcomeTour);

        _get(Object.getPrototypeOf(WelcomeTour.prototype), 'constructor', this).call(this, props, context);
        this.state = { started: !(props.pydio.user && !props.pydio.user.getPreference('gui_preferences', true)['UserAccount.WelcomeModal.Shown']) };
    }

    _createClass(WelcomeTour, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            if (!this.state.started) {
                pydio.UI.openComponentInModal('UserAccount', 'WelcomeModal', {
                    onRequestStart: function onRequestStart(skip) {
                        if (skip) {
                            _this.discard(true);
                        } else {
                            _this.discard(false);
                            _this.setState({ started: true });
                        }
                    }
                });
            }
        }
    }, {
        key: 'discard',
        value: function discard() {
            var finished = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
            var user = this.props.pydio.user;

            var guiPrefs = user.getPreference('gui_preferences', true);
            guiPrefs['UserAccount.WelcomeModal.Shown'] = true;
            if (finished) guiPrefs['WelcomeComponent.Pydio8.TourGuide.Welcome'] = true;
            user.setPreference('gui_preferences', guiPrefs, true);
            user.savePreference('gui_preferences');
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            if (!this.state.started) {
                return null;
            }
            var getMessage = this.props.getMessage;

            var message = function message(id) {
                return getMessage('ajax_gui.tour.' + id);
            };
            var widgetBarEnabled = !!!this.props.pydio.getPluginConfigs('access.homepage').get('DISABLE_WIDGET_BAR');

            var tourguideSteps = [{
                title: message('workspaces.title'),
                text: React.createElement(WorkspacesCard, { message: message }),
                selector: '.user-workspaces-list',
                position: 'right'
            }, {
                title: message('globsearch.title'),
                text: React.createElement(SearchCard, { message: message }),
                selector: '.home-search-form',
                position: 'bottom'
            }];
            if (this.props.pydio.user) {
                var hasAccessRepo = false;
                this.props.pydio.user.getRepositoriesList().forEach(function (entry) {
                    if (entry.accessType === "gateway") {
                        hasAccessRepo = true;
                    }
                });
                if (hasAccessRepo) {
                    tourguideSteps.push({
                        title: message('openworkspace.title'),
                        text: message('openworkspace'),
                        selector: '.workspace-entry',
                        position: 'right'
                    });
                }
            }

            var callback = function callback(data) {
                if (data.type === 'step:after' && data.index === tourguideSteps.length - 1) {
                    _this2.discard(true);
                }
            };
            return React.createElement(AsyncComponent, {
                namespace: 'PydioWorkspaces',
                componentName: 'TourGuide',
                ref: 'joyride',
                steps: tourguideSteps,
                run: true, // or some other boolean for when you want to start it
                autoStart: true,
                debug: false,
                callback: callback,
                type: 'continuous'
            });
        }
    }]);

    return WelcomeTour;
})(_react.Component);

exports['default'] = WelcomeTour = PydioContextConsumer(WelcomeTour);

exports['default'] = WelcomeTour;
module.exports = exports['default'];

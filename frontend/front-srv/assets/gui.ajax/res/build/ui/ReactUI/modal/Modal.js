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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _AsyncModal = require('./AsyncModal');

var _AsyncModal2 = _interopRequireDefault(_AsyncModal);

var _require = require('react');

var Component = _require.Component;

var Modal = (function (_Component) {
    _inherits(Modal, _Component);

    function Modal(props, context) {
        _classCallCheck(this, Modal);

        _Component.call(this, props, context);
        this.state = { open: false };
    }

    Modal.prototype.activityObserver = function activityObserver(activityState) {
        if (activityState.activeState === 'warning') {
            if (this.state.open && this.state.modalData && this.state.modalData.compName === 'ActivityWarningDialog') {
                return;
            }
            this.open('PydioReactUI', 'ActivityWarningDialog', { activityState: activityState });
        } else {
            this.setState({ open: false, modalData: null });
        }
    };

    Modal.prototype.componentDidMount = function componentDidMount() {
        var pydio = this.props.pydio;

        pydio.UI.registerModalOpener(this);
        this._activityObserver = this.activityObserver.bind(this);
        pydio.observe('activity_state_change', this._activityObserver);
    };

    Modal.prototype.componentWillUnmount = function componentWillUnmount() {
        var pydio = this.props.pydio;

        pydio.UI.unregisterModalOpener();
        pydio.stopObserving('activity_state_change', this._activityObserver);
    };

    Modal.prototype.open = function open(namespace, component, props) {
        this.setState({
            open: true,
            modalData: {
                namespace: namespace,
                compName: component,
                payload: props
            }
        });
    };

    Modal.prototype.handleLoad = function handleLoad() {
        this.setState({ open: true });
    };

    Modal.prototype.handleClose = function handleClose() {
        var _this = this;

        if (this.state.open && this.state.modalData && this.state.modalData.compName === 'ActivityWarningDialog') {
            this.props.pydio.notify('user_activity');
        }
        this.setState({ open: false, closing: true }, function () {
            // Take transition time into account - triggers a render so that if it
            // has been reopened in between, it correctly shows the new dialog
            setTimeout(function () {
                _this.setState({ closing: false });
            }, 450);
        });
    };

    Modal.prototype.render = function render() {
        return React.createElement(_AsyncModal2['default'], {
            ref: 'modal',
            open: this.state.open,
            componentData: this.state.modalData,
            onLoad: this.handleLoad.bind(this),
            onDismiss: this.handleClose.bind(this)
        });
    };

    return Modal;
})(Component);

exports['default'] = Modal;
module.exports = exports['default'];

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

var _redux = require('redux');

var _AsyncComponent = require('./AsyncComponent');

var _AsyncComponent2 = _interopRequireDefault(_AsyncComponent);

var _BackgroundImage = require('./BackgroundImage');

var _BackgroundImage2 = _interopRequireDefault(_BackgroundImage);

// Animations
var originStyles = { opacity: 0 };
var targetStyles = { opacity: 1 };
var enterAnimation = { stiffness: 350, damping: 28 };

var Template = function Template(_ref) {
    var style = _ref.style;
    var id = _ref.id;
    var pydio = _ref.pydio;
    var children = _ref.children;

    var userIsActive = function userIsActive() {
        pydio.notify('user_activity');
    };
    return React.createElement(
        'div',
        {
            style: style,
            id: id,
            onMouseMove: userIsActive,
            onMouseOver: userIsActive,
            onKeyDown: userIsActive },
        children
    );
};

/*
Template = compose (
    PydioHOCs.Animations.makeTransition(originStyles, targetStyles, enterAnimation)
)(Template)
*/

var TemplateBuilder = (function (_React$Component) {
    _inherits(TemplateBuilder, _React$Component);

    function TemplateBuilder() {
        _classCallCheck(this, TemplateBuilder);

        _React$Component.apply(this, arguments);
    }

    TemplateBuilder.prototype.render = function render() {

        var pydio = this.props.pydio;
        var containerId = this.props.containerId;

        var components = [];
        var style = {
            display: "flex",
            flex: 1
        };

        if (this.props.imageBackgroundFromConfigs) {
            if (_BackgroundImage2['default'].SESSION_IMAGE) {
                style = _BackgroundImage2['default'].SESSION_IMAGE;
            } else {
                style = _BackgroundImage2['default'].getImageBackgroundFromConfig(this.props.imageBackgroundFromConfigs);
                _BackgroundImage2['default'].SESSION_IMAGE = style;
            }
        }

        var parts = XMLUtils.XPathSelectNodes(pydio.getXmlRegistry(), "client_configs/template_part[@component]");
        parts.map((function (node) {
            if (node.getAttribute("theme") && node.getAttribute("theme") != pydio.Parameters.get("theme")) {
                return;
            }
            if (containerId !== node.getAttribute("ajxpId")) {
                return;
            }

            var namespace = node.getAttribute("namespace");
            var componentName = node.getAttribute("component");

            var props = {};
            if (node.getAttribute("props")) {
                props = JSON.parse(node.getAttribute("props"));
            }
            props['pydio'] = pydio;

            components.push(React.createElement(_AsyncComponent2['default'], _extends({
                key: namespace,
                namespace: namespace,
                componentName: componentName,
                noLoader: true,
                style: style
            }, props)));
        }).bind(this));

        return React.createElement(
            Template,
            { style: style, id: this.props.containerId, pydio: pydio },
            components
        );
    };

    return TemplateBuilder;
})(React.Component);

TemplateBuilder.propTypes = {
    pydio: React.PropTypes.instanceOf(Pydio),
    containerId: React.PropTypes.string
};

exports['default'] = TemplateBuilder;
module.exports = exports['default'];

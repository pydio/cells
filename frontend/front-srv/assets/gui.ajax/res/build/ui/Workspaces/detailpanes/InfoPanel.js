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

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _require$requireLib = require('pydio').requireLib('hoc');

var Animations = _require$requireLib.Animations;
var withVerticalScroll = _require$requireLib.withVerticalScroll;

var originStyles = { translateX: 600 };
var targetStyles = { translateX: 0 };

var Template = function Template(_ref) {
    var id = _ref.id;
    var style = _ref.style;
    var children = _ref.children;

    return _react2['default'].createElement(
        'div',
        { id: id, style: style },
        children
    );
};

/*
Template = compose(
    Animations.makeAsync,
    Animations.makeTransition(originStyles, targetStyles),
)(Template)
*/

var InfoPanel = (function (_React$Component) {
    _inherits(InfoPanel, _React$Component);

    function InfoPanel(props) {
        _classCallCheck(this, InfoPanel);

        _React$Component.call(this, props);

        var initTemplates = ConfigsParser.parseConfigs();
        this._updateExpected = true;

        this.state = {
            templates: initTemplates,
            displayData: this.selectionToTemplates(initTemplates)
        };
    }

    InfoPanel.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
        return this._updateExpected;
    };

    InfoPanel.prototype.componentDidMount = function componentDidMount() {
        var _this = this;

        var scrollerRefresh = function scrollerRefresh() {
            try {
                _this.context.scrollArea.refresh();
            } catch (e) {}
        };
        this._updateHandler = function () {
            _this._updateExpected = true;
            _this.setState({ displayData: _this.selectionToTemplates() }, function () {
                _this._updateExpected = false;
                if (_this.context.scrollArea) setTimeout(scrollerRefresh, 750);
            });
        };
        this._componentConfigHandler = function () {
            _this._updateExpected = true;
            _this.setState({ templates: ConfigsParser.parseConfigs() }, function () {
                _this._updateExpected = false;
                if (_this.context.scrollArea) setTimeout(scrollerRefresh, 750);
            });
        };

        this.props.pydio.observe("actions_refreshed", this._updateHandler);
        this.props.pydio.observe("selection_reloaded", this._updateHandler);
        this.props.pydio.observe("registry_loaded", this._componentConfigHandler);

        // Trigger contentChange
        if (this.state.displayData && this.state.displayData.TEMPLATES && this.props.onContentChange) {
            this.props.onContentChange(this.state.displayData.TEMPLATES.length);
        }
    };

    InfoPanel.prototype.componentWillUnmount = function componentWillUnmount() {
        this.props.pydio.stopObserving("actions_refreshed", this._updateHandler);
        this.props.pydio.observe("selection_reloaded", this._updateHandler);
        this.props.pydio.stopObserving("registry_loaded", this._componentConfigHandler);
    };

    InfoPanel.prototype.selectionToTemplates = function selectionToTemplates() {
        var initTemplates = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        var refTemplates = initTemplates || this.state.templates;
        var dataModel = this.props.dataModel;

        var selection = dataModel.getSelectedNodes();
        if ((!selection || !selection.length) && dataModel.getContextNode() === dataModel.getRootNode()) {
            selection = [dataModel.getContextNode()];
        }
        var primaryMime = undefined,
            templates = [],
            uniqueNode = undefined;
        var data = {};
        if (!selection || selection.length < 1) {
            primaryMime = 'no_selection';
        } else if (selection.length > 1) {
            primaryMime = 'generic_multiple';
            data.nodes = selection;
        } else {
            uniqueNode = selection[0];
            if (uniqueNode.isLeaf()) {
                primaryMime = 'generic_file';
            } else {
                primaryMime = 'generic_dir';
                if (this.props.dataModel.getRootNode() === uniqueNode) {
                    primaryMime = 'ajxp_root_node';
                }
            }
            data.node = uniqueNode;
        }
        if (refTemplates.has(primaryMime)) {
            templates = templates.concat(refTemplates.get(primaryMime));
        }
        if (uniqueNode) {
            refTemplates.forEach(function (list, mimeName) {
                if (mimeName === primaryMime) return;
                if (mimeName.indexOf('meta:') === 0 && uniqueNode.getMetadata().has(mimeName.substr(5))) {
                    templates = templates.concat(list);
                } else if (uniqueNode.getAjxpMime() === mimeName) {
                    templates = templates.concat(list);
                }
            });
        }

        if (this.props.onContentChange && !initTemplates) {
            this.props.onContentChange(templates.length);
        }
        templates.sort(function (a, b) {
            return a.WEIGHT === b.WEIGHT ? 0 : a.WEIGHT > b.WEIGHT ? 1 : -1;
        });
        return { TEMPLATES: templates, DATA: data };
    };

    InfoPanel.prototype.render = function render() {
        var _this2 = this;

        var templates = this.state.displayData.TEMPLATES.map(function (tpl, i) {
            var component = tpl.COMPONENT;

            var _component$split = component.split('.', 2);

            var namespace = _component$split[0];
            var name = _component$split[1];

            return _react2['default'].createElement(PydioReactUI.AsyncComponent, _extends({}, _this2.state.displayData.DATA, _this2.props, {
                key: "ip_" + component,
                namespace: namespace,
                componentName: name
            }));
        });
        return _react2['default'].createElement(
            Template,
            { style: this.props.style },
            templates
        );
    };

    return InfoPanel;
})(_react2['default'].Component);

InfoPanel.propTypes = {
    dataModel: _react2['default'].PropTypes.instanceOf(PydioDataModel).isRequired,
    pydio: _react2['default'].PropTypes.instanceOf(Pydio).isRequired,
    style: _react2['default'].PropTypes.object
};

InfoPanel.contextTypes = {
    scrollArea: _react2['default'].PropTypes.object
};

exports['default'] = InfoPanel = withVerticalScroll(InfoPanel, { id: "info_panel" });

var ConfigsParser = (function () {
    function ConfigsParser() {
        _classCallCheck(this, ConfigsParser);
    }

    ConfigsParser.parseConfigs = function parseConfigs() {

        var configs = new Map();
        var panelsNodes = XMLUtils.XPathSelectNodes(pydio.getXmlRegistry(), 'client_configs/component_config[@component="InfoPanel"]/infoPanel');
        var panels = new Map();
        panelsNodes.forEach(function (node) {
            if (!node.getAttribute('reactComponent')) {
                return;
            }
            var mimes = node.getAttribute('mime').split(',');
            var component = node.getAttribute('reactComponent');
            mimes.map(function (mime) {
                if (!panels.has(mime)) panels.set(mime, []);
                panels.get(mime).push({
                    COMPONENT: component,
                    THEME: node.getAttribute('theme'),
                    ATTRIBUTES: node.getAttribute('attributes'),
                    WEIGHT: node.getAttribute('weight') ? parseInt(node.getAttribute('weight')) : 0
                });
            });
        });
        return panels;
    };

    return ConfigsParser;
})();

exports['default'] = InfoPanel;
module.exports = exports['default'];

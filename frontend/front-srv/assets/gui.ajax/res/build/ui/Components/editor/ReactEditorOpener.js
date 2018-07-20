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

"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var propTypes = {
    node: React.PropTypes.instanceOf(AjxpNode).isRequired,
    registry: React.PropTypes.instanceOf(Registry).isRequired,
    editorData: React.PropTypes.object.isRequired,
    icon: React.PropTypes.bool
};

var defaultProps = {
    icon: false
};

var ReactEditorOpener = (function (_React$Component) {
    _inherits(ReactEditorOpener, _React$Component);

    function ReactEditorOpener(props) {
        _classCallCheck(this, ReactEditorOpener);

        _React$Component.call(this, props);

        var node = props.node;
        var editorData = props.editorData;

        this.state = {
            ready: false
        };
    }

    ReactEditorOpener.prototype.componentDidMount = function componentDidMount() {
        var _this = this;

        var _props = this.props;
        var editorData = _props.editorData;
        var registry = _props.registry;

        registry.loadEditorResources(editorData.resourcesManager, function () {
            return _this.setState({ ready: true });
        });
    };

    ReactEditorOpener.prototype.render = function render() {
        var editorData = this.props.editorData;
        var ready = this.state.ready;

        if (!ready) return null;

        var EditorClass = null;
        if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
            return React.createElement(
                "div",
                null,
                "Cannot find editor component (" + editorData.editorClass + ")!"
            );
        }

        // Getting HOC of the class
        return React.createElement(EditorClass.Editor, this.props);
    };

    return ReactEditorOpener;
})(React.Component);

ReactEditorOpener.propTypes = propTypes;
ReactEditorOpener.defaultProps = defaultProps;

exports["default"] = ReactEditorOpener;
module.exports = exports["default"];

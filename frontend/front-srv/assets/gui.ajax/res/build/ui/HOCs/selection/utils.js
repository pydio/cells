"use strict";

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var mapStateToProps = function mapStateToProps(state, props) {
    var editor = state.editor;
    var tabs = state.tabs;

    var tab = tabs.reduce(function (current, tab) {
        return tab.id === editor.activeTabId ? tab : current;
    }, {});

    return _extends({}, props, {
        tab: tab
    });
};
exports.mapStateToProps = mapStateToProps;

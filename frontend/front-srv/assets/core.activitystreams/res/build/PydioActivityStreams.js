(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioActivityStreams = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactMarkdown = require('react-markdown');

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _DocLink = require('./DocLink');

var _DocLink2 = _interopRequireDefault(_DocLink);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var UserAvatar = _Pydio$requireLib.UserAvatar;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib2.PydioContextConsumer;

var _Pydio$requireLib3 = _pydio2['default'].requireLib('workspaces');

var FilePreview = _Pydio$requireLib3.FilePreview;

var _Pydio$requireLib4 = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib4.moment;

var Paragraph = (function (_React$Component) {
    _inherits(Paragraph, _React$Component);

    function Paragraph() {
        _classCallCheck(this, Paragraph);

        _get(Object.getPrototypeOf(Paragraph.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Paragraph, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'span',
                null,
                this.props.children
            );
        }
    }]);

    return Paragraph;
})(_react2['default'].Component);

function workspacesLocations(pydio, object) {
    var workspaces = [];
    if (!object.partOf || !object.partOf.items || !object.partOf.items.length) {
        return "No workspace found";
    }

    var _loop = function (i) {
        var ws = object.partOf.items[i];
        // Remove slug part
        //let paths = ws.rel.split('/');
        //paths.shift();
        //let relPath = paths.join('/');
        workspaces.push(_react2['default'].createElement(
            'a',
            { key: ws.id, onClick: function () {
                    return pydio.triggerRepositoryChange(ws.id);
                }, style: { cursor: 'pointer' } },
            ws.name
        ));
        workspaces.push(_react2['default'].createElement(
            'span',
            { key: ws.id + '-sep' },
            ', '
        ));
    };

    for (var i = 0; i < object.partOf.items.length; i++) {
        _loop(i);
    }
    workspaces.pop();
    return _react2['default'].createElement(
        'span',
        null,
        pydio.MessageHash['notification_center.16'],
        ' ',
        _react2['default'].createElement(
            'span',
            null,
            workspaces
        )
    );
}

function LinkWrapper(pydio, activity) {
    var style = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];

    return (function (_React$Component2) {
        _inherits(Wrapped, _React$Component2);

        function Wrapped() {
            _classCallCheck(this, Wrapped);

            _get(Object.getPrototypeOf(Wrapped.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(Wrapped, [{
            key: 'render',
            value: function render() {
                var _props = this.props;
                var href = _props.href;
                var children = _props.children;

                var linkStyle = _extends({
                    cursor: 'pointer',
                    color: 'rgb(66, 140, 179)',
                    fontWeight: 500
                }, style);
                var title = "";
                var onClick = null;
                if (href.startsWith('doc://')) {
                    if (activity.type === 'Delete') {
                        return _react2['default'].createElement(
                            'a',
                            { style: { textDecoration: 'line-through' } },
                            children
                        );
                    } else {
                        return _react2['default'].createElement(
                            _DocLink2['default'],
                            { pydio: pydio, activity: activity, linkStyle: linkStyle },
                            children
                        );
                    }
                } else if (href.startsWith('user://')) {
                    var userId = href.replace('user://', '');
                    return _react2['default'].createElement(UserAvatar, { userId: userId, displayAvatar: false, richOnClick: true, style: _extends({}, linkStyle, { display: 'inline-block' }), pydio: pydio });
                } else if (href.startsWith('workspaces://')) {
                    (function () {
                        var wsId = href.replace('workspaces://', '');
                        if (pydio.user && pydio.user.getRepositoriesList().get(wsId)) {
                            onClick = function () {
                                pydio.triggerRepositoryChange(wsId);
                            };
                        }
                    })();
                }
                return _react2['default'].createElement(
                    'a',
                    { title: title, style: linkStyle, onClick: onClick },
                    children
                );
            }
        }]);

        return Wrapped;
    })(_react2['default'].Component);
}

var Activity = (function (_React$Component3) {
    _inherits(Activity, _React$Component3);

    function Activity() {
        _classCallCheck(this, Activity);

        _get(Object.getPrototypeOf(Activity.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Activity, [{
        key: 'computeIcon',
        value: function computeIcon(activity) {
            var className = '';
            var title = undefined;
            switch (activity.type) {
                case "Create":
                    if (activity.object.type === 'Document') {
                        className = "file-plus";
                    } else {
                        className = "folder-plus";
                    }
                    title = "Created";
                    break;
                case "Delete":
                    className = "delete";
                    title = "Deleted";
                    break;
                case "Edit":
                case "Update":
                    className = "pencil";
                    title = "Modified";
                    break;
                case "UpdateMeta":
                    className = "tag-multiple";
                    title = "Modified";
                    break;
                case "UpdateComment":
                    className = "message-outline";
                    title = "Commented";
                    break;
                case "Read":
                    className = "eye";
                    title = "Accessed";
                    break;
                case "Move":
                    className = "file-send";
                    title = "Moved";
                    break;
                case "Share":
                    className = "share-variant";
                    if (activity.object.type === "Cell") {
                        className = "icomoon-cells";
                    } else if (activity.object.type === "Workspace") {
                        className = "folder";
                    }
                    title = "Shared";
                    break;
                default:
                    break;
            }
            if (className.indexOf('icomoon-') === -1) {
                className = 'mdi mdi-' + className;
            }
            return { title: title, className: className };
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var activity = _props2.activity;
            var listContext = _props2.listContext;
            var displayContext = _props2.displayContext;
            var oneLiner = _props2.oneLiner;
            var muiTheme = _props2.muiTheme;

            var secondary = activity.type + " - " + activity.actor.name;
            if (activity.summary) {
                secondary = _react2['default'].createElement(_reactMarkdown2['default'], { source: activity.summary, renderers: { 'paragraph': Paragraph, 'link': LinkWrapper(pydio, activity, { color: 'inherit' }) } });
            }

            var summary = undefined,
                summaryStyle = undefined;
            var actionIcon = undefined;
            var blockStyle = {
                margin: '0px 10px 6px'
            };
            if (displayContext === 'popover') {
                summaryStyle = {
                    fontSize: 13,
                    color: 'rgba(0,0,0,0.53)',
                    margin: '6px 0',
                    padding: 6
                };
            } else {
                summaryStyle = {
                    padding: '6px 22px 12px',
                    marginTop: 6,
                    borderRadius: 2,
                    borderLeft: '2px solid #e0e0e0',
                    marginLeft: 13,
                    color: 'rgba(0,0,0,0.33)',
                    /*fontWeight: 500,
                    fontStyle: 'italic',*/
                    overflow: 'hidden'
                };
            }

            var _computeIcon = this.computeIcon(activity);

            var title = _computeIcon.title;
            var className = _computeIcon.className;

            if (listContext === 'NODE-LEAF') {

                blockStyle = { margin: '16px 10px' };
                actionIcon = _react2['default'].createElement(_materialUi.FontIcon, { className: className, title: title, style: { fontSize: 17, color: 'rgba(0,0,0,0.17)' } });
            } else {

                if (displayContext === 'popover') {
                    blockStyle = { margin: 0 };
                    var nodes = (0, _DocLink.nodesFromObject)(activity.object, pydio);
                    var icon = undefined,
                        primaryText = undefined;
                    if (nodes.length) {
                        var previewStyles = {
                            style: {
                                height: 36,
                                width: 36,
                                borderRadius: '50%'
                            },
                            mimeFontStyle: {
                                fontSize: 20,
                                lineHeight: '36px',
                                textAlign: 'center'
                            }
                        };
                        icon = _react2['default'].createElement(
                            'div',
                            { style: { padding: '12px 20px 12px 20px', position: 'relative' } },
                            _react2['default'].createElement(FilePreview, _extends({ pydio: pydio, node: nodes[0], loadThumbnail: true }, previewStyles)),
                            _react2['default'].createElement('span', { className: className, style: { position: 'absolute', bottom: 8, right: 12, fontSize: 18, color: muiTheme.palette.accent2Color } })
                        );
                        primaryText = nodes[0].getLabel() || _pydioUtilPath2['default'].getBasename(nodes[0].getPath());
                    } else {
                        icon = _react2['default'].createElement(
                            'div',
                            { style: { margin: '12px 20px 12px 20px', backgroundColor: 'rgb(237, 240, 242)', alignItems: 'initial', height: 36, width: 36, borderRadius: '50%', textAlign: 'center' } },
                            _react2['default'].createElement(_materialUi.FontIcon, { className: className, style: { lineHeight: '36px', color: muiTheme.palette.accent2Color } })
                        );
                        primaryText = activity.object.name;
                    }
                    summary = _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'flex-start', overflow: 'hidden', paddingBottom: 8 } },
                        icon,
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 1, overflow: 'hidden', paddingRight: 16 } },
                            _react2['default'].createElement(
                                'div',
                                { style: { marginTop: 12, marginBottom: 2, fontSize: 15, color: 'rgba(0,0,0,.87)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' } },
                                primaryText
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { color: 'rgba(0,0,0,.33)' } },
                                secondary
                            )
                        )
                    );
                } else {
                    summary = _react2['default'].createElement(
                        'div',
                        { style: summaryStyle },
                        secondary
                    );
                }
            }

            return _react2['default'].createElement(
                'div',
                { style: blockStyle },
                !oneLiner && _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(UserAvatar, {
                        useDefaultAvatar: true,
                        userId: activity.actor.id,
                        userLabel: activity.actor.name,
                        displayLocalLabel: true,
                        userType: 'user',
                        pydio: pydio,
                        style: { display: 'flex', alignItems: 'center', maxWidth: '60%' },
                        labelStyle: { fontSize: 14, paddingLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                        avatarStyle: { flexShrink: 0 },
                        avatarSize: 28,
                        richOnHover: true
                    }),
                    _react2['default'].createElement(
                        'span',
                        { style: { fontSize: 13, display: 'inline-block', flex: 1, height: 18, color: 'rgba(0,0,0,0.23)', fontWeight: 500, paddingLeft: 8, whiteSpace: 'nowrap' } },
                        moment(activity.updated).fromNow()
                    ),
                    actionIcon
                ),
                summary
            );
        }
    }]);

    return Activity;
})(_react2['default'].Component);

Activity.PropTypes = {
    activity: _propTypes2['default'].object,
    listContext: _propTypes2['default'].string,
    displayContext: _propTypes2['default'].oneOf(['infoPanel', 'popover'])
};

exports['default'] = Activity = (0, _materialUiStyles.muiThemeable)()(Activity);
exports['default'] = Activity = PydioContextConsumer(Activity);
exports['default'] = Activity;
module.exports = exports['default'];

},{"./DocLink":5,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","prop-types":"prop-types","pydio":"pydio","pydio/util/path":"pydio/util/path","react":"react","react-markdown":"react-markdown"}],2:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Client = require('./Client');

var _Client2 = _interopRequireDefault(_Client);

var _Activity = require('./Activity');

var _Activity2 = _interopRequireDefault(_Activity);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;
var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var EmptyStateView = _Pydio$requireLib2.EmptyStateView;

var ActivityList = (function (_React$Component) {
    _inherits(ActivityList, _React$Component);

    function ActivityList(props) {
        _classCallCheck(this, ActivityList);

        _get(Object.getPrototypeOf(ActivityList.prototype), 'constructor', this).call(this, props);
        if (props.items) {
            this.state = { data: { items: props.items }, offset: 0, loadMore: false, loading: false };
        } else {
            this.state = { data: [], offset: 0, loadMore: true, loading: false };
        }
    }

    _createClass(ActivityList, [{
        key: 'mergeMoreFeed',
        value: function mergeMoreFeed(currentFeed, newFeed) {
            var currentIds = currentFeed.items.map(function (item) {
                return item.id;
            });
            var filtered = newFeed.items.filter(function (item) {
                return currentIds.indexOf(item.id) === -1;
            });
            if (!filtered.length) {
                this.setState({ loadMore: false });
                return currentFeed;
            }
            var merged = currentFeed;
            merged.items = [].concat(_toConsumableArray(currentFeed.items), _toConsumableArray(filtered));
            merged.totalItems = merged.items.length;
            return merged;
        }
    }, {
        key: 'loadForProps',
        value: function loadForProps(props) {
            var _this = this;

            var context = props.context;
            var pointOfView = props.pointOfView;
            var contextData = props.contextData;
            var limit = props.limit;
            var _state = this.state;
            var offset = _state.offset;
            var data = _state.data;

            if (limit === undefined) {
                limit = -1;
            }
            if (offset > 0) {
                limit = 100;
            }
            this.setState({ loading: true, error: null });
            _Client2['default'].loadActivityStreams(context, contextData, 'outbox', pointOfView, offset, limit).then(function (json) {
                if (offset > 0 && data && data.items) {
                    if (json && json.items) _this.setState({ data: _this.mergeMoreFeed(data, json) });
                } else {
                    _this.setState({ data: json });
                }
                if (!json || !json.items || !json.items.length) {
                    _this.setState({ loadMore: false });
                }
                _this.setState({ loading: false });
            })['catch'](function (msg) {
                _this.setState({ loading: false, error: msg });
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props;
            var items = _props.items;
            var contextData = _props.contextData;

            if (items) {
                return;
            }
            if (contextData) {
                this.loadForProps(this.props);
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this2 = this;

            if (nextProps.items) {
                this.setState({ data: { items: nextProps.items }, offset: 0, loadMore: false });
                return;
            }
            if (nextProps.contextData !== this.props.contextData || nextProps.context !== this.props.context) {
                this.setState({ offset: 0, loadMore: true }, function () {
                    _this2.loadForProps(nextProps);
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var content = [];
            var _state2 = this.state;
            var data = _state2.data;
            var loadMore = _state2.loadMore;
            var loading = _state2.loading;
            var error = _state2.error;
            var _props2 = this.props;
            var listContext = _props2.listContext;
            var groupByDate = _props2.groupByDate;
            var displayContext = _props2.displayContext;
            var pydio = _props2.pydio;

            var previousFrom = undefined;
            var emptyStateIcon = "mdi mdi-pulse";
            var emptyStateString = loading ? pydio.MessageHash['notification_center.17'] : pydio.MessageHash['notification_center.18'];
            if (error) {
                emptyStateString = error.Detail || error.msg || error;
                emptyStateIcon = "mdi mdi-alert-circle-outline";
            }
            if (data !== null && data.items) {
                data.items.forEach(function (ac, i) {

                    var fromNow = moment(ac.updated).fromNow();
                    if (groupByDate && fromNow !== previousFrom) {
                        if (content.length) {
                            content.pop(); // remove last divider
                            content.push(_react2['default'].createElement(
                                'div',
                                { style: { padding: '20px 16px 0', fontSize: 13, color: 'rgba(147, 168, 178, 0.67)', fontWeight: 500 } },
                                fromNow
                            ));
                        } else {
                            content.push(_react2['default'].createElement(
                                'div',
                                { style: { padding: '0 16px', fontSize: 13, color: 'rgba(147, 168, 178, 0.67)', fontWeight: 500 } },
                                fromNow
                            ));
                        }
                    }
                    content.push(_react2['default'].createElement(_Activity2['default'], { key: ac.id, activity: ac, listContext: listContext, oneLiner: groupByDate, displayContext: displayContext }));
                    if (groupByDate) {
                        previousFrom = fromNow;
                        content.push(_react2['default'].createElement('div', { style: { borderTop: '1px solid rgba(0,0,0,.03)', width: '100%' } }));
                    }
                });
                if (groupByDate) {
                    content.pop(); // remove last divider
                }
            }
            if (content.length && loadMore) {
                var loadAction = function loadAction() {
                    _this3.setState({ offset: data.items.length + 1 }, function () {
                        _this3.loadForProps(_this3.props);
                    });
                };
                content.push(_react2['default'].createElement(
                    'div',
                    { style: { paddingLeft: 16 } },
                    _react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: loading ? pydio.MessageHash['notification_center.20'] : pydio.MessageHash['notification_center.19'], disabled: loading, onClick: loadAction })
                ));
            }
            if (content.length) {
                return _react2['default'].createElement(
                    _materialUi.List,
                    { style: this.props.style },
                    content
                );
            } else {
                var style = { backgroundColor: 'transparent' };
                var iconStyle = undefined,
                    legendStyle = undefined;
                if (displayContext === 'popover') {
                    style = _extends({}, style, { minHeight: 250 });
                } else if (displayContext === 'infoPanel') {
                    style = _extends({}, style, { paddingBottom: 20 });
                    iconStyle = { fontSize: 40 };
                    legendStyle = { fontSize: 13, fontWeight: 400 };
                }
                return _react2['default'].createElement(EmptyStateView, {
                    pydio: this.props.pydio,
                    iconClassName: emptyStateIcon,
                    primaryTextId: emptyStateString,
                    style: style,
                    iconStyle: iconStyle,
                    legendStyle: legendStyle
                });
            }
        }
    }]);

    return ActivityList;
})(_react2['default'].Component);

ActivityList.PropTypes = {
    context: _propTypes2['default'].string,
    contextData: _propTypes2['default'].string,
    boxName: _propTypes2['default'].string,
    pointOfView: _propTypes2['default'].oneOf(['GENERIC', 'ACTOR', 'SUBJECT']),
    displayContext: _propTypes2['default'].oneOf(['mainList', 'infoPanel', 'popover'])
};

exports['default'] = ActivityList = PydioContextConsumer(ActivityList);
exports['default'] = ActivityList;
module.exports = exports['default'];

},{"./Activity":1,"./Client":4,"material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","react":"react"}],3:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'toggleWatch',
        value: function toggleWatch(manager, args) {

            if (args) {
                (function () {

                    var node = pydio.getUserSelection().getUniqueNode();
                    var nodeUuid = node.getMetadata().get('uuid');
                    var userId = pydio.user.id;
                    var subscription = new _cellsSdk.ActivitySubscription();
                    var type = new _cellsSdk.ActivityOwnerType();
                    subscription.UserId = userId;
                    subscription.ObjectId = nodeUuid;
                    subscription.ObjectType = type.NODE;
                    var events = [];
                    if (args === 'watch_change' || args === 'watch_both') {
                        events.push('change');
                    }
                    if (args === 'watch_read' || args === 'watch_both') {
                        events.push('read');
                    }
                    subscription.Events = events;
                    var api = new _cellsSdk.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
                    api.subscribe(subscription).then(function (outSub) {
                        var overlay = node.getMetadata().get('overlay_class') || '';
                        if (args === 'watch_stop') {
                            node.getMetadata()['delete']('meta_watched');
                            node.getMetadata().set('overlay_class', overlay.replace('mdi mdi-bell', ''));
                        } else {
                            node.getMetadata().set('meta_watched', 'META_' + args.toUpperCase());
                            var overlays = overlay.replace('mdi mdi-bell', '').split(',');
                            overlays.push('mdi mdi-bell');
                            node.getMetadata().set('overlay_class', overlays.join(','));
                        }
                        node.notify('node_replaced');
                    });
                })();
            }
        }
    }]);

    return Callbacks;
})();

exports['default'] = Callbacks;
module.exports = exports['default'];

},{"cells-sdk":"cells-sdk","pydio/http/api":"pydio/http/api"}],4:[function(require,module,exports){
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var AS2Client = (function () {
    function AS2Client() {
        _classCallCheck(this, AS2Client);
    }

    _createClass(AS2Client, null, [{
        key: 'loadActivityStreams',
        value: function loadActivityStreams() {
            var context = arguments.length <= 0 || arguments[0] === undefined ? 'USER_ID' : arguments[0];
            var contextData = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
            var boxName = arguments.length <= 2 || arguments[2] === undefined ? 'outbox' : arguments[2];
            var pointOfView = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
            var offset = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];
            var limit = arguments.length <= 5 || arguments[5] === undefined ? -1 : arguments[5];

            if (!contextData) {
                return Promise.resolve([]);
            }
            var api = new _cellsSdk.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
            var req = new _cellsSdk.ActivityStreamActivitiesRequest();
            req.Context = context;
            req.ContextData = contextData;
            req.BoxName = boxName;
            if (offset > -1) {
                req.Offset = offset;
            }
            if (limit > -1) {
                req.Limit = limit;
            }
            req.Language = _pydio2['default'].getInstance().user.getPreference("lang") || '';
            if (pointOfView) {
                req.PointOfView = pointOfView;
            }
            return api.stream(req);
        }
    }, {
        key: 'UnreadInbox',
        value: function UnreadInbox(userId) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function (count) {} : arguments[1];

            var api = new _cellsSdk.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
            var req = new _cellsSdk.ActivityStreamActivitiesRequest();
            req.Context = 'USER_ID';
            req.ContextData = userId;
            req.BoxName = 'inbox';
            req.UnreadCountOnly = true;
            return api.stream(req).then(function (data) {
                return data.totalItems || 0;
            });
        }
    }]);

    return AS2Client;
})();

exports['default'] = AS2Client;
module.exports = exports['default'];

},{"cells-sdk":"cells-sdk","pydio":"pydio","pydio/http/api":"pydio/http/api"}],5:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _require = require('material-ui');

var Popover = _require.Popover;
var Paper = _require.Paper;
var IconButton = _require.IconButton;
var FlatButton = _require.FlatButton;
var Divider = _require.Divider;

var Pydio = require('pydio');
var debounce = require('lodash.debounce');
var MetaNodeProvider = require('pydio/model/meta-node-provider');

var _Pydio$requireLib = Pydio.requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var _Pydio$requireLib2 = Pydio.requireLib('workspaces');

var FilePreview = _Pydio$requireLib2.FilePreview;

function nodesFromObject(object, pydio) {
    var nodes = [];
    var currentRepository = pydio.user.getActiveRepository();
    if (!object.partOf || !object.partOf.items || !object.partOf.items.length) {
        return nodes;
    }
    for (var i = 0; i < object.partOf.items.length; i++) {
        var ws = object.partOf.items[i];
        // Remove slug part
        var paths = ws.rel.split('/');
        paths.shift();
        var relPath = paths.join('/');
        if (relPath.indexOf('/') !== 0) {
            relPath = '/' + relPath;
        }
        var node = new AjxpNode(relPath, object.type === 'Document');
        node.getMetadata().set('repository_id', ws.id);
        node.getMetadata().set('repository_label', ws.name);
        node.getMetadata().set('filename', relPath);
        if (ws.id === currentRepository) {
            return [node];
        }
        nodes.push(node);
    }
    return nodes;
}

var DocPreview = (function (_React$Component) {
    _inherits(DocPreview, _React$Component);

    function DocPreview(props) {
        _classCallCheck(this, DocPreview);

        _get(Object.getPrototypeOf(DocPreview.prototype), 'constructor', this).call(this, props);
        var nodes = nodesFromObject(props.activity.object, props.pydio);
        if (nodes.length && !nodes[0].isLeaf()) {
            this.state = {
                previewLoaded: true,
                previewFailed: false,
                nodes: nodes
            };
        } else {
            this.state = {
                previewLoaded: false,
                previewFailed: false,
                nodes: nodes
            };
        }
    }

    _createClass(DocPreview, [{
        key: 'render',
        value: function render() {
            var _this = this;

            var pydio = this.props.pydio;
            var _state = this.state;
            var previewLoaded = _state.previewLoaded;
            var nodes = _state.nodes;
            var previewFailed = _state.previewFailed;

            var previewNode = nodes.length ? nodes[0] : null;
            var fPreview = undefined;
            var fPreviewLoading = undefined;
            var fPreviewStyle = {
                height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70
            };
            if (previewNode && previewNode.isLeaf()) {
                if (previewLoaded && !previewFailed) {
                    fPreview = _react2['default'].createElement(FilePreview, { style: fPreviewStyle,
                        node: previewNode, pydio: pydio, loadThumbnail: true,
                        richPreview: true, processing: !previewLoaded });
                } else if (previewLoaded && previewFailed) {

                    fPreview = _react2['default'].createElement(
                        'div',
                        { style: _extends({}, fPreviewStyle, { flexDirection: 'column' }), className: 'mimefont-container' },
                        _react2['default'].createElement('div', { className: 'mimefont mdi mdi-delete' }),
                        _react2['default'].createElement(
                            'span',
                            { style: { fontSize: 13 } },
                            'File deleted'
                        )
                    );
                } else {
                    (function () {
                        var nodeRepoId = previewNode.getMetadata().get('repository_id');
                        var nodeRepoLabel = previewNode.getMetadata().get('repository_label');
                        var provider = new MetaNodeProvider();
                        previewNode.observeOnce('error', function () {
                            _this.setState({ previewLoaded: true, previewFailed: true });
                        });
                        provider.loadLeafNodeSync(previewNode, function (loadedNode) {
                            loadedNode.getMetadata().set('repository_id', nodeRepoId);
                            loadedNode.getMetadata().set('repository_label', nodeRepoLabel);
                            nodes[0] = loadedNode;
                            _this.setState({ previewLoaded: true, nodes: nodes });
                        }, true, { tmp_repository_id: nodeRepoId });

                        fPreviewLoading = _react2['default'].createElement(FilePreview, { style: fPreviewStyle,
                            node: previewNode, pydio: pydio, loadThumbnail: false,
                            richPreview: false, processing: true });
                    })();
                }
            }

            var buttons = [];
            var currentRepoButton = undefined;
            var currentRepository = pydio.user.getActiveRepository();

            var _loop = function (i) {
                var node = nodes[i];
                var button = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', paddingLeft: 10 } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.33)' } },
                        pydio.MessageHash['notification_center.16'],
                        ' ',
                        node.getMetadata().get('repository_label')
                    ),
                    _react2['default'].createElement(IconButton, { iconClassName: "mdi mdi-open-in-new", tooltip: pydio.MessageHash['notification_center.6'], tooltipPosition: "top-center", onClick: function () {
                            pydio.goTo(node);
                        } })
                );
                if (node.getMetadata().get('repository_id') === currentRepository) {
                    currentRepoButton = _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'center' } },
                        _react2['default'].createElement('span', { style: { flex: 1 } }),
                        ' ',
                        _react2['default'].createElement(FlatButton, { label: pydio.MessageHash['notification_center.6'], iconClassName: "mdi mdi-open-in-new", tooltip: 'Open', tooltipPosition: "top-right", onClick: function () {
                                pydio.goTo(node);
                            } })
                    );
                    return 'break';
                }
                buttons.push(button);
                if (i < nodes.length - 1) {
                    buttons.push(_react2['default'].createElement(Divider, null));
                }
            };

            for (var i = 0; i < nodes.length; i++) {
                var _ret2 = _loop(i);

                if (_ret2 === 'break') break;
            }
            if (currentRepoButton) {
                buttons = [currentRepoButton];
            }

            return _react2['default'].createElement(
                'div',
                null,
                !previewFailed && _react2['default'].createElement(
                    'div',
                    { style: { padding: 6 } },
                    buttons
                )
            );
        }
    }]);

    return DocPreview;
})(_react2['default'].Component);

var DocLink = (function (_React$Component2) {
    _inherits(DocLink, _React$Component2);

    function DocLink(props) {
        _classCallCheck(this, DocLink);

        _get(Object.getPrototypeOf(DocLink.prototype), 'constructor', this).call(this, props);
        this.state = {
            showPopover: false,
            popoverAnchor: null
        };
    }

    _createClass(DocLink, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var activity = _props.activity;
            var children = _props.children;
            var linkStyle = _props.linkStyle;

            if (!activity.object.name) {
                activity.object.name = '';
            }
            var nodes = nodesFromObject(activity.object, pydio);

            var onClick = undefined,
                onMouseOver = undefined,
                onMouseOut = undefined,
                popover = undefined;

            var pathParts = activity.object.name.replace('doc://', '').split('/');
            pathParts.shift();
            var title = '/' + pathParts.join('/');

            if (nodes.length > 1) {

                onClick = function () {
                    pydio.goTo(nodes[0]);
                };
                onMouseOut = debounce(function () {
                    _this2.setState({ showPopover: false });
                }, 350);
                onMouseOver = function (e) {
                    _this2.setState({ showPopover: true, popoverAnchor: e.currentTarget });
                    onMouseOut.cancel();
                };
                var onMouseOverInner = function onMouseOverInner(e) {
                    _this2.setState({ showPopover: true });
                    onMouseOut.cancel();
                };

                popover = _react2['default'].createElement(
                    Popover,
                    {
                        open: this.state.showPopover,
                        anchorEl: this.state.popoverAnchor,
                        onRequestClose: function (reason) {
                            if (reason !== 'clickAway') {
                                _this2.setState({ showPopover: false });
                            }
                        },
                        anchorOrigin: { horizontal: "left", vertical: "bottom" },
                        targetOrigin: { horizontal: "left", vertical: "top" },
                        useLayerForClickAway: false
                    },
                    _react2['default'].createElement(
                        Paper,
                        { zDepth: 2, style: { width: 200, height: 'auto', overflowY: 'auto' }, onMouseOver: onMouseOverInner, onMouseOut: onMouseOut },
                        _react2['default'].createElement(DocPreview, { pydio: pydio, activity: activity })
                    )
                );
            } else if (nodes.length === 1) {
                onClick = function () {
                    pydio.goTo(nodes[0]);
                };
            }

            return _react2['default'].createElement(
                'span',
                null,
                _react2['default'].createElement(
                    'a',
                    { title: title, style: _extends({ cursor: 'pointer', color: 'rgb(66, 140, 179)' }, linkStyle),
                        onMouseOver: onMouseOver,
                        onMouseOut: onMouseOut,
                        onClick: onClick },
                    children
                ),
                popover
            );
        }
    }]);

    return DocLink;
})(_react2['default'].Component);

DocLink.PropTypes = {
    activity: _propTypes2['default'].object,
    pydio: _propTypes2['default'].instanceOf(Pydio)
};

exports['default'] = DocLink = PydioContextConsumer(DocLink);
exports['default'] = DocLink;
exports.nodesFromObject = nodesFromObject;

},{"lodash.debounce":"lodash.debounce","material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","pydio/model/meta-node-provider":"pydio/model/meta-node-provider","react":"react"}],6:[function(require,module,exports){
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _ActivityList = require('./ActivityList');

var _ActivityList2 = _interopRequireDefault(_ActivityList);

var _Pydio$requireLib = Pydio.requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var _Pydio$requireLib2 = Pydio.requireLib('workspaces');

var InfoPanelCard = _Pydio$requireLib2.InfoPanelCard;

var InfoPanel = (function (_React$Component) {
    _inherits(InfoPanel, _React$Component);

    function InfoPanel() {
        _classCallCheck(this, InfoPanel);

        _get(Object.getPrototypeOf(InfoPanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(InfoPanel, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var node = _props.node;
            var pydio = _props.pydio;

            if (pydio.getPluginConfigs("core.activitystreams").get("ACTIVITY_SHOW_ACTIVITIES") === false) {
                return null;
            }

            return _react2['default'].createElement(
                InfoPanelCard,
                { identifier: "activity", title: node.isLeaf() ? pydio.MessageHash['notification_center.11'] : pydio.MessageHash['notification_center.10'] },
                _react2['default'].createElement(_ActivityList2['default'], {
                    context: 'NODE_ID',
                    contextData: node.getMetadata().get('uuid'),
                    boxName: 'outbox',
                    style: { overflowY: 'scroll', maxHeight: 380 },
                    listContext: "NODE-" + (node.isLeaf() ? "LEAF" : "COLLECTION"),
                    pointOfView: "ACTOR",
                    displayContext: 'infoPanel'
                })
            );
        }
    }]);

    return InfoPanel;
})(_react2['default'].Component);

exports['default'] = InfoPanel = PydioContextConsumer(InfoPanel);
exports['default'] = InfoPanel;
module.exports = exports['default'];

},{"./ActivityList":2,"material-ui":"material-ui","react":"react"}],7:[function(require,module,exports){
(function (global){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Listeners = (function () {
    function Listeners() {
        _classCallCheck(this, Listeners);
    }

    _createClass(Listeners, null, [{
        key: "dynamicBuilder",
        value: function dynamicBuilder(controller) {
            var pydio = global.pydio;
            var MessageHash = pydio.MessageHash;

            var n = pydio.getUserSelection().getUniqueNode();
            if (!n) {
                return [];
            }

            var builderMenuItems = [];
            var metaValue = undefined;
            if (n.getMetadata().get("meta_watched")) {
                metaValue = n.getMetadata().get("meta_watched");
            }
            builderMenuItems.push({
                name: MessageHash["meta.watch.11"],
                alt: MessageHash["meta.watch." + (n.isLeaf() ? "12" : "12b")],
                icon_class: metaValue && metaValue === "META_WATCH_CHANGE" ? 'mdi mdi-checkbox-marked-circle-outline' : 'mdi mdi-checkbox-blank-circle-outline',
                callback: (function (e) {
                    this.apply('watch_change');
                }).bind(this)
            });
            builderMenuItems.push({
                name: MessageHash["meta.watch.9"],
                alt: MessageHash["meta.watch." + (n.isLeaf() ? "10" : "10b")],
                icon_class: metaValue && metaValue === "META_WATCH_READ" ? 'mdi mdi-checkbox-marked-circle-outline' : 'mdi mdi-checkbox-blank-circle-outline',
                callback: (function (e) {
                    this.apply('watch_read');
                }).bind(this)
            });
            builderMenuItems.push({
                name: MessageHash["meta.watch.13"],
                alt: MessageHash["meta.watch." + (n.isLeaf() ? "14" : "14b")],
                icon_class: metaValue && metaValue === "META_WATCH_BOTH" ? 'mdi mdi-checkbox-marked-circle-outline' : 'mdi mdi-checkbox-blank-circle-outline',
                callback: (function (e) {
                    this.apply('watch_both');
                }).bind(this)
            });
            if (metaValue) {
                builderMenuItems.push({
                    separator: true
                });
                builderMenuItems.push({
                    name: MessageHash['meta.watch.3'],
                    alt: MessageHash["meta.watch." + (n.isLeaf() ? "8" : "4")],
                    icon_class: 'mdi mdi-close-circle-outline',
                    callback: (function (e) {
                        this.apply('watch_stop');
                    }).bind(this)
                });
            }

            return builderMenuItems;
        }
    }]);

    return Listeners;
})();

exports["default"] = Listeners;
module.exports = exports["default"];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _Client = require('./Client');

var _Client2 = _interopRequireDefault(_Client);

var _ActivityList = require('./ActivityList');

var _ActivityList2 = _interopRequireDefault(_ActivityList);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var UserPanel = (function (_React$Component) {
    _inherits(UserPanel, _React$Component);

    function UserPanel(props) {
        _classCallCheck(this, UserPanel);

        _get(Object.getPrototypeOf(UserPanel.prototype), 'constructor', this).call(this, props);
        this.state = {
            unreadStatus: 0,
            open: false,
            data: []
        };
        this.reloadData = (0, _lodashDebounce2['default'])(this.reloadData.bind(this), 500);
        this.reloadUnread = (0, _lodashDebounce2['default'])(this.reloadUnread.bind(this), 500);
    }

    _createClass(UserPanel, [{
        key: 'reloadData',
        value: function reloadData() {
            var _this = this;

            _Client2['default'].loadActivityStreams('USER_ID', this.props.pydio.user.id, 'inbox').then(function (json) {
                _this.setState({ data: json });
            })['catch'](function (msg) {
                _this.setState({ error: msg });
            });
        }
    }, {
        key: 'reloadUnread',
        value: function reloadUnread() {
            var _this2 = this;

            _Client2['default'].UnreadInbox(this.props.pydio.user.id).then(function (count) {
                _this2.setState({ unreadStatus: count });
            })['catch'](function (msg) {});
        }
    }, {
        key: 'onStatusChange',
        value: function onStatusChange() {
            if (this.props.onUnreadStatusChange) {
                this.props.onUnreadStatusChange(this.state.unreadStatus);
            }
        }
    }, {
        key: 'handleTouchTap',
        value: function handleTouchTap(event) {
            // This prevents ghost click.
            event.preventDefault();
            //if(this.state.unreadStatus){
            //this.updateAlertsLastRead();
            //}
            this.reloadData();
            this.setState({
                open: true,
                anchorEl: event.currentTarget,
                unreadStatus: 0
            }, this.onStatusChange.bind(this));
        }
    }, {
        key: 'handleRequestClose',
        value: function handleRequestClose() {
            this.setState({
                open: false
            });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this3 = this;

            this.reloadUnread();
            this.props.pydio.observe('websocket_event:activity', function (event) {
                if (_this3.state.open) {
                    _this3.reloadData();
                } else {
                    _this3.reloadUnread();
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var iconStyle = _props.iconStyle;
            var muiTheme = _props.muiTheme;
            var _state = this.state;
            var open = _state.open;
            var anchorEl = _state.anchorEl;
            var unreadStatus = _state.unreadStatus;

            var buttonStyle = { borderRadius: '50%' };
            if (open && iconStyle && iconStyle.color) {
                buttonStyle = _extends({}, buttonStyle, { backgroundColor: (0, _color2['default'])(iconStyle.color).fade(0.9).toString() });
            }
            return _react2['default'].createElement(
                'span',
                null,
                _react2['default'].createElement(
                    'div',
                    {
                        style: { position: 'relative', display: 'inline-block' },

                        badgeContent: this.state.unreadStatus,
                        secondary: true,
                        badgeStyle: this.state.unreadStatus ? null : { display: 'none' }
                    },
                    _react2['default'].createElement(_materialUi.IconButton, {
                        onClick: this.handleTouchTap.bind(this),
                        iconClassName: this.props.iconClassName || "mdi mdi-bell",
                        tooltip: (unreadStatus ? unreadStatus + ' ' : '') + this.props.pydio.MessageHash['notification_center.4'],
                        className: 'userActionButton alertsButton',
                        iconStyle: iconStyle,
                        style: buttonStyle
                    }),
                    unreadStatus > 0 && _react2['default'].createElement('div', { style: { width: 6, height: 6, borderRadius: '50%', top: 9, right: 6, position: 'absolute', backgroundColor: muiTheme.palette.accent1Color } })
                ),
                _react2['default'].createElement(
                    _materialUi.Popover,
                    {
                        open: open,
                        anchorEl: anchorEl,
                        anchorOrigin: { horizontal: 'left', vertical: 'top' },
                        targetOrigin: { horizontal: 'left', vertical: 'top' },
                        onRequestClose: this.handleRequestClose.bind(this),
                        style: { width: 320 },
                        zDepth: 3

                    },
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'center', borderRadius: '2px 2px 0 0', width: '100%',
                                backgroundColor: '#f8fafc', borderBottom: '1px solid #ECEFF1', color: muiTheme.palette.primary1Color } },
                        _react2['default'].createElement('span', { className: "mdi mdi-bell", style: { fontSize: 18, margin: '12px 8px 14px 16px' } }),
                        _react2['default'].createElement(
                            'span',
                            { style: { fontSize: 15, fontWeight: 500 } },
                            pydio.MessageHash['notification_center.1']
                        )
                    ),
                    this.state.data && _react2['default'].createElement(_ActivityList2['default'], {
                        items: this.state.data.items,
                        style: { overflowY: 'scroll', maxHeight: 420, paddingTop: 20 },
                        groupByDate: true,
                        displayContext: "popover"
                    })
                )
            );
        }
    }]);

    return UserPanel;
})(_react2['default'].Component);

exports['default'] = UserPanel = (0, _materialUiStyles.muiThemeable)()(UserPanel);

exports['default'] = UserPanel;
module.exports = exports['default'];

},{"./ActivityList":2,"./Client":4,"color":"color","lodash.debounce":"lodash.debounce","material-ui":"material-ui","material-ui/styles":"material-ui/styles","react":"react"}],9:[function(require,module,exports){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib.ModernSelectField;

var WatchSelector = (function (_React$Component) {
    _inherits(WatchSelector, _React$Component);

    function WatchSelector(props) {
        _classCallCheck(this, WatchSelector);

        _get(Object.getPrototypeOf(WatchSelector.prototype), 'constructor', this).call(this, props);
        var nodes = this.props.nodes;

        this.state = this.valueFromNodes(nodes);
    }

    _createClass(WatchSelector, [{
        key: 'valueFromNodes',
        value: function valueFromNodes() {
            var nodes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            var mixed = false,
                value = undefined;
            nodes.forEach(function (n) {
                var nVal = n.getMetadata().get('meta_watched') || '';
                if (value !== undefined && nVal !== value) {
                    mixed = true;
                }
                value = nVal;
            });
            return { value: value, mixed: mixed };
        }
    }, {
        key: 'onSelectorChange',
        value: function onSelectorChange(value) {
            var _this = this;

            if (value === 'mixed') {
                return;
            }

            var _props = this.props;
            var pydio = _props.pydio;
            var nodes = _props.nodes;

            this.setState({ saving: true });

            var proms = nodes.map(function (node) {
                var nodeUuid = node.getMetadata().get('uuid');
                var userId = pydio.user.id;
                var subscription = new _cellsSdk.ActivitySubscription();
                var type = new _cellsSdk.ActivityOwnerType();
                subscription.UserId = userId;
                subscription.ObjectId = nodeUuid;
                subscription.ObjectType = type.NODE;
                var events = [];
                if (value === 'META_WATCH_CHANGE' || value === 'META_WATCH_BOTH') {
                    events.push('change');
                }
                if (value === 'META_WATCH_READ' || value === 'META_WATCH_BOTH') {
                    events.push('read');
                }
                subscription.Events = events;
                var api = new _cellsSdk.ActivityServiceApi(_pydioHttpApi2['default'].getRestClient());
                return api.subscribe(subscription).then(function (outSub) {
                    var overlay = node.getMetadata().get('overlay_class') || '';
                    if (value === '') {
                        node.getMetadata()['delete']('meta_watched');
                        node.getMetadata().set('overlay_class', overlay.replace('mdi mdi-bell', ''));
                    } else {
                        node.getMetadata().set('meta_watched', value);
                        var overlays = overlay.replace('mdi mdi-bell', '').split(',');
                        overlays.push('mdi mdi-bell');
                        node.getMetadata().set('overlay_class', overlays.join(','));
                    }
                    node.notify('node_replaced');
                });
            });
            Promise.all(proms).then(function () {
                _this.setState({ value: value, mixed: false });
                window.setTimeout(function () {
                    _this.setState({ saving: false });
                }, 250);
            })['catch'](function () {
                _this.setState({ saving: false });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var value = _state.value;
            var mixed = _state.mixed;
            var saving = _state.saving;

            var mm = _pydio2['default'].getInstance().MessageHash;

            if (saving) {
                return _react2['default'].createElement(
                    ModernSelectField,
                    { value: "saving", onChange: function (e, i, v) {}, disabled: true },
                    _react2['default'].createElement(_materialUi.MenuItem, { value: "saving", primaryText: mm['meta.watch.selector.saving'] + "..." })
                );
            }

            return _react2['default'].createElement(
                ModernSelectField,
                { value: mixed ? 'mixed' : value, onChange: function (e, i, v) {
                        _this2.onSelectorChange(v);
                    } },
                mixed && _react2['default'].createElement(_materialUi.MenuItem, { value: "mixed", primaryText: mm['meta.watch.selector.mixed'] + "..." }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: "", primaryText: mm['meta.watch.selector.ignore'] }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: "META_WATCH_READ", primaryText: mm['meta.watch.selector.read'] }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: "META_WATCH_CHANGE", primaryText: mm['meta.watch.selector.change'] }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: "META_WATCH_BOTH", primaryText: mm['meta.watch.selector.both'] })
            );
        }
    }]);

    return WatchSelector;
})(_react2['default'].Component);

exports['default'] = WatchSelector;
module.exports = exports['default'];

},{"cells-sdk":"cells-sdk","material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","react":"react"}],10:[function(require,module,exports){
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj["default"] : obj; }

var _InfoPanel = require("./InfoPanel");

exports.InfoPanel = _interopRequire(_InfoPanel);

var _UserPanel = require("./UserPanel");

exports.UserPanel = _interopRequire(_UserPanel);

var _Client = require("./Client");

exports.ASClient = _interopRequire(_Client);

var _Activity = require("./Activity");

exports.Activity = _interopRequire(_Activity);

var _ActivityList = require("./ActivityList");

exports.ActivityList = _interopRequire(_ActivityList);

var _Listener = require('./Listener');

exports.Listener = _interopRequire(_Listener);

var _Callbacks = require('./Callbacks');

exports.Callbacks = _interopRequire(_Callbacks);

var _WatchSelector = require('./WatchSelector');

exports.WatchSelector = _interopRequire(_WatchSelector);

},{"./Activity":1,"./ActivityList":2,"./Callbacks":3,"./Client":4,"./InfoPanel":6,"./Listener":7,"./UserPanel":8,"./WatchSelector":9}]},{},[10])(10)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvQWN0aXZpdHkuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvQWN0aXZpdHlMaXN0LmpzIiwicmVzL2J1aWxkL1B5ZGlvQWN0aXZpdHlTdHJlYW1zL0NhbGxiYWNrcy5qcyIsInJlcy9idWlsZC9QeWRpb0FjdGl2aXR5U3RyZWFtcy9DbGllbnQuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvRG9jTGluay5qcyIsInJlcy9idWlsZC9QeWRpb0FjdGl2aXR5U3RyZWFtcy9JbmZvUGFuZWwuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvTGlzdGVuZXIuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvVXNlclBhbmVsLmpzIiwicmVzL2J1aWxkL1B5ZGlvQWN0aXZpdHlTdHJlYW1zL1dhdGNoU2VsZWN0b3IuanMiLCJyZXMvYnVpbGQvUHlkaW9BY3Rpdml0eVN0cmVhbXMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDIsIF94MywgX3g0KSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MiwgcHJvcGVydHkgPSBfeDMsIHJlY2VpdmVyID0gX3g0OyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MiA9IHBhcmVudDsgX3gzID0gcHJvcGVydHk7IF94NCA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxudmFyIF9yZWFjdE1hcmtkb3duID0gcmVxdWlyZSgncmVhY3QtbWFya2Rvd24nKTtcblxudmFyIF9yZWFjdE1hcmtkb3duMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0TWFya2Rvd24pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX21hdGVyaWFsVWlTdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9weWRpb1V0aWxQYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXRoKTtcblxudmFyIF9Eb2NMaW5rID0gcmVxdWlyZSgnLi9Eb2NMaW5rJyk7XG5cbnZhciBfRG9jTGluazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Eb2NMaW5rKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIFVzZXJBdmF0YXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5Vc2VyQXZhdGFyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIyID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIFB5ZGlvQ29udGV4dENvbnN1bWVyID0gX1B5ZGlvJHJlcXVpcmVMaWIyLlB5ZGlvQ29udGV4dENvbnN1bWVyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIzID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ3dvcmtzcGFjZXMnKTtcblxudmFyIEZpbGVQcmV2aWV3ID0gX1B5ZGlvJHJlcXVpcmVMaWIzLkZpbGVQcmV2aWV3O1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWI0ID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIG1vbWVudCA9IF9QeWRpbyRyZXF1aXJlTGliNC5tb21lbnQ7XG5cbnZhciBQYXJhZ3JhcGggPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUGFyYWdyYXBoLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFBhcmFncmFwaCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhcmFncmFwaCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUGFyYWdyYXBoLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBhcmFncmFwaCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFBhcmFncmFwaDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5mdW5jdGlvbiB3b3Jrc3BhY2VzTG9jYXRpb25zKHB5ZGlvLCBvYmplY3QpIHtcbiAgICB2YXIgd29ya3NwYWNlcyA9IFtdO1xuICAgIGlmICghb2JqZWN0LnBhcnRPZiB8fCAhb2JqZWN0LnBhcnRPZi5pdGVtcyB8fCAhb2JqZWN0LnBhcnRPZi5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFwiTm8gd29ya3NwYWNlIGZvdW5kXCI7XG4gICAgfVxuXG4gICAgdmFyIF9sb29wID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgdmFyIHdzID0gb2JqZWN0LnBhcnRPZi5pdGVtc1tpXTtcbiAgICAgICAgLy8gUmVtb3ZlIHNsdWcgcGFydFxuICAgICAgICAvL2xldCBwYXRocyA9IHdzLnJlbC5zcGxpdCgnLycpO1xuICAgICAgICAvL3BhdGhzLnNoaWZ0KCk7XG4gICAgICAgIC8vbGV0IHJlbFBhdGggPSBwYXRocy5qb2luKCcvJyk7XG4gICAgICAgIHdvcmtzcGFjZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdhJyxcbiAgICAgICAgICAgIHsga2V5OiB3cy5pZCwgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8udHJpZ2dlclJlcG9zaXRvcnlDaGFuZ2Uod3MuaWQpO1xuICAgICAgICAgICAgICAgIH0sIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInIH0gfSxcbiAgICAgICAgICAgIHdzLm5hbWVcbiAgICAgICAgKSk7XG4gICAgICAgIHdvcmtzcGFjZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgIHsga2V5OiB3cy5pZCArICctc2VwJyB9LFxuICAgICAgICAgICAgJywgJ1xuICAgICAgICApKTtcbiAgICB9O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmplY3QucGFydE9mLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIF9sb29wKGkpO1xuICAgIH1cbiAgICB3b3Jrc3BhY2VzLnBvcCgpO1xuICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ3NwYW4nLFxuICAgICAgICBudWxsLFxuICAgICAgICBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci4xNiddLFxuICAgICAgICAnICcsXG4gICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIHdvcmtzcGFjZXNcbiAgICAgICAgKVxuICAgICk7XG59XG5cbmZ1bmN0aW9uIExpbmtXcmFwcGVyKHB5ZGlvLCBhY3Rpdml0eSkge1xuICAgIHZhciBzdHlsZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1syXTtcblxuICAgIHJldHVybiAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgICAgIF9pbmhlcml0cyhXcmFwcGVkLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICAgICAgZnVuY3Rpb24gV3JhcHBlZCgpIHtcbiAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBXcmFwcGVkKTtcblxuICAgICAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoV3JhcHBlZC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgX2NyZWF0ZUNsYXNzKFdyYXBwZWQsIFt7XG4gICAgICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgICAgICB2YXIgaHJlZiA9IF9wcm9wcy5ocmVmO1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IF9wcm9wcy5jaGlsZHJlbjtcblxuICAgICAgICAgICAgICAgIHZhciBsaW5rU3R5bGUgPSBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYig2NiwgMTQwLCAxNzkpJyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogNTAwXG4gICAgICAgICAgICAgICAgfSwgc3R5bGUpO1xuICAgICAgICAgICAgICAgIHZhciB0aXRsZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgdmFyIG9uQ2xpY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChocmVmLnN0YXJ0c1dpdGgoJ2RvYzovLycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpdml0eS50eXBlID09PSAnRGVsZXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHREZWNvcmF0aW9uOiAnbGluZS10aHJvdWdoJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX0RvY0xpbmsyWydkZWZhdWx0J10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBweWRpbzogcHlkaW8sIGFjdGl2aXR5OiBhY3Rpdml0eSwgbGlua1N0eWxlOiBsaW5rU3R5bGUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaHJlZi5zdGFydHNXaXRoKCd1c2VyOi8vJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVzZXJJZCA9IGhyZWYucmVwbGFjZSgndXNlcjovLycsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJBdmF0YXIsIHsgdXNlcklkOiB1c2VySWQsIGRpc3BsYXlBdmF0YXI6IGZhbHNlLCByaWNoT25DbGljazogdHJ1ZSwgc3R5bGU6IF9leHRlbmRzKHt9LCBsaW5rU3R5bGUsIHsgZGlzcGxheTogJ2lubGluZS1ibG9jaycgfSksIHB5ZGlvOiBweWRpbyB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGhyZWYuc3RhcnRzV2l0aCgnd29ya3NwYWNlczovLycpKSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd3NJZCA9IGhyZWYucmVwbGFjZSgnd29ya3NwYWNlczovLycsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChweWRpby51c2VyICYmIHB5ZGlvLnVzZXIuZ2V0UmVwb3NpdG9yaWVzTGlzdCgpLmdldCh3c0lkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLnRyaWdnZXJSZXBvc2l0b3J5Q2hhbmdlKHdzSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICB7IHRpdGxlOiB0aXRsZSwgc3R5bGU6IGxpbmtTdHlsZSwgb25DbGljazogb25DbGljayB9LFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dKTtcblxuICAgICAgICByZXR1cm4gV3JhcHBlZDtcbiAgICB9KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcbn1cblxudmFyIEFjdGl2aXR5ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mykge1xuICAgIF9pbmhlcml0cyhBY3Rpdml0eSwgX1JlYWN0JENvbXBvbmVudDMpO1xuXG4gICAgZnVuY3Rpb24gQWN0aXZpdHkoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBY3Rpdml0eSk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQWN0aXZpdHkucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQWN0aXZpdHksIFt7XG4gICAgICAgIGtleTogJ2NvbXB1dGVJY29uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXB1dGVJY29uKGFjdGl2aXR5KSB7XG4gICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gJyc7XG4gICAgICAgICAgICB2YXIgdGl0bGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGl2aXR5LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiQ3JlYXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpdml0eS5vYmplY3QudHlwZSA9PT0gJ0RvY3VtZW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gXCJmaWxlLXBsdXNcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiZm9sZGVyLXBsdXNcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IFwiQ3JlYXRlZFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRGVsZXRlXCI6XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiZGVsZXRlXCI7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gXCJEZWxldGVkXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJFZGl0XCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcIlVwZGF0ZVwiOlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBcInBlbmNpbFwiO1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IFwiTW9kaWZpZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlVwZGF0ZU1ldGFcIjpcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gXCJ0YWctbXVsdGlwbGVcIjtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBcIk1vZGlmaWVkXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJVcGRhdGVDb21tZW50XCI6XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwibWVzc2FnZS1vdXRsaW5lXCI7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gXCJDb21tZW50ZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlJlYWRcIjpcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gXCJleWVcIjtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBcIkFjY2Vzc2VkXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJNb3ZlXCI6XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiZmlsZS1zZW5kXCI7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gXCJNb3ZlZFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiU2hhcmVcIjpcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gXCJzaGFyZS12YXJpYW50XCI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpdml0eS5vYmplY3QudHlwZSA9PT0gXCJDZWxsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IFwiaWNvbW9vbi1jZWxsc1wiO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFjdGl2aXR5Lm9iamVjdC50eXBlID09PSBcIldvcmtzcGFjZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBcImZvbGRlclwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gXCJTaGFyZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJ2ljb21vb24tJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ21kaSBtZGktJyArIGNsYXNzTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHRpdGxlOiB0aXRsZSwgY2xhc3NOYW1lOiBjbGFzc05hbWUgfTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgICAgICB2YXIgYWN0aXZpdHkgPSBfcHJvcHMyLmFjdGl2aXR5O1xuICAgICAgICAgICAgdmFyIGxpc3RDb250ZXh0ID0gX3Byb3BzMi5saXN0Q29udGV4dDtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5Q29udGV4dCA9IF9wcm9wczIuZGlzcGxheUNvbnRleHQ7XG4gICAgICAgICAgICB2YXIgb25lTGluZXIgPSBfcHJvcHMyLm9uZUxpbmVyO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gX3Byb3BzMi5tdWlUaGVtZTtcblxuICAgICAgICAgICAgdmFyIHNlY29uZGFyeSA9IGFjdGl2aXR5LnR5cGUgKyBcIiAtIFwiICsgYWN0aXZpdHkuYWN0b3IubmFtZTtcbiAgICAgICAgICAgIGlmIChhY3Rpdml0eS5zdW1tYXJ5KSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX3JlYWN0TWFya2Rvd24yWydkZWZhdWx0J10sIHsgc291cmNlOiBhY3Rpdml0eS5zdW1tYXJ5LCByZW5kZXJlcnM6IHsgJ3BhcmFncmFwaCc6IFBhcmFncmFwaCwgJ2xpbmsnOiBMaW5rV3JhcHBlcihweWRpbywgYWN0aXZpdHksIHsgY29sb3I6ICdpbmhlcml0JyB9KSB9IH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3VtbWFyeSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5U3R5bGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgYWN0aW9uSWNvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBibG9ja1N0eWxlID0ge1xuICAgICAgICAgICAgICAgIG1hcmdpbjogJzBweCAxMHB4IDZweCdcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoZGlzcGxheUNvbnRleHQgPT09ICdwb3BvdmVyJykge1xuICAgICAgICAgICAgICAgIHN1bW1hcnlTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMCwwLDAsMC41MyknLFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICc2cHggMCcsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDZcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdW1tYXJ5U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc2cHggMjJweCAxMnB4JyxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiA2LFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDIsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckxlZnQ6ICcycHggc29saWQgI2UwZTBlMCcsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IDEzLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMCwwLDAsMC4zMyknLFxuICAgICAgICAgICAgICAgICAgICAvKmZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgZm9udFN0eWxlOiAnaXRhbGljJywqL1xuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgX2NvbXB1dGVJY29uID0gdGhpcy5jb21wdXRlSWNvbihhY3Rpdml0eSk7XG5cbiAgICAgICAgICAgIHZhciB0aXRsZSA9IF9jb21wdXRlSWNvbi50aXRsZTtcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBfY29tcHV0ZUljb24uY2xhc3NOYW1lO1xuXG4gICAgICAgICAgICBpZiAobGlzdENvbnRleHQgPT09ICdOT0RFLUxFQUYnKSB7XG5cbiAgICAgICAgICAgICAgICBibG9ja1N0eWxlID0geyBtYXJnaW46ICcxNnB4IDEwcHgnIH07XG4gICAgICAgICAgICAgICAgYWN0aW9uSWNvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCB0aXRsZTogdGl0bGUsIHN0eWxlOiB7IGZvbnRTaXplOiAxNywgY29sb3I6ICdyZ2JhKDAsMCwwLDAuMTcpJyB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmIChkaXNwbGF5Q29udGV4dCA9PT0gJ3BvcG92ZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrU3R5bGUgPSB7IG1hcmdpbjogMCB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZXMgPSAoMCwgX0RvY0xpbmsubm9kZXNGcm9tT2JqZWN0KShhY3Rpdml0eS5vYmplY3QsIHB5ZGlvKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGljb24gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpZXdTdHlsZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAzNixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDM2LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW1lRm9udFN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogJzM2cHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcxMnB4IDIwcHggMTJweCAyMHB4JywgcG9zaXRpb246ICdyZWxhdGl2ZScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEZpbGVQcmV2aWV3LCBfZXh0ZW5kcyh7IHB5ZGlvOiBweWRpbywgbm9kZTogbm9kZXNbMF0sIGxvYWRUaHVtYm5haWw6IHRydWUgfSwgcHJldmlld1N0eWxlcykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSwgc3R5bGU6IHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIGJvdHRvbTogOCwgcmlnaHQ6IDEyLCBmb250U2l6ZTogMTgsIGNvbG9yOiBtdWlUaGVtZS5wYWxldHRlLmFjY2VudDJDb2xvciB9IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHQgPSBub2Rlc1swXS5nZXRMYWJlbCgpIHx8IF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLmdldEJhc2VuYW1lKG5vZGVzWzBdLmdldFBhdGgoKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtYXJnaW46ICcxMnB4IDIwcHggMTJweCAyMHB4JywgYmFja2dyb3VuZENvbG9yOiAncmdiKDIzNywgMjQwLCAyNDIpJywgYWxpZ25JdGVtczogJ2luaXRpYWwnLCBoZWlnaHQ6IDM2LCB3aWR0aDogMzYsIGJvcmRlclJhZGl1czogJzUwJScsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCBzdHlsZTogeyBsaW5lSGVpZ2h0OiAnMzZweCcsIGNvbG9yOiBtdWlUaGVtZS5wYWxldHRlLmFjY2VudDJDb2xvciB9IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHQgPSBhY3Rpdml0eS5vYmplY3QubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnZmxleC1zdGFydCcsIG92ZXJmbG93OiAnaGlkZGVuJywgcGFkZGluZ0JvdHRvbTogOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBvdmVyZmxvdzogJ2hpZGRlbicsIHBhZGRpbmdSaWdodDogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtYXJnaW5Ub3A6IDEyLCBtYXJnaW5Cb3R0b206IDIsIGZvbnRTaXplOiAxNSwgY29sb3I6ICdyZ2JhKDAsMCwwLC44NyknLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLCBvdmVyZmxvdzogJ2hpZGRlbicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwuMzMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN1bW1hcnlTdHlsZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogYmxvY2tTdHlsZSB9LFxuICAgICAgICAgICAgICAgICFvbmVMaW5lciAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJBdmF0YXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZURlZmF1bHRBdmF0YXI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IGFjdGl2aXR5LmFjdG9yLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckxhYmVsOiBhY3Rpdml0eS5hY3Rvci5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheUxvY2FsTGFiZWw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyVHlwZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWF4V2lkdGg6ICc2MCUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCwgcGFkZGluZ0xlZnQ6IDEwLCBvdmVyZmxvdzogJ2hpZGRlbicsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJywgd2hpdGVTcGFjZTogJ25vd3JhcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclN0eWxlOiB7IGZsZXhTaHJpbms6IDAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclNpemU6IDI4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmljaE9uSG92ZXI6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBmbGV4OiAxLCBoZWlnaHQ6IDE4LCBjb2xvcjogJ3JnYmEoMCwwLDAsMC4yMyknLCBmb250V2VpZ2h0OiA1MDAsIHBhZGRpbmdMZWZ0OiA4LCB3aGl0ZVNwYWNlOiAnbm93cmFwJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtb21lbnQoYWN0aXZpdHkudXBkYXRlZCkuZnJvbU5vdygpXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkljb25cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHN1bW1hcnlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQWN0aXZpdHk7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuQWN0aXZpdHkuUHJvcFR5cGVzID0ge1xuICAgIGFjdGl2aXR5OiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLm9iamVjdCxcbiAgICBsaXN0Q29udGV4dDogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5zdHJpbmcsXG4gICAgZGlzcGxheUNvbnRleHQ6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10ub25lT2YoWydpbmZvUGFuZWwnLCAncG9wb3ZlciddKVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQWN0aXZpdHkgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMubXVpVGhlbWVhYmxlKSgpKEFjdGl2aXR5KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEFjdGl2aXR5ID0gUHlkaW9Db250ZXh0Q29uc3VtZXIoQWN0aXZpdHkpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gQWN0aXZpdHk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldOyByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfQ2xpZW50ID0gcmVxdWlyZSgnLi9DbGllbnQnKTtcblxudmFyIF9DbGllbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ2xpZW50KTtcblxudmFyIF9BY3Rpdml0eSA9IHJlcXVpcmUoJy4vQWN0aXZpdHknKTtcblxudmFyIF9BY3Rpdml0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9BY3Rpdml0eSk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBQeWRpb0NvbnRleHRDb25zdW1lciA9IF9QeWRpbyRyZXF1aXJlTGliLlB5ZGlvQ29udGV4dENvbnN1bWVyO1xudmFyIG1vbWVudCA9IF9QeWRpbyRyZXF1aXJlTGliLm1vbWVudDtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBFbXB0eVN0YXRlVmlldyA9IF9QeWRpbyRyZXF1aXJlTGliMi5FbXB0eVN0YXRlVmlldztcblxudmFyIEFjdGl2aXR5TGlzdCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhBY3Rpdml0eUxpc3QsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQWN0aXZpdHlMaXN0KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBY3Rpdml0eUxpc3QpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEFjdGl2aXR5TGlzdC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgaWYgKHByb3BzLml0ZW1zKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0geyBkYXRhOiB7IGl0ZW1zOiBwcm9wcy5pdGVtcyB9LCBvZmZzZXQ6IDAsIGxvYWRNb3JlOiBmYWxzZSwgbG9hZGluZzogZmFsc2UgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB7IGRhdGE6IFtdLCBvZmZzZXQ6IDAsIGxvYWRNb3JlOiB0cnVlLCBsb2FkaW5nOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEFjdGl2aXR5TGlzdCwgW3tcbiAgICAgICAga2V5OiAnbWVyZ2VNb3JlRmVlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBtZXJnZU1vcmVGZWVkKGN1cnJlbnRGZWVkLCBuZXdGZWVkKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudElkcyA9IGN1cnJlbnRGZWVkLml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmlkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBuZXdGZWVkLml0ZW1zLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50SWRzLmluZGV4T2YoaXRlbS5pZCkgPT09IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIWZpbHRlcmVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkTW9yZTogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRGZWVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1lcmdlZCA9IGN1cnJlbnRGZWVkO1xuICAgICAgICAgICAgbWVyZ2VkLml0ZW1zID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShjdXJyZW50RmVlZC5pdGVtcyksIF90b0NvbnN1bWFibGVBcnJheShmaWx0ZXJlZCkpO1xuICAgICAgICAgICAgbWVyZ2VkLnRvdGFsSXRlbXMgPSBtZXJnZWQuaXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZEZvclByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWRGb3JQcm9wcyhwcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBwcm9wcy5jb250ZXh0O1xuICAgICAgICAgICAgdmFyIHBvaW50T2ZWaWV3ID0gcHJvcHMucG9pbnRPZlZpZXc7XG4gICAgICAgICAgICB2YXIgY29udGV4dERhdGEgPSBwcm9wcy5jb250ZXh0RGF0YTtcbiAgICAgICAgICAgIHZhciBsaW1pdCA9IHByb3BzLmxpbWl0O1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gX3N0YXRlLm9mZnNldDtcbiAgICAgICAgICAgIHZhciBkYXRhID0gX3N0YXRlLmRhdGE7XG5cbiAgICAgICAgICAgIGlmIChsaW1pdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGltaXQgPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiAwKSB7XG4gICAgICAgICAgICAgICAgbGltaXQgPSAxMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSwgZXJyb3I6IG51bGwgfSk7XG4gICAgICAgICAgICBfQ2xpZW50MlsnZGVmYXVsdCddLmxvYWRBY3Rpdml0eVN0cmVhbXMoY29udGV4dCwgY29udGV4dERhdGEsICdvdXRib3gnLCBwb2ludE9mVmlldywgb2Zmc2V0LCBsaW1pdCkudGhlbihmdW5jdGlvbiAoanNvbikge1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXQgPiAwICYmIGRhdGEgJiYgZGF0YS5pdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoanNvbiAmJiBqc29uLml0ZW1zKSBfdGhpcy5zZXRTdGF0ZSh7IGRhdGE6IF90aGlzLm1lcmdlTW9yZUZlZWQoZGF0YSwganNvbikgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBkYXRhOiBqc29uIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWpzb24gfHwgIWpzb24uaXRlbXMgfHwgIWpzb24uaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgbG9hZE1vcmU6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKG1zZykge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UsIGVycm9yOiBtc2cgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gX3Byb3BzLml0ZW1zO1xuICAgICAgICAgICAgdmFyIGNvbnRleHREYXRhID0gX3Byb3BzLmNvbnRleHREYXRhO1xuXG4gICAgICAgICAgICBpZiAoaXRlbXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29udGV4dERhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRGb3JQcm9wcyh0aGlzLnByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChuZXh0UHJvcHMuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGF0YTogeyBpdGVtczogbmV4dFByb3BzLml0ZW1zIH0sIG9mZnNldDogMCwgbG9hZE1vcmU6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXh0UHJvcHMuY29udGV4dERhdGEgIT09IHRoaXMucHJvcHMuY29udGV4dERhdGEgfHwgbmV4dFByb3BzLmNvbnRleHQgIT09IHRoaXMucHJvcHMuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBvZmZzZXQ6IDAsIGxvYWRNb3JlOiB0cnVlIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLmxvYWRGb3JQcm9wcyhuZXh0UHJvcHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gW107XG4gICAgICAgICAgICB2YXIgX3N0YXRlMiA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IF9zdGF0ZTIuZGF0YTtcbiAgICAgICAgICAgIHZhciBsb2FkTW9yZSA9IF9zdGF0ZTIubG9hZE1vcmU7XG4gICAgICAgICAgICB2YXIgbG9hZGluZyA9IF9zdGF0ZTIubG9hZGluZztcbiAgICAgICAgICAgIHZhciBlcnJvciA9IF9zdGF0ZTIuZXJyb3I7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbGlzdENvbnRleHQgPSBfcHJvcHMyLmxpc3RDb250ZXh0O1xuICAgICAgICAgICAgdmFyIGdyb3VwQnlEYXRlID0gX3Byb3BzMi5ncm91cEJ5RGF0ZTtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5Q29udGV4dCA9IF9wcm9wczIuZGlzcGxheUNvbnRleHQ7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlvdXNGcm9tID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGVtcHR5U3RhdGVJY29uID0gXCJtZGkgbWRpLXB1bHNlXCI7XG4gICAgICAgICAgICB2YXIgZW1wdHlTdGF0ZVN0cmluZyA9IGxvYWRpbmcgPyBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci4xNyddIDogcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMTgnXTtcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGVtcHR5U3RhdGVTdHJpbmcgPSBlcnJvci5EZXRhaWwgfHwgZXJyb3IubXNnIHx8IGVycm9yO1xuICAgICAgICAgICAgICAgIGVtcHR5U3RhdGVJY29uID0gXCJtZGkgbWRpLWFsZXJ0LWNpcmNsZS1vdXRsaW5lXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YSAhPT0gbnVsbCAmJiBkYXRhLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChhYywgaSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBmcm9tTm93ID0gbW9tZW50KGFjLnVwZGF0ZWQpLmZyb21Ob3coKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3VwQnlEYXRlICYmIGZyb21Ob3cgIT09IHByZXZpb3VzRnJvbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudC5wb3AoKTsgLy8gcmVtb3ZlIGxhc3QgZGl2aWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzIwcHggMTZweCAwJywgZm9udFNpemU6IDEzLCBjb2xvcjogJ3JnYmEoMTQ3LCAxNjgsIDE3OCwgMC42NyknLCBmb250V2VpZ2h0OiA1MDAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tTm93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgMTZweCcsIGZvbnRTaXplOiAxMywgY29sb3I6ICdyZ2JhKDE0NywgMTY4LCAxNzgsIDAuNjcpJywgZm9udFdlaWdodDogNTAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbU5vd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfQWN0aXZpdHkyWydkZWZhdWx0J10sIHsga2V5OiBhYy5pZCwgYWN0aXZpdHk6IGFjLCBsaXN0Q29udGV4dDogbGlzdENvbnRleHQsIG9uZUxpbmVyOiBncm91cEJ5RGF0ZSwgZGlzcGxheUNvbnRleHQ6IGRpc3BsYXlDb250ZXh0IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3VwQnlEYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0Zyb20gPSBmcm9tTm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudC5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiB7IGJvcmRlclRvcDogJzFweCBzb2xpZCByZ2JhKDAsMCwwLC4wMyknLCB3aWR0aDogJzEwMCUnIH0gfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwQnlEYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQucG9wKCk7IC8vIHJlbW92ZSBsYXN0IGRpdmlkZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29udGVudC5sZW5ndGggJiYgbG9hZE1vcmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9hZEFjdGlvbiA9IGZ1bmN0aW9uIGxvYWRBY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IG9mZnNldDogZGF0YS5pdGVtcy5sZW5ndGggKyAxIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5sb2FkRm9yUHJvcHMoX3RoaXMzLnByb3BzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb250ZW50LnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAxNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IGxvYWRpbmcgPyBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci4yMCddIDogcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMTknXSwgZGlzYWJsZWQ6IGxvYWRpbmcsIG9uQ2xpY2s6IGxvYWRBY3Rpb24gfSlcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogdGhpcy5wcm9wcy5zdHlsZSB9LFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlID0geyBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcgfTtcbiAgICAgICAgICAgICAgICB2YXIgaWNvblN0eWxlID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRTdHlsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAoZGlzcGxheUNvbnRleHQgPT09ICdwb3BvdmVyJykge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZSA9IF9leHRlbmRzKHt9LCBzdHlsZSwgeyBtaW5IZWlnaHQ6IDI1MCB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRpc3BsYXlDb250ZXh0ID09PSAnaW5mb1BhbmVsJykge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZSA9IF9leHRlbmRzKHt9LCBzdHlsZSwgeyBwYWRkaW5nQm90dG9tOiAyMCB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlID0geyBmb250U2l6ZTogNDAgfTtcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kU3R5bGUgPSB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNDAwIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChFbXB0eVN0YXRlVmlldywge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogdGhpcy5wcm9wcy5weWRpbyxcbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogZW1wdHlTdGF0ZUljb24sXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0SWQ6IGVtcHR5U3RhdGVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBzdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlOiBpY29uU3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZFN0eWxlOiBsZWdlbmRTdHlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEFjdGl2aXR5TGlzdDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5BY3Rpdml0eUxpc3QuUHJvcFR5cGVzID0ge1xuICAgIGNvbnRleHQ6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uc3RyaW5nLFxuICAgIGNvbnRleHREYXRhOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLnN0cmluZyxcbiAgICBib3hOYW1lOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLnN0cmluZyxcbiAgICBwb2ludE9mVmlldzogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vbmVPZihbJ0dFTkVSSUMnLCAnQUNUT1InLCAnU1VCSkVDVCddKSxcbiAgICBkaXNwbGF5Q29udGV4dDogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vbmVPZihbJ21haW5MaXN0JywgJ2luZm9QYW5lbCcsICdwb3BvdmVyJ10pXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBBY3Rpdml0eUxpc3QgPSBQeWRpb0NvbnRleHRDb25zdW1lcihBY3Rpdml0eUxpc3QpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gQWN0aXZpdHlMaXN0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxOCBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9jZWxsc1NkayA9IHJlcXVpcmUoJ2NlbGxzLXNkaycpO1xuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ3RvZ2dsZVdhdGNoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRvZ2dsZVdhdGNoKG1hbmFnZXIsIGFyZ3MpIHtcblxuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gcHlkaW8uZ2V0VXNlclNlbGVjdGlvbigpLmdldFVuaXF1ZU5vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVVdWlkID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXNlcklkID0gcHlkaW8udXNlci5pZDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IG5ldyBfY2VsbHNTZGsuQWN0aXZpdHlTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBuZXcgX2NlbGxzU2RrLkFjdGl2aXR5T3duZXJUeXBlKCk7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5Vc2VySWQgPSB1c2VySWQ7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5PYmplY3RJZCA9IG5vZGVVdWlkO1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uT2JqZWN0VHlwZSA9IHR5cGUuTk9ERTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncyA9PT0gJ3dhdGNoX2NoYW5nZScgfHwgYXJncyA9PT0gJ3dhdGNoX2JvdGgnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMucHVzaCgnY2hhbmdlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFyZ3MgPT09ICd3YXRjaF9yZWFkJyB8fCBhcmdzID09PSAnd2F0Y2hfYm90aCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5wdXNoKCdyZWFkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLkV2ZW50cyA9IGV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuQWN0aXZpdHlTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnN1YnNjcmliZShzdWJzY3JpcHRpb24pLnRoZW4oZnVuY3Rpb24gKG91dFN1Yikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG92ZXJsYXkgPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdvdmVybGF5X2NsYXNzJykgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJncyA9PT0gJ3dhdGNoX3N0b3AnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpWydkZWxldGUnXSgnbWV0YV93YXRjaGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgnb3ZlcmxheV9jbGFzcycsIG92ZXJsYXkucmVwbGFjZSgnbWRpIG1kaS1iZWxsJywgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgnbWV0YV93YXRjaGVkJywgJ01FVEFfJyArIGFyZ3MudG9VcHBlckNhc2UoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG92ZXJsYXlzID0gb3ZlcmxheS5yZXBsYWNlKCdtZGkgbWRpLWJlbGwnLCAnJykuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVybGF5cy5wdXNoKCdtZGkgbWRpLWJlbGwnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KCdvdmVybGF5X2NsYXNzJywgb3ZlcmxheXMuam9pbignLCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubm90aWZ5KCdub2RlX3JlcGxhY2VkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ2FsbGJhY2tzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxudmFyIEFTMkNsaWVudCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQVMyQ2xpZW50KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQVMyQ2xpZW50KTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQVMyQ2xpZW50LCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdsb2FkQWN0aXZpdHlTdHJlYW1zJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWRBY3Rpdml0eVN0cmVhbXMoKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/ICdVU0VSX0lEJyA6IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHZhciBjb250ZXh0RGF0YSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICcnIDogYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgdmFyIGJveE5hbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAnb3V0Ym94JyA6IGFyZ3VtZW50c1syXTtcbiAgICAgICAgICAgIHZhciBwb2ludE9mVmlldyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/ICcnIDogYXJndW1lbnRzWzNdO1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNCB8fCBhcmd1bWVudHNbNF0gPT09IHVuZGVmaW5lZCA/IC0xIDogYXJndW1lbnRzWzRdO1xuICAgICAgICAgICAgdmFyIGxpbWl0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSA1IHx8IGFyZ3VtZW50c1s1XSA9PT0gdW5kZWZpbmVkID8gLTEgOiBhcmd1bWVudHNbNV07XG5cbiAgICAgICAgICAgIGlmICghY29udGV4dERhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLkFjdGl2aXR5U2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICB2YXIgcmVxID0gbmV3IF9jZWxsc1Nkay5BY3Rpdml0eVN0cmVhbUFjdGl2aXRpZXNSZXF1ZXN0KCk7XG4gICAgICAgICAgICByZXEuQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICByZXEuQ29udGV4dERhdGEgPSBjb250ZXh0RGF0YTtcbiAgICAgICAgICAgIHJlcS5Cb3hOYW1lID0gYm94TmFtZTtcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJlcS5PZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGltaXQgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJlcS5MaW1pdCA9IGxpbWl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxLkxhbmd1YWdlID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkudXNlci5nZXRQcmVmZXJlbmNlKFwibGFuZ1wiKSB8fCAnJztcbiAgICAgICAgICAgIGlmIChwb2ludE9mVmlldykge1xuICAgICAgICAgICAgICAgIHJlcS5Qb2ludE9mVmlldyA9IHBvaW50T2ZWaWV3O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFwaS5zdHJlYW0ocmVxKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnVW5yZWFkSW5ib3gnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gVW5yZWFkSW5ib3godXNlcklkKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoY291bnQpIHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5BY3Rpdml0eVNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgdmFyIHJlcSA9IG5ldyBfY2VsbHNTZGsuQWN0aXZpdHlTdHJlYW1BY3Rpdml0aWVzUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxLkNvbnRleHQgPSAnVVNFUl9JRCc7XG4gICAgICAgICAgICByZXEuQ29udGV4dERhdGEgPSB1c2VySWQ7XG4gICAgICAgICAgICByZXEuQm94TmFtZSA9ICdpbmJveCc7XG4gICAgICAgICAgICByZXEuVW5yZWFkQ291bnRPbmx5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBhcGkuc3RyZWFtKHJlcSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLnRvdGFsSXRlbXMgfHwgMDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEFTMkNsaWVudDtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEFTMkNsaWVudDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIFBvcG92ZXIgPSBfcmVxdWlyZS5Qb3BvdmVyO1xudmFyIFBhcGVyID0gX3JlcXVpcmUuUGFwZXI7XG52YXIgSWNvbkJ1dHRvbiA9IF9yZXF1aXJlLkljb25CdXR0b247XG52YXIgRmxhdEJ1dHRvbiA9IF9yZXF1aXJlLkZsYXRCdXR0b247XG52YXIgRGl2aWRlciA9IF9yZXF1aXJlLkRpdmlkZXI7XG5cbnZhciBQeWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCdsb2Rhc2guZGVib3VuY2UnKTtcbnZhciBNZXRhTm9kZVByb3ZpZGVyID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvbWV0YS1ub2RlLXByb3ZpZGVyJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIFB5ZGlvQ29udGV4dENvbnN1bWVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuUHlkaW9Db250ZXh0Q29uc3VtZXI7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBQeWRpby5yZXF1aXJlTGliKCd3b3Jrc3BhY2VzJyk7XG5cbnZhciBGaWxlUHJldmlldyA9IF9QeWRpbyRyZXF1aXJlTGliMi5GaWxlUHJldmlldztcblxuZnVuY3Rpb24gbm9kZXNGcm9tT2JqZWN0KG9iamVjdCwgcHlkaW8pIHtcbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICB2YXIgY3VycmVudFJlcG9zaXRvcnkgPSBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnkoKTtcbiAgICBpZiAoIW9iamVjdC5wYXJ0T2YgfHwgIW9iamVjdC5wYXJ0T2YuaXRlbXMgfHwgIW9iamVjdC5wYXJ0T2YuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmplY3QucGFydE9mLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB3cyA9IG9iamVjdC5wYXJ0T2YuaXRlbXNbaV07XG4gICAgICAgIC8vIFJlbW92ZSBzbHVnIHBhcnRcbiAgICAgICAgdmFyIHBhdGhzID0gd3MucmVsLnNwbGl0KCcvJyk7XG4gICAgICAgIHBhdGhzLnNoaWZ0KCk7XG4gICAgICAgIHZhciByZWxQYXRoID0gcGF0aHMuam9pbignLycpO1xuICAgICAgICBpZiAocmVsUGF0aC5pbmRleE9mKCcvJykgIT09IDApIHtcbiAgICAgICAgICAgIHJlbFBhdGggPSAnLycgKyByZWxQYXRoO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub2RlID0gbmV3IEFqeHBOb2RlKHJlbFBhdGgsIG9iamVjdC50eXBlID09PSAnRG9jdW1lbnQnKTtcbiAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9pZCcsIHdzLmlkKTtcbiAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9sYWJlbCcsIHdzLm5hbWUpO1xuICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KCdmaWxlbmFtZScsIHJlbFBhdGgpO1xuICAgICAgICBpZiAod3MuaWQgPT09IGN1cnJlbnRSZXBvc2l0b3J5KSB7XG4gICAgICAgICAgICByZXR1cm4gW25vZGVdO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICAgIHJldHVybiBub2Rlcztcbn1cblxudmFyIERvY1ByZXZpZXcgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRG9jUHJldmlldywgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBEb2NQcmV2aWV3KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEb2NQcmV2aWV3KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihEb2NQcmV2aWV3LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB2YXIgbm9kZXMgPSBub2Rlc0Zyb21PYmplY3QocHJvcHMuYWN0aXZpdHkub2JqZWN0LCBwcm9wcy5weWRpbyk7XG4gICAgICAgIGlmIChub2Rlcy5sZW5ndGggJiYgIW5vZGVzWzBdLmlzTGVhZigpKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgICAgIHByZXZpZXdMb2FkZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJldmlld0ZhaWxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbm9kZXM6IG5vZGVzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgICAgICBwcmV2aWV3TG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcmV2aWV3RmFpbGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub2Rlczogbm9kZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRG9jUHJldmlldywgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBwcmV2aWV3TG9hZGVkID0gX3N0YXRlLnByZXZpZXdMb2FkZWQ7XG4gICAgICAgICAgICB2YXIgbm9kZXMgPSBfc3RhdGUubm9kZXM7XG4gICAgICAgICAgICB2YXIgcHJldmlld0ZhaWxlZCA9IF9zdGF0ZS5wcmV2aWV3RmFpbGVkO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlld05vZGUgPSBub2Rlcy5sZW5ndGggPyBub2Rlc1swXSA6IG51bGw7XG4gICAgICAgICAgICB2YXIgZlByZXZpZXcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgZlByZXZpZXdMb2FkaW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGZQcmV2aWV3U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAyMDAsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgZm9udFNpemU6IDcwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHByZXZpZXdOb2RlICYmIHByZXZpZXdOb2RlLmlzTGVhZigpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZpZXdMb2FkZWQgJiYgIXByZXZpZXdGYWlsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZlByZXZpZXcgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChGaWxlUHJldmlldywgeyBzdHlsZTogZlByZXZpZXdTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IHByZXZpZXdOb2RlLCBweWRpbzogcHlkaW8sIGxvYWRUaHVtYm5haWw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByaWNoUHJldmlldzogdHJ1ZSwgcHJvY2Vzc2luZzogIXByZXZpZXdMb2FkZWQgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcmV2aWV3TG9hZGVkICYmIHByZXZpZXdGYWlsZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICBmUHJldmlldyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgZlByZXZpZXdTdHlsZSwgeyBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9KSwgY2xhc3NOYW1lOiAnbWltZWZvbnQtY29udGFpbmVyJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgY2xhc3NOYW1lOiAnbWltZWZvbnQgbWRpIG1kaS1kZWxldGUnIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRmlsZSBkZWxldGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZVJlcG9JZCA9IHByZXZpZXdOb2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdyZXBvc2l0b3J5X2lkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZVJlcG9MYWJlbCA9IHByZXZpZXdOb2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdyZXBvc2l0b3J5X2xhYmVsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBuZXcgTWV0YU5vZGVQcm92aWRlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlld05vZGUub2JzZXJ2ZU9uY2UoJ2Vycm9yJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgcHJldmlld0xvYWRlZDogdHJ1ZSwgcHJldmlld0ZhaWxlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXIubG9hZExlYWZOb2RlU3luYyhwcmV2aWV3Tm9kZSwgZnVuY3Rpb24gKGxvYWRlZE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZWROb2RlLmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2lkJywgbm9kZVJlcG9JZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVkTm9kZS5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9sYWJlbCcsIG5vZGVSZXBvTGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzWzBdID0gbG9hZGVkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHByZXZpZXdMb2FkZWQ6IHRydWUsIG5vZGVzOiBub2RlcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRydWUsIHsgdG1wX3JlcG9zaXRvcnlfaWQ6IG5vZGVSZXBvSWQgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZQcmV2aWV3TG9hZGluZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEZpbGVQcmV2aWV3LCB7IHN0eWxlOiBmUHJldmlld1N0eWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IHByZXZpZXdOb2RlLCBweWRpbzogcHlkaW8sIGxvYWRUaHVtYm5haWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpY2hQcmV2aWV3OiBmYWxzZSwgcHJvY2Vzc2luZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBidXR0b25zID0gW107XG4gICAgICAgICAgICB2YXIgY3VycmVudFJlcG9CdXR0b24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgY3VycmVudFJlcG9zaXRvcnkgPSBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnkoKTtcblxuICAgICAgICAgICAgdmFyIF9sb29wID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBidXR0b24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgcGFkZGluZ0xlZnQ6IDEwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA1MDAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjMzKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMTYnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3JlcG9zaXRvcnlfbGFiZWwnKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1vcGVuLWluLW5ld1wiLCB0b29sdGlwOiBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci42J10sIHRvb2x0aXBQb3NpdGlvbjogXCJ0b3AtY2VudGVyXCIsIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpby5nb1RvKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3JlcG9zaXRvcnlfaWQnKSA9PT0gY3VycmVudFJlcG9zaXRvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFJlcG9CdXR0b24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChGbGF0QnV0dG9uLCB7IGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnbm90aWZpY2F0aW9uX2NlbnRlci42J10sIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1vcGVuLWluLW5ld1wiLCB0b29sdGlwOiAnT3BlbicsIHRvb2x0aXBQb3NpdGlvbjogXCJ0b3AtcmlnaHRcIiwgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpby5nb1RvKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdicmVhayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJ1dHRvbnMucHVzaChidXR0b24pO1xuICAgICAgICAgICAgICAgIGlmIChpIDwgbm9kZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBidXR0b25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRGl2aWRlciwgbnVsbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgX3JldDIgPSBfbG9vcChpKTtcblxuICAgICAgICAgICAgICAgIGlmIChfcmV0MiA9PT0gJ2JyZWFrJykgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3VycmVudFJlcG9CdXR0b24pIHtcbiAgICAgICAgICAgICAgICBidXR0b25zID0gW2N1cnJlbnRSZXBvQnV0dG9uXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgIXByZXZpZXdGYWlsZWQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDYgfSB9LFxuICAgICAgICAgICAgICAgICAgICBidXR0b25zXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEb2NQcmV2aWV3O1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbnZhciBEb2NMaW5rID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mikge1xuICAgIF9pbmhlcml0cyhEb2NMaW5rLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBEb2NMaW5rKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEb2NMaW5rKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihEb2NMaW5rLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2hvd1BvcG92ZXI6IGZhbHNlLFxuICAgICAgICAgICAgcG9wb3ZlckFuY2hvcjogbnVsbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhEb2NMaW5rLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGFjdGl2aXR5ID0gX3Byb3BzLmFjdGl2aXR5O1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gX3Byb3BzLmNoaWxkcmVuO1xuICAgICAgICAgICAgdmFyIGxpbmtTdHlsZSA9IF9wcm9wcy5saW5rU3R5bGU7XG5cbiAgICAgICAgICAgIGlmICghYWN0aXZpdHkub2JqZWN0Lm5hbWUpIHtcbiAgICAgICAgICAgICAgICBhY3Rpdml0eS5vYmplY3QubmFtZSA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5vZGVzID0gbm9kZXNGcm9tT2JqZWN0KGFjdGl2aXR5Lm9iamVjdCwgcHlkaW8pO1xuXG4gICAgICAgICAgICB2YXIgb25DbGljayA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBvbk1vdXNlT3ZlciA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBvbk1vdXNlT3V0ID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHBvcG92ZXIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHZhciBwYXRoUGFydHMgPSBhY3Rpdml0eS5vYmplY3QubmFtZS5yZXBsYWNlKCdkb2M6Ly8nLCAnJykuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIHBhdGhQYXJ0cy5zaGlmdCgpO1xuICAgICAgICAgICAgdmFyIHRpdGxlID0gJy8nICsgcGF0aFBhcnRzLmpvaW4oJy8nKTtcblxuICAgICAgICAgICAgaWYgKG5vZGVzLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgICAgICAgIG9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdvVG8obm9kZXNbMF0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgb25Nb3VzZU91dCA9IGRlYm91bmNlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgc2hvd1BvcG92ZXI6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIH0sIDM1MCk7XG4gICAgICAgICAgICAgICAgb25Nb3VzZU92ZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBzaG93UG9wb3ZlcjogdHJ1ZSwgcG9wb3ZlckFuY2hvcjogZS5jdXJyZW50VGFyZ2V0IH0pO1xuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3V0LmNhbmNlbCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIG9uTW91c2VPdmVySW5uZXIgPSBmdW5jdGlvbiBvbk1vdXNlT3ZlcklubmVyKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgc2hvd1BvcG92ZXI6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdXQuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHBvcG92ZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgUG9wb3ZlcixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogdGhpcy5zdGF0ZS5zaG93UG9wb3ZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvckVsOiB0aGlzLnN0YXRlLnBvcG92ZXJBbmNob3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWFzb24gIT09ICdjbGlja0F3YXknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHNob3dQb3BvdmVyOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6IFwibGVmdFwiLCB2ZXJ0aWNhbDogXCJib3R0b21cIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6IFwibGVmdFwiLCB2ZXJ0aWNhbDogXCJ0b3BcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlTGF5ZXJGb3JDbGlja0F3YXk6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHpEZXB0aDogMiwgc3R5bGU6IHsgd2lkdGg6IDIwMCwgaGVpZ2h0OiAnYXV0bycsIG92ZXJmbG93WTogJ2F1dG8nIH0sIG9uTW91c2VPdmVyOiBvbk1vdXNlT3ZlcklubmVyLCBvbk1vdXNlT3V0OiBvbk1vdXNlT3V0IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChEb2NQcmV2aWV3LCB7IHB5ZGlvOiBweWRpbywgYWN0aXZpdHk6IGFjdGl2aXR5IH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChub2Rlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBvbkNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBweWRpby5nb1RvKG5vZGVzWzBdKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdhJyxcbiAgICAgICAgICAgICAgICAgICAgeyB0aXRsZTogdGl0bGUsIHN0eWxlOiBfZXh0ZW5kcyh7IGN1cnNvcjogJ3BvaW50ZXInLCBjb2xvcjogJ3JnYig2NiwgMTQwLCAxNzkpJyB9LCBsaW5rU3R5bGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU92ZXI6IG9uTW91c2VPdmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU91dDogb25Nb3VzZU91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IG9uQ2xpY2sgfSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHBvcG92ZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRG9jTGluaztcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5Eb2NMaW5rLlByb3BUeXBlcyA9IHtcbiAgICBhY3Rpdml0eTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vYmplY3QsXG4gICAgcHlkaW86IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihQeWRpbylcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IERvY0xpbmsgPSBQeWRpb0NvbnRleHRDb25zdW1lcihEb2NMaW5rKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IERvY0xpbms7XG5leHBvcnRzLm5vZGVzRnJvbU9iamVjdCA9IG5vZGVzRnJvbU9iamVjdDtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfQWN0aXZpdHlMaXN0ID0gcmVxdWlyZSgnLi9BY3Rpdml0eUxpc3QnKTtcblxudmFyIF9BY3Rpdml0eUxpc3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQWN0aXZpdHlMaXN0KTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gUHlkaW8ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgUHlkaW9Db250ZXh0Q29uc3VtZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5QeWRpb0NvbnRleHRDb25zdW1lcjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ3dvcmtzcGFjZXMnKTtcblxudmFyIEluZm9QYW5lbENhcmQgPSBfUHlkaW8kcmVxdWlyZUxpYjIuSW5mb1BhbmVsQ2FyZDtcblxudmFyIEluZm9QYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhJbmZvUGFuZWwsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gSW5mb1BhbmVsKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5mb1BhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihJbmZvUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoSW5mb1BhbmVsLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9wcm9wcy5ub2RlO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgICAgICBpZiAocHlkaW8uZ2V0UGx1Z2luQ29uZmlncyhcImNvcmUuYWN0aXZpdHlzdHJlYW1zXCIpLmdldChcIkFDVElWSVRZX1NIT1dfQUNUSVZJVElFU1wiKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIEluZm9QYW5lbENhcmQsXG4gICAgICAgICAgICAgICAgeyBpZGVudGlmaWVyOiBcImFjdGl2aXR5XCIsIHRpdGxlOiBub2RlLmlzTGVhZigpID8gcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMTEnXSA6IHB5ZGlvLk1lc3NhZ2VIYXNoWydub3RpZmljYXRpb25fY2VudGVyLjEwJ10gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfQWN0aXZpdHlMaXN0MlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6ICdOT0RFX0lEJyxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dERhdGE6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKSxcbiAgICAgICAgICAgICAgICAgICAgYm94TmFtZTogJ291dGJveCcsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IG92ZXJmbG93WTogJ3Njcm9sbCcsIG1heEhlaWdodDogMzgwIH0sXG4gICAgICAgICAgICAgICAgICAgIGxpc3RDb250ZXh0OiBcIk5PREUtXCIgKyAobm9kZS5pc0xlYWYoKSA/IFwiTEVBRlwiIDogXCJDT0xMRUNUSU9OXCIpLFxuICAgICAgICAgICAgICAgICAgICBwb2ludE9mVmlldzogXCJBQ1RPUlwiLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5Q29udGV4dDogJ2luZm9QYW5lbCdcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBJbmZvUGFuZWw7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSW5mb1BhbmVsID0gUHlkaW9Db250ZXh0Q29uc3VtZXIoSW5mb1BhbmVsKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEluZm9QYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTggQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTGlzdGVuZXJzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMaXN0ZW5lcnMoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMaXN0ZW5lcnMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhMaXN0ZW5lcnMsIG51bGwsIFt7XG4gICAgICAgIGtleTogXCJkeW5hbWljQnVpbGRlclwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZHluYW1pY0J1aWxkZXIoY29udHJvbGxlcikge1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gZ2xvYmFsLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIE1lc3NhZ2VIYXNoID0gcHlkaW8uTWVzc2FnZUhhc2g7XG5cbiAgICAgICAgICAgIHZhciBuID0gcHlkaW8uZ2V0VXNlclNlbGVjdGlvbigpLmdldFVuaXF1ZU5vZGUoKTtcbiAgICAgICAgICAgIGlmICghbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJ1aWxkZXJNZW51SXRlbXMgPSBbXTtcbiAgICAgICAgICAgIHZhciBtZXRhVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAobi5nZXRNZXRhZGF0YSgpLmdldChcIm1ldGFfd2F0Y2hlZFwiKSkge1xuICAgICAgICAgICAgICAgIG1ldGFWYWx1ZSA9IG4uZ2V0TWV0YWRhdGEoKS5nZXQoXCJtZXRhX3dhdGNoZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBidWlsZGVyTWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IE1lc3NhZ2VIYXNoW1wibWV0YS53YXRjaC4xMVwiXSxcbiAgICAgICAgICAgICAgICBhbHQ6IE1lc3NhZ2VIYXNoW1wibWV0YS53YXRjaC5cIiArIChuLmlzTGVhZigpID8gXCIxMlwiIDogXCIxMmJcIildLFxuICAgICAgICAgICAgICAgIGljb25fY2xhc3M6IG1ldGFWYWx1ZSAmJiBtZXRhVmFsdWUgPT09IFwiTUVUQV9XQVRDSF9DSEFOR0VcIiA/ICdtZGkgbWRpLWNoZWNrYm94LW1hcmtlZC1jaXJjbGUtb3V0bGluZScgOiAnbWRpIG1kaS1jaGVja2JveC1ibGFuay1jaXJjbGUtb3V0bGluZScsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5KCd3YXRjaF9jaGFuZ2UnKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJ1aWxkZXJNZW51SXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogTWVzc2FnZUhhc2hbXCJtZXRhLndhdGNoLjlcIl0sXG4gICAgICAgICAgICAgICAgYWx0OiBNZXNzYWdlSGFzaFtcIm1ldGEud2F0Y2guXCIgKyAobi5pc0xlYWYoKSA/IFwiMTBcIiA6IFwiMTBiXCIpXSxcbiAgICAgICAgICAgICAgICBpY29uX2NsYXNzOiBtZXRhVmFsdWUgJiYgbWV0YVZhbHVlID09PSBcIk1FVEFfV0FUQ0hfUkVBRFwiID8gJ21kaSBtZGktY2hlY2tib3gtbWFya2VkLWNpcmNsZS1vdXRsaW5lJyA6ICdtZGkgbWRpLWNoZWNrYm94LWJsYW5rLWNpcmNsZS1vdXRsaW5lJyxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHkoJ3dhdGNoX3JlYWQnKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJ1aWxkZXJNZW51SXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogTWVzc2FnZUhhc2hbXCJtZXRhLndhdGNoLjEzXCJdLFxuICAgICAgICAgICAgICAgIGFsdDogTWVzc2FnZUhhc2hbXCJtZXRhLndhdGNoLlwiICsgKG4uaXNMZWFmKCkgPyBcIjE0XCIgOiBcIjE0YlwiKV0sXG4gICAgICAgICAgICAgICAgaWNvbl9jbGFzczogbWV0YVZhbHVlICYmIG1ldGFWYWx1ZSA9PT0gXCJNRVRBX1dBVENIX0JPVEhcIiA/ICdtZGkgbWRpLWNoZWNrYm94LW1hcmtlZC1jaXJjbGUtb3V0bGluZScgOiAnbWRpIG1kaS1jaGVja2JveC1ibGFuay1jaXJjbGUtb3V0bGluZScsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5KCd3YXRjaF9ib3RoJyk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAobWV0YVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYnVpbGRlck1lbnVJdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgc2VwYXJhdG9yOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnVpbGRlck1lbnVJdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogTWVzc2FnZUhhc2hbJ21ldGEud2F0Y2guMyddLFxuICAgICAgICAgICAgICAgICAgICBhbHQ6IE1lc3NhZ2VIYXNoW1wibWV0YS53YXRjaC5cIiArIChuLmlzTGVhZigpID8gXCI4XCIgOiBcIjRcIildLFxuICAgICAgICAgICAgICAgICAgICBpY29uX2NsYXNzOiAnbWRpIG1kaS1jbG9zZS1jaXJjbGUtb3V0bGluZScsXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHkoJ3dhdGNoX3N0b3AnKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRlck1lbnVJdGVtcztcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBMaXN0ZW5lcnM7XG59KSgpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IExpc3RlbmVycztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAyMCBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX21hdGVyaWFsVWlTdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9DbGllbnQgPSByZXF1aXJlKCcuL0NsaWVudCcpO1xuXG52YXIgX0NsaWVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9DbGllbnQpO1xuXG52YXIgX0FjdGl2aXR5TGlzdCA9IHJlcXVpcmUoJy4vQWN0aXZpdHlMaXN0Jyk7XG5cbnZhciBfQWN0aXZpdHlMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0FjdGl2aXR5TGlzdCk7XG5cbnZhciBfbG9kYXNoRGVib3VuY2UgPSByZXF1aXJlKCdsb2Rhc2guZGVib3VuY2UnKTtcblxudmFyIF9sb2Rhc2hEZWJvdW5jZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9sb2Rhc2hEZWJvdW5jZSk7XG5cbnZhciBfY29sb3IgPSByZXF1aXJlKCdjb2xvcicpO1xuXG52YXIgX2NvbG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbG9yKTtcblxudmFyIFVzZXJQYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhVc2VyUGFuZWwsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVXNlclBhbmVsKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVc2VyUGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFVzZXJQYW5lbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHVucmVhZFN0YXR1czogMCxcbiAgICAgICAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgICAgICAgZGF0YTogW11cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZWxvYWREYXRhID0gKDAsIF9sb2Rhc2hEZWJvdW5jZTJbJ2RlZmF1bHQnXSkodGhpcy5yZWxvYWREYXRhLmJpbmQodGhpcyksIDUwMCk7XG4gICAgICAgIHRoaXMucmVsb2FkVW5yZWFkID0gKDAsIF9sb2Rhc2hEZWJvdW5jZTJbJ2RlZmF1bHQnXSkodGhpcy5yZWxvYWRVbnJlYWQuYmluZCh0aGlzKSwgNTAwKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVXNlclBhbmVsLCBbe1xuICAgICAgICBrZXk6ICdyZWxvYWREYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbG9hZERhdGEoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICBfQ2xpZW50MlsnZGVmYXVsdCddLmxvYWRBY3Rpdml0eVN0cmVhbXMoJ1VTRVJfSUQnLCB0aGlzLnByb3BzLnB5ZGlvLnVzZXIuaWQsICdpbmJveCcpLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGRhdGE6IGpzb24gfSk7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBlcnJvcjogbXNnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbG9hZFVucmVhZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZWxvYWRVbnJlYWQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgX0NsaWVudDJbJ2RlZmF1bHQnXS5VbnJlYWRJbmJveCh0aGlzLnByb3BzLnB5ZGlvLnVzZXIuaWQpLnRoZW4oZnVuY3Rpb24gKGNvdW50KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgdW5yZWFkU3RhdHVzOiBjb3VudCB9KTtcbiAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChtc2cpIHt9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25TdGF0dXNDaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25TdGF0dXNDaGFuZ2UoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vblVucmVhZFN0YXR1c0NoYW5nZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25VbnJlYWRTdGF0dXNDaGFuZ2UodGhpcy5zdGF0ZS51bnJlYWRTdGF0dXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYW5kbGVUb3VjaFRhcCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVUb3VjaFRhcChldmVudCkge1xuICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBnaG9zdCBjbGljay5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAvL2lmKHRoaXMuc3RhdGUudW5yZWFkU3RhdHVzKXtcbiAgICAgICAgICAgIC8vdGhpcy51cGRhdGVBbGVydHNMYXN0UmVhZCgpO1xuICAgICAgICAgICAgLy99XG4gICAgICAgICAgICB0aGlzLnJlbG9hZERhdGEoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgICAgICAgYW5jaG9yRWw6IGV2ZW50LmN1cnJlbnRUYXJnZXQsXG4gICAgICAgICAgICAgICAgdW5yZWFkU3RhdHVzOiAwXG4gICAgICAgICAgICB9LCB0aGlzLm9uU3RhdHVzQ2hhbmdlLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYW5kbGVSZXF1ZXN0Q2xvc2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlUmVxdWVzdENsb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgb3BlbjogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMucmVsb2FkVW5yZWFkKCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnB5ZGlvLm9ic2VydmUoJ3dlYnNvY2tldF9ldmVudDphY3Rpdml0eScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChfdGhpczMuc3RhdGUub3Blbikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMucmVsb2FkRGF0YSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5yZWxvYWRVbnJlYWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGljb25TdHlsZSA9IF9wcm9wcy5pY29uU3R5bGU7XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMubXVpVGhlbWU7XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBvcGVuID0gX3N0YXRlLm9wZW47XG4gICAgICAgICAgICB2YXIgYW5jaG9yRWwgPSBfc3RhdGUuYW5jaG9yRWw7XG4gICAgICAgICAgICB2YXIgdW5yZWFkU3RhdHVzID0gX3N0YXRlLnVucmVhZFN0YXR1cztcblxuICAgICAgICAgICAgdmFyIGJ1dHRvblN0eWxlID0geyBib3JkZXJSYWRpdXM6ICc1MCUnIH07XG4gICAgICAgICAgICBpZiAob3BlbiAmJiBpY29uU3R5bGUgJiYgaWNvblN0eWxlLmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uU3R5bGUgPSBfZXh0ZW5kcyh7fSwgYnV0dG9uU3R5bGUsIHsgYmFja2dyb3VuZENvbG9yOiAoMCwgX2NvbG9yMlsnZGVmYXVsdCddKShpY29uU3R5bGUuY29sb3IpLmZhZGUoMC45KS50b1N0cmluZygpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJhZGdlQ29udGVudDogdGhpcy5zdGF0ZS51bnJlYWRTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWRnZVN0eWxlOiB0aGlzLnN0YXRlLnVucmVhZFN0YXR1cyA/IG51bGwgOiB7IGRpc3BsYXk6ICdub25lJyB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuaGFuZGxlVG91Y2hUYXAuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6IHRoaXMucHJvcHMuaWNvbkNsYXNzTmFtZSB8fCBcIm1kaSBtZGktYmVsbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcDogKHVucmVhZFN0YXR1cyA/IHVucmVhZFN0YXR1cyArICcgJyA6ICcnKSArIHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuNCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAndXNlckFjdGlvbkJ1dHRvbiBhbGVydHNCdXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlOiBpY29uU3R5bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogYnV0dG9uU3R5bGVcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIHVucmVhZFN0YXR1cyA+IDAgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgc3R5bGU6IHsgd2lkdGg6IDYsIGhlaWdodDogNiwgYm9yZGVyUmFkaXVzOiAnNTAlJywgdG9wOiA5LCByaWdodDogNiwgcG9zaXRpb246ICdhYnNvbHV0ZScsIGJhY2tncm91bmRDb2xvcjogbXVpVGhlbWUucGFsZXR0ZS5hY2NlbnQxQ29sb3IgfSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBvcG92ZXIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IG9wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogYW5jaG9yRWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0Q2xvc2U6IHRoaXMuaGFuZGxlUmVxdWVzdENsb3NlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogMzIwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB6RGVwdGg6IDNcblxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBib3JkZXJSYWRpdXM6ICcycHggMnB4IDAgMCcsIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI0VDRUZGMScsIGNvbG9yOiBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3IgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLWJlbGxcIiwgc3R5bGU6IHsgZm9udFNpemU6IDE4LCBtYXJnaW46ICcxMnB4IDhweCAxNHB4IDE2cHgnIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTUsIGZvbnRXZWlnaHQ6IDUwMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbJ25vdGlmaWNhdGlvbl9jZW50ZXIuMSddXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZGF0YSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfQWN0aXZpdHlMaXN0MlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5zdGF0ZS5kYXRhLml0ZW1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgb3ZlcmZsb3dZOiAnc2Nyb2xsJywgbWF4SGVpZ2h0OiA0MjAsIHBhZGRpbmdUb3A6IDIwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cEJ5RGF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlDb250ZXh0OiBcInBvcG92ZXJcIlxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXNlclBhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFVzZXJQYW5lbCA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoVXNlclBhbmVsKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVXNlclBhbmVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAyMCBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9jZWxsc1NkayA9IHJlcXVpcmUoJ2NlbGxzLXNkaycpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5TZWxlY3RGaWVsZCA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblNlbGVjdEZpZWxkO1xuXG52YXIgV2F0Y2hTZWxlY3RvciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhXYXRjaFNlbGVjdG9yLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFdhdGNoU2VsZWN0b3IocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFdhdGNoU2VsZWN0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFdhdGNoU2VsZWN0b3IucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMubm9kZXM7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMudmFsdWVGcm9tTm9kZXMobm9kZXMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhXYXRjaFNlbGVjdG9yLCBbe1xuICAgICAgICBrZXk6ICd2YWx1ZUZyb21Ob2RlcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB2YWx1ZUZyb21Ob2RlcygpIHtcbiAgICAgICAgICAgIHZhciBub2RlcyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IFtdIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICAgICAgICB2YXIgbWl4ZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgICAgICB2YXIgblZhbCA9IG4uZ2V0TWV0YWRhdGEoKS5nZXQoJ21ldGFfd2F0Y2hlZCcpIHx8ICcnO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIG5WYWwgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1peGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBuVmFsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIG1peGVkOiBtaXhlZCB9O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvblNlbGVjdG9yQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uU2VsZWN0b3JDaGFuZ2UodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ21peGVkJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgbm9kZXMgPSBfcHJvcHMubm9kZXM7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzYXZpbmc6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIHZhciBwcm9tcyA9IG5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBub2RlVXVpZCA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKTtcbiAgICAgICAgICAgICAgICB2YXIgdXNlcklkID0gcHlkaW8udXNlci5pZDtcbiAgICAgICAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9uID0gbmV3IF9jZWxsc1Nkay5BY3Rpdml0eVN1YnNjcmlwdGlvbigpO1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gbmV3IF9jZWxsc1Nkay5BY3Rpdml0eU93bmVyVHlwZSgpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5Vc2VySWQgPSB1c2VySWQ7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLk9iamVjdElkID0gbm9kZVV1aWQ7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLk9iamVjdFR5cGUgPSB0eXBlLk5PREU7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ01FVEFfV0FUQ0hfQ0hBTkdFJyB8fCB2YWx1ZSA9PT0gJ01FVEFfV0FUQ0hfQk9USCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnB1c2goJ2NoYW5nZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09ICdNRVRBX1dBVENIX1JFQUQnIHx8IHZhbHVlID09PSAnTUVUQV9XQVRDSF9CT1RIJykge1xuICAgICAgICAgICAgICAgICAgICBldmVudHMucHVzaCgncmVhZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uRXZlbnRzID0gZXZlbnRzO1xuICAgICAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLkFjdGl2aXR5U2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwaS5zdWJzY3JpYmUoc3Vic2NyaXB0aW9uKS50aGVuKGZ1bmN0aW9uIChvdXRTdWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG92ZXJsYXkgPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdvdmVybGF5X2NsYXNzJykgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKVsnZGVsZXRlJ10oJ21ldGFfd2F0Y2hlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldCgnb3ZlcmxheV9jbGFzcycsIG92ZXJsYXkucmVwbGFjZSgnbWRpIG1kaS1iZWxsJywgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoJ21ldGFfd2F0Y2hlZCcsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvdmVybGF5cyA9IG92ZXJsYXkucmVwbGFjZSgnbWRpIG1kaS1iZWxsJywgJycpLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVybGF5cy5wdXNoKCdtZGkgbWRpLWJlbGwnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoJ292ZXJsYXlfY2xhc3MnLCBvdmVybGF5cy5qb2luKCcsJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5vZGUubm90aWZ5KCdub2RlX3JlcGxhY2VkJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21zKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiB2YWx1ZSwgbWl4ZWQ6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBzYXZpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIH0sIDI1MCk7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBzYXZpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBfc3RhdGUudmFsdWU7XG4gICAgICAgICAgICB2YXIgbWl4ZWQgPSBfc3RhdGUubWl4ZWQ7XG4gICAgICAgICAgICB2YXIgc2F2aW5nID0gX3N0YXRlLnNhdmluZztcblxuICAgICAgICAgICAgdmFyIG1tID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2g7XG5cbiAgICAgICAgICAgIGlmIChzYXZpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIE1vZGVyblNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcInNhdmluZ1wiLCBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIGksIHYpIHt9LCBkaXNhYmxlZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogXCJzYXZpbmdcIiwgcHJpbWFyeVRleHQ6IG1tWydtZXRhLndhdGNoLnNlbGVjdG9yLnNhdmluZyddICsgXCIuLi5cIiB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBNb2Rlcm5TZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiBtaXhlZCA/ICdtaXhlZCcgOiB2YWx1ZSwgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCBpLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIub25TZWxlY3RvckNoYW5nZSh2KTtcbiAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgIG1peGVkICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBcIm1peGVkXCIsIHByaW1hcnlUZXh0OiBtbVsnbWV0YS53YXRjaC5zZWxlY3Rvci5taXhlZCddICsgXCIuLi5cIiB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogXCJcIiwgcHJpbWFyeVRleHQ6IG1tWydtZXRhLndhdGNoLnNlbGVjdG9yLmlnbm9yZSddIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBcIk1FVEFfV0FUQ0hfUkVBRFwiLCBwcmltYXJ5VGV4dDogbW1bJ21ldGEud2F0Y2guc2VsZWN0b3IucmVhZCddIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBcIk1FVEFfV0FUQ0hfQ0hBTkdFXCIsIHByaW1hcnlUZXh0OiBtbVsnbWV0YS53YXRjaC5zZWxlY3Rvci5jaGFuZ2UnXSB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogXCJNRVRBX1dBVENIX0JPVEhcIiwgcHJpbWFyeVRleHQ6IG1tWydtZXRhLndhdGNoLnNlbGVjdG9yLmJvdGgnXSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBXYXRjaFNlbGVjdG9yO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFdhdGNoU2VsZWN0b3I7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZShvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9ialtcImRlZmF1bHRcIl0gOiBvYmo7IH1cblxudmFyIF9JbmZvUGFuZWwgPSByZXF1aXJlKFwiLi9JbmZvUGFuZWxcIik7XG5cbmV4cG9ydHMuSW5mb1BhbmVsID0gX2ludGVyb3BSZXF1aXJlKF9JbmZvUGFuZWwpO1xuXG52YXIgX1VzZXJQYW5lbCA9IHJlcXVpcmUoXCIuL1VzZXJQYW5lbFwiKTtcblxuZXhwb3J0cy5Vc2VyUGFuZWwgPSBfaW50ZXJvcFJlcXVpcmUoX1VzZXJQYW5lbCk7XG5cbnZhciBfQ2xpZW50ID0gcmVxdWlyZShcIi4vQ2xpZW50XCIpO1xuXG5leHBvcnRzLkFTQ2xpZW50ID0gX2ludGVyb3BSZXF1aXJlKF9DbGllbnQpO1xuXG52YXIgX0FjdGl2aXR5ID0gcmVxdWlyZShcIi4vQWN0aXZpdHlcIik7XG5cbmV4cG9ydHMuQWN0aXZpdHkgPSBfaW50ZXJvcFJlcXVpcmUoX0FjdGl2aXR5KTtcblxudmFyIF9BY3Rpdml0eUxpc3QgPSByZXF1aXJlKFwiLi9BY3Rpdml0eUxpc3RcIik7XG5cbmV4cG9ydHMuQWN0aXZpdHlMaXN0ID0gX2ludGVyb3BSZXF1aXJlKF9BY3Rpdml0eUxpc3QpO1xuXG52YXIgX0xpc3RlbmVyID0gcmVxdWlyZSgnLi9MaXN0ZW5lcicpO1xuXG5leHBvcnRzLkxpc3RlbmVyID0gX2ludGVyb3BSZXF1aXJlKF9MaXN0ZW5lcik7XG5cbnZhciBfQ2FsbGJhY2tzID0gcmVxdWlyZSgnLi9DYWxsYmFja3MnKTtcblxuZXhwb3J0cy5DYWxsYmFja3MgPSBfaW50ZXJvcFJlcXVpcmUoX0NhbGxiYWNrcyk7XG5cbnZhciBfV2F0Y2hTZWxlY3RvciA9IHJlcXVpcmUoJy4vV2F0Y2hTZWxlY3RvcicpO1xuXG5leHBvcnRzLldhdGNoU2VsZWN0b3IgPSBfaW50ZXJvcFJlcXVpcmUoX1dhdGNoU2VsZWN0b3IpO1xuIl19

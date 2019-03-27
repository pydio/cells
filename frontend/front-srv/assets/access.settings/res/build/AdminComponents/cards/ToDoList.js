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

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var asGridItem = _Pydio$requireLib.asGridItem;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib2.PydioContextConsumer;

var globalMessages = global.pydio.MessageHash;

var ToDoList = (function (_Component) {
    _inherits(ToDoList, _Component);

    function ToDoList(props, context) {
        _classCallCheck(this, ToDoList);

        _get(Object.getPrototypeOf(ToDoList.prototype), 'constructor', this).call(this, props, context);
        var _props = this.props;
        var preferencesProvider = _props.preferencesProvider;
        var widgetId = _props.widgetId;

        if (preferencesProvider) {
            var tasks = preferencesProvider.getUserPreference('ToDoList-' + widgetId);
            if (tasks && typeof tasks === "object") {
                this.state = { tasks: tasks, edit: false };
                return;
            }
        }
        this.state = {
            edit: false,
            input: '',
            tasks: [{
                label: this.props.getMessage("home.77", "ajxp_admin"),
                isDone: false
            }, {
                label: this.props.getMessage("home.77", "ajxp_admin") + " (" + this.props.getMessage("home.78", "ajxp_admin") + ")",
                isDone: true
            }]
        };
    }

    _createClass(ToDoList, [{
        key: 'addTask',
        value: function addTask() {
            var input = this.state.input;

            if (!input) {
                return;
            }
            var tasks = this.state.tasks;

            tasks.push({
                label: input,
                isDone: false
            });
            if (this.props.preferencesProvider) {
                this.props.preferencesProvider.saveUserPreference('ToDoList-' + this.props['widgetId'], tasks);
            }
            this.setState({ tasks: tasks, input: '' });
        }
    }, {
        key: 'handleNewTaskKeyDown',
        value: function handleNewTaskKeyDown(event) {
            if (event.keyCode === 13) {
                this.addTask();
            }
        }
    }, {
        key: 'removeTask',
        value: function removeTask(index) {
            var tasks = this.state.tasks;

            var newTasks = [];
            for (var i = 0; i < tasks.length; i++) {
                if (i !== index) newTasks.push(tasks[i]);
            }
            if (this.props.preferencesProvider) {
                this.props.preferencesProvider.saveUserPreference('ToDoList-' + this.props['widgetId'], newTasks);
            }
            this.setState({ tasks: newTasks });
        }
    }, {
        key: 'changeTaskState',
        value: function changeTaskState(index) {
            var tasks = this.state.tasks;

            var newTasks = [];
            for (var i = 0; i < tasks.length; i++) {
                if (i === index) {
                    newTasks.push({ label: tasks[i].label, isDone: !tasks[i].isDone });
                } else {
                    newTasks.push(tasks[i]);
                }
            }
            if (this.props.preferencesProvider) {
                this.props.preferencesProvider.saveUserPreference('ToDoList-' + this.props['widgetId'], newTasks);
            }
            this.setState({ tasks: newTasks });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var index = -1;
            var tasks = this.state.tasks.map((function (item) {
                index++;
                var taskLabel = undefined;
                if (item.isDone) {
                    taskLabel = React.createElement(
                        'p',
                        { className: 'task-done', title: item.label },
                        item.label
                    );
                } else {
                    taskLabel = React.createElement(
                        'p',
                        { title: item.label },
                        item.label
                    );
                }
                return React.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'baseline', paddingBottom: 5, width: '100%' }, key: "task" + index },
                    React.createElement(
                        'div',
                        { style: { flex: 1 } },
                        React.createElement(_materialUi.Checkbox, {
                            onCheck: this.changeTaskState.bind(this, index),
                            checked: item.isDone,
                            label: taskLabel,
                            labelPosition: "right"
                        })
                    ),
                    React.createElement('span', { onClick: this.removeTask.bind(this, index), className: 'mdi mdi-delete', style: { cursor: 'pointer', color: '#9e9e9e', fontSize: 24 } })
                );
            }).bind(this));
            return React.createElement(
                _materialUi.Paper,
                _extends({}, this.props, { zDepth: 1, transitionEnabled: false }),
                this.props.closeButton,
                React.createElement(
                    'div',
                    { style: { display: 'flex', width: '100%', height: '100%', flexDirection: 'column' } },
                    React.createElement(
                        'h4',
                        null,
                        "Todo List"
                    ),
                    React.createElement(
                        'div',
                        { style: { padding: '0 20px' } },
                        React.createElement(_materialUi.TextField, {
                            value: this.state.input,
                            fullWidth: true,
                            onKeyDown: this.handleNewTaskKeyDown.bind(this),
                            hintText: globalMessages['ajxp_admin.home.76'],
                            onChange: function (e, val) {
                                _this.setState({ input: val });
                            }
                        })
                    ),
                    React.createElement(
                        'div',
                        { style: { padding: '0 20px', flex: 1, overflowY: 'auto' } },
                        tasks
                    )
                )
            );
        }
    }]);

    return ToDoList;
})(_react.Component);

ToDoList.propTypes = {
    title: _react.PropTypes.string
};

exports['default'] = ToDoList = PydioContextConsumer(ToDoList);
exports['default'] = ToDoList = asGridItem(ToDoList, globalMessages['ajxp_admin.home.75'], { gridWidth: 2, gridHeight: 26 }, [{ name: 'title', label: globalMessages['ajxp_admin.home.30'], type: 'string', mandatory: true, 'default': globalMessages['ajxp_admin.home.75'] }]);

exports['default'] = ToDoList;
module.exports = exports['default'];

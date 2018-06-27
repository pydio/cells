'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

exports['default'] = function (PydioComponent) {
    var ReloadWrapper = (function (_Component) {
        _inherits(ReloadWrapper, _Component);

        function ReloadWrapper() {
            _classCallCheck(this, ReloadWrapper);

            _get(Object.getPrototypeOf(ReloadWrapper.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(ReloadWrapper, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this = this;

                if (this.props.interval) {
                    this.interval = setInterval(function () {
                        _this.refs['component'].triggerReload();
                    }, this.props.interval * 1000);
                }
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                if (this.interval) {
                    clearInterval(this.interval);
                }
            }
        }, {
            key: 'render',
            value: function render() {

                return React.createElement(PydioComponent, _extends({}, this.props, { ref: 'component' }));
            }
        }]);

        return ReloadWrapper;
    })(Component);

    ReloadWrapper.propTypes = {
        interval: PropTypes.number
    };

    ReloadWrapper.displayName = PydioComponent.displayName || PydioComponent.name;

    return ReloadWrapper;
};

;
module.exports = exports['default'];

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var AbstractDialogModifier = _Pydio$requireLib.AbstractDialogModifier;

var LoginMessage = function LoginMessage() {
    return React.createElement(
        'div',
        null,
        React.createElement(
            'div',
            null,
            'Please use one of the following username / password to log in :'
        ),
        React.createElement('br', null),
        React.createElement(
            'div',
            null,
            '- admin / admin'
        ),
        React.createElement(
            'div',
            null,
            '- demo / demo'
        ),
        React.createElement(
            'div',
            null,
            '- alice / P@ssw0rd'
        ),
        React.createElement(
            'div',
            null,
            '- bob / P@ssw0rd'
        )
    );
};

var LoginDialogModifier = (function (_AbstractDialogModifier) {
    _inherits(LoginDialogModifier, _AbstractDialogModifier);

    function LoginDialogModifier() {
        _classCallCheck(this, LoginDialogModifier);

        _get(Object.getPrototypeOf(LoginDialogModifier.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(LoginDialogModifier, [{
        key: 'renderAdditionalComponents',
        value: function renderAdditionalComponents(props, state, accumulator) {
            accumulator.top.push(React.createElement(LoginMessage, null));
        }
    }]);

    return LoginDialogModifier;
})(AbstractDialogModifier);

exports['default'] = LoginDialogModifier;
module.exports = exports['default'];

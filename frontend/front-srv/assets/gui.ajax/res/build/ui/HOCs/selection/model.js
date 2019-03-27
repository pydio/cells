"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SelectionModel = (function () {
    function SelectionModel() {
        var selection = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
        var currentIndex = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        _classCallCheck(this, SelectionModel);

        this.selection = selection;
        this.currentIndex = currentIndex;
    }

    SelectionModel.prototype.length = function length() {
        return this.selection.length;
    };

    SelectionModel.prototype.hasNext = function hasNext() {
        return this.currentIndex < this.selection.length - 1;
    };

    SelectionModel.prototype.hasPrevious = function hasPrevious() {
        return this.currentIndex > 0;
    };

    SelectionModel.prototype.current = function current() {
        return this.selection[this.currentIndex];
    };

    SelectionModel.prototype.next = function next() {
        if (this.hasNext()) {
            this.currentIndex++;
        }
        return this.current();
    };

    SelectionModel.prototype.previous = function previous() {
        if (this.hasPrevious()) {
            this.currentIndex--;
        }
        return this.current();
    };

    SelectionModel.prototype.first = function first() {
        return this.selection[0];
    };

    SelectionModel.prototype.last = function last() {
        return this.selection[this.selection.length - 1];
    };

    SelectionModel.prototype.nextOrFirst = function nextOrFirst() {
        if (this.hasNext()) this.currentIndex++;else this.currentIndex = 0;
        return this.current();
    };

    return SelectionModel;
})();

exports["default"] = SelectionModel;
module.exports = exports["default"];

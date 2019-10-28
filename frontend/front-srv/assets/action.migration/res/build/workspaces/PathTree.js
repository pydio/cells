/**
 * Tool to arrange a list of path into a tree, and then find the common roots
 * that could be used as datasources
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PathTree = (function () {
    function PathTree(paths) {
        var _this = this;

        var separator = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

        _classCallCheck(this, PathTree);

        this.SEPARATOR = separator;

        // Make sure all paths start with a '/'
        this.paths = paths.map(function (p) {
            return p[0] === _this.SEPARATOR ? p : _this.SEPARATOR + p;
        });

        this.tree = this.arrangeIntoTree(this.paths);
        this.newRoots = [];
        this.links = [];

        this.flattenTree(this.tree, this.newRoots, this.links);

        var flattened = this.flatten(this.tree);
    }

    _createClass(PathTree, [{
        key: "flatten",
        value: function flatten(arr) {
            var _this2 = this;

            if (Array.isArray(arr)) {
                return arr.reduce(function (done, curr) {
                    return curr && done.concat(_this2.flatten(curr), _this2.flatten(curr.children));
                }, []);
            } else {
                return arr;
            }
        }
    }, {
        key: "getNewRoots",
        value: function getNewRoots(f) {
            if (typeof f === "function") {
                return this.newRoots.filter(f);
            }
            return;
        }
    }, {
        key: "getLinks",
        value: function getLinks(f) {
            var _this3 = this;

            var rootIdx = 0;
            var links = this.newRoots.filter(f).reduce(function (acc, root) {
                var index = _this3.paths.map(function (path, idx) {
                    if (path.startsWith(root.ds) || path.startsWith(root.ds, 1)) {
                        acc = [].concat(_toConsumableArray(acc), [{
                            left: idx,
                            right: rootIdx,
                            color: "#e0e0e0",
                            type: "ds"
                        }]);
                    }
                });

                rootIdx++;

                return acc;
            }, []);

            return links;
        }

        /**
         * Create Tree structure from list of Paths
         * @param paths
         * @return {Array}
         */
    }, {
        key: "arrangeIntoTree",
        value: function arrangeIntoTree(paths) {
            var _this4 = this;

            var tree = [];

            paths.forEach(function (path, wsIndex) {

                var pathParts = path.split(_this4.SEPARATOR);
                pathParts.shift();

                var currentLevel = tree; // initialize currentLevel to root

                pathParts.forEach(function (part, partIndex) {

                    var isLastPart = partIndex === pathParts.length - 1;

                    // check to see if the path already exists.
                    var existing = currentLevel.filter(function (branch) {
                        return branch.name === part;
                    });

                    if (existing.length) {
                        var existingPath = existing[0];
                        // The path to this item was already in the tree, so don't add it again.
                        // Set the current level to this path's children
                        currentLevel = existingPath.children;
                        if (isLastPart) {
                            existingPath.workspaces.push(wsIndex);
                        }
                    } else {
                        var newPart = {
                            name: part,
                            children: [],
                            workspaces: []
                        };
                        if (isLastPart) {
                            newPart.workspaces.push(wsIndex);
                        }
                        currentLevel.push(newPart);
                        currentLevel = newPart.children;
                    }
                });
            });

            return tree;
        }

        /**
         * Recursively crawl tree into a list of common roots containing some informations.
         * The output roots are objects that can be either
         *      {ds:"path of the datasource"}
         *      {template:"full path of the template (e.g. AJXP_DATA_PATH/personal/AJXP_USER)", parentDs:"on which datasource it should be created"}
         * The output links are simple objects used by the canvas for linking dots.
         *      {left: "index in leftList", right: "index in rightList", color:"html color", weak: boolean}
         * The "weak" property is used whenever a workspace is associated to a template Path, it also shows that it would be associated to a datasource as well.
         *
         * @param branches
         * @param newRoots
         * @param links
         * @param parentPath
         * @param hasParentRoot
         */
    }, {
        key: "flattenTree",
        value: function flattenTree(branches, newRoots, links) {
            var _this5 = this;

            var parentPath = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];
            var hasParentRoot = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];

            branches.forEach(function (branch) {
                var children = branch.children;
                var name = branch.name;
                var workspaces = branch.workspaces;

                var parent = [].concat(_toConsumableArray(parentPath), [name]);

                var branchHasRoot = hasParentRoot;
                var pathName = parent.join(_this5.SEPARATOR);

                if (!(pathName.indexOf('AJXP_') === 0)) {
                    pathName = _this5.SEPARATOR + pathName;
                }

                if (children.length > 1 || hasParentRoot === -1 && children.length === 0) {
                    branchHasRoot = newRoots.length;
                    if (pathName.indexOf('AJXP_USER') > -1) {
                        // There will be a template path on that one - use parent dir as datasource instead
                        var parents = [].concat(_toConsumableArray(parent));
                        parents.pop();
                        newRoots.push({ ds: parents.join('/') });
                    } else {
                        newRoots.push({ ds: pathName });
                    }
                }

                if (workspaces.length && branchHasRoot > -1) {
                    workspaces.forEach(function (wsIndex) {
                        if (pathName.indexOf('AJXP_USER') > -1) {
                            var tPathIndex = newRoots.length;
                            newRoots.push({ template: pathName, parentDs: newRoots[branchHasRoot].ds, ws: wsIndex });
                            links.push({ left: wsIndex, right: branchHasRoot, color: "#e0e0e0", type: "ds", weak: true }); // Link to datasource
                            links.push({ left: wsIndex, right: tPathIndex, color: "#1565c0", type: "tp" }); // Link to template
                        } else {
                                links.push({ left: wsIndex, right: branchHasRoot, color: "#78909c", type: "ds" });
                                newRoots.push({ template: pathName, parentDs: newRoots[branchHasRoot].ds, ws: wsIndex });
                            }
                    });
                }

                if (children.length) {
                    _this5.flattenTree(children, newRoots, links, parent, branchHasRoot);
                }
            });
        }
    }]);

    return PathTree;
})();

exports["default"] = PathTree;
module.exports = exports["default"];

/**
 * Tool to arrange a list of path into a tree, and then find the common roots
 * that could be used as datasources
 */
class PathTree {

    constructor(paths, separator = '/') {
        this.SEPARATOR = separator;

        // Make sure all paths start with a '/'
        this.paths = paths.map(p => p[0] === this.SEPARATOR ? p : this.SEPARATOR + p)

        this.tree = this.arrangeIntoTree(this.paths);
        this.newRoots = [];
        this.links = [];

        this.flattenTree(this.tree, this.newRoots, this.links);

        const flattened = this.flatten(this.tree)
    }

    flatten(arr) {
        if (Array.isArray(arr)) {
            return arr.reduce((done, curr) => curr && done.concat(this.flatten(curr), this.flatten(curr.children)), []);
        } else {
            return arr;
        }
    }

    getNewRoots(f) {
        if (typeof f === "function") {
            return this.newRoots.filter(f)
        }
        return;
    }

    getLinks(f) {
        let rootIdx = 0
        const links = this.newRoots.filter(f).reduce((acc, root) => {
            const index = this.paths.map((path, idx) => {
                if (path.startsWith(root.ds) || path.startsWith(root.ds, 1)) {
                    acc = [...acc, {
                        left: idx,
                        right: rootIdx,
                        color: "#e0e0e0",
                        type: "ds"
                    }]
                }
            })

            rootIdx++

            return acc
        }, [])

        return links;
    }

    /**
     * Create Tree structure from list of Paths
     * @param paths
     * @return {Array}
     */
    arrangeIntoTree(paths) {
        let tree = [];

        paths.forEach((path, wsIndex)  => {

            const pathParts = path.split(this.SEPARATOR);
            pathParts.shift()

            let currentLevel = tree; // initialize currentLevel to root

            pathParts.forEach((part, partIndex) => {

                const isLastPart = (partIndex === pathParts.length - 1);

                // check to see if the path already exists.
                const existing = currentLevel.filter(branch => branch.name === part);

                if (existing.length) {
                    const existingPath = existing[0];
                    // The path to this item was already in the tree, so don't add it again.
                    // Set the current level to this path's children
                    currentLevel = existingPath.children;
                    if(isLastPart){
                        existingPath.workspaces.push(wsIndex);
                    }
                } else {
                    const newPart = {
                        name: part,
                        children: [],
                        workspaces: [],
                    };
                    if(isLastPart){
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
    flattenTree(branches, newRoots, links, parentPath = [], hasParentRoot = -1){
        branches.forEach(branch => {
            const {children, name, workspaces} = branch;
            const parent = [...parentPath, name];

            let branchHasRoot = hasParentRoot;
            let pathName = parent.join(this.SEPARATOR);

            if(!(pathName.indexOf('AJXP_') === 0)){
                pathName = this.SEPARATOR + pathName;
            }

            if(children.length > 1 || (hasParentRoot === -1 && children.length === 0)){
                branchHasRoot = newRoots.length;
                if(pathName.indexOf('AJXP_USER') > -1){
                    // There will be a template path on that one - use parent dir as datasource instead
                    const parents = [...parent];
                    parents.pop();
                    newRoots.push({ds:parents.join('/')});
                } else {
                    newRoots.push({ds:pathName});
                }
            }

            if(workspaces.length && branchHasRoot > -1){
                workspaces.forEach(wsIndex => {
                    if(pathName.indexOf('AJXP_USER') > -1){
                        const tPathIndex = newRoots.length;
                        newRoots.push({template: pathName, parentDs:newRoots[branchHasRoot].ds, ws: wsIndex});
                        links.push({left:wsIndex, right:branchHasRoot, color: "#e0e0e0", type: "ds", weak:true}); // Link to datasource
                        links.push({left:wsIndex, right:tPathIndex, color: "#1565c0", type: "tp"}); // Link to template
                    } else {
                        links.push({left:wsIndex, right:branchHasRoot, color: "#78909c", type: "ds"});
                        newRoots.push({template: pathName, parentDs:newRoots[branchHasRoot].ds, ws: wsIndex});
                    }
                });
            }

            if (children.length){
                this.flattenTree(children, newRoots, links, parent, branchHasRoot);
            }
        })
    }
}

export {PathTree as default}

const _docgen = require('react-docgen');
const resolver = _docgen.resolver.findAllComponentDefinitions
const {normalizeClassDefinition, getMemberValuePath, getMethodDocumentation} = _docgen.utils;
const handlers = _docgen.handlers;
const {types: {namedTypes: types}} = require('recast');

const {PydioCoreRequires} = require('../../res/js/dist/libdefs')
const PydioUILibs = {
    Form: 'form',
    ReactUI: 'boot',
    Components: 'components',
    HOCs: 'hoc',
    Workspaces: 'workspaces'
};

const PydioCoreLibResolver = function( ast, recast ) {

    const types = recast.types.namedTypes;
    let definitions = [];

    function classVisitor(path) {
        definitions.push(path);
        return false;
    }

    recast.visit(ast, {
        visitClassExpression: classVisitor,
        visitClassDeclaration: classVisitor
    });

    return definitions;
};

const PydioCoreMethodsHandler =  function(documentation,path) {
    // Extract all methods from the class or object.
    let methodPaths = [];
    if (types.ClassDeclaration.check(path.node) || types.ClassExpression.check(path.node)) {
        methodPaths = path.get('body', 'body').filter(p => types.MethodDefinition.check(p.node));
    } else if (types.ObjectExpression.check(path.node)) {
        methodPaths = path.get('properties').filter( p => types.FunctionExpression.check(p.get('value').node) );

        // Add the statics object properties.
        const statics = getMemberValuePath(path, 'statics');
        if (statics) {
            statics.get('properties').each(p => {
                if (isFunctionExpression(p)) {
                    p.node.static = true;
                    methodPaths.push(p);
                }
            });
        }
    }
    const methods = methodPaths.map((p) => {
        return getMethodDocumentation(p);
    });
    documentation.set('methods', methods);
}

const coreHandlers = [
    handlers.propTypeHandler,
    handlers.propTypeCompositionHandler,
    handlers.propDocBlockHandler,
    handlers.flowTypeHandler,
    handlers.flowTypeDocBlockHandler,
    handlers.defaultPropsHandler,
    handlers.componentDocblockHandler,
    handlers.displayNameHandler,
    PydioCoreMethodsHandler,
    handlers.componentMethodsJsDocHandler,
];


module.exports = function(grunt){
    grunt.registerMultiTask('docgen', 'Generate docs for react components', function () {
        //grunt.log.writeln(this.data.files + ': ' + this.target);

        let allDocs = {};

        this.data.files.forEach((patternObject) => {

            grunt.log.writeln('Expanding ' + patternObject.cwd);
            const allFiles = grunt.file.expand(patternObject, patternObject.src);
            grunt.log.writeln('Found ' + allFiles.length + ' files');

            allFiles.forEach((filePath) => {

                if(filePath.indexOf('build/') > -1) return;
                const isPydioCore = filePath.indexOf('res/js/core') > -1;

                try{
                    const src = grunt.file.read(patternObject.cwd + '/' + filePath);
                    let doc = _docgen.parse(src, isPydioCore ? PydioCoreLibResolver : resolver, isPydioCore ? coreHandlers : null );

                    filePath = filePath.replace('../', '').replace('res/react/', '').replace('res/js/', '').replace('/react/', '/');
                    const pluginId = filePath.split('/').shift();
                    if(pluginId === 'gui.ajax'){
                        filePath = filePath.replace('ui/', '');
                        const className = filePath.split('/').pop().replace('.js', '').replace('.es6', '');
                        if(isPydioCore){
                            if(className === 'Pydio'){
                                doc[0]['require'] = "const "+className+" = require('pydio')";
                            }else{
                                Object.keys(PydioCoreRequires).forEach((coreLibFile) => {
                                    if(filePath.endsWith(coreLibFile.replace('.js', '.es6'))) {
                                        doc[0]['require'] = "const "+className+" = require('"+PydioCoreRequires[coreLibFile]+"')";
                                    }
                                });
                            }
                        }
                        Object.keys(PydioUILibs).forEach((uiLibFile) => {
                            if(filePath.indexOf(uiLibFile + '/') > -1) {
                                doc[0]['require'] = "const {"+className+"} = require('pydio').requireLib('"+PydioUILibs[uiLibFile]+"')";
                                //grunt.log.writeln(doc[0]['require']);
                            }
                        });
                    }
                    if(!allDocs[pluginId]){
                        allDocs[pluginId] = {};
                    }
                    allDocs[pluginId][filePath.replace(pluginId + '/', '')] = doc;
                    grunt.log.writeln('[OK] Parsed ' + filePath + ' successfully');
                }catch(e){
                    grunt.verbose.writeln('[SKIP] Skipping ' + filePath + ' (' + e.message + ')');
                }
            });

            //grunt.log.writeln('All Docs' + Object.keys(allDocs));
            grunt.file.write(patternObject.dest, JSON.stringify(allDocs, null, 2));
            grunt.log.writeln('File ' + patternObject.dest + ' written');

        });
    });
}

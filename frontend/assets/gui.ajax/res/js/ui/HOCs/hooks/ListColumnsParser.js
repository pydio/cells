import Pydio from 'pydio'
import XMLUtils from 'pydio/util/xml'
import ResourcesManager from 'pydio/http/resources-manager'

class ListColumnsParser {

    constructor(renderLabel = undefined) {
        this.renderLabel = renderLabel;
    }

    getDefaultListColumns(pydio) {
        return {
            ajxp_label:{
                name:'ajxp_label',
                label: pydio.MessageHash['1'],
                message:'1',
                width: '50%',
                renderCell:this.renderLabel,
                sortType:'file-natural',
                remoteSortAttribute:'name'
            },
            bytesize:{
                label:pydio.MessageHash['2'],
                message:'2',
                sortType:'number',
                sortAttribute:'bytesize',
                name:'bytesize',
                remoteSortAttribute:'size'
            },
            mimestring:{
                label:pydio.MessageHash['3'],
                message:'3',
                name:'mimestring',
                sortType:'string'
            },
            ajxp_modiftime:{
                label:pydio.MessageHash['4'],
                message:'4',
                sortType:'number',
                name:'ajxp_modiftime',
                remoteSortAttribute:'mtime'
            }
        };
    }

    loadConfigs() {

        let columnsNodes = XMLUtils.XPathSelectNodes(Pydio.getInstance().getXmlRegistry(), 'client_configs/component_config[@component="FilesList"]/columns/column|client_configs/component_config[@component="FilesList"]/columns/additional_column');
        let columns = {};
        let messages = Pydio.getMessages();
        const proms = [];
        columnsNodes.forEach((colNode) => {
            let name = colNode.getAttribute('attributeName');
            let sortType = colNode.getAttribute('sortType');
            const sorts = {'String':'string', 'StringDirFile':'string', 'MyDate':'number', 'CellSorterValue': 'number', 'Number': 'number'};
            sortType = sorts[sortType] || 'string';
            if(name === 'bytesize') {
                sortType = 'number';
            }
            const message = colNode.getAttribute('messageId')
            let label = messages[message]
            if(colNode.getAttribute('messageString')) {
                label = colNode.getAttribute('messageString')
            }
            let remoteSortAttribute
            switch (name) {
                case 'ajxp_label':
                    remoteSortAttribute = 'name'
                    break;
                case 'bytesize':
                    remoteSortAttribute = 'size'
                    break
                case 'ajxp_modiftime':
                    remoteSortAttribute = 'mtime'
                    break;
                default:
                    break
            }
            columns[name] = {
                message     : message,
                label       : label,
                name        : name,
                sortType    : sortType,
                inlineHide  : colNode.getAttribute('defaultVisibilty') === "false",
                remoteSortAttribute
            };
            if(name === 'ajxp_label' && this.renderLabel) {
                columns[name].renderCell = this.renderLabel;
            }
        });
        if (Pydio.getInstance().Registry.hasPluginOfType("meta", "user")) {
            proms.push(ResourcesManager.loadClass('ReactMeta').then(c => {
                const {MetaClient, Renderer} = c;
                return MetaClient.getInstance().loadConfigs().then(metas => {
                    metas.forEach((v,k)=>{
                        if(v.type !== 'json'){
                            columns[k] = {
                                label:      v.label,
                                inlineHide: !v.visible,
                                ...Renderer.typeColumnRenderer(v.type),
                                nsData:     v.data
                            }
                        }
                    })
                })
            }))
        }
        return Promise.all(proms).then(()=> {
            return columns || this.getDefaultListColumns(Pydio.getInstance());
        })
    }

}

export {ListColumnsParser}
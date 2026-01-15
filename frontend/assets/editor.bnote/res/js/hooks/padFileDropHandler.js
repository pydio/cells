import Pydio from 'pydio'
import ResourcesManager from 'pydio/http/resources-manager'
import {DroppedMonitorSpecType} from "../specs/NodeRef";


export const padFileDropHandler = (editor, e, outside = false) => {
    if(e.dataTransfer.items.length !== 1) {
        return
    }
    e.stopPropagation()
    e.preventDefault()

    ResourcesManager.loadClass('UploaderModel').then(({Store}) => {
        let block;
        if(outside) {
            block = editor.document.pop()
            console.log("Dropped outside:",e.dataTransfer.items.length);
        } else {
            const el = document.elementFromPoint(
                e.clientX,
                e.clientY
            );
            // walk up until you find the block container
            const blockEl = el.closest("[data-id]");
            const blockId = blockEl.getAttribute("data-id");
            block = editor.getBlock(blockId)
            console.log("Dropped over block:",e.dataTransfer.items.length, blockId);
        }
        const ctxNode = Pydio.getInstance().getContextNode()
        Store.getInstance().handleDropEventResults(e.dataTransfer.items, e.dataTransfer.files, ctxNode).then((session) => {
            editor.insertBlocks([{type:DroppedMonitorSpecType, props:{sessionUuid: session.getUuid()}}], block, 'after')
        })
    })
}
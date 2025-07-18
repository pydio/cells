import Pydio from 'pydio'
import ResourcesManager from 'pydio/http/resources-manager'
import {NodeBlockSpecType} from "../specs/NodeRef";

// TODO - NOT FINISHED
export const padFileDropHandler = (editor, e) => {
    e.stopPropagation()
    e.preventDefault()
    if(e.dataTransfer.items.length || e.dataTransfer.files.length) {
        ResourcesManager.loadClass('UploaderModel').then(({Store}) => {
            const el = document.elementFromPoint(
                e.clientX,
                e.clientY
            );
            // walk up until you find the block container
            const blockEl = el.closest("[data-id]");
            const blockId = blockEl.getAttribute("data-id");
            const block = editor.getBlock(blockId)
            console.log("Dropped over block:",e.dataTransfer.items.length, e.dataTransfer.files.length, blockId);
            const ctxNode = Pydio.getInstance().getContextNode()
            ctxNode.observeOnce("child_added", (data) => {
                const child = ctxNode.findChildByPath(data)
                console.log('here', child)
                const obs = (n) => {
                    if(n.getMetadata().get('uuid')) {
                        const newID = n.getMetadata().get('uuid')
                        editor.insertBlocks([{type:NodeBlockSpecType, props:{nodeUuid:newID}}], block, 'after')
                        child.stopObserving('node_replaced', obs)
                    }
                };
                child.observe('node_replaced', obs)
            })
            const session = Store.getInstance().handleDropEventResults(e.dataTransfer.items, e.dataTransfer.files, ctxNode)
            session.observe('status', (memo) => {
                console.log(memo, session)
                if(memo === 'ready') {
                    session.walk((child)=> {
                        if(child.getStatus()==='loaded') {
                            console.log('LOADED!', child)
                        } else {
                            child.observe('status', (st) => {
                                if(st === 'loaded') {
                                    console.log('Child status loaded', child)
                                }
                            })
                        }
                    })
                }
            })
        })
    }
}
import Pydio from 'pydio'
import {saveNow} from "./hooks";

export const Callbacks = {

    toggleKnowledgeBase() {
        const pydio = Pydio.getInstance()
        const ctxNode = pydio.getContextNode()
        const metaName = pydio.getPluginConfigs('editor.bnote').get('BNOTE_KNOWLEDGE_BASE')
        if(!metaName) {
            return
        }
        const meta = ctxNode.getMetadata()
        const enabled = meta.get(metaName) || false
        saveNow(!enabled, metaName, ctxNode.getMetadata().get('uuid')).then(() => {
            meta.set(metaName, !enabled)
            ctxNode.setMetadata(meta, true)
        })

    }

}
import {useEffect, useMemo, useState} from "react";
import {debounce} from "lodash";
import {defaultHeaderBlocks, findExistingHeader} from "./useNodeTitle";

import {saveMeta} from "./saveMeta";

export const useNodeContent = (node, contentMeta, withDefaultHeader) => {

    const [loaded, setLoaded] = useState(false)
    const [trigger, trig] = useState(0)
    const [content, setContent] = useState([])
    const [dirty, setDirty] = useState(false)

    const nodeLoaded = node.isLoaded()
    const nodeUUID = node.getMetadata().get('uuid')

    const save = useMemo(
        () =>
            debounce((blocks) => saveMeta(blocks, contentMeta, nodeUUID, setDirty), 1500), [nodeUUID])

    const saveImmediate = useMemo(() => (blocks) => saveMeta(blocks, contentMeta, nodeUUID, setDirty), [nodeUUID])

    useEffect(() => {
        setLoaded(false)
        setContent([])
        trig(trigger + 1)
    }, [node, nodeLoaded, nodeUUID])

    useEffect(() => {
        if (loaded) {
            return
        }
        let ct = []
        if (node && node.getMetadata().has(contentMeta)) {
            ct = node.getMetadata().get(contentMeta)
        }
        if (withDefaultHeader) {
            if (!findExistingHeader(ct)) {
                ct = [...defaultHeaderBlocks(), ...ct]
            }
        }
        setContent(ct)
        setLoaded(true)
    }, [loaded, trigger]);

    return {loaded, content, save, saveNow: saveImmediate, dirty, setDirty}

}
import {useState, useEffect, useMemo} from 'react';
import {debounce} from "lodash";
import Pydio from 'pydio'

export const useNodeContent = (node, autoCreate = false) => {

    const [loaded, setLoaded] = useState(false)
    const [content, setContent] = useState('')
    const [padSource, setPadSource] = useState(null)

    const save = useMemo(
        () =>
            debounce((blocks)=>{
                if(!padSource) {
                    // Do nothing
                    return
                }
                const bb = blocks.map(b => {
                    if(b.type === 'childrenList') {
                        delete(b.props.node)
                    }
                    return b;
                });
                Pydio.getInstance().ApiClient.postPlainTextContent(padSource, JSON.stringify(bb), (success) => {
                    console.log('Saved!')
                });
            }, 1500), [padSource])

    useEffect(()=>{
        setLoaded(false)
        if(!node || !node.getMetadata().has('usermeta-pad-source')) {
            setPadSource(null)
            setContent([])
            setLoaded(true)
            return
        }
        const padSource = node.getMetadata().get('usermeta-pad-source');
        const sourceNode = new AjxpNode(padSource, true, '')
        setPadSource(sourceNode)
    }, [node]);

    useEffect(() => {
        if(!padSource) {
            setLoaded(true)
            return
        }
        Pydio.getInstance().ApiClient.getPlainContent(padSource, (content) => {
            if(content) {
                setContent(JSON.parse(content));
            } else {
                setContent([])
            }
            setLoaded(true)
        })
    }, [padSource]);

    return {hasMeta: loaded, loaded, content, save}

}
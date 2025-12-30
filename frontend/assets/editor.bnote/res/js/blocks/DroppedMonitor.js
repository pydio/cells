import React, {useEffect, useState} from 'react'
import ResourcesManager from 'pydio/http/resources-manager'
import Pydio from 'pydio'
import {NodeBlockSpecType} from "../specs/NodeRef";
import {Progress} from '@mantine/core'

export const DroppedMonitor = ({editor, block}) => {

    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [session, setSession] = useState(null);

    useEffect(() => {
        const ctxNode = Pydio.getInstance().getContextNode()
        ctxNode.observeOnce("child_added", (data) => {
            const child = ctxNode.findChildByPath(data)
            const obs = (n) => {
                if(n.getMetadata().get('uuid')) {
                    const newID = n.getMetadata().get('uuid')
                    editor.replaceBlocks([block.id], [{type:NodeBlockSpecType, props:{nodeUuid:newID}}])
                    child.stopObserving('node_replaced', obs)
                }
            };
            child.observe('node_replaced', obs)
        })
    }, []);

    useEffect(() => {
        if(!session){
            return;
        }
        setStatus(session.getStatus())
        session.observe('progress', (memo) => {
            setProgress(memo);
        })
        session.observe('status', (memo) => {
            setStatus(memo);
        })
        return () => {
            // Unsubscribe
        }
    }, [session]);

    useEffect(() => {
        const {sessionUuid} = block.props;
        ResourcesManager.loadClass('UploaderModel').then(({Store}) => {
            const session = Store.getInstance().sessionByUuid(sessionUuid);
            setSession(session);
        })
    }, [])

    let readStatus = status;
    if(status === 'analyze' && session) {
        readStatus = session.getAnalyzeStatus()
    }

    return (
        <div style={{width:320}}>
            <div>{readStatus}</div>
            <Progress value={progress} size={"xs"}/>
        </div>
    )
}
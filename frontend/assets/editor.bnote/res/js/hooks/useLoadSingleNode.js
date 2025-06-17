import {useEffect, useState} from 'react'
import {NodeServiceApi} from 'cells-sdk-ts'
import axios from "axios";
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import AjxpNode from 'pydio/model/node';
import PathUtils from 'pydio/util/path'

export const useResolveSingleNode = ({nodeUuid, setNode, setError}) => {
    useEffect(() => {
        if(!nodeUuid) {
            return
        }
        const pydio = Pydio.getInstance()
        PydioApi.getRestClient().getOrUpdateJwt().then(token => {
            const frontU = pydio.getFrontendUrl();
            const url = `${frontU.protocol}//${frontU.host}/`;
            console.log(url + pydio.Parameters.get('ENDPOINT_REST_API_V2'))
            const instance = axios.create({
                baseURL: url + pydio.Parameters.get('ENDPOINT_REST_API_V2'),
                timeout: 3000,
                headers: {
                    Authorization:'Bearer ' + token
                }
            });
            const api= new NodeServiceApi(undefined, undefined, instance)
            api.getByUuid(nodeUuid).then(res => {
                const fullPathParts = res.data.Path.split('/')
                const slug = fullPathParts.shift()
                const path = '/' + fullPathParts.join('/')
                let repositoryId;
                Pydio.getInstance().user.getRepositoriesList().forEach((r) => {
                    if(r.getSlug() === slug) {
                        repositoryId = r.getId()
                    }
                })
                if(!repositoryId) {
                    setError(new Error('repository not found'))
                    return
                }
                const node = new AjxpNode(path, res.data.Type === 'LEAF', PathUtils.getBasename(path))
                node.getMetadata().set('repository_id', repositoryId)
                setNode(node)
            }).catch((e) => {
                setError(e)
            })
        })
    }, [nodeUuid, setNode, setError]);

}

export const useLoadSingleNode = ({dataModel, nodeUuid, setNode, setError}) => {
    const [resolvedNode, setResolvedNode] = useState(null)
    useEffect(() => {
        if(!resolvedNode) {
            return
        }
        dataModel.getAjxpNodeProvider().loadLeafNodeSync(resolvedNode, (n)=>{
            n.getMetadata().set('repository_id', resolvedNode.getMetadata().get('repository_id'))
            n.setParent(new AjxpNode()) // Add a fake parent to avoid errors when opening editors
            setNode(n)
        }, true, {}, (e)=>{setError(e || {message:'not found'})})
    }, [resolvedNode]);
    useResolveSingleNode({nodeUuid, setNode: setResolvedNode, setError})
}
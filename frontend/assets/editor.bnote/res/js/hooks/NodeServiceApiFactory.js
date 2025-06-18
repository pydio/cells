import {NodeServiceApi} from 'cells-sdk-ts'
import axios from "axios";
import PydioApi from 'pydio/http/api'

/**
 *
 * @param pydio
 * @returns {Promise<NodeServiceApi>}
 * @constructor
 */
export const NodeServiceApiFactory = (pydio) => {
    return PydioApi.getRestClient().getOrUpdateJwt().then(token => {
        const frontU = pydio.getFrontendUrl();
        const url = `${frontU.protocol}//${frontU.host}`;
        const baseURL = url + pydio.Parameters.get('ENDPOINT_REST_API_V2');
        const instance = axios.create({
            baseURL,
            timeout: 3000,
            headers: {
                Authorization:'Bearer ' + token
            }
        });
        return new NodeServiceApi(undefined, undefined, instance)
    })
}
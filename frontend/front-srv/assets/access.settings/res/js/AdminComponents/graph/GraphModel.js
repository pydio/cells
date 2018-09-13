/**
 * PROTO FOR one point for a graph
 message TimeRangeResult{
    // a label for this time range
    string Name = 1;
    // begin timestamp
    int64 Start = 2;
    // end timestamp
    int64 End = 3;
    // nb of occurences found within this range
    int Count = 4;
    // a score between 1 and 100 that gives the relevance of this result:
    // if End > now, we ponderate the returned count with the duration of the last time range
    // for instance for a hour range if now is 6PM, last count will be
    // multiplied by 4/3 and have a relevance of 75.
    // Relevance will be almost always equals to 100
    int Relevance = 5;
}
 */
import PydioApi from 'pydio/http/api'
import ResourcesManager from 'pydio/http/resources-manager'
import {LogTimeRangeRequest} from 'pydio/http/rest-api'

class GraphModel {

    static makeStubResult(name, hoursFrom, refTime, frequency, count, relevance = 100) {
        let refUnix;
        if(refTime === undefined){
            refUnix = Math.floor(Date.now() / 1000);
        } else {
            refUnix = Math.floor(refTime / 1000);
        }
        const start = refUnix - (hoursFrom * 60 * 60 * (frequency === 'D' ? 24 : 1));
        const end = refUnix - ((hoursFrom + 1) * 60 * 60 * (frequency === 'D' ? 24 : 1));
        return {Name:name, Start:start, End: end, Count: count, Relevance: relevance};
    }

    static stubData(frequency, refTime) {
        return [
            GraphModel.makeStubResult("Upload", 1, refTime, frequency, 10),
            GraphModel.makeStubResult("Upload", 2, refTime, frequency, 5),
            GraphModel.makeStubResult("Upload", 3, refTime, frequency, 2),
            GraphModel.makeStubResult("Upload", 4, refTime, frequency, 40),
            GraphModel.makeStubResult("Upload", 5, refTime, frequency, 30),
            GraphModel.makeStubResult("Upload", 6, refTime, frequency, 0),
            GraphModel.makeStubResult("Upload", 7, refTime, frequency, 10),
            GraphModel.makeStubResult("Upload", 8, refTime, frequency, 12),
            GraphModel.makeStubResult("Upload", 9, refTime, frequency, 12),
            GraphModel.makeStubResult("Upload", 10, refTime, frequency, 12),
        ];
    }

    static stubLinks(frequency, refTime) {
        let refUnix;
        if (refTime === undefined) {
            refUnix = Math.floor(Date.now() / 1000);
        } else {
            refUnix = Math.floor(refTime / 1000);
        }
        let links = [];
        if (refTime !== undefined) {
            links.push({count: '10', cursor: '10', rel: 'previous'});
        }
        links.push({count: '10', cursor: '10', rel: 'next'});
        return links;
    }

    static queryNameToMsgId(queryName){
        return {
            LoginSuccess:   "1",
            LoginFailed :   "2",
            NodeCreate:     "11",
            NodeRead:       "12",
            NodeList:       "13",
            NodeUpdate:     "14",
            NodeDelete:     "15",
            ObjectGet:      "21",
            ObjectPut:      "22"
        }[queryName];
    }

    constructor(stub = false){
        this.stub = stub;
    }

    /**
     *
     * @return {Promise<{labels: Array, points: Array}>}
     */
    loadData(queryName, frequency, refTime){
        if(this.stub){
            const data = GraphModel.stubData(frequency, refTime);
            const stubLinks = GraphModel.stubLinks(frequency, refTime);
            return Promise.resolve(this.parseData(data, stubLinks));
        } else {
            return ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                const api = new sdk.EnterpriseLogServiceApi(PydioApi.getRestClient());
                let request = new sdk.LogTimeRangeRequest();
                request.MsgId = GraphModel.queryNameToMsgId(queryName);
                let refUnix;
                if (refTime) {
                    refUnix = refTime;
                } else {
                    refUnix = Math.floor(Date.now() / 1000);
                }
                request.RefTime = refUnix;
                request.TimeRangeType = frequency;
                return api.auditChartData(request).then(result => {
                    let labels = [], points = [], links = [];
                    if(result.Results){
                        result.Results.map((res) => {
                            labels.push(res.Name);
                            points.push(res.Count || 0);
                        })
                    }
                    if(result.Links){
                        result.Links.map(link => {
                            links.push(link);
                        })
                    }
                    return{labels, points, links};
                })
            });
        }
    }

    /**
     *
     * @param data
     * @return {{labels: Array, points: Array}}
     */
    parseData(data, links){
        const labels = [];
        const points = [];
        data.map(entry => {
            const start = entry.Start;
            const date = new Date(start * 1000).toDateString();
            labels.push(date);
            points.push(entry.Count);
        });
        return {labels, points, links};
    }


}

export {GraphModel as default}
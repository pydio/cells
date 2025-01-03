import PydioApi from "./PydioApi";

export default () => {

    return import(/* webpackChunkName: 'aws-sdk' */ 'aws-sdk').then(aws => {

        class ManagedMultipart extends aws.S3.ManagedUpload{

            progress(info, data) {
                const upload = this._managedUpload;
                if (this.operation === 'putObject') {
                    info.part = 1;
                    info.key = this.params.Key;
                } else {
                    const partLoaded = info.loaded;
                    const partTotal = info.total;
                    upload.totalUploadedBytes += info.loaded - this._lastUploadedBytes;
                    this._lastUploadedBytes = info.loaded;
                    info = {
                        loaded: upload.totalUploadedBytes,
                        total: upload.totalBytes,
                        part: this.params.PartNumber,
                        partLoaded, partTotal,
                        key: this.params.Key,
                        partRetry: data.retryCount
                    };
                    try{
                        if(data.request.response.error){
                            info.partError = data.request.response.error;
                        }
                    } catch (e) {}
                }
                upload.emit('httpUploadProgress', [info]);
            }

            pause() {
                this._pause = true;
            }

            resume(){
                this._pause = false;
            }

            uploadPart(chunk, partNumber) {
                if(this._pause){
                    setTimeout(()=>{
                        if(!this._aborted){
                            this.uploadPart(chunk, partNumber);
                        }
                    }, 1000);
                    return;
                }
                // Make sure to reupdate JWT after long uploads
                PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                    // Update accessKeyId
                    this.service.config.credentials.accessKeyId = jwt;
                    super.uploadPart(chunk, partNumber);
                });
            }

            finishMultiPart(){
                PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                    // Update accessKeyId
                    this.service.config.credentials.accessKeyId = jwt;
                    super.finishMultiPart();
                });
            }

            abort(){
                PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                    // Update accessKeyId
                    this.service.config.credentials.accessKeyId = jwt;
                    super.abort();
                    this._aborted = true;
                });
            }

            cleanup(err){
                PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
                    // Update accessKeyId
                    this.service.config.credentials.accessKeyId = jwt;
                    super.cleanup(err);
                });
            }

        }

        return {...aws, ManagedMultipart}
    })

}
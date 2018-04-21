# FrontLog Service

A super simple REST service logging every request to the standard input. Used by the PHP Frontend to log operations and errors using the application official format.

The REST service conforms to the following:

```protobuf
service FrontLogService {
    rpc Log(FrontLogMessage) returns (FrontLogResponse) {
        option (google.api.http) =  {
            put: "/frontlogs"
            body: "*"
        };
    }
}
```

# DocStore Service

This service provides a simple, indexed key/value store for both JSON documents and Binaries. Documents are stored in a BoltDB database, and indexed (and thus searchable) using Bleve full-text search engine.

## API

GRPC Handler provides the following service

```protobuf
service DocStore {
    rpc PutDocument (PutDocumentRequest) returns (PutDocumentResponse) {};
    rpc GetDocument (GetDocumentRequest) returns (GetDocumentResponse) {};
    rpc DeleteDocuments (DeleteDocumentsRequest) returns (DeleteDocumentsResponse) {};
    rpc CountDocuments(ListDocumentsRequest) returns (CountDocumentsResponse) {};
    rpc ListDocuments(ListDocumentsRequest) returns (stream ListDocumentsResponse) {};
}
```

Documents objects are use the following model:

```protobuf
message Document {
    string ID = 2;
    DocumentType Type = 3;
    string Owner = 4;
    bytes Data = 5;
    bytes IndexableMeta = 6;
}
```

Data can contain a JSON serialized string that will be actually stored, whereas IndexableMeta contains JSON that will be indexed by the search engine. This metadata can have many level depth, and keys can then be searched with Bleve query string like `"Key1: value"` or `"+Key1.SubKey:value*"`

## Binaries

Binary documents are redirected at the gateway level to a dedicated S3 bucket defined in the configuration. Binary are then served directly via S3.
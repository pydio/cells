# Custom write validation

Register distribution rules at startup, before serving requests. Cells enables no rules by default.

```go
err := writevalidation.RegisterRule("reserved-name", 10, func(ctx context.Context, request writevalidation.Request) error {
    if path.Base(request.Destination.GetPath()) == "reserved" {
        return writevalidation.Reject("this name is reserved")
    }
    return nil
})
if err != nil {
    return err
}
```

The example is illustrative; Cells does not register this restriction.

## Rule contract

- Lower priorities run first. Equal priorities run in name order. Names must be unique.
- Return `nil` to allow a write. Return an error to stop validation and reject it. `Reject` creates an invalid-parameters error for client feedback.
- Rules must be safe for concurrent calls, deterministic and free of side effects. Batch preflight and execution can validate the same write more than once.
- Each rule receives cloned source and destination nodes. Changing them does not change the operation or another rule's input.
- Registration is process-wide. Concurrent registration is safe, but startup registration keeps behavior stable across requests.
- Use `NewRegistry` and `WithRegistry` for isolated compositions and tests.

## Coverage

Path and UUID clients validate creation, content uploads, multipart initiation/parts/completion, and copy or move destinations. The request contains the node paths resolved by the active client: Path clients use provider paths, while UUID clients retain the UUID-resolved source and destination nodes. Same-path copies are checked because they can modify content or metadata. Same-path `UpdateNode` calls are treated as metadata updates, not renames.

DAV requests are canonicalized before validation with the same `clearName` semantics as the DAV filesystem: the configured DAV route prefix is removed, then `path.Clean` and NFC normalization are applied. Rules therefore see the absolute canonical provider path, not the raw HTTP URL. With an empty registry, DAV validation is a no-op and malformed destinations remain handled by WebDAV.

REST create batches are checked before writing their first explicit destination. Copy/move tasks check destinations before queuing work. These checks do not make recursive jobs transactional.

Rules also apply to admin clients that use these compositions. A distribution must explicitly scope its rules to the users, workspaces and operations it intends to restrict. Internal service/index ingestion that bypasses these clients is not covered. Reads, deletes and multipart aborts do not invoke rules.

This is a validation hook, not a transformation hook. It does not rename files, repair existing data or define filename restrictions for distributions.

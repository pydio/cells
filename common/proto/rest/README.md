# Regenerate JavaScript SDK (quick reference)

Purpose

- Regenerate the JS SDK from protobuf sources. This updates the generated client code after protobuf/schema changes.

Prerequisites

- buf (and any buf plugins used by the project) installed and available on PATH
- Node.js and npm/yarn available
- Any protoc/gen plugins the repo expects (e.g. ts-proto, protoc-gen-grpc-web, etc.)
- Run from repository root unless noted otherwise
- `openapi-generator` `v7.12.0` `JAR` installed
  
```bash
curl -o openapi-generator-cli-7.12.0.jar https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/7.12.0/openapi-generator-cli-7.12.0.jar
```

1. Change to the proto directory:

   ```bash
   cd common/proto
   ```

2. Run the buf generation script with the REST flag (this is the entrypoint for generation):

   ```bash
   bash buf.sh rest
   ```


3. Inspect generated files

- Confirm the generated JS/TS files are emitted to the expected output path (see the buf.sh or buf.gen.yaml configuration for the target directory).
- If the generation writes into a temporary location, copy/move the updated files into the SDK package folder (e.g., packages/sdk-js/src or other configured location).

4. Install dependencies and build the SDK package

- From repo root or the SDK package directory:

  ```bash
  cd path/to/js-sdk-package
  npm install        # or yarn install
  npm run build      # build/compile steps used by the SDK
  ```

5. Format and lint

- Run the repository formatting and linting workflows to keep generated code consistent:

  ```bash
  npm run format
  npm run lint
  ```

6. Test

- Run unit/integration tests that validate the SDK:

  ```bash
  npm test
  ```

7. Commit and create a PR

# Regenerate JavaScript SDK (quick reference)
{wip}
Purpose

- Regenerate the JS SDK from protobuf sources. This updates the generated client sdk after protobuf changes.

Prerequisites

- buf (and any buf plugins used by the project) installed from ./cmd
- Node.js and npm/pnpm available
- Any protoc/gen plugins the repo expects (e.g. ts-proto, protoc-gen-grpc-web, etc.)
- Run from `/common/proto`
- `openapi-generator` `v7.12.0` `JAR` installed
  
```bash
curl -o openapi-generator-cli-7.12.0.jar https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/7.12.0/openapi-generator-cli-7.12.0.jar
```

Install globally

```bash
sudo mv openapi-generator /usr/local/bin/
```

- check version

```bash
openapi-generator version
```

```bash
openapi-generator-cli 7.12.0
```

- Change to the proto directory:

   ```bash
   cd common/proto
   ```

- Run the buf generation script with the REST flag (this is the entrypoint for generation):

    ```bash
    bash buf.sh rest
    ```

- Inspect generated files
**⚠️ Important:** ensure sdk changes are related to the actualy protobuf changes applied in cells.
- check out next branch `git checkout -b next origin/next`

- For first time use, Install dependencies and build the SDK package

**⚠️ Important:** Its important to maintain an updated version of the js sdk for cells at all times, It's strongly advised to use the udpated sdk branch
as npm package dependency in `ajax.gui` plugin to ensure the UI doesn't break.

- Update `ajax.gui` frontend plugin `cells-sdk-js` `package.json` to point to local directory of cells-sdk-js
- Install node modules `npm install`
- Rebuild for `ajax.gui` for prod `pnpm run build-core-prod`

You should be set by now.

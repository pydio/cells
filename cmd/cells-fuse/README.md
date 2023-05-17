# Cells Flat Datasource FUSE mounter

This tool allows the local mounting of a flat datasource (given a "snapshot" has been created in the storage), independantly
of any running Cells/Cells Enterprise or even database. 

It currently supports local filesystem and S3-based datasources. 

## Usage

### Prepare 

First build the tool

```shell
go build .
```
Create a target folder for mounting, e.g. /tmp/datasource 

```shell
mkdir "/tmp/datasource"
```

### Mount Locally stored Datasource

Tun the tool with the two parameters `MOUNT_POINT` and `STORAGE_URL`. For a locally stored datasource, use the "file://" scheme
with an absolute path to the snapshot file.

```shell
cells-fuse "/tmp/datasource" "file:///var/cells/data/pydiods1/snapshot.db"
```

### S3/S3 Compatible Datasource

If your datasource is stored in S3 or S3-Compatible storage, build the STORAGE_URL as follow: 

 - Scheme : s3 (not secure) or s3s (secure)
 - User/Password : Storage Api Key/Secret
 - Host : custom storage endpoint or s3.amazonaws.com for standard S3
 - Path : /bucketName/snapshotName

For example: 

```shell
cells-fuse "/tmp/datasource" "s3s://API_KEY:API_SECRET@s3.amazonaws.com/MyBucketName/snapshot.db"
```

### Closing Mount

Once the DS is mounted, you can simply browse and copy files that you want to recover. S3-case will cache files inside the system temporary folder. You can specify this with the ENV TEMPDIR.

To unmount cleanly, use `umount MOUNT_POINT`. You should see the program close with: 

```
2023/05/17 14:04:05.729 INFO    Cleaning resources before quitting...
2023/05/17 14:04:05.730 INFO    - Closing snapshot
2023/05/17 14:04:06.774 INFO    - Unmounting server
2023/05/17 14:04:07.062 INFO    - Clearing cache
2023/05/17 14:04:07.062 INFO    ... done
```
# Activity Service

## Description

### Boxes

这个服务监听各种平台事件和“扇出”，并将它们反规范化到各种盒子中，为实体:节点(文件/文件夹活动)和用户构建事件提要。
收件箱可以是“收件箱”和“发件箱”:收件箱收集来自该实体订阅的其他实体的所有事件，
而发件箱收集当前实体的所有活动。通常，用户发件箱显示一个用户的所有活动(=我的活动 - my activity)，
用户收件箱是一个用户想要看到的平台上发生的事情的feed(=我的墙 - my wall)。


### Subscriptions

服务还存储实体之间的订阅，基本上是用户在其他实体上的“监视”。
Watches 目前是为用户在节点上监视而实现的，但它也可以被用于订阅另一个用户活动，或其他类型的事件(有待定义)。

### Relative paths and nodes filtering

活动是“绝对”存储的：节点有它们的UUID，它们的路径是对内部树服务的绝对引用。
“客户端”的任务是根据用户上下文筛选节点并显示它们的正确路径，
通常是在用户允许的工作空间中显示节点路径。
因此，如果用户从多个工作空间访问同一个节点，那么一个活动对象可以包含多个工作空间路径。请参阅下面的示例和第一个活动的“partOf”属性。



## Activity Streams 2.0 (AS2)

活动使用[W3C Activity Streams 2.0](https://www.w3.org/TR/activitystreams-core/)格式以 JSON 格式产生。
这是一个开放的规范，用于所有通常在社交网络平台中产生的事件，
每个活动主要由一个类型、一个参与者(本身是一个类型为“人”的活动对象)和一个对象(本身是一个特定类型的活动对象，例如文档、文件夹等…)来描述。

类型列在[https://www.w3.org/TR/activitystreams-vocabulary/](https://www.w3.org/TR/activitystreams-vocabulary/)下，
Pydio 用以下类型扩展了类型列表：文件夹、工作空间、摘要。


AS2 数据模型还描述了各种类型的集合，以返回 Pydio 用于响应的活动列表。下面是对活动服务的 rest 调用的输出示例：



```js
{
    "@context": "https://www.w3.org/ns/activitystreams",
    "type": "Collection",
    "items": [
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Read",
            "id": "/activity-14",
            "name": "File Event",
            "summary": "Folder [Répertoire](http://localhost/docs/charlie/PENDING/Répertoire) was accessed by [admin](http://localhost/users/admin)",
            "updated": "2017-10-30T08:07:46.000Z",
            "actor": {
                "type": "Person",
                "id": "admin",
                "name": "admin"
            },
            "object": {
                "type": "Folder",
                "id": "AiXrqq8KTBEKnEJ4Vqj6iaZ0nJ34uNsoPiq7",
                "name": "charlie/PENDING/Répertoire",
                "partOf": {
                    "type": "Collection",
                    "items": [
                        {
                            "type": "Workspace",
                            "id": "21f31459698c74ec1e0f022c8eaadc62",
                            "name": "Charlie",
                            "rel": "charlie/PENDING/Répertoire"
                        },
                        {
                            "type": "Workspace",
                            "id": "7765fd1d105c8382f49a692ebc2bd8dc",
                            "name": "Pending",
                            "rel": "pending/Répertoire"
                        }
                    ]
                }
            }
        },
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Read",
            "id": "/activity-9",
            "name": "File Event",
            "summary": "Folder [New Folder](http://localhost/docs/charlie/PENDING/Répertoire/New Folder) was accessed by [admin](http://localhost/users/admin)",
            "updated": "2017-10-27T10:43:47.000Z",
            "actor": {
                "type": "Person",
                "id": "admin",
                "name": "admin"
            },
            "object": {
                "type": "Folder",
                "id": "g0nznpi9dj9JNxHPbxnxoULiJ5kgF9uoKMGb",
                "name": "charlie/PENDING/Répertoire/New Folder",
                "partOf": {
                    "type": "Collection",
                    "items": [
                        {
                            "type": "Workspace",
                            "id": "21f31459698c74ec1e0f022c8eaadc62",
                            "name": "Charlie",
                            "rel": "charlie/PENDING/Répertoire/New Folder"
                        },
                        {
                            "type": "Workspace",
                            "id": "7765fd1d105c8382f49a692ebc2bd8dc",
                            "name": "Pending",
                            "rel": "pending/Répertoire/New Folder"
                        }
                    ]
                }
            }
        }
    ],
    "totalItems": 2
}
```

活动服务还生成活动的 Markdown 摘要，供各种客户端显示。

## Interfaces

### GRPC

Grpc 服务实现了 GRPC 中的 activity.ActivityService (see `common/proto/activity`)，用于设置/获取订阅，发布活动，列出活动

### REST


Rest 服务以 Rest 格式公开活动。Rest 端点在 `common/proto/rest.proto`  中描述：

- POST /subscriptions : 列出订阅
- POST /stream : 列出活动
- POST /subscribe : 将订阅从一个给定的实体发布到另一个实体


### Subscriber

订阅者监听 NodeChangeEvent 并为节点生成活动。

## Digests

Activity service 提供一个与调度程序兼容的“动作”来从 Activity streams 中生成摘要，从一个给定的 offest 开始(例如。在以前的摘要中发送的最后一个活动)。

Digest 是过滤活动，并通过工作区将它们分组到特定类型 Digest 的活动集合中。

由于用户最终可以从许多工作空间访问给定的节点，事件可能会在不同的工作空间中出现多次。


Here is an example:

```js
{
    "@context": "https://www.w3.org/ns/activitystreams",
    "type": "Digest",
    "items": [
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Workspace",
            "id": "7765fd1d105c8382f49a692ebc2bd8dc",
            "name": "Pending",
            "items": [
                {
                    "@context": "https://www.w3.org/ns/activitystreams",
                    "type": "Read",
                    "id": "/activity-17",
                    "name": "File Event",
                    "summary": "Folder [New Folder](http://localhost/docs/g0nznpi9dj9JNxHPbxnxoULiJ5kgF9uoKMGb) was accessed by [admin](http://localhost/users/admin)",
                    "updated": "2017-10-30T09:07:15.000Z",
                    "actor": {
                        "type": "Person",
                        "id": "admin",
                        "name": "admin"
                    },
                    "object": {
                        "type": "Folder",
                        "id": "g0nznpi9dj9JNxHPbxnxoULiJ5kgF9uoKMGb",
                        "name": "pending/Répertoire/New Folder"
                    }
                },
                {
                    "@context": "https://www.w3.org/ns/activitystreams",
                    "type": "Read",
                    "id": "/activity-15",
                    "name": "File Event",
                    "summary": "Folder [Répertoire](http://localhost/docs/AiXrqq8KTBEKnEJ4Vqj6iaZ0nJ34uNsoPiq7) was accessed by [admin](http://localhost/users/admin)",
                    "updated": "2017-10-30T08:29:14.000Z",
                    "actor": {
                        "type": "Person",
                        "id": "admin",
                        "name": "admin"
                    },
                    "object": {
                        "type": "Folder",
                        "id": "AiXrqq8KTBEKnEJ4Vqj6iaZ0nJ34uNsoPiq7",
                        "name": "pending/Répertoire"
                    }
                },
                {
                    "@context": "https://www.w3.org/ns/activitystreams",
                    "type": "Create",
                    "id": "/activity-6",
                    "name": "File Event",
                    "summary": "Folder [New Folder](http://localhost/docs/g0nznpi9dj9JNxHPbxnxoULiJ5kgF9uoKMGb) was created by [user](http://localhost/users/user)",
                    "updated": "2017-10-27T10:43:32.000Z",
                    "actor": {
                        "type": "Person",
                        "id": "user",
                        "name": "user"
                    },
                    "object": {
                        "type": "Folder",
                        "id": "g0nznpi9dj9JNxHPbxnxoULiJ5kgF9uoKMGb",
                        "name": "pending/Répertoire/New Folder"
                    }
                },
                {
                    "@context": "https://www.w3.org/ns/activitystreams",
                    "type": "Read",
                    "id": "/activity-5",
                    "name": "File Event",
                    "summary": "Folder [Numériser.jpeg](http://localhost/docs/3bf5ba64-b968-11e7-9496-28cfe919ca6f) was accessed by [user](http://localhost/users/user)",
                    "updated": "2017-10-27T10:43:15.000Z",
                    "actor": {
                        "type": "Person",
                        "id": "user",
                        "name": "user"
                    },
                    "object": {
                        "type": "Folder",
                        "id": "3bf5ba64-b968-11e7-9496-28cfe919ca6f",
                        "name": "pending/Répertoire/Numériser.jpeg"
                    }
                },
                {
                    "@context": "https://www.w3.org/ns/activitystreams",
                    "type": "Move",
                    "id": "/activity-4",
                    "name": "File Event",
                    "summary": "Document [Numériser.jpeg](http://localhost/docs/3bf5ba64-b968-11e7-9496-28cfe919ca6f) was moved by [user](http://localhost/users/user)",
                    "updated": "2017-10-27T10:43:14.000Z",
                    "actor": {
                        "type": "Person",
                        "id": "user",
                        "name": "user"
                    },
                    "object": {
                        "type": "Document",
                        "id": "3bf5ba64-b968-11e7-9496-28cfe919ca6f",
                        "name": "pending/Répertoire/Numériser.jpeg"
                    },
                    "target": {
                        "type": "Document",
                        "id": "3bf5ba64-b968-11e7-9496-28cfe919ca6f",
                        "name": "pending/Répertoire/Numériser.jpeg"
                    },
                    "origin": {
                        "type": "Document",
                        "name": "pending/Répertoire/Numériser 1.jpeg"
                    }
                }
            ]
        },
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Workspace",
            "id": "21f31459698c74ec1e0f022c8eaadc62",
            "name": "Charlie",
            "items": [
                {
                    "@context": "https://www.w3.org/ns/activitystreams",
                    "type": "Read",
                    "id": "/activity-17",
                    "name": "File Event",
                    "summary": "Folder [New Folder](http://localhost/docs/g0nznpi9dj9JNxHPbxnxoULiJ5kgF9uoKMGb) was accessed by [admin](http://localhost/users/admin)",
                    "updated": "2017-10-30T09:07:15.000Z",
                    "actor": {
                        "type": "Person",
                        "id": "admin",
                        "name": "admin"
                    },
                    "object": {
                        "type": "Folder",
                        "id": "g0nznpi9dj9JNxHPbxnxoULiJ5kgF9uoKMGb",
                        "name": "charlie/PENDING/Répertoire/New Folder"
                    }
                }
            ]
        }
    ],
    "totalItems": 2
}
```

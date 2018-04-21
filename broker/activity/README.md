# Activity Service

## Description

### Boxes

This service listen for various platform events and "fan-out" and denormalize them to various boxes to build events feeds for entities: nodes (files/folders activities) and users. Boxes can be "inbox" and "outbox" : inbox gather all events from other entities that the entitiy has subscribed to, whereas outbox gather all activities of the current entity. Typically, user outbox shows all activity a user ( = my activity ), user inbox is the feed of what happened on the platform that a user wants to see ( = my wall ).

### Subscriptions

The service also stores the subscription between entities, basically the user "watches" on other entities. Watches are currently implemented for users watching on nodes, but it could also be used e.g. to subscribe to another user activies, or other types of events (to be defined).

### Relative paths and nodes filtering

Activities are stored "absolute" : nodes have their UUID and their path is absolute referring to the inner Tree Service. It's the "client" mission to filter nodes and display their correct path depending on the user context, typically to show the node pathes inside the allowed workspaces of the user. An activity object can thus contains more than one workspace Path if a user accesses the same node from multiple workspaces. See example below and the "partOf" attribute of the first activity.

## Activity Streams 2.0 (AS2)

Activities are produced in JSON format using the the [W3C Activity Streams 2.0](https://www.w3.org/TR/activitystreams-core/) format. This is an open specification for all events generally produced in a social network platform, each activity is mainly described by a Type, an Actor (itself an activity object of type "Person") and an Object (itself an activity object of a certain type, e.g. Document, Folder, etc...).

Types are listed under [https://www.w3.org/TR/activitystreams-vocabulary/](https://www.w3.org/TR/activitystreams-vocabulary/), and Pydio extends the Types list with the following types: Folder, Workspace, Digest.

AS2 datamodel also describes various types of Collections to send back a list of Activities, which Pydio uses for responses. Here is a sample output of rest call to activity service:

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

Activity Service also generates a Markdown summary of activities, to be used for display by various clients.

## Interfaces

### GRPC

Grpc service implements the activity.ActivityService (see `common/proto/activity`) in GRPC, to set/get subscriptions, post activities, list activities
from a given Box.

### REST

Rest service exposes the activities in REST format. Rest endpoints are described in `common/proto/rest.proto` file :

- POST /subscriptions : post a query to list subscriptions
- POST /stream : post a query to list activities
- POST /subscribe : post a subscription from a given entity to another one

### Subscriber

Subscriber listens to NodeChangeEvent and produces activities for nodes.

## Digests

Activity service provides a scheduler-compatible "action" to generate digests from activity streams, starting at a given offest (.e.g. last activity sent in previous digest).
Digest is filtering activities and grouping them by Workspace into activity collections of specific type Digest.
As user can eventually access to a given node from many workspaces, events may appear multiple times under different workspaces.

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

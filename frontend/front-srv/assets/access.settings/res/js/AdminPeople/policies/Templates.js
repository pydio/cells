const Templates = [
    {
        "Icon": "shield-lock-outline",
        "Uuid": "sample-acl-policy",
        "Name": "Complex ACL Policy",
        "Description": "Sample Complex Policy for managing ACLs dynamically",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-complex-rule1",
                "description": "Default allowing read/write",
                "subjects": [
                    "policy:sample-acl-policy"
                ],
                "resources": [
                    "acl"
                ],
                "actions": [
                    "write",
                    "read"
                ],
                "effect": "allow"
            },
            {
                "id": "acl-complex-rule2",
                "description": "Preventing modification based on IP and file metadata conditions",
                "subjects": [
                    "policy:sample-acl-policy"
                ],
                "resources": [
                    "acl"
                ],
                "actions": [
                    "write"
                ],
                "effect": "deny",
                "conditions": {
                    "NodeMetaName": {
                        "type": "StringMatchCondition",
                        "jsonOptions": "{\"matches\":\"target\"}"
                    },
                    "RemoteAddress": {
                        "type": "StringNotMatchCondition",
                        "jsonOptions": "{\"matches\":\"localhost|127.0.0.1|::1\"}"
                    }
                }
            },
            {
                "id": "acl-complex-rule3",
                "description": "Filter out any file with a PNG extension if request does not come from localhost",
                "subjects": [
                    "policy:sample-acl-policy"
                ],
                "resources": [
                    "acl"
                ],
                "actions": [
                    "read"
                ],
                "effect": "deny",
                "conditions": {
                    "NodeMetaName": {
                        "type": "StringMatchCondition",
                        "jsonOptions": "{\"matches\":\"(.+)\\\\.png\"}"
                    },
                    "RemoteAddress": {
                        "type": "StringNotMatchCondition",
                        "jsonOptions": "{\"matches\":\"localhost|127.0.0.1|::1\"}"
                    }
                }
            }
        ]
    },
    {
        "Icon": "wall-fire",
        "Uuid": "no-external-access-acl-policy",
        "Name": "Disable access based on IP",
        "Description": "Disable access to IPs outside of LAN",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-complex-rule4",
                "description": "Global read/write",
                "subjects": [
                    "policy:no-external-access-acl-policy"
                ],
                "resources": [
                    "acl"
                ],
                "actions": [
                    "write",
                    "read"
                ],
                "effect": "allow"
            },
            {
                "id": "acl-complex-rule5",
                "description": "Denying IP if it's not localhost, 127.0.0.1 or ::1",
                "subjects": [
                    "policy:no-external-access-acl-policy"
                ],
                "resources": [
                    "acl"
                ],
                "actions": [
                    "write",
                    "read"
                ],
                "effect": "deny",
                "conditions": {
                    "RemoteAddress": {
                        "type": "StringNotMatchCondition",
                        "jsonOptions": "{\"matches\":\"localhost|127.0.0.1|::1\"}"
                    }
                }
            }
        ]
    },
    {
        "Icon": "timer-lock-outline",
        "Uuid": "limited-period-access-acl-policy2",
        "Name": "Limited Period",
        "Description": "Enables access to a workspace only for a given period",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-temporary-access2",
                "description": "ACL Rule example, allowing access only in Feb. and March 2018",
                "subjects": [
                    "policy:limited-period-access-acl-policy2"
                ],
                "resources": [
                    "acl"
                ],
                "actions": [
                    "write",
                    "read"
                ],
                "effect": "allow",
                "conditions": {
                    "ClientTime": {
                        "type": "WithinPeriodCondition",
                        "jsonOptions": "{\"matches\":\"2018-02-01T00:00+0100/2018-04-01T00:00+0100\"}"
                    }
                }
            }
        ]
    },
    {
        "Icon": "calendar-lock-outline",
        "Uuid": "no-access-after-acl-policy",
        "Name": "No access after a given date",
        "Description": "Disable access to a workspace after a given date",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-date-rule1",
                "description": "Global read/write",
                "subjects": [
                    "policy:no-access-after-acl-policy"
                ],
                "resources": [
                    "acl"
                ],
                "actions": [
                    "write",
                    "read"
                ],
                "effect": "allow"
            },
            {
                "id": "acl-date-rule2",
                "description": "Deny read/write if date is after 2018-02-28",
                "subjects": [
                    "policy:no-access-after-acl-policy"
                ],
                "resources": [
                    "acl"
                ],
                "actions": [
                    "write",
                    "read"
                ],
                "effect": "deny",
                "conditions": {
                    "ServerTime": {
                        "type": "DateAfterCondition",
                        "jsonOptions": "{\"matches\":\"2018-02-28T23:59+0100\"}"
                    }
                }
            }
        ]
    },
    {
        "Icon": "clock-check-outline",
        "Uuid": "office-hours-access-acl-policy",
        "Name": "Access allowed only during business hours",
        "Description": "Enable access to a workspace only certain days within pre-defined hours",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-office-hours-rule",
                "description": "Office hours rule example, allowing read/write",
                "subjects": [
                    "policy:office-hours-access-acl-policy"
                ],
                "resources": [
                    "acl"
                ],
                "actions": [
                    "write",
                    "read"
                ],
                "effect": "allow",
                "conditions": {
                    "ClientTime": {
                        "type": "OfficeHoursCondition",
                        "jsonOptions": "{\"matches\":\"Monday-Friday/09:00/18:30\"}"
                    }
                }
            }
        ]
    },
]

export default Templates
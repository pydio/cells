/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

const Templates = [
    {
        "Icon": "shield-lock-outline",
        "Uuid": "sample-acl-policy",
        "Name": "ACLSample1.Title",
        "Description": "ACLSample1.Description",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-complex-rule1",
                "description": "ACLSample1.Rule1",
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
                "description": "ACLSample1.Rule2",
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
                "description": "ACLSample1.Rule3",
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
        "Name": "ACLSampleExternalIP.Title",
        "Description": "ACLSampleExternalIP.Description",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-complex-rule4",
                "description": "ACLSampleExternalIP.Rule1",
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
                "description": "ACLSampleExternalIP.Rule2",
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
        "Name": "ACLSamplePeriod.Title",
        "Description": "ACLSamplePeriod.Description",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-temporary-access2",
                "description": "ACLSamplePeriod.Rule1",
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
        "Name": "ACLSampleDateDisable.Title",
        "Description": "ACLSampleDateDisable.Description",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-date-rule1",
                "description": "ACLSampleDateDisable.Rule1",
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
                "description": "ACLSampleDateDisable.Rule2",
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
        "Name": "ACLSampleBusinessHours.Title",
        "Description": "ACLSampleBusinessHours.Description",
        "ResourceGroup": "acl",
        "Policies": [
            {
                "id": "acl-office-hours-rule",
                "description": "ACLSampleBusinessHours.Rule1",
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
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceServiceApi = exports.UserServiceApi = exports.UserMetaServiceApi = exports.UpdateServiceApi = exports.TokenServiceApi = exports.ShareServiceApi = exports.SearchServiceApi = exports.RoleServiceApi = exports.PolicyServiceApi = exports.MetaServiceApi = exports.MailerServiceApi = exports.LogServiceApi = exports.LicenseServiceApi = exports.JobsServiceApi = exports.InstallServiceApi = exports.GraphServiceApi = exports.FrontendServiceApi = exports.EnterprisePolicyServiceApi = exports.EnterpriseLogServiceApi = exports.EnterpriseConfigServiceApi = exports.DocStoreServiceApi = exports.ConfigServiceApi = exports.ChangeServiceApi = exports.AdminTreeServiceApi = exports.ActivityServiceApi = exports.ACLServiceApi = exports.UpdateUserMetaRequestUserMetaOp = exports.UpdateUserMetaNamespaceRequestUserMetaNsOp = exports.UpdateUpdateResponse = exports.UpdatePackage = exports.UpdateApplyUpdateResponse = exports.TreeWorkspaceRelativePath = exports.TreeVersioningPolicy = exports.TreeVersioningKeepPeriod = undefined;
exports.TreeSyncChangeType = exports.TreeSyncChangeNode = exports.TreeSyncChange = exports.TreeSearchRequest = exports.TreeReadNodeResponse = exports.TreeReadNodeRequest = exports.TreeQuery = exports.TreeNodeType = exports.TreeNodeChangeEvent = exports.TreeNode = exports.TreeListNodesRequest = exports.TreeGeoQuery = exports.TreeGeoPoint = exports.TreeChangeLog = exports.ServiceResourcePolicyQuery = exports.ServiceResourcePolicyPolicyEffect = exports.ServiceResourcePolicyAction = exports.ServiceResourcePolicy = exports.ServiceQuery = exports.ServiceOperationType = exports.RestWorkspaceCollection = exports.RestVersioningPolicyCollection = exports.RestUsersCollection = exports.RestUserStateResponse = exports.RestUserMetaNamespaceCollection = exports.RestUserMetaCollection = exports.RestUserJobsCollection = exports.RestUserJobResponse = exports.RestUserJobRequest = exports.RestUserBookmarksRequest = exports.RestTimeRangeResultCollection = exports.RestSubscriptionsCollection = exports.RestShareLinkTargetUser = exports.RestShareLinkAccessType = exports.RestShareLink = exports.RestSettingsSection = exports.RestSettingsMenuResponse = exports.RestSettingsEntryMeta = exports.RestSettingsEntry = exports.RestServiceCollection = exports.RestSearchWorkspaceRequest = exports.RestSearchUserRequest = exports.RestSearchRoleRequest = exports.RestSearchResults = exports.RestSearchACLRequest = exports.RestRolesCollection = exports.RestRevokeResponse = exports.RestRevokeRequest = exports.RestResourcePolicyQuery = exports.RestResetPasswordTokenResponse = exports.RestResetPasswordResponse = exports.RestResetPasswordRequest = exports.RestRelationResponse = exports.RestPutShareLinkRequest = exports.RestPutCellRequest = exports.RestOpenApiResponse = exports.RestNodesCollection = exports.RestMetadata = exports.RestMetaNamespaceRequest = exports.RestMetaCollection = exports.RestLogMessageCollection = exports.RestLogLevel = exports.RestListSharedResourcesResponse = exports.RestListSharedResourcesRequest = exports.RestListPeersAddressesResponse = exports.RestListPeerFoldersRequest = exports.RestListDocstoreRequest = exports.RestGetBulkMetaRequest = exports.RestFrontLogResponse = exports.RestFrontLogMessage = exports.RestFrontBootConfResponse = exports.RestExternalDirectoryResponse = exports.RestExternalDirectoryConfig = exports.RestExternalDirectoryCollection = exports.RestDocstoreCollection = exports.RestDiscoveryResponse = exports.RestDeleteVersioningPolicyResponse = exports.RestDeleteShareLinkResponse = exports.RestDeleteResponse = exports.RestDeleteDataSourceResponse = exports.RestDeleteCellResponse = exports.RestDataSourceCollection = exports.RestControlServiceRequest = exports.RestConfiguration = exports.RestChangeRequest = exports.RestChangeCollection = exports.RestCellAcl = exports.RestCell = exports.RestBulkMetaResponse = exports.RestBindResponse = exports.RestACLCollection = exports.ResourcePolicyQueryQueryType = exports.ProtobufAny = exports.PackagePackageStatus = exports.ObjectStorageType = exports.ObjectEncryptionMode = exports.ObjectDataSource = exports.NodeChangeEventEventType = exports.MailerUser = exports.MailerSendMailResponse = undefined;
exports.MailerMail = exports.LogTimeRangeResult = exports.LogTimeRangeRequest = exports.LogTimeRangeCursor = exports.LogRelType = exports.LogLogMessage = exports.LogListLogRequest = exports.ListSharedResourcesResponseSharedResource = exports.ListSharedResourcesRequestListShareType = exports.ListLogRequestLogFormat = exports.JobsUsersSelector = exports.JobsTaskStatus = exports.JobsTask = exports.JobsSourceFilter = exports.JobsSchedule = exports.JobsNodesSelector = exports.JobsListJobsRequest = exports.JobsJob = exports.JobsDeleteTasksResponse = exports.JobsDeleteTasksRequest = exports.JobsCtrlCommandResponse = exports.JobsCtrlCommand = exports.JobsCommand = exports.JobsActionOutput = exports.JobsActionMessage = exports.JobsActionLog = exports.JobsAction = exports.InstallPerformCheckResponse = exports.InstallPerformCheckRequest = exports.InstallInstallResponse = exports.InstallInstallRequest = exports.InstallInstallConfig = exports.InstallGetDefaultsResponse = exports.InstallCheckResult = exports.IdmWorkspaceSingleQuery = exports.IdmWorkspaceScope = exports.IdmWorkspace = exports.IdmUserSingleQuery = exports.IdmUserMetaNamespace = exports.IdmUserMeta = exports.IdmUser = exports.IdmUpdateUserMetaResponse = exports.IdmUpdateUserMetaRequest = exports.IdmUpdateUserMetaNamespaceResponse = exports.IdmUpdateUserMetaNamespaceRequest = exports.IdmSearchUserMetaRequest = exports.IdmRoleSingleQuery = exports.IdmRole = exports.IdmPolicyResourceGroup = exports.IdmPolicyGroup = exports.IdmPolicyEffect = exports.IdmPolicyCondition = exports.IdmPolicy = exports.IdmNodeType = exports.IdmListPolicyGroupsResponse = exports.IdmListPolicyGroupsRequest = exports.IdmACLSingleQuery = exports.IdmACLAction = exports.IdmACL = exports.EncryptionKeyInfo = exports.EncryptionKey = exports.EncryptionImport = exports.EncryptionExport = exports.EncryptionAdminListKeysResponse = exports.EncryptionAdminListKeysRequest = exports.EncryptionAdminImportKeyResponse = exports.EncryptionAdminImportKeyRequest = exports.EncryptionAdminExportKeyResponse = exports.EncryptionAdminExportKeyRequest = exports.EncryptionAdminDeleteKeyResponse = exports.EncryptionAdminDeleteKeyRequest = exports.EncryptionAdminCreateKeyResponse = exports.EncryptionAdminCreateKeyRequest = exports.DocstorePutDocumentResponse = exports.DocstorePutDocumentRequest = exports.DocstoreGetDocumentResponse = exports.DocstoreDocumentType = exports.DocstoreDocumentQuery = exports.DocstoreDocument = exports.DocstoreDeleteDocumentsResponse = exports.DocstoreDeleteDocumentsRequest = exports.CtlServiceStatus = exports.CtlServiceCommand = exports.CtlService = exports.CtlPeer = exports.CertLicenseStatsResponse = exports.CertLicenseInfo = exports.AuthLdapServerConfig = exports.AuthLdapSearchFilter = exports.AuthLdapMemberOfMapping = exports.AuthLdapMapping = exports.ActivitySummaryPointOfView = exports.ActivitySubscription = exports.ActivityStreamContext = exports.ActivityStreamActivitiesRequest = exports.ActivitySearchSubscriptionsRequest = exports.ActivityOwnerType = exports.ActivityObjectType = exports.ActivityObject = exports.ApiClient = undefined;

var _ApiClient = require('./ApiClient');

var _ApiClient2 = _interopRequireDefault(_ApiClient);

var _ActivityObject = require('./model/ActivityObject');

var _ActivityObject2 = _interopRequireDefault(_ActivityObject);

var _ActivityObjectType = require('./model/ActivityObjectType');

var _ActivityObjectType2 = _interopRequireDefault(_ActivityObjectType);

var _ActivityOwnerType = require('./model/ActivityOwnerType');

var _ActivityOwnerType2 = _interopRequireDefault(_ActivityOwnerType);

var _ActivitySearchSubscriptionsRequest = require('./model/ActivitySearchSubscriptionsRequest');

var _ActivitySearchSubscriptionsRequest2 = _interopRequireDefault(_ActivitySearchSubscriptionsRequest);

var _ActivityStreamActivitiesRequest = require('./model/ActivityStreamActivitiesRequest');

var _ActivityStreamActivitiesRequest2 = _interopRequireDefault(_ActivityStreamActivitiesRequest);

var _ActivityStreamContext = require('./model/ActivityStreamContext');

var _ActivityStreamContext2 = _interopRequireDefault(_ActivityStreamContext);

var _ActivitySubscription = require('./model/ActivitySubscription');

var _ActivitySubscription2 = _interopRequireDefault(_ActivitySubscription);

var _ActivitySummaryPointOfView = require('./model/ActivitySummaryPointOfView');

var _ActivitySummaryPointOfView2 = _interopRequireDefault(_ActivitySummaryPointOfView);

var _AuthLdapMapping = require('./model/AuthLdapMapping');

var _AuthLdapMapping2 = _interopRequireDefault(_AuthLdapMapping);

var _AuthLdapMemberOfMapping = require('./model/AuthLdapMemberOfMapping');

var _AuthLdapMemberOfMapping2 = _interopRequireDefault(_AuthLdapMemberOfMapping);

var _AuthLdapSearchFilter = require('./model/AuthLdapSearchFilter');

var _AuthLdapSearchFilter2 = _interopRequireDefault(_AuthLdapSearchFilter);

var _AuthLdapServerConfig = require('./model/AuthLdapServerConfig');

var _AuthLdapServerConfig2 = _interopRequireDefault(_AuthLdapServerConfig);

var _CertLicenseInfo = require('./model/CertLicenseInfo');

var _CertLicenseInfo2 = _interopRequireDefault(_CertLicenseInfo);

var _CertLicenseStatsResponse = require('./model/CertLicenseStatsResponse');

var _CertLicenseStatsResponse2 = _interopRequireDefault(_CertLicenseStatsResponse);

var _CtlPeer = require('./model/CtlPeer');

var _CtlPeer2 = _interopRequireDefault(_CtlPeer);

var _CtlService = require('./model/CtlService');

var _CtlService2 = _interopRequireDefault(_CtlService);

var _CtlServiceCommand = require('./model/CtlServiceCommand');

var _CtlServiceCommand2 = _interopRequireDefault(_CtlServiceCommand);

var _CtlServiceStatus = require('./model/CtlServiceStatus');

var _CtlServiceStatus2 = _interopRequireDefault(_CtlServiceStatus);

var _DocstoreDeleteDocumentsRequest = require('./model/DocstoreDeleteDocumentsRequest');

var _DocstoreDeleteDocumentsRequest2 = _interopRequireDefault(_DocstoreDeleteDocumentsRequest);

var _DocstoreDeleteDocumentsResponse = require('./model/DocstoreDeleteDocumentsResponse');

var _DocstoreDeleteDocumentsResponse2 = _interopRequireDefault(_DocstoreDeleteDocumentsResponse);

var _DocstoreDocument = require('./model/DocstoreDocument');

var _DocstoreDocument2 = _interopRequireDefault(_DocstoreDocument);

var _DocstoreDocumentQuery = require('./model/DocstoreDocumentQuery');

var _DocstoreDocumentQuery2 = _interopRequireDefault(_DocstoreDocumentQuery);

var _DocstoreDocumentType = require('./model/DocstoreDocumentType');

var _DocstoreDocumentType2 = _interopRequireDefault(_DocstoreDocumentType);

var _DocstoreGetDocumentResponse = require('./model/DocstoreGetDocumentResponse');

var _DocstoreGetDocumentResponse2 = _interopRequireDefault(_DocstoreGetDocumentResponse);

var _DocstorePutDocumentRequest = require('./model/DocstorePutDocumentRequest');

var _DocstorePutDocumentRequest2 = _interopRequireDefault(_DocstorePutDocumentRequest);

var _DocstorePutDocumentResponse = require('./model/DocstorePutDocumentResponse');

var _DocstorePutDocumentResponse2 = _interopRequireDefault(_DocstorePutDocumentResponse);

var _EncryptionAdminCreateKeyRequest = require('./model/EncryptionAdminCreateKeyRequest');

var _EncryptionAdminCreateKeyRequest2 = _interopRequireDefault(_EncryptionAdminCreateKeyRequest);

var _EncryptionAdminCreateKeyResponse = require('./model/EncryptionAdminCreateKeyResponse');

var _EncryptionAdminCreateKeyResponse2 = _interopRequireDefault(_EncryptionAdminCreateKeyResponse);

var _EncryptionAdminDeleteKeyRequest = require('./model/EncryptionAdminDeleteKeyRequest');

var _EncryptionAdminDeleteKeyRequest2 = _interopRequireDefault(_EncryptionAdminDeleteKeyRequest);

var _EncryptionAdminDeleteKeyResponse = require('./model/EncryptionAdminDeleteKeyResponse');

var _EncryptionAdminDeleteKeyResponse2 = _interopRequireDefault(_EncryptionAdminDeleteKeyResponse);

var _EncryptionAdminExportKeyRequest = require('./model/EncryptionAdminExportKeyRequest');

var _EncryptionAdminExportKeyRequest2 = _interopRequireDefault(_EncryptionAdminExportKeyRequest);

var _EncryptionAdminExportKeyResponse = require('./model/EncryptionAdminExportKeyResponse');

var _EncryptionAdminExportKeyResponse2 = _interopRequireDefault(_EncryptionAdminExportKeyResponse);

var _EncryptionAdminImportKeyRequest = require('./model/EncryptionAdminImportKeyRequest');

var _EncryptionAdminImportKeyRequest2 = _interopRequireDefault(_EncryptionAdminImportKeyRequest);

var _EncryptionAdminImportKeyResponse = require('./model/EncryptionAdminImportKeyResponse');

var _EncryptionAdminImportKeyResponse2 = _interopRequireDefault(_EncryptionAdminImportKeyResponse);

var _EncryptionAdminListKeysRequest = require('./model/EncryptionAdminListKeysRequest');

var _EncryptionAdminListKeysRequest2 = _interopRequireDefault(_EncryptionAdminListKeysRequest);

var _EncryptionAdminListKeysResponse = require('./model/EncryptionAdminListKeysResponse');

var _EncryptionAdminListKeysResponse2 = _interopRequireDefault(_EncryptionAdminListKeysResponse);

var _EncryptionExport = require('./model/EncryptionExport');

var _EncryptionExport2 = _interopRequireDefault(_EncryptionExport);

var _EncryptionImport = require('./model/EncryptionImport');

var _EncryptionImport2 = _interopRequireDefault(_EncryptionImport);

var _EncryptionKey = require('./model/EncryptionKey');

var _EncryptionKey2 = _interopRequireDefault(_EncryptionKey);

var _EncryptionKeyInfo = require('./model/EncryptionKeyInfo');

var _EncryptionKeyInfo2 = _interopRequireDefault(_EncryptionKeyInfo);

var _IdmACL = require('./model/IdmACL');

var _IdmACL2 = _interopRequireDefault(_IdmACL);

var _IdmACLAction = require('./model/IdmACLAction');

var _IdmACLAction2 = _interopRequireDefault(_IdmACLAction);

var _IdmACLSingleQuery = require('./model/IdmACLSingleQuery');

var _IdmACLSingleQuery2 = _interopRequireDefault(_IdmACLSingleQuery);

var _IdmListPolicyGroupsRequest = require('./model/IdmListPolicyGroupsRequest');

var _IdmListPolicyGroupsRequest2 = _interopRequireDefault(_IdmListPolicyGroupsRequest);

var _IdmListPolicyGroupsResponse = require('./model/IdmListPolicyGroupsResponse');

var _IdmListPolicyGroupsResponse2 = _interopRequireDefault(_IdmListPolicyGroupsResponse);

var _IdmNodeType = require('./model/IdmNodeType');

var _IdmNodeType2 = _interopRequireDefault(_IdmNodeType);

var _IdmPolicy = require('./model/IdmPolicy');

var _IdmPolicy2 = _interopRequireDefault(_IdmPolicy);

var _IdmPolicyCondition = require('./model/IdmPolicyCondition');

var _IdmPolicyCondition2 = _interopRequireDefault(_IdmPolicyCondition);

var _IdmPolicyEffect = require('./model/IdmPolicyEffect');

var _IdmPolicyEffect2 = _interopRequireDefault(_IdmPolicyEffect);

var _IdmPolicyGroup = require('./model/IdmPolicyGroup');

var _IdmPolicyGroup2 = _interopRequireDefault(_IdmPolicyGroup);

var _IdmPolicyResourceGroup = require('./model/IdmPolicyResourceGroup');

var _IdmPolicyResourceGroup2 = _interopRequireDefault(_IdmPolicyResourceGroup);

var _IdmRole = require('./model/IdmRole');

var _IdmRole2 = _interopRequireDefault(_IdmRole);

var _IdmRoleSingleQuery = require('./model/IdmRoleSingleQuery');

var _IdmRoleSingleQuery2 = _interopRequireDefault(_IdmRoleSingleQuery);

var _IdmSearchUserMetaRequest = require('./model/IdmSearchUserMetaRequest');

var _IdmSearchUserMetaRequest2 = _interopRequireDefault(_IdmSearchUserMetaRequest);

var _IdmUpdateUserMetaNamespaceRequest = require('./model/IdmUpdateUserMetaNamespaceRequest');

var _IdmUpdateUserMetaNamespaceRequest2 = _interopRequireDefault(_IdmUpdateUserMetaNamespaceRequest);

var _IdmUpdateUserMetaNamespaceResponse = require('./model/IdmUpdateUserMetaNamespaceResponse');

var _IdmUpdateUserMetaNamespaceResponse2 = _interopRequireDefault(_IdmUpdateUserMetaNamespaceResponse);

var _IdmUpdateUserMetaRequest = require('./model/IdmUpdateUserMetaRequest');

var _IdmUpdateUserMetaRequest2 = _interopRequireDefault(_IdmUpdateUserMetaRequest);

var _IdmUpdateUserMetaResponse = require('./model/IdmUpdateUserMetaResponse');

var _IdmUpdateUserMetaResponse2 = _interopRequireDefault(_IdmUpdateUserMetaResponse);

var _IdmUser = require('./model/IdmUser');

var _IdmUser2 = _interopRequireDefault(_IdmUser);

var _IdmUserMeta = require('./model/IdmUserMeta');

var _IdmUserMeta2 = _interopRequireDefault(_IdmUserMeta);

var _IdmUserMetaNamespace = require('./model/IdmUserMetaNamespace');

var _IdmUserMetaNamespace2 = _interopRequireDefault(_IdmUserMetaNamespace);

var _IdmUserSingleQuery = require('./model/IdmUserSingleQuery');

var _IdmUserSingleQuery2 = _interopRequireDefault(_IdmUserSingleQuery);

var _IdmWorkspace = require('./model/IdmWorkspace');

var _IdmWorkspace2 = _interopRequireDefault(_IdmWorkspace);

var _IdmWorkspaceScope = require('./model/IdmWorkspaceScope');

var _IdmWorkspaceScope2 = _interopRequireDefault(_IdmWorkspaceScope);

var _IdmWorkspaceSingleQuery = require('./model/IdmWorkspaceSingleQuery');

var _IdmWorkspaceSingleQuery2 = _interopRequireDefault(_IdmWorkspaceSingleQuery);

var _InstallCheckResult = require('./model/InstallCheckResult');

var _InstallCheckResult2 = _interopRequireDefault(_InstallCheckResult);

var _InstallGetDefaultsResponse = require('./model/InstallGetDefaultsResponse');

var _InstallGetDefaultsResponse2 = _interopRequireDefault(_InstallGetDefaultsResponse);

var _InstallInstallConfig = require('./model/InstallInstallConfig');

var _InstallInstallConfig2 = _interopRequireDefault(_InstallInstallConfig);

var _InstallInstallRequest = require('./model/InstallInstallRequest');

var _InstallInstallRequest2 = _interopRequireDefault(_InstallInstallRequest);

var _InstallInstallResponse = require('./model/InstallInstallResponse');

var _InstallInstallResponse2 = _interopRequireDefault(_InstallInstallResponse);

var _InstallPerformCheckRequest = require('./model/InstallPerformCheckRequest');

var _InstallPerformCheckRequest2 = _interopRequireDefault(_InstallPerformCheckRequest);

var _InstallPerformCheckResponse = require('./model/InstallPerformCheckResponse');

var _InstallPerformCheckResponse2 = _interopRequireDefault(_InstallPerformCheckResponse);

var _JobsAction = require('./model/JobsAction');

var _JobsAction2 = _interopRequireDefault(_JobsAction);

var _JobsActionLog = require('./model/JobsActionLog');

var _JobsActionLog2 = _interopRequireDefault(_JobsActionLog);

var _JobsActionMessage = require('./model/JobsActionMessage');

var _JobsActionMessage2 = _interopRequireDefault(_JobsActionMessage);

var _JobsActionOutput = require('./model/JobsActionOutput');

var _JobsActionOutput2 = _interopRequireDefault(_JobsActionOutput);

var _JobsCommand = require('./model/JobsCommand');

var _JobsCommand2 = _interopRequireDefault(_JobsCommand);

var _JobsCtrlCommand = require('./model/JobsCtrlCommand');

var _JobsCtrlCommand2 = _interopRequireDefault(_JobsCtrlCommand);

var _JobsCtrlCommandResponse = require('./model/JobsCtrlCommandResponse');

var _JobsCtrlCommandResponse2 = _interopRequireDefault(_JobsCtrlCommandResponse);

var _JobsDeleteTasksRequest = require('./model/JobsDeleteTasksRequest');

var _JobsDeleteTasksRequest2 = _interopRequireDefault(_JobsDeleteTasksRequest);

var _JobsDeleteTasksResponse = require('./model/JobsDeleteTasksResponse');

var _JobsDeleteTasksResponse2 = _interopRequireDefault(_JobsDeleteTasksResponse);

var _JobsJob = require('./model/JobsJob');

var _JobsJob2 = _interopRequireDefault(_JobsJob);

var _JobsListJobsRequest = require('./model/JobsListJobsRequest');

var _JobsListJobsRequest2 = _interopRequireDefault(_JobsListJobsRequest);

var _JobsNodesSelector = require('./model/JobsNodesSelector');

var _JobsNodesSelector2 = _interopRequireDefault(_JobsNodesSelector);

var _JobsSchedule = require('./model/JobsSchedule');

var _JobsSchedule2 = _interopRequireDefault(_JobsSchedule);

var _JobsSourceFilter = require('./model/JobsSourceFilter');

var _JobsSourceFilter2 = _interopRequireDefault(_JobsSourceFilter);

var _JobsTask = require('./model/JobsTask');

var _JobsTask2 = _interopRequireDefault(_JobsTask);

var _JobsTaskStatus = require('./model/JobsTaskStatus');

var _JobsTaskStatus2 = _interopRequireDefault(_JobsTaskStatus);

var _JobsUsersSelector = require('./model/JobsUsersSelector');

var _JobsUsersSelector2 = _interopRequireDefault(_JobsUsersSelector);

var _ListLogRequestLogFormat = require('./model/ListLogRequestLogFormat');

var _ListLogRequestLogFormat2 = _interopRequireDefault(_ListLogRequestLogFormat);

var _ListSharedResourcesRequestListShareType = require('./model/ListSharedResourcesRequestListShareType');

var _ListSharedResourcesRequestListShareType2 = _interopRequireDefault(_ListSharedResourcesRequestListShareType);

var _ListSharedResourcesResponseSharedResource = require('./model/ListSharedResourcesResponseSharedResource');

var _ListSharedResourcesResponseSharedResource2 = _interopRequireDefault(_ListSharedResourcesResponseSharedResource);

var _LogListLogRequest = require('./model/LogListLogRequest');

var _LogListLogRequest2 = _interopRequireDefault(_LogListLogRequest);

var _LogLogMessage = require('./model/LogLogMessage');

var _LogLogMessage2 = _interopRequireDefault(_LogLogMessage);

var _LogRelType = require('./model/LogRelType');

var _LogRelType2 = _interopRequireDefault(_LogRelType);

var _LogTimeRangeCursor = require('./model/LogTimeRangeCursor');

var _LogTimeRangeCursor2 = _interopRequireDefault(_LogTimeRangeCursor);

var _LogTimeRangeRequest = require('./model/LogTimeRangeRequest');

var _LogTimeRangeRequest2 = _interopRequireDefault(_LogTimeRangeRequest);

var _LogTimeRangeResult = require('./model/LogTimeRangeResult');

var _LogTimeRangeResult2 = _interopRequireDefault(_LogTimeRangeResult);

var _MailerMail = require('./model/MailerMail');

var _MailerMail2 = _interopRequireDefault(_MailerMail);

var _MailerSendMailResponse = require('./model/MailerSendMailResponse');

var _MailerSendMailResponse2 = _interopRequireDefault(_MailerSendMailResponse);

var _MailerUser = require('./model/MailerUser');

var _MailerUser2 = _interopRequireDefault(_MailerUser);

var _NodeChangeEventEventType = require('./model/NodeChangeEventEventType');

var _NodeChangeEventEventType2 = _interopRequireDefault(_NodeChangeEventEventType);

var _ObjectDataSource = require('./model/ObjectDataSource');

var _ObjectDataSource2 = _interopRequireDefault(_ObjectDataSource);

var _ObjectEncryptionMode = require('./model/ObjectEncryptionMode');

var _ObjectEncryptionMode2 = _interopRequireDefault(_ObjectEncryptionMode);

var _ObjectStorageType = require('./model/ObjectStorageType');

var _ObjectStorageType2 = _interopRequireDefault(_ObjectStorageType);

var _PackagePackageStatus = require('./model/PackagePackageStatus');

var _PackagePackageStatus2 = _interopRequireDefault(_PackagePackageStatus);

var _ProtobufAny = require('./model/ProtobufAny');

var _ProtobufAny2 = _interopRequireDefault(_ProtobufAny);

var _ResourcePolicyQueryQueryType = require('./model/ResourcePolicyQueryQueryType');

var _ResourcePolicyQueryQueryType2 = _interopRequireDefault(_ResourcePolicyQueryQueryType);

var _RestACLCollection = require('./model/RestACLCollection');

var _RestACLCollection2 = _interopRequireDefault(_RestACLCollection);

var _RestBindResponse = require('./model/RestBindResponse');

var _RestBindResponse2 = _interopRequireDefault(_RestBindResponse);

var _RestBulkMetaResponse = require('./model/RestBulkMetaResponse');

var _RestBulkMetaResponse2 = _interopRequireDefault(_RestBulkMetaResponse);

var _RestCell = require('./model/RestCell');

var _RestCell2 = _interopRequireDefault(_RestCell);

var _RestCellAcl = require('./model/RestCellAcl');

var _RestCellAcl2 = _interopRequireDefault(_RestCellAcl);

var _RestChangeCollection = require('./model/RestChangeCollection');

var _RestChangeCollection2 = _interopRequireDefault(_RestChangeCollection);

var _RestChangeRequest = require('./model/RestChangeRequest');

var _RestChangeRequest2 = _interopRequireDefault(_RestChangeRequest);

var _RestConfiguration = require('./model/RestConfiguration');

var _RestConfiguration2 = _interopRequireDefault(_RestConfiguration);

var _RestControlServiceRequest = require('./model/RestControlServiceRequest');

var _RestControlServiceRequest2 = _interopRequireDefault(_RestControlServiceRequest);

var _RestDataSourceCollection = require('./model/RestDataSourceCollection');

var _RestDataSourceCollection2 = _interopRequireDefault(_RestDataSourceCollection);

var _RestDeleteCellResponse = require('./model/RestDeleteCellResponse');

var _RestDeleteCellResponse2 = _interopRequireDefault(_RestDeleteCellResponse);

var _RestDeleteDataSourceResponse = require('./model/RestDeleteDataSourceResponse');

var _RestDeleteDataSourceResponse2 = _interopRequireDefault(_RestDeleteDataSourceResponse);

var _RestDeleteResponse = require('./model/RestDeleteResponse');

var _RestDeleteResponse2 = _interopRequireDefault(_RestDeleteResponse);

var _RestDeleteShareLinkResponse = require('./model/RestDeleteShareLinkResponse');

var _RestDeleteShareLinkResponse2 = _interopRequireDefault(_RestDeleteShareLinkResponse);

var _RestDeleteVersioningPolicyResponse = require('./model/RestDeleteVersioningPolicyResponse');

var _RestDeleteVersioningPolicyResponse2 = _interopRequireDefault(_RestDeleteVersioningPolicyResponse);

var _RestDiscoveryResponse = require('./model/RestDiscoveryResponse');

var _RestDiscoveryResponse2 = _interopRequireDefault(_RestDiscoveryResponse);

var _RestDocstoreCollection = require('./model/RestDocstoreCollection');

var _RestDocstoreCollection2 = _interopRequireDefault(_RestDocstoreCollection);

var _RestExternalDirectoryCollection = require('./model/RestExternalDirectoryCollection');

var _RestExternalDirectoryCollection2 = _interopRequireDefault(_RestExternalDirectoryCollection);

var _RestExternalDirectoryConfig = require('./model/RestExternalDirectoryConfig');

var _RestExternalDirectoryConfig2 = _interopRequireDefault(_RestExternalDirectoryConfig);

var _RestExternalDirectoryResponse = require('./model/RestExternalDirectoryResponse');

var _RestExternalDirectoryResponse2 = _interopRequireDefault(_RestExternalDirectoryResponse);

var _RestFrontBootConfResponse = require('./model/RestFrontBootConfResponse');

var _RestFrontBootConfResponse2 = _interopRequireDefault(_RestFrontBootConfResponse);

var _RestFrontLogMessage = require('./model/RestFrontLogMessage');

var _RestFrontLogMessage2 = _interopRequireDefault(_RestFrontLogMessage);

var _RestFrontLogResponse = require('./model/RestFrontLogResponse');

var _RestFrontLogResponse2 = _interopRequireDefault(_RestFrontLogResponse);

var _RestGetBulkMetaRequest = require('./model/RestGetBulkMetaRequest');

var _RestGetBulkMetaRequest2 = _interopRequireDefault(_RestGetBulkMetaRequest);

var _RestListDocstoreRequest = require('./model/RestListDocstoreRequest');

var _RestListDocstoreRequest2 = _interopRequireDefault(_RestListDocstoreRequest);

var _RestListPeerFoldersRequest = require('./model/RestListPeerFoldersRequest');

var _RestListPeerFoldersRequest2 = _interopRequireDefault(_RestListPeerFoldersRequest);

var _RestListPeersAddressesResponse = require('./model/RestListPeersAddressesResponse');

var _RestListPeersAddressesResponse2 = _interopRequireDefault(_RestListPeersAddressesResponse);

var _RestListSharedResourcesRequest = require('./model/RestListSharedResourcesRequest');

var _RestListSharedResourcesRequest2 = _interopRequireDefault(_RestListSharedResourcesRequest);

var _RestListSharedResourcesResponse = require('./model/RestListSharedResourcesResponse');

var _RestListSharedResourcesResponse2 = _interopRequireDefault(_RestListSharedResourcesResponse);

var _RestLogLevel = require('./model/RestLogLevel');

var _RestLogLevel2 = _interopRequireDefault(_RestLogLevel);

var _RestLogMessageCollection = require('./model/RestLogMessageCollection');

var _RestLogMessageCollection2 = _interopRequireDefault(_RestLogMessageCollection);

var _RestMetaCollection = require('./model/RestMetaCollection');

var _RestMetaCollection2 = _interopRequireDefault(_RestMetaCollection);

var _RestMetaNamespaceRequest = require('./model/RestMetaNamespaceRequest');

var _RestMetaNamespaceRequest2 = _interopRequireDefault(_RestMetaNamespaceRequest);

var _RestMetadata = require('./model/RestMetadata');

var _RestMetadata2 = _interopRequireDefault(_RestMetadata);

var _RestNodesCollection = require('./model/RestNodesCollection');

var _RestNodesCollection2 = _interopRequireDefault(_RestNodesCollection);

var _RestOpenApiResponse = require('./model/RestOpenApiResponse');

var _RestOpenApiResponse2 = _interopRequireDefault(_RestOpenApiResponse);

var _RestPutCellRequest = require('./model/RestPutCellRequest');

var _RestPutCellRequest2 = _interopRequireDefault(_RestPutCellRequest);

var _RestPutShareLinkRequest = require('./model/RestPutShareLinkRequest');

var _RestPutShareLinkRequest2 = _interopRequireDefault(_RestPutShareLinkRequest);

var _RestRelationResponse = require('./model/RestRelationResponse');

var _RestRelationResponse2 = _interopRequireDefault(_RestRelationResponse);

var _RestResetPasswordRequest = require('./model/RestResetPasswordRequest');

var _RestResetPasswordRequest2 = _interopRequireDefault(_RestResetPasswordRequest);

var _RestResetPasswordResponse = require('./model/RestResetPasswordResponse');

var _RestResetPasswordResponse2 = _interopRequireDefault(_RestResetPasswordResponse);

var _RestResetPasswordTokenResponse = require('./model/RestResetPasswordTokenResponse');

var _RestResetPasswordTokenResponse2 = _interopRequireDefault(_RestResetPasswordTokenResponse);

var _RestResourcePolicyQuery = require('./model/RestResourcePolicyQuery');

var _RestResourcePolicyQuery2 = _interopRequireDefault(_RestResourcePolicyQuery);

var _RestRevokeRequest = require('./model/RestRevokeRequest');

var _RestRevokeRequest2 = _interopRequireDefault(_RestRevokeRequest);

var _RestRevokeResponse = require('./model/RestRevokeResponse');

var _RestRevokeResponse2 = _interopRequireDefault(_RestRevokeResponse);

var _RestRolesCollection = require('./model/RestRolesCollection');

var _RestRolesCollection2 = _interopRequireDefault(_RestRolesCollection);

var _RestSearchACLRequest = require('./model/RestSearchACLRequest');

var _RestSearchACLRequest2 = _interopRequireDefault(_RestSearchACLRequest);

var _RestSearchResults = require('./model/RestSearchResults');

var _RestSearchResults2 = _interopRequireDefault(_RestSearchResults);

var _RestSearchRoleRequest = require('./model/RestSearchRoleRequest');

var _RestSearchRoleRequest2 = _interopRequireDefault(_RestSearchRoleRequest);

var _RestSearchUserRequest = require('./model/RestSearchUserRequest');

var _RestSearchUserRequest2 = _interopRequireDefault(_RestSearchUserRequest);

var _RestSearchWorkspaceRequest = require('./model/RestSearchWorkspaceRequest');

var _RestSearchWorkspaceRequest2 = _interopRequireDefault(_RestSearchWorkspaceRequest);

var _RestServiceCollection = require('./model/RestServiceCollection');

var _RestServiceCollection2 = _interopRequireDefault(_RestServiceCollection);

var _RestSettingsEntry = require('./model/RestSettingsEntry');

var _RestSettingsEntry2 = _interopRequireDefault(_RestSettingsEntry);

var _RestSettingsEntryMeta = require('./model/RestSettingsEntryMeta');

var _RestSettingsEntryMeta2 = _interopRequireDefault(_RestSettingsEntryMeta);

var _RestSettingsMenuResponse = require('./model/RestSettingsMenuResponse');

var _RestSettingsMenuResponse2 = _interopRequireDefault(_RestSettingsMenuResponse);

var _RestSettingsSection = require('./model/RestSettingsSection');

var _RestSettingsSection2 = _interopRequireDefault(_RestSettingsSection);

var _RestShareLink = require('./model/RestShareLink');

var _RestShareLink2 = _interopRequireDefault(_RestShareLink);

var _RestShareLinkAccessType = require('./model/RestShareLinkAccessType');

var _RestShareLinkAccessType2 = _interopRequireDefault(_RestShareLinkAccessType);

var _RestShareLinkTargetUser = require('./model/RestShareLinkTargetUser');

var _RestShareLinkTargetUser2 = _interopRequireDefault(_RestShareLinkTargetUser);

var _RestSubscriptionsCollection = require('./model/RestSubscriptionsCollection');

var _RestSubscriptionsCollection2 = _interopRequireDefault(_RestSubscriptionsCollection);

var _RestTimeRangeResultCollection = require('./model/RestTimeRangeResultCollection');

var _RestTimeRangeResultCollection2 = _interopRequireDefault(_RestTimeRangeResultCollection);

var _RestUserBookmarksRequest = require('./model/RestUserBookmarksRequest');

var _RestUserBookmarksRequest2 = _interopRequireDefault(_RestUserBookmarksRequest);

var _RestUserJobRequest = require('./model/RestUserJobRequest');

var _RestUserJobRequest2 = _interopRequireDefault(_RestUserJobRequest);

var _RestUserJobResponse = require('./model/RestUserJobResponse');

var _RestUserJobResponse2 = _interopRequireDefault(_RestUserJobResponse);

var _RestUserJobsCollection = require('./model/RestUserJobsCollection');

var _RestUserJobsCollection2 = _interopRequireDefault(_RestUserJobsCollection);

var _RestUserMetaCollection = require('./model/RestUserMetaCollection');

var _RestUserMetaCollection2 = _interopRequireDefault(_RestUserMetaCollection);

var _RestUserMetaNamespaceCollection = require('./model/RestUserMetaNamespaceCollection');

var _RestUserMetaNamespaceCollection2 = _interopRequireDefault(_RestUserMetaNamespaceCollection);

var _RestUserStateResponse = require('./model/RestUserStateResponse');

var _RestUserStateResponse2 = _interopRequireDefault(_RestUserStateResponse);

var _RestUsersCollection = require('./model/RestUsersCollection');

var _RestUsersCollection2 = _interopRequireDefault(_RestUsersCollection);

var _RestVersioningPolicyCollection = require('./model/RestVersioningPolicyCollection');

var _RestVersioningPolicyCollection2 = _interopRequireDefault(_RestVersioningPolicyCollection);

var _RestWorkspaceCollection = require('./model/RestWorkspaceCollection');

var _RestWorkspaceCollection2 = _interopRequireDefault(_RestWorkspaceCollection);

var _ServiceOperationType = require('./model/ServiceOperationType');

var _ServiceOperationType2 = _interopRequireDefault(_ServiceOperationType);

var _ServiceQuery = require('./model/ServiceQuery');

var _ServiceQuery2 = _interopRequireDefault(_ServiceQuery);

var _ServiceResourcePolicy = require('./model/ServiceResourcePolicy');

var _ServiceResourcePolicy2 = _interopRequireDefault(_ServiceResourcePolicy);

var _ServiceResourcePolicyAction = require('./model/ServiceResourcePolicyAction');

var _ServiceResourcePolicyAction2 = _interopRequireDefault(_ServiceResourcePolicyAction);

var _ServiceResourcePolicyPolicyEffect = require('./model/ServiceResourcePolicyPolicyEffect');

var _ServiceResourcePolicyPolicyEffect2 = _interopRequireDefault(_ServiceResourcePolicyPolicyEffect);

var _ServiceResourcePolicyQuery = require('./model/ServiceResourcePolicyQuery');

var _ServiceResourcePolicyQuery2 = _interopRequireDefault(_ServiceResourcePolicyQuery);

var _TreeChangeLog = require('./model/TreeChangeLog');

var _TreeChangeLog2 = _interopRequireDefault(_TreeChangeLog);

var _TreeGeoPoint = require('./model/TreeGeoPoint');

var _TreeGeoPoint2 = _interopRequireDefault(_TreeGeoPoint);

var _TreeGeoQuery = require('./model/TreeGeoQuery');

var _TreeGeoQuery2 = _interopRequireDefault(_TreeGeoQuery);

var _TreeListNodesRequest = require('./model/TreeListNodesRequest');

var _TreeListNodesRequest2 = _interopRequireDefault(_TreeListNodesRequest);

var _TreeNode = require('./model/TreeNode');

var _TreeNode2 = _interopRequireDefault(_TreeNode);

var _TreeNodeChangeEvent = require('./model/TreeNodeChangeEvent');

var _TreeNodeChangeEvent2 = _interopRequireDefault(_TreeNodeChangeEvent);

var _TreeNodeType = require('./model/TreeNodeType');

var _TreeNodeType2 = _interopRequireDefault(_TreeNodeType);

var _TreeQuery = require('./model/TreeQuery');

var _TreeQuery2 = _interopRequireDefault(_TreeQuery);

var _TreeReadNodeRequest = require('./model/TreeReadNodeRequest');

var _TreeReadNodeRequest2 = _interopRequireDefault(_TreeReadNodeRequest);

var _TreeReadNodeResponse = require('./model/TreeReadNodeResponse');

var _TreeReadNodeResponse2 = _interopRequireDefault(_TreeReadNodeResponse);

var _TreeSearchRequest = require('./model/TreeSearchRequest');

var _TreeSearchRequest2 = _interopRequireDefault(_TreeSearchRequest);

var _TreeSyncChange = require('./model/TreeSyncChange');

var _TreeSyncChange2 = _interopRequireDefault(_TreeSyncChange);

var _TreeSyncChangeNode = require('./model/TreeSyncChangeNode');

var _TreeSyncChangeNode2 = _interopRequireDefault(_TreeSyncChangeNode);

var _TreeSyncChangeType = require('./model/TreeSyncChangeType');

var _TreeSyncChangeType2 = _interopRequireDefault(_TreeSyncChangeType);

var _TreeVersioningKeepPeriod = require('./model/TreeVersioningKeepPeriod');

var _TreeVersioningKeepPeriod2 = _interopRequireDefault(_TreeVersioningKeepPeriod);

var _TreeVersioningPolicy = require('./model/TreeVersioningPolicy');

var _TreeVersioningPolicy2 = _interopRequireDefault(_TreeVersioningPolicy);

var _TreeWorkspaceRelativePath = require('./model/TreeWorkspaceRelativePath');

var _TreeWorkspaceRelativePath2 = _interopRequireDefault(_TreeWorkspaceRelativePath);

var _UpdateApplyUpdateResponse = require('./model/UpdateApplyUpdateResponse');

var _UpdateApplyUpdateResponse2 = _interopRequireDefault(_UpdateApplyUpdateResponse);

var _UpdatePackage = require('./model/UpdatePackage');

var _UpdatePackage2 = _interopRequireDefault(_UpdatePackage);

var _UpdateUpdateResponse = require('./model/UpdateUpdateResponse');

var _UpdateUpdateResponse2 = _interopRequireDefault(_UpdateUpdateResponse);

var _UpdateUserMetaNamespaceRequestUserMetaNsOp = require('./model/UpdateUserMetaNamespaceRequestUserMetaNsOp');

var _UpdateUserMetaNamespaceRequestUserMetaNsOp2 = _interopRequireDefault(_UpdateUserMetaNamespaceRequestUserMetaNsOp);

var _UpdateUserMetaRequestUserMetaOp = require('./model/UpdateUserMetaRequestUserMetaOp');

var _UpdateUserMetaRequestUserMetaOp2 = _interopRequireDefault(_UpdateUserMetaRequestUserMetaOp);

var _ACLServiceApi = require('./api/ACLServiceApi');

var _ACLServiceApi2 = _interopRequireDefault(_ACLServiceApi);

var _ActivityServiceApi = require('./api/ActivityServiceApi');

var _ActivityServiceApi2 = _interopRequireDefault(_ActivityServiceApi);

var _AdminTreeServiceApi = require('./api/AdminTreeServiceApi');

var _AdminTreeServiceApi2 = _interopRequireDefault(_AdminTreeServiceApi);

var _ChangeServiceApi = require('./api/ChangeServiceApi');

var _ChangeServiceApi2 = _interopRequireDefault(_ChangeServiceApi);

var _ConfigServiceApi = require('./api/ConfigServiceApi');

var _ConfigServiceApi2 = _interopRequireDefault(_ConfigServiceApi);

var _DocStoreServiceApi = require('./api/DocStoreServiceApi');

var _DocStoreServiceApi2 = _interopRequireDefault(_DocStoreServiceApi);

var _EnterpriseConfigServiceApi = require('./api/EnterpriseConfigServiceApi');

var _EnterpriseConfigServiceApi2 = _interopRequireDefault(_EnterpriseConfigServiceApi);

var _EnterpriseLogServiceApi = require('./api/EnterpriseLogServiceApi');

var _EnterpriseLogServiceApi2 = _interopRequireDefault(_EnterpriseLogServiceApi);

var _EnterprisePolicyServiceApi = require('./api/EnterprisePolicyServiceApi');

var _EnterprisePolicyServiceApi2 = _interopRequireDefault(_EnterprisePolicyServiceApi);

var _FrontendServiceApi = require('./api/FrontendServiceApi');

var _FrontendServiceApi2 = _interopRequireDefault(_FrontendServiceApi);

var _GraphServiceApi = require('./api/GraphServiceApi');

var _GraphServiceApi2 = _interopRequireDefault(_GraphServiceApi);

var _InstallServiceApi = require('./api/InstallServiceApi');

var _InstallServiceApi2 = _interopRequireDefault(_InstallServiceApi);

var _JobsServiceApi = require('./api/JobsServiceApi');

var _JobsServiceApi2 = _interopRequireDefault(_JobsServiceApi);

var _LicenseServiceApi = require('./api/LicenseServiceApi');

var _LicenseServiceApi2 = _interopRequireDefault(_LicenseServiceApi);

var _LogServiceApi = require('./api/LogServiceApi');

var _LogServiceApi2 = _interopRequireDefault(_LogServiceApi);

var _MailerServiceApi = require('./api/MailerServiceApi');

var _MailerServiceApi2 = _interopRequireDefault(_MailerServiceApi);

var _MetaServiceApi = require('./api/MetaServiceApi');

var _MetaServiceApi2 = _interopRequireDefault(_MetaServiceApi);

var _PolicyServiceApi = require('./api/PolicyServiceApi');

var _PolicyServiceApi2 = _interopRequireDefault(_PolicyServiceApi);

var _RoleServiceApi = require('./api/RoleServiceApi');

var _RoleServiceApi2 = _interopRequireDefault(_RoleServiceApi);

var _SearchServiceApi = require('./api/SearchServiceApi');

var _SearchServiceApi2 = _interopRequireDefault(_SearchServiceApi);

var _ShareServiceApi = require('./api/ShareServiceApi');

var _ShareServiceApi2 = _interopRequireDefault(_ShareServiceApi);

var _TokenServiceApi = require('./api/TokenServiceApi');

var _TokenServiceApi2 = _interopRequireDefault(_TokenServiceApi);

var _UpdateServiceApi = require('./api/UpdateServiceApi');

var _UpdateServiceApi2 = _interopRequireDefault(_UpdateServiceApi);

var _UserMetaServiceApi = require('./api/UserMetaServiceApi');

var _UserMetaServiceApi2 = _interopRequireDefault(_UserMetaServiceApi);

var _UserServiceApi = require('./api/UserServiceApi');

var _UserServiceApi2 = _interopRequireDefault(_UserServiceApi);

var _WorkspaceServiceApi = require('./api/WorkspaceServiceApi');

var _WorkspaceServiceApi2 = _interopRequireDefault(_WorkspaceServiceApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* ERROR_UNKNOWN.<br>
* The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
* <p>
* An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
* <pre>
* var PydioCellRestApi = require('index'); // See note below*.
* var xxxSvc = new PydioCellRestApi.XxxApi(); // Allocate the API class we're going to use.
* var yyyModel = new PydioCellRestApi.Yyy(); // Construct a model instance.
* yyyModel.someProperty = 'someValue';
* ...
* var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
* ...
* </pre>
* <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
* and put the application logic within the callback function.</em>
* </p>
* <p>
* A non-AMD browser application (discouraged) might do something like this:
* <pre>
* var xxxSvc = new PydioCellRestApi.XxxApi(); // Allocate the API class we're going to use.
* var yyy = new PydioCellRestApi.Yyy(); // Construct a model instance.
* yyyModel.someProperty = 'someValue';
* ...
* var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
* ...
* </pre>
* </p>
* @module index
* @version 1.0
*/
/**
 * Pydio Cell Rest API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

exports.ApiClient = _ApiClient2.default;
exports.ActivityObject = _ActivityObject2.default;
exports.ActivityObjectType = _ActivityObjectType2.default;
exports.ActivityOwnerType = _ActivityOwnerType2.default;
exports.ActivitySearchSubscriptionsRequest = _ActivitySearchSubscriptionsRequest2.default;
exports.ActivityStreamActivitiesRequest = _ActivityStreamActivitiesRequest2.default;
exports.ActivityStreamContext = _ActivityStreamContext2.default;
exports.ActivitySubscription = _ActivitySubscription2.default;
exports.ActivitySummaryPointOfView = _ActivitySummaryPointOfView2.default;
exports.AuthLdapMapping = _AuthLdapMapping2.default;
exports.AuthLdapMemberOfMapping = _AuthLdapMemberOfMapping2.default;
exports.AuthLdapSearchFilter = _AuthLdapSearchFilter2.default;
exports.AuthLdapServerConfig = _AuthLdapServerConfig2.default;
exports.CertLicenseInfo = _CertLicenseInfo2.default;
exports.CertLicenseStatsResponse = _CertLicenseStatsResponse2.default;
exports.CtlPeer = _CtlPeer2.default;
exports.CtlService = _CtlService2.default;
exports.CtlServiceCommand = _CtlServiceCommand2.default;
exports.CtlServiceStatus = _CtlServiceStatus2.default;
exports.DocstoreDeleteDocumentsRequest = _DocstoreDeleteDocumentsRequest2.default;
exports.DocstoreDeleteDocumentsResponse = _DocstoreDeleteDocumentsResponse2.default;
exports.DocstoreDocument = _DocstoreDocument2.default;
exports.DocstoreDocumentQuery = _DocstoreDocumentQuery2.default;
exports.DocstoreDocumentType = _DocstoreDocumentType2.default;
exports.DocstoreGetDocumentResponse = _DocstoreGetDocumentResponse2.default;
exports.DocstorePutDocumentRequest = _DocstorePutDocumentRequest2.default;
exports.DocstorePutDocumentResponse = _DocstorePutDocumentResponse2.default;
exports.EncryptionAdminCreateKeyRequest = _EncryptionAdminCreateKeyRequest2.default;
exports.EncryptionAdminCreateKeyResponse = _EncryptionAdminCreateKeyResponse2.default;
exports.EncryptionAdminDeleteKeyRequest = _EncryptionAdminDeleteKeyRequest2.default;
exports.EncryptionAdminDeleteKeyResponse = _EncryptionAdminDeleteKeyResponse2.default;
exports.EncryptionAdminExportKeyRequest = _EncryptionAdminExportKeyRequest2.default;
exports.EncryptionAdminExportKeyResponse = _EncryptionAdminExportKeyResponse2.default;
exports.EncryptionAdminImportKeyRequest = _EncryptionAdminImportKeyRequest2.default;
exports.EncryptionAdminImportKeyResponse = _EncryptionAdminImportKeyResponse2.default;
exports.EncryptionAdminListKeysRequest = _EncryptionAdminListKeysRequest2.default;
exports.EncryptionAdminListKeysResponse = _EncryptionAdminListKeysResponse2.default;
exports.EncryptionExport = _EncryptionExport2.default;
exports.EncryptionImport = _EncryptionImport2.default;
exports.EncryptionKey = _EncryptionKey2.default;
exports.EncryptionKeyInfo = _EncryptionKeyInfo2.default;
exports.IdmACL = _IdmACL2.default;
exports.IdmACLAction = _IdmACLAction2.default;
exports.IdmACLSingleQuery = _IdmACLSingleQuery2.default;
exports.IdmListPolicyGroupsRequest = _IdmListPolicyGroupsRequest2.default;
exports.IdmListPolicyGroupsResponse = _IdmListPolicyGroupsResponse2.default;
exports.IdmNodeType = _IdmNodeType2.default;
exports.IdmPolicy = _IdmPolicy2.default;
exports.IdmPolicyCondition = _IdmPolicyCondition2.default;
exports.IdmPolicyEffect = _IdmPolicyEffect2.default;
exports.IdmPolicyGroup = _IdmPolicyGroup2.default;
exports.IdmPolicyResourceGroup = _IdmPolicyResourceGroup2.default;
exports.IdmRole = _IdmRole2.default;
exports.IdmRoleSingleQuery = _IdmRoleSingleQuery2.default;
exports.IdmSearchUserMetaRequest = _IdmSearchUserMetaRequest2.default;
exports.IdmUpdateUserMetaNamespaceRequest = _IdmUpdateUserMetaNamespaceRequest2.default;
exports.IdmUpdateUserMetaNamespaceResponse = _IdmUpdateUserMetaNamespaceResponse2.default;
exports.IdmUpdateUserMetaRequest = _IdmUpdateUserMetaRequest2.default;
exports.IdmUpdateUserMetaResponse = _IdmUpdateUserMetaResponse2.default;
exports.IdmUser = _IdmUser2.default;
exports.IdmUserMeta = _IdmUserMeta2.default;
exports.IdmUserMetaNamespace = _IdmUserMetaNamespace2.default;
exports.IdmUserSingleQuery = _IdmUserSingleQuery2.default;
exports.IdmWorkspace = _IdmWorkspace2.default;
exports.IdmWorkspaceScope = _IdmWorkspaceScope2.default;
exports.IdmWorkspaceSingleQuery = _IdmWorkspaceSingleQuery2.default;
exports.InstallCheckResult = _InstallCheckResult2.default;
exports.InstallGetDefaultsResponse = _InstallGetDefaultsResponse2.default;
exports.InstallInstallConfig = _InstallInstallConfig2.default;
exports.InstallInstallRequest = _InstallInstallRequest2.default;
exports.InstallInstallResponse = _InstallInstallResponse2.default;
exports.InstallPerformCheckRequest = _InstallPerformCheckRequest2.default;
exports.InstallPerformCheckResponse = _InstallPerformCheckResponse2.default;
exports.JobsAction = _JobsAction2.default;
exports.JobsActionLog = _JobsActionLog2.default;
exports.JobsActionMessage = _JobsActionMessage2.default;
exports.JobsActionOutput = _JobsActionOutput2.default;
exports.JobsCommand = _JobsCommand2.default;
exports.JobsCtrlCommand = _JobsCtrlCommand2.default;
exports.JobsCtrlCommandResponse = _JobsCtrlCommandResponse2.default;
exports.JobsDeleteTasksRequest = _JobsDeleteTasksRequest2.default;
exports.JobsDeleteTasksResponse = _JobsDeleteTasksResponse2.default;
exports.JobsJob = _JobsJob2.default;
exports.JobsListJobsRequest = _JobsListJobsRequest2.default;
exports.JobsNodesSelector = _JobsNodesSelector2.default;
exports.JobsSchedule = _JobsSchedule2.default;
exports.JobsSourceFilter = _JobsSourceFilter2.default;
exports.JobsTask = _JobsTask2.default;
exports.JobsTaskStatus = _JobsTaskStatus2.default;
exports.JobsUsersSelector = _JobsUsersSelector2.default;
exports.ListLogRequestLogFormat = _ListLogRequestLogFormat2.default;
exports.ListSharedResourcesRequestListShareType = _ListSharedResourcesRequestListShareType2.default;
exports.ListSharedResourcesResponseSharedResource = _ListSharedResourcesResponseSharedResource2.default;
exports.LogListLogRequest = _LogListLogRequest2.default;
exports.LogLogMessage = _LogLogMessage2.default;
exports.LogRelType = _LogRelType2.default;
exports.LogTimeRangeCursor = _LogTimeRangeCursor2.default;
exports.LogTimeRangeRequest = _LogTimeRangeRequest2.default;
exports.LogTimeRangeResult = _LogTimeRangeResult2.default;
exports.MailerMail = _MailerMail2.default;
exports.MailerSendMailResponse = _MailerSendMailResponse2.default;
exports.MailerUser = _MailerUser2.default;
exports.NodeChangeEventEventType = _NodeChangeEventEventType2.default;
exports.ObjectDataSource = _ObjectDataSource2.default;
exports.ObjectEncryptionMode = _ObjectEncryptionMode2.default;
exports.ObjectStorageType = _ObjectStorageType2.default;
exports.PackagePackageStatus = _PackagePackageStatus2.default;
exports.ProtobufAny = _ProtobufAny2.default;
exports.ResourcePolicyQueryQueryType = _ResourcePolicyQueryQueryType2.default;
exports.RestACLCollection = _RestACLCollection2.default;
exports.RestBindResponse = _RestBindResponse2.default;
exports.RestBulkMetaResponse = _RestBulkMetaResponse2.default;
exports.RestCell = _RestCell2.default;
exports.RestCellAcl = _RestCellAcl2.default;
exports.RestChangeCollection = _RestChangeCollection2.default;
exports.RestChangeRequest = _RestChangeRequest2.default;
exports.RestConfiguration = _RestConfiguration2.default;
exports.RestControlServiceRequest = _RestControlServiceRequest2.default;
exports.RestDataSourceCollection = _RestDataSourceCollection2.default;
exports.RestDeleteCellResponse = _RestDeleteCellResponse2.default;
exports.RestDeleteDataSourceResponse = _RestDeleteDataSourceResponse2.default;
exports.RestDeleteResponse = _RestDeleteResponse2.default;
exports.RestDeleteShareLinkResponse = _RestDeleteShareLinkResponse2.default;
exports.RestDeleteVersioningPolicyResponse = _RestDeleteVersioningPolicyResponse2.default;
exports.RestDiscoveryResponse = _RestDiscoveryResponse2.default;
exports.RestDocstoreCollection = _RestDocstoreCollection2.default;
exports.RestExternalDirectoryCollection = _RestExternalDirectoryCollection2.default;
exports.RestExternalDirectoryConfig = _RestExternalDirectoryConfig2.default;
exports.RestExternalDirectoryResponse = _RestExternalDirectoryResponse2.default;
exports.RestFrontBootConfResponse = _RestFrontBootConfResponse2.default;
exports.RestFrontLogMessage = _RestFrontLogMessage2.default;
exports.RestFrontLogResponse = _RestFrontLogResponse2.default;
exports.RestGetBulkMetaRequest = _RestGetBulkMetaRequest2.default;
exports.RestListDocstoreRequest = _RestListDocstoreRequest2.default;
exports.RestListPeerFoldersRequest = _RestListPeerFoldersRequest2.default;
exports.RestListPeersAddressesResponse = _RestListPeersAddressesResponse2.default;
exports.RestListSharedResourcesRequest = _RestListSharedResourcesRequest2.default;
exports.RestListSharedResourcesResponse = _RestListSharedResourcesResponse2.default;
exports.RestLogLevel = _RestLogLevel2.default;
exports.RestLogMessageCollection = _RestLogMessageCollection2.default;
exports.RestMetaCollection = _RestMetaCollection2.default;
exports.RestMetaNamespaceRequest = _RestMetaNamespaceRequest2.default;
exports.RestMetadata = _RestMetadata2.default;
exports.RestNodesCollection = _RestNodesCollection2.default;
exports.RestOpenApiResponse = _RestOpenApiResponse2.default;
exports.RestPutCellRequest = _RestPutCellRequest2.default;
exports.RestPutShareLinkRequest = _RestPutShareLinkRequest2.default;
exports.RestRelationResponse = _RestRelationResponse2.default;
exports.RestResetPasswordRequest = _RestResetPasswordRequest2.default;
exports.RestResetPasswordResponse = _RestResetPasswordResponse2.default;
exports.RestResetPasswordTokenResponse = _RestResetPasswordTokenResponse2.default;
exports.RestResourcePolicyQuery = _RestResourcePolicyQuery2.default;
exports.RestRevokeRequest = _RestRevokeRequest2.default;
exports.RestRevokeResponse = _RestRevokeResponse2.default;
exports.RestRolesCollection = _RestRolesCollection2.default;
exports.RestSearchACLRequest = _RestSearchACLRequest2.default;
exports.RestSearchResults = _RestSearchResults2.default;
exports.RestSearchRoleRequest = _RestSearchRoleRequest2.default;
exports.RestSearchUserRequest = _RestSearchUserRequest2.default;
exports.RestSearchWorkspaceRequest = _RestSearchWorkspaceRequest2.default;
exports.RestServiceCollection = _RestServiceCollection2.default;
exports.RestSettingsEntry = _RestSettingsEntry2.default;
exports.RestSettingsEntryMeta = _RestSettingsEntryMeta2.default;
exports.RestSettingsMenuResponse = _RestSettingsMenuResponse2.default;
exports.RestSettingsSection = _RestSettingsSection2.default;
exports.RestShareLink = _RestShareLink2.default;
exports.RestShareLinkAccessType = _RestShareLinkAccessType2.default;
exports.RestShareLinkTargetUser = _RestShareLinkTargetUser2.default;
exports.RestSubscriptionsCollection = _RestSubscriptionsCollection2.default;
exports.RestTimeRangeResultCollection = _RestTimeRangeResultCollection2.default;
exports.RestUserBookmarksRequest = _RestUserBookmarksRequest2.default;
exports.RestUserJobRequest = _RestUserJobRequest2.default;
exports.RestUserJobResponse = _RestUserJobResponse2.default;
exports.RestUserJobsCollection = _RestUserJobsCollection2.default;
exports.RestUserMetaCollection = _RestUserMetaCollection2.default;
exports.RestUserMetaNamespaceCollection = _RestUserMetaNamespaceCollection2.default;
exports.RestUserStateResponse = _RestUserStateResponse2.default;
exports.RestUsersCollection = _RestUsersCollection2.default;
exports.RestVersioningPolicyCollection = _RestVersioningPolicyCollection2.default;
exports.RestWorkspaceCollection = _RestWorkspaceCollection2.default;
exports.ServiceOperationType = _ServiceOperationType2.default;
exports.ServiceQuery = _ServiceQuery2.default;
exports.ServiceResourcePolicy = _ServiceResourcePolicy2.default;
exports.ServiceResourcePolicyAction = _ServiceResourcePolicyAction2.default;
exports.ServiceResourcePolicyPolicyEffect = _ServiceResourcePolicyPolicyEffect2.default;
exports.ServiceResourcePolicyQuery = _ServiceResourcePolicyQuery2.default;
exports.TreeChangeLog = _TreeChangeLog2.default;
exports.TreeGeoPoint = _TreeGeoPoint2.default;
exports.TreeGeoQuery = _TreeGeoQuery2.default;
exports.TreeListNodesRequest = _TreeListNodesRequest2.default;
exports.TreeNode = _TreeNode2.default;
exports.TreeNodeChangeEvent = _TreeNodeChangeEvent2.default;
exports.TreeNodeType = _TreeNodeType2.default;
exports.TreeQuery = _TreeQuery2.default;
exports.TreeReadNodeRequest = _TreeReadNodeRequest2.default;
exports.TreeReadNodeResponse = _TreeReadNodeResponse2.default;
exports.TreeSearchRequest = _TreeSearchRequest2.default;
exports.TreeSyncChange = _TreeSyncChange2.default;
exports.TreeSyncChangeNode = _TreeSyncChangeNode2.default;
exports.TreeSyncChangeType = _TreeSyncChangeType2.default;
exports.TreeVersioningKeepPeriod = _TreeVersioningKeepPeriod2.default;
exports.TreeVersioningPolicy = _TreeVersioningPolicy2.default;
exports.TreeWorkspaceRelativePath = _TreeWorkspaceRelativePath2.default;
exports.UpdateApplyUpdateResponse = _UpdateApplyUpdateResponse2.default;
exports.UpdatePackage = _UpdatePackage2.default;
exports.UpdateUpdateResponse = _UpdateUpdateResponse2.default;
exports.UpdateUserMetaNamespaceRequestUserMetaNsOp = _UpdateUserMetaNamespaceRequestUserMetaNsOp2.default;
exports.UpdateUserMetaRequestUserMetaOp = _UpdateUserMetaRequestUserMetaOp2.default;
exports.ACLServiceApi = _ACLServiceApi2.default;
exports.ActivityServiceApi = _ActivityServiceApi2.default;
exports.AdminTreeServiceApi = _AdminTreeServiceApi2.default;
exports.ChangeServiceApi = _ChangeServiceApi2.default;
exports.ConfigServiceApi = _ConfigServiceApi2.default;
exports.DocStoreServiceApi = _DocStoreServiceApi2.default;
exports.EnterpriseConfigServiceApi = _EnterpriseConfigServiceApi2.default;
exports.EnterpriseLogServiceApi = _EnterpriseLogServiceApi2.default;
exports.EnterprisePolicyServiceApi = _EnterprisePolicyServiceApi2.default;
exports.FrontendServiceApi = _FrontendServiceApi2.default;
exports.GraphServiceApi = _GraphServiceApi2.default;
exports.InstallServiceApi = _InstallServiceApi2.default;
exports.JobsServiceApi = _JobsServiceApi2.default;
exports.LicenseServiceApi = _LicenseServiceApi2.default;
exports.LogServiceApi = _LogServiceApi2.default;
exports.MailerServiceApi = _MailerServiceApi2.default;
exports.MetaServiceApi = _MetaServiceApi2.default;
exports.PolicyServiceApi = _PolicyServiceApi2.default;
exports.RoleServiceApi = _RoleServiceApi2.default;
exports.SearchServiceApi = _SearchServiceApi2.default;
exports.ShareServiceApi = _ShareServiceApi2.default;
exports.TokenServiceApi = _TokenServiceApi2.default;
exports.UpdateServiceApi = _UpdateServiceApi2.default;
exports.UserMetaServiceApi = _UserMetaServiceApi2.default;
exports.UserServiceApi = _UserServiceApi2.default;
exports.WorkspaceServiceApi = _WorkspaceServiceApi2.default;

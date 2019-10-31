package docs

var knownServices = map[string]*Service{
	"TokenService": {
		Title: "Token Service",
		Short: "Authentication tokens service.",
		Long:  `This service provides endpoints for revoking authentication tokens, and generating unique tokens for reset password operation.`,
	},
	"ShareService": {
		Title: "Share Service",
		Short: "Manage all Cells and Public Links",
		Long:  `This service provides all CRUD operations for managing Cells (folders shared across users) and Public Links (externally accessed)`,
	},
	"UserService": {
		Title: "Users Service",
		Short: "Manage users",
		Long:  `This service provides endpoints for managing users : CRUD operations, update attributes, etc.`,
	},
	"AdminTreeService": {
		Title: "Admin Tree Service",
		Short: "Admin-only access to internal tree",
		Long: `This service is an entry point for admin operations in the internal tree.  
Unlike the standard 'user' tree operations, that must be always prefixed with a workspace slug, admins can list all data starting from the root of all datasources.`,
	},
	"TemplatesService": {
		Title: "Templates Service",
		Short: "Managing files templates",
		Long:  `This service is a simple provider to feed user with a set of predefined templates (typically Office Documents) used to create new files.`,
	},
	"MailerService": {
		Title: "Mailer Service",
		Short: "Send emails",
		Long:  `This service provides a simple way to trigger emails to be sent or queued, based on predefined email templates.`,
	},
	"ActivityService": {
		Title: "Activity Service",
		Short: "ActivityStreams (AS2) endpoints",
		Long:  `This service provides listing to the AS2 feeds for various objects (users activities, user alerts, files/folders activities, etc...)`,
	},
	"FrontendService": {
		Title: "Frontend Service",
		Short: "Web-based frontend service",
		Long:  `This service serves the JS user-interface. Some endpoints require additional Cookie management.`,
	},
	"UserMetaService": {
		Title: "UserMeta Service",
		Short: "Manage user-defined metadata",
		Long:  `This service provides ways to attach user-defined metadata to nodes. It is also used for managing users bookmarks.`,
	},
	"WorkspaceService": {
		Title: "Workspace Service",
		Short: "Manage workspaces",
		Long:  `This service provides CRUD endpoints for managing workspaces.`,
	},
	"JobsService": {
		Title: "Jobs Service",
		Short: "Manage scheduler Jobs",
		Long:  `This service provides listings for the internal scheduler jobs and ways to trigger predefined jobs in the userspace.`,
	},
	"RoleService": {
		Title: "Role Service",
		Short: "Manage roles",
		Long:  `This service provides CRUD endpoints for managing roles. Roles are generic set of permissions that can be applied to any users. Every user has her own role, as every group has one too. User teams are roles as well.`,
	},
	"ConfigService": {
		Title: "Config Service",
		Short: "Manage application configurations",
		Long:  `This service provides mostly admin endpoint for listing/managing the internal configuration. Mostly mapped to the installation pydio.json file.`,
	},
	"UpdateService": {
		Title: "Update Service",
		Short: "Check and apply binary update",
		Long:  `This service provides calls to the update server to check if a new version is available for download.`,
	},
	"LogService": {
		Title: "Log Service",
		Short: "List application logs",
		Long:  `This services provides access to the application logs. Please note that the server must run in 'production' mode to fill the internal log store.`,
	},
	"MetaService": {
		Title: "Meta Service",
		Short: "Files/folders Metadata",
		Long:  `This service provides access to files/folders internal metadata (differing from user-defined metadata). Backward compatible with the Tree Service.`,
	},
	"TreeService": {
		Title: "Tree Service",
		Short: "Main service for listing files",
		Long:  `This service is the main entry point for listing files and folders, getting stats about them, creating folders, etc. Please note that it does not provide access to the actual content (upload/download), which must be accessed using the S3 API.`,
	},
	"InstallService": {
		Title: "Install Service",
		Short: "Browser-based install",
		Long:  `This service is only started at the very first run for serving the web-based installer. After the install, it is always disabled by default.`,
	},
	"SearchService": {
		Title: "Search Service",
		Short: "Access to the search index",
		Long:  `This service provides a rich API for indexing and searching the files and folders.`,
	},
	"ACLService": {
		Title: "ACL Service",
		Short: "Access Control List",
		Long:  `This service provides all endpoints for CRUD-ing the ACLs.`,
	},
	"GraphService": {
		Title: "Graph Service",
		Short: "Relations between users",
		Long:  `This service provides endpoints for getting rich schemas of relations between users (shared data, teams belonging, etc.).`,
	},
	"PolicyService": {
		Title: "Policy Service",
		Short: "Manage resource policies",
		Long:  `This service provides endpoints for managing resource policies. Resource policies are simple rules that can be stacked on any object with a "deny-by-default" approach.`,
	},
}

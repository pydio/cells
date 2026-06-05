/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package cmd

import (
	"context"
	"fmt"
	"math/rand"
	"strings"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	grpcclient "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	pbservice "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/utils/slug"
)

var (
	companySeedName              string
	companySeedUsers             int
	companySeedDepartments       int
	companySeedProjectsPerDept   int
	companySeedPassword          string
	companySeedSeed              int64
	companySeedDryRun            bool
	companySeedMaxTeamsPerDept   int
	companySeedIncludeSharedApps bool
)

var companySeedCmd = &cobra.Command{
	Use:   "company",
	Short: "Seed a realistic enterprise organization",
	Long: `
DESCRIPTION

  Create a deterministic, enterprise-shaped identity and sharing model.

  The command generates:
    - users distributed across departments and teams
    - department, project, and global roles
    - department and project workspaces
    - ACLs that grant access to those workspaces
    - security policy groups for the major job functions

  The generated structure is intentionally biased toward a large company:
    executives, IT, security, department heads, managers, and staff.
`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		switch {
		case companySeedName == "":
			return errors.New("provide a company name")
		case companySeedUsers < 1:
			return errors.New("users must be greater than zero")
		case companySeedDepartments < 1:
			return errors.New("departments must be greater than zero")
		case companySeedProjectsPerDept < 0:
			return errors.New("projects-per-department cannot be negative")
		case companySeedMaxTeamsPerDept < 1:
			return errors.New("max-teams-per-dept must be greater than zero")
		}
		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		if companySeedDryRun {
			departments := buildDepartmentBlueprint(companySeedDepartments)
			execs := min(companySeedUsers, 5)
			estimatedRoles := 5 + companySeedDepartments + (companySeedDepartments * companySeedProjectsPerDept)
			estimatedPolicies := 5 + companySeedDepartments
			estimatedWorkspaces := companySeedDepartments * (1 + companySeedProjectsPerDept)
			if companySeedIncludeSharedApps {
				estimatedWorkspaces++
			}
			cmd.Printf("Dry run for %q\n", companySeedName)
			cmd.Printf("  Users: %d (executive seats reserved: %d)\n", companySeedUsers, execs)
			cmd.Printf("  Departments: %d\n", len(departments))
			cmd.Printf("  Workspaces: %d\n", estimatedWorkspaces)
			cmd.Printf("  Roles: %d\n", estimatedRoles)
			cmd.Printf("  Policy groups: %d\n", estimatedPolicies)
			return nil
		}

		ctx := cmd.Context()
		rng := rand.New(rand.NewSource(companySeedSeed))

		departments := buildDepartmentBlueprint(companySeedDepartments)
		execRoles, deptRoles, projectRoles, specialRoles, err := seedRoles(ctx, companySeedName, departments, companySeedProjectsPerDept)
		if err != nil {
			return err
		}

		policyCount, err := seedPolicyGroups(ctx, companySeedName, execRoles, specialRoles, deptRoles)
		if err != nil {
			return err
		}

		workspaces, err := seedWorkspaces(ctx, companySeedName, departments, execRoles, deptRoles, projectRoles, specialRoles)
		if err != nil {
			return err
		}

		if err := seedAcls(ctx, companySeedName, workspaces, execRoles, deptRoles, projectRoles, specialRoles); err != nil {
			return err
		}

		usersCreated, err := seedUsers(ctx, companySeedName, companySeedUsers, companySeedPassword, departments, rng, execRoles, deptRoles, projectRoles, companySeedMaxTeamsPerDept)
		if err != nil {
			return err
		}

		cmd.Printf("Seeded company %q: %d users, %d workspaces, %d roles, %d policy groups\n",
			companySeedName, usersCreated, len(workspaces), len(execRoles)+len(deptRoles)+len(projectRoles)+len(specialRoles), policyCount)
		return nil
	},
}

var companySeedRootCmd = &cobra.Command{
	Use:   "seed",
	Short: "Generate prebuilt company data",
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

type departmentBlueprint struct {
	Name  string
	Slug  string
	Title string
}

type seededWorkspace struct {
	UUID       string
	Label      string
	Department string
	Kind       string
}

func init() {
	companySeedCmd.Flags().StringVar(&companySeedName, "company", "acme", "Company name used as a prefix")
	companySeedCmd.Flags().IntVar(&companySeedUsers, "users", 120, "Number of users to generate")
	companySeedCmd.Flags().IntVar(&companySeedDepartments, "departments", 8, "Number of departments to generate")
	companySeedCmd.Flags().IntVar(&companySeedProjectsPerDept, "projects-per-department", 2, "Number of project workspaces per department")
	companySeedCmd.Flags().IntVar(&companySeedMaxTeamsPerDept, "max-teams-per-dept", 3, "Maximum number of teams per department")
	companySeedCmd.Flags().StringVar(&companySeedPassword, "password", "ChangeMe123!", "Password applied to generated users")
	companySeedCmd.Flags().Int64Var(&companySeedSeed, "seed", 42, "Seed used to make the generated data deterministic")
	companySeedCmd.Flags().BoolVar(&companySeedDryRun, "dry-run", false, "Print the generated structure without persisting it")
	companySeedCmd.Flags().BoolVar(&companySeedIncludeSharedApps, "shared-apps", true, "Create a shared corporate workspace")

	companySeedRootCmd.AddCommand(companySeedCmd)
	AdminCmd.AddCommand(companySeedRootCmd)
}

func buildDepartmentBlueprint(count int) []departmentBlueprint {
	base := []string{
		"executive",
		"finance",
		"human-resources",
		"legal",
		"information-technology",
		"security",
		"engineering",
		"sales",
		"marketing",
		"operations",
		"support",
		"procurement",
		"customer-success",
		"product",
	}
	out := make([]departmentBlueprint, 0, count)
	for i := 0; i < count; i++ {
		name := ""
		if i < len(base) {
			name = base[i]
		} else {
			name = fmt.Sprintf("dept-%02d", i+1)
		}
		out = append(out, departmentBlueprint{
			Name:  name,
			Slug:  slug.Make(name),
			Title: titleCase(strings.ReplaceAll(name, "-", " ")),
		})
	}
	return out
}

func seedRoles(ctx context.Context, company string, depts []departmentBlueprint, projectsPerDept int) (map[string]*idm.Role, map[string]*idm.Role, map[string]*idm.Role, map[string]*idm.Role, error) {
	roleClient := idmc.RoleServiceClient(ctx)

	global := map[string]*idm.Role{}
	specialRoles := map[string]*idm.Role{}
	execRoles := map[string]*idm.Role{}
	deptRoles := map[string]*idm.Role{}
	projectRoles := map[string]*idm.Role{}

	globalSpecs := []struct {
		key   string
		label string
	}{
		{key: "employee", label: company + " Employees"},
		{key: "manager", label: company + " Managers"},
		{key: "executive", label: company + " Executives"},
		{key: "it-admin", label: company + " IT Administrators"},
		{key: "security", label: company + " Security Team"},
	}

	for _, spec := range globalSpecs {
		role, err := createOrUpdateRole(ctx, roleClient, roleSpecID(company, spec.key), spec.label)
		if err != nil {
			return nil, nil, nil, nil, err
		}
		specialRoles[spec.key] = role
		global[spec.key] = role
	}

	for _, dept := range depts {
		role, err := createOrUpdateRole(ctx, roleClient, roleSpecID(company, "dept-"+dept.Slug), company+" "+dept.Title+" Department")
		if err != nil {
			return nil, nil, nil, nil, err
		}
		deptRoles[dept.Slug] = role

		for i := 1; i <= projectsPerDept; i++ {
			key := fmt.Sprintf("proj-%s-%02d", dept.Slug, i)
			label := fmt.Sprintf("%s %s Project %02d", company, dept.Title, i)
			role, err := createOrUpdateRole(ctx, roleClient, roleSpecID(company, key), label)
			if err != nil {
				return nil, nil, nil, nil, err
			}
			projectRoles[key] = role
		}
	}

	execRoles["employee"] = global["employee"]
	execRoles["manager"] = global["manager"]
	execRoles["executive"] = global["executive"]
	execRoles["it-admin"] = global["it-admin"]
	execRoles["security"] = global["security"]

	return execRoles, deptRoles, projectRoles, specialRoles, nil
}

func seedPolicyGroups(ctx context.Context, company string, execRoles map[string]*idm.Role, specialRoles map[string]*idm.Role, deptRoles map[string]*idm.Role) (int, error) {
	policyClient := idm.NewPolicyEngineServiceClient(grpcclient.ResolveConn(ctx, common.ServicePolicyGRPC))
	created := 0

	groups := []*idm.PolicyGroup{
		{
			Uuid:          policySpecID(company, "employee-rest"),
			Name:          company + " Employee REST Access",
			Description:   "Standard employee access to the collaboration interface",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				{
					ID:          policySpecID(company, "employee-rest-read"),
					Description: "Employees can read the shared REST surface",
					Subjects:    []string{"role:" + execRoles["employee"].Uuid},
					Resources: []string{
						"rest:/frontend/<.*>",
						"rest:/user",
						"rest:/user/<.+>",
						"rest:/workspace",
						"rest:/share<.+>",
						"rest:/search/nodes",
					},
					Actions: []string{"GET", "POST"},
					Effect:  idm.PolicyEffect_allow,
				},
			},
		},
		{
			Uuid:          policySpecID(company, "manager-rest"),
			Name:          company + " Manager REST Access",
			Description:   "Broader access for line managers and department leads",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				{
					ID:          policySpecID(company, "manager-rest-write"),
					Description: "Managers can manage operational REST endpoints",
					Subjects:    []string{"role:" + execRoles["manager"].Uuid},
					Resources: []string{
						"rest:/user",
						"rest:/user/<.+>",
						"rest:/workspace",
						"rest:/share<.+>",
						"rest:/tree/create",
						"rest:/tree/delete",
						"rest:/tree/restore",
						"rest:/jobs/user<.+>",
					},
					Actions: []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
					Effect:  idm.PolicyEffect_allow,
				},
			},
		},
		{
			Uuid:          policySpecID(company, "executive-rest"),
			Name:          company + " Executive REST Access",
			Description:   "Executive access to cross-company information",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				{
					ID:          policySpecID(company, "executive-rest-full"),
					Description: "Executives can access the full REST surface",
					Subjects:    []string{"role:" + execRoles["executive"].Uuid},
					Resources:   []string{"rest:<.+>"},
					Actions:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
					Effect:      idm.PolicyEffect_allow,
				},
			},
		},
		{
			Uuid:          policySpecID(company, "it-admin-rest"),
			Name:          company + " IT Admin REST Access",
			Description:   "Administrative access for platform operators",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				{
					ID:          policySpecID(company, "it-admin-rest-full"),
					Description: "IT administrators can access all REST endpoints",
					Subjects:    []string{"role:" + execRoles["it-admin"].Uuid},
					Resources:   []string{"rest:<.+>"},
					Actions:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
					Effect:      idm.PolicyEffect_allow,
				},
			},
		},
		{
			Uuid:          policySpecID(company, "security-rest"),
			Name:          company + " Security REST Access",
			Description:   "Security team access for compliance and audit tasks",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				{
					ID:          policySpecID(company, "security-rest-audit"),
					Description: "Security can inspect operational endpoints",
					Subjects:    []string{"role:" + execRoles["security"].Uuid},
					Resources: []string{
						"rest:/activity<.+>",
						"rest:/changes<.+>",
						"rest:/jobs/user<.+>",
						"rest:/scheduler/hooks/<.+>",
						"rest:/user/<.+>",
					},
					Actions: []string{"GET"},
					Effect:  idm.PolicyEffect_allow,
				},
			},
		},
	}

	for _, dept := range deptRoles {
		groups = append(groups, &idm.PolicyGroup{
			Uuid:          policySpecID(company, "dept-rest-"+dept.Uuid),
			Name:          dept.Label + " REST Access",
			Description:   "Department access to its own collaboration surface",
			ResourceGroup: idm.PolicyResourceGroup_rest,
			Policies: []*idm.Policy{
				{
					ID:          policySpecID(company, "dept-rest-"+dept.Uuid+"-read"),
					Description: dept.Label + " can use collaboration endpoints",
					Subjects:    []string{"role:" + dept.Uuid},
					Resources: []string{
						"rest:/frontend/<.*>",
						"rest:/workspace",
						"rest:/share<.+>",
						"rest:/search/nodes",
					},
					Actions: []string{"GET", "POST"},
					Effect:  idm.PolicyEffect_allow,
				},
			},
		})
	}

	for _, group := range groups {
		if _, err := policyClient.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{PolicyGroup: group}); err != nil {
			return created, err
		}
		created++
	}

	return created, nil
}

func seedWorkspaces(ctx context.Context, company string, depts []departmentBlueprint, execRoles, deptRoles, projectRoles, specialRoles map[string]*idm.Role) (map[string]seededWorkspace, error) {
	wsClient := idmc.WorkspaceServiceClient(ctx)
	out := map[string]seededWorkspace{}

	if companySeedIncludeSharedApps {
		ws := &idm.Workspace{
			UUID:        workspaceSpecID(company, "shared-services"),
			Label:       company + " Shared Services",
			Description: "Cross-company shared services workspace",
			Scope:       idm.WorkspaceScope_ROOM,
			Slug:        slug.Make(company + "-shared-services"),
			Policies: workspacePolicies(
				company,
				workspaceSpecID(company, "shared-services"),
				[]string{execRoles["employee"].Uuid, execRoles["manager"].Uuid, execRoles["executive"].Uuid, execRoles["it-admin"].Uuid},
				[]string{execRoles["it-admin"].Uuid},
				[]string{specialRoles["security"].Uuid},
				false,
			),
		}
		if _, err := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: ws}); err != nil {
			return nil, err
		}
		out["shared-services"] = seededWorkspace{UUID: ws.UUID, Label: ws.Label, Kind: "shared"}
	}

	for _, dept := range depts {
		wsID := workspaceSpecID(company, "dept-"+dept.Slug)
		ws := &idm.Workspace{
			UUID:        wsID,
			Label:       company + " " + dept.Title,
			Description: dept.Title + " department workspace",
			Scope:       idm.WorkspaceScope_ROOM,
			Slug:        slug.Make(company + "-" + dept.Slug),
			Policies: workspacePolicies(
				company,
				wsID,
				[]string{deptRoles[dept.Slug].Uuid},
				[]string{execRoles["manager"].Uuid, execRoles["executive"].Uuid, execRoles["it-admin"].Uuid},
				[]string{specialRoles["security"].Uuid},
				false,
			),
		}
		if _, err := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: ws}); err != nil {
			return nil, err
		}
		out["dept:"+dept.Slug] = seededWorkspace{UUID: ws.UUID, Label: ws.Label, Department: dept.Slug, Kind: "department"}

		for i := 1; i <= companySeedProjectsPerDept; i++ {
			key := fmt.Sprintf("proj:%s:%02d", dept.Slug, i)
			wsID := workspaceSpecID(company, key)
			projectRole := projectRoles[projectRoleKey(dept.Slug, i)]
			ws := &idm.Workspace{
				UUID:        wsID,
				Label:       fmt.Sprintf("%s %s Project %02d", company, dept.Title, i),
				Description: fmt.Sprintf("%s project workspace %02d", dept.Title, i),
				Scope:       idm.WorkspaceScope_ROOM,
				Slug:        slug.Make(fmt.Sprintf("%s-%s-project-%02d", company, dept.Slug, i)),
				Policies: workspacePolicies(
					company,
					wsID,
					[]string{projectRole.Uuid, deptRoles[dept.Slug].Uuid},
					[]string{execRoles["manager"].Uuid, execRoles["executive"].Uuid, execRoles["it-admin"].Uuid},
					[]string{specialRoles["security"].Uuid},
					true,
				),
			}
			if _, err := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: ws}); err != nil {
				return nil, err
			}
			out[key] = seededWorkspace{UUID: ws.UUID, Label: ws.Label, Department: dept.Slug, Kind: "project"}
		}
	}

	return out, nil
}

func seedAcls(ctx context.Context, company string, workspaces map[string]seededWorkspace, execRoles, deptRoles, projectRoles, specialRoles map[string]*idm.Role) error {
	aclClient := idmc.ACLServiceClient(ctx)

	for key, ws := range workspaces {
		var roles []string
		switch ws.Kind {
		case "shared":
			roles = []string{
				execRoles["employee"].Uuid,
				execRoles["manager"].Uuid,
				execRoles["executive"].Uuid,
				execRoles["it-admin"].Uuid,
			}
		case "department":
			roles = []string{
				deptRoles[ws.Department].Uuid,
				execRoles["manager"].Uuid,
				execRoles["executive"].Uuid,
				execRoles["it-admin"].Uuid,
			}
		case "project":
			parts := strings.Split(key, ":")
			if len(parts) < 3 {
				continue
			}
			deptSlug := parts[1]
			projectIdx := 1
			fmt.Sscanf(parts[2], "%d", &projectIdx)
			projectRole := projectRoles[projectRoleKey(deptSlug, projectIdx)]
			roles = []string{
				projectRole.Uuid,
				deptRoles[deptSlug].Uuid,
				execRoles["manager"].Uuid,
				execRoles["executive"].Uuid,
				execRoles["it-admin"].Uuid,
			}
		}

		for _, roleID := range roles {
			for _, action := range []*idm.ACLAction{permissions.AclRead, permissions.AclWrite} {
				if ws.Kind == "shared" && roleID == execRoles["employee"].Uuid && action.Name == permissions.AclWrite.Name {
					continue
				}
				acl := &idm.ACL{
					WorkspaceID: ws.UUID,
					NodeID:      ws.UUID + "-ROOT",
					RoleID:      roleID,
					Action:      action,
				}
				if _, err := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl, IgnoreDuplicates: true}); err != nil {
					return err
				}
			}
		}

		if ws.Kind == "department" {
			acl := &idm.ACL{
				WorkspaceID: ws.UUID,
				NodeID:      ws.UUID + "-ROOT",
				RoleID:      specialRoles["security"].Uuid,
				Action:      permissions.AclRead,
			}
			if _, err := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl, IgnoreDuplicates: true}); err != nil {
				return err
			}
		}
	}

	return nil
}

func seedUsers(ctx context.Context, company string, totalUsers int, password string, depts []departmentBlueprint, rng *rand.Rand, execRoles, deptRoles, projectRoles map[string]*idm.Role, maxTeamsPerDept int) (int, error) {
	userClient := idmc.UserServiceClient(ctx)

	execTitles := []struct {
		login string
		name  string
		role  string
	}{
		{login: "ceo", name: "Chief Executive Officer", role: execRoles["executive"].Uuid},
		{login: "cfo", name: "Chief Financial Officer", role: execRoles["executive"].Uuid},
		{login: "cio", name: "Chief Information Officer", role: execRoles["it-admin"].Uuid},
		{login: "ciso", name: "Chief Information Security Officer", role: execRoles["security"].Uuid},
		{login: "coo", name: "Chief Operating Officer", role: execRoles["executive"].Uuid},
	}

	created := 0
	userIndex := 0
	allocate := func(login, displayName, groupPath string, profile string, roleIDs []string) error {
		roles := make([]*idm.Role, 0, len(roleIDs)+1)
		for _, roleID := range roleIDs {
			roles = append(roles, &idm.Role{Uuid: roleID})
		}
		if profile == "" {
			profile = common.PydioProfileStandard
		}
		user := &idm.User{
			Login:     login,
			GroupPath: groupPath,
			Password:  password,
			Attributes: map[string]string{
				idm.UserAttrDisplayName: displayName,
				idm.UserAttrEmail:       strings.ToLower(login + "@" + slug.Make(company) + ".example"),
				idm.UserAttrProfile:     profile,
			},
			Roles: roles,
		}
		if _, err := userClient.CreateUser(ctx, &idm.CreateUserRequest{User: user}); err != nil {
			return err
		}
		created++
		return nil
	}

	for _, exec := range execTitles {
		if created >= totalUsers {
			return created, nil
		}
		if err := allocate(exec.login, exec.name, "/"+slug.Make(company)+"/executive", common.PydioProfileAdmin, []string{execRoles["employee"].Uuid, exec.role}); err != nil {
			return created, err
		}
	}

	remaining := totalUsers - created
	if remaining <= 0 {
		return created, nil
	}

	firstNames := []string{"alex", "sam", "taylor", "jordan", "morgan", "casey", "riley", "jamie", "drew", "chris", "pat", "cameron", "harper", "quinn", "avery", "reese"}
	lastNames := []string{"anderson", "brown", "chen", "diaz", "evans", "garcia", "hill", "jones", "khan", "lopez", "miller", "nguyen", "patel", "roberts", "smith", "taylor", "wright"}
	teamCount := maxTeamsPerDept
	if teamCount > 5 {
		teamCount = 5
	}

	for _, dept := range depts {
		if created >= totalUsers {
			break
		}

		leadLogin := fmt.Sprintf("%s.lead", dept.Slug)
		leadName := fmt.Sprintf("%s Department Lead", dept.Title)
		leadGroup := fmt.Sprintf("/%s/%s/leadership", slug.Make(company), dept.Slug)
		if err := allocate(leadLogin, leadName, leadGroup, common.PydioProfileStandard, []string{execRoles["employee"].Uuid, execRoles["manager"].Uuid, deptRoles[dept.Slug].Uuid}); err != nil {
			return created, err
		}

		if created >= totalUsers {
			break
		}

		managerLogin := fmt.Sprintf("%s.manager", dept.Slug)
		managerName := fmt.Sprintf("%s Operations Manager", dept.Title)
		managerGroup := fmt.Sprintf("/%s/%s/management", slug.Make(company), dept.Slug)
		if err := allocate(managerLogin, managerName, managerGroup, common.PydioProfileStandard, []string{execRoles["employee"].Uuid, execRoles["manager"].Uuid, deptRoles[dept.Slug].Uuid}); err != nil {
			return created, err
		}

		teamSize := 1 + rng.Intn(teamCount)
		for t := 0; t < teamSize && created < totalUsers; t++ {
			teamSlug := fmt.Sprintf("%s-team-%02d", dept.Slug, t+1)
			memberCount := 1 + rng.Intn(4)
			for m := 0; m < memberCount && created < totalUsers; m++ {
				first := firstNames[userIndex%len(firstNames)]
				last := lastNames[(userIndex/len(firstNames))%len(lastNames)]
				userIndex++
				login := fmt.Sprintf("%s.%s%02d", first, last, userIndex)
				name := titleCase(first) + " " + titleCase(last)
				groupPath := fmt.Sprintf("/%s/%s/%s", slug.Make(company), dept.Slug, teamSlug)
				projectRoleID := projectRoleForDept(projectRoles, dept.Slug, 1+(m%max(1, companySeedProjectsPerDept)), deptRoles[dept.Slug].Uuid)
				if err := allocate(login, name, groupPath, common.PydioProfileStandard, []string{execRoles["employee"].Uuid, deptRoles[dept.Slug].Uuid, projectRoleID}); err != nil {
					return created, err
				}
			}
		}
	}

	return created, nil
}

func createOrUpdateRole(ctx context.Context, client idm.RoleServiceClient, uuid, label string) (*idm.Role, error) {
	resp, err := client.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{Uuid: uuid, Label: label}})
	if err != nil {
		return nil, err
	}
	return resp.GetRole(), nil
}

func roleSpecID(company, suffix string) string {
	return slug.Make(company) + "-" + suffix
}

func policySpecID(company, suffix string) string {
	return slug.Make(company) + "-policy-" + suffix
}

func workspaceSpecID(company, suffix string) string {
	return slug.Make(company) + "-ws-" + suffix
}

func workspacePolicies(company, resource string, writeRoles []string, adminRoles []string, readRoles []string, denyShared bool) []*pbservice.ResourcePolicy {
	out := []*pbservice.ResourcePolicy{
		{
			Resource: resource,
			Subject:  permissions.PolicySubjectProfilePrefix + common.PydioProfileAdmin,
			Action:   pbservice.ResourcePolicyAction_WRITE,
			Effect:   pbservice.ResourcePolicy_allow,
		},
	}
	for _, roleID := range writeRoles {
		out = append(out, &pbservice.ResourcePolicy{
			Resource: resource,
			Subject:  permissions.PolicySubjectRolePrefix + roleID,
			Action:   pbservice.ResourcePolicyAction_WRITE,
			Effect:   pbservice.ResourcePolicy_allow,
		})
		out = append(out, &pbservice.ResourcePolicy{
			Resource: resource,
			Subject:  permissions.PolicySubjectRolePrefix + roleID,
			Action:   pbservice.ResourcePolicyAction_READ,
			Effect:   pbservice.ResourcePolicy_allow,
		})
	}
	for _, roleID := range adminRoles {
		out = append(out, &pbservice.ResourcePolicy{
			Resource: resource,
			Subject:  permissions.PolicySubjectRolePrefix + roleID,
			Action:   pbservice.ResourcePolicyAction_WRITE,
			Effect:   pbservice.ResourcePolicy_allow,
		})
		out = append(out, &pbservice.ResourcePolicy{
			Resource: resource,
			Subject:  permissions.PolicySubjectRolePrefix + roleID,
			Action:   pbservice.ResourcePolicyAction_READ,
			Effect:   pbservice.ResourcePolicy_allow,
		})
	}
	for _, roleID := range readRoles {
		out = append(out, &pbservice.ResourcePolicy{
			Resource: resource,
			Subject:  permissions.PolicySubjectRolePrefix + roleID,
			Action:   pbservice.ResourcePolicyAction_READ,
			Effect:   pbservice.ResourcePolicy_allow,
		})
	}
	return out
}

func projectRoleKey(deptSlug string, idx int) string {
	return fmt.Sprintf("proj-%s-%02d", deptSlug, idx)
}

func projectRoleForDept(projectRoles map[string]*idm.Role, deptSlug string, idx int, fallback string) string {
	role, ok := projectRoles[projectRoleKey(deptSlug, idx)]
	if !ok || role == nil {
		return fallback
	}
	return role.Uuid
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func titleCase(in string) string {
	if in == "" {
		return ""
	}
	parts := strings.Fields(in)
	for i, p := range parts {
		if len(p) == 1 {
			parts[i] = strings.ToUpper(p)
			continue
		}
		parts[i] = strings.ToUpper(p[:1]) + strings.ToLower(p[1:])
	}
	return strings.Join(parts, " ")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

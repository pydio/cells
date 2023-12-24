package main

import (
	user_model "github.com/pydio/cells/v4/idm/user/model"
	"gorm.io/gen"
)

func main() {
	g := gen.NewGenerator(gen.Config{
		OutPath: ".",
		OutFile: "model-gen.go",
		// ... some config
	})

	g.ApplyBasic(user_model.User{}, user_model.UserRole{}, user_model.UserAttribute{})

	// Apply the interface to existing `User` and generated `Employee`
	g.ApplyInterface(func(user_model.Querier) {}, user_model.User{}, user_model.UserRole{}, user_model.UserAttribute{})

	g.Execute()
}

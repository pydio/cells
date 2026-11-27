// Package rule implements a GoConvey test analyzer.
package rule

import (
	"go/ast"
	"go/types"
	"strings"
	"unicode"
	"unicode/utf8"

	"golang.org/x/tools/go/analysis"
)

const conveyPackage = "github.com/smartystreets/goconvey/convey"

// Analyzer reports Go tests that do not call GoConvey.
var Analyzer = &analysis.Analyzer{
	Name: "conveylint",
	Doc:  "require Go test functions to call GoConvey",
	Run:  run,
}

func run(pass *analysis.Pass) (any, error) {
	for _, file := range pass.Files {
		if !strings.HasSuffix(pass.Fset.Position(file.Pos()).Filename, "_test.go") {
			continue
		}
		for _, decl := range file.Decls {
			fn, ok := decl.(*ast.FuncDecl)
			if !ok || !isTest(pass, fn) || fn.Body == nil {
				continue
			}
			found := false
			ast.Inspect(fn.Body, func(node ast.Node) bool {
				call, ok := node.(*ast.CallExpr)
				if !ok {
					return true
				}
				var ident *ast.Ident
				switch fun := call.Fun.(type) {
				case *ast.Ident:
					ident = fun
				case *ast.SelectorExpr:
					ident = fun.Sel
				}
				if ident != nil {
					obj, ok := pass.TypesInfo.Uses[ident].(*types.Func)
					if ok && obj.Name() == "Convey" && obj.Pkg() != nil && obj.Pkg().Path() == conveyPackage {
						found = true
					}
				}
				return !found
			})
			if !found {
				pass.Reportf(fn.Name.Pos(), "test must call GoConvey")
			}
		}
	}
	return nil, nil
}

func isTest(pass *analysis.Pass, fn *ast.FuncDecl) bool {
	name := fn.Name.Name
	if fn.Recv != nil || !strings.HasPrefix(name, "Test") || len(name) == len("Test") {
		return false
	}
	r, _ := utf8.DecodeRuneInString(name[len("Test"):])
	if unicode.IsLower(r) {
		return false
	}
	obj, ok := pass.TypesInfo.Defs[fn.Name].(*types.Func)
	if !ok {
		return false
	}
	sig := obj.Type().(*types.Signature)
	if sig.Params().Len() != 1 || sig.Results().Len() != 0 {
		return false
	}
	ptr, ok := sig.Params().At(0).Type().(*types.Pointer)
	if !ok {
		return false
	}
	named, ok := ptr.Elem().(*types.Named)
	return ok && named.Obj().Pkg() != nil && named.Obj().Pkg().Path() == "testing" && named.Obj().Name() == "T"
}

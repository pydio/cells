package ast

import (
	"reflect"
)

// Expr provides all of interfaces for expression.
type Expr interface {
	Pos
}

// ExprImpl provide commonly implementations for Expr.
type ExprImpl struct {
	PosImpl // PosImpl provide Pos() function.
}

// OpExpr provide operator expression.
type OpExpr struct {
	ExprImpl
	Op Operator
}

// LiteralExpr provide literal expression.
type LiteralExpr struct {
	ExprImpl
	Literal reflect.Value
}

// ArrayExpr provide Array expression.
type ArrayExpr struct {
	ExprImpl
	Exprs    []Expr
	TypeData *TypeStruct
}

// MapExpr provide Map expression.
type MapExpr struct {
	ExprImpl
	Keys     []Expr
	Values   []Expr
	TypeData *TypeStruct
}

// IdentExpr provide identity expression.
type IdentExpr struct {
	ExprImpl
	Lit string
}

// UnaryExpr provide unary minus expression. ex: -1, ^1, ~1.
type UnaryExpr struct {
	ExprImpl
	Operator string
	Expr     Expr
}

// AddrExpr provide referencing address expression.
type AddrExpr struct {
	ExprImpl
	Expr Expr
}

// DerefExpr provide dereferencing address expression.
type DerefExpr struct {
	ExprImpl
	Expr Expr
}

// ParenExpr provide parent block expression.
type ParenExpr struct {
	ExprImpl
	SubExpr Expr
}

// NilCoalescingOpExpr provide if invalid operator expression.
type NilCoalescingOpExpr struct {
	ExprImpl
	LHS Expr
	RHS Expr
}

// TernaryOpExpr provide ternary operator expression.
type TernaryOpExpr struct {
	ExprImpl
	Expr Expr
	LHS  Expr
	RHS  Expr
}

// CallExpr provide calling expression.
type CallExpr struct {
	ExprImpl
	Func     reflect.Value
	Name     string
	SubExprs []Expr
	VarArg   bool
	Go       bool
}

// AnonCallExpr provide anonymous calling expression. ex: func(){}().
type AnonCallExpr struct {
	ExprImpl
	Expr     Expr
	SubExprs []Expr
	VarArg   bool
	Go       bool
}

// MemberExpr provide expression to refer member.
type MemberExpr struct {
	ExprImpl
	Expr Expr
	Name string
}

// ItemExpr provide expression to refer Map/Array item.
type ItemExpr struct {
	ExprImpl
	Item  Expr
	Index Expr
}

// SliceExpr provide expression to refer slice of Array.
type SliceExpr struct {
	ExprImpl
	Item  Expr
	Begin Expr
	End   Expr
	Cap   Expr
}

// FuncExpr provide function expression.
type FuncExpr struct {
	ExprImpl
	Name   string
	Stmt   Stmt
	Params []string
	VarArg bool
}

// LetsExpr provide multiple expression of let.
type LetsExpr struct {
	ExprImpl
	LHSS []Expr
	RHSS []Expr
}

// ChanExpr provide chan expression.
type ChanExpr struct {
	ExprImpl
	LHS Expr
	RHS Expr
}

// ImportExpr provide expression to import packages.
type ImportExpr struct {
	ExprImpl
	Name Expr
}

// MakeExpr provide expression to make instance.
type MakeExpr struct {
	ExprImpl
	TypeData *TypeStruct
	LenExpr  Expr
	CapExpr  Expr
}

// MakeTypeExpr provide expression to make type.
type MakeTypeExpr struct {
	ExprImpl
	Name string
	Type Expr
}

// LenExpr provide expression to get length of array, map, etc.
type LenExpr struct {
	ExprImpl
	Expr Expr
}

// IncludeExpr provide in expression
type IncludeExpr struct {
	ExprImpl
	ItemExpr Expr
	ListExpr Expr
}

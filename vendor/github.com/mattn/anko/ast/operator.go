package ast

// Operator provides interfaces for operators.
type Operator interface {
	Pos
}

// OperatorImpl provides common implementations for Operator.
type OperatorImpl struct {
	PosImpl // PosImpl provide Pos() function.
}

// BinaryOperator provides binary operation.
type BinaryOperator struct {
	OperatorImpl
	LHS      Expr
	Operator string
	RHS      Expr
}

// ComparisonOperator provides comparison operation.
type ComparisonOperator struct {
	OperatorImpl
	LHS      Expr
	Operator string
	RHS      Expr
}

// AddOperator provides add operation.
type AddOperator struct {
	OperatorImpl
	LHS      Expr
	Operator string
	RHS      Expr
}

// MultiplyOperator provides multiply operation.
type MultiplyOperator struct {
	OperatorImpl
	LHS      Expr
	Operator string
	RHS      Expr
}

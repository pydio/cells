%{
package parser

import (
	"github.com/mattn/anko/ast"
)

%}

%type<compstmt> compstmt
%type<stmts> stmts
%type<stmt> stmt
%type<stmt_var_or_lets> stmt_var_or_lets
%type<stmt_var> stmt_var
%type<stmt_lets> stmt_lets
%type<stmt_if> stmt_if
%type<stmt_for> stmt_for
%type<stmt_switch> stmt_switch
%type<stmt_switch_cases> stmt_switch_cases
%type<stmt_switch_case> stmt_switch_case
%type<stmt_switch_default> stmt_switch_default

%type<exprs> exprs
%type<expr> expr
%type<expr_idents> expr_idents
%type<type_data> type_data
%type<slice_count> slice_count
%type<expr_member_or_ident> expr_member_or_ident
%type<expr_member> expr_member
%type<expr_ident> expr_ident
%type<expr_literals> expr_literals
%type<expr_map> expr_map
%type<expr_slice> expr_slice
%type<expr> expr_unary
%type<expr> expr_binary
%type<expr> expr_lets

%type<expr> op_binary
%type<expr> op_comparison
%type<expr> op_add
%type<expr> op_multiply

%union{
	tok                    ast.Token

	compstmt               ast.Stmt
	stmts                  ast.Stmt
	stmt                   ast.Stmt
	stmt_var_or_lets       ast.Stmt
	stmt_var               ast.Stmt
	stmt_lets              ast.Stmt
	stmt_if                ast.Stmt
	stmt_for               ast.Stmt
	stmt_switch            ast.Stmt
	stmt_switch_cases      ast.Stmt
	stmt_switch_case       ast.Stmt
	stmt_switch_default    ast.Stmt

	exprs                  []ast.Expr
	expr                   ast.Expr
	expr_idents            []string
	type_data              *ast.TypeStruct
	slice_count            int
	expr_member_or_ident   ast.Expr
	expr_member            *ast.MemberExpr
	expr_ident             *ast.IdentExpr
	expr_literals          ast.Expr
	expr_map               *ast.MapExpr
	expr_slice             ast.Expr
	expr_unary             ast.Expr
	expr_binary            ast.Expr
	expr_lets              ast.Expr

	op_binary              ast.Operator
	op_comparison          ast.Operator
	op_add                 ast.Operator
	op_multiply            ast.Operator
}

%token<tok> IDENT NUMBER STRING ARRAY VARARG FUNC RETURN VAR THROW IF ELSE FOR IN EQEQ NEQ GE LE OROR ANDAND NEW TRUE FALSE NIL NILCOALESCE MODULE TRY CATCH FINALLY PLUSEQ MINUSEQ MULEQ DIVEQ ANDEQ OREQ BREAK CONTINUE PLUSPLUS MINUSMINUS SHIFTLEFT SHIFTRIGHT SWITCH CASE DEFAULT GO CHAN MAKE OPCHAN TYPE LEN DELETE CLOSE MAP IMPORT

/* lowest precedence */
%left ,
%right '=' PLUSEQ MINUSEQ MULEQ DIVEQ ANDEQ OREQ
%right ':'
%right OPCHAN
%right '?' NILCOALESCE
%left OROR
%left ANDAND
%left EQEQ NEQ '<' LE '>' GE
%left '+' '-' '|' '^'
%left '*' '/' '%' SHIFTLEFT SHIFTRIGHT '&'
%right IN
%right PLUSPLUS MINUSMINUS
%right UNARY
/* highest precedence */
/* https://golang.org/ref/spec#Expression */


%%

compstmt :
	opt_term
	{
		$$ = nil
	}
	| stmts opt_term
	{
		$$ = $1
	}

stmts :
	opt_term stmt
	{
		if $2 != nil {
			$$ = &ast.StmtsStmt{Stmts: []ast.Stmt{$2}}
		}
		if l, ok := yylex.(*Lexer); ok {
			l.stmt = $$
		}
	}
	| stmts term stmt
	{
		if $3 != nil {
			if $1 == nil {
				$$ = &ast.StmtsStmt{Stmts: []ast.Stmt{$3}}
			} else {
				stmts := $1.(*ast.StmtsStmt)
				stmts.Stmts = append(stmts.Stmts, $3)
			}
			if l, ok := yylex.(*Lexer); ok {
				l.stmt = $$
			}
		}
	}

stmt :
	/* nothing */
	{
		$$ = nil
	}
	| stmt_var_or_lets
	{
		$$ = $1
	}
	| BREAK
	{
		$$ = &ast.BreakStmt{}
		$$.SetPosition($1.Position())
	}
	| CONTINUE
	{
		$$ = &ast.ContinueStmt{}
		$$.SetPosition($1.Position())
	}
	| RETURN exprs
	{
		$$ = &ast.ReturnStmt{Exprs: $2}
		$$.SetPosition($1.Position())
	}
	| THROW expr
	{
		$$ = &ast.ThrowStmt{Expr: $2}
		$$.SetPosition($1.Position())
	}
	| MODULE IDENT '{' compstmt '}'
	{
		$$ = &ast.ModuleStmt{Name: $2.Lit, Stmt: $4}
		$$.SetPosition($1.Position())
	}
	| TRY '{' compstmt '}' CATCH IDENT '{' compstmt '}' FINALLY '{' compstmt '}'
	{
		$$ = &ast.TryStmt{Try: $3, Var: $6.Lit, Catch: $8, Finally: $12}
		$$.SetPosition($1.Position())
	}
	| TRY '{' compstmt '}' CATCH '{' compstmt '}' FINALLY '{' compstmt '}'
	{
		$$ = &ast.TryStmt{Try: $3, Catch: $7, Finally: $11}
		$$.SetPosition($1.Position())
	}
	| TRY '{' compstmt '}' CATCH IDENT '{' compstmt '}'
	{
		$$ = &ast.TryStmt{Try: $3, Var: $6.Lit, Catch: $8}
		$$.SetPosition($1.Position())
	}
	| TRY '{' compstmt '}' CATCH '{' compstmt '}'
	{
		$$ = &ast.TryStmt{Try: $3, Catch: $7}
		$$.SetPosition($1.Position())
	}
	| GO IDENT '(' exprs VARARG ')'
	{
		$$ = &ast.GoroutineStmt{Expr: &ast.CallExpr{Name: $2.Lit, SubExprs: $4, VarArg: true, Go: true}}
		$$.SetPosition($2.Position())
	}
	| GO IDENT '(' exprs ')'
	{
		$$ = &ast.GoroutineStmt{Expr: &ast.CallExpr{Name: $2.Lit, SubExprs: $4, Go: true}}
		$$.SetPosition($2.Position())
	}
	| GO expr '(' exprs VARARG ')'
	{
		$$ = &ast.GoroutineStmt{Expr: &ast.AnonCallExpr{Expr: $2, SubExprs: $4, VarArg: true, Go: true}}
		$$.SetPosition($2.Position())
	}
	| GO expr '(' exprs ')'
	{
		$$ = &ast.GoroutineStmt{Expr: &ast.AnonCallExpr{Expr: $2, SubExprs: $4, Go: true}}
		$$.SetPosition($1.Position())
	}
	| DELETE '(' expr ')'
	{
		$$ = &ast.DeleteStmt{Item: $3}
		$$.SetPosition($1.Position())
	}
	| DELETE '(' expr ',' expr ')'
	{
		$$ = &ast.DeleteStmt{Item: $3, Key: $5}
		$$.SetPosition($1.Position())
	}
	| CLOSE '(' expr ')'
	{
		$$ = &ast.CloseStmt{Expr: $3}
		$$.SetPosition($1.Position())
	}
	| stmt_if
	{
		$$ = $1
	}
	| stmt_for
	{
		$$ = $1
	}
	| stmt_switch
	{
		$$ = $1
	}
	| expr
	{
		$$ = &ast.ExprStmt{Expr: $1}
		$$.SetPosition($1.Position())
	}

stmt_var_or_lets :
	stmt_var
	{
		$$ = $1
	}
	| stmt_lets
	{
		$$ = $1
	}

stmt_var :
	VAR expr_idents '=' exprs
	{
		$$ = &ast.VarStmt{Names: $2, Exprs: $4}
		$$.SetPosition($1.Position())
	}

stmt_lets :
	expr '=' expr
	{
		$$ = &ast.LetsStmt{LHSS: []ast.Expr{$1}, RHSS: []ast.Expr{$3}}
		$$.SetPosition($1.Position())
	}
	| exprs '=' exprs
	{
		if len($1) == 2 && len($3) == 1 {
			if _, ok := $3[0].(*ast.ItemExpr); ok {
				$$ = &ast.LetMapItemStmt{LHSS: $1, RHS: $3[0]}
			} else {
				$$ = &ast.LetsStmt{LHSS: $1, RHSS: $3}
			}
		} else {
			$$ = &ast.LetsStmt{LHSS: $1, RHSS: $3}
		}
	}

stmt_if :
	IF expr '{' compstmt '}'
	{
		$$ = &ast.IfStmt{If: $2, Then: $4, Else: nil}
		$$.SetPosition($1.Position())
	}
	| stmt_if ELSE IF expr '{' compstmt '}'
	{
		ifStmt := $1.(*ast.IfStmt)
		ifStmt.ElseIf = append(ifStmt.ElseIf, &ast.IfStmt{If: $4, Then: $6})
	}
	| stmt_if ELSE '{' compstmt '}'
	{
		ifStmt := $1.(*ast.IfStmt)
		if ifStmt.Else != nil {
			yylex.Error("multiple else statement")
		}
		ifStmt.Else = $4
	}

stmt_for :
	FOR '{' compstmt '}'
	{
		$$ = &ast.LoopStmt{Stmt: $3}
		$$.SetPosition($1.Position())
	}
	| FOR expr_idents IN expr '{' compstmt '}'
	{
		if len($2) < 1 {
			yylex.Error("missing identifier")
		} else if len($2) > 2 {
			yylex.Error("too many identifiers")
		} else {
			$$ = &ast.ForStmt{Vars: $2, Value: $4, Stmt: $6}
			$$.SetPosition($1.Position())
		}
	}
	| FOR expr '{' compstmt '}'
	{
		$$ = &ast.LoopStmt{Expr: $2, Stmt: $4}
		$$.SetPosition($1.Position())
	}
	| FOR ';' ';' '{' compstmt '}'
	{
		$$ = &ast.CForStmt{Stmt: $5}
		$$.SetPosition($1.Position())
	}
	| FOR ';' ';' expr '{' compstmt '}'
	{
		$$ = &ast.CForStmt{Expr3: $4, Stmt: $6}
		$$.SetPosition($1.Position())
	}
	| FOR ';' expr ';' '{' compstmt '}'
	{
		$$ = &ast.CForStmt{Expr2: $3, Stmt: $6}
		$$.SetPosition($1.Position())
	}
	| FOR ';' expr ';' expr '{' compstmt '}'
	{
		$$ = &ast.CForStmt{Expr2: $3, Expr3: $5, Stmt: $7}
		$$.SetPosition($1.Position())
	}
	| FOR stmt_var_or_lets ';' ';' '{' compstmt '}'
	{
		$$ = &ast.CForStmt{Stmt1: $2, Stmt: $6}
		$$.SetPosition($1.Position())
	}
	| FOR stmt_var_or_lets ';' ';' expr '{' compstmt '}'
	{
		$$ = &ast.CForStmt{Stmt1: $2, Expr3: $5, Stmt: $7}
		$$.SetPosition($1.Position())
	}
	| FOR stmt_var_or_lets ';' expr ';' '{' compstmt '}'
	{
		$$ = &ast.CForStmt{Stmt1: $2, Expr2: $4, Stmt: $7}
		$$.SetPosition($1.Position())
	}
	| FOR stmt_var_or_lets ';' expr ';' expr '{' compstmt '}'
	{
		$$ = &ast.CForStmt{Stmt1: $2, Expr2: $4, Expr3: $6, Stmt: $8}
		$$.SetPosition($1.Position())
	}

stmt_switch :
	SWITCH expr '{' opt_newlines stmt_switch_cases opt_newlines '}'
	{
		switchStmt := $5.(*ast.SwitchStmt)
		switchStmt.Expr = $2
		$$ = switchStmt
		$$.SetPosition($1.Position())
	}

stmt_switch_cases :
	/* nothing */
	{
		$$ = &ast.SwitchStmt{}
	}
	| stmt_switch_default
	{
		$$ = &ast.SwitchStmt{Default: $1}
	}
	| stmt_switch_case
	{
		$$ = &ast.SwitchStmt{Cases: []ast.Stmt{$1}}
	}
	| stmt_switch_cases stmt_switch_case
	{
		switchStmt := $1.(*ast.SwitchStmt)
		switchStmt.Cases = append(switchStmt.Cases, $2)
		$$ = switchStmt
	}
	| stmt_switch_cases stmt_switch_default
	{
		switchStmt := $1.(*ast.SwitchStmt)
		if switchStmt.Default != nil {
			yylex.Error("multiple default statement")
		}
		switchStmt.Default = $2
	}

stmt_switch_case :
	CASE expr ':' compstmt
	{
		$$ = &ast.SwitchCaseStmt{Exprs: []ast.Expr{$2}, Stmt: $4}
		$$.SetPosition($1.Position())
	}
	| CASE exprs ':' compstmt
	{
		$$ = &ast.SwitchCaseStmt{Exprs: $2, Stmt: $4}
		$$.SetPosition($1.Position())
	}

stmt_switch_default :
	DEFAULT ':' compstmt
	{
		$$ = $3
	}


exprs :
	/* nothing */
	{
		$$ = nil
	}
	| expr 
	{
		$$ = []ast.Expr{$1}
	}
	| exprs ',' opt_newlines expr
	{
		if len($1) == 0 {
			yylex.Error("syntax error: unexpected ','")
		}
		$$ = append($1, $4)
	}
	| exprs ',' opt_newlines expr_ident
	{
		if len($1) == 0 {
			yylex.Error("syntax error: unexpected ','")
		}
		$$ = append($1, $4)
	}

expr :
	expr_member_or_ident
	{
		$$ = $1
	}
	| expr_literals
	{
		$$ = $1
	}
	| expr '?' expr ':' expr
	{
		$$ = &ast.TernaryOpExpr{Expr: $1, LHS: $3, RHS: $5}
		$$.SetPosition($1.Position())
	}
	| expr NILCOALESCE expr
	{
		$$ = &ast.NilCoalescingOpExpr{LHS: $1, RHS: $3}
		$$.SetPosition($1.Position())
	}
	| FUNC '(' expr_idents ')' '{' compstmt '}'
	{
		$$ = &ast.FuncExpr{Params: $3, Stmt: $6}
		$$.SetPosition($1.Position())
	}
	| FUNC '(' expr_idents VARARG ')' '{' compstmt '}'
	{
		$$ = &ast.FuncExpr{Params: $3, Stmt: $7, VarArg: true}
		$$.SetPosition($1.Position())
	}
	| FUNC IDENT '(' expr_idents ')' '{' compstmt '}'
	{
		$$ = &ast.FuncExpr{Name: $2.Lit, Params: $4, Stmt: $7}
		$$.SetPosition($1.Position())
	}
	| FUNC IDENT '(' expr_idents VARARG ')' '{' compstmt '}'
	{
		$$ = &ast.FuncExpr{Name: $2.Lit, Params: $4, Stmt: $8, VarArg: true}
		$$.SetPosition($1.Position())
	}
	| '[' ']'
	{
		$$ = &ast.ArrayExpr{}
		if l, ok := yylex.(*Lexer); ok { $$.SetPosition(l.pos) }
	}
	| '[' opt_newlines exprs opt_comma_newlines ']'
	{
		$$ = &ast.ArrayExpr{Exprs: $3}
		if l, ok := yylex.(*Lexer); ok { $$.SetPosition(l.pos) }
	}
	| slice_count type_data '{' opt_newlines exprs opt_comma_newlines '}'
	{
		$$ = &ast.ArrayExpr{Exprs: $5, TypeData: &ast.TypeStruct{Kind: ast.TypeSlice, SubType: $2, Dimensions: $1}}
		if l, ok := yylex.(*Lexer); ok { $$.SetPosition(l.pos) }
	}
	| '(' expr ')'
	{
		$$ = &ast.ParenExpr{SubExpr: $2}
		if l, ok := yylex.(*Lexer); ok { $$.SetPosition(l.pos) }
	}
	| IDENT '(' exprs VARARG ')'
	{
		$$ = &ast.CallExpr{Name: $1.Lit, SubExprs: $3, VarArg: true}
		$$.SetPosition($1.Position())
	}
	| IDENT '(' exprs ')'
	{
		$$ = &ast.CallExpr{Name: $1.Lit, SubExprs: $3}
		$$.SetPosition($1.Position())
	}
	| expr '(' exprs VARARG ')'
	{
		$$ = &ast.AnonCallExpr{Expr: $1, SubExprs: $3, VarArg: true}
		$$.SetPosition($1.Position())
	}
	| expr '(' exprs ')'
	{
		$$ = &ast.AnonCallExpr{Expr: $1, SubExprs: $3}
		$$.SetPosition($1.Position())
	}
	| expr_ident '[' expr ']'
	{
		$$ = &ast.ItemExpr{Item: $1, Index: $3}
		$$.SetPosition($1.Position())
	}
	| expr '[' expr ']'
	{
		$$ = &ast.ItemExpr{Item: $1, Index: $3}
		$$.SetPosition($1.Position())
	}
	| LEN '(' expr ')'
	{
		$$ = &ast.LenExpr{Expr: $3}
		$$.SetPosition($1.Position())
	}
	| IMPORT '(' expr ')'
	{
		$$ = &ast.ImportExpr{Name: $3}
		$$.SetPosition($1.Position())
	}
	| NEW '(' type_data ')'
	{
		if $3.Kind == ast.TypeDefault {
			$3.Kind = ast.TypePtr
			$$ = &ast.MakeExpr{TypeData: $3}
		} else {
			$$ = &ast.MakeExpr{TypeData: &ast.TypeStruct{Kind: ast.TypePtr, SubType: $3}}
		}
		$$.SetPosition($1.Position())
	}
	| MAKE '(' type_data ')'
	{
		$$ = &ast.MakeExpr{TypeData: $3}
		$$.SetPosition($1.Position())
	}
	| MAKE '(' type_data ',' expr ')'
	{
		$$ = &ast.MakeExpr{TypeData: $3, LenExpr: $5}
		$$.SetPosition($1.Position())
	}
	| MAKE '(' type_data ',' expr ',' expr ')'
	{
		$$ = &ast.MakeExpr{TypeData: $3, LenExpr: $5, CapExpr: $7}
		$$.SetPosition($1.Position())
	}
	| MAKE '(' TYPE IDENT ',' expr ')'
	{
		$$ = &ast.MakeTypeExpr{Name: $4.Lit, Type: $6}
		$$.SetPosition($1.Position())
	}
	| expr OPCHAN expr
	{
		$$ = &ast.ChanExpr{LHS: $1, RHS: $3}
		$$.SetPosition($1.Position())
	}
	| OPCHAN expr
	{
		$$ = &ast.ChanExpr{RHS: $2}
		$$.SetPosition($2.Position())
	}
	| expr IN expr
	{
		$$ = &ast.IncludeExpr{ItemExpr: $1, ListExpr: $3}
		$$.SetPosition($1.Position())
	}
	| MAP '[' type_data ']' type_data '{' opt_newlines expr_map opt_comma_newlines '}'
	{
		$8.TypeData = &ast.TypeStruct{Kind: ast.TypeMap, Key: $3, SubType: $5}
		$$ = $8
		$$.SetPosition($1.Position())
	}
	| '{' opt_newlines expr_map opt_comma_newlines '}'
	{
		$$ = $3
		$$.SetPosition($3.Position())
	}
	| expr_slice
	{
		$$ = $1
		$$.SetPosition($1.Position())
	}
	| expr_unary
	| expr_binary
	| expr_lets

expr_idents :
	{
		$$ = []string{}
	}
	| IDENT
	{
		$$ = []string{$1.Lit}
	}
	| expr_idents ',' opt_newlines IDENT
	{
		if len($1) == 0 {
			yylex.Error("syntax error: unexpected ','")
		}
		$$ = append($1, $4.Lit)
	}

type_data :
	IDENT
	{
		$$ = &ast.TypeStruct{Name: $1.Lit}
	}
	| type_data '.' IDENT
	{
		if $1.Kind != ast.TypeDefault {
			yylex.Error("not type default")
		} else {
			$1.Env = append($1.Env, $1.Name)
			$1.Name = $3.Lit
		}
	}
	| '*' type_data
	{
		if $2.Kind == ast.TypeDefault {
			$2.Kind = ast.TypePtr
			$$ = $2
		} else {
			$$ = &ast.TypeStruct{Kind: ast.TypePtr, SubType: $2}
		}
	}
	| slice_count type_data
	{
		if $2.Kind == ast.TypeDefault {
			$2.Kind = ast.TypeSlice
			$2.Dimensions = $1
			$$ = $2
		} else {
			$$ = &ast.TypeStruct{Kind: ast.TypeSlice, SubType: $2, Dimensions: $1}
		}
	}
	| MAP '[' type_data ']' type_data
	{
		$$ = &ast.TypeStruct{Kind: ast.TypeMap, Key: $3, SubType: $5}
	}
	| CHAN type_data
	{
		if $2.Kind == ast.TypeDefault {
			$2.Kind = ast.TypeChan
			$$ = $2
		} else {
			$$ = &ast.TypeStruct{Kind: ast.TypeChan, SubType: $2}
		}
	}


slice_count :
	'[' ']'
	{
		$$ = 1
	}
	| '[' ']' slice_count
	{
		$$ = $3 + 1
	}

expr_member_or_ident :
	expr_member
	{
		$$ = $1
	}
	| expr_ident
	{
		$$ = $1
	}

expr_member :
	expr '.' IDENT
	{
		$$ = &ast.MemberExpr{Expr: $1, Name: $3.Lit}
		$$.SetPosition($1.Position())
	}

expr_ident :
	IDENT
	{
		$$ = &ast.IdentExpr{Lit: $1.Lit}
		$$.SetPosition($1.Position())
	}

expr_literals :
	'-' NUMBER
	{
		num, err := toNumber("-" + $2.Lit)
		if err != nil {
			yylex.Error("invalid number: -" + $2.Lit)
		}
		$$ = &ast.LiteralExpr{Literal: num}
		$$.SetPosition($2.Position())
	}
	| NUMBER
	{
		num, err := toNumber($1.Lit)
		if err != nil {
			yylex.Error("invalid number: " + $1.Lit)
		}
		$$ = &ast.LiteralExpr{Literal: num}
		$$.SetPosition($1.Position())
	}
	| STRING
	{
		$$ = &ast.LiteralExpr{Literal: stringToValue($1.Lit)}
		$$.SetPosition($1.Position())
	}
	| TRUE
	{
		$$ = &ast.LiteralExpr{Literal: trueValue}
		$$.SetPosition($1.Position())
	}
	| FALSE
	{
		$$ = &ast.LiteralExpr{Literal: falseValue}
		$$.SetPosition($1.Position())
	}
	| NIL
	{
		$$ = &ast.LiteralExpr{Literal: nilValue}
		$$.SetPosition($1.Position())
	}

expr_map :
	/* nothing */
	{
		$$ = &ast.MapExpr{}
	}
	| expr ':' expr
	{
		$$ = &ast.MapExpr{Keys: []ast.Expr{$1}, Values: []ast.Expr{$3}}
	}
	| expr_map ',' opt_newlines expr ':' expr
	{
		if $1.Keys == nil {
			yylex.Error("syntax error: unexpected ','")
		}
		$$.Keys = append($$.Keys, $4)
		$$.Values = append($$.Values, $6)
	}

expr_slice :
	expr_ident '[' expr ':' expr ']'
	{
		$$ = &ast.SliceExpr{Item: $1, Begin: $3, End: $5}
	}
	| expr_ident '[' expr ':' ']'
	{
		$$ = &ast.SliceExpr{Item: $1, Begin: $3, End: nil}
	}
	| expr_ident '[' ':' expr ']'
	{
		$$ = &ast.SliceExpr{Item: $1, Begin: nil, End: $4}
	}
	| expr_ident '[' ':' expr ':' expr ']'
	{
		$$ = &ast.SliceExpr{Item: $1, End: $4, Cap: $6}
	}
	| expr_ident '[' expr ':' expr ':' expr ']'
	{
		$$ = &ast.SliceExpr{Item: $1, Begin: $3, End: $5, Cap: $7}
	}
	| expr '[' expr ':' expr ']'
	{
		$$ = &ast.SliceExpr{Item: $1, Begin: $3, End: $5}
	}
	| expr '[' expr ':' ']'
	{
		$$ = &ast.SliceExpr{Item: $1, Begin: $3, End: nil}
	}
	| expr '[' ':' expr ']'
	{
		$$ = &ast.SliceExpr{Item: $1, Begin: nil, End: $4}
	}
	| expr '[' ':' expr ':' expr ']'
	{
		$$ = &ast.SliceExpr{Item: $1, End: $4, Cap: $6}
	}
	| expr '[' expr ':' expr ':' expr ']'
	{
		$$ = &ast.SliceExpr{Item: $1, Begin: $3, End: $5, Cap: $7}
	}

expr_unary :
	'-' expr %prec UNARY
	{
		$$ = &ast.UnaryExpr{Operator: "-", Expr: $2}
		$$.SetPosition($2.Position())
	}
	| '!' expr %prec UNARY
	{
		$$ = &ast.UnaryExpr{Operator: "!", Expr: $2}
		$$.SetPosition($2.Position())
	}
	| '^' expr %prec UNARY
	{
		$$ = &ast.UnaryExpr{Operator: "^", Expr: $2}
		$$.SetPosition($2.Position())
	}
	| '&' expr %prec UNARY
	{
		$$ = &ast.AddrExpr{Expr: $2}
		$$.SetPosition($2.Position())
	}
	| '*' expr %prec UNARY
	{
		$$ = &ast.DerefExpr{Expr: $2}
		$$.SetPosition($2.Position())
	}

expr_binary :
	op_multiply
	{
		$$ = &ast.OpExpr{Op: $1}
		$$.SetPosition($1.Position())
	}
	| op_add
	{
		$$ = &ast.OpExpr{Op: $1}
		$$.SetPosition($1.Position())
	}
	| op_comparison
	{
		$$ = &ast.OpExpr{Op: $1}
		$$.SetPosition($1.Position())
	}
	| op_binary
	{
		$$ = &ast.OpExpr{Op: $1}
		$$.SetPosition($1.Position())
	}

expr_lets:
	expr PLUSPLUS
	{
		rhs := &ast.OpExpr{Op: &ast.AddOperator{LHS: $1, Operator: "+", RHS: oneLiteral}}
		rhs.Op.SetPosition($1.Position())
		rhs.SetPosition($1.Position())
		$$ = &ast.LetsExpr{LHSS: []ast.Expr{$1}, RHSS: []ast.Expr{rhs}}
		$$.SetPosition($1.Position())
	}
	| expr MINUSMINUS
	{
		rhs := &ast.OpExpr{Op: &ast.AddOperator{LHS: $1, Operator: "-", RHS: oneLiteral}}
		rhs.Op.SetPosition($1.Position())
		rhs.SetPosition($1.Position())
		$$ = &ast.LetsExpr{LHSS: []ast.Expr{$1}, RHSS: []ast.Expr{rhs}}
		$$.SetPosition($1.Position())
	}
	| expr PLUSEQ expr
	{
		rhs := &ast.OpExpr{Op: &ast.AddOperator{LHS: $1, Operator: "+", RHS: $3}}
		rhs.Op.SetPosition($1.Position())
		rhs.SetPosition($1.Position())
		$$ = &ast.LetsExpr{LHSS: []ast.Expr{$1}, RHSS: []ast.Expr{rhs}}
		$$.SetPosition($1.Position())
	}
	| expr MINUSEQ expr
	{
		rhs := &ast.OpExpr{Op: &ast.AddOperator{LHS: $1, Operator: "-", RHS: $3}}
		rhs.Op.SetPosition($1.Position())
		rhs.SetPosition($1.Position())
		$$ = &ast.LetsExpr{LHSS: []ast.Expr{$1}, RHSS: []ast.Expr{rhs}}
		$$.SetPosition($1.Position())
	}
	| expr OREQ expr
	{
		rhs := &ast.OpExpr{Op: &ast.AddOperator{LHS: $1, Operator: "|", RHS: $3}}
		rhs.Op.SetPosition($1.Position())
		rhs.SetPosition($1.Position())
		$$ = &ast.LetsExpr{LHSS: []ast.Expr{$1}, RHSS: []ast.Expr{rhs}}
		$$.SetPosition($1.Position())
	}
	| expr MULEQ expr
	{
		rhs := &ast.OpExpr{Op: &ast.MultiplyOperator{LHS: $1, Operator: "*", RHS: $3}}
		rhs.Op.SetPosition($1.Position())
		rhs.SetPosition($1.Position())
		$$ = &ast.LetsExpr{LHSS: []ast.Expr{$1}, RHSS: []ast.Expr{rhs}}
		$$.SetPosition($1.Position())
	}
	| expr DIVEQ expr
	{
		rhs := &ast.OpExpr{Op: &ast.MultiplyOperator{LHS: $1, Operator: "/", RHS: $3}}
		rhs.Op.SetPosition($1.Position())
		rhs.SetPosition($1.Position())
		$$ = &ast.LetsExpr{LHSS: []ast.Expr{$1}, RHSS: []ast.Expr{rhs}}
		$$.SetPosition($1.Position())
	}
	| expr ANDEQ expr
	{
		rhs := &ast.OpExpr{Op: &ast.MultiplyOperator{LHS: $1, Operator: "&", RHS: $3}}
		rhs.Op.SetPosition($1.Position())
		rhs.SetPosition($1.Position())
		$$ = &ast.LetsExpr{LHSS: []ast.Expr{$1}, RHSS: []ast.Expr{rhs}}
		$$.SetPosition($1.Position())
	}


op_multiply :
	expr '*' expr
	{
		$$ = &ast.MultiplyOperator{LHS: $1, Operator: "*", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr '/' expr
	{
		$$ = &ast.MultiplyOperator{LHS: $1, Operator: "/", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr '%' expr
	{
		$$ = &ast.MultiplyOperator{LHS: $1, Operator: "%", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr SHIFTLEFT expr
	{
		$$ = &ast.MultiplyOperator{LHS: $1, Operator: "<<", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr SHIFTRIGHT expr
	{
		$$ = &ast.MultiplyOperator{LHS: $1, Operator: ">>", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr '&' expr
	{
		$$ = &ast.MultiplyOperator{LHS: $1, Operator: "&", RHS: $3}
		$$.SetPosition($1.Position())
	}

op_add :
	expr '+' expr
	{
		$$ = &ast.AddOperator{LHS: $1, Operator: "+", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr '-' expr
	{
		$$ = &ast.AddOperator{LHS: $1, Operator: "-", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr '|' expr
	{
		$$ = &ast.AddOperator{LHS: $1, Operator: "|", RHS: $3}
		$$.SetPosition($1.Position())
	}

op_comparison :
	expr EQEQ expr
	{
		$$ = &ast.ComparisonOperator{LHS: $1, Operator: "==", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr NEQ expr
	{
		$$ = &ast.ComparisonOperator{LHS: $1, Operator: "!=", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr '<' expr
	{
		$$ = &ast.ComparisonOperator{LHS: $1, Operator: "<", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr LE expr
	{
		$$ = &ast.ComparisonOperator{LHS: $1, Operator: "<=", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr '>' expr
	{
		$$ = &ast.ComparisonOperator{LHS: $1, Operator: ">", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr GE expr
	{
		$$ = &ast.ComparisonOperator{LHS: $1, Operator: ">=", RHS: $3}
		$$.SetPosition($1.Position())
	}

op_binary :
	expr ANDAND expr
	{
		$$ = &ast.BinaryOperator{LHS: $1, Operator: "&&", RHS: $3}
		$$.SetPosition($1.Position())
	}
	| expr OROR expr
	{
		$$ = &ast.BinaryOperator{LHS: $1, Operator: "||", RHS: $3}
		$$.SetPosition($1.Position())
	}


opt_term :

	| term
	
term :
	';' newlines
	| newlines
	| ';'

opt_newlines : 
	/* nothing */
	| newlines

newlines : 
	newline
	| newlines newline

newline : '\n'

opt_comma_newlines : 
	/* nothing */
	| ',' newlines
	| newlines
	| ','

%%

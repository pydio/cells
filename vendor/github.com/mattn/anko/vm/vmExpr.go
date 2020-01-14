package vm

import (
	"fmt"
	"reflect"

	"github.com/mattn/anko/ast"
	"github.com/mattn/anko/env"
)

// invokeExpr evaluates one expression.
func (runInfo *runInfoStruct) invokeExpr() {
	switch expr := runInfo.expr.(type) {

	// OpExpr
	case *ast.OpExpr:
		runInfo.operator = expr.Op
		runInfo.invokeOperator()

	// IdentExpr
	case *ast.IdentExpr:
		runInfo.rv, runInfo.err = runInfo.env.GetValue(expr.Lit)
		if runInfo.err != nil {
			runInfo.err = newError(expr, runInfo.err)
		}

	// LiteralExpr
	case *ast.LiteralExpr:
		runInfo.rv = expr.Literal

	// ArrayExpr
	case *ast.ArrayExpr:
		if expr.TypeData == nil {
			slice := make([]interface{}, len(expr.Exprs))
			var i int
			for i, runInfo.expr = range expr.Exprs {
				runInfo.invokeExpr()
				if runInfo.err != nil {
					return
				}
				slice[i] = runInfo.rv.Interface()
			}
			runInfo.rv = reflect.ValueOf(slice)
			return
		}

		t := makeType(runInfo, expr.TypeData)
		if runInfo.err != nil {
			runInfo.rv = nilValue
			return
		}
		if t == nil {
			runInfo.err = newStringError(expr, "cannot make type nil")
			runInfo.rv = nilValue
			return
		}

		slice := reflect.MakeSlice(t, len(expr.Exprs), len(expr.Exprs))
		var i int
		valueType := t.Elem()
		for i, runInfo.expr = range expr.Exprs {
			runInfo.invokeExpr()
			if runInfo.err != nil {
				return
			}

			runInfo.rv, runInfo.err = convertReflectValueToType(runInfo.rv, valueType)
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "cannot use type "+runInfo.rv.Type().String()+" as type "+valueType.String()+" as slice value")
				runInfo.rv = nilValue
				return
			}

			slice.Index(i).Set(runInfo.rv)
		}
		runInfo.rv = slice

	// MapExpr
	case *ast.MapExpr:
		if expr.TypeData == nil {
			var i int
			var key reflect.Value
			m := make(map[interface{}]interface{}, len(expr.Keys))
			for i, runInfo.expr = range expr.Keys {
				runInfo.invokeExpr()
				if runInfo.err != nil {
					return
				}
				key = runInfo.rv

				runInfo.expr = expr.Values[i]
				runInfo.invokeExpr()
				if runInfo.err != nil {
					return
				}

				m[key.Interface()] = runInfo.rv.Interface()
			}
			runInfo.rv = reflect.ValueOf(m)
			return
		}

		t := makeType(runInfo, expr.TypeData)
		if runInfo.err != nil {
			runInfo.rv = nilValue
			return
		}
		if t == nil {
			runInfo.err = newStringError(expr, "cannot make type nil")
			runInfo.rv = nilValue
			return
		}

		runInfo.rv, runInfo.err = makeValue(t)
		if runInfo.err != nil {
			runInfo.rv = nilValue
			return
		}

		var i int
		var key reflect.Value
		m := runInfo.rv
		keyType := t.Key()
		valueType := t.Elem()
		for i, runInfo.expr = range expr.Keys {
			runInfo.invokeExpr()
			if runInfo.err != nil {
				return
			}
			key, runInfo.err = convertReflectValueToType(runInfo.rv, keyType)
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "cannot use type "+key.Type().String()+" as type "+keyType.String()+" as map key")
				runInfo.rv = nilValue
				return
			}

			runInfo.expr = expr.Values[i]
			runInfo.invokeExpr()
			if runInfo.err != nil {
				return
			}
			runInfo.rv, runInfo.err = convertReflectValueToType(runInfo.rv, valueType)
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "cannot use type "+runInfo.rv.Type().String()+" as type "+valueType.String()+" as map value")
				runInfo.rv = nilValue
				return
			}

			m.SetMapIndex(key, runInfo.rv)
		}
		runInfo.rv = m

	// DerefExpr
	case *ast.DerefExpr:
		runInfo.expr = expr.Expr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		if runInfo.rv.Kind() != reflect.Ptr {
			runInfo.err = newStringError(expr.Expr, "cannot deference non-pointer")
			runInfo.rv = nilValue
			return
		}
		runInfo.rv = runInfo.rv.Elem()

	// AddrExpr
	case *ast.AddrExpr:
		runInfo.expr = expr.Expr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		if runInfo.rv.CanAddr() {
			runInfo.rv = runInfo.rv.Addr()
		} else {
			i := runInfo.rv.Interface()
			runInfo.rv = reflect.ValueOf(&i)
		}

	// UnaryExpr
	case *ast.UnaryExpr:
		runInfo.expr = expr.Expr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		switch expr.Operator {
		case "-":
			switch runInfo.rv.Kind() {
			case reflect.Int64:
				runInfo.rv = reflect.ValueOf(-runInfo.rv.Int())
			case reflect.Int32, reflect.Int16, reflect.Int8, reflect.Int, reflect.Bool:
				runInfo.rv = reflect.ValueOf(-toInt64(runInfo.rv))
			case reflect.Float64:
				runInfo.rv = reflect.ValueOf(-runInfo.rv.Float())
			default:
				runInfo.rv = reflect.ValueOf(-toFloat64(runInfo.rv))
			}
		case "^":
			runInfo.rv = reflect.ValueOf(^toInt64(runInfo.rv))
		case "!":
			if toBool(runInfo.rv) {
				runInfo.rv = falseValue
			} else {
				runInfo.rv = trueValue
			}
		default:
			runInfo.err = newStringError(expr, "unknown operator")
			runInfo.rv = nilValue
		}

	// ParenExpr
	case *ast.ParenExpr:
		runInfo.expr = expr.SubExpr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

	// MemberExpr
	case *ast.MemberExpr:
		runInfo.expr = expr.Expr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		if runInfo.rv.Kind() == reflect.Interface && !runInfo.rv.IsNil() {
			runInfo.rv = runInfo.rv.Elem()
		}

		if env, ok := runInfo.rv.Interface().(*env.Env); ok {
			runInfo.rv, runInfo.err = env.GetValue(expr.Name)
			if runInfo.err != nil {
				runInfo.err = newError(expr, runInfo.err)
				runInfo.rv = nilValue
			}
			return
		}

		value := runInfo.rv.MethodByName(expr.Name)
		if value.IsValid() {
			runInfo.rv = value
			return
		}

		if runInfo.rv.Kind() == reflect.Ptr {
			runInfo.rv = runInfo.rv.Elem()
		}

		switch runInfo.rv.Kind() {
		case reflect.Struct:
			field, found := runInfo.rv.Type().FieldByName(expr.Name)
			if found {
				runInfo.rv = runInfo.rv.FieldByIndex(field.Index)
				return
			}
			if runInfo.rv.CanAddr() {
				runInfo.rv = runInfo.rv.Addr()
				method, found := runInfo.rv.Type().MethodByName(expr.Name)
				if found {
					runInfo.rv = runInfo.rv.Method(method.Index)
					return
				}
			}
			runInfo.err = newStringError(expr, "no member named '"+expr.Name+"' for struct")
			runInfo.rv = nilValue
		case reflect.Map:
			runInfo.rv = getMapIndex(reflect.ValueOf(expr.Name), runInfo.rv)
		default:
			runInfo.err = newStringError(expr, "type "+runInfo.rv.Kind().String()+" does not support member operation")
			runInfo.rv = nilValue
		}

	// ItemExpr
	case *ast.ItemExpr:
		runInfo.expr = expr.Item
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}
		item := runInfo.rv

		runInfo.expr = expr.Index
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		if item.Kind() == reflect.Interface && !item.IsNil() {
			item = item.Elem()
		}

		switch item.Kind() {
		case reflect.String, reflect.Slice, reflect.Array:
			var index int
			index, runInfo.err = tryToInt(runInfo.rv)
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "index must be a number")
				runInfo.rv = nilValue
				return
			}
			if index < 0 || index >= item.Len() {
				runInfo.err = newStringError(expr, "index out of range")
				runInfo.rv = nilValue
				return
			}
			if item.Kind() != reflect.String {
				runInfo.rv = item.Index(index)
			} else {
				// String
				runInfo.rv = item.Index(index).Convert(stringType)
			}
		case reflect.Map:
			runInfo.rv = getMapIndex(runInfo.rv, item)
		default:
			runInfo.err = newStringError(expr, "type "+item.Kind().String()+" does not support index operation")
			runInfo.rv = nilValue
		}

	// SliceExpr
	case *ast.SliceExpr:
		runInfo.expr = expr.Item
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}
		item := runInfo.rv

		if item.Kind() == reflect.Interface && !item.IsNil() {
			item = item.Elem()
		}

		switch item.Kind() {
		case reflect.String, reflect.Slice, reflect.Array:
			var beginIndex int
			endIndex := item.Len()

			if expr.Begin != nil {
				runInfo.expr = expr.Begin
				runInfo.invokeExpr()
				if runInfo.err != nil {
					return
				}
				beginIndex, runInfo.err = tryToInt(runInfo.rv)
				if runInfo.err != nil {
					runInfo.err = newStringError(expr, "index must be a number")
					runInfo.rv = nilValue
					return
				}
				// (0 <= low) <= high <= len(a)
				if beginIndex < 0 {
					runInfo.err = newStringError(expr, "index out of range")
					runInfo.rv = nilValue
					return
				}
			}

			if expr.End != nil {
				runInfo.expr = expr.End
				runInfo.invokeExpr()
				if runInfo.err != nil {
					return
				}
				endIndex, runInfo.err = tryToInt(runInfo.rv)
				if runInfo.err != nil {
					runInfo.err = newStringError(expr, "index must be a number")
					runInfo.rv = nilValue
					return
				}
				// 0 <= low <= (high <= len(a))
				if endIndex > item.Len() {
					runInfo.err = newStringError(expr, "index out of range")
					runInfo.rv = nilValue
					return
				}
			}

			// 0 <= (low <= high) <= len(a)
			if beginIndex > endIndex {
				runInfo.err = newStringError(expr, "index out of range")
				runInfo.rv = nilValue
				return
			}

			if item.Kind() == reflect.String {
				if expr.Cap != nil {
					runInfo.err = newStringError(expr, "type string does not support cap")
					runInfo.rv = nilValue
					return
				}
				runInfo.rv = item.Slice(beginIndex, endIndex)
				return
			}

			sliceCap := item.Cap()
			if expr.Cap != nil {
				runInfo.expr = expr.Cap
				runInfo.invokeExpr()
				if runInfo.err != nil {
					return
				}
				sliceCap, runInfo.err = tryToInt(runInfo.rv)
				if runInfo.err != nil {
					runInfo.err = newStringError(expr, "cap must be a number")
					runInfo.rv = nilValue
					return
				}
				//  0 <= low <= (high <= max <= cap(a))
				if sliceCap < endIndex || sliceCap > item.Cap() {
					runInfo.err = newStringError(expr, "cap out of range")
					runInfo.rv = nilValue
					return
				}
			}

			runInfo.rv = item.Slice3(beginIndex, endIndex, sliceCap)

		default:
			runInfo.err = newStringError(expr, "type "+item.Kind().String()+" does not support slice operation")
			runInfo.rv = nilValue
		}

	// LetsExpr
	case *ast.LetsExpr:
		var i int
		for i, runInfo.expr = range expr.RHSS {
			runInfo.invokeExpr()
			if runInfo.err != nil {
				return
			}
			if runInfo.rv.Kind() == reflect.Interface && !runInfo.rv.IsNil() {
				runInfo.rv = runInfo.rv.Elem()
			}
			if i < len(expr.LHSS) {
				runInfo.expr = expr.LHSS[i]
				runInfo.invokeLetExpr()
				if runInfo.err != nil {
					return
				}
			}

		}

	// TernaryOpExpr
	case *ast.TernaryOpExpr:
		runInfo.expr = expr.Expr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		if toBool(runInfo.rv) {
			runInfo.expr = expr.LHS
		} else {
			runInfo.expr = expr.RHS
		}
		runInfo.invokeExpr()

	// NilCoalescingOpExpr
	case *ast.NilCoalescingOpExpr:
		// if left side has no error and is not nil, returns left side
		// otherwise returns right side
		runInfo.expr = expr.LHS
		runInfo.invokeExpr()
		if runInfo.err == nil {
			if !isNil(runInfo.rv) {
				return
			}
		} else {
			runInfo.err = nil
		}
		runInfo.expr = expr.RHS
		runInfo.invokeExpr()

	// LenExpr
	case *ast.LenExpr:
		runInfo.expr = expr.Expr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		if runInfo.rv.Kind() == reflect.Interface && !runInfo.rv.IsNil() {
			runInfo.rv = runInfo.rv.Elem()
		}

		switch runInfo.rv.Kind() {
		case reflect.Slice, reflect.Array, reflect.Map, reflect.String, reflect.Chan:
			runInfo.rv = reflect.ValueOf(int64(runInfo.rv.Len()))
		default:
			runInfo.err = newStringError(expr, "type "+runInfo.rv.Kind().String()+" does not support len operation")
			runInfo.rv = nilValue
		}

	// ImportExpr
	case *ast.ImportExpr:
		runInfo.expr = expr.Name
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}
		runInfo.rv, runInfo.err = convertReflectValueToType(runInfo.rv, stringType)
		if runInfo.err != nil {
			runInfo.rv = nilValue
			return
		}
		name := runInfo.rv.String()
		runInfo.rv = nilValue

		methods, ok := env.Packages[name]
		if !ok {
			runInfo.err = newStringError(expr, "package not found: " + name)
			return
		}
		var err error
		pack := runInfo.env.NewEnv()
		for methodName, methodValue := range methods {
			err = pack.DefineValue(methodName, methodValue)
			if err != nil {
				runInfo.err = newStringError(expr, "import DefineValue error: "+err.Error())
				return
			}
		}

		types, ok := env.PackageTypes[name]
		if ok {
			for typeName, typeValue := range types {
				err = pack.DefineReflectType(typeName, typeValue)
				if err != nil {
					runInfo.err = newStringError(expr, "import DefineReflectType error: "+err.Error())
					return
				}
			}
		}

		runInfo.rv = reflect.ValueOf(pack)

	// MakeExpr
	case *ast.MakeExpr:
		t := makeType(runInfo, expr.TypeData)
		if runInfo.err != nil {
			runInfo.rv = nilValue
			return
		}
		if t == nil {
			runInfo.err = newStringError(expr, "cannot make type nil")
			runInfo.rv = nilValue
			return
		}

		switch expr.TypeData.Kind {
		case ast.TypeSlice:
			aLen := 0
			if expr.LenExpr != nil {
				runInfo.expr = expr.LenExpr
				runInfo.invokeExpr()
				if runInfo.err != nil {
					return
				}
				aLen = toInt(runInfo.rv)
			}
			cap := aLen
			if expr.CapExpr != nil {
				runInfo.expr = expr.CapExpr
				runInfo.invokeExpr()
				if runInfo.err != nil {
					return
				}
				cap = toInt(runInfo.rv)
			}
			if aLen > cap {
				runInfo.err = newStringError(expr, "make slice len > cap")
				runInfo.rv = nilValue
				return
			}
			runInfo.rv = reflect.MakeSlice(t, aLen, cap)
			return
		case ast.TypeChan:
			aLen := 0
			if expr.LenExpr != nil {
				runInfo.expr = expr.LenExpr
				runInfo.invokeExpr()
				if runInfo.err != nil {
					return
				}
				aLen = toInt(runInfo.rv)
			}
			runInfo.rv = reflect.MakeChan(t, aLen)
			return
		}

		runInfo.rv, runInfo.err = makeValue(t)

	// MakeTypeExpr
	case *ast.MakeTypeExpr:
		runInfo.expr = expr.Type
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		// if expr.Name has a dot in it, it should give a syntax error, so no needs to check err
		runInfo.env.DefineReflectType(expr.Name, runInfo.rv.Type())

		runInfo.rv = reflect.ValueOf(runInfo.rv.Type())

	// ChanExpr
	case *ast.ChanExpr:
		runInfo.expr = expr.RHS
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}
		if runInfo.rv.Kind() == reflect.Interface && !runInfo.rv.IsNil() {
			runInfo.rv = runInfo.rv.Elem()
		}
		rhs := runInfo.rv

		if expr.LHS != nil {
			runInfo.expr = expr.LHS
			runInfo.invokeExpr()
			if runInfo.err != nil {
				if len(runInfo.err.Error()) < 18 || runInfo.err.Error()[:17] != "undefined symbol " {
					return
				}
				runInfo.err = nil
			}
		}

		if runInfo.rv.Kind() == reflect.Interface && !runInfo.rv.IsNil() {
			runInfo.rv = runInfo.rv.Elem()
		}

		if expr.LHS == nil || runInfo.rv.Kind() != reflect.Chan {
			// lhs is not channel
			if rhs.Kind() != reflect.Chan {
				// rhs is not channel
				runInfo.err = newStringError(expr, "invalid operation for chan")
				runInfo.rv = nilValue
				return
			}
			// receive from rhs channel
			cases := []reflect.SelectCase{{
				Dir:  reflect.SelectRecv,
				Chan: reflect.ValueOf(runInfo.ctx.Done()),
			}, {
				Dir:  reflect.SelectRecv,
				Chan: rhs,
			}}
			var chosen int
			var ok bool
			chosen, runInfo.rv, ok = reflect.Select(cases)
			if chosen == 0 {
				runInfo.err = ErrInterrupt
				runInfo.rv = nilValue
				return
			}
			if !ok {
				runInfo.rv = nilValue
			}
			if expr.LHS != nil {
				// TOFIX: this runs the expr.LHS again, will sometimes cause bugs, for example with i++
				// most likely need a syntax change to expr = <- expr for let expr
				// TODO: add option to return ok
				runInfo.expr = expr.LHS
				runInfo.invokeLetExpr()
			}
			return
		}

		// send to lhs channel
		rhs, runInfo.err = convertReflectValueToType(rhs, runInfo.rv.Type().Elem())
		if runInfo.err != nil {
			runInfo.err = newStringError(expr, "cannot use type "+rhs.Type().String()+" as type "+runInfo.rv.Type().Elem().String()+" to send to chan")
			runInfo.rv = nilValue
			return
		}
		cases := []reflect.SelectCase{{
			Dir:  reflect.SelectRecv,
			Chan: reflect.ValueOf(runInfo.ctx.Done()),
		}, {
			Dir:  reflect.SelectSend,
			Chan: runInfo.rv,
			Send: rhs,
		}}
		// capture panics if not in debug mode
		defer func() {
			if !runInfo.options.Debug {
				if recoverResult := recover(); recoverResult != nil {
					runInfo.err = fmt.Errorf("%v", recoverResult)
				}
			}
		}()
		runInfo.rv = nilValue
		if chosen, _, _ := reflect.Select(cases); chosen == 0 {
			runInfo.err = ErrInterrupt
		}

	// FuncExpr
	case *ast.FuncExpr:
		runInfo.expr = expr
		runInfo.funcExpr()

	// AnonCallExpr
	case *ast.AnonCallExpr:
		runInfo.expr = expr
		runInfo.anonCallExpr()

	// CallExpr
	case *ast.CallExpr:
		runInfo.expr = expr
		runInfo.callExpr()

	// IncludeExpr
	case *ast.IncludeExpr:
		runInfo.expr = expr.ItemExpr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}
		itemExpr := runInfo.rv

		runInfo.expr = expr.ListExpr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		if runInfo.rv.Kind() != reflect.Slice && runInfo.rv.Kind() != reflect.Array {
			runInfo.err = newStringError(expr, "second argument must be slice or array; but have "+runInfo.rv.Kind().String())
			runInfo.rv = nilValue
			return
		}

		for i := 0; i < runInfo.rv.Len(); i++ {
			if equal(itemExpr, runInfo.rv.Index(i)) {
				runInfo.rv = trueValue
				return
			}
		}
		runInfo.rv = falseValue

	default:
		runInfo.err = newStringError(expr, "unknown expression")
		runInfo.rv = nilValue
	}

}

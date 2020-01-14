package vm

import (
	"reflect"

	"github.com/mattn/anko/ast"
)

func (runInfo *runInfoStruct) invokeLetExpr() {
	switch expr := runInfo.expr.(type) {

	// IdentExpr
	case *ast.IdentExpr:
		if runInfo.env.SetValue(expr.Lit, runInfo.rv) != nil {
			runInfo.err = nil
			runInfo.env.DefineValue(expr.Lit, runInfo.rv)
		}

	// MemberExpr
	case *ast.MemberExpr:
		value := runInfo.rv

		runInfo.expr = expr.Expr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		if runInfo.rv.Kind() == reflect.Interface && !runInfo.rv.IsNil() {
			runInfo.rv = runInfo.rv.Elem()
		}
		if runInfo.rv.Kind() == reflect.Ptr {
			runInfo.rv = runInfo.rv.Elem()
		}

		switch runInfo.rv.Kind() {

		// Struct
		case reflect.Struct:
			field, found := runInfo.rv.Type().FieldByName(expr.Name)
			if !found {
				runInfo.err = newStringError(expr, "no member named '"+expr.Name+"' for struct")
				runInfo.rv = nilValue
				return
			}
			runInfo.rv = runInfo.rv.FieldByIndex(field.Index)
			// From reflect CanSet:
			// A Value can be changed only if it is addressable and was not obtained by the use of unexported struct fields.
			// Often a struct has to be passed as a pointer to be set
			if !runInfo.rv.CanSet() {
				runInfo.err = newStringError(expr, "struct member '"+expr.Name+"' cannot be assigned")
				runInfo.rv = nilValue
				return
			}

			value, runInfo.err = convertReflectValueToType(value, runInfo.rv.Type())
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "type "+value.Type().String()+" cannot be assigned to type "+runInfo.rv.Type().String()+" for struct")
				runInfo.rv = nilValue
				return
			}

			runInfo.rv.Set(value)
			return

		// Map
		case reflect.Map:
			value, runInfo.err = convertReflectValueToType(value, runInfo.rv.Type().Elem())
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "type "+value.Type().String()+" cannot be assigned to type "+runInfo.rv.Type().Elem().String()+" for map")
				runInfo.rv = nilValue
				return
			}
			if runInfo.rv.IsNil() {
				// make new map
				item := reflect.MakeMap(runInfo.rv.Type())
				item.SetMapIndex(reflect.ValueOf(expr.Name), value)
				// assign new map
				runInfo.rv = item
				runInfo.expr = expr.Expr
				runInfo.invokeLetExpr()
				runInfo.rv = item.MapIndex(reflect.ValueOf(expr.Name))
				return
			}
			runInfo.rv.SetMapIndex(reflect.ValueOf(expr.Name), value)

		default:
			runInfo.err = newStringError(expr, "type "+runInfo.rv.Kind().String()+" does not support member operation")
			runInfo.rv = nilValue
		}

	// ItemExpr
	case *ast.ItemExpr:
		value := runInfo.rv

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

		// Slice && Array
		case reflect.Slice, reflect.Array:
			var index int
			index, runInfo.err = tryToInt(runInfo.rv)
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "index must be a number")
				runInfo.rv = nilValue
				return
			}

			if index == item.Len() {
				// try to do automatic append
				value, runInfo.err = convertReflectValueToType(value, item.Type().Elem())
				if runInfo.err != nil {
					runInfo.err = newStringError(expr, "type "+value.Type().String()+" cannot be assigned to type "+item.Type().Elem().String()+" for slice index")
					runInfo.rv = nilValue
					return
				}
				item = reflect.Append(item, value)
				runInfo.rv = item
				runInfo.expr = expr.Item
				runInfo.invokeLetExpr()
				runInfo.rv = item.Index(index)
				return
			}

			if index < 0 || index >= item.Len() {
				runInfo.err = newStringError(expr, "index out of range")
				runInfo.rv = nilValue
				return
			}
			item = item.Index(index)
			if !item.CanSet() {
				runInfo.err = newStringError(expr, "index cannot be assigned")
				runInfo.rv = nilValue
				return
			}

			value, runInfo.err = convertReflectValueToType(value, item.Type())
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "type "+value.Type().String()+" cannot be assigned to type "+item.Type().String()+" for slice index")
				runInfo.rv = nilValue
				return
			}

			item.Set(value)
			runInfo.rv = item

		// Map
		case reflect.Map:
			runInfo.rv, runInfo.err = convertReflectValueToType(runInfo.rv, item.Type().Key())
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "index type "+runInfo.rv.Type().String()+" cannot be used for map index type "+item.Type().Key().String())
				runInfo.rv = nilValue
				return
			}

			value, runInfo.err = convertReflectValueToType(value, item.Type().Elem())
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "type "+value.Type().String()+" cannot be assigned to type "+item.Type().Elem().String()+" for map")
				runInfo.rv = nilValue
				return
			}

			if item.IsNil() {
				// make new map
				item = reflect.MakeMap(item.Type())
				item.SetMapIndex(runInfo.rv, value)
				mapIndex := runInfo.rv
				// assign new map
				runInfo.rv = item
				runInfo.expr = expr.Item
				runInfo.invokeLetExpr()
				runInfo.rv = item.MapIndex(mapIndex)
				return
			}
			item.SetMapIndex(runInfo.rv, value)

		// String
		case reflect.String:
			var index int
			index, runInfo.err = tryToInt(runInfo.rv)
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "index must be a number")
				runInfo.rv = nilValue
				return
			}

			value, runInfo.err = convertReflectValueToType(value, item.Type())
			if runInfo.err != nil {
				runInfo.err = newStringError(expr, "type "+value.Type().String()+" cannot be assigned to type "+item.Type().String())
				runInfo.rv = nilValue
				return
			}

			if index == item.Len() {
				// automatic append
				if item.CanSet() {
					item.SetString(item.String() + value.String())
					return
				}

				runInfo.rv = reflect.ValueOf(item.String() + value.String())
				runInfo.expr = expr.Item
				runInfo.invokeLetExpr()
				return
			}

			if index < 0 || index >= item.Len() {
				runInfo.err = newStringError(expr, "index out of range")
				runInfo.rv = nilValue
				return
			}

			if item.CanSet() {
				item.SetString(item.Slice(0, index).String() + value.String() + item.Slice(index+1, item.Len()).String())
				runInfo.rv = item
				return
			}

			runInfo.rv = reflect.ValueOf(item.Slice(0, index).String() + value.String() + item.Slice(index+1, item.Len()).String())
			runInfo.expr = expr.Item
			runInfo.invokeLetExpr()

		default:
			runInfo.err = newStringError(expr, "type "+item.Kind().String()+" does not support index operation")
			runInfo.rv = nilValue
		}

	// SliceExpr
	case *ast.SliceExpr:
		value := runInfo.rv

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

		// Slice && Array
		case reflect.Slice, reflect.Array:
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

			item = item.Slice3(beginIndex, endIndex, sliceCap)

			if !item.CanSet() {
				runInfo.err = newStringError(expr, "slice cannot be assigned")
				runInfo.rv = nilValue
				return
			}
			item.Set(value)

		// String
		case reflect.String:
			runInfo.err = newStringError(expr, "type string does not support slice operation for assignment")
			runInfo.rv = nilValue

		default:
			runInfo.err = newStringError(expr, "type "+item.Kind().String()+" does not support slice operation")
			runInfo.rv = nilValue
		}

	// DerefExpr
	case *ast.DerefExpr:
		value := runInfo.rv

		runInfo.expr = expr.Expr
		runInfo.invokeExpr()
		if runInfo.err != nil {
			return
		}

		runInfo.rv.Elem().Set(value)
		runInfo.rv = value

	default:
		runInfo.err = newStringError(expr, "invalid operation")
		runInfo.rv = nilValue
	}

}

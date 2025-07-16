package sql

import (
	"context"
	"fmt"
	"reflect"
	"strings"

	"google.golang.org/protobuf/reflect/protoreflect"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/errors"
)

// EnumSerial is a gorm serializer to store proto.Enum as string instead of integer
type EnumSerial struct{}

func (e EnumSerial) Scan(ctx context.Context, field *schema.Field, dst reflect.Value, dbValue interface{}) error {
	if en, ok := reflect.Zero(field.StructField.Type).Interface().(protoreflect.Enum); ok {
		enumType := en.Type()
		values := enumType.Descriptor().Values()
		var compare string
		switch val := dbValue.(type) {
		case []byte:
			compare = string(val)
		case string:
			compare = val
		default:
			return fmt.Errorf("cannot scan value of type %T to proto_enum", dbValue)
		}
		for i := 0; i < values.Len(); i++ {
			enumValue := values.Get(i)
			if string(enumValue.Name()) == compare {
				dst.Elem().FieldByName(field.StructField.Name).Set(reflect.ValueOf(enumValue.Number()).Convert(field.StructField.Type))
				break
			}
		}
	}
	return nil
}

func (e EnumSerial) Value(ctx context.Context, field *schema.Field, dst reflect.Value, fieldValue interface{}) (interface{}, error) {
	if f, ok := fieldValue.(fmt.Stringer); ok {
		return []byte(f.String()), nil
	}
	return fieldValue, errors.New("value does not implement .String() method")
}

// BoolInt is a gorm serializer to store booleans as integers
type BoolInt struct{}

func (b BoolInt) Scan(ctx context.Context, field *schema.Field, dst reflect.Value, dbValue interface{}) error {
	boolVal := dbValue == int64(1)
	if dst.Kind() == reflect.Ptr {
		dst.Elem().FieldByName(field.StructField.Name).SetBool(boolVal)
	} else {
		dst.FieldByName(field.StructField.Name).SetBool(boolVal)
	}
	return nil
}

func (b BoolInt) Value(ctx context.Context, field *schema.Field, dst reflect.Value, fieldValue interface{}) (interface{}, error) {
	if fieldValue == 0 || fieldValue == 1 {
		return fieldValue.(int64), nil
	}
	if boo, ok := fieldValue.(bool); ok && boo {
		return int64(1), nil
	}
	return int64(0), nil
}

type customNaming struct {
	*schema.NamingStrategy
	Policies string
}

func (c *customNaming) TableName(name string) string {
	n := c.NamingStrategy.TableName(name)

	// Special cases
	// idx_tree - we want it singular
	n = strings.Replace(n, "_idx_trees", "_idx_tree", 1)
	// policies table - may be declared
	if c.Policies != "" && n == c.TablePrefix+"resource_policies" {
		return c.Policies
	}

	return n
}

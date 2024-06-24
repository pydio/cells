package sql

import (
	"context"
	"fmt"
	"reflect"
	"strings"

	"google.golang.org/protobuf/reflect/protoreflect"
	"gorm.io/gorm/schema"
)

type EnumSerial struct{}

func (e EnumSerial) Scan(ctx context.Context, field *schema.Field, dst reflect.Value, dbValue interface{}) error {
	if en, ok := reflect.Zero(field.StructField.Type).Interface().(protoreflect.Enum); ok {
		enumType := en.Type()
		values := enumType.Descriptor().Values()
		for i := 0; i < values.Len(); i++ {
			enumValue := values.Get(i)
			if string(enumValue.Name()) == dbValue {
				dst.Elem().FieldByName(field.StructField.Name).Set(reflect.ValueOf(enumValue.Number()).Convert(field.StructField.Type))
				break
			}
		}
	}
	return nil
}

func (e EnumSerial) Value(ctx context.Context, field *schema.Field, dst reflect.Value, fieldValue interface{}) (interface{}, error) {
	if f, ok := fieldValue.(fmt.Stringer); ok {
		return f.String(), nil
	}
	return fieldValue, fmt.Errorf("value does not implement .String() method")
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

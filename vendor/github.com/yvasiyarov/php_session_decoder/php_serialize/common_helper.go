package php_serialize

import (
	"strconv"
)

func PhpValueString(p PhpValue) (res string) {
	res, _ = p.(string)
	return
}

func PhpValueBool(p PhpValue) (res bool) {
	switch p.(type) {
	case bool:
		res, _ = p.(bool)
	case string:
		str, _ := p.(string)
		res, _ = strconv.ParseBool(str)
	}
	return
}

func PhpValueInt(p PhpValue) (res int) {
	switch p.(type) {
	case int:
		res, _ = p.(int)
	case int8:
		intVal, _ := p.(int8)
		res = int(intVal)
	case int16:
		intVal, _ := p.(int16)
		res = int(intVal)
	case int32:
		intVal, _ := p.(int32)
		res = int(intVal)
	case int64:
		intVal, _ := p.(int64)
		res = int(intVal)
	case uint:
		intVal, _ := p.(uint)
		res = int(intVal)
	case uint8:
		intVal, _ := p.(uint8)
		res = int(intVal)
	case uint16:
		intVal, _ := p.(uint16)
		res = int(intVal)
	case uint32:
		intVal, _ := p.(uint32)
		res = int(intVal)
	case uint64:
		intVal, _ := p.(uint64)
		res = int(intVal)
	case string:
		str, _ := p.(string)
		res, _ = strconv.Atoi(str)
	}
	return
}

func PhpValueInt64(p PhpValue) (res int64) {
	switch p.(type) {
	case int64:
		res = p.(int64)
	default:
		res = int64(PhpValueInt(p))
	}
	return
}

func PhpValueUInt(p PhpValue) (res uint) {
	switch p.(type) {
	case uint:
		res = p.(uint)
	default:
		res = uint(PhpValueInt(p))
	}
	return
}

func PhpValueUInt64(p PhpValue) (res uint64) {
	switch p.(type) {
	case uint64:
		res = p.(uint64)
	default:
		res = uint64(PhpValueInt(p))
	}
	return
}

func PhpValueFloat64(p PhpValue) (res float64) {
	switch p.(type) {
	case float64:
		res, _ = p.(float64)
	case string:
		str, _ := p.(string)
		res, _ = strconv.ParseFloat(str, 64)
	default:
		return float64(PhpValueInt(p))
	}
	return
}

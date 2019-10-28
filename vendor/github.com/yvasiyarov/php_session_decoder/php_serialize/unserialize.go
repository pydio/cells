package php_serialize

import (
	"bytes"
	"fmt"
	"log"
	"strconv"
	"strings"
)

const UNSERIALIZABLE_OBJECT_MAX_LEN = 10 * 1024 * 1024 * 1024

func UnSerialize(s string) (PhpValue, error) {
	decoder := NewUnSerializer(s)
	decoder.SetSerializedDecodeFunc(SerializedDecodeFunc(UnSerialize))
	return decoder.Decode()
}

type UnSerializer struct {
	source     string
	r          *strings.Reader
	lastErr    error
	decodeFunc SerializedDecodeFunc
}

func NewUnSerializer(data string) *UnSerializer {
	return &UnSerializer{
		source: data,
	}
}

func (self *UnSerializer) SetReader(r *strings.Reader) {
	self.r = r
}

func (self *UnSerializer) SetSerializedDecodeFunc(f SerializedDecodeFunc) {
	self.decodeFunc = f
}

func (self *UnSerializer) Decode() (PhpValue, error) {
	if self.r == nil {
		self.r = strings.NewReader(self.source)
	}

	var value PhpValue

	if token, _, err := self.r.ReadRune(); err == nil {
		switch token {
		default:
			self.saveError(fmt.Errorf("php_serialize: Unknown token %#U", token))
		case TOKEN_NULL:
			value = self.decodeNull()
		case TOKEN_BOOL:
			value = self.decodeBool()
		case TOKEN_INT:
			value = self.decodeNumber(false)
		case TOKEN_FLOAT:
			value = self.decodeNumber(true)
		case TOKEN_STRING:
			value = self.decodeString(DELIMITER_STRING_LEFT, DELIMITER_STRING_RIGHT, true)
		case TOKEN_ARRAY:
			value = self.decodeArray()
		case TOKEN_OBJECT:
			value = self.decodeObject()
		case TOKEN_OBJECT_SERIALIZED:
			value = self.decodeSerialized()
		case TOKEN_REFERENCE, TOKEN_REFERENCE_OBJECT:
			value = self.decodeReference()
		case TOKEN_SPL_ARRAY:
			value = self.decodeSplArray()

		}
	}

	return value, self.lastErr
}

func (self *UnSerializer) decodeNull() PhpValue {
	self.expect(SEPARATOR_VALUES)
	return nil
}

func (self *UnSerializer) decodeBool() PhpValue {
	var (
		raw rune
		err error
	)
	self.expect(SEPARATOR_VALUE_TYPE)

	if raw, _, err = self.r.ReadRune(); err != nil {
		self.saveError(fmt.Errorf("php_serialize: Error while reading bool value: %v", err))
	}

	self.expect(SEPARATOR_VALUES)
	return raw == '1'
}

func (self *UnSerializer) decodeNumber(isFloat bool) PhpValue {
	var (
		raw string
		err error
		val PhpValue
	)
	self.expect(SEPARATOR_VALUE_TYPE)

	if raw, err = self.readUntil(SEPARATOR_VALUES); err != nil {
		self.saveError(fmt.Errorf("php_serialize: Error while reading number value: %v", err))
	} else {
		if isFloat {
			if val, err = strconv.ParseFloat(raw, 64); err != nil {
				self.saveError(fmt.Errorf("php_serialize: Unable to convert %s to float: %v", raw, err))
			}
		} else {
			if val, err = strconv.Atoi(raw); err != nil {
				self.saveError(fmt.Errorf("php_serialize: Unable to convert %s to int: %v", raw, err))
			}
		}
	}

	return val
}

func (self *UnSerializer) decodeString(left, right rune, isFinal bool) PhpValue {
	var (
		err     error
		val     PhpValue
		strLen  int
		readLen int
	)

	strLen = self.readLen()
	self.expect(left)

	if strLen > 0 {
		buf := make([]byte, strLen, strLen)
		if readLen, err = self.r.Read(buf); err != nil {
			self.saveError(fmt.Errorf("php_serialize: Error while reading string value: %v", err))
		} else {
			if readLen != strLen {
				self.saveError(fmt.Errorf("php_serialize: Unable to read string. Expected %d but have got %d bytes", strLen, readLen))
			} else {
				val = string(buf)
			}
		}
	}

	self.expect(right)
	if isFinal {
		self.expect(SEPARATOR_VALUES)
	}
	return val
}

func (self *UnSerializer) decodeArray() PhpValue {
	var arrLen int
	val := make(PhpArray)

	arrLen = self.readLen()
	self.expect(DELIMITER_OBJECT_LEFT)

	for i := 0; i < arrLen; i++ {
		k, errKey := self.Decode()
		v, errVal := self.Decode()

		if errKey == nil && errVal == nil {
			val[k] = v
			/*switch t := k.(type) {
			default:
				self.saveError(fmt.Errorf("php_serialize: Unexpected key type %T", t))
			case string:
				stringKey, _ := k.(string)
				val[stringKey] = v
			case int:
				intKey, _ := k.(int)
				val[strconv.Itoa(intKey)] = v
			}*/
		} else {
			self.saveError(fmt.Errorf("php_serialize: Error while reading key or(and) value of array"))
		}
	}

	self.expect(DELIMITER_OBJECT_RIGHT)
	return val
}

func (self *UnSerializer) decodeObject() PhpValue {
	val := &PhpObject{
		className: self.readClassName(),
	}

	rawMembers := self.decodeArray()
	val.members, _ = rawMembers.(PhpArray)

	return val
}

func (self *UnSerializer) decodeSerialized() PhpValue {
	val := &PhpObjectSerialized{
		className: self.readClassName(),
	}

	rawData := self.decodeString(DELIMITER_OBJECT_LEFT, DELIMITER_OBJECT_RIGHT, false)
	val.data, _ = rawData.(string)

	if self.decodeFunc != nil && val.data != "" {
		var err error
		if val.value, err = self.decodeFunc(val.data); err != nil {
			self.saveError(err)
		}
	}

	return val
}

func (self *UnSerializer) decodeReference() PhpValue {
	self.expect(SEPARATOR_VALUE_TYPE)
	if _, err := self.readUntil(SEPARATOR_VALUES); err != nil {
		self.saveError(fmt.Errorf("php_serialize: Error while reading reference value: %v", err))
	}
	return nil
}

func (self *UnSerializer) expect(expected rune) {
	if token, _, err := self.r.ReadRune(); err != nil {
		self.saveError(fmt.Errorf("php_serialize: Error while reading expected rune %#U: %v", expected, err))
	} else if token != expected {
		if debugMode {
			log.Printf("php_serialize: source\n%s\n", self.source)
			log.Printf("php_serialize: reader info\n%#v\n", self.r)
		}
		self.saveError(fmt.Errorf("php_serialize: Expected %#U but have got %#U", expected, token))
	}
}

func (self *UnSerializer) readUntil(stop rune) (string, error) {
	var (
		token rune
		err   error
	)
	buf := bytes.NewBuffer([]byte{})

	for {
		if token, _, err = self.r.ReadRune(); err != nil || token == stop {
			break
		} else {
			buf.WriteRune(token)
		}
	}

	return buf.String(), err
}

func (self *UnSerializer) readLen() int {
	var (
		raw string
		err error
		val int
	)
	self.expect(SEPARATOR_VALUE_TYPE)

	if raw, err = self.readUntil(SEPARATOR_VALUE_TYPE); err != nil {
		self.saveError(fmt.Errorf("php_serialize: Error while reading lenght of value: %v", err))
	} else {
		if val, err = strconv.Atoi(raw); err != nil {
			self.saveError(fmt.Errorf("php_serialize: Unable to convert %s to int: %v", raw, err))
		} else if val > UNSERIALIZABLE_OBJECT_MAX_LEN {
			self.saveError(fmt.Errorf("php_serialize: Unserializable object length looks too big(%d). If you are sure you wanna unserialise it, please increase UNSERIALIZABLE_OBJECT_MAX_LEN const", val))
			val = 0
		}
	}
	return val
}

func (self *UnSerializer) readClassName() (res string) {
	rawClass := self.decodeString(DELIMITER_STRING_LEFT, DELIMITER_STRING_RIGHT, false)
	res, _ = rawClass.(string)
	return
}

func (self *UnSerializer) saveError(err error) {
	if self.lastErr == nil {
		self.lastErr = err
	}
}

func (self *UnSerializer) decodeSplArray() PhpValue {
	var err error
	val := &PhpSplArray{}

	self.expect(SEPARATOR_VALUE_TYPE)
	self.expect(TOKEN_INT)

	flags := self.decodeNumber(false)
	if flags == nil {
		self.saveError(fmt.Errorf("php_serialize: Unable to read flags of SplArray"))
		return nil
	}
	val.flags = PhpValueInt(flags)

	if val.array, err = self.Decode(); err != nil {
		self.saveError(fmt.Errorf("php_serialize: Can't parse SplArray: %v", err))
		return nil
	}

	self.expect(SEPARATOR_VALUES)
	self.expect(TOKEN_SPL_ARRAY_MEMBERS)
	self.expect(SEPARATOR_VALUE_TYPE)

	if val.properties, err = self.Decode(); err != nil {
		self.saveError(fmt.Errorf("php_serialize: Can't parse properties of SplArray: %v", err))
		return nil
	}

	return val
}

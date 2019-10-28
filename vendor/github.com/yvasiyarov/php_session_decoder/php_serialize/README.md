PHP Serialize/Unserialize in Go/GoLang
===================

This is the simple implementation of PHP `serialize` and `unserialize` functions written in Go/GoLang. 
This package was inspired by [@yvasiyarov](https://github.com/yvasiyarov) and improved by [@fromYukki](https://github.com/fromYukki).
Feel free to use it as you wish ;)

UnSerialize
---------------

	decoder := NewUnSerializer("Some serialized string")
	if val, err := decoder.Decode(); err != nil {
		panic(err)
	} else {
		// val - is your PhpValue instance
	}

Some details:

* Any of PHP variable will be decoded as `PhpValue` type, and you need to cast it at your own type (int, string etc..);
* Any integer may be converted to `int` (I'm sure that you know about 32 or 64 bits);
* Any decimal my be converted to `float64`;
* Any PHP arrays will be decoded as `PhpArray` type. This is the map of `PhpValue` All keys and values are `PhpValue`;
* Any PHP objects will be decoded as `PhpObject`;
* Any PHP objects that implement a `Serializable` interface wil be decoded as `PhpObjectSerialized`. Please remember it is not the same as `PhpObject`;
* You can set your own unserialize function for objects that implement a `Serializable` interface by using `SetSerializedDecodeFunc` function.

Serialize
---------------

	encoder := NewSerializer()
	if val, err := encoder.Encode(source); err != nil {
		panic(err)
	} else {
		// val - is your serialized string
	}

Encode function expects `PhpValue` variable as argument.

TODO:
---------------

* Write more informative README and some useful examples

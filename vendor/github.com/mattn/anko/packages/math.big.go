package packages

import (
	"math/big"
	"reflect"

	"github.com/mattn/anko/env"
)

func init() {
	env.Packages["math/big"] = map[string]reflect.Value{
		"Above":        reflect.ValueOf(big.Above),
		"AwayFromZero": reflect.ValueOf(big.AwayFromZero),
		"Below":        reflect.ValueOf(big.Below),
		"Exact":        reflect.ValueOf(big.Exact),
		"Jacobi":       reflect.ValueOf(big.Jacobi),
		"MaxBase":      reflect.ValueOf(big.MaxBase),
		"MaxExp":       reflect.ValueOf(big.MaxExp),
		// TODO: https://github.com/mattn/anko/issues/49
		// "MaxPrec":       reflect.ValueOf(big.MaxPrec),
		"MinExp":        reflect.ValueOf(big.MinExp),
		"NewFloat":      reflect.ValueOf(big.NewFloat),
		"NewInt":        reflect.ValueOf(big.NewInt),
		"NewRat":        reflect.ValueOf(big.NewRat),
		"ParseFloat":    reflect.ValueOf(big.ParseFloat),
		"ToNearestAway": reflect.ValueOf(big.ToNearestAway),
		"ToNearestEven": reflect.ValueOf(big.ToNearestEven),
		"ToNegativeInf": reflect.ValueOf(big.ToNegativeInf),
		"ToPositiveInf": reflect.ValueOf(big.ToPositiveInf),
		"ToZero":        reflect.ValueOf(big.ToZero),
	}
}

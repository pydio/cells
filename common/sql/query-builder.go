package sql

import (
	"github.com/doug-martin/goqu"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	service "github.com/pydio/cells/common/service/proto"
)

// Expressioner ...
type Expressioner interface {
	Expression() goqu.Expression
}

// ExpressionConverter ...
type ExpressionConverter interface {
	Convert(sub *any.Any) (goqu.Expression, bool)
}

type queryBuilder struct {
	ex         goqu.Ex
	enquirer   Enquirer
	converters []ExpressionConverter
	wheres     []goqu.Expression
}

// NewQueryBuilder generates SQL request from object
func NewQueryBuilder(e Enquirer, c ...ExpressionConverter) Expressioner {
	return &queryBuilder{
		enquirer:   e,
		converters: c,
	}
}

func (qb *queryBuilder) Expression() goqu.Expression {

	for _, subQ := range qb.enquirer.GetSubQueries() {

		sub := new(service.Query)

		if ptypes.Is(subQ, sub) {
			ptypes.UnmarshalAny(subQ, sub)
			expression := NewQueryBuilder(sub, qb.converters...).Expression()
			qb.wheres = append(qb.wheres, expression)

		} else {
			for _, converter := range qb.converters {
				if ex, ok := converter.Convert(subQ); ok {
					qb.wheres = append(qb.wheres, ex)
				}
			}
		}
	}

	if qb.enquirer.GetOperation() == service.OperationType_AND {
		return goqu.And(qb.wheres...)
	}

	return goqu.Or(qb.wheres...)
}

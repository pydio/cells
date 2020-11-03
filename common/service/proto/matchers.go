package service

import (
	"fmt"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
)

// Matcher interface provides a way to filter idm objects with standard XXXSingleQueries.
type Matcher interface {
	// Matches tries to apply a *SingleQuery on an existing object
	Matches(object interface{}) bool
}

// MultiMatcher parses a Query and transform it to a recursive tree of Matches
type MultiMatcher struct {
	matchers  []Matcher
	Operation OperationType
}

// MatcherParser is a generic function to parse a protobuf into Matcher
type MatcherParser func(o *any.Any) (Matcher, error)

// Parse transforms input query into Matcher interfaces
func (mm *MultiMatcher) Parse(q *Query, parser MatcherParser) error {
	mm.Operation = q.Operation
	for _, an := range q.SubQueries {
		subQ := &Query{}
		if m, e := parser(an); e == nil {
			mm.matchers = append(mm.matchers, m)
		} else if e := ptypes.UnmarshalAny(an, subQ); e == nil {
			subM := &MultiMatcher{}
			if er := subM.Parse(subQ, parser); er != nil {
				return er
			}
			mm.matchers = append(mm.matchers, subM)
		} else {
			return fmt.Errorf("could not parse service.Query to MultiMatcher")
		}
	}
	return nil
}

// Matches implements the Matcher interface
func (mm *MultiMatcher) Matches(object interface{}) bool {
	var res []bool
	for _, m := range mm.matchers {
		res = append(res, m.Matches(object))
	}
	return ReduceQueryBooleans(res, mm.Operation)
}

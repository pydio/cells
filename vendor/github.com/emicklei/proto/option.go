// Copyright (c) 2017 Ernest Micklei
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

package proto

import (
	"bytes"
	"fmt"
	"text/scanner"
)

// Option is a protoc compiler option
type Option struct {
	Position            scanner.Position
	Comment             *Comment
	Name                string
	Constant            Literal
	IsEmbedded          bool
	AggregatedConstants []*NamedLiteral
	InlineComment       *Comment
	Parent              Visitee
}

// parse reads an Option body
// ( ident | "(" fullIdent ")" ) { "." ident } "=" constant ";"
func (o *Option) parse(p *Parser) error {
	pos, tok, lit := p.nextIdentifier()
	if tLEFTPAREN == tok {
		pos, tok, lit = p.nextIdentifier()
		if tok != tIDENT {
			if !isKeyword(tok) {
				return p.unexpected(lit, "option full identifier", o)
			}
		}
		pos, tok, _ = p.next()
		if tok != tRIGHTPAREN {
			return p.unexpected(lit, "full identifier closing )", o)
		}
		o.Name = fmt.Sprintf("(%s)", lit)
	} else {
		// non full ident
		if tIDENT != tok {
			if !isKeyword(tok) {
				return p.unexpected(lit, "option identifier", o)
			}
		}
		o.Name = lit
	}
	pos, tok, lit = p.next()
	if tDOT == tok {
		// extend identifier
		pos, tok, lit = p.nextIdentifier()
		if tok != tIDENT {
			return p.unexpected(lit, "option postfix identifier", o)
		}
		o.Name = fmt.Sprintf("%s.%s", o.Name, lit)
		pos, tok, lit = p.next()
	}
	if tEQUALS != tok {
		return p.unexpected(lit, "option constant =", o)
	}
	r := p.peekNonWhitespace()
	if '{' == r {
		p.next() // consume {
		return o.parseAggregate(p)
	}
	// non aggregate
	l := new(Literal)
	l.Position = pos
	if err := l.parse(p); err != nil {
		return err
	}
	o.Constant = *l
	return nil
}

// inlineComment is part of commentInliner.
func (o *Option) inlineComment(c *Comment) {
	o.InlineComment = c
}

// Accept dispatches the call to the visitor.
func (o *Option) Accept(v Visitor) {
	v.VisitOption(o)
}

// Doc is part of Documented
func (o *Option) Doc() *Comment {
	return o.Comment
}

// Literal represents intLit,floatLit,strLit or boolLit
type Literal struct {
	Position scanner.Position
	Source   string
	IsString bool
}

// SourceRepresentation returns the source (if quoted then use double quote).
func (l Literal) SourceRepresentation() string {
	var buf bytes.Buffer
	if l.IsString {
		buf.WriteRune('"')
	}
	buf.WriteString(l.Source)
	if l.IsString {
		buf.WriteRune('"')
	}
	return buf.String()
}

// parse expects to read a literal constant after =.
func (l *Literal) parse(p *Parser) error {
	pos, _, lit := p.next()
	if "-" == lit {
		// negative number
		if err := l.parse(p); err != nil {
			return err
		}
		// modify source and position
		l.Position, l.Source = pos, "-"+l.Source
		return nil
	}
	source := lit
	isString := isString(lit)
	if isString {
		source = unQuote(source)
	}
	l.Position, l.Source, l.IsString = pos, source, isString
	return nil
}

// NamedLiteral associates a name with a Literal
type NamedLiteral struct {
	*Literal
	Name string
	// PrintsColon is true when the Name must be printed with a colon suffix
	PrintsColon bool
}

// parseAggregate reads options written using aggregate syntax.
// tLEFTCURLY { has been consumed
func (o *Option) parseAggregate(p *Parser) error {
	constants, err := parseAggregateConstants(p, o)
	o.AggregatedConstants = constants
	return err
}

func parseAggregateConstants(p *Parser, container interface{}) (list []*NamedLiteral, err error) {
	for {
		pos, tok, lit := p.next()
		if tRIGHTSQUARE == tok {
			p.nextPut(pos, tok, lit)
			// caller has checked for open square ; will consume rightsquare, rightcurly and semicolon
			return
		}
		if tRIGHTCURLY == tok {
			return
		}
		if tSEMICOLON == tok {
			p.nextPut(pos, tok, lit) // allow for inline comment parsing
			return
		}
		if tCOMMA == tok {
			if len(list) == 0 {
				err = p.unexpected(lit, "non-empty option aggregate key", container)
				return
			}
			continue
		}
		if tIDENT != tok {
			err = p.unexpected(lit, "option aggregate key", container)
			return
		}
		// workaround issue #59 TODO
		if isString(lit) && len(list) > 0 {
			// concatenate with previous constant
			list[len(list)-1].Source += unQuote(lit)
			continue
		}
		key := lit
		printsColon := false
		// expect colon, aggregate or plain literal
		pos, tok, lit = p.next()
		if tCOLON == tok {
			// consume it
			printsColon = true
			pos, tok, lit = p.next()
		}
		// see if nested aggregate is started
		if tLEFTCURLY == tok {
			nested, fault := parseAggregateConstants(p, container)
			if fault != nil {
				err = fault
				return
			}
			// flatten the constants
			for _, each := range nested {
				flatten := &NamedLiteral{
					Name:    key + "." + each.Name,
					Literal: each.Literal}
				list = append(list, flatten)
			}
			continue
		}
		// no aggregate, put back token
		p.nextPut(pos, tok, lit)
		// now we see plain literal
		l := new(Literal)
		l.Position = pos
		if err = l.parse(p); err != nil {
			return
		}
		list = append(list, &NamedLiteral{Name: key, Literal: l, PrintsColon: printsColon})
	}
}

func (o *Option) parent(v Visitee) { o.Parent = v }

package main

import (
	"bytes"
	"reflect"
	"testing"

	"github.com/pkg/errors"
)

func TestDecodeTag(t *testing.T) {
	for idx, test := range []struct {
		in  string
		err error
		out []byte
	}{
		{"", nil, []byte("")},
		{"foo", nil, []byte("foo")},
		{"b!%!", errors.New("illegal base64 data at input byte 0"), []byte("")},
		{"b\"c29tZSBkYXRhIHdpdGggACBhbmQg77u/\"", nil, []byte("some data with \x00 and \ufeff")},
		{"b!c29tZSBkYXRhIHdpdGggACBhbmQg77u/!", nil, []byte("some data with \x00 and \ufeff")},
	} {
		actual, err := decodeTag(test.in)
		if err == nil && test.err != nil || err != nil && test.err == nil {
			t.Errorf("DecodeTag[%d] err %q want %q", idx, err, test.err)
		} else if err != nil && err.Error() != test.err.Error() {
			t.Errorf("DecodeTag[%d] err %q want %q", idx, err, test.err)
		} else if bytes.Compare(actual, test.out) != 0 {
			t.Errorf("DecodeTag[%d] want [%s] got [%s]", idx, test.out, actual)
		}
	}
}

func TestParse(t *testing.T) {
	for idx, test := range []struct {
		in  string
		err error
		out []Segment
	}{
		{"and(__name:duration)", nil, []Segment{{Value: "duration"}}},
		{"and(__name:duration,foo:bar)", nil, []Segment{
			{Value: "duration"},
			{Type: TagCat, Value: "foo"},
			{Type: TagPair},
			{Type: TagVal, Value: "bar"},
			{Type: TagPlus},
			{Type: TagEnd},
		}},
	} {
		iq := &IrondbQuery{Basic: test.in}
		err := iq.ParseBasic()
		if err == nil && test.err != nil || err != nil && test.err == nil {
			t.Errorf("Parse[%d] err %q want %q", idx, err, test.err)
		} else if err != nil && err.Error() != test.err.Error() {
			t.Errorf("Parse[%d] err %q want %q", idx, err, test.err)
		} else if !reflect.DeepEqual(iq.Segments, test.out) {
			t.Errorf("Parse[%d] want [%q] got [%q]", idx, test.out, iq.Segments)
		}
	}
}

func TestToCaql(t *testing.T) {
	for idx, test := range []struct {
		err1 error
		err2 error
		out  string
		in   IrondbQuery
	}{
		{in: IrondbQuery{Basic: "and(__name:duration)"}, err1: nil, err2: nil, out: "find('duration')"},
	} {
		err := test.in.ParseBasic()
		if err == nil && test.err1 != nil || err != nil && test.err1 == nil {
			t.Errorf("Parse[%d] err1 %q want %q", idx, err, test.err1)
		} else if err != nil && err.Error() != test.err1.Error() {
			t.Errorf("Parse[%d] err1 %q want %q", idx, err, test.err1)
		}

		caql, err := test.in.ToCaql()
		if err == nil && test.err2 != nil || err != nil && test.err2 == nil {
			t.Errorf("Parse[%d] err2 %q want %q", idx, err, test.err2)
		} else if err != nil && err.Error() != test.err2.Error() {
			t.Errorf("Parse[%d] err2 %q want %q", idx, err, test.err2)
		} else if test.out != caql {
			t.Errorf("Parse[%d] want [%q] got [%q]", idx, test.out, caql)
		}
	}
}

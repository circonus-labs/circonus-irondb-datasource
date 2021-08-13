package main

import (
	"encoding/base64"
	"fmt"
	"strings"

	"github.com/pkg/errors"
)

// SegmentType is a Go enum representing the valid IronDB Query Segment Types
type SegmentType int

var segmentTypeNames = []string{
	"MetricName",
	"TagCat",
	"TagVal",
	"TagPair",
	"TagSep",
	"TagEnd",
	"TagOp",
	"TagPlus",
}

// String prints the human-readable name of a SegmentType
func (st SegmentType) String() string {
	return segmentTypeNames[st]
}

const (
	MetricName SegmentType = iota
	TagCat
	TagVal
	TagPair
	TagSep
	TagEnd
	TagOp
	TagPlus
)

// Segment is part of an IronDB Query
type Segment struct {
	Type  SegmentType
	Value string
}

type IrondbQuery struct {
	Basic    string
	RawQuery string
	Segments []Segment
	Error    error
}

func decodeTag(t string) ([]byte, error) {
	if len(t) >= 3 && t[0] == 'b' &&
		(t[1] == '"' && t[len(t)-1] == '"' || t[1] == '!' && t[len(t)-1] == '!') {
		return base64.StdEncoding.DecodeString(t[2 : len(t)-1])
	}
	return []byte(t), nil
}

func (iq *IrondbQuery) ParseBasic() error {
	if iq.RawQuery != "" {
		return nil
	}

	metricName := "*"
	if len(iq.Basic) > 11 {
		// deep copy of the part of the metric name we want,
		// ignoring the leading 'and(__name:'
		var sb strings.Builder
		sb.WriteString(iq.Basic[11:])
		metricName = sb.String()
	}
	tags := strings.Split(metricName, ",")
	metricName = tags[0]
	if len(tags) == 1 {
		metricName = metricName[:len(metricName)-1]
	}
	tags = tags[1:]
	val, err := decodeTag(metricName)
	if err != nil {
		return err
	}
	iq.Segments = append(iq.Segments, Segment{Type: MetricName, Value: string(val)})

	first := true
	for _, tag := range tags {
		if first {
			first = false
		} else {
			iq.Segments = append(iq.Segments, Segment{Type: TagSep})
		}

		t := strings.SplitN(tag, ":", 2)
		tagCat := t[0]
		tagVal := t[1]
		tagOp := false
		tagIndex := 4
		if strings.HasPrefix(tagCat, "and(") || strings.HasPrefix(tagCat, "not(") {
			tagOp = true
		} else if strings.HasPrefix(tagCat, "or(") {
			tagOp = true
			tagIndex = 3
		}
		if tagOp {
			iq.Segments = append(iq.Segments, Segment{Type: TagOp, Value: tagCat[:tagIndex]})
			tagCat = tagCat[tagIndex:]
		}

		val, err = decodeTag(tagCat)
		if err != nil {
			return err
		}
		iq.Segments = append(iq.Segments, Segment{Type: TagCat, Value: string(val)}, Segment{Type: TagPair})

		end := 0
		for strings.HasSuffix(tagVal, ")") {
			tagVal = tagVal[:len(tagVal)-1]
			end++
		}
		val, err = decodeTag(tagVal)
		if err != nil {
			return err
		}
		iq.Segments = append(iq.Segments, Segment{Type: TagVal, Value: string(val)})

		for i := 0; i < end; i++ {
			iq.Segments = append(iq.Segments, Segment{Type: TagPlus}, Segment{Type: TagEnd})
		}

		if len(tags) == 0 {
			iq.Segments = append(iq.Segments, Segment{Type: TagPlus})
		}
	}

	return nil
}

func (iq *IrondbQuery) ToCaql() (string, error) {
	if len(iq.Segments) == 0 {
		return "", errors.New("ParseBasic must be called to populate Segments before ToCaql")
	} else if len(iq.Segments) > 1 {
		return "", errors.New("ToCaql currently supports only metric name queries")
	}

	return fmt.Sprintf("find('%s')", iq.Segments[0].Value), nil
}

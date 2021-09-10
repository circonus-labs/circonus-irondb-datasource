package main

import (
	"fmt"
	"testing"
	"time"
)

func TestSampleDatasource_truncateNowSample(t *testing.T) {
	tests := []struct {
		name      string
		jsonFmt   string
		wantFmt   string
		period    int
		useCurrTS bool
		truncate  bool
	}{
		{
			name:      "invalid - no truncate - no _end field",
			jsonFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end_bad":%d,"_period":%d}`,
			wantFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end_bad":%d,"_period":%d}`,
			period:    60,
			useCurrTS: false,
			truncate:  true,
		},
		{
			name:      "invalid - no truncate - bad _end type",
			jsonFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end":"%d","_period":%d}`,
			wantFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end":"%d","_period":%d}`,
			period:    60,
			useCurrTS: false,
			truncate:  true,
		},
		{
			name:      "invalid - no truncate - bad json",
			jsonFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end":%d,"_period":%d`,
			wantFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end":%d,"_period":%d`,
			period:    60,
			useCurrTS: true,
			truncate:  true,
		},
		{
			name:      "invalid - no truncate - zero _data elements",
			jsonFmt:   `{"_query":"","_data":[],"_start":0,"_end":%d,"_period":%d}`,
			wantFmt:   `{"_query":"","_data":[],"_start":0,"_end":%d,"_period":%d}`,
			period:    60,
			useCurrTS: true,
			truncate:  true,
		},
		{
			name:      "valid - no truncate - truncateNow false",
			jsonFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end":%d,"_period":%d}`,
			wantFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end":%d,"_period":%d}`,
			period:    60,
			useCurrTS: false,
			truncate:  false,
		},
		{
			name:      "valid - no truncate - _end 5m ago",
			jsonFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end":%d,"_period":%d}`,
			wantFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end":%d,"_period":%d}`,
			period:    60,
			useCurrTS: false,
			truncate:  true,
		},
		{
			name:      "valid - truncate - _end now",
			jsonFmt:   `{"_query":"","_data":[[1,1],[2,2],[3,3]],"_start":0,"_end":%d,"_period":%d}`,
			wantFmt:   `{"_query":"","_data":[[1,1],[2,2]],"_start":0,"_end":%d,"_period":%d}`,
			period:    60,
			useCurrTS: true,
			truncate:  true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			var ts int64
			if tt.useCurrTS {
				ts = time.Now().Unix()
			} else {
				ts = time.Now().Add(-5 * time.Minute).Unix()
			}
			inJSON := fmt.Sprintf(tt.jsonFmt, ts, tt.period)
			wantJSON := fmt.Sprintf(tt.wantFmt, ts, tt.period)
			td := &SampleDatasource{truncateNow: tt.truncate}
			if got := td.truncateNowSample(inJSON); got != wantJSON {
				t.Errorf("SampleDatasource.truncateNowSample() = %v, want %v", got, wantJSON)
			}
		})
	}
}

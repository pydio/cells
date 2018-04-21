package iso8601

import (
	"bytes"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"text/template"
	"time"
)

var (
	// ErrBadFormat is returned when parsing fails
	ErrBadFormat = errors.New("bad format string")

	tmpl = template.Must(template.New("duration").Parse(`P{{if .Years}}{{.Years}}Y{{end}}{{if .Months}}{{.Months}}M{{end}}{{if .Weeks}}{{.Weeks}}W{{end}}{{if .Days}}{{.Days}}D{{end}}{{if .HasTimePart}}T{{end }}{{if .Hours}}{{.Hours}}H{{end}}{{if .Minutes}}{{.Minutes}}M{{end}}{{if .Seconds}}{{.Seconds}}S{{end}}`))

	full = regexp.MustCompile(`P(?:(?P<year>\d+)Y)?(?:(?P<month>\d+)M)?(?:(?P<day>\d+)D)?(?:(?P<time>T)(?:(?P<hour>\d+)H)?(?:(?P<minute>\d+)M)?(?:(?P<second>\d+)S)?)?`)
	week = regexp.MustCompile(`P(?:(?P<week>\d+)W)`)
)

type Duration struct {
	Years   int
	Months  int
	Weeks   int
	Days    int
	Hours   int
	Minutes int
	Seconds int
}

func FromString(dur string) (*Duration, error) {
	var (
		match []string
		re    *regexp.Regexp
	)

	if week.MatchString(dur) {
		match = week.FindStringSubmatch(dur)
		re = week
	} else if full.MatchString(dur) {
		match = full.FindStringSubmatch(dur)
		re = full
	} else {
		return nil, ErrBadFormat
	}

	d := &Duration{}

	timeOccurred := false
	dateUnspecified := true
	weekUnspecified := true
	timeUnspecified := true
	for i, name := range re.SubexpNames() {
		part := match[i]
		if i == 0 || name == "" || part == "" {
			continue
		}
		if name == "time" {
			timeOccurred = true
			continue
		}

		val, err := strconv.Atoi(part)
		if err != nil {
			return nil, err
		}
		switch name {
		case "year":
			d.Years = val
			dateUnspecified = false
		case "month":
			d.Months = val
			dateUnspecified = false
		case "week":
			d.Weeks = val
			weekUnspecified = false
		case "day":
			d.Days = val
			dateUnspecified = false
		case "hour":
			d.Hours = val
			timeUnspecified = false
		case "minute":
			d.Minutes = val
			timeUnspecified = false
		case "second":
			d.Seconds = val
			timeUnspecified = false
		default:
			return nil, errors.New(fmt.Sprintf("unknown field %s", name))
		}
	}

	if (dateUnspecified && weekUnspecified && timeUnspecified) || (timeOccurred && timeUnspecified) {
		return nil, errors.New(fmt.Sprintf("invalid ISO 8601 duration spec %s", dur))
	}

	return d, nil
}

// String prints out the value passed in. It's not strictly according to the
// ISO spec, but it's pretty close. In particular, to completely conform it
// would need to round up to the next largest unit. 61 seconds to 1 minute 1
// second, for example. It would also need to disallow weeks mingling with
// other units.
func (d *Duration) String() string {
	var s bytes.Buffer

	err := tmpl.Execute(&s, d)
	if err != nil {
		panic(err)
	}

	return s.String()
}

func (d *Duration) HasTimePart() bool {
	return d.Hours != 0 || d.Minutes != 0 || d.Seconds != 0
}

func (d *Duration) ToDuration() time.Duration {
	day := time.Hour * 24
	year := day * 365

	tot := time.Duration(0)

	tot += year * time.Duration(d.Years)
	tot += day * 7 * time.Duration(d.Weeks)
	tot += day * time.Duration(d.Days)
	tot += time.Hour * time.Duration(d.Hours)
	tot += time.Minute * time.Duration(d.Minutes)
	tot += time.Second * time.Duration(d.Seconds)

	tot += d.getMonthDuration()

	return tot
}

func (d *Duration) getMonthDuration() time.Duration {
	if d.Months == 0 {
		return time.Duration(0)
	}

	now := time.Now()
	currentMonth := int(now.Month())
	currentYear := int(now.Year())

	value := time.Duration(0)
	for i := 0; i < d.Months; i++ {
		currentMonth += 1
		if currentMonth == 13 {
			currentMonth = 1
			currentYear += 1
		}
		value += time.Hour * 24 * time.Duration(daysInMonth(currentYear, currentMonth))
	}

	return value
}

func daysInMonth(year, month int) int {
	if IntInSlice(month, []int{1, 3, 5, 7, 8, 10, 12}) {
		return 31
	}
	if IntInSlice(month, []int{4, 6, 9, 11}) {
		return 30
	}
	// Leap year for Feb
	if ((year % 400) == 0) || ((year%100) != 0) && ((year%4) == 0) {
		return 29
	}
	return 28
}

func IntInSlice(num int, slice []int) bool {
	for i := range slice {
		if slice[i] == num {
			return true
		}
	}
	return false
}

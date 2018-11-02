package test

import "encoding/json"

// NewTestResult creates a new TestResult
func NewTestResult(testName string) *TestResult {
	return &TestResult{
		Pass: true,
		Name: testName,
	}
}

// Log appends message and json serialized version of objects in result
func (t *TestResult) Log(msg string, objects ...interface{}) {
	if len(objects) > 0 {
		for _, o := range objects {
			if jsonObj, e := json.Marshal(o); e == nil {
				msg += " " + string(jsonObj)
			}
		}
	}
	t.Messages = append(t.Messages, msg)
}

// Fail send result.Pass to false and appends message and json serialized version of objects in result
func (t *TestResult) Fail(msg string, objects ...interface{}) {
	t.Pass = false
	t.Log(msg, objects...)
}

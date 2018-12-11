package utils

import (
	"io"
	"math"
	"net/http"
)

// ProgressMonitor provides a TeeReader to wrap a reader and send a progress inside a dedicated channel
type ProgressMonitor struct {
	expectedSize uint64
	currentSize  uint64
	currentPg    float64
	progressChan chan float64
	doneChan     chan bool
	SizeChan     chan uint64
}

// BodyWithProgressMonitor creates a ProgressMonitor directly from an http.Response
func BodyWithProgressMonitor(resp *http.Response, progress chan float64, done chan bool) io.Reader {
	expected := uint64(0)
	if resp.ContentLength > 0 {
		expected = uint64(resp.ContentLength)
	}
	return io.TeeReader(resp.Body, NewProgressMonitor(expected, progress, done))
}

// NewProgressMonitor initialize a ProgressMonitor with the channels
func NewProgressMonitor(expected uint64, progress chan float64, done chan bool) *ProgressMonitor {
	m := &ProgressMonitor{
		expectedSize: expected,
		progressChan: progress,
		doneChan:     done,
	}
	return m
}

// Write implements the io.Writer interface to be used by a TeeReader
func (m *ProgressMonitor) Write(p []byte) (int, error) {
	n := len(p)
	m.currentSize += uint64(n)
	if m.progressChan != nil && m.expectedSize > 0 {
		progress100 := math.Floor(100 * float64(m.currentSize) / float64(m.expectedSize))
		if progress100 != m.currentPg {
			m.progressChan <- float64(m.currentSize) / float64(m.expectedSize)
		}
		m.currentPg = progress100
	}
	if m.SizeChan != nil {
		m.SizeChan <- m.currentSize
	}
	if m.doneChan != nil && m.expectedSize > 0 && m.currentSize == m.expectedSize {
		m.doneChan <- true
	}
	return n, nil
}

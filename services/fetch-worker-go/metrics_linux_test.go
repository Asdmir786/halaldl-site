//go:build linux

package main

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// Sample the test process and its descendants. Unit-level memory.peak was
// underreported on this shared host, so do not present it as worker RSS.
func familyRSS(pid int) int64 {
	data, e := os.ReadFile("/proc/" + strconv.Itoa(pid) + "/status")
	if e != nil {
		return 0
	}
	var rss int64
	for _, line := range strings.Split(string(data), "\n") {
		if strings.HasPrefix(line, "VmRSS:") {
			v, _ := strconv.ParseInt(strings.Fields(line)[1], 10, 64)
			rss = v * 1024
		}
	}
	tasks, _ := filepath.Glob("/proc/" + strconv.Itoa(pid) + "/task/*/children")
	seen := map[int]bool{}
	for _, task := range tasks {
		b, _ := os.ReadFile(task)
		for _, value := range strings.Fields(string(b)) {
			child, _ := strconv.Atoi(value)
			if child > 0 && !seen[child] {
				seen[child] = true
				rss += familyRSS(child)
			}
		}
	}
	return rss
}

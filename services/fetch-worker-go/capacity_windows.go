//go:build windows

package main

import "fmt"

type Resources struct{ AvailableMemory, HostFree, WorkFree, WorkSize, WorkerMemoryLimit, WorkerMemoryUsed int64 }

func resources(string) (Resources, error) { return Resources{}, fmt.Errorf("Linux worker required") }
func preflight(string, int) error         { return fmt.Errorf("Linux worker required") }

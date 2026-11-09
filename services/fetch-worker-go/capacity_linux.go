//go:build linux

package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
)

type Resources struct{ AvailableMemory, HostFree, WorkFree, WorkSize, WorkerMemoryLimit, WorkerMemoryUsed int64 }

func diskFree(path string) (int64, int64, error) {
	var s syscall.Statfs_t
	err := syscall.Statfs(path, &s)
	return int64(s.Bavail) * int64(s.Bsize), int64(s.Blocks) * int64(s.Bsize), err
}
func resources(workRoot string) (Resources, error) {
	var r Resources
	b, err := os.ReadFile("/proc/meminfo")
	if err != nil {
		return r, err
	}
	for _, line := range strings.Split(string(b), "\n") {
		if strings.HasPrefix(line, "MemAvailable:") {
			f := strings.Fields(line)
			v, _ := strconv.ParseInt(f[1], 10, 64)
			r.AvailableMemory = v * 1024
		}
	}
	r.HostFree, _, err = diskFree("/var/lib")
	if err != nil {
		return r, err
	}
	r.WorkFree, r.WorkSize, err = diskFree(workRoot)
	if err != nil {
		return r, err
	}
	group, err := os.ReadFile("/proc/self/cgroup")
	if err != nil {
		return r, err
	}
	for _, line := range strings.Split(string(group), "\n") {
		if strings.HasPrefix(line, "0::") {
			base := filepath.Join("/sys/fs/cgroup", strings.TrimPrefix(line, "0::"))
			for name, target := range map[string]*int64{"memory.max": &r.WorkerMemoryLimit, "memory.current": &r.WorkerMemoryUsed} {
				data, e := os.ReadFile(filepath.Join(base, name))
				if e != nil {
					return r, e
				}
				v, e := strconv.ParseInt(strings.TrimSpace(string(data)), 10, 64)
				if e != nil {
					return r, fmt.Errorf("bounded worker memory required")
				}
				*target = v
			}
		}
	}
	return r, nil
}
func preflight(workRoot string, maxJobs int) error {
	b, err := os.ReadFile("/proc/self/cgroup")
	if err != nil {
		return err
	}
	group := ""
	for _, l := range strings.Split(string(b), "\n") {
		if strings.HasPrefix(l, "0::") {
			group = strings.TrimPrefix(l, "0::")
		}
	}
	if group == "" {
		return fmt.Errorf("cgroup v2 required")
	}
	base := filepath.Join("/sys/fs/cgroup", group)
	readInt := func(name string) int64 {
		b, e := os.ReadFile(filepath.Join(base, name))
		if e != nil {
			return -1
		}
		v, e := strconv.ParseInt(strings.TrimSpace(string(b)), 10, 64)
		if e != nil {
			return -1
		}
		return v
	}
	mem, tasks := readInt("memory.max"), readInt("pids.max")
	cpu, e := os.ReadFile(filepath.Join(base, "cpu.max"))
	f := strings.Fields(string(cpu))
	var quota, period int64
	if len(f) == 2 {
		quota, _ = strconv.ParseInt(f[0], 10, 64)
		period, _ = strconv.ParseInt(f[1], 10, 64)
	}
	if e != nil || quota <= 0 || period <= 0 || quota > 4*period || mem <= 0 || mem > 4*GiB || tasks <= 0 || tasks > 256 {
		return fmt.Errorf("bounded CPU, memory and task sandbox required")
	}
	guard, e := os.Stat("/run/halaldl-fetch-egress/ready")
	if e != nil || guard.Mode().Perm()&0022 != 0 {
		return fmt.Errorf("managed egress guard required")
	}
	if st, ok := guard.Sys().(*syscall.Stat_t); !ok || st.Uid != 0 {
		return fmt.Errorf("root-owned egress guard required")
	}
	r, e := resources(workRoot)
	if e != nil {
		return e
	}
	if r.WorkSize > 40*GiB {
		return fmt.Errorf("work mount exceeds reviewed limit")
	}
	// A separate mount, not a directory on the host root, bounds temporary writes.
	var work, parent syscall.Stat_t
	if syscall.Stat(workRoot, &work) != nil || syscall.Stat(filepath.Dir(workRoot), &parent) != nil || work.Dev == parent.Dev {
		return fmt.Errorf("dedicated work mount required")
	}
	if maxJobs < 1 || maxJobs > 12 {
		return fmt.Errorf("invalid concurrency")
	}
	return nil
}

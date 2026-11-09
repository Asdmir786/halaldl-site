package main

import (
	"bytes"
	"context"
	"errors"
	"io"
	"os"
	"os/exec"
	"sync"
	"time"
)

type boundedBuffer struct {
	mu       sync.Mutex
	data     bytes.Buffer
	limit    int
	exceeded bool
	cancel   context.CancelFunc
}

func (b *boundedBuffer) Write(p []byte) (int, error) {
	b.mu.Lock()
	defer b.mu.Unlock()
	n := len(p)
	remaining := b.limit - b.data.Len()
	if remaining > 0 {
		b.data.Write(p[:min(n, remaining)])
	}
	if n > remaining {
		b.exceeded = true
		if b.cancel != nil {
			b.cancel()
		}
	}
	return n, nil
}

type CommandResult struct{ Stdout, Stderr string }

func runCommand(ctx context.Context, dir, exe string, args []string, timeout time.Duration, maxOutput int) (CommandResult, error) {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, exe, args...)
	cmd.Dir = dir
	cmd.Env = []string{"PATH=" + os.Getenv("PATH"), "LANG=C.UTF-8", "HOME=" + dir, "TMPDIR=" + dir, "TEMP=" + dir, "TMP=" + dir}
	if os.Getenv("SystemRoot") != "" {
		cmd.Env = append(cmd.Env, "SystemRoot="+os.Getenv("SystemRoot"))
	}
	out := &boundedBuffer{limit: maxOutput, cancel: cancel}
	stderr := &boundedBuffer{limit: 64 * 1024}
	cmd.Stdout = out
	cmd.Stderr = stderr
	cmd.Stdin = nil
	cmd.WaitDelay = 2 * time.Second
	configureProcess(cmd)
	err := cmd.Run()
	result := CommandResult{out.data.String(), stderr.data.String()}
	if out.exceeded {
		return result, errors.New("output_limit")
	}
	if ctx.Err() != nil {
		return result, ctx.Err()
	}
	return result, err
}

var _ io.Writer = (*boundedBuffer)(nil)

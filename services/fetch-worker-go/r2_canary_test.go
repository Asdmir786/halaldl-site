package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"testing"
)

// Explicit, one-source integration opt-in. Normal go test never writes to R2.
// The caller supplies an isolated API claim, existing storage credentials via
// process environment, and a disposable private directory. No live queue calls.
func TestElevenLabsR2Canary(t *testing.T) {
	if os.Getenv("HALALDL_R2_CANARY") != "elevenlabs-explicit" {
		t.Skip("explicit real-R2 canary only")
	}
	root := os.Getenv("CANARY_ROOT")
	if !filepath.IsAbs(root) || filepath.Base(root) != "halaldl-r2-e2e-20261108" {
		t.Fatal("isolated canary directory required")
	}
	b, e := os.ReadFile(filepath.Join(root, "job.json"))
	if e != nil {
		t.Fatal(e)
	}
	var j Job
	if e = json.Unmarshal(b, &j); e != nil {
		t.Fatal(e)
	}
	if j.URL != "https://www.instagram.com/p/Ddt1o_Us_ns/" || j.MaxBytes > 200*MiB {
		t.Fatal("canary is restricted to the supplied public ElevenLabs post")
	}
	s, e := newStorage(os.Getenv("R2_ACCOUNT_ID"), os.Getenv("R2_BUCKET"), os.Getenv("R2_ACCESS_KEY_ID"), os.Getenv("R2_SECRET_ACCESS_KEY"))
	if e != nil {
		t.Fatal(e)
	}
	var upload map[string]any
	p := &Processor{YTDLP: os.Getenv("CANARY_EXTRACTOR"), FFmpeg: "/usr/bin/ffmpeg", FFprobe: "/usr/bin/ffprobe", JSRuntime: "/usr/bin/node", WorkRoot: filepath.Join(root, "work"), ProxyURL: os.Getenv("CANARY_PROXY")}
	if e = os.MkdirAll(p.WorkRoot, 0700); e != nil {
		t.Fatal(e)
	}
	p.Upload = func(ctx context.Context, key, path string, size int64) error {
		f, e := os.Open(path)
		if e != nil {
			return e
		}
		defer f.Close()
		h := sha256.New()
		if _, e = io.Copy(h, f); e != nil {
			return e
		}
		if _, e = f.Seek(0, 0); e != nil {
			return e
		}
		copy, e := os.OpenFile(filepath.Join(root, "before-r2.mp4"), os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
		if e != nil {
			return e
		}
		_, copyErr := io.Copy(copy, f)
		closeErr := copy.Close()
		if copyErr != nil {
			return copyErr
		}
		if closeErr != nil {
			return closeErr
		}
		upload = map[string]any{"key": key, "bytes": size, "sha256": hex.EncodeToString(h.Sum(nil))}
		return s.Upload(ctx, key, path, size)
	}
	result := p.Process(context.Background(), j)
	data, _ := json.MarshalIndent(map[string]any{"result": result, "upload": upload}, "", "  ")
	if e = os.WriteFile(filepath.Join(root, "result-"+j.Kind+".json"), data, 0600); e != nil {
		t.Fatal(e)
	}
	if !result.OK {
		t.Fatalf("real media canary failed: %s", result.ErrorCode)
	}
}

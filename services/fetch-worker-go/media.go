package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"time"
)

type Processor struct {
	YTDLP, FFmpeg, FFprobe, JSRuntime, WorkRoot, ProxyURL string
	Upload                                                func(context.Context, string, string, int64) error
	Heavy                                                 chan struct{}
}

func sourceFailure(platform, stderr string) error {
	l := strings.ToLower(strings.ReplaceAll(stderr, "’", "'"))
	if platform == "youtube" && (strings.Contains(l, "sign in to confirm you're not a bot") || strings.Contains(l, "sign in to confirm you are not a bot")) {
		return errors.New("source_challenge")
	}
	return errors.New("blocked")
}
func directorySize(path string) int64 {
	var size int64
	_ = filepath.WalkDir(path, func(_ string, d os.DirEntry, e error) error {
		if e != nil {
			return e
		}
		if !d.IsDir() {
			i, e := d.Info()
			if e != nil {
				return e
			}
			size += i.Size()
		}
		return nil
	})
	return size
}
func (p *Processor) Process(parent context.Context, j Job) (result Result) {
	result = Result{ID: j.ID, WorkerID: j.WorkerID, LeaseToken: j.LeaseToken}
	var err error
	defer func() {
		if err != nil {
			code := err.Error()
			if !slices.Contains([]string{"unsupported", "blocked", "source_challenge", "too_big", "too_long", "too_many_items", "no_audio", "no_format"}, code) {
				code = "failed"
			}
			result.OK = false
			result.ErrorCode = code
		}
		logEvent("job_finished", map[string]any{"jobId": j.ID, "kind": j.Kind, "ok": result.OK, "errorCode": result.ErrorCode})
	}()
	if err = j.Validate(); err != nil {
		return
	}
	dir, e := os.MkdirTemp(p.WorkRoot, "job-")
	if e != nil {
		err = e
		return
	}
	defer os.RemoveAll(dir)
	ctx, cancel := context.WithTimeout(parent, 22*time.Minute)
	defer cancel()
	// Monitor intermediate files as well as the output. --max-filesize alone
	// does not bound fragmented downloads or two-track merge workspaces.
	done := make(chan struct{})
	defer close(done)
	go func() {
		ticker := time.NewTicker(200 * time.Millisecond)
		defer ticker.Stop()
		for {
			select {
			case <-done:
				return
			case <-ctx.Done():
				return
			case <-ticker.C:
				if directorySize(dir) > 3*j.MaxBytes+16*MiB {
					cancel()
					return
				}
			}
		}
	}()
	args := []string{"--ignore-config", "--no-plugin-dirs", "--no-cache-dir", "--no-playlist", "--no-warnings", "--no-progress", "--socket-timeout", "20", "--retries", "2", "--fragment-retries", "2", "--concurrent-fragments", "1", "--proxy", p.ProxyURL}
	if p.JSRuntime != "" {
		args = append(args, "--js-runtimes", "node:"+p.JSRuntime)
	}
	if j.Kind == "probe" {
		var command CommandResult
		command, err = runCommand(ctx, dir, p.YTDLP, append(args, "--dump-single-json", "--skip-download", "--", j.URL), 3*time.Minute, 4*1024*1024)
		if err != nil {
			if ctx.Err() == nil {
				err = sourceFailure(j.Platform, command.Stderr)
			}
			return
		}
		var payload struct {
			Title     string           `json:"title"`
			Thumbnail string           `json:"thumbnail"`
			Duration  *float64         `json:"duration"`
			Type      string           `json:"_type"`
			IsLive    bool             `json:"is_live"`
			Entries   json.RawMessage  `json:"entries"`
			Formats   []map[string]any `json:"formats"`
		}
		if err = json.Unmarshal([]byte(command.Stdout), &payload); err != nil {
			return
		}
		if payload.IsLive || payload.Type == "playlist" || payload.Type == "multi_video" || (len(payload.Entries) > 0 && string(payload.Entries) != "null") {
			err = errors.New("too_many_items")
			return
		}
		if payload.Duration != nil {
			if *payload.Duration <= 0 || math.IsNaN(*payload.Duration) || math.IsInf(*payload.Duration, 0) {
				err = errors.New("unsupported")
				return
			}
			if *payload.Duration > j.MaxSeconds {
				err = errors.New("too_long")
				return
			}
		}
		result.OK = true
		result.Title = truncate(payload.Title, 250)
		result.Thumbnail = truncate(payload.Thumbnail, 2048)
		result.Duration = payload.Duration
		result.ItemCount = 1
		for _, f := range payload.Formats[:min(500, len(payload.Formats))] {
			clean := map[string]any{}
			for _, key := range []string{"format_id", "ext", "width", "height", "fps", "filesize", "filesize_approx", "vcodec", "acodec", "abr", "tbr"} {
				if v, ok := f[key]; ok {
					clean[key] = v
				}
			}
			result.Formats = append(result.Formats, clean)
		}
		return
	}
	if p.Heavy != nil {
		select {
		case p.Heavy <- struct{}{}:
			defer func() { <-p.Heavy }()
		case <-ctx.Done():
			err = ctx.Err()
			return
		}
	}
	output := filepath.Join(dir, j.ID+".%(ext)s")
	args = append(args, "--downloader", "native", "--hls-prefer-native", "--ffmpeg-location", p.FFmpeg, "--postprocessor-args", "ffmpeg:-threads 1", "-f", j.FormatSelector, "--max-filesize", fmt.Sprint(j.MaxBytes))
	if strings.Contains(j.FormatSelector, "+") {
		args = append(args, "--merge-output-format", j.Extension)
	}
	args = append(args, "--print", "after_move:%(filepath)j", "-o", output, "--", j.URL)
	command, e := runCommand(ctx, dir, p.YTDLP, args, 18*time.Minute, 256*1024)
	if e != nil {
		err = sourceFailure(j.Platform, command.Stderr)
		return
	}
	lines := strings.Split(strings.TrimSpace(command.Stdout), "\n")
	var actual string
	if err = json.Unmarshal([]byte(lines[len(lines)-1]), &actual); err != nil {
		return
	}
	actual, err = filepath.EvalSymlinks(actual)
	if err != nil {
		return
	}
	rel, e := filepath.Rel(dir, actual)
	if e != nil || !filepath.IsAbs(actual) || strings.HasPrefix(rel, "..") || strings.Split(filepath.Base(actual), ".")[0] != j.ID {
		err = errors.New("unsupported")
		return
	}
	info, e := os.Stat(actual)
	if e != nil || !info.Mode().IsRegular() || info.Size() < 1 || info.Size() > j.MaxBytes {
		err = errors.New("too_big")
		return
	}
	if j.DeliveryMode == "audio" || j.DeliveryMode == "video_only" {
		target := filepath.Join(dir, j.ID+"-selected."+j.Extension)
		track := []string{"-map", "0:v:0", "-an", "-c:v", "copy"}
		if j.DeliveryMode == "audio" {
			track = []string{"-map", "0:a:0", "-vn", "-c:a", "copy"}
		}
		a := append([]string{"-nostdin", "-v", "error", "-protocol_whitelist", "file,pipe", "-i", actual}, track...)
		a = append(a, "-map_metadata", "-1", "-threads", "1", "-y", target)
		if _, err = runCommand(ctx, dir, p.FFmpeg, a, 2*time.Minute, 64*1024); err != nil {
			return
		}
		if err = os.Remove(actual); err != nil {
			return
		}
		actual = target
	}
	info, err = os.Stat(actual)
	if err != nil {
		return
	}
	if info.Size() < 1 || info.Size() > j.MaxBytes {
		err = errors.New("too_big")
		return
	}
	if strings.TrimPrefix(filepath.Ext(actual), ".") != j.Extension {
		err = errors.New("no_format")
		return
	}
	command, err = runCommand(ctx, dir, p.FFprobe, []string{"-v", "error", "-protocol_whitelist", "file,pipe", "-show_entries", "stream=codec_type,width,height:format=duration,format_name", "-of", "json", actual}, 20*time.Second, 64*1024)
	if err != nil {
		return
	}
	duration, e := verifyMedia([]byte(command.Stdout), j)
	if e != nil {
		err = e
		return
	}
	key := "fetch/" + j.ID + "-" + newID()
	uploadCtx, stop := context.WithTimeout(ctx, 2*time.Minute)
	defer stop()
	if err = p.Upload(uploadCtx, key, actual, info.Size()); err != nil {
		return
	}
	result.OK = true
	result.ObjectKey = key
	result.Bytes = info.Size()
	result.Extension = j.Extension
	result.Duration = &duration
	return
}
func truncate(s string, n int) string { r := []rune(s); return string(r[:min(n, len(r))]) }
func verifyMedia(data []byte, j Job) (float64, error) {
	var p struct {
		Streams []struct {
			Type          string `json:"codec_type"`
			Width, Height int
		} `json:"streams"`
		Format struct {
			Duration string `json:"duration"`
			Name     string `json:"format_name"`
		} `json:"format"`
	}
	if json.Unmarshal(data, &p) != nil {
		return 0, errors.New("no_format")
	}
	audio, video := false, false
	for _, s := range p.Streams {
		if s.Type == "audio" {
			audio = true
		}
		if s.Type == "video" {
			video = true
			edge := s.Height
			if s.Width > 0 {
				edge = min(edge, s.Width)
			}
			limit := j.MaxHeight
			if j.ExpectedHeight != nil {
				limit = min(limit, *j.ExpectedHeight)
			}
			if edge <= 0 || edge > limit {
				return 0, errors.New("no_format")
			}
		}
	}
	if j.DeliveryMode != "video_only" && !audio {
		return 0, errors.New("no_audio")
	}
	if (j.DeliveryMode == "video_only" && audio) || (j.DeliveryMode == "audio" && video) || (j.MediaType == "video" && !video) {
		return 0, errors.New("no_format")
	}
	var duration float64
	_, e := fmt.Sscan(p.Format.Duration, &duration)
	if e != nil || duration <= 0 || math.IsNaN(duration) || math.IsInf(duration, 0) {
		return 0, errors.New("unsupported")
	}
	if duration > j.MaxSeconds+1 {
		return 0, errors.New("too_long")
	}
	containers := map[string][]string{"mp4": {"mov", "mp4"}, "m4a": {"mov", "mp4"}, "mov": {"mov"}, "m4v": {"mov", "mp4", "m4v"}, "webm": {"webm"}, "mkv": {"matroska"}, "mp3": {"mp3"}, "aac": {"aac"}, "ogg": {"ogg"}, "opus": {"ogg"}, "wav": {"wav"}, "flac": {"flac"}}
	for _, container := range strings.Split(p.Format.Name, ",") {
		if slices.Contains(containers[j.Extension], container) {
			return duration, nil
		}
	}
	return 0, errors.New("no_format")
}

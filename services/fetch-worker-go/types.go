package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/url"
	"regexp"
	"slices"
	"strings"
)

const MiB int64 = 1024 * 1024
const GiB = 1024 * MiB

var uuidPattern = regexp.MustCompile(`^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$`)
var selectorPattern = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]*(?:\+[A-Za-z0-9][A-Za-z0-9._-]*)?$`)
var extensions = []string{"mp4", "webm", "mkv", "m4a", "mp3", "aac", "ogg", "opus", "wav", "flac", "mov", "m4v"}

type Job struct {
	Cookies         json.RawMessage `json:"cookies,omitempty"`
	Proxy           json.RawMessage `json:"proxy,omitempty"`
	PrivateJob      bool            `json:"private_job,omitempty"`
	ID              string          `json:"id"`
	URL             string          `json:"url"`
	Platform        string          `json:"platform"`
	Kind            string          `json:"kind"`
	WorkerID        string          `json:"workerId"`
	LeaseToken      string          `json:"leaseToken"`
	ProtocolVersion int             `json:"protocolVersion"`
	FormatSelector  string          `json:"formatSelector"`
	Extension       string          `json:"extension"`
	MediaType       string          `json:"mediaType"`
	DeliveryMode    string          `json:"deliveryMode"`
	MaxBytes        int64           `json:"maxBytes"`
	MaxSeconds      float64         `json:"maxSeconds"`
	MaxHeight       int             `json:"maxHeight"`
	ExpectedHeight  *int            `json:"expectedHeight"`
}

func newID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	b[6] = b[6]&15 | 64
	b[8] = b[8]&63 | 128
	h := hex.EncodeToString(b[:])
	return h[:8] + "-" + h[8:12] + "-" + h[12:16] + "-" + h[16:20] + "-" + h[20:]
}

func (j Job) Validate() error {
	if j.PrivateJob || len(j.Cookies) > 0 || len(j.Proxy) > 0 {
		return errors.New("public_only")
	}
	u, err := url.Parse(j.URL)
	if err != nil || u.Scheme != "https" || u.User != nil || u.Port() != "" || u.Fragment != "" {
		return errors.New("unsupported")
	}
	if strings.Count(strings.ToLower(j.URL), "https://")+strings.Count(strings.ToLower(j.URL), "http://") != 1 {
		return errors.New("unsupported")
	}
	for _, values := range u.Query() {
		for _, value := range values {
			decoded, _ := url.QueryUnescape(value)
			if strings.Contains(strings.ToLower(value+decoded), "https://") || strings.Contains(strings.ToLower(value+decoded), "http://") {
				return errors.New("unsupported")
			}
		}
	}
	h := strings.TrimPrefix(strings.ToLower(u.Hostname()), "www.")
	hosts := map[string]bool{"youtube.com": true, "youtu.be": true, "m.youtube.com": true, "music.youtube.com": true, "redd.it": true, "instagram.com": true, "tiktok.com": true, "vm.tiktok.com": true, "vt.tiktok.com": true, "facebook.com": true, "m.facebook.com": true, "fb.watch": true, "x.com": true, "twitter.com": true, "reddit.com": true, "v.redd.it": true, "vimeo.com": true, "player.vimeo.com": true, "dailymotion.com": true, "dai.ly": true, "soundcloud.com": true, "on.soundcloud.com": true}
	if !hosts[h] || !uuidPattern.MatchString(j.ID) || !uuidPattern.MatchString(j.WorkerID) || !uuidPattern.MatchString(j.LeaseToken) || j.ProtocolVersion != 3 || (j.Kind != "probe" && j.Kind != "download") || j.MaxBytes < 1 || j.MaxBytes > 800*MiB || j.MaxSeconds <= 0 || j.MaxSeconds > 1800 || j.MaxHeight < 1 || j.MaxHeight > 2160 {
		return errors.New("unsupported")
	}
	if j.Kind == "download" && (!selectorPattern.MatchString(j.FormatSelector) || !slices.Contains(extensions, j.Extension) || !slices.Contains([]string{"audio", "video"}, j.MediaType) || !slices.Contains([]string{"audio", "video_only", "video_audio"}, j.DeliveryMode) || (j.DeliveryMode == "audio") != (j.MediaType == "audio")) {
		return errors.New("unsupported")
	}
	return nil
}

type Result struct {
	ID         string           `json:"id"`
	WorkerID   string           `json:"workerId"`
	LeaseToken string           `json:"leaseToken"`
	OK         bool             `json:"ok"`
	ErrorCode  string           `json:"errorCode,omitempty"`
	Title      string           `json:"title,omitempty"`
	Thumbnail  string           `json:"thumbnail,omitempty"`
	Duration   *float64         `json:"duration,omitempty"`
	ItemCount  int              `json:"itemCount,omitempty"`
	Formats    []map[string]any `json:"formats,omitempty"`
	ObjectKey  string           `json:"objectKey,omitempty"`
	Bytes      int64            `json:"bytes,omitempty"`
	Extension  string           `json:"extension,omitempty"`
}

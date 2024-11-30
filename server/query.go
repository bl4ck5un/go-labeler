package server

import (
	"context"
	"fmt"
	"net/http"
	"slices"
	"strings"

	"github.com/Jille/convreq"
	"github.com/Jille/convreq/respond"
	"github.com/imax9000/errors"

	comatproto "github.com/bluesky-social/indigo/api/atproto"

	"bsky.watch/labeler/sign"
)

type queryRequestGet struct {
	UriPatterns []string `schema:"uriPatterns"`
	Sources     []string `schema:"sources"`
	// Ignoring `limit` and `cursor`
}

type errUnsupportedPattern string

func (s errUnsupportedPattern) Error() string {
	return fmt.Sprintf("unsupported pattern %q", string(s))
}

func (err errUnsupportedPattern) Respond(w http.ResponseWriter, r *http.Request) error {
	http.Error(w, fmt.Sprintf("I received your request but I decided to ignore you.\n\n%s", err), 448)
	return nil
}

func (q *queryRequestGet) Validate() error {
	if len(q.UriPatterns) == 0 {
		return fmt.Errorf("need at least one pattern")
	}
	for _, p := range q.UriPatterns {
		switch {
		case strings.HasPrefix(p, "did:"):
			if strings.Contains(p, "*") {
				return errUnsupportedPattern(p)
			}
		case strings.HasPrefix(p, "at://"):
			// We don't support wildcards yet. Even if only the rkey is wildcarded,
			// the query becomes too broad.
			if strings.Contains(p, "*") {
				return errUnsupportedPattern(p)
			}
		default:
			return fmt.Errorf("invalid pattern %q", p)
		}
	}
	return nil
}

func (q *queryRequestGet) Match(entry *Entry) bool {
	if len(q.Sources) > 0 {
		if !slices.Contains(q.Sources, entry.Src) {
			return false
		}
	}
	return slices.Contains(q.UriPatterns, entry.Uri)
}

// Query returns HTTP handler that implements [com.atproto.label.queryLabels](https://docs.bsky.app/docs/api/com-atproto-label-query-labels) XRPC method.
func (s *Server) Query() http.Handler {
	return convreq.Wrap(func(ctx context.Context, get queryRequestGet) convreq.HttpResponse {
		if err := get.Validate(); err != nil {
			if err, ok := errors.As[errUnsupportedPattern](err); ok {
				return err
			}
			return respond.BadRequest(err.Error())
		}

		s.mu.RLock()
		defer s.mu.RUnlock()
		result := []Entry{}
		for _, p := range get.UriPatterns {
			for src, uriLabels := range s.labels {
				if len(get.Sources) > 0 && !slices.Contains(get.Sources, src) {
					continue
				}
				// Taking advantage of the fact that we don't allow any wildcards at all.
				// So we can just do a plain map lookup.
				for _, labels := range uriLabels[p] {
					for _, entry := range labels {
						if get.Match(&entry) {
							result = append(result, entry)
						}
					}
				}
			}
		}

		for i := range result {
			if err := sign.Sign(ctx, s.privateKey, (*comatproto.LabelDefs_Label)(&result[i])); err != nil {
				return respond.InternalServerError("failed to sign the labels")
			}
		}

		return respond.JSON(map[string]any{"labels": result})
	})
}

package restv2

import (
	"slices"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

// TNOptions holds options for TreeNodeToNode conversion
type TNOptions struct {
	PreSigner         PreSigner
	EditorURLProvider map[string]EditorProvider
	EditorURLGenerate bool
}

// TNOption is a function that modifies TNOptions
type TNOption func(o *TNOptions)

// WithPreSigner sets a presigner for generating presigned URLs
func WithPreSigner(preSigner PreSigner) TNOption {
	return func(o *TNOptions) {
		o.PreSigner = preSigner
	}
}

// WithEditorProvider registers an available editor provider
func WithEditorProvider(name string, prov EditorProvider) TNOption {
	return func(o *TNOptions) {
		if o.EditorURLProvider == nil {
			o.EditorURLProvider = make(map[string]EditorProvider)
		}
		o.EditorURLProvider[name] = prov
	}
}

// WithEditorURLGenerate translates from WithEditorURLs flag
func WithEditorURLGenerate() TNOption {
	return func(o *TNOptions) {
		o.EditorURLGenerate = true
	}
}

func (h *Handler) TNOptionsFromFlags(req *restful.Request, ff []rest.Flag) (oo []TNOption) {
	ctx := req.Request.Context()
	if slices.Contains(ff, rest.Flag_WithPreSignedURLs) {
		opts := Options{
			Expiration:      presignDefaultExpiration,
			UseCacheControl: presignUseCacheControl,
			CacheControl:    presignDefaultCacheControl,
		}

		if sig, err := NewV4SignerForRequest(req.Request, opts); err != nil {
			log.Logger(ctx).Error("Cannot create signer", zap.Error(err))
		} else {
			oo = append(oo, WithPreSigner(sig))
		}
	}
	if slices.Contains(ff, rest.Flag_WithEditorURLs) {
		oo = append(oo, WithEditorURLGenerate())
	}
	for name, factory := range editorProviderFactories {
		if editorProvider, enabled := factory(ctx, req); enabled {
			oo = append(oo, WithEditorProvider(name, editorProvider))
		}
	}
	return oo
}

func (h *Handler) toRestFlags(flagsStr []string) []rest.Flag {
	var flags []rest.Flag
	for _, flagStr := range flagsStr {
		if v, ok := rest.Flag_value[flagStr]; ok {
			flags = append(flags, rest.Flag(v))
		}
	}

	return flags
}

func (h *Handler) parseFlags(ff []rest.Flag) (flags tree.Flags) {
	for _, f := range ff {
		switch f {
		case rest.Flag_WithMetaCoreOnly:
			flags = append(flags, tree.StatFlagMetaMinimal)
		case rest.Flag_WithVersionsAll:
			flags = append(flags, tree.StatFlagVersionsAll)
		case rest.Flag_WithVersionsDraft:
			flags = append(flags, tree.StatFlagVersionsDraft)
		case rest.Flag_WithVersionsPublished:
			flags = append(flags, tree.StatFlagVersionsPublished)
		case rest.Flag_WithMetaNone:
			flags = append(flags, tree.StatFlagNone)
		}
	}
	return
}

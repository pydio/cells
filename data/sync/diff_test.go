/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package sync

import (
	"context"
	"errors"
	"strconv"
	"testing"

	"github.com/pydio/cells/common/proto/tree"
)

type mockNodeView string

// GetUuid satisfies UUIDGetter
func (m mockNodeView) GetUuid() string { return string(m) }

func (m mockNodeView) GetPath() string { return string(m) }

func (m mockNodeView) GetCommits() []*tree.ChangeLog { return nil }

func TestIdempotentAction(t *testing.T) {
	t.Run("IsIdempotent", func(t *testing.T) {
		var ctr int
		a := newAction(mockNodeView("cul de chouette"), func(context.Context) error {
			ctr++
			return nil
		})

		for i := 0; i < 10; i++ {
			if err := a.Resolve(context.Background()); err != nil {
				t.Errorf("unexpected error out of action: %s", err)
			}
		}

		if ctr != 1 {
			t.Errorf("idempotence property violated (expected ctr=0, got %d)", ctr)
		}

	})

	t.Run("StopsOnError", func(t *testing.T) {
		var ctr int
		a := newAction(mockNodeView("provencal de gaule"), func(context.Context) error {
			ctr++
			return errors.New("elle est ou la poulette?")
		})

		for i := 0; i < 10; i++ {
			if err := a.Resolve(context.Background()); err == nil {
				t.Error("expected error out of Resolve, got nil")
			}
		}

		if ctr != 1 {
			t.Errorf("idempotence property violated (expected ctr=0, got %d)", ctr)
		}
	})

	t.Run("ExpireContext", func(t *testing.T) {
		a := newAction(mockNodeView("kadoc"), func(context.Context) error {
			t.Error("action effected despite cancelled context")
			return nil
		})

		ctx, cancel := context.WithCancel(context.Background())
		cancel()

		if err := a.Resolve(ctx); err == nil {
			t.Error("expected error, got nil")
		} else if err.Error() != "context expired" {
			t.Errorf("expected error msg \"context expired\", got \"%s\"", err)
		}
	})
}

func TestDiffTree(t *testing.T) {
	mact := newAction(
		mockNodeView("sire, on en a gros!"),
		func(context.Context) error { return nil },
	)

	t.Run("CRUD", func(t *testing.T) {
		dt := newDiffTree(newVolatileSet())

		t.Run("Insert", func(t *testing.T) {
			dt.Insert("/test", mact)
			if ma, ok := dt.tree.Get("/test"); !ok {
				t.Error("action could not be located at insertion path")
			} else if ma.(*idempotentAction) != mact {
				t.Error("value retrieved does not match value inserted")
			}
		})

		t.Run("Get", func(t *testing.T) {
			if ma, ok := dt.Get("/test"); !ok {
				t.Error("action could not be located at insertion path")
			} else if ma != mact {
				t.Error("value retrieved does not match value inserted")
			}
		})

		t.Run("Delete", func(t *testing.T) {
			dt.Delete("/test")
			if _, ok := dt.Get("/test"); ok {
				t.Error("value found after deletion")
			}
		})
	})

	t.Run("Resolve", func(t *testing.T) {
		t.Run("Successful", func(t *testing.T) {
			dt := newDiffTree(newVolatileSet())

			var ctr int
			n := 10
			for i := 0; i < n; i++ {
				dt.Insert(strconv.Itoa(i), newAction(mockNodeView("hodor"), func(context.Context) error {
					ctr++
					return nil
				}))
			}

			if err := dt.Resolve(context.Background()); err != nil {
				t.Errorf("error resolving diffTree: %s", err)
			}

			if ctr != n {
				t.Errorf("unexpected action result (expected %d, got %d)", n, ctr)
			}
		})
	})

	t.Run("Erroneous", func(t *testing.T) {
		t.Run("TopLevelErr", func(t *testing.T) {
			dt := newDiffTree(newVolatileSet())
			dt.Insert("", newAction(mockNodeView("hodor"), func(context.Context) error {
				return errors.New("derp")
			}))

			if err := dt.Resolve(context.Background()); err == nil {
				t.Error("expected error; got nil")
			}
		})

		t.Run("DeepErr", func(t *testing.T) {
			dt := newDiffTree(newVolatileSet())
			var ctr int

			assign := func(p string) {
				dt.Insert(p, newAction(mockNodeView(p), func(context.Context) error {
					ctr++
					return nil
				}))
			}

			for _, p := range []string{"/a", "/a/1", "/c/1", "/c/2"} {
				assign(p)
			}

			dt.Insert("/b", newAction(mockNodeView("err"), func(context.Context) error {
				return errors.New("derp")
			}))

			if err := dt.Resolve(context.Background()); err == nil {
				t.Error("expected error, got nil")
			} else if ctr != 2 {
				t.Errorf("expected ctr=2, got %d", ctr)
			}
		})
	})

	t.Run("ResolveSubtree", func(t *testing.T) {
		mkTree := func() (*diffTree, *int) {
			var ctr int
			dt := newDiffTree(newVolatileSet())

			paths := []string{
				"/a",
				"/c",
				"/c/1",
				"/c/2",
				"/c/2/alpha",
				"/c/2/bravo", // subtree to test
				"/c/2/bravo/xray",
				"/c/2/bravo/yankee",
				"/c/2/bravo/zulu",
				"/c/2/bravo/zulu/1",
				"/c/2/bravo/zulu/2",
				"/c/2/charlie",
			}

			assign := func(p string) {
				dt.Insert(p, newAction(mockNodeView(p), func(context.Context) error {
					ctr++
					return nil
				}))
			}

			for _, p := range paths {
				assign(p)
			}

			return dt, &ctr
		}

		t.Run("Successful", func(t *testing.T) {
			dt, ctr := mkTree()
			if err := dt.ResolveSubtree(context.Background(), "/c/2/bravo"); err != nil {
				t.Errorf("eror resolving diffTree: %s", err)
			} else if *ctr != 6 {
				t.Errorf("expected ctr=6, got %d", *ctr)
			}
		})

		t.Run("Erroneous", func(t *testing.T) {
			t.Run("TopLevelErr", func(t *testing.T) {
				dt := newDiffTree(newVolatileSet())
				dt.Insert("/c/2/bravo", newAction(mockNodeView("hodor"), func(context.Context) error {
					return errors.New("derp")
				}))

				if err := dt.ResolveSubtree(context.Background(), "/c/2/bravo"); err == nil {
					t.Error("expected error; got nil")
				}
			})

			t.Run("DeepErr", func(t *testing.T) {
				dt, ctr := mkTree()
				dt.Insert("/c/2/bravo/zulu", newAction(mockNodeView(""), func(context.Context) error {
					return errors.New("derp")
				}))

				if err := dt.ResolveSubtree(context.Background(), "/c/2/bravo"); err == nil {
					t.Error("expected error; got nil")
				}

				if *ctr != 3 {
					t.Errorf("expected ctr=3, got %d", *ctr)
				}
			})
		})
	})

	// t.Run("Compute", func(t *testing.T) {
	// 	rx := radix.New()
	// for _, n := range genTestPaths() {
	// 		_, _ = rx.Insert(n.GetPath(), n)
	// 	}
	// 	lepc := &mockEndpointClient{Tree: rx}

	// 	rx = radix.New()
	// 	_, _ = rx.Insert("/", &tree.Node{Path: "/", Type: tree.NodeType_COLLECTION})
	// 	repc := &mockEndpointClient{Tree: rx}

	// 	dt := newDiffTree(newVolatileSet())
	// 	if err := dt.Compute(context.Background(), lepc, repc); err != nil {
	// 		t.Errorf("error computing diff: %s", err)
	// 	}
	// })
}

// t.Run("", func(t *testing.T) {})

package goraph

import (
	"container/heap"
	"math"
	"sort"
)

// Kruskal finds the minimum spanning tree with disjoint-set data structure.
// (http://en.wikipedia.org/wiki/Kruskal%27s_algorithm)
//
//	 0. Kruskal(G)
//	 1.
//	 2. 	A = ∅
//	 3.
//	 4. 	for each vertex v in G:
//	 5. 		MakeDisjointSet(v)
//	 6.
//	 7. 	edges = get all edges
//	 8. 	sort edges in ascending order of weight
//	 9.
//	10. 	for each edge (u, v) in edges:
//	11. 		if FindSet(u) ≠ FindSet(v):
//	12. 			A = A ∪ {(u, v)}
//	13. 			Union(u, v)
//	14.
//	15. 	return A
//
func Kruskal(g Graph) (map[Edge]struct{}, error) {

	// A = ∅
	A := make(map[Edge]struct{})

	// disjointSet maps a member Node to a represent.
	// (https://en.wikipedia.org/wiki/Disjoint-set_data_structure)
	forests := NewForests()

	// for each vertex v in G:
	for _, nd := range g.GetNodes() {
		// MakeDisjointSet(v)
		MakeDisjointSet(forests, nd.String())
	}

	// edges = get all edges
	edges := []Edge{}
	foundEdge := make(map[string]struct{})
	for id1, nd1 := range g.GetNodes() {
		tm, err := g.GetTargets(id1)
		if err != nil {
			return nil, err
		}
		for id2, nd2 := range tm {
			weight, err := g.GetWeight(id1, id2)
			if err != nil {
				return nil, err
			}
			edge := NewEdge(nd1, nd2, weight)
			if _, ok := foundEdge[edge.String()]; !ok {
				edges = append(edges, edge)
				foundEdge[edge.String()] = struct{}{}
			}
		}

		sm, err := g.GetSources(id1)
		if err != nil {
			return nil, err
		}
		for id3, nd3 := range sm {
			weight, err := g.GetWeight(id3, id1)
			if err != nil {
				return nil, err
			}
			edge := NewEdge(nd3, nd1, weight)
			if _, ok := foundEdge[edge.String()]; !ok {
				edges = append(edges, edge)
				foundEdge[edge.String()] = struct{}{}
			}
		}
	}

	// sort edges in ascending order of weight
	sort.Sort(EdgeSlice(edges))

	// for each edge (u, v) in edges:
	for _, edge := range edges {
		// if FindSet(u) ≠ FindSet(v):
		if FindSet(forests, edge.Source().String()).represent != FindSet(forests, edge.Target().String()).represent {

			// A = A ∪ {(u, v)}
			A[edge] = struct{}{}

			// Union(u, v)
			// overwrite v's represent with u's represent
			Union(forests, FindSet(forests, edge.Source().String()), FindSet(forests, edge.Target().String()))
		}
	}

	return A, nil
}

// Prim finds the minimum spanning tree with min-heap (priority queue).
// (http://en.wikipedia.org/wiki/Prim%27s_algorithm)
//
//	 0. Prim(G, source)
//	 1.
//	 2. 	let Q be a priority queue
//	 3. 	distance[source] = 0
//	 4.
//	 5. 	for each vertex v in G:
//	 6.
//	 7. 		if v ≠ source:
//	 8. 			distance[v] = ∞
//	 9. 			prev[v] = undefined
//	10.
//	11. 		Q.add_with_priority(v, distance[v])
//	12.
//	13.
//	14. 	while Q is not empty:
//	15.
//	16. 		u = Q.extract_min()
//	17.
//	18. 		for each adjacent vertex v of u:
//	19.
//	21. 			if v ∈ Q and distance[v] > weight(u, v):
//	22. 				distance[v] = weight(u, v)
//	23. 				prev[v] = u
//	24. 				Q.decrease_priority(v, weight(u, v))
//	25.
//	26.
//	27. 	return tree from prev
//
func Prim(g Graph, src ID) (map[Edge]struct{}, error) {

	// let Q be a priority queue
	minHeap := &nodeDistanceHeap{}

	// distance[source] = 0
	distance := make(map[ID]float64)
	distance[src] = 0.0

	// for each vertex v in G:
	for id := range g.GetNodes() {

		// if v ≠ src:
		if id != src {
			// distance[v] = ∞
			distance[id] = math.MaxFloat64

			// prev[v] = undefined
			// prev[v] = ""
		}

		// Q.add_with_priority(v, distance[v])
		nds := nodeDistance{}
		nds.id = id
		nds.distance = distance[id]

		heap.Push(minHeap, nds)
	}

	heap.Init(minHeap)
	prev := make(map[ID]ID)

	// while Q is not empty:
	for minHeap.Len() != 0 {

		// u = Q.extract_min()
		u := heap.Pop(minHeap).(nodeDistance)
		uID := u.id

		// for each adjacent vertex v of u:
		tm, err := g.GetTargets(uID)
		if err != nil {
			return nil, err
		}
		for vID := range tm {

			isExist := false
			for _, one := range *minHeap {
				if vID == one.id {
					isExist = true
					break
				}
			}

			// weight(u, v)
			weight, err := g.GetWeight(uID, vID)
			if err != nil {
				return nil, err
			}

			// if v ∈ Q and distance[v] > weight(u, v):
			if isExist && distance[vID] > weight {

				// distance[v] = weight(u, v)
				distance[vID] = weight

				// prev[v] = u
				prev[vID] = uID

				// Q.decrease_priority(v, weight(u, v))
				minHeap.updateDistance(vID, weight)
				heap.Init(minHeap)
			}
		}

		sm, err := g.GetSources(uID)
		if err != nil {
			return nil, err
		}
		vID := uID
		for uID := range sm {

			isExist := false
			for _, one := range *minHeap {
				if vID == one.id {
					isExist = true
					break
				}
			}

			// weight(u, v)
			weight, err := g.GetWeight(uID, vID)
			if err != nil {
				return nil, err
			}

			// if v ∈ Q and distance[v] > weight(u, v):
			if isExist && distance[vID] > weight {

				// distance[v] = weight(u, v)
				distance[vID] = weight

				// prev[v] = u
				prev[vID] = uID

				// Q.decrease_priority(v, weight(u, v))
				minHeap.updateDistance(vID, weight)
				heap.Init(minHeap)
			}
		}
	}

	tree := make(map[Edge]struct{})
	for k, v := range prev {
		weight, err := g.GetWeight(v, k)
		if err != nil {
			return nil, err
		}
		src, err := g.GetNode(v)
		if err != nil {
			return nil, err
		}
		tgt, err := g.GetNode(k)
		if err != nil {
			return nil, err
		}
		tree[NewEdge(src, tgt, weight)] = struct{}{}
	}
	return tree, nil
}

type nodeDistance struct {
	id       ID
	distance float64
}

// container.Heap's Interface needs sort.Interface, Push, Pop to be implemented

// nodeDistanceHeap is a min-heap of nodeDistances.
type nodeDistanceHeap []nodeDistance

func (h nodeDistanceHeap) Len() int           { return len(h) }
func (h nodeDistanceHeap) Less(i, j int) bool { return h[i].distance < h[j].distance } // Min-Heap
func (h nodeDistanceHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *nodeDistanceHeap) Push(x interface{}) {
	*h = append(*h, x.(nodeDistance))
}

func (h *nodeDistanceHeap) Pop() interface{} {
	heapSize := len(*h)
	lastNode := (*h)[heapSize-1]
	*h = (*h)[0 : heapSize-1]
	return lastNode
}

func (h *nodeDistanceHeap) updateDistance(id ID, val float64) {
	for i := 0; i < len(*h); i++ {
		if (*h)[i].id == id {
			(*h)[i].distance = val
			break
		}
	}
}

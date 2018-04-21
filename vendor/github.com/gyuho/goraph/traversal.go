package goraph

// BFS does breadth-first search, and returns the list of vertices.
// (https://en.wikipedia.org/wiki/Breadth-first_search)
//
//	 0. BFS(G, v):
//	 1.
//	 2. 	let Q be a queue
//	 3. 	Q.push(v)
//	 4. 	label v as visited
//	 5.
//	 6. 	while Q is not empty:
//	 7.
//	 8. 		u = Q.dequeue()
//	 9.
//	10. 		for each vertex w adjacent to u:
//	11.
//	12. 			if w is not visited yet:
//	13. 				Q.push(w)
//	14. 				label w as visited
//
func BFS(g Graph, id ID) []ID {
	if _, err := g.GetNode(id); err != nil {
		return nil
	}

	q := []ID{id}
	visited := make(map[ID]bool)
	visited[id] = true
	rs := []ID{id}

	// while Q is not empty:
	for len(q) != 0 {

		u := q[0]
		q = q[1:len(q):len(q)]

		// for each vertex w adjacent to u:
		cmap, _ := g.GetTargets(u)
		for _, w := range cmap {
			// if w is not visited yet:
			if _, ok := visited[w.ID()]; !ok {
				q = append(q, w.ID())  // Q.push(w)
				visited[w.ID()] = true // label w as visited

				rs = append(rs, w)
			}
		}
		pmap, _ := g.GetSources(u)
		for _, w := range pmap {
			// if w is not visited yet:
			if _, ok := visited[w.ID()]; !ok {
				q = append(q, w.ID())  // Q.push(w)
				visited[w.ID()] = true // label w as visited

				rs = append(rs, w.ID())
			}
		}
	}

	return rs
}

// DFS does depth-first search, and returns the list of vertices.
// (https://en.wikipedia.org/wiki/Depth-first_search)
//
//	 0. DFS(G, v):
//	 1.
//	 2. 	let S be a stack
//	 3. 	S.push(v)
//	 4.
//	 5. 	while S is not empty:
//	 6.
//	 7. 		u = S.pop()
//	 8.
//	 9. 		if u is not visited yet:
//	10.
//	11. 			label u as visited
//	12.
//	13. 			for each vertex w adjacent to u:
//	14.
//	15. 				if w is not visited yet:
//	16. 					S.push(w)
//
func DFS(g Graph, id ID) []ID {
	if _, err := g.GetNode(id); err != nil {
		return nil
	}

	s := []ID{id}
	visited := make(map[ID]bool)
	rs := []ID{}

	// while S is not empty:
	for len(s) != 0 {

		u := s[len(s)-1]
		s = s[:len(s)-1 : len(s)-1]

		// if u is not visited yet:
		if _, ok := visited[u]; !ok {
			// label u as visited
			visited[u] = true

			rs = append(rs, u)

			// for each vertex w adjacent to u:
			cmap, _ := g.GetTargets(u)
			for _, w := range cmap {
				// if w is not visited yet:
				if _, ok := visited[w.ID()]; !ok {
					s = append(s, w.ID()) // S.push(w)
				}
			}
			pmap, _ := g.GetSources(u)
			for _, w := range pmap {
				// if w is not visited yet:
				if _, ok := visited[w.ID()]; !ok {
					s = append(s, w.ID()) // S.push(w)
				}
			}
		}
	}

	return rs
}

// DFSRecursion does depth-first search recursively.
//
//	 0. DFS(G, v):
//	 1.
//	 2. 	if v is visited:
//	 3. 		return
//	 4.
//	 5. 	label v as visited
//	 6.
//	 7. 	for each vertex u adjacent to v:
//	 8.
//	 9. 		if u is not visited yet:
//	10. 			recursive DFS(G, u)
//
func DFSRecursion(g Graph, id ID) []ID {
	if _, err := g.GetNode(id); err != nil {
		return nil
	}

	visited := make(map[ID]bool)
	rs := []ID{}

	dfsRecursion(g, id, visited, &rs)

	return rs
}

func dfsRecursion(g Graph, id ID, visited map[ID]bool, rs *[]ID) {
	// base case of recursion
	//
	// if v is visited:
	if _, ok := visited[id]; ok {
		return
	}

	// label v as visited
	visited[id] = true
	*rs = append(*rs, id)

	// for each vertex u adjacent to v:
	cmap, _ := g.GetTargets(id)
	for _, u := range cmap {
		// if u is not visited yet:
		if _, ok := visited[u.ID()]; !ok {
			// recursive DFS(G, u)
			dfsRecursion(g, u.ID(), visited, rs)
		}
	}
	pmap, _ := g.GetSources(id)
	for _, u := range pmap {
		// if u is not visited yet:
		if _, ok := visited[u.ID()]; !ok {
			// recursive DFS(G, u)
			dfsRecursion(g, u.ID(), visited, rs)
		}
	}
}

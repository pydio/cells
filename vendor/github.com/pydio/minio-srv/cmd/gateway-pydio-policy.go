package cmd

import (
	"github.com/pydio/minio-srv/pkg/policy"
)

// PolicySys - policy subsystem.
type MemoryPolicySys struct {
	//sync.RWMutex
	bucketPolicyMap map[string]policy.Policy
}

// Set - sets policy to given bucket name.  If policy is empty, existing policy is removed.
func (sys *MemoryPolicySys) Set(bucketName string, policy policy.Policy) {
	/*
		sys.Lock()
		defer sys.Unlock()

		if policy.IsEmpty() {
			delete(sys.bucketPolicyMap, bucketName)
		} else {
			sys.bucketPolicyMap[bucketName] = policy
		}
	*/
}

// Remove - removes policy for given bucket name.
func (sys *MemoryPolicySys) Remove(bucketName string) {
	/*
		sys.Lock()
		defer sys.Unlock()

		delete(sys.bucketPolicyMap, bucketName)
	*/
}

// IsAllowed - checks given policy args is allowed to continue the Rest API.
func (sys *MemoryPolicySys) IsAllowed(args policy.Args) bool {
	return true

	/*
		sys.RLock()
		defer sys.RUnlock()

		// If policy is available for given bucket, check the policy.
		if p, found := sys.bucketPolicyMap[args.BucketName]; found {
			return p.IsAllowed(args)
		}

		// As policy is not available for given bucket name, returns IsOwner i.e.
		// operation is allowed only for owner.
		return args.IsOwner
	*/
}

// Init - initializes policy system from policy.json of all buckets.
func (sys *MemoryPolicySys) Init(objAPI ObjectLayer) error {
	return nil
}

// NewPolicySys - creates new policy system.
func NewMemoryPolicySys() *MemoryPolicySys {
	return &MemoryPolicySys{
		bucketPolicyMap: make(map[string]policy.Policy),
	}
}

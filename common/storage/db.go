package storage

type ProviderFunc func(driver string, dsn string) Storage

type Provider interface {
	Provide(driver string) ProviderFunc
}

type Storage interface {
	Register(driver string, dsn string, tenant string, service string)
	Get(interface{}) bool
}

var providers []Provider

func New(name string, driver string, dsn string) Storage {
	for _, provider := range providers {
		if p := provider.Provide(driver); p != nil {
			store := p(driver, dsn)
			storages = append(storages, store)
			return store
		}
	}

	return nil
}

var storages []Storage

func Get(out interface{}) bool {
	for _, store := range storages {
		if store.Get(out) {
			return true
		}
	}

	return false
}

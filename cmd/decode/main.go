package main

import (
	"context"
	"fmt"
	"github.com/ory/hydra/v2/aead"
	"github.com/ory/hydra/v2/x"
)

var _ aead.Dependencies = (*dep)(nil)

type dep struct {
	globalSecret []byte
}

func (d dep) GetGlobalSecret(ctx context.Context) ([]byte, error) {
	return d.globalSecret, nil
}

func (d dep) GetRotatedGlobalSecrets(ctx context.Context) ([][]byte, error) {
	return [][]byte{}, nil
}

func main() {
	ae := aead.NewAESGCM(&dep{
		globalSecret: x.HashStringSecret("uE-Zg_RcW5fH4COvNOozVWXjgoJXWBk~"),
	})

	all, err := ae.Decrypt(context.TODO(), `IUdUukHz0B9GoT67PEPJd6tnM2i_Uc7RDxT_wgNQKZwudA58mV-uZg14q1MoULQQd0sn18_Ppg2o-gibtEJYAdhVUg0VaC_5VwJDCBr9gj4kaf4e8A6IuWwO6ifj6MFHuIQ5Mc64t0Zzy6UeNL09Vkdt2kQEgpqvf7o0KQ4_QCoUB_LsgSLHxviKDJp2HZQjD7pWhvfLWssWpGIGLkb9clpImuhuH5hdY2WQv3xZtd6R07-xjSGeDMCdUz3YsLLUoD1MIGu4QsgBFKDWmLuJiq40kXv6rHhm06tJOPmNFjX8lMEoGo9HyNV2_kK9qpW572mDX_UfrQwBSQ60zM7iZRyzqprCU23Iud0MRumnAi9W5eSbFvARXPakop6eGAky08qnRqHSQV527UBsQWpr7sU3PYhZS97qBbdFPv4Y9Qxs6GQA-5XaG62SMqXxYbNpvPAf4hQyL1wk8W9XCsLtg6Bw6BAr8ukWLD_pRxindef3UFGWwQ1pdPpVMAW53L-NKtdhHaLmVnfigEfHK2TarEVDtVbusKhnCd_u-7HEZmzg2ttB5rYHLHdsk2dhm-t8Q-Y4dbxKb3na7AcdakcVwERjqXf0ZXnOJ5MOUXqXkJ8GrWmbyUPDEKz-MfsVXkXhBV6vA14MVK2FUlbTlOIWVqKM8RyCdG3f_FuiyybNNTAJb0ec6iyy431SpZLkypRibrzof1yPD2KvzRLCPeGrEDSQg5Wvh3PJVxkt7oZNDFO6CDFykZ0yDCKthJ76_qO9Sv7w5YXTflHGKDKyby_nWRp9tAdW5A60aPBQnAb1owYei6zDdD8_YyIxMh97rAKwa6lGYTkoUQ8cV6LQlHjBOwDRfS3zAQrX9DRStdd-glIxZhZ-tbK9IA0vK8VmEwva59lv_nqTiy_4SFFMGdaVI4qz2apmyTEQYvUNFFatJhvkA_yN3mgmbnEUIJL64-8Tr_dpBepBf0V0fxg6M3EwezNJgwnhG8fRW2TtkHpfZsmPVCcKpXmm5cOiZ2C2qeb7Tx9BtDtLBLLyXVqC9PyYlowZoS2IgBxMfdvfiCsZufF4jCsk3IHkm3lzWS-PaT8sUNbexoaygS30SIWR51jyJfmKBBU0adCAqDZ8KpIxiLdnOcYhfNhW6_Qn8_SWmNqI1r6FWOjnP2bg7nIcRsMGKbByBaK-y7im9pA1rpxyMm-dZixcA3DOPLD5cOKDCmADn9uKLP4=`, []byte{})
	fmt.Println(string(all), err)
}

package mailer

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/mailer"
	"github.com/pydio/cells/x/configx"
)

type NoOpSender struct {
	valid bool
	dump bool
	dumpFolder string
}

func (n *NoOpSender) Configure(ctx context.Context, conf configx.Values) error {
	dump := conf.Val("dump").Bool()
	if dump && conf.Val("dumpFolder").String() != "" {
		sD, _ := config.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceMailer)
		dumpFolder := strings.ReplaceAll(conf.Val("dumpFolder").String(), "{SERVICE_DIR}", sD)
		dumpFolder = strings.ReplaceAll(dumpFolder, "/", string(os.PathSeparator))
		if e:= os.MkdirAll(dumpFolder, 0755); e != nil {
			n.dump = false
			log.Logger(ctx).Warn("Cannot create dump folder for NoOp sender - Skipping dump option")
		} else {
			n.dump = true
			n.dumpFolder = dumpFolder
		}
	}
	return nil
}

func (n *NoOpSender) Send(email *mailer.Mail) error {
	if !n.valid || !n.dump {
		return nil
	}
	var to []string
	for _, u := range email.To {
		if u.Address != "" {
			to = append(to, u.Address)
		}
	}
	if len(to) == 0 {
		return fmt.Errorf("fake email : missing To address(es)")
	}

	gom, er := NewGomailMessage(email)
	if er != nil {
		return er
	}
	name := fmt.Sprintf("%s-%s.eml", to[0], time.Now().Format(time.RFC3339))
	target := filepath.Join(n.dumpFolder, name)
	if f, e := os.OpenFile(target, os.O_CREATE | os.O_WRONLY, 0644); e == nil {
		gom.WriteTo(f)
		f.Close()
	} else {
		return e
	}
	return nil
}

func (n *NoOpSender) Check(ctx context.Context) error {
	if n.valid {
		return nil
	} else {
		return fmt.Errorf("no mailer configured")
	}
}

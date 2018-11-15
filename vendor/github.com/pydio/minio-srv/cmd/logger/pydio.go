package logger

type PydioLogger interface {
	Info(entry interface{})
	Error(entry interface{})
	Audit(entry interface{})
}

type PydioTarget struct {
	logger PydioLogger
}

func (c *PydioTarget) send(entry interface{}) error {

	if logE, ok := entry.(logEntry); ok {
		if logE.Level == ErrorLvl.String() {
			c.logger.Error(entry)
		} else {
			c.logger.Info(entry)
		}
	} else if logA, ok := entry.(AuditEntry); ok {
		c.logger.Audit(logA)
	}

	c.logger.Info(entry)
	return nil
}

func NewPydioTarget(logger PydioLogger) LoggingTarget {
	return &PydioTarget{logger: logger}
}

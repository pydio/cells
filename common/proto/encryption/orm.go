package encryption

import "gorm.io/gorm/schema"

func (*Node) TableName(namer schema.Namer) string {
	return namer.TableName("nodes")
}

func (*NodeKey) TableName(namer schema.Namer) string {
	return namer.TableName("node_keys")
}

func (*RangedBlock) TableName(namer schema.Namer) string {
	return namer.TableName("node_blocks")
}

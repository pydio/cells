// Code generated by gorm.io/gen. DO NOT EDIT.
// Code generated by gorm.io/gen. DO NOT EDIT.
// Code generated by gorm.io/gen. DO NOT EDIT.

package user_model

import (
	"context"
	"strings"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"gorm.io/gen"
	"gorm.io/gen/field"

	"gorm.io/plugin/dbresolver"
)

func newUserRole(db *gorm.DB, opts ...gen.DOOption) userRole {
	_userRole := userRole{}

	_userRole.userRoleDo.UseDB(db, opts...)
	_userRole.userRoleDo.UseModel(&UserRole{})

	tableName := _userRole.userRoleDo.TableName()
	_userRole.ALL = field.NewAsterisk(tableName)
	_userRole.UUID = field.NewString(tableName, "uuid")
	_userRole.Role = field.NewString(tableName, "role")
	_userRole.Weight = field.NewInt(tableName, "weight")
	_userRole.User = userRoleBelongsToUser{
		db: db.Session(&gorm.Session{}),

		RelationField: field.NewRelation("User", "user_model.User"),
	}

	_userRole.fillFieldMap()

	return _userRole
}

type userRole struct {
	userRoleDo userRoleDo

	ALL    field.Asterisk
	UUID   field.String
	Role   field.String
	Weight field.Int
	User   userRoleBelongsToUser

	fieldMap map[string]field.Expr
}

func (u userRole) Table(newTableName string) *userRole {
	u.userRoleDo.UseTable(newTableName)
	return u.updateTableName(newTableName)
}

func (u userRole) As(alias string) *userRole {
	u.userRoleDo.DO = *(u.userRoleDo.As(alias).(*gen.DO))
	return u.updateTableName(alias)
}

func (u *userRole) updateTableName(table string) *userRole {
	u.ALL = field.NewAsterisk(table)
	u.UUID = field.NewString(table, "uuid")
	u.Role = field.NewString(table, "role")
	u.Weight = field.NewInt(table, "weight")

	u.fillFieldMap()

	return u
}

func (u *userRole) WithContext(ctx context.Context) *userRoleDo { return u.userRoleDo.WithContext(ctx) }

func (u userRole) TableName() string { return u.userRoleDo.TableName() }

func (u userRole) Alias() string { return u.userRoleDo.Alias() }

func (u userRole) Columns(cols ...field.Expr) gen.Columns { return u.userRoleDo.Columns(cols...) }

func (u *userRole) GetFieldByName(fieldName string) (field.OrderExpr, bool) {
	_f, ok := u.fieldMap[fieldName]
	if !ok || _f == nil {
		return nil, false
	}
	_oe, ok := _f.(field.OrderExpr)
	return _oe, ok
}

func (u *userRole) fillFieldMap() {
	u.fieldMap = make(map[string]field.Expr, 4)
	u.fieldMap["uuid"] = u.UUID
	u.fieldMap["role"] = u.Role
	u.fieldMap["weight"] = u.Weight

}

func (u userRole) clone(db *gorm.DB) userRole {
	u.userRoleDo.ReplaceConnPool(db.Statement.ConnPool)
	return u
}

func (u userRole) replaceDB(db *gorm.DB) userRole {
	u.userRoleDo.ReplaceDB(db)
	return u
}

type userRoleBelongsToUser struct {
	db *gorm.DB

	field.RelationField
}

func (a userRoleBelongsToUser) Where(conds ...field.Expr) *userRoleBelongsToUser {
	if len(conds) == 0 {
		return &a
	}

	exprs := make([]clause.Expression, 0, len(conds))
	for _, cond := range conds {
		exprs = append(exprs, cond.BeCond().(clause.Expression))
	}
	a.db = a.db.Clauses(clause.Where{Exprs: exprs})
	return &a
}

func (a userRoleBelongsToUser) WithContext(ctx context.Context) *userRoleBelongsToUser {
	a.db = a.db.WithContext(ctx)
	return &a
}

func (a userRoleBelongsToUser) Session(session *gorm.Session) *userRoleBelongsToUser {
	a.db = a.db.Session(session)
	return &a
}

func (a userRoleBelongsToUser) Model(m *UserRole) *userRoleBelongsToUserTx {
	return &userRoleBelongsToUserTx{a.db.Model(m).Association(a.Name())}
}

type userRoleBelongsToUserTx struct{ tx *gorm.Association }

func (a userRoleBelongsToUserTx) Find() (result *User, err error) {
	return result, a.tx.Find(&result)
}

func (a userRoleBelongsToUserTx) Append(values ...*User) (err error) {
	targetValues := make([]interface{}, len(values))
	for i, v := range values {
		targetValues[i] = v
	}
	return a.tx.Append(targetValues...)
}

func (a userRoleBelongsToUserTx) Replace(values ...*User) (err error) {
	targetValues := make([]interface{}, len(values))
	for i, v := range values {
		targetValues[i] = v
	}
	return a.tx.Replace(targetValues...)
}

func (a userRoleBelongsToUserTx) Delete(values ...*User) (err error) {
	targetValues := make([]interface{}, len(values))
	for i, v := range values {
		targetValues[i] = v
	}
	return a.tx.Delete(targetValues...)
}

func (a userRoleBelongsToUserTx) Clear() error {
	return a.tx.Clear()
}

func (a userRoleBelongsToUserTx) Count() int64 {
	return a.tx.Count()
}

type userRoleDo struct{ gen.DO }

// FilterWithLowerVal is a code snippet to filter a column using its lower value
//
// where lower(@@column) = lower(@value) (gen.M, error)
func (u userRoleDo) FilterWithLowerVal(column string, value string) {
	var params []interface{}

	var generateSQL strings.Builder
	params = append(params, value)
	generateSQL.WriteString("where lower(" + u.Quote(column) + ") = lower(?) (gen.M, error) ")

	var executeSQL *gorm.DB
	executeSQL = u.UnderlyingDB().Exec(generateSQL.String(), params...) // ignore_security_alert
	_ = executeSQL

	return
}

func (u userRoleDo) Debug() *userRoleDo {
	return u.withDO(u.DO.Debug())
}

func (u userRoleDo) WithContext(ctx context.Context) *userRoleDo {
	return u.withDO(u.DO.WithContext(ctx))
}

func (u userRoleDo) ReadDB() *userRoleDo {
	return u.Clauses(dbresolver.Read)
}

func (u userRoleDo) WriteDB() *userRoleDo {
	return u.Clauses(dbresolver.Write)
}

func (u userRoleDo) Session(config *gorm.Session) *userRoleDo {
	return u.withDO(u.DO.Session(config))
}

func (u userRoleDo) Clauses(conds ...clause.Expression) *userRoleDo {
	return u.withDO(u.DO.Clauses(conds...))
}

func (u userRoleDo) Returning(value interface{}, columns ...string) *userRoleDo {
	return u.withDO(u.DO.Returning(value, columns...))
}

func (u userRoleDo) Not(conds ...gen.Condition) *userRoleDo {
	return u.withDO(u.DO.Not(conds...))
}

func (u userRoleDo) Or(conds ...gen.Condition) *userRoleDo {
	return u.withDO(u.DO.Or(conds...))
}

func (u userRoleDo) Select(conds ...field.Expr) *userRoleDo {
	return u.withDO(u.DO.Select(conds...))
}

func (u userRoleDo) Where(conds ...gen.Condition) *userRoleDo {
	return u.withDO(u.DO.Where(conds...))
}

func (u userRoleDo) Order(conds ...field.Expr) *userRoleDo {
	return u.withDO(u.DO.Order(conds...))
}

func (u userRoleDo) Distinct(cols ...field.Expr) *userRoleDo {
	return u.withDO(u.DO.Distinct(cols...))
}

func (u userRoleDo) Omit(cols ...field.Expr) *userRoleDo {
	return u.withDO(u.DO.Omit(cols...))
}

func (u userRoleDo) Join(table schema.Tabler, on ...field.Expr) *userRoleDo {
	return u.withDO(u.DO.Join(table, on...))
}

func (u userRoleDo) LeftJoin(table schema.Tabler, on ...field.Expr) *userRoleDo {
	return u.withDO(u.DO.LeftJoin(table, on...))
}

func (u userRoleDo) RightJoin(table schema.Tabler, on ...field.Expr) *userRoleDo {
	return u.withDO(u.DO.RightJoin(table, on...))
}

func (u userRoleDo) Group(cols ...field.Expr) *userRoleDo {
	return u.withDO(u.DO.Group(cols...))
}

func (u userRoleDo) Having(conds ...gen.Condition) *userRoleDo {
	return u.withDO(u.DO.Having(conds...))
}

func (u userRoleDo) Limit(limit int) *userRoleDo {
	return u.withDO(u.DO.Limit(limit))
}

func (u userRoleDo) Offset(offset int) *userRoleDo {
	return u.withDO(u.DO.Offset(offset))
}

func (u userRoleDo) Scopes(funcs ...func(gen.Dao) gen.Dao) *userRoleDo {
	return u.withDO(u.DO.Scopes(funcs...))
}

func (u userRoleDo) Unscoped() *userRoleDo {
	return u.withDO(u.DO.Unscoped())
}

func (u userRoleDo) Create(values ...*UserRole) error {
	if len(values) == 0 {
		return nil
	}
	return u.DO.Create(values)
}

func (u userRoleDo) CreateInBatches(values []*UserRole, batchSize int) error {
	return u.DO.CreateInBatches(values, batchSize)
}

// Save : !!! underlying implementation is different with GORM
// The method is equivalent to executing the statement: db.Clauses(clause.OnConflict{UpdateAll: true}).Create(values)
func (u userRoleDo) Save(values ...*UserRole) error {
	if len(values) == 0 {
		return nil
	}
	return u.DO.Save(values)
}

func (u userRoleDo) First() (*UserRole, error) {
	if result, err := u.DO.First(); err != nil {
		return nil, err
	} else {
		return result.(*UserRole), nil
	}
}

func (u userRoleDo) Take() (*UserRole, error) {
	if result, err := u.DO.Take(); err != nil {
		return nil, err
	} else {
		return result.(*UserRole), nil
	}
}

func (u userRoleDo) Last() (*UserRole, error) {
	if result, err := u.DO.Last(); err != nil {
		return nil, err
	} else {
		return result.(*UserRole), nil
	}
}

func (u userRoleDo) Find() ([]*UserRole, error) {
	result, err := u.DO.Find()
	return result.([]*UserRole), err
}

func (u userRoleDo) FindInBatch(batchSize int, fc func(tx gen.Dao, batch int) error) (results []*UserRole, err error) {
	buf := make([]*UserRole, 0, batchSize)
	err = u.DO.FindInBatches(&buf, batchSize, func(tx gen.Dao, batch int) error {
		defer func() { results = append(results, buf...) }()
		return fc(tx, batch)
	})
	return results, err
}

func (u userRoleDo) FindInBatches(result *[]*UserRole, batchSize int, fc func(tx gen.Dao, batch int) error) error {
	return u.DO.FindInBatches(result, batchSize, fc)
}

func (u userRoleDo) Attrs(attrs ...field.AssignExpr) *userRoleDo {
	return u.withDO(u.DO.Attrs(attrs...))
}

func (u userRoleDo) Assign(attrs ...field.AssignExpr) *userRoleDo {
	return u.withDO(u.DO.Assign(attrs...))
}

func (u userRoleDo) Joins(fields ...field.RelationField) *userRoleDo {
	for _, _f := range fields {
		u = *u.withDO(u.DO.Joins(_f))
	}
	return &u
}

func (u userRoleDo) Preload(fields ...field.RelationField) *userRoleDo {
	for _, _f := range fields {
		u = *u.withDO(u.DO.Preload(_f))
	}
	return &u
}

func (u userRoleDo) FirstOrInit() (*UserRole, error) {
	if result, err := u.DO.FirstOrInit(); err != nil {
		return nil, err
	} else {
		return result.(*UserRole), nil
	}
}

func (u userRoleDo) FirstOrCreate() (*UserRole, error) {
	if result, err := u.DO.FirstOrCreate(); err != nil {
		return nil, err
	} else {
		return result.(*UserRole), nil
	}
}

func (u userRoleDo) FindByPage(offset int, limit int) (result []*UserRole, count int64, err error) {
	result, err = u.Offset(offset).Limit(limit).Find()
	if err != nil {
		return
	}

	if size := len(result); 0 < limit && 0 < size && size < limit {
		count = int64(size + offset)
		return
	}

	count, err = u.Offset(-1).Limit(-1).Count()
	return
}

func (u userRoleDo) ScanByPage(result interface{}, offset int, limit int) (count int64, err error) {
	count, err = u.Count()
	if err != nil {
		return
	}

	err = u.Offset(offset).Limit(limit).Scan(result)
	return
}

func (u userRoleDo) Scan(result interface{}) (err error) {
	return u.DO.Scan(result)
}

func (u userRoleDo) Delete(models ...*UserRole) (result gen.ResultInfo, err error) {
	return u.DO.Delete(models)
}

func (u *userRoleDo) withDO(do gen.Dao) *userRoleDo {
	u.DO = *do.(*gen.DO)
	return u
}

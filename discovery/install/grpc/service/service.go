package service

import (
	"context"
	"fmt"
	"os"
	"reflect"
	"strings"
	"time"

	"github.com/go-logr/zapr"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/anypb"
	yaml "gopkg.in/yaml.v3"
	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	k8sruntime "k8s.io/apimachinery/pkg/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/builder"
	"sigs.k8s.io/controller-runtime/pkg/cache"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/event"
	"sigs.k8s.io/controller-runtime/pkg/handler"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"sigs.k8s.io/controller-runtime/pkg/predicate"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	grpc2 "github.com/pydio/cells/v5/common/client/grpc"
	cconfig "github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/config"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/install"
	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/server/generic"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
	gh "github.com/pydio/cells/v5/discovery/install/grpc"
	"github.com/pydio/cells/v5/discovery/install/lib"
)

var Name = common.ServiceGrpcNamespace_ + common.ServiceInstall

func init() {

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Services Migration"),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				handler := new(gh.Handler)
				service2.RegisterMigrateServiceServer(server, handler)
				return nil
			}),
		)
	})

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGenericNamespace_+common.ServiceInstall),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("Cells kubernetes controller"),
			service.WithGeneric(func(ctx context.Context, srv *generic.Server) error {

				if os.Getenv("CELLS_START_K8S_MANAGER") == "true" {
					scheme := k8sruntime.NewScheme()
					_ = clientgoscheme.AddToScheme(scheme)
					_ = batchv1.AddToScheme(scheme)
					_ = corev1.AddToScheme(scheme)

					ns := os.Getenv("POD_NAMESPACE")

					mgr, err := manager.New(ctrl.GetConfigOrDie(), manager.Options{
						BaseContext: func() context.Context {
							return ctx
						},
						Scheme: scheme,
						Cache: cache.Options{
							DefaultNamespaces: map[string]cache.Config{
								ns: {},
							},
						},
					})

					if err != nil {
						fmt.Println("Unable to start manager", err)
						os.Exit(1)
					}

					secretReconciler := &SecretReconciler{
						Client:     mgr.GetClient(),
						Scheme:     mgr.GetScheme(),
						TargetName: os.Getenv("CELLS_START_K8S_MANAGER_SECRET"),
					}

					// Predicates: only reconcile on real changes.
					// Note: Secrets don't bump .metadata.generation on data changes,
					// so we compare relevant fields manually.
					secretChanged := predicate.Funcs{
						CreateFunc: func(e event.CreateEvent) bool {
							return allowByTarget(secretReconciler, e.Object)
						},
						UpdateFunc: func(e event.UpdateEvent) bool {
							if !allowByTarget(secretReconciler, e.ObjectNew) {
								return false
							}
							oldS, ok1 := e.ObjectOld.(*corev1.Secret)
							newS, ok2 := e.ObjectNew.(*corev1.Secret)
							if !ok1 || !ok2 {
								return true // be safe
							}
							dataChanged := !reflect.DeepEqual(oldS.Data, newS.Data)
							typeChanged := oldS.Type != newS.Type
							lblChanged := !reflect.DeepEqual(oldS.Labels, newS.Labels)
							annChanged := !reflect.DeepEqual(oldS.Annotations, newS.Annotations)
							return dataChanged || typeChanged || lblChanged || annChanged
						},
						DeleteFunc: func(e event.DeleteEvent) bool {
							return allowByTarget(secretReconciler, e.Object)
						},
						GenericFunc: func(e event.GenericEvent) bool { return false },
					}

					// Build controller.
					if err := builder.
						ControllerManagedBy(mgr).
						For(&corev1.Secret{}, builder.WithPredicates(secretChanged)).
						Watches(&corev1.Secret{}, &handler.EnqueueRequestForObject{}, builder.WithPredicates(secretChanged)). // redundant but explicit
						Complete(secretReconciler); err != nil {
						panic(err)
					}

					configMapReconciler := &ConfigMapReconciler{
						Client:     mgr.GetClient(),
						Scheme:     mgr.GetScheme(),
						TargetName: os.Getenv("CELLS_START_K8S_MANAGER_CONFIGMAP"),
					}

					// Predicates: only reconcile on real changes.
					// Note: Secrets don't bump .metadata.generation on data changes,
					// so we compare relevant fields manually.
					configMapChanged := predicate.Funcs{
						CreateFunc: func(e event.CreateEvent) bool {
							return allowConfigMapByTarget(configMapReconciler, e.Object)
						},
						UpdateFunc: func(e event.UpdateEvent) bool {
							if !allowConfigMapByTarget(configMapReconciler, e.ObjectNew) {
								return false
							}
							oldS, ok1 := e.ObjectOld.(*corev1.Secret)
							newS, ok2 := e.ObjectNew.(*corev1.Secret)
							if !ok1 || !ok2 {
								return true // be safe
							}
							dataChanged := !reflect.DeepEqual(oldS.Data, newS.Data)
							typeChanged := oldS.Type != newS.Type
							lblChanged := !reflect.DeepEqual(oldS.Labels, newS.Labels)
							annChanged := !reflect.DeepEqual(oldS.Annotations, newS.Annotations)
							return dataChanged || typeChanged || lblChanged || annChanged
						},
						DeleteFunc: func(e event.DeleteEvent) bool {
							return allowConfigMapByTarget(configMapReconciler, e.Object)
						},
						GenericFunc: func(e event.GenericEvent) bool { return false },
					}

					// Controller for ConfigMaps
					if err := builder.
						ControllerManagedBy(mgr).
						For(&corev1.ConfigMap{}, builder.WithPredicates(configMapChanged)).
						Watches(&corev1.ConfigMap{}, &handler.EnqueueRequestForObject{}, builder.WithPredicates(configMapChanged)).
						Complete(configMapReconciler); err != nil {
						panic(err)
					}

					zl := zap.New(log.Logger(ctx).Core())

					ctrl.SetLogger(zapr.NewLogger(zl))
					if err := mgr.Start(ctrl.SetupSignalHandler()); err != nil {
						fmt.Println("Problem running manager", err)
						os.Exit(1)
					}
				}

				return nil
			}))
	})
}

func allowByTarget(r *SecretReconciler, obj client.Object) bool {
	if r.TargetName == "" {
		// All secrets (optionally limited by mgr Namespace)
		return true
	}
	// Watch only a single Secret name (and namespace if set)
	if r.TargetNamespace != "" && obj.GetNamespace() != r.TargetNamespace {
		return false
	}

	return obj.GetName() == r.TargetName
}

func allowConfigMapByTarget(r *ConfigMapReconciler, obj client.Object) bool {
	if r.TargetName == "" {
		// All secrets (optionally limited by mgr Namespace)
		return true
	}
	// Watch only a single Secret name (and namespace if set)
	if r.TargetNamespace != "" && obj.GetNamespace() != r.TargetNamespace {
		return false
	}

	return obj.GetName() == r.TargetName
}

// Reconciler that reacts to Secret changes.
type SecretReconciler struct {
	client.Client
	Scheme *k8sruntime.Scheme

	// Optional: limit to a single secret
	// If both fields are non-empty, only that Secret will trigger reconciles.
	TargetNamespace string
	TargetName      string
}

func (r *SecretReconciler) Reconcile(ctx context.Context, req reconcile.Request) (reconcile.Result, error) {
	logger := log.Logger(ctx)
	logger.Info("Reconciling Secret", zap.String("ns", req.Namespace), zap.String("name", req.Name))

	var secret corev1.Secret
	if err := r.Get(ctx, req.NamespacedName, &secret); err != nil {
		if errors.IsNotFound(err) {
			// Secret deleted; you can react here if you need to clean up.
			logger.Info("Secret deleted", zap.String("ns", req.Namespace), zap.String("name", req.Name))
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	// ---- Your logic goes here ----
	username := string(secret.Data["username"])
	password := string(secret.Data["password"])

	if username == "" {
		return reconcile.Result{}, nil
	}

	client := idmc.UserServiceClient(ctx)
	users, err := searchUser(ctx, client, string(username))
	if err != nil {
		logger.Error("Cannot list users for login", zap.String("username", username), zap.Error(err))
		return reconcile.Result{}, err
	}

	for _, user := range users {
		user.Password = string(password)
		if user.Attributes == nil {
			user.Attributes = make(map[string]string, 1)
		}
		user.Attributes["profile"] = common.PydioProfileAdmin

		if _, err := client.CreateUser(ctx, &idm.CreateUserRequest{
			User: user,
		}); err != nil {
			logger.Error("could not update password, skipping and continuing", zap.String("username", username), zap.Error(err))
			return reconcile.Result{}, err
		} else {
			logger.Info("user successfully updated", zap.String("username", username))
		}
	}
	// ------------------------------

	return reconcile.Result{}, nil
}

func searchUser(ctx context.Context, cli idm.UserServiceClient, login string) ([]*idm.User, error) {

	singleQ := &idm.UserSingleQuery{Login: login}
	query, _ := anypb.New(singleQ)

	mainQuery := &service2.Query{SubQueries: []*anypb.Any{query}}

	stream, err := cli.SearchUser(ctx, &idm.SearchUserRequest{Query: mainQuery})
	if err != nil {
		return nil, err
	}

	users := []*idm.User{}

	for {
		response, e := stream.Recv()
		if e != nil {
			break
		}
		if response == nil {
			continue
		}

		currUser := response.GetUser()
		if currUser.IsGroup {
			continue
		}

		if len(users) >= 50 {
			fmt.Println("Maximum of users that can be edited at a time reached. Truncating the list. Please refine you search.")
			break
		}
		users = append(users, currUser)
	}
	return users, nil
}

// Reconciler that reacts to ConfigMap changes.
type ConfigMapReconciler struct {
	client.Client
	Scheme *k8sruntime.Scheme

	// Optional: limit to a single configMap
	// If both fields are non-empty, only that ConfigMap will trigger reconciles.
	TargetNamespace string
	TargetName      string
}

func (r *ConfigMapReconciler) Reconcile(ctx context.Context, req reconcile.Request) (reconcile.Result, error) {
	logger := log.Logger(ctx)
	logger.Info("Reconciling ConfigMap", zap.String("ns", req.Namespace), zap.String("name", req.Name))

	var configMap corev1.ConfigMap
	if err := r.Get(ctx, req.NamespacedName, &configMap); err != nil {
		if errors.IsNotFound(err) {
			// ConfigMap deleted; you can react here if you need to clean up.
			logger.Info("ConfigMap deleted", zap.String("ns", req.Namespace), zap.String("name", req.Name))
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	// ---- Your logic goes here ----
	data := configMap.Data["install-conf.yaml"]
	if data == "" {
		return reconcile.Result{}, nil
	}

	confFromFile := &install.InstallConfig{}
	if err := yaml.Unmarshal([]byte(data), confFromFile); err != nil {
		return reconcile.Result{}, err
	}

	cli := config.NewConfigClient(grpc2.ResolveConn(ctx, common.ServiceConfigGRPC))
	for k, v := range confFromFile.CustomConfigs {
		keyArgs := strings.SplitN(k, "#", 2)
		format := ""
		key := keyArgs[0]
		if len(keyArgs) > 1 {
			format = keyArgs[1]
		}
		in := &config.SetRequest{
			Namespace: "config",
			Path:      key,
			Value: &config.Value{
				Data:   []byte(v),
				Format: format,
			},
		}
		_, err := cli.Set(ctx, in)
		if err != nil {
			return reconcile.Result{}, err
		}
	}
	if _, err := cli.Save(ctx, &config.SaveRequest{User: "controller", Message: "Update to the custom configs"}); err != nil {
		return reconcile.Result{}, err
	}

	cp, err := openurl.OpenPool(ctx, []string{"grpc://"}, func(ctx context.Context, url string) (cconfig.Store, error) {
		c, err := cconfig.OpenStore(ctx, "grpc://")
		if err != nil {
			return nil, err
		}

		return c, nil
	})

	ctx = propagator.With(ctx, cconfig.ContextKey, cp)

	// Merge with GetDefaults()
	err = lib.MergeWithDefaultConfig(confFromFile)
	if err != nil {
		return reconcile.Result{}, fmt.Errorf("Could not merge conf with defaults: %v", err)
	}

	// Check if pre-configured DB is up and running
	nbRetry := 20
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	for attempt := 1; attempt <= nbRetry; attempt++ {
		if res, _ := lib.PerformCheck(ctx, "DB", confFromFile); res.Success {
			break
		}
		if attempt == nbRetry {
			logger.Error("[Error] Cannot connect to database, you should double check your server and your connection configuration.")
			return reconcile.Result{}, fmt.Errorf("No DB. Aborting...")
		}
		logger.Error("... Cannot connect to database, wait before retry")
		select {
		case <-ctx.Done():
			logger.Error("[Error] Retries interrupted by user, aborting...")
			return reconcile.Result{}, ctx.Err()
		case <-ticker.C:
		}
	}

	err = lib.Install(ctx, confFromFile, lib.InstallDb, func(event *lib.InstallProgressEvent) {
		logger.Info("Install progress", zap.String("ns", req.Namespace), zap.String("name", req.Name), zap.Any("event", event.Message))
	})
	if err != nil {
		return reconcile.Result{}, fmt.Errorf("error while performing installation: %s", err.Error())
	}
	// ------------------------------

	return reconcile.Result{}, nil
}

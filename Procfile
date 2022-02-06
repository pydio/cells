seed: ./cells start --port_registry 8000 --port_broker 8003 pydio.grpc.registry pydio.grpc.broker

# cluster
cluster1: ./cells cluster start --port_registry 9000 --port_broker 9003 --registry grpc://localhost:8000 --broker grpc://localhost:8003 --nats_streaming_cluster_node_id 1
cluster2: ./cells cluster start --port_registry 9100 --port_broker 9103 --registry grpc://localhost:8000 --broker grpc://localhost:8003 --nats_streaming_cluster_node_id 2
cluster3: ./cells cluster start --port_registry 9200 --port_broker 9203 --registry grpc://localhost:8000 --broker grpc://localhost:8003 --nats_streaming_cluster_node_id 3

cluster1d: debug ./cells cluster start --port_registry 9000 --port_broker 9003 --registry grpc://localhost:8000 --broker grpc://localhost:8003 --nats_streaming_cluster_node_id 1
cluster2d: debug ./cells cluster start --port_registry 9100 --port_broker 9103 --registry grpc://localhost:8000 --broker grpc://localhost:8003 --nats_streaming_cluster_node_id 2  

# cluster with nats
#nats1: ./cells cluster start --port_registry 9000 --port_broker 9003 --registry nats://localhost:4222 --broker nats://localhost:4222 --nats_streaming_cluster_node_id 1
#nats2: ./cells cluster start --port_registry 9100 --port_broker 9103 --registry nats://localhost:4222 --broker nats://localhost:4222 --nats_streaming_cluster_node_id 2 
#nats3: ./cells cluster start --port_registry 9100 --port_broker 9103 --registry nats://localhost:4222 --broker nats://localhost:4222 --nats_streaming_cluster_node_id 3

# nodes
node1: ./cells start --bind 0.0.0.0:8080 --config remote --port_registry 10000 --port_broker 10003 --registry grpc://localhost:9000 --broker grpc://localhost:9003
node2: ./cells start --bind 0.0.0.0:8081 --config remote --port_registry 10100 --port_broker 10103 --registry grpc://localhost:9100 --broker grpc://localhost:9103
node3: ./cells start --bind 0.0.0.0:8082 --config remote --port_registry 10200 --port_broker 10203 --registry grpc://localhost:9200 --broker grpc://localhost:9203


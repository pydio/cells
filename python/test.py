from concurrent import futures

import grpc
import cells_auth_pb2
import cells_auth_pb2_grpc
import cells_registry_pb2
import cells_registry_pb2_grpc
import cells_idm_pb2
import cells_idm_pb2_grpc
from grpc_health.v1 import health
from grpc_health.v1 import health_pb2_grpc

class VerifyProvider(cells_auth_pb2_grpc.AuthTokenVerifierServicer):
    def Verify(self, request, context):
        print("Verifying")
        return cells_auth_pb2.VerifyTokenResponse(
            Success=True,
            Data="{\"sub\": \"ee43ecf4-6c9e-4eab-ba85-6fdf746c3724\"}".encode(encoding='UTF-8'),
        )

class RefreshProvider(cells_auth_pb2_grpc.AuthTokenRefresherServicer):
    def Refresh(self, request, context):
        print("Refreshing")
        return cells_auth_pb2.RefreshTokenResponse(
            AccessToken="thisisanaccesstoken",
            IDToken="thisisanidtoken",
            RefreshToken="thisisarefreshtoken",
            Expiry=1000,
        )


class PasswordCredentialsCodeProvider(cells_auth_pb2_grpc.PasswordCredentialsCodeServicer):
    def PasswordCredentialsCode(self, request, context):
        print(request)

        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')

class PasswordCredentialsTokenProvider(cells_auth_pb2_grpc.PasswordCredentialsTokenServicer):
    def PasswordCredentialsToken(self, request, context):
        print("Returning here")
        return cells_auth_pb2.PasswordCredentialsTokenResponse(
            AccessToken="thisisanaccesstoken",
            IDToken="thisisanidtoken",
            RefreshToken="thisisarefreshtoken",
            Expiry=1000,
        )

class UserProvider(cells_idm_pb2_grpc.UserServiceServicer):
    def SearchUser(self, request, context):
        print("Doing search user")
        yield cells_idm_pb2.SearchUserResponse(
            User=cells_idm_pb2.User(
                Uuid="admin",
                GroupPath="python",
                Attributes={
                    "profile": "admin",
                },
                Roles=[
                    cells_idm_pb2.Role(
                        Uuid="ROOT_GROUP",
                    ),
                    cells_idm_pb2.Role(
                       Uuid="ADMINS"
                    ),
                    cells_idm_pb2.Role(
                        Uuid="ee43ecf4-6c9e-4eab-ba85-6fdf746c3724",
                    ),
                ],
                Login="admin",
                IsGroup=False,

            )
        )

    def CountUser(self, request, context):
        print("Counting")
        return cells_idm_pb2.CountUserResponse(
            Count=1,
        )


def main():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    # cells_auth_pb2_grpc.add_PasswordCredentialsCodeServicer_to_server()
    health_servicer = health.HealthServicer(
        experimental_non_blocking=True,
        experimental_thread_pool=futures.ThreadPoolExecutor(max_workers=10))
    health_pb2_grpc.add_HealthServicer_to_server(health_servicer, server)

    cells_auth_pb2_grpc.add_PasswordCredentialsCodeServicer_to_server(PasswordCredentialsCodeProvider(), server)
    cells_auth_pb2_grpc.add_PasswordCredentialsTokenServicer_to_server(PasswordCredentialsTokenProvider(), server)
    cells_auth_pb2_grpc.add_AuthTokenVerifierServicer_to_server(VerifyProvider(), server)
    cells_auth_pb2_grpc.add_AuthTokenRefresherServicer_to_server(RefreshProvider(), server)
    cells_idm_pb2_grpc.add_UserServiceServicer_to_server(UserProvider(), server)

    channel = grpc.insecure_channel('localhost:8002')
    stub = cells_registry_pb2_grpc.RegistryStub(channel)

    srv = cells_registry_pb2.Item(
        id="python-oauth-server",
        name="grpc",
        metadata={
            "status": "ready",
        },
        server=cells_registry_pb2.Server(
            protocol="grpc",
        ),
    )
    stub.Register(srv)

    address = cells_registry_pb2.Item(
        id="python-oauth-address",
        name="127.0.0.1:50051",
        generic=cells_registry_pb2.Generic(
            type=cells_registry_pb2.ItemType.ADDRESS
        )
    )
    stub.Register(address)

    authService = cells_registry_pb2.Item(
        id="python-oauth-service",
        name="pydio.grpc.oauth",
        metadata={
            "status": "ready",
        },
        service=cells_registry_pb2.Service(
            version="1",
        )
    )

    authService.service.tags.append("tag-idm")
    stub.Register(authService)

    userService = cells_registry_pb2.Item(
        id="python-user-service",
        name="pydio.grpc.user",
        metadata={
            "status": "ready",
        },
        service=cells_registry_pb2.Service(
            version="1",
        )
    )

    userService.service.tags.append("tag-idm")
    stub.Register(userService)

    edge = cells_registry_pb2.Item(
        id="edge-address-server",
        name="edge-address-server",
        edge=cells_registry_pb2.Edge(
            vertices=["python-oauth-server", "python-oauth-address"]
        )
    )
    stub.Register(edge)

    edge = cells_registry_pb2.Item(
        id="edge-service-server-oauth",
        name="edge-service-server-oauth",
        edge=cells_registry_pb2.Edge(
            vertices=["python-oauth-server", "python-oauth-service"]
        )
    )
    stub.Register(edge)

    edge = cells_registry_pb2.Item(
        id="edge-service-server-user",
        name="edge-service-server-user",
        edge=cells_registry_pb2.Edge(
            vertices=["python-oauth-server", "python-user-service"]
        )
    )
    stub.Register(edge)

    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()


if __name__ == '__main__':
    main()
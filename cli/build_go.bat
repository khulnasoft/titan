cd ..\crates\titanrepo-ffi
cargo build --target x86_64-pc-windows-gnu --target-dir .\target
if %errorlevel% neq 0 exit /b %errorlevel%
copy .\target\x86_64-pc-windows-gnu\debug\libtitanrepo_ffi.a ..\..\cli\internal\ffi\libtitanrepo_ffi_windows_amd64.a
copy .\bindings.h ..\..\cli\internal\ffi\bindings.h

cd ..\..\cli

protoc -I..\crates\ ..\crates\titanrepo-ffi\messages.proto --go_out=.\internal\
if %errorlevel% neq 0 exit /b %errorlevel%

protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative internal\titandprotocol\titand.proto
if %errorlevel% neq 0 exit /b %errorlevel%

SET CGO_ENABLED=1
go build -tags=rust -o go-titan.exe .\cmd\titan
if %errorlevel% neq 0 exit /b %errorlevel%

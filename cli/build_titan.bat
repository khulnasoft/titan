cd ..\crates\titanrepo
cargo build --target x86_64-pc-windows-gnu
if %errorlevel% neq 0 exit /b %errorlevel%

copy ..\..\target\x86_64-pc-windows-gnu\debug\titan.exe ..\..\target\debug\titan.exe
cd ..\..\cli

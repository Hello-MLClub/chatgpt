# chatgpt

## OpenClaw Windows 安装脚本

仓库中提供了 `install-openclaw-win.ps1`，可在 Windows PowerShell（建议管理员）下自动完成：

- 安装依赖（Git/CMake/VS Build Tools/VC++ 运行库）
- 拉取 OpenClaw 源码
- 编译 Release 版本
- 拷贝 `OpenClaw.exe` 到目标目录

### 使用方式

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\install-openclaw-win.ps1 -InstallDir "C:\Games\OpenClaw" -Version "v1.0"
```

安装后请把原版 Captain Claw 的游戏数据文件（如 `*.PID`、`*.WWD` 等）复制到安装目录，再运行 `OpenClaw.exe`。

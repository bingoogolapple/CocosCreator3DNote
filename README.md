# Cocos Creator 3D 学习笔记

## 自动编译并刷新

- 全局安装 nodemon

```shell
npm i -g nodemon
```

- 监听到 assets/scripts 目录中的 ts 文件变化后自动重新编译并刷新浏览器

```shell
nodemon --watch assets/scripts --ext "ts" --exec "curl http://localhost:7456/asset-db/refresh"
```

- 也可以配置到 tasks.json 中。command + shift + B，然后选择 Cocos Creator auto compile

```json
{
  // See https://go.microsoft.com/fwlink/?LinkId=733558
  // for the documentation about the tasks.json format
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Cocos Creator compile",
      "command": "curl",
      "args": ["http://localhost:7456/asset-db/refresh"],
      "type": "shell",
      "isBackground": true,
      "group": "build",
      "presentation": {
        "reveal": "always"
      },
      "problemMatcher": []
    },
    {
      "label": "Cocos Creator auto compile",
      "type": "shell",
      "command": "nodemon",
      "args": [
        "--watch",
        "assets/scripts",
        "--ext",
        "ts",
        "--exec",
        "curl http://localhost:7456/asset-db/refresh"
      ],
      "isBackground": true,
      "group": "build",
      "presentation": {
        "reveal": "always"
      },
      "problemMatcher": []
    }
  ]
}
```

- 也可以配置到 launch.json 中

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Cocos Creator Launch Chrome against localhost",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:7456",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Cocos Creator auto compile",
      "request": "launch",
      "type": "node",
      "runtimeExecutable": "nodemon",
      "args": [
        "--watch",
        "assets/scripts",
        "--ext",
        "ts",
        "--exec",
        "curl http://localhost:7456/asset-db/refresh"
      ],
      "console": "integratedTerminal",
      "protocol": "inspector"
    }
  ]
}
```

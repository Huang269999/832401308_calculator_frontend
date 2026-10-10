# 前端代码规范

## 规范来源

本项目主要参考 **Google JavaScript Style Guide**，并结合现代 HTML/CSS/JavaScript 的常用工程实践。

参考：<https://google.github.io/styleguide/jsguide.html>

## 主要约定

1. HTML 使用语义化标签和 4 空格缩进。
2. CSS 类名使用可读的 kebab-case，例如 `.history-item`。
3. JavaScript 变量和函数使用 `camelCase`，常量使用 `UPPER_SNAKE_CASE`。
4. 优先使用 `const`，需要重新赋值时使用 `let`，不使用 `var`。
5. 使用严格职责分工：前端不实现核心数学计算，不使用 `eval`。
6. API 请求统一通过 `requestJson()` 处理响应和异常。
7. 用户/数据库文本使用 `textContent` 写入 DOM，避免直接拼接为 HTML。
8. 事件处理逻辑尽量拆分为清晰的具名函数。
9. 页面必须兼顾桌面端和移动端响应式显示。
10. 提交前检查浏览器控制台无明显错误，并验证后端离线时前端不能产生新结果。

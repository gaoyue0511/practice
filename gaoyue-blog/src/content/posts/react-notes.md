---
title: 我常用的一些 React 小技巧
date: 2026-10-28
tags: [前端, React]
description: 记录几个在日常开发中反复用到的 React 写法与心得。
---

用 React 写页面久了，会沉淀出一些顺手的小习惯。这篇文章记录其中几个。

## 用组合代替继承

React 里几乎不需要继承，把组件当作积木组合即可。

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <section className="card">{children}</section>
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="card-title">{children}</h3>
}
```

## 派生状态不要放进 state

能从现有 props 或 state 算出来的值，直接计算就好，避免状态不同步。

```tsx
const visiblePosts = posts.filter((post) => post.title.includes(keyword))
```

## 用自定义 Hook 收敛逻辑

请求、订阅、定时器这类副作用，封装成 Hook 之后页面会清爽很多。

| 场景 | 建议 |
| --- | --- |
| 表单 | 受控组件 + 校验函数 |
| 列表 | 使用稳定的 key，避免用下标 |
| 异步 | 统一处理 loading 与 error |

## 小结

保持组件小而专注，比追求复杂的抽象更重要。

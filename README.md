# 金融学·从简到难

一张地图，三类读者，100 个节点。零基础成年人、经管/金融学生、投资实操者共用同一张知识地图，按「入门 → 进阶 → 高阶」分层，用前置关系串成路径。

## 当前进度

- **批 1–4 · 已完成**：站点骨架、100 节点章表、**40 章完整课文**、其余 60 章为带 5–6 条实质要点的骨架章、21 张 Canvas 图表、知识图谱与三泳道总览、离线母版。

## 两种形态

| 形态 | 路径 | 用途 |
|---|---|---|
| 线上多文件 | `.deploy/github-site/` | 开发主形态，上传整个目录到静态托管即可 |
| 本地单文件母版 | `金融学从简到难_母版.html` | 插图 base64 内嵌，双击即开，可离线阅读与打印 |

重新打包母版：

```bash
python _build_master.py
```

## 目录

```
index.html            入口 + loader
app.css               设计系统（淡蓝纸本 · 墨蓝 · 朱印）
js/registry.js        唯一权威章表 REG（100 节点，slug 键）
js/visuals.js         12 卷几何徽记 / 知识星图 / 章头印记（内联 SVG）
js/skeleton_notes.js  60 个骨架章的扩展要点（5–6 条/章）
js/terms.js           术语中英对照
js/formula.js         公式手册
js/charts.js          Canvas 2D 图表（CH 尺寸表 + prep()）
js/nav.js             侧栏、章节切换、搜索、首页
js/overview.js        学习总览三泳道 + 位置卡
js/kg2d.js / kg3d.js  2D 环形 / 3D 椭球知识图谱
js/boot.js            REG 自检 + 骨架章自动生成
chapters/volN.js      按卷存放完整课文
assets/               水彩插画
```

## 技术约定

- **零依赖**：无框架、无构建、无 CDN；图表全部 Canvas 2D 手绘。
- **slug 分发**：所有查找以 `REG[].id` 为键，禁止用数字下标。旧站曾因插章后 `drawFor` 下标未跟上导致图表画空，本站由 `boot.js` 的自检兜底。
- **骨架章**：`d === '骨'` 的节点由 `boot.js` 自动生成章节骨架，含标题、前置/延伸、要点，后续批次只需替换成完整课文。
- **无痕**：不写 localStorage、不改 URL hash、不接实时行情。
- **旧内核兼容**：避免 `inset` / `padStart` / `clamp()`；Grid 仅作 `@supports` 渐进增强。
- **内容边界**：示例一律用虚构主体与假设数据，不构成投资建议。

## 发布

把 `.deploy/github-site/` 整个目录上传到 GitHub Pages（或任意静态托管）即可。Pages 约 40 秒后重建。

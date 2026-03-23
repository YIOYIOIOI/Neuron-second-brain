# Advanced Block Editor

高级块编辑器系统，提供类似 Notion 的编辑体验。

## 功能特性

### 1. Slash 命令系统 (/)
在编辑器中输入 `/` 会弹出命令菜单：
- `/` + `Text` - 普通文本段落
- `/` + `Heading 1` - 一级标题
- `/` + `Heading 2` - 二级标题
- `/` + `Heading 3` - 三级标题
- `/` + `Bullet List` - 无序列表
- `/` + `Code Block` - 代码块

**交互方式：**
- 键盘上下键选择
- Enter 确认
- Esc 关闭

### 2. Markdown 快捷语法
自动识别 Markdown 语法并转换：
- `# ` → 一级标题
- `## ` → 二级标题
- `### ` → 三级标题
- `- ` → 无序列表
- ` ``` ` → 代码块

### 3. @ 引用系统
输入 `@` 可以引用知识库中的其他知识：
- 输入 `@` 弹出知识列表
- 支持搜索过滤
- 选择后插入引用标签
- 自动记录引用关系

### 4. Block 合并与拆分
- **Enter** - 在当前位置拆分 block
- **Backspace** (光标在开头) - 与上一个 block 合并
- **Delete** (光标在末尾) - 与下一个 block 合并

### 5. 代码高亮
使用 lowlight 提供语法高亮支持，支持常见编程语言。

## 技术实现

### 核心依赖
- `@tiptap/react` - 编辑器核心
- `@tiptap/extension-code-block-lowlight` - 代码块高亮
- `lowlight` - 语法高亮引擎
- `tippy.js` - 浮层菜单

### 组件结构
```
/components/editor
  ├── AdvancedBlockEditor.tsx  # 主编辑器组件
  ├── SlashMenu.tsx            # Slash 命令菜单
  └── index.ts                 # 导出文件
```

### 使用方式
```tsx
import { AdvancedBlockEditor } from '@/components/editor';

<AdvancedBlockEditor
  content={content}
  onChange={setContent}
  placeholder="Type / for commands, @ to mention"
/>
```

## 未来扩展

可以继续添加的功能：
- Block 拖拽排序 (使用 @dnd-kit)
- 多 Block 选择
- 更多 Block 类型（图片、表格、嵌入等）
- 协作编辑
- 版本历史

## 性能优化

- 每个 block 独立渲染
- 使用 TipTap 的增量更新
- 避免不必要的重渲染

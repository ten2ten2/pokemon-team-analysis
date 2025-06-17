# 🎨 样式使用指南

本文档介绍了项目中可用的公共样式类及其使用方法。

## 📋 目录

- [按钮样式](#按钮样式)
- [表单样式](#表单样式)
- [模态框样式](#模态框样式)
- [焦点样式](#焦点样式)
- [导航样式](#导航样式)
- [文字样式](#文字样式)
- [使用示例](#使用示例)

## 🔘 按钮样式

### 基础按钮类
```css
.btn-base       /* 基础按钮样式 */
.btn-primary    /* 主要按钮（红色） */
.btn-secondary  /* 次要按钮（灰色） */
```

### 使用示例
```vue
<!-- 主要按钮 -->
<button class="btn-primary focus-ring-red">
  保存
</button>

<!-- 次要按钮 -->
<button class="btn-secondary focus-ring-gray">
  取消
</button>
```

## 📝 表单样式

### 表单元素类
```css
.form-label     /* 表单标签 */
.form-input     /* 输入框 */
.form-select    /* 选择框 */
.form-textarea  /* 文本域 */
```

### 使用示例
```vue
<div>
  <label for="name" class="form-label">名称</label>
  <input id="name" class="form-input" type="text" />
</div>

<div>
  <label for="category" class="form-label">类别</label>
  <select id="category" class="form-select">
    <option>选项1</option>
  </select>
</div>

<div>
  <label for="description" class="form-label">描述</label>
  <textarea id="description" class="form-textarea h-32"></textarea>
</div>
```

## 🪟 模态框样式

### 模态框组件类
```css
.modal-overlay    /* 模态框遮罩层 */
.modal-container  /* 模态框容器 */
.modal-header     /* 模态框头部 */
.modal-content    /* 模态框内容区域 */
.modal-footer     /* 模态框底部 */
.modal-close-btn  /* 关闭按钮 */
```

### 使用示例
```vue
<div class="modal-overlay">
  <div class="modal-container">
    <div class="modal-header">
      <h2>标题</h2>
      <button class="modal-close-btn">×</button>
    </div>
    <div class="modal-content">
      <!-- 内容 -->
    </div>
    <div class="modal-footer">
      <button class="btn-secondary">取消</button>
      <button class="btn-primary">确认</button>
    </div>
  </div>
</div>
```

## 🎯 焦点样式

### 焦点环类
```css
.focus-ring       /* 基础焦点环 */
.focus-ring-red   /* 红色焦点环 */
.focus-ring-gray  /* 灰色焦点环 */
```

### 使用示例
```vue
<!-- 主要操作 -->
<button class="btn-primary focus-ring-red">主要按钮</button>

<!-- 次要操作 -->
<button class="btn-secondary focus-ring-gray">次要按钮</button>
```

## 🧭 导航样式

### 导航链接类
```css
.nav-link              /* 导航链接 */
.nav-link-with-padding /* 带内边距的导航链接 */
.mobile-nav-item       /* 移动端导航项 */
.dropdown-item         /* 下拉菜单项 */
```

## 📖 文字样式

### 文字类型类
```css
.heading-section  /* 章节标题 */
.text-body        /* 正文文本 */
.text-subtitle    /* 副标题 */
.text-description /* 描述文本 */
.text-footer      /* 页脚文本 */
```

## 💡 使用示例

### 完整的表单组件
```vue
<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <!-- 头部 -->
      <div class="modal-header">
        <h2 class="heading-section">编辑团队</h2>
        <button class="modal-close-btn" @click="close">
          <XIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 内容 -->
      <div class="modal-content">
        <div class="space-y-6">
          <!-- 团队名称 -->
          <div>
            <label for="name" class="form-label">团队名称</label>
            <input id="name" v-model="name" class="form-input" />
          </div>

          <!-- 游戏版本 -->
          <div>
            <label for="version" class="form-label">游戏版本</label>
            <select id="version" v-model="version" class="form-select">
              <option value="sv">朱/紫</option>
            </select>
          </div>

          <!-- 团队数据 -->
          <div>
            <label for="data" class="form-label">团队数据</label>
            <textarea id="data" v-model="data" class="form-textarea h-64"></textarea>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="modal-footer">
        <button class="btn-secondary focus-ring-gray" @click="cancel">
          取消
        </button>
        <button class="btn-primary focus-ring-red" @click="save">
          保存
        </button>
      </div>
    </div>
  </div>
</template>
```

## 🎨 样式定制

### 颜色主题
项目使用红色作为主题色：
- 主要颜色：`red-400` / `red-500` / `red-600`
- 焦点颜色：`red-500`
- 悬停颜色：`red-600`

### 暗色模式支持
所有样式都包含暗色模式支持，使用 `dark:` 前缀。

### 响应式设计
样式遵循移动优先的响应式设计原则，使用 Tailwind CSS 的响应式前缀。

## 📚 最佳实践

1. **优先使用公共样式类**：避免重复定义相同的样式
2. **保持一致性**：相同功能的元素使用相同的样式类
3. **焦点可访问性**：所有交互元素都应包含适当的焦点样式
4. **语义化命名**：样式类名应该反映其用途而不是外观
5. **组合使用**：可以将公共样式类与 Tailwind 工具类组合使用

## 🔧 扩展指南

如需添加新的公共样式：

1. 在 `assets/css/tailwind.css` 的 `@layer components` 中定义
2. 使用 `@apply` 指令组合 Tailwind 类
3. 确保包含暗色模式支持
4. 更新本文档
5. 在相关组件中使用新样式

### 示例：添加新的卡片样式
```css
@layer components {
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6;
  }

  .card-header {
    @apply border-b border-gray-200 dark:border-gray-700 pb-4 mb-4;
  }
}
```

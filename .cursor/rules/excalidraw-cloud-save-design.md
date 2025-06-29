# Excalidraw Cloud Save - Frontend Design

This document outlines the frontend architecture, state management, and key component designs for the Excalidraw Cloud Save application.

## 1. Core Architecture: Unified Sidebar Layout

The application employs a unified sidebar layout model, managed by the `SidebarLayout` component. This component serves as the primary interface for both viewing the list of drawings and interacting with a specific drawing canvas.

-   **Routing**: The main routing is handled in `App.tsx`, which directs both the root path (`/`) and dynamic drawing paths (`/:id`) to the `SidebarLayout`.
-   **Layout Structure**:
    -   `SidebarProvider`: A context provider that manages the state of the sidebar (e.g., open/closed).
    -   `AppSidebar` / `LoginPromptSidebar`: The main sidebar content, conditionally rendered based on the user's authentication status.
    -   `SidebarInset`: The main content area to the right of the sidebar, which contains the header and the drawing canvas or empty state.

## 2. State Management and Data Flow

The application's state is managed through a combination of global authentication state and local component state.

### 2.1. Authentication State

-   **Provider**: Authentication is managed by `better-auth/react`, initialized in `lib/auth-client.ts`.
-   **Accessing State**: The `useSession()` hook is the primary method for accessing session data across the application. It provides:
    -   `data: session`: Contains user information if logged in.
    -   `isPending`: A boolean that indicates if the session state is currently being fetched. This is crucial for preventing premature access control checks.
-   **Usage**: `useSession` is used in `SidebarLayout` to determine the overall page structure and in `NavUser` to display user-specific information.

### 2.2. UI and Routing State

-   **URL-driven State**: The currently viewed drawing is determined by the `drawingId` from the URL, accessed via the `useParams` hook in `SidebarLayout`. This is the primary source of truth for which drawing to display.
-   **Local Component State**: `useState` is used for managing local UI state, such as the selected category (`currentCategory`) in `SidebarLayout` and the search query in `AppSidebar`.
-   **Mobile State**: The `useIsMobile` custom hook is used to detect if the application is being viewed on a mobile device, allowing for responsive UI adjustments (e.g., auto-closing the sidebar on navigation).

## 3. Data Fetching and Access Control

A reactive data flow is implemented in `SidebarLayout` to handle data fetching and access control efficiently and securely.

1.  **Get `drawingId` from URL**: `useParams` extracts the `drawingId`.
2.  **Memoize Drawing Lookup**: `useMemo` is used to find the `currentDrawing` from the `mockDrawings` array. This calculation only re-runs if `drawingId` changes, preventing redundant searches on every render.
3.  **Memoize Access Validation**: A second `useMemo` hook calculates `accessResult`. It depends on `drawingId`, `currentDrawing`, `session`, and `isPending`. This ensures that permission is only re-validated when relevant data changes. It prevents running validation logic while the session is still loading.
4.  **Handle Navigation via `useEffect`**: A `useEffect` hook listens for changes to `accessResult`. Its sole responsibility is to react to the access result and perform navigation (`navigate`) if access is denied (e.g., "NOT_FOUND", "FORBIDDEN"). The guard clause `if (!drawingId || isPending || !accessResult) return;` prevents the effect from running prematurely.

This chain ensures a clean separation of concerns and optimal performance.

## 4. Performance Optimizations

Several techniques are used to ensure the application is performant.

-   **`useMemo`**: As described above, it caches the results of expensive calculations (data lookup and access validation), preventing them from running on every component render.
-   **`React.memo`**: The `ExcalidrawCanvas` component is wrapped in `React.memo`. This prevents it from re-rendering if its parent component (`SidebarLayout`) re-renders, as long as its own props (`drawingId`) have not changed.
-   **`key` Prop for Component Remounting**: The `<Excalidraw>` component inside `ExcalidrawCanvas` uses `key={drawingId}`. This is an **intentional mechanism** to ensure that when the user switches to a different drawing, the entire Excalidraw instance is destroyed and a new one is created. This is the correct approach for complex, stateful third-party components like Excalidraw to prevent state leakage between different drawings.

## 5. Key Components

-   **`pages/sidebar-layout.tsx`**: The orchestrator. It manages the layout, fetches data, controls access, and passes state down to its children.
-   **`components/sidebar/app-sidebar.tsx`**: The interactive sidebar. It handles user interactions like creating a new drawing, switching categories, and searching. It uses the `useIsMobile` hook to provide a better user experience on smaller screens.
-   **`components/sidebar-inset/excalidraw-canvas.tsx`**: A simple, memoized wrapper around the core `<Excalidraw>` component. Its main job is to pass the `drawingId` to the `key` prop to control the component's lifecycle.
-   **`components/sidebar/nav-user.tsx`**: Displays the user's avatar and provides login/logout/settings options. It fetches its own user data directly using the `useSession` hook.

## 项目概述

基于 Excalidraw 的云端画布保存系统，支持用户创建、编辑、分享画布。设计理念：**极简URL + 统一界面体验 + 渐进式权限控制**。

## URL设计

### 核心原则
- **极简化**: 最短的URL路径
- **语义化**: URL即内容标识
- **可分享**: 地址栏URL直接作为分享链接

### 路由结构
```
/ - 画布列表页（默认显示recent类别，或空状态页面）
/:id - 画布页面（包含权限验证和错误处理）
/login - 登录页
/register - 注册页
/error/:type - 错误页面（private/deleted/not-found）
```

### 路由重定向规则
- 根路径 `/` 在用户未登录时显示登录页面
- 根路径 `/` 在用户已登录时显示画布列表
- 无效的画布ID自动重定向到相应的错误页面

## 画布状态系统

### 数据库字段设计
```sql
drawings table:
- id: uuid (主键)
- owner_id: uuid (所有者ID)
- title: varchar (画布标题)
- description: varchar (画布描述，可选)
- is_pinned: boolean (是否置顶)
- is_public: boolean (是否公开)
- is_archived: boolean (是否归档)
- is_deleted: boolean (是否删除)
- created_at: timestamp
- updated_at: timestamp
- deleted_at: timestamp (软删除时间)

drawing_content table:
- drawing_id: uuid (外键)
- elements: jsonb (画布元素数据)
- app_state: jsonb (画布状态数据)
- files: jsonb (图片等资源)
```

### 状态组合逻辑矩阵
```
画布状态组合：
                pinned  public  archived  deleted
recent(all)       ✓       ✓       ✗        ✗
pinned            -       ✓       ✓        ✗  
public            ✓       -       ✓        ✗
archived          ✓       ✓       -        ✗
deleted           ✗       ✗       ✗        -
```

### 状态规则
1. **deleted状态排他**: 画布一旦标记为deleted，不会出现在其他任何类别中
2. **archived不影响其他属性**: archived画布仍可以是pinned或public
3. **状态变更保留**: 画布删除时不改变其他属性，便于恢复
4. **public状态独立**: 公开状态与用户登录状态无关

## 侧边栏设计

### 左侧图标导航栏
从上到下的类别及图标：
1. **recent** (Palette图标) - 最近的画布，排除archived和deleted
2. **pinned** (Star图标) - 用户置顶的画布
3. **public** (Share图标) - 用户设为公开的画布
4. **archived** (Archive图标) - 用户归档的画布
5. **trash** (Trash图标) - 回收站，只显示deleted画布

### 右侧画布列表栏
- **标题区**: 显示当前类别名称 + "New"按钮
- **搜索框**: "Search drawings..."占位符
- **列表项**: 画布标题、最后修改时间、画布描述
- **更多操作**: 三个点菜单（重命名、设置public、pin、archive、删除等）

### 状态同步策略
- **内部状态切换**: 类别切换时URL不变，使用SPA内部状态
- **刷新重置**: 页面刷新后总是重置到recent类别
- **无状态持久化**: 不在本地存储记住用户的类别选择

## 数据加载策略

### 分离加载原则
- **元数据**: 画布列表元数据（ID、名称、状态等）一次性加载
- **内容数据**: 画布具体内容（elements、appState等）按需懒加载

### 请求策略
```javascript
// 初始化时加载所有画布元数据（约100个画布，几KB数据）
GET /api/drawings/metadata
Response: {
  drawings: [
    {
      id: "uuid",
      title: "画布标题",
      description: "画布描述（可选）",
      lastModified: "2024-01-15T10:30:00Z",
      isPinned: false,
      isPublic: true,
      isArchived: false,
      isDeleted: false
    }
  ]
}

// 点击画布时加载具体内容
GET /api/drawings/:id/content
Response: {
  elements: [...],
  appState: {...},
  files: {...}
}
```

### 本地过滤逻辑
```javascript
const filterDrawings = (drawings, category) => {
  const activeDrawings = drawings.filter(d => !d.isDeleted)
  
  switch(category) {
    case 'recent': 
      return activeDrawings.filter(d => !d.isArchived)
    case 'pinned':
      return activeDrawings.filter(d => d.isPinned)
    case 'public':
      return activeDrawings.filter(d => d.isPublic)
    case 'archived':
      return activeDrawings.filter(d => d.isArchived)
    case 'trash':
      return drawings.filter(d => d.isDeleted)
  }
}
```

## 权限验证系统

### 访问权限矩阵
```
画布访问权限：
用户状态 | 公开画布 | 私有画布(自己) | 私有画布(他人) | 删除画布
未登录   |   ✓     |      ✗       |      ✗       |    ✗
已登录   |   ✓     |      ✓       |      ✗       |    ✗
所有者   |   ✓     |      ✓       |      -       |    ✓
```

### 权限检查逻辑
```javascript
const validateAccess = (drawing, user) => {
  // 画布不存在
  if (!drawing) return 'NOT_FOUND'
  
  // 画布已删除 - 只有所有者可以访问回收站
  if (drawing.isDeleted) {
    return (!user || drawing.ownerId !== user.id) ? 'DELETED' : 'ALLOWED'
  }
  
  // 画布是公开的
  if (drawing.isPublic) return 'PUBLIC_ACCESS'
  
  // 用户未登录且画布私有
  if (!user) return 'LOGIN_REQUIRED'
  
  // 用户没有权限访问
  if (drawing.ownerId !== user.id) return 'FORBIDDEN'
  
  return 'ALLOWED'
}
```

### 错误页面类型
- **not-found**: 画布不存在
- **private**: 私有画布，需要登录
- **deleted**: 画布已删除
- **forbidden**: 没有访问权限

## 用户体验设计

### 登录状态区分
**已登录用户**:
- 显示完整侧边栏（所有类别）
- 可以创建、编辑、删除画布
- 可以设置画布的各种状态

**未登录用户**:
- 只能访问公开画布的内容
- 侧边栏显示登录引导信息
- 访问私有画布时跳转到错误页面

### 画布分享流程
1. 用户在画布中打开"public"开关
2. 直接复制地址栏URL作为分享链接
3. 分享链接格式: `https://domain.com/:id`
4. 接收者直接访问即可查看（无需额外的分享页面）

### 删除和恢复流程
**删除流程**:
1. 用户点击画布列表项的"三个点"菜单
2. 选择"删除"选项
3. 无确认对话框，直接删除（软删除到回收站）
4. 自动跳转到 `/`，显示空状态页面

**恢复流程**:
1. 用户在侧边栏选择"回收站"类别
2. 对删除的画布执行"恢复"操作
3. 画布恢复到之前的状态（保持原有的pinned、public、archived属性）

### 空状态页面
**触发条件**:
- 用户没有任何画布时访问 `/`
- 用户刚删除画布后跳转到 `/`
- 当前类别没有画布时

**页面内容**:
- 标题: "No drawing selected"
- 描述: "Select a drawing from the sidebar to start editing, or (换行) create a new one to get started."
- "+ New Drawing"按钮

### 错误页面设计
**页面布局**:
- 错误类型图标
- 错误标题和描述
- "回到首页"按钮（跳转到 `/`）

**错误类型**:
- **私有画布**: "This drawing is private"
- **已删除画布**: "This drawing has been deleted"  
- **不存在画布**: "Drawing not found"

## 技术实现要点

### 路由配置
```typescript
// App.tsx 路由配置
<Routes>
  <Route path="/" element={<DashboardLayout />} />
  <Route path="/:id" element={<DrawingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/error/:type" element={<ErrorPage />} />
</Routes>
```

### 组件结构
```
DashboardLayout/
├── AppSidebar (登录时) / LoginPromptSidebar (未登录时)
├── EmptyState (无画布时) / DrawingList (有画布时)

DrawingPage/
├── ExcalidrawCanvas (权限通过时)
├── ErrorRedirect (权限不通过时)

ErrorPage/
├── ErrorContent (根据type参数显示不同内容)
```

### 状态管理
- **画布列表**: React state，初始化时加载
- **当前类别**: React state，默认为'recent'
- **用户会话**: 使用现有的better-auth
- **画布内容**: 按需加载，不全局存储

### 性能优化
- **元数据缓存**: 画布列表元数据本地缓存
- **内容懒加载**: 只在用户访问时加载画布内容
- **组件复用**: ExcalidrawCanvas组件在不同权限状态下复用
- **路由预加载**: 可考虑预加载最近访问的画布内容

## 移动端考虑

暂时不考虑移动端适配，因为：
- Excalidraw在移动端体验不佳
- 主要面向桌面用户
- 后续可以考虑移动端的查看模式

## 国际化支持

暂时使用英文，后续可扩展：
- 错误页面文案
- 侧边栏类别名称
- 空状态页面文案
- 操作按钮文案 
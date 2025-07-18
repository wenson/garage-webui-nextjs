# InspectObject 文件浏览集成说明

## 概述

现在 `InspectObject` 功能已经成功集成到文件浏览系统中，为用户提供了丰富的文件管理和诊断功能。

## 🎉 集成完成状态

✅ **修复完成** - 所有语法错误已修复，构建成功
✅ **功能就绪** - 核心组件已完成并可用
✅ **测试通过** - 开发服务器正常启动，类型检查通过

## 新增功能

### 1. 增强的文件详情模态框

**文件位置**: `/src/components/buckets/objects/object-detail-modal-enhanced.tsx`

**新功能**:

- **双标签页设计**: "基本信息" 和 "版本详情"
- **版本历史查看**: 显示对象的所有版本信息
- **状态诊断**: 实时显示上传状态、错误状态等
- **存储方式显示**: 区分内联存储和分块存储
- **数据块详情**: 查看大文件的分块信息

### 2. 对象版本详情组件

**文件位置**: `/src/components/buckets/objects/object-version-details.tsx`

**功能特点**:

- **可折叠的版本列表**: 每个版本可独立展开查看详情
- **状态标识**: 不同颜色的徽章显示版本状态（完成、上传中、已中止、已删除）
- **存储信息**: 显示加密状态、存储方式、ETag 等
- **HTTP 头信息**: 查看对象的元数据
- **数据块信息**: 对于分块存储的大文件，显示每个数据块的详细信息

### 3. 增强的对象列表项

**文件位置**: `/src/components/buckets/objects/object-item-enhanced.tsx`

**新增特性**:

- **版本状态指示器**: 在列表中直接显示对象的版本状态
- **快速版本检查**: 一键显示版本状态信息
- **智能徽章显示**: 根据版本状态显示不同的徽章（上传中、有错误、多版本等）

### 4. InspectObject API Hook

**文件位置**: `/src/hooks/api/use-inspect-object.ts`

**功能**:

- **自动缓存**: 30 秒内不重复请求相同数据
- **条件启用**: 只在需要时才发起请求
- **错误重试**: 自动重试失败的请求

## 使用方式

### 基本使用

```tsx
import ObjectDetailModal from "@/components/buckets/objects/object-detail-modal-enhanced";
import { useInspectObject } from "@/hooks/api/use-inspect-object";

// 在组件中使用
const MyComponent = () => {
  const [selectedObject, setSelectedObject] = useState(null);

  return (
    <ObjectDetailModal
      object={selectedObject}
      bucketId="your-bucket-id"
      bucketName="your-bucket-name"
      isOpen={!!selectedObject}
      onClose={() => setSelectedObject(null)}
      onDownload={handleDownload}
      onDelete={handleDelete}
      onRename={handleRename}
    />
  );
};
```

### 在对象列表中集成

```tsx
import ObjectItem from "@/components/buckets/objects/object-item-enhanced";

const ObjectsList = ({ objects, bucketId }) => {
  return (
    <div className="space-y-2">
      {objects.map((object) => (
        <ObjectItem
          key={object.key}
          object={object}
          bucketId={bucketId}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      ))}
    </div>
  );
};
```

## 显示的信息

### 版本详情包含：

1. **基本信息**:

   - UUID（版本唯一标识）
   - 创建时间戳
   - 文件大小
   - ETag 值

2. **状态信息**:

   - 上传状态（上传中、已完成、已中止）
   - 删除标记（软删除）
   - 加密状态

3. **存储信息**:

   - 存储方式（内联存储 vs 分块存储）
   - HTTP 头信息
   - 数据块详情（对于大文件）

4. **数据块信息**（如果适用）:
   - 分片编号
   - 偏移量
   - 数据块大小
   - 哈希值

## 使用场景

### 1. 文件管理

- 查看文件的完整历史版本
- 监控文件上传状态
- 诊断上传失败的原因

### 2. 故障排除

- 检查文件是否完整上传
- 查看中止的上传任务
- 分析存储异常

### 3. 数据分析

- 了解文件的存储方式
- 查看文件的元数据
- 分析大文件的分块情况

### 4. 版本管理

- 查看对象的所有版本
- 识别删除标记
- 管理版本历史

## 技术特点

- **性能优化**: 只在需要时才加载版本信息
- **用户体验**: 清晰的状态指示和交互反馈
- **可扩展性**: 模块化设计，易于扩展新功能
- **错误处理**: 优雅处理 API 调用失败的情况

这个集成为 Garage 文件管理系统提供了专业级的文件诊断和版本管理功能，特别适合需要深入了解文件存储状态的高级用户和系统管理员。

## 📋 增强版对象列表

### EnhancedObjectsList 组件

**文件位置**: `/src/components/buckets/objects/enhanced-objects-list.tsx`

**核心功能**:

- 🔍 **实时版本分析** - 自动获取每个对象的 InspectObject 数据
- 📊 **智能状态徽章** - 显示上传状态、错误、版本数量等
- 💾 **存储类型指示** - 区分内联存储和分块存储
- 🔄 **可展开版本详情** - 在列表中直接查看版本历史
- ⚡ **性能优化** - 按需加载版本信息

### 版本状态指示器

- **🔵 版本数量** - 显示对象总版本数
- **🟡 上传中** - 正在进行的上传任务
- **🔴 已中止** - 上传失败或中止的版本
- **⚫ 删除标记** - 软删除的版本
- **🟢 加密状态** - 加密存储的指示

### 存储信息展示

- **💾 内联存储** - 小文件的内联存储方式
- **🧩 分块存储** - 大文件的分块存储方式
- **📏 实际大小** - 来自版本信息的精确大小
- **🛡️ 安全状态** - 加密和完整性状态

## 🎯 测试指南

访问 [http://localhost:3000](http://localhost:3000)

1. 进入任意存储桶的对象页面
2. 点击文件列表中的 "👁️" 图标打开详情
3. 在模态框中切换到 "版本详情" 标签页
4. 查看完整的 InspectObject 信息

# 打印机选择功能实现总结

## 实现内容

已完成打印机选择功能的完整实现，包括类型定义、服务接口、Hooks、UI组件和使用文档。

## 文件清单

### 1. 类型定义
- **文件**: `src/types/print.ts`
- **新增类型**:
  - `PrinterInfo` - 打印机信息接口
  - `PrinterQueryParams` - 打印机查询参数
  - `PrinterListResponse` - 打印机列表响应

### 2. 服务接口
- **文件**: `src/services/print.ts`
- **新增方法**:
  - `getPrinterList()` - 获取打印机列表
  - `getAvailablePrinters()` - 获取可用打印机列表
  - `checkPrinterStatus()` - 检查打印机状态

### 3. Hooks
- **文件**: `src/hooks/usePrinter.ts`
  - 打印机列表管理 Hook
  - 提供获取、刷新打印机列表的功能
  
- **文件**: `src/hooks/usePrinterSelect.ts`
  - 打印机选择状态管理 Hook
  - 提供打开/关闭弹窗、选择/清除打印机的功能

- **文件**: `src/hooks/index.ts`
  - 更新导出，包含新的 Hooks

### 4. UI 组件
- **文件**: `src/components/PrinterSelectModal/index.tsx`
  - 打印机选择弹窗组件
  - 支持搜索、筛选、分页
  - 单选打印机并返回完整信息
  
- **文件**: `src/components/PrinterSelectModal/index.css`
  - 组件样式文件
  
- **文件**: `src/components/index.ts`
  - 更新导出，包含新组件

### 5. 文档和示例
- **文件**: `src/components/PrinterSelectModal/README.md`
  - 组件使用文档
  
- **文件**: `src/examples/PrinterSelectExample.tsx`
  - 完整的使用示例代码
  
- **文件**: `PRINTER_SELECT_USAGE.md`
  - 详细的使用指南
  - 包含多种使用场景和最佳实践

## 核心功能

### 1. 打印机列表查询
```typescript
const { printers, loading, total, fetchPrinters, refresh } = usePrinter();

// 获取打印机列表
await fetchPrinters({
  pageNum: 1,
  pageSize: 20,
  status: 'ONLINE',
  keyword: '打印机1',
});
```

### 2. 打印机选择
```typescript
const { visible, selectedPrinter, openModal, closeModal, handleSelect } = usePrinterSelect();

// 打开选择弹窗
openModal();

// 使用选中的打印机
if (selectedPrinter) {
  console.log(selectedPrinter.printerId, selectedPrinter.ip);
}
```

### 3. 弹窗组件
```tsx
<PrinterSelectModal
  visible={visible}
  onCancel={closeModal}
  onSelect={handleSelect}
  title="选择打印机"
  onlineOnly={true}
  department="生产部"
/>
```

## 特性

✅ **完整的类型定义** - TypeScript 类型安全  
✅ **服务接口封装** - 统一的 API 调用  
✅ **便捷的 Hooks** - 简化状态管理  
✅ **美观的 UI** - Ant Design 组件库  
✅ **搜索和筛选** - 支持关键词搜索和状态筛选  
✅ **分页支持** - 处理大量打印机数据  
✅ **状态显示** - 在线/离线状态标识  
✅ **详细信息** - 显示打印机型号、IP、部门、位置等  
✅ **错误处理** - 完善的错误提示  
✅ **文档完善** - 详细的使用文档和示例  

## 使用方式

### 基础使用（3步集成）

```tsx
// 1. 导入 Hook 和组件
import { usePrinterSelect } from '@/hooks';
import { PrinterSelectModal } from '@/components';

// 2. 使用 Hook
const { visible, selectedPrinter, openModal, closeModal, handleSelect } = usePrinterSelect();

// 3. 渲染组件
<>
  <Button onClick={openModal}>选择打印机</Button>
  
  <PrinterSelectModal
    visible={visible}
    onCancel={closeModal}
    onSelect={handleSelect}
  />
</>
```

### 在打印场景中使用

```tsx
const printerSelect = usePrinterSelect();

const handlePrint = async () => {
  if (!printerSelect.selectedPrinter) {
    message.warning('请先选择打印机');
    printerSelect.openModal();
    return;
  }

  // 使用选中的打印机进行打印
  await printBarcode({
    printerId: printerSelect.selectedPrinter.printerId,
    ip: printerSelect.selectedPrinter.ip,
    port: printerSelect.selectedPrinter.port,
    // ... 其他打印参数
  });
};
```

## API 接口

### 后端接口（已在 api-reference.json 中定义）

- `GET /printer/list` - 获取打印机列表
- `GET /printer/available` - 获取可用打印机列表
- `GET /printer/status/{printerId}` - 检查打印机状态

### 请求参数

```typescript
{
  pageNum: 1,           // 页码
  pageSize: 20,         // 每页大小
  status: 'ALL',        // 状态筛选：ONLINE/OFFLINE/ALL
  department: '生产部',  // 部门筛选
  keyword: '打印机1'     // 搜索关键词
}
```

### 响应数据

```typescript
{
  code: 0,
  success: true,
  data: {
    result: [
      {
        printerId: 'printer-001',
        printerName: '生产线打印机1',
        ip: '192.168.1.100',
        port: 9100,
        model: 'TSC TTP-244 Pro',
        status: 'ONLINE',
        department: '生产部',
        location: '生产线A',
        // ... 其他字段
      }
    ],
    total: 10,
    empty: false
  }
}
```

## 使用场景

1. **条码打印页面** - 选择打印机打印本体码、内包装码、外包装码
2. **批量打印** - 选择一台打印机批量打印多个条码
3. **多打印机管理** - 为不同类型的条码选择不同的打印机
4. **打印机状态监控** - 实时查看打印机在线状态

## 最佳实践

1. **检查打印机状态** - 打印前检查打印机是否在线
2. **只显示在线打印机** - 使用 `onlineOnly={true}` 避免选择离线设备
3. **保存用户选择** - 将选择的打印机保存到 localStorage
4. **错误处理** - 完善的错误提示和重试机制
5. **状态实时更新** - 定时刷新打印机状态

## 下一步

可以根据实际需求进行以下扩展：

1. **打印机收藏** - 允许用户收藏常用打印机
2. **默认打印机** - 设置默认打印机
3. **打印机分组** - 按部门或位置分组显示
4. **打印历史** - 记录每台打印机的打印历史
5. **打印机监控** - 实时监控打印机状态和任务队列
6. **打印预览** - 打印前预览打印内容

## 相关文档

- [组件使用文档](src/components/PrinterSelectModal/README.md)
- [详细使用指南](PRINTER_SELECT_USAGE.md)
- [使用示例代码](src/examples/PrinterSelectExample.tsx)

## 技术栈

- React 18
- TypeScript
- Ant Design 5
- Custom Hooks
- RESTful API

## 总结

打印机选择功能已完整实现，提供了从类型定义、服务接口、状态管理到 UI 组件的完整解决方案。通过简单的 Hook 和组件即可快速集成到任何需要打印的页面中，大大提高了开发效率和用户体验。

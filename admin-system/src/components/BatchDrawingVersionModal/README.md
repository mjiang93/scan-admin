# BatchDrawingVersionModal 批量更新图纸版本弹窗

## 功能说明

批量更新图纸版本弹窗组件，用于批量修改选中记录的图纸版本信息。

## 使用方式

```tsx
import BatchDrawingVersionModal from '@/components/BatchDrawingVersionModal';

<BatchDrawingVersionModal
  visible={visible}
  selectedIds={selectedIds}
  onClose={() => setVisible(false)}
  onSuccess={() => {
    // 更新成功后的回调
    loadData();
  }}
/>
```

## Props

| 参数 | 说明 | 类型 | 必填 |
|------|------|------|------|
| visible | 弹窗是否可见 | boolean | 是 |
| selectedIds | 选中的记录ID列表 | React.Key[] | 是 |
| onClose | 关闭弹窗的回调 | () => void | 是 |
| onSuccess | 更新成功的回调 | () => void | 是 |

## 功能特性

1. **表单验证**
   - 图纸版本为必填项
   - 最大长度限制为50个字符

2. **用户信息**
   - 自动获取当前登录用户信息作为操作人

3. **批量操作**
   - 支持批量更新多条记录
   - 显示选中记录数量

4. **错误处理**
   - 更新失败时显示错误提示
   - 更新成功时显示成功消息

## API 接口

调用 `/pc/editdrawing` 接口进行批量更新：

```typescript
{
  ids: number[];           // 记录ID列表
  drawingVersion: string;  // 图纸版本
  operator: string;        // 操作人
}
```

## 注意事项

1. 弹窗关闭时会自动重置表单
2. 使用 `destroyOnClose` 确保每次打开都是新的表单状态
3. 更新成功后会触发 `onSuccess` 回调，用于刷新列表数据

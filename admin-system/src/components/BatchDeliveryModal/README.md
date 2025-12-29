# 批量修改送货时间弹窗组件

## 功能说明

该组件用于批量修改选中记录的送货时间，支持以下功能：

- 选择新的送货日期
- 批量更新多条记录
- 自动获取当前登录用户作为操作者
- 操作成功后自动刷新数据并清空选择

## 使用方式

```tsx
import BatchDeliveryModal from '@/components/BatchDeliveryModal';

<BatchDeliveryModal
  visible={batchDeliveryModalVisible}
  selectedIds={selectedRowKeys}
  onClose={() => setBatchDeliveryModalVisible(false)}
  onSuccess={() => {
    // 修改成功后的回调
    loadData();
    setSelectedRowKeys([]);
  }}
/>
```

## Props

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| visible | boolean | 是 | 弹窗是否可见 |
| selectedIds | React.Key[] | 是 | 选中的记录ID数组 |
| onClose | () => void | 是 | 关闭弹窗的回调 |
| onSuccess | () => void | 是 | 操作成功的回调 |

## API接口

调用 `/pc/editdelivery` 接口，请求参数：

```json
{
  "ids": [1, 2, 3],
  "deliveryDate": "2025-07-09",
  "operator": "登录用户ID"
}
```

## 依赖

- antd (Modal, Form, DatePicker, Button, message)
- dayjs (日期处理)
- @/services/print (API调用)
- @/utils/storage (获取用户信息)
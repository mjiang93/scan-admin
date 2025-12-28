# 外包装弹窗组件 (OuterPackagingModal)

## 功能描述

外包装弹窗组件用于显示供应商送货标签，包含完整的物料信息表格和二维码。

## 主要特性

- 📋 **表格式标签布局** - 完全按照供应商送货标签格式设计
- 📱 **真实二维码生成** - 使用 `qrcode.react` 库生成包含完整物料信息的二维码
- 🖨️ **打印功能** - 支持标签打印操作
- 📱 **响应式设计** - 适配不同屏幕尺寸

## 组件属性

```typescript
interface OuterPackagingModalProps {
  visible: boolean;           // 弹窗显示状态
  onClose: () => void;       // 关闭弹窗回调
  record: BarcodeRecord | null; // 条码记录数据
}
```

## 使用示例

```tsx
import OuterPackagingModal from '@/components/OuterPackagingModal';

const [outerPackagingModalVisible, setOuterPackagingModalVisible] = useState(false);
const [currentRecord, setCurrentRecord] = useState<BarcodeRecord | null>(null);

// 打开外包装弹窗
const handleOuterPackaging = (record: BarcodeRecord) => {
  setCurrentRecord(record);
  setOuterPackagingModalVisible(true);
};

// 渲染组件
<OuterPackagingModal
  visible={outerPackagingModalVisible}
  onClose={() => setOuterPackagingModalVisible(false)}
  record={currentRecord}
/>
```

## 标签信息

标签包含以下信息：
- 物料编码
- 名称型号
- 数量和单位
- 供应商代码
- PO/行号
- 批号（高亮显示）
- 送货日期
- 送货单号
- 存储/清洁要求
- SN码
- 二维码（包含所有关键信息的JSON格式）

## 二维码数据格式

二维码包含以下JSON格式的数据：

```json
{
  "materialCode": "物料编码",
  "name": "名称型号",
  "quantity": 100,
  "supplierCode": "供应商代码",
  "poNumber": "PO号",
  "batchNumber": "批号",
  "deliveryDate": "送货日期",
  "snCode": "SN码"
}
```

## 样式定制

组件使用独立的CSS文件 `index.css`，可以根据需要调整：
- 表格边框和间距
- 二维码尺寸
- 响应式断点
- 颜色主题

## 依赖

- `antd` - UI组件库
- `qrcode.react` - 二维码生成库
- `@ant-design/icons` - 图标库
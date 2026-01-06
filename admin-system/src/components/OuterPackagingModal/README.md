# 外包装弹窗组件 (OuterPackagingModal)

## 功能描述

外包装弹窗组件用于显示供应商送货标签，支持扫描内包装码获取外包装信息，包含完整的物料信息表格和二维码。

## 主要特性

- 🔍 **扫码功能** - 支持输入或扫描内包装码，调用 `/pda/scannbzcode` 接口获取外包装信息
- 📋 **表格式标签布局** - 完全按照供应商送货标签格式设计
- 📱 **真实二维码生成** - 使用 `qrcode.react` 库生成包含完整物料信息的二维码
- 🖨️ **打印功能** - 支持标签打印操作（需先扫码获取数据）
- 📱 **响应式设计** - 适配不同屏幕尺寸
- ⚡ **实时数据更新** - 扫码后自动更新标签内容

## 组件属性

```typescript
interface OuterPackagingModalProps {
  visible: boolean;           // 弹窗显示状态
  onClose: () => void;       // 关闭弹窗回调
  record: BarcodeRecord | null; // 条码记录数据（用于默认显示）
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

## 使用流程

1. 点击"外包装"按钮打开弹窗
2. 在输入框中输入或扫描内包装码
3. 点击"扫描"按钮或按回车键调用接口
4. 系统自动获取外包装信息并更新标签内容
5. 点击"打印"按钮打印标签（需先完成扫码）

## API 接口

### 扫描内包装码

**接口地址**: `GET /pda/scannbzcode`

**请求参数**:
```typescript
{
  nbzcode: string  // 内包装码（必填）
}
```

**返回数据**:
```typescript
{
  id: number;              // 主键
  materialCode: string;    // 物料编码
  nameModel: string;       // 名称型号
  supplierCode: string;    // 供应商代码
  unit: string;            // 单位
  cnt: number;             // 数量
  code09: string;          // 批号
  codeSN: string;          // SN码（用于生成二维码）
  deliveryDate: string;    // 送货日期
  deliveryNo: string;      // 送货单号
  poNo: string;            // PO/行号
  saveClean: string;       // 存储/清洁
}
```

## 标签信息

标签包含以下信息：
- 物料编码
- 名称型号
- 数量和单位
- 供应商代码
- PO/行号
- 批号
- 送货日期
- 送货单号
- 存储/清洁要求
- 二维码（使用 codeSN 生成）

## 二维码数据格式

扫码后，二维码直接使用接口返回的 `codeSN` 字段生成。

未扫码时，二维码包含以下JSON格式的默认数据：

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
- `@/services/print` - 打印服务（包含 `scanNbzcode` 接口）
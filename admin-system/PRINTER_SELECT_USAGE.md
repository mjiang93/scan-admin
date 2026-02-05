# 打印机选择功能使用指南

## 概述

本系统提供了一套完整的打印机选择解决方案，包括：
- 打印机列表查询接口
- 打印机选择 Hook (`usePrinter`, `usePrinterSelect`)
- 打印机选择弹窗组件 (`PrinterSelectModal`)

## 功能特性

✅ 获取打印机列表（支持分页、搜索、筛选）  
✅ 显示打印机详细信息（名称、型号、IP、状态等）  
✅ 支持在线/离线状态筛选  
✅ 支持部门筛选  
✅ 支持关键词搜索  
✅ 单选打印机并返回完整信息  
✅ 美观的 UI 交互体验  

## 快速开始

### 1. 基础使用

```tsx
import React from 'react';
import { Button } from 'antd';
import { PrinterSelectModal } from '@/components';
import { usePrinterSelect } from '@/hooks';

export default function MyPage() {
  const { visible, selectedPrinter, openModal, closeModal, handleSelect } = usePrinterSelect();

  return (
    <>
      <Button onClick={openModal}>选择打印机</Button>
      
      {selectedPrinter && (
        <div>
          已选择：{selectedPrinter.printerName} ({selectedPrinter.ip})
        </div>
      )}

      <PrinterSelectModal
        visible={visible}
        onCancel={closeModal}
        onSelect={handleSelect}
      />
    </>
  );
}
```

### 2. 在打印页面中使用

```tsx
import React, { useState } from 'react';
import { Button, Card, message } from 'antd';
import { PrinterSelectModal } from '@/components';
import { usePrinterSelect } from '@/hooks';
import { updatePrintStatus } from '@/services/print';

export default function PrintPage() {
  const { visible, selectedPrinter, openModal, closeModal, handleSelect } = usePrinterSelect();
  const [printing, setPrinting] = useState(false);

  // 打印本体码
  const handlePrintBarcode = async (recordId: number) => {
    if (!selectedPrinter) {
      message.warning('请先选择打印机');
      openModal(); // 自动打开选择弹窗
      return;
    }

    if (selectedPrinter.status !== 'ONLINE') {
      message.error('打印机离线，请重新选择');
      openModal();
      return;
    }

    setPrinting(true);
    try {
      // 调用打印接口
      await updatePrintStatus({
        id: recordId,
        operator: 'user123',
        btPrintCnt: 1,
      });

      message.success('打印成功');
    } catch (error) {
      message.error('打印失败');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Card>
      {/* 打印机选择区域 */}
      <div style={{ marginBottom: 16 }}>
        <Button onClick={openModal}>
          {selectedPrinter ? `当前打印机：${selectedPrinter.printerName}` : '选择打印机'}
        </Button>
      </div>

      {/* 打印按钮 */}
      <Button 
        type="primary" 
        loading={printing}
        onClick={() => handlePrintBarcode(123)}
      >
        打印条码
      </Button>

      <PrinterSelectModal
        visible={visible}
        onCancel={closeModal}
        onSelect={handleSelect}
        onlineOnly={true}  // 只显示在线打印机
      />
    </Card>
  );
}
```

### 3. 在条码打印弹窗中使用

```tsx
import React from 'react';
import { Modal, Form, Button, Space } from 'antd';
import { PrinterSelectModal } from '@/components';
import { usePrinterSelect } from '@/hooks';

interface BarcodeModalProps {
  visible: boolean;
  onCancel: () => void;
  onPrint: (printerId: string, ip: string, port: number) => void;
}

export default function BarcodeModal({ visible, onCancel, onPrint }: BarcodeModalProps) {
  const printerSelect = usePrinterSelect();

  const handlePrint = () => {
    if (!printerSelect.selectedPrinter) {
      printerSelect.openModal();
      return;
    }

    onPrint(
      printerSelect.selectedPrinter.printerId,
      printerSelect.selectedPrinter.ip,
      printerSelect.selectedPrinter.port
    );
  };

  return (
    <>
      <Modal
        title="打印条码"
        open={visible}
        onCancel={onCancel}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="打印机">
            <Space>
              <Button onClick={printerSelect.openModal}>
                {printerSelect.selectedPrinter 
                  ? printerSelect.selectedPrinter.printerName 
                  : '选择打印机'}
              </Button>
              {printerSelect.selectedPrinter && (
                <span style={{ color: '#999' }}>
                  {printerSelect.selectedPrinter.ip}
                </span>
              )}
            </Space>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              onClick={handlePrint}
              disabled={!printerSelect.selectedPrinter}
            >
              开始打印
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <PrinterSelectModal
        visible={printerSelect.visible}
        onCancel={printerSelect.closeModal}
        onSelect={printerSelect.handleSelect}
        onlineOnly={true}
      />
    </>
  );
}
```

## API 参考

### usePrinterSelect Hook

返回打印机选择相关的状态和方法。

```typescript
const {
  visible,          // 弹窗是否显示
  selectedPrinter,  // 选中的打印机信息
  openModal,        // 打开弹窗
  closeModal,       // 关闭弹窗
  handleSelect,     // 选择打印机的回调
  clearSelection,   // 清除选择
} = usePrinterSelect();
```

### PrinterSelectModal 组件

| 属性 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| visible | 是否显示弹窗 | boolean | - | 是 |
| onCancel | 关闭弹窗回调 | () => void | - | 是 |
| onSelect | 选择打印机回调 | (printer: PrinterInfo) => void | - | 是 |
| title | 弹窗标题 | string | '选择打印机' | 否 |
| onlineOnly | 是否只显示在线打印机 | boolean | false | 否 |
| department | 部门筛选 | string | - | 否 |

### PrinterInfo 类型

```typescript
interface PrinterInfo {
  printerId: string;        // 打印机ID
  printerName: string;      // 打印机名称
  ip: string;               // IP地址
  port: number;             // 端口
  model: string;            // 型号
  department?: string;      // 部门
  location?: string;        // 位置
  status: 'ONLINE' | 'OFFLINE';  // 状态
  connectionType?: string;  // 连接类型
  printMode?: string;       // 打印方式
  paperWidth?: number;      // 纸张宽度(mm)
  paperHeight?: number;     // 纸张高度(mm)
  remark?: string;          // 备注
}
```

## 服务接口

### getPrinterList

获取打印机列表。

```typescript
import { getPrinterList } from '@/services/print';

const response = await getPrinterList({
  pageNum: 1,
  pageSize: 20,
  status: 'ONLINE',      // 'ALL' | 'ONLINE' | 'OFFLINE'
  department: '生产部',
  keyword: '打印机1',
});
```

### getAvailablePrinters

获取可用打印机列表（只返回在线的打印机）。

```typescript
import { getAvailablePrinters } from '@/services/print';

const response = await getAvailablePrinters('生产部');
```

### checkPrinterStatus

检查打印机状态。

```typescript
import { checkPrinterStatus } from '@/services/print';

const printerInfo = await checkPrinterStatus('printer-001');
```

## 使用场景

### 场景1：条码打印页面

在条码打印页面中，用户需要选择打印机来打印本体码、内包装码、外包装码。

```tsx
// 在 BarcodeModal 组件中集成打印机选择
const printerSelect = usePrinterSelect();

// 打印时使用选中的打印机
const handlePrint = async () => {
  if (!printerSelect.selectedPrinter) {
    message.warning('请先选择打印机');
    printerSelect.openModal();
    return;
  }

  await printBarcode({
    printerId: printerSelect.selectedPrinter.printerId,
    ip: printerSelect.selectedPrinter.ip,
    port: printerSelect.selectedPrinter.port,
    // ... 其他打印参数
  });
};
```

### 场景2：批量打印

在批量打印场景中，用户选择一台打印机后批量打印多个条码。

```tsx
const printerSelect = usePrinterSelect();

const handleBatchPrint = async (records: BarcodeRecord[]) => {
  if (!printerSelect.selectedPrinter) {
    message.warning('请先选择打印机');
    printerSelect.openModal();
    return;
  }

  for (const record of records) {
    await printBarcode({
      printerId: printerSelect.selectedPrinter.printerId,
      ip: printerSelect.selectedPrinter.ip,
      port: printerSelect.selectedPrinter.port,
      barcodeId: record.id,
      // ... 其他参数
    });
  }
};
```

### 场景3：不同类型条码使用不同打印机

有时需要为不同类型的条码选择不同的打印机。

```tsx
// 本体码打印机
const btPrinterSelect = usePrinterSelect();
// 内包装码打印机
const nbzPrinterSelect = usePrinterSelect();
// 外包装码打印机
const wbzPrinterSelect = usePrinterSelect();

return (
  <>
    <Space>
      <Button onClick={btPrinterSelect.openModal}>
        本体码打印机: {btPrinterSelect.selectedPrinter?.printerName || '未选择'}
      </Button>
      <Button onClick={nbzPrinterSelect.openModal}>
        内包装码打印机: {nbzPrinterSelect.selectedPrinter?.printerName || '未选择'}
      </Button>
      <Button onClick={wbzPrinterSelect.openModal}>
        外包装码打印机: {wbzPrinterSelect.selectedPrinter?.printerName || '未选择'}
      </Button>
    </Space>

    <PrinterSelectModal
      visible={btPrinterSelect.visible}
      onCancel={btPrinterSelect.closeModal}
      onSelect={btPrinterSelect.handleSelect}
      title="选择本体码打印机"
    />
    <PrinterSelectModal
      visible={nbzPrinterSelect.visible}
      onCancel={nbzPrinterSelect.closeModal}
      onSelect={nbzPrinterSelect.handleSelect}
      title="选择内包装码打印机"
    />
    <PrinterSelectModal
      visible={wbzPrinterSelect.visible}
      onCancel={wbzPrinterSelect.closeModal}
      onSelect={wbzPrinterSelect.handleSelect}
      title="选择外包装码打印机"
    />
  </>
);
```

## 最佳实践

### 1. 检查打印机状态

在打印前检查打印机是否在线：

```tsx
if (selectedPrinter.status !== 'ONLINE') {
  message.error('打印机离线，请重新选择');
  openModal();
  return;
}
```

### 2. 保存用户选择

可以将用户选择的打印机保存到 localStorage，下次自动使用：

```tsx
import { setStorage, getStorage } from '@/utils/storage';

// 保存选择
const handleSelect = (printer: PrinterInfo) => {
  setStorage('lastSelectedPrinter', printer);
  // ... 其他逻辑
};

// 加载上次选择
useEffect(() => {
  const lastPrinter = getStorage<PrinterInfo>('lastSelectedPrinter');
  if (lastPrinter) {
    // 验证打印机是否仍然可用
    checkPrinterStatus(lastPrinter.printerId)
      .then(printer => {
        if (printer.status === 'ONLINE') {
          handleSelect(printer);
        }
      });
  }
}, []);
```

### 3. 错误处理

```tsx
const handlePrint = async () => {
  try {
    if (!selectedPrinter) {
      throw new Error('请先选择打印机');
    }

    if (selectedPrinter.status !== 'ONLINE') {
      throw new Error('打印机离线');
    }

    await printService.print({
      printerId: selectedPrinter.printerId,
      // ...
    });

    message.success('打印成功');
  } catch (error) {
    message.error(error.message || '打印失败');
    // 如果是打印机问题，提示重新选择
    if (error.message.includes('打印机')) {
      openModal();
    }
  }
};
```

### 4. 只显示在线打印机

在生产环境中，建议只显示在线的打印机：

```tsx
<PrinterSelectModal
  visible={visible}
  onCancel={closeModal}
  onSelect={handleSelect}
  onlineOnly={true}  // 只显示在线打印机
/>
```

## 相关文件

- **类型定义**: `src/types/print.ts`
- **服务接口**: `src/services/print.ts`
- **Hooks**: 
  - `src/hooks/usePrinter.ts` - 打印机列表管理
  - `src/hooks/usePrinterSelect.ts` - 打印机选择状态管理
- **组件**: 
  - `src/components/PrinterSelectModal/index.tsx` - 打印机选择弹窗
  - `src/components/PrinterSelectModal/index.css` - 样式文件
- **示例**: 
  - `src/examples/PrinterSelectExample.tsx` - 完整使用示例
  - `src/components/PrinterSelectModal/README.md` - 组件文档

## 常见问题

### Q: 如何在多个页面共享选中的打印机？

A: 可以使用全局状态管理（如 Redux/Zustand）或将打印机信息保存到 localStorage。

### Q: 如何自动选择默认打印机？

A: 可以在获取打印机列表后，自动选择第一台在线的打印机：

```tsx
useEffect(() => {
  if (printers.length > 0 && !selectedPrinter) {
    const onlinePrinter = printers.find(p => p.status === 'ONLINE');
    if (onlinePrinter) {
      handleSelect(onlinePrinter);
    }
  }
}, [printers]);
```

### Q: 如何实现打印机状态实时更新？

A: 可以使用定时器或 WebSocket 来实时更新打印机状态：

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    refresh(); // 刷新打印机列表
  }, 30000); // 每30秒刷新一次

  return () => clearInterval(timer);
}, [refresh]);
```

## 总结

打印机选择功能提供了完整的打印机管理解决方案，通过简单的 Hook 和组件即可快速集成到任何需要打印的页面中。建议在实际使用时根据业务需求进行适当的定制和优化。

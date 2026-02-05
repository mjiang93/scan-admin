# 打印机选择组件使用文档

## 概述

`PrinterSelectModal` 是一个打印机选择弹窗组件，配合 `usePrinterSelect` Hook 使用，可以方便地在页面中选择打印机。

## 功能特性

- 📋 显示打印机列表（名称、型号、IP、状态等）
- 🔍 支持关键词搜索（名称、IP、型号）
- 🎯 支持状态筛选（全部/在线/离线）
- 🔄 支持刷新列表
- 📄 支持分页
- ✅ 单选打印机
- 🎨 美观的 UI 交互

## 快速开始

### 1. 基础使用

```tsx
import React from 'react';
import { Button, Space, Card } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { PrinterSelectModal } from '@/components';
import { usePrinterSelect } from '@/hooks';

export default function MyPage() {
  const { visible, selectedPrinter, openModal, closeModal, handleSelect } = usePrinterSelect();

  return (
    <div>
      <Space>
        <Button type="primary" icon={<PrinterOutlined />} onClick={openModal}>
          选择打印机
        </Button>
        
        {selectedPrinter && (
          <Card size="small">
            <p>已选择打印机：{selectedPrinter.printerName}</p>
            <p>IP地址：{selectedPrinter.ip}</p>
            <p>型号：{selectedPrinter.model}</p>
            <p>状态：{selectedPrinter.status === 'ONLINE' ? '在线' : '离线'}</p>
          </Card>
        )}
      </Space>

      <PrinterSelectModal
        visible={visible}
        onCancel={closeModal}
        onSelect={handleSelect}
      />
    </div>
  );
}
```

### 2. 只显示在线打印机

```tsx
<PrinterSelectModal
  visible={visible}
  onCancel={closeModal}
  onSelect={handleSelect}
  onlineOnly={true}
/>
```

### 3. 按部门筛选

```tsx
<PrinterSelectModal
  visible={visible}
  onCancel={closeModal}
  onSelect={handleSelect}
  department="生产部"
/>
```

### 4. 自定义标题

```tsx
<PrinterSelectModal
  visible={visible}
  onCancel={closeModal}
  onSelect={handleSelect}
  title="请选择本体码打印机"
/>
```

## API 文档

### PrinterSelectModal Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| visible | 是否显示弹窗 | boolean | - | 是 |
| onCancel | 关闭弹窗回调 | () => void | - | 是 |
| onSelect | 选择打印机回调 | (printer: PrinterInfo) => void | - | 是 |
| title | 弹窗标题 | string | '选择打印机' | 否 |
| onlineOnly | 是否只显示在线打印机 | boolean | false | 否 |
| department | 部门筛选 | string | - | 否 |

### usePrinterSelect 返回值

| 属性 | 说明 | 类型 |
|------|------|------|
| visible | 是否显示弹窗 | boolean |
| selectedPrinter | 选中的打印机 | PrinterInfo \| null |
| openModal | 打开弹窗 | () => void |
| closeModal | 关闭弹窗 | () => void |
| handleSelect | 选择打印机 | (printer: PrinterInfo) => void |
| clearSelection | 清除选择 | () => void |

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
  remark?: string;          // 备注
  // ... 其他字段
}
```

## 完整示例

### 打印页面集成

```tsx
import React, { useState } from 'react';
import { Button, Space, Card, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { PrinterSelectModal } from '@/components';
import { usePrinterSelect } from '@/hooks';
import type { PrinterInfo } from '@/types/print';

export default function PrintPage() {
  const { 
    visible, 
    selectedPrinter, 
    openModal, 
    closeModal, 
    handleSelect,
    clearSelection 
  } = usePrinterSelect();

  const [printing, setPrinting] = useState(false);

  // 打印处理
  const handlePrint = async () => {
    if (!selectedPrinter) {
      message.warning('请先选择打印机');
      return;
    }

    setPrinting(true);
    try {
      // 调用打印接口
      // await printService.print({
      //   printerId: selectedPrinter.printerId,
      //   ip: selectedPrinter.ip,
      //   port: selectedPrinter.port,
      //   ...printData
      // });
      
      message.success('打印成功');
    } catch (error) {
      message.error('打印失败');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 打印机选择区域 */}
        <Card title="打印机设置">
          <Space>
            <Button 
              type="primary" 
              icon={<PrinterOutlined />} 
              onClick={openModal}
            >
              选择打印机
            </Button>
            
            {selectedPrinter && (
              <Button onClick={clearSelection}>
                清除选择
              </Button>
            )}
          </Space>

          {selectedPrinter && (
            <Card 
              size="small" 
              style={{ marginTop: 16 }}
              title="当前选择的打印机"
            >
              <p><strong>名称：</strong>{selectedPrinter.printerName}</p>
              <p><strong>型号：</strong>{selectedPrinter.model}</p>
              <p><strong>IP地址：</strong>{selectedPrinter.ip}:{selectedPrinter.port}</p>
              <p><strong>状态：</strong>
                <span style={{ 
                  color: selectedPrinter.status === 'ONLINE' ? '#52c41a' : '#ff4d4f' 
                }}>
                  {selectedPrinter.status === 'ONLINE' ? '在线' : '离线'}
                </span>
              </p>
              {selectedPrinter.location && (
                <p><strong>位置：</strong>{selectedPrinter.location}</p>
              )}
            </Card>
          )}
        </Card>

        {/* 打印操作区域 */}
        <Card title="打印操作">
          <Button 
            type="primary" 
            size="large"
            loading={printing}
            disabled={!selectedPrinter}
            onClick={handlePrint}
          >
            开始打印
          </Button>
        </Card>
      </Space>

      {/* 打印机选择弹窗 */}
      <PrinterSelectModal
        visible={visible}
        onCancel={closeModal}
        onSelect={handleSelect}
        title="选择打印机"
        onlineOnly={true}
      />
    </div>
  );
}
```

## 注意事项

1. **在线状态**：设置 `onlineOnly={true}` 可以只显示在线的打印机，避免选择离线设备
2. **部门筛选**：如果系统有部门管理，可以通过 `department` 参数筛选特定部门的打印机
3. **状态刷新**：用户可以点击刷新按钮获取最新的打印机状态
4. **错误处理**：组件内部已处理接口错误，会自动显示错误提示
5. **选择保持**：选中的打印机信息会保存在 Hook 中，直到调用 `clearSelection` 或重新选择

## 相关文件

- 组件：`src/components/PrinterSelectModal/index.tsx`
- 样式：`src/components/PrinterSelectModal/index.css`
- Hook：`src/hooks/usePrinterSelect.ts`
- 打印机管理 Hook：`src/hooks/usePrinter.ts`
- 类型定义：`src/types/print.ts`
- 服务接口：`src/services/print.ts`

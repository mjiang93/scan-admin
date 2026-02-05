# 条码打印优化说明 - TOSHIBA BA410T

## 问题根源

### 为什么打印模糊？

**核心问题：使用 Canvas 转 PNG 图片导致的位图模糊**

1. **位图 vs 矢量图**
   - Canvas 生成的是位图（PNG），有固定分辨率
   - 打印时缩放位图会导致质量损失
   - 无论 DPI 多高，位图始终有像素化风险

2. **DPI 不匹配**
   - 浏览器默认：96 DPI
   - TOSHIBA BA410T 工业打印机：203 DPI 或 300 DPI
   - 位图在不同 DPI 下会失真

3. **图像转换损失**
   - Canvas → PNG → 打印，每次转换都有质量损失
   - 压缩算法会影响边缘清晰度

## 解决方案：使用 SVG 矢量格式

### 为什么 SVG 永不模糊？

**SVG 是矢量图形，不是像素图形**
- 存储的是数学公式，不是像素点
- 无论放大多少倍都不会失真
- 打印机直接渲染矢量路径，完美清晰

### 1. 使用 SVG 替代 Canvas

```typescript
// ❌ 旧方案：Canvas（位图）
const barcodeRefs = useRef<(HTMLCanvasElement | null)[]>([]);
<canvas ref={(el) => { barcodeRefs.current[index] = el; }}></canvas>

// ✅ 新方案：SVG（矢量）
const barcodeSvgRefs = useRef<(SVGSVGElement | null)[]>([]);
<svg ref={(el) => { barcodeSvgRefs.current[index] = el; }}></svg>
```

### 2. JsBarcode 生成 SVG

```typescript
// JsBarcode 支持直接生成 SVG
JsBarcode(svg, barcodeValue, {
  format: 'CODE128',
  width: 2,              // 条宽度
  height: 40,            // 条高度
  displayValue: true,
  fontSize: 14,          // 字体大小
  margin: 5,
  fontOptions: 'bold',
});
```

**优势**：
- 参数更简单，不需要考虑 DPI
- 生成的是矢量路径，不是像素
- 文字也是矢量字体，永不模糊

### 3. 直接打印 SVG

```typescript
// ❌ 旧方案：Canvas 转 PNG
const dataUrl = canvas.toDataURL('image/png', 1.0);
<img src="${dataUrl}" />

// ✅ 新方案：直接使用 SVG
const svgString = svg.outerHTML;
${svgString}
```

**优势**：
- 无转换损失
- 浏览器和打印机直接渲染矢量
- 文件更小，加载更快

### 4. CSS 优化

```css
/* SVG 条形码样式 - 矢量格式，永不模糊 */
.barcode-item svg {
  width: auto !important;
  height: 5.5mm !important;
  max-width: 46mm !important;
  display: block !important;
  shape-rendering: crispEdges !important;
}
```

**关键属性**：
- `shape-rendering: crispEdges`：确保边缘清晰，不做抗锯齿
- 使用 `mm` 单位：物理尺寸精确
- SVG 自动适应打印机 DPI

## 技术对比

### Canvas（位图）方案
```
条形码数据 → Canvas 绘制 → 位图像素 → PNG 编码 → Base64 → 打印缩放 → ❌ 模糊
```

**问题**：
- 每个环节都有质量损失
- 需要高 DPI 才能清晰（文件大）
- 缩放时会模糊

### SVG（矢量）方案
```
条形码数据 → SVG 路径 → 矢量图形 → 直接打印 → ✅ 完美清晰
```

**优势**：
- 零质量损失
- 文件小，加载快
- 任意缩放都清晰
- 打印机原生支持

## 工业打印机最佳实践

### TOSHIBA BA410T 规格
- 分辨率：203 DPI 或 300 DPI
- 标签尺寸：48mm x 6mm
- 打印方式：热转印或热敏
- **支持矢量图形渲染**

### 推荐设置

1. **条形码（SVG 矢量）**
   - 格式：CODE128
   - 条宽：2（矢量单位）
   - 高度：40（矢量单位）
   - 字体：14pt，加粗

2. **二维码（SVG 矢量）**
   - 尺寸：5.4mm x 5.4mm
   - 纠错级别：M
   - 格式：SVG

3. **文字**
   - 字号：1.2mm（约 3.4pt）
   - 字体：Arial、Microsoft YaHei
   - 样式：加粗

4. **打印质量**
   - 打印速度：中速（4-6 ips）
   - 打印浓度：中等
   - 使用高质量标签纸和碳带

## 测试建议

1. **打印测试**
   ```
   - 打印一张测试标签
   - 使用扫码枪测试条形码可读性
   - 检查文字清晰度
   - SVG 应该完美清晰，无像素化
   ```

2. **如果仍然有问题**
   - 调整条形码 `width` 和 `height` 参数
   - 增加字体大小
   - 检查打印机设置（速度、浓度）
   - 确认打印机支持 SVG（现代打印机都支持）

3. **打印机设置**
   ```
   - 打印速度：4-6 ips
   - 打印浓度：根据实际调整
   - 标签类型：热转印（推荐）
   ```

## 常见问题

### Q1: 条形码扫不出来
**A**: 
- 调整条宽度（width 参数）
- 降低打印速度
- 增加打印浓度
- 检查条形码格式是否正确
- SVG 格式不会有模糊问题

### Q2: 文字模糊
**A**:
- SVG 文字应该是清晰的
- 如果模糊，增加字体大小（fontSize）
- 确保使用加粗字体（fontOptions: 'bold'）
- 检查打印机是否正确渲染 SVG

### Q3: 二维码扫不出来
**A**:
- 增加二维码尺寸
- 降低纠错级别（level: 'L'）
- 确保二维码周围有足够空白
- SVG 二维码应该非常清晰

### Q4: 整体尺寸不对
**A**:
- 检查 @page 设置：`size: 48mm 6mm`
- 检查打印机驱动设置
- 使用打印机自带的标签设置工具
- 确保标签纸尺寸正确

### Q5: SVG 不显示或打印空白
**A**:
- 检查浏览器控制台是否有错误
- 确认 JsBarcode 正确生成了 SVG
- 检查 SVG 的 viewBox 和尺寸属性
- 尝试在浏览器打印预览中查看

## 代码变更总结

1. ✅ **Canvas 改为 SVG**（核心改进）
2. ✅ 条形码使用 SVG 矢量格式
3. ✅ 二维码已经是 SVG（QRCodeSVG）
4. ✅ 直接打印 SVG，无转换损失
5. ✅ CSS 优化 SVG 渲染（shape-rendering）
6. ✅ 字体加粗和尺寸优化
7. ✅ 打印延迟减少（SVG 加载更快）

## SVG vs Canvas 对比

| 特性 | Canvas (位图) | SVG (矢量) |
|------|--------------|-----------|
| 清晰度 | 取决于 DPI | 永远清晰 |
| 文件大小 | 大（高 DPI 时） | 小 |
| 缩放 | 会模糊 | 永不模糊 |
| 打印质量 | 取决于分辨率 | 完美 |
| 加载速度 | 慢（大文件） | 快 |
| 浏览器支持 | 好 | 好 |
| 打印机支持 | 好 | 更好 |

## 下一步

使用 SVG 后，打印质量应该完美。如果还有问题：
1. 检查打印机是否支持 SVG（现代打印机都支持）
2. 调整条形码参数（width, height, fontSize）
3. 调整打印机物理设置（速度、浓度）
4. 如果打印机不支持 SVG，考虑使用打印机原生语言（ZPL、EPL）

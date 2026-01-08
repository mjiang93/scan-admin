/**
 * 扫码枪扫描动画背景组件
 * 模拟扫码枪扫描条形码的动态效果
 */
import { useEffect, useRef } from 'react';
import './index.css';

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 扫码枪状态
    const scanner = {
      x: 0,
      y: height * 0.5,
      targetX: 0,
      targetY: 0,
      angle: 0,
      laserOn: false,
      laserProgress: 0,
      scanningBarcode: null as null | typeof barcodes[0],
      scanComplete: false,
      waitTime: 0,
    };

    // 条形码数组
    const barcodes: {
      x: number;
      y: number;
      width: number;
      height: number;
      bars: number[];
      scanned: boolean;
      glowIntensity: number;
      opacity: number;
    }[] = [];

    // 粒子效果（扫描成功时的粒子）
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
      size: number;
    }[] = [];

    // 浮动光点
    const floatingDots: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      pulsePhase: number;
    }[] = [];

    // 设置 Canvas 尺寸
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initBarcodes();
      initFloatingDots();
    };

    // 生成条形码图案
    const generateBars = (): number[] => {
      const bars: number[] = [];
      const count = Math.floor(Math.random() * 15 + 20);
      for (let i = 0; i < count; i++) {
        bars.push(Math.random() > 0.4 ? (Math.random() > 0.5 ? 2 : 1) : 0);
      }
      return bars;
    };

    // 初始化条形码
    const initBarcodes = () => {
      barcodes.length = 0;
      const count = Math.floor((width * height) / 120000) + 3;
      
      for (let i = 0; i < count; i++) {
        barcodes.push({
          x: Math.random() * (width - 150) + 50,
          y: Math.random() * (height - 80) + 40,
          width: Math.random() * 60 + 100,
          height: Math.random() * 20 + 40,
          bars: generateBars(),
          scanned: false,
          glowIntensity: 0,
          opacity: 0.6 + Math.random() * 0.3,
        });
      }
    };

    // 初始化浮动光点
    const initFloatingDots = () => {
      floatingDots.length = 0;
      const count = Math.floor((width * height) / 20000);
      
      for (let i = 0; i < count; i++) {
        floatingDots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 选择下一个要扫描的条形码
    const selectNextBarcode = () => {
      const unscanned = barcodes.filter(b => !b.scanned);
      if (unscanned.length === 0) {
        // 重置所有条形码
        barcodes.forEach(b => {
          b.scanned = false;
          b.glowIntensity = 0;
        });
        return selectNextBarcode();
      }
      return unscanned[Math.floor(Math.random() * unscanned.length)];
    };

    // 创建扫描成功粒子
    const createScanParticles = (x: number, y: number, w: number, h: number) => {
      const colors = ['#00ff88', '#00ffcc', '#88ff00', '#ffff00', '#00ccff'];
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: x + Math.random() * w,
          y: y + Math.random() * h,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2,
        });
      }
    };

    // 绘制扫码枪
    const drawScanner = () => {
      ctx.save();
      ctx.translate(scanner.x, scanner.y);
      ctx.rotate(scanner.angle);
      
      // 扫码枪主体
      const gradient = ctx.createLinearGradient(-15, -25, 15, 25);
      gradient.addColorStop(0, '#4a5568');
      gradient.addColorStop(0.5, '#2d3748');
      gradient.addColorStop(1, '#1a202c');
      
      // 枪身
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(-12, -20, 24, 50, 4);
      ctx.fill();
      
      // 扫描头
      ctx.fillStyle = '#1a202c';
      ctx.beginPath();
      ctx.roundRect(-15, -30, 30, 15, 3);
      ctx.fill();
      
      // 扫描窗口
      ctx.fillStyle = scanner.laserOn ? '#ff3333' : '#333';
      ctx.fillRect(-10, -28, 20, 8);
      
      // 发光效果
      if (scanner.laserOn) {
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(-10, -28, 20, 8);
        ctx.shadowBlur = 0;
      }
      
      // 把手
      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.roundRect(-8, 25, 16, 20, 3);
      ctx.fill();
      
      ctx.restore();
    };

    // 绘制激光束
    const drawLaser = () => {
      if (!scanner.laserOn || !scanner.scanningBarcode) return;
      
      const barcode = scanner.scanningBarcode;
      const laserY = barcode.y + barcode.height * scanner.laserProgress;
      
      ctx.save();
      
      // 激光线
      const gradient = ctx.createLinearGradient(barcode.x, laserY, barcode.x + barcode.width, laserY);
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
      gradient.addColorStop(0.1, 'rgba(255, 0, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 50, 50, 1)');
      gradient.addColorStop(0.9, 'rgba(255, 0, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 20;
      
      ctx.beginPath();
      ctx.moveTo(barcode.x - 10, laserY);
      ctx.lineTo(barcode.x + barcode.width + 10, laserY);
      ctx.stroke();
      
      // 激光点
      ctx.fillStyle = '#ff0000';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(barcode.x + barcode.width / 2, laserY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    // 绘制条形码
    const drawBarcode = (barcode: typeof barcodes[0]) => {
      ctx.save();
      
      // 条形码背景
      ctx.fillStyle = `rgba(255, 255, 255, ${barcode.opacity * 0.15})`;
      ctx.fillRect(barcode.x - 5, barcode.y - 5, barcode.width + 10, barcode.height + 20);
      
      // 发光效果
      if (barcode.glowIntensity > 0) {
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20 * barcode.glowIntensity;
      }
      
      // 绘制条形码线条
      const barWidth = barcode.width / barcode.bars.length;
      barcode.bars.forEach((bar, i) => {
        if (bar > 0) {
          const w = bar === 2 ? barWidth * 0.8 : barWidth * 0.4;
          const color = barcode.scanned 
            ? `rgba(0, 255, 136, ${barcode.opacity})` 
            : `rgba(255, 255, 255, ${barcode.opacity})`;
          ctx.fillStyle = color;
          ctx.fillRect(barcode.x + i * barWidth, barcode.y, w, barcode.height);
        }
      });
      
      // 条形码下方数字
      ctx.fillStyle = barcode.scanned 
        ? `rgba(0, 255, 136, ${barcode.opacity})` 
        : `rgba(255, 255, 255, ${barcode.opacity * 0.7})`;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('1234567890', barcode.x + barcode.width / 2, barcode.y + barcode.height + 12);
      
      ctx.restore();
    };

    // 绘制浮动光点
    const drawFloatingDots = (time: number) => {
      floatingDots.forEach(dot => {
        // 更新位置
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        // 边界反弹
        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;
        
        // 脉冲效果
        const pulse = Math.sin(time * 0.002 + dot.pulsePhase) * 0.3 + 0.7;
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${dot.opacity * pulse})`;
        ctx.fill();
      });
    };

    // 绘制粒子
    const drawParticles = () => {
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // 重力
        p.life -= 0.02;
        
        if (p.life <= 0) {
          particles.splice(i, 1);
          return;
        }
        
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    // 绘制网格
    const drawGrid = (time: number) => {
      const gridSize = 50;
      const waveAmplitude = 0.02;
      
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.08)';
      ctx.lineWidth = 1;
      
      // 垂直线
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (let y = 0; y < height; y += 10) {
          const wave = Math.sin(y * 0.01 + time * 0.001) * 5;
          ctx.lineTo(x + wave, y);
        }
        ctx.stroke();
      }
      
      // 水平线
      for (let y = 0; y < height; y += gridSize) {
        const opacity = 0.05 + Math.sin(time * 0.001 + y * waveAmplitude) * 0.03;
        ctx.strokeStyle = `rgba(100, 150, 200, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    // 绘制扫描框装饰
    const drawScanFrame = () => {
      if (!scanner.scanningBarcode) return;
      
      const b = scanner.scanningBarcode;
      const padding = 15;
      const cornerSize = 20;
      
      ctx.strokeStyle = scanner.laserOn ? 'rgba(255, 100, 100, 0.8)' : 'rgba(100, 200, 255, 0.5)';
      ctx.lineWidth = 2;
      
      // 四个角
      // 左上
      ctx.beginPath();
      ctx.moveTo(b.x - padding, b.y - padding + cornerSize);
      ctx.lineTo(b.x - padding, b.y - padding);
      ctx.lineTo(b.x - padding + cornerSize, b.y - padding);
      ctx.stroke();
      
      // 右上
      ctx.beginPath();
      ctx.moveTo(b.x + b.width + padding - cornerSize, b.y - padding);
      ctx.lineTo(b.x + b.width + padding, b.y - padding);
      ctx.lineTo(b.x + b.width + padding, b.y - padding + cornerSize);
      ctx.stroke();
      
      // 左下
      ctx.beginPath();
      ctx.moveTo(b.x - padding, b.y + b.height + padding + 10 - cornerSize);
      ctx.lineTo(b.x - padding, b.y + b.height + padding + 10);
      ctx.lineTo(b.x - padding + cornerSize, b.y + b.height + padding + 10);
      ctx.stroke();
      
      // 右下
      ctx.beginPath();
      ctx.moveTo(b.x + b.width + padding - cornerSize, b.y + b.height + padding + 10);
      ctx.lineTo(b.x + b.width + padding, b.y + b.height + padding + 10);
      ctx.lineTo(b.x + b.width + padding, b.y + b.height + padding + 10 - cornerSize);
      ctx.stroke();
    };

    // 更新扫码枪状态
    const updateScanner = () => {
      if (scanner.waitTime > 0) {
        scanner.waitTime--;
        return;
      }
      
      if (!scanner.scanningBarcode) {
        scanner.scanningBarcode = selectNextBarcode();
        scanner.targetX = scanner.scanningBarcode.x - 50;
        scanner.targetY = scanner.scanningBarcode.y + scanner.scanningBarcode.height / 2;
        scanner.laserOn = false;
        scanner.laserProgress = 0;
        scanner.scanComplete = false;
      }
      
      // 移动扫码枪到目标位置
      const dx = scanner.targetX - scanner.x;
      const dy = scanner.targetY - scanner.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 5) {
        scanner.x += dx * 0.05;
        scanner.y += dy * 0.05;
        // 计算朝向角度
        scanner.angle = Math.atan2(
          scanner.scanningBarcode.y + scanner.scanningBarcode.height / 2 - scanner.y,
          scanner.scanningBarcode.x + scanner.scanningBarcode.width / 2 - scanner.x
        ) - Math.PI / 2;
      } else if (!scanner.laserOn && !scanner.scanComplete) {
        // 到达位置，开始扫描
        scanner.laserOn = true;
      }
      
      // 扫描进度
      if (scanner.laserOn && !scanner.scanComplete) {
        scanner.laserProgress += 0.02;
        
        if (scanner.laserProgress >= 1) {
          scanner.scanComplete = true;
          scanner.laserOn = false;
          scanner.scanningBarcode.scanned = true;
          scanner.scanningBarcode.glowIntensity = 1;
          createScanParticles(
            scanner.scanningBarcode.x,
            scanner.scanningBarcode.y,
            scanner.scanningBarcode.width,
            scanner.scanningBarcode.height
          );
          scanner.waitTime = 60; // 等待一秒
          scanner.scanningBarcode = null;
        }
      }
      
      // 衰减发光效果
      barcodes.forEach(b => {
        if (b.glowIntensity > 0) {
          b.glowIntensity *= 0.98;
        }
      });
    };

    let time = 0;
    
    // 动画循环
    const animate = () => {
      time++;
      ctx.clearRect(0, 0, width, height);
      
      // 绘制网格
      drawGrid(time);
      
      // 绘制浮动光点
      drawFloatingDots(time);
      
      // 绘制所有条形码
      barcodes.forEach(drawBarcode);
      
      // 更新扫码枪
      updateScanner();
      
      // 绘制扫描框
      drawScanFrame();
      
      // 绘制激光
      drawLaser();
      
      // 绘制扫码枪
      drawScanner();
      
      // 绘制粒子
      drawParticles();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // 初始化扫码枪位置
    scanner.x = -50;
    scanner.y = height / 2;
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="particle-background">
      <canvas ref={canvasRef} className="particle-canvas" />
      <div className="gradient-overlay" />
    </div>
  );
}

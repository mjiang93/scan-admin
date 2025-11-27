/**
 * 上传组件
 */
import { Upload as AntUpload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps as AntUploadProps, UploadFile } from 'antd';
import { useState } from 'react';
import { getConfig } from '@/config';

export interface BasicUploadProps extends Omit<AntUploadProps, 'beforeUpload'> {
  // 允许的文件类型
  acceptTypes?: string[];
  // 最大文件大小（MB）
  maxSize?: number;
  // 上传成功回调
  onSuccess?: (file: UploadFile) => void;
  // 上传失败回调
  onError?: (error: Error) => void;
}

export default function BasicUpload({
  acceptTypes,
  maxSize,
  onSuccess,
  onError,
  ...restProps
}: BasicUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 获取配置
  const config = getConfig('upload');
  const finalAcceptTypes = acceptTypes || config.acceptTypes;
  const finalMaxSize = maxSize || config.maxSize;

  /**
   * 上传前验证
   */
  const beforeUpload = (file: File) => {
    // 验证文件类型
    if (finalAcceptTypes && finalAcceptTypes.length > 0) {
      const isValidType = finalAcceptTypes.includes(file.type);
      if (!isValidType) {
        message.error(`只能上传 ${finalAcceptTypes.join(', ')} 格式的文件`);
        return false;
      }
    }

    // 验证文件大小
    const isValidSize = file.size / 1024 / 1024 < finalMaxSize;
    if (!isValidSize) {
      message.error(`文件大小不能超过 ${finalMaxSize}MB`);
      return false;
    }

    return true;
  };

  /**
   * 文件变化处理
   */
  const handleChange: AntUploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];

    // 限制文件列表长度
    newFileList = newFileList.slice(-1);

    setFileList(newFileList);

    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
      if (onSuccess) {
        onSuccess(info.file);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
      if (onError) {
        onError(new Error('上传失败'));
      }
    }
  };

  return (
    <AntUpload
      fileList={fileList}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      {...restProps}
    >
      {fileList.length === 0 && (
        <div>
          <UploadOutlined />
          <div style={{ marginTop: 8 }}>点击上传</div>
        </div>
      )}
    </AntUpload>
  );
}

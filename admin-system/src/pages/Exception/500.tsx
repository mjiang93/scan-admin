/**
 * 500 服务器错误
 */
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Exception500() {
  const navigate = useNavigate();
  
  return (
    <Result
      status="500"
      title="500"
      subTitle="抱歉，服务器出错了"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      }
    />
  );
}

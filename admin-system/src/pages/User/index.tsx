/**
 * 用户管理页面
 */
import { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  Modal, 
  Table, 
  Card, 
  Form, 
  Input, 
  Select, 
  Tag,
  Row,
  Col
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useUserManage } from '@/hooks/useUserManage';
import type { UserRecord, UserFormData, UserSearchParams } from '@/services/user';

const { Option } = Select;

export default function UserManage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [submitting, setSubmitting] = useState(false); // 添加提交状态
  
  // 使用自定义Hook管理用户数据
  const {
    users,
    loading,
    pagination,
    fetchUsers,
    handleCreate,
    handleUpdate,
    handleSearch,
    handlePageChange,
  } = useUserManage();

  // 组件挂载时获取用户列表
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 搜索处理
  const onSearch = async () => {
    try {
      const values = await searchForm.validateFields();
      
      // 过滤空值，使用正确的API字段名
      const searchParams: UserSearchParams = {};
      if (values.userId?.trim()) {
        searchParams.userId = values.userId.trim();
      }
      if (values.userName?.trim()) {
        searchParams.userName = values.userName.trim();
      }
      if (values.status !== undefined) {
        searchParams.status = values.status;
      }
      
      await handleSearch(searchParams);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  // 新增用户
  const onAdd = () => {
    try {
      console.log('点击添加用户按钮');
      setEditingUser(null);
      form.resetFields();
      setModalOpen(true);
      console.log('添加用户弹窗已打开');
    } catch (error) {
      console.error('添加用户按钮点击错误:', error);
    }
  };

  // 编辑用户
  const onEdit = (user: UserRecord) => {
    console.log('编辑用户:', user);
    setEditingUser(user);
    form.setFieldsValue({
      userId: user.userId,
      userName: user.userName,
      status: user.status,
      password: undefined,
      confirmPassword: undefined,
    });
    setModalOpen(true);
  };

  // 提交表单
  const onSubmit = async () => {
    if (submitting) return; // 防止重复提交
    
    try {
      console.log('开始提交表单');
      setSubmitting(true);
      const values = await form.validateFields();
      console.log('表单验证通过，数据:', values);
      
      if (editingUser) {
        // 编辑用户逻辑
        const formData: UserFormData = {
          userId: values.userId,
          userName: values.userName,
          status: values.status !== undefined ? values.status : 0,
        };
        if (values.password) {
          formData.password = values.password;
        }
        console.log('更新用户数据:', formData);
        await handleUpdate(editingUser.id, formData);
      } else {
        // 新增用户
        const formData: UserFormData = {
          userId: values.userId,
          userName: values.userName,
          password: values.password,
          status: values.status !== undefined ? values.status : 0,
        };
        console.log('创建用户数据:', formData);
        await handleCreate(formData);
      }
      console.log('用户操作成功');
      setModalOpen(false);
    } catch (error) {
      // 如果是取消错误，不显示错误消息
      if (error && typeof error === 'object' && 'name' in error && error.name === 'CanceledError') {
        console.log('提交请求被取消');
        return;
      }
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 分页变化处理
  const onTableChange = (paginationConfig: TablePaginationConfig) => {
    if (paginationConfig?.current && paginationConfig?.pageSize) {
      handlePageChange(paginationConfig.current, paginationConfig.pageSize);
    }
  };

  // 表格列配置
  const columns: ColumnsType<UserRecord> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => {
        const { current, pageSize } = pagination;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'registerTime',
      key: 'registerTime',
      width: 160,
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: number) => (
        <Tag color={status === 0 ? 'green' : 'orange'}>
          {status === 0 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={onSearch}
        >
          <Row gutter={16} style={{ width: '100%' }}>
            <Col>
              <Form.Item label="用户ID" name="userId">
                <Input 
                  placeholder="模糊查询" 
                  style={{ width: 200 }} 
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col>
              <Form.Item label="用户名称" name="userName">
                <Input 
                  placeholder="请输入" 
                  style={{ width: 200 }} 
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col>
              <Form.Item label="状态" name="status">
                <Select 
                  placeholder="请选择" 
                  style={{ width: 120 }} 
                  allowClear
                >
                  <Option value={0}>正常</Option>
                  <Option value={1}>禁用</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col>
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    onClick={onSearch}
                    loading={loading}
                  >
                    查询
                  </Button>
                  <Button 
                    onClick={onAdd}
                    type="primary"
                  >
                    添加
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 用户表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={Array.isArray(users) ? users.map(user => ({ ...user, key: user.id })) : []}
          loading={loading}
          onChange={onTableChange}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          size="middle"
          bordered
        />
      </Card>

      {/* 用户表单弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={onSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        confirmLoading={submitting}
        okButtonProps={{ disabled: submitting }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="用户ID"
            name="userId"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input placeholder="请输入用户ID" />
          </Form.Item>
          
          <Form.Item
            label="用户名称"
            name="userName"
            rules={[{ required: true, message: '请输入用户名称' }]}
          >
            <Input placeholder="请输入用户名称" />
          </Form.Item>
          
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: !editingUser, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder={editingUser ? '留空则不修改密码' : '请输入密码'} />
          </Form.Item>
          
          <Form.Item
            label="密码确认"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              ...(editingUser ? [] : [{ required: true, message: '请确认密码' }]),
              ({ getFieldValue }: { getFieldValue: (name: string) => string }) => ({
                validator(_: unknown, value: string) {
                  const password = getFieldValue('password');
                  if (!password && !value) {
                    return Promise.resolve();
                  }
                  if (!value && !editingUser) {
                    return Promise.reject(new Error('请确认密码'));
                  }
                  if (password && password !== value) {
                    return Promise.reject(new Error('密码校验不一致'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>
          
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue={0}
          >
            <Select placeholder="请选择状态">
              <Option value={0}>正常</Option>
              <Option value={1}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
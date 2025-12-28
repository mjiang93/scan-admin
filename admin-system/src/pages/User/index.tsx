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
  }, []);

  // 搜索处理
  const onSearch = async () => {
    try {
      const values = await searchForm.validateFields();
      
      // 过滤空值
      const searchParams: UserSearchParams = {};
      if (values.username?.trim()) {
        searchParams.username = values.username.trim();
      }
      if (values.realName?.trim()) {
        searchParams.realName = values.realName.trim();
      }
      if (values.status) {
        searchParams.status = values.status;
      }
      
      await handleSearch(searchParams);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  };

  // 新增用户
  const onAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  // 编辑用户
  const onEdit = (user: UserRecord) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalOpen(true);
  };

  // 提交表单
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: UserFormData = {
        username: values.username,
        realName: values.realName,
        email: values.email,
        phone: values.phone,
        status: values.status || 'normal',
      };

      if (editingUser) {
        await handleUpdate(editingUser.id, formData);
      } else {
        await handleCreate(formData);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('提交失败:', error);
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 120,
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      key: 'registerTime',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status) => (
        <Tag color={status === 'normal' ? 'green' : 'orange'}>
          {status === 'normal' ? '正常' : '禁用'}
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
              <Form.Item label="用户名" name="username">
                <Input 
                  placeholder="模糊查询" 
                  style={{ width: 200 }} 
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col>
              <Form.Item label="姓名" name="realName">
                <Input 
                  placeholder="请输入" 
                  style={{ width: 200 }} 
                  allowClear
                />
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
          dataSource={users.map(user => ({ ...user, key: user.id }))}
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
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            label="姓名"
            name="realName"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="normal">正常</Option>
              <Option value="disabled">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
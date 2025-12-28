/**
 * 用户管理页面
 */
import { useState } from 'react';
import { 
  Button, 
  Space, 
  message, 
  Modal, 
  Table, 
  Card, 
  Form, 
  Input, 
  Select, 
  Tag,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

// 用户数据类型
interface UserRecord {
  key: string;
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  role: string;
  roleName: string;
  status: 'active' | 'inactive';
  createTime: string;
  lastLoginTime?: string;
}

// 模拟用户数据
const mockUsers: UserRecord[] = [
  {
    key: '1',
    id: '1',
    username: 'admin',
    nickname: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    role: '1',
    roleName: '管理员',
    status: 'active',
    createTime: '2024-01-01 10:00:00',
    lastLoginTime: '2024-12-28 09:30:00',
  },
  {
    key: '2',
    id: '2',
    username: 'user001',
    nickname: '普通用户1',
    email: 'user001@example.com',
    phone: '13800138001',
    role: '2',
    roleName: '普通用户',
    status: 'active',
    createTime: '2024-01-02 10:00:00',
    lastLoginTime: '2024-12-27 15:20:00',
  },
  {
    key: '3',
    id: '3',
    username: 'user002',
    nickname: '普通用户2',
    email: 'user002@example.com',
    phone: '13800138002',
    role: '2',
    roleName: '普通用户',
    status: 'inactive',
    createTime: '2024-01-03 10:00:00',
  },
];

export default function UserManage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<UserRecord[]>(mockUsers);

  // 搜索处理
  const handleSearch = () => {
    setLoading(true);
    searchForm.validateFields().then(values => {
      console.log('搜索参数:', values);
      // 这里应该调用API进行搜索
      setTimeout(() => {
        setLoading(false);
        message.success('搜索完成');
      }, 1000);
    }).catch(() => {
      setLoading(false);
    });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setDataSource(mockUsers);
  };

  // 新增用户
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  // 编辑用户
  const handleEdit = (user: UserRecord) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalOpen(true);
  };

  // 删除用户
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: () => {
        setDataSource(prev => prev.filter(item => item.id !== id));
        message.success('删除成功');
      },
    });
  };

  // 提交表单
  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingUser) {
        // 更新用户
        setDataSource(prev => 
          prev.map(item => 
            item.id === editingUser.id 
              ? { ...item, ...values, roleName: values.role === '1' ? '管理员' : '普通用户' }
              : item
          )
        );
        message.success('更新成功');
      } else {
        // 新增用户
        const newUser: UserRecord = {
          key: Date.now().toString(),
          id: Date.now().toString(),
          ...values,
          roleName: values.role === '1' ? '管理员' : '普通用户',
          status: 'active',
          createTime: new Date().toLocaleString(),
        };
        setDataSource(prev => [...prev, newUser]);
        message.success('创建成功');
      }
      setModalOpen(false);
    });
  };

  // 表格列配置
  const columns: ColumnsType<UserRecord> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 100,
      render: (roleName) => (
        <Tag color={roleName === '管理员' ? 'red' : 'blue'}>
          {roleName}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 150,
      render: (time) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
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
          onFinish={handleSearch}
        >
          <Form.Item label="关键词" name="keyword">
            <Input placeholder="用户名/昵称" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="角色" name="role">
            <Select placeholder="全部" style={{ width: 120 }} allowClear>
              <Option value="1">管理员</Option>
              <Option value="2">普通用户</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="状态" name="status">
            <Select placeholder="全部" style={{ width: 120 }} allowClear>
              <Option value="active">正常</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                查询
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 操作按钮 */}
      <Card style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
        >
          新增用户
        </Button>
      </Card>

      {/* 用户表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: dataSource.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 用户表单弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleSubmit}
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
            label="昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
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
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="1">管理员</Option>
              <Option value="2">普通用户</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">正常</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/**
 * 用户管理页面
 */
import { useState } from 'react';
import { Button, Space, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { BasicTable, SearchForm, BasicModal, BasicForm } from '@/components';
import { useTable } from '@/hooks';
import { getUserList, createUser, updateUser, deleteUser } from '@/services/user';
import type { User } from '@/types';

export default function UserManage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 使用表格Hook
  const { loading, dataSource, pagination, loadData, refresh } = useTable({
    onLoad: async (params) => {
      const result = await getUserList(params);
      return result;
    },
  });

  // 搜索字段配置
  const searchFields = [
    { name: 'keyword', label: '关键词', type: 'input' as const, placeholder: '用户名/昵称' },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' },
      ],
    },
  ];

  // 表单字段配置
  const formFields = [
    { name: 'username', label: '用户名', type: 'input' as const, required: true },
    { name: 'nickname', label: '昵称', type: 'input' as const, required: true },
    { name: 'email', label: '邮箱', type: 'input' as const },
    { name: 'phone', label: '手机号', type: 'input' as const },
    {
      name: 'roleId',
      label: '角色',
      type: 'select' as const,
      required: true,
      options: [
        { label: '管理员', value: '1' },
        { label: '普通用户', value: '2' },
      ],
    },
  ];

  // 表格列配置
  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'roleName', key: 'roleName' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 新增用户
  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  // 编辑用户
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  // 删除用户
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: async () => {
        await deleteUser(id);
        message.success('删除成功');
        refresh();
      },
    });
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    if (editingUser) {
      await updateUser(editingUser.id, values);
      message.success('更新成功');
    } else {
      await createUser(values);
      message.success('创建成功');
    }
    setModalOpen(false);
    refresh();
  };

  return (
    <div>
      <SearchForm fields={searchFields} onSearch={loadData} />

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
      </div>

      <BasicTable
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        onRefresh={refresh}
      />

      <BasicModal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
      >
        <BasicForm fields={formFields} onFinish={handleSubmit} />
      </BasicModal>
    </div>
  );
}

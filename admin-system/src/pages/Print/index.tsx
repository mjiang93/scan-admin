/**
 * 条码打印页面
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Table, 
  Space, 
  message, 
  Tag,
  Popconfirm
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Dayjs } from 'dayjs';
import { queryBarcodeRecords, createCode } from '@/services/print';
import type { BarcodeRecord, BarcodeQueryParams, ApiBarcodeRecord } from '@/types/print';
import BarcodeModal from '@/components/BarcodeModal';
import InnerPackagingModal from '@/components/InnerPackagingModal';
import OuterPackagingModal from '@/components/OuterPackagingModal';
import EditRecordModal from '@/components/EditRecordModal';
import BatchAccessoryModal from '@/components/BatchAccessoryModal';
import BatchDrawingVersionModal from '@/components/BatchDrawingVersionModal';
import SyncErpModal from '@/components/SyncErpModal';
import './index.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

export function PrintPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<BarcodeRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // 弹窗状态
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [innerPackagingModalVisible, setInnerPackagingModalVisible] = useState(false);
  const [outerPackagingModalVisible, setOuterPackagingModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [batchAccessoryModalVisible, setBatchAccessoryModalVisible] = useState(false);
  const [batchDrawingVersionModalVisible, setBatchDrawingVersionModalVisible] = useState(false);
  const [syncErpModalVisible, setSyncErpModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<BarcodeRecord | null>(null);
  
  // 使用ref来存储搜索参数，避免依赖问题
  const searchParamsRef = useRef<Partial<BarcodeQueryParams>>({});

  // 加载数据
  const loadData = useCallback(async (page = 1, pageSize = 10, params: Partial<BarcodeQueryParams> = {}) => {
    setLoading(true);
    try {
      const queryParams: Partial<BarcodeQueryParams> = {
        page,
        size: pageSize,
        // offset: (page - 1) * pageSize,
        ...params,
      };

      const response = await queryBarcodeRecords(queryParams);
      // 直接使用API返回的数据，只添加key字段
      const records = response.data.result.map((item: ApiBarcodeRecord, index: number) => ({
        key: item.id || `${index}`,
        ...item,
      }));

      setDataSource(records);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.data.total,
      });
    } catch (error) {
      console.error('查询失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 搜索处理
  const handleSearch = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      // 处理日期范围
      let deliveryDateStart: string | undefined;
      let deliveryDateEnd: string | undefined;
      
      if (values.deliveryDateRange && Array.isArray(values.deliveryDateRange) && values.deliveryDateRange.length === 2) {
        const [startDate, endDate] = values.deliveryDateRange as [Dayjs, Dayjs];
        deliveryDateStart = startDate.format('YYYY-MM-DD');
        deliveryDateEnd = endDate.format('YYYY-MM-DD');
      }

      const newSearchParams: Partial<BarcodeQueryParams> = {
        productCode: values.productCode, // 产品编号
        orderCode: values.orderCode, // 单据编号
        codeSn: values.codeSn, // SN码
        code09: values.code09, // 09码
        factoryCode: values.factoryCode, // 出厂编号
        projectCode: values.projectCode, // 项目编码
        deliveryDateStart,
        deliveryDateEnd,
        printStatus: values.printStatus !== undefined ? values.printStatus : undefined,
      };

      searchParamsRef.current = newSearchParams;
      setPagination(prev => ({ ...prev, current: 1 })); // 重置到第一页
      await loadData(1, 10, newSearchParams);
      message.success('查询完成');
    } catch (error) {
      console.error('搜索失败:', error);
    }
  }, [form, loadData]);

  // 重置搜索
  const handleReset = useCallback(() => {
    form.resetFields();
    searchParamsRef.current = {};
    loadData(); // 使用默认参数
  }, [form, loadData]);

  // 表格分页变化处理
  const handleTableChange = useCallback((paginationConfig: { current?: number; pageSize?: number }) => {
    const newCurrent = paginationConfig.current || 1;
    const newPageSize = paginationConfig.pageSize || 10;
    loadData(newCurrent, newPageSize, searchParamsRef.current);
  }, [loadData]);

  // 批量打印标签
  const handleBatchPrint = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要添加附件的记录');
      return;
    }
    
    setBatchAccessoryModalVisible(true);
  }, [selectedRowKeys]);

  // 批量更新图纸版本
  const handleBatchUpdateDrawingVersion = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要更新图纸版本的记录');
      return;
    }
    
    setBatchDrawingVersionModalVisible(true);
  }, [selectedRowKeys]);

  // 同步ERP系统
  const handleSyncErp = useCallback(() => {
    setSyncErpModalVisible(true);
  }, []);

  // 本体操作
  const handleBodyOperation = useCallback((record: BarcodeRecord) => {
    setCurrentRecord(record);
    setBarcodeModalVisible(true);
  }, []);

  // 内包装操作
  const handleInnerPackaging = useCallback((record: BarcodeRecord) => {
    setCurrentRecord(record);
    setInnerPackagingModalVisible(true);
  }, []);

  // 外包装操作
  const handleOuterPackaging = useCallback((record: BarcodeRecord) => {
    setCurrentRecord(record);
    setOuterPackagingModalVisible(true);
  }, []);

  // 编辑操作
  const handleEdit = useCallback((record: BarcodeRecord) => {
    setCurrentRecord(record);
    setEditModalVisible(true);
  }, []);

  // 生成操作
  const handleGenerate = useCallback(async (record: BarcodeRecord) => {
    try {
      // 获取当前用户信息
      const userInfo = localStorage.getItem('userInfo');
      const operator = userInfo ? JSON.parse(userInfo).userId : '';
      
      if (!operator) {
        message.error('未获取到用户信息');
        return;
      }

      const response = await createCode({
        id: String(record.id),
        operator,
      });

      if (response.success) {
        message.success('生成成功');
        // 重新加载数据
        loadData(pagination.current, pagination.pageSize, searchParamsRef.current);
      } else {
        message.error(response.errorMsg || '生成失败');
      }
    } catch (error) {
      console.error('生成失败:', error);
    }
  }, [loadData, pagination]);

  // 表格列配置
  const columns: ColumnsType<BarcodeRecord> = [
    {
      title: '产品编号',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 210,
      fixed: 'left',
    },
    {
      title: '单据编号',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 200,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '项目编码',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
    },
    {
      title: '供应商代码',
      dataIndex: 'supplierCode',
      key: 'supplierCode',
      width: 150,
    },
    {
      title: '出厂码',
      dataIndex: 'factoryCode',
      key: 'factoryCode',
      width: 150,
    },
    
    {
      title: 'SN码',
      dataIndex: 'codeSn',
      key: 'codeSn',
      width: 264,
    },
    {
      title: '09码',
      dataIndex: 'code09',
      key: 'code09',
      width: 230,
    },
     {
      title: '客户物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 180,
    },
    {
      title: '送货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
      render: (date: string) => date ? new Date(parseInt(date)).toLocaleDateString() : '',
    },
    {
      title: '图纸版本',
      dataIndex: 'drawingVersion',
      key: 'drawingVersion',
      width: 100,
    },
    {
      title: '附件',
      dataIndex: 'accessoryCnt',
      key: 'accessoryCnt',
      width: 80,
    },
    {
      title: '打印状态',
      dataIndex: 'printStatus',
      key: 'printStatus',
      width: 100,
      render: (status: number) => {
        const statusMap = {
          0: { color: 'default', text: '未打印' },
          1: { color: 'orange', text: '部份打印' },
          2: { color: 'green', text: '已打印' },
        };
        const config = statusMap[status as 0 | 1 | 2] || statusMap[0];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 350,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => handleBodyOperation(record)}
          >
            本体
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => handleInnerPackaging(record)}
          >
            内包装
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => handleOuterPackaging(record)}
          >
            外包装
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认生成"
            description="确定要生成SN码和09码吗？"
            onConfirm={() => handleGenerate(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              size="small"
            >
              生成
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="barcode-print-page">
      {/* 搜索表单 */}
      <Card className="search-card" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item label="产品编号" name="productCode">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="单据编号" name="orderCode">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="SN码" name="codeSn">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="09码" name="code09">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="出厂编号" name="factoryCode">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="项目编码" name="projectCode">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="送货日期" name="deliveryDateRange">
            <RangePicker 
              style={{ width: 240 }} 
              placeholder={['开始日期', '结束日期']}
            />
          </Form.Item>
          
          <Form.Item label="打印状态" name="printStatus">
            <Select placeholder="全部" style={{ width: 120 }} allowClear>
              <Option value={0}>未打印</Option>
              <Option value={1}>部份打印</Option>
              <Option value={2}>已打印</Option>
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
      <Card className="action-card" style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            onClick={handleBatchPrint}
            disabled={selectedRowKeys.length === 0}
          >
            批量添加附件
          </Button>
          <Button 
            onClick={handleBatchUpdateDrawingVersion}
            disabled={selectedRowKeys.length === 0}
          >
            批量更新图纸版本
          </Button>
          <Button 
            onClick={handleSyncErp}
          >
            同步
          </Button>
        </Space>
        {selectedRowKeys.length > 0 && (
          <span style={{ marginLeft: 16, color: '#666' }}>
            已选择 {selectedRowKeys.length} 项
          </span>
        )}
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              handleTableChange({ current: page, pageSize });
            },
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 条码弹窗 */}
      <BarcodeModal
        visible={barcodeModalVisible}
        onClose={() => setBarcodeModalVisible(false)}
        record={currentRecord}
      />

      {/* 内包装条码弹窗 */}
      <InnerPackagingModal
        visible={innerPackagingModalVisible}
        onClose={() => setInnerPackagingModalVisible(false)}
        record={currentRecord}
      />

      {/* 外包装标签弹窗 */}
      <OuterPackagingModal
        visible={outerPackagingModalVisible}
        onClose={() => setOuterPackagingModalVisible(false)}
        record={currentRecord}
      />

      {/* 编辑记录弹窗 */}
      <EditRecordModal
        visible={editModalVisible}
        record={currentRecord}
        onClose={() => setEditModalVisible(false)}
        onSuccess={() => {
          // 编辑成功后重新加载数据
          loadData(pagination.current, pagination.pageSize, searchParamsRef.current);
        }}
      />

      {/* 批量添加附件弹窗 */}
      <BatchAccessoryModal
        visible={batchAccessoryModalVisible}
        selectedIds={selectedRowKeys}
        onClose={() => setBatchAccessoryModalVisible(false)}
        onSuccess={() => {
          // 添加附件成功后重新加载数据并清空选择
          loadData(pagination.current, pagination.pageSize, searchParamsRef.current);
          setSelectedRowKeys([]);
        }}
      />

      {/* 批量更新图纸版本弹窗 */}
      <BatchDrawingVersionModal
        visible={batchDrawingVersionModalVisible}
        selectedIds={selectedRowKeys}
        onClose={() => setBatchDrawingVersionModalVisible(false)}
        onSuccess={() => {
          // 更新图纸版本成功后重新加载数据并清空选择
          loadData(pagination.current, pagination.pageSize, searchParamsRef.current);
          setSelectedRowKeys([]);
        }}
      />

      {/* 同步ERP系统弹窗 */}
      <SyncErpModal
        visible={syncErpModalVisible}
        onClose={() => setSyncErpModalVisible(false)}
        onSuccess={() => {
          // 同步成功后重新加载数据
          loadData(pagination.current, pagination.pageSize, searchParamsRef.current);
        }}
      />
    </div>
  );
}

export default PrintPage;

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
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  PrinterOutlined, 
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Dayjs } from 'dayjs';
import { queryBarcodeRecords } from '@/services/print';
import type { BarcodeRecord, BarcodeQueryParams, ApiBarcodeRecord } from '@/types/print';
import BarcodeModal from '@/components/BarcodeModal';
import InnerPackagingModal from '@/components/InnerPackagingModal';
import OuterPackagingModal from '@/components/OuterPackagingModal';
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
      
      // 转换数据格式，添加key字段，并映射字段名
      const records = response.data.result.map((item: ApiBarcodeRecord, index: number) => ({
        key: item.id || `${index}`,
        id: item.id,
        supplierCode: item.supplierCode, // 单据编号
        projectCode: item.projectCode,
        factoryCode: item.factoryCode,
        productionLine: item.lineName, // API返回lineName，映射到productionLine
        techVersion: item.technicalVersion, // API返回technicalVersion，映射到techVersion
        snCode: item.codeSn, // API返回codeSn，映射到snCode
        code09: item.code09,
        deliveryDate: item.deliveryDate ? new Date(parseInt(item.deliveryDate)).toLocaleDateString() : '', // 时间戳转换
        templateSnCode: item.codeSn, // 使用codeSn作为模板SN码
        circuitBoardCode: item.materialCode, // 使用materialCode作为电路板编号
        accessories: `${item.accessoryCnt || 0}件`, // 附件数量
        printStatus: item.printStatus === 0 ? 'pending' : item.printStatus === 1 ? 'printed' : 'completed' as 'pending' | 'printed' | 'completed',
        printCount: (item.btPrintCnt || 0) + (item.nbzPrintCnt || 0) + (item.wbzPrintCnt || 0), // 总打印次数
        createTime: item.createTime ? new Date(parseInt(item.createTime)).toLocaleString() : '',
        remark: item.nameModel || '', // 使用nameModel作为备注
      }));

      setDataSource(records);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.data.total,
      });
    } catch (error) {
      message.error('查询失败，请重试');
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
        supplierCode: values.supplierCode,
        projectCode: values.projectCode,
        factoryCode: values.factoryCode,
        lineName: values.productionLine, // 映射到API的lineName字段
        technicalVersion: values.techVersion, // 映射到API的technicalVersion字段
        codeSn: values.snCode, // 映射到API的codeSn字段
        code09: values.code09,
        deliveryDateStart,
        deliveryDateEnd,
        templateSnCode: values.templateSnCode,
        materialCode: values.circuitBoardCode, // 映射到API的materialCode字段
        printStatus: values.printStatus ? 
          (values.printStatus === 'pending' ? 0 : values.printStatus === 'printed' ? 1 : 2) : 
          undefined,
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
      message.warning('请选择要打印的记录');
      return;
    }
    
    Modal.confirm({
      title: '确认打印',
      content: `确定要打印选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: () => {
        message.success(`已发送 ${selectedRowKeys.length} 条记录到打印队列`);
        setSelectedRowKeys([]);
      }
    });
  }, [selectedRowKeys]);

  // 批量导出标签
  const handleBatchExport = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要导出的记录');
      return;
    }
    
    message.success(`已导出 ${selectedRowKeys.length} 条记录`);
  }, [selectedRowKeys]);

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
    Modal.info({
      title: '编辑记录',
      content: (
        <div>
          <p><strong>项目编码：</strong>{record.projectCode}</p>
          <p><strong>出厂码：</strong>{record.factoryCode}</p>
          <p><strong>SN码：</strong>{record.snCode}</p>
          <p>编辑功能开发中...</p>
        </div>
      ),
    });
  }, []);

  // 表格列配置
  const columns: ColumnsType<BarcodeRecord> = [
    {
      title: '单据编号',
      dataIndex: 'supplierCode',
      key: 'supplierCode',
      width: 120,
      fixed: 'left',
    },
    {
      title: '项目编码',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
    },
    {
      title: '出厂码',
      dataIndex: 'factoryCode',
      key: 'factoryCode',
      width: 150,
    },
    {
      title: '生产线',
      dataIndex: 'productionLine',
      key: 'productionLine',
      width: 80,
    },
    {
      title: '技术版本',
      dataIndex: 'techVersion',
      key: 'techVersion',
      width: 100,
    },
    {
      title: 'SN码',
      dataIndex: 'snCode',
      key: 'snCode',
      width: 200,
    },
    {
      title: '09码',
      dataIndex: 'code09',
      key: 'code09',
      width: 180,
    },
    {
      title: '送货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
    },
    {
      title: '模板SN码',
      dataIndex: 'templateSnCode',
      key: 'templateSnCode',
      width: 120,
    },
    {
      title: '电路板编号',
      dataIndex: 'circuitBoardCode',
      key: 'circuitBoardCode',
      width: 120,
    },
    {
      title: '附件',
      dataIndex: 'accessories',
      key: 'accessories',
      width: 80,
    },
    {
      title: '打印状态',
      dataIndex: 'printStatus',
      key: 'printStatus',
      width: 100,
      render: (status: 'pending' | 'printed' | 'completed') => {
        const statusMap = {
          pending: { color: 'orange', text: '待打印' },
          printed: { color: 'blue', text: '已打印' },
          completed: { color: 'green', text: '已完成' },
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
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
          <Form.Item label="单据编号" name="supplierCode">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="项目编码" name="projectCode">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="出厂码" name="factoryCode">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="生产线" name="productionLine">
            <Input placeholder="请输入" style={{ width: 120 }} />
          </Form.Item>
          
          <Form.Item label="技术版本" name="techVersion">
            <Input placeholder="请输入" style={{ width: 120 }} />
          </Form.Item>
          
          <Form.Item label="SN码" name="snCode">
            <Input placeholder="请输入" style={{ width: 200 }} />
          </Form.Item>
          
          <Form.Item label="09码" name="code09">
            <Input placeholder="请输入" style={{ width: 180 }} />
          </Form.Item>
          
          <Form.Item label="送货日期" name="deliveryDateRange">
            <RangePicker 
              style={{ width: 240 }} 
              placeholder={['开始日期', '结束日期']}
            />
          </Form.Item>
          
          <Form.Item label="模板SN码" name="templateSnCode">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="电路板编号" name="circuitBoardCode">
            <Input placeholder="请输入" style={{ width: 150 }} />
          </Form.Item>
          
          <Form.Item label="打印状态" name="printStatus">
            <Select placeholder="全部" style={{ width: 120 }} allowClear>
              <Option value="pending">待打印</Option>
              <Option value="printed">已打印</Option>
              <Option value="completed">已完成</Option>
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
            icon={<PrinterOutlined />}
            onClick={handleBatchPrint}
            disabled={selectedRowKeys.length === 0}
          >
            批量条码标签打印
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleBatchExport}
            disabled={selectedRowKeys.length === 0}
          >
            批量导出条码标签
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
    </div>
  );
}

export default PrintPage;

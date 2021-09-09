/* eslint-disable default-case */
import React, {useEffect, useState} from "react";
import {Table, Button, notification, Modal, Empty} from "antd";
import {CCard, CCol, CRow} from "@coreui/react";
import "./style.less";
import axiosInstance from "../../../../axios";
import moment from 'moment';
import { sortStringFunc, sortNumberFunc } from "../../../../reusable/utils";

const openErrorNotification = (errorName) => {
  notification.error({
    message: `Thông báo`,
    description: errorName,
    placement: "bottomRight",
  });
};

const SearchResult = (props) => {
  const [data, setData] = useState([]);
  const [urlExport, setUrlExport]=useState(`${props.url}/export`);
  const [loading, setLoading] = useState(true);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});

  const initialValues = {
    page: null,
    pageSize: null,
    departmentId: props.departmentId,
    topicId:props.topicId,
    fromDate: props.fromDate,
    toDate: props.toDate
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ["10", "15", "20"],
    showSizeChanger: true,
    locale: {items_per_page: "/ trang"},
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
  });

  const handleExport = ()=>{
    setShowExportConfirm(false);
    props.setSpinning(true);
    axiosInstance.post(urlExport,initialValues)
      .then((response)=>{
        props.setSpinning(false);
        let title = "";
        switch (props.reportType){
          case "1":{
            title="Báo cáo tỷ lệ trả lời của các phòng ban";
            break;
          }
          case "2":{
            title="Báo cáo chất lượng trả lời của phòng ban";
            break;
          }
          case "3":{
            title="Báo cáo câu hỏi đã nhận từ phòng ban theo chủ đề";
            break;
          }
          case "4":{
            title="Báo cáo câu hỏi tự đặt theo phòng ban";
            break;
          }
        }
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("type", "hidden");
        link.href = "data:text/plain;base64," + response.data.data;
        link.download = `${title}_${moment().format("YYMMDD_HHmmss")}.xlsx`;
        link.click();
        document.body.removeChild(link);
      })
      .catch(()=>{
      })
  }

  const handleTableChange = (nextPagination, filters, sorter) => {
    if (
      nextPagination.current !== pagination.current ||
      nextPagination.pageSize !== pagination.pageSize
    ) {
      setSortedInfo({});
      fetch({
        sortField: sorter.columnKey,
        sortOrder: sorter.order,
        pagination: nextPagination,
        ...filters,
      });
    }else{
      setSortedInfo(sorter);
    }

  };

  useEffect(()=>{
    setLoading(props.loading);
  },[props.loading]);

  useEffect(() => {
    setData(props.dataSource);
    setUrlExport(`${props.url}/export`)
    setPagination({
      ...pagination,
      total: props.totalRecord,
      current: 1,
    });
    setSortedInfo({});
  }, [props.dataSource, props.totalRecord]);

  useEffect(() => {
    if (props.isNewSearch) {
      setPagination({
        ...pagination,
        current: 1,
      });
    }
  }, [props.isNewSearch]);

  let columns = [];
  switch (props.reportType) {
    case "1": {
      columns = [
        {
          title: "STT",
          dataIndex: "stt",
          align: "center",
          key: "stt",
          sorter: (a, b) => sortNumberFunc(a, b, "stt"),
          sortOrder: sortedInfo?.columnKey === "stt" && sortedInfo?.order,
          width: "8%",
          render: (stt) => (
            <div >{stt}</div>
          )
        },
        {
          title: "Phòng ban",
          dataIndex: "department",
          key: "department",
          sorter: (a, b) => sortStringFunc(a, b, "department"),
          sortOrder: sortedInfo?.columnKey === "department" && sortedInfo?.order,
          width: "23%",
          render: (department) => (
            <div >{department}</div>
          )
        },
        {
          title: "Tổng số câu hỏi đã nhận",
          dataIndex: "total",
          key: "total",
          sorter: (a, b) => sortNumberFunc(a, b, "total"),
          sortOrder: sortedInfo?.columnKey === "total" && sortedInfo?.order,
          width: "21%",
          render: (total) => (
            <div style={{textAlign:"center"}}>
                {total}
            </div>
          )
        },
        {
          title: "Số câu hỏi đã trả lời",
          dataIndex: "answered",
          key: "answered",
          sorter: (a, b) => sortNumberFunc(a, b, "answered"),
          sortOrder: sortedInfo?.columnKey === "answered" && sortedInfo?.order,
          width: "17%",
          render: (answered) => (
            <div style={{textAlign:"center"}}>
                {answered}
            </div>
          )
        },
        {
          title: "Tỷ lệ trả lời (%)",
          dataIndex: "percent",
          key: "percent",
          sorter: (a, b) => sortNumberFunc(a, b, "percent"),
          sortOrder: sortedInfo?.columnKey === "percent" && sortedInfo?.order,
          width: "16%",
          render: (percent) => (
            <div style={{textAlign:"center"}}>
                {percent}
            </div>
          )
        },
        {
          title: "KPI",
          dataIndex: "kpi",
          width: "15%",
          key: "kpi",
          sorter: (a, b) => sortStringFunc(a, b, "kpi"),
          sortOrder: sortedInfo?.columnKey === "kpi" && sortedInfo?.order,
        },

      ];
      break;
    }
    case "2": {
      columns = [
        {
          title: "STT",
          dataIndex: "stt",
          key: "stt",
          align: "center",
          sorter: (a, b) => sortNumberFunc(a, b, "stt"),
          sortOrder: sortedInfo?.columnKey === "stt" && sortedInfo?.order,
          width: "7%",
          render: (stt) => (
            <div >{stt}</div>
          )
        },
        {
          title: "Phòng ban",
          dataIndex: "department",
          key: "department",
          sorter: (a, b) => sortStringFunc(a, b, "department"),
          sortOrder: sortedInfo?.columnKey === "department" && sortedInfo?.order,
          width: "18%",
          render: (department) => (
            <div>{department}</div>
          )
        },
        {
          title: "Tổng số câu hỏi đã nhận",
          dataIndex: "total",
          key: "total",
          sorter: (a, b) => sortNumberFunc(a, b, "total"),
          sortOrder: sortedInfo?.columnKey === "total" && sortedInfo?.order,
          width: "20%",
          render: (total) => (
            <div style={{textAlign:"center"}}>
                {total}
            </div>
          )
        },
        {
          title: "Số câu hỏi đã trả lời",
          dataIndex: "answered",
          key: "answered",
          sorter: (a, b) => sortNumberFunc(a, b, "answered"),
          sortOrder: sortedInfo?.columnKey === "answered" && sortedInfo?.order,
          width: "18%",
          render: (answered) => (
            <div style={{textAlign:"center"}}>
                {answered}
            </div>
          )
        },
        {
          title: "Số câu trả lời được đánh giá",
          dataIndex: "rated",
          key: "rated",
          sorter: (a, b) => sortNumberFunc(a, b, "rated"),
          sortOrder: sortedInfo?.columnKey === "rated" && sortedInfo?.order,
          width: "21%",
          render: (rated) => (
            <div style={{textAlign:"center"}}>
                {rated}
            </div>
          )
        },
        {
          title: "Điểm số đánh giá",
          dataIndex: "rating",
          key: "rating",
          sorter: (a, b) => sortNumberFunc(a, b, "rating"),
          sortOrder: sortedInfo?.columnKey === "rating" && sortedInfo?.order,
          width: "16%",
          render: (rating) => (
            <div style={{textAlign:"center"}}>
                {rating}
            </div>
          )
        },

      ];
      break;
    }
    case "3": {
      columns = [
        {
          title: "STT",
          dataIndex: "stt",
          key: "stt",
          align: "center",
          sorter: (a, b) => sortNumberFunc(a, b, "stt"),
          sortOrder: sortedInfo?.columnKey === "stt" && sortedInfo?.order,
          width: "6%",
          render: (stt) => (
            <div >{stt}</div>
          )
        },
        {
          title: "Phòng ban",
          dataIndex: "department",
          key: "department",
          sorter: (a, b) => sortStringFunc(a, b, "department"),
          sortOrder: sortedInfo?.columnKey === "department" && sortedInfo?.order,
          width: "15%",
          render: (department) => (
            <div >{department}</div>
          )
        },
        {
          title: "Chủ đề",
          dataIndex: "topic",
          key: "topic",
          sorter: (a, b) => sortStringFunc(a, b, "topic"),
          sortOrder: sortedInfo?.columnKey === "topic" && sortedInfo?.order,
          width: "15%",
          render: (topic) => (
            <div >{topic}</div>
          )
        },
        {
          title: "Tổng số câu hỏi đã nhận",
          dataIndex: "total",
          key: "total",
          sorter: (a, b) => sortNumberFunc(a, b, "total"),
          sortOrder: sortedInfo?.columnKey === "total" && sortedInfo?.order,
          width: "17%",
          render: (total) => (
            <div style={{textAlign:"center"}}>
                {total}
            </div>
          )
        },
        {
          title: "Số câu hỏi đã trả lời",
          dataIndex: "answered",
          key: "answered",
          sorter: (a, b) => sortNumberFunc(a, b, "answered"),
          sortOrder: sortedInfo?.columnKey === "answered" && sortedInfo?.order,
          width: "13%",
          render: (answered) => (
            <div style={{ textAlign:"center"}}>
                {answered}
            </div>
          )
        },
        {
          title: "Số câu hỏi đã hết hạn",
          dataIndex: "expired",
          key: "expired",
          sorter: (a, b) => sortNumberFunc(a, b, "expired"),
          sortOrder: sortedInfo?.columnKey === "expired" && sortedInfo?.order,
          width: "15%",
          render: (expired) => (
            <div style={{textAlign:"center"}}>
                {expired}
            </div>
          )
        },
        {
          title: "Số câu trả lời được đánh giá",
          dataIndex: "rated",
          key: "rated",
          sorter: (a, b) => sortNumberFunc(a, b, "rated"),
          sortOrder: sortedInfo?.columnKey === "rated" && sortedInfo?.order,
          width: "19%",
          render: (rated) => (
            <div style={{textAlign:"center"}}>
                {rated}
            </div>
          )
        },
      ];
      break;
    }
    case "4": {
      columns = [
        {
          title: "STT",
          dataIndex: "stt",
          key: "stt",
          align: "center",
          sorter: (a, b) => sortNumberFunc(a, b, "stt"),
          sortOrder: sortedInfo?.columnKey === "stt" && sortedInfo?.order,
          width: "7%",
          render: (stt) => (
            <div >{stt}</div>
          )
        },
        {
          title: "Phòng ban",
          dataIndex: "department",
          key: "department",
          sorter: (a, b) => sortStringFunc(a, b, "department"),
          sortOrder: sortedInfo?.columnKey === "department" && sortedInfo?.order,
          width: "15%",
        },
        {
          title: "Chủ đề",
          dataIndex: "topic",
          key: "topic",
          sorter: (a, b) => sortStringFunc(a, b, "topic"),
          sortOrder: sortedInfo?.columnKey === "topic" && sortedInfo?.order,
          width: "15%",
          render: (topic) => (
            <div >{topic}</div>
          )
        },
        {
          title: "Câu hỏi",
          dataIndex: "question",
          key: "question",
          sorter: (a, b) => sortStringFunc(a, b, "question"),
          sortOrder: sortedInfo?.columnKey === "question" && sortedInfo?.order,
          width: "15%",
        },
        {
          title: "Câu trả lời",
          dataIndex: "answer",
          key: "answer",
          sorter: (a, b) => sortStringFunc(a, b, "answer"),
          sortOrder: sortedInfo?.columnKey === "answer" && sortedInfo?.order,
          width: "18%",
        },
        {
          title: "Thông tin nhân viên",
          dataIndex: "employee",
          key: "employee",
          sorter: (a, b) => sortStringFunc(a, b, "employee"),
          sortOrder: sortedInfo?.columnKey === "employee" && sortedInfo?.order,
          width: "15%",
        },
        {
          title: "Đầu mối trả lời",
          dataIndex: "answerEmp",
          key: "answerEmp",
          sorter: (a, b) => sortStringFunc(a, b, "answerEmp"),
          sortOrder: sortedInfo?.columnKey === "answerEmp" && sortedInfo?.order,
          width: "15%",
        },
      ];
      break;
    }
  }

  const fetch = (params = {}) => {
    setLoading(true);
    initialValues.page=params.pagination.current;
    initialValues.pageSize=params.pagination.pageSize
    axiosInstance
      .post(props.url, initialValues)
      .then((response) => {
        let data = response.data;
        if (data.length > 0) {
          let total = Number(response.headers.count);
          setPagination({
            ...params.pagination,
            total: total,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} bản ghi`,
          });
          for(let i=0; i<data.length;i++){
            data[i].stt=(params.pagination.current-1)*params.pagination.pageSize+i+1;
          }
          setData(data);
          setLoading(false);
        } else {
          setLoading(false);
          setData([]);
          setPagination({
            ...params.pagination,
          });
        }
      });
  };

  return (
    <>
      <Modal
        centered
        title={
          <div
            style={{
              width: "100%",
              cursor: "move",
            }}
          >
            Thông báo
          </div>
        }
        visible={showExportConfirm}
        onOk={handleExport}
        onCancel={() => {
          setShowExportConfirm(false);
        }}
        zIndex={9999}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn thực hiện hành động này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách báo cáo</h5>
              </CCol>
              <CCol md="6">
                <Button
                  className="float-right m-3"
                  type="primary"
                  onClick={() => {
                    if (data.length > 0) {
                      setShowExportConfirm(true);
                    } else {
                      openErrorNotification("Không có dữ liệu để export");
                    }
                  }}
                  danger
                >
                  Export
                </Button>
              </CCol>
            </CRow>
            <div className="col-12">
              <Table
                className="table-data"
                columns={columns}
                rowKey={(record) => record.stt}
                dataSource={data}
                pagination={pagination}
                loading={loading||props.loading}
                onChange={handleTableChange}
                locale={{
                  emptyText: (
                    <Empty description={<span>Không có dữ liệu</span>} />
                  ),
                }}
              />
            </div>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default SearchResult;

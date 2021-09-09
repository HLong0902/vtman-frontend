import axiosInstance from "../../../../axios";

const mapLabel = new Map();
mapLabel.set("Câu hỏi", "questionDefinitionName");
mapLabel.set("Câu trả lời", "answerDefinition");
mapLabel.set("Ghi chú", "description");
mapLabel.set("Mã chủ đề", "topicCode");
mapLabel.set("STT", "numberOrder");
mapLabel.set("Trạng thái", "status");

const checkExist = (index, data) => {
  let questionDefinition = data[index];
  let isExist = false;
  for (let i = 0; i < index; i++) {
    let check = false;
    if(questionDefinition.questionDefinitionName && data[i].questionDefinitionName && questionDefinition.topicCode && data[i].topicCode){
      check = questionDefinition.questionDefinitionName.toLowerCase() === data[i].questionDefinitionName.toLowerCase();
      check = check && questionDefinition.topicCode.toLowerCase() === data[i].topicCode.toLowerCase();
    }
    if (check) {
      isExist = true;
      break;
    }
  }
  return isExist;
};

const convertTopicCodeToTopicName = (listTopic, topicCode) => {
  let topicName = null;
  if (topicCode === undefined) {
    return null;
  } else {
    for (let i = 0; i < listTopic.length; i++) {
      if (topicCode === listTopic[i].topicCode) {
        topicName = listTopic[i].topicName;
        break;
      }
    }
  }

  return topicName;
};

export const convertLabel = async (data) => {
  let listTopic = await axiosInstance.get("/api/question/topic");
  listTopic = listTopic.data.data;
  let result = [...data];
  return (result = result.map((item, index) => {
    Object.keys(item).forEach((key) => {
      item.id = index;
      item[mapLabel.get(key)] = item[key];
      delete item[key];
    });
    if (item["questionDefinitionName"]) {
      item["questionDefinitionName"] = item["questionDefinitionName"].trim();
    }
    if (item["answerDefinition"]) {
      item["answerDefinition"] = item["answerDefinition"].trim();
    }
    if (item["description"]) {
      item["description"] = item["description"].trim();
    }
    if(item.topicCode){
      item.topicCode = item.topicCode.toUpperCase();
    }
    item.topicName = convertTopicCodeToTopicName(listTopic, item.topicCode);
    return item;
  }));
};

export const manipulateData = async (data) => {
  data = await convertLabel(data);
  data = removeEmpty(data);
  let noErrorData = [];
  let errorData = [];
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    let [error, obj] = validate(item, data, i);
    if (error) {
      noErrorData.push(obj);
    } else {
      errorData.push(obj);
    }
  }
  return [noErrorData, errorData];
};

const removeEmpty = (data) => {
  let result = [];
  for (let item of data) {
    if (
      item.questionDefinitionName === undefined &&
      item.answerDefinition === undefined &&
      item.status === undefined &&
      item.topicCode === undefined
    ) {
    } else {
      result.push(item);
    }
  }
  return result;
};

export const validate = (item, data, index) => {
  let errors = [];
  if (!item.questionDefinitionName) {
    errors.push("Câu hỏi không được phép để trống");
  }else if (item.questionDefinitionName.length < 3) {
    errors.push("Câu hỏi không được phép nhỏ hơn 3 ký tự");
  } else if (item.questionDefinitionName.length > 500) {
    errors.push("Câu hỏi không được vượt quá 500 ký tự");
  }
  if (!item.answerDefinition) {
    errors.push("Câu trả lời không được phép để trống");
  }
  if (!item.topicCode) {
    errors.push("Mã chủ đề không được phép để trống");
  } else if (!item.topicName) {
    errors.push(
      "Mã chủ đề không tồn tại trên hệ thống"
    );
  }
  if (item.numberOrder) {
    let numberOrder = Number(item.numberOrder);
    if (
      numberOrder !== NaN &&
      Number.isInteger(numberOrder) &&
      numberOrder > 0 &&
      numberOrder < 999
    ) {
    } else {
      errors.push("Thứ tự phải là số tự nhiên từ 1 đến 999");
    }
  }
  if (!item.status) {
    errors.push("Trạng thái không được phép để trống");
  } else {
    let status = Number(item.status);
    if (
      status !== NaN &&
      Number.isInteger(status) &&
      (status === 1 || status === 0)
    ) {
    } else {
      errors.push("Trạng thái không đúng theo dữ liệu được quy định");
    }
  }
  let isExist = checkExist(index, data);
  if (isExist) {
    errors.push("Câu hỏi tự định nghĩa đã tồn tại trên hệ thống");
  }

  if (errors.length > 0) {
    return [false, { ...item, errors: errors }];
  } else {
    return [true, item];
  }
};

export const sortStringFunc = (a, b, key) => {
  let a1 = (a[key] ?? "").toLowerCase();
  let a2 = (b[key] ?? "").toLowerCase();
  return a1.localeCompare(a2);
};

export const sortNumberFunc = (a, b, key) => {
  let a1 = a[key] ?? 0;
  let a2 = b[key] ?? 0;
  return a1 - a2;
};

const convertDate = (date) => {
  date = date.split(" ");
  date[0] = date[0].split("/").reverse().join("/");
  return date.join(" ");
};

export const sortDateFunc = (a, b, key) => {
  let a1 = (a[key] ?? "0000/00/00 00:00").toLowerCase();
  a1 = convertDate(a1);
  let a2 = (b[key] ?? "0000/00/00 00:00").toLowerCase();
  a2 = convertDate(a2);
  return a1.localeCompare(a2);
};

export const removeVietnameseTones = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g," ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
  return str;
}

export const handleBlur = (form, name) => {
  let value = form.getFieldValue(name)?.trim();
  form.setFieldsValue({
    [name]: value,
  });
  if(value !== ""){
    form.validateFields([name]);
  }
}

export const validateNumberOrder = (_, value) => {
  if(typeof value === "number"){
    value = value.toString();
  }
  value = value?.trim();
  if(!value || value === ""){
    return Promise.resolve();
  }
  let num = Number(value);
  if(`${num}` === "NaN" || !Number.isInteger(num) || num < 1 || num > 999){
    return Promise.reject(new Error("Thứ tự phải là số tự nhiên từ 1 đến 999"));
  }
  return Promise.resolve();
};

export const generateEmployeeLabel = (employee) => {
  let label = "";
  if(employee.postOfficeCode){
    label = employee.postOfficeCode;
  }
  if(employee.employeeCode){
    label = label === "" ? employee.employeeCode : `${label} - ${employee.employeeCode}`;
  }
  if(employee.employeeName){
    label = label === "" ? employee.employeeName : `${label} - ${employee.employeeName}`;
  }
  return label;
}

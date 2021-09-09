import axios from "../axios";

// dev
// export const VT_POST = {
//   BASE_URL: "https://iid.viettelpost.vn",
//   CLIENT_ID: 555555,
//   CLIENT_SECRET: 55555555,
// };

// product
export const VT_POST = {
  BASE_URL: "https://iid.viettelpost.vn",
  CLIENT_ID: "chatbot_8191",
  CLIENT_SECRET: "nxj44D8BLqAr2tWoTcH6",
};

export const generateAuthUrl = (redirectUri) => {
  return `${VT_POST.BASE_URL}/oauth2/authorize?client_id=${VT_POST.CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=all&state=xyz`;
};

export const getJWT = async (code, state, redirectUri) => {
  return await axios.get(
    `${VT_POST.BASE_URL}/oauth2/token?client_id=${VT_POST.CLIENT_ID}&client_secret=${VT_POST.CLIENT_SECRET}&redirect_uri=${redirectUri}&grant_type=authorization_code&code=${code}&scope=all&state=${state}`
  );
};

export const generateLogoutUrl = (redirectUri) => {
  return `${VT_POST.BASE_URL}/oauth2/logout?redirect_uri=${redirectUri}`;
};

export const components = [
  {
    value: "Report",
    label: "Báo cáo"
  },
  {
    value: "FunctionConfig",
    label: "Cấu hình chức năng"
  },
  {
    value: "QuestionDefinition",
    label: "Câu hỏi tự định nghĩa"
  },
  {
    value: "Topic",
    label: "Chủ đề"
  },
  {
    value: "WorkCalendar",
    label: "Lịch làm việc"
  },
  {
    value: "HistoryFaq",
    label: "Lịch sử hỏi đáp"
  },
  {
    value: "ContentAutomatic",
    label: "Tin nhắn tự động"
  },
  {
    value: "BannedContent",
    label: "Từ khóa bị cấm"
  },
];

export const SUN_OPTIONS = {
  mode: "classic",
  rtl: false,
  katex: "window.katex",
  defaultStyle: "font-family: Roboto;font-size: 14px",
  font: [
    "Arial",
    "Calibri",
    "Comic Sans",
    "Courier",
    "Garamond",
    "Georgia",
    "Impact",
    "Lucida Console",
    "Palatino Linotype",
    "Roboto",
    "Segoe UI",
    "Tahoma",
    "Times New Roman",
    "Trebuchet MS"
  ],
  height: "auto",
  showPathLabel: false,
  imageGalleryUrl: "https://etyswjpn79.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo",
  videoFileInput: false,
  tabDisable: false,
  buttonList: [
    [
      "undo",
      "redo",
      "font",
      "fontSize",
      "formatBlock",
      "paragraphStyle",
      "blockquote",
      "bold",
      "underline",
      "italic",
      "strike",
      "subscript",
      "superscript",
      "fontColor",
      "hiliteColor",
      "textStyle",
      "removeFormat",
      "outdent",
      "indent",
      "align",
      "horizontalRule",
      "list",
      "lineHeight",
      "table",
      "link",
      "image",
      "video",
      "audio",
      "math",
      "imageGallery",
      "fullScreen",
      "showBlocks",
      "codeView",
      "preview",
      "print",
      "save",
      "template",
    ],
  ],
  "lang(In nodejs)": "en",
};

export const regexDepartmentName = /^[0-9 aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ]{1,200}$/;

export const dateFormat = "DD/MM/YYYY";

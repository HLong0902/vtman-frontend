const days = new Map();
days.set("MON", "Thứ Hai");
days.set("TUE", "Thứ Ba");
days.set("WED", "Thứ Tư");
days.set("THU", "Thứ Năm");
days.set("FRI", "Thứ Sáu");
days.set("SAT", "Thứ Bảy");
days.set("SUN", "Chủ nhật");

export const changeDayName = (day) => days.get(day);

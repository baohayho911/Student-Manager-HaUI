import type { Catalog, Field } from "@/types";
const code = (key: string): Field => ({ key, label: "Mã", required: true });
const name = (key: string): Field => ({ key, label: "Tên", required: true });
const ref = (
  key: string,
  label: string,
  lookup: string,
  required = true,
): Field => ({ key, label, lookup, required });
export const catalogs: Record<string, Catalog> = {
  departments: {
    title: "Khoa",
    description: "Quản lý đơn vị đào tạo và trưởng khoa.",
    model: "khoa",
    fields: [
      code("maKhoa"),
      name("tenKhoa"),
      { key: "dacThuKhoa", label: "Đặc thù khoa", type: "textarea" },
      ref("truongKhoaId", "Trưởng khoa", "teachers", false),
    ],
  },
  majors: {
    title: "Ngành đào tạo",
    description: "Thông tin ngành và yêu cầu đào tạo.",
    model: "nganhDaoTao",
    fields: [
      code("maNganh"),
      name("tenNganh"),
      ref("khoaId", "Khoa", "departments"),
      {
        key: "thoiGianHoc",
        label: "Thời gian học (năm)",
        type: "number",
        required: true,
        min: 1,
        max: 10,
      },
      { key: "yeuCauDauVao", label: "Yêu cầu đầu vào", type: "textarea" },
      { key: "yeuCauDauRa", label: "Yêu cầu đầu ra", type: "textarea" },
    ],
  },
  classes: {
    title: "Lớp hành chính",
    description: "Quản lý lớp, ngành đào tạo và cố vấn học tập.",
    model: "lopHanhChinh",
    fields: [
      code("maLop"),
      name("tenLop"),
      ref("nganhId", "Ngành", "majors"),
      ref("coVanId", "Cố vấn học tập", "teachers", false),
    ],
  },
  subjects: {
    title: "Môn học",
    description: "Danh mục môn học, tín chỉ và cách tính điểm.",
    model: "monHoc",
    fields: [
      code("maMonHoc"),
      name("tenMonHoc"),
      {
        key: "soTinChi",
        label: "Số tín chỉ",
        type: "number",
        required: true,
        min: 1,
        max: 30,
      },
      {
        key: "trongSoDiemTX",
        label: "Trọng số thường xuyên (%)",
        type: "number",
        required: true,
        min: 0,
        max: 100,
      },
      {
        key: "trongSoDiemCuoiKy",
        label: "Trọng số cuối kỳ (%)",
        type: "number",
        required: true,
        min: 0,
        max: 100,
      },
      { key: "noiDungMonHoc", label: "Nội dung môn học", type: "textarea" },
    ],
  },
  semesters: {
    title: "Học kỳ",
    description: "Tổ chức học kỳ theo năm học và thời gian.",
    model: "hocKy",
    fields: [
      code("maHocKy"),
      name("tenHocKy"),
      { key: "namHoc", label: "Năm học", required: true },
      {
        key: "ngayBatDau",
        label: "Ngày bắt đầu",
        type: "date",
        required: true,
      },
      {
        key: "ngayKetThuc",
        label: "Ngày kết thúc",
        type: "date",
        required: true,
      },
    ],
  },
  curricula: {
    title: "Chương trình học",
    description:
      "Các môn học theo ngành; học kỳ dự kiến là thứ tự trong chương trình.",
    model: "chuongTrinhHoc",
    compound: ["monHocId", "nganhId"],
    fields: [
      ref("nganhId", "Ngành", "majors"),
      ref("monHocId", "Môn học", "subjects"),
      {
        key: "loaiMon",
        label: "Loại môn",
        required: true,
        options: { BAT_BUOC: "Bắt buộc", TU_CHON: "Tự chọn" },
      },
      {
        key: "hocKyDuKien",
        label: "Học kỳ dự kiến",
        type: "number",
        required: true,
        min: 1,
        max: 20,
      },
    ],
  },
  prerequisites: {
    title: "Môn tiên quyết",
    description: "Sinh viên phải đạt tất cả môn tiên quyết trước khi đăng ký.",
    model: "monHocTienQuyet",
    compound: ["monHocId", "monTienQuyetId"],
    fields: [
      ref("monHocId", "Môn muốn đăng ký", "subjects"),
      ref("monTienQuyetId", "Môn phải đạt trước", "subjects"),
      {
        key: "diemToiThieu",
        label: "Điểm tối thiểu",
        type: "number",
        required: true,
        min: 0,
        max: 10,
      },
    ],
  },
  sections: {
    title: "Lớp học phần",
    description: "Mở lớp, phân công giảng viên và theo dõi sĩ số.",
    model: "lopHocPhan",
    fields: [
      code("maLopHocPhan"),
      ref("monHocId", "Môn học", "subjects"),
      ref("hocKyId", "Học kỳ", "semesters"),
      ref("giangVienId", "Giảng viên", "teachers"),
      {
        key: "siSoToiDa",
        label: "Sĩ số tối đa",
        type: "number",
        required: true,
        min: 1,
        max: 1000,
      },
      { key: "lichHoc", label: "Lịch học (thứ, tiết)", required: true },
      { key: "phongHoc", label: "Phòng học", required: true },
      {
        key: "trangThaiLop",
        label: "Trạng thái",
        required: true,
        options: {
          MO_DANG_KY: "Mở đăng ký",
          DONG_DANG_KY: "Đóng đăng ký",
          HOAN_THANH: "Hoàn thành",
        },
      },
    ],
  },
};
export const roleLabels = {
  ADMIN: "Quản trị viên",
  TEACHER: "Giảng viên",
  STUDENT: "Sinh viên",
};
export const studyStates = {
  DANG_HOC: "Đang học",
  BAO_LUU: "Bảo lưu",
  THOI_HOC: "Thôi học",
  TOT_NGHIEP: "Tốt nghiệp",
};
export const userFields: Field[] = [
  { key: "tenDangNhap", label: "Tên đăng nhập", required: true },
  { key: "hoTen", label: "Họ tên", required: true },
  { key: "vaiTro", label: "Vai trò", required: true, options: roleLabels },
  { key: "matKhau", label: "Mật khẩu ban đầu", type: "password" },
  { key: "email", label: "Email", type: "email" },
  { key: "soDienThoai", label: "Số điện thoại" },
  { key: "ngaySinh", label: "Ngày sinh", type: "date" },
  { key: "diaChi", label: "Địa chỉ" },
  { key: "maHoSo", label: "Mã sinh viên / giảng viên" },
  ref("khoaId", "Khoa", "departments", false),
  ref("lopId", "Lớp hành chính", "classes", false),
  { key: "nienKhoa", label: "Niên khóa" },
  { key: "trangThaiHocTap", label: "Trạng thái học tập", options: studyStates },
  { key: "hocHam", label: "Học hàm" },
  { key: "hocVi", label: "Học vị" },
  { key: "phongBan", label: "Phòng ban" },
  { key: "chucVu", label: "Chức vụ" },
];

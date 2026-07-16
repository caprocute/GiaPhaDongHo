import { Dialog } from "./Dialog";

export default { title: "Dialog", component: Dialog };

export const Default = {
  args: { open: true, title: "Xác nhận", children: "Bạn có chắc muốn xóa?", onClose: () => undefined },
};

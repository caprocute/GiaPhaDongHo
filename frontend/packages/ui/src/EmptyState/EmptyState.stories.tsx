import { EmptyState } from "./EmptyState";
import { Button } from "../Button/Button";

export default { title: "EmptyState", component: EmptyState };

export const Default = {
  args: {
    title: "Chưa có thành viên",
    description: "Thêm người đầu tiên vào phả đồ.",
    action: <Button>Thêm thành viên</Button>,
  },
};

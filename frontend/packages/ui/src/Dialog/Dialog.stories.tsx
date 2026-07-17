import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

const meta: Meta<typeof Dialog> = {
  title: "GiaPha/Dialog",
  component: Dialog,
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  args: {
    open: true,
    title: "Xác nhận",
    children: "Bạn có chắc muốn xóa mục này?",
    onClose: () => undefined,
  },
};

export const CeremonialNominate: Story = {
  render: function CeremonialStory() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          Mở đề cử
        </Button>
        <Dialog
          open={open}
          variant="ceremonial"
          eyebrow="Nghi thức dòng họ"
          title="Đề cử thành tích"
          description="Ban trị sự sẽ xác minh trước khi khắc tên vào bảng vàng khuyến học."
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Để sau
              </Button>
              <Button type="button">Gửi đề cử</Button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Form đề cử đặt trong phần thân hộp thoại.
          </p>
        </Dialog>
      </>
    );
  },
};

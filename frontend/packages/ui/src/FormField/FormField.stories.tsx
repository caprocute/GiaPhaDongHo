import { FormField } from "./FormField";
import { Input } from "../Input/Input";

export default { title: "FormField", component: FormField };

export const WithInput = {
  render: () => (
    <FormField label="Họ và tên" htmlFor="name" required hint="Theo sổ gia phả">
      <Input id="name" placeholder="Nguyễn Văn A" />
    </FormField>
  ),
};

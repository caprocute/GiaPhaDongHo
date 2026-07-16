import { Pagination } from "./Pagination";

export default { title: "Pagination", component: Pagination };

export const Default = { args: { page: 2, totalPages: 5, onPageChange: () => undefined } };

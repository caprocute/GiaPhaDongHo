import { CategoryNewsClient } from "./CategoryNewsClient";

type Props = { params: Promise<{ categorySlug: string }> };

export default async function CategoryNewsPage({ params }: Props) {
  const { categorySlug } = await params;
  return <CategoryNewsClient categorySlug={categorySlug} />;
}

import PostDetailClient from "./PostDetailClient";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function PostDetailPage() {
  return <PostDetailClient />;
}

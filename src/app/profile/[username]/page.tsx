import ProfileClient from "./ProfileClient";

export function generateStaticParams() {
  return [{ username: "placeholder" }];
}

export default function PublicProfilePage() {
  return <ProfileClient />;
}

import { ProfilePageContent } from "@/src/features/profile/components/ProfilePageContent";

export default function Page({ params }: { params: { id: string } }) {
    return <ProfilePageContent profileId={parseInt(params.id)} />;
}
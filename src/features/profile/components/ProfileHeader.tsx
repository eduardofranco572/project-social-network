import React, { useState } from 'react'; 
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { Settings, UserPlus, UserCheck, Camera, Loader2, Image as ImageIcon, Bookmark } from 'lucide-react'; 
import { UserProfile } from '../hooks/useProfile';
import { useFollow } from '@/src/hooks/useFollow'; 
import StatusViewerModal from '@/src/features/status/components/StatusViewerModal';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';

import { SavedPostsModal } from './SavedPostsModal';

import SettingsModal from '@/src/features/settings/components/SettingsModal';

interface ProfileHeaderProps {
    profile: UserProfile;
    isOwnProfile: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile }) => {
    const { isFollowing, toggleFollow, isLoading } = useFollow(profile.id);
    const { user: loggedInUser } = useCurrentUser();

    const [banner, setBanner] = useState<string | null>(profile.banner || null);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    const userStatus = profile.status || null; 
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploadingBanner(true);

            const formData = new FormData();
            formData.append('banner', file);

            try {
                const res = await fetch(`/api/users/${profile.id}`, {
                    method: 'PUT',
                    body: formData
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setBanner(data.bannerUrl);
                }
            } catch (error) {
                console.error("Erro upload banner", error);
            } finally {
                setIsUploadingBanner(false);
            }
        }
    };

    const hasStatus = userStatus && userStatus.statuses.length > 0;

    return (
        <>
            <div className="relative mb-8">
                <div className="h-48 w-full bg-gradient-to-r from-zinc-800 to-zinc-900 relative overflow-hidden group">
                    {(banner && banner.length > 0) && (
                        <Image 
                            src={banner} 
                            alt="Capa" 
                            fill 
                            priority
                            className="object-cover z-10" 
                        />
                    )}

                    {isOwnProfile && (
                        <label className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-20">
                            {isUploadingBanner ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                            <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                        </label>
                    )}
                </div>

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-end gap-6 -mt-20 md:-mt-28"> 
                        <div className="relative flex-shrink-0 md:translate-y-4">
                            <div 
                                className={`w-32 h-32 md:w-44 md:h-44 rounded-full border-4 overflow-hidden bg-zinc-800 transition-colors duration-300 relative
                                    ${hasStatus ? 'border-white cursor-pointer shadow-lg' : 'border-background'}
                                `}
                                onClick={() => hasStatus && setIsStatusModalOpen(true)}
                            >
                                <Image 
                                    src={profile.foto} 
                                    alt={profile.nome} 
                                    fill
                                    sizes="(max-width: 768px) 128px, 176px" 
                                />
                                
                                {isOwnProfile && !hasStatus && (
                                     <button className="absolute bottom-2 right-0 left-0 p-1 bg-black/30 w-full text-center text-xs text-white/70 hover:bg-black/50">
                                        <Camera size={14} className="mx-auto"/>
                                     </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{profile.nome}</h1>
                            </div>

                            <div className="flex gap-3">
                                {isOwnProfile ? (
                                    <>
                                        <Button 
                                            variant="secondary" 
                                            size="icon"
                                            onClick={() => setIsSavedModalOpen(true)}
                                            title="Ver itens salvos"
                                        >
                                            <Bookmark size={20} />
                                        </Button>

                                        <Button 
                                            variant="outline" 
                                            className="gap-2"
                                            onClick={() => setIsSettingsOpen(true)}
                                        >
                                            <Settings size={16} /> Editar Perfil
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button 
                                            className={`gap-2 ${isFollowing ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
                                            onClick={toggleFollow}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin size-4" /> : (
                                                isFollowing ? <><UserCheck size={16} /> Seguindo</> : <><UserPlus size={16} /> Seguir</>
                                            )}
                                        </Button>

                                        <Button variant="secondary">Mensagem</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isStatusModalOpen && userStatus && (
                <StatusViewerModal 
                    allStatusUsers={[userStatus]}
                    startIndex={0} 
                    onClose={() => setIsStatusModalOpen(false)} 
                    loggedInUser={loggedInUser}
                />
            )}

            {isSettingsOpen && (
                <SettingsModal onClose={() => setIsSettingsOpen(false)} />
            )}

            {isSavedModalOpen && (
                <SavedPostsModal 
                    userId={profile.id} 
                    onClose={() => setIsSavedModalOpen(false)} 
                />
            )}
        </>
    );
};
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, UserPlus, Camera } from 'lucide-react';
import { UserProfile } from '../hooks/useProfile';

interface ProfileHeaderProps {
    profile: UserProfile;
    isOwnProfile: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile }) => {
    return (
        <div className="relative mb-8">
            <div className="h-48 w-full bg-gradient-to-r from-zinc-800 to-zinc-900 relative">
                {isOwnProfile && (
                    <button className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition-all">
                        <Camera size={20} />
                    </button>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-end gap-6 -mt-20 md:-mt-28"> 
                    <div className="relative flex-shrink-0 md:translate-y-4">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-2 border-background overflow-hidden bg-zinc-800">
                            <img src={profile.foto} alt={profile.nome} className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="flex-1 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{profile.nome}</h1>
                        </div>

                        <div className="flex gap-3">
                            {isOwnProfile ? (
                                <Button variant="outline" className="gap-2">
                                    <Settings size={16} /> Editar Perfil
                                </Button>
                            ) : (
                                <>
                                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                        <UserPlus size={16} /> Seguir
                                    </Button>
                                    <Button variant="secondary">Mensagem</Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
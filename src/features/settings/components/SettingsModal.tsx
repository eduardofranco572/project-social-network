"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/app/css/settings-modal.css';
import { useSettings } from '../hooks/useSettings';
import ProfileImageEditor from '@/components/ui/ProfileImageEditor';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const {
        user,
        isUserLoading,
        activeTab,
        setActiveTab,
        name,
        setName,
        password,
        setPassword,
        photoPreview,
        photoInputRef,
        isSaving,
        showEditor,
        tempImage,
        handlePhotoSelect,
        handleEditorSave,
        handleEditorCancel,
        handleSaveProfile,
        handleLogout
    } = useSettings(onClose);

    if (isUserLoading) return null;

    const mainContent = (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-container" onClick={(e) => e.stopPropagation()}>
                <div className="settings-sidebar">
                    <div className="settings-sidebar-header flex justify-between items-center md:block">
                        <h2 className="font-bold text-lg text-white">Configurações</h2>
                        <button className="md:hidden text-zinc-400" onClick={onClose}><X /></button>
                    </div>
                    
                    <div 
                        className={`settings-menu-item ${activeTab === 'edit_profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('edit_profile')}
                    >
                        Editar Perfil
                    </div>

                    <div 
                        className={`settings-menu-item text-red-500 hover:text-red-400 hover:bg-red-500/10`}
                        onClick={() => { setActiveTab('logout'); handleLogout(); }}
                    >
                        Sair da conta
                    </div>
                </div>

                <div className="settings-content scrollbar-hide relative">
                    {activeTab === 'edit_profile' && (
                        <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="settings-avatar-section">
                                <img src={photoPreview} alt="Avatar" className="settings-avatar-img" />
                                <div>
                                    <div className="font-bold text-lg text-white">{user?.nome}</div>
                                    <label className="change-photo-btn">
                                        Alterar foto do perfil
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            ref={photoInputRef}
                                            onChange={handlePhotoSelect}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="settings-form-group">
                                <label className="settings-label">Nome</label>
                                <input 
                                    type="text" 
                                    className="settings-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div className="settings-form-group">
                                <label className="settings-label">Nova Senha</label>
                                <input 
                                    type="password" 
                                    className="settings-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Deixe em branco para manter a atual"
                                />
                                <span className="text-xs text-zinc-500 mt-1">Mínimo de 6 caracteres</span>
                            </div>

                            <div className="flex justify-end mt-8">
                                <Button 
                                    onClick={handleSaveProfile} 
                                    disabled={isSaving}
                                    className="bg-white text-black hover:bg-zinc-200 min-w-[100px] font-bold"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : 'Salvar'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'logout' && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                            <LogOut size={48} className="mb-4 opacity-50" />
                            <p>Saindo...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined') return null;

    return (
        <>
            {createPortal(mainContent, document.body)}
            
            {showEditor && (
                <ProfileImageEditor 
                    image={tempImage}
                    onSave={handleEditorSave}
                    onCancel={handleEditorCancel}
                />
            )}
        </>
    );
};

export default SettingsModal;
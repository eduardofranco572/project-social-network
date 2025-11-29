import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';

export type ActiveTab = 'edit_profile' | 'logout';

export const useSettings = (onClose: () => void) => {
    const { user, isLoading: isUserLoading } = useCurrentUser();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState<ActiveTab>('edit_profile');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    
    const [photoPreview, setPhotoPreview] = useState<string>('/img/iconePadrao.svg');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [showEditor, setShowEditor] = useState(false);
    const [tempImage, setTempImage] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(user) {
            setName(user.nome);
            setPhotoPreview(user.foto || '/img/iconePadrao.svg');
        }
    }, [user]);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setTempImage(imageUrl);
            setShowEditor(true);
            e.target.value = ''; 
        }
    };

    const handleEditorSave = (file: File) => {
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        setShowEditor(false);
        setTempImage('');
    };

    const handleEditorCancel = () => {
        setShowEditor(false);
        setTempImage('');
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);

        const formData = new FormData();
        formData.append('nome', name);
        if (password) formData.append('senha', password);
        if (photoFile) formData.append('foto', photoFile);

        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                
                await Swal.fire({
                    icon: 'success',
                    title: 'Perfil atualizado!',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1c1c1c',
                    color: '#fff'
                });
                
                if(data.user) {
                    setName(data.user.nome);
                    if(data.user.foto) setPhotoPreview(data.user.foto);
                }

                onClose();
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Erro ao atualizar');
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível salvar as alterações.',
                background: '#1c1c1c',
                color: '#fff'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Sair da conta?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#333',
            confirmButtonText: 'Sair',
            cancelButtonText: 'Cancelar',
            background: '#1c1c1c',
            color: '#fff'
        });

        if (result.isConfirmed) {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        }
    };

    return {
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
    };
};
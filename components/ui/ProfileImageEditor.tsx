import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import AvatarEditor from 'react-avatar-editor';
import { X, ZoomIn } from "lucide-react";
import { Slider } from '@/components/ui/slider'; 

import '@/app/css/profile-editor.css'; 

interface ProfileImageEditorProps {
    image: string;
    onSave: (file: File) => void;
    onCancel: () => void;
}

const ProfileImageEditor: React.FC<ProfileImageEditorProps> = ({ image, onSave, onCancel }) => {
    const [scale, setScale] = useState<number>(1);
    const editorRef = useRef<AvatarEditor>(null);

    const handleSaveImage = useCallback(() => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "profile_edited.jpg", { type: "image/jpeg" });
                    onSave(file);
                }
            }, 'image/jpeg');
        }
    }, [onSave]);

    const modalContent = (
        <section className="cardEditImage">
            <div className='edtImage'>
                <div className="closed" onClick={onCancel}>
                    <X size={24} />
                </div>

                <h1 className="text-lg font-bold mb-4 text-white">Editar Foto</h1>
                
                <div className="imageforedit">
                    <AvatarEditor
                        ref={editorRef}
                        image={image}
                        width={250} 
                        height={250}
                        border={20}
                        color={[28, 28, 28, 0.8]} 
                        scale={scale}
                        rotate={0}
                        borderRadius={125} 
                    />
                </div>

                <div className="w-full max-w-xs px-4 sliderzoom flex items-center gap-3 mt-4">
                    <ZoomIn size={20} className="text-zinc-400"/>
                    <Slider
                        min={1}
                        max={3} 
                        step={0.1}
                        value={[scale]}
                        onValueChange={(value) => setScale(value[0])} 
                        className="flex-1"
                    />
                </div>

                <div className="flex gap-3 mt-6 w-full">
                    <button 
                        className='flex-1 py-2.5 rounded-md text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors border border-zinc-700' 
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                    <button 
                        className='flex-1 py-2.5 rounded-md text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors font-bold' 
                        onClick={handleSaveImage}
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </section>
    );

    if (typeof document === 'undefined') return null;
    
    return createPortal(modalContent, document.body);
};

export default ProfileImageEditor;
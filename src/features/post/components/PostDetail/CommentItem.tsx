import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Comment } from '../../hooks/usePostDetail';

interface CommentItemProps {
    comment: Comment;
    allComments: Comment[];
    onReply: (comment: Comment) => void;
    onDelete: (commentId: string) => void; 
    currentUserId?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, allComments, onReply, onDelete, currentUserId }) => {
    const replies = allComments.filter(c => c.parentId === comment._id);
    const [showReplies, setShowReplies] = useState(false);

    const isAuthor = currentUserId === comment.user.id;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-3 group">
                <Link href={`/perfil/${comment.user.id}`}>
                    <img 
                        src={comment.user.foto} 
                        alt={comment.user.nome}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 cursor-pointer hover:opacity-80 transition-opacity" 
                    />
                </Link>

                <div className='text-sm flex-1 min-w-0'>
                    <div className="flex justify-between items-start">
                        <div className="break-words pr-2">
                            <Link href={`/perfil/${comment.user.id}`}>
                                <span className="font-semibold mr-2 cursor-pointer hover:underline">
                                    {comment.user.nome}
                                </span>
                            </Link>

                            <span>{comment.text}</span>
                        </div>
                        
                        {isAuthor && (
                            <button 
                                onClick={() => onDelete(comment._id)}
                                className="text-neutral-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Excluir comentário"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    
                    <div className='text-xs text-neutral-500 mt-1 flex gap-3 items-center'>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        <button 
                            className='cursor-pointer font-semibold hover:text-neutral-300'
                            onClick={() => onReply(comment)}
                        >
                            Responder
                        </button>
                    </div>
                </div>
            </div>

            {replies.length > 0 && (
                <div className="reply"> 
                    {!showReplies ? (
                        <button 
                            onClick={() => setShowReplies(true)}
                            className="text-xs text-neutral-400 flex items-center gap-2 hover:text-white mb-2"
                        >
                            <div className="w-6 border-t border-neutral-600"></div>
                            Ver {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
                        </button>
                    ) : (
                        <div className="flex flex-col gap-3 border-l-2 border-neutral-800 pl-3">
                            {replies.map(reply => (
                                <CommentItem 
                                    key={reply._id} 
                                    comment={reply} 
                                    allComments={allComments} 
                                    onReply={onReply}
                                    onDelete={onDelete}
                                    currentUserId={currentUserId}
                                />
                            ))}

                            <button 
                                onClick={() => setShowReplies(false)}
                                className="text-xs text-neutral-500 hover:text-white mt-1"
                            >
                                Ocultar respostas
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
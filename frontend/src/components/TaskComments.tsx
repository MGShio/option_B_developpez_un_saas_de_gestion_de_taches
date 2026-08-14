// TaskComments.tsx - Component

/**

 * Composant TaskComments - Affiche et gère les commentaires d'une tâche
 * 
 * Ce composant permet de :
 * - Afficher la liste des commentaires d'une tâche
 * - Ajouter un nouveau commentaire
 * - Supprimer un commentaire (si l'utilisateur en est l'auteur ou un admin)
 */


import { useState, useEffect } from 'react';


import type { Comment } from '../services/taskService';


import type { User } from '../contexts/AuthContext';
import { isProjectAdmin as checkIsProjectAdmin } from '../utils/permissions';



interface TaskCommentsProps {
  taskId: string;
  projectId: string;
  comments: Comment[];
  currentUser: User | null;
  project: any | null;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  isLoading?: boolean;
}

// Icône de commentaire

const CommentIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4H14V12H2V4Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 8L5 10L8 8" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Icône de poubelle

const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 3.5H11.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3.5V4.5C10 4.79565 9.8946 5.08345 9.6967 5.28137C9.4988 5.47929 9.2109 5.58137 9 5.58137H5C4.7891 5.58137 4.5012 5.47929 4.3033 5.28137C4.1054 5.08345 4 4.79565 4 4.5V3.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6.5V11.5C6 12.0523 6.44772 12.5 7 12.5H7" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 11.5V6.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 6.5H8.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Icône d'envoi

const SendIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 8.5L14 1L1.5 13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 1L8 8L14 15" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * Formate une date en format lisible
 */

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Vérifie si l'utilisateur peut supprimer un commentaire
 * (auteur du commentaire ou admin du projet)
 */

const canDeleteComment = (currentUser: User | null, comment: Comment, isProjectAdmin: boolean): boolean => {
  if (!currentUser) return false;
  // L'auteur du commentaire peut le supprimer
  if (comment.authorId === currentUser.id) return true;
  // Un admin peut supprimer n'importe quel commentaire
  if (isProjectAdmin) return true;
  return false;
};





export default function TaskComments({
  taskId,
  projectId,
  comments,
  currentUser,
  project,
  onAddComment,
  onDeleteComment,
  isLoading = false,
}: TaskCommentsProps) {


  const [newComment, setNewComment] = useState('');


  const [isSubmitting, setIsSubmitting] = useState(false);


  const [error, setError] = useState<string | null>(null);

  // Calculate isProjectAdmin based on project and currentUser
  const isProjectAdmin = checkIsProjectAdmin(currentUser, project);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Le commentaire ne peut pas être vide');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      await onDeleteComment(commentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du commentaire');
    }
  };

  // Style pour le focus (accessibilité)
  const focusOutlineStyle: React.CSSProperties = {
    outline: '2px solid #D3590B',
    outlineOffset: '2px',
  };


// RENDER



  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1rem',
      }}
    >
      {/* En-tête */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <CommentIcon size={16} />
        <h3
          style={{
            color: '#1F1F1F',
            fontSize: '1rem',
            fontFamily: 'Manrope',
            fontWeight: '600',
            margin: 0,
          }}
        >
          Commentaires ({comments.length})
        </h3>
      </div>

      {/* Formulaire d'ajout de commentaire */}
      {currentUser && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            style={{
              flex: 1,
              minHeight: '44px',
              maxHeight: '100px',
              padding: '12px 14px',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: error ? '1px solid #EF4444' : '1px solid #E5E7EB',
              fontSize: '0.875rem',
              fontFamily: 'Inter',
              fontWeight: '400',
              color: '#0F0F0F',
              resize: 'vertical',
              outline: 'none',
            }}
            aria-label="Ajouter un commentaire"
            onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting || isLoading}
            style={{
              width: '44px',
              height: '44px',
              padding: '0',
              background: (!newComment.trim() || isSubmitting || isLoading) ? '#E5E7EB' : '#D3590B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (!newComment.trim() || isSubmitting || isLoading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
            }}
            aria-label="Envoyer le commentaire"
            aria-disabled={!newComment.trim() || isSubmitting || isLoading}
            onFocus={(e) => !e.currentTarget.disabled && Object.assign(e.currentTarget.style, focusOutlineStyle)}
            onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0' })}
          >
            <SendIcon size={16} />
          </button>
        </form>
      )}

      {/* Message d'erreur */}
      {error && (
        <div
          style={{
            color: '#EF4444',
            fontSize: '0.875rem',
            fontFamily: 'Inter',
            fontWeight: '400',
            padding: '0.5rem',
            background: '#FEE2E2',
            borderRadius: '4px',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Liste des commentaires */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {comments.length === 0 ? (
          <p
            style={{
              color: '#6B7280',
              fontSize: '0.875rem',
              fontFamily: 'Inter',
              fontWeight: '400',
              textAlign: 'center',
              padding: '1rem',
            }}
          >
            Aucun commentaire pour l'instant.
          </p>
        ) : (
          comments.map((comment) => {
            const canDelete = canDeleteComment(currentUser, comment, isProjectAdmin);
            const isAuthor = comment.authorId === currentUser?.id;


// RENDER



            return (
              <div
                key={comment.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                }}
                role="article"
                aria-label={`Commentaire de ${comment.author.name}`}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#E5E7EB',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      textAlign: 'center',
                      color: '#0F0F0F',
                      fontSize: '0.75rem',
                      fontFamily: 'Inter',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    {comment.author.name?.charAt(0) || '?'}
                  </span>
                </div>

                {/* Contenu du commentaire */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  {/* En-tête du commentaire */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        color: '#1F1F1F',
                        fontSize: '0.875rem',
                        fontFamily: 'Manrope',
                        fontWeight: '600',
                      }}
                    >
                      {comment.author.name || 'Utilisateur inconnu'}
                    </span>
                    {isAuthor && (
                      <span
                        style={{
                          color: '#6B7280',
                          fontSize: '0.75rem',
                          fontFamily: 'Inter',
                          fontWeight: '400',
                          padding: '2px 6px',
                          background: '#E5E7EB',
                          borderRadius: '4px',
                        }}
                      >
                        Auteur
                      </span>
                    )}
                    <span
                      style={{
                        color: '#9CA3AF',
                        fontSize: '0.75rem',
                        fontFamily: 'Inter',
                        fontWeight: '400',
                        marginLeft: 'auto',
                      }}
                    >
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {/* Texte du commentaire */}
                  <p
                    style={{
                      color: '#1F1F1F',
                      fontSize: '0.875rem',
                      fontFamily: 'Inter',
                      fontWeight: '400',
                      margin: 0,
                      lineHeight: '1.5',
                    }}
                  >
                    {comment.content}
                  </p>
                </div>

                {/* Bouton de suppression */}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: '0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexShrink: 0,
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                    }}
                    aria-label={`Supprimer le commentaire de ${comment.author.name}`}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusOutlineStyle, { opacity: 1 })}
                    onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none', outlineOffset: '0', opacity: 0.7 })}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, { opacity: 1 })}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, { opacity: 0.7 })}
                  >
                    <TrashIcon size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

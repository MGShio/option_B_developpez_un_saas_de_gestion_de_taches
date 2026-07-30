import { useState } from 'react';

interface AITask {
  id: number;
  title: string;
  description: string;
}

export default function AITaskListModal({ onClose }: { onClose: () => void }) {
  const [aiTasks, setAITasks] = useState<AITask[]>([
    { id: 1, title: 'Nom de la tâche', description: 'Description de la tâche' },
    { id: 2, title: 'Nom de la tâche', description: 'Description de la tâche' },
    { id: 3, title: 'Nom de la tâche', description: 'Description de la tâche' },
  ]);
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const handleDeleteTask = (id: number) => {
    setAITasks(aiTasks.filter(task => task.id !== id));
  };

  const handleAddTasks = () => {
    // Logique pour ajouter les tâches générées par IA
    console.log('Ajout des tâches IA:', aiTasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskDescription.trim()) {
      const newTask: AITask = {
        id: aiTasks.length + 1,
        title: `Tâche ${aiTasks.length + 1}`,
        description: newTaskDescription,
      };
      setAITasks([...aiTasks, newTask]);
      setNewTaskDescription('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        width: 598,
        paddingTop: 79,
        paddingBottom: 39,
        paddingLeft: 73,
        paddingRight: 73,
        position: 'relative',
        background: 'white',
        overflow: 'hidden',
        borderRadius: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 60,
        display: 'inline-flex',
      }}>
        {/* Titre */}
        <div style={{
          width: 494,
          height: 523,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 40,
          display: 'flex',
        }}>
          <div style={{
            alignSelf: 'stretch',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 8,
            display: 'inline-flex',
          }}>
            <div style={{
              color: '#1F1F1F',
              fontSize: 24,
              fontFamily: 'Manrope',
              fontWeight: 600,
              wordWrap: 'break-word',
            }}>
              Vos tâches...
            </div>
          </div>

          {/* Liste des tâches */}
          <div style={{
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 24,
            display: 'flex',
          }}>
            {aiTasks.map((task) => (
              <div
                key={task.id}
                data-property-1="Tâche IA"
                style={{
                  width: 494,
                  paddingLeft: 40,
                  paddingRight: 40,
                  paddingTop: 25,
                  paddingBottom: 25,
                  background: 'white',
                  overflow: 'hidden',
                  borderRadius: 10,
                  outline: '1px #E5E7EB solid',
                  outlineOffset: '-1px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  display: 'inline-flex',
                }}
              >
                <div style={{
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: 32,
                  display: 'inline-flex',
                }}>
                  <div style={{
                    width: 153,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 7,
                    display: 'flex',
                  }}>
                    <div style={{
                      alignSelf: 'stretch',
                      color: 'black',
                      fontSize: 18,
                      fontFamily: 'Manrope',
                      fontWeight: 600,
                      wordWrap: 'break-word',
                    }}>
                      {task.title}
                    </div>
                    <div style={{
                      color: '#6B7280',
                      fontSize: 14,
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      wordWrap: 'break-word',
                    }}>
                      {task.description}
                    </div>
                  </div>
                  <div style={{
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 15,
                    display: 'inline-flex',
                  }}>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 4,
                        display: 'flex',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280',
                        fontSize: 12,
                        fontFamily: 'Inter',
                        fontWeight: 400,
                      }}
                    >
                      Supprimer
                    </button>
                    <div style={{
                      width: 1,
                      height: 11,
                      background: '#9CA3AF',
                      transform: 'rotate(90deg)',
                    }} />
                    <button
                      style={{
                        width: 62,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 4,
                        display: 'flex',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 11,
                        height: 11,
                        background: '#6B7280',
                        borderRadius: 2,
                      }} />
                      <div style={{
                        color: '#6B7280',
                        fontSize: 12,
                        fontFamily: 'Inter',
                        fontWeight: 400,
                      }}>
                        Modifier
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton Ajouter et champ de saisie */}
        <div style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 24,
          display: 'flex',
        }}>
          <button
            onClick={handleAddTasks}
            style={{
              width: 181,
              height: 50,
              paddingLeft: 74,
              paddingRight: 74,
              paddingTop: 13,
              paddingBottom: 13,
              background: '#1F1F1F',
              overflow: 'hidden',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              display: 'inline-flex',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{
              textAlign: 'center',
              color: 'white',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 400,
              wordWrap: 'break-word',
            }}>
              + Ajouter les tâches
            </div>
          </button>
          <div style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 24,
            display: 'flex',
          }}>
            <div style={{
              width: 600,
              height: 1,
              background: '#E5E7EB',
            }} />
            <form onSubmit={handleSubmit} style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 14,
              display: 'inline-flex',
            }}>
              <div style={{
                width: 494,
                paddingLeft: 32,
                paddingRight: 32,
                paddingTop: 18,
                paddingBottom: 18,
                background: '#F9FAFB',
                overflow: 'hidden',
                borderRadius: 80,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 10,
                display: 'inline-flex',
              }}>
                <div style={{
                  alignSelf: 'stretch',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  display: 'inline-flex',
                }}>
                  <input
                    type="text"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Décrivez les tâches que vous souhaitez ajouter..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'black',
                      fontSize: 10,
                      fontFamily: 'Inter',
                      fontWeight: 400,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      width: 24,
                      height: 24,
                      position: 'relative',
                      background: '#D3590B',
                      borderRadius: 9999,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#6B7280',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

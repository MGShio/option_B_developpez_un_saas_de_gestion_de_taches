import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    password: '●●●●●●●●●●●',
  });

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de mise à jour du profil
    setIsEditing(false);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header - déjà géré par MainLayout */}
      
      <div style={{
        width: '100%',
        background: 'white',
        borderRadius: 10,
        border: '1px solid #E5E7EB',
        padding: '40px 59px',
        display: 'flex',
        flexDirection: 'column',
        gap: 41,
      }}>
        {/* En-tête */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 41,
        }}>
          <div style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 8,
          }}>
            <h1 style={{
              color: '#1F1F1F',
              fontSize: 18,
              fontFamily: 'Manrope',
              fontWeight: 600,
            }}>
              Mon compte
            </h1>
            <p style={{
              color: '#6B7280',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 400,
            }}>
              {user.name}
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            {/* Champ Nom */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
            }}>
              <label style={{
                color: 'black',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Nom
              </label>
              <div style={{
                height: 53,
                padding: '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{
                  color: '#6B7280',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}>
                  {formData.lastName}
                </span>
              </div>
            </div>

            {/* Champ Prénom */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
            }}>
              <label style={{
                color: 'black',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Prénom
              </label>
              <div style={{
                height: 53,
                padding: '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{
                  color: '#6B7280',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}>
                  {formData.firstName}
                </span>
              </div>
            </div>

            {/* Champ Email */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
            }}>
              <label style={{
                color: 'black',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Email
              </label>
              <div style={{
                height: 53,
                padding: '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{
                  color: '#6B7280',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}>
                  {formData.email}
                </span>
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
            }}>
              <label style={{
                color: 'black',
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 400,
              }}>
                Mot de passe
              </label>
              <div style={{
                height: 53,
                padding: '19px 17px',
                background: 'white',
                borderRadius: 4,
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{
                  color: '#6B7280',
                  fontSize: 12,
                  fontFamily: 'Inter',
                  fontWeight: 400,
                }}>
                  {formData.password}
                </span>
              </div>
            </div>
          </form>

          {/* Bouton Modifier */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              width: 242,
              height: 50,
              padding: '13px 74px',
              background: '#1F1F1F',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 400,
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            Modifier les informations
          </button>
        </div>
      </div>
    </div>
  );
}

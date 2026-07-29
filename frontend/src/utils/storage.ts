// Utilise sessionStorage pour le token (moins persistant que localStorage, plus sécurisé)
// Note: Pour une sécurité optimale, privilégier les cookies httpOnly (gérés par le backend)

export const storage = {
  getToken: (): string | null => sessionStorage.getItem('token'),
  setToken: (token: string): void => sessionStorage.setItem('token', token),
  removeToken: (): void => sessionStorage.removeItem('token'),
  clear: (): void => sessionStorage.clear(),
};

// Alternative: Utiliser un cookie sécurisé (si le backend gère les cookies httpOnly)
export const getTokenFromCookie = (): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

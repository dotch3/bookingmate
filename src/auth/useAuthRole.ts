import { useContext } from 'react';
import { AuthContext } from './AuthContext';

const useAuthRole = () => {
    const { user } = useContext(AuthContext);
    return user?.role || 'user'; // Retorna 'user' como padrão se não houver usuário autenticado
};

export default useAuthRole;
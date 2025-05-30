// src/components/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Card } from '../Common';
import { theme } from '../../styles/theme';
import api from '../../services/axios';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../store/modules/authReducer/actions';
import type { AuthState } from '../../store/modules/types';
import { useNavigate } from 'react-router-dom';
import ActivityIndicator from '../ActivityIndicator';

const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const LoginForm = styled(Card)`
  padding: ${theme.spacing.xl};
  width: 90%;
  max-width: 400px;
  text-align: center;

  h2 {
    margin-bottom: ${theme.spacing.lg};
    color: ${theme.colors.textPrimary};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.md};
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
  text-align: left;
`;

const Input = styled.input`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius};
  font-size: 1rem;
  background-color: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: 1.1rem;
  font-weight: 500;
  margin-top: ${theme.spacing.lg};
`;

const ErrorMessage = styled.p`
  color: ${theme.colors.error};
  font-size: 0.85rem;
  margin-top: ${theme.spacing.sm};
`;

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginClick = () => {
    if (username && password) {
        setIsLoading(true);
        const req = api.post("/token", {username, password}, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        req.then((response) => {
            dispatch(actions.LoginSuccess({ email: response.data.user.email, id: response.data.user.id, token: response.data.access_token}));
            setError(null);
            setUsername('');
            setPassword('');
            setIsLoading(false);
        }).catch(err => {
            setError(String(err));
            setIsLoading(false);
        })
    } else {
      setError('Por favor, preencha todos os campos.');
    }
  };

  useEffect(() => {
    try{
        if(user.isLoggedIn){
            navigate("/");            
        }
    }catch(err){
        console.log(err);
    }
  }, [user, navigate]);

  return (
    <LoginPageContainer>
      <LoginForm>
        <h2>Login Agenda</h2>
        <FormGroup>
          <Label htmlFor="username">Usuário</Label>
          <Input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">Senha</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <LoginButton primary onClick={handleLoginClick}>
            Entrar
          </LoginButton>
        )}
      </LoginForm>
    </LoginPageContainer>
  );
};

export default LoginPage;
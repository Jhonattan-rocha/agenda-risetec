// src/components/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Card } from '../Common';
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
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoginForm = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  width: 90%;
  max-width: 400px;
  text-align: center;

  h2 {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-align: left;
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 1.1rem;
  font-weight: 500;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.85rem;
  margin-top: ${({ theme }) => theme.spacing.sm};
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
            dispatch(actions.LoginSuccess({ email: response.data.user.email, id: response.data.user.id, token: response.data.access_token, profile: response.data.user.profile}));
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
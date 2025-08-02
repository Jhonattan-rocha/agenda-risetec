// src/components/Login/index.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../Common';
import api from '../../services/axios';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../store/modules/authReducer/actions';
import type { AuthState } from '../../store/modules/types';
import { useNavigate } from 'react-router-dom';
import ActivityIndicator from '../ActivityIndicator';

// --- NOVOS ESTILOS PARA A TELA DE LOGIN ---

const LoginLayout = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  font-family: Arial, sans-serif;
  background-color: #E2E2E2; // Cor de fundo cinza da coluna do formulário
`;

const IllustrationColumn = styled.div`
  flex: 1;
  background-color: #013A46; // Cor de fundo da coluna de ilustração
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  color: white;

  .main-illustration {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 500px;
  }

  // Media query para esconder a coluna em telas menores
  @media (max-width: 900px) {
    display: none;
  }
`;

const FormColumn = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const LoginFormContainer = styled.div`
  width: 100%;
  max-width: 380px;
  text-align: center;
`;

const Logo = styled.div`
  margin-bottom: 1.5rem;
  height: 50px;
  img {
    height: 100%;
    width: auto;
  }
`;

const Subheading = styled.p`
  color: #606770;
  margin-bottom: 2rem;
  font-size: 0.9rem;
`;

const StyledForm = styled.form`
  width: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  text-align: left;
`;

const Label = styled.label`
  font-size: 0.8rem;
  color: #606770;
  margin-bottom: 0.3rem;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #dddfe2;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #FFFFFF;
  color: #1c1e21;

  &:focus {
    outline: none;
    border-color: #005662;
    box-shadow: 0 0 0 2px rgba(0, 86, 98, 0.2);
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  padding: 0.8rem;
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 1rem;
  border-radius: 6px;
  background-color: #005662;
  border: none;
  color: white;

  &:hover {
     background-color: #003B46;
  }
`;

const ExtraOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.85rem;

  a {
    color: #005662;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606770;

  input {
    margin-right: 0.5rem;
  }
`;

const ErrorMessage = styled.p`
  color: #D93025;
  font-size: 0.85rem;
  margin-top: 1.5rem;
  background-color: #FAD2CF;
  border: 1px solid #D93025;
  padding: 0.75rem;
  border-radius: 6px;
  text-align: center;
`;

const FooterText = styled.p`
  color: #8a8d91;
  font-size: 0.7rem;
  margin-top: 4rem;
`;


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: { authreducer: AuthState }) => state.authreducer);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginClick = (e: React.FormEvent) => {
    e.preventDefault(); // Previne o recarregamento da página
    if (username && password) {
        setIsLoading(true);
        const req = api.post("/token", {username, password}, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        req.then((response) => {
            dispatch(actions.LoginSuccess({ 
              email: response.data.user.email, 
              id: response.data.user.id, 
              name: response.data.user.name, 
              token: response.data.access_token, 
              profile: response.data.user.profile
            }));
            setError(null);
            setUsername('');
            setPassword('');
            setIsLoading(false);
        }).catch(err => {
          console.log(err);
          setError("Usuário ou senha inválidos.");
          setIsLoading(false);
        })
    } else {
      setError('Por favor, preencha todos os campos.');
    }
  };

  useEffect(() => {
    if(user.isLoggedIn){
        navigate("/");            
    }
  }, [user, navigate]);

  return (
    <LoginLayout>
        <IllustrationColumn>
            <div className="main-illustration">
                <img src="/caminho/para/ilustracao.png" alt="Ilustração de nuvem e tecnologia" />
            </div>
            <img src="/caminho/para/logo-astartec.png" alt="Logo Astartec" style={{ width: '120px' }}/>
        </IllustrationColumn>

        <FormColumn>
            <LoginFormContainer>
                <Logo>
                    <img src="/caminho/para/logo-susari.png" alt="Logo Susari" />
                </Logo>
                <Subheading>Autentique-se para acessar o sistema</Subheading>

                <StyledForm onSubmit={handleLoginClick}>
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
                    
                    <ExtraOptions>
                        <a href="#">Esqueceu sua senha?</a>
                        <CheckboxWrapper>
                            <input type="checkbox" />
                            Lembrar de mim
                        </CheckboxWrapper>
                    </ExtraOptions>

                    {isLoading ? (
                        <div style={{ marginTop: '1rem' }}><ActivityIndicator /></div>
                    ) : (
                        <LoginButton primary type="submit">
                            Entrar
                        </LoginButton>
                    )}

                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </StyledForm>
                
                <FooterText>ASTARTEC Copyright © 2010-2025. Todos os direitos reservados.</FooterText>
            </LoginFormContainer>
        </FormColumn>
    </LoginLayout>
  );
};

export default LoginPage;
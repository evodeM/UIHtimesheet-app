import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { CssBaseline, Container, ThemeProvider, createTheme, Box, Typography, CircularProgress, Alert } from '@mui/material';
import TimeRegistration from './components/TimeRegistration';
import { createGoogleSheetsService } from './services/googleSheets';

interface ExtendedCredentialResponse {
  credential: string;
  clientId: string;
  select_by: string;
  access_token: string;
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

declare global {
  interface Window {
    google: any;
  }
}

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sheetsService, setSheetsService] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      setError(null);
      const sheetsService = createGoogleSheetsService(accessToken, import.meta.env.VITE_SPREADSHEET_ID);
      sheetsService.initialize()
        .then(() => {
          setSheetsService(sheetsService);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to initialize sheets service:', error);
          setError('Kunne ikke forbinde til Google Sheets. Prøv venligst igen.');
          setAccessToken(null);
          setLoading(false);
        });
    }
  }, [accessToken]);

  const handleTimeRegistration = async (data: any) => {
    if (!sheetsService) return;
    setLoading(true);
    setError(null);
    try {
      await sheetsService.saveTimeRegistration(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to save time registration:', error);
      setError('Kunne ikke gemme tidsregistrering. Prøv venligst igen.');
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      
      // Brug credential direkte som access token
      const accessToken = credentialResponse.credential;
      if (!accessToken) {
        throw new Error('No credential received');
      }
      
      setAccessToken(accessToken);
      const sheetsService = createGoogleSheetsService(accessToken, import.meta.env.VITE_SPREADSHEET_ID);
      await sheetsService.initialize();
      
      setSheetsService(sheetsService);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize sheets service:', error);
      setError('Kunne ikke få adgang til Google Sheets. Prøv venligst igen.');
      setLoading(false);
    }
  };

  const handleLoginError = () => {
    setError('Der opstod en fejl under login. Prøv venligst igen.');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default,
            backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, #ffffff 25%, #ffffff 50%, #f5f5f5 50%, #f5f5f5 75%, #ffffff 75%, #ffffff 100%)',
            backgroundSize: '56.57px 56.57px',
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ 
              minHeight: '100vh', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              py: 4
            }}>
              {loading && (
                <Box sx={{ 
                  position: 'fixed', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  zIndex: 1000,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  p: 3,
                  borderRadius: 2,
                }}>
                  <CircularProgress />
                </Box>
              )}
              
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 1,
                  }}
                >
                  {error}
                </Alert>
              )}

              {!accessToken ? (
                <Box sx={{ 
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  p: 4,
                  borderRadius: 2,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    UIH/HRS Timeseddel
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Log ind med din Google-konto for at registrere arbejdstimer
                  </Typography>
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                    useOneTap={false}
                    type="standard"
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                  />
                </Box>
              ) : (
                <TimeRegistration onSubmit={handleTimeRegistration} />
              )}
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

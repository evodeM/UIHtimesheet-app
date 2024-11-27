import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Alert,
  Paper,
  Grid,
  Container,
  useTheme,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';

interface TimeRegistrationProps {
  onSubmit: (data: any) => Promise<void>;
}

const TimeRegistration: React.FC<TimeRegistrationProps> = ({ onSubmit }) => {
  const theme = useTheme();
  const [date, setDate] = useState<string>('');
  const [month, setMonth] = useState<string>(new Date().getMonth().toString());
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [teachingType, setTeachingType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const months = [
    'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'December'
  ];

  useEffect(() => {
    onSubmit({
      updateMonth: true,
      month: months[parseInt(month)]
    });
  }, [month]);

  const calculateHours = (start: Dayjs | null, end: Dayjs | null): string => {
    if (!start || !end) return '0t 0min';
    const diffMinutes = end.diff(start, 'minute');
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}t ${minutes}min`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!date || !startTime || !endTime) {
      setError('Udfyld venligst alle påkrævede felter');
      return;
    }

    const timeSpent = calculateHours(startTime, endTime);
    if (timeSpent === '0t 0min') {
      setError('Slut tidspunkt skal være efter starttidspunkt');
      return;
    }

    try {
      await onSubmit({
        date: parseInt(date),
        month: months[parseInt(month)],
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        teachingType,
        hours: timeSpent,
        description,
      });
      setSuccess(true);

      // Reset form fields except month
      setDate('');
      setStartTime(null);
      setEndTime(null);
      setTeachingType('');
      setDescription('');
    } catch (error) {
      setError('Der opstod en fejl ved gemning af data');
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ 
            mb: 4,
            color: theme.palette.primary.main,
            fontWeight: 500,
          }}
        >
          UIH/HRS Timeseddel
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ mt: 2 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Måned</InputLabel>
                <Select
                  value={month}
                  label="Måned"
                  onChange={(e) => setMonth(e.target.value)}
                  sx={{ 
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: 'white' },
                  }}
                >
                  {months.map((monthName, index) => (
                    <MenuItem key={index} value={index.toString()}>
                      {monthName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Dag</InputLabel>
                <Select
                  value={date}
                  label="Dag"
                  onChange={(e) => setDate(e.target.value)}
                  sx={{ 
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: 'white' },
                  }}
                >
                  {days.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Start tid"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  views={['hours', 'minutes']}
                  format="HH:mm"
                  ampm={false}
                  sx={{ 
                    width: '100%',
                    backgroundColor: 'white',
                    '& .MuiInputBase-root': {
                      backgroundColor: 'white',
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Slut tid"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  views={['hours', 'minutes']}
                  format="HH:mm"
                  ampm={false}
                  sx={{ 
                    width: '100%',
                    backgroundColor: 'white',
                    '& .MuiInputBase-root': {
                      backgroundColor: 'white',
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Undervisning"
                value={teachingType}
                onChange={(e) => setTeachingType(e.target.value)}
                placeholder="F.eks. Vikar, Undervisning eller tomt"
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiInputBase-root': {
                    backgroundColor: 'white',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beskrivelse"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiInputBase-root': {
                    backgroundColor: 'white',
                  }
                }}
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert 
                  severity="error"
                  sx={{ 
                    borderRadius: 1,
                    '& .MuiAlert-icon': {
                      color: theme.palette.error.main
                    }
                  }}
                >
                  {error}
                </Alert>
              </Grid>
            )}

            {success && (
              <Grid item xs={12}>
                <Alert 
                  severity="success"
                  sx={{ 
                    borderRadius: 1,
                    '& .MuiAlert-icon': {
                      color: theme.palette.success.main
                    }
                  }}
                >
                  Tid registreret!
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  borderRadius: 1,
                }}
              >
                Registrer tid
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default TimeRegistration;

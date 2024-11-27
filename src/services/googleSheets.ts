import { TimeRegistrationData } from '../components/TimeRegistration';

declare global {
  interface Window {
    gapi: any;
  }
}

interface TimeRegistrationData {
  updateMonth?: boolean;
  month?: string;
  date?: number;
  startTime?: string;
  endTime?: string;
  teachingType?: string;
  hours?: string;
  description?: string;
}

const SHEET_START_ROW = 10;

const loadGapiClient = () => {
  return new Promise<void>((resolve, reject) => {
    const checkGapi = () => {
      if (window.gapi) {
        window.gapi.load('client', () => {
          window.gapi.client.init({
            apiKey: null,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
          }).then(() => {
            resolve();
          }).catch(reject);
        });
      } else {
        setTimeout(checkGapi, 100);
      }
    };
    checkGapi();
  });
};

export const createGoogleSheetsService = (spreadsheetId: string) => {
  let accessToken: string | null = null;

  const getWeekday = (date: number): string => {
    const currentDate = new Date();
    currentDate.setDate(date);
    const weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    return weekdays[currentDate.getDay()];
  };

  const initialize = async (token: string) => {
    try {
      accessToken = token;
      await loadGapiClient();
      window.gapi.client.setToken({ access_token: accessToken });
      
      // Opdater aktuel dato i F53
      const today = new Date();
      const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Ark1!F53',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[formattedDate]]
        }
      });

      console.log('Google Sheets service initialized with token and current date updated');

      // Test access to the spreadsheet
      const testResponse = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId
      });
      console.log('Successfully accessed spreadsheet:', testResponse);
    } catch (error) {
      console.error('Failed to initialize sheets service:', error);
      throw error;
    }
  };

  const saveTimeRegistration = async (data: TimeRegistrationData) => {
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      // Hvis det er en månedsopdatering
      if (data.updateMonth && data.month) {
        await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Ark1!B2',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[data.month]]
          }
        });
        return;
      }

      // Ellers er det en normal tidsregistrering
      if (!data.date) return;

      const weekday = getWeekday(data.date);
      const row = 9 + data.date;
      const range = `Ark1!B${row}:G${row}`;

      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            weekday,
            data.startTime,
            data.endTime,
            data.teachingType,
            data.hours,
            data.description
          ]]
        }
      });

    } catch (error) {
      console.error('Failed to save data:', error);
      throw error;
    }
  };

  return {
    initialize,
    saveTimeRegistration
  };
};

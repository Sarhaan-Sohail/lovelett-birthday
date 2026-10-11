export interface BirthdayData {
  herName: string;
  hisName: string;
  palette: 'sunset' | 'mint' | 'plum';
  cardMode: 'auto' | 'scratch' | 'flip';
  letterDate: string;
  letterParagraphs: string[];
  photos: {
    url?: string;
    caption: string;
    placeholderText: string;
  }[];
  reasons: string[];
  giftDescription: string;
  closingLine: string;
  partnerPhoneNumber?: string;
}

export const defaultBirthdayData: BirthdayData = {
  herName: 'Sara',
  hisName: 'Ali',
  palette: 'sunset',
  cardMode: 'auto',
  letterDate: 'Today',
  letterParagraphs: [
    'Today is entirely about you. From the first moment you smiled at me, you brought light and warmth into every single day.',
    'I still think about our late-night drives, the endless jokes only we understand, and how easy it is to be myself with you.',
    'This year, I wish you all the joy, peace, and adventures your heart can hold. You deserve the entire world.'
  ],
  photos: [
    {
      caption: 'The day that started it all',
      placeholderText: 'Photo: added by him, encrypted'
    },
    {
      caption: 'Our favourite trip together',
      placeholderText: 'Photo: added by him, encrypted'
    },
    {
      caption: 'Pure happiness with you',
      placeholderText: 'Photo: added by him, encrypted'
    }
  ],
  reasons: [
    'Your laugh makes everything instantly better.',
    'How you remember the smallest details about everyone.',
    'The way your hand always fits perfectly in mine.',
    'How deeply and genuinely you love.'
  ],
  giftDescription: 'A weekend getaway just for the two of us.',
  closingLine: 'Forever yours, today and always.',
  partnerPhoneNumber: ''
};

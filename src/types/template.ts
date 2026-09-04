export interface InvitationData {
  groomName: string;
  brideName: string;
  groomParents: string;
  brideParents: string;
  weddingDate: string; // ISO String or YYYY-MM-DD
  mainVenue: string;
  dressCode: string;
  akadTime: string;
  akadVenue: string;
  resepsiTime: string;
  resepsiVenue: string;
  akadMapUrl?: string;
  akadMapKeyword?: string;
  resepsiMapUrl?: string;
  resepsiMapKeyword?: string;
  accentColor: string;
  fontFamily: string;
  greeting: string;
  akadDate?: string;
  resepsiDate?: string;
  bank1Name?: string;
  bank1No?: string;
  bank1Holder?: string;
  bank2Name?: string;
  bank2No?: string;
  bank2Holder?: string;
  qrisImage?: string;
  invitationId?: string;
}

export interface TemplateProps {
  data: InvitationData;
  photo: string | null;
  timeLeft: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
}

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
  mapLink: string;
  accentColor: string;
  fontFamily: string;
  greeting: string;
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

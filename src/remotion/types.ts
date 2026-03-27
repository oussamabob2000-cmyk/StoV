export type TemplateId = 'Medical-Booking' | 'POS-Showcase' | 'Marketing-Short';

export interface BaseTemplateProps {
  templateId: TemplateId;
  title?: string;
  subtitle?: string;
  logoUrl?: string;
}

export interface MedicalBookingProps extends BaseTemplateProps {
  templateId: 'Medical-Booking';
  doctorName: string;
  specialty: string;
  appointmentTime: string;
  clinicImageUrl: string;
}

export interface POSShowcaseProps extends BaseTemplateProps {
  templateId: 'POS-Showcase';
  productName: string;
  price: number;
  features: string[];
  productImageUrl: string;
}

export interface MarketingShortProps extends BaseTemplateProps {
  templateId: 'Marketing-Short';
  campaignHeadline: string;
  callToAction: string;
  websiteUrl: string;
  promoVideoUrl?: string;
}

export type AnyTemplateProps = MedicalBookingProps | POSShowcaseProps | MarketingShortProps;

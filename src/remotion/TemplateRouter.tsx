import React from 'react';
import { AnyTemplateProps } from './types';
import { MedicalBooking } from './templates/MedicalBooking';
import { POSShowcase } from './templates/POSShowcase';
import { MarketingShort } from './templates/MarketingShort';

export const TemplateRouter: React.FC<AnyTemplateProps> = (props) => {
  switch (props.templateId) {
    case 'Medical-Booking':
      return <MedicalBooking {...props} />;
    case 'POS-Showcase':
      return <POSShowcase {...props} />;
    case 'Marketing-Short':
      return <MarketingShort {...props} />;
    default:
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f87171', color: 'white', fontSize: 40, fontFamily: 'sans-serif' }}>
          Error: Template ID not found or invalid.
        </div>
      );
  }
};

import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { MedicalBookingProps } from '../types';

export const MedicalBooking: React.FC<MedicalBookingProps> = ({
  doctorName,
  specialty,
  appointmentTime,
  clinicImageUrl,
  title = "Book Your Appointment",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  const translateY = spring({
    frame,
    fps,
    from: 50,
    to: 0,
    config: { damping: 12 },
  });

  return (
    <AbsoluteFill className="bg-slate-50 flex flex-col items-center justify-center p-12 text-center font-sans">
      <AbsoluteFill>
        {clinicImageUrl && (
          <Img 
            src={clinicImageUrl} 
            className="w-full h-full object-cover opacity-20" 
          />
        )}
      </AbsoluteFill>
      
      <div 
        className="z-10 flex flex-col items-center bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md"
        style={{ opacity, transform: `translateY(${translateY}px)` }}
      >
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-xl text-slate-500 mb-8">{specialty}</p>
        
        <div className="bg-slate-50 w-full rounded-2xl p-6 mb-8 text-left border border-slate-100">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Doctor</p>
          <p className="text-2xl font-semibold text-slate-800 mb-4">{doctorName}</p>
          
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Time</p>
          <p className="text-xl font-medium text-blue-600">{appointmentTime}</p>
        </div>
        
        <div className="w-full bg-blue-600 text-white py-4 rounded-xl text-xl font-semibold shadow-lg shadow-blue-600/30">
          Confirm Booking
        </div>
      </div>
    </AbsoluteFill>
  );
};

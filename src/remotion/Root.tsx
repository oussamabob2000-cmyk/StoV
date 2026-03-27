import React from 'react';
import { Composition, getInputProps } from 'remotion';
import { TemplateRouter } from './TemplateRouter';
import { AnyTemplateProps } from './types';
import '../index.css';

// 1. Fetch props passed via CLI or server
const inputProps = getInputProps() as unknown as AnyTemplateProps;

// 2. Default fallback if no template is provided (useful for Studio preview)
const defaultProps: AnyTemplateProps = {
  templateId: 'Marketing-Short',
  campaignHeadline: 'Boost Your Sales Today',
  callToAction: 'Shop Now',
  websiteUrl: 'www.example.com',
};

const propsToUse = inputProps.templateId ? inputProps : defaultProps;

// 3. Dynamic Dimension Logic based on templateId
const getDimensions = (id: string) => {
  switch (id) {
    case 'Medical-Booking':
      return { width: 1080, height: 1920 }; // Vertical (9:16)
    case 'POS-Showcase':
      return { width: 1920, height: 1080 }; // Horizontal (16:9)
    case 'Marketing-Short':
      return { width: 1080, height: 1920 }; // Vertical (9:16)
    default:
      return { width: 1920, height: 1080 }; // Default Horizontal
  }
};

const { width, height } = getDimensions(propsToUse.templateId);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={TemplateRouter}
        durationInFrames={300} // 10 seconds
        fps={30}
        width={width}
        height={height}
        defaultProps={propsToUse}
      />
    </>
  );
};

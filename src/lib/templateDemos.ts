import { Scene } from '../components/DynamicVideo';

export const TEMPLATE_DEMOS: Record<string, { scenes: Scene[], fontFamily: string }> = {
  ugc: {
    fontFamily: 'Inter',
    scenes: [
      { layout: 'center', title: 'I TRIED IT', subtitle: 'And here is what happened...', iconName: 'Smartphone', color: '#10b981', bgColor: '#064e3b', durationInFrames: 60 },
      { layout: 'split', title: 'HONEST REVIEW', subtitle: '100% authentic thoughts', iconName: 'Star', color: '#10b981', bgColor: '#022c22', durationInFrames: 90 },
      { layout: 'center', title: 'VERDICT', subtitle: 'You need this right now', iconName: 'CheckCircle', color: '#10b981', bgColor: '#064e3b', durationInFrames: 60 }
    ]
  },
  teaser: {
    fontFamily: 'Anton',
    scenes: [
      { layout: 'center', title: 'COMING SOON', subtitle: 'Get ready for the drop', iconName: 'Rocket', color: '#ef4444', bgColor: '#450a0a', durationInFrames: 45 },
      { layout: 'mockup', title: 'THE NEW STANDARD', subtitle: 'Sleek, fast, powerful', iconName: 'Zap', color: '#ef4444', bgColor: '#7f1d1d', durationInFrames: 60 },
      { layout: 'center', title: 'DROPS FRIDAY', subtitle: 'Link in bio', iconName: 'Flame', color: '#ef4444', bgColor: '#450a0a', durationInFrames: 45 }
    ]
  },
  educational: {
    fontFamily: 'Inter',
    scenes: [
      { layout: 'center', title: 'HOW TO START', subtitle: 'A quick 3-step guide', iconName: 'BookOpen', color: '#3b82f6', bgColor: '#1e3a8a', durationInFrames: 60 },
      { layout: 'split', title: 'STEP 1: PLAN', subtitle: 'Write down your goals', iconName: 'Edit3', color: '#3b82f6', bgColor: '#172554', durationInFrames: 90 },
      { layout: 'center', title: 'SAVE THIS', subtitle: 'For your next project', iconName: 'Bookmark', color: '#3b82f6', bgColor: '#1e3a8a', durationInFrames: 60 }
    ]
  },
  bts: {
    fontFamily: 'Inter',
    scenes: [
      { layout: 'center', title: 'BEHIND THE SCENES', subtitle: 'How we make the magic', iconName: 'Clapperboard', color: '#f59e0b', bgColor: '#78350f', durationInFrames: 60 },
      { layout: 'split', title: 'THE PROCESS', subtitle: 'Hours of hard work', iconName: 'Coffee', color: '#f59e0b', bgColor: '#451a03', durationInFrames: 90 },
      { layout: 'center', title: 'THE RESULT', subtitle: 'Worth every second', iconName: 'Sparkles', color: '#f59e0b', bgColor: '#78350f', durationInFrames: 60 }
    ]
  },
  listicle: {
    fontFamily: 'Anton',
    scenes: [
      { layout: 'center', title: 'TOP 3 TOOLS', subtitle: 'For maximum productivity', iconName: 'ListOrdered', color: '#8b5cf6', bgColor: '#4c1d95', durationInFrames: 60 },
      { layout: 'data', title: 'TOOL #1', subtitle: 'Boosts speed by 2x', iconName: 'Zap', color: '#8b5cf6', bgColor: '#2e1065', durationInFrames: 90, dataValue: 200, dataLabel: '% Faster' },
      { layout: 'center', title: 'TRY THEM NOW', subtitle: 'Links in comments', iconName: 'ArrowRight', color: '#8b5cf6', bgColor: '#4c1d95', durationInFrames: 60 }
    ]
  },
  before_after: {
    fontFamily: 'Inter',
    scenes: [
      { layout: 'split', title: 'BEFORE', subtitle: 'Struggling and slow', iconName: 'Frown', color: '#64748b', bgColor: '#0f172a', durationInFrames: 75 },
      { layout: 'split', title: 'AFTER', subtitle: 'Fast and efficient', iconName: 'Smile', color: '#10b981', bgColor: '#064e3b', durationInFrames: 75 },
      { layout: 'center', title: 'THE DIFFERENCE', subtitle: 'Is night and day', iconName: 'ArrowRightLeft', color: '#10b981', bgColor: '#022c22', durationInFrames: 60 }
    ]
  },
  vlog: {
    fontFamily: 'Inter',
    scenes: [
      { layout: 'center', title: 'A DAY WITH ME', subtitle: 'Morning routine', iconName: 'Sun', color: '#f43f5e', bgColor: '#881337', durationInFrames: 60 },
      { layout: 'split', title: 'DEEP WORK', subtitle: 'Getting things done', iconName: 'Laptop', color: '#f43f5e', bgColor: '#4c0519', durationInFrames: 90 },
      { layout: 'center', title: 'WINDING DOWN', subtitle: 'See you tomorrow', iconName: 'Moon', color: '#f43f5e', bgColor: '#881337', durationInFrames: 60 }
    ]
  },
  minimalist: {
    fontFamily: 'Inter',
    scenes: [
      { layout: 'center', title: 'BREATHE', subtitle: 'Take a moment', iconName: 'Wind', color: '#e2e8f0', bgColor: '#020617', durationInFrames: 90 },
      { layout: 'center', title: 'FOCUS', subtitle: 'On what matters', iconName: 'Eye', color: '#e2e8f0', bgColor: '#0f172a', durationInFrames: 90 },
      { layout: 'center', title: 'CREATE', subtitle: 'With intention', iconName: 'Feather', color: '#e2e8f0', bgColor: '#020617', durationInFrames: 90 }
    ]
  },
  meme: {
    fontFamily: 'Bangers',
    scenes: [
      { layout: 'center', title: 'POV:', subtitle: 'When the code finally compiles', iconName: 'Laugh', color: '#eab308', bgColor: '#713f12', durationInFrames: 60 },
      { layout: 'split', title: 'ME:', subtitle: 'Absolute genius', iconName: 'Brain', color: '#eab308', bgColor: '#422006', durationInFrames: 90 },
      { layout: 'center', title: 'ALSO ME:', subtitle: 'Forgot to save', iconName: 'Skull', color: '#eab308', bgColor: '#713f12', durationInFrames: 60 }
    ]
  },
  hype: {
    fontFamily: 'Anton',
    scenes: [
      { layout: 'center', title: 'ARE YOU READY?', subtitle: 'The biggest event of the year', iconName: 'Flame', color: '#f97316', bgColor: '#7c2d12', durationInFrames: 45 },
      { layout: 'center', title: 'DON\'T MISS OUT', subtitle: 'Tickets selling fast', iconName: 'Ticket', color: '#f97316', bgColor: '#431407', durationInFrames: 45 },
      { layout: 'center', title: 'SECURE YOUR SPOT', subtitle: 'Link below', iconName: 'Lock', color: '#f97316', bgColor: '#7c2d12', durationInFrames: 45 }
    ]
  },
  qa: {
    fontFamily: 'Inter',
    scenes: [
      { layout: 'center', title: 'Q&A TIME', subtitle: 'Answering your top questions', iconName: 'MessageCircleQuestion', color: '#06b6d4', bgColor: '#164e63', durationInFrames: 60 },
      { layout: 'split', title: 'QUESTION 1', subtitle: 'How does it work?', iconName: 'HelpCircle', color: '#06b6d4', bgColor: '#083344', durationInFrames: 90 },
      { layout: 'center', title: 'GOT MORE?', subtitle: 'Drop them in the comments', iconName: 'MessageSquare', color: '#06b6d4', bgColor: '#164e63', durationInFrames: 60 }
    ]
  },
  data: {
    fontFamily: 'Inter',
    scenes: [
      { layout: 'center', title: 'THE NUMBERS', subtitle: 'Don\'t lie', iconName: 'BarChart3', color: '#14b8a6', bgColor: '#134e4a', durationInFrames: 60 },
      { layout: 'data', title: 'GROWTH', subtitle: 'Year over year', iconName: 'TrendingUp', color: '#14b8a6', bgColor: '#042f2e', durationInFrames: 90, dataValue: 350, dataLabel: '% Increase' },
      { layout: 'center', title: 'JOIN US', subtitle: 'Be part of the success', iconName: 'Users', color: '#14b8a6', bgColor: '#134e4a', durationInFrames: 60 }
    ]
  }
};

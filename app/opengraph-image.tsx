import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Expense Tracker — Personal Finance & Budget Management';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#000000',
          color: '#ffffff',
          padding: '60px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            alignSelf: 'flex-start',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              fontWeight: 800,
              fontSize: '24px',
            }}
          >
            ₹
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Expense Tracker
            </span>
            <span style={{ fontSize: '14px', color: '#888888' }}>
              Personal Finance Management
            </span>
          </div>
        </div>

        {/* Hero Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              letterSpacing: '-2px',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            Your money. Your clarity.
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#a1a1aa',
              maxWidth: '850px',
              lineHeight: 1.4,
            }}
          >
            Track daily income, categorize expenses, enforce monthly budgets, and manage money lent with precision integer paise.
          </div>
        </div>

        {/* 4 Feature Badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {[
            'Cash Flow Clarity',
            'Period Budgets',
            'Savings Milestones',
            'Debt & Money Lent',
          ].map((pill) => (
            <div
              key={pill}
              style={{
                padding: '12px 24px',
                borderRadius: '14px',
                backgroundColor: '#111115',
                border: '1px solid #27272a',
                fontSize: '16px',
                fontWeight: 600,
                color: '#e4e4e7',
              }}
            >
              {pill}
            </div>
          ))}
        </div>

        {/* Footer Guarantee */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#71717a',
          }}
        >
          <span>Zero third-party trackers</span>
          <span>•</span>
          <span>Integer-paise mathematical integrity</span>
          <span>•</span>
          <span>Private and secure</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

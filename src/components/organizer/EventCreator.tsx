import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import type { TokenConfig, TokenType } from '../../types';
import { CustomDropdown } from '../common/CustomDropdown';
import { 
  CalendarPlus, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Utensils, 
  Gift, 
  Award, 
  Building2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

export const EventCreator: React.FC = () => {
  const { createEvent, setPersona } = useEventContext();

  const [title, setTitle] = useState('Global AI & Developer Summit 2026');
  const [category, setCategory] = useState('Technology Conference');
  const [date, setDate] = useState('2026-11-20');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('06:00 PM');
  const [venue, setVenue] = useState('Grand Tech Arena, Hall 4');
  const [capacity, setCapacity] = useState<number>(450);
  const [entryPolicy, setEntryPolicy] = useState<'single' | 'multi'>('single');
  const [allowedDepartments, setAllowedDepartments] = useState('Computer Science, Information Technology, Robotics, Data Science');
  const [organizer, setOrganizer] = useState('Department of Computer Science & Engineering');

  const [tokens, setTokens] = useState<TokenConfig[]>([
    {
      id: `TKN-FOOD-${Date.now()}`,
      name: 'Buffet Lunch & Beverage',
      type: 'food',
      icon: 'Utensils',
      maxRedemptions: 1,
      locationCounter: 'Dining Hall A (Counter 1-4)',
      description: 'Full hot lunch buffet with drink voucher',
      validWindow: '12:30 PM - 02:30 PM',
      perkValue: 25,
    },
    {
      id: `TKN-MERCH-${Date.now()}`,
      name: 'VIP Delegate Swag Bag',
      type: 'merchandise',
      icon: 'Gift',
      maxRedemptions: 1,
      locationCounter: 'Swag & Kit Station (Lobby)',
      description: 'Official hoodie, lanyard & badge',
      validWindow: '08:30 AM - 05:00 PM',
      perkValue: 35,
    },
    {
      id: `TKN-CERT-${Date.now()}`,
      name: 'Digital Credential Certificate',
      type: 'certificate',
      icon: 'Award',
      maxRedemptions: 1,
      locationCounter: 'Online Accreditation Portal',
      description: 'Verifiable HMAC cryptographic certificate',
      validWindow: 'Post Event',
      perkValue: 15,
    }
  ]);

  const handleAddToken = () => {
    const newToken: TokenConfig = {
      id: `TKN-CUSTOM-${Date.now()}`,
      name: 'Workshop / Special Session Access',
      type: 'vip',
      icon: 'Sparkles',
      maxRedemptions: 1,
      locationCounter: 'Lab 302',
      description: 'Hands-on AI workshop seat reservation',
      validWindow: '02:00 PM - 04:00 PM',
      perkValue: 20,
    };
    setTokens([...tokens, newToken]);
  };

  const handleRemoveToken = (idx: number) => {
    setTokens(tokens.filter((_, i) => i !== idx));
  };

  const handleTokenChange = (idx: number, field: keyof TokenConfig, val: string | number) => {
    const updated = [...tokens];
    updated[idx] = { ...updated[idx], [field]: val };
    setTokens(updated);
  };

  const applyPreset = (type: 'conference' | 'hackathon' | 'fest') => {
    if (type === 'conference') {
      setTitle('Future of Tech Summit 2026');
      setCategory('Technology Conference');
      setVenue('Convention Center, Main Auditorium');
      setCapacity(500);
      setEntryPolicy('single');
    } else if (type === 'hackathon') {
      setTitle('Nexus 48hr Mega Hackathon');
      setCategory('Hackathon & Competition');
      setVenue('Innovation Lab & Maker Space');
      setCapacity(300);
      setEntryPolicy('multi');
    } else {
      setTitle('Campus Annual Cultural Fest');
      setCategory('Cultural Fest');
      setVenue('Open Air Amphitheatre');
      setCapacity(800);
      setEntryPolicy('multi');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createEvent({
      title,
      category,
      date,
      startTime,
      endTime,
      venue,
      capacity,
      registrationDeadline: date,
      status: 'Open',
      entryPolicy,
      allowedDepartments: allowedDepartments.split(',').map(d => d.trim()),
      tokens,
      bannerGradient: '',
      organizer,
    });

    setPersona('STUDENT_PORTAL');
  };

  const getTokenIcon = (type: string) => {
    switch (type) {
      case 'food': return <Utensils size={13} color="var(--accent-gold-light)" />;
      case 'merchandise': return <Gift size={13} color="var(--text-secondary)" />;
      case 'certificate': return <Award size={13} color="var(--accent-emerald)" />;
      default: return <Sparkles size={13} color="#ffffff" />;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Studio Header Banner */}
      <div className="vibe-card" style={{
        padding: '18px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-xs)',
            background: '#ffffff',
            color: '#09090b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CalendarPlus size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Event Studio & Credential Setup
              </h2>
              <span className="vibe-badge badge-neutral">Draft Mode</span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Configure event parameters, admission gates, and cryptographic benefit vouchers
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginRight: '2px' }}>Templates:</span>
          <button
            type="button"
            onClick={() => applyPreset('conference')}
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
          >
            Conference
          </button>
          <button
            type="button"
            onClick={() => applyPreset('hackathon')}
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
          >
            Hackathon
          </button>
          <button
            type="button"
            onClick={() => applyPreset('fest')}
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
          >
            Cultural Fest
          </button>
        </div>
      </div>

      {/* 2-Column Professional Studio Workspace */}
      <form onSubmit={handleSubmit}>
        <div className="vibe-split-layout" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)' }}>
          {/* Left Column: Form Configuration Panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Section 1: Event Identity */}
            <div className="vibe-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <Layers size={15} color="var(--text-secondary)" />
                <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                  1. Event Identity & Scope
                </h3>
              </div>

              <div className="vibe-form-group">
                <label className="vibe-label">Official Event Title *</label>
                <input
                  type="text"
                  className="vibe-input"
                  required
                  placeholder="e.g. Global AI & Developer Summit 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="vibe-form-group">
                  <label className="vibe-label">Category</label>
                  <CustomDropdown
                    options={[
                      { value: 'Technology Conference', label: 'Technology Conference' },
                      { value: 'Hackathon & Competition', label: 'Hackathon & Competition' },
                      { value: 'Cultural Fest', label: 'Cultural Fest' },
                      { value: 'Academic Symposium', label: 'Academic Symposium' },
                    ]}
                    value={category}
                    onChange={(val) => setCategory(val)}
                    width="100%"
                  />
                </div>

                <div className="vibe-form-group">
                  <label className="vibe-label">Host Organization / Department</label>
                  <input
                    type="text"
                    className="vibe-input"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. Department of CS"
                  />
                </div>
              </div>

              <div className="vibe-form-group" style={{ marginBottom: 0 }}>
                <label className="vibe-label">Eligible Departments (Comma-separated)</label>
                <input
                  type="text"
                  className="vibe-input"
                  value={allowedDepartments}
                  onChange={(e) => setAllowedDepartments(e.target.value)}
                  placeholder="Computer Science, IT, Electronics"
                />
              </div>
            </div>

            {/* Section 2: Schedule & Access Controls */}
            <div className="vibe-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <Clock size={15} color="var(--text-secondary)" />
                <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                  2. Schedule, Venue & Admission Rules
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="vibe-form-group">
                  <label className="vibe-label">Event Date</label>
                  <input
                    type="date"
                    className="vibe-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="vibe-form-group">
                  <label className="vibe-label">Start Time</label>
                  <input
                    type="text"
                    className="vibe-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="vibe-form-group">
                  <label className="vibe-label">End Time</label>
                  <input
                    type="text"
                    className="vibe-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '12px', marginBottom: 0 }}>
                <div className="vibe-form-group">
                  <label className="vibe-label">Venue Location & Hall</label>
                  <input
                    type="text"
                    className="vibe-input"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                  />
                </div>

                <div className="vibe-form-group">
                  <label className="vibe-label">Capacity (Passes) *</label>
                  <input
                    type="number"
                    className="vibe-input"
                    min={10}
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 100)}
                  />
                </div>

                <div className="vibe-form-group">
                  <label className="vibe-label">Gate Policy</label>
                  <CustomDropdown
                    options={[
                      { value: 'single', label: 'Single Entry (Strict)' },
                      { value: 'multi', label: 'Multi-Entry (Allowed)' },
                    ]}
                    value={entryPolicy}
                    onChange={(val) => setEntryPolicy(val as 'single' | 'multi')}
                    width="100%"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Benefit & Token Vouchers */}
            <div className="vibe-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={15} color="var(--text-secondary)" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                    3. Benefit Tokens & Meal Allocations ({tokens.length})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleAddToken}
                  className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                >
                  <Plus size={12} />
                  <span>Add Voucher</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tokens.map((token, idx) => (
                  <div
                    key={token.id || idx}
                    className="vibe-card-raised"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr 1fr auto',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <label className="vibe-label" style={{ fontSize: '0.68rem' }}>Benefit Title</label>
                      <input
                        type="text"
                        className="vibe-input"
                        style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                        value={token.name}
                        onChange={(e) => handleTokenChange(idx, 'name', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="vibe-label" style={{ fontSize: '0.68rem' }}>Type</label>
                      <CustomDropdown
                        options={[
                          { value: 'food', label: 'Food / Meal Box' },
                          { value: 'merchandise', label: 'Merchandise Kit' },
                          { value: 'certificate', label: 'Certificate' },
                          { value: 'vip', label: 'VIP / Lounge' },
                        ]}
                        value={token.type}
                        onChange={(val) => handleTokenChange(idx, 'type', val as TokenType)}
                        width="100%"
                      />
                    </div>

                    <div>
                      <label className="vibe-label" style={{ fontSize: '0.68rem' }}>Dispense Station</label>
                      <input
                        type="text"
                        className="vibe-input"
                        style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                        value={token.locationCounter}
                        onChange={(e) => handleTokenChange(idx, 'locationCounter', e.target.value)}
                      />
                    </div>

                    <div style={{ paddingTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveToken(idx)}
                        className="vibe-btn vibe-btn-danger vibe-btn-sm"
                        style={{ padding: '6px', height: '32px', width: '32px' }}
                        title="Remove token"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Pass Preview & Activation Deck */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Live Pass Preview Box */}
            <div className="vibe-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Live Attendee Pass Preview
                </span>
                <span className="vibe-badge badge-emerald">
                  <ShieldCheck size={11} /> Cryptographic
                </span>
              </div>

              {/* Realistic Pass Mockup */}
              <div style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
              }}>
                <div style={{ height: '3px', width: '100%', background: '#ffffff' }} />
                
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-tertiary)' }}>{category}</span>
                    <span className="vibe-badge badge-neutral" style={{ fontSize: '0.62rem' }}>
                      {entryPolicy === 'single' ? '1x Entry' : 'Multi-Entry'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {title || 'Untitled Event'}
                  </h4>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={12} color="var(--text-tertiary)" />
                      <span>{date} • {startTime} - {endTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={12} color="var(--text-tertiary)" />
                      <span>{venue}</span>
                    </div>
                  </div>

                  {/* Included Benefits Preview */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>
                      INCLUDED CREDENTIALS ({tokens.length})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {tokens.map((t, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getTokenIcon(t.type)}
                            <span style={{ color: '#fff' }}>{t.name}</span>
                          </div>
                          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                            1x Claim
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity & Quota Forecast */}
            <div className="vibe-card">
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
                Capacity & Resource Allocation
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Max Registered Passes</span>
                  <strong style={{ color: '#fff' }}>{capacity}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Meal Vouchers</span>
                  <strong style={{ color: '#fff' }}>{tokens.filter(t => t.type === 'food').length * capacity}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Security Verification</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>HMAC SHA-256 Active</strong>
                </div>
              </div>
            </div>

            {/* Action Deck */}
            <div className="vibe-card">
              <button
                type="submit"
                className="vibe-btn vibe-btn-primary"
                style={{ width: '100%', height: '40px', fontSize: '0.86rem', marginBottom: '8px' }}
              >
                <span>Publish Event & Activate Passes</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setPersona('STUDENT_PORTAL')}
                className="vibe-btn vibe-btn-secondary"
                style={{ width: '100%', height: '34px', fontSize: '0.78rem' }}
              >
                Back to Attendee Portal
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

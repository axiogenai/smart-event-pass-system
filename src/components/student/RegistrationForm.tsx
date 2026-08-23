import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import type { StudentRegistration, EventPass } from '../../types';
import { EmailPassModal } from './EmailPassModal';
import { CustomDropdown } from '../common/CustomDropdown';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  IdCard,
  UserCheck,
  Send,
  Ticket,
  ArrowRight
} from 'lucide-react';

interface RegistrationFormProps {
  onSuccess?: (pass: EventPass) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const { currentEvent, registerStudent, passes, setCurrentPass } = useEventContext();

  const [formData, setFormData] = useState<StudentRegistration>({
    fullName: '',
    studentId: '',
    department: 'Computer Science',
    email: '',
    phone: '',
    specialRequirements: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [issuedPass, setIssuedPass] = useState<EventPass | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentEvent) {
    return <div className="vibe-card">No active event selected.</div>;
  }

  const registeredCount = passes.filter(p => p.eventId === currentEvent.id).length;
  const capacityLeft = Math.max(0, currentEvent.capacity - registeredCount);
  const isSoldOut = capacityLeft <= 0;

  const departmentOptions = currentEvent.allowedDepartments.map(d => ({
    value: d,
    label: d
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIssuedPass(null);

    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.studentId.trim()) {
      setError('Student ID is required.');
      return;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid Gmail / Email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = registerStudent(currentEvent.id, formData);
      setIsSubmitting(false);

      if (!res.success || !res.pass) {
        setError(res.error || 'Registration failed.');
      } else {
        setIssuedPass(res.pass);
        setCurrentPass(res.pass);
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 300);
  };

  const handleNavigateToPass = () => {
    if (issuedPass && onSuccess) {
      onSuccess(issuedPass);
    }
  };

  return (
    <div className="vibe-card" style={{ maxWidth: '540px', width: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Student Event Registration
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Register to receive your official QR pass & meal vouchers
          </p>
        </div>

        <span className={`vibe-badge ${isSoldOut ? 'badge-rose' : 'badge-emerald'}`}>
          {capacityLeft} spots left
        </span>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-xs)',
          padding: '10px 14px',
          marginBottom: '16px',
          color: '#fca5a5',
          fontSize: '0.8rem',
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {issuedPass && (
        <div className="vibe-fade-in" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
            <CheckCircle2 size={18} />
            <span>Registration Confirmed! Pass #{issuedPass.id}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            A tamper-proof digital pass was generated for <strong>{issuedPass.student.fullName}</strong> ({issuedPass.student.studentId}).
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleNavigateToPass}
              className="vibe-btn vibe-btn-primary vibe-btn-sm"
              style={{ flex: 1 }}
            >
              <Ticket size={13} />
              <span>View Digital Pass</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="vibe-btn vibe-btn-gmail vibe-btn-sm"
            >
              <Mail size={13} />
              <span>Send to Gmail</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="vibe-form-group">
          <label className="vibe-label">Full Name *</label>
          <input
            type="text"
            className="vibe-input"
            placeholder="e.g. Alex Rivera"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="vibe-form-group">
            <label className="vibe-label">Student ID / Roll No *</label>
            <input
              type="text"
              className="vibe-input mono"
              placeholder="e.g. STU-99214"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            />
          </div>

          <div className="vibe-form-group">
            <label className="vibe-label">Department *</label>
            <CustomDropdown
              options={departmentOptions}
              value={formData.department}
              onChange={(val) => setFormData({ ...formData, department: val })}
              width="100%"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="vibe-form-group">
            <label className="vibe-label">Gmail / University Email *</label>
            <input
              type="email"
              className="vibe-input"
              placeholder="student@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="vibe-form-group">
            <label className="vibe-label">Phone *</label>
            <input
              type="tel"
              className="vibe-input"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="vibe-form-group">
          <label className="vibe-label">Special Dietary / Meal Notes</label>
          <input
            type="text"
            className="vibe-input"
            placeholder="e.g. Vegetarian lunch, Halal, Gluten-free"
            value={formData.specialRequirements}
            onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isSoldOut}
          className="vibe-btn vibe-btn-primary"
          style={{ width: '100%', marginTop: '6px', height: '40px', fontSize: '0.88rem' }}
        >
          {isSubmitting ? 'Registering & Generating HMAC Pass...' : isSoldOut ? 'Event Sold Out' : 'Register & Issue Pass'}
        </button>
      </form>

      {/* Gmail Modal */}
      {showEmailModal && issuedPass && (
        <EmailPassModal
          pass={issuedPass}
          event={currentEvent}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};

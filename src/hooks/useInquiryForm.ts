import { useCallback, useState } from 'react';
import { api } from '../api/client';
import { extractErrorMessage } from './useErrorMessage';

export interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  intent: string;
  preferredMarket: string;
  message: string;
}

const INITIAL: InquiryFormData = {
  name: '',
  email: '',
  phone: '',
  intent: 'Acquire Turnkey Lease Deal',
  preferredMarket: 'Pensacola, FL',
  message: '',
};

export function useInquiryForm() {
  const [form, setForm] = useState<InquiryFormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = useCallback(<K extends keyof InquiryFormData>(key: K, value: InquiryFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.submitLead({
        name: form.name,
        email: form.email,
        phone_number: form.phone,
        message: `[${form.intent} | ${form.preferredMarket}] ${form.message}`,
        property_reference: null,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to submit your inquiry. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const reset = useCallback(() => {
    setForm(INITIAL);
    setSubmitted(false);
    setError('');
  }, []);

  return { form, updateField, submitted, submitting, error, submit, reset };
}

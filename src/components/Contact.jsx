import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/contact.css';

const planCatalog = {
  starter: { key: 'starter', title: 'Starter Website – Small Business', price: 1500 },
  business: { key: 'business', title: 'Business Growth Website – Professional', price: 3000 },
  premium: { key: 'premium', title: 'Premium Website + E‑commerce', price: 5000, priceSuffix: '+' },
};

const currency = (n) => `$${n.toLocaleString()}`;

function Contact() {
  const {
    register, handleSubmit, control, reset, setValue, getValues, watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      planKey: '',
      name: '',
      email: '',
      phone: '',
      company: '',
      website: '',
      city: '',
      region: '',
      projectType: '',
      budget: '',
      timeline: '',
      date: null,
      message: '',
      selectedPlan: '',
      estimatedTotal: ''
    }
  });

  const planKey = watch('planKey');
  const plan = planKey ? planCatalog[planKey] : null;
  const wasAutoFilledRef = useRef(false);
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    const getParams = () => {
      if (window.location.search) return new URLSearchParams(window.location.search.slice(1));
      const hash = window.location.hash || '';
      const idx = hash.indexOf('?');
      return new URLSearchParams(idx !== -1 ? hash.slice(idx + 1) : '');
    };
    const applyFromLocation = () => {
      const params = getParams();
      const fromKey = params.get('planKey');
      const fromTitle = params.get('plan');
      let key = fromKey;
      if (!key && fromTitle) key = Object.keys(planCatalog).find(k => planCatalog[k].title === fromTitle) || '';
      if (key && planCatalog[key]) {
        setValue('planKey', key, { shouldValidate: true, shouldDirty: true });
        setSelection({ plan: planCatalog[key].title });
      }
    };
    applyFromLocation();
    const onHash = () => applyFromLocation();
    const onPop = () => applyFromLocation();
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onPop);
    };
  }, [setValue]);

  useEffect(() => {
    const current = getValues('message') || '';
    if (!plan) {
      if (wasAutoFilledRef.current) {
        setValue('message', '');
        wasAutoFilledRef.current = false;
      }
      return;
    }
    const autoMsg = `I'm interested in the ${plan.title} (${currency(plan.price)}${plan.priceSuffix || ''}) package. Please share next steps.`;
    if (!current || wasAutoFilledRef.current) {
      setValue('message', autoMsg);
      wasAutoFilledRef.current = true;
    }
  }, [plan, getValues, setValue]);

  useEffect(() => {
    if (!plan) {
      setValue('selectedPlan', '');
      setValue('estimatedTotal', '');
      return;
    }
    setValue('selectedPlan', plan.title);
    setValue('estimatedTotal', currency(plan.price));
  }, [plan, setValue]);

  const onSubmit = async (values) => {
    const payload = {
      planKey: values.planKey || '',
      planTitle: plan?.title || '',
      estimatedTotal: plan ? currency(plan.price) : '',
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      company: values.company.trim(),
      website: values.website.trim(),
      city: values.city.trim(),
      region: values.region.trim(),
      timeline: values.timeline || '',
      preferredDate: values.date ? values.date.toISOString().slice(0, 10) : '',
      message: values.message.trim(),
    };

    try {
      const res = await fetch('/.netlify/functions/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to send message');

      toast.success('Thanks! Your inquiry has been sent.');
      reset({
        planKey: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        website: '',
        city: '',
        region: '',
        projectType: '',
        budget: '',
        timeline: '',
        date: null,
        message: '',
        selectedPlan: '',
        estimatedTotal: ''
      });
      setSelection(null);
    } catch (e) {
      toast.error(e.message || 'Unable to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className="contact-section">
      <Container>
        <h2 className="mb-4">Contact</h2>
        <Row className="g-4">
          <Col md={5}>
            <div className="contact-info">
              <h3>Let’s talk about your project</h3>
              <p>I build fast, mobile‑first sites and apps. Share a few details and I’ll reply within 24 hours.</p>
              <p className="info-line">
                <FaPhoneAlt className="contact-icon" aria-hidden />
                <strong>Phone:</strong>&nbsp; 302-747-4936
              </p>
              <p className="info-line">
                <FaEnvelope className="contact-icon" aria-hidden />
                <strong>Email:</strong>
                <span className="contact-email">
                  <a href="mailto:adrianreynolds@ysbacademy.online">
                    adrianreynolds@ysbacademy.online
                  </a>
                </span>
              </p>
            </div>
          </Col>

          <Col md={7}>
            <div className="contact-card">
              {selection?.plan && (
                <div className="mb-3 p-2 border rounded bg-light">
                  <div className="fw-semibold">Selected plan</div>
                  <div className="small text-muted">{selection.plan}</div>
                </div>
              )}

              <Form noValidate autoComplete="on" onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('selectedPlan')} />
                <input type="hidden" {...register('estimatedTotal')} />

                <Row className="g-3">
                  <Col sm={12}>
                    <Form.Group controlId="contactPlan">
                      <Form.Label>Select a plan (optional)</Form.Label>
                      <Form.Select aria-label="Select a plan" {...register('planKey')}>
                        <option value="">Choose a plan…</option>
                        {Object.values(planCatalog).map(p => (
                          <option key={p.key} value={p.key}>
                            {p.title} — {currency(p.price)}{p.priceSuffix || ''}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">You can skip this and just send a message.</Form.Text>
                    </Form.Group>
                  </Col>

                  <Col sm={12}>
                    <Form.Group controlId="contactName">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Jane Doe"
                        autoComplete="name"
                        isInvalid={!!errors.name}
                        {...register('name', { required: 'Name is required' })}
                      />
                      <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="contactEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="jane@example.com"
                        autoComplete="email"
                        isInvalid={!!errors.email}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
                        })}
                      />
                      <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="contactPhone">
                      <Form.Label>Phone (optional)</Form.Label>
                      <Form.Control type="tel" placeholder="(555) 555-1234" inputMode="tel" autoComplete="tel" {...register('phone')} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="contactCompany">
                      <Form.Label>Company/Business</Form.Label>
                      <Form.Control type="text" placeholder="Your company" autoComplete="organization" {...register('company')} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="contactWebsite">
                      <Form.Label>Website (optional)</Form.Label>
                      <Form.Control type="url" placeholder="https://example.com" autoComplete="url" {...register('website')} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="contactCity">
                      <Form.Label>City (optional)</Form.Label>
                      <Form.Control type="text" placeholder="City" autoComplete="address-level2" {...register('city')} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="contactRegion">
                      <Form.Label>State/Region (optional)</Form.Label>
                      <Form.Control type="text" placeholder="State or region" autoComplete="address-level1" {...register('region')} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="contactTimeline">
                      <Form.Label>Timeline</Form.Label>
                      <Form.Select autoComplete="off" {...register('timeline')}>
                        <option value="">Flexible</option>
                        <option>ASAP (0–2 weeks)</option>
                        <option>2–4 weeks</option>
                        <option>1–2 months</option>
                        <option>2+ months</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="contactDate">
                      <Form.Label>Preferred date (optional)</Form.Label>
                      <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            id="contactDate"
                            className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                            placeholderText="Select a date"
                            selected={field.value}
                            onChange={(d) => field.onChange(d)}
                            minDate={new Date()}
                            dateFormat="MMM d, yyyy"
                            isClearable
                          />
                        )}
                      />
                      <div className="field-hint">Pick a day that works for a quick intro call.</div>
                    </Form.Group>
                  </Col>

                  <Col sm={12}>
                    <Form.Group controlId="contactMessage">
                      <Form.Label>How can I help?</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Briefly describe your goals, timeline, and any must‑haves."
                        autoComplete="off"
                        isInvalid={!!errors.message}
                        {...register('message', { required: 'Message is required' })}
                      />
                      <Form.Control.Feedback type="invalid">{errors.message?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col sm={12}>
                    <div className="d-grid">
                      <Button className="submit-btn" variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending…' : 'Send inquiry'}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Contact;
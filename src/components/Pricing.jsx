import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { FaCheck, FaRocket, FaGem } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/prices.css';

const plans = [
	{
		key: 'starter',
		title: 'Starter Website – Small Business',
		price: 1500,
		subtitle: '1–3 page, mobile‑friendly site to establish your presence.',
		icon: <FaRocket />,
		includes: [
			'Custom branding integration',
			'Mobile‑responsive design',
			'Contact form with lead capture',
			'Basic on‑page SEO',
			'Google Analytics setup',
			'1 round of revisions',
		],
		addons: [
			{ key: 'social', label: 'Social media integration', price: 150, type: 'one-time' },
			{ key: 'lead-magnet', label: 'Lead magnet setup', price: 200, type: 'one-time' },
			{ key: 'chat', label: 'Chatbot or live chat', price: 250, type: 'one-time' },
			{ key: 'landing', label: 'Landing page', price: 300, type: 'one-time' },
			{ key: 'maintenance', label: 'Basic maintenance', price: 100, type: 'monthly' },
		],
	},
	{
		key: 'business',
		title: 'Business Growth Website – Professional',
		price: 3000,
		subtitle: '5–7 page React site focused on marketing and conversions.',
		featured: true,
		badge: 'Most Popular',
		icon: <FaGem />,
		includes: [
			'Advanced mobile responsiveness',
			'Branding with style guide',
			'SEO optimization',
			'Social media integration',
			'Analytics & conversion tracking',
			'Lead capture forms',
			'Landing page setup',
			'2 rounds of revisions',
		],
		addons: [
			{ key: 'chat', label: 'Chatbot or live chat', price: 250, type: 'one-time' },
			{ key: 'blog', label: 'Blog/content setup', price: 300, type: 'one-time' },
			{ key: 'reports', label: 'Conversion tracking reports', price: 200, type: 'one-time' },
			{ key: 'ads-setup', label: 'Ad setup (Google/Meta)', price: 400, type: 'one-time' },
			{ key: 'monthly-opt', label: 'Monthly optimization', price: 200, type: 'monthly' },
		],
	},
	{
		key: 'premium',
		title: 'Premium Website + E‑commerce',
		price: 5000,
		priceSuffix: '+',
		subtitle: 'Full e‑commerce build to maximize sales and growth.',
		icon: <FaGem />,
		includes: [
			'10+ pages with advanced UX/UI',
			'Online store setup (Shopify/Stripe/Woo)',
			'Product catalog (up to 50 products)',
			'Secure payments & SSL',
			'Advanced SEO & keyword strategy',
			'Social + Pixel integration',
			'Conversion tracking dashboard',
			'Email automation',
			'Upsell & cross‑sell funnels',
			'3 rounds of revisions',
			'1 month post‑launch support',
		],
		addons: [
			{ key: 'membership', label: 'Membership setup', price: 500, type: 'one-time' },
			{ key: 'multi-currency', label: 'Multi‑currency store', price: 350, type: 'one-time' },
			{ key: 'ad-mgmt', label: 'Ad management', price: 500, type: 'monthly' },
			{ key: 'maintenance', label: 'Maintenance plan', price: 300, type: 'monthly' },
		],
	},
];

const currency = (n) => `$${n.toLocaleString()}`;

function PlanCard({ plan }) {
	const [checked, setChecked] = useState(() => new Set());

	const totals = useMemo(() => {
		let oneTime = 0;
		let monthly = 0;
		plan.addons.forEach((a) => {
			if (checked.has(a.key)) {
				if (a.type === 'monthly') monthly += a.price;
				else oneTime += a.price;
			}
		});
		const grand = plan.price + oneTime; // one‑time only
		const firstMonth = grand + monthly; // includes monthly for an all‑in first month estimate
		return {
			base: plan.price,
			oneTime,
			monthly,
			grand,
			firstMonth,
		};
	}, [checked, plan]);

	const toggle = (key) => {
		setChecked((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
	};

	const selectedLabels = useMemo(
		() => plan.addons.filter((a) => checked.has(a.key)).map((a) => a.label),
		[checked, plan]
	);

	return (
		<Card className={`pricing-card h-100 ${plan.featured ? 'featured' : ''}`}>
			{plan.featured && (
				<Badge bg="primary" className="plan-badge">
					{plan.badge || 'Featured'}
				</Badge>
			)}

			<Card.Body className="d-flex flex-column">
				<div className="plan-icon">{plan.icon}</div>
				<Card.Title className="plan-title">{plan.title}</Card.Title>
				<p className="plan-subtitle">{plan.subtitle}</p>

				<div className="plan-price">
					<span className="currency">$</span>
					<span className="amount">
						{plan.price.toLocaleString()}
						{plan.priceSuffix || ''}
					</span>
				</div>

				<ul className="feature-list">
					{plan.includes.map((item, i) => (
						<li key={i}>
							<FaCheck className="check" aria-hidden />
							<span>{item}</span>
						</li>
					))}
				</ul>

				<div className="addons-group">
					<div className="addons-title">
						Optional add‑ons{' '}
						<span className="text-muted">(monthly billed separately where marked)</span>
					</div>
					<div className="addon-list form-group">
						{plan.addons.map((a) => (
							<Form.Check
								key={a.key}
								id={`${plan.key}-${a.key}`}
								type="checkbox"
								className="addon-item"
								label={
									<span className="addon-label">
										{a.label}
										<span className="addon-price">
											{a.type === 'monthly' ? `${currency(a.price)}/mo` : currency(a.price)}
										</span>
									</span>
								}
								checked={checked.has(a.key)}
								onChange={() => toggle(a.key)}
							/>
						))}
					</div>
				</div>

				{selectedLabels.length > 0 && (
					<div className="selected-chips">
						{selectedLabels.map((txt) => (
							<span className="chip" key={txt}>
								{txt}
							</span>
						))}
					</div>
				)}

				<div className="totals mt-2">
					<div className="row-line">
						<span>Base</span>
						<span>
							{currency(totals.base)}
							{plan.priceSuffix || ''}
						</span>
					</div>
					<div className="row-line">
						<span>Add‑ons (one‑time)</span>
						<span>{currency(totals.oneTime)}</span>
					</div>
					{totals.monthly > 0 && (
						<div className="row-line monthly">
							<span>Monthly add‑ons</span>
							<span>{currency(totals.monthly)}/mo</span>
						</div>
					)}
					<div className="row-line grand">
						<span>Total today (one‑time)</span>
						<span>{currency(totals.grand)}</span>
					</div>
					<div className="row-line grand">
						<span>Estimated first month (incl. monthly)</span>
						<span>{currency(totals.firstMonth)}</span>
					</div>
					{totals.monthly > 0 && (
						<div className="small text-muted mt-1">
							Monthly add‑ons are billed separately.
						</div>
					)}
				</div>

				<div className="mt-auto">
					<Button
						as={Link}
						variant={plan.featured ? 'primary' : 'outline-primary'}
						className="w-100 mt-3"
						to={`/checkout?plan=${encodeURIComponent(plan.title)}&planKey=${encodeURIComponent(plan.key)}&base=${encodeURIComponent(plan.price)}&oneTime=${encodeURIComponent(totals.oneTime)}&total=${encodeURIComponent(totals.grand)}&monthly=${encodeURIComponent(totals.monthly)}&addons=${encodeURIComponent(
							[...checked]
								.map((k) => plan.addons.find((a) => a.key === k)?.label)
								.filter(Boolean)
								.join('|')
						)}`}
					>
						Choose plan
					</Button>
				</div>
			</Card.Body>
		</Card>
	);
}

export default function Pricing() {
	return (
		<section id="pricing" className="pricing-section">
			<Container>
				<header className="pricing-header">
					<h2>Transparent, conversion‑focused pricing</h2>
					<p className="lead">
						Pick a plan that fits your goals. Add optional services as you grow.
					</p>
				</header>

				<Row className="g-4">
					{plans.map((p) => (
						<Col xs={12} md={6} lg={4} key={p.key}>
							<PlanCard plan={p} />
						</Col>
					))}
				</Row>

				<p className="pricing-note">
					Need something custom? I’ll tailor a proposal to your scope, timeline, and
					budget.
				</p>
			</Container>
		</section>
	);
}
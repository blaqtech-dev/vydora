
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  AudioLines,
  ShieldCheck,
  Zap,
  Cloud,
  Headphones,
  Sparkles,
  LoaderCircle,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import './pricing.css';

const plans = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    description: 'Everything you need to get started with audio conversion.',
    features: [
      '3 conversions per day',
      'Maximum input size of 100 MB',
      'MP3 output',
      '500 MB cloud storage target',
      'Play, download, rename and delete audio',
    ],
    buttonText: 'Get started for free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₦1,500',
    period: 'per month',
    description: 'More room to convert, save and manage your audio.',
    features: [
      '30 conversions per day',
      'Maximum input size of 250 MB',
      'Supported audio formats',
      '5 GB cloud storage target',
      'All available audio management features',
      'Access to future premium features',
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
];

function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProCheckout = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      // Check whether the user has an authenticated session.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        navigate('/login', {
          state: { from: '/pricing' },
        });
        return;
      }

      // Call the deployed Supabase Edge Function.
      const { data, error: checkoutError } =
        await supabase.functions.invoke(
          'create-paystack-subscription',
          {
            method: 'POST',
            body: {},
          },
        );

      if (checkoutError) {
        throw checkoutError;
      }

      if (!data?.authorization_url) {
        throw new Error(
          data?.error || 'Unable to start checkout. Please try again.',
        );
      }

      // Redirect to Paystack's hosted checkout.
      window.location.assign(data.authorization_url);
    } catch (err) {
      console.error('Pro checkout error:', err);

      setError(
        err?.message ||
          'Unable to start payment. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pricing-page">
      <div className="pricing-container">
        <header className="pricing-header">
          <div className="pricing-eyebrow">
            <Sparkles size={15} />
            SIMPLE, TRANSPARENT PRICING
          </div>

          <h1>
            The right plan for your
            <span> audio workflow.</span>
          </h1>

          <p>
            Start for free. Upgrade when you need more room to convert
            and manage your audio.
          </p>
        </header>

        {error && (
          <div className="pricing-error" role="alert">
            {error}
          </div>
        )}

        <div className="pricing-plans">
          {plans.map((plan) => (
            <article
              className={`pricing-card ${
                plan.popular ? 'pricing-card-popular' : ''
              }`}
              key={plan.name}
            >
              {plan.popular && (
                <div className="pricing-popular-label">
                  <Sparkles size={14} />
                  MOST VALUE
                </div>
              )}

              <div className="pricing-plan-icon">
                {plan.popular ? (
                  <Zap size={22} />
                ) : (
                  <AudioLines size={22} />
                )}
              </div>

              <h2>{plan.name}</h2>

              <p className="pricing-description">
                {plan.description}
              </p>

              <div className="pricing-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>

              <div className="pricing-divider" />

              <p className="pricing-includes">What's included</p>

              <ul className="pricing-feature-list">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span className="pricing-check">
                      <Check size={15} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.popular ? (
                <button
                  type="button"
                  className="pricing-button pricing-button-primary"
                  onClick={handleProCheckout}
                  disabled={loading}
                  aria-label="Upgrade to Vydora Pro"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={17} />
                      Starting checkout...
                    </>
                  ) : (
                    <>
                      {plan.buttonText}
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="/signup"
                  className="pricing-button pricing-button-secondary"
                >
                  {plan.buttonText}
                  <ArrowRight size={17} />
                </Link>
              )}

              {plan.popular && (
                <p className="pricing-checkout-note">
                  Secure checkout powered by Paystack.
                  Pro access is activated after payment verification.
                </p>
              )}
            </article>
          ))}
        </div>

        <div className="pricing-benefits">
          <div>
            <ShieldCheck size={20} />
            <span>Secure account access</span>
          </div>

          <div>
            <Cloud size={20} />
            <span>Your audio in cloud storage</span>
          </div>

          <div>
            <Headphones size={20} />
            <span>Simple audio management</span>
          </div>
        </div>

        <div className="pricing-bottom-note">
          <h2>Have questions about Vydora?</h2>
          <p>
            You can start with the free plan and explore Vydora before
            deciding whether Pro is right for you.
          </p>
          <Link to="/signup">
            Create your free account <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
